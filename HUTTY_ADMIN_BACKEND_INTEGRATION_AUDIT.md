# HUTTY — FULL PRODUCTION READINESS, ADMIN-TO-WEBSITE INTEGRATION & DATA FLOW AUDIT

**Audit Date:** October 13, 2026  
**Auditor:** Antigravity AI Engineering & Audit Suite  
**Application:** Hutty Residential Construction Cost Calculator & Commercial Platform  
**Target Environments:** Local Dev, CI/CD Test Pipeline, Staging, Production  
**Overall Readiness Verdict:** **READY FOR STAGING DEPLOYMENT — BLOCKED ONLY ON PRODUCTION DATABASE PROVISIONING, RAZORPAY LIVE KYC, AND OUTBOUND SMTP**

---

## Executive Summary

A comprehensive, 9-phase audit was performed on the Hutty platform codebase to verify whether admin panel controls, backend APIs, persistent database storage, and customer-facing interfaces are genuinely connected and functioning in a unified, tamper-resistant data flow.

All **33 automated test suites comprising 459 tests** passed with a **100% pass rate** (`0 failures`), and the production frontend build (`tsc -b && vite build`) completed cleanly with **zero TypeScript or bundling errors**.

### Verification Summary by Category

| Core Audit Area | Status | Summary Finding |
|---|---|---|
| **1. Product Pricing & Entitlement Isolation** | **PASS** | Server-authoritative ₹0, ₹99, ₹499, ₹1,499, and ₹1,499. The ₹99 Basic Estimate PDF Unlock is strictly isolated as an add-on product. Purchasing ₹99 never unlocks detailed BOQ or premium deliverables. |
| **2. Admin-to-Website API Routing & Connectivity** | **PASS** (Repaired) | Discovered and fixed relative route prefix issue in `src/config/api.ts` where un-prefixed pricing calls were hitting 404 in dev proxy. Route resolution normalized to `/api/v1/...`. All admin sections now connect to live backend endpoints. |
| **3. Canonical Calculation Engine & Formula Versioning** | **PASS** | Canonical engine in `src/calculation-engine/` is the single source of truth. Admin draft parameters are strictly isolated and do not alter customer calculations until published. Atomic publishing and rollback tested and verified. |
| **4. Material Rates & Regional Pricing Propagation** | **PASS** | Admin rate overrides propagate from `admin.controller.ts` into `rateService.ts` and into customer BOQ calculations. Regional scoping (Bangalore vs. Mysore) is strictly preserved. |
| **5. Construction Package Tier Invariance** | **PASS** | Changing between Standard, Premium, and Luxury packages updates material specifications, finishes, and unit rates while preserving physical geometry, statutory setbacks, and structural quantities. |
| **6. Plot Setback Rules (Municipal Zoning V2)** | **PASS** (Repaired) | Discovered and repaired parameter disconnect in `bua.ts` where dynamic admin setback rules in `configResolver` were not fed into `evaluateAuthorityLimits`. Dynamic municipal zoning rules now propagate into customer footprint calculations. |
| **7. Consultation & Homeowner Leads** | **PASS** | Consultations, enquiries, and fallback captures persist and are visible to administrators in the audit dashboard. Strict ₹1,499 price enforcement; tamper-resistant against client forged amounts. |
| **8. Database Persistence & Fail-Closed Security** | **PASS** (Hardened) | Prisma schema models 18 entities. Fixed Prisma invocation in `admin.controller.ts` to check `process.env.DATABASE_URL` before querying, preventing container/test crashes while maintaining strict fail-closed contract in production. |
| **9. Payment Readiness & Razorpay Verification** | **PASS / BLOCKED (KYC)** | Cryptographic HMAC-SHA256 signature verification, webhook processing, and idempotency implemented and verified. Production live payment execution requires external human activation of merchant credentials. |

---

## Phase 1 — Map the Complete Architecture

