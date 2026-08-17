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

  // 2. Ground Coverage (Buildable Footprint)
  steps.push({
    parameter: 'Buildable Footprint (Ground Coverage)',
    category: 'Building Geometry',
    inputs: { plotArea: `${area.plotAreaSqFt} sq.ft`, coverageFactor: `${A.coverageFactor.value * 100}%` },
    formula: `${area.plotAreaSqFt} × ${A.coverageFactor.value}`,
    assumption: `BBMP / BDA Ground Coverage Rule (${A.coverageFactor.name}) = ${A.coverageFactor.value}`,
    result: area.buildableAreaSqFt,
    unit: 'Sq.Ft',
  });

  // 3. BUA Per Floor
  steps.push({
    parameter: 'Usable BUA Per Floor',
    category: 'Building Geometry',
    inputs: { buildableArea: `${area.buildableAreaSqFt} sq.ft`, floorEfficiency: `${A.floorEfficiency.value * 100}%` },
    formula: `${area.buildableAreaSqFt} × ${A.floorEfficiency.value}`,
    assumption: `Floor Efficiency Ratio (${A.floorEfficiency.name}) = ${A.floorEfficiency.value}`,
    result: area.buaPerFloorSqFt,
    unit: 'Sq.Ft',
  });

  // 4. Total BUA
  steps.push({
    parameter: 'Total Built-up Area (BUA)',
    category: 'Building Geometry',
    inputs: { buaPerFloor: `${area.buaPerFloorSqFt} sq.ft`, floors: input.floors },
    formula: `${area.buaPerFloorSqFt} × ${input.floors}`,
    assumption: 'Multiplied across all approved residential storeys',
    result: area.totalBUASqFt,
    unit: 'Sq.Ft',
  });

  // 5. Super BUA
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
