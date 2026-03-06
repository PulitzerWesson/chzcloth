// api/score-bet.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bet, orgMode, orgName, orgContext, orgLearnings, companyGoals } = req.body;
    // validationMethod is embedded in bet object

    const alignment = bet.strategicAlignment || 'inner';

    // ── Org learnings section ──────────────────────────────────────────────
    let learningsSection = '';
    if (orgLearnings && orgLearnings.length > 0) {
      learningsSection = `
PAST ORGANIZATIONAL LEARNINGS:
${orgLearnings.slice(0, 5).map(l => `- ${l.summary || l.learned}`).join('\n')}
`;
    }

    // ── Company goals section — title + description only, no KPIs ─────────
    let goalsSection = '';
    if (companyGoals && companyGoals.length > 0) {
      goalsSection = `
COMPANY STRATEGIC GOALS:
${companyGoals.map((goal, idx) => {
  const desc = goal.description ? `\n  ${goal.description}` : '';
  return `P${goal.priority || idx + 1}: ${goal.title}${desc}`;
}).join('\n\n')}
`;
    }

    // ── Alignment-specific scoring frame ──────────────────────────────────
    const alignmentFrame = {
      inner: {
        label: 'INNER RING (core product, critical path)',
        approachNote: `This is a core bet — a commitment, not a test. Score approach on: does the person deeply understand 
the problem? Is the causal mechanism defensible under scrutiny, not just stated? Is the killing assumption 
named and honest? A well-formatted hypothesis with a weak mechanism scores low here. A rough hypothesis 
with a sharp, observed problem and clear cause-effect chain scores high.`,
        potentialNote: `Evidence quality determines potential credibility. A 20% lift prediction backed by a 2-week 
test with 200 users is fundamentally different from a 20% lift prediction backed by gut feel. 
Score accordingly. Does the prediction calibration match what they actually know?`,
        fitNote: `For inner ring bets: is this the highest-leverage use of core product bandwidth right now? 
Does it directly move P1/P2 goals? Is the effort proportionate to the expected impact? 
Inner ring work that weakly supports P3 goals is a fit problem.`
      },
      outer: {
        label: 'OUTER RING (nice to have, quality of life)',
        approachNote: `Outer ring bets face a different bar: is the problem real and felt, or assumed? 
Many outer ring bets solve problems that don't actually hurt anyone much. 
Score approach on: is there evidence users actually feel this friction, not just that it exists? 
Is the mechanism credible, or is this "adding feature X should improve Y" without a real link?`,
        potentialNote: `Be honest about the ceiling. Outer ring improvements typically move metrics modestly. 
A prediction of 30% lift from a quality-of-life improvement should be scrutinized — 
is the evidence proportionate to that claim? Score lower if the prediction is ambitious without support, 
higher if the prediction is honest and evidence-backed even if the absolute upside is limited.`,
        fitNote: `The core fit question for outer ring: is this worth doing now vs core work? 
Does it support a P1/P2 goal or is it genuinely a P3 or below? 
An outer ring bet that distracts from a P1 goal is a fit problem even if the bet itself is solid.`
      },
      experimental: {
        label: 'EXPERIMENTAL (test, learn, might not ship)',
        approachNote: `Experimental bets are not judged by whether the mechanism is proven — that's the point of the experiment.
Score approach on learning design: Is there a clear question this experiment answers? 
Is there a definition of what a positive result looks like AND what a negative result looks like?
A good experiment can fail and still be worth running. A bad experiment learns nothing regardless of outcome.
Do NOT penalize for uncertain mechanism or absence of prior evidence — reward honest uncertainty.`,
        potentialNote: `For experiments, potential is about the quality of the learning, not the magnitude of the uplift. 
What will they know after this that they don't know now, and how valuable is that knowledge? 
Does the experiment design actually produce a clean enough signal to act on? 
A small, clean experiment that produces a definitive answer scores higher than a large experiment that produces noise.`,
        fitNote: `Is this the right question to be testing right now? Does the learning, if positive, 
unlock a meaningful path — toward a P1/P2 goal, a new capability, or a validated assumption 
that unblocks a bigger bet? Experiments that test interesting but strategically irrelevant questions score lower here.`
      }
    }[alignment];

    // ── PASS 1: Assess web search need ────────────────────────────────────
    const assessmentResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Does scoring this bet require web search for benchmarks or market context?

