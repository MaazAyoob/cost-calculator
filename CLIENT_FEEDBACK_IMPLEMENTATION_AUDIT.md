# HUTTY — PRE-LAUNCH UI/UX, SIMPLE LANGUAGE & CUSTOMER JOURNEY AUDIT
**Document**: `CLIENT_FEEDBACK_IMPLEMENTATION_AUDIT.md`  
**Date**: October 2026 (Pre-Launch Baseline)  
**Author**: Antigravity Senior Engineering & Quantity Surveying Pair Programmer  
**Authoritative Reference**: `Hutty_Developer_Change_Request_Simple_Language.pdf`  
**Prototype Reference**: `hutty_calculator_ui_prototype.html`  
**Status**: Completed Pre-Implementation Audit & Execution Plan  

---

## 1. Executive Summary

Hutty is a residential construction planning and cost-estimation platform for Indian homeowners (initially Bangalore and Mysore). This audit inspects the current end-to-end customer journey, pricing mechanisms, consultation workflows, reports, and UI terminology against the explicit client change request documented in `Hutty_Developer_Change_Request_Simple_Language.pdf`.

### Core Directive
> **"Make Hutty easy for any homeowner to understand—even if they know nothing about construction."**  
> Retain Hutty’s architectural character and existing brand identity (`#1B3D34` green, `#F28C28` selective accent), without unnecessarily rebuilding the application. Replace confusing technical jargon with everyday homeowner language, correct the pricing model to the client's confirmed 3-tier calculator + separate consultation model, eliminate the old ₹99 price, and provide a clear, guided experience.

---

## 2. Pricing & Commercial Model Audit

### 2.1 The Client's Confirmed Pricing Authority
The client's handover document establishes four distinct offerings:

| Product | Confirmed Price | Purpose & Meaning |
|---|---|---|
| **Calculator — Free** | **₹0** | Explore the house plan and see a basic estimate. Clearly show what is included for free. |
| **Calculator — Detailed BOQ** | **₹499** | Get a detailed report showing the work, materials, and estimated costs for your house. |
| **Calculator — Premium** | **₹1,499** | An upgraded calculator package with clearly explained additional benefits (confirmed features only). |
| **Consult an Expert** | **₹1,499** | A separate professional consultation service to speak with a suitable professional (session length, scope, format). |

### 2.2 Critical Pricing Findings & Gaps in Current Code

1. **The Deprecated ₹99 Price Remains in Multiple Locations**:
   - `src/types/pricing.ts`: Defines `ESTIMATE_99` (9900 paise) as an active tier.
   - `src/config/pricing.ts`: Contains `tier-estimate-99` ("₹99 Verified Estimate").
   - `server/src/constants/pricing.constants.ts`: Defines `ESTIMATE_99` = `9900` paise.
   - `src/features/pricing/PricingPage.tsx`: Displays a full card for "₹99 Verified Feasibility".
   - `src/components/modals/UnlockReportModal.tsx`: Allows users to select between ₹99 and ₹499.
   - `src/features/landing/sections/SignaturePricingSection.tsx`: Features "₹99 One-time Verified Specification Plan".
   - `src/components/layout/WebsiteHeader.tsx`: Displays "Free preview, ₹99 verified, ₹499 bank-ready BOQ".
   - `src/components/layout/WebsiteFooter.tsx`: Mentions preliminary ₹99 feasibility.

2. **The ₹1,499 Calculator — Premium Plan is Missing from the Calculator Tiers**:
   - The calculator currently only offers `FREE`, `ESTIMATE_99`, and `DETAILED_ESTIMATE_499`, while `COMPLETE_PACKAGE` is marked "Coming Soon" with price 0.
   - The client explicitly requires the calculator to have three prices: **Free (₹0)**, **Detailed BOQ (₹499)**, and **Premium (₹1,499)**.
   - Consultation is a **separate, decoupled service** also priced at **₹1,499**. They must have separate descriptions, purchase flows, and order identities.

3. **Pricing Typos & Inconsistencies Found**:
   - `src/features/report/ReportPage.tsx` line 218 displays: `Unlock Detailed Report — ₹4,999` (a 10x typo compared to ₹499 on line 646 and 688).
   - Checkout modal on `ReportPage.tsx` must strictly charge ₹499 for Detailed BOQ.

4. **Server-Side Price Authority Verification**:
   - `server/src/services/pricing.service.ts` already enforces server-authoritative price resolution (ignoring any client-passed amount).
   - Tier seeds and constants in `server/src/constants/pricing.constants.ts` and `src/config/pricing.ts` must be updated to:
     - `FREE`: 0 paise (₹0)
     - `DETAILED_BOQ_499` (or `DETAILED_ESTIMATE_499`): 49,900 paise (₹499)
     - `PREMIUM_1499`: 149,900 paise (₹1,499)
     - `ESTIMATE_99`: Inactive / Deprecated for new purchases, preserving historical completed orders.
     - Consultation: strictly handled by `ConsultationService` at 149,900 paise (₹1,499).

