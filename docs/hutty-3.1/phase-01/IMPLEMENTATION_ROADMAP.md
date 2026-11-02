# HUTTY 3.1 — PHASE 01: IMPLEMENTATION ROADMAP
## Phased Architectural Blueprint, Engineering Work Packages, Risk Mitigation & Verification Strategy

> **Document ID:** `HUTTY-3.1-DOC-G-IMPLEMENTATION-ROADMAP`  
> **Status:** Completed & Authoritative  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect & Full-Stack Lead  
> **Pre-requisite:** Phase 01 Comprehensive Audit Approval  
> **Execution Constraint:** Zero modifications to structural calculation formulas, IS-456 rules, or database schema.

---

## 1. Roadmap Architecture & Execution Philosophy

The transformation of Hutty from its current 8-stage developer configuration into the client's mandatory **7-Chapter Homeowner Journey** must be executed with zero disruption to the production calculation engine or existing verified systems.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HUTTY 3.1 EXECUTION TIMELINE                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
 [ PHASE 01: AUDIT & BLUEPRINT ] ◄── CURRENT STATUS (Authoritative Documentation Complete)
            │
            ▼
 [ PHASE 02: SEVEN CHAPTERS & DESIGN SYSTEM ]
            ├── Task 2.1: Re-sequence wizard from 8 stages to 7 chapters
            ├── Task 2.2: Unify Chapter 1 (Plot, Setbacks, Road Width, Footprint)
            ├── Task 2.3: Unify Chapter 2 (Dream Home, Floors, Parking, Rooms)
            ├── Task 2.4: Dedicated Chapter 4 (Flooring & Tiles with "Apply All" + Overrides)
            ├── Task 2.5: Dedicated Chapter 5 (Doors & Windows with Styles & Hardware)
            └── Task 2.6: Simple words glossary integration & statutory disclaimer
            │
            ▼
 [ PHASE 03: ESTIMATE, CONSUMPTION EXPLANATIONS & COMMERCIAL ENGINE ]
            ├── Task 3.1: Chapter 3 "What Am I Consuming?" Micro-Cards (Steel, Cement, Bricks)
            ├── Task 3.2: Chapter 6 Finishes (Electrical, Plumbing, Paint, Cladding)
            ├── Task 3.3: Chapter 7 Preliminary Cost Summary & Work-Wise Breakdown
            └── Task 3.4: Contractor Mode vs Independent Labour Commercial Switch
            │
            ▼
 [ PHASE 04: REPORT TIERS, CASHFREE CHECKOUT & BANK-READY PDF DELIVERY ]
            ├── Task 4.1: Retain ₹99 Basic PDF Tier & ensure clear separation from full BOQs
            ├── Task 4.2: Four-Tier Value Presentation (Free ₹0, Basic ₹99, Detailed ₹499, Premium ₹1,499)
            ├── Task 4.3: Cashfree Payment Gateway v3 Handshake & Entitlement Provisioning
            ├── Task 4.4: Gated Lead Capture & Authenticated Project Save/Resume
            └── Task 4.5: High-Resolution Bank-Ready PDF Dossier Assembly (1-page Basic vs 8-page Detailed vs 10-page Premium)
            │
            ▼
 [ PHASE 05: HOMEPAGE, CONSULTATION & FIRST-PARTY ANALYTICS ]
            ├── Task 5.1: Homepage wording transformation & clear call-to-actions
            ├── Task 5.2: Consultation flow refactor (4 simple choices, ₹1,499 separate service)
            └── Task 5.3: Analytics event telemetry alignment (all 10 funnel events)
            │
            ▼
 [ PHASE 06: END-TO-END VERIFICATION, PERFORMANCE & RELEASE READINESS ]
            ├── Task 6.1: Full Vitest suite run (807+ unit & integration tests)
            ├── Task 6.2: Browser-based end-to-end journey validation on Desktop & Mobile
            └── Task 6.3: Production build compilation & zero-regression certification
