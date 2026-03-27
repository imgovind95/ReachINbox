import { db } from './db';
import { isMongoConnected } from './mongodb';
import { logger } from '../utils/logger';

// Lazy import to break circular dependency: db.ts → dbManager.ts → syncManager.ts → db.ts
async function runSync() {
    const { syncMongoToPostgres } = await import('./syncManager');
    return syncMongoToPostgres();
}

// ─── State Flags ───────────────────────────────────────────────
let activeDb: 'postgres' | 'mongo' = 'mongo'; // Default: Mongo (safe start)
let postgresHealthy = false;
let isSyncComplete = false;
let syncInProgress = false;
let postgresDownSince: Date | null = new Date(); // Assume down at start
let lastSyncAt: Date | null = null;
let syncRetryCount = 0;

// ─── Configuration ─────────────────────────────────────────────
const HEALTH_CHECK_INTERVAL = parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000', 10);
const MAX_SYNC_RETRIES = parseInt(process.env.MAX_SYNC_RETRIES || '5', 10);

// ─── Public Getters ────────────────────────────────────────────

/**
 * Returns the currently active database for EmailJob operations.
 * Returns "postgres" ONLY if Postgres is healthy AND sync is complete.
 */
export function getActiveDb(): 'postgres' | 'mongo' {
    return activeDb;
}

/**
 * Auth database — ALWAYS returns "mongo".
 * Users are always stored/read from MongoDB so login never fails.
 */
export function getAuthDb(): 'mongo' {
    return 'mongo';
}

/** Is PostgreSQL currently responding? */
export function isPostgresHealthy(): boolean {
    return postgresHealthy;
}

/** Full sync status object for /health endpoint. */
export function getSyncStatus() {
    return {
        activeDb,
        postgresHealthy,
        mongoConnected: isMongoConnected(),
        isSyncComplete,
        syncInProgress,
        syncRetryCount,
        maxSyncRetries: MAX_SYNC_RETRIES,
        postgresDownSince,
        lastSyncAt,
    };
}

// ─── Health Check Logic ────────────────────────────────────────

async function checkPostgresHealth(): Promise<boolean> {
    try {
        await db.$queryRaw`SELECT 1`;
        return true;
    } catch {
        return false;
    }
}

async function healthCheckLoop() {
    const wasHealthy = postgresHealthy;
    postgresHealthy = await checkPostgresHealth();

    if (postgresHealthy && !wasHealthy) {
        // ── Postgres JUST recovered ──
        logger.info('🟢 PostgreSQL is back online!');
        postgresDownSince = null;

        if (!isSyncComplete && !syncInProgress && syncRetryCount < MAX_SYNC_RETRIES) {
            // Trigger sync
            syncInProgress = true;
            syncRetryCount++;
            logger.info(`🔄 Starting Mongo → Postgres sync (attempt ${syncRetryCount}/${MAX_SYNC_RETRIES})...`);

            try {
                const result = await runSync();
                isSyncComplete = true;
                activeDb = 'postgres';
                lastSyncAt = new Date();
                syncRetryCount = 0; // Reset on success
                logger.info(`✅ Sync complete! ${result.users} users, ${result.emailJobs} emailJobs synced. Active DB → PostgreSQL`);
            } catch (err) {
                syncInProgress = false;
                logger.error(`❌ Sync failed (attempt ${syncRetryCount}/${MAX_SYNC_RETRIES})`, err);

                if (syncRetryCount >= MAX_SYNC_RETRIES) {
                    logger.error(`🚫 Max sync retries (${MAX_SYNC_RETRIES}) reached. Staying on MongoDB. Manual intervention needed.`);
                }
            } finally {
                syncInProgress = false;
            }
        } else if (isSyncComplete) {
            // Already synced, just set active
            activeDb = 'postgres';
        }

    } else if (!postgresHealthy && wasHealthy) {
        // ── Postgres JUST went down ──
        logger.warn('🔴 PostgreSQL is DOWN! Falling back to MongoDB.');
        activeDb = 'mongo';
        isSyncComplete = false;
        postgresDownSince = new Date();

    } else if (!postgresHealthy) {
        // Still down — stay on Mongo
        activeDb = 'mongo';
    }
}

// ─── Start / Stop ──────────────────────────────────────────────

let healthCheckTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the background health-check loop.
 * Call once during server startup.
 */
export function startHealthCheckLoop() {
    // Run immediately on start
    healthCheckLoop();

    healthCheckTimer = setInterval(healthCheckLoop, HEALTH_CHECK_INTERVAL);
    logger.info(`[DBManager] Health check loop started (interval: ${HEALTH_CHECK_INTERVAL}ms, max sync retries: ${MAX_SYNC_RETRIES})`);
}

export function stopHealthCheckLoop() {
    if (healthCheckTimer) {
        clearInterval(healthCheckTimer);
        healthCheckTimer = null;
    }
}
