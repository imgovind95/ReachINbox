import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
let retryCount = 0;

/**
 * Connect to MongoDB Atlas with auto-retry logic.
 * Called once on server startup.
 */
export async function connectMongoDB(): Promise<void> {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
        logger.warn('MONGODB_URL not set — MongoDB fallback will NOT be available');
        return;
    }

    mongoose.connection.on('connected', () => {
        retryCount = 0;
        logger.info('[MongoDB] Connection established successfully');
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('[MongoDB] Disconnected');
    });

    mongoose.connection.on('error', (err) => {
        logger.error('[MongoDB] Connection error', err);
    });

    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            heartbeatFrequencyMS: 10000,
        });

        // Drop stale unique index on googleId if it exists (was removed from schema)
        try {
            const usersCollection = mongoose.connection.collection('users');
            await usersCollection.dropIndex('googleId_1');
            logger.info('[MongoDB] Dropped stale unique index on googleId');
        } catch {
            // Index doesn't exist — all good
        }
    } catch (err) {
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
            logger.warn(`[MongoDB] Connection failed, retry ${retryCount}/${MAX_RETRIES} in 3s...`);
            await new Promise(r => setTimeout(r, 3000));
            return connectMongoDB();
        }
        logger.error(`[MongoDB] Failed to connect after ${MAX_RETRIES} retries`, err);
        throw err;
    }
}

/**
 * Check if Mongoose connection is currently ready.
 */
export function isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
}
