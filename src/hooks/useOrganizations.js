import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useOrganizations() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [currentOrg, setCurrentOrg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all organizations for the current user
  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([])
      setCurrentOrg(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch user's organizations with relationship data
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
        .order('started_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform data
      const transformed = (data || []).map(uo => ({
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
      
      // Set current org
      const current = transformed.find(o => o.isCurrent) || transformed[0] || null
      setCurrentOrg(current)
      
      setError(null)
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

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

      // Refresh orgs
      await fetchOrganizations()

      return { data, error: null }
    } catch (err) {
      console.error('Error updating organization:', err)
      return { data: null, error: err }
    }
  }

  // Update company mode specifically (common operation)
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

      // Refresh orgs
      await fetchOrganizations()

      return { error: null }
    } catch (err) {
      console.error('Error switching organization:', err)
      return { error: err }
    }
  }

  // Mark an org as left (end tenure)
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

      // Refresh orgs
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
    
    // Growth bets in efficiency mode
    if (betDomain === 'growth' && mode === 'efficiency') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're making a growth bet while your company is focused on efficiency. Growth bets can still succeed, but may face more scrutiny. Consider: Can you frame this as \"efficient growth\"? Is the cost low enough to de-risk? Do you have exec sponsorship?"
      }
    }

    // Efficiency bets in growth mode
    if (['operations', 'platform'].includes(betDomain) && mode === 'growth') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're making an efficiency/ops bet while your company is in growth mode. These bets are often deprioritized in growth phases. Consider: Does this unblock growth? Can it wait until growth stabilizes? Is there a compelling cost-savings story?"
      }
    }

    // Optimization bets in PMF mode
    if (['operations', 'platform', 'monetization'].includes(betDomain) && mode === 'pmf') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're making an optimization bet while your company is still finding product-market fit. Premature optimization can distract from learning. Consider: Will this help you learn faster? Is the pain severe enough to address now?"
      }
    }

    // Retention bets in PMF mode
    if (betDomain === 'retention' && mode === 'pmf') {
      return {
        showCheck: true,
        betDomain,
        companyMode: mode,
        guidance: "You're focused on retention while still finding product-market fit. Retention matters, but if the core product isn't right, retention won't save you. Consider: Is the product fundamentally working for some users? Are you optimizing too early?"
      }
    }

    return null
  }

  return {
    organizations,
    currentOrg,
    loading,
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
