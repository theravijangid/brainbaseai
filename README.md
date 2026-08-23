# BrainbaseAI — Explainable Adaptive Multi-Source RAG Platform

> Enterprise Multi-Tenant Knowledge Platform (Company Brain) with Autonomous Customer Support AI Agent & Embeddable Widget.

---

## 🏗 Architecture Overview

BrainbaseAI is structured as a modular monorepo containing:

- **`client/`**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Clerk Authentication, and TanStack Query.
- **`backend-api/`**: Express, TypeScript, Sequelize ORM, PostgreSQL (Neon), Qdrant Vector Search, Inngest Background Workers, Filebase/S3 Storage, Mem0 Memory, Firecrawl Web Extraction, and Razorpay Billing.
- **`react-widget/`**: Lightweight, secure, embeddable React chat widget for customer websites.

```text
User / Browser
   │
   ├── (Next.js App / Vercel) ──────────► Clerk Auth
   │
   └── (Express API / Render)
          │
          ├── PostgreSQL (Neon) ──── Multi-tenant relational schema
          ├── Qdrant Cloud ───────── Multi-source vector embeddings
          ├── Filebase / S3 ──────── Source file storage (PDF, VTT, etc.)
          ├── OpenRouter / OpenAI ── Multi-model LLM generation & routing
          ├── Firecrawl / Jina ───── Fast web page scraping & parsing
          ├── Inngest ────────────── Asynchronous ingestion jobs
          └── Mem0 ───────────────── Conversational session memory
```

---

## 🚀 Production Deployment Guide

### Part 1: Backend Deployment on Render

The backend API can be deployed on Render either as a **Docker Web Service** (recommended) or as a **Node.js Web Service**.

#### Option A: Deploy via Docker (Recommended)

1. **Log in to [Render Dashboard](https://dashboard.render.com/)** and click **New +** → **Web Service**.
2. **Connect your GitHub repository**.
3. Configure the service settings:
   - **Name**: `brainbase-backend-api`
   - **Language / Runtime**: `Docker`
   - **Root Directory**: `backend-api`
   - **Dockerfile Path**: `./Dockerfile` (relative to Root Directory)
   - **Instance Type**: `Free` or `Starter`
   - **Health Check Path**: `/health`
4. Add the **Environment Variables** (see table below).
5. Click **Deploy Web Service**.

---

#### Option B: Deploy via Native Node.js

1. **Root Directory**: `backend-api`
2. **Runtime**: `Node`
3. **Build Command**: `npm install --legacy-peer-deps && npm run build`
4. **Start Command**: `npm run start:prod`
5. **Health Check Path**: `/health`

---

#### Backend Environment Variables Reference (Render)

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Web server port (Render auto-injects) | `5000` |
| `DB_HOST` | PostgreSQL Host (Neon pooled connection) | `ep-xxx-pooler.c-4.us-east-2.aws.neon.tech` |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `DB_NAME` | Database Name | `neondb` |
| `DB_USERNAME` | Database User | `neondb_owner` |
| `DB_PASSWORD` | Database Password | `<neon-db-password>` |
| `DB_DIALECT` | Sequelize Dialect | `postgres` |
| `POOL_MAX` | Max connection pool size | `5` |
| `POOL_MIN` | Min connection pool size | `1` |
| `LOG_LEVEL` | Application logging level | `info` |
| `ACCESS_KEY_ID` | Filebase / S3 Access Key | `<filebase-access-key>` |
| `SECRET_ACCESS_KEY` | Filebase / S3 Secret Key | `<filebase-secret-key>` |
| `REGION` | S3 Region | `auto` |
| `FILEBASE_ENDPOINT` | S3 Compatible Endpoint | `https://s3.filebase.io` |
| `FILEBASE_BUCKET_NAME` | S3 Bucket Name | `adaptive-rag` |
| `OPENROUTER_API_KEY` | OpenRouter API Key for LLMs | `sk-or-v1-...` |
| `RAG_ANSWER_MODEL` | Default RAG Answer LLM | `openai/gpt-4o-mini` |
| `REQUEST_ROUTER_MODEL`| Intent Router LLM | `openai/gpt-4o-mini` |
| `GENERAL_CHAT_MODEL` | General Conversation LLM | `openai/gpt-4o-mini` |
| `QDRANT_URL` | Qdrant Cluster URL | `https://xxx.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Qdrant API Key | `<qdrant-api-key>` |
| `QDRANT_COLLECTION_NAME`| Qdrant Vector Collection | `workspace_chunks` |
| `CLERK_PUBLISHABLE_KEY`| Clerk Frontend Key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk Backend Secret Key | `sk_test_...` |
| `MEM0_API_KEY` | Mem0 Conversational Memory Key | `m0-...` |
| `WIDGET_JWT_SECRET` | Secret for Widget Client Sessions | `<secure-random-string>` |
| `FIRECRAWL_API_KEY` | Firecrawl Web Extractor API Key | `fc-...` |
| `WEB_EXTRACTOR_PROVIDER`| Web Extraction Provider | `firecrawl` (or `jina`) |
| `JINA_API_KEY` | (Optional) Jina Reader API Key | `jina_...` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | `<razorpay-secret>` |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay Webhook Secret | `<razorpay-webhook-secret>` |
| `RAPIDAPI_KEY` | RapidAPI Key (for YouTube transcripts)| `<rapidapi-key>` |
| `RAPIDAPI_HOST` | RapidAPI YouTube Host | `youtube-transcript3.p.rapidapi.com` |

---

#### Running Database Migrations

To apply database migrations to your production PostgreSQL instance:

```bash
cd backend-api
npm run migrate
```

To seed initial subscription plans and pricing:

```bash
npm run seed
```

---

### Part 2: Frontend Deployment on Vercel

1. **Log in to [Vercel Dashboard](https://vercel.com/)** and click **Add New...** → **Project**.
2. **Import your GitHub repository**.
3. Under **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `client`
   - **Build Command**: `npm run build` (or default Next.js build)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add the following:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of your deployed Render Backend | `https://brainbase-backend-api.onrender.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk Secret Key | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign In Route | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Redirect Route after Sign In | `/app` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Redirect Route after Sign Up | `/app` |
| `NEXT_PUBLIC_POLLING_INTERVAL` | Polling interval for source sync | `5000` |

5. Click **Deploy**.

---

### Part 3: Connecting Background Jobs (Inngest)

For asynchronous document ingestion (PDF, Website crawl, YouTube transcripts):

1. Log in to [Inngest Cloud](https://app.inngest.com/).
2. Create an App syncing with your Render backend endpoint:
   ```text
   https://<your-render-backend-url>/api/inngest
   ```
3. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` on Render once connected.

---

## 💻 Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/brainbaseai.git
cd brainbaseai
```

Install backend dependencies:
```bash
cd backend-api
npm install --legacy-peer-deps
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

### 2. Configure Local Environment Files

Create `backend-api/.env`:
```bash
cp backend-api/.env.example backend-api/.env  # or populate with credentials
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_POLLING_INTERVAL=5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Start Development Servers

Start the backend API (port 5000):
```bash
cd backend-api
npm run dev
```

Start the frontend Next.js application (port 3000):
```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🔍 Verification & Health Check

- **Backend Health Check**: `GET https://<your-backend-url>/health`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-08-23T13:30:00.000Z",
    "service": "BrainbaseAI Backend API"
  }
  ```
- **Qdrant Vector DB Connectivity**: Logged during startup `[Qdrant] Successfully connected to Qdrant cluster.`
- **PostgreSQL Connectivity**: Logged during startup `Database connection OK!`

---

## 🛡️ License

MIT License.
