import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { supabase } from './lib/supabase';

// ============================================
// AUTH CONTEXT (inline)
// ============================================
const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// ============================================
// ORGANIZATIONS HOOK (inline)
// ============================================
function useOrganizations() {
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrg(null);
      setInitialized(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          id, role, seniority, started_at, ended_at, is_current,
          organizations (id, name, website, stage, team_size, industry, current_mode)
        `)
        .eq('user_id', user.id)
        .order('is_current', { ascending: false });

      if (error) throw error;

      const transformed = (data || [])
        .filter(uo => uo.organizations)
        .map(uo => ({
          userOrgId: uo.id,
          orgId: uo.organizations.id,
          name: uo.organizations.name,
          website: uo.organizations.website,
          stage: uo.organizations.stage,
          teamSize: uo.organizations.team_size,
          industry: uo.organizations.industry,
          currentMode: uo.organizations.current_mode,
          role: uo.role,
          seniority: uo.seniority,
          isCurrent: uo.is_current
        }));

      setOrganizations(transformed);
      setCurrentOrg(transformed.find(o => o.isCurrent) || transformed[0] || null);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchOrganizations();
  }, [user, authLoading, fetchOrganizations]);

  const createOrganization = async (orgData, userOrgData) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          website: orgData.website,
          stage: orgData.stage,
          team_size: orgData.teamSize,
          industry: orgData.industry,
          current_mode: orgData.currentMode
        })
        .select()
        .single();

      if (orgError) throw orgError;

      await supabase
        .from('user_organizations')
        .update({ is_current: false })
        .eq('user_id', user.id)
        .eq('is_current', true);

      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          org_id: org.id,
          role: userOrgData.role,
          seniority: userOrgData.seniority,
          started_at: userOrgData.startedAt,
          is_current: true
        });

      if (userOrgError) throw userOrgError;

      await fetchOrganizations();
      return { data: org, error: null };
    } catch (err) {
      console.error('Error creating organization:', err);
      return { data: null, error: err };
    }
  };

  const switchCurrentOrg = async (orgId) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      await supabase
        .from('user_organizations')
        .update({ is_current: false })
        .eq('user_id', user.id);

      await supabase
        .from('user_organizations')
        .update({ is_current: true })
        .eq('user_id', user.id)
        .eq('org_id', orgId);

      await fetchOrganizations();
      return { error: null };
    } catch (err) {
      console.error('Error switching organization:', err);
      return { error: err };
    }
  };

  return {
    organizations,
    currentOrg,
    loading,
    initialized,
    createOrganization,
    switchCurrentOrg,
    hasOrganizations: organizations.length > 0
  };
}

// ============================================
// BETS HOOK (inline)
// ============================================
function useBets(orgId) {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBets = useCallback(async () => {
    if (!user) {
      setBets([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('bets')
        .select('*, outcomes (*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.or(`org_id.eq.${orgId},org_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformed = (data || []).map(bet => {
        const status = bet.is_past_bet ? bet.past_bet_outcome : bet.outcomes?.[0]?.status;
        return {
          id: bet.id,
          orgId: bet.org_id,
          hypothesis: bet.hypothesis,
          metricDomain: bet.metric_domain,
          metric: bet.metric,
          customMetric: bet.custom_metric,
          betType: bet.bet_type,
          baseline: bet.baseline,
          prediction: bet.prediction,
          confidence: bet.confidence,
          timeframe: bet.timeframe,
          assumptions: bet.assumptions,
          cheapTest: bet.cheap_test,
          isOwnIdea: bet.is_own_idea,
          ideaSource: bet.idea_source,
          measurementTool: bet.measurement_tool,
          isPastBet: !!bet.is_past_bet,
          createdAt: bet.created_at,
          outcome: status,
          status: status,
          actualResult: bet.is_past_bet ? bet.past_bet_actual_result : bet.outcomes?.[0]?.actual_result,
          learned: bet.is_past_bet ? bet.past_bet_learned : bet.outcomes?.[0]?.learned,
          wouldDoAgain: bet.outcomes?.[0]?.would_do_again,
          completedAt: bet.outcomes?.[0]?.recorded_at
        };
      });

      setBets(transformed);
    } catch (err) {
      console.error('Error fetching bets:', err);
    } finally {
      setLoading(false);
    }
  }, [user, orgId]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const createBet = async (betData) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          org_id: orgId || null,
          hypothesis: betData.hypothesis,
          metric_domain: betData.metricDomain,
          metric: betData.metric,
          custom_metric: betData.customMetric,
          bet_type: betData.betType,
          baseline: betData.baseline,
          prediction: betData.prediction,
          confidence: betData.confidence,
          timeframe: parseInt(betData.timeframe) || null,
          assumptions: betData.assumptions,
          cheap_test: betData.cheapTest,
          is_own_idea: betData.isOwnIdea !== false,
          idea_source: betData.ideaSource,
          measurement_tool: betData.measurementTool,
          is_past_bet: false
        })
        .select()
        .single();

      if (error) throw error;

      const newBet = { ...betData, id: data.id, orgId: data.org_id, createdAt: data.created_at };
      setBets(prev => [newBet, ...prev]);
      return { data: newBet, error: null };
    } catch (err) {
      console.error('Error creating bet:', err);
      return { data: null, error: err };
    }
  };

  const createPastBets = async (pastBetsData) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      const betsToInsert = pastBetsData
        .filter(b => b.hypothesis && b.outcome && b.learned)
        .map(bet => ({
          user_id: user.id,
          org_id: orgId || null,
          hypothesis: bet.hypothesis,
          metric_domain: bet.metricDomain,
          metric: bet.metric,
          prediction: bet.prediction,
          is_own_idea: bet.isOwnIdea !== false,
          idea_source: bet.ideaSource,
          is_past_bet: true,
          past_bet_outcome: bet.outcome,
          past_bet_actual_result: bet.actualResult,
          past_bet_learned: bet.learned,
          past_bet_timeframe: bet.timeframe
        }));

      if (betsToInsert.length === 0) return { data: [], error: null };

      const { data, error } = await supabase.from('bets').insert(betsToInsert).select();
      if (error) throw error;

      await fetchBets();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating past bets:', err);
      return { data: null, error: err };
    }
  };

  const recordOutcome = async (betId, outcomeData) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('outcomes')
        .insert({
          bet_id: betId,
          user_id: user.id,
          actual_result: outcomeData.actualResult,
          status: outcomeData.status,
          learned: outcomeData.learned,
          would_do_again: outcomeData.wouldDoAgain
        })
        .select()
        .single();

      if (error) throw error;

      setBets(prev => prev.map(bet =>
        bet.id === betId
          ? { ...bet, status: outcomeData.status, outcome: outcomeData.status, actualResult: outcomeData.actualResult, learned: outcomeData.learned, wouldDoAgain: outcomeData.wouldDoAgain, completedAt: data.recorded_at }
          : bet
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error recording outcome:', err);
      return { data: null, error: err };
    }
  };

  const getStats = useCallback(() => {
    const completed = bets.filter(b => ['succeeded', 'partial', 'failed'].includes(b.status));
    const ownIdeas = completed.filter(b => b.isOwnIdea !== false);
    const othersIdeas = completed.filter(b => b.isOwnIdea === false);
    const isSuccess = b => ['succeeded', 'partial'].includes(b.status);

    return {
      totalBets: bets.length,
      completedBets: completed.length,
      activeBets: bets.filter(b => !b.status && !b.isPastBet).length,
      accuracy: completed.length > 0 ? Math.round((completed.filter(isSuccess).length / completed.length) * 100) : null,
      ownIdeasCount: ownIdeas.length,
      ownIdeasAccuracy: ownIdeas.length >= 2 ? Math.round((ownIdeas.filter(isSuccess).length / ownIdeas.length) * 100) : null,
      othersIdeasCount: othersIdeas.length,
      othersIdeasAccuracy: othersIdeas.length >= 2 ? Math.round((othersIdeas.filter(isSuccess).length / othersIdeas.length) * 100) : null
    };
  }, [bets]);

  return { bets, loading, createBet, createPastBets, recordOutcome, refreshBets: fetchBets, getStats };
}

