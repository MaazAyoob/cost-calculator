# Hutty — Website-Wide Motion, Interaction & Control Polish Report

## Executive Summary

A comprehensive, production-grade motion-design, interaction-quality, and visual QA overhaul has been executed across the entire Hutty residential construction planning platform.

Guided by the restrained, tactile design languages of Apple and Google and modern architectural SaaS products, every interaction was redesigned to feel **intentional, responsive, architectural, and restrained**. No decorative bounce, rubber-band wobble, or artificial delays were introduced. Every animated feedback mechanism directly serves user orientation, continuity, or task clarity.

---

## 1. Established Motion Architecture & Design Tokens

### A. Centralized Motion Tokens (`src/animations/motionTokens.ts`)
We established strict timing and easing curves aligned with architectural precision:

| Token | Duration | Cubic Bézier Easing | Use Case |
| :--- | :--- | :--- | :--- |
| `MOTION_DURATIONS.fast` | `150ms` (`0.15s`) | `[0.16, 1, 0.3, 1]` | Micro-interactions, counter buttons, hover highlights, backdrop exit |
| `MOTION_DURATIONS.control` | `180ms` (`0.18s`) | `[0.16, 1, 0.3, 1]` | Inputs, selects, checkboxes, segmented control active pill |
| `MOTION_DURATIONS.panel` | `220ms` (`0.22s`) | `[0.16, 1, 0.3, 1]` | Expandable disclosures, accordions, formula drawer dropdowns |
| `MOTION_DURATIONS.dialog` | `250ms` (`0.25s`) | `[0.16, 1, 0.3, 1]` | Modal dialogs, bottom sheets, slide drawers |
| `MOTION_DURATIONS.page` | `280ms` (`0.28s`) | `[0.16, 1, 0.3, 1]` | Non-calculator page entrance fade & 6px vertical settle |

- **Exit Easing**: `MOTION_EASINGS.exit` = `[0.4, 0, 1, 1]` ensures snappy, non-blocking dismissals when dismissing dialogs or collapsing drawers.
- **Reduced Motion Support**: `prefersReducedMotion()` utility dynamically detects OS/browser accessibility preferences.

### B. Standardized Framer Motion Variants (`src/animations/variants.ts`)
- `pageFadeVariant`: Initial `{ opacity: 0, y: 6 }` → Animate `{ opacity: 1, y: 0 }` (duration 280ms) → Exit `{ opacity: 0, y: -6 }` (duration 150ms).
- `modalScaleVariant`: Initial `{ opacity: 0, scale: 0.98, y: 6 }` → Animate `{ opacity: 1, scale: 1, y: 0 }` → Exit `{ opacity: 0, scale: 0.98, y: 6 }` (zero bouncy overshoot).
- `backdropFadeVariant`: Initial `{ opacity: 0 }` → Animate `{ opacity: 1 }` → Exit `{ opacity: 0 }`.
- `accordionVariant`: Smooth `{ height: 0, opacity: 0 }` ↔ `{ height: 'auto', opacity: 1 }` with overflow clipping.
- `itemFadeUpVariant`: Staggered list items with subtle `{ opacity: 0, y: 8 }` entrance.

---

## 2. Component-by-Component Polish Pass

### A. Buttons & Interactive Controls
- **Tactile Active State**: Added restrained `:active:scale-[0.985]` across `.hutty-btn-primary`, `.hutty-btn-secondary`, and `<Button />` components to give physical keyboard and mouse click feedback.
- **Focus Rings**: Replaced browser outline with `focus-visible:ring-2 focus-visible:ring-[#1B3D34] focus-visible:ring-offset-2` for pristine keyboard navigation.
- **Jitter-Free Loading**: `<Button isLoading={...}>` reserves an icon slot using a 14px spinner without altering button padding, typography, or width, preventing layout shift during asynchronous mutations.
- **Steppers & Room Counters**: `.hutty-counter-control button` updated with `active:scale-[0.92]` and subtle hover darkening for immediate feedback during rapid counter taps.
- **Brand Token Fidelity**: Maintained primary brand green `#1B3D34`, orange accent `#F28C28`, neutral `#4B5563`, and background `#F8F8F6`.

