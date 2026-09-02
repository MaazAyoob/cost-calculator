import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { runQAGate } from '../modules/qaGate';
import { getPaymentPlanSummary } from '../modules/payment';
import { getRateMasterMetadata } from '../data/brandDatabase';

const BENCHMARK_INPUT: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 30,
  plotWidth: 40,
  floors: 2,
  houseType: 'Duplex',
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 1,
  evCharging: false,
  liftRequired: false,
  qualityTier: 'Premium',
  rooms: {
    bedrooms: 3,
    bathrooms: 3,
    commonToilets: 1,
    kitchen: 1,
    living: 1,
    dining: 1,
    balcony: 1,
    utility: 1,
    pooja: 1,
    office: 0,
    storeRoom: 0,
  },
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    doors: 'Premium Teak',
    windows: 'Fenesta uPVC',
    flooring: 'Vitrified',
    bathroom: 'Kohler',
    electrical: 'Finolex',
    paint: 'Asian Paints Royale',
  },
  flooringZones: {
    living: 'Vitrified Tiles 800x800mm',
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
    mainDoor: 'Premium Teak',
    internalDoor: 'Flush Door',
    bathroomDoor: 'WPC Door',
  },
  windows: {
    primaryMaterial: 'uPVC',
    subGrade: 'Kommerling Premium uPVC',
  },
  electrical: {
    conduit: 'Heavy-Duty ISI Marked PVC',
    wireTier: 'Premium (Finolex / Polycab)',
  },
  bathroomFittings: {
    cpvcBrand: 'Astral',
    sanitaryTier: 'Kohler / Jaquar',
  },
  painting: {
    baseLayer: 'Putty + Primer',
    internalPaint: 'Premium Emulsion',
    externalPaint: 'Ultima Weather Proof',
    brand: 'Asian Paints',
  },
};

