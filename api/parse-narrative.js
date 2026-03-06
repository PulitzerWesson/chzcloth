// api/parse-narrative.js

async function callWithRetry(fn, maxAttempts = 3) {
  let lastResponse;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    lastResponse = await fn();
    if (lastResponse.status !== 529) return lastResponse;
    if (attempt < maxAttempts) {
      const wait = attempt * 1500;
      console.log(`Anthropic overloaded (attempt ${attempt}/${maxAttempts}), retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  return lastResponse;
}

export default async function handler(req, res) {
  console.log('=== PARSE NARRATIVE REQUEST START ===');
  console.log('Timestamp:', new Date().toISOString());

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { narrative, goalContext, uploadedFile, strategicAlignment, companyContext } = req.body;

    console.log('Parsed request data:', {
      hasNarrative: !!narrative,
      narrativeLength: narrative?.length || 0,
      hasGoalContext: !!goalContext,
      hasCompanyContext: !!companyContext,
      strategicAlignment: strategicAlignment || 'inner',
      hasUploadedFile: !!uploadedFile,
    });

    const alignment = strategicAlignment || 'inner';

    const alignmentContext = {
      inner: `This bet is marked INNER RING — core product, critical path. This is a commitment, not a test. 
The bar is high: the person needs to genuinely understand the problem, have a defensible causal mechanism, 
and know what they will measure and how. Weak causation or vague problem framing on a core bet is a real issue.`,
      outer: `This bet is marked OUTER RING — nice to have, quality of life. 
The key question beyond problem clarity is opportunity cost: is this worth doing right now vs core work? 
Push on whether the problem is real and felt, not just assumed. 
If the mechanism is weak, flag it — but also ask whether this is the right bet at all given what else could be done.`,
      experimental: `This bet is marked EXPERIMENTAL — test, learn, might not ship. 
Do NOT penalize for ambitious predictions or incomplete evidence — that's the point of an experiment. 
What matters here is learning design: will they actually know something meaningful when this ends? 
Push on: what is the specific question this experiment answers? What would a clear result look like — 
both positive and negative? If the experiment can't fail in a way that teaches them something, it's not a real experiment.`
    }[alignment];

    const promptText = `You are reviewing a product bet before it gets scored. Your job is not to be a copy editor. 
Your job is to push on the things that actually determine whether this bet is worth making.

STRATEGIC CONTEXT:
Goal: ${goalContext || 'Not specified'}
Strategic Alignment: ${alignment.toUpperCase()}
${companyContext ? `\nCOMPANY CONTEXT:\n${companyContext}\n` : ''}

${alignmentContext}

${narrative?.trim() ? `BET NARRATIVE:\n${narrative}\n` : '(No narrative — document provided)'}
${uploadedFile ? '\nA supporting document has been provided.' : ''}

---

YOUR REVIEW FRAMEWORK — push on these four things, in this order of importance:

1. PROBLEM CLARITY
Does this person actually understand what is broken and why? 
Not "improve conversion" — but what specific friction, for whom, in what context, measured how?
A sharp problem statement predicts better bets more than anything else.
Flag if: the problem is assumed rather than observed, vague rather than specific, or missing entirely.
${companyContext ? 'Use the company context to assess whether this problem is real and relevant for this specific business.' : ''}

2. CAUSAL MECHANISM  
Is there a real reason why their intervention causes the outcome they're predicting?
Not just "because users want this" — but a defensible chain of cause and effect.
The test: could a skeptic in the room poke a hole in the mechanism with one question?
Flag if: the mechanism is asserted rather than explained, or if it relies on correlation rather than causation.

3. THE KILLING ASSUMPTION
What is the single thing — if false — that makes this entire bet wrong?
Not a list of risks. The one thing.
A person who can name this is thinking clearly. A person who can't may not have thought it through.
Flag if: assumptions are vague, plural without priority, or if the person hasn't identified the real load-bearing belief.

4. EVIDENCE QUALITY (adjust expectations based on alignment type above)
There is a difference between "we think" and "we measured."
"We assume users want this" ≠ "we interviewed 15 churned users and 11 cited this reason."
"We expect 20% lift" ≠ "we ran a 2-week test on 200 users and saw 18% lift."
Flag if: evidence is absent or the confidence of the prediction is not matched by the quality of evidence supporting it.

5. MEASUREMENT PLAN
This is non-negotiable. If there is no specific metric, no source of truth, and no definition of what success looks like, the bet cannot be evaluated after the fact.
"We'll look at analytics" is not a measurement plan. "Trial-to-paid conversion in Stripe — success is ≥11% sustained over 2 weeks" is.
Flag if: the measurement is vague, the source of data is absent, or there is no definition of success vs failure.

---

ISSUE SEVERITY:
- "missing": blocks scoring — the bet cannot be evaluated without this
- "weak": bet can be scored but this meaningfully reduces confidence

STRENGTHS:
Call out what is genuinely sharp — not just "good hypothesis structure" but actual insight, real evidence, clear mechanism, honest uncertainty.

READY TO SCORE:
- true if the core intent is clear enough to evaluate, even with weak signals
- false only if the bet is too vague to score (e.g., "improve things", no mechanism, no metric)
- For experimental bets: be more generous — readyToScore=true if the learning question is clear

---

Return ONLY valid JSON:
{
  "extracted": {
    "change": "what they will specifically do",
    "baseline": "current measured state",
    "magnitude": "expected outcome with numbers",
    "mechanism": "the causal chain they're relying on",
    "evidence": "what they have actually observed or tested",
    "effort": "inferred effort size: S (small) | M (medium) | L (large) | XL (x-large)"
  },
  "goalAlignment": {
    "aligned": true,
    "reasoning": "does this bet actually move the goal, or just loosely relate to it"
  },
  "killingAssumption": "The single belief that, if false, makes this bet wrong",
  "issues": [
    {
      "field": "problem_clarity | mechanism | killing_assumption | evidence | scope | goal_alignment | measurement_plan",
      "severity": "missing | weak",
      "message": "Direct, specific, one sentence. Not a suggestion — a pushback."
    }
  ],
  "strengths": [
    "Specific thing that is genuinely sharp — not generic praise"
  ],
  "readyToScore": true
}`;

    let messageContent;
    if (uploadedFile) {
      messageContent = [
        { type: 'text', text: promptText },
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: uploadedFile.type,
            data: uploadedFile.data
          }
        }
      ];
    } else {
      messageContent = promptText;
    }

    const apiPayload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: messageContent }]
    };

    console.log('Calling Anthropic API...');

    const response = await callWithRetry(() => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(apiPayload)
    }));

    console.log('Anthropic API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data.error);
      throw new Error(data.error?.message || `Anthropic API error: ${response.status}`);
    }

    const text = data.content[0].text;
    let jsonText = text.trim();

    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (match) jsonText = match[1];
    }

    const parsed = JSON.parse(jsonText);
    console.log('=== REQUEST COMPLETED SUCCESSFULLY ===');
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('=== ERROR IN PARSE NARRATIVE ===');
    console.error('Error:', error.message);

    return res.status(500).json({
      error: error.message || 'Unknown error',
      fallback: {
        extracted: {},
        goalAlignment: { aligned: false, reasoning: 'Analysis failed — check logs' },
        killingAssumption: null,
        issues: [{
          field: 'analysis',
          severity: 'missing',
          message: `Error: ${error.message}`
        }],
        strengths: [],
        readyToScore: false
      }
    });
  }
}
