import React, { useState } from 'react'

const MODE_LABELS = {
  pmf: 'PMF',
  growth: 'Growth',
  efficiency: 'Efficiency',
  expansion: 'Expansion',
  unsure: 'Mixed'
}

const STAGE_LABELS = {
  preseed: 'Pre-seed',
  seed: 'Seed',
  seriesA: 'Series A',
  seriesB: 'Series B',
  seriesC: 'Series C+',
  enterprise: 'Enterprise'
}

export function OrgSwitcher({ 
  organizations, 
  currentOrg, 
  onSwitch, 
  onAddOrg,
  onEditMode 
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (!currentOrg) {
    return (
      <button
        onClick={onAddOrg}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: 'rgba(45, 212, 191, 0.1)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: 8,
          color: '#2dd4bf',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}
      >
        + Add Company
      </button>
    )
  }

  const stageLabel = STAGE_LABELS[currentOrg.stage] || currentOrg.stage
  const modeLabel = MODE_LABELS[currentOrg.currentMode] || currentOrg.currentMode

  return (
    <div style={{ position: 'relative' }}>
      {/* Current org display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
      >
        <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.95rem' }}>
          {currentOrg.name}
        </span>
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
          {stageLabel}
        </span>
        <span style={{
          background: getModeColor(currentOrg.currentMode),
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          color: '#0a0f1a',
          fontWeight: 600
        }}>
          {modeLabel}
        </span>
        <span style={{ color: '#64748b', marginLeft: 4 }}>▾</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90
            }}
          />
          
          {/* Menu */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            minWidth: 280,
            background: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 100,
            overflow: 'hidden'
          }}>
            {/* Current org header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ 
                color: '#64748b', 
                fontSize: '0.75rem', 
                textTransform: 'uppercase',
                marginBottom: 8
              }}>
                Current Company
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 500 }}>
                    {currentOrg.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {stageLabel} • {currentOrg.industry}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                    onEditMode(currentOrg.orgId)
                  }}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Edit mode
                </button>
              </div>
            </div>

            {/* Other orgs */}
            {organizations.filter(o => o.orgId !== currentOrg.orgId).length > 0 && (
              <div style={{ padding: '8px' }}>
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  padding: '8px',
                  marginBottom: 4
                }}>
                  Switch to
                </div>
                {organizations
                  .filter(o => o.orgId !== currentOrg.orgId)
                  .map(org => (
                    <button
                      key={org.orgId}
                      onClick={() => {
                        onSwitch(org.orgId)
                        setIsOpen(false)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#cbd5e1', fontWeight: 500 }}>
                          {org.name}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {STAGE_LABELS[org.stage] || org.stage}
                          {org.endedAt && ` • Left ${formatDate(org.endedAt)}`}
                        </div>
                      </div>
                      {!org.isCurrent && org.endedAt && (
                        <span style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          color: '#64748b'
                        }}>
                          Past
                        </span>
                      )}
                    </button>
                  ))
                }
              </div>
            )}

            {/* Add org button */}
            <div style={{
              padding: '8px',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onAddOrg()
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: '#2dd4bf',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(45, 212, 191, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>+</span>
                <span>Add new company</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function getModeColor(mode) {
  switch (mode) {
    case 'pmf': return '#f472b6'  // pink
    case 'growth': return '#22c55e'  // green
    case 'efficiency': return '#3b82f6'  // blue
    case 'expansion': return '#a855f7'  // purple
    default: return '#94a3b8'  // gray
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default OrgSwitcher
