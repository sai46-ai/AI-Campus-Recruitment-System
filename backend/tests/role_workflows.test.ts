import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/shared/utils/jwt';
import { UserRole, ApplicationStatus, JobStatus } from '../src/shared/constants/roles';
import User from '../src/features/auth/userModel';
import Job from '../src/features/jobs/jobModel';
import Application from '../src/features/applications/applicationModel';
import Resume from '../src/features/resumes/resumeModel';
import Interview from '../src/features/interviews/interviewModel';
import PlacementStats from '../src/features/admin/placementStatsModel';

/**
 * Role Workflows & End-to-End API Integration Test Suite
 *
 * Covers:
 * 1. Student Workflows
 * 2. Recruiter Workflows
 * 3. Placement Officer Workflows
 * 4. System Administrator Workflows
 * 5. Super Administrator Workflows
 * 6. RBAC Role Isolation & Permission Boundary Enforcement
 */

describe('Phase 5 Role Workflows & RBAC Integration Tests', () => {
  // Valid 24-character hexadecimal MongoDB ObjectIds
  const studentId = '507f1f77bcf86cd799439011';
  const recruiterId = '507f1f77bcf86cd799439022';
  const poId = '507f1f77bcf86cd799439033';
  const adminId = '507f1f77bcf86cd799439044';
  const superAdminId = '507f1f77bcf86cd799439055';
  const testJobId = '507f1f77bcf86cd799439066';
  const testAppId = '507f1f77bcf86cd799439077';

  // Test Auth Tokens for each role
  const studentToken = generateAccessToken({ userId: studentId, role: UserRole.STUDENT, email: 'student1@university.edu' });
  const recruiterToken = generateAccessToken({ userId: recruiterId, role: UserRole.RECRUITER, email: 'hiring@techcorp.com' });
  const placementOfficerToken = generateAccessToken({ userId: poId, role: UserRole.PLACEMENT_OFFICER, email: 'placement@university.edu' });
  const adminToken = generateAccessToken({ userId: adminId, role: UserRole.ADMIN, email: 'admin@university.edu' });
  const superAdminToken = generateAccessToken({ userId: superAdminId, role: UserRole.SUPER_ADMIN, email: 'superadmin@system.internal' });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // 1. STUDENT WORKFLOWS
  // =========================================================================
  describe('Student Workflows', () => {
    it('GET /api/v1/jobs/recommendations - should succeed for authenticated student', async () => {
      jest.spyOn(Resume, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'findById').mockResolvedValue(null as any);
      jest.spyOn(Job, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          { _id: testJobId, title: 'Frontend Developer', company: 'TechCorp', status: JobStatus.OPEN, requiredSkills: ['React', 'TypeScript'] },
        ]),
      } as any);

      const res = await request(app)
        .get('/api/v1/jobs/recommendations')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/applications/my-applications - should fetch student applications', async () => {
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([
              { _id: testAppId, student: studentId, status: ApplicationStatus.APPLIED },
            ]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/applications/my-applications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/applications/:id - should softly mark application as Withdrawn', async () => {
      const mockAppDoc: any = {
        _id: testAppId,
        student: studentId,
        status: ApplicationStatus.APPLIED,
        timeline: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Application, 'findOne').mockResolvedValue(mockAppDoc);

      const res = await request(app)
        .delete(`/api/v1/applications/${testAppId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockAppDoc.status).toBe(ApplicationStatus.WITHDRAWN);
      expect(mockAppDoc.save).toHaveBeenCalled();
    });

    it('GET /api/v1/interviews/my-interviews - should return student interviews', async () => {
      jest.spyOn(Interview, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue([
                { _id: 'int_1', student: studentId, status: 'SCHEDULED' },
              ]),
            }),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/interviews/my-interviews')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =========================================================================
  // 2. RECRUITER WORKFLOWS
  // =========================================================================
  describe('Recruiter Workflows', () => {
    it('POST /api/v1/jobs - should create a job with validation', async () => {
      const jobData = {
        title: 'Full Stack Engineer',
        company: 'TechCorp',
        description: 'Building modern web applications with Node and React.',
        requiredSkills: ['Node.js', 'React', 'MongoDB'],
        location: 'Remote',
        jobType: 'Full-time',
        salary: '$80,000 - $110,000',
        minCgpa: 7.5,
      };

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: recruiterId,
          role: UserRole.RECRUITER,
          isRecruiterVerified: true,
          isActive: true,
          isDeleted: false,
        }),
      } as any);

      jest.spyOn(Job, 'create').mockResolvedValue({
        _id: testJobId,
        ...jobData,
        postedBy: recruiterId,
        status: JobStatus.OPEN,
      } as any);

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(jobData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/jobs/recruiter/my-jobs - should list jobs posted by recruiter', async () => {
      jest.spyOn(Job, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: testJobId, title: 'Full Stack Engineer', postedBy: recruiterId },
        ]),
      } as any);

      const res = await request(app)
        .get('/api/v1/jobs/recruiter/my-jobs')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('PUT /api/v1/applications/:id/status - should update candidate status', async () => {
      const mockAppDoc: any = {
        _id: testAppId,
        job: testJobId,
        student: studentId,
        status: ApplicationStatus.APPLIED,
        timeline: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Application, 'findById').mockResolvedValue(mockAppDoc);
      jest.spyOn(Job, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: testJobId }),
      } as any);

      const res = await request(app)
        .put(`/api/v1/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: ApplicationStatus.SHORTLISTED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockAppDoc.status).toBe(ApplicationStatus.SHORTLISTED);
    });
  });

  // =========================================================================
  // 3. PLACEMENT OFFICER WORKFLOWS
  // =========================================================================
  describe('Placement Officer Workflows', () => {
    it('GET /api/v1/placement/stats - should allow placement officer to view college placement analytics', async () => {
      jest.spyOn(User, 'countDocuments').mockResolvedValue(120);
      jest.spyOn(Job, 'countDocuments').mockResolvedValue(15);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(45);
      jest.spyOn(Application, 'distinct').mockResolvedValue([]);
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      jest.spyOn(User, 'aggregate').mockResolvedValue([]);
      jest.spyOn(PlacementStats, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/placement/stats')
        .set('Authorization', `Bearer ${placementOfficerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/placement/jobs-approval - should list pending job drives for verification', async () => {
      jest.spyOn(Job, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([
            { _id: testJobId, title: 'Data Scientist', isApproved: false },
          ]),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/jobs-approval')
        .set('Authorization', `Bearer ${placementOfficerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =========================================================================
  // 4. ADMIN & SUPER ADMIN WORKFLOWS
  // =========================================================================
  describe('Admin and Super Admin Workflows', () => {
    it('GET /api/v1/admin/users - should return user directory for system admin', async () => {
      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { _id: 'u1', name: 'Alice Student', role: 'student' },
                { _id: 'u2', name: 'Bob Recruiter', role: 'recruiter' },
              ]),
            }),
          }),
        }),
      } as any);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/admin/stats - should return system-wide operational metrics', async () => {
      jest.spyOn(User, 'countDocuments').mockResolvedValue(250);
      jest.spyOn(Job, 'countDocuments').mockResolvedValue(45);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(310);
      jest.spyOn(Application, 'distinct').mockResolvedValue([]);
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      jest.spyOn(User, 'aggregate').mockResolvedValue([]);
      jest.spyOn(PlacementStats, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =========================================================================
  // 5. RBAC ISOLATION & PERMISSION BOUNDARIES
  // =========================================================================
  describe('RBAC Isolation & Permission Boundaries', () => {
    it('should reject unauthenticated request to protected student route (401)', async () => {
      const res = await request(app).get('/api/v1/applications/my-applications');
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should reject student attempting to access admin users directory (403)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should reject recruiter attempting to access placement officer dashboard (403)', async () => {
      const res = await request(app)
        .get('/api/v1/placement/stats')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should reject student attempting to post a job vacancy (403)', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Unauthorized Job' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should reject recruiter attempting to modify admin user role (403)', async () => {
      const res = await request(app)
        .put('/api/v1/admin/users/target_user/role')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });
  });
});
