// ============================================================
// HUTTY CONFIGURATION ARCHITECTURE — DOMAIN TYPES
// Single source of truth for typed configuration schemas,
// versioning lifecycle, validation contracts, and resolved snapshots.
// ============================================================

export type ConfigurationStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'REJECTED';

export type ConfigCategory =
  | 'AUTHORITY'
  | 'BUA_SETBACKS'
  | 'SPACE_TEMPLATES'
  | 'MASONRY'
  | 'RCC_STRUCTURE'
  | 'MATERIALS'
  | 'WASTAGE_COVERAGE'
  | 'FLOORING_FINISHES'
  | 'PAINT_PLASTER'
  | 'WATERPROOFING'
  | 'OPENINGS'
  | 'FIXTURES'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'LABOUR'
  | 'SPECIFICATIONS'
  | 'COMMERCIAL'
  | 'RECOMMENDATIONS'
  | 'REPORT';

export type ConfigValueType = 'number' | 'string' | 'boolean' | 'json';

export type LocationScope = 'ALL' | 'Bangalore' | 'Mysore' | string;
export type SpecificationTierScope = 'ALL' | 'STANDARD' | 'PREMIUM' | 'LUXURY' | string;

export interface CalculationParameter {
  id: string;
  key: string;
  name: string;
  description: string;
  category: ConfigCategory;
  value: number | string | boolean | Record<string, any>;
  unit: string;
  valueType: ConfigValueType;
  minimum?: number;
  maximum?: number;
  location: LocationScope;
  specificationTier: SpecificationTierScope;
  source: string;
  sourceDate?: string;
  sourceReference?: string;
  isStatutory?: boolean;
  status: ConfigurationStatus;
  version: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationVersion {
  id: string;
  versionNumber: string; // e.g. "v1.0.0", "v1.1.0-draft"
  status: ConfigurationStatus;
  createdBy: string;
  createdAt: string;
  publishedBy?: string;
  publishedAt?: string;
  effectiveFrom: string;
  changeNote: string;
  validationStatus: 'VALID' | 'INVALID' | 'UNVALIDATED';
  validationErrors?: string[];
  parametersCount: number;
}

// ── Domain Specific Configurations ──

export interface SpaceTemplateConfig {
  spaceType: string;
  name: string;
  defaultLengthFt: number;
  defaultWidthFt: number;
  minLengthFt?: number;
  minWidthFt?: number;
  defaultAreaSqFt: number;
  clearWallHeightFt: number;
  doorRequirement: number;
  windowRequirement: number;
  windowAreaSqFt: number;
  doorOpeningAreaSqFt: number;
  lightPoints: number;
  fanPoints: number;
  socketPoints: number;
  acPoints: number;
  geyserPoints: number;
  tvDataPoints: number;
  waterPoints: number;
  drainagePoints: number;
  wcCount: number;
  washBasinCount: number;
  showerCount: number;
  healthFaucetCount: number;
  floorDrainCount: number;
  sinkCount: number;
  flooringTypeDefault?: string;
  isWetArea: boolean;
  waterproofingUpturnFt: number;
  source: string;
  requiresClientConfirmation: boolean;
}

export interface AuthoritySetbackSlabConfig {
  minPlotAreaSqFt: number;
  maxPlotAreaSqFt: number;
  frontSetbackFt: number;
  rearSetbackFt: number;
  sideLeftSetbackFt: number;
  sideRightSetbackFt: number;
  maxGroundCoveragePct: number;
}

export interface AuthorityFarSlabConfig {
  minRoadWidthFt: number;
  maxRoadWidthFt: number;
  plotAreaCategories: Array<{
    maxPlotAreaSqFt: number;
    permissibleFAR: number;
    maxFARWithPremium?: number;
  }>;
}

export interface AuthorityRuleConfig {
  id: string;
  city: string;
  displayName: string;
  governingAuthority: string;
  governingFramework: string;
  isStatutoryVerified: boolean;
  sourceReference: string;
  effectiveDate: string;
  disclaimer: string;
  setbackSlabs: AuthoritySetbackSlabConfig[];
  farSlabs: AuthorityFarSlabConfig[];
  parkingNorms: {
    stiltSqFtPerCar: number;
    surfaceSqFtPerCar: number;
    sqFtPerBike: number;
  };
}

export interface LabourBenchmarkConfig {
  tradeKey: string;
  tradeName: string;
  category: string;
  basis: string;
  unit: string;
  rates: Record<string, number>; // e.g. { "Bangalore_Standard": 350, "Bangalore_Premium": 380, "Mysore_Standard": 310 }
  source: string;
}

export interface CommercialRuleConfig {
  contractorMarginDefault: number; // e.g. 0.10
  contingencyRateDefault: number; // e.g. 0.00 in contractor mode, 0.06 in self-build
  professionalFeesRateDefault: number; // e.g. 0.05
  gstRateDefault: number; // e.g. 0.18
  selfBuildMarginRate: number; // 0.00
  selfBuildContingencyRate: number; // 0.00
  selfBuildProfessionalFeesRate: number; // 0.00
  selfBuildGstRate: number; // 0.00
}

export interface ParameterConflict {
  parameterKey: string;
  parameterName: string;
  currentSource: string;
  conflictingSource: string;
  currentEffectiveValue: number | string;
  alternateValue: number | string;
  unit: string;
  reason: string;
  status: 'CONFLICT_REQUIRES_REVIEW' | 'RESOLVED';
  resolutionNote?: string;
}

// ── Complete Resolved Snapshot for Calculations ──

export interface ResolvedCalculationConfiguration {
  version: string;
  resolvedAt: string;
  location: string;
  specificationTier: string;
  parameters: Record<string, number | string | boolean>;
  spaceTemplates: Record<string, SpaceTemplateConfig>;
  authorityRules: AuthorityRuleConfig;
  commercialSettings: CommercialRuleConfig;
  labourBenchmarks: Record<string, LabourBenchmarkConfig>;
  conflictsActive: string[];
}

export interface ConfigurationResolutionContext {
  location?: string;
  city?: string;
  specificationTier?: string;
  packageTier?: string;
  date?: string;
  allowDraftForSimulation?: boolean;
}
