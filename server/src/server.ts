import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { redisConnection } from './config/redis';
import campaignRouter from './api/campaigns';
import authEndpoints from './api/authentication';
import './jobs/EmailProcessor'; // Initialize Background Processor
import { errorMiddleware } from './middlewares/errorMiddleware';
import { connectMongoDB } from './config/mongodb';
import { startHealthCheckLoop, getSyncStatus, isPostgresHealthy, getActiveDb } from './config/dbManager';
import { getMongoMirrorFailCount } from './repositories/emailJobRepository';

const apiServer = express();

apiServer.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            config.clientUrl,
            'https://reachinbox-chi.vercel.app',
            'https://reach-inbox-task-sable.vercel.app',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://reachi-9e87c38pc-govinds-projects-ef85b514.vercel.app',
            'https://reachi-nox.vercel.app'
        ];

        if (!origin || allowedOrigins.includes(origin) || /https:\/\/.*-govinds-projects-.*\.vercel\.app/.test(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
apiServer.use(express.json({ limit: '50mb' }));
apiServer.use(express.urlencoded({ limit: '50mb', extended: true }));
apiServer.use(morgan('dev'));

// Route Registration
apiServer.use('/api/schedule', campaignRouter);
apiServer.use('/api/auth', authEndpoints);

// ─── Health Endpoint (Enhanced with DB Status) ─────────────────
apiServer.get('/health', (req, res) => {
    res.json({
        status: 'active',
        redisState: redisConnection.status,
        database: {
            activeDb: getActiveDb(),
            postgresHealthy: isPostgresHealthy(),
            mongoMirrorFailCount: getMongoMirrorFailCount(),
            sync: getSyncStatus(),
        },
    });
});

// Error Handling Middleware
apiServer.use(errorMiddleware as any);

// ─── Startup Sequence ──────────────────────────────────────────
async function startServer() {
    // 1. Connect to MongoDB (primary DB)
    await connectMongoDB();
    console.log('[Startup] MongoDB connection initialized');

    // 2. Start Postgres health check loop (will detect when Postgres comes back)
    startHealthCheckLoop();
    console.log('[Startup] PostgreSQL health check loop started');

    // 3. Start Express server
    apiServer.listen(config.port, () => {
        console.log(`API Server initialized on port ${config.port}`);
        console.log(`Server Version: v2.0.0 - Dual-DB Fallback System (${new Date().toISOString()})`);
        console.log(`Active Database: ${getActiveDb()}`);
        console.log(`PostgreSQL URL: ${process.env.DATABASE_URL}`);
        console.log(`MongoDB URL: ${process.env.MONGODB_URL ? '✅ Configured' : '❌ NOT SET'}`);
    });
}

startServer().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
