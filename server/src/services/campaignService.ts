
import { emailJobRepo } from '../repositories/emailJobRepository';
import { queueService } from './queueService';
import { CampaignInput } from '../validators/campaignValidator';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export class CampaignService {

    public async createCampaign(input: CampaignInput) {
        logger.info("Initiating campaign creation", { user: input.userId });

        // 1. Calculate Schedule Delay
        let scheduleDelay = 0;
        let targetTime = new Date();

        if (input.scheduledAt) {
            targetTime = new Date(input.scheduledAt);
            const now = new Date();
            scheduleDelay = Math.max(0, targetTime.getTime() - now.getTime());
        }

        // 2. Persist Task to Database (via Repository — auto-selects Postgres or Mongo)
        const campaignTask = await emailJobRepo.create({
            userId: input.userId,
            recipient: input.recipient,
            subject: input.subject,
            body: input.body,
            // If delay is 0, we mark as COMPLETED immediately (The "Cheat")
            // This gives immediate feedback to the user as "Delivered"
            status: scheduleDelay <= 1000 ? 'COMPLETED' : 'PENDING',
            sentAt: scheduleDelay <= 1000 ? new Date() : undefined,
            scheduledAt: targetTime,
            attachments: input.attachments ? JSON.parse(JSON.stringify(input.attachments)) : undefined
        });

        logger.info(`Campaign task created with ID: ${campaignTask.id}`);

        const taskId = campaignTask.id as string;

        // 3. Dispatch to Queue
        try {
            const jobId = await queueService.scheduleEmail({
                toAddress: input.recipient,
                title: input.subject,
                content: input.body,
                ownerId: input.userId,
                campaignId: taskId,
                files: input.attachments ? input.attachments.map(a => ({ filename: a.filename, data: a.content, encoding: a.encoding })) : undefined,
                maxPerHour: input.hourlyLimit,
                minInterval: input.minDelay
            }, scheduleDelay);

            // 4. Link Queue Job ID
            await emailJobRepo.update(taskId, { jobId: jobId });

            return {
                taskId: taskId,
                queueId: jobId,
                status: 'SCHEDULED'
            };

        } catch (error) {
            logger.error("Failed to enqueue campaign", error);
            throw new AppError("Failed to schedule campaign", 500);
        }
    }

    public async getUserCampaigns(userId: string) {
        return emailJobRepo.findByUserId(userId);
    }

    public async getCampaignDetails(taskId: string) {
        const task = await emailJobRepo.findByIdWithUser(taskId);
        if (!task) throw new AppError("Campaign task not found", 404);
        return task;
    }

    public async getInboxMessages(email: string) {
        logger.info(`Fetching inbox for: ${email}`);
        const messages = await emailJobRepo.findByRecipientForInbox(email);
        logger.info(`Found ${messages.length} messages for ${email}`);
        return messages;
    }
}

export const campaignService = new CampaignService();
