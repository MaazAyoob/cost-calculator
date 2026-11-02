// ==============================================================================
// Hutty 3.1 — Phase 03: Chapter 7 Final Review, BOQ & Commercial Offerings Test Suite
// Validates:
// 1. Transparent cost heads & zero-residual mathematical reconciliation.
// 2. BOQ trade grouping, line item coverage, and quantity transparency badges.
// 3. Five canonical commercial offerings (Free, ₹99, ₹499, ₹1,499, Consultation).
// 4. Server-authoritative entitlement boundaries and feature access.
// 5. PDF generation pipelines for Basic, Detailed, and Premium deliverables.
// 6. Non-destructive backward editing and parameter recalculation.
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput, BOQItem } from '../types';
import { createEngineInputForPackage } from '../data/packageConfig';
import {
  getQuantityTransparencyInfo,
  QuantityTransparencyType,
} from '../../features/planner/chapters/Chapter7ReviewCommercial';
import {
  PRICING_TIER_CODES,
  PRICING_FEATURES,
  PRICING_MINOR_UNITS,
} from '../../../server/src/constants/pricing.constants';
import { LAUNCH_CONSULTATION_PRICE_INR } from '../../config/consultation';
import { PricingService } from '../../../server/src/services/pricing.service';
import {
  generateBasicEstimatePdfBlob,
  generateDetailedReportPdfBlob,
} from '../../features/report/pdfService';
import { runQAGate } from '../modules/qaGate';

