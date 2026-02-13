const { PrismaClient } = require('@prisma/client');

async function verifyDatabaseParams() {
    const client = new PrismaClient();
    try {
        console.log("Verifying database connection parameters...");
        await client.$connect();
        console.log("Connection successful. Database is ready.");
    } catch (e) {
        console.error("Connection failed:", e);
        process.exit(1);
    } finally {
        await client.$disconnect();
    }
}

verifyDatabaseParams();
