# HUTTY — LAUNCH READINESS REPORT & DEPLOYMENT SIGN-OFF
**Document Reference:** `HUTTY_LAUNCH_READINESS_REPORT.md`  
**Platform:** Hutty — Architectural Intelligence, Cost Estimation & Verified Consultations  
**Date:** October 2026  
**Auditor / Verification Lead:** Antigravity Autonomous Agentic Engineering  
**Target Live Host:** `https://hutty-api-st46.onrender.com`  
**Database Status:** PostgreSQL Durable (`POSTGRESQL_DURABLE` mode confirmed live)  

---

## 1. Executive Summary & Launch Verdict

| Core Workflow Area | Launch Status | Verification Notes |
| :--- | :---: | :--- |
| **1. Consultant Synchronization & Discovery** | **PASS** | Root cause fixed; Prisma update payload sanitized; public directory updates instantly on save and approval. |
| **2. Admin Calculator Configuration (V2)** | **PASS** | Draft isolation verified; Active configuration publication verified; canonical engine consumes resolved parameters. |
| **3. Material Rates & Labour Overrides** | **PASS** | Rate overrides persist to PostgreSQL and sync to client via `rateService.syncWithServer()`. |
| **4. Customer Accounts & Authentication** | **PASS** | BCrypt password hashing, JWT sessions, profile updates verified; live endpoint returns authenticated user. |
| **5. Homeowner Project Auto-Save & Isolation**| **PASS** | Projects persist to `prisma.project`; customer data strictly isolated (`ownerId === userId`). |
| **6. Commercial Pricing Integrity** | **PASS** | Non-negotiable pricing strictly preserved: Free ₹0, Basic PDF ₹99, Detailed BOQ ₹499, Premium ₹1,499, Consultation ₹1,499. |
| **7. Payment & Report Entitlements** | **PASS** | Sandbox orders, webhook signature verification, entitlement checks, and PDF report downloads verified. |
| **8. Consultations, Enquiries & Leads** | **PASS** | Bookings and fallback enquiries persist to PostgreSQL; administrative queue and notifications connected. |
| **9. Production Database Connectivity** | **PASS** | Durable PostgreSQL mode verified; production fail-closed protection enabled. |
| **10. Live Payment Gateway Merchant Credentials**| **BLOCKED** | Live production merchant keys and webhook secret must be configured by business owner before real money transactions. |

---

## 2. Root Cause & Solution of the Consultant Synchronization Issue

### The Problem
Changes made to consultants in the Admin Panel appeared successful in the Admin form but did not update the public website (`/consultation`, `/consultants/:slug`) or persist across server restarts.

### Root Causes Diagnosed
1. **Prisma Update Schema Rejection:** In `server/src/services/consultation.service.ts`, `updateConsultant()` passed `{ ...updated }` containing `id` and `createdAt` into `prisma.consultant.update({ where: { id }, data: { ... } })`. Prisma Client threw an unhandled parameter rejection error. The error was caught silently by `catch`, updating only an ephemeral in-memory JavaScript array while PostgreSQL remained unmodified. Subsequent queries executed against PostgreSQL fetched the stale record.
2. **Validator Key Stripping:** `server/src/validators/consultation.validator.ts` declared `about` but omitted `description`. When frontend or test suites submitted `description`, Zod stripped the key before passing to the service.
3. **Vite Development Server Interception:** `vite.config.ts` had a dev mock middleware (`viteDevApiPlugin`) that intercepted `/api/v1/auth/*`, `/api/v1/projects/*`, and `/api/v1/account/*` in memory without proxying to port 4000.
4. **Missing Store Invalidation:** In `src/store/useConsultationStore.ts`, approving a professional application refreshed admin lists but failed to call `fetchConsultants()`, leaving the public catalog stale.

### Solutions Verified
- Destructured and excluded `id`, `createdAt`, `description`, and `requests` before calling Prisma `.update()`.
- Added fail-closed protection (`throw new Error('DURABLE_STORAGE_WRITE_FAILED')` in production) so failures never silently degrade.
- Added `description` to `createConsultantSchema` and `updateConsultantSchema`.
- Replaced unconditional dev mocking in `vite.config.ts` with dynamic health-probing (`isBackendActive()`) to allow proxy pass-through to port 4000.
- Added `await get().fetchConsultants()` to `reviewAdminApplication`.

---

## 3. Audited Admin Domains: Persistence & Publication Rules

| Domain | Database Target | Immediate vs Publish | Public Consumer Component | Verified |
| :--- | :--- | :--- | :--- | :---: |
| **Consultants** | `prisma.consultant` | **Immediate** | `/consultation`, `/consultants/:slug` | **PASS** |
| **Applicant Approvals** | `prisma.professionalApplication` | **Immediate upon Approval** | `/consultation` (Public Directory) | **PASS** |
| **Calculation Parameters** | `prisma.configVersion` | **Draft → Publish** | `configResolver.ts` → Canonical Calculator Engine | **PASS** |
| **Rate Overrides** | `prisma.rateOverride` | **Immediate** | `rateService.ts` → `useCalculationStore` | **PASS** |
| **Plot Setbacks** | `prisma.configVersion` | **Draft → Publish** | `setbackEngine.ts` | **PASS** |
| **Trade Multipliers** | `prisma.configVersion` | **Draft → Publish** | Canonical Engine Material Breakdown | **PASS** |
| **Customer Projects** | `prisma.project` | **Immediate Auto-Save** | `/account` (My Projects) & `/calculator` | **PASS** |
| **Customer Orders** | `prisma.order` | **Immediate on Webhook**| `/account` (Purchases & Entitlements) | **PASS** |
| **Consultation Bookings**| `prisma.consultationRequest`| **Immediate on Payment**| `/account` & Admin Review Queue | **PASS** |
| **General Enquiries** | `prisma.generalEnquiry` | **Immediate** | Admin Lead Inbox & Operations | **PASS** |

