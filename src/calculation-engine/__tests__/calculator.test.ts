import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const mockInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 60,
  plotWidth: 40,
  builtUpAreaPerFloor: 1440,
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
    doors: 'Premium Teak',
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

describe('Calculation Engine Core Invariants (Pilot Specification)', () => {
  // ── 1. Plot Area, Setbacks & Buildable Footprint ──
  it('GEOMETRY & SETBACKS: calculates plot area, setbacks, buildable footprint, and coverage percentage', () => {
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
    expect(resA.area.buildableFootprintSqFt).toBeGreaterThan(0);
  });

  // ── 2. Multi-Floor Ground Footprint Safety ──
  it('MULTI-FLOOR GROUND FOOTPRINT SAFETY: remaining ground area must be plotArea - buaPerFloor', () => {
    const resMulti = runCalculator({
      ...mockInput,
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 3,
    });
    expect(resMulti.area.plotAreaSqFt).toBe(1200);
    expect(resMulti.area.buaPerFloorSqFt).toBe(720);
    expect(resMulti.area.totalBUASqFt).toBe(2160);
    expect(resMulti.area.remainingGroundAreaSqFt).toBe(480);
    expect(resMulti.area.groundCoveragePercentage).toBe(60);
  });

  // ── 3. Exact Pilot Steel Formula: 2.8 + [0.2 × (Floors - 1)] kg/sqft ──
  it('STEEL FORMULA: calculates steel factor as 2.8 + 0.2*(floors - 1) kg/sqft', () => {
    // Ground floor (1 floor): Factor = 2.8 kg/sqft
    const resG = runCalculator({ ...mockInput, builtUpAreaPerFloor: 1000, floors: 1 });
    expect(resG.quantities.steelFactorKgPerSqFt).toBe(2.8);
    expect(resG.quantities.steelKg).toBe(2800);
    expect(resG.quantities.steelTonnes).toBe(2.8);

    // G+1 (2 floors, 2000 BUA): Factor = 2.8 + 0.2*(1) = 3.0 kg/sqft -> 6000 kg (6 Tonnes)
    const resG1 = runCalculator({ ...mockInput, builtUpAreaPerFloor: 1000, floors: 2 });
    expect(resG1.quantities.steelFactorKgPerSqFt).toBe(3.0);
    expect(resG1.quantities.steelKg).toBe(6000);
    expect(resG1.quantities.steelTonnes).toBe(6.0);

    // G+2 (3 floors, 3000 BUA): Factor = 2.8 + 0.2*(2) = 3.2 kg/sqft -> 9600 kg (9.6 Tonnes)
    const resG2 = runCalculator({ ...mockInput, builtUpAreaPerFloor: 1000, floors: 3 });
    expect(resG2.quantities.steelFactorKgPerSqFt).toBe(3.2);
    expect(resG2.quantities.steelKg).toBe(9600);
    expect(resG2.quantities.steelTonnes).toBe(9.6);
  });

  // ── 4. Direct Material Starting Rules (Cement 0.40, M-Sand 0.60, P-Sand 0.60, Agg 1.35) ──
  it('DIRECT MATERIAL THUMB RULES: Cement 0.40 bags/sqft, M-Sand 0.60, P-Sand 0.60, Agg 1.35', () => {
    const res = runCalculator({ ...mockInput, builtUpAreaPerFloor: 1000, floors: 2 });
    // Total BUA = 2000 sqft
    expect(res.quantities.cementBags).toBe(800); // 2000 * 0.40
    expect(res.quantities.mSandCuFt).toBe(1200); // 2000 * 0.60
    expect(res.quantities.pSandCuFt).toBe(1200); // 2000 * 0.60
    expect(res.quantities.sandCuFt).toBe(2400);  // 1200 + 1200
    expect(res.quantities.coarseAggregateCuFt).toBe(2700); // 2000 * 1.35
  });

  // ── 5. Space Model Masonry & Paint Geometry ──
  it('SPACE-DRIVEN WALL & PAINT GEOMETRY: derived from space perimeters and height without BUA x 3.5 multiplier', () => {
    const res = runCalculator(mockInput);
    expect(res.buildingModel.allSpaces.length).toBeGreaterThan(0);
    expect(res.quantities.netWallAreaSqFt).toBeGreaterThan(0);
    expect(res.quantities.totalPaintableAreaSqFt).toBe(
      res.quantities.interiorPaintAreaSqFt + res.quantities.exteriorPaintAreaSqFt
    );
    expect(res.quantities.interiorPaintAreaSqFt).toBe(
      res.quantities.internalWallAreaSqFt + res.quantities.ceilingAreaSqFt
    );
  });

  // ── 6. BOQ Line Item Correctness & Amount = Quantity x Rate ──
  it('BOQ UNIT SAFETY: Amount = Quantity × Unit Rate for all BOQ items', () => {
    const result = runCalculator(mockInput);
    expect(result.boq.length).toBeGreaterThanOrEqual(25);

    result.boq.forEach((item) => {
      const calculatedAmount = Math.round(item.quantity * item.unitRate);
      expect(item.amount).toBe(calculatedAmount);
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.unitRate).toBeGreaterThan(0);
    });

    const sumBOQ = result.boq.reduce((s, i) => s + i.amount, 0);
    expect(result.budget.baseConstructionCost).toBe(sumBOQ);
  });

  // ── 7. Dynamic BOQ Percentages ──
  it('DYNAMIC BOQ PERCENTAGES: every percentage dynamically derived from amount / total BOQ sum', () => {
    const result = runCalculator(mockInput);
    const totalSum = result.boq.reduce((sum, item) => sum + item.amount, 0);

    result.boq.forEach((item) => {
      const expectedPercentage = parseFloat(((item.amount / totalSum) * 100).toFixed(2));
      expect(item.percentage).toBe(expectedPercentage);
    });

    const sumPct = result.boq.reduce((sum, item) => sum + item.percentage, 0);
    expect(sumPct).toBeGreaterThan(99.0);
    expect(sumPct).toBeLessThan(101.0);
  });

  // ── 8. 4-Section Report Integrity (A, B, C, D) ──
  it('4-SECTION REPORT: Sections A, B, C, and D are fully populated', () => {
    const result = runCalculator(mockInput);
    expect(result.report.sectionA_WorksBOQ.length).toBeGreaterThan(0);
    expect(result.report.sectionB_MaterialSchedule.length).toBeGreaterThan(0);
    expect(result.report.sectionC_FixtureSchedule.length).toBeGreaterThan(0);
    expect(result.report.sectionD_CostSummary.totalProjectCost).toBeGreaterThan(0);

    // Section B must NOT contain a separate "Concrete" line item
    const hasConcreteMaterial = result.report.sectionB_MaterialSchedule.some(
      (m) => m.material.toLowerCase().includes('concrete') && !m.material.toLowerCase().includes('sand') && !m.material.toLowerCase().includes('aac')
    );
    expect(hasConcreteMaterial).toBe(false);
  });

  // ── 9. True Zero-Start Project ──
  it('TRUE ZERO-START: unconfigured project yields 0 BUA, ₹0 cost, 0 rate, empty BOQ', () => {
    const res = runCalculator(emptyZeroInput);
    expect(res.area.plotAreaSqFt).toBe(0);
    expect(res.area.buaPerFloorSqFt).toBe(0);
    expect(res.area.totalBUASqFt).toBe(0);
    expect(res.budget.totalProjectCost).toBe(0);
    expect(res.budget.costPerSqFt).toBe(0);
    expect(res.boq.length).toBe(0);
    expect(res.materialSchedule.length).toBe(0);
    expect(res.fixtureSchedule.length).toBe(0);
  });

  // ── 10. Effective Rate Derivation ──
  it('EFFECTIVE RATE: costPerSqFt = totalProjectCost / totalBUASqFt', () => {
    const res = runCalculator(mockInput);
    expect(res.budget.costPerSqFt).toBe(Math.round(res.budget.totalProjectCost / res.area.totalBUASqFt));
  });
});
