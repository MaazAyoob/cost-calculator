import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { getMasonrySpecification } from '../data/masonrySpecifications';

const baseTestInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 40,
  plotWidth: 30,
  builtUpAreaPerFloor: 720,
  houseType: 'Duplex',
  floors: 2, // G+1 -> Total BUA = 1440 sqft
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 1,
  evCharging: false,
  liftRequired: false,
  rooms: {
    bedrooms: 3,
    bathrooms: 3,
    commonToilets: 0,
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
    masonry: 'AAC Blocks',
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

describe('Material Takeoff Completeness Verification Suite', () => {
  // ── 1. CEMENT ───────────────────────────────────────────────
  describe('A. Cement Takeoff & Brand Invariance', () => {
    it('calculates cement bags strictly using totalBUA * 0.40 bags/sqft', () => {
      const res = runCalculator(baseTestInput);
      const totalBUA = res.area.totalBUASqFt; // 1440 sqft
      const expectedBags = Math.round(totalBUA * 0.40); // 576 bags

      expect(res.quantities.cementBags).toBe(expectedBags);

      const cementScheduleItem = res.materialSchedule.find((m) => m.category === 'Cement');
      expect(cementScheduleItem).toBeDefined();
      expect(cementScheduleItem?.quantity).toBe(expectedBags);
      expect(cementScheduleItem?.unit).toContain('Bag');
    });

    it('cement brand selection changes unit rate and cost but leaves bag quantity invariant', () => {
      const rUltra = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, cement: 'UltraTech' },
      });
      const rACC = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, cement: 'ACC Cement' },
      });
      const rDalmia = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, cement: 'Dalmia Bharat' },
      });

      // Quantity Invariance
      expect(rUltra.quantities.cementBags).toBe(rACC.quantities.cementBags);
      expect(rACC.quantities.cementBags).toBe(rDalmia.quantities.cementBags);

      // Unit Rate & Cost Variance
      const itemUltra = rUltra.materialSchedule.find((m) => m.category === 'Cement')!;
      const itemDalmia = rDalmia.materialSchedule.find((m) => m.category === 'Cement')!;

      expect(itemUltra.unitRate).toBe(420);
      expect(itemDalmia.unitRate).toBe(375);
      expect(itemUltra.amount).toBe(rUltra.quantities.cementBags * 420);
      expect(itemDalmia.amount).toBe(rDalmia.quantities.cementBags * 375);
      expect(itemUltra.amount).toBeGreaterThan(itemDalmia.amount);
    });
  });

  // ── 2. AAC BLOCKS ───────────────────────────────────────────
  describe('B. AAC Blocks Geometry & Formula Verification', () => {
    it('calculates AAC blocks from canonical SpaceModel net wall area and block volume with 5% wastage', () => {
      const res = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, masonry: 'AAC Blocks' },
      });

      const netWallArea = res.quantities.netWallAreaSqFt;
      expect(netWallArea).toBeGreaterThan(0);

      const aacSpec = getMasonrySpecification('AAC Blocks');
      expect(aacSpec.unitVolumeCuM).toBe(0.018); // 600×200×150mm
      expect(aacSpec.wastagePercentage).toBe(5);

      const SQFT_TO_SQM = 0.092903;
      const expectedExtVol = (res.buildingModel.netExternalWallAreaSqFt * SQFT_TO_SQM) * aacSpec.externalWallThicknessM;
      const expectedIntVol = (res.buildingModel.netInternalWallAreaSqFt * SQFT_TO_SQM) * aacSpec.internalWallThicknessM;
      const expectedTotalVol = expectedExtVol + expectedIntVol;
      const expectedBlockCount = Math.ceil((expectedTotalVol / aacSpec.unitVolumeCuM) * 1.05);

      expect(res.quantities.masonryUnitsCount).toBe(expectedBlockCount);
      expect(res.quantities.aacBlocksPieces).toBe(expectedBlockCount);

      const masonryItem = res.materialSchedule.find((m) => m.category === 'Masonry');
      expect(masonryItem).toBeDefined();
      expect(masonryItem?.material).toContain('AAC');
      expect(masonryItem?.quantity).toBe(expectedBlockCount);
      expect(masonryItem?.amount).toBe(expectedBlockCount * (masonryItem?.unitRate || 85));
    });
  });

  // ── 3. CLAY BRICKS ──────────────────────────────────────────
  describe('C. Clay Bricks Geometry & Formula Verification', () => {
    it('calculates Clay Bricks from masonry volume and modular brick volume with 7% wastage', () => {
      const res = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, masonry: 'Clay Bricks' },
      });

      const brickSpec = getMasonrySpecification('Clay Bricks');
      expect(brickSpec.unitVolumeCuM).toBe(0.001539); // 190×90×90mm
      expect(brickSpec.wastagePercentage).toBe(7);

      const SQFT_TO_SQM = 0.092903;
      const expectedExtVol = (res.buildingModel.netExternalWallAreaSqFt * SQFT_TO_SQM) * brickSpec.externalWallThicknessM;
      const expectedIntVol = (res.buildingModel.netInternalWallAreaSqFt * SQFT_TO_SQM) * brickSpec.internalWallThicknessM;
      const expectedTotalVol = expectedExtVol + expectedIntVol;
      const expectedBrickCount = Math.ceil((expectedTotalVol / brickSpec.unitVolumeCuM) * 1.07);

      expect(res.quantities.masonryUnitsCount).toBe(expectedBrickCount);
      expect(res.quantities.masonryMaterial).toBe('Clay Bricks');

      const masonryItem = res.materialSchedule.find((m) => m.category === 'Masonry');
      expect(masonryItem).toBeDefined();
      expect(masonryItem?.material).toContain('Clay');
      expect(masonryItem?.quantity).toBe(expectedBrickCount);
      expect(masonryItem?.amount).toBe(expectedBrickCount * (masonryItem?.unitRate || 12));

      // Ensure AAC block is NOT present when Clay Brick is selected
      const hasAAC = res.materialSchedule.some((m) => m.material.includes('AAC'));
      expect(hasAAC).toBe(false);
    });
  });

  // ── 4. CONCRETE BLOCKS ──────────────────────────────────────
  describe('D. Concrete Blocks Geometry & Formula Verification', () => {
    it('calculates Solid Concrete Blocks from masonry volume and block volume with 5% wastage', () => {
      const res = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, masonry: 'Concrete Blocks' },
      });

      const concSpec = getMasonrySpecification('Concrete Blocks');
      expect(concSpec.unitVolumeCuM).toBe(0.012); // 400×200×150mm
      expect(concSpec.wastagePercentage).toBe(5);

      const masonryItem = res.materialSchedule.find((m) => m.category === 'Masonry');
      expect(masonryItem).toBeDefined();
      expect(masonryItem?.material).toContain('Concrete');
      expect(masonryItem?.quantity).toBe(res.quantities.masonryUnitsCount);
      expect(masonryItem?.amount).toBe(res.quantities.masonryUnitsCount * (masonryItem?.unitRate || 52));
    });
  });

  // ── 5. MATERIAL SELECTION PRESERVES BUILDING GEOMETRY ───────
  describe('E. Material Selection Physical Invariance', () => {
    it('Changing AAC Blocks to Clay Bricks preserves plot, setbacks, BUA, room geometry, wall area, and openings', () => {
      const rAAC = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, masonry: 'AAC Blocks' },
      });
      const rClay = runCalculator({
        ...baseTestInput,
        materialBrands: { ...baseTestInput.materialBrands, masonry: 'Clay Bricks' },
      });

      expect(rAAC.area.plotAreaSqFt).toBe(rClay.area.plotAreaSqFt);
      expect(rAAC.area.totalBUASqFt).toBe(rClay.area.totalBUASqFt);
      expect(rAAC.area.buaPerFloorSqFt).toBe(rClay.area.buaPerFloorSqFt);
      expect(rAAC.buildingModel.grossExternalWallAreaSqFt).toBe(rClay.buildingModel.grossExternalWallAreaSqFt);
      expect(rAAC.buildingModel.grossInternalWallAreaSqFt).toBe(rClay.buildingModel.grossInternalWallAreaSqFt);
      expect(rAAC.quantities.netWallAreaSqFt).toBe(rClay.quantities.netWallAreaSqFt);
      expect(rAAC.quantities.doorOpeningAreaSqFt).toBe(rClay.quantities.doorOpeningAreaSqFt);
      expect(rAAC.quantities.totalDoorsCount).toBe(rClay.quantities.totalDoorsCount);
      expect(rAAC.quantities.windowsCount).toBe(rClay.quantities.windowsCount);
      expect(rAAC.quantities.steelTonnes).toBe(rClay.quantities.steelTonnes);
      expect(rAAC.quantities.cementBags).toBe(rClay.quantities.cementBags);
    });
  });

  // ── 6. SPACE DEPENDENCY PROPAGATION ─────────────────────────
  describe('F. Space Dependency Rules', () => {
    it('Adding 1 bedroom increases wall area, masonry quantity, doors, windows, flooring, paint, and electrical points', () => {
      const rBase = runCalculator(baseTestInput);
      const rPlusBed = runCalculator({
        ...baseTestInput,
        rooms: { ...baseTestInput.rooms, bedrooms: baseTestInput.rooms.bedrooms + 1 },
      });

      expect(rPlusBed.quantities.netWallAreaSqFt).toBeGreaterThan(rBase.quantities.netWallAreaSqFt);
      expect(rPlusBed.quantities.masonryUnitsCount).toBeGreaterThan(rBase.quantities.masonryUnitsCount);
      expect(rPlusBed.quantities.internalDoorsCount).toBe(rBase.quantities.internalDoorsCount + 1);
      expect(rPlusBed.quantities.windowsCount).toBeGreaterThan(rBase.quantities.windowsCount);
      expect(rPlusBed.quantities.floorTilesSqFt).toBeGreaterThan(rBase.quantities.floorTilesSqFt);
      expect(rPlusBed.quantities.totalPaintableAreaSqFt).toBeGreaterThan(rBase.quantities.totalPaintableAreaSqFt);
      expect(rPlusBed.quantities.lightingPoints).toBeGreaterThan(rBase.quantities.lightingPoints);
    });

    it('Adding 1 bathroom increases bathroom doors, sanitary fixtures, plumbing pipes, floor tiles, wall tiles, and waterproofing', () => {
      const rBase = runCalculator(baseTestInput);
      const rPlusBath = runCalculator({
        ...baseTestInput,
        rooms: { ...baseTestInput.rooms, bathrooms: baseTestInput.rooms.bathrooms + 1 },
      });

      expect(rPlusBath.quantities.bathroomDoorsCount).toBe(rBase.quantities.bathroomDoorsCount + 1);
      expect(rPlusBath.quantities.bathroomFixtureSets).toBe(rBase.quantities.bathroomFixtureSets + 1);
      expect(rPlusBath.quantities.cpvcSupplyMetres).toBeGreaterThan(rBase.quantities.cpvcSupplyMetres);
      expect(rPlusBath.quantities.swrDrainMetres).toBeGreaterThan(rBase.quantities.swrDrainMetres);
      expect(rPlusBath.quantities.wallTilesSqFt).toBeGreaterThan(rBase.quantities.wallTilesSqFt);
      expect(rPlusBath.quantities.waterproofingAreaSqFt).toBeGreaterThan(rBase.quantities.waterproofingAreaSqFt);
    });
  });

  // ── 7. ZERO STATE PURITY ────────────────────────────────────
  describe('G. Zero State Rigor', () => {
    it('Empty zero-start project yields strictly ₹0 cost and zero quantities', () => {
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

      expect(res.area.totalBUASqFt).toBe(0);
      expect(res.quantities.netWallAreaSqFt).toBe(0);
      expect(res.quantities.wallVolumeCuM).toBe(0);
      expect(res.quantities.masonryUnitsCount).toBe(0);
      expect(res.quantities.cementBags).toBe(0);
      expect(res.quantities.steelTonnes).toBe(0);
      expect(res.budget.totalProjectCost).toBe(0);
      expect(res.boq.length).toBe(0);
      expect(res.materialSchedule.length).toBe(0);
    });
  });

  // ── 8. MATHEMATICAL INVARIANTS ──────────────────────────────
  describe('H. Mathematical Invariants', () => {
    it('For every item in Material Schedule, Amount === Quantity * Unit Rate', () => {
      const res = runCalculator(baseTestInput);
      expect(res.materialSchedule.length).toBeGreaterThan(0);

      res.materialSchedule.forEach((item) => {
        const expected = Math.round(item.quantity * item.unitRate);
        expect(item.amount).toBe(expected);
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitRate).toBeGreaterThan(0);
      });
    });
  });
});