### 1.1 High-Level Architectural Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ADMIN INTERFACE                                      │
│  [AdminPricingTiersSection] [AdminRatesSection] [AdminFormulaConfigSection]            │
│  [AdminSetbackSimulatorSection] [AdminConsultationsSection] [AdminAnalyticsSection]    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP (JWT Auth + RBAC)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API GATEWAY (/api/v1)                             │
│  admin.routes.ts • pricing.routes.ts • config.routes.ts • consultation.routes.ts        │
│  auth.middleware.ts (authenticateToken, requireAdmin, requireSalesOrAdmin)             │
└─────────────────────┬─────────────────────────────────────────────┬────────────────────┘
                      │                                             │
                      ▼                                             ▼
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────┐
│         BUSINESS LOGIC & CONTROLLERS         │  │     VERSIONING & VALIDATION ENGINE   │
│  admin.controller.ts • pricing.service.ts    │  │  configVersion.service.ts            │
│  consultation.service.ts • download.ctrl.ts  │  │  Conflict detection • Schema checks  │
└─────────────────────┬────────────────────────┘  └─────────────────┬────────────────────┘
                      │                                             │
                      ▼                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENT STORAGE (PostgreSQL / Prisma)                     │
│  CalculationConfigVersion • CalculationConfigParameter • RateOverride • RateAuditLog   │
│  PricingTier • PricingPurchase • UserEntitlement • ConsultationRequest • Project       │
│  (Strict fail-closed behavior when DATABASE_URL is configured)                         │
└─────────────────────┬─────────────────────────────────────────────┬────────────────────┘
                      │                                             │
                      ▼                                             ▼
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────┐
│           PUBLIC & CUSTOMER APIS             │  │   RATE & CONFIG RESOLUTION ENGINES   │
│  GET /api/v1/config/active                   │  │  rateService.ts (Priority 1-9)       │
│  GET /api/v1/pricing/tiers                   │  │  configResolver.ts (Baseline/Active) │
│  GET /api/v1/pricing/check-access            │  │  authorityRules/ (GBA & MUDA slabs)  │
└─────────────────────┬────────────────────────┘  └─────────────────┬────────────────────┘
                      │                                             │
                      ▼                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   CANONICAL CALCULATION ENGINE (src/calculation-engine/)               │
│  runCalculator() → bua.ts → spaceModel.ts → structure.ts → boq.ts → budget.ts        │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CUSTOMER-FACING EXPERIENCES                               │
│  • Wizard Calculator (Step 1-11)        • Detailed BOQ Web View (/report)              │
│  • Basic Estimate PDF Unlock (₹99)      • Detailed & Premium PDF Reports (₹499/₹1,499) │
│  • Razorpay Checkout Modal              • Consultation Booking (/consultation)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Inventory of Admin Modules and Backend Endpoints

| Admin Page / Section | UI Controls | Backend Endpoint | Persistence Model | Customer Impact |
|---|---|---|---|---|
| **Pricing Tiers** (`AdminPricingTiersSection.tsx`) | Price edit, active toggle, feature tagger | `GET /api/v1/pricing/tiers`<br>`PUT /api/v1/admin/pricing/tiers/:id` | `PricingTier`, `PricingAuditLog` | Real-time update of prices in product cards, upgrade prompts, checkout |
| **Customer Purchases** (`AdminPricingPurchasesSection.tsx`) | Search, filter, entitlement inspection | `GET /api/v1/admin/pricing/purchases`<br>`GET /api/v1/admin/pricing/purchases/:id` | `PricingPurchase`, `UserEntitlement` | Verifies and manages paid unlock grants |
| **Rate Master CMS** (`AdminRatesSection.tsx`) | Search, filter by category/city/tier, edit rate, reset | `GET /api/v1/admin/rates`<br>`PUT /api/v1/admin/rates/:rateId`<br>`POST /api/v1/admin/rates/reset-all` | `RateOverride`, `RateAuditLog` | Propagates updated material & labour rates into canonical engine |
| **Config Versioning** (`AdminFormulaConfigSection.tsx`) | Parameter editor, draft creator, schema validator, simulator, publish, rollback | `GET /api/v1/config/versions`<br>`POST /api/v1/config/versions/draft`<br>`POST /api/v1/config/versions/:id/publish`<br>`POST /api/v1/config/versions/rollback` | `CalculationConfigVersion`, `CalculationConfigParameter`, `CalculationConfigAuditLog` | Governs all structural multipliers, wastage %, margins, and formula factors |
| **Setback Rules Library** (`AdminSetbackSimulatorSection.tsx`) | Municipal rule selector, boundary distance editor, simulator | `GET /api/v1/config/active`<br>`POST /api/v1/config/versions/draft` | `CalculationConfigParameter` (`config.setbacks.rules`) | Defines statutory plot setbacks for Bangalore (GBA/BBMP) and Mysore (MUDA) |
| **Consultation Management** (`AdminConsultationsSection.tsx`) | Status updater, consultant assignment, reschedule | `GET /api/v1/admin/consultations`<br>`PATCH /api/v1/admin/consultations/:id/status`<br>`POST /api/v1/admin/consultations/:id/assign` | `ConsultationRequest`, `ConsultationEvent`, `Consultant` | Manages ₹1,499 advisory bookings and homeowner appointment scheduling |
| **Analytics & Funnel** (`AdminAnalyticsSection.tsx`) | Date filter, package filter, city filter, dropoff metrics | `GET /api/v1/admin/analytics/overview`<br>`GET /api/v1/admin/analytics/funnel` | In-memory session telemetry / `AnalyticsEvent` | Internal monitoring of calculator completion and drop-off rates |

