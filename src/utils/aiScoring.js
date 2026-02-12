export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { bet, orgMode, orgName, orgStrategy, orgIndustry, orgLearnings } = req.body;
    
    // Build learnings context
    let learningsContext = '';
    if (orgLearnings) {
      learningsContext = `
ORGANIZATIONAL LEARNINGS:
- Total completed bets: ${orgLearnings.totalBets || 0}
- Org success rate: ${orgLearnings.orgAccuracy || 'N/A'}%
${orgLearnings.userAccuracy ? `- Sponsor accuracy: ${orgLearnings.userAccuracy}% (${orgLearnings.userBetsCount} bets)` : '- Sponsor: New (no history)'}
${orgLearnings.avgSprintsPerFeature ? `- Avg effort per feature: ${orgLearnings.avgSprintsPerFeature} sprints (${orgLearnings.avgDaysPerFeature} days)` : ''}
- Effort pattern: ${orgLearnings.effortPatterns || 'Building history...'}

Recent outcomes:
${orgLearnings.recentOutcomes?.map(o => `- ${o.outcome}: ${o.hypothesis} (${o.metric}, ${o.timeframe ? o.timeframe + ' days' : 'N/A'})`).join('\n') || 'None yet'}

Key learnings:
${orgLearnings.learnings?.slice(0, 5).map(l => `- [${l.outcome}] ${l.hypothesis}: ${l.learned}`).join('\n') || 'None yet'}

Metric domain patterns:
${Object.entries(orgLearnings.metricPatterns || {}).map(([domain, stats]) => 
  `- ${domain}: ${Math.round((stats.succeeded/stats.total)*100)}% success (${stats.total} bets)`
).join('\n') || 'Building history...'}
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
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Score this ${orgMode || 'startup'} product bet. Search web for similar initiatives, benchmarks, and competitive intel. ALSO consider this org's historical performance.

BET: ${bet.hypothesis || 'Not provided'}
METRICS: ${bet.metric || bet.prediction || 'Not provided'}
USER'S EFFORT ESTIMATE: ${bet.estimatedEffort || bet.timeframe || 'Not provided'}
COMPANY: ${orgName || 'Unknown'}, ${orgStrategy || 'N/A'}, ${orgIndustry || 'N/A'}

${learningsContext}

IMPORTANT: 
1. Factor in organizational patterns. If similar bets failed before, note it. If sponsor has strong/weak track record, adjust confidence accordingly.
2. ESTIMATE REALISTIC EFFORT based on scope, company profile, historical data, and web search for similar implementations. Compare to user's estimate.
3. If org consistently over/underestimates in a domain, call it out.

Return JSON only:
{
  "approach": {"score": <0-100>, "rationale": "<cite web findings AND org patterns>"},
  "potential": {"score": <0-100>, "rationale": "<cite benchmarks AND org history>"},
  "fit": {"score": <0-100>, "rationale": "<cite market timing AND org execution capability>"},
  "market_context": "<key web findings>",
  "org_insights": "<patterns from org data: sponsor track record, similar bet outcomes, domain patterns>",
  "effort_estimate": {
    "ai_estimate": "<X-Y sprints or X-Y weeks>",
    "confidence": "<low/medium/high>",
    "user_estimate": "${bet.estimatedEffort || bet.timeframe || 'Not provided'}",
    "variance": "<on track / optimistic / very optimistic / pessimistic>",
    "reasoning": "<Why this estimate, citing: scope complexity, org history, industry benchmarks, team capability, similar implementations from web search>",
    "risk_factors": "<Specific risks: new tech, team gaps, integration complexity, mobile/backend split, third-party dependencies>"
  },
  "suggestion": {
    "type": "<'alternative' if avg<60, 'complement' if 60-85, null if >85>",
    "reasoning": "<why, citing research AND org learnings>",
    "hypothesis": "<alternative/complement>",
    "metrics": "<alternative metrics>",
    "effort": "<estimate INCLUDING buffer for identified risks>",
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
    
    // Strip citation tags
    const stripCitations = (text) => {
      if (!text) return text;
      return text.replace(/<cite[^>]*>|<\/cite>/g, '');
    };
    
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
    if (scores.org_insights) {
      scores.org_insights = stripCitations(scores.org_insights);
    }
    if (scores.effort_estimate?.reasoning) {
      scores.effort_estimate.reasoning = stripCitations(scores.effort_estimate.reasoning);
    }
    if (scores.effort_estimate?.risk_factors) {
      scores.effort_estimate.risk_factors = stripCitations(scores.effort_estimate.risk_factors);
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
