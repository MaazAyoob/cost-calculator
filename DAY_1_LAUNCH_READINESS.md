# HUTTY — DAY 1 LAUNCH-READINESS AUDIT & VERIFICATION REPORT

**Sprint Date:** October 13, 2026  
**Status:** READY FOR STAGING / BLOCKED ONLY ON EXTERNAL GATEWAY & EMAIL CREDENTIALS  
**Canonical Pricing Matrix:** Free Estimate (₹0) • Basic Estimate PDF Unlock (₹99) • Detailed BOQ (₹499) • Premium BOQ (₹1,499) • Consult an Expert (₹1,499)

---

## 1. Launch Readiness Status Dashboard

| Requirement | Status | Evidence | Remaining Action |
|---|---|---|---|
| **Gateway configuration and KYC** | **BLOCKED** | `server/src/services/razorpay.service.ts` uses sandbox fallback keys (`rzp_test_...`); order generation and HMAC verification logic work, but merchant KYC & bank settlement activation require human client intervention. | Provide live Razorpay `KEY_ID` and `KEY_SECRET` in environment variables; complete business verification in Razorpay Dashboard. |
| **Correct product pricing** | **PASS** | `src/config/pricing.ts`, `src/types/pricing.ts`, `src/features/pricing/PricingPage.tsx`, and `server/src/constants/pricing.constants.ts` enforce ₹0 (Free), ₹99 (Basic Estimate PDF Add-on), ₹499 (Detailed BOQ), ₹1,499 (Premium BOQ), and ₹1,499 (Consultation). Verified by Vitest test suite (`basic_estimate_pdf_unlock.test.ts`, `pricing_model_v1.test.ts`, `day1_launch_readiness_audit.test.ts`). | None. Pricing is completely unified and authoritative across frontend, backend, and modals. |
| **Basic Estimate PDF Unlock (₹99)** | **PASS** | `BasicEstimatePdfDocument.tsx`, `UnlockBasicPdfModal.tsx`, `pdfService.ts`, and `download.controller.ts` deliver a concise 1-page PDF summary. Includes hero budget, plot geometry, BUA, 4-row high-level cost distribution table, and verbatim early estimate disclaimer. Strictly excludes itemized BOQ and material takeoff schedules. | None. Implemented, verified, and gated behind server-authoritative ₹99 payment. |
| **Payment verification** | **PASS** | `server/src/services/pricing.service.ts` (`confirmPurchasePayment`) and `server/src/services/consultation.service.ts` implement cryptographic HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret)`). Replay attacks rejected; idempotency guaranteed. | None. Signature verification unit-tested and hardened. |
| **Payment failure/retry** | **PASS** | `src/components/modals/UnlockBasicPdfModal.tsx` and `UnlockReportModal.tsx` record failed payments via `failPurchasePayment`, preserve state, and prevent unauthorized unlocking. UI renders explicit retry CTA without granting offline access. | None. Unpaid access loopholes sealed. |
| **Secure paid entitlements** | **PASS** | `server/src/controllers/download.controller.ts` differentiates `basic` vs `detailed` downloads. Rejects unauthenticated downloads with HTTP 403 Forbidden. Enforces strict project-level scoping and IDOR prevention (`purchase.projectId === projectId` and `purchase.leadEmail === email`). | None. Server-side download gating strictly enforced. |
| **Detailed BOQ accuracy** | **PASS** | Canonical calculation engine (`boq.ts`, `budget.ts`, `structure.ts`, `finishes.ts`) audited against Fixture A ($30 \times 40$ ft, single floor, 1,200 sq.ft) and Fixture B ($40 \times 60$ ft, G+4, 12,000 sq.ft). Physical quantities invariant; sub-totals strictly reconcile without double-counting. Verified across all test fixtures. | None. Calculation engine verified across 32 test suites. |
| **Premium deliverables** | **PASS** | Concrete deliverables for ₹1,499 tier implemented: (1) Section 05 Contractor Quote Audit & Missing Scope Redlines, (2) Section 06 Finish Sensitivity Matrix, (3) Section 07 Multi-Scenario Layout Comparison. Rendered in `ReportPage.tsx` and Page 6 of `DetailedReportPdfDocument.tsx`. | None. Premium value is tangible and verified in both web report and exported PDF. |
| **Electrical and plumbing costs** | **PASS** | `src/calculation-engine/electrical.ts` and `src/calculation-engine/plumbing.ts` provide positive rates across points, conduits, wiring, pipes, fixtures, and fittings. Reconciled in BOQ breakdown under `SERVICES` category. | None. Zero-cost service traps eliminated. |
| **Website/PDF reconciliation** | **PASS** | `src/features/report/pdfService.ts`, `BasicEstimatePdfDocument.tsx`, and `DetailedReportPdfDocument.tsx` consume the identical canonical calculation engine output as `ReportPage.tsx`. Total costs, BUA, and trade breakdowns match 1:1. Exact mandatory disclaimer embedded verbatim in all PDFs. | None. Exported PDFs align perfectly with web view. |
| **Consultation booking** | **PASS** | `src/features/consultation/ConsultationPage.tsx` and `server/src/services/consultation.service.ts` decoupled from calculator tiers at flat ₹1,499. Supports all 4 advisory reasons: Contractor quote check, Find architect/engineer, Site problem resolution, and General guidance. | None. Booking flow and price point verified. |
| **Expert fallback** | **PASS** | `src/features/consultation/components/ExpertFallbackModal.tsx` provides high-conversion enquiry capture with automatic routing to Hutty Expert Desk (`HT-ENQ-XXXX`). Integrated into directory header, empty states, and "help me choose" action. | None. Homeowner leads are never lost when consultant slots are unavailable. |
| **Lead delivery** | **PASS** | All calculator leads, consultation bookings, and fallback enquiries persist in PostgreSQL / store and log structured operational dispatch payloads `[OPERATIONAL_LEAD_DISPATCH]`. External email dispatch ready for client SMTP keys. | Connect production SendGrid / AWS SES / SMTP credentials when ready for outbound homeowner emails. |
| **Mobile journey** | **PASS** | Tested on 375px and 390px viewports (iPhone SE & 14/15 Pro). Drawer navigation, sticky mobile CTA bars, touch-friendly form fields, and responsive modal dialogues verified. | None. Mobile viewport UX verified without horizontal clipping. |
| **Desktop journey** | **PASS** | Tested on 1280px+ viewports. 3D structural viewer, side-by-side BOQ breakdown tables, multi-column comparison grids, and consultation directory render with high visual polish. | None. Desktop journey verified end-to-end. |
| **Production configuration** | **PASS** | `npm run build` (`tsc -b && vite build`) passes cleanly with exit code 0. Zero TypeScript errors. Strict CORS configuration in `server/src/index.ts`. No production secrets baked into client bundles. | Configure production environment variables on deployment server. |

---

## 2. Product Architecture & ₹99 Basic Estimate PDF Unlock

### A. Product Matrix & Separation of Tiers

1. **Free Estimate — ₹0:**
   - Free calculator usage, free real-time calculation, and free on-screen estimate viewing on `http://localhost:3000/#/report`.
   - On-screen cost summary, built-up area calculation, and room breakdown are 100% accessible without any payment.
   - PDF downloading is locked behind payment.
   - User messaging: *"Your estimate is ready. You can view your estimate here for free."* with clear CTA: *"Download Basic Estimate PDF — ₹99"*.

