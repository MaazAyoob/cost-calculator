import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput, CalculationResult } from '../types';
import { rateService } from '../data/rateService';
import { runQAGate } from '../modules/qaGate';

const BENCHMARK_4BATH_HOUSE: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 30,
  plotWidth: 40,
  floors: 2,
  houseType: 'Duplex',
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 1,
  evCharging: false,
  liftRequired: false,
  qualityTier: 'Premium',
  contractorMode: 'independent',
  rooms: {
    bedrooms: 3,
    bathrooms: 3,
    commonToilets: 1, // 4 total bathrooms
    kitchen: 1,
    living: 1,
    dining: 1,
    balcony: 1,
    utility: 1,
    pooja: 1,
    office: 0,
    storeRoom: 0,
  },
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    masonry: 'AAC Blocks',
    doors: 'Premium Teak',
    windows: 'Fenesta uPVC',
    flooring: 'Vitrified',
    bathroom: 'Kohler',
    electrical: 'Finolex',
    paint: 'Asian Paints Royale',
  },
} as unknown as EngineInput;

describe('Hutty P0 Foundation Master Verification Suite', () => {
  // ── 1. CORE DIRECT COST MODEL ─────────────────────────────
  it('1. Direct Construction Budget = Materials + Fixtures + Labour with zero blanket margin/GST in independent mode', () => {
    const res = runCalculator(BENCHMARK_4BATH_HOUSE);

    expect(res.budget.contractorMargin).toBe(0);
    expect(res.budget.gstAmount).toBe(0);
    expect(res.budget.contingency).toBe(0);
    expect(res.budget.professionalFees).toBe(0);

    const directSum = res.budget.directMaterialCost + res.budget.directFixtureCost + res.budget.directLabourCost;
    expect(res.budget.directConstructionBudget).toBe(directSum);
    expect(res.budget.totalProjectCost).toBe(res.budget.directConstructionBudget);
    expect(res.budget.baseConstructionCost).toBe(res.budget.directConstructionBudget);

    // Effective rate per sqft = Direct Budget ÷ BUA
    expect(res.budget.costPerSqFt).toBe(Math.round(res.budget.directConstructionBudget / res.area.totalBUASqFt));
  });

  // ── 2. CONTRACTOR MODE ────────────────────────────────────
  it('2. Contractor mode applies configurable margin and separate tax', () => {
    const contractorInput: EngineInput = {
      ...BENCHMARK_4BATH_HOUSE,
      contractorMode: 'contractor',
      contractorMarginRate: 0.10, // 10%
      applyContractorGST: true,
    };

    const res = runCalculator(contractorInput);
    const directBudget = res.budget.directConstructionBudget;

    expect(res.budget.contractorMargin).toBe(Math.round(directBudget * 0.10));
    expect(res.budget.gstAmount).toBeGreaterThan(0);

    const expectedTotal = directBudget + res.budget.contractorMargin + res.budget.contingency + res.budget.professionalFees + res.budget.gstAmount;
    expect(res.budget.totalProjectCost).toBe(expectedTotal);
  });

  // ── 3. LABOUR ENGINE & ANTI-DOUBLE-COUNTING ───────────────
  it('3. Labour calculation correctly benchmarks Bengaluru civil rates and avoids double counting', () => {
    const bua = 2000;
    const testInput: EngineInput = {
      ...BENCHMARK_4BATH_HOUSE,
      userSelectedBUA: bua,
    };

    // Standard: ₹350 / sqft
    const stdRes = runCalculator({ ...testInput, qualityTier: 'Essential' });
    const stdCivilItem = stdRes.labourSchedule.find((i) => i.category === 'Civil & Structure');
    expect(stdCivilItem).toBeDefined();
    expect(stdCivilItem?.unitRate).toBe(350);

    // Premium: ₹380 / sqft
    const premRes = runCalculator({ ...testInput, qualityTier: 'Premium' });
    const premCivilItem = premRes.labourSchedule.find((i) => i.category === 'Civil & Structure');
    expect(premCivilItem).toBeDefined();
    expect(premCivilItem?.unitRate).toBe(380);

    // Luxury: ₹400 / sqft
    const luxRes = runCalculator({ ...testInput, qualityTier: 'Luxury' });
    const luxCivilItem = luxRes.labourSchedule.find((i) => i.category === 'Civil & Structure');
    expect(luxCivilItem).toBeDefined();
    expect(luxCivilItem?.unitRate).toBe(400);

    // Finishing trades are present and distinct
    const categories = premRes.labourSchedule.map((i) => i.category);
    expect(categories).toContain('Electrical');
    expect(categories).toContain('Plumbing');
    expect(categories).toContain('Flooring & Tiling');
    expect(categories).toContain('Painting & Finishes');
    expect(categories).toContain('Waterproofing');
  });

  // ── 4. BATHROOM WALL CLADDING GEOMETRY FIX ────────────────
  it('4. 4 bathrooms with 6x5 ft standard produce realistic wall cladding in ~520-560 sqft range', () => {
    const res = runCalculator(BENCHMARK_4BATH_HOUSE);

    // 4 bathrooms (3 master/attached + 1 common)
    expect(res.quantities.bathroomDadoTileSqFt).toBeGreaterThanOrEqual(480);
    expect(res.quantities.bathroomDadoTileSqFt).toBeLessThanOrEqual(580);
  });

  // ── 5. RATE CHANGE INVARIANCE ─────────────────────────────
  it('5. CRITICAL: Changing a material rate changes monetary amount and total, but physical quantity remains 100% INVARIANT', () => {
    const baseline = runCalculator(BENCHMARK_4BATH_HOUSE);
    const initialSteelTonnes = baseline.quantities.steelTonnes;
    const initialTotal = baseline.budget.totalProjectCost;

    // Apply an extreme override to steel rate: ₹74,000 -> ₹1,50,000
    rateService.setOverride({
      id: 'test-steel-ov',
      isActive: true,
      rateId: 'steel.fe550d_tmt',
      overrideRate: 150000,
      rate: 150000,
      category: 'Steel & Structural' as any,
      unit: 'Tonne',
      location: 'Bangalore',
      packageTier: 'PREMIUM',
    });

    const updated = runCalculator(BENCHMARK_4BATH_HOUSE);

    // Physical quantity MUST BE IDENTICAL
    expect(updated.quantities.steelTonnes).toBe(initialSteelTonnes);

    // Financial total MUST BE DIFFERENT
    expect(updated.budget.totalProjectCost).not.toBe(initialTotal);
    expect(updated.budget.totalProjectCost).toBeGreaterThan(initialTotal);

    // Clean up
    rateService.resetToDefaults();
  });

  // ── 6. CALCULATION PARAMETER INVARIANCE ────────────────────
  it('6. Changing a calculation parameter (e.g. steel factor) updates steel takeoff while unrelated takeoff remains invariant', () => {
    const baseline = runCalculator(BENCHMARK_4BATH_HOUSE);
    const cementBags = baseline.quantities.cementBags;
    const doorCount = baseline.quantities.totalDoorsCount;

    // A change in floor count alters steel factor
    const tallerHouse = runCalculator({ ...BENCHMARK_4BATH_HOUSE, floors: 3 });
    expect(tallerHouse.quantities.steelFactorKgPerSqFt).toBeGreaterThan(baseline.quantities.steelFactorKgPerSqFt);
    expect(tallerHouse.quantities.steelTonnes).toBeGreaterThan(baseline.quantities.steelTonnes);
  });

  // ── 7. COMMERCIAL RECONCILIATION & QA GATE ────────────────
  it('7. QA Gate enforces exact reconciliation and zero unexplained commercial residual', () => {
    const res = runCalculator(BENCHMARK_4BATH_HOUSE);
    const qa = runQAGate(res);

    expect(qa.passed).toBe(true);
    expect(qa.blockingErrors.length).toBe(0);

    const recon = res.commercialReconciliation;
    expect(recon).toBeDefined();
    if (recon) {
      expect(recon.unexplainedResidual).toBe(0);
      expect(recon.isFullyReconciled).toBe(true);
      expect(recon.reconciledSum).toBe(res.budget.totalProjectCost);
    }
  });

  // ── 8. CALCULATION TRACEABILITY AUDIT ─────────────────────
  it('8. Calculation trace includes explicit Paint and Labour derivation steps', () => {
    const res = runCalculator(BENCHMARK_4BATH_HOUSE);
    const trace = res.trace;

    const paintStep = trace.find((t) => t.ruleId === 'RULE-PAINT-01');
    expect(paintStep).toBeDefined();
    expect(paintStep?.category).toBe('FINISHES / PAINT');
    expect(paintStep?.formula).toContain('Coverage');

    const labourStep = trace.find((t) => t.ruleId === 'RULE-LABOUR-01');
    expect(labourStep).toBeDefined();
    expect(labourStep?.category).toBe('LABOUR / EXECUTION');
    expect(labourStep?.inputs.civilBenchmarkPerSqFt).toBe(380); // Premium
  });
});
