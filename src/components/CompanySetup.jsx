import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// ── Product area archetypes ───────────────────────────────────────────────────
export const PRODUCT_AREA_ARCHETYPES = [
  { id: 'core',         label: 'Core Product',              desc: 'Primary product experience, daily active users',   reach: 90 },
  { id: 'monetization', label: 'Checkout / Monetization',   desc: 'Purchase flows, billing, upgrades',                reach: 80 },
  { id: 'acquisition',  label: 'Acquisition / Marketing',   desc: 'Marketing site, ads, SEO, new visitor flows',      reach: 75 },
  { id: 'platform',     label: 'Platform / Infrastructure', desc: 'APIs, integrations, developer-facing surfaces',    reach: 70 },
  { id: 'onboarding',   label: 'Onboarding',                desc: 'New user activation, trial flows',                 reach: 65 },
  { id: 'admin',        label: 'Admin / Ops',               desc: 'Internal tools, dashboards, ops-facing surfaces',  reach: 40 },
];

export const ARCHETYPE_REACH = Object.fromEntries(
  PRODUCT_AREA_ARCHETYPES.map(a => [a.id, a.reach])
);

const PRIORITY_CONFIG = {
  1: { label: 'P1', desc: 'Must-hit',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)' },
  2: { label: 'P2', desc: 'Important', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)' },
  3: { label: 'P3', desc: 'Stretch',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)' },
};

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, color: '#f1f5f9', fontSize: '0.95rem',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

// ── Step 1: Name + website ────────────────────────────────────────────────────
function StepBasics({ data, onChange }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
        Add a company
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 28, lineHeight: 1.6 }}>
        This could be a client, or your own company if your team builds internally.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Company name *</label>
        <input type="text" value={data.name} onChange={e => onChange('name', e.target.value)}
          placeholder="e.g., Acme Corp, Finn Consulting, My Startup" autoFocus style={inputStyle} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Website <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
        </label>
        <input type="text" value={data.website} onChange={e => onChange('website', e.target.value)}
          placeholder="company.com" style={inputStyle} />
      </div>

      <div>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Context <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
        </label>
        <textarea value={data.context} onChange={e => onChange('context', e.target.value)}
          placeholder="Business model, stage, strategic priorities — used when scoring bets for fit."
          rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
      </div>
    </div>
  );
}

