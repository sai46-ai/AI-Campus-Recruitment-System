const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
    getStats,
    getAllUsers,
    getAllApplications,
    updateUserRole,
    deleteUser,
    verifyRecruiter
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(allowRoles('admin'));

// Statistics
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/verify', verifyRecruiter);
router.delete('/users/:id', deleteUser);

// Applications (view only)
router.get('/applications', getAllApplications);

module.exports = router;
