import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/features/auth/userModel';
import Session from '../src/features/auth/sessionModel';
import { createSession } from '../src/features/auth/sessionService';
import { UserRole } from '../src/shared/constants/roles';
import { redactSensitiveData, getChildLogger } from '../src/shared/utils/logger';
import { aiService } from '../src/features/ai/services/aiService';
import { parseResumeHeuristic, matchCandidateHeuristic } from '../src/features/ai/providers/heuristicProvider';

describe('AI Architecture & Centralized Logging Suite', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  describe('1. Correlation Middleware & Request Tracing', () => {
    it('generates a valid UUIDv4 when X-Correlation-ID is not provided', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      const corrId = res.headers['x-correlation-id'];
      expect(corrId).toBeDefined();
      expect(typeof corrId).toBe('string');
      expect(corrId.length).toBeGreaterThanOrEqual(16);
    });

    it('preserves an existing valid X-Correlation-ID from the client', async () => {
      const customId = 'client-trace-abc-12345';
      const res = await request(app)
        .get('/api/v1/health')
        .set('X-Correlation-ID', customId);
      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(customId);
    });

    it('attaches correlationId to error responses', async () => {
      const customId = 'test-err-trace-999';
      const res = await request(app)
        .get('/api/v1/invalid-route-for-testing')
        .set('X-Correlation-ID', customId);
      expect(res.status).toBe(404);
      expect(res.headers['x-correlation-id']).toBe(customId);
      expect(res.body.correlationId).toBe(customId);
    });
  });

  describe('2. Centralized Logging & Sensitive Data Redaction', () => {
    it('redacts sensitive fields recursively', () => {
      const input = {
        name: 'John Doe',
        password: 'PlainTextPassword123',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        nested: {
          refreshToken: 'secret-refresh-token',
          apiKey: 'AIzaSy_PRIVATE_KEY',
          otpCode: '123456',
          safeField: 'active',
        },
        items: [
          { cookie: 'session=xyz', normal: 'val' },
        ],
      };

      const redacted = redactSensitiveData(input);
      expect(redacted.password).toBe('[REDACTED]');
      expect(redacted.token).toBe('[REDACTED]');
      expect(redacted.nested.refreshToken).toBe('[REDACTED]');
      expect(redacted.nested.apiKey).toBe('[REDACTED]');
      expect(redacted.nested.otpCode).toBe('[REDACTED]');
      expect(redacted.nested.safeField).toBe('active');
      expect(redacted.items[0].cookie).toBe('[REDACTED]');
      expect(redacted.items[0].normal).toBe('val');
      expect(redacted.name).toBe('John Doe');
    });

    it('safely handles circular references in logging metadata', () => {
      const circular: any = { name: 'circular-test' };
      circular.self = circular;

      expect(() => redactSensitiveData(circular)).not.toThrow();
      const res = redactSensitiveData(circular);
      expect(res.self).toBe('[CIRCULAR]');
    });

    it('creates child loggers bound with correlationId', () => {
      const child = getChildLogger('trace-12345');
      expect(child).toBeDefined();
      expect(typeof child.info).toBe('function');
    });
  });

  describe('3. AI Heuristic Provider & Orchestrator', () => {
    const sampleResume = `
      John Doe
      john.doe@university.edu
      +1 555-123-4567

      Education:
      B.Tech Computer Science, Stanford University (2025)

      Skills:
      TypeScript, React, Node.js, Express, Python, PostgreSQL, Docker, Git

      Experience:
      Software Engineering Intern at Tech Corp (Summer 2024)
      Developed scalable REST APIs using Express and TypeScript.

      Projects:
      AI Recruitment Portal: Engineered full-stack recruitment platform.
    `;

    it('extracts structured candidate information via heuristic provider', () => {
      const parsed = parseResumeHeuristic(sampleResume);
      expect(parsed.name).toBe('John Doe');
      expect(parsed.email).toBe('john.doe@university.edu');
      expect(parsed.phone).toBe('+1 555-123-4567');
      expect(parsed.skills).toContain('TypeScript');
      expect(parsed.skills).toContain('React');
      expect(parsed.skills).toContain('Node.js');
      expect(parsed.atsScore).toBeGreaterThanOrEqual(50);
      expect(parsed.evaluationMethod).toBe('heuristic_fallback');
      expect(parsed.isHeuristicFallback).toBe(true);
    });

    it('computes candidate-job match analysis accurately', () => {
      const match = matchCandidateHeuristic(
        ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        sampleResume,
        ['TypeScript', 'React', 'Docker', 'AWS']
      );

      expect(match.matchScore).toBeGreaterThan(0);
      expect(match.matchedSkills).toContain('TypeScript');
      expect(match.matchedSkills).toContain('React');
      expect(match.matchedSkills).toContain('Docker'); // detected in resume text
      expect(match.missingSkills).toContain('AWS');
      expect(match.candidateStrengths.length).toBeGreaterThan(0);
    });

    it('returns diagnostics from AI Service', async () => {
      const diagnostics = await aiService.getDiagnostics();
      expect(diagnostics).toHaveProperty('pythonEngine');
      expect(diagnostics).toHaveProperty('geminiProvider');
      expect(diagnostics).toHaveProperty('status');
    });
  });

  describe('4. Dedicated /api/v1/ai Protected Routes', () => {
    let studentToken: string;

    beforeEach(async () => {
      const user = await User.create({
        name: 'AI Test Student',
        email: 'ai.student@campus.edu',
        password: 'Password123!',
        role: UserRole.STUDENT,
        isVerified: true,
        isActive: true,
      });
      const session = await createSession(user._id.toString(), user.role, user.email);
      studentToken = session.accessToken;
    });

    it('rejects unauthenticated requests with HTTP 401', async () => {
      const res = await request(app).get('/api/v1/ai/status');
      expect(res.status).toBe(401);
    });

    it('allows authenticated users to query /api/v1/ai/status', async () => {
      const res = await request(app)
        .get('/api/v1/ai/status')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pythonEngine');
      expect(res.body.correlationId).toBeDefined();
    });

    it('validates request payload on /api/v1/ai/parse', async () => {
      const res = await request(app)
        .post('/api/v1/ai/parse')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ text: '' });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Resume text content is required');
    });

    it('returns HTTP 503 when AI service is unavailable in test environment without key', async () => {
      const savedKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/v1/ai/match')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          candidateSkills: ['React', 'Node.js'],
          resumeText: 'Experienced in React and Node.js microservices',
          jobTitle: 'Frontend Engineer',
          jobDescription: 'Looking for a React developer',
          requiredSkills: ['React', 'TypeScript'],
        });

      expect(res.status).toBe(503);
      expect(res.body.message).toContain('Candidate-job matching is temporarily unavailable');
      process.env.GEMINI_API_KEY = savedKey;
    });

    it('evaluates candidate matching on /api/v1/ai/match when provider is active or falls back', async () => {
      const savedKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'test-valid-mock-key-with-sufficient-length-2026';

      const res = await request(app)
        .post('/api/v1/ai/match')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          candidateSkills: ['React', 'Node.js'],
          resumeText: 'Experienced in React and Node.js microservices',
          jobTitle: 'Frontend Engineer',
          jobDescription: 'Looking for a React developer',
          requiredSkills: ['React', 'TypeScript'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('matchScore');
      expect(res.body.data).toHaveProperty('matchedSkills');
      expect(res.body.data.matchedSkills).toContain('React');

      process.env.GEMINI_API_KEY = savedKey;
    }, 15000);
  });
});
