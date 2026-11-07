import { Router } from 'express';
import {
  scheduleInterview,
  getApplicationInterviews,
  submitInterviewFeedback,
  cancelInterview,
  getMyInterviews,
} from './interviewController';
import { authenticateToken, requireRoles } from '../../shared/middleware/auth';
import { UserRole } from '../../shared/constants/roles';

const interviewRouter = Router();
interviewRouter.use(authenticateToken);
const recruiterOrAdmin = requireRoles(
  UserRole.RECRUITER,
  UserRole.PLACEMENT_OFFICER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN
);

interviewRouter.get('/my-interviews', getMyInterviews);
interviewRouter.post('/schedule', recruiterOrAdmin, scheduleInterview);
interviewRouter.get('/application/:applicationId', getApplicationInterviews);
interviewRouter.put('/:id/feedback', recruiterOrAdmin, submitInterviewFeedback);
interviewRouter.put('/:id/cancel', recruiterOrAdmin, cancelInterview);

export default interviewRouter;
