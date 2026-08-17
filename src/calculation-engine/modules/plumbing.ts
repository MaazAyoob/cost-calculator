// ============================================================
// PLUMBING MODULE — Driven by BUA and bathroom/kitchen fixture requirements
// ============================================================

import { EngineInput, AreaResult } from '../types';
import {
  CPVC_M_PER_SQFT,
  SWR_M_PER_SQFT,
  BATHROOM_FIXTURES_PER_BATH,
  FLOOR_TRAPS_PER_BATH,
} from '../data/coefficients';

export function calculatePlumbing(input: EngineInput, area: AreaResult): {
  cpvcSupplyMetres: number;
  swrDrainMetres: number;
  bathroomFixtureSets: number;
  floorTrapsCount: number;
} {
  const { rooms } = input;
  const bua = area.totalBUASqFt;
  const totalBaths = (rooms.bathrooms || 0) + (rooms.commonToilets || 0);

  const baseCpvc = Math.round(bua * CPVC_M_PER_SQFT);
  const baseSwr  = Math.round(bua * SWR_M_PER_SQFT);

  // Bathroom & kitchen plumbing pipe additions
  const bathCpvcAddition = totalBaths * 18 + (rooms.kitchen || 0) * 12;
  const bathSwrAddition  = totalBaths * 14 + (rooms.kitchen || 0) * 8 + (rooms.utility || 0) * 6;

  const cpvcSupplyMetres    = baseCpvc + bathCpvcAddition;
  const swrDrainMetres      = baseSwr + bathSwrAddition;
  const bathroomFixtureSets = totalBaths * BATHROOM_FIXTURES_PER_BATH;
  const floorTrapsCount     = totalBaths * FLOOR_TRAPS_PER_BATH +
                               (rooms.kitchen || 0) * 1 +
                               (rooms.balcony || 0) * 1 +
                               (rooms.utility || 0) * 1;

  return { cpvcSupplyMetres, swrDrainMetres, bathroomFixtureSets, floorTrapsCount };
}
