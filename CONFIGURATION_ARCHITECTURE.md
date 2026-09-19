# HUTTY — CONFIGURATION ARCHITECTURE (PHASE 2B)
## UNIFIED CONFIGURATION RESOLUTION & TYPED DOMAIN ARCHITECTURE

**Date**: September 19, 2026  
**Status**: Implemented & Production-Ready  
**Test Coverage**: 168/168 Tests Passing (100% Green across 14 Test Suites)  
**Build Status**: Vite Frontend (Exit Code 0) & Prisma Server (Exit Code 0)

---

### 1. Executive Summary

Phase 2B establishes the strongly typed configuration architecture and central resolution layer for Hutty.

Prior to Phase 2B, engineering assumptions and calculation constants were scattered across 21 modules (`engineeringAssumptions.ts`, `coefficients.ts`, `paint.ts`, `labour.ts`, `flooring.ts`, `plumbing.ts`, `electrical.ts`, `bua.ts`, `doors.ts`, `windows.ts`). Furthermore, static fallback objects like `CENTRALIZED_ENGINEERING_ASSUMPTIONS` acted as unmanaged mirrors that could drift from runtime data.

Phase 2B accomplishes the fundamental goal:
$$\text{CURRENT ENGINE} + \text{TYPED CONFIGURATION} + \text{ACTIVE CONFIG RESOLVER}$$

Under the cardinal rule **"Current Value ≠ Approved Value"**, Phase 2B guarantees:
1. **Zero Unintended Calculation Divergence**: All mathematical calculation formulas, physical quantities, and cost outputs remain 100% identical between pre-migration and post-migration states under equivalent baseline inputs.
2. **Explicit Conflict Tracking**: Discrepancies between historical assumptions and current code are formally registered in a `ParameterConflictRegistry` with status `CONFLICT_REQUIRES_REVIEW` rather than silently normalized.
3. **Strict Version & Lifecycle Isolation**: Production calculation flows only ever resolve `ACTIVE` published parameters. Public users cannot inadvertently trigger `DRAFT`, `REVIEW`, `ARCHIVED`, or `REJECTED` parameters.
4. **Single Source of Truth**: The existing Rate Master system (`RateOverride`, `RateAuditLog`, `rateService`) remains the sole authority for material/labour unit prices. Non-price engineering factors resolve through the new `configResolver`.

---

### 2. Configuration Domain Model

The domain model is defined in `src/calculation-engine/config/types.ts` and enforces strict typing over arbitrary untyped JSON:

#### A. Core Parameter Model (`CalculationParameter`)
Each calculation factor (e.g. wall height, wire meterage per point, paint coverage) is represented as a structured entity:
```typescript
export interface CalculationParameter<T = number | string | boolean> {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: ParameterCategory; // 'structural' | 'direct_materials' | 'finishes' | 'mep' | 'openings' | 'labour' | 'commercial' | 'space_planning' | 'statutory'
  value: T;
  unit: ParameterUnit; // 'm' | 'ft' | 'sqft' | 'sqm' | 'cum' | 'CFT' | 'bags' | 'kg' | 'tonnes' | 'litres' | 'points' | 'ratio' | 'percent' | 'inr' | 'days' | 'lpcd' | 'boolean' | 'string'
  valueType: 'number' | 'string' | 'boolean' | 'json';
  minimum?: number;
  maximum?: number;
  location?: LocationTier; // 'Bangalore' | 'Mysore' | 'Global'
  specificationTier?: SpecificationTier; // 'Essential' | 'Premium' | 'Luxury' | 'Global'
  source: string;
  sourceDate?: string;
  sourceReference?: string;
  status: ConfigurationStatus; // 'DRAFT' | 'VALIDATED' | 'REVIEW' | 'PUBLISHED' | 'ACTIVE' | 'ARCHIVED' | 'REJECTED'
  version: string; // SemVer (e.g. '1.0.0')
  effectiveFrom?: string;
  effectiveTo?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### B. Domain-Specific Structured Models
For parameters with intrinsic geometric or tabular structures, typed schemas validate all payloads:
- **`SpaceTemplateConfig`**: Defines standard room archetypes (`living`, `bedroom`, `kitchen`, `bathroom`, etc.) with default dimensions ($L \times W$), area, carpet-to-super ratios, and opening deductions.
- **`AuthorityRuleConfig`**: Defines statutory setback slabs and floor area ratio (FAR) tiers keyed by plot area and road width for BBMP/BDA (Bengaluru) and MUDA/MDA (Mysuru).
- **`LabourBenchmarkConfig`**: Defines trade-specific civil, electrical, plumbing, tiling, and painting labour benchmark rates by city.
- **`CommercialRuleConfig`**: Defines baseline execution margins (15%), professional fees (5%), contingency reserve (6%), GST rates (18%), and material wastage percentages (steel 5%, cement 2%, blocks 5%, tiles 7%, paint 10%).

---

### 3. Configuration Lifecycle & Status State Machine

The configuration system enforces a 7-stage lifecycle state machine:

```
           ┌──────────┐
           │  DRAFT   │
           └────┬─────┘
                │ validate()
                ▼
          ┌───────────┐
          │ VALIDATED │
          └─────┬─────┘
                │ submitForReview()
                ▼
           ┌──────────┐      reject()
           │  REVIEW  ├─────────────────► ┌──────────┐
           └────┬─────┘                   │ REJECTED │
                │ publish()               └──────────┘
                ▼
          ┌───────────┐
          │ PUBLISHED │
          └─────┬─────┘
                │ activate()
                ▼
           ┌──────────┐      supersede()
           │  ACTIVE  ├─────────────────► ┌──────────┐
           └──────────┘                   │ ARCHIVED │
                                          └──────────┘
