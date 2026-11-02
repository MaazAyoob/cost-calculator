# HUTTY 3.1 — PHASE 06: VISUAL & USER EXPERIENCE AUDIT
**Document Reference:** `docs/hutty-3.1/phase-06/VISUAL_AUDIT.md`  
**Evaluation Standard:** Architectural Identity, Palette Depth, Typography & Mobile-First Hierarchy  
**Audit Date:** November 1, 2026  
**Status:** AUDIT COMPLETE — PROCEEDING DIRECTLY TO IMPLEMENTATION

---

## 1. Executive Summary

Following the completion of functional Phases 01–05, Hutty 3.1 is technically sound: calculation formulas are rigorous (IS 456 compliant), the 15-section BOQ reconciles with zero residual, and test pass rates stand at 100% (901/901 tests). 

However, a comprehensive visual audit of the running application reveals that the **visual experience remains too monolithic and heavily anchored to the legacy palette**:
1. **Color Monotony:** Over 2,250 hardcoded occurrences of a single dark green (`#1B3D34`) paired with 474 occurrences of a loud, saturated orange (`#F28C28`) and a flat, cold background (`#F8F8F6`).
2. **Hero Composition Limitations:** The homepage hero text is understated ("Your home begins with a clearer plan") and crowded by repetitive micro-controls, while the visualizer is constrained within a standard dark box rather than presenting an inspiring architectural composition.
3. **Repetitive Card Architecture:** Multiple homepage sections rely on repeated rows of three white rectangular cards with light gray borders, creating a generic SaaS feel rather than a high-end architectural planning platform.
4. **Desktop-First Artifacts on Mobile:** Several calculator panels, BOQ tables, and navigation controls crowd smaller phone screens (320px–390px), requiring true mobile-first ergonomics.

---

## 2. Hardcoded Palette vs Design Token Audit

An automated scan across `src/features/` revealed significant reliance on inline arbitrary Tailwind hex values rather than semantic design tokens:

| Color / Token | Hex Value | Usages in Codebase | Visual Evaluation & Critique |
|:---|:---:|:---:|:---|
| **Legacy Green** | `#1B3D34` | **2,250** | Used for text, backgrounds, borders, pills, badges, and icons indiscriminately. Needs expansion into Deep Forest (`#183B32`), Forest Green (`#245747`), Emerald (`#347A62`), and Soft Sage (`#B7CDBB`). |
| **Legacy Orange** | `#F28C28` | **474** | Too bright, saturated, and neon-adjacent for an architectural product. Must be replaced with rich, warm Terracotta (`#C66B4E`) and earthy Clay (`#A95640`). |
| **Flat Grey BG** | `#F8F8F6` | **330** | A cold, sterile grayish-white background. Lacks the organic warmth of high-end architectural drafting paper. Must evolve to Warm Ivory (`#F7F3EA`) and Sandstone (`#E9DDC9`). |
| **Neutral Border** | `#E5E7EB` | **1,120+** | Standard Tailwind gray-200. Creates cold borders without architectural warmth. Needs Sandstone (`#E9DDC9`) and Light Sage (`#E8EFE9`) lines. |
| **Dark Charcoal** | `#18211E` | **890+** | Near-black text. While legible, it benefits from pairing with warm Slate (`#66716B`) and deep architectural Charcoal (`#202824`). |

---

## 3. Page & Section Level Visual Findings

### 3.1 Website Header & Navigation
- **Current State:** Standard white bar with green logo and thin border.
- **Issues:** Lacks depth; consultation link feels like an unstyled pill; mobile hamburger dropdown is a generic white sheet without architectural character.
- **Remedy:** Introduce frosted Warm Ivory backdrop, subtle terracotta accents, and a distinct gold-bordered consultation advisory pill.

### 3.2 Homepage Hero Section
- **Current State:** Split desktop layout with plot size buttons on the left and a framed 2D/3D visualizer on the right.
- **Issues:**
  - Headline lacks memorability and confidence.
  - The right-side visualizer feels boxed in.
  - Missing the layered drafting aesthetic: no blueprint overlays, no tactile material chips, no architectural dimension markers.
  - On mobile, the visualizer dominates vertical space while the plot inputs feel cramped.
