const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { createResponse, asyncHandler } = require('../utils/helpers');
const { ApiError } = require('../middleware/errorHandler');
const { sendInterviewEmail } = require('../services/mailService');
const { createNotification } = require('./notificationController');

/**
 * @desc    Schedule an interview
 * @route   POST /api/interviews
 * @access  Private (Recruiter)
 */
const scheduleInterview = asyncHandler(async (req, res) => {
    const {
        applicationId,
        scheduledDate,
        scheduledTime,
        duration,
        type,
        mode,
        location,
        meetingLink,
        notes
    } = req.body;

    // Validate required fields
    if (!applicationId || !scheduledDate || !scheduledTime) {
        throw new ApiError(400, 'Application ID, date, and time are required');
    }

    // Verify application exists and belongs to recruiter's job
    const application = await Application.findById(applicationId)
        .populate('job')
        .populate('student', 'name email');

    if (!application) {
        throw new ApiError(404, 'Application not found');
    }

    if (application.job.postedBy.toString() !== req.user.id) {
        throw new ApiError(403, 'Not authorized to schedule interview for this application');
    }

    // Create interview
    const interview = await Interview.create({
        application: applicationId,
        job: application.job._id,
        student: application.student._id,
        recruiter: req.user.id,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration: duration || 60,
        type: type || 'Technical',
        mode: mode || 'Video',
        location,
        meetingLink,
        notes
    });

    // Update application status to Under Review or Shortlisted
    if (application.status === 'Applied') {
        application.status = 'Under Review';
        await application.save();
    }

    // Send notification
    try {
        await createNotification({
            userId: application.student._id,
            type: 'SYSTEM',
            title: 'Interview Scheduled',
            message: `An interview has been scheduled for your application to "${application.job.title}" on ${scheduledDate} at ${scheduledTime}.`,
            metadata: {
                job: application.job._id,
                application: applicationId,
                interview: interview._id,
                link: '/applications'
            }
        });
    } catch (e) {
        // Non-fatal
    }

    // Send email notification
    sendInterviewEmail({
        studentEmail: application.student.email,
        studentName: application.student.name,
        jobTitle: application.job.title,
        company: application.job.company,
        date: scheduledDate,
        time: scheduledTime,
        notes
    });

    res.status(201).json(
        createResponse(true, 'Interview scheduled successfully', { interview })
    );
});

/**
 * @desc    Get interviews for an application
 * @route   GET /api/interviews/application/:applicationId
 * @access  Private (Recruiter/Student)
 */
const getApplicationInterviews = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
        throw new ApiError(404, 'Application not found');
    }

    // Check authorization
    const isRecruiter = application.job.postedBy.toString() === req.user.id;
    const isStudent = application.student.toString() === req.user.id;

    if (!isRecruiter && !isStudent && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to view these interviews');
    }

    const interviews = await Interview.find({ application: applicationId })
        .populate('recruiter', 'name email')
        .sort({ scheduledDate: -1 });

    res.status(200).json(
        createResponse(true, 'Interviews retrieved successfully', { interviews })
    );
});

/**
 * @desc    Record participation
 * @route   PUT /api/interviews/:id/participation
 * @access  Private
 */
const recordParticipation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { studentJoined, recruiterJoined } = req.body;

    const interview = await Interview.findById(id);

    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    // Check authorization
    if (
        interview.recruiter.toString() !== req.user.id &&
        interview.student.toString() !== req.user.id &&
        req.user.role !== 'admin'
    ) {
        throw new ApiError(403, 'Not authorized');
    }

    if (typeof studentJoined === 'boolean') {
        interview.participation.studentJoined = studentJoined;
    }
    if (typeof recruiterJoined === 'boolean') {
        interview.participation.recruiterJoined = recruiterJoined;
    }

    await interview.save();

    res.status(200).json(
        createResponse(true, 'Participation recorded', { interview })
    );
});

/**
 * @desc    Submit interview score
 * @route   PUT /api/interviews/:id/score
 * @access  Private (Recruiter)
 */
const submitScore = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new ApiError(400, 'Score must be a number between 0 and 100');
    }

    const interview = await Interview.findById(id);

    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    if (interview.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to score this interview');
    }

    interview.score = score;
    interview.status = 'Completed';
    await interview.save();

    res.status(200).json(
        createResponse(true, 'Score submitted successfully', { interview })
    );
});

/**
 * @desc    Submit interview feedback
 * @route   PUT /api/interviews/:id/feedback
 * @access  Private (Recruiter)
 */
const submitFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { feedback, hiringDecision } = req.body;

    const interview = await Interview.findById(id);

    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    if (interview.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized');
    }

    if (feedback) interview.feedback = feedback;
    if (hiringDecision) interview.hiringDecision = hiringDecision;

    await interview.save();

    res.status(200).json(
        createResponse(true, 'Feedback submitted successfully', { interview })
    );
});

/**
 * @desc    Cancel interview
 * @route   PUT /api/interviews/:id/cancel
 * @access  Private (Recruiter)
 */
const cancelInterview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const interview = await Interview.findById(id);

    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    if (interview.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized');
    }

    interview.status = 'Cancelled';
    await interview.save();

    res.status(200).json(
        createResponse(true, 'Interview cancelled', { interview })
    );
});

module.exports = {
    scheduleInterview,
    getApplicationInterviews,
    recordParticipation,
    submitScore,
    submitFeedback,
    cancelInterview
};
