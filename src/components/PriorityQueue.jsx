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

const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getStatusKey = (bet, now) => {
  const isCompleted = !!bet.completedAt;
  const isStarted = !!bet.startedAt;
  const outcomeKey = bet.status || bet.outcome;
  const hasOutcome = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(outcomeKey);
  if (hasOutcome) return 'Outcome Recorded';
  if (isCompleted) return 'Awaiting Outcome';
  if (isStarted) return 'In Progress';
  return 'Not Started';
};

function PriorityQueue({ bets, setExpandedPriorityBet, expandedPriorityBet }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const now = new Date();

  const queueBets = bets?.filter(b => b.approvalStatus === 'approved') || [];

  // Normalize for filter/count
  const normalizedBets = queueBets.map(bet => ({
    ...bet,
    strategicAlignment: bet.strategicAlignment,
  }));

  const getStatus = (bet) => getStatusKey(bet, now);
  const counts = computeCounts(normalizedBets, getStatus);
  const filteredBets = applyFilters(normalizedBets, filters, getStatus);

  const sortedBets = [...filteredBets].sort((a, b) => {
    // Completed/outcome recorded sink to bottom
    const aActive = !a.completedAt;
    const bActive = !b.completedAt;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    if (!aActive && !bActive) return new Date(b.completedAt) - new Date(a.completedAt);

    // In progress floats up
    const aInProgress = !!a.startedAt && !a.completedAt;
    const bInProgress = !!b.startedAt && !b.completedAt;
    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;

    // Overdue
    const aDeadline = a.mustShipBy ? new Date(a.mustShipBy) : null;
    const bDeadline = b.mustShipBy ? new Date(b.mustShipBy) : null;
    const aOverdue = aDeadline && aDeadline < now;
    const bOverdue = bDeadline && bDeadline < now;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Due soon
    const aSoon = aDeadline && !aOverdue && (aDeadline - now) < 30 * 24 * 60 * 60 * 1000;
    const bSoon = bDeadline && !bOverdue && (bDeadline - now) < 30 * 24 * 60 * 60 * 1000;
    if (aSoon && !bSoon) return -1;
    if (!aSoon && bSoon) return 1;
    if (aSoon && bSoon) return aDeadline - bDeadline;

    // Score
    const aScore = (a.approachScore || 0) + (a.potentialScore || 0) + (a.fitScore || 0);
    const bScore = (b.approachScore || 0) + (b.potentialScore || 0) + (b.fitScore || 0);
    return bScore - aScore;
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

        {/* Collapsible summary */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Sponsored bets ready to execute. Sorted by urgency and score.
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
                The Priority Queue holds all sponsored bets — work your team has committed to executing. Bets are sorted automatically: overdue and in-progress work surfaces first, followed by bets due soon, then by score.
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                Use the filters to focus on a specific lever, strategic alignment, or status. Once a bet ships, mark it complete and record the outcome — that data feeds into your team's Stats. Status updates — marking a bet started, shipped, or recording an outcome — are done from your Contributors queue.
              </p>
              <p style={{ margin: 0 }}>
                Bets with a red border are overdue. Yellow border means due within 30 days.
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
          No sponsored bets yet. Sponsor bets from the Marketplace to add them here.
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
            const deadline = bet.mustShipBy ? new Date(bet.mustShipBy) : null;
            const isOverdue = deadline && deadline < now && !isCompleted;
            const isSoon = deadline && !isOverdue && !isCompleted && (deadline - now) < 30 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={bet.id}
                style={{
                  background: isOverdue ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
                  border: isOverdue ? '1px solid rgba(239,68,68,0.3)' : isSoon ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.1)',
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
                      {isAIEnhanced && aiScore ? (
                        <div style={{ textAlign: 'center', paddingRight: 8 }}>
                          <div style={{ fontSize: '0.7rem', color: '#2dd4bf', marginBottom: 2, fontWeight: 700, letterSpacing: '0.05em', textShadow: '0 0 10px rgba(45,212,191,0.6)' }}>CHZ</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2dd4bf', textShadow: '0 0 15px rgba(45,212,191,0.8)' }}>{aiScore}</div>
                        </div>
                      ) : null}
                      {bet.approachScore && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingLeft: isAIEnhanced && aiScore ? 8 : 0, borderLeft: isAIEnhanced && aiScore ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
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
                    {isOverdue && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Overdue</span>
                    )}
                    {isSoon && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>Due soon</span>
                    )}
                    <span>•</span>
                    <span>by {bet.submittedByEmail || 'unknown'}</span>
                    <span>•</span>
                    <span>sponsored by {bet.sponsoredByEmail || 'unknown'}</span>
                    {isStarted && !isCompleted && <><span>•</span><span>Started {fmt(bet.startedAt)}</span></>}
                    {isCompleted && <><span>•</span><span>Shipped {fmt(bet.completedAt)}</span></>}
                    {bet.mustShipBy && !isCompleted && (
                      <><span>•</span><span style={{ color: isOverdue ? '#ef4444' : isSoon ? '#fbbf24' : '#64748b' }}>Ship by {fmt(bet.mustShipBy)}</span></>
                    )}
                  </div>

                  {hasOutcome && bet.actualResult && (
                    <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, borderLeft: `3px solid ${oc?.text || '#64748b'}` }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>Result</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{bet.actualResult}</div>
                    </div>
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
                          {bet.mustShipBy && <div><span style={{ color: '#64748b' }}>Must ship by: </span><span style={{ color: isOverdue ? '#ef4444' : '#94a3b8' }}>{fmt(bet.mustShipBy)}</span></div>}
                          {bet.startBy && <div><span style={{ color: '#64748b' }}>Start by: </span><span style={{ color: '#94a3b8' }}>{fmt(bet.startBy)}</span></div>}
                          {bet.strategicAlignment && (
                            <div>
                              <span style={{ color: '#64748b' }}>Strategic Alignment: </span>
                              <span style={{ color: '#94a3b8' }}>
                                {bet.strategicAlignment === 'inner' ? 'Inner Ring' : bet.strategicAlignment === 'outer' ? 'Outer Ring' : bet.strategicAlignment === 'experimental' ? 'Experimental' : bet.strategicAlignment}
                              </span>
                            </div>
                          )}
                          {bet.estimatedEffort && <div><span style={{ color: '#64748b' }}>Estimated Effort: </span><span style={{ color: '#94a3b8' }}>{bet.estimatedEffort}</span></div>}
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
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                          CHZCLOTH SCORING RATIONALE
                          {isAIEnhanced && <span style={{ color: '#2dd4bf', fontWeight: 700 }}>• ENHANCED</span>}
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
