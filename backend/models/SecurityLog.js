const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['PROMPT_FLAGGED', 'CODE_VULNERABILITY', 'SYSTEM_ERROR', 'RATE_LIMIT_EXCEEDED'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  details: {
    type: String,
    required: true
  },
  metadata: {
    type: Object, // Extra context (e.g., prompt text, specific line of code)
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
