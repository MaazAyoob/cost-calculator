// ============================================================
// BUDGET MODULE – Itemized BOQ-Driven Cost Aggregator
// Total Construction Cost is derived directly from itemized BOQ.
// Category heads, dynamic percentages, and effective rate/sq.ft
// are calculated strictly from true item sums.
// ============================================================

import { EngineInput, AreaResult, BudgetResult, BudgetHead, BOQItem } from '../types';
import { BUDGET_HEAD_COLORS } from '../data/qualityTiers';
import {
  GST_RATE,
  CONTRACTOR_MARGIN,
  PROFESSIONAL_FEES,
  CONTINGENCY_RATE,
} from '../data/locationRates';

export function calculateBudget(
  input: EngineInput,
  area: AreaResult,
  boq: BOQItem[]
): BudgetResult {
  const { qualityTier } = input;
  const bua = area.totalBUASqFt;
  const resolvedTier = qualityTier || 'Premium';

  // 1. Total Base Construction Cost is the exact sum of all itemized BOQ items
  const baseConstructionCost = boq.reduce((acc, item) => acc + item.amount, 0);

  // 2. Statutory / Markup Additions
  const professionalFees = Math.round(baseConstructionCost * (PROFESSIONAL_FEES[resolvedTier] ?? 0.05));
  const contractorMargin = Math.round(baseConstructionCost * (CONTRACTOR_MARGIN[resolvedTier] ?? 0.10));
  const contingency      = Math.round(baseConstructionCost * (CONTINGENCY_RATE[resolvedTier] ?? 0.05));
  const gstAmount        = Math.round((baseConstructionCost + professionalFees) * GST_RATE);

  // 3. Final Total Project Cost
  const totalProjectCost = baseConstructionCost + professionalFees + contractorMargin + contingency + gstAmount;

  // 4. Derived Effective Rate per Sq.Ft
  const costPerSqFt = bua > 0 ? Math.round(totalProjectCost / bua) : 0;

  // Helper to sum BOQ amounts by category
  const sumCat = (categories: string[]): number => {
    return boq
      .filter((item) => categories.includes(item.category))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const foundationStructureAmt = sumCat(['Site Preparation', 'Foundation', 'Plinth', 'RCC Structure']);
  const masonryAmt             = sumCat(['Masonry']);
  const roofingAmt             = sumCat(['Roofing']);
  const flooringAmt            = sumCat(['Flooring']);
  const doorsJoineryAmt        = sumCat(['Doors & Joinery']);
  const windowsAmt             = sumCat(['Windows & Glazing']);
  const electricalAmt          = sumCat(['Electrical']);
  const plumbingSanitaryAmt    = sumCat(['Plumbing & Sanitary']);
  const paintingAmt            = sumCat(['Painting & Waterproofing']);
  const fixturesFinishesAmt    = sumCat(['Fixtures & Finishes']);
  const markupAndGSTAmt        = professionalFees + contractorMargin + contingency + gstAmount;

  const headDefs = [
    { key: 'foundationStructure',    label: 'Foundation & Structure',  amt: foundationStructureAmt },
    { key: 'masonry',                label: 'Masonry',                 amt: masonryAmt },
    { key: 'roofing',                label: 'Roofing',                 amt: roofingAmt },
    { key: 'flooring',               label: 'Flooring',                amt: flooringAmt },
    { key: 'doorsJoinery',           label: 'Doors & Joinery',         amt: doorsJoineryAmt },
    { key: 'windows',                label: 'Windows & Glazing',       amt: windowsAmt },
    { key: 'electrical',             label: 'Electrical',              amt: electricalAmt },
    { key: 'plumbingSanitary',       label: 'Plumbing & Sanitary',     amt: plumbingSanitaryAmt },
    { key: 'paintingWaterproofing',  label: 'Painting & Waterproofing', amt: paintingAmt },
    { key: 'fixturesFinishes',       label: 'Fixtures & Finishes',     amt: fixturesFinishesAmt },
    { key: 'contingencyGST',         label: 'Contingency, Margin & GST', amt: markupAndGSTAmt },
  ];

  const heads: BudgetHead[] = headDefs.map((h) => ({
    id:              h.key,
    name:            h.label,
    allocatedAmount: h.amt,
    percentage:      totalProjectCost > 0 ? parseFloat(((h.amt / totalProjectCost) * 100).toFixed(1)) : 0,
    color:           BUDGET_HEAD_COLORS[h.label] ?? '#94A3B8',
  }));

  // Major trade subtotals
  const structuralCost = foundationStructureAmt + masonryAmt + roofingAmt;
  const finishingCost  = flooringAmt + doorsJoineryAmt + windowsAmt + paintingAmt + fixturesFinishesAmt;
  const mepCost        = electricalAmt + plumbingSanitaryAmt;

  return {
    heads,
    structuralCost,
    finishingCost,
    mepCost,
    professionalFees,
    contingency,
    gstAmount,
    baseConstructionCost,
    totalProjectCost,
    costPerSqFt,
  };
}
