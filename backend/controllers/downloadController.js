const path = require('path');
const archiver = require('archiver');
const generationWorker = require('../workers/generationWorker');
const StorageService = require('../services/storageService');
const PackagingService = require('../services/packagingService');

class DownloadController {
  static async downloadExtension(req, res) {
    try {
      const { id: idOrJobId } = req.params;
      if (!idOrJobId) return res.status(400).json({ error: 'Download identifier is required.' });

      const user = req.user;
      // Try to get the files
      let files = null;
      let extName = 'antigravity-extension';

      // 1. Try to fetch from background generation worker Map
      try {
        const job = await generationWorker.getJobStatus(idOrJobId);
        if (job) {
          // Verify ownership
          if (job.userId !== user.id) {
            return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this generation job.' });
          }
          if (job.files && job.files.length > 0) {
            files = job.files;
            extName = (job.prompt || 'extension').split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
          }
        }
      } catch (_) { /* Not an active/recent job ID */ }

      // 2. If not found in worker, check database / in-memory Project fallback
      if (!files) {
        const mongoose = require('mongoose');
        const Project = require('../models/Project');
        const Version = require('../models/Version');

        if (mongoose.connection.readyState === 1) {
          try {
            const project = await Project.findById(idOrJobId);
            if (project) {
              // Verify ownership
              if (project.userId.toString() !== user.id) {
                return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this project.' });
              }
              // Fetch latest version
              const latestVersionDoc = await Version.findOne({ projectId: project._id })
                .sort({ versionNumber: -1 });
              if (latestVersionDoc && latestVersionDoc.files && latestVersionDoc.files.length > 0) {
                files = latestVersionDoc.files;
                extName = project.name.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
              }
            }
          } catch (dbErr) {
            console.warn('Failed to retrieve project from MongoDB:', dbErr);
          }
        }

        // 3. Fallback to in-memory project history if not found in DB
        if (!files) {
          const ProjectService = require('../services/projectService');
          try {
            const userProjects = await ProjectService.getUserProjects(user.id);
            const project = userProjects.find(p => p._id === idOrJobId);
            if (project) {
              const versions = await ProjectService.getProjectHistory(idOrJobId, user.id);
              if (versions && versions.length > 0 && versions[0].files) {
                files = versions[0].files;
                extName = project.name.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
              }
            }
          } catch (err) {
            console.warn('Failed to retrieve project from memory fallback:', err);
          }
        }
      }

      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'Not Found', message: 'No extension files found for this build.' });
      }

      // 4. package using PackagingService which writes to secure temp directory, scans, and zips.
      const zipPath = await PackagingService.packageExtension(files);

      // 5. Serve the zip file and clean it up afterwards
      res.download(zipPath, `${extName}.zip`, async (downloadErr) => {
        if (downloadErr) {
          console.error('Download sending failed:', downloadErr);
        }
        const fs = require('fs-extra');
        await fs.remove(zipPath).catch(err => {
          console.error('Failed to clean up temporary ZIP:', err.message);
        });
      });
    } catch (error) {
      console.error('Download error:', error);
      if (!res.headersSent) res.status(500).json({ error: 'Download failed', message: error.message });
    }
  }
}

module.exports = DownloadController;
