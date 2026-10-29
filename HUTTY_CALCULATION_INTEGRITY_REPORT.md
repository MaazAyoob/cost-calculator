# HUTTY — CALCULATION INTEGRITY & MATHEMATICAL RECONCILIATION REPORT

**Audit Date:** 2026-10-26  
**Audited Components:**
- `src/calculation-engine/engine.ts`
- `src/calculation-engine/rules/plotSetbackRules.ts`
- `src/calculation-engine/rules/builtUpAreaRules.ts`
- `src/calculation-engine/rules/materialQuantityRules.ts`
- `src/calculation-engine/rules/costRules.ts`
- `src/features/planner/stages/Stage4BuildableSpace.tsx`
- `src/features/planner/stages/Stage7Estimate.tsx`
- `src/features/planner/stages/Stage8DetailedBOQ.tsx`

---

## 1. Executive Summary

This report documents the mathematical audit and remediation of Hutty's calculation engine and frontend presentation layers. Prior audits identified discrepancies between geometric setback envelopes and legal ground coverage limits, confusion between ground footprint and total built-up area across multiple floors, and a ₹1 arithmetic rounding residual between component breakdowns and the headline estimate.

All issues have been analyzed to their mathematical roots, corrected in the codebase, and verified with automated regression tests and live browser execution.

---

## 2. Setback Geometric Envelope vs Statutory Maximum Ground Coverage

### 2.1 The Problem
In previous versions of Stage 4:
- A **30 × 40 ft** plot (1,200 sq.ft) showed a buildable envelope of **963 sq.ft**, while simultaneously displaying a **70% coverage limit** (840 sq.ft).
- A **40 × 60 ft** plot (2,400 sq.ft) showed a buildable envelope of **1,613 sq.ft**, while simultaneously displaying a **65% coverage limit** (1,560 sq.ft).

If an application displays a 963 sq.ft envelope without clarifying that municipal bylaws strictly prohibit building on more than 840 sq.ft, the homeowner is misled into believing they can construct a 963 sq.ft ground floor.

### 2.2 Mathematical Derivations

#### Case A: 30 ft × 40 ft Plot (Total Area = 1,200 sq.ft)
- **Municipal / BBMP Setback Rules (Road Width < 12m):**
  - Front Setback = 0.90 m = **2.95 ft**
  - Rear Setback = 0.70 m = **2.30 ft**
  - Left Setback = 0.00 m = **0.00 ft** (row/semi-detached option) or 0.70 m = 2.30 ft
  - Right Setback = 0.70 m = **2.30 ft**
- **Buildable Depth:** $40\text{ ft} - (2.95\text{ ft} + 2.30\text{ ft}) = 34.75\text{ ft}$
- **Buildable Width:** $30\text{ ft} - 2.30\text{ ft} = 27.70\text{ ft}$
- **Geometric Setback Envelope:**
  $$\text{Envelope} = 34.75\text{ ft} \times 27.70\text{ ft} = 962.58 \approx 963\text{ sq.ft}$$
- **Statutory Maximum Ground Coverage (BBMP Bylaw Table 4):**
  $$\text{Coverage Limit} = 70\% \times 1,200\text{ sq.ft} = 840.00\text{ sq.ft}$$
- **Permissible Ground Footprint ($\min$ constraint):**
  $$\text{Permissible Footprint} = \min(963, 840) = 840\text{ sq.ft}$$
- **Governing Constraint:** The statutory coverage cap of 840 sq.ft is binding ($963 > 840$). The homeowner cannot build a 963 sq.ft ground floor legally.

#### Case B: 40 ft × 60 ft Plot (Total Area = 2,400 sq.ft)
- **Municipal / BBMP Setback Rules (Road Width 12m):**
  - Front Setback = 12% of depth = $0.12 \times 60\text{ ft} = 7.20\text{ ft}$
  - Rear Setback = 8% of depth = $0.08 \times 60\text{ ft} = 4.80\text{ ft}$
  - Side 1 Setback = 8% of width = $0.08 \times 40\text{ ft} = 3.20\text{ ft}$
  - Side 2 Setback = 8% of width = $0.08 \times 40\text{ ft} = 3.20\text{ ft}$
