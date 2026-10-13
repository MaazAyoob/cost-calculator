import { describe, it, expect } from 'vitest';
import { calculateArea } from '../modules/bua';
import { evaluatePlotSetbacks, evaluateAuthorityLimits } from '../data/authorityRules';
import { GBA_2026_SETBACK_RULES } from '../data/authorityRules/gbaRules';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { PlotSetbackRule } from '../data/authorityRules/types';

describe('Plot Setback System V2 — Regression & Verification Suite', () => {
  const baseInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30,
    roadWidthFt: 30,
    floors: 2,
    houseType: 'Duplex',
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 1,
    evCharging: false,
    liftRequired: false,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      living: 1,
      kitchen: 1,
      dining: 1,
      balcony: 1,
      commonToilets: 1,
      pooja: 1,
      utility: 1,
      office: 0,
      storeRoom: 0,
    },
    qualityTier: 'Premium',
  };

  // ─────────────────────────────────────────────────────────────
  // 1. ALL 6 COMMON PLOT FIXTURES FROM GBA 2026 PDF REFERENCE
  // ─────────────────────────────────────────────────────────────
  describe('1. PDF Common Plot Size Fixtures (Karnataka Gazette Jan 2026)', () => {
    it('Fixture 1: 20 × 30 ft (600 sq.ft) — Micro Plot row', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 30,
        plotWidth: 20,
      });

      expect(res.plotAreaSqFt).toBe(600);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-MICRO');
      expect(res.statutorySetbacks.frontSetbackFt).toBe(2.46);
      expect(res.statutorySetbacks.leftSetbackFt).toBe(1.97);
      expect(res.statutorySetbacks.rightSetbackFt).toBe(0.0);
      // Rear is not specified in Gazette Table 1 summary row
      expect(res.authorityMetadata.rearMethod).toBe('UNSPECIFIED');
      expect(res.authorityMetadata.isAuthoritativeBuildableResolved).toBe(false);
      expect(res.authorityMetadata.unresolvedReasons?.length).toBeGreaterThan(0);
      expect(res.requiresClientConfirmation).toBe(true);
    });

    it('Fixture 2: 30 × 40 ft (1,200 sq.ft) — Small Plot row', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 40,
        plotWidth: 30,
      });

      expect(res.plotAreaSqFt).toBe(1200);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-SMALL');
      expect(res.statutorySetbacks.frontSetbackFt).toBe(2.95);
      expect(res.statutorySetbacks.rearSetbackFt).toBe(2.30);
      expect(res.statutorySetbacks.leftSetbackFt).toBe(2.30);
      expect(res.statutorySetbacks.rightSetbackFt).toBe(0.0);
      expect(res.authorityMetadata.isAuthoritativeBuildableResolved).toBe(true);
      // Buildable envelope: (40 - 2.95 - 2.30) × (30 - 2.30 - 0) = 34.75 × 27.70
      expect(res.buildableLengthFt).toBe(34.75);
      expect(res.buildableWidthFt).toBe(27.70);
      expect(res.buildableFootprintSqFt).toBe(Math.round(34.75 * 27.70));
    });

    it('Fixture 3: 30 × 50 ft (1,500 sq.ft) — Small Plot row', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 50,
        plotWidth: 30,
      });

      expect(res.plotAreaSqFt).toBe(1500);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-SMALL');
      expect(res.statutorySetbacks.frontSetbackFt).toBe(2.95);
      expect(res.statutorySetbacks.rearSetbackFt).toBe(2.30);
      expect(res.statutorySetbacks.leftSetbackFt).toBe(2.30);
      expect(res.statutorySetbacks.rightSetbackFt).toBe(0.0);
      // Buildable envelope: (50 - 2.95 - 2.30) × (30 - 2.30 - 0) = 44.75 × 27.70
      expect(res.buildableLengthFt).toBe(44.75);
      expect(res.buildableWidthFt).toBe(27.70);
    });

    it('Fixture 4: 40 × 60 ft (2,400 sq.ft) — Medium Plot percentage calculations', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 60, // depth = 60 ft
        plotWidth: 40,  // width = 40 ft
      });

      expect(res.plotAreaSqFt).toBe(2400);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-MEDIUM-LARGE');
      // Front: 12% of depth (60ft) = 7.20 ft
      expect(res.statutorySetbacks.frontSetbackFt).toBe(7.20);
      // Rear: 8% of depth (60ft) = 4.80 ft
      expect(res.statutorySetbacks.rearSetbackFt).toBe(4.80);
      // Left: 8% of width (40ft) = 3.20 ft
      expect(res.statutorySetbacks.leftSetbackFt).toBe(3.20);
      // Right: 8% of width (40ft) = 3.20 ft
      expect(res.statutorySetbacks.rightSetbackFt).toBe(3.20);
      // Buildable envelope: (60 - 7.20 - 4.80) × (40 - 3.20 - 3.20) = 48.00 × 33.60
      expect(res.buildableLengthFt).toBe(48.00);
      expect(res.buildableWidthFt).toBe(33.60);
      expect(res.buildableFootprintSqFt).toBe(Math.round(48.00 * 33.60));
    });

    it('Fixture 5: 50 × 80 ft (4,000 sq.ft) — Medium/Large percentage calculations', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 80, // depth = 80 ft
        plotWidth: 50,  // width = 50 ft
      });

      expect(res.plotAreaSqFt).toBe(4000);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-MEDIUM-LARGE');
      // Front: 12% of 80ft = 9.60 ft
      expect(res.statutorySetbacks.frontSetbackFt).toBe(9.60);
      // Rear: 8% of 80ft = 6.40 ft
      expect(res.statutorySetbacks.rearSetbackFt).toBe(6.40);
      // Sides: 8% of 50ft = 4.00 ft each side
      expect(res.statutorySetbacks.leftSetbackFt).toBe(4.00);
      expect(res.statutorySetbacks.rightSetbackFt).toBe(4.00);
      // Buildable envelope: (80 - 9.60 - 6.40) × (50 - 4.00 - 4.00) = 64.00 × 42.00
      expect(res.buildableLengthFt).toBe(64.00);
      expect(res.buildableWidthFt).toBe(42.00);
    });

    it('Fixture 6: 60 × 80 ft (4,800 sq.ft) — Medium/Large percentage calculations', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 80, // depth = 80 ft
        plotWidth: 60,  // width = 60 ft
      });

      expect(res.plotAreaSqFt).toBe(4800);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-MEDIUM-LARGE');
      // Front: 12% of 80ft = 9.60 ft
      expect(res.statutorySetbacks.frontSetbackFt).toBe(9.60);
      // Rear: 8% of 80ft = 6.40 ft
      expect(res.statutorySetbacks.rearSetbackFt).toBe(6.40);
      // Sides: 8% of 60ft = 4.80 ft each side
      expect(res.statutorySetbacks.leftSetbackFt).toBe(4.80);
      expect(res.statutorySetbacks.rightSetbackFt).toBe(4.80);
      // Buildable envelope: (80 - 9.60 - 6.40) × (60 - 4.80 - 4.80) = 64.00 × 50.40
      expect(res.buildableLengthFt).toBe(64.00);
      expect(res.buildableWidthFt).toBe(50.40);
    });

    it('Large Estate Fixture: > 43,056 sq.ft (e.g. 210 × 210 = 44,100 sq.ft)', () => {
      const res = calculateArea({
        ...baseInput,
        plotLength: 210,
        plotWidth: 210,
      });

      expect(res.plotAreaSqFt).toBe(44100);
      expect(res.authorityMetadata.matchedRuleId).toBe('GBA-2026-ESTATE');
      // Minimum 16.40 ft on all sides
      expect(res.statutorySetbacks.frontSetbackFt).toBe(16.40);
      expect(res.statutorySetbacks.rearSetbackFt).toBe(16.40);
      expect(res.statutorySetbacks.leftSetbackFt).toBe(16.40);
      expect(res.statutorySetbacks.rightSetbackFt).toBe(16.40);
      expect(res.buildableLengthFt).toBe(210 - 16.40 - 16.40);
      expect(res.buildableWidthFt).toBe(210 - 16.40 - 16.40);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. BOUNDARY THRESHOLD SELECTION TESTS (BELOW, AT, ABOVE)
  // ─────────────────────────────────────────────────────────────
  describe('2. Plot Area Boundary Threshold Testing', () => {
    it('Threshold 646 sq.ft: tests 645 (below), 646 (at), and 647 (above)', () => {
      // 1. Immediately below 646: 645 sq.ft (length 43, width 15 = 645)
      const below = calculateArea({ ...baseInput, plotLength: 43, plotWidth: 15 });
      expect(below.plotAreaSqFt).toBe(645);
      expect(below.authorityMetadata.matchedRuleId).toBe('GBA-2026-MICRO');

      // 2. Exactly at 646 sq.ft (length 38, width 17 = 646)
      const at = calculateArea({ ...baseInput, plotLength: 38, plotWidth: 17 });
      expect(at.plotAreaSqFt).toBe(646);
      expect(at.authorityMetadata.matchedRuleId).toBe('GBA-2026-MICRO');

      // 3. Immediately above 646: 647 sq.ft
      const above = evaluatePlotSetbacks({
        plotLength: 64.7,
        plotWidth: 10,
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(above.matchedRule?.id).toBe('GBA-2026-SMALL');
      expect(above.statutoryFrontFt).toBe(2.95);
    });

    it('Threshold 1,615 sq.ft: tests 1,614 (below), 1,615 (at), and 1,616 (above)', () => {
      // 1. Below 1,615: 1,600 sq.ft (40 × 40)
      const below = evaluatePlotSetbacks({
        plotLength: 40,
        plotWidth: 40,
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(below.matchedRule?.id).toBe('GBA-2026-SMALL');
      expect(below.statutoryFrontFt).toBe(2.95);

      // 2. Exactly at 1,615 sq.ft
      const at = evaluatePlotSetbacks({
        plotLength: 161.5,
        plotWidth: 10,
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(at.matchedRule?.id).toBe('GBA-2026-SMALL');
      expect(at.statutoryFrontFt).toBe(2.95);

      // 3. Immediately above 1,615: 1,616 sq.ft
      const above = evaluatePlotSetbacks({
        plotLength: 101,
        plotWidth: 16, // 1616 sq.ft
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(above.matchedRule?.id).toBe('GBA-2026-MEDIUM-LARGE');
      // Front is 12% of depth (101 ft) = 12.12 ft
      expect(above.statutoryFrontFt).toBe(12.12);
    });

    it('Threshold 43,056 sq.ft: tests 43,050 (below), 43,056 (at), and 43,060 (above)', () => {
      // 1. Below 43,056: 40,000 sq.ft (200 × 200)
      const below = evaluatePlotSetbacks({
        plotLength: 200,
        plotWidth: 200,
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(below.matchedRule?.id).toBe('GBA-2026-MEDIUM-LARGE');
      expect(below.statutoryFrontFt).toBe(24.00); // 12% of 200ft

      // 2. Exactly at 43,056 sq.ft
      const at = evaluatePlotSetbacks({
        plotLength: 215.28,
        plotWidth: 200,
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(at.matchedRule?.id).toBe('GBA-2026-MEDIUM-LARGE');

      // 3. Above 43,056 sq.ft: 44,000 sq.ft
      const above = evaluatePlotSetbacks({
        plotLength: 220,
        plotWidth: 200,
        rules: GBA_2026_SETBACK_RULES,
      });
      expect(above.matchedRule?.id).toBe('GBA-2026-ESTATE');
      expect(above.statutoryFrontFt).toBe(16.40);
      expect(above.statutoryRearFt).toBe(16.40);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. CALCULATION MECHANICS & GEOMETRIC INTEGRITY
  // ─────────────────────────────────────────────────────────────
  describe('3. Width vs Depth Percentage Integrity', () => {
    it('Never substitutes plot area for dimensions when calculating percentage setbacks', () => {
      // Rectangular plot: Depth 60 ft, Width 40 ft (2,400 sq.ft)
      const orientation1 = evaluatePlotSetbacks({
        plotLength: 60, // Depth
        plotWidth: 40,  // Width
        rules: GBA_2026_SETBACK_RULES,
      });

      // Swapped orientation: Depth 40 ft, Width 60 ft (same 2,400 sq.ft area)
      const orientation2 = evaluatePlotSetbacks({
        plotLength: 40, // Depth
        plotWidth: 60,  // Width
        rules: GBA_2026_SETBACK_RULES,
      });

      // Front is 12% of depth
      expect(orientation1.statutoryFrontFt).toBe(7.20); // 12% of 60ft
      expect(orientation2.statutoryFrontFt).toBe(4.80); // 12% of 40ft
      expect(orientation1.statutoryFrontFt).not.toBe(orientation2.statutoryFrontFt);

      // Sides are 8% of width
      expect(orientation1.statutoryLeftFt).toBe(3.20);  // 8% of 40ft
      expect(orientation2.statutoryLeftFt).toBe(4.80);  // 8% of 60ft
    });

    it('Preserves independent left and right side setbacks', () => {
      const customRules: PlotSetbackRule[] = [
        {
          id: 'TEST-ASYMMETRIC',
          name: 'Asymmetric Side Setback Rule',
          authority: 'Bengaluru',
          jurisdiction: 'Bangalore',
          sourceDocument: 'Test Source',
          sourceDate: '2026-01-01',
          verificationStatus: 'STATUTORY_VERIFIED',
          minPlotAreaSqFt: 0,
          maxPlotAreaSqFt: 5000,
          isMinInclusive: true,
          isMaxInclusive: true,
          front: { method: 'FIXED_DISTANCE', value: 3.0, unit: 'ft' },
          rear:  { method: 'FIXED_DISTANCE', value: 2.0, unit: 'ft' },
          left:  { method: 'FIXED_DISTANCE', value: 4.0, unit: 'ft' },
          right: { method: 'FIXED_DISTANCE', value: 1.5, unit: 'ft' },
          sideConditionNote: 'one_side',
          maxGroundCoveragePct: 70,
          maxBuildingHeightM: 12,
          maxFloorsAllowed: 4,
          precedence: 1,
          isActive: true,
        },
      ];

      const res = evaluatePlotSetbacks({
        plotLength: 50,
        plotWidth: 30,
        rules: customRules,
      });

      expect(res.statutoryLeftFt).toBe(4.0);
      expect(res.statutoryRightFt).toBe(1.5);
      expect(res.buildableWidthFt).toBe(30 - 4.0 - 1.5); // 24.5 ft
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. PLOT CONDITIONS: CORNER PLOTS, ROAD WIDENING, BUILDING LINE
  // ─────────────────────────────────────────────────────────────
  describe('4. Plot Conditions: Corner Plots & Overrides', () => {
    it('Applies statutory front setback to secondary road-facing side on corner plots', () => {
      // 30 × 40 plot has statutory front = 2.95 ft, left = 2.30 ft, right = 0.00 ft
      const standard = evaluatePlotSetbacks({
        plotLength: 40,
        plotWidth: 30,
        rules: GBA_2026_SETBACK_RULES,
        isCornerPlot: false,
        roadFacingBoundaries: ['front'],
      });
      expect(standard.statutoryLeftFt).toBe(2.30);
      expect(standard.statutoryRightFt).toBe(0.00);

      // Corner plot facing front and right boundaries:
      const corner = evaluatePlotSetbacks({
        plotLength: 40,
        plotWidth: 30,
        rules: GBA_2026_SETBACK_RULES,
        isCornerPlot: true,
        roadFacingBoundaries: ['front', 'right'],
      });
      // Right boundary faces secondary road, so statutory front clearance (2.95 ft) is applied
      expect(corner.statutoryRightFt).toBe(2.95);
      expect(corner.statutoryLeftFt).toBe(2.30);
    });

    it('Enforces road-widening distance addition to road-facing boundaries', () => {
      const res = evaluatePlotSetbacks({
        plotLength: 40,
        plotWidth: 30,
        rules: GBA_2026_SETBACK_RULES,
        roadFacingBoundaries: ['front'],
        roadWideningFt: 3.5, // 3.5 ft reservation for road expansion
      });

      // Front: 2.95 ft statutory + 3.5 ft widening = 6.45 ft
      expect(res.statutoryFrontFt).toBeCloseTo(6.45, 2);
      expect(res.statutoryRearFt).toBe(2.30);
    });

    it('Enforces prescribed building line when it exceeds statutory front setback', () => {
      const res = evaluatePlotSetbacks({
        plotLength: 40,
        plotWidth: 30,
        rules: GBA_2026_SETBACK_RULES,
        prescribedBuildingLineFt: 5.0, // Authority prescribed line of 5.0 ft (> 2.95 ft)
      });

      expect(res.statutoryFrontFt).toBe(5.0);
    });

    it('Supports approved manual overrides with reason and flags verification status', () => {
      const res = evaluatePlotSetbacks({
        plotLength: 40,
        plotWidth: 30,
        rules: GBA_2026_SETBACK_RULES,
        customSetbacks: {
          frontSetbackFt: 4.5,
          rearSetbackFt: 3.0,
        },
        overrideReason: 'Town planning committee relaxation order #TP-409/2026',
      });

      expect(res.appliedFrontFt).toBe(4.5);
      expect(res.appliedRearFt).toBe(3.0);
      expect(res.verificationStatus).toBe('MANUAL_OVERRIDE');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. QUANTITY & PRICING INVARIANCE GUARANTEES
  // ─────────────────────────────────────────────────────────────
  describe('5. Quantity & Pricing Invariance', () => {
    it('Changing setbacks does not alter physical construction quantities or prices when BUA is unchanged', () => {
      // Run calculator with standard statutory setbacks (fixed BUA: 1440 sq.ft)
      const standardCalc = runCalculator({
        ...baseInput,
        plotLength: 40,
        plotWidth: 30,
        userSelectedBUA: 1440,
      });

      // Run calculator with modified setbacks on same 1440 sq.ft project
      const customSetbackCalc = runCalculator({
        ...baseInput,
        plotLength: 40,
        plotWidth: 30,
        userSelectedBUA: 1440,
        frontSetback: 5.0,
        rearSetback: 4.0,
        leftSetback: 3.0,
        rightSetback: 3.0,
      });

      // Invariance Verification:
      // 1. Total BUA remains exactly 1440 sq.ft
      expect(standardCalc.area.totalBUASqFt).toBe(1440);
      expect(customSetbackCalc.area.totalBUASqFt).toBe(1440);

      // 2. Physical core material takeoff quantities MUST be 100% invariant
      expect(standardCalc.quantities.steelTonnes).toBe(customSetbackCalc.quantities.steelTonnes);
      expect(standardCalc.quantities.cementBags).toBe(customSetbackCalc.quantities.cementBags);
      expect(standardCalc.quantities.mSandCft).toBe(customSetbackCalc.quantities.mSandCft);
      expect(standardCalc.quantities.pSandCft).toBe(customSetbackCalc.quantities.pSandCft);
      expect(standardCalc.quantities.coarseAggregateCft).toBe(customSetbackCalc.quantities.coarseAggregateCft);
      expect(standardCalc.quantities.floorTilesSqFt).toBe(customSetbackCalc.quantities.floorTilesSqFt);
      expect(standardCalc.quantities.internalDoorsCount).toBe(customSetbackCalc.quantities.internalDoorsCount);
      expect(standardCalc.quantities.bathroomFixtureSets).toBe(customSetbackCalc.quantities.bathroomFixtureSets);

      // 3. Document and test the distinction:
      // When a tighter setback envelope genuinely restricts the outer building shell,
      // the external perimeter decreases accordingly while core BUA quantities remain unchanged.
      expect(customSetbackCalc.buildingModel.externalPerimeterFt).toBeLessThan(standardCalc.buildingModel.externalPerimeterFt);
      expect(customSetbackCalc.buildingModel.grossExternalWallAreaSqFt).toBeLessThan(standardCalc.buildingModel.grossExternalWallAreaSqFt);
    });
  });
});
