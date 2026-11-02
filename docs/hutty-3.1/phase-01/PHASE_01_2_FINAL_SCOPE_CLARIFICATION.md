# HUTTY 3.1 — PHASE 01.2: FINAL SCOPE CLARIFICATION & COMMERCIAL MODEL ALIGNMENT
## Official Pricing Rectification, Four-Tier Access Comparison, Configurable Defaults & Phase 02 Scope

> **Document ID:** `HUTTY-3.1-DOC-PHASE-01.2-FINAL-SCOPE-CLARIFICATION`  
> **Status:** Completed & Authoritative • Prepared for Final Founder Review  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect, Construction-Estimation Systems Analyst & Full-Stack Lead  
> **Primary Authority:** Founder Official Pricing Clarification (October 31, 2026)  
> **Target Baseline:** Hutty 3.0 Production Repository (`c:\Users\Avita\Desktop\Programming\big bnglore client\cost calculator rightcon`)

---

## 1. Executive Summary & Official Pricing Rectification

In response to the founder's directive, this document establishes the **authoritative commercial model** for Hutty 3.1 and rectifies the preliminary classification in Phase 01.1.

### Key Corrections Formally Enacted:
1. **The ₹99 Basic PDF Tier is RETAINED:** The earlier recommendation to deprecate `BASIC_ESTIMATE_PDF` (₹99) was based on a draft change request document and is **formally revoked**. The ₹99 Basic Estimate PDF tier remains active, purchasable, and fully supported.
2. **Four Distinct Report Access Levels:** Hutty offers exactly four estimate and report access tiers:
   - **Free (₹0):** Limited macro-level estimate and preview.
   - **Basic PDF (₹99):** Downloadable concise 1-page executive summary PDF.
   - **Detailed BOQ (₹499):** Downloadable comprehensive itemized Works BOQ, Material Takeoff, and Fixtures schedule PDF.
   - **Premium BOQ (₹1,499):** Downloadable full QS dossier plus Contractor Quote Audit, Material Sensitivity, and Multi-Scenario comparison.
3. **Decoupled Expert Consultation (₹1,499):** Expert consultation is an independent advisory service (human 1-on-1 session). It is **not** a report tier and is **never** merged into or bundled under the ₹1,499 Premium BOQ. It can be purchased on its own at any time.
4. **Configurable Commercial Defaults:** Contractor margin and professional architecture fees are confirmed as **configurable business rules**, never hardcoded or permanently altered without founder consent.
5. **Architectural Visual Integrity:** Generic stock-photo-heavy and AI-generated visuals are rejected in favor of an authentic architectural design language, tactile material textures, and original technical diagrams.

---

