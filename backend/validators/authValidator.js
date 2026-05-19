/**
 * Authentication Validators
 * Schema validation for auth endpoints using Joi
 */

const joi = require('joi');

/**
 * Schema for user registration
 */
const registerSchema = joi.object({
  name: joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  email: joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
  password: joi.string()
    .min(8)
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
      'string.empty': 'Password is required'
    }),
  role: joi.string()
    .valid('student', 'recruiter', 'admin')
    .required()
    .messages({
      'any.only': 'Role must be student, recruiter, or admin',
      'string.empty': 'Role is required'
    })
});

/**
 * Schema for user login
 */
const loginSchema = joi.object({
  email: joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
  password: joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

/**
 * Middleware to validate registration request
 */
const validateRegister = (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ errors: messages });
  }
  req.validated = value;
  next();
};

/**
 * Middleware to validate login request
 */
const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validated = value;
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  validateRegister,
  validateLogin
};
