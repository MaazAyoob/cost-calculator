// ============================================================
// CALCULATION ENGINE – TYPES
// Central type registry for all engine inputs, canonical models, and outputs
// ============================================================

import { QualityTier, CityLocation, HouseType, RoomCounts, MaterialBrandSelection } from '../store/useWizardStore';
import { QSParameterItem } from './data/engineeringAssumptions';
import { RateSourceMetadata } from './data/rateService';

export type { QSParameterItem } from './data/engineeringAssumptions';
export type { RateSourceMetadata } from './data/rateService';

// ────────────────────────────────────────────────────────────
// INPUT MODEL
// ────────────────────────────────────────────────────────────

export interface ZoneFlooringSelection {
  living: 'Vitrified Tiles 800x800mm' | 'Granite Slab' | 'Italian Marble';
  kitchenDining: 'Vitrified Tiles' | 'Granite' | 'Matte Anti-Skid Vitrified';
  bedrooms: 'Vitrified Tiles' | 'Wooden Laminate' | 'Granite';
  bathrooms: 'Anti-skid Ceramic Tiles' | 'Matte Finish Vitrified';
  parkingUtility: 'Heavy-Duty Parking Tiles' | 'Flamed Granite';
  balconies: 'Anti-skid Ceramic' | 'Wooden Finish Tiles';
}

export interface WallCladdingSelection {
  kitchenDadoHeight: '2 ft' | '4 ft';
  bathroomTileHeight: '7 ft (Lintel)' | 'Full Height (Ceiling)';
}

export interface DoorSelection {
  mainDoor: 'Premium Teak' | 'Normal Teak' | 'Burma Teak Custom Carved' | string;
  internalDoor: 'Flush Door' | 'Laminate Door' | 'Burma Teak Frame Flush' | string;
  bathroomDoor: 'WPC Door' | 'FRP / ERP Door' | 'FRP / WPC Laminated' | string;
}

export interface WindowSelection {
  primaryMaterial: 'uPVC' | 'Wood' | 'Aluminium';
  subGrade: string;
}

export interface ElectricalSelection {
  conduit: 'Heavy-Duty ISI Marked PVC';
  wireTier: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)';
}

export interface SanitaryFixtureOverrides {
  wcCount?: number;
  washBasinCount?: number;
  showerCount?: number;
  healthFaucetCount?: number;
}

export interface BathroomFittingSelection {
  sanitaryTier:
    | 'Mass Market (Cera / Hindware / Parryware)'
    | 'Essential (Cera / Hindware / Parryware)'
    | 'Premium (Jaquar / Kohler / Grohe)'
    | 'Luxury (Toto / Duravit)'
    | 'Luxury (Toto / Hansgrohe / Duravit)'
    | string;
  cpvcBrand: 'Ashirwad' | 'Supreme' | 'Astral' | string;
  fixtureOverrides?: SanitaryFixtureOverrides;
}

export interface PaintingSelection {
  baseLayer: 'Putty + Primer';
  internalPaint: 'Tractor Emulsion' | 'Premium Emulsion' | 'Royale Luxury Emulsion' | 'Royale Luxury Silk' | string;
  externalPaint: 'Ultima Weather Proof' | 'Texture Finish' | 'Ace Exterior Emulsion' | 'Apex Ultima Protek' | string;
  brand: 'Asian Paints' | 'Berger Paints' | 'Dulux' | 'Asian Paints Royale' | string;
}

export interface EngineInput {
  city: CityLocation;
  authority: string;
  plotLength: number; // ft
  plotWidth: number;  // ft
  roadWidthFt?: number; // Road width (ft), affects FAR and height restrictions
  frontSetback?: number; // ft
  rearSetback?: number;  // ft
  leftSetback?: number;  // ft
  rightSetback?: number; // ft
  builtUpAreaPerFloor?: number; // User-selected desired BUA per floor (sq.ft)
  userSelectedBUA?: number; // Total user-selected BUA across floors (sq.ft)
  houseType: HouseType;
  floors: number;     // 1=G, 2=G+1, 3=G+2, 4=G+3, 5=G+4
  parkingType: 'Stilt' | 'Stilt Parking' | 'Normal Ground' | 'EV Charging Ready';
  carCount: number;
  bikeCount: number;
  evCharging: boolean;
  liftRequired: boolean;
  rooms: RoomCounts;
  qualityTier: QualityTier;
  materialBrands: MaterialBrandSelection;
  fixtureOverrides?: SanitaryFixtureOverrides;
  // Granular client selections
  flooringZones: ZoneFlooringSelection;
  wallCladding: WallCladdingSelection;
  doors: DoorSelection;
  windows: WindowSelection;
  electrical: ElectricalSelection;
  bathroomFittings: BathroomFittingSelection;
  painting: PaintingSelection;
}