// ============================================
// CONSTANTS
// ============================================
const METRICS = {
  retention: { label: "Retention / Engagement", metrics: ["Churn rate", "Retention rate (7/30/90 day)", "DAU/MAU ratio", "Session frequency", "Time in app", "Feature stickiness"], examples: [{ type: "new", text: "If we add a weekly digest email, then 30-day retention will increase from 45% to 52% because users will have a reason to return even when they forget about us." }] },
  growth: { label: "Growth / Acquisition", metrics: ["Signups", "Visitor→signup conversion", "CAC", "Referral rate", "Organic traffic", "Activation rate"], examples: [{ type: "new", text: "If we launch a referral program with $20 credit, then referral-sourced signups will reach 15% of total new users within 90 days." }] },
  monetization: { label: "Monetization", metrics: ["Revenue/MRR", "ARPU", "Free→paid conversion", "LTV", "Pricing page conversion", "Expansion revenue"], examples: [{ type: "new", text: "If we add annual billing at 20% discount, then 30% of new subscribers will choose annual within 6 months." }] },
  product: { label: "Product / Experience", metrics: ["NPS", "CSAT", "Feature adoption", "Task completion rate", "Support tickets", "Time to complete"], examples: [{ type: "new", text: "If we add keyboard shortcuts for power users, then NPS among daily-active users will increase from 42 to 50." }] },
  operations: { label: "Operations / Internal", metrics: ["Cycle time", "Throughput", "Cost per X", "Time saved", "Error rate", "Manual hours"], examples: [{ type: "new", text: "If we automate invoice generation, then finance will save 15 hours/month and error rate will drop from 8% to <1%." }] },
  platform: { label: "Platform / Infrastructure", metrics: ["Page load time", "Uptime", "API latency", "Deploy frequency", "Error rate", "Infrastructure cost"], examples: [{ type: "new", text: "If we add a CDN for static assets, then p95 page load will drop from 3.2s to 1.5s." }] }
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
  { value: "new", label: "Building something new", desc: "A new feature, capability, or initiative" },
  { value: "improve", label: "Improving something existing", desc: "Making something you already have work better" },
  { value: "test", label: "Running a test first", desc: "A cheap experiment before committing" }
];