### B. Sliders & Range Inputs
- **Dynamic Green Active Track**:
  - Implemented CSS custom property `--range-progress` on `input[type="range"].hutty-slider`.
  - Added background gradient `linear-gradient(to right, #1B3D34 var(--range-progress, 0%), #E3E8E2 var(--range-progress, 0%))` so the active filled portion directly follows the thumb without latency.
- **Precision Thumb Interaction**:
  - Restrained 16px circular thumb with subtle border and shadow.
  - Active grab state scales smoothly to `1.22` with a subtle focus glow (`box-shadow: 0 0 0 4px rgba(27,61,52,0.14)`).
- **Reusable Component (`src/components/ui/Slider.tsx`)**:
  - Created accessible wrapper with native `<input type="range">` semantics, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and formatted unit labels.
- **Calculator Integration (`Step1BasicInfo.tsx`)**:
  - Plot Length (20–120 ft), Plot Width (20–100 ft), and Built-Up Area sliders now render real-time green progress tracks that sync seamlessly with manual input boxes and canonical calculations.

### C. Form Inputs & Selects
- **Zero Layout-Jumping**:
  - Replaced risky `transition-all` with explicit `transition-colors duration-150 ease-out`. Field dimensions remain strictly static during focus/blur.
- **Focus & Error States**:
  - Default: border `#E5E7EB`, focus ring `#1B3D34`.
  - Error: `border-red-500` with `aria-invalid="true"` and non-shifting error message text.

### D. Interactive Cards & Navigation
- **Cards (`src/components/ui/Card.tsx`)**:
  - Interactive cards now feature `:active:scale-[0.985]` tactile press states and subtle border transitions.
  - Passive informational cards do not exhibit cursor pointer or hover lift.
- **Global Navigation & Layout (`src/components/layout/AppLayout.tsx`)**:
  - Marketing, consultation, report, and admin routes wrap page content in a smooth `pageFadeVariant` upward fade.
  - The Calculator Wizard remains cleanly isolated to ensure zero performance overhead and zero layout jumps during calculation updates.

### E. Modals, Drawers & Overlays
- **Fixed `AnimatePresence` Lifecycle**:
  - Wrapped modal bodies conditionally inside `<AnimatePresence>` across:
    - `src/components/ui/Modal.tsx`
    - `src/components/modals/PackageComparisonModal.tsx`
    - `src/components/modals/SavedEstimationsModal.tsx`
    - `src/components/modals/UnlockReportModal.tsx`
    - `src/features/consultation/components/ConsultationBookingModal.tsx`
    - `src/features/consultation/components/MyConsultationsModal.tsx`
    - `src/features/planner/PlannerPage.tsx` (Share, Reset, Help dialogs)
- **Accessibility & Focus Management**:
  - Added global <kbd>Escape</kbd> keyboard listeners to all modals.
  - Added native Tab / Shift+Tab focus trap to `<Modal />` to contain focus inside active dialogs.
  - Backdrop click-outside dismissal enabled on all non-destructive modals.
  - Background body scrolling locked (`document.body.style.overflow = 'hidden'`) while overlays are mounted.
  - Converted outer portal containers to `<motion.div>` with `exit={{ opacity: 0 }}` so unmounted portals cannot linger or intercept clicks.

### F. Expandable Disclosures & Accordions
- **Reconciled Cost Transparency (`HowWeCalculatedThis.tsx`)**:
  - Replaced raw CSS collapse with `<AnimatePresence>` and `accordionVariant`.
  - Formula details expand and collapse smoothly with natural panel timing (`220ms`).
- **Ancillary Spaces (`Step2SpaceRequirements.tsx`)**:
  - "Specialized & Ancillary Spaces" accordion now expands smoothly with zero height snapping or layout pop.
- **Landing Page FAQ (`FaqSection.tsx` & `Accordion.tsx`)**:
  - Modernized with `accordionVariant`, rotating chevron icon, and standard ARIA `aria-expanded` attributes.

