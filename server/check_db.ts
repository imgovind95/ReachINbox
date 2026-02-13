
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log("No email provided, listing ALL jobs (limit 10)...");
    } else {
        console.log(`Checking jobs for recipient: ${email}`);
    }

    const jobs = await prisma.emailJob.findMany({
        where: email ? {
            recipient: { contains: email, mode: 'insensitive' }
        } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    console.log(`Found ${jobs.length} jobs.`);
    jobs.forEach(job => {
        console.log(`ID: ${job.id}`);
        console.log(`  Recipient: ${job.recipient}`);
        console.log(`  Subject: ${job.subject}`);
        console.log(`  Status: ${job.status}`);
        console.log(`  CreatedAt: ${job.createdAt}`);
        console.log(`  ScheduledAt: ${job.scheduledAt}`);
        console.log(`  SentAt: ${job.sentAt}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
