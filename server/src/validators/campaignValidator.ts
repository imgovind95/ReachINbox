import { z } from 'zod';

export const CreateCampaignSchema = z.object({
    recipient: z.string().email({ message: "Invalid email address" }),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body content is required"),
    userId: z.string().min(1, "Invalid User ID"),
    scheduledAt: z.string().optional(),
    hourlyLimit: z.number().positive().optional(),
    minDelay: z.number().nonnegative().optional(),
    attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(), // Base64
        encoding: z.string().optional()
    })).optional()
});

export type CampaignInput = z.infer<typeof CreateCampaignSchema>;
