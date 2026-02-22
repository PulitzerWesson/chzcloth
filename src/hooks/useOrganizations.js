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
  organizations (
    id,
    name,
    website,
    stage,
    team_size,
    current_mode,
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
          stage: uo.organizations.stage,
          teamSize: uo.organizations.team_size,
          industry: uo.organizations.industry,
          currentMode: uo.organizations.current_mode,
          userContext: uo.organizations.user_context,
          aiContext: uo.organizations.ai_context,
          combinedContext: uo.organizations.combined_context,
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
      // IMPORTANT: Still set initialized on error so the app can route.
      // Empty orgs + error = redirect to orgsetup (acceptable fallback).
    } finally {
      setLoading(false)
      setInitialized(true)
      fetchingRef.current = false
    }
  }, [user])

  // Fetch when user changes and auth is done loading.
  // Reset fetchingRef so legitimate refetches aren't blocked.
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

    // 3. Create company goals (if provided)
    let companyGoalIds = []
    if (orgData.companyGoals && orgData.companyGoals.length > 0) {
      const { data: goals, error: goalsError } = await supabase
        .from('company_goals')
        .insert(
          orgData.companyGoals.map(g => ({
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

    // 4. Create department (if provided)
    let departmentId = null
    if (orgData.department && orgData.department.name) {
      const { data: dept, error: deptError } = await supabase
        .from('departments')
        .insert({
          org_id: org.id,
          name: orgData.department.name
        })
        .select()
        .single()

      if (deptError) throw deptError
      departmentId = dept.id

      // 5. Create department goals (if provided)
      if (orgData.departmentGoals && orgData.departmentGoals.length > 0) {
        const { error: deptGoalsError } = await supabase
          .from('department_goals')
          .insert(
            orgData.departmentGoals.map(g => ({
              department_id: departmentId,
              company_goal_id: g.alignedToCompanyGoalIndex !== null && g.alignedToCompanyGoalIndex !== undefined
                ? companyGoalIds[g.alignedToCompanyGoalIndex]
                : null,
              time_period: g.timePeriod,
              year: g.year,
              title: g.title,
              description: g.description || null,
              kpis: g.kpis || [],
              priority: index + 1
            }))
          )

        if (deptGoalsError) throw deptGoalsError
      }
    }

    // 6. Create user_organization link with department
    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: user.id,
        org_id: org.id,
        role: userOrgData.role,
        seniority: userOrgData.seniority,
        started_at: userOrgData.startedAt,
        is_current: userOrgData.isCurrent !== false,
        department_id: departmentId
      })
      .select()
      .single()

    if (userOrgError) throw userOrgError

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

      fetchingRef.current = false
      await fetchOrganizations()

      return { data, error: null }
    } catch (err) {
      console.error('Error updating organization:', err)
      return { data: null, error: err }
    }
  }

  const updateCompanyMode = async (orgId, mode) => {
    return updateOrganization(orgId, { currentMode: mode })
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

  // FIX: Return raw `loading` and `initialized` separately.
  // Let App.jsx decide how to combine them for UI decisions.
  // Old code returned a computed `loading` that mixed concerns.
  return {
    organizations,
    currentOrg,
    loading,
    initialized,
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
