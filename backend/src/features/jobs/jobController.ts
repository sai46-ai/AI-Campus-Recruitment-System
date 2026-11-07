import { Request, Response } from 'express';
import Job from './jobModel';
import Resume from '../resumes/resumeModel';
import User from '../auth/userModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { JobStatus, UserRole } from '../../shared/constants/roles';
import { escapeRegExp } from '../../shared/utils/escapeRegExp';

export const createJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === UserRole.RECRUITER) {
    const query = User.findById(req.user.userId);
    const recruiter = typeof (query as any)?.select === 'function'
      ? await (query as any).select('isRecruiterVerified isDeleted isActive')
      : await query;

    if (!recruiter || recruiter.isDeleted || recruiter.isActive === false) {
      throw new AppError('Recruiter account not found or deactivated.', 403);
    }
    if (!recruiter.isRecruiterVerified) {
      throw new AppError(
        'Recruiter account is pending corporate verification by administration. You cannot post jobs until verified.',
        403
      );
    }
  }

  const {
    title,
    company,
    description,
    requiredSkills,
    niceToHaveSkills,
    location,
    salary,
    jobType,
    experienceLevel,
    deadline,
    department,
    minCgpa,
    allowedBranches,
    maxBacklogs,
  } = req.body;

  const job = await Job.create({
    title,
    company,
    description,
    requiredSkills,
    niceToHaveSkills: niceToHaveSkills || [],
    location,
    salary,
    jobType,
    experienceLevel,
    department,
    minCgpa: minCgpa !== undefined ? Number(minCgpa) : 0,
    allowedBranches: Array.isArray(allowedBranches) ? allowedBranches : [],
    maxBacklogs: maxBacklogs !== undefined ? Number(maxBacklogs) : 0,
    deadline,
    postedBy: req.user?.userId,
    status: JobStatus.OPEN,
    isApproved:
      req.user?.role === UserRole.ADMIN ||
      req.user?.role === UserRole.SUPER_ADMIN ||
      req.user?.role === UserRole.PLACEMENT_OFFICER,
  });

  res.status(201).json({
    success: true,
    message: 'Job opening posted successfully',
    data: job,
  });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const { search, skill, location, jobType, page = 1, limit = 10 } = req.query;

  const query: any = { status: JobStatus.OPEN, isApproved: true };

  if (search) {
    const safeSearch = escapeRegExp(String(search).slice(0, 100));
    query.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { company: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (skill) {
    query.requiredSkills = { $in: [(skill as string).trim()] };
  }

  if (location) {
    query.location = { $regex: escapeRegExp(String(location).slice(0, 100)), $options: 'i' };
  }

  if (jobType) {
    query.jobType = jobType;
  }

  const requestedPage = Number.parseInt(page as string, 10);
  const requestedLimit = Number.parseInt(limit as string, 10);
  const pageNum = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  const limitNum = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 10;
  const skip = (pageNum - 1) * limitNum;

  const jobsQuery = Job.find(query)
    .populate('postedBy', 'name company')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  const jobsPromise = typeof (jobsQuery as any)?.lean === 'function' ? (jobsQuery as any).lean() : jobsQuery;

  const [jobs, total] = await Promise.all([
    jobsPromise,
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      jobs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const query = Job.findById(req.params.id).populate('postedBy', 'name company');
  const job: any = typeof (query as any)?.lean === 'function' ? await (query as any).lean() : await query;
  if (!job) {
    throw new AppError('Job opening not found', 404);
  }

  const isVisible = job.status === JobStatus.OPEN && job.isApproved;
  const requester = (req as AuthenticatedRequest).user;
  const postedById = (job.postedBy as any)?._id?.toString() || job.postedBy?.toString();
  const isOwner = requester?.role === UserRole.RECRUITER && postedById === requester.userId;
  const isPrivileged =
    requester?.role === UserRole.ADMIN ||
    requester?.role === UserRole.SUPER_ADMIN ||
    requester?.role === UserRole.PLACEMENT_OFFICER;
  if (!isVisible && !isOwner && !isPrivileged) {
    throw new AppError('Job opening not found', 404);
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

export const getMyJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const filter = isAdmin ? {} : { postedBy: req.user?.userId };
  const query = Job.find(filter).sort({ createdAt: -1 });
  const jobs = typeof (query as any)?.lean === 'function' ? await (query as any).lean() : await query;

  res.status(200).json({
    success: true,
    data: jobs,
  });
});

export const updateJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  if (job.postedBy.toString() !== req.user?.userId && !isAdmin) {
    throw new AppError('Unauthorized to update this job opening', 403);
  }

  const updatableFields = [
    'title',
    'company',
    'description',
    'requiredSkills',
    'niceToHaveSkills',
    'location',
    'salary',
    'jobType',
    'experienceLevel',
    'deadline',
    'department',
    'minCgpa',
    'allowedBranches',
    'maxBacklogs',
  ];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      (job as any)[field] = req.body[field];
    }
  });
  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: job,
  });
});

export const closeJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  if (!isAdmin && job.postedBy.toString() !== req.user?.userId) {
    throw new AppError('Unauthorized to close this job', 403);
  }

  job.status = JobStatus.CLOSED;
  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job marked as closed',
    data: job,
  });
});

export const reopenJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  if (!isAdmin && job.postedBy.toString() !== req.user?.userId) {
    throw new AppError('Unauthorized to reopen this job', 403);
  }

  job.status = JobStatus.OPEN;
  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job reopened successfully',
    data: job,
  });
});

export const deleteJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  if (job.postedBy.toString() !== req.user?.userId && !isAdmin) {
    throw new AppError('Unauthorized to delete this job', 403);
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
  });
});

export const getJobRecommendations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const userResume = await Resume.findOne({ student: userId });
  let studentSkills: string[] = userResume?.parsedData?.skills || [];
  if (studentSkills.length === 0) {
    const userDoc = await User.findById(userId);
    studentSkills = userDoc?.skills || [];
  }

  const jobs = await Job.find({ status: JobStatus.OPEN, isApproved: true }).limit(20);

  const recommendations = jobs.map((job) => {
    const reqSkills: string[] = job.requiredSkills || [];
    const matched = reqSkills.filter((sk: string) =>
      studentSkills.some(
        (st: string) =>
          st.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(st.toLowerCase())
      )
    );
    const score = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 60;
    return {
      job,
      matchScore: score,
      matchedSkills: matched,
    };
  });

  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  res.status(200).json({
    success: true,
    data: recommendations,
  });
});
