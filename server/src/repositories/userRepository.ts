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
        const updatePayload: any = {};
        if (data.googleId !== undefined) updatePayload.googleId = data.googleId;
        if (data.name && data.name !== 'undefined') updatePayload.name = data.name;
        if (data.avatar !== undefined) updatePayload.avatar = data.avatar;

        const user = await MongoUser.findOneAndUpdate(
            { email },
            {
                $set: updatePayload,
                $setOnInsert: {
                    email,
                    name: data.name || email.split('@')[0],
                    avatar: data.avatar || null,
                    googleId: data.googleId || null,
                },
            },
            { upsert: true, new: true, runValidators: true }
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
