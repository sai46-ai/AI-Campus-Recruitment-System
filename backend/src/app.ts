import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRouter from './routes';
import { errorHandler } from './shared/middleware/errorHandler';
import { apiRateLimiter } from './shared/middleware/rateLimiter';
import { csrfProtection } from './shared/middleware/csrfMiddleware';
import { correlationMiddleware } from './shared/middleware/correlationMiddleware';

const app: Application = express();

// Trust reverse proxy (1 hop from Nginx reverse proxy to Express container)
app.set('trust proxy', 1);

// Request Correlation ID Middleware (attaches req.id and X-Correlation-ID response header)
app.use(correlationMiddleware);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS: allow only explicitly configured origins. In production, an origin that
// is not in the allowlist is REJECTED. There is no silent fallback.
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const devFallbacks = process.env.NODE_ENV !== 'production'
  ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
  : [];

const allowedOrigins = [...new Set([...configuredOrigins, ...devFallbacks])];

const isAllowedOrigin = (origin: string): boolean => {
  if (allowedOrigins.includes(origin)) return true;
  for (const configured of configuredOrigins) {
    if (configured.includes('*')) {
      const regex = new RegExp('^' + configured.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      if (regex.test(origin)) return true;
    }
  }
  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // No Origin header (same-origin, server-to-server, curl) -> allow.
      return callback(null, true);
    }
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-Correlation-ID', 'X-Request-ID'],
  exposedHeaders: ['X-Correlation-ID'],
}));

// Express Parsing Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan((tokens, req, res) => {
      const id = (req as any).id ? `[${(req as any).id}] ` : '';
      return `${id}${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ${tokens['response-time'](req, res)} ms - ${tokens.res(req, res, 'content-length')}`;
    })
  );
}

// Resumes are NOT served as a public static directory. The physical file path is
// only readable through the authenticated GET /resumes/:id/download endpoint,
// which enforces ownership. This prevents unauthenticated PII disclosure.

// API Routes with Rate Limiting and CSRF Protection
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(apiPrefix, apiRateLimiter, csrfProtection, apiRouter);

// Fallback legacy API compatibility route mapping (/api/* -> /api/v1/*)
app.use('/api', apiRateLimiter, csrfProtection, apiRouter);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find route ${req.originalUrl} on this server.`,
    correlationId: req.id,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
