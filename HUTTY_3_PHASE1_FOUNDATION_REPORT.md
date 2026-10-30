# HUTTY 3.0 — PHASE 01: ARCHITECTURAL DESIGN FOUNDATION & FRONTEND TRANSFORMATION REPORT

**Phase Execution Date:** October 30, 2026  
**Project:** Hutty 3.0  
**Phase:** 01 — Architectural Design Foundation & Frontend Transformation  
**Verification Status:** Passed (60/60 test suites, 796/796 tests, TypeScript Frontend & Backend Clean, Vite Build Clean)

---

## EXECUTIVE SUMMARY

Hutty 3.0 Phase 01 establishes the **Architectural Design Foundation** for the Hutty platform. The visual identity has been transformed from a generic SaaS interface into an editorial, architectural-grade construction intelligence environment inspired by contemporary architectural publications and studios.

Crucially, this phase adheres strictly to the **Non-Breaking Architecture Mandate**:
- **Zero alterations** were made to the canonical calculation engine (`src/calculation-engine/`).
- **Zero alterations** were made to the backend, API routes, or controllers (`server/`).
- **Zero alterations** were made to the PostgreSQL Prisma schemas, migrations, or database records.
- **Zero alterations** were made to the Cashfree payment gateway integration or order processing pipelines.
- **All 796 unit, integration, and end-to-end tests remain 100% passing.**

---

## SECTION A: REPOSITORY AUDIT REPORT

### 1. Technology Stack Discovery
- **Frontend Core:** React 19 (`^19.0.0`), Vite 6 (`^6.1.0`), TypeScript 5.7 (`^5.7.2`).
- **Styling Architecture:** Tailwind CSS v4 (`^4.0.5`) with `@tailwindcss/vite`, CSS Variables, PostCSS.
- **Motion & Animation:** Framer Motion 12 (`^12.4.1`) and GSAP 3 (`^3.12.7`).
- **Icons & Visual Language:** Lucide React (`^0.475.0`).
- **3D Visualization:** Three.js (`^0.173.0`) with `@react-three/fiber` and `@react-three/drei`.
- **PDF Generation:** `@react-pdf/renderer` (`^4.2.1`).
- **State Management:** Zustand 5 (`^5.0.3`) with persistent local storage slices.
- **Routing:** React Router v7 (`^7.2.0`).
- **Backend:** Node.js, Express (`^4.21.2`), Prisma ORM (`^6.3.1`), PostgreSQL.
- **Payment Gateway:** Cashfree SDK (`cashfree-pg ^5.1.0`) with live and sandbox webhook verification.

### 2. Architectural Audit & System State
The repository contains 60 test suites encompassing 796 individual tests. Testing covers:
- Core calculation accuracy, formula invariants, structural setbacks, and floor area ratios.
- Material brand invariance and unit rate propagations.
- Strict tier entitlements (Free, Detailed BOQ, Premium Consultation).
- Cashfree payment order generation, webhook signature verification, and idempotent state persistence.
- Room-by-room schedule configuration and stage synchronizations.

---

## SECTION B: EXISTING ARCHITECTURE & DEPENDENCY MAP