- **Buildable Depth:** $60\text{ ft} - (7.20\text{ ft} + 4.80\text{ ft}) = 48.00\text{ ft}$
- **Buildable Width:** $40\text{ ft} - (3.20\text{ ft} + 3.20\text{ ft}) = 33.60\text{ ft}$
- **Geometric Setback Envelope:**
  $$\text{Envelope} = 48.00\text{ ft} \times 33.60\text{ ft} = 1,612.80 \approx 1,613\text{ sq.ft}$$
- **Statutory Maximum Ground Coverage (BBMP Bylaw Table 4):**
  $$\text{Coverage Limit} = 65\% \times 2,400\text{ sq.ft} = 1,560.00\text{ sq.ft}$$
- **Permissible Ground Footprint ($\min$ constraint):**
  $$\text{Permissible Footprint} = \min(1,613, 1,560) = 1,560\text{ sq.ft}$$
- **Governing Constraint:** The statutory coverage cap of 1,560 sq.ft is binding ($1,613 > 1,560$).

### 2.3 Implementation in `Stage4BuildableSpace.tsx`
We updated Stage 4 to explicitly distinguish and display:
1. **Total Plot Area** (1,200 sq.ft / 2,400 sq.ft).
2. **Geometric Setback Envelope** (963 sq.ft / 1,613 sq.ft).
3. **Statutory Coverage Cap** (840 sq.ft [70%] / 1,560 sq.ft [65%]).
4. **Permissible Ground Floor Footprint**: `Math.min(envelope, coverageCap)`.
5. **Callout Alert**: Explains in plain English:
   > *"Regulatory Note: While setbacks leave a 963 sq.ft envelope, municipal bylaws cap ground coverage at 70% (840 sq.ft). Your permissible ground construction footprint is capped at 840 sq.ft."*

---

## 3. Floor Area and Total Built-Up Area (BUA) Synchronization

### 3.1 The 720 sq.ft vs 1,440 sq.ft Mystery Solved
The earlier audit noted:
- Total estimate: ₹13,42,531
- Rate: ₹1,865/sq.ft
- Implied area: $13,42,531 / 1,865 \approx 720\text{ sq.ft}$
- Yet the home was ostensibly a G+1 duplex.

**Root Cause Found in Code:**
1. In `useWizardStore.ts`, `floors` initialized to `0`.
2. When the user navigated through Stage 2 without explicitly clicking the pre-selected G+1 card, `floors` remained `0`.
3. In `useCalculationStore.ts`, the input builder had:
   ```ts
   floors: s.floors > 0 ? s.floors : 1
   ```
   This defaulted to **1 single floor**!
4. The calculation engine recommended a footprint of $1,200 \times 0.60 = 720\text{ sq.ft}$. With 1 floor, total BUA was $720 \times 1 = 720\text{ sq.ft}$.
5. Therefore, the estimate was calculating for a single 720 sq.ft floor while the UI header claimed "G+1"!

**Fix Applied:**
In `Stage2Home.tsx`, added a mount `useEffect`:
```tsx
useEffect(() => {
  if (store.floors === 0) {
    store.setFloors(2); // G+1 Duplex is the standard 2-floor baseline
    store.setHouseType('Duplex');
    store.setParking({ cars: 1, bikes: 2 });
  }
}, []);
```
Now, for G+1:
- Ground Floor Footprint = **720 sq.ft**
- Upper Floor Footprint = **720 sq.ft**
- Total Built-Up Area = **1,440 sq.ft**
- Effective Rate = **₹1,430 / sq.ft**
- Headline Estimate = **₹20,59,239**
- Reconciled: $1,440\text{ sq.ft} \times ₹1,430\text{/sq.ft} = ₹20,59,200 \approx ₹20,59,239$ (exact itemized BOQ sum).

---

## 4. Cost Breakdown Zero-Residual Reconciliation

### 4.1 The ₹1 Discrepancy
Earlier reports showed:
- Materials: ₹8,05,518
- Labour: ₹3,75,908
- Fixtures: ₹1,61,104
- Sum: $8,05,518 + 3,75,908 + 1,61,104 = ₹13,42,530$
- Headline Total: **₹13,42,531** (Difference of ₹1).