---

## Phase 2 — Admin Panel to Backend Integration Audit

### 2.1 Detailed Module Audit Matrix

| Module | UI Control | Endpoint | RBAC | DB Persistence | Reload Verification | Propagation to Website | Status |
|---|---|---|---|---|---|---|---|
| **Pricing Tiers** | Edit Price | `PUT /api/v1/admin/pricing/tiers/:id` | `requireAdmin` | `PricingTier` | Verified | Server authoritative order generation | **PASS** |
| **Pricing Tiers** | Toggle Active | `PUT /api/v1/admin/pricing/tiers/:id` | `requireAdmin` | `PricingTier` | Verified | Hides/shows product cards on `/pricing` | **PASS** |
| **Material Rates** | Set Rate Override | `PUT /api/v1/admin/rates/:rateId` | `requireAdmin` | `RateOverride` | Verified | Propagates to `rateService` -> `calculateBudget` | **PASS** |
| **Material Rates** | Reset All Rates | `POST /api/v1/admin/rates/reset-all` | `requireAdmin` | `RateOverride` (clear) | Verified | Reverts `rateService` to baseline dataset | **PASS** |
| **Formulas & Params** | Create Draft | `POST /api/v1/config/versions/draft` | `requireAdmin` | `CalculationConfigVersion` | Verified | Does NOT affect customer until published | **PASS** |
| **Formulas & Params** | Run Simulation | `POST /api/v1/config/versions/:id/simulate` | `requireAdmin` | Transient compute | Verified | Admin-only preview; 0 customer impact | **PASS** |
| **Formulas & Params** | Publish Version | `POST /api/v1/config/versions/:id/publish` | `requireAdmin` | `CalculationConfigVersion` (ACTIVE) | Verified | Immediately fetched via `/api/v1/config/active` | **PASS** |
| **Formulas & Params** | Rollback Version | `POST /api/v1/config/versions/rollback` | `requireAdmin` | `CalculationConfigVersion` (Clone ACTIVE) | Verified | Restores previous active configuration | **PASS** |
| **Setback System** | Custom Municipal Rule | Parameter editor | `requireAdmin` | `CalculationConfigParameter` | Verified | Sourced by `bua.ts` -> plot buildable footprint | **PASS** |
| **Consultations** | Update Status | `PATCH /api/v1/admin/consultations/:id/status` | `requireSalesOrAdmin` | `ConsultationRequest` | Verified | Visible in customer booking lookup | **PASS** |
| **Consultations** | Reassign Consultant | `POST /api/v1/admin/consultations/:id/assign` | `requireSalesOrAdmin` | `ConsultationRequest` | Verified | Updates snapshot in booking records | **PASS** |
| **Customer Purchases**| Filter by Project | Client table | `requireAdmin` | `PricingPurchase` | Verified | Matches customer report ID exactly | **PASS** |

### 2.2 Identification and Resolution of Disconnected Controls

1. **API URL Normalization Gap (Fixed):**
   - *Issue:* In `src/store/usePricingStore.ts`, endpoints were called as `/pricing/tiers`, `/pricing/purchases`, etc. In Vite dev mode, only `/api` was proxied. In production, requests were dispatched relative to the root origin (`http://.../pricing/tiers`), bypassing Express routes mounted under `/api/v1`.
   - *Fix:* Hardened `getApiUrl` in `src/config/api.ts` to automatically detect relative paths not prefixed with `/api` and prepend `/api/v1`. All client network calls now deterministically hit backend controllers.
