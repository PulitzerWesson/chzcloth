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

const StrategicAlignmentIcon = ({ alignment }) => {
  const normalized = alignment?.toLowerCase();
  
  
  // Inner Ring - grows from dot to full, then pauses
  if (normalized === 'inner' || normalized === 'inner_ring' || normalized === 'inner ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes growFromDot {
            0% { transform: scale(0); opacity: 0; }
            22% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .grow-circle { 
            animation: growFromDot 9s ease-out infinite;
            transform-origin: center;
          }
        `}</style>
        <circle cx="14" cy="14" r="12" stroke="url(#tealGradient)" strokeWidth="2.5" fill="none"/>
        <circle className="grow-circle" cx="14" cy="14" r="6" fill="url(#tealGradient)"/>
        <defs>
          <linearGradient id="tealGradient" x1="2" y1="2" x2="26" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
  // Outer Ring - draws stroke, then pauses
  if (normalized === 'outer' || normalized === 'outer_ring' || normalized === 'outer ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes draw {
            0% { stroke-dashoffset: 75.4; }
            30% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
          .draw-circle { 
            stroke-dasharray: 75.4;
            animation: draw 10s linear infinite;
          }
        `}</style>
        <circle 
          className="draw-circle"
          cx="14" 
          cy="14" 
          r="12" 
          stroke="url(#tealGradient2)" 
          strokeWidth="3" 
          fill="none"
        />
        <circle cx="14" cy="14" r="6" fill="#1e293b"/>
        <defs>
          <linearGradient id="tealGradient2" x1="2" y1="2" x2="26" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
// Experimental - spread out bubbles, rise to top
if (normalized === 'experimental') {
  return (
    <svg width="20" height="20" viewBox="0 0 24 28" fill="none">
      <style>{`
        @keyframes bubble1 {
          0% { cy: 20; opacity: 0; }
          20% { opacity: 1; }
          100% { cy: 3; opacity: 0; }
        }
        @keyframes bubble2 {
          0% { cy: 20; opacity: 0; }
          20% { opacity: 1; }
          100% { cy: 3.5; opacity: 0; }
        }
        @keyframes bubble3 {
          0% { cy: 20; opacity: 0; }
          20% { opacity: 1; }
          100% { cy: 3; opacity: 0; }
        }
        .bubble1 { animation: bubble1 2.5s ease-in infinite; }
        .bubble2 { animation: bubble2 2.5s ease-in infinite 0.8s; }
        .bubble3 { animation: bubble3 2.5s ease-in infinite 1.6s; }
      `}</style>
      <path 
        d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" 
        stroke="url(#beakerGradient)" 
        strokeWidth="2" 
        fill="none"
      />
      <line x1="8" y1="2" x2="16" y2="2" stroke="url(#beakerGradient)" strokeWidth="2"/>
      {/* Spread out timing, rise to top */}
      <circle className="bubble1" cx="9" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
      <circle className="bubble2" cx="12" cy="20" r="1.8" fill="#22d3ee" opacity="0"/>
      <circle className="bubble3" cx="15" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
      <defs>
        <linearGradient id="beakerGradient" x1="4" y1="2" x2="20" y2="26">
          <stop offset="0%" stopColor="#2dd4bf"/>
          <stop offset="100%" stopColor="#22d3ee"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
  
  return null;
};

const LEVER_COLORS = {
  Revenue:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e' },
  Retention:   { bg: 'rgba(45,212,191,0.15)',  border: 'rgba(45,212,191,0.3)',  text: '#2dd4bf' },
  Acquisition: { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Efficiency:  { bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.3)', text: '#7dd3fc' },
  Platform:    { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
  Experience:  { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)',  text: '#f97316' },
  Risk:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
};

const leverColor = (lever) => LEVER_COLORS[lever] || { 
  bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94a3b8' 
};

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
                  padding: 20,
                  display: 'flex',
                  gap: 16
                }}
              >
                {/* Strategic Alignment Icon */}
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <StrategicAlignmentIcon alignment={betData?.strategicAlignment} />
                </div>

{/* Card Content */}
<div style={{ flex: 1 }}>
  {/* Title + Scores Row */}
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 8 
  }}>
    {/* Title section with product label */}
    <div style={{ flex: 1, paddingRight: 16 }}>
      {/* Product label */}
      {(idea.product || betData?.product) && (
        <div style={{
          color: '#fbbf24',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 6
        }}>
          {idea.product || betData?.product}
        </div>
      )}
      
      <h3 style={{ 
        color: '#f1f5f9', 
        fontSize: '1.05rem', 
        fontWeight: 600,
        margin: 0,
        lineHeight: 1.4
      }}>
        {idea.title}
      </h3>
    </div>

    {/* Scores */}
    <div style={{ 
      display: 'flex', 
      gap: 0, 
      flexShrink: 0,
      alignItems: 'center'
    }}>
                      {/* CHZ Score */}
                      {isAIEnhanced && aiScore ? (
                        <div style={{ textAlign: 'center', paddingRight: 8 }}>
                          <div style={{ fontSize: '0.7rem', color: '#2dd4bf', marginBottom: 2, fontWeight: 700, letterSpacing: '0.05em', textShadow: '0 0 10px rgba(45, 212, 191, 0.6)' }}>
                            CHZ
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2dd4bf', textShadow: '0 0 15px rgba(45, 212, 191, 0.8)' }}>
                            {aiScore}
                          </div>
                        </div>
                      ) : null}

                      {/* Dimension scores */}
                      {(idea.viability_score || idea.relevance_score) && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
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

                  {/* Summary line */}
{(idea.summary || betData?.summary) && (
  <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 12 }}>
    {idea.summary || betData?.summary}
  </div>
)}

                  {/* Meta info with mode badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>
                  {(idea.lever || betData?.lever) && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      background: leverColor(idea.lever || betData?.lever).bg,
                      border: `1px solid ${leverColor(idea.lever || betData?.lever).border}`,
                      borderRadius: 6,
                      color: leverColor(idea.lever || betData?.lever).text,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {idea.lever || betData?.lever}
                    </span>
                  )}
                  <span>•</span>
                    <span>Submitted by {idea.submittedByEmail}</span>
                    <span>•</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Expandable details */}
                  {betData?.scoringRationale && (
                    <div style={{ marginBottom: 16 }}>
                      <button
                        onClick={() => setExpandedRationale(isExpanded ? null : idea.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2dd4bf',
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
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    fontSize: '0.85rem',
    lineHeight: 1.6
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

      {betData?.hypothesis && (
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#64748b', marginBottom: 6, fontSize: '0.85rem' }}>Full Hypothesis:</div>
          <div style={{ color: '#f1f5f9', lineHeight: 1.6, fontSize: '0.95rem' }}>{betData.hypothesis}</div>
        </div>
      )}
      
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
       betData.strategicAlignment === 'outer' ? 'Outer Ring' : 'Experimental'}
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
      
      {betData?.assumptions && (
        <div>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Assumptions:</div>
          <div style={{ color: '#94a3b8' }}>{betData.assumptions}</div>
        </div>
      )}
    </div>
    
    <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
      
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Approach:</span>
        <span style={{ color: '#94a3b8', marginLeft: 8 }}>{betData?.scoringRationale?.approach?.rationale}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>Potential:</span>
        <span style={{ color: '#94a3b8', marginLeft: 8 }}>{betData?.scoringRationale?.potential?.rationale}</span>
      </div>
      <div>
        <span style={{ color: '#7dd3fc', fontWeight: 600 }}>Fit:</span>
        <span style={{ color: '#94a3b8', marginLeft: 8 }}>{betData?.scoringRationale?.fit?.rationale}</span>
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
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default IdeasQueue;
