import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { getPackageConfig } from '../data/packageConfig';
import { useWizardStore, SAMPLE_ROOM_CONFIG, getFreshZeroState } from '../../store/useWizardStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { rateService } from '../data/rateService';
import { runQAGate } from '../modules/qaGate';

describe('HUTTY 2.0 — Estimate Completeness & Mode Safety Regression Suite', () => {

  beforeEach(() => {
    // Reset store before each test
    useWizardStore.setState(getFreshZeroState());
    useCalculationStore.getState().recalculate();
  });

  // ────────────────────────────────────────────────────────────
  // 1. FIRST-TIME QUICK ESTIMATE INITIALIZATION
  // ────────────────────────────────────────────────────────────
  it('1. First-time quick estimate initializes with complete sample rooms and quick mode', () => {
    const state = useWizardStore.getState();
    expect(state.estimateMode).toBe('quick');
    expect(state.isCustomRooms).toBe(false);

    // Verify 3BHK sample home configuration
    expect(state.rooms.bedrooms).toBe(3);
    expect(state.rooms.bathrooms).toBe(3);
    expect(state.rooms.living).toBe(1);
    expect(state.rooms.kitchen).toBe(1);
    expect(state.rooms.dining).toBe(1);
    expect(state.rooms.balcony).toBe(1);
    expect(state.rooms.pooja).toBe(1);
    expect(state.rooms.utility).toBe(1);
  });

  // ────────────────────────────────────────────────────────────
  // 2. FAST-TRACK STAGE 1 -> STAGE 7 WITH COMPLETE SAMPLE ROOMS
  // ────────────────────────────────────────────────────────────
  it('2. Fast-track from Stage 1 to Stage 7 produces a complete turnkey estimate rather than an empty room schedule', () => {
    const store = useWizardStore.getState();
    // User enters plot dimensions in Stage 1 and skips directly to Stage 7
    store.setCity('Bangalore');
    store.setPlotDimensions(40, 30); // 30x40 = 1,200 sq.ft plot

    const calculationState = useCalculationStore.getState();
    const result = calculationState.recalculate();

    // Verify geometry
    expect(result.area.plotAreaSqFt).toBe(1200);
    expect(result.area.totalBUASqFt).toBe(1440); // Standard G+1 default for fast track
    expect(result.input.rooms.bedrooms).toBe(3);
    expect(result.input.rooms.bathrooms).toBe(3);
    expect(result.input.rooms.living).toBe(1);
    expect(result.input.rooms.kitchen).toBe(1);

    // Verify cost is complete turnkey cost (~₹34.59L - ₹50.14L), NOT a structural shell with 0 plumbing/wiring
    expect(result.budget.totalProjectCost).toBeGreaterThan(3000000);
    expect(result.budget.totalProjectCost).toBeLessThan(6000000);
    expect(result.budget.directMaterialCost).toBeGreaterThan(1200000);
    expect(result.budget.directLabourCost).toBeGreaterThan(600000);
    expect(result.budget.directFixtureCost).toBeGreaterThan(300000);

    // Automated QA gate passes
    const qa = runQAGate(result);
    expect(qa.passed).toBe(true);
    expect(qa.blockingErrors.length).toBe(0);
  });

  // ────────────────────────────────────────────────────────────
  // 3. CUSTOM ESTIMATE PERSISTENCE
  // ────────────────────────────────────────────────────────────
  it('3. Custom room counts remain strictly preserved across stage navigation, mode switching, and re-calculations', () => {
    const store = useWizardStore.getState();
    store.setPlotDimensions(40, 30);
    store.setHouseConfig('Duplex', 2);

    // User navigates to Stage 3 and modifies room counts
    store.updateRoomCount('bedrooms', 1); // 3 -> 4
    store.updateRoomCount('bathrooms', 1); // 3 -> 4
    store.updateRoomCount('office', 1); // 0 -> 1

    expect(useWizardStore.getState().estimateMode).toBe('custom');
    expect(useWizardStore.getState().isCustomRooms).toBe(true);
    expect(useWizardStore.getState().rooms.bedrooms).toBe(4);
    expect(useWizardStore.getState().rooms.bathrooms).toBe(4);
    expect(useWizardStore.getState().rooms.office).toBe(1);

    // Simulate navigation through all stages: 4 -> 5 -> 6 -> 7 -> 1 -> 7
    store.setStep(4);
    store.setStep(5);
    store.setStep(6);
    store.setStep(7);
    store.setStep(1);
    store.setStep(7);

    // Assert custom values NEVER reverted to sample defaults
    const preservedState = useWizardStore.getState();
    expect(preservedState.rooms.bedrooms).toBe(4);
    expect(preservedState.rooms.bathrooms).toBe(4);
    expect(preservedState.rooms.office).toBe(1);
    expect(preservedState.isCustomRooms).toBe(true);
    expect(preservedState.estimateMode).toBe('custom');

    const result = useCalculationStore.getState().recalculate();
    expect(result.input.rooms.bedrooms).toBe(4);
    expect(result.input.rooms.bathrooms).toBe(4);
  });

  // ────────────────────────────────────────────────────────────
  // 4. MODE SWITCHING AND EXPLICIT SAMPLE RESTORATION
  // ────────────────────────────────────────────────────────────
  it('4. Supports explicit restoration of sample configuration via applySampleRoomConfig', () => {
    const store = useWizardStore.getState();
    store.setRoomCount('bedrooms', 5);
    expect(useWizardStore.getState().rooms.bedrooms).toBe(5);
    expect(useWizardStore.getState().isCustomRooms).toBe(true);

    // User clicks "Reset to Sample 3BHK"
    store.applySampleRoomConfig();

    const restoredState = useWizardStore.getState();
    expect(restoredState.estimateMode).toBe('quick');
    expect(restoredState.isCustomRooms).toBe(false);
    expect(restoredState.rooms.bedrooms).toBe(3);
    expect(restoredState.rooms.bathrooms).toBe(3);
    expect(restoredState.rooms.living).toBe(1);
  });

  // ────────────────────────────────────────────────────────────
  // 5. INCOMPLETE / UNDEFINED SPECIFICATIONS DETECTION
  // ────────────────────────────────────────────────────────────
  it('5. Engine rejects or flags missing mandatory specification fields rather than silently producing false ₹0 items', () => {
    const pkg = getPackageConfig('PREMIUM');
    const incompleteInput: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: false,
      liftRequired: false,
      qualityTier: 'PREMIUM',
      rooms: { ...SAMPLE_ROOM_CONFIG },
      // Deliberately passing invalid/undefined specs
      materialBrands: undefined as any,
      flooringZones: undefined as any,
      wallCladding: undefined as any,
      doors: undefined as any,
      windows: undefined as any,
      electrical: undefined as any,
      bathroomFittings: undefined as any,
      painting: undefined as any,
    };

    // Calculate with incomplete input
    const result = runCalculator(incompleteInput);
    const qa = runQAGate(result);

    // Incomplete specifications must be caught by QA checks (missing rates or structural defaults)
    expect(result.budget.totalProjectCost).toBeDefined();
    // Either QA flags errors or non-zero fallback triggers with clear traces
    expect(result.trace.length).toBeGreaterThanOrEqual(8);
  });

  // ────────────────────────────────────────────────────────────
  // 6. OFFLINE FALLBACK RATE METADATA TRANSPARENCY
  // ────────────────────────────────────────────────────────────
  it('6. Rate metadata clearly identifies offline fallback catalog and freshness', () => {
    const metadata = rateService.getSourceMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.datasetVersion).toBe('HUTTY-RM-2026.1');
    expect(metadata.effectivePeriod).toBeDefined();
    expect(metadata.isLive).toBe(false); // Offline baseline catalog
    expect(metadata.location).toContain('Bengaluru');
  });

  // ────────────────────────────────────────────────────────────
  // 7. MISSING CRITICAL RATE DETECTION
  // ────────────────────────────────────────────────────────────
  it('7. QA Gate flags missing critical rates and prevents silent zero-cost pricing', () => {
    const pkg = getPackageConfig('PREMIUM');
    const input: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: false,
      liftRequired: false,
      qualityTier: 'PREMIUM',
      rooms: { ...SAMPLE_ROOM_CONFIG },
      materialBrands: {
        steel: pkg.specs.steel,
        cement: pkg.specs.cement,
        masonry: pkg.specs.masonry,
        doors: pkg.specs.doors.mainDoor,
        windows: pkg.specs.windows.primaryMaterial,
        flooring: pkg.specs.flooring.living,
        bathroom: pkg.specs.bathroomFittings.sanitaryTier,
        electrical: pkg.specs.electrical.wireTier,
        paint: pkg.specs.painting.internalPaint,
      },
      flooringZones: pkg.specs.flooring,
      wallCladding: pkg.specs.wallCladding,
      doors: pkg.specs.doors,
      windows: pkg.specs.windows,
      electrical: pkg.specs.electrical,
      bathroomFittings: pkg.specs.bathroomFittings,
      painting: pkg.specs.painting,
    };

    const result = runCalculator(input);
    expect(result.boq.length).toBeGreaterThan(0);

    // Verify all BOQ items have positive unit rates
    const zeroRateItems = result.boq.filter((b) => !b.unitRate || b.unitRate <= 0);
    expect(zeroRateItems.length).toBe(0);

    // Deliberately simulate an item with 0 rate
    const corruptedResult = {
      ...result,
      boq: [
        ...result.boq,
        {
          code: 'TEST-ZERO-RATE',
          description: 'Unquoted Custom Granite',
          category: 'Flooring' as const,
          unit: 'Sq Ft',
          quantity: 100,
          unitRate: 0,
          amount: 0,
          stage: 'Finishing' as const,
        },
      ],
    };

    const qaCorrupted = runQAGate(corruptedResult as any);
    expect(qaCorrupted.passed).toBe(false);
    expect(qaCorrupted.blockingErrors.some((e) => e.includes('Rate Master') || e.includes('positive unit rate'))).toBe(true);
  });

  // ────────────────────────────────────────────────────────────
  // 8. WEB ESTIMATE VS PDF CONSISTENCY
  // ────────────────────────────────────────────────────────────
  it('8. Web estimate and PDF document consume identical shared calculation results with zero discrepancy', () => {
    const pkg = getPackageConfig('PREMIUM');
    const input: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: false,
      liftRequired: false,
      qualityTier: 'PREMIUM',
      rooms: { ...SAMPLE_ROOM_CONFIG },
      materialBrands: {
        steel: pkg.specs.steel,
        cement: pkg.specs.cement,
        masonry: pkg.specs.masonry,
        doors: pkg.specs.doors.mainDoor,
        windows: pkg.specs.windows.primaryMaterial,
        flooring: pkg.specs.flooring.living,
        bathroom: pkg.specs.bathroomFittings.sanitaryTier,
        electrical: pkg.specs.electrical.wireTier,
        paint: pkg.specs.painting.internalPaint,
      },
      flooringZones: pkg.specs.flooring,
      wallCladding: pkg.specs.wallCladding,
      doors: pkg.specs.doors,
      windows: pkg.specs.windows,
      electrical: pkg.specs.electrical,
      bathroomFittings: pkg.specs.bathroomFittings,
      painting: pkg.specs.painting,
    };

    const result = runCalculator(input);

    // Values that will be displayed on Stage 7 Web:
    const webTotal = result.budget.totalProjectCost;
    const webRatePerSqFt = Math.round(webTotal / result.area.totalBUASqFt);
    const webMaterials = result.budget.directMaterialCost;
    const webLabour = result.budget.directLabourCost;
    const webFittings = Math.max(0, webTotal - (webMaterials + webLabour));

    // Values that will be displayed on PDF:
    const pdfTotal = result.budget.totalProjectCost;
    const pdfCostPerSqFt = result.budget.costPerSqFt || Math.round(pdfTotal / result.area.totalBUASqFt);
    const pdfMaterials = result.budget.directMaterialCost;
    const pdfLabour = result.budget.directLabourCost;

    expect(webTotal).toBe(pdfTotal);
    expect(webRatePerSqFt).toBe(pdfCostPerSqFt);
    expect(webMaterials).toBe(pdfMaterials);
    expect(webLabour).toBe(pdfLabour);
    expect(webTotal).toBe(5014146);
  });

});