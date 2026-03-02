// StatsScreen.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const OUTCOME_STATUSES = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'];

function avgDays(pairs) {
  const valid = pairs.filter(([a, b]) => a && b);
  if (!valid.length) return null;
  const total = valid.reduce((sum, [a, b]) => sum + (new Date(b) - new Date(a)), 0);
  return Math.round(total / valid.length / (1000 * 60 * 60 * 24));
}

function pct(num, denom) {
  if (!denom) return '—';
  return Math.round((num / denom) * 100) + '%';
}

function FunnelStep({ label, value, conversion, isLast }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '20px 16px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
          {value}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</div>
        {conversion && (
          <div style={{ color: '#2dd4bf', fontSize: '0.75rem', marginTop: 6, fontWeight: 600 }}>
            {conversion} conversion
          </div>
        )}
      </div>
      {!isLast && (
        <div style={{ color: '#334155', fontSize: '1.2rem', padding: '0 8px', flexShrink: 0 }}>→</div>
      )}
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
  const submitted = bets.filter(b =>
    b.user_id === userId &&
    ['pending_approval', 'approved'].includes(b.approval_status)
  );
  const sponsored = submitted.filter(b => b.approval_status === 'approved');
  const shipped = submitted.filter(b => b.completed_at);
  const outcomesRecorded = shipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));

  const outcomeBreakdown = {
    succeeded: outcomesRecorded.filter(b => b.outcome === 'succeeded').length,
    partial: outcomesRecorded.filter(b => b.outcome === 'partial').length,
    failed: outcomesRecorded.filter(b => b.outcome === 'failed').length,
    inconclusive: outcomesRecorded.filter(b => ['inconclusive', 'never_shipped'].includes(b.outcome)).length,
  };

  return { submitted: submitted.length, sponsored: sponsored.length, shipped: shipped.length, outcomesRecorded: outcomesRecorded.length, outcomeBreakdown };
}

function outcomeChips(breakdown) {
  const chips = [];
  if (breakdown.succeeded) chips.push({ label: `${breakdown.succeeded}S`, color: '#22c55e' });
  if (breakdown.partial) chips.push({ label: `${breakdown.partial}P`, color: '#fbbf24' });
  if (breakdown.failed) chips.push({ label: `${breakdown.failed}F`, color: '#ef4444' });
  if (breakdown.inconclusive) chips.push({ label: `${breakdown.inconclusive}I`, color: '#94a3b8' });
  return chips;
}

export function StatsScreen({ currentOrg, isAdmin }) {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg?.orgId) return;
    fetchData();
  }, [currentOrg?.orgId]);

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
        return {
          ...bet,
          outcome: outcome?.status || null,
          completed_at: bet.completed_at || null,
        };
      });
      setBets(normalized);

      const { data: membersData, error: membersError } = await supabase
        .from('user_organizations')
        .select(`id, user_id, team_role, users:user_id (email)`)
        .eq('org_id', currentOrg.orgId)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading stats...</div>;
  }

  // Company funnel
  const allSubmitted = bets.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
  const allSponsored = bets.filter(b => b.approval_status === 'approved');
  const allShipped = bets.filter(b => b.completed_at);
  const allOutcomes = allShipped.filter(b => OUTCOME_STATUSES.includes(b.outcome));

  // Avg time calculations
  const avgSubmitToSponsored = avgDays(
    allSponsored.map(b => [b.created_at, b.approved_at])
  );
  const avgSponsoredToShipped = avgDays(
    allShipped.filter(b => b.approved_at).map(b => [b.approved_at, b.completed_at])
  );

  const visibleMembers = isAdmin
    ? members
    : members.filter(m => m.user_id === user?.id);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
        Stats
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 32 }}>
        How your team is betting — and how those bets are landing.
      </p>

      {/* Company funnel */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Company Funnel
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 16 }}>
          <FunnelStep label="Submitted" value={allSubmitted.length} />
          <FunnelStep label="Sponsored" value={allSponsored.length} conversion={pct(allSponsored.length, allSubmitted.length)} />
          <FunnelStep label="Shipped" value={allShipped.length} conversion={pct(allShipped.length, allSponsored.length)} />
          <FunnelStep label="Outcome Recorded" value={allOutcomes.length} conversion={pct(allOutcomes.length, allShipped.length)} isLast />
        </div>

        {/* Avg time row */}
        {(avgSubmitToSponsored || avgSponsoredToShipped) && (
          <div style={{
            display: 'flex',
            gap: 24,
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            fontSize: '0.85rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ color: '#64748b' }}>Avg time:</span>
            {avgSubmitToSponsored && (
              <span style={{ color: '#94a3b8' }}>
                Submitted → Sponsored: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{avgSubmitToSponsored}d</span>
              </span>
            )}
            {avgSponsoredToShipped && (
              <span style={{ color: '#94a3b8' }}>
                Sponsored → Shipped: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{avgSponsoredToShipped}d</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Per-user cards */}
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          {isAdmin ? 'By Team Member' : 'Your Stats'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleMembers.map(member => {
            const stats = computeUserStats(bets, member.user_id);
            const isCurrentUser = member.user_id === user?.id;
            const isAdminMember = member.team_role === 'admin';
            const chips = outcomeChips(stats.outcomeBreakdown);

            return (
              <div
                key={member.id}
                style={{
                  background: isCurrentUser ? 'rgba(45,212,191,0.03)' : 'rgba(255,255,255,0.02)',
                  border: isCurrentUser ? '1px solid rgba(45,212,191,0.15)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  flexWrap: 'wrap'
                }}
              >
                {/* Member info */}
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <div style={{
                    color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem', marginBottom: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {member.users?.email || 'Unknown'}
                    {isCurrentUser && <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 6 }}>(you)</span>}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {isAdminMember ? 'Admin' : 'Member'}
                  </div>
                </div>

                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

                {/* Personal funnel */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <MiniStat label="Submitted" value={stats.submitted} />
                  <span style={{ color: '#334155', fontSize: '0.9rem' }}>→</span>
                  <MiniStat label="Sponsored" value={stats.sponsored} color="#a78bfa" />
                  <span style={{ color: '#334155', fontSize: '0.9rem' }}>→</span>
                  <MiniStat label="Shipped" value={stats.shipped} color="#2dd4bf" />
                  <span style={{ color: '#334155', fontSize: '0.9rem' }}>→</span>
                  <MiniStat label="Outcome" value={stats.outcomesRecorded} color="#22c55e" />
                </div>

                {/* Outcome breakdown */}
                {chips.length > 0 && (
                  <>
                    <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {chips.map((c, i) => (
                        <span key={i} style={{
                          color: c.color,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          background: c.color + '18',
                          padding: '3px 8px',
                          borderRadius: 6
                        }}>
                          {c.label}
                        </span>
                      ))}
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
