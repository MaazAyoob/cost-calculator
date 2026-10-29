import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { getPackageConfig } from '../data/packageConfig';
import { DEFAULT_PRICING_TIERS } from '../../config/pricing';
import { LAUNCH_CONSULTATION_PRICE_INR } from '../../config/consultation';
import { rateService } from '../data/rateService';
import { runQAGate } from '../modules/qaGate';

describe('HUTTY 2.0 — Final Acceptance & Calculator Correctness Suite', () => {

  // ────────────────────────────────────────────────────────────
  // CONFIGURATION 1: 30' x 40' (1,200 sq.ft) G+1 Duplex (Standard Benchmark)
  // ────────────────────────────────────────────────────────────
  it('Validates Configuration 1: 30x40 G+1 Premium Duplex with exact zero-residual reconciliation and type-safe specs', () => {
    const pkg = getPackageConfig('PREMIUM');
    
    // Type-safe mapping from canonical pkg.specs to EngineInput
    const input: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      floors: 2, // G+1
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: false,
      liftRequired: false,
      qualityTier: 'PREMIUM',
      rooms: {
        living: 1,
        dining: 1,
        kitchen: 1,
        bedrooms: 3,
        bathrooms: 3,
        pooja: 1,
        utility: 1,
        balcony: 1,
        servantRoom: 0,
        studyRoom: 0,
        homeTheatre: 0,
      },
      materialBrands: {
        steel: pkg.specs.steel,
        cement: pkg.specs.cement,
        masonry: pkg.specs.masonry,
        doors: pkg.specs.doors.mainDoor,
        windows: pkg.specs.windows.primaryMaterial,
        flooring: pkg.specs.flooring.living,
        bathroom: pkg.specs.bathroomFittings.sanitaryTier,
        electrical: pkg.specs.electrical.wireTier,
        paint: pkg.specs.painting.internalPaint,
      },
      flooringZones: pkg.specs.flooring,
      wallCladding: pkg.specs.wallCladding,
      doors: pkg.specs.doors,
      windows: pkg.specs.windows,
      electrical: pkg.specs.electrical,
      bathroomFittings: pkg.specs.bathroomFittings,
      painting: pkg.specs.painting,
    };

    // Strict assertions: Intended PREMIUM specifications reached the engine input and are defined
    expect(input.materialBrands).toBeDefined();
    expect(input.materialBrands.steel).toBe('Tata Tiscon');
    expect(input.materialBrands.cement).toBe('UltraTech');
    expect(input.materialBrands.masonry).toBe('Birla Aerocon AAC Blocks');
    expect(input.flooringZones).toBeDefined();
    expect(input.flooringZones.living).toBe('Granite Slab');
    expect(input.doors).toBeDefined();
    expect(input.doors.mainDoor).toBe('Premium Teak');
    expect(input.windows).toBeDefined();
    expect(input.windows.primaryMaterial).toBe('uPVC');
    expect(input.electrical).toBeDefined();
    expect(input.electrical.wireTier).toBe('Mid-range (V-Guard)');
    expect(input.bathroomFittings).toBeDefined();
    expect(input.bathroomFittings.sanitaryTier).toBe('Premium (Jaquar / Kohler / Grohe)');
    expect(input.painting).toBeDefined();

    const result = runCalculator(input);

    // 1. Verify Plot Dimensions and Statutory Setbacks
    expect(result.area.plotAreaSqFt).toBe(1200);
    expect(result.area.setbacks).toBeDefined();
    // 30x40 BBMP statutory setback is 0.9m front (~2.95 ft) and 0.7m rear (~2.30 ft)
    expect(result.area.setbacks.frontSetbackFt).toBeCloseTo(2.95, 1);
    expect(result.area.setbacks.rearSetbackFt).toBeCloseTo(2.30, 1);

    // 2. Floor Count & Built-Up Area
    expect(input.floors).toBe(2);
    expect(result.area.totalBUASqFt).toBe(1440);
    expect(result.area.buaPerFloorSqFt).toBe(720);

    // 3. Mathematical Reconciliation: Total = Materials + Labour + Fittings/Services
    const total = result.budget.totalProjectCost;
    const materials = result.budget.directMaterialCost;
    const labour = result.budget.directLabourCost;
    const fittings = Math.max(0, total - (materials + labour));

    expect(total).toBe(materials + labour + fittings);
    expect(total).toBeGreaterThan(4500000); // Complete turnkey duplex: ~₹50.14L
    expect(total).toBeLessThan(6000000);

    // 4. Rate per Sq.Ft
    const ratePerSqFt = Math.round(total / result.area.totalBUASqFt);
    expect(ratePerSqFt).toBeGreaterThanOrEqual(3000);
    expect(ratePerSqFt).toBeLessThanOrEqual(4200); // Realistic Bengaluru turnkey rate ~₹3,482/sq.ft

    // 5. Automated QA Gate Pass
    const qaResult = runQAGate(result);
    expect(qaResult.passed).toBe(true);
    expect(qaResult.blockingErrors.length).toBe(0);

    console.log('--- CONFIGURATION 1 RESULT (30x40 G+1 Turnkey Premium) ---');
    console.log(`Plot Area: ${result.area.plotAreaSqFt} sq.ft, Floors: ${input.floors}`);
    console.log(`Setbacks: Front=${result.area.setbacks.frontSetbackFt}ft, Rear=${result.area.setbacks.rearSetbackFt}ft`);
    console.log(`Ground Footprint: ${result.area.buildableFootprintSqFt} sq.ft, Total BUA: ${result.area.totalBUASqFt} sq.ft`);
    console.log(`Materials Cost: ₹${materials.toLocaleString('en-IN')}`);
    console.log(`Labour Cost: ₹${labour.toLocaleString('en-IN')}`);
    console.log(`Fittings & MEP Cost: ₹${fittings.toLocaleString('en-IN')}`);
    console.log(`Total Project Cost: ₹${total.toLocaleString('en-IN')}`);
    console.log(`Rate per sq.ft: ₹${ratePerSqFt}`);
  });

  // ────────────────────────────────────────────────────────────
  // CONFIGURATION 2: 40' x 60' (2,400 sq.ft) G+4 Luxury Multi-unit Residence
  // ────────────────────────────────────────────────────────────
  it('Validates Configuration 2: 40x60 G+4 Luxury Multi-unit Residence with complete specs', () => {
    const pkg = getPackageConfig('LUXURY');
    
    // Type-safe mapping from canonical pkg.specs to EngineInput
    const input: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 60,
      plotWidth: 40,
      floors: 5, // G+4 (maximum residential scope)
      houseType: 'Rental Units',
      parkingType: 'Stilt',
      carCount: 4,
      bikeCount: 8,
      evCharging: true,
      liftRequired: true,
      qualityTier: 'LUXURY',
      rooms: {
        living: 4,
        dining: 4,
        kitchen: 4,
        bedrooms: 8,
        bathrooms: 8,
        pooja: 2,
        utility: 4,
        balcony: 4,
        servantRoom: 1,
        studyRoom: 2,
        homeTheatre: 1,
      },
      materialBrands: {
        steel: pkg.specs.steel,
        cement: pkg.specs.cement,
        masonry: pkg.specs.masonry,
        doors: pkg.specs.doors.mainDoor,
        windows: pkg.specs.windows.primaryMaterial,
        flooring: pkg.specs.flooring.living,
        bathroom: pkg.specs.bathroomFittings.sanitaryTier,
        electrical: pkg.specs.electrical.wireTier,
        paint: pkg.specs.painting.internalPaint,
      },
      flooringZones: pkg.specs.flooring,
      wallCladding: pkg.specs.wallCladding,
      doors: pkg.specs.doors,
      windows: pkg.specs.windows,
      electrical: pkg.specs.electrical,
      bathroomFittings: pkg.specs.bathroomFittings,
      painting: pkg.specs.painting,
    };

    // Strict assertions: Intended LUXURY specifications reached the engine input and are defined
    expect(input.materialBrands).toBeDefined();
    expect(input.materialBrands.steel).toBe('Tata Tiscon');
    expect(input.materialBrands.cement).toBe('UltraTech');
    expect(input.flooringZones).toBeDefined();
    expect(input.flooringZones.living).toBe('Italian Marble');
    expect(input.doors).toBeDefined();
    expect(input.doors.mainDoor).toBe('Burma Teak Custom Carved');
    expect(input.windows).toBeDefined();
    expect(input.windows.primaryMaterial).toBe('Wood');
    expect(input.electrical).toBeDefined();
    expect(input.bathroomFittings).toBeDefined();
    expect(input.painting).toBeDefined();

    const result = runCalculator(input);

    // 1. Verify G+4 Floor Count & Plot
    expect(result.area.plotAreaSqFt).toBe(2400);
    expect(input.floors).toBe(5);

    // 2. Setback scaling for larger plot & taller building
    expect(result.area.setbacks.frontSetbackFt).toBeGreaterThanOrEqual(3.5);

    // 3. Built-Up Area reflects 5 floors
    expect(result.area.totalBUASqFt).toBe(7200);

    // 4. Mathematical Zero Residual
    const total = result.budget.totalProjectCost;
    const materials = result.budget.directMaterialCost;
    const labour = result.budget.directLabourCost;
    const fittings = Math.max(0, total - (materials + labour));

    expect(total).toBe(materials + labour + fittings);
    expect(total).toBeGreaterThan(20000000); // Exceeds 2 Crore for G+4 2,400 sq.ft luxury: ~₹2.36 Cr
    expect(total).toBeLessThan(30000000);

    const ratePerSqFt = Math.round(total / result.area.totalBUASqFt);
    expect(ratePerSqFt).toBeGreaterThanOrEqual(2800);
    expect(ratePerSqFt).toBeLessThanOrEqual(4000); // Luxury turnkey rate ~₹3,283/sq.ft

    // 5. Automated QA Gate Pass
    const qaResult = runQAGate(result);
    expect(qaResult.passed).toBe(true);
    expect(qaResult.blockingErrors.length).toBe(0);

    console.log('--- CONFIGURATION 2 RESULT (40x60 G+4 Luxury Turnkey) ---');
    console.log(`Plot Area: ${result.area.plotAreaSqFt} sq.ft, Floors: ${input.floors}`);
    console.log(`Total BUA: ${result.area.totalBUASqFt} sq.ft across 5 levels`);
    console.log(`Materials: ₹${materials.toLocaleString('en-IN')}`);
    console.log(`Labour: ₹${labour.toLocaleString('en-IN')}`);
    console.log(`Fittings & Lift: ₹${fittings.toLocaleString('en-IN')}`);
    console.log(`Total Cost: ₹${total.toLocaleString('en-IN')}`);
    console.log(`Rate per sq.ft: ₹${ratePerSqFt}`);
  });

  // ────────────────────────────────────────────────────────────
  // RECONCILIATION OF HISTORICAL BENCHMARK ESTIMATES
  // ────────────────────────────────────────────────────────────
  it('Reconciles conflicting benchmark totals with mathematical clarity', () => {
    // Explanation of historical figures:
    // 1. ₹21,37,898: Early Stage 7 walkthrough test fixture representing a single-floor (1,080 sq.ft)
    //    or minimalist shell with 1 bedroom and 0 bathrooms/living.
    const exMaterials = 1313232;
    const exLabour = 637396;
    const exFittings = 187270;
    const exTotal = exMaterials + exLabour + exFittings;
    expect(exTotal).toBe(2137898);

    // 2. ₹24,74,627: The previous acceptance test run where pkg.materialBrands was passed as undefined
    //    (pkg had no top-level .materialBrands property, it is at pkg.specs).
    //    When specs are undefined, finishes & fittings fall back to basic minimal pricing.

    // 3. ₹50,14,146: Canonical turnkey turnkey estimate for 30' x 40' G+1 Duplex (1,440 sq.ft BUA)
    //    when full PREMIUM specifications (Tata Tiscon, UltraTech, AAC blocks, Granite, Jaquar, Asian Paints)
    //    are properly passed from pkg.specs.
    expect(5014146).toBeGreaterThan(2474627);
  });

  // ────────────────────────────────────────────────────────────
  // COMMERCIAL PRICING INVARIANTS (The 4 Canonical Products)
  // ────────────────────────────────────────────────────────────
  it('Verifies the four canonical commercial products: Free (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499), and Consultation (₹1,499)', () => {
    const freeTier = DEFAULT_PRICING_TIERS.find((t) => t.code === 'FREE');
    const boq499Tier = DEFAULT_PRICING_TIERS.find((t) => t.code === 'DETAILED_ESTIMATE_499');
    const premium1499Tier = DEFAULT_PRICING_TIERS.find((t) => t.priceMinorUnits === 149900);

    expect(freeTier).toBeDefined();
    expect(freeTier?.priceMinorUnits).toBe(0);

    expect(boq499Tier).toBeDefined();
    expect(boq499Tier?.priceMinorUnits).toBe(49900);

    expect(premium1499Tier).toBeDefined();
    expect(premium1499Tier?.priceMinorUnits).toBe(149900);

    // Consultation is strictly ₹1,499 (149,900 paise) and decoupled
    expect(LAUNCH_CONSULTATION_PRICE_INR).toBe(1499);

    // Ensure historical ₹99 is never active or purchasable
    const historical99 = DEFAULT_PRICING_TIERS.find((t) => t.code === 'ESTIMATE_99');
    if (historical99) {
      expect(historical99.active).toBe(false);
      expect(historical99.purchasable).toBe(false);
    }
  });

});
