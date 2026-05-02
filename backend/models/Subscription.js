const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['FREE', 'PROFESSIONAL', 'ENTERPRISE'],
    default: 'FREE'
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'unpaid', 'trialing'],
    default: 'active'
  },
  currentPeriodEnd: {
    type: Date
  },
  usageMetrics: {
    generationsThisMonth: { type: Number, default: 0 },
    storageUsedBytes: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
