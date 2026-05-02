const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  versionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    enum: ['BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL_SATISFACTION', 'CODE_QUALITY'],
    default: 'GENERAL_SATISFACTION'
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending_review', 'analyzed_by_ai', 'implemented'],
    default: 'pending_review'
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
