import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useOrganizations() {
  const { user, loading: authLoading } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [currentOrg, setCurrentOrg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const fetchingRef = useRef(false)

  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([])
      setCurrentOrg(null)
      setInitialized(true)
      setLoading(false)
      return
    }

    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      setLoading(true)
      
      const { data, error: fetchError } = await supabase
        .from('user_organizations')
        .select(`
          id,
          role,
          seniority,
          started_at,
          ended_at,
          is_current,
          team_role,
          organizations (
            id,
            name,
            website,
            user_context,
            ai_context,
            combined_context
          )
        `)
        .eq('user_id', user.id)
        .order('is_current', { ascending: false })

      if (fetchError) throw fetchError

      const transformed = (data || [])
        .filter(uo => uo.organizations)
        .map(uo => ({
          userOrgId: uo.id,
          orgId: uo.organizations.id,
          name: uo.organizations.name,
          website: uo.organizations.website,
          userContext: uo.organizations.user_context,
          aiContext: uo.organizations.ai_context,
          combinedContext: uo.organizations.combined_context,
          role: uo.role,
          seniority: uo.seniority,
              teamRole: uo.team_role,
          startedAt: uo.started_at,
          endedAt: uo.ended_at,
          isCurrent: uo.is_current
        }))

      setOrganizations(transformed)
      
      const current = transformed.find(o => o.isCurrent) || transformed[0] || null
      setCurrentOrg(current)
      
      setError(null)
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setInitialized(true)
      fetchingRef.current = false
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      fetchingRef.current = false
      fetchOrganizations()
    }
  }, [user, authLoading, fetchOrganizations])

  const createOrganization = async (orgData, userOrgData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      // 1. Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          website: orgData.website,
          user_context: orgData.userContext,
          ai_context: orgData.aiContext,
          combined_context: orgData.combinedContext
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Mark other orgs as not current
      if (userOrgData.isCurrent !== false) {
        await supabase
          .from('user_organizations')
          .update({ is_current: false })
          .eq('user_id', user.id)
          .eq('is_current', true)
      }

      // 3. Create user_organization link FIRST (so RLS policies work for goals)
      const { data: userOrg, error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          org_id: org.id,
          role: userOrgData.role,
          seniority: userOrgData.seniority,
          started_at: userOrgData.startedAt,
          is_current: userOrgData.isCurrent !== false,
          team_role: 'admin' 
        })
        .select()
        .single()

      if (userOrgError) throw userOrgError

      // 4. Create company goals (NOW policy check will pass)
      let companyGoalIds = []
      if (orgData.companyGoals && orgData.companyGoals.length > 0) {
        const { data: goals, error: goalsError } = await supabase
          .from('company_goals')
          .insert(
            orgData.companyGoals.map((g, index) => ({
              org_id: org.id,
              time_period: g.timePeriod,
              year: g.year,
              title: g.title,
              description: g.description || null,
              kpis: g.kpis || [],
              priority: index + 1
            }))
          )
          .select()

        if (goalsError) throw goalsError
        companyGoalIds = goals.map(g => g.id)
      }

 

      fetchingRef.current = false
      await fetchOrganizations()

      return { data: { org, userOrg }, error: null }
    } catch (err) {
      console.error('Error creating organization:', err)
      return { data: null, error: err }
    }
  }

  const updateOrganization = async (orgId, updates) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const dbUpdates = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.website !== undefined) dbUpdates.website = updates.website
      dbUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('organizations')
        .update(dbUpdates)
        .eq('id', orgId)
        .select()
        .single()

      if (error) throw error

      fetchingRef.current = false
      await fetchOrganizations()

      return { data, error: null }
    } catch (err) {
      console.error('Error updating organization:', err)
      return { data: null, error: err }
    }
  }

  const switchCurrentOrg = async (orgId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      await supabase
        .from('user_organizations')
        .update({ is_current: false })
        .eq('user_id', user.id)

      const { error } = await supabase
        .from('user_organizations')
        .update({ is_current: true })
        .eq('user_id', user.id)
        .eq('org_id', orgId)

      if (error) throw error

      fetchingRef.current = false
      await fetchOrganizations()

      return { error: null }
    } catch (err) {
      console.error('Error switching organization:', err)
      return { error: err }
    }
  }

  const leaveOrganization = async (orgId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { error } = await supabase
        .from('user_organizations')
        .update({ 
          is_current: false,
          ended_at: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', user.id)
        .eq('org_id', orgId)

      if (error) throw error

      fetchingRef.current = false
      await fetchOrganizations()

      return { error: null }
    } catch (err) {
      console.error('Error leaving organization:', err)
      return { error: err }
    }
  }

  return {
    organizations,
    currentOrg,
    loading,
    initialized,
    error,
    createOrganization,
    updateOrganization,
    switchCurrentOrg,
    leaveOrganization,
    refreshOrganizations: fetchOrganizations,
    hasOrganizations: organizations.length > 0,
      isAdmin: currentOrg?.teamRole === 'admin',
  canInviteUsers: currentOrg?.teamRole === 'admin'
  }
}
