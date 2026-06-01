const fs = require('fs-extra');
const path = require('path');
const SecurityValidator = require('../utils/securityValidator');

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

      // 2. Run central Security Manifest Validation
      try {
        await SecurityValidator.validateManifestObject(manifest);
      } catch (err) {
        report.isValid = false;
        report.errors.push(`CRITICAL: ${err.message}`);
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

      if (manifest.action && manifest.action.default_icon) {
        if (typeof manifest.action.default_icon === 'string') {
          referencedFiles.add(manifest.action.default_icon);
        } else if (typeof manifest.action.default_icon === 'object') {
          Object.values(manifest.action.default_icon).forEach(iconPath => {
            referencedFiles.add(iconPath);
          });
        }
      }

      // Check icons
      if (manifest.icons) {
        Object.values(manifest.icons).forEach(iconPath => referencedFiles.add(iconPath));
      } else {
        report.warnings.push('Warning: No icons defined in manifest.json.');
      }

      referencedFiles.forEach(file => {
        if (!filesMap[file]) {
          report.isValid = false;
          report.errors.push(`CRITICAL: Referenced file "${file}" is missing from the generated project.`);
        }
      });

      // 4. Basic static analysis for JS and HTML files
      for (const [filename, content] of Object.entries(filesMap)) {
        if (filename.endsWith('.js') || filename.endsWith('.html')) {
          try {
            await SecurityValidator.scanContent(content);
          } catch (err) {
            report.isValid = false;
            report.errors.push(`SECURITY: ${err.message} in ${filename}`);
          }
        }
      }

    } catch (error) {
      report.isValid = false;
      report.errors.push(`Validation process failed: ${error.message}`);
    }

    return report;
  }
}

module.exports = ValidationService;
