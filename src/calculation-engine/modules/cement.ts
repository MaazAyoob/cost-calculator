// ============================================================
// CEMENT MODULE – Pilot Starting Rule (PDF Section 8 & Section 18)
//
// Formula:
// Starting Parameter: 0.40 bags/sqft of total built-up area
// Cement Quantity (50 kg bags) = Total Built-up Area × 0.40 bags/sqft
// Brand change preserves physical bag requirement.
// ============================================================

import { EngineInput, AreaResult } from '../types';
import { CEMENT_BAGS_PER_SQFT } from '../data/coefficients';

export function calculateCement(input: EngineInput, area: AreaResult): {
  cementBags: number;
  bagsPerSqFt: number;
} {
  const bua = area.totalBUASqFt || 0;

  if (bua <= 0) {
    return { cementBags: 0, bagsPerSqFt: 0 };
  }

  const bagsPerSqFt = CEMENT_BAGS_PER_SQFT; // 0.40
  const cementBags = Math.round(bua * bagsPerSqFt);

  return { cementBags, bagsPerSqFt };
}
