// StatsScreen.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const OUTCOME_STATUSES = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'];
const ALIGNMENT_LABELS = { inner: 'Inner Ring', outer: 'Outer Ring', experimental: 'Experimental' };

const LEVERS = ['Revenue', 'Retention', 'Acquisition', 'Efficiency', 'Platform', 'Experience', 'Risk'];
const LEVER_COLORS = {
  Revenue:     '#22c55e',
  Retention:   '#2dd4bf',
  Acquisition: '#fbbf24',
  Efficiency:  '#7dd3fc',
  Platform:    '#a78bfa',
  Experience:  '#f97316',
  Risk:        '#ef4444',
};

const LeverIcon = ({ lever }) => {
  const c = LEVER_COLORS[lever] || '#94a3b8';
  const s = { width: 16, height: 16, flexShrink: 0 };
  switch (lever) {
    case 'Revenue': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <polyline points="1,10 4,6 7,8 10,3 13,1" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="10,1 13,1 13,4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'Retention': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <path d="M7 12 C7 12 2 8.5 2 5.5 C2 3.5 3.5 2 5.5 2 C6.3 2 7 2.5 7 2.5 C7 2.5 7.7 2 8.5 2 C10.5 2 12 3.5 12 5.5 C12 8.5 7 12 7 12Z" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
      </svg>
    );
    case 'Acquisition': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <circle cx="5.5" cy="5.5" r="3.5" stroke={c} strokeWidth="1.6" fill="none"/>
        <line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="11" y1="2" x2="11" y2="6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="9" y1="4" x2="13" y2="4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    );
    case 'Efficiency': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <polygon points="7,1 8.5,5.5 13,5.5 9.5,8.5 11,13 7,10 3,13 4.5,8.5 1,5.5 5.5,5.5" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      </svg>
    );
    case 'Platform': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="8" y="1" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="1" y="8" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="8" y="8" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      </svg>
    );
    case 'Experience': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.5" fill="none"/>
        <path d="M4.5 8.5 C5 9.5 6 10 7 10 C8 10 9 9.5 9.5 8.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="5" cy="6" r="0.8" fill={c}/>
        <circle cx="9" cy="6" r="0.8" fill={c}/>
      </svg>
    );
    case 'Risk': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <path d="M7 1 L13 12 L1 12 Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="7" y1="5" x2="7" y2="8.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="10.5" r="0.7" fill={c}/>
      </svg>
    );
    default: return null;
  }
};

