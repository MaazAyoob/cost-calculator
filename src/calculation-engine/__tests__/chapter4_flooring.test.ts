import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput, BuildingModel } from '../types';
import { generateBuildingModel } from '../modules/spaceModel';
import { calculateFlooring } from '../modules/flooring';
import { calculateRCC } from '../modules/rcc';
import { calculateSteel } from '../modules/steel';
import { calculateCement } from '../modules/cement';
import { useWizardStore, SAMPLE_ROOM_CONFIG } from '../../store/useWizardStore';
import { useCalculationStore } from '../../store/useCalculationStore';

describe('Hutty 3.1 — Phase 02: Task 2.4 Dedicated Flooring & Chapter 3 Safeguards Suite', () => {
  const baseInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30, // 1,200 sq.ft plot
    roadWidthFt: 30,
    builtUpAreaPerFloor: 840,
    userSelectedBUA: 2800,
    frontSetback: 3.5,
    rearSetback: 3.0,
    leftSetback: 3.0,
    rightSetback: 3.0,
    roadFacingBoundaries: ['front'],
    isCornerPlot: false,
    roadWideningFt: 0,
    prescribedBuildingLineFt: 0,
    houseType: 'Duplex',
    floors: 3, // G+2 (3 floors)
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: false,
    liftRequired: false,
    rooms: { ...SAMPLE_ROOM_CONFIG }, // 3 bed, 3 bath, 1 living, 1 kitchen, 1 dining, 1 pooja, 2 balcony, 1 utility
    qualityTier: 'Premium',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'AAC Blocks',
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
      mainDoor: 'Normal Teak',
      internalDoor: 'Flush Door',
      bathroomDoor: 'WPC Door',
    },
    windows: {
      primaryMaterial: 'uPVC',
      subGrade: 'Multi-Chamber 3-Track Sliding with Mesh',
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC',
      wireTier: 'Mid-range (V-Guard)',
    },
    bathroomFittings: {
      sanitaryTier: 'Premium (Jaquar / Kohler)',
      cpvcBrand: 'Astral / Ashirvad CPVC Pro',
    },
    painting: {
      internalPaint: 'Asian Paints Apcolite Premium Emulsion',
      externalPaint: 'Apex WeatherProof Exterior Emulsion',
      brand: 'Asian Paints',
    },
    contractorMode: 'independent',
    contractorMarginRate: 0.10,
    applyContractorGST: false,
    estimateMode: 'quick',
    isCustomRooms: false,
  };

  beforeEach(() => {
    useWizardStore.getState().resetConfigurator();
  });

  // ── PART A: CHAPTER 3 CALCULATION SAFEGUARDS & QUANTITY TRANSPARENCY ──
  describe('Part A: Chapter 3 Quantity Sources & Calculation Safeguards', () => {
    it('A1. Steel: Derives strictly from canonical formula 2.8 + 0.2*(floors - 1) kg/sqft BUA', () => {
      const calcResult = runCalculator(baseInput);
      const steelResult = calculateSteel(baseInput, calcResult.area);

      // G+2 (3 floors): 2.8 + 0.2*(3 - 1) = 3.2 kg/sq.ft BUA
      expect(steelResult.steelFactorKgPerSqFt).toBeCloseTo(3.2, 1);
      const expectedKg = Math.round(calcResult.area.totalBUASqFt * 3.2);
      expect(steelResult.steelKg).toBe(expectedKg);
      expect(steelResult.steelTonnes).toBe(parseFloat((expectedKg / 1000).toFixed(2)));

      // For 4 floors (G+3): 2.8 + 0.2*3 = 3.4 kg/sq.ft BUA
      const g3Input: EngineInput = { ...baseInput, floors: 4 };
      const g3Area = runCalculator(g3Input).area;
      const g3Steel = calculateSteel(g3Input, g3Area);
      expect(g3Steel.steelFactorKgPerSqFt).toBeCloseTo(3.4, 1);
    });

    it('A2. Cement: Derives from configured starting thumb rule 0.40 bags/sq.ft BUA', () => {
      const calcResult = runCalculator(baseInput);
      const cementResult = calculateCement(baseInput, calcResult.area);
      const expectedBags = Math.round(calcResult.area.totalBUASqFt * 0.40);
      expect(cementResult.cementBags).toBe(expectedBags);
    });

    it('A3. Concrete: Canonical volume and element percentage allocations (22/18/52/8/6%)', () => {
      const calcResult = runCalculator(baseInput);
      const rcc = calculateRCC(baseInput, calcResult.area);

      // Baseline approximate concrete factor is 0.052 cu.m per sq.ft BUA
      const expectedApprox = parseFloat((calcResult.area.totalBUASqFt * 0.052).toFixed(1));
      expect(rcc.approxConcreteCuM).toBe(expectedApprox);

      // Component allocations in rcc.ts
      expect(rcc.footingConcreteCuM).toBe(parseFloat(Math.max(5.0, (expectedApprox * 22) / 100).toFixed(2)));
      expect(rcc.columnConcreteCuM).toBe(parseFloat(Math.max(3.0, (expectedApprox * 18) / 100).toFixed(2)));
      expect(rcc.slabConcreteCuM).toBe(parseFloat(Math.max(8.0, (expectedApprox * 52) / 100).toFixed(2)));
      expect(rcc.plinthConcreteCuM).toBe(parseFloat(Math.max(2.0, (expectedApprox * 8) / 100).toFixed(2)));
      expect(rcc.staircaseConcreteCuM).toBe(parseFloat(Math.max(1.0, (expectedApprox * 6) / 100).toFixed(2)));
    });

    it('A4. Core Material Brand Invariance: Switching brands alters rates without modifying physical quantities', () => {
      const resultTata = runCalculator({
        ...baseInput,
        materialBrands: { steel: 'Tata Tiscon', cement: 'UltraTech', masonry: 'AAC Blocks' },
      });
      const resultIndus = runCalculator({
        ...baseInput,
        materialBrands: { steel: 'Indus TMT', cement: 'Dalmia Bharat', masonry: 'AAC Blocks' },
      });

      // Quantities remain 100% mathematically invariant
      expect(resultTata.quantities.steelKg).toBe(resultIndus.quantities.steelKg);
      expect(resultTata.quantities.steelTonnes).toBe(resultIndus.quantities.steelTonnes);
      expect(resultTata.quantities.cementBags).toBe(resultIndus.quantities.cementBags);
      expect(resultTata.quantities.netWallAreaSqFt).toBe(resultIndus.quantities.netWallAreaSqFt);

      // Costs vary due to brand rate differentials
      expect(resultTata.budget.directConstructionBudget).toBeGreaterThan(resultIndus.budget.directConstructionBudget);
    });
  });

  // ── PART B: TASK 2.4 DEDICATED CHAPTER 4 FLOORING & TILES ──
  describe('Part B: Chapter 4 Flooring & Tiles by Space', () => {
    it('B1. Space-Wise Flooring Area: Generates geometric floor areas for all configured spaces', () => {
      const calcResult = runCalculator(baseInput);
      const model: BuildingModel = generateBuildingModel(baseInput, calcResult.area);

      expect(model.allSpaces.length).toBeGreaterThan(0);

      // Living space: 200 sq.ft (16x12.5 ft)
      const living = model.allSpaces.find((s) => s.type === 'living');
      expect(living).toBeDefined();
      expect(living?.flooringAreaSqFt).toBe(200);

      // Dining space: 120 sq.ft (12x10 ft)
      const dining = model.allSpaces.find((s) => s.type === 'dining');
      expect(dining).toBeDefined();
      expect(dining?.flooringAreaSqFt).toBe(120);

      // Combined living & dining = 320 sq.ft
      expect((living?.flooringAreaSqFt || 0) + (dining?.flooringAreaSqFt || 0)).toBe(320);

      // Standard bedrooms: 140 sq.ft each (14x10 ft)
      const bedrooms = model.allSpaces.filter((s) => s.type === 'bedrooms');
      expect(bedrooms.length).toBe(3);
      bedrooms.forEach((bed) => {
        expect(bed.flooringAreaSqFt).toBe(140);
      });

      // Standard bathrooms: 30 sq.ft each (6x5 ft)
      const bathrooms = model.allSpaces.filter((s) => s.type === 'bathrooms');
      expect(bathrooms.length).toBe(3);
      bathrooms.forEach((bath) => {
        expect(bath.flooringAreaSqFt).toBe(30);
      });
    });

    it('B2. Bathroom Floor vs Wall Dado Area Disparity: Mathematically proves wall dado != floor area', () => {
      const calcResult = runCalculator(baseInput);
      const model: BuildingModel = generateBuildingModel(baseInput, calcResult.area);
      const bath = model.allSpaces.find((s) => s.type === 'bathrooms');

      expect(bath).toBeDefined();
      // Floor area = 30 sq.ft (6x5 ft)
      expect(bath?.flooringAreaSqFt).toBe(30);

      // At 7ft lintel height:
      // Perimeter = 2 * (6 + 5) = 22 ft.
      // Gross wall dado = 22 * 7 = 154 sq.ft.
      // Door opening (2.5x7 = 17.5 sq.ft) + window opening (2x3 = 6 sq.ft) deductions.
      // Net Dado Area = 154 - (17.5 * (7/10)) - 6 = 154 - 12.25 - 6 = 135.75 -> ~136 sq.ft.
      expect(bath?.dadoTileAreaSqFt).toBeGreaterThan(120);
      expect(bath?.dadoTileAreaSqFt).toBeLessThan(150);
      expect(bath?.dadoTileAreaSqFt).not.toBe(bath?.flooringAreaSqFt);

      // Wall dado is ~4.5x greater than floor area!
      const ratio = (bath?.dadoTileAreaSqFt || 0) / (bath?.flooringAreaSqFt || 1);
      expect(ratio).toBeGreaterThan(4.0);
    });

    it('B3. Bathroom Full Height Dado: Switching from 7ft Lintel to 10ft Ceiling increases wall tile area', () => {
      const calcResult7ft = runCalculator(baseInput);
      const model7ft = generateBuildingModel(baseInput, calcResult7ft.area);
      const dado7ft = model7ft.allSpaces.find((s) => s.type === 'bathrooms')?.dadoTileAreaSqFt || 0;

      const fullHeightInput: EngineInput = {
        ...baseInput,
        wallCladding: {
          ...baseInput.wallCladding,
          bathroomTileHeight: 'Full Height (Ceiling)',
        },
      };
      const calcResult10ft = runCalculator(fullHeightInput);
      const model10ft = generateBuildingModel(fullHeightInput, calcResult10ft.area);
      const dado10ft = model10ft.allSpaces.find((s) => s.type === 'bathrooms')?.dadoTileAreaSqFt || 0;

      // 10ft ceiling dado must be significantly larger than 7ft lintel dado
      expect(dado10ft).toBeGreaterThan(dado7ft);
      // Floor area remains invariant
      expect(model10ft.allSpaces.find((s) => s.type === 'bathrooms')?.flooringAreaSqFt).toBe(
        model7ft.allSpaces.find((s) => s.type === 'bathrooms')?.flooringAreaSqFt
      );
    });

    it('B4. Tile Wastage & Skirting: Incorporates 7% cutting allowance and perimeter skirting', () => {
      const calcResult = runCalculator(baseInput);
      const model = generateBuildingModel(baseInput, calcResult.area);
      const flooring = calculateFlooring(baseInput, calcResult.area, model);

      // Raw space floor area sum
      const rawSpaceSum = model.allSpaces.reduce((sum, s) => sum + s.flooringAreaSqFt, 0);
      // Livable BUA includes 10% circulation
      const circulation = Math.round(calcResult.area.totalBUASqFt * 0.10);
      const netLivable = rawSpaceSum + circulation;

      // Floor tiles sqft includes 7-8% cutting and lapping buffer
      expect(flooring.floorTilesSqFt).toBeGreaterThanOrEqual(Math.round(netLivable * 1.07));

      // Staircase flights = floors - 1 = 3 - 1 = 2 flights * 180 sq.ft = 360 sq.ft granite slabs
      expect(flooring.graniteSlabsSqFt).toBe(2 * 180);
    });

    it('B5. Wizard Store: Space-wise flooring selection and "Apply to All Similar Spaces"', () => {
      const store = useWizardStore.getState();

      // Configure individual space flooring override
      store.setSpaceFlooring('space_bedrooms_1', 'Italian Marble', 'bedrooms');
      expect(useWizardStore.getState().spaceFlooringOverrides['space_bedrooms_1']).toBe('Italian Marble');
      expect(useWizardStore.getState().flooringZones.bedrooms).toBe('Italian Marble');

      // Apply to all bedrooms
      store.applyFlooringToSimilarSpaces('bed', 'Wooden Laminate');
      expect(useWizardStore.getState().flooringZones.bedrooms).toBe('Wooden Laminate');
      expect(useWizardStore.getState().spaceFlooringOverrides['space_bedrooms_1']).toBe('Wooden Laminate');

      // Clear individual override
      store.clearSpaceFlooringOverride('space_bedrooms_1');
      expect(useWizardStore.getState().spaceFlooringOverrides['space_bedrooms_1']).toBeUndefined();
    });

    it('B6. Wizard Store: Bathroom Dado Selection & "Apply to All Bathrooms"', () => {
      const store = useWizardStore.getState();

      // Override individual bathroom dado
      store.setSpaceDado('space_bathrooms_2', 'Full Height (Ceiling)', 'Large Format Vitrified Wall');
      expect(useWizardStore.getState().spaceDadoOverrides['space_bathrooms_2']?.height).toBe('Full Height (Ceiling)');
      expect(useWizardStore.getState().spaceDadoOverrides['space_bathrooms_2']?.tile).toBe('Large Format Vitrified Wall');
      expect(useWizardStore.getState().wallCladding.bathroomTileHeight).toBe('Full Height (Ceiling)');

      // Standardize all bathrooms to 7ft Lintel
      store.applyDadoToAllBathrooms('7 ft (Lintel)');
      expect(useWizardStore.getState().wallCladding.bathroomTileHeight).toBe('7 ft (Lintel)');
      expect(useWizardStore.getState().spaceDadoOverrides['space_bathrooms_2']?.height).toBe('7 ft (Lintel)');
    });

    it('B7. Room Additions & Removals: Prunes orphaned overrides when room counts change in Chapter 2', () => {
      const store = useWizardStore.getState();

      // Set overrides for 3 bedrooms
      store.setSpaceFlooring('space_bedrooms_1', 'Italian Marble', 'bedrooms');
      store.setSpaceFlooring('space_bedrooms_2', 'Wooden Laminate', 'bedrooms');
      store.setSpaceFlooring('space_bedrooms_3', 'GVT Tiles (1200x600)', 'bedrooms');

      expect(Object.keys(useWizardStore.getState().spaceFlooringOverrides).length).toBe(3);

      // User reduces bedrooms to 2 in Chapter 2 (active spaces are only 1 and 2)
      store.pruneOrphanedSpaceOverrides(['space_bedrooms_1', 'space_bedrooms_2']);

      const remaining = useWizardStore.getState().spaceFlooringOverrides;
      expect(remaining['space_bedrooms_1']).toBe('Italian Marble');
      expect(remaining['space_bedrooms_2']).toBe('Wooden Laminate');
      expect(remaining['space_bedrooms_3']).toBeUndefined();
    });

    it('B8. Cost and BOQ Reconciliation: Changing flooring material updates BOQ line item amounts dynamically', () => {
      const vitrifiedResult = runCalculator({
        ...baseInput,
        flooringZones: { ...baseInput.flooringZones, living: 'Vitrified Tiles 800x800mm' },
      });
      const marbleResult = runCalculator({
        ...baseInput,
        flooringZones: { ...baseInput.flooringZones, living: 'Italian Marble' },
      });

      // Find living room flooring BOQ items
      const vitrifiedItem = vitrifiedResult.boq.find((item) => item.description.includes('Living Room Flooring'));
      const marbleItem = marbleResult.boq.find((item) => item.description.includes('Living Room Flooring'));

      expect(vitrifiedItem).toBeDefined();
      expect(marbleItem).toBeDefined();

      // Quantities remain identical (Q_i invariance)
      expect(vitrifiedItem?.quantity).toBe(marbleItem?.quantity);

      // Rates and amounts differ (Italian Marble rate ~420 vs Vitrified ~120)
      expect(marbleItem?.unitRate).toBeGreaterThan(vitrifiedItem?.unitRate || 0);
      expect(marbleItem?.amount).toBeGreaterThan(vitrifiedItem?.amount || 0);

      // Total direct budget reflects the difference
      expect(marbleResult.budget.directConstructionBudget).toBeGreaterThan(vitrifiedResult.budget.directConstructionBudget);
    });
  });
});
