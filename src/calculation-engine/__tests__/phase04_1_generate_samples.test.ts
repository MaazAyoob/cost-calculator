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

describe('HUTTY 3.2 — PHASE 04.1: GENERATE PRODUCTION PDF SAMPLES', () => {
  const scratchDir = 'C:/Users/Avita/.gemini/antigravity/brain/b7c6ab9b-a7fa-48d0-806c-0fccc27c98b4/scratch';

  // ── Project A: Small House (20x30 plot, 1 floor, Standard quality) ──
  const projectA: EngineInput = {
    city: 'Bangalore',
    plotLength: 30,
    plotWidth: 20,
    floors: 1,
    houseType: 'Independent House',
    parkingType: 'Normal Ground',
    carCount: 0,
    bikeCount: 2,
    rooms: {
      bedrooms: 1,
      bathrooms: 1,
      living: 1,
      kitchen: 1,
      utility: 1,
    },
    qualityTier: 'STANDARD',
    materialBrands: {
      steel: 'Kamdhenu',
      cement: 'Birla Super',
      masonry: 'Solid Concrete Blocks',
    },
  };

  // ── Project B: Typical Duplex (30x40 plot, G+1, Premium quality) ──
  const projectB: EngineInput = {
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
      masonry: 'AAC Blocks',
      electrical: 'Finolex',
      bathroom: 'Jaquar',
    },
  };

  // ── Project C: Large Residence (40x60 plot, G+2 Triplex, Luxury quality) ──
  const projectC: EngineInput = {
    city: 'Bangalore',
    plotLength: 60,
    plotWidth: 40,
    floors: 3,
    houseType: 'Independent House',
    parkingType: 'Stilt Parking',
    carCount: 2,
    bikeCount: 3,
    evCharging: true,
    liftRequired: true,
    rooms: {
      bedrooms: 5,
      bathrooms: 5,
      living: 2,
      kitchen: 1,
      dining: 1,
      balcony: 3,
      utility: 1,
      pooja: 1,
      study: 1,
      homeTheatre: 1,
    },
    qualityTier: 'LUXURY',
    materialBrands: {
      steel: 'JSW Steel',
      cement: 'UltraTech',
      masonry: 'Solid Concrete Blocks',
      electrical: 'Schneider',
      bathroom: 'Kohler',
    },
  };

  it('generates production PDF for Project A, B, and C with standard ₹199 configuration (isPremium: false)', async () => {
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    // 1. Project A
    const calcA = runCalculator(projectA);
    const docA = React.createElement(DetailedReportPdfDocument, {
      data: calcA,
      projectName: 'Small House Residence',
      preparedFor: 'Ramesh & Priya',
      specificationTier: 'Standard',
      isPremium: false,
    });
    const streamA = await pdf(docA as any).toBuffer();
    const bufferA = await streamToBuffer(streamA);
    const pathA = path.join(scratchDir, 'Project_A_Small_House.pdf');
    fs.writeFileSync(pathA, bufferA);
    console.log(`[SAMPLE_A_GENERATED] Size: ${bufferA.length} bytes, Path: ${pathA}`);

    // 2. Project B
    const calcB = runCalculator(projectB);
    const docB = React.createElement(DetailedReportPdfDocument, {
      data: calcB,
      projectName: 'Typical Duplex Residence',
      preparedFor: 'Karthik & Sneha',
      specificationTier: 'Premium',
      isPremium: false,
    });
    const streamB = await pdf(docB as any).toBuffer();
    const bufferB = await streamToBuffer(streamB);
    const pathB = path.join(scratchDir, 'Project_B_Typical_Duplex.pdf');
    fs.writeFileSync(pathB, bufferB);
    console.log(`[SAMPLE_B_GENERATED] Size: ${bufferB.length} bytes, Path: ${pathB}`);

    // 3. Project C
    const calcC = runCalculator(projectC);
    const docC = React.createElement(DetailedReportPdfDocument, {
      data: calcC,
      projectName: 'Large Luxury Residence',
      preparedFor: 'Vikramaditya & Shalini',
      specificationTier: 'Luxury',
      isPremium: false,
    });
    const streamC = await pdf(docC as any).toBuffer();
    const bufferC = await streamToBuffer(streamC);
    const pathC = path.join(scratchDir, 'Project_C_Large_Residence.pdf');
    fs.writeFileSync(pathC, bufferC);
    console.log(`[SAMPLE_C_GENERATED] Size: ${bufferC.length} bytes, Path: ${pathC}`);

    expect(fs.existsSync(pathA)).toBe(true);
    expect(fs.existsSync(pathB)).toBe(true);
    expect(fs.existsSync(pathC)).toBe(true);
  }, 90000);
});
