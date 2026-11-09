import { Request, Response } from 'express';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import nodemailer from 'nodemailer';
import User from './userModel';
import Session from './sessionModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import logger from '../../shared/utils/logger';
import { verifyGoogleIdToken } from '../../shared/utils/googleAuth';
import {
  generateAccessToken,
  sendRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../../shared/utils/jwt';
import {
  createSession,
  rotateSession,
  recordSessionActivity,
  revokeSession,
  revokeAllUserSessions,
  hashSecret,
  timingSafeHashMatch,
} from './sessionService';
import {
  generateAuthCsrfToken,
  generatePreAuthCsrfToken,
  getPreAuthCsrfCookieName,
} from '../../shared/utils/csrf';
import { UserRole } from '../../shared/constants/roles';
import { AuthenticatedRequest } from '../../shared/middleware/auth';

const ALLOWED_REGISTRATION_ROLES = [UserRole.STUDENT, UserRole.RECRUITER];

const hashOtp = (otp: string) => createHash('sha256').update(otp).digest('hex');

const sendVerificationOtp = async (email: string, otp: string) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
  const port = Number(SMTP_PORT);
  if (!SMTP_HOST || !Number.isInteger(port) || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_OTP === 'true') {
      logger.info(`[Auth DEV] SMTP not configured. OTP for ${email}: ${otp}`);
      return;
    }
    throw new AppError('Account verification email is not configured on this server', 503);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your account',
    text: `Your account verification code is ${otp}. It expires in 10 minutes.`,
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department, graduationYear, phone, cgpa, activeBacklogs } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email address already exists', 400);
  }

  const requestedRole = (role || UserRole.STUDENT) as UserRole;
  const sanitizedRole = ALLOWED_REGISTRATION_ROLES.includes(requestedRole)
    ? requestedRole
    : UserRole.STUDENT;

  const otpCode = randomInt(100000, 1000000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: sanitizedRole,
    department,
    graduationYear,
    phone,
    ...(cgpa !== undefined ? { cgpa: Math.min(10, Math.max(0, Number(cgpa) || 0)) } : {}),
    ...(activeBacklogs !== undefined ? { activeBacklogs: Math.max(0, Number(activeBacklogs) || 0) } : {}),
    otpCode: hashOtp(otpCode),
    otpExpires,
  });

  try {
    await sendVerificationOtp(newUser.email, otpCode);
  } catch (error) {
    await newUser.deleteOne();
    if (error instanceof AppError) throw error;
    logger.error('[Auth] Verification email delivery failed');
    throw new AppError('Could not send account verification email. Please try again later.', 503);
  }

  res.status(201).json({
    success: true,
    message: 'User registered. Verify account before logging in.',
    data: {
      user: {
        id: newUser._id,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        isRecruiterVerified: newUser.isRecruiterVerified,
        department: newUser.department,
        graduationYear: newUser.graduationYear,
        cgpa: newUser.cgpa,
        activeBacklogs: newUser.activeBacklogs,
      },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive || user.isDeleted) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  if (!user.isVerified) {
    throw new AppError('Account not verified. Please verify your OTP first.', 403);
  }

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const sessionResult = await createSession(user._id.toString(), user.role, user.email);
  sendRefreshTokenCookie(res, sessionResult.rawRefreshToken, sessionResult.cookieMaxAgeMs, isSecure);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isRecruiterVerified: user.isRecruiterVerified,
        skills: user.skills,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        activeBacklogs: user.activeBacklogs,
      },
      accessToken: sessionResult.accessToken,
      csrfToken: sessionResult.csrfToken,
    },
  });
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError('Google ID token is required', 400);
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google login is not configured on the server', 503);
  }

  const payload = await verifyGoogleIdToken(idToken, process.env.GOOGLE_CLIENT_ID);

  if (!payload.email) {
    throw new AppError('Google token payload missing email', 400);
  }

  const email = payload.email.toLowerCase();

  let user = await User.findOne({ email });
  if (user && (!user.isActive || user.isDeleted)) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }
  if (!payload.email_verified) {
    throw new AppError('Google account email must be verified', 401);
  }
  if (!user) {
    user = await User.create({
      name: payload.name || '',
      email,
      googleId: payload.sub,
      avatar: payload.picture || '',
      isVerified: true,
      role: UserRole.STUDENT,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.isVerified = true;
    await user.save();
  }

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const sessionResult = await createSession(user._id.toString(), user.role, user.email);
  sendRefreshTokenCookie(res, sessionResult.rawRefreshToken, sessionResult.cookieMaxAgeMs, isSecure);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isRecruiterVerified: user.isRecruiterVerified,
        avatar: user.avatar,
        department: user.department,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        activeBacklogs: user.activeBacklogs,
        skills: user.skills,
      },
      accessToken: sessionResult.accessToken,
      csrfToken: sessionResult.csrfToken,
    },
  });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otpCode } = req.body;

  if (typeof email !== 'string' || typeof otpCode !== 'string' || !/^\d{6}$/.test(otpCode)) {
    throw new AppError('A valid email and six-digit OTP are required', 400);
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+otpCode +otpExpires');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const storedOtpHash = user.otpCode || '';
  const suppliedOtpHash = hashOtp(otpCode);
  const otpMatches =
    storedOtpHash.length === suppliedOtpHash.length &&
    timingSafeEqual(Buffer.from(storedOtpHash), Buffer.from(suppliedOtpHash));
  if (!otpMatches || !user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError('Invalid or expired OTP code', 400);
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account successfully verified',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const token = req.cookies?.['__Host-refresh_token'] || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];

  if (!token) {
    throw new AppError('Session has expired. Please sign in again.', 401);
  }

  // If token is in opaque format: `${sessionId}.${secret}`
  if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length === 2 && parts[0].length >= 16 && parts[1].length >= 32) {
      try {
        const rotResult = await rotateSession(token);
        sendRefreshTokenCookie(res, rotResult.rawRefreshToken, rotResult.cookieMaxAgeMs, isSecure);

        return res.status(200).json({
          success: true,
          data: {
            accessToken: rotResult.accessToken,
            csrfToken: rotResult.csrfToken,
          },
        });
      } catch (err: any) {
        if (err?.statusCode === 429) {
          res.setHeader('Retry-After', String(err.retryAfter || 10));
        } else {
          clearRefreshTokenCookie(res, isSecure);
        }
        throw err;
      }
    }
  }

  // Fallback for legacy refresh JWT in existing integration tests
  try {
    const { verifyRefreshToken } = await import('../../shared/utils/jwt');
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || user.isDeleted || !user.isVerified) {
      throw new AppError('User account invalid or deactivated', 401);
    }
    const sessionResult = await createSession(user._id.toString(), user.role, user.email);
    sendRefreshTokenCookie(res, sessionResult.rawRefreshToken, sessionResult.cookieMaxAgeMs, isSecure);
    return res.status(200).json({
      success: true,
      data: {
        accessToken: sessionResult.accessToken,
        csrfToken: sessionResult.csrfToken,
      },
    });
  } catch {
    clearRefreshTokenCookie(res, isSecure);
    throw new AppError('Invalid or expired refresh token', 401);
  }
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    throw new AppError('User profile not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isRecruiterVerified: user.isRecruiterVerified,
      skills: user.skills,
      bio: user.bio,
      phone: user.phone,
      department: user.department,
      graduationYear: user.graduationYear,
      cgpa: user.cgpa,
      activeBacklogs: user.activeBacklogs,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, bio, phone, skills, department, graduationYear, cgpa, activeBacklogs } = req.body;

  const user = await User.findById(req.user?.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name) user.name = String(name).trim();
  if (bio !== undefined) user.bio = String(bio).slice(0, 500);
  if (phone !== undefined) user.phone = String(phone).trim();
  if (Array.isArray(skills)) user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
  if (department !== undefined) user.department = String(department).trim();
  if (graduationYear !== undefined && graduationYear !== '') {
    const parsedYear = Number(graduationYear);
    if (Number.isFinite(parsedYear)) user.graduationYear = parsedYear;
  }
  if (cgpa !== undefined && cgpa !== '') {
    const parsedCgpa = Number(cgpa);
    if (Number.isFinite(parsedCgpa) && parsedCgpa >= 0 && parsedCgpa <= 10) {
      user.cgpa = parsedCgpa;
    }
  }
  if (activeBacklogs !== undefined && activeBacklogs !== '') {
    const parsedBacklogs = Number(activeBacklogs);
    if (Number.isFinite(parsedBacklogs) && parsedBacklogs >= 0) {
      user.activeBacklogs = Math.floor(parsedBacklogs);
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isRecruiterVerified: user.isRecruiterVerified,
      skills: user.skills,
      bio: user.bio,
      phone: user.phone,
      department: user.department,
      graduationYear: user.graduationYear,
      cgpa: user.cgpa,
      activeBacklogs: user.activeBacklogs,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const rawRefreshToken = req.cookies?.['__Host-refresh_token'] || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];
  if (rawRefreshToken && rawRefreshToken.includes('.')) {
    const [sessionId] = rawRefreshToken.split('.');
    await revokeSession(sessionId, 'LOGOUT').catch(() => {});
  }
  clearRefreshTokenCookie(res, isSecure);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const activity = asyncHandler(async (req: Request, res: Response) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const rawRefreshToken = req.cookies?.['__Host-refresh_token'] || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];
  if (!rawRefreshToken) {
    throw new AppError('Session has expired. Please sign in again.', 401);
  }
  const actResult = await recordSessionActivity(rawRefreshToken);
  sendRefreshTokenCookie(res, rawRefreshToken, actResult.cookieMaxAgeMs, isSecure);
  res.status(200).json({
    success: true,
    message: 'Session activity recorded',
  });
});

