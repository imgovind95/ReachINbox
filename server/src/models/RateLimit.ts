import { Schema, model } from 'mongoose';
import { randomUUID } from 'crypto';

const RateLimitSchema = new Schema(
    {
        _id: { type: String, default: () => randomUUID() },
        userId: { type: String, required: true },
        windowStart: { type: Date, required: true },
        count: { type: Number, default: 0 },
    },
    {
        _id: false,
        toJSON: {
            virtuals: true,
            transform: (_doc: any, ret: any) => {
                ret['id'] = ret._id;
                return ret;
            },
        },
    }
);

// Same unique constraint as Prisma: @@unique([userId, windowStart])
RateLimitSchema.index({ userId: 1, windowStart: 1 }, { unique: true });

export const MongoRateLimit = model('RateLimit', RateLimitSchema);