// ────────────────────────────────────────────────────────────
// SPACE & BUILDING MODEL (PDF Section 3, 4, 5)
// ────────────────────────────────────────────────────────────

export interface SpaceModelItem {
  id: string;
  type: keyof RoomCounts | 'mainDwelling' | 'terrace' | 'staircase' | 'parking';
  name: string;
  floorIndex: number;
  floorName: string;
  length: number; // ft
  width: number;  // ft
  area: number;   // sq.ft (length × width)
  perimeter: number; // ft (2 × (length + width))
  height: number;    // ft (consumes wallHeightFt)
  doorCount: number;
  doorOpeningAreaSqFt: number;
  windowCount: number;
  windowOpeningAreaSqFt: number;
  wetArea: boolean;
  flooringAreaSqFt: number;
  grossWallAreaSqFt: number; // perimeter × height
  netWallAreaSqFt: number;   // grossWallArea - doorOpenings - windowOpenings
  ceilingAreaSqFt: number;   // length × width
  paintableAreaSqFt: number; // netWallArea + ceilingArea
  dadoTileAreaSqFt: number;  // bathroom/kitchen wall tiles
  waterproofingAreaSqFt: number; // floor + upturn
  // Point counts
  lightPoints: number;
  fanPoints: number;
  socketPoints: number;
  acPoints: number;
  tvDataPoints: number;
  geyserPoints: number;
  // Plumbing counts
  waterPoints: number;
  drainagePoints: number;
  wcCount: number;
  washBasinCount: number;
  showerCount: number;
  healthFaucetCount: number;
  floorDrainCount: number;
  sinkCount: number;
}

export interface BuildingFloorModel {
  floorIndex: number;
  floorName: string;
  floorAreaSqFt: number;
  spaces: SpaceModelItem[];
  totalFloorWallAreaSqFt: number;
  totalFloorCeilingAreaSqFt: number;
  totalFloorPaintableAreaSqFt: number;
  totalFloorDoorsCount: number;
  totalFloorWindowsCount: number;
}

export interface BuildingModel {
  floors: BuildingFloorModel[];
  allSpaces: SpaceModelItem[];
  externalPerimeterFt: number;
  grossExternalWallAreaSqFt: number;
  netExternalWallAreaSqFt: number;
  grossInternalWallAreaSqFt: number;
  netInternalWallAreaSqFt: number;
  totalCeilingAreaSqFt: number;
  internalPaintableAreaSqFt: number;
  externalPaintableAreaSqFt: number;
  totalPaintableAreaSqFt: number;
  totalNetWallAreaSqFt: number;
  totalWallVolumeCuM: number;
  totalBlockCount: number;
  totalDoorOpeningAreaSqFt: number;
  totalWindowOpeningAreaSqFt: number;
}

// ────────────────────────────────────────────────────────────
// DOOR & WINDOW SCHEDULES (PDF Section 13, 14)
// ────────────────────────────────────────────────────────────

export interface DoorScheduleItem {
  code: string;
  description: string;
  spaceType: string;
  quantity: number;
  unit: string;
  openingSize: string; // e.g. "3.5 ft × 7.0 ft"
  openingAreaSqFt: number;
  material: string;
  specification: string;
  unitRate: number;
  amount: number;
}

export interface WindowScheduleItem {
  code: string;
  description: string;
  spaceType: string;
  count: number;              // Explicit opening count
  widthFt: number;            // Opening width in ft
  heightFt: number;           // Opening height in ft
  unitAreaSqFt: number;       // widthFt × heightFt
  totalOpeningAreaSqFt: number; // count × unitAreaSqFt
  totalAreaSqFt: number;      // count × unitAreaSqFt (alias for totalOpeningAreaSqFt)
  quantity: number;           // equals totalOpeningAreaSqFt when unit is 'Sq Ft' so quantity × unitRate = amount holds
  unit: string;               // 'Sq Ft'
  openingSize: string;        // e.g. "5.0 ft × 4.0 ft"
  openingAreaSqFt: number;    // unitAreaSqFt per opening
  frameAreaSqFt: number;
  shutterAreaSqFt: number;
  grillAreaSqFt: number;
  material: string;
  specification: string;
  unitRate: number;           // area rate per Sq Ft
  amount: number;             // totalOpeningAreaSqFt × unitRate
}

