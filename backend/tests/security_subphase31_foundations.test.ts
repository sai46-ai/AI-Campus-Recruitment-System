import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../src/features/auth/userModel';
import Session from '../src/features/auth/sessionModel';
import app from '../src/app';
import { runBackfillAuthorizationVersion } from '../src/migrations/001_backfill_authorization_version';

describe('Sub-Phase 3.1: Foundational Security Hardening', () => {
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

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  describe('1. Express Reverse-Proxy Trust Configuration', () => {
    it('should have trust proxy set to 1 for 1-hop Nginx container topology', () => {
      expect(app.get('trust proxy')).toBe(1);
    });
  });

  describe('2. User authorizationVersion Invariants', () => {
    it('should default authorizationVersion to 1 for new user', async () => {
      const user = await User.create({
        name: 'Alice Student',
        email: 'alice@campus.edu',
        password: 'Password123!',
      });
      expect(user.authorizationVersion).toBe(1);
    });

    it('should reject non-safe integer or non-numeric authorizationVersion', async () => {
      const user = new User({
        name: 'Bob Hacker',
        email: 'bob@campus.edu',
        password: 'Password123!',
        authorizationVersion: 1.5, // fractional
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should automatically increment authorizationVersion when password is modified', async () => {
      const user = await User.create({
        name: 'Charlie Dev',
        email: 'charlie@campus.edu',
        password: 'InitialPassword123!',
      });
      expect(user.authorizationVersion).toBe(1);

      user.password = 'NewPassword456!';
      await user.save();

      const reloaded = await User.findById(user._id);
      expect(reloaded?.authorizationVersion).toBe(2);
    });

    it('should automatically increment authorizationVersion when user role is modified', async () => {
      const user = await User.create({
        name: 'David Candidate',
        email: 'david@campus.edu',
        password: 'Password123!',
      });
      expect(user.authorizationVersion).toBe(1);

      user.role = 'admin' as any;
      await user.save();

      const reloaded = await User.findById(user._id);
      expect(reloaded?.authorizationVersion).toBe(2);
    });
  });

  describe('3. Idempotent Migration for authorizationVersion', () => {
    it('should dry-run migration without modifying database documents', async () => {
      // Create users with missing version using native collection insert
      await mongoose.connection.collection('users').insertOne({
        name: 'Legacy User 1',
        email: 'legacy1@campus.edu',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const dryRunResult = await runBackfillAuthorizationVersion({ dryRun: true });
      expect(dryRunResult.dryRun).toBe(true);
      expect(dryRunResult.matchedMissingOrInvalid).toBe(1);
      expect(dryRunResult.updatedCount).toBe(0);

      // Verify user document in DB still lacks version
      const rawUser = await mongoose.connection.collection('users').findOne({ email: 'legacy1@campus.edu' });
      expect(rawUser?.authorizationVersion).toBeUndefined();
    });

    it('should successfully execute idempotent backfill and set authorizationVersion to 1', async () => {
      await mongoose.connection.collection('users').insertOne({
        name: 'Legacy User 2',
        email: 'legacy2@campus.edu',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const execResult = await runBackfillAuthorizationVersion({ dryRun: false });
      expect(execResult.dryRun).toBe(false);
      expect(execResult.updatedCount).toBeGreaterThanOrEqual(1);

      const updatedUser = await mongoose.connection.collection('users').findOne({ email: 'legacy2@campus.edu' });
      expect(updatedUser?.authorizationVersion).toBe(1);

      // Subsequent run should be idempotent with 0 matches
      const reRunResult = await runBackfillAuthorizationVersion({ dryRun: false });
      expect(reRunResult.matchedMissingOrInvalid).toBe(0);
      expect(reRunResult.updatedCount).toBe(0);
    });
  });
});

