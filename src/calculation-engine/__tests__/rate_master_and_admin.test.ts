import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateService } from '../data/rateService';
import { HUTTY_BASELINE_RATES, HUTTY_BASELINE_CONFIG } from '../data/rateMasterDefaults';
import { RateOverride } from '../data/rateMasterTypes';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { analytics } from '../../utils/analytics';

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

describe('Centralized Rate Master & Admin System Acceptance Suite', () => {
  beforeEach(() => {
    // Reset rateService overrides and config to pristine baseline
    rateService.resetToDefaults();
  });

  // ── 1. DEFAULT DATASET & PRESERVATION ──
  it('1. Seeded default dataset resolves all canonical rates without any overrides', () => {
    const steelRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    const cementRate = rateService.getEffectiveRate('cement.opc53_grade');
    const msandRate = rateService.getEffectiveRate('aggregate.msand_zone2');
    const wire1_5 = rateService.getEffectiveRate('electrical.wire_1_5_finolex');

    const findBaseline = (id: string) => HUTTY_BASELINE_RATES.find((r) => r.id === id)?.rate;

    expect(steelRate).toBe(findBaseline('steel.fe550d_tmt'));
    expect(cementRate).toBe(findBaseline('cement.opc53_grade'));
    expect(msandRate).toBe(findBaseline('aggregate.msand_zone2'));
    expect(wire1_5).toBe(findBaseline('electrical.wire_1_5_finolex'));

    // Source type must be BASELINE
    const res = rateService.getEffectiveResult('steel.fe550d_tmt');
    expect(res.sourceType).toBe('BASELINE');
    expect(res.effectiveRate).toBe(74000);
  });

  // ── 2. MULTI-DIMENSIONAL OVERRIDE PRECEDENCE ──
  it('2. Exact Package + Location override takes highest precedence', () => {
    const overrides: RateOverride[] = [
      {
        id: 'ov-global',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 75000,
        isActive: true,
      },
      {
        id: 'ov-pkg',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'PREMIUM',
        location: 'ALL',
        overrideRate: 78000,
        isActive: true,
      },
      {
        id: 'ov-loc',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'ALL',
        location: 'Bangalore',
        overrideRate: 76000,
        isActive: true,
      },
      {
        id: 'ov-exact',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'PREMIUM',
        location: 'Bangalore',
        overrideRate: 82000,
        isActive: true,
      },
    ];

    rateService.setOverrides(overrides);

    // Query with exact match (PREMIUM + Bangalore)
    const resultExact = rateService.getEffectiveResult('steel.fe550d_tmt', {
      packageTier: 'PREMIUM',
      location: 'Bangalore',
    });
    expect(resultExact.effectiveRate).toBe(82000);
    expect(resultExact.sourceType).toBe('OVERRIDE_PACKAGE_LOCATION');
  });

  it('3. Package-only override takes precedence over global and baseline', () => {
    rateService.setOverrides([
      {
        id: 'ov-global',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 75000,
        isActive: true,
      },
      {
        id: 'ov-pkg-lux',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'LUXURY',
        location: 'ALL',
        overrideRate: 88000,
        isActive: true,
      },
    ]);

    // Query for LUXURY in Mysore (no Mysore-specific override exists, so package override wins)
    const result = rateService.getEffectiveResult('steel.fe550d_tmt', {
      packageTier: 'LUXURY',
      location: 'Mysore',
    });
    expect(result.effectiveRate).toBe(88000);
    expect(result.sourceType).toBe('OVERRIDE_PACKAGE');
  });

  it('4. Location-only override takes precedence over global override', () => {
    rateService.setOverrides([
      {
        id: 'ov-global',
        rateId: 'cement.opc53_grade',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 430,
        isActive: true,
      },
      {
        id: 'ov-loc-mysore',
        rateId: 'cement.opc53_grade',
        packageTier: 'ALL',
        location: 'Mysore',
        overrideRate: 405,
        isActive: true,
      },
    ]);

    const resMysore = rateService.getEffectiveResult('cement.opc53_grade', {
      packageTier: 'STANDARD',
      location: 'Mysore',
    });
    expect(resMysore.effectiveRate).toBe(405);
    expect(resMysore.sourceType).toBe('OVERRIDE_LOCATION');

    const resBangalore = rateService.getEffectiveResult('cement.opc53_grade', {
      packageTier: 'STANDARD',
      location: 'Bangalore',
    });
    expect(resBangalore.effectiveRate).toBe(430);
    expect(resBangalore.sourceType).toBe('OVERRIDE_GLOBAL');
  });

  // ── 3. OVERRIDE REMOVAL AND BASELINE RESTORATION ──
  it('5. Resetting/deleting override immediately restores canonical baseline rate', () => {
    rateService.setOverrides([
      {
        id: 'ov-temp',
        rateId: 'flooring.vitrified_living',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 195,
        isActive: true,
      },
    ]);

    expect(rateService.getEffectiveRate('flooring.vitrified_living')).toBe(195);

    // Remove override
    rateService.removeOverride('ov-temp');
    const defaultBaseline = HUTTY_BASELINE_RATES.find((r) => r.id === 'flooring.vitrified_living')?.rate;
    expect(rateService.getEffectiveRate('flooring.vitrified_living')).toBe(defaultBaseline);
  });

  // ── 4. PHYSICAL QUANTITY INVARIANCE GUARANTEE ──
  it('6. Overriding rates materially changes project cost but leaves physical quantities STRICTLY invariant', () => {
    const baseInput: EngineInput = { ...sampleProjectInput, qualityTier: 'Premium' };

    // Calculate baseline
    const rBaseline = runCalculator(baseInput);
    const baselineSteelTonnes = rBaseline.quantities.steelTonnes;
    const baselineCementBags = rBaseline.quantities.cementBags;
    const baselineSandCuFt = rBaseline.quantities.mSandCuFt;
    const baselineWire1_5M = rBaseline.quantities.wire1_5SqMmMetres;
    const baselineCost = rBaseline.budget.totalProjectCost;

    // Apply massive rate increases via RateMaster override
    rateService.setOverrides([
      {
        id: 'ov-steel-high',
        rateId: 'steel.fe550d_tmt',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 150000, // Doubled rate
        isActive: true,
      },
      {
        id: 'ov-cement-high',
        rateId: 'cement.opc53_grade',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 900, // Doubled rate
        isActive: true,
      },
    ]);

    // Recalculate with overrides active
    const rOverridden = runCalculator(baseInput);

    // CRITICAL INVARIANT: Physical quantities MUST NOT CHANGE
    expect(rOverridden.quantities.steelTonnes).toBe(baselineSteelTonnes);
    expect(rOverridden.quantities.cementBags).toBe(baselineCementBags);
    expect(rOverridden.quantities.mSandCuFt).toBe(baselineSandCuFt);
    expect(rOverridden.quantities.wire1_5SqMmMetres).toBe(baselineWire1_5M);

    // Cost MUST increase due to higher rates
    expect(rOverridden.budget.totalProjectCost).toBeGreaterThan(baselineCost);
  });

  // ── 5. ELECTRICAL CENTRALIZATION ──
  it('7. Electrical wire gauges and conduit rates resolve through centralized RateMaster', () => {
    rateService.setOverrides([
      {
        id: 'ov-wire-15',
        rateId: 'electrical.wire_1_5_finolex',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 48,
        isActive: true,
      },
      {
        id: 'ov-conduit',
        rateId: 'electrical.conduit_pvc_25mm',
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: 55,
        isActive: true,
      },
    ]);

    const baseInput: EngineInput = {
      ...sampleProjectInput,
      qualityTier: 'Premium',
      materialBrands: {
        ...sampleProjectInput.materialBrands,
        electrical: 'Finolex',
      },
      electrical: {
        ...sampleProjectInput.electrical,
        wireTier: 'Premium (Finolex / Polycab)',
        conduit: 'Precision PVC',
      } as any,
    };

    const res = runCalculator(baseInput);

    const wire1_5Item = res.boq.find((item) => item.description.includes('1.5 sq.mm'));
    const conduitItem = res.boq.find((item) => item.description.includes('PVC Conduit'));

    expect(wire1_5Item).toBeDefined();
    expect(wire1_5Item?.unitRate).toBe(48);

    expect(conduitItem).toBeDefined();
    expect(conduitItem?.unitRate).toBe(55);
  });

  // ── 6. CALCULATOR CONFIGURATION & STATUTORY MARKUPS ──
  it('8. Modifying project additions config dynamically updates budget calculations', () => {
    const baseInput: EngineInput = {
      ...sampleProjectInput,
      floors: 1,
      qualityTier: 'Premium',
    };

    const initial = runCalculator(baseInput);
    const initialBaseCost = initial.budget.baseConstructionCost;

    // Change contractor margin from 15% to 20% and GST from 18% to 12%
    rateService.setConfig({
      contractorMarginRate: 0.20,
      gstRate: 0.12,
    });

    const modified = runCalculator(baseInput);

    expect(modified.budget.baseConstructionCost).toBe(initialBaseCost);
    expect(modified.budget.contractorMargin).toBe(Math.round(initialBaseCost * 0.20));
  });

  // ── 7. MISSING RATE AND SAFE FALLBACK HANDLING ──
  it('9. Genuinely missing rates return MISSING_RATE without inventing arbitrary prices, never returning NaN or Infinity', () => {
    const res = rateService.getEffectiveResult('non_existent.future_material_xyz');
    expect(res.sourceType).toBe('MISSING_RATE');
    expect(res.isMissing).toBe(true);
    expect(res.effectiveRate).toBe(0);
    expect(isNaN(res.effectiveRate)).toBe(false);
    expect(isFinite(res.effectiveRate)).toBe(true);

    // Calling getEffectiveRate without fallback returns 0 (never NaN, never invented arbitrary price)
    const rateWithoutFallback = rateService.getEffectiveRate('non_existent.future_material_xyz');
    expect(rateWithoutFallback).toBe(0);

    // If caller explicitly provides a valid positive fallback, it is used safely
    const withExplicitFallback = rateService.getEffectiveRate('non_existent.future_material_xyz', undefined, 175);
    expect(withExplicitFallback).toBe(175);
  });

  // ── 8. BRAND-SPECIFIC RESOLUTION & BRAND OVERRIDE VERIFICATION ──
  it('10. Brand-specific products resolve authentic prices and respect brand-specific admin overrides', () => {
    // 1. Tata Tiscon brand resolves through Rate Master
    const tataRes = rateService.getEffectiveResult('steel.fe550d_tmt', { brand: 'Tata Tiscon' });
    expect(tataRes.effectiveRate).toBe(78000);
    expect(tataRes.rateId).toBe('steel.tata_tiscon');

    // 2. JSW Neosteel resolves its own distinct baseline
    const jswRes = rateService.getEffectiveResult('steel.fe550d_tmt', { brand: 'JSW Neosteel' });
    expect(jswRes.effectiveRate).toBe(75000);

    // 3. Admin overrides Tata Tiscon to ₹86,000/Tonne
    rateService.setOverride({
      id: 'ov-tata-override',
      rateId: 'steel.tata_tiscon',
      packageTier: 'ALL',
      location: 'ALL',
      overrideRate: 86000,
      isActive: true,
    });

    const overriddenTata = rateService.getEffectiveResult('steel.fe550d_tmt', { brand: 'Tata Tiscon' });
    expect(overriddenTata.effectiveRate).toBe(86000);
    expect(overriddenTata.sourceType).toBe('OVERRIDE_GLOBAL');

    // JSW remains unaffected by Tata override
    const unaffectedJsw = rateService.getEffectiveResult('steel.fe550d_tmt', { brand: 'JSW Neosteel' });
    expect(unaffectedJsw.effectiveRate).toBe(75000);

    // 4. Windows brand resolution (Fenesta uPVC)
    const fenestaRes = rateService.getEffectiveResult('windows.upvc_standard', { brand: 'Fenesta uPVC' });
    expect(fenestaRes.effectiveRate).toBe(850);

    // 5. Sanitaryware brand resolution (Kohler)
    const kohlerRes = rateService.getEffectiveResult('sanitary.jaquar_fittings_set', { brand: 'Kohler' });
    expect(kohlerRes.effectiveRate).toBe(38000);
  });

  // ── 9. PROPAGATION OF ALL 19 ADMIN-EDITABLE MONETARY INPUTS ──
  it('11. Verifies that every admin-editable monetary input propagates to the final calculator result', () => {
    const baseInput: EngineInput = { ...sampleProjectInput, qualityTier: 'Premium', liftRequired: true };
    const baseline = runCalculator(baseInput);
    const baseTotal = baseline.budget.totalProjectCost;

    // List of keys to test for direct propagation:
    const testKeys: Array<{ key: string; rate: number; isConfig?: boolean; configKey?: string }> = [
      { key: 'steel.fe550d_tmt', rate: 120000 },
      { key: 'cement.opc53_grade', rate: 650 },
      { key: 'concrete.rmc_m25', rate: 7500 },
      { key: 'concrete.pcc_m10', rate: 6000 },
      { key: 'aggregate.msand_zone2', rate: 110 },
      { key: 'aggregate.coarse_granite', rate: 95 },
      { key: 'masonry.aac_block_6in', rate: 135 },
      { key: 'flooring.vitrified_living', rate: 250 },
      { key: 'doors.main_teak_african', rate: 95000 },
      { key: 'windows.upvc_standard', rate: 1200 },
      { key: 'paint.interior_premium', rate: 55 },
      { key: 'electrical.wire_1_5_vguard', rate: 75 },
      { key: 'electrical.conduit_pvc_25mm', rate: 80 },
      { key: 'electrical.switch_module_midrange', rate: 450 },
      { key: 'plumbing.cpvc_pipe_ashirwad', rate: 290 },
      { key: 'plumbing.sanitaryware_set', rate: 95000 },
      { key: 'fixtures.passenger_lift', rate: 950000 },
    ];

    // Verify each material/component rate change propagates to output
    for (const item of testKeys) {
      rateService.resetToDefaults();
      rateService.setOverride({
        id: `ov-test-${item.key}`,
        rateId: item.key,
        packageTier: 'ALL',
        location: 'ALL',
        overrideRate: item.rate,
        isActive: true,
      });

      const updated = runCalculator(baseInput);
      if (item.key.startsWith('aggregate.')) {
        const matItem = updated.materialSchedule.find((m) =>
          item.key.includes('msand') ? m.material.includes('M-Sand') : m.material.includes('Coarse')
        );
        expect(matItem?.unitRate).toBe(item.rate);
      } else {
        expect(
          updated.budget.totalProjectCost,
          `Expected rate change on ${item.key} to alter total project cost`
        ).not.toBe(baseTotal);
      }
    }

    // Verify configuration statutory markups propagation
    rateService.resetToDefaults();

    // 1. Contractor margin
    rateService.setConfig({ contractorMarginRate: 0.25 });
    expect(runCalculator(baseInput).budget.contractorMargin).toBe(
      Math.round(baseline.budget.baseConstructionCost * 0.25)
    );

    // 2. Professional / architect fees
    rateService.resetToDefaults();
    rateService.setConfig({ architectFeesRate: 0.08, structuralFeesRate: 0.04 });
    const feesExpected = Math.round(baseline.budget.baseConstructionCost * 0.12);
    expect(runCalculator(baseInput).budget.professionalFees).toBe(feesExpected);

    // 3. Contingency
    rateService.resetToDefaults();
    rateService.setConfig({ contingencyRate: 0.07 });
    expect(runCalculator(baseInput).budget.contingency).toBe(
      Math.round(baseline.budget.baseConstructionCost * 0.07)
    );

    // 4. GST
    rateService.resetToDefaults();
    rateService.setConfig({ gstRate: 0.05 });
    expect(runCalculator(baseInput).budget.gstAmount).toBe(
      Math.round((baseline.budget.baseConstructionCost + baseline.budget.professionalFees) * 0.05)
    );
  });

  // ── 10. PHYSICAL QUANTITY INVARIANCE GUARANTEE ──
  it('12. Changing rates and markups leaves all physical quantities STRICTLY invariant', () => {
    const baseInput: EngineInput = { ...sampleProjectInput, qualityTier: 'Premium' };
    const r1 = runCalculator(baseInput);

    // Apply massive rate increases across multiple categories
    rateService.setOverrides([
      { id: 'ov1', rateId: 'steel.fe550d_tmt', packageTier: 'ALL', location: 'ALL', overrideRate: 200000, isActive: true },
      { id: 'ov2', rateId: 'cement.opc53_grade', packageTier: 'ALL', location: 'ALL', overrideRate: 999, isActive: true },
      { id: 'ov3', rateId: 'concrete.rmc_m25', packageTier: 'ALL', location: 'ALL', overrideRate: 15000, isActive: true },
      { id: 'ov4', rateId: 'aggregate.msand_zone2', packageTier: 'ALL', location: 'ALL', overrideRate: 250, isActive: true },
    ]);
    rateService.setConfig({
      contractorMarginRate: 0.35,
      gstRate: 0.28,
    });

    const r2 = runCalculator(baseInput);

    // Physical quantities must remain identical down to precision
    expect(r2.quantities.steelTonnes).toBe(r1.quantities.steelTonnes);
    expect(r2.quantities.cementBags).toBe(r1.quantities.cementBags);
    expect(r2.quantities.mSandCuFt).toBe(r1.quantities.mSandCuFt);
    expect(r2.quantities.pSandCuFt).toBe(r1.quantities.pSandCuFt);
    expect(r2.quantities.coarseAggregateCuFt).toBe(r1.quantities.coarseAggregateCuFt);
    expect(r2.quantities.wire1_5SqMmMetres).toBe(r1.quantities.wire1_5SqMmMetres);
    expect(r2.quantities.wire2_5SqMmMetres).toBe(r1.quantities.wire2_5SqMmMetres);
    expect(r2.quantities.conduitsMetres).toBe(r1.quantities.conduitsMetres);

    // But financial cost must differ substantially
    expect(r2.budget.totalProjectCost).toBeGreaterThan(r1.budget.totalProjectCost);
  });

  // ── 11. ANALYTICS FAILSAFE ──
  it('13. Analytics tracker runs in non-blocking failsafe mode without throwing', () => {
    expect(() => {
      analytics.recordStepEnter('step_plot', 'PREMIUM', 'Bangalore');
      analytics.recordStepExit('step_plot', 'PREMIUM', 'Bangalore');
      analytics.trackEvent({
        eventType: 'estimate_generated',
        packageTier: 'PREMIUM',
        city: 'Bangalore',
      });
    }).not.toThrow();
  });
});
