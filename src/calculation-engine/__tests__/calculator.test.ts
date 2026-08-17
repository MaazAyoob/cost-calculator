import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const mockInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 60,
  plotWidth: 40,
  builtUpAreaPerFloor: 1440, // 60% of 2400 sq.ft
  houseType: 'Duplex',
  floors: 3,
  parkingType: 'Stilt Parking',
  carCount: 2,
  bikeCount: 2,
  evCharging: true,
  liftRequired: true,
  rooms: {
    bedrooms: 4,
    bathrooms: 4,
    commonToilets: 1,
    kitchen: 1,
    dining: 1,
    living: 2,
    balcony: 2,
    office: 1,
    pooja: 1,
    utility: 1,
    storeRoom: 1,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    doors: 'Teakwood Custom Joinery',
    windows: 'Fenesta uPVC',
    flooring: 'Italian Marble',
    bathroom: 'Kohler',
    electrical: 'Finolex',
    paint: 'Asian Paints Royale',
  },
  flooringZones: {
    living: 'Italian Marble',
    kitchenDining: 'Granite',
    bedrooms: 'Vitrified Tiles',
    bathrooms: 'Anti-skid Ceramic Tiles',
    parkingUtility: 'Heavy-Duty Parking Tiles',
    balconies: 'Anti-skid Ceramic',
  },
  wallCladding: {
    kitchenDadoHeight: '2 ft',
    bathroomTileHeight: '7 ft (Lintel)',
  },
  doors: {
    mainDoor: 'Premium Teak',
    internalDoor: 'Flush Door',
    bathroomDoor: 'WPC Door',
  },
  windows: {
    primaryMaterial: 'uPVC',
    subGrade: 'Standard uPVC',
  },
  electrical: {
    conduit: 'Heavy-Duty ISI Marked PVC',
    wireTier: 'Mid-range (V-Guard)',
  },
  bathroomFittings: {
    sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
    cpvcBrand: 'Ashirwad',
  },
  painting: {
    baseLayer: 'Putty + Primer',
    internalPaint: 'Premium Emulsion',
    externalPaint: 'Ultima Weather Proof',
    brand: 'Asian Paints',
  },
};

const emptyZeroInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 0,
  plotWidth: 0,
  builtUpAreaPerFloor: 0,
  houseType: 'Duplex',
  floors: 0,
  parkingType: 'Normal Ground',
  carCount: 0,
  bikeCount: 0,
  evCharging: false,
  liftRequired: false,
  rooms: {
    bedrooms: 0,
    bathrooms: 0,
    commonToilets: 0,
    kitchen: 0,
    dining: 0,
    living: 0,
    balcony: 0,
    office: 0,
    pooja: 0,
    utility: 0,
    storeRoom: 0,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: '' as any,
    cement: '' as any,
    doors: '' as any,
    windows: '' as any,
    flooring: '' as any,
    bathroom: '' as any,
    electrical: '' as any,
    paint: '' as any,
  },
  flooringZones: {
    living: '' as any,
    kitchenDining: '' as any,
    bedrooms: '' as any,
    bathrooms: '' as any,
    parkingUtility: '' as any,
    balconies: '' as any,
  },
  wallCladding: {
    kitchenDadoHeight: '' as any,
    bathroomTileHeight: '' as any,
  },
  doors: {
    mainDoor: '' as any,
    internalDoor: '' as any,
    bathroomDoor: '' as any,
  },
  windows: {
    primaryMaterial: '' as any,
    subGrade: '' as any,
  },
  electrical: {
    conduit: 'Heavy-Duty ISI Marked PVC',
    wireTier: '' as any,
  },
  bathroomFittings: {
    sanitaryTier: '' as any,
    cpvcBrand: '' as any,
  },
  painting: {
    baseLayer: 'Putty + Primer',
    internalPaint: '' as any,
    externalPaint: '' as any,
    brand: '' as any,
  },
};

