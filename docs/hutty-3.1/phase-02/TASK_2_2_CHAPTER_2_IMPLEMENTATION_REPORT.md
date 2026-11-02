# HUTTY 3.1 — PHASE 02 — TASK 2.2 IMPLEMENTATION REPORT
## Chapter 2: Dream Home & Spaces Implementation, Architectural Floor-Stack & Multi-Level Space Integration

**Document ID:** `HUTTY-3.1-TASK-2.2-IMPLEMENTATION`  
**Phase:** Phase 02 — Architectural Restructuring  
**Subtask:** Task 2.2 — Chapter 2: Dream Home & Spaces  
**Status:** IMPLEMENTED, TESTED, VERIFIED & SUBMITTED FOR FOUNDER REVIEW  
**Reference Document:** `docs/hutty-3.1/phase-01/PHASE_01_3_PRE_IMPLEMENTATION_VALIDATION.md`  
**Date of Completion:** November 1, 2026  
**Author:** Hutty Engineering & Systems Architecture  

---

## EXECUTIVE SUMMARY

Pursuant to founder authorization for **Task 2.2**, this report details the implementation of **Chapter 2: Dream Home & Spaces** (`Chapter2DreamHome.tsx`). Chapter 2 successfully consolidates and elevates the capabilities previously distributed across legacy Stage 2 (Your Home) and Stage 3 (Your Rooms) into a guided, homeowner-friendly architectural experience.

### Key Achievements:
1. **Unified Homeowner Journey:**  
   Synthesizes 5 cohesive planning steps:
   - **Step 1 — Building Use & Purpose:** Supports all 5 canonical building-use types (`Duplex`, `Triplex`, `Rental Units`, `Mixed Use`, `Farmhouse`) without inventing unsupported categories.
   - **Step 2 — Floor Count & Levels:** Preserves G through G+4, clearly distinguishing habitable levels from parking/stilt levels, while enforcing the automatic elevator recommendation for G+3 and above.
   - **Step 3 — Vehicle Parking:** Accommodates ground-level porches vs dedicated stilt floors, four-wheeler bays (120 vs 180 sq.ft/car), two-wheelers (35 sq.ft/bike), and EV charging readiness.
   - **Step 4 — Room Schedule:** Implements intuitive steppers for all 12 canonical spaces across Core Living and Lifestyle extensions, preserving the sample 3BHK restoration workflow.
   - **Step 5 — Architectural Floor-Stack Illustration:** Generates a real-time, bottom-to-top structural visual stack displaying exact floor names, estimated floor areas, and canonical room allocations derived directly from `BuildingModel`.
2. **Built-Up Area & Feasibility Feedback:**  
   Displays live BUA feedback powered by `calculateArea()` and `bua.ts`. Accompanying cards evaluate habitable BUA, floor footprint, Super BUA (115% factor), total constructed scope, ground coverage limits, and permissible FAR envelopes with plain-language regulatory status notices.
3. **Complete State & Navigation Continuity:**  
   Preserves anonymous visitor progression, session persistence, and seamless backward/forward navigation across all stages.
4. **Zero Regressions & Invariant Protected Systems:**  
   - Dedicated Chapter 2 test suite: **10 / 10 tests passed** (`chapter2_dream_home.test.ts`).
   - Chapter 1 regression test suite: **13 / 13 tests passed** (`chapter1_plot_setbacks.test.ts`).
   - Full Vitest suite: **63 / 63 test files passed, 830 / 830 tests passed** (100% pass rate).
   - TypeScript checks: `tsc -b` (frontend) and `tsc -p server` (backend) passed with **0 errors**.
   - Production bundle: Vite build compiled 3,018 modules cleanly in **41.89s**.
   - Calculation engine (`src/calculation-engine/**`), IS-456 structural rules, database schema, Cashfree payment logic, and pricing remain **100% untouched**.

---

## 1. FILES CREATED AND MODIFIED

