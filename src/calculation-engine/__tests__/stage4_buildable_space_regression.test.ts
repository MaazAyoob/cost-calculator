import { describe, it, expect } from 'vitest';
import { evaluatePlotSetbacks } from '../data/authorityRules';

describe('Stage 4 Buildable Space & Setback Regression Suite', () => {
  // ── 1. 30 × 40 ft Plot (1,200 sq.ft — Small Residential Category) ──
  it('correctly evaluates 30 × 40 ft plot under GBA 2026 Table 1 rules', () => {
    const result = evaluatePlotSetbacks({
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
    });

    expect(result).toBeDefined();
    expect(result.appliedFrontFt).toBeCloseTo(2.95, 2);
    expect(result.appliedRearFt).toBeCloseTo(2.30, 2);
    expect(result.appliedLeftFt).toBeCloseTo(2.30, 2);
    expect(result.appliedRightFt).toBeCloseTo(0.00, 2);

    // Buildable width = 30 - 2.30 - 0 = 27.70 ft
    expect(result.buildableWidthFt).toBeCloseTo(27.70, 2);
    // Buildable depth = 40 - 2.95 - 2.30 = 34.75 ft
    expect(result.buildableLengthFt).toBeCloseTo(34.75, 2);
    // Buildable footprint = 27.70 * 34.75 = 962.58 -> 963 sq.ft
    expect(result.buildableFootprintSqFt).toBe(963);
    expect(result.isAuthoritativeBuildableResolved).toBe(true);

    // Ensure formatters like .toFixed(1) succeed without undefined errors
    expect(result.appliedFrontFt.toFixed(1)).toBe('3.0');
    expect(result.appliedRearFt.toFixed(1)).toBe('2.3');
    expect(result.appliedLeftFt.toFixed(1)).toBe('2.3');
    expect(result.appliedRightFt.toFixed(1)).toBe('0.0');
  });

  // ── 2. 40 × 60 ft Plot (2,400 sq.ft — Category C: > 150 to 250 sq.m) ──
  it('correctly evaluates 40 × 60 ft plot under Category C fixed rules', () => {
    const result = evaluatePlotSetbacks({
      plotLength: 60,
      plotWidth: 40,
      roadWidthFt: 30,
    });

    expect(result).toBeDefined();
    // Front: 1.00m = 3.28 ft
    expect(result.appliedFrontFt).toBeCloseTo(3.28, 2);
    // Rear: 0.80m = 2.62 ft
    expect(result.appliedRearFt).toBeCloseTo(2.62, 2);
    // Left: 0.80m = 2.62 ft
    expect(result.appliedLeftFt).toBeCloseTo(2.62, 2);
    // Right: 0.80m = 2.62 ft
    expect(result.appliedRightFt).toBeCloseTo(2.62, 2);

    // Buildable width = 40 - 2.62 - 2.62 = 34.76 ft
    expect(result.buildableWidthFt).toBeCloseTo(34.76, 2);
    // Buildable depth = 60 - 3.28 - 2.62 = 54.10 ft
    expect(result.buildableLengthFt).toBeCloseTo(54.10, 2);
    // Buildable footprint = 34.76 * 54.10 = 1880.5 -> 1881 sq.ft
    expect(result.buildableFootprintSqFt).toBe(1881);

    expect(result.appliedFrontFt.toFixed(2)).toBe('3.28');
    expect(result.appliedRearFt.toFixed(2)).toBe('2.62');
    expect(result.appliedLeftFt.toFixed(2)).toBe('2.62');
    expect(result.appliedRightFt.toFixed(2)).toBe('2.62');
  });

  // ── 3. Edge Case: Missing, Zero, or Boundary Inputs ──
  it('handles zero or missing dimensions gracefully without throwing exceptions', () => {
    const resultZero = evaluatePlotSetbacks({
      plotLength: 0,
      plotWidth: 0,
      roadWidthFt: 30,
    });

    expect(resultZero).toBeDefined();
    expect(typeof resultZero.appliedFrontFt).toBe('number');
    expect(typeof resultZero.appliedRearFt).toBe('number');
    expect(typeof resultZero.appliedLeftFt).toBe('number');
    expect(typeof resultZero.appliedRightFt).toBe('number');
    expect(resultZero.buildableFootprintSqFt).toBe(0);

    // Formatter calls must never crash
    expect(resultZero.appliedFrontFt.toFixed(1)).toBeDefined();
    expect(resultZero.appliedRearFt.toFixed(1)).toBeDefined();
  });

  // ── 4. Custom Setbacks Override Integration ──
  it('correctly incorporates custom surveyor clearances when provided', () => {
    const customResult = evaluatePlotSetbacks({
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
      customSetbacks: {
        frontSetbackFt: 4.0,
        rearSetbackFt: 3.0,
        leftSetbackFt: 2.5,
        rightSetbackFt: 1.5,
      },
    });

    expect(customResult.appliedFrontFt).toBe(4.0);
    expect(customResult.appliedRearFt).toBe(3.0);
    expect(customResult.appliedLeftFt).toBe(2.5);
    expect(customResult.appliedRightFt).toBe(1.5);

    // Buildable width = 30 - 2.5 - 1.5 = 26.0 ft
    expect(customResult.buildableWidthFt).toBe(26.0);
    // Buildable depth = 40 - 4.0 - 3.0 = 33.0 ft
    expect(customResult.buildableLengthFt).toBe(33.0);
    // Buildable footprint = 26.0 * 33.0 = 858 sq.ft
    expect(customResult.buildableFootprintSqFt).toBe(858);
  });

  // ── 5. Critical Distinction: Geometric Envelope vs 70% Coverage Limit (30 × 40 ft) ──
  it('enforces stricter 70% ground coverage cap (840 sq.ft) over geometric envelope (963 sq.ft) on 30 × 40 ft plot', () => {
    const plotLength = 40;
    const plotWidth = 30;
    const plotAreaSqFt = plotLength * plotWidth; // 1,200 sq.ft

    const setbackEval = evaluatePlotSetbacks({
      plotLength,
      plotWidth,
      roadWidthFt: 30,
    });

    const geometricEnvelopeSqFt = setbackEval.buildableFootprintSqFt;
    expect(geometricEnvelopeSqFt).toBe(963);

    const maxCoveragePct = setbackEval.maxGroundCoveragePct;
    expect(maxCoveragePct).toBe(70);

    const statutoryCoverageCapSqFt = Math.round(plotAreaSqFt * (maxCoveragePct / 100));
    expect(statutoryCoverageCapSqFt).toBe(840);

    // Permissible construction footprint is strictly governed by the smaller limit
    const permissibleGroundFootprintSqFt = Math.min(geometricEnvelopeSqFt, statutoryCoverageCapSqFt);
    expect(permissibleGroundFootprintSqFt).toBe(840);
    expect(permissibleGroundFootprintSqFt).toBeLessThan(geometricEnvelopeSqFt);
  });

  // ── 6. Critical Distinction: Geometric Envelope vs 70% Coverage Limit (40 × 60 ft) ──
  it('enforces stricter 70% ground coverage cap (1,680 sq.ft) over geometric envelope (1,881 sq.ft) on 40 × 60 ft plot', () => {
    const plotLength = 60;
    const plotWidth = 40;
    const plotAreaSqFt = plotLength * plotWidth; // 2,400 sq.ft

    const setbackEval = evaluatePlotSetbacks({
      plotLength,
      plotWidth,
      roadWidthFt: 30,
    });

    const geometricEnvelopeSqFt = setbackEval.buildableFootprintSqFt;
    expect(geometricEnvelopeSqFt).toBe(1881);

    const maxCoveragePct = setbackEval.maxGroundCoveragePct;
    expect(maxCoveragePct).toBe(70);

    const statutoryCoverageCapSqFt = Math.round(plotAreaSqFt * (maxCoveragePct / 100));
    expect(statutoryCoverageCapSqFt).toBe(1680);

    // Permissible construction footprint is strictly governed by the smaller limit
    const permissibleGroundFootprintSqFt = Math.min(geometricEnvelopeSqFt, statutoryCoverageCapSqFt);
    expect(permissibleGroundFootprintSqFt).toBe(1680);
    expect(permissibleGroundFootprintSqFt).toBeLessThan(geometricEnvelopeSqFt);
  });
});
