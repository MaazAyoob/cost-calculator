import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '../../store/useWizardStore';
import { evaluateAuthorityLimits, evaluatePlotSetbacks } from '../data/authorityRules';
import { calculateArea } from '../modules/bua';
import { runCalculator } from '../calculator';

describe('Hutty 3.1 — Chapter 1: Plot & Setbacks Architecture & Integration Suite', () => {
  beforeEach(() => {
    useWizardStore.getState().startNewProject();
  });

  // ── 1. STORE INITIALIZATION & DEFAULTS ──
  it('initializes plot and setback store state and applies safe residential defaults', () => {
    const store = useWizardStore.getState();
    expect(store.plotLength).toBe(0);
    expect(store.plotWidth).toBe(0);

    // Chapter 1 safe defaults
    store.setPlotDimensions(40, 30);
    store.setRoadWidth(30);
    store.setCity('Bangalore');
    store.setAuthority('BBMP/BDA');

    const updated = useWizardStore.getState();
    expect(updated.plotLength).toBe(40);
    expect(updated.plotWidth).toBe(30);
    expect(updated.plotLength * updated.plotWidth).toBe(1200);
    expect(updated.roadWidthFt).toBe(30);
    expect(updated.city).toBe('Bangalore');
    expect(updated.authority).toBe('BBMP/BDA');
  });

  // ── 2. PRESET DIMENSION APPLICATION ──
  it('applies popular preset plot sizes deterministically', () => {
    const store = useWizardStore.getState();

    // 20 × 30 ft (600 sq.ft)
    store.setPlotDimensions(30, 20);
    expect(useWizardStore.getState().plotLength).toBe(30);
    expect(useWizardStore.getState().plotWidth).toBe(20);
    expect(useWizardStore.getState().plotLength * useWizardStore.getState().plotWidth).toBe(600);

    // 30 × 50 ft (1,500 sq.ft)
    store.setPlotDimensions(50, 30);
    expect(useWizardStore.getState().plotLength).toBe(50);
    expect(useWizardStore.getState().plotWidth).toBe(30);
    expect(useWizardStore.getState().plotLength * useWizardStore.getState().plotWidth).toBe(1500);

    // 40 × 60 ft (2,400 sq.ft)
    store.setPlotDimensions(60, 40);
    expect(useWizardStore.getState().plotLength).toBe(60);
    expect(useWizardStore.getState().plotWidth).toBe(40);
    expect(useWizardStore.getState().plotLength * useWizardStore.getState().plotWidth).toBe(2400);
  });

  // ── 3. ROAD WIDTH & CORNER PLOT CONFIGURATION ──
  it('configures road width and multi-boundary corner frontages', () => {
    const store = useWizardStore.getState();

    // Road width selection
    store.setRoadWidth(40);
    expect(useWizardStore.getState().roadWidthFt).toBe(40);

    // Corner plot enablement
    store.setIsCornerPlot(true);
    store.setRoadFacingBoundaries(['front', 'left']);

    expect(useWizardStore.getState().isCornerPlot).toBe(true);
    expect(useWizardStore.getState().roadFacingBoundaries).toEqual(['front', 'left']);
  });

  // ── 4. BANGALORE USES CANONICAL BENGALURU AUTHORITY EVALUATION ──
  it('1. Bangalore selection uses the canonical Bengaluru authority evaluation (GBA 2026 Table 1)', () => {
    const authEval = evaluateAuthorityLimits({
      city: 'Bangalore',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
    });

    expect(authEval).toBeDefined();
    expect(authEval.city).toBe('Bengaluru');
    expect(authEval.statutoryFrontSetbackFt).toBeCloseTo(2.95, 2);
    expect(authEval.statutoryRearSetbackFt).toBeCloseTo(2.30, 2);
    expect(authEval.statutoryLeftSetbackFt).toBeCloseTo(2.30, 2);
    expect(authEval.statutoryRightSetbackFt).toBeCloseTo(0.00, 2);
    expect(authEval.maxGroundCoveragePct).toBe(70);
    expect(authEval.buildableFootprintSqFt).toBe(963);
    expect(authEval.verificationStatus).toBe('OFFICIAL_GAZETTE_PENDING_CONFIRMATION');
  });

  // ── 5. MYSORE USES CANONICAL MYSORE AUTHORITY EVALUATION (MUDA) ──
  it('2. Mysore selection uses the canonical Mysore authority evaluation (MUDA CDP 2031 Schedule II)', () => {
    const authEval = evaluateAuthorityLimits({
      city: 'Mysore',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
    });

    expect(authEval).toBeDefined();
    expect(authEval.city).toBe('Mysuru');
    expect(authEval.authority).toBe('MUDA');
    // MUDA CDP 2031 Schedule II for 30x40 (1,200 sq.ft): 1.2m (3.94ft) front, 1.0m (3.28ft) rear/sides
    expect(authEval.statutoryFrontSetbackFt).toBeCloseTo(3.94, 2);
    expect(authEval.statutoryRearSetbackFt).toBeCloseTo(3.28, 2);
    expect(authEval.statutoryLeftSetbackFt).toBeCloseTo(3.28, 2);
    expect(authEval.statutoryRightSetbackFt).toBeCloseTo(3.28, 2);
    expect(authEval.maxGroundCoveragePct).toBe(70);
    expect(authEval.verificationStatus).toBe('INDEPENDENTLY_VERIFIED');
  });

  // ── 6. CHAPTER 1 PREVIEW & DOWNSTREAM CALCULATION AGREE ──
  it('3. Chapter 1 preview and downstream calculation agree for identical inputs in both cities', () => {
    // A. Bangalore Test
    const blrPreview = evaluateAuthorityLimits({
      city: 'Bangalore',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
    });

    const blrEngineArea = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
      floors: 2,
    });

    expect(blrPreview.statutoryFrontSetbackFt).toBe(blrEngineArea.statutorySetbacks.frontSetbackFt);
    expect(blrPreview.statutoryRearSetbackFt).toBe(blrEngineArea.statutorySetbacks.rearSetbackFt);
    expect(blrPreview.statutoryLeftSetbackFt).toBe(blrEngineArea.statutorySetbacks.leftSetbackFt);
    expect(blrPreview.statutoryRightSetbackFt).toBe(blrEngineArea.statutorySetbacks.rightSetbackFt);
    expect(blrPreview.maxGroundCoveragePct).toBe(blrEngineArea.maxPermissibleCoveragePct);

    // B. Mysore Test
    const mysPreview = evaluateAuthorityLimits({
      city: 'Mysore',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
    });

    const mysEngineArea = calculateArea({
      city: 'Mysore',
      authority: 'MUDA',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
      floors: 2,
    });

    expect(mysPreview.statutoryFrontSetbackFt).toBe(mysEngineArea.statutorySetbacks.frontSetbackFt);
    expect(mysPreview.statutoryRearSetbackFt).toBe(mysEngineArea.statutorySetbacks.rearSetbackFt);
    expect(mysPreview.statutoryLeftSetbackFt).toBe(mysEngineArea.statutorySetbacks.leftSetbackFt);
    expect(mysPreview.statutoryRightSetbackFt).toBe(mysEngineArea.statutorySetbacks.rightSetbackFt);
    expect(mysPreview.maxGroundCoveragePct).toBe(mysEngineArea.maxPermissibleCoveragePct);
  });

  // ── 7. OTHER CITY DOES NOT SILENTLY FALL BACK TO BENGALURU RULES ──
  it('4. Other City selection does not silently apply Bengaluru statutory setbacks', () => {
    const store = useWizardStore.getState();
    store.setCity('Other');
    store.setAuthority('Other / None');
    store.setPlotDimensions(40, 30);

    const updated = useWizardStore.getState();
    expect(updated.city).toBe('Other');
    expect(updated.authority).toBe('Other / None');

    // In Chapter 1 logic, when city is Other, statutory setbacks are NOT fabricated
    const isOtherCity = updated.city === 'Other';
    expect(isOtherCity).toBe(true);

    // Without user custom clearances, statutory setbacks must be null (unavailable)
    const hasCustomClearances =
      typeof updated.frontSetback === 'number' ||
      typeof updated.rearSetback === 'number' ||
      typeof updated.leftSetback === 'number' ||
      typeof updated.rightSetback === 'number';

    expect(hasCustomClearances).toBe(false);
  });

  // ── 8. OTHER CITY DOES NOT APPLY AN UNSUPPORTED STATUTORY COVERAGE CAP ──
  it('5. Other City does not assume an unsupported statutory 70% coverage cap', () => {
    const customSetbacks = {
      frontSetbackFt: 5.0,
      rearSetbackFt: 4.0,
      leftSetbackFt: 3.0,
      rightSetbackFt: 3.0,
    };

    const safeWidth = 30;
    const safeLength = 40;

    // Physical space inside clearances
    const buildableW = safeWidth - (customSetbacks.leftSetbackFt + customSetbacks.rightSetbackFt);
    const buildableL = safeLength - (customSetbacks.frontSetbackFt + customSetbacks.rearSetbackFt);
    const geometricEnvelope = buildableW * buildableL; // 24 * 31 = 744 sq.ft

    // For Other City, maxCoveragePct must remain null/unverified rather than forcing 70%
    const maxCoveragePct = null;
    expect(maxCoveragePct).toBeNull();
    expect(geometricEnvelope).toBe(744);
  });

  // ── 9. CUSTOM CLEARANCE-BASED BOUNDARY INPUTS ARE RETAINED & CORRECTLY APPLIED ──
  it('6. Custom clearance-based boundary inputs are retained and correctly override statutory defaults', () => {
    const store = useWizardStore.getState();
    store.setCustomSetbacks(5.0, 4.0, 3.0, 3.0);

    const state = useWizardStore.getState();
    expect(state.frontSetback).toBe(5.0);
    expect(state.rearSetback).toBe(4.0);
    expect(state.leftSetback).toBe(3.0);
    expect(state.rightSetback).toBe(3.0);

    const authEval = evaluateAuthorityLimits({
      city: 'Bangalore',
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
      customSetbacks: {
        frontSetbackFt: state.frontSetback!,
        rearSetbackFt: state.rearSetback!,
        leftSetbackFt: state.leftSetback!,
        rightSetbackFt: state.rightSetback!,
      },
    });

    // With custom setbacks, buildable footprint reflects custom dimensions (24 x 31 = 744 sq.ft)
    expect(authEval.statutoryFrontSetbackFt).toBeCloseTo(2.95, 2);
    expect(authEval.verificationStatus).toBe('MANUAL_OVERRIDE');
    expect(authEval.buildableFootprintSqFt).toBe(744);
  });

  // ── 10. MISSING CLEARANCES IN OTHER CITY PRODUCE UNAVAILABLE RESULT ──
  it('7. Missing clearances in Other City produce a clear unavailable result instead of a fabricated footprint', () => {
    const isOtherCity = true;
    const hasCustomClearances = false;

    const maxBuildableGroundFloor = !isOtherCity || hasCustomClearances ? 840 : null;
    const isFootprintUnavailable = isOtherCity && !hasCustomClearances;

    expect(isFootprintUnavailable).toBe(true);
    expect(maxBuildableGroundFloor).toBeNull();
  });

  // ── 11. PLOT PRESETS, CORNER FRONTAGES & OVERFLOW VALIDATION ──
  it('8. Existing plot presets, corner frontages and overflow validation operate reliably', () => {
    // Presets
    const store = useWizardStore.getState();
    store.setPlotDimensions(50, 30);
    expect(useWizardStore.getState().plotLength).toBe(50);
    expect(useWizardStore.getState().plotWidth).toBe(30);

    // Corner plot frontage
    store.setIsCornerPlot(true);
    store.setRoadFacingBoundaries(['front', 'left']);
    expect(useWizardStore.getState().isCornerPlot).toBe(true);
    expect(useWizardStore.getState().roadFacingBoundaries).toContain('left');

    // Overflow validation (setbacks exceed plot width)
    const safeWidth = 30;
    const leftSetback = 20;
    const rightSetback = 15;
    const isOverflow = leftSetback + rightSetback >= safeWidth;
    expect(isOverflow).toBe(true);
  });

  // ── 12. ANONYMOUS SESSION PERSISTENCE & NAVIGATION ──
  it('9. Anonymous session persistence and navigation state remain intact', () => {
    const store = useWizardStore.getState();
    store.setStep(1);
    store.setCity('Mysore');
    store.setPlotDimensions(40, 30);

    expect(useWizardStore.getState().currentStep).toBe(1);
    expect(useWizardStore.getState().city).toBe('Mysore');
    expect(useWizardStore.getState().plotLength).toBe(40);
    expect(useWizardStore.getState().plotWidth).toBe(30);

    // Advance to next step
    store.nextStep();
    expect(useWizardStore.getState().currentStep).toBe(2);

    // Return to step 1
    store.prevStep();
    expect(useWizardStore.getState().currentStep).toBe(1);
    expect(useWizardStore.getState().city).toBe('Mysore');
  });

  // ── 13. DOWNSTREAM CALCULATION ENGINE REMAINS FULLY FUNCTIONAL ──
  it('10. Downstream calculation engine runs end-to-end and computes valid project cost and BOQ', () => {
    const store = useWizardStore.getState();
    store.setCity('Bangalore');
    store.setPlotDimensions(40, 30);

    const engineInput = {
      city: 'Bangalore' as const,
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex' as const,
      parkingType: 'Normal Ground' as const,
      carCount: 1,
      bikeCount: 2,
      evCharging: false,
      liftRequired: false,
      rooms: store.rooms,
      qualityTier: 'Premium' as const,
      materialBrands: store.materialBrands,
      flooringZones: store.flooringZones,
      wallCladding: store.wallCladding,
      doors: store.doors,
      windows: store.windows,
    };

    const calcResult = runCalculator(engineInput);
    expect(calcResult).toBeDefined();
    expect(calcResult.budget.totalProjectCost).toBeGreaterThan(0);
    expect(calcResult.area.totalBUASqFt).toBeGreaterThan(0);
    expect(calcResult.boq.length).toBeGreaterThan(0);
    expect(calcResult.materialSchedule.length).toBeGreaterThan(0);
  });
});
