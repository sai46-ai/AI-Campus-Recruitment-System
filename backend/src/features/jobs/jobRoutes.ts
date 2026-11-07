import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  closeJob,
  reopenJob,
  deleteJob,
  getJobRecommendations,
} from './jobController';
import { authenticateToken, optionalAuth, requireRoles, requireVerifiedRecruiter } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';

const router = Router();

router.get('/', getJobs);
router.get('/recommendations', authenticateToken, requireRoles(UserRole.STUDENT), getJobRecommendations);
router.get('/recruiter/my-jobs', authenticateToken, requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN), getMyJobs);
router.get('/:id', optionalAuth, getJobById);

router.post(
  '/',
  authenticateToken,
  requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PLACEMENT_OFFICER),
  requireVerifiedRecruiter,
  createJob
);
router.put('/:id', authenticateToken, requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN), updateJob);
router.put('/:id/close', authenticateToken, requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN), closeJob);
router.put('/:id/reopen', authenticateToken, requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN), reopenJob);
router.delete('/:id', authenticateToken, requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteJob);

export default router;
