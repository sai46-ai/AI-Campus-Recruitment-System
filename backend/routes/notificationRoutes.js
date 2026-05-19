const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  markNotificationRead,
  markAllRead
} = require('../controllers/notificationController');

router.get('/', verifyToken, getMyNotifications);
router.put('/read-all', verifyToken, markAllRead);
router.put('/:id/read', verifyToken, markNotificationRead);

module.exports = router;
