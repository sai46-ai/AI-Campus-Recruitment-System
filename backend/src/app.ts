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

const app: Application = express();

// Trust reverse proxy (1 hop from Nginx reverse proxy to Express container)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS: allow only explicitly configured origins. In production, an origin that
// is not in the allowlist is REJECTED. There is no silent fallback.
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const devFallbacks = process.env.NODE_ENV !== 'production'
  ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
  : [];

const allowedOrigins = [...new Set([...configuredOrigins, ...devFallbacks])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // No Origin header (same-origin, server-to-server, curl) -> allow.
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
}));

// Express Parsing Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

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
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
