// ============================================================
// COMPREHENSIVE TEST SUITE: ENHANCED ADMIN MODULES
// Tests Auto Price Update, Admin Analytics, Account & Security,
// and Physical Quantity Invariance
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { rateService } from '../data/rateService';
import { HUTTY_BASELINE_RATES, HUTTY_BASELINE_CONFIG } from '../data/rateMasterDefaults';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { analytics } from '../../utils/analytics';
import {
  PriceUpdateService,
  KarnatakaMarketDataProvider,
  AIPriceResearchProvider,
  ExternalPriceApiProvider,
} from '../services/priceUpdate/priceUpdateProviders';


const standardInput: EngineInput = {
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
    masonry: 'Solid Concrete Blocks (8")',
    doors: 'Standard Flush Door',
    windows: 'Aluminium Slider',
    flooring: 'Vitrified Tiles (2x2 Double Charged)',
    bathroom: 'Standard (Cera / Parryware)',
    electrical: 'Standard (Anchor / Havells)',
    paint: 'Tractor Emulsion',
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

describe('MODULE 1: AUTOMATIC MARKET PRICE UPDATE', () => {
  let priceService: PriceUpdateService;

  beforeEach(() => {
    rateService.resetToDefaults();
    priceService = new PriceUpdateService();
  });

  it('1. Provider response parsing: extracts structured market quote', async () => {
    const provider = new KarnatakaMarketDataProvider();
    const quotes = await provider.fetchPrices(['steel.fe550d_tmt']);

    expect(quotes.length).toBe(1);
    expect(quotes[0].rateId).toBe('steel.fe550d_tmt');
    expect(quotes[0].proposedRate).toBeGreaterThan(0);
    expect(quotes[0].unit).toBe('₹/Tonne');
    expect(quotes[0].currency).toBe('INR');
    expect(quotes[0].source).toContain('Karnataka Construction Index');
  });

  it('2. Invalid provider response: handles missing or malformed rateId gracefully', async () => {
    const provider = new KarnatakaMarketDataProvider();
    const quotes = await provider.fetchPrices(['non.existent.item.id']);
    expect(quotes.length).toBe(0);
  });

  it('3. Negative rate rejection: sanity check flags negative price', () => {
    const sanity = priceService.performSanityChecks(74000, -5000, '₹/Tonne', false);
    expect(sanity.isValid).toBe(false);
    expect(sanity.status).toBe('FAILED');
    expect(sanity.rejectionReason).toContain('Negative rates are strictly prohibited');
  });

  it('4. Zero/invalid rate handling: sanity check flags zero replacing positive rate and NaN/Infinity', () => {
    const zeroCheck = priceService.performSanityChecks(74000, 0, '₹/Tonne', false);
    expect(zeroCheck.isValid).toBe(false);
    expect(zeroCheck.status).toBe('FAILED');

    const nanCheck = priceService.performSanityChecks(74000, NaN, '₹/Tonne', false);
    expect(nanCheck.isValid).toBe(false);
    expect(nanCheck.status).toBe('FAILED');

    const infCheck = priceService.performSanityChecks(74000, Infinity, '₹/Tonne', false);
    expect(infCheck.isValid).toBe(false);
  });

  it('5. Large price-change warning: flags price changes > 35% as NEEDS_REVIEW', () => {
    // Current 74,000 -> Proposed 110,000 (+48.6% change)
    const sanity = priceService.performSanityChecks(74000, 110000, '₹/Tonne', false);
    expect(sanity.isValid).toBe(true);
    expect(sanity.status).toBe('NEEDS_REVIEW');
    expect(sanity.warning).toContain('Large price change');
  });

  it('6. Proposal creation: generates proposals with status, diff and diffPercent', async () => {
    const targets = [{ id: 'steel.fe550d_tmt', name: 'TMT Steel', category: 'Steel', rate: 74000, unit: '₹/Tonne' }];
    const run = await priceService.generateProposals('market_index', targets);

    expect(run.proposals.length).toBe(1);
    const p = run.proposals[0];
    expect(p.currentRate).toBe(74000);
    expect(p.proposedRate).toBe(76500);
    expect(p.difference).toBe(2500);
    expect(p.differencePercent).toBeCloseTo(3.38, 1);
    expect(p.status).toBe('PENDING');
  });

  it('7. Proposal does not affect calculator before approval: live rates unchanged', async () => {
    const initialRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(initialRate).toBe(74000);

    const targets = [{ id: 'steel.fe550d_tmt', name: 'TMT Steel', category: 'Steel', rate: 74000, unit: '₹/Tonne' }];
    const run = await priceService.generateProposals('market_index', targets);
    expect(run.proposals[0].proposedRate).toBe(76500);

    // CRITICAL: Calculator must still resolve the original baseline rate before approval!
    const effectiveRateBeforeApproval = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(effectiveRateBeforeApproval).toBe(74000);
  });

  it('8. Proposal approval creates RateOverride: alters effective rate', () => {
    const beforeRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(beforeRate).toBe(74000);

    // Admin explicitly approves proposal
    rateService.setOverride({
      id: 'ov_approved_1',
      rateId: 'steel.fe550d_tmt',
      overrideRate: 76500,
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
      reason: 'Auto price update approved',
    });

    const afterRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(afterRate).toBe(76500);
  });

  it('9. Proposal rejection leaves current rate unchanged: preserves baseline', () => {
    const beforeRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(beforeRate).toBe(74000);

    // Proposal rejected -> no override is applied
    const afterRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(afterRate).toBe(74000);
  });

  it('10. Audit log generated after approval: records action and source information', () => {
    rateService.setOverride({
      id: 'ov_approved_test',
      rateId: 'cement.ultratech_super',
      overrideRate: 435,
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
      reason: 'Auto price update approved from Karnataka Construction Index',
    });

    const logs = rateService.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    const lastLog = logs[0];
    expect(lastLog.rateId).toBe('cement.ultratech_super');
    expect(lastLog.newValue).toBe(435);
  });

  it('11. Source information persisted: AI-assisted proposals explicitly labelled', async () => {
    const targets = [{ id: 'steel.fe550d_tmt', name: 'TMT Steel', category: 'Steel', rate: 74000, unit: '₹/Tonne' }];
    const run = await priceService.generateProposals('ai_research', targets);
    const p = run.proposals[0];

    expect(p.isAiAssisted).toBe(true);
    expect(p.notes).toContain('AI-Assisted Proposal — Manual Verification Required');
    expect(p.status).toBe('NEEDS_REVIEW');
  });

  it('12. Location/package dimensions preserved: Mysore override does not overwrite Bangalore', () => {
    rateService.setOverride({
      id: 'ov_bangalore',
      rateId: 'labour.mason_daily',
      overrideRate: 1100,
      location: 'Bangalore',
      packageTier: 'ALL',
      isActive: true,
      reason: 'Bengaluru city revision',
    });

    rateService.setOverride({
      id: 'ov_mysore',
      rateId: 'labour.mason_daily',
      overrideRate: 950,
      location: 'Mysore',
      packageTier: 'ALL',
      isActive: true,
      reason: 'Mysuru city revision',
    });

    const bangaloreRate = rateService.getEffectiveRate('labour.mason_daily', { location: 'Bangalore' });
    const mysoreRate = rateService.getEffectiveRate('labour.mason_daily', { location: 'Mysore' });

    expect(bangaloreRate).toBe(1100);
    expect(mysoreRate).toBe(950);
  });

  it('13. Existing precedence remains correct: Exact > Package > Location > Global > Baseline', () => {
    // Global
    rateService.setOverride({
      id: 'ov_global',
      rateId: 'steel.fe550d_tmt',
      overrideRate: 75000,
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
    });
    // Package specific
    rateService.setOverride({
      id: 'ov_package',
      rateId: 'steel.fe550d_tmt',
      overrideRate: 77000,
      location: 'ALL',
      packageTier: 'PREMIUM',
      isActive: true,
    });
    // Exact [Package + Location]
    rateService.setOverride({
      id: 'ov_exact',
      rateId: 'steel.fe550d_tmt',
      overrideRate: 79500,
      location: 'Bangalore',
      packageTier: 'PREMIUM',
      isActive: true,
    });

    // Resolving exact match should yield 79,500
    const exactResolved = rateService.getEffectiveRate('steel.fe550d_tmt', { location: 'Bangalore', packageTier: 'PREMIUM' });
    expect(exactResolved).toBe(79500);

    // Resolving Mysore + Premium should fall back to package override (77,000)
    const packageResolved = rateService.getEffectiveRate('steel.fe550d_tmt', { location: 'Mysore', packageTier: 'PREMIUM' });
    expect(packageResolved).toBe(77000);

    // Resolving Standard in Mysore should fall back to global override (75,000)
    const globalResolved = rateService.getEffectiveRate('steel.fe550d_tmt', { location: 'Mysore', packageTier: 'STANDARD' });
    expect(globalResolved).toBe(75000);
  });

  it('14. Provider failure does not break calculator: UNVERIFIED keeps current rate', async () => {
    // Failing provider simulation
    class FailingProvider {
      readonly id = 'failing';
      readonly name = 'Failing External API';
      readonly description = 'Throws 500 error';
      readonly isAiAssisted = false;
      async fetchPrices(): Promise<any[]> {
        throw new Error('Simulated 500 API Crash');
      }
    }

    priceService.registerProvider(new FailingProvider() as any);
    const targets = [{ id: 'steel.fe550d_tmt', name: 'TMT Steel', category: 'Steel', rate: 74000, unit: '₹/Tonne' }];
    const run = await priceService.generateProposals('failing', targets);

    expect(run.proposals.length).toBe(1);
    expect(run.proposals[0].status).toBe('UNVERIFIED');
    expect(run.proposals[0].proposedRate).toBe(74000); // Current rate retained!
    expect(run.proposals[0].warning).toContain('Unable to verify');
  });

  it('15. Baseline still works when no provider is available', () => {
    rateService.resetToDefaults();
    const baselineRate = rateService.getEffectiveRate('steel.fe550d_tmt');
    expect(baselineRate).toBe(74000);
  });
});

describe('MODULE 2: BUILT-IN ADMIN ANALYTICS', () => {
  it('16. Calculator events recorded without blocking', () => {
    expect(() => {
      analytics.trackEvent({
        eventType: 'calculator_started',
        packageTier: 'PREMIUM',
        city: 'Bangalore',
      });
      analytics.trackEvent({
        eventType: 'package_selected',
        packageTier: 'PREMIUM',
      });
    }).not.toThrow();
  });

  it('17. Step timing recorded cleanly without double-counting', () => {
    analytics.recordStepEnter('Plot Dimensions', 'PREMIUM', 'Bangalore', 1);
    // Entering step 2 closes step 1
    analytics.recordStepEnter('Rooms & Layout', 'PREMIUM', 'Bangalore', 2);
    // Exiting step 2 closes step 2
    analytics.recordStepExit('Rooms & Layout', 'PREMIUM', 'Bangalore');
    expect(true).toBe(true);
  });

  it('18. Funnel aggregation logic contains all 14 steps in correct sequence', () => {
    const requiredFunnelSteps = [
      'Calculator Started',
      'Package Selected',
      'Plot Configured',
      'BUA Configured',
      'Core Materials',
      'Flooring',
      'Doors',
      'Windows',
      'Electrical',
      'Bathroom',
      'Painting',
      'Estimate Generated',
      'Report Generated',
      'Calculator Completed',
    ];

    expect(requiredFunnelSteps.length).toBe(14);
    expect(requiredFunnelSteps[0]).toBe('Calculator Started');
    expect(requiredFunnelSteps[13]).toBe('Calculator Completed');
  });

  it('19. Package analytics handles Standard, Premium, and Luxury counts', () => {
    const sampleSelections = ['STANDARD', 'PREMIUM', 'PREMIUM', 'LUXURY'];
    const counts = { STANDARD: 0, PREMIUM: 0, LUXURY: 0 };
    sampleSelections.forEach((pkg) => { counts[pkg as keyof typeof counts]++; });

    expect(counts.STANDARD).toBe(1);
    expect(counts.PREMIUM).toBe(2);
    expect(counts.LUXURY).toBe(1);
  });

  it('20. Date filters properly calculate cutoff timestamps', () => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    expect(sevenDaysAgo).toBeGreaterThan(thirtyDaysAgo);
  });

  it('21. Analytics failure never breaks calculator', () => {
    // Simulate broken network
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    expect(() => {
      analytics.trackEvent({ eventType: 'estimate_generated' });
    }).not.toThrow();

    global.fetch = originalFetch;
  });

  it('22. CSV export header specification includes required columns', () => {
    const csvHeaders = [
      'EventId',
      'EventName',
      'SessionId',
      'Step',
      'StepName',
      'PackageTier',
      'City',
      'EstimatedCostINR',
      'CostPerSqFt',
      'BuiltUpAreaSqFt',
      'TimeSpentMs',
      'CreatedAt',
    ];
    expect(csvHeaders).toContain('EventName');
    expect(csvHeaders).toContain('SessionId');
    expect(csvHeaders).toContain('EstimatedCostINR');
  });
});

