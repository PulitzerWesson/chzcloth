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
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Analyze this product bet narrative and extract key fields. Also identify any missing or weak elements.

Goal Context: ${goalContext}

Narrative:
${narrative}

CRITICAL: Return ONLY valid JSON. Escape all quotes in text values. Use this exact structure:
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
    "aligned": true,
    "reasoning": "how this bet connects to the goal"
  },
  "issues": [
    {"field": "baseline", "severity": "missing", "message": "specific guidance"}
  ],
  "strengths": ["what is done well"],
  "readyToScore": true
}

Rules:
- Escape all quotes in values with backslash
- Keep values concise (under 200 chars each)
- "severity" must be exactly "missing" or "weak"
- Return ONLY the JSON object, no markdown fences`
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    const text = data.content[0].text;
    
    // Try to extract JSON - handle both raw JSON and markdown-wrapped
    let jsonText = text.trim();
    
    // If wrapped in markdown code fence, extract it
    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }
    
    const parsed = JSON.parse(jsonText);

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
