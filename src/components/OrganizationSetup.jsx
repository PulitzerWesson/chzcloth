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
// Goal Card Component
function GoalCard({ goal, index, onUpdate, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div style={{
      marginBottom: 16,
      padding: 16,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ color: '#2dd4bf', fontSize: '0.85rem', fontWeight: 600 }}>
          GOAL {index + 1}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={onRemove}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Title */}
          <input
            type="text"
            value={goal.title}
            onChange={(e) => onUpdate({ ...goal, title: e.target.value })}
            placeholder="e.g., Reach $2M ARR by end of Q1"
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Description */}
          <textarea
            value={goal.description}
            onChange={(e) => onUpdate({ ...goal, description: e.target.value })}
            placeholder="Optional: Why this matters, key context..."
            rows={2}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />

          {/* KPIs */}
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 8 }}>
              Key Metrics ({goal.kpis.length}/3)
            </div>
            {goal.kpis.map((kpi, kpiIdx) => (
              <div key={kpiIdx} style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr auto', 
                gap: 8, 
                marginBottom: 8 
              }}>
                <input
                  type="text"
                  value={kpi.metric}
                  onChange={(e) => {
                    const newKpis = [...goal.kpis]
                    newKpis[kpiIdx].metric = e.target.value
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  placeholder="Metric (e.g., MRR)"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={kpi.baseline}
                  onChange={(e) => {
                    const newKpis = [...goal.kpis]
                    newKpis[kpiIdx].baseline = e.target.value
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  placeholder="Baseline"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={kpi.target}
                  onChange={(e) => {
                    const newKpis = [...goal.kpis]
                    newKpis[kpiIdx].target = e.target.value
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  placeholder="Target"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => {
                    const newKpis = goal.kpis.filter((_, i) => i !== kpiIdx)
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {goal.kpis.length < 3 && (
              <button
                onClick={() => onUpdate({ 
                  ...goal, 
                  kpis: [...goal.kpis, { metric: '', baseline: '', target: '' }] 
                })}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(45, 212, 191, 0.1)',
                  border: '1px dashed rgba(45, 212, 191, 0.3)',
                  borderRadius: 6,
                  color: '#2dd4bf',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                + Add KPI
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Department Goal Card Component
function DepartmentGoalCard({ goal, index, companyGoals, onUpdate, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div style={{
      marginBottom: 16,
      padding: 16,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
          DEPARTMENT GOAL {index + 1}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={onRemove}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Align to Company Goal */}
          {companyGoals.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.85rem', 
                marginBottom: 6
              }}>
                Aligns with company goal:
              </label>
              <select
                value={goal.alignedToCompanyGoalIndex ?? ''}
                onChange={(e) => onUpdate({ 
                  ...goal, 
                  alignedToCompanyGoalIndex: e.target.value === '' ? null : parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">No specific alignment</option>
                {companyGoals.map((cGoal, idx) => (
                  <option key={idx} value={idx}>
                    Goal {idx + 1}: {cGoal.title.substring(0, 50)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            value={goal.title}
            onChange={(e) => onUpdate({ ...goal, title: e.target.value })}
            placeholder="e.g., Ship enterprise-ready features"
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Description */}
          <textarea
            value={goal.description}
            onChange={(e) => onUpdate({ ...goal, description: e.target.value })}
            placeholder="Optional: How this supports the company goal..."
            rows={2}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />

          {/* KPIs (same as company goals) */}
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 8 }}>
              Key Metrics ({goal.kpis.length}/3)
            </div>
            {goal.kpis.map((kpi, kpiIdx) => (
              <div key={kpiIdx} style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr auto', 
                gap: 8, 
                marginBottom: 8 
              }}>
                <input
                  type="text"
                  value={kpi.metric}
                  onChange={(e) => {
                    const newKpis = [...goal.kpis]
                    newKpis[kpiIdx].metric = e.target.value
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  placeholder="Metric"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={kpi.baseline}
                  onChange={(e) => {
                    const newKpis = [...goal.kpis]
                    newKpis[kpiIdx].baseline = e.target.value
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  placeholder="Baseline"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={kpi.target}
                  onChange={(e) => {
                    const newKpis = [...goal.kpis]
                    newKpis[kpiIdx].target = e.target.value
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  placeholder="Target"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => {
                    const newKpis = goal.kpis.filter((_, i) => i !== kpiIdx)
                    onUpdate({ ...goal, kpis: newKpis })
                  }}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {goal.kpis.length < 3 && (
              <button
                onClick={() => onUpdate({ 
                  ...goal, 
                  kpis: [...goal.kpis, { metric: '', baseline: '', target: '' }] 
                })}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px dashed rgba(251, 191, 36, 0.3)',
                  borderRadius: 6,
                  color: '#fbbf24',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                + Add KPI
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
export function OrganizationSetup({ onComplete, initialData = {} }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: initialData.companyName || '',
    website: initialData.website || '',
    userContext: initialData.userContext || '',
    aiContext: initialData.aiContext || '',
    stage: initialData.stage || '',
    currentMode: initialData.currentMode || '',
    role: initialData.role || '',
    seniority: initialData.seniority || ''
  })

  // ADD THESE NEW STATES:
const [companyGoals, setCompanyGoals] = useState([])
const [goalTimePeriod, setGoalTimePeriod] = useState({ year: 2026, period: 'q1' })
const [departmentName, setDepartmentName] = useState('')
const [departmentGoals, setDepartmentGoals] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)

  const totalSteps = 6

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
    case 3: return formData.stage && formData.currentMode
    case 4: return formData.role && formData.seniority
    case 5: return companyGoals.length > 0  // At least 1 company goal
    case 6: return departmentName.trim().length >= 2 && departmentGoals.length > 0  // Department + at least 1 goal
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
    // Combine contexts
    const combinedContext = formData.aiContext
      ? `${formData.userContext}\n\nWebsite Analysis:\n${formData.aiContext}`
      : formData.userContext

    await onComplete({
      organization: {
        name: formData.companyName,
        website: formData.website,
        stage: formData.stage,
        currentMode: formData.currentMode,
        userContext: formData.userContext,
        aiContext: formData.aiContext || null,
        combinedContext: combinedContext
      },
      userOrg: {
        role: formData.role,
        seniority: formData.seniority,
        isCurrent: true
      },
      companyGoals: companyGoals.map(g => ({
        ...g,
        year: goalTimePeriod.year,
        timePeriod: goalTimePeriod.period
      })),
      department: {
        name: departmentName
      },
      departmentGoals: departmentGoals.map(g => ({
        ...g,
        year: goalTimePeriod.year,
        timePeriod: goalTimePeriod.period
      }))
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

        {/* Step 1: Company Name + Website */}
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
              This helps us analyze your company and give you relevant context.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
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
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
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
              <p style={{ 
                color: '#475569', 
                fontSize: '0.85rem', 
                marginTop: 12,
                lineHeight: 1.5
              }}>
                We'll use this to better understand your business model and market
              </p>
            </div>
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
              This context helps AI evaluate if product bets align with your business model and strategy.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
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
              <div style={{ 
                color: '#64748b', 
                fontSize: '0.85rem', 
                marginTop: 8
              }}>
                {formData.userContext.length} characters (minimum 20)
              </div>
            </div>

            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 10
              }}>
                <label style={{ 
                  color: '#94a3b8', 
                  fontSize: '0.9rem', 
                  fontWeight: 500
                }}>
                  AI Website Analysis (optional)
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
                placeholder="Click 'Analyze Website' to auto-fill this section, or leave blank to skip"
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
              <p style={{ 
                color: '#475569', 
                fontSize: '0.85rem', 
                marginTop: 8,
                lineHeight: 1.5
              }}>
                AI analysis is editable - adjust as needed before continuing
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Stage + Current Mode */}
        {step === 3 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              Company stage and current priority
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              This helps us evaluate if bets align with where your company is now.
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
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
                      fontSize: '0.85rem',
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
                Current Priority
              </label>
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
            </div>
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

        {/* Step 5: Company Goals */}
        {step === 5 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              Set strategic goals for {formData.companyName}
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Define 1-3 measurable goals with KPIs. This helps AI evaluate if bets align with company priorities.
            </p>

            {/* Time Period Selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
                Time Period
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={goalTimePeriod.year}
                  onChange={(e) => setGoalTimePeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
                <select
                  value={goalTimePeriod.period}
                  onChange={(e) => setGoalTimePeriod(prev => ({ ...prev, period: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="year">Full Year</option>
                  <option value="h1">H1 (Jan-Jun)</option>
                  <option value="h2">H2 (Jul-Dec)</option>
                  <option value="q1">Q1 (Jan-Mar)</option>
                  <option value="q2">Q2 (Apr-Jun)</option>
                  <option value="q3">Q3 (Jul-Sep)</option>
                  <option value="q4">Q4 (Oct-Dec)</option>
                </select>
              </div>
            </div>

            {/* Goals List */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
                Company Goals ({companyGoals.length}/3)
              </label>
              
              {companyGoals.map((goal, idx) => (
                <GoalCard
                  key={idx}
                  goal={goal}
                  index={idx}
                  onUpdate={(updated) => {
                    const newGoals = [...companyGoals]
                    newGoals[idx] = updated
                    setCompanyGoals(newGoals)
                  }}
                  onRemove={() => {
                    setCompanyGoals(companyGoals.filter((_, i) => i !== idx))
                  }}
                />
              ))}

              {companyGoals.length < 3 && (
                <button
                  onClick={() => setCompanyGoals([...companyGoals, { 
                    title: '', 
                    description: '', 
                    kpis: [] 
                  }])}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    border: '1px dashed rgba(45, 212, 191, 0.3)',
                    borderRadius: 12,
                    color: '#2dd4bf',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  + Add Goal
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Department Setup */}
        {step === 6 && (
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#f1f5f9', 
              marginBottom: 12 
            }}>
              Set up your department
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Create department-level goals that align with company goals. AI will use this to evaluate bet alignment.
            </p>

            {/* Department Name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
                Department Name
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g., Product, Engineering, Marketing"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Company Goals Reference */}
            {companyGoals.length > 0 && (
              <div style={{ 
                marginBottom: 24,
                padding: 16,
                background: 'rgba(45, 212, 191, 0.05)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: 12
              }}>
                <div style={{ 
                  color: '#2dd4bf', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  marginBottom: 12
                }}>
                  COMPANY GOALS FOR CONTEXT
                </div>
                {companyGoals.map((goal, idx) => (
                  <div key={idx} style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.9rem',
                    marginBottom: 6
                  }}>
                    {idx + 1}. {goal.title}
                  </div>
                ))}
              </div>
            )}

            {/* Department Goals */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                marginBottom: 10,
                fontWeight: 500
              }}>
                Department Goals ({departmentGoals.length}/3)
              </label>

              {departmentGoals.map((goal, idx) => (
                <DepartmentGoalCard
                  key={idx}
                  goal={goal}
                  index={idx}
                  companyGoals={companyGoals}
                  onUpdate={(updated) => {
                    const newGoals = [...departmentGoals]
                    newGoals[idx] = updated
                    setDepartmentGoals(newGoals)
                  }}
                  onRemove={() => {
                    setDepartmentGoals(departmentGoals.filter((_, i) => i !== idx))
                  }}
                />
              ))}

              {departmentGoals.length < 3 && (
                <button
                  onClick={() => setDepartmentGoals([...departmentGoals, { 
                    title: '', 
                    description: '', 
                    kpis: [],
                    alignedToCompanyGoalIndex: null
                  }])}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    border: '1px dashed rgba(45, 212, 191, 0.3)',
                    borderRadius: 12,
                    color: '#2dd4bf',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  + Add Department Goal
                </button>
              )}
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
