// BetSubmissionNarrative.jsx - Story-building approach to bet creation

import React, { useState, useEffect } from 'react';
import './BetSubmissionNarrative.css';

export default function BetSubmissionNarrative({ onComplete, orgMode, currentOrg }) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [story, setStory] = useState({
    // Screen 1
    change: '',
    baseline: '',
    growOrDecline: 'grow',
    magnitude: '',
    
    // Screen 2
    mechanism: '',
    
    // Screen 3 - CHANGED TO ARRAY
    evidenceTypes: [],  // Multiple selections
    evidenceDetails: {},  // Details for each type
    
    // Screen 4
    cheaperTest: '',
    estimatedEffort: '2-3-sprints',
    
    // Metadata
    strategicAlignment: 'inner',
    inactionImpact: 'lose-opportunity'
  });

  const [aiSuggestions, setAiSuggestions] = useState({});
  const [showSuggestion, setShowSuggestion] = useState({});

  const screens = [
    { id: 'change', title: 'What will you change?' },
    { id: 'mechanism', title: 'How will this change behavior?' },
    { id: 'evidence', title: 'Why will this work?' },
    { id: 'test', title: 'How will you test it?' }
  ];

  const progress = ((currentScreen + 1) / screens.length) * 100;
  
  // Check if org has leadership goal
  const hasLeadershipGoal = currentOrg?.leadershipGoal;
  const leadershipGoal = hasLeadershipGoal ? currentOrg.leadershipGoal : null;

  // AI suggestions based on input
  useEffect(() => {
    generateAISuggestions();
  }, [story.change, story.evidenceType]);

  const generateAISuggestions = () => {
    const suggestions = {};
    
    // Baseline suggestion
    if (story.change.length > 10) {
      suggestions.baseline = suggestBaseline(story.change);
    }
    
    // Grow/decline suggestion
    if (story.change.length > 10) {
      suggestions.growOrDecline = suggestDirection(story.change);
    }
    
    // Mechanism prompts
    if (story.change.includes('add') || story.change.includes('new')) {
      suggestions.mechanism = "What new behavior will this enable? Be specific about the customer action.";
    } else if (story.change.includes('remove') || story.change.includes('reduce')) {
      suggestions.mechanism = "What friction are you removing? What will customers do instead?";
    }
    
    // Cheaper test suggestions
    if (story.change.length > 20) {
      suggestions.cheaperTest = generateCheaperTestSuggestion(story.change);
    }
    
    setAiSuggestions(suggestions);
  };

  const suggestBaseline = (change) => {
    const lower = change.toLowerCase();
    if (lower.includes('conversion')) return "Current conversion rate (e.g., 8% or 45 signups/week)";
    if (lower.includes('retention')) return "Current retention rate (e.g., 30-day retention at 45%)";
    if (lower.includes('revenue')) return "Current revenue (e.g., $100k MRR)";
    if (lower.includes('testimonial') || lower.includes('social proof')) return "Current conversion rate on pricing page";
    return "Current measurable state (number + metric + source)";
  };

  const suggestDirection = (change) => {
    if (!change) return 'grow';  // Safety check
    const lower = change.toLowerCase();
    const growWords = ['add', 'new', 'increase', 'improve', 'testimonial', 'feature'];
    const declineWords = ['remove', 'reduce', 'simplify', 'cut'];
    
    if (growWords.some(word => lower.includes(word))) return 'grow';
    if (declineWords.some(word => lower.includes(word))) return 'decline';
    return 'grow';
  };

  const generateCheaperTestSuggestion = (change) => {
    if (!change) return "What's a manual, low-code, or small-scale version you could test first?";  // Safety check
    const lower = change.toLowerCase();
    
    if (lower.includes('testimonial') || lower.includes('case stud')) {
      return "Create 3-5 testimonials manually with existing customers ($3k, 2 weeks). Add to page and measure conversion for 30 days before building testimonial system.";
    }
    if (lower.includes('feature') || lower.includes('functionality')) {
      return "Build a clickable prototype or fake door test. Show users the feature, measure who clicks, gather feedback before full build.";
    }
    if (lower.includes('onboarding')) {
      return "Run 10-15 user tests ($3k, 1 week) to see exactly where people get stuck. Fix those specific issues first.";
    }
    if (lower.includes('email') || lower.includes('notification')) {
      return "Manually send to 50-100 users first. Measure open rate, click rate, conversions before automating.";
    }
    if (lower.includes('integration')) {
      return "Use Zapier or Make.com to create low-code version (2 hours). See if users actually use it before building native integration.";
    }
    
    return "What's a manual, low-code, or small-scale version you could test first?";
  };

  const canProceed = () => {
    switch (currentScreen) {
      case 0:
        return story.change.length > 20 && story.baseline.length > 10 && story.magnitude;
      case 1:
        return story.mechanism.length > 30;
      case 2:
        return story.evidenceType && story.evidenceDetails.length > 20;
      case 3:
        return story.cheaperTest.length > 20;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Last screen - build bet and show review
      handleShowReview();
    }
  };

  const handleShowReview = () => {
    const betData = {
      hypothesis: buildHypothesis(story),
      metricDomain: inferMetricDomain(story.change),
      metric: inferMetric(story.change, story.baseline),
      baseline: story.baseline || '',
      prediction: `${story.growOrDecline} by ${story.magnitude || ''}`,
      confidence: 70,
      timeframe: 90,
      assumptions: `${story.mechanism || ''}\n\nEvidence: ${story.evidenceDetails || ''}`,
      cheapTest: story.cheaperTest || '',
      measurementTool: 'analytics',
      strategicAlignment: story.strategicAlignment,
      estimatedEffort: story.estimatedEffort,
      inactionImpact: story.inactionImpact,
      isOwnIdea: true,
      betType: (story.change || '').toLowerCase().includes('new') ? 'new' : 'improve',
      // Add the story parts for review
      storyParts: {
        change: story.change || '',
        mechanism: story.mechanism || '',
        evidenceType: story.evidenceType || '',
        evidenceDetails: story.evidenceDetails || '',
        cheaperTest: story.cheaperTest || ''
      }
    };
    
    console.log('Narrative bet completed:', betData);
    onComplete(betData);
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const buildHypothesis = (story) => {
    return `If we ${story.change || 'make this change'}, then ${story.baseline || 'the metric'} will ${story.growOrDecline} by ${story.magnitude || 'X'}, because ${story.mechanism || 'of the expected impact'}`;
  };

  const inferMetricDomain = (change) => {
    if (!change) return 'growth';  // Safety check
    const lower = change.toLowerCase();
    if (lower.includes('revenue') || lower.includes('monetiz')) return 'monetization';
    if (lower.includes('retention') || lower.includes('churn')) return 'retention';
    if (lower.includes('conversion') || lower.includes('signup')) return 'growth';
    if (lower.includes('engagement') || lower.includes('active')) return 'retention';
    return 'growth';
  };

  const inferMetric = (change, baseline) => {
    const changeText = change || '';
    const baselineText = baseline || '';
    const lower = (changeText + ' ' + baselineText).toLowerCase();
    if (lower.includes('conversion')) return 'Conversion rate';
    if (lower.includes('retention')) return 'Retention rate';
    if (lower.includes('revenue') || lower.includes('mrr')) return 'Revenue/MRR';
    if (lower.includes('signup')) return 'Signups';
    if (lower.includes('churn')) return 'Churn rate';
    return 'Custom metric';
  };

  return (
    <div className="narrative-container">
      {/* Header */}
      <div className="narrative-header">
        <h1>Make a Bet</h1>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          Step {currentScreen + 1} of {screens.length}: {screens[currentScreen].title}
        </div>
      </div>

      <div className="narrative-content">
        {/* Left: Story Building */}
        <div className="story-builder">
          {/* Screen 1: Change & Baseline */}
          {currentScreen === 0 && (
            <div className="screen">
              {hasLeadershipGoal && (
                <div className="leadership-context">
                  <div className="context-label">Supporting Leadership Goal:</div>
                  <div className="context-goal">{leadershipGoal}</div>
                </div>
              )}
              
              <h2>
                {hasLeadershipGoal 
                  ? `To support this goal, we will:`
                  : `Your Goal (be specific):`
                }
              </h2>
              
              <textarea
                value={story.change}
                onChange={e => setStory({ ...story, change: e.target.value })}
                placeholder={hasLeadershipGoal 
                  ? "Add video testimonials to pricing page"
                  : "Increase customers clicking on CTA by adding video testimonials to pricing page"
                }
                className="story-input large"
                rows={3}
              />

              <div className="story-sentence">
                <span className="sentence-part">
                  <span className="label-inline">This currently has a baseline of:</span>
                  <input
                    type="text"
                    value={story.baseline}
                    onChange={e => setStory({ ...story, baseline: e.target.value })}
                    placeholder={aiSuggestions.baseline || "e.g., 8% conversion rate (45 signups/week)"}
                    className="story-input inline"
                  />
                </span>
              </div>

              <div className="story-sentence">
                <span className="sentence-part">
                  <span className="label-inline">Which we expect to</span>
                  <select
                    value={story.growOrDecline}
                    onChange={e => setStory({ ...story, growOrDecline: e.target.value })}
                    className="story-select inline"
                  >
                    <option value="grow">grow</option>
                    <option value="decline">decline</option>
                  </select>
                  <span className="label-inline">by</span>
                  <input
                    type="text"
                    value={story.magnitude}
                    onChange={e => setStory({ ...story, magnitude: e.target.value })}
                    placeholder="e.g., 50% (from 8% to 12%)"
                    className="story-input inline"
                  />
                </span>
              </div>

              {aiSuggestions.growOrDecline && story.growOrDecline !== aiSuggestions.growOrDecline && (
                <div className="inline-hint suggestion">
                  💡 Based on your change, we'd expect this to {aiSuggestions.growOrDecline}
                </div>
              )}
            </div>
          )}

          {/* Screen 2: Mechanism */}
          {currentScreen === 1 && (
            <div className="screen">
              <h2>How will this change customer behavior?</h2>
              <p className="subtitle">
                Be specific about the mechanism - HOW does this change influence what customers do?
              </p>
              
              {aiSuggestions.mechanism && (
                <div className="inline-hint suggestion">
                  💡 {aiSuggestions.mechanism}
                </div>
              )}

              <div className="example-box">
                <div className="example-label">Strong Example:</div>
                <div className="example-text">
                  "Testimonials will increase trust. Currently prospects bounce because they don't 
                  believe our claims about results. Seeing real customers with specific outcomes will 
                  reduce skepticism and increase trial signups. We know trust is the blocker because 
                  exit surveys show 'need social proof' as #2 reason for not signing up."
                </div>
              </div>

              <textarea
                value={story.mechanism}
                onChange={e => setStory({ ...story, mechanism: e.target.value })}
                placeholder="Describe the causal chain: Current problem → Your change → New behavior → Expected outcome"
                className="story-input large"
                rows={5}
              />
            </div>
          )}

          {/* Screen 3: Evidence */}
          {currentScreen === 2 && (
            <div className="screen">
              <h2>Why are you confident this will work?</h2>
              <p className="subtitle">
                Strong bets have evidence, not just opinions
              </p>

              <div className="evidence-types">
                {[
                  { 
                    value: 'tested', 
                    label: '✓ We tested it', 
                    prompt: 'How many users? What did you see?',
                    example: 'Created 3 manual video testimonials, tested on 200 visitors for 2 weeks, saw conversion increase from 8% to 11.5%'
                  },
                  { 
                    value: 'interviews', 
                    label: '💬 Customer interviews', 
                    prompt: 'How many customers? What did they say?',
                    example: '15 interviews with churned customers. 12 mentioned "didn\'t trust the product would work" as primary concern'
                  },
                  { 
                    value: 'data', 
                    label: '📊 We have data', 
                    prompt: 'What does the data show?',
                    example: 'Analytics show 847 users clicked "customer stories" link but found nothing. Exit survey ranks "need social proof" as #2 blocker'
                  },
                  { 
                    value: 'competitor', 
                    label: '🏆 Competitor/case study', 
                    prompt: 'Who did this? What did they achieve?',
                    example: 'Competitor X added video testimonials Q2 2024, published case study showing 34% conversion increase. Our audience is similar'
                  },
                  { 
                    value: 'hypothesis', 
                    label: '💭 Team hypothesis', 
                    prompt: 'Why do you believe this? (Not validated)',
                    example: 'Our team believes testimonials will help based on general marketing best practices, but we haven\'t validated with our specific audience'
                  }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setStory({ ...story, evidenceType: type.value, evidenceDetails: '' })}
                    className={`evidence-type ${story.evidenceType === type.value ? 'selected' : ''}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {story.evidenceType && (
                <>
                  {story.evidenceType === 'hypothesis' && (
                    <div className="inline-hint warning">
                      ⚠️ Unvalidated bets are riskier. Consider validating before building.
                    </div>
                  )}
                  
                  <div className="evidence-prompt">
                    {[
                      { value: 'tested', prompt: 'How many users? What did you see?' },
                      { value: 'interviews', prompt: 'How many customers? What did they say?' },
                      { value: 'data', prompt: 'What does the data show?' },
                      { value: 'competitor', prompt: 'Who did this? What did they achieve?' },
                      { value: 'hypothesis', prompt: 'Why do you believe this?' }
                    ].find(t => t.value === story.evidenceType)?.prompt}
                  </div>

                  <div className="example-box small">
                    <div className="example-label">Strong answer:</div>
                    <div className="example-text">
                      {[
                        { value: 'tested', text: 'Created 3 manual testimonials, tested with 200 visitors for 2 weeks, saw conversion increase from 8% to 11.5%' },
                        { value: 'interviews', text: '15 interviews with churned customers. 12 mentioned "didn\'t trust the product" as primary concern' },
                        { value: 'data', text: '847 users clicked "customer stories" but found nothing. Exit survey shows "need social proof" as #2 blocker' },
                        { value: 'competitor', text: 'Competitor X added testimonials in Q2 2024, case study showed 34% increase. Similar audience to ours' },
                        { value: 'hypothesis', text: 'Based on marketing best practices, but not validated with our specific audience yet' }
                      ].find(t => t.value === story.evidenceType)?.text}
                    </div>
                  </div>

                  <textarea
                    value={story.evidenceDetails}
                    onChange={e => setStory({ ...story, evidenceDetails: e.target.value })}
                    placeholder="Be specific with numbers and sources..."
                    className="story-input large"
                    rows={4}
                  />
                </>
              )}
            </div>
          )}

          {/* Screen 4: Cheaper Test */}
          {currentScreen === 3 && (
            <div className="screen">
              <h2>Before building, how will you test this?</h2>
              <p className="subtitle">
                What's a cheaper, faster way to validate before committing full effort?
              </p>

              {aiSuggestions.cheaperTest && (
                <div className="suggestion-box">
                  <div className="suggestion-label">💡 Suggested cheaper test:</div>
                  <div className="suggestion-text">{aiSuggestions.cheaperTest}</div>
                  <button
                    onClick={() => setStory({ ...story, cheaperTest: aiSuggestions.cheaperTest })}
                    className="btn-use-suggestion"
                  >
                    Use This Suggestion
                  </button>
                </div>
              )}

              <textarea
                value={story.cheaperTest}
                onChange={e => setStory({ ...story, cheaperTest: e.target.value })}
                placeholder="Describe a manual, low-code, or small-scale test..."
                className="story-input large"
                rows={4}
              />

              <div className="form-group">
                <label>Estimated effort to build (full version)</label>
                <select
                  value={story.estimatedEffort}
                  onChange={e => setStory({ ...story, estimatedEffort: e.target.value })}
                  className="story-select"
                >
                  <option value="1-sprint">1 sprint (2 weeks) - ~$25k</option>
                  <option value="2-3-sprints">2-3 sprints (4-6 weeks) - ~$62k</option>
                  <option value="4-6-sprints">4-6 sprints (8-12 weeks) - ~$125k</option>
                  <option value="6-plus-sprints">6+ sprints (12+ weeks) - ~$150k+</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="narrative-nav">
            {currentScreen > 0 && (
              <button className="btn-back" onClick={handleBack}>
                ← Back
              </button>
            )}
            <button
              className="btn-next"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentScreen === screens.length - 1 ? 'Review Bet →' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Right: Live Story Preview */}
        <div className="story-preview">
          <h3>Your Bet Story:</h3>
          <StoryPreview story={story} currentScreen={currentScreen} hasLeadershipGoal={hasLeadershipGoal} leadershipGoal={leadershipGoal} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STORY PREVIEW COMPONENT
// ============================================

function StoryPreview({ story, currentScreen, hasLeadershipGoal, leadershipGoal }) {
  const parts = [];

  if (hasLeadershipGoal) {
    parts.push(`To support ${leadershipGoal}...`);
  }

  if (story.change && currentScreen >= 0) {
    parts.push(`We will ${story.change}`);
  }

  if (story.baseline && currentScreen >= 0) {
    parts.push(`Current: ${story.baseline}`);
  }

  if (story.magnitude && currentScreen >= 0) {
    parts.push(`Expected: ${story.growOrDecline} by ${story.magnitude}`);
  }

  if (story.mechanism && currentScreen >= 1) {
    parts.push(`Because: ${story.mechanism.substring(0, 100)}${story.mechanism.length > 100 ? '...' : ''}`);
  }

  if (story.evidenceType && currentScreen >= 2) {
    const evidenceLabels = {
      tested: 'Evidence: We tested it',
      interviews: 'Evidence: Customer interviews',
      data: 'Evidence: We have data',
      competitor: 'Evidence: Competitor/case study',
      hypothesis: 'Evidence: Team hypothesis (not validated)'
    };
    parts.push(evidenceLabels[story.evidenceType]);
  }

  if (story.cheaperTest && currentScreen >= 3) {
    parts.push(`Cheaper test: ${story.cheaperTest.substring(0, 80)}...`);
  }

  if (parts.length === 0) {
    return (
      <div className="story-empty">
        Your bet story will build here as you answer questions...
      </div>
    );
  }

  return (
    <div className="story-content">
      {parts.map((part, idx) => (
        <div key={idx} className="story-part">{part}</div>
      ))}
    </div>
  );
}
