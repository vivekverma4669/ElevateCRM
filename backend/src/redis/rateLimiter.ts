import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export function createRedisRateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedisClient();
      const identifier = req.user?.userId ?? req.ip ?? 'anonymous';
      const key = `ratelimit:${options.keyPrefix}:${identifier}`;
      const windowSecs = Math.ceil(options.windowMs / 1000);

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSecs);
      }

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - current));
      res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

      if (current > options.max) {
        sendError(res, options.message ?? 'Too many requests', 429);
        return;
      }

      next();
    } catch {
      // If Redis fails, allow the request
      next();
    }
  };
}

export const aiRateLimiter = createRedisRateLimiter({
  windowMs: parseInt(env.AI_RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.AI_RATE_LIMIT_MAX),
  keyPrefix: 'ai',
  message: 'AI rate limit exceeded. Please wait before making more AI requests.',
});
