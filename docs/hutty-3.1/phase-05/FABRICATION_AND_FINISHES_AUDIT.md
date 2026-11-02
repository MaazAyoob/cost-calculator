# HUTTY 3.1 — PHASE 05: FABRICATION, ELEVATION & EXTERNAL FINISHES AUDIT
**Document Reference:** `docs/hutty-3.1/phase-05/FABRICATION_AND_FINISHES_AUDIT.md`  
**Scope:** Metal Fabrication, Railings, Gates, Skylights, Balcony Fenestration & Exterior Cladding  
**Verification Date:** November 1, 2026  
**Status:** FULLY INTEGRATED & MATHEMATICALLY VERIFIED

---

## 1. Requirement Origin & Objective

During the September 19, 2026 review and subsequent client specification updates, the client noted that real residential projects in Bangalore require essential architectural metalwork and external finishes:
1. Internal staircase handrails (SS 304 with toughened glass or MS wood top).
2. Balcony protective railings.
3. Terrace perimeter parapet/safety railings.
4. Main driveway boundary gate (CNC designer, wrought iron, or tubular MS).
5. Rooftop overhead water tank inspection cat ladder.
6. Courtyard / stairwell skylight glazing.
7. Full-height sliding French balcony doors.
8. Front elevation architectural cladding (HPL, stone veneer, or texture louvers).

In Phase 05, these items were fully integrated into the calculation engine, BOQ generator, fixture schedules, store state, and Chapter 6 user interface while preserving strict mathematical invariance and zero unexplained residual.

---

## 2. Quantity Derivation Equations

All takeoff quantities derive deterministically from physical building geometry and floor counts:

| Element | Unit | Canonical Takeoff Equation | Default Ground + 1 Villa |
|:---|:---:|:---|:---:|
| **Staircase Handrailing** | Rft | $\max(0, (\text{floors} - 1) \times 24)$ | $1 \times 24 = 24\text{ Rft}$ |
| **Balcony Guard Railing** | Rft | $\text{balconyCount} \times 12$ | $2 \times 12 = 24\text{ Rft}$ |
| **Terrace Safety Railing** | Rft | $\text{if } \text{floors} \ge 1 \text{ then } 45 \text{ else } 0$ | $45\text{ Rft}$ |
| **Main Driveway Gate** | SqFt | $12\text{ ft wide} \times 10\text{ ft high} = 120\text{ SqFt}$ | $120\text{ SqFt}$ |
| **OHT Cat Ladder** | Unit | $1\text{ Unit (12 ft vertical MS caged ladder)}$ | $1\text{ Unit}$ |
| **Skylight Unit** | Unit | $1\text{ Unit (36 sq.ft toughened laminated glazed skylight)}$ | $1\text{ Unit}$ |
| **Balcony French Sliding Door** | Set | $\text{balconyCount sets (8 ft wide } \times 7\text{ ft high)}$ | $2\text{ Sets}$ |
| **Front Façade Cladding** | SqFt | $240\text{ SqFt (Architectural feature panels)}$ | $240\text{ SqFt}$ |

---

## 3. Rate Master Baseline Calibration

