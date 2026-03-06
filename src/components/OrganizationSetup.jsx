import React, { useState } from 'react'

const ROLES = [
  { value: 'pm',      label: 'Product Manager / Product Owner' },
  { value: 'founder', label: 'Founder / CEO' },
  { value: 'eng',     label: 'Engineering Lead' },
  { value: 'growth',  label: 'Marketing / Growth' },
  { value: 'ops',     label: 'CS / Operations' },
  { value: 'other',   label: 'Other' },
]

const SENIORITY = [
  { value: 'ic',      label: 'Individual Contributor' },
  { value: 'senior',  label: 'Lead / Senior IC' },
  { value: 'manager', label: 'Manager / Director' },
  { value: 'exec',    label: 'VP / C-level' },
]

export function OrganizationSetup({ onComplete, initialData = {} }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    teamName:  initialData.teamName  || '',
    role:      initialData.role      || '',
    seniority: initialData.seniority || '',
  })
  const [saving, setSaving] = useState(false)

  const updateField = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onComplete({
        organization: {
          name: formData.teamName.trim() || 'My Team',
        },
        userOrg: {
          role:      formData.role,
          seniority: formData.seniority,
          isCurrent: true,
        },
      })
    } catch (err) {
      console.error('Error saving organization:', err)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: 10,
    fontWeight: 500,
  }

  const optionalTag = (
    <span style={{ color: '#334155', fontWeight: 400, fontSize: '0.82rem', marginLeft: 6 }}>optional</span>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1929 100%)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHZCLOTH</span>
          <span style={{ color: '#475569', margin: '0 12px' }}>•</span>
          <span style={{ color: '#64748b' }}>Team Setup</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'linear-gradient(90deg, #2dd4bf, #22d3ee)' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Step {step} of 2</div>
        </div>

        {/* ── Step 1: Team name ─────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              Name your team
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This is the group managing bets. You'll add the companies you work on — including your own — after setup.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Team name {optionalTag}</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={e => updateField('teamName', e.target.value)}
                placeholder="e.g., Growth Team, Product Pod 3, Finn Consulting"
                autoFocus
                style={inputStyle}
              />
            </div>

            <div style={{ padding: '14px 16px', background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: 10, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
              After setup you'll add companies — even if that's just your own. Goals, product areas, and bets all live at the company level.
            </div>
          </div>
        )}

        {/* ── Step 2: Role ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              What's your role?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Helps us compare your bets to peers in similar positions. Both fields are optional.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Role {optionalTag}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r.value} onClick={() => updateField('role', formData.role === r.value ? '' : r.value)}
                    style={{ padding: '14px 18px', background: formData.role === r.value ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${formData.role === r.value ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, color: formData.role === r.value ? '#2dd4bf' : '#cbd5e1', fontSize: '0.95rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Seniority {optionalTag}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {SENIORITY.map(s => (
                  <button key={s.value} onClick={() => updateField('seniority', formData.seniority === s.value ? '' : s.value)}
                    style={{ padding: '14px 18px', background: formData.seniority === s.value ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${formData.seniority === s.value ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, color: formData.seniority === s.value ? '#2dd4bf' : '#cbd5e1', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', fontSize: '1rem', cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button onClick={handleNext} disabled={saving}
            style={{ flex: 1, padding: '14px 24px', background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 10, color: saving ? '#64748b' : '#0a0f1a', fontSize: '1rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : step === 2 ? 'Create my team →' : 'Continue'}
          </button>
        </div>

        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={handleSubmit} disabled={saving}
              style={{ background: 'none', border: 'none', color: '#334155', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.1)' }}>
              Skip setup, take me straight in
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default OrganizationSetup
