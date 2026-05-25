const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const SecurityLog = require('../models/SecurityLog');
const MonitoringService = require('../services/monitoringService');

class AdminController {
  static async getStats(req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log('💡 Admin Controller: Detached mode. Serving mock stats dashboard.');
        return res.json({
          stats: {
            activeUsers: 14,
            totalGenerations: 56,
            blockedThreats: 3,
            apiErrors: 0.015
          },
          alerts: [
            {
              id: 'detached-alert-1',
              type: 'PROMPT_FLAGGED',
              severity: 'HIGH',
              user: 'user@example.com',
              time: new Date(),
              details: 'Suspicious keyword "steal cookies" detected in prompt.'
            }
          ]
        });
      }

      const activeUsers = await User.countDocuments();
      const totalGenerations = await Project.countDocuments();
      
      const blockedThreats = await SecurityLog.countDocuments({ resolved: true });
      const apiErrors = 0.02; // Placeholder for now

      const alerts = await MonitoringService.getActiveAlerts();

      const formattedAlerts = alerts.map(a => ({
        id: a._id,
        type: a.eventType,
        severity: a.severity,
        user: a.userId ? (a.userId.name || a.userId.email) : 'system',
        time: a.createdAt,
        details: a.details
      }));

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
      if (mongoose.connection.readyState !== 1) {
        console.log(`💡 Admin Controller: Detached mode. Resolving mock alert ${id}.`);
        return res.json({ success: true });
      }
      await MonitoringService.resolveAlert(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Resolve Alert Error:', error);
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  }
}

module.exports = AdminController;
