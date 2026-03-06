import React, { useState } from 'react'

const ROLES = [
  { value: 'pm', label: 'Product Manager / Product Owner' },
  { value: 'founder', label: 'Founder / CEO' },
  { value: 'eng', label: 'Engineering Lead' },
  { value: 'growth', label: 'Marketing / Growth' },
  { value: 'ops', label: 'CS / Operations' },
  { value: 'other', label: 'Other' }
]

const SENIORITY = [
  { value: 'ic', label: 'Individual Contributor' },
  { value: 'senior', label: 'Lead / Senior IC' },
  { value: 'manager', label: 'Manager / Director' },
  { value: 'exec', label: 'VP / C-level' }
]

export function OrganizationSetup({ onComplete, initialData = {} }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    teamName: initialData.teamName || '',
    companies: initialData.companies || [{ name: '', website: '' }],
    userContext: initialData.userContext || '',
    aiContext: initialData.aiContext || '',
    role: initialData.role || '',
    seniority: initialData.seniority || ''
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)

  const totalSteps = 3

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateCompany = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.companies]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...prev, companies: updated }
    })
  }

  const addCompany = () => {
    setFormData(prev => ({
      ...prev,
      companies: [...prev.companies, { name: '', website: '' }]
    }))
  }

  const removeCompany = (idx) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.filter((_, i) => i !== idx)
    }))
  }

  const handleAnalyzeWebsite = async (idx) => {
    const company = formData.companies[idx]
    if (!company.website) return
    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-company-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: company.website, userContext: formData.userContext })
      })
      if (!response.ok) throw new Error('Analysis failed')
      const data = await response.json()
      updateField('aiContext', data.ai_context)
    } catch (err) {
      console.error('Website analysis error:', err)
      updateField('aiContext', 'Website analysis unavailable — using your context only')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const combinedContext = formData.aiContext
        ? `${formData.userContext}\n\nWebsite Analysis:\n${formData.aiContext}`
        : formData.userContext

      const validCompanies = formData.companies.filter(c => c.name.trim())
      const primaryCompany = validCompanies[0] || null

      await onComplete({
        organization: {
          name: formData.teamName.trim() || primaryCompany?.name || 'My Team',
          website: primaryCompany?.website || '',
          userContext: formData.userContext,
          aiContext: formData.aiContext || null,
          combinedContext,
          companies: validCompanies,
        },
        userOrg: {
          role: formData.role,
          seniority: formData.seniority,
          isCurrent: true
        }
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1929 100%)',
      padding: '60px 24px'
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>CHZCLOTH</span>
          <span style={{ color: '#475569', margin: '0 12px' }}>•</span>
          <span style={{ color: '#64748b' }}>Team Setup</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: s <= step
                  ? 'linear-gradient(90deg, #2dd4bf, #22d3ee)'
                  : 'rgba(255,255,255,0.1)'
              }} />
            ))}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Step {step} of {totalSteps}</div>
        </div>

        {/* ── Step 1: Team name + companies ────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              Let's set up your team
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Everything here is optional — you can fill in details later from the Team tab.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Team name {optionalTag}</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={e => updateField('teamName', e.target.value)}
                placeholder="e.g., Growth Team, Product Pod 3, Consulting Team"
                autoFocus
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Is there a company or organization your team's bets will support? {optionalTag}
              </label>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5 }}>
                Add multiple if your team supports more than one — bets can be tagged to a specific company.
              </p>

              {formData.companies.map((company, idx) => (
                <div key={idx} style={{ marginBottom: 12, padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                  {formData.companies.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Company {idx + 1}
                      </span>
                      <button
                        onClick={() => removeCompany(idx)}
                        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      value={company.name}
                      onChange={e => updateCompany(idx, 'name', e.target.value)}
                      placeholder="Company name"
                      style={inputStyle}
                    />
                  </div>
                  <input
                    type="text"
                    value={company.website}
                    onChange={e => updateCompany(idx, 'website', e.target.value)}
                    placeholder="company.com"
                    style={inputStyle}
                  />
                </div>
              ))}

              <button
                onClick={addCompany}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2dd4bf',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(45,212,191,0.4)',
                }}
              >
                + Add another company
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Context ──────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              Tell us about what your team works on
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps AI evaluate whether bets align with your business model and strategy. Skip if you'd rather set this up later.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>
                How do you make money? What are your strategic priorities? {optionalTag}
              </label>
              <textarea
                value={formData.userContext}
                onChange={e => updateField('userContext', e.target.value)}
                placeholder="e.g., B2B SaaS, $5M ARR, growing 10% MoM. Main revenue from annual contracts. Current priority: enterprise sales readiness."
                rows={6}
                style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }}
              />
              <div style={{ color: '#475569', fontSize: '0.82rem', marginTop: 6 }}>
                {formData.userContext.length} characters
              </div>
            </div>

            {formData.companies.some(c => c.website.trim()) && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    AI website analysis {optionalTag}
                  </label>
                  <button
                    onClick={() => handleAnalyzeWebsite(formData.companies.findIndex(c => c.website.trim()))}
                    disabled={analyzing}
                    style={{
                      padding: '8px 16px',
                      background: analyzing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: analyzing ? '#64748b' : '#0a0f1a',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: analyzing ? 'not-allowed' : 'pointer',
                      opacity: analyzing ? 0.7 : 1
                    }}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Website'}
                  </button>
                </div>
                <textarea
                  value={formData.aiContext}
                  onChange={e => updateField('aiContext', e.target.value)}
                  placeholder="Click 'Analyze Website' to auto-fill, or leave blank to skip"
                  rows={5}
                  style={{
                    ...inputStyle,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
                <p style={{ color: '#475569', fontSize: '0.82rem', marginTop: 6 }}>
                  Editable — adjust as needed
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Role ─────────────────────────────────────────────── */}
        {step === 3 && (
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
                  <button
                    key={r.value}
                    onClick={() => updateField('role', formData.role === r.value ? '' : r.value)}
                    style={{
                      padding: '14px 18px',
                      background: formData.role === r.value ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.role === r.value ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      color: formData.role === r.value ? '#2dd4bf' : '#cbd5e1',
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Seniority {optionalTag}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {SENIORITY.map(s => (
                  <button
                    key={s.value}
                    onClick={() => updateField('seniority', formData.seniority === s.value ? '' : s.value)}
                    style={{
                      padding: '14px 18px',
                      background: formData.seniority === s.value ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.seniority === s.value ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      color: formData.seniority === s.value ? '#2dd4bf' : '#cbd5e1',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: 28,
              padding: '12px 16px',
              background: 'rgba(45,212,191,0.05)',
              border: '1px solid rgba(45,212,191,0.12)',
              borderRadius: 10,
              color: '#64748b',
              fontSize: '0.85rem',
              lineHeight: 1.5
            }}>
              After setup you'll land on the Team tab where you can set goals and invite teammates.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#94a3b8',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: saving
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
              border: 'none',
              borderRadius: 10,
              color: saving ? '#64748b' : '#0a0f1a',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : step === totalSteps ? 'Go to my Team →' : 'Continue'}
          </button>
        </div>

        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                background: 'none',
                border: 'none',
                color: '#334155',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(255,255,255,0.1)',
              }}
            >
              Skip setup, take me straight in
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default OrganizationSetup