2. **Basic Estimate PDF Unlock — ₹99 (One-Time Purchase):**
   - **Scope:** Concise 1-page executive summary PDF for the specific project/report.
   - **Deliverables Included:**
     - Project name or reference (`report.projectId`).
     - Plot dimensions ($L \times W$) and basic house configuration (floors, house type, execution timeline).
     - Estimated gross built-up area (BUA) and footprint per floor.
     - Approximate total estimated construction cost and effective BUA rate (₹/sq.ft).
     - Simple high-level cost breakdown table (4 rows: Direct Construction Materials, Direct Trade Labour, Installed Fixtures & Finishes, Commercial Reserves & Overheads).
     - Selected construction package or specification tier.
     - Mandatory verbatim early estimate disclaimer.
   - **Explicit Exclusions:**
     - Item-by-item trade BOQ line items.
     - Granular material takeoff schedules (steel kg/tonnage, cement bags, sand CFT, block counts).
     - Electrical or plumbing quantity schedules.
     - Contractor quote audit and missing scope redlines.
     - Finish specification sensitivity matrix.
     - Multi-scenario layout comparison.
     - Premium-only report sections, CSV exports, and Excel workbooks.
   - **Product Classification:** Registered as an **Add-On Product** (`isCalculatorPlan: false`), ensuring that general calculator plans on `/pricing` remain clean (Free ₹0, Detailed BOQ ₹499, Premium BOQ ₹1,499).

