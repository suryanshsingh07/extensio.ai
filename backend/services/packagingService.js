const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const SecurityValidator = require('../utils/securityValidator');

class PackagingService {
  /**
   * Takes a JSON blueprint or array of files, validates them, writes to a temp dir, and zips them.
   * @param {Object|Array} filesInput - Format: { "manifest.json": "..." } OR [{ path: "manifest.json", content: "..." }]
   * @returns {Promise<string>} - Path to the generated ZIP file
   */
  static async packageExtension(filesInput) {
    const sessionId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp_workspaces', sessionId);
    const zipPath = path.join(__dirname, '../../temp_workspaces', `${sessionId}.zip`);

    try {
      // 1. Create isolated workspace
      await fs.ensureDir(tempDir);

      // Normalize input files to an array of { path, content }
      let files = [];
      if (Array.isArray(filesInput)) {
        files = filesInput;
      } else if (typeof filesInput === 'object' && filesInput !== null) {
        files = Object.entries(filesInput).map(([filepath, content]) => ({
          path: filepath,
          content
        }));
      }

      // 2. Write files (preserving subdirectories securely)
      const resolvedTempDir = path.resolve(tempDir);
      for (const file of files) {
        // Validate filename to prevent directory traversal attacks
        if (!file.path || typeof file.path !== 'string') {
          throw new Error('Invalid file path: must be a non-empty string');
        }
        
        // Reject absolute paths and suspicious patterns (null bytes, etc)
        if (path.isAbsolute(file.path) || file.path.includes('\0')) {
          throw new Error(`Invalid file path detected: ${file.path}`);
        }
        
        // Resolve and verify the file stays within temp directory
        const filePath = path.resolve(path.join(resolvedTempDir, file.path));
        const realTempDir = path.resolve(resolvedTempDir);
        
        // Ensure resolved path is within the temp directory using startsWith check
        if (!filePath.startsWith(realTempDir + path.sep) && filePath !== realTempDir) {
          throw new Error(`Directory traversal attack detected: ${file.path}`);
        }

        // Ensure parent directory exists for nested files
        await fs.ensureDir(path.dirname(filePath));
        
        // Write content (Buffer or string)
        await fs.writeFile(filePath, file.content);
      }

      // 3. Validate integrity and security
      const manifestPath = path.join(resolvedTempDir, 'manifest.json');
      await SecurityValidator.validateManifest(manifestPath);
      await SecurityValidator.scanDirectory(resolvedTempDir);

      // 4. Create ZIP archive
      await this.createZipArchive(resolvedTempDir, zipPath);

      // 5. Clean up temp directory
      await fs.remove(resolvedTempDir);

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
