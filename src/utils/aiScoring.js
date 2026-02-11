// AI Scoring Utilities with Web Search
// Uses Anthropic API with web_search tool for real-time market intelligence

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Search for related signals to an idea
 */
export async function searchRelatedSignals(ideaContent, existingSignals) {
  if (!existingSignals || existingSignals.length === 0) {
    return { count: 0, matches: [] };
  }

  // Simple keyword matching for now
  // TODO: Could enhance with semantic similarity using embeddings
  const keywords = ideaContent.problem?.toLowerCase().split(' ').filter(w => w.length > 4) || [];
  
  const matches = existingSignals.filter(signal => {
    const signalText = signal.description?.toLowerCase() || '';
    return keywords.some(keyword => signalText.includes(keyword));
  });

  return {
    count: matches.length,
    matches: matches.slice(0, 5) // Top 5 matches
  };
}

/**
 * Score an Idea using AI with web search
 */
export async function scoreIdea(ideaData, orgContext, relatedSignals) {
  const prompt = `You are evaluating a product idea for a company. Provide detailed scoring with real-time market research.

IDEA DETAILS:
- Problem: ${ideaData.problem}
- Proposal: ${ideaData.proposal || ideaData.description}
- Reach: ${ideaData.reach || 'Not specified'}
- Expected Impact: ${ideaData.expectedImpact || ideaData.impact || 'Not specified'}

ORGANIZATION CONTEXT:
- Company: ${orgContext.name}
- Mode: ${orgContext.mode} (startup/enterprise)
- Strategy: ${orgContext.companyInfo?.strategy || 'Not specified'}
- Industry: ${orgContext.companyInfo?.industry || 'Not specified'}

DEMAND SIGNALS:
- Found ${relatedSignals.count} related internal signals
${relatedSignals.matches.map(s => `- "${s.description?.substring(0, 100)}..."`).join('\n')}

INSTRUCTIONS:
1. Search the web for current industry trends related to this idea
2. Look for competitive intelligence on similar solutions
3. Check for recent consulting firm reports or analyses (Deloitte, McKinsey, BCG, Gartner)
4. Evaluate market timing and momentum

Based on ALL this context, provide:

{
  "viability_score": <0-100>,
  "relevance_score": <0-100>,
  "overall_score": <0-100>,
  "rationale": "<Comprehensive explanation covering: technical feasibility, market trends from your research, signal support, competitive landscape, and strategic fit. Cite specific findings from web search.>",
  "market_insights": "<Key findings from web search about industry trends and competitive landscape>",
  "signal_support": "<How the ${relatedSignals.count} internal signals validate this idea>",
  "suggestion": {
    "type": "<'alternative' if overall_score < 60, 'complement' if 60-85, null if >85>",
    "reasoning": "<Why this suggestion would be stronger, citing market research>",
    "problem": "<Alternative/complementary problem statement>",
    "proposal": "<Alternative/complementary solution>",
    "reach": "<Who this impacts>",
    "impact": "<Expected outcome>",
    "expected_score": <projected score 0-100>,
    "market_evidence": "<Specific web search findings supporting this suggestion>"
  }
}

SUGGESTION GUIDELINES:
- If score < 60 (ALTERNATIVE): Suggest a different angle based on market research. Look for: better market timing, less competition, stronger signal support, or clearer path to value.
- If score 60-85 (COMPLEMENT): Suggest an addition that strengthens the idea. Examples: expanding scope, adding a feature that research shows improves success, pairing with another capability.
- If score > 85: Set suggestion to null - the idea is strong as-is.

Frame suggestions positively: "Market research shows..." not "Your idea is weak..."

Return ONLY the JSON object, no other text.`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
      })
    });

    const data = await response.json();
    
    // Extract text from response (handling tool use)
    let fullText = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }

    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scores = JSON.parse(jsonMatch[0]);
      return {
        viability_score: scores.viability_score,
        relevance_score: scores.relevance_score,
        overall_score: scores.overall_score,
        scoring_rationale: scores.rationale,
        market_insights: scores.market_insights,
        signal_count: relatedSignals.count,
        suggestion: scores.suggestion // Include AI suggestion
      };
    }

    throw new Error('Could not parse AI scoring response');

  } catch (error) {
    console.error('Error scoring idea:', error);
    throw error;
  }
}

