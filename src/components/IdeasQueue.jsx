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
    gap: 0, 
    flexShrink: 0,
    alignItems: 'center'
  }}>

{/* CHZCLOTH Score - No box, just glow, symmetric spacing */}
{isAIEnhanced && aiScore ? (
  <div style={{ 
    textAlign: 'center',
    paddingRight: 8  // ← ADD THIS - matches the paddingLeft on APR side
  }}>
    <div style={{ 
      fontSize: '0.7rem', 
      color: '#2dd4bf', 
      marginBottom: 2,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textShadow: '0 0 10px rgba(45, 212, 191, 0.6)'
    }}>
      CHZ
    </div>
    <div style={{ 
      fontSize: '1.2rem', 
      fontWeight: 600, 
      color: '#2dd4bf',
      textShadow: '0 0 15px rgba(45, 212, 191, 0.8)'
    }}>
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
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>APR</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2dd4bf' }}>
            {idea.viability_score || '-'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>POT</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fbbf24' }}>
            {betData?.potentialScore || '-'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>FIT</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#7dd3fc' }}>
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
    {/* BET DETAILS */}
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ 
        color: '#94a3b8', 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        marginBottom: 12, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em'
      }}>
        BET DETAILS
      </div>
      
      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <span style={{ color: '#64748b' }}>Metric: </span>
          <span style={{ color: '#2dd4bf' }}>{betData?.metric || idea.metric}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Prediction: </span>
          <span style={{ color: '#94a3b8' }}>{betData?.prediction}</span>
        </div>
        {betData?.baseline && (
          <div>
            <span style={{ color: '#64748b' }}>Baseline: </span>
            <span style={{ color: '#94a3b8' }}>{betData.baseline}</span>
          </div>
        )}
        {betData?.timeframe && (
          <div>
            <span style={{ color: '#64748b' }}>Timeframe: </span>
            <span style={{ color: '#94a3b8' }}>{betData.timeframe} days</span>
          </div>
        )}
        {betData?.confidence && (
          <div>
            <span style={{ color: '#64748b' }}>Confidence: </span>
            <span style={{ color: '#fbbf24' }}>{betData.confidence}%</span>
          </div>
        )}
        {betData?.strategicAlignment && (
          <div>
            <span style={{ color: '#64748b' }}>Strategic Alignment: </span>
            <span style={{ color: '#94a3b8' }}>
              {betData.strategicAlignment === 'bullseye' ? 'Bullseye' : 
               betData.strategicAlignment === 'inner' ? 'Inner Ring' :
               betData.strategicAlignment === 'outer' ? 'Outer Ring' : 'Edge'}
            </span>
          </div>
        )}
        {betData?.estimatedEffort && (
          <div>
            <span style={{ color: '#64748b' }}>Estimated Effort: </span>
            <span style={{ color: '#94a3b8' }}>{betData.estimatedEffort}</span>
          </div>
        )}
      </div>
      
      {/* Assumptions - full width */}
      {betData?.assumptions && (
        <div>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Assumptions:</div>
          <div style={{ color: '#94a3b8' }}>{betData.assumptions}</div>
        </div>
      )}
    </div>
    
    {/* CHZCLOTH SCORING RATIONALE */}
    <div>
      <div style={{ 
        color: '#94a3b8', 
        fontSize: '0.75rem', 
        fontWeight: 600, 
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
          {betData?.scoringRationale?.approach?.rationale}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
          Potential:
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
          {betData?.scoringRationale?.potential?.rationale}
        </div>
      </div>

      <div>
        <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
          Fit:
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
          {betData?.scoringRationale?.fit?.rationale}
        </div>
      </div>
    </div>
  </div>
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
