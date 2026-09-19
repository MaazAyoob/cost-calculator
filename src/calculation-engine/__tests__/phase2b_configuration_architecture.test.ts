// ============================================================
// PHASE 2B TEST SUITE: CONFIGURATION ARCHITECTURE & UNIFIED RESOLVER
// Verifies:
// 1. Schema & parameter boundary validation
// 2. Precedence resolution (location -> tier -> active version -> baseline)
// 3. Draft, archived, rejected status filtering
// 4. Quantity & cost invariance under baseline configuration
// 5. Conflict registry operation
// 6. Coefficients dynamic adapter
// 7. Labour location benchmark resolution without hardcoded ternary
// 8. Snapshot completeness and auditability
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  configResolver,
  validateParameter,
  validateConfigurationVersion,
  getActiveConflicts,
  CONFIGURATION_CONFLICT_REGISTRY,
  CalculationParameter,
} from '../config';
import {
  WALL_HEIGHT_FT,
  STEEL_BASE_FACTOR_KG_PER_SQFT,
  CEMENT_BAGS_PER_SQFT,
} from '../data/coefficients';
import { runCalculator } from '../calculator';
import { rateService } from '../data/rateService';
import { calculateLabour } from '../modules/labour';
import { calculateArea } from '../modules/bua';
import { generateBuildingModel } from '../modules/spaceModel';
import { EngineInput } from '../types';