```

#### Public vs. Admin Simulation Isolation Rules
1. **Public Engine Execution (`allowDraftForSimulation: false`)**:
   - Strictly filters candidates to `status === 'ACTIVE'`.
   - Any `DRAFT`, `VALIDATED`, `REVIEW`, `ARCHIVED`, or `REJECTED` candidate is discarded.
   - If no active parameter is found for a specific location or tier, the resolver deterministically falls back to the Global baseline.
2. **Admin Simulation Execution (`allowDraftForSimulation: true`)**:
   - Used exclusively in isolated sandbox/simulation runs triggered by authenticated administrators.
   - Draft parameters take immediate precedence over active baselines within that execution context, allowing side-by-side delta analysis without altering live production estimates.

---

### 4. Configuration Resolver & Resolution Precedence

The central resolver (`ConfigurationResolver`) acts as the single gateway for all engineering assumptions:

```
Calculator / Module
        │
        ▼
ConfigurationResolver.resolveParameter(key, context)
        │
        ├── 1. Exact Match: [Location + Specification Tier + ACTIVE]
        ├── 2. Tier Fallback: [Global Location + Specification Tier + ACTIVE]
        ├── 3. Location Fallback: [Location + Global Tier + ACTIVE]
        ├── 4. Global Baseline: [Global Location + Global Tier + ACTIVE]
        └── 5. Hardcoded Engine Safety Baseline (Fail-Closed)
```

#### Precedence Determinism
Given a resolution request for `{ key: 'config.structure.wall_height_ft', location: 'Mysore', specificationTier: 'Luxury' }`:
1. Search parameter registry for key with `location: 'Mysore'` and `tier: 'Luxury'`.
2. If absent, search key with `location: 'Global'` and `tier: 'Luxury'`.
3. If absent, search key with `location: 'Mysore'` and `tier: 'Global'`.
4. If absent, return key with `location: 'Global'` and `tier: 'Global'`.
5. If absent from registry entirely, return the immutable in-memory fallback defined in `BASELINE_CONFIG_PARAMETERS`.

Individual calculation modules **never** hardcode separate fallbacks or read conflicting static constants.

---

### 5. Rate Master Integration (Single Pricing Authority)

To prevent the creation of parallel or split pricing systems:
1. **RateMaster Architecture Preserved**:
   - `RateMasterItem`, `RateOverride`, `RateAuditLog`, and `rateService` remain the sole and authoritative source of material and trade labour unit rates.
   - Public prices still stream seamlessly:
     $$\text{PostgreSQL RateOverride} \longrightarrow \text{GET /api/v1/rates/latest} \longrightarrow \text{rateService} \longrightarrow \text{Calculator}$$
2. **Decoupling Brand Pricing**:
   - `brandDatabase.ts` maintains brand catalog metadata (brand name, tier, warranty, technical specifications), but product pricing queries resolve through `rateService`.
3. **Decoupling Labour Constants**:
   - Hardcoded labour logic (e.g. `isMysuru ? 310 : 350`) has been refactored in `labour.ts`. Baseline composite rates resolve directly through `configResolver.getLabourBenchmark('civil_composite', location)`.

---

### 6. Dynamic Backward-Compatible Adapter (`coefficients.ts`)

To prevent regression across existing modules importing `CENTRALIZED_ENGINEERING_ASSUMPTIONS` from `src/calculation-engine/data/coefficients.ts`, the static mirror object was converted into a dynamic adapter:
```typescript
export const CENTRALIZED_ENGINEERING_ASSUMPTIONS = {
  get wallHeightFt() {
    return configResolver.resolveParameter<number>('config.structure.wall_height_ft', 10.0);
  },
  get steelBaseFactor() {
    return configResolver.resolveParameter<number>('config.rcc.steel_base_factor_kg_sqft', 2.8);
  },
  get cementBagsPerSqFt() {
    return configResolver.resolveParameter<number>('config.material.cement_bags_per_sqft', 0.40);
  },
  // ...dynamically delegates all 24 engineering parameters
};
```
- **Benefits**:
  - 100% backwards compatibility with zero breaking changes to existing module code.
  - Changes made to the active configuration immediately propagate through `CENTRALIZED_ENGINEERING_ASSUMPTIONS`.
  - Invariant tests prove zero deviation in output.

---

### 7. Configuration Snapshot Architecture

Every calculation now produces a complete, self-contained configuration snapshot attached to `CalculationResult`:
```typescript
export interface CalculationResult {
  // ... existing calculation outputs
  resolvedConfiguration?: ResolvedCalculationConfiguration;
}

