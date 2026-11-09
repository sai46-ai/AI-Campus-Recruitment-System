import { Router } from 'express';
import { authenticateToken } from '../../shared/middleware/auth';
import {
  parseResumeHandler,
  matchCandidateHandler,
  getAiStatusHandler,
} from './aiController';

const router = Router();

// All AI routes require authenticated session
router.use(authenticateToken);

router.post('/parse', parseResumeHandler);
router.post('/match', matchCandidateHandler);
router.get('/status', getAiStatusHandler);

export default router;

