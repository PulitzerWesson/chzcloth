import React from 'react'

const MODE_LABELS = {
  pmf: 'finding product-market fit',
  growth: 'growth mode',
  efficiency: 'efficiency mode',
  expansion: 'expansion mode',
  unsure: 'uncertain priorities'
}

const DOMAIN_LABELS = {
  growth: 'a growth bet',
  retention: 'a retention bet',
  monetization: 'a monetization bet',
  product: 'a product experience bet',
  operations: 'an operations bet',
  platform: 'a platform/infrastructure bet'
}

export function ContextCheck({ 
  betDomain, 
  companyMode, 
  companyName,
  guidance,
  onContinue, 
  onChangeType 
}) {
  // Don't show if no mode or unsure
  if (!companyMode || companyMode === 'unsure') {
    return null
  }

  const domainLabel = DOMAIN_LABELS[betDomain] || 'this type of bet'
  const modeLabel = MODE_LABELS[companyMode] || companyMode

  return (
    <div style={{
      background: 'rgba(251, 191, 36, 0.08)',
      border: '1px solid rgba(251, 191, 36, 0.25)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        marginBottom: 16 
      }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <span style={{ 
          color: '#fbbf24', 
          fontWeight: 600, 
          fontSize: '1rem' 
        }}>
          Context Check
        </span>
      </div>

      {/* Summary */}
      <p style={{ 
        color: '#fef3c7', 
        fontSize: '1rem', 
        lineHeight: 1.6, 
        margin: '0 0 16px 0' 
      }}>
        You're making <strong>{domainLabel}</strong> while{' '}
        {companyName ? <strong>{companyName}</strong> : 'your company'} is in{' '}
        <strong>{modeLabel}</strong>.
      </p>

      {/* Guidance */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16
      }}>
        <p style={{ 
          color: '#fde68a', 
          fontSize: '0.9rem', 
          lineHeight: 1.6, 
          margin: 0 
        }}>
          {guidance}
        </p>
      </div>

      {/* Reassurance */}
      <p style={{ 
        color: '#d97706', 
        fontSize: '0.85rem', 
        margin: '0 0 20px 0' 
      }}>
        This is just context — proceed if you believe in it.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onContinue}
          style={{
            flex: 1,
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: 'none',
            borderRadius: 8,
            color: '#0a0f1a',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Continue with bet →
        </button>
        {onChangeType && (
          <button
            onClick={onChangeType}
            style={{
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#94a3b8',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Change bet type
          </button>
        )}
      </div>
    </div>
  )
}

// Function to determine if context check should show
export function shouldShowContextCheck(betDomain, companyMode) {
  if (!companyMode || companyMode === 'unsure') {
    return null
  }

  // Growth bets in efficiency mode
  if (betDomain === 'growth' && companyMode === 'efficiency') {
    return {
      show: true,
      guidance: "Growth bets can still succeed in efficiency mode, but may face more scrutiny. Consider: Can you frame this as \"efficient growth\"? Is the cost low enough to de-risk? Do you have exec sponsorship?"
    }
  }

  // Efficiency bets in growth mode
  if (['operations', 'platform'].includes(betDomain) && companyMode === 'growth') {
    return {
      show: true,
      guidance: "Efficiency/ops bets are often deprioritized in growth phases. Consider: Does this unblock growth? Can it wait until growth stabilizes? Is there a compelling cost-savings story?"
    }
  }

  // Optimization bets in PMF mode
  if (['operations', 'platform', 'monetization'].includes(betDomain) && companyMode === 'pmf') {
    return {
      show: true,
      guidance: "Premature optimization can distract from finding product-market fit. Consider: Will this help you learn faster? Is the pain severe enough to address now?"
    }
  }

  // Retention bets in PMF mode
  if (betDomain === 'retention' && companyMode === 'pmf') {
    return {
      show: true,
      guidance: "Retention matters, but if the core product isn't right, retention won't save you. Consider: Is the product fundamentally working for some users? Are you optimizing too early?"
    }
  }

  return null
}

export default ContextCheck
