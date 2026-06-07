const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceName: String,
  deviceType: String,
  lastActive: { type: Date, default: Date.now }
});

// Optional: Auto-delete sessions after 30 days of inactivity
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);