# Hutty — UI/UX Redesign Audit & Implementation Map

**Date:** October 2026  
**Product:** Hutty — *Build your home with clarity.*  
**Scope:** Complete Customer-Facing Website Redesign & Pre-Launch Implementation  
**Status:** Audit Complete & Implementation Map Established  

---

## 1. Executive Summary & Supplied References Audit

In accordance with the client's master UX/UI briefs, reference screenshots, pricing requirements, and construction-planning workflow, an exhaustive inspection of the Hutty codebase was conducted.

### 1.1 Supplied References Status
| Reference Document / Asset | Location & Status | Actions & Verification |
|---|---|---|
| `Hutty_Calculator_Developer_UX_UI_Brief.pdf` | **Present** in context attachment (Page 1 & 2 screenshots & complete OCR). | Authoritative 8-stage calculator blueprint, design principles, mobile UX, and trust requirements strictly mapped. |
| `Hutty_Consultation_Page_Developer_Brief.pdf` | **Documented in repo** (`CONSULTATION_IMPLEMENTATION.md`, `CONSULTATION_IMPLEMENTATION_REPORT.md`). Standalone PDF is not physically in the root directory. | Implementation requirements mapped directly from client brief specifications: Hero headline, 6 canonical categories, 4 popular consultations, flat ₹1,499 price, fallback enquiry, and professional registration. |
| `GBA_Setback_Rules_Feet_Reference.pdf` | **Implemented in codebase** (`src/calculation-engine/data/authorityRules/gbaRules.ts`, `SETBACK_SYSTEM_V2_AUDIT.md`). Standalone PDF is not physically in the root directory. | Fully transcribed Karnataka Gazette Table 1 data (Micro ≤646 sq.ft, Small 646–1615 sq.ft, Medium 1615–4306 sq.ft with 8% width/depth, Large 4306–10764 sq.ft with 10% width/depth). Connected to canonical planning engine. |
| `hutty_calculator_ui_prototype.html` | **Documented in repo** (`CLIENT_FEEDBACK_IMPLEMENTATION_AUDIT.md`, `UI_UX_OVERHAUL_REPORT.md`). Standalone HTML file not present in root. | Guided architectural design tokens, live preview panel HUD, and clean card styling fully incorporated into design system. |
| `Hutty_Developer_Change_Request_Simple_Language.pdf` | **Documented in repo** (`CLIENT_FEEDBACK_IMPLEMENTATION_REPORT.md`). Standalone PDF not present in root. | Human-friendly terminology substitutions enforced across website, calculator, preview, and PDF generator. |
| Supplied Mobile Calculator Journey Image | **Embedded in Page 1 of Calculator Brief** ("Visual design reference"). | 8 distinct mobile screens visually reviewed: Plot, Home, Rooms, Buildable Space, Construction Style, Finishes & Materials, Estimate, Detailed BOQ. |
| Supplied Hutty Homepage Reference Image | **Documented & asset available** (`public/hero-house-render.jpg`, `src/assets/hero-house-render.jpg`). | Client headline, architectural visuals, clear value proposition, and two prominent CTAs mapped. |
| Supplied Practo Consultation Screenshot | **Reference for IA inspiration only.** Standalone screenshot not present in root. | Practo's clear search/category organization adapted for residential construction experts without copying medical branding or terminology. |

*Note: As instructed in the brief, the missing physical standalone PDFs/HTML files are explicitly noted above rather than silently substituted.*

---

## 2. Architectural Audit & Current Implementation State

### 2.1 Technology Stack Verification
- **Frontend:** React 19 (`react` 19.0.0, `react-dom` 19.0.0), TypeScript 5.7.3, Vite 6.1.0, Zustand 5.0.3, Tailwind CSS v4 (`@tailwindcss/vite` 4.0.5), Framer Motion 12.4.1, Lucide React, Three.js 0.185.1, `@react-pdf/renderer` 4.2.1.
- **Backend:** Node.js, Express 4.18.3, TypeScript 5.3.3, Prisma 5.10.0 with PostgreSQL datasource, bcryptjs, jsonwebtoken, zod.
- **Payment Gateways:** Razorpay (order creation, signature verification, webhook validation) and Cashfree Sandbox.
- **Hosting Environments:** Frontend on Vercel (`https://cost-calculator-ten-kappa.vercel.app/`), Backend on Render (`https://hutty-api.onrender.com/`).

### 2.2 Critical Gaps & Defects Identified in Existing Codebase
1. **Unwanted Login Gate for Calculator (P0 Blocking Defect):**
   - In `src/app/router.tsx` (lines 127, 139), `/calculator` and `/planner` routes were wrapped inside `<AuthGuard>`.
   - In `src/features/landing/sections/HeroSection.tsx` (line 96) and `src/components/layout/WebsiteHeader.tsx` (line 321), clicking "Start Free Estimate" checked `!isAuthenticated` and redirected directly to `/login?redirect=/calculator`.
   - **Violation:** Violates non-negotiable rule: *"The free estimate works without account creation. A first-time homeowner can enter plot details, configure a basic home and reach a preliminary estimate without creating an account or understanding technical construction terminology."*
