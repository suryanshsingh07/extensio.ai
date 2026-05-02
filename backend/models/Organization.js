const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  billingEmail: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['ADMIN', 'EDITOR', 'VIEWER'],
      default: 'VIEWER'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  settings: {
    allowPublicSharing: { type: Boolean, default: false },
    enforceSSO: { type: Boolean, default: false },
    maxSeats: { type: Number, default: 5 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
