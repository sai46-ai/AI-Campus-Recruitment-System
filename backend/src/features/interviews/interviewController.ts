import { Response } from 'express';
import Interview from './interviewModel';
import Application from '../applications/applicationModel';
import Job from '../jobs/jobModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { ApplicationStatus, InterviewStatus, UserRole } from '../../shared/constants/roles';
import { createInAppNotification } from '../../shared/services/notificationService';

export const scheduleInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId, scheduledDate, scheduledTime, duration, type, mode, location, meetingLink } = req.body;
  if (typeof applicationId !== 'string' || !applicationId.trim()) {
    throw new AppError('A valid application is required to schedule an interview', 400);
  }
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError('Application not found', 404);
  if ([ApplicationStatus.REJECTED, ApplicationStatus.HIRED].includes(application.status)) {
    throw new AppError('An interview cannot be scheduled for this application status', 400);
  }
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const isPlacementOfficer = req.user?.role === UserRole.PLACEMENT_OFFICER;
  if (!isAdmin && !isPlacementOfficer) {
    const ownedJob = await Job.findOne({ _id: application.job, postedBy: req.user?.userId }).select('_id');
    if (!ownedJob) throw new AppError('Unauthorized to schedule an interview for this application', 403);
  }
  const scheduleDate = new Date(scheduledDate);
  if (typeof scheduledTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduledTime) || Number.isNaN(scheduleDate.getTime())) {
    throw new AppError('A valid interview date and 24-hour time are required', 400);
  }
  const interviewDuration = duration === undefined ? 60 : Number(duration);
  if (!Number.isInteger(interviewDuration) || interviewDuration < 15 || interviewDuration > 240) {
    throw new AppError('Interview duration must be between 15 and 240 minutes', 400);
  }
  const interview = await Interview.create({
    application: applicationId,
    job: application.job,
    student: application.student,
    recruiter: req.user?.userId,
    scheduledDate: scheduleDate,
    scheduledTime,
    duration: interviewDuration,
    type,
    mode,
    location,
    meetingLink,
    status: InterviewStatus.SCHEDULED,
  });
  if (application.status !== ApplicationStatus.SHORTLISTED) {
    application.status = ApplicationStatus.SHORTLISTED;
    application.timeline.push({
      status: ApplicationStatus.SHORTLISTED,
      updatedAt: new Date(),
      updatedBy: req.user?.userId as any,
      comment: 'Interview scheduled',
    });
    await application.save();
  }

  createInAppNotification({
    userId: application.student.toString(),
    type: 'INTERVIEW_SCHEDULED',
    title: 'Interview Scheduled',
    message: `An interview has been scheduled for your application on ${scheduleDate.toLocaleDateString()} at ${scheduledTime}.`,
    metadata: { interviewId: interview._id, scheduledDate, scheduledTime },
  });

  res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: interview });
});

export const getMyInterviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  let query: any = {};
  if (role === UserRole.STUDENT) {
    query.student = userId;
  } else if (role === UserRole.RECRUITER) {
    query.recruiter = userId;
  } else if (role === UserRole.PLACEMENT_OFFICER || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    query = {};
  } else {
    query.student = userId;
  }

  const interviews = await Interview.find(query)
    .populate('student', 'name email phone avatar department graduationYear')
    .populate('recruiter', 'name company')
    .populate('job', 'title company location salary jobType')
    .sort({ scheduledDate: 1, scheduledTime: 1 });

  res.json({ success: true, data: interviews });
});

export const getApplicationInterviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const application = await Application.findById(req.params.applicationId).select('student job');
  if (!application) throw new AppError('Application not found', 404);
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.PLACEMENT_OFFICER;
  const isStudent = application.student.toString() === req.user?.userId;
  let isJobOwner = false;
  if (!isStudent && !isAdmin) {
    isJobOwner = Boolean(await Job.exists({ _id: application.job, postedBy: req.user?.userId }));
  }
  if (!isStudent && !isAdmin && !isJobOwner) throw new AppError('Unauthorized to view these interviews', 403);
  const interviews = await Interview.find({ application: req.params.applicationId })
    .populate('student', 'name email phone avatar')
    .populate('recruiter', 'name company')
    .populate('job', 'title company')
    .sort({ scheduledDate: -1 });
  res.json({ success: true, data: interviews });
});

export const submitInterviewFeedback = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { score, feedback, hiringDecision } = req.body;
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError('Interview record not found', 404);
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const isPlacementOfficer = req.user?.role === UserRole.PLACEMENT_OFFICER;
  if (!isAdmin && !isPlacementOfficer && interview.recruiter.toString() !== req.user?.userId) {
    throw new AppError('Unauthorized to submit feedback for this interview', 403);
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
    throw new AppError('Interview score must be a number between 0 and 100', 400);
  }
  if (typeof feedback !== 'string' || !feedback.trim() || feedback.length > 2000) {
    throw new AppError('Feedback must be a string of at most 2000 characters', 400);
  }
  if (!['Pending', 'Recommended', 'Not Recommended', 'On Hold'].includes(hiringDecision)) {
    throw new AppError('Invalid hiring decision', 400);
  }
  interview.score = score;
  interview.feedback = feedback;
  interview.hiringDecision = hiringDecision;
  interview.status = InterviewStatus.COMPLETED;
  await interview.save();
  res.json({ success: true, message: 'Interview evaluation submitted', data: interview });
});

export const cancelInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError('Interview not found', 404);
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const isPlacementOfficer = req.user?.role === UserRole.PLACEMENT_OFFICER;
  if (!isAdmin && !isPlacementOfficer && interview.recruiter.toString() !== req.user?.userId) {
    throw new AppError('Unauthorized to cancel this interview', 403);
  }
  if (interview.status === InterviewStatus.CANCELLED) {
    throw new AppError('Interview is already cancelled', 409);
  }
  interview.status = InterviewStatus.CANCELLED;
  await interview.save();
  res.json({ success: true, message: 'Interview cancelled', data: interview });
});
