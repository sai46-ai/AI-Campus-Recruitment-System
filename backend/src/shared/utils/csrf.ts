import crypto from 'crypto';
import AppError from './appError';

const getCsrfSecret = (): string => {
  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== 'production') {
      return 'dev_csrf_secret_key_minimum_32_characters_length_2026';
    }
    throw new Error('CSRF_SECRET environment variable is missing or shorter than 32 characters');
  }
  return secret;
};

export interface CsrfVerificationResult {
  valid: boolean;
  type: 'pre' | 'auth';
  identifier: string; // preSessionId or sessionId
  expiresAt: number;
}

export const generatePreAuthCsrfToken = (preSessionId?: string): { token: string; preSessionId: string } => {
  const secret = getCsrfSecret();
  const id = preSessionId || crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  const nonce = crypto.randomBytes(16).toString('hex');

  const canonicalMessage = `pre:${id}:${expiresAt}:${nonce}`;
  const signature = crypto.createHmac('sha256', secret).update(canonicalMessage).digest('hex');
  const encodedMessage = Buffer.from(canonicalMessage, 'utf8').toString('base64url');

  return {
    token: `${encodedMessage}.${signature}`,
    preSessionId: id,
  };
};

export const generateAuthCsrfToken = (sessionId: string): string => {
  const secret = getCsrfSecret();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  const nonce = crypto.randomBytes(16).toString('hex');

  const canonicalMessage = `auth:${sessionId}:${expiresAt}:${nonce}`;
  const signature = crypto.createHmac('sha256', secret).update(canonicalMessage).digest('hex');
  const encodedMessage = Buffer.from(canonicalMessage, 'utf8').toString('base64url');

  return `${encodedMessage}.${signature}`;
};

export const verifyCsrfToken = (wireToken: string): CsrfVerificationResult => {
  if (!wireToken || typeof wireToken !== 'string') {
    return { valid: false, type: 'pre', identifier: '', expiresAt: 0 };
  }

  const parts = wireToken.split('.');
  if (parts.length !== 2) {
    return { valid: false, type: 'pre', identifier: '', expiresAt: 0 };
  }

  const [encodedMessage, signature] = parts;
  let canonicalMessage: string;
  try {
    canonicalMessage = Buffer.from(encodedMessage, 'base64url').toString('utf8');
  } catch {
    return { valid: false, type: 'pre', identifier: '', expiresAt: 0 };
  }

  const secret = getCsrfSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(canonicalMessage).digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, type: 'pre', identifier: '', expiresAt: 0 };
  }

  const msgParts = canonicalMessage.split(':');
  if (msgParts.length !== 4) {
    return { valid: false, type: 'pre', identifier: '', expiresAt: 0 };
  }

  const [type, identifier, expStr] = msgParts;
  const expiresAt = Number(expStr);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, type: (type === 'auth' ? 'auth' : 'pre'), identifier, expiresAt };
  }

  return {
    valid: true,
    type: type === 'auth' ? 'auth' : 'pre',
    identifier,
    expiresAt,
  };
};

export const getPreAuthCsrfCookieName = (isSecure: boolean = false) =>
  isSecure ? '__Host-csrf_pre_session' : 'csrf_pre_session';

