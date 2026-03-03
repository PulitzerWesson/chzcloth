// FilterBar.jsx
import React, { useState, useRef, useEffect } from 'react';

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
const SCORES = [50, 60, 70, 80];

const AlignmentIcon = ({ alignment }) => {
  const n = alignment?.toLowerCase();
  if (n === 'inner') return (
    <svg width="12" height="12" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="12" stroke="#2dd4bf" strokeWidth="2.5" fill="none"/>
      <circle cx="14" cy="14" r="6" fill="#2dd4bf"/>
    </svg>
  );
  if (n === 'outer') return (
    <svg width="12" height="12" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="12" stroke="#2dd4bf" strokeWidth="3" fill="none"/>
      <circle cx="14" cy="14" r="6" fill="#1e293b"/>
    </svg>
  );
  if (n === 'experimental') return (
    <svg width="10" height="12" viewBox="0 0 24 28" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" stroke="#2dd4bf" strokeWidth="2" fill="none"/>
      <line x1="8" y1="2" x2="16" y2="2" stroke="#2dd4bf" strokeWidth="2"/>
    </svg>
  );
  return null;
};

function FilterPill({ label, count, isOpen, onClick }) {
  const isActive = count > 0;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        border: isOpen
          ? '1px solid rgba(45,212,191,0.5)'
          : isActive
          ? '1px solid rgba(45,212,191,0.35)'
          : '1px solid rgba(255,255,255,0.1)',
        background: isOpen
          ? 'rgba(45,212,191,0.1)'
          : isActive
          ? 'rgba(45,212,191,0.06)'
          : 'rgba(255,255,255,0.03)',
        color: isActive || isOpen ? '#2dd4bf' : '#64748b',
        fontSize: '0.82rem',
        fontWeight: isActive ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {isActive && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(45,212,191,0.2)', color: '#2dd4bf',
          fontSize: '0.7rem', fontWeight: 700
        }}>
          {count}
        </span>
      )}
      <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
    </button>
  );
}

function Dropdown({ children, onClear, showClear }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      zIndex: 100,
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '12px 14px',
      minWidth: 220,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {children}
      {showClear && (
        <button
          onClick={onClear}
          style={{ marginTop: 10, background: 'none', border: 'none', color: '#475569', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

function OptionPill({ label, active, onClick, color, bg, border, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.15s',
        border: active ? `1px solid ${border || 'rgba(45,212,191,0.5)'}` : '1px solid rgba(255,255,255,0.08)',
        background: active ? (bg || 'rgba(45,212,191,0.1)') : 'rgba(255,255,255,0.03)',
        color: active ? (color || '#2dd4bf') : '#64748b',
        fontSize: '0.78rem', fontWeight: active ? 600 : 400,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange, showStatus = true, showLever = true, showAlignment = true, showScore = true, statusOptions = [] }) {
  const [openPanel, setOpenPanel] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenPanel(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (key, value) => {
    const current = filters[key];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const togglePanel = (panel) => setOpenPanel(openPanel === panel ? null : panel);

  return (
    <div ref={ref} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', position: 'relative', marginBottom: 24 }}>

      {/* Lever */}
      {showLever && (
        <div style={{ position: 'relative' }}>
          <FilterPill
            label="Lever"
            count={filters.levers.length}
            isOpen={openPanel === 'lever'}
            onClick={() => togglePanel('lever')}
          />
          {openPanel === 'lever' && (
            <Dropdown showClear={filters.levers.length > 0} onClear={() => onChange({ ...filters, levers: [] })}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {LEVERS.map(lever => {
                  const lc = LEVER_COLORS[lever];
                  return (
                    <OptionPill
                      key={lever}
                      label={lever}
                      active={filters.levers.includes(lever)}
                      onClick={() => toggle('levers', lever)}
                      color={lc.text} bg={lc.bg} border={lc.border}
                    />
                  );
                })}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {/* Alignment */}
      {showAlignment && (
        <div style={{ position: 'relative' }}>
          <FilterPill
            label="Alignment"
            count={filters.alignments.length}
            isOpen={openPanel === 'alignment'}
            onClick={() => togglePanel('alignment')}
          />
          {openPanel === 'alignment' && (
            <Dropdown showClear={filters.alignments.length > 0} onClear={() => onChange({ ...filters, alignments: [] })}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALIGNMENTS.map(a => (
                  <OptionPill
                    key={a}
                    label={ALIGNMENT_LABELS[a]}
                    active={filters.alignments.includes(a)}
                    onClick={() => toggle('alignments', a)}
                    icon={<AlignmentIcon alignment={a} />}
                  />
                ))}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {/* Status */}
      {showStatus && statusOptions.length > 0 && (
        <div style={{ position: 'relative' }}>
          <FilterPill
            label="Status"
            count={filters.statuses.length}
            isOpen={openPanel === 'status'}
            onClick={() => togglePanel('status')}
          />
          {openPanel === 'status' && (
            <Dropdown showClear={filters.statuses.length > 0} onClear={() => onChange({ ...filters, statuses: [] })}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {statusOptions.map(s => (
                  <OptionPill
                    key={s}
                    label={s}
                    active={filters.statuses.includes(s)}
                    onClick={() => toggle('statuses', s)}
                  />
                ))}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {/* Score */}
      {showScore && (
        <div style={{ position: 'relative' }}>
          <FilterPill
            label="Score"
            count={filters.minScore > 0 ? 1 : 0}
            isOpen={openPanel === 'score'}
            onClick={() => togglePanel('score')}
          />
          {openPanel === 'score' && (
            <Dropdown showClear={filters.minScore > 0} onClear={() => onChange({ ...filters, minScore: 0 })}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SCORES.map(score => (
                  <OptionPill
                    key={score}
                    label={`${score}+`}
                    active={filters.minScore === score}
                    onClick={() => onChange({ ...filters, minScore: filters.minScore === score ? 0 : score })}
                  />
                ))}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {/* Global clear */}
      {(filters.levers.length > 0 || filters.statuses.length > 0 || filters.alignments.length > 0 || filters.minScore > 0) && (
        <button
          onClick={() => { onChange({ levers: [], statuses: [], alignments: [], minScore: 0 }); setOpenPanel(null); }}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline' }}
        >
          Clear all
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
        const total = (bet.approachScore || bet.viability_score || 0) +
                      (bet.potentialScore || 0) +
                      (bet.fitScore || bet.relevance_score || 0);
        const avg = total / 3;
        if (avg < filters.minScore) return false;
      }
    return true;
  });
}

export const defaultFilters = { levers: [], statuses: [], alignments: [], minScore: 0 };