---

## 4. Architectural Verification Proofs

### 4.1 How Calculator Settings Reach the Canonical Engine
1. Admin edits a parameter in the Admin Panel (e.g., steel consumption kg/sqft).
2. The change is saved as a Draft version (`prisma.configVersion` with `status: 'DRAFT'`).
3. **Invariance:** Active customer calculations continue using the `ACTIVE` version.
4. Admin reviews simulation report and triggers **Publish**.
5. The backend sets the previous version to `REPLACED` and activates the new version (`status: 'ACTIVE'`).
6. `GET /api/v1/config/active` serves the new active configuration payload with its checksum.
7. `rateService.syncWithServer()` fetches `/api/v1/config/active` and calls `configResolver.syncActiveConfiguration()`.
8. Future calls to `runCalculator()` immediately reflect the published parameters without changing unaffected trades.

### 4.2 How Public Consultant Data Reaches the Website
1. Admin updates consultant profile or approves an application.
2. `consultationService.updateConsultant()` or `reviewProfessionalApplication()` persists changes to PostgreSQL.
3. `useConsultationStore` invokes `fetchConsultants()`, requesting `GET /api/v1/consultants`.
4. Public directory displays updated bio, specializations, and availability. Inactive consultants return 404 on slug lookup and are excluded from directory listings.

### 4.3 Customer Authentication & Project Isolation
- Registration persists user credentials using BCrypt hashing (`bcrypt.hash(password, 10)`).
- Login verifies password and issues a signed JWT.
- Projects are linked via `ownerId === user.id`. Requests for project listings strictly query by `ownerId`. Customer B cannot view or mutate Customer A's projects.

### 4.4 Non-Negotiable Approved Prices Preserved
All prices are enforced in code and backend orders:
- **Free Estimate:** ₹0
- **Optional Basic PDF Download:** ₹99 (9,900 paise)
- **Detailed BOQ:** ₹499 (49,900 paise)
- **Premium BOQ:** ₹1,499 (149,900 paise)
- **Consult an Expert:** ₹1,499 (149,900 paise, separate decoupled service)

---

## 5. Launch Blocker Classification (P0 / P1 / P2)

### P0 Issues (All Fixed & Resolved)
- [x] **P0-1:** Prisma update failure in `consultation.service.ts` causing silent data loss. **FIXED.**
- [x] **P0-2:** Schema mismatch in `consultation.validator.ts` stripping `description`. **FIXED.**
- [x] **P0-3:** Unconditional dev mock in `vite.config.ts` intercepting PostgreSQL routes. **FIXED.**
- [x] **P0-4:** Customer project persistence aliases (`saveProject`, `listProjectsByUser`) missing on `projectService`. **FIXED.**

### P1 Issues (Operational & Launch Prerequisites)
- [ ] **P1-1 (External Blocker):** Production Payment Gateway Live Merchant Credentials.
  * *Status:* Sandbox/mock verification **PASS**. Live production Razorpay/Cashfree key and secret must be populated in environment variables prior to public customer debit.
- [ ] **P1-2 (External Blocker):** Production SMTP / Transactional Email Delivery Provider.
  * *Status:* Enquiry database persistence **PASS**. SMTP host, port, user, and pass (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) must be configured on Render for outbound email delivery to homeowners and operators.

### P2 Issues (Non-Blocking Polish)
- [x] **P2-1:** Admin token resolution fallback across stores. **FIXED.**
- [x] **P2-2:** Instant public catalog invalidation on professional approval. **FIXED.**

---

## 6. Manual Actions Required by Platform Owner

Before switching DNS or publicly announcing the launch, the platform owner must execute the following actions in the Render / hosting dashboard:

1. **Provide Live Razorpay Merchant Credentials:**
   * Set `RAZORPAY_KEY_ID` to live production key.
   * Set `RAZORPAY_KEY_SECRET` to live production secret.
   * Configure Webhook URL in Razorpay Dashboard: `https://hutty-api-st46.onrender.com/api/v1/consultations/webhook`.
   * Set `RAZORPAY_WEBHOOK_SECRET` matching the dashboard webhook secret.
2. **Provide Outbound SMTP Credentials (for Operational Email Alerts):**
   * Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`.
   * Set `OPS_NOTIFICATION_EMAIL` (e.g. `operations@hutty.in`) to receive real-time consultation booking and enquiry alerts.
3. **Perform Smoke Test:**
   * Verify an administrative update to a consultant on the staging/production domain.
   * Complete a ₹0 free estimation and verify customer project saving.
   * Execute a ₹99 test transaction in Razorpay test mode.

---

## 7. Sign-Off Statement

The Hutty application's core data flow—from Admin Panel controls to PostgreSQL, active APIs, the canonical calculation engine, and customer accounts—is **fully integrated, tested, and structurally sound**. All software defects causing consultant and configuration desynchronization have been diagnosed, corrected, and verified.
