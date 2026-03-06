import React, { useState } from 'react'

export function OrgSwitcher({
  organizations,
  currentOrg,
  onSwitch,
  onAddOrg,
  onAddCompany,   // (orgId, { name, website }) => void
  canInviteUsers
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [newCompany, setNewCompany] = useState({ name: '', website: '' })
  const [addingCompany, setAddingCompany] = useState(false)

  const handleSendInvite = async () => {
    if (!inviteEmail) return
    try {
      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, orgId: currentOrg.orgId, role: 'member' })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setShowInviteModal(false)
      setInviteEmail('')
      alert(data.existing
        ? `${inviteEmail} has been added to your team.`
        : `Invite sent to ${inviteEmail}.`)
    } catch (error) {
      alert(error.message || 'Failed to send invite')
    }
  }

  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) return
    setAddingCompany(true)
    try {
      await onAddCompany(currentOrg.orgId, newCompany)
      setNewCompany({ name: '', website: '' })
      setShowAddCompany(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingCompany(false)
    }
  }

  if (!currentOrg) {
    return (
      <button
        onClick={onAddOrg}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px',
          background: 'rgba(45,212,191,0.1)',
          border: '1px solid rgba(45,212,191,0.3)',
          borderRadius: 8, color: '#2dd4bf', fontSize: '0.9rem', cursor: 'pointer'
        }}
      >
        + Add Team
      </button>
    )
  }

  const otherOrgs = organizations.filter(o => o.orgId !== currentOrg.orgId && !o.endedAt)
  const pastOrgs  = organizations.filter(o => o.orgId !== currentOrg.orgId && o.endedAt)

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.95rem' }}>
            {currentOrg.name}
          </span>
          <span style={{ color: '#64748b', marginLeft: 4 }}>▾</span>
        </button>

        {isOpen && (
          <>
            <div onClick={() => { setIsOpen(false); setShowAddCompany(false) }}
              style={{ position: 'fixed', inset: 0, zIndex: 90 }} />

            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              minWidth: 300,
              background: '#1a1f2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 100, overflow: 'hidden'
            }}>

              {/* ── Current team ─────────────────────────────────────────── */}
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Current Team
                </div>
                <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 8 }}>
                  {currentOrg.name}
                </div>

                {/* Associated companies */}
                {currentOrg.companies && currentOrg.companies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {currentOrg.companies.map(c => (
                      <span key={c.id} style={{
                        padding: '3px 10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        color: '#94a3b8',
                        fontSize: '0.78rem',
                      }}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Add company inline */}
                {showAddCompany ? (
                  <div style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
                    <div style={{ marginBottom: 8 }}>
                      <input
                        type="text"
                        value={newCompany.name}
                        onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))}
                        placeholder="Company name"
                        autoFocus
                        style={{ ...inputStyle, marginBottom: 6 }}
                      />
                      <input
                        type="text"
                        value={newCompany.website}
                        onChange={e => setNewCompany(p => ({ ...p, website: e.target.value }))}
                        placeholder="company.com"
                        onKeyDown={e => e.key === 'Enter' && handleAddCompany()}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setShowAddCompany(false); setNewCompany({ name: '', website: '' }) }}
                        style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCompany}
                        disabled={!newCompany.name.trim() || addingCompany}
                        style={{ flex: 1, padding: '8px', background: newCompany.name.trim() ? '#2dd4bf' : 'rgba(45,212,191,0.2)', border: 'none', borderRadius: 6, color: '#0a0f1a', fontSize: '0.85rem', fontWeight: 600, cursor: newCompany.name.trim() ? 'pointer' : 'not-allowed' }}
                      >
                        {addingCompany ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setShowAddCompany(true) }}
                    style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.1)' }}
                  >
                    + Add company
                  </button>
                )}

                {/* Invite */}
                {canInviteUsers && !showAddCompany && (
                  <button
                    onClick={e => { e.stopPropagation(); setIsOpen(false); setShowInviteModal(true) }}
                    style={{
                      width: '100%', marginTop: 12,
                      padding: '10px 16px',
                      background: 'rgba(45,212,191,0.1)',
                      border: '1px solid rgba(45,212,191,0.3)',
                      borderRadius: 8, color: '#2dd4bf',
                      fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer'
                    }}
                  >
                    + Invite teammate
                  </button>
                )}
              </div>

              {/* ── Other teams ──────────────────────────────────────────── */}
              {otherOrgs.length > 0 && (
                <div style={{ padding: '8px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px', marginBottom: 2 }}>
                    Switch team
                  </div>
                  {otherOrgs.map(org => (
                    <button
                      key={org.orgId}
                      onClick={() => { onSwitch(org.orgId); setIsOpen(false) }}
                      style={{
                        width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: 'transparent', border: 'none', borderRadius: 8,
                        cursor: 'pointer', transition: 'background 0.15s', gap: 4
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '0.9rem' }}>{org.name}</span>
                      {org.companies && org.companies.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {org.companies.map(c => (
                            <span key={c.id} style={{ padding: '2px 7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#475569', fontSize: '0.72rem' }}>
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Past teams ───────────────────────────────────────────── */}
              {pastOrgs.length > 0 && (
                <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px', marginBottom: 2 }}>
                    Past
                  </div>
                  {pastOrgs.map(org => (
                    <button
                      key={org.orgId}
                      onClick={() => { onSwitch(org.orgId); setIsOpen(false) }}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8,
                        cursor: 'pointer', transition: 'background 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: '#475569', fontSize: '0.88rem' }}>{org.name}</span>
                      <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', color: '#334155' }}>
                        {formatDate(org.endedAt)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Footer actions ───────────────────────────────────────── */}
              <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => { setIsOpen(false); onAddOrg() }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px', background: 'transparent', border: 'none',
                    borderRadius: 8, color: '#2dd4bf', fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(45,212,191,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>+</span>
                  <span>New team</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Invite Modal ─────────────────────────────────────────────────── */}
      {showInviteModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, maxWidth: 480, width: '90%' }}>
            <h2 style={{ color: '#f1f5f9', marginBottom: 8, fontSize: '1.5rem', fontWeight: 600 }}>
              Invite a teammate
            </h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
              They'll get full access — submit bets, approve, view everything.
            </p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: 8, fontSize: '0.9rem' }}>
                Email address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendInvite()}
                placeholder="colleague@company.com"
                autoFocus
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#f1f5f9', fontSize: '1rem',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setShowInviteModal(false); setInviteEmail('') }}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteEmail}
                style={{ flex: 1, padding: '12px', background: inviteEmail ? '#2dd4bf' : 'rgba(45,212,191,0.3)', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 600, cursor: inviteEmail ? 'pointer' : 'not-allowed', fontSize: '0.95rem' }}
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default OrgSwitcher
