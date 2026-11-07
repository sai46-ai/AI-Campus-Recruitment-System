import Notification from '../../features/notifications/notificationModel';
import logger from '../utils/logger';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an in-app notification in a resilient, non-blocking manner.
 * Failures to deliver notifications are logged but do not crash the primary transaction.
 */
export const createInAppNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    await Notification.create({
      user: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata,
      read: false,
    });
    logger.info(`[Notification] Created in-app notification for user ${payload.userId} [${payload.type}]`);
  } catch (error: any) {
    logger.error(`[Notification] Failed to create in-app notification for user ${payload.userId}: ${error.message}`);
  }
};

