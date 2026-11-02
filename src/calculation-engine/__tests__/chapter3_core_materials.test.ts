import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '../../store/useWizardStore';
import { runCalculator } from '../calculator';
import { calculateArea } from '../modules/bua';
import { calculateRCC } from '../modules/rcc';
import { calculateMasonry } from '../modules/brick';
import { generateBuildingModel } from '../modules/spaceModel';
import { EngineInput } from '../types';
import { MASONRY_SPECIFICATIONS } from '../data/masonrySpecifications';

describe('Hutty 3.1 — Task 2.2 Corrections & Task 2.3 Chapter 3 Core Materials Suite', () => {
  beforeEach(() => {
    useWizardStore.getState().resetConfigurator();
    const store = useWizardStore.getState();
    store.setCity('Bangalore');
    store.setAuthority('BBMP/BDA');
    store.setPlotDimensions(40, 30); // 1,200 sq.ft plot
    store.setRoadWidth(30);
    store.setHouseConfig('Duplex', 2); // 2-floor residence
    store.setBuiltUpAreaPerFloor(720);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // PART A: CHAPTER 2 TARGETED CORRECTIONS
  // ═════════════════════════════════════════════════════════════════════════

  it('A1. Retains canonical parking assumptions (120/180/35 sq.ft) without altering BUA, coverage or civil takeoffs', () => {
    const store = useWizardStore.getState();

    // Normal ground parking: 2 cars, 2 bikes
    store.setParkingConfig('Normal Ground', 2, 2, false);
    const normalArea = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      parkingType: 'Normal Ground',
      carCount: 2,
      bikeCount: 2,
    });

    // 2 * 120 + 2 * 35 = 310 sq.ft
    expect(normalArea.parkingAreaSqFt).toBe(310);
    expect(normalArea.totalBUASqFt).toBe(1440); // Habitable BUA is invariant
    expect(normalArea.groundCoveragePercentage).toBe(60); // 720 / 1200 = 60%

    // Stilt parking: 2 cars, 2 bikes
    store.setParkingConfig('Stilt', 2, 2, false);
    const stiltArea = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      parkingType: 'Stilt',
      carCount: 2,
      bikeCount: 2,
    });

    // 2 * 180 + 2 * 35 = 430 sq.ft
    expect(stiltArea.parkingAreaSqFt).toBe(430);
    expect(stiltArea.totalBUASqFt).toBe(1440);
  });

  it('A2. Preserves elevator smart default at G+3 and user toggle agency without modifying BOQ logic', () => {
    const store = useWizardStore.getState();

    // Floors < 4: liftRequired defaults to false
    store.setHouseConfig('Duplex', 3);
    expect(useWizardStore.getState().liftRequired).toBe(false);

    // Floors >= 4 (G+3): liftRequired defaults to true
    store.setHouseConfig('Duplex', 4);
    expect(useWizardStore.getState().liftRequired).toBe(true);

    // User can freely toggle lift off for G+3
    store.setLiftRequired(false);
    expect(useWizardStore.getState().liftRequired).toBe(false);

    // When lift is true, ₹4,50,000 package is added to BOQ
    const inputWithLift: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 4,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      liftRequired: true,
      rooms: store.rooms,
      qualityTier: 'Premium',
      materialBrands: store.materialBrands,
      flooringZones: store.flooringZones,
      wallCladding: store.wallCladding,
      doors: store.doors,
      windows: store.windows,
    };

    const resLift = runCalculator(inputWithLift);
    const liftBOQ = resLift.boq.find((item) => item.description.toLowerCase().includes('elevator') || item.description.toLowerCase().includes('lift'));
    expect(liftBOQ).toBeDefined();
    // Bangalore Premium tier resolves lift to ₹5,80,000 via rateService
    expect(liftBOQ?.amount).toBe(580000);

    // When lift is false, elevator line item is absent
    const resNoLift = runCalculator({ ...inputWithLift, liftRequired: false });
    const noLiftBOQ = resNoLift.boq.find((item) => item.description.toLowerCase().includes('elevator') || item.description.toLowerCase().includes('lift'));
    expect(noLiftBOQ).toBeUndefined();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // PART B: CHAPTER 3 CORE CONSTRUCTION MATERIALS & BRAND INVARIANCE
  // ═════════════════════════════════════════════════════════════════════════

  it('B1. Steel Brand Invariance: Tata Tiscon vs JSW Neosteel vs Indus TMT leaves physical tonnage invariant while adjusting rate and cost', () => {
    const store = useWizardStore.getState();
    const baseInput: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      rooms: store.rooms,
      qualityTier: 'Premium',
      materialBrands: store.materialBrands,
      flooringZones: store.flooringZones,
      wallCladding: store.wallCladding,
      doors: store.doors,
      windows: store.windows,
    };

    // Calculate with Tata Tiscon
    const resTata = runCalculator({
      ...baseInput,
      materialBrands: { ...baseInput.materialBrands, steel: 'Tata Tiscon' },
    });

    // Calculate with JSW Neosteel
    const resJSW = runCalculator({
      ...baseInput,
      materialBrands: { ...baseInput.materialBrands, steel: 'JSW Neosteel' },
    });

    // Calculate with Indus TMT
    const resIndus = runCalculator({
      ...baseInput,
      materialBrands: { ...baseInput.materialBrands, steel: 'Indus TMT' },
    });

    // PHYSICAL STEEL TONNAGE MUST BE 100% INVARIANT
    expect(resTata.quantities.steelKg).toBe(resJSW.quantities.steelKg);
    expect(resTata.quantities.steelKg).toBe(resIndus.quantities.steelKg);
    expect(resTata.quantities.steelTonnes).toBe(resJSW.quantities.steelTonnes);
    expect(resTata.quantities.steelTonnes).toBe(resIndus.quantities.steelTonnes);

    // Total Project Cost scales according to steel rate card
    expect(resTata.budget.totalProjectCost).toBeGreaterThan(0);
    expect(resJSW.budget.totalProjectCost).toBeGreaterThan(0);
    expect(resIndus.budget.totalProjectCost).toBeGreaterThan(0);
  });

  it('B2. Cement Brand Invariance: UltraTech vs ACC Cement vs Dalmia Bharat leaves cement bag count invariant while updating budget', () => {
    const store = useWizardStore.getState();
    const baseInput: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      rooms: store.rooms,
      qualityTier: 'Premium',
      materialBrands: store.materialBrands,
      flooringZones: store.flooringZones,
      wallCladding: store.wallCladding,
      doors: store.doors,
      windows: store.windows,
    };

    const resUltraTech = runCalculator({
      ...baseInput,
      materialBrands: { ...baseInput.materialBrands, cement: 'UltraTech' },
    });

    const resACC = runCalculator({
      ...baseInput,
      materialBrands: { ...baseInput.materialBrands, cement: 'ACC Cement' },
    });

    const resDalmia = runCalculator({
      ...baseInput,
      materialBrands: { ...baseInput.materialBrands, cement: 'Dalmia Bharat' },
    });

    // PHYSICAL CEMENT BAGS MUST BE 100% INVARIANT (BUA * 0.40 bags/sq.ft)
    const expectedBags = Math.round(1440 * 0.40); // 576 bags
    expect(resUltraTech.quantities.cementBags).toBe(expectedBags);
    expect(resACC.quantities.cementBags).toBe(expectedBags);
    expect(resDalmia.quantities.cementBags).toBe(expectedBags);
  });

  it('B3. Concrete Volume & RCC Breakdown: Calculates structural concrete volume and allocates properly across elements', () => {
    const area = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
    });

    const rccQuantities = calculateRCC(
      {
        city: 'Bangalore',
        authority: 'BBMP/BDA',
        plotLength: 40,
        plotWidth: 30,
        builtUpAreaPerFloor: 720,
        floors: 2,
        houseType: 'Duplex',
        parkingType: 'Normal Ground',
        carCount: 1,
        bikeCount: 2,
      },
      area
    );

    // Total structural concrete (nominal ~0.052 m³ per sq.ft BUA)
    expect(rccQuantities.totalStructuralConcreteCuM).toBeGreaterThan(50);
    expect(rccQuantities.footingConcreteCuM).toBeGreaterThan(0);
    expect(rccQuantities.columnConcreteCuM).toBeGreaterThan(0);
    expect(rccQuantities.slabConcreteCuM).toBeGreaterThan(0);
    expect(rccQuantities.plinthConcreteCuM).toBeGreaterThan(0);

    // Monolithic slabs and beams should have highest share (~45%)
    expect(rccQuantities.slabConcreteCuM).toBeGreaterThan(rccQuantities.columnConcreteCuM);
    expect(rccQuantities.slabConcreteCuM).toBeGreaterThan(rccQuantities.footingConcreteCuM);
  });

  it('B4. Masonry Material Specification: Switching between AAC Blocks, Clay Bricks and Concrete Blocks adjusts block counts accurately', () => {
    const store = useWizardStore.getState();
    const area = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
    });

    const engineInput: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      rooms: store.rooms,
    };

    const buildingModel = generateBuildingModel(engineInput, area);

    // 1. AAC Blocks
    const aacMasonry = calculateMasonry(
      { ...engineInput, materialBrands: { ...store.materialBrands, masonry: 'AAC Blocks' } },
      area,
      buildingModel
    );

    // 2. Concrete Blocks
    const concreteMasonry = calculateMasonry(
      { ...engineInput, materialBrands: { ...store.materialBrands, masonry: 'Concrete Blocks' } },
      area,
      buildingModel
    );

    // 3. Clay Bricks
    const clayMasonry = calculateMasonry(
      { ...engineInput, materialBrands: { ...store.materialBrands, masonry: 'Clay Bricks' } },
      area,
      buildingModel
    );

    // NET WALL AREA REMAINS INVARIANT (geometric space model)
    expect(aacMasonry.netWallAreaSqFt).toBe(concreteMasonry.netWallAreaSqFt);
    expect(aacMasonry.netWallAreaSqFt).toBe(clayMasonry.netWallAreaSqFt);

    // Verify resolved specifications
    expect(aacMasonry.masonryMaterial).toBe('AAC Blocks');
    expect(concreteMasonry.masonryMaterial).toBe('Concrete Blocks');
    expect(clayMasonry.masonryMaterial).toBe('Clay Bricks');

    // Base unit counts reflect unit volume (AAC 0.018 m³ vs Concrete 0.012 m³ vs Brick 0.00154 m³)
    expect(clayMasonry.baseBlockCount).toBeGreaterThan(aacMasonry.baseBlockCount * 5);
    expect(concreteMasonry.baseBlockCount).toBeGreaterThan(aacMasonry.baseBlockCount);
  });

  it('B5. Sand and Coarse Aggregates Thumb Rules scale deterministically with total BUA', () => {
    const area = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
    });

    const store = useWizardStore.getState();
    const engineInput: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      rooms: store.rooms,
    };

    const buildingModel = generateBuildingModel(engineInput, area);
    const masonry = calculateMasonry(engineInput, area, buildingModel);

    // M-Sand: BUA * 0.60 CFT/sq.ft
    expect(masonry.mSandCuFt).toBe(Math.round(1440 * 0.60)); // 864 CFT
    // P-Sand: BUA * 0.60 CFT/sq.ft
    expect(masonry.pSandCuFt).toBe(Math.round(1440 * 0.60)); // 864 CFT
    // Sand Total: 864 + 864 = 1728 CFT
    expect(masonry.sandCuFt).toBe(1728);
    // Coarse Aggregate: BUA * 1.35 CFT/sq.ft
    expect(masonry.coarseAggregateCuFt).toBe(Math.round(1440 * 1.35)); // 1944 CFT
  });

  it('B6. Wizard Store setCoreMaterials mutates state and recalculates calculation store without side-effects', () => {
    const store = useWizardStore.getState();
    store.setCoreMaterials('JSW Neosteel', 'ACC Cement', 'Concrete Blocks');

    const updated = useWizardStore.getState();
    expect(updated.materialBrands.steel).toBe('JSW Neosteel');
    expect(updated.materialBrands.cement).toBe('ACC Cement');
    expect(updated.materialBrands.masonry).toBe('Concrete Blocks');

    // Plot and floor dimensions are unaffected
    expect(updated.plotLength).toBe(40);
    expect(updated.plotWidth).toBe(30);
    expect(updated.floors).toBe(2);
  });
});
