import mongoose from 'mongoose';
import User from '../features/auth/userModel';
import logger from '../shared/utils/logger';

export interface MigrationResult {
  totalScanned: number;
  matchedMissingOrInvalid: number;
  updatedCount: number;
  dryRun: boolean;
  errors: string[];
  durationMs: number;
}

export const runBackfillAuthorizationVersion = async (options: { dryRun?: boolean } = {}): Promise<MigrationResult> => {
  const startTime = Date.now();
  const dryRun = options.dryRun ?? false;
  const errors: string[] = [];

  logger.info(`[Migration 001] Starting User.authorizationVersion backfill (dryRun: ${dryRun})`);

  // Guarded filter: detects missing, null, or invalid non-positive versions
  const targetFilter = {
    $or: [
      { authorizationVersion: { $exists: false } },
      { authorizationVersion: null },
      { authorizationVersion: { $lt: 1 } },
      { authorizationVersion: { $type: 'string' } },
    ],
  };

  const totalScanned = await User.countDocuments({});
  const matchedMissingOrInvalid = await User.countDocuments(targetFilter);

  logger.info(`[Migration 001] Total users in collection: ${totalScanned}, Matched for backfill: ${matchedMissingOrInvalid}`);

  let updatedCount = 0;

  if (!dryRun && matchedMissingOrInvalid > 0) {
    try {
      const updateResult = await User.updateMany(
        targetFilter,
        {
          $set: {
            authorizationVersion: 1,
          },
        }
      );
      updatedCount = updateResult.modifiedCount;
      logger.info(`[Migration 001] Successfully updated ${updatedCount} user documents to authorizationVersion: 1`);
    } catch (err: any) {
      const errMsg = `Update failed: ${err?.message || err}`;
      errors.push(errMsg);
      logger.error(`[Migration 001] ${errMsg}`);
    }
  } else if (dryRun) {
    logger.info(`[Migration 001] Dry-run complete. ${matchedMissingOrInvalid} documents would be set to authorizationVersion: 1`);
  }

  const durationMs = Date.now() - startTime;
  return {
    totalScanned,
    matchedMissingOrInvalid,
    updatedCount,
    dryRun,
    errors,
    durationMs,
  };
};

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-campus-recruitment';

  mongoose.connect(mongoUri)
    .then(async () => {
      const res = await runBackfillAuthorizationVersion({ dryRun: isDryRun });
      logger.info(`[Migration 001 CLI] Finished: ${JSON.stringify(res, null, 2)}`);
      await mongoose.disconnect();
      process.exit(res.errors.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      logger.error(`[Migration 001 CLI] Connection error: ${err.message}`);
      process.exit(1);
    });
}

