/**
 * Structured Logging Module
 * Uses Winston for professional logging with rotation and formatting
 */

const winston = require('winston');
const path = require('path');

/**
 * Define custom log levels
 */
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'gray'
  }
};

/**
 * Define log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const log = {
      timestamp,
      level,
      message,
      ...(Object.keys(meta).length > 0 && { meta })
    };
    
    if (stack) {
      log.stack = stack;
    }
    
    return JSON.stringify(log);
  })
);

/**
 * Console format (more readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ colors: customLevels.colors }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const logMessage = `${timestamp} [${level}]: ${message}`;
    return stack ? `${logMessage}\n${stack}` : logMessage;
  })
);

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: logFormat,
  defaultMeta: { service: 'campus-recruitment-api' },
  transports: [
    // Console transport - always enabled
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: consoleFormat
    }),
    
    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      level: process.env.LOG_LEVEL || 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    
    // Info level log file
    new winston.transports.File({
      filename: path.join('logs', 'info.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

/**
 * Add request logging middleware
 * Use in Express: app.use(logger.expressMiddleware())
 */
logger.expressMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const level = statusCode >= 400 ? 'warn' : 'info';
      
      logger.log({
        level,
        message: `${req.method} ${req.originalUrl}`,
        meta: {
          method: req.method,
          path: req.originalUrl,
          statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('user-agent'),
          ip: req.ip
        }
      });
    });
    
    next();
  };
};

module.exports = logger;
