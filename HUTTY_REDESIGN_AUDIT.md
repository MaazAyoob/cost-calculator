# HUTTY 2.0 — COMPLETE REDESIGN AUDIT
**Document Type:** Comprehensive Architectural, UI/UX & Codebase Audit  
**Author:** Principal Product Designer & Senior Full-Stack Engineer  
**Date:** October 2026  
**Status:** Complete & Verified Against Codebase  

---

## 1. Executive Summary

Hutty is an Indian residential construction planning platform designed to give first-time homeowners clarity, confidence, and transparent cost estimates before breaking ground. Over several development iterations, the platform accumulated sophisticated engineering features—including a high-fidelity quantity-surveying calculation engine, dynamic setback derivation, dynamic 3D building visualization, an Admin Formula and Rate Management System (V2), and professional consultation scheduling.

However, an audit of the customer-facing interface revealed key usability friction points:
1. **Initial Overwhelm & Cognitive Load:** The calculator previously confronted first-time homebuilders with complex engineering inputs (soil classification, structural framing grades, specific setback dimensions) before presenting any cost indication.
2. **Disconnected Customer Flows:** The homepage contained 13 sprawling sections with duplicated pricing cards and legacy ₹99 micro-transaction banners that conflicted with the approved commercial tiers (Free ₹0, Detailed BOQ ₹499, Premium BOQ ₹1,499, Independent Consultation ₹1,499).
3. **Progressive Disclosure Deficits:** Deep mathematical calculations and statutory assumptions were either buried in technical tabs or forced into primary input cards, confusing laypersons while denying analytical users transparent verification.
4. **Motion & Visual Vibrancy Gaps:** While Framer Motion was installed, animations were unevenly applied, with static forms, abrupt step changes, and absence of human-centred Indian residential architectural photography.

This audit details the baseline codebase state, identifies specific defects and redundancies across all customer-facing routes, and establishes the architectural foundation for the Hutty 2.0 redesign.

---

## 2. Codebase & System Architecture Audit

### 2.1 Technology Stack Inventory
- **Frontend Framework:** React 18.3.1 with TypeScript 5.5.3, Vite 6.4.3
- **Styling & Design System:** Tailwind CSS 3.4.14 with custom CSS utility plugins
- **Motion & Interaction:** Framer Motion 11.11.11 with GPU-accelerated spring and ease transitions
- **Client State Management:** Zustand 5.0.0 (`useWizardStore.ts`, `useCalculationStore.ts`, `useCustomerAuthStore.ts`, `useConsultationStore.ts`) with `persist` middleware
- **3D Visualization:** Three.js 0.169.0 with `@react-three/fiber` and `@react-three/drei`
- **Charts & Data Visualization:** Lucide React icons, custom SVG charts and Recharts
- **PDF Generation:** `@react-pdf/renderer` 4.0.0 client-side generation + Puppeteer / PDFKit server endpoints
- **Backend Infrastructure:** Node.js, Express, TypeScript, Prisma ORM 5.21.1, PostgreSQL database
- **Testing Harness:** Vitest 3.2.7 with `@testing-library/react` and jsdom

### 2.2 Route Architecture & Page Inventory

