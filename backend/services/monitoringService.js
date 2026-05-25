const mongoose = require('mongoose');
const SecurityLog = require('../models/SecurityLog');

class MonitoringService {
  static async analyzePrompt(userId, promptText) {
    const maliciousKeywords = ['keylogger', 'steal', 'cookie grabber', 'crypto miner', 'botnet', 'bypass CORS'];
    
    const isSuspicious = maliciousKeywords.some(keyword => 
      promptText.toLowerCase().includes(keyword)
    );

    if (isSuspicious) {
      await this.logEvent({
        eventType: 'PROMPT_FLAGGED',
        severity: 'HIGH',
        userId,
        details: 'Suspicious keywords detected in user prompt.',
        metadata: { promptText }
      });
      throw new Error('Security Violation: Prompt contains restricted requests.');
    }
    
    return true;
  }

  static async logEvent(logData) {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn('💡 Monitoring Service: detached mode. Event logged to console:', logData);
        return logData;
      }
      
      const logEntry = new SecurityLog(logData);
      await logEntry.save();
      
      // In production, trigger alerts (Slack, PagerDuty) if severity is CRITICAL
      if (logData.severity === 'CRITICAL') {
        console.error(`[CRITICAL ALERT] ${logData.eventType}: ${logData.details}`);
      }
      
      return logEntry;
    } catch (error) {
      console.error('Failed to write security log:', error);
    }
  }

  static async getActiveAlerts() {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    try {
      return await SecurityLog.find({ resolved: false })
        .sort({ createdAt: -1 })
        .populate('userId', 'email')
        .limit(50);
    } catch (err) {
      console.error('Failed to retrieve active alerts from MongoDB:', err.message);
      return [];
    }
  }

  static async resolveAlert(logId) {
    if (mongoose.connection.readyState !== 1) {
      return null;
    }
    try {
      return await SecurityLog.findByIdAndUpdate(logId, { resolved: true });
    } catch (err) {
      console.error('Failed to resolve alert in MongoDB:', err.message);
      return null;
    }
  }
}

module.exports = MonitoringService;