5. **Confirmed vs. Unconfirmed Benefits for Calculator — Premium (₹1,499)**:
   - What is implemented: Full 22-section BOQ, itemized materials schedule, installed fixtures, labour wage allocations, downloadable official PDF, cloud project saving, multi-scenario comparisons, and premium specification customization.
   - What must NOT be promised: Site visits, CAD drawing delivery, bank guarantees, or free consultation sessions (consultation is separate).

---

## 3. Customer-Facing Terminology & Language Audit

The client provided explicit wording translations to make Hutty accessible to first-time homeowners.

### 3.1 Terminology Replacement Matrix

| Current / Technical Wording in Code | Plain Language Replacement Required | Status in Code |
|---|---|---|
| **Built-Up Area (BUA)** | **Total built-up area** (explain simply once: *"The total construction floor area across all floors, including walls and corridors."*) | Used in 50+ components with little or no explanation. |
| **Material takeoff** | **Materials needed** | Used in `ReportPage`, `LivePreviewPanel`, `LandingPage`. |
| **Structural steel physics** | **Steel needed for the house** | Used in `CostAmbiguityTrapSection`, `HeroSection`. |
| **Spatial matrix / spatial allocation** | **Room layout** | Used in `FeatureShowcaseSection`, `PlannerPage`. |
| **Deterministic calculation** | **How we calculate your estimate** | Used in `HeroSection`, `CostAmbiguityTrapSection`, `SEO`. |
| **Trade labour / execution trades** | **Labour and work costs** | Used in `ReportPage`, `PricingPage`, `DownloadsTab`. |
| **Budget disbursement roadmap** | **Payment plan** | Used in `ReportPage`, `SignaturePlanningTimelineSection`. |
| **Bank-ready BOQ dossier** | **Detailed construction cost report** (Do not promise bank acceptance) | Used in `PricingPage`, `WebsiteHeader`, `UnlockReportModal`. |
| **Verified specification plan** | **Save your choices** | Used in `SignaturePricingSection`, `PricingPage`. |
| **Massing / geometry synthesis** | **3D house view and plot layout** | Used in `LandingPage`, `HeroSection`, `WhyPlanningSection`. |
| **Conflict-free guarantee** | **Clear information to help you discuss the work with your contractor** | Used in `SignatureExpertSection`, `ConsultationHero`. |
| **"Your contractor is oversmarting you?"** | **"Not sure about your contractor’s quote? Check the work and costs, or speak to an expert."** | Previously used in marketing copy; must be checked and sanitized. |
| **"Zero guesswork" / "Calculated to the inch"** | Replace with realistic planning phrases; remove unsubstantiated claims. | Present in metadata, headers, feature cards. |

---

## 4. Homepage Audit (`src/features/landing/`)

### 4.1 Required Client Headings & CTAs
- **Main Heading**:  
  *“Understand your home before you build.”*  
  *(Currently: "Build with mathematical clarity.")*
- **Supporting Text**:  
  *“Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it.”*  
  *(Currently: "From raw plot dimensions to verified steel and cement quantities, estimate your entire construction budget before you break ground.")*
- **Main Action Buttons**:  
  - Primary: **“Start Free Estimate”** -> Navigates to `/calculator`
  - Secondary: **“Consult an Expert — ₹1,499”** -> Navigates to `/consult`
- **Cost Ambiguity Trap Section**:  
  Replace adversarial contractor framing with homeowner clarity: *"Not sure about your contractor’s quote? Check the work and costs, or speak to an expert."* Remove ungrounded 25%–40% claims or support with contextual explanation.
- **Pricing Section (`SignaturePricingSection.tsx`)**:  
  Align with the 3 confirmed calculator tiers (Free / ₹499 / ₹1,499) and separate ₹1,499 consultation spotlight.

---

## 5. Calculator Customer Journey Audit (`src/features/planner/`)

### 5.1 Journey Structure & Layout
- The 10-step guided wizard in `PlannerPage.tsx` matches the prototype aesthetic (`hutty_calculator_ui_prototype.html`): top progress bar, step pills navigation, main form area, and right `LivePreviewPanel.tsx` ("Home Snapshot").
- **Gaps Identified**:
  1. Technical labels: "Planning Takeoff", "Calculated Physical Takeoff", "Gross Built-Up Area (BUA)".
  2. Input helper text: Step 1 lacks an everyday plain-language explanation of what BUA means.
  3. Mobile responsiveness: On small screens (< 768px), the review and form controls must stay comfortable and prominent.
  4. Cost delta indicator: Clarify cost updates as user changes selections.

---

## 6. Results Screen & PDF Report Audit (`src/features/report/`)