| File Path | Component / Layer | Modification Description |
|:---|:---|:---|
| [`src/features/planner/chapters/Chapter2DreamHome.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx) | New Chapter Component | **Created:** Consolidates legacy Stage 2 and Stage 3 into an editorial 7-section chapter featuring building-use cards, floor levels, vehicle parking, room steppers, real-time architectural floor stack, BUA feasibility analysis, and construction readiness timeline. |
| [`src/features/planner/PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) | Planner Shell / Router | **Modified:** Imported `Chapter2DreamHome` and mounted it at `activeStage === 2` and `activeStage === 3`, seamlessly rendering the unified dream home and spaces experience while preserving legacy stages for backward fallback. |
| [`src/calculation-engine/__tests__/chapter2_dream_home.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter2_dream_home.test.ts) | Verification Suite | **Created:** 10 end-to-end integration tests validating building-use types, floor counts, stilt parking, room allocation, BUA metrics, Chapter 1 parity, navigation state immutability, and downstream BOQ generation. |

*Note: Legacy stage components [`Stage2Home.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage2Home.tsx) and [`Stage3Rooms.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/stages/Stage3Rooms.tsx) remain preserved in the codebase to prevent orphaned dependencies.*

---

## 2. LEGACY COMPONENTS AND STATE REUSED

No existing state fields or calculation interfaces were deprecated or deleted. Chapter 2 binds directly to existing store properties:

| State Field / Action | Store Location | Consumption in Chapter 2 | Downstream Calculation Consumer |
|:---|:---|:---|:---|
| `houseType` | `useWizardStore` | Selects dwelling purpose (`Duplex`, `Triplex`, `Rental Units`, `Mixed Use`, `Farmhouse`) | `doors.ts` (entrance door multiplier), `spaceModel.ts` |
| `floors` | `useWizardStore` | Selects total structural levels (1 to 5) | `bua.ts` (BUA multiplier), `spaceModel.ts` (floor stack), `concrete.ts`, `steel.ts` |
| `parkingType` | `useWizardStore` | Selects parking configuration (`Normal Ground` vs `Stilt`) | `bua.ts` (parking footprint rate: 120 vs 180 sq.ft/car) |
| `carCount` / `bikeCount` | `useWizardStore` | Four-wheeler (0–6) and two-wheeler (0–10) steppers | `bua.ts` (total parking area allocation) |
| `evCharging` | `useWizardStore` | High-voltage EV dedicated circuit toggle | `electrical.ts` (dedicated 32A power point and conduit) |
| `liftRequired` | `useWizardStore` | Passenger elevator pit and shaft toggle | `spaceModel.ts`, `structure.ts`, `boq.ts` (lift civil allowance) |
| `startTimeline` | `useWizardStore` | Construction readiness milestone | Project metadata, consultation lead dispatch |
| `rooms` | `useWizardStore` | Canonical dictionary of 12 room counts | `spaceModel.ts`, `flooring.ts`, `openings.ts`, `electrical.ts`, `plumbing.ts` |
| `isCustomRooms` | `useWizardStore` | User customization lock flag | Controls "Reset to Sample 3BHK" button visibility |
| `applySampleRoomConfig` | `useWizardStore` | Action to restore standard 3BHK layout | Re-initializes sample room parameters |
| `updateRoomCount` | `useWizardStore` | Action to increment/decrement room counts | Sets `isCustomRooms = true`, triggers recalculation |
| `getFloorDisplayName()` | `src/utils/floorNames.ts` | Canonical floor name resolution (Ground, First, Second...) | Renders floor titles in architectural stack |

---

## 3. INPUT-TO-CALCULATION DEPENDENCY MAP

The following diagram maps the flow of inputs captured in Chapter 2 directly into the underlying calculation engine and downstream chapters:

```
[Chapter 2: User Inputs]
  ├── houseType (Duplex, Rental, etc.) ────────► doors.ts (1 door vs 1 door/floor)
  ├── floors (1 to 5) ─────────────────────────► bua.ts (Total BUA = buaPerFloor * floors)
  │                                            ► spaceModel.ts (Distributes spaces to floors)
  │                                            ► concrete.ts & steel.ts (Columns/Slabs)
  ├── parkingType ('Stilt' vs 'Normal Ground') ─► bua.ts (180 vs 120 sq.ft per car)
  │                                            ► spaceModel.ts (Floor 0 = Non-habitable parking)
  ├── carCount & bikeCount ────────────────────► bua.ts (parkingAreaSqFt = cars*rate + bikes*35)
  ├── evCharging (boolean) ────────────────────► electrical.ts (Dedicated EV distribution point)
  ├── liftRequired (boolean) ──────────────────► structure.ts & boq.ts (Lift pit/shaft allowance)
  └── rooms (12 Room Types)
        └── spaceModel.ts (Generates SpaceModelItem[])
              ├── flooring.ts ──► Tile/Granite area (Living, Bed, Bath, Utility)
              ├── openings.ts ──► Door & Window schedules and openings deduction
              ├── electrical.ts ► Light, Fan, 6A/16A Sockets, AC & Geyser points
              ├── plumbing.ts ──► Water supply, drainage, WC, Basin, Sink, Shower
              └── finishes.ts ──► Internal wall plaster, primer & emulsion paint
```

---

## 4. BUILDING-USE AND FLOOR CONFIGURATION BEHAVIOUR

### 4.1 Building-Use Options
Chapter 2 presents 5 distinct cards tailored to residential homeowners:
1. **Single Family / Duplex Home (`'Duplex'`):** Unified family living with connected internal staircase and 1 main entrance door.
2. **Independent Multi-Level Villa / Triplex (`'Triplex'`):** Grand multi-level residence with double-height spaces, family lounges, and private terraces.
3. **Self-Use + Rental Units (`'Rental Units'`):** Living residence on one floor with rental units on upper floors. The engine automatically provisions **1 main entrance door per floor** (`floors` main doors).
4. **Commercial + Residential (`'Mixed Use'`):** Ground-floor shop or office with residential flats above. Also provisions **1 main door per level**.
5. **Farmhouse / Weekend Villa (`'Farmhouse'`):** Low-density retreat emphasizing large verandahs and courtyards.

### 4.2 Floor Count & Habitable Space Rules
- **Floor Range:** Ground Floor (1 level) through Ground + 4 Floors (5 levels).
- **Stilt Floor Enforcement:** Selecting a dedicated stilt floor automatically establishes a minimum of **2 total floors** (1 Stilt Level + 1 Habitable Level). Ground Floor only (1 level) is safely disabled when Stilt is active.
- **Habitable Level Accounting:**
  $$\text{Habitable Floors} = \begin{cases} \text{floors} - 1 & \text{if parkingType} = \text{'Stilt'} \\ \text{floors} & \text{if parkingType} = \text{'Normal Ground'} \end{cases}$$
  The stilt floor is strictly excluded from habitable room built-up area.
- **Elevator Rule:** When `floors >= 4` (G+3 or higher), `liftRequired` automatically defaults to `true` per National Building Code (NBC) accessibility standards. For 2 to 3 floor residences, an accessible toggle permits optional lift inclusion.

---

## 5. PARKING AND STILT TREATMENT

| Parking Dimension | Normal Ground Parking | Dedicated Stilt Floor | Statutory / Benchmark Basis |
|:---|:---:|:---:|:---|
| **Structural Level Consumed** | None (Driveway / Portico) | **1 Entire Floor (Level 0)** | Municipal Planning Bylaws |
| **Area Rate per Car** | **120 sq.ft / car** | **180 sq.ft / car** | Engineering benchmark (includes turning aisle & columns) |
| **Area Rate per Two-Wheeler** | **35 sq.ft / bike** | **35 sq.ft / bike** | Standard motorcycle parking footprint |
| **Habitable BUA Contribution** | None (Excluded from room BUA) | None (Excluded from room BUA) | BUA exclusion principle |
| **Total Constructed Area** | Added to Gross Construction Scope | Added to Gross Construction Scope | Structural slab and column scope |
| **EV Charging Circuit** | Optional (15A/32A conduit) | Optional (15A/32A conduit) | Dedicated distribution board breaker |

---

## 6. ROOM CONFIGURATION BEHAVIOUR

Rooms are organized into two functional categories with $\ge 44\times 44\text{px}$ touch targets:

### 6.1 Core Living Areas
- **Bedrooms (1 to 12):** Standard size $14\text{ ft} \times 10\text{ ft}$ (140 sq.ft), 1 flush door, 1 window ($5\times 4$ ft), 3 light points, 1 fan, 4 sockets, 1 AC point, 1 TV point.
- **Bathrooms (1 to 12):** Standard size $6\text{ ft} \times 5\text{ ft}$ (30 sq.ft), 1 WPC/FRP door, 1 ventilator, 7 ft dado wall tiling, sunken waterproofing with 1 ft upturn, 1 WC, 1 basin, 1 shower, 1 geyser point.
- **Living Room / Family Hall (1 to 6):** Standard size $16\text{ ft} \times 12.5\text{ ft}$ (200 sq.ft), 2 windows ($6\times 5$ ft), 6 light points, 2 fans, 6 sockets, 1 AC point, 2 TV points.
- **Kitchen & Cooking Space (1 to 5):** Standard size $10\text{ ft} \times 9\text{ ft}$ (90 sq.ft), 15 ft counter with 2 ft backsplash dado tiling, 1 sink, 5 appliance sockets, 1 window.
- **Dining Room (0 to 4):** Standard size $12\text{ ft} \times 10\text{ ft}$ (120 sq.ft), 3 light points, 1 fan, 2 sockets, 1 window.

### 6.2 Lifestyle & Practical Additions
- **Pooja Room (0 to 4):** $5\text{ ft} \times 5\text{ ft}$ (25 sq.ft) prayer sanctum.
- **Balconies & Sit-Outs (0 to 8):** $10\text{ ft} \times 5\text{ ft}$ (50 sq.ft) with waterproofed floor and perimeter drainage.
- **Study / Home Office (0 to 4):** $10\text{ ft} \times 10\text{ ft}$ (100 sq.ft) work-from-home room with AC & data points.
- **Utility & Washing Area (0 to 4):** $8\text{ ft} \times 5\text{ ft}$ (40 sq.ft) wet washing area with washing machine inlet & drain.
- **Store Room (0 to 4):** $7\text{ ft} \times 5\text{ ft}$ (35 sq.ft) pantry and storage space.
- **Common Powder Room (0 to 4):** $5\text{ ft} \times 4\text{ ft}$ (20 sq.ft) guest toilet.
- **Rooftop Terrace (0 to 2):** Top slab exposed recreation deck.

### 6.3 Custom Mode vs Sample 3BHK Restoration
- When the user alters any room stepper, `isCustomRooms` becomes `true`.
- An amber status banner informs the user that their personalized room schedule is active and locked.
- A single click on **"Reset to Sample 3BHK"** cleanly executes `applySampleRoomConfig()`, restoring 3 Bedrooms, 3 Bathrooms, Living, Kitchen, Dining, Balcony, Pooja, and Utility, while resetting `isCustomRooms` to `false`.

---

## 7. BUA CALCULATION TRACEABILITY

All built-up area figures displayed in Chapter 2 originate directly from the calculation engine's canonical formulas:

1. **Total Habitable BUA:**  
   $$\text{totalBUASqFt} = \text{buaPerFloorSqFt} \times \text{habitableFloors}$$
   (e.g., $720\text{ sq.ft} \times 2 = 1,440\text{ sq.ft}$).
2. **Super Built-Up Area:**  
   $$\text{superBUASqFt} = \text{totalBUASqFt} \times 1.15$$
   (Includes 15% allowance for external/internal walls, structural columns, utility shafts, and common landings).
3. **Total Construction Scope:**  
   $$\text{totalConstructedSqFt} = \text{totalBUASqFt} + \text{parkingAreaSqFt} + \text{terraceSqFt}$$
4. **Planning Feasibility Check:**  
   Compares ground floor footprint against Chapter 1's `buildableFootprintSqFt` and master plan `coverageLimitSqFt`. Compares total BUA against master plan `permissibleBUASqFt` (FAR limit). If compliant, renders a green `Within Regulatory Planning Envelope` shield.

---

## 8. AUTOMATED VERIFICATION RESULTS (10 TEST SCENARIOS)

The dedicated test suite in [`src/calculation-engine/__tests__/chapter2_dream_home.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter2_dream_home.test.ts) was executed and verified:

```
✓ src/calculation-engine/__tests__/chapter2_dream_home.test.ts (10 tests) 457ms
  ✓ 1. Correctly configures each supported building-use type and updates main entrance door count
  ✓ 2. Evaluates floor counts (G to G+4), scaling BUA and automatically enforcing lift rules for G+3 and above
  ✓ 3. Stilt parking dedicates the ground floor to parking, enforces min 2 floors, and does not count as habitable BUA
  ✓ 4. Canonical room configuration generates floor-wise spaces through BuildingModel without manual room areas
  ✓ 5. Room steppers mark custom layout, update space model, and restore standard 3BHK cleanly
  ✓ 6. Computes live BUA summary metrics with Super BUA and parking area correctly
  ✓ 7. Maintains seamless compatibility with Chapter 1 plot dimensions and municipal authority rules
  ✓ 8. Navigates backward and forward without mutating user selections or resetting room counts
  ✓ 9. Anonymous visitor progression and session state persist across state queries
  ✓ 10. Propagates Chapter 2 parameters end-to-end through full calculation engine and BOQ generator
```

### Verification Highlights:
- **Building-Use Invariance:** Verified that Duplex, Triplex, and Farmhouse provide 1 main entrance door, while Rental Units and Mixed Use provide 1 main entrance door per floor (2 doors for G+1).
- **Stilt Floor Isolation:** Verified that for Stilt Parking, `parkingAreaSqFt` reflects 180 sq.ft/car and the habitable floors count is strictly $\text{floors} - 1$.
- **Downstream BOQ Propagation:** Verified that Chapter 2 selections propagate through `runCalculator()`, producing valid concrete ($>0$), steel ($>0$), cement ($>0$), door/window schedules, electrical points, plumbing fixtures, and final project budget.

