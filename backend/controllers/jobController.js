const axios = require('axios'); // Required for AI Service bridge
const escapeStringRegexp = require('escape-string-regexp');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Required to fetch student skills
const { createResponse, asyncHandler } = require('../utils/helpers');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { JOB_STATUS } = require('../config/constants');
const aiServiceConfig = require('../config/aiService.config');

/**
 * @desc    Helper to communicate with Python AI Matcher
 * Updated to handle the new match_score field.
 */
const getAiMatchScore = async (studentSkills, jobSkills) => {
  try {
    const response = await axios.post(aiServiceConfig.getMatchURL(), {
      student_skills: studentSkills,
      job_requirements: jobSkills
    });
    return response.data.match_score || 0;
  } catch (err) {
    logger.warn(`AI Matcher service unavailable: ${err.message}`);
    return 0; 
  }
};

/**
 * @desc    Create new job posting
 */
const createJob = asyncHandler(async (req, res) => {
  const { title, company, description, requiredSkills, location, salary, jobType } = req.body;

  if (!title || !company || !description || !requiredSkills || !location) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  const job = await Job.create({
    title: title.trim(),
    company: company.trim(),
    description: description.trim(),
    requiredSkills,
    location: location.trim(),
    salary,
    jobType,
    postedBy: req.user.id
  });

  res.status(201).json(
    createResponse(true, 'Job posted successfully', { job })
  );
});

/**
 * @desc    Get all open jobs with Dynamic AI Match Scores
 */
const getAllJobs = asyncHandler(async (req, res) => {
  const { search, location, page = 1, limit = 10 } = req.query;
  const query = { status: JOB_STATUS.OPEN };

  // SECURITY FIX: Escape search input to prevent regex injection
  if (search) {
    const escapedSearch = escapeStringRegexp(search.trim());
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { company: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  if (location) {
    const escapedLocation = escapeStringRegexp(location.trim());
    query.location = { $regex: escapedLocation, $options: 'i' };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const jobs = await Job.find(query)
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  let jobsWithScores = jobs;
  
  if (req.user && req.user.role === 'student') {
    const student = await User.findById(req.user.id);
    const studentSkills = student?.resume?.verifiedSkills || student?.resume?.extractedSkills || [];

    if (studentSkills.length > 0) {
      jobsWithScores = await Promise.all(jobs.map(async (job) => {
        const score = await getAiMatchScore(studentSkills, job.requiredSkills);
        return { ...job.toObject(), matchScore: score };
      }));
    }
  }

  const total = await Job.countDocuments(query);

  res.status(200).json(
    createResponse(true, 'Jobs retrieved successfully', {
      jobs: jobsWithScores,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    })
  );
});

/**
 * @desc    Get single job by ID with detailed match analysis
 */
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
  if (!job) throw new ApiError(404, 'Job not found');

  let aiMatch = { score: 0, matchedSkills: [], missingSkills: [] };

  if (req.user && req.user.role === 'student') {
    const student = await User.findById(req.user.id);
    const studentSkills = student?.resume?.verifiedSkills || student?.resume?.extractedSkills || [];
    
    try {
      const response = await axios.post('http://localhost:8000/analyze/match', {
        student_skills: studentSkills,
        job_requirements: job.requiredSkills
      });
      
      aiMatch = {
        score: response.data.match_score || 0,
        matchedSkills: response.data.data?.matched_skills || [],
        missingSkills: response.data.data?.missing_skills || []
      };
    } catch (err) {
      logger.warn(`Job detail AI match computation failed: ${err.message}`);
    }
  }

  res.status(200).json(
    createResponse(true, 'Job retrieved successfully', { job, aiMatch })
  );
});

/**
 * @desc    Get recruiter's job postings
 */
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(createResponse(true, 'Jobs retrieved successfully', { jobs }));
});

/**
 * @desc    Update job posting
 */
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedBy.toString() !== req.user.id) throw new ApiError(403, 'Not authorized');

  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json(createResponse(true, 'Job updated successfully', { job }));
});

/**
 * @desc    Close job posting
 */
const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedBy.toString() !== req.user.id) throw new ApiError(403, 'Not authorized');

  job.status = JOB_STATUS.CLOSED;
  await job.save();
  res.status(200).json(createResponse(true, 'Job closed successfully', { job }));
});

/**
 * @desc    Reopen job posting
 */
const reopenJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedBy.toString() !== req.user.id) throw new ApiError(403, 'Not authorized');

  job.status = JOB_STATUS.OPEN;
  await job.save();
  res.status(200).json(createResponse(true, 'Job reopened successfully', { job }));
});

/**
 * @desc    Delete job posting
 */
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedBy.toString() !== req.user.id) throw new ApiError(403, 'Not authorized');

  await job.deleteOne();
  res.status(200).json(createResponse(true, 'Job deleted successfully'));
});

/**
 * @desc    Get all jobs for admin
 */
const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find({}).populate('postedBy', 'name email role').sort({ createdAt: -1 });
  res.status(200).json(createResponse(true, 'All jobs retrieved successfully', { jobs }));
});

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  closeJob,
  reopenJob,
  deleteJob,
  getAllJobsAdmin
};