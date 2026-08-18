import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const baseInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 50,
  plotWidth: 30,
  builtUpAreaPerFloor: 900,
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

  // ── 10. Dedicated 10-Case Client Requirement Validation Suite ──
  describe('Client Required 10-Case Live Calculation Propagation Tests', () => {
    it('TEST 1: Initial zero-state project has totalProjectCost === 0', () => {
      const zeroInput: EngineInput = {
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
          bedrooms: 0, bathrooms: 0, commonToilets: 0, kitchen: 0,
          dining: 0, living: 0, balcony: 0, office: 0, pooja: 0, utility: 0, storeRoom: 0
        },
        qualityTier: 'Premium',
        materialBrands: {} as any,
        flooringZones: {} as any,
        wallCladding: {} as any,
        doors: {} as any,
        windows: {} as any,
        electrical: {} as any,
        bathroomFittings: {} as any,
        painting: {} as any,
      };
      const res = runCalculator(zeroInput);
      expect(res.budget.totalProjectCost).toBe(0);
      expect(res.budget.costPerSqFt).toBe(0);
      expect(res.area.totalBUASqFt).toBe(0);
      expect(res.boq.length).toBe(0);
    });

    it('TEST 2: Changing plot dimensions changes total cost when configured', () => {
      const rSmall = runCalculator({ ...baseInput, plotLength: 40, plotWidth: 30, builtUpAreaPerFloor: 720 });
      const rLarge = runCalculator({ ...baseInput, plotLength: 60, plotWidth: 40, builtUpAreaPerFloor: 1440 });
      expect(rSmall.budget.totalProjectCost).not.toBe(rLarge.budget.totalProjectCost);
      expect(rLarge.budget.totalProjectCost).toBeGreaterThan(rSmall.budget.totalProjectCost);
    });

    it('TEST 3: Changing floors changes BUA and total cost', () => {
      const rG1 = runCalculator({ ...baseInput, floors: 2 });
      const rG2 = runCalculator({ ...baseInput, floors: 3 });
      expect(rG1.area.totalBUASqFt).not.toBe(rG2.area.totalBUASqFt);
      expect(rG2.area.totalBUASqFt).toBeGreaterThan(rG1.area.totalBUASqFt);
      expect(rG1.budget.totalProjectCost).not.toBe(rG2.budget.totalProjectCost);
      expect(rG2.budget.totalProjectCost).toBeGreaterThan(rG1.budget.totalProjectCost);
    });

    it('TEST 4: Bedrooms + 1 changes bedroom-dependent quantities and total cost', () => {
      const r2Bed = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, bedrooms: 2 } });
      const r3Bed = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, bedrooms: 3 } });

      expect(r3Bed.quantities.internalDoorsCount).toBe(r2Bed.quantities.internalDoorsCount + 1);
      expect(r3Bed.quantities.windowsCount).toBeGreaterThan(r2Bed.quantities.windowsCount);
      expect(r3Bed.quantities.lightingPoints).toBeGreaterThan(r2Bed.quantities.lightingPoints);
      expect(r3Bed.budget.totalProjectCost).toBeGreaterThan(r2Bed.budget.totalProjectCost);
    });

    it('TEST 5: Bathrooms + 1 changes bathroom-dependent quantities and total cost', () => {
      const r2Bath = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, bathrooms: 2 } });
      const r3Bath = runCalculator({ ...baseInput, rooms: { ...baseInput.rooms, bathrooms: 3 } });

      expect(r3Bath.quantities.bathroomDoorsCount).toBe(r2Bath.quantities.bathroomDoorsCount + 1);
      expect(r3Bath.quantities.bathroomFixtureSets).toBeGreaterThan(r2Bath.quantities.bathroomFixtureSets);
      expect(r3Bath.quantities.wallTilesSqFt).toBeGreaterThan(r2Bath.quantities.wallTilesSqFt);
      expect(r3Bath.quantities.waterproofingAreaSqFt).toBeGreaterThan(r2Bath.quantities.waterproofingAreaSqFt);
      expect(r3Bath.budget.totalProjectCost).toBeGreaterThan(r2Bath.budget.totalProjectCost);
    });

    it('TEST 6: Steel brand change keeps quantity invariant, changes rate and amount', () => {
      const rTata = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, steel: 'Tata Tiscon' } });
      const rJSW = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, steel: 'JSW Neosteel' } });

      expect(rTata.quantities.steelTonnes).toBe(rJSW.quantities.steelTonnes);
      expect(rTata.budget.totalProjectCost).not.toBe(rJSW.budget.totalProjectCost);
      expect(rTata.budget.totalProjectCost).toBeGreaterThan(rJSW.budget.totalProjectCost);
    });

    it('TEST 7: Cement brand change keeps bag count invariant, changes rate and amount', () => {
      const rUltra = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, cement: 'UltraTech' } });
      const rDalmia = runCalculator({ ...baseInput, materialBrands: { ...baseInput.materialBrands, cement: 'Dalmia Bharat' } });

      expect(rUltra.quantities.cementBags).toBe(rDalmia.quantities.cementBags);
      expect(rUltra.budget.totalProjectCost).not.toBe(rDalmia.budget.totalProjectCost);
      expect(rUltra.budget.totalProjectCost).toBeGreaterThan(rDalmia.budget.totalProjectCost);
    });

    it('TEST 8: Flooring selection keeps floor tile area invariant, changes rate and amount', () => {
      const rMarble = runCalculator({ ...baseInput, flooringZones: { ...baseInput.flooringZones, living: 'Italian Marble' } });
      const rVitrified = runCalculator({ ...baseInput, flooringZones: { ...baseInput.flooringZones, living: 'Vitrified Tiles 800x800mm' } });

      expect(rMarble.quantities.floorTilesSqFt).toBe(rVitrified.quantities.floorTilesSqFt);
      expect(rMarble.budget.totalProjectCost).not.toBe(rVitrified.budget.totalProjectCost);
      expect(rMarble.budget.totalProjectCost).toBeGreaterThan(rVitrified.budget.totalProjectCost);
    });

    it('TEST 9: Door selection keeps door count invariant, changes rate and amount', () => {
      const rTeak = runCalculator({ ...baseInput, doors: { ...baseInput.doors, mainDoor: 'Premium Teak' } });
      const rNormal = runCalculator({ ...baseInput, doors: { ...baseInput.doors, mainDoor: 'Normal Teak' } });

      expect(rTeak.quantities.mainDoorsCount).toBe(rNormal.quantities.mainDoorsCount);
      expect(rTeak.budget.totalProjectCost).not.toBe(rNormal.budget.totalProjectCost);
      expect(rTeak.budget.totalProjectCost).toBeGreaterThan(rNormal.budget.totalProjectCost);
    });

    it('TEST 10: Paint brand / grade keeps paint area invariant, changes rate and amount', () => {
      const rRoyale = runCalculator({ ...baseInput, painting: { ...baseInput.painting, internalPaint: 'Royale Luxury Emulsion', brand: 'Asian Paints' } });
      const rTractor = runCalculator({ ...baseInput, painting: { ...baseInput.painting, internalPaint: 'Tractor Emulsion', brand: 'Berger Paints' } });

      expect(rRoyale.quantities.interiorPaintAreaSqFt).toBe(rTractor.quantities.interiorPaintAreaSqFt);
      expect(rRoyale.budget.totalProjectCost).not.toBe(rTractor.budget.totalProjectCost);
      expect(rRoyale.budget.totalProjectCost).toBeGreaterThan(rTractor.budget.totalProjectCost);
    });
  });
});
