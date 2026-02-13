<div align="center">

# ReachInbox Assignment
### The Ultimate Full-Stack Email Scheduling Platform

**TypeScript** • **Next.js 14** • **Node.js 20** • **Redis (BullMQ)** • **PostgreSQL (Prisma)**

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a>
</p>

</div>

---

## 📖 Project Overview

**ReachInbox** is a production-grade One-on-One cold email outreach platform. It allows users to schedule personalized emails to be sent at a future date and time.

Unlike standard implementations, this project features a **custom Split-Screen Design**, a unique **Dual-Authentication flow** (Google OAuth + Custom Registration), and a robust **Distributed Queue System** that ensures 100% reliable delivery even during server restarts.

**Recent Major Refactor (Feb 2026):** The backend has been completely re-architected to use a scalable **Service-Controller Pattern**, decoupling business logic from API routes and ensuring high code quality.

---

## ✨ Key Features

### 🔐 Advanced Authentication
- **Dual Auth System**: Seamlessly combine Google OAuth with a custom registration step to capture user details.
- **Secure Session Management**: Powered by `NextAuth.js`.

### 🎨 Modern UI/UX
- **Split Layout**: A professional, branded left-panel and focused right-panel for login/registration.
- **Client-Side Validation**: Real-time feedback and dynamic form adjustments.
- **Theme**: Clean, accessible, and responsive design using **TailwindCSS**.

### ⚙️ Powerful Backend
- **Precision Scheduling**: Uses **BullMQ** and **Redis** to handle delayed jobs with millisecond precision.
- **Fault Tolerance**: Persistent Redis queues ensure no scheduled email is ever lost.
- **Instant Feedback**: Optimized status updates provide immediate "Delivered" feedback for instant emails.
- **Rate Limiting**: Implements a "Token Bucket" style limiter to respect SMTP provider quotas.
- **Concurrency**: Process multiple email jobs simultaneously with optimized Class-based Workers.

---

## 🏗 Architecture

The backend follows a strict **Separation of Concerns** principle:

- **Controllers (`/controllers`)**: Handle HTTP requests, validation, and responses.
- **Services (`/services`)**: Contain business logic and database interactions.
- **Jobs (`/jobs`)**: Background workers (e.g., `EmailProcessor`) for async tasks.
- **Validators (`/validators`)**: Zod schemas for robust input validation.
- **Utils (`/utils`)**: Centralized logging and error handling.

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/-Next.js-black) ![Tailwind](https://img.shields.io/badge/-Tailwind-38B2AC) | Next.js 14, React 19, Lucide Icons |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-green) ![Express](https://img.shields.io/badge/-Express-black) | TypeScript, Express.js |
| **Database** | ![Postgres](https://img.shields.io/badge/-PostgreSQL-336791) ![Prisma](https://img.shields.io/badge/-Prisma-1B222D) | Managed via Supabase/Render |
| **Queue** | ![Redis](https://img.shields.io/badge/-Redis-DC382D) | BullMQ for job scheduling |
| **DevOps** | ![Docker](https://img.shields.io/badge/-Docker-2496ED) | Docker Compose for local dev |

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- **Node.js** (v18+)
- **Redis** & **PostgreSQL** (Local or Cloud)

### 1. Clone & Setup
```bash
git clone https://github.com/imgovind95/ReachINbox.git
cd ReachINbox
```

### 2. Backend Setup
```bash
cd server
npm install
# Copy example env
cp .env.example .env
# Push Schema to DB
npx prisma db push
# Build Project
npm run build
# Start Server (API + Worker)
npm start
```
> Server runs on `http://localhost:10000` or port defined in `.env`

### 3. Frontend Setup
```bash
cd client
npm install
# Configure .env.local
npm run dev
```
> Client runs on `http://localhost:3000`

---

## 🌐 Deployment

The system is designed for easy deployment on **Render** (Backend) and **Vercel** (Frontend).

### Render (Backend)
1.  Create a **Web Service** connected to the `server` directory.
2.  **Build Command**: `npm install && npm run build`
3.  **Start Command**: `npm start`
4.  Add Environment Variables from your `.env`.

### Vercel (Frontend)
1.  Import the `client` directory.
2.  Add `NEXT_PUBLIC_API_URL` pointing to your Render backend URL.
3.  Deploy!

---

## 👤 Author

**Govind Kumar**
- Github: [@imgovind95](https://github.com/imgovind95)

---

<div align="center">
  <sub>Built for ReachInbox Assessment</sub>
</div>
