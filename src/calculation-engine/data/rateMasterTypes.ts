// ============================================================
// RATE MASTER DOMAIN TYPES
// Single canonical type definitions for Hutty's centralized
// rate and input management system.
// ============================================================

export type TradeCategory =
  | 'Steel'
  | 'Cement'
  | 'Sand'
  | 'Aggregate'
  | 'Bricks'
  | 'AAC blocks'
  | 'RCC materials'
  | 'Masonry'
  | 'Plaster'
  | 'Flooring'
  | 'Wall tiles'
  | 'Marble'
  | 'Doors'
  | 'Windows'
  | 'Paint'
  | 'Plumbing'
  | 'Sanitaryware'
  | 'Electrical wiring'
  | 'Electrical conduits'
  | 'Switches'
  | 'Sockets'
  | 'Distribution boards'
  | 'Electrical fixtures'
  | 'Labour'
  | 'Transportation'
  | 'Equipment/site costs'
  | 'Markups'
  | 'Special equipment'
  | 'Package-specific materials'
  | 'Other construction inputs';

export type PackageTierDimension = 'STANDARD' | 'PREMIUM' | 'LUXURY' | 'ALL';
export type LocationDimension = 'Bangalore' | 'Mysore' | 'ALL';

export interface RateMasterItem {
  id: string;
  rateId?: string; // convenient alias for id
  name: string;
  category: TradeCategory;
  rate: number; // Current baseline value from Hutty Baseline Rate Dataset
  defaultRate?: number; // convenient alias for rate
  unit: string;
  specification?: string;
  description?: string; // convenient alias for specification
  packageTier: PackageTierDimension;
  location: LocationDimension;
  active: boolean;
  source: string;
  notes?: string;
  taxTreatment?: 'tax_included' | 'tax_excluded' | 'not_applicable' | 'unknown';
  transportIncluded?: boolean;
  effectiveDate: string;
  updatedDate: string;
}

export interface RateOverride {
  id: string;
  rateId: string;
  rate?: number;
  overrideRate?: number; // convenient alias for rate
  category?: TradeCategory;
  unit?: string;
  location: LocationDimension;
  packageTier: PackageTierDimension;
  isActive: boolean;
  reason?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RateAuditEntry {
  id: string;
  rateId: string;
  rateName: string;
  category?: TradeCategory;
  unit?: string;
  oldValue: number | null;
  newValue: number;
  oldRate?: number | null; // convenient alias for oldValue
  newRate?: number; // convenient alias for newValue
  action: 'CREATE_OVERRIDE' | 'UPDATE_OVERRIDE' | 'REMOVE_OVERRIDE' | 'RESET_DEFAULT' | 'CONFIG_UPDATE' | 'AUTO_PRICE_APPROVED' | string;
  location: LocationDimension;
  packageTier: PackageTierDimension;
  adminEmail: string;
  userEmail?: string; // convenient alias for adminEmail
  reason?: string;
  timestamp: string;
}

export interface EffectiveRateContext {
  brand?: string;
  package?: 'STANDARD' | 'PREMIUM' | 'LUXURY' | string;
  packageTier?: 'STANDARD' | 'PREMIUM' | 'LUXURY' | string;
  location?: 'Bangalore' | 'Mysore' | string;
  city?: 'Bangalore' | 'Mysore' | string;
  grade?: string;
}

export interface EffectiveRateResult {
  rateId: string;
  effectiveRate: number;
  defaultRate: number;
  overrideRate?: number;
  sourceType:
    | 'EXACT_OVERRIDE'
    | 'PACKAGE_OVERRIDE'
    | 'LOCATION_OVERRIDE'
    | 'GLOBAL_OVERRIDE'
    | 'OVERRIDE_PACKAGE_LOCATION'
    | 'OVERRIDE_PACKAGE'
    | 'OVERRIDE_LOCATION'
    | 'OVERRIDE_GLOBAL'
    | 'BASELINE'
    | 'FALLBACK'
    | 'MISSING_RATE';
  isMissing?: boolean;
  unit: string;
  location: string;
  packageTier: string;
}

export interface CalculatorConfigSettings {
  id: string;
  steelWastagePercentage: number;
  cementHandlingWastagePercentage: number;
  masonryWastagePercentage: number;
  flooringWastagePercentage: number;
  paintWastagePercentage: number;
  bangaloreLabourMultiplier: number;
  mysoreLabourMultiplier: number;
  mysoreTransportSurchargePerSqFt: number;
  professionalFeesRate: number; // e.g. 0.05
  architectFeesRate?: number;
  structuralFeesRate?: number;
  contractorMarginRate: number; // e.g. 0.15
  contingencyRate: number; // e.g. 0.06
  gstRate: number; // e.g. 0.18
  updatedBy: string;
  updatedAt: string;
}

export type ProposalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVIEW'
  | 'UNVERIFIED'
  | 'FAILED';

export interface MarketPriceProposal {
  id: string;
  runId: string;
  rateId: string;
  rateName: string;
  category: string;
  unit: string;
  currentRate: number;
  proposedRate: number;
  difference: number;
  differencePercent: number;
  currency: string;
  location: string;
  packageTier: string;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  status: ProposalStatus;
  notes?: string;
  warning?: string;
  isAiAssisted: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PriceUpdateRun {
  id: string;
  provider: string;
  status: string;
  totalProposed: number;
  totalApproved: number;
  totalRejected: number;
  scope: string;
  category?: string;
  runBy: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  proposals: MarketPriceProposal[];
}

export interface FunnelStepMetric {
  stepIndex: number;
  name: string;
  usersReached: number;
  conversionPercent: number;
  dropOffPercent: number;
  avgTimeSpentSec: number;
}

export interface EnhancedAnalyticsMetrics {
  totalSessions: number;
  uniqueSessions: number;
  calcStarts: number;
  calcCompletions: number;
  completionRate: number;
  abandonmentRate: number;
  avgDurationSec: number;
  avgCost: number;
  avgCostPerSqFt: number;
  avgBUA: number;
  avgPlotDimensions: string;
  mostSelectedPackage: string;
  highestDropOffStep: string;
  comparisonOpens: number;
  packageSwitches: number;
  reportsGenerated: number;
  packageCounts: Record<string, number>;
  packagePercentages: {
    STANDARD: number;
    PREMIUM: number;
    LUXURY: number;
  };
  locationCounts: Record<string, number>;
  deviceDistribution: {
    desktop: number;
    mobile: number;
  };
  funnelSteps: FunnelStepMetric[];
  costDistribution: Array<{ range: string; count: number }>;
  activityTimeline: Array<{ date: string; sessions: number; completions: number }>;
  recentEvents: any[];
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: string;
  lastLoginAt: string;
  isSuperAdmin: boolean;
}

export interface AdminActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityAuditEvent {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
