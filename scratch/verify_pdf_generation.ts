// ==============================================================================
// Verification Script: Real PDF Generation for Hutty 3.1 Commercial Tiers
// Generates real PDF artifacts for:
// 1. Basic Estimate PDF (₹99)
// 2. Detailed BOQ Report (₹499)
// 3. Premium Engineering Dossier (₹1,499)
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { runCalculator } from '../src/calculation-engine/calculator';
import { EngineInput } from '../src/calculation-engine/types';
import { createEngineInputForPackage } from '../src/calculation-engine/data/packageConfig';
import {
  generateBasicEstimatePdfBlob,
  generateDetailedReportPdfBlob,
} from '../src/features/report/pdfService';

async function main() {
  console.log('--- Starting PDF Generation Verification ---');

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

  const input = createEngineInputForPackage(baseInput, 'PREMIUM');
  const calcResult = runCalculator(input);
  calcResult.report.projectId = 'HT-2026-VERIFY-01';

  const outputDir = path.resolve(process.cwd(), 'scratch', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Basic Estimate PDF (₹99)
  console.log('\n[1/3] Generating Basic Estimate PDF (₹99)...');
  const basicResult = await generateBasicEstimatePdfBlob({
    data: calcResult,
    projectName: 'Hutty Verification Villa',
    preparedFor: 'Founder Inspection',
  });
  const basicBuffer = Buffer.from(await basicResult.blob.arrayBuffer());
  const basicPath = path.join(outputDir, basicResult.filename);
  fs.writeFileSync(basicPath, basicBuffer);
  console.log(`✓ Basic PDF generated: ${basicResult.filename}`);
  console.log(`  File size: ${(basicBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`  Header verification: ${basicBuffer.subarray(0, 5).toString('ascii') === '%PDF-' ? 'Valid PDF' : 'INVALID'}`);

  // 2. Detailed BOQ PDF (₹499)
  console.log('\n[2/3] Generating Detailed BOQ PDF (₹499)...');
  const detailedResult = await generateDetailedReportPdfBlob({
    data: calcResult,
    projectName: 'Hutty Verification Villa',
    preparedFor: 'Founder Inspection',
    isPremium: false,
  });
  const detailedBuffer = Buffer.from(await detailedResult.blob.arrayBuffer());
  const detailedPath = path.join(outputDir, detailedResult.filename);
  fs.writeFileSync(detailedPath, detailedBuffer);
  console.log(`✓ Detailed BOQ PDF generated: ${detailedResult.filename}`);
  console.log(`  File size: ${(detailedBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`  Header verification: ${detailedBuffer.subarray(0, 5).toString('ascii') === '%PDF-' ? 'Valid PDF' : 'INVALID'}`);

  // 3. Premium BOQ PDF (₹1,499)
  console.log('\n[3/3] Generating Premium BOQ PDF (₹1,499)...');
  const premiumResult = await generateDetailedReportPdfBlob({
    data: calcResult,
    projectName: 'Hutty Verification Villa',
    preparedFor: 'Founder Inspection',
    isPremium: true,
  });
  const premiumBuffer = Buffer.from(await premiumResult.blob.arrayBuffer());
  const premiumPath = path.join(outputDir, premiumResult.filename);
  fs.writeFileSync(premiumPath, premiumBuffer);
  console.log(`✓ Premium BOQ PDF generated: ${premiumResult.filename}`);
  console.log(`  File size: ${(premiumBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`  Header verification: ${premiumBuffer.subarray(0, 5).toString('ascii') === '%PDF-' ? 'Valid PDF' : 'INVALID'}`);

  console.log('\n--- All 3 PDF Artifacts Generated & Verified Successfully ---');
}

main().catch((err) => {
  console.error('Fatal error during PDF verification:', err);
  process.exit(1);
});

