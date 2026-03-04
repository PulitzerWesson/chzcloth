// BetSubmission.jsx — Consolidated single-screen bet form

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// ─── Constants ────────────────────────────────────────────────────────────────

const EFFORT_OPTIONS = [
  { value: '1-sprint',       label: '1 sprint' },
  { value: '2-3-sprints',    label: '2–3 sprints' },
  { value: '4-6-sprints',    label: '4–6 sprints' },
  { value: '6-plus-sprints', label: '6+ sprints' },
];

const ALIGNMENT_OPTIONS = [
  { value: 'inner',        label: 'Inner Ring',   desc: 'Core product, critical path' },
  { value: 'outer',        label: 'Outer Ring',   desc: 'Nice to have, quality of life' },
  { value: 'experimental', label: 'Experimental', desc: 'Test, learn, might not ship' },
];

const TIMEFRAME_OPTIONS = [
  { value: '30',  label: '30 days' },
  { value: '60',  label: '60 days' },
  { value: '90',  label: '90 days' },
  { value: '120', label: '120 days' },
  { value: '180', label: '6 months' },
];

const EXAMPLE_NARRATIVE = `Add 5 video testimonials from enterprise customers to our pricing page.

Currently, our pricing page converts at 8% (45 signups/week measured in Stripe). We expect this to grow to 12% conversion (68 signups/week) — a 50% increase.

This will work because prospects bounce due to lack of trust. Exit surveys show "need social proof" as the #2 reason for not signing up (127 responses in Q4 2024). Real customer stories with specific outcomes will reduce skepticism and increase trial signups.

Evidence: We tested 3 manual video testimonials with 200 visitors for 2 weeks and saw conversion increase from 8% to 11.5%.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inferMetricDomain = (text) => {
  if (!text) return 'growth';
  const t = text.toLowerCase();
  if (t.includes('revenue') || t.includes('monetiz')) return 'monetization';
  if (t.includes('retention') || t.includes('churn')) return 'retention';
  if (t.includes('conversion') || t.includes('signup')) return 'growth';
  if (t.includes('engagement') || t.includes('active')) return 'retention';
  return 'growth';
};

const inferMetric = (text) => {
  if (!text) return 'Custom metric';
  const t = text.toLowerCase();
  if (t.includes('conversion')) return 'Conversion rate';
  if (t.includes('retention')) return 'Retention rate';
  if (t.includes('revenue') || t.includes('mrr')) return 'Revenue/MRR';
  if (t.includes('signup')) return 'Signups';
  if (t.includes('churn')) return 'Churn rate';
  return 'Custom metric';
};

const parseEffort = (effortText) => {
  if (!effortText) return '2-3-sprints';
  const t = effortText.toLowerCase();
  if (t.includes('1 sprint') || t.includes('2 week')) return '1-sprint';
  if (t.includes('2-3') || t.includes('4-6 week')) return '2-3-sprints';
  if (t.includes('4-6') || t.includes('8-12 week')) return '4-6-sprints';
  if (t.includes('6+') || t.includes('12+ week')) return '6-plus-sprints';
  return '2-3-sprints';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, optional }) {
  return (
    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
      {children}
      {optional && <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem' }}>optional</span>}
    </div>
  );
}

function AlignmentIcon({ type, active }) {
  const color = active ? '#2dd4bf' : '#475569';
  if (type === 'inner') return (
    <svg width="16" height="16" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="14" cy="14" r="6" fill={color}/>
    </svg>
  );
  if (type === 'outer') return (
    <svg width="16" height="16" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="3" fill="none"/>
      <circle cx="14" cy="14" r="6" fill="#0d1929"/>
    </svg>
  );
  return (
    <svg width="14" height="16" viewBox="0 0 24 28" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 2L8 10L4 22C3.5 24 4.5 26 7 26L17 26C19.5 26 20.5 24 20 22L16 10L16 2" stroke={color} strokeWidth="2" fill="none"/>
      <line x1="8" y1="2" x2="16" y2="2" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BetSubmission({ onComplete, currentOrg }) {
  const { user } = useAuth();

  // Goals
  const [companyGoals, setCompanyGoals]         = useState([]);
  const [selectedGoalType, setSelectedGoalType] = useState('');
  const [selectedGoalId, setSelectedGoalId]     = useState(null);
  const [selectedKPI, setSelectedKPI]           = useState(null);
  const [goalContext, setGoalContext]            = useState('');

  // Narrative
  const [narrative, setNarrative]       = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError]   = useState(null);
  const [showExample, setShowExample]   = useState(false);

  // Validation
  const [validationMethod, setValidationMethod]       = useState('');
  const [validationTimeframe, setValidationTimeframe] = useState('90');

  // Params
  const [confidence, setConfidence]               = useState(70);
  const [strategicAlignment, setStrategicAlignment] = useState('inner');
  const [estimatedEffort, setEstimatedEffort]     = useState('2-3-sprints');

  // State machine
  const [submitState, setSubmitState] = useState('idle'); // idle | analyzing | reviewed | scoring
  const [aiReview, setAiReview]       = useState(null);
  const reviewRef = useRef(null);

  const hasLeadershipGoal = !!currentOrg?.leadershipGoal;
  const leadershipGoal    = currentOrg?.leadershipGoal || null;

  useEffect(() => {
    if (!currentOrg?.orgId || !user) return;
    supabase
      .from('company_goals')
      .select('*')
      .eq('org_id', currentOrg.orgId)
      .order('priority', { ascending: true })
      .then(({ data }) => setCompanyGoals(data || []));
  }, [currentOrg?.orgId, user]);

  const handleGoalSelection = (value) => {
    setSelectedGoalType(value);
    setSelectedKPI(null);
    if (value === 'unaligned' || !value) {
      setSelectedGoalId(null);
      setGoalContext('');
    } else {
      const idx = parseInt(value.split('-')[1]);
      const goal = companyGoals[idx];
      if (goal) {
        setGoalContext(goal.title);
        setSelectedGoalId(goal.id);
      }
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    if (!allowed.includes(file.type))  { setUploadError('Please upload a PDF, Word, or text file'); return; }
    if (file.size > 32 * 1024 * 1024) { setUploadError('File size must be under 32MB'); return; }
    try {
      const base64Data = await fileToBase64(file);
      setUploadedFile({ name: file.name, type: file.type, data: base64Data });
      setUploadError(null);
    } catch { setUploadError('Failed to read file. Please try again.'); }
  };

  const getConfidenceLabel = () => {
    if (confidence >= 80) return 'Very Confident';
    if (confidence >= 60) return 'Confident';
    if (confidence >= 40) return 'Somewhat Confident';
    return 'Low Confidence';
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const canSubmitForReview = () => {
    if (!hasLeadershipGoal) {
      if (companyGoals.length > 0 && !selectedGoalType) return false;
      if (companyGoals.length === 0 && !goalContext.trim()) return false;
    }
    if (!uploadedFile && narrative.length < 100) return false;
    if (!validationMethod || validationMethod.length < 5) return false;
    return true;
  };

  const weakIssues = aiReview?.issues?.filter(i => i.severity === 'weak') || [];
  const canScore   = aiReview?.readyToScore === true;

  // ── CTA ───────────────────────────────────────────────────────────────────

  const ctaLabel = () => {
    if (submitState === 'analyzing') return 'Analyzing...';
    if (submitState === 'scoring')   return 'Scoring...';
    if (submitState === 'reviewed') {
      if (canScore) return 'Score Bet →';
      return 'Re-submit for Review';
    }
    return 'Submit for Review';
  };

  const ctaDisabled = () => {
    if (submitState === 'analyzing' || submitState === 'scoring') return true;
    if (submitState === 'reviewed' && canScore) return false;
    if (submitState === 'reviewed' && !canScore) return !canSubmitForReview();
    return !canSubmitForReview();
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCTA = async () => {
    if (submitState === 'reviewed' && canScore) {
      await handleScore();
    } else {
      await handleReview();
    }
  };

  const handleReview = async () => {
    setSubmitState('analyzing');
    setAiReview(null);
    try {
      const effectiveGoal = hasLeadershipGoal ? leadershipGoal : goalContext;
      const response = await fetch('/api/parse-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative, goalContext: effectiveGoal, uploadedFile })
      });
      const review = await response.json();
      if (!response.ok) throw new Error(review.error || 'Analysis failed');
      setAiReview(review);
      setSubmitState('reviewed');
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      if (review.extracted?.effort) setEstimatedEffort(parseEffort(review.extracted.effort));
    } catch {
      setAiReview({
        extracted: {},
        goalAlignment: { aligned: false, reasoning: 'Could not analyze. Please try again.' },
        issues: [{ field: 'analysis', severity: 'missing', message: 'AI analysis failed. Check your narrative and retry.' }],
        strengths: [],
        readyToScore: false
      });
      setSubmitState('reviewed');
    }
  };

  const handleScore = async () => {
    setSubmitState('scoring');
    const extracted = aiReview?.extracted || {};
    const effectiveGoal = hasLeadershipGoal ? leadershipGoal : goalContext;

    const betData = {
      hypothesis: extracted.change
        ? `If we ${extracted.change}, then ${extracted.baseline || 'the metric'} will improve to ${extracted.magnitude || 'target'}, because ${extracted.mechanism || 'of expected impact'}`
        : narrative.substring(0, 200),
      metricDomain:     inferMetricDomain(narrative),
      metric:           inferMetric(narrative),
      baseline:         extracted.baseline || '',
      prediction:       extracted.magnitude || '',
      confidence,
      timeframe:        parseInt(validationTimeframe),
      validationMethod,
      assumptions:      extracted.mechanism || '',
      strategicAlignment,
      estimatedEffort,
      isOwnIdea:        true,
      betType:          'improve',
      goalContext:      effectiveGoal,
      goalId:           selectedGoalId,
      selectedKPI,
      goalAlignment:    aiReview.goalAlignment,
      documentProvided: !!uploadedFile,
      documentName:     uploadedFile?.name || null,
      change:           extracted.change || '',
      magnitude:        extracted.magnitude || '',
      mechanism:        extracted.mechanism || '',
      evidenceType:     'tested',
      evidenceDetails:  extracted.evidence || '',
    };
    onComplete(betData);
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    colorScheme: 'dark',
  };

  const cardStyle = {
    padding: '18px 20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
  };

  // ── Goal KPIs ─────────────────────────────────────────────────────────────

  let selectedGoalObj  = null;
  let selectedGoalKPIs = [];
  if (selectedGoalType && selectedGoalType !== 'unaligned') {
    const idx = parseInt(selectedGoalType.split('-')[1]);
    selectedGoalObj  = companyGoals[idx];
    selectedGoalKPIs = selectedGoalObj
      ? (typeof selectedGoalObj.kpis === 'string' ? JSON.parse(selectedGoalObj.kpis) : selectedGoalObj.kpis || [])
      : [];
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px 0' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px 0' }}>Make a Bet</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Describe what you'll build, why it matters, and how you'll validate it
        </p>
      </div>

      {/* ── Row 1: Goal | Strategic Alignment ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Goal */}
        <div style={cardStyle}>
          <SectionLabel>Company Goal</SectionLabel>

          {hasLeadershipGoal ? (
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{leadershipGoal}</div>
          ) : companyGoals.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {companyGoals.map((goal, idx) => {
                  const isSelected = selectedGoalType === `company-${idx}`;
                  const pColors = { 1: '#ef4444', 2: '#fbbf24', 3: '#3b82f6' };
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalSelection(isSelected ? '' : `company-${idx}`)}
                      style={{
                        padding: '12px 14px',
                        background: isSelected ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? 'rgba(45,212,191,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ padding: '2px 7px', background: `${pColors[goal.priority]}22`, border: `1px solid ${pColors[goal.priority]}55`, borderRadius: 4, color: pColors[goal.priority], fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                          P{goal.priority}
                        </span>
                        <span style={{ color: isSelected ? '#f1f5f9' : '#cbd5e1', fontSize: '0.88rem', fontWeight: 500 }}>
                          {goal.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={() => handleGoalSelection(selectedGoalType === 'unaligned' ? '' : 'unaligned')}
                  style={{
                    padding: '10px 14px',
                    background: selectedGoalType === 'unaligned' ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: `1px solid ${selectedGoalType === 'unaligned' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#475569',
                    fontSize: '0.85rem',
                  }}
                >
                  Not aligned to a current goal
                </button>
              </div>

              {/* KPI Selection */}
              {selectedGoalObj && selectedGoalKPIs.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionLabel>Which metric does this bet move?</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedGoalKPIs.map((kpi, kpiIdx) => {
                      const isKpiSelected = selectedKPI?.index === kpiIdx;
                      return (
                        <label key={kpiIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: isKpiSelected ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isKpiSelected ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, cursor: 'pointer' }}>
                          <input type="radio" name="kpi" checked={isKpiSelected} onChange={() => setSelectedKPI({ index: kpiIdx, kpi })} style={{ accentColor: '#2dd4bf', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#f1f5f9', fontSize: '0.88rem', fontWeight: 500 }}>{kpi.metric}</div>
                            {(kpi.baseline || kpi.target) && (
                              <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: 2 }}>
                                {kpi.baseline} <span style={{ color: '#2dd4bf' }}>→</span> {kpi.target}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: selectedKPI?.index === 'indirect' ? 'rgba(255,255,255,0.04)' : 'transparent', border: `1px solid ${selectedKPI?.index === 'indirect' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`, borderRadius: 8, cursor: 'pointer' }}>
                      <input type="radio" name="kpi" checked={selectedKPI?.index === 'indirect'} onChange={() => setSelectedKPI({ index: 'indirect', kpi: null })} style={{ accentColor: '#2dd4bf' }} />
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Indirectly supports this goal</span>
                    </label>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <input type="text" value={goalContext} onChange={e => setGoalContext(e.target.value)} placeholder="e.g., Grow revenue by 30% this year" style={inputStyle} />
              <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: 8 }}>
                AI will check if your bet actually achieves this goal
              </div>
            </>
          )}
        </div>

        {/* Strategic Alignment */}
        <div style={cardStyle}>
          <SectionLabel>Strategic Priority</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALIGNMENT_OPTIONS.map(opt => {
              const active = strategicAlignment === opt.value;
              return (
                <button key={opt.value} onClick={() => setStrategicAlignment(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: active ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${active ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <AlignmentIcon type={opt.value} active={active} />
                  <div>
                    <div style={{ color: active ? '#f1f5f9' : '#94a3b8', fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}>{opt.label}</div>
                    <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: 1 }}>{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Narrative (full width) ─────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionLabel>
            Describe Your Bet
            {uploadedFile && <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> — optional with document</span>}
          </SectionLabel>
          <button onClick={() => setShowExample(!showExample)} style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: '0.78rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
            {showExample ? 'Hide example' : 'Show example'}
          </button>
        </div>

        {showExample && (
          <div style={{ marginBottom: 12, padding: '14px 16px', background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.12)', borderRadius: 10, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            <div style={{ color: '#2dd4bf', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Example</div>
            {EXAMPLE_NARRATIVE}
          </div>
        )}

        <textarea
          value={narrative}
          onChange={e => setNarrative(e.target.value)}
          placeholder={uploadedFile
            ? 'Add any additional context not in the document...'
            : "What you'll change, current state (with numbers), expected outcome (with numbers), why it will work, and evidence..."}
          rows={10}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
        />
        <div style={{ color: '#334155', fontSize: '0.78rem', marginTop: 6 }}>
          {narrative.length} characters
          {!uploadedFile && narrative.length < 100 && ` (minimum 100)`}
        </div>
      </div>

      {/* ── Row 3: Upload (full width) ────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel optional>Upload Document</SectionLabel>
        {!uploadedFile ? (
          <div style={{ position: 'relative' }}>
            <input type="file" id="file-upload" accept=".pdf,.docx,.txt,.md" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} />
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>📄</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Click to upload or drag and drop</div>
              <div style={{ color: '#334155', fontSize: '0.78rem', marginTop: 2 }}>PDF, Word, Text, or Markdown (max 32MB)</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>📄</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{uploadedFile.name}</span>
            </div>
            <button onClick={() => { setUploadedFile(null); setUploadError(null); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Remove</button>
          </div>
        )}
        {uploadError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6 }}>{uploadError}</div>}
      </div>

      {/* ── Row 4: Confidence | Effort ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Confidence */}
        <div style={cardStyle}>
          <SectionLabel>Your Confidence</SectionLabel>
          <input
            type="range" min="0" max="100" step="5" value={confidence}
            onChange={e => setConfidence(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#2dd4bf', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2dd4bf' }}>{confidence}%</span>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{getConfidenceLabel()}</span>
          </div>
        </div>

        {/* Effort */}
        <div style={cardStyle}>
          <SectionLabel>Effort Estimate</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {EFFORT_OPTIONS.map(opt => {
              const active = estimatedEffort === opt.value;
              return (
                <button key={opt.value} onClick={() => setEstimatedEffort(opt.value)} style={{ padding: '10px 8px', background: active ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${active ? 'rgba(45,212,191,0.35)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, color: active ? '#2dd4bf' : '#64748b', fontSize: '0.82rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 5: Validate method | Timeframe ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <SectionLabel>How will you validate this?</SectionLabel>
          <input type="text" value={validationMethod} onChange={e => setValidationMethod(e.target.value)} placeholder="e.g., Check Stripe conversion rate, Measure in PostHog" style={inputStyle} />
        </div>
        <div>
          <SectionLabel>Check after</SectionLabel>
          <select value={validationTimeframe} onChange={e => setValidationTimeframe(e.target.value)} style={selectStyle}>
            {TIMEFRAME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Row 6: AI Review (full width, appears after submit) ───────────── */}
      <div ref={reviewRef}>
        {submitState !== 'idle' && aiReview && (
          <div style={{ marginBottom: 16, padding: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CHZCLOTH Review</div>
              <div style={{
                padding: '3px 10px',
                background: canScore ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${canScore ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 20,
                color: canScore ? '#22c55e' : '#ef4444',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}>
                {canScore ? 'Ready to Score' : 'Needs Revision'}
              </div>
            </div>

            {/* Goal alignment */}
            <div style={{ marginBottom: 14, padding: '12px 14px', background: aiReview.goalAlignment.aligned ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${aiReview.goalAlignment.aligned ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8 }}>
              <div style={{ color: aiReview.goalAlignment.aligned ? '#22c55e' : '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                {aiReview.goalAlignment.aligned ? '✓ Goal Aligned' : '⚠ Goal Misalignment'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{aiReview.goalAlignment.reasoning}</div>
            </div>

            {/* Strengths */}
            {aiReview.strengths?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Strengths</div>
                {aiReview.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span style={{ color: '#22c55e', flexShrink: 0 }}>•</span>{s}
                  </div>
                ))}
              </div>
            )}

            {/* Issues */}
            {aiReview.issues?.length > 0 && (
              <div>
                <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Issues</div>
                {aiReview.issues.map((issue, i) => (
                  <div key={i} style={{ marginBottom: 8, padding: '10px 12px', background: issue.severity === 'missing' ? 'rgba(239,68,68,0.06)' : 'rgba(251,191,36,0.06)', border: `1px solid ${issue.severity === 'missing' ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`, borderRadius: 8 }}>
                    <div style={{ color: issue.severity === 'missing' ? '#ef4444' : '#fbbf24', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>{issue.field}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{issue.message}</div>
                  </div>
                ))}
              </div>
            )}

            {canScore && weakIssues.length > 0 && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, color: '#94a3b8', fontSize: '0.8rem' }}>
                {weakIssues.length} weak signal{weakIssues.length !== 1 ? 's' : ''} noted — scoring will reflect this
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Row 7: CTA (right-aligned) ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCTA}
          disabled={ctaDisabled()}
          style={{
            padding: '13px 28px',
            background: ctaDisabled()
              ? 'rgba(255,255,255,0.08)'
              : canScore && submitState === 'reviewed'
                ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)'
                : 'rgba(45,212,191,0.15)',
            border: ctaDisabled()
              ? '1px solid rgba(255,255,255,0.06)'
              : canScore && submitState === 'reviewed'
                ? 'none'
                : '1px solid rgba(45,212,191,0.3)',
            borderRadius: 10,
            color: ctaDisabled()
              ? '#334155'
              : canScore && submitState === 'reviewed'
                ? '#0a0f1a'
                : '#2dd4bf',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: ctaDisabled() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.01em',
          }}
        >
          {ctaLabel()}
        </button>
      </div>

    </div>
  );
}
