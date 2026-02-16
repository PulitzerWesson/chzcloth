// ScoreReview.jsx - Display bet scores with conditional justification requirement

import React, { useState } from 'react';
import './ScoreReview.css';

export default function ScoreReview({ scores, betData, onSubmit, onCancel }) {
  const [justification, setJustification] = useState('');
  
  // Calculate average score
  const averageScore = Math.round(
    (scores.approach.score + scores.potential.score + scores.fit.score) / 3
  );
  
  // Determine if justification is needed
  const needsJustification = averageScore < 60;
  const optionalJustification = averageScore >= 60 && averageScore < 70;
  const noJustificationNeeded = averageScore >= 70;
  
  // Check if can submit
  const canSubmit = () => {
    if (needsJustification) {
      return justification.trim().length >= 50;
    }
    return true;
  };
  
  const handleSubmit = () => {
    if (!canSubmit()) return;
    
    onSubmit({
      ...betData,
      lowScoreJustification: justification.trim() || null,
      scoreAtSubmission: averageScore
    });
  };
  
  // Get score emoji and color
  const getScoreDisplay = (score) => {
    if (score >= 70) return { emoji: '✅', color: '#10b981', label: 'Good' };
    if (score >= 60) return { emoji: '⚠️', color: '#f59e0b', label: 'Fair' };
    return { emoji: '🔴', color: '#ef4444', label: 'Low' };
  };
  
  const overallDisplay = getScoreDisplay(averageScore);
  
  return (
    <div className="score-review-container">
      <h2>CHZCLOTH Score</h2>
      
      {/* Overall Score */}
      <div className="overall-score" style={{ borderColor: overallDisplay.color }}>
        <div className="score-emoji">{overallDisplay.emoji}</div>
        <div className="score-value" style={{ color: overallDisplay.color }}>
          {averageScore}/100
        </div>
        <div className="score-label">{overallDisplay.label}</div>
      </div>
      
      {/* Detailed Scores */}
      <div className="score-breakdown">
        <div className="score-item">
          <div className="score-item-header">
            <span className="score-item-name">Approach</span>
            <span className="score-item-value">{scores.approach.score}/100</span>
          </div>
          <p className="score-rationale">{scores.approach.rationale}</p>
        </div>
        
        <div className="score-item">
          <div className="score-item-header">
            <span className="score-item-name">Potential</span>
            <span className="score-item-value">{scores.potential.score}/100</span>
          </div>
          <p className="score-rationale">{scores.potential.rationale}</p>
        </div>
        
        <div className="score-item">
          <div className="score-item-header">
            <span className="score-item-name">Fit</span>
            <span className="score-item-value">{scores.fit.score}/100</span>
          </div>
          <p className="score-rationale">{scores.fit.rationale}</p>
        </div>
      </div>
      
      {/* Market Context (if web search was used) */}
      {scores.market_context && (
        <div className="market-context">
          <h3>Market Context</h3>
          <p>{scores.market_context}</p>
          {scores.web_search_used && (
            <div className="web-search-badge">
              🌐 Enhanced with web research
            </div>
          )}
        </div>
      )}
      
      {/* CHZCLOTH Suggestion (Read-only FYI) */}
      {scores.suggestion && (
        <div className="suggestion-box">
          <div className="suggestion-header">
            💡 CHZCLOTH Suggestion (FYI)
          </div>
          <p className="suggestion-intro">
            A stronger version of this bet could look like:
          </p>
          <div className="suggestion-content">
            <div className="suggestion-field">
              <strong>Hypothesis:</strong> {scores.suggestion.hypothesis}
            </div>
            <div className="suggestion-field">
              <strong>Metrics:</strong> {scores.suggestion.metrics}
            </div>
            <div className="suggestion-field">
              <strong>Effort:</strong> {scores.suggestion.effort}
            </div>
            <div className="suggestion-field">
              <strong>Expected Score:</strong> {scores.suggestion.expected_score}/100
            </div>
            <div className="suggestion-reasoning">
              {scores.suggestion.reasoning}
            </div>
            {scores.suggestion.market_evidence && (
              <div className="suggestion-evidence">
                <strong>Market Evidence:</strong> {scores.suggestion.market_evidence}
              </div>
            )}
          </div>
          <p className="suggestion-note">
            This is informational only. If you want to use this suggestion, go back and revise your bet.
          </p>
        </div>
      )}
      
      {/* Justification Field - Conditional */}
      {needsJustification && (
        <div className="justification-required">
          <h3>⚠️ Justification Required</h3>
          <p className="justification-explanation">
            This bet scored below 60/100. Please explain why it makes sense despite the low score.
          </p>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Example: 'This scores low on fit because it's high effort, but it's table-stakes for our Series B pitch and competitor just launched this feature...'"
            className="justification-textarea"
            rows={6}
          />
          <div className="character-count">
            {justification.trim().length} / 50 characters minimum
          </div>
        </div>
      )}
      
      {optionalJustification && (
        <div className="justification-optional">
          <h3>💭 Optional: Explain Your Reasoning</h3>
          <p className="justification-explanation">
            This helps track decision quality over time.
          </p>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Why are you confident this bet makes sense?"
            className="justification-textarea"
            rows={4}
          />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="score-actions">
        <button
          onClick={onCancel}
          className="btn-cancel"
        >
          ← Go Back & Revise
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="btn-submit"
        >
          {needsJustification 
            ? 'Submit Bet With Justification' 
            : noJustificationNeeded
            ? 'Submit Bet'
            : 'Submit Bet As-Is'
          }
        </button>
      </div>
      
      {needsJustification && !canSubmit() && (
        <p className="submit-hint">
          Write at least 50 characters explaining why this bet makes sense despite the low score
        </p>
      )}
    </div>
  );
}
