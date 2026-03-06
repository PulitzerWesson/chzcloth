// CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const GOAL_CATEGORIES = [
  { value: 'growth',    label: 'Growth',                color: '#22c55e',  bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  { value: 'customer',  label: 'Customer Satisfaction', color: '#2dd4bf',  bg: 'rgba(45,212,191,0.12)',  border: 'rgba(45,212,191,0.3)' },
  { value: 'ops',       label: 'Operations',            color: '#7dd3fc',  bg: 'rgba(125,211,252,0.12)', border: 'rgba(125,211,252,0.3)' },
];

const PRIORITY_CONFIG = {
  1: { label: 'P1', desc: 'Must-hit',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)' },
  2: { label: 'P2', desc: 'Important', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)' },
  3: { label: 'P3', desc: 'Stretch',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)' },
};

function GoalEditForm({ goal, currentOrg, existingGoals, onSave, onCancel }) {
  const [title, setTitle]             = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [category, setCategory]       = useState(goal?.category || '');
  const [priority, setPriority]       = useState(goal?.priority || 1);
  const [saving, setSaving]           = useState(false);

  const takenPriorities = existingGoals
    .filter(g => !goal || g.id !== goal.id)
    .map(g => g.priority);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const goalData = {
        org_id: currentOrg.orgId,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        priority,
        kpis: [],
      };
      if (goal) {
        const { data, error } = await supabase.from('company_goals').update(goalData).eq('id', goal.id).select().single();
        if (error) throw error;
        onSave(data);
      } else {
        const { data, error } = await supabase.from('company_goals').insert(goalData).select().single();
        if (error) throw error;
        onSave(data);
      }
    } catch (err) {
      console.error('Error saving goal:', err);
      alert('Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[1, 2, 3].map(p => {
            const cfg = PRIORITY_CONFIG[p];
            const taken = takenPriorities.includes(p);
            const active = priority === p;
            return (
              <button key={p} onClick={() => !taken && setPriority(p)} disabled={taken}
                style={{ padding: '14px 12px', background: active ? cfg.bg : taken ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? cfg.border : taken ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, cursor: taken ? 'not-allowed' : 'pointer', opacity: taken ? 0.4 : 1, transition: 'all 0.15s', textAlign: 'center' }}>
                <div style={{ color: active ? cfg.color : '#94a3b8', fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>{cfg.label}</div>
                <div style={{ color: active ? cfg.color : '#475569', fontSize: '0.75rem' }}>{taken ? 'In use' : cfg.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal <span style={{ color: '#ef4444' }}>*</span></label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Reach $200K MRR by end of Q1" style={inputStyle} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {GOAL_CATEGORIES.map(cat => {
            const active = category === cat.value;
            return (
              <button key={cat.value} onClick={() => setCategory(active ? '' : cat.value)}
                style={{ padding: '7px 14px', background: active ? cat.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? cat.border : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, color: active ? cat.color : '#64748b', fontSize: '0.82rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Context <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Why this matters, what's driving it, how you'll get there..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
        <div style={{ color: '#334155', fontSize: '0.78rem', marginTop: 6 }}>Used when scoring bets for strategic fit.</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} disabled={saving} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !title.trim()} style={{ flex: 2, padding: '12px', background: (!title.trim() || saving) ? 'rgba(45,212,191,0.25)' : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 600, cursor: (!title.trim() || saving) ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}>
          {saving ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </div>
  );
}

function GoalCard({ goal, isAdmin, onEdit, onDelete }) {
  const pCfg = PRIORITY_CONFIG[goal.priority] || PRIORITY_CONFIG[3];
  const cat  = GOAL_CATEGORIES.find(c => c.value === goal.category);
  return (
    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
          <div style={{ padding: '5px 10px', background: pCfg.bg, border: `1px solid ${pCfg.border}`, borderRadius: 6, color: pCfg.color, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{pCfg.label}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: goal.description ? 6 : 0 }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{goal.title}</h3>
              {cat && <span style={{ padding: '2px 8px', background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 20, color: cat.color, fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>{cat.label}</span>}
            </div>
            {goal.description && <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{goal.description}</p>}
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(goal)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
            <button onClick={() => onDelete(goal.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer' }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CompanyDashboard({ currentOrg, isAdmin }) {
  const { user } = useAuth();
  const [goals, setGoals]             = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showEditModal, setShowEditModal]         = useState(false);
  const [editingGoal, setEditingGoal]             = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  useEffect(() => { if (!currentOrg?.orgId) return; fetchData(); }, [currentOrg?.orgId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: goalsData }   = await supabase.from('company_goals').select('*').eq('org_id', currentOrg.orgId).order('priority', { ascending: true });
      const { data: membersData } = await supabase.from('user_organizations').select('id, user_id, team_role, created_at, users:user_id (email)').eq('org_id', currentOrg.orgId).order('created_at', { ascending: true });
      setGoals(goalsData || []);
      setTeamMembers(membersData || []);
    } catch (err) { console.error('Error fetching data:', err); }
    finally { setLoading(false); }
  };

  const handleDeleteGoal = async (goalId) => {
    try { await supabase.from('company_goals').delete().eq('id', goalId); setGoals(goals.filter(g => g.id !== goalId)); setShowDeleteConfirm(null); }
    catch (err) { console.error('Error deleting goal:', err); }
  };

  const handleRemoveMember = async (userOrgId) => {
    try { await supabase.from('user_organizations').delete().eq('id', userOrgId); setTeamMembers(teamMembers.filter(m => m.id !== userOrgId)); setShowRemoveConfirm(null); }
    catch (err) { console.error('Error removing member:', err); }
  };

  const canAddGoal  = goals.length < 3;
  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);
  const orgName     = currentOrg?.name || 'Team';

  if (loading && goals.length === 0 && teamMembers.length === 0) return <div style={{ color: '#94a3b8', padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: '0 0 40px 0' }}>

      <div style={{ marginBottom: 8 }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Team Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Set up to 3 goals for your team. Every bet gets scored against these — keep them honest and current.
        </p>
      </div>

      <div style={{ marginBottom: 48, marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 4px 0' }}>{orgName} Goals</h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>Living goals — update them as strategy shifts.</p>
          </div>
          {isAdmin && canAddGoal && (
            <button onClick={() => { setEditingGoal(null); setShowEditModal(true); }} style={{ padding: '8px 16px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 8, color: '#2dd4bf', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
              + Add Goal
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, marginTop: 16 }}>
          {[1, 2, 3].map(p => {
            const cfg  = PRIORITY_CONFIG[p];
            const goal = sortedGoals.find(g => g.priority === p);
            return (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: goal ? 1 : 0.35 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: goal ? `0 0 6px ${cfg.color}` : 'none' }} />
                <span style={{ color: goal ? cfg.color : '#475569', fontSize: '0.78rem', fontWeight: 600 }}>{cfg.label}</span>
                <span style={{ color: '#475569', fontSize: '0.78rem' }}>{cfg.desc}</span>
              </div>
            );
          })}
        </div>

        {sortedGoals.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <div style={{ color: '#475569', marginBottom: 12 }}>No goals set yet.</div>
            {isAdmin && <button onClick={() => { setEditingGoal(null); setShowEditModal(true); }} style={{ padding: '10px 20px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 8, color: '#2dd4bf', fontSize: '0.9rem', cursor: 'pointer' }}>Set your first goal →</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} isAdmin={isAdmin} onEdit={(g) => { setEditingGoal(g); setShowEditModal(true); }} onDelete={(id) => setShowDeleteConfirm(id)} />
            ))}
            {isAdmin && canAddGoal && sortedGoals.length > 0 && (
              <div onClick={() => { setEditingGoal(null); setShowEditModal(true); }}
                style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 12, color: '#334155', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.2)'; e.currentTarget.style.color = '#2dd4bf'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#334155'; }}>
                + Add {3 - sortedGoals.length} more goal{3 - sortedGoals.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 600, marginBottom: 16 }}>Team Members</h2>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
          {teamMembers.map((member, idx) => {
            const isCurrentUser = member.user_id === user.id;
            return (
              <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: idx < teamMembers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 500, marginBottom: 2, fontSize: '0.95rem' }}>
                    {member.users?.email || 'Unknown'}
                    {isCurrentUser && <span style={{ color: '#475569', marginLeft: 8, fontWeight: 400, fontSize: '0.85rem' }}>(you)</span>}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.8rem' }}>Full access</div>
                </div>
                {isAdmin && !isCurrentUser && (
                  <button onClick={() => setShowRemoveConfirm(member.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer' }}>Remove</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: 12, fontSize: '1.2rem' }}>Delete Goal?</h3>
            <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6, fontSize: '0.9rem' }}>This will permanently delete this goal. Bets that referenced it retain their scoring but lose the goal link.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={() => handleDeleteGoal(showDeleteConfirm)} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: 12, fontSize: '1.2rem' }}>Remove Team Member?</h3>
            <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6, fontSize: '0.9rem' }}>This person will lose access to this team and all its data.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowRemoveConfirm(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={() => handleRemoveMember(showRemoveConfirm)} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px 24px', maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => { setShowEditModal(false); setEditingGoal(null); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}>✕</button>
            </div>
            <GoalEditForm
              goal={editingGoal}
              currentOrg={currentOrg}
              existingGoals={goals}
              onSave={(savedGoal) => {
                if (editingGoal) { setGoals(goals.map(g => g.id === savedGoal.id ? savedGoal : g)); }
                else { setGoals([...goals, savedGoal]); }
                setShowEditModal(false); setEditingGoal(null);
              }}
              onCancel={() => { setShowEditModal(false); setEditingGoal(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyDashboard;
