import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { getOrgLearnings } from '../utils/orgLearnings';


export function useBets(orgId, orgMode) {
  const { user } = useAuth()
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  // AI scoring function
  const scoreBet = async (betData, orgContext) => {
    console.log('SCOREBET RECEIVED:', orgContext);
    console.log('CONTEXT VALUE:', orgContext?.context?.substring(0, 100));
    try {
      const response = await fetch('/api/score-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bet: betData, 
          orgMode: orgMode || 'growth',
          orgName: orgContext?.name,
          orgContext: orgContext?.context,
          orgLearnings: orgContext?.learnings
        })
      });
      
      if (!response.ok) throw new Error('Scoring failed');
      
      return await response.json();
    } catch (err) {
      console.error('Scoring error:', err);
      return null;
    }
  };

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
        .or(`user_id.eq.${user.id},sponsored_by.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (orgId) {
        query = query.or(`org_id.eq.${orgId},org_id.is.null`)
      }

      const { data: betsData, error: betsError } = await query

      if (betsError) throw betsError

      const transformedBets = (betsData || []).map(bet => {
        // Handle outcomes as either array or object
        const outcome = Array.isArray(bet.outcomes) 
          ? bet.outcomes[0] 
          : bet.outcomes;

        const resolvedStatus = bet.is_past_bet
          ? bet.past_bet_outcome
          : (outcome?.status || null)

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
          isPastBet: !!bet.is_past_bet,
          createdAt: bet.created_at,
          outcome: resolvedStatus,
          status: resolvedStatus,
          actualResult: bet.is_past_bet
            ? bet.past_bet_actual_result
            : (outcome?.actual_result || null),
          learned: bet.is_past_bet
            ? bet.past_bet_learned
            : (outcome?.learned|| null),
          wouldDoAgain: outcome?.would_do_again ?? null,
          completedAt: outcome?.recorded_at || null,
          // Score fields
          approachScore: bet.approach_score,
          potentialScore: bet.potential_score,
          fitScore: bet.fit_score,
          scoringRationale: bet.scoring_rationale,
          // Title and summary
          title: bet.title,
          summary: bet.summary,
          product: bet.product,
          aiEnhanced: bet.ai_enhanced,
          aiPredictedScore: bet.ai_predicted_score,
          originalHypothesis: bet.original_hypothesis,
          approvalStatus: bet.approval_status,
          rejectionReason: bet.rejection_reason,
          approvedAt: bet.approved_at,
          approvedBy: bet.approved_by,
          rejectedAt: bet.rejected_at,
          rejectedBy: bet.rejected_by,
          ideaId: bet.idea_id,
          structuredBy: bet.structured_by
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

  useEffect(() => {
    fetchingRef.current = false
    fetchBets()
  }, [fetchBets])

  const createBet = async (betData, ideaId = null, precomputedScores = null, orgContext = null) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    // Use precomputed scores if provided, otherwise fetch them
    let scores = precomputedScores;
    if (!scores) {
      const orgLearnings = await getOrgLearnings(orgId, user.id, 'bet');
      
      scores = await scoreBet(betData, { 
        name: orgContext?.name || orgId, 
        context: orgContext?.combinedContext || orgContext?.userContext,
        learnings: orgLearnings?.learnings || []
      });
    }

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
          is_past_bet: false,
          // Score fields
          approach_score: scores?.approach?.score ?? null,
          potential_score: scores?.potential?.score ?? null,
          fit_score: scores?.fit?.score ?? null,
          scoring_rationale: scores || null,
          // Title and summary from AI scoring
          title: scores?.title ?? betData.hypothesis?.substring(0, 100) ?? null,
          summary: scores?.summary ?? null,
          product: scores?.product ?? null,
          strategic_alignment: betData.strategicAlignment || null,
          estimated_effort: betData.estimatedEffort || null,
          inaction_impact: betData.inactionImpact || null,
          idea_id: ideaId,
          approval_status: betData.approvalStatus || (ideaId ? 'pending_approval' : 'draft'),
          structured_by: ideaId ? user.id : null,
          document_provided: betData.documentProvided || false,
          document_name: betData.documentName || null,
          document_type: betData.documentType || null
        })
        .select()
        .single()

      if (error) throw error
      
if (ideaId && data) {
  console.log('🔍 About to update idea:', ideaId);
  console.log('🔍 data object:', data);
  console.log('🔍 data.title:', data.title);
  console.log('🔍 data.summary:', data.summary);
  
  const { data: updateResult, error: updateError } = await supabase
    .from('ideas')
    .update({ 
      status: 'structured',
      title: data.title,
      summary: data.summary
    })
    .eq('id', ideaId)
    .select(); // ← CRITICAL: see what was actually updated
  
  console.log('🔍 Update result:', updateResult);
  if (updateError) {
    console.error('❌ Error:', updateError);
  }
}

      // Transform to match what App.jsx expects
      const newBet = {
        id: data.id,
        orgId: data.org_id,
        hypothesis: betData.hypothesis,
        metricDomain: betData.metricDomain,
        metric: betData.metric,
        customMetric: betData.customMetric,
        betType: betData.betType,
        baseline: betData.baseline,
        prediction: betData.prediction,
        confidence: betData.confidence,
        timeframe: betData.timeframe,
        assumptions: betData.assumptions,
        cheapTest: betData.cheapTest,
        isOwnIdea: betData.isOwnIdea !== false,
        ideaSource: betData.ideaSource,
        measurementTool: betData.measurementTool,
        strategicAlignment: betData.strategicAlignment,
        estimatedEffort: betData.estimatedEffort,
        inactionImpact: betData.inactionImpact,
        isPastBet: false,
        outcome: null,
        status: null,
        createdAt: data.created_at,
        // AI scores - CRITICAL for ScoreResult component
        approachScore: scores?.approach?.score ?? null,
        potentialScore: scores?.potential?.score ?? null,
        fitScore: scores?.fit?.score ?? null,
        scoringRationale: scores,
        // Title and summary
        title: data.title,
        summary: data.summary,
        product: data.product,
        // Approval workflow
        approvalStatus: data.approval_status,
        ideaId: data.idea_id,
        structuredBy: data.structured_by,
        // AI enhancement tracking
        aiEnhanced: betData.aiEnhanced || false,
        originalHypothesis: betData.originalHypothesis
      }
      
      setBets(prev => [newBet, ...prev])

      return { data: newBet, error: null, scores }
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

  const approveBet = async (betId) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      // Update bet approval status
      const { data: betData, error: betError } = await supabase
        .from('bets')
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', betId)
        .select()
        .single()

      if (betError) throw betError

      // If bet was linked to an idea, update idea status too
      if (betData.idea_id) {
        const { error: ideaError } = await supabase
          .from('ideas')
          .update({ 
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: user.id
          })
          .eq('id', betData.idea_id)

        if (ideaError) {
          console.error('Error updating idea status:', ideaError)
        }
      }

      // Update local state
      setBets(prev => prev.map(bet => 
        bet.id === betId 
          ? { ...bet, approvalStatus: 'approved' }
          : bet
      ))

      return { data: betData, error: null }
    } catch (err) {
      console.error('Error approving bet:', err)
      return { data: null, error: err }
    }
  }

  const rejectBet = async (betId, reason) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      // Update bet approval status
      const { data: betData, error: betError } = await supabase
        .from('bets')
        .update({ 
          approval_status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          rejected_by: user.id
        })
        .eq('id', betId)
        .select()
        .single()

      if (betError) throw betError

      // If bet was linked to an idea, update idea status too
      if (betData.idea_id) {
        const { error: ideaError } = await supabase
          .from('ideas')
          .update({ 
            status: 'rejected',
            rejection_reason: reason,
            rejected_at: new Date().toISOString(),
            rejected_by: user.id
          })
          .eq('id', betData.idea_id)

        if (ideaError) {
          console.error('Error updating idea status:', ideaError)
        }
      }

      // Update local state
      setBets(prev => prev.map(bet => 
        bet.id === betId 
          ? { ...bet, approvalStatus: 'rejected', rejectionReason: reason }
          : bet
      ))

      return { data: betData, error: null }
    } catch (err) {
      console.error('Error rejecting bet:', err)
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
    getStats,
    scoreBet,
    approveBet,
    rejectBet
  }
}
