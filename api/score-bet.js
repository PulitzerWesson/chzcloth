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
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Score this ${orgMode || 'startup'} product bet. Search web for similar initiatives, benchmarks, and competitive intel.

BET: ${bet.hypothesis || 'Not provided'}
METRICS: ${bet.metric || bet.prediction || 'Not provided'}
EFFORT: ${bet.estimatedEffort || bet.timeframe || 'Not provided'}
COMPANY: ${orgName || 'Unknown'}, ${orgStrategy || 'N/A'}, ${orgIndustry || 'N/A'}

Return JSON only:
{
  "approach": {"score": <0-100>, "rationale": "<cite web findings>"},
  "potential": {"score": <0-100>, "rationale": "<cite benchmarks>"},
  "fit": {"score": <0-100>, "rationale": "<cite market timing>"},
  "market_context": "<key web findings>",
  "suggestion": {
    "type": "<'alternative' if avg<60, 'complement' if 60-85, null if >85>",
    "reasoning": "<why, citing research>",
    "hypothesis": "<alternative/complement>",
    "metrics": "<alternative metrics>",
    "effort": "<estimate>",
    "expected_score": <0-100>,
    "market_evidence": "<supporting findings>"
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
    return res.status(200).json(scores);
    
  } catch (error) {
    console.error('Scoring error:', error);
    return res.status(500).json({ error: error.message });
  }
}
