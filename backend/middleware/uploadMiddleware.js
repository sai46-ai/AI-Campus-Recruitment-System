const fs = require('fs');
const path = require('path');
const multer = require('multer');

const { ApiError } = require('./errorHandler');
const { validateResumePdf } = require('../utils/fileValidation');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Multer middleware for resume uploads.
 * - PDF only
 * - Max 2MB
 * - Stored under backend/uploads/resumes
 */
const createResumeUpload = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureDir(uploadDir);
        cb(null, uploadDir);
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || 'anonymous';
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `resume-${userId}-${unique}.pdf`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      try {
        validateResumePdf(file);
        cb(null, true);
      } catch (e) {
        cb(new ApiError(e.statusCode || 400, e.message));
      }
    }
  });
};

const resumeUpload = createResumeUpload();

module.exports = {
  resumeUpload,
  createResumeUpload
};
