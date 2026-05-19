const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
    scheduleInterview,
    getApplicationInterviews,
    recordParticipation,
    submitScore,
    submitFeedback,
    cancelInterview
} = require('../controllers/interviewController');

// All routes require authentication
router.use(verifyToken);

// Schedule interview (recruiter only)
router.post('/', allowRoles('recruiter'), scheduleInterview);

// Get interviews for an application (recruiter or student)
router.get('/application/:applicationId', getApplicationInterviews);

// Record participation (any authenticated user involved)
router.put('/:id/participation', recordParticipation);

// Score and feedback (recruiter only)
router.put('/:id/score', allowRoles('recruiter', 'admin'), submitScore);
router.put('/:id/feedback', allowRoles('recruiter', 'admin'), submitFeedback);

// Cancel interview (recruiter only)
router.put('/:id/cancel', allowRoles('recruiter', 'admin'), cancelInterview);

module.exports = router;
