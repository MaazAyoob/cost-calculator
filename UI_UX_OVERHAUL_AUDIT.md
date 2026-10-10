# HUTTY — PRE-LAUNCH UI/UX OVERHAUL AUDIT
**Date:** March 2025 (Audit Baseline)  
**Platform:** Hutty — Residential Construction Planning & Cost Estimation Platform  
**Target URL:** https://cost-calculator-ten-kappa.vercel.app  
**Backend API:** https://hutty-api.onrender.com  

---

## 1. Executive Summary & Audit Scope
A thorough audit of the Hutty codebase was conducted across frontend routes (`src/app/router.tsx`), shared UI components (`src/components/`), calculator wizard (`src/features/planner/`), marketing pages (`src/features/landing/`), consultation modules (`src/features/consultation/`), project dashboard (`src/features/dashboard/`), report & PDF generation engine (`src/features/report/`), admin configuration panel (`src/features/admin/`), and calculation engine test suites (`src/calculation-engine/__tests__/`).

### Core Findings:
1. **Mathematical & Engineering Core is Exceptionally Robust:** 376 tests pass across 28 test files in Vitest. Physical quantity formulas (RCC in m³, steel in kg/tonnes, cement in bags, sand in CFT, masonry in units), Bangalore/Mysore municipal bylaws (BBMP/BDA/MUDA), and the Formula System V2 engine are fully verified and must remain untouchable.
2. **Visual & Architectural Inconsistencies:** The platform exhibited disparate styling paradigms across different pages—some sections utilized heavy borders, dark cards, saturated badges, or dense text layouts. The client prototype (`hutty_calculator_ui_prototype.html`) introduces a much calmer, architectural, Apple/Google-inspired aesthetic: clean lines, `#1B3D34` forest green, `#F28C28` selective roof orange accent, `#F8F8F6` calm canvas, and consistent `#E3E8E2` borders.
3. **Calculator Usability Bottlenecks:** The previous calculator had a rigid 45%/55% split screen on desktop with dense panels. The layout needed a clear page title, progress bar, step pills navigation, spacious form panel, and a compact "Home Snapshot" sidebar with responsive 3D house model scaling.
4. **Mobile Responsiveness:** Fixed-height containers, multi-column grids without flex-wrap, and dense table views caused awkward scrolling or touch friction on mobile screens.

---

## 2. Existing Page & Route Inventory

| Route | Feature Area | Current Status | Key UI/UX Deficiencies |
|---|---|---|---|
| `/` | Landing / Marketing Homepage | Fully Functional | 13 long vertical sections; some text cards felt text-dense; needs refined hero, clear hierarchy, modern typography and smoother transitions. |
| `/calculator`, `/planner` | Construction Calculator Wizard | Core Engine Complete | Heavy form inputs; lacks the clean, guided step layout exemplified in `hutty_calculator_ui_prototype.html`; needs compact Home Snapshot sidebar. |
| `/dashboard` | Homeowner Project Dashboard | Functional | Good structure, but visual card styling was dated with mixed border radii and inconsistent button styling. |
| `/report`, `/reports` | BOQ & Comprehensive Cost Dossier | Fully Functional | Highly detailed BOQ tables; required mobile horizontal scrolling polish, cleaner section headers, and harmonious typography matching the PDF. |
| `/consult` | Expert Consultation Directory | Fully Functional | Directory card grids needed higher visual polish, cleaner filter chips, and enhanced mobile booking sheet interaction. |
| `/consult/:slug` | Consultant Public Profile | Fully Functional | Profile header, credentials badge, and booking modal needed modern spacing and refined typography. |
| `/pricing` | Tiered Pricing & Report Unlocking | Fully Functional | Asymmetric pricing cards needed tighter layout alignment, clearer feature checks, and refined CTA buttons. |
| `/admin` | Administration & Formula CMS | Fully Functional (30+ Tabs) | Dense enterprise interface; needed improved navigation grouping, consistent cards, cleaner status badges, and responsive tables. |
| `/settings` | User / Workspace Settings | Basic Implementation | Simple preferences panel; needs alignment with global design system tokens. |

---

## 3. Current Design Inconsistencies & UX Friction Points

1. **Color Token Drift:**
   - Primary green was defined variably as `#1B3D34` vs `emerald-900` vs `teal-950`.
   - Secondary text had varied contrast: `#4B5563`, `#687770`, `#6B7280`, `#718078`.
   - Card backgrounds alternated between pure `#FFFFFF`, soft green tints, and gray surfaces.
   - Canonical color tokens need to be unified:
     - Primary Brand: `#1B3D34`
     - Primary Hover: `#142F28`
     - Accent Orange: `#F28C28`
     - Text Primary: `#172722`
     - Text Secondary: `#687770`
     - Page Background: `#F8F8F6`
     - Surface: `#FFFFFF`
     - Border: `#E3E8E2`
     - Success Surface: `#E7F3E8`
     - Soft Mint: `#DDF4E7`

2. **Calculator Layout & Navigation:**
   - In the client prototype, the user is presented with a serene page layout: an eyebrow ("Your home journey"), large title, thin 4px progress bar, pill-shaped horizontal step navigation (`1. Package`, `2. Plot`, etc.), a generous white form panel with rounded corners (`14px`), and a compact sidebar titled "Your home snapshot" displaying the 3D model/illustration and key parameters (Package, Plot Area, Home Configuration, Rooms).
   - In the live calculator, users navigated through 10 steps inside a left split panel while the right panel showed live calculations. Unifying this into a balanced form-and-summary layout gives homeowners an uncluttered, guided journey without sacrificing live engine reactivity.

