# Hutty Cost Calculator — Cloud Deployment & Database Initialization Guide

---

## 🏗 System Architecture Overview

Hutty Cost Calculator is a full-stack SaaS platform built with:
- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4 (Deployed on **Vercel** / **Netlify**)
- **Backend API Engine**: Express.js + TypeScript + Node.js 20 + Prisma 5.22 (Deployed on **Render** / **Railway**)
- **Database**: PostgreSQL (Provisioned on **Render PostgreSQL** / **Supabase** / **Neon**)
- **Persistence Authority**: PostgreSQL durable storage with in-memory transient fallback (which fails closed for purchases in production)

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

## 🚀 Non-Interactive Production Database Initialization on Render

Because Render Free/Starter Web Services do not provide an interactive Shell terminal, the repository provides an automated, non-interactive initialization pipeline:

```bash
npm run db:init:verify
```

### What `npm run db:init:verify` executes automatically:
1. **Schema Synchronization**: Runs `npx prisma db push --skip-generate` to inspect the database and add missing tables and indexes non-destructively without dropping tables or resetting data.
2. **Idempotent Seed**: Runs `runSeed()` to populate default admin accounts (`admin@costcalculator.app`, `admin@hutty.in`), client account, 8 material categories, the 5 commercial pricing tiers, 7 expert consultants, baseline calculation config `v1.0.0`, and canonical parameters using Prisma `upsert`.
3. **Comprehensive Diagnostic Check**: Runs `checkDatabase()` to verify that all 8 critical tables exist and have valid records. Exits with code `0` only when all checks pass.

---

### Method A: Via Render Pre-Deploy Command (Recommended — Zero Extra Services)

Render Web Services support a **Pre-Deploy Command** on all tiers (including Free instances). The pre-deploy command runs in an ephemeral container with the service's private `DATABASE_URL` attached before traffic switches to the new build.

1. Go to **[Render Dashboard](https://dashboard.render.com)**.
2. Select your Web Service: **`hutty-api-st46`**.
3. In the left navigation menu, click **Settings**.
4. Scroll to **Build & Deploy** > locate **Pre-Deploy Command**.
5. Set the **Pre-Deploy Command** to:
   ```bash
   npm run db:init:verify
   ```
6. Click **Save Changes**.
7. In the top-right corner, click **Manual Deploy** > **Clear build cache & deploy**.
8. In the deployment logs, you will observe the 3-step pipeline execute, print all green checkmarks, and exit with code 0. Once completed, Render automatically starts the web service!

---

### Method B: Via Dedicated Render One-off Job / Temporary Background Worker

If you prefer to initialize the database using a dedicated standalone service:

1. In Render Dashboard, click the blue **New +** button in the top navigation bar.
2. Select **Background Worker** (or **Cron Job** with schedule `0 0 31 2 *` for manual run).
3. Connect repository: `MaazAyoob/cost-calculator`, branch `main`.
4. Configure the service settings:
   - **Name**: `hutty-db-init-worker`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run db:init:verify
     ```
5. In **Environment Variables**, add:
   - `DATABASE_URL` = *(Your Render PostgreSQL connection string, matching `hutty-api-st46`)*
   - `NODE_ENV` = `production`
6. Click **Create Background Worker**.
7. Render will build the container, execute `npm run db:init:verify`, and display the diagnostic log output in the Worker's **Logs** tab:
   ```text
   ╔══════════════════════════════════════════════════════════════╗
   ║  Hutty Production Database Safe Initialization & Verification ║
   ╚══════════════════════════════════════════════════════════════╝
   [Step 1/3] Synchronizing PostgreSQL schema via Prisma db push...
   ✅ Schema synchronization completed successfully.
   [Step 2/3] Seeding essential reference data idempotently...
   ✅ Idempotent seed completed successfully.
   [Step 3/3] Running database diagnostic verification...
      ✅ Table "pricing_tiers": OK (5 records)
      ✅ Table "consultants": OK (7 records)
      ✅ Table "users": OK (3 records)
      ✅ Table "material_categories": OK (8 records)
      ✅ Table "calculation_config_versions": OK (1 records)
      ✅ Table "calculation_config_parameters": OK (15 records)
      ✅ Table "pricing_purchases": OK (0 records)
      ✅ Table "user_entitlements": OK (0 records)
   🎉 INITIALIZATION COMPLETE: Database is fully provisioned & verified.
   ```
8. **Teardown**: Once the log confirms completion, click **Settings** > **Delete Worker** (or **Suspend Worker**) so no background resources remain active.

---

## 3. Public Health Verification Check

After running Method A or Method B, verify that the live backend recognizes the PostgreSQL persistence:

```bash
curl https://hutty-api-st46.onrender.com/api/v1/health
```

**Expected JSON Response:**
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

When `mode` is `"POSTGRESQL_DURABLE"` and `databaseConnected` is `true`, PostgreSQL persistence is active and purchases are fully protected.

---

## 🛡️ Database Safety Invariants

- **Non-Destructive**: `prisma db push` inspects the live schema and adds missing tables and indexes without dropping existing populated tables or records.
- **Strict Idempotency**: All seed operations use Prisma `upsert`. Running the command repeatedly will never create duplicate records or alter existing IDs.
- **Decoupled Server Boot**: `server/Dockerfile` and `npm start` execute `node dist/index.js` directly, preventing `db push` from running on every server restart or autoscale event.
- **No In-Memory Data Loss**: In production (`NODE_ENV=production`), payment order creation fails closed if PostgreSQL is unreachable (`DURABLE_STORAGE_UNAVAILABLE`), preventing unrecorded transactions.
