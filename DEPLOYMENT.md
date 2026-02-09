# Deployment Guide

This guide details how to deploy the **ReachInbox** application.
- **Backend**: Render
- **Frontend**: Vercel

## Prerequisites
- A GitHub account with this repository pushed.
- A [Render](https://render.com/) account.
- A [Vercel](https://vercel.com/) account.

---

## 1. Backend Deployment (Render)

We will deploy the `server` directory as a Web Service.

### Option A: Using `render.yaml` (Blueprints) - Recommended
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect the `render.yaml` file and ask for approval.
5. **Important**: You must fill in the Environment Variables (marked as `sync: false` in yaml) in the Render dashboard during setup or after creation in the "Environment" tab.

### Option B: Manual Setup
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `reach-inbox-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Create Web Service**.

### Environment Variables (Required)
Go to the **Environment** tab of your Render service and add these:

| Key | Value Description |
| --- | --- |
| `DATABASE_URL` | Your PostgreSQL Connection String |
| `REDIS_HOST` | Hostname of your Redis instance (e.g., from Render Redis or remote) |
| `REDIS_PORT` | Port of your Redis instance (default: `6379`) |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `CLIENT_URL` | The URL of your Vercel Frontend (e.g., `https://your-app.vercel.app`) |
| `JWT_SECRET` | A long random string for security |
| `WORKER_CONCURRENCY` | `5` (default) |
| `MAX_EMAILS_PER_HOUR` | `200` (default) |

> **Note:** Once deployed, copy the **Service URL** (e.g., `https://reach-inbox-server.onrender.com`). You will need this for the Frontend setup.

---

## 2. Frontend Deployment (Vercel)

We will deploy the `client` directory.

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New ...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: Click `Edit` and select `client`.
5. **Environment Variables**:
   Expand the "Environment Variables" section and add:

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | Your Render Backend Service URL (e.g., `https://reach-inbox-server.onrender.com`) |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |

6. Click **Deploy**.

---

## 3. Post-Deployment Configuration

1. **Update Google OAuth Console**:
   - Go to your Google Cloud Console.
   - Add your Vercel URL to **Authorized JavaScript origins**.
   - Add `https://reach-inbox-server.onrender.com/api/auth/google/callback` (replace with your actual Render URL) to **Authorized redirect URIs** if you are using backend redirection.

2. **Update Render Environment**:
   - Go back to Render.
   - Update `CLIENT_URL` to match your actual deployed Vercel URL (remove trailing slash).
