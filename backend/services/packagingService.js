const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const SecurityValidator = require('../utils/securityValidator');

class PackagingService {
  /**
   * Takes a JSON blueprint of files, validates them, writes to a temp dir, and zips them.
   * @param {Object} filesJson - Format: { "manifest.json": "{...}", "content.js": "..." }
   * @returns {Promise<string>} - Path to the generated ZIP file
   */
  static async packageExtension(filesJson) {
    const sessionId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp_workspaces', sessionId);
    const zipPath = path.join(__dirname, '../../temp_workspaces', `${sessionId}.zip`);

    try {
      // 1. Create isolated workspace
      await fs.ensureDir(tempDir);

      // 2. Write files
      for (const [filename, content] of Object.entries(filesJson)) {
        // Prevent directory traversal attacks
        const safeFilename = path.basename(filename);
        const filePath = path.join(tempDir, safeFilename);
        await fs.writeFile(filePath, content, 'utf-8');
      }

      // 3. Validate integrity and security
      const manifestPath = path.join(tempDir, 'manifest.json');
      await SecurityValidator.validateManifest(manifestPath);
      await SecurityValidator.scanDirectory(tempDir);

      // 4. Create ZIP archive
      await this.createZipArchive(tempDir, zipPath);

      // 5. Clean up temp directory (keep the zip for storage service)
      await fs.remove(tempDir);

      return zipPath;

    } catch (error) {
      // Clean up everything on failure
      await fs.remove(tempDir).catch(() => {});
      await fs.remove(zipPath).catch(() => {});
      throw new Error(`Packaging failed: ${error.message}`);
    }
  }

  static createZipArchive(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(outPath));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}

module.exports = PackagingService;
