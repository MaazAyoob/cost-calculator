# HUTTY — COMPLETE CUSTOMER EXPERIENCE UI/UX AUDIT
## Comprehensive Usability, Information Architecture & Design Audit for Homeowners

**Platform:** Hutty — Residential Construction Cost-Calculation & Planning Platform  
**Target Persona:** Non-technical homeowner planning a dream home (The "Investor's Wife" persona)  
**Evaluation Standard:** Apple/Google-inspired visual simplicity, calm architectural aesthetic, zero construction jargon prerequisite  
**Audit Date:** October 2026  
**Status:** Audit Completed — Implementation Roadmap Ready

---

### 1. Executive Summary

Hutty provides an extraordinary mathematical and engineering calculation engine capable of computing exact steel tonnage, cement bags, concrete volume, setbacks, and localized municipal bylaws. However, the existing user interface was previously structured from an **engineer's and developer's perspective** rather than a **homeowner's perspective**.

A homeowner who has never constructed a house faces overwhelming cognitive load:
- Encountering technical acronyms (**BUA**, **FAR**, **RCC**, **BOQ**, **Fe 550D**, **OPC 53**, **MEP**, **CFT**) without clear, everyday explanations.
- Navigating dense multi-input forms with conflicting sliders, presets, and technical planning checkboxes on a single screen.
- Lacking confidence on whether changes are saved before navigating between steps.
- Arriving at result screens dominated by dense tables, technical internal titles ("PRE-CONSTRUCTION COMMAND CENTER"), and raw engineering line items rather than a clear, human-readable breakdown of: **Materials**, **Labour**, **Other Costs**, and **Taxes**.
- Mobile navigation lacking dedicated account shortcuts for signed-in homeowners.

This audit details the exact UX friction points identified across the customer journey and specifies the systematic overhaul required to make residential construction planning effortless for every homeowner.

---

### 2. Full Homeowner Journey UX Audit

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Homepage &   │ ──> │ 2. Sign-Up &    │ ──> │ 3. Calculator   │ ──> │ 4. Review &     │ ──> │ 5. Dashboard,   │
│    Navigation   │     │    Login Flow   │     │    Step Wizard  │     │    Result Screen│     │    Reports & Acct│
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### Touchpoint 1: Homepage & Header Navigation

| Friction Point | Current Observation | Homeowner Impact | UX Overhaul Action |
| :--- | :--- | :--- | :--- |
| **Mobile Drawer Account State** | Mobile menu drawer only showed static links (`Calculate`, `Consult`, `Pricing`, `My Project`), omitting signed-in customer account tabs (`My Projects`, `My Reports`, `Profile`, `Sign Out`). When logged out, it lacked an obvious `Log In` button. | Mobile homeowners could not easily locate their saved projects or log out from their phones. | Add an authenticated customer profile card in the mobile drawer with links to `My Projects`, `My Reports`, `Profile`, and `Log Out`. Add an explicit `Log In` option for logged-out visitors. |
| **Header Dropdown Labels** | The "Resources" menu contained internal names like "Planning & BOQ FAQ" and "My Project Dashboard" rather than homeowner-friendly descriptions. | Homeowners who do not know what "BOQ" means are hesitant to click. | Rename to "Homeowner FAQ & Guides", "Building Standards", and "Material Market Prices". |
| **Trust Metrics & Claims** | Marketing copy had placeholder statistics ("10,000+ estimates") that lacked verified evidence. | Diminishes trust for cautious homeowners. | Replace with truthful, value-driven architectural propositions ("Direct calculation based on BBMP/BDA bylaws & verified Bangalore market rates"). |

---

### Touchpoint 2: Customer Authentication (Sign-Up, Login, Recovery)

| Friction Point | Current Observation | Homeowner Impact | UX Overhaul Action |
| :--- | :--- | :--- | :--- |
| **Sign-Up Copy & Tone** | Generic "Create an account" heading without reinforcing the immediate value of saving house plans. | Feels like a bureaucratic hurdle before using the calculator. | Update to reassuring, welcoming copy: **"Let's get your home project started."** with subtitle: *"Create an account to save your plans, track your estimates and access your reports whenever you need them."* |
| **Login Copy & Reassurance** | Generic "Welcome back" without confirming that previous project progress has been safely preserved. | Homeowner worries whether their earlier inputs survived. | Update to: **"Welcome back."** with subtitle: *"Your home project is saved. Log in to continue where you left off."* |
| **Password Visibility & Help** | Password fields lacked a quick toggle to view entered passwords while typing on mobile devices. | Frustrating mistypes on mobile leading to failed submissions. | Ensure password visibility toggle (`Eye` / `EyeOff`) is available on both login and sign-up with clear password criteria. |
| **Error Message Clarity** | Occasional technical error responses ("Registration failed: 400 Bad Request"). | Alarming and unhelpful. | Translate all error states into everyday language ("Please enter a valid email address.", "An account with this email already exists. Try logging in instead."). |

