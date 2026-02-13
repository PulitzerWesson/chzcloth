// BetSubmissionGuided.jsx - Story-based bet creation with real-time education

import React, { useState } from 'react';
import { betExamples } from '../data/betExamples';
import './BetSubmissionGuided.css';

export default function BetSubmissionGuided({ onComplete, orgMode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [betData, setBetData] = useState({
    goalType: '',
    goalTarget: '',
    goalTimeframe: '',
    whatWillChange: '',
    baseline: '',
    baselineMetric: '',
    prediction: '',
    predictionTimeframe: '',
    validationType: '',
    validationDetails: '',
    cheaperTest: '',
    estimatedEffort: '2-3-sprints',
    confidence: 70
  });

  const [showExamples, setShowExamples] = useState({});

  const steps = [
    {
      id: 'goal',
      title: "What are you trying to achieve?",
      subtitle: "Be specific about the metric and target"
    },
    {
      id: 'change',
      title: "To achieve this, what will you change?",
      subtitle: "Be specific about WHAT changes"
    },
    {
      id: 'baseline',
      title: "What's happening now?",
      subtitle: "Current numbers you can measure"
    },
    {
      id: 'prediction',
      title: "What do you predict will happen?",
      subtitle: "Specific numbers and realistic timeline"
    },
    {
      id: 'validation',
      title: "How do you know this will work?",
      subtitle: "Evidence, not opinions"
    },
    {
      id: 'cheaperTest',
      title: "What's the cheapest way to test this first?",
      subtitle: "Test before you build"
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const toggleExamples = (stepId) => {
    setShowExamples(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Convert to bet format and complete
      const formattedBet = formatBetData(betData);
      onComplete(formattedBet);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'goal':
        return betData.goalType && betData.goalTarget && betData.goalTimeframe;
      case 'change':
        return betData.whatWillChange && betData.whatWillChange.length > 20;
      case 'baseline':
        return betData.baseline && betData.baselineMetric;
      case 'prediction':
        return betData.prediction && betData.predictionTimeframe;
      case 'validation':
        return betData.validationType && betData.validationDetails.length > 20;
      case 'cheaperTest':
        return betData.cheaperTest && betData.cheaperTest.length > 20;
      default:
        return true;
    }
  };

  return (
    <div className="bet-guided-container">
      <div className="bet-guided-header">
        <h1>Make a Bet</h1>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          Question {currentStep + 1} of {steps.length}
        </div>
      </div>

      <div className="bet-guided-content">
        <div className="question-section">
          <h2>{currentStepData.title}</h2>
          <p className="subtitle">{currentStepData.subtitle}</p>

          {renderStepContent(
            steps[currentStep].id,
            betData,
            setBetData,
            showExamples,
            toggleExamples
          )}
        </div>

        <div className="story-preview">
          <h3>Your Bet So Far:</h3>
          <BetStoryPreview betData={betData} currentStep={currentStep} />
        </div>
      </div>

      <div className="bet-guided-nav">
        {currentStep > 0 && (
          <button className="btn-back" onClick={handleBack}>
            ← Back
          </button>
        )}
        <button
          className="btn-next"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === steps.length - 1 ? 'Review Bet →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// STEP CONTENT RENDERERS
// ============================================

function renderStepContent(stepId, betData, setBetData, showExamples, toggleExamples) {
  switch (stepId) {
    case 'goal':
      return <GoalStep betData={betData} setBetData={setBetData} showExamples={showExamples} toggleExamples={toggleExamples} />;
    case 'change':
      return <ChangeStep betData={betData} setBetData={setBetData} showExamples={showExamples} toggleExamples={toggleExamples} />;
    case 'baseline':
      return <BaselineStep betData={betData} setBetData={setBetData} showExamples={showExamples} toggleExamples={toggleExamples} />;
    case 'prediction':
      return <PredictionStep betData={betData} setBetData={setBetData} showExamples={showExamples} toggleExamples={toggleExamples} />;
    case 'validation':
      return <ValidationStep betData={betData} setBetData={setBetData} showExamples={showExamples} toggleExamples={toggleExamples} />;
    case 'cheaperTest':
      return <CheaperTestStep betData={betData} setBetData={setBetData} showExamples={showExamples} toggleExamples={toggleExamples} />;
    default:
      return null;
  }
}

// ============================================
// GOAL STEP
// ============================================

function GoalStep({ betData, setBetData, showExamples, toggleExamples }) {
  return (
    <div className="step-content">
      <ExamplesToggle
        stepId="goal"
        showExamples={showExamples}
        toggleExamples={toggleExamples}
      />

      {showExamples.goal && <Examples category="goal" />}

      <div className="form-group">
        <label>What metric are you trying to improve?</label>
        <select
          value={betData.goalType}
          onChange={(e) => setBetData({ ...betData, goalType: e.target.value })}
          className="input-select"
        >
          <option value="">Select a metric...</option>
          <option value="revenue">Revenue</option>
          <option value="customers">New Customers</option>
          <option value="retention">Customer Retention</option>
          <option value="conversion">Conversion Rate</option>
          <option value="activation">User Activation</option>
          <option value="engagement">Engagement</option>
          <option value="efficiency">Operational Efficiency</option>
          <option value="cost">Cost Reduction</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>By how much?</label>
          <input
            type="text"
            value={betData.goalTarget}
            onChange={(e) => setBetData({ ...betData, goalTarget: e.target.value })}
            placeholder="e.g., 30% or $50k or 100 customers"
            className="input-text"
          />
        </div>

        <div className="form-group">
          <label>By when?</label>
          <select
            value={betData.goalTimeframe}
            onChange={(e) => setBetData({ ...betData, goalTimeframe: e.target.value })}
            className="input-select"
          >
            <option value="">Select timeframe...</option>
            <option value="this-month">This Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
            <option value="6-months">6 Months</option>
            <option value="18-months">18 Months</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CHANGE STEP
// ============================================

function ChangeStep({ betData, setBetData, showExamples, toggleExamples }) {
  const wordCount = betData.whatWillChange.split(' ').filter(Boolean).length;
  const isSpecificEnough = wordCount >= 10;

  return (
    <div className="step-content">
      <ExamplesToggle
        stepId="change"
        showExamples={showExamples}
        toggleExamples={toggleExamples}
      />

      {showExamples.change && <Examples category="change" />}

      <div className="form-group">
        <label>What specifically will you change?</label>
        <textarea
          value={betData.whatWillChange}
          onChange={(e) => setBetData({ ...betData, whatWillChange: e.target.value })}
          placeholder="Be specific: What? Where? How many? For whom?

Example: 'Add 5 video testimonials from enterprise customers to our pricing page, above the fold'"
          className="input-textarea"
          rows={4}
        />
        <div className="input-feedback">
          {!isSpecificEnough && betData.whatWillChange && (
            <span className="feedback-warning">
              ⚠️ Be more specific - what exactly will change?
            </span>
          )}
          {isSpecificEnough && (
            <span className="feedback-good">
              ✓ Specific enough
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BASELINE STEP
// ============================================

function BaselineStep({ betData, setBetData, showExamples, toggleExamples }) {
  return (
    <div className="step-content">
      <ExamplesToggle
        stepId="baseline"
        showExamples={showExamples}
        toggleExamples={toggleExamples}
      />

      {showExamples.baseline && <Examples category="baseline" />}

      <div className="form-group">
        <label>What's your current baseline?</label>
        <div className="input-hint">
          💡 Include the number AND how you measure it
        </div>
        <textarea
          value={betData.baseline}
          onChange={(e) => setBetData({ ...betData, baseline: e.target.value })}
          placeholder="Example: 'Current: 45 trial signups/week converting at 8% = 3.6 paid customers/week (measured in Stripe)'"
          className="input-textarea"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>What metric are you measuring?</label>
        <input
          type="text"
          value={betData.baselineMetric}
          onChange={(e) => setBetData({ ...betData, baselineMetric: e.target.value })}
          placeholder="e.g., 'paid customers/week' or 'conversion rate' or 'MRR'"
          className="input-text"
        />
      </div>
    </div>
  );
}

// ============================================
// PREDICTION STEP
// ============================================

function PredictionStep({ betData, setBetData, showExamples, toggleExamples }) {
  return (
    <div className="step-content">
      <ExamplesToggle
        stepId="prediction"
        showExamples={showExamples}
        toggleExamples={toggleExamples}
      />

      {showExamples.prediction && <Examples category="prediction" />}

      <div className="form-group">
        <label>What do you predict will happen?</label>
        <div className="input-hint">
          💡 Be specific about numbers AND explain why that timeline
        </div>
        <textarea
          value={betData.prediction}
          onChange={(e) => setBetData({ ...betData, prediction: e.target.value })}
          placeholder="Example: 'From 8% to 12% in 90 days (need full cohort to mature). That's 5.4 paid customers/week vs 3.6.'"
          className="input-textarea"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Timeframe for impact</label>
        <select
          value={betData.predictionTimeframe}
          onChange={(e) => setBetData({ ...betData, predictionTimeframe: e.target.value })}
          className="input-select"
        >
          <option value="">Select timeframe...</option>
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
          <option value="180">6 months</option>
          <option value="365">1 year</option>
        </select>
      </div>
    </div>
  );
}

// ============================================
// VALIDATION STEP
// ============================================

function ValidationStep({ betData, setBetData, showExamples, toggleExamples }) {
  const validationTypes = [
    { value: 'tested', label: 'We tested it', prompt: 'Describe your test and results:' },
    { value: 'interviews', label: 'Customer interviews', prompt: 'How many? What did they say?' },
    { value: 'data', label: 'We have data/analytics', prompt: 'What does the data show?' },
    { value: 'competitor', label: 'Competitor or case study', prompt: 'Who? What did they achieve?' },
    { value: 'hypothesis', label: 'Team hypothesis (not validated)', prompt: 'Why do you believe this?' }
  ];

  return (
    <div className="step-content">
      <ExamplesToggle
        stepId="validation"
        showExamples={showExamples}
        toggleExamples={toggleExamples}
      />

      {showExamples.validation && <Examples category="validation" />}

      <div className="form-group">
        <label>How do you know this will work?</label>
        <div className="validation-options">
          {validationTypes.map(type => (
            <button
              key={type.value}
              className={`validation-option ${betData.validationType === type.value ? 'selected' : ''}`}
              onClick={() => setBetData({ ...betData, validationType: type.value })}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {betData.validationType && (
        <div className="form-group">
          <label>
            {validationTypes.find(t => t.value === betData.validationType)?.prompt}
          </label>
          {betData.validationType === 'hypothesis' && (
            <div className="warning-box">
              ⚠️ Unvalidated bets are riskier. Consider validating before building.
            </div>
          )}
          <textarea
            value={betData.validationDetails}
            onChange={(e) => setBetData({ ...betData, validationDetails: e.target.value })}
            placeholder="Be specific with numbers and details..."
            className="input-textarea"
            rows={4}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// CHEAPER TEST STEP
// ============================================

function CheaperTestStep({ betData, setBetData, showExamples, toggleExamples }) {
  // Generate smart suggestions based on what they're changing
  const suggestions = generateTestSuggestions(betData.whatWillChange, betData.estimatedEffort);

  return (
    <div className="step-content">
      <ExamplesToggle
        stepId="cheaperTest"
        showExamples={showExamples}
        toggleExamples={toggleExamples}
      />

      {showExamples.cheaperTest && <Examples category="cheaperTest" />}

      {suggestions.length > 0 && (
        <div className="suggestions-box">
          <div className="suggestions-header">💡 Suggested cheaper tests:</div>
          <ul>
            {suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-group">
        <label>What's the cheapest way to test this first?</label>
        <div className="input-hint">
          💡 Before spending {getEffortCost(betData.estimatedEffort)}, how could you validate for less?
        </div>
        <textarea
          value={betData.cheaperTest}
          onChange={(e) => setBetData({ ...betData, cheaperTest: e.target.value })}
          placeholder="Describe a manual, low-code, or small-scale test..."
          className="input-textarea"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>Estimated effort to build (full version)</label>
        <select
          value={betData.estimatedEffort}
          onChange={(e) => setBetData({ ...betData, estimatedEffort: e.target.value })}
          className="input-select"
        >
          <option value="1-sprint">1 sprint (2 weeks)</option>
          <option value="2-3-sprints">2-3 sprints (4-6 weeks)</option>
          <option value="4-6-sprints">4-6 sprints (8-12 weeks)</option>
          <option value="6-plus-sprints">6+ sprints (12+ weeks)</option>
        </select>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ExamplesToggle({ stepId, showExamples, toggleExamples }) {
  return (
    <button
      className="btn-examples-toggle"
      onClick={() => toggleExamples(stepId)}
    >
      {showExamples[stepId] ? '✓ Hide Examples' : '💡 Show Examples of Good vs Bad'}
    </button>
  );
}

function Examples({ category }) {
  const examples = betExamples[category];
  if (!examples) return null;

  return (
    <div className="examples-box">
      <div className="examples-intro">{examples.intro}</div>

      <div className="examples-section">
        <div className="examples-good">
          <h4>✅ Strong Examples:</h4>
          {examples.good.map((ex, idx) => (
            <div key={idx} className="example-item">
              <div className="example-text">"{ex.text}"</div>
              <div className="example-why">{ex.why}</div>
            </div>
          ))}
        </div>

        <div className="examples-bad">
          <h4>❌ Weak Examples:</h4>
          {examples.bad.map((ex, idx) => (
            <div key={idx} className="example-item">
              <div className="example-text">"{ex.text}"</div>
              <div className="example-why">{ex.why}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BetStoryPreview({ betData, currentStep }) {
  const parts = [];

  if (betData.goalType && betData.goalTarget && betData.goalTimeframe) {
    parts.push(`Goal: ${formatGoalType(betData.goalType)} by ${betData.goalTarget} in ${formatTimeframe(betData.goalTimeframe)}`);
  }

  if (betData.whatWillChange && currentStep >= 1) {
    parts.push(`Change: ${betData.whatWillChange}`);
  }

  if (betData.baseline && currentStep >= 2) {
    parts.push(`Current: ${betData.baseline}`);
  }

  if (betData.prediction && currentStep >= 3) {
    parts.push(`Predicted: ${betData.prediction}`);
  }

  if (betData.validationType && currentStep >= 4) {
    const typeLabel = formatValidationType(betData.validationType);
    parts.push(`Validation: ${typeLabel}`);
  }

  if (betData.cheaperTest && currentStep >= 5) {
    parts.push(`Cheaper test: ${betData.cheaperTest.substring(0, 80)}...`);
  }

  if (parts.length === 0) {
    return <div className="story-empty">Your bet story will appear here as you answer questions...</div>;
  }

  return (
    <div className="story-content">
      {parts.map((part, idx) => (
        <div key={idx} className="story-part">{part}</div>
      ))}
    </div>
  );
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
    'hypothesis': 'Team hypothesis (not validated)'
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

function generateTestSuggestions(whatWillChange, effort) {
  const lower = whatWillChange.toLowerCase();
  const suggestions = [];

  if (lower.includes('testimonial') || lower.includes('case stud')) {
    suggestions.push('Create 3-5 testimonials manually with existing customers');
    suggestions.push('Add text testimonials first before investing in video');
  }

  if (lower.includes('feature') || lower.includes('functionality')) {
    suggestions.push('Build a clickable prototype to test interest');
    suggestions.push('Fake door test: show it, measure clicks, then build');
  }

  if (lower.includes('onboarding') || lower.includes('signup')) {
    suggestions.push('Run 10-15 user tests to see where people actually get stuck');
    suggestions.push('Manually walk through flow with real users first');
  }

  if (lower.includes('email') || lower.includes('notification')) {
    suggestions.push('Send manually to 50 users first, measure response');
    suggestions.push('A/B test subject lines before building automation');
  }

  if (lower.includes('integration') || lower.includes('connect')) {
    suggestions.push('Use Zapier or Make.com to test demand first');
    suggestions.push('Manual webhook for 10 customers before native build');
  }

  return suggestions;
}

function formatBetData(betData) {
  // Convert guided flow data to standard bet format
  const hypothesis = `If we ${betData.whatWillChange}, then ${betData.prediction}`;
  
  return {
    hypothesis,
    metricDomain: mapGoalToMetricDomain(betData.goalType),
    metric: betData.baselineMetric || betData.goalType,
    customMetric: '',
    betType: 'improve',
    baseline: betData.baseline,
    prediction: betData.prediction,
    confidence: betData.confidence,
    timeframe: parseInt(betData.predictionTimeframe) || 90,
    assumptions: `${formatValidationType(betData.validationType)}: ${betData.validationDetails}`,
    cheapTest: betData.cheaperTest,
    isOwnIdea: true,
    ideaSource: '',
    measurementTool: 'analytics',
    strategicAlignment: mapGoalToAlignment(betData.goalType),
    estimatedEffort: betData.estimatedEffort,
    inactionImpact: mapGoalToImpact(betData.goalType)
  };
}

function mapGoalToMetricDomain(goalType) {
  const map = {
    'revenue': 'growth',
    'customers': 'growth',
    'retention': 'retention',
    'conversion': 'growth',
    'activation': 'activation',
    'engagement': 'engagement',
    'efficiency': 'efficiency',
    'cost': 'efficiency'
  };
  return map[goalType] || 'growth';
}

function mapGoalToAlignment(goalType) {
  // Revenue/customers = inner bullseye, others = middle ring
  return ['revenue', 'customers'].includes(goalType) ? 'inner' : 'middle';
}

function mapGoalToImpact(goalType) {
  return ['revenue', 'customers'].includes(goalType) ? 'lose-revenue' : 'lose-opportunity';
}
