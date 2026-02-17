import React, { useState } from 'react';

function BetSubmission({ 
  onSubmit, 
  onCancel,
  currentOrg,
  initialData = null
}) {
  const [step, setStep] = useState(1); // 1 = bet details, 2 = meta fields
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [autoFillText, setAutoFillText] = useState('');
  const [parsing, setParsing] = useState(false);
  
  // Bet data fields
  const [betData, setBetData] = useState({
    hypothesis: initialData?.hypothesis || '',
    metric: initialData?.metric || '',
    prediction: initialData?.prediction || '',
    baseline: initialData?.baseline || '',
    assumptions: initialData?.assumptions || '',
    timeframe: initialData?.timeframe || '90',
    measurementTool: initialData?.measurementTool || 'analytics',
    // Meta fields (step 2)
    confidence: initialData?.confidence || 70,
    strategicAlignment: initialData?.strategicAlignment || 'inner',
    estimatedEffort: initialData?.estimatedEffort || '2-3-sprints',
    inactionImpact: initialData?.inactionImpact || 'lose-opportunity',
    metricDomain: initialData?.metricDomain || 'product',
    betType: initialData?.betType || 'improve'
  });

  const [errors, setErrors] = useState({});

  // Auto-fill from text/document
  const handleAutoFill = async () => {
    if (!autoFillText.trim()) return;
    
    setParsing(true);
    try {
      const response = await fetch('/api/parse-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: autoFillText,
          orgId: currentOrg?.id 
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // Populate fields with parsed data
      setBetData(prev => ({
        ...prev,
        hypothesis: data.hypothesis || prev.hypothesis,
        metric: data.metric || prev.metric,
        prediction: data.prediction || prev.prediction,
        baseline: data.baseline || prev.baseline,
        assumptions: data.assumptions || prev.assumptions,
        timeframe: data.timeframe || prev.timeframe,
        measurementTool: data.measurementTool || prev.measurementTool
      }));

      setShowAutoFill(false);
      setAutoFillText('');
    } catch (err) {
      console.error('Error parsing bet:', err);
      alert('Error parsing text: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!betData.hypothesis.trim()) newErrors.hypothesis = 'Required';
    if (!betData.metric.trim()) newErrors.metric = 'Required';
    if (!betData.prediction.trim()) newErrors.prediction = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step progression
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    onSubmit(betData);
  };

  const updateField = (field, value) => {
    setBetData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          {step === 1 ? 'New Bet' : 'Bet Context'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          {step === 1 
            ? 'Define your hypothesis and expected outcomes'
            : 'Add strategic context and effort estimates'
          }
        </p>
      </div>

      {/* Step 1: Bet Details */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Auto-fill section */}
          {!showAutoFill ? (
            <button
              onClick={() => setShowAutoFill(true)}
              style={{
                padding: '12px 20px',
                background: 'rgba(125, 211, 252, 0.1)',
                border: '1px dashed rgba(125, 211, 252, 0.3)',
                borderRadius: 8,
                color: '#7dd3fc',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'center'
              }}
            >
📄 Auto-fill from text or document
            </button>
          ) : (
            <div style={{
              background: 'rgba(125, 211, 252, 0.05)',
              border: '1px solid rgba(125, 211, 252, 0.2)',
              borderRadius: 12,
              padding: 20
            }}>
              <div style={{ marginBottom: 12, color: '#7dd3fc', fontWeight: 600, fontSize: '0.9rem' }}>
                Paste your bet text or document content
              </div>
              <textarea
                value={autoFillText}
                onChange={(e) => setAutoFillText(e.target.value)}
                placeholder="Paste your hypothesis, metrics, and any relevant context here..."
                style={{
                  width: '100%',
                  minHeight: 150,
                  padding: 12,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  marginBottom: 12
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleAutoFill}
                  disabled={parsing || !autoFillText.trim()}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: parsing ? 'rgba(125, 211, 252, 0.1)' : 'linear-gradient(135deg, #7dd3fc 0%, #22d3ee 100%)',
                    border: 'none',
                    borderRadius: 8,
                    color: parsing ? '#64748b' : '#0a0f1a',
                    fontWeight: 600,
                    cursor: parsing ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {parsing ? 'Parsing...' : 'Parse & Fill Fields'}
                </button>
                <button
                  onClick={() => {
                    setShowAutoFill(false);
                    setAutoFillText('');
                  }}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Hypothesis */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Hypothesis (if/then/because) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={betData.hypothesis}
              onChange={(e) => updateField('hypothesis', e.target.value)}
              placeholder="If we [action], then [current state] will improve to [desired state], because [reasoning]"
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${errors.hypothesis ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
            {errors.hypothesis && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 4 }}>
                {errors.hypothesis}
              </div>
            )}
          </div>

          {/* Metric */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Metric <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={betData.metric}
              onChange={(e) => updateField('metric', e.target.value)}
              placeholder="e.g., Conversion rate, Daily active users, Revenue"
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${errors.metric ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem'
              }}
            />
            {errors.metric && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 4 }}>
                {errors.metric}
              </div>
            )}
          </div>

          {/* Prediction and Baseline (side by side) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
                Prediction <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={betData.prediction}
                onChange={(e) => updateField('prediction', e.target.value)}
                placeholder="e.g., 12% conversion rate"
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${errors.prediction ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '0.95rem'
                }}
              />
              {errors.prediction && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 4 }}>
                  {errors.prediction}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
                Baseline
              </label>
              <input
                type="text"
                value={betData.baseline}
                onChange={(e) => updateField('baseline', e.target.value)}
                placeholder="e.g., 8% conversion rate"
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Assumptions */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Assumptions
            </label>
            <textarea
              value={betData.assumptions}
              onChange={(e) => updateField('assumptions', e.target.value)}
              placeholder="What needs to be true for this to work?"
              style={{
                width: '100%',
                minHeight: 80,
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Timeframe and Measurement Tool */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
                Timeframe (days)
              </label>
              <input
                type="number"
                value={betData.timeframe}
                onChange={(e) => updateField('timeframe', e.target.value)}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
                Measurement Tool
              </label>
              <select
                value={betData.measurementTool}
                onChange={(e) => updateField('measurementTool', e.target.value)}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '0.95rem'
                }}
              >
                <option value="analytics">Analytics</option>
                <option value="manual">Manual tracking</option>
                <option value="survey">Survey</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0f1a',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Next: Add Context →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Meta Fields */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Confidence */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Confidence: {betData.confidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={betData.confidence}
              onChange={(e) => updateField('confidence', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Bet Type */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Bet Type
            </label>
            <select
              value={betData.betType}
              onChange={(e) => updateField('betType', e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem'
              }}
            >
              <option value="improve">Improve existing metric</option>
              <option value="introduce">Introduce new capability</option>
              <option value="remove">Remove/deprecate feature</option>
            </select>
          </div>

          {/* Metric Domain */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Metric Domain
            </label>
            <select
              value={betData.metricDomain}
              onChange={(e) => updateField('metricDomain', e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem'
              }}
            >
              <option value="product">Product/Growth</option>
              <option value="retention">Retention</option>
              <option value="revenue">Revenue</option>
              <option value="efficiency">Operational Efficiency</option>
              <option value="quality">Quality/Experience</option>
            </select>
          </div>

          {/* Strategic Alignment */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Strategic Alignment
            </label>
            <select
              value={betData.strategicAlignment}
              onChange={(e) => updateField('strategicAlignment', e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem'
              }}
            >
              <option value="inner">Inner circle (core product)</option>
              <option value="middle">Middle ring (important but not core)</option>
              <option value="outer">Outer ring (experimental/nice-to-have)</option>
            </select>
          </div>

          {/* Estimated Effort */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Estimated Effort
            </label>
            <select
              value={betData.estimatedEffort}
              onChange={(e) => updateField('estimatedEffort', e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem'
              }}
            >
              <option value="1-sprint">1 sprint</option>
              <option value="2-3-sprints">2-3 sprints</option>
              <option value="1-quarter">1 quarter</option>
              <option value="multi-quarter">Multi-quarter</option>
            </select>
          </div>

          {/* Inaction Impact */}
          <div>
            <label style={{ display: 'block', color: '#f1f5f9', marginBottom: 8, fontWeight: 600 }}>
              Cost of Inaction
            </label>
            <select
              value={betData.inactionImpact}
              onChange={(e) => updateField('inactionImpact', e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem'
              }}
            >
              <option value="nothing">Nothing (we're fine)</option>
              <option value="lose-opportunity">Lose opportunity</option>
              <option value="competitive-risk">Competitive risk</option>
              <option value="existential">Existential threat</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              onClick={handleBack}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0f1a',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Review Bet →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BetSubmission;
