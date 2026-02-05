import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBets(orgId) {
  const { user } = useAuth()
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const fetchBets = useCallback(async () => {
    if (!user) {
      setBets([])
      return
    }

    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      setLoading(true)
      
      let query = supabase
        .from('bets')
        .select(`
          *,
          outcomes (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // FIX: When filtering by org, also include orphan bets (org_id IS NULL).
      // These are bets created before the org feature existed.
      // Without this, orphan bets vanish when an org is selected.
      if (orgId) {
        query = query.or(`org_id.eq.${orgId},org_id.is.null`)
      }

      const { data: betsData, error: betsError } = await query

      if (betsError) throw betsError

      const transformedBets = (betsData || []).map(bet => {
        // FIX: Determine the resolved outcome/status consistently.
        // Past bets store outcome directly on the bet row.
        // Active bets store outcome in the joined outcomes table.
        // Previously, `status` was always from outcomes table — undefined for past bets.
        // This caused past bets to show as "active" in some code paths.
        const resolvedStatus = bet.is_past_bet
          ? bet.past_bet_outcome
          : (bet.outcomes?.[0]?.status || null)

        return {
          id: bet.id,
          orgId: bet.org_id,
          hypothesis: bet.hypothesis,
          metricDomain: bet.metric_domain,
          metric: bet.metric,
          customMetric: bet.custom_metric,
          betType: bet.bet_type,
          baseline: bet.baseline,
          prediction: bet.prediction,
          confidence: bet.confidence,
          timeframe: bet.timeframe,
          assumptions: bet.assumptions,
          cheapTest: bet.cheap_test,
          isOwnIdea: bet.is_own_idea,
          ideaSource: bet.idea_source,
          measurementTool: bet.measurement_tool,
          isPastBet: !!bet.is_past_bet,  // FIX: coerce nullable bool to definite bool
          createdAt: bet.created_at,
          // FIX: Both outcome and status now resolve from the same source
          outcome: resolvedStatus,
          status: resolvedStatus,
          actualResult: bet.is_past_bet
            ? bet.past_bet_actual_result
            : (bet.outcomes?.[0]?.actual_result || null),
          learned: bet.is_past_bet
            ? bet.past_bet_learned
            : (bet.outcomes?.[0]?.learned || null),
          wouldDoAgain: bet.outcomes?.[0]?.would_do_again ?? null,
          completedAt: bet.outcomes?.[0]?.recorded_at || null
        }
      })

      setBets(transformedBets)
      setError(null)
    } catch (err) {
      console.error('Error fetching bets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [user, orgId])

  // Re-fetch when user or orgId changes
  useEffect(() => {
    fetchingRef.current = false
    fetchBets()
  }, [fetchBets])

  const createBet = async (betData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          org_id: orgId || null,
          hypothesis: betData.hypothesis,
          metric_domain: betData.metricDomain,
          metric: betData.metric,
          custom_metric: betData.customMetric,
          bet_type: betData.betType,
          baseline: betData.baseline,
          prediction: betData.prediction,
          confidence: betData.confidence,
          timeframe: parseInt(betData.timeframe) || null,
          assumptions: betData.assumptions,
          cheap_test: betData.cheapTest,
          is_own_idea: betData.isOwnIdea !== false,
          idea_source: betData.ideaSource,
          measurement_tool: betData.measurementTool,
          is_past_bet: false
        })
        .select()
        .single()

      if (error) throw error

      const newBet = {
        ...betData,
        id: data.id,
        orgId: data.org_id,
        isPastBet: false,
        outcome: null,
        status: null,
        createdAt: data.created_at
      }
      setBets(prev => [newBet, ...prev])

      return { data: newBet, error: null }
    } catch (err) {
      console.error('Error creating bet:', err)
      return { data: null, error: err }
    }
  }

  const createPastBets = async (pastBetsData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const betsToInsert = pastBetsData
        .filter(b => b.hypothesis && b.outcome && b.learned)
        .map(bet => ({
          user_id: user.id,
          org_id: orgId || null,
          hypothesis: bet.hypothesis,
          metric_domain: bet.metricDomain,
          metric: bet.metric,
          prediction: bet.prediction,
          is_own_idea: bet.isOwnIdea !== false,
          idea_source: bet.ideaSource,
          is_past_bet: true,
          past_bet_outcome: bet.outcome,
          past_bet_actual_result: bet.actualResult,
          past_bet_learned: bet.learned,
          past_bet_timeframe: bet.timeframe
        }))

      if (betsToInsert.length === 0) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('bets')
        .insert(betsToInsert)
        .select()

      if (error) throw error

      // Full refetch to get consistent transforms
      fetchingRef.current = false
      await fetchBets()

      return { data, error: null }
    } catch (err) {
      console.error('Error creating past bets:', err)
      return { data: null, error: err }
    }
  }

  const recordOutcome = async (betId, outcomeData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('outcomes')
        .insert({
          bet_id: betId,
          user_id: user.id,
          actual_result: outcomeData.actualResult,
          status: outcomeData.status,
          learned: outcomeData.learned,
          would_do_again: outcomeData.wouldDoAgain
        })
        .select()
        .single()

      if (error) throw error

      // FIX: Update both status and outcome consistently
      setBets(prev => prev.map(bet => 
        bet.id === betId 
          ? { 
              ...bet, 
              status: outcomeData.status,
              outcome: outcomeData.status,
              actualResult: outcomeData.actualResult,
              learned: outcomeData.learned,
              wouldDoAgain: outcomeData.wouldDoAgain,
              completedAt: data.recorded_at
            }
          : bet
      ))

      return { data, error: null }
    } catch (err) {
      console.error('Error recording outcome:', err)
      return { data: null, error: err }
    }
  }

  const deleteBet = async (betId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', betId)
        .eq('user_id', user.id)

      if (error) throw error

      setBets(prev => prev.filter(bet => bet.id !== betId))

      return { error: null }
    } catch (err) {
      console.error('Error deleting bet:', err)
      return { error: err }
    }
  }

  const getStats = useCallback(() => {
    const safeBets = bets || []
    
    // FIX: Use single field (status) since outcome and status are now the same
    const betsWithOutcomes = safeBets.filter(b => 
      ['succeeded', 'partial', 'failed'].includes(b.status)
    )
    
    const ownIdeas = betsWithOutcomes.filter(b => b.isOwnIdea !== false)
    const othersIdeas = betsWithOutcomes.filter(b => b.isOwnIdea === false)
    
    const isSuccess = (b) => ['succeeded', 'partial'].includes(b.status)
    
    return {
      totalBets: safeBets.length,
      completedBets: betsWithOutcomes.length,
      activeBets: safeBets.filter(b => !b.status && !b.isPastBet).length,
      accuracy: betsWithOutcomes.length > 0
        ? Math.round((betsWithOutcomes.filter(isSuccess).length / betsWithOutcomes.length) * 100)
        : null,
      ownIdeasCount: ownIdeas.length,
      ownIdeasAccuracy: ownIdeas.length >= 2
        ? Math.round((ownIdeas.filter(isSuccess).length / ownIdeas.length) * 100)
        : null,
      othersIdeasCount: othersIdeas.length,
      othersIdeasAccuracy: othersIdeas.length >= 2
        ? Math.round((othersIdeas.filter(isSuccess).length / othersIdeas.length) * 100)
        : null
    }
  }, [bets])

  return {
    bets,
    loading,
    error,
    createBet,
    createPastBets,
    recordOutcome,
    deleteBet,
    refreshBets: fetchBets,
    getStats
  }
}
