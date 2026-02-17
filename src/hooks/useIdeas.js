import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useIdeas(orgId) {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const fetchIdeas = useCallback(async () => {
    if (!user || !orgId) {
      setIdeas([])
      return
    }

    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      setLoading(true)
      
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          *,
          submitted_by_profile:profiles!ideas_submitted_by_fkey(id, email),
          claimed_by_profile:profiles!ideas_claimed_by_fkey(id, email)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (ideasError) throw ideasError

const transformed = (ideasData || []).map(idea => ({
  id: idea.id,
  orgId: idea.org_id,
  submittedBy: idea.submitted_by,
  submittedByEmail: idea.submitted_by_profile?.email,
  title: idea.title,
  description: idea.description,
  problem: idea.problem,
  expectedImpact: idea.expected_impact,
  status: idea.status,
  claimedBy: idea.claimed_by,
  claimedByEmail: idea.claimed_by_profile?.email,
  claimedAt: idea.claimed_at,
  createdAt: idea.created_at,
  updatedAt: idea.updated_at,
  entry_type: idea.entry_type,
  bet_data: idea.bet_data,
  viability_score: idea.viability_score,
  relevance_score: idea.relevance_score,
  overall_score: idea.overall_score,
  scoring_rationale: idea.scoring_rationale
}))
      setIdeas(transformed)
      setError(null)
    } catch (err) {
      console.error('Error fetching ideas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [user, orgId])

  useEffect(() => {
    fetchingRef.current = false
    fetchIdeas()
  }, [fetchIdeas])

const submitIdea = async (ideaData) => {
  if (!user || !orgId) return { error: { message: 'Not authenticated or no org selected' } }

  try {
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        org_id: orgId,
        submitted_by: user.id,
        title: ideaData.title,
        description: ideaData.description,
        problem: ideaData.problem || null,
        expected_impact: ideaData.expectedImpact || null,
        entry_type: ideaData.entry_type || 'idea',
        bet_data: ideaData.bet_data || null,
        viability_score: ideaData.viability_score || null,
        relevance_score: ideaData.relevance_score || null,
        overall_score: ideaData.overall_score || null,
        scoring_rationale: ideaData.scoring_rationale || null,
        status: ideaData.status || 'pending'
      })
      .select()
      .single()

    if (error) throw error

    const newIdea = {
      id: data.id,
      orgId: data.org_id,
      submittedBy: data.submitted_by,
      submittedByEmail: user.email,
      title: data.title,
      description: data.description,
      problem: data.problem,
      expectedImpact: data.expected_impact,
      status: data.status,
      claimedBy: null,
      claimedByEmail: null,
      claimedAt: null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    setIdeas(prev => [newIdea, ...prev])
    return { data: newIdea, error: null }
  } catch (err) {
    console.error('Error submitting idea:', err)
    return { data: null, error: err }
  }
}

  const claimIdea = async (ideaId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .update({
          status: 'claimed',
          claimed_by: user.id,
          claimed_at: new Date().toISOString()
        })
        .eq('id', ideaId)
        .eq('status', 'pending') // Only allow claiming pending ideas
        .select()
        .single()

      if (error) throw error

      setIdeas(prev => prev.map(idea =>
        idea.id === ideaId
          ? {
              ...idea,
              status: 'claimed',
              claimedBy: user.id,
              claimedByEmail: user.email,
              claimedAt: data.claimed_at
            }
          : idea
      ))

      return { data, error: null }
    } catch (err) {
      console.error('Error claiming idea:', err)
      return { data: null, error: err }
    }
  }

  const unclaimIdea = async (ideaId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .update({
          status: 'pending',
          claimed_by: null,
          claimed_at: null
        })
        .eq('id', ideaId)
        .eq('claimed_by', user.id) // Only allow unclaiming your own claims
        .select()
        .single()

      if (error) throw error

      setIdeas(prev => prev.map(idea =>
        idea.id === ideaId
          ? {
              ...idea,
              status: 'pending',
              claimedBy: null,
              claimedByEmail: null,
              claimedAt: null
            }
          : idea
      ))

      return { data, error: null }
    } catch (err) {
      console.error('Error unclaiming idea:', err)
      return { data: null, error: err }
    }
  }

  const updateIdeaStatus = async (ideaId, newStatus) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .update({ status: newStatus })
        .eq('id', ideaId)
        .select()
        .single()

      if (error) throw error

      setIdeas(prev => prev.map(idea =>
        idea.id === ideaId ? { ...idea, status: newStatus } : idea
      ))

      return { data, error: null }
    } catch (err) {
      console.error('Error updating idea status:', err)
      return { data: null, error: err }
    }
  }

  const deleteIdea = async (ideaId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('submitted_by', user.id) // Only allow deleting your own ideas

      if (error) throw error

      setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
      return { error: null }
    } catch (err) {
      console.error('Error deleting idea:', err)
      return { error: err }
    }
  }

  const getIdeasByStatus = useCallback((status) => {
    return ideas.filter(idea => idea.status === status)
  }, [ideas])

  const getMyIdeas = useCallback(() => {
    return ideas.filter(idea => idea.submittedBy === user?.id)
  }, [ideas, user])

  const getClaimedIdeas = useCallback(() => {
    return ideas.filter(idea => idea.claimedBy === user?.id)
  }, [ideas, user])

  const getStats = useCallback(() => {
    const myIdeas = ideas.filter(i => i.submittedBy === user?.id)
    const claimed = ideas.filter(i => i.claimedBy === user?.id)
    
    return {
      totalIdeas: ideas.length,
      pendingIdeas: ideas.filter(i => i.status === 'pending').length,
      claimedIdeas: ideas.filter(i => i.status === 'claimed').length,
      structuredIdeas: ideas.filter(i => i.status === 'structured').length,
      approvedIdeas: ideas.filter(i => i.status === 'approved').length,
      mySubmittedCount: myIdeas.length,
      myClaimedCount: claimed.length
    }
  }, [ideas, user])

  return {
    ideas,
    loading,
    error,
    submitIdea,
    claimIdea,
    unclaimIdea,
    updateIdeaStatus,
    deleteIdea,
    refreshIdeas: fetchIdeas,
    getIdeasByStatus,
    getMyIdeas,
    getClaimedIdeas,
    getStats
  }
}
