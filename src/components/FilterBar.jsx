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
const SCORES = [{ label: 'Any', value: 0 }, { label: '60+', value: 60 }, { label: '70+', value: 70 }, { label: '80+', value: 80 }];

// Lever icons — simple SVGs, 14x14
const LeverIcon = ({ lever, color }) => {
  const c = color || '#94a3b8';
  const s = { width: 14, height: 14, flexShrink: 0 };
  switch (lever) {
    case 'Revenue': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <polyline points="1,10 4,6 7,8 10,3 13,1" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <polyline points="10,1 13,1 13,4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
    case 'Retention': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <path d="M7 12 C7 12 2 8.5 2 5.5 C2 3.5 3.5 2 5.5 2 C6.3 2 7 2.5 7 2.5 C7 2.5 7.7 2 8.5 2 C10.5 2 12 3.5 12 5.5 C12 8.5 7 12 7 12Z" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
      </svg>
    );
    case 'Acquisition': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <circle cx="5.5" cy="5.5" r="3.5" stroke={c} strokeWidth="1.6" fill="none"/>
        <line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="11" y1="2" x2="11" y2="6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="9" y1="4" x2="13" y2="4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    );
    case 'Efficiency': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <polygon points="7,1 8.5,5.5 13,5.5 9.5,8.5 11,13 7,10 3,13 4.5,8.5 1,5.5 5.5,5.5" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      </svg>
    );
    case 'Platform': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="8" y="1" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="1" y="8" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="8" y="8" width="5" height="5" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      </svg>
    );
    case 'Experience': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.5" fill="none"/>
        <path d="M4.5 8.5 C5 9.5 6 10 7 10 C8 10 9 9.5 9.5 8.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="5" cy="6" r="0.8" fill={c}/>
        <circle cx="9" cy="6" r="0.8" fill={c}/>
      </svg>
    );
    case 'Risk': return (
      <svg {...s} viewBox="0 0 14 14" fill="none">
        <path d="M7 1 L13 12 L1 12 Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="7" y1="5" x2="7" y2="8.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="10.5" r="0.7" fill={c}/>
      </svg>
    );
    default: return null;
  }
};

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
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
        border: isOpen ? '1px solid rgba(45,212,191,0.5)' : isActive ? '1px solid rgba(45,212,191,0.35)' : '1px solid rgba(255,255,255,0.1)',
        background: isOpen ? 'rgba(45,212,191,0.1)' : isActive ? 'rgba(45,212,191,0.06)' : 'rgba(255,255,255,0.03)',
        color: isActive || isOpen ? '#2dd4bf' : '#64748b',
        fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap',
      }}
    >
      {label}
      {isActive && (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: 'rgba(45,212,191,0.2)', color: '#2dd4bf', fontSize: '0.7rem', fontWeight: 700 }}>
          {count}
        </span>
      )}
      <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
    </button>
  );
}