const TIMEFRAMES = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" }
];

// ============================================
// SCORING
// ============================================
function calculateScore(bet) {
  let score = { structural: 0, measurement: 0, risk: 0, context: 0, total: 0, breakdown: [] };
  if (!bet || !bet.hypothesis) return score;

  const hypothesis = bet.hypothesis || '';
  const hasIf = hypothesis.toLowerCase().includes('if ');
  const hasThen = hypothesis.toLowerCase().includes('then ');
  const hasBecause = hypothesis.toLowerCase().includes('because');

  if (hasIf && hasThen) { score.structural += 15; score.breakdown.push({ label: "Hypothesis structure (If/Then)", points: 15 }); }
  if (hypothesis.length > 100) { score.structural += 10; score.breakdown.push({ label: "Specific action described", points: 10 }); }
  if (hasBecause && hypothesis.split('because')[1]?.length > 30) { score.structural += 15; score.breakdown.push({ label: "Mechanism explained", points: 15 }); }
  if (bet.metric) { score.measurement += 10; score.breakdown.push({ label: "Metric selected", points: 10 }); }
  if (bet.baseline?.trim()) { score.measurement += 5; score.breakdown.push({ label: "Baseline provided", points: 5 }); }
  if (/\d+/.test(bet.prediction) && /%/.test(bet.prediction)) { score.measurement += 10; score.breakdown.push({ label: "Quantified prediction", points: 10 }); }
  if (bet.assumptions?.trim().length > 20) { score.risk += 10; score.breakdown.push({ label: "Assumptions identified", points: 10 }); }
  if (bet.cheapTest?.trim().length > 20) { score.risk += 10; score.breakdown.push({ label: "Cheap test identified", points: 10 }); }
  if (bet.betType === 'test') { score.context += 5; score.breakdown.push({ label: "Testing before committing", points: 5 }); }
  if (bet.confidence >= 60 && bet.confidence <= 85) { score.context += 5; score.breakdown.push({ label: "Calibrated confidence", points: 5 }); }
  if (bet.timeframe) { score.context += 5; score.breakdown.push({ label: "Timeframe set", points: 5 }); }

  score.total = score.structural + score.measurement + score.risk + score.context;
  return score;
}

function getScoreLabel(score) {
  if (score >= 80) return { label: "Strong", color: "#22c55e", desc: "Well-structured bet" };
  if (score >= 60) return { label: "Solid", color: "#7dd3fc", desc: "Good foundation" };
  if (score >= 40) return { label: "Developing", color: "#fbbf24", desc: "Some areas to sharpen" };
  return { label: "Needs Work", color: "#f87171", desc: "Missing critical elements" };
}

// ============================================
// COMPONENTS
// ============================================

function AppHeader({ isLoggedIn, onDashboardClick, onLogoClick }) {
  return (
    <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10, 15, 26, 0.8)' }}>
      <button onClick={onLogoClick} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHZCLOTH</span>
      </button>
      <button onClick={onDashboardClick} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem' }}>
        {isLoggedIn ? 'Dashboard' : 'Sign in'}
      </button>
    </div>
  );
}

function Landing({ onStart }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>More Cheese. Less Waste.</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 24 }}>CHZCLOTH Helps You Build Smarter Over Time.</h1>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 650, marginBottom: 40 }}>Track product bets — yours or the ones you're asked to make. Measure outcomes. See what actually works.</p>
      <button onClick={onStart} style={{ padding: '16px 40px', fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', color: '#0a0f1a', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
        Submit Your First Bet →
      </button>
    </div>
  );
}

