import React, { useState } from 'react';

// CHZCLOTH Badge component
const CHZCLOTHBadge = () => (
  <span 
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
      borderRadius: '50%',
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#0a0f1a',
      marginLeft: 6
    }}
    title="AI-Enhanced by CHZCLOTH"
  >
    C
  </span>
);

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
            const isAIEnhanced = betData?.aiEnhanced || idea.ai_enhanced;
            const aiScore = betData?.aiPredictedScore || null;
            
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
      lineHeight: 1.4,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }}>
      <span>{idea.title}</span>
    
    </h3>
    <div style={{ 
      fontSize: '0.8rem', 
      color: '#64748b' 
    }}>
      Submitted by {idea.submittedByEmail} • {new Date(idea.createdAt).toLocaleDateString()}
    </div>
  </div>

  {/* Scores section - CHZCLOTH score first, then dimensions */}
  <div style={{ 
    display: 'flex', 
    gap: 12, 
    flexShrink: 0,
    alignItems: 'center'
  }}>
{/* CHZCLOTH Score - Logo + Score */}
{isAIEnhanced && aiScore ? (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(45, 212, 191, 0.1)',
    border: '2px solid rgba(45, 212, 191, 0.4)',
    borderRadius: 10,
    padding: '8px 12px'
  }}>
    {/* CHZCLOTH C logo */}
    <svg width="28" height="28" viewBox="0 0 32 32">
      <defs>
        <linearGradient id={`chz-grad-${idea.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#2dd4bf'}} />
          <stop offset="100%" style={{stopColor: '#22d3ee'}} />
        </linearGradient>
      </defs>
      <text 
        x="16" 
        y="22" 
        fontFamily="Arial, sans-serif" 
        fontSize="14" 
        fontWeight="bold" 
        fill={`url(#chz-grad-${idea.id})`}
        textAnchor="middle"
      >
        C
      </text>
    </svg>
    
    {/* Score */}
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2dd4bf', lineHeight: 1 }}>
      {aiScore}
    </div>
  </div>
) : null}

{/* Dimension scores - compact */}
{(idea.viability_score || idea.relevance_score) && (
  <div style={{ 
    display: 'flex', 
    gap: 8, 
    flexShrink: 0,
    paddingLeft: 8,
    borderLeft: '1px solid rgba(255,255,255,0.1)'
  }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>APR</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2dd4bf' }}>
            {idea.viability_score || '-'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>POT</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fbbf24' }}>
            {betData?.potentialScore || '-'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>FIT</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#7dd3fc' }}>
            {idea.relevance_score || '-'}
          </div>
        </div>
      </div>
    )}
  </div>
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
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b', 
                          marginBottom: 12, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
CHZCLOTH SCORING RATIONALE
{isAIEnhanced && <span style={{ color: '#2dd4bf', fontWeight: 700 }}>• ENHANCED</span>}
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

                {/* Metrics & Prediction - using bet_data */}
                {betData && (betData.metric || betData.prediction) && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>
                    {betData.metric && (
                      <>
                        Metric: <span style={{ color: '#2dd4bf' }}>{betData.metric}</span>
                        {betData.prediction && ' • '}
                      </>
                    )}
                    {betData.prediction && (
                      <>
                        Prediction: <span style={{ color: '#94a3b8' }}>{betData.prediction}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onClaimAndStructure && onClaimAndStructure(idea)}
                    style={{
                      padding: '10px 24px',
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