// ────────────────────────────────────────────────────────────
// AREA & SETBACK RESULTS (PDF Section 5)
// ────────────────────────────────────────────────────────────

export interface SetbackGeometry {
  frontSetbackFt: number;
  rearSetbackFt: number;
  leftSetbackFt: number;
  rightSetbackFt: number;
  source: string;
}

export interface AreaResult {
  plotAreaSqFt: number;
  plotLength: number;
  plotWidth: number;
  roadWidthFt: number;
  setbacks: SetbackGeometry;
  statutorySetbacks: SetbackGeometry;
  buildableLengthFt: number;
  buildableWidthFt: number;
  buildableFootprintSqFt: number;
  maxAllowableBUAPerFloorSqFt: number;
  buaPerFloorSqFt: number;
  recommendedBUAPerFloorSqFt: number;
  recommendedBUATotalSqFt: number;
  maximumPermissibleBUASqFt: number;
  permissibleBUASqFt: number;
  proposedBUASqFt: number;
  excessBUASqFt: number;
  minimumBUASqFt: number;
  userSelectedBUASqFt: number;
  maxPermissibleCoveragePct: number;
  maxPermissibleCoverageSqFt: number;
  permissibleFAR: number;
  validationState: 'valid' | 'above_recommended' | 'exceeds_permissible' | 'verification_required';
  buildableAreaSqFt: number;
  remainingGroundAreaSqFt: number;
  remainingGroundArea: number;
  groundCoveragePercentage: number;
  totalBUASqFt: number;
  superBUASqFt: number;
  parkingAreaSqFt: number;
  terraceSqFt: number;
  totalConstructedSqFt: number;
  isWithinPermissibleLimit: boolean;
  requiresClientConfirmation: boolean;
  confirmationMessage?: string;
  authorityMetadata: {
    city: string;
    authority: string;
    authorityFullName?: string;
    governingFramework?: string;
    ruleId: string;
    ruleVersion: string;
    effectiveDate: string;
    source: string;
    disclaimer: string;
    requiresConfirmation: boolean;
    confirmationReason?: string;
  };
}

// ────────────────────────────────────────────────────────────
// PHYSICAL MATERIAL TAKEOFF (SECTION B QUANTITIES)
// ────────────────────────────────────────────────────────────

export interface MaterialQuantities {
  // Structure & Rebar
  steelKg: number;
  steelTonnes: number;
  steelFactorKgPerSqFt: number;
  cementBags: number;
  // Sand & Aggregates (Direct Thumb Rules)
  mSandCuFt: number;
  pSandCuFt: number;
  sandCuFt: number; // Total sand (M-Sand + P-Sand)
  coarseAggregateCuFt: number;
  // Masonry (Geometry & Specification-Driven)
  netWallAreaSqFt: number;
  wallVolumeCuM: number;
  masonryMaterial: string;
  masonryBrand: string;
  masonrySizeLabel: string;
  masonryVolumeCuM: number;
  masonryUnitsCount: number;
  masonryUnit: string;
  masonryWastagePct: number;
  masonryUnitRate: number;
  masonryAmount: number;
  aacBlocksCuM: number;
  aacBlocksPieces: number;
  // Waterproofing
  bathroomWaterproofingSqFt: number;
  terraceWaterproofingSqFt: number;
  sumpWaterproofingSqFt: number;
  waterproofingAreaSqFt: number;
  // Flooring & Cladding
  floorTilesSqFt: number;
  bathroomDadoTileSqFt: number;
  kitchenDadoTileSqFt: number;
  wallTilesSqFt: number; // Total wall tiles
  graniteSlabsSqFt: number;
  // Finishing & Paint
  internalWallAreaSqFt: number;
  ceilingAreaSqFt: number;
  interiorPaintAreaSqFt: number;
  exteriorPaintAreaSqFt: number;
  totalPaintableAreaSqFt: number;
  puttyAreaSqFt: number;
  interiorPaintLitres: number;
  exteriorPaintLitres: number;
  puttyKg: number;
  // Openings
  mainDoorsCount: number;
  internalDoorsCount: number;
  bathroomDoorsCount: number;
  totalDoorsCount: number;
  doorOpeningAreaSqFt: number;
  windowsCount: number;
  windowAreaSqFt: number;
  grillAreaSqFt: number;
  // Electrical
  totalElectricalPoints: number;
  lightingPoints: number;
  fanPoints: number;
  socketPoints: number;
  acPoints: number;
  geyserPoints: number;
  tvDataPoints: number;
  evPoints: number;
  mainDBCount: number;
  floorDBCount: number;
  switchModules: number;
  conduitsMetres: number;
  electricalWireMetres: number;
  wire1_5SqMmMetres: number;
  wire2_5SqMmMetres: number;
  wire4SqMmMetres: number;
  wire6SqMmMetres: number;
  // Plumbing & Sanitary
  totalWaterPoints: number;
  totalDrainagePoints: number;
  cpvcSupplyMetres: number;
  swrDrainMetres: number;
  wcCount: number;
  washBasinCount: number;
  showerCount: number;
  healthFaucetCount: number;
  floorTrapsCount: number;
  kitchenSinkCount: number;
  bathroomFixtureSets: number;
  overheadTankLitres: number;
}