### G. 3D Architectural Viewer
- **Viewer Controls (`Architectural3DViewer.tsx`)**:
  - All 7 floating toolbar controls (Turntable auto-rotate, Reset View, Preset Views, Layers, Finishes, Lighting, Help) enhanced with `:active:scale-90`, `transition-all duration-150`, and `focus-visible:ring-2`.
  - UI overlays animate independently without triggering expensive re-renders or camera resets of the WebGL three.js canvas.

---

## 3. QA Audit: Confirmed Defects Found & Repaired

During this regression audit pass, the following defects were diagnosed and repaired:

| Defect ID | Severity | File(s) | Description & Root Cause | Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **QA-DEF-01** | High | `PackageComparisonModal.tsx`<br>`SavedEstimationsModal.tsx`<br>`UnlockReportModal.tsx`<br>`ConsultationBookingModal.tsx`<br>`MyConsultationsModal.tsx` | **Missing Body Scroll Lock**: When modals were opened, the underlying page could still scroll, creating visual disorientation and accidental background interactions. | Added `document.body.style.overflow = 'hidden'` on mount and cleanup reset on unmount across all 5 modals. |
| **QA-DEF-02** | High | All 6 modal components | **Non-Motion Portal Container**: Direct child of `<AnimatePresence>` was a non-motion `div`. Could lead to lingering invisible hitboxes or abrupt unmounts before child exits resolved. | Converted root portal container to `<motion.div key="..." initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>` with `role="dialog"` and `aria-modal="true"`. |
| **QA-DEF-03** | Medium | `src/components/ui/Modal.tsx` | **Focus Escaping Dialog**: Pressing <kbd>Tab</kbd> or <kbd>Shift+Tab</kbd> within dialogs could cycle keyboard focus to hidden inputs in the underlying page. | Implemented native focus containment trap cycling focus strictly between first and last focusable elements inside the modal. |
| **QA-DEF-04** | Critical | `ConsultationBookingModal.tsx` | **TypeScript Syntax & Null Pointer Error**: Unclosed parenthesis on step 4 conditional expression and unguarded `consultant.id` inside submission callback caused `tsc -b` failure. | Added closing parenthesis `)}` and guarded `if (!consultant) return;` at entry of `handleInitiatePaymentAndSubmit`. |
| **QA-DEF-05** | Low | `variants.ts` & `motionTokens.ts` | **Node Test Environment ReferenceError**: `window.matchMedia` evaluated directly during test suite runs caused Vitest failure in Node environment. | Guarded with `typeof window !== 'undefined'` and verified mock behavior in unit tests. |

---

## 4. Verification & Automated Test Results

### A. Vitest Automated Test Suite
- Executed `npm test` across all 29 test suites.
- **Result**: **391 / 391 tests passed** (29 test files) with exit code 0.
  - Foundation master & direct construction budget: Passed.
  - RCC concrete volumes & block transparency: Passed.
  - 3-Package Construction Standards System & physical quantity invariance: Passed.
  - Authority bylaws & BUA calculation: Passed.
  - Price override & admin rate propagation: Passed.
  - Single source of truth PDF pipeline & QA Gate: Passed.
  - Motion tokens, natural easings, and slider math: Passed (15/15 tests).

### B. Production Build
- Executed `npm run build` (`tsc -b && vite build`).
- **Result**: **Build passed cleanly in 33.74s** with exit code 0.
- All TypeScript types verified with 0 errors.

---

## 5. Browser & Viewport Coverage Status

| Environment / Viewport | Method | Result / Status | Notes |
| :--- | :--- | :--- | :--- |
| **Local Dev Server** | `npm run dev` (Vite) | **Running (Port 3000)** | Actively serving application and handling API proxy requests. |
| **Unit & Integration Suite** | Vitest v3.2.7 | **391 / 391 Passed** | Validates calculation rules, navigation reachability, and motion logic. |
| **Production Bundle** | Vite v6.4.3 + Rollup | **Built Cleanly** | Validates tree-shaking, CSS bundling, and zero syntax/type errors. |
| **Interactive Browser Subagent** | `browser_subagent` | **503 Provider Outage** | Automated remote browser agent encountered persistent upstream 503 capacity errors from the `gemini-3-flash` server provider. Interactive video recordings were not capturable during this remote service interruption. |

