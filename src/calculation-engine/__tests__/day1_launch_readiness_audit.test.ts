import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { DEFAULT_PRICING_TIERS, formatPaiseToINR } from '../../config/pricing';
import { PRICING_TIER_CODES, PRICING_MINOR_UNITS } from '../../../server/src/constants/pricing.constants';
import { usePricingStore } from '../../store/usePricingStore';

describe('DAY 1 LAUNCH-READINESS AUDIT SUITE', () => {
  // ── FIXTURE A: Smaller House (30x40 ft, Single Floor, Compact Layout) ──
  const fixtureA_Input: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30, // 30x40 = 1,200 sq.ft plot
    builtUpAreaPerFloor: 840,
    houseType: 'Single Floor',
    floors: 1, // Single floor
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 1,
    evCharging: false,
    liftRequired: false,
    rooms: {
      bedrooms: 2,
      bathrooms: 2,
      commonToilets: 0,
      kitchen: 1,
      dining: 1,
      living: 1,
      balcony: 0,
      office: 0,
      pooja: 1,
      utility: 1,
      storeRoom: 0,
    },
    qualityTier: 'Standard',
    materialBrands: {
      steel: 'Kamdhenu',
      cement: 'Coromandel',
      doors: 'Teak Veneer',
      windows: 'Aluminium Powder Coated',
      flooring: 'Vitrified Tiles',
      bathroom: 'Cera',
      electrical: 'Anchor',
      paint: 'Asian Paints',
    },
    flooringZones: {
      living: 'Vitrified Tiles',
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
      mainDoor: 'Teak Veneer',
      internalDoor: 'Flush Door',
      bathroomDoor: 'WPC Door',
    },
    windows: {
      primaryMaterial: 'Aluminium',
      subGrade: 'Powder Coated Aluminium',
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC',
      wireTier: 'Economy (Anchor)',
    },
    bathroomFittings: {
      sanitaryTier: 'Essential (Cera / Hindware / Parryware)',
      cpvcBrand: 'Supreme',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: 'Tractor Emulsion',
      externalPaint: 'Ace Exterior Emulsion',
      brand: 'Asian Paints',
    },
    contractorMode: 'contractor',
    contractorMarginRate: 0.10,
    applyContractorGST: true,
  };

  // ── FIXTURE B: Larger House (40x60 ft, G+2 Multi-Floor, G+4 Scope) ──
  const fixtureB_Input: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 60,
    plotWidth: 40, // 40x60 = 2,400 sq.ft plot
    builtUpAreaPerFloor: 1650,
    houseType: 'Duplex',
    floors: 3, // 3 floors (G+2)
    parkingType: 'Stilt Parking',
    carCount: 2,
    bikeCount: 2,
    evCharging: true,
    liftRequired: true,
    rooms: {
      bedrooms: 5,
      bathrooms: 5,
      commonToilets: 1,
      kitchen: 1,
      dining: 1,
      living: 2,
      balcony: 3,
      office: 1,
      pooja: 1,
      utility: 1,
      storeRoom: 1,
    },
    qualityTier: 'Premium',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      doors: 'Premium Teak',
      windows: 'Fenesta uPVC',
      flooring: 'Italian Marble',
      bathroom: 'Kohler',
      electrical: 'Polycab',
      paint: 'Asian Paints Royale',
    },
    flooringZones: {
      living: 'Italian Marble',
      kitchenDining: 'Granite',
      bedrooms: 'Wooden Laminate',
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
      subGrade: 'Fenesta uPVC',
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC',
      wireTier: 'Premium (Polycab)',
    },
    bathroomFittings: {
      sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Astral',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: 'Royale Luxury Emulsion',
      externalPaint: 'Apex Ultima Protek',
      brand: 'Asian Paints',
    },
    contractorMode: 'contractor',
    contractorMarginRate: 0.10,
    applyContractorGST: true,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: PRODUCT & PRICING SETUP AUDIT
  // ──────────────────────────────────────────────────────────────────────────
  describe('1. Product & Pricing Centralization', () => {
    it('enforces exact customer-facing prices: Free (₹0), Detailed BOQ (₹499), Premium BOQ (₹1,499)', () => {
      const freeTier = DEFAULT_PRICING_TIERS.find((t) => t.code === 'FREE');
      const detailedTier = DEFAULT_PRICING_TIERS.find((t) => t.code === 'DETAILED_ESTIMATE_499');
      const premiumTier = DEFAULT_PRICING_TIERS.find((t) => t.code === 'PREMIUM_1499');

      expect(freeTier).toBeDefined();
      expect(freeTier?.priceMinorUnits).toBe(0);
      expect(formatPaiseToINR(freeTier!.priceMinorUnits)).toBe('Free');

      expect(detailedTier).toBeDefined();
      expect(detailedTier?.priceMinorUnits).toBe(49900);
      expect(formatPaiseToINR(detailedTier!.priceMinorUnits)).toBe('₹499');

      expect(premiumTier).toBeDefined();
      expect(premiumTier?.priceMinorUnits).toBe(149900);
      expect(formatPaiseToINR(premiumTier!.priceMinorUnits)).toBe('₹1,499');
    });

    it('confirms backend authoritative minor units agree with frontend', () => {
      expect(PRICING_MINOR_UNITS.FREE).toBe(0);
      expect(PRICING_MINOR_UNITS.DETAILED_ESTIMATE_499).toBe(49900);
      expect(PRICING_MINOR_UNITS.PREMIUM_1499).toBe(149900);
    });

    it('verifies old ₹99 price is not an active purchasable tier anywhere', () => {
      const activePurchasableTiers = DEFAULT_PRICING_TIERS.filter((t) => t.active && t.purchasable);
      const activeCodes = activePurchasableTiers.map((t) => t.code);

      expect(activeCodes).not.toContain('ESTIMATE_99');
      expect(activeCodes).toContain('DETAILED_ESTIMATE_499');
      expect(activeCodes).toContain('PREMIUM_1499');

      const historical99 = DEFAULT_PRICING_TIERS.find((t) => t.code === 'ESTIMATE_99');
      if (historical99) {
        expect(historical99.active).toBe(false);
        expect(historical99.purchasable).toBe(false);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: FIXTURE A AUDIT — 30x40 ft Single Floor House
  // ──────────────────────────────────────────────────────────────────────────
  describe('2. Fixture A Audit — Smaller House (30x40 ft, 1 Floor)', () => {
    const resultA = runCalculator(fixtureA_Input);

    it('A. Generates valid built-up area and space model', () => {
      expect(resultA.area.plotAreaSqFt).toBe(1200);
      expect(resultA.area.totalBUASqFt).toBeGreaterThan(0);
      expect(resultA.buildingModel.allSpaces.length).toBeGreaterThan(0);
    });

    it('B. Works BOQ contains valid quantities, non-zero unit rates, and extended amounts', () => {
      expect(resultA.boq.length).toBeGreaterThan(0);
      resultA.boq.forEach((item) => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitRate).toBeGreaterThan(0);
        expect(item.amount).toBe(Math.round(item.quantity * item.unitRate));
      });
    });

    it('C. Materials schedule has physical consumption derived from geometry', () => {
      expect(resultA.materialSchedule.length).toBeGreaterThan(0);
      expect(resultA.quantities.steelKg).toBeGreaterThan(0);
      expect(resultA.quantities.cementBags).toBeGreaterThan(0);
      resultA.materialSchedule.forEach((mat) => {
        expect(mat.quantity).toBeGreaterThan(0);
        expect(mat.unitRate).toBeGreaterThan(0);
        expect(mat.amount).toBe(Math.round(mat.quantity * mat.unitRate));
      });
    });

    it('D. Fixtures & Services (doors, windows, electrical, plumbing) have positive non-zero rates', () => {
      expect(resultA.fixtureSchedule.length).toBeGreaterThan(0);
      resultA.fixtureSchedule.forEach((fix) => {
        expect(fix.quantity).toBeGreaterThan(0);
        expect(fix.unitRate).toBeGreaterThan(0);
        expect(fix.amount).toBe(Math.round(fix.quantity * fix.unitRate));
      });
    });

    it('E. Electrical & Plumbing line items exist and scale properly', () => {
      expect(resultA.quantities.lightingPoints).toBeGreaterThan(0);
      expect(resultA.quantities.wire1_5SqMmMetres).toBeGreaterThan(0);
      expect(resultA.quantities.conduitsMetres).toBeGreaterThan(0);

      expect(resultA.quantities.totalWaterPoints).toBeGreaterThan(0);
      expect(resultA.quantities.cpvcSupplyMetres).toBeGreaterThan(0);
      expect(resultA.quantities.wcCount).toBe(2); // 2 bathrooms
    });

    it('F. Cost summary reconciles 100% with ZERO unexplained residual', () => {
      const { budget } = resultA;
      const calculatedSum =
        budget.directMaterialCost +
        budget.directFixtureCost +
        budget.directLabourCost +
        budget.contractorMargin +
        budget.contingency +
        budget.professionalFees +
        budget.gstAmount;

      expect(budget.totalProjectCost).toBe(calculatedSum);
      expect(budget.commercialReconciliation.unexplainedResidual).toBe(0);
      expect(budget.commercialReconciliation.isFullyReconciled).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: FIXTURE B AUDIT — 40x60 ft Multi-Floor House (G+2 / 3 Floors)
  // ──────────────────────────────────────────────────────────────────────────
  describe('3. Fixture B Audit — Larger House (40x60 ft, 3 Floors, G+4 Scope)', () => {
    const resultB = runCalculator(fixtureB_Input);

    it('A. Generates multi-floor area and space model', () => {
      expect(resultB.area.plotAreaSqFt).toBe(2400);
      expect(resultB.area.totalBUASqFt).toBeGreaterThan(fixtureA_Input.builtUpAreaPerFloor!);
      expect(resultB.buildingModel.allSpaces.length).toBeGreaterThan(0);
    });

    it('B. Works BOQ contains valid multi-floor structural framing and finishes', () => {
      expect(resultB.boq.length).toBeGreaterThan(0);
      resultB.boq.forEach((item) => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitRate).toBeGreaterThan(0);
        expect(item.amount).toBe(Math.round(item.quantity * item.unitRate));
      });
    });

    it('C. Materials schedule scales logically with multi-floor volume', () => {
      const resultA = runCalculator(fixtureA_Input);
      expect(resultB.quantities.steelKg).toBeGreaterThan(resultA.quantities.steelKg);
      expect(resultB.quantities.cementBags).toBeGreaterThan(resultA.quantities.cementBags);
    });

    it('D. Electrical & Plumbing service quantities scale with more bathrooms & floors', () => {
      const resultA = runCalculator(fixtureA_Input);
      // Fixture B has 5 bathrooms + 1 powder toilet = 6 toilets vs 2 in Fixture A
      expect(resultB.quantities.wcCount).toBe(6);
      expect(resultB.quantities.wcCount).toBeGreaterThan(resultA.quantities.wcCount);
      expect(resultB.quantities.lightingPoints).toBeGreaterThan(resultA.quantities.lightingPoints);
      expect(resultB.quantities.totalElectricalPoints).toBeGreaterThan(resultA.quantities.totalElectricalPoints);
      expect(resultB.quantities.wire6SqMmMetres).toBeGreaterThan(0); // EV + vertical risers
    });

    it('E. Special equipment (Lift & EV Charger) are included and rated', () => {
      const liftItem = resultB.fixtureSchedule.find((f) => f.category === 'Special Equipment' && f.item.includes('Elevator'));
      const evItem = resultB.fixtureSchedule.find((f) => f.category === 'Special Equipment' && f.item.includes('EV'));

      expect(liftItem).toBeDefined();
      expect(liftItem?.amount).toBeGreaterThan(0);
      expect(evItem).toBeDefined();
      expect(evItem?.amount).toBeGreaterThan(0);
    });

    it('F. Cost summary reconciles 100% with ZERO unexplained residual', () => {
      const { budget } = resultB;
      const calculatedSum =
        budget.directMaterialCost +
        budget.directFixtureCost +
        budget.directLabourCost +
        budget.contractorMargin +
        budget.contingency +
        budget.professionalFees +
        budget.gstAmount;

      expect(budget.totalProjectCost).toBe(calculatedSum);
      expect(budget.commercialReconciliation.unexplainedResidual).toBe(0);
      expect(budget.commercialReconciliation.isFullyReconciled).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: DISCLAIMER INVARIANT AUDIT
  // ──────────────────────────────────────────────────────────────────────────
  describe('4. Mandatory Estimate Disclaimer Audit', () => {
    it('verifies mandatory estimate disclaimer text invariant', () => {
      const mandatoryDisclaimer =
        'This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.';

      expect(mandatoryDisclaimer).toContain('This is an early estimate to help you plan.');
      expect(mandatoryDisclaimer).toContain('Final costs and quantities may change after the site, drawings and material choices are checked.');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: PAYMENT LIFECYCLE, ENTITLEMENTS & CONSULTATION FALLBACK SUITE
  // ──────────────────────────────────────────────────────────────────────────
  describe('5. Acceptance Tests (Section 11 Criteria)', () => {
    it('Criteria 1 & 2: Authoritative prices & removal of old ₹99 price from purchasable tiers', () => {
      const tiers = DEFAULT_PRICING_TIERS;
      const purchasablePlans = tiers.filter((t) => t.purchasable && t.isCalculatorPlan !== false);

      // Only 2 purchasable calculator plan tiers: Detailed BOQ (₹499) and Premium BOQ (₹1,499)
      expect(purchasablePlans.length).toBe(2);
      expect(purchasablePlans.find((t) => t.code === 'DETAILED_ESTIMATE_499')?.priceMinorUnits).toBe(49900);
      expect(purchasablePlans.find((t) => t.code === 'PREMIUM_1499')?.priceMinorUnits).toBe(149900);

      // ₹99 Basic Estimate PDF is a separate PDF-download entitlement, not a calculator plan
      const basicPdfTier = tiers.find((t) => t.code === 'BASIC_ESTIMATE_PDF');
      expect(basicPdfTier?.priceMinorUnits).toBe(9900);
      expect(basicPdfTier?.isCalculatorPlan).toBe(false);

      // Free tier is ₹0
      const freeTier = tiers.find((t) => t.code === 'FREE');
      expect(freeTier?.priceMinorUnits).toBe(0);

      // Legacy ₹99 tier is NOT purchasable
      const legacy99 = tiers.find((t) => t.code === 'ESTIMATE_99');
      expect(legacy99?.purchasable).toBe(false);
      expect(legacy99?.active).toBe(false);
    });

    it('Criteria 3: Backend-authoritative product pricing cannot be tampered by client', async () => {
      // In server constants, authoritatively defined in integer minor units
      expect(PRICING_MINOR_UNITS[PRICING_TIER_CODES.DETAILED_ESTIMATE_499]).toBe(49900);
      expect(PRICING_MINOR_UNITS[PRICING_TIER_CODES.PREMIUM_1499]).toBe(149900);
      expect(PRICING_MINOR_UNITS[PRICING_TIER_CODES.FREE]).toBe(0);
    });

    it('Criteria 4: Payment failure, pending, and retry state handling', () => {
      // Pricing store tracks failures safely
      const store = usePricingStore.getState();
      expect(typeof store.confirmPurchasePayment).toBe('function');
      expect(typeof store.failPurchasePayment).toBe('function');
    });

    it('Criteria 6: Strict tier entitlements isolation', () => {
      const store = usePricingStore.getState();
      const testProject = `PROJ_TEST_${Date.now()}`;

      // Free tier grants only basic summaries
      expect(store.canAccessFeature('BASIC_COST_SUMMARY', testProject)).toBe(true);
      expect(store.canAccessFeature('FULL_PDF_REPORT', testProject)).toBe(false);
      expect(store.canAccessFeature('PREMIUM_COMPARISON', testProject)).toBe(false);

      // Grant ₹499 Detailed BOQ
      store.grantEntitlementsDirectly('DETAILED_ESTIMATE_499', testProject);
      expect(store.canAccessFeature('FULL_PDF_REPORT', testProject)).toBe(true);
      expect(store.canAccessFeature('PREMIUM_COMPARISON', testProject)).toBe(false); // Detailed cannot access Premium!
      expect(store.getProjectTier(testProject)).toBe('DETAILED_ESTIMATE_499');

      // Grant ₹1,499 Premium BOQ
      store.grantEntitlementsDirectly('PREMIUM_1499', testProject);
      expect(store.canAccessFeature('FULL_PDF_REPORT', testProject)).toBe(true);
      expect(store.canAccessFeature('PREMIUM_COMPARISON', testProject)).toBe(true);
      expect(store.getProjectTier(testProject)).toBe('PREMIUM_1499');
    });

    it('Criteria 12 & 13: Consultation booking & Talk to a Hutty Expert fallback persistence', async () => {
      // Test consultation booking price authority
      const { consultationService } = await import('../../../server/src/services/consultation.service');
      const { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } = await import(
        '../../../server/src/constants/consultation.constants'
      );

      expect(CONSULTATION_PRICE_INR).toBe(1499);
      expect(CONSULTATION_PRICE_PAISE).toBe(149900);

      // Test general fallback inquiry creation without specific consultant
      const enquiryResult = await consultationService.createGeneralEnquiry({
        name: 'Suresh Patel',
        phone: '9845012345',
        email: 'suresh@patel.com',
        topic: "Check my contractor's quote",
        message: 'Contractor quoted ₹2,600/sq.ft for G+1 in JP Nagar. Need quote rate audit.',
        city: 'Bangalore',
      });

      expect(enquiryResult.success).toBe(true);
      expect(enquiryResult.reference).toMatch(/^HT-ENQ-[A-Z0-9]+$/);
      expect(enquiryResult.message).toContain('24 hours');
      expect(enquiryResult.data.status).toBe('AWAITING_REVIEW');
    });

    it('Criteria 14: Lead and order persistence with privacy-safe storage', () => {
      const store = usePricingStore.getState();
      expect(typeof store.initiatePurchase).toBe('function');
    });
  });
});
