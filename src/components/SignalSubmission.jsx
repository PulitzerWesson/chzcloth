import React, { useState } from 'react';

function SignalSubmission({ currentOrg, currentUser, onSubmit, onCancel, initialProblem = '' }) {
  const [problem, setProblem] = useState(initialProblem);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!problem.trim()) {
      alert('Please describe the problem');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        description: problem,
        entry_type: 'signal',
        status: 'pending',
        submitted_by: currentUser.id,
        submitted_by_email: currentUser.email,
        org_id: currentOrg.orgId,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error submitting signal:', error);
      alert('Error submitting signal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '60px 24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: '#f1f5f9',
            marginBottom: 12 
          }}>
            Capture Signal
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            What problem are you observing? This could be customer feedback, 
            support tickets, sales objections, or market insights.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Problem Statement */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontSize: '0.95rem', 
              fontWeight: 600,
              marginBottom: 12 
            }}>
              Problem Statement *
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe the problem, customer request, or market insight you've observed. Be specific about what you're seeing and where it's coming from."
              required
              rows={10}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6,
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              color: '#64748b', 
              fontSize: '0.85rem', 
              marginTop: 8 
            }}>
              Examples: "Customers keep asking for dark mode in support tickets", 
              "Lost 3 deals this month because no SSO", "Reddit thread with 500+ upvotes requesting this feature"
            </div>
          </div>

          {/* Info box */}
          <div style={{
            background: 'rgba(125, 211, 252, 0.1)',
            border: '1px solid rgba(125, 211, 252, 0.3)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 32
          }}>
            <div style={{ 
              color: '#7dd3fc', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 6 
            }}>
              💡 About Signals
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Signals are raw demand indicators. They're not scored by AI, but they're 
              counted and aggregated. When someone later submits an Idea that relates to 
              this Signal, it will boost that Idea's relevance score.
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#94a3b8',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px 28px',
                background: submitting 
                  ? 'rgba(125, 211, 252, 0.5)' 
                  : 'linear-gradient(135deg, #7dd3fc 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0f1a',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting Signal...' : 'Submit to Marketplace'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default SignalSubmission;
