export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { bet, orgMode, orgName, orgStrategy, orgIndustry, orgLearnings, clarifyingAnswers } = req.body;
    
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
        messages: [{
          role: 'user',
          content: `You are evaluating a product bet for a ${orgMode || 'growth'} stage company. Search web for similar initiatives, benchmarks, and competitive intelligence.

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

ORGANIZATIONAL CONTEXT:
${orgName ? `Company: ${orgName}` : 'Company: Unknown'}
${orgIndustry ? `Industry: ${orgIndustry}` : ''}
${orgStrategy ? `Strategy: ${orgStrategy}` : ''}
Mode: ${orgMode || 'growth'}
${learningsSection}
${clarifyingSection}

SCORING CRITERIA:

1. APPROACH (0-100):
- Is the hypothesis structured properly (if/then/because)?
- Is the action specific and clear?
- Is the mechanism explained?
- Are assumptions identified?
- How does this compare to similar bets in the industry? (search for examples)

2. POTENTIAL (0-100):
- Is the prediction quantified and specific?
- Is there a baseline for comparison?
- Is the metric measurable?
- Is the timeframe appropriate for the change?
- Does the effort match the expected impact?
- What do benchmarks say about typical results? (search for data)

3. FIT (0-100):
- Does this align with the company's stage (${orgMode})?
- Does strategic alignment match effort?
- Is cost of inaction justified?
- Does this match patterns from past learnings?
- What is the market timing for this type of initiative? (search for trends)

SUGGESTION RULES:
- Calculate average score first
- If avg >= 70: return suggestion as null (bet is good enough)
- If avg 60-69: provide "complement" type - keep core intent, polish the specifics, make it more measurable
- If avg < 60: provide "alternative" type - suggest a different approach to achieve the same underlying goal

Return ONLY valid JSON (no markdown, no preamble):
{
  "approach": {
    "score": 0-100,
    "rationale": "Brief explanation citing any relevant web findings"
  },
  "potential": {
    "score": 0-100,
    "rationale": "Brief explanation citing benchmarks if found"
  },
  "fit": {
    "score": 0-100,
    "rationale": "Brief explanation citing market context if found"
  },
  "market_context": "Key web findings about similar initiatives",
  "suggestion": {
    "type": "alternative|complement",
    "hypothesis": "Improved/alternative hypothesis",
    "metrics": "Improved/alternative prediction",
    "effort": "Estimated effort",
    "reasoning": "Why this improvement, citing research",
    "expected_score": estimated score with improvements,
    "market_evidence": "Supporting web findings"
  } OR null if score >= 70
}`
        }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
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
    
    return res.status(200).json(scores);
    
  } catch (error) {
    console.error('Scoring error:', error);
    return res.status(500).json({ error: error.message });
  }
}
