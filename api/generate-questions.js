export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bet, orgContext } = req.body;

  try {
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
          content: `You are a senior product leader stress-testing a bet.

BET DETAILS:
Hypothesis: "${bet.hypothesis}"
Prediction: ${bet.prediction}
Timeframe: ${bet.timeframe} days
Metric: ${bet.metric}
Confidence: ${bet.confidence}%
Strategic Alignment: ${bet.strategicAlignment}
Estimated Effort: ${bet.estimatedEffort}

ORGANIZATIONAL CONTEXT:
Company: ${orgContext.name || 'Unknown'}
Industry: ${orgContext.industry || 'Unknown'}
Stage: ${orgContext.mode || 'Unknown'}
Past learnings: ${orgContext.learnings?.slice(0, 3).map(l => `- ${l.summary}`).join('\n') || 'None yet'}

YOUR JOB:
Generate 2-3 questions that are impossible to answer vaguely and would materially improve scoring accuracy.

QUESTION TYPES (pick 2-3):

1. FORCE QUANTIFICATION
Template: "[Benchmark] is X. You're predicting Y. What specific evidence justifies that delta?"
- Compare to industry benchmarks or user's past attempts
- Require specific data points, not opinions

2. TEST MECHANISM
Template: "You say 'because [reason].' What evidence proves [reason] is THE problem?"
- Challenge the causation claim in the hypothesis
- Ask for specific user data or past examples

3. REVEAL KILL CRITERIA
Template: "At what metric value would you kill this? Why not predict that number?"
- Force definition of minimum acceptable outcome
- Challenge timeline or scope assumptions

4. CHALLENGE OPPORTUNITY COST
Template: "To do this, you're NOT doing X. Why is this better?"
- What gets delayed or killed for this
- Is this the highest-value use of resources

RULES:
- Questions must be answerable in 2-3 sentences
- Must require specific data/numbers/names/examples (not opinions)
- Should feel rigorous but not mean
- If you can't generate a truly surgical question, return fewer questions or empty array
- Maximum 3 questions

Return ONLY valid JSON (no markdown, no explanation):
{
  "questions": [
    {
      "question": "Specific, impossible-to-bullshit question",
      "type": "quantification|mechanism|kill_criteria|opportunity_cost",
      "why": "How answer changes scoring"
    }
  ]
}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ questions: [] });
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return res.json(result);

  } catch (error) {
    console.error('Error generating questions:', error);
    return res.json({ questions: [] }); // Fail gracefully
  }
}
