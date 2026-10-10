# Hutty — Motion, Interaction & Control Audit

**Date**: 2026-10-10  
**Scope**: Website-wide motion design, interaction feedback, control polish, accessibility, and performance.  
**Standard**: Architectural, restrained, Apple-grade interaction design, Google-grade clarity, no decorative fluff.

---

## 1. Inventory of Routes, Layouts & Key Surfaces

| Route / Surface | File Location | Key Interactive Elements | Current Animation State |
| :--- | :--- | :--- | :--- |
| **Landing Page** (`/`) | `src/features/landing/LandingPage.tsx` | Hero massing controller, plot presets, signature sliders, interactive demo, FAQ accordion | Fragmented `framer-motion` variants; custom inline durations (0.3s–0.5s); FAQ accordion transitions abruptly. |
| **Calculator Wizard** (`/calculator`, `/planner`) | `src/features/planner/PlannerPage.tsx` | Step transitions, sticky desktop action bar, mobile fixed bar, package modals, formula modal, room steppers | Step transition exists via `AnimatePresence`; modal dialogs unmount abruptly without exit animations. |
| **Live Preview Panel & 3D Viewer** | `src/features/planner/LivePreviewPanel.tsx`, `Architectural3DViewer.tsx` | 3D toolbar (7 controls), orbit badge, live animated metrics, formula inspector | Toolbar buttons have hover color change but lack tactile pressed states; formula inspector lacks `<AnimatePresence>`. |
| **Calculation Transparency** | `src/components/common/HowWeCalculatedThis.tsx` | Formula & rate accordion disclosure | Expands/collapses instantaneously without height/opacity transition. |
| **Space Requirements** | `src/features/planner/steps/Step2SpaceRequirements.tsx` | Room steppers, expandable specialized spaces disclosure | Steppers have micro-press scale; specialized spaces disclosure pops open without animation. |
| **Basic Info & Range Sliders** | `src/features/planner/steps/Step1BasicInfo.tsx` | Plot length/width sliders, BUA slider, archetype cards | `.hutty-slider` has solid gray track with no active filled progress; thumb lacks active tactile states. |
| **Modal Overlays** | `src/components/modals/*`, `src/components/ui/Modal.tsx` | Unlock Report, Package Comparison, Saved Estimations, Booking | Early `if (!isOpen) return null` bypasses `<AnimatePresence>` exit transitions; backdrops pop out. |
| **Shared Controls** | `src/components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`, `Card.tsx` | Primary/Secondary buttons, input fields, selects, cards | Inconsistent active press feedback; button loading state causes horizontal layout shift. |
| **Consultation & Booking** | `src/features/consultation/*` | Consultant cards, filter pills, multi-step booking modal | Booking modal unmounts abruptly; tabs and filter pills lack shared active transition tokens. |
| **Admin & Pricing** | `src/features/admin/*`, `src/features/pricing/*` | Trade price overrides, rate sliders, plan cards | Range sliders share `.hutty-slider` track issue; pricing cards lack tactile micro-interactions. |

---

## 2. Global CSS, Tailwind & Design Tokens Audit

### Existing Design Tokens
- **Primary Brand Green**: `#1B3D34`
- **Brand Hover**: `#142F28`
- **Roof Accent Orange**: `#F28C28` (sparingly used)
- **Accent Hover**: `#D9771A`
- **Secondary Text**: `#4B5563` / `#687770`
- **Light Surface / Background**: `#FFFFFF` / `#F8F8F6`
- **Architectural Borders**: `#E5E7EB` / `#E3E8E2` / `#CBD5CB`

### Identified Gaps in CSS
1. **Button Micro-Interactions**: `.hutty-btn-primary` and `.hutty-btn-secondary` in `globals.css` define `:hover` states, but lack `:active` (pressed feedback) and `:focus-visible` ring styling.
2. **Range Sliders**: `input[type="range"].hutty-slider` has a fixed `#E5E7EB` track with no dynamic fill for current progress (`linear-gradient(to right, #1B3D34 ...)`). The thumb does not have a pressed state (`:active`).
3. **Card Selection**: `.hutty-selectable` and `.hutty-tactile-card` have slight timing discrepancies (0.15s vs 0.16s vs 0.2s).
4. **Reduced Motion**: CSS has a global `@media (prefers-reduced-motion: reduce)` block, but JavaScript Framer Motion animations bypass CSS duration overrides unless explicit reduced motion hooks/variants are utilized.

