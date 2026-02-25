import Redis from 'ioredis';
import { config } from './env';

const commonOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
        // Exponential backoff with a cap of 2000ms
        return Math.min(times * 50, 2000);
    }
};

/**
 * Initializes the Redis connection based on environment configuration.
 * Supports both URL-based and individual parameter-based connections.
 */
export const initializeRedis = () => {
    if (config.redisUrl) {
        return new Redis(config.redisUrl, commonOptions);
    }

    return new Redis({
        ...commonOptions,
        host: config.redis.host,
        port: config.redis.port,
    });
};

export const redisConnection = initializeRedis();
export const createRedisConnection = initializeRedis;

redisConnection.on('error', (err) => {
    console.error('[Redis] Connection Error:', err);
});

redisConnection.on('connect', () => {
    console.log('[Redis] Connection Established Successfully');
});
