import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('HUTTY 3.2 — PHASE 05.2: LANGUAGE SIMPLIFICATION & SAMPLE REPORT VALIDATION', () => {
  const publicDir = path.resolve('public');
  const samplePdfPath = path.join(publicDir, 'Hutty-Sample-Construction-Report.pdf');

  // 1. Test Static Sample PDF Delivery
  describe('Static Sample Construction Report PDF Delivery', () => {
    it('verifies public/Hutty-Sample-Construction-Report.pdf exists and has valid PDF format', () => {
      expect(fs.existsSync(samplePdfPath)).toBe(true);
      const stats = fs.statSync(samplePdfPath);
      expect(stats.size).toBeGreaterThan(50000); // Must be > 50KB realistic multi-page PDF

      const buffer = fs.readFileSync(samplePdfPath);
      const header = buffer.toString('utf-8', 0, 5);
      expect(header).toBe('%PDF-');
    });

    it('verifies sample PDF contains SAMPLE REPORT markers', () => {
      const buffer = fs.readFileSync(samplePdfPath);
      const text = buffer.toString('latin1');
      // In PDF text streams, the watermark / text is encoded
      expect(text.includes('SAMPLE') || text.includes('Sample') || text.includes('Hutty')).toBe(true);
    });
  });

  // 2. Test Hero Section Content & CTAs
  describe('Hero Section Copy & Action Links', () => {
    const heroPath = path.resolve('src/features/landing/sections/HeroSection.tsx');
    const heroCode = fs.readFileSync(heroPath, 'utf-8');

    it('contains exact required headline: "Build your home with a clear plan."', () => {
      expect(heroCode).toContain('Build your home with');
      expect(heroCode).toContain('a clear plan.');
    });

    it('contains exact supporting text: "Plan your home, understand the costs, and know what materials you\'ll need — before construction begins."', () => {
      expect(heroCode).toContain(
        "Plan your home, understand the costs, and know what materials you&apos;ll need — before construction begins."
      );
    });

    it('contains supporting line: "Get a clear estimate for your home, from the structure to the finishing."', () => {
      expect(heroCode).toContain(
        'Get a clear estimate for your home, from the structure to the finishing.'
      );
    });

    it('contains Primary CTA: "Start planning my home"', () => {
      expect(heroCode).toContain('Start planning my home');
    });

    it('contains Secondary CTA: "Download sample report" pointing to /Hutty-Sample-Construction-Report.pdf', () => {
      expect(heroCode).toContain('Download sample report');
      expect(heroCode).toContain('/Hutty-Sample-Construction-Report.pdf');
      expect(heroCode).toContain('download="Hutty-Sample-Construction-Report.pdf"');
    });

    it('displays realistic preview card with direct download link', () => {
      expect(heroCode).toContain('Sample Home Report');
      expect(heroCode).toContain('Download sample PDF');
    });
  });

  // 3. Test What Your Report Includes Section
  describe('What Your Report Includes Section Language', () => {
    const includesPath = path.resolve('src/features/landing/sections/WhatYourReportIncludesSection.tsx');
    const includesCode = fs.readFileSync(includesPath, 'utf-8');

    it('uses simplified pillar titles and descriptions', () => {
      expect(includesCode).toContain('Construction Cost Summary');
      expect(includesCode).toContain('Materials Needed');
      expect(includesCode).toContain('List of Work & Costs (BOQ)');
      expect(includesCode).toContain('Plot & Setback Rules');
      expect(includesCode).toContain('Work Stages & Payment Plan');
    });

    it('includes a direct link to download the sample report', () => {
      expect(includesCode).toContain('/Hutty-Sample-Construction-Report.pdf');
      expect(includesCode).toContain('Download Sample Report');
    });
  });

  // 4. Test Three Easy Steps Section Language
  describe('Three Easy Steps Section Language', () => {
    const stepsPath = path.resolve('src/features/landing/sections/ThreeEasyStepsSection.tsx');
    const stepsCode = fs.readFileSync(stepsPath, 'utf-8');

    it('features clear, non-technical 3-step homebuilding flow', () => {
      expect(stepsCode).toContain('Enter Your Plot & Home Details');
      expect(stepsCode).toContain('See Your Free Estimate');
      expect(stepsCode).toContain('Download Your Full Report');
      expect(stepsCode).toContain('Start planning my home');
    });
  });

  // 5. Test Signature Pricing Section Language
  describe('Signature Pricing Section Language', () => {
    const pricingPath = path.resolve('src/features/landing/sections/SignaturePricingSection.tsx');
    const pricingCode = fs.readFileSync(pricingPath, 'utf-8');

    it('clearly communicates Free vs ₹199 Complete Report', () => {
      expect(pricingCode).toContain('Free Online Estimate');
      expect(pricingCode).toContain('Start Free Estimate');
      expect(pricingCode).toContain('Complete Construction Report PDF');
      expect(pricingCode).toContain('Get Complete Report — ₹199');
    });
  });

  // 6. Test Header and Footer Links
  describe('Navigation & Footer Direct Access', () => {
    const headerPath = path.resolve('src/components/layout/WebsiteHeader.tsx');
    const headerCode = fs.readFileSync(headerPath, 'utf-8');

    const footerPath = path.resolve('src/components/layout/WebsiteFooter.tsx');
    const footerCode = fs.readFileSync(footerPath, 'utf-8');

    it('header features "Plan My Home" and direct sample link', () => {
      expect(headerCode).toContain('Plan My Home');
      expect(headerCode).toContain('/Hutty-Sample-Construction-Report.pdf');
    });

    it('footer features "Sample Report (Free PDF)" link', () => {
      expect(footerCode).toContain('/Hutty-Sample-Construction-Report.pdf');
      expect(footerCode).toContain('Sample Report (Free PDF)');
    });
  });

  // 7. Test Unlock Report Modal Language
  describe('Unlock Report Modal Language', () => {
    const modalPath = path.resolve('src/components/modals/UnlockReportModal.tsx');
    const modalCode = fs.readFileSync(modalPath, 'utf-8');

    it('features simplified deliverables list and clear ₹199 pricing', () => {
      expect(modalCode).toContain('Unlock Complete Construction Report');
      expect(modalCode).toContain('List of Work &amp; Costs (BOQ)');
      expect(modalCode).toContain('Materials Needed');
      expect(modalCode).toContain('Fittings &amp; Finishes');
      expect(modalCode).toContain('Plot &amp; Setback Rules');
    });
  });

  // 8. Test Calculator Steps Language Simplification
  describe('Calculator Steps Language', () => {
    const step1Code = fs.readFileSync(path.resolve('src/features/planner/steps/Step1Plot.tsx'), 'utf-8');
    const step2Code = fs.readFileSync(path.resolve('src/features/planner/steps/Step2Home.tsx'), 'utf-8');
    const step3Code = fs.readFileSync(path.resolve('src/features/planner/steps/Step3Structure.tsx'), 'utf-8');
    const step4Code = fs.readFileSync(path.resolve('src/features/planner/steps/Step4Finishes.tsx'), 'utf-8');
    const step5Code = fs.readFileSync(path.resolve('src/features/planner/steps/Step5Estimate.tsx'), 'utf-8');

    it('Step 1 simplifies setbacks as open spaces', () => {
      expect(step1Code).toContain('Space you must leave around your home');
      expect(step1Code).toContain('Front Setback');
      expect(step1Code).toContain('Rear Setback');
    });

    it('Step 2 uses friendly room labels', () => {
      expect(step2Code).toContain('Type of Home');
      expect(step2Code).toContain('Main Rooms');
    });

    it('Step 3 uses friendly quality and materials terminology', () => {
      expect(step3Code).toContain('Choose your construction quality.');
      expect(step3Code).toContain('QUALITY &amp; MATERIALS');
    });

    it('Step 4 simplifies finishes and fittings', () => {
      expect(step4Code).toContain('FINISHES &amp; FITTINGS');
      expect(step4Code).toContain('Bathroom &amp; Electrical Fittings');
    });

    it('Step 5 highlights complete report with simple terminology', () => {
      expect(step5Code).toContain('Itemized List of Work (BOQ)');
      expect(step5Code).toContain('Materials Needed');
      expect(step5Code).toContain('Open Space Rules (Setbacks)');
    });
  });
});
