import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  verifyRecruiter,
  toggleUserStatus,
  getAuditLogs,
} from './adminController';
import { authenticateToken, requireRoles } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';
import placementRouter from '../placement/placementRoutes';

const adminRouter = Router();
adminRouter.use(authenticateToken);
const adminOnly = requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

adminRouter.get('/stats', adminOnly, getAdminStats);
adminRouter.get('/users', adminOnly, getAllUsers);
adminRouter.put('/users/:id/role', adminOnly, updateUserRole);
adminRouter.put('/users/:id/verify', adminOnly, verifyRecruiter);
adminRouter.put('/users/:id/toggle-status', adminOnly, toggleUserStatus);
adminRouter.get('/audit-logs', adminOnly, getAuditLogs);

// Re-export placementRouter for backward compatibility with legacy imports
export const placementRoutes = placementRouter;

export default adminRouter;

