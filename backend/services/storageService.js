const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class StorageService {
  /**
   * Saves the generated ZIP to persistent storage (local for now, ready for S3)
   * @param {string} tempZipPath - Path to the temporary zip file
   * @param {string} projectId - Unique project ID from DB
   * @returns {Promise<string>} - Download token/ID
   */
  static async storePackage(tempZipPath, projectId) {
    const storageDir = path.join(os.tmpdir(), 'extensio_storage', 'builds');
    await fs.ensureDir(storageDir);

    const filename = `${projectId}-${Date.now()}.zip`;
    const finalPath = path.join(storageDir, filename);

    try {
      await fs.move(tempZipPath, finalPath, { overwrite: true });
      
      return filename;
    } catch (error) {
      throw new Error(`Failed to store package: ${error.message}`);
    }
  }
  static getPackagePath(filename) {
    const finalPath = path.join(os.tmpdir(), 'extensio_storage', 'builds', filename);
    if (!fs.existsSync(finalPath)) {
      throw new Error('Package not found or expired.');
    }
    return finalPath;
  }
}

module.exports = StorageService;
