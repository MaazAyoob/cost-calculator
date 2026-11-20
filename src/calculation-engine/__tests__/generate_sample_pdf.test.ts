import React from 'react';
import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { DetailedReportPdfDocument } from '../../features/report/DetailedReportPdfDocument';
import { pdf } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

async function streamToBuffer(stream: any): Promise<Buffer> {
  if (Buffer.isBuffer(stream)) return stream;
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: any) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

describe('HUTTY 3.2 — PHASE 05.2: GENERATE STATIC SAMPLE REPORT PDF', () => {
  const publicDir = path.resolve('public');
  const targetPdfPath = path.join(publicDir, 'Hutty-Sample-Construction-Report.pdf');

  // Standard Bangalore 30x40 G+1 Duplex Project (Canonical Sample Home)
  const sampleProject: EngineInput = {
    city: 'Bangalore',
    plotLength: 40,
    plotWidth: 30,
    floors: 2,
    houseType: 'Duplex',
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      living: 1,
      kitchen: 1,
      dining: 1,
      balcony: 1,
      utility: 1,
      pooja: 1,
    },
    qualityTier: 'PREMIUM',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'Solid Concrete Blocks',
      electrical: 'Finolex',
      bathroom: 'Jaquar',
    },
  };

  it('generates public/Hutty-Sample-Construction-Report.pdf with isSample: true', async () => {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const calcResult = runCalculator(sampleProject);
    expect(calcResult).toBeDefined();
    expect(calcResult.budget.totalProjectCost).toBeGreaterThan(3000000);

    const doc = React.createElement(DetailedReportPdfDocument, {
      data: calcResult,
      projectName: 'Duplex Residence',
      preparedFor: 'Sample Homeowner',
      specificationTier: 'Premium',
      isPremium: false,
      isSample: true,
    });

    const stream = await pdf(doc as any).toBuffer();
    const buffer = await streamToBuffer(stream);

    fs.writeFileSync(targetPdfPath, buffer);

    expect(fs.existsSync(targetPdfPath)).toBe(true);
    const stats = fs.statSync(targetPdfPath);
    console.log(`[SAMPLE_PDF_GENERATED] Target: ${targetPdfPath}, Size: ${stats.size} bytes`);
    expect(stats.size).toBeGreaterThan(50000); // Should be > 50KB
  }, 90000);
});
