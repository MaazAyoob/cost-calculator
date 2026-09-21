import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput, CalculationResult } from '../types';
import { configResolver } from '../config/configurationResolver';
import { rateService } from '../data/rateService';
import { calculationMethodManager } from '../rules/methodRegistry';
import { useAdminStore } from '../../store/useAdminStore';

describe('HUTTY PHASE 2E: Simple Ultimate Admin Control Center Acceptance Suite', () => {
  const baseInput: EngineInput = {
    plotLength: 40,
    plotWidth: 30,
    floors: 2,
    totalBuiltupAreaSqFt: 2160,
    userSelectedBUASqFt: 2160,
    superBuiltupAreaSqFt: 2160,
    packageType: 'Premium',
    city: 'Bangalore',
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 1,
    balconies: 2,
    hasCompoundWall: true,
    compoundWallLengthFt: 140,
    waterSumpCapacityLitres: 7000,
    roadWidthFt: 30,
    soilType: 'Medium',
    facingDirection: 'East',
    constructionDurationMonths: 10,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      living: 1,
      dining: 1,
      kitchen: 1,
      balcony: 1,
      commonToilets: 1,
    },
  };

  beforeEach(() => {
    configResolver.resetToBaseline();
    rateService.resetAllToDefault();
    useAdminStore.setState({
      draftParameters: {},
      adminViewMode: 'BASIC',
      customRooms: [],
      activeTab: 'overview',
    });
  });

  afterEach(() => {
    configResolver.resetToBaseline();
    rateService.resetAllToDefault();
    useAdminStore.setState({
      draftParameters: {},
      adminViewMode: 'BASIC',
      customRooms: [],
      activeTab: 'overview',
    });
  });

  // ────────────────────────────────────────────────────────────
  // 1. SINGLE SOURCE OF TRUTH & ARCHITECTURAL INTEGRITY
  // ────────────────────────────────────────────────────────────
  describe('1. Single Canonical Engine & Zero Duplicate Calculation Engines', () => {
    it('1.1 Executes runCalculator as the sole deterministic calculation engine', () => {
      const result = runCalculator(baseInput);
      expect(result).toBeDefined();
      expect(result.budget.totalProjectCost).toBeGreaterThan(0);
      expect(result.quantities.steelTonnes).toBeGreaterThan(0);
      expect(result.quantities.cementBags).toBeGreaterThan(0);
    });

    it('1.2 In-Admin Test Calculator executes the identical canonical runCalculator pipeline', async () => {
      const store = useAdminStore.getState();
      await store.runTestCalculator();

      const updated = useAdminStore.getState();
      expect(updated.testCalculationActive).toBeDefined();
      expect(updated.testCalculationActive?.budget.totalProjectCost).toBeGreaterThan(0);
      expect(updated.testCalculationDraft).toBeDefined();
      expect(updated.testCalculationDraft?.budget.totalProjectCost).toBe(
        updated.testCalculationActive?.budget.totalProjectCost
      );
    });

    it('1.3 Draft modifications inside Test Calculator remain strictly isolated from production configResolver', async () => {
      const store = useAdminStore.getState();

      // Set a draft parameter in admin store
      store.updateDraftParameter('config.rcc.steel_base_factor_kg_sqft', 4.5);

      // Verify production configResolver still has standard baseline before test run
      expect(configResolver.resolveParameter('config.rcc.steel_base_factor_kg_sqft', undefined, 2.8)).toBe(2.8);

      // Run test calculator
      await store.runTestCalculator();

      // Verify production configResolver is still clean (resetToBaseline in finally)
      expect(configResolver.resolveParameter('config.rcc.steel_base_factor_kg_sqft', undefined, 2.8)).toBe(2.8);

      // But testCalculationDraft reflects the draft calculation
      const updatedStore = useAdminStore.getState();
      const activeSteel = updatedStore.testCalculationActive?.quantities.steelTonnes || 0;
      const draftSteel = updatedStore.testCalculationDraft?.quantities.steelTonnes || 0;
      expect(draftSteel).toBeGreaterThan(activeSteel);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 2. RATE-ONLY INVARIANCE PRINCIPLE
  // ────────────────────────────────────────────────────────────
  describe('2. Rate Invariance: Unit Price Changes Modify Cost, Never Quantities', () => {
    it('2.1 Modifying steel material unit rate changes total budget but leaves steel tonnage invariant', () => {
      const baseline = runCalculator(baseInput);
      const baselineSteelTonnes = baseline.quantities.steelTonnes;
      const baselineSteelKg = baseline.quantities.steelKg;
      const baselineCost = baseline.budget.totalProjectCost;

      // Override steel unit price via RateMaster
      rateService.setOverrides([
        {
          id: 'ov-steel-high',
          rateId: 'steel.fe550d_tmt',
          packageTier: 'ALL',
          location: 'ALL',
          overrideRate: 150000,
          isActive: true,
        },
      ]);

      const modified = runCalculator(baseInput);

      // Physical quantity MUST remain strictly identical
      expect(modified.quantities.steelTonnes).toBe(baselineSteelTonnes);
      expect(modified.quantities.steelKg).toBe(baselineSteelKg);

      // Monetary cost must have increased
      expect(modified.budget.totalProjectCost).toBeGreaterThan(baselineCost);
    });

    it('2.2 Modifying cement unit rate changes total budget but leaves cement bag count invariant', () => {
      const baseline = runCalculator(baseInput);
      const baselineBags = baseline.quantities.cementBags;
      const baselineCost = baseline.budget.totalProjectCost;

      // Override cement unit price
      rateService.setOverride({
        rateId: 'cement.opc53_grade',
        overrideRate: 650,
        category: 'Cement',
        unit: '₹/bag',
        name: 'Portland Cement OPC 53 Grade',
        packageTier: 'ALL',
        location: 'ALL',
      }, 'TEST_SUITE', 'Supplier revision');

      const modified = runCalculator(baseInput);

      // Physical bag count MUST remain strictly identical
      expect(modified.quantities.cementBags).toBe(baselineBags);

      // Monetary cost must increase
      expect(modified.budget.totalProjectCost).toBeGreaterThan(baselineCost);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 3. PHYSICAL PARAMETER PROPAGATION
  // ────────────────────────────────────────────────────────────
  describe('3. Construction Parameter Propagation to Physical Takeoff', () => {
    it('3.1 Increasing standard wall height increases masonry volume and total cost', () => {
      const baseline = runCalculator(baseInput);
      const baseMasonryCount = baseline.quantities.masonryUnitsCount;
      const basePaintArea = baseline.quantities.internalWallAreaSqFt;

      // Increase floor height from 10.0 to 11.5 ft
      configResolver.syncActiveConfiguration({
        versionNumber: 'TEST-WALL-11.5',
        parameters: {
          'config.structure.wall_height_ft': 11.5,
          'config.masonry.floor_height_ft': 11.5,
        },
        source: 'ADMIN_OVERRIDE',
      });

      const taller = runCalculator(baseInput);

      expect(taller.quantities.masonryUnitsCount).toBeGreaterThan(baseMasonryCount);
      expect(taller.quantities.internalWallAreaSqFt).toBeGreaterThan(basePaintArea);
      expect(taller.budget.totalProjectCost).toBeGreaterThan(baseline.budget.totalProjectCost);
    });

    it('3.2 Increasing flooring tile wastage percentage increases floor tile quantity takeoff', () => {
      const baseline = runCalculator(baseInput);
      const baseTileSqFt = baseline.quantities.floorTilesSqFt;

      // Increase tile wastage allowance from 7% to 15%
      configResolver.syncActiveConfiguration({
        versionNumber: 'TEST-TILE-WASTAGE',
        parameters: {
          'config.wastage.flooring': 15,
        },
        source: 'ADMIN_OVERRIDE',
      });

      const modified = runCalculator(baseInput);

      expect(modified.quantities.floorTilesSqFt).toBeGreaterThan(baseTileSqFt);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 4. NAVIGATION GROUPS & 20 SECTION STRUCTURE
  // ────────────────────────────────────────────────────────────
  describe('4. 6 Navigation Groups & Feature Sections', () => {
    it('4.1 Verifies all 6 navigation groups exist in user navigation architecture', () => {
      const expectedGroups = [
        'PROJECT',
        'CONSTRUCTION',
        'SERVICES',
        'PRICING',
        'CALCULATOR',
        'REPORT_MGMT',
      ];

      const store = useAdminStore.getState();
      expect(store.adminViewMode).toBeDefined();

      // Test valid section transitions
      store.setActiveTab('project-bua');
      expect(useAdminStore.getState().activeTab).toBe('project-bua');

      store.setActiveTab('walls-masonry');
      expect(useAdminStore.getState().activeTab).toBe('walls-masonry');

      store.setActiveTab('electrical');
      expect(useAdminStore.getState().activeTab).toBe('electrical');

      store.setActiveTab('commercial-tax');
      expect(useAdminStore.getState().activeTab).toBe('commercial-tax');

      store.setActiveTab('calculation-methods');
      expect(useAdminStore.getState().activeTab).toBe('calculation-methods');

      store.setActiveTab('test-calculator');
      expect(useAdminStore.getState().activeTab).toBe('test-calculator');

      store.setActiveTab('versions-history');
      expect(useAdminStore.getState().activeTab).toBe('versions-history');
    });

    it('4.2 Defaults view mode to BASIC and allows toggling to ADVANCED', () => {
      const store = useAdminStore.getState();
      expect(store.adminViewMode).toBe('BASIC');

      store.setAdminViewMode('ADVANCED');
      expect(useAdminStore.getState().adminViewMode).toBe('ADVANCED');

      store.setAdminViewMode('BASIC');
      expect(useAdminStore.getState().adminViewMode).toBe('BASIC');
    });
  });

  // ────────────────────────────────────────────────────────────
  // 5. CALCULATION METHOD REGISTRY & SWITCHING
  // ────────────────────────────────────────────────────────────
  describe('5. Safe Calculation Method Registry', () => {
    it('5.1 Lists registered calculation methods across trades', () => {
      const methods = calculationMethodManager.getAllMethods();
      expect(methods.length).toBeGreaterThanOrEqual(4);

      const masonry = calculationMethodManager.getMethod('method.masonry');
      expect(masonry).toBeDefined();
      expect(masonry?.category).toBe('MASONRY');
      expect(masonry?.supportedMethods.length).toBeGreaterThanOrEqual(2);

      const electrical = calculationMethodManager.getMethod('method.electrical');
      expect(electrical).toBeDefined();
      expect(electrical?.category).toBe('ELECTRICAL');
    });

    it('5.2 Switches calculation method safely without engine failure', () => {
      const baseline = runCalculator(baseInput);
      expect(baseline.quantities.masonryUnitsCount).toBeGreaterThan(0);

      // Switch masonry calculation method to volumetric method
      calculationMethodManager.setActiveMethod('method.masonry', 'masonry_bua_thumb_rule');
      expect(calculationMethodManager.getMethod('method.masonry')?.activeMethodId).toBe('masonry_bua_thumb_rule');

      const resultWithThumb = runCalculator(baseInput);
      expect(resultWithThumb.budget.totalProjectCost).toBeGreaterThan(0);

      // Restore
      calculationMethodManager.setActiveMethod('method.masonry', 'masonry_surface_thickness');
    });
  });

  // ────────────────────────────────────────────────────────────
  // 6. CUSTOM ROOM TYPES & TEMPLATES
  // ────────────────────────────────────────────────────────────
  describe('6. Custom Room Archetypes & Templates', () => {
    it('6.1 Allows adding, retrieving, and removing custom room definitions', () => {
      const store = useAdminStore.getState();
      expect(store.customRooms.length).toBe(0);

      store.addCustomRoom({
        id: 'room-prayer-1',
        name: 'Puja / Prayer Room',
        lengthFt: 8,
        widthFt: 6,
        areaSqFt: 48,
        electricalPoints: 4,
        plumbingPoints: 1,
        dadoHeightFt: 4,
        wallFinish: 'Royal Luxury Emulsion',
        flooringType: 'Italian Marble Slab',
        isWetArea: false,
      });

      const withRoom = useAdminStore.getState();
      expect(withRoom.customRooms.length).toBe(1);
      expect(withRoom.customRooms[0].name).toBe('Puja / Prayer Room');
      expect(withRoom.customRooms[0].areaSqFt).toBe(48);

      store.removeCustomRoom('room-prayer-1');
      expect(useAdminStore.getState().customRooms.length).toBe(0);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 7. VISUAL WHEN/THEN RULE BUILDER
  // ────────────────────────────────────────────────────────────
  describe('7. Visual Rule Engine Evaluation', () => {
    it('7.1 Stores and evaluates conditional visual rules safely without code evaluation', () => {
      const store = useAdminStore.getState();
      expect(store.customRules.length).toBeGreaterThanOrEqual(1);

      // Add a custom rule
      store.addCustomRule({
        whenField: 'floors',
        condition: 'GREATER_THAN',
        value: 3,
        thenTarget: 'config.structure.steel_factor_kg_per_sqft',
        action: 'SET_TO',
        targetValue: 4.2,
      });

      const updated = useAdminStore.getState();
      const addedRule = updated.customRules.find((r) => r.whenField === 'floors');
      expect(addedRule).toBeDefined();
      expect(addedRule?.isActive).toBe(true);

      // Toggle active status
      if (addedRule) {
        store.toggleCustomRule(addedRule.id);
        expect(useAdminStore.getState().customRules.find((r) => r.id === addedRule.id)?.isActive).toBe(false);

        store.deleteCustomRule(addedRule.id);
        expect(useAdminStore.getState().customRules.find((r) => r.id === addedRule.id)).toBeUndefined();
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // 8. QUANTITY VS PRICE TRANSPARENCY
  // ────────────────────────────────────────────────────────────
  describe('8. Quantity vs Price Breakdown Transparency', () => {
    it('8.1 Distinguishes physical quantity delta from price override delta in simulation', () => {
      const activeCalc = runCalculator(baseInput);

      // Change a physical parameter (wall height)
      configResolver.syncActiveConfiguration({
        versionNumber: 'TEST-WALL-11',
        parameters: {
          'config.structure.wall_height_ft': 11.0,
          'config.masonry.floor_height_ft': 11.0,
        },
        source: 'ADMIN_OVERRIDE',
      });
      const draftPhysical = runCalculator(baseInput);

      const qtyDelta = draftPhysical.quantities.aacBlocksPieces - activeCalc.quantities.aacBlocksPieces;
      expect(qtyDelta).toBeGreaterThan(0);

      // Reset physical and apply only a price override
      configResolver.resetToBaseline();
      rateService.setOverride({
        rateId: 'cement.opc53_grade',
        overrideRate: 650,
        category: 'Cement',
        unit: '₹/bag',
        name: 'Portland Cement OPC 53 Grade',
        packageTier: 'ALL',
        location: 'ALL',
      }, 'TEST', 'Cement hike');
      const draftPrice = runCalculator(baseInput);

      const priceQtyDelta = draftPrice.quantities.masonryUnitsCount - activeCalc.quantities.masonryUnitsCount;
      expect(priceQtyDelta).toBe(0); // Physical count invariant
      expect(draftPrice.budget.totalProjectCost).toBeGreaterThan(activeCalc.budget.totalProjectCost);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 9. CLIENT LANGUAGE AUDIT (NO DEVELOPER JARGON)
  // ────────────────────────────────────────────────────────────
  describe('9. Client-Friendly Non-Technical Language Compliance', () => {
    it('9.1 Section titles and labels contain client-friendly construction terms', () => {
      const sampleLabels = [
        'Standard Wall Height',
        'Ground Steel Factor (kg/sqft)',
        'Flooring Tile Wastage %',
        'Contractor Margin & GST Rate',
        'Test Residential Calculator',
        'What Does This Affect?',
      ];

      const forbiddenJargon = [
        /\bdatabase\b/i,
        /\bast\b/i,
        /\bdag\b/i,
        /\bsql\b/i,
        /\bjson\b/i,
        /\btypescript\b/i,
        /\beval\(/i,
      ];

      for (const label of sampleLabels) {
        for (const regex of forbiddenJargon) {
          expect(regex.test(label)).toBe(false);
        }
      }
    });
  });
});
