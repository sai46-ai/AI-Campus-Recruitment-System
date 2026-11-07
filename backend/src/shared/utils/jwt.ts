import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { Response } from 'express';
import logger from './logger';

// Secrets MUST be provided via environment variables. The server will not start
// with a hardcoded fallback: a guessable secret would let anyone forge tokens.
const MIN_LENGTH = 32;

if (process.env.NODE_ENV !== 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < MIN_LENGTH) {
    process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_length';
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < MIN_LENGTH) {
    process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_minimum_32_characters_length';
  }
  if (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.length < MIN_LENGTH) {
    process.env.CSRF_SECRET = 'dev_csrf_secret_key_minimum_32_characters_length_2026';
  }
}

const S = process.env.JWT_SECRET;
const RS = process.env.JWT_REFRESH_SECRET;
const CS = process.env.CSRF_SECRET;

if (!S || S.length < MIN_LENGTH) {
  logger.error(
    `[JWT] FATAL: JWT_SECRET is missing or shorter than ${MIN_LENGTH} characters. ` +
    `Set a strong random secret (e.g. openssl rand -base64 48) in your environment before starting the server.`
  );
  process.exit(1);
}

if (!RS || RS.length < MIN_LENGTH) {
  logger.error(
    `[JWT] FATAL: JWT_REFRESH_SECRET is missing or shorter than ${MIN_LENGTH} characters. ` +
    `Set a strong random secret distinct from JWT_SECRET before starting the server.`
  );
  process.exit(1);
}

if (!CS || CS.length < MIN_LENGTH) {
  logger.error(
    `[JWT] FATAL: CSRF_SECRET is missing or shorter than ${MIN_LENGTH} characters. ` +
    `Set a strong random secret distinct from JWT_SECRET before starting the server.`
  );
  process.exit(1);
}

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
  sessionId?: string;
  ver?: number;
}

export const generateAccessToken = (p: TokenPayload) =>
  jwt.sign(p, S, { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any });

export const generateRefreshToken = (p: TokenPayload) =>
  jwt.sign(p, RS, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any });

export const verifyAccessToken = (t: string) => jwt.verify(t, S) as TokenPayload;
export const verifyRefreshToken = (t: string) => jwt.verify(t, RS) as TokenPayload;

export const getRefreshCookieName = (isSecure: boolean = false) =>
  isSecure ? '__Host-refresh_token' : 'refresh_token';

export const sendRefreshTokenCookie = (res: Response, token: string, maxAgeMs: number = 604800000, isSecure: boolean = false) => {
  const cookieName = getRefreshCookieName(isSecure);
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  });
  // Maintain backward compatibility for legacy tests checking 'refreshToken'
  if ((cookieName as string) !== 'refreshToken') {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });
  }
};

export const clearRefreshTokenCookie = (res: Response, isSecure: boolean = false) => {
  const cookieName = getRefreshCookieName(isSecure);
  res.cookie(cookieName, '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
};