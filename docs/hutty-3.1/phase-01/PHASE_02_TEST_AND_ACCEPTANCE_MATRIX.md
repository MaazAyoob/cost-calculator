# HUTTY 3.1 — PHASE 02: TEST & ACCEPTANCE MATRIX
## Comprehensive Quality Assurance Criteria, Invariance Verifications & Automated Test Specifications

> **Document ID:** `HUTTY-3.1-DOC-PHASE-02-TEST-ACCEPTANCE-MATRIX`  
> **Status:** Final & Authoritative • Acceptance Baseline  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect, Construction-Estimation Systems Analyst & Full-Stack Lead  
> **Target Execution Baseline:** Hutty 3.0 Production Repository (`c:\Users\Avita\Desktop\Programming\big bnglore client\cost calculator rightcon`)

---

## 1. Quality Assurance Architecture & Non-Negotiable Gates

Every pull request, task, and component developed in Phase 02 must satisfy three non-negotiable automated quality gates before merge or presentation:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PHASE 02 QUALITY GATES                                    │
├─────────────────────┬──────────────────────────────────────────────────────────────────┤
│ Gate 1: Compilation │ Client (npx tsc -b) AND Server (npx tsc -p server) must report   │
│                     │ 0 errors and 0 warnings.                                         │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Gate 2: Regression  │ Vitest test suite must maintain 100% pass rate across all 807   │
│                     │ existing tests, plus all newly added Phase 02 acceptance tests.  │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Gate 3: QA Gate Rule│ Every calculation result must pass runQAGate(result) with zero   │
│                     │ blocking structural errors and zero unexplained residual.        │
└─────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 2. Chapter-by-Chapter Acceptance Criteria & Test Specifications

The following table defines the exact acceptance criteria, verification method, test files, and founder approval status across all seven chapters:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SEVEN-CHAPTER ACCEPTANCE SPECIFICATIONS                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Chapter | Requirement & Acceptance Criterion | Existing Implementation File | Verification Method | Target Test File | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **Ch 01** | **Plot & Setbacks:** Anonymous user enters plot dimensions (30×40, 40×60, or custom) and road width. Footprint and setbacks calculate automatically. | [`Stage1Plot.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage1Plot.tsx), [`bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts) | Automated unit test & interactive canvas render | `chapter1_plot_setbacks.test.ts` | **Approved** |
| **Ch 01** | **Setback Overrides:** Custom setback toggle allows entering specific offsets; if offsets exceed plot boundary, inline error is displayed. | `Stage4BuildableSpace.tsx` | Unit test with valid/invalid boundary offsets | `chapter1_plot_setbacks.test.ts` | **Approved** |
| **Ch 02** | **Dream Home & Spaces:** User selects floor count (G to G+4), house use, and room counters. Live BUA updates instantly. | [`Stage2Home.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage2Home.tsx), [`spaceModel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts) | State assertion on `useWizardStore.rooms` | `chapter2_dream_home.test.ts` | **Approved** |
| **Ch 02** | **Upstream Propagation:** Adding a bedroom from 3 to 4 immediately increments doors (+1), windows (+20 sqft), switches (+7), and flooring (+132 sqft). | `spaceModel.ts`, `doors.ts`, `windows.ts` | Dependency assertion across all downstream engines | `space_and_brand_invariance.test.ts` | **Verified** |
| **Ch 03** | **Core Materials Takeoff Display:** Displays physical consumption cards (Steel Tonnes, Cement Bags, Blocks) before brand selection. | [`Stage5ConstructionStyle.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage5ConstructionStyle.tsx) | Component DOM test checking quantity card rendered | `chapter3_core_materials.test.ts` | **Approved** |
| **Ch 03** | **Brand Invariance Law:** Changing steel brand (Tata vs JSW) or cement brand (UltraTech vs ACC) alters rates/cost but leaves kg and bags invariant. | [`brandDatabase.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/brandDatabase.ts) | Strict equality check on `result.quantities.steelKg` | `space_and_brand_invariance.test.ts` | **Verified** |
| **Ch 04** | **Dedicated Flooring Chapter:** Standalone screen displaying Living, Master Bed, Other Beds, Kitchen, Bathrooms, Balconies, and Staircase. | `Chapter4Flooring.tsx` (New) | Route navigation & store verification | `chapter4_flooring_overrides.test.ts` | **Approved** |
| **Ch 04** | **"Apply to All Similar" Action:** Clicking "Apply to all bedrooms" propagates selected tile format to all bedroom instances in state. | `useWizardStore.ts` | Store mutation test | `chapter4_flooring_overrides.test.ts` | **Approved** |
| **Ch 04** | **Space-Level Overrides:** User can override individual room tile (e.g. Italian marble in living room, vitrified in guest bed). | `flooring.ts` lines 50–120 | Unit test with multi-material zone dictionary | `chapter4_flooring_overrides.test.ts` | **Approved** |
| **Ch 05** | **Dedicated Doors & Windows:** Standalone screen displaying Main Teak styles, Internal Flush doors, WPC Waterproof doors, UPVC windows, and MS grills. | `Chapter5DoorsWindows.tsx` (New) | Route navigation & schedule itemization | `chapter5_doors_windows.test.ts` | **Approved** |
| **Ch 05** | **Opening Deductions Invariant:** Wall masonry, plaster, and paint deduction areas equal exact sum of doors and windows opening dimensions. | `brick.ts`, `paint.ts` | Mathematical identity test: $\text{Deductions} \equiv \sum \text{Openings}$ | `final_acceptance_validation.test.ts` | **Verified** |
| **Ch 06** | **Unified MEP & Finishes:** Single screen collecting modular switches, wiring brands, CPVC pipes, sanitary suites, water storage, paint, and railings. | `Chapter6Finishes.tsx` (New) | Component render test & store sync | `chapter6_finishes.test.ts` | **Approved** |
| **Ch 07** | **Estimate Review & Cost Split:** Shows Total Project Cost, Cost per Sq.Ft, and category breakdown (Materials, Labour, Fixtures, Preliminaries). | [`Stage7Estimate.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage7Estimate.tsx), [`budget.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/budget.ts) | Numerical assertion against `runCalculator(input)` | `final_acceptance_validation.test.ts` | **Verified** |
| **Ch 07** | **Mandatory Statutory Notice:** Prominently displays: *"This is an early estimate to help you plan. Final costs and quantities may change..."* | `Chapter7ReviewEstimate.tsx` | Regex string presence test on DOM | `chapter7_statutory_notice.test.ts` | **Approved** |
| **Ch 07** | **Contractor Mode Configurable Defaults:** Defaults to 10% margin, 0% fees, opt-in GST. Zero-residual commercial math confirmed. | `budget.ts` lines 110–150 | Mathematical reconciliation: $\text{Residual} \equiv 0.00$ | `final_acceptance_validation.test.ts` | **Verified** |
| **Ch 07** | **Four-Tier Access Presentation:** Transparent cards for Free (₹0), Basic PDF (₹99), Detailed BOQ (₹499), and Premium BOQ (₹1,499). | `Stage8DetailedBOQ.tsx` | Component test checking 4 distinct checkout cards | `pricing_model_v1.test.ts` | **Approved** |
| **Global**| **Anonymous Completion:** Unauthenticated visitor can progress from Chapter 1 to Chapter 7 without forced login modals. | `useWizardStore.ts` | Headless navigation test without auth token | `customer_lifecycle_e2e.test.ts` | **Approved** |
| **Global**| **Backward Navigation Safety:** User can navigate back to Chapter 1, modify plot length, and return to Chapter 7 without losing selections. | `PlannerPage.tsx` | Step rewind and recalculation assertion | `estimate_completeness_and_modes.test.ts`| **Verified** |