// ────────────────────────────────────────────────────────────
// FOUR CORE SECTIONS (PDF Section 26)
// ────────────────────────────────────────────────────────────

// SECTION A: WHAT WE BUILD (Works BOQ)
export type BOQCategory =
  | 'Site Preparation'
  | 'Excavation & Earthwork'
  | 'PCC & Sub-structure'
  | 'Foundation'
  | 'Plinth'
  | 'RCC Structure'
  | 'Masonry'
  | 'Plastering'
  | 'Roofing'
  | 'Flooring'
  | 'Doors & Joinery'
  | 'Windows & Glazing'
  | 'Electrical'
  | 'Plumbing & Sanitary'
  | 'Painting & Waterproofing'
  | 'Fixtures & Finishes';

export interface BOQItem {
  slNo: number;
  code: string;
  category: BOQCategory;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;      // ₹
  amount: number;        // ₹
  percentage: number;    // Dynamic % = (amount / totalBOQAmount) * 100
  brand: string;
  remarks: string;
  formula?: string;
}

// SECTION B: WHAT WE CONSUME (Material Schedule)
export interface MaterialScheduleItem {
  slNo: number;
  material: string;
  category: 'Rebar' | 'Cement' | 'Aggregates' | 'Masonry' | 'Flooring' | 'Paint' | 'Waterproofing' | 'Pipes & Wire' | 'Other';
  brand: string;
  specification: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  sourceFormula: string;
}

// SECTION C: WHAT WE INSTALL (Fixtures & Fittings Schedule)
export interface FixtureScheduleItem {
  slNo: number;
  category: 'Doors' | 'Windows' | 'Sanitary Fixtures' | 'Electrical Fixtures' | 'Plumbing Tanks & Pumps' | 'Special Equipment';
  item: string;
  brand: string;
  specification: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  location: string;
}

// SECTION D: WHAT IT COSTS (Cost Summary & Budget Result)
export interface BudgetHead {
  id: string;
  name: string;
  percentage: number;
  allocatedAmount: number;
  color: string;
}

export interface CommercialReconciliation {
  directMaterialCost: number; // Section B physical material takeoff
  directLabourCost: number;   // Works execution labour
  equipmentCost: number;      // Machinery, staging, site setup
  contractorMargin: number;   // Execution margin
  contingency: number;        // Risk allowance
  gstAmount: number;          // Statutory taxes
  professionalFees: number;   // Architecture & Engineering design fees
  totalProjectCost: number;
  reconciledSum: number;
  unexplainedResidual: number;
  isFullyReconciled: boolean;
}

export interface BudgetResult {
  heads: BudgetHead[];
  structuralCost: number;
  finishingCost: number;
  mepCost: number;
  baseConstructionCost: number;
  professionalFees: number;
  contractorMargin: number;
  contingency: number;
  gstAmount: number;
  totalProjectCost: number;
  costPerSqFt: number;
  commercialReconciliation?: CommercialReconciliation;
}

