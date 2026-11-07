import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError';

export const getUploadDir = (): string => {
  return process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'uploads');
};

export const getResumeUploadDir = (): string => {
  return path.join(getUploadDir(), 'resumes');
};

const dir = getResumeUploadDir();
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = getResumeUploadDir();
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => cb(null, `resume-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMime = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];
  const allowedExts = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMime.includes(file.mimetype) || !allowedExts.includes(ext)) {
    return cb(new AppError('Invalid file format. Only PDF, DOCX, DOC, and TXT files are allowed.', 400));
  }
  cb(null, true);
};

export const resumeUpload = multer({ storage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) } });