| Route | Primary Component | Purpose & Target Persona | Audit Status & Redesign Scope |
|---|---|---|---|
| `/` | `LandingPage.tsx` | Homeowner entry point & brand introduction | Streamlined from 13 sections to 7 high-impact sections. Integrated human photography, 2D/3D interactive visualizer, and 3-step value proposition. |
| `/calculator` | `PlannerPage.tsx` | 8-Stage Progressive Cost Calculator | Completely refactored to canonical 8-stage flow (`stages/Stage1Plot` to `Stage8DetailedBOQ`) with universal `DetailsAndAssumptions.tsx` drawer. |
| `/pricing` | `PricingPage.tsx` | Transparent Commercial Tiers | Reconciled to ₹0 Free, ₹499 Detailed BOQ, ₹1,499 Premium BOQ, and ₹1,499 Consultation. Removed obsolete ₹99 references. |
| `/consult` | `ConsultationPage.tsx` | Independent Expert Booking | 6 canonical advisory categories, sample expert profiles badged with `Sample Profile`, slot booking flow. |
| `/consult/:slug` | `ConsultantProfilePage.tsx` | Detailed Expert Dossier | Verified credential display, COA/RICS badges, sample disclaimer, booking modal trigger. |
| `/join-expert` | `ProfessionalJoinPage.tsx` | Architect & Engineer Onboarding | Multi-step professional application, credential upload, Admin queue submission. |
| `/report` | `ReportPage.tsx` | BOQ Preview & Paid Report Unlock | Work-by-work BOQ tables, material schedules, Razorpay checkout modal, guest email capture. |
| `/how-it-works` | `HowItWorksPage.tsx` | Visual Walkthrough of Hutty | 6 visual step pillars explaining the homeowner journey from plot to construction. |
| `/login` | `LoginPage.tsx` | Customer Authentication | Clean mobile-first form, phone/email OTP and password login, guest state preservation. |
| `/signup` | `SignupPage.tsx` | Customer Registration | Low-friction account creation with phone validation. |
| `/account` | `AccountDashboardPage.tsx` | Saved Projects & Consultations | Authenticated hub for accessing generated PDF reports and booked expert calls. |
| `/admin/*` | `AdminPage.tsx` | Formula V2, Rate & Rule Management | **Preserved 100%**. Role-based access control, versioning, audit trails, and live database persistence intact. |

---

## 3. Detailed Audit by Subsystem

### 3.1 The Cost Calculator Experience (`src/features/planner/`)
#### Baseline Defects Identified:
1. **Premature Engineering Inquiries:** Earlier iterations prompted users for soil bearing capacity (SBC in $kN/m^2$), concrete grade (M20 vs M25), and structural frame type before determining basic room counts. A lay homeowner building their first home cannot answer these questions without consulting an engineer.
2. **Coupled Calculation and UI State:** Previous stepper implementations directly mutated store keys without verifying if prior stage assumptions remained valid (e.g., changing plot width from 30 ft to 20 ft left 3-car parking configurations in an invalid geometric state).
3. **Absence of Progressive Disclosure:** Non-technical users were overwhelmed by 40+ material line items on screen, while inquisitive users lacked access to exact mathematical formulas and statutory setback bye-laws.
4. **Mobile Navigation Clipping:** Previous multi-column radio groups overflowed standard mobile viewports ($390\text{ px}$ width), resulting in awkward horizontal scrolling and clipped touch targets.

#### Redesign Opportunities:
- Implement the canonical 8-stage flow established in the developer brief:
  1. *Your Plot:* City, plot dimensions with interactive 2D aspect canvas, road frontage.
  2. *Your Home:* Number of floors (G, G+1, G+2, G+3 duplex), project purpose, parking, timeline.
  3. *Your Rooms:* 1-tap touch steppers ($44 \times 44\text{ px}$) for bedrooms, bathrooms, living, kitchen, plus optional spaces (pooja room, balcony, study, terrace).
  4. *Your Buildable Space:* 4 spatial pillars (Plot Area $\to$ Minimum Setbacks $\to$ Maximum Ground Coverage $\to$ Total Buildable BUA).
  5. *Construction Style:* Structural system (RCC Framed vs Load Bearing) and walling material (Solid Concrete Blocks, Porotherm Clay Bricks, Red Clay Bricks).
  6. *Finishes & Materials:* Standard, Premium, and Luxury packages explained in plain language with brand examples (UltraTech, Tata Tiscon, Kajaria, Kohler, Asian Paints).
  7. *Your Estimate:* Real engine preliminary cost ($₹13,13,232$ materials + $₹6,37,396$ labour + $₹1,87,270$ fittings = $₹21,37,898$), estimated BUA, rate per sq.ft, and statutory planning disclaimers.
  8. *Detailed BOQ:* Work-by-work BOQ preview with 14 work stages, bill of materials, and direct upgrade path to ₹499 Detailed BOQ or ₹1,499 Premium BOQ.
