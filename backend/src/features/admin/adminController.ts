import { Request, Response } from 'express';
import User from '../auth/userModel';
import Job from '../jobs/jobModel';
import Application from '../applications/applicationModel';
import AuditLog from './auditModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';
import { escapeRegExp } from '../../shared/utils/escapeRegExp';

export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalStudents, totalRecruiters, pendingRecruiterVerifications, totalJobs, totalApplications] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: UserRole.STUDENT, isDeleted: false }),
    User.countDocuments({ role: UserRole.RECRUITER, isDeleted: false }),
    User.countDocuments({ role: UserRole.RECRUITER, isRecruiterVerified: false, isDeleted: false }),
    Job.countDocuments(),
    Application.countDocuments()
  ]);
  res.json({ success: true, data: { totalUsers, totalStudents, totalRecruiters, pendingRecruiterVerifications, totalJobs, totalApplications } });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query: any = { isDeleted: false };
  if (role && Object.values(UserRole).includes(role as UserRole)) query.role = role;
  if (search) {
    const safeSearch = escapeRegExp(String(search).slice(0, 100));
    query.$or = [{ name: { $regex: safeSearch, $options: 'i' } }, { email: { $regex: safeSearch, $options: 'i' } }];
  }
  const parsedPage = Number.parseInt(String(page), 10);
  const parsedLimit = Number.parseInt(String(limit), 10);
  const p = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1;
  const l = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;
  const [users, total] = await Promise.all([
    User.find(query).select('name email role isVerified isRecruiterVerified isActive department graduationYear createdAt').sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
    User.countDocuments(query)
  ]);
  res.json({ success: true, data: { users, pagination: { total, page: p, pages: Math.ceil(total / l) } } });
});

export const updateUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  if (!Object.values(UserRole).includes(role)) throw new AppError('Invalid role specified', 400);
  const actorIsSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
  if (!actorIsSuperAdmin && [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PLACEMENT_OFFICER].includes(role)) {
    throw new AppError('Only a super administrator can assign privileged roles', 403);
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user?.userId && user.role !== role) {
    throw new AppError('You cannot change your own role', 403);
  }
  if (!actorIsSuperAdmin && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Only a super administrator can modify an administrator account', 403);
  }
  user.role = role;
  await user.save();
  await AuditLog.create({ actor: req.user?.userId, actorEmail: req.user?.email, action: 'UPDATE_ROLE', targetResource: `User:${user._id}`, details: { newRole: role } });
  res.json({ success: true, message: `User role updated to ${role}`, data: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, isActive: user.isActive } });
});

export const verifyRecruiter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: UserRole.RECRUITER, isDeleted: false }, { isRecruiterVerified: true }, { new: true }).select('name email role isVerified isRecruiterVerified isActive');
  if (!user) throw new AppError('Recruiter not found', 404);
  res.json({ success: true, message: 'Recruiter corporate verification completed', data: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, isRecruiterVerified: user.isRecruiterVerified, isActive: user.isActive } });
});

export const toggleUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  const actorIsSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
  if (user._id.toString() === req.user?.userId) throw new AppError('You cannot change your own account status', 403);
  if (!actorIsSuperAdmin && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Only a super administrator can modify an administrator account', 403);
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User status set to ${user.isActive ? 'Active' : 'Inactive'}`, data: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
});

export const getAuditLogs = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await AuditLog.find().populate('actor', 'name email role').sort({ createdAt: -1 }).limit(100) });
});

// Backward-compatible re-exports for the extracted Placement feature module
export {
  getPlacementStats,
  exportPlacementCsv,
  getJobsForApproval,
  approveJob,
} from '../placement/placementController';

