// api/parse-narrative.js - AI parsing of narrative bet submissions

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { narrative, goalContext, uploadedFile } = req.body;

    // Build message content - can include both text and document
    const messageContent = [];

    // Always include the text prompt
    messageContent.push({
      type: 'text',
      text: `Analyze this product bet and return ONLY valid JSON.

Goal: ${goalContext}

Bet Narrative:
${narrative}

${uploadedFile ? '\n(Additional context provided in uploaded document)\n' : ''}

Return this exact structure:
{
  "extracted": {
    "change": "what they will build",
    "baseline": "current numbers",
    "magnitude": "expected numbers",
    "mechanism": "why it will work",
    "evidence": "proof they have",
    "effort": "estimated effort based on scope (1-sprint, 2-3-sprints, 4-6-sprints, or 6-plus-sprints)"
  },
  "goalAlignment": {
    "aligned": true,
    "reasoning": "does bet achieve the goal"
  },
  "issues": [
    {"field": "example", "severity": "missing", "message": "what is missing"}
  ],
  "strengths": ["what they did well"],
  "readyToScore": true
}

Instructions:
- Estimate effort based on what they're building (simple UI change = 1-sprint, new feature = 2-3-sprints, complex system = 4-6-sprints, major platform = 6-plus-sprints)
- Only flag "validation" issue if they have NO evidence at all (no tests, no interviews, no data)
- If field is missing, use empty string
- Keep all text values concise
- Return ONLY the JSON`
    });

    // Add document if provided
    if (uploadedFile) {
      messageContent.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: uploadedFile.type,
          data: uploadedFile.data
        }
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-3-5-20241022',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: messageContent
        }]
      })
    });
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
