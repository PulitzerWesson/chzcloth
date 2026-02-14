// BetSubmissionNarrative.jsx - Single smart field with AI validation

import React, { useState } from 'react';
import './BetSubmissionNarrative.css';

export default function BetSubmissionNarrative({ onComplete, orgMode, currentOrg }) {
  const [goalContext, setGoalContext] = useState('');
  const [narrative, setNarrative] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if org has leadership goal
  const hasLeadershipGoal = currentOrg?.leadershipGoal;
  const leadershipGoal = hasLeadershipGoal ? currentOrg.leadershipGoal : null;

  const exampleNarrative = `Add 5 video testimonials from enterprise customers to our pricing page.

Currently, our pricing page converts at 8% (45 signups/week measured in Stripe). We expect this to grow to 12% conversion (68 signups/week) - a 50% increase.

This will work because prospects bounce due to lack of trust. Exit surveys show "need social proof" as the #2 reason for not signing up (127 responses in Q4 2024). Real customer stories with specific outcomes will reduce skepticism and increase trial signups.

Evidence: We tested 3 manual video testimonials with 200 visitors for 2 weeks and saw conversion increase from 8% to 11.5%. Customer interviews (15 churned users) confirmed that 12 mentioned "didn't trust the product would work" as primary concern.

Cheaper test: Create 3-5 more testimonials manually with freelance videographer ($3k, 2 weeks). Add to page and measure conversion for 30 days before building full testimonial system.

Effort: 4-6 sprints (~$125k) for full testimonial system with CMS, video hosting, and moderation workflow.`;

  const handleSubmit = async () => {
    setHasSubmitted(true);
    setIsAnalyzing(true);
    setAiReview(null);

    try {
      const response = await fetch('/api/parse-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          narrative,
          goalContext: hasLeadershipGoal ? leadershipGoal : goalContext
        })
      });

      const review = await response.json();

      if (!response.ok) {
        throw new Error(review.error || 'Analysis failed');
      }

      setAiReview(review);
    } catch (error) {
      console.error('AI review error:', error);
      setAiReview({
        extracted: {},
        goalAlignment: { aligned: false, reasoning: "Could not analyze alignment" },
        issues: [{ field: "analysis", severity: "missing", message: "AI analysis failed. Please check your narrative and try again." }],
        strengths: [],
        readyToScore: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    if (!aiReview || !aiReview.readyToScore) {
      return;
    }

    const extracted = aiReview.extracted;
    const betData = {
      hypothesis: `If we ${extracted.change || narrative.substring(0, 100)}, then ${extracted.baseline || 'the metric'} will improve to ${extracted.magnitude || 'target'}, because ${extracted.mechanism || 'of expected impact'}`,
      metricDomain: inferMetricDomain(narrative),
      metric: inferMetric(narrative),
      baseline: extracted.baseline || '',
      prediction: extracted.magnitude || '',
      confidence: 70,
      timeframe: 90,
      assumptions: extracted.mechanism || '',
      cheapTest: extracted.cheaperTest || '',
      measurementTool: 'analytics',
      strategicAlignment: 'inner',
      estimatedEffort: parseEffort(extracted.effort),
      inactionImpact: 'lose-opportunity',
      isOwnIdea: true,
      betType: 'improve',
      goalContext: hasLeadershipGoal ? leadershipGoal : goalContext,
      goalAlignment: aiReview.goalAlignment,
      // Pass data for review screen
      change: extracted.change || '',
      baseline: extracted.baseline || '',
      magnitude: extracted.magnitude || '',
      mechanism: extracted.mechanism || '',
      evidenceType: 'tested',
      evidenceDetails: extracted.evidence || '',
      cheaperTest: extracted.cheaperTest || ''
    };

    console.log('Bet data:', betData);
    onComplete(betData);
  };

  const inferMetricDomain = (text) => {
    if (!text) return 'growth';
    const lower = text.toLowerCase();
    if (lower.includes('revenue') || lower.includes('monetiz')) return 'monetization';
    if (lower.includes('retention') || lower.includes('churn')) return 'retention';
    if (lower.includes('conversion') || lower.includes('signup')) return 'growth';
    if (lower.includes('engagement') || lower.includes('active')) return 'retention';
    return 'growth';
  };

  const inferMetric = (text) => {
    if (!text) return 'Custom metric';
    const lower = text.toLowerCase();
    if (lower.includes('conversion')) return 'Conversion rate';
    if (lower.includes('retention')) return 'Retention rate';
    if (lower.includes('revenue') || lower.includes('mrr')) return 'Revenue/MRR';
    if (lower.includes('signup')) return 'Signups';
    if (lower.includes('churn')) return 'Churn rate';
    return 'Custom metric';
  };

  const parseEffort = (effortText) => {
    if (!effortText) return '2-3-sprints';
    const lower = effortText.toLowerCase();
    if (lower.includes('1 sprint') || lower.includes('2 week')) return '1-sprint';
    if (lower.includes('2-3 sprint') || lower.includes('4-6 week')) return '2-3-sprints';
    if (lower.includes('4-6 sprint') || lower.includes('8-12 week')) return '4-6-sprints';
    if (lower.includes('6+ sprint') || lower.includes('12+ week')) return '6-plus-sprints';
    return '2-3-sprints';
  };

  const canSubmit = () => {
    if (!hasLeadershipGoal && goalContext.length < 10) return false;
    if (narrative.length < 100) return false;
    return true;
  };

  return (
    <div className="narrative-container">
      {/* Header */}
      <div className="narrative-header">
        <h1>Make a Bet</h1>
        <p className="header-subtitle">
          Describe what you'll build, why it matters, and how you'll validate it
        </p>
      </div>

      <div className="single-field-container">
        {/* Goal Context */}
        {hasLeadershipGoal ? (
          <div className="goal-context-display">
            <div className="context-label">Supporting Leadership Goal:</div>
            <div className="context-goal">{leadershipGoal}</div>
          </div>
        ) : (
          <div className="goal-context-input">
            <label>Company/Department Goal</label>
            <input
              type="text"
              value={goalContext}
              onChange={e => setGoalContext(e.target.value)}
              placeholder="e.g., Grow revenue by 30% this year, Reduce churn to below 5%, Increase trial signups by 50%"
              className="goal-input"
            />
            <div className="goal-hint">
              AI will check if your bet actually achieves this goal (e.g., more customers ≠ more revenue)
            </div>
          </div>
        )}

        {/* Show Example Toggle */}
        <div className="example-toggle-container">
          <button
            onClick={() => setShowExample(!showExample)}
            className="btn-show-example"
          >
            {showExample ? 'Hide Example' : 'Show Example of Strong Bet'}
          </button>
        </div>

        {/* Example (collapsible) */}
        {showExample && (
          <div className="example-display">
            <div className="example-header">Example of a Strong Bet:</div>
            <div className="example-content">{exampleNarrative}</div>
          </div>
        )}

        {/* Main Narrative Field */}
        <div className="narrative-field">
          <label>Describe Your Bet</label>
          <textarea
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            placeholder="Include: What you'll change, current state (with numbers), expected outcome (with numbers), why it will work, evidence you have, how you'll test it cheaper first, and estimated effort..."
            className="narrative-textarea"
            rows={16}
          />
          <div className="character-count">
            {narrative.length} characters {narrative.length < 100 && `(minimum 100)`}
          </div>
        </div>

        {/* AI Review Results */}
        {hasSubmitted && aiReview && (
          <div className="ai-review-section">
            <h3>AI Review</h3>

            {/* Goal Alignment */}
            <div className={`alignment-check ${aiReview.goalAlignment.aligned ? 'aligned' : 'misaligned'}`}>
              <div className="alignment-header">
                {aiReview.goalAlignment.aligned ? 'Goal Aligned' : 'Goal Misalignment Detected'}
              </div>
              <div className="alignment-text">{aiReview.goalAlignment.reasoning}</div>
            </div>

            {/* Strengths */}
            {aiReview.strengths.length > 0 && (
              <div className="review-section strengths">
                <div className="section-header">Strengths</div>
                <ul>
                  {aiReview.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {aiReview.issues.length > 0 && (
              <div className="review-section issues">
                <div className="section-header">Issues to Address</div>
                {aiReview.issues.map((issue, idx) => (
                  <div key={idx} className={`issue-item ${issue.severity}`}>
                    <div className="issue-field">{issue.field}</div>
                    <div className="issue-message">{issue.message}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Extracted Fields Preview */}
            {aiReview.extracted && Object.keys(aiReview.extracted).length > 0 && (
              <div className="review-section extracted">
                <div className="section-header">Extracted Fields</div>
                <div className="extracted-grid">
                  {Object.entries(aiReview.extracted).map(([field, value]) => (
                    value && (
                      <div key={field} className="extracted-item">
                        <div className="extracted-label">{field}</div>
                        <div className="extracted-value">{value}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!hasSubmitted || (hasSubmitted && !aiReview?.readyToScore) ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || isAnalyzing}
              className="btn-submit"
            >
              {isAnalyzing ? 'Analyzing...' : hasSubmitted ? 'Re-submit for Review' : 'Submit for Review'}
            </button>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                className="btn-revise"
              >
                Revise & Re-submit
              </button>
              <button
                onClick={handleContinue}
                className="btn-continue"
              >
                Continue to Scoring
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
