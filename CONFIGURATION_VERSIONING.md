# HUTTY — CONFIGURATION VERSIONING & PERSISTENCE (PHASE 2C)
## COMPLETE CONFIGURATION LIFECYCLE, SIMULATION, ATOMIC PUBLISHING & AUDIT TRAIL

**Date**: September 19, 2026  
**Status**: Implemented & Production-Verified  
**Test Coverage**: 179 / 179 Tests Passing (100% Green across 15 Test Suites)  
**Frontend Build**: Vite v6.4.3 (Exit Code 0)  
**Backend Build**: Prisma Generate & tsc (Exit Code 0)

---

### 1. Architectural Overview & Objective

Phase 2C completes the configuration versioning lifecycle for the Hutty platform.

Under the cardinal rule **"Current Value ≠ Approved Value"**, configuration parameters are managed through an explicit, auditable, and immutable lifecycle:

$$\text{DRAFT} \longrightarrow \text{VALIDATE} \longrightarrow \text{SIMULATE} \longrightarrow \text{REVIEW} \longrightarrow \text{PUBLISH} \longrightarrow \text{ACTIVE} \longrightarrow \text{ARCHIVED}$$

Key architectural guarantees:
1. **Historical Immutability**: Once published or activated, historical configuration versions are never mutated in place. Edits require creating a new version or draft clone.
2. **Draft Isolation**: Parameters under `DRAFT`, `VALIDATED`, or `REVIEW` never enter public calculation paths. Public calculations only ever resolve `ACTIVE` parameters.
3. **Fail-Closed Diagnostics**: The engine explicitly diagnoses database unavailability (`DB_UNAVAILABLE`, `NO_ACTIVE_VERSION`, `INVALID_ACTIVE_CONFIG`) and falls back to a certified immutable baseline, preventing silent stale memory claims.
4. **Single Source of Truth**: Material and labour pricing remain authoritative under `RateMaster` (`RateOverride`, `RateAuditLog`, `rateService`). Configuration versioning references and aligns with this pricing layer rather than creating competing rate tables.

---

### 2. Configuration Lifecycle State Machine

```
               ┌──────────┐
               │  DRAFT   │
               └────┬─────┘
                    │ validate() [checks bounds, critical zero divisors, NaN]
                    ▼
              ┌───────────┐
              │ VALIDATED │◄────────────────────────────┐
              └─────┬─────┘                             │
                    │ submitReview()                    │
                    ▼                                   │
               ┌──────────┐   reject()                  │
               │  REVIEW  ├──────────────► ┌──────────┐ │
               └────┬─────┘                │ REJECTED │ │
                    │                      └──────────┘ │
                    │ simulate()                        │
                    │ [compares Active vs Draft delta]  │
                    │                                   │
                    │ publish() [atomic transaction]    │
                    ▼                                   │
               ┌───────────┐                            │
               │ PUBLISHED │ (Future effective date)    │
               └─────┬─────┘                            │
                     │ effectiveFrom reached            │
                     ▼                                  │
                ┌──────────┐  supersede / archive       │
                │  ACTIVE  ├─────────────► ┌──────────┐ │
                └────┬─────┘               │ ARCHIVED │ │
                     │                     └──────────┘ │
                     │ rollbackRequest()                │
                     └──────────────────────────────────┘
                       (Creates NEW Draft clone v1.X.0)
```

---

### 3. Database Model & Schema Integration

`server/prisma/schema.prisma` provides additive, non-destructive PostgreSQL persistence:

#### A. `CalculationConfigVersion`
Tracks coherent sets of parameters, version status, audit authors, and effective date ranges:
```prisma
model CalculationConfigVersion {
  id               String                       @id @default(uuid())
  versionNumber    String                       @unique
  status           String                       @default("DRAFT")
  description      String?
  changeNote       String?
  effectiveFrom    DateTime                     @default(now())
  effectiveTo      DateTime?
  validationStatus String                       @default("VALID")
  parametersCount  Int                          @default(0)
  createdBy        String
  validatedBy      String?
  validatedAt      DateTime?
  publishedBy      String?
  publishedAt      DateTime?
  createdAt        DateTime                     @default(now())
  updatedAt        DateTime                     @updatedAt
  parameters       CalculationConfigParameter[]
  auditLogs        CalculationConfigAuditLog[]

  @@index([status])
  @@index([versionNumber])
  @@index([effectiveFrom])
  @@map("calculation_config_versions")
}
```

