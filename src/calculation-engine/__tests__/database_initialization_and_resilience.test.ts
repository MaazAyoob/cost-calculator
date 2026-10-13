// ==============================================================================
// Hutty Production Database Initialization, Schema & Resilience Test Suite
// Verifies:
// 1. Prisma schema model inventory and required table definitions.
// 2. Reference seed data definitions (pricing tiers, consultants, canonical parameters).
// 3. Seed idempotency logic and constraint safety.
// 4. Fail-closed production resilience when database is offline.
// 5. Health status contract and persistence transparency.
// ==============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  INITIAL_PRICING_TIERS,
  PRICING_TIER_CODES,
  PRICING_MINOR_UNITS,
} from '../../../server/src/constants/pricing.constants';
import { INITIAL_CONSULTANTS } from '../../../server/src/services/consultation.service';
import {
  CANONICAL_BASELINE_VERSION,
  CANONICAL_CONFIG_PARAMETERS,
} from '../../../server/src/constants/canonicalConfig';
import { PricingService } from '../../../server/src/services/pricing.service';
import fs from 'fs';
import path from 'path';

describe('Production Database Initialization & Resilience Suite', () => {
  describe('1. Schema Inventory & Model Structure', () => {
    it('verifies that schema.prisma declares all required Day-1 tables', () => {
      const schemaPath = path.resolve(__dirname, '../../../server/prisma/schema.prisma');
      expect(fs.existsSync(schemaPath)).toBe(true);

      const schemaContent = fs.readFileSync(schemaPath, 'utf8');

      // Core authentication & project models
      expect(schemaContent).toContain('model User');
      expect(schemaContent).toContain('model Project');
      expect(schemaContent).toContain('model ProjectConfiguration');
      expect(schemaContent).toContain('model CalculationResult');
      expect(schemaContent).toContain('model BOQItem');
      expect(schemaContent).toContain('model MaterialCategory');

      // Pricing & commercial models
      expect(schemaContent).toContain('model PricingTier');
      expect(schemaContent).toContain('model PricingPurchase');
      expect(schemaContent).toContain('model UserEntitlement');
      expect(schemaContent).toContain('model PricingAuditLog');

      // Consultation models
      expect(schemaContent).toContain('model Consultant');
      expect(schemaContent).toContain('model ConsultationRequest');
      expect(schemaContent).toContain('model ConsultationPayment');
      expect(schemaContent).toContain('model ConsultationEvent');

      // Calculation configuration versioning models
      expect(schemaContent).toContain('model CalculationConfigVersion');
      expect(schemaContent).toContain('model CalculationConfigParameter');
      expect(schemaContent).toContain('model CalculationConfigAuditLog');

      // Table mapping directives
      expect(schemaContent).toContain('@@map("pricing_tiers")');
      expect(schemaContent).toContain('@@map("pricing_purchases")');
      expect(schemaContent).toContain('@@map("user_entitlements")');
      expect(schemaContent).toContain('@@map("consultants")');
      expect(schemaContent).toContain('@@map("consultation_requests")');
      expect(schemaContent).toContain('@@map("calculation_config_versions")');
      expect(schemaContent).toContain('@@map("calculation_config_parameters")');
    });

    it('verifies unique constraints preventing duplicate data entry', () => {
      const schemaPath = path.resolve(__dirname, '../../../server/prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');

      // PricingTier code must be unique
      expect(schemaContent).toMatch(/code\s+String\s+@unique/);
      // Consultant slug must be unique
      expect(schemaContent).toMatch(/slug\s+String\s+@unique/);
      // Config parameter composite uniqueness
      expect(schemaContent).toContain('@@unique([versionId, key, location, specificationTier], name: "config_param_unique")');
      // User email must be unique
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
    });
  });

  describe('2. Authoritative Reference Seed Data Integrity', () => {
    it('verifies commercial pricing tiers contain all required tiers with exact integer minor units', () => {
      expect(INITIAL_PRICING_TIERS.length).toBeGreaterThanOrEqual(5);

      const freeTier = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.FREE);
      expect(freeTier).toBeDefined();
      expect(freeTier?.priceMinorUnits).toBe(0);
      expect(freeTier?.purchasable).toBe(false);

      const basicPdfTier = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.BASIC_ESTIMATE_PDF);
      expect(basicPdfTier).toBeDefined();
      expect(basicPdfTier?.priceMinorUnits).toBe(9900); // ₹99.00
      expect(basicPdfTier?.purchasable).toBe(true);

      const detailedTier = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.DETAILED_ESTIMATE_499);
      expect(detailedTier).toBeDefined();
      expect(detailedTier?.priceMinorUnits).toBe(49900); // ₹499.00
      expect(detailedTier?.purchasable).toBe(true);

      const premiumTier = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.PREMIUM_1499);
      expect(premiumTier).toBeDefined();
      expect(premiumTier?.priceMinorUnits).toBe(149900); // ₹1,499.00
      expect(premiumTier?.purchasable).toBe(true);

      const completePackage = INITIAL_PRICING_TIERS.find((t) => t.code === PRICING_TIER_CODES.COMPLETE_PACKAGE);
      // If present in INITIAL_PRICING_TIERS or constant codes, check purchasable is false if price is 0
      if (completePackage) {
        expect(completePackage.purchasable).toBe(false);
      }
    });

    it('verifies expert consultants dataset has valid unique slugs and required fields', () => {
      expect(INITIAL_CONSULTANTS.length).toBeGreaterThanOrEqual(7);

      const slugs = new Set<string>();
      for (const consultant of INITIAL_CONSULTANTS) {
        expect(consultant.slug).toBeTruthy();
        expect(slugs.has(consultant.slug)).toBe(false);
        slugs.add(consultant.slug);

        expect(consultant.name).toBeTruthy();
        expect(consultant.category).toBeTruthy();
        expect(consultant.city).toBe('Bangalore');
        expect(consultant.experienceYears).toBeGreaterThan(0);
        expect(Array.isArray(consultant.specializations)).toBe(true);
        expect(Array.isArray(consultant.services)).toBe(true);
      }
    });

    it('verifies authoritative baseline configuration version v1.0.0 and canonical parameters', () => {
      expect(CANONICAL_BASELINE_VERSION.versionNumber).toBe('v1.0.0');
      expect(CANONICAL_BASELINE_VERSION.status).toBe('ACTIVE');
      expect(CANONICAL_CONFIG_PARAMETERS.length).toBeGreaterThan(10);

      const keys = new Set<string>();
      for (const param of CANONICAL_CONFIG_PARAMETERS) {
        expect(param.key).toBeTruthy();
        expect(param.category).toBeTruthy();
        expect(param.unit).toBeTruthy();
        expect(param.value).toBeDefined();
        keys.add(param.key);
      }

      // Check critical parameters
      expect(keys.has('config.structure.wall_height_ft')).toBe(true);
      expect(keys.has('config.planning.super_bua_multiplier')).toBe(true);
    });
  });

  describe('3. Production Database Failure Handling & Fail-Closed Guards', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('aborts paid purchase initiation with DURABLE_STORAGE_UNAVAILABLE when database is offline in production', async () => {
      process.env.NODE_ENV = 'production';

      const pricingService = new PricingService();
      // Ensure dbConnected is false (as happens when schema/connection is missing)
      (pricingService as any).dbConnected = false;
      (pricingService as any).prisma = null;

      await expect(
        pricingService.initiatePurchase({
          tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
          leadName: 'Naveen Kumar',
          leadPhone: '+91 9845000000',
          leadEmail: 'naveen@example.com',
        })
      ).rejects.toThrow(/DURABLE_STORAGE_UNAVAILABLE/);
    });

    it('health endpoint accurately reflects database persistence status and provides transparency', () => {
      const pricingService = new PricingService();
      (pricingService as any).dbConnected = false;

      const persistence = pricingService.getPersistenceStatus();
      expect(persistence.mode).toBe('IN_MEMORY_TRANSIENT');
      expect(persistence.databaseConnected).toBe(false);
      expect(persistence.persistenceGuaranteed).toBe(false);
      expect(persistence.warning).toContain('In-memory fallback active');

      // When connected
      (pricingService as any).dbConnected = true;
      const connectedPersistence = pricingService.getPersistenceStatus();
      expect(connectedPersistence.mode).toBe('POSTGRESQL_DURABLE');
      expect(connectedPersistence.databaseConnected).toBe(true);
      expect(connectedPersistence.persistenceGuaranteed).toBe(true);
      expect(connectedPersistence.warning).toBeNull();
    });
  });

  describe('4. Server Entrypoint & Deployment Workflow Validation', () => {
    it('verifies that Dockerfile does not execute prisma db push during container startup', () => {
      const dockerfilePath = path.resolve(__dirname, '../../../server/Dockerfile');
      const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');

      // Must NOT run db push in CMD
      expect(dockerfileContent).not.toContain('CMD ["sh", "-c", "npx prisma db push');
      // Must start node directly
      expect(dockerfileContent).toContain('CMD ["node", "dist/index.js"]');
    });

    it('verifies that package.json defines controlled database management scripts', () => {
      const pkgPath = path.resolve(__dirname, '../../../server/package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      expect(pkg.scripts['db:push']).toBe('prisma db push');
      expect(pkg.scripts['db:seed']).toBe('ts-node prisma/seed.ts');
      expect(pkg.scripts['db:check']).toBe('ts-node prisma/checkDb.ts');
      expect(pkg.scripts['db:init']).toBe('prisma db push && ts-node prisma/seed.ts');
      expect(pkg.scripts['db:init:verify']).toBe('ts-node prisma/initAndVerify.ts');

      // Runtime dependency assurance for Render worker/job execution
      expect(pkg.dependencies['ts-node']).toBeDefined();
      expect(pkg.dependencies['typescript']).toBeDefined();
      expect(pkg.dependencies['prisma']).toBeDefined();
    });

    it('verifies initAndVerify script orchestrates push, seed, and diagnostic checks non-destructively', () => {
      const initPath = path.resolve(__dirname, '../../../server/prisma/initAndVerify.ts');
      expect(fs.existsSync(initPath)).toBe(true);
      const initContent = fs.readFileSync(initPath, 'utf8');

      expect(initContent).toContain('npx prisma db push --skip-generate');
      expect(initContent).toContain('runSeed(');
      expect(initContent).toContain('checkDatabase(');
    });

    it('verifies seed script idempotency: handles upsert safely without destructive calls', () => {
      const seedPath = path.resolve(__dirname, '../../../server/prisma/seed.ts');
      const seedContent = fs.readFileSync(seedPath, 'utf8');

      // Must use upsert
      expect(seedContent).toContain('.upsert(');
      // Must not drop or truncate
      expect(seedContent).not.toContain('DROP TABLE');
      expect(seedContent).not.toContain('TRUNCATE');
      expect(seedContent).not.toContain('migrate reset');
    });
  });
});
