import { Response } from 'express';
import { sendRefreshTokenCookie, clearRefreshTokenCookie } from '../src/shared/utils/jwt';
import { getNormalizedAiServiceUrl } from '../src/features/ai/providers/pythonAiClient';
import request from 'supertest';
import app from '../src/app';

describe('Render Production Readiness Verification Suite', () => {
  describe('Cross-Site Cookie Configuration for Render HTTPS', () => {
    it('sets SameSite=None and Secure=true when isSecure is true for refresh tokens', () => {
      const cookies: Record<string, { val: string; opts: any }> = {};
      const mockRes: any = {
        cookie: (name: string, val: string, opts: any) => {
          cookies[name] = { val, opts };
        },
      };

      sendRefreshTokenCookie(mockRes as Response, 'test-refresh-token', 604800000, true);

      expect(cookies['__Host-refresh_token']).toBeDefined();
      expect(cookies['__Host-refresh_token'].opts.secure).toBe(true);
      expect(cookies['__Host-refresh_token'].opts.sameSite).toBe('none');
      expect(cookies['__Host-refresh_token'].opts.httpOnly).toBe(true);
      expect(cookies['__Host-refresh_token'].opts.path).toBe('/');
    });

    it('sets SameSite=Lax and Secure=false when isSecure is false for local development', () => {
      const cookies: Record<string, { val: string; opts: any }> = {};
      const mockRes: any = {
        cookie: (name: string, val: string, opts: any) => {
          cookies[name] = { val, opts };
        },
      };

      sendRefreshTokenCookie(mockRes as Response, 'test-refresh-token', 604800000, false);

      expect(cookies['refresh_token']).toBeDefined();
      expect(cookies['refresh_token'].opts.secure).toBe(false);
      expect(cookies['refresh_token'].opts.sameSite).toBe('lax');
    });

    it('clears refresh token cookies with matching SameSite and Secure flags', () => {
      const cookies: Record<string, { val: string; opts: any }> = {};
      const mockRes: any = {
        cookie: (name: string, val: string, opts: any) => {
          cookies[name] = { val, opts };
        },
      };

      clearRefreshTokenCookie(mockRes as Response, true);

      expect(cookies['__Host-refresh_token']).toBeDefined();
      expect(cookies['__Host-refresh_token'].opts.secure).toBe(true);
      expect(cookies['__Host-refresh_token'].opts.sameSite).toBe('none');
    });

    it('issues pre-auth CSRF cookie with SameSite=None when X-Forwarded-Proto is https', async () => {
      const res = await request(app)
        .get('/api/v1/auth/csrf-token')
        .set('X-Forwarded-Proto', 'https');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.csrfToken).toBeDefined();

      const setCookieHeaders = res.headers['set-cookie'] || [];
      const cookieStr = Array.isArray(setCookieHeaders) ? setCookieHeaders.join('; ') : setCookieHeaders;

      expect(cookieStr).toMatch(/SameSite=None/i);
      expect(cookieStr).toMatch(/Secure/i);
    });
  });

  describe('Internal Private Service URL Normalization', () => {
    const originalEnv = process.env.AI_SERVICE_URL;

    afterEach(() => {
      process.env.AI_SERVICE_URL = originalEnv;
    });

    it('prepends http:// to raw host:port provided by Render private service discovery', () => {
      process.env.AI_SERVICE_URL = 'ai-campus-ai-service:8000';
      const normalized = getNormalizedAiServiceUrl();
      expect(normalized).toBe('http://ai-campus-ai-service:8000');
    });

    it('preserves existing http:// prefix', () => {
      process.env.AI_SERVICE_URL = 'http://ai-campus-ai-service:8000';
      const normalized = getNormalizedAiServiceUrl();
      expect(normalized).toBe('http://ai-campus-ai-service:8000');
    });

    it('preserves existing https:// prefix', () => {
      process.env.AI_SERVICE_URL = 'https://ai-campus-ai-service.internal:8000';
      const normalized = getNormalizedAiServiceUrl();
      expect(normalized).toBe('https://ai-campus-ai-service.internal:8000');
    });

    it('handles empty or unset AI_SERVICE_URL safely', () => {
      delete process.env.AI_SERVICE_URL;
      const normalized = getNormalizedAiServiceUrl();
      expect(normalized).toBe('');
    });
  });
});

