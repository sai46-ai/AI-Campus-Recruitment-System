import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import AppError from '../utils/appError';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  logger.error(`[Error] ${err.message}`, {
    correlationId: req.id,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const correlationId = req.id;
  if (err.code === 11000) return res.status(400).json({ success: false, message: `Duplicate value for field '${Object.keys(err.keyValue)[0]}'.`, correlationId });
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: `Invalid input. ${Object.values(err.errors).map((e: any) => e.message).join('. ')}`, correlationId });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.', correlationId });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired.', correlationId });
  if (err instanceof AppError || err.isOperational) return res.status(err.statusCode).json({ success: false, message: err.message, correlationId });

  return res.status(500).json({ success: false, message: 'Internal server error.', correlationId });
};