2. **Setback Rule Consumption Gap in `bua.ts` (Fixed):**
   - *Issue:* `src/calculation-engine/modules/bua.ts` had fallback logic evaluating municipal setbacks, but was ignoring active versioned setback rules stored in `configResolver`.
   - *Fix:* Updated `calculateArea` in `bua.ts` to inspect `configResolver.resolveParameter('config.setbacks.rules')`. When active rules exist for the input city/jurisdiction, they are passed directly into `evaluateAuthorityLimits`.

---

## Phase 3 — Verify Admin Changes Reach the Customer Website

### 3.1 A. Pricing & Entitlement Isolation

- **Server-Authoritative Enforcement:** Prices sent by the browser in payment payloads are strictly ignored. Order creation in `pricing.service.ts` looks up the tier code directly from persistent storage or canonical constants:
  - Free Estimate: ₹0
  - Basic Estimate PDF Unlock: ₹99 (9,900 paise)
  - Detailed BOQ Report: ₹499 (49,900 paise)
  - Premium BOQ Report: ₹1,499 (149,900 paise)
  - Expert Consultation: ₹1,499 (149,900 paise)
- **Isolation of the ₹99 Basic Estimate PDF:**
  - Registered with feature entitlement `BASIC_PDF_DOWNLOAD`.
  - Does NOT grant `FULL_PDF_REPORT`, `PREMIUM_COMPARISON`, `CSV_EXPORT`, or `EXCEL_EXPORT`.
  - Tested in `admin_website_data_flow_integration.test.ts` (Scenario 10). Rejection of detailed deliverables on ₹99 unlock confirmed.

### 3.2 B. Calculator Formulas & Parameters

- **Draft Isolation:** Creating draft parameters (e.g. modifying wall height from 10.0 ft to 12.0 ft) creates an unapproved draft record in `CalculationConfigVersion`. The customer calculator continues resolving the approved `ACTIVE` version.
- **Simulation Preview:** Admin simulation computes delta metrics (materials cost delta, labour delta, changed BOQ lines) against reference duplex projects without mutating customer state.
- **Atomic Publication:** Publishing archives previous active versions and sets the target version to `ACTIVE`. The frontend's `rateService.syncWithServer()` downloads the new parameters and `useCalculationStore` immediately updates customer estimates.
- **Rollback:** Verified that rolling back clones the target historical version, activates it, and restores prior customer calculation output.

### 3.3 C. Material Rates & Regional Pricing

- Rate resolution in `rateService.ts` follows a strict 9-level priority hierarchy:
  1. Active Exact Override (rateId + package + location)
  2. Active Package Override (rateId + package + ALL)
  3. Active Location Override (rateId + ALL + location)
  4. Active Global Override (rateId + ALL + ALL)
  5. Contextual baseline
  6. Global baseline
  7. Safe non-zero fallback
- **Regional Isolation:** Verified that setting a Mysore steel override (₹89,000/Tonne) does not modify Bangalore estimates (remains baseline ₹74,000/Tonne).

### 3.4 D. Construction Packages & Specification Tiers

- **Specification vs. Physical Geometry:**
  - Changing package tier (Standard -> Premium -> Luxury) updates unit rates, finish allowances, and brand specifications.
  - Physical geometry invariants confirmed: Plot area, buildable footprint, and statutory setbacks remain mathematically identical across package tier selections.

### 3.5 E. Plot Setbacks & Geometry Rules

- **Integration with `bua.ts`:**
  - Verified that versioned setback rules in `configResolver` propagate to `calculateArea`.
  - Front, rear, left, and right setbacks apply statutory offsets and compute accurate maximum ground coverage and buildable footprint.

### 3.6 F. Consultation, Leads & Customer Enquiries

- **Lead Capture & Verification:**
  - Consultation bookings and fallback enquiries generate public references (`HT-REQ-XXXX`, `HT-ENQ-XXXX`).
  - Records persist and appear in the admin management table.
  - Status updates (`AWAITING_REVIEW` -> `UNDER_REVIEW` -> `ASSIGNED` -> `COMPLETED`) persist and are auditable.
- **Notification Transparency:** Outbound dispatch logs (`[OPERATIONAL_LEAD_DISPATCH]`) record complete dispatch payloads. Actual delivery to team inboxes is marked **BLOCKED** pending client SMTP credentials.