function EmailAuth({ onComplete, emailSent }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const isValid = email.includes('@') && email.includes('.');

  const handleSubmit = async () => {
    if (isValid && !sending) {
      setSending(true);
      await onComplete(email);
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', padding: '60px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {!emailSent ? (
          <>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Save your bets</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>Enter your email to track bets over time.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="you@company.com" style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: '1.1rem', textAlign: 'center', marginBottom: 16 }} />
            <button onClick={handleSubmit} disabled={!isValid || sending} style={{ width: '100%', padding: '14px 24px', fontSize: '1rem', fontWeight: 600, background: isValid ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', color: isValid ? '#0a0f1a' : '#475569', border: 'none', borderRadius: 10, cursor: isValid ? 'pointer' : 'not-allowed' }}>
              {sending ? 'Sending...' : 'Continue →'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: 24 }}>✉️</div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: 12 }}>Check your email</h2>
            <p style={{ color: '#64748b' }}>We sent a magic link to <strong style={{ color: '#2dd4bf' }}>{email}</strong></p>
          </>
        )}
      </div>
    </div>
  );
}

function OrganizationSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [org, setOrg] = useState({ name: '', website: '', stage: '', teamSize: '', industry: '', currentMode: '' });
  const [userOrg, setUserOrg] = useState({ role: '', seniority: '' });

  const SelectField = ({ label, options, value, onChange }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: value ? '#f1f5f9' : '#64748b', fontSize: '1rem', cursor: 'pointer' }}>
        <option value="">Select...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  if (step === 1) {
    const canContinue = org.name.trim().length > 1;
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>What company are you at?</h1>
          <p style={{ color: '#64748b', marginBottom: 32 }}>We use this to organize your bets.</p>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>Company name *</label>
            <input type="text" value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} placeholder="e.g., Acme Corp" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>Website (optional)</label>
            <input type="text" value={org.website} onChange={e => setOrg({ ...org, website: e.target.value })} placeholder="e.g., acme.com" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem' }} />
          </div>
          <SelectField label="Company stage" options={COMPANY_STAGE} value={org.stage} onChange={v => setOrg({ ...org, stage: v })} />
          <SelectField label="Team size" options={TEAM_SIZE} value={org.teamSize} onChange={v => setOrg({ ...org, teamSize: v })} />
          <SelectField label="Industry" options={INDUSTRY} value={org.industry} onChange={v => setOrg({ ...org, industry: v })} />
          <button onClick={() => setStep(2)} disabled={!canContinue} style={{ width: '100%', padding: '16px', background: canContinue ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', color: canContinue ? '#0a0f1a' : '#475569', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 600, cursor: canContinue ? 'pointer' : 'not-allowed', marginTop: 16 }}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const canFinish = userOrg.role && userOrg.seniority;
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 24 }}>← Back</button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Tell us about your role</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>This helps us personalize your experience.</p>
        <SelectField label="What's your role?" options={ROLES} value={userOrg.role} onChange={v => setUserOrg({ ...userOrg, role: v })} />
        <SelectField label="What's your level?" options={SENIORITY} value={userOrg.seniority} onChange={v => setUserOrg({ ...userOrg, seniority: v })} />
        <button onClick={() => onComplete({ organization: org, userOrg })} disabled={!canFinish} style={{ width: '100%', padding: '16px', background: canFinish ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', color: canFinish ? '#0a0f1a' : '#475569', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 600, cursor: canFinish ? 'pointer' : 'not-allowed', marginTop: 16 }}>
          Get Started →
        </button>
      </div>
    </div>
  );
}

