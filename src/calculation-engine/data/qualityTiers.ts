// ============================================================
// QUALITY TIER MULTIPLIER MATRIX
// Applied per cost category based on selected quality tier
// ============================================================

import { QualityTier } from '../../store/useWizardStore';

/** Budget allocation percentages per quality tier */
export interface BudgetAllocation {
  foundationStructure: number;
  masonry:             number;
  roofing:             number;
  flooring:            number;
  doorsJoinery:        number;
  windows:             number;
  electrical:          number;
  plumbingSanitary:    number;
  paintingWaterproofing: number;
  fixturesFinishes:    number;
  contingencyGST:      number;
}

export const BUDGET_ALLOCATION: Record<QualityTier, BudgetAllocation> = {
  Essential: {
    foundationStructure:    0.42,
    masonry:                0.09,
    roofing:                0.05,
    flooring:               0.08,
    doorsJoinery:           0.05,
    windows:                0.03,
    electrical:             0.05,
    plumbingSanitary:       0.05,
    paintingWaterproofing:  0.05,
    fixturesFinishes:       0.03,
    contingencyGST:         0.10,
  },
  Premium: {
    foundationStructure:    0.40,
    masonry:                0.08,
    roofing:                0.05,
    flooring:               0.09,
    doorsJoinery:           0.06,
    windows:                0.04,
    electrical:             0.06,
    plumbingSanitary:       0.05,
    paintingWaterproofing:  0.05,
    fixturesFinishes:       0.04,
    contingencyGST:         0.08,
  },
  Luxury: {
    foundationStructure:    0.37,
    masonry:                0.07,
    roofing:                0.05,
    flooring:               0.11,
    doorsJoinery:           0.08,
    windows:                0.05,
    electrical:             0.07,
    plumbingSanitary:       0.06,
    paintingWaterproofing:  0.05,
    fixturesFinishes:       0.05,
    contingencyGST:         0.04,
  },
};

/** Budget head chart colours */
export const BUDGET_HEAD_COLORS: Record<string, string> = {
  'Foundation & Structure': '#2563EB',
  'Masonry':               '#059669',
  'Roofing':               '#D97706',
  'Flooring':              '#7C3AED',
  'Doors & Joinery':       '#DC2626',
  'Windows & Glazing':     '#0891B2',
  'Electrical':            '#CA8A04',
  'Plumbing & Sanitary':   '#16A34A',
  'Painting':              '#EA580C',
  'Fixtures & Finishes':   '#6366F1',
  'Contingency & GST':     '#94A3B8',
  'Contractor Execution Margin (15%)': '#8B5CF6',
  'Contingency Reserve (6%)': '#F59E0B',
  'Professional Architecture & Engineering Fees (5%)': '#3B82F6',
  'GST & Statutory Taxes (18%)': '#64748B',
};

/** Material quality multipliers per category */
export const MATERIAL_QUALITY_MULTIPLIER: Record<QualityTier, {
  structural: number;
  finishing:  number;
  mep:        number;
  joinery:    number;
  fixtures:   number;
}> = {
  Essential: { structural: 0.80, finishing: 0.70, mep: 0.75, joinery: 0.72, fixtures: 0.65 },
  Premium:   { structural: 1.00, finishing: 1.00, mep: 1.00, joinery: 1.00, fixtures: 1.00 },
  Luxury:    { structural: 1.30, finishing: 1.60, mep: 1.40, joinery: 1.65, fixtures: 1.80 },
};

/** Unit rate lookup for common material items (₹) at Premium base */
export const UNIT_RATES_PREMIUM = {
  // Structure
  tmtSteelPerTonne:     64000,
  cement50kgBag:          420,
  rmc25PerCuM:           4800,
  sandPerCuFt:             65,
  aggregatePerCuFt:        70,
  aacBlock6InchPerCuM:   3800,
  
  // Finishes
  vitrifiedTilePerSqFt:   140,
  marbleTilePerSqFt:      450,
  wallTilePerSqFt:         95,
  graniteStepPerSqFt:     320,
  
  // Paint
  interiorPaintPerLitre:  680,
  exteriorPaintPerLitre:  520,
  puttyPerKg:              42,
  
  // Doors
  mainDoorPerSet:       145000,
  interiorDoorPerSet:    18500,
  
  // Windows
  upvcWindowPerSqFt:      780,
  
  // Electrical
  wirePerMetre:             85,
  conduitPerMetre:          35,
  switchModulePerUnit:     480,
  lightPointPerUnit:      1200,
  
  // Plumbing
  cpvcPipePerMetre:        220,
  swrPipePerMetre:         340,
  bathroomSetPerUnit:    95000,
  
  // Waterproofing
  waterproofingPerSqFt:   120,
  
  // Site & Misc
  sitePreparationPerSqFt:  30,
  earthworkPerCuM:         250,
  pccPerCuM:              3200,
};
