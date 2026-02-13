import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const environmentSchema = z.object({
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    CLIENT_URL: z.string().default('http://localhost:3001'),
    JWT_SECRET: z.string().default('supersecret'),
    WORKER_CONCURRENCY: z.string().default('5'),
    MAX_EMAILS_PER_HOUR: z.string().default('10'),
});

const parsedEnv = environmentSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Critical: Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}

const envCols = parsedEnv.data;

export const config = {
    port: parseInt(envCols.PORT, 10),
    databaseUrl: envCols.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    redis: {
        host: envCols.REDIS_HOST,
        port: parseInt(envCols.REDIS_PORT, 10),
    },
    google: {
        clientId: envCols.GOOGLE_CLIENT_ID,
        clientSecret: envCols.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${envCols.PORT}/api/auth/google/callback`
    },
    clientUrl: envCols.CLIENT_URL,
    jwtSecret: envCols.JWT_SECRET,
    workerConcurrency: parseInt(envCols.WORKER_CONCURRENCY, 10),
    maxEmailsPerHour: parseInt(envCols.MAX_EMAILS_PER_HOUR, 10)
};