/**
 * Score a Bet using AI with web search
 */
export async function scoreBet(betData, orgContext) {
  const prompt = `You are evaluating a product bet with measurable metrics. Provide detailed scoring with real-time market research.

BET DETAILS:
- Hypothesis: ${betData.hypothesis}
- Success Metrics: ${betData.metrics || betData.prediction}
- Estimated Effort: ${betData.effort || betData.estimatedEffort || 'Not specified'}
- Strategic Alignment: ${betData.strategicAlignment || 'Not specified'}
- Assumptions: ${betData.assumptions || 'Not specified'}

ORGANIZATION CONTEXT:
- Company: ${orgContext.name}
- Mode: ${orgContext.mode} (startup/enterprise)
- Strategy: ${orgContext.companyInfo?.strategy || 'Not specified'}
- Industry: ${orgContext.companyInfo?.industry || 'Not specified'}

INSTRUCTIONS:
1. Search the web for similar initiatives in the industry
2. Look for success/failure case studies
3. Check industry benchmarks for similar metrics
4. Find recent research on this approach
5. Assess competitive landscape and market timing

Based on ALL this context, provide:

{
  "approach_score": <0-100>,
  "approach_rationale": "<Detailed assessment of execution plan quality, citing similar cases from web research>",
  "potential_score": <0-100>,
  "potential_rationale": "<Assessment of upside magnitude based on industry benchmarks and market research>",
  "fit_score": <0-100>,
  "fit_rationale": "<Strategic alignment considering competitive landscape and market timing>",
  "overall_score": <0-100>,
  "market_context": "<Key findings from web search about industry trends, benchmarks, and competitive intelligence>",
  "risk_factors": "<Potential risks identified from research>",
  "success_factors": "<Critical success factors based on industry best practices>",
  "suggestion": {
    "type": "<'alternative' if overall_score < 60, 'complement' if 60-85, null if >85>",
    "reasoning": "<Why this suggestion would score higher, citing market research and competitive intelligence>",
    "hypothesis": "<Alternative/complementary hypothesis>",
    "metrics": "<Alternative/complementary success metrics>",
    "effort": "<Effort estimate>",
    "expected_score": <projected score 0-100>,
    "market_evidence": "<Specific web search findings, case studies, or benchmarks supporting this suggestion>",
    "competitive_insight": "<How competitors approached similar challenges>"
  }
}

SUGGESTION GUIDELINES:
- If score < 60 (ALTERNATIVE): Suggest a fundamentally different approach. Look for: similar goals achieved differently (competitor case studies), faster paths to validation, or pivot based on market trends.
- If score 60-85 (COMPLEMENT): Suggest an addition that strengthens the bet. Examples: adding a metric that research shows matters, expanding scope based on successful case studies, or phasing approach differently.
- If score > 85: Set suggestion to null - the bet is strong as-is.

Frame suggestions with market evidence: "3 competitors achieved this by..." or "Industry benchmark shows..." not "You should change this..."

Return ONLY the JSON object, no other text.`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
      })
    });

    const data = await response.json();
    
    // Extract text from response (handling tool use)
    let fullText = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }

    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scores = JSON.parse(jsonMatch[0]);
      return {
        approachScore: scores.approach_score,
        potentialScore: scores.potential_score,
        fitScore: scores.fit_score,
        scoringRationale: {
          approach: {
            score: scores.approach_score,
            rationale: scores.approach_rationale
          },
          potential: {
            score: scores.potential_score,
            rationale: scores.potential_rationale
          },
          fit: {
            score: scores.fit_score,
            rationale: scores.fit_rationale
          },
          marketContext: scores.market_context,
          riskFactors: scores.risk_factors,
          successFactors: scores.success_factors
        },
        suggestion: scores.suggestion // Include AI suggestion
      };
    }

    throw new Error('Could not parse AI scoring response');

  } catch (error) {
    console.error('Error scoring bet:', error);
    throw error;
  }
}

/**
 * Helper to format org context from currentOrg object
 */
export function formatOrgContext(currentOrg) {
  return {
    name: currentOrg?.name || 'Unknown Company',
    mode: currentOrg?.mode || 'startup',
    companyInfo: {
      strategy: currentOrg?.strategy,
      industry: currentOrg?.industry,
      website: currentOrg?.website
    }
  };
}
