import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useBets } from './hooks/useBets';
import { useOrganizations } from './hooks/useOrganizations';
import { usePMValueIndex } from './hooks/usePMValueIndex';
import { OrganizationSetup, ContextCheck, shouldShowContextCheck, PMValueIndex, OrgSwitcher } from './components';

// ============================================
// CHZCLOTH Free - Where Bets Get Smarter
// ============================================

function AppHeader({ isLoggedIn, onDashboardClick, onLogoClick, showTeamsBanner = true }) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  return (
    <>
      {/* Teams upsell banner */}
      {showTeamsBanner && !bannerDismissed && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(45, 212, 191, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}>
          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            🚀 <strong style={{ color: '#2dd4bf' }}>CHZCLOTH for Teams</strong> — Decision Intelligence for Teams That Build.
          </span>
          <a 
            href="#teams" 
            style={{ 
              color: '#fbbf24', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Learn more →
          </a>
          <button
            onClick={() => setBannerDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '1rem',
              marginLeft: 8
            }}
          >
            ×
          </button>
        </div>
      )}
      
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
          {/* Dashboard icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          {isLoggedIn ? 'Dashboard' : 'Sign in'}
        </button>
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
  { value: "improve", label: "Improving something existing", desc: "Making something you already have work better" },
  { value: "test", label: "Running a test first", desc: "A cheap experiment before committing full resources" }
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
  // Has If/Then/Because structure
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
  
  // Action is specific (check hypothesis length and specificity)
  if (hypothesis.length > 100) {
    score.structural += 10;
    score.breakdown.push({ label: "Specific action described", points: 10 });
  } else if (hypothesis.length > 50) {
    score.structural += 5;
    score.breakdown.push({ label: "Action described", points: 5 });
  }
  
  // Mechanism articulated (because + explanation)
  if (hasBecause && hypothesis.split('because')[1]?.length > 30) {
    score.structural += 15;
    score.breakdown.push({ label: "Mechanism explained (because...)", points: 15 });
  } else if (hasBecause) {
    score.structural += 8;
    score.breakdown.push({ label: "Mechanism mentioned", points: 8 });
  }
  
  // Measurement (0-25)
  // Metric is quantifiable
  if (bet.metric) {
    score.measurement += 10;
    score.breakdown.push({ label: "Metric selected", points: 10 });
  }
  
  // Baseline known
  if (bet.baseline && bet.baseline.trim()) {
    score.measurement += 5;
    score.breakdown.push({ label: "Baseline provided", points: 5 });
  }
  
  // Prediction is specific (has numbers)
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
  // Bet type fits (test bets are good for uncertainty)
  if (bet.betType === 'test') {
    score.context += 5;
    score.breakdown.push({ label: "Testing before committing", points: 5 });
  } else if (bet.betType === 'improve') {
    score.context += 3;
    score.breakdown.push({ label: "Improving existing (lower risk)", points: 3 });
  }
  
  // Confidence calibration (extreme confidence is suspect)
  const confidence = bet.confidence || 70;
  if (confidence >= 60 && confidence <= 85) {
    score.context += 5;
    score.breakdown.push({ label: "Calibrated confidence level", points: 5 });
  } else if (confidence > 90) {
    score.context += 2;
    score.breakdown.push({ label: "High confidence (watch for overconfidence)", points: 2 });
  }
  
  // Timeframe appropriate
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
  // Handle null profile
  if (!profile) {
    return {
      peerAvg: 58,
      percentile: 50,
      description: "Complete your profile to see how you compare to peers."
    };
  }
  
  // Simulated peer data based on profile
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
      {/* Inline keyframes so animations always work */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 40px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -40px) scale(1.1); opacity: 1; }
        }
      `}</style>
      {/* Hero with animated background */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 140px)' }}>
        {/* Orbs + grid - hero only */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(45,212,191,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.07) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60vw', height: '60vw', maxWidth: 800, maxHeight: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.25) 0%, rgba(45,212,191,0.06) 40%, transparent 70%)', animation: 'float1 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-30%', left: '-15%', width: '50vw', height: '50vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)', animation: 'float2 25s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', left: '50%', width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 50%)', animation: 'float3 18s ease-in-out infinite' }} />
        </div>
        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px', minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
          CHZCLOTH Helps You Build Smarter Over Time.
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 650, marginBottom: 40 }}>
          Track product bets — yours or the ones you're asked to make. Measure outcomes. See what actually works.
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
              placeholder="you@company.com"
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
  const [mode, setMode] = useState(null); // null = choosing, 'company' = name/url, 'survey' = questions
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
  
  // Mode selection screen
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
  
  // Company name/website screen
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
  
  // Survey screen
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

function BetSubmission({ profile, onComplete }) {
  const [step, setStep] = useState(1);
  const [bet, setBet] = useState({
    metricDomain: '',
    metric: '',
    customMetric: '',
    betType: '',
    hypothesis: '',
    baseline: '',
    prediction: '',
    confidence: 70,
    timeframe: '90',
    assumptions: '',
    cheapTest: '',
    measurementTool: '',
    isOwnIdea: true,
    ideaSource: ''
  });
  
  const currentDomain = bet.metricDomain ? METRICS[bet.metricDomain] : null;
  const relevantExample = currentDomain?.examples.find(e => e.type === bet.betType);
  
  const stepLabels = ['Metric Area', 'Specific Metric', 'Bet Type', 'Ownership', 'Hypothesis', 'Prediction', 'Stress Test'];
  
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Submit Your Bet</span>
          <span style={{ color: '#475569', margin: '0 8px' }}>•</span>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{stepLabels[step - 1]}</span>
        </div>
        
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
          {[1,2,3,4,5,6,7].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)'
            }} />
          ))}
        </div>
        
        {/* Step 1: Metric domain */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              What are you trying to move?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Pick the domain that best matches your bet.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {Object.entries(METRICS).map(([key, domain]) => (
                <button
                  key={key}
                  onClick={() => { setBet({...bet, metricDomain: key}); setStep(2); }}
                  style={{
                    padding: '20px 16px',
                    background: bet.metricDomain === key ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${bet.metricDomain === key ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    color: '#f1f5f9',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Specific metric */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              Which metric specifically?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              This is how you'll know if your bet worked.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentDomain?.metrics.map(m => (
                <button
                  key={m}
                  onClick={() => { setBet({...bet, metric: m}); setStep(3); }}
                  style={{
                    padding: '14px 16px',
                    background: bet.metric === m ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${bet.metric === m ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    color: '#f1f5f9',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {m}
                </button>
              ))}
              <div style={{ marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Or type a custom metric..."
                  value={bet.customMetric}
                  onChange={e => setBet({...bet, customMetric: e.target.value})}
                  onKeyDown={e => { if (e.key === 'Enter' && bet.customMetric) { setBet({...bet, metric: bet.customMetric}); setStep(3); }}}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
            <button onClick={() => setStep(1)} style={{ marginTop: 24, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        )}
        
        {/* Step 3: Bet type */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              What are you doing?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              This affects how we evaluate your bet.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {BET_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => { setBet({...bet, betType: type.value}); setStep(4); }}
                  style={{
                    padding: '20px',
                    background: bet.betType === type.value ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${bet.betType === type.value ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>{type.label}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{type.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ marginTop: 24, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        )}
        
        {/* Step 4: Ownership */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              Whose bet is this?
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Track your own ideas or bets you're asked to make. Both are valuable data.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => { setBet({...bet, isOwnIdea: true, ideaSource: ''}); setStep(5); }}
                style={{
                  padding: '20px',
                  background: bet.isOwnIdea ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${bet.isOwnIdea ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>This is my idea</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>I came up with this and believe in it</div>
              </button>
              <button
                onClick={() => setBet({...bet, isOwnIdea: false})}
                style={{
                  padding: '20px',
                  background: !bet.isOwnIdea ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${!bet.isOwnIdea ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>I'm tracking someone else's bet</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Leadership, stakeholder, or team decision I'm executing</div>
              </button>
            </div>
            
            {!bet.isOwnIdea && (
              <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                  Whose idea is this? <span style={{ color: '#64748b' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={bet.ideaSource}
                  onChange={e => setBet({...bet, ideaSource: e.target.value})}
                  placeholder="e.g., VP Product, CEO, Customer Success team"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={() => setStep(5)}
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#0a0f1a',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Continue →
                </button>
              </div>
            )}
            
            <button onClick={() => setStep(3)} style={{ marginTop: 24, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        )}
        
        {/* Step 5: Hypothesis */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              Write your hypothesis
            </h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>
              Use the format: <span style={{ color: '#2dd4bf' }}>If</span> we [action], <span style={{ color: '#2dd4bf' }}>then</span> [outcome] <span style={{ color: '#2dd4bf' }}>because</span> [reason].
            </p>
            
            {relevantExample && (
              <div style={{ 
                background: 'rgba(251, 191, 36, 0.1)', 
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: 8, 
                padding: 16, 
                marginBottom: 24 
              }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>EXAMPLE</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  "{relevantExample.text}"
                </div>
              </div>
            )}
            
            <textarea
              value={bet.hypothesis}
              onChange={e => setBet({...bet, hypothesis: e.target.value})}
              placeholder="If we... then... because..."
              style={{
                width: '100%',
                minHeight: 120,
                padding: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: '1rem',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(4)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                ← Back
              </button>
              <button 
                onClick={() => setStep(6)}
                disabled={bet.hypothesis.length < 30}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: bet.hypothesis.length >= 30 ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  color: bet.hypothesis.length >= 30 ? '#0a0f1a' : '#475569',
                  fontWeight: 600,
                  cursor: bet.hypothesis.length >= 30 ? 'pointer' : 'not-allowed'
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}
        
        {/* Step 6: Prediction details */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              Make your prediction
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              What specifically will happen to <span style={{ color: '#2dd4bf' }}>{bet.metric}</span>?
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                Current baseline (if known)
              </label>
              <input
                type="text"
                value={bet.baseline}
                onChange={e => setBet({...bet, baseline: e.target.value})}
                placeholder="e.g., Currently at 45%"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                Your prediction *
              </label>
              <input
                type="text"
                value={bet.prediction}
                onChange={e => setBet({...bet, prediction: e.target.value})}
                placeholder="e.g., Will increase from 45% to 52%"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                Where will you measure this? <span style={{ color: '#64748b' }}>(optional)</span>
              </label>
              <select
                value={bet.measurementTool}
                onChange={e => setBet({...bet, measurementTool: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: bet.measurementTool ? '#f1f5f9' : '#64748b',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select measurement source...</option>
                {MEASUREMENT_TOOLS.map(tool => (
                  <option key={tool.value} value={tool.value}>{tool.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                When will you measure?
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setBet({...bet, timeframe: tf.value})}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: bet.timeframe === tf.value ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${bet.timeframe === tf.value ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 8,
                      color: bet.timeframe === tf.value ? '#2dd4bf' : '#94a3b8',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                How confident are you? <span style={{ color: '#2dd4bf' }}>{bet.confidence}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={bet.confidence}
                onChange={e => setBet({...bet, confidence: parseInt(e.target.value)})}
                style={{ width: '100%', accentColor: '#2dd4bf' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                <span>50% (coin flip)</span>
                <span>100% (certain)</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(5)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                ← Back
              </button>
              <button 
                onClick={() => setStep(7)}
                disabled={!bet.prediction}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: bet.prediction ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  color: bet.prediction ? '#0a0f1a' : '#475569',
                  fontWeight: 600,
                  cursor: bet.prediction ? 'pointer' : 'not-allowed'
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}
        
        {/* Step 7: Risk awareness (optional but scored) */}
        {step === 7 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
              Stress-test your thinking
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Optional, but these boost your score significantly.
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                What assumptions must be true? <span style={{ color: '#fbbf24' }}>+10 points</span>
              </label>
              <textarea
                value={bet.assumptions}
                onChange={e => setBet({...bet, assumptions: e.target.value})}
                placeholder="e.g., Users actually read their email. The digest content is interesting enough to click."
                style={{
                  width: '100%',
                  minHeight: 80,
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
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                What's a cheap test that could prove you wrong? <span style={{ color: '#fbbf24' }}>+10 points</span>
              </label>
              <textarea
                value={bet.cheapTest}
                onChange={e => setBet({...bet, cheapTest: e.target.value})}
                placeholder="e.g., Send a manual digest to 100 users and track open/return rate before building the full system."
                style={{
                  width: '100%',
                  minHeight: 80,
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
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(6)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                ← Back
              </button>
              <button 
                onClick={() => onComplete(bet)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#0a0f1a',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Get My Score →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreResult({ profile, bet, onNewBet, onSeedBaseline, onSkipToDashboard }) {
  const score = calculateScore(bet);
  const scoreInfo = getScoreLabel(score.total);
  const peerComparison = generatePeerComparison(profile, score.total);
  
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Score display */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: `conic-gradient(${scoreInfo.color} ${score.total * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            position: 'relative'
          }}>
            <div style={{
              width: 130, height: 130, borderRadius: '50%',
              background: '#0d1929',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: scoreInfo.color }}>{score.total}</div>
              <div style={{ fontSize: '0.9rem', color: scoreInfo.color, fontWeight: 600 }}>{scoreInfo.label}</div>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{scoreInfo.desc}</p>
        </div>
        
        {/* Peer comparison */}
        <div style={{
          background: 'rgba(45, 212, 191, 0.1)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#2dd4bf', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Peer Comparison
          </div>
          <div style={{ color: '#f1f5f9', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {peerComparison.description}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>
            Average score for your cohort: {peerComparison.peerAvg}
          </div>
        </div>
        
        {/* Score breakdown */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {score.breakdown.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8
              }}>
                <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                <span style={{ color: '#2dd4bf', fontWeight: 600 }}>+{item.points}</span>
              </div>
            ))}
          </div>
          
          {/* Missing points hint */}
          {score.total < 80 && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(251, 191, 36, 0.1)', borderRadius: 8 }}>
              <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Ways to improve</div>
              <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, paddingLeft: 20 }}>
                {!bet.hypothesis.toLowerCase().includes('because') && <li>Add a "because" to explain the mechanism</li>}
                {!bet.baseline && <li>Include the current baseline for your metric</li>}
                {!bet.assumptions && <li>Identify key assumptions (+10 points)</li>}
                {!bet.cheapTest && <li>Suggest a cheap test to validate (+10 points)</li>}
              </ul>
            </div>
          )}
        </div>
        
        {/* Your bet summary */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Your Bet</h3>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: bet.isOwnIdea ? '#2dd4bf' : '#fbbf24',
                background: bet.isOwnIdea ? 'rgba(45, 212, 191, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                padding: '4px 10px',
                borderRadius: 4
              }}>
                {bet.isOwnIdea ? 'Your idea' : `Tracking: ${bet.ideaSource || "someone else's bet"}`}
              </span>
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
        
        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={onSeedBaseline}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
              border: 'none',
              borderRadius: 10,
              color: '#0a0f1a',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Unlock My Accuracy Baseline →
          </button>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: '4px 0' }}>
            Tell us about 2-3 past bets to see your accuracy immediately
          </p>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={onNewBet}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#94a3b8',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Submit Another Bet
            </button>
            <button
              onClick={onSkipToDashboard}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#94a3b8',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
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
  
  // Calculate accuracy from completed past bets
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
        
        {/* Skip option */}
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
    status: '', // succeeded, partial, failed, inconclusive, never_shipped
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
            <span style={{
              fontSize: '0.7rem',
              color: bet.isOwnIdea !== false ? '#2dd4bf' : '#fbbf24',
              background: bet.isOwnIdea !== false ? 'rgba(45, 212, 191, 0.15)' : 'rgba(251, 191, 36, 0.15)',
              padding: '2px 8px',
              borderRadius: 4
            }}>
              {bet.isOwnIdea !== false ? 'your idea' : `tracking: ${bet.ideaSource || 'other'}`}
            </span>
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