- **Remedy:** Redesign as a signature architectural editorial composition. Strong headline: *"Your dream home. Planned with clarity."* Supporting copy on budget and quantities. Layered visual with contemporary Indian residence render, architectural floor-plan blueprint overlay, floating material selection chips (Tata Tiscon Fe550D, UltraTech Cement, Granite / Teak), and a live recalculating budget card.

### 3.3 Middle Homepage Sections
- **Current State:** `FourOfferingsSection`, `WhyPlanningSection`, and `EngineeringStandardsSection` repeat similar white-card layouts.
- **Issues:** Low visual rhythm; uniform background tone creates scrolling fatigue.
- **Remedy:**
  - Create alternating full-bleed warm ivory (`#F7F3EA`), deep forest (`#183B32`), and sandstone (`#E9DDC9`) sections.
  - Redesign `ThreeEasyStepsSection` with numbered editorial milestones.
  - Give the 13-stage timeline a warm architectural progress aesthetic.

### 3.4 Commercial Pricing & Reports Presentation
- **Current State:** Four uniform columns with green buttons.
- **Issues:** Fails to visually differentiate the ₹499 Detailed BOQ from the ₹1,499 Premium Engineering Dossier; lacks the tactile appeal of an architectural report deliverable.
- **Remedy:** Distinctive tier hierarchy:
  - Free Calculator: Clean Sage accent.
  - ₹99 Basic PDF: Sandstone card with concise preview badge.
  - ₹499 Detailed BOQ: Terracotta featured badge ("Most Popular").
  - ₹1,499 Premium Dossier: Muted Gold architectural border and luxury finish list.
  - ₹1,499 Independent Consultation: Deep forest background with expert trust seal.

### 3.5 Calculator Chapters (1–7)
- **Current State:** Functional, but relies on monotonous green pill navigation and plain cards.
- **Issues:**
  - Chapter 1 (Plot & Setbacks): Setback preview is informative but visually flat.
  - Chapter 2 (Dream Home): Floor and room selectors need richer tactile feedback.
  - Chapter 3 (Core Materials): Material cards need distinct swatches and warm tones.
  - Stage 4 (Buildable Footprint): Setback canvas needs architectural grid lines and drafting measurements.
  - Chapter 6 (Finishes & Railings): New Section D is functional but needs visual alignment with the new palette.
  - Chapter 7 (Estimate & BOQ): Estimate breakdown needs clear visual grouping with warm terracotta accent highlights.

---

## 4. Mobile-First Ergonomics Audit

1. **Touch Targets:** Some quick-select buttons in Chapter 1 and Chapter 2 measure 36px–38px, below the recommended 44px minimum for comfortable smartphone touch operation.
2. **Horizontal Overflow:** On narrow screens (320px–360px), multi-column chip bars and BOQ preview tables can cause horizontal body jitter if not strictly clipped.
3. **Viewport Hierarchy:** On phone viewports, the sticky preliminary estimate banner must stay compact so it does not swallow more than 12% of vertical screen height.

---

## 5. Direct Implementation Roadmap

1. **Design Tokens & Theme Upgrade:**
   - Update `globals.css` and `tokens.ts` with the complete 14-color architectural palette.
   - Configure Tailwind v4 `@theme` utility classes.
2. **Homepage Hero Architectural Overhaul:**
   - Implement the new split editorial hero with layered blueprint, material chips, and live budget card.
3. **Homepage Complete Visual Rework:**
   - Redesign all 14 homepage sections with alternating warm and cool surfaces, numbered process layouts, and distinctive pricing cards.
4. **Calculator Chapters Styling Upgrade:**
   - Apply the palette across Chapters 1–7, input steppers, setback canvas, and commercial modals.
5. **Mobile-First Responsive Verification:**
   - Test across 320px, 360px, 375px, 390px, 430px, 768px, 1024px, 1440px.
6. **Documentation & Consolidated Closeout:**
   - Complete all 7 phase-06 reports.

