const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { createResponse, asyncHandler } = require('../utils/helpers');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { APPLICATION_STATUS, JOB_STATUS } = require('../config/constants');

/**
 * @desc    Get system-wide statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalAdmins,
        totalJobs,
        openJobs,
        closedJobs,
        totalApplications,
        applicationsByStatus
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'recruiter' }),
        User.countDocuments({ role: 'admin' }),
        Job.countDocuments(),
        Job.countDocuments({ status: JOB_STATUS.OPEN }),
        Job.countDocuments({ status: JOB_STATUS.CLOSED }),
        Application.countDocuments(),
        Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
    ]);

    // Convert status aggregation to object
    const statusCounts = {};
    applicationsByStatus.forEach(item => {
        statusCounts[item._id] = item.count;
    });

    res.status(200).json(
        createResponse(true, 'Statistics retrieved successfully', {
            stats: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    recruiters: totalRecruiters,
                    admins: totalAdmins
                },
                jobs: {
                    total: totalJobs,
                    open: openJobs,
                    closed: closedJobs
                },
                applications: {
                    total: totalApplications,
                    byStatus: statusCounts
                }
            }
        })
    );
});

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};

    if (role && ['student', 'recruiter', 'admin'].includes(role)) {
        query.role = role;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query)
    ]);

    res.status(200).json(
        createResponse(true, 'Users retrieved successfully', {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    );
});

/**
 * @desc    Get all applications (paginated)
 * @route   GET /api/admin/applications
 * @access  Private (Admin)
 */
const getAllApplications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status && Object.values(APPLICATION_STATUS).includes(status)) {
        query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
        Application.find(query)
            .populate('student', 'name email')
            .populate('job', 'title company')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Application.countDocuments(query)
    ]);

    res.status(200).json(
        createResponse(true, 'Applications retrieved successfully', {
            applications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    );
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['student', 'recruiter', 'admin'].includes(role)) {
        throw new ApiError(400, 'Invalid role. Must be student, recruiter, or admin');
    }

    // Prevent admin from demoting themselves
    if (id === req.user.id && role !== 'admin') {
        throw new ApiError(400, 'Cannot change your own role');
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    logger.info(`Admin ${req.user.id} changed role of user ${id} to ${role}`);

    res.status(200).json(
        createResponse(true, 'User role updated successfully', { user })
    );
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
        throw new ApiError(400, 'Cannot delete your own account');
    }

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Delete user's applications if they're a student
    if (user.role === 'student') {
        await Application.deleteMany({ student: id });
    }

    // Delete user's jobs if they're a recruiter
    if (user.role === 'recruiter') {
        const jobs = await Job.find({ postedBy: id });
        const jobIds = jobs.map(j => j._id);
        await Application.deleteMany({ job: { $in: jobIds } });
        await Job.deleteMany({ postedBy: id });
    }

    await user.deleteOne();

    logger.info(`Admin ${req.user.id} deleted user ${id} (${user.email})`);

    res.status(200).json(
        createResponse(true, 'User deleted successfully')
    );
});

/**
 * @desc    Verify recruiter
 * @route   PUT /api/admin/users/:id/verify
 * @access  Private (Admin)
 */
const verifyRecruiter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { verified } = req.body;

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.role !== 'recruiter') {
        throw new ApiError(400, 'Only recruiters can be verified');
    }

    // Add isVerified field (will be added to schema if needed)
    user.isVerified = verified !== false;
    await user.save();

    logger.info(`Admin ${req.user.id} ${verified ? 'verified' : 'unverified'} recruiter ${id}`);

    res.status(200).json(
        createResponse(true, `Recruiter ${verified ? 'verified' : 'unverified'} successfully`, { user })
    );
});

module.exports = {
    getStats,
    getAllUsers,
    getAllApplications,
    updateUserRole,
    deleteUser,
    verifyRecruiter
};