---

## 9. FULL PROJECT REGRESSION & BUILD VERIFICATION

### 9.1 Vitest Full Suite
```
 Test Files  63 passed (63)
      Tests  830 passed (830)
   Start at  14:33:26
   Duration  53.90s
```
Zero test regressions. All 830 automated tests in the codebase passed with a 100% pass rate.

### 9.2 TypeScript Compilation Checks
- **Frontend Project (`npx tsc -b`):** **Exit code 0 (0 errors)**.
- **Server Application (`npx tsc -p server`):** **Exit code 0 (0 errors)**.

### 9.3 Production Build
- **Vite Bundler (`npm run build`):** **Exit code 0**. Compiled 3,018 modules into `/dist` in **41.89s**.

---

## 10. PROTECTED-SYSTEM INVARIANCE CERTIFICATION

| Protected System | Status | Verification Detail |
|:---|:---:|:---|
| **Calculation Engine** (`src/calculation-engine/**`) | **UNTOUCHED** | Zero formula edits. All structural, rate, and BOQ algorithms remain bit-for-bit invariant. |
| **IS-456 Structural Standards** | **UNTOUCHED** | Rebar percentages, column design tables, and slab thicknesses untouched. |
| **Authority Rule Definitions** | **UNTOUCHED** | Bengaluru (GBA 2026 Table 1) and Mysuru (MUDA CDP 2031) rules untouched. |
| **Database Schema** (`prisma/schema.prisma`) | **UNTOUCHED** | Zero schema migrations or table modifications. |
| **Backend REST APIs** (`server/**`) | **UNTOUCHED** | All API contracts, consultation booking services, and auth endpoints untouched. |
| **Cashfree & Payment Entitlements** | **UNTOUCHED** | Payment session creation, webhooks, signature verification untouched. |
| **Commercial Pricing & Product Codes** | **UNTOUCHED** | ₹0 Free, ₹99 Basic PDF, ₹499 Detailed BOQ, ₹1,499 Premium BOQ, ₹1,499 Consultation untouched. |

---

## 11. CHECKPOINT STATUS & NEXT STEPS

- **Task 2.2 Status:** COMPLETE. Chapter 2 is implemented, tested, and verified.
- **Stop Condition:** HALTED. In strict compliance with instructions:
  - Tasks 2.3 through 2.8 remain **ON HOLD**.
  - Zero git commits or pushes have been performed.
- **Action Required:** This report is submitted for founder inspection and formal approval. Upon approval, Task 2.3 (**Chapter 3: Construction Style & Core Structure**) may commence.