#### B. `CalculationConfigParameter`
Stores versioned parameters with location/tier overrides and numerical boundaries:
```prisma
model CalculationConfigParameter {
  id                String                   @id @default(uuid())
  versionId         String
  version           CalculationConfigVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
  key               String
  name              String
  description       String?
  category          String
  valueJson         Json
  unit              String
  valueType         String                   @default("number")
  minimum           Float?
  maximum           Float?
  location          String                   @default("Global")
  specificationTier String                   @default("Global")
  source            String?
  sourceDate        String?
  sourceReference   String?
  isStatutory       Boolean                  @default(false)
  status            String                   @default("ACTIVE")
  createdBy         String
  createdAt         DateTime                 @default(now())
  updatedAt         DateTime                 @updatedAt

  @@unique([versionId, key, location, specificationTier], name: "config_param_unique")
  @@index([key])
  @@index([category])
  @@index([location])
  @@index([specificationTier])
  @@index([versionId])
  @@map("calculation_config_parameters")
}
```

#### C. `CalculationConfigAuditLog`
Records every lifecycle mutation with actor, previous/new payloads, and timestamp:
```prisma
model CalculationConfigAuditLog {
  id           String                   @id @default(uuid())
  versionId    String
  version      CalculationConfigVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
  parameterId  String?
  parameterKey String?
  action       String // 'CREATE_DRAFT' | 'EDIT_PARAMETER' | 'VALIDATE' | 'SIMULATE' | 'SUBMIT_REVIEW' | 'APPROVE_REVIEW' | 'PUBLISH' | 'ACTIVATE' | 'ARCHIVE' | 'REJECT' | 'ROLLBACK_PREPARE'
  oldValue     Json?
  newValue     Json?
  reason       String?
  adminEmail   String
  ipAddress    String?
  userAgent    String?
  timestamp    DateTime                 @default(now())

  @@index([versionId])
  @@index([action])
  @@index([adminEmail])
  @@index([timestamp])
  @@map("calculation_config_audit_logs")
}
```

---

### 4. REST API Endpoint Architecture

All endpoints are mounted under `/api/v1`:

| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/config/active` | Public | Resolves effective active configuration parameters for the public calculator. |
| `GET` | `/api/v1/admin/config/versions` | `authenticateToken` + `requireAdmin` | Lists configuration versions with status filtering. |
| `POST` | `/api/v1/admin/config/versions` | `authenticateToken` + `requireAdmin` | Creates a new draft cloned from active baseline or specified version. |
| `GET` | `/api/v1/admin/config/versions/:id` | `authenticateToken` + `requireAdmin` | Retrieves version details and full parameter list. |
| `PUT` | `/api/v1/admin/config/versions/:id` | `authenticateToken` + `requireAdmin` | Updates draft parameters or metadata (immutable on active/published). |
| `POST` | `/api/v1/admin/config/versions/:id/validate` | `authenticateToken` + `requireAdmin` | Runs schema validation and business conflict checks. |
| `POST` | `/api/v1/admin/config/versions/:id/simulate` | `authenticateToken` + `requireAdmin` | Runs what-if delta simulation on standard reference villa. |
| `POST` | `/api/v1/admin/config/versions/:id/submit-review` | `authenticateToken` + `requireAdmin` | Advances status from `VALIDATED` to `REVIEW`. |
| `POST` | `/api/v1/admin/config/versions/:id/publish` | `authenticateToken` + `requireAdmin` | Atomically publishes and activates version via PostgreSQL transaction. |
| `POST` | `/api/v1/admin/config/versions/:id/archive` | `authenticateToken` + `requireAdmin` | Archives an active or published version. |
| `GET` | `/api/v1/admin/config/versions/:id/audit` | `authenticateToken` + `requireAdmin` | Retrieves immutable audit trail for a version. |
| `GET` | `/api/v1/admin/config/compare/:a/:b` | `authenticateToken` + `requireAdmin` | Returns parameter diff (added, removed, modified, unchanged). |
| `POST` | `/api/v1/admin/config/rollback/:id` | `authenticateToken` + `requireAdmin` | Creates a new rollback draft version cloning historical parameters. |

---

### 5. Server-Side Validation & Conflict Registry Integration

Validation evaluates every parameter against two strict criteria:

1. **Schema Integrity (`SCHEMA_VALID`)**:
   - Numerical safety: Explicitly rejects `NaN`, `Infinity`, `-Infinity`.
   - Non-negative enforcement: Prevents negative rates, dimensions, or consumption factors.
   - Critical zero divisor checks: Divisors such as wall height (`config.structure.wall_height_ft`), block volume (`config.masonry.aac_block_unit_volume_cum`), paint coverage (`config.paint.interior_coverage_sqft_per_litre`), and occupant headcounts reject `0`.
   - Boundary enforcement: Verifies values remain within established $[minimum, maximum]$ intervals.

2. **Business Conflict Review (`BUSINESS_REVIEW_REQUIRED`)**:
   - The 5 identified parameter conflicts are flagged upon validation:
     - `config.paint.interior_coverage_sqft_per_litre`: `45` vs `60 sqft/L`
     - `config.commercial.contractor_margin`: `15%` vs `8-10%`
     - `config.waterproofing.sump_surface_sqft`: `120` vs `180 sqft`
     - `config.flooring.circulation_allowance_pct`: `10%` vs `14%`
     - `config.flooring.staircase_granite_sqft_flight`: `180` vs `175 sqft/flight`
   - If conflicts exist, the version **cannot be published** unless an authorized administrator explicitly supplies `acceptConflicts: true` and a valid `conflictAcceptanceReason`.

---

### 6. Server-Side What-If Simulation Engine

Simulation allows administrators to test parameter alterations against the real calculation engine before publishing:
- **Reference Project Benchmark**: Standard 2,400 sq.ft duplex villa (Ground + 1) on 30x40 site.
- **Deltas Calculated**:
  - Direct material cost delta ($\Delta$ INR, $\Delta$ %)
  - Direct labour cost delta ($\Delta$ INR, $\Delta$ %)
  - Commercial overheads delta ($\Delta$ INR, $\Delta$ %)
  - Total project cost delta ($\Delta$ INR, $\Delta$ %)
  - Physical quantities takeoff: Steel rebar tonnes, Cement bags, M-Sand CFT, Paint litres.
  - Affected BOQ lines and PDF report sections.
- **Zero Mutation**: Simulation is performed in a clean sandbox context without modifying PostgreSQL records or live active parameters.

---

### 7. Atomic Publication & Rollback Model

#### A. Atomic Publication Transaction (`publishVersion`)
Publishing executes inside a strict database transaction (`prisma.$transaction`):
1. Runs full validation and conflict acceptance checks.
2. Locates all existing versions with status `ACTIVE` in the matching scope and sets their status to `ARCHIVED` with `effectiveTo: now`.
3. Updates the target version to `ACTIVE` (or `PUBLISHED` if `effectiveFrom` is in the future).
4. Updates all parameters in the target version to `status: ACTIVE`.
5. Logs `PUBLISH` and `ACTIVATE` entries in `CalculationConfigAuditLog`.
6. If any step fails, the entire transaction rolls back cleanly, guaranteeing zero partial publications.

#### B. Rollback Architecture (`rollbackToVersion`)
- Historical versions are **never** mutated back into `ACTIVE`.
- Requesting a rollback to version `1.0.0` creates a **new draft release** (`v1.X.0-rollback`) copying all parameters from `1.0.0`.
- The new release follows the standard `VALIDATE` $\to$ `SIMULATE` $\to$ `PUBLISH` lifecycle, ensuring an unbroken and transparent audit history.

---

### 8. Snapshot Immutability & Fail-Closed Safety

1. **Snapshot Immutability**:
   - `CalculationResult` stores a complete `resolvedConfiguration` snapshot alongside project calculations.
   - Re-opening or exporting an older project uses the frozen snapshot, ensuring that future configuration updates never alter historical calculations or contract BOQs.

2. **Critical Database Fail-Closed Rules**:
   - When resolving production active configuration:
     - `DB_UNAVAILABLE`: Logs incident with full stack trace, tags source as `STATIC_APPROVED_BASELINE`, and exposes diagnosis status so operators know the system is using the certified fallback.
     - `NO_ACTIVE_VERSION`: Fails closed and halts calculation rather than guessing arbitrary parameters.
     - `INVALID_ACTIVE_CONFIG`: Refuses execution until configuration is corrected.

---

### 9. Verification & Test Evidence

```
 Test Files  15 passed (15)
      Tests  179 passed (179)
   Start at  18:38:21
   Duration  8.41s
```
- **168 baseline & Phase 2B tests**: 100% passing.
- **11 Phase 2C lifecycle & persistence tests**: 100% passing.
- **Frontend Production Build**: Vite v6.4.3 exit code 0.
- **Backend Server Build**: Prisma generate & tsc exit code 0.
