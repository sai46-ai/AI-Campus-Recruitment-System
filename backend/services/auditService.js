/**
 * Audit Logging Service
 * 
 * Logs key actions for monitoring and debugging.
 * In production, this could be extended to write to a database or external logging service.
 * 
 * IMPORTANT: Never log sensitive data (passwords, tokens, etc.)
 */

const logger = require('../utils/logger');

const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';

/**
 * Log levels
 */
const LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * Format log entry
 */
const formatLog = (level, action, data = {}) => {
    const timestamp = new Date().toISOString();
    const entry = {
        timestamp,
        level,
        action,
        ...data
    };

    // Remove sensitive fields if present
    delete entry.password;
    delete entry.token;
    delete entry.secret;

    return entry;
};

/**
 * Write log entry
 */
const writeLog = (level, action, data = {}) => {
    if (LEVELS[level] < LEVELS[LOG_LEVEL]) return;

    const entry = formatLog(level, action, data);
    const output = `AUDIT: ${action}`;

    switch (level) {
        case 'ERROR':
            logger.error(output, entry);
            break;
        case 'WARN':
            logger.warn(output, entry);
            break;
        default:
            logger.info(output, entry);
    }
};

/**
 * Log user login
 */
const logLogin = (userId, email, ip, success = true) => {
    writeLog('INFO', 'USER_LOGIN', {
        userId,
        email,
        ip,
        success
    });
};

/**
 * Log user logout
 */
const logLogout = (userId) => {
    writeLog('INFO', 'USER_LOGOUT', { userId });
};

/**
 * Log user registration
 */
const logRegistration = (userId, email, role) => {
    writeLog('INFO', 'USER_REGISTRATION', {
        userId,
        email,
        role
    });
};

/**
 * Log job creation
 */
const logJobCreated = (jobId, recruiterId, title) => {
    writeLog('INFO', 'JOB_CREATED', {
        jobId,
        recruiterId,
        title
    });
};

/**
 * Log job deletion
 */
const logJobDeleted = (jobId, recruiterId) => {
    writeLog('INFO', 'JOB_DELETED', {
        jobId,
        recruiterId
    });
};

/**
 * Log application status change
 */
const logApplicationStatusChanged = (applicationId, oldStatus, newStatus, recruiterId) => {
    writeLog('INFO', 'APPLICATION_STATUS_CHANGED', {
        applicationId,
        oldStatus,
        newStatus,
        recruiterId
    });
};

/**
 * Log admin action
 */
const logAdminAction = (adminId, action, targetId, details = {}) => {
    writeLog('WARN', 'ADMIN_ACTION', {
        adminId,
        action,
        targetId,
        ...details
    });
};

/**
 * Log security event
 */
const logSecurityEvent = (event, ip, details = {}) => {
    writeLog('WARN', 'SECURITY_EVENT', {
        event,
        ip,
        ...details
    });
};

/**
 * Log error
 */
const logError = (error, context = {}) => {
    writeLog('ERROR', 'ERROR', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        ...context
    });
};

module.exports = {
    logLogin,
    logLogout,
    logRegistration,
    logJobCreated,
    logJobDeleted,
    logApplicationStatusChanged,
    logAdminAction,
    logSecurityEvent,
    logError
};