---

### Touchpoint 3: Calculator Wizard (Step-by-Step Experience)

| Screen / Step | Current Friction | Technical Jargon Identified | Usability Solution |
| :--- | :--- | :--- | :--- |
| **Step 0: Package Selection** | Cards featured technical specifications like "Indus Fe 500D", "GVT tiles", "uPVC Soundproof" without explaining what they mean for the homeowner's daily living experience. | `Fe 500D`, `GVT`, `uPVC` | Add plain-language homeowner subtitles: **Standard** (*Practical, cost-conscious construction with durable materials*), **Premium** (*Better finishes, upgraded fixtures, and soundproof windows*), **Luxury** (*High-end Italian marble, imported fixtures, and custom woodwork*). |
| **Step 1: Plot & Planning** | **Most overwhelming screen in the app.** Packed with: Quick Archetypes, Location cards, 2 Plot sliders + 2 numeric boxes, 4 Road width cards, Corner plot toggles, 3 Secondary boundary checkboxes, 5 Floor cards, 4 House type cards, 3 Parking cards, and a BUA slider with Setback warnings. | `Abutting Road Width`, `FAR limits`, `Setback clearance on secondary roads`, `Gross Built-Up Area (BUA)`, `RCC stilt` | **Implement progressive grouping & clear visual hierarchy:**<br>1. Group into clean, collapsible accordion/card sections.<br>2. Use everyday labels: *"Length (Front to Back)"*, *"Width (Left to Right)"*.<br>3. Provide an inline, plain-language explanation for Built-Up Area: *"The total covered floor area of your house across all floors combined."*<br>4. Move complex corner plot setback adjustments into an optional expandable helper. |
| **Step 2: Rooms & Spaces** | Ancillary rooms (Pooja, Utility, Office, Store) were collapsed with a technical count badge. Steppers were functional but lacked visual icons for rooms. | `Ancillary Spaces` | Rename to *"Additional Rooms (Pooja, Study, Utility, Store)"*. Display clean counters with tactile plus/minus buttons and instant built-up area feedback. |
| **Step 3: Core Materials** | Steel and cement options used dense civil engineering text: *"IS 2185 Part 3 lightweight thermal insulating blocks with polymer jointing"*, *"Fe 550D Super Ductile"*, *"OPC 53 Micro-particles"*. | `Fe 550D`, `OPC 53`, `Super Ductile`, `slump retention`, `IS 2185 Part 3` | Provide concise homeowner summaries:<br>- **Fe 550D Steel:** *"High-strength earthquake-resistant steel bars."*<br>- **Grade 53 Cement:** *"High-strength structural cement for foundations and slabs."*<br>- **AAC Blocks:** *"Lightweight, heat-insulating blocks that keep rooms cooler."* |
| **Steps 4–10: Finishes & Fixtures** | Dense lists of brands and specifications without clear guidance on how each selection affects the budget. | `Dado tiles`, `Lintel framing`, `CPVC SDR 11`, `MEP conduit` | Clearly distinguish: **Recommended**, **Standard**, and **Premium Upgrade**, displaying live cost impact badges where selections alter the estimated total. |
| **Wizard Top Navigation** | Compact header with multiple competing utility buttons (`Compare`, `Saved`, `Reset`, `Share`, `Help`, `Close`). | Information clutter | Streamline header: keep Hutty logo, project name, live auto-save status pill (`All changes saved`), and single prominent `Review & Estimate` action. |

---

### Touchpoint 4: Review Before Calculating

| Friction Point | Current Observation | Homeowner Impact | UX Overhaul Action |
| :--- | :--- | :--- | :--- |
| **Review Accessibility** | Review summary was only reachable by clicking a small "Review" tab at the very end of step 10. | Homeowners who wanted to double-check their plot or room choices felt trapped in a linear 10-step sequence. | 1. Add a prominent "Review All Choices" button in the wizard navigation.<br>2. Present a clean, card-based summary organized by **Plot & House**, **Rooms**, **Structural Materials**, and **Finishes & Fixtures**.<br>3. Provide an `Edit` action beside every section that jumps directly to that step.<br>4. Reassure the homeowner that reviewing is free and allows easy corrections. |

---

### Touchpoint 5: Results Screen & Project Summary (`/dashboard` & `/report`)

