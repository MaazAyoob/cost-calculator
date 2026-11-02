# HUTTY 3.1 — TASK 2.1.1: CHAPTER 1 TECHNICAL & REGULATORY VERIFICATION
## Comprehensive Verification of Location Coverage, GBA 2026 Regulatory Bylaws, Footprint Feasibility, Engine Reuse & State Preservation

**Deliverable File:** `docs/hutty-3.1/phase-02/TASK_2_1_1_REGULATORY_AND_TECHNICAL_VERIFICATION.md`  
**Audit Date:** October 31, 2026  
**Audit Scope:** Verification-Only Checkpoint for Task 2.1 (`Chapter1PlotSetbacks.tsx`, `BuildableFootprintCanvas.tsx`)  
**Production Code Modifications:** STRICTLY ZERO (Audit and verification only)  
**Test Baseline:** 62 Test Files | 814 / 814 Tests Passed (100%)  
**TypeScript Status:** 0 Compilation Errors (`npx tsc -b` & `npx tsc -p server`)  

---

## 1. Executive Verdict: PASS WITH LIMITATIONS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TASK 2.1.1 EXECUTIVE VERDICT: PASS WITH LIMITATIONS                                    │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Architectural Consolidation   │ PASS — Stage 1 & Stage 4 unified into Chapter 1       │
│ 2D Footprint Visualization    │ PASS — BuildableFootprintCanvas.tsx decoupled & clean  │
│ Backward Compatibility        │ PASS — 807 original + 7 new tests = 814/814 pass (100%)│
│ Calculation Engine Safety     │ PASS — bua.ts and IS-456 core engine strictly untouched│
│ Commercial & Pricing Locks    │ PASS — Free, ₹99, ₹499, ₹1499 tiers 100% invariant     │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Limitation 1 (Regulatory)     │ City-Setback Decoupling in Chapter 1 Component         │
│ Limitation 2 (Coverage)       │ Binary Location Scope (Bangalore / Mysore only)        │
│ Limitation 3 (Terminology)    │ "Permissible Footprint" requires non-statutory clarity │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

