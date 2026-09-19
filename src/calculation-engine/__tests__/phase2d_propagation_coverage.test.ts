// ============================================================
// PHASE 2D TEST SUITE: END-TO-END CONTROL PROPAGATION & COVERAGE
// Verifies dynamic resolution from configResolver into the production calculator,
// proving that every meaningful calculation parameter can be changed via Admin
// and accurately propagates through quantities, BOQ, budget, and report snapshots.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { configResolver } from '../config/configurationResolver';
import { calculationMethodManager } from '../rules/methodRegistry';
import { rateService } from '../data/rateService';
import { DependencyGraph } from '../rules/dependencyGraph';
import type { EngineInput } from '../types';

function getBenchmarkInput(): EngineInput {
  return {
    city: 'Bengaluru',
    plotLength: 40,
    plotWidth: 30,
    floors: 2,
    houseType: 'Duplex',
    qualityTier: 'Premium',
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      living: 1,
      kitchen: 1,
      dining: 1,
      balcony: 1,
      utility: 1,
      pooja: 1,
    },
    parkingType: 'Standard Car Park',
    carCount: 1,
    bikeCount: 2,
    evCharging: false,
    liftRequired: false,
    contractorMode: 'contractor',
    contractorMarginRate: 0.10,
    applyContractorGST: true,
  };
}

