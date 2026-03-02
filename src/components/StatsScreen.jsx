// StatsScreen.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const OUTCOME_STATUSES = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'];

function computeUserStats(bets, userId) {
  const submitted = bets.filter(b =>
    b.user_id === userId &&
    ['pending_approval', 'approved'].includes(b.approval_status)
  );
  const sponsoredByThem = bets.filter(b => b.sponsored_by === userId);
  const ofSubmittedSponsored = submitted.filter(b => b.approval_status === 'approved');
  const completed = submitted.filter(b => b.completed_at);
  const outcomesRecorded = completed.filter(b => OUTCOME_STATUSES.includes(b.status || b.outcome));
  const learnings = outcomesRecorded.filter(b => b.learned);

  const outcomeBreakdown = {
    succeeded: outcomesRecorded.filter(b => (b.status || b.outcome) === 'succeeded').length,
    partial: outcomesRecorded.filter(b => (b.status || b.outcome) === 'partial').length,
    failed: outcomesRecorded.filter(b => (b.status || b.outcome) === 'failed').length,
    inconclusive: outcomesRecorded.filter(b => ['inconclusive', 'never_shipped'].includes(b.status || b.outcome)).length,
  };

  return {
    submitted: submitted.length,
    ofSubmittedSponsored: ofSubmittedSponsored.length,
    sponsoredByThem: sponsoredByThem.length,
    completed: completed.length,
    outcomesRecorded: outcomesRecorded.length,
    learnings: learnings.length,
    outcomeBreakdown,
  };
}

function outcomeTag(breakdown) {
  const parts = [];
  if (breakdown.succeeded) parts.push({ label: `${breakdown.succeeded}S`, color: '#22c55e' });
  if (breakdown.partial) parts.push({ label: `${breakdown.partial}P`, color: '#fbbf24' });
  if (breakdown.failed) parts.push({ label: `${breakdown.failed}F`, color: '#ef4444' });
  if (breakdown.inconclusive) parts.push({ label: `${breakdown.inconclusive}I`, color: '#94a3b8' });
  return parts;
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '20px 24px',
      textAlign: 'center'
    }}>
      <div style={{ color: color || '#f1f5f9', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 60 }}>
      <div style={{ color: color || '#f1f5f9', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>
        {value === 0 ? '—' : value}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 4, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
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
          status: outcome?.status || null,
          outcome: outcome?.status || null,
          learned: outcome?.learned || null,
          completed_at: bet.completed_at || outcome?.recorded_at || null,
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

  // Company-wide aggregates
  const allSubmitted = bets.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
  const allSponsored = bets.filter(b => b.approval_status === 'approved');
  const allInProgress = bets.filter(b => b.started_at && !b.completed_at);
  const allCompleted = bets.filter(b => b.completed_at);
  const allOutcomes = allCompleted.filter(b => OUTCOME_STATUSES.includes(b.status || b.outcome));
  const allLearnings = allOutcomes.filter(b => b.learned);
  const companyBreakdown = {
    succeeded: allOutcomes.filter(b => (b.status || b.outcome) === 'succeeded').length,
    partial: allOutcomes.filter(b => (b.status || b.outcome) === 'partial').length,
    failed: allOutcomes.filter(b => (b.status || b.outcome) === 'failed').length,
    inconclusive: allOutcomes.filter(b => ['inconclusive', 'never_shipped'].includes(b.status || b.outcome)).length,
  };

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

      {/* Company aggregate */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Company Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 16 }}>
          <StatCard label="Submitted" value={allSubmitted.length} />
          <StatCard label="Sponsored" value={allSponsored.length} color="#a78bfa" />
          <StatCard label="In Progress" value={allInProgress.length} color="#fbbf24" />
          <StatCard label="Completed" value={allCompleted.length} color="#2dd4bf" />
          <StatCard label="Outcomes" value={allOutcomes.length} color="#22c55e" />
          <StatCard label="Learnings" value={allLearnings.length} color="#7dd3fc" />
        </div>
        {allOutcomes.length > 0 && (
          <div style={{
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            display: 'flex',
            gap: 24,
            fontSize: '0.85rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b' }}>Outcomes:</span>
            {companyBreakdown.succeeded > 0 && <span style={{ color: '#22c55e' }}>{companyBreakdown.succeeded} Succeeded</span>}
            {companyBreakdown.partial > 0 && <span style={{ color: '#fbbf24' }}>{companyBreakdown.partial} Partial</span>}
            {companyBreakdown.failed > 0 && <span style={{ color: '#ef4444' }}>{companyBreakdown.failed} Failed</span>}
            {companyBreakdown.inconclusive > 0 && <span style={{ color: '#94a3b8' }}>{companyBreakdown.inconclusive} Inconclusive</span>}
          </div>
        )}
      </div>

      {/* Per-user cards */}
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          {isAdmin ? 'By Team Member' : 'Your Stats'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleMembers.map(member => {
            const stats = computeUserStats(bets, member.user_id);
            const isCurrentUser = member.user_id === user?.id;
            const isAdminMember = member.team_role === 'admin';
            const outcomes = outcomeTag(stats.outcomeBreakdown);

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
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.users?.email || 'Unknown'}
                    {isCurrentUser && <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 6 }}>(you)</span>}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {isAdminMember ? 'Admin' : 'Member'}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

                {/* Stats */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                  <MiniStat label="Submitted" value={stats.submitted} />
                  <MiniStat label="Sponsored" value={stats.ofSubmittedSponsored} color="#a78bfa" />
                  {isAdminMember && (
                    <MiniStat label="Sponsored by Them" value={stats.sponsoredByThem} color="#7dd3fc" />
                  )}
                  <MiniStat label="Completed" value={stats.completed} color="#2dd4bf" />
                  <MiniStat label="Outcomes" value={stats.outcomesRecorded} color="#22c55e" />
                  <MiniStat label="Learnings" value={stats.learnings} color="#7dd3fc" />

                  {/* Outcome breakdown */}
                  {outcomes.length > 0 && (
                    <>
                      <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {outcomes.map((o, i) => (
                          <span key={i} style={{ color: o.color, fontSize: '0.85rem', fontWeight: 600 }}>
                            {o.label}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