Hypothesis: "${bet.hypothesis}"
Metric: ${bet.metric} | Prediction: ${bet.prediction} | Alignment: ${alignment}
Company: ${orgName || 'Unknown'} | Stage: ${orgMode || 'growth'}
${orgContext ? `Context provided: yes (${orgContext.length} chars)` : 'No company context provided'}

Skip search if: company context is sufficient, bet is clearly strong or weak without benchmarks, 
or alignment is experimental (experiments don't need benchmarks).

Return ONLY JSON: {"needs_search": true/false, "reason": "one sentence"}`
        }]
      })
    });

    const assessmentData = await assessmentResponse.json();
    let needsSearch = false;
    let searchReason = null;

    try {
      const assessmentText = assessmentData.content[0].text;
      const match = assessmentText.match(/\{[\s\S]*\}/);
      if (match) {
        const assessment = JSON.parse(match[0]);
        needsSearch = assessment.needs_search;
        searchReason = assessment.reason;
        if (alignment === 'experimental') needsSearch = false;
        console.log('Web search decision:', assessment.reason);
      }
    } catch (e) {
      console.log('Assessment parse failed, defaulting to no search');
    }

    // ── PASS 2: Score ─────────────────────────────────────────────────────
    const effortLabels = { S: 'Small', M: 'Medium', L: 'Large', XL: 'X-Large' };
    const effortDisplay = effortLabels[bet.estimatedEffort] || bet.estimatedEffort || 'Not specified';

    const scoringPrompt = `You are scoring a product bet. Your job is to deliver a verdict — direct, honest, and specific to this bet and this company. 

No hedging. No "consider adding more detail." State what you see and why it matters.

─── BET ──────────────────────────────────────────────────────────────────
Hypothesis: "${bet.hypothesis}"
Metric: ${bet.metric}
Prediction: ${bet.prediction}
Baseline: ${bet.baseline || 'Not specified'}
Timeframe: ${bet.timeframe} days
Confidence: ${bet.confidence}%
Strategic Alignment: ${alignmentFrame.label}
Estimated Effort: ${effortDisplay}
Assumptions: ${bet.assumptions || 'Not specified'}
Measurement Plan: ${bet.validationMethod || 'Not specified'}
Check After: ${bet.timeframe} days

─── COMPANY CONTEXT ──────────────────────────────────────────────────────
${orgName ? `Company: ${orgName}` : 'Company: Unknown'}
Stage: ${orgMode || 'growth'}
${orgContext ? `\n${orgContext}\n` : ''}
${goalsSection}
${learningsSection}

─── SCORING ──────────────────────────────────────────────────────────────

Score each dimension 0–100. Each rationale must be a direct verdict, not a suggestion. 
Reference specific details from this bet and this company — not generic guidance.
If company context is provided, cite it. If goals are provided, name them specifically.

APPROACH (0–100): Does this person understand the problem and mechanism well enough to be right?
${alignmentFrame.approachNote}

Score guide:
90–100: Sharp problem, observed not assumed. Defensible causal mechanism a skeptic would accept. Killing assumption named honestly. Specific measurement plan — exact metric, source, and definition of success.
70–89: Clear problem and plausible mechanism. Some assumptions stated. Measurement plan is reasonable but could be more specific.
50–69: Problem is real but surface-level. Mechanism is asserted not explained. Measurement plan is vague ("check analytics").
30–49: Problem is assumed. Mechanism is "this should work." Measurement plan is absent or unmeasurable.
0–29: No clear problem. No mechanism. No way to know if this worked.

POTENTIAL (0–100): Is the predicted outcome believable given what they actually know?
${alignmentFrame.potentialNote}

Score guide:
90–100: Prediction is calibrated to evidence. Strong prior data (test results, measured baseline, comparable). Confidence matches what they know.
70–89: Reasonable prediction with some supporting evidence. Minor optimism but grounded.
50–69: Prediction exists but evidence is thin. "We expect X" without real basis. Confidence higher than evidence warrants.
30–49: Ambitious prediction with weak or no evidence. Baseline missing or guessed. Timeframe mismatched to expected change.
0–29: No prediction or completely unmoored from reality.

FIT (0–100): Is this the right bet at the right time for this company?
${alignmentFrame.fitNote}

Score guide:
90–100: Directly addresses a P1/P2 goal. Effort is proportionate. Timing is right. Learning (if experimental) unlocks a meaningful path.
70–89: Supports company direction. Good use of effort. Minor alignment gaps.
50–69: Loosely related to goals. Effort may not match priority. Opportunity cost concerns.
30–49: Tangential to stated goals. Questionable prioritization. Better bets likely exist for this effort.
0–29: Works against company priorities or addresses a problem nobody has.

─── SUGGESTION ───────────────────────────────────────────────────────────

Average score context:
- avg ≥ 70: "complement" — the bet is solid, suggest a specific sharpening
- avg 60–69: "complement" — keep core intent, make it more precise and measurable  
- avg < 60: "alternative" — suggest a different approach to the same underlying goal

For experimental bets, suggestions should improve the learning design, not the outcome prediction.

─── OUTPUT ───────────────────────────────────────────────────────────────

Return ONLY valid JSON, no markdown:
{
  "title": "8–12 word title capturing the core action and outcome",
  "summary": "15–20 word value proposition",
  "product": "Which product surface this bet modifies",
  "lever": "Exactly one of: Revenue | Retention | Acquisition | Efficiency | Platform | Experience | Risk",
  "approach": {
    "score": 0–100,
    "rationale": "Direct verdict. What specifically is strong or weak about the problem framing and mechanism. Cite specific details from this bet."
  },
  "potential": {
    "score": 0–100,
    "rationale": "Direct verdict. Is the prediction credible given the evidence? Be specific about evidence quality. Cite company context where relevant."
  },
  "fit": {
    "score": 0–100,
    "rationale": "Direct verdict. Is this the right bet right now? Name specific goals it supports or doesn't support. Cite company priorities."
  },
  "market_context": ${needsSearch ? '"Key web findings about similar initiatives"' : 'null'},
  "suggestion": {
    "type": "alternative | complement",
    "hypothesis": "The improved or alternative hypothesis",
    "metrics": "The improved or alternative prediction",
    "effort": "S | M | L | XL",
    "reasoning": "Why this is sharper — specific, not generic. For experimental bets, explain how this improves the learning design.",
    "expected_score": 0–100,
    "market_evidence": ${needsSearch ? '"Supporting web findings"' : 'null'}
  }
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0,
        messages: [{ role: 'user', content: scoringPrompt }],
        tools: needsSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : undefined
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Anthropic API error:', data.error);
      return res.status(500).json({ error: data.error.message || 'API error' });
    }

    let fullText = '';
    for (const block of data.content) {
      if (block.type === 'text') fullText += block.text;
    }

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', fullText);
      return res.status(500).json({ error: 'Invalid API response format' });
    }

    const scores = JSON.parse(jsonMatch[0]);

    const strip = (text) => text ? text.replace(/<cite[^>]*>|<\/cite>/g, '') : text;
    scores.title = strip(scores.title);
    scores.summary = strip(scores.summary);
    scores.product = strip(scores.product);
    if (scores.approach) scores.approach.rationale = strip(scores.approach.rationale);
    if (scores.potential) scores.potential.rationale = strip(scores.potential.rationale);
    if (scores.fit) scores.fit.rationale = strip(scores.fit.rationale);
    if (scores.market_context) scores.market_context = strip(scores.market_context);
    if (scores.suggestion) {
      scores.suggestion.reasoning = strip(scores.suggestion.reasoning);
      scores.suggestion.market_evidence = strip(scores.suggestion.market_evidence);
    }

    scores.web_search_used = needsSearch;
    scores.web_search_reason = searchReason;

    return res.status(200).json(scores);

  } catch (error) {
    console.error('Scoring error:', error);
    return res.status(500).json({ error: error.message });
  }
}
