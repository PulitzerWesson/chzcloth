import React, { useState } from 'react';
import { useIdeas } from '../hooks/useIdeas';

function IdeasQueue({ currentOrg, onClaimIdea, onStructureBet }) {
  const { ideas, loading, claimIdea, unclaimIdea, getStats } = useIdeas(currentOrg?.orgId);
  const [filter, setFilter] = useState('all'); // pending, claimed, all
  
  const stats = getStats();
  
  const filteredIdeas = filter === 'all' 
    ? ideas 
    : ideas.filter(i => i.status === filter);

  const handleClaim = async (ideaId) => {
    const { error } = await claimIdea(ideaId);
    if (error) {
      alert('Error claiming idea: ' + error.message);
    } else if (onClaimIdea) {
      onClaimIdea(ideaId);
    }
  };

  const handleUnclaim = async (ideaId) => {
    const { error } = await unclaimIdea(ideaId);
    if (error) {
      alert('Error unclaiming idea: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
        Loading ideas...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Ideas Queue
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Review ideas from the team and claim ones you want to structure into bets.
          </p>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: 16, 
          marginBottom: 32 
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 10, 
            padding: 16, 
            textAlign: 'center' 
          }}>
            <div style={{ color: '#2dd4bf', fontSize: '1.75rem', fontWeight: 800 }}>
              {stats.pendingIdeas}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Pending</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 10, 
            padding: 16, 
            textAlign: 'center' 
          }}>
            <div style={{ color: '#fbbf24', fontSize: '1.75rem', fontWeight: 800 }}>
              {stats.myClaimedCount}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>My Claims</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 10, 
            padding: 16, 
            textAlign: 'center' 
          }}>
            <div style={{ color: '#7dd3fc', fontSize: '1.75rem', fontWeight: 800 }}>
              {stats.structuredIdeas}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Structured</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { value: 'pending', label: 'Pending', count: stats.pendingIdeas },
            { value: 'claimed', label: 'Claimed', count: stats.claimedIdeas },
            { value: 'all', label: 'All', count: stats.totalIdeas }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 16px',
                background: filter === f.value 
                  ? 'rgba(45, 212, 191, 0.15)' 
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f.value ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                color: filter === f.value ? '#2dd4bf' : '#94a3b8',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {f.label}
              <span style={{ 
                fontSize: '0.75rem', 
                color: filter === f.value ? '#2dd4bf' : '#64748b' 
              }}>
                ({f.count})
              </span>
            </button>
          ))}
        </div>

        {/* Ideas list */}
        {filteredIdeas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b' 
          }}>
            No {filter !== 'all' ? filter : ''} ideas yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredIdeas.map(idea => (
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
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      marginBottom: 8 
                    }}>
                      <h3 style={{ 
                        color: '#f1f5f9', 
                        fontSize: '1.1rem', 
                        fontWeight: 600,
                        margin: 0 
                      }}>
                        {idea.title}
                      </h3>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: idea.status === 'pending' ? '#2dd4bf' : '#fbbf24',
                        background: idea.status === 'pending' 
                          ? 'rgba(45, 212, 191, 0.15)' 
                          : 'rgba(251, 191, 36, 0.15)',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}>
                        {idea.status}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#64748b' 
                    }}>
                      Submitted by {idea.submittedByEmail} • {new Date(idea.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

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
                    <button
                      onClick={() => handleClaim(idea.id)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(45, 212, 191, 0.15)',
                        border: '1px solid rgba(45, 212, 191, 0.3)',
                        borderRadius: 8,
                        color: '#2dd4bf',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Claim & Structure →
                    </button>
                  )}

                  {idea.status === 'claimed' && (
                    <>
                      <button
                        onClick={() => handleUnclaim(idea.id)}
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
                        Structure Bet →
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IdeasQueue;
