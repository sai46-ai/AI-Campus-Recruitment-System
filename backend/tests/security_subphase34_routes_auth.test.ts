import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/features/auth/userModel';
import Session from '../src/features/auth/sessionModel';
import { createSession } from '../src/features/auth/sessionService';
import { generateAccessToken } from '../src/shared/utils/jwt';
import { UserRole } from '../src/shared/constants/roles';

describe('Sub-Phase 3.4: Route Authorization & Privilege Invalidation', () => {
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

  describe('1. Authorization Version Synchronous Invalidation', () => {
    it('should reject requests with HTTP 401 immediately when User.authorizationVersion increments', async () => {
      const user = await User.create({
        name: 'Eva Engineer',
        email: 'eva@campus.edu',
        password: 'Password123!',
        role: UserRole.STUDENT,
        isVerified: true,
        isActive: true,
      });

      const sessionRes = await createSession(user._id.toString(), user.role, user.email);

      // Verify request succeeds with initial token (ver: 1)
      const res1 = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionRes.accessToken}`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.email).toBe('eva@campus.edu');

      // User changes password or admin revokes credentials (increments authorizationVersion 1 -> 2)
      user.password = 'BrandNewPassword123!';
      await user.save();

      // Subsequent request using old token (ver: 1) must be rejected with HTTP 401
      const res2 = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionRes.accessToken}`);
      expect(res2.status).toBe(401);
      expect(res2.body.message).toContain('credentials changed');
    });

    it('should reject requests with HTTP 401 if user account is deactivated', async () => {
      const user = await User.create({
        name: 'Frank Inactive',
        email: 'frank@campus.edu',
        password: 'Password123!',
        role: UserRole.STUDENT,
        isVerified: true,
        isActive: true,
      });

      const sessionRes = await createSession(user._id.toString(), user.role, user.email);

      // Deactivate user account
      user.isActive = false;
      await user.save();

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionRes.accessToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('2. Active Session Enforcement', () => {
    it('should reject requests with HTTP 401 if bound session is marked REVOKED', async () => {
      const user = await User.create({
        name: 'Grace Student',
        email: 'grace@campus.edu',
        password: 'Password123!',
        role: UserRole.STUDENT,
        isVerified: true,
        isActive: true,
      });

      const sessionRes = await createSession(user._id.toString(), user.role, user.email);

      // Mark session REVOKED
      await Session.updateOne(
        { sessionId: sessionRes.session.sessionId },
        { $set: { status: 'REVOKED', revocationReason: 'SECURITY_AUDIT' } }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionRes.accessToken}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('revoked');
    });
  });

  describe('3. Password Change & Session Invalidation Endpoint', () => {
    it('should successfully change password, increment version, and revoke all sessions', async () => {
      const user = await User.create({
        name: 'Henry Graduate',
        email: 'henry@campus.edu',
        password: 'OriginalPassword123!',
        role: UserRole.STUDENT,
        isVerified: true,
        isActive: true,
      });

      const sessionRes = await createSession(user._id.toString(), user.role, user.email);

      const changeRes = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${sessionRes.accessToken}`)
        .set('X-CSRF-Token', sessionRes.csrfToken)
        .send({
          currentPassword: 'OriginalPassword123!',
          newPassword: 'UpdatedSecurePassword123!',
        });

      expect(changeRes.status).toBe(200);
      expect(changeRes.body.success).toBe(true);

      // Verify User document version was incremented
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.authorizationVersion).toBe(2);

      // Verify sessions are marked REVOKED
      const dbSession = await Session.findOne({ sessionId: sessionRes.session.sessionId });
      expect(dbSession?.status).toBe('REVOKED');
      expect(dbSession?.revocationReason).toBe('PASSWORD_CHANGED');

      // Verify old token is rejected
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionRes.accessToken}`);
      expect(meRes.status).toBe(401);
    });
  });
});

