const fs = require('fs-extra');
const path = require('path');

class ValidationService {
  static async validateProject(filesMap) {
    const report = {
      isValid: true,
      errors: [],
      warnings: [],
      filesChecked: Object.keys(filesMap).length
    };

    try {
      // 1. Check if manifest.json exists
      if (!filesMap['manifest.json']) {
        report.isValid = false;
        report.errors.push('CRITICAL: manifest.json is missing.');
        return report;
      }

      // 2. Validate manifest.json syntax and contents
      let manifest;
      try {
        manifest = JSON.parse(filesMap['manifest.json']);
      } catch (e) {
        report.isValid = false;
        report.errors.push('CRITICAL: manifest.json contains invalid JSON syntax.');
        return report;
      }

      if (!manifest.name || !manifest.version) {
        report.isValid = false;
        report.errors.push('CRITICAL: manifest.json is missing required fields (name, version).');
      }

      if (manifest.manifest_version !== 3) {
        report.warnings.push('Warning: Extension is not using Manifest V3.');
      }

      // 3. Verify referenced files exist in the map
      const referencedFiles = new Set();
      
      if (manifest.background && manifest.background.service_worker) {
        referencedFiles.add(manifest.background.service_worker);
      }
      
      if (manifest.content_scripts) {
        manifest.content_scripts.forEach(script => {
          if (script.js) script.js.forEach(file => referencedFiles.add(file));
          if (script.css) script.css.forEach(file => referencedFiles.add(file));
        });
      }

      if (manifest.action && manifest.action.default_popup) {
        referencedFiles.add(manifest.action.default_popup);
      }

      referencedFiles.forEach(file => {
        if (!filesMap[file]) {
          report.isValid = false;
          report.errors.push(`CRITICAL: Referenced file "${file}" is missing from the generated project.`);
        }
      });

      // 4. Basic static analysis for JS files
      Object.entries(filesMap).forEach(([filename, content]) => {
        if (filename.endsWith('.js')) {
          if (/eval\s*\(/.test(content)) {
            report.isValid = false;
            report.errors.push(`SECURITY: Unsafe 'eval()' usage detected in ${filename}.`);
          }
          if (/document\.write\s*\(/.test(content)) {
            report.warnings.push(`Warning: 'document.write' used in ${filename}. This is generally discouraged.`);
          }
        }
      });

    } catch (error) {
      report.isValid = false;
      report.errors.push(`Validation process failed: ${error.message}`);
    }

    return report;
  }
}

module.exports = ValidationService;
