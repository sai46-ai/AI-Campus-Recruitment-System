import User from '../features/auth/userModel';
import { UserRole } from '../shared/constants/roles';
import logger from '../shared/utils/logger';

export const seedDatabase = async (): Promise<void> => {
  // CRITICAL PRODUCTION GUARD: Never run automated demo account seeding in production
  // unless explicitly authorized via an explicit environment flag (ALLOW_PRODUCTION_SEED=true).
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    logger.info('[Seed] Production environment detected; automated demo account seeding is strictly disabled.');
    return;
  }

  try {
    const admin = await User.findOne({ email: 'admin@campus.edu' });
    if (!admin) {
      logger.info('[Seed] Initializing primary administrator account...');
      await User.create({
        name: 'System Administrator',
        email: 'admin@campus.edu',
        password: 'Password@123',
        role: UserRole.ADMIN,
        isVerified: true,
        phone: '+91 9876543213',
      });
      logger.info('[Seed] Primary administrator account initialized successfully.');
    }

    const student = await User.findOne({ email: 'student@campus.edu' });
    if (!student) {
      logger.info('[Seed] Initializing sample student account...');
      await User.create({
        name: 'Aarav Sharma',
        email: 'student@campus.edu',
        password: 'Password@123',
        role: UserRole.STUDENT,
        isVerified: true,
        phone: '+91 9876543210',
        department: 'Computer Science',
        graduationYear: 2026,
        cgpa: 8.9,
        activeBacklogs: 0,
        skills: ['TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL'],
      });
      logger.info('[Seed] Sample student account initialized successfully.');
    }

    const recruiter = await User.findOne({ email: 'recruiter@campus.edu' });
    if (!recruiter) {
      logger.info('[Seed] Initializing verified recruiter account...');
      await User.create({
        name: 'Priya Mehta',
        email: 'recruiter@campus.edu',
        password: 'Password@123',
        role: UserRole.RECRUITER,
        isVerified: true,
        isRecruiterVerified: true,
        phone: '+91 9876543211',
      });
      logger.info('[Seed] Verified recruiter account initialized successfully.');
    }

    const po = await User.findOne({ email: 'placement@campus.edu' });
    if (!po) {
      logger.info('[Seed] Initializing placement officer account...');
      await User.create({
        name: 'Dr. Rajesh Verma',
        email: 'placement@campus.edu',
        password: 'Password@123',
        role: UserRole.PLACEMENT_OFFICER,
        isVerified: true,
        phone: '+91 9876543212',
      });
      logger.info('[Seed] Placement officer account initialized successfully.');
    }
  } catch (err: any) {
    logger.warn(`[Seed] Seed process non-fatal warning: ${err.message}`);
  }
};

export default seedDatabase;
