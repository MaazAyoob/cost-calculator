// ============================================================
// MASTER CALCULATOR ORCHESTRATOR
// Strictly follows Hutty Pilot Specification Linear Dependency Pipeline:
//
// USER INPUT
//     ↓
// ENGINEERING & SETBACK RULES
//     ↓
// BUILT-UP AREA & GEOMETRY
//     ↓
// CANONICAL SPACE & BUILDING MODEL
//     ↓
// DOOR & WINDOW SCHEDULES
//     ↓
// PHYSICAL QUANTITY ENGINES (Steel, Cement, Aggregates, Masonry, Paint, MEP)
//     ↓
// SECTION A: WORKS BOQ (What We Build)
//     ↓
// SECTION B: MATERIAL SCHEDULE (What We Consume)
//     ↓
// SECTION C: FIXTURES & FITTINGS SCHEDULE (What We Install)
//     ↓
// SECTION D: BUDGET & COST SUMMARY (What It Costs)
//     ↓
// TIMELINE, PAYMENT, PROCUREMENT & AUDIT TRACE
//     ↓
// UNIFIED MASTER CALCULATION RESULT (Single Source of Truth)
// ============================================================

import {
  EngineInput,
  CalculationResult,
  MaterialQuantities,
  QSParameterItem,
} from './types';

import { calculateArea }             from './modules/bua';
import { generateBuildingModel }     from './modules/spaceModel';
import { calculateDoors }            from './modules/doors';
import { calculateWindows }          from './modules/windows';
import { calculateSteel }            from './modules/steel';
import { calculateCement }           from './modules/cement';
import { calculateRCC }              from './modules/rcc';
import { calculateMasonry }          from './modules/brick';
import { calculateFlooring }         from './modules/flooring';
import { calculatePaint }            from './modules/paint';
import { calculateElectrical }       from './modules/electrical';
import { calculatePlumbing }         from './modules/plumbing';
import { generateBOQ }               from './modules/boq';
import { generateMaterialSchedule, generateProcurementList } from './modules/materials';
import { generateFixtureSchedule }   from './modules/fixtures';
import { calculateLabour }            from './modules/labour';
import { calculateBudget }           from './modules/budget';
import { calculateTimeline }         from './modules/timeline';
import { calculatePaymentPlan, getPaymentPlanSummary } from './modules/payment';
import { generateCalculationTrace }  from './modules/trace';
import { assembleReport }            from './modules/report';
import { generateStepExplanations }  from './modules/explanations';
import { runQAGate }                 from './modules/qaGate';
import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from './data/engineeringAssumptions';
import { rateService }               from './data/rateService';
import { configResolver }            from './config';

