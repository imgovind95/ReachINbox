import { db } from './db';
import { MongoUser } from '../models/User';
import { MongoEmailJob } from '../models/EmailJob';
import { MongoRateLimit } from '../models/RateLimit';
import { logger } from '../utils/logger';

const BATCH_SIZE = 100;

interface SyncResult {
    users: number;
    emailJobs: number;
    rateLimits: number;
}

/**
 * Sync all data from MongoDB → PostgreSQL using batched UPSERTs.
 * Uses a watermark-based catch-up to avoid missing records created during sync.
 * 
 * Returns count of records synced per collection.
 */
export async function syncMongoToPostgres(): Promise<SyncResult> {
    const syncStartedAt = new Date();
    let totalUsers = 0;
    let totalJobs = 0;
    let totalRateLimits = 0;

    // ─── Phase 1: Bulk Sync ────────────────────────────────────
    logger.info('[SyncManager] Phase 1: Bulk sync starting...');

    // Sync Users
    totalUsers += await syncBatched(
        MongoUser,
        async (batch) => {
            for (const user of batch) {
                await db.user.upsert({
                    where: { id: user._id },
                    update: {
                        email: user.email,
                        name: user.name || null,
                        avatar: user.avatar || null,
                        googleId: user.googleId || null,
                    },
                    create: {
                        id: user._id,
                        email: user.email,
                        name: user.name || null,
                        avatar: user.avatar || null,
                        googleId: user.googleId || null,
                    },
                });
            }
        },
        'Users'
    );

    // Sync EmailJobs
    totalJobs += await syncBatched(
        MongoEmailJob,
        async (batch) => {
            for (const job of batch) {
                await db.emailJob.upsert({
                    where: { id: job._id },
                    update: {
                        userId: job.userId,
                        recipient: job.recipient,
                        subject: job.subject,
                        body: job.body,
                        status: job.status,
                        scheduledAt: job.scheduledAt,
                        sentAt: job.sentAt || null,
                        messageId: job.messageId || null,
                        jobId: job.jobId || null,
                        attachments: job.attachments || undefined,
                        previewUrl: job.previewUrl || null,
                    },
                    create: {
                        id: job._id,
                        userId: job.userId,
                        recipient: job.recipient,
                        subject: job.subject,
                        body: job.body,
                        status: job.status,
                        scheduledAt: job.scheduledAt,
                        sentAt: job.sentAt || null,
                        messageId: job.messageId || null,
                        jobId: job.jobId || null,
                        attachments: job.attachments || undefined,
                        previewUrl: job.previewUrl || null,
                    },
                });
            }
        },
        'EmailJobs'
    );

    // Sync RateLimits
    totalRateLimits += await syncBatched(
        MongoRateLimit,
        async (batch) => {
            for (const rl of batch) {
                await db.rateLimit.upsert({
                    where: {
                        userId_windowStart: {
                            userId: rl.userId,
                            windowStart: rl.windowStart,
                        },
                    },
                    update: { count: rl.count },
                    create: {
                        id: rl._id,
                        userId: rl.userId,
                        windowStart: rl.windowStart,
                        count: rl.count,
                    },
                });
            }
        },
        'RateLimits'
    );

    // ─── Phase 2: Watermark Catch-up ───────────────────────────
    // Sync any records created/updated DURING Phase 1
    logger.info('[SyncManager] Phase 2: Watermark catch-up (records created during sync)...');

    const missedUsers = await MongoUser.find({ updatedAt: { $gte: syncStartedAt } }).lean();
    for (const user of missedUsers) {
        await db.user.upsert({
            where: { id: user._id },
            update: {
                email: user.email,
                name: user.name || null,
                avatar: user.avatar || null,
                googleId: user.googleId || null,
            },
            create: {
                id: user._id,
                email: user.email,
                name: user.name || null,
                avatar: user.avatar || null,
                googleId: user.googleId || null,
            },
        });
    }
    totalUsers += missedUsers.length;

    const missedJobs = await MongoEmailJob.find({ updatedAt: { $gte: syncStartedAt } }).lean();
    for (const job of missedJobs) {
        await db.emailJob.upsert({
            where: { id: job._id },
            update: {
                userId: job.userId,
                recipient: job.recipient,
                subject: job.subject,
                body: job.body,
                status: job.status,
                scheduledAt: job.scheduledAt,
                sentAt: job.sentAt || null,
            },
            create: {
                id: job._id,
                userId: job.userId,
                recipient: job.recipient,
                subject: job.subject,
                body: job.body,
                status: job.status,
                scheduledAt: job.scheduledAt,
                sentAt: job.sentAt || null,
            },
        });
    }
    totalJobs += missedJobs.length;

    logger.info(`[SyncManager] ✅ Sync complete: ${totalUsers} users, ${totalJobs} emailJobs, ${totalRateLimits} rateLimits`);
    return { users: totalUsers, emailJobs: totalJobs, rateLimits: totalRateLimits };
}

// ─── Helper: Batched sync with cursor pagination ────────────────

async function syncBatched(
    MongoModel: any,
    upsertFn: (batch: any[]) => Promise<void>,
    label: string
): Promise<number> {
    let skip = 0;
    let totalSynced = 0;

    while (true) {
        const batch = await MongoModel.find().skip(skip).limit(BATCH_SIZE).lean();
        if (batch.length === 0) break;

        await upsertFn(batch);
        totalSynced += batch.length;
        skip += BATCH_SIZE;

        logger.debug(`[SyncManager] ${label}: Synced ${totalSynced} records so far...`);
    }

    logger.info(`[SyncManager] ${label}: Total synced = ${totalSynced}`);
    return totalSynced;
}
