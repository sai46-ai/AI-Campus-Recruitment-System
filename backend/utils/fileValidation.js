const path = require('path');

class FileValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'FileValidationError';
    this.statusCode = statusCode;
  }
}

const getExtension = (filename = '') => path.extname(filename).toLowerCase();

/**
 * Validates a resume upload file.
 * Multer provides: file.mimetype, file.originalname, file.size.
 */
const validateResumePdf = (file, { maxBytes = 2 * 1024 * 1024 } = {}) => {
  if (!file) throw new FileValidationError('Please upload a PDF resume');

  const ext = getExtension(file.originalname);
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = ext === '.pdf';

  if (!isPdfMime || !isPdfExt) {
    throw new FileValidationError('Only PDF files (.pdf) up to 2MB are allowed');
  }

  if (typeof file.size === 'number' && file.size > maxBytes) {
    throw new FileValidationError('File size must be less than 2MB');
  }

  return true;
};

module.exports = {
  FileValidationError,
  validateResumePdf,
  getExtension
};
