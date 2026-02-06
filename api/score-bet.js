export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bet, orgMode } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are scoring a product bet for a ${orgMode || 'growth'}-stage company.

BET DETAILS:
- Hypothesis: ${bet.hypothesis || 'Not provided'}
- Metric: ${bet.metric || bet.customMetric || 'Not provided'}
- Baseline: ${bet.baseline || 'Not provided'}
- Prediction: ${bet.prediction || 'Not provided'}
- Timeframe: ${bet.timeframe ? bet.timeframe + ' days' : 'Not provided'}
- Assumptions: ${bet.assumptions || 'Not provided'}
- Cheap Test: ${bet.cheapTest || 'Not provided'}
- Bet Type: ${bet.betType || 'Not provided'}

Score this bet on three dimensions (0-100 each):

1. APPROACH: Is this bet well-formed? Clear hypothesis with mechanism (if/then/because)? Specific, measurable metric? Quantified prediction? Explicit assumptions?

2. POTENTIAL: How likely is this type of bet to succeed if well-executed? Is this a proven pattern? Common pitfalls? Realistic expected impact?

3. FIT: For a ${orgMode || 'growth'}-stage company, is this the right bet right now? Matches stage priorities? Appropriate scope? Realistic timeframe?

Respond in JSON only, no other text:
{"approach":{"score":<0-100>,"rationale":"<1-2 sentences>"},"potential":{"score":<0-100>,"rationale":"<1-2 sentences>"},"fit":{"score":<0-100>,"rationale":"<1-2 sentences>"}}`
        }]
      })
    });

    const data = await response.json();
    const scores = JSON.parse(data.content[0].text);

    return res.status(200).json(scores);

  } catch (error) {
    console.error('Scoring error:', error);
    return res.status(500).json({ error: error.message });
  }
}
