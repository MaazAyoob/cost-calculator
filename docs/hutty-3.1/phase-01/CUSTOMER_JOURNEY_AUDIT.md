# HUTTY 3.1 — PHASE 01: CUSTOMER JOURNEY & REPORT INTEGRITY AUDIT
## End-to-End Analysis from First Landing to Cashfree Checkout, Entitlement Grant, and Bank-Ready PDF Delivery

> **Document ID:** `HUTTY-3.1-DOC-E-CUSTOMER-JOURNEY-AUDIT`  
> **Status:** Completed & Authoritative  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect & Full-Stack Lead  
> **Scope:** Full customer lifecycle trace, session management, lead capture gates, payment integrity, and PDF document generation.

---

## 1. The Complete Customer Lifecycle Trace

The customer journey across Hutty was audited step-by-step through code inspection and browser runtime execution.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE COMPLETE CUSTOMER LIFECYCLE                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
 [ 1. Public Entry ]  ──►  [ 2. Free Exploration ]  ──►  [ 3. Preliminary Estimate ]
   Homepage / Ad              Chapters 1 to 6              Chapter 7 / Stage 7
   No Login Required          Anonymous session in         Total cost, cost/sqft,
   Instant start              localStorage                 zero registration required
                                                                   │
                                                                   ▼
 [ 6. Report Delivery ] ◄──  [ 5. Cashfree PG ]    ◄──  [ 4. Gated Transition ]
   Instant PDF Download        Order created on server     User clicks "Get BOQ (₹499)"
   Entitlement saved           Seamless modal checkout     or "Save Project"
   Saved to Dashboard          Server webhook verify       Phone & Email captured
