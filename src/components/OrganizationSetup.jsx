import React, { useState } from 'react'

// Company mode options
const COMPANY_MODES = [
  { 
    value: 'pmf', 
    label: 'Find product-market fit',
    description: 'Early stage, still validating the core offering'
  },
  { 
    value: 'growth', 
    label: 'Grow as fast as possible',
    description: 'PMF achieved, now scaling acquisition & usage'
  },
  { 
    value: 'efficiency', 
    label: 'Improve efficiency & margins',
    description: 'Optimize unit economics, reduce burn'
  },
  { 
    value: 'expansion', 
    label: 'Expand into new markets or products',
    description: 'Proven core, seeking new growth vectors'
  },
  { 
    value: 'unsure', 
    label: "Not sure / It's complicated",
    description: 'Mixed priorities or unclear direction'
  }
]

const COMPANY_STAGES = [
  { value: 'preseed', label: 'Pre-seed / Bootstrapped' },
  { value: 'seed', label: 'Seed ($1M–$5M raised)' },
  { value: 'seriesA', label: 'Series A ($5M–$20M)' },
  { value: 'seriesB', label: 'Series B ($20M–$50M)' },
  { value: 'seriesC', label: 'Series C+ / Growth' },
  { value: 'enterprise', label: 'Enterprise / Public' }
]

const INDUSTRIES = [
  { value: 'saas', label: 'SaaS / B2B Software' },
  { value: 'consumer', label: 'Consumer / B2C' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'ai', label: 'AI / ML' },
  { value: 'other', label: 'Other' }
]

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
    stage: initialData.stage || '',
    industry: initialData.industry || '',
    currentMode: initialData.currentMode || '',
    role: initialData.role || '',
    seniority: initialData.seniority || ''
  })
  const [saving, setSaving] = useState(false)

  const totalSteps = 4

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1: return formData.companyName.trim().length >= 2
      case 2: return formData.stage && formData.industry
      case 3: return formData.currentMode
      case 4: return formData.role && formData.seniority
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
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onComplete({
        organization: {
          name: formData.companyName,
          stage: formData.stage,
          industry: formData.industry,
          currentMode: formData.currentMode
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

  const getModeLabel = (mode) => {
    const found = COMPANY_MODES.find(m => m.value === mode)
    return found ? found.label : mode
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
          <div style={{ 
            display: 'flex', 
            gap: 4, 
            marginBottom: 8 
          }}>
            {[1, 2, 3, 4].map(s => (
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

        {/* Step 1: Company Name */}
        {step === 1 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              What company do you work for?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us give you relevant comparisons and context.
            </p>

            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="Company name"
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

            <p style={{ 
              color: '#475569', 
              fontSize: '0.85rem', 
              marginTop: 12,
              lineHeight: 1.5
            }}>
              This is used for grouping and context only. Your bets are private.
            </p>
          </div>
        )}

        {/* Step 2: Company Context */}
        {step === 2 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              Tell us about {formData.companyName}
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us compare you to similar companies.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
                Company Stage
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COMPANY_STAGES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => updateField('stage', s.value)}
                    style={{
                      padding: '14px 18px',
                      background: formData.stage === s.value 
                        ? 'rgba(45, 212, 191, 0.15)' 
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.stage === s.value ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      color: formData.stage === s.value ? '#2dd4bf' : '#cbd5e1',
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
                Industry
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 8 
              }}>
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind.value}
                    onClick={() => updateField('industry', ind.value)}
                    style={{
                      padding: '12px 14px',
                      background: formData.industry === ind.value 
                        ? 'rgba(45, 212, 191, 0.15)' 
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.industry === ind.value ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                      color: formData.industry === ind.value ? '#2dd4bf' : '#cbd5e1',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Company Priority/Mode */}
        {step === 3 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              What's {formData.companyName}'s current priority?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us give context on whether your bets align with what your org likely values right now.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COMPANY_MODES.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => updateField('currentMode', mode.value)}
                  style={{
                    padding: '18px 20px',
                    background: formData.currentMode === mode.value 
                      ? 'rgba(45, 212, 191, 0.15)' 
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${formData.currentMode === mode.value ? 'rgba(45, 212, 191, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ 
                    color: formData.currentMode === mode.value ? '#2dd4bf' : '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: 500,
                    marginBottom: 4
                  }}>
                    {mode.label}
                  </div>
                  <div style={{ 
                    color: formData.currentMode === mode.value ? '#5eead4' : '#64748b',
                    fontSize: '0.85rem'
                  }}>
                    {mode.description}
                  </div>
                </button>
              ))}
            </div>

            <p style={{ 
              color: '#475569', 
              fontSize: '0.85rem', 
              marginTop: 16,
              lineHeight: 1.5
            }}>
              💡 You can update this anytime if priorities shift.
            </p>
          </div>
        )}

        {/* Step 4: Your Role */}
        {step === 4 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              What's your role at {formData.companyName}?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us compare you to peers in similar positions.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
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
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
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
          </div>
        )}

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginTop: 40 
        }}>
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
