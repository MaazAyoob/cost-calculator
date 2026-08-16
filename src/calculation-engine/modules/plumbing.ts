// Plumbing Module — Driven by BUA and bathroom/kitchen fixture requirements
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

  const baseCpvc = Math.round(bua * CPVC_M_PER_SQFT);
  const baseSwr  = Math.round(bua * SWR_M_PER_SQFT);

  // Bathroom & kitchen plumbing pipe additions
  const bathCpvcAddition = (rooms.bathrooms || 0) * 18 + (rooms.kitchen || 0) * 12;
  const bathSwrAddition  = (rooms.bathrooms || 0) * 14 + (rooms.kitchen || 0) * 8 + (rooms.utility || 0) * 6;

  const cpvcSupplyMetres    = baseCpvc + bathCpvcAddition;
  const swrDrainMetres      = baseSwr + bathSwrAddition;
  const bathroomFixtureSets = (rooms.bathrooms || 0) * BATHROOM_FIXTURES_PER_BATH;
  const floorTrapsCount     = (rooms.bathrooms || 0) * FLOOR_TRAPS_PER_BATH +
                               (rooms.kitchen || 0) * 1 +
                               (rooms.balcony || 0) * 1 +
                               (rooms.utility || 0) * 1;

  return { cpvcSupplyMetres, swrDrainMetres, bathroomFixtureSets, floorTrapsCount };
}

