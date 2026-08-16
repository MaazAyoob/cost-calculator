// Electrical Module — Driven by BUA and room-by-room electrical load requirements
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
  const { qualityTier, rooms, liftRequired, evCharging, carCount } = input;
  const bua = area.totalBUASqFt;

  // Base quantities from BUA
  const baseWireMetres     = Math.round(bua * ELECTRICAL_WIRE_M_PER_SQFT[qualityTier]);
  const baseConduitsMetres = Math.round(bua * CONDUIT_M_PER_SQFT[qualityTier]);
  const baseLightingPoints = Math.round(bua * LIGHTING_POINTS_PER_SQFT);
  const baseSwitchModules  = Math.round(bua * SWITCH_MODULES_PER_SQFT[qualityTier]);

  // Room-driven additive points & wiring loads
  const bedroomPoints  = (rooms.bedrooms || 0) * 6;
  const bathroomPoints = (rooms.bathrooms || 0) * 3;
  const kitchenPoints  = (rooms.kitchen || 0) * 5;
  const livingPoints   = (rooms.living || 0) * 6;

  const roomPointsTotal = bedroomPoints + bathroomPoints + kitchenPoints + livingPoints;
  
  // Room-driven wiring and conduits additions
  const roomWireAddition    = (rooms.bedrooms || 0) * 45 + (rooms.bathrooms || 0) * 30 + (rooms.kitchen || 0) * 35;
  const roomConduitAddition = (rooms.bedrooms || 0) * 25 + (rooms.bathrooms || 0) * 15 + (rooms.kitchen || 0) * 20;

  const liftAddition     = liftRequired ? 8 : 0;
  const evChargingWire   = evCharging ? (carCount || 1) * 25 : 0;

  const lightingPoints       = baseLightingPoints + roomPointsTotal + liftAddition;
  const switchModules        = baseSwitchModules + Math.round(roomPointsTotal * 0.7) + (liftRequired ? 4 : 0);
  const electricalWireMetres = baseWireMetres + roomWireAddition + evChargingWire;
  const conduitsMetres       = baseConduitsMetres + roomConduitAddition;

  return { electricalWireMetres, conduitsMetres, switchModules, lightingPoints };
}

