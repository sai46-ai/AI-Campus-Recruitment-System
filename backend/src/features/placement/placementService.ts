import mongoose from 'mongoose';
import { Response } from 'express';
import User from '../auth/userModel';
import Job from '../jobs/jobModel';
import Application from '../applications/applicationModel';
import PlacementStats from '../admin/placementStatsModel';
import { UserRole, JobStatus, ApplicationStatus } from '../../shared/constants/roles';
import { sanitizeCsvCell } from '../../shared/utils/csv';
import { createInAppNotification } from '../../shared/services/notificationService';
import AppError from '../../shared/utils/appError';
import { AuthenticatedRequest } from '../../shared/middleware/auth';

export interface PlacementStatsResponseData {
  academicYear: string;
  totalStudents: number;
  placedStudentsCount: number;
  placementRate: number | null;
  averagePackageLpa: number | null;
  highestPackageLpa: number | null;
  totalActiveJobs: number;
  totalJobs: number;
  totalApplications: number;
  shortlistedApplications: number;
  pendingJobApprovals: number;
  topRecruiters: { companyName: string; offersCount: number; packageLpa: number | null }[];
  departmentStats: { departmentName: string; placedCount: number }[];
}

export const PLACEMENT_CSV_COLUMNS = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'studentEmail', label: 'Student Email' },
  { key: 'department', label: 'Department' },
  { key: 'graduationYear', label: 'Graduation Year' },
  { key: 'cgpa', label: 'CGPA' },
  { key: 'company', label: 'Company' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'jobType', label: 'Job Type' },
  { key: 'status', label: 'Application Status' },
  { key: 'matchScore', label: 'Match Score (%)' },
  { key: 'aiScore', label: 'AI Score (%)' },
  { key: 'appliedDate', label: 'Applied Date' },
];

/**
 * Calculates current academic session dynamically (June-May cycle).
 * Indian university placement cycles typically start in June of year N and run through May of N+1.
 */
export const getCurrentAcademicYear = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  // Month index 5 is June
  const startYear = date.getMonth() >= 5 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

/**
 * Validates academic year format: YYYY-YYYY where end = start + 1.
 */
export const isValidAcademicYear = (yearStr: string): boolean => {
  if (!/^\d{4}-\d{4}$/.test(yearStr)) return false;
  const [start, end] = yearStr.split('-').map(Number);
  return end === start + 1;
};

/**
 * Formats a single application document into an RFC 4180-compliant, formula-injection-safe CSV row.
 */
export const formatApplicationToCsvRow = (app: any): string => {
  const student = app.student || {};
  const job = app.job || {};
  const appliedDate = app.appliedAt
    ? new Date(app.appliedAt).toISOString().split('T')[0]
    : (app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : 'N/A');

  const values = [
    sanitizeCsvCell(student.name || 'N/A'),
    sanitizeCsvCell(student.email || 'N/A'),
    sanitizeCsvCell(student.department || 'N/A'),
    sanitizeCsvCell(student.graduationYear || 'N/A'),
    sanitizeCsvCell(typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : 'N/A'),
    sanitizeCsvCell(job.company || 'N/A'),
    sanitizeCsvCell(job.title || 'N/A'),
    sanitizeCsvCell(job.jobType || 'N/A'),
    sanitizeCsvCell(app.status || 'N/A'),
    sanitizeCsvCell(typeof app.matchScore === 'number' ? app.matchScore : 0),
    sanitizeCsvCell(typeof app.aiScore === 'number' ? app.aiScore : 0),
    sanitizeCsvCell(appliedDate),
  ];

  return values.join(',');
};

/**
 * Retrieves Placement Statistics, supporting optional academic year override or dynamic derivation.
 */
