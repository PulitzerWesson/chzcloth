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
  if (breakdown.succeeded) parts.push(`${breakdown.succeeded}S`);
  if (breakdown.partial) parts.push(`${breakdown.partial}P`);
  if (breakdown.failed) parts.push(`${breakdown.failed}F`);
  if (breakdown.inconclusive) parts.push(`${breakdown.inconclusive}I`);
  return parts.length ? parts.join(' · ') : '—';
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

export function StatsScreen({ currentOrg, isAdmin }) {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [members, setMembers] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg?.orgId) return;
    fetchData();
  }, [currentOrg?.orgId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all org bets with outcomes
      const { data: betsData } = await supabase
        .from('bets')
        .select(`*, outcomes(*)`)
        .eq('org_id', currentOrg.orgId);

      // Normalize outcome status onto each bet
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

      // Fetch members with profiles
      const { data: membersData } = await supabase
        .from('user_organizations')
        .select(`id, user_id, team_role, profiles(email)`)
        .eq('org_id', currentOrg.orgId)
        .order('created_at', { ascending: true });

      setMembers(membersData || []);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#64748b', padding: 40 }}>Loading stats...</div>;
  }

  // Company-wide aggregates
  const allSubmitted = bets.filter(b => ['pending_approval', 'approved'].includes(b.approval_status));
  const allSponsored = bets.filter(b => b.approval_status === 'approved');
  const allInProgress = bets.filter(b => b.started_at && !b.completed_at);
  const allCompleted = bets.filter(b => b.completed_at);
  const allOutcomes = allCompleted.filter(b => OUTCOME_STATUSES.includes(b.status || b.outcome));
  const allLearnings = allOutcomes.filter(b => b.learned);
  const companyOutcomeBreakdown = {
    succeeded: allOutcomes.filter(b => (b.status || b.outcome) === 'succeeded').length,
    partial: allOutcomes.filter(b => (b.status || b.outcome) === 'partial').length,
    failed: allOutcomes.filter(b => (b.status || b.outcome) === 'failed').length,
    inconclusive: allOutcomes.filter(b => ['inconclusive', 'never_shipped'].includes(b.status || b.outcome)).length,
  };

  // Members to show — admin sees all, member sees only themselves
  const visibleMembers = isAdmin
    ? members
    : members.filter(m => m.user_id === user.id);

  const thCell = (label, width) => (
    <th style={{
      padding: '12px 16px',
      color: '#64748b',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: width || 'auto',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      {label}
    </th>
  );

  const tdCell = (content, color) => (
    <td style={{
      padding: '14px 16px',
      color: color || '#94a3b8',
      fontSize: '0.9rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      {content}
    </td>
  );

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
        <h2 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Company Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 16 }}>
          <StatCard label="Submitted" value={allSubmitted.length} />
          <StatCard label="Sponsored" value={allSponsored.length} color="#a78bfa" />
          <StatCard label="In Progress" value={allInProgress.length} color="#fbbf24" />
          <StatCard label="Completed" value={allCompleted.length} color="#2dd4bf" />
          <StatCard label="Outcomes Recorded" value={allOutcomes.length} color="#22c55e" />
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
            fontSize: '0.85rem'
          }}>
            <span style={{ color: '#64748b' }}>Outcomes:</span>
            {companyOutcomeBreakdown.succeeded > 0 && <span style={{ color: '#22c55e' }}>{companyOutcomeBreakdown.succeeded} Succeeded</span>}
            {companyOutcomeBreakdown.partial > 0 && <span style={{ color: '#fbbf24' }}>{companyOutcomeBreakdown.partial} Partial</span>}
            {companyOutcomeBreakdown.failed > 0 && <span style={{ color: '#ef4444' }}>{companyOutcomeBreakdown.failed} Failed</span>}
            {companyOutcomeBreakdown.inconclusive > 0 && <span style={{ color: '#94a3b8' }}>{companyOutcomeBreakdown.inconclusive} Inconclusive</span>}
          </div>
        )}
      </div>

      {/* Per-user table */}
      <div>
        <h2 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          {isAdmin ? 'By Team Member' : 'Your Stats'}
        </h2>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {thCell('Member')}
                {thCell('Role')}
                {thCell('Submitted')}
                {thCell('Of Those, Sponsored')}
                {isAdmin && thCell('Sponsored by Them')}
                {thCell('Completed')}
                {thCell('Outcomes')}
                {thCell('Outcomes Breakdown')}
                {thCell('Learnings')}
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map(member => {
                const stats = computeUserStats(bets, member.user_id);
                const isCurrentUser = member.user_id === user.id;
                const isAdminMember = member.team_role === 'admin';
                return (
                  <tr key={member.id} style={{ background: isCurrentUser ? 'rgba(45,212,191,0.03)' : 'transparent' }}>
                    {tdCell(
                      <span>
                        {member.profiles?.email || 'Unknown'}
                        {isCurrentUser && <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: 6 }}>(you)</span>}
                      </span>,
                      '#f1f5f9'
                    )}
                    {tdCell(isAdminMember ? 'Admin' : 'Member')}
                    {tdCell(stats.submitted || '—')}
                    {tdCell(stats.submitted > 0 ? stats.ofSubmittedSponsored : '—')}
                    {isAdmin && tdCell(isAdminMember ? (stats.sponsoredByThem || '—') : 'N/A')}
                    {tdCell(stats.completed || '—')}
                    {tdCell(stats.outcomesRecorded || '—')}
                    {tdCell(outcomeTag(stats.outcomeBreakdown))}
                    {tdCell(stats.learnings || '—')}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
