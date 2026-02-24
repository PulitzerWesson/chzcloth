export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { bet, orgMode, orgName, orgContext, orgLearnings, clarifyingAnswers, companyGoals, selectedKPI } = req.body;    
    
    // Build clarifying answers section if provided
    let clarifyingSection = '';
    if (clarifyingAnswers && Object.keys(clarifyingAnswers).length > 0) {
      clarifyingSection = `

CLARIFYING INFORMATION PROVIDED:
${Object.entries(clarifyingAnswers).map(([idx, answer]) => 
  `${parseInt(idx) + 1}. ${answer}`
).join('\n')}

Use these answers to inform your scoring and recommendations.
`;
    }
    
    // Build org learnings section if provided
    let learningsSection = '';
    if (orgLearnings && orgLearnings.length > 0) {
      learningsSection = `

PAST ORGANIZATIONAL LEARNINGS:
${orgLearnings.slice(0, 5).map(l => `- ${l.summary || l.learned}`).join('\n')}

Consider these patterns when scoring.
`;
    }
    
    // Build company goals section
    let goalsSection = '';
    if (companyGoals && companyGoals.length > 0) {
      goalsSection = `

COMPANY STRATEGIC GOALS (${companyGoals[0]?.time_period?.toUpperCase() || 'Q1'} ${companyGoals[0]?.year || 2026}):
${companyGoals.map((goal, idx) => {
  const kpis = typeof goal.kpis === 'string' ? JSON.parse(goal.kpis) : goal.kpis;
  const kpiText = kpis && kpis.length > 0 
    ? kpis.map(k => `  - ${k.metric}: ${k.baseline} → ${k.target}`).join('\n')
    : '  (No KPIs defined)';
  
  return `P${goal.priority || idx + 1} (Priority ${goal.priority || idx + 1}): ${goal.title}
${kpiText}`;
}).join('\n\n')}
`;
    }
    

    
    // PASS 1: Determine if web search is needed
    const assessmentResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Quickly assess if this bet needs web search for accurate scoring.

BET DETAILS:
Hypothesis: "${bet.hypothesis}"
Metric: ${bet.metric}
Prediction: ${bet.prediction}
Baseline: ${bet.baseline || 'Not specified'}
Timeframe: ${bet.timeframe} days
Confidence: ${bet.confidence}%
Strategic Alignment: ${bet.strategicAlignment}
Estimated Effort: ${bet.estimatedEffort}
Cost of Inaction: ${bet.inactionImpact}
Assumptions: ${bet.assumptions || 'Not specified'}
${selectedKPI?.metric && selectedKPI?.baseline && selectedKPI?.target && selectedKPI?.goalTitle 
  ? `Targeted KPI: ${selectedKPI.metric} (${selectedKPI.baseline} → ${selectedKPI.target}) from ${selectedKPI.goalTitle}` 
  : ''}

ORGANIZATIONAL CONTEXT:
${orgName ? `Company: ${orgName}` : 'Company: Unknown'}
Mode: ${orgMode || 'growth'}

${orgContext ? `COMPANY DETAILS:\n${orgContext}\n` : ''}
${goalsSection}
${learningsSection}
${clarifyingSection}

SKIP web search if:
- Bet is clearly broken/nonsensical (missing structure, vague)
- Bet is well-formed and org context + goals provide sufficient basis for scoring
- Past learnings already cover this territory
- Standard product bet with no unusual claims

USE web search if:
- Prediction seems ambitious and needs competitive validation
- Industry benchmarks would materially change the score
- Claims about market trends need fact-checking
- Missing critical competitive/market context that can't be inferred from provided details

Return ONLY JSON:
{
  "needs_search": true/false,
  "reason": "Brief explanation"
}`
        }]
      })
    });
    
    const assessmentData = await assessmentResponse.json();
    let needsSearch = false;
    let searchReason = null;
    
    try {
      const assessmentText = assessmentData.content[0].text;
      const assessmentMatch = assessmentText.match(/\{[\s\S]*\}/);
      if (assessmentMatch) {
        const assessment = JSON.parse(assessmentMatch[0]);
        needsSearch = assessment.needs_search;
        searchReason = assessment.reason;
        console.log('Web search decision:', assessment.reason);
      }
    } catch (e) {
      console.log('Assessment parse failed, defaulting to no search');
    }
    
    // PASS 2: Score with or without web search
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
        messages: [{
          role: 'user',
          content: `You are evaluating a product bet for a ${orgMode || 'growth'} stage company.${needsSearch ? ' Search web for benchmarks, competitive intelligence, and industry data ONLY when it would materially impact scoring.' : ' Score based on available context - web search was deemed unnecessary.'}