describe('Hutty 3.1 — Chapter 7: Final Review, BOQ & Commercial Experience', () => {
  let pricingService: PricingService;

  const baseInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30,
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
      externalPaint: 'Weather Proof Emulsion',
      brand: 'Asian Paints',
    },
  };

  const standardInput = createEngineInputForPackage(baseInput, 'PREMIUM');

  beforeEach(() => {
    pricingService = new PricingService();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Transparent Cost Heads & Zero-Residual Reconciliation
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Reconciles transparent cost heads with exact zero residual variance', () => {
    const calcResult = runCalculator(standardInput);
    const budget = calcResult.budget;
    const commercial = budget.commercialReconciliation;

    expect(budget.totalProjectCost).toBeGreaterThan(0);
    expect(budget.directMaterialCost).toBeGreaterThan(0);
    expect(budget.directLabourCost).toBeGreaterThan(0);

    // Sum of all direct and commercial heads
    const directSum =
      budget.directMaterialCost +
      budget.directFixtureCost +
      budget.directLabourCost +
      budget.contractorMargin +
      budget.contingency +
      budget.professionalFees +
      budget.gstAmount;

    expect(directSum).toBe(budget.totalProjectCost);

    // Verification via commercialReconciliation
    if (commercial) {
      expect(commercial.isFullyReconciled).toBe(true);
      expect(Math.abs(commercial.unexplainedResidual)).toBe(0);
      expect(commercial.reconciledSum).toBe(budget.totalProjectCost);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Quantity Transparency Taxonomy Badges
  // ─────────────────────────────────────────────────────────────────────────────
  it('2. Maps every BOQ line item to a valid quantity transparency classification', () => {
    const calcResult = runCalculator(standardInput);
    expect(calcResult.boq.length).toBeGreaterThan(30);

    const typesSeen = new Set<QuantityTransparencyType>();

    for (const item of calcResult.boq) {
      const badge = getQuantityTransparencyInfo(item);
      expect(badge.label).toBeDefined();
      expect(badge.badgeClass).toBeDefined();
      expect(badge.tooltip).toBeDefined();
      typesSeen.add(badge.type);
    }

    // Verify key taxonomy categories are identified
    expect(typesSeen.has('GEOMETRIC_CALCULATION')).toBe(true);
    expect(typesSeen.has('SITE_VERIFICATION_REQUIRED')).toBe(true);
    expect(typesSeen.has('ENGINEERING_FORMULA')).toBe(true);
  });

  it('3. Accurately flags excavation as site verification required and PCC as formula', () => {
    const excavationItem: BOQItem = {
      code: 'EX-001',
      category: 'Excavation & Earthwork',
      description: 'Earthwork excavation in foundation trenches and footing pits',
      quantity: 45,
      unit: 'm3',
      unitRate: 450,
      amount: 20250,
      percentage: 0.5,
      brand: 'Standard',
      remarks: 'Dependent on SBC',
    };
    const pccItem: BOQItem = {
      code: 'PCC-001',
      category: 'PCC & Sub-structure',
      description: 'Plain cement concrete 1:4:8 under foundations and sump tank',
      quantity: 12,
      unit: 'm3',
      unitRate: 3800,
      amount: 45600,
      percentage: 1.1,
      brand: 'Standard',
      remarks: 'Engineered sub-base',
    };
    const rccItem: BOQItem = {
      code: 'RCC-005',
      category: 'RCC Structure',
      description: 'M25 grade reinforced cement concrete in columns and floor slabs',
      quantity: 58,
      unit: 'm3',
      unitRate: 7200,
      amount: 417600,
      percentage: 10.2,
      brand: 'ReadyMix',
      remarks: 'Wall & slab geometry',
    };

    expect(getQuantityTransparencyInfo(excavationItem).type).toBe('SITE_VERIFICATION_REQUIRED');
    expect(getQuantityTransparencyInfo(pccItem).type).toBe('ENGINEERING_FORMULA');
    expect(getQuantityTransparencyInfo(rccItem).type).toBe('GEOMETRIC_CALCULATION');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Five Commercial Offerings Pricing & Decoupled Consultation
  // ─────────────────────────────────────────────────────────────────────────────
  it('4. Preserves canonical pricing constants for all 5 commercial offerings', () => {
    // 1. FREE (₹0)
    expect(PRICING_MINOR_UNITS.FREE).toBe(0);

    // 2. BASIC_ESTIMATE_PDF (₹99)
    expect(PRICING_MINOR_UNITS.BASIC_ESTIMATE_PDF).toBe(9900);

    // 3. DETAILED_ESTIMATE_499 (₹499)
    expect(PRICING_MINOR_UNITS.DETAILED_ESTIMATE_499).toBe(49900);

    // 4. PREMIUM_1499 (₹1,499)
    expect(PRICING_MINOR_UNITS.PREMIUM_1499).toBe(149900);

    // 5. LAUNCH_CONSULTATION (₹1,499) - Visually and commercially decoupled
    expect(LAUNCH_CONSULTATION_PRICE_INR).toBe(1499);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Server Entitlement Boundaries
  // ─────────────────────────────────────────────────────────────────────────────
  it('5. Enforces strict entitlement boundaries between Free, Basic, Detailed, and Premium tiers', async () => {
    const email = 'homeowner_ch7@example.com';
    const projectId = 'HT-2026-CH7-TEST';

    // Free tier: has summary, but cannot access full PDF or detailed BOQ
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_PROJECT_SUMMARY, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, email, projectId)).toBe(false);

    // Purchase Basic Estimate PDF (₹99)
    const { purchase: basicPurchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      userEmail: email,
      leadName: 'Ch 7 Tester',
      leadPhone: '+919999988888',
      leadEmail: email,
      projectId,
    });
    await pricingService.confirmPurchasePayment(basicPurchase.id, 'pay_basic_99');

    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_PDF_DOWNLOAD, null, email, projectId)).toBe(true);
    // Basic PDF does NOT grant full detailed BOQ
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, email, projectId)).toBe(false);

    // Purchase Detailed BOQ (₹499)
    const { purchase: detailedPurchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      userEmail: email,
      leadName: 'Ch 7 Tester',
      leadPhone: '+919999988888',
      leadEmail: email,
      projectId,
    });
    await pricingService.confirmPurchasePayment(detailedPurchase.id, 'pay_detailed_499');

    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.MATERIAL_SCHEDULE, null, email, projectId)).toBe(true);
    // Detailed ₹499 does NOT grant premium scenario comparisons
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.PREMIUM_COMPARISON, null, email, projectId)).toBe(false);

    // Purchase Premium Dossier (₹1,499)
    const { purchase: premiumPurchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.PREMIUM_1499,
      userEmail: email,
      leadName: 'Ch 7 Tester',
      leadPhone: '+919999988888',
      leadEmail: email,
      projectId,
    });
    await pricingService.confirmPurchasePayment(premiumPurchase.id, 'pay_premium_1499');

    expect(await pricingService.canAccessFeature(PRICING_FEATURES.PREMIUM_COMPARISON, null, email, projectId)).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Real PDF Generation Pipeline & Automated QA Gate
  // ─────────────────────────────────────────────────────────────────────────────
  it('6. Passes QA Gate and generates valid PDF buffers for all 3 commercial report tiers', async () => {
    const calcResult = runCalculator(standardInput);
    calcResult.report.projectId = 'HT-2026-CH7-PDF';

    // Verify QA Gate passes
    const qaResult = runQAGate(calcResult);
    expect(qaResult.passed).toBe(true);
    expect(qaResult.blockingErrors.length).toBe(0);

    // 1. Basic Estimate PDF (₹99)
    const basicPdf = await generateBasicEstimatePdfBlob({
      data: calcResult,
      projectName: 'Test Villa Ch7',
      preparedFor: 'Validation Suite',
    });
    expect(basicPdf.filename).toBe('Hutty_Basic_Estimate_HT-2026-CH7-PDF.pdf');
    expect(basicPdf.blob).toBeDefined();
    expect(basicPdf.blob.size).toBeGreaterThan(5000);

    // 2. Detailed BOQ PDF (₹499)
    const detailedPdf = await generateDetailedReportPdfBlob({
      data: calcResult,
      projectName: 'Test Villa Ch7',
      preparedFor: 'Validation Suite',
      isPremium: false,
    });
    expect(detailedPdf.filename).toBe('Hutty_Detailed_BOQ_HT-2026-CH7-PDF.pdf');
    expect(detailedPdf.blob).toBeDefined();
    expect(detailedPdf.blob.size).toBeGreaterThan(25000);

    // 3. Premium BOQ PDF (₹1,499)
    const premiumPdf = await generateDetailedReportPdfBlob({
      data: calcResult,
      projectName: 'Test Villa Ch7',
      preparedFor: 'Validation Suite',
      isPremium: true,
    });
    expect(premiumPdf.filename).toBe('Hutty_Premium_BOQ_HT-2026-CH7-PDF.pdf');
    expect(premiumPdf.blob).toBeDefined();
    expect(premiumPdf.blob.size).toBeGreaterThan(detailedPdf.blob.size);
  }, 90000);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Non-Destructive Backward Editing & Dynamic Recalculation
  // ─────────────────────────────────────────────────────────────────────────────
  it('7. Recalculates dynamically when user jumps back and adjusts floor count or tier', () => {
    const calcGPlus1 = runCalculator(standardInput);
    const costGPlus1 = calcGPlus1.budget.totalProjectCost;

    // Simulate user editing to G+2 in Chapter 2
    const gPlus2Input: EngineInput = {
      ...standardInput,
      floors: 3,
    };
    const calcGPlus2 = runCalculator(gPlus2Input);
    const costGPlus2 = calcGPlus2.budget.totalProjectCost;

    // Cost and area must scale predictably
    expect(calcGPlus2.area.totalBUASqFt).toBeGreaterThan(calcGPlus1.area.totalBUASqFt);
    expect(costGPlus2).toBeGreaterThan(costGPlus1);
    expect(calcGPlus2.quantities.steelTonnes).toBeGreaterThan(calcGPlus1.quantities.steelTonnes);
    expect(calcGPlus2.quantities.cementBags).toBeGreaterThan(calcGPlus1.quantities.cementBags);

    // Zero residual must hold across all recalculations
    const sumGPlus2 =
      calcGPlus2.budget.directMaterialCost +
      calcGPlus2.budget.directFixtureCost +
      calcGPlus2.budget.directLabourCost +
      calcGPlus2.budget.contractorMargin +
      calcGPlus2.budget.contingency +
      calcGPlus2.budget.professionalFees +
      calcGPlus2.budget.gstAmount;

    expect(sumGPlus2).toBe(costGPlus2);
  });
});
