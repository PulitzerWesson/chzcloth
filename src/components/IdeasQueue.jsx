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
  
  // Only show bets (filter out any non-bet entries)
  const betIdeas = ideas.filter(i => i.entry_type === 'bet' || !i.entry_type);

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
        Loading marketplace...
      </div>
    );
  }

  // Score badge component for compact display
  const ScoreBadge = ({ score, label }) => {
    const getScoreColor = (s) => {
      if (s >= 80) return '#2dd4bf';
      if (s >= 60) return '#fbbf24';
      return '#ef4444';
    };
    
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6,
        padding: '4px 12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 6,
        border: `1px solid ${getScoreColor(score)}40`
      }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</span>
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          color: getScoreColor(score) 
        }}>
          {score}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Header - no button */}
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
            const hasScores = idea.viability_score || idea.relevance_score || idea.overall_score;
            const isExpanded = expandedRationale === idea.id;
            
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
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12 
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#f1f5f9', 
                      fontSize: '1.1rem', 
                      fontWeight: 600,
                      margin: '0 0 8px 0' 
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
                </div>

                {/* AI Scores - Compact display */}
                {hasScores && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      marginBottom: 8 
                    }}>
                      {idea.overall_score && <ScoreBadge score={idea.overall_score} label="Overall" />}
                      {idea.viability_score && <ScoreBadge score={idea.viability_score} label="Viability" />}
                      {idea.relevance_score && <ScoreBadge score={idea.relevance_score} label="Relevance" />}
                      
                      {idea.scoring_rationale && (
                        <button
                          onClick={() => setExpandedRationale(isExpanded ? null : idea.id)}
                          style={{
                            padding: '4px 10px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 6,
                            color: '#7dd3fc',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            marginLeft: 'auto'
                          }}
                        >
                          {isExpanded ? 'Hide' : 'Why?'}
                        </button>
                      )}
                    </div>
                    
                    {/* Rationale - Expandable */}
                    {isExpanded && idea.scoring_rationale && (
                      <div style={{
                        background: 'rgba(125, 211, 252, 0.05)',
                        border: '1px solid rgba(125, 211, 252, 0.15)',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        lineHeight: 1.6
                      }}>
                        {idea.scoring_rationale}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div style={{ 
                  color: '#cbd5e1', 
                  lineHeight: 1.6, 
                  marginBottom: 16 
                }}>
                  {idea.description}
                </div>

                {/* Optional fields */}
                {idea.problem && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                      Problem:
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {idea.problem}
                    </div>
                  </div>
                )}

                {idea.expectedImpact && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                      Expected Impact:
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {idea.expectedImpact}
                    </div>
                  </div>
                )}

                {/* Claimed info */}
                {idea.status === 'claimed' && idea.claimedByEmail && (
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: '0.85rem',
                    color: '#fbbf24'
                  }}>
                    ⚡ Claimed by {idea.claimedByEmail} on {new Date(idea.claimedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {idea.status === 'pending' && (
                    <>
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
                    </>
                  )}

                  {idea.status === 'claimed' && (
                    <>
                      <button
                        onClick={() => onUnclaimIdea && onUnclaimIdea(idea.id)}
                        style={{
                          padding: '10px 16px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          color: '#94a3b8',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        Unclaim
                      </button>
                      <button
                        onClick={() => onStructureBet && onStructureBet(idea)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                          border: 'none',
                          borderRadius: 8,
                          color: '#0a0f1a',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Sponsor Bet →
                      </button>
                    </>
                  )}
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