export const calculatePlacementStats = async (
  requestedAcademicYear?: string
): Promise<PlacementStatsResponseData> => {
  let targetAcademicYear: string;

  if (requestedAcademicYear) {
    const trimmed = requestedAcademicYear.trim();
    if (!isValidAcademicYear(trimmed)) {
      throw new AppError('Invalid academic year format. Expected YYYY-YYYY (e.g. 2026-2027)', 400);
    }
    targetAcademicYear = trimmed;
  } else {
    targetAcademicYear = getCurrentAcademicYear();
  }

  const [totalStudents, placedStudents, totalJobs, pendingApprovals, totalApplications, shortlistedApplications] =
    await Promise.all([
      User.countDocuments({ role: UserRole.STUDENT, isDeleted: false }),
      Application.distinct('student', { status: { $in: [ApplicationStatus.HIRED, ApplicationStatus.SELECTED] } }),
      Job.countDocuments({ status: JobStatus.OPEN, isApproved: true }),
      Job.countDocuments({ isApproved: false }),
      Application.countDocuments(),
      Application.countDocuments({ status: ApplicationStatus.SHORTLISTED }),
    ]);

  // Derive real statistics from actual records.
  const hiredApplications = await Application.find({
    status: { $in: [ApplicationStatus.HIRED, ApplicationStatus.SELECTED] },
  })
    .select('student job')
    .populate('job', 'company salary');

  const companyCounts: Record<string, { offersCount: number; packages: number[] }> = {};
  const allPackages: number[] = [];

  for (const app of hiredApplications) {
    if (!app.job) continue;
    const job = app.job as any;
    const company = job.company || 'Unknown';
    if (!companyCounts[company]) companyCounts[company] = { offersCount: 0, packages: [] };
    companyCounts[company].offersCount += 1;

    const rawSalary = job.salary?.max || job.salary?.min;
    if (typeof rawSalary === 'number' && rawSalary > 0) {
      const lpa = rawSalary >= 10000 ? Math.round((rawSalary / 100000) * 10) / 10 : Math.round(rawSalary * 10) / 10;
      companyCounts[company].packages.push(lpa);
      allPackages.push(lpa);
    }
  }

  const topRecruiters = Object.entries(companyCounts)
    .map(([companyName, data]) => ({
      companyName,
      offersCount: data.offersCount,
      packageLpa: data.packages.length
        ? Math.round((data.packages.reduce((a, b) => a + b, 0) / data.packages.length) * 10) / 10
        : null,
    }))
    .sort((a, b) => b.offersCount - a.offersCount)
    .slice(0, 5);

  // Department-level aggregate from distinct students grouped by department.
  const hiredStudentIds = Array.from(new Set(hiredApplications.map((a) => a.student?.toString())))
    .filter((id): id is string => Boolean(id) && mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const deptPipeline = await User.aggregate([
    { $match: { _id: { $in: hiredStudentIds }, department: { $exists: true, $ne: null } } },
    { $group: { _id: '$department', placedCount: { $sum: 1 } } },
  ]);
  const deptStats = deptPipeline.map((d) => ({ departmentName: d._id, placedCount: d.placedCount }));

  const placedCount = placedStudents.length;
  const placementPercentage = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : null;

  const avgFromHired =
    allPackages.length > 0 ? Math.round((allPackages.reduce((a, b) => a + b, 0) / allPackages.length) * 10) / 10 : null;
  const highestFromHired = allPackages.length > 0 ? Math.max(...allPackages) : null;

  // Check manual override record for the active/requested academic year
  const statsRecord = await PlacementStats.findOne({ academicYear: targetAcademicYear });

  return {
    academicYear: targetAcademicYear,
    totalStudents,
    placedStudentsCount: placedCount,
    placementRate: statsRecord?.placementPercentage ?? placementPercentage,
    averagePackageLpa: statsRecord?.averagePackageLpa ?? avgFromHired,
    highestPackageLpa: statsRecord?.highestPackageLpa ?? highestFromHired,
    totalActiveJobs: totalJobs,
    totalJobs,
    totalApplications,
    shortlistedApplications,
    pendingJobApprovals: pendingApprovals,
    topRecruiters,
    departmentStats: deptStats,
  };
};

/**
 * Streams placement CSV using Mongoose cursor and HTTP response backpressure management.
 */
export const streamPlacementApplicationsCsv = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const dateStr = new Date().toISOString().split('T')[0];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="campus-placement-report-${dateStr}.csv"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  const writeChunk = (chunk: string): Promise<boolean> => {
    if (isAborted) return Promise.resolve(false);
    const canWrite = res.write(chunk);
    if (!canWrite) {
      return new Promise((resolve) => {
        res.once('drain', () => resolve(!isAborted));
      });
    }
    return Promise.resolve(true);
  };

  // 1. Write UTF-8 Byte Order Mark (BOM) to guarantee Excel compatibility
  await writeChunk('\uFEFF');

  // 2. Write CSV header row
  const headerRow = PLACEMENT_CSV_COLUMNS.map((h) => sanitizeCsvCell(h.label)).join(',');
  await writeChunk(headerRow + '\r\n');

  // 3. Query applications with streaming cursor
  const query = Application.find()
    .populate('student', 'name email department graduationYear cgpa')
    .populate('job', 'title company jobType location salary')
    .sort({ createdAt: -1 });

  // 4. Stream rows using cursor if available (real Mongoose runtime)
  if (typeof (query as any).cursor === 'function') {
    const cursor = (query as any).cursor();
    try {
      for await (const app of cursor) {
        if (isAborted) break;
        const row = formatApplicationToCsvRow(app);
        const shouldContinue = await writeChunk(row + '\r\n');
        if (!shouldContinue) break;
      }
    } finally {
      if (typeof cursor.close === 'function') {
        await cursor.close();
      }
    }
  } else {
    // Fallback for mocked unit test environments where sort() returns Promise<Array>
    const applications = await query;
    if (Array.isArray(applications)) {
      for (const app of applications) {
        if (isAborted) break;
        const row = formatApplicationToCsvRow(app);
        const shouldContinue = await writeChunk(row + '\r\n');
        if (!shouldContinue) break;
      }
    }
  }

  if (!isAborted) {
    res.end();
  }
};

/**
 * Retrieves unapproved job postings for review.
 */
export const fetchUnapprovedJobs = async () => {
  return Job.find({ isApproved: false }).populate('postedBy', 'name company').sort({ createdAt: -1 });
};

/**
 * Approves a job posting and dispatches notification.
 */
export const approveJobPosting = async (jobId: string, approvedByUserId: string) => {
  const job = await Job.findOneAndUpdate(
    { _id: jobId, isApproved: false },
    { isApproved: true, approvedBy: approvedByUserId },
    { new: true }
  );

  if (!job) {
    throw new AppError('Unapproved job opening not found', 404);
  }

  createInAppNotification({
    userId: job.postedBy.toString(),
    type: 'JOB_POSTED',
    title: 'Recruitment Drive Approved',
    message: `Your job posting "${job.title}" has been approved for the campus recruitment drive.`,
    metadata: { jobId: job._id },
  });

  return job;
};

