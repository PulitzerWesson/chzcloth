import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBets() {
  const { user } = useAuth()
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all bets for the current user
  const fetchBets = useCallback(async () => {
    if (!user) {
      setBets([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch bets with their outcomes
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select(`
          *,
          outcomes (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (betsError) throw betsError

      // Transform data to match our app's expected format
      const transformedBets = betsData.map(bet => ({
        id: bet.id,
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
        isPastBet: bet.is_past_bet,
        createdAt: bet.created_at,
        // Outcome data (from joined outcomes or past_bet fields)
        outcome: bet.is_past_bet ? bet.past_bet_outcome : bet.outcomes?.[0]?.status,
        status: bet.outcomes?.[0]?.status,
        actualResult: bet.is_past_bet ? bet.past_bet_actual_result : bet.outcomes?.[0]?.actual_result,
        learned: bet.is_past_bet ? bet.past_bet_learned : bet.outcomes?.[0]?.learned,
        wouldDoAgain: bet.outcomes?.[0]?.would_do_again,
        completedAt: bet.outcomes?.[0]?.recorded_at
      }))

      setBets(transformedBets)
      setError(null)
    } catch (err) {
      console.error('Error fetching bets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load bets on mount and when user changes
  useEffect(() => {
    fetchBets()
  }, [fetchBets])

  // Create a new bet
  const createBet = async (betData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
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

      // Add to local state
      const newBet = {
        ...betData,
        id: data.id,
        createdAt: data.created_at
      }
      setBets(prev => [newBet, ...prev])

      return { data: newBet, error: null }
    } catch (err) {
      console.error('Error creating bet:', err)
      return { data: null, error: err }
    }
  }

  // Create past bets (for baseline seeding)
  const createPastBets = async (pastBetsData) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const betsToInsert = pastBetsData
        .filter(b => b.hypothesis && b.outcome && b.learned)
        .map(bet => ({
          user_id: user.id,
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

      // Refresh bets from server
      await fetchBets()

      return { data, error: null }
    } catch (err) {
      console.error('Error creating past bets:', err)
      return { data: null, error: err }
    }
  }

  // Record outcome for a bet
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

      // Update local state
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

  // Delete a bet
  const deleteBet = async (betId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', betId)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setBets(prev => prev.filter(bet => bet.id !== betId))

      return { error: null }
    } catch (err) {
      console.error('Error deleting bet:', err)
      return { error: err }
    }
  }

  // Get user stats
  const getStats = useCallback(() => {
    const safeBets = bets || []
    
    const betsWithOutcomes = safeBets.filter(b => 
      ['succeeded', 'partial', 'failed'].includes(b.outcome) || 
      ['succeeded', 'partial', 'failed'].includes(b.status)
    )
    
    const ownIdeas = betsWithOutcomes.filter(b => b.isOwnIdea !== false)
    const othersIdeas = betsWithOutcomes.filter(b => b.isOwnIdea === false)
    
    const isSuccess = (b) => ['succeeded', 'partial'].includes(b.status || b.outcome)
    
    return {
      totalBets: safeBets.length,
      completedBets: betsWithOutcomes.length,
      activeBets: safeBets.filter(b => !b.outcome && !b.status && !b.isPastBet).length,
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