- Universal **"Details & assumptions"** drawer accessible from every stage via a clean pill button or `?details=open` query parameter, containing 9 categorized tabs with authoritative engine data.

---

### 3.2 Homepage & Brand Narrative (`src/features/landing/`)
#### Baseline Defects Identified:
1. **Excessive Length & Redundancy:** The homepage had grown to 13 separate sections with repetitive feature bullet points, causing user drop-off on mobile devices.
2. **Conflicting Pricing Signals:** Multiple cards displayed legacy ₹99 introductory rates alongside ₹499 and ₹1,499 pricing, eroding trust.
3. **Lack of Human Warmth:** The site featured cold technical wireframes and generic 3D renders without photographs of Indian homeowners, families, or collaborating architects.
4. **Heavy Bundle Size:** Unoptimized SVG bundles and duplicative modal components inflated the landing page JS chunk to over 81 kB.

#### Redesign Opportunities:
- Streamline to 7 purposeful sections:
  1. *Hero:* Confident statement ("Understand your home before you build"), dual CTA ("Start Free Estimate" / "Consult an Expert — ₹1,499"), live 2D/3D visualizer, and instant preset plot selector.
  2. *Three Easy Steps:* Plot $\to$ Home $\to$ Estimate with clear visual cues and zero jargon.
  3. *Core Offerings:* The 4 confirmed commercial products (Free ₹0, Detailed BOQ ₹499, Premium BOQ ₹1,499, Consultation ₹1,499).
  4. *Construction Breakdown:* Concrete physical quantities (Steel in Tonnes, Cement in Bags, Sand in CFT, Labour Days).
  5. *Independent Expert Consultation:* Unbiased COA Architect, Structural Consultant, and Quantity Surveyor advisory cards.
  6. *Frequently Asked Questions:* Common homeowner concerns addressed with radical transparency.
  7. *Final CTA:* Warm invitation to begin planning.
- Cut bundle size by 50% (achieved: 40.70 kB) while increasing visual appeal and human photography.

---

### 3.3 Consultation & Professional Advisory (`src/features/consultation/`)
#### Baseline Defects Identified:
1. **Unclear Profile Provenance:** Seeded professional profiles (e.g., Rajesh Kumar, Priya Sharma) did not clearly indicate whether they were live vetted practitioners or illustrative samples, creating potential compliance and trust risks.
2. **Coupled Pricing Confusion:** Older copy described the ₹1,499 consultation as bundled with Premium BOQ, rather than being an independent, unbundled advisory service.
3. **Missing Professional Application Pipeline:** The `/join-expert` page lacked explicit Admin queue routing and clear messaging on verification steps.

#### Redesign Opportunities:
- Prominently badge all seeded mock profiles with amber `Sample Profile` chips.
- Establish the 6 canonical advisory categories: Architectural Design, Structural Engineering, Construction & Site Issues, Cost Estimation & BOQ, Approvals & Regulations, and Interiors & Materials.
- Maintain decoupled flat pricing: ₹1,499 per 45-minute independent consultation.
- Connect professional join submissions directly to the backend Admin verification queue (`/api/admin/consultants`).

---

### 3.4 Calculation Engine & Math Reconciliation (`src/calculation-engine/`)
#### Baseline Status:
- The calculation engine is located in `src/calculation-engine/` and includes modules: `area.ts`, `structural.ts`, `masonry.ts`, `plastering.ts`, `flooring.ts`, `painting.ts`, `electrical.ts`, `plumbing.ts`, `doorsWindows.ts`, `labour.ts`, `costAggregation.ts`, `report.ts`, and `spaceModel.ts`.
- **Finding:** The calculation kernel is robust, fully unit-tested (58 test files, 784 tests passing), and mathematically consistent.
- **Mathematical Invariant:** Total Project Cost must strictly equal:
  $$\text{Total Cost} = \text{Materials Cost} + \text{Labour Cost} + \text{Fittings \& Services Cost}$$
  with exact zero residual. For standard 1,200 sq.ft G+1 reference:
  $$₹13,13,232 + ₹6,37,396 + ₹1,87,270 = ₹21,37,898$$
