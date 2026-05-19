const express = require('express');
const multer = require('multer');
const path = require('path');

const { verifyToken, allowRoles } = require('../../middleware/authMiddleware');
const { ApiError } = require('../../middleware/errorHandler');
const { validateResumeUpload } = require('../../validators/resumeValidator');
const { uploadResume, getMyResume, deleteResume, ensureResumeDir } = require('../controllers/resumeController');

const router = express.Router();

// Helper function to create multer upload after auth
const createUploadMiddleware = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureResumeDir();
        cb(null, path.join(__dirname, '../../uploads/resumes'));
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || 'unknown';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `resume-${userId}-${uniqueSuffix}.pdf`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.mimetype === 'application/pdf' && ext === '.pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(400, 'Only PDF files (.pdf) up to 2MB are allowed'));
      }
    }
  });
};

// POST: Upload Resume
router.post('/', verifyToken, allowRoles('student'), validateResumeUpload, (req, res, next) => {
  const upload = createUploadMiddleware();
  upload.single('resume')(req, res, next);
}, uploadResume);

// GET: Fetch current user's resume
router.get('/me', verifyToken, allowRoles('student'), getMyResume);

// DELETE: Remove current user's resume
router.delete('/', verifyToken, allowRoles('student'), deleteResume);

module.exports = router;