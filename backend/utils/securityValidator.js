const fs = require('fs-extra');
const path = require('path');

class SecurityValidator {
  /**
   * Scans JS or HTML file content for genuinely dangerous patterns.
   * Allows patterns that are legitimate in Chrome Extension Manifest V3 contexts.
   */
  static async scanContent(content) {
    // Only these patterns are truly dangerous in extension code:
    // - eval() — executes arbitrary strings as code
    // - document.write() — legacy, blocked by MV3 CSP anyway
    // NOTE: .innerHTML is ALLOWED in extension popups (popup.js runs in an isolated
    //       popup context, not injected into web pages). MV3 CSP only restricts
    //       inline scripts in HTML files, not DOM manipulation in JS files.
    // NOTE: setTimeout/setInterval with function refs is fine; we only block string evals.
    const dangerousPatterns = [
      { pattern: /\beval\s*\(/i, description: 'eval() is not allowed' },
      { pattern: /document\.write\s*\(/i, description: 'document.write() is not allowed' },
      // Block setTimeout/setInterval only when called with a string literal (eval-equivalent)
      { pattern: /setTimeout\s*\(\s*["'`][^"'`]*["'`]/i, description: 'setTimeout with string argument (eval-equivalent) is not allowed' },
      { pattern: /setInterval\s*\(\s*["'`][^"'`]*["'`]/i, description: 'setInterval with string argument (eval-equivalent) is not allowed' },
    ];

    for (const { pattern, description } of dangerousPatterns) {
      if (pattern.test(content)) {
        throw new Error(`Security validation failed: ${description}`);
      }
    }

    // For HTML files: check for inline script content.
    // A <script> tag is only problematic if it has JS code inside its body.
    // <script src="popup.js"></script> (empty body) is fine and required.
    if (content.includes('<script')) {
      // Extract all <script> tags that do NOT have a src attribute
      const inlineScriptRegex = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = inlineScriptRegex.exec(content)) !== null) {
        const body = match[1].trim();
        // Only flag if there is actual JavaScript code in the body
        // (ignore empty bodies and whitespace-only bodies)
        if (body.length > 0) {
          throw new Error(
            'Security validation failed: Inline JavaScript inside <script> tags is not allowed in Manifest V3. ' +
            'Move all JS to an external file (e.g. popup.js) and reference it with <script src="popup.js"></script>.'
          );
        }
      }
    }

    return true;
  }

  /**
   * Reads a manifest file from disk and validates its structure.
   * @param {string} filePath
   */
  static async validateManifest(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const manifest = JSON.parse(content);
    return this.validateManifestObject(manifest);
  }

  static async validateManifestObject(manifest) {
    try {
      if (manifest.manifest_version !== 3) {
        throw new Error('Only Manifest V3 is supported.');
      }

      if (!manifest.name || !manifest.version) {
        throw new Error('Manifest is missing required fields (name, version).');
      }

      // Permissions that are genuinely dangerous or require special review
      const dangerousPermissions = ['debugger', 'proxy', 'ttsEngine', 'webRequestBlocking'];
      const allPerms = [
        ...(manifest.permissions || []),
        ...(manifest.optional_permissions || []),
      ];

      for (const perm of allPerms) {
        if (dangerousPermissions.includes(perm)) {
          throw new Error(`Dangerous permission detected: "${perm}". This permission is not allowed.`);
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid manifest file: ${error.message}`);
    }
  }

  /**
   * Recursively scans a directory and validates JS/HTML files.
   */
  static async scanDirectory(dirPath) {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await this.scanDirectory(filePath);
      } else {
        if (file.endsWith('.js') || file.endsWith('.html')) {
          const content = await fs.readFile(filePath, 'utf-8');
          await this.scanContent(content);
        }
      }
    }
    return true;
  }
}

module.exports = SecurityValidator;
