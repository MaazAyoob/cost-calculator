// ============================================================
// ELECTRICAL MODULE — Driven by BUA and room-by-room electrical load requirements
// ============================================================

import { EngineInput, AreaResult } from '../types';
import {
  ELECTRICAL_WIRE_M_PER_SQFT,
  CONDUIT_M_PER_SQFT,
  LIGHTING_POINTS_PER_SQFT,
  SWITCH_MODULES_PER_SQFT,
} from '../data/coefficients';

export function calculateElectrical(input: EngineInput, area: AreaResult): {
  electricalWireMetres: number;
  conduitsMetres: number;
  switchModules: number;
  lightingPoints: number;
} {
  const { qualityTier, rooms, liftRequired, evCharging, carCount, floors } = input;
  const bua = area.totalBUASqFt;
  const tier = qualityTier || 'Premium';

  // Base quantities derived from BUA
  const baseWireMetres     = Math.round(bua * (ELECTRICAL_WIRE_M_PER_SQFT[tier] ?? 2.8));
  const baseConduitsMetres = Math.round(bua * (CONDUIT_M_PER_SQFT[tier] ?? 1.8));
  const baseLightingPoints = Math.round(bua * LIGHTING_POINTS_PER_SQFT);
  const baseSwitchModules  = Math.round(bua * (SWITCH_MODULES_PER_SQFT[tier] ?? 0.09));

  // Room-driven additive points
  const totalBaths = (rooms.bathrooms || 0) + (rooms.commonToilets || 0);
  const bedroomPoints  = (rooms.bedrooms || 0) * 6;
  const bathroomPoints = totalBaths * 3;
  const kitchenPoints  = (rooms.kitchen || 0) * 5;
  const livingPoints   = (rooms.living || 0) * 6;
  const diningPoints   = (rooms.dining || 0) * 4;

  const roomPointsTotal = bedroomPoints + bathroomPoints + kitchenPoints + livingPoints + diningPoints;
  
  // Room-driven wiring and conduits additions (metres)
  const roomWireAddition =
    (rooms.bedrooms || 0) * 45 +
    totalBaths * 30 +
    (rooms.kitchen || 0) * 35 +
    (rooms.living || 0) * 35;

  const roomConduitAddition =
    (rooms.bedrooms || 0) * 25 +
    totalBaths * 15 +
    (rooms.kitchen || 0) * 20;

  const liftAddition     = liftRequired ? 8 : 0;
  const evChargingWire   = evCharging ? (carCount || 1) * 25 : 0;
  const floorDBWire      = Math.max(0, (floors || 1) - 1) * 15;

  const lightingPoints       = baseLightingPoints + roomPointsTotal + liftAddition;
  const switchModules        = baseSwitchModules + Math.round(roomPointsTotal * 0.7) + (liftRequired ? 4 : 0);
  const electricalWireMetres = baseWireMetres + roomWireAddition + evChargingWire + floorDBWire;
  const conduitsMetres       = baseConduitsMetres + roomConduitAddition;

  return { electricalWireMetres, conduitsMetres, switchModules, lightingPoints };
}
