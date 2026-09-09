import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput, CalculationResult } from '../types';
import { rateService, IRateProvider, RateSourceMetadata } from '../data/rateService';
import { RateMasterItem } from '../data/brandDatabase';
import { runQAGate } from '../modules/qaGate';

const BASELINE_HOUSE: EngineInput = {
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
  rooms: {
    bedrooms: 2,
    bathrooms: 2,
    commonToilets: 1,
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
    doors: 'Premium Teak',
    windows: 'Fenesta uPVC',
    flooring: 'Vitrified',
    bathroom: 'Kohler',
    electrical: 'Finolex',
    paint: 'Asian Paints Royale',
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
    subGrade: 'Kommerling Premium uPVC',
  },
  electrical: {
    conduit: 'Heavy-Duty ISI Marked PVC',
    wireTier: 'Premium (Finolex / Polycab)',
  },
  bathroomFittings: {
    cpvcBrand: 'Astral',
    sanitaryTier: 'Kohler / Jaquar',
  },
  painting: {
    baseLayer: 'Putty + Primer',
    internalPaint: 'Premium Emulsion',
    externalPaint: 'Ultima Weather Proof',
    brand: 'Asian Paints',
  },
};

describe('HUTTY Production Electrical & Rate Engine Test Suite (P0.8)', () => {
  beforeEach(() => {
    rateService.resetToDefault();
  });

  afterEach(() => {
    rateService.resetToDefault();
  });

  // 1. Adding a bedroom increases electrical points, wiring length, and costs
  it('1. Adding a bedroom proportionally increases electrical points, wiring length, and costs', () => {
    const res2BHK = runCalculator(BASELINE_HOUSE);
    const input3BHK: EngineInput = {
      ...BASELINE_HOUSE,
      rooms: {
        ...BASELINE_HOUSE.rooms!,
        bedrooms: 3,
      },
    };
    const res3BHK = runCalculator(input3BHK);

    expect(res3BHK.quantities.lightingPoints).toBeGreaterThan(res2BHK.quantities.lightingPoints);
    expect(res3BHK.quantities.fanPoints).toBeGreaterThan(res2BHK.quantities.fanPoints);
    expect(res3BHK.quantities.socketPoints).toBeGreaterThan(res2BHK.quantities.socketPoints);
    expect(res3BHK.quantities.wire1_5SqMmMetres).toBeGreaterThan(res2BHK.quantities.wire1_5SqMmMetres);
    expect(res3BHK.quantities.wire2_5SqMmMetres).toBeGreaterThan(res2BHK.quantities.wire2_5SqMmMetres);
    expect(res3BHK.quantities.conduitsMetres).toBeGreaterThan(res2BHK.quantities.conduitsMetres);

    const elecTotal2BHK = (res2BHK.boq || []).filter((i) => i.code.startsWith('EL-')).reduce((s, i) => s + i.amount, 0);
    const elecTotal3BHK = (res3BHK.boq || []).filter((i) => i.code.startsWith('EL-')).reduce((s, i) => s + i.amount, 0);
    expect(elecTotal3BHK).toBeGreaterThan(elecTotal2BHK);
  });

  // 2. Removing a bedroom decreases electrical points and wiring
  it('2. Removing a bedroom proportionally decreases electrical points and conductor consumption', () => {
    const res2BHK = runCalculator(BASELINE_HOUSE);
    const input1BHK: EngineInput = {
      ...BASELINE_HOUSE,
      rooms: {
        ...BASELINE_HOUSE.rooms!,
        bedrooms: 1,
      },
    };
    const res1BHK = runCalculator(input1BHK);

    expect(res1BHK.quantities.lightingPoints).toBeLessThan(res2BHK.quantities.lightingPoints);
    expect(res1BHK.quantities.wire1_5SqMmMetres).toBeLessThan(res2BHK.quantities.wire1_5SqMmMetres);
    expect(res1BHK.quantities.wire2_5SqMmMetres).toBeLessThan(res2BHK.quantities.wire2_5SqMmMetres);
  });

  // 3. Adding AC increases AC points and 4.0 sq.mm wiring
  it('3. Increasing bedroom count increases dedicated AC points and 4.0 sq.mm heavy circuit wiring', () => {
    const res2BHK = runCalculator(BASELINE_HOUSE);
    const input4BHK: EngineInput = {
      ...BASELINE_HOUSE,
      rooms: {
        ...BASELINE_HOUSE.rooms!,
        bedrooms: 4,
      },
    };
    const res4BHK = runCalculator(input4BHK);

    expect(res4BHK.quantities.acPoints).toBe(5); // 4 bed + 1 living
    expect(res2BHK.quantities.acPoints).toBe(3); // 2 bed + 1 living
    expect(res4BHK.quantities.wire4SqMmMetres).toBeGreaterThan(res2BHK.quantities.wire4SqMmMetres);
  });

  // 4. Adding geyser increases geyser points and 4.0 sq.mm wiring
  it('4. Increasing bathroom count increases geyser points and 4.0 sq.mm heavy circuit wiring', () => {
    const res2Bath = runCalculator(BASELINE_HOUSE);
    const input4Bath: EngineInput = {
      ...BASELINE_HOUSE,
      rooms: {
        ...BASELINE_HOUSE.rooms!,
        bathrooms: 4,
      },
    };
    const res4Bath = runCalculator(input4Bath);

    expect(res4Bath.quantities.geyserPoints).toBe(5); // 4 bath + 1 common toilet
    expect(res2Bath.quantities.geyserPoints).toBe(3); // 2 bath + 1 common toilet
    expect(res4Bath.quantities.wire4SqMmMetres).toBeGreaterThan(res2Bath.quantities.wire4SqMmMetres);
  });

  // 5. EV Charging increases EV points, 6.0 sq.mm wiring, and BOQ cost
  it('5. Enabling EV charging provisions 1 dedicated 7.4kW point with 6.0 sq.mm line', () => {
    const resNoEV = runCalculator({ ...BASELINE_HOUSE, evCharging: false });
    const resWithEV = runCalculator({ ...BASELINE_HOUSE, evCharging: true });

    expect(resNoEV.quantities.evPoints).toBe(0);
    expect(resWithEV.quantities.evPoints).toBe(1);
    expect(resWithEV.quantities.wire6SqMmMetres).toBeGreaterThan(resNoEV.quantities.wire6SqMmMetres);

    const boqEV = (resWithEV.boq || []).find((i) => i.description.includes('6.0 sq.mm'));
    expect(boqEV).toBeDefined();
    expect(boqEV?.quantity).toBe(resWithEV.quantities.wire6SqMmMetres);
  });

  // 6. Increasing floors increases DBs, vertical risers, 6.0 sq.mm wire, and conduit
  it('6. Increasing floors scales Main & Sub Distribution Boards and vertical 6.0 sq.mm risers', () => {
    const resGPlus1 = runCalculator({ ...BASELINE_HOUSE, floors: 2 });
    const resGPlus3 = runCalculator({ ...BASELINE_HOUSE, floors: 4 });

    expect(resGPlus1.quantities.mainDBCount).toBe(1);
    expect(resGPlus1.quantities.floorDBCount).toBe(2); // 1 sub-DB per floor
    expect(resGPlus3.quantities.mainDBCount).toBe(1);
    expect(resGPlus3.quantities.floorDBCount).toBe(4); // 1 sub-DB per floor

    expect(resGPlus3.quantities.wire6SqMmMetres).toBeGreaterThan(resGPlus1.quantities.wire6SqMmMetres);
    expect(resGPlus3.quantities.conduitsMetres).toBeGreaterThan(resGPlus1.quantities.conduitsMetres);
  });

  // 7. Changing brand (Anchor -> V-Guard -> Finolex -> Polycab) changes rates while wire lengths remain invariant
  it('7. Brand Invariance: Wire lengths remain identical across brands while rates & costs change', () => {
    const brands = ['Anchor', 'V-Guard', 'Finolex', 'Polycab'];
    const results = brands.map((brand) =>
      runCalculator({
        ...BASELINE_HOUSE,
        materialBrands: {
          ...BASELINE_HOUSE.materialBrands!,
          electrical: brand,
        },
        electrical: {
          conduit: 'Heavy-Duty ISI Marked PVC',
          wireTier: (brand === 'Anchor' ? 'Economy (Anchor)' : brand === 'V-Guard' ? 'Mid-range (V-Guard)' : 'Premium (Finolex / Polycab)') as any,
        },
      })
    );

    const base1_5 = results[0].quantities.wire1_5SqMmMetres;
    const base2_5 = results[0].quantities.wire2_5SqMmMetres;
    const base4_0 = results[0].quantities.wire4SqMmMetres;
    const base6_0 = results[0].quantities.wire6SqMmMetres;
    const baseConduit = results[0].quantities.conduitsMetres;

    // Physical takeoffs MUST be 100% identical regardless of brand
    results.forEach((res) => {
      expect(res.quantities.wire1_5SqMmMetres).toBe(base1_5);
      expect(res.quantities.wire2_5SqMmMetres).toBe(base2_5);
      expect(res.quantities.wire4SqMmMetres).toBe(base4_0);
      expect(res.quantities.wire6SqMmMetres).toBe(base6_0);
      expect(res.quantities.conduitsMetres).toBe(baseConduit);
    });

    // But unit rates MUST reflect tier pricing (Anchor Economy < V-Guard Mid < Finolex/Polycab Premium)
    const boqAnchor = results[0].boq.find((i) => i.description.includes('1.5 sq.mm'))!;
    const boqVGuard = results[1].boq.find((i) => i.description.includes('1.5 sq.mm'))!;
    const boqFinolex = results[2].boq.find((i) => i.description.includes('1.5 sq.mm'))!;
    const boqPolycab = results[3].boq.find((i) => i.description.includes('1.5 sq.mm'))!;

    expect(boqAnchor.unitRate).toBeLessThan(boqVGuard.unitRate);
    expect(boqVGuard.unitRate).toBeLessThan(boqFinolex.unitRate);
    expect(boqFinolex.unitRate).toBe(boqPolycab.unitRate); // Both premium tier
  });

  // 8. No universal 700m wire rule exists
  it('8. Zero Heuristics: Electrical wire is derived from room geometry, not fixed 700m', () => {
    const testCases: Partial<EngineInput>[] = [
      { floors: 1, rooms: { bedrooms: 1, bathrooms: 1, commonToilets: 0, kitchen: 1, living: 1, dining: 0, balcony: 0, utility: 0, pooja: 0, office: 0, storeRoom: 0 } },
      { floors: 2, rooms: { bedrooms: 2, bathrooms: 2, commonToilets: 1, kitchen: 1, living: 1, dining: 1, balcony: 1, utility: 1, pooja: 0, office: 0, storeRoom: 0 } },
      { floors: 3, rooms: { bedrooms: 4, bathrooms: 4, commonToilets: 1, kitchen: 2, living: 2, dining: 1, balcony: 2, utility: 1, pooja: 1, office: 0, storeRoom: 0 } },
      { floors: 4, rooms: { bedrooms: 5, bathrooms: 5, commonToilets: 2, kitchen: 2, living: 2, dining: 2, balcony: 3, utility: 2, pooja: 1, office: 1, storeRoom: 1 } },
      { floors: 2, evCharging: true, rooms: { bedrooms: 3, bathrooms: 3, commonToilets: 1, kitchen: 1, living: 1, dining: 1, balcony: 1, utility: 1, pooja: 1, office: 0, storeRoom: 0 } },
    ];

    testCases.forEach((tc) => {
      const res = runCalculator({ ...BASELINE_HOUSE, ...tc });
      const totalWire = res.quantities.wire1_5SqMmMetres + res.quantities.wire2_5SqMmMetres + res.quantities.wire4SqMmMetres + res.quantities.wire6SqMmMetres;
      expect(totalWire).not.toBe(700);
      expect(res.quantities.electricalWireMetres).not.toBe(700);
    });
  });

  // 9. No universal 325m conduit rule exists
  it('9. Zero Heuristics: Heavy-duty PVC conduit is calculated dynamically, never hardcoded to 325m', () => {
    const testCases: Partial<EngineInput>[] = [
      { floors: 1, rooms: { bedrooms: 1, bathrooms: 1, commonToilets: 0, kitchen: 1, living: 1, dining: 0, balcony: 0, utility: 0, pooja: 0, office: 0, storeRoom: 0 } },
      { floors: 2, rooms: { bedrooms: 3, bathrooms: 3, commonToilets: 1, kitchen: 1, living: 1, dining: 1, balcony: 1, utility: 1, pooja: 1, office: 0, storeRoom: 0 } },
      { floors: 4, rooms: { bedrooms: 5, bathrooms: 5, commonToilets: 2, kitchen: 2, living: 2, dining: 2, balcony: 3, utility: 2, pooja: 1, office: 1, storeRoom: 1 } },
    ];

    testCases.forEach((tc) => {
      const res = runCalculator({ ...BASELINE_HOUSE, ...tc });
      expect(res.quantities.conduitsMetres).not.toBe(325);
    });
  });

  // 10. Every electrical line item amount = quantity × rate
  it('10. Strict Math: Every electrical BOQ item satisfies Math.round(quantity * unitRate) === amount', () => {
    const res = runCalculator(BASELINE_HOUSE);
    const elecItems = res.boq.filter((i) => i.code.startsWith('EL-') || i.category === 'Electrical');

    expect(elecItems.length).toBeGreaterThanOrEqual(7);
    elecItems.forEach((item) => {
      const expected = Math.round(item.quantity * item.unitRate);
      expect(item.amount).toBe(expected);
    });
  });

  // 11. Rate Master Decoupling & Dynamic Live Provider Swapping
  it('11. Rate Provider Abstraction: Pluggable provider overrides rates dynamically without altering formulas', () => {
    // 1. Verify default provider metadata
    const defaultMeta = rateService.getSourceMetadata();
    expect(defaultMeta.datasetVersion).toBe('HUTTY-RM-2026.1');
    expect(defaultMeta.isLive).toBe(false);

    const baseResult = runCalculator(BASELINE_HOUSE);
    const baseSteelBOQ = baseResult.boq.find((i) => i.description.includes('TMT'))!;
    expect(baseSteelBOQ).toBeDefined();
    expect(baseSteelBOQ.unitRate).toBe(78000); // 2026-Q1 default for Tata Tiscon

    // 2. Register mock external live price provider (e.g. real-time market API)
    class MockLiveMarketPriceProvider implements IRateProvider {
      private meta: RateSourceMetadata = {
        sourceId: 'live-market-cement-steel-api',
        providerName: 'Bangalore Building Materials Live Index (Mock API)',
        datasetVersion: 'LIVE-2026.09-STREAM',
        effectivePeriod: 'Real-time Live Stream',
        isLive: true,
        lastUpdated: new Date().toISOString(),
        calculationEngineVersion: 'v2.6.0',
        disclaimer: 'Live API stream for spot material commodity prices.',
      };

      getRate(categoryId: string, brandName: string): number {
        if (categoryId === 'steel') return 89500; // Live surge price
        if (categoryId === 'cement') return 480;  // Live cement price
        return rateService.getDefaultProvider().getRate(categoryId, brandName);
      }

      getRateItem(categoryId: string, brandName: string, fallbackRate = 0, fallbackUnit = 'Nos'): RateMasterItem {
        const defaultItem = rateService.getDefaultProvider().getRateItem(categoryId, brandName, fallbackRate, fallbackUnit);
        if (categoryId === 'steel') return { ...defaultItem, rate: 89500, item: brandName, source: 'Bangalore Live Steel Index' };
        if (categoryId === 'cement') return { ...defaultItem, rate: 480, item: brandName, source: 'Karnataka Live Cement Stream' };
        return defaultItem;
      }

      getAllRates(categoryId?: string): RateMasterItem[] {
        return rateService.getDefaultProvider().getAllRates(categoryId);
      }

      getSourceMetadata(): RateSourceMetadata {
        return this.meta;
      }
    }

    // Plug in live provider
    rateService.setProvider(new MockLiveMarketPriceProvider());
    expect(rateService.getSourceMetadata().isLive).toBe(true);
    expect(rateService.getSourceMetadata().datasetVersion).toBe('LIVE-2026.09-STREAM');

    // Run calculator without modifying any formulas!
    const liveResult = runCalculator(BASELINE_HOUSE);
    const liveSteelBOQ = liveResult.boq.find((i) => i.description.includes('TMT'))!;
    expect(liveSteelBOQ).toBeDefined();

    // Steel tonnage MUST remain invariant (same physical structure)
    expect(liveResult.quantities.steelTonnes).toBe(baseResult.quantities.steelTonnes);
    // But unit rate must come from the live provider!
    expect(liveSteelBOQ.unitRate).toBe(89500);
    expect(liveResult.budget.totalProjectCost).toBeGreaterThan(baseResult.budget.totalProjectCost);
    expect(liveResult.rateSourceMetadata?.isLive).toBe(true);

    // Reset back to verified default
    rateService.resetToDefault();
    expect(rateService.getSourceMetadata().isLive).toBe(false);
  });

  // 12. Automated QA Gate verification with electrical checks
  it('12. QA Gate Check 10 enforces Rate Master completeness and electrical schedule mathematical accuracy', () => {
    const validResult = runCalculator(BASELINE_HOUSE);
    const qa = runQAGate(validResult);

    expect(qa.passed).toBe(true);
    const check10 = qa.checks.find((c) => c.id === 'CHECK_RATE_METADATA');
    expect(check10).toBeDefined();
    expect(check10?.passed).toBe(true);

    // If an invalid/corrupted electrical BOQ rate is injected, QA Gate MUST block
    const firstElec = validResult.boq.find((i) => i.category === 'Electrical');
    expect(firstElec).toBeDefined();

    const corruptedResult: CalculationResult = {
      ...validResult,
      boq: validResult.boq.map((item) =>
        item === firstElec ? { ...item, amount: item.amount + 5000 } : item
      ),
    };
    const badQA = runQAGate(corruptedResult);
    expect(badQA.passed).toBe(false);
    expect(badQA.blockingErrors.length).toBeGreaterThan(0);
  });
});
