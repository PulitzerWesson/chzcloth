// api/stats-summary.js - AI summary of org stats

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stats } = req.body;

    const prompt = `You are analyzing product bet data for a company using a bet-based prioritization system. 
Write a concise 2-3 sentence summary that surfaces what is actually working — which types of bets are moving fastest, where outcomes are landing, and any meaningful signal in the data. 
Be observational and specific, not prescriptive. Do not use bullet points. Do not say "I" or "you should". Speak in plain, direct language.

Here is the data:
${JSON.stringify(stats, null, 2)}

If there is not enough data to draw meaningful conclusions (e.g. fewer than 3 shipped bets), say so briefly in one sentence.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');

    const summary = data.content[0].text.trim();
    return res.status(200).json({ summary });

  } catch (error) {
    console.error('Stats summary error:', error);
    return res.status(500).json({ error: error.message });
  }
}
