export type UserRole = 'student' | 'recruiter' | 'placement_officer' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isRecruiterVerified?: boolean;
  company?: string;
  phone?: string;
  bio?: string;
  department?: string;
  graduationYear?: number;
  cgpa?: number;
  activeBacklogs?: number;
  skills: string[];
  avatar?: string;
  createdAt?: string;
}

export interface Job {
  _id: string;
  id?: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  location: string;
  salary: {
    min?: number;
    max?: number;
    currency: string;
  };
  jobType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote';
  experienceLevel: string;
  department?: string;
  minCgpa?: number;
  allowedBranches?: string[];
  maxBacklogs?: number;
  deadline?: string;
  postedBy: {
    _id: string;
    name: string;
    email?: string;
    company?: string;
  };
  status: 'OPEN' | 'CLOSED';
  isApproved: boolean;
  createdAt: string;
  matchScore?: number;
  matchedSkills?: string[];
}

export interface Application {
  _id: string;
  id?: string;
  student: User;
  job: Job;
  resume?: any;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected' | 'Hired' | 'Withdrawn';
  matchScore: number;
  aiScore: number;
  aiAnalysis?: {
    matchedSkills: string[];
    missingSkills: string[];
    candidateStrengths: string[];
    aiRecommendation: string;
  };
  coverLetter?: string;
  notes?: string;
  timeline?: {
    status: Application['status'];
    updatedAt: string;
    comment?: string;
  }[];
  appliedAt: string;
  createdAt: string;
}

export interface Resume {
  _id: string;
  student: string;
  fileUrl: string;
  originalName: string;
  rawText?: string;
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
    projects?: {
      title: string;
      description?: string;
      technologies?: string[];
    }[];
    certifications?: string[];
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
  education?: Array<{
    degree: string;
    institution: string;
    startDate?: string;
    endDate?: string;
    fieldOfStudy?: string;
    gpa?: string;
    type?: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string[];
    type?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  skills?: Record<string, string[] | string>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    link?: string;
  }>;
  achievements?: string[];
  atsScore: number;
  atsBreakdown: {
    skillCoverageScore: number;
    experienceScore: number;
    educationScore: number;
    formattingScore: number;
  };
  aiSuggestions: string[];
  versionHistory?: {
    version: number;
    uploadedAt: string;
    fileUrl: string;
    atsScore: number;
  }[];
  uploadedAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