// ── Step 2: Product areas ─────────────────────────────────────────────────────
function StepProductAreas({ areas, onChange }) {
  const toggleArea = (archetypeId) => {
    const exists = areas.find(a => a.archetypeId === archetypeId);
    if (exists) {
      onChange(areas.filter(a => a.archetypeId !== archetypeId));
    } else {
      const archetype = PRODUCT_AREA_ARCHETYPES.find(a => a.id === archetypeId);
      onChange([...areas, { archetypeId, label: archetype.label }]);
    }
  };

  const updateLabel = (archetypeId, label) => {
    onChange(areas.map(a => a.archetypeId === archetypeId ? { ...a, label } : a));
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
        Which product areas does your team work on?
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 8, lineHeight: 1.6 }}>
        Select all that apply. These define where bets land — and drive the reach component of the priority score.
      </p>
      <p style={{ color: '#475569', fontSize: '0.82rem', marginBottom: 24, lineHeight: 1.5 }}>
        Rename any area to match your own terminology after selecting it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PRODUCT_AREA_ARCHETYPES.map(archetype => {
          const selected = areas.find(a => a.archetypeId === archetype.id);
          return (
            <div key={archetype.id}>
              <button
                onClick={() => toggleArea(archetype.id)}
                style={{
                  width: '100%', padding: '14px 16px', textAlign: 'left',
                  background: selected ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? 'rgba(45,212,191,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: selected ? '10px 10px 0 0' : 10,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                <div>
                  <div style={{ color: selected ? '#f1f5f9' : '#94a3b8', fontSize: '0.95rem', fontWeight: selected ? 600 : 400, marginBottom: 2 }}>
                    {archetype.label}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.78rem' }}>{archetype.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ color: '#334155', fontSize: '0.72rem', fontWeight: 600 }}>reach {archetype.reach}</span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: selected ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${selected ? '#2dd4bf' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf' }} />}
                  </div>
                </div>
              </button>

              {/* Custom label input — shown when selected */}
              {selected && (
                <div style={{ padding: '10px 16px 12px', background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.2)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                  <label style={{ display: 'block', color: '#2dd4bf', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    What do you call this?
                  </label>
                  <input
                    type="text"
                    value={selected.label}
                    onChange={e => updateLabel(archetype.id, e.target.value)}
                    placeholder={archetype.label}
                    style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.88rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(45,212,191,0.2)' }}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 3: Goals ─────────────────────────────────────────────────────────────
function StepGoals({ goals, onChange }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [draftGoal, setDraftGoal] = useState({ title: '', description: '', priority: null });

  const takenPriorities = goals.map(g => g.priority);

  const startAdd = () => {
    const available = [1, 2, 3].find(p => !takenPriorities.includes(p));
    setDraftGoal({ title: '', description: '', priority: available || null });
    setEditingIdx('new');
  };

  const saveGoal = () => {
    if (!draftGoal.title.trim() || !draftGoal.priority) return;
    if (editingIdx === 'new') {
      onChange([...goals, { ...draftGoal, title: draftGoal.title.trim() }]);
    } else {
      onChange(goals.map((g, i) => i === editingIdx ? { ...draftGoal, title: draftGoal.title.trim() } : g));
    }
    setEditingIdx(null);
  };

  const deleteGoal = (idx) => onChange(goals.filter((_, i) => i !== idx));

  const canAdd = goals.length < 3 && editingIdx === null;

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
        What is this company trying to achieve?
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 8, lineHeight: 1.6 }}>
        Set up to 3 goals — P1 is the must-hit, P2 is important, P3 is a stretch. Every bet gets scored on how directly it moves one of these. Vague goals produce vague scoring.
      </p>
      <p style={{ color: '#475569', fontSize: '0.82rem', marginBottom: 24 }}>
        You can skip this and add goals later from the Team tab.
      </p>

      {/* Existing goals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {goals.map((goal, idx) => {
          const cfg = PRIORITY_CONFIG[goal.priority];
          if (editingIdx === idx) {
            return <GoalForm key={idx} draft={draftGoal} onChange={setDraftGoal} takenPriorities={goals.filter((_, i) => i !== idx).map(g => g.priority)} onSave={saveGoal} onCancel={() => setEditingIdx(null)} />;
          }
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
              <span style={{ padding: '3px 8px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 5, color: cfg.color, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{cfg.label}</span>
              <span style={{ color: '#f1f5f9', fontSize: '0.9rem', flex: 1 }}>{goal.title}</span>
              <button onClick={() => { setDraftGoal({ ...goal }); setEditingIdx(idx); }} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
              <button onClick={() => deleteGoal(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
            </div>
          );
        })}
      </div>

      {/* New goal form */}
      {editingIdx === 'new' && (
        <GoalForm draft={draftGoal} onChange={setDraftGoal} takenPriorities={takenPriorities} onSave={saveGoal} onCancel={() => setEditingIdx(null)} />
      )}

      {canAdd && (
        <button onClick={startAdd}
          style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10, color: '#475569', fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.25)'; e.currentTarget.style.color = '#2dd4bf'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#475569'; }}>
          + Add {goals.length === 0 ? 'a goal' : 'another goal'}
        </button>
      )}
    </div>
  );
}

function GoalForm({ draft, onChange, takenPriorities, onSave, onCancel }) {
  return (
    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Priority</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[1, 2, 3].map(p => {
            const cfg = PRIORITY_CONFIG[p];
            const taken = takenPriorities.includes(p);
            const active = draft.priority === p;
            return (
              <button key={p} onClick={() => !taken && onChange({ ...draft, priority: p })} disabled={taken}
                style={{ padding: '10px', background: active ? cfg.bg : taken ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? cfg.border : taken ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: taken ? 'not-allowed' : 'pointer', opacity: taken ? 0.35 : 1, textAlign: 'center' }}>
                <div style={{ color: active ? cfg.color : '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>{cfg.label}</div>
                <div style={{ color: active ? cfg.color : '#475569', fontSize: '0.7rem' }}>{taken ? 'In use' : cfg.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
      <input type="text" value={draft.title} onChange={e => onChange({ ...draft, title: e.target.value })}
        placeholder="e.g., Reach $200K MRR by end of Q1" style={{ ...inputStyle, marginBottom: 10 }} autoFocus />
      <textarea value={draft.description} onChange={e => onChange({ ...draft, description: e.target.value })}
        placeholder="Context — why this matters, what's driving it (used when scoring bets)" rows={2}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
        <button onClick={onSave} disabled={!draft.title.trim() || !draft.priority}
          style={{ padding: '8px 16px', background: (draft.title.trim() && draft.priority) ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${(draft.title.trim() && draft.priority) ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: (draft.title.trim() && draft.priority) ? '#2dd4bf' : '#334155', fontSize: '0.85rem', fontWeight: 600, cursor: (draft.title.trim() && draft.priority) ? 'pointer' : 'not-allowed' }}>
          Save Goal
        </button>
      </div>
    </div>
  );
}

// ── Main CompanySetup component ───────────────────────────────────────────────
export function CompanySetup({ orgId, onComplete, onCancel, existingCompany = null }) {
  const isEditing = !!existingCompany;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [basics, setBasics] = useState({
    name:    existingCompany?.name    || '',
    website: existingCompany?.website || '',
    context: existingCompany?.context || '',
  });

  const [productAreas, setProductAreas] = useState(
    existingCompany?.product_areas || []
  );

  const [goals, setGoals] = useState([]);

  const canProceed = () => {
    if (step === 1) return basics.name.trim().length > 0;
    if (step === 2) return productAreas.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < 3) { setStep(step + 1); return; }
    await handleSave();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let companyId = existingCompany?.id;

      const companyData = {
        org_id:        orgId,
        name:          basics.name.trim(),
        website:       basics.website.trim() || null,
        context:       basics.context.trim() || null,
        product_areas: productAreas,
      };

      if (isEditing) {
        const { data, error } = await supabase.from('companies').update(companyData).eq('id', companyId).select().single();
        if (error) throw error;
        companyId = data.id;
      } else {
        const { data, error } = await supabase.from('companies').insert(companyData).select().single();
        if (error) throw error;
        companyId = data.id;
      }

      // Save goals
      if (goals.length > 0) {
        const goalRows = goals.map(g => ({
          org_id:      orgId,
          company_id:  companyId,
          title:       g.title,
          description: g.description || null,
          priority:    g.priority,
          kpis:        [],
        }));
        const { error: goalsError } = await supabase.from('company_goals').insert(goalRows);
        if (goalsError) throw goalsError;
      }

      onComplete({ id: companyId, ...companyData, goals });
    } catch (err) {
      console.error('Error saving company:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const STEP_LABELS = ['Basics', 'Product Areas', 'Goals'];

  return (
    <div>
      {/* Step progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? 'linear-gradient(90deg, #2dd4bf, #22d3ee)' : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {STEP_LABELS.map((label, i) => (
          <span key={i} style={{ fontSize: '0.78rem', color: i + 1 === step ? '#2dd4bf' : i + 1 < step ? '#475569' : '#334155', fontWeight: i + 1 === step ? 600 : 400 }}>
            {i + 1 < step ? '✓ ' : ''}{label}
          </span>
        ))}
      </div>

      {step === 1 && <StepBasics data={basics} onChange={(f, v) => setBasics(prev => ({ ...prev, [f]: v }))} />}
      {step === 2 && <StepProductAreas areas={productAreas} onChange={setProductAreas} />}
      {step === 3 && <StepGoals goals={goals} onChange={setGoals} />}

      {/* Nav */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)}
            style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', fontSize: '0.95rem', cursor: 'pointer' }}>
            Back
          </button>
        ) : onCancel ? (
          <button onClick={onCancel}
            style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', fontSize: '0.95rem', cursor: 'pointer' }}>
            Cancel
          </button>
        ) : null}

        <button onClick={handleNext} disabled={!canProceed() || saving}
          style={{ flex: 1, padding: '12px 20px', background: (!canProceed() || saving) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 10, color: (!canProceed() || saving) ? '#334155' : '#0a0f1a', fontSize: '0.95rem', fontWeight: 600, cursor: (!canProceed() || saving) ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving...' : step === 3 ? (isEditing ? 'Save Changes' : 'Add Company →') : step === 2 ? 'Continue to Goals' : 'Continue'}
        </button>
      </div>

      {step === 3 && !saving && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button onClick={handleSave}
            style={{ background: 'none', border: 'none', color: '#334155', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.1)' }}>
            Skip goals, add later
          </button>
        </div>
      )}
    </div>
  );
}

export default CompanySetup;