function Dashboard({ profile, bets, currentOrg, organizations, pmValueIndex, onSwitchOrg, onEditMode, onAddOrg, onNewBet, email, onRecordOutcome }) {
  // Safeguard for undefined bets
  const safeBets = bets || [];
  
  const completedBets = safeBets.filter(b => b.outcome || b.status);
  const activeBets = safeBets.filter(b => !b.outcome && !b.status && !b.isPastBet);
  
  // Split by ownership (only count bets with actual outcomes)
  const betsWithOutcomes = safeBets.filter(b => ['succeeded', 'partial', 'failed'].includes(b.outcome) || ['succeeded', 'partial', 'failed'].includes(b.status));
  const ownIdeas = betsWithOutcomes.filter(b => b.isOwnIdea !== false);
  const othersIdeas = betsWithOutcomes.filter(b => b.isOwnIdea === false);
  
  // Calculate stats (using outcome for past bets, status for new bets)
  const getOutcome = (b) => b.status || b.outcome;
  const isSuccess = (b) => ['succeeded', 'partial'].includes(getOutcome(b));
  
  const totalAccuracy = betsWithOutcomes.length > 0
    ? Math.round((betsWithOutcomes.filter(isSuccess).length / betsWithOutcomes.length) * 100)
    : null;
  
  const ownAccuracy = ownIdeas.length >= 2
    ? Math.round((ownIdeas.filter(isSuccess).length / ownIdeas.length) * 100)
    : null;
    
  const othersAccuracy = othersIdeas.length >= 2
    ? Math.round((othersIdeas.filter(isSuccess).length / othersIdeas.length) * 100)
    : null;
  
  const avgScore = safeBets.filter(b => !b.isPastBet).length > 0
    ? Math.round(safeBets.filter(b => !b.isPastBet).reduce((sum, b) => sum + calculateScore(b).total, 0) / safeBets.filter(b => !b.isPastBet).length)
    : 0;
  
  const peerComparison = generatePeerComparison(profile, avgScore);
  
  return (
    <div style={{ padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* v2: Organization switcher */}
        <div style={{ marginBottom: 24 }}>
          <OrgSwitcher
            organizations={organizations || []}
            currentOrg={currentOrg}
            onSwitch={onSwitchOrg}
            onAddOrg={onAddOrg}
            onEditMode={(orgId) => {
              const newMode = prompt('Enter new mode (pmf, growth, efficiency, expansion, unsure):');
              if (newMode) onEditMode(orgId, newMode);
            }}
          />
        </div>
        
        {/* Action header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Your Dashboard</h1>
          <button
            onClick={onNewBet}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#0a0f1a',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + New Bet
          </button>
        </div>
        
        {/* v2: PM Value Index */}
        <PMValueIndex indexData={pmValueIndex} bets={safeBets} />
        
        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#2dd4bf', fontSize: '2.5rem', fontWeight: 800 }}>{totalAccuracy || '—'}%</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Accuracy</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: 800 }}>{safeBets.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Bets</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#fbbf24', fontSize: '2.5rem', fontWeight: 800 }}>{avgScore || '—'}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Avg Score</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#22d3ee', fontSize: '2.5rem', fontWeight: 800 }}>Top {100 - peerComparison.percentile}%</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>vs Peers</div>
          </div>
        </div>
        
        {/* Ownership split stats */}
        {(ownAccuracy !== null || othersAccuracy !== null) && (
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 40,
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16, fontWeight: 600 }}>Accuracy by Idea Source</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ color: '#2dd4bf', fontSize: '1.75rem', fontWeight: 700 }}>
                    {ownAccuracy !== null ? `${ownAccuracy}%` : '—'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({ownIdeas.length} bets)</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Your ideas</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.75rem', fontWeight: 700 }}>
                    {othersAccuracy !== null ? `${othersAccuracy}%` : '—'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({othersIdeas.length} bets)</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Others' ideas you tracked</div>
              </div>
            </div>
            {ownAccuracy !== null && othersAccuracy !== null && ownAccuracy > othersAccuracy && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(45, 212, 191, 0.1)', borderRadius: 8 }}>
                <span style={{ color: '#2dd4bf', fontSize: '0.85rem' }}>
                  💡 Your ideas succeed {ownAccuracy - othersAccuracy}% more often than ideas you execute for others.
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Active bets */}
        {activeBets.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>
              Active Bets ({activeBets.length})
            </h2>
            {activeBets.map((bet, i) => {
              const score = calculateScore(bet);
              const scoreInfo = getScoreLabel(score.total);
              return (
                <div key={bet.id || i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, marginRight: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: bet.isOwnIdea !== false ? '#2dd4bf' : '#fbbf24',
                          background: bet.isOwnIdea !== false ? 'rgba(45, 212, 191, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          padding: '2px 8px',
                          borderRadius: 4
                        }}>
                          {bet.isOwnIdea !== false ? 'Your idea' : `Tracking: ${bet.ideaSource || "other"}`}
                        </span>
                      </div>
                      <div style={{ color: '#f1f5f9', lineHeight: 1.5, marginBottom: 8 }}>{bet.hypothesis}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                        <span style={{ color: '#2dd4bf' }}>{bet.metric}</span>
                        <span style={{ color: '#64748b' }}>Measure in {bet.timeframe} days</span>
                      </div>
                    </div>
                    <div style={{
                      width: 50, height: 50, borderRadius: '50%',
                      background: `rgba(${scoreInfo.color === '#22c55e' ? '34,197,94' : scoreInfo.color === '#7dd3fc' ? '125,211,252' : '251,191,36'}, 0.2)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', flexShrink: 0
                    }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: scoreInfo.color }}>{score.total}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRecordOutcome(bet)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'rgba(45, 212, 191, 0.1)',
                      border: '1px solid rgba(45, 212, 191, 0.3)',
                      borderRadius: 8,
                      color: '#2dd4bf',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginTop: 8
                    }}
                  >
                    Record Outcome →
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Completed bets */}
        {completedBets.length > 0 && (
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>
              Completed Bets ({completedBets.length})
            </h2>
            {completedBets.map((bet, i) => {
              const status = bet.status || bet.outcome;
              const statusColors = {
                succeeded: '#22c55e',
                partial: '#fbbf24', 
                failed: '#f87171',
                inconclusive: '#64748b',
                never_shipped: '#475569',
                unknown: '#64748b'
              };
              const statusLabels = {
                succeeded: '✓ Succeeded',
                partial: '◐ Partial',
                failed: '✗ Failed',
                inconclusive: '? Inconclusive',
                never_shipped: '⊘ Never shipped',
                unknown: '? Unknown'
              };
              return (
                <div key={bet.id || i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ color: '#cbd5e1', flex: 1 }}>{bet.hypothesis || bet.description}</div>
                    <span style={{ 
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: `${statusColors[status]}22`,
                      color: statusColors[status],
                      flexShrink: 0,
                      marginLeft: 12
                    }}>
                      {statusLabels[status] || status}
                    </span>
                  </div>
                  {bet.learned && (
                    <div style={{ 
                      marginTop: 12, 
                      paddingTop: 12, 
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{ color: '#64748b' }}>Learned: </span>
                      <span style={{ color: '#94a3b8' }}>{bet.learned}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {safeBets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ color: '#64748b', marginBottom: 24 }}>No bets yet. Submit your first one!</div>
            <button
              onClick={onNewBet}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                border: 'none',
                borderRadius: 10,
                color: '#0a0f1a',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Submit a Bet →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const { user, profile, loading: authLoading, signInWithEmail, updateProfile, isAuthenticated } = useAuth();
  
  // v2: Organizations hook
  const { 
    organizations, 
    currentOrg, 
    loading: orgsLoading,
    createOrganization,
    updateCompanyMode,
    switchCurrentOrg,
    getContextCheck
  } = useOrganizations();
  
  // v2: Pass currentOrg?.orgId to useBets for filtering
  const { bets, loading: betsLoading, createBet, createPastBets, recordOutcome } = useBets(currentOrg?.orgId);
  
  // v2: PM Value Index
  const { index: pmValueIndex } = usePMValueIndex(currentOrg?.orgId);
  
  const [screen, setScreen] = useState('landing');
  const [currentBet, setCurrentBet] = useState(null);
  const [betToRecord, setBetToRecord] = useState(null);
  const [pendingDashboard, setPendingDashboard] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Safety valve: never show loading screen for more than 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);
  
  // Debug: log loading states so we can see what's stuck
  useEffect(() => {
    console.log('[CHZCLOTH] Auth loading:', authLoading, '| Orgs loading:', orgsLoading, '| User:', !!user, '| Orgs:', organizations?.length);
  }, [authLoading, orgsLoading, user, organizations]);
  
  // Check for magic link callback on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading && !orgsLoading) {
      // User is logged in
      if (pendingDashboard) {
        setPendingDashboard(false);
        setScreen('dashboard');
      } else if (screen === 'email' || screen === 'landing') {
        // v2: Check if user has organizations instead of profile check
        const hasOrganization = organizations && organizations.length > 0;
        if (hasOrganization) {
          setScreen('dashboard');
        } else {
          setScreen('orgsetup');
        }
      }
    }
  }, [isAuthenticated, authLoading, orgsLoading, organizations]);
  
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
  
  // v2: Handle organization setup completion
  const handleOrgSetupComplete = async ({ organization, userOrg }) => {
    const { error } = await createOrganization(organization, userOrg);
    if (error) {
      console.error('Error creating organization:', error);
      alert('Error saving company. Please try again.');
    } else {
      setScreen('bet');
    }
  };
  
  const handleBetComplete = async (betData) => {
    const { data, error } = await createBet(betData);
    if (error) {
      console.error('Error creating bet:', error);
      alert('Error saving bet. Please try again.');
    } else {
      setCurrentBet(data);
      setScreen('score');
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
  
  const handleDashboardClick = () => {
    if (isAuthenticated) {
      setScreen('dashboard');
    } else {
      setPendingDashboard(true);
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
  
  // Show loading state (but never for more than 4 seconds)
  const isStillLoading = (authLoading || orgsLoading) && !loadingTimeout;
  if (isStillLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1929 50%, #0a0f1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ color: '#64748b' }}>Loading...</div>
      </div>
    );
  }
  
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1929 50%, #0a0f1a 100%)' }}>
      <AppHeader 
        isLoggedIn={isAuthenticated} 
        onDashboardClick={handleDashboardClick}
        onLogoClick={handleLogoClick}
      />
      {screen === 'landing' && <Landing onStart={() => setScreen('email')} />}
      {screen === 'email' && <EmailAuth onComplete={handleEmailSubmit} emailSent={emailSent} />}
      {screen === 'profile' && <ProfileSetup onComplete={handleProfileComplete} />}
      {screen === 'orgsetup' && <OrganizationSetup onComplete={handleOrgSetupComplete} />}
      {screen === 'bet' && <BetSubmission profile={profile} currentOrg={currentOrg} onComplete={handleBetComplete} />}
      {screen === 'score' && <ScoreResult profile={profile} bet={currentBet} onNewBet={handleNewBet} onSeedBaseline={handleSeedBaseline} onSkipToDashboard={handleSkipToDashboard} />}
      {screen === 'baseline' && <SeedBaseline profile={profile} onComplete={handleBaselineComplete} />}
      {screen === 'record_outcome' && <RecordOutcome bet={betToRecord} onComplete={handleOutcomeComplete} onCancel={handleOutcomeCancel} />}
      {screen === 'dashboard' && <Dashboard profile={profile} bets={bets} currentOrg={currentOrg} organizations={organizations} pmValueIndex={pmValueIndex} onSwitchOrg={switchCurrentOrg} onEditMode={updateCompanyMode} onAddOrg={() => setScreen('orgsetup')} onNewBet={handleNewBet} email={user?.email} onRecordOutcome={handleRecordOutcome} />}
    </div>
  );
}
