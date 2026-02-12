import { supabase } from '../lib/supabase';

export async function getOrgLearnings(orgId, userId, betType = 'bet') {
  try {
    // Get completed bets from this org
    const { data: completedBets, error: betsError } = await supabase
      .from('bets')
      .select(`
        *,
        outcomes (*)
      `)
      .eq('org_id', orgId)
      .not('outcomes', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50); // Last 50 completed bets

    if (betsError) throw betsError;

    // Calculate org-wide stats
    const succeeded = completedBets?.filter(b => 
      b.outcomes?.[0]?.status === 'succeeded' || b.past_bet_outcome === 'succeeded'
    ).length || 0;
    
    const failed = completedBets?.filter(b => 
      b.outcomes?.[0]?.status === 'failed' || b.past_bet_outcome === 'failed'
    ).length || 0;
    
    const total = succeeded + failed;
    const orgAccuracy = total > 0 ? Math.round((succeeded / total) * 100) : null;

    // Get user's (sponsor's) historical accuracy
    const userBets = completedBets?.filter(b => b.user_id === userId) || [];
    const userSucceeded = userBets.filter(b => 
      b.outcomes?.[0]?.status === 'succeeded' || b.past_bet_outcome === 'succeeded'
    ).length;
    const userTotal = userBets.length;
    const userAccuracy = userTotal >= 3 ? Math.round((userSucceeded / userTotal) * 100) : null;

    // Group by metric domain to find patterns
    const metricPatterns = {};
    completedBets?.forEach(bet => {
      const domain = bet.metric_domain || 'other';
      if (!metricPatterns[domain]) {
        metricPatterns[domain] = { total: 0, succeeded: 0 };
      }
      metricPatterns[domain].total++;
      if (bet.outcomes?.[0]?.status === 'succeeded' || bet.past_bet_outcome === 'succeeded') {
        metricPatterns[domain].succeeded++;
      }
    });

    // Calculate effort accuracy patterns
    const effortPatterns = completedBets
      ?.filter(b => b.timeframe && (b.outcomes?.[0] || b.past_bet_outcome))
      .map(b => ({
        metric: b.metric_domain,
        estimated: parseInt(b.timeframe),
        outcome: b.outcomes?.[0]?.status || b.past_bet_outcome
      })) || [];

    // Calculate average sprints and effort pattern insight
    const avgDays = effortPatterns.length > 0
      ? Math.round(effortPatterns.reduce((sum, p) => sum + p.estimated, 0) / effortPatterns.length)
      : null;
    
    const avgSprints = avgDays ? Math.round(avgDays / 14) : null;

    const effortInsight = effortPatterns.length > 5 
      ? "Org has established effort estimation patterns across domains" 
      : effortPatterns.length > 0
        ? "Building effort history - early patterns emerging"
        : "No effort history yet - AI will use industry benchmarks";

    // Key learnings from completed bets
    const learnings = completedBets
      ?.filter(b => b.outcomes?.[0]?.learned || b.past_bet_learned)
      .map(b => ({
        hypothesis: b.hypothesis,
        outcome: b.outcomes?.[0]?.status || b.past_bet_outcome,
        learned: b.outcomes?.[0]?.learned || b.past_bet_learned,
        metric: b.metric,
        timeframe: b.timeframe
      }))
      .slice(0, 10) || []; // Top 10 most recent learnings

    return {
      totalBets: total,
      orgAccuracy,
      userAccuracy,
      userBetsCount: userTotal,
      metricPatterns,
      effortPatterns: effortInsight,
      avgSprintsPerFeature: avgSprints,
      avgDaysPerFeature: avgDays,
      learnings,
      recentOutcomes: completedBets?.slice(0, 5).map(b => ({
        hypothesis: b.hypothesis?.substring(0, 100),
        outcome: b.outcomes?.[0]?.status || b.past_bet_outcome,
        metric: b.metric,
        timeframe: b.timeframe
      })) || []
    };

  } catch (error) {
    console.error('Error gathering org learnings:', error);
    return null;
  }
}
