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
  // ── STEP 1: Built-Up Area & Setback Geometry ──────────────
  const area = calculateArea(input);

  // ── STEP 2: Canonical Space & Building Model ──────────────
  const buildingModel = generateBuildingModel(input, area);

  // ── STEP 3: Door & Window Schedules ───────────────────────
  const {
    mainDoorsCount,
    internalDoorsCount,
    bathroomDoorsCount,
    totalDoorsCount,
    doorOpeningAreaSqFt,
    doorSchedule,
  } = calculateDoors(input);

  const {
    windowsCount,
    windowAreaSqFt,
    grillAreaSqFt,
    windowSchedule,
  } = calculateWindows(input);

  // ── STEP 4: Physical Material Quantities ──────────────────
  const { steelTonnes, steelKg, steelFactorKgPerSqFt } = calculateSteel(input, area);
  const { cementBags, bagsPerSqFt: cementFactorBagsPerSqFt } = calculateCement(input, area);
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
    wallVolumeCuM,
    mSandCuFt,
    pSandCuFt,
    sandCuFt,
    coarseAggregateCuFt,
  } = calculateMasonry(input, area, buildingModel);

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
  } = calculateFlooring(input, area, buildingModel);

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
  } = calculatePaint(input, area, buildingModel);

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
  } = calculateElectrical(input, area, buildingModel);

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
  } = calculatePlumbing(input, area, buildingModel);

  // Unified Material Takeoff Object
  const quantities: MaterialQuantities = {
    steelKg,
    steelTonnes,
    steelFactorKgPerSqFt,
    cementBags,
    mSandCuFt,
    pSandCuFt,
    sandCuFt,
    coarseAggregateCuFt,
    netWallAreaSqFt,
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
  };

  // ── STEP 5: SECTION A – Works BOQ (What We Build) ─────────
  const boq = generateBOQ(input, area, quantities, buildingModel, doorSchedule, windowSchedule);

  // ── STEP 6: SECTION B – Material Schedule (What We Consume)
  const materialSchedule = generateMaterialSchedule(input, quantities);

  // ── STEP 7: SECTION C – Fixture Schedule (What We Install) ─
  const fixtureSchedule = generateFixtureSchedule(input, quantities, doorSchedule, windowSchedule);

  // ── STEP 7.5: SECTION E – Labour Schedule (Labour Takeoff) ──
  const labourResult = calculateLabour(input, area, quantities, buildingModel);
  const labourSchedule = labourResult.items;

  // ── STEP 8: SECTION D – Budget (What It Costs) ────────────
  const budget = calculateBudget(input, area, boq, materialSchedule, fixtureSchedule, labourSchedule);

  // ── STEP 9: Timeline ──────────────────────────────────────
  const timeline = calculateTimeline(input, area);

  // ── STEP 10: Payment Plan ─────────────────────────────────
  const paymentPlan = calculatePaymentPlan(input, budget, timeline);
  const paymentSummary = getPaymentPlanSummary(paymentPlan, budget.totalProjectCost);

  // ── STEP 11: Procurement List ─────────────────────────────
  const procurement = generateProcurementList(input, quantities, materialSchedule);

  // ── STEP 12: Calculation Traceability Audit ───────────────
  const trace = generateCalculationTrace(input, area, quantities, buildingModel, budget);

  // ── STEP 13: Report Assembly ──────────────────────────────
  const report = assembleReport(
    input,
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
    input,
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
    trace,
    parameterTable,
    rateSourceMetadata,
    commercialReconciliation,
    resolvedConfiguration: configResolver.getResolvedConfigurationSnapshot({
      city: input.city,
      packageTier: input.qualityTier,
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