const StrategicAlignmentIcon = ({ alignment }) => {
  const normalized = alignment?.toLowerCase();
  if (normalized === 'inner' || normalized === 'inner_ring' || normalized === 'inner ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes growFromDot {
            0% { transform: scale(0); opacity: 0; }
            22% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .grow-circle { animation: growFromDot 9s ease-out infinite; transform-origin: center; }
        `}</style>
        <circle cx="14" cy="14" r="12" stroke="url(#tealGradientS1)" strokeWidth="2.5" fill="none"/>
        <circle className="grow-circle" cx="14" cy="14" r="6" fill="url(#tealGradientS1)"/>
        <defs>
          <linearGradient id="tealGradientS1" x1="2" y1="2" x2="26" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (normalized === 'outer' || normalized === 'outer_ring' || normalized === 'outer ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes drawS { 0% { stroke-dashoffset: 75.4; } 30% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
          .draw-circle-s { stroke-dasharray: 75.4; animation: drawS 10s linear infinite; }
        `}</style>
        <circle className="draw-circle-s" cx="14" cy="14" r="12" stroke="url(#tealGradientS2)" strokeWidth="3" fill="none"/>
        <circle cx="14" cy="14" r="6" fill="#1e293b"/>
        <defs>
          <linearGradient id="tealGradientS2" x1="2" y1="2" x2="26" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (normalized === 'experimental') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 28" fill="none">
        <style>{`
          @keyframes bubble1s { 0% { cy: 20; opacity: 0; } 20% { opacity: 1; } 100% { cy: 3; opacity: 0; } }
          @keyframes bubble2s { 0% { cy: 20; opacity: 0; } 20% { opacity: 1; } 100% { cy: 3.5; opacity: 0; } }
          @keyframes bubble3s { 0% { cy: 20; opacity: 0; } 20% { opacity: 1; } 100% { cy: 3; opacity: 0; } }
          .bubble1s { animation: bubble1s 2.5s ease-in infinite; }
          .bubble2s { animation: bubble2s 2.5s ease-in infinite 0.8s; }
          .bubble3s { animation: bubble3s 2.5s ease-in infinite 1.6s; }
        `}</style>
        <path d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" stroke="url(#beakerGradientS)" strokeWidth="2" fill="none"/>
        <line x1="8" y1="2" x2="16" y2="2" stroke="url(#beakerGradientS)" strokeWidth="2"/>
        <circle className="bubble1s" cx="9" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
        <circle className="bubble2s" cx="12" cy="20" r="1.8" fill="#22d3ee" opacity="0"/>
        <circle className="bubble3s" cx="15" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
        <defs>
          <linearGradient id="beakerGradientS" x1="4" y1="2" x2="20" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  return null;
};

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

function FunnelBlock({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
      <div style={{ color: color || '#f1f5f9', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>{value}</div>
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

function StatsTable({ rows, renderLabel }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)', padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        {['', 'Submitted', 'Sponsored', 'Shipped', 'Outcomes'].map((h, i) => (
          <div key={i} style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textAlign: i === 0 ? 'left' : 'center' }}>{h}</div>
        ))}
      </div>
      {rows.map((s, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)', padding: '14px 24px', borderBottom: idx < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            {renderLabel(s)}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center' }}>{s.submitted}</div>
          <div style={{ color: '#a78bfa', fontSize: '0.95rem', textAlign: 'center' }}>{s.sponsored || '—'}</div>
          <div style={{ color: '#2dd4bf', fontSize: '0.95rem', textAlign: 'center' }}>{s.shipped || '—'}</div>
          <div style={{ color: '#22c55e', fontSize: '0.95rem', textAlign: 'center' }}>{s.outcomes || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function computeUserStats(bets, userId) {
  const submitted = bets.filter(b => b.user_id === userId && ['pending_approval', 'approved'].includes(b.approval_status));
  const sponsored = submitted.filter(b => b.approval_status === 'approved');
  const inProgress = submitted.filter(b => b.started_at && !b.completed_at);
  const shipped = submitted.filter(b => b.completed_at);
  const outcomesRecorded = shipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));
  return {
    submitted: submitted.length,
    sponsored: sponsored.length,
    inProgress: inProgress.length,
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

      const submitted = normalized.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
      const sponsored = normalized.filter(b => b.approval_status === 'approved');
      const inProgress = normalized.filter(b => b.started_at && !b.completed_at);
      const shipped = normalized.filter(b => b.completed_at);
      const outcomes = shipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));

      fetchSummary({
        funnel: { submitted: submitted.length, sponsored: sponsored.length, inProgress: inProgress.length, shipped: shipped.length, outcomesRecorded: outcomes.length },
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

  const allSubmitted = bets.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
  const allSponsored = bets.filter(b => b.approval_status === 'approved');
  const allInProgress = bets.filter(b => b.started_at && !b.completed_at);
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

const leverStats = LEVERS.map(lever => ({
  lever,
  submitted: allSubmitted.filter(b => {
    const bd = typeof b.bet_data === 'string' ? JSON.parse(b.bet_data) : b.bet_data;
    return (b.lever || bd?.lever) === lever;
  }).length,
  sponsored: allSponsored.filter(b => {
    const bd = typeof b.bet_data === 'string' ? JSON.parse(b.bet_data) : b.bet_data;
    return (b.lever || bd?.lever) === lever;
  }).length,
  shipped: allShipped.filter(b => {
    const bd = typeof b.bet_data === 'string' ? JSON.parse(b.bet_data) : b.bet_data;
    return (b.lever || bd?.lever) === lever;
  }).length,
  outcomes: allOutcomes.filter(b => {
    const bd = typeof b.bet_data === 'string' ? JSON.parse(b.bet_data) : b.bet_data;
    return (b.lever || bd?.lever) === lever;
  }).length,
})).filter(s => s.submitted > 0);

  const visibleMembers = isAdmin ? members : members.filter(m => m.user_id === user?.id);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Stats</h1>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 32 }}>
        How your team is betting — and how those bets are landing.
      </p>

      {/* AI Summary */}
      <div style={{ marginBottom: 40, padding: '16px 20px', background: 'rgba(125,211,252,0.05)', border: '1px solid rgba(125,211,252,0.15)', borderRadius: 12, minHeight: 52, display: 'flex', alignItems: 'center' }}>
        {summaryLoading ? (
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Analyzing your data...</span>
        ) : summary ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{summary}</p>
        ) : null}
      </div>

      {/* Company Funnel */}
      <div style={{ marginBottom: 48 }}>
        <SectionLabel>Company Funnel</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
          <FunnelBlock label="Submitted" value={allSubmitted.length} color="#f1f5f9" />
          <FunnelBlock label="Sponsored" value={allSponsored.length} color="#a78bfa" />
          <FunnelBlock label="In Progress" value={allInProgress.length} color="#fbbf24" />
          <FunnelBlock label="Shipped" value={allShipped.length} color="#2dd4bf" />
          <FunnelBlock label="Outcome Recorded" value={allOutcomes.length} color="#22c55e" />
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
          <StatsTable
            rows={alignmentStats}
            renderLabel={s => (
              <>
                <StrategicAlignmentIcon alignment={s.alignment} />
                <span style={{ color: '#f1f5f9' }}>{ALIGNMENT_LABELS[s.alignment] || s.alignment}</span>
              </>
            )}
          />
        </div>
      )}

      {/* By Lever */}
      {leverStats.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <SectionLabel>By Lever</SectionLabel>
          <StatsTable
            rows={leverStats}
            renderLabel={s => (
              <>
                <LeverIcon lever={s.lever} />
                <span style={{ color: LEVER_COLORS[s.lever] || '#f1f5f9' }}>{s.lever}</span>
              </>
            )}
          />
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
            const isExpanded = expandedOutcomes[member.id];

            return (
              <div key={member.id} style={{
                background: isCurrentUser ? 'rgba(45,212,191,0.03)' : 'rgba(255,255,255,0.02)',
                border: isCurrentUser ? '1px solid rgba(45,212,191,0.15)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
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
                    <MiniStat label="Sponsored" value={stats.sponsored} color="#a78bfa" />
                    <MiniStat label="In Progress" value={stats.inProgress} color="#fbbf24" />
                    <MiniStat label="Shipped" value={stats.shipped} color="#2dd4bf" />
                    <MiniStat label="Outcome" value={stats.outcomesRecorded} color="#22c55e" />
                  </div>
                </div>

                {hasOutcomes && (
                  <>
                    <button
                      onClick={() => setExpandedOutcomes(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                      style={{ width: '100%', background: 'none', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '0.65rem' }}>{isExpanded ? '▼' : '▶'}</span>
                      {stats.outcomesRecorded} outcome{stats.outcomesRecorded !== 1 ? 's' : ''}
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '4px 24px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        {stats.outcomeBreakdown.succeeded > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>Succeeded</span>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>{stats.outcomeBreakdown.succeeded}</span>
                          </div>
                        )}
                        {stats.outcomeBreakdown.partial > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>Partial Win</span>
                            <span style={{ color: '#fbbf24', fontWeight: 600 }}>{stats.outcomeBreakdown.partial}</span>
                          </div>
                        )}
                        {stats.outcomeBreakdown.failed > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>Failed</span>
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>{stats.outcomeBreakdown.failed}</span>
                          </div>
                        )}
                        {stats.outcomeBreakdown.inconclusive > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Inconclusive / Never Shipped</span>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>{stats.outcomeBreakdown.inconclusive}</span>
                          </div>
                        )}
                      </div>
                    )}
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
