# HUTTY 3.1 — PHASE 02: TASK 2.2 FINAL CORRECTIONS & TASK 2.3 IMPLEMENTATION REPORT
## Chapter 2 Final Refinements & Chapter 3: Core Construction Materials Integration

**Document ID:** `HUTTY-3.1-TASK-2.2-FINAL-TASK-2.3-REPORT`  
**Phase:** Phase 02 — Architectural Restructuring  
**Subtasks Completed:**  
1. Part A: Chapter 2 Final Targeted Corrections (Parking Disclosure, Elevator Terminology, Navigation Deduplication)  
2. Part B: Task 2.3 — Chapter 3: Core Construction Materials (`Chapter3CoreMaterials.tsx`)  
**Status:** IMPLEMENTED, TESTED, VERIFIED & SUBMITTED FOR FOUNDER REVIEW  
**Date of Completion:** November 1, 2026  
**Author:** Hutty Engineering & Systems Architecture  

---

## EXECUTIVE SUMMARY

Pursuant to founder authorization for **Task 2.2 Final Corrections** and **Task 2.3 (Chapter 3: Core Construction Materials)**, this report documents the successful implementation, testing, and full-suite verification across the Hutty platform.

### Summary of Accomplishments:
1. **Chapter 2 Final Corrections (Part A):**
   - **Parking Space Planning Disclosure:** Retained canonical calculation constants ($120\text{ sq.ft/car}$ ground, $180\text{ sq.ft/car}$ stilt, $35\text{ sq.ft/bike}$) while adding the exact approved homeowner-friendly micro-copy: *"These are approximate space-planning allowances, not statutory parking standards. Actual requirements depend on your site layout and applicable local rules."*
   - **Elevator Terminology Correction:** Replaced the word *"Mandatory"* in [`Chapter2DreamHome.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx) with *"Recommended engineering provision for buildings G+3 and above"*, preserving the G+3 smart default, user toggle agency, ₹4,50,000 BOQ line item, and structural reporting dependencies.
   - **Navigation Deduplication:** Corrected `handleNext` and `handlePrev` in [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) so that clicking "Next" from Chapter 2 (Stage 2) steps directly to Stage 4, and clicking "Previous" from Stage 4 returns directly to Stage 2. Chapter 2 will never render twice during sequential navigation.
2. **Task 2.3: Chapter 3 — Core Construction Materials (Part B):**
   - Implemented [`Chapter3CoreMaterials.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter3CoreMaterials.tsx) and mounted it in `PlannerPage.tsx` at Stage 5.
   - Introduced the **"What Am I Consuming?" Micro-Card Experience**: Displays live calculated quantities for Reinforcement Steel ($T$ and kg), Portland Cement (50kg bags), Structural Concrete Volume ($m^3$ and CFT), Walling Units (blocks or bricks), and Aggregates/Sand (M-Sand, P-Sand, Coarse Aggregates) before brand selection.
   - Preserved **Strict Physical Quantity and Brand Invariance**: Changing brands (Tata Tiscon vs JSW vs Indus; UltraTech vs ACC vs Dalmia) updates unit rates and cost amounts immediately, but physical quantities ($Q_i$) remain 100% mathematically invariant.
   - Integrated **Concrete Mix & Grade Allocation**: Outlines M20 vs M25 design mixes, detailing where structural concrete is poured across Footings (22%), Columns (18%), Slabs & Beams (45%), and Plinth/Stairs (15%), accompanied by structural engineer sign-off disclaimers.
   - Integrated **Automated Recommendations**: Leverages `useRecommendations()` to suggest optimal materials matching the homeowner's chosen package tier with a 1-click "Apply Recommended Defaults" action.
