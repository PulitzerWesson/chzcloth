// StatsScreen.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const OUTCOME_STATUSES = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'];
const ALIGNMENT_LABELS = { inner: 'Inner Ring', outer: 'Outer Ring', experimental: 'Experimental' };

function avgDays(pairs) {
  const valid = pairs.filter(([a, b]) => a && b);
  if (!valid.length) return null;
  const total = valid.reduce((sum, [a, b]) => sum + (new Date(b) - new Date(a)), 0);
  return Math.round(total / valid.length / (1000 * 60 * 60 * 24));
}

function SectionLabel({ children }) {
  return (
    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{label}</span>
      <span style={{ color: color || '#f1f5f9', fontSize: '1rem', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function FunnelBlock({ label, value }) {
  return (
    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
      <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 56 }}>
      <div style={{ color: value === 0 ? '#334155' : (color || '#f1f5f9'), fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>
        {value === 0 ? '—' : value}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 4, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

function computeUserStats(bets, userId) {
  const submitted = bets.filter(b => b.user_id === userId && ['pending_approval', 'approved'].includes(b.approval_status));
  const sponsored = submitted.filter(b => b.approval_status === 'approved');
  const shipped = submitted.filter(b => b.completed_at);
  const outcomesRecorded = shipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));
  return {
    submitted: submitted.length,
    sponsored: sponsored.length,
    shipped: shipped.length,
    outcomesRecorded: outcomesRecorded.length,
    outcomeBreakdown: {
      succeeded: outcomesRecorded.filter(b => b.outcome === 'succeeded').length,
      partial: outcomesRecorded.filter(b => b.outcome === 'partial').length,
      failed: outcomesRecorded.filter(b => b.outcome === 'failed').length,
      inconclusive: outcomesRecorded.filter(b => ['inconclusive', 'never_shipped'].includes(b.outcome)).length,
    }
  };
}

export function StatsScreen({ currentOrg, isAdmin }) {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expandedOutcomes, setExpandedOutcomes] = useState({});

  useEffect(() => {
    if (!currentOrg?.orgId) return;
    fetchData();
  }, [currentOrg?.orgId]);

  const fetchSummary = async (statsPayload) => {
    setSummaryLoading(true);
    try {
      const response = await fetch('/api/stats-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: statsPayload })
      });
      const data = await response.json();
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select(`*, outcomes(*)`)
        .eq('org_id', currentOrg.orgId);

      if (betsError) throw betsError;

      const normalized = (betsData || []).map(bet => {
        const outcome = Array.isArray(bet.outcomes) ? bet.outcomes[0] : bet.outcomes;
        return { ...bet, outcome: outcome?.status || null };
      });
      setBets(normalized);

      const { data: membersData, error: membersError } = await supabase
        .from('user_organizations')
        .select(`id, user_id, team_role, users:user_id (email)`)
        .eq('org_id', currentOrg.orgId)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Build payload for AI summary
      const submitted = normalized.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
      const sponsored = normalized.filter(b => b.approval_status === 'approved');
      const shipped = normalized.filter(b => b.completed_at);
      const outcomes = shipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));

      fetchSummary({
        funnel: {
          submitted: submitted.length,
          sponsored: sponsored.length,
          shipped: shipped.length,
          outcomesRecorded: outcomes.length
        },
        outcomeBreakdown: {
          succeeded: outcomes.filter(b => b.outcome === 'succeeded').length,
          partial: outcomes.filter(b => b.outcome === 'partial').length,
          failed: outcomes.filter(b => b.outcome === 'failed').length,
          inconclusive: outcomes.filter(b => ['inconclusive', 'never_shipped'].includes(b.outcome)).length,
        },
        byAlignment: ['inner', 'outer', 'experimental'].map(alignment => ({
          alignment: ALIGNMENT_LABELS[alignment],
          submitted: submitted.filter(b => b.strategic_alignment === alignment).length,
          sponsored: sponsored.filter(b => b.strategic_alignment === alignment).length,
          shipped: shipped.filter(b => b.strategic_alignment === alignment).length,
          outcomes: outcomes.filter(b => b.strategic_alignment === alignment).length,
        })).filter(s => s.submitted > 0),
      });

    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading stats...</div>;
  }

  // Compute display values
  const allSubmitted = bets.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
  const allSponsored = bets.filter(b => b.approval_status === 'approved');
  const allShipped = bets.filter(b => b.completed_at);
  const allOutcomes = allShipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));
  const avgSubmitToSponsored = avgDays(allSponsored.map(b => [b.created_at, b.approved_at]));
  const avgSponsoredToShipped = avgDays(allShipped.filter(b => b.approved_at).map(b => [b.approved_at, b.completed_at]));
  const outcomeBreakdown = {
    succeeded: allOutcomes.filter(b => b.outcome === 'succeeded').length,
    partial: allOutcomes.filter(b => b.outcome === 'partial').length,
    failed: allOutcomes.filter(b => b.outcome === 'failed').length,
    inconclusive: allOutcomes.filter(b => ['inconclusive', 'never_shipped'].includes(b.outcome)).length,
  };
  const alignmentStats = ['inner', 'outer', 'experimental'].map(alignment => ({
    alignment,
    submitted: allSubmitted.filter(b => b.strategic_alignment === alignment).length,
    sponsored: allSponsored.filter(b => b.strategic_alignment === alignment).length,
    shipped: allShipped.filter(b => b.strategic_alignment === alignment).length,
    outcomes: allOutcomes.filter(b => b.strategic_alignment === alignment).length,
  })).filter(s => s.submitted > 0);

  const visibleMembers = isAdmin ? members : members.filter(m => m.user_id === user?.id);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Stats</h1>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 32 }}>
        How your team is betting — and how those bets are landing.
      </p>

      {/* AI Summary */}
      <div style={{
        marginBottom: 40,
        padding: '16px 20px',
        background: 'rgba(125,211,252,0.05)',
        border: '1px solid rgba(125,211,252,0.15)',
        borderRadius: 12,
        minHeight: 52,
        display: 'flex',
        alignItems: 'center'
      }}>
        {summaryLoading ? (
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Analyzing your data...</span>
        ) : summary ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{summary}</p>
        ) : null}
      </div>

      {/* Company Funnel */}
      <div style={{ marginBottom: 48 }}>
        <SectionLabel>Company Funnel</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginBottom: 16 }}>
          <FunnelBlock label="Submitted" value={allSubmitted.length} />
          <div style={{ display: 'flex', alignItems: 'center', color: '#334155', fontSize: '1.2rem', padding: '0 4px' }}>→</div>
          <FunnelBlock label="Sponsored" value={allSponsored.length} />
          <div style={{ display: 'flex', alignItems: 'center', color: '#334155', fontSize: '1.2rem', padding: '0 4px' }}>→</div>
          <FunnelBlock label="Shipped" value={allShipped.length} />
          <div style={{ display: 'flex', alignItems: 'center', color: '#334155', fontSize: '1.2rem', padding: '0 4px' }}>→</div>
          <FunnelBlock label="Outcome Recorded" value={allOutcomes.length} />
        </div>
        {(avgSubmitToSponsored || avgSponsoredToShipped) && (
          <div style={{ display: 'flex', gap: 32, padding: '12px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Avg time:</span>
            {avgSubmitToSponsored && <span style={{ color: '#94a3b8' }}>Submitted → Sponsored: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{avgSubmitToSponsored}d</span></span>}
            {avgSponsoredToShipped && <span style={{ color: '#94a3b8' }}>Sponsored → Shipped: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{avgSponsoredToShipped}d</span></span>}
          </div>
        )}
      </div>

      {/* Outcomes */}
      {allOutcomes.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <SectionLabel>Outcomes</SectionLabel>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '4px 24px' }}>
            <StatRow label="Total Recorded" value={allOutcomes.length} />
            <StatRow label="Succeeded" value={outcomeBreakdown.succeeded} color="#22c55e" />
            <StatRow label="Partial Win" value={outcomeBreakdown.partial} color="#fbbf24" />
            <StatRow label="Failed" value={outcomeBreakdown.failed} color="#ef4444" />
            <StatRow label="Inconclusive / Never Shipped" value={outcomeBreakdown.inconclusive} color="#64748b" />
          </div>
        </div>
      )}

      {/* By Strategic Alignment */}
      {alignmentStats.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <SectionLabel>By Strategic Alignment</SectionLabel>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)', padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              {['', 'Submitted', 'Sponsored', 'Shipped', 'Outcomes'].map((h, i) => (
                <div key={i} style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textAlign: i === 0 ? 'left' : 'center' }}>{h}</div>
              ))}
            </div>
            {alignmentStats.map((s, idx) => (
              <div key={s.alignment} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)', padding: '14px 24px', borderBottom: idx < alignmentStats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                <div style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 500 }}>{ALIGNMENT_LABELS[s.alignment] || s.alignment}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center' }}>{s.submitted}</div>
                <div style={{ color: '#a78bfa', fontSize: '0.95rem', textAlign: 'center' }}>{s.sponsored || '—'}</div>
                <div style={{ color: '#2dd4bf', fontSize: '0.95rem', textAlign: 'center' }}>{s.shipped || '—'}</div>
                <div style={{ color: '#22c55e', fontSize: '0.95rem', textAlign: 'center' }}>{s.outcomes || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Team Member */}
      <div>
        <SectionLabel>{isAdmin ? 'By Team Member' : 'Your Stats'}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleMembers.map(member => {
            const stats = computeUserStats(bets, member.user_id);
            const isCurrentUser = member.user_id === user?.id;
            const isAdminMember = member.team_role === 'admin';
            const hasOutcomes = stats.outcomesRecorded > 0;
            return (
              <div key={member.id} style={{ background: isCurrentUser ? 'rgba(45,212,191,0.03)' : 'rgba(255,255,255,0.02)', border: isCurrentUser ? '1px solid rgba(45,212,191,0.15)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.users?.email || 'Unknown'}
                    {isCurrentUser && <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 6 }}>(you)</span>}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{isAdminMember ? 'Admin' : 'Member'}</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <MiniStat label="Submitted" value={stats.submitted} />
                  <span style={{ color: '#334155' }}>→</span>
                  <MiniStat label="Sponsored" value={stats.sponsored} color="#a78bfa" />
                  <span style={{ color: '#334155' }}>→</span>
                  <MiniStat label="Shipped" value={stats.shipped} color="#2dd4bf" />
                  <span style={{ color: '#334155' }}>→</span>
                  <MiniStat label="Outcome" value={stats.outcomesRecorded} color="#22c55e" />
                </div>
                    {hasOutcomes && (
                      <>
                        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                        <div>
                          <button
                            onClick={() => setExpandedOutcomes(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <span style={{ fontSize: '0.65rem' }}>{expandedOutcomes[member.id] ? '▼' : '▶'}</span>
                            {stats.outcomesRecorded} outcome{stats.outcomesRecorded !== 1 ? 's' : ''}
                          </button>
                          {expandedOutcomes[member.id] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', marginTop: 8 }}>
                              {stats.outcomeBreakdown.succeeded > 0 && <span style={{ color: '#22c55e' }}>{stats.outcomeBreakdown.succeeded} Succeeded</span>}
                              {stats.outcomeBreakdown.partial > 0 && <span style={{ color: '#fbbf24' }}>{stats.outcomeBreakdown.partial} Partial</span>}
                              {stats.outcomeBreakdown.failed > 0 && <span style={{ color: '#ef4444' }}>{stats.outcomeBreakdown.failed} Failed</span>}
                              {stats.outcomeBreakdown.inconclusive > 0 && <span style={{ color: '#64748b' }}>{stats.outcomeBreakdown.inconclusive} Inconclusive</span>}
                            </div>
                          )}
                        </div>
                      </>
                    )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
