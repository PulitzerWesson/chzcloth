import React, { useState } from 'react';
import { scoreIdea, searchRelatedSignals, formatOrgContext } from '../utils/aiScoring';
import SuggestionCard from './SuggestionCard';

function IdeaSubmission({ 
  currentOrg, 
  currentUser, 
  ideas = [],
  onSubmit, 
  onCancel, 
  initialData = null 
}) {
  const [step, setStep] = useState(initialData ? 2 : 1); // 1 = form, 2 = score
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    problem: initialData?.problem || initialData?.description || '',
    proposal: initialData?.proposal || '',
    reach: initialData?.reach || '',
    impact: initialData?.impact || initialData?.expectedImpact || ''
  });
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState(null);
  const [ignoredSuggestion, setIgnoredSuggestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);

const handleScoreIdea = async (e) => {
  e.preventDefault();
  
  if (!formData.title || !formData.problem || !formData.proposal) {
    alert('Please fill in title, problem, and proposal');
    return;
  }

  setScoring(true);

  try {
    // Count related signals (simple keyword matching)
    const signalCount = ideas.filter(i => {
      if (i.entry_type !== 'signal') return false;
      const signalText = i.description?.toLowerCase() || '';
      const problemKeywords = formData.problem.toLowerCase().split(' ').filter(w => w.length > 4);
      return problemKeywords.some(keyword => signalText.includes(keyword));
    }).length;

    // Call backend API for scoring
    const response = await fetch('/api/score-idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: formData,
        orgMode: currentOrg?.mode || 'startup',
        orgName: currentOrg?.name,
        orgStrategy: currentOrg?.strategy,
        orgIndustry: currentOrg?.industry,
        signalCount
      })
    });
    
    if (!response.ok) throw new Error('Scoring failed');
    
    const aiScores = await response.json();
    
    setScores(aiScores);
    setStep(2);
    
  } catch (error) {
    console.error('Scoring error:', error);
    alert('Error scoring idea: ' + error.message);
  } finally {
    setScoring(false);
  }
};

