# Hutty 3.1 — Phase 06.1 Report
## Colour Accent Correction — Preserve Existing Backgrounds

**Founder Directive & Technical Implementation Closeout**  
*Date: November 2026 • Environment: Local Development / Production Build Tested • Status: 100% COMPLETE*

---

## 1. Executive Summary & Design Directive

During the initial execution of Phase 06, the visual design was upgraded with a 14-color architectural palette. However, the implementation overreached by changing the platform's global and section-level background canvases to warm ivory (`#F7F3EA`) and sandstone (`#E9DDC9`).

The founder clarified the design mandate:
> **"I did NOT ask to change the website's overall background colour to off-white, ivory or warm neutral.**  
> **I want to preserve the existing background colour scheme and introduce a richer, more premium colour palette through buttons, accents, highlights, interactive states and components throughout the website.**  
> **This is a focused correction to Phase 06. Do not restart the visual redesign."**

Phase 06.1 was executed with precision:
1. **Global Canvas Restoration:** Restored all global page wrappers, main website backgrounds, and calculator workspace backgrounds to Hutty's crisp natural light canvas (`#F8F8F6`) and pure white (`#FFFFFF`) with neutral borders (`#E5E7EB`).
2. **Elimination of Warm Canvas Bleed:** Removed all instances of `#F7F3EA` and `#E9DDC9` from section backgrounds, card containers, form wrappers, and modal backdrops.
3. **Purposeful Accent Placement:** Retained the 14-color architectural palette strictly for buttons, active state indicators, tactile material chips, scale markings, progress markers, badges, and intentional dark contrast sections (Engineering Standards, Final CTA).
4. **Refined Button System:** Codified and enforced the three-tier button hierarchy (`.hutty-btn-primary`, `.hutty-btn-secondary`, `.hutty-btn-accent`).
5. **Zero Disruption to Underlying Systems:** Calculations, civil formulas (IS 456 / IS 1786), commercial pricing (₹0, ₹99, ₹499, ₹1,499), Cashfree integration, and authentication remain untouched.

---

## 2. Before vs. After Surface Architecture

| Surface Element | Phase 06 Erroneous State | Phase 06.1 Corrected State | Visual Impact |
| :--- | :--- | :--- | :--- |
| **Global Page Canvas (`--cc-bg`)** | `#F7F3EA` (Warm Ivory) | `#F8F8F6` (Crisp Light Neutral) | Restores clean, professional backdrop |
| **Card & Panel Surfaces (`--cc-surface`)** | `#F7F3EA` or `#FFFFFF` w/ `#E9DDC9` border | `#FFFFFF` with `#E5E7EB` border | Sharp, architectural card definition |
| **Section Borders (`--cc-border`)** | `#E9DDC9` (Sandstone yellow-tan) | `#E5E7EB` (Neutral cool grey) | Eliminates yellowish cast from dividers |
| **Homepage Hero Section** | `bg-[#F7F3EA]` with warm blur blobs | `bg-[#F8F8F6]` with subtle `#B7CDBB]/20` atmosphere | Clean, modern technical entry |
| **Hero Calculator Card** | `bg-white border-[#E9DDC9]` | `bg-white border-[#E5E7EB]` shadow-sm | Crisp contrast against `#F8F8F6` |
| **Hero Preset Buttons (Unselected)** | `bg-[#F7F3EA] border-[#E9DDC9]` | `bg-[#F8F8F6] border-[#E5E7EB] text-[#18211E]` | Clean neutral resting state |
| **Hero Preset Buttons (Selected)** | `bg-[#183B32]` | `bg-[#183B32] text-white` + Terracotta `#C66B4E` dot | High-contrast intentional active state |
| **Hero Primary CTA** | Mixed green styling | `bg-[#183B32] hover:bg-[#245747]` + `#C66B4E` arrow | Clear dominant action |
| **Hero Secondary CTA** | Mixed tan hover | `bg-white hover:bg-[#F8F8F6] border-[#183B32]/40 text-[#183B32]` | Crisp secondary elevation |
| **Hero Visualizer Frame** | `border-[#E9DDC9]` | `border-2 border-[#CBD5CB] bg-[#183B32]` | Deep architectural framing |
| **Hero Full-Width Trust Strip** | `bg-[#E9DDC9]/40 border-[#E9DDC9]` | `bg-[#EFF5F1] border-y border-[#DCE5DF]` | Refreshing soft-sage technical strip |
| **Calculator Workspace (`PlannerPage`)** | `bg-[#F7F3EA]` | `bg-[#F8F8F6] text-[#18211E]` | Focused, non-fatiguing workspace |
| **Calculator Stage Navigation Pills** | Inactive had warm hover `#F7F3EA` | Inactive `hover:bg-[#F8F8F6]`, Active Deep Forest | Crisp progression hierarchy |
| **Live Preview Panel (`LivePreviewPanel`)** | `border-2 border-[#E9DDC9]` | `border-2 border-[#E5E7EB] bg-white` | Pristine architectural sidebar |
| **Takeoff Summary Chips** | `bg-[#F7F3EA] border-[#E9DDC9]` | `bg-[#F8F8F6] border-[#E5E7EB]` | Legible data chips |