BET DETAILS:
Hypothesis: "${bet.hypothesis}"
Metric: ${bet.metric}
Prediction: ${bet.prediction}
Baseline: ${bet.baseline || 'Not specified'}
Timeframe: ${bet.timeframe} days
Confidence: ${bet.confidence}%
Strategic Alignment: ${bet.strategicAlignment}
Estimated Effort: ${bet.estimatedEffort}
Cost of Inaction: ${bet.inactionImpact}
Assumptions: ${bet.assumptions || 'Not specified'}
${selectedKPI?.metric && selectedKPI?.baseline && selectedKPI?.target && selectedKPI?.goalTitle 
  ? `\nTARGETED KPI: This bet specifically targets "${selectedKPI.metric}" (${selectedKPI.baseline} → ${selectedKPI.target}) from ${selectedKPI.goalTitle}` 
  : ''}

ORGANIZATIONAL CONTEXT:
${orgName ? `Company: ${orgName}` : 'Company: Unknown'}
Mode: ${orgMode || 'growth'}

${orgContext ? `COMPANY DETAILS:\n${orgContext}\n` : ''}
${goalsSection}
${learningsSection}
${clarifyingSection}

${orgContext || goalsSection ? `CRITICAL INSTRUCTION:
Your rationale for EACH score MUST cite specific details from the context above. Reference their business model, strategic goals, KPI targets, industry dynamics, scale, or competitive position. Generic scoring that could apply to any company is unacceptable when detailed company context is provided.

For FIT score specifically:
- Evaluate alignment with P1/P2/P3 company goals
- Consider if this bet moves the needle on stated KPIs
${selectedKPI?.metric && selectedKPI?.baseline && selectedKPI?.target 
  ? `- Pay special attention to the TARGETED KPI: ${selectedKPI.metric} (${selectedKPI.baseline} → ${selectedKPI.target}) - how directly does this bet impact this specific metric?` 
  : ''}
- Assess if effort matches goal priority (P1 goals deserve more effort than P3)
- Reference specific metric targets (e.g., "helps move MRR from $143K toward $200K target")

For example:
- Bad: "Aligns with growth stage focus on conversion optimization"
- Good: "Directly supports P1 goal 'Reach $200K MRR' by improving trial→paid conversion (14%→20% target), which is the primary revenue bottleneck"

` : ''}

TITLE & SUMMARY GENERATION:
Generate a professional title and summary for this bet:
- Title: 8-12 words capturing the core action and expected outcome
- Summary: 15-20 words explaining the value proposition
- Lever: The primary business lever this bet moves. Must be exactly one of: Revenue, Retention, Acquisition, Efficiency, Platform, Experience, Risk. Choose based on what success ultimately unlocks, not just what's being measured (e.g. improving CSAT → Retention, faster page load → Experience, new referral program → Acquisition).

${orgContext ? 'Reference company specifics when relevant (e.g., "Testway" vs "the company").' : ''}

PRODUCT IDENTIFICATION:
Identify which product/surface this bet modifies. Common products:
- Website / Landing Page
- Mobile App (iOS/Android)
- Sales Funnel / Checkout
- Chat Agent / Chatbot / Conversational AI
- Customer Portal / Login / Dashboard
- Admin Dashboard / Internal Tool
- API / Platform / Developer Tools
- Email System / Notifications
- Marketing Site
${orgContext ? 'Use company context to determine their product ecosystem.' : ''}


SCORING CRITERIA:

1. APPROACH (0-100):
- Is the hypothesis structured properly (if/then/because)?
- Is the action specific and clear?
- Is the mechanism explained?
- Are assumptions identified?
${orgContext ? '- How does this fit their specific business model and industry context?' : ''}
${needsSearch ? '- How does this compare to similar bets in the industry? (search if needed)' : ''}

2. POTENTIAL (0-100):
- Is the prediction quantified and specific?
- Is there a baseline for comparison?
- Is the metric measurable?
- Is the timeframe appropriate for the change?
- Does the effort match the expected impact?
${orgContext ? '- Is this prediction realistic given their scale and market position?' : ''}
${goalsSection ? '- Does this prediction move the needle on stated KPI targets?' : ''}
${selectedKPI?.metric && selectedKPI?.baseline && selectedKPI?.target 
  ? `- How significantly does this impact the targeted KPI: ${selectedKPI.metric} (${selectedKPI.baseline} → ${selectedKPI.target})?` 
  : ''}
${needsSearch ? '- What do benchmarks say about typical results? (search if needed)' : ''}