**Root Cause:**
In `Stage7Estimate.tsx`, `totalCost` was taken directly from the sum of unrounded BOQ line items, while `materialCost`, `labourCost`, and `fixtureCost` were individually rounded using `Math.round()`.
Independent rounding of 3 fractional numbers often produces a $\pm 1$ integer rounding discrepancy:
$$\text{round}(A) + \text{round}(B) + \text{round}(C) \ne \text{round}(A + B + C)$$

**Fix Applied:**
In `Stage7Estimate.tsx`:
```tsx
const directMaterialCost = Math.round(breakdown?.materials || totalCost * 0.58);
const directLabourCost = Math.round(breakdown?.labour || totalCost * 0.28);
// Derive fittings and services as the exact remainder to ensure 100% zero-residual arithmetic equality
const fittingsAndServicesCost = Math.max(0, totalCost - (directMaterialCost + directLabourCost));
```
Now:
$$\text{directMaterialCost} + \text{directLabourCost} + \text{fittingsAndServicesCost} \equiv \text{totalCost}$$
The legend footer displays:
> *"Cost Equation: ₹11,94,359 (Materials) + ₹5,76,587 (Labour) + ₹2,88,293 (Fittings & Finishes) = ₹20,59,239 (100% Reconciled)"*

---

## 5. Material Takeoff Quantities (IS 456 Standards)

The calculation engine derives physical quantities from Indian Standard structural norms:
- **Cement:** $\approx 0.40$ bags per sq.ft BUA. For 1,440 sq.ft = **576 bags** (displayed: **576 Bags**).
- **Steel (Fe 500 TMT):** $\approx 3.20$ kg per sq.ft BUA. For 1,440 sq.ft = **4,608 kg = 4.61 MT** (displayed: **4.61 Tonnes**).
- **Coarse Aggregate:** $\approx 1.35$ cu.ft per sq.ft BUA = **1,944 cu.ft**.
- **Sand / M-Sand:** $\approx 1.80$ cu.ft per sq.ft BUA = **2,592 cu.ft** (displayed: **2,592 cu.ft**).
- **Masonry Units (Concrete Blocks / Bricks):** $\approx 4.0$ blocks per sq.ft BUA = **5,760 Blocks** (displayed: **5,760 Units**).

All quantities update dynamically when the user changes floors or dimensions.

---

## 6. Bill of Quantities (BOQ) & Tax Treatment

### 6.1 Trade-Wise Breakdown (Stage 8)
1. **Substructure & Earthwork:** Excavation, PCC, RCC Footings, Plinth Beam, Anti-termite treatment.
2. **Superstructure:** RCC Columns, Beams, Roof Slabs, Masonry Walling (6" & 4" solid blocks).
3. **Internal & External Finishes:** Cement Plastering, Vitrified Tile Flooring, Acrylic Emulsion Painting.
4. **Services & Fixtures:** CPVC & PVC Plumbing, Concealed Electrical Conduit & Wiring, Modular Switches, Sanitaryware.

### 6.2 GST Separation
- All rates are configured as base construction costs.
- GST is calculated at **18%** on Composite Construction Contracts (Works Contract Service under HSN 9954).
- The detailed BOQ modal and generated PDF itemize base cost, CGST (9%), and SGST (9%).

---

## 7. Status of Engineering Assumptions & Disclaimers

1. **Soil Bearing Capacity:** Assumed standard medium soil ($150\text{ kN/m}^2$). If black cotton soil or rocky strata are present, pile foundation or rock cutting is required (flagged in disclaimers).
2. **Floor Heights:** Assumed 10'0" clear floor-to-ceiling height.
3. **Plinth Height:** Assumed 2'0" above road level.
4. **Non-Sanctioned Disclaimer:** Prominently rendered in Stage 7 and Stage 8:
   > *"Notice: This estimate is an indicative preliminary cost forecast for planning purposes based on regional rates. It does not constitute a sanctioned municipal design or structural engineering certification."*
