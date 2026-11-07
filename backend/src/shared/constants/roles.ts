export enum UserRole {
  STUDENT = 'student',
  RECRUITER = 'recruiter',
  PLACEMENT_OFFICER = 'placement_officer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
}

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  INTERNSHIP = 'Internship',
  CONTRACT = 'Contract',
  REMOTE = 'Remote',
}

export enum ApplicationStatus {
  APPLIED = 'Applied',
  UNDER_REVIEW = 'Under Review',
  SHORTLISTED = 'Shortlisted',
  REJECTED = 'Rejected',
  SELECTED = 'Selected',
  HIRED = 'Hired',
  WITHDRAWN = 'Withdrawn',
}

export enum InterviewType {
  TECHNICAL = 'Technical',
  HR = 'HR',
  MANAGER = 'Manager',
  FINAL = 'Final',
  GROUP = 'Group',
}

export enum InterviewMode {
  IN_PERSON = 'In-Person',
  VIDEO = 'Video',
  PHONE = 'Phone',
}

export enum InterviewStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  RESCHEDULED = 'Rescheduled',
  NO_SHOW = 'No-Show',
}

export enum NotificationType {
  APPLICATION_STATUS = 'APPLICATION_STATUS',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  JOB_POSTED = 'JOB_POSTED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}
