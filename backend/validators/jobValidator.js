/**
 * Job Validators
 * Schema validation for job posting endpoints using Joi
 */

const joi = require('joi');

/**
 * Schema for creating a job posting
 */
const createJobSchema = joi.object({
  title: joi.string()
    .required()
    .min(3)
    .max(200)
    .trim()
    .messages({
      'string.empty': 'Job title is required',
      'string.min': 'Job title must be at least 3 characters',
      'string.max': 'Job title cannot exceed 200 characters'
    }),
  company: joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 2 characters'
    }),
  description: joi.string()
    .required()
    .min(50)
    .max(5000)
    .messages({
      'string.empty': 'Job description is required',
      'string.min': 'Description must be at least 50 characters'
    }),
  requiredSkills: joi.array()
    .items(joi.string().trim())
    .required()
    .messages({
      'array.base': 'Required skills must be an array',
      'any.required': 'At least one skill is required'
    }),
  location: joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Location is required',
      'string.min': 'Location must be valid'
    }),
  salary: joi.object({
    min: joi.number().integer().min(0),
    max: joi.number().integer().min(0).greater(joi.ref('min'))
  }).allow(null),
  jobType: joi.string()
    .valid('full-time', 'part-time', 'contract', 'internship')
    .messages({
      'any.only': 'Job type must be full-time, part-time, contract, or internship'
    })
});

/**
 * Schema for updating a job posting
 */
const updateJobSchema = createJobSchema.fork(
  ['title', 'company', 'description', 'requiredSkills', 'location'],
  schema => schema.optional()
);

/**
 * Middleware to validate job creation request
 */
const validateCreateJob = (req, res, next) => {
  const { error, value } = createJobSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ errors: messages });
  }
  req.validated = value;
  next();
};

/**
 * Middleware to validate job update request
 */
const validateUpdateJob = (req, res, next) => {
  const { error, value } = updateJobSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ errors: messages });
  }
  req.validated = value;
  next();
};

module.exports = {
  createJobSchema,
  updateJobSchema,
  validateCreateJob,
  validateUpdateJob
};
