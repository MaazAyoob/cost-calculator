// ============================================================
// ELECTRICAL MODULE
// Strictly follows Hutty Pilot Specification (Section 18, 19)
//
// Rules:
// - Generated from configured spaces (light, fan, socket, AC points)
// - Switches & sockets generated from point schedule
// - Conduit & wire calculated from point-to-length rules + main route allowance
// ============================================================

import { EngineInput, AreaResult, BuildingModel } from '../types';
import { CONDUIT_M_PER_POINT, WIRE_M_PER_POINT } from '../data/coefficients';

export function calculateElectrical(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel
): {
  lightingPoints: number;
  fanPoints: number;
  socketPoints: number;
  acPoints: number;
  totalElectricalPoints: number;
  switchModules: number;
  conduitsMetres: number;
  electricalWireMetres: number;
} {
  const bua = area.totalBUASqFt || 0;
  const floors = Math.max(0, input.floors || 0);

  if (bua <= 0 || floors <= 0) {
    return {
      lightingPoints: 0,
      fanPoints: 0,
      socketPoints: 0,
      acPoints: 0,
      totalElectricalPoints: 0,
      switchModules: 0,
      conduitsMetres: 0,
      electricalWireMetres: 0,
    };
  }

  // 1. Sum room-driven points from SpaceModel (PDF Section 18)
  let rawLight = buildingModel.allSpaces.reduce((sum, s) => sum + s.lightPoints, 0);
  let rawFan = buildingModel.allSpaces.reduce((sum, s) => sum + s.fanPoints, 0);
  let rawSocket = buildingModel.allSpaces.reduce((sum, s) => sum + s.socketPoints, 0);
  let rawAC = buildingModel.allSpaces.reduce((sum, s) => sum + s.acPoints, 0);

  // Add circulation / external lighting (terrace, staircase, parking)
  const stairLight = Math.max(0, floors - 1) * 2;
  const terraceLight = 2;
  const parkingLight = (input.carCount || 0) > 0 ? 2 : 1;
  const liftAddition = input.liftRequired ? 4 : 0;

  const lightingPoints = rawLight + stairLight + terraceLight + parkingLight + liftAddition;
  const fanPoints = rawFan;
  const socketPoints = rawSocket + (input.evCharging ? 1 : 0);
  const acPoints = rawAC;

  const totalElectricalPoints = lightingPoints + fanPoints + socketPoints + acPoints;

  // 2. Modular Switch Plates & Modules
  const switchModules = Math.round(totalElectricalPoints * 0.75) + (input.liftRequired ? 4 : 0);

  // 3. Conduit & Wire Runs (PDF Section 19)
  const mainRouteAllowance = Math.max(0, floors - 1) * 15; // Vertical distribution trunking
  const evChargingWire = input.evCharging ? (input.carCount || 1) * 30 : 0;

  const conduitsMetres = Math.round(totalElectricalPoints * CONDUIT_M_PER_POINT + mainRouteAllowance);
  const electricalWireMetres = Math.round(totalElectricalPoints * WIRE_M_PER_POINT + mainRouteAllowance * 3 + evChargingWire);

  return {
    lightingPoints,
    fanPoints,
    socketPoints,
    acPoints,
    totalElectricalPoints,
    switchModules,
    conduitsMetres,
    electricalWireMetres,
  };
}
