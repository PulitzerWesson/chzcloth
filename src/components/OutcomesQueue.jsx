import React, { useState } from 'react';

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

const OUTCOME_KEYS = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'];

const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function OutcomesQueue({ bets }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const outcomeBets = (bets || [])
    .filter(b => OUTCOME_KEYS.includes(b.status || b.outcome))
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

  const filtered = filter === 'all'
    ? outcomeBets
    : outcomeBets.filter(b => (b.status || b.outcome) === filter);

  // Counts per outcome type
  const counts = OUTCOME_KEYS.reduce((acc, key) => {
    acc[key] = outcomeBets.filter(b => (b.status || b.outcome) === key).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Outcomes</h1>
          {outcomeBets.length > 0 && (
            <span style={{ color: '#475569', fontSize: '0.95rem' }}>
              {outcomeBets.length} bet{outcomeBets.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 20px 0' }}>
          Every bet your team has shipped and measured. The record of what you've learned.
        </p>

        {/* Outcome filter pills */}
        {outcomeBets.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 14px',
                background: filter === 'all' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 20, color: filter === 'all' ? '#f1f5f9' : '#64748b',
                fontSize: '0.82rem', fontWeight: filter === 'all' ? 600 : 400, cursor: 'pointer'
              }}
            >
              All · {outcomeBets.length}
            </button>
            {OUTCOME_KEYS.filter(k => counts[k] > 0).map(key => {
              const oc = OUTCOME_COLORS[key];
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(active ? 'all' : key)}
                  style={{
                    padding: '6px 14px',
                    background: active ? oc.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? oc.border : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 20, color: active ? oc.text : '#64748b',
                    fontSize: '0.82rem', fontWeight: active ? 600 : 400, cursor: 'pointer'
                  }}
                >
                  {oc.label} · {counts[key]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {outcomeBets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ color: '#475569', fontSize: '1rem', marginBottom: 8 }}>No outcomes recorded yet</div>
          <div style={{ color: '#334155', fontSize: '0.875rem', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            Once your team ships bets and records what happened, they'll appear here. This is where learning compounds.
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          No {OUTCOME_COLORS[filter]?.label.toLowerCase()} bets.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(bet => {
            const outcomeKey = bet.status || bet.outcome;
            const oc = OUTCOME_COLORS[outcomeKey];
            const lc = bet.lever && LEVER_COLORS[bet.lever] ? LEVER_COLORS[bet.lever] : null;
            const isExpanded = expanded === bet.id;

            return (
              <div
                key={bet.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${oc.border}`,
                  borderLeft: `3px solid ${oc.text}`,
                  borderRadius: 12, padding: '18px 20px',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    {bet.product && (
                      <div style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        {bet.product}
                      </div>
                    )}
                    <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                      {bet.title || bet.hypothesis}
                    </h3>
                  </div>
                  <span style={{
                    padding: '4px 12px', flexShrink: 0,
                    background: oc.bg, border: `1px solid ${oc.border}`,
                    borderRadius: 20, color: oc.text, fontSize: '0.78rem', fontWeight: 600
                  }}>
                    {oc.label}
                  </span>
                </div>

                {/* Summary */}
                {bet.summary && (
                  <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 10 }}>
                    {bet.summary}
                  </div>
                )}

                {/* Actual result */}
                {bet.actualResult && (
                  <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: 8 }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>What happened</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5 }}>{bet.actualResult}</div>
                  </div>
                )}

                {/* Learned */}
                {bet.learned && (
                  <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)', borderRadius: 8 }}>
                    <div style={{ color: '#2dd4bf', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>What we learned</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>{bet.learned}</div>
                  </div>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: '#475569', flexWrap: 'wrap', marginBottom: bet.scoringRationale ? 10 : 0 }}>
                  {lc && (
                    <span style={{ padding: '3px 8px', background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 5, color: lc.text, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {bet.lever}
                    </span>
                  )}
                  <span>by {bet.submittedByEmail || 'unknown'}</span>
                  {bet.completedAt && <><span>·</span><span>Shipped {fmt(bet.completedAt)}</span></>}
                  {bet.confidence && <><span>·</span><span>{bet.confidence}% confidence</span></>}
                  {bet.approachScore && (
                    <>
                      <span>·</span>
                      <span style={{ color: '#2dd4bf' }}>APR {bet.approachScore}</span>
                      <span style={{ color: '#fbbf24' }}>POT {bet.potentialScore}</span>
                      <span style={{ color: '#7dd3fc' }}>FIT {bet.fitScore}</span>
                    </>
                  )}
                </div>

                {/* Expand scoring rationale */}
                {bet.scoringRationale && (
                  <>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : bet.id)}
                      style={{ background: 'transparent', border: 'none', color: '#334155', fontSize: '0.78rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ fontSize: '0.65rem' }}>{isExpanded ? '▼' : '▶'}</span>
                      {isExpanded ? 'Hide scoring' : 'Show scoring'}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: 12, padding: '14px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6 }}>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Scoring Rationale</div>
                        <div style={{ marginBottom: 8 }}><span style={{ color: '#2dd4bf', fontWeight: 600 }}>Approach:</span><span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.approach?.rationale}</span></div>
                        <div style={{ marginBottom: 8 }}><span style={{ color: '#fbbf24', fontWeight: 600 }}>Potential:</span><span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.potential?.rationale}</span></div>
                        <div><span style={{ color: '#7dd3fc', fontWeight: 600 }}>Fit:</span><span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.fit?.rationale}</span></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OutcomesQueue;
