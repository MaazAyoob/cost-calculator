// Budget Module — Restored from RC1 (a2620e3)
// Simple bua * baseRate formula. Always calculates. No progressive gating.
import { EngineInput, AreaResult, BudgetResult, BudgetHead } from '../types';
import { BUDGET_ALLOCATION, BUDGET_HEAD_COLORS } from '../data/qualityTiers';
import {
  BASE_RATE_PER_SQFT,
  GST_RATE,
  CONTRACTOR_MARGIN,
  PROFESSIONAL_FEES,
  CONTINGENCY_RATE,
  STILT_PARKING_COST_PER_CAR,
  LIFT_COST,
  EV_CHARGING_COST,
} from '../data/locationRates';

export function calculateBudget(input: EngineInput, area: AreaResult): BudgetResult {
  const {
    city,
    qualityTier,
    parkingType,
    carCount,
    liftRequired,
    evCharging,
    materialBrands,
  } = input;

  const bua = area.totalBUASqFt;

  // Safe fallbacks so calculation works before city is selected
  const resolvedCity = city || 'Bangalore';
  const resolvedTier = qualityTier || 'Premium';

  const baseRate = BASE_RATE_PER_SQFT[resolvedCity]?.[resolvedTier] ?? 2450;
  const baseConstructionCost = Math.round(bua * baseRate);

  // Material brand multiplier (from RC1 materialBrands.steel / cement)
  let brandMultiplier = 1.0;
  const steel = materialBrands?.steel as string | undefined;
  const cement = materialBrands?.cement as string | undefined;
  if (steel === 'Tata Tiscon' || steel === 'Tata Tiscon Fe 550D') brandMultiplier += 0.02;
  else if (steel === 'JSW Neosteel') brandMultiplier += 0.01;
  if (cement === 'UltraTech' || cement === 'UltraTech OPC 53') brandMultiplier += 0.015;
  else if (cement === 'ACC Cement') brandMultiplier += 0.005;

  const adjustedConstructionCost = Math.round(baseConstructionCost * brandMultiplier);

  // Add-ons
  const parkingCost = (parkingType === 'Stilt Parking' || parkingType === 'Stilt')
    ? (carCount || 0) * (STILT_PARKING_COST_PER_CAR[resolvedCity] ?? 180000)
    : (carCount || 0) * 60000;

  const liftCost = liftRequired ? (LIFT_COST[resolvedCity]?.[resolvedTier] ?? 450000) : 0;
  const evCost   = evCharging   ? EV_CHARGING_COST : 0;

  const constructionWithAddons = adjustedConstructionCost + parkingCost + liftCost + evCost;

  // Professional fees, margin, contingency, GST
  const professionalFees = Math.round(constructionWithAddons * (PROFESSIONAL_FEES[resolvedTier] ?? 0.05));
  const contractorMargin = Math.round(constructionWithAddons * (CONTRACTOR_MARGIN[resolvedTier] ?? 0.10));
  const contingency      = Math.round(constructionWithAddons * (CONTINGENCY_RATE[resolvedTier] ?? 0.05));
  const gstAmount        = Math.round((constructionWithAddons + professionalFees) * GST_RATE);

  const totalProjectCost = constructionWithAddons + professionalFees + contractorMargin + contingency + gstAmount;
  const costPerSqFt      = bua > 0 ? Math.round(totalProjectCost / bua) : 0;

  // Budget head breakdown
  const alloc = BUDGET_ALLOCATION[resolvedTier] ?? BUDGET_ALLOCATION['Premium'];
  const headDefs = [
    { key: 'foundationStructure',    label: 'Foundation & Structure',  pct: alloc.foundationStructure },
    { key: 'masonry',                label: 'Masonry',                 pct: alloc.masonry },
    { key: 'roofing',                label: 'Roofing',                 pct: alloc.roofing },
    { key: 'flooring',               label: 'Flooring',                pct: alloc.flooring },
    { key: 'doorsJoinery',           label: 'Doors & Joinery',         pct: alloc.doorsJoinery },
    { key: 'windows',                label: 'Windows & Glazing',       pct: alloc.windows },
    { key: 'electrical',             label: 'Electrical',              pct: alloc.electrical },
    { key: 'plumbingSanitary',       label: 'Plumbing & Sanitary',     pct: alloc.plumbingSanitary },
    { key: 'paintingWaterproofing',  label: 'Painting',                pct: alloc.paintingWaterproofing },
    { key: 'fixturesFinishes',       label: 'Fixtures & Finishes',     pct: alloc.fixturesFinishes },
    { key: 'contingencyGST',         label: 'Contingency & GST',       pct: alloc.contingencyGST },
  ];

  const heads: BudgetHead[] = headDefs.map((h) => ({
    id:              h.key,
    name:            h.label,
    percentage:      Math.round(h.pct * 100),
    allocatedAmount: Math.round(totalProjectCost * h.pct),
    color:           BUDGET_HEAD_COLORS[h.label] ?? '#94A3B8',
  }));

  // Derive sub-totals
  const structuralCost = Math.round(totalProjectCost * (alloc.foundationStructure + alloc.masonry + alloc.roofing));
  const finishingCost  = Math.round(totalProjectCost * (alloc.flooring + alloc.doorsJoinery + alloc.windows + alloc.fixturesFinishes));
  const mepCost        = Math.round(totalProjectCost * (alloc.electrical + alloc.plumbingSanitary));

  return {
    heads,
    structuralCost,
    finishingCost,
    mepCost,
    professionalFees,
    contingency,
    gstAmount,
    baseConstructionCost: adjustedConstructionCost,
    totalProjectCost,
    costPerSqFt,
  };
}
