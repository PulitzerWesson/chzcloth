import React from 'react'
import { PM_INDEX_LABELS, getIndexColor, getIndexLabel } from '../hooks/usePMValueIndex'

export function PMValueIndex({ indexData, bets = [] }) {
  if (!indexData) {
    return <PMValueIndexLoading />
  }

  if (!indexData.unlocked) {
    return <PMValueIndexLocked progress={indexData.unlockProgress} progressPct={indexData.progressPct} />
  }

  return <PMValueIndexUnlocked data={indexData} />
}

function PMValueIndexLoading() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24
    }}>
      <div style={{ color: '#64748b', textAlign: 'center' }}>
        Loading PM Value Index...
      </div>
    </div>
  )
}

function PMValueIndexLocked({ progress, progressPct }) {
  const {
    betsLogged = 0,
    betsRequired = 5,
    outcomesRecorded = 0,
    outcomesRequired = 3,
    hasRecentOutcome = false
  } = progress || {}

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 20 
      }}>
        <div>
          <h3 style={{ 
            color: '#64748b', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            PM Value Index
          </h3>
        </div>
        <span style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '4px 12px', 
          borderRadius: 20, 
          fontSize: '0.8rem',
          color: '#94a3b8'
        }}>
          🔒 Locked
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        height: 8,
        marginBottom: 20,
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #2dd4bf, #22d3ee)',
          height: '100%',
          width: `${progressPct || 0}%`,
          borderRadius: 8,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Requirements */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12 
      }}>
        <RequirementRow 
          label="Bets logged"
          current={betsLogged}
          required={betsRequired}
          met={betsLogged >= betsRequired}
        />
        <RequirementRow 
          label="Outcomes recorded"
          current={outcomesRecorded}
          required={outcomesRequired}
          met={outcomesRecorded >= outcomesRequired}
        />
        <RequirementRow 
          label="Active in last 30 days"
          current={hasRecentOutcome ? 1 : 0}
          required={1}
          met={hasRecentOutcome}
          isBoolean
        />
      </div>

      {/* Explanation */}
      <p style={{ 
        color: '#475569', 
        fontSize: '0.85rem', 
        marginTop: 16, 
        lineHeight: 1.5 
      }}>
        Your PM Value Index measures prediction accuracy, calibration, and velocity. 
        Keep logging bets and outcomes to unlock it.
      </p>
    </div>
  )
}

function RequirementRow({ label, current, required, met, isBoolean = false }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ 
          fontSize: '1rem',
          opacity: met ? 1 : 0.4
        }}>
          {met ? '✓' : '○'}
        </span>
        <span style={{ 
          color: met ? '#94a3b8' : '#64748b',
          fontSize: '0.9rem'
        }}>
          {label}
        </span>
      </div>
      <span style={{ 
        color: met ? '#2dd4bf' : '#64748b',
        fontSize: '0.9rem',
        fontWeight: 500
      }}>
        {isBoolean 
          ? (met ? 'Yes' : 'No')
          : `${current}/${required}`
        }
      </span>
    </div>
  )
}

function PMValueIndexUnlocked({ data }) {
  const { components, index } = data
  const color = getIndexColor(index)
  const label = getIndexLabel(index)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 24 
      }}>
        <h3 style={{ 
          color: '#94a3b8', 
          fontSize: '0.9rem', 
          fontWeight: 600, 
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          PM Value Index
        </h3>
        <span style={{ 
          background: 'rgba(45, 212, 191, 0.1)', 
          padding: '4px 12px', 
          borderRadius: 20, 
          fontSize: '0.8rem',
          color: '#2dd4bf'
        }}>
          ✓ Active
        </span>
      </div>

      {/* Main Score */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ 
          fontSize: '4rem', 
          fontWeight: 800, 
          color,
          lineHeight: 1
        }}>
          {index}
        </div>
        <div style={{ 
          color: '#94a3b8', 
          fontSize: '0.9rem',
          marginTop: 8
        }}>
          {label}
        </div>
      </div>

      {/* Components */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 16 
      }}>
        {Object.entries(PM_INDEX_LABELS).map(([key, meta]) => {
          const value = components?.[key]
          if (value === null || value === undefined) return null
          
          return (
            <ComponentRow 
              key={key}
              label={meta.label}
              description={meta.description}
              value={meta.format(value)}
              rawValue={key === 'ownershipPremium' ? value + 50 : value}
            />
          )
        })}
      </div>
    </div>
  )
}

function ComponentRow({ label, description, value, rawValue }) {
  // Normalize to 0-100 for bar width
  const barWidth = Math.min(Math.max(rawValue, 0), 100)
  
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'baseline',
        marginBottom: 4
      }}>
        <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ color: '#2dd4bf', fontSize: '0.9rem', fontWeight: 600 }}>
          {value}
        </span>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        height: 6,
        marginBottom: 4,
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #2dd4bf, #22d3ee)',
          height: '100%',
          width: `${barWidth}%`,
          borderRadius: 4,
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
        {description}
      </div>
    </div>
  )
}

export default PMValueIndex
