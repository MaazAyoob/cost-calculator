import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { calculateArea } from '../modules/bua';
import { getAuthorityRules, evaluateAuthorityLimits } from '../data/authorityRules';
import { EngineInput } from '../types';

describe('Authority-Based BUA & Setback Engine Suite', () => {
  const baseInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30,
    roadWidthFt: 30,
    houseType: 'Duplex',
    floors: 2,
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 1,
    evCharging: false,
    liftRequired: false,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      living: 1,
      kitchen: 1,
      dining: 1,
      balcony: 1,
      commonToilets: 1,
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
      electrical: 'Finolex',
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

  it('1. Correctly calculates Bengaluru (BBMP/BDA) setbacks and limits for 30x40', () => {
    const area = calculateArea(baseInput);
    expect(area.plotAreaSqFt).toBe(1200);
    expect(area.authorityMetadata.authority).toBe('BBMP/BDA');
    expect(area.authorityMetadata.city).toBe('Bengaluru');
    expect(area.authorityMetadata.ruleId).toBe('BLR-BDA-RMP2015-RES-V2.4');

    // 30x40 (1200 sqft / 111.5 sqm) setback slab in BDA
    expect(area.statutorySetbacks.frontSetbackFt).toBeCloseTo(3.28, 1);
    expect(area.statutorySetbacks.rearSetbackFt).toBeCloseTo(3.28, 1);
    expect(area.statutorySetbacks.leftSetbackFt).toBeCloseTo(3.28, 1);
    expect(area.statutorySetbacks.rightSetbackFt).toBeCloseTo(3.28, 1);

    // Coverage & FAR
    expect(area.maxPermissibleCoveragePct).toBe(70);
    expect(area.permissibleFAR).toBe(1.75);
    expect(area.recommendedBUAPerFloorSqFt).toBe(720); // Conservative 60% default
    expect(area.recommendedBUATotalSqFt).toBe(1440); // 720 * 2 floors
    expect(area.totalBUASqFt).toBe(1440);
  });

  it('2. Correctly calculates Mysuru (MUDA/MDA) setbacks and limits for 30x40', () => {
    const mysoreInput = { ...baseInput, city: 'Mysore' as const, authority: 'MUDA' };
    const area = calculateArea(mysoreInput);
    expect(area.plotAreaSqFt).toBe(1200);
    expect(area.authorityMetadata.authority).toBe('MUDA');
    expect(area.authorityMetadata.city).toBe('Mysuru');
    expect(area.authorityMetadata.ruleId).toBe('MYS-MUDA-CDP2031-RES-V1.8');

    // 30x40 in MUDA has 1.2m front (~3.94ft)
    expect(area.statutorySetbacks.frontSetbackFt).toBeCloseTo(3.94, 1);
    expect(area.statutorySetbacks.rearSetbackFt).toBeCloseTo(3.28, 1);
  });

  it('3. Respects road width dependent FAR regulations', () => {
    // Narrow road (< 30ft) gets FAR 1.50 and triggers client confirmation notice
    const narrowRoad = calculateArea({ ...baseInput, roadWidthFt: 24 });
    expect(narrowRoad.permissibleFAR).toBe(1.50);
    expect(narrowRoad.requiresClientConfirmation).toBe(true);

    // Wide road (45ft) gets enhanced FAR 2.00
    const wideRoad = calculateArea({ ...baseInput, roadWidthFt: 45 });
    expect(wideRoad.permissibleFAR).toBe(2.00);
    expect(wideRoad.requiresClientConfirmation).toBe(false);
  });

  it('4. Correctly determines Recommended BUA, Minimum BUA, and Maximum Permissible BUA', () => {
    const area = calculateArea(baseInput);
    expect(area.recommendedBUATotalSqFt).toBe(1440);
    expect(area.maximumPermissibleBUASqFt).toBeGreaterThanOrEqual(1440);
    expect(area.minimumBUASqFt).toBeLessThan(1440);
  });

  it('5. Allows user to adjust BUA and recomputes all downstream outputs immediately', () => {
    const defaultRes = runCalculator(baseInput);
    expect(defaultRes.area.totalBUASqFt).toBe(1440);
    const defaultCost = defaultRes.budget.totalProjectCost;
    const defaultSteel = defaultRes.quantities.steelTonnes;

    // User moves slider to 1,500 sq.ft (above 1440 recommended, within 1568 permissible)
    const modifiedInput = { ...baseInput, userSelectedBUA: 1500 };
    const customRes = runCalculator(modifiedInput);
    expect(customRes.area.totalBUASqFt).toBe(1500);
    expect(customRes.area.userSelectedBUASqFt).toBe(1500);

    // Downstream values increase proportionally
    expect(customRes.budget.totalProjectCost).toBeGreaterThan(defaultCost);
    expect(customRes.quantities.steelTonnes).toBeGreaterThan(defaultSteel);
    expect(customRes.area.validationState).toBe('above_recommended');
  });

  it('6. Detects when user exceeds statutory permissible BUA (State C)', () => {
    // Huge BUA exceeding FAR and buildable footprint
    const exceedingInput = { ...baseInput, userSelectedBUA: 4000 };
    const res = runCalculator(exceedingInput);
    expect(res.area.validationState).toBe('exceeds_permissible');
    expect(res.area.isWithinPermissibleLimit).toBe(false);
    expect(res.area.requiresClientConfirmation).toBe(true);
  });

  it('7. Preserves room space model independence when BUA changes', () => {
    const res1 = runCalculator({ ...baseInput, userSelectedBUA: 1200 });
    const res2 = runCalculator({ ...baseInput, userSelectedBUA: 1500 });

    // Bedroom and bathroom counts must remain exactly 3
    const bedrooms1 = res1.buildingModel.allSpaces.filter(s => s.type === 'bedrooms').length;
    const bedrooms2 = res2.buildingModel.allSpaces.filter(s => s.type === 'bedrooms').length;
    expect(bedrooms1).toBe(3);
    expect(bedrooms2).toBe(3);
    expect(res1.quantities.mainDoorsCount).toBe(res2.quantities.mainDoorsCount);
  });

  it('8. Handles zero-state and unconfigured inputs safely', () => {
    const zeroRes = calculateArea({ ...baseInput, plotLength: 0, plotWidth: 0 });
    expect(zeroRes.plotAreaSqFt).toBe(0);
    expect(zeroRes.totalBUASqFt).toBe(0);
    expect(zeroRes.buildableFootprintSqFt).toBe(0);
  });
});
