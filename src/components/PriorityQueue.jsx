import React, { useState } from 'react';
import { FilterBar, applyFilters, computeCounts, defaultFilters } from './FilterBar';

const StrategicAlignmentIcon = ({ alignment }) => {
  const normalized = alignment?.toLowerCase();
  if (normalized === 'inner' || normalized === 'inner_ring' || normalized === 'inner ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes growFromDotPQ { 0% { transform: scale(0); opacity: 0; } 22% { transform: scale(1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          .grow-circle-pq { animation: growFromDotPQ 9s ease-out infinite; transform-origin: center; }
        `}</style>
        <circle cx="14" cy="14" r="12" stroke="url(#tgPQ1)" strokeWidth="2.5" fill="none"/>
        <circle className="grow-circle-pq" cx="14" cy="14" r="6" fill="url(#tgPQ1)"/>
        <defs><linearGradient id="tgPQ1" x1="2" y1="2" x2="26" y2="26"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      </svg>
    );
  }
  if (normalized === 'outer' || normalized === 'outer_ring' || normalized === 'outer ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes drawPQ { 0% { stroke-dashoffset: 75.4; } 30% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
          .draw-circle-pq { stroke-dasharray: 75.4; animation: drawPQ 10s linear infinite; }
        `}</style>
        <circle className="draw-circle-pq" cx="14" cy="14" r="12" stroke="url(#tgPQ2)" strokeWidth="3" fill="none"/>
        <circle cx="14" cy="14" r="6" fill="#1e293b"/>
        <defs><linearGradient id="tgPQ2" x1="2" y1="2" x2="26" y2="26"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      </svg>
    );
  }
  if (normalized === 'experimental') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 28" fill="none">
        <style>{`
          @keyframes b1PQ { 0% { cy: 20; opacity: 0; } 20% { opacity: 1; } 100% { cy: 3; opacity: 0; } }
          @keyframes b2PQ { 0% { cy: 20; opacity: 0; } 20% { opacity: 1; } 100% { cy: 3.5; opacity: 0; } }
          @keyframes b3PQ { 0% { cy: 20; opacity: 0; } 20% { opacity: 1; } 100% { cy: 3; opacity: 0; } }
          .b1PQ { animation: b1PQ 2.5s ease-in infinite; }
          .b2PQ { animation: b2PQ 2.5s ease-in infinite 0.8s; }
          .b3PQ { animation: b3PQ 2.5s ease-in infinite 1.6s; }
        `}</style>
        <path d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" stroke="url(#bkPQ)" strokeWidth="2" fill="none"/>
        <line x1="8" y1="2" x2="16" y2="2" stroke="url(#bkPQ)" strokeWidth="2"/>
        <circle className="b1PQ" cx="9" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
        <circle className="b2PQ" cx="12" cy="20" r="1.8" fill="#22d3ee" opacity="0"/>
        <circle className="b3PQ" cx="15" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
        <defs><linearGradient id="bkPQ" x1="4" y1="2" x2="20" y2="26"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      </svg>
    );
  }
  return null;
};

