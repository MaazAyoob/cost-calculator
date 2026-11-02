# HUTTY 3.1 — PHASE 01: PROTECTED SYSTEMS & INVARIANT BOUNDARIES
## Comprehensive Inventory of Protected Code, Mathematical Rules, Database Schemas & Production Guardrails

> **Document ID:** `HUTTY-3.1-DOC-H-PROTECTED-SYSTEMS`  
> **Status:** Completed & Authoritative  
> **Date:** October 31, 2026  
> **Author:** Antigravity Senior Product Architect & Full-Stack Lead  
> **Enforcement Level:** Non-Negotiable Architectural Constraint Across All Future Phases

---

## 1. Architectural Guardrails & Protected Principles

The Hutty platform was developed and audited through five exhaustive engineering phases. It represents an enterprise-grade construction intelligence system.

To prevent regressions, the following systems are formally declared **PROTECTED**. During Phase 02 and all subsequent frontend transformations, developers and autonomous agents are strictly forbidden from modifying, refactoring, or bypassing these modules.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 6 PROTECTED ARCHITECTURAL PILLARS                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Structural Calculation Formulas & IS-456 Rules (Zero arbitrary tampering)         │
│ 2. Linear Dependency Pipeline in calculator.ts (15-step DAG preserved)                │
│ 3. Brand Invariance Principle (Brands affect rates only, NOT physical quantities)     │
│ 4. Cashfree Payment Integration & Webhook Signatures (Durable financial integrity)   │
│ 5. PostgreSQL Database Schema & Prisma Migrations (Zero destructive alterations)      │
│ 6. Customer Authentication, JWT Security & Admin RBAC (Uncompromised permissions)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Protected Codebase Inventory & Source References

---

### Pillar 1: The Master Calculation Engine (`src/calculation-engine/`)

The calculation engine is a pure, deterministic TypeScript library with 807 automated unit tests. It must remain decoupled from React and the UI.

