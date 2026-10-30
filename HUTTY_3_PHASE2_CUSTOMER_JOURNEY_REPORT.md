# HUTTY 3.0 — PHASE 02: CORE CUSTOMER JOURNEY & CALCULATOR TRANSFORMATION REPORT

**Execution Date:** October 30, 2026  
**Project:** Hutty 3.0  
**Phase:** 02 — Core Customer Journey & Calculator Visual Transformation  
**Verification Baseline:** 60/60 test suites passed, 796/796 tests passing, Frontend & Backend TypeScript Clean (0 errors), Production Vite Build Clean  

---

## EXECUTIVE SUMMARY

Phase 02 transforms the primary customer-facing journeys of **Hutty 3.0** into a cohesive, architectural construction intelligence platform. Built on the design foundation established in Phase 01, this release elevates the **Homepage (`/`)**, the **8-Stage Calculator Studio (`/calculator`)**, the **Estimate Summary & BOQ Report (`/report`)**, and the **Expert Consultation Platform (`/consult`)**.

Throughout all changes, the **Protected Systems Mandate** was strictly preserved:
- Zero modifications to the canonical calculation engine (`src/calculation-engine/`).
- Zero modifications to backend routes, controllers, or services (`server/`).
- Zero modifications to PostgreSQL Prisma schemas or migrations.
- Zero modifications to Cashfree payment gateway configurations, webhook signatures, or session handling.
- **100% of unit, integration, and E2E tests remain passing (796 / 796).**

---

## 1. MODULES COMPLETED

### Module A — Homepage Transformation (`/`)
- **Hero Experience:** Restyled with high-impact architectural headline (*"Your home begins with a clearer plan."*), human-centred photography (`hero-house-render.jpg`), real-time Bangalore residential cost calculator preview, primary calculation CTA, and smooth-scrolling secondary CTA (*"How Hutty Works"*).
- **11 Editorial Storytelling Sections:**
  1. *Hero Experience:* Split architectural canvas with interactive plot presets and 3D building viewer.
  2. *Introduction to Hutty (`IntroductionSection.tsx`):* Photographic split composition featuring professional site engineer (`professional-engineer.jpg`), technical fidelity pillars, and IS 456/1786 compliance.
  3. *Construction Intelligence Features (`FourOfferingsSection.tsx`):* Clear cards answering the 4 foundational questions: *"What should it cost?"* (Free), *"What am I paying for?"* (₹499), *"Should I sign this?"* (₹1,499), and *"Where is my money going?"* (Tracking).
  4. *How Hutty Works (`ThreeEasyStepsSection.tsx`):* 3 guided steps paired with family architectural planning photography (`how-it-works-family.jpg`).
  5. *Calculator Showcase (`InteractiveDemoSection.tsx`):* Live, interactive calculation module connected to `runCalculator()`.
  6. *Construction Stages (`SignaturePlanningTimelineSection.tsx`):* 13-stage milestone progression from concept to handover.
  7. *Materials & Cost Transparency (`SignatureConstructionBreakdownSection.tsx`):* Concrete quantities in m³, Fe550D rebar in tonnes, cement bags, and masonry blocks.
  8. *Why Homeowners Should Use Hutty (`WhyPlanningSection.tsx`):* Comparison matrix contrasting conventional contractor lump-sum pitfalls with Hutty's quantity-first planning.
  9. *Trust & Credibility (`EngineeringStandardsSection.tsx`):* Dark forest green technical showcase displaying IS 456, IS 1786, and NBC 2016 calculation flow.
  10. *Consultation Call-to-Action (`SignatureExpertSection.tsx`):* Independent COA architect plan review and contractor quote audit for flat ₹1,499 with photographic banner (`consultation-architect.jpg`).
  11. *FAQ Section (`FaqSection.tsx`):* Clean accordion addressing municipal bye-laws, material brand comparisons, and bank loan appraisals.

### Module B — Calculator Wizard Transformation (`/calculator`)
- **Guided Architectural Studio Shell (`PlannerPage.tsx`):**
  - Slim brand and progress header with 8-stage interactive track and proportional progress line.
  - Live preliminary estimate banner providing early financial feedback as selections evolve.
  - Docked sticky action bar with tactile previous and next transitions.
