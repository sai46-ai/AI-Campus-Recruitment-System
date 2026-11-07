import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  student: mongoose.Types.ObjectId;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  rawText: string;
  parsedData: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills: string[];
    experience: {
      jobTitle: string;
      company: string;
      duration?: string;
      description?: string;
    }[];
    education: {
      degree: string;
      institution: string;
      year?: number;
    }[];
    projects: {
      title: string;
      description?: string;
      technologies?: string[];
    }[];
    certifications: string[];
  };
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary?: string;
  };
  education?: any[];
  experience?: any[];
  projects?: any[];
  skills?: any;
  certifications?: any[];
  achievements?: any[];
  atsScore: number;
  atsBreakdown: {
    skillCoverageScore: number;
    experienceScore: number;
    educationScore: number;
    formattingScore: number;
  };
  aiSuggestions: string[];
  versionHistory: {
    version: number;
    uploadedAt: Date;
    fileUrl: string;
    atsScore: number;
  }[];
  uploadedAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileUrl: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    rawText: { type: String, default: '' },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      summary: String,
      skills: { type: [String], default: [] },
      experience: [
        {
          jobTitle: String,
          company: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          year: Number,
        },
      ],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
        },
      ],
      certifications: { type: [String], default: [] },
    },
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
      summary: String,
    },
    education: { type: [Schema.Types.Mixed], default: [] },
    experience: { type: [Schema.Types.Mixed], default: [] },
    projects: { type: [Schema.Types.Mixed], default: [] },
    skills: { type: Schema.Types.Mixed, default: {} },
    certifications: { type: [Schema.Types.Mixed], default: [] },
    achievements: { type: [Schema.Types.Mixed], default: [] },
    atsScore: { type: Number, default: 0 },
    atsBreakdown: {
      skillCoverageScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      formattingScore: { type: Number, default: 0 },
    },
    aiSuggestions: { type: [String], default: [] },
    versionHistory: [
      {
        version: Number,
        uploadedAt: { type: Date, default: Date.now },
        fileUrl: String,
        atsScore: Number,
      },
    ],
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ student: 1, uploadedAt: -1 });
ResumeSchema.index({ 'parsedData.skills': 1 });

export default mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);
