# HUTTY — DAY 1 PRE-LAUNCH READINESS AUDIT

**Brand:** Hutty  
**Tagline:** *Build your home with clarity.*  
**Status Date:** October 2026  
**Overall Readiness Verdict:** **READY FOR STAGING / PRE-LAUNCH VERIFIED**  
**Remaining Blockers:** External production payment gateway KYC & production SMTP credentials (human client actions required).

---

## 1. Executive Status Dashboard

All operational criteria are classified using standard launch-readiness tags:
- **PASS** — Verified with test evidence.
- **FAIL** — Tested and failed.
- **BLOCKED** — Requires human action, client KYC, or external third-party setup.
- **NOT VERIFIED** — Adequate evidence is unavailable.

| Domain / Requirement | Status | Evidence & Verification Details | Remaining Action / Launch Requirement |
|---|---|---|---|
| **Authoritative Pricing Matrix** | **PASS** | `server/src/constants/pricing.constants.ts` and `src/config/pricing.ts` strictly enforce: Free (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499), and Consult an Expert (₹1,499). Obsolete ₹99 price is deactivated and expunged from customer-facing pages. | None. Authoritative across frontend, backend, and checkout. |
| **Guest-First Preliminary Estimate** | **PASS** | Guest homeowners can access `/calculator` without authentication. All 8 stages function smoothly, culminating in preliminary gross BUA, cost range, and material needs on Stage 7 without forcing sign-up. | None. Sign-up prompt deferred until saving, purchasing, or retrieving reports. |
| **8-Stage Mobile Journey** | **PASS** | Implemented in `src/features/planner/stages/` (Plot, Home, Rooms, Buildable Space, Construction Style, Finishes & Materials, Estimate, Detailed BOQ). Tested at 375px mobile, 768px tablet, and 1280px+ desktop viewports. | None. Verified responsive layout with no horizontal clipping. |
| **State Preservation & Backward Navigation** | **PASS** | Stepping backward through stages preserves all plot dimensions, room counts, and material selections in `useWizardStore`. | None. Accidental progress loss prevented. |
| **Canonical Calculation Integrity** | **PASS** | `src/calculation-engine/` remains the single source of truth. Physical quantities of steel, cement, sand, and blocks are calculated deterministically. Tier upgrades alter rates and commercial access, not physical math. | None. Tested across standard Bangalore plot fixtures ($30 \times 40$, $30 \times 50$, $40 \times 60$). |
| **GBA Setback Rules Integration** | **PASS** | Configured in `gbaRules.ts` from `GBA_Setback_Rules_Feet_Reference.pdf`. Accurately derives front, rear, and side setbacks, distinguishing plot area from buildable envelope and plinth footprint. | None. Connects published rules directly to the planning engine. |
| **Electrical & Plumbing Itemization** | **PASS** | Service calculations in `electrical.ts` and `plumbing.ts` provide positive rates across points, conduits, wiring, and fixtures. Reconciled under `SERVICES` in BOQ breakdown without zero-cost traps. | None. Fully itemized. |
| **Report Generation & Reconciliation** | **PASS** | Web report ([`ReportPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/ReportPage.tsx)) and exported PDF ([`DetailedReportPdfDocument.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/DetailedReportPdfDocument.tsx)) consume the exact same `CalculationResult` model. Totals, subtotals, and material quantities agree to the rupee. | None. Report preview and PDF download reconciled. |
| **Mandatory Planning Disclaimer** | **PASS** | Embedded verbatim on footer, calculator estimate stage, web report dossier, and all generated PDFs: *"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked."* | None. Disclaimer prominently positioned. |
| **Plain Language Terminology** | **PASS** | High-cognitive-load engineering terms replaced: *"Material takeoff"* → *"Materials needed"*; *"Structural steel physics"* → *"Steel needed for the house"*; *"Spatial allocation"* → *"Room layout"*; *"Bank-ready BOQ"* → *"Detailed construction cost report"*. | None. Terminology standardized across the platform. |
| **Paid Entitlement Isolation** | **PASS** | Server-side entitlement checks enforce strict product boundaries: Free users receive preliminary estimate; ₹499 grants Detailed BOQ only; ₹1,499 Premium grants premium deliverables; Consultation payment grants consultation booking only. | None. Server-authoritative gating enforced. |
| **Payment Verification & Security** | **PASS** | `confirmPurchasePayment` verifies cryptographic HMAC-SHA256 signatures. Idempotency guarantees prevent duplicate entitlements on repeated webhook delivery. Project ownership checks prevent IDOR attacks. | None. Tested with sandbox credentials. |
| **Payment Failure & Retry Handling** | **PASS** | Failed gateway attempts trigger explicit error feedback in checkout modals with retry options, without granting offline access. | None. Unpaid access paths sealed. |
| **Gateway Production Credentials & KYC** | **BLOCKED** | Payment integration works in sandbox mode. Switching to live production gateway mode requires client business verification, PAN/GST KYC, and live production API secret keys from the payment gateway. | Human client action required: Complete merchant KYC on payment gateway dashboard and configure live production credentials in environment variables. |
| **Consultation Landing & Categories** | **PASS** | Implemented at `/consult` with verified hero copy, 6 canonical categories, 4 popular services, and flat ₹1,499 pricing. Decoupled from calculator tiers. | None. Responsive marketplace layout verified. |
| **"Talk to a Hutty Expert" Fallback** | **PASS** | Integrated into consultation directory and empty states. Concierge submissions persist to PostgreSQL / store and generate unique tracking references (`HT-ENQ-XXXX`). | None. No lost homeowner leads when slots are unavailable. |
| **Professional Registration & Review** | **PASS** | Flow at `/professionals/join` captures qualifications, COA/licence details, experience, and verification consent. Submissions route to the Admin review queue. Unapproved applicants do not appear publicly. | None. Application flow operational. |
| **Admin Panel Preservation** | **PASS** | Existing Formula System V2, configuration resolver, draft/publish workflow, and setback configuration remain active and fully functional. | None. Admin Panel operational. |
| **Outbound Email & SMS Dispatch** | **BLOCKED** | Leads and bookings log structured operational dispatch payloads (`[OPERATIONAL_LEAD_DISPATCH]`). Sending external outbound emails/SMS to homeowners requires connecting client production SMTP / SendGrid credentials. | Human client action required: Supply production SMTP/SendGrid credentials in server environment variables. |
| **Production Build & Zero Lint Errors** | **PASS** | `tsc -b && vite build` compiles cleanly with exit code 0. Zero TypeScript or build errors. | None. Production bundle verified. |

