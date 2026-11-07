import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import AppError from '../utils/appError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  logger.error(`[Error] ${err.message}${process.env.NODE_ENV === 'development' ? `\nStack: ${err.stack}` : ''}`);

  if (err.code === 11000) return res.status(400).json({ success: false, message: `Duplicate value for field '${Object.keys(err.keyValue)[0]}'.` });
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: `Invalid input. ${Object.values(err.errors).map((e: any) => e.message).join('. ')}` });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired.' });
  if (err instanceof AppError || err.isOperational) return res.status(err.statusCode).json({ success: false, message: err.message });

  return res.status(500).json({ success: false, message: 'Internal server error.' });
};