```

---

### Step 1: Homepage Entry & Anonymous Visitor Access
- **Can a visitor enter without registration?** **YES.** A first-time user lands on `http://localhost:3000/` and clicks "Start Cost Estimator" or "Calculate Your Build". The user is routed immediately to `/planner` with zero barrier to entry.
- **Anonymous Sessions:** Yes. A unique anonymous `sessionId` (e.g. `calc_sess_179328...`) is generated in `sessionStorage` by [`analytics.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/utils/analytics.ts#L61-L72). No cookie walls or pre-registration modals intercept the visitor.

---

### Step 2: Calculator Progression & In-Flight State Persistence
- **State Storage Mechanism:** The user's active inputs are persisted in `localStorage` under key `hutty_configurator_storage` via Zustand middleware in [`src/store/useWizardStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts#L2-L20).
- **Survival Across Refresh:** **VERIFIED.** Hard-refreshing the browser (`F5` or `Ctrl+Shift+R`) preserves all entered plot dimensions, road widths, floor counts, room counts, and brand selections. The user resumes on the exact stage they left off via the `?stage=X` URL search parameter.
- **Save / Resume Cross-Device:** If the user is unauthenticated, the state exists locally on their device. When authenticated, [`src/store/useProjectStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useProjectStore.ts) synchronizes project snapshots with the backend database (`/api/v1/customer/projects`), allowing multi-device resumption.

---

### Step 3: Registration & Lead Capture Gate Timing
- **When Does Registration Become Mandatory?**
  - **NOT** during the calculator input process (Chapters 1 to 6).
  - **NOT** during the display of the preliminary estimate (Stage 7).
  - Registration or verified lead capture is triggered **ONLY** when the user requests an actionable deliverable:
    1. Clicking "Download Free Basic Summary" triggers [`LeadCaptureModal.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/components/modals/LeadCaptureModal.tsx) (capturing Name, 10-digit Phone, and Email).
    2. Clicking "Save Project to My Account" prompts authentication.
    3. Clicking "Unlock Detailed BOQ (₹499)" or "Premium Package (₹1,499)" opens the checkout drawer, which requires contact details for order creation and receipt delivery.
- **Friction Assessment:** This gating policy matches modern product best practices: provide instant upfront value, establish trust through transparency, and request contact information only when delivering persistent artifacts.

---

### Step 4: Estimate Generation & Free-Tier Presentation
- **Free Estimate Visibility:** Upon completing the space and finishes configuration, the customer arrives at Stage 7 ("Your Estimate").
- **Displayed Metrics:**
  - Total Estimated Project Cost (₹).
  - Direct Construction Cost vs Commercial Costs.
  - Cost per Square Foot (₹/sq.ft).
  - Trade-wise breakdown (Structural, Finishing, MEP).
  - High and low confidence range indicators.
- **Preview BOQ in Free Tier:** On Stage 8 ("Detailed BOQ"), free users can view the Material Summary and the first 5 line items of the Works BOQ. Subsequent line items (masonry anchors, concealed piping, electrical wiring sub-mains) are blurred with an architectural teaser overlay.

---

### Step 5: Paid Tier Presentation & The Pricing Model
The platform currently presents the following commercial tiers:
1. **Free Tier (₹0):** Live high-level estimate, room configuration, basic summary download upon phone/email entry.
2. **Detailed BOQ Tier (₹499):** Complete Section A Works BOQ, Section B Material Schedule, Section C Fixture Schedule, Section E Labour Takeoff, and official downloadable high-res PDF.
3. **Premium Package (₹1,499):** Multi-scenario project comparison, premium specification customization, comprehensive architectural schedule export.
4. **Basic PDF Addon (₹99 - DEPRECATED PER BRIEF):** A legacy 1-page summary PDF still active in `src/config/pricing.ts`. **Must be deactivated per client change request.**
5. **Architect / Engineer Consultation (₹1,499):** Dedicated 1-on-1 expert review service with 4 booking modalities (Virtual 45 min, In-person site visit, BOQ review, Architect consultation).

---

### Step 6: Checkout Initiation & Cashfree PG Handshake
- **Checkout Trigger:** User clicks "Unlock Detailed BOQ for ₹499" or "Book Consultation for ₹1,499".
- **Backend Handshake:** 
  - Call to `/api/v1/payments/create-order` with `packageCode` (`DETAILED_ESTIMATE_499` / `PREMIUM_1499` / `CONSULTATION_1499`).
  - Cashfree Payment Gateway order is initialized with active API credentials in test/production environment.
  - Generates secure `payment_session_id`.
- **Payment Modal:** Cashfree JS SDK v3 renders the payment component inside an architectural modal offering UPI (Google Pay, PhonePe, Paytm), NetBanking, Credit/Debit Cards, and Wallets.

---

### Step 7: Payment Verification & Entitlement Provisioning
- **Verification Flow:**
  - Upon transaction completion, Cashfree redirects to `/payment/callback?order_id=...`.
  - Frontend triggers `verifyCashfreePayment()` calling `/api/v1/payments/verify`.
  - Backend verifies cryptographic webhook/signature with Cashfree servers, transitions order status to `PAID`, records transaction record in PostgreSQL database, and provisions entitlements to user account:
    - Feature codes: `DETAILED_BOQ`, `MATERIAL_SCHEDULE`, `FULL_PDF_REPORT`, `REPORT_DOWNLOAD`.
- **Durability:** Persisted in PostgreSQL `UserEntitlement` and `Transaction` tables. Survives browser cache clearing.

---

### Step 8: PDF Report Generation, QA Gate & Delivery
- **Engine:** Client-side React-PDF (`@react-pdf/renderer`) orchestrated via [`src/features/report/pdfService.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/pdfService.ts).
- **Automated QA Gate Enforced:** Prior to rendering, `runQAGate(data)` executes. If structural integrity rules (e.g. steel $> 5.0\text{ kg/sq.ft}$, negative amounts, unexplained residual) fail, PDF generation is halted with an explicit engineering log.
- **Generated Output:**
  - Comprehensive 8-to-12 page high-resolution bank-ready dossier.
  - Page 1: Cover with Project Name, Owner, Date, City, BUA, Package Tier.
  - Page 2: Executive Summary & Financial Overview.
  - Page 3: Plot, Setback & Space Program Schedule.
  - Page 4–6: Section A — Itemized Works BOQ with serial numbers, trade descriptions, units, quantities, rates, and amounts.
  - Page 7: Section B — Physical Material Takeoff & Procurement Matrix.
  - Page 8: Section C — Installed Fixtures & Sanitary Schedule.
  - Page 9: Section E — Trade Labour Schedule.
  - Page 10: Cashflow Milestone Payment Schedule.
  - Page 11: Engineering Assumptions, NBC References, and Statutory Disclaimers.
  - Page 12: QA Verification Certificate & Sign-off Block.

---

## 2. Customer Friction Points & UX Breakdowns

| # | Journey Stage | Friction / UX Breakdown | Root Cause | Proposed Solution for Phase 02 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Stage 1 Plot | Road width and setbacks are split across stages 1 and 4 | Legacy 8-stage sequence | Consolidate plot, road width, and setbacks into unified Chapter 1 |
| 2 | Stage 6 Finishes | 6 dense tabs (Flooring, Doors, Windows, Electrical, Plumbing, Paint) cause cognitive overload | Tab cramming | Extract Flooring into Chapter 4 and Doors/Windows into Chapter 5 |
| 3 | Stage 6 Flooring | User must select same tile for every bedroom and cannot override individual rooms | Missing UI controls | Add "Apply to All Bedrooms" button + collapsible individual room override pills |
| 4 | Stage 7 Estimate | Contractor Margin vs Direct Cost is confusing to first-time homeowners | Technical wording | Add clear card: "Are you hiring a turnkey contractor or managing labour directly?" with visual fee explanation |
| 5 | Stage 8 Checkout | Presence of old ₹99 PDF addon creates price confusion against ₹499 Detailed BOQ | Lingering config | Deprecate ₹99 tier completely; show clear distinction between Free (₹0) and Detailed BOQ (₹499) |
| 6 | Mobile Devices | Live preview panel steals screen space on small screens | Sticky bottom bar crowding | Implement bottom-sheet drawer for Live Preview on viewports $< 768\text{px}$ |

---

## 3. Section 7 Audit: BOQ, Rate & PDF Integrity Report

A mathematical and visual integrity audit of the generated BOQ and PDF report was conducted:

1. **Rate Reconciliations:**
   - Every single line item in Section A satisfies:
     $$\text{Line Amount} = \text{Quantity} \times \text{Unit Rate}$$
   - No floating-point rounding errors (all amounts rounded via `Math.round(qty * rate)`).
2. **Unit Consistency:**
   - Steel: Tonnes in BOQ, Kg in Material Schedule.
   - Cement: 50kg Bags across all schedules.
   - Concrete: Cubic Metres ($m^3$) in BOQ and Structural Schedule.
   - Walling: Numbers / Pieces for blocks; Cubic Metres for total volume.
   - Flooring: Square Feet (sq.ft) for tiles; Running Feet (R.Ft) for skirting and handrails.
   - Electrical: Points for wiring; Metres for conduits and copper wires; Units for DBs.
   - Plumbing: Points for taps/showers; Metres for CPVC/SWR; Units for sanitary fixtures; Litres for storage tanks.
3. **Upstream-Downstream Dependency Propagation:**
   - Increasing plot length from 40 ft to 60 ft immediately cascades through BUA $\rightarrow$ Steel Tonnage $\rightarrow$ Cement Bags $\rightarrow$ Masonry Count $\rightarrow$ BOQ Amounts $\rightarrow$ Total Cost. Zero lag or stale cache.
4. **Distinguishable Direct vs Commercial Additions:**
   - Materials, Fixtures, and Labour are grouped cleanly in Section D.
   - Contractor Margin (10-15%), Contingency (6%), Architecture Fees (5%), and GST (18%) are listed on distinct rows with exact percentages displayed.
5. **Zero-Residual Check:**
   - Fully verified: $\text{Total Cost} - \sum(\text{Direct} + \text{Additions}) \equiv 0.00$.