function BetSubmission({ currentOrg, onComplete }) {
  const [step, setStep] = useState(1);
  const [bet, setBet] = useState({ metricDomain: '', metric: '', customMetric: '', betType: '', hypothesis: '', baseline: '', prediction: '', confidence: 70, timeframe: '90', assumptions: '', cheapTest: '', measurementTool: '', isOwnIdea: true, ideaSource: '' });

  const currentDomain = bet.metricDomain ? METRICS[bet.metricDomain] : null;
  const relevantExample = currentDomain?.examples.find(e => e.type === bet.betType || e.type === 'new');

  // Step 1: Metric domain
  if (step === 1) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>What are you trying to move?</h2>
          <p style={{ color: '#64748b', marginBottom: 32 }}>Pick the domain that best matches your bet.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {Object.entries(METRICS).map(([key, domain]) => (
              <button key={key} onClick={() => { setBet({...bet, metricDomain: key}); setStep(2); }} style={{ padding: '20px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                {domain.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Specific metric
  if (step === 2) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Which metric specifically?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentDomain?.metrics.map(m => (
              <button key={m} onClick={() => { setBet({...bet, metric: m}); setStep(3); }} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}>{m}</button>
            ))}
          </div>
          <button onClick={() => setStep(1)} style={{ marginTop: 24, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
        </div>
      </div>
    );
  }

  // Step 3: Bet type
  if (step === 3) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>What are you doing?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BET_TYPES.map(type => (
              <button key={type.value} onClick={() => { setBet({...bet, betType: type.value}); setStep(4); }} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>{type.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{type.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{ marginTop: 24, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
        </div>
      </div>
    );
  }

  // Step 4: Ownership
  if (step === 4) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Whose bet is this?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => { setBet({...bet, isOwnIdea: true, ideaSource: ''}); setStep(5); }} style={{ padding: '20px', background: bet.isOwnIdea ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${bet.isOwnIdea ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>This is my idea</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>I came up with this and believe in it</div>
            </button>
            <button onClick={() => setBet({...bet, isOwnIdea: false})} style={{ padding: '20px', background: !bet.isOwnIdea ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${!bet.isOwnIdea ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>I'm tracking someone else's bet</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Leadership, stakeholder, or team decision</div>
            </button>
          </div>
          {!bet.isOwnIdea && (
            <div style={{ marginTop: 20 }}>
              <input type="text" value={bet.ideaSource} onChange={e => setBet({...bet, ideaSource: e.target.value})} placeholder="Who? (e.g., VP Product)" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem' }} />
              <button onClick={() => setStep(5)} style={{ width: '100%', marginTop: 16, padding: '14px 20px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 8, color: '#0a0f1a', fontWeight: 600, cursor: 'pointer' }}>Continue →</button>
            </div>
          )}
          <button onClick={() => setStep(3)} style={{ marginTop: 24, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
        </div>
      </div>
    );
  }

  // Step 5: Hypothesis
  if (step === 5) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Write your hypothesis</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Format: <span style={{ color: '#2dd4bf' }}>If</span> we [action], <span style={{ color: '#2dd4bf' }}>then</span> [outcome] <span style={{ color: '#2dd4bf' }}>because</span> [reason].</p>
          {relevantExample && (
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>EXAMPLE</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>"{relevantExample.text}"</div>
            </div>
          )}
          <textarea value={bet.hypothesis} onChange={e => setBet({...bet, hypothesis: e.target.value})} placeholder="If we... then... because..." style={{ width: '100%', minHeight: 120, padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem', lineHeight: 1.6, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={() => setStep(4)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>← Back</button>
            <button onClick={() => setStep(6)} disabled={bet.hypothesis.length < 30} style={{ flex: 1, padding: '12px 20px', background: bet.hypothesis.length >= 30 ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: bet.hypothesis.length >= 30 ? '#0a0f1a' : '#475569', fontWeight: 600, cursor: bet.hypothesis.length >= 30 ? 'pointer' : 'not-allowed' }}>Continue →</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Prediction
  if (step === 6) {
    return (
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Make your prediction</h2>
          <p style={{ color: '#64748b', marginBottom: 32 }}>What specifically will happen to <span style={{ color: '#2dd4bf' }}>{bet.metric}</span>?</p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>Current baseline (if known)</label>
            <input type="text" value={bet.baseline} onChange={e => setBet({...bet, baseline: e.target.value})} placeholder="e.g., Currently at 45%" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>Your prediction *</label>
            <input type="text" value={bet.prediction} onChange={e => setBet({...bet, prediction: e.target.value})} placeholder="e.g., Will increase from 45% to 52%" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>When will you measure?</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {TIMEFRAMES.map(tf => (
                <button key={tf.value} onClick={() => setBet({...bet, timeframe: tf.value})} style={{ flex: 1, padding: '12px', background: bet.timeframe === tf.value ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${bet.timeframe === tf.value ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, color: bet.timeframe === tf.value ? '#2dd4bf' : '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>{tf.label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>Confidence: <span style={{ color: '#2dd4bf' }}>{bet.confidence}%</span></label>
            <input type="range" min="50" max="100" value={bet.confidence} onChange={e => setBet({...bet, confidence: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#2dd4bf' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={() => setStep(5)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>← Back</button>
            <button onClick={() => setStep(7)} disabled={!bet.prediction} style={{ flex: 1, padding: '12px 20px', background: bet.prediction ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: bet.prediction ? '#0a0f1a' : '#475569', fontWeight: 600, cursor: bet.prediction ? 'pointer' : 'not-allowed' }}>Continue →</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Stress test
  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>{[1,2,3,4,5,6,7].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#2dd4bf' : 'rgba(255,255,255,0.1)' }} />)}</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Stress-test your thinking</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Optional, but these boost your score significantly.</p>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>What assumptions must be true? <span style={{ color: '#fbbf24' }}>+10 points</span></label>
          <textarea value={bet.assumptions} onChange={e => setBet({...bet, assumptions: e.target.value})} placeholder="e.g., Users actually read their email..." style={{ width: '100%', minHeight: 80, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem', resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>What's a cheap test? <span style={{ color: '#fbbf24' }}>+10 points</span></label>
          <textarea value={bet.cheapTest} onChange={e => setBet({...bet, cheapTest: e.target.value})} placeholder="e.g., Send a manual test to 100 users first..." style={{ width: '100%', minHeight: 80, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={() => setStep(6)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>← Back</button>
          <button onClick={() => onComplete(bet)} style={{ flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 8, color: '#0a0f1a', fontWeight: 700, cursor: 'pointer' }}>Get My Score →</button>
        </div>
      </div>
    </div>
  );
}

function ScoreResult({ bet, onNewBet, onSeedBaseline, onSkipToDashboard }) {
  const score = calculateScore(bet);
  const scoreInfo = getScoreLabel(score.total);

  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%', background: `conic-gradient(${scoreInfo.color} ${score.total * 3.6}deg, rgba(255,255,255,0.1) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#0d1929', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: scoreInfo.color }}>{score.total}</div>
              <div style={{ fontSize: '0.9rem', color: scoreInfo.color, fontWeight: 600 }}>{scoreInfo.label}</div>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{scoreInfo.desc}</p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {score.breakdown.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                <span style={{ color: '#2dd4bf', fontWeight: 600 }}>+{item.points}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={onSeedBaseline} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 10, color: '#0a0f1a', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            Unlock My Accuracy Baseline →
          </button>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Tell us about 2-3 past bets to see your accuracy</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={onNewBet} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}>Submit Another</button>
            <button onClick={onSkipToDashboard} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeedBaseline({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pastBets, setPastBets] = useState([
    { isOwnIdea: true, ideaSource: '', hypothesis: '', metricDomain: '', metric: '', prediction: '', outcome: '', learned: '' },
    { isOwnIdea: true, ideaSource: '', hypothesis: '', metricDomain: '', metric: '', prediction: '', outcome: '', learned: '' },
    { isOwnIdea: true, ideaSource: '', hypothesis: '', metricDomain: '', metric: '', prediction: '', outcome: '', learned: '' }
  ]);

  const current = pastBets[currentIndex];
  const updateCurrent = (field, value) => {
    const updated = [...pastBets];
    updated[currentIndex] = { ...updated[currentIndex], [field]: value };
    setPastBets(updated);
  };

  const isComplete = current.hypothesis.length >= 20 && current.metric && current.outcome && current.learned.length >= 10;
  const completedBets = pastBets.filter(b => b.hypothesis && b.outcome && b.learned);
  const canFinish = completedBets.length >= 2;

  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <button key={i} onClick={() => setCurrentIndex(i)} style={{ width: 40, height: 40, borderRadius: '50%', background: pastBets[i].outcome ? 'rgba(45, 212, 191, 0.2)' : i === currentIndex ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: `2px solid ${i === currentIndex ? '#2dd4bf' : pastBets[i].outcome ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`, color: pastBets[i].outcome ? '#2dd4bf' : '#f1f5f9', fontWeight: 600, cursor: 'pointer' }}>
              {pastBets[i].outcome ? '✓' : i + 1}
            </button>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Past Bet {currentIndex + 1}</h2>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>What was the hypothesis? *</label>
          <textarea value={current.hypothesis} onChange={e => updateCurrent('hypothesis', e.target.value)} placeholder="If we... then... because..." style={{ width: '100%', minHeight: 80, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>Metric *</label>
          <input type="text" value={current.metric} onChange={e => updateCurrent('metric', e.target.value)} placeholder="e.g., Retention rate" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '1rem' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10 }}>What happened? *</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ value: 'succeeded', label: 'Succeeded', color: '#22c55e' }, { value: 'partial', label: 'Partially', color: '#fbbf24' }, { value: 'failed', label: 'Failed', color: '#f87171' }].map(opt => (
              <button key={opt.value} onClick={() => updateCurrent('outcome', opt.value)} style={{ padding: '10px 16px', background: current.outcome === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.03)', border: `1px solid ${current.outcome === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, color: current.outcome === opt.value ? opt.color : '#94a3b8', cursor: 'pointer' }}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>What did you learn? *</label>
          <textarea value={current.learned} onChange={e => updateCurrent('learned', e.target.value)} placeholder="What would you do differently?" style={{ width: '100%', minHeight: 80, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem' }} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {currentIndex > 0 && <button onClick={() => setCurrentIndex(currentIndex - 1)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>← Previous</button>}
          <div style={{ flex: 1 }} />
          {currentIndex < 2 && <button onClick={() => setCurrentIndex(currentIndex + 1)} disabled={!isComplete} style={{ padding: '12px 24px', background: isComplete ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: isComplete ? '#0a0f1a' : '#475569', fontWeight: 600, cursor: isComplete ? 'pointer' : 'not-allowed' }}>Next Bet →</button>}
        </div>

        {canFinish && (
          <button onClick={() => onComplete(pastBets)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 10, color: '#0a0f1a', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            See My Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}

function RecordOutcome({ bet, onComplete, onCancel }) {
  const [outcome, setOutcome] = useState({ actualResult: '', status: '', learned: '', wouldDoAgain: null });

  const statusOptions = [
    { value: 'succeeded', label: 'Succeeded', color: '#22c55e' },
    { value: 'partial', label: 'Partially succeeded', color: '#fbbf24' },
    { value: 'failed', label: 'Failed', color: '#f87171' },
    { value: 'inconclusive', label: 'Inconclusive', color: '#64748b' }
  ];

  const isComplete = outcome.status && outcome.learned.length >= 10;

  return (
    <div style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 32 }}>Record the outcome</h1>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 8 }}>YOUR BET</div>
          <div style={{ color: '#f1f5f9', lineHeight: 1.6 }}>{bet.hypothesis}</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>What actually happened?</label>
          <input type="text" value={outcome.actualResult} onChange={e => setOutcome({ ...outcome, actualResult: e.target.value })} placeholder="e.g., Went from 45% to 48%" style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>How would you call it? *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {statusOptions.map(opt => (
              <button key={opt.value} onClick={() => setOutcome({ ...outcome, status: opt.value })} style={{ padding: '14px 16px', background: outcome.status === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${outcome.status === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, textAlign: 'left', cursor: 'pointer', color: outcome.status === opt.value ? opt.color : '#f1f5f9' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>What did you learn? *</label>
          <textarea value={outcome.learned} onChange={e => setOutcome({ ...outcome, learned: e.target.value })} placeholder="What would you do differently?" style={{ width: '100%', minHeight: 100, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.95rem', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}>Later</button>
          <button onClick={() => onComplete({ ...bet, ...outcome })} disabled={!isComplete} style={{ flex: 1, padding: '14px 20px', background: isComplete ? 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, color: isComplete ? '#0a0f1a' : '#475569', fontSize: '1rem', fontWeight: 600, cursor: isComplete ? 'pointer' : 'not-allowed' }}>
            Save Outcome →
          </button>
        </div>
      </div>
    </div>
  );
}

function OrgSwitcher({ organizations, currentOrg, onSwitch }) {
  const [open, setOpen] = useState(false);

  if (organizations.length <= 1) {
    return currentOrg ? <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 16 }}>{currentOrg.name}</div> : null;
  }

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
        {currentOrg?.name || 'Select company'}
        <span style={{ color: '#64748b' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', zIndex: 10, minWidth: 200 }}>
          {organizations.map(org => (
            <button key={org.orgId} onClick={() => { onSwitch(org.orgId); setOpen(false); }} style={{ width: '100%', padding: '12px 16px', background: org.orgId === currentOrg?.orgId ? 'rgba(45, 212, 191, 0.1)' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: org.orgId === currentOrg?.orgId ? '#2dd4bf' : '#f1f5f9' }}>
              {org.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ bets, currentOrg, organizations, onSwitchOrg, onNewBet, onRecordOutcome }) {
  const stats = {
    totalBets: bets.length,
    activeBets: bets.filter(b => !b.status && !b.isPastBet).length,
    completedBets: bets.filter(b => b.status).length,
    accuracy: (() => {
      const completed = bets.filter(b => ['succeeded', 'partial', 'failed'].includes(b.status));
      if (completed.length === 0) return null;
      const wins = completed.filter(b => ['succeeded', 'partial'].includes(b.status)).length;
      return Math.round((wins / completed.length) * 100);
    })()
  };

  const activeBets = bets.filter(b => !b.status && !b.isPastBet);
  const completedBets = bets.filter(b => b.status);

  return (
    <div style={{ padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <OrgSwitcher organizations={organizations} currentOrg={currentOrg} onSwitch={onSwitchOrg} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Your Dashboard</h1>
          <button onClick={onNewBet} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 8, color: '#0a0f1a', fontWeight: 600, cursor: 'pointer' }}>+ New Bet</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 40 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#2dd4bf', fontSize: '2.5rem', fontWeight: 800 }}>{stats.accuracy ?? '—'}%</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Accuracy</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: 800 }}>{stats.totalBets}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Bets</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#fbbf24', fontSize: '2.5rem', fontWeight: 800 }}>{stats.activeBets}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Active</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontSize: '2.5rem', fontWeight: 800 }}>{stats.completedBets}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Completed</div>
          </div>
        </div>

        {activeBets.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Active Bets ({activeBets.length})</h2>
            {activeBets.map(bet => (
              <div key={bet.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ color: '#f1f5f9', lineHeight: 1.5, marginBottom: 12 }}>{bet.hypothesis}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', marginBottom: 12 }}>
                  <span style={{ color: '#2dd4bf' }}>{bet.metric}</span>
                  <span style={{ color: '#64748b' }}>{bet.timeframe} days</span>
                </div>
                <button onClick={() => onRecordOutcome(bet)} style={{ width: '100%', padding: '10px 16px', background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: 8, color: '#2dd4bf', cursor: 'pointer' }}>Record Outcome →</button>
              </div>
            ))}
          </div>
        )}

        {completedBets.length > 0 && (
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Completed ({completedBets.length})</h2>
            {completedBets.map(bet => {
              const statusColors = { succeeded: '#22c55e', partial: '#fbbf24', failed: '#f87171', inconclusive: '#64748b' };
              return (
                <div key={bet.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ color: '#cbd5e1', flex: 1 }}>{bet.hypothesis}</div>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: `${statusColors[bet.status]}22`, color: statusColors[bet.status], marginLeft: 12 }}>{bet.status}</span>
                  </div>
                  {bet.learned && <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#94a3b8' }}>Learned: {bet.learned}</div>}
                </div>
              );
            })}
          </div>
        )}

        {bets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ color: '#64748b', marginBottom: 24 }}>No bets yet. Submit your first one!</div>
            <button onClick={onNewBet} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', border: 'none', borderRadius: 10, color: '#0a0f1a', fontWeight: 600, cursor: 'pointer' }}>Submit a Bet →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
function AppContent() {
  const { user, loading: authLoading, signInWithEmail, isAuthenticated } = useAuth();
  const { organizations, currentOrg, loading: orgsLoading, initialized: orgsInitialized, createOrganization, switchCurrentOrg } = useOrganizations();
  const { bets, createBet, createPastBets, recordOutcome } = useBets(currentOrg?.orgId);

  const [screen, setScreen] = useState('landing');
  const [currentBet, setCurrentBet] = useState(null);
  const [betToRecord, setBetToRecord] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  // Routing
  useEffect(() => {
    if (authLoading || !isAuthenticated || !orgsInitialized) return;
    if (screen === 'email' || screen === 'landing') {
      if (organizations.length > 0) {
        setScreen('dashboard');
      } else {
        setScreen('orgsetup');
      }
    }
  }, [isAuthenticated, authLoading, orgsInitialized, organizations, screen]);

  const handleEmailSubmit = async (email) => {
    const { error } = await signInWithEmail(email);
    if (error) alert('Error sending login email.');
    else setEmailSent(true);
  };

  const handleOrgSetupComplete = async ({ organization, userOrg }) => {
    const { error } = await createOrganization(organization, userOrg);
    if (error) alert('Error saving company.');
    else setScreen('bet');
  };

  const handleBetComplete = async (betData) => {
    const { data, error } = await createBet(betData);
    if (error) alert('Error saving bet.');
    else { setCurrentBet(data); setScreen('score'); }
  };

  const handleBaselineComplete = async (pastBetsData) => {
    await createPastBets(pastBetsData);
    setScreen('dashboard');
  };

  const handleOutcomeComplete = async (updatedBet) => {
    await recordOutcome(updatedBet.id, { actualResult: updatedBet.actualResult, status: updatedBet.status, learned: updatedBet.learned, wouldDoAgain: updatedBet.wouldDoAgain });
    setBetToRecord(null);
    setScreen('dashboard');
  };

  // Loading
  if (authLoading || (isAuthenticated && !orgsInitialized)) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1929 50%, #0a0f1a 100%)' }}>
      <AppHeader isLoggedIn={isAuthenticated} onDashboardClick={() => setScreen(isAuthenticated ? 'dashboard' : 'email')} onLogoClick={() => setScreen(isAuthenticated ? 'dashboard' : 'landing')} />
      {screen === 'landing' && <Landing onStart={() => setScreen('email')} />}
      {screen === 'email' && <EmailAuth onComplete={handleEmailSubmit} emailSent={emailSent} />}
      {screen === 'orgsetup' && <OrganizationSetup onComplete={handleOrgSetupComplete} />}
      {screen === 'bet' && <BetSubmission currentOrg={currentOrg} onComplete={handleBetComplete} />}
      {screen === 'score' && <ScoreResult bet={currentBet} onNewBet={() => { setCurrentBet(null); setScreen('bet'); }} onSeedBaseline={() => setScreen('baseline')} onSkipToDashboard={() => setScreen('dashboard')} />}
      {screen === 'baseline' && <SeedBaseline onComplete={handleBaselineComplete} />}
      {screen === 'record_outcome' && <RecordOutcome bet={betToRecord} onComplete={handleOutcomeComplete} onCancel={() => { setBetToRecord(null); setScreen('dashboard'); }} />}
      {screen === 'dashboard' && <Dashboard bets={bets} currentOrg={currentOrg} organizations={organizations} onSwitchOrg={switchCurrentOrg} onNewBet={() => { setCurrentBet(null); setScreen('bet'); }} onRecordOutcome={(bet) => { setBetToRecord(bet); setScreen('record_outcome'); }} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
