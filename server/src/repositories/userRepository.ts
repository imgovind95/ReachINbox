import { MongoUser } from '../models/User';
import { logger } from '../utils/logger';

/**
 * User Repository — ALWAYS uses MongoDB.
 * Auth never fails, regardless of PostgreSQL status.
 */
export const userRepo = {

    async upsertByEmail(email: string, data: {
        googleId?: string | null;
        name?: string | null;
        avatar?: string | null;
    }) {
        // Build $set payload — this handles BOTH insert and update cases
        const setPayload: any = {
            email,
            googleId: data.googleId ?? null,
            name: (data.name && data.name !== 'undefined') ? data.name : email.split('@')[0],
            avatar: data.avatar ?? null,
        };

        const user = await MongoUser.findOneAndUpdate(
            { email },
            { $set: setPayload },
            { upsert: true, returnDocument: 'after', runValidators: true }
        ).lean();

        return { ...user, id: user!._id };
    },

    async findById(id: string) {
        const user = await MongoUser.findById(id).lean();
        if (!user) return null;
        return { ...user, id: user._id };
    },

    async updateById(id: string, data: {
        googleId?: string | null;
        avatar?: string | null;
        name?: string | null;
    }) {
        const user = await MongoUser.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        if (!user) return null;
        return { ...user, id: user._id };
    },
};
