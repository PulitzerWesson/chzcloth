import React, { useState } from 'react';

function IdeasQueue({ 
  ideas = [], 
  loading = false,
  currentOrg, 
  currentUser, 
  onClaimIdea, 
  onUnclaimIdea,
  onClaimAndStructure, 
  onStructureBet, 
  setScreen
}) {
  const [expandedRationale, setExpandedRationale] = useState(null);
  
  // Only show unclaimed/unsponsored bets
  const betIdeas = ideas.filter(i => 
    (i.entry_type === 'bet' || !i.entry_type) && 
    i.status === 'pending'
  );

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
        Loading marketplace...
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          Marketplace
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Bets waiting for a sponsor. Claim one to add it to your queue.
        </p>
      </div>

      {/* Entries list */}
      {betIdeas.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b' 
        }}>
          No bets in marketplace yet. Create one using the "New Bet" button!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {betIdeas.map(idea => {
            const isExpanded = expandedRationale === idea.id;
            const betData = typeof idea.bet_data === 'string' ? JSON.parse(idea.bet_data) : idea.bet_data;
            
            return (
              <div
                key={idea.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 20
                }}
              >
                {/* Header with scores */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12 
                }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <h3 style={{ 
                      color: '#f1f5f9', 
                      fontSize: '1.05rem', 
                      fontWeight: 600,
                      margin: '0 0 8px 0',
                      lineHeight: 1.4
                    }}>
                      {idea.title}
                    </h3>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#64748b' 
                    }}>
                      Submitted by {idea.submittedByEmail} • {new Date(idea.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Compact scores - top right */}
                  {(idea.viability_score || idea.relevance_score) && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>APR</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2dd4bf' }}>
                          {idea.viability_score || '-'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>POT</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
                          {betData?.potentialScore || '-'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>FIT</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7dd3fc' }}>
                          {idea.relevance_score || '-'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expandable rationale */}
                {betData?.scoringRationale && (
                  <div style={{ marginBottom: 16 }}>
                    <button
                      onClick={() => setExpandedRationale(isExpanded ? null : idea.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span style={{ fontSize: '0.7rem' }}>{isExpanded ? '▼' : '▶'}</span>
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>

                    {isExpanded && (
                      <div style={{
                        marginTop: 12,
                        padding: 16,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 8
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          AI Scoring Rationale
                        </div>
                        
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ color: '#2dd4bf', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                            Approach:
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                            {betData.scoringRationale.approach?.rationale || 'No rationale provided'}
                          </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                            Potential:
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                            {betData.scoringRationale.potential?.rationale || 'No rationale provided'}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                            Fit:
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                            {betData.scoringRationale.fit?.rationale || 'No rationale provided'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Metrics & Effort */}
                {idea.description?.includes('Metrics:') && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Metrics: </span>
                      <span style={{ color: '#2dd4bf', fontSize: '0.9rem' }}>
                        {idea.description.split('Metrics:')[1]?.split('Effort:')[0]?.trim()}
                      </span>
                    </div>
                    {idea.description.includes('Effort:') && (
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Effort: </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                          {idea.description.split('Effort:')[1]?.trim()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => onClaimIdea && onClaimIdea(idea.id)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: 8,
                      color: '#fbbf24',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Refine
                  </button>
                  <button
                    onClick={() => onClaimAndStructure && onClaimAndStructure(idea)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#0a0f1a',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Sponsor →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default IdeasQueue;
