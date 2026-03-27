import { db } from '../config/db';
import { getActiveDb } from '../config/dbManager';
import { MongoEmailJob } from '../models/EmailJob';
import { MongoUser } from '../models/User';
import { logger } from '../utils/logger';

// ─── Mongo Mirror Fail Counter (User's Addition) ──────────────
let mongoMirrorFailCount = 0;

export function getMongoMirrorFailCount(): number {
    return mongoMirrorFailCount;
}

export function resetMongoMirrorFailCount(): void {
    mongoMirrorFailCount = 0;
}

/**
 * Fire-and-forget: write a copy to MongoDB when Postgres is primary.
 * Keeps Mongo in sync so no data loss if Postgres dies again.
 */
async function mirrorToMongo(data: any, operation: 'create' | 'update', id?: string) {
    try {
        if (operation === 'create') {
            await MongoEmailJob.findOneAndUpdate(
                { _id: data.id || id },
                { $set: data },
                { upsert: true }
            );
        } else if (operation === 'update' && id) {
            await MongoEmailJob.findByIdAndUpdate(id, { $set: data });
        }
    } catch (err) {
        mongoMirrorFailCount++;
        logger.warn(`[EmailJobRepo] Mongo mirror failed (total fails: ${mongoMirrorFailCount})`, err);
    }
}

/**
 * EmailJob Repository — uses Postgres when healthy+synced, otherwise MongoDB.
 * In Phase 3 (Postgres active), also mirrors writes to MongoDB (write-through).
 */
export const emailJobRepo = {

    async create(data: {
        userId: string;
        recipient: string;
        subject: string;
        body: string;
        status?: string;
        sentAt?: Date;
        scheduledAt: Date;
        attachments?: any;
    }) {
        if (getActiveDb() === 'postgres') {
            const result = await db.emailJob.create({ data });
            // Write-through mirror to Mongo (non-blocking)
            mirrorToMongo({ _id: result.id, ...data }, 'create', result.id);
            return result;
        }
        const mongoResult = await MongoEmailJob.create(data);
        return mongoResult.toObject();
    },

    async update(id: string, data: Record<string, any>) {
        if (getActiveDb() === 'postgres') {
            const result = await db.emailJob.update({ where: { id }, data });
            mirrorToMongo(data, 'update', id);
            return result;
        }
        const result = await MongoEmailJob.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        return result ? { ...result, id: result._id } : null;
    },

    async findById(id: string) {
        if (getActiveDb() === 'postgres') {
            return db.emailJob.findUnique({ where: { id } });
        }
        const result = await MongoEmailJob.findById(id).lean();
        return result ? { ...result, id: result._id } : null;
    },

    async findByIdWithUser(id: string) {
        if (getActiveDb() === 'postgres') {
            return db.emailJob.findUnique({
                where: { id },
                include: { user: { select: { name: true, email: true, avatar: true } } },
            });
        }
        // MongoDB: manual join
        const job = await MongoEmailJob.findById(id).lean();
        if (!job) return null;

        const user = await MongoUser.findById(job.userId).lean();

        return {
            ...job,
            id: job._id,
            user: user ? { name: user.name, email: user.email, avatar: user.avatar } : null,
        };
    },

    async findByUserId(userId: string) {
        if (getActiveDb() === 'postgres') {
            return db.emailJob.findMany({
                where: { userId },
                orderBy: { scheduledAt: 'desc' },
            });
        }
        const results = await MongoEmailJob.find({ userId }).sort({ scheduledAt: -1 }).lean();
        return results.map(r => ({ ...r, id: r._id }));
    },

    async findByRecipientForInbox(email: string) {
        if (getActiveDb() === 'postgres') {
            return db.emailJob.findMany({
                where: {
                    recipient: { equals: email, mode: 'insensitive' },
                    OR: [
                        { status: { in: ['COMPLETED', 'FAILED'] } },
                        {
                            status: { in: ['PENDING', 'DELAYED'] },
                            scheduledAt: { lte: new Date() },
                        },
                    ],
                },
                include: {
                    user: { select: { name: true, email: true, avatar: true } },
                },
                orderBy: { sentAt: 'desc' },
            });
        }

        // MongoDB: case-insensitive regex + manual user join
        const jobs = await MongoEmailJob.find({
            recipient: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') },
            $or: [
                { status: { $in: ['COMPLETED', 'FAILED'] } },
                {
                    status: { $in: ['PENDING', 'DELAYED'] },
                    scheduledAt: { $lte: new Date() },
                },
            ],
        })
            .sort({ sentAt: -1 })
            .lean();

        // Batch-load unique users
        const userIds = [...new Set(jobs.map(j => j.userId))];
        const users = await MongoUser.find({ _id: { $in: userIds } }).lean();
        const userMap = new Map(users.map((u: any) => [u._id, u]));

        return jobs.map(job => {
            const user: any = userMap.get(job.userId);
            return {
                ...job,
                id: job._id,
                user: user ? { name: user.name, email: user.email, avatar: user.avatar } : null,
            };
        });
    },
};

/** Escape special regex characters in email input */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