describe('Phase 2D: Full End-to-End Control Propagation & Coverage', () => {
  beforeEach(() => {
    configResolver.resetToBaseline();
    rateService.resetAllToDefault();
    calculationMethodManager.setActiveMethod('steel', 'steel_floorwise');
    calculationMethodManager.setActiveMethod('paint', 'paint_surface_area');
    calculationMethodManager.setActiveMethod('flooring', 'flooring_circulation_pct');
  });

  // ── TEST 1: Wall Height Propagation ──
  it('1. Wall Height: Changing 10 ft -> 11 ft increases wall area, masonry, plaster, paint and cost while keeping steel invariant', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    // Apply Admin override: Wall height 11 ft
    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-WALL-11',
      parameters: {
        'config.structure.wall_height_ft': 11.0,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    // Wall area and masonry blocks must increase
    expect(updated.buildingModel.grossInternalWallAreaSqFt).toBeGreaterThan(baseline.buildingModel.grossInternalWallAreaSqFt);
    expect(updated.quantities.aacBlocksPieces).toBeGreaterThan(baseline.quantities.aacBlocksPieces);
    expect(updated.quantities.interiorPaintAreaSqFt).toBeGreaterThan(baseline.quantities.interiorPaintAreaSqFt);
    expect(updated.quantities.interiorPaintLitres).toBeGreaterThan(baseline.quantities.interiorPaintLitres);
    expect(updated.budget.totalProjectCost).toBeGreaterThan(baseline.budget.totalProjectCost);

    // Physical structural quantities must remain invariant
    expect(updated.quantities.steelKg).toBe(baseline.quantities.steelKg);
    expect(updated.quantities.steelTonnes).toBe(baseline.quantities.steelTonnes);
  });

  // ── TEST 2: Bathroom Dimensions ──
  it('2. Bathroom Dimensions: Changing 6x5 -> 7x5 increases floor area, dado tiles, and waterproofing', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    // Override bathroom dimensions to 7 × 5 ft
    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-BATH-7x5',
      parameters: {
        'space.room.bathroom.length_ft': 7.0,
        'space.room.bathroom.width_ft': 5.0,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    // Bathroom floor area (3 bathrooms * 5 sqft increase = 15 sqft net floor increase)
    const baseBathrooms = baseline.buildingModel.allSpaces.filter((s) => s.type === 'bathrooms');
    const updatedBathrooms = updated.buildingModel.allSpaces.filter((s) => s.type === 'bathrooms');

    expect(updatedBathrooms[0].flooringAreaSqFt).toBe(35); // 7 × 5
    expect(baseBathrooms[0].flooringAreaSqFt).toBe(30); // 6 × 5

    // Total floor tiles and wall tiles must increase
    expect(updated.quantities.floorTilesSqFt).toBeGreaterThan(baseline.quantities.floorTilesSqFt);
    expect(updated.quantities.wallTilesSqFt).toBeGreaterThan(baseline.quantities.wallTilesSqFt);
    expect(updated.quantities.waterproofingAreaSqFt).toBeGreaterThan(baseline.quantities.waterproofingAreaSqFt);
  });

  // ── TEST 3: Living Room Dimensions ──
  it('3. Living Room: Changing dimensions updates room area, flooring, and paintable surface', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    // Override living room length from 16 to 20 ft
    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-LIVING-20',
      parameters: {
        'space.room.living.length_ft': 20.0,
        'space.room.living.width_ft': 14.0,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    const baseLiving = baseline.buildingModel.allSpaces.find((s) => s.type === 'living')!;
    const updatedLiving = updated.buildingModel.allSpaces.find((s) => s.type === 'living')!;

    expect(updatedLiving.flooringAreaSqFt).toBe(280); // 20 × 14
    expect(baseLiving.flooringAreaSqFt).toBe(200); // 16 × 12.5
    expect(updated.quantities.floorTilesSqFt).toBeGreaterThan(baseline.quantities.floorTilesSqFt);
  });

  // ── TEST 4: Steel Factor Propagation ──
  it('4. Steel Factor: Changing 2.8 -> 3.1 kg/sqft alters steel quantity while keeping cement and sand invariant', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-STEEL-3.1',
      parameters: {
        'config.rcc.steel_base_factor_kg_sqft': 3.1,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    expect(updated.quantities.steelKg).toBeGreaterThan(baseline.quantities.steelKg);
    expect(updated.quantities.steelTonnes).toBeGreaterThan(baseline.quantities.steelTonnes);

    // Cement, Sand, and Masonry must remain invariant
    expect(updated.quantities.cementBags).toBe(baseline.quantities.cementBags);
    expect(updated.quantities.sandCuFt).toBe(baseline.quantities.sandCuFt);
    expect(updated.quantities.aacBlocksPieces).toBe(baseline.quantities.aacBlocksPieces);
  });

  // ── TEST 5: Material Rate Invariance Separation ──
  it('5. Material Rate Invariance: Modifying cement unit rate alters total cost but keeps cement bags identical', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    // Override cement rate in authoritative rateService
    rateService.setOverride({
      rateId: 'cement.opc53_grade',
      rate: 550,
      overrideRate: 550,
      category: 'Cement',
      unit: 'Bags',
      location: 'ALL',
      packageTier: 'ALL',
      source: 'ADMIN_TEST',
    });

    const updated = runCalculator(input);

    // Physical bags must be 100% IDENTICAL
    expect(updated.quantities.cementBags).toBe(baseline.quantities.cementBags);

    // Total cost must increase
    expect(updated.budget.totalProjectCost).toBeGreaterThan(baseline.budget.totalProjectCost);
  });

  // ── TEST 6: Electrical Sockets Propagation ──
  it('6. Electrical Points: Changing bedroom socket points from 4 to 6 increases wire length and conduit without altering geometry', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-ELEC-SOCKETS',
      parameters: {
        'space.room.bedroom.socket_points': 6,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    // 3 bedrooms * 2 extra sockets = +6 socket points
    expect(updated.quantities.socketPoints).toBe(baseline.quantities.socketPoints + 6);
    expect(updated.quantities.wire2_5SqMmMetres).toBeGreaterThan(baseline.quantities.wire2_5SqMmMetres);
    expect(updated.quantities.conduitsMetres).toBeGreaterThan(baseline.quantities.conduitsMetres);

    // Physical room geometry must remain invariant
    expect(updated.area.totalBUASqFt).toBe(baseline.area.totalBUASqFt);
    expect(updated.buildingModel.grossExternalWallAreaSqFt).toBe(baseline.buildingModel.grossExternalWallAreaSqFt);
  });

  // ── TEST 7: Plumbing Pipe Sizing ──
  it('7. Plumbing: Changing CPVC length per point alters CPVC supply pipe metres without altering structural materials', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-CPVC-LEN',
      parameters: {
        'config.plumbing.cpvc_m_per_point': 6.0, // Increased from 4.5
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    expect(updated.quantities.cpvcSupplyMetres).toBeGreaterThan(baseline.quantities.cpvcSupplyMetres);
    expect(updated.quantities.steelKg).toBe(baseline.quantities.steelKg);
    expect(updated.quantities.cementBags).toBe(baseline.quantities.cementBags);
  });

  // ── TEST 8: Paint Coverage & Invariance ──
  it('8. Paint Coverage: Changing 45 -> 55 sqft/L decreases litres consumed while paintable area remains identical', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-PAINT-55',
      parameters: {
        'config.paint.interior_coverage_sqft_per_litre': 55,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    // Area must be identical
    expect(updated.quantities.interiorPaintAreaSqFt).toBe(baseline.quantities.interiorPaintAreaSqFt);
    expect(updated.quantities.totalPaintableAreaSqFt).toBe(baseline.quantities.totalPaintableAreaSqFt);

    // Litres required must decrease
    expect(updated.quantities.interiorPaintLitres).toBeLessThan(baseline.quantities.interiorPaintLitres);
  });

  // ── TEST 9: Flooring Wastage ──
  it('9. Flooring Wastage: Changing 7% -> 10% increases purchased tile sqft while livable room area remains identical', () => {
    const input = getBenchmarkInput();
    const baseline = runCalculator(input);

    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-FLOOR-WASTE-10',
      parameters: {
        'config.wastage.flooring': 10.0,
      },
      source: 'ADMIN_OVERRIDE',
    });

    const updated = runCalculator(input);

    // Purchased tiles must increase
    expect(updated.quantities.floorTilesSqFt).toBeGreaterThan(baseline.quantities.floorTilesSqFt);
    expect(updated.area.totalBUASqFt).toBe(baseline.area.totalBUASqFt);
  });

  // ── TEST 10: Calculation Method Switching ──
  it('10. Method Switching: Admin toggling steel method between Floor-wise and Simple BUA changes steel computation', () => {
    const input = getBenchmarkInput();

    // Method A: Floor-wise (default)
    calculationMethodManager.setActiveMethod('steel', 'steel_floorwise');
    const resultFloorwise = runCalculator(input);

    // Method B: Simple BUA Multiplier (BUA * 2.8 / 1000)
    calculationMethodManager.setActiveMethod('steel', 'steel_simple_bua');
    const resultSimpleBUA = runCalculator(input);

    // For G+1 (2 floors), Floor-wise factor is 2.8 + 0.2*1 = 3.0 kg/sqft. Simple BUA is 2.8 kg/sqft.
    expect(resultFloorwise.quantities.steelKg).toBeGreaterThan(resultSimpleBUA.quantities.steelKg);

    // Method C: Manual fixed tonnage
    configResolver.syncActiveConfiguration({
      versionNumber: 'TEST-MANUAL-STEEL',
      parameters: {
        'config.rcc.manual_steel_tonnes': 5.5,
      },
      source: 'ADMIN_OVERRIDE',
    });
    calculationMethodManager.setActiveMethod('steel', 'steel_manual');
    const resultManual = runCalculator(input);
    expect(resultManual.quantities.steelTonnes).toBe(5.5);
    expect(resultManual.quantities.steelKg).toBe(5500);
  });

  // ── TEST 11: Dependency Graph Cycle Rejection ──
  it('11. Dependency Graph: Detects circular dependencies and blocks publication', () => {
    const graph = new DependencyGraph();
    graph.addNode('param.A', 'PARAMETER');
    graph.addNode('rule.B', 'RULE');
    graph.addNode('rule.C', 'RULE');

    graph.addDependency('rule.B', 'rule.C');
    graph.addDependency('rule.C', 'rule.B'); // Cycle: B <-> C

    const cycleResult = graph.detectCycle();
    expect(cycleResult.hasCycle).toBe(true);
    expect(cycleResult.cycleNodes).toContain('rule.B');
    expect(cycleResult.cycleNodes).toContain('rule.C');
  });

  // ── TEST 12: Versioning & Snapshot Immutability ──
  it('12. Snapshot Immutability: An existing calculation snapshot remains 100% frozen when future configuration is published', () => {
    const input = getBenchmarkInput();

    // 1. Calculate under Version 1 (10 ft wall height)
    const runV1 = runCalculator(input);
    const snapshotV1 = JSON.parse(JSON.stringify({
      quantities: runV1.quantities,
      paint: runV1.paint,
      budget: runV1.budget,
      version: 'CONFIG_V1_PRODUCTION'
    }));

    // 2. Publish Version 2 with 11 ft wall height and 3.2 steel factor
    configResolver.syncActiveConfiguration({
      versionNumber: 'CONFIG_V2_PRODUCTION',
      parameters: {
        'config.structure.wall_height_ft': 11.0,
        'config.rcc.steel_base_factor_kg_sqft': 3.2,
      },
      source: 'ADMIN_OVERRIDE',
    });

    // 3. Run new project under Version 2
    const runV2 = runCalculator(input);

    // 4. Assert that the old snapshotV1 is 100% identical and unaffected by V2
    expect(snapshotV1.quantities.steelKg).toBe(runV1.quantities.steelKg);
    expect(snapshotV1.quantities.interiorPaintLitres).toBe(runV1.quantities.interiorPaintLitres);
    expect(snapshotV1.budget.totalProjectCost).toBe(runV1.budget.totalProjectCost);

    // 5. Assert that V2 project reflects new parameters
    expect(runV2.quantities.steelKg).toBeGreaterThan(snapshotV1.quantities.steelKg);
    expect(runV2.quantities.interiorPaintLitres).toBeGreaterThan(snapshotV1.quantities.interiorPaintLitres);
    expect(runV2.budget.totalProjectCost).toBeGreaterThan(snapshotV1.budget.totalProjectCost);
  });
});
