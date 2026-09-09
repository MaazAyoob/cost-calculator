// ============================================================
// ELECTRICAL CALCULATION ENGINE (P0.6 - P0.10)
// Strictly follows Hutty Pilot Specification & Electrical Developer Audit
//
// Invariants Enforced:
// 1. Single Source of Truth: Driven by SpaceModel & EngineInput
// 2. Zero Fixed Universal Numbers: No 700m wire or 325m conduit heuristics
// 3. Point Schedule: Light, Fan, Sockets, AC, Geysers, TV/Data, EV, Main DB, Sub-DBs
// 4. Conductor Size Segregation:
//    - 1.5 sq.mm: Lighting, Fans & Switch Control Loops
//    - 2.5 sq.mm: Power Sockets & General Loads
//    - 4.0 sq.mm: Dedicated AC & Geyser Heavy Circuits
//    - 6.0 sq.mm: Vertical Floor Risers & EV Charger Supply
// 5. Distinct Conductor Length vs Conduit Route Length
// ============================================================

import { EngineInput, AreaResult, BuildingModel } from '../types';

export interface ElectricalEngineOutput {
  lightingPoints: number;
  fanPoints: number;
  socketPoints: number;
  acPoints: number;
  geyserPoints: number;
  tvDataPoints: number;
  evPoints: number;
  mainDBCount: number;
  floorDBCount: number;
  totalElectricalPoints: number;
  switchModules: number;
  conduitsMetres: number;
  electricalWireMetres: number;
  wire1_5SqMmMetres: number;
  wire2_5SqMmMetres: number;
  wire4SqMmMetres: number;
  wire6SqMmMetres: number;
}

export function calculateElectrical(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel
): ElectricalEngineOutput {
  const bua = area.totalBUASqFt || 0;
  const floors = Math.max(0, input.floors || 0);

  if (bua <= 0 || floors <= 0) {
    return {
      lightingPoints: 0,
      fanPoints: 0,
      socketPoints: 0,
      acPoints: 0,
      geyserPoints: 0,
      tvDataPoints: 0,
      evPoints: 0,
      mainDBCount: 0,
      floorDBCount: 0,
      totalElectricalPoints: 0,
      switchModules: 0,
      conduitsMetres: 0,
      electricalWireMetres: 0,
      wire1_5SqMmMetres: 0,
      wire2_5SqMmMetres: 0,
      wire4SqMmMetres: 0,
      wire6SqMmMetres: 0,
    };
  }

  // ────────────────────────────────────────────────────────────
  // 1. POINT SCHEDULE DERIVATION FROM SPACE MODEL
  // ────────────────────────────────────────────────────────────
  const spaces = buildingModel.allSpaces || [];

  const rawLight = spaces.reduce((sum, s) => sum + (s.lightPoints || 0), 0);
  const rawFan = spaces.reduce((sum, s) => sum + (s.fanPoints || 0), 0);
  const rawSocket = spaces.reduce((sum, s) => sum + (s.socketPoints || 0), 0);
  const rawAC = spaces.reduce((sum, s) => sum + (s.acPoints || 0), 0);
  const rawGeyser = spaces.reduce((sum, s) => sum + (s.geyserPoints || 0), 0);
  const rawTvData = spaces.reduce((sum, s) => sum + (s.tvDataPoints || 0), 0);

  // Circulation & Utility lighting
  const stairLight = Math.max(0, floors - 1) * 2; // 2 lights per staircase flight
  const terraceLight = 2; // 2 weatherproof bulkhead lights on terrace
  const parkingLight = (input.carCount || 0) > 0 ? 2 : 1;
  const liftAddition = input.liftRequired ? 4 : 0; // Lift pit, car, motor room lighting

  const lightingPoints = rawLight + stairLight + terraceLight + parkingLight + liftAddition;
  const fanPoints = rawFan;
  const socketPoints = rawSocket;
  const acPoints = rawAC;
  const geyserPoints = rawGeyser;
  const tvDataPoints = rawTvData;
  const evPoints = input.evCharging ? 1 : 0;

  // Distribution Panels
  const mainDBCount = 1; // 1 Main LT Panel / Incomer DB at service entry
  const floorDBCount = Math.max(1, floors); // 1 Sub-Distribution Board per floor

  const totalElectricalPoints =
    lightingPoints +
    fanPoints +
    socketPoints +
    acPoints +
    geyserPoints +
    tvDataPoints +
    evPoints;

  // Modular switch plates & modules (approx 0.75 modular units per point + accessories)
  const switchModules = Math.round(totalElectricalPoints * 0.75) + (input.liftRequired ? 4 : 0);

  // ────────────────────────────────────────────────────────────
  // 2. CONDUCTOR SIZING & LENGTHS (Metres of Single Core Wire)
  // ────────────────────────────────────────────────────────────
  // 1.5 sq.mm: Lighting & Fan points (Phase + Neutral + Earth loop)
  // ~2.8m route run × 3 conductors = 8.4m -> 8.5m single-core wire per point
  const wire1_5SqMmMetres = Math.round((lightingPoints + fanPoints) * 8.5);

  // 2.5 sq.mm: 6A/16A Power Sockets & TV/Data power outlets
  // ~4.1m route run × 3 conductors = 12.3m -> 12.5m single-core wire per point
  const wire2_5SqMmMetres = Math.round((socketPoints + tvDataPoints) * 12.5);

  // 4.0 sq.mm: Dedicated Heavy Appliance Homerun Circuits (AC & Geyser)
  // ~7.3m route run × 3 conductors = 22.0m single-core wire per heavy load point
  const wire4SqMmMetres = Math.round((acPoints + geyserPoints) * 22.0);

  // 6.0 sq.mm: Vertical Distribution Sub-Main Risers & EV Charging Run
  // Main DB to each upper floor sub-DB (~11.6m shaft run × 3 conductors = ~35m per upper floor)
  // Dedicated 32A EV Charger homerun (~11.6m route × 3 conductors = ~35m)
  const riserWireMetres = Math.max(0, floors - 1) * 35;
  const evWireMetres = input.evCharging ? 35 : 0;
  const wire6SqMmMetres = riserWireMetres + evWireMetres;

  // Total Conductor Length
  const electricalWireMetres =
    wire1_5SqMmMetres +
    wire2_5SqMmMetres +
    wire4SqMmMetres +
    wire6SqMmMetres;

  // ────────────────────────────────────────────────────────────
  // 3. CONDUIT ROUTE CALCULATION (Heavy-Duty ISI PVC 25mm)
  // ────────────────────────────────────────────────────────────
  // Conduit route length is physical piping embedded in slab & wall chases.
  // Calculated from point density (~2.6m conduit route per draw point)
  // + vertical riser shaft conduit (~15m per upper floor) + EV run (~12m)
  const verticalConduitRisers = Math.max(0, floors - 1) * 15;
  const evConduit = input.evCharging ? 12 : 0;
  const conduitsMetres = Math.round(
    totalElectricalPoints * 2.6 + verticalConduitRisers + evConduit
  );

  return {
    lightingPoints,
    fanPoints,
    socketPoints,
    acPoints,
    geyserPoints,
    tvDataPoints,
    evPoints,
    mainDBCount,
    floorDBCount,
    totalElectricalPoints,
    switchModules,
    conduitsMetres,
    electricalWireMetres,
    wire1_5SqMmMetres,
    wire2_5SqMmMetres,
    wire4SqMmMetres,
    wire6SqMmMetres,
  };
}
