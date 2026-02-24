// api/parse-narrative.js - AI parsing of narrative bet submissions with logging

// Retry helper — handles Anthropic 529 overloaded errors gracefully
async function callWithRetry(fn, maxAttempts = 3) {
  let lastResponse;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    lastResponse = await fn();
    if (lastResponse.status !== 529) return lastResponse;
    if (attempt < maxAttempts) {
      const wait = attempt * 1500;
      console.log(`Anthropic overloaded (attempt ${attempt}/${maxAttempts}), retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  return lastResponse;
}

export default async function handler(req, res) {
  // COMPREHENSIVE LOGGING FOR DEBUGGING
  console.log('=== PARSE NARRATIVE REQUEST START ===');
  console.log('Method:', req.method);
  console.log('Timestamp:', new Date().toISOString());
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body exists:', !!req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    const { narrative, goalContext, uploadedFile } = req.body;
    
    console.log('Parsed request data:', {
      hasNarrative: !!narrative,
      narrativeLength: narrative?.length || 0,
      hasGoalContext: !!goalContext,
      goalLength: goalContext?.length || 0,
      hasUploadedFile: !!uploadedFile,
      fileType: uploadedFile?.type || 'none',
      fileDataLength: uploadedFile?.data?.length || 0
    });

    // Build the prompt
    const promptText = `Analyze this product bet and return ONLY valid JSON.

Goal: ${goalContext}

${narrative?.trim() ? `Bet Narrative:\n${narrative}\n` : ''}
${uploadedFile ? 'A supporting document has been provided with additional context.' : ''}

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
- Extract "change" with specificity - flag as weak if vague (e.g., "improve conversion", "add features", "make it better")
- Good scope is specific: "Add 5 video testimonials to pricing page" vs bad: "Improve social proof"
- Estimate effort based on what they're building (simple UI change = 1-sprint, new feature = 2-3-sprints, complex system = 4-6-sprints, major platform = 6-plus-sprints)
- Only flag "validation" issue if they have NO evidence at all (no tests, no interviews, no data)
- Flag "change" as weak if the scope is unclear or too broad
- If field is missing, use empty string
- Keep all text values concise
- Return ONLY the JSON`;

    // Build message content - different structure for file vs no file
    let messageContent;
    
    if (uploadedFile) {
      console.log('Building MULTI-PART content (text + document)');
      console.log('Uploaded file type:', uploadedFile.type);
      
      messageContent = [
        { 
          type: 'text', 
          text: promptText 
        },
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: uploadedFile.type,
            data: uploadedFile.data
          }
        }
      ];
      console.log('Multi-part content built with structure:', {
        contentParts: 2,
        documentSource: {
          type: 'base64',
          media_type: uploadedFile.type,
          dataLength: uploadedFile.data?.length
        }
      });
    } else {
      console.log('Building TEXT-ONLY content');
      messageContent = promptText;
      console.log('Text-only content built successfully');
    }

    console.log('Calling Anthropic API...');
    console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key prefix:', process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...');
    
    const apiPayload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: messageContent
      }]
    };
    
    console.log('API payload structure:', {
      model: apiPayload.model,
      max_tokens: apiPayload.max_tokens,
      messageCount: apiPayload.messages.length,
      contentType: Array.isArray(messageContent) ? 'array' : 'string',
      contentParts: Array.isArray(messageContent) ? messageContent.length : 1
    });

    const response = await callWithRetry(() => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(apiPayload)
    }));

    console.log('Anthropic API response status:', response.status);
    console.log('Response OK:', response.ok);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Anthropic API returned error:', {
        status: response.status,
        error: data.error,
        type: data.type
      });
      throw new Error(data.error?.message || `Anthropic API error: ${response.status}`);
    }

    console.log('Anthropic response received, parsing...');
    console.log('Response content length:', data.content?.length);
    console.log('First content type:', data.content?.[0]?.type);

    const text = data.content[0].text;
    console.log('Extracted text length:', text?.length);
    
    // Try to extract JSON
    let jsonText = text.trim();
    
    if (jsonText.startsWith('```')) {
      console.log('Response wrapped in markdown, extracting...');
      const match = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (match) {
        jsonText = match[1];
        console.log('Extracted from markdown successfully');
      }
    }
    
    console.log('Parsing JSON...');
    const parsed = JSON.parse(jsonText);
    console.log('JSON parsed successfully');
    console.log('Parsed keys:', Object.keys(parsed));

    console.log('=== REQUEST COMPLETED SUCCESSFULLY ===');
    return res.status(200).json(parsed);
    
  } catch (error) {
    console.error('=== ERROR IN PARSE NARRATIVE ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return proper JSON error
    return res.status(500).json({ 
      error: error.message || 'Unknown error',
      errorName: error.name,
      timestamp: new Date().toISOString(),
      fallback: {
        extracted: {},
        goalAlignment: { aligned: false, reasoning: "Analysis failed - check logs" },
        issues: [{ 
          field: "analysis", 
          severity: "missing", 
          message: `Error: ${error.message}` 
        }],
        strengths: [],
        readyToScore: false
      }
    });
  }
}