```
+---------------------------------------------------------------------------------------+
|                                    HUTTY 3.0 CLIENT                                   |
|                                                                                       |
|  +------------------------+  +-------------------------+  +------------------------+  |
|  |     Design Tokens      |  |  Architectural Layout   |  |   Motion Utilities     |  |
|  |  (src/styles/tokens.ts)|  | (ArchitecturalLayout.ts)|  | (variants.ts, GSAP)    |  |
|  +-----------+------------+  +------------+------------+  +-----------+------------+  |
|              |                            |                           |               |
|              +--------------------+       |       +-------------------+               |
|                                   v       v       v                                   |
|                             +---------------------------+                             |
|                             |   UI Primitives & Shell   |                             |
|                             |  Button, Card, Input,     |                             |
|                             |  WebsiteHeader, Footer    |                             |
|                             +-------------+-------------+                             |
|                                           |                                           |
|                     +---------------------+---------------------+                     |
|                     v                                           v                     |
|        +-------------------------+                 +-------------------------+        |
|        |    Customer Journeys    |                 |   Calculator & Wizard   |        |
|        | Landing, Pricing,       |                 | 8 Stages, 3D Canvas,    |        |
|        | Consultation, Account   |                 | Room Schedule           |        |
|        +------------+------------+                 +------------+------------+        |
+---------------------|-------------------------------------------|---------------------+
                      |                                           |                      
                      | (State Synchronization via Zustand)       |                      
                      v                                           v                      
+---------------------------------------------------------------------------------------+
|                             PROTECTED CALCULATION ENGINE                              |
|                             (src/calculation-engine/)                                 |
|                                                                                       |
|  +----------------------+  +-------------------------+  +--------------------------+  |
|  |   Formula System V2  |  |     configResolver      |  |     runCalculator()      |  |
|  +----------------------+  +-------------------------+  +--------------------------+  |
|  | Rate Master Store    |  | BOQ Generators          |  | PDF Document Renderer    |  |
|  +----------------------+  +-------------------------+  +--------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            |                                            
                                            | (REST API via fetch / axios)               
                                            v                                            
+---------------------------------------------------------------------------------------+
|                                 PROTECTED SERVER LAYER                                |
|                                       (server/)                                       |
|                                                                                       |
|  +--------------------------------+  +---------------------------------------------+  |
|  | Express Router (/api/v1/...)   |  | Cashfree Payment Verification & Webhooks    |  |
|  +--------------------------------+  +---------------------------------------------+  |
|  | Auth & Session Management      |  | Prisma ORM & PostgreSQL Database Schema     |  |
|  +--------------------------------+  +---------------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

### Component & State Interaction
1. **User Input Layer:** Users configure plots, floors, rooms, and specifications via `useWizardStore`.
2. **Canonical Engine:** Inputs are mapped directly to `configResolver.ts` and evaluated by `runCalculator()`.
3. **Entitlements & Checkout:** Payment requests trigger server sessions via `/api/v1/consultations/create-booking-request` or `/api/v1/orders/create` communicating with Cashfree.
4. **Presentation:** Outputs are rendered using the architectural design tokens and tabular numerical styling.

---

## SECTION C: PROTECTED-FILE INVENTORY

The following files and directories are strictly classified as **Category C (Protected Business Logic)** and were completely untouched during Phase 01:

| Path | Purpose / Critical Logic | Verification Status |
| :--- | :--- | :--- |
| `src/calculation-engine/**` | 31 canonical engine modules including `calculator.ts`, `rateMaster.ts`, `configResolver.ts`, formula models | **UNTOUCHED** (Verified via git status) |
| `src/calculation-engine/__tests__/**` | All 60 unit, integration, and E2E test suites | **UNTOUCHED** (Verified via git status) |
| `server/**` | Express routes, middleware, controllers, Cashfree webhooks, Prisma schema | **UNTOUCHED** (Verified via git status) |
| `server/prisma/schema.prisma` | PostgreSQL database schemas, indexes, and relations | **UNTOUCHED** (Verified via git status) |
| `server/src/services/cashfree.ts` | Cashfree API keys, signature verification, order fulfillment | **UNTOUCHED** (Verified via git status) |
| `src/services/pdf/` | Canonical PDF generation, layout structure, page definitions | **UNTOUCHED** (Verified via git status) |

---

## SECTION D: HUTTY 3.0 DESIGN TOKEN SYSTEM

A centralized token definition module was established at `src/styles/tokens.ts` and mapped to CSS variables in `src/styles/globals.css`.

### 1. Color Palette Tokens (`HUTTY_COLORS`)
- **Primary Forest Green (`brand.primary`):** `#1B3D34`  
  *Deep, authoritative architectural green used for main brand signifiers, primary CTAs, active badges, and navigation emphasis.*
- **Accent Architectural Orange (`brand.accent`):** `#F28C28`  
  *Warm, vibrant amber/orange for highlight metrics, interactive accents, and visual hierarchy points.*
- **Primary Background (`surface.background`):** `#F8F8F6`  
  *Warm plaster / stone off-white inspired by high-end architectural print collateral; prevents clinical coldness.*
- **Surface Elevation (`surface.card`):** `#FFFFFF`  
  *Pure white card elevation with clean single-pixel borders.*
- **Border & Rule Grey (`border.primary`):** `#E5E7EB`  
  *Subtle, crisp technical drawing separator.*
- **Primary Text (`text.primary`):** `#18211E`  
  *Near-black carbon with deep green-grey undertones, ensuring AA/AAA contrast without harsh `#000000` pitch.*
- **Secondary Text (`text.secondary`):** `#707873`  
  *Architectural graphite for technical annotations, helper text, and secondary metadata.*

### 2. Typography System (`HUTTY_TYPOGRAPHY`)
- **Display Headings (`font-heading`):** `Manrope, Plus Jakarta Sans, system-ui, sans-serif`  
  *Geometric, architectural sans-serif with sharp apexes and humanist construction.*
- **Body & Controls (`font-sans`):** `Inter, system-ui, sans-serif`  
  *Standard of precision for data tables, micro-copy, and form controls.*
- **Numerals & Metrics (`tabular-nums font-mono`):**  
  *Fixed-width figures for all currencies (₹), built-up areas (sq.ft), dimensions, and percentages to eliminate visual layout shift.*

### 3. Spacing, Radii & Elevations
- **Border Radii:** Minimalist, structural radii (`sm`: 4px, `md`: 8px, `lg`: 12px, `xl`: 16px, `2xl`: 20px). Eliminates childish pill shapes in favor of crisp architectural geometry.
- **Shadows:** Precision hairline shadows (`elevation.1`: subtle ambient contact shadow, `elevation.2`: hovering card elevation, `elevation.3`: modal / drawer depth).

---

## SECTION E: REUSABLE FRONTEND COMPONENT FOUNDATION

The atomic UI components were refactored to consume the Hutty 3.0 design tokens while maintaining backward-compatible props:

1. **`Button` (`src/components/ui/Button.tsx`)**
   - Implemented variants: `primary` (`bg-[#1B3D34] text-white hover:bg-[#142e27]`), `secondary` (`border border-[#E5E7EB] bg-white text-[#18211E]`), `accent` (`bg-[#F28C28] text-white`), `ghost`, `outline`.
   - Added tactile feedback with `active:scale-[0.98]` and smooth transitions.
   - Added `tabular-nums` support for button labels containing prices or quantities.

2. **`Input` & `Select` (`src/components/ui/Input.tsx`, `src/components/ui/Select.tsx`)**
   - Replaced generic grey borders with `#E5E7EB`.
   - Implemented focus rings: `focus:border-[#1B3D34] focus:ring-2 focus:ring-[#1B3D34]/15`.
   - Formatted unit indicators (e.g., `sq.ft`, `ft`) with tabular numerals and architectural graphite coloring (`#707873`).

3. **`Card` (`src/components/ui/Card.tsx`)**
   - Standardized on `#FFFFFF` surface with `border border-[#E5E7EB]`.
   - Subtle hover elevation transition (`hover:border-[#1B3D34]/30 hover:shadow-md`).

4. **`Badge` & `StatusBadge` (`src/components/ui/Badge.tsx`, `src/components/common/StatusBadge.tsx`)**
   - Styled semantic tags: `active`, `pending`, `completed`, `premium`.
   - Updated indicators to utilize Hutty Forest Green (`#1B3D34`) and Architectural Orange (`#F28C28`).

5. **`Modal` & `DetailDrawer` (`src/components/ui/Modal.tsx`, `src/components/layout/DetailDrawer.tsx`)**
   - Backdrop updated to deep forest tint: `bg-[#1B3D34]/30 backdrop-blur-sm`.
   - Crisp `#E5E7EB` header divider and Manrope title styling.

6. **`Skeleton` & `EmptyState` (`src/components/common/Skeleton.tsx`, `src/components/ui/EmptyState.tsx`)**
   - Loading skeletons use `rgba(27,61,52,0.06)` pulse animation.
   - Empty state illustrations and typography framed in warm architectural cards.

7. **`Table` (`src/components/tables/Table.tsx`)**
   - Column headers rendered on `#F8F8F6` background with `border-b border-[#E5E7EB]`.
   - Numeric columns enforced with `tabular-nums text-right font-mono`.

---

## SECTION F: GLOBAL APPLICATION SHELL

1. **`AppLayout.tsx`**
   - Configured root canvas to `#F8F8F6` background and `#18211E` text.
   - Established global heading styles for all child views.

2. **`WebsiteHeader.tsx`**
   - Header bar with `backdrop-blur-md bg-white/90 border-b border-[#E5E7EB]`.
   - Navigation links rendered with `text-[#707873]` transitioning to `#18211E` on hover, with a subtle `#1B3D34` active indicator line.
   - User account status badge with forest green styling.
   - Mobile navigation menu drawer redesigned with structured architectural links.

3. **`WebsiteFooter.tsx`**
   - Aligned tagline to official brand standard: *"Build your home with clarity."*
   - Editorial columns with clear information hierarchy for Tools, Resources, Platform, and Legal.
   - Real-time Bengaluru, India operations indicator.

---

## SECTION G: RESPONSIVE NAVIGATION FOUNDATION

- **Desktop (>= 1024px):** Fixed header with minimal horizontal layout, quick navigation to Calculator, How It Works, Pricing, Consultations, and Professional Portal.
- **Tablet / Mobile (< 1024px):** Clean slide-out architectural drawer with smooth overlay, touch-friendly tap targets (minimum 44px height), and direct CTA to start estimation.
- **Scroll Behavior:** Sticky header with elevation on scroll (`shadow-xs border-b border-[#E5E7EB]`).

---

## SECTION H: REUSABLE ANIMATION UTILITIES

1. **`src/animations/variants.ts`**
   - Preserved all legacy animation tokens (`springTransition`, `easeTransition`, `fadeVariant`, `slideInVariant`, `scaleVariant`) to prevent regressions.
   - Added Hutty 3.0 architectural variants:
     - `fadeUpTextVariant`: Smooth reveal for editorial headlines.
     - `staggerTextContainerVariant`: Coordinated parent container stagger.
     - `maskImageRevealVariant`: Architectural image reveal with clipping mask effect.
     - `cardHoverVariant`: Controlled vertical lift (`y: -3px`) with hairline shadow increase.
     - `buttonTapVariant`: Tactile scale press (`scale: 0.98`).
     - `scaleSettleVariant`: Smooth modal entrance.

2. **`src/animations/useArchitecturalReveal.ts`**
   - GSAP custom hook utilizing `gsap.context()` for scoped animations and automatic cleanup on unmount.
   - Full support for `window.matchMedia('(prefers-reduced-motion: reduce)')` to automatically bypass motion for accessibility.

3. **`src/components/layout/ArchitecturalLayout.tsx`**
   - Provided `PageContainer` (responsive max-width container with consistent padding).
   - Provided `Section` (standardized editorial section spacing).
   - Provided `SectionHeading` (standardized Manrope display titles with accent badges and secondary descriptions).

---

## SECTION I: IMPLEMENTATION & TESTING REPORT

### Verification Steps & Results

1. **Frontend TypeScript Check (`npx tsc -b`)**
   - Result: **0 errors**.
   - Output: Clean exit code 0.

2. **Backend TypeScript Check (`npx tsc -p server`)**
   - Result: **0 errors**.
   - Output: Clean exit code 0.

3. **Full Vitest Test Suite (`npx vitest run`)**
   - Test Files: **60 passed (60)**
   - Tests: **796 passed (796)**
   - Duration: 36.98s
   - Zero test regressions across calculation engine, Cashfree payments, admin rate master, and user flows.

4. **Production Vite Build (`npm run build`)**
   - Result: **Successful build in 47.56s**.
   - Output: 3,013 modules transformed into optimized production chunks (`dist/`).

---

## SECTION J: LIST OF FILES CREATED, MODIFIED, AND UNTOUCHED

### Files Created (3)
1. `src/styles/tokens.ts` (Hutty 3.0 typed design token system)
2. `src/animations/useArchitecturalReveal.ts` (GSAP architectural reveal hook)
3. `src/components/layout/ArchitecturalLayout.tsx` (Architectural grid layout components)

### Files Modified (21)
1. `index.html` (Google Font Manrope import)
2. `src/styles/globals.css` (CSS variables, Manrope font family, UI component root styles)
3. `src/animations/variants.ts` (Architectural Framer Motion variants)
4. `src/components/layout/WebsiteHeader.tsx` (Architectural header shell)
5. `src/components/layout/WebsiteFooter.tsx` (Architectural footer shell)
6. `src/components/layout/AppLayout.tsx` (Root canvas wrapper)
7. `src/components/layout/DetailDrawer.tsx` (Drawer styling and overlay)
8. `src/components/ui/Button.tsx` (Tactile button component)
9. `src/components/ui/Input.tsx` (Technical form input)
10. `src/components/ui/Select.tsx` (Technical select component)
11. `src/components/ui/Card.tsx` (Architectural card elevation)
12. `src/components/ui/Badge.tsx` (Status and category badge)
13. `src/components/ui/Modal.tsx` (Dialog and overlay)
14. `src/components/ui/EmptyState.tsx` (Fallback state wrapper)
15. `src/components/ui/Toast.tsx` (Notification toast)
16. `src/components/common/Toast.tsx` (Common toast wrapper)
17. `src/components/common/Skeleton.tsx` (Forest green skeleton loader)
18. `src/components/common/StatusBadge.tsx` (System status indicator)
19. `src/components/common/SectionHeader.tsx` (Editorial section heading)
20. `src/components/common/PageHeader.tsx` (Editorial page heading)
21. `src/components/tables/Table.tsx` (Data table with tabular numbers)

### Files Untouched (Protected Systems)
- All 31 calculation engine files in `src/calculation-engine/`
- All 60 test suites in `src/calculation-engine/__tests__/`
- All backend files in `server/` (controllers, routes, services, prisma)
- All PDF layout and document generation code in `src/services/pdf/`

---

## SECTION K: REMAINING ISSUES & RECOMMENDED NEXT PHASE

### Current State
Phase 01 has completed the foundational transformation. All typography, tokens, animations, primitive UI elements, layout headers, and footers now reflect the Hutty 3.0 architectural aesthetic. All 796 tests pass and production builds compile cleanly.

### Recommended Next Phase: Phase 02 — Core Customer Journey & Calculator Visual Transformation
Now that the design tokens and atomic primitives are in place, Phase 02 should focus on applying this architectural styling to the customer-facing views:
1. **Homepage (`LandingPage.tsx`):**
   - Apply the architectural grid and hero presentation.
   - Utilize human-centric architectural photography (`hero-house-render.jpg`, `how-it-works-family.jpg`).
   - Implement fluid GSAP reveal transitions for stats and features.
2. **Calculator Experience (`src/features/planner/stages/`):**
   - Refresh the 8 calculator stages (Plot Dimensions, Floors, Rooms, Style, Materials, Finishing, Estimates).
   - Ensure interactive sliders, floor steppers, and room pickers use the `#1B3D34` and `#F28C28` accents with zero formula interference.
3. **Estimate & BOQ Presentation (`ReportPage.tsx`):**
   - Render the estimate summary, category breakdowns, and rate items with editorial clarity and tabular numerical precision.
4. **Consultation & Professional Pages (`ConsultationPage.tsx`, `ProfessionalJoinPage.tsx`):**
   - Connect expert profiles and booking flow with architectural photography and transparent pricing tiers.

