import React, { useState } from 'react';

function SponsorReview({ bets, currentOrg, onApprove, onReject, onCancel }) {
  const [selectedBet, setSelectedBet] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter to only pending approval bets
  const pendingBets = bets.filter(b => b.approvalStatus === 'pending_approval');

  const handleApprove = async (bet) => {
    setSubmitting(true);
    await onApprove(bet.id);
    setSubmitting(false);
    setSelectedBet(null);
  };

  const handleReject = async (bet) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    await onReject(bet.id, rejectionReason);
    setSubmitting(false);
    setSelectedBet(null);
    setRejectionReason('');
  };

  if (pendingBets.length === 0) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              marginBottom: 24,
              fontSize: '0.9rem',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            ← Back to Dashboard
          </button>

          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✓</div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: 8 }}>
              All caught up!
            </h2>
            <p style={{ color: '#64748b' }}>No bets waiting for your approval.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: 24,
            fontSize: '0.9rem',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Sponsor Review
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {pendingBets.length} {pendingBets.length === 1 ? 'bet' : 'bets'} waiting for your approval
          </p>
        </div>

        {/* Bets list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingBets.map(bet => (
            <div
              key={bet.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 24
              }}
            >
              {/* Bet header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 12,
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#fbbf24',
                    background: 'rgba(251, 191, 36, 0.15)',
                    padding: '4px 10px',
                    borderRadius: 4
                  }}>
                    Pending Approval
                  </span>
                  {bet.ideaId && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#7dd3fc',
                      background: 'rgba(125, 211, 252, 0.15)',
                      padding: '4px 10px',
                      borderRadius: 4
                    }}>
                      💡 From Ideas Queue
                    </span>
                  )}
                  {bet.strategicAlignment && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 10px',
                      borderRadius: 4
                    }}>
                      {bet.strategicAlignment === 'bullseye' ? '🎯 Bullseye' : 
                       bet.strategicAlignment === 'inner' ? '⭕ Inner Ring' :
                       bet.strategicAlignment === 'outer' ? '⚪ Outer Ring' : '🔲 Edge'}
                    </span>
                  )}
                  {bet.estimatedEffort && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 10px',
                      borderRadius: 4
                    }}>
                      {bet.estimatedEffort}
                    </span>
                  )}
                </div>

                <h3 style={{ 
                  color: '#f1f5f9', 
                  fontSize: '0.85rem', 
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#64748b'
                }}>
                  Hypothesis
                </h3>
                <div style={{ color: '#f1f5f9', lineHeight: 1.6, fontSize: '1.05rem' }}>
                  {bet.hypothesis}
                </div>
              </div>

              {/* Bet details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 16, 
                marginBottom: 20,
                padding: 16,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 8
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>Metric</div>
                  <div style={{ color: '#2dd4bf', fontWeight: 500 }}>{bet.metric}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>Prediction</div>
                  <div style={{ color: '#f1f5f9' }}>{bet.prediction}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>Confidence</div>
                  <div style={{ color: '#fbbf24' }}>{bet.confidence}%</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>Timeframe</div>
                  <div style={{ color: '#f1f5f9' }}>{bet.timeframe} days</div>
                </div>
              </div>

              {/* AI Scores */}
              {bet.approachScore && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.85rem', 
                    marginBottom: 12,
                    fontWeight: 600
                  }}>
                    AI Assessment
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>APPROACH</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2dd4bf' }}>
                        {bet.approachScore}
                      </div>
                      {bet.scoringRationale?.approach?.rationale && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                          {bet.scoringRationale.approach.rationale}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>POTENTIAL</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
                        {bet.potentialScore}
                      </div>
                      {bet.scoringRationale?.potential?.rationale && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                          {bet.scoringRationale.potential.rationale}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>FIT</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7dd3fc' }}>
                        {bet.fitScore}
                      </div>
                      {bet.scoringRationale?.fit?.rationale && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                          {bet.scoringRationale.fit.rationale}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Assumptions & Cheap Test */}
              {(bet.assumptions || bet.cheapTest) && (
                <div style={{ 
                  marginBottom: 20,
                  padding: 16,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 8
                }}>
                  {bet.assumptions && (
                    <div style={{ marginBottom: bet.cheapTest ? 12 : 0 }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
                        Key Assumptions
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {bet.assumptions}
                      </div>
                    </div>
                  )}
                  {bet.cheapTest && (
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
                        Suggested Test
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {bet.cheapTest}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Approval actions */}
              {selectedBet?.id === bet.id ? (
                // Rejection form
                <div style={{ 
                  background: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  borderRadius: 8,
                  padding: 16
                }}>
                  <div style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: 12, fontWeight: 600 }}>
                    Why are you rejecting this bet?
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Explain your reasoning so the team can learn..."
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#f1f5f9',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      marginBottom: 12
                    }}
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => { setSelectedBet(null); setRejectionReason(''); }}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: '#94a3b8',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(bet)}
                      disabled={submitting || !rejectionReason.trim()}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: submitting || !rejectionReason.trim()
                          ? 'rgba(248, 113, 113, 0.3)'
                          : 'rgba(248, 113, 113, 0.2)',
                        border: '1px solid rgba(248, 113, 113, 0.5)',
                        borderRadius: 8,
                        color: submitting || !rejectionReason.trim() ? '#94a3b8' : '#f87171',
                        fontWeight: 600,
                        cursor: submitting || !rejectionReason.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              ) : (
                // Approve/Reject buttons
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setSelectedBet(bet)}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: 'rgba(248, 113, 113, 0.15)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      borderRadius: 8,
                      color: '#f87171',
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(bet)}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: submitting 
                        ? 'rgba(34, 197, 94, 0.3)'
                        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#0a0f1a',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submitting ? 'Approving...' : '✓ Approve'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SponsorReview;
