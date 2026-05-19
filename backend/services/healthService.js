/**
 * Health Check Service
 * Verifies that all microservices and dependencies are healthy
 */

const axios = require('axios');
const logger = require('../utils/logger');
const aiServiceConfig = require('../config/aiService.config');

/**
 * Check if database connection is healthy
 * @returns {Promise<Object>} Health status of database
 */
const checkDatabase = async () => {
  try {
    // This will be populated by the database connection module
    if (global.mongoConnection && global.mongoConnection.connection.readyState === 1) {
      return {
        status: 'healthy',
        message: 'MongoDB connected',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'unhealthy',
        message: 'MongoDB connection not ready',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check if AI microservice is healthy
 * @returns {Promise<Object>} Health status of AI service
 */
const checkAIService = async () => {
  try {
    if (!aiServiceConfig.isConfigured()) {
      return {
        status: 'unconfigured',
        message: 'AI Service URL not configured',
        timestamp: new Date().toISOString()
      };
    }

    const timeout = Math.min(aiServiceConfig.timeout, 5000); // Max 5s for health check
    const response = await axios.get(aiServiceConfig.getHealthURL(), { timeout });

    if (response.status === 200 && response.data?.status === 'healthy') {
      return {
        status: 'healthy',
        message: 'AI Service responding',
        version: response.data?.version,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'unhealthy',
        message: 'AI Service returned unexpected response',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    const message = error.code === 'ECONNREFUSED'
      ? 'AI Service not reachable'
      : error.message;

    return {
      status: 'unhealthy',
      message: `AI Service check failed: ${message}`,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Perform comprehensive health check
 * @returns {Promise<Object>} Overall system health status
 */
const performHealthCheck = async () => {
  const startTime = Date.now();

  try {
    const [dbHealth, aiHealth] = await Promise.all([
      checkDatabase(),
      checkAIService()
    ]);

    const duration = Date.now() - startTime;
    const allHealthy = dbHealth.status === 'healthy' && aiHealth.status === 'healthy';

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services: {
        database: dbHealth,
        aiService: aiHealth
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    };
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  performHealthCheck,
  checkDatabase,
  checkAIService
};