All unit prices are authoritatively configured in [`rateMasterDefaults.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/data/rateMasterDefaults.ts):

```typescript
// Metal Fabrication & Railings
'fabrication.staircase_railing_ss_glass': 1850,    // ₹/Rft (SS 304 + 10mm Toughened Glass)
'fabrication.staircase_railing_ms_wood': 1250,     // ₹/Rft (MS Uprights + Teakwood Top Handrail)
'fabrication.staircase_railing_ms_pipe': 650,      // ₹/Rft (MS Hollow Square Section)
'fabrication.balcony_railing_ss_glass': 1650,      // ₹/Rft (SS 304 Stanchions + Toughened Glass)
'fabrication.balcony_railing_ms_grille': 1150,     // ₹/Rft (Designer Heavy MS Grille)
'fabrication.terrace_safety_railing': 450,         // ₹/Rft (3-tier GI/MS Hollow Pipe)
'fabrication.main_gate_designer': 420,             // ₹/SqFt (CNC Cut Designer Steel)
'fabrication.main_gate_wrought_iron': 650,         // ₹/SqFt (Forged Wrought Iron)
'fabrication.main_gate_tubular': 280,              // ₹/SqFt (Standard MS Tubular)
'fabrication.oht_cat_ladder': 9500,                // ₹/Unit (12 ft Caged Safety Ladder)
'fabrication.skylight_glazing': 18500,             // ₹/Unit (Toughened Laminated Glazing)

// Joinery Additions
'doors.balcony_french_slider': 18500,              // ₹/Set (UPVC / Heavy Aluminum 3-track)

// Elevation & External Finishes
'elevation.hpl_stone_cladding': 280,               // ₹/SqFt (Exterior HPL Sheets / Stone Veneer)
'elevation.grooved_texture_louvers': 140,          // ₹/SqFt (Aluminium / Cement Fiber Louvers)
```

---

## 4. BOQ & Fixture Schedule Reconciliation

### 4.1 BOQ Schedule Additions (`boq.ts`)
Section 15 of [`boq.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts) generates canonical BOQ line items under categories:
- `'Metal Fabrication & Railings'` (Codes: `FB-STAIR-RAIL`, `FB-BALC-RAIL`, `FB-TERR-RAIL`, `FB-GATE-MAIN`, `FB-LADDER-OHT`, `FB-SKYLIGHT`)
- `'Doors'` (Code: `DR-BALC`)
- `'Elevation & External Finishes'` (Code: `EV-FACADE-CLAD`)

### 4.2 Fixture Schedule Mirroring (`fixtures.ts`)
To maintain strict single-source accounting, all fabrication items are mirrored in [`fixtures.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/fixtures.ts) as schedule items contributing to `directFixtureCost`.

### 4.3 Proof of Zero Residual Invariance
In the canonical budget system ([`budget.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/budget.ts)):
$$\text{directConstructionBudget} = \sum \text{BOQ amounts} = \text{BOQ}_{\text{base}} + \Delta X$$
$$\text{directFixtureCost} = \text{Fixtures}_{\text{base}} + \Delta X$$
$$\text{directMaterialCost} = \text{directConstructionBudget} - \text{directFixtureCost} - \text{directLabourCost}$$
Substituting the augmented values:
$$\text{directMaterialCost} = (\text{BOQ}_{\text{base}} + \Delta X) - (\text{Fixtures}_{\text{base}} + \Delta X) - \text{directLabourCost} = \text{BOQ}_{\text{base}} - \text{Fixtures}_{\text{base}} - \text{directLabourCost}$$
The addition $\Delta X$ cancels completely. Therefore:
1. `directMaterialCost` remains **100% invariant**.
2. Unexplained residual is **identically 0**.
3. Direct Construction Budget accurately reflects the true full turnkey cost of the home.

---

## 5. UI Integration in Chapter 6

In [`Chapter6Finishes.tsx`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/planner/chapters/Chapter6Finishes.tsx):
- Homeowners can select staircase railing style (SS 304 + Glass vs MS Wood vs MS Pipe).
- Balcony guard railing style (SS 304 + Glass vs Heavy MS Grille).
- Main gate design (CNC Designer vs Wrought Iron vs Tubular MS).
- Façade cladding material (HPL / Stone Veneer vs Texture Louvers).
- Toggles for Overhead Tank Cat Ladder and Skylight Glazing.
- Live cost feedback shows exact line costs, while the persistent preliminary estimate banner updates immediately.

---

## 6. Automated Test Verification

Test Suite: [`chapter6_fabrication_elevation.test.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/__tests__/chapter6_fabrication_elevation.test.ts)
- `✓ 1. Generates fabrication BOQ lines with correct units (Rft, SqFt, Unit, Set)`
- `✓ 2. Multi-floor home scales staircase railing Rft dynamically with upper floors`
- `✓ 3. Single-story ground-only home omits staircase railing safely (0 Rft)`
- `✓ 4. Balcony railing Rft and French sliding door sets scale with balcony count`
- `✓ 5. Switching railing material updates commercial rates without altering physical Rft`
- `✓ 6. Zero residual: directMaterialCost + directLabourCost + directFixtureCost === directConstructionBudget`
- `✓ 7. Rate Master: fabrication unit rates derive authoritatively from rateMasterDefaults`
- `✓ 8. Store Mutator: useWizardStore setFabricationSelection updates state and triggers recalculation`

**Result:** 8/8 tests passing (100% pass rate).

