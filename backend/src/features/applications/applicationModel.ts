import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus } from '../../shared/constants/roles';

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  resume?: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  matchScore: number;
  aiScore: number;
  aiAnalysis: {
    matchedSkills: string[];
    missingSkills: string[];
    candidateStrengths: string[];
    aiRecommendation: string;
  };
  coverLetter?: string;
  notes?: string;
  timeline: {
    status: ApplicationStatus;
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
    comment?: string;
  }[];
  appliedAt: Date;
  withdrawnAt?: Date;
  withdrawalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.APPLIED,
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiAnalysis: {
      matchedSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      candidateStrengths: { type: [String], default: [] },
      aiRecommendation: { type: String, default: '' },
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    timeline: [
      {
        status: { type: String, enum: Object.values(ApplicationStatus) },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        comment: String,
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    withdrawnAt: Date,
    withdrawalReason: {
      type: String,
      maxlength: [500, 'Withdrawal reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ student: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ student: 1, createdAt: -1 });
ApplicationSchema.index({ job: 1, matchScore: -1 });
ApplicationSchema.index({ job: 1, aiScore: -1 });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
