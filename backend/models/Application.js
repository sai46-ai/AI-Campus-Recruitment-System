const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required']
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required']
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected', 'Hired'],
        message: 'Invalid application status'
      },
      default: 'Applied'
    },
    // Compatibility field (some frontend screens read appliedAt)
    appliedAt: {
      type: Date,
      default: Date.now
    },
    matchScore: {
      type: Number,
      default: 0,
      min: [0, 'Match score cannot be negative'],
      max: [100, 'Match score cannot exceed 100']
    },
    // AI score (can be same as matchScore initially, but stored separately for future analysis)
    aiScore: {
      type: Number,
      default: 0,
      min: [0, 'AI score cannot be negative'],
      max: [100, 'AI score cannot exceed 100']
    },
    // Link to student's current resume record (if present at time of application)
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// Indexes for better query performance
applicationSchema.index({ job: 1, matchScore: -1 });
applicationSchema.index({ student: 1, createdAt: -1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