---

## 3. Enforced Button System Hierarchy

We codified three distinct button classes into `src/styles/globals.css` and applied them uniformly across all features:

```css
/* 1. PRIMARY BUTTON — Deep Forest */
.hutty-btn-primary {
  background-color: #183B32;
  color: #FFFFFF;
  border: 1px solid transparent;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(24, 59, 50, 0.06);
}
.hutty-btn-primary:hover:not(:disabled) {
  background-color: #245747;
  transform: translateY(-1px);
}

/* 2. SECONDARY BUTTON — Crisp White Canvas with Forest Text & Border */
.hutty-btn-secondary {
  background-color: #FFFFFF;
  color: #183B32;
  border: 1px solid rgba(24, 59, 50, 0.35);
  font-weight: 700;
}
.hutty-btn-secondary:hover:not(:disabled) {
  background-color: #F8F8F6;
  border-color: #183B32;
  transform: translateY(-1px);
}

/* 3. ACCENT BUTTON — Terracotta for High-Value Conversion Points */
.hutty-btn-accent {
  background-color: #C66B4E;
  color: #FFFFFF;
  border: 1px solid transparent;
  font-weight: 700;
}
.hutty-btn-accent:hover:not(:disabled) {
  background-color: #A95640;
  transform: translateY(-1px);
}
```

### Hierarchy Usage Matrix

| Role | Token / Styling | Primary Context | Example Action |
| :--- | :--- | :--- | :--- |
| **Primary Action** | Deep Forest (`#183B32`), White Text | Standard progression | *"Plan Your Home"*, *"Next: Buildable Space →"*, *"See Estimate"* |
| **Secondary Action** | Pure White (`#FFFFFF`), Forest Border & Text | Alternative or inquiry | *"How Hutty Works"*, *"Start Free Estimate"*, *"Back"* |
| **High-Value Accent** | Terracotta (`#C66B4E`), White Text | Revenue & purchase actions | *"Run Free Calculation"*, *"Unlock Detailed BOQ (₹499)"* |
| **Premium Accents** | Muted Gold (`#C5A46D`) Badges / Highlights | Plan tier callouts | Premium specification badges, NBC 2016 code markers |

---

## 4. Purposeful Application of the 14 Architectural Colors

Rather than coloring large background canvases, the richer palette now shines through micro-interactions and tactile elements:

1. **Deep Forest (`#183B32`)**:
   - Primary button backgrounds
   - 3D Visualizer inner cavity and blueprint canvas
   - Active navigation pills and step numbers
   - Large typographic numbers for material takeoffs
   - Intentional dark anchor sections: *Engineering Standards* and *Final CTA*
2. **Forest Green (`#245747`)**:
   - Primary button hover states
   - Secondary borders on dark sections
3. **Emerald (`#347A62`)**:
   - Secondary data visualization bars and chart strokes
4. **Soft Sage (`#B7CDBB`)**:
   - Subtle background atmosphere blur blobs (opacity 0.20)
   - Badge borders and divider accents
5. **Light Sage (`#E8EFE9`)**:
   - Badges, eyebrow tags (`CONSTRUCTION INTELLIGENCE PILLARS`), active preset chips
   - Selected option backgrounds in interactive demo
   - Completed past steps in calculator navigation
6. **Terracotta (`#C66B4E`)**:
   - Accent button backgrounds (`#C66B4E` with `#A95640` hover)
   - Active pulsing dots on location and estimate badges
   - Interactive icon accents and arrow indicators
   - "Most Popular" ribbon on the ₹499 Detailed BOQ card
   - Underline highlights on key headlines
7. **Clay (`#A95640`)**:
   - Active and hover states for terracotta accent buttons
8. **Muted Gold (`#C5A46D`)**:
   - Civil engineering code badges (IS 456, IS 1786, NBC 2016)
   - Premium feature highlights and rating indicators
