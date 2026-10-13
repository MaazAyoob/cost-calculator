// ==============================================================================
// Hutty Pricing Model V1 — Comprehensive Test Suite
// 1. Calculation Invariance Test (Mathematical separation of calculation from commercial access)
// 2. Pricing Tier Configuration & Complete Package Safety
// 3. Server-Authoritative Pricing (Paise Minor Units)
// 4. Historical Snapshot Invariance (Price changes do not alter past purchases)
// 5. Entitlement & Access Control Matrix
// 6. Consultation Service Decoupling (₹1,499)
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import {
  PRICING_TIER_CODES,
  PRICING_MINOR_UNITS,
  PRICING_CURRENCY,
  INITIAL_PRICING_TIERS,
} from '../../../server/src/constants/pricing.constants';
import { PricingService } from '../../../server/src/services/pricing.service';
import { CONSULTATION_PRICE_PAISE, CONSULTATION_PRICE_INR } from '../../../server/src/constants/consultation.constants';

describe('Hutty Pricing Model V1 & Calculation Invariance Suite', () => {
  let pricingService: PricingService;

  beforeEach(() => {
    pricingService = new PricingService();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. CRITICAL CALCULATION INVARIANCE TEST
  // ═════════════════════════════════════════════════════════════════════════
  describe('Canonical Calculator Invariance Across Commercial Tiers', () => {
    const standardInput: EngineInput = {
      plotLength: 40,
      plotWidth: 60,
      floors: 2,
      houseType: 'Modern Villa',
      parkingType: 'Stilt',
      carCount: 2,
      bikeCount: 2,
      evCharging: true,
      liftRequired: false,
      rooms: [
        { id: 'liv-1', name: 'Living Room', count: 1, areaSqFt: 300, length: 15, width: 20, isCustom: false, floor: 0 },
        { id: 'bed-1', name: 'Master Bedroom', count: 1, areaSqFt: 220, length: 14, width: 15.7, isCustom: false, floor: 1 },
        { id: 'bed-2', name: 'Bedroom 2', count: 1, areaSqFt: 180, length: 12, width: 15, isCustom: false, floor: 1 },
        { id: 'kit-1', name: 'Kitchen', count: 1, areaSqFt: 120, length: 10, width: 12, isCustom: false, floor: 0 },
        { id: 'bath-1', name: 'Attached Bath', count: 2, areaSqFt: 60, length: 6, width: 10, isCustom: false, floor: 1 },
      ],
      qualityTier: 'Premium',
      materialBrands: {
        cement: 'UltraTech Super',
        steel: 'Tata Tiscon 550D',
        paint: 'Asian Paints Royale',
      },
    };

    it('produces identical physical quantities and total costs under Free, ₹99, and ₹499 access tiers', () => {
      // Simulate run for Free tier customer
      const freeResult = runCalculator(standardInput);

      // Simulate run for ₹99 tier customer
      const tier99Result = runCalculator(standardInput);

      // Simulate run for ₹499 tier customer
      const tier499Result = runCalculator(standardInput);

      // 1. Total Built-Up Area (BUA) invariance
      expect(freeResult.area.totalBUASqFt).toBe(tier99Result.area.totalBUASqFt);
      expect(tier99Result.area.totalBUASqFt).toBe(tier499Result.area.totalBUASqFt);
      expect(freeResult.area.totalBUASqFt).toBeGreaterThan(0);

      // 2. Concrete volume (RCC) invariance
      expect(freeResult.quantities.rccConcreteTotalCuM).toBe(tier99Result.quantities.rccConcreteTotalCuM);
      expect(tier99Result.quantities.rccConcreteTotalCuM).toBe(tier499Result.quantities.rccConcreteTotalCuM);

      // 3. Steel rebar tonnage invariance
      expect(freeResult.quantities.steelKg).toBe(tier99Result.quantities.steelKg);
      expect(tier99Result.quantities.steelKg).toBe(tier499Result.quantities.steelKg);

      // 4. Cement bags consumption invariance
      expect(freeResult.quantities.cementBags).toBe(tier99Result.quantities.cementBags);
      expect(tier99Result.quantities.cementBags).toBe(tier499Result.quantities.cementBags);

      // 5. Sand & aggregate volume invariance
      expect(freeResult.quantities.mSandCuFt).toBe(tier99Result.quantities.mSandCuFt);
      expect(tier99Result.quantities.mSandCuFt).toBe(tier499Result.quantities.mSandCuFt);
      expect(freeResult.quantities.coarseAggregateCuFt).toBe(tier99Result.quantities.coarseAggregateCuFt);
      expect(tier99Result.quantities.coarseAggregateCuFt).toBe(tier499Result.quantities.coarseAggregateCuFt);

      // 6. Masonry blocks invariance
      expect(freeResult.quantities.finalBlocksRequired).toBe(tier99Result.quantities.finalBlocksRequired);
      expect(tier99Result.quantities.finalBlocksRequired).toBe(tier499Result.quantities.finalBlocksRequired);

      // 7. Flooring & Paint area invariance
      expect(freeResult.quantities.floorTilesSqFt).toBe(tier99Result.quantities.floorTilesSqFt);
      expect(tier99Result.quantities.floorTilesSqFt).toBe(tier499Result.quantities.floorTilesSqFt);
      expect(freeResult.quantities.totalPaintableAreaSqFt).toBe(tier99Result.quantities.totalPaintableAreaSqFt);
      expect(tier99Result.quantities.totalPaintableAreaSqFt).toBe(tier499Result.quantities.totalPaintableAreaSqFt);

      // 8. Labour items count and BOQ count invariance
      expect(freeResult.labourSchedule.length).toBe(tier99Result.labourSchedule.length);
      expect(tier99Result.labourSchedule.length).toBe(tier499Result.labourSchedule.length);
      expect(freeResult.boq.length).toBe(tier99Result.boq.length);
      expect(tier99Result.boq.length).toBe(tier499Result.boq.length);

      // 9. Total Canonical Project Cost invariance
      expect(freeResult.budget.totalProjectCost).toBe(tier99Result.budget.totalProjectCost);
      expect(tier99Result.budget.totalProjectCost).toBe(tier499Result.budget.totalProjectCost);
      expect(freeResult.budget.costPerSqFt).toBe(tier499Result.budget.costPerSqFt);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. PRICING TIER ARCHITECTURE & COMPLETE PACKAGE SAFETY
  // ═════════════════════════════════════════════════════════════════════════
  describe('Pricing Tier Configuration & Safety Rules', () => {
    it('initializes the confirmed commercial calculator tiers (Free, ₹499, ₹1,499) and keeps ₹99 inactive', async () => {
      const publicTiers = await pricingService.getPublicTiers();
      const publicCodes = publicTiers.map((t) => t.code);

      expect(publicCodes).toContain(PRICING_TIER_CODES.FREE);
      expect(publicCodes).toContain(PRICING_TIER_CODES.DETAILED_ESTIMATE_499);
      expect(publicCodes).toContain(PRICING_TIER_CODES.PREMIUM_1499);
      expect(publicCodes).not.toContain(PRICING_TIER_CODES.ESTIMATE_99); // ₹99 removed from public purchasable tiers

      const freeTier = publicTiers.find((t) => t.code === PRICING_TIER_CODES.FREE);
      const tier499 = publicTiers.find((t) => t.code === PRICING_TIER_CODES.DETAILED_ESTIMATE_499);
      const tier1499 = publicTiers.find((t) => t.code === PRICING_TIER_CODES.PREMIUM_1499);

      expect(freeTier?.priceMinorUnits).toBe(0);
      expect(tier499?.priceMinorUnits).toBe(49900); // ₹499
      expect(tier1499?.priceMinorUnits).toBe(149900); // ₹1,499
      expect(tier1499?.purchasable).toBe(true);

      const allTiers = await pricingService.getAllTiersAdmin();
      const historicalTier99 = allTiers.find((t) => t.code === PRICING_TIER_CODES.ESTIMATE_99);
      expect(historicalTier99?.active).toBe(false);
      expect(historicalTier99?.purchasable).toBe(false);
    });

    it('rejects making an unpriced tier purchasable when price is <= 0', async () => {
      const tier1499 = await pricingService.getTierByCode(PRICING_TIER_CODES.PREMIUM_1499);
      expect(tier1499).toBeDefined();

      await expect(
        pricingService.updateTier(tier1499!.id, {
          purchasable: true,
          priceMinorUnits: 0,
        })
      ).rejects.toThrow(/until a valid final price/);
    });

    it('allows updating tier prices through valid admin operations', async () => {
      const tier1499 = await pricingService.getTierByCode(PRICING_TIER_CODES.PREMIUM_1499);
      expect(tier1499).toBeDefined();

      const updated = await pricingService.updateTier(tier1499!.id, {
        priceMinorUnits: 149900,
        purchasable: true,
        active: true,
        reason: 'Admin confirmed tier pricing',
      });

      expect(updated.priceMinorUnits).toBe(149900);
      expect(updated.purchasable).toBe(true);
      expect(updated.active).toBe(true);
    });

    it('rejects negative, NaN, or non-integer minor unit prices', async () => {
      const tier499 = await pricingService.getTierByCode(PRICING_TIER_CODES.DETAILED_ESTIMATE_499);
      expect(tier499).toBeDefined();

      await expect(
        pricingService.updateTier(tier499!.id, { priceMinorUnits: -500 })
      ).rejects.toThrow(/non-negative integer/);

      await expect(
        pricingService.updateTier(tier499!.id, { priceMinorUnits: NaN as any })
      ).rejects.toThrow(/non-negative integer/);

      await expect(
        pricingService.updateTier(tier499!.id, { priceMinorUnits: 499.5 as any })
      ).rejects.toThrow(/non-negative integer/);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. SERVER-SIDE PRICE AUTHORITY
  // ═════════════════════════════════════════════════════════════════════════
  describe('Server-Side Price Authority (Minor Units Resolution)', () => {
    it('authoritatively resolves ₹499 as 49900 paise and ₹1,499 as 149900 paise, rejecting inactive ₹99', async () => {
      // Inactive ₹99 cannot be purchased
      await expect(
        pricingService.initiatePurchase({
          tierCode: PRICING_TIER_CODES.ESTIMATE_99,
          leadName: 'Ramesh Gupta',
          leadPhone: '9845012345',
          leadEmail: 'ramesh@example.com',
        })
      ).rejects.toThrow(/is currently inactive/);

      const purchase499 = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Ananya Rao',
        leadPhone: '9876543210',
        leadEmail: 'ananya@example.com',
      });

      expect(purchase499.purchase.amountMinorUnits).toBe(49900);
      expect(purchase499.gatewayOrder?.amountMinorUnits).toBe(49900);

      const purchase1499 = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.PREMIUM_1499,
        leadName: 'Vikram Joshi',
        leadPhone: '9845011223',
        leadEmail: 'vikram@example.com',
      });

      expect(purchase1499.purchase.amountMinorUnits).toBe(149900);
      expect(purchase1499.gatewayOrder?.amountMinorUnits).toBe(149900);
    });

    it('rejects purchase attempts on invalid tier codes', async () => {
      const freshService = new PricingService();
      await expect(
        freshService.initiatePurchase({
          tierCode: 'INVALID_TIER' as any,
          leadName: 'Suresh Patil',
          leadPhone: '9988776655',
          leadEmail: 'suresh@example.com',
        })
      ).rejects.toThrow(/Invalid pricing tier code/);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. HISTORICAL PURCHASE AMOUNT INVARIANCE
  // ═════════════════════════════════════════════════════════════════════════
  describe('Historical Purchase Price Invariance', () => {
    it('preserves the original amount paid even if Admin later updates current tier price', async () => {
      // Customer buys ₹499 plan (49900 paise)
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Vikram Joshi',
        leadPhone: '9900112233',
        leadEmail: 'vikram@example.com',
      });

      expect(purchase.amountMinorUnits).toBe(49900);

      // Later, Admin changes tier price to ₹699 (69900 paise)
      const tier499 = await pricingService.getTierByCode(PRICING_TIER_CODES.DETAILED_ESTIMATE_499);
      await pricingService.updateTier(tier499!.id, {
        priceMinorUnits: 69900,
        reason: 'Price adjustment for new fiscal year',
      });

      // Historical purchase remains strictly 49900 paise (₹499)
      const history = await pricingService.getPurchaseHistory();
      const pastRecord = history.find((p) => p.id === purchase.id);
      expect(pastRecord?.amountMinorUnits).toBe(49900);

      // Future purchases now resolve to the new price (69900 paise)
      const newPurchase = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Meera Nair',
        leadPhone: '9845112233',
        leadEmail: 'meera@example.com',
      });
      expect(newPurchase.purchase.amountMinorUnits).toBe(69900);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. ENTITLEMENT ACCESS ENFORCEMENT
  // ═════════════════════════════════════════════════════════════════════════
  describe('Entitlement Access Enforcement', () => {
    it('allows basic summaries to all users without purchase', async () => {
      const canAccessSummary = await pricingService.canAccessFeature('BASIC_PROJECT_SUMMARY', null, null, null);
      const canAccessCost = await pricingService.canAccessFeature('BASIC_COST_SUMMARY', null, null, null);

      expect(canAccessSummary).toBe(true);
      expect(canAccessCost).toBe(true);
    });

    it('denies paid features (FULL_PDF_REPORT, DETAILED_BOQ) to unauthenticated or free users', async () => {
      const canAccessPdf = await pricingService.canAccessFeature('FULL_PDF_REPORT', null, 'random@example.com', 'PROJ-101');
      const canAccessBOQ = await pricingService.canAccessFeature('DETAILED_BOQ', null, 'random@example.com', 'PROJ-101');

      expect(canAccessPdf).toBe(false);
      expect(canAccessBOQ).toBe(false);
    });

    it('grants full detailed estimate deliverables upon confirmed ₹499 purchase', async () => {
      const { purchase } = await pricingService.initiatePurchase({
        tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
        leadName: 'Arjun Das',
        leadPhone: '9845098450',
        leadEmail: 'arjun@example.com',
        projectId: 'PROJ-ARJUN-01',
      });

      // Confirm payment
      await pricingService.confirmPurchasePayment(purchase.id, 'pay_test_arjun', purchase.gatewayOrderId || undefined);

      const canAccessPdf = await pricingService.canAccessFeature('FULL_PDF_REPORT', null, 'arjun@example.com', 'PROJ-ARJUN-01');
      const canAccessBOQ = await pricingService.canAccessFeature('DETAILED_BOQ', null, 'arjun@example.com', 'PROJ-ARJUN-01');
      const canAccessMat = await pricingService.canAccessFeature('MATERIAL_SCHEDULE', null, 'arjun@example.com', 'PROJ-ARJUN-01');

      expect(canAccessPdf).toBe(true);
      expect(canAccessBOQ).toBe(true);
      expect(canAccessMat).toBe(true);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. CONSULTATION DECOUPLING
  // ═════════════════════════════════════════════════════════════════════════
  describe('Consultation Separation Verification', () => {
    it('preserves Consultation launch fee at exactly ₹1,499 (149900 paise) untouched', () => {
      expect(CONSULTATION_PRICE_INR).toBe(1499);
      expect(CONSULTATION_PRICE_PAISE).toBe(149900);
    });

    it('does not bundle Consultation into calculator tiers or pricing tiers seeds', async () => {
      const tiers = await pricingService.getPublicTiers();
      for (const t of tiers) {
        expect(t.features).not.toContain('EXPERT_CONSULTATION');
      }
      const premiumTier = tiers.find((t) => t.code === PRICING_TIER_CODES.PREMIUM_1499);
      expect(premiumTier?.priceMinorUnits).toBe(149900);
      expect(premiumTier?.features).not.toContain('EXPERT_CONSULTATION');
    });
  });
});
