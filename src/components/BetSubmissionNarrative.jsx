// BetSubmissionNarrative.jsx - Story-building approach to bet creation

import React, { useState, useEffect } from 'react';
import './BetSubmissionNarrative.css';

export default function BetSubmissionNarrative({ onComplete, orgMode, currentOrg }) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [story, setStory] = useState({
    // Screen 1 - Single narrative
    narrative: '',
    parsedData: {
      change: '',
      baseline: '',
      magnitude: '',
      mechanism: ''
    },
    
    // Screen 2 - Multi-select evidence
    evidenceTypes: [],  // Array: ['tested', 'interviews', 'data']
    evidenceDetails: {}, // Object: { tested: "details...", interviews: "details..." }
    
    // Screen 3 - Test
    cheaperTest: '',
    estimatedEffort: '2-3-sprints',
    
    // Metadata
    strategicAlignment: 'inner',
    inactionImpact: 'lose-opportunity'
  });

  const [isParsingNarrative, setIsParsingNarrative] = useState(false);
  const [parseError, setParseError] = useState(null);

  const screens = [
    { id: 'narrative', title: 'Tell us the bet story' },
    { id: 'evidence', title: 'What evidence supports this?' },
    { id: 'test', title: 'How will you test it?' }
  ];

  const progress = ((currentScreen + 1) / screens.length) * 100;
  
  // Check if org has leadership goal
  const hasLeadershipGoal = currentOrg?.leadershipGoal;
  const leadershipGoal = hasLeadershipGoal ? currentOrg.leadershipGoal : null;

  // Debounced AI parsing of narrative
  useEffect(() => {
    if (!story.narrative || story.narrative.length < 50) {
      return; // Don't parse very short text
    }

    const timeoutId = setTimeout(() => {
      parseNarrative(story.narrative);
    }, 2000); // Parse 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [story.narrative]);

  const parseNarrative = async (narrative) => {
    setIsParsingNarrative(true);
    setParseError(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Extract the following from this product bet narrative. Return ONLY a JSON object with these exact fields:

{
  "change": "what's being built/changed",
  "baseline": "current state with specific numbers",
  "magnitude": "expected change with numbers",
  "mechanism": "why this will work (the causal reasoning)"
}

Narrative:
${narrative}

Remember: ONLY return the JSON object, no other text.`
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text;
      
      // Remove markdown code fences if present
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);

      setStory(prev => ({
        ...prev,
        parsedData: {
          change: parsed.change || '',
          baseline: parsed.baseline || '',
          magnitude: parsed.magnitude || '',
          mechanism: parsed.mechanism || ''
        }
      }));
    } catch (error) {
      console.error('Parse error:', error);
      setParseError('Could not parse narrative');
    } finally {
      setIsParsingNarrative(false);
    }
  };

  const generateCheaperTestSuggestion = (narrative) => {
    if (!narrative) return "What's a manual, low-code, or small-scale version you could test first?";
    const lower = narrative.toLowerCase();
    
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
        // Screen 1: Narrative must be substantial
        return story.narrative.length > 100;
      case 1:
        // Screen 2: At least one evidence type selected with details
        return story.evidenceTypes.length > 0 && 
               story.evidenceTypes.some(type => 
                 story.evidenceDetails[type] && story.evidenceDetails[type].length > 20
               );
      case 2:
        // Screen 3: Cheaper test described
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
    const parsed = story.parsedData;
    
    // Build combined evidence string
    const evidenceString = story.evidenceTypes
      .map(type => {
        const labels = {
          tested: 'Tested',
          interviews: 'Interviews',
          data: 'Data',
          competitor: 'Competitor',
          hypothesis: 'Hypothesis'
        };
        return `${labels[type]}: ${story.evidenceDetails[type]}`;
      })
      .join('\n\n');
    
    const betData = {
      // Core bet data using parsed narrative
      hypothesis: `If we ${parsed.change || story.narrative.substring(0, 100)}, then ${parsed.baseline || 'the metric'} will improve by ${parsed.magnitude || 'X'}, because ${parsed.mechanism || 'of the expected impact'}`,
      metricDomain: inferMetricDomain(story.narrative),
      metric: inferMetric(story.narrative),
      baseline: parsed.baseline || '',
      prediction: parsed.magnitude || '',
      confidence: 70,
      timeframe: 90,
      assumptions: `${parsed.mechanism || ''}\n\nEvidence:\n${evidenceString}`,
      cheapTest: story.cheaperTest || '',
      measurementTool: 'analytics',
      strategicAlignment: story.strategicAlignment,
      estimatedEffort: story.estimatedEffort,
      inactionImpact: story.inactionImpact,
      isOwnIdea: true,
      betType: story.narrative.toLowerCase().includes('new') ? 'new' : 'improve',
      
      // Pass through for review screen
      change: parsed.change || story.narrative.substring(0, 200),
      baseline: parsed.baseline || '',
      magnitude: parsed.magnitude || '',
      mechanism: parsed.mechanism || '',
      evidenceType: story.evidenceTypes[0] || 'hypothesis', // Primary evidence type
      evidenceDetails: evidenceString,
      cheaperTest: story.cheaperTest || ''
    };
    
    console.log('Narrative bet completed:', betData);
    onComplete(betData);
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const inferMetricDomain = (narrative) => {
    if (!narrative) return 'growth';
    const lower = narrative.toLowerCase();
    if (lower.includes('revenue') || lower.includes('monetiz')) return 'monetization';
    if (lower.includes('retention') || lower.includes('churn')) return 'retention';
    if (lower.includes('conversion') || lower.includes('signup')) return 'growth';
    if (lower.includes('engagement') || lower.includes('active')) return 'retention';
    return 'growth';
  };

  const inferMetric = (narrative) => {
    if (!narrative) return 'Custom metric';
    const lower = narrative.toLowerCase();
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
          {/* Screen 1: The Narrative */}
          {currentScreen === 0 && (
            <div className="screen">
              {hasLeadershipGoal && (
                <div className="leadership-context">
                  <div className="context-label">Supporting Leadership Goal:</div>
                  <div className="context-goal">{leadershipGoal}</div>
                </div>
              )}
              
              <h2>Tell us the bet story</h2>
              <p className="subtitle">
                Describe what you'll build, the current state, expected outcome, and why it'll work — all in one narrative.
              </p>

              <div className="example-box">
                <div className="example-label">Strong Example:</div>
                <div className="example-text">
                  We'll add 5 video testimonials from enterprise customers to our pricing page.
                  <br/><br/>
                  Currently, our pricing page converts at 8% (45 signups/week measured in Stripe). We expect this to grow by 50% to 12% conversion (68 signups/week).
                  <br/><br/>
                  This will work because prospects are bouncing due to lack of trust. Exit surveys show "need social proof" as the #2 reason for not signing up (127 responses). Real customer stories with specific outcomes will reduce skepticism and increase trial signups.
                </div>
              </div>

              <textarea
                value={story.narrative}
                onChange={e => setStory({ ...story, narrative: e.target.value })}
                placeholder="Describe your bet: what you'll change, current state, expected outcome, and why it'll work..."
                className="story-input narrative-large"
                rows={12}
              />

              {isParsingNarrative && (
                <div className="inline-hint suggestion">
                  🤖 Understanding your bet...
                </div>
              )}

              {parseError && (
                <div className="inline-hint warning">
                  ⚠️ {parseError}
                </div>
              )}
            </div>
          )}

          {/* Screen 2: Multi-Select Evidence */}
          {currentScreen === 1 && (
            <div className="screen">
              <h2>What evidence supports this bet?</h2>
              <p className="subtitle">
                Select all that apply - strong bets often have multiple evidence sources
              </p>

              <div className="evidence-types-multi">
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
                  <div key={type.value}>
                    <label className={`evidence-checkbox ${story.evidenceTypes.includes(type.value) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={story.evidenceTypes.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...story.evidenceTypes, type.value]
                            : story.evidenceTypes.filter(t => t !== type.value);
                          setStory({ ...story, evidenceTypes: newTypes });
                        }}
                      />
                      <span className="checkbox-label">{type.label}</span>
                    </label>

                    {story.evidenceTypes.includes(type.value) && (
                      <div className="evidence-detail-section">
                        <div className="evidence-prompt">{type.prompt}</div>
                        <div className="example-box small">
                          <div className="example-label">Strong answer:</div>
                          <div className="example-text">{type.example}</div>
                        </div>
                        <textarea
                          value={story.evidenceDetails[type.value] || ''}
                          onChange={e => setStory({ 
                            ...story, 
                            evidenceDetails: { 
                              ...story.evidenceDetails, 
                              [type.value]: e.target.value 
                            }
                          })}
                          placeholder="Be specific with numbers and sources..."
                          className="story-input large"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {story.evidenceTypes.includes('hypothesis') && (
                <div className="inline-hint warning">
                  ⚠️ Unvalidated bets are riskier. Consider validating before building.
                </div>
              )}
            </div>
          )}

          {/* Screen 3: Cheaper Test */}
          {currentScreen === 2 && (
            <div className="screen">
              <h2>Before building, how will you test this?</h2>
              <p className="subtitle">
                What's a cheaper, faster way to validate before committing full effort?
              </p>

              <div className="suggestion-box">
                <div className="suggestion-label">💡 Suggested cheaper test:</div>
                <div className="suggestion-text">{generateCheaperTestSuggestion(story.narrative)}</div>
                <button
                  onClick={() => setStory({ ...story, cheaperTest: generateCheaperTestSuggestion(story.narrative) })}
                  className="btn-use-suggestion"
                >
                  Use This Suggestion
                </button>
              </div>

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
    parts.push({ label: 'Supporting', text: leadershipGoal, icon: '🎯' });
  }

  // Screen 1 - Show parsed narrative
  if (currentScreen >= 0 && story.parsedData) {
    if (story.parsedData.change) {
      parts.push({ label: 'What\'s changing', text: story.parsedData.change, icon: '📝' });
    }
    if (story.parsedData.baseline) {
      parts.push({ label: 'Current state', text: story.parsedData.baseline, icon: '📊' });
    }
    if (story.parsedData.magnitude) {
      parts.push({ label: 'Expected outcome', text: story.parsedData.magnitude, icon: '🎯' });
    }
    if (story.parsedData.mechanism) {
      const truncated = story.parsedData.mechanism.length > 100 
        ? story.parsedData.mechanism.substring(0, 100) + '...' 
        : story.parsedData.mechanism;
      parts.push({ label: 'Why it\'ll work', text: truncated, icon: '💡' });
    }
  }

  // Screen 2 - Show evidence types
  if (currentScreen >= 1 && story.evidenceTypes.length > 0) {
    const evidenceLabels = {
      tested: '✓ Tested it',
      interviews: '💬 Customer interviews',
      data: '📊 Have data',
      competitor: '🏆 Competitor/case study',
      hypothesis: '💭 Team hypothesis'
    };
    const evidenceList = story.evidenceTypes.map(type => evidenceLabels[type]).join(', ');
    parts.push({ label: 'Evidence', text: evidenceList, icon: '🔍' });
  }

  // Screen 3 - Show test plan
  if (currentScreen >= 2 && story.cheaperTest) {
    const truncated = story.cheaperTest.length > 80 
      ? story.cheaperTest.substring(0, 80) + '...' 
      : story.cheaperTest;
    parts.push({ label: 'Cheaper test', text: truncated, icon: '🧪' });
  }

  if (parts.length === 0) {
    return (
      <div className="story-empty">
        Your bet story will build here as you write...
      </div>
    );
  }

  return (
    <div className="story-content">
      {parts.map((part, idx) => (
        <div key={idx} className="story-part">
          <div className="story-part-label">
            <span className="story-icon">{part.icon}</span>
            {part.label}
          </div>
          <div className="story-part-text">{part.text}</div>
        </div>
      ))}
    </div>
  );
}
