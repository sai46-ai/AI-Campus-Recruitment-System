/**
 * Resume Validators
 * Schema validation for resume upload endpoints using Joi
 */

const joi = require('joi');

/**
 * Schema for resume file validation
 * Note: File validation happens in multer, this is for metadata
 */
const resumeUploadSchema = joi.object({
  // File validation is handled by multer middleware
  // This schema can be extended for additional metadata if needed
}).unknown(true); // Allow extra fields from form

/**
 * Middleware to validate resume upload
 */
const validateResumeUpload = (req, res, next) => {
  const { error } = resumeUploadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  resumeUploadSchema,
  validateResumeUpload
};