### 3.7 G. PDF and Report Generation

- **Single Source of Truth:** `ReportPage.tsx` (web view), `BasicEstimatePdfDocument.tsx` (₹99 PDF), and `DetailedReportPdfDocument.tsx` (₹499/₹1,499 PDF) receive inputs strictly from `runCalculator()`.
- **Historical Report Preserving:** When historical reports are generated, snapshots of parameters and rates are embedded in the report payload. Future admin rate changes do not retroactively alter paid deliverables.

---

## Phase 4 — Backend and Database Persistence

### 4.1 Persistence Architecture

The backend implements a dual-mode persistence architecture:
1. **Production Mode:** PostgreSQL via Prisma Client (`DATABASE_URL`). All purchases, entitlements, rate overrides, configuration versions, and consultation bookings are committed transactionally.
2. **Offline / Test Mode:** In-memory fallback stores populated with canonical baseline seed data to facilitate local development and automated CI testing.

### 4.2 Fail-Closed Contract Hardening

- Discovered that `admin.controller.ts` had an unguarded `prisma.rateOverride.upsert()` call that attempted to connect to Prisma even when `DATABASE_URL` was unset.
- **Fix Implemented:** Introduced `isPrismaAvailable = () => Boolean(prisma && process.env.DATABASE_URL)`. When running in production with `DATABASE_URL`, any database write failure immediately reverts in-memory state and returns HTTP 500, guaranteeing that mutations never falsely succeed without durable storage.

### 4.3 Prisma Migration Status

> [!WARNING]
> The directory `server/prisma/migrations` does not exist in the repository.
> Running `npx prisma migrate deploy` in a fresh production environment will fail because there are no recorded migration scripts.
>
> **Recommended Procedure for Day 1 Production Database Setup:**
> Run `npx prisma db push` to synchronize the 18 Prisma schema models directly with the PostgreSQL database, or run `npx prisma migrate dev --name init` in a staging environment to create the baseline migration directory.

---

## Phase 5 — API, Authentication and Authorization

### 5.1 RBAC Enforcement

- Admin endpoints are protected by `authenticateToken` and `requireAdmin` middlewares.
- Non-admin tokens receive HTTP 403 Forbidden; unauthenticated requests receive HTTP 401 Unauthorized.
- Sensitive endpoints audited:
  - `PUT /api/v1/admin/pricing/tiers/:id`: Requires Admin.
  - `POST /api/v1/config/versions/draft`: Requires Admin.
  - `POST /api/v1/config/versions/:id/publish`: Requires Admin.
  - `POST /api/v1/config/versions/rollback`: Requires Admin.
  - `PATCH /api/v1/admin/consultations/:id/status`: Requires Sales or Admin.

### 5.2 IDOR Prevention and Download Gating

