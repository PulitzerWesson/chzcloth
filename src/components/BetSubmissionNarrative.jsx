// BetSubmissionNarrative.jsx - Single smart field with AI validation

import React, { useState } from 'react';
import './BetSubmissionNarrative.css';

export default function BetSubmissionNarrative({ onComplete, orgMode, currentOrg }) {
  const [goalContext, setGoalContext] = useState('');
  const [narrative, setNarrative] = useState('');
  const [story, setStory] = useState({
    validationMethod: '',
    validationTimeframe: '90'
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showExample, setShowExample] = useState(false);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:...;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if org has leadership goal
  const hasLeadershipGoal = currentOrg?.leadershipGoal;
  const leadershipGoal = hasLeadershipGoal ? currentOrg.leadershipGoal : null;

  const exampleNarrative = `Add 5 video testimonials from enterprise customers to our pricing page.

Currently, our pricing page converts at 8% (45 signups/week measured in Stripe). We expect this to grow to 12% conversion (68 signups/week) - a 50% increase.

This will work because prospects bounce due to lack of trust. Exit surveys show "need social proof" as the #2 reason for not signing up (127 responses in Q4 2024). Real customer stories with specific outcomes will reduce skepticism and increase trial signups.

Evidence: We tested 3 manual video testimonials with 200 visitors for 2 weeks and saw conversion increase from 8% to 11.5%. Customer interviews (15 churned users) confirmed that 12 mentioned "didn't trust the product would work" as primary concern.`;

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
          goalContext: hasLeadershipGoal ? leadershipGoal : goalContext,
          uploadedFile  // Include uploaded file if present
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
      timeframe: parseInt(story.validationTimeframe),
      validationMethod: story.validationMethod,
      assumptions: extracted.mechanism || '',
      cheapTest: '',
      measurementTool: 'analytics',
      strategicAlignment: 'inner',
      estimatedEffort: parseEffort(extracted.effort),
      inactionImpact: 'lose-opportunity',
      isOwnIdea: true,
      betType: 'improve',
      goalContext: hasLeadershipGoal ? leadershipGoal : goalContext,
      goalAlignment: aiReview.goalAlignment,
      // Document metadata
      documentProvided: !!uploadedFile,
      documentName: uploadedFile?.name || null,
      documentType: uploadedFile?.type || null,
      // Pass data for review screen
      change: extracted.change || '',
      baseline: extracted.baseline || '',
      magnitude: extracted.magnitude || '',
      mechanism: extracted.mechanism || '',
      evidenceType: 'tested',
      evidenceDetails: extracted.evidence || '',
      cheaperTest: ''
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
    if (!story.validationMethod || story.validationMethod.length < 5) return false;
    return true;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain',
      'text/markdown'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, Word document, or text file');
      return;
    }

    // Validate file size (32MB limit)
    if (file.size > 32 * 1024 * 1024) {
      setUploadError('File size must be under 32MB');
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: base64Data
      });
      setUploadError(null);
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
      console.error('File upload error:', error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError(null);
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
            placeholder="Include: What you'll change, current state (with numbers), expected outcome (with numbers), why it will work, and evidence you have..."
            className="narrative-textarea"
            rows={16}
          />
          <div className="character-count">
            {narrative.length} characters {narrative.length < 100 && `(minimum 100)`}
          </div>
        </div>

        {/* File Upload (Optional) */}
        <div className="file-upload-section">
          <label>Supporting Document (optional)</label>
          <div className="file-upload-hint">
            Upload a PRD, meeting notes, or research doc for additional context
          </div>
          
          {!uploadedFile ? (
            <div className="file-upload-zone">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <div className="upload-icon">📄</div>
                <div className="upload-text">Click to upload or drag and drop</div>
                <div className="upload-formats">PDF, Word, Text, or Markdown (max 32MB)</div>
              </label>
            </div>
          ) : (
            <div className="file-uploaded">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{uploadedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="btn-remove-file"
              >
                Remove
              </button>
            </div>
          )}
          
          {uploadError && (
            <div className="upload-error">{uploadError}</div>
          )}
        </div>

        {/* Validation Plan */}
        <div className="validation-plan">
          <div className="validation-field">
            <label>How will you validate this worked?</label>
            <input
              type="text"
              value={story.validationMethod}
              onChange={e => setStory({ ...story, validationMethod: e.target.value })}
              placeholder="e.g., Check Stripe conversion rate, Measure in PostHog, Review Salesforce pipeline"
              className="validation-input"
            />
          </div>

          <div className="validation-field">
            <label>When will you check?</label>
            <select
              value={story.validationTimeframe}
              onChange={e => setStory({ ...story, validationTimeframe: e.target.value })}
              className="validation-select"
            >
              <option value="30">30 days after launch</option>
              <option value="60">60 days after launch</option>
              <option value="90">90 days after launch</option>
              <option value="120">120 days after launch</option>
              <option value="180">6 months after launch</option>
            </select>
          </div>
        </div>

        {/* AI Review Results */}
        {hasSubmitted && aiReview && (
          <div className="ai-review-section">
            <h3>CHZCLOTH Review</h3>

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