| Friction Point | Current Observation | Homeowner Impact | UX Overhaul Action |
| :--- | :--- | :--- | :--- |
| **Screen Title & Tone** | Titled `"YOUR HOME • PRE-CONSTRUCTION COMMAND CENTER"`, which feels like an industrial contractor tool. | Intimidates first-time homeowners. | Change heading to: **"Your Home Construction Estimate"** with reassuring subtitle: *"Based on your plot, floor plan, and selected material standards."* |
| **Cost Breakdown Structure** | Displayed a flat list of 7 technical rows (`Foundation & Structural Frame`, `Flooring & Wet Areas`, `Doors & Joinery`, `Windows`, `Electrical Wiring`, `Plumbing`, `Painting`). | Does not map to how homeowners think about construction expenses (Materials vs. Labor vs. Other Costs vs. Taxes). | Reorganize into **4 familiar, expandable categories**:<br>1. **Materials** (Civil structure, blocks, tiles, paint, pipes, cables)<br>2. **Labour and Work Costs** (Masonry, shuttering, plastering, plumbing & electrical labor)<br>3. **Other Costs** (Site supervision, scaffolding, contractor logistics, contingency)<br>4. **Taxes & Commercial Charges** (Applicable statutory GST & permits)<br>5. **Total Estimated Cost** (Prominent hero display). |
| **Estimate Disclaimer Visibility** | Estimate disclaimer was buried at the bottom or styled as a small warning. | Homeowners may misinterpret the estimate as a binding fixed-price contract. | Place the approved estimate notice prominently near the top cost card:<br>*"This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked."* |
| **Material Quantities Display** | Technical metrics like `8.64 Tonnes Steel`, `1,080 Bags Cement`, `48 m³ Concrete`, `10,752 Nos Blocks` without context. | Homeowners do not understand what `m³` or `Nos` mean. | Present in a clean, visual card grid explaining each unit (e.g. *8.6 Tonnes — Structural Steel*, *1,080 Bags — Foundation & Slab Cement*, *48 Cubic Metres — Ready-Mix Concrete*). |

---

### Touchpoint 6: Customer Account Dashboard (`/account`)

| Friction Point | Current Observation | Homeowner Impact | UX Overhaul Action |
| :--- | :--- | :--- | :--- |
| **Welcome Area** | Generic heading with technical account metadata. | Lacks personal warmth. | Display friendly greeting: **"Welcome back, [Customer Name]."** with subtitle: *"Your home projects and reports, all in one place."* and prominent **"Start a New Project"** CTA. |
| **Project Status Labels** | Displayed database enums (`SAVED`, `DRAFT`, `PLANNED`). | Feels like internal software status codes. | Replace with friendly human-readable badges: `Ready to Build`, `In Progress`, `Saved Estimate`. |
| **Empty States** | Empty tabs previously showed plain text without encouraging illustration or next-step guidance. | Confusing when a user first signs up. | Add warm, helpful empty states:<br>- No projects: *"Your home project starts here. Create your first project to explore costs, save your choices, and return whenever you're ready."* [Start a New Project]<br>- No reports: *"Reports you unlock will appear here. Download your basic PDF or detailed BOQ anytime."*<br>- No consultations: *"Your booked expert consultations will appear here."* |
| **Report Access Clarity** | The difference between the ₹99 Basic PDF and the ₹499 Detailed BOQ was not immediately obvious in the account list. | Homeowner might wonder which one they purchased. | Clearly badge each report: `₹99 Basic Estimate PDF` vs. `₹499 Detailed BOQ Dossier`, showing project name, date unlocked, and single-click download action. |

---

### 3. Usability Goals & Implementation Checklist

- [ ] **G1: Everyday Homeowner Language:** Eliminate unexplained acronyms (`BUA`, `FAR`, `RCC`, `BOQ`). Provide inline tooltips or natural English descriptions where technical terms are unavoidable.
- [ ] **G2: Calmer Wizard Layout:** Re-structure `Step1BasicInfo` with progressive disclosure, separating primary plot dimensions from secondary municipal road/setback details.
- [ ] **G3: Clear Step Progress:** Reassure the homeowner with a clear progress bar, step titles, and one primary action per screen (`Continue to Spaces →`, `Continue to Materials →`).
- [ ] **G4: Explicit Review Summary:** Make the full house plan summary accessible at any time so the homeowner can review or edit previous steps with one click.
- [ ] **G5: Structured Results Presentation:** Overhaul `DashboardPage` to present the estimate in 4 familiar groups (Materials, Labour, Other Costs, Taxes) with the mandatory disclaimer prominently visible.
- [ ] **G6: Responsive Mobile Experience:** Update `WebsiteHeader` mobile menu to provide an authenticated customer account drawer with direct shortcuts to `My Projects`, `My Reports`, `Profile`, and `Log Out`.
- [ ] **G7: Warm Empty & Loading States:** Implement skeleton loaders and encouraging empty states across the account portal and dashboard.
- [ ] **G8: Reassurance & Auto-Save:** Ensure the `All changes saved` badge is visible across the calculator header so homeowners never fear losing their work.
