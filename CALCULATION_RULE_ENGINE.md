# HUTTY CALCULATION RULE ENGINE & CONTROL CENTER SPECIFICATION
**Phase 2C+ Architectural Documentation**
*Single Production Engine • Safe AST Evaluation • Dependency Graph • Impact Simulation • 26-Domain Control Center*

---

## 1. Architectural Overview & Philosophy

The Hutty Configuration & Calculation Rule Engine empowers authorized administrators to control every physical, geometric, commercial, and operational assumption governing residential construction estimates **without developer intervention or code deployment**.

```
   ┌─────────────────────────────────────────────────────────┐
   │            ADMIN CONTROL CENTER (26 Domains)            │
   │  Parameters • Rooms • RCC • Masonry • Finishes • Rules  │
   └───────────────────────────┬─────────────────────────────┘
                               │ Draft Overrides
                               ▼
   ┌─────────────────────────────────────────────────────────┐
   │             STRUCTURED RULE & METHOD ENGINE             │
   │   - Zero Code Execution (AST Evaluator: Add/Mul/Div)   │
   │   - Method Selection Registry (Steel/Paint/Flooring)    │
   │   - Directed Acyclic Graph (Cycle Detection via DFS)   │
   │   - Pre-Publish Simulation & Change Impact Graph        │
   └───────────────────────────┬─────────────────────────────┘
                               │ Validation & Publish Gate
                               ▼
   ┌─────────────────────────────────────────────────────────┐
   │              ACTIVE PRODUCTION CONFIGURATION            │
   │      (Versioned, Immutable, PostgreSQL-Persisted)        │
   └───────────────────────────┬─────────────────────────────┘
                               │
                               ▼
   ┌─────────────────────────────────────────────────────────┐
   │            SINGLE CANONICAL CALCULATION ENGINE          │
   │     Public Calculator • Simulation • BOQ • PDF QA Gate  │
   └─────────────────────────────────────────────────────────┘
```

---

## 2. Zero Code Execution Guarantee

In strict compliance with **Critical Rule #2**, the system rejects any execution of arbitrary strings or script blocks:
- **No `eval()`**
- **No `Function()` constructor**
- **No client/admin-entered JavaScript, TypeScript, or raw SQL**

### Structured Abstract Syntax Tree (AST)

All dynamic rules are represented as serializable AST nodes (`RuleNode`):

```ts
export type RuleNode =
  | { type: 'CONSTANT'; value: number }
  | { type: 'PARAMETER_REF'; parameterKey: string; fallbackValue?: number }
  | { type: 'METRIC_REF'; metricKey: string }
  | { type: 'BINARY_OP'; operation: BinaryOperation; left: RuleNode; right: RuleNode }
  | { type: 'FUNCTION_OP'; operation: FunctionOperation; arguments: RuleNode[]; precision?: number }
  | { type: 'CONDITIONAL'; condition: RuleCondition; whenTrue: RuleNode; whenFalse: RuleNode };
```

### Supported Operations & Conditions

| Group | Operations |
|---|---|
| **Binary Arithmetic** | `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `MODULO`, `POWER` |
| **Functions** | `MIN`, `MAX`, `ROUND`, `CEIL`, `FLOOR`, `PERCENTAGE`, `ABS` |
| **Conditional Operators** | `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `LESS_THAN`, `GREATER_OR_EQUAL`, `LESS_OR_EQUAL`, `IN`, `NOT_IN` |

---

## 3. Calculation Method Registry

Admins can toggle between supported calculation methodologies per trade domain. The engine will only execute verified algorithms registered in the registry.

### Registered Supported Methods

1. **Structural Steel (`STEEL`)**:
   - `steel_floorwise`: Floor-wise incremental model: `BUA × [GroundFactor + (Floors - 1) × FloorIncrement] / 1000`
   - `steel_simple_bua`: Simple BUA multiplier: `BUA × Factor / 1000`
   - `steel_manual`: Admin-specified fixed tonnage override

2. **Paint & Finishes (`PAINT`)**:
   - `paint_surface_area`: Net surface spread: `(WallArea + CeilingArea) / CoverageRate × 2 Coats × Wastage`
   - `paint_thumb_rule_bua`: Thumb rule: `BUA × 0.12 L/sqft`

3. **Flooring (`FLOORING`)**:
   - `flooring_circulation_pct`: Net carpet area with circulation allowance and tile cutting wastage
   - `flooring_carpet_bua_ratio`: BUA ratio method

---

## 4. Dependency Graph & Cycle Detection