- **8 Completely Refined Wizard Stages:**
  - *Stage 1 (Plot):* Standard Bangalore plot presets (20'×30', 30'×40', 30'×50', 40'×60'), custom width/depth inputs with live aspect preview, land approval options, and planning authorities (BBMP/BDA, MUDA).
  - *Stage 2 (Home):* Floor count cards (Ground to G+4), building purpose (Single family, Rental units, Villa, Farmhouse), parking models (Ground, Stilt, EV charging).
  - *Stage 3 (Rooms):* Dual-mode architecture with Quick Estimate mode (sample 3BHK duplex assumptions) and Custom Layout mode with fast reset capability.
  - *Stage 4 (Buildable Space):* Automated setback calculations evaluated via `evaluatePlotSetbacks()` against Bangalore bye-laws, showing boundary envelope and statutory coverage limits.
  - *Stage 5 (Construction Style):* Structural systems (RCC framed vs Load-bearing), walling materials (Concrete blocks, Clay bricks, AAC), and specification tiers (Standard, Premium, Luxury).
  - *Stage 6 (Finishes & Materials):* Tabbed architectural selector for flooring, openings, MEP services, paints, and brand comparisons.
  - *Stage 7 (Your Estimate):* Turnkey cost summary, effective rate/sq.ft, mathematical cost breakdown (materials, labour, fixtures), physical material takeoff summary, and fast-track customization jumps.
  - *Stage 8 (Detailed BOQ):* 8-item work-wise preview table and report tier selection cards (Detailed BOQ ₹499 vs Premium Consultation ₹1,499).
- **Snapshot & 3D Preview Panel (`LivePreviewPanel.tsx`):**
  - Real-time cost delta feedback chip (`+₹X` / `-₹X`) with 2.8s fade duration.
  - Integrated `Architectural3DViewer` with live Three.js massing updates.

### Module C — Estimate Summary & BOQ Presentation (`/report`)
- **Architectural Report Dossier (`ReportPage.tsx`):**
  - Modernized with `#E5E7EB` drafting borders and `#18211E` / `#707873` editorial hierarchy.
  - Preserved the four canonical reporting sections:
    1. *What We Build:* Direct construction budget, gross BUA, timeline, and high-level distribution.
    2. *What We Consume:* Physical quantities (RCC concrete in m³, masonry wall coverage in sq.ft + Nos, structural steel in tonnes, cement in bags, sand in CFT).
    3. *What We Install:* Fixtures and fittings schedules for doors, windows, electrical, and plumbing.
    4. *Costs:* Reconciled direct costs, overheads, statutory taxes, and reserves.
  - Fully maintained milestone payment plan (10%, 15%, 20%, 20%, 15%, 15%, 5%).
  - Retained all authoritative PDF generation, dev previewing, and server-side entitlement checks.

### Module D — Expert Consultation Platform (`/consult`)
- **Advisory Experience (`ConsultationPage.tsx`, `ConsultationHero.tsx`, `ConsultantCard.tsx`):**
  - Refined with architectural photography, credentialed specialist tags (COA, M.Tech Structural, RICS), and clear pricing (flat ₹1,499).
  - Preserved full Cashfree booking request creation, session IDs, and idempotent checkout modals.

---

## 2. SCREENS & ROUTES REDESIGNED

| Route | Primary Component | Key Visual & UX Improvements |
| :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | 11 editorial sections, human photography, interactive live demo, clear CTAs |
| `/calculator` | `PlannerPage.tsx` | 8 guided studio stages, real-time delta tracking, 3D building viewer, auto-save |
| `/report` | `ReportPage.tsx` | Editorial pre-construction dossier, tabular numbers, gated Detailed BOQ, PDF export |
| `/consult` | `ConsultationPage.tsx` | Professional directory, verified specialist badges, Cashfree integration |

---

## 3. INVENTORY OF FILES CHANGED

### Components Created (1)
- `src/features/landing/sections/IntroductionSection.tsx`

### Components & Routes Modified (28)
- **Landing Journey:**
  - `src/features/landing/LandingPage.tsx`
  - `src/features/landing/sections/HeroSection.tsx`
  - `src/features/landing/sections/ThreeEasyStepsSection.tsx`
  - `src/features/landing/sections/FourOfferingsSection.tsx`
  - `src/features/landing/sections/FaqSection.tsx`
