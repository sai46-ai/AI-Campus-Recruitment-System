import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/shared/utils/jwt';
import { UserRole, JobStatus } from '../src/shared/constants/roles';
import User from '../src/features/auth/userModel';
import Job from '../src/features/jobs/jobModel';

/**
 * Phase 06B — Wave 2 Recruiter Verification & Job Authorization Test Suite
 *
 * Covers:
 * 1. SEC-03: Recruiter Verification Enforcement on Job Posting
 *    - Verified recruiter can post jobs (201)
 *    - Unverified recruiter receives 403
 *    - Client payload tampering (isRecruiterVerified / isApproved in body) is ignored
 *    - Missing or deleted recruiter record receives 403
 *    - Student role receives 403
 *    - Privileged administrative roles bypass recruiter verification
 * 2. SEC-04: Placement Approval Queue Boundary & IDOR Validation
 *    - Placement Officer can access unapproved jobs and approve
 *    - Recruiter is forbidden from placement queue (403)
 *    - Student is forbidden from approving jobs (403)
 *    - Preserved getJobById IDOR protection (unapproved job hidden from student/public)
 */

describe('Phase 06B — Wave 2 Recruiter Verification & Job Authorization', () => {
  const verifiedRecruiterId = '507f1f77bcf86cd799439001';
  const unverifiedRecruiterId = '507f1f77bcf86cd799439002';
  const otherRecruiterId = '507f1f77bcf86cd799439003';
  const studentId = '507f1f77bcf86cd799439004';
  const placementOfficerId = '507f1f77bcf86cd799439005';
  const adminId = '507f1f77bcf86cd799439006';
  const unapprovedJobId = '507f1f77bcf86cd799439099';

  const verifiedRecruiterToken = generateAccessToken({
    userId: verifiedRecruiterId,
    role: UserRole.RECRUITER,
    email: 'verified@techfirm.com',
  });

  const unverifiedRecruiterToken = generateAccessToken({
    userId: unverifiedRecruiterId,
    role: UserRole.RECRUITER,
    email: 'unverified@newstartup.io',
  });

  const otherRecruiterToken = generateAccessToken({
    userId: otherRecruiterId,
    role: UserRole.RECRUITER,
    email: 'other@competitor.com',
  });

  const studentToken = generateAccessToken({
    userId: studentId,
    role: UserRole.STUDENT,
    email: 'candidate@university.edu',
  });

  const poToken = generateAccessToken({
    userId: placementOfficerId,
    role: UserRole.PLACEMENT_OFFICER,
    email: 'placement@university.edu',
  });

  const adminToken = generateAccessToken({
    userId: adminId,
    role: UserRole.ADMIN,
    email: 'admin@university.edu',
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('SEC-03: Recruiter Verification Enforcement (POST /api/v1/jobs)', () => {
    const validJobPayload = {
      title: 'Senior Systems Architect',
      company: 'TechFirm Inc.',
      description: 'Architecting enterprise cloud systems.',
      requiredSkills: ['Node.js', 'TypeScript', 'Docker'],
      niceToHaveSkills: ['Kubernetes'],
      location: 'Bangalore, India',
      salary: '25-35 LPA',
      jobType: 'Full-time',
      experienceLevel: 'Senior',
      department: 'Engineering',
      minCgpa: 7.0,
      allowedBranches: ['CSE', 'ECE'],
      maxBacklogs: 0,
    };

    it('should allow a verified recruiter (isRecruiterVerified: true) to post a job opening', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: verifiedRecruiterId,
          role: UserRole.RECRUITER,
          isRecruiterVerified: true,
          isActive: true,
          isDeleted: false,
        }),
      } as any);

      jest.spyOn(Job, 'create').mockImplementation((data: any) =>
        Promise.resolve({
          _id: unapprovedJobId,
          ...data,
          postedBy: verifiedRecruiterId,
          status: JobStatus.OPEN,
          isApproved: false, // Recruiter-posted jobs require placement officer approval
        })
      );

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${verifiedRecruiterToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isApproved).toBe(false);
      expect(res.body.data.title).toBe(validJobPayload.title);
    });

    it('should reject unverified recruiter with HTTP 403 when isRecruiterVerified is false', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: unverifiedRecruiterId,
          role: UserRole.RECRUITER,
          isRecruiterVerified: false,
          isActive: true,
          isDeleted: false,
        }),
      } as any);

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${unverifiedRecruiterToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Recruiter account is pending corporate verification');
    });

    it('should reject client body tampering attempting to set isRecruiterVerified: true or isApproved: true', async () => {
      // Mock DB user as unverified
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: unverifiedRecruiterId,
          role: UserRole.RECRUITER,
          isRecruiterVerified: false,
          isActive: true,
          isDeleted: false,
        }),
      } as any);

      const tamperedPayload = {
        ...validJobPayload,
        isRecruiterVerified: true, // Attempted client-side privilege override
        isApproved: true, // Attempted auto-approval bypass
      };

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${unverifiedRecruiterToken}`)
        .send(tamperedPayload);

      // Must be rejected with 403 because DB state governs
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Recruiter account is pending corporate verification');
    });

    it('should reject job posting with HTTP 403 if recruiter account is deleted or inactive', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: verifiedRecruiterId,
          role: UserRole.RECRUITER,
          isRecruiterVerified: true,
          isActive: false, // Inactive
          isDeleted: true, // Soft-deleted
        }),
      } as any);

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${verifiedRecruiterToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Recruiter account not found or deactivated');
    });

    it('should reject job posting with HTTP 403 if recruiter user is not found in database', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${verifiedRecruiterToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Recruiter account not found or deactivated');
    });

    it('should reject student attempting to post a job with HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should allow Placement Officer to post an approved job bypassing recruiter verification', async () => {
      jest.spyOn(Job, 'create').mockImplementation((data: any) =>
        Promise.resolve({
          _id: unapprovedJobId,
          ...data,
          postedBy: placementOfficerId,
          status: JobStatus.OPEN,
          isApproved: true, // Placement officer postings are pre-approved
        })
      );

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${poToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isApproved).toBe(true);
    });

    it('should allow Admin to post an approved job bypassing recruiter verification', async () => {
      jest.spyOn(Job, 'create').mockImplementation((data: any) =>
        Promise.resolve({
          _id: unapprovedJobId,
          ...data,
          postedBy: adminId,
          status: JobStatus.OPEN,
          isApproved: true,
        })
      );

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validJobPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isApproved).toBe(true);
    });
  });

  describe('SEC-04: Placement Approval Queue Boundary & IDOR Validation', () => {
    it('should reject recruiter attempting to access placement approval queue with HTTP 403', async () => {
      const res = await request(app)
        .get('/api/v1/placement/jobs-approval')
        .set('Authorization', `Bearer ${verifiedRecruiterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject student attempting to approve a job posting with HTTP 403', async () => {
      const res = await request(app)
        .put(`/api/v1/placement/jobs/${unapprovedJobId}/approve`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Placement Officer to fetch unapproved jobs from approval queue', async () => {
      jest.spyOn(Job, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([
            {
              _id: unapprovedJobId,
              title: 'Pending Job',
              isApproved: false,
              postedBy: { _id: verifiedRecruiterId, name: 'Verified Recruiter', company: 'TechFirm' },
            },
          ]),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/jobs-approval')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]._id).toBe(unapprovedJobId);
    });

    it('should allow Placement Officer to approve a pending job posting', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockResolvedValue({
        _id: unapprovedJobId,
        title: 'Pending Job',
        isApproved: true,
        approvedBy: placementOfficerId,
        postedBy: verifiedRecruiterId,
      } as any);

      const res = await request(app)
        .put(`/api/v1/placement/jobs/${unapprovedJobId}/approve`)
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Job opening approved');
    });

    describe('Preserved Phase 05 IDOR Protection (GET /api/v1/jobs/:id)', () => {
      const mockUnapprovedJob = {
        _id: unapprovedJobId,
        title: 'Unapproved Internal Listing',
        status: JobStatus.OPEN,
        isApproved: false,
        postedBy: { _id: verifiedRecruiterId, name: 'Verified Recruiter', company: 'TechFirm' },
      };

      it('should hide unapproved job from unauthenticated/anonymous users with HTTP 404', async () => {
        jest.spyOn(Job, 'findById').mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUnapprovedJob),
        } as any);

        const res = await request(app).get(`/api/v1/jobs/${unapprovedJobId}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Job opening not found');
      });

      it('should hide unapproved job from student with HTTP 404', async () => {
        jest.spyOn(Job, 'findById').mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUnapprovedJob),
        } as any);

        const res = await request(app)
          .get(`/api/v1/jobs/${unapprovedJobId}`)
          .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Job opening not found');
      });

      it('should hide unapproved job from non-owning recruiter with HTTP 404', async () => {
        jest.spyOn(Job, 'findById').mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUnapprovedJob),
        } as any);

        const res = await request(app)
          .get(`/api/v1/jobs/${unapprovedJobId}`)
          .set('Authorization', `Bearer ${otherRecruiterToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Job opening not found');
      });

      it('should allow owning recruiter to view their own unapproved job (HTTP 200)', async () => {
        jest.spyOn(Job, 'findById').mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUnapprovedJob),
        } as any);

        const res = await request(app)
          .get(`/api/v1/jobs/${unapprovedJobId}`)
          .set('Authorization', `Bearer ${verifiedRecruiterToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(unapprovedJobId);
      });

      it('should allow Placement Officer to view unapproved job (HTTP 200)', async () => {
        jest.spyOn(Job, 'findById').mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUnapprovedJob),
        } as any);

        const res = await request(app)
          .get(`/api/v1/jobs/${unapprovedJobId}`)
          .set('Authorization', `Bearer ${poToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(unapprovedJobId);
      });

      it('should allow Admin to view unapproved job (HTTP 200)', async () => {
        jest.spyOn(Job, 'findById').mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUnapprovedJob),
        } as any);

        const res = await request(app)
          .get(`/api/v1/jobs/${unapprovedJobId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(unapprovedJobId);
      });
    });
  });
});

