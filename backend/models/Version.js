const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  files: {
    type: [{
      path: { type: String, required: true },
      content: { type: String, required: true }
    }],
    required: true
  },
  downloadToken: {
    type: String
  },
  manifestData: {
    type: Object
  }
}, { timestamps: true });

module.exports = mongoose.model('Version', versionSchema);
