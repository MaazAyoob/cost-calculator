import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONSTRUCTION_PACKAGES,
  getPackageConfig,
  normalizePackageId,
  createEngineInputForPackage,
  computeMultiPackageComparison,
  generateHuttyRecommendation,
  getCustomizationDiff,
} from '../data/packageConfig';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { useWizardStore, getFreshZeroState } from '../../store/useWizardStore';

const sampleProjectInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 30,
  plotWidth: 40,
  roadWidthFt: 30,
  builtUpAreaPerFloor: 720,
  floors: 2,
  houseType: 'Duplex',
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 2,
  evCharging: false,
  liftRequired: false,
  rooms: {
    bedrooms: 3,
    bathrooms: 3,
    kitchen: 1,
    dining: 1,
    living: 1,
    balcony: 2,
    commonToilets: 1,
    office: 0,
    pooja: 1,
    utility: 1,
    storeRoom: 1,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    masonry: 'Birla Aerocon AAC Blocks',
    doors: 'Premium Teak',
    windows: 'uPVC',
    flooring: 'Granite Slab',
    bathroom: 'Premium (Jaquar / Kohler / Grohe)',
    electrical: 'Mid-range (V-Guard)',
    paint: 'Premium Emulsion',
  },
  flooringZones: {
    living: 'Granite Slab',
    kitchenDining: 'Matte Anti-Skid Vitrified',
    bedrooms: 'Wooden Laminate',
    bathrooms: 'Matte Finish Vitrified',
    parkingUtility: 'Flamed Granite',
    balconies: 'Wooden Finish Tiles',
  },
  wallCladding: {
    kitchenDadoHeight: '4 ft',
    bathroomTileHeight: 'Full Height (Ceiling)',
  },
  doors: {
    mainDoor: 'Premium Teak',
    internalDoor: 'Flush Door',
    bathroomDoor: 'FRP / WPC Laminated',
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

describe('Hutty 3-Package Construction Standards System', () => {
  beforeEach(() => {
    useWizardStore.setState(getFreshZeroState());
  });

  it('1. Loads package configurations correctly with distinct specification baselines', () => {
    const standard = getPackageConfig('STANDARD');
    const premium = getPackageConfig('PREMIUM');
    const luxury = getPackageConfig('LUXURY');

    expect(standard.id).toBe('STANDARD');
    expect(standard.title).toBe('Standard');
    expect(standard.specs.steel).toBe('Indus TMT');
    expect(standard.specs.cement).toBe('Dalmia Bharat');
    expect(standard.specs.windows.primaryMaterial).toBe('Aluminium');

    expect(premium.id).toBe('PREMIUM');
    expect(premium.title).toBe('Premium');
    expect(premium.badge).toBe('RECOMMENDED');
    expect(premium.specs.steel).toBe('Tata Tiscon');
    expect(premium.specs.cement).toBe('UltraTech');
    expect(premium.specs.windows.primaryMaterial).toBe('uPVC');

    expect(luxury.id).toBe('LUXURY');
    expect(luxury.title).toBe('Luxury');
    expect(luxury.specs.steel).toBe('Tata Tiscon');
    expect(luxury.specs.flooring.living).toBe('Italian Marble');
    expect(luxury.specs.windows.primaryMaterial).toBe('Wood');
  });

  it('2. Standard, Premium, and Luxury packages can be selected in wizard store', () => {
    const { setSelectedPackage } = useWizardStore.getState();

    // Select Standard
    setSelectedPackage('STANDARD', true);
    let state = useWizardStore.getState();
    expect(state.selectedPackage).toBe('STANDARD');
    expect(state.specificationTier).toBe('standard');
    expect(state.qualityTier).toBe('Essential');
    expect(state.materialBrands.steel).toBe('Indus TMT');

    // Select Luxury
    setSelectedPackage('LUXURY', true);
    state = useWizardStore.getState();
    expect(state.selectedPackage).toBe('LUXURY');
    expect(state.specificationTier).toBe('luxury');
    expect(state.qualityTier).toBe('Luxury');
    expect(state.flooringZones.living).toBe('Italian Marble');

    // Select Premium
    setSelectedPackage('PREMIUM', true);
    state = useWizardStore.getState();
    expect(state.selectedPackage).toBe('PREMIUM');
    expect(state.specificationTier).toBe('premium');
    expect(state.qualityTier).toBe('Premium');
    expect(state.windows.primaryMaterial).toBe('uPVC');
  });

  it('3. Selected package persists through step navigation', () => {
    const store = useWizardStore.getState();
    store.setSelectedPackage('LUXURY', true);
    store.setStep(1);
    store.setCity('Bangalore');
    store.setPlotDimensions(30, 40);
    store.nextStep(); // Step 2

    const currentState = useWizardStore.getState();
    expect(currentState.currentStep).toBe(2);
    expect(currentState.selectedPackage).toBe('LUXURY');
    expect(currentState.qualityTier).toBe('Luxury');
  });

  it('4. Structural quantities remain 100% invariant across packages for identical geometry', () => {
    const standardInput = createEngineInputForPackage(sampleProjectInput, 'STANDARD');
    const premiumInput = createEngineInputForPackage(sampleProjectInput, 'PREMIUM');
    const luxuryInput = createEngineInputForPackage(sampleProjectInput, 'LUXURY');

    const standardRes = runCalculator(standardInput);
    const premiumRes = runCalculator(premiumInput);
    const luxuryRes = runCalculator(luxuryInput);

    // Physical structural quantities MUST BE IDENTICAL
    expect(standardRes.quantities.steelTonnes).toBe(premiumRes.quantities.steelTonnes);
    expect(premiumRes.quantities.steelTonnes).toBe(luxuryRes.quantities.steelTonnes);

    expect(standardRes.quantities.cementBags).toBe(premiumRes.quantities.cementBags);
    expect(premiumRes.quantities.cementBags).toBe(luxuryRes.quantities.cementBags);

    expect(standardRes.quantities.netWallAreaSqFt).toBe(premiumRes.quantities.netWallAreaSqFt);
    expect(premiumRes.quantities.netWallAreaSqFt).toBe(luxuryRes.quantities.netWallAreaSqFt);

    expect(standardRes.quantities.totalDoorsCount).toBe(premiumRes.quantities.totalDoorsCount);
    expect(premiumRes.quantities.totalDoorsCount).toBe(luxuryRes.quantities.totalDoorsCount);

    expect(standardRes.quantities.windowsCount).toBe(premiumRes.quantities.windowsCount);
    expect(premiumRes.quantities.windowsCount).toBe(luxuryRes.quantities.windowsCount);
  });

  it('5. Cost scales deterministically based on verified material/fixture rates without cost multipliers', () => {
    const comparison = computeMultiPackageComparison(sampleProjectInput, 'PREMIUM');

    const standardCost = comparison.results.STANDARD.budget.totalProjectCost;
    const premiumCost = comparison.results.PREMIUM.budget.totalProjectCost;
    const luxuryCost = comparison.results.LUXURY.budget.totalProjectCost;

    // Rates must reflect real material specs
    expect(standardCost).toBeGreaterThan(0);
    expect(premiumCost).toBeGreaterThan(standardCost);
    expect(luxuryCost).toBeGreaterThan(premiumCost);

    // Verify rate per sq.ft is positive and properly ordered
    expect(comparison.results.STANDARD.budget.costPerSqFt).toBeLessThan(
      comparison.results.PREMIUM.budget.costPerSqFt
    );
    expect(comparison.results.PREMIUM.budget.costPerSqFt).toBeLessThan(
      comparison.results.LUXURY.budget.costPerSqFt
    );
  });

  it('6. Multi-package comparison does not mutate user input state', () => {
    const originalInput = JSON.parse(JSON.stringify(sampleProjectInput));
    const comparison = computeMultiPackageComparison(sampleProjectInput, 'PREMIUM');

    expect(sampleProjectInput).toEqual(originalInput);
    expect(comparison.currentPackageId).toBe('PREMIUM');
    expect(comparison.results.STANDARD).toBeDefined();
    expect(comparison.results.PREMIUM).toBeDefined();
    expect(comparison.results.LUXURY).toBeDefined();
  });

  it('7. Accurately tracks custom overrides relative to package baseline', () => {
    // Start with Premium package defaults
    const state = {
      materialBrands: {
        steel: 'Tata Tiscon',
        cement: 'UltraTech',
        masonry: 'Birla Aerocon AAC Blocks',
      },
      flooringZones: {
        living: 'Italian Marble', // CUSTOM: Luxury marble instead of Granite
        kitchenDining: 'Matte Anti-Skid Vitrified',
        bedrooms: 'Wooden Laminate',
        bathrooms: 'Matte Finish Vitrified',
        parkingUtility: 'Flamed Granite',
        balconies: 'Wooden Finish Tiles',
      },
      doors: {
        mainDoor: 'Burma Teak Custom Carved', // CUSTOM: Luxury main door
        internalDoor: 'Flush Door',
        bathroomDoor: 'FRP / WPC Laminated',
      },
      windows: {
        primaryMaterial: 'uPVC',
        subGrade: 'Standard uPVC',
      },
      electrical: {
        wireTier: 'Mid-range (V-Guard)',
      },
      bathroomFittings: {
        sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
      },
      painting: {
        internalPaint: 'Premium Emulsion',
        brand: 'Asian Paints',
      },
    };

    const diffs = getCustomizationDiff('PREMIUM', state);
    expect(diffs.length).toBe(2);
    expect(diffs.map((d) => d.label)).toContain('Living Flooring');
    expect(diffs.map((d) => d.label)).toContain('Main Door');
  });

  it('8. Recommendation engine provides balanced guidance without dogmatic claims', () => {
    const comparison = computeMultiPackageComparison(sampleProjectInput, 'PREMIUM');
    const rec = comparison.recommendation;

    expect(rec.recommendedPackageId).toBe('PREMIUM');
    expect(rec.title).toBe('Premium');
    expect(rec.description).toContain('Hutty');
    expect(rec.rationale).toContain('Based on your project requirements');
    expect(rec.rationale).not.toContain('guaranteed');
    expect(rec.rationale).not.toContain('engineer-approved');
  });

  it('9. Rental house types recommend Standard package for rental ROI', () => {
    const rentalInput: EngineInput = {
      ...sampleProjectInput,
      houseType: 'Rental Units',
    };
    const comparison = computeMultiPackageComparison(rentalInput, 'STANDARD');
    expect(comparison.recommendation.recommendedPackageId).toBe('STANDARD');
    expect(comparison.recommendation.rationale).toContain('rental');
  });

  it('10. Fresh zero state initializes on Step 0 with default Premium package and zeroed inputs', () => {
    const fresh = getFreshZeroState();
    expect(fresh.currentStep).toBe(0);
    expect(fresh.selectedPackage).toBe('PREMIUM');
    expect(fresh.plotLength).toBe(0);
    expect(fresh.plotWidth).toBe(0);
    expect(fresh.rooms.bedrooms).toBe(0);
    expect(fresh.hasStartedSelection).toBe(false);
  });
});