const LEVER_COLORS = {
  Revenue:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e' },
  Retention:   { bg: 'rgba(45,212,191,0.15)',  border: 'rgba(45,212,191,0.3)',  text: '#2dd4bf' },
  Acquisition: { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Efficiency:  { bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.3)', text: '#7dd3fc' },
  Platform:    { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
  Experience:  { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)',  text: '#f97316' },
  Risk:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
};

const OUTCOME_COLORS = {
  succeeded:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e', label: 'Succeeded' },
  partial:       { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24', label: 'Partial Win' },
  failed:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444', label: 'Failed' },
  inconclusive:  { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8', label: 'Inconclusive' },
  never_shipped: { bg: 'rgba(71,85,105,0.15)',   border: 'rgba(71,85,105,0.3)',   text: '#64748b', label: 'Never Shipped' },
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Shipped', 'Awaiting Outcome', 'Outcome Recorded'];

const OUTCOME_OPTIONS = [
  { value: 'succeeded',     label: 'Succeeded' },
  { value: 'partial',       label: 'Partial Win' },
  { value: 'failed',        label: 'Failed' },
  { value: 'inconclusive',  label: 'Inconclusive' },
  { value: 'never_shipped', label: 'Never Shipped' },
];

const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function OutcomeForm({ bet, onSubmit, onCancel }) {
  const [outcome, setOutcome] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [learned, setLearned] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) return;
    setSaving(true);
    await onSubmit(bet.id, { status: outcome, actualResult, learned });
    setSaving(false);
  };

  return (
    <div style={{ marginTop: 16, padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}
      onClick={e => e.stopPropagation()}>
      <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
        Record Outcome
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {OUTCOME_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setOutcome(opt.value)}
            style={{ padding: '7px 14px', background: outcome === opt.value ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${outcome === opt.value ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: outcome === opt.value ? '#2dd4bf' : '#64748b', fontSize: '0.82rem', fontWeight: outcome === opt.value ? 600 : 400, cursor: 'pointer' }}>
            {opt.label}
          </button>
        ))}
      </div>
      <textarea value={actualResult} onChange={e => setActualResult(e.target.value)} placeholder="What actually happened? Include numbers if you have them." rows={3}
        style={{ width: '100%', marginBottom: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.5 }} />
      <textarea value={learned} onChange={e => setLearned(e.target.value)} placeholder="What did you learn? What would you do differently?" rows={3}
        style={{ width: '100%', marginBottom: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.5 }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={!outcome || saving}
          style={{ padding: '8px 16px', background: outcome ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${outcome ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: outcome ? '#2dd4bf' : '#334155', fontSize: '0.85rem', fontWeight: 600, cursor: outcome ? 'pointer' : 'not-allowed' }}>
          {saving ? 'Saving...' : 'Save Outcome'}
        </button>
      </div>
    </div>
  );
}

const getStatusKey = (bet) => {
  const outcomeKey = bet.status || bet.outcome;
  const hasOutcome = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(outcomeKey);
  if (hasOutcome) return 'Outcome Recorded';
  if (bet.completedAt) return 'Awaiting Outcome';
  if (bet.startedAt) return 'In Progress';
  return 'Not Started';
};

// ─── Priority Score Algorithm ─────────────────────────────────────────────────
//
// Composite of RICE + strategic fit, normalized to 0–100.
//
// RICE components (all inputs already captured on the bet):
//   Reach  — inferred from lever type (how broadly does this move the needle?)
//   Impact — potentialScore (0–100, from AI scoring)
//   Confidence — confidence field (0–100, self-reported)
//   Effort — estimatedEffort mapped to a divisor (lower effort = higher score)
//
// Fit multiplier — fitScore boosts or dampens the RICE result.
// Strategic alignment bonus — inner ring bets get a boost, experimental get slight dampening.
//
// Active (in-progress) bets float to top regardless of score.
// Completed bets sink to bottom.

const REACH_BY_LEVER = {
  Revenue:     90,
  Acquisition: 85,
  Retention:   80,
  Efficiency:  65,
  Platform:    70,
  Experience:  60,
  Risk:        55,
};

const EFFORT_DIVISOR = {
  'S':  1,
  'M':  2,
  'L':  3.5,
  'XL': 5,
};

const ALIGNMENT_BONUS = {
  inner:        1.15,  // core bets get a 15% boost
  outer:        1.0,
  experimental: 0.9,   // experimental bets slightly dampened — they're tests, not priorities
};

function computePriorityScore(bet) {
  const reach      = REACH_BY_LEVER[bet.lever] ?? 65;
  const impact     = bet.potentialScore ?? 50;
  const confidence = bet.confidence ?? 50;
  const effortKey  = bet.estimatedEffort ?? '2-3-sprints';
  const effort     = EFFORT_DIVISOR[effortKey] ?? 2;
  const fit        = bet.fitScore ?? 50;
  const alignment  = bet.strategicAlignment?.toLowerCase() ?? 'inner';

  // RICE: (Reach × Impact × Confidence/100) / Effort
  const rice = (reach * impact * (confidence / 100)) / effort;

  // Normalize RICE to roughly 0–100 range (max theoretical: 90×100×1/1 = 9000)
  const riceNormalized = Math.min(rice / 90, 100);

  // Blend RICE (60%) with fit score (40%)
  const blended = (riceNormalized * 0.6) + (fit * 0.4);

  // Apply strategic alignment multiplier
  const alignmentMultiplier = ALIGNMENT_BONUS[alignment] ?? 1.0;

  return Math.round(blended * alignmentMultiplier);
}

// ─────────────────────────────────────────────────────────────────────────────

function PriorityQueue({ bets, setExpandedPriorityBet, expandedPriorityBet, currentUserId, onMarkStarted, onMarkShipped, onRecordOutcome }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [recordingOutcomeId, setRecordingOutcomeId] = useState(null);

  const queueBets = bets?.filter(b => b.approvalStatus === 'approved') || [];

  const counts = computeCounts(queueBets, getStatusKey);
  const filteredBets = applyFilters(queueBets, filters, getStatusKey);

  const sortedBets = [...filteredBets].sort((a, b) => {
    const aOutcome = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(a.status || a.outcome);
    const bOutcome = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(b.status || b.outcome);

    // Completed with outcomes sink to bottom
    if (aOutcome && !bOutcome) return 1;
    if (!aOutcome && bOutcome) return -1;

    // Awaiting outcome above completed-with-outcome, below active
    const aAwaiting = !!a.completedAt && !aOutcome;
    const bAwaiting = !!b.completedAt && !bOutcome;
    if (aAwaiting && !bAwaiting) return 1;
    if (!aAwaiting && bAwaiting) return -1;

    // In progress floats to top
    const aInProgress = !!a.startedAt && !a.completedAt;
    const bInProgress = !!b.startedAt && !b.completedAt;
    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;

    // Everything else sorted by priority score
    return computePriorityScore(b) - computePriorityScore(a);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Priority Queue</h1>
          {queueBets.length > 0 && (
            <span style={{ color: '#475569', fontSize: '0.95rem' }}>{queueBets.length} bet{queueBets.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Ready to execute bets, ranked by priority score — impact and confidence weighted against effort and strategic fit.
            </p>
            {!summaryExpanded && (
              <button onClick={() => setSummaryExpanded(true)} style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: '0.8rem', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', textDecoration: 'underline' }}>
                How it works
              </button>
            )}
          </div>
          {summaryExpanded && (
            <div style={{ marginTop: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                The Priority Queue holds all approved bets, automatically ranked by a composite priority score. The score blends RICE (Reach, Impact, Confidence, Effort) with strategic fit — so a high-impact bet that aligns with a P1 goal outranks a similar bet that doesn't. Inner ring bets get a boost; experimental bets are slightly dampened since they're tests, not commitments.
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                In-progress bets always surface first. Bets awaiting an outcome or with recorded outcomes sink to the bottom. Everything in between is ordered by priority score.
              </p>
              <p style={{ margin: 0 }}>
                Status updates — marking a bet started, shipped, or recording an outcome — are done from Your Queue.
              </p>
              <button onClick={() => setSummaryExpanded(false)} style={{ marginTop: 10, background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Show less
              </button>
            </div>
          )}
        </div>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          showStatus={true}
          statusOptions={STATUS_OPTIONS}
          counts={counts}
        />
      </div>

      {queueBets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          No approved bets yet. Approve bets from the Marketplace to add them here.
        </div>
      ) : filteredBets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          No bets match the current filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedBets.map(bet => {
            const isExpanded = expandedPriorityBet === bet.id;
            const isAIEnhanced = bet.aiEnhanced;
            const aiScore = bet.aiPredictedScore;
            const lever = bet.lever;
            const isStarted = !!bet.startedAt;
            const isCompleted = !!bet.completedAt;
            const outcomeKey = bet.status || bet.outcome;
            const hasOutcome = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(outcomeKey);
            const lc = lever && LEVER_COLORS[lever] ? LEVER_COLORS[lever] : { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94a3b8' };
            const oc = hasOutcome ? OUTCOME_COLORS[outcomeKey] : null;
            const priorityScore = computePriorityScore(bet);

            const isOwn = bet.userId === currentUserId;
            const isRecordingOutcome = recordingOutcomeId === bet.id;

            return (
              <div
                key={bet.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: 20, display: 'flex', gap: 16,
                  opacity: isCompleted ? 0.75 : 1
                }}
              >
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <StrategicAlignmentIcon alignment={bet.strategicAlignment} />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Title + Scores */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, paddingRight: 16 }}>
                      {bet.product && (
                        <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                          {bet.product}
                        </div>
                      )}
                      <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                        {bet.title || bet.hypothesis}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: 0, flexShrink: 0, alignItems: 'center' }}>
                      {/* Priority score */}
                      <div style={{ textAlign: 'center', paddingRight: 12, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#475569', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>{priorityScore}</div>
                      </div>

                      {bet.approachScore && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingLeft: 12 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>APR</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2dd4bf' }}>{bet.approachScore}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>POT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fbbf24' }}>{bet.potentialScore}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>FIT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#7dd3fc' }}>{bet.fitScore}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {bet.summary && (
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 12 }}>
                      {bet.summary}
                    </div>
                  )}

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#64748b', marginBottom: 16, flexWrap: 'wrap' }}>
                    {lever && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 6, color: lc.text, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {lever}
                      </span>
                    )}
                    {isStarted && !isCompleted && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>In Progress</span>
                    )}
                    {!isStarted && !isCompleted && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Not Started</span>
                    )}
                    {isCompleted && !hasOutcome && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 6, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Awaiting Outcome</span>
                    )}
                    {hasOutcome && oc && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: oc.bg, border: `1px solid ${oc.border}`, borderRadius: 6, color: oc.text, fontSize: '0.75rem', fontWeight: 600 }}>{oc.label}</span>
                    )}
                    <span>•</span>
                    <span>by {bet.submittedByEmail || 'unknown'}</span>
                    {bet.sponsoredByEmail && <><span>•</span><span>approved by {bet.sponsoredByEmail}</span></>}
                    {isStarted && !isCompleted && <><span>•</span><span>Started {fmt(bet.startedAt)}</span></>}
                    {isCompleted && <><span>•</span><span>Shipped {fmt(bet.completedAt)}</span></>}
                  </div>

                  {hasOutcome && bet.actualResult && (
                    <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, borderLeft: `3px solid ${oc?.text || '#64748b'}` }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>Result</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{bet.actualResult}</div>
                    </div>
                  )}

                  {/* Action buttons — visible to submitter */}
                  {isOwn && !hasOutcome && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {!isStarted && !isCompleted && (
                        <button onClick={() => onMarkStarted(bet.id)}
                          style={{ padding: '7px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                          Mark Started
                        </button>
                      )}
                      {isStarted && !isCompleted && (
                        <button onClick={() => onMarkShipped(bet.id)}
                          style={{ padding: '7px 16px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 8, color: '#2dd4bf', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                          Mark Shipped
                        </button>
                      )}
                      {isCompleted && (
                        <button onClick={() => setRecordingOutcomeId(isRecordingOutcome ? null : bet.id)}
                          style={{ padding: '7px 16px', background: isRecordingOutcome ? 'rgba(255,255,255,0.05)' : 'rgba(167,139,250,0.08)', border: `1px solid ${isRecordingOutcome ? 'rgba(255,255,255,0.1)' : 'rgba(167,139,250,0.25)'}`, borderRadius: 8, color: isRecordingOutcome ? '#64748b' : '#a78bfa', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                          {isRecordingOutcome ? 'Cancel' : 'Record Outcome'}
                        </button>
                      )}
                    </div>
                  )}

                  {isRecordingOutcome && (
                    <OutcomeForm
                      bet={bet}
                      onSubmit={async (id, data) => { await onRecordOutcome(id, data); setRecordingOutcomeId(null); }}
                      onCancel={() => setRecordingOutcomeId(null)}
                    />
                  )}

                  {bet.scoringRationale && (
                    <button
                      onClick={() => setExpandedPriorityBet(isExpanded ? null : bet.id)}
                      style={{ background: 'transparent', border: 'none', color: '#2dd4bf', fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ fontSize: '0.7rem' }}>{isExpanded ? '▼' : '▶'}</span>
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>
                  )}

                  {isExpanded && bet.scoringRationale && (
                    <div style={{ marginTop: 12, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6 }}>
                      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BET DETAILS</div>
                        {bet.hypothesis && (
                          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#64748b', marginBottom: 6, fontSize: '0.85rem' }}>Full Hypothesis:</div>
                            <div style={{ color: '#f1f5f9', lineHeight: 1.6, fontSize: '0.95rem' }}>{bet.hypothesis}</div>
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div><span style={{ color: '#64748b' }}>Metric: </span><span style={{ color: '#2dd4bf' }}>{bet.metric}</span></div>
                          <div><span style={{ color: '#64748b' }}>Prediction: </span><span style={{ color: '#94a3b8' }}>{bet.prediction}</span></div>
                          {bet.baseline && <div><span style={{ color: '#64748b' }}>Baseline: </span><span style={{ color: '#94a3b8' }}>{bet.baseline}</span></div>}
                          {bet.timeframe && <div><span style={{ color: '#64748b' }}>Timeframe: </span><span style={{ color: '#94a3b8' }}>{bet.timeframe} days</span></div>}
                          {bet.confidence && <div><span style={{ color: '#64748b' }}>Confidence: </span><span style={{ color: '#fbbf24' }}>{bet.confidence}%</span></div>}
                          {bet.strategicAlignment && (
                            <div>
                              <span style={{ color: '#64748b' }}>Strategic Alignment: </span>
                              <span style={{ color: '#94a3b8' }}>
                                {bet.strategicAlignment === 'inner' ? 'Inner Ring' : bet.strategicAlignment === 'outer' ? 'Outer Ring' : 'Experimental'}
                              </span>
                            </div>
                          )}
                          {bet.estimatedEffort && <div><span style={{ color: '#64748b' }}>Effort: </span><span style={{ color: '#94a3b8' }}>{bet.estimatedEffort}</span></div>}
                          <div><span style={{ color: '#64748b' }}>Priority Score: </span><span style={{ color: '#f1f5f9', fontWeight: 600 }}>{priorityScore}</span></div>
                        </div>
                        {bet.assumptions && (
                          <div>
                            <div style={{ color: '#64748b', marginBottom: 4 }}>Assumptions:</div>
                            <div style={{ color: '#94a3b8' }}>{bet.assumptions}</div>
                          </div>
                        )}
                        {hasOutcome && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {bet.actualResult && <div style={{ marginBottom: 8 }}><span style={{ color: '#64748b' }}>Result: </span><span style={{ color: '#94a3b8' }}>{bet.actualResult}</span></div>}
                            {bet.learned && <div><span style={{ color: '#64748b' }}>Learned: </span><span style={{ color: '#94a3b8' }}>{bet.learned}</span></div>}
                          </div>
                        )}
                      </div>
                      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          CHZCLOTH SCORING RATIONALE
                        </div>
                        <div style={{ marginBottom: 8 }}><span style={{ color: '#2dd4bf', fontWeight: 600 }}>Approach:</span><span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.approach?.rationale}</span></div>
                        <div style={{ marginBottom: 8 }}><span style={{ color: '#fbbf24', fontWeight: 600 }}>Potential:</span><span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.potential?.rationale}</span></div>
                        <div><span style={{ color: '#7dd3fc', fontWeight: 600 }}>Fit:</span><span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.fit?.rationale}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PriorityQueue;