const handleSubmitToMarketplace = async () => {
  setSubmitting(true);

  try {
    const ideaEntry = {
      title: formData.title,
      description: `${formData.problem}\n\nProposal: ${formData.proposal}`,
      problem: formData.problem,
      proposal: formData.proposal,
      reach: formData.reach,
      expected_impact: formData.impact,
      entry_type: 'idea',
      status: 'pending',
      submitted_by: currentUser.id,
      submitted_by_email: currentUser.email,
      org_id: currentOrg.orgId,
      viability_score: scores.viability_score,
      relevance_score: scores.relevance_score,
      overall_score: scores.overall_score,
      scoring_rationale: scores.scoring_rationale,
      market_insights: scores.market_insights,
      signal_count: scores.signal_support ? parseInt(scores.signal_support.match(/\d+/)?.[0] || 0) : 0, // Extract number from text
      suggestion: scores.suggestion ? JSON.stringify(scores.suggestion) : null, // Store as JSON
      created_at: new Date().toISOString()
    };

    await onSubmit(ideaEntry);
    
  } catch (error) {
    console.error('Error submitting idea:', error);
    alert('Error submitting idea. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const handleReplaceSuggestion = () => {
    if (!scores?.suggestion) return;
    
    // Replace form data with AI suggestion
    setFormData({
      title: formData.title, // Keep original title
      problem: scores.suggestion.problem,
      proposal: scores.suggestion.proposal,
      reach: scores.suggestion.reach,
      impact: scores.suggestion.impact
    });
    
    // Reset to form step to let them review/edit
    setStep(1);
    setScores(null);
    setIgnoredSuggestion(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#2dd4bf';
    if (score >= 60) return '#fbbf24';
    return '#ef4444';
  };

  // STEP 1: Form
  if (step === 1) {
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
              Submit Idea
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Develop a product concept with problem, solution, and expected impact.
            </p>
          </div>

          <form onSubmit={handleScoreIdea}>
            
            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#e0e0e0', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                marginBottom: 8 
              }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief, clear title for this idea"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Problem */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#e0e0e0', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                marginBottom: 8 
              }}>
                Problem *
              </label>
              <textarea
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="What problem does this solve? Who has this problem?"
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

            {/* Proposal */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#e0e0e0', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                marginBottom: 8 
              }}>
                Proposal / Solution *
              </label>
              <textarea
                value={formData.proposal}
                onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                placeholder="What's your proposed solution? How would it work?"
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

            {/* Reach */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                color: '#e0e0e0', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                marginBottom: 8 
              }}>
                Reach
              </label>
              <input
                type="text"
                value={formData.reach}
                onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                placeholder="Who will this impact? (e.g., 'All users', 'Enterprise customers', 'Mobile users')"
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

            {/* Impact */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', 
                color: '#e0e0e0', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                marginBottom: 8 
              }}>
                Expected Impact
              </label>
              <textarea
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                placeholder="What outcomes do you expect? Metrics, goals, or qualitative improvements."
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
                disabled={scoring}
                style={{
                  padding: '14px 28px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: scoring ? 'not-allowed' : 'pointer',
                  opacity: scoring ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scoring}
                style={{
                  flex: 1,
                  padding: '14px 28px',
                  background: scoring 
                    ? 'rgba(251, 191, 36, 0.5)' 
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#0a0f1a',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: scoring ? 'not-allowed' : 'pointer'
                }}
              >
                {scoring ? 'Scoring with AI...' : 'Get AI Score →'}
              </button>
            </div>

          </form>

        </div>
      </div>
    );
  }

  // STEP 2: Score Display
  return (
    <div style={{ padding: '60px 24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: '#f1f5f9',
            marginBottom: 12 
          }}>
            Your Idea Score
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Based on market research and internal signals
          </p>
        </div>

        {/* Score Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 16,
          marginBottom: 32
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: getScoreColor(scores.viability_score),
              marginBottom: 4
            }}>
              {scores.viability_score}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Viability</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: getScoreColor(scores.relevance_score),
              marginBottom: 4
            }}>
              {scores.relevance_score}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Relevance</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: getScoreColor(scores.overall_score),
              marginBottom: 4
            }}>
              {scores.overall_score}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Overall</div>
          </div>
        </div>

        {/* Signal Count */}
        {scores.signal_count > 0 && (
          <div style={{
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <div>
              <div style={{ color: '#2dd4bf', fontSize: '0.9rem', fontWeight: 600 }}>
                {scores.signal_count} Related Signal{scores.signal_count > 1 ? 's' : ''} Found
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                This idea has existing demand evidence in the marketplace
              </div>
            </div>
          </div>
        )}

        {/* Rationale */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24
        }}>
          <div style={{ 
            color: '#f1f5f9', 
            fontSize: '0.9rem', 
            fontWeight: 600,
            marginBottom: 12 
          }}>
            AI Analysis
          </div>
          <div style={{ 
            color: '#cbd5e1', 
            fontSize: '0.95rem', 
            lineHeight: 1.7 
          }}>
            {scores.scoring_rationale}
          </div>
        </div>

        {/* Market Insights */}
        {scores.market_insights && (
          <div style={{
            background: 'rgba(125, 211, 252, 0.05)',
            border: '1px solid rgba(125, 211, 252, 0.15)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24
          }}>
            <div style={{ 
              color: '#7dd3fc', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              marginBottom: 12 
            }}>
              🌐 Market Intelligence
            </div>
            <div style={{ 
              color: '#94a3b8', 
              fontSize: '0.9rem', 
              lineHeight: 1.7 
            }}>
              {scores.market_insights}
            </div>
          </div>
        )}

        {/* AI Suggestion */}
        {scores.suggestion && !ignoredSuggestion && (
          <SuggestionCard
            suggestion={scores.suggestion}
            type="idea"
            onReplace={handleReplaceSuggestion}
            onIgnore={() => setIgnoredSuggestion(true)}
          />
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => {
              setStep(1);
              setScores(null);
              setIgnoredSuggestion(false);
            }}
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
            ← Refine
          </button>
          <button
            onClick={handleSubmitToMarketplace}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '14px 28px',
              background: submitting 
                ? 'rgba(251, 191, 36, 0.5)' 
                : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#0a0f1a',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit to Marketplace →'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default IdeaSubmission;