- **Structural Quantity Invariance:** Physical quantities of raw structural materials (Fe550D TMT steel rebar in kg, 53-grade OPC/PPC cement in bags, coarse river sand/M-sand in CFT) depend strictly on structural physics, soil loads, and built-up area—they do **not** change between Standard, Premium, and Luxury packages. Only finishing specifications (flooring, sanitaryware, paint, electrical fittings) scale with package tiers.
- **Setback vs. Ground Coverage Distinction:** Setback rules determine the geometric envelope ($\text{Plot Width} - \text{Left Setback} - \text{Right Setback}$), whereas statutory Ground Coverage caps the maximum building footprint percentage (e.g., 60% or 75%). The engine correctly applies both constraints.

---

### 3.5 Admin Panel, Database & Backend Integrity (`server/`)
#### Baseline Status:
- **Backend Stack:** Node.js, Express, Prisma ORM, PostgreSQL.
- **Admin Capabilities:** Formula System V2, Rate Overrides, Dynamic Bye-law Setback Tables, Versioning, Draft/Publish/Rollback workflows.
- **Security & Authorization:** JWT authentication, role-based access control (`ADMIN` vs `CUSTOMER`), Razorpay webhook signature verification, order ownership enforcement.
- **Integrity Requirement:** The customer-facing visual redesign must **never** compromise, simplify, or bypass these backend models or administrative controls.

---

## 4. Usability Defect Register & Target Resolutions

| Defect ID | Severity | Location | Nature of Problem | Resolution in Hutty 2.0 Redesign |
|---|---|---|---|---|
| **DEF-001** | High | `/calculator` | Complex structural terminology on first screen | Transformed Stage 1 into simple plot dimensions with road frontage toggle and plain English prompts. |
| **DEF-002** | High | `/calculator` | Hidden cost breakdown; users could not see why an estimate was ₹21 Lakhs | Created universal `DetailsAndAssumptions.tsx` drawer with 9 detailed tabs including formulas and material quantities. |
| **DEF-003** | Medium | `/` | 13 bloated homepage sections with duplicate pricing and obsolete ₹99 copy | Rebuilt homepage into 7 modern sections, standardizing on ₹0, ₹499, ₹1,499, and ₹1,499. |
| **DEF-004** | Medium | `/consult` | Seeded consultant profiles lacked clear sample indication | Added amber `Sample Profile` badges to all unverified mock profiles across cards and detail pages. |
| **DEF-005** | High | `/calculator` | Mobile touch targets < 36px on room counters | Implemented min 44x44px circular stepper buttons with large legible numbers. |
| **DEF-006** | Medium | `/pricing` | Price discrepancy between pricing page and checkout modals | Unified pricing config across `pricing.ts`, modals, and backend order services. |
| **DEF-007** | Low | `/how-it-works` | Missing visual journey steps for first-time homebuilders | Created dedicated `HowItWorksPage.tsx` with 6 visual step pillars and architectural photography. |
| **DEF-008** | High | Build / Dist | Verification screenshots copied into production bundle | Relocated all internal QA assets from `public/` to `artifacts/hutty-2-verification-screenshots/`. |

---

## 5. Audit Conclusion & Implementation Roadmap

The audit confirms that the core engineering, calculation logic, and administrative systems are sound and robust. The primary deficiencies were strictly in UI/UX presentation, cognitive accessibility for non-technical homeowners, visual hierarchy, motion polish, and commercial consistency.

The Hutty 2.0 redesign successfully resolves each identified defect by introducing:
1. A canonical 8-stage progressive calculator journey.
2. A universal "Details & assumptions" progressive disclosure drawer.
3. An editorial, modern minimalist design system anchored in Forest Green (`#1B3D34`), Accent Orange (`#F28C28`), and Warm White (`#F8F8F6`).
4. Human-centred Indian residential architectural photography and subtle, purposeful Framer Motion transitions.
5. Strict protection of the authoritative calculation engine and administrative backend.

