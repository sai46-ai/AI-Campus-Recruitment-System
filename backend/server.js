const express = require('express');
const cors = require('cors');
const path = require('path');
// Load environment variables from the backend folder regardless of CWD
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Configuration validation - Must happen before any other initialization
const { validateEnvironment } = require('./config/envValidator');
const logger = require('./utils/logger');

try {
  validateEnvironment();
  logger.info('Environment configuration validated successfully');
} catch (error) {
  logger.fatal('Failed to validate environment configuration');
  logger.error(error.message);
  process.exit(1);
}

// Health service for comprehensive checks
const healthService = require('./services/healthService');

// Database connection
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const resumeRoutes = require('./resume/routes/resumeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

// Middleware imports
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Request logging middleware - must be early
app.use(logger.expressMiddleware());

// Connect to database
connectDB();

// CORS configuration - Restrict to allowed origins for security
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(url => url.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Resume routes
app.use('/api/auth/resume', resumeRoutes); 

app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check endpoint - comprehensive system status
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthService.performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : (health.status === 'degraded' ? 503 : 500);
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error(`Health check error: ${error.message}`);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple ping endpoint (lightweight alternative to full health check)
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    status: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Campus Recruitment System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      resumes: '/api/auth/resume' //
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const server = app.listen(PORT, () => {
  if (NODE_ENV === 'development') {
    logger.info(`
╔══════════════════════════════════════════════════╗
║   🚀 AI Campus Recruitment System API            ║
║   ─────────────────────────────────────────────  ║
║   Server running on port ${PORT}                    ║
║   Environment: ${NODE_ENV}                   ║
║   AI Microservice: http://localhost:8000         ║
╚══════════════════════════════════════════════════╝
    `);
  } else {
    logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});