require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
let genAI = null;
let model = null;

async function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables. Gemini analysis will be disabled.');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names in order of preference
    // Prioritizing Gemini 2.0/2.5 models first, then fallback to 1.5
    const modelNames = [
      // Gemini 2.0/2.5 models (newest - try these first)
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking-exp',
      'gemini-2.0-flash',
      'gemini-2.0-flash-latest',
      'gemini-exp-1206',
      'gemini-2.5-flash',
      'gemini-2.5-flash-exp',
      'gemini-2.5-pro',
      // Gemini 1.5 models (stable fallback)
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest', 
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      // Legacy models
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        
        // Test the model with a simple call to verify it works
        try {
          const testResult = await testModel.generateContent('test');
          await testResult.response;
          
          // If we get here, the model works!
          model = testModel;
          console.log(`✅ Gemini initialized with model: ${modelName}`);
          return model;
        } catch (testError) {
          // Model doesn't work, try next
          continue;
        }
      } catch (err) {
        // Error creating model instance, try next
        continue;
      }
    }
    
    // If all models fail, return null
    console.error('❌ No working Gemini models found. Please check your API key and model availability.');
    return null;
  } catch (error) {
    console.error('❌ Error initializing Gemini:', error.message);
    return null;
  }
}

// Initialize on module load (async, but don't block)
initializeGemini().catch(err => {
  console.error('❌ Failed to initialize Gemini on startup:', err.message);
});

/**
 * Analyzes a case using Gemini API
 * @param {Object} caseData - Case data with title, type, description, filer, defendant
 * @returns {Promise<Object>} Analysis result with summary, IPC violations, penalties, judgement, etc.
 */
async function analyzeCase(caseData) {
  // Check if Gemini is initialized
  if (!model) {
    const initialized = await initializeGemini();
    if (!initialized) {
      const errorMsg = 'Gemini API not initialized. Please check GEMINI_API_KEY in environment variables.';
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  const {
    case_title,
    case_type,
    case_description,
    filer,
    defendant,
    witnesses = []
  } = caseData;

  // Construct the prompt
  const prompt = `You are an expert legal AI assistant analyzing Indian legal cases. Analyze the following case and provide a comprehensive analysis in JSON format.

Case Details:
- Title: ${case_title || 'N/A'}
- Type: ${case_type || 'N/A'}
- Description: ${case_description || 'N/A'}
- Filer: ${filer?.fullName || 'N/A'}
- Defendant: ${defendant?.fullName || 'N/A'}
${witnesses.length > 0 ? `- Witnesses: ${witnesses.map(w => w.fullName || 'N/A').join(', ')}` : ''}

Please provide a detailed analysis in the following JSON format:
{
  "summary": "A comprehensive summary of the case, including key facts, parties involved, and the nature of the dispute or offense.",
  "ipc_violations": ["IPC Section XXX", "IPC Section YYY"],
  "penalties": [
    {
      "section": "IPC Section XXX",
      "penalty": "Detailed penalty description including imprisonment term, fine amount, or other punishments as per Indian Penal Code",
      "severity": "high|medium|low"
    }
  ],
  "judgement": "guilty|not_guilty|insufficient_evidence",
  "reasoning": "Detailed reasoning explaining why this judgement was reached, including analysis of evidence, legal precedents, and key factors considered.",
  "confidence_score": 0.85,
  "probability": 0.82,
  "key_points": [
    "Key point 1 that led to this decision",
    "Key point 2 that led to this decision",
    "Key point 3 that led to this decision"
  ]
}

Important Guidelines:
1. For IPC violations, use standard IPC section format (e.g., "IPC Section 302", "IPC Section 304A")
2. If no IPC violations are found (e.g., civil cases), return empty arrays
3. Confidence score and probability should be between 0 and 1
4. Judgement should be one of: "guilty", "not_guilty", or "insufficient_evidence"
5. Provide realistic penalties based on Indian Penal Code
6. Reasoning should be detailed and legally sound
7. Key points should be specific and relevant to the case

Return ONLY valid JSON, no additional text or markdown formatting.`;

  let text = '';
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();

    // Parse JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const analysis = JSON.parse(jsonText);

    // Validate and structure the response
    return {
      summary: analysis.summary || '',
      ipc_section_violated: Array.isArray(analysis.ipc_violations) ? analysis.ipc_violations : [],
      penalties: Array.isArray(analysis.penalties) ? analysis.penalties : [],
      reasoning: analysis.reasoning || '',
      confidence_score: typeof analysis.confidence_score === 'number' 
        ? Math.max(0, Math.min(1, analysis.confidence_score)) 
        : 0.5,
      probability: typeof analysis.probability === 'number' 
        ? Math.max(0, Math.min(1, analysis.probability)) 
        : 0.5,
      key_points: Array.isArray(analysis.key_points) ? analysis.key_points : [],
      ml_prediction: {
        label: analysis.judgement || 'insufficient_evidence',
        details: {
          judgement: analysis.judgement || 'insufficient_evidence',
          key_points: Array.isArray(analysis.key_points) ? analysis.key_points : []
        }
      }
    };
  } catch (error) {
    console.error('❌ Error analyzing case with Gemini:', error.message);
    
    // If JSON parsing failed, log the raw response for debugging
    if (error.message.includes('JSON') && text) {
      console.error('Raw Gemini response:', text);
    }
    
    throw new Error(`Gemini analysis failed: ${error.message}`);
  }
}

module.exports = {
  analyzeCase,
  initializeGemini
};

