import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { useWizardStore } from '../../store/useWizardStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { rateService } from '../data/rateService';

describe('Doors & Windows Cost Propagation and Pre-Launch Regression Suite', () => {
  const baseInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30,
    roadWidthFt: 30,
    builtUpAreaPerFloor: 800,
    houseType: 'Duplex',
    floors: 2,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      kitchen: 1,
      living: 1,
      dining: 1,
      pooja: 0,
      utility: 1,
      storeRoom: 0,
      office: 0,
      balcony: 1,
      commonToilets: 0,
    },
    qualityTier: 'Premium',
    doors: {
      mainDoor: 'Premium Teak',
      internalDoor: 'Flush Door',
      bathroomDoor: 'WPC Door',
    },
    windows: {
      primaryMaterial: 'uPVC',
      subGrade: 'Standard uPVC',
    },
  };

  beforeEach(() => {
    rateService.resetToDefaults();
  });

  // 1. Changing bathroom-door count changes the applicable quantity and total.
  it('1. Changing bathroom count changes bathroom door quantity and total cost', () => {
    const res3Baths = runCalculator(baseInput);
    const res4Baths = runCalculator({
      ...baseInput,
      rooms: { ...baseInput.rooms, bathrooms: 4 },
    });

    const door3 = res3Baths.doorSchedule.find((d) => d.code === 'D-BATH');
    const door4 = res4Baths.doorSchedule.find((d) => d.code === 'D-BATH');

    expect(door3?.quantity).toBe(3);
    expect(door4?.quantity).toBe(4);
    expect(res4Baths.budget.totalProjectCost).toBeGreaterThan(res3Baths.budget.totalProjectCost);

    // Cost difference includes the door cost difference
    const doorDiff = (door4?.amount ?? 0) - (door3?.amount ?? 0);
    expect(doorDiff).toBe(11000); // 1 extra WPC door @ 11000
  });

  // 2. Changing bathroom-door specification updates the rate and total when rates differ.
  it('2. Changing bathroom door specification updates unit rate and total project cost', () => {
    const resWPC = runCalculator({
      ...baseInput,
      doors: { ...baseInput.doors!, bathroomDoor: 'WPC Door' },
    });

    const resLaminated = runCalculator({
      ...baseInput,
      doors: { ...baseInput.doors!, bathroomDoor: 'FRP / WPC Laminated' },
    });

    const resFRP = runCalculator({
      ...baseInput,
      doors: { ...baseInput.doors!, bathroomDoor: 'FRP / ERP Door' },
    });

    const doorWPC = resWPC.doorSchedule.find((d) => d.code === 'D-BATH');
    const doorLam = resLaminated.doorSchedule.find((d) => d.code === 'D-BATH');
    const doorFRP = resFRP.doorSchedule.find((d) => d.code === 'D-BATH');

    expect(doorWPC?.unitRate).toBe(11000);
    expect(doorLam?.unitRate).toBe(13500);
    expect(doorFRP?.unitRate).toBe(8500);

    expect(doorLam?.amount).toBe(3 * 13500); // 40500
    expect(doorWPC?.amount).toBe(3 * 11000); // 33000
    expect(doorFRP?.amount).toBe(3 * 8500);   // 25500

    // Final total project cost must strictly reflect differences
    expect(resLaminated.budget.totalProjectCost).toBeGreaterThan(resWPC.budget.totalProjectCost);
    expect(resWPC.budget.totalProjectCost).toBeGreaterThan(resFRP.budget.totalProjectCost);

    // Exact difference verification:
    const lamWpcDiff = resLaminated.budget.totalProjectCost - resWPC.budget.totalProjectCost;
    expect(lamWpcDiff).toBeGreaterThanOrEqual(7500);
  });

  // 3. Changing window count changes the applicable quantity and total.
  it('3. Changing room count updates window count, total area, and window cost', () => {
    const res3Bed = runCalculator(baseInput);
    const res5Bed = runCalculator({
      ...baseInput,
      rooms: { ...baseInput.rooms, bedrooms: 5 },
    });

    const totalWinQty3 = res3Bed.windowSchedule.reduce((sum, w) => sum + w.quantity, 0);
    const totalWinQty5 = res5Bed.windowSchedule.reduce((sum, w) => sum + w.quantity, 0);

    expect(totalWinQty5).toBeGreaterThan(totalWinQty3);
    expect(res5Bed.budget.totalProjectCost).toBeGreaterThan(res3Bed.budget.totalProjectCost);
  });

  // 4. Changing window specification updates the rate and total when rates differ.
  it('4. Changing window specification updates unit rate and total project cost', () => {
    const resStandard = runCalculator({
      ...baseInput,
      windows: { primaryMaterial: 'uPVC', subGrade: 'Standard uPVC' },
    });

    const resFenesta = runCalculator({
      ...baseInput,
      windows: { primaryMaterial: 'uPVC', subGrade: 'Luxury / Fenesta uPVC' },
    });

    const resTeak = runCalculator({
      ...baseInput,
      windows: { primaryMaterial: 'Wood', subGrade: 'Teak Wood Frame' },
    });

    const resAluminium = runCalculator({
      ...baseInput,
      windows: { primaryMaterial: 'Aluminium', subGrade: 'Anodized Aluminium' },
    });

    const stdRate = resStandard.windowSchedule[0]?.unitRate;
    const fenRate = resFenesta.windowSchedule[0]?.unitRate;
    const teakRate = resTeak.windowSchedule[0]?.unitRate;
    const alumRate = resAluminium.windowSchedule[0]?.unitRate;

    expect(stdRate).toBe(550);
    expect(fenRate).toBe(850);
    expect(teakRate).toBe(950);
    expect(alumRate).toBe(480);

    // Fenesta > Standard
    expect(resFenesta.budget.totalProjectCost).toBeGreaterThan(resStandard.budget.totalProjectCost);
    // Teak > Fenesta
    expect(resTeak.budget.totalProjectCost).toBeGreaterThan(resFenesta.budget.totalProjectCost);
    // Standard > Aluminium
    expect(resStandard.budget.totalProjectCost).toBeGreaterThan(resAluminium.budget.totalProjectCost);
  });

  // 5. Removing a configured item removes its associated cost.
  it('5. Removing bathrooms to zero removes bathroom door cost completely without charging', () => {
    const resZeroBaths = runCalculator({
      ...baseInput,
      rooms: { ...baseInput.rooms, bathrooms: 0 },
    });

    const bathDoor = resZeroBaths.doorSchedule.find((d) => d.code === 'D-BATH');
    expect(bathDoor).toBeUndefined();
  });

  // 6. Changing unrelated specifications does not unexpectedly alter bathroom-door or window quantities.
  it('6. Changing paint or flooring does not alter bathroom door or window quantities', () => {
    const resBase = runCalculator(baseInput);
    const resPaintChanged = runCalculator({
      ...baseInput,
      materialBrands: {
        paint: 'Asian Paints Royale Luxury Emulsion',
        flooring: 'Italian Marble',
      },
    });

    const baseBathQty = resBase.doorSchedule.find((d) => d.code === 'D-BATH')?.quantity;
    const changedBathQty = resPaintChanged.doorSchedule.find((d) => d.code === 'D-BATH')?.quantity;
    expect(changedBathQty).toBe(baseBathQty);

    const baseWinQty = resBase.windowSchedule.reduce((acc, w) => acc + w.quantity, 0);
    const changedWinQty = resPaintChanged.windowSchedule.reduce((acc, w) => acc + w.quantity, 0);
    expect(changedWinQty).toBe(baseWinQty);
  });

  // 7. A material rate update changes the expected cost line and total while preserving quantities.
  it('7. Rate master override changes door rate and total project cost while preserving physical quantity', () => {
    const resBefore = runCalculator(baseInput);
    const qtyBefore = resBefore.doorSchedule.find((d) => d.code === 'D-BATH')?.quantity;

    rateService.setOverride({
      id: 'ov-bath-test',
      rateId: 'doors.bathroom_wpc',
      overrideRate: 18000,
      packageTier: 'ALL',
      location: 'ALL',
      source: 'ADMIN_OVERRIDE',
    });

    const resAfter = runCalculator(baseInput);
    const doorAfter = resAfter.doorSchedule.find((d) => d.code === 'D-BATH');

    expect(doorAfter?.quantity).toBe(qtyBefore);
    expect(doorAfter?.unitRate).toBe(18000);
    expect(doorAfter?.amount).toBe(3 * 18000);
    expect(resAfter.budget.totalProjectCost).toBeGreaterThan(resBefore.budget.totalProjectCost);
  });

  // 8. Deterministic recalculation produces stable results.
  it('8. Recalculating with identical inputs produces deterministic and identical output', () => {
    const run1 = runCalculator(baseInput);
    const run2 = runCalculator(baseInput);

    expect(run1.budget.totalProjectCost).toBe(run2.budget.totalProjectCost);
    expect(run1.doorSchedule).toEqual(run2.doorSchedule);
    expect(run1.windowSchedule).toEqual(run2.windowSchedule);
  });

  // 9. Wizard Store reactive propagation and synchronisation with materialBrands.
  it('9. Wizard store synchronizes door & window selection to materialBrands and triggers recalculation in calculationStore', () => {
    useWizardStore.getState().resetConfigurator();
    useWizardStore.getState().setPlotDimensions(40, 30);
    useWizardStore.getState().setHouseConfig('Duplex', 2);
    useWizardStore.getState().setRoomCount('bedrooms', 3);
    useWizardStore.getState().setRoomCount('bathrooms', 3);

    // Initial state with WPC Door
    useWizardStore.getState().setDoorSelection('bathroomDoor', 'WPC Door');
    const costWPC = useCalculationStore.getState().result.budget.totalProjectCost;
    expect(costWPC).toBeGreaterThan(0);

    // Mutate bathroom door to FRP / WPC Laminated (₹13,500)
    useWizardStore.getState().setDoorSelection('bathroomDoor', 'FRP / WPC Laminated');
    const afterLaminated = useCalculationStore.getState().result.budget.totalProjectCost;
    expect(afterLaminated).toBeGreaterThan(costWPC);

    // Mutate bathroom door to FRP / ERP Door (₹8,500)
    useWizardStore.getState().setDoorSelection('bathroomDoor', 'FRP / ERP Door');
    const afterFRP = useCalculationStore.getState().result.budget.totalProjectCost;
    expect(afterFRP).toBeLessThan(afterLaminated);

    // Mutate window to Fenesta
    useWizardStore.getState().setWindowSelection('uPVC', 'Luxury / Fenesta uPVC');
    const afterFenesta = useCalculationStore.getState().result.budget.totalProjectCost;
    expect(afterFenesta).toBeGreaterThan(afterFRP);

    // Mutate main door to Burma Teak
    useWizardStore.getState().setDoorSelection('mainDoor', 'Burma Teak (1st Quality)');

    // Verify state in store
    const state = useWizardStore.getState();
    expect(state.doors.bathroomDoor).toBe('FRP / ERP Door');
    expect(state.doors.mainDoor).toBe('Burma Teak (1st Quality)');
    expect(state.materialBrands.doors).toBe('Burma Teak (1st Quality)');
    expect(state.windows.subGrade).toBe('Luxury / Fenesta uPVC');
    expect(state.materialBrands.windows).toBe('Luxury / Fenesta uPVC');
  });

  // 10. BOQ category assignment and explanation transparency integrity.
  it('10. Doors & Windows BOQ items are assigned to proper categories and explanations match output', () => {
    const result = runCalculator(baseInput);
    const boq = result.boq;

    const doorItems = boq.filter((i) => i.category === 'Doors & Joinery');
    const windowItems = boq.filter((i) => i.category === 'Windows & Glazing');

    expect(doorItems.length).toBeGreaterThan(0);
    expect(windowItems.length).toBeGreaterThan(0);

    // Check transparency explanations for Doors and Windows
    const explanations = result.explanations;
    expect(explanations).toBeDefined();
    expect(explanations['doors']).toBeDefined();
    expect(explanations['doors'].stepTotal).toBeGreaterThan(0);
    expect(explanations['doors'].rateBreakdown.length).toBeGreaterThan(0);
    expect(explanations['doors'].inputsUsed.some((i) => i.label === 'Bathroom Door Specification')).toBe(true);

    expect(explanations['windows']).toBeDefined();
    expect(explanations['windows'].stepTotal).toBeGreaterThan(0);
    expect(explanations['windows'].rateBreakdown.length).toBeGreaterThan(0);
  });
});
