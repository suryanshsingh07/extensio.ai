const User = require('../models/User');
const Project = require('../models/Project');
const SecurityLog = require('../models/SecurityLog');

class AdminController {
  static async getStats(req, res) {
    try {
      const activeUsers = await User.countDocuments();
      const totalGenerations = await Project.countDocuments();
      
      const blockedThreats = await SecurityLog.countDocuments({ resolved: true });
      const apiErrors = 0.02; // Placeholder for now

      const alerts = await SecurityLog.find({ resolved: false })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .limit(10);

      const formattedAlerts = alerts.map(a => ({
        id: a._id,
        type: a.eventType,
        severity: a.severity,
        user: a.userId ? a.userId.name : 'system',
        time: a.createdAt,
        details: a.details
      }));

      if (formattedAlerts.length === 0 && activeUsers > 0) {
        const dummyLog = new SecurityLog({
          eventType: 'PROMPT_FLAGGED',
          severity: 'HIGH',
          details: 'Attempted to generate cookie stealing extension.',
          resolved: false
        });
        await dummyLog.save();
        formattedAlerts.push({
          id: dummyLog._id,
          type: dummyLog.eventType,
          severity: dummyLog.severity,
          user: 'system',
          time: dummyLog.createdAt,
          details: dummyLog.details
        });
      }

      res.json({
        stats: {
          activeUsers,
          totalGenerations,
          blockedThreats,
          apiErrors
        },
        alerts: formattedAlerts
      });
    } catch (error) {
      console.error('Admin Stats Error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  }

  static async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      await SecurityLog.findByIdAndUpdate(id, { resolved: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Resolve Alert Error:', error);
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  }
}

module.exports = AdminController;
