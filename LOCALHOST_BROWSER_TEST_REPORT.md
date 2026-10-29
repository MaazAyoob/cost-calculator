# HUTTY — LOCALHOST REAL BROWSER TEST REPORT (POST-FIX VERIFIED)

**Audit & Verification Date:** October 26, 2026  
**Auditor:** Antigravity Autonomous Browser Subagent & Senior QA Architect  
**Frontend Server:** `http://localhost:3000` (Vite v6.4.3 / React 19 / Tailwind CSS v4)  
**Backend API Engine:** `http://localhost:4000` (Node.js Express / Prisma ORM)  
**Browser Engine:** Chromium Automated Browser Session  
**Full Journey Video Recording:** `full_8stage_verification_1793016280138.webp`  

---

## 1. Test Environment Telemetry

| Parameter | Configuration / Telemetry Value | Status |
|---|---|---|
| **Local Frontend URL** | `http://localhost:3000/` | Live & Operational |
| **Local Backend URL** | `http://localhost:4000/api/v1/health` (HTTP 200 OK) | Live & Operational |
| **Tested Viewports** | Desktop: $1280 \times 800$ px; Tablet: $768 \times 1024$ px; Mobile: $390 \times 844$ px | Verified Clean |
| **Session Type** | Fresh signed-out guest visitor session (unsigned, no pre-existing localStorage JWT) | Verified Guest First |
| **TypeScript Typecheck** | `tsc -b` (Zero errors, exit code 0) | PASS |
| **Automated Tests** | 57 test files, 775 unit & integration tests (`vitest run`) | 775 of 775 PASS |
| **Production Build** | `tsc -b && vite build` (Vite production bundle generated) | PASS |
| **Screenshots Root** | `C:\Users\Avita\.gemini\antigravity-ide\brain\531e239d-0917-40b0-9af3-8000d03cc949\` | 25+ Verified Assets |

---

## 2. Test Execution Details: 8-Stage Calculator Walkthrough

### Suite B: Complete End-to-End 8-Stage Calculator Journey (`/calculator` & `/planner`)
- **Target URL:** `http://localhost:3000/calculator` (routes to `/planner`)
- **Viewport:** $1280 \times 800$ px
- **Mode:** Signed-out Guest Homeowner (No account created or required)
- **Status:** **100% COMPLETE & VERIFIED PASS ACROSS ALL 8 STAGES**