3. **Detailed BOQ — ₹499 (Existing Calculator Plan):**
   - Itemized works BOQ, complete material takeoff schedules, trade labour schedules, full PDF report download, and CSV export.
   - Inherently includes Basic Estimate PDF download.

4. **Premium BOQ — ₹1,499 (Existing Calculator Plan):**
   - Comprehensive multi-scenario layout comparison, contractor quote audit & redlines, finish sensitivity matrix, and full export suite.

5. **Consult an Expert — ₹1,499 (Separate Professional Service):**
   - 1-on-1 consultation with verified Bangalore architects/engineers. Strictly decoupled from calculator tiers.

---

### B. Payment & Entitlement Security Enforcement

- **Server-Authoritative Pricing:** The backend strictly resolves the price of `BASIC_ESTIMATE_PDF` to 9,900 paise (₹99.00) in `server/src/constants/pricing.constants.ts`. Any client-supplied amount or price is completely ignored.
- **Razorpay Order Creation:** Generated via `pricingService.initiatePurchase` using standard backend order creation flow.
- **Server-Side HMAC-SHA256 Verification:** `confirmPurchasePayment` verifies cryptographic signatures against `RAZORPAY_KEY_SECRET`. Replay attacks and tampered signatures are rejected with explicit errors.
- **Idempotency:** `grantEntitlementsForPurchase` checks existing active entitlements by feature code, ensuring duplicate webhook events or frontend callbacks never produce duplicated entitlements.
- **Strict Project Scoping & IDOR Prevention:**
  - In `server/src/services/pricing.service.ts` (`getUserEntitlements`), entitlements are scoped to `projectId`. A purchase for Project A strictly does not unlock Project B, even if requested with the same user email.
  - In `server/src/controllers/download.controller.ts`, requests with `orderRef` validate that `purchase.projectId === projectId` and `purchase.leadEmail === email`. Cross-project tampering is rejected with HTTP 403 Forbidden.
- **Entitlement Isolation:** Unlocking the ₹99 Basic Estimate PDF grants **ONLY** `BASIC_PDF_DOWNLOAD`. It strictly does **NOT** grant `DETAILED_BOQ`, `FULL_PDF_REPORT`, `REPORT_DOWNLOAD`, `PREMIUM_COMPARISON`, or `EXPERT_CONSULTATION`.
- **Client Store Persistence:** `useEntitlementStore` persists unlocked report IDs in `localStorage` under `hutty-report-entitlements`, surviving browser refresh and application restarts.

---

### C. Design Tokens & Mandatory Verbatim Disclaimer

The Basic Estimate PDF is built with `@react-pdf/renderer` adhering strictly to Hutty design system tokens:
- **Primary Green:** `#1B3D34`
- **Green Light / Accent:** `#2A5C4E` / `#F0F5F3`
- **Amber Accent:** `#F28C28`
- **Body Grey:** `#4B5563`
- **Background:** `#FFFFFF` and `#F9FAFB`
- **Font Family:** Helvetica (Clean PDF typography)

#### Mandatory Verbatim Disclaimer Box
Prominently rendered in a styled amber alert box on the PDF:
> *"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked."*

---

## 3. Test Verification & Actual Results

### A. Automated Vitest Test Suite
- **Command:** `npm test` (`vitest run`)
- **Result:** **32 passed (32 test files), 444 passed (444 tests), 0 failures**
- **Execution Duration:** ~38.0s

