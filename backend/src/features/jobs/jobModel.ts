import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus, JobType } from '../../shared/constants/roles';

export interface IJob extends Document {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  location: string;
  salary: {
    min?: number;
    max?: number;
    currency: string;
  };
  jobType: JobType;
  experienceLevel: string;
  department?: string;
  minCgpa?: number;
  allowedBranches?: string[];
  maxBacklogs?: number;
  deadline?: Date;
  postedBy: mongoose.Types.ObjectId;
  status: JobStatus;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [10000, 'Description cannot exceed 10,000 characters'],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Required skills are required'],
      validate: {
        validator: (v: string[]) => v.length > 0 && v.length <= 25,
        message: 'Must have between 1 and 25 required skills',
      },
    },
    niceToHaveSkills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
    },
    jobType: {
      type: String,
      enum: Object.values(JobType),
      default: JobType.FULL_TIME,
    },
    experienceLevel: {
      type: String,
      default: 'Fresher',
    },
    department: {
      type: String,
      trim: true,
    },
    minCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    allowedBranches: {
      type: [String],
      default: [],
    },
    maxBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    deadline: Date,
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ status: 1, isApproved: 1, createdAt: -1 });
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ postedBy: 1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
