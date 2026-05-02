const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['TREND_PREDICTION', 'TEMPLATE_RECOMMENDATION', 'BOTTLENECK_ALERT', 'PRICING_OPTIMIZATION'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  confidenceScore: {
    type: Number, // 0.0 to 1.0 indicating AI certainty
    required: true
  },
  dataPoints: {
    type: Object, // Aggregated metrics backing up this insight
    default: {}
  },
  actionable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['NEW', 'REVIEWED', 'IMPLEMENTED', 'DISMISSED'],
    default: 'NEW'
  }
}, { timestamps: true });

module.exports = mongoose.model('Insight', insightSchema);