---

## 2. Approved Product & Pricing Structure

Synchronized strictly between frontend display, store state, and backend authority:

| Product / Service | Approved Price | Status | Implemented Deliverables & Access Scope |
|---|---|---|---|
| **Free Estimate** | **₹0** | **ACTIVE** | Full 8-stage interactive home planner, gross built-up area (BUA) and footprint calculations, preliminary construction cost range (±4%), material consumption estimates (steel tonnes, cement bags, sand volumes), 3D house massing view, plot layout preview. Available to all visitors without mandatory sign-up. |
| **Detailed BOQ** | **₹499** | **ACTIVE** | Everything in Free Estimate, plus itemized civil and MEP works bill of quantities, granular material takeoff schedules, trade labour milestone payment plan, and high-resolution downloadable PDF report for discussion with contractors or banks. |
| **Premium BOQ** | **₹1,499** | **ACTIVE** | Everything in Detailed BOQ, plus multi-scenario layout comparison (comparing floors and area configurations), contractor quote audit & missing scope redlines checklist, finish specification sensitivity matrix, and permanent cloud save. |
| **Consult an Expert** | **₹1,499** | **ACTIVE** | **Strictly decoupled from calculator tiers.** 45-minute 1-on-1 private online advisory session with Council of Architecture (COA) registered architects or chartered structural engineers via Google Meet. Covers plan reviews, contractor quote audits, setback questions, and site issue troubleshooting. |
| *Basic Estimate PDF (Historical)* | *₹99* | **INACTIVE** | Deactivated and removed from public purchasable tiers and customer-facing interfaces. Preserved only in historical database migration schema for past transaction integrity. |

---

## 3. Security, Entitlements & IDOR Prevention

1. **Server-Authoritative Price Resolution:**
   - Any client-submitted amount or price in payment payloads is completely ignored by `server/src/services/pricing.service.ts`. The server resolves the exact amount in minor units (paise) from canonical constants.
2. **Cryptographic Verification:**
   - Webhook and payment verification endpoints implement HMAC-SHA256 cryptographic verification against the configured gateway secret.
3. **Idempotency & Replay Protection:**
   - Repeated webhook deliveries check for existing entitlement records by `(projectId, featureCode)`, preventing duplicate grants or double-charging.
4. **Strict Project Scoping & IDOR Prevention:**
   - Report download endpoints verify that the requesting user's identity or order reference matches the project's recorded purchaser. Cross-project tampering is rejected with HTTP 403 Forbidden.

---

## 4. Production Build Verification

- **Frontend Build:** `npm run build` executed successfully.
  - TypeScript compilation: 0 errors.
  - Vite production bundle generated without missing dependencies.
- **Backend Architecture:** Express + TypeScript compiled cleanly.
  - Schema integrity verified via Prisma schema definitions.
  - CORS policies configured for production frontend domain (`https://cost-calculator-ten-kappa.vercel.app`).

---

## 5. Remaining Pre-Launch Client Actions

Before switching DNS and opening the application to live financial transactions:
1. **Payment Gateway Production Keys (BLOCKED):**
   - Provide live production `KEY_ID` and `KEY_SECRET` in server environment variables.
   - Complete merchant KYC and bank account settlement setup in the gateway dashboard.
2. **Outbound Email Dispatch (BLOCKED):**
   - Provide production SMTP credentials (e.g. SendGrid, AWS SES, or custom SMTP) to enable automated homeowner PDF dispatch and booking confirmation emails.
3. **Explicit Deployment Authorization:**
   - In accordance with non-negotiable project rules, no automated deployments to Vercel/Render or live financial transactions will be initiated without explicit client sign-off.