function Dropdown({ children, onClear, showClear }) {
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', minWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      {children}
      {showClear && (
        <button onClick={onClear} style={{ marginTop: 10, background: 'none', border: 'none', color: '#475569', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
          Clear
        </button>
      )}
    </div>
  );
}

function OptionPill({ label, active, onClick, color, bg, border, icon, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.15s',
        border: active ? `1px solid ${border || 'rgba(45,212,191,0.5)'}` : '1px solid rgba(255,255,255,0.08)',
        background: active ? (bg || 'rgba(45,212,191,0.1)') : 'rgba(255,255,255,0.03)',
        color: active ? (color || '#2dd4bf') : '#64748b',
        fontSize: '0.78rem', fontWeight: active ? 600 : 400,
      }}
    >
      {icon}
      {label}
      {count !== undefined && count !== null && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
          background: active ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.06)',
          color: active ? (color || '#2dd4bf') : '#475569',
          fontSize: '0.68rem', fontWeight: 700,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export function FilterBar({ filters, onChange, showStatus = true, showLever = true, showAlignment = true, showScore = true, statusOptions = [], counts = {} }) {
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
  const hasActive = filters.levers.length > 0 || filters.statuses.length > 0 || filters.alignments.length > 0 || filters.minScore > 0;

  return (
    <div ref={ref} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', position: 'relative', marginBottom: 24 }}>

      {showLever && (
        <div style={{ position: 'relative' }}>
          <FilterPill label="Lever" count={filters.levers.length} isOpen={openPanel === 'lever'} onClick={() => togglePanel('lever')} />
          {openPanel === 'lever' && (
            <Dropdown showClear={filters.levers.length > 0} onClear={() => onChange({ ...filters, levers: [] })}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {LEVERS.map(lever => {
                  const lc = LEVER_COLORS[lever];
                  return (
                    <OptionPill
                      key={lever}
                      label={lever}
                      count={counts.levers?.[lever]}
                      active={filters.levers.includes(lever)}
                      onClick={() => toggle('levers', lever)}
                      color={lc.text} bg={lc.bg} border={lc.border}
                      icon={<LeverIcon lever={lever} color={filters.levers.includes(lever) ? lc.text : '#475569'} />}
                    />
                  );
                })}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {showAlignment && (
        <div style={{ position: 'relative' }}>
          <FilterPill label="Alignment" count={filters.alignments.length} isOpen={openPanel === 'alignment'} onClick={() => togglePanel('alignment')} />
          {openPanel === 'alignment' && (
            <Dropdown showClear={filters.alignments.length > 0} onClear={() => onChange({ ...filters, alignments: [] })}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALIGNMENTS.map(a => (
                  <OptionPill
                    key={a}
                    label={ALIGNMENT_LABELS[a]}
                    count={counts.alignments?.[a]}
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

      {showStatus && statusOptions.length > 0 && (
        <div style={{ position: 'relative' }}>
          <FilterPill label="Status" count={filters.statuses.length} isOpen={openPanel === 'status'} onClick={() => togglePanel('status')} />
          {openPanel === 'status' && (
            <Dropdown showClear={filters.statuses.length > 0} onClear={() => onChange({ ...filters, statuses: [] })}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {statusOptions.map(s => (
                  <OptionPill
                    key={s}
                    label={s}
                    count={counts.statuses?.[s]}
                    active={filters.statuses.includes(s)}
                    onClick={() => toggle('statuses', s)}
                  />
                ))}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {showScore && (
        <div style={{ position: 'relative' }}>
          <FilterPill label="Score" count={filters.minScore > 0 ? 1 : 0} isOpen={openPanel === 'score'} onClick={() => togglePanel('score')} />
          {openPanel === 'score' && (
            <Dropdown showClear={false}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SCORES.map(({ label, value }) => (
                  <OptionPill
                    key={value}
                    label={label}
                    active={filters.minScore === value}
                    onClick={() => { onChange({ ...filters, minScore: value }); setOpenPanel(null); }}
                  />
                ))}
              </div>
            </Dropdown>
          )}
        </div>
      )}

      {hasActive && (
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
      const total = (bet.approachScore || 0) + (bet.potentialScore || 0) + (bet.fitScore || 0);
      const avg = total / 3;
      if (avg < filters.minScore) return false;
    }
    return true;
  });
}

export function computeCounts(bets, getStatusFn) {
  const levers = {}, alignments = {}, statuses = {};
  bets.forEach(bet => {
    const lever = bet.lever || bet.betData?.lever;
    if (lever) levers[lever] = (levers[lever] || 0) + 1;
    const alignment = bet.strategicAlignment || bet.strategic_alignment || bet.betData?.strategicAlignment;
    if (alignment) alignments[alignment] = (alignments[alignment] || 0) + 1;
    if (getStatusFn) {
      const status = getStatusFn(bet);
      if (status) statuses[status] = (statuses[status] || 0) + 1;
    }
  });
  return { levers, alignments, statuses };
}

export const defaultFilters = { levers: [], statuses: [], alignments: [], minScore: 0 };
