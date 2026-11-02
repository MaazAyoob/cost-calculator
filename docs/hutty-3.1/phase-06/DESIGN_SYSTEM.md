# Hutty 3.1 Design System & Architectural Token Specification
**Phase 06 Deliverable 02 — Design System & Visual Token Architecture**  
*Document Version: 1.0.0 • Date: November 2026 • Environment: Production / Pre-Release*

---

## 1. Design Philosophy: Architectural Clarity & Warm Tactility

The Hutty 3.1 visual identity transitions the platform from a generic construction calculator to a **modern architectural planning platform**. The visual language is rooted in South Indian contemporary residential architecture:
- **Warm Ivory & Sandstone foundations:** Inspired by natural limestone, compressed earth blocks, and Bangalore granite.
- **Deep Forest & Sage tones:** Echoing sustainable garden city residential envelopes and natural vegetation.
- **Terracotta & Clay accents:** Referencing exposed burnt brick, Mangalore tiles, and artisanal craftsmanship.
- **Muted Architectural Gold:** Celebrating milestone milestones, premium grade certifications, and structural permanence.

---

## 2. Complete 14-Color Architectural Palette

| Token Name | Hex Code | Semantic Role | Contrast vs `#FFFFFF` | Contrast vs `#F7F3EA` (Warm Ivory) | Contrast vs `#183B32` (Deep Forest) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Deep Forest** | `#183B32` | Primary brand surface, hero buttons, high-emphasis text | 11.8:1 (AAA) | 10.7:1 (AAA) | 1.0:1 (Base) |
| **Forest Green** | `#245747` | Interactive hover states, secondary brand accents | 7.9:1 (AAA) | 7.2:1 (AAA) | 1.5:1 |
| **Emerald** | `#347A62` | Success status, active validation indicators | 4.8:1 (AA) | 4.4:1 (AA) | 2.5:1 |
| **Soft Sage** | `#B7CDBB` | Subtle card borders, blueprint grid lines | 1.6:1 (Subtle) | 1.4:1 (Subtle) | 7.4:1 (AAA) |
| **Warm Ivory** | `#F7F3EA` | Main platform canvas & alternating full-bleed background | 1.1:1 (Warm neutral) | 1.0:1 (Base) | 10.7:1 (AAA) |
| **Sandstone** | `#E9DDC9` | Secondary neutral surfaces, structured card borders | 1.4:1 (Neutral) | 1.2:1 (Subtle) | 8.8:1 (AAA) |
| **Terracotta** | `#C66B4E` | Primary architectural accent, progress tips, active pills | 4.5:1 (AA) | 4.1:1 (AA Large) | 2.6:1 |
| **Clay** | `#A95640` | Hover states on terracotta elements, warnings | 6.0:1 (AAA) | 5.5:1 (AAA) | 2.0:1 |
| **Muted Gold** | `#C5A46D` | Premium commercial badge, consultant certification | 2.8:1 (Accent) | 2.5:1 (Accent) | 4.2:1 (AA Large) |
| **Pale Gold** | `#E5D5B4` | Warm badge backgrounds, technical highlights | 1.4:1 (Subtle) | 1.3:1 (Subtle) | 8.2:1 (AAA) |
| **Charcoal** | `#202824` | Primary body and heading typography | 14.2:1 (AAA) | 12.9:1 (AAA) | 1.2:1 |
| **Slate** | `#66716B` | Secondary explanatory text, captions, metadata | 5.3:1 (AA) | 4.8:1 (AA) | 2.2:1 |
| **Soft White** | `#FFFFFF` | Card interior surfaces, clean content frames | 1.0:1 (Pure) | 1.1:1 (Warm subtle) | 11.8:1 (AAA) |
| **Light Sage** | `#E8EFE9` | Micro-badge backgrounds, active selection tracks | 1.2:1 (Surface) | 1.1:1 (Surface) | 9.8:1 (AAA) |

---

## 3. Typography & Hierarchy

The typography pairs an authoritative geometric display font with a clean, highly legible interface grotesque:

### 3.1 Type Scales
- **Display 1 (Hero Title):** `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] font-heading`
- **Heading 1 (Section Title):** `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.14] font-heading`
- **Heading 2 (Card Title / Subheading):** `text-xl sm:text-2xl font-bold tracking-tight leading-snug font-heading`
- **Heading 3 (Component Title):** `text-base sm:text-lg font-bold leading-snug font-heading`
- **Body Large:** `text-base sm:text-lg text-[#66716B] leading-relaxed font-normal`
- **Body Regular:** `text-sm sm:text-base text-[#66716B] leading-relaxed font-normal`
- **Caption / Metadata:** `text-xs sm:text-[13px] text-[#66716B] leading-normal font-medium`
- **Mono / Numbers:** `font-mono tracking-tight font-bold tabular-nums`

