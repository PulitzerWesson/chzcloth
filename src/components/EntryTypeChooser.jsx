import React from 'react';

function EntryTypeChooser({ onSelect, onCancel }) {
  
  const entryTypes = [
    {
      type: 'signal',
      label: 'Signal',
      icon: '◎',
      color: '#7dd3fc',
      bg: 'rgba(125, 211, 252, 0.15)',
      description: 'Quick capture - External demand or market insight',
      details: 'Fast submission with source and context'
    },
    {
      type: 'idea',
      label: 'Idea',
      icon: '◆',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      description: 'Product concept - Internal proposal with depth',
      details: 'Problem, solution, and expected impact'
    },
    {
      type: 'bet',
      label: 'Bet',
      icon: '▤',
      color: '#2dd4bf',
      bg: 'rgba(45, 212, 191, 0.15)',
      description: 'Full proposal - Hypothesis with metrics and AI scoring',
      details: 'Complete multi-step workflow with AI evaluation'
    }
  ];

  return (
    <div style={{ padding: '60px 24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: '#f1f5f9',
            marginBottom: 12 
          }}>
            What type of entry?
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Choose the level of detail for your submission
          </p>
        </div>

        {/* Entry type cards */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 20,
          marginBottom: 32
        }}>
          {entryTypes.map(entry => (
            <button
              key={entry.type}
              onClick={() => onSelect(entry.type)}
              style={{
                padding: '24px 28px',
                background: entry.bg,
                border: `1px solid ${entry.color}40`,
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = entry.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${entry.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${entry.color}40`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div style={{ 
                fontSize: '2.5rem',
                color: entry.color,
                lineHeight: 1
              }}>
                {entry.icon}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: entry.color,
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  marginBottom: 10
                }}>
                  {entry.label}
                </div>
                
                <div style={{ 
                  color: '#e0e0e0',
                  fontSize: '1rem',
                  marginBottom: 8,
                  lineHeight: 1.6
                }}>
                  {entry.description}
                </div>
                
                <div style={{ 
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  {entry.details}
                </div>
              </div>
              
              {/* Arrow */}
              <div style={{ 
                color: entry.color,
                fontSize: '1.75rem',
                opacity: 0.5
              }}>
                →
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 32px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#94a3b8',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            ← Back to Marketplace
          </button>
        </div>

      </div>
    </div>
  );
}

export default EntryTypeChooser;
