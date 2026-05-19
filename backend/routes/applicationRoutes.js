const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
  getRecruiterStats,
  recomputeAiScore,
  recomputeJobAiScores
} = require('../controllers/applicationController');

// Student routes
router.post('/:jobId', verifyToken, allowRoles('student'), applyForJob);
router.get('/my-applications', verifyToken, allowRoles('student'), getMyApplications);
router.delete('/:applicationId', verifyToken, allowRoles('student'), withdrawApplication);

// Recruiter routes
router.get('/job/:jobId', verifyToken, allowRoles('recruiter'), getJobApplicants);
router.put('/job/:jobId/ai-scores', verifyToken, allowRoles('recruiter', 'admin'), recomputeJobAiScores);
router.put('/:applicationId/status', verifyToken, allowRoles('recruiter'), updateApplicationStatus);
router.put('/:applicationId/ai-score', verifyToken, allowRoles('recruiter', 'admin'), recomputeAiScore);
router.get('/recruiter/stats', verifyToken, allowRoles('recruiter'), getRecruiterStats);

module.exports = router;
