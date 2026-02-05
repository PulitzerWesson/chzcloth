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

  // Fetch all organizations for the current user
  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([])
      setCurrentOrg(null)
      setInitialized(true)
      return
    }

    // Prevent duplicate fetches
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
          organizations (
            id,
            name,
            website,
            stage,
            team_size,
            industry,
            current_mode
          )
        `)
        .eq('user_id', user.id)
        .order('is_current', { ascending: false })

      if (fetchError) throw fetchError

      const transformed = (data || [])
        .filter(uo => uo.organizations) // skip if org join failed
        .map(uo => ({
          userOrgId: uo.id,
          orgId: uo.organizations.id,
          name: uo.organizations.name,
          website: uo.organizations.website,
          stage: uo.organizations.stage,
          teamSize: uo.organizations.team_size,
          industry: uo.organizations.industry,
          currentMode: uo.organizations.current_mode,
          role: uo.role,
          seniority: uo.seniority,
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

  // Only fetch when user changes and auth is done loading
  useEffect(() => {
    if (!authLoading) {
      fetchOrganizations()
    }
  }, [user, authLoading])

  // Create a new organization and link to user
  const createOrganization = async (orgData, userOrgData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      // Create the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          website: orgData.website,
          stage: orgData.stage,
          team_size: orgData.teamSize,
          industry: orgData.industry,
          current_mode: orgData.currentMode
        })
        .select()
        .single()

      if (orgError) throw orgError

      // If this will be current, unset other current orgs
      if (userOrgData.isCurrent !== false) {
        await supabase
          .from('user_organizations')
          .update({ is_current: false })
          .eq('user_id', user.id)
          .eq('is_current', true)
      }

      // Link user to organization
      const { data: userOrg, error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          org_id: org.id,
          role: userOrgData.role,
          seniority: userOrgData.seniority,
          started_at: userOrgData.startedAt,
          is_current: userOrgData.isCurrent !== false
        })
        .select()
        .single()

      if (userOrgError) throw userOrgError

      // Refresh orgs
      await fetchOrganizations()

      return { data: { org, userOrg }, error: null }
    } catch (err) {
      console.error('Error creating organization:', err)
      return { data: null, error: err }
    }
  }

  // Update organization details
  const updateOrganization = async (orgId, updates) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const dbUpdates = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.website !== undefined) dbUpdates.website = updates.website
      if (updates.stage !== undefined) dbUpdates.stage = updates.stage
      if (updates.teamSize !== undefined) dbUpdates.team_size = updates.teamSize
      if (updates.industry !== undefined) dbUpdates.industry = updates.industry
      if (updates.currentMode !== undefined) dbUpdates.current_mode = updates.currentMode
      dbUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('organizations')
        .update(dbUpdates)
        .eq('id', orgId)
        .select()
        .single()

      if (error) throw error

      await fetchOrganizations()

      return { data, error: null }
    } catch (err) {
      console.error('Error updating organization:', err)
      return { data: null, error: err }
    }
  }

  // Update company mode specifically
  const updateCompanyMode = async (orgId, mode) => {
    return updateOrganization(orgId, { currentMode: mode })
  }

  // Switch current organization
  const switchCurrentOrg = async (orgId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      // Unset all current flags
      await supabase
        .from('user_organizations')
        .update({ is_current: false })
        .eq('user_id', user.id)

      // Set new current
      const { error } = await supabase
        .from('user_organizations')
        .update({ is_current: true })
        .eq('user_id', user.id)
        .eq('org_id', orgId)

      if (error) throw error

      await fetchOrganizations()

      return { error: null }
    } catch (err) {
      console.error('Error switching organization:', err)
      return { error: err }
    }
  }

  // Mark an org as left
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

      await fetchOrganizations()

      return { error: null }
    } catch (err) {
      console.error('Error leaving organization:', err)
      return { error: err }
    }
  }

  // Get context check for a bet
  const getContextCheck = (betDomain) => {
    if (!currentOrg?.currentMode || currentOrg.currentMode === 'unsure') {
      return null
    }

    const mode = currentOrg.currentMode
    
    if (betDomain === 'growth' && mode === 'efficiency') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're making a growth bet while your company is focused on efficiency. Consider: Can you frame this as \"efficient growth\"? Is the cost low enough to de-risk?"
      }
    }

    if (['operations', 'platform'].includes(betDomain) && mode === 'growth') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're making an efficiency/ops bet while your company is in growth mode. Consider: Does this unblock growth? Can it wait?"
      }
    }

    if (['operations', 'platform', 'monetization'].includes(betDomain) && mode === 'pmf') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're making an optimization bet while still finding product-market fit. Consider: Will this help you learn faster?"
      }
    }

    if (betDomain === 'retention' && mode === 'pmf') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're focused on retention while still finding product-market fit. Consider: Is the product fundamentally working for some users?"
      }
    }

    return null
  }

  return {
    organizations,
    currentOrg,
    loading: loading || (!initialized && !authLoading),
    error,
    createOrganization,
    updateOrganization,
    updateCompanyMode,
    switchCurrentOrg,
    leaveOrganization,
    getContextCheck,
    refreshOrganizations: fetchOrganizations,
    hasOrganizations: organizations.length > 0
  }
}