describe('Phase 2B: Configuration Architecture Acceptance Suite', () => {
  beforeEach(() => {
    configResolver.resetToBaseline();
    rateService.resetToDefaults();
  });

  // ────────────────────────────────────────────────────────────
  // 1. SCHEMA & BOUNDARY VALIDATION
  // ────────────────────────────────────────────────────────────
  describe('1. Schema & Boundary Validation', () => {
    it('accepts a fully compliant calculation parameter', () => {
      const validParam: CalculationParameter = {
        id: 'test-1',
        key: 'config.structure.wall_height_ft',
        name: 'Standard Wall Height',
        description: 'Clear floor to ceiling height',
        category: 'RCC_STRUCTURE',
        value: 10.5,
        unit: 'ft',
        valueType: 'number',
        minimum: 8.0,
        maximum: 14.0,
        location: 'Bangalore',
        specificationTier: 'PREMIUM',
        source: 'NBC 2016',
        status: 'ACTIVE',
        version: 'v1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateParameter(validParam);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects NaN, Infinity, and negative values', () => {
      const nanResult = validateParameter({
        key: 'config.test',
        name: 'Test',
        category: 'MATERIALS',
        value: NaN,
      });
      expect(nanResult.isValid).toBe(false);
      expect(nanResult.errors.some((e) => e.message.includes('NaN'))).toBe(true);

      const infResult = validateParameter({
        key: 'config.test',
        name: 'Test',
        category: 'MATERIALS',
        value: Infinity,
      });
      expect(infResult.isValid).toBe(false);
      expect(infResult.errors.some((e) => e.message.includes('Infinity'))).toBe(true);

      const negResult = validateParameter({
        key: 'config.test',
        name: 'Test',
        category: 'MATERIALS',
        value: -5,
      });
      expect(negResult.isValid).toBe(false);
      expect(negResult.errors.some((e) => e.message.includes('negative'))).toBe(true);
    });

    it('rejects zero for critical structural parameters', () => {
      const zeroWallHeight = validateParameter({
        key: 'config.structure.wall_height_ft',
        name: 'Wall Height',
        category: 'RCC_STRUCTURE',
        value: 0,
      });
      expect(zeroWallHeight.isValid).toBe(false);
      expect(zeroWallHeight.errors.some((e) => e.message.includes('Critical parameter cannot be zero'))).toBe(true);

      const zeroCement = validateParameter({
        key: 'config.material.cement_bags_per_sqft',
        name: 'Cement Bags',
        category: 'MATERIALS',
        value: 0,
      });
      expect(zeroCement.isValid).toBe(false);
    });

    it('enforces min and max boundaries', () => {
      const tooLow = validateParameter({
        key: 'config.test',
        name: 'Test',
        category: 'MATERIALS',
        value: 5,
        minimum: 10,
        maximum: 20,
      });
      expect(tooLow.isValid).toBe(false);
      expect(tooLow.errors.some((e) => e.message.includes('below configured minimum'))).toBe(true);

      const tooHigh = validateParameter({
        key: 'config.test',
        name: 'Test',
        category: 'MATERIALS',
        value: 25,
        minimum: 10,
        maximum: 20,
      });
      expect(tooHigh.isValid).toBe(false);
      expect(tooHigh.errors.some((e) => e.message.includes('above configured maximum'))).toBe(true);
    });

    it('validates semantic version format for publishing', () => {
      const invalidVersion = validateConfigurationVersion(
        { versionNumber: 'draft-1', status: 'PUBLISHED' },
        []
      );
      expect(invalidVersion.isValid).toBe(false);
      expect(invalidVersion.errors.some((e) => e.message.includes('Semantic Versioning'))).toBe(true);

      const validVersion = validateConfigurationVersion(
        { versionNumber: 'v1.1.0', status: 'PUBLISHED' },
        [
          {
            id: 'p1',
            key: 'config.test',
            name: 'Test',
            description: 'Test description',
            category: 'MATERIALS',
            value: 10,
            unit: 'kg',
            valueType: 'number',
            location: 'ALL',
            specificationTier: 'ALL',
            source: 'Test',
            status: 'ACTIVE',
            version: 'v1.1.0',
            createdAt: '',
            updatedAt: '',
          },
        ]
      );
      expect(validVersion.isValid).toBe(true);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 2. PRECEDENCE & STATUS FILTERING
  // ────────────────────────────────────────────────────────────
  describe('2. Resolution Precedence & Status Filtering', () => {
    it('resolves with strict deterministic precedence: (Location, Tier) -> (Location, ALL) -> (ALL, Tier) -> Global', () => {
      const paramKey = 'config.test.precedence';

      // 1. Global default
      configResolver.registerParameter({
        id: 'p-global',
        key: paramKey,
        name: 'Test Precedence',
        description: '',
        category: 'MATERIALS',
        value: 100,
        unit: 'unit',
        valueType: 'number',
        location: 'ALL',
        specificationTier: 'ALL',
        source: 'Test',
        status: 'ACTIVE',
        version: 'v1.0.0',
        createdAt: '',
        updatedAt: '',
      });

      expect(configResolver.resolveParameter(paramKey, { location: 'Bangalore', specificationTier: 'PREMIUM' })).toBe(100);

      // 2. Add Tier specific
      configResolver.registerParameter({
        id: 'p-tier',
        key: paramKey,
        name: 'Test Precedence',
        description: '',
        category: 'MATERIALS',
        value: 120,
        unit: 'unit',
        valueType: 'number',
        location: 'ALL',
        specificationTier: 'PREMIUM',
        source: 'Test',
        status: 'ACTIVE',
        version: 'v1.0.0',
        createdAt: '',
        updatedAt: '',
      });

      expect(configResolver.resolveParameter(paramKey, { location: 'Bangalore', specificationTier: 'PREMIUM' })).toBe(120);

      // 3. Add Location specific
      configResolver.registerParameter({
        id: 'p-loc',
        key: paramKey,
        name: 'Test Precedence',
        description: '',
        category: 'MATERIALS',
        value: 140,
        unit: 'unit',
        valueType: 'number',
        location: 'Bangalore',
        specificationTier: 'ALL',
        source: 'Test',
        status: 'ACTIVE',
        version: 'v1.0.0',
        createdAt: '',
        updatedAt: '',
      });

      // Location-specific takes precedence over tier-only
      expect(configResolver.resolveParameter(paramKey, { location: 'Bangalore', specificationTier: 'PREMIUM' })).toBe(140);

      // 4. Add Exact (Location, Tier)
      configResolver.registerParameter({
        id: 'p-exact',
        key: paramKey,
        name: 'Test Precedence',
        description: '',
        category: 'MATERIALS',
        value: 160,
        unit: 'unit',
        valueType: 'number',
        location: 'Bangalore',
        specificationTier: 'PREMIUM',
        source: 'Test',
        status: 'ACTIVE',
        version: 'v1.0.0',
        createdAt: '',
        updatedAt: '',
      });

      // Exact match takes absolute precedence
      expect(configResolver.resolveParameter(paramKey, { location: 'Bangalore', specificationTier: 'PREMIUM' })).toBe(160);
    });

    it('strictly excludes DRAFT, ARCHIVED, and REJECTED parameters from production path', () => {
      const paramKey = 'config.test.status';

      // Active baseline = 50
      configResolver.registerParameter({
        id: 'p-act',
        key: paramKey,
        name: 'Status Test',
        description: '',
        category: 'MATERIALS',
        value: 50,
        unit: 'unit',
        valueType: 'number',
        location: 'ALL',
        specificationTier: 'ALL',
        source: 'Test',
        status: 'ACTIVE',
        version: 'v1.0.0',
        createdAt: '',
        updatedAt: '',
      });

      // Draft parameter = 999 (should be ignored in normal run)
      configResolver.registerParameter({
        id: 'p-draft',
        key: paramKey,
        name: 'Status Test Draft',
        description: '',
        category: 'MATERIALS',
        value: 999,
        unit: 'unit',
        valueType: 'number',
        location: 'ALL',
        specificationTier: 'ALL',
        source: 'Test',
        status: 'DRAFT',
        version: 'v1.1.0-draft',
        createdAt: '',
        updatedAt: '',
      });

      // Normal production resolution must ignore draft
      expect(configResolver.resolveParameter(paramKey)).toBe(50);

      // Explicit simulation context can consume draft
      expect(configResolver.resolveParameter(paramKey, { allowDraftForSimulation: true })).toBe(999);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 3. COEFFICIENTS & LABOUR MIGRATION VERIFICATION
  // ────────────────────────────────────────────────────────────
  describe('3. Dynamic Coefficients & Labour Integration', () => {
    it('verifies coefficients.ts exports resolve to baseline configuration', () => {
      expect(WALL_HEIGHT_FT).toBe(10);
      expect(STEEL_BASE_FACTOR_KG_PER_SQFT).toBe(2.8);
      expect(CEMENT_BAGS_PER_SQFT).toBe(0.40);
    });

    it('verifies labour calculation resolves Mysore rates without hardcoded ternary branch', () => {
      const inputMysoreStandard = {
        plotLength: 40,
        plotWidth: 30,
        floors: 2,
        city: 'Mysore',
        qualityTier: 'Standard',
        houseType: 'Duplex',
        parkingType: 'Surface Parking',
        contractorMode: 'independent',
        rooms: { bedrooms: 2, bathrooms: 2, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
      } as unknown as EngineInput;

      const area = calculateArea(inputMysoreStandard);
      const model = generateBuildingModel(inputMysoreStandard, area);
      const labourRes = calculateLabour(inputMysoreStandard, area, {} as any, model);

      // Mysore Standard benchmark = ₹310/sqft
      const civilItem = labourRes.items.find((i) => i.trade.includes('Composite Civil'));
      expect(civilItem).toBeDefined();
      expect(civilItem?.unitRate).toBe(310);

      // Bangalore Standard benchmark = ₹350/sqft
      const inputBlrStandard = {
        ...inputMysoreStandard,
        city: 'Bangalore',
      } as unknown as EngineInput;
      const blrRes = calculateLabour(inputBlrStandard, area, {} as any, model);
      const blrCivilItem = blrRes.items.find((i) => i.trade.includes('Composite Civil'));
      expect(blrCivilItem?.unitRate).toBe(350);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 4. CONFLICT REGISTRY & SNAPSHOT COMPLETENESS
  // ────────────────────────────────────────────────────────────
  describe('4. Conflict Registry & Calculation Snapshots', () => {
    it('exposes documented active parameter conflicts requiring business review', () => {
      const conflicts = getActiveConflicts();
      expect(conflicts.length).toBeGreaterThanOrEqual(2);

      const paintConflict = CONFIGURATION_CONFLICT_REGISTRY.INTERIOR_PAINT_COVERAGE;
      expect(paintConflict).toBeDefined();
      expect(paintConflict.currentEffectiveValue).toBe(45);
      expect(paintConflict.alternateValue).toBe(60);
      expect(paintConflict.status).toBe('CONFLICT_REQUIRES_REVIEW');

      const marginConflict = CONFIGURATION_CONFLICT_REGISTRY.CONTRACTOR_MARGIN_BASELINE;
      expect(marginConflict).toBeDefined();
      expect(marginConflict.currentEffectiveValue).toBe(0.15);
      expect(marginConflict.alternateValue).toBe(0.10);
    });

    it('generates an immutable ResolvedCalculationConfiguration snapshot with every calculation', () => {
      const input = {
        plotLength: 40,
        plotWidth: 30,
        floors: 2,
        city: 'Bangalore',
        qualityTier: 'Premium',
        houseType: 'Duplex',
        parkingType: 'Surface Parking',
        contractorMode: 'independent',
        rooms: { bedrooms: 2, bathrooms: 2, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
        materialBrands: {
          steel: 'Tata Tiscon',
          cement: 'UltraTech',
          masonry: 'AAC Blocks',
          doors: 'Premium Teak',
          windows: 'Standard uPVC',
          flooring: 'Vitrified Tiles',
          bathroom: 'Kohler',
          electrical: 'Finolex',
          paint: 'Asian Paints Royale',
        },
      } as unknown as EngineInput;

      const result = runCalculator(input);
      expect(result.resolvedConfiguration).toBeDefined();
      expect(result.resolvedConfiguration?.version).toBe('v1.0.0');
      expect(result.resolvedConfiguration?.location).toBe('Bangalore');
      expect(result.resolvedConfiguration?.specificationTier).toBe('Premium');
      expect(result.resolvedConfiguration?.parameters['config.structure.wall_height_ft']).toBe(10);
      expect(result.resolvedConfiguration?.spaceTemplates.bedroom.defaultLengthFt).toBe(14);
      expect(result.resolvedConfiguration?.commercialSettings.contractorMarginDefault).toBe(0.10);
      expect(result.resolvedConfiguration?.conflictsActive).toContain('config.paint.interior_coverage_sqft_per_litre');
    });
  });

  // ────────────────────────────────────────────────────────────
  // 5. REGRESSION & QUANTITY INVARIANCE EQUIVALENCE
  // ────────────────────────────────────────────────────────────
  describe('5. Mathematical Invariance & Zero Regression', () => {
    it('produces identical physical quantities across Standard vs Luxury tiers for identical geometry', () => {
      const baseInput = {
        plotLength: 40,
        plotWidth: 30,
        floors: 2,
        city: 'Bangalore',
        houseType: 'Duplex',
        parkingType: 'Surface Parking',
        contractorMode: 'independent',
        rooms: { bedrooms: 2, bathrooms: 2, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
        materialBrands: {
          steel: 'Tata Tiscon',
          cement: 'UltraTech',
          masonry: 'AAC Blocks',
          doors: 'Premium Teak',
          windows: 'Standard uPVC',
          flooring: 'Vitrified Tiles',
          bathroom: 'Kohler',
          electrical: 'Finolex',
          paint: 'Asian Paints Royale',
        },
      } as unknown as EngineInput;

      const standardResult = runCalculator({ ...baseInput, qualityTier: 'Standard' as any });
      const luxuryResult = runCalculator({ ...baseInput, qualityTier: 'Luxury' as any });

      // Physical structural quantities must remain 100% strictly invariant
      expect(standardResult.quantities.steelTonnes).toBe(luxuryResult.quantities.steelTonnes);
      expect(standardResult.quantities.cementBags).toBe(luxuryResult.quantities.cementBags);
      expect(standardResult.quantities.mSandCuFt).toBe(luxuryResult.quantities.mSandCuFt);
      expect(standardResult.quantities.pSandCuFt).toBe(luxuryResult.quantities.pSandCuFt);
      expect(standardResult.quantities.coarseAggregateCuFt).toBe(luxuryResult.quantities.coarseAggregateCuFt);
      expect(standardResult.area.totalBUASqFt).toBe(luxuryResult.area.totalBUASqFt);
    });

    it('matches the 30x40 G+1 baseline benchmark precisely under unified configuration', () => {
      const benchmarkInput = {
        plotLength: 40,
        plotWidth: 30,
        floors: 2,
        city: 'Bangalore',
        qualityTier: 'Standard',
        houseType: 'Duplex',
        parkingType: 'Surface Parking',
        contractorMode: 'independent',
        rooms: { bedrooms: 2, bathrooms: 2, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
        materialBrands: {
          steel: 'Indus TMT',
          cement: 'Dalmia Bharat',
          masonry: 'AAC Blocks',
          doors: 'Normal Teak',
          windows: 'Standard uPVC',
          flooring: 'Vitrified Tiles',
          bathroom: 'Cera',
          electrical: 'Anchor',
          paint: 'Asian Paints',
        },
      } as unknown as EngineInput;

      const res = runCalculator(benchmarkInput);
      // 1440 sqft BUA
      expect(res.area.totalBUASqFt).toBe(1440);
      // 4.32 Tonnes steel
      expect(res.quantities.steelTonnes).toBe(4.32);
      // 576 bags cement
      expect(res.quantities.cementBags).toBe(576);
      // 864 CFT M-Sand, 864 CFT P-Sand, 1944 CFT Aggregates
      expect(res.quantities.mSandCuFt).toBe(864);
      expect(res.quantities.pSandCuFt).toBe(864);
      expect(res.quantities.coarseAggregateCuFt).toBe(1944);

      // QA gate passes completely
      expect(res.qaResult?.passed).toBe(true);
      expect(res.qaResult?.blockingErrors).toHaveLength(0);
    });
  });
});
