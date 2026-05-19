const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const { validateCreateJob, validateUpdateJob } = require('../validators/jobValidator');
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  closeJob,
  reopenJob,
  deleteJob,
  getAllJobsAdmin
} = require('../controllers/jobController');

// Public routes
router.get('/', getAllJobs);

// Protected routes - Recruiter only (must come before /:id)
router.post('/', verifyToken, allowRoles('recruiter'), validateCreateJob, createJob);
router.get('/recruiter/my-jobs', verifyToken, allowRoles('recruiter'), getMyJobs);

// Admin routes
router.get('/admin/all', verifyToken, allowRoles('admin'), getAllJobsAdmin);

// Parameterized routes (must come after specific routes)
router.get('/:id', getJobById);
router.put('/:id', verifyToken, allowRoles('recruiter'), validateUpdateJob, updateJob);
router.put('/:id/close', verifyToken, allowRoles('recruiter'), closeJob);
router.put('/:id/reopen', verifyToken, allowRoles('recruiter'), reopenJob);
router.delete('/:id', verifyToken, allowRoles('recruiter'), deleteJob);

module.exports = router;