#### Acceptance & Security Test Suite: `src/calculation-engine/__tests__/basic_estimate_pdf_unlock.test.ts`
All 17 requirements verified by automated tests:
1. `Requirement 1`: Free users can calculate and view complete estimates without payment (Passed).
2. `Requirement 2`: Free users cannot download Basic Estimate PDF without entitlement (Passed).
3. `Requirement 3`: The PDF purchase price is exactly ₹99 (9,900 paise) server-authoritatively (Passed).
4. `Requirements 4 & 5`: Basic PDF contains summary scope and strictly excludes detailed BOQ and premium schedules (Passed).
5. `Requirement 6`: Verified payment unlocks Basic PDF for the specific project (Passed).
6. `Requirements 7, 8 & 9`: A ₹99 purchase strictly isolates entitlement and does NOT unlock Detailed BOQ (₹499), Premium BOQ (₹1,499), or Consultation (₹1,499) (Passed).
7. `Requirement 10`: Failed, cancelled, pending payments leave the PDF locked, and tampered HMAC signatures are rejected (Passed).
8. `Requirement 11`: Payment processing and entitlement granting are idempotent across duplicate callbacks/webhooks (Passed).
9. `Requirement 12`: Prevents cross-project and cross-user entitlement leakage (IDOR) (Passed).
10. `Requirement 13`: Entitlements are correctly recorded in state and store persistence keys (Passed).
11. `Requirement 14`: Existing ₹499 Detailed BOQ and ₹1,499 Premium BOQ flows remain fully preserved (Passed).
12. `Requirement 15`: Consistent pricing architecture across backend constants and UI config (Passed).
13. `Requirement 16`: Canonical calculator output matches PDF breakdown data source (Passed).
14. `Requirement 17`: Transparent validation when critical pricing data or tier codes are invalid (Passed).

### B. Production Build Verification
- **Command:** `npm run build` (`tsc -b && vite build`)
- **Result:** **Exit Code 0 cleanly**. Transformed 2,996 modules and emitted optimized production assets in `dist/`. Zero TypeScript compilation errors.

---

## 4. Remaining Launch Blockers (External Dependencies)

