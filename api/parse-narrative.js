// api/parse-narrative.js - AI parsing of narrative bet submissions

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { narrative, goalContext } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Analyze this product bet narrative and extract key fields. Also identify any missing or weak elements.

Goal Context: ${goalContext}

Narrative:
${narrative}

Return ONLY a JSON object with this structure:
{
  "extracted": {
    "change": "what's being built/changed",
    "baseline": "current state with specific numbers",
    "magnitude": "expected change with numbers",
    "mechanism": "why this will work",
    "evidence": "validation evidence mentioned",
    "cheaperTest": "cheaper test if mentioned",
    "effort": "estimated effort if mentioned"
  },
  "goalAlignment": {
    "aligned": true/false,
    "reasoning": "how this bet connects to the goal, or misalignment issues"
  },
  "issues": [
    {"field": "baseline", "severity": "missing|weak", "message": "specific guidance"}
  ],
  "strengths": ["what's done well"],
  "readyToScore": true/false
}

Notes:
- "missing" = field not present at all
- "weak" = field present but lacks specifics (no numbers, vague)
- goalAlignment checks if bet actually achieves the stated goal (e.g., growing customers vs growing revenue)
- Be specific in guidance messages
- Check if goal type matches bet outcome (revenue goals need revenue impact, not just user growth)`
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    const text = data.content[0].text;
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Parse narrative error:', error);
    return res.status(500).json({ 
      error: error.message,
      fallback: {
        extracted: {},
        goalAlignment: { aligned: false, reasoning: "Analysis failed" },
        issues: [{ field: "analysis", severity: "missing", message: "AI analysis failed. Please check your narrative and try again." }],
        strengths: [],
        readyToScore: false
      }
    });
  }
}
