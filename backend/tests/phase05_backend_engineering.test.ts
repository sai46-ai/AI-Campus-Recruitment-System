import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/shared/utils/jwt';
import { UserRole, ApplicationStatus, JobStatus, JobType } from '../src/shared/constants/roles';
import User from '../src/features/auth/userModel';
import Job from '../src/features/jobs/jobModel';
import Application from '../src/features/applications/applicationModel';
import PlacementStats from '../src/features/admin/placementStatsModel';
import {
  getCurrentAcademicYear,
  isValidAcademicYear,
  formatApplicationToCsvRow,
} from '../src/features/placement/placementService';

/**
 * Phase 05 Backend & Database Engineering Test Suite
 * Validates:
 * 1. Placement module extraction and route stability
 * 2. Mongoose cursor streaming for placement CSV export
 * 3. Applicant bounded pagination and metadata
 * 4. Academic year query parameterization and dynamic fallback
 */
describe('Phase 05: Backend & Database Engineering', () => {
  const studentId = '507f1f77bcf86cd799439011';
  const recruiterId = '507f1f77bcf86cd799439022';
  const poId = '507f1f77bcf86cd799439033';
  const adminId = '507f1f77bcf86cd799439044';
  const testJobId = '507f1f77bcf86cd799439066';
  const testAppId = '507f1f77bcf86cd799439077';

  const poToken = generateAccessToken({ userId: poId, role: UserRole.PLACEMENT_OFFICER, email: 'placement@univ.edu' });
  const adminToken = generateAccessToken({ userId: adminId, role: UserRole.ADMIN, email: 'admin@univ.edu' });
  const studentToken = generateAccessToken({ userId: studentId, role: UserRole.STUDENT, email: 'student@univ.edu' });
  const recruiterToken = generateAccessToken({ userId: recruiterId, role: UserRole.RECRUITER, email: 'recruiter@tech.com' });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // WORKSTREAM 05A: PLACEMENT MODULE EXTRACTION & ROUTING
  // =========================================================================
  describe('Workstream 05A: Placement Module Routing & RBAC', () => {
    it('GET /api/v1/placement/stats - should be accessible by Placement Officer', async () => {
      jest.spyOn(User, 'countDocuments').mockResolvedValue(50);
      jest.spyOn(Application, 'distinct').mockResolvedValue([]);
      jest.spyOn(Job, 'countDocuments').mockResolvedValue(10);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(25);
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      jest.spyOn(User, 'aggregate').mockResolvedValue([]);
      jest.spyOn(PlacementStats, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/placement/stats')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('academicYear');
      expect(res.body.data.totalStudents).toBe(50);
    });

    it('GET /api/v1/placement/jobs-approval - should list unapproved jobs for Placement Officer', async () => {
      jest.spyOn(Job, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([
            { _id: testJobId, title: 'Systems Architect', isApproved: false, company: 'Orbit Tech' },
          ]),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/jobs-approval')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Systems Architect');
    });

    it('PUT /api/v1/placement/jobs/:id/approve - should approve unapproved job posting', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockResolvedValue({
        _id: testJobId,
        title: 'Backend Engineer',
        isApproved: true,
        postedBy: recruiterId,
      } as any);

      const res = await request(app)
        .put(`/api/v1/placement/jobs/${testJobId}/approve`)
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('approved for campus placement drive');
      expect(res.body.data.isApproved).toBe(true);
    });

    it('PUT /api/v1/placement/jobs/:id/approve - should return 404 if job already approved or not found', async () => {
      jest.spyOn(Job, 'findOneAndUpdate').mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/placement/jobs/${testJobId}/approve`)
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Unapproved job opening not found');
    });

    it('should reject unauthenticated request to /placement/stats with 401', async () => {
      const res = await request(app).get('/api/v1/placement/stats');
      expect(res.status).toBe(401);
    });

    it('should reject student access to /placement/stats with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/placement/stats')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // WORKSTREAM 05B PART A: CSV STREAMING WITH CURSOR
  // =========================================================================
  describe('Workstream 05B: CSV Cursor Streaming & Formatting', () => {
    it('formatApplicationToCsvRow - formats row safely with formula sanitization', () => {
      const sampleApp = {
        student: { name: '=SUM(A1:A5)', email: 'student@univ.edu', department: 'CS', graduationYear: 2026, cgpa: 9.25 },
        job: { company: '+TechCorp', title: 'Developer', jobType: 'Full-time' },
        status: ApplicationStatus.SELECTED,
        matchScore: 95,
        aiScore: 90,
        appliedAt: new Date('2026-04-01T00:00:00Z'),
      };

      const row = formatApplicationToCsvRow(sampleApp);
      // = neutralized to '=
      expect(row).toContain("'=SUM(A1:A5)");
      // + neutralized to '+
      expect(row).toContain("'+TechCorp");
      expect(row).toContain('9.25');
      expect(row).toContain('Selected');
    });

    it('GET /api/v1/placement/export-csv - streams through Mongoose cursor when cursor() is present', async () => {
      async function* mockCursorGenerator() {
        yield {
          student: { name: 'Priya Sharma', email: 'priya@univ.edu', department: 'ECE', graduationYear: 2026, cgpa: 9.1 },
          job: { title: 'Embedded Eng', company: 'Qualcomm', jobType: JobType.FULL_TIME },
          status: ApplicationStatus.SELECTED,
          matchScore: 94,
          aiScore: 91,
          appliedAt: new Date('2026-03-15T00:00:00Z'),
        };
        yield {
          student: { name: 'Rohan Verma', email: 'rohan@univ.edu', department: 'CSE', graduationYear: 2026, cgpa: 8.4 },
          job: { title: 'Backend Dev', company: 'Amazon', jobType: JobType.FULL_TIME },
          status: ApplicationStatus.HIRED,
          matchScore: 89,
          aiScore: 85,
          appliedAt: new Date('2026-03-16T00:00:00Z'),
        };
      }

      const mockCursor = {
        [Symbol.asyncIterator]: mockCursorGenerator,
        close: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(Application, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              cursor: jest.fn().mockReturnValue(mockCursor),
            }),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('campus-placement-report-');
      expect(res.text.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
      expect(res.text).toContain('Priya Sharma');
      expect(res.text).toContain('Qualcomm');
      expect(res.text).toContain('Rohan Verma');
      expect(res.text).toContain('Amazon');
      expect(mockCursor.close).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // WORKSTREAM 05B PART B: APPLICANT BOUNDED PAGINATION
  // =========================================================================
  describe('Workstream 05B: Applicant Bounded Pagination', () => {
    it('GET /api/v1/applications/job/:jobId - returns pagination metadata with default page=1 and limit=50', async () => {
      jest.spyOn(Job, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: testJobId, postedBy: recruiterId }),
      } as any);

      const mockApplicants = [
        { _id: testAppId, job: testJobId, student: { name: 'Student 1' }, matchScore: 90 },
        { _id: '507f1f77bcf86cd799439099', job: testJobId, student: { name: 'Student 2' }, matchScore: 85 },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockApplicants),
      };

      jest.spyOn(Application, 'find').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(2);

      const res = await request(app)
        .get(`/api/v1/applications/job/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(50);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.totalPages).toBe(1);
      expect(res.body.pagination.hasMore).toBe(false);
    });

    it('GET /api/v1/applications/job/:jobId - respects custom page and limit query params', async () => {
      jest.spyOn(Job, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: testJobId, postedBy: recruiterId }),
      } as any);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(Application, 'find').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(45);

      const res = await request(app)
        .get(`/api/v1/applications/job/${testJobId}?page=3&limit=15`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(3);
      expect(res.body.pagination.limit).toBe(15);
      expect(res.body.pagination.total).toBe(45);
      expect(res.body.pagination.totalPages).toBe(3);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(30); // (3 - 1) * 15
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(15);
    });

    it('GET /api/v1/applications/job/:jobId - caps limit at maximum 100 to prevent DOS', async () => {
      jest.spyOn(Job, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: testJobId, postedBy: recruiterId }),
      } as any);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(Application, 'find').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(10);

      const res = await request(app)
        .get(`/api/v1/applications/job/${testJobId}?limit=9999`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(100);
    });
  });

  // =========================================================================
  // WORKSTREAM 05D: ACADEMIC YEAR PARAMETERIZATION & DYNAMIC FALLBACK
  // =========================================================================
  describe('Workstream 05D: Academic Year Parameterization & Dynamic Fallback', () => {
    it('getCurrentAcademicYear helper derives correct year cycle', () => {
      // In June or later (e.g. October 2026) -> 2026-2027
      const octDate = new Date(2026, 9, 15); // Month 9 is October
      expect(getCurrentAcademicYear(octDate)).toBe('2026-2027');

      // Before June (e.g. March 2027) -> 2026-2027
      const marDate = new Date(2027, 2, 10); // Month 2 is March
      expect(getCurrentAcademicYear(marDate)).toBe('2026-2027');

      // June 2027 -> 2027-2028
      const junDate = new Date(2027, 5, 1); // Month 5 is June
      expect(getCurrentAcademicYear(junDate)).toBe('2027-2028');
    });

    it('isValidAcademicYear helper validates YYYY-YYYY format where end = start + 1', () => {
      expect(isValidAcademicYear('2026-2027')).toBe(true);
      expect(isValidAcademicYear('2025-2026')).toBe(true);
      expect(isValidAcademicYear('2024-2025')).toBe(true);
      expect(isValidAcademicYear('2026-2028')).toBe(false); // Not consecutive
      expect(isValidAcademicYear('2026')).toBe(false);
      expect(isValidAcademicYear('invalid-year')).toBe(false);
    });

    it('GET /api/v1/placement/stats - accepts valid academicYear query param', async () => {
      jest.spyOn(User, 'countDocuments').mockResolvedValue(120);
      jest.spyOn(Application, 'distinct').mockResolvedValue([]);
      jest.spyOn(Job, 'countDocuments').mockResolvedValue(15);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(60);
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      jest.spyOn(User, 'aggregate').mockResolvedValue([]);

      const findOneSpy = jest.spyOn(PlacementStats, 'findOne').mockResolvedValue({
        academicYear: '2025-2026',
        placementPercentage: 88,
        averagePackageLpa: 12.5,
        highestPackageLpa: 28,
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/stats?academicYear=2025-2026')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(findOneSpy).toHaveBeenCalledWith({ academicYear: '2025-2026' });
      expect(res.body.data.academicYear).toBe('2025-2026');
      expect(res.body.data.placementRate).toBe(88);
      expect(res.body.data.averagePackageLpa).toBe(12.5);
      expect(res.body.data.highestPackageLpa).toBe(28);
    });

    it('GET /api/v1/placement/stats - returns 400 when invalid academicYear format is supplied', async () => {
      const res = await request(app)
        .get('/api/v1/placement/stats?academicYear=bad-year-format')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid academic year format');
    });

    it('GET /api/v1/placement/stats - returns 400 when academicYear span is not start+1', async () => {
      const res = await request(app)
        .get('/api/v1/placement/stats?academicYear=2024-2026')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid academic year format');
    });
  });
});

