import { describe, it, expect } from 'vitest';
import {
  evaluatePlotSetbackDetails,
  evaluateBuildingHeight,
  getCityPlanningLimits,
  getCitySetbackConfig,
  BENGALURU_SETBACK_CONFIG,
  MYSURU_SETBACK_CONFIG,
} from '../data/setbackRules';
import fs from 'fs';
import path from 'path';

describe('Hutty 3.2 — Final UX Improvement: Central Setback Rules Engine', () => {
  it('maintains separate configuration objects for Bengaluru and Mysuru', () => {
    expect(BENGALURU_SETBACK_CONFIG).toBeDefined();
    expect(MYSURU_SETBACK_CONFIG).toBeDefined();
    expect(BENGALURU_SETBACK_CONFIG).not.toBe(MYSURU_SETBACK_CONFIG);

    expect(BENGALURU_SETBACK_CONFIG.authorityName).toBe('BBMP / BDA');
    expect(MYSURU_SETBACK_CONFIG.authorityName).toBe('MUDA');

    expect(BENGALURU_SETBACK_CONFIG.maxSupportedAreaSqM).toBe(250);
    expect(MYSURU_SETBACK_CONFIG.maxSupportedAreaSqM).toBe(250);
  });

  describe('Location Resolution', () => {
    it('resolves Bengaluru variants', () => {
      expect(getCitySetbackConfig('Bangalore')?.authorityName).toBe('BBMP / BDA');
      expect(getCitySetbackConfig('bengaluru')?.authorityName).toBe('BBMP / BDA');
      expect(getCitySetbackConfig('BDA')?.authorityName).toBe('BBMP / BDA');
    });

    it('resolves Mysuru variants', () => {
      expect(getCitySetbackConfig('Mysore')?.authorityName).toBe('MUDA');
      expect(getCitySetbackConfig('mysuru')?.authorityName).toBe('MUDA');
      expect(getCitySetbackConfig('MUDA')?.authorityName).toBe('MUDA');
    });

    it('rejects unsupported locations cleanly without inventing numbers', () => {
      const result = evaluatePlotSetbackDetails({
        city: 'Chennai',
        plotLength: 40,
        plotWidth: 30,
      });

      expect(result.isSupportedLocation).toBe(false);
      expect(result.unsupportedMessage).toContain('Setback rules for the selected location are not currently available');
      expect(result.front.meters).toBe(0);
      expect(result.buildableFootprintSqFt).toBe(0);
    });
  });

  describe('Case 1: Plot area up to 60 sq. m. (<= 645.83 sq. ft.)', () => {
    it('evaluates a 20 x 30 ft plot (600 sq.ft) with exact locked setback values', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 30,
        plotWidth: 20,
      });

      expect(res.isSupportedLocation).toBe(true);
      expect(res.isOutOfScope).toBe(false);
      expect(res.matchedBracket?.id).toBe('UP_TO_60_SQM');

      // Locked values: Front 0.75m (2.46 ft), Rear 0m, One side 0.60m (1.97 ft), Other side 0m
      expect(res.front.meters).toBe(0.75);
      expect(res.front.feet).toBe(2.46);

      expect(res.rear.meters).toBe(0);
      expect(res.rear.feet).toBe(0);
      expect(res.rear.isZero).toBe(true);
      expect(res.rear.displayText).toBe('0 ft — No setback required under this rule');

      expect(res.left.meters).toBe(0.60);
      expect(res.left.feet).toBe(1.97);

      expect(res.right.meters).toBe(0);
      expect(res.right.feet).toBe(0);
      expect(res.right.isZero).toBe(true);

      expect(res.sideCondition).toBe('one_side');
      expect(res.sideConditionNote).toContain('open space is required on one side only');

      // Buildable geometry:
      // Width: 20 - 1.97 = 18.03 ft
      // Depth: 30 - 2.46 = 27.54 ft
      expect(res.buildableWidthFt).toBe(18.03);
      expect(res.buildableDepthFt).toBe(27.54);
      expect(res.buildableFootprintSqFt).toBe(497); // 18.03 * 27.54 = 496.5462 -> 497
      expect(res.requiredOpenSpaceSqFt).toBe(600 - 497); // 103 sq.ft
      expect(res.isGeometryValid).toBe(true);
    });
  });

  describe('Case 2: Plot area above 60 sq. m. up to 150 sq. m. (645.84 to 1,614.59 sq. ft.)', () => {
    it('evaluates a 30 x 40 ft plot (1,200 sq.ft) with exact locked setback values', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 40,
        plotWidth: 30,
      });

      expect(res.isSupportedLocation).toBe(true);
      expect(res.isOutOfScope).toBe(false);
      expect(res.matchedBracket?.id).toBe('60_TO_150_SQM');

      // Locked values: Front 0.90m (2.95 ft), Rear 0.70m (2.30 ft), One side 0.70m (2.30 ft), Other side 0m
      expect(res.front.meters).toBe(0.90);
      expect(res.front.feet).toBe(2.95);

      expect(res.rear.meters).toBe(0.70);
      expect(res.rear.feet).toBe(2.30);
      expect(res.rear.isZero).toBe(false);

      expect(res.left.meters).toBe(0.70);
      expect(res.left.feet).toBe(2.30);

      expect(res.right.meters).toBe(0);
      expect(res.right.feet).toBe(0);
      expect(res.right.isZero).toBe(true);

      expect(res.sideCondition).toBe('one_side');

      // Buildable geometry:
      // Width: 30 - 2.30 = 27.70 ft
      // Depth: 40 - (2.95 + 2.30) = 40 - 5.25 = 34.75 ft
      expect(res.buildableWidthFt).toBe(27.70);
      expect(res.buildableDepthFt).toBe(34.75);
      expect(res.buildableFootprintSqFt).toBe(963); // 27.70 * 34.75 = 962.575 -> 963
      expect(res.requiredOpenSpaceSqFt).toBe(1200 - 963); // 237 sq.ft
      expect(res.isGeometryValid).toBe(true);
    });
  });

  describe('Case 3: Plot area above 150 sq. m. up to 250 sq. m. (1,614.60 to 2,690.98 sq. ft.)', () => {
    it('evaluates a 30 x 60 ft plot (1,800 sq.ft) with both sides setback values', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 60,
        plotWidth: 30,
      });

      expect(res.isSupportedLocation).toBe(true);
      expect(res.isOutOfScope).toBe(false);
      expect(res.matchedBracket?.id).toBe('150_TO_250_SQM');

      // Locked values: Front 1.00m (3.28 ft), Rear 0.80m (2.62 ft), Left 0.80m (2.62 ft), Right 0.80m (2.62 ft)
      expect(res.front.meters).toBe(1.00);
      expect(res.front.feet).toBe(3.28);

      expect(res.rear.meters).toBe(0.80);
      expect(res.rear.feet).toBe(2.62);

      expect(res.left.meters).toBe(0.80);
      expect(res.left.feet).toBe(2.62);

      expect(res.right.meters).toBe(0.80);
      expect(res.right.feet).toBe(2.62);

      expect(res.sideCondition).toBe('both_sides');
      expect(res.sideConditionNote).toContain('both sides');

      // Buildable geometry:
      // Width: 30 - (2.62 + 2.62) = 24.76 ft
      // Depth: 60 - (3.28 + 2.62) = 54.10 ft
      expect(res.buildableWidthFt).toBe(24.76);
      expect(res.buildableDepthFt).toBe(54.10);
      expect(res.buildableFootprintSqFt).toBe(1340); // 24.76 * 54.10 = 1339.516 -> 1340
      expect(res.requiredOpenSpaceSqFt).toBe(1800 - 1340); // 460 sq.ft
      expect(res.isGeometryValid).toBe(true);
    });

    it('evaluates a 40 x 50 ft plot (2,000 sq.ft) in Mysuru with MUDA authority', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Mysore',
        plotLength: 50,
        plotWidth: 40,
      });

      expect(res.isSupportedLocation).toBe(true);
      expect(res.authorityName).toBe('MUDA');
      expect(res.matchedBracket?.id).toBe('150_TO_250_SQM');

      // Width: 40 - (2.62 + 2.62) = 34.76 ft
      // Depth: 50 - (3.28 + 2.62) = 44.10 ft
      expect(res.buildableWidthFt).toBe(34.76);
      expect(res.buildableDepthFt).toBe(44.10);
      expect(res.buildableFootprintSqFt).toBe(1533); // 34.76 * 44.10 = 1532.916 -> 1533
    });
  });

  describe('Case 4: Plot area above 250 sq. m. (> 2,690.98 sq. ft.) — Out of Scope', () => {
    it('flags plots > 250 sq.m as out-of-scope without fabricating setback numbers', () => {
      const res = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 70,
        plotWidth: 40, // 2,800 sq.ft = 260.13 sq.m > 250 sq.m
      });

      expect(res.isSupportedLocation).toBe(true);
      expect(res.isOutOfScope).toBe(true);
      expect(res.scopeWarning).toContain('Plots above 250 sq. m.');
      expect(res.scopeWarning).toContain('Standard simplified rules do not automatically apply');

      // Does not fabricate setback dimensions
      expect(res.front.meters).toBe(0);
      expect(res.rear.meters).toBe(0);
      expect(res.left.meters).toBe(0);
      expect(res.right.meters).toBe(0);
      expect(res.buildableFootprintSqFt).toBe(0);
    });
  });

  describe('Boundary Condition Transitions', () => {
    it('strictly respects the 60 sq.m boundary (approx. 645.83 sq.ft)', () => {
      // 645 sq.ft -> 59.92 sq.m -> Bracket 1
      const res645 = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 64.5,
        plotWidth: 10,
      });
      expect(res645.matchedBracket?.id).toBe('UP_TO_60_SQM');

      // 650 sq.ft -> 60.38 sq.m -> Bracket 2
      const res650 = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 65,
        plotWidth: 10,
      });
      expect(res650.matchedBracket?.id).toBe('60_TO_150_SQM');
    });

    it('strictly respects the 150 sq.m boundary (approx. 1,614.59 sq.ft)', () => {
      // 1,614 sq.ft -> 149.94 sq.m -> Bracket 2
      const res1614 = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 53.8,
        plotWidth: 30,
      });
      expect(res1614.matchedBracket?.id).toBe('60_TO_150_SQM');

      // 1,620 sq.ft -> 150.50 sq.m -> Bracket 3
      const res1620 = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 54,
        plotWidth: 30,
      });
      expect(res1620.matchedBracket?.id).toBe('150_TO_250_SQM');
    });

    it('strictly respects the 250 sq.m boundary (approx. 2,690.98 sq.ft)', () => {
      // 2,690 sq.ft -> 249.91 sq.m -> Bracket 3
      const res2690 = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 53.8,
        plotWidth: 50,
      });
      expect(res2690.isOutOfScope).toBe(false);
      expect(res2690.matchedBracket?.id).toBe('150_TO_250_SQM');

      // 2,700 sq.ft -> 250.84 sq.m -> Out of Scope
      const res2700 = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 54,
        plotWidth: 50,
      });
      expect(res2700.isOutOfScope).toBe(true);
    });

    it('gracefully handles zero or negative inputs', () => {
      const resZero = evaluatePlotSetbackDetails({
        city: 'Bangalore',
        plotLength: 0,
        plotWidth: 0,
      });
      expect(resZero.isValidDimensions).toBe(false);
      expect(resZero.bracketLabel).toContain('Please enter valid plot');
    });
  });

  describe('Homepage UX & Language Verification', () => {
    it('verifies Hero Section content and CTAs', () => {
      const heroPath = path.resolve(__dirname, '../../features/landing/sections/HeroSection.tsx');
      const content = fs.readFileSync(heroPath, 'utf8');

      // Headline
      expect(content).toContain('Build your home with');
      expect(content).toContain('a clear plan.');

      // Supporting text
      expect(content).toContain('Plan your home, understand the costs, and know what materials you');
      expect(content).toContain('Get a clear estimate for your home, from the structure to the finishing.');

      // CTAs
      expect(content).toContain('Start planning my home');
      expect(content).toContain('Download sample report');
      expect(content).toContain('/Hutty-Sample-Construction-Report.pdf');
    });

    it('verifies Report Showcase Section heading and preview cards', () => {
      const showcasePath = path.resolve(__dirname, '../../features/landing/sections/WhatYourReportIncludesSection.tsx');
      const content = fs.readFileSync(showcasePath, 'utf8');

      // Headline & Subhead
      expect(content).toContain('Everything you need to plan your home.');
      expect(content).toContain('Get your home plan, cost estimate, materials and construction details together in one report.');

      // Pillars
      expect(content).toContain('Construction Cost Summary');
      expect(content).toContain('Materials Needed');
      expect(content).toContain('List of Work & Costs (BOQ)');
      expect(content).toContain('Plot & Setback Rules');
      expect(content).toContain('Work Stages & Payment Plan');
    });

    it('verifies What Hutty Helps You Understand Section (4 key benefits)', () => {
      const sectionPath = path.resolve(__dirname, '../../features/landing/sections/WhatHuttyHelpsYouUnderstandSection.tsx');
      const content = fs.readFileSync(sectionPath, 'utf8');

      expect(content).toContain('What Hutty helps you understand.');
      expect(content).toContain('Your building cost');
      expect(content).toContain('Materials needed');
      expect(content).toContain('Construction stages');
      expect(content).toContain('Your final report');
    });

    it('verifies Final CTA Section heading and actions', () => {
      const ctaPath = path.resolve(__dirname, '../../features/landing/sections/FinalCtaSection.tsx');
      const content = fs.readFileSync(ctaPath, 'utf8');

      expect(content).toContain('Start planning your home today.');
      expect(content).toContain('Enter your plot details and get a clear idea of your home construction cost.');
      expect(content).toContain('Start planning my home');
      expect(content).toContain('Download sample report');
    });

    it('verifies Step 1 Plot setback display has compact summary and collapsible details', () => {
      const step1Path = path.resolve(__dirname, '../../features/planner/steps/Step1Plot.tsx');
      const content = fs.readFileSync(step1Path, 'utf8');

      // Compact section
      expect(content).toContain('Required open space');
      expect(content).toContain('Approx. buildable area:');
      expect(content).toContain('View setback details ↓');
      expect(content).toContain('Hide setback details ↑');

      // Collapsible detailed section
      expect(content).toContain('Space you must leave around your home');
      expect(content).toContain('Front Setback');
      expect(content).toContain('Rear Setback');
      expect(content).toContain('Left Side');
      expect(content).toContain('Right Side');
      expect(content).toContain('Approximate space available for your house');
      expect(content).toContain('PlotSetbackDiagram');
      expect(content).toContain('{setbackEval.disclaimer}');
      expect(BENGALURU_SETBACK_CONFIG.disclaimer).toContain(
        'These values are used for planning based on the selected location and plot size'
      );
    });

    it('verifies PlotSetbackDiagram has neutral one-side representation and either-side labeling', () => {
      const diagramPath = path.resolve(__dirname, '../../components/common/PlotSetbackDiagram.tsx');
      const content = fs.readFileSync(diagramPath, 'utf8');

      expect(content).toContain('Required clearance — either side');
      expect(content).toContain('Show on Left');
      expect(content).toContain('Show on Right');
      expect(content).toContain('Can build to boundary (0 ft)');
    });

    it('verifies 3D viewer toolbar clutter is removed for clean architectural preview', () => {
      const viewerPath = path.resolve(__dirname, '../../components/3d/Architectural3DViewer.tsx');
      const content = fs.readFileSync(viewerPath, 'utf8');

      expect(content).not.toContain('role="toolbar"');
      expect(content).not.toContain('aria-label="3D Model Viewer Controls"');
      expect(content).not.toContain('Reset 3D camera view');
      expect(content).not.toContain('Toggle Turntable Rotation');
    });
  });

  describe('Authoritative Building Height & Planning Limits Verification', () => {
    describe('Bengaluru Height Rules (Jan 2026 Gazette)', () => {
      it('enforces 39.37 ft (12.0m) without stilt regardless of road width', () => {
        const h20 = evaluateBuildingHeight({ city: 'Bangalore', numFloors: 2, hasStilt: false, roadWidthFt: 20 });
        expect(h20.maxPermittedHeightFt).toBe(39.37);
        expect(h20.maxPermittedHeightM).toBe(12.0);
        expect(h20.isCompliant).toBe(true); // Proposed: 2.5 + 20 + 7.5 = 30.0 ft <= 39.37 ft
        expect(h20.statusBadge).toBe('STATUS: FULLY COMPLIANT');

        const h40 = evaluateBuildingHeight({ city: 'Bangalore', numFloors: 2, hasStilt: false, roadWidthFt: 40 });
        expect(h40.maxPermittedHeightFt).toBe(39.37);
        expect(h40.maxPermittedHeightM).toBe(12.0);
      });

      it('permits 49.21 ft (15.0m) with stilt parking in Bengaluru', () => {
        const hStilt = evaluateBuildingHeight({ city: 'Bangalore', numFloors: 3, hasStilt: true, roadWidthFt: 30 });
        expect(hStilt.maxPermittedHeightFt).toBe(49.21);
        expect(hStilt.maxPermittedHeightM).toBe(15.0);
        expect(hStilt.isCompliant).toBe(true);
      });

      it('flags structures exceeding 49.21 ft (15.0m) as non-compliant / high-rise fire NOC required', () => {
        const hTall = evaluateBuildingHeight({ city: 'Bangalore', numFloors: 5, hasStilt: true, roadWidthFt: 30 });
        // Proposed: 2.5 + 50 + 7.5 = 60.0 ft > 49.21 ft
        expect(hTall.isCompliant).toBe(false);
        expect(hTall.statusBadge).toContain('HIGH-RISE REVIEW REQUIRED');
      });
    });

    describe('Mysuru Height Rules (Master Plan II-2031)', () => {
      it('caps height at 37.73 ft (11.5m) when road width < 9.0m (29.5 ft)', () => {
        const hNarrowRoad = evaluateBuildingHeight({ city: 'Mysore', numFloors: 2, hasStilt: false, roadWidthFt: 25 });
        expect(hNarrowRoad.maxPermittedHeightFt).toBe(37.73);
        expect(hNarrowRoad.maxPermittedHeightM).toBe(11.5);
        expect(hNarrowRoad.roadWidthConditionNote).toContain('less than 9.0m (29.5 ft)');
        expect(hNarrowRoad.isCompliant).toBe(true); // 30.0 ft <= 37.73 ft
      });

      it('permits 39.37 ft (12.0m) when road width >= 9.0m (29.5 ft) without stilt', () => {
        const hWideRoad = evaluateBuildingHeight({ city: 'Mysore', numFloors: 2, hasStilt: false, roadWidthFt: 30 });
        expect(hWideRoad.maxPermittedHeightFt).toBe(39.37);
        expect(hWideRoad.maxPermittedHeightM).toBe(12.0);
      });

      it('permits 49.21 ft (15.0m) when road width >= 9.0m with stilt', () => {
        const hWideStilt = evaluateBuildingHeight({ city: 'Mysore', numFloors: 3, hasStilt: true, roadWidthFt: 40 });
        expect(hWideStilt.maxPermittedHeightFt).toBe(49.21);
        expect(hWideStilt.maxPermittedHeightM).toBe(15.0);
      });
    });

    describe('City Planning Limits (Ground Coverage & FAR)', () => {
      it('verifies Mysuru statutory status for 75% coverage and 1.50 FAR', () => {
        const limits = getCityPlanningLimits('Mysore');
        expect(limits.maxGroundCoveragePct).toBe(75);
        expect(limits.isCoverageStatutory).toBe(true);
        expect(limits.baseFAR).toBe(1.50);
        expect(limits.isFARStatutory).toBe(true);
        expect(limits.coverageSourceNote).toContain('MUDA Master Plan II-2031');
      });

      it('verifies Bengaluru planning assumption status (not statutory in Jan 2026 Gazette)', () => {
        const limits = getCityPlanningLimits('Bangalore');
        expect(limits.maxGroundCoveragePct).toBe(70);
        expect(limits.isCoverageStatutory).toBe(false);
        expect(limits.baseFAR).toBe(1.75);
        expect(limits.isFARStatutory).toBe(false);
        expect(limits.coverageSourceNote).toContain('planning assumption');
      });
    });

    describe('Interactive Left vs Right Side Setback Selection', () => {
      it('dynamically switches open space from left to right for 30x40 plot', () => {
        // Left side selected (default)
        const resLeft = evaluatePlotSetbackDetails({
          city: 'Bangalore',
          plotLength: 40,
          plotWidth: 30,
          selectedSideSetback: 'left',
        });
        expect(resLeft.selectedSide).toBe('left');
        expect(resLeft.left.feet).toBe(2.30);
        expect(resLeft.left.isZero).toBe(false);
        expect(resLeft.right.feet).toBe(0);
        expect(resLeft.right.isZero).toBe(true);
        expect(resLeft.buildableWidthFt).toBe(27.70);
        expect(resLeft.buildableDepthFt).toBe(34.75);
        expect(resLeft.buildableFootprintSqFt).toBe(963);

        // Right side selected
        const resRight = evaluatePlotSetbackDetails({
          city: 'Bangalore',
          plotLength: 40,
          plotWidth: 30,
          selectedSideSetback: 'right',
        });
        expect(resRight.selectedSide).toBe('right');
        expect(resRight.left.feet).toBe(0);
        expect(resRight.left.isZero).toBe(true);
        expect(resRight.right.feet).toBe(2.30);
        expect(resRight.right.isZero).toBe(false);
        expect(resRight.buildableWidthFt).toBe(27.70);
        expect(resRight.buildableDepthFt).toBe(34.75);
        expect(resRight.buildableFootprintSqFt).toBe(963);
      });
    });
  });
});
