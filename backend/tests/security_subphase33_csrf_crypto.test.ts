import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app';
import {
  generatePreAuthCsrfToken,
  generateAuthCsrfToken,
  verifyCsrfToken,
  getPreAuthCsrfCookieName,
} from '../src/shared/utils/csrf';
import { generateAccessToken } from '../src/shared/utils/jwt';
import { UserRole } from '../src/shared/constants/roles';

describe('Sub-Phase 3.3: Canonical CSRF Cryptographic Infrastructure', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    process.env.ENFORCE_CSRF = 'true';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    delete process.env.ENFORCE_CSRF;
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('1. Cryptographic Wire Formats & Signatures', () => {
    it('should generate valid pre-auth CSRF tokens with base64url message and HMAC signature', () => {
      const { token, preSessionId } = generatePreAuthCsrfToken();
      expect(token).toContain('.');
      const [msg, sig] = token.split('.');
      expect(sig).toHaveLength(64); // SHA-256 hex signature = 64 characters

      const verification = verifyCsrfToken(token);
      expect(verification.valid).toBe(true);
      expect(verification.type).toBe('pre');
      expect(verification.identifier).toBe(preSessionId);
    });

    it('should generate valid authenticated CSRF tokens bound to sessionId', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const token = generateAuthCsrfToken(sessionId);
      expect(token).toContain('.');

      const verification = verifyCsrfToken(token);
      expect(verification.valid).toBe(true);
      expect(verification.type).toBe('auth');
      expect(verification.identifier).toBe(sessionId);
    });

    it('should fail closed when CSRF signature is tampered with', () => {
      const { token } = generatePreAuthCsrfToken();
      const [msg, sig] = token.split('.');
      const tamperedSig = sig.substring(0, sig.length - 2) + '00';
      const tamperedToken = `${msg}.${tamperedSig}`;

      const verification = verifyCsrfToken(tamperedToken);
      expect(verification.valid).toBe(false);
    });

    it('should fail closed when CSRF message is modified', () => {
      const { token } = generatePreAuthCsrfToken();
      const [, sig] = token.split('.');
      const modifiedMsg = Buffer.from('pre:hacked:9999999999999:1234', 'utf8').toString('base64url');
      const tamperedToken = `${modifiedMsg}.${sig}`;

      const verification = verifyCsrfToken(tamperedToken);
      expect(verification.valid).toBe(false);
    });
  });

  describe('2. Bootstrap Endpoint GET /api/v1/auth/csrf-token', () => {
    it('should issue a pre-auth CSRF token and set companion cookie for unauthenticated visitors', async () => {
      const res = await request(app).get('/api/v1/auth/csrf-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.csrfToken).toBeDefined();

      const verification = verifyCsrfToken(res.body.csrfToken);
      expect(verification.valid).toBe(true);
      expect(verification.type).toBe('pre');

      // Verify companion cookie was set
      const cookies = res.headers['set-cookie'] || [];
      const cookieStr = Array.isArray(cookies) ? cookies.join(';') : cookies;
      expect(cookieStr).toContain('csrf_pre_session=');
    });

    it('should set Cache-Control: no-store on bootstrap responses', async () => {
      const res = await request(app).get('/api/v1/auth/csrf-token');
      expect(res.headers['cache-control']).toContain('no-store');
    });
  });

  describe('3. Route Scope & Double-Submit Protection', () => {
    const studentToken = generateAccessToken({
      userId: '507f1f77bcf86cd799439001',
      role: UserRole.STUDENT,
      email: 'candidate@campus.edu',
    });

    it('should reject state-changing request if X-CSRF-Token header is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@campus.edu', password: 'Password123!' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('CSRF token missing');
    });

    it('should reject authenticated route if a pre-auth CSRF token is presented (INVALID_CSRF_TOKEN_SCOPE)', async () => {
      const { token, preSessionId } = generatePreAuthCsrfToken();

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .set('X-CSRF-Token', token)
        .set('Cookie', [`csrf_pre_session=${preSessionId}`])
        .send({ title: 'Test Job' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('INVALID_CSRF_TOKEN_SCOPE');
    });
  });
});