describe('HUTTY Launch Readiness & P0-P1 Implementation Verification', () => {
  const result = runCalculator(BENCHMARK_INPUT);

  // ── P0.1: WINDOW & VENTILATOR RECONCILIATION ──
  describe('P0.1: Window & Ventilator Calculations', () => {
    it('satisfies count × width × height = area for all window schedule items', () => {
      expect(result.windowSchedule.length).toBeGreaterThan(0);
      result.windowSchedule.forEach((w) => {
        const expectedArea = w.count * w.widthFt * w.heightFt;
        expect(w.totalOpeningAreaSqFt).toBeCloseTo(expectedArea, 1);
        expect(w.totalAreaSqFt).toBeCloseTo(expectedArea, 1);
        // Quantity field must be the total area in sq.ft, never raw opening count
        expect(w.quantity).toBeCloseTo(expectedArea, 1);
        expect(w.unit).toBe('Sq Ft');
      });
    });

    it('satisfies area × rate = amount for all window schedule items', () => {
      result.windowSchedule.forEach((w) => {
        const expectedAmount = Math.round(w.totalOpeningAreaSqFt * w.unitRate);
        expect(w.amount).toBe(expectedAmount);
      });
    });

    it('preserves separate count, dimensions, and area fields', () => {
      const bedWindow = result.windowSchedule.find((w) => w.code.includes('W-BED'));
      expect(bedWindow).toBeDefined();
      if (bedWindow) {
        expect(bedWindow.count).toBe(3);
        expect(bedWindow.widthFt).toBe(5.0);
        expect(bedWindow.heightFt).toBe(4.0);
        expect(bedWindow.unitAreaSqFt).toBe(20.0);
        expect(bedWindow.totalOpeningAreaSqFt).toBe(60.0);
        expect(bedWindow.quantity).toBe(60.0);
        expect(bedWindow.unit).toBe('Sq Ft');
        expect(bedWindow.amount).toBe(60 * bedWindow.unitRate);
      }
    });
  });

  // ── P0.2: PAYMENT ROADMAP ──
  describe('P0.2: Milestone Payment Roadmap', () => {
    it('contains all 11 stages totaling 100%', () => {
      expect(result.paymentPlan.length).toBe(11);
      const totalPct = result.paymentPlan.reduce((sum, p) => sum + p.percentage, 0);
      expect(totalPct).toBe(100);
    });

    it('totals exactly to total project cost with 0 rounding residual', () => {
      const totalAmount = result.paymentPlan.reduce((sum, p) => sum + p.amount, 0);
      expect(totalAmount).toBe(result.budget.totalProjectCost);
    });

    it('produces valid PaymentPlanSummary marked as complete', () => {
      const summary = getPaymentPlanSummary(result.paymentPlan, result.budget.totalProjectCost);
      expect(summary.isComplete).toBe(true);
      expect(summary.totalAllocatedPercentage).toBe(100);
      expect(summary.unallocatedPercentage).toBe(0);
      expect(summary.totalAllocatedAmount).toBe(result.budget.totalProjectCost);
      expect(summary.unallocatedAmount).toBe(0);
      expect(summary.scheduleType).toBe('Complete');
    });
  });

  // ── P0.6: BATHROOM FIXTURE CONSISTENCY ──
  describe('P0.6: Bathroom Fixture Consistency', () => {
    it('derives fixtures directly from configured spaces without silent drift', () => {
      // 3 bathrooms + 1 common toilet = 4 toilets total
      expect(result.quantities.wcCount).toBe(4);
      expect(result.quantities.washBasinCount).toBe(4);
      expect(result.quantities.healthFaucetCount).toBe(4);
      // 3 full bathrooms have showers
      expect(result.quantities.showerCount).toBe(3);
    });

    it('honors explicit user fixture overrides when provided', () => {
      const overriddenInput: EngineInput = {
        ...BENCHMARK_INPUT,
        fixtureOverrides: {
          wcCount: 5,
          washBasinCount: 5,
          showerCount: 4,
          healthFaucetCount: 5,
        },
      };
      const overriddenResult = runCalculator(overriddenInput);
      expect(overriddenResult.quantities.wcCount).toBe(5);
      expect(overriddenResult.quantities.washBasinCount).toBe(5);
      expect(overriddenResult.quantities.showerCount).toBe(4);
      expect(overriddenResult.quantities.healthFaucetCount).toBe(5);
    });
  });

  // ── P1: COMMERCIAL RECONCILIATION ──
  describe('P1: Commercial Layers Reconciliation', () => {
    it('disaggregates contractor margin, contingency, fees, and GST into separate heads', () => {
      const heads = result.budget.heads;
      const marginHead = heads.find((h) => h.id === 'contractorMargin');
      const contingencyHead = heads.find((h) => h.id === 'contingency');
      const feesHead = heads.find((h) => h.id === 'professionalFees');
      const gstHead = heads.find((h) => h.id === 'gst');

      expect(marginHead).toBeDefined();
      expect(contingencyHead).toBeDefined();
      expect(feesHead).toBeDefined();
      expect(gstHead).toBeDefined();

      expect(marginHead?.allocatedAmount).toBe(result.budget.contractorMargin);
      expect(contingencyHead?.allocatedAmount).toBe(result.budget.contingency);
      expect(feesHead?.allocatedAmount).toBe(result.budget.professionalFees);
      expect(gstHead?.allocatedAmount).toBe(result.budget.gstAmount);
    });

    it('achieves 0 unexplained commercial residual', () => {
      const recon = result.commercialReconciliation;
      expect(recon).toBeDefined();
      if (recon) {
        expect(recon.unexplainedResidual).toBe(0);
        expect(recon.isFullyReconciled).toBe(true);
        expect(recon.reconciledSum).toBe(result.budget.totalProjectCost);
      }
    });
  });

  // ── P1: RATE MASTER METADATA ──
  describe('P1: Rate Master Metadata', () => {
    it('resolves complete Rate Master metadata with basis, GST, transport, and source', () => {
      const steelMeta = getRateMasterMetadata('steel', 'Tata Tiscon 550D', 78000, 'Tonne');
      expect(steelMeta.rateBasis).toBe('material-only');
      expect(steelMeta.gstTreatment).toBe('excluded');
      expect(steelMeta.transportTreatment).toBe('included');
      expect(steelMeta.source).toBeDefined();
      expect(steelMeta.location).toBe('Bengaluru / Mysuru');

      const windowMeta = getRateMasterMetadata('windows', 'Kommerling Premium uPVC', 850, 'Sq Ft');
      expect(windowMeta.rateBasis).toBe('installed');
      expect(windowMeta.location).toBe('Bengaluru / Mysuru');
    });
  });

  // ── P0.4: CALCULATION TRACEABILITY ──
  describe('P0.4: Calculation Traceability Audit', () => {
    it('provides comprehensive traceability chains with rule ID, formula, and explanation', () => {
      expect(result.trace.length).toBeGreaterThanOrEqual(10);
      const ruleIds = result.trace.map((t) => t.ruleId);
      expect(ruleIds).toContain('RULE-STEEL-01');
      expect(ruleIds).toContain('RULE-CEMENT-01');
      expect(ruleIds).toContain('RULE-MASONRY-01');
      expect(ruleIds).toContain('RULE-FLOORING-01');
      expect(ruleIds).toContain('RULE-DADO-01');
      expect(ruleIds).toContain('RULE-WATERPROOFING-01');
      expect(ruleIds).toContain('RULE-CPVC-01');
      expect(ruleIds).toContain('RULE-CABLE-01');
      expect(ruleIds).toContain('RULE-WINDOWS-01');
      expect(ruleIds).toContain('RULE-DOORS-01');

      result.trace.forEach((step) => {
        expect(step.ruleId).toBeDefined();
        expect(step.formula).toBeDefined();
        expect(step.assumption).toBeDefined();
        expect(step.result).toBeDefined();
      });
    });
  });

  // ── P0.7: AUTOMATED QA GATE ──
  describe('P0.7: Automated QA Gate', () => {
    it('passes all 11 checks on benchmark project', () => {
      const qa = result.qaResult;
      expect(qa).toBeDefined();
      if (qa) {
        expect(qa.passed).toBe(true);
        expect(qa.blockingErrors.length).toBe(0);
        expect(qa.checks.length).toBe(11);
        qa.checks.forEach((check) => {
          expect(check.passed).toBe(true);
        });
      }
    });

    it('blocks validation if an artificial dimensional or rate inconsistency is introduced', () => {
      const corruptData = {
        ...result,
        windowSchedule: [
          ...result.windowSchedule,
          {
            code: 'W-CORRUPT',
            spaceType: 'Test',
            description: 'Corrupted Window',
            openingSize: '5.0 ft × 4.0 ft',
            count: 2,
            widthFt: 5.0,
            heightFt: 4.0,
            unitAreaSqFt: 20,
            totalOpeningAreaSqFt: 40,
            totalAreaSqFt: 40,
            quantity: 2, // INTENTIONAL ERROR: Count instead of Area!
            unit: 'Sq Ft',
            material: 'uPVC',
            unitRate: 500,
            amount: 25000, // INTENTIONAL ERROR: 40 * 500 != 25000!
            specification: 'Test',
          },
        ],
      };

      const corruptQA = runQAGate(corruptData as any);
      expect(corruptQA.passed).toBe(false);
      expect(corruptQA.blockingErrors.length).toBeGreaterThan(0);
    });
  });
});
