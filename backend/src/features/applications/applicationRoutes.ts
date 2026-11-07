import { Router } from 'express';
import {
  applyForJob,
  getMyApplications,
  getApplicationHistory,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
  recomputeJobAiScores,
} from './applicationController';
import { authenticateToken, requireRoles } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';

const router = Router();

router.use(authenticateToken);

// Student routes
router.post('/:jobId', requireRoles(UserRole.STUDENT), applyForJob);
router.get('/my-applications', requireRoles(UserRole.STUDENT), getMyApplications);
router.get(
  '/:applicationId/history',
  requireRoles(
    UserRole.STUDENT,
    UserRole.RECRUITER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PLACEMENT_OFFICER
  ),
  getApplicationHistory
);
router.delete('/:applicationId', requireRoles(UserRole.STUDENT), withdrawApplication);

// Recruiter / Placement / Admin routes
router.get(
  '/job/:jobId',
  requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PLACEMENT_OFFICER),
  getJobApplicants
);
router.put(
  '/:applicationId/status',
  requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PLACEMENT_OFFICER),
  updateApplicationStatus
);
router.post(
  '/job/:jobId/recompute-scores',
  requireRoles(UserRole.RECRUITER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  recomputeJobAiScores
);

export default router;
