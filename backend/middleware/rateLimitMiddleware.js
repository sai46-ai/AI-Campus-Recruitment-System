/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter for brute force protection
 * Production: Consider using Redis-based rate limiter
 */

const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

// In-memory store for rate limiting
const attempts = new Map();

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

/**
 * Clean up old entries periodically
 */
const cleanup = () => {
    const now = Date.now();
    for (const [key, data] of attempts.entries()) {
        if (now - data.firstAttempt > WINDOW_MS) {
            attempts.delete(key);
        }
    }
};

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

/**
 * Get client identifier (IP address)
 */
const getClientId = (req) => {
    return req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection?.remoteAddress ||
        'unknown';
};

/**
 * Rate limiter for login attempts
 * Limits to MAX_ATTEMPTS per WINDOW_MS
 */
const loginRateLimiter = (req, res, next) => {
    const clientId = getClientId(req);
    const key = `login:${clientId}`;
    const now = Date.now();

    let data = attempts.get(key);

    if (!data) {
        // First attempt
        attempts.set(key, {
            count: 1,
            firstAttempt: now
        });
        return next();
    }

    // Check if window has expired
    if (now - data.firstAttempt > WINDOW_MS) {
        // Reset counter
        attempts.set(key, {
            count: 1,
            firstAttempt: now
        });
        return next();
    }

    // Within window - check count
    if (data.count >= MAX_ATTEMPTS) {
        const remainingMs = WINDOW_MS - (now - data.firstAttempt);
        const remainingMin = Math.ceil(remainingMs / 60000);

        logger.warn(`Login rate limit exceeded for ${clientId}`);

        return next(new ApiError(
            429,
            `Too many login attempts. Please try again in ${remainingMin} minute(s).`
        ));
    }

    // Increment count
    data.count++;
    attempts.set(key, data);
    next();
};

/**
 * Rate limiter for registration
 * More lenient - 10 attempts per 30 minutes
 */
const registerRateLimiter = (req, res, next) => {
    const clientId = getClientId(req);
    const key = `register:${clientId}`;
    const now = Date.now();
    const windowMs = 30 * 60 * 1000;
    const maxAttempts = 10;

    let data = attempts.get(key);

    if (!data) {
        attempts.set(key, { count: 1, firstAttempt: now });
        return next();
    }

    if (now - data.firstAttempt > windowMs) {
        attempts.set(key, { count: 1, firstAttempt: now });
        return next();
    }

    if (data.count >= maxAttempts) {
        const remainingMs = windowMs - (now - data.firstAttempt);
        const remainingMin = Math.ceil(remainingMs / 60000);

        logger.warn(`Registration rate limit exceeded for ${clientId}`);

        return next(new ApiError(
            429,
            `Too many registration attempts. Please try again in ${remainingMin} minute(s).`
        ));
    }

    data.count++;
    attempts.set(key, data);
    next();
};

/**
 * Clear rate limit for a client (call on successful login)
 */
const clearRateLimit = (req) => {
    const clientId = getClientId(req);
    attempts.delete(`login:${clientId}`);
};

/**
 * General rate limiter factory
 * @param {Object} options - { windowMs, maxAttempts, keyPrefix }
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        maxAttempts = 100,
        keyPrefix = 'general'
    } = options;

    return (req, res, next) => {
        const clientId = getClientId(req);
        const key = `${keyPrefix}:${clientId}`;
        const now = Date.now();

        let data = attempts.get(key);

        if (!data) {
            attempts.set(key, { count: 1, firstAttempt: now });
            return next();
        }

        if (now - data.firstAttempt > windowMs) {
            attempts.set(key, { count: 1, firstAttempt: now });
            return next();
        }

        if (data.count >= maxAttempts) {
            return next(new ApiError(429, 'Rate limit exceeded. Please try again later.'));
        }

        data.count++;
        attempts.set(key, data);
        next();
    };
};

module.exports = {
    loginRateLimiter,
    registerRateLimiter,
    clearRateLimit,
    createRateLimiter
};
