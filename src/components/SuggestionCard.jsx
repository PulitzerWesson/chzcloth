import React from 'react';

/**
 * Display AI suggestions for alternative or complementary approaches
 * Shows after scoring Ideas or Bets
 */
function SuggestionCard({ suggestion, onReplace, onIgnore, type = 'bet' }) {
  if (!suggestion || !suggestion.type) {
    return null; // No suggestion needed
  }

  const isAlternative = suggestion.type === 'alternative';
  const isComplement = suggestion.type === 'complement';

  const config = {
    alternative: {
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.1)',
      border: 'rgba(251, 191, 36, 0.3)',
      icon: '🔄',
      title: 'AI Detected Stronger Alternative',
      subtitle: 'Market research suggests a different approach'
    },
    complement: {
      color: '#7dd3fc',
      bg: 'rgba(125, 211, 252, 0.1)',
      border: 'rgba(125, 211, 252, 0.3)',
      icon: '✨',
      title: 'AI Enhancement Suggestion',
      subtitle: 'Consider adding this to strengthen your approach'
    }
  };

  const style = config[suggestion.type];

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 12,
      padding: 24,
      marginTop: 24
    }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: 16 
      }}>
        <div style={{ fontSize: '1.5rem' }}>{style.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: style.color, 
            fontWeight: 700, 
            fontSize: '1.1rem',
            marginBottom: 4 
          }}>
            {style.title}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {style.subtitle}
          </div>
        </div>
        <div style={{
          background: `${style.color}20`,
          color: style.color,
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          Expected: {suggestion.expected_score}/100
        </div>
      </div>

      {/* Reasoning */}
      <div style={{ 
        color: '#cbd5e1', 
        fontSize: '0.95rem', 
        lineHeight: 1.6,
        marginBottom: 20,
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        borderLeft: `3px solid ${style.color}`
      }}>
        {suggestion.reasoning}
      </div>

      {/* Suggestion Details */}
      <div style={{ 
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }}>
        {type === 'bet' ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                {isAlternative ? 'Alternative Hypothesis:' : 'Complementary Hypothesis:'}
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 500 }}>
                {suggestion.hypothesis}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                Success Metrics:
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                {suggestion.metrics}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                Estimated Effort:
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                {suggestion.effort}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                {isAlternative ? 'Alternative Problem:' : 'Complementary Problem:'}
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 500 }}>
                {suggestion.problem}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                Proposal:
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                {suggestion.proposal}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                Reach:
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                {suggestion.reach}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>
                Expected Impact:
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                {suggestion.impact}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Market Evidence */}
      <div style={{
        background: 'rgba(125, 211, 252, 0.05)',
        border: '1px solid rgba(125, 211, 252, 0.15)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
      }}>
        <div style={{ 
          color: '#7dd3fc', 
          fontSize: '0.8rem', 
          fontWeight: 600,
          marginBottom: 6 
        }}>
          📊 Market Evidence
        </div>
        <div style={{ 
          color: '#94a3b8', 
          fontSize: '0.85rem', 
          lineHeight: 1.5 
        }}>
          {suggestion.market_evidence}
        </div>
        {suggestion.competitive_insight && (
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '0.85rem', 
            lineHeight: 1.5,
            marginTop: 8,
            fontStyle: 'italic'
          }}>
            💡 {suggestion.competitive_insight}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onReplace}
          style={{
            flex: 1,
            padding: '12px 20px',
            background: `linear-gradient(135deg, ${style.color} 0%, ${style.color}dd 100%)`,
            border: 'none',
            borderRadius: 8,
            color: '#0a0f1a',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isAlternative ? 'Replace with This' : 'Add This Enhancement'}
        </button>
        <button
          onClick={onIgnore}
          style={{
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Keep Original
        </button>
      </div>

    </div>
  );
}

export default SuggestionCard;