The consolidation of Stage 1 (Plot) and Stage 4 (Buildable Space) into [`Chapter1PlotSetbacks.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter1PlotSetbacks.tsx) successfully resolves the homeowner cognitive gap, preserves 100% of inputs, maintains zero data loss across existing sessions, and passes all 814 test cases.

However, this audit identifies **two regulatory/architectural limitations** and **one terminology ambiguity** that must be documented and addressed before the subsequent development phases:
1. **City-Setback Decoupling:** While the background calculation engine ([`bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts)) properly distinguishes between Bengaluru (BBMP/BDA) and Mysuru (MUDA), the local UI component ([`Chapter1PlotSetbacks.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter1PlotSetbacks.tsx)) directly invokes `evaluatePlotSetbacks()`, which defaults to GBA 2026 (Bengaluru) rules for both cities. This was inherited from the legacy `Stage4BuildableSpace.tsx` implementation.
2. **Binary Location Scope:** Only Bangalore and Mysore are supported by the `CityLocation` type definition. Other cities cannot be selected or typed, and any unexpected input silently falls back to Bengaluru bylaws.
3. **Statutory Feasibility Terminology:** The phrase *"Permissible Ground Footprint"* risks homeowner misinterpretation as a municipal sanction rather than an indicative planning cap.

---

## 2. Location & Authority Coverage Verification

### 2.1 Why Only Bangalore and Mysore Are Supported
In [`src/store/useWizardStore.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/store/useWizardStore.ts#L21):
```typescript
export type CityLocation = 'Bangalore' | 'Mysore';
export type AuthorityOption = 'BBMP/BDA' | 'MUDA' | 'Not sure';
```
The codebase was designed to support Karnataka's two primary municipal markets where Rightcon / Hutty operates with localized contractor pricing, rate benchmarks, and gazetted municipal bylaws:
- **Bengaluru:** Bruhat Bengaluru Mahanagara Palike (BBMP) / Bangalore Development Authority (BDA) / Greater Bengaluru Authority (GBA).
- **Mysuru:** Mysuru Urban Development Authority (MUDA) / Mysuru City Corporation (MCC).

### 2.2 Ability to Enter Other Cities
**No.** There is currently no text input, dropdown, or search modal to input any other city (e.g. Mangalore, Hubli-Dharwad, Belgaum, Chennai, Hyderabad). A user can only toggle between `Bangalore` and `Mysore`.

### 2.3 Locality and Planning Authority Representation
- **Locality:** Locality (e.g., *HSR Layout, Whitefield, Jayalakshmipuram*) does **NOT** exist as a field in `useWizardStore.ts`. In the existing codebase, locality is only collected in the Consultation Booking form (`HT-CON`), not in the residential cost calculator.
- **Planning Authority:** Planning authority is stored in `authority` (`BBMP/BDA`, `MUDA`, `Not sure`). In `Chapter1PlotSetbacks.tsx`, `city` and `authority` are displayed as separate sections. While selecting Mysore provides a button for `MUDA (Mysore)`, the UI currently does not automatically restrict or lock the authority options based on the city choice.

### 2.4 Behavior When Location Changes
- **In the Calculation Engine (`bua.ts`):** Changing `city` in the store triggers `useCalculationStore.recalculate()`. In `calculateArea(input)`, `getAuthorityRules(input.city)` correctly resolves `MYSURU_AUTHORITY_RULES` for Mysore and `BENGALURU_AUTHORITY_RULES` for Bangalore.
- **In the Chapter 1 UI Component (`Chapter1PlotSetbacks.tsx`):** `Chapter1PlotSetbacks.tsx` calls `evaluatePlotSetbacks({...})` directly from `authorityRules/index.ts`. Because `evaluatePlotSetbacks()` defaults to `rules = GBA_2026_SETBACK_RULES`, the local preview displays **Bengaluru GBA 2026 setbacks** (e.g., 2.95 ft front, 2.30 ft rear for a 30×40 plot) even if Mysore is selected. (Under MUDA CDP 2031 Schedule II, a 30×40 plot requires 3.94 ft front, 3.28 ft rear, 3.28 ft sides).
  *(Note: This behavior was directly inherited from `Stage4BuildableSpace.tsx` lines 76–81).*

### 2.5 Safety & Fallback for Unsupported Locations
In [`src/calculation-engine/data/authorityRules/index.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/authorityRules/index.ts#L39-L42):
```typescript
export function getAuthorityRules(cityOrAuthority?: string | null): AuthorityRuleSet {
  const normalized = (cityOrAuthority || 'bangalore').toLowerCase().trim();
  return AUTHORITY_REGISTRY[normalized] || BENGALURU_AUTHORITY_RULES;
}
```
If an unsupported city string is somehow passed, the engine handles it without throwing exceptions, falling back to `BENGALURU_AUTHORITY_RULES`.

### 2.6 Accidental Application of Bangalore / Mysore Rules
**Yes.** If a user outside Bangalore or Mysore visits the site, the platform silently defaults them to Bangalore (`BBMP/BDA`), applying Bengaluru municipal setbacks and 70% coverage caps.

### 2.7 Recommended Behavior for Unsupported Locations
1. Provide an option: **"Other City (Outside Bengaluru & Mysuru)"**.
2. When selected, do **not** claim to know local municipal bylaws.
3. Automatically activate the **"Custom Clearances / Surveyor Drawing"** mode with a clear advisory:
   > *"Municipal bylaws for your city are not yet integrated into Hutty. Please enter the clearances from your architect's drawing or sanction plan below."*

---

## 3. GBA 2026 Regulatory Rule Verification

### 3.1 Traceability of Rules Used in Code

The setback rules used in the application are defined in [`src/calculation-engine/data/authorityRules/gbaRules.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/authorityRules/gbaRules.ts).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ GBA 2026 RULES TRACEABILITY MATRIX                                                     │
├─────────────────────┬──────────────┬──────────────┬────────────────────────┬───────────┤
│ Rule ID             │ Plot Area    │ Coverage Cap │ Setback Formulas       │ Status    │
├─────────────────────┼──────────────┼──────────────┼────────────────────────┼───────────┤
│ GBA-2026-MICRO      │ ≤ 646 sq.ft  │ 75%          │ Front: 2.46 ft (fixed) │ UNVERIFIED│
│                     │              │              │ Rear: UNSPECIFIED      │ GAZETTE   │
│                     │              │              │ Left: 1.97 ft | R: 0.0 │ DRAFT     │
├─────────────────────┼──────────────┼──────────────┼────────────────────────┼───────────┤
│ GBA-2026-SMALL      │ 646.01 to    │ 70%          │ Front: 2.95 ft (fixed) │ UNVERIFIED│
│ (e.g. 30×40, 30×50) │ 1,615 sq.ft  │              │ Rear: 2.30 ft (fixed)  │ GAZETTE   │
│                     │              │              │ Left: 2.30 ft | R: 0.0 │ DRAFT     │
├─────────────────────┼──────────────┼──────────────┼────────────────────────┼───────────┤
│ GBA-2026-MED-LARGE  │ 1,615.01 to  │ 65%          │ Front: 12% plot depth  │ UNVERIFIED│
│ (e.g. 40×60, 50×80) │ 43,056 sq.ft │              │ Rear: 8% plot depth    │ GAZETTE   │
│                     │              │              │ Sides: 8% plot width   │ DRAFT     │
├─────────────────────┼──────────────┼──────────────┼────────────────────────┼───────────┤
│ GBA-2026-ESTATE     │ > 43,056 sqft│ 50%          │ Front/Rear/Sides:      │ UNVERIFIED│
│                     │ (> 1 acre)   │              │ Minimum 16.40 ft (5.0m)│ GAZETTE   │
└─────────────────────┴──────────────┴──────────────┴────────────────────────┴───────────┘
```

### 3.2 Regulatory Source Analysis & Classification

1. **Exact Source References in Code:**
   - Source cited in code header: `Karnataka Gazette amendment dated 5 January 2026 (Table 1: Summary for Residential up to 12m)`.
   - Internal reference file: `GBA_Setback_Rules_Feet_Reference.pdf`.
   - Governing legislation: *Karnataka Town and Country Planning Act, 1961* and *Greater Bengaluru Governance Bill*.
2. **Official Verification Status:**
   - In the codebase itself (`gbaRules.ts` line 19, 68, 118, 168), every single rule is explicitly tagged:
     `verificationStatus: 'OFFICIAL_GAZETTE_PENDING_CONFIRMATION'`.
   - The metric values in code (0.75m = 2.46 ft, 0.90m = 2.95 ft, 0.70m = 2.30 ft, 5.0m = 16.40 ft) are direct metric conversions from a circulated gazette draft table for residential buildings up to 12m (G+3).
3. **Statutory Standing vs. BDA RMP 2015:**
   - In active municipal practice across Bengaluru, plan sanctions currently process under the **BDA Revised Master Plan 2015 (RMP 2015)** Zoning Regulations (Table 4.1). Under BDA RMP 2015, standard 30×40 plots require a 1.0m (3.28 ft) front setback and 1.0m (3.28 ft) rear setback.
   - The GBA 2026 rules represent an **anticipated / draft amended framework**, not an undisputed municipal sanction reality.
4. **Classification Summary:**
   - **GBA 2026 Small & Micro Rules:** `Project Assumption based on Gazetted Draft Reference` (NOT verified statutory law).
   - **MUDA CDP 2031 Rules:** `Officially Verified Master Plan Regulation` (*MUDA Comprehensive Development Plan 2031, Chapter 4*).
   - **User Custom Clearances:** `User-Entered Surveyor Clearances`.

---

## 4. Four-Metric Calculation Traceability: Physical vs Statutory

The four metrics displayed in Chapter 1 must never confuse **physical geometry** with **statutory permission to construct**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FOUR-METRIC CALCULATION TRACEABILITY                                                   │
├────────────────────────┬────────────────────────────────┬─────────────────┬────────────┤
│ Metric Name            │ Mathematical Formula           │ Engine Source   │ Nature     │
├────────────────────────┼────────────────────────────────┼─────────────────┼────────────┤
│ 1. Plot Boundary Area  │ W × L                          │ Input × Input   │ Physical   │
├────────────────────────┼────────────────────────────────┼─────────────────┼────────────┤
│ 2. Space Inside        │ [W - (Left + Right)] ×         │ Geometry        │ Physical   │
│    Clearances          │ [L - (Front + Rear)]           │ Envelope        │ Clearance  │
├────────────────────────┼────────────────────────────────┼─────────────────┼────────────┤
│ 3. Permissible Ground  │ min(Space Inside Clearances,   │ evaluatePlot-   │ Regulatory │
│    Footprint           │      Plot Area × Coverage%)    │ Setbacks()      │ Cap        │
├────────────────────────┼────────────────────────────────┼─────────────────┼────────────┤
│ 4. Total Floor Area    │ Permissible Ground Footprint   │ Space Model /   │ Estimated  │
│    (All Floors)        │ × Planned Floors (or FAR cap)  │ bua.ts          │ Total BUA  │
└────────────────────────┴────────────────────────────────┴─────────────────┴────────────┘
```

### 4.1 Detailed Breakdown of Each Metric

#### Metric 1: Plot Boundary Area
- **Input Fields:** `plotWidth` (ft), `plotLength` (ft).
- **Calculation Source:** `calculatedArea = numWidth * numLength`.
- **Classification:** **Physical measurement** derived purely from user inputs.
- **Missing Data Handling:** If unentered, safely defaults to 30 ft × 40 ft (1,200 sq.ft).

#### Metric 2: Space Inside Clearances (Geometric Envelope)
- **Input Fields:** `safeWidth`, `safeLength`, `effFront`, `effRear`, `effLeft`, `effRight`.
- **Calculation Source:**
  ```typescript
  effBuildableWidth = Math.max(0, safeWidth - (effLeft + effRight));
  effBuildableLength = Math.max(0, safeLength - (effFront + effRear));
  geometricEnvelopeSqFt = effBuildableWidth * effBuildableLength;
  ```
- **Classification:** **Physical 2D clear space**. This is simply the physical land remaining inside the boundary clearance lines.
- **Important Distinction:** A homeowner **CANNOT** simply pave or build over this entire area. Building bylaws separately mandate an unbuilt open area (coverage cap).

#### Metric 3: Permissible Ground Footprint
- **Input Fields:** `geometricEnvelopeSqFt`, `grossPlotArea`, `maxCoveragePct` (70% for $\le 1,615\text{ sq.ft}$; 65% for $> 1,615\text{ sq.ft}$).
- **Calculation Source:**
  ```typescript
  statutoryCoverageLimitSqFt = Math.round(grossPlotArea * (maxCoveragePct / 100));
  permissibleGroundFootprintSqFt = Math.min(geometricEnvelopeSqFt, statutoryCoverageLimitSqFt);
  ```
- **Classification:** **Calculated statutory constraint**. On a standard 30×40 plot (1,200 sq.ft):
  - Space inside clearances = 963 sq.ft.
  - 70% coverage limit = 840 sq.ft.
  - Result = **840 sq.ft** (the stricter limit governs).
- **Terminology Risk:** The word *"Permissible"* implies that the municipal authority has already granted planning permission. Homeowners may interpret this as an official sanction.

#### Metric 4: Total Floor Area (Across All Floors)
- **Input Fields:** `permissibleGroundFootprintSqFt`, `floors` (or `area.totalBUASqFt` from `useArea()`).
- **Calculation Source:** `permissibleGroundFootprintSqFt * plannedFloors`.
- **Classification:** **Estimated aggregate built-up area (BUA)**.

### 4.2 Recommended Terminology Corrections
To prevent homeowner confusion and legal exposure, adopt the following terms in subsequent phases:
- Replace *"Permissible Ground Footprint"* with:  
  **"Maximum Buildable Ground Floor (Estimated Cap)"**
- Replace *"Space Inside Clearances"* with:  
  **"Space Inside Setback Clearances (Physical Envelope)"**
- Replace *"Total Floor Area (All Floors)"* with:  
  **"Estimated Total Built-Up Area (Across Planned Floors)"**

---

## 5. Existing Calculation Engine Reuse & Dependency Mapping

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CALCULATION ENGINE DEPENDENCY MAP                                                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   useWizardStore                                                                       │
│   (plotLength, plotWidth, roadWidthFt, city, authority, customSetbacks)                │
│         │                                                                              │
│         ├───► useCalculationStore (Zustand subscriber)                                 │
│         │          │                                                                   │
│         │          └───► runCalculator(input)                                          │
│         │                     │                                                        │
│         │                     └───► calculateArea(input) [bua.ts]                      │
│         │                                │                                             │
│         │                                └───► evaluateAuthorityLimits(params)         │
│         │                                           │                                  │
│         │                                           ├── Bengaluru: GBA 2026            │
│         │                                           └── Mysuru: MUDA CDP 2031          │
│         │                                                                              │
│         └───► Chapter1PlotSetbacks.tsx (Frontend View)                                 │
│                    │                                                                   │
│                    ├──► useArea() (Reads canonical store BUA, plotArea, totalBUASqFt)  │
│                    │                                                                   │
│                    ├──► evaluatePlotSetbacks() (Local GBA 2026 preview calculator)    │
│                    │                                                                   │
│                    └──► BuildableFootprintCanvas.tsx (Pure SVG renderer)              │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Verification Findings on Engine Reuse
1. **Existing Engine Untouched:** No code was modified in `src/calculation-engine/**`, `bua.ts`, `calculator.ts`, or `engineeringAssumptions.ts`.
2. **Duplicate Logic Finding:** `Chapter1PlotSetbacks.tsx` does **not** reimplement the math in JSX; it imports `evaluatePlotSetbacks()` from `src/calculation-engine/data/authorityRules`. However, calling `evaluatePlotSetbacks()` directly without passing `cityOrAuthority` means the frontend preview bypasses the authority routing in `evaluateAuthorityLimits()`.
3. **SVG Canvas Purity:** `BuildableFootprintCanvas.tsx` is a 100% pure presentational component. It takes numbers as props (`plotWidth`, `plotLength`, `frontSetback`, etc.) and renders SVG rectangles, lines, and text. It contains zero calculation engine logic.

---

## 6. Defaults & Custom Clearances Behavior

### 6.1 Standard Municipal Rules Mode (State A - Default)
- **Default Selection:** The user begins in State A (`useCustomSetbacks === false`).
- **Calculation:** Evaluates setbacks via `evaluatePlotSetbacks()`. For a 30×40 plot, effective setbacks are automatically 2.95 ft front, 2.30 ft rear, 2.30 ft left, 0.00 ft right.
- **Store State:** In State A, `frontSetback`, `rearSetback`, `leftSetback`, and `rightSetback` in `useWizardStore` remain `null`, signaling to the backend that statutory rules govern.

### 6.2 Custom Surveyor Clearances Mode (State B)
- **Activation:** The user clicks *"Have specific setbacks from your surveyor or architect drawing? Enter custom clearances →"*.
- **State Initialization:** `handleEnableCustomSetbacks()` pre-populates the custom input fields with the active effective setbacks (`effFront`, `effRear`, `effLeft`, `effRight`) so the user does not start with blank or broken inputs.
- **Store Mutation:** Typing into any custom field immediately triggers `setCustomSetbacks(front, rear, left, right)` in `useWizardStore`.
- **Engine Override:** In `bua.ts`, when `customSetbacks` is present, statutory values are overridden:
  ```typescript
  appliedFront = customSetbacks.frontSetbackFt;
  verificationStatus = 'MANUAL_OVERRIDE';
  ```
- **Reversion:** Clicking *"Reset to standard municipal rules"* invokes `setCustomSetbacks(null, null, null, null)`, resetting the store fields to `null` and instantly restoring statutory defaults.

### 6.3 Boundary Exceedance Handling
- If a user enters clearances that exceed plot boundaries (e.g., Left 20 ft + Right 15 ft on a 30 ft plot):
  1. `setbacksExceedPlot` evaluates to `true`.
  2. A red warning banner renders: *"Setbacks exceed plot boundary. Please adjust dimensions."*
  3. Inside `BuildableFootprintCanvas`, `envW <= 0` is detected, suppressing the negative envelope and displaying an SVG error badge.
  4. In `bua.ts`, `buildableWidthFt` and `buildableLengthFt` are clamped to `0` via `Math.max(0, ...)`.

---

## 7. Regression & State Preservation Results

### 7.1 Automated Vitest Test Verification

```
Test Files: 62 passed (62)
Tests:      814 passed (814)
Duration:   45.84s
```

All 807 original tests continue to pass without a single regression. The 7 additional tests introduced in Task 2.1 reside in [`src/calculation-engine/__tests__/chapter1_plot_setbacks.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter1_plot_setbacks.test.ts):

1. `initializes plot and setback store state and applies safe residential defaults` &rarr; **PASSED**
2. `applies popular preset plot sizes deterministically` &rarr; **PASSED**
3. `configures road width and multi-boundary corner frontages` &rarr; **PASSED**
4. `evaluates standard municipal setbacks and footprint for 30 × 40 ft plot` &rarr; **PASSED**
5. `applies custom surveyor clearances and overrides standard municipal defaults` &rarr; **PASSED**
6. `detects when setbacks exceed plot boundary dimensions` &rarr; **PASSED**
7. `reconciles the four metric pillars across 2 planned floors` &rarr; **PASSED**

### 7.2 Core Downstream Regressions Verified (All Passing)
- `stage4_buildable_space_regression.test.ts` (6 tests) &rarr; **PASSED**
- `plot_setback_v2.test.ts` (18 tests) &rarr; **PASSED**
- `step_navigation_reachability.test.ts` (14 tests) &rarr; **PASSED**
- `validate_benchmarks.test.ts` (7 tests) &rarr; **PASSED**
- `final_acceptance_validation.test.ts` (4 tests) &rarr; **PASSED**
- `estimate_completeness_and_modes.test.ts` (10 tests) &rarr; **PASSED**
- `cashfree_checkout_session_flow.test.ts` (8 tests) &rarr; **PASSED**
- `report_paywall_and_pdf_quality.test.ts` (7 tests) &rarr; **PASSED**

### 7.3 Session Persistence & Navigation Invariance
- **Zustand Persist Integrity:** The state schema key `cost_calculator_wizard_state_v4` remains 100% compatible. Refreshing the browser or returning to an existing session preserves all plot and setback inputs.
- **Stage Navigation:** Forward navigation to Stages 2–8 and backward navigation to Chapter 1 operate smoothly. The docked bottom navigation bar and top pill stepper remain intact.

---

## 8. Documentation Inconsistency Correction (6-Step vs. 7-Step)

The Task 2.1 implementation report stated in its narrative: *"Natural 6-Step Intake Flow"*, but then listed 7 sections.

**Correction & Clarification:**
The actual rendered UI in [`Chapter1PlotSetbacks.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter1PlotSetbacks.tsx) comprises **7 structured sections**:
- **Section 1:** Location (Bangalore / Mysore toggle)
- **Section 2:** Plot Dimensions (Presets & custom width/length)
- **Section 3:** Road Width & Corner Orientation (20ft, 30ft, 40ft, 60ft+ & corner boundaries)
- **Section 4:** Local Planning Authority & Land Status (BBMP, MUDA, Not sure)
- **Section 5:** Boundary Setbacks & Clearances (Standard vs Custom toggle)
- **Section 6:** Indicative Buildable Footprint & Space Breakdown (Canvas + 4 Metric Pillars)
- **Section 7:** Progressive Disclosure (Sanction drawings, soil condition & demolition)

*The inconsistency arose because the preliminary roadmap originally conceived Sections 5 & 6 as a single combined setback step, but during implementation they were separated into distinct interactive control and visualization cards for superior clarity on mobile devices.*

---

## 9. Unsupported Cases & Risk Matrix

| Risk / Unsupported Case | Severity | Architectural Impact | Proposed Mitigation |
|---|:---:|---|---|
| **Mysore UI Setback Misalignment** | MEDIUM | When `city === 'Mysore'`, Chapter 1 preview card shows GBA 2026 (Bengaluru) setbacks while backend engine calculates MUDA setbacks. | In Task 2.2 / Chapter 1 cleanup, pass `city` into `evaluateAuthorityLimits` so the preview matches the backend. |
| **Cities Outside Bangalore/Mysore** | LOW | Users in other cities receive Bengaluru defaults without warning. | Add "Other City" option defaulting to Custom Clearances mode with advisory notice. |
| **"Permissible" Terminology Legal Exposure** | LOW | Layman homeowner may interpret "Permissible" as confirmed municipal approval. | Update label to "Maximum Permissible Ground Floor (Estimated Cap)" with disclaimer. |
| **Setback Boundary Overflow** | NONE | Entering huge custom setbacks could cause negative SVG geometry. | **Resolved:** Fully mitigated by `setbacksExceedPlot` check and SVG warning card. |

---

## 10. Items Requiring Founder Decision Before Task 2.2

The following items are submitted for founder guidance:

1. **Mysore Setback Synchronization:**
   - *Option A (Recommended):* Update Chapter 1 to evaluate `evaluateAuthorityLimits({ city: store.city })` so that selecting Mysore immediately shows MUDA setbacks (3.94 ft front, 3.28 ft rear/sides for 30×40) in both the preview and the engine.
   - *Option B:* Retain GBA 2026 rules as the default statewide baseline until a broader multi-city rule manager is scheduled.
2. **Unsupported Locations Handling:**
   - *Option A (Recommended):* Add an "Other City" button that automatically enables "Custom Surveyor Clearances" mode with an advisory note.
   - *Option B:* Retain strict Bangalore / Mysore binary focus for the current release.
3. **Terminology Refinement:**
   - Approve the replacement of *"Permissible Ground Footprint"* with *"Maximum Buildable Ground Floor (Estimated Cap)"*.

---

## 11. Strict Stop Condition Adherence

In accordance with your instructions:
- **No production code has been modified.**
- **No calculation formulas or regulatory rules have been altered.**
- **No database or backend services were touched.**
- **Task 2.2 has NOT been started.**

This verification report is complete and submitted for founder review.