// ────────────────────────────────────────────────────────────
// AUDIT TRACEABILITY & TIMELINE / PAYMENT
// ────────────────────────────────────────────────────────────

export interface CalculationTraceStep {
  ruleId?: string;
  parameter: string;
  category: string;
  inputs: Record<string, any>;
  formula: string;
  rawQuantity?: number;
  adjustments?: string | number;
  finalQuantity?: number;
  unitRate?: number;
  amount?: number;
  tradeCategory?: string;
  assumption: string;
  explanation?: string;
  result: number | string;
  unit: string;
}

export interface TimelineStage {
  stageNumber: string;
  title: string;
  startMonth: number;
  durationMonths: number;
  endMonth: number;
  isCriticalPath: boolean;
}

export interface TimelineResult {
  totalMonths: number;
  stages: TimelineStage[];
  constructionStartDate: string;
  estimatedHandoverDate: string;
}

export interface PaymentMilestone {
  stage: number;
  title: string;
  description: string;
  percentage: number;
  amount: number;
  targetDate: string;
  status: 'Completed' | 'Due' | 'Upcoming';
  bankDisbursement: boolean;
}

export interface PaymentPlanSummary {
  isComplete: boolean;
  totalAllocatedPercentage: number;
  unallocatedPercentage: number;
  totalAllocatedAmount: number;
  unallocatedAmount: number;
  scheduleType: 'Complete' | 'Early-Stage';
}

export interface ProcurementItem {
  id: string;
  trade: string;
  item: string;
  brand: string;
  specification: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalCost: number;
  supplierNote: string;
  leadTimeDays: number;
}

// ────────────────────────────────────────────────────────────
// AUTOMATED QA GATE TYPES (P0.7)
// ────────────────────────────────────────────────────────────

export interface QACheckResult {
  id: string;
  name: string;
  passed: boolean;
  isBlocking: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface QAGateResult {
  passed: boolean;
  blockingErrors: string[];
  warnings: string[];
  checks: QACheckResult[];
  validatedAt: string;
}

// ────────────────────────────────────────────────────────────
// REPORT DATA
// ────────────────────────────────────────────────────────────

export interface ReportData {
  projectId: string;
  generatedAt: string;
  clientName: string;
  engineVersion: string;
  input: EngineInput;
  area: AreaResult;
  buildingModel: BuildingModel;
  quantities: MaterialQuantities;
  budget: BudgetResult;
  // The 4 Core Customer-Facing Sections
  sectionA_WorksBOQ: BOQItem[];
  sectionB_MaterialSchedule: MaterialScheduleItem[];
  sectionC_FixtureSchedule: FixtureScheduleItem[];
  sectionD_CostSummary: BudgetResult;
  // Supporting Schedules
  doorSchedule: DoorScheduleItem[];
  windowSchedule: WindowScheduleItem[];
  timeline: TimelineResult;
  paymentPlan: PaymentMilestone[];
  paymentSummary?: PaymentPlanSummary;
  procurement: ProcurementItem[];
  recommendations: string[];
  trace: CalculationTraceStep[];
  parameterTable: QSParameterItem[];
  rateSourceMetadata?: RateSourceMetadata;
  qaResult?: QAGateResult;
  commercialReconciliation?: CommercialReconciliation;
}

// ────────────────────────────────────────────────────────────
// MASTER CALCULATION RESULT (Single Source of Truth)
// ────────────────────────────────────────────────────────────

export interface CalculationResult {
  input: EngineInput;
  area: AreaResult;
  buildingModel: BuildingModel;
  quantities: MaterialQuantities;
  doorSchedule: DoorScheduleItem[];
  windowSchedule: WindowScheduleItem[];
  boq: BOQItem[]; // Section A
  materialSchedule: MaterialScheduleItem[]; // Section B
  fixtureSchedule: FixtureScheduleItem[]; // Section C
  budget: BudgetResult; // Section D
  timeline: TimelineResult;
  paymentPlan: PaymentMilestone[];
  paymentSummary?: PaymentPlanSummary;
  procurement: ProcurementItem[];
  report: ReportData;
  trace: CalculationTraceStep[];
  parameterTable: QSParameterItem[];
  rateSourceMetadata?: RateSourceMetadata;
  qaResult?: QAGateResult;
  commercialReconciliation?: CommercialReconciliation;
  calculatedAt: string;
}
