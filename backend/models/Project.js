const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  latestVersion: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
