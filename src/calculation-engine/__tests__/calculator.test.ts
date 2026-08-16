import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const mockInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 60,
  plotWidth: 40,
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
  // ── INVARIANT 1: BUA & Plot Area Formulas ──
  it('UNIVERSAL BUA FORMULA: plot area = L × W, buildable = 60%, BUA/floor = 92%, total = BUA/floor × floors', () => {
    const testDimensions = [
      { l: 40, w: 30, f: 1, expectedPlot: 1200, expectedFootprint: 720, expectedFloorBua: 662, expectedTotalBua: 662 },
      { l: 40, w: 30, f: 3, expectedPlot: 1200, expectedFootprint: 720, expectedFloorBua: 662, expectedTotalBua: 1986 },
      { l: 50, w: 30, f: 3, expectedPlot: 1500, expectedFootprint: 900, expectedFloorBua: 828, expectedTotalBua: 2484 },
      { l: 60, w: 40, f: 3, expectedPlot: 2400, expectedFootprint: 1440, expectedFloorBua: 1325, expectedTotalBua: 3975 },
      { l: 80, w: 50, f: 4, expectedPlot: 4000, expectedFootprint: 2400, expectedFloorBua: 2208, expectedTotalBua: 8832 },
      { l: 90, w: 60, f: 5, expectedPlot: 5400, expectedFootprint: 3240, expectedFloorBua: 2981, expectedTotalBua: 14905 },
    ];

    testDimensions.forEach(({ l, w, f, expectedPlot, expectedFootprint, expectedFloorBua, expectedTotalBua }) => {
      const res = runCalculator({ ...mockInput, plotLength: l, plotWidth: w, floors: f });
      expect(res.area.plotAreaSqFt).toBe(expectedPlot);
      expect(res.area.buildableAreaSqFt).toBe(expectedFootprint);
      expect(res.area.buaPerFloorSqFt).toBe(expectedFloorBua);
      expect(res.area.totalBUASqFt).toBe(expectedTotalBua);
    });
  });

  // ── INVARIANT 2: Steel & Cement Quantities ──
  it('should compute structural quantities from BUA without magic multipliers', () => {
    const result = runCalculator(mockInput);
    // Premium tier = 4.5 kg steel / sqft BUA
    const expectedKg = result.area.totalBUASqFt * 4.5;
    expect(result.quantities.steelTonnes).toBe(parseFloat((expectedKg / 1000).toFixed(1)));

    // Premium tier = 0.44 cement bags / sqft BUA
    const expectedCement = Math.round(result.area.totalBUASqFt * 0.44);
    expect(result.quantities.cementBags).toBe(expectedCement);
  });

  // ── INVARIANT 3: BOQ Item Dimensional Correctness ──
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

  // ── INVARIANT 4: Dynamic BOQ Percentages ──
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

  // ── INVARIANT 5: Total Cost & Effective Rate Derivation ──
  it('DERIVED EFFECTIVE RATE: Effective Rate/Sq.Ft = Total Project Cost ÷ Total BUA', () => {
    const result = runCalculator(mockInput);
    const expectedRate = Math.round(result.budget.totalProjectCost / result.area.totalBUASqFt);
    expect(result.budget.costPerSqFt).toBe(expectedRate);
  });

  // ── INVARIANT 6: Brand Selection Invariance on Physical Quantities ──
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

  // ── INVARIANT 7: Space Dependencies ──
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

  // ── INVARIANT 8: True Zero-Start ──
  it('TRUE ZERO-START: unconfigured project yields 0 BUA, ₹0 cost, 0 rate, empty BOQ', () => {
    const res = runCalculator(emptyZeroInput);
    expect(res.area.plotAreaSqFt).toBe(0);
    expect(res.area.totalBUASqFt).toBe(0);
    expect(res.budget.totalProjectCost).toBe(0);
    expect(res.budget.costPerSqFt).toBe(0);
    expect(res.boq.length).toBe(0);
  });

  // ── INVARIANT 9: Progressive Cost Contribution ──
  it('PROGRESSIVE COST CONTRIBUTION: selecting materials increases cost progressively from 0', () => {
    // 1. Enter dimensions only (30x40, G+1 = 1324 sqft BUA), no materials selected
    const step1Only: EngineInput = {
      ...emptyZeroInput,
      plotLength: 40,
      plotWidth: 30,
      floors: 2,
    };
    const resStep1 = runCalculator(step1Only);
    expect(resStep1.area.totalBUASqFt).toBe(1324);
    expect(resStep1.quantities.steelTonnes).toBe(6.0); // 1324 * 4.5 = 5958 kg = 6.0 T
    expect(resStep1.budget.totalProjectCost).toBeGreaterThan(0); // Structural baseline cost is live
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

    // 5. Change plot to 40x60 G+1 (2648 sqft): BUA and quantities double, cost updates live
    const expandedPlot: EngineInput = {
      ...withJSW,
      plotLength: 60,
      plotWidth: 40,
    };
    const resExpanded = runCalculator(expandedPlot);
    expect(resExpanded.area.totalBUASqFt).toBe(2650);
    expect(resExpanded.quantities.steelTonnes).toBe(11.9);
    expect(resExpanded.budget.totalProjectCost).toBeGreaterThan(resWithJSW.budget.totalProjectCost);
  });

  // ── INVARIANT 10: Payment Milestones ──
  it('PAYMENT MILESTONES: 11 payment milestones sum exactly to total budget', () => {
    const result = runCalculator(mockInput);
    expect(result.paymentPlan.length).toBe(11);
    const sumMilestones = result.paymentPlan.reduce((sum, m) => sum + m.amount, 0);
    expect(sumMilestones).toBe(result.budget.totalProjectCost);
  });
});
