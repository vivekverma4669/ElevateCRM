import { getRedisClient } from '../config/redis';

const DEFAULT_TTL = 300; // 5 minutes

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const data = await redis.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch {
      // Cache failures are non-fatal
    }
  },

  async del(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch {
      // Cache failures are non-fatal
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Cache failures are non-fatal
    }
  },

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(`blacklist:${token}`, expiresIn, '1');
    } catch {
      // Non-fatal
    }
  },
};

export const CACHE_KEYS = {
  dashboard: (userId: string) => `dashboard:${userId}`,
  leads: (userId: string, query: string) => `leads:${userId}:${query}`,
  lead: (id: string) => `lead:${id}`,
  analytics: (userId: string) => `analytics:${userId}`,
  aiResponse: (hash: string) => `ai:${hash}`,
};
