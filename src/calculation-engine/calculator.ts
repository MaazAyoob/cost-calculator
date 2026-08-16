// ============================================================
// MASTER CALCULATOR ORCHESTRATOR
// Runs all modules in strict linear engineering dependency order:
// Input → Area → Quantities → BOQ → Budget → Timeline → Payment → Procurement → Report
// ============================================================

import { EngineInput, CalculationResult, MaterialQuantities } from './types';

import { calculateArea }             from './modules/bua';
import { calculateSteel }            from './modules/steel';
import { calculateCement }           from './modules/cement';
import { calculateMasonry }          from './modules/brick';
import { calculateFlooring }         from './modules/flooring';
import { calculatePaint }            from './modules/paint';
import { calculateDoors }            from './modules/doors';
import { calculateWindows }          from './modules/windows';
import { calculateElectrical }       from './modules/electrical';
import { calculatePlumbing }         from './modules/plumbing';
import { calculateBudget }           from './modules/budget';
import { calculateTimeline }         from './modules/timeline';
import { calculatePaymentPlan }      from './modules/payment';
import { generateBOQ }               from './modules/boq';
import { generateProcurementList }   from './modules/materials';
import { assembleReport }            from './modules/report';

export function runCalculator(input: EngineInput): CalculationResult {
  // ── STEP 1: Area ──────────────────────────────────────────
  const area = calculateArea(input);

  // ── STEP 2: Physical Material Quantities ──────────────────
  const { steelTonnes, steelKg }    = calculateSteel(input, area);
  const { cementBags }              = calculateCement(input, area);
  const { aacBlocksCuM, sandCuFt, aggregateCuFt, concreteCuM } = calculateMasonry(input, area);
  const { floorTilesSqFt, wallTilesSqFt, graniteSlabsSqFt, waterproofingAreaSqFt } = calculateFlooring(input, area);
  const {
    interiorPaintAreaSqFt, exteriorPaintAreaSqFt, puttyAreaSqFt,
  } = calculatePaint(input, area);
  const { mainDoorsCount, internalDoorsCount, bathroomDoorsCount } = calculateDoors(input);
  const { windowsCount, windowAreaSqFt }       = calculateWindows(input, area);
  const { electricalWireMetres, conduitsMetres, switchModules, lightingPoints } = calculateElectrical(input, area);
  const { cpvcSupplyMetres, swrDrainMetres, bathroomFixtureSets, floorTrapsCount } = calculatePlumbing(input, area);

  const quantities: MaterialQuantities = {
    steelTonnes,
    cementBags,
    concreteCuM,
    aacBlocksCuM,
    sandCuFt,
    aggregateCuFt,
    waterproofingAreaSqFt,
    floorTilesSqFt,
    wallTilesSqFt,
    graniteSlabsSqFt,
    interiorPaintAreaSqFt,
    exteriorPaintAreaSqFt,
    puttyAreaSqFt,
    mainDoorsCount,
    internalDoorsCount,
    bathroomDoorsCount,
    windowsCount,
    windowAreaSqFt,
    electricalWireMetres,
    conduitsMetres,
    switchModules,
    lightingPoints,
    cpvcSupplyMetres,
    swrDrainMetres,
    bathroomFixtureSets,
    floorTrapsCount,
  };

  // ── STEP 3: Itemized BOQ (Quantity × Unit Rate) ───────────
  const boq = generateBOQ(input, area, quantities);

  // ── STEP 4: Budget (Direct BOQ Aggregation) ───────────────
  const budget = calculateBudget(input, area, boq);

  // ── STEP 5: Timeline ──────────────────────────────────────
  const timeline = calculateTimeline(input, area);

  // ── STEP 6: Payment Plan ──────────────────────────────────
  const paymentPlan = calculatePaymentPlan(input, budget, timeline);

  // ── STEP 7: Procurement List ──────────────────────────────
  const procurement = generateProcurementList(input, quantities, budget);

  // ── STEP 8: Report Assembly ───────────────────────────────
  const report = assembleReport(input, area, quantities, budget, timeline, paymentPlan, boq, procurement);

  return {
    input,
    area,
    quantities,
    budget,
    timeline,
    paymentPlan,
    boq,
    procurement,
    report,
    calculatedAt: new Date().toISOString(),
  };
}
