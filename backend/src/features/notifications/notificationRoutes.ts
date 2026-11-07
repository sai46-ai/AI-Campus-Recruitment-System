import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from './notificationController';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
