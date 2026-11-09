import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

const CORRELATION_HEADER = 'x-correlation-id';
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const headerVal = req.headers[CORRELATION_HEADER] || req.headers['x-request-id'];
  let correlationId: string;

  if (typeof headerVal === 'string' && SAFE_ID_PATTERN.test(headerVal)) {
    correlationId = headerVal;
  } else {
    correlationId = randomUUID();
  }

  req.id = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
};

export default correlationMiddleware;

