import mongoose from 'mongoose';
import logger from '../shared/utils/logger';

let mongoMemoryServer: any = null;

export const connectDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    logger.error('[MongoDB] FATAL: MONGODB_URI environment variable is strictly required in production.');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_campus_recruitment';
  const timeoutMs = process.env.MONGODB_TIMEOUT_MS ? Number(process.env.MONGODB_TIMEOUT_MS) : 5000;
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
    logger.info(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err: any) {
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    logger.warn(`[MongoDB] Primary connection to ${sanitizedUri} failed: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      try {
        logger.info('[MongoDB] Launching in-memory MongoDB server for local development/testing...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        logger.info(`[MongoDB] Connected to in-memory instance: ${conn.connection.host} (${memUri})`);
        return;
      } catch (memErr: any) {
        logger.error(`[MongoDB] Failed to launch in-memory MongoDB: ${memErr.message}`);
      }
    } else {
      logger.error('[MongoDB] FATAL: In-memory database fallback is strictly prohibited in production.');
    }
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

export default connectDatabase;
