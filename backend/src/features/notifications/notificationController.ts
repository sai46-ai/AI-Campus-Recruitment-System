import { Response } from 'express';
import Notification from './notificationModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import { AuthenticatedRequest } from '../../shared/middleware/auth';

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount,
    },
  });
});

export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  await Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true });

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});

export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  await Notification.updateMany({ user: userId, read: false }, { read: true });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
