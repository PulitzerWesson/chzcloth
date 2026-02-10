import React, { useState } from 'react';

function IdeaSubmission({ onSubmit, onCancel }) {
  const [idea, setIdea] = useState({
    title: '',
    description: '',
    problem: '',
    expectedImpact: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!idea.title || !idea.description) return;
    
    setSubmitting(true);
    await onSubmit(idea);
    setSubmitting(false);
  };

  const canSubmit = idea.title.trim().length > 0 && idea.description.trim().length > 20;

  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
          Submit an Idea
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
          Got an idea that could move the needle? Share it with the team. An Executor will review and structure it into a testable bet.
        </p>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            Idea title <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            type="text"
            value={idea.title}
            onChange={e => setIdea({ ...idea, title: e.target.value })}
            placeholder="e.g., Add email digests to improve retention"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What's the idea? <span style={{ color: '#f87171' }}>*</span>
          </label>
          <textarea
            value={idea.description}
            onChange={e => setIdea({ ...idea, description: e.target.value })}
            placeholder="Describe what you want to build or try. Don't worry about perfect structure — just explain the idea clearly."
            style={{
              width: '100%',
              minHeight: 120,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '1rem',
              lineHeight: 1.6,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Problem (optional) */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What problem does this solve? <span style={{ color: '#64748b' }}>(optional)</span>
          </label>
          <textarea
            value={idea.problem}
            onChange={e => setIdea({ ...idea, problem: e.target.value })}
            placeholder="e.g., Users forget about our product between sessions"
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Expected impact (optional) */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What impact do you expect? <span style={{ color: '#64748b' }}>(optional)</span>
          </label>
          <textarea
            value={idea.expectedImpact}
            onChange={e => setIdea({ ...idea, expectedImpact: e.target.value })}
            placeholder="e.g., Should increase weekly active users by bringing people back"
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Info callout */}
        <div style={{
          background: 'rgba(45, 212, 191, 0.1)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 32,
          fontSize: '0.85rem',
          color: '#94a3b8',
          lineHeight: 1.5
        }}>
          💡 <strong style={{ color: '#2dd4bf' }}>What happens next:</strong> An Executor will review your idea, structure it into a hypothesis with specific metrics, and send it to a Sponsor for approval.
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '14px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: 10,
                color: '#94a3b8',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: canSubmit && !submitting 
                ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' 
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 10,
              color: canSubmit && !submitting ? '#0a0f1a' : '#475569',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Idea →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdeaSubmission;