3. FIT (0-100):
- Does this align with the company's stage (${orgMode})?
${goalsSection ? '- Does this support P1/P2/P3 company goals? Which specific goals and KPIs?' : ''}
${selectedKPI?.metric && selectedKPI?.baseline && selectedKPI?.target 
  ? `- How directly does this move the needle on the TARGETED KPI: ${selectedKPI.metric} (${selectedKPI.baseline} → ${selectedKPI.target})?` 
  : ''}
- Does strategic alignment match effort?
- Is cost of inaction justified?
- Does this match patterns from past learnings?
${orgContext ? '- How does this align with their stated strategic priorities and business model?' : ''}
${needsSearch ? '- What is the market timing for this type of initiative? (search if needed)' : ''}

SUGGESTION RULES:
- ALWAYS provide a suggestion regardless of score (TESTING MODE)
- If avg >= 70: provide "complement" type - suggest minor polish/improvements
- If avg 60-69: provide "complement" type - keep core intent, polish the specifics, make it more measurable
- If avg < 60: provide "alternative" type - suggest a different approach to achieve the same underlying goal

Return ONLY valid JSON (no markdown, no preamble):
{
  "title": "Concise professional title (8-12 words)",
  "summary": "One-sentence value proposition (15-20 words)",
  "product": "Which product/surface this bet modifies",
  "lever": "One of: Revenue, Retention, Acquisition, Efficiency, Platform, Experience, Risk",
  "approach": {
    "score": 0-100,
    "rationale": "Brief explanation${needsSearch ? ' citing any relevant web findings' : ''}${orgContext ? ' citing specific company details' : ''}"
  },
  "potential": {
    "score": 0-100,
    "rationale": "Brief explanation${needsSearch ? ' citing benchmarks if found' : ''}${orgContext || goalsSection ? ' citing company scale, market position, and KPI targets' : ''}${selectedKPI ? ' with specific focus on targeted KPI impact' : ''}"
  },
  "fit": {
    "score": 0-100,
    "rationale": "Brief explanation${needsSearch ? ' citing market context if found' : ''}${goalsSection ? ' citing specific P1/P2/P3 goals and KPI alignment' : ''}${selectedKPI ? ' explaining direct impact on targeted KPI' : ''}${orgContext ? ' citing strategic priorities and business model' : ''}"
  },
  "market_context": ${needsSearch ? '"Key web findings about similar initiatives"' : 'null'},
  "suggestion": {
    "type": "alternative|complement",
    "hypothesis": "Improved/alternative hypothesis",
    "metrics": "Improved/alternative prediction",
    "effort": "Estimated effort",
    "reasoning": "Why this improvement${needsSearch ? ', citing research' : ''}${orgContext || goalsSection ? ', citing company context and goals' : ''}${selectedKPI ? ', noting targeted KPI impact' : ''}",
    "expected_score": estimated score with improvements,
    "market_evidence": ${needsSearch ? '"Supporting web findings"' : 'null'}
  }
}`
        }],
        tools: needsSearch ? [{
          type: 'web_search_20250305',
          name: 'web_search'
        }] : undefined
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Anthropic API error:', data.error);
      return res.status(500).json({ error: data.error.message || 'API error' });
    }
    
    let fullText = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }
    
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', fullText);
      return res.status(500).json({ error: 'Invalid API response format' });
    }
    
    const scores = JSON.parse(jsonMatch[0]);
    
    // Strip citation tags from rationale text
    const stripCitations = (text) => {
      if (!text) return text;
      return text.replace(/<cite[^>]*>|<\/cite>/g, '');
    };
    
    // Clean up all rationale fields
    if (scores.title) {
      scores.title = stripCitations(scores.title);
    }
    if (scores.summary) {
      scores.summary = stripCitations(scores.summary);
    }
    if (scores.product) {
      scores.product = stripCitations(scores.product);
    }
    if (scores.approach?.rationale) {
      scores.approach.rationale = stripCitations(scores.approach.rationale);
    }
    if (scores.potential?.rationale) {
      scores.potential.rationale = stripCitations(scores.potential.rationale);
    }
    if (scores.fit?.rationale) {
      scores.fit.rationale = stripCitations(scores.fit.rationale);
    }
    if (scores.market_context) {
      scores.market_context = stripCitations(scores.market_context);
    }
    if (scores.suggestion?.reasoning) {
      scores.suggestion.reasoning = stripCitations(scores.suggestion.reasoning);
    }
    if (scores.suggestion?.market_evidence) {
      scores.suggestion.market_evidence = stripCitations(scores.suggestion.market_evidence);
    }

    // Add web search metadata
    scores.web_search_used = needsSearch;
    scores.web_search_reason = searchReason; 
    
    return res.status(200).json(scores);
    
  } catch (error) {
    console.error('Scoring error:', error);
    return res.status(500).json({ error: error.message });
  }
}
