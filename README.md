# Hutty — Residential Construction Cost Estimation Platform

> A structured web application for parameterized residential construction planning, quantity estimation, and bill of quantities (BOQ) generation for homebuilders, architects, and contractors in Karnataka, India.

---

## Overview

Hutty provides an interactive, structured workflow for estimating residential construction costs before site breaking. The application combines user inputs (plot dimensions, room schedules, floor counts, structural specifications, and finish tiers) with regional market rates and parameterized civil engineering quantity estimation rules to produce an itemized Bill of Quantities, milestone disbursement schedules, and downloadable technical documentation.

---

## Core Architecture

Hutty is built as a single-page client application with an optional Node.js/Express API backend. The core calculation pipeline runs entirely client-side, enabling instant recalculation (<5ms) as users configure parameters.

```
USER INPUT (Plot, Rooms, Materials, Tiers)
    ↓
AUTHORITY RULES & SETBACK EVALUATION (BBMP / MUDA / Gram Panchayat)
    ↓
BUILT-UP AREA (BUA) & GEOMETRY ENGINE
    ↓
CANONICAL SPACE & BUILDING MODEL (Rooms, Wall Perimeters, Heights)
    ↓
OPENING SCHEDULES (Doors, Windows, Ventilation Deductions)
    ↓
PHYSICAL MATERIAL TAKEOFF (Steel, Cement, Masonry, Aggregates, Finishing, MEP)
    ↓
WORKS BILL OF QUANTITIES (BOQ) (Itemized line items across 13 trade categories)
    ↓
BUDGET ENGINE & COMMERCIAL RECONCILIATION
    ↓
TIMELINE & MILESTONE DISBURSEMENT ROADMAP
    ↓
AUTOMATED QA GATE (Invariance & reconciliation checks)
    ↓
UNIFIED MASTER CALCULATION RESULT (Single Source of Truth)
    ├── Interactive Dashboard & Visual Breakdowns
    ├── Calculation Audit Trace
    └── Client-Side PDF Report Generation (@react-pdf/renderer)
```

### Key Architectural Invariants
1. **Single Source of Truth**: All presentation views (Planner, Dashboard, Live Preview, and PDF Report) consume the exact same `CalculationResult` compiled by `runCalculator()`.
2. **Deterministic Computation**: Calculations do not rely on asynchronous network calls or probabilistic AI generation; identical inputs produce identical outputs.
3. **Automated QA Gate**: Prior to result exposure, `runQAGate()` validates mathematical invariants (reconciled BOQ sums, milestone payment totals equaling 100%, and physical quantity integrity).
4. **Physical Brand Invariance**: Selecting a different material brand (e.g., Tata Tiscon vs. JSW Neosteel) updates unit rates while keeping physical consumption quantities (tonnes, bags, cubic metres) invariant.

---

## Directory Structure

```
├── public/                     # Static assets (favicons, brand logos, robots.txt)
├── server/                     # Backend API & export service (Node.js/Express)
│   ├── prisma/                 # Database schema & seed scripts (PostgreSQL)
│   └── src/                    # API controllers, routes, middleware, services
├── src/                        # Frontend Application
│   ├── animations/             # Framer Motion animation variants
│   ├── app/                    # Application router and top-level layout
│   ├── calculation-engine/     # Centralized deterministic calculation engine
│   │   ├── __tests__/          # Vitest test suites (99 automated test cases)
│   │   ├── data/               # Material databases, authority rules, coefficients
│   │   │   ├── authorityRules/ # Bengaluru (BBMP), Mysuru (MUDA), Gram Panchayat rules
│   │   │   ├── brandDatabase.ts
│   │   │   ├── coefficients.ts
│   │   │   ├── engineeringAssumptions.ts
│   │   │   ├── packageConfig.ts
│   │   │   └── rateService.ts
│   │   ├── modules/            # Domain calculation modules
│   │   │   ├── boq.ts          # Bill of Quantities compilation
│   │   │   ├── brick.ts        # Masonry and aggregate quantities
│   │   │   ├── bua.ts          # Built-up area and setbacks
│   │   │   ├── budget.ts       # Cost aggregation and commercial reconciliation
│   │   │   ├── cement.ts       # Cement consumption takeoff
│   │   │   ├── doors.ts        # Door schedule and opening areas
│   │   │   ├── electrical.ts   # MEP electrical point and conductor takeoff
│   │   │   ├── fixtures.ts     # Plumbing and sanitary fixture schedule
│   │   │   ├── flooring.ts     # Flooring, cladding, and waterproofing areas
│   │   │   ├── materials.ts    # Material schedule and procurement listings
│   │   │   ├── paint.ts        # Plaster, paint, and putty areas
│   │   │   ├── payment.ts      # 11-stage bank loan disbursement plan
│   │   │   ├── plumbing.ts     # Water supply, drainage, and tank sizing
│   │   │   ├── qaGate.ts       # Automated QA and validation gate
│   │   │   ├── report.ts       # Dossier assembly
│   │   │   ├── spaceModel.ts   # Canonical room geometry engine
│   │   │   ├── steel.ts        # TMT reinforcement takeoff
│   │   │   ├── timeline.ts     # Construction duration estimation
│   │   │   ├── trace.ts        # Audit step trace generator
│   │   │   └── windows.ts      # Window schedule and opening areas
│   │   ├── calculator.ts       # Master orchestrator pipeline
│   │   └── types.ts            # Canonical domain TypeScript interfaces
│   ├── components/             # Reusable UI component library
│   │   ├── 3d/                 # Three.js architectural volume visualizer
│   │   ├── brand/              # Brand assets and SVG components
│   │   ├── common/             # Error boundaries, SEO, technical diagrams
│   │   ├── dashboard/          # Dashboard cards, activity workspaces, drawers
│   │   ├── layout/             # Navigation headers, sidebars, footer
│   │   ├── modals/             # Calculation trace, comparison, and review modals
│   │   └── ui/                 # Base UI elements (buttons, cards, badges)
│   ├── constants/              # Construction stages and activity definitions
│   ├── features/               # Route-level feature views
│   │   ├── admin/              # Price and catalog administration interface
│   │   ├── dashboard/          # Construction management workspace
│   │   ├── error/              # 404 and error boundaries
│   │   ├── landing/            # Overview landing and comparison sections
│   │   ├── planner/            # 10-step interactive configuration wizard
│   │   ├── report/             # Report page and @react-pdf renderer document
│   │   └── settings/           # Platform preferences and units
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand reactive state stores
│   ├── styles/                 # Global styles and Tailwind CSS v4 design tokens
│   └── utils/                  # Currency formatting, class utility helpers
├── .env.example                # Example client-side environment configuration
├── CALCULATION_AUDIT_NOTES.md  # Detailed technical audit notes for external reviewers
├── DEPLOYMENT.md               # Infrastructure and cloud deployment documentation
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript workspace configuration
├── vite.config.ts              # Vite bundler configuration
└── vitest.config.ts            # Vitest test runner configuration
```