| Stage | Name & Headline | Inputs & Decisions Tested | Authoritative Mathematical Output | Browser Verification Status | Evidence Screenshot |
|---|---|---|---|---|---|
| **Stage 1** | **STAGE 1 OF 8 • YOUR PLOT**<br>*"Start with your land."* | • Location: Bangalore<br>• Dimensions: 30 ft width × 40 ft length<br>• Road width: 30 ft front road<br>• Plot facing: East | • Total Plot Area: 1,200 sq.ft<br>• Live 3D bounding massing box updates dynamically | **VERIFIED PASS** | `stage1_plot_verified_1793016334378.png` |
| **Stage 2** | **STAGE 2 OF 8 • YOUR HOME**<br>*"How many floors do you plan to build?"* | • Floor configuration: Ground + 1 Floor (G+1)<br>• Purpose: Self-Use residential<br>• Parking: Covered ground parking | • Total planned levels: 2 floors<br>• 3D canvas updates to 2-story extruded model | **VERIFIED PASS** | `stage2_home_verified_1793016384526.png` |
| **Stage 3** | **STAGE 3 OF 8 • YOUR ROOMS**<br>*"What spaces does your family need?"* | • Configuration: 3 BHK<br>• Rooms: 3 Bed, 3 Bath, 1 Kitchen, 1 Living, 1 Pooja Room | • Room steppers increment state<br>• Automatic internal circulation & fixture counts | **VERIFIED PASS** | `stage3_rooms_verified_1793016412695.png` |
| **Stage 4** | **STAGE 4 OF 8 • YOUR BUILDABLE SPACE**<br>*"Let's see how much you can build."*<br>**(STAGE 4 DEFECT RESOLVED)** | • Statutory GBA 2026 Table 1 rules evaluated via object options contract<br>• Tested custom clearances toggle & reset to standard | • Front clearance: 3.0 ft (2.95 ft Table 1)<br>• Rear clearance: 2.3 ft<br>• Left clearance: 2.3 ft<br>• Right clearance: 0.0 ft<br>• Buildable Ground Footprint: 963 sq.ft<br>• Total Built-Up Area: 720–1,440 sq.ft<br>• **Zero runtime errors; zero ErrorBoundary.** | **VERIFIED PASS** | `stage4_setbacks_verified_1793016490981.png` |
| **Stage 5** | **STAGE 5 OF 8 • CONSTRUCTION STYLE**<br>*"Choose your structural strength."* | • Structure: RCC Framed Structure (Recommended for G+1)<br>• Walling: Solid Concrete Blocks (6")<br>• Specification Tier: Premium Specification | • Structural parameters stored in Zustand<br>• Live rate per sq.ft updates to Premium specification | **VERIFIED PASS** | `stage5_style_verified_1793016532318.png` |
| **Stage 6** | **STAGE 6 OF 8 • FINISHES & MATERIALS**<br>*"The details that make a house feel like home."* | • Interactive category tabs: Flooring, Doors & Windows, Electrical & Plumbing, Painting & Finishes, Brands (Optional) | • Tab navigation active<br>• Finishes customized without affecting structural takeoff | **VERIFIED PASS** | `stage6_finishes_verified_1793016581145.png` |
| **Stage 7** | **STAGE 7 OF 8 • YOUR ESTIMATE**<br>*"Your Preliminary Estimate"* | • Guest homeowner views estimate without account creation<br>• Back button clicked to verify state persistence; forward navigation confirmed | • **Total Estimated Cost:** ₹13,42,531<br>• **Effective Rate:** ₹1,865 / sq.ft BUA<br>• **Cost Breakdown:** Materials 65% (₹8,72,645), Labour 24% (₹3,22,207), Fittings & Taxes 11% (₹1,47,678)<br>• **Physical Quantities (IS 456):** Steel 3.5 Tonnes, Cement 288 Bags, M-Sand 1,296 CFT, Blocks 3,024 Pcs<br>• **Disclaimer Banner:** Early planning estimate notice prominently displayed | **VERIFIED PASS** | `stage7_estimate_verified_1793016591514.png` |
| **Stage 8** | **STAGE 8 OF 8 • DETAILED BILL OF QUANTITIES**<br>*"Complete work-wise cost breakdown."* | • Inspected itemized civil works schedule<br>• Tested unlock modal dialog (Detailed BOQ ₹499 vs Premium ₹1,499)<br>• Modal closed safely | • Civil works table renders line items with quantities, unit rates, and total amounts<br>• **Zero ₹99 references** anywhere on screen<br>• Clear product distinction between ₹499 and ₹1,499 | **VERIFIED PASS** | `stage8_boq_verified_1793016632316.png` |

---

## 3. Supporting Surfaces Browser Telemetry

### Suite A: Homepage (`http://localhost:3000/`)
- Headline: **“Understand your home before you build.”** (Exact match)
- Subheadline: **“Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it.”** (Exact match)
- Primary CTA: *"Start Free Estimate"* — navigates directly to `/planner` without authentication.
- Secondary CTA: *"Consult an Expert — ₹1,499"* — navigates to `/consult`.
- Pricing cards: Free (₹0), Detailed BOQ (₹499), Premium (₹1,499). No ₹99 present.
- Evidence screenshots: `hero_section_1793012642622.png`, `homepage_pricing_section_1793012671530.png`.

### Suite C: Pricing Page (`http://localhost:3000/pricing`)
- Verified all 4 products: Free (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499), Consultation (₹1,499).
- Full DOM inspection confirmed **zero occurrences of ₹99**.
- Evidence screenshot: `pricing_page_1793014760161.png`.

### Suite D: How It Works Page (`http://localhost:3000/how-it-works`)
- Loads dedicated 6-step homeowner guide directly without 404.
- Direct browser reloads work cleanly with SPA client routing.
- Evidence screenshots: `how_it_works_page_1793014776734.png`, `how_it_works_refreshed_1793014781994.png`.

### Suite E: Consultation Platform (`http://localhost:3000/consult`)
- 6 canonical categories and 4 popular sessions present with flat ₹1,499 pricing.
- Interactive booking modal opens and captures session inquiries.
- Fallback inquiry form (*“Talk to a Hutty Expert”*) active.
- Evidence screenshots: `consultation_page_1793014797317.png`, `consultation_booking_modal_1793014861030.png`.

### Suite F: Mobile & Tablet Responsiveness
- Tested at $390 \times 844$ px (Mobile) and $768 \times 1024$ px (Tablet).
- Zero clipping or overflow; mobile tabs (*“Planner”* vs *“3D View”*) work smoothly.
- Evidence screenshots: `mobile_home_1793014924930.png`, `mobile_planner_1793014957512.png`.

### Suite G: Admin Operations Portal (`http://localhost:3000/admin`)
- Operations Console operational; GBA Table 1 rules confirmed.
- Evidence screenshot: `admin_plot_setbacks_1793015015048.png`.

---

## 4. Summary of Code Fixes Applied

1. `src/features/planner/stages/Stage4BuildableSpace.tsx`:
   - Updated `evaluatePlotSetbacks` invocation to pass the canonical parameter object `{ plotLength, plotWidth, roadWidthFt, customSetbacks }`.
   - Corrected property mappings to `appliedFrontFt`, `appliedRearFt`, `appliedLeftFt`, `appliedRightFt`, and `buildableFootprintSqFt`.
   - Added safe fallbacks `(effFront ?? 0).toFixed(1)` to prevent any possibility of runtime TypeErrors.
   - Wired custom clearance editing controls and municipal reset action.
2. `src/features/planner/PlannerPage.tsx`:
   - Replaced non-existent `analytics.track` with `analytics.recordStepEnter`.
3. `src/features/planner/stages/Stage7Estimate.tsx`:
   - Replaced missing `timelineMonths` with dynamic formula based on floor count.
   - Updated `sandCft` to `sandCuFt`, and `blockCount` to `finalBlocksRequired`.
4. `src/features/planner/stages/Stage8DetailedBOQ.tsx`:
   - Replaced non-existent `hasPremiumReportAccess` with centralized `usePricingStore.canAccessFeature`.
   - Corrected `item.totalAmount` to `item.amount`.
5. `src/calculation-engine/__tests__/stage4_buildable_space_regression.test.ts`:
   - Added automated regression suite testing 30x40 plots, 40x60 plots, missing inputs, and custom clearance overrides.