export function runCalculator(input: EngineInput): CalculationResult {
  // Normalize rooms with safe defaults if omitted or partial
  const floors = Math.max(0, input.floors || 0);
  const normalizedRooms = {
    living: input.rooms?.living ?? 1,
    dining: input.rooms?.dining ?? 1,
    kitchen: input.rooms?.kitchen ?? 1,
    bedrooms: input.rooms?.bedrooms ?? Math.max(1, floors),
    bathrooms: input.rooms?.bathrooms ?? Math.max(1, floors),
    commonToilets: input.rooms?.commonToilets ?? 0,
    balcony: input.rooms?.balcony ?? (floors > 1 ? floors - 1 : 0),
    utility: input.rooms?.utility ?? 1,
    pooja: input.rooms?.pooja ?? 1,
    office: input.rooms?.office ?? 0,
    storeRoom: input.rooms?.storeRoom ?? 0,
  };

  const city = input.city || 'Bangalore';
  const qualityTier = input.qualityTier || 'Premium';

  const rawBrands = input.materialBrands || ({} as any);
  const normalizedMaterialBrands = {
    steel: rawBrands.steel || 'Tata Tiscon',
    cement: rawBrands.cement || 'UltraTech',
    ...(rawBrands.masonry ? { masonry: rawBrands.masonry } : {}),
    doors: rawBrands.doors || 'Teak Wood',
    windows: rawBrands.windows || 'UPVC',
    flooring: rawBrands.flooring || 'Vitrified Tiles',
    bathroom: rawBrands.bathroom || 'Kohler',
    electrical: rawBrands.electrical || (input.electrical?.wireTier || 'Finolex FRLS'),
    paint: rawBrands.paint || 'Asian Paints Royale',
  };

  const normalizedElectrical = {
    conduit: input.electrical?.conduit || 'Heavy-Duty ISI Marked PVC',
    wireTier: input.electrical?.wireTier || normalizedMaterialBrands.electrical || 'Finolex FRLS',
  };

  const normalizedInput: EngineInput = {
    ...input,
    city,
    qualityTier,
    rooms: normalizedRooms,
    materialBrands: normalizedMaterialBrands,
    electrical: normalizedElectrical,
  };

  // ── STEP 1: Built-Up Area & Setback Geometry ──────────────
  const area = calculateArea(normalizedInput);

  // ── STEP 2: Canonical Space & Building Model ──────────────
  const buildingModel = generateBuildingModel(normalizedInput, area);

  // ── STEP 3: Door & Window Schedules ───────────────────────
  const {
    mainDoorsCount,
    internalDoorsCount,
    bathroomDoorsCount,
    totalDoorsCount,
    doorOpeningAreaSqFt,
    doorSchedule,
  } = calculateDoors(normalizedInput);

  const {
    windowsCount,
    windowAreaSqFt,
    grillAreaSqFt,
    windowSchedule,
  } = calculateWindows(normalizedInput);

  // ── STEP 4: Physical Material Quantities ──────────────────
  const { steelTonnes, steelKg, steelFactorKgPerSqFt } = calculateSteel(normalizedInput, area);
  const { cementBags, bagsPerSqFt: cementFactorBagsPerSqFt } = calculateCement(normalizedInput, area);
  const rcc = calculateRCC(normalizedInput, area);
  const {
    masonryMaterial,
    masonryBrand,
    masonrySizeLabel,
    masonryVolumeCuM,
    masonryUnitsCount,
    masonryUnit,
    masonryWastagePct,
    masonryUnitRate,
    masonryAmount,
    aacBlocksCuM,
    aacBlocksPieces,
    netWallAreaSqFt,
    grossWallAreaSqFt,
    wallThicknessMm,
    blockWallCoverageSqFt,
    baseBlockCount,
    finalBlocksRequired,
    wallVolumeCuM,
    mSandCuFt,
    pSandCuFt,
    sandCuFt,
    coarseAggregateCuFt,
  } = calculateMasonry(normalizedInput, area, buildingModel);

  const {
    floorTilesSqFt,
    bathroomDadoTileSqFt,
    kitchenDadoTileSqFt,
    wallTilesSqFt,
    graniteSlabsSqFt,
    bathroomWaterproofingSqFt,
    terraceWaterproofingSqFt,
    sumpWaterproofingSqFt,
    waterproofingAreaSqFt,
    flooringRawAreaSqFt,
    flooringCirculationSqFt,
    flooringWastagePct,
  } = calculateFlooring(normalizedInput, area, buildingModel);

  const {
    internalWallAreaSqFt,
    ceilingAreaSqFt,
    interiorPaintAreaSqFt,
    exteriorPaintAreaSqFt,
    totalPaintableAreaSqFt,
    puttyAreaSqFt,
    interiorPaintLitres,
    exteriorPaintLitres,
    puttyKg,
    interiorCoverageSqFtPerLitre: interiorPaintCoverageSqFtPerLitre,
    exteriorCoverageSqFtPerLitre: exteriorPaintCoverageSqFtPerLitre,
    puttyKgPerSqFt,
  } = calculatePaint(normalizedInput, area, buildingModel);

  const {
    lightingPoints,
    fanPoints,
    socketPoints,
    acPoints,
    geyserPoints,
    tvDataPoints,
    evPoints,
    mainDBCount,
    floorDBCount,
    totalElectricalPoints,
    switchModules,
    conduitsMetres,
    electricalWireMetres,
    wire1_5SqMmMetres,
    wire2_5SqMmMetres,
    wire4SqMmMetres,
    wire6SqMmMetres,
  } = calculateElectrical(normalizedInput, area, buildingModel);

  const {
    totalWaterPoints,
    totalDrainagePoints,
    cpvcSupplyMetres,
    swrDrainMetres,
    wcCount,
    washBasinCount,
    showerCount,
    healthFaucetCount,
    floorTrapsCount,
    kitchenSinkCount,
    bathroomFixtureSets,
    overheadTankLitres,
  } = calculatePlumbing(normalizedInput, area, buildingModel);

  // Unified Material Takeoff Object
  const quantities: MaterialQuantities = {
    steelKg,
    steelTonnes,
    steelFactorKgPerSqFt,
    cementBags,
    // RCC & Structural Concrete (Canonical Engine Intermediate Quantities)
    approxConcreteCuM: rcc.approxConcreteCuM,
    footingConcreteCuM: rcc.footingConcreteCuM,
    columnConcreteCuM: rcc.columnConcreteCuM,
    slabConcreteCuM: rcc.slabConcreteCuM,
    plinthConcreteCuM: rcc.plinthConcreteCuM,
    staircaseConcreteCuM: rcc.staircaseConcreteCuM,
    rccConcreteTotalCuM: rcc.rccConcreteTotalCuM,
    totalStructuralConcreteCuM: rcc.totalStructuralConcreteCuM,
    mSandCuFt,
    pSandCuFt,
    sandCuFt,
    coarseAggregateCuFt,
    netWallAreaSqFt,
    grossWallAreaSqFt,
    wallThicknessMm,
    blockWallCoverageSqFt,
    baseBlockCount,
    finalBlocksRequired,
    wallVolumeCuM,
    masonryMaterial,
    masonryBrand,
    masonrySizeLabel,
    masonryVolumeCuM,
    masonryUnitsCount,
    masonryUnit,
    masonryWastagePct,
    masonryUnitRate,
    masonryAmount,
    aacBlocksCuM,
    aacBlocksPieces,
    bathroomWaterproofingSqFt,
    terraceWaterproofingSqFt,
    sumpWaterproofingSqFt,
    waterproofingAreaSqFt,
    floorTilesSqFt,
    bathroomDadoTileSqFt,
    kitchenDadoTileSqFt,
    wallTilesSqFt,
    graniteSlabsSqFt,
    internalWallAreaSqFt,
    ceilingAreaSqFt,
    interiorPaintAreaSqFt,
    exteriorPaintAreaSqFt,
    totalPaintableAreaSqFt,
    puttyAreaSqFt,
    interiorPaintLitres,
    exteriorPaintLitres,
    puttyKg,
    mainDoorsCount,
    internalDoorsCount,
    bathroomDoorsCount,
    totalDoorsCount,
    doorOpeningAreaSqFt,
    windowsCount,
    windowAreaSqFt,
    grillAreaSqFt,
    totalElectricalPoints,
    lightingPoints,
    fanPoints,
    socketPoints,
    acPoints,
    geyserPoints,
    tvDataPoints,
    evPoints,
    mainDBCount,
    floorDBCount,
    switchModules,
    conduitsMetres,
    electricalWireMetres,
    wire1_5SqMmMetres,
    wire2_5SqMmMetres,
    wire4SqMmMetres,
    wire6SqMmMetres,
    totalWaterPoints,
    totalDrainagePoints,
    cpvcSupplyMetres,
    swrDrainMetres,
    wcCount,
    washBasinCount,
    showerCount,
    healthFaucetCount,
    floorTrapsCount,
    kitchenSinkCount,
    bathroomFixtureSets,
    overheadTankLitres,
    cementFactorBagsPerSqFt,
    interiorPaintCoverageSqFtPerLitre,
    exteriorPaintCoverageSqFtPerLitre,
    puttyKgPerSqFt,
    flooringWastagePct,
    flooringRawAreaSqFt,
    flooringCirculationSqFt,
    staircaseRailingRft: Math.max(0, ((normalizedInput.floors || 1) - 1) * 24),
    balconyRailingRft: (normalizedInput.rooms?.balcony || 0) * 12,
    terraceRailingRft: (normalizedInput.floors || 0) >= 1 ? 45 : 0,
    mainGateSqFt: (normalizedInput.plotWidth || 0) > 0 ? 60 : 0,
    tankLadderCount: (normalizedInput.floors || 0) >= 1 ? 1 : 0,
    skylightAreaSqFt: normalizedInput.fabrication?.skylight && !normalizedInput.fabrication.skylight.includes('None') ? 24 : 0,
    elevationCladdingSqFt: normalizedInput.fabrication?.elevationCladding && !normalizedInput.fabrication.elevationCladding.includes('Paint Only') ? 180 : 0,
    balconyDoorsCount: normalizedInput.rooms?.balcony || 0,
  };

  // ── STEP 5: SECTION A – Works BOQ (What We Build) ─────────
  const boq = generateBOQ(normalizedInput, area, quantities, buildingModel, doorSchedule, windowSchedule);

  // ── STEP 6: SECTION B – Material Schedule (What We Consume)
  const materialSchedule = generateMaterialSchedule(normalizedInput, quantities);

  // ── STEP 7: SECTION C – Fixture Schedule (What We Install) ─
  const fixtureSchedule = generateFixtureSchedule(normalizedInput, quantities, doorSchedule, windowSchedule);

  // ── STEP 7.5: SECTION E – Labour Schedule (Labour Takeoff) ──
  const labourResult = calculateLabour(normalizedInput, area, quantities, buildingModel);
  const labourSchedule = labourResult.items;

  // ── STEP 8: SECTION D – Budget (What It Costs) ────────────
  const budget = calculateBudget(normalizedInput, area, boq, materialSchedule, fixtureSchedule, labourSchedule);

  // ── STEP 9: Timeline ──────────────────────────────────────
  const timeline = calculateTimeline(normalizedInput, area);

  // ── STEP 10: Payment Plan ─────────────────────────────────
  const paymentPlan = calculatePaymentPlan(normalizedInput, budget, timeline);
  const paymentSummary = getPaymentPlanSummary(paymentPlan, budget.totalProjectCost);

  // ── STEP 11: Procurement List ─────────────────────────────
  const procurement = generateProcurementList(normalizedInput, quantities, materialSchedule);

  // ── STEP 12: Calculation Traceability Audit ───────────────
  const trace = generateCalculationTrace(normalizedInput, area, quantities, buildingModel, budget);

  // ── STEP 13: Report Assembly ──────────────────────────────
  const report = assembleReport(
    normalizedInput,
    area,
    buildingModel,
    quantities,
    budget,
    timeline,
    paymentPlan,
    boq,
    materialSchedule,
    fixtureSchedule,
    doorSchedule,
    windowSchedule,
    procurement,
    trace,
    labourSchedule
  );

  const parameterTable: QSParameterItem[] = Object.values(CENTRALIZED_ENGINEERING_ASSUMPTIONS);
  const commercialReconciliation = budget.commercialReconciliation;
  const rateSourceMetadata = rateService.getSourceMetadata();

  // Partial calculation result for QA gate validation
  const calculatedAt = new Date().toISOString();
  const partialResult: CalculationResult = {
    input: normalizedInput,
    area,
    buildingModel,
    quantities,
    doorSchedule,
    windowSchedule,
    boq,
    materialSchedule,
    fixtureSchedule,
    labourSchedule,
    budget,
    timeline,
    paymentPlan,
    paymentSummary,
    procurement,
    report,
    rcc,
    trace,
    parameterTable,
    rateSourceMetadata,
    commercialReconciliation,
    resolvedConfiguration: configResolver.getResolvedConfigurationSnapshot({
      city: normalizedInput.city,
      packageTier: normalizedInput.qualityTier,
    }),
    calculatedAt,
  };

  // ── STEP 14: Automated QA Gate (P0.7) ───────────────────────
  const qaResult = runQAGate(partialResult);
  partialResult.qaResult = qaResult;
  partialResult.report.qaResult = qaResult;
  partialResult.report.commercialReconciliation = commercialReconciliation;
  partialResult.report.paymentSummary = paymentSummary;
  partialResult.report.rateSourceMetadata = rateSourceMetadata;

  // ── STEP 15: Transparent Calculation Explanations (Pure Formatter) ──
  partialResult.explanations = generateStepExplanations(partialResult);

  return partialResult;
}
