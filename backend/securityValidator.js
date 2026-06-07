/**
 * SecurityValidator Utility
 * Handles validation of generated extension code and manifest files.
 */

const SecurityValidator = {
  /**
   * Validates the manifest.json content to ensure it meets Chrome MV3 standards
   * and doesn't contain malicious permission requests.
   * @param {string|object} content - The manifest file content
   */
  validateManifest: (content) => {
    try {
      const manifest = typeof content === 'string' ? JSON.parse(content) : content;

      // 1. Basic Structure Validation
      if (!manifest || !manifest.name || !manifest.version || !manifest.manifest_version) {
        throw new Error('Manifest is missing required fields (name, version, manifest_version).');
      }

      // 2. Version Check (Enforce MV3)
      if (parseInt(manifest.manifest_version) !== 3) {
        throw new Error('Extensio.ai only supports Chrome Manifest V3.');
      }

      // 3. Security Check (Dangerous Permissions)
      const dangerousPermissions = ['debugger', 'webRequestBlocking', 'proxy'];
      if (manifest.permissions) {
        const foundDangerous = manifest.permissions.filter(p => dangerousPermissions.includes(p));
        if (foundDangerous.length > 0) {
          throw new Error(`Dangerous permissions detected: ${foundDangerous.join(', ')}`);
        }
      }

      return true;
    } catch (err) {
      throw new Error(`Security Check Failed: ${err.message}`);
    }
  }
};

module.exports = SecurityValidator;