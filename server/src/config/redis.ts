import Redis from 'ioredis';
import { config } from './env';

const redisOptions = {
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => Math.min(times * 50, 2000)
};

export const createRedisConnection = () => {
    return config.redisUrl
        ? new Redis(config.redisUrl, redisOptions)
        : new Redis({
            ...redisOptions,
            host: config.redis.host,
            port: config.redis.port,
        });
};

export const redisConnection = createRedisConnection();

redisConnection.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
    console.log('Connected to Redis');
});
