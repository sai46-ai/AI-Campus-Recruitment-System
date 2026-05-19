const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'recruiter', 'admin'],
        message: 'Invalid role'
      },
      default: 'student'
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 20;
        },
        message: 'Cannot have more than 20 skills'
      }
    },
    phone: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    resume: {
      // Retaining your original resume metadata structure
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      uploadedAt: { type: Date },
      
      // --- INTEGRATED AI ANALYSIS FIELDS ---
      extractedSkills: { 
        type: [String], 
        default: [] 
      }, // Stores technical skills found by spaCy NLP
      matchScore: { 
        type: Number, 
        default: 0 
      } // Stores the percentage from the skill matcher
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true, // Preserved original timestamp logic
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Original indexes preserved
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });

// AI-optimized index for recruiter searches
userSchema.index({ 'resume.extractedSkills': 1 });

module.exports = mongoose.model('User', userSchema);