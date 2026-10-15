// ==============================================================================
// Hutty — Report Paywall, Tier Visibility & PDF Quality Regression Suite
// Validating plan visibility boundaries, PDF filenames, and layout rendering.
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { createEngineInputForPackage } from '../data/packageConfig';
import {
  generateBasicEstimatePdfBlob,
  generateDetailedReportPdfBlob,
} from '../../features/report/pdfService';
import { useEntitlementStore } from '../../store/useEntitlementStore';
import { usePricingStore } from '../../store/usePricingStore';
import { PRICING_TIER_CODES, PRICING_FEATURES } from '../../../server/src/constants/pricing.constants';
import { PricingService } from '../../../server/src/services/pricing.service';

describe('Hutty — Report Paywall, Tier Visibility & PDF Quality Suite', () => {
  let pricingService: PricingService;

  const fullBaseInput: EngineInput = {
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

  const standardInput = createEngineInputForPackage(fullBaseInput, 'PREMIUM');

  beforeEach(() => {
    pricingService = new PricingService();
    useEntitlementStore.setState({
      unlockedReports: {},
      basicPdfUnlockedReports: {},
      isCurrentProjectUnlocked: false,
    });
    usePricingStore.setState({
      activeTierCode: 'FREE',
      userEntitlements: [],
      projectPurchases: {},
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Plan-by-Plan Feature Boundary and Entitlement Verification
  // ─────────────────────────────────────────────────────────────────────────────
  it('1. Free tier entitles only basic summaries and excludes detailed deliverables', async () => {
    const testProjectId = 'HT-2026-TEST-FREE';

    // Verify Free tier features on server
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_PROJECT_SUMMARY, null, null, testProjectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_COST_SUMMARY, null, null, testProjectId)).toBe(true);

    // Verify protected features are blocked
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_PDF_DOWNLOAD, null, null, testProjectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_QUANTITIES, null, null, testProjectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, null, testProjectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.MATERIAL_SCHEDULE, null, null, testProjectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FIXTURES_SCHEDULE, null, null, testProjectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, null, testProjectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.PREMIUM_COMPARISON, null, null, testProjectId)).toBe(false);
  });

  it('2. Basic PDF (₹99) unlocks only Basic PDF and does not leak Detailed BOQ', async () => {
    const email = 'homeowner99@example.com';
    const projectId = 'HT-2026-9901';

    // Simulate verified ₹99 purchase
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.BASIC_ESTIMATE_PDF,
      userEmail: email,
      leadName: 'Home Owner 99',
      leadPhone: '+919876543210',
      leadEmail: email,
      projectId,
    });
    await pricingService.confirmPurchasePayment(purchase.id, 'pay_test_99');

    // Basic PDF access is granted
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_PDF_DOWNLOAD, null, email, projectId)).toBe(true);

    // Detailed BOQ and Premium remain strictly blocked
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_QUANTITIES, null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projectId)).toBe(false);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.PREMIUM_COMPARISON, null, email, projectId)).toBe(false);
  });

  it('3. Detailed BOQ (₹499) unlocks works BOQ, materials schedule, fixtures, and full PDF', async () => {
    const email = 'homeowner499@example.com';
    const projectId = 'HT-2026-4991';

    // Simulate verified ₹499 purchase
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.DETAILED_ESTIMATE_499,
      userEmail: email,
      leadName: 'Home Owner 499',
      leadPhone: '+919876543210',
      leadEmail: email,
      projectId,
    });
    await pricingService.confirmPurchasePayment(purchase.id, 'pay_test_499');

    // All Detailed BOQ deliverables unlocked
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.BASIC_PDF_DOWNLOAD, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_QUANTITIES, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.MATERIAL_SCHEDULE, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FIXTURES_SCHEDULE, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projectId)).toBe(true);

    // Premium deliverables remain blocked
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.PREMIUM_COMPARISON, null, email, projectId)).toBe(false);
  });

  it('4. Premium BOQ (₹1,499) unlocks full suite including premium comparison', async () => {
    const email = 'homeowner1499@example.com';
    const projectId = 'HT-2026-14991';

    // Simulate verified ₹1,499 purchase
    const { purchase } = await pricingService.initiatePurchase({
      tierCode: PRICING_TIER_CODES.PREMIUM_1499,
      userEmail: email,
      leadName: 'Home Owner 1499',
      leadPhone: '+919876543210',
      leadEmail: email,
      projectId,
    });
    await pricingService.confirmPurchasePayment(purchase.id, 'pay_test_1499');

    expect(await pricingService.canAccessFeature(PRICING_FEATURES.FULL_PDF_REPORT, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.DETAILED_BOQ, null, email, projectId)).toBe(true);
    expect(await pricingService.canAccessFeature(PRICING_FEATURES.PREMIUM_COMPARISON, null, email, projectId)).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Dynamic PDF Filename Formatting Requirements
  // ─────────────────────────────────────────────────────────────────────────────
  it('5. Generates descriptive filenames with report type and project reference', async () => {
    const calcResult = runCalculator(standardInput);
    calcResult.report.projectId = 'HT-2026-7128';

    // Basic PDF filename
    const basicResult = await generateBasicEstimatePdfBlob({
      data: calcResult,
      projectName: 'Villa 7128',
      preparedFor: 'Mr. Sharma',
    });
    expect(basicResult.filename).toBe('Hutty_Basic_Estimate_HT-2026-7128.pdf');

    // Detailed BOQ PDF filename
    const detailedResult = await generateDetailedReportPdfBlob({
      data: calcResult,
      projectName: 'Villa 7128',
      preparedFor: 'Mr. Sharma',
      isPremium: false,
    });
    expect(detailedResult.filename).toBe('Hutty_Detailed_BOQ_HT-2026-7128.pdf');

    // Premium BOQ PDF filename
    const premiumResult = await generateDetailedReportPdfBlob({
      data: calcResult,
      projectName: 'Villa 7128',
      preparedFor: 'Mr. Sharma',
      isPremium: true,
    });
    expect(premiumResult.filename).toBe('Hutty_Premium_BOQ_HT-2026-7128.pdf');
  }, 70000);

  it('6. Sanitizes special characters and falls back gracefully when projectId is missing', async () => {
    const calcResult = runCalculator(standardInput);
    
    // Test with special characters in project ID
    calcResult.report.projectId = 'HT/2026#7128!BLR';
    const sanitizedResult = await generateBasicEstimatePdfBlob({
      data: calcResult,
    });
    expect(sanitizedResult.filename).toBe('Hutty_Basic_Estimate_HT_2026_7128_BLR.pdf');

    // Test with missing projectId (fallback)
    delete (calcResult.report as any).projectId;
    const fallbackResult = await generateBasicEstimatePdfBlob({
      data: calcResult,
    });
    expect(fallbackResult.filename).toBe('Hutty_Basic_Estimate_HT-ESTIMATE.pdf');
  }, 70000);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PDF Document Quality & Layout Handling
  // ─────────────────────────────────────────────────────────────────────────────
  it('7. Renders PDF documents successfully with both standard and large BOQs', async () => {
    // Standard BOQ
    const calcResult = runCalculator(standardInput);
    const standardPdf = await generateDetailedReportPdfBlob({
      data: calcResult,
      isPremium: true,
    });
    expect(standardPdf.blob).toBeDefined();
    expect(standardPdf.blob.size).toBeGreaterThan(1000);

    // Large BOQ (Simulate extra floors/rooms to produce long multi-page BOQ)
    const largeInput = createEngineInputForPackage({
      ...fullBaseInput,
      floors: 4,
      builtUpAreaPerFloor: 1400,
    }, 'PREMIUM');

    const largeResult = runCalculator(largeInput);
    expect(largeResult.boq.length).toBeGreaterThan(10);

    const largePdf = await generateDetailedReportPdfBlob({
      data: largeResult,
      isPremium: true,
    });
    expect(largePdf.blob).toBeDefined();
    expect(largePdf.blob.size).toBeGreaterThan(standardPdf.blob.size);
  }, 90000);
});
