import crypto from 'crypto';
import Session, { ISession } from './sessionModel';
import User from './userModel';
import AppError from '../../shared/utils/appError';
import {
  generateAccessToken,
  sendRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshCookieName,
} from '../../shared/utils/jwt';
import { generateAuthCsrfToken } from '../../shared/utils/csrf';

export const hashSecret = (secret: string): string =>
  crypto.createHash('sha256').update(secret).digest('hex');

export const timingSafeHashMatch = (hashA: string, hashB: string): boolean => {
  const bufA = Buffer.from(hashA, 'utf8');
  const bufB = Buffer.from(hashB, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export interface SessionCreationResult {
  session: ISession;
  rawRefreshToken: string;
  accessToken: string;
  csrfToken: string;
  cookieMaxAgeMs: number;
}

export interface SessionRotationResult {
  session: ISession;
  rawRefreshToken: string;
  accessToken: string;
  csrfToken: string;
  cookieMaxAgeMs: number;
  user: any;
}

export const createSession = async (
  userId: string,
  userRole: string,
  userEmail: string
): Promise<SessionCreationResult> => {
  const user = await User.findById(userId);
  if (!user || !user.isActive || user.isDeleted) {
    throw new AppError('User not found or account deactivated', 401);
  }

  const authorizationVersion = user.authorizationVersion || 1;
  const sessionId = crypto.randomUUID();
  const sessionFamilyId = crypto.randomUUID();
  const secret = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSecret(secret);

  const now = Date.now();
  const absoluteExpiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000); // 7 days
  const idleExpiresAt = new Date(now + 48 * 60 * 60 * 1000); // 48 hours

  const session = await Session.create({
    sessionId,
    userId: user._id,
    sessionFamilyId,
    currentTokenHash: tokenHash,
    consumedTokenHashes: [],
    status: 'ACTIVE',
    absoluteExpiresAt,
    idleExpiresAt,
    lastActivityAt: new Date(now),
    lastRotatedAt: new Date(now),
    rotationCount: 0,
    authorizationVersionAtCreation: authorizationVersion,
  });

  const rawRefreshToken = `${sessionId}.${secret}`;
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: userRole,
    email: userEmail,
    sessionId,
    ver: authorizationVersion,
  });
  const csrfToken = generateAuthCsrfToken(sessionId);

  const cookieMaxAgeMs = Math.floor(
    Math.min(absoluteExpiresAt.getTime() - now, idleExpiresAt.getTime() - now)
  );

  return {
    session,
    rawRefreshToken,
    accessToken,
    csrfToken,
    cookieMaxAgeMs,
  };
};

