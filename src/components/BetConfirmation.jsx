// BetConfirmation.jsx - User confirms/sets bet parameters before scoring

import React, { useState } from 'react';
import './BetConfirmation.css';

export default function BetConfirmation({ extractedData, onContinue, onBack }) {
  const [confidence, setConfidence] = useState(70);
  const [strategicAlignment, setStrategicAlignment] = useState('inner');
  const [inactionImpact, setInactionImpact] = useState('lose-opportunity');
  const [estimatedEffort, setEstimatedEffort] = useState(extractedData.effort || '2-3-sprints');
  const [startBy, setStartBy] = useState('');
  const [mustShipBy, setMustShipBy] = useState(extractedData.goalQuarterEnd || '');
  const [isScoring, setIsScoring] = useState(false);

  const handleSubmit = async () => {
    setIsScoring(true);
    await onContinue({
      confidence,
      strategicAlignment,
      inactionImpact,
      estimatedEffort,
      startBy: startBy || null,
      mustShipBy: mustShipBy || null,
    });
  };

  const getConfidenceLabel = () => {
    if (confidence >= 80) return 'Very Confident';
    if (confidence >= 60) return 'Confident';
    if (confidence >= 40) return 'Somewhat Confident';
    return 'Low Confidence';
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: 'dark',
  };

  return (
    <div className="bet-confirmation-container">
      <h2>Set Your Bet Parameters</h2>
      <p className="confirmation-intro">
        Confirm a few params before scoring.
      </p>

      {/* Confidence Slider */}
      <div className="confirmation-field">
        <label>Your Confidence</label>
        <div className="confidence-hint">How confident are you this will work?</div>
        <div className="confidence-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value))}
            className="confidence-slider"
          />
          <div className="confidence-value">
            <span className="confidence-percent">{confidence}%</span>
            <span className="confidence-label">{getConfidenceLabel()}</span>
          </div>
        </div>
      </div>

      {/* Strategic Priority */}
      <div className="confirmation-field">
        <label>Strategic Priority</label>
        <div className="confidence-hint">Where does this fit in your roadmap?</div>
        <div className="radio-group">
          <label className={`radio-option ${strategicAlignment === 'inner' ? 'selected' : ''}`}>
            <input type="radio" name="strategic" value="inner" checked={strategicAlignment === 'inner'} onChange={(e) => setStrategicAlignment(e.target.value)} />
            <div className="radio-content">
              <div className="radio-title">Inner Ring</div>
              <div className="radio-description">Core product, critical path</div>
            </div>
          </label>
          <label className={`radio-option ${strategicAlignment === 'outer' ? 'selected' : ''}`}>
            <input type="radio" name="strategic" value="outer" checked={strategicAlignment === 'outer'} onChange={(e) => setStrategicAlignment(e.target.value)} />
            <div className="radio-content">
              <div className="radio-title">Outer Ring</div>
              <div className="radio-description">Nice to have, quality of life</div>
            </div>
          </label>
          <label className={`radio-option ${strategicAlignment === 'experimental' ? 'selected' : ''}`}>
            <input type="radio" name="strategic" value="experimental" checked={strategicAlignment === 'experimental'} onChange={(e) => setStrategicAlignment(e.target.value)} />
            <div className="radio-content">
              <div className="radio-title">Experimental</div>
              <div className="radio-description">Test, learn, might not ship</div>
            </div>
          </label>
        </div>
      </div>

      {/* Inaction Impact */}
      <div className="confirmation-field">
        <label>If We DON'T Do This</label>
        <div className="confidence-hint">What's the cost of inaction?</div>
        <select value={inactionImpact} onChange={(e) => setInactionImpact(e.target.value)} className="confirmation-select">
          <option value="lose-competitive-edge">Lose competitive edge</option>
          <option value="lose-opportunity">Miss opportunity</option>
          <option value="risk-increases">Risk increases</option>
          <option value="minor">Nothing bad happens</option>
        </select>
      </div>

      {/* Effort Estimate */}
      <div className="confirmation-field">
        <label>Effort Estimate</label>
        {extractedData.effort && (
          <div className="ai-suggestion">
            AI suggested: <strong>{extractedData.effort.replace('-', ' to ')}</strong>
          </div>
        )}
        <div className="radio-group-horizontal">
          {['1-sprint', '2-3-sprints', '4-6-sprints', '6-plus-sprints'].map(val => (
            <label key={val} className={`radio-chip ${estimatedEffort === val ? 'selected' : ''}`}>
              <input type="radio" name="effort" value={val} checked={estimatedEffort === val} onChange={(e) => setEstimatedEffort(e.target.value)} />
              <span>{val.replace('plus', '+').replace(/-/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Deadlines */}
      <div className="confirmation-field">
        <label>Deadlines <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.85rem' }}>(optional)</span></label>
        <div className="confidence-hint">Set timing expectations to help prioritize this bet.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 8 }}>Start by</div>
            <input
              type="date"
              value={startBy}
              onChange={e => setStartBy(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 8 }}>
              Must ship by
              {extractedData.goalQuarterEnd && (
                <span style={{ color: '#2dd4bf', fontSize: '0.75rem', marginLeft: 6 }}>← from goal quarter</span>
              )}
            </div>
            <input
              type="date"
              value={mustShipBy}
              onChange={e => setMustShipBy(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="confirmation-summary">
        <h3>Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Confidence:</span>
            <span className="summary-value">{confidence}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Priority:</span>
            <span className="summary-value">
              {strategicAlignment === 'inner' ? 'Inner Ring' :
               strategicAlignment === 'outer' ? 'Outer Ring' : 'Experimental'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Effort:</span>
            <span className="summary-value">{estimatedEffort.replace('-', ' to ')}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Inaction Risk:</span>
            <span className="summary-value">
              {inactionImpact === 'lose-competitive-edge' ? 'Lose edge' :
               inactionImpact === 'lose-opportunity' ? 'Miss opportunity' :
               inactionImpact === 'risk-increases' ? 'Risk increases' : 'Minor'}
            </span>
          </div>
          {mustShipBy && (
            <div className="summary-item">
              <span className="summary-label">Must ship by:</span>
              <span className="summary-value">{new Date(mustShipBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
          {startBy && (
            <div className="summary-item">
              <span className="summary-label">Start by:</span>
              <span className="summary-value">{new Date(startBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="confirmation-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          className="btn-continue"
          disabled={isScoring}
          style={{ padding: '12px 24px', opacity: isScoring ? 0.7 : 1, cursor: isScoring ? 'not-allowed' : 'pointer' }}
        >
          {isScoring ? 'Scoring...' : 'Score Bet →'}
        </button>
      </div>
    </div>
  );
}
