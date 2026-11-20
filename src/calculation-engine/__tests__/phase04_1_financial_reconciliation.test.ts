import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

describe('HUTTY 3.2 — PHASE 04.1: FINANCIAL RECONCILIATION AUDIT', () => {
  const projectA: EngineInput = {
    city: 'Bangalore',
    plotLength: 30,
    plotWidth: 20,
    floors: 1,
    houseType: 'Independent House',
    parkingType: 'Normal Ground',
    carCount: 0,
    bikeCount: 2,
    rooms: { bedrooms: 1, bathrooms: 1, living: 1, kitchen: 1, utility: 1 },
    qualityTier: 'STANDARD',
    materialBrands: { steel: 'Kamdhenu', cement: 'Birla Super', masonry: 'Solid Concrete Blocks' },
  };

  const projectB: EngineInput = {
    city: 'Bangalore',
    plotLength: 40,
    plotWidth: 30,
    floors: 2,
    houseType: 'Duplex',
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    rooms: { bedrooms: 3, bathrooms: 3, living: 1, kitchen: 1, dining: 1, balcony: 1, utility: 1, pooja: 1 },
    qualityTier: 'PREMIUM',
    materialBrands: { steel: 'Tata Tiscon', cement: 'UltraTech', masonry: 'AAC Blocks', electrical: 'Finolex', bathroom: 'Jaquar' },
  };

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
    rooms: { bedrooms: 5, bathrooms: 5, living: 2, kitchen: 1, dining: 1, balcony: 3, utility: 1, pooja: 1, study: 1, homeTheatre: 1 },
    qualityTier: 'LUXURY',
    materialBrands: { steel: 'JSW Steel', cement: 'UltraTech', masonry: 'Solid Concrete Blocks', electrical: 'Schneider', bathroom: 'Kohler' },
  };

  const cases = [
    { name: 'Project A (Small House 20x30, 1 Floor, Standard)', input: projectA },
    { name: 'Project B (Typical Duplex 30x40, G+1, Premium)', input: projectB },
    { name: 'Project C (Large Residence 40x60, 3 Floors, Luxury)', input: projectC },
  ];

  for (const { name, input } of cases) {
    it(`verifies complete financial reconciliation for ${name}`, () => {
      const res = runCalculator(input);
      const { budget, area, boq, paymentPlan, materialTakeoff, fixtureSchedule } = res;

      console.log(`\n=============================================================`);
      console.log(`FINANCIAL RECONCILIATION AUDIT: ${name}`);
      console.log(`=============================================================`);
      console.log(`Total BUA: ${area.totalBUASqFt} sq.ft`);
      console.log(`Direct Construction Budget: ₹${budget.directConstructionBudget.toLocaleString('en-IN')}`);
      console.log(`  - Direct Materials: ₹${budget.directMaterialCost.toLocaleString('en-IN')}`);
      console.log(`  - Direct Labour:    ₹${budget.directLabourCost.toLocaleString('en-IN')}`);
      console.log(`  - Direct Fixtures:  ₹${budget.directFixtureCost.toLocaleString('en-IN')}`);
      console.log(`Direct Rate/sq.ft: ₹${Math.round(budget.directConstructionBudget / area.totalBUASqFt)}/sq.ft`);
      console.log(`-------------------------------------------------------------`);
      console.log(`Commercial Overheads & Statutory Add-ons:`);
      console.log(`  - Contractor Margin (15%): ₹${budget.contractorMargin.toLocaleString('en-IN')}`);
      console.log(`  - Contingency (6%):         ₹${budget.contingency.toLocaleString('en-IN')}`);
      console.log(`  - Professional Fees (5%):   ₹${(budget.professionalFees || (budget as any).architecturalEngineeringFees)?.toLocaleString('en-IN')}`);
      console.log(`  - GST (18% on Execution):  ₹${(budget.gstAmount || (budget as any).gstTax)?.toLocaleString('en-IN')}`);
      console.log(`Total Project Cost: ₹${budget.totalProjectCost.toLocaleString('en-IN')}`);
      console.log(`All-Inclusive Rate/sq.ft: ₹${budget.costPerSqFt}/sq.ft (formula ₹${Math.round(budget.totalProjectCost / area.totalBUASqFt)}/sq.ft)`);

      // 1. Direct Costs Sum Check
      const directSum = budget.directMaterialCost + budget.directLabourCost + budget.directFixtureCost;
      expect(directSum).toBe(budget.directConstructionBudget);

      // 2. BOQ Grand Total Check
      const boqSum = boq.reduce((s, item) => s + (item.amount || 0), 0);
      console.log(`BOQ Sum: ₹${boqSum.toLocaleString('en-IN')} vs Direct Const Budget: ₹${budget.directConstructionBudget.toLocaleString('en-IN')}`);
      expect(Math.abs(boqSum - budget.directConstructionBudget)).toBeLessThanOrEqual(5);

      // 3. Commercial Heads Reconcile to Total Project Cost
      const profFees = budget.professionalFees ?? (budget as any).architecturalEngineeringFees ?? 0;
      const gst = budget.gstAmount ?? (budget as any).gstTax ?? 0;
      const totalReconciled =
        budget.directConstructionBudget +
        budget.contractorMargin +
        budget.contingency +
        profFees +
        gst;
      console.log(`Total Reconciled: ₹${totalReconciled.toLocaleString('en-IN')} vs Total Project Cost: ₹${budget.totalProjectCost.toLocaleString('en-IN')}`);
      expect(totalReconciled).toBe(budget.totalProjectCost);

      // 4. Rate per sq.ft uses Total BUA
      const expectedEffectiveRate = Math.round(budget.totalProjectCost / area.totalBUASqFt);
      expect(budget.costPerSqFt).toBe(expectedEffectiveRate);

      // 5. Milestone Payment Percentages Total 100%
      const stages = Array.isArray(paymentPlan) ? paymentPlan : (paymentPlan as any).stages || [];
      const totalPct = stages.reduce((s: number, st: any) => s + st.percentage, 0);
      console.log(`Payment Plan Total Percentage: ${totalPct}%`);
      expect(totalPct).toBe(100);

      // 6. Milestone Payment Amounts Total Total Project Cost
      const totalDisbursement = stages.reduce((s: number, st: any) => s + st.amount, 0);
      console.log(`Payment Plan Total Disbursement: ₹${totalDisbursement.toLocaleString('en-IN')} vs Total Cost: ₹${budget.totalProjectCost.toLocaleString('en-IN')}`);
      expect(Math.abs(totalDisbursement - budget.totalProjectCost)).toBeLessThanOrEqual(stages.length);

      // 7. Fixtures Schedule Sum Check
      const fixtureSum = fixtureSchedule.reduce((s, f) => s + (f.amount || 0), 0);
      console.log(`Fixture Schedule Sum: ₹${fixtureSum.toLocaleString('en-IN')} vs Direct Fixtures: ₹${budget.directFixtureCost.toLocaleString('en-IN')}`);
      expect(Math.abs(fixtureSum - budget.directFixtureCost)).toBeLessThanOrEqual(5);
    });
  }
});
