import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';

let redis: Redis;

export function getRedisClient(): Redis {
  if (!redis) {
    const options: RedisOptions = {
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
    };

    if (env.REDIS_PASSWORD) {
      options.password = env.REDIS_PASSWORD;
    }

    if (env.REDIS_TLS === 'true') {
      options.tls = {};
    }

    redis = new Redis(env.REDIS_URL, options);

    redis.on('connect', () => console.log('✅ Redis connected'));
    redis.on('error', (err) => console.error('Redis error:', err));
    redis.on('close', () => console.warn('Redis connection closed'));
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
}

export default getRedisClient;
