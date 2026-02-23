// CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export function CompanyDashboard({ currentOrg, isAdmin }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timePeriod, setTimePeriod] = useState({ period: 'q1', year: 2026 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  // Fetch goals and team members
  useEffect(() => {
    if (!currentOrg?.orgId) return;
    fetchData();
  }, [currentOrg?.orgId, timePeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch goals for selected time period
      const { data: goalsData } = await supabase
        .from('company_goals')
        .select('*')
        .eq('org_id', currentOrg.orgId)
        .eq('time_period', timePeriod.period)
        .eq('year', timePeriod.year)
        .order('priority', { ascending: true });

      setGoals(goalsData || []);

      // Fetch team members
      const { data: membersData } = await supabase
        .from('user_organizations')
        .select(`
          id,
          user_id,
          team_role,
          created_at,
          users:user_id (
            email
          )
        `)
        .eq('org_id', currentOrg.orgId)
        .order('created_at', { ascending: true });

      setTeamMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await supabase
        .from('company_goals')
        .delete()
        .eq('id', goalId);

      setGoals(goals.filter(g => g.id !== goalId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleRemoveMember = async (userOrgId) => {
    try {
      await supabase
        .from('user_organizations')
        .delete()
        .eq('id', userOrgId);

      setTeamMembers(teamMembers.filter(m => m.id !== userOrgId));
      setShowRemoveConfirm(null);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowEditModal(true);
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowEditModal(true);
  };

  if (loading) {
    return <div style={{ color: '#94a3b8', padding: 40 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '0 40px 40px 40px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 32
      }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>
          Company Dashboard
        </h1>
      </div>

      {/* Goals Section */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }}>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>
            Company Goals
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Time Period Selector */}
            <select
              value={`${timePeriod.period}-${timePeriod.year}`}
              onChange={(e) => {
                const [period, year] = e.target.value.split('-');
                setTimePeriod({ period, year: parseInt(year) });
              }}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="q1-2026">Q1 2026</option>
              <option value="q2-2026">Q2 2026</option>
              <option value="q3-2026">Q3 2026</option>
              <option value="q4-2026">Q4 2026</option>
              <option value="q1-2027">Q1 2027</option>
              <option value="q2-2027">Q2 2027</option>
              <option value="q3-2027">Q3 2027</option>
              <option value="q4-2027">Q4 2027</option>
            </select>

            {isAdmin && (
              <button
                onClick={handleAddGoal}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(45, 212, 191, 0.1)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: 8,
                  color: '#2dd4bf',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                + Add Goal
              </button>
            )}
          </div>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            color: '#64748b'
          }}>
            No goals set for {timePeriod.period.toUpperCase()} {timePeriod.year}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {goals.map((goal, idx) => {
              const kpis = typeof goal.kpis === 'string' ? JSON.parse(goal.kpis) : (goal.kpis || []);
              const priorityColors = {
                1: '#ef4444', // red for P1
                2: '#fbbf24', // yellow for P2
                3: '#3b82f6'  // blue for P3
              };

              return (
                <div
                  key={goal.id}
                  style={{
                    padding: 24,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{
                          background: priorityColors[goal.priority] || '#64748b',
                          color: '#0f172a',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          P{goal.priority}
                        </span>
                        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                          {goal.title}
                        </h3>
                      </div>
                      {goal.description && (
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>
                          {goal.description}
                        </p>
                      )}
                    </div>

                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleEditGoal(goal)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 6,
                            color: '#94a3b8',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(goal.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 6,
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* KPIs */}
                  {kpis.length > 0 && (
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 8, fontWeight: 600 }}>
                        KEY METRICS:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {kpis.map((kpi, kpiIdx) => (
                          <div key={kpiIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#2dd4bf', fontSize: '0.9rem' }}>•</span>
                            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                              <strong>{kpi.metric}:</strong> {kpi.baseline} → {kpi.target}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Members Section */}
      <div>
        <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 600, marginBottom: 24 }}>
          Team Members
        </h2>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          {teamMembers.map((member, idx) => {
            const isCurrentUser = member.user_id === user.id;
            return (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: idx < teamMembers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}
              >
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 500, marginBottom: 4 }}>
                    {member.users?.email || 'Unknown'}
                    {isCurrentUser && (
                      <span style={{ color: '#64748b', marginLeft: 8 }}>(you)</span>
                    )}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {member.team_role === 'admin' ? 'Admin' : 'Member'}
                  </div>
                </div>

                {isAdmin && !isCurrentUser && (
                  <button
                    onClick={() => setShowRemoveConfirm(member.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 6,
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Goal Confirmation */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 32,
            maxWidth: 400,
            width: '90%'
          }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: 12, fontSize: '1.2rem' }}>
              Delete Goal?
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
              This will permanently delete this goal. Any bets aligned to this goal will lose their alignment.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGoal(showDeleteConfirm)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      {showRemoveConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 32,
            maxWidth: 400,
            width: '90%'
          }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: 12, fontSize: '1.2rem' }}>
              Remove Team Member?
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
              This person will lose access to this company and all its data.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowRemoveConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveConfirm)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Goal Modal - TODO: Implement this next */}
      {showEditModal && (
        <div style={{ color: '#94a3b8', padding: 40 }}>
          Edit modal coming next...
        </div>
      )}
    </div>
  );
}

export default CompanyDashboard;
