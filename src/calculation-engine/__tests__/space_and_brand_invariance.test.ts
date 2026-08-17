import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const baseInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 50,
  plotWidth: 30,
  houseType: 'Duplex',
  floors: 3,
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 1,
  evCharging: false,
  liftRequired: false,
  rooms: {
    bedrooms: 3,
    bathrooms: 3,
    commonToilets: 1,
    kitchen: 1,
    dining: 1,
    living: 1,
    balcony: 1,
    office: 0,
    pooja: 1,
    utility: 1,
    storeRoom: 0,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    doors: 'Premium Teak',
    windows: 'uPVC',
    flooring: 'Vitrified Tiles',
    bathroom: 'Jaquar',
    electrical: 'V-Guard',
    paint: 'Asian Paints',
  },
  flooringZones: {
    living: 'Vitrified Tiles 800x800mm',
    kitchenDining: 'Vitrified Tiles',
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

describe('Exhaustive Brand Invariance & Space Dependency Test Suite', () => {
  // ── 1. Steel Brand Invariance ──
  it('STEEL BRAND INVARIANCE: Tata Tiscon === JSW Neosteel === Indus TMT in physical tonnage', () => {
    const rTata = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, steel: 'Tata Tiscon' } });
    const rJSW = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, steel: 'JSW Neosteel' } });
    const rIndus = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, steel: 'Indus TMT' } });

    expect(rTata.quantities.steelTonnes).toBe(rJSW.quantities.steelTonnes);
    expect(rJSW.quantities.steelTonnes).toBe(rIndus.quantities.steelTonnes);

    // Amounts differ because rates differ
    expect(rTata.budget.totalProjectCost).toBeGreaterThan(rIndus.budget.totalProjectCost);
  });

  // ── 2. Cement Brand Invariance ──
  it('CEMENT BRAND INVARIANCE: UltraTech === ACC === Dalmia Bharat in bags count', () => {
    const rUltra = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, cement: 'UltraTech' } });
    const rACC = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, cement: 'ACC Cement' } });
    const rDalmia = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, cement: 'Dalmia Bharat' } });

    expect(rUltra.quantities.cementBags).toBe(rACC.quantities.cementBags);
    expect(rACC.quantities.cementBags).toBe(rDalmia.quantities.cementBags);

    // UltraTech (₹420) > ACC (₹395) > Dalmia (₹375)
    expect(rUltra.budget.totalProjectCost).toBeGreaterThan(rDalmia.budget.totalProjectCost);
  });

  // ── 3. Paint Brand Invariance ──
  it('PAINT BRAND INVARIANCE: Asian Paints === Berger === Dulux in paintable area', () => {
    const rAsian = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, paint: 'Asian Paints' } });
    const rBerger = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, paint: 'Berger Paints' } });
    const rDulux = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, paint: 'Dulux' } });

    expect(rAsian.quantities.interiorPaintAreaSqFt).toBe(rBerger.quantities.interiorPaintAreaSqFt);
    expect(rBerger.quantities.interiorPaintAreaSqFt).toBe(rDulux.quantities.interiorPaintAreaSqFt);
    expect(rAsian.quantities.exteriorPaintAreaSqFt).toBe(rBerger.quantities.exteriorPaintAreaSqFt);
  });

  // ── 4. Space Dependencies: Bedroom Count ──
  it('SPACE DEPENDENCY: Increasing bedrooms increases doors, windows, and electrical loads', () => {
    const r3Bed = runCalculator(baseInput);
    const r5Bed = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, bedrooms: 5 } });

    expect(r5Bed.quantities.internalDoorsCount).toBeGreaterThan(r3Bed.quantities.internalDoorsCount);
    expect(r5Bed.quantities.windowsCount).toBeGreaterThan(r3Bed.quantities.windowsCount);
    expect(r5Bed.quantities.windowAreaSqFt).toBeGreaterThan(r3Bed.quantities.windowAreaSqFt);
    expect(r5Bed.quantities.lightingPoints).toBeGreaterThan(r3Bed.quantities.lightingPoints);
    expect(r5Bed.quantities.electricalWireMetres).toBeGreaterThan(r3Bed.quantities.electricalWireMetres);
  });

  // ── 5. Space Dependencies: Bathroom Count ──
  it('SPACE DEPENDENCY: Increasing bathrooms increases plumbing fixtures, pipes, and wall tiles', () => {
    const r3Bath = runCalculator(baseInput);
    const r5Bath = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, bathrooms: 5 } });

    expect(r5Bath.quantities.bathroomFixtureSets).toBeGreaterThan(r3Bath.quantities.bathroomFixtureSets);
    expect(r5Bath.quantities.bathroomDoorsCount).toBeGreaterThan(r3Bath.quantities.bathroomDoorsCount);
    expect(r5Bath.quantities.cpvcSupplyMetres).toBeGreaterThan(r3Bath.quantities.cpvcSupplyMetres);
    expect(r5Bath.quantities.swrDrainMetres).toBeGreaterThan(r3Bath.quantities.swrDrainMetres);
    expect(r5Bath.quantities.wallTilesSqFt).toBeGreaterThan(r3Bath.quantities.wallTilesSqFt);
    expect(r5Bath.quantities.waterproofingAreaSqFt).toBeGreaterThan(r3Bath.quantities.waterproofingAreaSqFt);
  });

  // ── 6. Space Dependencies: Kitchen Count ──
  it('SPACE DEPENDENCY: Increasing kitchens increases plumbing and dado tile area', () => {
    const r1Kit = runCalculator(baseInput);
    const r2Kit = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, kitchen: 2 } });

    expect(r2Kit.quantities.wallTilesSqFt).toBeGreaterThan(r1Kit.quantities.wallTilesSqFt);
    expect(r2Kit.quantities.cpvcSupplyMetres).toBeGreaterThan(r1Kit.quantities.cpvcSupplyMetres);
    expect(r2Kit.quantities.swrDrainMetres).toBeGreaterThan(r1Kit.quantities.swrDrainMetres);
  });

  // ── 7. Mathematical Invariants: BOQ Exact Amount & Percentage ──
  it('MATHEMATICAL INVARIANT: Every single BOQ item satisfies amount = quantity * unitRate exactly', () => {
    const res = runCalculator(baseInput);
    expect(res.boq.length).toBeGreaterThan(0);

    res.boq.forEach((item) => {
      expect(item.amount).toBe(Math.round(item.quantity * item.unitRate));
      expect(item.percentage).toBeGreaterThan(0);
      expect(item.slNo).toBeGreaterThan(0);
    });

    const sumAmounts = res.boq.reduce((s, i) => s + i.amount, 0);
    expect(res.budget.baseConstructionCost).toBe(sumAmounts);

    const sumPct = res.boq.reduce((s, i) => s + i.percentage, 0);
    expect(sumPct).toBeCloseTo(100, 0);
  });

  // ── 8. Mathematical Invariants: Total Cost & Commercial Markup ──
  it('TOTAL COST INVARIANT: Base Cost + Professional Fees + Margin + Contingency + GST', () => {
    const res = runCalculator(baseInput);
    const b = res.budget;

    const expectedTotal = b.baseConstructionCost + b.professionalFees + Math.round(b.baseConstructionCost * 0.15) + b.contingency + b.gstAmount;
    expect(b.totalProjectCost).toBe(expectedTotal);
    expect(b.costPerSqFt).toBe(Math.round(b.totalProjectCost / res.area.totalBUASqFt));
  });

  // ── 9. Robustness & Edge Cases: No NaN or Infinity ──
  it('EDGE CASES: Handles zero, tiny plots, huge plots, and extreme room counts without NaN/Infinity', () => {
    const edgeCases: Partial<EngineInput>[] = [
      { plotLength: 0, plotWidth: 0, floors: 0 },
      { plotLength: 10, plotWidth: 10, floors: 1 },
      { plotLength: 200, plotWidth: 200, floors: 5 },
      { floors: 1, rooms: { ...baseInput.rooms, balcony: 0, commonToilets: 0 } },
      { liftRequired: true, evCharging: true, carCount: 4, bikeCount: 6 },
    ];

    edgeCases.forEach((ec) => {
      const res = runCalculator({ ...baseInput, ...ec } as EngineInput);
      expect(Number.isNaN(res.budget.totalProjectCost)).toBe(false);
      expect(Number.isFinite(res.budget.totalProjectCost)).toBe(true);
      expect(Number.isNaN(res.budget.costPerSqFt)).toBe(false);
      expect(Number.isFinite(res.budget.costPerSqFt)).toBe(true);
      expect(res.budget.totalProjectCost).toBeGreaterThanOrEqual(0);
      expect(res.budget.costPerSqFt).toBeGreaterThanOrEqual(0);
    });
  });

  // ── 10. Trace Generation Invariant ──
  it('CALCULATION TRACE: Generates complete auditable derivation steps', () => {
    const res = runCalculator(baseInput);
    expect(res.trace).toBeDefined();
    expect(res.trace.length).toBeGreaterThanOrEqual(10);

    const plotStep = res.trace.find((t) => t.parameter === 'Plot Area');
    expect(plotStep).toBeDefined();
    expect(plotStep?.result).toBe(1500);

    const buaStep = res.trace.find((t) => t.parameter === 'Total Built-up Area (BUA)');
    expect(buaStep).toBeDefined();
    expect(buaStep?.result).toBe(2484);
  });
});
