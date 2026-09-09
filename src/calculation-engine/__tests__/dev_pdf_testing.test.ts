/// <reference types="vite/client" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isDevPdfTestingEnabled } from '../../config/devTesting';
import { generateDetailedReportPdfBlob } from '../../features/report/pdfService';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { createEngineInputForPackage } from '../data/packageConfig';

describe('Developer-Only Full PDF Testing Bypass Safety Guards', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  it('RULE 1: Returns false if VITE_DEVELOPMENT_FULL_PDF_TESTING is not explicitly "true" in dev', () => {
    (import.meta.env as any).DEV = true;
    (import.meta.env as any).PROD = false;
    delete (import.meta.env as any).VITE_DEVELOPMENT_FULL_PDF_TESTING;
    delete (import.meta.env as any).DEVELOPMENT_FULL_PDF_TESTING;

    expect(isDevPdfTestingEnabled()).toBe(false);
  });

  it('RULE 2: Returns false if VITE_DEVELOPMENT_FULL_PDF_TESTING is "false" or random string', () => {
    (import.meta.env as any).DEV = true;
    (import.meta.env as any).PROD = false;
    (import.meta.env as any).VITE_DEVELOPMENT_FULL_PDF_TESTING = 'false';
    expect(isDevPdfTestingEnabled()).toBe(false);

    (import.meta.env as any).VITE_DEVELOPMENT_FULL_PDF_TESTING = 'yes';
    expect(isDevPdfTestingEnabled()).toBe(false);
  });

  it('RULE 3: Returns true ONLY when DEV=true AND flag="true"', () => {
    (import.meta.env as any).DEV = true;
    (import.meta.env as any).PROD = false;
    (import.meta.env as any).VITE_DEVELOPMENT_FULL_PDF_TESTING = 'true';
    expect(isDevPdfTestingEnabled()).toBe(true);

    // Also supports trimmed/case-insensitive "TRUE"
    (import.meta.env as any).VITE_DEVELOPMENT_FULL_PDF_TESTING = ' TRUE ';
    expect(isDevPdfTestingEnabled()).toBe(true);
  });

  it('RULE 4: Unconditionally returns false in production regardless of any flag', () => {
    (import.meta.env as any).DEV = false;
    (import.meta.env as any).PROD = true;
    (import.meta.env as any).VITE_DEVELOPMENT_FULL_PDF_TESTING = 'true';
    (import.meta.env as any).DEVELOPMENT_FULL_PDF_TESTING = 'true';

    // Must be strictly false in production
    expect(isDevPdfTestingEnabled()).toBe(false);
  });
});

describe('Single Source of Truth PDF Generation Pipeline', () => {
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

  const sampleInput = createEngineInputForPackage(fullBaseInput, 'PREMIUM');

  it('generates the exact same full PDF blob and enforces mandatory QA Gate', async () => {
    const calcResult = runCalculator(sampleInput);
    if (!calcResult.qaResult?.passed) {
      console.error('QA Gate Errors:', calcResult.qaResult?.blockingErrors);
    }
    expect(calcResult.qaResult?.passed).toBe(true);

    const pdfOutput = await generateDetailedReportPdfBlob({
      data: calcResult,
      projectName: 'Test Project',
      preparedFor: 'Developer QA',
      specificationTier: 'Premium',
    });

    expect(pdfOutput).toBeDefined();
    expect(pdfOutput.blob).toBeDefined();
    expect(pdfOutput.url).toBeDefined();
    expect(pdfOutput.filename).toMatch(/_Detailed_BOQ_Report\.pdf$/);
  }, 15000);

  it('blocks PDF generation if QA Gate fails', async () => {
    const calcResult = runCalculator(sampleInput);
    // Simulate compromised QA gate
    const badResult = {
      ...calcResult,
      qaResult: {
        passed: false,
        blockingErrors: ['CRITICAL QA ERROR: Simulated rate compromise'],
        warnings: [],
        checks: [],
        validatedAt: new Date().toISOString(),
      },
    } as any;

    await expect(
      generateDetailedReportPdfBlob({
        data: badResult,
      })
    ).rejects.toThrow(/PDF Generation Blocked by Automated QA Gate/);
  });
});