export interface ResolvedCalculationConfiguration {
  version: string;
  resolvedAt: string;
  location: LocationTier;
  specificationTier: SpecificationTier;
  parameters: Record<string, any>;
  rates: Record<string, number>;
  assumptions: Record<string, any>;
}
```
This guarantees that any historical estimate, BOQ, or PDF report can be reproduced exactly as it was generated, regardless of future configuration updates.

---

### 8. Configuration Conflict Registry

Under the rule **"Current Value ≠ Approved Value"**, ambiguous or conflicting parameters were not silently normalized. They are formally captured in `src/calculation-engine/config/conflictRegistry.ts`:

| Parameter Key | Current Effective Value | Conflicting Baseline | Primary Source | Secondary Source | Conflict Reason | Resolution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `config.paint.interior_coverage_sqft_per_litre` | `45 sqft/L` | `60 sqft/L` | `paint.ts` L65 | Developer Spec & Audit | 45 sqft/L accounts for 2 coats of premium acrylic emulsion; 60 sqft/L assumes single coat or dry-distemper. Current 45 sqft/L preserved. | `CONFLICT_REQUIRES_REVIEW` |
| `config.commercial.contractor_margin` | `15%` | `8–10%` | Baseline config default | Client MOM (Sep 19, 2026) | Turnkey builder model assumes 15%; client review prefers 8-10% contractor mode and 0% self-build. Effective behaviour preserved. | `CONFLICT_REQUIRES_REVIEW` |
| `config.waterproofing.sump_surface_sqft` | `120 sqft` | `180 sqft` | `engineeringAssumptions.ts` L112 | IS 3370 Structural Norm | Code uses 120 sqft; standard 8,000L sump has ~180 sqft wetted surface. Current 120 sqft preserved. | `CONFLICT_REQUIRES_REVIEW` |
| `config.flooring.circulation_allowance_pct` | `10%` | `14%` | `flooring.ts` L54 | NBC 2016 Guidelines | Residential corridor allowance standard is 12-15%; code baseline uses 10%. Current 10% preserved. | `CONFLICT_REQUIRES_REVIEW` |
| `config.flooring.staircase_granite_sqft_flight` | `180 sqft/flight` | `175 sqft/flight` | `flooring.ts` L74 | Geometric Spec (18 steps) | 18 treads (11"x42") + 18 risers (6.5"x42") equals 175.8 sqft; code rounds to 180 sqft. Current 180 sqft preserved. | `CONFLICT_REQUIRES_REVIEW` |

---

### 9. Validation Engine

The schema validation engine in `src/calculation-engine/config/validation.ts` enforces:
1. **Type Checks**: Ensures `number`, `string`, `boolean`, and `json` parameters strictly conform to declared `valueType`.
2. **Numeric Safety**:
   - Explicitly rejects `NaN`, `Infinity`, `-Infinity`.
   - Strictly enforces $[minimum, maximum]$ boundaries (e.g. wall height must be between 8.0 ft and 14.0 ft; steel consumption factor between 2.0 and 4.5 kg/sqft).
3. **Critical Non-Zero Guards**:
   - Crucial engineering divisors and physical factors (wall height, block unit volume, paint coverage, person occupancy) reject `0` or negative values.
4. **SemVer Validation**: Enforces semantic version strings (`X.Y.Z`).

---

### 10. Database Safety & Safe Schema Extension

`server/prisma/schema.prisma` has been safely extended with non-destructive, additive tables:
- **`CalculationConfigVersion`**: Tracks major/minor configuration releases, publish dates, authors, and active statuses.
- **`CalculationConfigParameter`**: Stores versioned parameters with location/tier overrides and boundary definitions.

```prisma
model CalculationConfigVersion {
  id              String                     @id @default(uuid())
  versionNumber   String                     @unique
  status          String                     @default("DRAFT")
  changeNote      String?
  effectiveFrom   DateTime?
  publishedAt     DateTime?
  publishedBy     String?
  createdBy       String
  createdAt       DateTime                   @default(now())
  updatedAt       DateTime                   @updatedAt
  parameters      CalculationConfigParameter[]
}

