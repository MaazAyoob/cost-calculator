# HUTTY 2.0 — USABILITY & ACCESSIBILITY AUDIT

**Audit Scope:** Full Customer Experience, 8-Stage Calculator, Progressive Disclosure & Supporting Pages  
**Target User Archetypes:**  
1. *Inexperienced Homeowner:* An ordinary individual who does not know construction terminology.  
2. *Older Grandparent:* Using a mobile phone with average eyesight, requiring large text and clear touch targets.  
3. *Young Learner (12-year-old):* Able to complete the planner intuitively without confusion.  
**Standard of Reference:** Simplicity of Google, clarity of Apple consumer products.

---

## 1. Flow-by-Flow Usability Assessment

### A. Homepage (`/`)
- **First Impression & Clarity:** The headline *"Understand your home before you build."* immediately establishes what Hutty does in ordinary words. Subheading explains cost planning before ground is broken.
- **Primary Action:** One prominent, high-contrast button *"Start Free Estimate"*. No sign-in required.
- **Cognitive Load:** Minimal. Unnecessary industry buzzwords ("synergistic BOQ synthesis", "statutory coverage coefficient") have been eliminated.
- **Usability Verdict:** **PASS**

### B. Navigation & Header
- **Desktop Layout:** Direct links to *How It Works*, *Pricing*, *Consult an Expert*, and *Sign In / Account*.
- **Mobile Menu:** Clean slide-out panel with large touch targets. Clicking *"Start Free Estimate"* directs directly to `/calculator` without forcing login.
- **Usability Verdict:** **PASS**

### C. 8-Stage Calculator Workflow (`/calculator`)

#### Stage 1: Your Plot
- *User Prompt:* "Where are you building?", "How big is your plot?".
- *Visual Aid:* Live 2D plot aspect box that dynamically scales as dimensions are entered, with a clear road frontage indicator.
- *Usability Rating:* Exceptional clarity for both dimensions (feet) and land authority selection.

#### Stage 2: Your Home
- *User Prompt:* "What kind of home are you planning?", "How many floors would you like?".
- *Clarity Breakthrough:* Replaces confusing engineering notation like "G+1" with explicit microcopy: *"Ground floor plus one upper floor"*.
- *Usability Rating:* Eliminates floor-count misinterpretation.

#### Stage 3: Your Rooms
- *User Prompt:* "How many rooms do you need?".
- *Controls:* Upgraded stepper controls with $44 \times 44\text{ px}$ clickable surfaces (`w-11 h-11`), high contrast numbers, and separate groups for essential rooms vs. optional spaces.
- *Usability Rating:* High accessibility for older users with lower dexterity.

#### Stage 4: Your Buildable Space
- *User Prompt:* "Let's work out how much space you can build on."
- *Spatial Clarity:* Explains the 4-step concept in plain words before showing numbers:
  1. Plot Boundary
  2. Clearances around your home (setbacks)
  3. Ground footprint you are permitted to build
  4. Total floor area across all floors
- *Usability Rating:* Successfully separates physical envelope from statutory coverage cap.

#### Stage 5: Construction Style
- *User Prompt:* "What type of construction are you considering?", "What kind of walling would you prefer?".
- *Plain English:* Explains RCC framed structure ("Columns & beams") vs. load-bearing masonry without structural engineering formulas.
- *Usability Rating:* Clear decision cards with visual icons.

#### Stage 6: Finishes & Materials
- *User Prompt:* Flooring, woodwork, bathroom fittings, and electrical finishes categorized into Standard, Premium, and Luxury packages with direct cost impact indicators.
- *Usability Rating:* Intuitive visual choice cards.

#### Stage 7: Your Estimate
- *User Prompt:* Transparent cost summary broken into Materials, Labour, and Services.
- *Reassurance:* Clear disclaimer that the estimate is an early planning guide, not a structural sanction. Reconciled headline total.
- *Usability Rating:* Calming, trustworthy, and free of pressure.

#### Stage 8: Detailed BOQ
- *User Prompt:* "See what your home may need, work by work."
- *Disclosure:* Work-by-work civil, plumbing, electrical, and finish schedules, with clear ₹499 and ₹1,499 upgrade options.
- *Usability Rating:* Highly transparent without overwhelming the earlier stages.

---

## 2. Progressive Disclosure Audit: "Details & Assumptions"

- **Visual Prominence:** Positioned consistently at the bottom of the active form container. Elegant chevron and folder icon.
- **Default State:** Collapsed by default across all 8 stages.
- **State Integrity:** Opening, exploring tabs, and closing never alters or resets any wizard inputs.
- **Language Layering:**
  - *Tier 1 (Surface):* Ordinary language summary (e.g. "We first calculate the space left after boundary gaps...").
  - *Tier 2 (Deep):* Secondary expandable toggle reveals the exact engineering formula, source rule, units, and inputs.
- **Usability Verdict:** **PASS** — Successfully solves the tension between consumer simplicity and engineering rigor.

---

## 3. Accessibility & Mobile Usability Verification

| Dimension | Standard / Target | Verified Result | Verdict |
| :--- | :--- | :--- | :--- |
| **Touch Targets** | Minimum $44 \times 44\text{ CSS px}$ | Steppers, stage tabs, and navigation CTAs meet $\ge 44\text{px}$ | **PASS** |
| **Color Contrast** | WCAG AA ($\ge 4.5:1$ text contrast) | Forest green on warm white ($> 9:1$), black text on white ($> 15:1$) | **PASS** |
| **Body Typography** | $\ge 16\text{px}$ base text size | Responsive scale: 16px mobile, 18px desktop; zero tiny grey text | **PASS** |
| **Viewport Scalability** | No horizontal scrolling on mobile | Clean vertical reflow at $390\text{px}$ (iPhone) and $768\text{px}$ (tablet) | **PASS** |
| **Keyboard Navigation** | Visible focus states & Tab order | Focus rings on active inputs, accessible drawer toggles | **PASS** |

---

## 4. Overall Usability Conclusion

The transformed interface successfully satisfies the **12-year-old and older grandmother test**:
- Users are never confronted with raw technical formulas on the main path.
- Every screen clearly answers: *What am I deciding?*, *What should I do?*, and *What happens next?*.
- Reversible navigation (Back / Continue) prevents anxiety about making mistakes.
- Complete preliminary cost estimate is accessible in under 2 minutes without creating an account or submitting private contact details.