### 6.1 Website vs. PDF Parity
- The canonical calculator engine (`calculator.ts` -> `calculateBudget`, `calculateArea`, `calculateQuantities`) is the single source of truth for both the web report (`ReportPage.tsx`) and the PDF generator (`DetailedReportPdfDocument.tsx` via `pdfService.ts`).
- **Gaps Identified**:
  1. **Mandatory Estimate Note Missing**:  
     The client explicitly requires this exact note:  
     > **"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked."**  
     It must be visibly rendered near the estimate figures on `ReportPage.tsx` (both before and after unlock) and in `DetailedReportPdfDocument.tsx`.
  2. **Typo in Unlock Button**: Line 218 in `ReportPage.tsx` has `₹4,999` instead of `₹499`.
  3. **Section Labels**: Ensure clear standard headings:
     - Section A: Construction Works BOQ (What We Build)
     - Section B: Materials Needed (What We Consume)
     - Section C: Installed Fixtures & Fittings (What We Install)
     - Section D: Cost Summary & Commercial Details (What It Costs)
     - Payment Plan (Milestone Disbursement)
  4. **Rate Verification Notice**: State clearly that rates are estimates based on standard regional retail benchmarks (Q1 2026 Bangalore).

---

## 7. Consultation Journey Audit (`src/features/consultation/`)

### 7.1 Client's Required Experience
- **Suggested Heading**:  
  *“Need help building your home? Talk to an expert.”*  
  *(Currently: "Find the right expert for your home.")*
- **Supporting Text**:  
  *“Get help with your house plan, contractor quote, materials, structure or site questions. Not sure who you need? Tell us about your problem and Hutty will help you find the right person.”*
- **Four Simple Entry Choices (Mandatory)**:  
  1. **“Check my contractor’s quote”**
  2. **“Find an architect or engineer”**
  3. **“Get help with a problem at my site”**
  4. **“I’m not sure — help me choose”**
- **Current State**:  
  The current `/consult` page jumps directly into a filter bar by professional category (`Architect`, `Structural Engineer`, etc.). It lacks the friendly 4-choice entry module that allows non-technical homeowners to start with their problem instead of knowing which profession to look for.
- **Backend & Booking**:  
  The backend `ConsultationService` is fully functional and persists requests to PostgreSQL via Prisma with transactional order generation and in-memory fallback. Fixed pricing of ₹1,499 (`149900` paise) is enforced. Real curated consultant profiles (Ar. Ramesh Nambiar, Er. Sneha Kulkarni, etc.) are present.

---

## 8. Prioritized Implementation Plan

1. **Phase 1: Pricing Model & Checkout Reconciliation**
   - Update `server/src/constants/pricing.constants.ts` and `src/config/pricing.ts` to reflect the 3 calculator tiers (`FREE` = ₹0, `DETAILED_ESTIMATE_499` = ₹499, `PREMIUM_1499` = ₹1,499). Mark `ESTIMATE_99` as deprecated for new purchases.
   - Update `PricingPage.tsx`, `UnlockReportModal.tsx`, and `SignaturePricingSection.tsx` to display and charge Free, ₹499, and ₹1,499.
   - Fix `ReportPage.tsx` typo (`₹4,999` -> `₹499`).
   - Remove references to ₹99 across headers, footers, modals, and landing sections.

2. **Phase 2: Customer Language & Homepage Overhaul**
   - Update `HeroSection.tsx`: new heading, supporting text, and action buttons.
   - Update `CostAmbiguityTrapSection.tsx`: new contractor wording, remove adversarial/unsubstantiated claims.
   - Replace technical terms across `src/features/landing/`, `WebsiteHeader.tsx`, `WebsiteFooter.tsx`, and `SEO.tsx`.

3. **Phase 3: Calculator UI & Plain Language Polish**
   - Update `Step1BasicInfo.tsx` with clear BUA plain-English explanation.
   - Update `LivePreviewPanel.tsx` labels ("Materials needed", "Room layout").
   - Ensure responsive layout behaves cleanly on desktop and mobile.

4. **Phase 4: Results, Reports & Mandatory Estimate Note**
   - Add the mandatory estimate note to `ReportPage.tsx` and `DetailedReportPdfDocument.tsx`.
   - Update section titles to plain language (What We Build, Materials Needed, Fixtures Installed, Cost Summary, Payment Plan).

5. **Phase 5: Consultation Page 4-Choice Guided Entry**
   - Update `ConsultationHero.tsx` with client's heading and supporting text.
   - Build the 4-choice entry selector ("Check my contractor’s quote", "Find an architect or engineer", "Get help with a problem at my site", "I’m not sure — help me choose") that filters or pre-fills the consultation booking workflow.

6. **Phase 6: Quality Assurance, Verification & Reporting**
   - Run Vitest test suite and ensure all tests pass (updating tests that assert old ₹99 pricing to the new authoritative pricing).
   - Run TypeScript type checks and production builds (`npm run build`, `npm --prefix server run build`).
   - Create `CLIENT_FEEDBACK_IMPLEMENTATION_REPORT.md` documenting all executed changes and launch checklist status.
