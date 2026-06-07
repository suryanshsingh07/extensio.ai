const https = require('https');
const { URL } = require('url');

class AIService {
  /**
   * Generates a custom Chrome Extension using Gemini or OpenAI based on env variables.
   * Falls back to returning null if no keys are found or if the API call fails.
   * 
   * @param {string} promptText The prompt describing the extension.
   * @returns {Promise<Array<{path: string, content: string}> | null>} The generated files or null on failure/fallback.
   */
  static async generateExtension(promptText) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      console.log('💡 AI Service: No GEMINI_API_KEY or OPENAI_API_KEY found. Falling back to local rule-based generation.');
      return null;
    }

    const systemInstruction = `You are a world-class Google Chrome Extension developer.
Generate a complete, fully functional, and visually stunning Chrome Extension (Manifest V3) based on the user's prompt.
You must return a valid JSON object containing all the source files (HTML, CSS, JS, manifest.json) needed for the extension.
Ensure all files are included so the extension runs immediately when unpacked.
Ensure styling uses gorgeous premium modern designs (harmonious colors, dark mode, smooth gradients, subtle animations, or glassmorphic cards).

CRITICAL MANIFEST V3 SECURITY AND FUNCTIONALITY RULES:
1. NO INLINE SCRIPTS IN HTML: Placing JavaScript code directly inside <script>...</script> tags in HTML files (like popup.html) is STRICTLY PROHIBITED. All JS logic must reside in a separate external file (e.g. popup.js) and referenced via <script src="popup.js"></script>.
2. MANIFEST V3 STANDARD: Do not use Manifest V2 keys. Use "action" instead of "browser_action". Background scripts must be defined as service workers: "background": { "service_worker": "background.js" }.
3. EXTENSION ICON STANDARDS: Define PNG icons under "icons" in manifest.json (i.e. "icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }). Do NOT generate or include raw binary icon files in the "files" array (since PNG is binary). The backend will automatically generate beautiful matching PNG icons for the exact icon paths you declare.
4. NO PLACEHOLDERS: All generated JS, CSS, and HTML must be complete and fully functional in real life. Implement the user's requested logic thoroughly without comments saying "implement here".

The output MUST be a single JSON object with this exact structure:
{
  "files": [
    {
      "path": "manifest.json",
      "content": "..." // string containing the manifest.json contents (valid JSON string matching MV3 specs)
    },
    {
      "path": "popup.html",
      "content": "..." // gorgeous premium popup html referencing popup.js and popup.css (NO inline scripts!)
    },
    {
      "path": "popup.js",
      "content": "..." // clean interactive javascript containing all popup logic
    },
    {
      "path": "popup.css",
      "content": "..." // stylish styling for popup.html
    }
  ]
}

DO NOT output any markdown formatting, no backticks, no explanations, no comments outside the JSON. Just the raw, valid JSON object.`;

    try {
      let rawResponse = '';
      if (geminiKey) {
        rawResponse = await this._callGemini(geminiKey, systemInstruction, promptText);
      } else {
        rawResponse = await this._callOpenAI(openaiKey, systemInstruction, promptText);
      }

      if (!rawResponse) return null;

      // Clean markdown code blocks if the AI ignored instructions
      let cleanJsonText = rawResponse.trim();
      if (cleanJsonText.startsWith('```json')) {
        cleanJsonText = cleanJsonText.substring(7);
      } else if (cleanJsonText.startsWith('```')) {
        cleanJsonText = cleanJsonText.substring(3);
      }
      if (cleanJsonText.endsWith('```')) {
        cleanJsonText = cleanJsonText.substring(0, cleanJsonText.length - 3);
      }
      cleanJsonText = cleanJsonText.trim();

      const parsed = JSON.parse(cleanJsonText);
      if (parsed && Array.isArray(parsed.files)) {
        console.log(`✓ AI Service: Successfully generated ${parsed.files.length} custom files via LLM.`);
        return parsed.files;
      }
      
      console.warn('⚠ AI Service: LLM response did not contain expected "files" array structure.');
      return null;
    } catch (err) {
      console.error('⚠ AI Service: Failed to generate custom extension via AI API:', err.message);
      return null; // Safe fallback
    }
  }

  /**
   * Helper to perform a zero-dependency POST request using Node https module
   */
  static _makeHttpsPost(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(data);
      
      const options = {
        method: 'POST',
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        },
        timeout: 25000 // 25s timeout for AI generation
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('API request timed out after 25 seconds'));
      });

      req.on('error', (err) => reject(err));
      req.write(postData);
      req.end();
    });
  }

  static async _callGemini(apiKey, systemInstruction, promptText) {
    // Ensure model name is clean. Google expects "gemini-1.5-flash", not "models/gemini-1.5-flash" in the URL path.
    const model = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').split('/').pop();
    const urlV1 = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    const urlBeta = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log(`AI Service: Contacting Gemini API using model ${model}...`);
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nUser Prompt: Create a Chrome Extension for: "${promptText}"`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    };

    let responseText;
    try {
      console.log(`🤖 AI Service: Attempting stable v1 endpoint...`);
      responseText = await this._makeHttpsPost(urlV1, requestBody);
    } catch (v1Err) {
      console.warn(`⚠ AI Service: v1 endpoint failed (${v1Err.message}). Retrying with v1beta...`);
      try {
        responseText = await this._makeHttpsPost(urlBeta, requestBody);
      } catch (betaErr) {
        console.warn(`⚠ AI Service: JSON mode may be unsupported. Final attempt without JSON config...`);
        try {
          const fallbackBody = { ...requestBody };
          delete fallbackBody.generationConfig.responseMimeType;
          responseText = await this._makeHttpsPost(urlV1, fallbackBody);
        } catch (finalErr) {
          console.error(`❌ AI Service: All Gemini attempts failed.`);
          throw new Error(`Gemini API Error: ${finalErr.message}`);
        }
      }
    }

    const result = JSON.parse(responseText);
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      return result.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Malformed Gemini response structure');
  }

  static async _callOpenAI(apiKey, systemInstruction, promptText) {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';
    
    console.log(`🤖 AI Service: Contacting OpenAI API using model ${model}...`);
    
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Create a Chrome Extension for: "${promptText}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    };

    const headers = {
      'Authorization': `Bearer ${apiKey}`
    };

    const responseText = await this._makeHttpsPost(url, requestBody, headers);
    const result = JSON.parse(responseText);
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      return result.choices[0].message.content;
    }
    
    throw new Error('Malformed OpenAI response structure');
  }
}

module.exports = AIService;
