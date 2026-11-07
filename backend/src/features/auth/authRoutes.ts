import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  verifyOtp,
  refreshToken,
  getMe,
  updateProfile,
  logout,
  activity,
  getCsrfToken,
  changePassword,
} from './authController';
import { authenticateToken } from '../../shared/middleware/auth';
import { csrfProtection } from '../../shared/middleware/csrfMiddleware';
import { authRateLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// CSRF Bootstrap endpoint (public / pre-auth or auth)
router.get('/csrf-token', getCsrfToken);

// Public authentication endpoints with CSRF protection & rate limiting
router.post('/register', authRateLimiter, csrfProtection, register);
router.post('/login', authRateLimiter, csrfProtection, login);
router.post('/google-login', authRateLimiter, csrfProtection, googleLogin);
router.post('/verify-otp', authRateLimiter, csrfProtection, verifyOtp);

// Session refresh & activity renewal
router.post('/refresh-token', refreshToken);
router.post('/activity', activity);
router.post('/logout', logout);

// Authenticated user operations
router.get('/me', authenticateToken, getMe);
router.get('/profile', authenticateToken, getMe);
router.put('/profile', authenticateToken, csrfProtection, updateProfile);
router.post('/change-password', authenticateToken, csrfProtection, changePassword);

export default router;
