// ============================================================
// DOORS MODULE — Driven by house type, floors, and space requirements
// ============================================================

import { EngineInput } from '../types';

export function calculateDoors(input: EngineInput): {
  mainDoorsCount: number;
  internalDoorsCount: number;
  bathroomDoorsCount: number;
} {
  const { rooms, floors, houseType } = input;

  // Main door count: 1 per dwelling unit (Duplex/Triplex = 1, Rental/Mixed = floors or rental units)
  const mainDoorsCount = (houseType === 'Rental Units' || houseType === 'Mixed Use')
    ? Math.max(1, floors || 1)
    : 1;

  // Internal doors: 1 per bedroom + office + pooja + utility + storeRoom + (terrace access if multi-storey)
  const internalDoorsCount =
    (rooms.bedrooms || 0) +
    (rooms.office || 0) +
    (rooms.pooja || 0) +
    (rooms.utility || 0) +
    (rooms.storeRoom || 0) +
    ((floors || 1) > 1 ? 1 : 0);

  // Bathroom doors: 1 per bathroom + 1 per common toilet
  const bathroomDoorsCount = (rooms.bathrooms || 0) + (rooms.commonToilets || 0);

  return { mainDoorsCount, internalDoorsCount, bathroomDoorsCount };
}
