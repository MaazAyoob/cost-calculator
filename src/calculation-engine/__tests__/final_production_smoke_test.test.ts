import { describe, it, expect } from 'vitest';
import { evaluatePlotSetbackDetails, evaluateBuildingHeight, getCityPlanningLimits } from '../data/setbackRules';
import { evaluatePlotSetbacks } from '../data/authorityRules';

describe('HUTTY 3.2 — FINAL PRODUCTION SMOKE TEST', () => {
  describe('1. Category A (Plot ≤ 60 sq.m / 646 sq.ft, e.g. 20 × 30 ft = 600 sq.ft)', () => {
    it('applies Front 0.75m (2.46 ft), Rear 0, Left 0.60m (1.97 ft), Right 0 when left side selected', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 30,
        plotWidth: 20,
        selectedSideSetback: 'left',
      });
      expect(res.matchedBracket?.id).toBe('UP_TO_60_SQM');
      expect(res.front.meters).toBe(0.75);
      expect(res.front.feet).toBe(2.46);
      expect(res.rear.meters).toBe(0);
      expect(res.rear.feet).toBe(0);
      expect(res.left.meters).toBe(0.60);
      expect(res.left.feet).toBe(1.97);
      expect(res.right.meters).toBe(0);
      expect(res.right.feet).toBe(0);
      expect(res.isOutOfScope).toBe(false);
    });

    it('applies Right 0.60m (1.97 ft) and Left 0 when right side selected', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 30,
        plotWidth: 20,
        selectedSideSetback: 'right',
      });
      expect(res.matchedBracket?.id).toBe('UP_TO_60_SQM');
      expect(res.left.feet).toBe(0);
      expect(res.right.feet).toBe(1.97);
    });
  });

  describe('2. Category B (Plot > 60 and ≤ 150 sq.m / 646–1615 sq.ft, e.g. 30 × 40 ft = 1,200 sq.ft)', () => {
    it('applies Front 0.90m (2.95 ft), Rear 0.70m (2.30 ft), Left 0.70m (2.30 ft), Right 0 when left side selected', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 40,
        plotWidth: 30,
        selectedSideSetback: 'left',
      });
      expect(res.matchedBracket?.id).toBe('60_TO_150_SQM');
      expect(res.front.meters).toBe(0.90);
      expect(res.front.feet).toBe(2.95);
      expect(res.rear.meters).toBe(0.70);
      expect(res.rear.feet).toBe(2.30);
      expect(res.left.meters).toBe(0.70);
      expect(res.left.feet).toBe(2.30);
      expect(res.right.meters).toBe(0);
      expect(res.right.feet).toBe(0);
      expect(res.isOutOfScope).toBe(false);
    });

    it('applies Right 0.70m (2.30 ft) and Left 0 when right side selected', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 40,
        plotWidth: 30,
        selectedSideSetback: 'right',
      });
      expect(res.matchedBracket?.id).toBe('60_TO_150_SQM');
      expect(res.left.feet).toBe(0);
      expect(res.right.feet).toBe(2.30);
    });
  });

  describe('3. Category C (Plot > 150 and ≤ 250 sq.m / 1615–2691 sq.ft, e.g. 40 × 60 ft = 2,400 sq.ft)', () => {
    it('applies Front 1.00m (3.28 ft), Rear 0.80m (2.62 ft), Left 0.80m (2.62 ft), Right 0.80m (2.62 ft)', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 60,
        plotWidth: 40,
      });
      expect(res.matchedBracket?.id).toBe('150_TO_250_SQM');
      expect(res.front.meters).toBe(1.00);
      expect(res.front.feet).toBe(3.28);
      expect(res.rear.meters).toBe(0.80);
      expect(res.rear.feet).toBe(2.62);
      expect(res.left.meters).toBe(0.80);
      expect(res.left.feet).toBe(2.62);
      expect(res.right.meters).toBe(0.80);
      expect(res.right.feet).toBe(2.62);
      expect(res.isOutOfScope).toBe(false);
    });
  });

  describe('4. Plots > 250 sq.m (Out of Scope, e.g. 50 × 80 ft = 4,000 sq.ft)', () => {
    it('flags plots exceeding 250 sq.m for special review without silently assuming simplified rules', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 80,
        plotWidth: 50,
      });
      expect(res.matchedBracket?.id).toBe('ABOVE_250_SQM');
      expect(res.isOutOfScope).toBe(true);
      expect(res.buildableFootprintSqFt).toBe(0);

      const authRes = evaluatePlotSetbacks({
        plotLength: 80,
        plotWidth: 50,
        roadWidthFt: 30,
      });
      expect(authRes.isAuthoritativeBuildableResolved).toBe(false);
      expect(authRes.unresolvedReasons.some(r => r.includes('Plots exceeding 250 sq.m'))).toBe(true);
    });
  });

  describe('5. Height Rules Verification', () => {
    it('Bengaluru: Without stilt = 12m (39.37 ft), With stilt = 15m (49.21 ft), no road width restriction', () => {
      const narrowRoad = evaluateBuildingHeight({
        city: 'Bangalore',
        hasStilt: false,
        roadWidthFt: 25,
      });
      expect(narrowRoad.maxPermittedHeightM).toBe(12);
      expect(narrowRoad.maxPermittedHeightFt).toBe(39.37);

      const wideRoadWithStilt = evaluateBuildingHeight({
        city: 'Bangalore',
        hasStilt: true,
        roadWidthFt: 40,
      });
      expect(wideRoadWithStilt.maxPermittedHeightM).toBe(15);
      expect(wideRoadWithStilt.maxPermittedHeightFt).toBe(49.21);
    });

    it('Mysuru: Without stilt = 12m, With stilt = 15m; road width < 9m capped at 11.5m (37.73 ft)', () => {
      const narrowRoad = evaluateBuildingHeight({
        city: 'Mysore',
        hasStilt: false,
        roadWidthFt: 25,
      });
      expect(narrowRoad.maxPermittedHeightM).toBe(11.5);
      expect(narrowRoad.maxPermittedHeightFt).toBe(37.73);
      expect(narrowRoad.isRoadWidthRestricted).toBe(true);

      const standardRoad = evaluateBuildingHeight({
        city: 'Mysore',
        hasStilt: false,
        roadWidthFt: 30,
      });
      expect(standardRoad.maxPermittedHeightM).toBe(12);
      expect(standardRoad.maxPermittedHeightFt).toBe(39.37);
      expect(standardRoad.isRoadWidthRestricted).toBe(false);

      const wideRoadWithStilt = evaluateBuildingHeight({
        city: 'Mysore',
        hasStilt: true,
        roadWidthFt: 30,
      });
      expect(wideRoadWithStilt.maxPermittedHeightM).toBe(15);
      expect(wideRoadWithStilt.maxPermittedHeightFt).toBe(49.21);
    });
  });

  describe('6. FAR and Ground Coverage Rules', () => {
    it('Mysuru: 75% max ground coverage and 1.50 FAR (statutory MUDA Master Plan)', () => {
      const mysuruLimits = getCityPlanningLimits('Mysore');
      expect(mysuruLimits.maxGroundCoveragePct).toBe(75);
      expect(mysuruLimits.isCoverageStatutory).toBe(true);
      expect(mysuruLimits.maxFAR).toBe(1.50);
      expect(mysuruLimits.isFARStatutory).toBe(true);
    });

    it('Bengaluru: ~70% baseline planning assumption', () => {
      const blrLimits = getCityPlanningLimits('Bangalore');
      expect(blrLimits.maxGroundCoveragePct).toBe(70);
      expect(blrLimits.isCoverageStatutory).toBe(false);
      expect(blrLimits.maxFAR).toBe(1.75);
      expect(blrLimits.isFARStatutory).toBe(false);
    });
  });
});
