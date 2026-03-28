import { redisGet, redisSet, redisDel } from "../config/redis";
import logger from "../config/logger";

export const CACHE_TTL = {
  PRODUCTS_LIST:    5  * 60,  // 5 min
  PRODUCT_DETAIL:   10 * 60,  // 10 min
  OFFERS:           5  * 60,  // 5 min
  PUBLIC_SETTINGS:  15 * 60,  // 15 min
  CATEGORIES:       10 * 60,  // 10 min
  DASHBOARD_STATS:  2  * 60,  // 2 min
};

/**
 * Get a cached value, parsed from JSON.
 * Returns null on miss or error.
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await redisGet(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn(`Cache get failed for key "${key}":`, err);
    return null;
  }
};

/**
 * Set a value in cache, serialized as JSON.
 */
export const cacheSet = async (key: string, value: unknown, ttl: number): Promise<void> => {
  try {
    await redisSet(key, JSON.stringify(value), ttl);
  } catch (err) {
    logger.warn(`Cache set failed for key "${key}":`, err);
  }
};

/**
 * Delete one or more cache keys.
 */
export const cacheDel = async (...keys: string[]): Promise<void> => {
  await Promise.allSettled(keys.map(k => redisDel(k)));
};

/**
 * Cache-aside helper: returns cached value if present, otherwise calls loader,
 * caches the result, and returns it.
 */
export const cacheAside = async <T>(
  key: string,
  ttl: number,
  loader: () => Promise<T>
): Promise<T> => {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const data = await loader();
  await cacheSet(key, data, ttl);
  return data;
};