export const getCsrfToken = asyncHandler(async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const rawRefreshToken = req.cookies?.['__Host-refresh_token'] || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];

  if (rawRefreshToken && rawRefreshToken.includes('.')) {
    const [sessionId, secret] = rawRefreshToken.split('.');
    const session = await Session.findOne({ sessionId, status: 'ACTIVE' });
    if (session) {
      const suppliedHash = hashSecret(secret);
      if (timingSafeHashMatch(session.currentTokenHash, suppliedHash)) {
        const csrfToken = generateAuthCsrfToken(session.sessionId);
        res.status(200).json({
          success: true,
          csrfToken,
        });
        return;
      }
    }
  }

  // Otherwise, generate pre-authentication CSRF token & set companion cookie
  const { token, preSessionId } = generatePreAuthCsrfToken();
  const cookieName = getPreAuthCsrfCookieName(isSecure);
  res.cookie(cookieName, preSessionId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    csrfToken: token,
  });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new AppError('Both current password and new password are required', 400);
  }
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  const user = await User.findById(req.user?.userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save(); // pre('save') increments authorizationVersion

  await revokeAllUserSessions(user._id.toString(), 'PASSWORD_CHANGED');
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  clearRefreshTokenCookie(res, isSecure);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again with your new password.',
  });
});
