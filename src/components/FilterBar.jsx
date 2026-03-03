// FilterBar.jsx
import React from 'react';

const LEVER_COLORS = {
  Revenue:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e' },
  Retention:   { bg: 'rgba(45,212,191,0.15)',  border: 'rgba(45,212,191,0.3)',  text: '#2dd4bf' },
  Acquisition: { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Efficiency:  { bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.3)', text: '#7dd3fc' },
  Platform:    { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
  Experience:  { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)',  text: '#f97316' },
  Risk:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
};

const LEVERS = ['Revenue', 'Retention', 'Acquisition', 'Efficiency', 'Platform', 'Experience', 'Risk'];
const ALIGNMENTS = ['inner', 'outer', 'experimental'];
const ALIGNMENT_LABELS = { inner: 'Inner Ring', outer: 'Outer Ring', experimental: 'Experimental' };

const AlignmentIcon = ({ alignment }) => {
  const n = alignment?.toLowerCase();
  if (n === 'inner') return (
    <svg width="14" height="14" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="12" stroke="#2dd4bf" strokeWidth="2.5" fill="none"/>
      <circle cx="14" cy="14" r="6" fill="#2dd4bf"/>
    </svg>
  );
  if (n === 'outer') return (
    <svg width="14" height="14" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="12" stroke="#2dd4bf" strokeWidth="3" fill="none"/>
      <circle cx="14" cy="14" r="6" fill="#1e293b"/>
    </svg>
  );
  if (n === 'experimental') return (
    <svg width="12" height="14" viewBox="0 0 24 28" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" stroke="#2dd4bf" strokeWidth="2" fill="none"/>
      <line x1="8" y1="2" x2="16" y2="2" stroke="#2dd4bf" strokeWidth="2"/>
    </svg>
  );
  return null;
};

function Pill({ label, active, onClick, color, bg, border }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 20,
        border: active ? `1px solid ${border || 'rgba(45,212,191,0.5)'}` : '1px solid rgba(255,255,255,0.1)',
        background: active ? (bg || 'rgba(45,212,191,0.1)') : 'rgba(255,255,255,0.03)',
        color: active ? (color || '#2dd4bf') : '#64748b',
        fontSize: '0.78rem',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange, showStatus = true, showLever = true, showAlignment = true, showScore = true, statusOptions = [] }) {
  const hasActiveFilters =
    filters.levers.length > 0 ||
    filters.statuses.length > 0 ||
    filters.alignments.length > 0 ||
    filters.minScore > 0;

  const toggle = (key, value) => {
    const current = filters[key];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const clearAll = () => onChange({ levers: [], statuses: [], alignments: [], minScore: 0 });

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Lever */}
        {showLever && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, minWidth: 64 }}>Lever</span>
            {LEVERS.map(lever => {
              const lc = LEVER_COLORS[lever];
              return (
                <Pill
                  key={lever}
                  label={lever}
                  active={filters.levers.includes(lever)}
                  onClick={() => toggle('levers', lever)}
                  color={lc.text}
                  bg={lc.bg}
                  border={lc.border}
                />
              );
            })}
          </div>
        )}

        {/* Strategic Alignment */}
        {showAlignment && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, minWidth: 64 }}>Alignment</span>
            {ALIGNMENTS.map(a => (
              <Pill
                key={a}
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlignmentIcon alignment={a} />
                    {ALIGNMENT_LABELS[a]}
                  </span>
                }
                active={filters.alignments.includes(a)}
                onClick={() => toggle('alignments', a)}
              />
            ))}
          </div>
        )}

        {/* Status */}
        {showStatus && statusOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, minWidth: 64 }}>Status</span>
            {statusOptions.map(s => (
              <Pill
                key={s}
                label={s}
                active={filters.statuses.includes(s)}
                onClick={() => toggle('statuses', s)}
              />
            ))}
          </div>
        )}

        {/* Min Score */}
        {showScore && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, minWidth: 64 }}>Min Score</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 50, 60, 70, 80].map(score => (
                <Pill
                  key={score}
                  label={score === 0 ? 'Any' : `${score}+`}
                  active={filters.minScore === score}
                  onClick={() => onChange({ ...filters, minScore: score })}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          style={{ marginTop: 10, background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function applyFilters(bets, filters, getStatusFn) {
  return bets.filter(bet => {
    if (filters.levers.length > 0) {
      const lever = bet.lever || bet.betData?.lever;
      if (!filters.levers.includes(lever)) return false;
    }
    if (filters.alignments.length > 0) {
      const alignment = bet.strategicAlignment || bet.strategic_alignment || bet.betData?.strategicAlignment;
      if (!filters.alignments.includes(alignment)) return false;
    }
    if (filters.statuses.length > 0 && getStatusFn) {
      const status = getStatusFn(bet);
      if (!filters.statuses.includes(status)) return false;
    }
    if (filters.minScore > 0) {
      const score = bet.aiPredictedScore || bet.ai_predicted_score ||
        (bet.approachScore + bet.potentialScore + bet.fitScore) / 3 || 0;
      if (score < filters.minScore) return false;
    }
    return true;
  });
}

export const defaultFilters = { levers: [], statuses: [], alignments: [], minScore: 0 };
