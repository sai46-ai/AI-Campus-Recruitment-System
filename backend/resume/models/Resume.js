const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    // Public URL path served by backend static /uploads
    filePath: { type: String },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    
    // INTEGRATED AI FIELDS
    extractedSkills: { type: [String], default: [] },
    matchScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Safe export pattern to prevent OverwriteModelError
module.exports = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);