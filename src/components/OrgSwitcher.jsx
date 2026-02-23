import React, { useState } from 'react'

export function OrgSwitcher({ 
  organizations, 
  currentOrg, 
  onSwitch, 
  onAddOrg,
  canInviteUsers
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const handleSendInvite = async () => {
    // TODO: Implement invite logic
    console.log('Sending invite to:', inviteEmail, 'as', inviteRole)
    setShowInviteModal(false)
    setInviteEmail('')
    setInviteRole('member')
  }

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

  return (
    <>
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
                <div style={{ color: '#f1f5f9', fontWeight: 500, marginBottom: 4 }}>
                  {currentOrg.name}
                </div>
                
                {/* Invite User Button (admin only) */}
                {canInviteUsers && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsOpen(false)
                      setShowInviteModal(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'rgba(45, 212, 191, 0.1)',
                      border: '1px solid rgba(45, 212, 191, 0.3)',
                      borderRadius: 8,
                      color: '#2dd4bf',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginTop: 12
                    }}
                  >
                    + Invite user
                  </button>
                )}
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
                            {org.endedAt && `Left ${formatDate(org.endedAt)}`}
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 32,
            maxWidth: 480,
            width: '90%'
          }}>
            <h2 style={{ color: '#f1f5f9', marginBottom: 24, fontSize: '1.5rem', fontWeight: 600 }}>
              Invite Team Member
            </h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: 8, fontSize: '0.9rem' }}>
                Email address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: 8, fontSize: '0.9rem' }}>
                Role
              </label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                  setInviteRole('member')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteEmail}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: inviteEmail ? '#2dd4bf' : 'rgba(45, 212, 191, 0.3)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#0f172a',
                  fontWeight: 600,
                  cursor: inviteEmail ? 'pointer' : 'not-allowed',
                  fontSize: '0.95rem'
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default OrgSwitcher
