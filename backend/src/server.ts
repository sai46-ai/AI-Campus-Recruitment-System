import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { seedDatabase } from './config/seed';
import logger from './shared/utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    await seedDatabase();

    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`===========================================================`);
      logger.info(`  AI Campus Recruitment System - Backend API v2.0.0`);
      logger.info(`  Server running in [${process.env.NODE_ENV || 'development'}] mode`);
      logger.info(`  Listening on port: ${PORT}`);
      logger.info(`  Base API URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api/v1'}`);
      logger.info(`===========================================================`);
    });

    // Configure robust HTTP keep-alive timeouts for reverse proxy reliability (e.g. Nginx/ALB)
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    process.on('unhandledRejection', (err: Error) => {
      logger.error(`[Server] Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error(`[Server] Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error: any) {
    logger.error(`[Server] Failed to launch server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export { app, startServer };
export default app;

