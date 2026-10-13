// ============================================================
// AUTHORITY RULES REGISTRY TYPES — PLOT SETBACK SYSTEM V2
// Defines strict, versioned municipal zoning & planning structures
// for Bengaluru (BBMP/BDA/GBA) and Mysuru (MUDA/MDA).
// ============================================================

export type SetbackMethod =
  | 'FIXED_DISTANCE'        // Fixed distance in feet (e.g. 2.95 ft)
  | 'PERCENT_OF_DEPTH'      // Percentage of plot depth (e.g. 12% of depth)
  | 'PERCENT_OF_WIDTH'      // Percentage of plot width (e.g. 8% of width)
  | 'MINIMUM_REQUIRED'      // Minimum statutory clearance in feet (e.g. 16.40 ft)
  | 'UNSPECIFIED';          // Not specified in source, requires authority review

export type VerificationStatus =
  | 'OFFICIAL_GAZETTE_PENDING_CONFIRMATION' // Sourced from gazette amendment summary, subject to plan sanction
  | 'INDEPENDENTLY_VERIFIED'                // Officially confirmed statutory bye-law requirement
  | 'AWAITING_REVIEW'                       // Draft or ambiguous rule requiring administrative confirmation
  | 'MANUAL_OVERRIDE'                       // Explicit manual override by administrator or architect
  | 'UNRESOLVED';                          // Missing or conflicting rule requirement

export interface BoundaryRequirement {
  method: SetbackMethod;
  value?: number;           // Distance in ft (for FIXED / MIN) or percentage number (e.g. 12 for 12%)
  unit: 'ft' | '%' | 'none';
  minDistanceFt?: number;   // Minimum statutory distance threshold if defined
  description?: string;     // Friendly formula description (e.g. "12% of plot depth")
  notes?: string;           // Explanatory note or source caveat
}

export interface PlotSetbackRule {
  id: string;
  name: string;
  authority: string;        // e.g. "Bengaluru / Greater Bengaluru"
  jurisdiction: 'Bangalore' | 'Mysore' | 'Global' | string;
  sourceDocument: string;   // e.g. "Karnataka Gazette amendment dated 5 January 2026"
  sourceDate: string;       // e.g. "2026-01-05"
  verificationStatus: VerificationStatus;

  // Plot Area Bounds
  minPlotAreaSqFt: number;
  maxPlotAreaSqFt: number;
  isMinInclusive?: boolean; // Default true
  isMaxInclusive?: boolean; // Default true

  // Independent Boundary Requirements
  front: BoundaryRequirement;
  rear: BoundaryRequirement;
  left: BoundaryRequirement;
  right: BoundaryRequirement;

  // Side clearance condition
  sideConditionNote?: 'one_side' | 'both_sides' | 'all_sides';

  // Ground Coverage & Building Scope
  maxGroundCoveragePct?: number; // e.g. 75, 70, 65, 50%
  maxBuildingHeightM?: number;   // e.g. 12m for residential scope up to G+4
  maxFloorsAllowed?: number;     // e.g. 4 for G+4

  // Configuration Lifecycle
  precedence?: number;           // Higher precedence resolves overlapping applicability
  isActive: boolean;
  adminNotes?: string;
}

export interface SetbackExplanationStep {
  boundary: 'Front' | 'Rear' | 'Left' | 'Right';
  method: SetbackMethod;
  formula: string;
  substitutions: string;
  valueFt: number;
  notes?: string;
  isRoadFacing?: boolean;
}

export interface SetbackRuleSlab {
  minPlotAreaSqM: number;
  maxPlotAreaSqM: number;
  minPlotAreaSqFt: number;
  maxPlotAreaSqFt: number;
  label: string;
  frontSetbackM: number;
  rearSetbackM: number;
  sideLeftSetbackM: number;
  sideRightSetbackM: number;
  frontSetbackFt: number;
  rearSetbackFt: number;
  sideLeftSetbackFt: number;
  sideRightSetbackFt: number;
  maxGroundCoveragePct: number;
  notes?: string;
}

export interface FARRuleSlab {
  minRoadWidthM: number;
  maxRoadWidthM: number;
  minRoadWidthFt: number;
  maxRoadWidthFt: number;
  roadLabel: string;
  plotAreaCategories: {
    maxPlotAreaSqFt: number;
    permissibleFAR: number;
    maxFloorsAllowed?: number;
  }[];
  notes?: string;
}

export interface AuthorityRuleSet {
  ruleId: string;
  city: 'Bangalore' | 'Mysore' | string;
  displayName: string;
  authority: 'BBMP/BDA' | 'MUDA' | string;
  authorityFullName: string;
  governingFramework: string;
  ruleVersion: string;
  effectiveDate: string;
  officialSourceDocument: string;
  disclaimer: string;
  setbackSlabs: SetbackRuleSlab[];
  plotSetbackRules?: PlotSetbackRule[];
  farSlabs: FARRuleSlab[];
  defaultRoadWidthFt: number;
  generalNotes: string[];
}

export interface AuthorityCalculationResult {
  city: string;
  authority: string;
  authorityFullName: string;
  governingFramework: string;
  ruleId: string;
  ruleVersion: string;
  effectiveDate: string;
  source: string;
  statutoryFrontSetbackFt: number;
  statutoryRearSetbackFt: number;
  statutoryLeftSetbackFt: number;
  statutoryRightSetbackFt: number;
  maxGroundCoveragePct: number;
  maxPermissibleCoverageSqFt: number;
  permissibleFAR: number;
  maxPermissibleBUASqFt: number;
  recommendedBUAPerFloorSqFt: number;
  recommendedBUATotalSqFt: number;
  minimumBUASqFt: number;
  buildableLengthFt: number;
  buildableWidthFt: number;
  buildableFootprintSqFt: number;
  requiresClientConfirmation: boolean;
  confirmationReason?: string;
  disclaimer: string;

  // ── Plot Setback System V2 Fields ──
  matchedRuleId?: string;
  matchedRuleName?: string;
  verificationStatus?: VerificationStatus;
  frontMethod?: SetbackMethod;
  rearMethod?: SetbackMethod;
  leftMethod?: SetbackMethod;
  rightMethod?: SetbackMethod;
  isAuthoritativeBuildableResolved: boolean;
  unresolvedReasons?: string[];
  setbackExplanationSteps?: SetbackExplanationStep[];
  roadFacingBoundaries?: Array<'front' | 'rear' | 'left' | 'right'>;
  roadWideningFt?: number;
  prescribedBuildingLineFt?: number;
  manualOverrideReason?: string;
}
