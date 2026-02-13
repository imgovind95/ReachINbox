export interface Attachment {
    filename: string;
    encoding?: string;
    content: string; // Base64
}

// Renamed and reordered
export interface BackgroundJobData {
    emailJobId: string; // DB ID
    userId: string;
    recipient: string;
    subject: string;
    body: string;
    attachments?: Attachment[];
    minDelay?: number;
    hourlyLimit?: number;
}

export interface ScheduleEmailRequest {
    userId: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledAt?: string;
    attachments?: Attachment[];
    hourlyLimit?: number;
    minDelay?: number;
}

export interface ScheduleEmailResponse {
    success: boolean;
    message: string;
    jobId: string;
}
