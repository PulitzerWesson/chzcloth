export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { bet, orgMode, orgName, orgStrategy, orgIndustry } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `You are evaluating a product bet with measurable metrics. Provide detailed scoring with real-time market research.

BET DETAILS:
- Hypothesis: ${bet.hypothesis || 'Not provided'}
- Metrics: ${bet.metric || bet.customMetric || bet.prediction || 'Not provided'}
- Estimated Effort: ${bet.estimatedEffort || bet.timeframe ? bet.timeframe + ' days' : 'Not provided'}
- Strategic Alignment: ${bet.strategicAlignment || 'Not provided'}
- Assumptions: ${bet.assumptions || 'Not provided'}
- Bet Type: ${bet.betType || 'Not provided'}

ORGANIZATION CONTEXT:
- Company: ${orgName || 'Unknown Company'}
- Mode: ${orgMode || 'startup'} (startup/enterprise)
- Strategy: ${orgStrategy || 'Not specified'}
- Industry: ${orgIndustry || 'Not specified'}

INSTRUCTIONS:
1. Search the web for similar initiatives in the industry
2. Look for success/failure case studies
3. Check industry benchmarks for similar metrics
4. Find recent research on this approach
5. Assess competitive landscape and market timing

Based on ALL this context, provide:

{
  "approach": {
    "score": <0-100>,
    "rationale": "<Detailed assessment of execution plan quality, citing similar cases from web research>"
  },
  "potential": {
    "score": <0-100>,
    "rationale": "<Assessment of upside magnitude based on industry benchmarks and market research>"
  },
  "fit": {
    "score": <0-100>,
    "rationale": "<Strategic alignment considering competitive landscape and market timing>"
  },
  "market_context": "<Key findings from web search about industry trends, benchmarks, and competitive intelligence>",
  "risk_factors": "<Potential risks identified from research>",
  "success_factors": "<Critical success factors based on industry best practices>",
  "suggestion": {
    "type": "<'alternative' if overall_score < 60, 'complement' if 60-85, null if >85>",
    "reasoning": "<Why this suggestion would score higher, citing market research>",
    "hypothesis": "<Alternative/complementary hypothesis>",
    "metrics": "<Alternative/complementary success metrics>",
    "effort": "<Effort estimate>",
    "expected_score": <projected score 0-100>,
    "market_evidence": "<Specific web search findings supporting this>",
    "competitive_insight": "<How competitors approached similar challenges>"
  }
}

SUGGESTION GUIDELINES:
- If overall score < 60 (ALTERNATIVE): Suggest a different approach based on market research
- If score 60-85 (COMPLEMENT): Suggest an enhancement that strengthens the bet
- If score > 85: Set suggestion to null

Frame with market evidence, not criticism.

Return ONLY the JSON object, no other text.`
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
    
    // Extract text from response (handling tool use)
    let fullText = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }
    
    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', fullText);
      return res.status(500).json({ error: 'Invalid API response format' });
    }
    
    const scores = JSON.parse(jsonMatch[0]);
    
    return res.status(200).json(scores);
    
  } catch (error) {
    console.error('Scoring error:', error);
    return res.status(500).json({ error: error.message });
  }
}