3. **Automated Verification & Zero Regressions:**
   - Dedicated Test Suite: [`chapter3_core_materials.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter3_core_materials.test.ts) — **8 / 8 tests passed**.
   - Chapters 1, 2, and 3 Integrated Suites: **31 / 31 tests passed**.
   - Full Vitest Platform Suite: **64 / 64 test files passed, 838 / 838 tests passed** (100% pass rate).
   - TypeScript & Build: `tsc -b` (0 errors), `tsc -p server` (0 errors), production Vite build clean (3,019 modules in 46.24s).
   - Protected Systems: Calculation engine formulas (`src/calculation-engine/**`), IS-456 rules, database schema, payment gateways, and commercial pricing remain **100% untouched**.

---

## 1. CHAPTER 2 CORRECTIONS COMPLETED (PART A)

### A1. Parking Assumptions & Regulatory Disclosure
- **Existing Assumptions Preserved:**
  - Normal ground parking: $120\text{ sq.ft}$ per car bay
  - Dedicated stilt parking: $180\text{ sq.ft}$ per car bay
  - Two-wheeler parking: $35\text{ sq.ft}$ per bike slot
- **Homeowner-Friendly Copy Added:**  
  In [`Chapter2DreamHome.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L738-L741), Section 3 now displays:
  > *"These are approximate space-planning allowances, not statutory parking standards. Actual requirements depend on your site layout and applicable local rules."*
- **Mathematical Invariance:** Calculation values in [`bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts) and their downstream effects on `totalConstructedSqFt` and MEP points remain completely unchanged.

### A2. Elevator Terminology Correction
- **Previous Subtext:** *"Mandatory / Standard engineering recommendation for buildings G+3 and above"*
- **Corrected Subtext:** In [`Chapter2DreamHome.tsx:572`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L572), changed to:  
  > *"Recommended engineering provision for buildings G+3 and above"*
- **Integrity Preserved:**
  - Automatic `liftRequired: true` default when selecting $\text{floors} \ge 4$ in `useWizardStore.ts:424`.
  - User's interactive agency to toggle "Lift Included / No Lift" on or off.
  - ₹4,50,000 baseline lift package in `boq.ts:626` and `fixtures.ts:266`.
  - 4 lighting points in `electrical.ts:86` and pit/headroom advisory in `report.ts:59`.

### A3. Duplicate Navigation Deduplication
- **Root Cause Resolved:** In [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx), `Chapter2DreamHome` is mapped to both legacy Stage 2 and Stage 3. Previously, clicking Next on Stage 2 stepped to Stage 3, rendering Chapter 2 a second time.
- **Corrected Navigation Logic in `PlannerPage.tsx`:**
  ```typescript
  const handleNext = () => {
    if (activeStage === 2 || activeStage === 3) {
      // Chapter 2 deduplication: Skip legacy stage 3 and go directly to Stage 4
      handleSetStage(4);
    } else if (activeStage < 8) {
      handleSetStage(activeStage + 1);
    }
  };

  const handlePrev = () => {
    if (activeStage === 4) {
      // Step backward from Stage 4 directly to Chapter 2 (Stage 2)
      handleSetStage(2);
    } else if (activeStage === 3) {
      handleSetStage(1);
    } else if (activeStage > 1) {
      handleSetStage(activeStage - 1);
    }
  };
  ```
- **Next Button Label:** Dynamically updates when on Stage 2 to read `Next: Setbacks →` instead of `Next: Rooms →`.
- **Result:** Chapter 2 will never appear twice in sequential navigation. Stage 4–8 state and anonymous persistence remain completely preserved.

---

## 2. FILES CREATED AND MODIFIED

| File Path | Component / Layer | Action | Description |
|:---|:---|:---:|:---|
| [`src/features/planner/chapters/Chapter3CoreMaterials.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter3CoreMaterials.tsx) | Frontend Chapter Component | **Created** | Homeowner-friendly Core Materials chapter featuring live "What Am I Consuming?" micro-cards for Steel ($T$), Cement (Bags), Concrete ($m^3$), Walling Blocks, and Aggregates/Sand (CFT), brand selectors, and material invariance guarantees. |
| [`src/calculation-engine/__tests__/chapter3_core_materials.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter3_core_materials.test.ts) | Automated Test Suite | **Created** | 8 comprehensive automated regression tests verifying Chapter 2 corrections, steel/cement brand invariance, concrete allocations, masonry specifications, sand thumb rules, and store mutators. |
| [`src/features/planner/chapters/Chapter2DreamHome.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx) | Frontend Chapter Component | **Modified** | Updated parking assumption disclosure copy (A1) and corrected elevator recommendation subtext (A2). |
| [`src/features/planner/PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) | Planner Container | **Modified** | Implemented navigation deduplication between Stage 2 and Stage 4 (A3), imported `Chapter3CoreMaterials`, and mounted it at `activeStage === 5`. |

*(Note: Legacy stage [`Stage5ConstructionStyle.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage5ConstructionStyle.tsx) remains preserved in the codebase to prevent orphaned dependencies).*

---

## 3. CHAPTER 3 INPUT-TO-CALCULATION-TO-RATE-TO-BOQ MAPPING

Chapter 3 directly consumes outputs from [`useCalculationStore`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useCalculationStore.ts) and dispatches user selections directly to [`useWizardStore`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts).

### 3.1 Data Flow Architecture

```
                                [useWizardStore]
         (materialBrands.steel, materialBrands.cement, materialBrands.masonry)
                                       │
                                       ▼
                       [useCalculationStore: recalculate()]
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        calculateRCC() in rcc.ts              calculateMasonry() in brick.ts
        ├── totalStructuralConcreteCuM        ├── netWallAreaSqFt
        ├── footingConcreteCuM                ├── masonryUnitsCount
        ├── columnConcreteCuM                 ├── masonryUnitRate
        ├── slabConcreteCuM                   ├── mSandCuFt & pSandCuFt
        └── plinthConcreteCuM                 └── coarseAggregateCuFt
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
                         runCalculator() in calculator.ts
                         ├── quantities.steelTonnes & steelKg
                         ├── quantities.cementBags
                         ├── boq (Civil & Structural items)
                         └── budget (directMaterialCost)
                                       │
                                       ▼
                     [Chapter3CoreMaterials.tsx Component]
          (Displays physical quantities first, followed by brand rate cards)
```

### 3.2 Material Category Mapping Matrix

| Category | UI Input / Selector | Engine Quantities Consumed | Indicative Benchmark Rate | Calculation Module | BOQ Section & Serial Code |
|:---|:---|:---|:---|:---|:---|
| **Structural Steel** | `Tata Tiscon`, `JSW Neosteel`, `Indus TMT` | `quantities.steelTonnes`, `quantities.steelKg` ($\approx 3.4\text{ kg/sq.ft BUA}$) | ₹78/kg (Tata), ₹74/kg (JSW), ₹68/kg (Indus) | [`materials.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/materials.ts) | Section B (Material Takeoff) & Civil BOQ `STR-001` |
| **Portland Cement** | `UltraTech`, `ACC Cement`, `Dalmia Bharat` | `quantities.cementBags` ($\text{BUA} \times 0.40\text{ bags/sq.ft}$) | ₹420/bag (UltraTech), ₹395/bag (ACC), ₹375/bag (Dalmia) | [`materials.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/materials.ts) | Section B (Material Takeoff) & Civil BOQ `STR-002` |
| **Structural Concrete** | `M20 Mix` (1:1.5:3), `M25 Mix` (1:1:2) | `quantities.totalStructuralConcreteCuM` ($\text{BUA} \times 0.052\text{ m}^3\text{/sq.ft}$) | Integrated into RCC cast-in-situ line items | [`rcc.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/rcc.ts) | Works BOQ Section A (Civil Structure) |
| **Walling Masonry** | `AAC Blocks`, `Concrete Blocks`, `Clay Bricks` | `quantities.netWallAreaSqFt`, `quantities.masonryUnitsCount` | ₹85/block (AAC), ₹52/block (Concrete), ₹12/brick (Clay) | [`brick.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/brick.ts) | Section B (Material Takeoff) & Masonry BOQ `MAS-001` |
| **Sand & Aggregates** | Informational Overview | `mSandCuFt`, `pSandCuFt`, `coarseAggregateCuFt` | Regional benchmark rates | [`brick.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/brick.ts) | Section B (Consumables Matrix) |

---

## 4. MATERIAL QUANTITY & BRAND INVARIANCE RESULTS

The platform's core architectural principle of **Brand Invariance** was rigorously tested across all brand permutations:

$$\text{Brand}_A \to \text{Brand}_B \implies \Delta Q_i \equiv 0 \quad (\text{Physical quantities strictly invariant})$$

### 4.1 Invariance Verification Data (Standard 30×40 Plot, G+1, 1,440 sq.ft BUA)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BRAND INVARIANCE VERIFICATION AUDIT MATRIX                      │
├─────────────────────┬───────────────────┬───────────────────┬──────────────────────────┤
│ Material Category   │ Selection A       │ Selection B       │ Physical Quantity Delta  │
├─────────────────────┼───────────────────┼───────────────────┼──────────────────────────┤
│ Structural Steel    │ Tata Tiscon       │ JSW Neosteel      │ Δ = 0.00 kg (INVARIANT)  │
│ Structural Steel    │ Tata Tiscon       │ Indus TMT         │ Δ = 0.00 kg (INVARIANT)  │
│ Portland Cement     │ UltraTech 53G     │ ACC Concrete+     │ Δ = 0 Bags (INVARIANT)   │
│ Portland Cement     │ UltraTech 53G     │ Dalmia Bharat     │ Δ = 0 Bags (INVARIANT)   │
│ Wall Surface Area   │ AAC Blocks (6")   │ Concrete Blocks   │ Δ = 0.0 sq.ft (INVARIANT)│
│ Wall Surface Area   │ AAC Blocks (6")   │ Red Clay Bricks   │ Δ = 0.0 sq.ft (INVARIANT)│
│ M-Sand              │ Any Brand         │ Any Brand         │ 864 CFT (INVARIANT)      │
│ P-Sand              │ Any Brand         │ Any Brand         │ 864 CFT (INVARIANT)      │
│ Coarse Aggregate    │ Any Brand         │ Any Brand         │ 1,944 CFT (INVARIANT)    │
└─────────────────────┴───────────────────┴───────────────────┴──────────────────────────┘
```

- **Cost Response:** When switching steel from `Tata Tiscon` (₹78/kg) to `Indus TMT` (₹68/kg), the direct material cost updates immediately by $\approx ₹48,960$, while physical steel remains exactly **4,896 kg (4.90 T)**.
- **Masonry Unit Response:** When switching from `AAC Blocks` ($0.018\text{ m}^3$) to `Clay Bricks` ($0.00154\text{ m}^3$), the geometric wall area remains invariant at $1,842\text{ sq.ft}$, while piece counts scale per unit block volume ($3,257\text{ AAC blocks}$ vs $38,100\text{ modular clay bricks}$), matching physical site delivery.

---

## 5. VISUAL DIRECTION & RESPONSIVE LAYOUT

Chapter 3 adheres to the approved Hutty visual design system:

```
Palette Tokens:
  - Deep Forest Green: #1B3D34 (Headers, selected card borders, primary CTA pills)
  - Construction Orange: #F28C28 (Accent badges, icons, warning highlights)
  - Warm Canvas: #F8F8F6 (Micro-card backgrounds, secondary stepper surfaces)
  - Sage Surface: #EBF3EF (Selected card fills, recommendation banners)
  - Border Muted: #CBD5CB (Card outlines, responsive dividers)
```

### 5.1 Key Visual Subsystems
1. **Live Header KPI Chips:** Pinned to the top right of the chapter header, displaying real-time badges for Steel ($T$), Cement (Bags), and Concrete ($m^3$) that stay synchronized with previous Chapter 1 and Chapter 2 parameters.
2. **"What Am I Consuming?" Micro-Cards:** Placed directly above each brand selector. Homeowners are shown the exact physical requirement in bold monospace type before being asked to make brand selections.
3. **Interactive Brand Cards:** Feature tactile rounded corners (`rounded-2xl`), radio indicators, technical grade badges, plain-language usage descriptions, and live rupee rate-per-unit cards.
4. **Concrete Sub-Allocation Stack:** A 4-column visual grid breaking down concrete pour percentages across slabs/beams (45%), footings (22%), columns (18%), and plinth/stairs (15%).
5. **Responsive Behavior:**
   - **Desktop ($\ge 1024$px):** 3-column card grids for Steel, Cement, and Masonry with balanced whitespace.
   - **Mobile ($< 640$px):** Responsive 1-column card stacks with $\ge 44 \times 44$px touch targets and full-width touch cards.

---

## 6. TEST RESULTS BEFORE AND AFTER

### 6.1 Test Suite Expansion

| Test Stage | Test Files Passed | Tests Passed | Test Failures | Total Execution Time |
|:---|:---:|:---:|:---:|:---:|
| **Pre-Task 2.1 Baseline** | 62 passed | 820 passed | 0 failures | 58.12s |
| **Post-Task 2.2 Checkpoint** | 63 passed | 830 passed | 0 failures | 66.12s |
| **Post-Task 2.3 Final** | **64 passed** | **838 passed** | **0 failures** | **73.59s** |

### 6.2 Newly Added Test Scenarios (`chapter3_core_materials.test.ts`)

1. `A1`: Retains canonical parking assumptions (120/180/35 sq.ft) without altering BUA, coverage or civil takeoffs.
2. `A2`: Preserves elevator smart default at G+3 and user toggle agency without modifying BOQ logic.
3. `B1`: Steel Brand Invariance: Tata Tiscon vs JSW Neosteel vs Indus TMT leaves physical tonnage invariant while adjusting rate and cost.
4. `B2`: Cement Brand Invariance: UltraTech vs ACC Cement vs Dalmia Bharat leaves cement bag count invariant while updating budget.
5. `B3`: Concrete Volume & RCC Breakdown: Calculates structural concrete volume and allocates properly across elements.
6. `B4`: Masonry Material Specification: Switching between AAC Blocks, Clay Bricks and Concrete Blocks adjusts block counts accurately while keeping wall surface area invariant.
7. `B5`: Sand and Coarse Aggregates Thumb Rules scale deterministically with total BUA.
8. `B6`: Wizard Store `setCoreMaterials` mutates state and recalculates calculation store without side-effects.

---

## 7. TYPESCRIPT & PRODUCTION BUILD RESULTS

1. **Frontend Type Check (`npx tsc -b`):**  
   `Command exited with code 0.` Zero type errors.
2. **Server Type Check (`npx tsc -p server`):**  
   `Command exited with code 0.` Zero type errors.
3. **Production Build (`npm run build`):**  
   - Bundler: Vite v6.4.3
   - Modules transformed: **3,019 modules**
   - Build Duration: **46.24 seconds**
   - Output Bundle: Clean distribution in `dist/assets/` (`PlannerPage-je3-NqqA.js` 219.25 kB).

---

## 8. PROTECTED-SYSTEM CHANGE AUDIT

A forensic inspection of the Git working tree (`git diff` and `git status --porcelain`) verifies that no protected boundaries were breached:

| Protected System | Changed in Task 2.3? | Forensic Evidence |
|:---|:---:|:---|
| **Calculation Engine Formulas (`src/calculation-engine/modules/**`)** | **NO** | `git diff src/calculation-engine/modules/` returned 0 lines changed. |
| **IS-456 Structural Rules (`src/calculation-engine/modules/rcc.ts`)** | **NO** | 100% untouched. Concrete factors and rebar density rules invariant. |
| **Authority Rule Definitions (`src/calculation-engine/data/authorityRules/**`)** | **NO** | 100% untouched. BBMP and MUDA statutory setback logic invariant. |
| **Database Schema & Migrations (`prisma/schema.prisma`)** | **NO** | `git diff prisma/` returned 0 lines changed. |
| **Backend API Contracts (`server/src/routes/**`)** | **NO** | `git diff server/src/routes/` returned 0 lines changed. |
| **Cashfree Payment Gateways & Checkout Logic** | **NO** | `git diff server/src/services/cashfree*` returned 0 lines changed. |
| **Commercial Pricing Catalog (`src/config/pricing.ts`)** | **NO** | ₹0 Free, ₹99 Basic PDF, ₹499 Detailed BOQ, ₹1,499 Premium BOQ, and ₹1,499 Consultation remain intact. |
| **Authentication & Authorization (`server/src/middleware/auth*`)** | **NO** | 100% untouched. Customer sessions and JWT tokens invariant. |

---

## 9. KNOWN LIMITATIONS & OUTSTANDING ISSUES

1. **Top Pill Track Labels (Transitional State):**  
   The top pill navigation bar in `PlannerPage.tsx` currently displays the legacy 8-stage labels (`STAGE_CONFIG`: Plot, Home, Rooms, Setbacks, Style, Finishes, Estimate, BOQ). Clicking Next from Chapter 2 skips directly to Stage 4 as approved. In Task 2.7, this will be permanently replaced with the canonical 7-Chapter navigation track.
2. **Downstream Chapters Remaining (Tasks 2.4–2.8):**  
   - Task 2.4: Chapter 4 — Flooring & Tiles by Space (Dedicated Chapter)
   - Task 2.5: Chapter 5 — Doors & Windows (Dedicated Chapter)
   - Task 2.6: Chapter 6 — Electrical, Plumbing & Finishes
   - Task 2.7: Chapter 7 — Review Estimate, BOQ & Contractor Mode
   - Task 2.8: Global 7-Chapter Navigation Shell & Transition Polish

---

## FINAL CONCLUSION & STOP CONDITION

**Part A (Chapter 2 Final Corrections)** and **Part B (Task 2.3 Implementation)** have been completed with zero regressions, complete brand invariance, and passing all 838 tests.

Per the strict instructions:
- Implementation is halted.
- Zero commits or pushes have been made.
- Task 2.4 has not been started.

**Standing by for Founder Review of this report and authorization to commence Task 2.4 (Chapter 4: Flooring & Tiles by Space).**

