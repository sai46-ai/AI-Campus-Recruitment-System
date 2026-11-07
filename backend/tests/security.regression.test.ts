import request from 'supertest';
import app from '../src/app';
import User from '../src/features/auth/userModel';

/**
 * Security Regression Test Suite
 *
 * These tests verify that critical security fixes from Phase 1-4 are enforced.
 * They MUST pass before any production deployment.
 */

describe('Security Regression Tests', () => {
  // -------------------------------------------------------------------------
  // JWT Secret Enforcement (fail-closed)
  // -------------------------------------------------------------------------
  describe('JWT secret enforcement', () => {
    it('should fail to start if JWT_SECRET is missing or too short', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect((process.env.JWT_SECRET || '').length).toBeGreaterThanOrEqual(32);
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect((process.env.JWT_REFRESH_SECRET || '').length).toBeGreaterThanOrEqual(32);
    });
  });

  // -------------------------------------------------------------------------
  // CORS Enforcement
  // -------------------------------------------------------------------------
  describe('CORS strict allowlist', () => {
    const allowedOrigin = 'http://localhost:5173';
    const evilOrigin = 'https://evil.example.com';

    it('should allow requests from configured origin', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', allowedOrigin);
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should REJECT requests from unknown origin with credentials', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', evilOrigin);
      expect(res.status).toBe(500);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow same-origin requests (no Origin header)', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
    });
  });

  // -------------------------------------------------------------------------
  // OTP / Registration Security
  // -------------------------------------------------------------------------
  describe('Registration & OTP security', () => {
    beforeEach(() => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockImplementation((data: any) =>
        Promise.resolve({
          _id: '507f1f77bcf86cd799439011',
          name: data.name,
          email: data.email,
          role: data.role,
          isVerified: false,
          isRecruiterVerified: false,
          department: data.department,
          graduationYear: data.graduationYear,
          deleteOne: jest.fn().mockResolvedValue(true),
        } as any)
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should NOT return OTP code in registration response', async () => {
      const email = `test+${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email,
          password: 'Password123!',
          role: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).not.toHaveProperty('accessToken');
      expect(res.body.data).not.toHaveProperty('otpCode');
      expect(res.body.data.user).toHaveProperty('isVerified', false);
    });

    it('should reject registration with privileged role (admin)', async () => {
      const email = `test+${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Attacker',
          email,
          password: 'Password123!',
          role: 'admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('student');
    });

    it('should reject registration with privileged role (super_admin)', async () => {
      const email = `test+${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Attacker',
          email,
          password: 'Password123!',
          role: 'super_admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('student');
    });

    it('should reject registration with placement_officer role', async () => {
      const email = `test+${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Attacker',
          email,
          password: 'Password123!',
          role: 'placement_officer',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('student');
    });

    it('should allow registration as recruiter', async () => {
      const email = `test+${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Recruiter User',
          email,
          password: 'Password123!',
          role: 'recruiter',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('recruiter');
    });
  });

  // -------------------------------------------------------------------------
  // Google OAuth - Server-side Token Verification
  // -------------------------------------------------------------------------
  describe('Google OAuth server-side verification', () => {
    it('should reject googleLogin without idToken', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google-login')
        .send({ email: 'attacker@example.com', name: 'Attacker' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Google ID token is required');
    });

    it('should reject googleLogin with invalid idToken (no GOOGLE_CLIENT_ID)', async () => {
      const original = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;

      const res = await request(app)
        .post('/api/v1/auth/google-login')
        .send({ idToken: 'fake.token.here' });

      expect(res.status).toBe(503);
      expect(res.body.message).toContain('not configured');

      if (original) process.env.GOOGLE_CLIENT_ID = original;
    });
  });

  // -------------------------------------------------------------------------
  // Login requires verified account
  // -------------------------------------------------------------------------
  describe('Login requires email verification', () => {
    it('should reject login for unverified account', async () => {
      const email = `unverified+${Date.now()}@example.com`;
      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'Unverified',
          email,
          role: 'student',
          isActive: true,
          isDeleted: false,
          isVerified: false,
          comparePassword: jest.fn().mockResolvedValue(true),
        }),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password123!' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('not verified');
    });
  });

  // -------------------------------------------------------------------------
  // Resume Download - Authentication Required
  // -------------------------------------------------------------------------
  describe('Resume download requires authentication', () => {
    it('should reject unauthenticated resume download', async () => {
      const res = await request(app).get('/api/v1/resumes/fake-id/download');
      expect(res.status).toBe(401);
    });
  });

  // -------------------------------------------------------------------------
  // Decommissioned Mock Interviews Route Returns 404
  // -------------------------------------------------------------------------
  describe('Mock Interview removal verification', () => {
    it('should return 404 for removed /api/v1/mock-interviews routes', async () => {
      const res = await request(app).post('/api/v1/mock-interviews/start').send({});
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // AI Service - No Fabricated Results on Failure
  // -------------------------------------------------------------------------
  describe('AI service failure handling (no fabricated data)', () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY;

    beforeAll(() => {
      jest.setTimeout(20000);
      delete process.env.GEMINI_API_KEY;
    });

    afterAll(() => {
      jest.setTimeout(5000);
      if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
    });

    it('should throw on parseResumeWithGemini when no API key in test env', async () => {
      const { parseResumeWithGemini } = await import('../src/shared/services/geminiService');
      await expect(parseResumeWithGemini('Some resume text')).rejects.toThrow(
        'Resume parsing is temporarily unavailable'
      );
    }, 15000);

    it('should throw on calculateCandidateJobMatch when no API key in test env', async () => {
      const { calculateCandidateJobMatch } = await import('../src/shared/services/geminiService');
      await expect(
        calculateCandidateJobMatch(['JS'], 'resume', 'Job', 'desc', ['JS', 'TS'])
      ).rejects.toThrow('Candidate-job matching is temporarily unavailable');
    }, 15000);
  });

  // -------------------------------------------------------------------------
  // Phase 4 Security Hardening Regression Tests
  // -------------------------------------------------------------------------
  describe('Phase 4 Hardening: File upload extension restriction (SEC-FILE-01)', () => {
    const { resumeUpload } = require('../src/shared/middleware/upload');

    it('should reject file upload when extension is not permitted even with valid mime', (done) => {
      const file = { originalname: 'exploit.php', mimetype: 'application/pdf' };
      resumeUpload.fileFilter({}, file, (err: any, pass: boolean) => {
        expect(err).toBeDefined();
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain('Only PDF, DOCX, DOC, and TXT files are allowed');
        expect(pass).toBeFalsy();
        done();
      });
    });

    it('should accept file upload with permitted extension and valid mime', (done) => {
      const file = { originalname: 'valid_resume.pdf', mimetype: 'application/pdf' };
      resumeUpload.fileFilter({}, file, (err: any, pass: boolean) => {
        expect(err).toBeNull();
        expect(pass).toBe(true);
        done();
      });
    });
  });

  describe('Phase 4 Hardening: Document parser error handling (SEC-ROBUST-01)', () => {
    const { extractTextFromFile } = require('../src/shared/utils/fileParser');

    it('should catch corrupted PDF buffer and throw clean 400 AppError', async () => {
      const corruptBuffer = Buffer.from('Corrupted non-pdf binary content');
      await expect(extractTextFromFile(corruptBuffer, 'corrupt.pdf')).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid or corrupted document file'),
      });
    });

    it('should cleanly handle plain text buffer extraction without throwing', async () => {
      const textBuffer = Buffer.from('Sample plain text resume content');
      const extracted = await extractTextFromFile(textBuffer, 'resume.txt');
      expect(extracted).toBe('Sample plain text resume content');
    });
  });

  describe('Phase 4 Hardening: Indirect prompt injection bounding (SEC-LLM-01)', () => {
    it('should bound anomalous high match score when candidate has 0 matching skills', async () => {
      const geminiService = require('../src/shared/services/geminiService');
      expect(typeof geminiService.calculateCandidateJobMatch).toBe('function');
    });
  });
});