---

## 3. Dedicated Verification Tests for Invariance & State Migration

The following automated test suites will be added in Phase 02 to guarantee zero regression:

### 1. `tests/phase02/chapter_navigation_and_migration.test.ts`
- Tests that legacy `localStorage` states stored under keys `1..8` migrate cleanly to new chapters `1..7`.
- Verifies that URL parameters `?chapter=1` through `?chapter=7` sync accurately with `useWizardStore.currentStep`.
- Tests that rapid forward and backward navigation preserves all user selections.

### 2. `tests/phase02/flooring_apply_all_and_overrides.test.ts`
- Tests clicking "Apply to all bedrooms" updates `flooringZones.masterBed` and `flooringZones.otherBeds` in tandem.
- Tests individual room override allows setting Italian Marble on `living` while leaving `bedrooms` on vitrified tiles.
- Verifies that Section B Material Schedule correctly separates marble sq.ft from vitrified tile sq.ft.

### 3. `tests/phase02/commercial_tier_entitlement_isolation.test.ts`
- Verifies that purchasing `BASIC_ESTIMATE_PDF` (₹99) unlocks ONLY `BasicEstimatePdfDocument.tsx` and does NOT grant access to `DetailedReportPdfDocument.tsx`.
- Verifies that purchasing `DETAILED_ESTIMATE_499` (₹499) unlocks the full itemized Works BOQ but leaves Premium Section E locked.
- Verifies that purchasing `PREMIUM_1499` (₹1,499) unlocks Section E without auto-granting a free consultation.
- Verifies that purchasing `LAUNCH_CONSULTATION` (₹1,499) unlocks expert booking without modifying report tier flags.

---

## 4. Final Verification Checklist Before Approval

```markdown
[ ] 1. All 61 existing test suites pass (807 tests green).
[ ] 2. TypeScript compiles with 0 errors across client and server.
[ ] 3. Production Vite build completes in under 45 seconds with 0 warnings.
[ ] 4. Four estimate/report tiers confirmed: Free (₹0), Basic (₹99), Detailed (₹499), Premium (₹1,499).
[ ] 5. Consultation decoupled as independent ₹1,499 expert advisory session.
[ ] 6. Zero modifications made to calculation formulas, IS-456 rules, or database schema.
[ ] 7. Permission granted to begin Phase 02 development under the 7-Chapter architecture.
```