9. **Pale Gold (`#E5D5B4`)**:
   - Text accents on dark forest containers
10. **Charcoal (`#18211E`)**:
    - High-contrast, WCAG AAA compliant text primary for body and headlines
11. **Slate (`#66716B`)**:
    - Descriptive secondary text, unit labels, and captions
12. **Soft White (`#FFFFFF`)**:
    - Content cards, modals, dropdowns, and form containers
13. **Light Neutral Canvas (`#F8F8F6`)**:
    - Platform body background, alternating section backgrounds, calculator workspace
14. **Neutral Border (`#E5E7EB`)**:
    - Standard card borders, table dividers, input borders

---

## 5. Comprehensive Surface-by-Surface Restoration Inventory

### A. Core Layout & Navigation
- `src/styles/tokens.ts`: `background` restored to `#F8F8F6`, `surfaceWhite` to `#FFFFFF`, `border` to `#E5E7EB`.
- `src/styles/globals.css`: `--cc-bg` restored to `#F8F8F6`, `--cc-surface` to `#FFFFFF`, `--cc-border` to `#E5E7EB`. `html` and `body` set to `bg-[#F8F8F6] text-[#18211E]`.
- `src/components/layout/AppLayout.tsx`: Container set to `bg-[#F8F8F6] text-[#18211E]`.
- `src/components/layout/WebsiteHeader.tsx`: Frosted header restored to `bg-[#F8F8F6]/95 border-[#E5E7EB]`; mobile navigation drawer restored to `bg-[#F8F8F6]` with clean white cards.
- `src/components/layout/WebsiteFooter.tsx`: Logo box restored to `bg-white border-[#E5E7EB]`.

### B. Homepage Sections (`src/features/landing/sections/`)
- `HeroSection.tsx`: Restored section background to `#F8F8F6`; container to white with `#E5E7EB` border; presets to `#F8F8F6` resting with `#183B32` selected; bottom full-width trust strip to soft sage `#EFF5F1` with `#DCE5DF` border.
- `IntroductionSection.tsx`: Restored background to `#F8F8F6` with `#E5E7EB` border; technical caption card on white with `#E5E7EB` border.
- `FourOfferingsSection.tsx`: Restored background to `#FFFFFF` with `#E5E7EB` border; card hover states to white on `#F8F8F6` base with `#183B32` hover borders.
- `ThreeEasyStepsSection.tsx`: Restored background to `#F8F8F6` with `#E5E7EB` border; step cards on white with `#E5E7EB` border; family banner with `#E5E7EB` border.
- `InteractiveDemoSection.tsx`: Restored background to `#F8F8F6` with `#E5E7EB` border; left parameter and right preview panels on white with `#E5E7EB` border; metric summary chips to `#F8F8F6`.
- `SignaturePlanningTimelineSection.tsx`: Restored background to `#F8F8F6` with `#E5E7EB` border; timeline cards on white with `#E5E7EB` border.
- `SignatureConstructionBreakdownSection.tsx`: Restored background to `#FFFFFF` with `#E5E7EB` border; 6 big-number metric cards to `#F8F8F6` with `#E5E7EB` border; callout kept in intentional `#183B32` Deep Forest with `#C66B4E` Terracotta button.
- `WhyPlanningSection.tsx`: Restored background to `#F8F8F6` with `#E5E7EB` border; comparison cards on white with neutral dividers.
- `EngineeringStandardsSection.tsx`: Preserved intentional full-bleed `#183B32` Deep Forest background with Muted Gold `#C5A46D` code badges.
- `SignatureExpertSection.tsx`: Restored background to `#F8F8F6` with `#E5E7EB` border; architect consultation banner and 3 role cards on white with `#E5E7EB` border.
- `SignaturePricingSection.tsx`: Restored background to `#FFFFFF` with `#E5E7EB` border; Free card on `#F8F8F6`, Detailed BOQ featured card on `#FFFFFF` with `#183B32` border, Premium card on `#F8F8F6`.
- `FaqSection.tsx`: Restored background to `#FFFFFF` with `#E5E7EB` divider rules.
- `FinalCtaSection.tsx`: Preserved intentional `#183B32` Deep Forest background with crisp white secondary action button.

