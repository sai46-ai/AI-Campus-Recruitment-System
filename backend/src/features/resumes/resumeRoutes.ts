import { Router } from 'express';
import {
  uploadResume,
  getMyResume,
  deleteResume,
  downloadResume,
  analyzeResume,
  updateResume,
} from './resumeController';
import { authenticateToken, requireRoles } from '../../shared/middleware/auth';
import { resumeUpload } from '../../shared/middleware/upload';
import { UserRole } from '../../shared/constants/roles';

const router = Router();

router.use(authenticateToken);

router.post(
  '/upload',
  requireRoles(UserRole.STUDENT),
  resumeUpload.single('resume'),
  uploadResume
);
router.get('/my-resume', requireRoles(UserRole.STUDENT), getMyResume);
router.get('/me', requireRoles(UserRole.STUDENT), getMyResume);

// AI Resume Re-analysis
router.post('/:id/analyze', requireRoles(UserRole.STUDENT), analyzeResume);
router.post('/analyze', requireRoles(UserRole.STUDENT), analyzeResume);

// Resume creation / update (sections / parsedData)
router.post('/save', requireRoles(UserRole.STUDENT), updateResume);
router.patch('/my-resume', requireRoles(UserRole.STUDENT), updateResume);
router.put('/my-resume', requireRoles(UserRole.STUDENT), updateResume);
router.patch('/:id', requireRoles(UserRole.STUDENT), updateResume);
router.put('/:id', requireRoles(UserRole.STUDENT), updateResume);

// Recruiters may download a resume only when its owner applied to a job they posted.
router.get(
  '/:id/download',
  requireRoles(
    UserRole.STUDENT,
    UserRole.RECRUITER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PLACEMENT_OFFICER
  ),
  downloadResume
);

// Delete resume (supports both DELETE / and DELETE /:id)
router.delete('/:id', requireRoles(UserRole.STUDENT), deleteResume);
router.delete('/', requireRoles(UserRole.STUDENT), deleteResume);

export default router;