| Blocker | Nature | Impact | What is Needed |
|---|---|---|---|
| **Razorpay Live Merchant Activation & KYC** | External Business Dependency | Live transactions cannot be processed without production merchant credentials. | Client must complete KYC in Razorpay Dashboard, generate Live Key ID/Secret, and set in production environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`). |
| **Outbound Email Relay Credentials (SMTP/SendGrid)** | External Infrastructure Dependency | Homeowner PDF delivery emails and booking confirmation emails cannot be dispatched outward to consumer inboxes automatically. | Client to supply SMTP / SendGrid / AWS SES API credentials to connect with existing operational dispatch pipeline (`[OPERATIONAL_LEAD_DISPATCH]`). |
| **Production PostgreSQL Database Deployment** | Hosting / Infrastructure | Local and staging environments run with seamless in-memory fallback; persistent cloud deployment requires PostgreSQL connection. Note: `server/prisma/migrations` does not exist in repo; use `npx prisma db push`. | Supply production `DATABASE_URL` in cloud environment and execute `npx prisma db push` to synchronize all 18 Prisma schema models. |

---

## 5. Summary of Files Changed

| File Path | Description of Changes |
|---|---|
| `server/src/constants/pricing.constants.ts` | Added `PRICING_TIER_CODES.BASIC_ESTIMATE_PDF` (₹99 / 9,900 paise), added `PRICING_FEATURES.BASIC_PDF_DOWNLOAD`, and seeded tier as active and purchasable. |
| `server/src/services/pricing.service.ts` | Server-authoritative ₹99 resolution in `initiatePurchase`, idempotent entitlement granting in `grantEntitlementsForPurchase`, and strict project-level IDOR scoping in `getUserEntitlements`. |
| `server/src/controllers/download.controller.ts` | Added `requiredType: 'basic' | 'detailed'` parameter to `verifyDownloadEntitlement`. Authorizes basic PDF with `BASIC_PDF_DOWNLOAD` or ₹99 purchase; rejects Detailed BOQ downloads with informative error. |
| `server/src/controllers/admin.controller.ts` | Added `isPrismaAvailable()` check to prevent runtime crashes when `DATABASE_URL` is unset, maintaining strict fail-closed contract when running against PostgreSQL. |
| `src/config/api.ts` | Hardened `getApiUrl` to automatically normalize relative endpoints to `/api/v1/...`, resolving 404s on un-prefixed pricing and admin endpoints. |
| `src/calculation-engine/modules/bua.ts` | Connected `configResolver.resolveParameter('config.setbacks.rules')` directly to `evaluateAuthorityLimits`, enabling versioned municipal setback rules to propagate into customer footprint calculations. |
| `src/types/pricing.ts` | Added `BASIC_ESTIMATE_PDF` to `PricingTierCode`, `BASIC_PDF_DOWNLOAD` to `PricingFeatureCode`, and `isCalculatorPlan` flag to `PricingTier`. |
| `src/config/pricing.ts` | Added `BASIC_PDF_DOWNLOAD` feature metadata, registered `tier-basic-pdf-99` with `isCalculatorPlan: false`, and tagged calculator plans with `isCalculatorPlan: true`. |
| `src/store/useEntitlementStore.ts` | Added `basicPdfUnlockedReports`, `hasBasicPdfAccess`, `grantBasicPdfAccess`, and `revokeBasicPdfAccess`. |
| `src/store/usePricingStore.ts` | Added `hasBasicPdfAccess` checking `BASIC_PDF_DOWNLOAD` or `FULL_PDF_REPORT`. |
| `src/features/report/BasicEstimatePdfDocument.tsx` | Concise 1-page executive summary PDF with brand tokens, hero budget, geometry grid, 4-row cost distribution table, report notice, and verbatim disclaimer. |
| `src/features/report/pdfService.ts` | Added `generateBasicEstimatePdfBlob`, `generateAndDownloadBasicEstimatePdf`, and `viewBasicEstimatePdfInNewTab`. |
| `src/components/modals/UnlockBasicPdfModal.tsx` | Dedicated responsive checkout modal for ₹99 Basic Estimate PDF with Razorpay integration and instant post-payment download. |
| `src/features/report/ReportPage.tsx` | Integrated "Download Basic Estimate PDF — ₹99" action in top control bar and free estimate banner, mounted `<UnlockBasicPdfModal />`. |
| `src/calculation-engine/__tests__/admin_website_data_flow_integration.test.ts` | Created 16-scenario comprehensive end-to-end integration test suite covering admin price, rate, formula, package, and setback propagation to website. |
| `HUTTY_ADMIN_BACKEND_INTEGRATION_AUDIT.md` | Full 9-phase architecture, data flow, module integration matrix, and security audit deliverable. |
| `DAY_1_LAUNCH_READINESS.md` | Documented ₹99 Basic Estimate PDF product scope, pricing rules, test results, and launch readiness status. |

---

## 6. Full Admin-to-Website Integration Audit Status (October 13, 2026)

All 33 test files and 459 automated tests passed. Complete data flow from Admin UI to Backend API to Persistent Storage to Canonical Engine and Customer UI verified:

- **PASS:** Pricing Tier Enforcement (₹0 / ₹99 / ₹499 / ₹1,499 / ₹1,499)
- **PASS:** Basic Estimate PDF Unlock Isolation (`BASIC_PDF_DOWNLOAD` only)
- **PASS:** Canonical Engine Formula Versioning (Draft isolation, Simulation, Atomic Publish, Rollback)
- **PASS:** Material Rate Overrides & Regional Scoping (Bangalore vs Mysore)
- **PASS:** Package Tier Physical Geometry Invariance (Standard / Premium / Luxury)
- **PASS:** Plot Setback System V2 Integration in `bua.ts`
- **PASS:** Consultation & Homeowner Enquiry Recording and Admin Retrieval
- **PASS:** Customer Report Download Authorization & Project Scoping (IDOR Prevention)
- **PASS:** Production Frontend Build (`tsc -b && vite build` — 0 errors)
- **NOT VERIFIED / EXTERNAL BLOCKER:** Live Razorpay Merchant Activation & KYC Credentials
- **NOT VERIFIED / EXTERNAL BLOCKER:** Outbound Email Relay Credentials (SMTP/SendGrid)
- **NOT VERIFIED / EXTERNAL BLOCKER:** Production PostgreSQL Cloud Database Provisioning (`npx prisma db push`)