- **Planner & Calculator Stages:**
  - `src/features/planner/PlannerPage.tsx`
  - `src/features/planner/LivePreviewPanel.tsx`
  - `src/features/planner/stages/Stage1Plot.tsx`
  - `src/features/planner/stages/Stage2Home.tsx`
  - `src/features/planner/stages/Stage3Rooms.tsx`
  - `src/features/planner/stages/Stage4BuildableSpace.tsx`
  - `src/features/planner/stages/Stage5ConstructionStyle.tsx`
  - `src/features/planner/stages/Stage6FinishesMaterials.tsx`
  - `src/features/planner/stages/Stage7Estimate.tsx`
  - `src/features/planner/stages/Stage8DetailedBOQ.tsx`
- **Report & BOQ Presentation:**
  - `src/features/report/ReportPage.tsx`
- **Consultation Platform:**
  - `src/features/consultation/ConsultationPage.tsx`
  - `src/features/consultation/ConsultantProfilePage.tsx`
  - `src/features/consultation/ProfessionalJoinPage.tsx`
  - `src/features/consultation/components/ConsultantCard.tsx`
  - `src/features/consultation/components/ConsultationHero.tsx`
  - `src/features/consultation/components/ConsultationBookingModal.tsx`
  - `src/features/consultation/components/ConsultationCategoriesGrid.tsx`
  - `src/features/consultation/components/ConsultationFilters.tsx`
  - `src/features/consultation/components/ConsultationTrustStrip.tsx`
  - `src/features/consultation/components/ExpertFallbackModal.tsx`
  - `src/features/consultation/components/HowConsultationWorksSection.tsx`
  - `src/features/consultation/components/MyConsultationsModal.tsx`
  - `src/features/consultation/components/PopularConsultationsSection.tsx`

---

## 4. PROTECTED FILES CONFIRMED UNTOUCHED

The following critical system files were verified with zero modifications:
- **`src/calculation-engine/**`:** All 31 core calculation modules, formula solvers, and data configs (`calculator.ts`, `rateMaster.ts`, `configResolver.ts`, `spaceModel.ts`, etc.).
- **`src/calculation-engine/__tests__/**`:** All 60 unit, integration, and E2E test suites.
- **`server/**`:** All backend Express routers, controllers, middleware, Cashfree webhooks, and Prisma schemas.
- **`src/services/pdf/**`:** PDF document definitions, fonts, and render trees.

---

## 5. TEST & VERIFICATION RESULTS

### 1. Frontend TypeScript Compilation (`npx tsc -b`)
- **Status:** Passed  
- **Errors:** 0

### 2. Backend TypeScript Compilation (`npx tsc -p server`)
- **Status:** Passed  
- **Errors:** 0

### 3. Full Vitest Test Suite (`npx vitest run`)
- **Test Files:** 60 passed (60)
- **Tests:** 796 passed (796)
- **Duration:** 54.96s
- **Regressions:** 0

### 4. Production Vite Build (`npm run build`)
- **Status:** Successful
- **Build Duration:** 29.21s
- **Transformed Modules:** 3,018 modules
- **Chunks Generated:** All pages and vendor bundles compiled cleanly into `dist/`

---

## 6. OUTSTANDING ISSUES & RECOMMENDED PHASE 03

### Outstanding Minor Observations
- All functional paths, payments, and calculation models are completely sound.
- Vite build produces a chunk advisory regarding `vendor-pdf` (~1.4MB) due to `@react-pdf/renderer` bundling, which is already split into a separate vendor chunk.

### Recommended Phase 03: Customer Account Portal & Professional Network Polish
1. **Customer Account Portal (`/account`, `/dashboard`):**
   - Modernize saved project cards, estimation history, and unlocked report archives with the Hutty 3.0 tokens.
2. **Professional Network Experience (`/professionals/join`):**
   - Refine the architect/engineer registration journey and verification credential upload flows.
3. **Admin Rate Master & Scenario Workbench:**
   - Polish the internal admin control center for live rate updates and formula configuration testing.

