import User from "../models/User";
import logger from "../config/logger";

const RETENTION_DAYS = 30;

/**
 * Hard-deletes users whose status is "deleted" and deletedAt is older than RETENTION_DAYS.
 * Runs on a schedule — call startPurgeJob() once at server startup.
 */
export const purgeDeletedUsers = async (): Promise<void> => {
    try {
        const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

        const result = await User.deleteMany({
            status: "deleted",
            deletedAt: { $lte: cutoff },
        });

        if (result.deletedCount > 0) {
            logger.info(`[PurgeJob] Hard-deleted ${result.deletedCount} user(s) past ${RETENTION_DAYS}-day retention.`);
        }
    } catch (err) {
        logger.error("[PurgeJob] Failed to purge deleted users:", err);
    }
};

/**
 * Starts the purge job — runs immediately on startup, then every 24 hours.
 */
export const startPurgeJob = (): void => {
    purgeDeletedUsers(); // run once immediately on startup
    setInterval(purgeDeletedUsers, 24 * 60 * 60 * 1000);
    logger.info("[PurgeJob] Scheduled: deleted users purged every 24h after 30-day retention.");
};