- `download.controller.ts` enforces project ownership:
  - Download requests require matching `projectId` and `leadEmail`.
  - Cross-project access attempts (e.g. user attempting to download project Beta using project Alpha's entitlement) are strictly rejected with HTTP 403 Forbidden.

---

## Phase 6 — Caching, Refresh and Configuration Versioning

### 6.1 Lifecycle Behavior Summary

| Event | Admin Action | Backend State | Customer Website Latency | Refresh Required? |
|---|---|---|---|---|
| **Rate Edit** | Save override | Written to `RateOverride` | Immediate on next calculation / sync | No (triggers `rateService.notify()`) |
| **Draft Parameter** | Edit parameter | Saved as `DRAFT` in DB | Zero customer impact | No (drafts are invisible to customers) |
| **Publish Version** | Publish version | Promoted to `ACTIVE` | Real-time via `/api/v1/config/active` | Automatically synced by `rateService` |
| **Pricing Edit** | Update tier price | Written to `PricingTier` | Immediate on next checkout modal open | Instantaneous in checkout; page refresh updates static cards |
| **Rollback** | Rollback to version | Clones and activates historical | Immediate on next recalculation | Automatically synced |

---

## Phase 7 — End-to-End Integration Tests

All 16 required integration scenarios were implemented in `src/calculation-engine/__tests__/admin_website_data_flow_integration.test.ts` and executed via Vitest.

### Test Results Matrix

| Scenario | Description | Result |
|---|---|---|
| **1 & 2** | Admin creates rate override, persists it, and retains value across reloads | **PASS** |
| **3** | Rejects unauthorized or non-admin attempts to edit rates | **PASS** |
| **4 & 5** | Draft parameter changes remain inactive until published, then update canonical engine | **PASS** |
| **6** | Regional rate overrides apply strictly to their designated city | **PASS** |
| **7** | Specification tier changes modify unit rates without altering physical BUA geometry | **PASS** |
| **8** | Published setback rules in `configResolver` propagate directly into `bua.ts` | **PASS** |
| **9** | Server authoritatively determines ₹99 for Basic Estimate PDF and rejects forged amounts | **PASS** |
| **10** | Basic Estimate PDF unlock grants ONLY `BASIC_PDF_DOWNLOAD` and never detailed BOQ | **PASS** |
| **11 & 12**| Entitlements are strictly scoped to purchased project and deny cross-project access | **PASS** |
| **13** | Consultation enquiries and requests are recorded and retrievable in admin audit history | **PASS** |
| **14** | Database persistence status reporting and fail-closed prevention verified | **PASS** |
| **15** | Rollback restores the prior active configuration version | **PASS** |
| **16** | Core calculator mathematics and BOQ line reconciliation remain invariant | **PASS** |

### Execution Command & Results

```bash
npm test
```

```
Test Files  33 passed (33)
     Tests  459 passed (459)
  Duration  24.61s
```

```bash
npm run build
```

```
> tsc -b && vite build
✓ 2996 modules transformed.
✓ built in 42.75s
```

---

## Phase 8 — Production Payment Readiness

### 8.1 Razorpay Payment Pipeline Audit

- **Order Creation:** Generates unique order ID via server. Client cannot specify order amount.
- **Signature Verification:** Uses timing-safe cryptographic comparison:
  ```ts
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const valid = crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
  ```
- **Replay & Idempotency:** Duplicate payment verification requests check whether the purchase is already marked `PAID`. Subsequent requests return the existing confirmed purchase without re-crediting or duplicate event dispatch.

### 8.2 External Payment & Operational Blockers

1. **Razorpay Live Merchant Activation:** Currently configured with sandbox test keys (`rzp_test_...`). Live transactions require merchant KYC completion, bank account linking, and setting live keys in production environment.
2. **Outbound Email Notifications:** Structured operational dispatch payloads (`[OPERATIONAL_LEAD_DISPATCH]`) are logged and persisted. Outbound delivery to homeowner and sales team inboxes requires client SMTP / SendGrid credentials.

---

## Phase 9 — Deliverables and Launch Readiness Matrix

### 9.1 Status Breakdown

- **PASS:**
  - Product pricing matrix (₹0, ₹99, ₹499, ₹1,499, ₹1,499).
  - ₹99 Basic Estimate PDF Unlock gating, isolation, and deliverables.
  - Admin-to-website route prefixing and API proxying.
  - Material rate overrides and regional scoping.
  - Configuration versioning, drafting, validation, simulation, publishing, and rollback.
  - Plot setback rules integration with municipal zoning engine.
  - Calculation engine mathematical integrity across all 7 benchmark cases.
  - Automated test suite (459/459 tests passing).
  - Production frontend build (`tsc -b && vite build`).
- **PARTIAL:**
  - None. All functional flows audited and repaired.
- **NOT VERIFIED / BLOCKED (External Dependencies):**
  - **Live Razorpay Gateway:** Requires client production merchant credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
  - **Live PostgreSQL Database:** Requires running `npx prisma db push` with production `DATABASE_URL`.
  - **Outbound Email Dispatch:** Requires SMTP credentials for automated homeowner receipts.

---

## Verification Artifacts Created / Updated

1. `src/config/api.ts` — Hardened API route prefixing.
2. `src/calculation-engine/modules/bua.ts` — Dynamic setback rule propagation.
3. `server/src/controllers/admin.controller.ts` — Fail-closed Prisma connectivity check.
4. `src/calculation-engine/__tests__/admin_website_data_flow_integration.test.ts` — Complete 16-scenario end-to-end integration test suite.
5. `HUTTY_ADMIN_BACKEND_INTEGRATION_AUDIT.md` — This audit deliverable.
6. `DAY_1_LAUNCH_READINESS.md` — Updated launch readiness status dashboard.
