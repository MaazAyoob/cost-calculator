// ============================================================
// CALCULATION AUDIT & TRACEABILITY ENGINE
// For every major quantity and cost line, exposes:
// parameter, category, inputs, formula, assumption, result, and unit.
// Enables full developer, QS, and bank audit traceability.
// ============================================================

import { EngineInput, AreaResult, MaterialQuantities, BudgetResult, CalculationTraceStep } from '../types';
import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from '../data/engineeringAssumptions';

const A = CENTRALIZED_ENGINEERING_ASSUMPTIONS;

export function generateCalculationTrace(
  input: EngineInput,
  area: AreaResult,
  qty: MaterialQuantities,
  budget: BudgetResult
): CalculationTraceStep[] {
  const steps: CalculationTraceStep[] = [];

  // 1. Plot Area
  steps.push({
    parameter: 'Plot Area',
    category: 'Building Geometry',
    inputs: { plotLength: `${input.plotLength} ft`, plotWidth: `${input.plotWidth} ft` },
    formula: `${input.plotLength} × ${input.plotWidth}`,
    assumption: 'User entered site dimensions',
    result: area.plotAreaSqFt,
    unit: 'Sq.Ft',
  });

  // 2. Maximum Allowable BUA Per Floor (Authority Setback Rule)
  steps.push({
    parameter: 'Maximum Allowable BUA / Floor',
    category: 'Building Geometry',
    inputs: { plotArea: `${area.plotAreaSqFt} sq.ft`, maxCoverageRatio: `${A.coverageFactor.value * 100}%` },
    formula: `${area.plotAreaSqFt} × ${A.coverageFactor.value}`,
    assumption: `BBMP / BDA / MUDA Statutory Coverage Benchmark = ${(A.coverageFactor.value * 100).toFixed(0)}%`,
    result: area.maxAllowableBUAPerFloorSqFt,
    unit: 'Sq.Ft',
  });

  // 3. User Selected BUA Per Floor
  steps.push({
    parameter: 'User Selected BUA / Floor',
    category: 'Building Geometry',
    inputs: { selectedBUAPerFloor: `${area.buaPerFloorSqFt} sq.ft`, withinLimit: area.isWithinPermissibleLimit ? 'Yes' : 'Requires Variance Confirmation' },
    formula: `${area.buaPerFloorSqFt}`,
    assumption: area.isWithinPermissibleLimit ? 'Direct user-specified floor plate' : 'Exceeds standard 60% coverage (Client Confirmation Required)',
    result: area.buaPerFloorSqFt,
    unit: 'Sq.Ft',
  });

  // 4. Remaining Ground Area
  steps.push({
    parameter: 'Remaining Open Ground Area',
    category: 'Building Geometry',
    inputs: { plotArea: `${area.plotAreaSqFt} sq.ft`, buaPerFloor: `${area.buaPerFloorSqFt} sq.ft` },
    formula: `${area.plotAreaSqFt} - ${area.buaPerFloorSqFt}`,
    assumption: 'Calculated on ground footprint only (Plot Area - BUA/Floor)',
    result: area.remainingGroundAreaSqFt,
    unit: 'Sq.Ft',
  });

  // 5. Ground Coverage Percentage
  steps.push({
    parameter: 'Ground Coverage Percentage',
    category: 'Building Geometry',
    inputs: { buaPerFloor: `${area.buaPerFloorSqFt} sq.ft`, plotArea: `${area.plotAreaSqFt} sq.ft` },
    formula: `(${area.buaPerFloorSqFt} ÷ ${area.plotAreaSqFt || 1}) × 100`,
    assumption: 'Actual footprint percentage on site',
    result: parseFloat(area.groundCoveragePercentage.toFixed(1)),
    unit: '%',
  });

  // 6. Total BUA
  steps.push({
    parameter: 'Total Built-up Area (BUA)',
    category: 'Building Geometry',
    inputs: { buaPerFloor: `${area.buaPerFloorSqFt} sq.ft`, floors: input.floors },
    formula: `${area.buaPerFloorSqFt} × ${input.floors}`,
    assumption: 'Multiplied across all approved residential storeys',
    result: area.totalBUASqFt,
    unit: 'Sq.Ft',
  });

  // 7. Super BUA
  steps.push({
    parameter: 'Super Built-up Area',
    category: 'Building Geometry',
    inputs: { totalBUA: `${area.totalBUASqFt} sq.ft`, superBuaFactor: A.superBuaFactor.value },
    formula: `${area.totalBUASqFt} × ${A.superBuaFactor.value}`,
    assumption: `Super BUA Circulation Multiplier = ${A.superBuaFactor.value}`,
    result: area.superBUASqFt,
    unit: 'Sq.Ft',
  });

  // 6. Steel
  const steelRatio = input.qualityTier === 'Luxury'
    ? A.steelKgPerSqFtLuxury.value
    : input.qualityTier === 'Essential'
    ? A.steelKgPerSqFtEssential.value
    : A.steelKgPerSqFtPremium.value;

  steps.push({
    parameter: 'Structural TMT Steel',
    category: 'Physical Quantities',
    inputs: { totalBUA: `${area.totalBUASqFt} sq.ft`, steelRatio: `${steelRatio} kg/sq.ft`, brand: input.materialBrands?.steel || 'Standard' },
    formula: `(${area.totalBUASqFt} × ${steelRatio}) ÷ 1000`,
    assumption: `IS 456 / IS 13920 Preliminary Residential Benchmark = ${steelRatio} kg/sq.ft`,
    result: qty.steelTonnes,
    unit: 'Tonnes',
  });

  // 7. Cement
  const cementRatio = input.qualityTier === 'Luxury'
    ? A.cementBagsPerSqFtLuxury.value
    : input.qualityTier === 'Essential'
    ? A.cementBagsPerSqFtEssential.value
    : A.cementBagsPerSqFtPremium.value;

  steps.push({
    parameter: 'OPC 53 Cement',
    category: 'Physical Quantities',
    inputs: { totalBUA: `${area.totalBUASqFt} sq.ft`, cementRatio: `${cementRatio} bags/sq.ft`, brand: input.materialBrands?.cement || 'Standard' },
    formula: `${area.totalBUASqFt} × ${cementRatio}`,
    assumption: `Field QS Benchmark = ${cementRatio} bags (50kg)/sq.ft BUA`,
    result: qty.cementBags,
    unit: 'Bags (50 kg)',
  });

  // 8. RMC Concrete
  const concreteRatio = input.qualityTier === 'Luxury'
    ? A.concreteCuMPerSqFtLuxury.value
    : input.qualityTier === 'Essential'
    ? A.concreteCuMPerSqFtEssential.value
    : A.concreteCuMPerSqFtPremium.value;

  steps.push({
    parameter: 'M25 Ready Mix Concrete',
    category: 'Physical Quantities',
    inputs: { totalBUA: `${area.totalBUASqFt} sq.ft`, concreteRatio: `${concreteRatio} cu.m/sq.ft` },
    formula: `${area.totalBUASqFt} × ${concreteRatio}`,
    assumption: `Structural Design Mix Consumption = ${concreteRatio} cu.m/sq.ft BUA`,
    result: qty.concreteCuM,
    unit: 'Cu.M',
  });

  // 9. Base Construction Cost
  steps.push({
    parameter: 'Base Construction Cost (BOQ Sum)',
    category: 'Commercial Totals',
    inputs: { itemCount: `${qty ? 'Itemized BOQ' : 0}` },
    formula: 'Sum(all BOQ item quantities × unit rates)',
    assumption: 'Direct linear sum of itemized trade lines without magic multipliers',
    result: budget.baseConstructionCost,
    unit: '₹',
  });

  // 10. Total Project Cost
  steps.push({
    parameter: 'Total Project Cost',
    category: 'Commercial Totals',
    inputs: {
      baseCost: budget.baseConstructionCost,
      professionalFees: budget.professionalFees,
      contingency: budget.contingency,
      gst: budget.gstAmount,
    },
    formula: 'Base Cost + Professional Fees (5%) + Contractor Margin (15%) + Contingency (6%) + GST (12%)',
    assumption: `GST = ${A.gstRate.value * 100}%, Professional Fees = ${A.professionalFeesPremium.value * 100}%, Contingency = ${A.contingencyPremium.value * 100}%`,
    result: budget.totalProjectCost,
    unit: '₹',
  });

  // 11. Effective Rate per Sq.Ft
  steps.push({
    parameter: 'Effective Cost Rate per Sq.Ft',
    category: 'Performance Metrics',
    inputs: { totalProjectCost: budget.totalProjectCost, totalBUA: area.totalBUASqFt },
    formula: area.totalBUASqFt > 0 ? `${budget.totalProjectCost} ÷ ${area.totalBUASqFt}` : '0',
    assumption: 'Total Project Cost divided by Usable Total BUA',
    result: budget.costPerSqFt,
    unit: '₹/Sq.Ft',
  });

  return steps;
}
