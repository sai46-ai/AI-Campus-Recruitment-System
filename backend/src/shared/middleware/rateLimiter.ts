import rateLimit from 'express-rate-limit';

const createLimiter = (max: number, msg: string) => rateLimit({ windowMs: 900000, max, message: { success: false, message: msg }, standardHeaders: true, legacyHeaders: false });

export const apiRateLimiter = createLimiter(300, 'Too many requests. Try again after 15 minutes.');
export const authRateLimiter = createLimiter(20, 'Too many auth attempts. Try again after 15 minutes.');
