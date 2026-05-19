/**
 * Environment Configuration Validator
 * Ensures all required environment variables are set at startup
 * Prevents runtime errors from missing configuration
 */

const logger = require('../utils/logger');

/**
 * Define required environment variables and their descriptions
 */
const REQUIRED_ENV_VARS = {
  PORT: {
    default: '5000',
    description: 'Server port'
  },
  NODE_ENV: {
    default: 'development',
    description: 'Environment (development/production)'
  },
  MONGO_URI: {
    required: true,
    description: 'MongoDB connection string'
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT secret key (minimum 32 characters for security)'
  },
  JWT_EXPIRE: {
    default: '7d',
    description: 'JWT token expiration time'
  },
  AI_SERVICE_URL: {
    default: 'http://localhost:8000',
    description: 'AI microservice URL'
  },
  AI_SERVICE_TIMEOUT: {
    default: '30000',
    description: 'AI service request timeout in milliseconds'
  },
  ALLOWED_ORIGINS: {
    default: 'http://localhost:3000',
    description: 'Comma-separated list of allowed CORS origins'
  },
  LOG_LEVEL: {
    default: 'info',
    description: 'Logging level (debug/info/warn/error)'
  }
};

/**
 * Validate environment configuration
 * @throws {Error} If required variables are missing
 * @returns {Object} Validated environment variables
 */
const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  const config = {};

  logger.info('Validating environment configuration...');

  // Check each required variable
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, schema]) => {
    const value = process.env[key];

    if (!value && schema.required) {
      errors.push(`❌ Missing required env var: ${key}`);
      errors.push(`   Description: ${schema.description}`);
    } else if (!value && schema.default) {
      config[key] = schema.default;
      warnings.push(`⚠️  Using default for ${key}: ${schema.default}`);
    } else if (value) {
      config[key] = value;

      // Validate specific variables
      if (key === 'JWT_SECRET' && value.length < 32 && process.env.NODE_ENV === 'production') {
        errors.push(`❌ JWT_SECRET is too short (min 32 chars, got ${value.length})`);
      }

      if (key === 'MONGO_URI' && !value.startsWith('mongodb')) {
        errors.push(`❌ MONGO_URI does not appear to be a valid MongoDB connection string`);
      }

      if (key === 'PORT' && (isNaN(value) || value < 1 || value > 65535)) {
        errors.push(`❌ PORT must be a number between 1 and 65535 (got ${value})`);
      }
    }
  });

  // Log warnings
  if (warnings.length > 0) {
    warnings.forEach(w => logger.warn(w));
  }

  // Log errors and throw if any exist
  if (errors.length > 0) {
    errors.forEach(e => logger.error(e));
    throw new Error(`Environment validation failed: ${errors.length} error(s) found`);
  }

  // Additional warnings for production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.DEBUG === 'true') {
      logger.warn('⚠️  DEBUG mode is enabled in production');
    }

    if (!process.env.HTTPS_CERT || !process.env.HTTPS_KEY) {
      logger.warn('⚠️  HTTPS not configured. Ensure you have a reverse proxy (nginx/Cloudflare)');
    }
  }

  logger.info('✅ Environment validation successful');

  return config;
};

/**
 * Check if environment variable exists and is set
 * @param {string} key - Environment variable name
 * @returns {boolean}
 */
const hasEnv = (key) => {
  return process.env[key] !== undefined && process.env[key] !== '';
};

/**
 * Get environment variable with validation
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string|number}
 */
const getEnv = (key, defaultValue = null) => {
  const value = process.env[key];

  if (value !== undefined && value !== '') {
    return value;
  }

  if (defaultValue !== null) {
    return defaultValue;
  }

  throw new Error(`Environment variable ${key} is not set`);
};

module.exports = {
  validateEnvironment,
  hasEnv,
  getEnv,
  REQUIRED_ENV_VARS
};