Before any draft configuration or rule is published, the `DependencyGraph` builds an in-memory Directed Acyclic Graph (DAG) of all metric, parameter, and rule relationships:

1. **Reference Validation**: Ensures all referenced parameters exist in `configResolver` or known metrics.
2. **Cycle Detection**: Executes depth-first search (DFS) with three-state node marking (`UNVISITED`, `VISITING`, `VISITED`). If a back-edge is encountered, the publish operation is **BLOCKED** and cycle path nodes are reported.
3. **Topological Sort**: Computes the optimal linear evaluation order via Kahn's algorithm.

---

## 5. Pre-Publish Simulation & Change Impact Engine

Before an administrator commits changes to production:

1. **Deterministic Run**:
   - Evaluates a standard benchmark house under the current `ACTIVE` configuration.
   - Evaluates the identical house under the `DRAFT` override configuration.
2. **Delta Quantification**:
   - Compares material quantities, fixture counts, labour days, and line-item costs.
   - Computes total cost difference and percentage shift.
3. **Change Impact Graph**:
   - Maps each changed parameter through its dependencies, affected metrics, affected BOQ line items, cost heads, and report sections.
   - Flags **CRITICAL** parameters (e.g. Wall Height, Steel Factor, Cement Factor, Margin) with warning modals and requires explicit confirmation.

---

## 6. Admin Control Center: 26 Domain Architecture

The Hutty Admin Panel (`AdminPage.tsx`) exposes 26 categorized control sections grouped into 5 intuitive clusters:

### Cluster 1: Core & Pricing
- **Overview**: Active vs Draft environment banner, version timeline, health diagnostics, pending drafts count.
- **Rate Master**: Authoritative material pricing, brand tiers, GST treatment, unit rates.
- **Audit Trail**: Chronological log of administrative actions, parameter shifts, and reasons.
- **Analytics**: Usage metrics, quote funnels, and estimation volume.
- **Account & Security**: Admin credential management, bcrypt hashing, session security.

### Cluster 2: Construction & Spaces
- **Construction Parameters**: Central searchable catalog for factors, waste percentages, and heights.
- **Space & Rooms**: Room template catalog (10 archetypes) with dimensions, dado height, electrical/plumbing points.
- **Space Rules**: Circulation allowance, staircase area, and envelope deductions.
- **Structure & RCC**: Steel factors, cement factors, aggregate, sand, foundation multipliers.
- **Masonry**: AAC, concrete block, red brick dimensions, mortar ratio, deductions.
- **Flooring & Finishes**: Room flooring coverage, circulation, tile wastage, staircase granite.
- **Paint**: Interior/exterior coverage, coats, putty and primer consumption.
- **Waterproofing**: Bathroom upturns, terrace factors, sump waterproofing, coats.
- **Doors & Windows**: Main door, internal door, window, and ventilator templates.

### Cluster 3: MEP, Fixtures & Specifications
- **Plumbing**: CPVC/SWR lengths per point, risers, water demand, tank/pump sizing.
- **Electrical**: Light, fan, socket, AC, TV points per room archetype, wire gauge lengths.
- **Labour**: Civil, electrical, plumbing, painting, flooring rates by location and tier.
- **Fixtures & Sanitary**: WC, wash basin, shower, health faucet brand grades and counts.
- **Specifications**: Standard, Premium, and Luxury brand mappings and grade selections.
- **Recommendations**: Conditional recommendation rules based on location, tier, and BUA.

### Cluster 4: Rules & Engine
- **Calculation Engine**: Method selection cards, active method switching, parameter requirements.
- **Calculation Rules**: AST visualizer showing expression trees, operations, and fallbacks.
- **Simulation & Impact**: Side-by-side active vs draft comparison with full BOQ and cost deltas.

### Cluster 5: Governance & Tools
- **Authority & BUA**: Setbacks, FAR, ground coverage, statutory vs planning assumptions.
- **Commercial**: Contractor margin, contingency, professional fees, GST percentages.
- **Report Configuration**: Section visibility, column toggles, display precision, disclaimer text.
- **Version History**: Published version catalog, rollback to prior version, JSON configuration export.

---

## 7. Quality Invariance & Verification Matrix

- **Rate Propagation Test**: Updating a unit rate changes total cost while preserving physical quantities.
- **Geometry Sensitivity Test**: Increasing wall height from 10 ft to 11 ft increases masonry block count, plaster area, paint consumption, and wall-related labour without altering structural steel or foundation concrete.
- **Single Source of Truth**: Admin simulation, public wizard, and PDF export invoke the exact same `runCalculator` engine.
