const fs = require('fs-extra');
const path = require('path');

class SecurityValidator {
  static async scanContent(content) {
    const dangerousPatterns = [
      /eval\s*\(/i,
      /setTimeout\s*\(\s*['"]/i,
      /setInterval\s*\(\s*['"]/i,
      /document\.write\s*\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        throw new Error(`Security validation failed. Unsafe pattern detected: ${pattern}`);
      }
    }

    // Check for inline script tags or script tags without a src attribute in HTML
    const scriptTagRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptTagRegex.exec(content)) !== null) {
      const attributes = match[1];
      const body = match[2].trim();
      
      // If it contains actual inline JS code
      if (body.length > 0) {
        throw new Error('Security validation failed. Inline script content is not allowed in Manifest V3.');
      }
      
      // If it does not reference an external file via src
      if (!attributes.includes('src=')) {
        throw new Error('Security validation failed. Script tags must have a "src" attribute and no inline content.');
      }
    }

    return true;
  }

  static async validateManifest(manifestPath) {
    if (!await fs.pathExists(manifestPath)) {
      throw new Error('Manifest file is missing.');
    }

    try {
      const manifestStr = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestStr);

      if (manifest.manifest_version !== 3) {
        throw new Error('Only Manifest V3 is supported.');
      }

      if (!manifest.name || !manifest.version) {
        throw new Error('Manifest is missing required fields (name, version).');
      }

      // Check for dangerous permissions
      const dangerousPermissions = ['debugger', 'proxy', 'ttsEngine'];
      if (manifest.permissions) {
        manifest.permissions.forEach(perm => {
          if (dangerousPermissions.includes(perm)) {
            throw new Error(`Dangerous permission detected: ${perm}`);
          }
        });
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid manifest file: ${error.message}`);
    }
  }

  static async scanDirectory(dirPath) {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await this.scanDirectory(filePath);
      } else {
        // Only scan js and html files
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
