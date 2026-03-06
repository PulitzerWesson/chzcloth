


import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useIdeas } from './hooks/useIdeas';
import { useBets } from './hooks/useBets';
import { useOrganizations } from './hooks/useOrganizations';
import { OrganizationSetup, ContextCheck, shouldShowContextCheck, OrgSwitcher } from './components';
import IdeaSubmission from './components/IdeaSubmission';
import IdeasQueue from './components/IdeasQueue';
import SponsorReview from './components/SponsorReview';
import EntryTypeChooser from './components/EntryTypeChooser';
import SignalSubmission from './components/SignalSubmission';
import SuggestionCard from './components/SuggestionCard';
import { getOrgLearnings } from './utils/orgLearnings';
import { supabase } from './lib/supabase';
import CompanyDashboard from './components/CompanyDashboard';
import { StatsScreen } from './components/StatsScreen';
import PriorityQueue from './components/PriorityQueue';
import { FilterBar, applyFilters, computeCounts, defaultFilters } from './components/FilterBar';
import BetSubmission from './components/BetSubmission';
import OutcomesQueue from './components/OutcomesQueue'


// ============================================
// CHZCLOTH Free - Where Bets Get Smarter
// ============================================

const StrategicAlignmentIcon = ({ alignment }) => {
  const n = alignment?.toLowerCase();

  if (n === 'inner' || n === 'inner_ring' || n === 'inner ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes growFromDot {
            0% { transform: scale(0); opacity: 0; }
            22% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .grow-circle {
            animation: growFromDot 9s ease-out infinite;
            transform-origin: center;
          }
        `}</style>
        <circle cx="14" cy="14" r="12" stroke="url(#tealGradient)" strokeWidth="2.5" fill="none"/>
        <circle className="grow-circle" cx="14" cy="14" r="6" fill="url(#tealGradient)"/>
        <defs>
          <linearGradient id="tealGradient" x1="2" y1="2" x2="26" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (n === 'outer' || n === 'outer_ring' || n === 'outer ring') {
    return (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <style>{`
          @keyframes draw {
            0% { stroke-dashoffset: 75.4; }
            30% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
          .draw-circle {
            stroke-dasharray: 75.4;
            animation: draw 10s linear infinite;
          }
        `}</style>
        <circle className="draw-circle" cx="14" cy="14" r="12" stroke="url(#tealGradient2)" strokeWidth="3" fill="none"/>
        <circle cx="14" cy="14" r="6" fill="#1e293b"/>
        <defs>
          <linearGradient id="tealGradient2" x1="2" y1="2" x2="26" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (n === 'experimental') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 28" fill="none">
        <style>{`
          @keyframes bubble1 {
            0% { cy: 20; opacity: 0; }
            20% { opacity: 1; }
            100% { cy: 3; opacity: 0; }
          }
          @keyframes bubble2 {
            0% { cy: 20; opacity: 0; }
            20% { opacity: 1; }
            100% { cy: 3.5; opacity: 0; }
          }
          @keyframes bubble3 {
            0% { cy: 20; opacity: 0; }
            20% { opacity: 1; }
            100% { cy: 3; opacity: 0; }
          }
          .bubble1 { animation: bubble1 2.5s ease-in infinite; }
          .bubble2 { animation: bubble2 2.5s ease-in infinite 0.8s; }
          .bubble3 { animation: bubble3 2.5s ease-in infinite 1.6s; }
        `}</style>
        <path d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" stroke="url(#beakerGradient)" strokeWidth="2" fill="none"/>
        <line x1="8" y1="2" x2="16" y2="2" stroke="url(#beakerGradient)" strokeWidth="2"/>
        <circle className="bubble1" cx="9" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
        <circle className="bubble2" cx="12" cy="20" r="1.8" fill="#22d3ee" opacity="0"/>
        <circle className="bubble3" cx="15" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
        <defs>
          <linearGradient id="beakerGradient" x1="4" y1="2" x2="20" y2="26">
            <stop offset="0%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return null;
};



function AppHeader({ isLoggedIn, onDashboardClick, onLogoClick, onNewBet, showTeamsBanner = true }) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  return (
    <>

      
      {/* Main header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10, 15, 26, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button
          onClick={onLogoClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>CHZCLOTH</span>
        </button>
        
        <div style={{ display: 'flex', gap: 12 }}>
          {/* New Bet button - always visible when logged in */}
          {isLoggedIn && (
            <button
              onClick={onNewBet}
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#0a0f1a',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>+</span>
              New Bet
            </button>
          )}
          
          <button
            onClick={onDashboardClick}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#94a3b8',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {isLoggedIn ? 'Dashboard' : 'Sign in'}
          </button>
        </div>
      </div>
    </>
  );
}

const METRICS = {
  retention: {
    label: "Retention / Engagement",
    metrics: ["Churn rate", "Retention rate (7/30/90 day)", "DAU/MAU ratio", "Session frequency", "Time in app", "Feature stickiness"],
    examples: [
      { type: "new", text: "If we add a weekly digest email, then 30-day retention will increase from 45% to 52% because users will have a reason to return even when they forget about us." },
      { type: "improve", text: "If we redesign the onboarding checklist to be 5 steps instead of 12, then Day-7 retention will increase from 38% to 45% because fewer users will abandon mid-setup." },
      { type: "test", text: "If we A/B test a 'we miss you' push notification at Day 3, then we'll see whether re-engagement messaging moves 14-day retention before building a full lifecycle campaign." }
    ]
  },
  growth: {
    label: "Growth / Acquisition",
    metrics: ["Signups", "Visitor→signup conversion", "CAC", "Referral rate", "Organic traffic", "Activation rate"],
    examples: [
      { type: "new", text: "If we launch a referral program with $20 credit, then referral-sourced signups will reach 15% of total new users within 90 days because our NPS is high and users will share for the incentive." },
      { type: "improve", text: "If we reduce the signup form from 6 fields to 2, then visitor→signup conversion will increase from 3.2% to 4.5% because friction is the main drop-off point." },
      { type: "test", text: "If we test 'Sign up with Google' for 2 weeks, then we'll know whether social auth meaningfully lifts conversion before committing to full OAuth." }
    ]
  },
  monetization: {
    label: "Monetization",
    metrics: ["Revenue/MRR", "ARPU", "Free→paid conversion", "LTV", "Pricing page conversion", "Expansion revenue"],
    examples: [
      { type: "new", text: "If we add annual billing at 20% discount, then 30% of new subscribers will choose annual within 6 months because the savings are meaningful and we lock in commitment." },
      { type: "improve", text: "If we move the pricing toggle above the fold, then pricing→checkout conversion will increase from 12% to 16% because users currently don't see all options." },
      { type: "test", text: "If we email 500 free users a limited-time 50% discount, then we'll learn price sensitivity before deciding whether to introduce a lower-priced plan." }
    ]
  },
  product: {
    label: "Product / Experience",
    metrics: ["NPS", "CSAT", "Feature adoption", "Task completion rate", "Support tickets", "Time to complete"],
    examples: [
      { type: "new", text: "If we add keyboard shortcuts for power users, then NPS among daily-active users will increase from 42 to 50 because our most engaged users have been requesting this." },
      { type: "improve", text: "If we reduce the export flow from 4 clicks to 1, then support tickets about 'how do I export' will drop by 60% because the current flow is confusing." },
      { type: "test", text: "If we prototype dark mode with 50 beta users, then we'll learn whether it's a real need or vocal minority before building it product-wide." }
    ]
  },
  operations: {
    label: "Operations / Internal",
    metrics: ["Cycle time", "Throughput", "Cost per X", "Time saved", "Error rate", "Manual hours"],
    examples: [
      { type: "new", text: "If we automate invoice generation, then finance will save 15 hours/month and error rate will drop from 8% to <1% because manual entry causes mistakes." },
      { type: "improve", text: "If we add bulk-edit to the admin panel, then CS time on account updates will drop by 40% because they currently do each one individually." },
      { type: "test", text: "If we trial a new ticketing system with one CS rep for 30 days, then we'll know whether migration is worth it before committing the whole team." }
    ]
  },
  platform: {
    label: "Platform / Infrastructure",
    metrics: ["Page load time", "Uptime", "API latency", "Deploy frequency", "Error rate", "Infrastructure cost"],
    examples: [
      { type: "new", text: "If we add a CDN for static assets, then p95 page load will drop from 3.2s to 1.5s because 60% of users are outside our primary region." },
      { type: "improve", text: "If we refactor search to use an index, then latency will drop from 800ms to <200ms because the current query does a full table scan." },
      { type: "test", text: "If we run a load test at 10x traffic, then we'll know our breaking point before Black Friday instead of discovering it in production." }
    ]
  }
};

const ROLES = [
  { value: "pm", label: "Product Manager / Product Owner" },
  { value: "founder", label: "Founder / CEO" },
  { value: "eng", label: "Engineering Lead" },
  { value: "growth", label: "Marketing / Growth" },
  { value: "ops", label: "CS / Operations" },
  { value: "other", label: "Other" }
];

const SENIORITY = [
  { value: "ic", label: "Individual Contributor" },
  { value: "senior", label: "Lead / Senior IC" },
  { value: "manager", label: "Manager / Director" },
  { value: "exec", label: "VP / C-level" }
];

const COMPANY_STAGE = [
  { value: "preseed", label: "Pre-seed / Bootstrapped" },
  { value: "seed", label: "Seed ($1M–$5M raised)" },
  { value: "seriesA", label: "Series A ($5M–$20M)" },
  { value: "seriesB", label: "Series B ($20M–$50M)" },
  { value: "seriesC", label: "Series C+ / Growth" },
  { value: "enterprise", label: "Enterprise / Public" }
];

const TEAM_SIZE = [
  { value: "solo", label: "Solo / 1–2 people" },
  { value: "small", label: "Small team (3–10)" },
  { value: "medium", label: "Medium team (11–30)" },
  { value: "large", label: "Large team (30+)" }
];

const INDUSTRY = [
  { value: "b2bsaas", label: "B2B SaaS" },
  { value: "b2c", label: "B2C / Consumer" },
  { value: "marketplace", label: "Marketplace" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "fintech", label: "Fintech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" }
];

const BET_TYPES = [
  { value: "new", label: "Building something new", desc: "A new feature, capability, or initiative that doesn't exist yet" },
  { value: "improve", label: "Improving something existing", desc: "Making something you already have work better" }
];

const STRATEGIC_ALIGNMENT = [
  { value: 'bullseye', label: 'Bullseye', desc: 'Directly impacts the main thing customers pay for' },
  { value: 'inner', label: 'Inner Ring', desc: 'Supports or enables the core experience' },
  { value: 'outer', label: 'Outer Ring', desc: 'Adjacent feature, nice-to-have' },
  { value: 'edge', label: 'Edge', desc: 'Tangential, exploratory' }
];

const ESTIMATED_EFFORT = [
  { value: '1-sprint', label: '1 sprint or less', desc: '≤2 weeks' },
  { value: '2-3-sprints', label: '2-3 sprints', desc: '1-6 weeks' },
  { value: '4-6-sprints', label: '4-6 sprints', desc: '2-3 months' },
  { value: '6+-sprints', label: '6+ sprints', desc: '3+ months' }
];

const INACTION_IMPACT = [
  { value: 'lose-revenue', label: 'Lose revenue / miss growth', desc: 'Direct hit to top line' },
  { value: 'increase-costs', label: 'Increase costs / inefficiency', desc: 'Burning money or time' },
  { value: 'lose-customers', label: 'Lose customers / churn', desc: 'Users will leave' },
  { value: 'fall-behind', label: 'Fall behind competitors', desc: 'Market position erodes' },
  { value: 'compliance-risk', label: 'Compliance / legal risk', desc: 'Regulatory exposure' },
  { value: 'tech-debt', label: 'Technical debt compounds', desc: 'Future work gets harder' },
  { value: 'nothing', label: 'Nothing significant', desc: 'Life goes on' }
];

const TIMEFRAMES = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" }
];

const MEASUREMENT_TOOLS = [
  { value: "posthog", label: "PostHog" },
  { value: "amplitude", label: "Amplitude" },
  { value: "mixpanel", label: "Mixpanel" },
  { value: "ga", label: "Google Analytics" },
  { value: "internal", label: "Internal dashboard" },
  { value: "revenue", label: "Revenue / billing system" },
  { value: "crm", label: "CRM (Salesforce, HubSpot, etc.)" },
  { value: "other", label: "Other" },
  { value: "unsure", label: "Not sure yet" }
];

// Scoring logic
function calculateScore(bet) {
  let score = { structural: 0, measurement: 0, risk: 0, context: 0, total: 0, breakdown: [] };
  
  // Handle missing bet or hypothesis
  if (!bet || !bet.hypothesis) {
    return score;
  }
  
  // Structural (0-40)
  const hypothesis = bet.hypothesis || '';
  const hasIf = hypothesis.toLowerCase().includes('if ');
  const hasThen = hypothesis.toLowerCase().includes('then ');
  const hasBecause = hypothesis.toLowerCase().includes('because');
  
  if (hasIf && hasThen) {
    score.structural += 15;
    score.breakdown.push({ label: "Hypothesis structure (If/Then)", points: 15 });
  } else if (hasIf || hasThen) {
    score.structural += 8;
    score.breakdown.push({ label: "Partial hypothesis structure", points: 8 });
  }
  
  if (hypothesis.length > 100) {
    score.structural += 10;
    score.breakdown.push({ label: "Specific action described", points: 10 });
  } else if (hypothesis.length > 50) {
    score.structural += 5;
    score.breakdown.push({ label: "Action described", points: 5 });
  }
  
  if (hasBecause && hypothesis.split('because')[1]?.length > 30) {
    score.structural += 15;
    score.breakdown.push({ label: "Mechanism explained (because...)", points: 15 });
  } else if (hasBecause) {
    score.structural += 8;
    score.breakdown.push({ label: "Mechanism mentioned", points: 8 });
  }
  
  // Measurement (0-25)
  if (bet.metric) {
    score.measurement += 10;
    score.breakdown.push({ label: "Metric selected", points: 10 });
  }
  
  if (bet.baseline && bet.baseline.trim()) {
    score.measurement += 5;
    score.breakdown.push({ label: "Baseline provided", points: 5 });
  }
  
  const prediction = bet.prediction || '';
  const hasNumbers = /\d+/.test(prediction);
  const hasPercent = /%/.test(prediction);
  if (hasNumbers && hasPercent && prediction.length > 20) {
    score.measurement += 10;
    score.breakdown.push({ label: "Quantified prediction", points: 10 });
  } else if (hasNumbers) {
    score.measurement += 5;
    score.breakdown.push({ label: "Prediction with numbers", points: 5 });
  }
  
  // Risk awareness (0-20)
  if (bet.assumptions && bet.assumptions.trim().length > 20) {
    score.risk += 10;
    score.breakdown.push({ label: "Assumptions identified", points: 10 });
  }
  
  if (bet.cheapTest && bet.cheapTest.trim().length > 20) {
    score.risk += 10;
    score.breakdown.push({ label: "Cheap test identified", points: 10 });
  }
  
  // Context (0-15)
  if (bet.betType === 'test') {
    score.context += 5;
    score.breakdown.push({ label: "Testing before committing", points: 5 });
  } else if (bet.betType === 'improve') {
    score.context += 3;
    score.breakdown.push({ label: "Improving existing (lower risk)", points: 3 });
  }
  
  const confidence = bet.confidence || 70;
  if (confidence >= 60 && confidence <= 85) {
    score.context += 5;
    score.breakdown.push({ label: "Calibrated confidence level", points: 5 });
  } else if (confidence > 90) {
    score.context += 2;
    score.breakdown.push({ label: "High confidence (watch for overconfidence)", points: 2 });
  }
  
  if (bet.timeframe) {
    score.context += 5;
    score.breakdown.push({ label: "Measurement timeframe set", points: 5 });
  }
  
  score.total = score.structural + score.measurement + score.risk + score.context;
  
  return score;
}

function getScoreLabel(score) {
  if (score >= 80) return { label: "Strong", color: "#22c55e", desc: "Well-structured bet with clear measurement" };
  if (score >= 60) return { label: "Solid", color: "#7dd3fc", desc: "Good foundation, minor gaps" };
  if (score >= 40) return { label: "Developing", color: "#fbbf24", desc: "Some areas to sharpen" };
  return { label: "Needs Work", color: "#f87171", desc: "Missing critical elements" };
}

function generatePeerComparison(profile, score) {
  if (!profile) {
    return {
      peerAvg: 58,
      percentile: 50,
      description: "Complete your profile to see how you compare to peers."
    };
  }
  
  const stageMultiplier = {
    preseed: 0.9, seed: 0.92, seriesA: 0.95, seriesB: 1.0, seriesC: 1.02, enterprise: 1.05
  };
  const baseAverage = 58;
  const peerAvg = Math.round(baseAverage * (stageMultiplier[profile.companyStage] || 1));
  const percentile = Math.min(99, Math.max(1, Math.round(50 + (score - peerAvg) * 2)));
  
  const stageLabel = COMPANY_STAGE.find(s => s.value === profile.companyStage)?.label || "your stage";
  const roleLabel = ROLES.find(r => r.value === profile.role)?.label || "your role";
  
  return {
    peerAvg,
    percentile,
    description: `Your score is in the top ${100 - percentile}% of ${roleLabel}s at ${stageLabel} companies.`
  };
}

// ============================================
// COMPONENTS
// ============================================

function Landing({ onStart }) {
  const exampleBets = [
    { domain: "Retention", hypothesis: "If we add a weekly digest email, then 30-day retention will increase from 45% to 52%...", score: 78, ownership: "your idea" },
    { domain: "Growth", hypothesis: "If we launch a referral program with $20 credit, then referral signups will reach 15%...", score: 82, ownership: "your idea" },
    { domain: "Monetization", hypothesis: "VP wants annual billing at 20% discount, claims 30% of subscribers will choose it...", score: 71, ownership: "tracking leadership's bet" }
  ];
  
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a' }}>
   <style>{`
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-18px, 24px); }
  }
