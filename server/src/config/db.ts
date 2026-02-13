import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/reachinbox",
            },
        },
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