## 2. Authoritative Commercial Model & Source Traceability

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        HUTTY 3.1 AUTHORITATIVE COMMERCIAL STRUCTURE                    │
├─────────────────────┬──────────────┬──────────────┬──────────────┬─────────────────────┤
│ Product / Offering  │ Price (INR)  │ Minor Units  │ Product Code │ Entitlement Granted │
├─────────────────────┼──────────────┼──────────────┼──────────────┼─────────────────────┤
│ 1. Free Calculator  │ ₹0           │ 0 paise      │ FREE         │ Web Macro Summary   │
│ 2. Basic PDF Report │ ₹99          │ 9,900 paise  │ BASIC_EST_PDF│ 1-Page Summary PDF  │
│ 3. Detailed BOQ     │ ₹499         │ 49,900 paise │ DETAILED_499 │ Full Itemized BOQ   │
│ 4. Premium BOQ      │ ₹1,499       │ 149,900 paise│ PREMIUM_1499 │ Audit & Sensitivity │
├─────────────────────┼──────────────┼──────────────┼──────────────┼─────────────────────┤
│ 5. Consultation     │ ₹1,499 (Sep) │ 149,900 paise│ CONSULT_1499 │ 1-on-1 Expert Call  │
└─────────────────────┴──────────────┴──────────────┴──────────────┴─────────────────────┘
```

### Source Traceability & Document Origin:
- **Founder Direct Authority:** Confirmed in Phase 01.2 official directive. Supersedes all previous draft classifications.
- **Codebase Source of Truth:**
  - `BASIC_ESTIMATE_PDF` (₹99): Defined in [`src/config/pricing.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/config/pricing.ts#L189-L206) with `priceMinorUnits: 9900`, `active: true`, `purchasable: true`.
  - `DETAILED_ESTIMATE_499` (₹499): Defined in [`src/config/pricing.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/config/pricing.ts#L125-L154) with `priceMinorUnits: 49900`.
  - `PREMIUM_1499` (₹1,499): Defined in [`src/config/pricing.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/config/pricing.ts#L155-L187) with `priceMinorUnits: 149900`.
  - `LAUNCH_CONSULTATION_PRICE_INR` (₹1,499): Defined in [`src/config/consultation.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/config/consultation.ts#L11) as standalone service.

---

## 3. Comparison of Actual Report Contents (Code-Verified)

To ensure no deliverable content is invented, the following table compares the **actual production code** implementation across all four tiers and the consultation service:

| Feature / Content Item | Tier 1: Free (₹0) | Tier 2: Basic PDF (₹99) | Tier 3: Detailed BOQ (₹499) | Tier 4: Premium BOQ (₹1,499) | Service: Consultation (₹1,499) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Delivery Medium** | In-Browser Web | Downloadable PDF | Downloadable PDF | Downloadable PDF | Scheduled Video Call (45m) |
| **Generating Component** | `PlannerPage.tsx` | [`BasicEstimatePdfDocument`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/BasicEstimatePdfDocument.tsx) | [`DetailedReportPdfDocument`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/DetailedReportPdfDocument.tsx) | [`DetailedReportPdfDocument`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/features/report/DetailedReportPdfDocument.tsx) | `/consult` Booking Desk |
| **Document Length** | 0 Pages (Screen only) | **1 Page (Executive)** | **8 to 10 Pages** | **9 to 11 Pages** | N/A (Human Session) |
| **Project Geometry & BUA** | Yes (Screen) | Yes (Grid Table) | Yes (Page 2 & 3) | Yes (Page 2 & 3) | Discussed in session |
| **Total Estimated Budget** | Yes (Screen) | Yes (Hero Banner) | Yes (Page 1 & 2) | Yes (Page 1 & 2) | Reviewed with expert |
| **High-Level Cost Split** | Yes (Progress Bars) | Yes (4-Head Table) | Yes (Detailed Head) | Yes (Detailed Head) | Reviewed with expert |
| **BOQ Line Items Preview** | First 5 items only | **None (Excluded)** | **Full Section A BOQ** | **Full Section A BOQ** | N/A |
| **Section A: Works BOQ** | No (Locked) | **No (Excluded)** | **Yes (Full Itemized)** | **Yes (Full Itemized)** | Contractor audit review |
| **Section B: Material Takeoff**| No (Locked) | **No (Excluded)** | **Yes (Tonnes, Bags, CFT)** | **Yes (Tonnes, Bags, CFT)** | Material quality advice |
| **Section C: Fixtures Schedule**| No (Locked) | **No (Excluded)** | **Yes (Doors, Windows, San)**| **Yes (Doors, Windows, San)**| Fixture selection advice |
| **Section E: Labour Takeoff** | No (Locked) | **No (Excluded)** | **Yes (Trade Breakdown)** | **Yes (Trade Breakdown)** | Labour rate verification |
| **Milestone Payment Plan** | No (Locked) | Yes (High-level) | Yes (10-Stage Table) | Yes (10-Stage Table) | Stage release advice |
| **Contractor Redline Checklist**| No | No | No | **Yes (Soil, Power, Sump)** | Live quote redlining |
| **Sensitivity & Tolerances** | No | No | No | **Yes (±% Market Bands)** | Market variance review |
| **Multi-Scenario Comparison** | No | No | No | **Yes (Plot Scenarios)** | Layout optimization |
| **1-on-1 Expert Advisory** | No | No | No | **No (Separate Service)** | **Yes (Licensed Expert)** |

---

## 4. Commercial Calculation Defaults & Configurability

Per founder instruction, contractor margin and professional fees are confirmed as **configurable business rules**, never hardcoded.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        COMMERCIAL ADDITIONS RESOLUTION PIPELINE                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
                              Direct Construction Budget (Base)
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
     Contractor Mode: 'contractor'                             Contractor Mode: 'independent'
               │                                                         │
   • Margin: Configurable (Default 10%)                        • Margin: ₹0 (Self-managed)
   • Contingency: Configurable (Default 0% or 6%)              • Contingency: ₹0
   • Arch Fees: Configurable (Default 0% or 5%)                • Arch Fees: ₹0
   • GST: 18% on taxable base (Optional Toggle)                • GST: ₹0
               │                                                         │
               └────────────────────────────┬────────────────────────────┘
                                            ▼
                                   Total Project Cost
```

### 1. Current Production Defaults (`budget.ts`):
- When user chooses **"Contractor Mode"**:
  - `contractorMargin`: Defaults to **10%** (`0.10`) via `configResolver.resolveParameter('config.commercial.contractor_margin', undefined, 0.10)`. Can be customized by homeowner via interactive slider.
  - `contingency`: Defaults to **0%** (fallback) or **6%** (turnkey benchmark).
  - `professionalFees`: Defaults to **0%** (optional add-on) or **5%** (comprehensive).
  - `gst`: 18% applied when `applyContractorGST === true`.
- When user chooses **"Independent Labour Mode"**:
  - Direct Construction Budget equals Total Project Cost. All contractor margins and commercial additions drop cleanly to ₹0.

### 2. Commercial Invariance Guarantee:
- The base Works BOQ amount ($\sum \text{BOQ Items}$) is **invariant** to commercial markups.
- Modifying margin, fees, or taxes dynamically adjusts Section D (Budget) and Effective Rate per Sq.Ft, but **never alters physical material quantities or civil labour takeoffs**.

---

## 5. Precise Phase 02 Work Breakdown (Seven Chapters Transformation)

The scope of **Hutty 3.1 — Phase 02** is bounded strictly to frontend experience transformation, stage consolidation, dedicated finishes chapters, and homeowner language:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PHASE 02 WORK PACKAGES (7 CHAPTERS)                       │
├─────────────────────┬──────────────────────────────────────────────────────────────────┤
│ Work Package        │ Engineering Scope & Deliverables                                 │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.1: Chapter 1   │ UNIFIED PLOT & SETBACKS (Chapter1Plot.tsx):                       │
│                     │ Merge plot dimensions, road width, municipal authority, setbacks,│
│                     │ and 2D buildable footprint into a single cohesive intake screen.  │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.2: Chapter 2   │ UNIFIED DREAM HOME (Chapter2DreamHome.tsx):                       │
│                     │ Combine house type (Villa/Duplex/Rental), floor counts, parking,  │
│                     │ and room configuration counters with live BUA indicators.         │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.3: Chapter 3   │ CORE MATERIALS & CONSUMPTION (Chapter3CoreMaterials.tsx):        │
│                     │ Steel, cement, concrete mix, and masonry walling selections with  │
│                     │ "What am I consuming?" micro-cards explaining tonnes and bags.    │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.4: Chapter 4   │ DEDICATED FLOORING & TILES (Chapter4Flooring.tsx):               │
│                     │ Standalone chapter for Living, Master Bed, Other Beds, Kitchen,   │
│                     │ Balconies, and Bathrooms with "Apply to All Similar Spaces" and  │
│                     │ individual room overrides.                                       │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.5: Chapter 5   │ DEDICATED DOORS & WINDOWS (Chapter5DoorsWindows.tsx):             │
│                     │ Standalone chapter featuring Main Teak Entrance styles, Internal  │
│                     │ Flush Doors, WPC Waterproof Bathroom Doors, UPVC Windows, Grills. │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.6: Chapter 6   │ ELECTRICAL, PLUMBING & FINISHES (Chapter6Finishes.tsx):           │
│                     │ Modular switches, wiring brands, sanitaryware sets, water tanks,  │
│                     │ interior/exterior painting systems, railings, and façade cladding.│
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.7: Chapter 7   │ REVIEW ESTIMATE & BOQ (Chapter7ReviewEstimate.tsx):              │
│                     │ Preliminary cost, cost/sqft, work-wise breakdown, contractor mode │
│                     │ toggle, mandatory statutory disclaimer, and 4-tier report cards.  │
├─────────────────────┼──────────────────────────────────────────────────────────────────┤
│ WP 2.8: Copy & UX   │ HOMEOWNER-FRIENDLY WORDING & MOBILE DRAWER:                      │
│                     │ Replace QS jargon per approved glossary; add mobile bottom-sheet  │
│                     │ drawer; preserve anonymous localStorage session compatibility.    │
└─────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 6. Visual Design Architecture (Anti-Stock & Anti-AI Mandate)

Per founder directive, Phase 02 strictly rejects generic stock photos and artificial-looking AI imagery:

1. **Original Architectural Line Art & Diagrams:**
   - 2D orthogonal site diagrams showing plot boundaries, setbacks, and buildable envelopes (`BuildableFootprintCanvas.tsx`).
   - Isometric structural wireframes illustrating foundation, column grid, and floor slabs.
   - Clean sectional diagrams for wall build-ups (AAC blocks, mortar joint, plaster, putty, paint).
2. **Tactile Material Texture Swatches:**
   - Authentic, high-fidelity texture swatches for vitrified tiles ($1200\times 600$, $800\times 800$), flame-cut Sadarhalli granite, Italian marble, and matte black switch plates.
3. **Editorial Architectural Typography:**
   - Monospaced geometric accents for dimensions and engineering tags (`font-mono`).
   - Clean, highly readable sans-serif typography (`Inter` / `Plus Jakarta Sans`) for homeowner clarity.
   - Deep forest green (`#1B3D34`) primary tone paired with warm terracotta amber (`#F28C28`) accents and soft off-white canvas backgrounds (`#F8F8F6`).

---

## 7. Protected Systems & Zero-Regression Guardrails

Phase 02 will be executed under strict invariant protection boundaries:
- **Calculation Engine:** `src/calculation-engine/calculator.ts` and all modules in `modules/` remain 100% read-only.
- **IS-456 Rules:** Structural steel formulas ($2.8 + 0.2 \times (\text{Floors}-1)$) and concrete volume benchmarks remain untouched.
- **Database Schema:** Zero modifications to `prisma/schema.prisma`.
- **Payment Gateway:** Cashfree PG v3 handshake, webhook verification, and entitlement provisioning remain completely untouched.
- **Customer Auth:** JWT authentication, anonymous guest session progression, and RBAC guards remain untouched.

---

## 8. Final Founder Approval Gate

This clarification document confirms the four estimate/report access levels, retains the ₹99 Basic PDF tier, keeps consultation as an independent ₹1,499 service, and establishes the precise scope for Phase 02.

```markdown
[ ] 1. I confirm the four estimate/report access tiers: Free (₹0), Basic PDF (₹99), Detailed BOQ (₹499), Premium BOQ (₹1,499).
[ ] 2. I confirm that Consultation is an independent ₹1,499 expert service and not a report tier.
[ ] 3. I approve the 7-Chapter calculator restructuring with dedicated Chapter 4 (Flooring) and Chapter 5 (Doors/Windows).
[ ] 4. I approve the anti-stock, architectural visual design direction.
[ ] 5. I confirm that the calculation engine, IS-456 rules, database, and Cashfree payments remain protected and untouched.
[ ] 6. Permission is granted to commence HUTTY 3.1 — PHASE 02.
```

