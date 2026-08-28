// ============================================================
// AUTHORITY RULES REGISTRY TYPES
// Defines strict, versioned municipal zoning & planning structures
// for Bengaluru (BBMP/BDA) and Mysuru (MUDA/MDA).
// ============================================================

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
}
