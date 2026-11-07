import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../src/features/auth/userModel';
import Session from '../src/features/auth/sessionModel';
import {
  createSession,
  rotateSession,
  recordSessionActivity,
  hashSecret,
} from '../src/features/auth/sessionService';

describe('Sub-Phase 3.2: Secure Session Engine and Refresh Rotation', () => {
  let mongoServer: MongoMemoryServer;
  let testUserId: string;

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

    const user = await User.create({
      name: 'Session Test User',
      email: 'session.test@campus.edu',
      password: 'StrongPassword123!',
      role: 'student',
      isVerified: true,
      isActive: true,
    });
    testUserId = user._id.toString();
  });

  describe('1. Session Creation & Opaque Token Structure', () => {
    it('should generate an opaque refresh token with sessionId.secret format and 256-bit entropy', async () => {
      const res = await createSession(testUserId, 'student', 'session.test@campus.edu');

      expect(res.rawRefreshToken).toContain('.');
      const [sessionId, secret] = res.rawRefreshToken.split('.');
      expect(sessionId).toBe(res.session.sessionId);
      expect(secret).toHaveLength(64); // 32 bytes in hex = 64 characters

      // Database stores only SHA-256 hash, never plaintext secret
      const dbSession = await Session.findOne({ sessionId });
      expect(dbSession).toBeDefined();
      expect(dbSession?.currentTokenHash).toBe(hashSecret(secret));
      expect(dbSession?.consumedTokenHashes).toHaveLength(0);
      expect(dbSession?.rotationCount).toBe(0);
      expect(dbSession?.status).toBe('ACTIVE');
    });
  });

  describe('2. Atomic Refresh Rotation', () => {
    it('should rotate to new secret R2, add R1 to consumed history, and increment rotationCount', async () => {
      const initial = await createSession(testUserId, 'student', 'session.test@campus.edu');
      const [, secret1] = initial.rawRefreshToken.split('.');

      // Fast-forward lastRotatedAt by 11 seconds to bypass 10-second anti-race cooldown
      await Session.updateOne(
        { sessionId: initial.session.sessionId },
        { $set: { lastRotatedAt: new Date(Date.now() - 11000) } }
      );

      const rotated = await rotateSession(initial.rawRefreshToken);
      expect(rotated.rawRefreshToken).not.toBe(initial.rawRefreshToken);

      const [sessionId2, secret2] = rotated.rawRefreshToken.split('.');
      expect(sessionId2).toBe(initial.session.sessionId);
      expect(secret2).not.toBe(secret1);

      const dbSession = await Session.findOne({ sessionId: sessionId2 });
      expect(dbSession?.currentTokenHash).toBe(hashSecret(secret2));
      expect(dbSession?.consumedTokenHashes).toContain(hashSecret(secret1));
      expect(dbSession?.rotationCount).toBe(1);
    });
  });

  describe('3. Tier 2 Replay Revocation Defense', () => {
    it('should immediately revoke the session family when a consumed secret is reused', async () => {
      const initial = await createSession(testUserId, 'student', 'session.test@campus.edu');

      // First rotation R1 -> R2
      await Session.updateOne(
        { sessionId: initial.session.sessionId },
        { $set: { lastRotatedAt: new Date(Date.now() - 11000) } }
      );
      const rotated = await rotateSession(initial.rawRefreshToken);

      // Adversary attempts to reuse consumed R1!
      await expect(rotateSession(initial.rawRefreshToken)).rejects.toThrow(
        /Token reuse detected/
      );

      // Verify session document is REVOKED
      const dbSession = await Session.findOne({ sessionId: initial.session.sessionId });
      expect(dbSession?.status).toBe('REVOKED');
      expect(dbSession?.revocationReason).toBe('TOKEN_REUSE_DETECTED');

      // Subsequent legitimate attempt with R2 must also fail closed
      await expect(rotateSession(rotated.rawRefreshToken)).rejects.toThrow(
        /Session has been revoked/
      );
    });
  });

  describe('4. Anti-Race 10-Second Cooldown on Valid Current Secret', () => {
    it('should return HTTP 429 when current secret is refreshed again within 10 seconds', async () => {
      const initial = await createSession(testUserId, 'student', 'session.test@campus.edu');

      // Attempt immediate rapid refresh within 10 seconds of creation
      try {
        await rotateSession(initial.rawRefreshToken);
        fail('Expected 429 cooldown error to be thrown');
      } catch (err: any) {
        expect(err.statusCode).toBe(429);
        expect(err.message).toContain('Refresh cooldown active');
        expect(err.retryAfter).toBeGreaterThan(0);
      }
    });
  });

  describe('5. Rotation Ceiling (1,000 Rotations)', () => {
    it('should revoke session when rotation count reaches 1,000', async () => {
      const initial = await createSession(testUserId, 'student', 'session.test@campus.edu');

      // Set rotationCount to 1,000
      await Session.updateOne(
        { sessionId: initial.session.sessionId },
        {
          $set: {
            rotationCount: 1000,
            lastRotatedAt: new Date(Date.now() - 11000),
          },
        }
      );

      await expect(rotateSession(initial.rawRefreshToken)).rejects.toThrow(
        /rotation ceiling reached/
      );

      const dbSession = await Session.findOne({ sessionId: initial.session.sessionId });
      expect(dbSession?.status).toBe('REVOKED');
      expect(dbSession?.revocationReason).toBe('ROTATION_CEILING_REACHED');
    });
  });

  describe('6. Activity Renewal Endpoint Contract', () => {
    it('should update lastActivityAt and idleExpiresAt without rotating currentTokenHash or rotationCount', async () => {
      const initial = await createSession(testUserId, 'student', 'session.test@campus.edu');
      const [, secret] = initial.rawRefreshToken.split('.');

      const originalHash = initial.session.currentTokenHash;
      const originalRotationCount = initial.session.rotationCount;

      const actRes = await recordSessionActivity(initial.rawRefreshToken);
      expect(actRes.cookieMaxAgeMs).toBeGreaterThan(0);

      const dbSession = await Session.findOne({ sessionId: initial.session.sessionId });
      expect(dbSession?.currentTokenHash).toBe(originalHash);
      expect(dbSession?.rotationCount).toBe(originalRotationCount);
      expect(dbSession?.consumedTokenHashes).toHaveLength(0);
    });
  });
});