export const rotateSession = async (rawRefreshToken: string): Promise<SessionRotationResult> => {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string' || !rawRefreshToken.includes('.')) {
    throw new AppError('Invalid refresh token format', 401);
  }

  const dotIndex = rawRefreshToken.indexOf('.');
  const sessionId = rawRefreshToken.substring(0, dotIndex);
  const secret = rawRefreshToken.substring(dotIndex + 1);

  if (!sessionId || !secret) {
    throw new AppError('Invalid refresh token components', 401);
  }

  const session = await Session.findOne({ sessionId });
  if (!session) {
    throw new AppError('Session not found', 401);
  }

  if (session.status === 'REVOKED') {
    throw new AppError('Session has been revoked', 401);
  }
  if (session.status === 'EXPIRED') {
    throw new AppError('Session has expired', 401);
  }

  const now = Date.now();
  if (now >= session.absoluteExpiresAt.getTime()) {
    session.status = 'EXPIRED';
    session.revocationReason = 'ABSOLUTE_LIFETIME_EXPIRED';
    await session.save();
    throw new AppError('Session absolute lifetime expired', 401);
  }
  if (now >= session.idleExpiresAt.getTime()) {
    session.status = 'EXPIRED';
    session.revocationReason = 'IDLE_TIMEOUT_EXPIRED';
    await session.save();
    throw new AppError('Session idle timeout expired', 401);
  }

  if (session.rotationCount >= 1000) {
    session.status = 'REVOKED';
    session.revocationReason = 'ROTATION_CEILING_REACHED';
    await session.save();
    throw new AppError('Session rotation ceiling reached (1,000 rotations). Please log in again.', 401);
  }

  const user = await User.findById(session.userId);
  if (!user || !user.isActive || user.isDeleted) {
    session.status = 'REVOKED';
    session.revocationReason = 'USER_DEACTIVATED';
    await session.save();
    throw new AppError('User account invalid or deactivated', 401);
  }

  if (user.authorizationVersion !== session.authorizationVersionAtCreation) {
    session.status = 'REVOKED';
    session.revocationReason = 'AUTHORIZATION_VERSION_CHANGED';
    await session.save();
    throw new AppError('User credentials or roles changed. Please log in again.', 401);
  }

  const suppliedHash = hashSecret(secret);

  // Check consumedTokenHashes for replay detection
  const isConsumed = session.consumedTokenHashes.some((oldHash: string) =>
    timingSafeHashMatch(oldHash, suppliedHash)
  );

  if (isConsumed) {
    // TIER 2 REPLAY REVOCATION!
    session.status = 'REVOKED';
    session.revocationReason = 'TOKEN_REUSE_DETECTED';
    await session.save();
    throw new AppError('Token reuse detected. Session has been revoked.', 401);
  }

  // Check current valid secret
  if (!timingSafeHashMatch(session.currentTokenHash, suppliedHash)) {
    throw new AppError('Invalid refresh secret', 401);
  }

  // Cooldown check on valid current secret (10 seconds)
  const timeSinceLastRotation = now - session.lastRotatedAt.getTime();
  if (timeSinceLastRotation < 10000) {
    const retryAfterSeconds = Math.ceil((10000 - timeSinceLastRotation) / 1000);
    const err: any = new AppError('Refresh cooldown active. Retry after cooldown period.', 429);
    err.retryAfter = retryAfterSeconds;
    throw err;
  }

  // Prepare before commit
  const nextSecret = crypto.randomBytes(32).toString('hex');
  const nextHash = hashSecret(nextSecret);
  const nextRawRefreshToken = `${sessionId}.${nextSecret}`;

  const nextIdleExpiresAt = new Date(
    Math.min(now + 48 * 60 * 60 * 1000, session.absoluteExpiresAt.getTime())
  );
  const cookieMaxAgeMs = Math.floor(
    Math.min(session.absoluteExpiresAt.getTime() - now, nextIdleExpiresAt.getTime() - now)
  );

  const nextAccessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
    sessionId: session.sessionId,
    ver: user.authorizationVersion,
  });
  const nextCsrfToken = generateAuthCsrfToken(session.sessionId);

  // Atomic commit with conditional update
  const updatedSession = await Session.findOneAndUpdate(
    {
      _id: session._id,
      currentTokenHash: session.currentTokenHash,
      status: 'ACTIVE',
      rotationCount: session.rotationCount,
    },
    {
      $set: {
        currentTokenHash: nextHash,
        lastRotatedAt: new Date(now),
        lastActivityAt: new Date(now),
        idleExpiresAt: nextIdleExpiresAt,
      },
      $push: { consumedTokenHashes: session.currentTokenHash },
      $inc: { rotationCount: 1 },
    },
    { new: true }
  );

  if (!updatedSession) {
    throw new AppError('Concurrent refresh conflict occurred. Please retry.', 409);
  }

  return {
    session: updatedSession,
    rawRefreshToken: nextRawRefreshToken,
    accessToken: nextAccessToken,
    csrfToken: nextCsrfToken,
    cookieMaxAgeMs,
    user,
  };
};

export const recordSessionActivity = async (
  rawRefreshToken: string
): Promise<{ cookieMaxAgeMs: number; session: ISession; rawRefreshToken: string }> => {
  if (!rawRefreshToken || !rawRefreshToken.includes('.')) {
    throw new AppError('Invalid refresh token format', 401);
  }

  const [sessionId, secret] = rawRefreshToken.split('.');
  const session = await Session.findOne({ sessionId });
  if (!session || session.status !== 'ACTIVE') {
    throw new AppError('Active session not found', 401);
  }

  const suppliedHash = hashSecret(secret);
  if (!timingSafeHashMatch(session.currentTokenHash, suppliedHash)) {
    throw new AppError('Invalid refresh secret for activity extension', 401);
  }

  const now = Date.now();
  if (now >= session.absoluteExpiresAt.getTime()) {
    session.status = 'EXPIRED';
    await session.save();
    throw new AppError('Session absolute lifetime expired', 401);
  }

  // Extend idleExpiresAt up to absoluteExpiresAt
  const newIdleExpiresAt = new Date(
    Math.min(now + 48 * 60 * 60 * 1000, session.absoluteExpiresAt.getTime())
  );
  const cookieMaxAgeMs = Math.floor(
    Math.min(session.absoluteExpiresAt.getTime() - now, newIdleExpiresAt.getTime() - now)
  );

  // Atomically update lastActivityAt without rotating currentTokenHash or rotationCount
  session.lastActivityAt = new Date(now);
  session.idleExpiresAt = newIdleExpiresAt;
  await session.save();

  return {
    cookieMaxAgeMs,
    session,
    rawRefreshToken,
  };
};

export const revokeSession = async (sessionId: string, reason: string = 'LOGOUT'): Promise<void> => {
  await Session.updateOne(
    { sessionId, status: 'ACTIVE' },
    { $set: { status: 'REVOKED', revocationReason: reason } }
  );
};

export const revokeAllUserSessions = async (
  userId: string,
  reason: string = 'USER_REVOCATION'
): Promise<void> => {
  await Session.updateMany(
    { userId, status: 'ACTIVE' },
    { $set: { status: 'REVOKED', revocationReason: reason } }
  );
};

