const Feedback = require('../models/Feedback');

class IntelligenceService {
  static async logGenerationTelemetry(projectId, versionId, wasSuccessful, errorType = null) {
    // In production, this would ship to an analytics warehouse (e.g., PostHog or BigQuery)
    const telemetryEvent = {
      projectId,
      versionId,
      timestamp: new Date(),
      status: wasSuccessful ? 'SUCCESS' : 'FAILED',
      errorType
    };
    
    console.log(`[INTELLIGENCE ENGINE] Telemetry Logged:`, telemetryEvent);
    
    // Pattern detection logic could hook in here to track failing AI prompts
    if (!wasSuccessful && errorType === 'SYNTAX_ERROR') {
      this.flagForModelFinetuning(projectId);
    }
    
    return true;
  }

  static async processUserFeedback(userId, payload) {
    const { projectId, versionId, rating, category, comment } = payload;
    
    const feedback = new Feedback({
      userId,
      projectId,
      versionId,
      rating,
      category,
      comment
    });

    await feedback.save();

    // If rating is very low (1-2), immediately queue for AI analysis to understand what went wrong
    if (rating <= 2) {
      this.analyzeNegativeFeedback(feedback._id);
    }

    return feedback;
  }

  static async analyzeNegativeFeedback(feedbackId) {
    console.log(`[INTELLIGENCE ENGINE] Analyzing poor feedback (ID: ${feedbackId}) to improve core AI context...`);
    await Feedback.findByIdAndUpdate(feedbackId, { status: 'analyzed_by_ai' });
  }

  static async flagForModelFinetuning(projectId) {
    console.log(`[INTELLIGENCE ENGINE] Project ${projectId} flagged for weekly fine-tuning dataset export.`);
  }
}

module.exports = IntelligenceService;
