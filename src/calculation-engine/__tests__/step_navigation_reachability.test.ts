import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '../../store/useWizardStore';
import { runCalculator } from '../calculator';

describe('Calculator Step Navigation & Reachability Regression Suite', () => {
  beforeEach(() => {
    useWizardStore.getState().startNewProject();
  });

  it('Step 1 bottom navigation remains reachable and Next advances to Step 2', () => {
    const store = useWizardStore.getState();

    // 1. Initial Step is 1 (or 0 for onboarding, advance to Step 1)
    store.setStep(1);
    expect(useWizardStore.getState().currentStep).toBe(1);

    // 2. Configure Step 1 Plot Dimensions (e.g. 30x40 standard site)
    store.setCity('Bangalore');
    store.setPlotDimensions(40, 30);

    const stateAfterInput = useWizardStore.getState();
    expect(stateAfterInput.plotLength).toBe(40);
    expect(stateAfterInput.plotWidth).toBe(30);
    expect(stateAfterInput.plotLength * stateAfterInput.plotWidth).toBe(1200);

    // 3. Calculation engine executes and computes valid BUA for Step 1
    const engineInput = {
      city: stateAfterInput.city,
      authority: stateAfterInput.authority,
      plotLength: stateAfterInput.plotLength,
      plotWidth: stateAfterInput.plotWidth,
      builtUpAreaPerFloor: 720,
      houseType: stateAfterInput.houseType,
      floors: stateAfterInput.floors,
      parkingType: stateAfterInput.parkingType,
      carCount: stateAfterInput.carCount,
      bikeCount: stateAfterInput.bikeCount,
      evCharging: stateAfterInput.evCharging,
      liftRequired: stateAfterInput.liftRequired,
      rooms: stateAfterInput.rooms,
      qualityTier: stateAfterInput.qualityTier,
      materialBrands: stateAfterInput.materialBrands,
      flooringZones: stateAfterInput.flooringZones,
      wallCladding: stateAfterInput.wallCladding,
      doors: stateAfterInput.doors,
      windows: stateAfterInput.windows,
    };

    const budgetResult = runCalculator(engineInput);
    expect(budgetResult.budget.totalProjectCost).toBeGreaterThan(0);
    expect(budgetResult.area.totalBUASqFt).toBeGreaterThan(0);

    // 4. Trigger Next Navigation (advancing from Step 1 to Step 2)
    useWizardStore.getState().nextStep();
    expect(useWizardStore.getState().currentStep).toBe(2);

    // 5. Subsequent step transitions operate without interruption
    useWizardStore.getState().nextStep();
    expect(useWizardStore.getState().currentStep).toBe(3);

    useWizardStore.getState().prevStep();
    expect(useWizardStore.getState().currentStep).toBe(2);

    useWizardStore.getState().prevStep();
    expect(useWizardStore.getState().currentStep).toBe(1);
  });

  it('enforces boundaries: step cannot advance past 11 or below 0', () => {
    const store = useWizardStore.getState();

    store.setStep(11);
    expect(useWizardStore.getState().currentStep).toBe(11);

    store.nextStep();
    expect(useWizardStore.getState().currentStep).toBe(11); // Clamped at 11

    store.setStep(0);
    expect(useWizardStore.getState().currentStep).toBe(0);

    store.prevStep();
    expect(useWizardStore.getState().currentStep).toBe(0); // Clamped at 0
  });
});