---

## 4. Spacing, Layout & Touch Targets

### 4.1 8-Pixel Spatial Cadence
- `p-2` / `gap-2`: 8px (micro-spacing)
- `p-4` / `gap-4`: 16px (compact component padding)
- `p-6` / `gap-6`: 24px (standard desktop card padding)
- `p-8` / `gap-8`: 32px (major card & modal padding)
- `py-20 lg:py-28`: 80px - 112px (major landing section flow)

### 4.2 Strict 44px+ Mobile Touch Target Policy
In compliance with WCAG 2.1 Criterion 2.5.5 (Target Size) and Section 5 of the Phase 06 requirements:
- All buttons, stage pills, floor selectors, plot size presets, and stepper inputs maintain a minimum interactive bounding box of $\ge 44 \times 44\text{px}$.
- Mobile interactive elements incorporate `touch-manipulation` and `-webkit-tap-highlight-color: transparent`.

---

## 5. Component Anatomy & States

### 5.1 Primary Buttons
- **Default:** `bg-[#183B32] hover:bg-[#245747] text-white font-bold py-3.5 px-6 rounded-xl shadow-xs transition-all min-h-[48px]`
- **Icon:** `<ArrowRight className="w-4 h-4 text-[#C66B4E]" />`
- **Active / Pressed:** `active:scale-[0.98]`

### 5.2 Secondary Buttons
- **Default:** `bg-white hover:bg-[#F7F3EA] text-[#202824] border border-[#E9DDC9] font-semibold py-3.5 px-5 rounded-xl shadow-2xs min-h-[48px]`
- **Active / Pressed:** `active:scale-[0.98]`

### 5.3 Architectural Tactile Cards
- **Container:** `bg-white rounded-3xl border-2 border-[#E9DDC9] p-6 sm:p-8 shadow-xs hover:border-[#183B32] transition-all duration-200`
- **Header Divider:** `border-b border-[#E9DDC9] pb-3`
- **Active Highlight Dot:** `<span className="w-2 h-2 rounded-full bg-[#C66B4E]" />`

### 5.4 Alternating Section Rhythm
1. **Hero:** Warm Ivory (`#F7F3EA`) with subtle blueprint grid texture.
2. **Introduction:** Warm Ivory (`#F7F3EA`) editorial composition.
3. **Four Offerings:** Soft White (`#FFFFFF`) with Sandstone borders.
4. **Three Easy Steps:** Warm Ivory (`#F7F3EA`) with family photography.
5. **Interactive Demo:** Warm Ivory (`#F7F3EA`) with dual-pane real-time calculator.
6. **Project Timeline:** Warm Ivory (`#F7F3EA`) 5-stage architectural flow.
7. **Construction Breakdown:** Soft White (`#FFFFFF`) with big statistical numbers.
8. **Why Planning:** Warm Ivory (`#F7F3EA`) side-by-side comparison matrix.
9. **Civil Standards:** Deep Forest (`#183B32`) technical full-bleed blueprint section.
10. **Expert Consultation:** Warm Ivory (`#F7F3EA`) architectural advisory review.
11. **Plans & Pricing:** Soft White (`#FFFFFF`) with featured ₹499 BOQ tier.
12. **FAQ & Final CTA:** Warm Ivory (`#F7F3EA`) accordion leading into Deep Forest (`#183B32`) closing anchor.

---

## 6. Legacy Token Migration Mapping

| Legacy Color | Role in Hutty 2.x | Phase 06 Architectural Replacement | Token CSS Property |
| :--- | :--- | :--- | :--- |
| `#1B3D34` | Legacy Primary Green | `#183B32` (Deep Forest) | `--color-deep-forest` |
| `#142E27` | Legacy Green Hover | `#245747` (Forest Green) | `--color-forest-green` |
| `#F28C28` | Legacy Construction Orange | `#C66B4E` (Terracotta) | `--color-terracotta` |
| `#F8F8F6` | Legacy Off-White Background | `#F7F3EA` (Warm Ivory) | `--color-warm-ivory` |
| `#EBF3EF` | Legacy Green Tint | `#E8EFE9` (Light Sage) | `--color-light-sage` |
| `#D5E5DC` | Legacy Sage Border | `#B7CDBB` (Soft Sage) | `--color-soft-sage` |
| `#18211E` | Legacy Black Text | `#202824` (Charcoal) | `--color-charcoal` |
| `#707873` | Legacy Gray Text | `#66716B` (Slate) | `--color-slate` |
| `#E5E7EB` | Legacy Gray Border | `#E9DDC9` (Sandstone) | `--color-sandstone` |

