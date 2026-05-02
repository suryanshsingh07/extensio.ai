const ProjectService = require('../services/projectService');

class ProjectController {
  static async getProjects(req, res) {
    try {
      const userId = req.user.id; // Assumes auth middleware populates req.user
      const projects = await ProjectService.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getHistory(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      const history = await ProjectService.getProjectHistory(projectId, userId);
      res.json(history);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async deleteProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      await ProjectService.deleteProject(projectId, userId);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProjectController;
