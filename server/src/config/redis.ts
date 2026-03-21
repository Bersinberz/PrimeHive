import Redis from "ioredis";
import logger from "./logger";

let redis: Redis | null = null;
let redisAvailable = false;

const createRedisClient = () => {
    const client = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        enableOfflineQueue: false,
        retryStrategy: () => null, // disable auto-retry — we handle it manually
    });

    client.on("connect", () => {
        redisAvailable = true;
        logger.info("Redis connected");
    });

    client.on("error", () => {
        // Suppress repeated error logs — already warned on startup
    });

    return client;
};

export const connectRedis = async (): Promise<void> => {
    try {
        redis = createRedisClient();
        await redis.connect();
        redisAvailable = true;
    } catch {
        redisAvailable = false;
        redis = null;
        logger.warn("Redis unavailable — token revocation and stats cache disabled. Start Redis to enable these features.");
    }
};

export const disconnectRedis = async (): Promise<void> => {
    if (redis) {
        await redis.quit();
        redis = null;
    }
};

/**
 * Safe Redis get — returns null if Redis is unavailable.
 */
export const redisGet = async (key: string): Promise<string | null> => {
    if (!redisAvailable || !redis) return null;
    try {
        return await redis.get(key);
    } catch {
        return null;
    }
};

/**
 * Safe Redis set — no-op if Redis is unavailable.
 */
export const redisSet = async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
    if (!redisAvailable || !redis) return;
    try {
        if (ttlSeconds) {
            await redis.set(key, value, "EX", ttlSeconds);
        } else {
            await redis.set(key, value);
        }
    } catch {
        // ignore
    }
};

/**
 * Safe Redis del — no-op if Redis is unavailable.
 */
export const redisDel = async (key: string): Promise<void> => {
    if (!redisAvailable || !redis) return;
    try {
        await redis.del(key);
    } catch {
        // ignore
    }
};

export const isRedisAvailable = () => redisAvailable;
