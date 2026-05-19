const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: String,
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  // --- INTEGRATED AI FIELDS ---
  extractedSkills: {
    type: [String],
    default: []
  },
  matchScore: {
    type: Number,
    default: 0
  }
});

// Add indexes for improved query performance
resumeSchema.index({ student: 1 });
resumeSchema.index({ uploadedAt: -1 });
resumeSchema.index({ student: 1, uploadedAt: -1 });

// SAFE EXPORT: Checks if 'Resume' exists before creating it
module.exports = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);