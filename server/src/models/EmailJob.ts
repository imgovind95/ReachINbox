import { Schema, model } from 'mongoose';
import { randomUUID } from 'crypto';

const EmailJobSchema = new Schema(
    {
        _id: { type: String, default: () => randomUUID() },
        userId: { type: String, required: true, index: true },
        recipient: { type: String, required: true },
        subject: { type: String, required: true },
        body: { type: String, required: true },
        status: { type: String, default: 'PENDING', index: true }, // PENDING | COMPLETED | FAILED | DELAYED
        scheduledAt: { type: Date, required: true },
        sentAt: { type: Date, default: null },
        messageId: { type: String, default: null },
        jobId: { type: String, default: null },
        attachments: { type: Schema.Types.Mixed, default: null }, // JSON equivalent
        previewUrl: { type: String, default: null },
    },
    {
        _id: false,
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        toJSON: {
            virtuals: true,
            transform: (_doc: any, ret: any) => {
                ret['id'] = ret._id;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc: any, ret: any) => {
                ret['id'] = ret._id;
                return ret;
            },
        },
    }
);

// Compound index for inbox queries
EmailJobSchema.index({ recipient: 1, status: 1 });

export const MongoEmailJob = model('EmailJob', EmailJobSchema);