```

---

## 2. Phased Work Packages & Deliverables

---

### Phase 02 — The Seven-Chapter Journey & Architectural Design System
**Focus:** Frontend layout restructuring, stage consolidation, and dedicated chapters for finishes.
- **Work Package 2.1: Wizard Re-sequencing (`PlannerPage.tsx`, `useWizardStore.ts`)**
  - Transition `STAGE_CONFIG` from 8 stages to 7 chapters:
    1. *Chapter 1: Tell Us About Your Plot*
    2. *Chapter 2: Tell Us About Your Dream Home*
    3. *Chapter 3: Choose Your Core Construction Materials*
    4. *Chapter 4: Choose Flooring & Tiles for Each Space (DEDICATED)*
    5. *Chapter 5: Choose Doors & Windows (DEDICATED)*
    6. *Chapter 6: Select Electrical, Plumbing & Other Finishes*
    7. *Chapter 7: Review Your Estimate & BOQ*
  - Update progress indicator, step navigation, and URL query params (`?chapter=1..7`).
- **Work Package 2.2: Chapter 1 Plot & Setback Consolidation**
  - Merge existing `Stage1Plot.tsx` and `Stage4BuildableSpace.tsx` into unified `Chapter1Plot.tsx`.
  - Provide a single setback toggle: "Standard Municipal Rules (Auto)" vs "Custom Setbacks".
- **Work Package 2.3: Chapter 2 Dream Home Consolidation**
  - Merge `Stage2Home.tsx` and `Stage3Rooms.tsx` into unified `Chapter2DreamHome.tsx`.
  - Display floor counts, parking, and room counters together with live BUA indicators.
- **Work Package 2.4: Dedicated Chapter 4 — Flooring & Tiles by Space**
  - Build standalone `Chapter4Flooring.tsx`.
  - Implement:
    - Individual space choices (Living/Dining, Master Bed, Other Beds, Kitchen, Bathrooms, Balcony).
    - "Apply to All Similar Spaces" master action button.
    - Collapsible individual room overrides.
- **Work Package 2.5: Dedicated Chapter 5 — Doors & Windows**
  - Build standalone `Chapter5DoorsWindows.tsx`.
  - Feature Main Entrance Door styles, Internal Laminated Doors, Waterproof Bathroom Doors, UPVC Sliding Windows, and Security Grills.
- **Work Package 2.6: Simple Language & Statutory Notice**
  - Replace technical QS jargon with simple homeowner words per `HUTTY-3.1-DOC-F-VISUAL-LANGUAGE-AUDIT`.
  - Render mandatory statutory note on all estimate screens:  
    *"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings, and material choices are checked."*

---

### Phase 03 — Calculation Summary, Transparent Breakdown & Commercial Additions
**Focus:** Explanation of quantities, finishing systems, and commercial clarity.
- **Work Package 3.1: "What Am I Consuming?" Quantity Micro-Cards**
  - Implement intuitive plain-English explanations for Steel Tonnes, Cement Bags, Concrete Volume, and Masonry Blocks in Chapter 3.
- **Work Package 3.2: Chapter 6 Unified Finishes**
  - Build `Chapter6Finishes.tsx` covering:
    - Electrical wiring (Finolex/Polycab) and modular switches (Legrand/Schneider).
    - Plumbing CPVC pipes and sanitaryware sets (Jaquar/Kohler).
    - Interior emulsion painting and exterior anti-algal paint systems.
    - Balcony railings (SS304 Glass vs MS) and architectural front elevation cladding.
- **Work Package 3.3: Chapter 7 Estimate & Commercial Engine**
  - Build `Chapter7ReviewEstimate.tsx`.
  - Provide clear visual split: Direct Construction Budget vs Commercial Execution.
  - Implement homeowner-friendly toggle: "Hiring a Turnkey Contractor" (includes margin, contingency, fees, GST) vs "Managing Labour & Materials Directly".

---

### Phase 04 — Report Tiers, Four-Level Pricing Model & Bank-Ready PDF Delivery
**Focus:** Monetization, payment processing, and document generation across all 4 access levels.
- **Work Package 4.1: Retain ₹99 Basic PDF Tier & Clear Value Distinction**
  - Retain `BASIC_ESTIMATE_PDF` (₹99) as active and purchasable in `src/config/pricing.ts`.
  - Present clear differences: Free (₹0 web summary) vs Basic PDF (₹99 1-page summary) vs Detailed BOQ (₹499 itemized BOQ) vs Premium BOQ (₹1,499 contractor audit & sensitivity).
- **Work Package 4.2: Four-Tier Report Presentation**
  - Implement transparent customer choice cards for all 4 report levels.
  - Explicitly decouple Expert Consultation (₹1,499 separate human advisory service) so it is not confused with report downloads.
- **Work Package 4.3: Cashfree Checkout Handshake & Entitlements**
  - Ensure Cashfree modal triggers cleanly for ₹99, ₹499, and ₹1,499 report purchases, as well as ₹1,499 consultations.
  - Preserve server-side webhook verification and PostgreSQL entitlement persistence.
- **Work Package 4.4: High-Resolution Bank-Ready PDF Dossier**
  - Audit `@react-pdf/renderer` layouts for both `BasicEstimatePdfDocument.tsx` (1-page) and `DetailedReportPdfDocument.tsx` (8-10 pages) to ensure QA gate badges and customer project details render cleanly.

---

### Phase 05 — Homepage, Consultation Flow & Analytics Telemetry
**Focus:** Top-of-funnel conversion, expert consultations, and tracking.
- **Work Package 5.1: Homepage Wording & Visual Polish**
  - Headline: *"Understand your home before you build."*
  - Supporting copy and dual primary buttons: `[ Start Free Estimate ]` and `[ Consult an Expert — ₹1,499 ]`.
  - Remove unverified claims ("bank-ready guarantee", "zero guesswork").
- **Work Package 5.2: Consultation Overhaul (`/consult`)**
  - Implement 4 simple choices:
    1. *Check my contractor’s quote*
    2. *Find an architect or engineer*
    3. *Get help with a problem at my site*
    4. *I’m not sure — help me choose*
- **Work Package 5.3: Analytics Funnel Telemetry**
  - Align `src/utils/analytics.ts` to emit the 10 mandated events: `landing_view`, `calculator_start`, `chapter_started`, `chapter_completed`, `estimate_generated`, `boq_preview_viewed`, `checkout_started`, `payment_success`, `payment_failed`, `report_downloaded`.

---

### Phase 06 — Full Regression, End-to-End Verification & Release Readiness
**Focus:** Quality assurance, performance, and documentation sign-off.
- **Work Package 6.1: Automated Test Suite**
  - Run `vitest` across all 61 test files; verify 100% pass rate.
  - Execute TypeScript builds (`npx tsc -b`, `npx tsc -p server`) with 0 errors.
- **Work Package 6.2: Real Browser End-to-End Audit**
  - Test anonymous guest user completing Chapters 1 to 7.
  - Test Cashfree payment verification and PDF report download.
- **Work Package 6.3: Production Build & Phase Report**
  - Compile production bundle (`npm run build`). Verify bundle size and load speed.

---

## 3. Risk Management & Engineering Mitigations

| Risk # | Description | Severity | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **State Inconsistency on Chapter Re-sequencing:** Changing from 8 stages to 7 chapters might break user's existing `localStorage` state. | High | Users in the middle of estimation might encounter invalid stage numbers or blank screens. | Add a backward-compatible version migration in `useWizardStore.ts` that maps legacy stage `1..8` to new chapter `1..7`. |
| **R-02** | **Accidental Formula or Rate Tampering:** Refactoring UI components might unintentionally alter rates or calculation parameters. | Critical | Calculation outputs deviate from client spec or IS-456 standards. | Enforce strict separation between UI and engine. The calculation engine is read-only; UI components only pass inputs to `runCalculator(input)`. |
| **R-03** | **Cashfree Webhook Desynchronization:** Payment callback fails if network drops before verification completes. | Medium | User pays ₹499 but does not immediately see unlocked BOQ. | Client polling fallback already implemented in `PaymentCallback.tsx` + idempotent database transactions. |
| **R-04** | **PDF Render Freezes on Mobile:** Large PDF generation via `@react-pdf/renderer` in mobile Safari could exhaust memory. | Medium | Mobile browser crash when downloading detailed report. | Offload complex rendering to Web Worker or server-side endpoint if device memory is constrained. |

---

## 4. Quality Gates & Acceptance Verification

Every subsequent phase must satisfy three non-negotiable gates before being deemed complete:
1. **Compilation Gate:** `npx tsc -b` and `npx tsc -p server` must report **0 errors, 0 warnings**.
2. **Automated Test Gate:** `npx vitest run` must pass **100% of tests** (all 807+ tests green).
3. **QA Gate Engine Rule:** Every single calculation execution must pass `runQAGate(result)` with zero blocking structural errors.

