// ScoringScreen.jsx — Animated loading screen shown while bet is being scored

import React, { useState, useEffect } from 'react';

const STAGES = [
  {
    key: 'approach',
    label: 'Reviewing Approach',
    sublabel: 'Problem clarity, causal mechanism, killing assumption',
    color: '#2dd4bf',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="#2dd4bf" strokeWidth="2" fill="none" opacity="0.3"/>
        <circle cx="14" cy="14" r="6" fill="#2dd4bf"/>
      </svg>
    ),
  },
  {
    key: 'potential',
    label: 'Reviewing Potential',
    sublabel: 'Prediction calibration, evidence quality, confidence',
    color: '#fbbf24',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4 L17 11 L24 11 L18.5 15.5 L20.5 22.5 L14 18 L7.5 22.5 L9.5 15.5 L4 11 L11 11 Z" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.3"/>
        <path d="M14 7 L16.5 12 L22 12 L17.5 15.5 L19 21 L14 17.5 L9 21 L10.5 15.5 L6 12 L11.5 12 Z" fill="#fbbf24"/>
      </svg>
    ),
  },
  {
    key: 'fit',
    label: 'Reviewing Fit',
    sublabel: 'Strategic alignment, priority, timing',
    color: '#7dd3fc',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="9" height="9" rx="2" stroke="#7dd3fc" strokeWidth="2" fill="none" opacity="0.3"/>
        <rect x="15" y="4" width="9" height="9" rx="2" fill="#7dd3fc"/>
        <rect x="4" y="15" width="9" height="9" rx="2" fill="#7dd3fc" opacity="0.5"/>
        <rect x="15" y="15" width="9" height="9" rx="2" stroke="#7dd3fc" strokeWidth="2" fill="none" opacity="0.3"/>
      </svg>
    ),
  },
  {
    key: 'scoring',
    label: 'Computing Score',
    sublabel: 'Weighing reach, impact, confidence against effort',
    color: '#a78bfa',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="#a78bfa" strokeWidth="2" fill="none" opacity="0.3"/>
        <path d="M14 8 L14 14 L18 17" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const STAGE_DURATION = 2200; // ms per stage

export default function ScoringScreen({ betTitle }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [dotCount, setDotCount] = useState(1);

  // Advance through stages
  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) return;
    const timer = setTimeout(() => {
      setCompletedStages(prev => [...prev, STAGES[stageIndex].key]);
      setStageIndex(prev => prev + 1);
    }, STAGE_DURATION);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  // Animated dots
  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const currentStage = STAGES[stageIndex];
  const dots = '.'.repeat(dotCount);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Title */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ color: '#334155', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          CHZCLOTH
        </div>
        <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>
          Scoring your bet
        </h1>
        {betTitle && (
          <div style={{ color: '#475569', fontSize: '0.88rem', maxWidth: 400, lineHeight: 1.5 }}>
            {betTitle.length > 80 ? betTitle.substring(0, 80) + '...' : betTitle}
          </div>
        )}
      </div>

      {/* Stage list */}
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
        {STAGES.map((stage, idx) => {
          const isCompleted = completedStages.includes(stage.key);
          const isActive = idx === stageIndex;
          const isPending = idx > stageIndex;

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: isActive
                  ? `rgba(${stage.color === '#2dd4bf' ? '45,212,191' : stage.color === '#fbbf24' ? '251,191,36' : stage.color === '#7dd3fc' ? '125,211,252' : '167,139,250'},0.06)`
                  : isCompleted
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(255,255,255,0.01)',
                border: `1px solid ${isActive
                  ? `rgba(${stage.color === '#2dd4bf' ? '45,212,191' : stage.color === '#fbbf24' ? '251,191,36' : stage.color === '#7dd3fc' ? '125,211,252' : '167,139,250'},0.2)`
                  : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12,
                transition: 'all 0.4s ease',
                opacity: isPending ? 0.35 : 1,
              }}
            >
              {/* Icon / check */}
              <div style={{ flexShrink: 0, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isCompleted ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth="1.5"/>
                    <path d="M7 12 L10.5 15.5 L17 9" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : isActive ? (
                  <div style={{ animation: 'spinPulse 1.2s linear infinite' }}>
                    {stage.icon}
                  </div>
                ) : (
                  <div style={{ opacity: 0.3 }}>{stage.icon}</div>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isCompleted ? '#22c55e' : isActive ? stage.color : '#475569',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  marginBottom: 2,
                  transition: 'color 0.3s',
                }}>
                  {isActive ? `${stage.label}${dots}` : stage.label}
                  {isCompleted && ' ✓'}
                </div>
                <div style={{ color: '#334155', fontSize: '0.78rem', lineHeight: 1.4 }}>
                  {stage.sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{ color: '#334155', fontSize: '0.8rem', textAlign: 'center' }}>
        This usually takes 10–15 seconds
      </div>

      <style>{`
        @keyframes spinPulse {
          0%   { transform: rotate(0deg) scale(1);    opacity: 1; }
          50%  { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
          100% { transform: rotate(360deg) scale(1);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}