3. **Step Navigation on Mobile:**
   - On small screens, 10 step pills can cause clutter if forced into a single row. Responsive horizontally scrollable step pills or compact indicators are needed.
   - Bottom navigation controls (Back / Continue) must be easily tappable (min 44px height) with unmistakable visual states.

4. **Form Controls & Steppers:**
   - Numeric inputs for rooms and spaces required clean, tactile increment/decrement controls (`-` and `+`) with direct keyboard-accessible numeric entry.
   - Choice cards needed crisp active states: 1.5px `#1B3D34` border with soft mint background `#F0F5F0`.

5. **Tables & BOQ Presentation:**
   - Large BOQ tables on `/report` and within the Admin panel must have subtle zebra striping, numeric columns aligned right with tabular figures (`tnum`), and responsive overflow containment.

---

## 4. Design System Architecture

### 4.1 Typography
- **Headings & Display:** `Plus Jakarta Sans`, sans-serif (font-heading), tight tracking (`-0.02em` to `-0.035em`).
- **Body & Numerical Information:** `Inter`, sans-serif (font-sans), tabular figures (`tabular-nums font-mono`).

### 4.2 Shared Reusable Components
- `Button`: Primary, secondary, outline, ghost, danger variants with unified 40px/48px heights, rounded-lg (`8px-10px`), font-weight 600/700.
- `Input` & `Select`: Unified border `#DCE3DC` / `#E3E8E2`, focus ring `#1B3D34`, 13px font size, 42px touch target.
- `ChoiceCard`: High-contrast selected state, subtle hover elevation, clear typography.
- `QuantityStepper`: Compact `[-] count [+]` row component with min/max clamping.
- `Badge` & `StatusBadge`: Semantic variants (Success, Warning, Info, Brand, Neutral).
- `Modal` & `Dialog`: Smooth backdrop blur, clean header with close icon, accessible escape key handler.

---

## 5. Prioritized Implementation Plan

1. **Phase 1: Design Foundations & Global Styles**
   - Refine `src/styles/globals.css` with exact canonical color tokens, button styles, choice card utilities, and typography scales.
   - Verify shared components (`Button`, `Input`, `Card`, `Select`, `Badge`, `Modal`).
   - Run Vitest & type checks to verify no breaking regressions.

2. **Phase 2: Global Navigation & Marketing Website**
   - Overhaul `WebsiteHeader.tsx` and `WebsiteFooter.tsx` for clean architectural layout, responsive mobile drawer, and accurate navigation links.
   - Polish `LandingPage.tsx` and its core sections (`HeroSection`, `VisualStorytellingSection`, `PackagesSection`, `SignatureConstructionBreakdownSection`, `FaqSection`, `FinalCtaSection`) for an Apple/Google-grade presentation.

3. **Phase 3: Construction Calculator Overhaul**
   - Align `PlannerPage.tsx` with the client prototype:
     - Prominent eyebrow & title header.
     - Thin 4px progress bar with smooth transition.
     - Horizontal pill-based step navigation with completed/active states.
     - Balanced layout: main form panel (`minmax(0, 1fr)`) and compact "Home Snapshot" sidebar (`280px-340px`).
     - Refine Home Snapshot: 3D house viewer, selected package, plot area, home configuration, rooms, live estimate badge, and "Review all selections" quick jump.
     - Clean Back and Continue buttons with selection persistence note.
   - Refine individual step components (`Step0Onboarding` through `Step10Painting` and review screen).

4. **Phase 4: Results, BOQ & Detailed Report Experience**
   - Polish `ReportPage.tsx` with clean section breakdown (What We Build, What We Consume, What We Install, What It Costs).
   - Ensure numerical alignment, strict unit labels (`m³`, `kg`, `CFT`, `bags`, `sq.ft`), and clean mobile layout.
   - Validate `DetailedReportPdfDocument.tsx` and ensure automated QA gates pass.

5. **Phase 5: Consultation & Expert Portal**
   - Polish `ConsultationPage.tsx`, `ConsultantProfilePage.tsx`, `ConsultantCard.tsx`, and `ConsultationBookingModal.tsx`.
   - Preserve all backend booking endpoints, pricing constants (₹1,499), and verification indicators.

6. **Phase 6: Admin Panel Polish**
   - Polish `AdminPage.tsx` and associated tabs/sections with organized sidebar navigation, clean cards, responsive tables, and draft/publish workflows.

7. **Phase 7: Full QA & Validation**
   - Execute all 376 Vitest tests.
   - Run TypeScript type checks (`tsc -b`).
   - Execute frontend production build (`npm run build`).
   - Execute backend build (`npm run server:build`).
   - Generate final `UI_UX_OVERHAUL_REPORT.md`.

---

## 6. Regression Testing Checklist
- [x] Baseline test suite passes (376 tests in Vitest).
- [x] Baseline client build succeeds (`tsc -b && vite build`).
- [x] Baseline server build succeeds (`prisma generate && tsc`).
- [ ] Calculator forward & backward navigation preserves all selections.
- [ ] Changing plot length & width reactively updates plot area and BUA.
- [ ] Package switching updates default specifications without breaking custom selections.
- [ ] Step 3 core materials properly displays RCC, steel, cement, masonry.
- [ ] PDF generation and QA gate pass without unit discrepancies.
- [ ] Admin Draft -> Test -> Impact -> Publish lifecycle preserved.
