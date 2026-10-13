# Hutty Cost Calculator — Cloud Deployment & Database Initialization Guide

---

## 🏗 System Architecture Overview

Hutty Cost Calculator is a full-stack SaaS platform built with:
- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4 (Deployed on **Vercel** / **Netlify**)
- **Backend API Engine**: Express.js + TypeScript + Node.js 20 + Prisma 5.22 (Deployed on **Render** / **Railway**)
- **Database**: PostgreSQL (Provisioned on **Render PostgreSQL** / **Supabase** / **Neon**)
- **Cache / Storage**: In-memory with durable PostgreSQL storage authority

**Live Backend Deployment:**
- **Render Web Service URL:** `https://hutty-api-st46.onrender.com`
- **Health & Diagnostic Endpoint:** `https://hutty-api-st46.onrender.com/api/v1/health`

---

## 🌐 Environment Variables Matrix

### Backend (`/server` on Render)
Configure these environment variables in your **Render Service Settings > Environment Variables**:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | HTTP Port for Express server | `4000` (or leave default on Render) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@dpg-...-a.oregon-postgres.render.com/dbname` (Use internal connection string if DB is on Render) |
| `JWT_SECRET` | Secret key for signing admin/user tokens | Secure random 64-character string |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CORS_ORIGIN` | Allowed web domains | `https://hutty.in,https://www.hutty.in,https://cost-calculator-ten-kappa.vercel.app` |
| `FRONTEND_URL` | Customer portal URL | `https://hutty.in` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | `rzp_live_...` (or test key `rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Kept in Render secrets |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook verification | Kept in Render secrets |

> **SAFETY NOTE:** Never commit real database credentials or API secrets to Git.

---

## 🚀 Render Backend Deployment & One-Time Database Initialization

### 1. Build and Start Commands
In Render Dashboard under your Web Service (`hutty-api-st46`):
- **Root Directory:** `server`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
  *(This generates the Prisma Client and compiles TypeScript into `dist/`)*
- **Start Command:**
  ```bash
  npm run start
  ```
  *(Runs `node dist/index.js` cleanly. `db push` is intentionally decoupled from container startup to avoid slow boots and concurrency races on autoscale).*

---

### 2. One-Time Database Schema Push & Seed Workflow

Because this project does not maintain incremental migration history folders (`prisma/migrations`), the safest, non-destructive method to synchronize PostgreSQL with `schema.prisma` is `prisma db push`.

#### Option A: Via Render Web Shell (Recommended)
1. Go to your Render Dashboard > Select your Web Service (`hutty-api-st46`).
2. Click the **Shell** tab in the left-hand navigation to open an interactive terminal.
3. Push the schema to your PostgreSQL database (creates all 23 models / 31 tables non-destructively):
   ```bash
   npx prisma db push
   ```
4. Seed the initial reference records (Admin users, Material Categories, Pricing Tiers, Consultants, Baseline Config v1.0.0):
   ```bash
   npm run db:seed
   ```
5. Run the safe diagnostic check to verify table health:
   ```bash
   npm run db:check
   ```

#### Option B: Via Render Pre-Deploy Command
Render supports executing a command before a new deployment goes live:
1. In Render Dashboard > Web Service > **Settings** > **Build & Deploy**.
2. Set **Pre-Deploy Command** to:
   ```bash
   npx prisma db push && npm run db:seed
   ```
3. Save changes. On every new commit deployment, Render will push schema updates and run the idempotent seed script before activating the new build.

---

### 3. Verification & Acceptance Check

Once the database has been pushed and seeded, verify live health:

#### A. Diagnostic Script Output (via Shell)
Running `npm run db:check` will report:
```text
════════════════════════════════════════════════════════════════
 Hutty Production Database Diagnostic Check
════════════════════════════════════════════════════════════════
1. Testing PostgreSQL TCP & authentication handshake...
   ✅ Connection established successfully.
2. Verifying critical schema tables and reference data:
   ✅ Table "pricing_tiers": OK (5 records)
   ✅ Table "consultants": OK (7 records)
   ✅ Table "users": OK (3 records)
   ✅ Table "material_categories": OK (8 records)
   ✅ Table "calculation_config_versions": OK (1 records)
   ✅ Table "calculation_config_parameters": OK (15 records)
   ✅ Table "pricing_purchases": OK (0 records)
   ✅ Table "user_entitlements": OK (0 records)
----------------------------------------------------------------
🎉 SUCCESS: All required tables exist and are accessible.
```

#### B. Public Health Endpoint Check
Visit the public health endpoint in your browser or curl:
```bash
curl https://hutty-api-st46.onrender.com/api/v1/health
```
**Expected Production Response:**
```json
{
  "status": "online",
  "platform": "Cost Calculator API Engine v1.0.0",
  "database": {
    "mode": "POSTGRESQL_DURABLE",
    "databaseConnected": true,
    "persistenceGuaranteed": true,
    "warning": null
  },
  "timestamp": "2026-10-13T..."
}
```
*(Notice `mode` transitions from `IN_MEMORY_TRANSIENT` to `POSTGRESQL_DURABLE`, and `databaseConnected` is `true`).*

---

## 🛡️ Database Safety Rules

- **Zero Data Loss**: NEVER run `npx prisma migrate reset` in production (this drops the database).
- **Non-Destructive Operations**: `prisma db push` inspects the live schema and adds missing tables and indexes without dropping existing populated tables or records.
- **Strict Idempotency**: `npm run db:seed` uses Prisma `upsert` exclusively. Running it multiple times will never duplicate pricing tiers, consultants, or users.
- **Fail-Closed Security**: In `production` (`NODE_ENV=production`), payment order creation fails closed if PostgreSQL is unreachable (`DURABLE_STORAGE_UNAVAILABLE`), preventing unrecorded financial transactions.
