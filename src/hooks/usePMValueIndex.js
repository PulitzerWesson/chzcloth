import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePMValueIndex(orgId = null) {
  const { user } = useAuth()
  const [index, setIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchIndex = useCallback(async () => {
    if (!user) {
      setIndex(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Call the database function to calculate index
      const { data, error: fetchError } = await supabase
        .rpc('calculate_pm_value_index', {
          user_uuid: user.id,
          org_uuid: orgId
        })

      if (fetchError) throw fetchError

      setIndex(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching PM Value Index:', err)
      setError(err.message)
      
      // Fall back to client-side calculation if RPC fails
      // (useful during development before migration is applied)
      setIndex(null)
    } finally {
      setLoading(false)
    }
  }, [user, orgId])

  useEffect(() => {
    fetchIndex()
  }, [fetchIndex])

  // Calculate locally from bets (fallback or for real-time updates)
  const calculateFromBets = useCallback((bets) => {
    const safeBets = bets || []
    
    // Filter to bets with outcomes
    const completedBets = safeBets.filter(b => 
      ['succeeded', 'partial', 'failed'].includes(b.outcome) ||
      ['succeeded', 'partial', 'failed'].includes(b.status)
    )
    
    // Count totals
    const totalBets = safeBets.length
    const outcomesCount = completedBets.length
    
    // Check for recent outcome (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const hasRecentOutcome = completedBets.some(b => {
      const completedAt = b.completedAt || b.created_at
      return completedAt && new Date(completedAt) > thirtyDaysAgo
    })
    
    // Check unlock eligibility
    const unlocked = totalBets >= 5 && outcomesCount >= 3 && hasRecentOutcome
    
    // Calculate progress percentage
    const progressPct = Math.min(100, Math.round(
      ((Math.min(totalBets, 5) / 5) * 40) +
      ((Math.min(outcomesCount, 3) / 3) * 40) +
      (hasRecentOutcome ? 20 : 0)
    ))
    
    if (!unlocked) {
      return {
        unlocked: false,
        unlockProgress: {
          betsLogged: totalBets,
          betsRequired: 5,
          outcomesRecorded: outcomesCount,
          outcomesRequired: 3,
          hasRecentOutcome
        },
        progressPct,
        components: null,
        index: null
      }
    }
    
    // Calculate components
    const isSuccess = (b) => ['succeeded', 'partial'].includes(b.status || b.outcome)
    const successCount = completedBets.filter(isSuccess).length
    
    // Hit Rate
    const hitRate = Math.round((successCount / outcomesCount) * 100)
    
    // Calibration (how close is avg confidence to actual success rate)
    const avgConfidence = completedBets.reduce((sum, b) => sum + (b.confidence || 70), 0) / outcomesCount
    const calibration = Math.round(100 - Math.abs(avgConfidence - hitRate))
    
    // Velocity (outcomes per month)
    const firstBetDate = safeBets.length > 0 
      ? new Date(Math.min(...safeBets.map(b => new Date(b.createdAt || b.created_at))))
      : new Date()
    const monthsActive = Math.max(1, (Date.now() - firstBetDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    const velocity = Math.round((outcomesCount / monthsActive) * 10) / 10
    
    // Ownership Premium
    const ownIdeas = completedBets.filter(b => b.isOwnIdea !== false)
    const othersIdeas = completedBets.filter(b => b.isOwnIdea === false)
    const ownSuccessRate = ownIdeas.length >= 2 
      ? (ownIdeas.filter(isSuccess).length / ownIdeas.length) * 100 
      : 50
    const othersSuccessRate = othersIdeas.length >= 2 
      ? (othersIdeas.filter(isSuccess).length / othersIdeas.length) * 100 
      : 50
    const ownershipPremium = Math.round(ownSuccessRate - othersSuccessRate)
    
    // Ambition (avg confidence on wins)
    const winningBets = completedBets.filter(isSuccess)
    const ambition = winningBets.length > 0
      ? Math.round(winningBets.reduce((sum, b) => sum + (b.confidence || 70), 0) / winningBets.length)
      : 50
    
    // Calculate overall index (weighted average)
    const indexValue = Math.round(
      (hitRate * 0.35) +
      (calibration * 0.25) +
      (ambition * 0.20) +
      (Math.min(Math.max(ownershipPremium + 50, 30), 70) * 0.20)
    )
    
    return {
      unlocked: true,
      unlockProgress: {
        betsLogged: totalBets,
        betsRequired: 5,
        outcomesRecorded: outcomesCount,
        outcomesRequired: 3,
        hasRecentOutcome
      },
      progressPct: 100,
      components: {
        hitRate,
        calibration,
        velocity,
        ownershipPremium,
        ambition
      },
      index: indexValue
    }
  }, [])

  return {
    index,
    loading,
    error,
    refreshIndex: fetchIndex,
    calculateFromBets
  }
}

// Labels and colors for display
export const PM_INDEX_LABELS = {
  hitRate: {
    label: 'Hit Rate',
    description: 'Outcomes that matched your prediction',
    format: (v) => `${v}%`
  },
  calibration: {
    label: 'Calibration',
    description: 'How well your confidence matches reality',
    format: (v) => `${v}%`
  },
  velocity: {
    label: 'Velocity',
    description: 'Bets resolved per month',
    format: (v) => `${v}/mo`
  },
  ownershipPremium: {
    label: 'Ownership Premium',
    description: 'Your ideas vs others\' ideas success difference',
    format: (v) => `${v > 0 ? '+' : ''}${v}%`
  },
  ambition: {
    label: 'Ambition',
    description: 'Average confidence on winning bets',
    format: (v) => `${v}`
  }
}

export const getIndexColor = (value) => {
  if (value >= 75) return '#22c55e'  // green
  if (value >= 60) return '#eab308'  // yellow
  if (value >= 45) return '#f97316'  // orange
  return '#ef4444'  // red
}

export const getIndexLabel = (value) => {
  if (value >= 80) return 'Exceptional'
  if (value >= 70) return 'Strong'
  if (value >= 60) return 'Solid'
  if (value >= 50) return 'Developing'
  return 'Building'
}
