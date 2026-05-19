const Notification = require('../models/Notification');
const { createResponse, asyncHandler } = require('../utils/helpers');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Internal helper to create a notification.
 * Exported so controllers (jobs/applications) can call it without duplicating logic.
 */
const createNotification = async ({
  userId,
  type = 'SYSTEM',
  title,
  message,
  metadata = {}
}) => {
  if (!userId) throw new ApiError(400, 'Notification userId is required');
  if (!message) throw new ApiError(400, 'Notification message is required');

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    metadata
  });
};

/**
 * @desc Get current user's notifications
 * @route GET /api/notifications
 * @access Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { user: req.user.id };
  if (unreadOnly === 'true') query.read = false;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(query)
  ]);

  res.status(200).json(
    createResponse(true, 'Notifications retrieved successfully', {
      notifications: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  );
});

/**
 * @desc Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json(
    createResponse(true, 'Notification marked as read', { notification })
  );
});

/**
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { $set: { read: true } }
  );

  res.status(200).json(createResponse(true, 'All notifications marked as read'));
});

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  markAllRead
};
