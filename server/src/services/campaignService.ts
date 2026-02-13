
import { prisma } from '../config/db';
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

        // 2. Persist Task to Database
        const campaignTask = await prisma.emailJob.create({
            data: {
                userId: input.userId,
                recipient: input.recipient,
                subject: input.subject,
                body: input.body,
                // If delay is 0, we mark as COMPLETED immediately strictly for the DB record logic
                // But in reality, the worker will define the final status. 
                // We'll stick to PENDING for consistency with new flow, or match old logic if needed.
                // Old logic: status: executionDelay === 0 ? 'COMPLETED' : 'PENDING'
                status: scheduleDelay === 0 ? 'COMPLETED' : 'PENDING',
                sentAt: scheduleDelay === 0 ? new Date() : undefined,
                scheduledAt: targetTime,
                attachments: input.attachments ? JSON.parse(JSON.stringify(input.attachments)) : undefined
            }
        });

        logger.info(`Campaign task created with ID: ${campaignTask.id}`);

        // 3. Dispatch to Queue
        try {
            const jobId = await queueService.scheduleEmail({
                toAddress: input.recipient,
                title: input.subject,
                content: input.body,
                ownerId: input.userId,
                campaignId: campaignTask.id,
                files: input.attachments ? input.attachments.map(a => ({ filename: a.filename, data: a.content, encoding: a.encoding })) : undefined,
                maxPerHour: input.hourlyLimit,
                minInterval: input.minDelay
            }, scheduleDelay);

            // 4. Link Queue Job ID
            await prisma.emailJob.update({
                where: { id: campaignTask.id },
                data: { jobId: jobId }
            });

            return {
                taskId: campaignTask.id,
                queueId: jobId,
                status: 'SCHEDULED'
            };

        } catch (error) {
            logger.error("Failed to enqueue campaign", error);
            throw new AppError("Failed to schedule campaign", 500);
        }
    }

    public async getUserCampaigns(userId: string) {
        return prisma.emailJob.findMany({
            where: { userId },
            orderBy: { scheduledAt: 'desc' }
        });
    }

    public async getCampaignDetails(taskId: string) {
        const task = await prisma.emailJob.findUnique({
            where: { id: taskId },
            include: { user: { select: { name: true, email: true, avatar: true } } }
        });

        if (!task) throw new AppError("Campaign task not found", 404);
        return task;
    }

    public async getInboxMessages(email: string) {
        return prisma.emailJob.findMany({
            where: {
                recipient: { equals: email, mode: 'insensitive' },
                OR: [
                    { status: 'COMPLETED' },
                    {
                        status: { in: ['PENDING', 'DELAYED'] },
                        scheduledAt: { lte: new Date() }
                    }
                ]
            },
            include: {
                user: {
                    select: { name: true, email: true, avatar: true }
                }
            },
            orderBy: { sentAt: 'desc' }
        });
    }
}

export const campaignService = new CampaignService();