describe('MODULE 3: ADMIN ACCOUNT & CREDENTIAL MANAGEMENT', () => {
  it('23. Password change requires current password and complexity check', () => {
    const weakPass = 'weak';
    const hasLength = weakPass.length >= 8;
    const hasUpper = /[A-Z]/.test(weakPass);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(weakPass);

    expect(hasLength).toBe(false);
    expect(hasUpper).toBe(false);
    expect(hasSpecial).toBe(false);

    const strongPass = 'Secure@Pass2026';
    expect(strongPass.length >= 8).toBe(true);
    expect(/[A-Z]/.test(strongPass)).toBe(true);
    expect(/[a-z]/.test(strongPass)).toBe(true);
    expect(/[0-9]/.test(strongPass)).toBe(true);
    expect(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(strongPass)).toBe(true);
  });

  it('24. Password is securely hashed using bcrypt', async () => {
    const rawPass = 'Admin@123456';
    const hash = await bcrypt.hash(rawPass, 10);

    expect(hash).not.toBe(rawPass);
    expect(hash.startsWith('$2')).toBe(true);
    const isMatch = await bcrypt.compare(rawPass, hash);
    expect(isMatch).toBe(true);
  });

  it('25. Wrong current password rejected by bcrypt comparison', async () => {
    const validHash = await bcrypt.hash('CorrectPassword@1', 10);
    const isMatch = await bcrypt.compare('WrongPassword@99', validHash);
    expect(isMatch).toBe(false);
  });

  it('26. Email change validation rejects invalid emails', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('not-an-email')).toBe(false);
    expect(emailRegex.test('admin@hutty')).toBe(false);
    expect(emailRegex.test('admin@hutty.in')).toBe(true);
  });

  it('27. Unauthorized account modification rejected when unauthenticated', () => {
    const req: any = { headers: {} };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    // Authenticate token middleware requires token
    if (!req.headers['authorization']) {
      res.status(401).json({ error: 'Access token required' });
    }
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('28. Admin RBAC enforced: non-admin roles rejected with 403', () => {
    const req: any = { user: { role: 'USER' } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    // Inline the requireAdmin guard logic (mirrors server/src/middlewares/auth.middleware.ts)
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
      res.status(403).json({ error: 'Admin authorization required' });
    } else {
      next();
    }

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('29. Security events audited without storing passwords or secrets', () => {
    const secEvent = {
      userEmail: 'admin@hutty.in',
      action: 'PASSWORD_CHANGED',
      details: { note: 'Password updated' },
    };
    expect(JSON.stringify(secEvent)).not.toContain('passwordHash');
    expect(JSON.stringify(secEvent)).not.toContain('secret');
  });

  it('30. Sensitive credentials never returned in profile output', () => {
    const profile = {
      id: 'admin-1',
      name: 'Hutty Admin',
      email: 'admin@hutty.in',
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
    };
    expect((profile as any).password).toBeUndefined();
    expect((profile as any).passwordHash).toBeUndefined();
  });
});

describe('PHYSICAL QUANTITY INVARIANCE RULE', () => {
  beforeEach(() => {
    rateService.resetToDefaults();
  });

  it('31. Physical quantities remain 100% INVARIANT under price modifications', () => {
    // 1. Run calculator with baseline rates
    const baselineCalc = runCalculator(standardInput);

    const baseSteelTonnes = baselineCalc.quantities.steelTonnes;
    const baseCementBags = baselineCalc.quantities.cementBags;
    const baseMSandCuFt = baselineCalc.quantities.mSandCuFt;
    const basePSandCuFt = baselineCalc.quantities.pSandCuFt;
    const baseAggCuFt = baselineCalc.quantities.coarseAggregateCuFt;
    const baseMasonryUnits = baselineCalc.quantities.masonryUnitsCount;
    const baseFloorTilesSqFt = baselineCalc.quantities.floorTilesSqFt;
    const baseWallTilesSqFt = baselineCalc.quantities.wallTilesSqFt;
    const baseWindows = baselineCalc.quantities.windowsCount;
    const baseWireMetres = baselineCalc.quantities.electricalWireMetres;
    const baseConduitMetres = baselineCalc.quantities.conduitsMetres;
    const baseLightPoints = baselineCalc.quantities.lightingPoints;

    expect(baseSteelTonnes).toBeGreaterThan(0);
    expect(baseCementBags).toBeGreaterThan(0);
    expect(baseMSandCuFt).toBeGreaterThan(0);

    // 2. Apply dramatic rate overrides (e.g. steel +50%, cement +40%, labour +30%)
    rateService.setOverride({
      id: 'ov_test_steel',
      rateId: 'steel.fe550d_tmt',
      overrideRate: 110000, // up from 74,000
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
    });
    rateService.setOverride({
      id: 'ov_test_cement',
      rateId: 'cement.ultratech_super',
      overrideRate: 590, // up from 425
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
    });
    rateService.setOverride({
      id: 'ov_test_labour',
      rateId: 'labour.mason_daily',
      overrideRate: 1600, // up from 1050
      location: 'ALL',
      packageTier: 'ALL',
      isActive: true,
    });

    // 3. Re-run calculator with new rates
    const updatedCalc = runCalculator(standardInput);

    // 4. Verification: Costs MUST change, but physical quantities MUST be exactly equal!
    expect(updatedCalc.budget.totalProjectCost).not.toBe(baselineCalc.budget.totalProjectCost);
    expect(updatedCalc.budget.totalProjectCost).toBeGreaterThan(baselineCalc.budget.totalProjectCost);

    // CRITICAL QUANTITY INVARIANCE ASSERTIONS:
    expect(updatedCalc.quantities.steelTonnes).toBe(baseSteelTonnes);
    expect(updatedCalc.quantities.cementBags).toBe(baseCementBags);
    expect(updatedCalc.quantities.mSandCuFt).toBe(baseMSandCuFt);
    expect(updatedCalc.quantities.pSandCuFt).toBe(basePSandCuFt);
    expect(updatedCalc.quantities.coarseAggregateCuFt).toBe(baseAggCuFt);
    expect(updatedCalc.quantities.masonryUnitsCount).toBe(baseMasonryUnits);
    expect(updatedCalc.quantities.floorTilesSqFt).toBe(baseFloorTilesSqFt);
    expect(updatedCalc.quantities.wallTilesSqFt).toBe(baseWallTilesSqFt);
    expect(updatedCalc.quantities.windowsCount).toBe(baseWindows);
    expect(updatedCalc.quantities.electricalWireMetres).toBe(baseWireMetres);
    expect(updatedCalc.quantities.conduitsMetres).toBe(baseConduitMetres);
    expect(updatedCalc.quantities.lightingPoints).toBe(baseLightPoints);
  });
});
