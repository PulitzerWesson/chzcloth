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
        .select(`
          id,
          user_id,
          team_role,
          users:user_id (email)
        `)
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
    return (
      <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>
        Loading stats...
      </div>
    );
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

  const thStyle = {
    padding: '12px 16px',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)'
  };

  const tdStyle = {
    padding: '14px 16px',
    color: '#94a3b8',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255,255,255,0.04)'
  };

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
        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
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
            flexWrap: 'wrap'
          }}>
            <span style={{ color: '#64748b' }}>Outcomes:</span>
            {companyBreakdown.succeeded > 0 && <span style={{ color: '#22c55e' }}>{companyBreakdown.succeeded} Succeeded</span>}
            {companyBreakdown.partial > 0 && <span style={{ color: '#fbbf24' }}>{companyBreakdown.partial} Partial</span>}
            {companyBreakdown.failed > 0 && <span style={{ color: '#ef4444' }}>{companyBreakdown.failed} Failed</span>}
            {companyBreakdown.inconclusive > 0 && <span style={{ color: '#94a3b8' }}>{companyBreakdown.inconclusive} Inconclusive</span>}
          </div>
        )}
      </div>

      {/* Per-user table */}
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          {isAdmin ? 'By Team Member' : 'Your Stats'}
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          overflow: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Member</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Submitted</th>
                <th style={thStyle}>Of Those, Sponsored</th>
                {isAdmin && <th style={thStyle}>Sponsored by Them</th>}
                <th style={thStyle}>Completed</th>
                <th style={thStyle}>Outcomes</th>
                <th style={thStyle}>Breakdown</th>
                <th style={thStyle}>Learnings</th>
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map(member => {
                const stats = computeUserStats(bets, member.user_id);
                const isCurrentUser = member.user_id === user?.id;
                const isAdminMember = member.team_role === 'admin';
                return (
                  <tr
                    key={member.id}
                    style={{ background: isCurrentUser ? 'rgba(45,212,191,0.03)' : 'transparent' }}
                  >
                    <td style={{ ...tdStyle, color: '#f1f5f9' }}>
                      {member.users?.email || 'Unknown'}
                      {isCurrentUser && <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: 6 }}>(you)</span>}
                    </td>
                    <td style={tdStyle}>{isAdminMember ? 'Admin' : 'Member'}</td>
                    <td style={tdStyle}>{stats.submitted || '—'}</td>
                    <td style={tdStyle}>{stats.submitted > 0 ? (stats.ofSubmittedSponsored || '—') : '—'}</td>
                    {isAdmin && (
                      <td style={tdStyle}>{isAdminMember ? (stats.sponsoredByThem || '—') : 'N/A'}</td>
                    )}
                    <td style={tdStyle}>{stats.completed || '—'}</td>
                    <td style={tdStyle}>{stats.outcomesRecorded || '—'}</td>
                    <td style={tdStyle}>{outcomeTag(stats.outcomeBreakdown)}</td>
                    <td style={tdStyle}>{stats.learnings || '—'}</td>
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