describe('Calculation Engine Core Invariants', () => {
  // ── INVARIANT 1: User-Selected BUA & Ground Area Verification ──
  it('USER SELECTED BUA & GROUND COVERAGE: calculates plot area, selected BUA, remaining ground area, and coverage percentage', () => {
    // Test Case A: 30×40 plot, Selected BUA = 720 (60% coverage)
    const resA = runCalculator({
      ...mockInput,
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 1,
    });
    expect(resA.area.plotAreaSqFt).toBe(1200);
    expect(resA.area.buaPerFloorSqFt).toBe(720);
    expect(resA.area.remainingGroundAreaSqFt).toBe(480);
    expect(resA.area.groundCoveragePercentage).toBe(60);
    expect(resA.area.totalBUASqFt).toBe(720);

    // Test Case B: 30×40 plot, Selected BUA = 900 (75% coverage)
    const resB = runCalculator({
      ...mockInput,
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 900,
      floors: 1,
    });
    expect(resB.area.plotAreaSqFt).toBe(1200);
    expect(resB.area.buaPerFloorSqFt).toBe(900);
    expect(resB.area.remainingGroundAreaSqFt).toBe(300);
    expect(resB.area.groundCoveragePercentage).toBe(75);
    expect(resB.area.totalBUASqFt).toBe(900);

    // Test Case C: 30×50 plot, Selected BUA = 900 (60% coverage)
    const resC = runCalculator({
      ...mockInput,
      plotLength: 50,
      plotWidth: 30,
      builtUpAreaPerFloor: 900,
      floors: 1,
    });
    expect(resC.area.plotAreaSqFt).toBe(1500);
    expect(resC.area.buaPerFloorSqFt).toBe(900);
    expect(resC.area.remainingGroundAreaSqFt).toBe(600);
    expect(resC.area.groundCoveragePercentage).toBe(60);
    expect(resC.area.totalBUASqFt).toBe(900);
  });

  // ── INVARIANT 2: Multi-Floor Remaining Ground Area Safety ──
  it('MULTI-FLOOR GROUND FOOTPRINT SAFETY: remaining ground area must be plotArea - buaPerFloor, NOT plotArea - totalBUA', () => {
    // 30×40 plot (1200 sqft), BUA/floor = 900, Floors = 3
    const resMulti = runCalculator({
      ...mockInput,
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 900,
      floors: 3,
    });

    expect(resMulti.area.plotAreaSqFt).toBe(1200);
    expect(resMulti.area.buaPerFloorSqFt).toBe(900);
    expect(resMulti.area.totalBUASqFt).toBe(2700);
    // Remaining ground area is 1,200 - 900 = 300, NEVER 1,200 - 2,700 (-1500)
    expect(resMulti.area.remainingGroundAreaSqFt).toBe(300);
    expect(resMulti.area.remainingGroundArea).toBe(300);
    expect(resMulti.area.groundCoveragePercentage).toBe(75);
  });

  // ── INVARIANT 3: Steel & Cement Quantities derived from totalBUA ──
  it('should compute structural quantities from totalBUA without magic multipliers', () => {
    const result = runCalculator(mockInput);
    // Premium tier = 4.5 kg steel / sqft BUA
    const expectedKg = result.area.totalBUASqFt * 4.5;
    expect(result.quantities.steelTonnes).toBe(parseFloat((expectedKg / 1000).toFixed(1)));

    // Premium tier = 0.44 cement bags / sqft BUA
    const expectedCement = Math.round(result.area.totalBUASqFt * 0.44);
    expect(result.quantities.cementBags).toBe(expectedCement);
  });

  // ── INVARIANT 4: BOQ Item Dimensional Correctness ──
  it('BOQ UNIT SAFETY: Amount = Quantity × Unit Rate for all BOQ items', () => {
    const result = runCalculator(mockInput);
    expect(result.boq.length).toBeGreaterThanOrEqual(35);

    result.boq.forEach((item) => {
      const calculatedAmount = Math.round(item.quantity * item.unitRate);
      expect(item.amount).toBe(calculatedAmount);
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.unitRate).toBeGreaterThan(0);
    });
  });

  // ── INVARIANT 5: Dynamic BOQ Percentages ──
  it('DYNAMIC BOQ PERCENTAGES: every percentage is dynamically derived from item amount / total sum', () => {
    const result = runCalculator(mockInput);
    const totalSum = result.boq.reduce((sum, item) => sum + item.amount, 0);

    result.boq.forEach((item) => {
      const expectedPercentage = parseFloat(((item.amount / totalSum) * 100).toFixed(2));
      expect(item.percentage).toBe(expectedPercentage);
    });

    const sumPercentages = result.boq.reduce((sum, item) => sum + item.percentage, 0);
    expect(sumPercentages).toBeGreaterThan(99.0);
    expect(sumPercentages).toBeLessThan(101.0);
  });

  // ── INVARIANT 6: Total Cost & Effective Rate Derivation ──
  it('DERIVED EFFECTIVE RATE: Effective Rate/Sq.Ft = Total Project Cost ÷ Total BUA', () => {
    const result = runCalculator(mockInput);
    const expectedRate = Math.round(result.budget.totalProjectCost / result.area.totalBUASqFt);
    expect(result.budget.costPerSqFt).toBe(expectedRate);
  });

  // ── INVARIANT 7: Brand Selection Invariance on Physical Quantities ──
  it('MATERIAL BRAND INVARIANCE: Brand changes must alter unit rates but preserve physical quantities', () => {
    // Steel brands
    const resSteel1 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, steel: 'Tata Tiscon' } });
    const resSteel2 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, steel: 'JSW Neosteel' } });
    const resSteel3 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, steel: 'Indus TMT' } });

    expect(resSteel1.quantities.steelTonnes).toBe(resSteel2.quantities.steelTonnes);
    expect(resSteel2.quantities.steelTonnes).toBe(resSteel3.quantities.steelTonnes);

    // Cement brands
    const resCement1 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, cement: 'UltraTech' } });
    const resCement2 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, cement: 'ACC Cement' } });
    const resCement3 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, cement: 'Dalmia Bharat' } });

    expect(resCement1.quantities.cementBags).toBe(resCement2.quantities.cementBags);
    expect(resCement2.quantities.cementBags).toBe(resCement3.quantities.cementBags);

    // Paint brands
    const resPaint1 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, paint: 'Asian Paints Royale' } });
    const resPaint2 = runCalculator({ ...mockInput, materialBrands: { ...mockInput.materialBrands, paint: 'Berger Silk' } });

    expect(resPaint1.quantities.interiorPaintAreaSqFt).toBe(resPaint2.quantities.interiorPaintAreaSqFt);
    expect(resPaint1.quantities.exteriorPaintAreaSqFt).toBe(resPaint2.quantities.exteriorPaintAreaSqFt);
  });

  // ── INVARIANT 8: Space Dependencies ──
  it('ROOM COUNTS DEPENDENCY: changing bedroom count scales doors, electrical points, wiring, and conduit', () => {
    const base = runCalculator(mockInput);
    
    // Add 1 bedroom (4 -> 5)
    const expandedInput = { ...mockInput, rooms: { ...mockInput.rooms, bedrooms: 5 } };
    const expanded = runCalculator(expandedInput);

    expect(expanded.quantities.internalDoorsCount).toBeGreaterThan(base.quantities.internalDoorsCount);
    expect(expanded.quantities.lightingPoints).toBeGreaterThan(base.quantities.lightingPoints);
    expect(expanded.quantities.electricalWireMetres).toBeGreaterThan(base.quantities.electricalWireMetres);
    expect(expanded.quantities.conduitsMetres).toBeGreaterThan(base.quantities.conduitsMetres);
  });

  it('BATHROOM DEPENDENCY: changing bathroom count scales fixture sets, CPVC, SWR, floor traps, wall tiles, and waterproofing', () => {
    const base = runCalculator(mockInput);

    // Increase bathrooms (4 -> 6)
    const expanded = runCalculator({ ...mockInput, rooms: { ...mockInput.rooms, bathrooms: 6 } });
    expect(expanded.quantities.bathroomFixtureSets).toBeGreaterThan(base.quantities.bathroomFixtureSets);
    expect(expanded.quantities.cpvcSupplyMetres).toBeGreaterThan(base.quantities.cpvcSupplyMetres);
    expect(expanded.quantities.swrDrainMetres).toBeGreaterThan(base.quantities.swrDrainMetres);
    expect(expanded.quantities.floorTrapsCount).toBeGreaterThan(base.quantities.floorTrapsCount);
    expect(expanded.quantities.wallTilesSqFt).toBeGreaterThan(base.quantities.wallTilesSqFt);
    expect(expanded.quantities.waterproofingAreaSqFt).toBeGreaterThan(base.quantities.waterproofingAreaSqFt);
  });

  // ── INVARIANT 9: True Zero-Start ──
  it('TRUE ZERO-START: unconfigured project yields 0 BUA, ₹0 cost, 0 rate, empty BOQ', () => {
    const res = runCalculator(emptyZeroInput);
    expect(res.area.plotAreaSqFt).toBe(0);
    expect(res.area.buaPerFloorSqFt).toBe(0);
    expect(res.area.remainingGroundAreaSqFt).toBe(0);
    expect(res.area.totalBUASqFt).toBe(0);
    expect(res.budget.totalProjectCost).toBe(0);
    expect(res.budget.costPerSqFt).toBe(0);
    expect(res.boq.length).toBe(0);
  });

  // ── INVARIANT 10: Progressive Cost Contribution with User-Selected BUA ──
  it('PROGRESSIVE COST CONTRIBUTION: selecting BUA and materials increases cost progressively', () => {
    // 1. Enter dimensions and desired BUA (30x40, 720 sqft/floor, G+1 = 1440 sqft BUA)
    const step1Only: EngineInput = {
      ...emptyZeroInput,
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
    };
    const resStep1 = runCalculator(step1Only);
    expect(resStep1.area.plotAreaSqFt).toBe(1200);
    expect(resStep1.area.buaPerFloorSqFt).toBe(720);
    expect(resStep1.area.remainingGroundAreaSqFt).toBe(480);
    expect(resStep1.area.groundCoveragePercentage).toBe(60);
    expect(resStep1.area.totalBUASqFt).toBe(1440);
    expect(resStep1.quantities.steelTonnes).toBe(6.5); // 1440 * 4.5 = 6480 kg = 6.5 T
    expect(resStep1.budget.totalProjectCost).toBeGreaterThan(0);
    expect(resStep1.budget.costPerSqFt).toBeGreaterThan(0);

    // 2. Select Steel brand (Tata Tiscon)
    const withSteel: EngineInput = {
      ...step1Only,
      materialBrands: { ...step1Only.materialBrands, steel: 'Tata Tiscon' },
    };
    const resWithSteel = runCalculator(withSteel);
    expect(resWithSteel.budget.totalProjectCost).toBeGreaterThan(0);
    expect(resWithSteel.budget.costPerSqFt).toBeGreaterThan(0);

    // 3. Select Cement brand (UltraTech)
    const withCement: EngineInput = {
      ...withSteel,
      materialBrands: { ...withSteel.materialBrands, cement: 'UltraTech' },
    };
    const resWithCement = runCalculator(withCement);
    expect(resWithCement.budget.totalProjectCost).toBeGreaterThan(resWithSteel.budget.totalProjectCost);

    // 4. Change steel brand from Tata Tiscon to JSW: quantity invariant, cost changes
    const withJSW: EngineInput = {
      ...withCement,
      materialBrands: { ...withCement.materialBrands, steel: 'JSW Neosteel' },
    };
    const resWithJSW = runCalculator(withJSW);
    expect(resWithJSW.quantities.steelTonnes).toBe(resWithCement.quantities.steelTonnes);
    expect(resWithJSW.budget.totalProjectCost).not.toBe(resWithCement.budget.totalProjectCost);
  });

  // ── INVARIANT 11: Payment Milestones ──
  it('PAYMENT MILESTONES: 11 payment milestones sum exactly to total budget', () => {
    const result = runCalculator(mockInput);
    expect(result.paymentPlan.length).toBe(11);
    const sumMilestones = result.paymentPlan.reduce((sum, m) => sum + m.amount, 0);
    expect(sumMilestones).toBe(result.budget.totalProjectCost);
  });
});

