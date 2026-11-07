import request from 'supertest';
import app from '../src/app';
import { generateAccessToken } from '../src/shared/utils/jwt';
import { UserRole, ApplicationStatus, JobStatus, JobType } from '../src/shared/constants/roles';
import User from '../src/features/auth/userModel';
import Job from '../src/features/jobs/jobModel';
import Application from '../src/features/applications/applicationModel';
import Resume from '../src/features/resumes/resumeModel';
import PlacementStats from '../src/features/admin/placementStatsModel';
import Interview from '../src/features/interviews/interviewModel';
import { sanitizeCsvCell } from '../src/shared/utils/csv';

/**
 * Phase 02 Placement Officer CSV Export, Reporting Integrity & Recruiter Workflow Test Suite
 */
describe('Phase 02: Placement CSV Export & Reporting Integrity', () => {
  const studentId = '507f1f77bcf86cd799439011';
  const recruiterId1 = '507f1f77bcf86cd799439022';
  const recruiterId2 = '507f1f77bcf86cd799439023';
  const poId = '507f1f77bcf86cd799439033';
  const adminId = '507f1f77bcf86cd799439044';
  const superAdminId = '507f1f77bcf86cd799439055';

  const testJobId = '507f1f77bcf86cd799439066';
  const testAppId = '507f1f77bcf86cd799439077';
  const testResumeId = '507f1f77bcf86cd799439088';

  const studentToken = generateAccessToken({ userId: studentId, role: UserRole.STUDENT, email: 'student@university.edu' });
  const recruiterToken1 = generateAccessToken({ userId: recruiterId1, role: UserRole.RECRUITER, email: 'recruiter1@techcorp.com' });
  const recruiterToken2 = generateAccessToken({ userId: recruiterId2, role: UserRole.RECRUITER, email: 'recruiter2@othercorp.com' });
  const poToken = generateAccessToken({ userId: poId, role: UserRole.PLACEMENT_OFFICER, email: 'placement@university.edu' });
  const adminToken = generateAccessToken({ userId: adminId, role: UserRole.ADMIN, email: 'admin@university.edu' });
  const superAdminToken = generateAccessToken({ userId: superAdminId, role: UserRole.SUPER_ADMIN, email: 'superadmin@system.internal' });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // 1. CSV SANITIZATION UNIT TESTS (CWE-1236 FORMULA INJECTION DEFENSE)
  // =========================================================================
  describe('CSV Sanitization & Formula Injection Defense', () => {
    it('should prepend single quote to neutralize formula injection characters (=, +, -, @, \\t, \\r)', () => {
      expect(sanitizeCsvCell('=SUM(A1:B10)')).toBe("'=SUM(A1:B10)");
      expect(sanitizeCsvCell('+cmd|/C calc!A0')).toBe("'+cmd|/C calc!A0");
      expect(sanitizeCsvCell('-500')).toBe("'-500");
      expect(sanitizeCsvCell('@IMPORTXML("http://evil.com")')).toBe('"\'@IMPORTXML(""http://evil.com"")"');
      expect(sanitizeCsvCell('\tTabLeading')).toBe("'\tTabLeading");
      expect(sanitizeCsvCell('\rReturnLeading')).toBe('"\'\rReturnLeading"');
    });

    it('should properly double quotes and wrap in quotes for cells containing commas or newlines', () => {
      expect(sanitizeCsvCell('Acme, Inc.')).toBe('"Acme, Inc."');
      expect(sanitizeCsvCell('Line1\nLine2')).toBe('"Line1\nLine2"');
      expect(sanitizeCsvCell('He said "Hello"')).toBe('"He said ""Hello"""');
    });

    it('should return empty string for null and undefined', () => {
      expect(sanitizeCsvCell(null)).toBe('');
      expect(sanitizeCsvCell(undefined)).toBe('');
    });

    it('should return plain text unmodified when no special characters exist', () => {
      expect(sanitizeCsvCell('Computer Science')).toBe('Computer Science');
      expect(sanitizeCsvCell('Jane Doe')).toBe('Jane Doe');
      expect(sanitizeCsvCell(85.5)).toBe('85.5');
    });
  });

  // =========================================================================
  // 2. CSV EXPORT AUTHORIZATION & ACCESS CONTROL
  // =========================================================================
  describe('GET /api/v1/placement/export-csv - RBAC Enforcement', () => {
    it('should allow Placement Officer to export CSV report with HTTP 200', async () => {
      jest.spyOn(Application, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([
              {
                student: { name: 'Aarav Patel', email: 'aarav@university.edu', department: 'Computer Science', graduationYear: 2026, cgpa: 8.9 },
                job: { title: 'Software Engineer', company: 'Google India', jobType: JobType.FULL_TIME, salary: { min: 1800000, max: 2400000, currency: 'INR' }, location: 'Bengaluru' },
                status: ApplicationStatus.SELECTED,
                matchScore: 92,
                aiScore: 88,
                appliedAt: new Date('2026-03-01T10:00:00Z'),
              },
            ]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="campus-placement-report-');
      expect(res.text.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM check
      expect(res.text).toContain('Student Name,Student Email,Department,Graduation Year,CGPA,Company,Job Title,Job Type,Application Status,Match Score (%),AI Score (%),Applied Date');
      expect(res.text).toContain('Aarav Patel,aarav@university.edu,Computer Science,2026,8.90,Google India,Software Engineer,Full-time,Selected,92,88,2026-03-01');
    });

    it('should allow Admin to export CSV report with HTTP 200', async () => {
      jest.spyOn(Application, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Student Name,Student Email,Department');
    });

    it('should allow Super Admin to export CSV report with HTTP 200', async () => {
      jest.spyOn(Application, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
    });

    it('should reject Student attempting to export CSV report with HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject Recruiter attempting to export CSV report with HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${recruiterToken1}`);

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated request with HTTP 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/v1/placement/export-csv');

      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 3. CSV FORMULA INJECTION & MALICIOUS INPUT NEUTRALIZATION IN API
  // =========================================================================
  describe('GET /api/v1/placement/export-csv - Malicious Payload Neutralization', () => {
    it('should neutralize formula injection in student name and company fields in exported CSV', async () => {
      jest.spyOn(Application, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([
              {
                student: { name: '=cmd|"/C calc"!A0', email: 'malicious@test.com', department: '+IT', graduationYear: 2026, cgpa: 9.0 },
                job: { title: '-Exploit Lead', company: '@Acme, Corp.', jobType: JobType.FULL_TIME },
                status: ApplicationStatus.APPLIED,
                matchScore: 0,
                aiScore: 0,
                appliedAt: new Date('2026-03-02'),
              },
            ]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      // = neutralized to '=
      expect(res.text).toContain("'=cmd");
      // + neutralized to '+
      expect(res.text).toContain("'+IT");
      // - neutralized to '-
      expect(res.text).toContain("'-Exploit Lead");
      // @ neutralized and comma escaped
      expect(res.text).toContain('"\'@Acme, Corp."');
    });

    it('should return valid CSV header even when database has 0 applications', async () => {
      jest.spyOn(Application, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/placement/export-csv')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Student Name,Student Email,Department,Graduation Year,CGPA,Company,Job Title,Job Type,Application Status,Match Score (%),AI Score (%),Applied Date');
    });
  });

  // =========================================================================
  // 4. PLACEMENT STATISTICS DATA INTEGRITY AUDIT
  // =========================================================================
  describe('GET /api/v1/placement/stats - Reporting Metrics Integrity', () => {
    it('should return aligned metrics including totalJobs, totalApplications, and shortlistedApplications', async () => {
      jest.spyOn(User, 'countDocuments').mockResolvedValue(100);
      jest.spyOn(Job, 'countDocuments').mockImplementation(((query?: any) => {
        if (query?.isApproved === false) return Promise.resolve(3);
        return Promise.resolve(12);
      }) as any);
      jest.spyOn(Application, 'countDocuments').mockImplementation(((query?: any) => {
        if (query?.status === ApplicationStatus.SHORTLISTED) return Promise.resolve(18);
        return Promise.resolve(42);
      }) as any);
      const placedStudent1 = '507f1f77bcf86cd799439001';
      const placedStudent2 = '507f1f77bcf86cd799439002';
      jest.spyOn(Application, 'distinct').mockResolvedValue([placedStudent1, placedStudent2]);
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([
            { student: placedStudent1, job: { company: 'Infosys', salary: { min: 800000, max: 1200000 } } },
            { student: placedStudent2, job: { company: 'TCS', salary: { min: 700000, max: 900000 } } },
          ]),
        }),
      } as any);
      jest.spyOn(User, 'aggregate').mockResolvedValue([
        { _id: 'CSE', placedCount: 2 },
      ]);
      jest.spyOn(PlacementStats, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/placement/stats')
        .set('Authorization', `Bearer ${poToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.totalStudents).toBe(100);
      expect(data.placedStudentsCount).toBe(2);
      expect(data.placementRate).toBe(2); // (2 / 100) * 100
      expect(data.totalActiveJobs).toBe(12);
      expect(data.totalJobs).toBe(12); // Verified compatibility for PlacementAnalyticsMatrix
      expect(data.totalApplications).toBe(42); // Verified compatibility for PlacementAnalyticsMatrix
      expect(data.shortlistedApplications).toBe(18); // Verified compatibility for PlacementAnalyticsMatrix
      expect(data.pendingJobApprovals).toBe(3);
      expect(data.averagePackageLpa).toBe(10.5); // (12 + 9) / 2
      expect(data.highestPackageLpa).toBe(12); // max(12, 9)
      expect(data.topRecruiters).toHaveLength(2);
      expect(data.departmentStats).toHaveLength(1);
      expect(data.departmentStats[0].departmentName).toBe('CSE');
    });

    it('should count both Hired and Selected status in placed candidates calculation', async () => {
      const distinctSpy = jest.spyOn(Application, 'distinct').mockResolvedValue(['student_hired', 'student_selected']);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(50);
      jest.spyOn(Job, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Application, 'countDocuments').mockResolvedValue(20);
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
      expect(distinctSpy).toHaveBeenCalledWith('student', {
        status: { $in: [ApplicationStatus.HIRED, ApplicationStatus.SELECTED] },
      });
      expect(res.body.data.placedStudentsCount).toBe(2);
      expect(res.body.data.placementRate).toBe(4); // 2/50 * 100
    });
  });

  // =========================================================================
  // 5. RECRUITER-APPLICANT WORKFLOW BOUNDARY VALIDATION
  // =========================================================================
  describe('Recruiter-Applicant Workflow Boundaries', () => {
    it('should reject recruiter viewing applicants for a job owned by another recruiter (403)', async () => {
      // Job owned by recruiter 2
      jest.spyOn(Job, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: testJobId, postedBy: recruiterId2 }),
      } as any);

      // Recruiter 1 tries to access recruiter 2's applicants
      const res = await request(app)
        .get(`/api/v1/applications/job/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken1}`);

      expect(res.status).toBe(403);
    });

    it('should allow recruiter to view applicants for their own job (200)', async () => {
      jest.spyOn(Job, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: testJobId, postedBy: recruiterId1 }),
      } as any);
      jest.spyOn(Application, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([
              { _id: testAppId, job: testJobId, student: { name: 'Applicant One' }, matchScore: 85 },
            ]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get(`/api/v1/applications/job/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should reject recruiter updating application status for a job owned by another recruiter (403)', async () => {
      jest.spyOn(Application, 'findById').mockResolvedValue({
        _id: testAppId,
        job: testJobId,
        student: studentId,
        status: ApplicationStatus.APPLIED,
      } as any);
      // Job query returns null because recruiter 1 does not own this job
      jest.spyOn(Job, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .put(`/api/v1/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${recruiterToken1}`)
        .send({ status: ApplicationStatus.SHORTLISTED });

      expect(res.status).toBe(403);
    });

    it('should reject recruiter scheduling an interview for an application of another recruiter job (403)', async () => {
      jest.spyOn(Application, 'findById').mockResolvedValue({
        _id: testAppId,
        job: testJobId,
        student: studentId,
        status: ApplicationStatus.APPLIED,
      } as any);
      jest.spyOn(Job, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/v1/interviews/schedule')
        .set('Authorization', `Bearer ${recruiterToken1}`)
        .send({
          applicationId: testAppId,
          scheduledDate: '2026-04-15',
          scheduledTime: '14:00',
          duration: 45,
          type: 'Technical',
          mode: 'Video',
        });

      expect(res.status).toBe(403);
    });

    it('should reject recruiter downloading a resume without valid application context tied to their job (403)', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue({
        _id: testResumeId,
        student: studentId,
        originalName: 'StudentResume.pdf',
        fileUrl: '/uploads/resumes/resume.pdf',
      } as any);

      // Recruiter attempts download with arbitrary applicationId
      jest.spyOn(Application, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .get(`/api/v1/resumes/${testResumeId}/download?applicationId=${testAppId}`)
        .set('Authorization', `Bearer ${recruiterToken1}`);

      expect(res.status).toBe(403);
    });
  });
});
