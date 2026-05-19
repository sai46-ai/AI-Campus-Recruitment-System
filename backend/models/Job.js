const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Required skills are required'],
      validate: {
        validator: function(v) {
          return v.length > 0 && v.length <= 15;
        },
        message: 'Must have 1-15 required skills'
      }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' }
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
      default: 'Full-time'
    },
    experience: {
      type: String,
      enum: ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'],
      default: 'Fresher'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'CLOSED'],
        message: 'Invalid job status'
      },
      default: 'OPEN'
    },
    deadline: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
jobSchema.index({ status: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ location: 1 });

module.exports = mongoose.model('Job', jobSchema);
