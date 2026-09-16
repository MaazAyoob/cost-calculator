import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rateService } from '../data/rateService';
import { runCalculator } from '../calculator';
import { createEngineInputForPackage } from '../data/packageConfig';

describe('REGRESSION TEST: Admin Price Override -> Calculator Price Propagation', () => {
  const fullBaseInput: any = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30,
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
      externalPaint: 'Weather Proof Emulsion',
      brand: 'Asian Paints',
    },
  };

  const sampleInput = createEngineInputForPackage(fullBaseInput, 'PREMIUM');

  beforeEach(() => {
    rateService.resetToDefaults();
  });

  afterEach(() => {
    rateService.resetToDefaults();
  });

  it('1. MUST propagate admin price override directly into calculateBudget and final BOQ amount', () => {
    // Baseline calculation
    const initialResult = runCalculator(sampleInput);
    const winBOQInitial = initialResult.boq.filter((b) => b.category === 'Windows & Glazing' && !b.description.includes('Grille'));
    const totalWinQty = winBOQInitial.reduce((acc, b) => acc + b.quantity, 0);
    const initialTotalCost = initialResult.budget.totalProjectCost;

    expect(totalWinQty).toBeGreaterThan(0);

    // Apply Admin Override to windows.upvc_slider (test value ₹7,000/sq.ft)
    rateService.setOverride({
      id: 'ovr-test-regress',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      rate: 7000,
      overrideRate: 7000,
      packageTier: 'ALL',
      location: 'ALL',
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    // Recalculate
    const updatedResult = runCalculator(sampleInput);
    const winBOQUpdated = updatedResult.boq.filter((b) => b.category === 'Windows & Glazing' && !b.description.includes('Grille'));
    const updatedWinAmt = winBOQUpdated.reduce((acc, b) => acc + b.amount, 0);

    // The calculator must use the updated rate (₹7,000) and NOT the old baseline
    expect(winBOQUpdated[0].unitRate).toBe(7000);
    expect(updatedWinAmt).toBe(totalWinQty * 7000);
    expect(updatedResult.budget.totalProjectCost).toBeGreaterThan(initialTotalCost);
  });

  it('2. Controlled test: ₹1 vs ₹10,000 strictly scales cost without altering physical quantities', () => {
    // Test at ₹1
    rateService.setOverride({
      id: 'ovr-1',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      rate: 1,
      overrideRate: 1,
      packageTier: 'ALL',
      location: 'ALL',
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    const res1 = runCalculator(sampleInput);
    const winBOQ1 = res1.boq.filter((b) => b.category === 'Windows & Glazing' && !b.description.includes('Grille'));
    const qty1 = winBOQ1.reduce((acc, b) => acc + b.quantity, 0);
    const amt1 = winBOQ1.reduce((acc, b) => acc + b.amount, 0);

    expect(winBOQ1[0].unitRate).toBe(1);
    expect(amt1).toBe(qty1 * 1);

    // Test at ₹10,000
    rateService.setOverride({
      id: 'ovr-10k',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      rate: 10000,
      overrideRate: 10000,
      packageTier: 'ALL',
      location: 'ALL',
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    const res10k = runCalculator(sampleInput);
    const winBOQ10k = res10k.boq.filter((b) => b.category === 'Windows & Glazing' && !b.description.includes('Grille'));
    const qty10k = winBOQ10k.reduce((acc, b) => acc + b.quantity, 0);
    const amt10k = winBOQ10k.reduce((acc, b) => acc + b.amount, 0);

    expect(winBOQ10k[0].unitRate).toBe(10000);
    expect(amt10k).toBe(qty10k * 10000);

    // Invariance checks
    expect(qty10k).toBe(qty1);
    expect(res10k.area.totalBUASqFt).toBe(res1.area.totalBUASqFt);
    expect(res10k.quantities.steelTonnes).toBe(res1.quantities.steelTonnes);
    expect(res10k.quantities.cementBags).toBe(res1.quantities.cementBags);
    expect(res10k.quantities.aacBlocksPieces).toBe(res1.quantities.aacBlocksPieces);
  });

  it('3. Precedence test: Exact > Package > Location > Global > Baseline with city isolation', () => {
    // Global override = 6000
    rateService.setOverride({
      id: 'ovr-g',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      packageTier: 'ALL',
      location: 'ALL',
      rate: 6000,
      overrideRate: 6000,
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    // Location override for Bangalore = 7000
    rateService.setOverride({
      id: 'ovr-l',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      packageTier: 'ALL',
      location: 'Bangalore',
      rate: 7000,
      overrideRate: 7000,
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    // Package override for PREMIUM = 8000
    rateService.setOverride({
      id: 'ovr-p',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      packageTier: 'PREMIUM',
      location: 'ALL',
      rate: 8000,
      overrideRate: 8000,
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    // Exact override for Bangalore + PREMIUM = 9000
    rateService.setOverride({
      id: 'ovr-e',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      packageTier: 'PREMIUM',
      location: 'Bangalore',
      rate: 9000,
      overrideRate: 9000,
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    // 1. Exact match (Bangalore + PREMIUM) -> 9000
    expect(rateService.getEffectiveRate('windows.upvc_slider', { packageTier: 'PREMIUM', location: 'Bengaluru' })).toBe(9000);

    // 2. Package override (Mysore + PREMIUM) -> 8000 (Package beats Global)
    expect(rateService.getEffectiveRate('windows.upvc_slider', { packageTier: 'PREMIUM', location: 'Mysuru' })).toBe(8000);

    // 3. Location override (Bangalore + STANDARD) -> 7000 (Location beats Global)
    expect(rateService.getEffectiveRate('windows.upvc_slider', { packageTier: 'STANDARD', location: 'Bengaluru' })).toBe(7000);

    // 4. Global override (Mysore + STANDARD) -> 6000 (Bangalore override does NOT leak to Mysore)
    expect(rateService.getEffectiveRate('windows.upvc_slider', { packageTier: 'STANDARD', location: 'Mysuru' })).toBe(6000);
  });

  it('4. Canonical Aliasing: windows.upvc_slider, windows.standard_upvc, and windows.upvc_standard all resolve to the override', () => {
    rateService.setOverride({
      id: 'ovr-alias',
      rateId: 'windows.upvc_slider',
      category: 'Windows',
      unit: '₹/SqFt',
      packageTier: 'ALL',
      location: 'ALL',
      rate: 7500,
      overrideRate: 7500,
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    expect(rateService.getEffectiveRate('windows.upvc_slider')).toBe(7500);
    expect(rateService.getEffectiveRate('windows.standard_upvc')).toBe(7500);
    expect(rateService.getEffectiveRate('windows.upvc_standard')).toBe(7500);
  });
});