2. **Old 11-Step Engineering Wizard vs. Requested 8-Stage Mobile Journey:**
   - The calculator was configured with 11 engineering-style steps (`Step0Onboarding` through `Step10Painting` + `Step10LoadingExperience`), with separate steps for individual trades (Wall cladding, Doors, Windows, Electrical, Sanitary, Painting) that felt like an engineering form rather than an intuitive home planning journey.
   - It lacked the client's explicit 8-stage structure:
     - Stage 1: Your Plot
     - Stage 2: Your Home
     - Stage 3: Your Rooms
     - Stage 4: Your Buildable Space
     - Stage 5: Construction Style
     - Stage 6: Finishes & Materials
     - Stage 7: Your Estimate (In-calculator preliminary estimate for guest homeowners)
     - Stage 8: Detailed BOQ (Preview work-wise BOQ, material takeoff, rates, labour, GST, report plans)
3. **Lingering ₹99 Legacy Pricing References:**
   - Multiple customer-facing locations retained references to a ₹99 "Basic Estimate PDF" (`UnlockBasicPdfModal.tsx`, `useEntitlementStore.ts`, `pdfService.ts`, `pricing.constants.ts`, `config/pricing.ts`).
   - **Violation:** Client explicitly instructed: *"Remove the old ₹99 price everywhere."* and *"Use exactly these four products/services: Free Estimate (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499), Consult an Expert (₹1,499)."*
4. **Homepage Copy & CTAs Mismatch:**
   - The homepage hero was displaying `"Know your home cost before you build"` instead of the client's requested headline: `"Understand your home before you build."`
   - Supporting copy was `"Estimate your construction cost, explore material quantities and get expert guidance—all in one place."` instead of: `"Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it."`
   - Secondary CTA did not feature the explicit pricing: `"Consult an Expert — ₹1,499"`.
5. **Technical Terminology in Customer-Facing Pages:**
   - Several pages and PDF sections still used technical jargon:
     - "Material takeoff" instead of "Materials needed"
     - "Trade labour/execution trades" instead of "Labour and work costs"
     - "Bank-ready BOQ dossier" instead of "Detailed construction cost report"
6. **Missing Standalone Supporting Pages:**
   - A dedicated `/how-it-works` route was missing, relying on landing page anchor links.
   - `/consult` needed complete alignment with the verified expert directory, category filters, booking modal, and professional onboarding flow.

---

## 3. Four Canonical Products & Commercial Architecture

| Product / Service | Displayed Price | Backend Minor Units | Customer Entitlements & Deliverables |
|---|---|---|---|
| **Free Estimate** | **₹0** | `0` paise | Interactive 8-stage calculator, total BUA calculation, preliminary cost estimate & range, cost breakdown (materials, labour, others), physical material quantity estimates (steel, cement, sand, blocks), 3D house view and plot layout, planning assumptions and disclaimer. No login required. |
| **Detailed BOQ** | **₹499** | `49900` paise | Everything in Free Estimate + Itemized civil & structural works BOQ, exact material quantities & unit rates, installed fixtures & joinery breakdown, trade labour breakdown with milestone schedule, GST schedule, official downloadable PDF report. Requires sign-in/account creation at purchase. |
| **Premium BOQ** | **₹1,499** | `149900` paise | Everything in Detailed BOQ + Multi-scenario floorplan comparison, premium specification customization, permanent cloud save with version history, priority export suite. *(Note: Clearly disclaimed that consultation is a separate professional service).* |
| **Consult an Expert** | **₹1,499** | `149900` paise | Separate professional consultation service. 1-on-1 scheduled session with a verified independent architect, structural engineer, contractor, or approvals specialist. Distinct booking and administrative review workflow. Does not bundle Premium BOQ access. |

---

## 4. Implementation Phasing & Work Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Audit & Design System (Tokens, Typo, Components)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 2: Customer-Facing Website Redesign                   │
│   • Homepage (Hero, CTAs, 3 core values, real calc preview) │
│   • Header, Footer, Pricing (/pricing), How It Works        │
│   • Elimination of all ₹99 references                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 3: Calculator Journey Redesign (8 Meaningful Stages)   │
│   • Stage 1: Your Plot (Dimensions, Area, Land Status)      │
│   • Stage 2: Your Home (Floors G–G+4, Purpose, Parking)     │
│   • Stage 3: Your Rooms (Accessible number selectors)       │
│   • Stage 4: Your Buildable Space (GBA setbacks, BUA)       │
│   • Stage 5: Construction Style (RCC vs Load Bearing, Tiers)│
│   • Stage 6: Finishes & Materials (Tabs, Brands optional)   │
│   • Stage 7: Your Estimate (Guest-accessible full estimate) │
│   • Stage 8: Detailed BOQ (Preview, Rates, Tiers, Unlock)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 4: Paid Reports, Auth Gating & Checkout Lifecycle     │
│   • Seamless guest-to-account transition at purchase/save   │
│   • Strict entitlement isolation (₹499 vs ₹1,499)           │
│   • PDF generator sync with single-source calculation engine│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 5: Consultation Platform & Professional Onboarding    │
│   • 6 Categories & 4 Popular Consultations                  │
│   • Verified expert directory & booking modal (₹1,499)      │
│   • Fallback lead enquiry ("Talk to a Hutty Expert")        │
│   • Professional registration (/professionals/join)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 6: Admin Integration & Launch Readiness Documentation │
│   • Verification of Admin Setbacks & Formula System V2      │
│   • DAY_1_LAUNCH_READINESS.md maintenance                   │
│   • UI_UX_REDESIGN_REPORT.md generation                     │
└─────────────────────────────────────────────────────────────┘
```
