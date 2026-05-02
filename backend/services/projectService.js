const mongoose = require('mongoose');
const Project = require('../models/Project');
const Version = require('../models/Version');

// In-memory fallback
const memoryProjects = [];
const memoryVersions = [];

class ProjectService {
  static async createProject(userId, name, prompt, files, downloadToken) {
    if (mongoose.connection.readyState !== 1) {
      const project = {
        _id: Date.now().toString(),
        userId,
        name,
        latestVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryProjects.push(project);
      
      const version = {
        _id: (Date.now() + 1).toString(),
        projectId: project._id,
        versionNumber: 1,
        prompt,
        files,
        downloadToken,
        createdAt: new Date()
      };
      memoryVersions.push(version);
      return { project, version };
    }

    const project = new Project({
      userId,
      name,
      latestVersion: 1
    });
    await project.save();

    const version = new Version({
      projectId: project._id,
      versionNumber: 1,
      prompt,
      files,
      downloadToken
    });
    await version.save();

    return { project, version };
  }

  static async addVersion(projectId, userId, prompt, files, downloadToken) {
    if (mongoose.connection.readyState !== 1) {
      const project = memoryProjects.find(p => p._id === projectId && p.userId === userId);
      if (!project) throw new Error('Project not found or unauthorized');
      
      project.latestVersion += 1;
      project.updatedAt = new Date();
      
      const version = {
        _id: Date.now().toString(),
        projectId: project._id,
        versionNumber: project.latestVersion,
        prompt,
        files,
        downloadToken,
        createdAt: new Date()
      };
      memoryVersions.push(version);
      return { project, version };
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found or unauthorized');

    project.latestVersion += 1;
    await project.save();

    const version = new Version({
      projectId: project._id,
      versionNumber: project.latestVersion,
      prompt,
      files,
      downloadToken
    });
    await version.save();

    return { project, version };
  }

  static async getUserProjects(userId) {
    if (mongoose.connection.readyState !== 1) {
      return memoryProjects.filter(p => p.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return await Project.find({ userId }).sort({ updatedAt: -1 });
  }

  static async getProjectHistory(projectId, userId) {
    if (mongoose.connection.readyState !== 1) {
      const project = memoryProjects.find(p => p._id === projectId && p.userId === userId);
      if (!project) throw new Error('Project not found or unauthorized');
      return memoryVersions.filter(v => v.projectId === projectId).sort((a, b) => b.versionNumber - a.versionNumber);
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found or unauthorized');

    return await Version.find({ projectId }).sort({ versionNumber: -1 });
  }

  static async deleteProject(projectId, userId) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryProjects.findIndex(p => p._id === projectId && p.userId === userId);
      if (idx !== -1) {
        memoryProjects.splice(idx, 1);
        // Also remove versions
        const versionIdx = memoryVersions.findIndex(v => v.projectId === projectId);
        while(versionIdx !== -1) {
          memoryVersions.splice(versionIdx, 1);
        }
      }
      return;
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found or unauthorized');

    await Project.deleteOne({ _id: projectId });
    await Version.deleteMany({ projectId });
  }
}

module.exports = ProjectService;
