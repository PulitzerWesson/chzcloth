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
    companyName: initialData.companyName || '',
    website: initialData.website || '',
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

  const handleAnalyzeWebsite = async () => {
    if (!formData.website) return
    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-company-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: formData.website,
          userContext: formData.userContext
        })
      })
      if (!response.ok) throw new Error('Analysis failed')
      const data = await response.json()
      updateField('aiContext', data.ai_context)
    } catch (err) {
      console.error('Website analysis error:', err)
      updateField('aiContext', 'Website analysis unavailable - using your context only')
    } finally {
      setAnalyzing(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return formData.companyName.trim().length >= 2 && formData.website.trim().length >= 3
      case 2: return formData.userContext.trim().length >= 20
      case 3: return formData.role && formData.seniority
      default: return false
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
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

      await onComplete({
        organization: {
          name: formData.companyName,
          website: formData.website,
          userContext: formData.userContext,
          aiContext: formData.aiContext || null,
          combinedContext
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
          <span style={{ color: '#64748b' }}>Company Setup</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1, 2, 3].map(s => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: s <= step
                    ? 'linear-gradient(90deg, #2dd4bf, #22d3ee)'
                    : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Step 1: Company Name + Website */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              What company do you work for?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us analyze your company and give you relevant context.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10, fontWeight: 500 }}>
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Acme Corp"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f1f5f9',
                  fontSize: '1.1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10, fontWeight: 500 }}>
                Company Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="acme.com"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f1f5f9',
                  fontSize: '1.1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.5 }}>
                We'll use this to better understand your business model and market
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Company Context */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              Tell us about {formData.companyName}
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This context helps AI evaluate if product bets align with your business model and strategy.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10, fontWeight: 500 }}>
                How do you make money? What are your strategic priorities?
              </label>
              <textarea
                value={formData.userContext}
                onChange={(e) => updateField('userContext', e.target.value)}
                placeholder="Example: B2B SaaS selling project management software to mid-market construction companies. $5M ARR, growing 10% MoM. Main revenue from annual contracts ($10K-50K). Current priority: enterprise sales readiness. Key challenge: 6-month sales cycles."
                rows={6}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f1f5f9',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>
                {formData.userContext.length} characters (minimum 20)
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                  AI Website Analysis <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span>
                </label>
                <button
                  onClick={handleAnalyzeWebsite}
                  disabled={!formData.website || analyzing}
                  style={{
                    padding: '8px 16px',
                    background: analyzing
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                    border: 'none',
                    borderRadius: 8,
                    color: analyzing ? '#64748b' : '#0a0f1a',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: analyzing || !formData.website ? 'not-allowed' : 'pointer',
                    opacity: analyzing ? 0.7 : 1
                  }}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Website'}
                </button>
              </div>
              <textarea
                value={formData.aiContext}
                onChange={(e) => updateField('aiContext', e.target.value)}
                placeholder="Click 'Analyze Website' to auto-fill, or leave blank to skip"
                rows={5}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />
              <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: 8, lineHeight: 1.5 }}>
                AI analysis is editable — adjust as needed before continuing
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Your Role */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
              What's your role at {formData.companyName}?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us compare you to peers in similar positions.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10, fontWeight: 500 }}>
                Role
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => updateField('role', r.value)}
                    style={{
                      padding: '14px 18px',
                      background: formData.role === r.value
                        ? 'rgba(45, 212, 191, 0.15)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.role === r.value ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255,255,255,0.08)'}`,
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
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10, fontWeight: 500 }}>
                Seniority Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {SENIORITY.map(s => (
                  <button
                    key={s.value}
                    onClick={() => updateField('seniority', s.value)}
                    style={{
                      padding: '14px 18px',
                      background: formData.seniority === s.value
                        ? 'rgba(45, 212, 191, 0.15)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.seniority === s.value ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255,255,255,0.08)'}`,
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

            {/* Completion hint */}
            {canProceed() && (
              <div style={{
                marginTop: 24,
                padding: '12px 16px',
                background: 'rgba(45, 212, 191, 0.06)',
                border: '1px solid rgba(45, 212, 191, 0.15)',
                borderRadius: 10,
                color: '#64748b',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}>
                You can set company goals from the Company dashboard after setup.
              </div>
            )}
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
            disabled={!canProceed() || saving}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: canProceed() && !saving
                ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)'
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 10,
              color: canProceed() && !saving ? '#0a0f1a' : '#64748b',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: canProceed() && !saving ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : step === totalSteps ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrganizationSetup
