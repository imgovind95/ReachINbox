# ReachInbox Assignment - Email Scheduling System

## 1️⃣ Project Overview

This project implements a **production-grade email scheduling system** using **Express, BullMQ, Redis, and PostgreSQL**, with a modern **React/Next.js dashboard**.

The system supports **delayed email sending**, **concurrency control**, **hourly rate limiting**, and is designed to **survive server restarts** without losing any scheduled jobs.

**Core Idea:**
A robust backend that decouples email reception (Fast API) from email delivery (Reliable Worker) using a distributed message queue.

**High-Level Architecture:**
`User Request` → `API` → `Database (Store Record)` → `Redis Queue (BullMQ)` → `Worker (Process Job)` → `SMTP (Send Email)`

---

## 2️⃣ Tech Stack

### Backend
- **TypeScript**: Strictly typed codebase for reliability.
- **Express.js**: REST API framework.
- **BullMQ**: Distributed job queue for scheduling and processing.
- **Redis**: In-memory store for queues and rate-limiting counters.
- **PostgreSQL**: Primary database for user data and campaign logs.
- **Prisma**: ORM for type-safe database interactions.
- **Ethereal Email**: Mock SMTP service for testing email delivery.

### Frontend
- **React / Next.js 14**: Server-side rendering and static site generation.
- **TypeScript**: Component prop validation and state safety.
- **Tailwind CSS**: Utility-first styling for specific design requirements.

### Infrastructure
- **Docker**: Containerization for Redis and PostgreSQL services.

---

## 3️⃣ Architecture Overview

### 🔹 Email Scheduling Flow
1.  **User Action**: User schedules an email via the Frontend Dashboard.
2.  **API Layer**: The backend validates the request and stores the campaign details in **PostgreSQL** with a `PENDING` status.
3.  **Queueing**: A "delayed job" is added to **BullMQ** (Redis) with the specific execution time.
4.  **Processing**: When the scheduled time arrives, the **Worker** picks up the job.
5.  **Execution**: The worker sends the email using **Nodemailer** (via Ethereal/Exim).
6.  **Completion**: The job status is updated to `COMPLETED` in the database.

### 🔹 Persistence on Restart
The system is fully resilient to crashes or restarts:
- **Jobs**: BullMQ stores all scheduled jobs in **Redis** (Persistent).
- **Metadata**: Email content and logs are stored in **PostgreSQL**.
- **Recovery**: On server restart, the Worker automatically reconnects to Redis and resumes processing delayed jobs exactly where it left off. **No Cron jobs are used.**

### 🔹 Idempotency & Safety
To prevent duplicate emails:
- **Atomic Updates**: Database status is checked before sending.
- **Unique Job IDs**: BullMQ ensures a job is processed only once per ID.
- **Safe Retry**: If sending fails (e.g., SMTP timeout), the job is retried with exponential backoff, but only if it hasn't successfully completed.

---

## 4️⃣ Rate Limiting & Concurrency

### Worker Concurrency
- **Configurable**: The worker concurrency is set via the `WORKER_CONCURRENCY` environment variable (Default: 5).
- **Parallel Processing**: Multiple jobs are processed in parallel threads, ensuring high throughput without blocking the event loop.

### Delay Between Emails
- **Throttling**: A minimum delay (e.g., 2 seconds) is enforced between emails to prevent flooding the SMTP provider.
- **Implementation**: Handled via BullMQ's rate limiting features and custom worker logic.

### Hourly Rate Limiting
- **Mechanism**: We adhere to a `MAX_EMAILS_PER_HOUR` limit per user.
- **Redis Counter**: We use a Redis key map `rate_limit:{userId}:{hour_window}` to track usage.
- **Behavior**: If a user exceeds the limit, the job is **not dropped**. Instead, it is re-queued with a delay to the next available hour slot, ensuring **Order Preservation**.

### Behavior Under Load
- **Queue Efficiency**: BullMQ handles 1000+ delayed jobs efficiently without memory spikes (jobs rest in Redis).
- **Backpressure**: The worker consumes jobs at a controlled rate, preventing database or SMTP overload.

---

## 5️⃣ Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/reachinbox"
REDIS_HOST="localhost"
REDIS_PORT="6379"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
JWT_SECRET="super_secure_secret"
WORKER_CONCURRENCY=5
MAX_EMAILS_PER_HOUR=50
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
COOKIE_KEY="cookie_secret"
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:10000"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
NEXTAUTH_SECRET="next_auth_secret"
NEXTAUTH_URL="http://localhost:3000"
```
*Note: No limits are hardcoded. Everything is configurable.*

---

## 6️⃣ How to Run Locally

### 1. Start Infrastructure
Ensure Docker is running, then start Redis and Postgres:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd server
npm install
# Push Prisma Schema to DB
npx prisma db push
# Start Development Server (API + Worker)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Start Next.js
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:10000`

---

## 7️⃣ Google OAuth Setup

1.  Go to **Google Cloud Console**.
2.  Create a new Project and setup **OAuth Consent Screen**.
3.  Create **OAuth 2.0 Credentials**.
4.  **Authorized Redirect URIs**:
    - `http://localhost:3000/api/auth/callback/google`
5.  Copy `Client ID` and `Client Secret` to your `.env` files.

---

## 8️⃣ Features Checklist

### Backend
- [x] **API for scheduling emails**: (`POST /api/schedule`)
- [x] **DB persistence**: Postgres + Prisma.
- [x] **BullMQ delayed jobs**: Precision scheduling.
- [x] **Worker concurrency**: Scalable job processing.
- [x] **Hourly rate limiting**: Redis-based sliding window/counter.
- [x] **No cron used**: Pure message queue architecture.
- [x] **Survives restart**: Redis AOF persistence.
- [x] **Idempotent sending**: Prevents duplicates.

### Frontend
- [x] **Google login**: NextAuth.js integration.
- [x] **Dashboard**: Analytics and status overview.
- [x] **Compose email**: Rich text editor / Plain text.
- [x] **Scheduled table**: View pending jobs.
- [x] **Sent table**: View completed history.
- [x] **Loading states**: polished UI feedback.
- [x] **Error handling**: Toast notifications and validaton.

---

## 9️⃣ Restart Scenario Explanation

**Scenario:** User schedules 100 emails for 10:00 AM. Server crashes at 9:55 AM.

1.  **Stop Backend**: Use `Ctrl + C` to kill the server.
2.  **State**: The 100 jobs remain safely stored in Redis. The User Request log remains in PostgreSQL.
3.  **Restart Backend**: Run `npm run dev`.
4.  **Result**: The Worker connects to Redis, sees the 100 pending jobs. At 10:00 AM, it begins processing them automatically. **Zero data loss.**

---

## 🔟 Trade-offs & Assumptions

1.  **Rate Limiting**: Used Redis counters for simplicity and speed over complex distributed locking. It is "eventually consistent" which is acceptable for email limits.
2.  **SMTP**: Used **Ethereal Email** for demonstration to avoid spamming real inboxes. Can be swapped for SendGrid/SES/Gmail via `.env`.
3.  **Tenant Model**: Simplified user model; assumes one active workspace per user for this assessment.
