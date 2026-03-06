// TeamDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CompanySetup, PRODUCT_AREA_ARCHETYPES } from './CompanySetup';

const PRIORITY_CONFIG = {
  1: { label: 'P1', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  2: { label: 'P2', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
  3: { label: 'P3', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
};

function CompanyCard({ company, goals, isAdmin, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const productAreas = company.product_areas || [];
  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{company.name}</h3>
            {company.website && (
              <a href={`https://${company.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                style={{ color: '#475569', fontSize: '0.78rem', textDecoration: 'none' }}>
                {company.website.replace(/^https?:\/\//, '')} ↗
              </a>
            )}
          </div>

          {/* Product area pills */}
          {productAreas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {productAreas.map(area => {
                const archetype = PRODUCT_AREA_ARCHETYPES.find(a => a.id === area.archetypeId);
                return (
                  <span key={area.archetypeId} style={{ padding: '3px 10px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 20, color: '#2dd4bf', fontSize: '0.72rem', fontWeight: 500 }}>
                    {area.label}
                    {archetype && <span style={{ color: '#1e6e66', marginLeft: 4 }}>· {archetype.reach}</span>}
                  </span>
                );
              })}
            </div>
          )}

          {productAreas.length === 0 && (
            <span style={{ color: '#334155', fontSize: '0.8rem' }}>No product areas set</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {isAdmin && (
            <button onClick={() => onEdit(company)}
              style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Goals toggle */}
      <div style={{ padding: '10px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          Goals <span style={{ fontSize: '0.65rem' }}>{expanded ? '▼' : '▶'}</span>
        </button>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
          {company.context && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Context</div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{company.context}</p>
            </div>
          )}

          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Goals</div>
            {sortedGoals.length === 0 ? (
              <div style={{ color: '#334155', fontSize: '0.85rem' }}>No goals set — edit this company to add them.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedGoals.map(goal => {
                  const cfg = PRIORITY_CONFIG[goal.priority] || PRIORITY_CONFIG[3];
                  return (
                    <div key={goal.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                      <span style={{ padding: '3px 8px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 5, color: cfg.color, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{cfg.label}</span>
                      <div>
                        <div style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 500 }}>{goal.title}</div>
                        {goal.description && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 3 }}>{goal.description}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CompanyDashboard({ currentOrg, isAdmin }) {
  const { user } = useAuth();
  const [companies, setCompanies]     = useState([]);
  const [goalsByCompany, setGoalsByCompany] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading]         = useState(true);

  const [showCompanySetup, setShowCompanySetup] = useState(false);
  const [editingCompany, setEditingCompany]     = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  useEffect(() => { if (currentOrg?.orgId) fetchData(); }, [currentOrg?.orgId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: companiesData }, { data: goalsData }, { data: membersData }] = await Promise.all([
        supabase.from('companies').select('*').eq('org_id', currentOrg.orgId).order('created_at', { ascending: true }),
        supabase.from('company_goals').select('*').eq('org_id', currentOrg.orgId).order('priority', { ascending: true }),
        supabase.from('user_organizations').select('id, user_id, team_role, created_at, users:user_id (email)').eq('org_id', currentOrg.orgId).order('created_at', { ascending: true }),
      ]);

      setCompanies(companiesData || []);
      setTeamMembers(membersData || []);

      // Group goals by company_id
      const grouped = {};
      (goalsData || []).forEach(g => {
        if (!grouped[g.company_id]) grouped[g.company_id] = [];
        grouped[g.company_id].push(g);
      });
      setGoalsByCompany(grouped);
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySaved = (savedCompany) => {
    if (editingCompany) {
      setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
    } else {
      setCompanies([...companies, savedCompany]);
    }
    // Refresh goals for this company
    fetchData();
    setShowCompanySetup(false);
    setEditingCompany(null);
  };

  const handleRemoveMember = async (userOrgId) => {
    try {
      await supabase.from('user_organizations').delete().eq('id', userOrgId);
      setTeamMembers(teamMembers.filter(m => m.id !== userOrgId));
      setShowRemoveConfirm(null);
    } catch (err) { console.error('Error removing member:', err); }
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: '0 0 40px 0' }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Team</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Manage the companies your team places bets for — goals, product areas, and context all live here.
        </p>
      </div>

      {/* ── Companies ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 3px 0' }}>Companies</h2>
            <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>
              Bets, goals, and product areas are all scoped to a company.
            </p>
          </div>
          {isAdmin && companies.length < 10 && !showCompanySetup && (
            <button onClick={() => { setEditingCompany(null); setShowCompanySetup(true); }}
              style={{ padding: '8px 16px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 8, color: '#2dd4bf', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>
              + Add Company
            </button>
          )}
        </div>

        {/* Inline company setup form */}
        {showCompanySetup && (
          <div style={{ marginBottom: 20, padding: '24px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <CompanySetup
              orgId={currentOrg.orgId}
              existingCompany={editingCompany}
              onComplete={handleCompanySaved}
              onCancel={() => { setShowCompanySetup(false); setEditingCompany(null); }}
            />
          </div>
        )}

        {companies.length === 0 && !showCompanySetup ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <div style={{ color: '#475569', fontSize: '0.95rem', marginBottom: 6 }}>No companies yet.</div>
            <div style={{ color: '#334155', fontSize: '0.85rem', marginBottom: 20 }}>
              Add your first — even if that's your own company.
            </div>
            {isAdmin && (
              <button onClick={() => setShowCompanySetup(true)}
                style={{ padding: '10px 24px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 8, color: '#2dd4bf', fontSize: '0.9rem', cursor: 'pointer' }}>
                Add your first company →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {companies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                goals={goalsByCompany[company.id] || []}
                isAdmin={isAdmin}
                onEdit={(c) => { setEditingCompany(c); setShowCompanySetup(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Team Members ──────────────────────────────────────────────── */}
      <div>
        <h2 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Team Members</h2>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
          {teamMembers.length === 0 ? (
            <div style={{ padding: '24px', color: '#475569', fontSize: '0.85rem', textAlign: 'center' }}>No members yet.</div>
          ) : teamMembers.map((member, idx) => {
            const isCurrentUser = member.user_id === user?.id;
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
                  <button onClick={() => setShowRemoveConfirm(member.id)}
                    style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Remove member confirm ─────────────────────────────────────── */}
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

    </div>
  );
}

export default CompanyDashboard;