---

## Technology Stack

- **Frontend Framework**: React 19, TypeScript 5.7
- **Build Tool**: Vite 6.1
- **Styling**: Tailwind CSS v4, Vanilla CSS tokens
- **State Management**: Zustand 5.0 (persisted stores)
- **3D Visualization**: Three.js 0.185
- **PDF Compilation**: `@react-pdf/renderer` 4.2 (client-side PDF generation)
- **Animations**: Framer Motion 12
- **Testing**: Vitest 3.2
- **Backend (Optional API Engine)**: Node.js 20, Express 4.18, Prisma ORM 5.10, PostgreSQL

---

## Getting Started

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### 1. Installation

Clone the repository and install root frontend dependencies:

```bash
npm install
```

*(Optional)* Install backend server dependencies:

```bash
cd server
npm install
cd ..
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

#### Developer PDF Testing Bypass
By default, the 22-section PDF export requires lead information and completed checkout in production. For local development and technical review, a full PDF testing bypass is available:

```env
# .env.local
VITE_DEVELOPMENT_FULL_PDF_TESTING=true
```

> **Security Note**: This bypass is strictly development-gated (`import.meta.env.DEV`). In production builds (`npm run build`), Vite replaces `import.meta.env.DEV` with `false`, compiling out the bypass logic entirely.

---

## Development, Testing & Production Commands

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Running Tests

Run the Vitest automated test suite:

```bash
npm test
```

To run once without watch mode:

```bash
npm test -- --run
```

The suite validates:
- Core calculation invariants (geometry, setbacks, and coverage)
- Material takeoff completeness (steel, cement, sand, aggregates)
- Electrical points and conductor sizing formulas
- Authority BUA and setback rules (Bengaluru, Mysuru, Gram Panchayat)
- 3-package specification consistency and brand invariance
- Benchmark validation against standard residential plot cases (30x40, 30x50, 60x90)
- Single-source-of-truth PDF generation and automated QA Gate enforcement

### Type Checking & Linting

Run TypeScript type check across the application:

```bash
npm run lint
```

### Production Build

Create an optimized production bundle in `dist/`:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Important Calculation Engine Notes & Disclaimers

1. **Parametric Estimation**: Quantities and costs generated by Hutty are derived from empirical civil engineering thumb rules, regional market indices (Bengaluru and Mysuru), and statutory setback frameworks.
2. **Not Certified Engineering Advice**: Output estimates are intended for preliminary budgeting, contractor tendering, and home loan documentation planning. They do not substitute for certified structural drawings, soil bearing capacity tests (SBC), or site-specific architectural drawings prepared by a licensed structural engineer or architect.
3. **Audit Documentation**: An external technical review summary of all calculation modules, parametric assumptions, and items requiring client verification is documented in [`CALCULATION_AUDIT_NOTES.md`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/CALCULATION_AUDIT_NOTES.md).

---

## License & Copyright

© 2026 Hutty / Rightcon Constructions. All rights reserved.
