import { createClient } from 'redis';
import logger from '../shared/utils/logger';

let isConnected = false;
const redisUrl = process.env.REDIS_URL;

export const redisClient = createClient({
  url: redisUrl || 'redis://localhost:6379',
  socket: { reconnectStrategy: (r) => (r > 3 ? new Error('Redis max retries') : Math.min(r * 500, 2000)) }
});

redisClient.on('connect', () => { isConnected = true; logger.info('[Redis] Connected'); });
redisClient.on('error', (err) => {
  isConnected = false;
  if (redisUrl && redisUrl !== 'none') {
    logger.warn(`[Redis] Error: ${err.message}`);
  }
});

export const connectRedis = async () => {
  if (!redisUrl || redisUrl === 'none' || redisUrl === '') {
    logger.info('[Redis] REDIS_URL not configured; operating in standalone mode (MongoDB sessions & in-memory rate limiting).');
    return;
  }
  try {
    await redisClient.connect();
  } catch (err: any) {
    logger.warn(`[Redis] Warning: ${err.message} (operating in standalone in-memory mode)`);
  }
};

export const getIsRedisConnected = () => isConnected;