`}</style>
{/* Hero with animated background */}
<div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 140px)' }}>
  {/* Background */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>

    {/* Primary teal glow — anchored top-right */}
    <div style={{
      position: 'absolute',
      top: '-10%',
      right: '-5%',
      width: '55vw',
      height: '55vw',
      maxWidth: 720,
      maxHeight: 720,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 60% 40%, rgba(20,184,166,0.18) 0%, rgba(13,148,136,0.08) 35%, transparent 70%)',
      animation: 'drift 28s ease-in-out infinite',
      filter: 'blur(2px)'
    }} />

    {/* Secondary faint glow — bottom-left */}
    <div style={{
      position: 'absolute',
      bottom: '-5%',
      left: '5%',
      width: '30vw',
      height: '30vw',
      maxWidth: 400,
      maxHeight: 400,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 65%)',
      filter: 'blur(1px)'
    }} />

    {/* Dot grid, faded at edges */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(rgba(45,212,191,0.18) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)'
    }} />

    {/* Bottom vignette */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      background: 'linear-gradient(to top, #0a0f1a 0%, transparent 100%)'
    }} />

  </div>
        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px', minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
{/* Animated icons - left-aligned, proportionate to text */}
<div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
  {/* Experimental beaker */}
  <svg width="24" height="24" viewBox="0 0 24 28" fill="none">
    <style>{`
      @keyframes landingBubble1 {
        0% { cy: 20; opacity: 0; }
        20% { opacity: 1; }
        100% { cy: 3; opacity: 0; }
      }
      @keyframes landingBubble2 {
        0% { cy: 20; opacity: 0; }
        20% { opacity: 1; }
        100% { cy: 3.5; opacity: 0; }
      }
      @keyframes landingBubble3 {
        0% { cy: 20; opacity: 0; }
        20% { opacity: 1; }
        100% { cy: 3; opacity: 0; }
      }
      .landing-bubble1 { animation: landingBubble1 2.5s ease-in infinite; }
      .landing-bubble2 { animation: landingBubble2 2.5s ease-in infinite 0.8s; }
      .landing-bubble3 { animation: landingBubble3 2.5s ease-in infinite 1.6s; }
    `}</style>
    <path 
      d="M8 2 L8 10 L4 22 C3.5 24 4.5 26 7 26 L17 26 C19.5 26 20.5 24 20 22 L16 10 L16 2" 
      stroke="url(#landingBeakerGradient)" 
      strokeWidth="2" 
      fill="none"
    />
    <line x1="8" y1="2" x2="16" y2="2" stroke="url(#landingBeakerGradient)" strokeWidth="2"/>
    <circle className="landing-bubble1" cx="9" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
    <circle className="landing-bubble2" cx="12" cy="20" r="1.8" fill="#22d3ee" opacity="0"/>
    <circle className="landing-bubble3" cx="15" cy="20" r="2" fill="#2dd4bf" opacity="0"/>
    <defs>
      <linearGradient id="landingBeakerGradient" x1="4" y1="2" x2="20" y2="26">
        <stop offset="0%" stopColor="#2dd4bf"/>
        <stop offset="100%" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>

  {/* Outer ring */}
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
    <style>{`
      @keyframes landingDraw {
        0% { stroke-dashoffset: 75.4; }
        30% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 0; }
      }
      .landing-draw-circle { 
        stroke-dasharray: 75.4;
        animation: landingDraw 10s linear infinite;
      }
    `}</style>
    <circle 
      className="landing-draw-circle"
      cx="14" 
      cy="14" 
      r="12" 
      stroke="url(#landingTealGradient2)" 
      strokeWidth="3" 
      fill="none"
    />
    <circle cx="14" cy="14" r="6" fill="#1e293b"/>
    <defs>
      <linearGradient id="landingTealGradient2" x1="2" y1="2" x2="26" y2="26">
        <stop offset="0%" stopColor="#2dd4bf"/>
        <stop offset="100%" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>

  {/* Inner ring */}
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
    <style>{`
      @keyframes landingGrowFromDot {
        0% { transform: scale(0); opacity: 0; }
        22% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      .landing-grow-circle { 
        animation: landingGrowFromDot 9s ease-out infinite;
        transform-origin: center;
      }
    `}</style>
    <circle cx="14" cy="14" r="12" stroke="url(#landingTealGradient)" strokeWidth="2.5" fill="none"/>
    <circle className="landing-grow-circle" cx="14" cy="14" r="6" fill="url(#landingTealGradient)"/>
    <defs>
      <linearGradient id="landingTealGradient" x1="2" y1="2" x2="26" y2="26">
        <stop offset="0%" stopColor="#2dd4bf"/>
        <stop offset="100%" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>
</div>


<div style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, letterSpacing: '0.5px' }}>
  More Cheese. Less Waste.
</div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          color: '#f1f5f9', 
          lineHeight: 1.2, 
          marginBottom: 24 
        }}>
          The Product Intelligence Loop

        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 650, marginBottom: 40 }}>
        Improve your odds with context-aware scoring that learns from every outcome.
        </p>
        <button
          onClick={onStart}
          style={{
            padding: '16px 40px',
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            alignSelf: 'flex-start',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(45, 212, 191, 0.3)'; }}
          onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
        >
          Submit Your First Bet →
        </button>
      </div>
      </div>
      
      {/* How it works */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 40, textAlign: 'center' }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { num: 1, title: "Submit a bet", desc: "Your hypothesis, the metric, your prediction" },
              { num: 2, title: "Get your score", desc: "See how well-structured your bet is" },
              { num: 3, title: "Log the outcome", desc: "Did it work? By how much?" },
              { num: 4, title: "Build your record", desc: "Track accuracy, see patterns, compare to peers" }
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: 800, color: '#0a0f1a',
                  margin: '0 auto 16px'
                }}>{step.num}</div>
                <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Example bets */}
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12, textAlign: 'center' }}>
            See What Good Bets Look Like
          </h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 40 }}>
            Real examples across different domains
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {exampleBets.map((bet, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 24
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: '#2dd4bf', 
                      textTransform: 'uppercase', 
                      letterSpacing: 1
                    }}>{bet.domain}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      color: bet.ownership === 'your idea' ? '#94a3b8' : '#fbbf24',
                      background: bet.ownership === 'your idea' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>{bet.ownership}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    "{bet.hypothesis}"
                  </div>
                </div>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(45, 212, 191, 0.1)',
                  border: '2px solid #2dd4bf',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', flexShrink: 0
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2dd4bf' }}>{bet.score}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>SCORE</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div style={{ padding: '40px 24px 80px', textAlign: 'center' }}>
        <button
          onClick={onStart}
          style={{
            padding: '16px 40px',
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer'
          }}
        >
          Get Started — Free →
        </button>
        <p style={{ color: '#475569', marginTop: 16, fontSize: '0.9rem' }}>
          No credit card. No trial period. Just track your bets.
        </p>
      </div>
    </div>
  );
}

function EmailAuth({ onComplete, emailSent }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  
  const isValidEmail = email.includes('@') && email.includes('.');
  
  const handleSubmit = async () => {
    if (isValidEmail && !sending) {
      setSending(true);
      await onComplete(email);
      setSending(false);
    }
  };
  
  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', padding: '60px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {!emailSent ? (
          <>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              Save your bets
            </h1>
            <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Enter your email to track bets over time and get reminders when it's time to measure.
            </p>
            
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="you@domain.com"
              disabled={sending}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#f1f5f9',
                fontSize: '1.1rem',
                textAlign: 'center',
                marginBottom: 16,
                opacity: sending ? 0.6 : 1
              }}
            />
            
            <button
              onClick={handleSubmit}
              disabled={!isValidEmail || sending}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                background: isValidEmail && !sending ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
                color: isValidEmail && !sending ? '#0a0f1a' : '#475569',
                border: 'none',
                borderRadius: 10,
                cursor: isValidEmail && !sending ? 'pointer' : 'not-allowed'
              }}
            >
              {sending ? 'Sending...' : 'Continue →'}
            </button>
            
            <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: 20 }}>
              No password needed. We'll send you a magic link to sign in.
            </p>
          </>
        ) : (
          <>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', 
              background: 'rgba(45, 212, 191, 0.2)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '2rem'
            }}>✉️</div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: 12 }}>Check your email</h2>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>
              We sent a magic link to <strong style={{ color: '#2dd4bf' }}>{email}</strong>
            </p>
            <p style={{ color: '#64748b', marginTop: 16, fontSize: '0.9rem' }}>
              Click the link in the email to sign in. You can close this tab.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileSetup({ onComplete }) {
  const [mode, setMode] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({ name: '', website: '' });
  const [profile, setProfile] = useState({
    role: '',
    seniority: '',
    companyStage: '',
    teamSize: '',
    industry: ''
  });
  
  const isCompanyComplete = companyInfo.name.trim().length > 1;
  const isSurveyComplete = profile.role && profile.seniority && profile.companyStage && profile.teamSize && profile.industry;
  
  const handleCompanySubmit = () => {
    if (isCompanyComplete) {
      onComplete({ 
        companyName: companyInfo.name.trim(),
        companyWebsite: companyInfo.website.trim(),
        profileMethod: 'company'
      });
    }
  };
  
  const handleSurveySubmit = () => {
    if (isSurveyComplete) {
      onComplete({ 
        ...profile,
        profileMethod: 'survey'
      });
    }
  };
  
  const SelectField = ({ label, options, value, onChange }) => (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          color: value ? '#f1f5f9' : '#64748b',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
  
  if (mode === null) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
            Quick setup
          </h1>
          <p style={{ color: '#64748b', marginBottom: 40, lineHeight: 1.6 }}>
            We use your company context to compare you to relevant peers. Pick whichever is faster.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              onClick={() => setMode('company')}
              style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#2dd4bf'; e.currentTarget.style.background = 'rgba(45, 212, 191, 0.05)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <div style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                Just tell us your company
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                We'll look up the details. Takes 10 seconds.
              </div>
            </button>
            
            <button
              onClick={() => setMode('survey')}
              style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#2dd4bf'; e.currentTarget.style.background = 'rgba(45, 212, 191, 0.05)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <div style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                Answer a few questions
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                5 quick questions about your role and company. Takes 1 minute.
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (mode === 'company') {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <button
            onClick={() => setMode(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              marginBottom: 24,
              fontSize: '0.9rem',
              padding: 0
            }}
          >
            ← Back
          </button>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
            What company are you at?
          </h1>
          <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
            We'll use this to find your peer group. Your company name is never shared or displayed publicly.
          </p>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
              Company name *
            </label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              placeholder="e.g., Acme Corp"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
              Website <span style={{ color: '#64748b' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={companyInfo.website}
              onChange={e => setCompanyInfo({ ...companyInfo, website: e.target.value })}
              placeholder="e.g., acme.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 32,
            fontSize: '0.85rem',
            color: '#94a3b8',
            lineHeight: 1.5
          }}>
            🔒 <strong style={{ color: '#2dd4bf' }}>Privacy:</strong> Your company name is only used for peer matching. It's never displayed publicly or shared with other users.
          </div>
          
          <button
            onClick={handleCompanySubmit}
            disabled={!isCompanyComplete}
            style={{
              width: '100%',
              padding: '16px',
              background: isCompanyComplete ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
              color: isCompanyComplete ? '#0a0f1a' : '#475569',
              border: 'none',
              borderRadius: 10,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isCompanyComplete ? 'pointer' : 'not-allowed'
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <button
          onClick={() => setMode(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: 24,
            fontSize: '0.9rem',
            padding: 0
          }}
        >
          ← Back
        </button>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
          Tell us about you
        </h1>
        <p style={{ color: '#64748b', marginBottom: 40 }}>
          This helps us compare you to relevant peers.
        </p>
        
        <SelectField 
          label="What's your role?" 
          options={ROLES} 
          value={profile.role}
          onChange={v => setProfile({ ...profile, role: v })}
        />
        <SelectField 
          label="What's your level?" 
          options={SENIORITY} 
          value={profile.seniority}
          onChange={v => setProfile({ ...profile, seniority: v })}
        />
        <SelectField 
          label="What stage is your company?" 
          options={COMPANY_STAGE} 
          value={profile.companyStage}
          onChange={v => setProfile({ ...profile, companyStage: v })}
        />
        <SelectField 
          label="How big is your team?" 
          options={TEAM_SIZE} 
          value={profile.teamSize}
          onChange={v => setProfile({ ...profile, teamSize: v })}
        />
        <SelectField 
          label="What industry?" 
          options={INDUSTRY} 
          value={profile.industry}
          onChange={v => setProfile({ ...profile, industry: v })}
        />
        
        <button
          onClick={handleSurveySubmit}
          disabled={!isSurveyComplete}
          style={{
            width: '100%',
            padding: '16px',
            background: isSurveyComplete ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
            color: isSurveyComplete ? '#0a0f1a' : '#475569',
            border: 'none',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isSurveyComplete ? 'pointer' : 'not-allowed',
            marginTop: 16
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}



function ScoreResult({ bet, onNewBet, onSkipToDashboard, onSavePersonal, onAddToMarketplace, onUseAI }) {
  const [enhancementDecided, setEnhancementDecided] = useState(!!bet.aiEnhanced);
  
  const aiScores = bet.scoringRationale;
  const hasAIScores = aiScores?.approach && aiScores?.potential && aiScores?.fit;
  
  const oldScore = calculateScore(bet);
  const oldScoreInfo = getScoreLabel(oldScore.total);
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#2dd4bf';
    if (score >= 40) return '#fbbf24';
    return '#f87171';
  };

  const ScoreCircle = ({ score, label, rationale }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#0d1929',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getScoreColor(score) }}>{score}</div>
        </div>
      </div>
      <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4, padding: '0 8px', textAlign: 'left' }}>{rationale}</div>
    </div>
  );

  const avgScore = hasAIScores 
    ? Math.round((aiScores.approach.score + aiScores.potential.score + aiScores.fit.score) / 3)
    : oldScore.total;
  
const hasSuggestion = aiScores?.suggestion; // TESTING: Always show if suggestion exists
  const suggestionType = aiScores?.suggestion?.type;

  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {hasAIScores ? (
          <>
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>
                Your Bet Score
              </h2>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                <ScoreCircle 
                  score={aiScores.approach.score} 
                  label="Approach" 
                  rationale={aiScores.approach.rationale} 
                />
                <ScoreCircle 
                  score={aiScores.potential.score} 
                  label="Potential" 
                  rationale={aiScores.potential.rationale} 
                />
                <ScoreCircle 
                  score={aiScores.fit.score} 
                  label="Fit" 
                  rationale={aiScores.fit.rationale} 
                />
              </div>
            </div>

            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 32,
              textAlign: 'center'
            }}>
              <div style={{ color: '#2dd4bf', fontSize: '2rem', fontWeight: 800 }}>{avgScore}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Overall Score</div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              width: 160, height: 160, borderRadius: '50%',
              background: `conic-gradient(${oldScoreInfo.color} ${oldScore.total * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: '#0d1929',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: oldScoreInfo.color }}>{oldScore.total}</div>
                <div style={{ fontSize: '0.9rem', color: oldScoreInfo.color, fontWeight: 600 }}>{oldScoreInfo.label}</div>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{oldScoreInfo.desc}</p>
          </div>
        )}

        {hasSuggestion && !enhancementDecided && (
          <div style={{ marginBottom: 32 }}>
            <div style={{
              background: suggestionType === 'alternative' 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(139, 92, 246, 0.1)',
              border: suggestionType === 'alternative'
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 12,
              padding: 24
            }}>
              <h3 style={{ 
                color: suggestionType === 'alternative' ? '#f87171' : '#a78bfa',
                marginBottom: 8, 
                fontSize: '1.1rem', 
                fontWeight: 600 
              }}>
                {suggestionType === 'alternative' 
                  ? 'AI Alternative Recommendation' 
                  : 'AI Enhancement Suggestion'}
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '0.85rem',
                marginBottom: 16,
                fontStyle: 'italic'
              }}>
                {suggestionType === 'alternative'
                  ? 'Your bet scored below 60. Here\'s a different approach to achieve your goal:'
                  : 'Here are suggestions to consider:'}
              </p>
              
              <div style={{ color: '#cbd5e1', marginBottom: 16 }}>
                <strong style={{ 
                  color: suggestionType === 'alternative' ? '#f87171' : '#a78bfa' 
                }}>
                  {suggestionType === 'alternative' ? 'Alternative Hypothesis:' : 'Improved Hypothesis:'}
                </strong>
                <div style={{ 
                  marginTop: 8, 
                  padding: 12, 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: 8,
                  lineHeight: 1.6
                }}>
                  {aiScores.suggestion.hypothesis}
                </div>
              </div>
              
              {aiScores.suggestion.metrics && (
                <div style={{ color: '#cbd5e1', marginBottom: 16 }}>
                  <strong style={{ 
                    color: suggestionType === 'alternative' ? '#f87171' : '#a78bfa' 
                  }}>
                    Metrics:
                  </strong> {aiScores.suggestion.metrics}
                </div>
              )}
              
              {aiScores.suggestion.effort && (
                <div style={{ color: '#cbd5e1', marginBottom: 16 }}>
                  <strong style={{ 
                    color: suggestionType === 'alternative' ? '#f87171' : '#a78bfa' 
                  }}>
                    Effort:
                  </strong> {aiScores.suggestion.effort}
                </div>
              )}
              
              {aiScores.suggestion.reasoning && (
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '0.85rem', 
                  marginBottom: 16,
                  fontStyle: 'italic',
                  borderLeft: suggestionType === 'alternative' 
                    ? '3px solid rgba(239, 68, 68, 0.5)' 
                    : '3px solid rgba(139, 92, 246, 0.5)',
                  paddingLeft: 12
                }}>
                  {aiScores.suggestion.reasoning}
                </div>
              )}
              
              {aiScores.suggestion.expected_score && (
                <div style={{
                  color: '#2dd4bf',
                  fontSize: '0.9rem',
                  marginBottom: 24,
                  fontWeight: 600
                }}>
                  Expected score with {suggestionType === 'alternative' ? 'alternative' : 'improvements'}: ~{aiScores.suggestion.expected_score}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={async () => {
                    await onUseAI();
                    setEnhancementDecided(true);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: suggestionType === 'alternative'
                      ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
                      : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {suggestionType === 'alternative' 
                    ? 'Replace with Alternative' 
                    : 'Use Enhancement'}
                </button>
                <button
                  onClick={() => setEnhancementDecided(true)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Keep Original
                </button>
              </div>
            </div>
          </div>
        )}

        {(enhancementDecided || !hasSuggestion) && (
          <>
            {/* Show AI-enhanced score if it exists */}
            {bet.aiEnhanced && bet.aiPredictedScore && (
              <div style={{
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                textAlign: 'center'
              }}>
                <div style={{ color: '#2dd4bf', fontSize: '1.75rem', fontWeight: 800 }}>
                  {bet.aiPredictedScore}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  CHZCLOTH Enhanced Score
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                color: '#f1f5f9', 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                Your Bet
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>

                  {bet.strategicAlignment && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 10px',
                      borderRadius: 4
                    }}>
                      {bet.strategicAlignment === 'bullseye' ? 'Bullseye' : 
                       bet.strategicAlignment === 'inner' ? 'Inner Ring' :
                       bet.strategicAlignment === 'outer' ? 'Outer Ring' : 'Edge'}
                    </span>
                  )}
                  {bet.estimatedEffort && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 10px',
                      borderRadius: 4
                    }}>
                      {bet.estimatedEffort}
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>Hypothesis</div>
                  <div style={{ color: '#f1f5f9', lineHeight: 1.6 }}>{bet.hypothesis}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>Metric</div>
                    <div style={{ color: '#2dd4bf' }}>{bet.metric}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>Prediction</div>
                    <div style={{ color: '#f1f5f9' }}>{bet.prediction}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>Confidence</div>
                    <div style={{ color: '#fbbf24' }}>{bet.confidence}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>Measure in</div>
                    <div style={{ color: '#f1f5f9' }}>{bet.timeframe} days</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={onSavePersonal}
                style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#0a0f1a',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Add to My Queue
              </button>
              
              <button
                onClick={onAddToMarketplace}
                style={{
                  padding: '16px 24px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 10,
                  color: '#fbbf24',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add to Marketplace
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function SeedBaseline({ profile, onComplete }) {
  const [currentBetIndex, setCurrentBetIndex] = useState(0);
  const [pastBets, setPastBets] = useState([
    { isOwnIdea: true, ideaSource: '', hypothesis: '', metricDomain: '', metric: '', prediction: '', actualResult: '', outcome: '', learned: '', timeframe: '' },
    { isOwnIdea: true, ideaSource: '', hypothesis: '', metricDomain: '', metric: '', prediction: '', actualResult: '', outcome: '', learned: '', timeframe: '' },
    { isOwnIdea: true, ideaSource: '', hypothesis: '', metricDomain: '', metric: '', prediction: '', actualResult: '', outcome: '', learned: '', timeframe: '' }
  ]);
  
  const currentBet = pastBets[currentBetIndex];
  
  const updateCurrentBet = (field, value) => {
    const updated = [...pastBets];
    updated[currentBetIndex] = { ...updated[currentBetIndex], [field]: value };
    setPastBets(updated);
  };
  
  const isCurrentBetComplete = () => {
    const b = currentBet;
    return b.hypothesis.length >= 20 && b.metric && b.prediction && b.outcome && b.learned.length >= 10;
  };
  
  const completedBets = pastBets.filter(b => b.hypothesis && b.outcome && b.learned);
  
  const accuracy = completedBets.length > 0 
    ? Math.round((completedBets.filter(b => b.outcome === 'succeeded' || b.outcome === 'partial').length / completedBets.length) * 100)
    : 0;
  
  const handleNext = () => {
    if (currentBetIndex < 2) {
      setCurrentBetIndex(currentBetIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (currentBetIndex > 0) {
      setCurrentBetIndex(currentBetIndex - 1);
    }
  };
  
  const canFinish = completedBets.length >= 2;
  
  const currentDomain = currentBet.metricDomain ? METRICS[currentBet.metricDomain] : null;
  
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Seed Your Baseline</span>
        </div>
        
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <button
              key={i}
              onClick={() => setCurrentBetIndex(i)}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: pastBets[i].outcome ? 'rgba(45, 212, 191, 0.2)' : i === currentBetIndex ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${i === currentBetIndex ? '#2dd4bf' : pastBets[i].outcome ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                color: pastBets[i].outcome ? '#2dd4bf' : i === currentBetIndex ? '#f1f5f9' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {pastBets[i].outcome ? '✓' : i + 1}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ color: '#64748b', fontSize: '0.85rem', alignSelf: 'center' }}>
            {completedBets.length}/3 complete {completedBets.length >= 2 && <span style={{ color: '#2dd4bf' }}>✓ Ready</span>}
          </div>
        </div>
        
        {/* Framing message */}
        <div style={{ 
          background: 'rgba(251, 191, 36, 0.1)', 
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: 8, 
          padding: 16, 
          marginBottom: 32 
        }}>
          <div style={{ color: '#fbbf24', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <strong>Include wins AND losses.</strong> Failed bets teach us as much as successful ones. What you learned is as valuable as the outcome.
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>
          Past Bet {currentBetIndex + 1} {currentBetIndex === 2 && <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>(optional)</span>}
        </h2>
        
        {/* Ownership */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10 }}>
            Whose bet was this?
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => updateCurrentBet('isOwnIdea', true)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: currentBet.isOwnIdea ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${currentBet.isOwnIdea ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                color: currentBet.isOwnIdea ? '#2dd4bf' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              My idea
            </button>
            <button
              onClick={() => updateCurrentBet('isOwnIdea', false)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: !currentBet.isOwnIdea ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${!currentBet.isOwnIdea ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                color: !currentBet.isOwnIdea ? '#fbbf24' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Someone else's
            </button>
          </div>
          {!currentBet.isOwnIdea && (
            <input
              type="text"
              value={currentBet.ideaSource}
              onChange={e => updateCurrentBet('ideaSource', e.target.value)}
              placeholder="Who? (e.g., VP Product, CEO)"
              style={{
                width: '100%',
                marginTop: 10,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: '#f1f5f9',
                fontSize: '0.9rem'
              }}
            />
          )}
        </div>
        
        {/* Hypothesis */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What was the hypothesis? <span style={{ color: '#f87171' }}>*</span>
          </label>
          <textarea
            value={currentBet.hypothesis}
            onChange={e => updateCurrentBet('hypothesis', e.target.value)}
            placeholder="If we [action], then [outcome] because [reason]..."
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
            Reconstruct as best you can. The structure helps us learn.
          </div>
        </div>
        
        {/* Metric domain + specific */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What metric did you track? <span style={{ color: '#f87171' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select
              value={currentBet.metricDomain}
              onChange={e => updateCurrentBet('metricDomain', e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: currentBet.metricDomain ? '#f1f5f9' : '#64748b',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Domain...</option>
              {Object.entries(METRICS).map(([key, domain]) => (
                <option key={key} value={key}>{domain.label}</option>
              ))}
            </select>
            <select
              value={currentBet.metric}
              onChange={e => updateCurrentBet('metric', e.target.value)}
              disabled={!currentBet.metricDomain}
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: currentBet.metric ? '#f1f5f9' : '#64748b',
                fontSize: '0.9rem',
                cursor: currentBet.metricDomain ? 'pointer' : 'not-allowed',
                opacity: currentBet.metricDomain ? 1 : 0.5
              }}
            >
              <option value="">Metric...</option>
              {currentDomain?.metrics.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Prediction */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What did you predict would happen? <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            type="text"
            value={currentBet.prediction}
            onChange={e => updateCurrentBet('prediction', e.target.value)}
            placeholder="e.g., Retention would increase from 40% to 50%"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#f1f5f9',
              fontSize: '0.95rem'
            }}
          />
        </div>
        
        {/* Actual result */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What actually happened? (the numbers)
          </label>
          <input
            type="text"
            value={currentBet.actualResult || ''}
            onChange={e => updateCurrentBet('actualResult', e.target.value)}
            placeholder="e.g., Retention went from 40% to 44%"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#f1f5f9',
              fontSize: '0.95rem'
            }}
          />
        </div>
        
        {/* Outcome */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10 }}>
            What actually happened? <span style={{ color: '#f87171' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: 'succeeded', label: 'Succeeded', color: '#22c55e' },
              { value: 'partial', label: 'Partially', color: '#fbbf24' },
              { value: 'failed', label: 'Failed', color: '#f87171' },
              { value: 'unknown', label: 'Never measured', color: '#64748b' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateCurrentBet('outcome', opt.value)}
                style={{
                  padding: '10px 16px',
                  background: currentBet.outcome === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${currentBet.outcome === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  color: currentBet.outcome === opt.value ? opt.color : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* When was this */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10 }}>
            When was this?
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: 'recent', label: 'Last 3 months' },
              { value: '6mo', label: '3-6 months ago' },
              { value: 'year', label: '6-12 months ago' },
              { value: 'older', label: 'Over a year ago' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateCurrentBet('timeframe', opt.value)}
                style={{
                  padding: '10px 14px',
                  background: currentBet.timeframe === opt.value ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${currentBet.timeframe === opt.value ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  color: currentBet.timeframe === opt.value ? '#2dd4bf' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* What you learned */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
            What did you learn? <span style={{ color: '#f87171' }}>*</span>
          </label>
          <textarea
            value={currentBet.learned}
            onChange={e => updateCurrentBet('learned', e.target.value)}
            placeholder="What would you do differently? What surprised you? What did this teach you about your assumptions?"
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
            This is gold — the learning matters as much as the outcome.
          </div>
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {currentBetIndex > 0 && (
            <button
              onClick={handleBack}
              style={{
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: 8,
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              ← Previous
            </button>
          )}
          <div style={{ flex: 1 }} />
          {currentBetIndex < 2 && (
            <button
              onClick={handleNext}
              disabled={!isCurrentBetComplete() && currentBetIndex < 2}
              style={{
                padding: '12px 24px',
                background: isCurrentBetComplete() ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                color: isCurrentBetComplete() ? '#0a0f1a' : '#475569',
                fontWeight: 600,
                cursor: isCurrentBetComplete() ? 'pointer' : 'not-allowed'
              }}
            >
              {isCurrentBetComplete() ? 'Next Bet →' : 'Complete to continue'}
            </button>
          )}
        </div>
        
        {/* Summary + Finish */}
        {canFinish && (
          <div style={{
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: 12,
            padding: 24,
            marginTop: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ color: '#2dd4bf', fontSize: '2rem', fontWeight: 800 }}>{accuracy}%</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Your baseline accuracy from {completedBets.length} past bets</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {completedBets.filter(b => b.isOwnIdea).length} your ideas
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {completedBets.filter(b => !b.isOwnIdea).length} others' ideas
                </div>
              </div>
            </div>
            <button
              onClick={() => onComplete(pastBets, accuracy)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 10,
                color: '#0a0f1a',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              See My Full Dashboard →
            </button>
          </div>
        )}
        
        {!canFinish && completedBets.length >= 1 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => onComplete(pastBets, accuracy)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Skip — I'll add more later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RecordOutcome({ bet, onComplete, onCancel }) {
  const [outcome, setOutcome] = useState({
    actualResult: '',
    status: '',
    learned: '',
    wouldDoAgain: null
  });
  
  const statusOptions = [
    { value: 'succeeded', label: 'Succeeded', color: '#22c55e', desc: 'Hit or exceeded the target' },
    { value: 'partial', label: 'Partially succeeded', color: '#fbbf24', desc: 'Moved the metric, but less than predicted' },
    { value: 'failed', label: 'Failed', color: '#f87171', desc: 'Didn\'t move the metric or went wrong direction' },
    { value: 'inconclusive', label: 'Inconclusive', color: '#64748b', desc: 'Couldn\'t measure properly, data issues' },
    { value: 'never_shipped', label: 'Never shipped', color: '#475569', desc: 'Got killed, deprioritized, or blocked' }
  ];
  
  const countsTowardAccuracy = ['succeeded', 'partial', 'failed'].includes(outcome.status);
  const isComplete = outcome.status && (outcome.status === 'never_shipped' || outcome.learned.length >= 10);
  
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          Time to close the loop
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
          Your measurement window is up. Let's see what happened.
        </p>
        
        {/* The original bet */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, 
          padding: 20, 
          marginBottom: 32 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>Your Bet</span>

          </div>
          <div style={{ color: '#f1f5f9', lineHeight: 1.6, marginBottom: 16 }}>{bet.hypothesis}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 2 }}>Metric</div>
              <div style={{ color: '#2dd4bf', fontSize: '0.9rem' }}>{bet.metric}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 2 }}>You predicted</div>
              <div style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{bet.prediction}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 2 }}>Confidence</div>
              <div style={{ color: '#fbbf24', fontSize: '0.9rem' }}>{bet.confidence}%</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 2 }}>Timeframe</div>
              <div style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{bet.timeframe} days</div>
            </div>
          </div>
        </div>
        
        {/* What actually happened */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>
            What actually happened?
          </label>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 8 }}>
            The actual numbers, as specific as you can.
          </p>
          <input
            type="text"
            value={outcome.actualResult}
            onChange={e => setOutcome({ ...outcome, actualResult: e.target.value })}
            placeholder={`e.g., ${bet.metric} went from X to Y`}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.95rem'
            }}
          />
        </div>
        
        {/* How would you call it */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
            How would you call it? *
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setOutcome({ ...outcome, status: opt.value })}
                style={{
                  padding: '14px 16px',
                  background: outcome.status === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${outcome.status === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${outcome.status === opt.value ? opt.color : 'rgba(255,255,255,0.2)'}`,
                  background: outcome.status === opt.value ? opt.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {outcome.status === opt.value && <span style={{ color: '#0a0f1a', fontSize: '0.7rem' }}>✓</span>}
                </div>
                <div>
                  <div style={{ color: outcome.status === opt.value ? opt.color : '#f1f5f9', fontWeight: 500 }}>
                    {opt.label}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {outcome.status && !countsTowardAccuracy && (
            <div style={{ 
              marginTop: 12, 
              padding: 12, 
              background: 'rgba(100, 116, 139, 0.1)', 
              borderRadius: 8,
              fontSize: '0.85rem',
              color: '#94a3b8'
            }}>
              This won't count toward your accuracy score — only clear wins, partial wins, and fails do.
            </div>
          )}
        </div>
        
        {/* What did you learn */}
        {outcome.status && outcome.status !== 'never_shipped' && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>
              What did you learn? *
            </label>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 8 }}>
              {outcome.status === 'succeeded' 
                ? "What made this work? What would you repeat?"
                : outcome.status === 'failed'
                ? "What would you do differently? What did you miss?"
                : "What surprised you? What would you do differently?"}
            </p>
            <textarea
              value={outcome.learned}
              onChange={e => setOutcome({ ...outcome, learned: e.target.value })}
              placeholder="This is the most valuable part. Be specific."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
          </div>
        )}
        
        {/* Would you do it again? */}
        {outcome.status && outcome.status !== 'never_shipped' && (
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
              Knowing what you know now, would you make this bet again?
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { value: true, label: 'Yes', color: '#22c55e' },
                { value: false, label: 'No', color: '#f87171' }
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setOutcome({ ...outcome, wouldDoAgain: opt.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: outcome.wouldDoAgain === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${outcome.wouldDoAgain === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    color: outcome.wouldDoAgain === opt.value ? opt.color : '#94a3b8',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 10,
              color: '#94a3b8',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Later
          </button>
          <button
            onClick={() => onComplete({ ...bet, ...outcome })}
            disabled={!isComplete}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: isComplete ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 10,
              color: isComplete ? '#0a0f1a' : '#475569',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isComplete ? 'pointer' : 'not-allowed'
            }}
          >
            Save Outcome →
          </button>
        </div>
      </div>
    </div>
  );
}

const LEVER_COLORS = {
  Revenue:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e' },
  Retention:   { bg: 'rgba(45,212,191,0.15)',  border: 'rgba(45,212,191,0.3)',  text: '#2dd4bf' },
  Acquisition: { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Efficiency:  { bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.3)', text: '#7dd3fc' },
  Platform:    { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
  Experience:  { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)',  text: '#f97316' },
  Risk:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
};

const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getStatusBadge = (bet) => {
  const outcome = bet.status || bet.outcome;
  if (['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(outcome)) {
    const colors = {
      succeeded:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e', label: '✓ Succeeded' },
      partial:       { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24', label: '◐ Partial' },
      failed:        { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444', label: '✗ Failed' },
      inconclusive:  { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8', label: '? Inconclusive' },
      never_shipped: { bg: 'rgba(71,85,105,0.15)',   border: 'rgba(71,85,105,0.3)',   text: '#64748b', label: '⊘ Never shipped' },
    };
    return colors[outcome] || { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8', label: outcome };
  }
  if (bet.completedAt)                           return { bg: 'rgba(45,212,191,0.15)',  border: 'rgba(45,212,191,0.3)',  text: '#2dd4bf', label: 'Completed' };
  if (bet.startedAt)                             return { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24', label: 'In Progress' };
  if (bet.approvalStatus === 'approved')         return { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa', label: 'Sponsored' };
  if (bet.approvalStatus === 'pending_approval') return { bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.3)', text: '#7dd3fc', label: 'In Marketplace' };
  return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94a3b8', label: 'Draft' };
};

function BetCard({ bet, showAddToMarketplace, expandedBets, setExpandedBets, onRecordOutcome, onAddToMarketplace, onWithdrawFromMarketplace, markStarted, onMarkCompletedClick }) {
  const isExpanded = expandedBets[bet.id];
  const isAIEnhanced = bet.aiEnhanced;
  const aiScore = bet.aiPredictedScore;
  const lever = bet.lever;
  const isStarted = !!bet.startedAt;
  const isCompleted = !!bet.completedAt;
  const hasOutcome = ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(bet.status || bet.outcome);
  const lc = lever && LEVER_COLORS[lever] ? LEVER_COLORS[lever] : { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94a3b8' };
  const statusBadge = getStatusBadge(bet);

  // showAddToMarketplace === true means "Your Bets", false means "Sponsored by You"
  const isYourBet = showAddToMarketplace;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, marginBottom: 12 }}>
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

        {/* Summary */}
        {bet.summary && (
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 12 }}>
            {bet.summary}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#64748b', marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: statusBadge.bg, border: `1px solid ${statusBadge.border}`, borderRadius: 6, color: statusBadge.text, fontSize: '0.75rem', fontWeight: 600 }}>
            {statusBadge.label}
          </span>
          {lever && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 6, color: lc.text, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {lever}
            </span>
          )}
        {isYourBet ? (
  bet.approvalStatus === 'approved' && bet.sponsoredByEmail && (
    <><span>•</span><span>sponsored by {bet.sponsoredByEmail}</span></>
  )
) : (
  bet.submittedByEmail && (
    <><span>•</span><span>by {bet.submittedByEmail}</span></>
  )
)}

          {/* Date — contextual: started date takes priority, then submitted */}
          {isStarted ? (
            <>
              <span>•</span>
              <span>Started {fmt(bet.startedAt)}</span>
            </>
          ) : (
            <>
              <span>•</span>
              <span>Submitted {fmt(bet.createdAt)}</span>
            </>
          )}

          {isCompleted && (
            <>
              <span>•</span>
              <span>Completed {fmt(bet.completedAt)}</span>
            </>
          )}
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(bet.scoringRationale || bet.hypothesis) && (
            <button
              onClick={() => setExpandedBets(prev => ({ ...prev, [bet.id]: !prev[bet.id] }))}
              style={{ background: 'transparent', border: 'none', color: '#2dd4bf', fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span style={{ fontSize: '0.7rem' }}>{isExpanded ? '▼' : '▶'}</span>
              {isExpanded ? 'Hide details' : 'Show details'}
            </button>
          )}

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {showAddToMarketplace && bet.approvalStatus === 'draft' && (
              <button
                onClick={() => onAddToMarketplace && onAddToMarketplace(bet)}
                style={{ padding: '7px 16px', background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.3)', borderRadius: 8, color: '#7dd3fc', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Add to Marketplace
              </button>
            )}
            {showAddToMarketplace && bet.approvalStatus === 'pending_approval' && (
              <button
                onClick={() => onWithdrawFromMarketplace && onWithdrawFromMarketplace(bet)}
                style={{ padding: '7px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Withdraw
              </button>
            )}
            {bet.approvalStatus === 'approved' && !isStarted && !isCompleted && !hasOutcome && (
              <button
                onClick={() => markStarted && markStarted(bet.id)}
                style={{ padding: '7px 16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Mark Started
              </button>
            )}
            {isStarted && !isCompleted && !hasOutcome && (
              <button
                onClick={() => onMarkCompletedClick && onMarkCompletedClick(bet)}
                style={{ padding: '7px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22c55e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Mark Completed
              </button>
            )}
            {isCompleted && !hasOutcome && (
              <button
                onClick={() => onRecordOutcome && onRecordOutcome(bet)}
                style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 8, color: '#0a0f1a', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Record Outcome →
              </button>
            )}
          </div>
        </div>

        {/* Expandable details */}
        {isExpanded && (
          <div style={{ marginTop: 12, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                BET DETAILS
              </div>
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
                      {bet.strategicAlignment === 'inner' ? 'Inner Ring' :
                       bet.strategicAlignment === 'outer' ? 'Outer Ring' :
                       bet.strategicAlignment === 'experimental' ? 'Experimental' : bet.strategicAlignment}
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
            {bet.scoringRationale && (
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  CHZCLOTH SCORING RATIONALE
                  {isAIEnhanced && <span style={{ color: '#2dd4bf', fontWeight: 700 }}>• ENHANCED</span>}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Approach:</span>
                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.approach?.rationale}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>Potential:</span>
                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.potential?.rationale}</span>
                </div>
                <div>
                  <span style={{ color: '#7dd3fc', fontWeight: 600 }}>Fit:</span>
                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>{bet.scoringRationale?.fit?.rationale}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Add this BEFORE the Dashboard function in App.jsx:
const getContribStatus = (bet) => {
  const outcomeKey = bet.outcome || bet.status;
  if (['succeeded','partial','failed','inconclusive','never_shipped'].includes(outcomeKey)) return 'Outcome Recorded';
  if (bet.completedAt) return 'Shipped';
  if (bet.startedAt && !bet.completedAt) return 'In Progress';
  if (bet.approvalStatus === 'approved') return 'Sponsored';
  if (bet.approvalStatus === 'pending_approval') return 'In Marketplace';
  return 'Draft';
};

// REPLACE the existing Dashboard function with this:
function Dashboard({ profile, bets, currentOrg, organizations, onSwitchOrg, onEditMode, onAddOrg, onNewBet, email, currentUserId, onRecordOutcome, onAddToMarketplace, onWithdrawFromMarketplace, markStarted, markCompleted, setScreen }) {
  const safeBets = bets || [];
  const [expandedBets, setExpandedBets] = useState({});
  const [completionModal, setCompletionModal] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const yourBets = safeBets.filter(b => b.userId === currentUserId || b.user_id === currentUserId);
  const sponsoredBets = safeBets.filter(b =>
    b.sponsoredBy === currentUserId &&
    (b.userId !== currentUserId && b.user_id !== currentUserId)
  );

  const counts = computeCounts([...yourBets, ...sponsoredBets], getContribStatus);
  const filteredYourBets = applyFilters(yourBets, filters, getContribStatus);
  const filteredSponsoredBets = applyFilters(sponsoredBets, filters, getContribStatus);

  const sortBets = (betsToSort) => {
    const order = { 'In Progress': 0, 'Sponsored': 1, 'In Marketplace': 2, 'Draft': 3, 'Shipped': 4, 'Outcome Recorded': 5 };
    return [...betsToSort].sort((a, b) => {
      const aLabel = getContribStatus(a);
      const bLabel = getContribStatus(b);
      return (order[aLabel] ?? 99) - (order[bLabel] ?? 99);
    });
  };

  const handleMarkCompletedClick = (bet) => setCompletionModal(bet);

  const handleConfirmComplete = async () => {
    if (!completionModal) return;
    await markCompleted(completionModal.id);
    setCompletionModal(null);
  };

  const handleCompleteAndRecord = async () => {
    if (!completionModal) return;
    await markCompleted(completionModal.id);
    const completedBet = { ...completionModal, completedAt: new Date().toISOString() };
    setCompletionModal(null);
    onRecordOutcome && onRecordOutcome(completedBet);
  };

  const cardProps = {
    expandedBets, setExpandedBets,
    onRecordOutcome, onAddToMarketplace, onWithdrawFromMarketplace,
    markStarted,
    onMarkCompletedClick: handleMarkCompletedClick
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Your Queue</h1>
          {yourBets.length > 0 && (
            <span style={{ color: '#475569', fontSize: '0.95rem' }}>{yourBets.length} bet{yourBets.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Collapsible summary */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Your bets and the ones you've sponsored.
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
                Your Queue is your personal workspace. Your Bets shows everything you've submitted — drafts, bets in the Marketplace waiting for a sponsor, and active bets in the Priority Queue. Sponsored by You shows bets from others that you've taken ownership of.
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                This is where you manage execution. Mark a bet started when work begins, mark it shipped when it's done, and record the outcome — what actually happened vs. what you predicted. That data builds your track record over time.
              </p>
              <p style={{ margin: 0 }}>
                Use the filters to focus on a specific status, lever, or strategic alignment.
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
          statusOptions={['Draft', 'In Marketplace', 'Sponsored', 'In Progress', 'Shipped', 'Outcome Recorded']}
          counts={counts}
        />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: 800 }}>{yourBets.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Submitted</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#a78bfa', fontSize: '2.5rem', fontWeight: 800 }}>
            {yourBets.filter(b => b.approvalStatus === 'approved').length}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Sponsored</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#fbbf24', fontSize: '2.5rem', fontWeight: 800 }}>
            {yourBets.filter(b => b.startedAt && !b.completedAt).length}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>In Progress</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#2dd4bf', fontSize: '2.5rem', fontWeight: 800 }}>
            {yourBets.filter(b => b.completedAt).length}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Shipped</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ color: '#22c55e', fontSize: '2.5rem', fontWeight: 800 }}>
            {yourBets.filter(b => ['succeeded', 'partial', 'failed', 'inconclusive', 'never_shipped'].includes(b.outcome || b.status)).length}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Outcome Recorded</div>
        </div>
      </div>

      {/* Your Bets */}
      {yourBets.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>
            Your Bets ({filteredYourBets.length}{filteredYourBets.length !== yourBets.length ? ` of ${yourBets.length}` : ''})
          </h2>
          {filteredYourBets.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '20px 0' }}>No bets match the current filters.</div>
          ) : (
            sortBets(filteredYourBets).map(bet => (
              <BetCard key={bet.id} bet={bet} showAddToMarketplace={true} {...cardProps} />
            ))
          )}
        </div>
      )}

      {/* Sponsored by You */}
      {sponsoredBets.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>
            Sponsored by You ({filteredSponsoredBets.length}{filteredSponsoredBets.length !== sponsoredBets.length ? ` of ${sponsoredBets.length}` : ''})
          </h2>
          {filteredSponsoredBets.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '20px 0' }}>No bets match the current filters.</div>
          ) : (
            sortBets(filteredSponsoredBets).map(bet => (
              <BetCard key={bet.id} bet={bet} showAddToMarketplace={false} {...cardProps} />
            ))
          )}
        </div>
      )}

      {safeBets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ color: '#64748b', marginBottom: 24 }}>No bets yet. Submit your first one!</div>
          <button
            onClick={onNewBet}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 10, color: '#0a0f1a', fontWeight: 600, cursor: 'pointer' }}
          >
            Submit a Bet →
          </button>
        </div>
      )}

      {/* Completion Modal */}
      {completionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, maxWidth: 440, width: 'calc(100% - 32px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 600, margin: '0 0 12px 0' }}>
              Bet Shipped!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 8 }}>
              <strong style={{ color: '#f1f5f9' }}>{completionModal.title || completionModal.hypothesis}</strong>
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 28 }}>
              Ready to record what happened? Outcome data is what makes your predictions meaningful over time.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleConfirmComplete}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Remind Me Later
              </button>
              <button
                onClick={handleCompleteAndRecord}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 8, color: '#0a0f1a', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Record Outcome →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ============================================
// MAIN APP
// ============================================

export default function App() {
  const { user, profile, loading: authLoading, signInWithEmail, updateProfile, isAuthenticated } = useAuth();
  
  // FIX: Destructure `initialized` (new) instead of relying on computed `loading`
const { 
  organizations, 
  currentOrg, 
  loading: orgsLoading,
  initialized: orgsInitialized,
  createOrganization,
  switchCurrentOrg,
  addCompanyToOrg,
  isAdmin,
  canInviteUsers
} = useOrganizations();
  
const { bets, loading: betsLoading, createBet, createPastBets, recordOutcome, scoreBet, approveBet, rejectBet, refreshBets, markStarted, markCompleted} = useBets(currentOrg?.orgId, currentOrg?.mode);
const { ideas, loading: ideasLoading, updateIdeaStatus, claimIdea, submitIdea, unclaimIdea, withdrawFromMarketplace } = useIdeas(currentOrg?.orgId);
  const [screen, setScreen] = useState('landing');
  const [currentBet, setCurrentBet] = useState(null);
  const [betToRecord, setBetToRecord] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [betToReplace, setBetToReplace] = useState(null);
  const [pendingBet, setPendingBet] = useState(null);
  const [expandedPriorityBet, setExpandedPriorityBet] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);

  
  // FIX: Progressive loading messages for Supabase free tier cold starts (5-8s)
  // Instead of a 3s timeout that forces a wrong routing decision,
  // we count seconds and update the loading message.
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  
  // ============================================
  // MAIN ROUTING LOGIC
  // ============================================
  // FIX: Routes based on `orgsInitialized` (real data arrived) instead
  // of a timeout (arbitrary guess). The loading screen handles UX
  // during Supabase cold starts.
  //
  // Removed: loadingTimeout, hasRedirected, pendingDashboard
  //
  // Why no hasRedirected guard?
  // The redirect only fires when screen === 'email' || 'landing'.
  // Once we setScreen('dashboard'), the condition fails and the
  // effect becomes a no-op. React bails out of setScreen if the
  // value hasn't changed, so no infinite loops.
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (!orgsInitialized) return;
    
    if (screen === 'email' || screen === 'landing') {
      const hasOrganization = organizations && organizations.length > 0;
      if (hasOrganization) {
        console.log('[CHZCLOTH] → dashboard');
        setScreen('dashboard');
      } else {
        console.log('[CHZCLOTH] → org setup');
        setScreen('orgsetup');
      }
    }
  }, [isAuthenticated, authLoading, orgsInitialized, organizations, screen]);

  const [companyGoals, setCompanyGoals] = useState([]);

  useEffect(() => {
    if (!currentOrg?.orgId) return;
    supabase
      .from('company_goals')
      .select('*')
      .eq('org_id', currentOrg.orgId)
      .order('priority', { ascending: true })
      .then(({ data }) => setCompanyGoals(data || []));
  }, [currentOrg?.orgId]);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleEmailSubmit = async (email) => {
    const { error } = await signInWithEmail(email);
    if (error) {
      console.error('Error sending magic link:', error);
      alert('Error sending login email. Please try again.');
    } else {
      setEmailSent(true);
    }
  };
  
  const handleProfileComplete = async (profileData) => {
    const { error } = await updateProfile(profileData);
    if (error) {
      console.error('Error updating profile:', error);
      alert('Error saving profile. Please try again.');
    } else {
      setScreen('bet');
    }
  };
const handleOrgSetupComplete = async ({ organization, userOrg, companyGoals, department, departmentGoals }) => {
    const { error } = await createOrganization({
      ...organization,
      companyGoals,
      department,
      departmentGoals
    }, userOrg);
    if (error) {
      console.error('Error creating organization:', error);
      alert('Error saving company. Please try again.');
    } else {
      setScreen('team');
    }
  };
  
const handleBetComplete = async (betData, ideaId = null) => {
  try {
    const orgLearnings = (currentOrg?.orgId && user?.id)
      ? await getOrgLearnings(currentOrg.orgId, user.id, 'bet')
      : [];

    const { data, error } = await createBet(betData, ideaId, null, currentOrg);

    if (error) {
      console.error('Error creating bet:', error);
      alert('Error saving bet. Please try again.');
    } else {
      setCurrentBet(data);
      setScreen('score');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving bet. Please try again.');
  }
};
  


const handleUseAIEnhancement = async () => {
  if (!currentBet.scoringRationale?.suggestion) return;
  
  const suggestion = currentBet.scoringRationale.suggestion;
  
  // Update bet in DB with AI enhancement AND predicted score
  const { error } = await supabase
    .from('bets')
    .update({
      hypothesis: suggestion.hypothesis,
      prediction: suggestion.metrics,
      estimated_effort: suggestion.effort,
      ai_enhanced: true,
      ai_predicted_score: suggestion.expected_score, // ← NEW: Save predicted score
      original_hypothesis: currentBet.hypothesis,
      // Also update the individual scores to match the AI suggestion
      approach_score: currentBet.scoringRationale.approach.score,
      potential_score: currentBet.scoringRationale.potential.score,
      fit_score: currentBet.scoringRationale.fit.score
    })
    .eq('id', currentBet.id);
  
  if (error) {
    console.error('Error updating bet:', error);
    alert('Error applying enhancement.');
  } else {
    // Update local state
    setCurrentBet({
      ...currentBet,
      hypothesis: suggestion.hypothesis,
      prediction: suggestion.metrics,
      estimatedEffort: suggestion.effort,
      aiEnhanced: true,
      aiPredictedScore: suggestion.expected_score, // ← NEW: Update local state
      originalHypothesis: currentBet.hypothesis
    });
  }
};
  
  const handleSavePersonal = () => {
  // Bet already saved to DB in handleBetComplete
  // Just navigate to dashboard
  setCurrentBet(null);
  setScreen('dashboard');
};

const handleAddToMarketplace = async () => {
  // Use AI-predicted score if available, otherwise calculate from components
  const overallScore = currentBet.aiPredictedScore 
    ? currentBet.aiPredictedScore
    : Math.round((currentBet.approachScore + currentBet.potentialScore + currentBet.fitScore) / 3);
  
  // Convert bet to marketplace Idea
const ideaEntry = {
  title: currentBet.title || currentBet.hypothesis?.substring(0, 100) || 'Untitled Bet',
  summary: currentBet.summary,  // ← Also add this
  description: `Hypothesis: ${currentBet.hypothesis}...`,
    entry_type: 'bet',
    bet_data: {
      ...currentBet,
      // Ensure AI enhancement metadata is preserved
      aiEnhanced: currentBet.aiEnhanced || false,
      aiPredictedScore: currentBet.aiPredictedScore || null,
      originalHypothesis: currentBet.originalHypothesis || null
    },
    viability_score: currentBet.approachScore,
    relevance_score: currentBet.fitScore,
    overall_score: overallScore, // ← Use AI score if available!
    scoring_rationale: currentBet.scoringRationale ? 
      `Approach: ${currentBet.scoringRationale.approach?.rationale}\nPotential: ${currentBet.scoringRationale.potential?.rationale}\nFit: ${currentBet.scoringRationale.fit?.rationale}` 
      : null,
    ai_enhanced: currentBet.aiEnhanced || false // ← Add flag at top level
  };
  
  const { error } = await submitIdea(ideaEntry);
  
  if (error) {
    console.error('Error submitting to marketplace:', error);
    alert('Error submitting to marketplace. Please try again.');
  } else {
    await supabase
      .from('bets')
      .update({ approval_status: 'pending_approval' })
      .eq('id', currentBet.id);
    refreshBets();
    alert('Bet added to marketplace!');
    setCurrentBet(null);
    setScreen('ideas_queue');
  }
};

  const handleAddToMarketplaceFromContributors = async (bet) => {
  const overallScore = bet.aiPredictedScore
    ? bet.aiPredictedScore
    : Math.round((bet.approachScore + bet.potentialScore + bet.fitScore) / 3);

  const ideaEntry = {
    title: bet.title || bet.hypothesis?.substring(0, 100) || 'Untitled Bet',
    summary: bet.summary,
    description: `Hypothesis: ${bet.hypothesis}`,
    entry_type: 'bet',
    bet_data: { ...bet, aiEnhanced: bet.aiEnhanced || false, aiPredictedScore: bet.aiPredictedScore || null },
    viability_score: bet.approachScore,
    relevance_score: bet.fitScore,
    overall_score: overallScore,
    ai_enhanced: bet.aiEnhanced || false
  };

const { error } = await submitIdea(ideaEntry);
  if (error) {
    alert('Error submitting to marketplace. Please try again.');
  } else {
    await supabase
      .from('bets')
      .update({ approval_status: 'pending_approval' })
      .eq('id', bet.id);
    refreshBets();
    alert('Bet added to marketplace!');
    setScreen('ideas_queue');
  }
};
  const handleRefineBet = () => {
  // User wants to refine their bet - go back to form with current data
  setScreen('bet');
};

  const handleWithdrawFromMarketplace = async (bet) => {
  const { error } = await withdrawFromMarketplace(bet.id);
  if (error) {
    alert('Error withdrawing from marketplace.');
  } else {
    await supabase
      .from('bets')
      .update({ approval_status: 'draft' })
      .eq('id', bet.id);
    refreshBets();
  }
};

const handleSubmitToMarketplace = async () => {
  const betData = currentBet;
  
  // Convert bet to marketplace entry
  const ideaEntry = {
    title: betData.hypothesis || 'Untitled Bet',
    description: `Hypothesis: ${betData.hypothesis}\n\nMetrics: ${betData.metrics || betData.prediction}\n\nEffort: ${betData.effort || betData.estimatedEffort}`,
    entry_type: 'bet',
    bet_data: betData,
    viability_score: betData.approachScore,
    relevance_score: betData.fitScore,
    overall_score: Math.round((betData.approachScore + betData.potentialScore + betData.fitScore) / 3),
    scoring_rationale: betData.scoringRationale ? 
      `Approach: ${betData.scoringRationale.approach?.rationale}\nPotential: ${betData.scoringRationale.potential?.rationale}\nFit: ${betData.scoringRationale.fit?.rationale}` 
      : null,
    market_context: betData.scoringRationale?.marketContext,
    risk_factors: betData.scoringRationale?.riskFactors,
    success_factors: betData.scoringRationale?.successFactors,
    refinement_count: betData.refinementCount || 0
  };

  const { data, error } = await submitIdea(ideaEntry);
  
  if (error) {
    console.error('Error submitting bet to marketplace:', error);
    alert('Error submitting bet. Please try again.');
  } else {
    setCurrentBet(null);
    setIsMarketplaceBet(false);
    setScreen('ideas_queue');
  }
};

  const handleMarketplaceBetComplete = async (betData) => {
  // Convert bet to marketplace entry
  const ideaEntry = {
    title: betData.hypothesis || 'Untitled Bet',
    description: `Hypothesis: ${betData.hypothesis}\n\nMetrics: ${betData.metrics}\n\nEffort: ${betData.effort}`,
    entry_type: 'bet',
    // Include the full bet data for later
    bet_data: {
      hypothesis: betData.hypothesis,
      metrics: betData.metrics,
      effort: betData.effort,
      approachScore: betData.approachScore,
      potentialScore: betData.potentialScore,
      fitScore: betData.fitScore,
      scoringRationale: betData.scoringRationale,
      aiEnhanced: bet.ai_enhanced,
aiPredictedScore: bet.ai_predicted_score,
originalHypothesis: bet.original_hypothesis,
approvalStatus: bet.approval_status,
    },
    viability_score: betData.approachScore,
    relevance_score: betData.fitScore,
    overall_score: Math.round((betData.approachScore + betData.potentialScore + betData.fitScore) / 3),
    scoring_rationale: betData.scoringRationale ? 
      `Approach: ${betData.scoringRationale.approach?.rationale}\nPotential: ${betData.scoringRationale.potential?.rationale}\nFit: ${betData.scoringRationale.fit?.rationale}` 
      : null
  };

  const { data, error } = await submitIdea(ideaEntry);
  
  if (error) {
    console.error('Error submitting bet to marketplace:', error);
    alert('Error submitting bet. Please try again.');
  } else {
    alert('Bet submitted to marketplace! Others can now sponsor it.');
    setScreen('ideas_queue');
  }
};
  
  const handleSeedBaseline = () => {
    setScreen('baseline');
  };
  
  const handleBaselineComplete = async (pastBetsData) => {
    const { error } = await createPastBets(pastBetsData);
    if (error) {
      console.error('Error saving past bets:', error);
      alert('Error saving past bets. Please try again.');
    }
    setScreen('dashboard');
  };
  
  const handleNewBet = () => {
    setCurrentBet(null);
    setScreen('bet');
  };
  
  const handleSkipToDashboard = () => {
    setScreen('dashboard');
  };
  
  const handleRecordOutcome = (bet) => {
    setBetToRecord(bet);
    setScreen('record_outcome');
  };
  
  const handleOutcomeComplete = async (updatedBet) => {
    const { error } = await recordOutcome(updatedBet.id, {
      actualResult: updatedBet.actualResult,
      status: updatedBet.status,
      learned: updatedBet.learned,
      wouldDoAgain: updatedBet.wouldDoAgain
    });
    if (error) {
      console.error('Error recording outcome:', error);
      alert('Error saving outcome. Please try again.');
    }
    setBetToRecord(null);
    setScreen('dashboard');
  };
  
  const handleOutcomeCancel = () => {
    setBetToRecord(null);
    setScreen('dashboard');
  };

  // ADD THESE HANDLERS after handleOutcomeCancel:

const handleSubmitIdea = () => {
  setScreen('ideas_queue');
  setNewEntryMode(true);
};

const handleViewIdeasQueue = () => {
  setScreen('ideas_queue');
};

const handleIdeaSubmitted = async (ideaData) => {
  if (!currentOrg?.orgId) {
    alert('No organization selected');
    return;
  }
  
  const { error } = await submitIdea(ideaData);
  if (error) {
    console.error('Error submitting idea:', error);
    alert('Error submitting idea. Please try again.');
  } else {
    setScreen('dashboard');
  }
};


const handleClaimAndStructure = async (idea) => {
  try {
    const betData = typeof idea.bet_data === 'string' 
      ? JSON.parse(idea.bet_data) 
      : idea.bet_data;
    
    if (!betData?.id) {
      throw new Error('No bet ID found in bet_data');
    }
    
    const { error: claimError } = await claimIdea(idea.id);
    if (claimError) throw claimError;

    const { error } = await supabase
      .from('bets')
      .update({ 
        approval_status: 'approved',
        sponsored_by: user.id
      })
      .eq('id', betData.id);
    
    if (error) throw error;
    await refreshBets();
    
    alert('Bet approved and added to Priority Queue!');
    setScreen('priority_queue');
    
  } catch (error) {
    console.error('Full error:', error);
    alert(`Error: ${error.message}`);
  }
};

      const handleApproveBet = async (betId) => {
  const { error } = await approveBet(betId);
  if (error) {
    console.error('Error approving bet:', error);
    alert('Error approving bet');
  }
};

const handleRejectBet = async (betId, reason) => {
  const { error } = await rejectBet(betId, reason);
  if (error) {
    console.error('Error rejecting bet:', error);
    alert('Error rejecting bet');
  }
};

  
  // FIX: Removed pendingDashboard (was set but never used in routing)
  const handleDashboardClick = () => {
    if (isAuthenticated) {
      setScreen('dashboard');
    } else {
      setScreen('email');
    }
  };
  
  const handleLogoClick = () => {
    if (isAuthenticated) {
      setScreen('dashboard');
    } else {
      setScreen('landing');
    }
  };

  const handleReplaceBet = (suggestedBet) => {
  // Store the suggested bet data
  setBetToReplace(suggestedBet);
  
  // Reset marketplace bet flag if needed
  // setIsMarketplaceBet(true); // Keep this if it was a marketplace bet
  
  // Go back to bet submission screen
  setScreen('bet');
  setCurrentBet(null);
};
  
  // ============================================
  // LOADING SCREEN
  // ============================================
  // Shows while auth resolves OR while authenticated + orgs haven't loaded.
  // Progressive messages handle Supabase free tier cold starts gracefully.
  // After 12 seconds, shows retry button instead of hanging forever.
  const isResolvingState = authLoading || (isAuthenticated && !orgsInitialized);
  if (isResolvingState) {
    let loadingContent;
    if (loadingElapsed < 4) {
      loadingContent = <div style={{ color: '#64748b' }}>Loading...</div>;
    } else if (loadingElapsed < 10) {
      loadingContent = <div style={{ color: '#64748b' }}>Waking up the server...</div>;
    } else {
      loadingContent = (
        <>
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>Taking longer than expected</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: 'rgba(45, 212, 191, 0.2)',
              border: '1px solid rgba(45, 212, 191, 0.4)',
              borderRadius: 8,
              color: '#2dd4bf',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Retry
          </button>
        </>
      );
    }
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {loadingContent}
      </div>
    );
  }
  
  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1929 50%, #0a0f1a 100%)' }}>
<AppHeader 
  isLoggedIn={isAuthenticated} 
  onDashboardClick={handleDashboardClick}
  onLogoClick={handleLogoClick}
  onNewBet={() => {
    setCurrentBet(null);
    setScreen('bet');
  }}
/>
      {screen === 'landing' && <Landing onStart={() => setScreen('email')} />}
      {screen === 'email' && <EmailAuth onComplete={handleEmailSubmit} emailSent={emailSent} />}
      {screen === 'profile' && <ProfileSetup onComplete={handleProfileComplete} />}
      {screen === 'orgsetup' && <OrganizationSetup onComplete={handleOrgSetupComplete} />}


{screen === 'bet' && (
  <BetSubmission
    onComplete={handleBetComplete}
    currentOrg={currentOrg}
    companyGoals={companyGoals}

  />
)}



{screen === 'score' && (
  <ScoreResult 
    bet={currentBet}
    onNewBet={handleNewBet}
    onSkipToDashboard={handleSkipToDashboard}
    onSavePersonal={handleSavePersonal}
    onAddToMarketplace={handleAddToMarketplace}
    onUseAI={handleUseAIEnhancement}
  />
)}
    {screen === 'baseline' && <SeedBaseline profile={profile} onComplete={handleBaselineComplete} />}
    {screen === 'record_outcome' && <RecordOutcome bet={betToRecord} onComplete={handleOutcomeComplete} onCancel={handleOutcomeCancel} />}
    {(screen === 'dashboard' || screen === 'ideas_queue' || screen === 'priority_queue' || screen === 'team' || screen === 'stats' || screen === 'outcomes') && (
      <div style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
      
{/* Organization switcher */}
<div style={{ marginBottom: 24 }}>
  <OrgSwitcher
    organizations={organizations || []}
    currentOrg={currentOrg}
    onSwitch={switchCurrentOrg}
    onAddOrg={() => setScreen('orgsetup')}
    onAddCompany={addCompanyToOrg}
    canInviteUsers={canInviteUsers}
  />
</div>

      {/* Tabs - always visible */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 40
      }}>
        <div style={{ display: 'flex', gap: 40, paddingLeft: 0 }}>
          <button
            onClick={() => setScreen('dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: screen === 'dashboard' ? '2px solid #7dd3fc' : '2px solid transparent',
              padding: '16px 0',
              color: screen === 'dashboard' ? '#e0e0e0' : '#666',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
  <span style={{ color: screen === 'team' ? '#7dd3fc' : '#555', fontSize: '0.85rem' }}>●</span>
            Your Queue
          </button>

          <button
  onClick={() => setScreen('outcomes')}
  style={{
    background: 'transparent',
    border: 'none',
    borderBottom: screen === 'outcomes' ? '2px solid #7dd3fc' : '2px solid transparent',
    padding: '16px 0',
    color: screen === 'outcomes' ? '#e0e0e0' : '#666',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}
>
<span style={{ color: screen === 'outcomes' ? '#7dd3fc' : '#555', fontSize: '0.85rem' }}>✦</span>
    Outcomes
</button>

          <button
            onClick={() => setScreen('priority_queue')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: screen === 'priority_queue' ? '2px solid #7dd3fc' : '2px solid transparent',
              padding: '16px 0',
              color: screen === 'priority_queue' ? '#e0e0e0' : '#666',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: screen === 'priority_queue' ? '#7dd3fc' : '#555', fontSize: '0.85rem' }}>▤</span>
            Priority Queue
          </button>

          <button
            onClick={() => setScreen('ideas_queue')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: screen === 'ideas_queue' ? '2px solid #7dd3fc' : '2px solid transparent',
              padding: '16px 0',
              color: screen === 'ideas_queue' ? '#e0e0e0' : '#666',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: screen === 'ideas_queue' ? '#7dd3fc' : '#555', fontSize: '0.85rem' }}>◎</span>
            Marketplace
          </button>

          <button
  onClick={() => setScreen('stats')}
  style={{
    background: 'transparent',
    border: 'none',
    borderBottom: screen === 'stats' ? '2px solid #7dd3fc' : '2px solid transparent',
    padding: '16px 0',
    color: screen === 'stats' ? '#e0e0e0' : '#666',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}
>
<span style={{ color: screen === 'stats' ? '#7dd3fc' : '#555', fontSize: '0.85rem' }}>⬡</span>  Stats
            
</button>
          <button
  onClick={() => setScreen('team')}
  style={{
    background: 'transparent',
    border: 'none',
    borderBottom: screen === 'team' ? '2px solid #7dd3fc' : '2px solid transparent',
    padding: '16px 0',
    color: screen === 'team' ? '#e0e0e0' : '#666',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}
>
<span style={{ color: screen === 'dashboard' ? '#7dd3fc' : '#555', fontSize: '0.85rem' }}>◆</span>
  Team
</button>
        </div>
      </div>

      {/* Content area swaps */}
{screen === 'dashboard' && (
  <Dashboard 
    profile={profile} 
    bets={bets} 
    currentOrg={currentOrg} 
    organizations={organizations} 
    onSwitchOrg={switchCurrentOrg} 
    onAddOrg={() => setScreen('orgsetup')} 
    onNewBet={handleNewBet} 
    email={user?.email}
    currentUserId={user?.id}
    onRecordOutcome={handleRecordOutcome}
    onAddToMarketplace={handleAddToMarketplaceFromContributors}
    onWithdrawFromMarketplace={handleWithdrawFromMarketplace}
    markStarted={markStarted}
    markCompleted={markCompleted}
    setScreen={setScreen}
  />
)}

      {console.log('Current screen state:', screen)}

{screen === 'team' && (
  <CompanyDashboard 
    currentOrg={currentOrg}
    isAdmin={isAdmin}
  />
)}
   {screen === 'outcomes' && (
  <OutcomesQueue bets={bets} />
)}

{screen === 'stats' && (
  <StatsScreen
    currentOrg={currentOrg}
    isAdmin={isAdmin}
  />
)}  
          
{screen === 'priority_queue' && (
  <PriorityQueue
    bets={bets}
    expandedPriorityBet={expandedPriorityBet}
    setExpandedPriorityBet={setExpandedPriorityBet}
    currentUserId={user?.id}
    onMarkStarted={markStarted}
    onMarkShipped={markCompleted}
    onRecordOutcome={recordOutcome}
  />
)}

{screen === 'ideas_queue' && (
  <IdeasQueue 
    ideas={ideas || []}
    loading={ideasLoading}
    currentOrg={currentOrg}
    currentUser={user}
    onClaimIdea={claimIdea}
    onUnclaimIdea={unclaimIdea}
    onClaimAndStructure={handleClaimAndStructure}
    setScreen={setScreen}
  />
)}
    

          
        </div>
      </div>
    )}
          {screen === 'sponsor_review' && (
      <SponsorReview
        bets={bets}
        currentOrg={currentOrg}
        onApprove={handleApproveBet}
        onReject={handleRejectBet}
        onCancel={() => setScreen('dashboard')}
      />
)}


    
    </div>
  );
}
