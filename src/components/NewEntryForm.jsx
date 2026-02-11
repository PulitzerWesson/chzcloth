import React, { useState } from 'react';
import { useIdeas } from '../hooks/useIdeas';

function NewEntryForm({ currentOrg, currentUser, onCancel, onSuccess }) {
  const { submitIdea } = useIdeas(currentOrg?.orgId);
  const [entryType, setEntryType] = useState('idea'); // signal, idea, bet
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    expectedImpact: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    setSubmitting(true);

    try {
      const ideaData = {
        title: formData.title,
        description: formData.description,
        problem: formData.problem || null,
        expectedImpact: formData.expectedImpact || null,
        entry_type: entryType
      };

      const { data, error } = await submitIdea(ideaData);

      if (error) throw error;

      if (onSuccess) onSuccess(data);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        problem: '',
        expectedImpact: ''
      });
      
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Error submitting entry: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const entryTypeConfig = {
    signal: {
      label: 'Signal',
      color: '#7dd3fc',
      bg: 'rgba(125, 211, 252, 0.15)',
      description: 'External demand or market insight'
    },
    idea: {
      label: 'Idea',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      description: 'Internal product concept'
    },
    bet: {
      label: 'Bet',
      color: '#2dd4bf',
      bg: 'rgba(45, 212, 191, 0.15)',
      description: 'Fully formed proposal ready to sponsor'
    }
  };

  return (
    <div style={{ padding: '40px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Submit New Entry
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Add a signal, idea, or bet to the marketplace for others to refine or sponsor.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Entry Type Selection */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 12 
            }}>
              Entry Type
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {Object.entries(entryTypeConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEntryType(key)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: entryType === key ? config.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${entryType === key ? config.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ 
                    color: entryType === key ? config.color : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    marginBottom: 4
                  }}>
                    {config.label}
                  </div>
                  <div style={{ 
                    color: '#64748b',
                    fontSize: '0.75rem',
                    lineHeight: 1.4
                  }}>
                    {config.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 8 
            }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief, clear title for this entry"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 8 
            }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this entry about? Provide context and details."
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />
          </div>

          {/* Problem (Optional) */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 8 
            }}>
              Problem (Optional)
            </label>
            <textarea
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="What problem does this solve? Who has this problem?"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />
          </div>

          {/* Expected Impact (Optional) */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 8 
            }}>
              Expected Impact (Optional)
            </label>
            <textarea
              value={formData.expectedImpact}
              onChange={(e) => setFormData({ ...formData, expectedImpact: e.target.value })}
              placeholder="What would success look like? Metrics, outcomes, or goals."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#94a3b8',
                fontSize: '0.95rem',
                fontWeight: 600,
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
                padding: '12px 24px',
                background: submitting 
                  ? 'rgba(45, 212, 191, 0.5)' 
                  : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0f1a',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit to Marketplace'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default NewEntryForm;
