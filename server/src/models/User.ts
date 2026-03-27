import { Schema, model } from 'mongoose';
import { randomUUID } from 'crypto';

const UserSchema = new Schema(
    {
        _id: { type: String, default: () => randomUUID() },
        email: { type: String, required: true, unique: true },
        name: { type: String, default: null },
        avatar: { type: String, default: null },
        googleId: { type: String, default: null, unique: true, sparse: true },
    },
    {
        _id: false, // We manage _id ourselves (UUID)
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        toJSON: {
            virtuals: true,
            transform: (_doc: any, ret: any) => {
                ret['id'] = ret._id; // Map _id → id for Prisma compatibility
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc: any, ret: any) => {
                ret.id = ret._id;
                return ret;
            },
        },
    }
);

export const MongoUser = model('User', UserSchema);
