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
      console.log('AI Service: No GEMINI_API_KEY or OPENAI_API_KEY found. Falling back to local rule-based generation.');
      return null;
    }

    const systemInstruction = `You are a world-class Google Chrome Extension developer.
Generate a complete, fully functional, and visually stunning Chrome Extension (Manifest V3) based on the user's prompt.
You must return a valid JSON object containing all the source files (HTML, CSS, JS, manifest.json) needed for the extension.
Ensure all files are included so the extension runs immediately when unpacked in Chrome or Edge.
Ensure styling uses gorgeous premium modern designs (harmonious colors, dark mode, smooth gradients, subtle animations, glassmorphic cards).

════════════════════════════════════════════════
CRITICAL MANIFEST V3 RULES — NEVER VIOLATE THESE
════════════════════════════════════════════════

RULE 1 — NO INLINE SCRIPTS IN HTML:
  JavaScript code MUST NOT appear inside <script>...</script> in HTML files.
  ALL JS logic must be in a separate .js file (popup.js) referenced as <script src="popup.js"></script>.
  CSS MUST be in a separate .css file (popup.css) referenced as <link rel="stylesheet" href="popup.css">.

RULE 2 — MANIFEST V3 ONLY:
  Use "manifest_version": 3. Use "action" (NOT "browser_action").
  Background scripts: "background": { "service_worker": "background.js" }.
  Do NOT use Manifest V2 keys.

RULE 3 — ICONS:
  Declare "icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" } in manifest.json.
  Do NOT include binary PNG data in the files array. The backend generates icons automatically.

════════════════════════════════════════════════
MANDATORY FUNCTIONAL ARCHITECTURE — ALL 6 POINTS ARE REQUIRED
════════════════════════════════════════════════

POINT A — ON/OFF TOGGLE IN POPUP (REQUIRED IN EVERY EXTENSION):
  popup.html MUST have a prominent, beautiful toggle switch or button to enable/disable the extension.
  The toggle MUST show the current state (e.g. "Active ✓" vs "Inactive").
  popup.js MUST:
    1. On load: read chrome.storage.local.get("isActive") and update the toggle UI to match.
    2. On toggle click: set the new boolean in chrome.storage.local.set({ isActive: newValue }).
    3. Immediately apply or undo the effect on the current tab using chrome.scripting.executeScript.

POINT B — CONTENT SCRIPT THAT PERSISTS ACROSS PAGE LOADS (REQUIRED):
  content.js MUST be included and listed under content_scripts in manifest.json.
  Use: "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"], "run_at": "document_end" }]
  content.js MUST:
    1. On every page load, call chrome.storage.local.get("isActive", callback).
    2. If isActive === true → apply the extension's effect to this page.
    3. If isActive === false → do nothing, or safely remove any previously injected effect.
    4. Listen for chrome.storage.onChanged to reactively toggle the effect when changed from popup.

POINT C — BACKGROUND SERVICE WORKER (REQUIRED):
  background.js MUST be included.
  On chrome.runtime.onInstalled: initialize chrome.storage.local.set({ isActive: false }) if not already set.
  manifest.json MUST include: "background": { "service_worker": "background.js" }

POINT D — APPLY EFFECT IMMEDIATELY FROM POPUP (REQUIRED):
  When toggle turns ON in popup.js:
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: applyEffect });
    });
  When toggle turns OFF:
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: removeEffect });
    });
  applyEffect and removeEffect are standalone functions defined in popup.js (NOT references to content.js functions).

POINT E — REQUIRED PERMISSIONS (EVERY EXTENSION):
  manifest.json "permissions" MUST include: ["activeTab", "scripting", "storage"]
  If the extension runs on any website: "host_permissions": ["<all_urls>"]

POINT F — REAL, COMPLETE IMPLEMENTATION (NO STUBS):
  The extension MUST fully implement exactly what the user's prompt describes.
  For "block images → red squares": content.js must find all img/picture elements and replace them with styled red div elements with the original dimensions.
  For "dark mode": inject a CSS filter invert stylesheet.
  For "highlight links": inject a style that targets anchor elements.
  For "pomodoro timer": implement a full countdown timer with start/pause/reset in popup.js.
  The popup must display meaningful status text like "✓ Blocking images on this page" or "Click to activate".

════════════════════════════════════════════════
REQUIRED OUTPUT — EXACTLY THIS JSON STRUCTURE
════════════════════════════════════════════════

{
  "files": [
    {
      "path": "manifest.json",
      "content": "...valid MV3 JSON with name, version, description, action.default_popup=popup.html, background.service_worker=background.js, content_scripts pointing to content.js with <all_urls>, permissions=[activeTab,scripting,storage], host_permissions=[<all_urls>], icons..."
    },
    {
      "path": "popup.html",
      "content": "...premium dark-themed HTML with ON/OFF toggle, status text, NO inline scripts, <link rel=stylesheet href=popup.css>, <script src=popup.js>..."
    },
    {
      "path": "popup.css",
      "content": "...gorgeous modern CSS: dark background, smooth transitions, vibrant accent color, clean toggle switch styles..."
    },
    {
      "path": "popup.js",
      "content": "...reads isActive on load, renders toggle state, on toggle: updates storage + calls scripting.executeScript with applyEffect or removeEffect func..."
    },
    {
      "path": "content.js",
      "content": "...reads isActive from storage on every page load, applies or removes effect, listens for storage changes to react in real-time..."
    },
    {
      "path": "background.js",
      "content": "...chrome.runtime.onInstalled listener that initializes isActive:false in storage..."
    }
  ]
}

DO NOT output markdown, backticks, explanations, or any text outside the JSON. Output ONLY the raw valid JSON object.`;

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
      
      console.warn('AI Service: LLM response did not contain expected "files" array structure.');
      return null;
    } catch (err) {
      console.error('AI Service: Failed to generate custom extension via AI API:', err.message);
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
    // gemini-2.0-flash is the current stable model. gemini-1.5-flash was deprecated on v1.
    const model = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').split('/').pop();
    const urlV1   = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
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
      console.log(`AI Service: Attempting stable v1 endpoint...`);
      responseText = await this._makeHttpsPost(urlV1, requestBody);
    } catch (v1Err) {
      console.warn(`AI Service: v1 endpoint failed (${v1Err.message}). Retrying with v1beta...`);
      try {
        responseText = await this._makeHttpsPost(urlBeta, requestBody);
      } catch (betaErr) {
        console.warn(`AI Service: JSON mode may be unsupported. Final attempt without JSON config...`);
        try {
          // Deep-copy so we don't mutate the original requestBody object
          const fallbackBody = JSON.parse(JSON.stringify(requestBody));
          delete fallbackBody.generationConfig.responseMimeType;
          responseText = await this._makeHttpsPost(urlBeta, fallbackBody);
        } catch (finalErr) {
          console.error(`AI Service: All Gemini attempts failed.`);
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
    
    console.log(`AI Service: Contacting OpenAI API using model ${model}...`);
    
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
