import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from '../features/auth/authRoutes';
import resumeRoutes from '../features/resumes/resumeRoutes';
import jobRoutes from '../features/jobs/jobRoutes';
import applicationRoutes from '../features/applications/applicationRoutes';
import interviewRoutes from '../features/interviews/interviewRoutes';
import adminRoutes from '../features/admin/adminRoutes';
import placementRoutes from '../features/placement/placementRoutes';
import notificationRoutes from '../features/notifications/notificationRoutes';
import aiRoutes from '../features/ai/aiRoutes';
import { getIsRedisConnected } from '../config/redis';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/placement', placementRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

// Liveness check endpoint (process responsiveness)
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'AI Campus Recruitment System API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Readiness check endpoint (database connectivity and ingress traffic readiness)
router.get('/ready', (_req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  const isRedisReady = getIsRedisConnected();
  const redisRequired = process.env.REDIS_REQUIRED === 'true';

  if (!isDbReady || (redisRequired && !isRedisReady)) {
    return res.status(503).json({
      status: 'unready',
      system: 'AI Campus Recruitment System API',
      database: isDbReady ? 'connected' : 'disconnected',
      redis: isRedisReady ? 'connected' : 'disconnected',
      cacheMode: isRedisReady ? 'distributed' : 'degraded_in_memory',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: 'ready',
    system: 'AI Campus Recruitment System API',
    database: 'connected',
    redis: isRedisReady ? 'connected' : 'disconnected',
    cacheMode: isRedisReady ? 'distributed' : 'degraded_in_memory',
    timestamp: new Date().toISOString(),
  });
});

export default router;