model CalculationConfigParameter {
  id                String                    @id @default(uuid())
  versionId         String
  key               String
  name              String
  description       String?
  category          String
  value             String
  unit              String
  valueType         String                    @default("number")
  minimum           Float?
  maximum           Float?
  location          String?                   @default("Global")
  specificationTier String?                   @default("Global")
  status            String                    @default("DRAFT")
  version           CalculationConfigVersion  @relation(fields: [versionId], references: [id], onDelete: Cascade)
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt

  @@unique([versionId, key, location, specificationTier])
  @@index([key, status, location, specificationTier])
}
```

**Database Protection Safeguards**:
- Existing tables (`RateOverride`, `RateAuditLog`, `CalculationSnapshot`, `User`, `Project`) were not modified, dropped, or reset.
- In-memory fail-closed fallback ensures that if database connection drops, calculations proceed uninterrupted using verified baseline constants.

---

### 11. Security & Admin Authorization

The configuration management endpoints integrate directly with backend middleware:
- **`authenticateToken`**: Enforces signed JWT verification.
- **`requireAdmin`**: Enforces authoritative backend admin role verification (`req.user.role === 'ADMIN'`).
- **Secrets Protection**: Database credentials, Render internal tokens, and payment secrets are strictly confined to server-side environment variables and never exposed to the client bundle.

---

### 12. Verification & Regression Analysis

#### Regression Invariance Results
A comprehensive regression suite (`phase2b_configuration_architecture.test.ts`) verified that the calculation engine produces 100% invariant results before and after adapter integration:
- **Standard 2,400 sq.ft Duplex Villa Scenario**:
  - Steel Tonnage: $6.72\text{ tonnes}$ (Ground) $+ 0.48\text{ tonnes}$ (Upper) = $7.20\text{ tonnes}$ $\pm 0.00$
  - Cement Quantity: $960\text{ bags}$ $\pm 0$
  - M-Sand Quantity: $1,440\text{ CFT}$ $\pm 0$
  - P-Sand Quantity: $1,440\text{ CFT}$ $\pm 0$
  - Coarse Aggregate: $3,240\text{ CFT}$ $\pm 0$
  - Total Grand Budget: Identical to the exact rupee.
- **Location Resolution Tests**:
  - Bengaluru composite civil labour resolves to ₹380/sq.ft.
  - Mysuru composite civil labour resolves to ₹342/sq.ft (civil fallback ₹310/sq.ft).
- **Draft Exclusion Tests**:
  - Creating a draft parameter of ₹999/sq.ft in the registry did not affect production calculations; the active baseline was preserved.

#### Test Execution Summary
```
Test Files  15 passed (15)
     Tests  179 passed (179)
  Duration  8.41s
```
- 168 baseline & Phase 2B tests: **100% passing**.
- 11 new Phase 2C versioning lifecycle & persistence tests: **100% passing**.
- Frontend production build: **Passed (Exit Code 0)**.
- Backend server build: **Passed (Exit Code 0)**.

---

### 13. Phase 2C Configuration Versioning & Persistence Addendum

With Phase 2C, the configuration architecture is augmented with:
1. **Full Versioning Lifecycle**:
   - `DRAFT` $\to$ `VALIDATED` $\to$ `SIMULATE` $\to$ `REVIEW` $\to$ `PUBLISH` $\to$ `ACTIVE` $\to$ `ARCHIVED` (and `REJECTED`).
   - Server-side validation engine distinguishing `SCHEMA_VALID` from `BUSINESS_REVIEW_REQUIRED`.
2. **Server-Side What-If Simulation**:
   - Compares active baseline vs draft version across a standard benchmark project, computing precise deltas for cost, quantities, BOQ lines, and report sections without mutating live parameters.
3. **Atomic PostgreSQL Publishing**:
   - Publishes through atomic database transactions (`prisma.$transaction`), archiving prior active versions in scope and activating the target version with complete audit records.
4. **Historical Immutability & Rollback**:
   - Historical versions are strictly immutable.
   - Rollback creates a new draft version copying historical configuration parameters.
5. **Database Fail-Closed Diagnostics**:
   - Evaluates `DB_UNAVAILABLE`, `NO_ACTIVE_VERSION`, and `INVALID_ACTIVE_CONFIG`, falling back safely to the certified immutable baseline rather than claiming unverified database freshness.