---

## 3. Framer Motion Architecture Audit

### Current `src/animations/variants.ts`
- `pageFadeVariant`: `duration: 0.25, ease: 'easeOut'`, exit `duration: 0.15, ease: 'easeIn'`.
- `drawerSlideVariant`: spring `stiffness: 300, damping: 30`.
- `bottomSheetVariant`: spring `stiffness: 350, damping: 32`.
- `modalScaleVariant`: spring `duration: 0.3, bounce: 0.15` (violates natural non-bouncy architectural motion).
- `containerStaggerVariant` & `itemFadeUpVariant`: delay and stagger tokens.

### Gaps
1. **Spring Bounciness**: `bounce: 0.15` causes slight rubber-band bouncing in dialogs, contrary to the architectural, restrained Apple/Google design aesthetic.
2. **Timing Hierarchy**: No standardized hierarchy matching the system requirements:
   - Fast feedback: 120–180 ms
   - Standard controls: 150–220 ms
   - Panels & dropdowns: 180–260 ms
   - Cards & dialogs: 200–300 ms
   - Page & step transitions: 220–350 ms
3. **Reduced Motion**: Variants lack reduced motion awareness.

---

## 4. Planned Polish Implementation Plan

### Phase A: Centralized Motion System (`src/animations/motionTokens.ts` & `variants.ts`)
- Define strict timing and easing constants:
  - `EASING_NATURAL = [0.16, 1, 0.3, 1]` (Apple-style natural deceleration).
  - Standardized durations: `FAST = 0.15s`, `CONTROL = 0.18s`, `PANEL = 0.22s`, `DIALOG = 0.25s`, `PAGE = 0.28s`.
- Update variants with zero bounce, subtle transforms (scale 0.98, translateY 4–8px), and reduced-motion fallbacks.

### Phase B: Buttons & Controls Polish (`globals.css`, `Button.tsx`)
- Standardize `.hutty-btn-primary`, `.hutty-btn-secondary`, and `<Button />`:
  - Consistent `:active:scale-[0.98]` tactile press without layout shifts.
  - Consistent `:focus-visible:ring-2 :focus-visible:ring-[#1B3D34]`.
  - Fix loading state in `<Button />`: absolute/overlay spinner or reserved icon space to eliminate button width jumping.
  - Distinct destructive button styling with calm, clear contrast.

### Phase C: Sliders & Range Inputs (`globals.css`, `Step1BasicInfo.tsx`, `Slider.tsx`)
- Provide a reusable `<Slider />` component or enhanced `hutty-slider` class with dynamic CSS variable `--range-progress` creating a filled `#1B3D34` active track.
- Tactile `:active` thumb state (scale 1.1 with deep Hutty green).
- Clean keyboard interaction (Left/Right arrow navigation) and accessible ARIA attributes.

### Phase D: Modals & Overlays (`Modal.tsx`, `PackageComparisonModal.tsx`, `SavedEstimationsModal.tsx`, etc.)
- Fix `<AnimatePresence>` wrapping across all modals: move conditional checks inside `<AnimatePresence>` so exit animations actually play.
- Smooth backdrop fade (`0.2s`) and modal scale (`scale: 0.98` -> `1`, `y: 6px` -> `0`).
- Ensure keyboard <kbd>Escape</kbd> and backdrop clicks smoothly dismiss without blocking clicks.

### Phase E: Expandable Panels & Disclosures (`HowWeCalculatedThis.tsx`, `Step2SpaceRequirements.tsx`)
- Add smooth height + opacity transitions (`duration: 0.22s`, `overflow-hidden`) using `AnimatePresence` to replace jarring instant pops.

### Phase F: 3D Toolbar & Calculator Interactivity
- Add `:active:scale-95` tactile feedback to 3D canvas toolbar buttons.
- Ensure animated cost displays continue strictly rendering real canonical numbers.
- Confirm keyboard navigation (<kbd>Enter</kbd> to continue safely, <kbd>Escape</kbd> to close).

### Phase G: Verification & Automated Tests
- Run complete test suite (`npm test`).
- Run production build (`npm run build`).
- Validate across desktop (1280×585, 1440×900), tablet, and mobile (390×844).
- Verify `prefers-reduced-motion` suppresses transforms and transitions cleanly.
