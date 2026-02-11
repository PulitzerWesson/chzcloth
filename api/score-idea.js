export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { idea, orgMode, orgName, orgStrategy, orgIndustry, signalCount = 0 } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Score this ${orgMode || 'startup'} product idea. Search web for trends, competitive intel, and validate against ${signalCount} internal demand signals.

IDEA:
- Problem: ${idea.problem}
- Proposal: ${idea.proposal || idea.description}
- Reach: ${idea.reach || 'Not specified'}
- Impact: ${idea.expectedImpact || idea.impact || 'Not specified'}

COMPANY: ${orgName || 'Unknown'}, ${orgStrategy || 'N/A'}, ${orgIndustry || 'N/A'}

Return JSON only:
{
  "viability_score": <0-100>,
  "relevance_score": <0-100>,
  "overall_score": <0-100>,
  "scoring_rationale": "<Comprehensive analysis citing: technical feasibility, market trends from web search, ${signalCount} signal support, competitive landscape, strategic fit>",
  "market_insights": "<Key web findings on industry trends and competition>",
  "signal_support": "<How ${signalCount} signals validate this>",
  "suggestion": {
    "type": "<'alternative' if overall<60, 'complement' if 60-85, null if >85>",
    "reasoning": "<why, citing market research>",
    "problem": "<alternative/complementary problem>",
    "proposal": "<alternative/complementary solution>",
    "reach": "<who this impacts>",
    "impact": "<expected outcome>",
    "expected_score": <0-100>,
    "market_evidence": "<web findings supporting this>"
  }
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
    
    // Strip citation tags
    const stripCitations = (text) => {
      if (!text) return text;
      return text.replace(/<cite[^>]*>|<\/cite>/g, '');
    };
    
    if (scores.scoring_rationale) {
      scores.scoring_rationale = stripCitations(scores.scoring_rationale);
    }
    if (scores.market_insights) {
      scores.market_insights = stripCitations(scores.market_insights);
    }
    if (scores.signal_support) {
      scores.signal_support = stripCitations(scores.signal_support);
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
