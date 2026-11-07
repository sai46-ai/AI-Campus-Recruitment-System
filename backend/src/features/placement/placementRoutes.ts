import { Router } from 'express';
import {
  getPlacementStats,
  exportPlacementCsv,
  getJobsForApproval,
  approveJob,
} from './placementController';
import { authenticateToken, requireRoles } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';

const placementRouter = Router();

placementRouter.use(
  authenticateToken,
  requireRoles(UserRole.PLACEMENT_OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
);

placementRouter.get('/stats', getPlacementStats);
placementRouter.get('/export-csv', exportPlacementCsv);
placementRouter.get('/jobs-approval', getJobsForApproval);
placementRouter.put('/jobs/:id/approve', approveJob);

export default placementRouter;

