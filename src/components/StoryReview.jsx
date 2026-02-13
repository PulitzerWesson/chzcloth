// StoryReview.jsx - Shows user's bet compared to what strong bets look like

import React from 'react';
import './BetSubmissionGuided.css';

export default function StoryReview({ betData, onEdit, onContinue }) {
  const issues = analyzeGaps(betData);
  const strongComparison = generateStrongComparison(betData);

  return (
    <div className="story-review-container">
      <h1>Your Bet</h1>
      <p className="review-subtitle">
        Review your bet compared to what strong bets look like
      </p>

      {/* USER'S BET */}
      <div className="bet-summary">
        <h2>What You're Betting:</h2>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Goal:</span>
            <span className="summary-value">
              {formatGoalType(betData.goalType)} by {betData.goalTarget} in {formatTimeframe(betData.goalTimeframe)}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Change:</span>
            <span className="summary-value">{betData.whatWillChange}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Current:</span>
            <span className="summary-value">{betData.baseline}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Predicted:</span>
            <span className="summary-value">{betData.prediction}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Validation:</span>
            <span className="summary-value">
              {formatValidationType(betData.validationType)}
              {betData.validationType === 'hypothesis' && (
                <span className="validation-warning"> (not validated)</span>
              )}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Cheaper test:</span>
            <span className="summary-value">{betData.cheaperTest || 'None identified'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Effort:</span>
            <span className="summary-value">{betData.estimatedEffort} ({getEffortCost(betData.estimatedEffort)})</span>
          </div>
        </div>
      </div>

      {/* COMPARISON TO STRONG BETS */}
      {issues.length > 0 && (
        <div className="comparison-section">
          <h2>Compare to Strong Bets:</h2>
          
          <div className="comparison-content">
            <div className="comparison-left">
              <h3>Your Bet:</h3>
              <ul className="gap-list">
                {issues.map((issue, idx) => (
                  <li key={idx} className="gap-item">
                    <span className="gap-icon">{issue.severity === 'high' ? '❌' : '⚠️'}</span>
                    <span className="gap-text">{issue.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="comparison-right">
              <h3>Strong Bet Would Have:</h3>
              <ul className="strength-list">
                {strongComparison.map((strength, idx) => (
                  <li key={idx} className="strength-item">
                    <span className="strength-icon">✓</span>
                    <span className="strength-text">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDATION */}
      {issues.some(i => i.severity === 'high') && (
        <div className="recommendation-box">
          <h3>💡 Recommendation Before Building:</h3>
          <div className="recommendation-content">
            {generateRecommendation(betData, issues)}
          </div>
        </div>
      )}

      {/* NO ISSUES - PRAISE */}
      {issues.length === 0 && (
        <div className="praise-box">
          <h3>✅ This is a strong bet!</h3>
          <p>
            You've validated the problem, identified a cheaper test, and have realistic expectations.
            This bet is ready to score.
          </p>
        </div>
      )}

      {/* WHAT HAPPENS NEXT */}
      <div className="next-steps-box">
        <h3>What Happens Next:</h3>
        <ol>
          <li>We'll analyze your bet using market data and ROI calculations</li>
          <li>You'll get a score (Approach, Potential, Fit)</li>
          <li>We'll suggest improvements if we find cheaper alternatives</li>
          <li>You can save to your personal queue or add to marketplace</li>
        </ol>
      </div>

      {/* ACTION BUTTONS */}
      <div className="review-actions">
        <button className="btn-edit" onClick={onEdit}>
          ← Edit Bet
        </button>
        <button className="btn-continue-score" onClick={onContinue}>
          {issues.length > 0 ? "I Understand, Get Score →" : "Get Score →"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

function analyzeGaps(betData) {
  const issues = [];

  // Check validation
  if (betData.validationType === 'hypothesis') {
    issues.push({
      severity: 'high',
      description: 'No validation - building on assumption only'
    });
  }

  // Check cheaper test
  if (!betData.cheaperTest || betData.cheaperTest.length < 20) {
    issues.push({
      severity: 'high',
      description: `Planning to spend ${getEffortCost(betData.estimatedEffort)} without testing cheaper first`
    });
  }

  // Check specificity of change
  if (betData.whatWillChange && betData.whatWillChange.split(' ').length < 10) {
    issues.push({
      severity: 'medium',
      description: 'Change description could be more specific'
    });
  }

  // Check baseline clarity
  if (betData.baseline && !betData.baseline.match(/\d/)) {
    issues.push({
      severity: 'medium',
      description: 'Baseline lacks specific numbers'
    });
  }

  // Check prediction clarity
  if (betData.prediction && !betData.prediction.match(/\d/)) {
    issues.push({
      severity: 'medium',
      description: 'Prediction lacks specific numbers'
    });
  }

  // Check timeframe realism
  const timeframe = parseInt(betData.predictionTimeframe);
  const effort = betData.estimatedEffort;
  if (timeframe <= 60 && effort.includes('4-6')) {
    issues.push({
      severity: 'medium',
      description: 'Timeline may be aggressive for stated effort'
    });
  }

  return issues;
}

function generateStrongComparison(betData) {
  const strengths = [];

  // What a strong bet would have
  if (betData.validationType === 'hypothesis') {
    strengths.push('Validation from customer interviews, tests, or data');
    strengths.push('Specific numbers: "15 out of 20 customers said they\'d pay for this"');
  }

  if (!betData.cheaperTest || betData.cheaperTest.length < 20) {
    strengths.push(`Cheaper test identified (e.g., manual MVP for 10% of ${getEffortCost(betData.estimatedEffort)})`);
    strengths.push('Clear success metric for the test');
  }

  strengths.push('Specific baseline with measurement tool (e.g., "measured in Stripe")');
  strengths.push('Realistic timeline that accounts for user behavior change');
  strengths.push('ROI calculation: cost vs. expected return');

  return strengths;
}

function generateRecommendation(betData, issues) {
  const hasNoValidation = issues.some(i => i.description.includes('No validation'));
  const hasNoCheaperTest = issues.some(i => i.description.includes('without testing cheaper'));

  if (hasNoValidation && hasNoCheaperTest) {
    return (
      <div>
        <p><strong>Before spending {getEffortCost(betData.estimatedEffort)}, consider:</strong></p>
        <ol>
          <li>
            <strong>Validate the problem first:</strong> Interview 10-15 customers to confirm they experience this issue
            and would value the solution. Cost: $0-2k, Time: 1 week.
          </li>
          <li>
            <strong>Test a cheaper version:</strong> {generateSpecificTestSuggestion(betData.whatWillChange)}
          </li>
          <li>
            <strong>Measure impact:</strong> If the test shows positive results, THEN commit to the full build.
          </li>
        </ol>
        <p className="recommendation-highlight">
          This approach turns a ${getEffortCost(betData.estimatedEffort)} risk into a $2-5k test.
        </p>
      </div>
    );
  }

  if (hasNoValidation) {
    return (
      <div>
        <p><strong>Validate before building:</strong></p>
        <p>
          Interview 10-15 customers to confirm they experience this problem and would use your solution.
          This 1-week effort could save you from building something nobody wants.
        </p>
      </div>
    );
  }

  if (hasNoCheaperTest) {
    return (
      <div>
        <p><strong>Test cheaper first:</strong></p>
        <p>{generateSpecificTestSuggestion(betData.whatWillChange)}</p>
        <p>
          If the test validates your hypothesis, you can confidently commit to the full build.
          If it doesn't, you've saved {getEffortCost(betData.estimatedEffort)}.
        </p>
      </div>
    );
  }

  return null;
}

function generateSpecificTestSuggestion(whatWillChange) {
  const lower = whatWillChange.toLowerCase();

  if (lower.includes('testimonial') || lower.includes('case stud')) {
    return 'Create 3-5 video testimonials manually with a freelance videographer ($3-5k, 2 weeks). Add them to your page and measure conversion impact for 30 days.';
  }

  if (lower.includes('feature') || lower.includes('functionality')) {
    return 'Build a clickable prototype or fake door test (1 week). Show users the feature, measure who clicks, gather feedback before full build.';
  }

  if (lower.includes('onboarding') || lower.includes('signup')) {
    return 'Run 15 moderated user tests ($3-4k, 1 week) to see exactly where people get stuck. Fix those specific issues first.';
  }

  if (lower.includes('email') || lower.includes('notification')) {
    return 'Manually send to 50-100 users first. Measure open rate, click rate, and conversions before automating.';
  }

  if (lower.includes('integration')) {
    return 'Use Zapier or Make.com to create a low-code version (2 hours). See if users actually use it before building native integration.';
  }

  return 'Create a manual or low-code version to test the core hypothesis before committing to the full build.';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatGoalType(type) {
  const map = {
    'revenue': 'Increase revenue',
    'customers': 'Grow customers',
    'retention': 'Improve retention',
    'conversion': 'Increase conversion',
    'activation': 'Improve activation',
    'engagement': 'Boost engagement',
    'efficiency': 'Improve efficiency',
    'cost': 'Reduce costs'
  };
  return map[type] || type;
}

function formatTimeframe(timeframe) {
  const map = {
    'this-month': 'this month',
    'this-quarter': 'this quarter',
    'this-year': 'this year',
    '6-months': '6 months',
    '18-months': '18 months'
  };
  return map[timeframe] || timeframe;
}

function formatValidationType(type) {
  const map = {
    'tested': 'We tested it',
    'interviews': 'Customer interviews',
    'data': 'Analytics/data',
    'competitor': 'Competitor/case study',
    'hypothesis': 'Team hypothesis'
  };
  return map[type] || type;
}

function getEffortCost(effort) {
  const map = {
    '1-sprint': '$25k',
    '2-3-sprints': '$62k',
    '4-6-sprints': '$125k',
    '6-plus-sprints': '$150k+'
  };
  return map[effort] || effort;
}
