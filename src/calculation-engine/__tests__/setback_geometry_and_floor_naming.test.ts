import { describe, it, expect } from 'vitest';
import { evaluatePlotSetbacks } from '../data/authorityRules';
import { calculateArea } from '../modules/bua';
import { generateBuildingModel } from '../modules/spaceModel';
import { getFloorDisplayName } from '../../utils/floorNames';
import { EngineInput } from '../types';

describe('Setback Geometry, Buildable Envelope & Floor Naming Suite', () => {
  // ============================================================
  // PHASE 2 & 6A: RECTANGULAR SETBACK GEOMETRY & AXIS MAPPING
  // ============================================================
  describe('Rectangular Setback Geometry & Axis Mapping', () => {
    const customSetbacks = {
      frontSetbackFt: 2.95,
      rearSetbackFt: 2.30,
      leftSetbackFt: 2.30,
      rightSetbackFt: 0.00,
    };

    it('correctly maps setbacks for 40 ft frontage (width) × 30 ft depth (length)', () => {
      // 40 ft is road-facing width; 30 ft is depth
      const result = evaluatePlotSetbacks({
        plotWidth: 40,
        plotLength: 30,
        roadWidthFt: 30,
        customSetbacks,
      });

      // Buildable width = plotWidth (40) - left (2.30) - right (0.00) = 37.70 ft
      expect(result.buildableWidthFt).toBeCloseTo(37.70, 2);

      // Buildable depth = plotLength (30) - front (2.95) - rear (2.30) = 24.75 ft
      expect(result.buildableLengthFt).toBeCloseTo(24.75, 2);

      // Base rectangular envelope = 37.70 * 24.75 = 933.075 sq.ft -> rounded to 933 sq.ft
      expect(result.buildableWidthFt * result.buildableLengthFt).toBeCloseTo(933.08, 2);
      expect(result.buildableFootprintSqFt).toBe(933);
    });

    it('correctly maps setbacks for rotated plot: 30 ft frontage (width) × 40 ft depth (length)', () => {
      // 30 ft is road-facing width; 40 ft is depth
      const result = evaluatePlotSetbacks({
        plotWidth: 30,
        plotLength: 40,
        roadWidthFt: 30,
        customSetbacks,
      });

      // Buildable width = plotWidth (30) - left (2.30) - right (0.00) = 27.70 ft
      expect(result.buildableWidthFt).toBeCloseTo(27.70, 2);

      // Buildable depth = plotLength (40) - front (2.95) - rear (2.30) = 34.75 ft
      expect(result.buildableLengthFt).toBeCloseTo(34.75, 2);

      // Base rectangular envelope = 27.70 * 34.75 = 962.575 sq.ft -> rounded to 963 sq.ft
      expect(result.buildableWidthFt * result.buildableLengthFt).toBeCloseTo(962.58, 1);
      expect(result.buildableFootprintSqFt).toBe(963);
    });

    it('ensures changing left/right setback only affects buildable width, never depth', () => {
      const base = evaluatePlotSetbacks({
        plotWidth: 40,
        plotLength: 30,
        roadWidthFt: 30,
        customSetbacks,
      });

      const modifiedLeft = evaluatePlotSetbacks({
        plotWidth: 40,
        plotLength: 30,
        roadWidthFt: 30,
        customSetbacks: {
          ...customSetbacks,
          leftSetbackFt: 4.0, // increased left setback
        },
      });

      // Depth must remain identical (24.75 ft)
      expect(modifiedLeft.buildableLengthFt).toBeCloseTo(base.buildableLengthFt, 2);
      // Width must decrease by (4.0 - 2.3) = 1.7 ft -> 36.00 ft
      expect(modifiedLeft.buildableWidthFt).toBeCloseTo(36.00, 2);
    });

    it('ensures changing front/rear setback only affects buildable depth, never width', () => {
      const base = evaluatePlotSetbacks({
        plotWidth: 40,
        plotLength: 30,
        roadWidthFt: 30,
        customSetbacks,
      });

      const modifiedFront = evaluatePlotSetbacks({
        plotWidth: 40,
        plotLength: 30,
        roadWidthFt: 30,
        customSetbacks: {
          ...customSetbacks,
          frontSetbackFt: 5.0, // increased front setback
        },
      });

      // Width must remain identical (37.70 ft)
      expect(modifiedFront.buildableWidthFt).toBeCloseTo(base.buildableWidthFt, 2);
      // Depth must decrease by (5.0 - 2.95) = 2.05 ft -> 22.70 ft
      expect(modifiedFront.buildableLengthFt).toBeCloseTo(22.70, 2);
    });

    it('safely handles zero setbacks when allowed', () => {
      const result = evaluatePlotSetbacks({
        plotWidth: 30,
        plotLength: 40,
        roadWidthFt: 30,
        customSetbacks: {
          frontSetbackFt: 3.0,
          rearSetbackFt: 2.0,
          leftSetbackFt: 0.0,
          rightSetbackFt: 0.0,
        },
      });

      expect(result.buildableWidthFt).toBe(30);
      expect(result.buildableLengthFt).toBe(35);
      expect(result.buildableFootprintSqFt).toBe(1050);
    });

    it('safely prevents negative dimensions when setbacks exceed plot dimensions', () => {
      const result = evaluatePlotSetbacks({
        plotWidth: 10,
        plotLength: 10,
        roadWidthFt: 30,
        customSetbacks: {
          frontSetbackFt: 8.0,
          rearSetbackFt: 8.0,
          leftSetbackFt: 6.0,
          rightSetbackFt: 6.0,
        },
      });

      expect(result.buildableWidthFt).toBe(0);
      expect(result.buildableLengthFt).toBe(0);
      expect(result.buildableFootprintSqFt).toBe(0);
    });
  });

  // ============================================================
  // PHASE 3 & 6B: PERMISSIBLE AREA, COVERAGE & FAR VALIDATION
  // ============================================================
  describe('Permissible Area, Coverage & FAR Validation', () => {
    const baseInput = {
      city: 'Bangalore',
      plotLength: 30, // Depth = 30 ft
      plotWidth: 40,  // Width = 40 ft (Area = 1200 sq.ft)
      floors: 2,
      userSelectedBUA: 1440,
      frontSetback: 2.95,
      rearSetback: 2.30,
      leftSetback: 2.30,
      rightSetback: 0.00,
      customSetbacks: {
        frontSetbackFt: 2.95,
        rearSetbackFt: 2.30,
        leftSetbackFt: 2.30,
        rightSetbackFt: 0.00,
      },
    } as unknown as EngineInput;

    it('preserves valid 720 sq.ft per floor allocation (Total BUA 1440 sq.ft) on 1200 sq.ft plot', () => {
      const result = calculateArea(baseInput);

      // Plot Area = 1200 sq.ft
      expect(result.plotAreaSqFt).toBe(1200);

      // Total BUA proposed = 1440 sq.ft (720 sq.ft x 2 floors)
      expect(result.totalBUASqFt).toBe(1440);
      expect(result.buaPerFloorSqFt).toBe(720);

      // Buildable envelope = 37.70 * 24.75 = 933.08 sq.ft -> rounded to 933 sq.ft
      expect(result.buildableWidthFt * result.buildableLengthFt).toBeCloseTo(933.08, 2);
      expect(result.buildableFootprintSqFt).toBe(933);

      // Max ground coverage limit (70% of 1200) = 840 sq.ft
      expect(result.coverageLimitSqFt).toBe(840);

      // Permissible coverage is min(buildableEnvelope: 933.08, coverageLimit: 840) = 840 sq.ft
      expect(result.maxPermissibleCoverageSqFt).toBe(840);

      // Proposed ground footprint is 720 sq.ft, which is <= 840 sq.ft and <= 933.08 sq.ft
      // Permissible BUA for 2 floors = min(FAR 1.75 * 1200 = 2100, 840 * 2 = 1680) = 1680 sq.ft
      expect(result.permissibleBUASqFt).toBe(1680);

      // Proposed 1440 sq.ft <= 1680 sq.ft -> must be valid!
      expect(result.isWithinPermissibleLimit).toBe(true);
      expect(result.validationState).toBe('valid');
      expect(result.confirmationMessage).toBeUndefined();
    });

    it('distinguishes between buildable envelope (963 sq.ft) and max permitted ground footprint (840 sq.ft) on 30x40 plot', () => {
      const input30x40 = {
        city: 'Bangalore',
        plotLength: 40, // Depth = 40 ft
        plotWidth: 30,  // Width = 30 ft (Area = 1200 sq.ft)
        floors: 2,
        userSelectedBUA: 1440, // 720 sq.ft per floor
        frontSetback: 2.95,
        rearSetback: 2.30,
        leftSetback: 2.30,
        rightSetback: 0.00,
        customSetbacks: {
          frontSetbackFt: 2.95,
          rearSetbackFt: 2.30,
          leftSetbackFt: 2.30,
          rightSetbackFt: 0.00,
        },
      } as unknown as EngineInput;

      const result = calculateArea(input30x40);

      // Plot Area = 1200 sq.ft
      expect(result.plotAreaSqFt).toBe(1200);

      // 1. Buildable width = 30 - 2.30 - 0 = 27.70 ft
      expect(result.buildableWidthFt).toBeCloseTo(27.70, 2);

      // 2. Buildable depth = 40 - 2.95 - 2.30 = 34.75 ft
      expect(result.buildableLengthFt).toBeCloseTo(34.75, 2);

      // 3. Buildable envelope after setbacks = 27.70 * 34.75 = 962.58 sq.ft -> rounded to 963 sq.ft
      expect(result.buildableWidthFt * result.buildableLengthFt).toBeCloseTo(962.58, 1);
      expect(result.buildableFootprintSqFt).toBe(963);

      // 4. Configured coverage limit = 70% of 1200 = 840 sq.ft
      expect(result.maxPermissibleCoveragePct).toBe(70);
      expect(result.coverageLimitSqFt).toBe(840);

      // 5. Maximum permitted ground-floor footprint = min(geometric envelope 963, coverage limit 840) = 840 sq.ft
      expect(result.maxPermissibleCoverageSqFt).toBe(840);

      // 6. Proposed ground floor footprint = 720 sq.ft <= 840 sq.ft and <= 963 sq.ft
      expect(result.buaPerFloorSqFt).toBe(720);

      // 7. Permissible total BUA under configured FAR (1.75): min(1200 * 1.75 = 2100, 840 * 2 = 1680) = 1680 sq.ft
      expect(result.permissibleFAR).toBe(1.75);
      expect(result.permissibleBUASqFt).toBe(1680);

      // 8. Proposed total BUA = 1440 sq.ft <= 1680 sq.ft -> valid!
      expect(result.totalBUASqFt).toBe(1440);
      expect(result.isWithinPermissibleLimit).toBe(true);
      expect(result.validationState).toBe('valid');
      expect(result.confirmationMessage).toBeUndefined();
    });

    it('flags an explanatory violation when proposed ground footprint exceeds buildable envelope', () => {
      // Create a scenario where envelope is small: width 20 ft, depth 20 ft, plot area 400 sq.ft
      // Front setback 5, Rear 5 -> depth 10; Left 5, Right 5 -> width 10; envelope = 100 sq.ft
      const tightPlotInput = {
        city: 'Bangalore',
        plotLength: 20,
        plotWidth: 20,
        floors: 1,
        userSelectedBUA: 180, // 180 sq.ft exceeds envelope of 100 sq.ft
        frontSetback: 5,
        rearSetback: 5,
        leftSetback: 5,
        rightSetback: 5,
        customSetbacks: {
          frontSetbackFt: 5,
          rearSetbackFt: 5,
          leftSetbackFt: 5,
          rightSetbackFt: 5,
        },
      } as unknown as EngineInput;

      const result = calculateArea(tightPlotInput);
      expect(result.buildableFootprintSqFt).toBe(100);
      expect(result.isWithinPermissibleLimit).toBe(false);
      expect(result.validationState).toBe('exceeds_permissible');
      expect(result.confirmationMessage).toContain('exceeds buildable envelope after setbacks');
    });

    it('flags an explanatory violation when proposed ground footprint exceeds statutory coverage percentage', () => {
      // 1200 sq.ft plot, 1 floor, proposed 900 sq.ft
      // Even though buildable envelope may allow 933.08 sq.ft, statutory coverage limit is 70% = 840 sq.ft
      const highCoverageInput = {
        city: 'Bangalore',
        plotLength: 30,
        plotWidth: 40,
        floors: 1,
        userSelectedBUA: 890,
        frontSetback: 2.95,
        rearSetback: 2.30,
        leftSetback: 2.30,
        rightSetback: 0.00,
        customSetbacks: {
          frontSetbackFt: 2.95,
          rearSetbackFt: 2.30,
          leftSetbackFt: 2.30,
          rightSetbackFt: 0.00,
        },
      } as unknown as EngineInput;

      const result = calculateArea(highCoverageInput);
      expect(result.isWithinPermissibleLimit).toBe(false);
      expect(result.validationState).toBe('exceeds_permissible');
      expect(result.confirmationMessage).toContain('exceeds permissible plot coverage');
    });

    it('flags an explanatory violation when total BUA exceeds permissible FAR', () => {
      // 1200 sq.ft plot, 4 floors, proposed 2300 sq.ft
      // FAR is 1.75 -> max FAR BUA is 2100 sq.ft
      const highFarInput = {
        city: 'Bangalore',
        plotLength: 30,
        plotWidth: 40,
        floors: 4,
        userSelectedBUA: 2300,
        frontSetback: 2.95,
        rearSetback: 2.30,
        leftSetback: 2.30,
        rightSetback: 0.00,
        customSetbacks: {
          frontSetbackFt: 2.95,
          rearSetbackFt: 2.30,
          leftSetbackFt: 2.30,
          rightSetbackFt: 0.00,
        },
      } as unknown as EngineInput;

      const result = calculateArea(highFarInput);
      expect(result.isWithinPermissibleLimit).toBe(false);
      expect(result.validationState).toBe('exceeds_permissible');
      expect(result.confirmationMessage).toContain('exceeds permissible FAR limit');
    });
  });

  // ============================================================
  // PHASE 4 & 6C: FLOOR DISPLAY NAMES CONVENTION
  // ============================================================
  describe('Floor Display Names Convention', () => {
    it('maps floor indices to canonical customer-facing names', () => {
      expect(getFloorDisplayName(0)).toBe('Ground Floor');
      expect(getFloorDisplayName(1)).toBe('First Floor');
      expect(getFloorDisplayName(2)).toBe('Second Floor');
      expect(getFloorDisplayName(3)).toBe('Third Floor');
      expect(getFloorDisplayName(4)).toBe('Fourth Floor');
      expect(getFloorDisplayName(5)).toBe('Fifth Floor');
    });

    it('supports higher floor counts ordinally without artificial limit', () => {
      expect(getFloorDisplayName(6)).toBe('Sixth Floor');
      expect(getFloorDisplayName(7)).toBe('Seventh Floor');
      expect(getFloorDisplayName(8)).toBe('Eighth Floor');
      expect(getFloorDisplayName(9)).toBe('Ninth Floor');
      expect(getFloorDisplayName(10)).toBe('Tenth Floor');
      expect(getFloorDisplayName(11)).toBe('11th Floor');
      expect(getFloorDisplayName(21)).toBe('21st Floor');
      expect(getFloorDisplayName(22)).toBe('22nd Floor');
      expect(getFloorDisplayName(23)).toBe('23rd Floor');
    });

    it('safely handles edge cases like negative indices or NaN', () => {
      expect(getFloorDisplayName(-1)).toBe('Ground Floor');
      expect(getFloorDisplayName(NaN)).toBe('Ground Floor');
      expect(getFloorDisplayName(1.8)).toBe('First Floor');
    });

    it('assigns correct floor names in SpaceModel generation for multi-floor house', () => {
      const input = {
        plotLength: 30,
        plotWidth: 40,
        floors: 2,
        builtUpArea: 1440,
        city: 'Bangalore',
        houseType: 'Duplex',
        qualityTier: 'Standard',
        parkingType: 'Normal Ground',
        contractorMode: 'independent',
        rooms: { bedrooms: 2, bathrooms: 2, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 1, utility: 1 },
      } as unknown as EngineInput;

      const area = calculateArea(input);
      const building = generateBuildingModel(input, area);

      // Verify floor models have proper names
      expect(building.floors.length).toBe(2);
      expect(building.floors[0].floorIndex).toBe(0);
      expect(building.floors[0].floorName).toBe('Ground Floor');
      expect(building.floors[1].floorIndex).toBe(1);
      expect(building.floors[1].floorName).toBe('First Floor');

      // Verify spaces assigned to floors carry canonical floor names
      const gfSpaces = building.allSpaces.filter((s) => s.floorIndex === 0);
      const ffSpaces = building.allSpaces.filter((s) => s.floorIndex === 1);

      expect(gfSpaces.length).toBeGreaterThan(0);
      expect(ffSpaces.length).toBeGreaterThan(0);

      gfSpaces.forEach((s) => {
        expect(s.floorName).toBe('Ground Floor');
      });

      ffSpaces.forEach((s) => {
        expect(s.floorName).toBe('First Floor');
      });
    });

    it('preserves existing internal floor indices and area totals for 3-floor building', () => {
      const input = {
        plotLength: 30,
        plotWidth: 40,
        floors: 3,
        builtUpArea: 2100,
        city: 'Bangalore',
        houseType: 'Triplex',
        qualityTier: 'Standard',
        parkingType: 'Normal Ground',
        contractorMode: 'independent',
        rooms: { bedrooms: 3, bathrooms: 3, living: 1, kitchen: 1, dining: 1, commonToilets: 0, balcony: 2, utility: 1 },
      } as unknown as EngineInput;

      const area = calculateArea(input);
      const building = generateBuildingModel(input, area);
      expect(building.floors.length).toBe(3);
      expect(building.floors[0].floorName).toBe('Ground Floor');
      expect(building.floors[1].floorName).toBe('First Floor');
      expect(building.floors[2].floorName).toBe('Second Floor');

      // Total area matches sum of floor areas
      const totalFloorArea = building.floors.reduce((sum, f) => sum + f.floorAreaSqFt, 0);
      expect(totalFloorArea).toBeCloseTo(2100, 0);
    });
  });
});
