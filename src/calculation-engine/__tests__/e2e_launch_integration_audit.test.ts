import { describe, it, expect, beforeEach } from 'vitest';
import { consultationService } from '../../../server/src/services/consultation.service';
import { configVersionService } from '../../../server/src/services/configVersion.service';
import { projectService } from '../../../server/src/services/project.service';
import { rateService } from '../data/rateService';
import { configResolver } from '../config/configurationResolver';
import { runCalculator } from '../calculator';
import type { EngineInput } from '../types';
import { DEFAULT_PRICING_TIERS } from '../../config/pricing';
import { CONSULTATION_PRICE_INR } from '../../../server/src/constants/consultation.constants';

describe('HUTTY E2E Integration Audit & Launch Readiness Test Suite', () => {
  const sampleInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP',
    plotLength: 30,
    plotWidth: 40,
    roadWidthFt: 30,
    builtUpAreaPerFloor: 1200,
    houseType: 'Duplex',
    floors: 2,
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
      balcony: 1,
      office: 0,
      pooja: 1,
      utility: 1,
      storeRoom: 0,
      commonToilets: 0,
    },
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
    },
    qualityTier: 'Premium',
  };

  beforeEach(() => {
    configResolver.resetToBaseline();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST A: Consultant Lifecycle & Synchronization
  // ══════════════════════════════════════════════════════════════════════════
  describe('Test A: Consultant Lifecycle & Admin-Public Synchronization', () => {
    it('persists admin updates and immediately reflects changes in public listing & slug queries', async () => {
      // 1. Get initial active consultants
      const initialConsultants = await consultationService.getActiveConsultants();
      expect(initialConsultants.length).toBeGreaterThan(0);
      const testConsultant = initialConsultants[0];
      const consultantId = testConsultant.id;
      const originalDescription = testConsultant.description;

      // 2. Admin edits consultant description
      const updatedDescription = `Audit Verified Update ${Date.now()}: Specialized in green architecture`;
      const updateResult = await consultationService.updateConsultantAdmin(consultantId, {
        description: updatedDescription,
      });
      expect(updateResult).not.toBeNull();
      expect(updateResult?.description).toBe(updatedDescription);

      // 3. Confirm public directory listing immediately reflects the change
      const publicList = await consultationService.getActiveConsultants();
      const updatedInList = publicList.find((c) => c.id === consultantId);
      expect(updatedInList).toBeDefined();
      expect(updatedInList?.description).toBe(updatedDescription);

      // 4. Confirm public slug query returns updated description
      const publicBySlug = await consultationService.getConsultantBySlug(testConsultant.slug);
      expect(publicBySlug).not.toBeNull();
      expect(publicBySlug?.description).toBe(updatedDescription);

      // 5. Deactivation removes consultant from public directory
      const deactivated = await consultationService.setConsultantActiveStatus(consultantId, false);
      expect(deactivated?.active).toBe(false);

      const publicListAfterDeactivation = await consultationService.getActiveConsultants();
      expect(publicListAfterDeactivation.some((c) => c.id === consultantId)).toBe(false);

      // Slug query should return null/404 for inactive consultant
      const publicSlugAfterDeactivation = await consultationService.getConsultantBySlug(testConsultant.slug);
      expect(publicSlugAfterDeactivation).toBeNull();

      // 6. Reactivate consultant and restore original description
      await consultationService.setConsultantActiveStatus(consultantId, true);
      await consultationService.updateConsultantAdmin(consultantId, {
        description: originalDescription,
      });

      const restoredList = await consultationService.getActiveConsultants();
      expect(restoredList.some((c) => c.id === consultantId)).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST B: Calculator Configuration Draft, Publish & Canonical Invariance
  // ══════════════════════════════════════════════════════════════════════════
  describe('Test B: Calculator Configuration Lifecycle & Engine Propagation', () => {
    it('isolates drafts from live calculations and applies active configuration upon publish', async () => {
      // 1. Baseline calculation
      const baselineResult = runCalculator(sampleInput);
      const baselineTotal = baselineResult.budget.directConstructionBudget;

      // 2. Admin creates draft
      const draft = await configVersionService.createDraftVersion({
        versionNumber: `v2.audit-${Date.now()}`,
        description: 'Audit Test Draft Version',
        changeNote: 'Adjusting structural steel multiplier',
        adminEmail: 'admin@hutty.in',
      });
      expect(draft.id).toBeDefined();
      expect(draft.status).toBe('DRAFT');

      // 3. Update draft parameter (e.g. steel kg per sqft 3.25 -> 4.50)
      await configVersionService.updateDraft(draft.id, {
        changeNote: 'Update steel parameter in draft',
        adminEmail: 'admin@hutty.in',
        parameters: [
          {
            key: 'material.steel.consumption_kg_per_sqft',
            value: 4.5,
          },
        ],
      });

      // 4. Verify draft did NOT affect customer live calculation (Active Invariance)
      const duringDraftResult = runCalculator(sampleInput);
      expect(duringDraftResult.budget.directConstructionBudget).toBe(baselineTotal);

      // 5. Validate draft
      const validation = await configVersionService.validateVersion(draft.id);
      expect(validation.isValid).toBe(true);

      // 6. Publish version
      const publishResult = await configVersionService.publishVersion(draft.id, 'admin@hutty.in');
      expect(publishResult.success).toBe(true);
      expect(publishResult.version?.status).toBe('ACTIVE');

      // 7. Sync active configuration with canonical engine resolver
      const activeBackendConfig = await configVersionService.getActiveVersion();
      expect(activeBackendConfig).not.toBeNull();
      configResolver.syncActiveConfiguration(activeBackendConfig);

      // 8. Re-run calculator: result MUST reflect the updated active configuration
      const publishedResult = runCalculator(sampleInput);
      expect(publishedResult.quantities.steelKg).toBeGreaterThan(
        baselineResult.quantities.steelKg
      );

      // 9. Reset to baseline configuration
      configResolver.resetToBaseline();
      const resetResult = runCalculator(sampleInput);
      expect(resetResult.budget.directConstructionBudget).toBe(baselineTotal);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST C: Customer Project Persistence & Security Isolation
  // ══════════════════════════════════════════════════════════════════════════
  describe('Test C: Customer Project Persistence & Security Isolation', () => {
    it('isolates projects between customer accounts and enforces ownership', async () => {
      // 1. Create project for Customer A
      const projectA = await projectService.saveProject({
        userId: 'usr-customer-alpha-001',
        title: 'Alpha Residence Whitefield',
        city: 'Bangalore',
        plotLength: 30,
        plotWidth: 40,
        builtUpArea: 2400,
        packageType: 'PREMIUM',
        status: 'ACTIVE',
      });

      expect(projectA.id).toBeDefined();
      expect(projectA.userId).toBe('usr-customer-alpha-001');

      // 2. Query project as Customer A (Owner)
      const foundA = await projectService.getProjectById(projectA.id);
      expect(foundA).not.toBeNull();
      expect(foundA?.title).toBe('Alpha Residence Whitefield');

      // 3. Verify user isolation: Customer B projects list must NOT contain Customer A's project
      const customerBProjects = await projectService.listProjectsByUser('usr-customer-beta-002');
      expect(customerBProjects.some((p) => p.id === projectA.id)).toBe(false);

      // Customer A projects list MUST contain Customer A's project
      const customerAProjects = await projectService.listProjectsByUser('usr-customer-alpha-001');
      expect(customerAProjects.some((p) => p.id === projectA.id)).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST D: Approved Prices & Entitlements Non-Negotiable Verification
  // ══════════════════════════════════════════════════════════════════════════
  describe('Test D: Approved Prices & Commercial Integrity Verification', () => {
    it('strictly preserves the client-approved pricing tiers and services', () => {
      // 1. Free Estimate — ₹0
      const freeTier = DEFAULT_PRICING_TIERS.find((p) => p.code === 'FREE');
      expect(freeTier).toBeDefined();
      expect(freeTier?.priceMinorUnits).toBe(0);

      // 2. Optional Basic PDF download — ₹99 (9,900 paise)
      const pdfTier = DEFAULT_PRICING_TIERS.find((p) => p.code === 'BASIC_ESTIMATE_PDF');
      expect(pdfTier).toBeDefined();
      expect(pdfTier?.priceMinorUnits).toBe(9900);

      // 3. Detailed BOQ — ₹499 (49,900 paise)
      const boqTier = DEFAULT_PRICING_TIERS.find((p) => p.code === 'DETAILED_ESTIMATE_499');
      expect(boqTier).toBeDefined();
      expect(boqTier?.priceMinorUnits).toBe(49900);

      // 4. Premium BOQ — ₹1,499 (149,900 paise)
      const premiumTier = DEFAULT_PRICING_TIERS.find((p) => p.code === 'PREMIUM_1499');
      expect(premiumTier).toBeDefined();
      expect(premiumTier?.priceMinorUnits).toBe(149900);

      // 5. Consult an Expert — ₹1,499 (Separate service)
      expect(CONSULTATION_PRICE_INR).toBe(1499);
    });
  });
});