| Subsystem / Module | Source File Path | Line Range | Invariants & Protection Rules |
| :--- | :--- | :--- | :--- |
| **Master Orchestrator** | [`src/calculation-engine/calculator.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/calculator.ts) | Lines 1–378 | Maintains the strict 15-step sequential forward calculation chain. Zero circular dependencies. |
| **Built-Up Area & Setbacks** | [`src/calculation-engine/modules/bua.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/bua.ts) | Lines 1–365 | Mathematical setback geometry; ground coverage capped at 60% fallback; floor overhang factors. |
| **Canonical Space Model** | [`src/calculation-engine/modules/spaceModel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/spaceModel.ts) | Lines 1–320 | Room dimension benchmarks, perimeters, gross-to-net wall deductions, and carpet normalization. |
| **Structural Steel (IS-456)** | [`src/calculation-engine/modules/steel.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/steel.ts) | Lines 1–75 | Base rule: $2.80\text{ kg/sq.ft}$ (Ground) $+ 0.20\text{ kg/sq.ft/floor}$. Structural minimum $2.5\text{ kg/sq.ft}$. |
| **Cement & Concrete Mix** | [`src/calculation-engine/modules/cement.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/cement.ts), [`rcc.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/rcc.ts) | Lines 1–85, 1–125 | Volumetric concrete breakdown (footings, columns, slabs, plinth) and cement consumption benchmarks. |
| **Masonry & Blocks** | [`src/calculation-engine/modules/brick.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/brick.ts) | Lines 1–240 | 100% door and window opening deductions; AAC block coverage $1.2917\text{ sq.ft/block}$; 5% wastage. |
| **Flooring, Dado & Waterproofing**| [`src/calculation-engine/modules/flooring.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/flooring.ts) | Lines 1–210 | Room floor takeoff; 7ft bathroom dado; 2ft kitchen dado; 8% tile wastage; wet area waterproofing. |
| **Doors & Windows Schedules** | [`src/calculation-engine/modules/doors.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/doors.ts), [`windows.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/windows.ts) | Lines 1–150 each | Individual door counts and opening area deductions; NBC 2016 window ventilation area benchmarks. |
| **Electrical MEP Engine** | [`src/calculation-engine/modules/electrical.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/electrical.ts) | Lines 1–240 | Room-by-room point takeoff, conduit meters, and wire cross-sections (1.5, 2.5, 4.0, 6.0 sq.mm). |
| **Plumbing & Tanks Engine** | [`src/calculation-engine/modules/plumbing.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/plumbing.ts) | Lines 1–220 | CPVC hot/cold water supply, SWR drainage stacks, 135 lpcd water storage sizing (OHT and Sump). |
| **Finishing & Painting** | [`src/calculation-engine/modules/paint.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/paint.ts) | Lines 1–195 | Net internal walls + ceilings; acrylic putty; interior emulsion litres; exterior weatherproof litres. |
| **Labour Takeoff Schedule** | [`src/calculation-engine/modules/labour.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/labour.ts) | Lines 1–180 | Trade-by-trade labour itemization; benchmarked to 25%–28% of direct construction cost. |
| **Works BOQ (Section A)** | [`src/calculation-engine/modules/boq.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/boq.ts) | Lines 1–644 | Comprehensive itemized construction works BOQ. Every item: $\text{Amount} = \text{Quantity} \times \text{Rate}$. |
| **Budget & Reconciliation (Section D)** | [`src/calculation-engine/modules/budget.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/budget.ts) | Lines 1–245 | Strict zero-residual mathematical reconciliation: $C_{\text{total}} = C_{\text{direct}} + M + R + F + \text{GST}$. |
| **Automated QA Gate** | [`src/calculation-engine/modules/qaGate.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/src/calculation-engine/modules/qaGate.ts) | Lines 1–160 | Enforces non-negotiable structural and commercial checks. Halts PDF generation if any check fails. |

---

### Pillar 2: Core Engineering Invariants (Mathematical Rules)

1. **The Brand Invariance Law:**
   $$\frac{\partial Q_i}{\partial (\text{Brand Selection})} \equiv 0$$
   *Selecting UltraTech over ACC, or Tata Tiscon over Jindal Panther, updates unit rates and cost totals, but **NEVER** changes the physical quantities ($Q_i$) of steel, cement, or concrete.*
2. **The Zero-Residual Commercial Reconciliation Law:**
   $$\text{Residual} = C_{\text{total}} - \left( C_{\text{direct}} + M_{\text{contractor}} + R_{\text{contingency}} + F_{\text{prof}} + \text{GST} \right) \equiv 0.00$$
   *There can be zero unexplained discrepancy between direct construction costs and total project outlay.*
3. **The Multiplier Law:**
   $$\text{BOQ Line Amount} = \text{Math.round}(\text{Valid Quantity} \times \text{Valid Unit Rate})$$
   *No arbitrary magic numbers or unitemized overhead lumps are permitted in Section A.*

---

### Pillar 3: Database Models & Persistence (`prisma/schema.prisma`)

The PostgreSQL database schema is finalized and currently running in production. **No migrations or column drops are permitted during frontend phases.**

- **`User` Model:** Customer and Admin accounts, hashed credentials, roles (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`).
- **`Project` Model:** Persistent user projects, floor configurations, plot geometry, room snapshots.
- **`Calculation` Model:** Complete serialized `CalculationResult` JSON snapshots, inputs, outputs, and QA metadata.
- **`Consultation` Model:** Professional advisory bookings, customer notes, status, slot timings, and assigned consultants.
- **`PaymentOrder` & `Transaction` Models:** Cashfree transaction records, order IDs, payment gateway session tokens, amounts, status (`PENDING`, `PAID`, `FAILED`), and audit trails.
- **`UserEntitlement` Model:** Granular feature authorization flags (`DETAILED_BOQ`, `MATERIAL_SCHEDULE`, `FULL_PDF_REPORT`) linked by `userId` and `projectId`.

---

### Pillar 4: Cashfree Payment Gateway & Security

- **Server Handshake:** [`server/services/cashfreeService.ts`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/server/services/cashfreeService.ts) communicates securely with Cashfree APIs via HMAC cryptographic signing.
- **Payment Verification:** Webhook signatures and server-to-server verification endpoints (`/api/v1/payments/verify`) must remain untouched to prevent unauthorized entitlement unlocks.
- **Credential Protection:** API keys (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`) reside exclusively in server `.env` and are never leaked to the client bundle.

---

### Pillar 5: Customer & Admin Authentication Security

- **JWT Tokens:** Issued with standard expiration, stored in client `localStorage` via Zustand middleware, and validated via Bearer Authorization headers.
- **RBAC Enforcement:** Route guards protecting `/admin/*` and customer routes `/dashboard/*` must remain active.
- **Anonymous Entry Privilege:** The calculator must remain accessible to anonymous visitors without forced login.

---

## 3. Strict Prohibitions & What Developers Must NOT Do

During Phase 02 and all subsequent frontend implementation phases:
1. **DO NOT** convert Hutty into a simplistic "₹2,200 per sq.ft" flat-rate calculator. The physical quantity takeoff engine is the core asset of the company.
2. **DO NOT** remove or combine dedicated finishes selections (Flooring must remain Chapter 4; Doors & Windows must remain Chapter 5).
3. **DO NOT** introduce mandatory account registration before a visitor can view their preliminary estimate.
4. **DO NOT** modify unit rates directly inside UI component code. All rates flow through `rateService.ts` and `brandDatabase.ts`.
5. **DO NOT** execute destructive database schema migrations (`prisma migrate reset` or `db push --force-reset`).
6. **DO NOT** alter the Cashfree payment verification logic or allow unverified entitlement grants.
7. **DO NOT** commit or push changes to remote git repositories without explicit human authorization.

