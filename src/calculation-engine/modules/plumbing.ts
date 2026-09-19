// ============================================================
// PLUMBING & SANITARY MODULE
// Strictly follows Hutty Pilot Specification (Section 20, 21, 22)
//
// Rules:
// - Bathroom count drives WC, basin, shower, health faucet, floor drain
// - Kitchen & utility drive sink and appliance water/drainage points
// - Water supply pipe = Water Points × Pipe Factor + Vertical Riser Allowance
// - Drainage pipe = Drainage Points × Pipe Factor + Vertical Riser Allowance
// - Water Tank capacity = Occupants × Daily Demand (135 LPCD) × Storage Days
// ============================================================

import { EngineInput, AreaResult, BuildingModel } from '../types';
import {
  CPVC_M_PER_POINT,
  SWR_M_PER_POINT,
  VERTICAL_RISER_ALLOWANCE_M,
  OCCUPANTS_PER_BEDROOM,
  DAILY_WATER_DEMAND_LPCD,
  WATER_STORAGE_DAYS,
} from '../data/coefficients';
import { configResolver } from '../config/configurationResolver';

export function calculatePlumbing(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel
): {
  totalWaterPoints: number;
  totalDrainagePoints: number;
  cpvcSupplyMetres: number;
  swrDrainMetres: number;
  wcCount: number;
  washBasinCount: number;
  showerCount: number;
  healthFaucetCount: number;
  floorTrapsCount: number;
  kitchenSinkCount: number;
  bathroomFixtureSets: number;
  overheadTankLitres: number;
} {
  const bua = area.totalBUASqFt || 0;
  const floors = Math.max(0, input.floors || 0);

  if (bua <= 0 || floors <= 0) {
    return {
      totalWaterPoints: 0,
      totalDrainagePoints: 0,
      cpvcSupplyMetres: 0,
      swrDrainMetres: 0,
      wcCount: 0,
      washBasinCount: 0,
      showerCount: 0,
      healthFaucetCount: 0,
      floorTrapsCount: 0,
      kitchenSinkCount: 0,
      bathroomFixtureSets: 0,
      overheadTankLitres: 0,
    };
  }

  // 1. Sum fixture counts & points directly from canonical SpaceModel with explicit override support
  const overrides = input.fixtureOverrides || input.bathroomFittings?.fixtureOverrides;

  const rawWcCount = buildingModel.allSpaces.reduce((sum, s) => sum + s.wcCount, 0);
  const rawWashBasinCount = buildingModel.allSpaces.reduce((sum, s) => sum + s.washBasinCount, 0);
  const rawShowerCount = buildingModel.allSpaces.reduce((sum, s) => sum + s.showerCount, 0);
  const rawHealthFaucetCount = buildingModel.allSpaces.reduce((sum, s) => sum + s.healthFaucetCount, 0);

  const wcCount = overrides?.wcCount !== undefined ? Math.max(0, overrides.wcCount) : rawWcCount;
  const washBasinCount = overrides?.washBasinCount !== undefined ? Math.max(0, overrides.washBasinCount) : rawWashBasinCount;
  const showerCount = overrides?.showerCount !== undefined ? Math.max(0, overrides.showerCount) : rawShowerCount;
  const healthFaucetCount = overrides?.healthFaucetCount !== undefined ? Math.max(0, overrides.healthFaucetCount) : rawHealthFaucetCount;

  const floorTrapsCount = buildingModel.allSpaces.reduce((sum, s) => sum + s.floorDrainCount, 0);
  const kitchenSinkCount = buildingModel.allSpaces.reduce((sum, s) => sum + s.sinkCount, 0);

  const totalWaterPoints = buildingModel.allSpaces.reduce((sum, s) => sum + s.waterPoints, 0);
  const totalDrainagePoints = buildingModel.allSpaces.reduce((sum, s) => sum + s.drainagePoints, 0);

  const bathroomFixtureSets = (input.rooms.bathrooms || 0) + (input.rooms.commonToilets || 0);

  // 2. CPVC & SWR Pipe Lengths (PDF Section 20)
  const riserAllowance = configResolver.resolveParameter('config.plumbing.riser_m_per_floor', undefined, VERTICAL_RISER_ALLOWANCE_M);
  const cpvcPerPoint = configResolver.resolveParameter('config.plumbing.cpvc_m_per_point', undefined, CPVC_M_PER_POINT);
  const swrPerPoint = configResolver.resolveParameter('config.plumbing.swr_m_per_point', undefined, SWR_M_PER_POINT);

  const verticalRiserM = floors * riserAllowance;
  const cpvcSupplyMetres = Math.round(totalWaterPoints * cpvcPerPoint + verticalRiserM * 1.5);
  const swrDrainMetres = Math.round(totalDrainagePoints * swrPerPoint + verticalRiserM);

  // 3. Tank Sizing (PDF Section 22)
  const occupantsPerBed = configResolver.resolveParameter('config.plumbing.occupants_per_bedroom', undefined, OCCUPANTS_PER_BEDROOM);
  const dailyDemand = configResolver.resolveParameter('config.plumbing.daily_water_demand_lpcd', undefined, DAILY_WATER_DEMAND_LPCD);
  const storageDays = configResolver.resolveParameter('config.plumbing.water_storage_reserve_days', undefined, WATER_STORAGE_DAYS);

  const bedCount = Math.max(1, input.rooms.bedrooms || 1);
  const occupants = bedCount * occupantsPerBed;
  const rawTankCap = occupants * dailyDemand * storageDays;
  // Round up to standard commercial tank capacities (1000L, 1500L, 2000L, 3000L, etc.)
  const overheadTankLitres = Math.max(1000, Math.ceil(rawTankCap / 500) * 500);

  return {
    totalWaterPoints,
    totalDrainagePoints,
    cpvcSupplyMetres,
    swrDrainMetres,
    wcCount,
    washBasinCount,
    showerCount,
    healthFaucetCount,
    floorTrapsCount,
    kitchenSinkCount,
    bathroomFixtureSets,
    overheadTankLitres,
  };
}
