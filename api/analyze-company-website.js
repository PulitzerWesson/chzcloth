export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { website, userContext } = req.body;
    
    if (!website) {
      return res.status(400).json({ error: 'Website URL required' });
    }
    
    // Normalize URL
    let url = website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Call Claude API with web_fetch to analyze the website
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
          content: `Analyze this company's website: ${url}

${userContext ? `USER PROVIDED CONTEXT:\n${userContext}\n\n` : ''}Use web_fetch to visit the homepage and extract:

1. WHAT THEY DO (1-2 sentences)
   - Core product/service
   - Primary value proposition

2. TARGET MARKET
   - Who are their customers?
   - Company size, industry, role

3. BUSINESS MODEL SIGNALS
   - Pricing page exists? (enterprise focus vs self-serve)
   - Free trial mentioned?
   - Revenue model clues

4. STAGE INDICATORS
   - Customer logos/testimonials
   - "Trusted by X companies"
   - Case studies
   - Team size mentions

5. KEY DIFFERENTIATORS
   - What makes them unique vs competitors
   - Main features emphasized

Return as a concise narrative paragraph (150-250 words) suitable for use in evaluating product bets. Focus on facts that would help determine if a product bet aligns with this company's strategy and market position.

If the website can't be accessed or analyzed, return: "Website analysis unavailable - using user context only"`
        }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Claude API error:', data.error);
      return res.status(500).json({ error: 'Analysis failed' });
    }
    
    // Extract text response
    let analysis = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        analysis += block.text;
      }
    }
    
    if (!analysis) {
      return res.status(500).json({ error: 'No analysis returned' });
    }
    
    return res.status(200).json({ 
      ai_context: analysis.trim()
    });
    
  } catch (error) {
    console.error('Website analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
}
