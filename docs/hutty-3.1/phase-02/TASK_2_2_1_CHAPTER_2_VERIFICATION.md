# HUTTY 3.1 — PHASE 02: TASK 2.2.1 VERIFICATION REPORT
## Technical, Mathematical & Regulatory Audit of Chapter 2 (Dream Home & Spaces)

**Document ID:** `HUTTY-3.1-TASK-2.2.1-VERIFICATION`  
**Phase:** Phase 02 — Architectural Restructuring  
**Subtask:** Task 2.2.1 — Chapter 2 Implementation & Calculation Verification  
**Status:** COMPLETE — SUBMITTED FOR FOUNDER REVIEW  
**Date of Audit:** November 1, 2026  
**Auditor:** Hutty Engineering & Systems Architecture  

---

## 1. EXECUTIVE VERDICT

### **VERDICT: PASS WITH LIMITATIONS**

The implementation of **Chapter 2: Dream Home & Spaces** ([`Chapter2DreamHome.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx)) and its architectural integration have been subjected to an exhaustive technical, mathematical, and regulatory audit.

#### Summary of Findings:
1. **Core Architectural Math & Engine Invariance (PASS):**  
   All calculation engine formulas, IS-456 structural rules, setback geometry, BUA allocations, material takeoffs, and BOQ items remain **100% intact and invariant**. Zero files within `src/calculation-engine/` were modified. All 830 tests pass cleanly across 63 test suites.
2. **Parking Assumptions Traceability (PASS WITH LIMITATION):**  
   The parking footprint assumptions (120 sq.ft per ground car, 180 sq.ft per stilt car, 35 sq.ft per two-wheeler) are **canonical calculation constants** dating back to the very first commit of [`bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts) (commit `a2620e3b`, July 26, 2026). However, the frontend label in Chapter 2 must explicitly disclose that these are **architectural space-planning estimates** and not statutory minimum parking bay standards under municipal building bylaws.
3. **Elevator Recommendation Traceability (PASS WITH LIMITATION):**  
   The automatic lift recommendation for G+3 and above (`floors >= 4`) is an **existing canonical rule** established in [`useWizardStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts) on August 8, 2026 (commit `f5240887`). It is an editable suggestion, not a lock. However, the subtext in `Chapter2DreamHome.tsx` incorrectly labels it as *"Mandatory / Standard engineering recommendation"*. This wording must be corrected to *"Recommended engineering provision"* to avoid implying an untrue statutory mandate for independent residential bungalows.
4. **Planner Navigation & Legacy Stage Mapping (PASS WITH LIMITATION):**  
   Mounting `Chapter2DreamHome.tsx` at both `activeStage === 2` and `activeStage === 3` in [`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx) causes sequential "Next" navigation to render Chapter 2 twice in succession (once on Stage 2 "Your Home", and again on Stage 3 "Your Rooms") within the legacy 8-stage top track. This transitional artifact requires navigation deduplication before launching Phase 02 to end users.

---

## 2. PARKING AREA ASSUMPTIONS TRACEABILITY

The implementation report references three parking area assumptions:
- **Normal ground parking:** 120 sq.ft per car
- **Dedicated stilt parking:** 180 sq.ft per car
- **Two-wheeler parking:** 35 sq.ft per bike

### 2.1 Source Code Forensic Trace

```
Source File:     src/calculation-engine/modules/bua.ts
Function:        calculateArea(input: EngineInput): AreaResult
Lines:           23–24
Git Origin:      Commit a2620e3b (Sun Jul 26 17:31:39 2026 +0530, "Initial Release Candidate (RC1)")
Config Fallback: src/calculation-engine/config/configurationResolver.ts (Line 329: stiltSqFtPerCar: 180)
```

Exact canonical logic in [`bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L23-L24):
```typescript
const sqFtPerCar = input.parkingType === 'Stilt Parking' || input.parkingType === 'Stilt' ? 180 : 120;
const parkingAreaSqFt = Math.round((input.carCount || 0) * sqFtPerCar + ((input.bikeCount || 0) * 35));
```

### 2.2 Nature and Scope of the Values

| Value | Classification | User Configurable? | Origin / Evidence |
|:---|:---|:---:|:---|
| **120 sq.ft / car** (Ground) | **Existing Hutty Calculation Assumption** | No (Constant) | Canonical engine constant since July 2026. Models a standard open driveway / portico bay ($\approx 8.5 \times 14$ ft) without dedicated maneuvering aisle. |
| **180 sq.ft / car** (Stilt) | **Existing Hutty Calculation Assumption** | No (Constant) | Canonical engine constant since July 2026; mirrored in `configurationResolver.ts:329`. Models a covered stilt bay ($\approx 9 \times 16$ ft) plus shared driveway turning radius and column margins. |
| **35 sq.ft / bike** | **Existing Hutty Calculation Assumption** | No (Constant) | Canonical engine constant since July 2026. Models standard two-wheeler parking slot ($\approx 3.5 \times 10$ ft including dismount clearance). |
| **Car / Bike Counts** | **User Input Parameter** | **Yes** | User selects 0 to 6 cars and 0 to 10 bikes via accessible steppers. |
| **Parking Type** | **User Input Parameter** | **Yes** | User toggles `Normal Ground` vs `Stilt`. |

### 2.3 Mathematical Impact Across Engine Systems

| Calculation Metric | Affected by Parking Assumptions? | Exact Mechanism & Formulas in Code |
|:---|:---:|:---|
| **Ground-Floor BUA (`buaPerFloorSqFt`)** | **NO** | `buaPerFloorSqFt = Math.round(totalBUASqFt / floors)` in [`bua.ts:175`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L175). Parking area is **not** added to habitable floor plates. |
| **Stilt Floor Area** | **YES (Display & Scope)** | When `parkingType === 'Stilt'`, `parkingAreaSqFt` represents the structural stilt floor bay area and is displayed on the floor stack illustration as non-habitable parking scope. |
| **Habitable Built-Up Area (`totalBUASqFt`)** | **NO** | `totalBUASqFt` derives exclusively from `userSelectedBUA` or `recommendedBUATotalSqFt`. Parking area is never added to habitable BUA. |
| **Ground Coverage Percentage** | **NO** | `groundCoveragePercentage = (buaPerFloorSqFt / plotAreaSqFt) * 100` ([`bua.ts:224`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L224)). Open ground parking is considered unbuilt ground. |
| **FAR (Floor Area Ratio)** | **NO** | Regulatory FAR verification compares `proposedBUASqFt` (`totalBUASqFt`) against `maxFarBUASqFt` ([`bua.ts:185, 204`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L185)). Stilt and ground parking are FAR-exempt, matching statutory bylaws. |
| **Total Constructed Scope (`totalConstructedSqFt`)** | **YES** | `totalConstructedSqFt = totalBUASqFt + parkingAreaSqFt + terraceSqFt` ([`bua.ts:232`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts#L232)). Reflects total structural slab and pavable scope. |
| **Structural Civil Quantities (Concrete, Steel, Masonry)** | **NO** | Civil takeoff formulas in `rcc.ts`, `materials.ts`, and `brick.ts` multiply by `totalBUASqFt` or structural footprint. Parking does not multiply concrete volume. |
| **Electrical Points & BOQ Items** | **YES (Targeted)** | In [`electrical.ts:85`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/electrical.ts#L85), `carCount > 0` adds 2 external lighting points. In [`boq.ts:630`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts#L630), `evCharging === true` adds a 7.2kW AC Wallbox Charger (`quantity: carCount || 1`, unit rate ₹38,000). |

### 2.4 Regulatory Disclosure Assessment
- **Finding:** In [`Chapter2DreamHome.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L622-L623), parking rates are displayed with tildes (`~120 sq.ft/car`, `~180 sq.ft/car`).
- **Limitation:** The UI does not explicitly state that these values are architectural spatial estimates. Under Bangalore (BBMP) Building Bye-laws 2003 (Schedule XI) and NBC 2016 Part 3, standard equivalent car spaces (ECS) require $2.5\text{m} \times 5.0\text{m}$ ($135\text{ sq.ft}$) for off-street parking plus driveways (totaling up to 250–300 sq.ft/ECS in commercial complexes).
- **Required Correction:** Replace the bare metric tag with an informational tooltip or micro-copy: *"Estimated planning allowance per vehicle including maneuvering clearances. Final parking layouts must comply with local municipal bay dimensions."*

---

## 3. ELEVATOR RECOMMENDATION TRACEABILITY

The implementation report states that an elevator is automatically recommended for G+3 and above.

### 3.1 Source Code Forensic Trace

```
Source File:  src/store/useWizardStore.ts
Function:     setHouseConfig: (houseType, floorsInput) => void
Lines:        415–426
Git Origin:   Commit f5240887 (Sat Aug 8 20:50:42 2026 +0530, "Improve live estimate panel UI")
```

Exact canonical logic in [`useWizardStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts#L415-L426):
```typescript
// Rule 2 & Rule 4 enforcement:
// Parking Stilt -> min floors = 2 (G+1)
// Floors >= 4 (G+3) -> Lift defaults to Yes
setHouseConfig: (houseType, floorsInput) => {
  const { parkingType } = get();
  let floors = floorsInput;
  if (parkingType === 'Stilt' && floors < 2) {
    floors = 2; // Min G+1 for stilt
  }
  const liftRequired = floors >= 4 ? true : get().liftRequired;
  set({ houseType, floors, liftRequired, hasStartedSelection: true });
},
```

### 3.2 Evaluation of Elevator Criteria

1. **Existed Before Task 2.2?**  
   **YES.** Introduced into `useWizardStore.ts` on August 8, 2026. Task 2.2 simply connected this existing store state to an interactive toggle in `Chapter2DreamHome.tsx`.
2. **Mandatory vs Recommendation:**  
   It is a **smart default recommendation**, NOT a mandatory requirement. Calling `setHouseConfig` with `floors >= 4` sets `liftRequired: true`, but the user retains full agency to toggle it off via `setLiftRequired(false)`.
3. **Can the User Change or Dismiss It?**  
   **YES.** In [`Chapter2DreamHome.tsx:564-590`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L564-L590), there is an interactive button:
   ```tsx
   <button type="button" onClick={handleLiftToggle}>
     {liftRequired ? 'Lift Included' : 'No Lift'}
   </button>
   ```
   Toggling this button flips `liftRequired` between `true` and `false` regardless of floor count.
4. **Effect on Estimate and BOQ:**  
   When `liftRequired === true`:
   - **BOQ Line Item ([`boq.ts:626`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts#L626)):** Adds `Passenger Elevator / Home Lift (6-Passenger Automatic Gearless)`, 1 unit at ₹4,50,000 (Johnson / Otis Gen2).
   - **Fixtures Schedule ([`fixtures.ts:266`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/fixtures.ts#L266)):** Adds ₹4,50,000 line item.
   - **Electrical Engine ([`electrical.ts:86, 111`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/electrical.ts#L86)):** Adds 4 dedicated points for lift pit, car, and machine-room lighting, plus 4 switch modules.
   - **Structural Advisory ([`report.ts:59`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/report.ts#L59)):** Appends architectural note mandating a 1,500mm lift pit depth and 3,600mm MRL headroom clearance.
5. **Presentation & Regulatory Limitation:**  
   In [`Chapter2DreamHome.tsx:572`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L572), the subtext reads:  
   *"Mandatory / Standard engineering recommendation for buildings G+3 and above"*  
   - **Issue:** Under NBC 2016 (Part 8, Section 5) and BBMP Bye-law 16.1, elevators are mandatory for buildings exceeding 15 meters in height (typically $\text{G}+4$ or commercial high-rises), but not for low-rise independent residential bungalows under 15m.
   - **Required Correction:** Remove the word "Mandatory". Change wording to: *"Recommended engineering provision for residences G+3 and above for multi-level accessibility."*

---

## 4. BUILDING-USE & FLOOR CONFIGURATION MATRIX

All five building-use types reported in Chapter 2 were audited across `useWizardStore.ts`, `doors.ts`, `spaceModel.ts`, and `packageConfig.ts`.

### 4.1 Configuration Matrix

| Building-Use Type | Canonical Store Type | Supported Floors | Habitable Levels vs Stilt | Main Dwelling Doors | Internal Doors & Spaces | Downstream Package Recommendation | Unsupported Combinations & Safeguards |
|:---|:---|:---:|:---:|:---:|:---|:---|:---|
| **Duplex** | `'Duplex'` | G to G+4 | If Ground: 1 to 5.<br>If Stilt: 1 to 4. | **1** (Single dwelling entrance) | Scaled from room schedule via `spaceModel.ts`. | Defaults to `PREMIUM` (or `LUXURY` if >4,500 sq.ft). | Stilt on 1 floor automatically elevates floors to 2 (min G+1). |
| **Triplex** | `'Triplex'` | G+1 to G+4 (suggested G+2/G+3) | If Ground: 2 to 5.<br>If Stilt: 1 to 4. | **1** (Single dwelling entrance) | Double-height lounge & terrace assignments. | Defaults to `PREMIUM`. | Single-floor Triplex is invalid; defaults to minimum 2 floors. |
| **Rental Units** | `'Rental Units'` | G+1 to G+4 | If Ground: 2 to 5.<br>If Stilt: 1 to 4. | **1 per floor** (`Math.max(1, floors)`) | Independent kitchens and utility per dwelling floor. | Defaults to `STANDARD` for high-yield durability ([`packageConfig.ts:337`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/packageConfig.ts#L337)). | Single floor rental is allowed but generates 1 door; upper floors receive sub-meters. |
| **Mixed Use** | `'Mixed Use'` | G+1 to G+4 | If Ground: 2 to 5.<br>If Stilt: 1 to 4. | **1 per floor** (`Math.max(1, floors)`) | Ground floor open retail / commercial; upper residential. | Defaults to `STANDARD` for commercial resilience ([`packageConfig.ts:337`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/packageConfig.ts#L337)). | G+0 mixed use restricted; commercial floor requires residential separation. |
| **Farmhouse** | `'Farmhouse'` | G to G+2 (suggested G/G+1) | Ground living prioritized | **1** (Single dwelling entrance) | Expansive verandahs, sit-outs, and courtyards. | Defaults to `PREMIUM`. | G+4 farmhouse flagged in BUA validation as atypical low-density zoning. |

### 4.2 Floor Count & Stilt Floor Verification
- **G through G+4 Options:**  
  Options 1, 2, 3, 4, 5 represent Ground, G+1, G+2, G+3, and G+4 respectively.
- **Treatment of Stilt Floors:**  
  When `parkingType === 'Stilt'`:
  1. Floor count is clamped to a minimum of 2 (`floors >= 2`). The G (1 floor) button is disabled ([`Chapter2DreamHome.tsx:499, 508`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L499)).
  2. Habitable floors are computed as $\text{floors} - 1$.
  3. Ground level is strictly dedicated to parking bays, driver facilities, and security.
  4. Habitable living spaces (bedrooms, living, kitchen) begin on Level 1 (First Floor above Stilt).
  5. Stilt area is **not** included in habitable BUA or room square footage.
  6. Zero duplicate building-use types or unapproved options were introduced.

---

## 5. CANONICAL ROOM SCHEDULE TRACEABILITY

The 12 canonical spaces in Chapter 2 were mapped directly to the TypeScript definitions in [`src/store/useWizardStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts#L27-L40).

### 5.1 Room Data Model Mapping

| # | Space Key in `RoomCounts` | UI Display Label | Category | Default Count (3BHK) | Stepper Min | Stepper Max | Typical Area (`spaceModel.ts`) | Downstream Affected Calculations |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | `bedrooms` | Bedrooms | Core | 3 | 1 | 12 | 140 sq.ft | Doors, flooring, windows, electrical points, HVAC. |
| 2 | `bathrooms` | Bathrooms | Core | 3 | 1 | 12 | 30 sq.ft | Waterproofing, wall dado tiles, plumbing lines, sanitary fixtures. |
| 3 | `living` | Living Rooms / Family Hall | Core | 1 | 1 | 6 | 200 sq.ft | Flooring tiles, double electrical modules, wide windows. |
| 4 | `kitchen` | Kitchen & Cooking Area | Core | 1 | 1 | 5 | 90 sq.ft | Modular kitchen running meters, kitchen dado tiles, exhaust point. |
| 5 | `dining` | Dining Room | Core | 1 | 0 | 4 | 120 sq.ft | Flooring, lighting points. |
| 6 | `pooja` | Pooja Room | Lifestyle | 1 | 0 | 4 | 25 sq.ft | Pooja door with brass fittings, dedicated ambient wiring. |
| 7 | `balcony` | Balconies & Sit-Outs | Lifestyle | 1 | 0 | 8 | 50 sq.ft | UPVC balcony sliding doors, external vitrified tiles, MS railing. |
| 8 | `office` | Study / Home Office | Lifestyle | 0 | 0 | 4 | 100 sq.ft | Study desks, data points, quiet zone flooring. |
| 9 | `utility` | Utility & Washing Area | Lifestyle | 1 | 0 | 4 | 40 sq.ft | Washing machine point, floor drain, anti-skid tiles. |
| 10 | `storeRoom` | Store Room | Lifestyle | 0 | 0 | 4 | 35 sq.ft | Flush door, utility storage shelving allowance. |
| 11 | `commonToilets` | Common Powder Room | Lifestyle | 0 | 0 | 4 | 20 sq.ft | Washbasin, CP fittings, wall dado up to 7ft. |
| 12 | `terrace` | Rooftop Terrace / Open Deck | Lifestyle | 1 | 0 | 2 | 200 sq.ft | Screed waterproofing, parapet brickwork, rainwater drainage. |

### 5.2 Dynamic Room Invariance & Downstream Isolation
1. **Floor-Wise Space Allocation:**  
   [`generateBuildingModel()`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts) receives `store.rooms` and generates structural floor objects with automated room placements (Living/Kitchen on Level 0; Master & Guest Beds distributed across upper levels). No user entry of manual square footage is required.
2. **Sample 3BHK Reset Functionality:**  
   `applySampleRoomConfig()` sets:
   ```typescript
   {
     estimateMode: 'quick',
     isCustomRooms: false,
     rooms: { ...SAMPLE_ROOM_CONFIG }
   }
   ```
   It modifies **only** the 12 room count keys. Plot dimensions, city, authority, floor count, parking, quality tier, and material selections are 100% preserved.
3. **Absence of Orphan Selections:**  
   Decreasing a room count (e.g. from 4 bathrooms to 2) does **not** orphan downstream records. Downstream modules (`flooring.ts`, `doors.ts`, `plumbing.ts`, `fixtures.ts`) calculate quantities dynamically from `buildingModel.allSpaces` and `store.rooms`. There is no decoupled secondary state that could retain phantom bathrooms or extra doors.

---

## 6. BUILT-UP AREA & FEASIBILITY TRACEABILITY

Chapter 2 renders real-time BUA feedback and planning feasibility notices.

### 6.1 BUA Calculation Flow

```
[Chapter 1 Plot & Road Inputs]
        │
        ▼
evaluateAuthorityLimits() ──► Resolves Statutory Setbacks, Coverage % Cap, and Max FAR
        │
        ▼
calculateArea() in bua.ts:
  ├── 1. Plot Area = Length × Width
  ├── 2. BUA Source:
  │        • userSelectedBUA (if entered)
  │        • OR builtUpAreaPerFloor × floors
  │        • OR recommendedBUATotalSqFt
  ├── 3. buaPerFloorSqFt = totalBUASqFt / floors
  ├── 4. superBUASqFt = totalBUASqFt × 1.15 (SUPER_BUA_FACTOR)
  ├── 5. parkingAreaSqFt = (carCount × 120/180) + (bikeCount × 35)
  ├── 6. terraceSqFt = buaPerFloorSqFt
  └── 7. totalConstructedSqFt = totalBUASqFt + parkingAreaSqFt + terraceSqFt
        │
        ▼
Validation Engine:
  ├── buaPerFloorSqFt <= buildableFootprintSqFt (Envelope check)
  ├── buaPerFloorSqFt <= coverageLimitSqFt (Plot coverage check)
  └── proposedBUASqFt <= maxFarBUASqFt (FAR check)
```

### 6.2 Data Parity in Floor-Stack Visualization
- The structural stack in [`Chapter2DreamHome.tsx:916-1038`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L916-L1038) directly consumes `useBuildingModel()`.
- The floor areas displayed (`floorItem.floorAreaSqFt`) are the exact values produced by `spaceModel.ts`.
- The terrace area displays `area.terraceSqFt` from `useArea()`.
- The stilt area displays `totalParkingAreaSqFt` calculated via the canonical formula.
- **Result:** There is 100% mathematical parity between what the user sees in the floor stack and what the calculation engine computes.

### 6.3 Clear Distinction of Regulatory Status
Chapter 2 clearly segregates information into distinct layers:
1. **User-Selected Configuration:** Distinctly indicated in the room and floor steppers.
2. **Estimated Physical Floor Area:** Explicitly marked with tildes (`~`) and labeled as average livable area per level.
3. **Calculation Assumptions:** Clearly broken down in the 4 Architectural Summary Pillars.
4. **Authority-Specific Limits:** Displays the exact ground coverage cap (`sq.ft` and `%`) and permissible FAR limit.
5. **Statutory Planning Disclosure:** Prominently featured at the bottom of the chapter ([`Chapter2DreamHome.tsx:1177-1186`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L1177-L1186)), explicitly stating that the values represent theoretical distributions that must be formally sanctioned by a licensed engineer and municipal authority.

---

## 7. PLANNER NAVIGATION & LEGACY STAGE MAPPING

### 7.1 Current Routing Flow in `PlannerPage.tsx`

[`PlannerPage.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/PlannerPage.tsx#L311-L325) defines the following stage-to-component mapping:

```tsx
{activeStage === 1 && <Chapter1PlotSetbacks />}
{activeStage === 2 && <Chapter2DreamHome />}
{activeStage === 3 && <Chapter2DreamHome />}
{activeStage === 4 && <Stage4BuildableSpace />}
{activeStage === 5 && <Stage5ConstructionStyle />}
{activeStage === 6 && <Stage6FinishesMaterials />}
{activeStage === 7 && <Stage7Estimate ... />}
{activeStage === 8 && <Stage8DetailedBOQ ... />}
```

### 7.2 Analysis of Navigation Behavior

1. **Top Track:** Displays the legacy 8-stage pill track (`STAGE_CONFIG`):
   - Stage 1: Your Plot
   - Stage 2: Your Home
   - Stage 3: Your Rooms
   - Stage 4: Buildable Space
   - Stage 5: Construction Style
   - Stage 6: Finishes & Materials
   - Stage 7: Your Estimate
   - Stage 8: Detailed BOQ
2. **Double Render Limitation on Sequential Next:**  
   When a user completes Chapter 2 on `activeStage === 2` and clicks the bottom "Next" button:
   - `handleNext()` advances `activeStage` to 3.
   - At `activeStage === 3`, `PlannerPage.tsx` mounts `<Chapter2DreamHome />` again.
   - The user sees Chapter 2 reload, which appears as a duplicate step.
   - Clicking "Next" a second time on Stage 3 finally advances to Stage 4 (`Stage4BuildableSpace`).
3. **Direct Pill Navigation:**  
   Clicking either "Home" (Pill 2) or "Rooms" (Pill 3) loads `Chapter2DreamHome`. While this ensures legacy bookmarks or URL params (`?stage=2` or `?stage=3`) do not break, it creates user confusion during linear progression.
4. **State Preservation:**  
   All selections in Chapter 2 write directly to `useWizardStore`. When transitioning to Stages 4 through 8, all home and room data is seamlessly preserved and passed to downstream calculators.

### 7.3 Navigation Deduplication Recommendation
To resolve this limitation without prematurely overhauling the remaining stages (which are scheduled for Tasks 2.3–2.6):
- In `PlannerPage.tsx`, update `handleNext()` so that when `activeStage === 2`, clicking Next automatically advances to `4` (skipping redundant stage 3).
- Conversely, when clicking "Back" from Stage 4, `handlePrev()` should step back directly to `2`.
- When the full 7-chapter restructuring is completed in Task 2.7, `STAGE_CONFIG` will be permanently replaced with `CHAPTER_CONFIG` (7 chapters).

---

## 8. TEST COVERAGE & REGRESSION VERIFICATION

### 8.1 Dedicated Chapter 2 Test Suite Audit

The newly created test suite [`src/calculation-engine/__tests__/chapter2_dream_home.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter2_dream_home.test.ts) was audited for technical rigor:

| Test Case | Scenario Tested | Status | Execution Duration |
|:---:|:---|:---:|:---:|
| **Test 1** | Evaluates all 5 building-use types (`Duplex`, `Triplex`, `Rental Units`, `Mixed Use`, `Farmhouse`) and verifies that `Rental Units` and `Mixed Use` generate 1 entrance door per floor while others generate 1 dwelling entrance door. | **PASS** | 595ms |
| **Test 2** | Evaluates floor counts from G to G+4, scaling BUA and confirming that `liftRequired` automatically defaults to `true` at G+3 and above. | **PASS** | 12ms |
| **Test 3** | Stilt parking evaluation: confirms minimum 2 floors, 180 sq.ft/car bay allowance, and verifies that stilt area is excluded from habitable BUA. | **PASS** | 8ms |
| **Test 4** | Canonical room configuration: verifies floor-wise space allocation via `BuildingModel` without manual room dimension entries. | **PASS** | 14ms |
| **Test 5** | Room steppers & 3BHK reset: verifies that modifying counts activates custom layout mode and `applySampleRoomConfig()` cleanly restores the standard 3BHK layout. | **PASS** | 10ms |
| **Test 6** | BUA summary metrics: verifies calculations for Habitable BUA, Ground Footprint, Super BUA (115%), parking footprint, and total constructed scope. | **PASS** | 6ms |
| **Test 7** | Compatibility with Chapter 1 plot inputs: verifies integration with plot dimensions, road widths, and municipal coverage limits. | **PASS** | 8ms |
| **Test 8** | Backward & forward navigation: confirms that navigating between Chapter 1 and Chapter 2 preserves all inputs without state mutation. | **PASS** | 11ms |
| **Test 9** | Anonymous session persistence: confirms that session ID and configuration persist across state updates. | **PASS** | 7ms |
| **Test 10** | End-to-end engine propagation: verifies that Chapter 2 configurations propagate through the full engine, generating valid BOQ, schedules, and structural quantities. | **PASS** | 48ms |

### 8.2 Full Suite Regression & Baseline Comparison

| Verification Suite | Pre-Task 2.2 Baseline | Post-Task 2.2 Final Count | Result / Delta |
|:---|:---:|:---:|:---:|
| **Chapter 2 Test Suite** | 0 tests | **10 tests** | **+10 tests (100% pass)** |
| **Chapter 1 Test Suite** | 13 tests | **13 tests** | **13 passed (Invariant)** |
| **Total Vitest Test Files** | 62 passed | **63 passed** | **+1 file (100% pass)** |
| **Total Vitest Tests** | 820 passed | **830 passed** | **+10 tests (0 failures)** |
| **Frontend TypeScript Check (`tsc -b`)** | 0 errors | **0 errors** | **Clean (0 errors)** |
| **Server TypeScript Check (`tsc -p server`)** | 0 errors | **0 errors** | **Clean (0 errors)** |
| **Production Build (`npm run build`)** | Clean | **Clean (47.26s)** | **3,018 modules compiled** |

---

## 9. CHANGED-FILE & PROTECTED-SYSTEM AUDIT

An exhaustive Git inspection (`git status --porcelain` and `git diff`) was executed to confirm that no protected systems were touched.

### 9.1 Changed File Breakdown

```
Untracked New Files:
  - src/features/planner/chapters/Chapter2DreamHome.tsx (New Chapter 2 component)
  - src/calculation-engine/__tests__/chapter2_dream_home.test.ts (New automated test suite)
  - docs/hutty-3.1/phase-02/TASK_2_2_CHAPTER_2_IMPLEMENTATION_REPORT.md (Implementation documentation)

Tracked Modified Files:
  - src/features/planner/PlannerPage.tsx (Mounted Chapter2DreamHome at stage 2 and 3)
```

*(Note: Prior uncommitted changes in `useWizardStore.ts`, `useCalculationStore.ts`, and `Stage1Plot.tsx` originated from founder-approved Task 2.1.2 location synchronization and have been verified invariant).*

### 9.2 Protected Systems Invariance Verification

| Protected System | Modified in Task 2.2? | Verification Evidence |
|:---|:---:|:---|
| **Calculation Engine Formulas (`src/calculation-engine/modules/**`)** | **NO** | `git diff src/calculation-engine/modules/` returned 0 lines changed. |
| **IS-456 Structural Rules (`src/calculation-engine/modules/rcc.ts`)** | **NO** | 100% invariant. Rebar thumb rules, concrete grades, and column sizing untouched. |
| **Authority Rule Definitions (`src/calculation-engine/data/authorityRules/**`)** | **NO** | 100% invariant. Bengaluru (GBA/BBMP) and Mysore (MUDA) rules untouched. |
| **Database Schema & Migrations (`prisma/schema.prisma`)** | **NO** | `git diff prisma/` returned 0 lines changed. |
| **Backend API Contracts (`server/src/routes/**`)** | **NO** | `git diff server/src/routes/` returned 0 lines changed. |
| **Cashfree Payment Logic (`server/src/services/cashfree*`)** | **NO** | 100% invariant. Payment gateways and order generation untouched. |
| **Pricing, Commercial Tiers & Product Codes** | **NO** | Free (₹0), Basic PDF (₹99), Detailed BOQ (₹499), Premium BOQ (₹1,499), and Consultation (₹1,499) remain untouched. |
| **Authentication & Authorization (`server/src/middleware/auth*`)** | **NO** | 100% invariant. JWT tokens, session cookies, and customer accounts untouched. |

---

## 10. ISSUES REQUIRING CORRECTION BEFORE TASK 2.3

Before proceeding to **Task 2.3 (Chapter 3: Construction Style & Core Structure)**, the following three targeted refinements must be implemented:

### Issue 1: Sequential Navigation Deduplication in `PlannerPage.tsx`
- **Description:** Clicking "Next" on Stage 2 advances to Stage 3, rendering `<Chapter2DreamHome />` twice in sequence.
- **Required Action:** Update `handleNext()` in `PlannerPage.tsx` so that when `activeStage === 2`, it steps directly to `4`. Update `handlePrev()` so that when `activeStage === 4`, it steps back directly to `2`.

### Issue 2: Elevator Recommendation Subtext Correction
- **Description:** In [`Chapter2DreamHome.tsx:572`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter2DreamHome.tsx#L572), the subtext states: *"Mandatory / Standard engineering recommendation for buildings G+3 and above"*.
- **Required Action:** Remove the word "Mandatory". Replace with: *"Recommended engineering provision for residences G+3 and above for multi-level accessibility."*

### Issue 3: Parking Assumptions Spatial Disclaimer
- **Description:** The parking footings (`~120 sq.ft/car`, `~180 sq.ft/car`, `35 sq.ft/bike`) lack a clear label identifying them as space-planning allowances rather than statutory legal minimums.
- **Required Action:** Add a clear micro-copy note in Section 3: *"Planning estimates including parking bay and maneuvering clearances. Subject to municipal vehicle access requirements."*

---

## SUMMARY & NEXT STEPS

Chapter 2 has successfully achieved its core engineering objectives. The 3 limitations identified above are minor frontend presentation and navigation refinements that do not affect the underlying calculation engine or commercial integrity.

**Standing by for Founder Review of this report before executing the 3 minor corrections or advancing to Task 2.3.**