---

## 6. Known Limitations & Untested Areas

1. **Remote Subagent Browser Recording**: The remote `gemini-3-flash` subagent service returned HTTP 503 capacity errors during automated browser runs. Full manual verification by the user in a local browser (Chrome/Edge/Firefox) is recommended.
2. **WebGL 3D Hardware Canvas**: Architectural 3D viewer rendering depends on client GPU support. On low-end mobile devices without WebGL 2.0, fallback flat visual indicators are shown.
3. **Live Payment Gateway**: Razorpay checkout triggers graceful fallback simulation when live client API keys are in test mode.

---

## 7. Modified & Created Files Summary

- `MOTION_POLISH_AUDIT.md`: Pre-implementation audit and architectural roadmap.
- `MOTION_POLISH_REPORT.md`: This comprehensive QA verification report.
- `src/animations/motionTokens.ts`: Centralized motion timing, natural easings, and reduced-motion detection.
- `src/animations/variants.ts`: Shared Framer Motion variants (page, modal, backdrop, accordion, drawer).
- `src/animations/__tests__/motion_and_interaction.test.ts`: Automated test suite for motion tokens and slider math.
- `src/styles/globals.css`: Button active states, focus rings, dynamic slider `--range-progress` fill, counter buttons.
- `src/components/ui/Button.tsx`: Added non-shifting loading spinner, `:active:scale-[0.985]`, focus rings.
- `src/components/ui/Input.tsx`: Swapped `transition-all` for `transition-colors duration-150`, error states.
- `src/components/ui/Select.tsx`: Focus and error color transitions without dimension shifts.
- `src/components/ui/Card.tsx`: Tactile press feedback on interactive cards.
- `src/components/ui/Slider.tsx`: New accessible, native range slider with dynamic green active track.
- `src/components/ui/Modal.tsx`: Upgraded with `AnimatePresence`, `modalScaleVariant`, Escape key, focus containment trap, and scroll lock.
- `src/components/common/Accordion.tsx`: Standardized with Hutty tokens, `accordionVariant`, and ARIA semantics.
- `src/components/common/HowWeCalculatedThis.tsx`: Integrated `accordionVariant` for formula disclosure.
- `src/components/3d/Architectural3DViewer.tsx`: Tactile `:active:scale-90` on all 7 toolbar buttons.
- `src/components/layout/AppLayout.tsx`: Smooth page route entrance animation (`opacity: 0, y: 6 -> 1, 0`).
- `src/components/modals/PackageComparisonModal.tsx`: Wrapped inside `AnimatePresence` with Escape listener, body scroll lock, and motion portal.
- `src/components/modals/SavedEstimationsModal.tsx`: Wrapped inside `AnimatePresence` with Escape listener, body scroll lock, and motion portal.
- `src/components/modals/UnlockReportModal.tsx`: Upgraded to animated backdrop, Escape listener, body scroll lock, and motion portal.
- `src/features/consultation/components/ConsultationBookingModal.tsx`: Upgraded to `AnimatePresence` with Escape listener, body scroll lock, motion portal, and type guards.
- `src/features/consultation/components/MyConsultationsModal.tsx`: Upgraded to `AnimatePresence` with Escape listener, body scroll lock, and motion portal.
- `src/features/planner/PlannerPage.tsx`: Migrated share, reset, and help dialogs to unified `Modal` component.
- `src/features/planner/LivePreviewPanel.tsx`: Wrapped formula inspector in `AnimatePresence`.
- `src/features/planner/steps/Step1BasicInfo.tsx`: Converted plot length, width, and BUA sliders to dynamic green fill tracks.
- `src/features/planner/steps/Step2SpaceRequirements.tsx`: Specialized spaces accordion wrapped in `AnimatePresence`.
- `src/features/landing/sections/HeroSection.tsx`: Tactile feedback on plot preset and floor selector buttons.
- `src/features/landing/sections/FaqSection.tsx`: FAQ answers wrapped in `AnimatePresence` with `accordionVariant`.
