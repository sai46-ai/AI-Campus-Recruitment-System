const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createResponse, asyncHandler } = require('../utils/helpers');
const { ApiError } = require('../middleware/errorHandler');
const { TOKEN_EXPIRY } = require('../config/constants');
const { sendWelcomeEmail, sendLoginNotification } = require('../services/mailService');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, skills } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email and password');
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role || 'student',
    skills: skills || []
  });

  // Send welcome email (async, non-blocking)
  sendWelcomeEmail(user);

  res.status(201).json(
    createResponse(true, 'Registration successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Send login notification email (async, non-blocking)
  sendLoginNotification(user, { ip: req.ip });

  res.status(200).json(
    createResponse(true, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills
      }
    })
  );
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    createResponse(true, 'User profile retrieved', { user })
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, skills, phone, bio } = req.body;

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (skills) updateData.skills = skills;
  if (phone) updateData.phone = phone.trim();
  if (bio) updateData.bio = bio.trim();

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    createResponse(true, 'Profile updated successfully', { user })
  );
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
