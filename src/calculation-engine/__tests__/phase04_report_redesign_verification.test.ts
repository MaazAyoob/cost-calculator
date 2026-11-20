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

describe('HUTTY 3.2 — PHASE 04: COMPLETE REPORT REDESIGN VERIFICATION', () => {
  // ── Project A: Small Plot, Ground Floor, Standard Quality ──
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

  // ── Project B: 30x40 Standard Plot, G+1 Duplex, Premium Quality ──
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

  // ── Project C: Larger Plot 40x60, G+2 Triplex, Luxury Quality ──
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

  const calcA = runCalculator(projectA);
  const calcB = runCalculator(projectB);
  const calcC = runCalculator(projectC);

  describe('Part 1: Representative Project Data Integrity', () => {
    it('Project A (Small Plot 20x30, 1 Floor) produces valid calculations', () => {
      expect(calcA.area.plotAreaSqFt).toBe(600);
      expect(calcA.area.totalBUASqFt).toBeGreaterThan(0);
      expect(calcA.budget.totalProjectCost).toBeGreaterThan(0);
      expect(calcA.boq.length).toBeGreaterThan(0);
      expect(calcA.materialSchedule.length).toBeGreaterThan(0);
    });

    it('Project B (Canonical 30x40 Duplex, 2 Floors) produces valid calculations', () => {
      expect(calcB.area.plotAreaSqFt).toBe(1200);
      expect(calcB.area.totalBUASqFt).toBe(1440);
      expect(calcB.budget.totalProjectCost).toBeGreaterThan(0);
      expect(calcB.boq.length).toBeGreaterThan(0);
      expect(calcB.materialSchedule.length).toBeGreaterThan(0);
      expect(calcB.paymentPlan.length).toBeGreaterThan(0);
    });

    it('Project C (Large Plot 40x60, 3 Floors, Stilt) produces valid calculations', () => {
      expect(calcC.area.plotAreaSqFt).toBe(2400);
      expect(calcC.area.totalBUASqFt).toBeGreaterThan(2000);
      expect(calcC.budget.totalProjectCost).toBeGreaterThan(0);
      expect(calcC.boq.length).toBeGreaterThan(0);
      expect(calcC.quantities.steelTonnes).toBeGreaterThan(calcB.quantities.steelTonnes);
    });
  });

  describe('Part 2: Mathematical Reconciliations & Quality Gates', () => {
    it('Project B BOQ total reconciles to baseConstructionCost', () => {
      const sumBOQ = calcB.boq.reduce((s, b) => s + b.amount, 0);
      expect(calcB.budget.baseConstructionCost).toBe(sumBOQ);
    });

    it('Project B directConstructionBudget equals material + labour + fixtures', () => {
      const sumDirect =
        calcB.budget.directMaterialCost +
        calcB.budget.directLabourCost +
        calcB.budget.directFixtureCost;
      expect(calcB.budget.directConstructionBudget).toBe(sumDirect);
    });

    it('Project B payment milestones total 100% and match totalProjectCost', () => {
      const totalPct = calcB.paymentPlan.reduce((s, p) => s + p.percentage, 0);
      expect(totalPct).toBe(100);
      const sumAmounts = calcB.paymentPlan.reduce((s, p) => s + p.amount, 0);
      expect(Math.abs(sumAmounts - calcB.budget.totalProjectCost)).toBeLessThanOrEqual(5); // rounding tolerance
    });

    it('Project B cost per sqft matches totalProjectCost / totalBUASqFt', () => {
      const expectedRate = Math.round(calcB.budget.totalProjectCost / calcB.area.totalBUASqFt);
      expect(calcB.budget.costPerSqFt).toBe(expectedRate);
    });
  });

  describe('Part 3: PDF Document Structure & Page Layout', () => {
    const docB = DetailedReportPdfDocument({
      data: calcB,
      projectName: '30x40 Duplex Residence',
      preparedFor: 'Mr. & Mrs. Sharma',
      specificationTier: 'Premium',
      isPremium: true,
    }) as React.ReactElement;

    const children = React.Children.toArray(docB.props.children) as React.ReactElement[];

    it('Document contains minimum 9 pages covering all canonical chapters', () => {
      expect(children.length).toBeGreaterThanOrEqual(9);
    });

    it('All pages have size A4', () => {
      children.forEach((page) => {
        expect(page.props['size']).toBe('A4');
      });
    });
  });

  describe('Part 4: End-to-End PDF Buffer Compilation', () => {
    it('compiles Project B to PDF buffer and verifies byte stream', async () => {
      const docB = React.createElement(DetailedReportPdfDocument, {
        data: calcB,
        projectName: '30x40 Duplex Residence',
        preparedFor: 'Mr. & Mrs. Sharma',
        specificationTier: 'Premium',
        isPremium: true,
      });

      const stream = await pdf(docB as any).toBuffer();
      const buffer = await streamToBuffer(stream);
      expect(buffer.length).toBeGreaterThan(10000);
      console.log('Project B PDF successfully compiled! Byte size:', buffer.length);

      // Save to artifact scratch directory
      const scratchDir = 'C:/Users/Avita/.gemini/antigravity/brain/b7c6ab9b-a7fa-48d0-806c-0fccc27c98b4/scratch';
      if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
      }
      fs.writeFileSync(path.join(scratchDir, 'hutty_phase04_project_b_report.pdf'), buffer);
    }, 45000);

    it('compiles Project A (Small) to PDF buffer without errors', async () => {
      const docA = React.createElement(DetailedReportPdfDocument, {
        data: calcA,
        projectName: 'Compact 20x30 Residence',
        preparedFor: 'Client A',
        specificationTier: 'Standard',
      });
      const stream = await pdf(docA as any).toBuffer();
      const buffer = await streamToBuffer(stream);
      expect(buffer.length).toBeGreaterThan(10000);
    }, 45000);

    it('compiles Project C (Luxury 40x60) to PDF buffer without errors', async () => {
      const docC = React.createElement(DetailedReportPdfDocument, {
        data: calcC,
        projectName: 'Luxury Villa 40x60',
        preparedFor: 'Client C',
        specificationTier: 'Luxury',
        isPremium: true,
      });
      const stream = await pdf(docC as any).toBuffer();
      const buffer = await streamToBuffer(stream);
      expect(buffer.length).toBeGreaterThan(10000);
    }, 45000);
  });
});
