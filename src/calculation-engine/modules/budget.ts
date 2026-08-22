// ============================================================
// BUDGET MODULE – SECTION D: WHAT IT COSTS
// Strictly follows Hutty Pilot Specification (Section 25, 27, 28)
//
// Rules:
// - Base Construction Cost = Sum of all itemized BOQ amounts
// - Project Additions: Professional Fees (5%), Contractor Margin (15%),
//   Contingency (6%), GST (18%)
// - Effective Rate per Sq.Ft = Total Project Cost ÷ Total BUA (0 if BUA = 0)
// - Never return NaN, Infinity, undefined, or negative values.
// ============================================================

import { EngineInput, AreaResult, BudgetResult, BudgetHead, BOQItem } from '../types';
import { BUDGET_HEAD_COLORS } from '../data/qualityTiers';
import {
  GST_RATE,
  CONTRACTOR_MARGIN_RATE,
  PROFESSIONAL_FEES_RATE,
  CONTINGENCY_RATE,
} from '../data/coefficients';

export function calculateBudget(
  input: EngineInput,
  area: AreaResult,
  boq: BOQItem[]
): BudgetResult {
  const bua = area.totalBUASqFt || 0;

  // 1. Base Construction Cost is the exact sum of all BOQ items
  const baseConstructionCost = Array.isArray(boq)
    ? boq.reduce((acc, item) => acc + (item.amount || 0), 0)
    : 0;

  if (baseConstructionCost <= 0 || bua <= 0) {
    return {
      heads: [],
      structuralCost: 0,
      finishingCost: 0,
      mepCost: 0,
      baseConstructionCost: 0,
      professionalFees: 0,
      contractorMargin: 0,
      contingency: 0,
      gstAmount: 0,
      totalProjectCost: 0,
      costPerSqFt: 0,
    };
  }

  // 2. Statutory / Project Additions (Configurable parameters from coefficients)
  const professionalFees = Math.round(baseConstructionCost * PROFESSIONAL_FEES_RATE); // 5%
  const contractorMargin = Math.round(baseConstructionCost * CONTRACTOR_MARGIN_RATE); // 15%
  const contingency      = Math.round(baseConstructionCost * CONTINGENCY_RATE);      // 6%
  const gstAmount        = Math.round((baseConstructionCost + professionalFees) * GST_RATE); // 18%

  // 3. Final Total Project Cost
  const totalProjectCost = baseConstructionCost + professionalFees + contractorMargin + contingency + gstAmount;

  // 4. Derived Effective Rate per Sq.Ft (Never NaN/Infinity)
  const costPerSqFt = bua > 0 && !isNaN(totalProjectCost)
    ? Math.round(totalProjectCost / bua)
    : 0;

  // Helper to sum BOQ amounts by category
  const sumCat = (categories: string[]): number => {
    return boq
      .filter((item) => categories.includes(item.category))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const foundationStructureAmt = sumCat(['Site Preparation', 'Foundation', 'Plinth', 'RCC Structure']);
  const masonryAmt             = sumCat(['Masonry']);
  const plasteringAmt          = sumCat(['Plastering']);
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
    { key: 'masonry',                label: 'Masonry & Plastering',    amt: masonryAmt + plasteringAmt },
    { key: 'roofing',                label: 'Roofing & Waterproofing', amt: roofingAmt },
    { key: 'flooring',               label: 'Flooring & Cladding',     amt: flooringAmt },
    { key: 'doorsJoinery',           label: 'Doors & Joinery',         amt: doorsJoineryAmt },
    { key: 'windows',                label: 'Windows & Glazing',       amt: windowsAmt },
    { key: 'electrical',             label: 'Electrical MEP',          amt: electricalAmt },
    { key: 'plumbingSanitary',       label: 'Plumbing & Sanitary',     amt: plumbingSanitaryAmt },
    { key: 'paintingWaterproofing',  label: 'Painting & Finishes',     amt: paintingAmt },
    { key: 'fixturesFinishes',       label: 'Installed Fixtures',      amt: fixturesFinishesAmt },
    { key: 'contingencyGST',         label: 'Margin, Contingency & GST', amt: markupAndGSTAmt },
  ];

  const heads: BudgetHead[] = headDefs.map((h) => ({
    id:              h.key,
    name:            h.label,
    allocatedAmount: h.amt,
    percentage:      totalProjectCost > 0 ? parseFloat(((h.amt / totalProjectCost) * 100).toFixed(1)) : 0,
    color:           BUDGET_HEAD_COLORS[h.label] ?? '#94A3B8',
  }));

  // Major trade subtotals
  const structuralCost = foundationStructureAmt + masonryAmt + plasteringAmt + roofingAmt;
  const finishingCost  = flooringAmt + doorsJoineryAmt + windowsAmt + paintingAmt + fixturesFinishesAmt;
  const mepCost        = electricalAmt + plumbingSanitaryAmt;

  return {
    heads,
    structuralCost,
    finishingCost,
    mepCost,
    baseConstructionCost,
    professionalFees,
    contractorMargin,
    contingency,
    gstAmount,
    totalProjectCost,
    costPerSqFt,
  };
}
