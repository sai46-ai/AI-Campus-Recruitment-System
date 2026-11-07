import { Response } from 'express';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';
import {
  calculatePlacementStats,
  streamPlacementApplicationsCsv,
  fetchUnapprovedJobs,
  approveJobPosting,
} from './placementService';

export const getPlacementStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const academicYear = req.query.academicYear as string | undefined;
  const stats = await calculatePlacementStats(academicYear);
  res.json({
    success: true,
    data: stats,
  });
});

export const exportPlacementCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await streamPlacementApplicationsCsv(req, res);
});

export const getJobsForApproval = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const canReview =
    req.user?.role === UserRole.ADMIN ||
    req.user?.role === UserRole.SUPER_ADMIN ||
    req.user?.role === UserRole.PLACEMENT_OFFICER;

  if (!canReview) {
    throw new AppError('Unauthorized to review job approvals', 403);
  }

  const jobs = await fetchUnapprovedJobs();
  res.json({ success: true, data: jobs });
});

export const approveJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const canReview =
    req.user?.role === UserRole.ADMIN ||
    req.user?.role === UserRole.SUPER_ADMIN ||
    req.user?.role === UserRole.PLACEMENT_OFFICER;

  if (!canReview) {
    throw new AppError('Unauthorized to approve job openings', 403);
  }

  const job = await approveJobPosting(req.params.id, req.user?.userId || '');

  res.json({
    success: true,
    message: 'Job opening approved for campus placement drive',
    data: job,
  });
});