### C. Calculator Workspace & Chapters
- `src/features/planner/PlannerPage.tsx`: Workspace wrapper set to `#F8F8F6` with `#18211E` text; top header on white with `#E5E7EB` border; stage form container on white with `#E5E7EB` border; bottom docked action bar on white with `#E5E7EB` border.
- `src/features/planner/LivePreviewPanel.tsx`: Sidebar container on white with `#E5E7EB` border; takeoff chips to `#F8F8F6` with `#E5E7EB` border; formula inspector modal on white with `#E5E7EB` border.
- Chapters 1–7 (`Chapter1PlotSetbacks.tsx`, `Chapter2DreamHome.tsx`, `Chapter3CoreMaterials.tsx`, `Chapter4Flooring.tsx`, `Chapter5DoorsWindows.tsx`, `Chapter6Finishes.tsx`, `Chapter7ReviewCommercial.tsx`): All warm container tokens replaced with `#F8F8F6` resting, `#FFFFFF` active cards, and `#E5E7EB` borders.
- Stages 1–8 (`Stage1Plot.tsx` through `Stage8DetailedBOQ.tsx`): All warm container tokens replaced with `#F8F8F6`, `#FFFFFF`, and `#E5E7EB`.

### D. Other Key Pages
- `src/features/pricing/PricingPage.tsx`: Restored page wrapper to `#F8F8F6` with clean white cards and `#E5E7EB` borders.
- `src/features/consultation/ConsultationPage.tsx`: Restored page wrapper to `#F8F8F6` with clean white cards and `#E5E7EB` borders.
- `src/features/consultation/ConsultantProfilePage.tsx`: Restored profile wrapper to `#F8F8F6` with clean white cards and `#E5E7EB` borders.
- `src/features/consultation/ProfessionalJoinPage.tsx`: Restored join page wrapper to `#F8F8F6` with clean white cards and `#E5E7EB` borders.

---

## 6. Verification Results

### 1. TypeScript Build Integrity
- **Client Build (`npx tsc -b`):** 0 errors. Passed cleanly with exit code 0.
- **Server Build (`npx tsc -p server`):** 0 errors. Passed cleanly with exit code 0.

### 2. Full Test Suite Regression (`npx vitest run`)
- **Total Test Files:** 71 passed (71 files)
- **Total Tests:** 901 passed (901 tests)
- **Pass Rate:** 100%
- **Calculation Stability:** All mathematical takeoffs, IS 456 concrete and IS 1786 steel algorithms, BOQ item totals, and payment status flows produced identical results.

### 3. Production Vite Build (`npm run build`)
- **Duration:** 32.74 seconds
- **Modules Transformed:** 3,026 modules
- **Build Status:** Exit code 0. Production bundle generated cleanly in `dist/`.

### 4. Live Multi-Viewport Visual Screenshots
Using automated headless Chrome via Chrome DevTools Protocol (CDP), fresh full-fidelity screenshots were captured directly against `http://localhost:3000/` and `http://localhost:3000/calculator` across desktop, tablet, and mobile viewports:

| Viewport | Dimension | Screenshot File | Visual Status |
| :--- | :--- | :--- | :--- |
| **Homepage Desktop Large** | $1440 \times 900\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/homepage_desktop_1440px.png` | Natural `#F8F8F6` canvas, crisp white cards, rich accents |
| **Homepage Desktop Standard** | $1280 \times 800\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/homepage_desktop_1280px.png` | Balanced split composition, zero overflow |
| **Homepage Tablet** | $768 \times 1024\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/homepage_tablet_768px.png` | Responsive 2-column to 1-column adaptation |
| **Homepage Mobile** | $375 \times 812\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/homepage_mobile_375px.png` | Touch-friendly controls, 0px horizontal scroll |
| **Calculator Desktop Large** | $1440 \times 900\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/calculator_desktop_1440px.png` | Clean white workspace, Deep Forest stage pills |
| **Calculator Desktop Standard** | $1280 \times 800\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/calculator_desktop_1280px.png` | High-density split view with live preview panel |
| **Calculator Tablet** | $768 \times 1024\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/calculator_tablet_768px.png` | Tablet layout with accessible stage navigation |
| **Calculator Mobile** | $375 \times 812\text{px}$ | `docs/hutty-3.1/phase-06/screenshots/calculator_mobile_375px.png` | Stacked mobile view with 3D/Planner tab switcher |

---

## 7. Conclusion

Phase 06.1 successfully satisfies the founder's directive. Hutty 3.1 now combines its original, clean natural background canvas (`#F8F8F6` and `#FFFFFF`) with a rich, refined architectural accent palette (`#183B32`, `#C66B4E`, `#E8EFE9`, `#C5A46D`). The platform looks authoritative, modern, and trustworthy, with complete calculation correctness and zero breaking changes.

