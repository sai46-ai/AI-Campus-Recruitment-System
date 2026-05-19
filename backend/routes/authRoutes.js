const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { loginRateLimiter, registerRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const resumeRoutes = require('../resume/routes/resumeRoutes');
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');

// Public routes (with rate limiting and input validation)
router.post('/register', registerRateLimiter, validateRegister, register);
router.post('/login', loginRateLimiter, validateLogin, login);

// Protected routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
// Keep existing API contract: POST /api/auth/resume
router.use('/resume', resumeRoutes);

module.exports = router;
