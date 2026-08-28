// ============================================================
// CALCULATION STORE
// Central Zustand store for all engine outputs.
// Automatically recalculates whenever useWizardStore state changes!
// ============================================================

import { create } from 'zustand';
import { CalculationResult, EngineInput } from '../calculation-engine/types';
import { runCalculator } from '../calculation-engine/calculator';
import { useWizardStore } from './useWizardStore';

// Build EngineInput from the wizard store state
function buildInput(): EngineInput {
  const s = useWizardStore.getState();
  const input: EngineInput = {
    city:            s.city || 'Bangalore',
    authority:       s.authority || 'BBMP/BDA',
    plotLength:      s.plotLength || 0,
    plotWidth:       s.plotWidth || 0,
    roadWidthFt:     s.roadWidthFt || 30,
    builtUpAreaPerFloor: s.builtUpAreaPerFloor || 0,
    userSelectedBUA: s.userSelectedBUA !== null && s.userSelectedBUA !== undefined ? s.userSelectedBUA : undefined,
    frontSetback:    s.frontSetback !== null && s.frontSetback !== undefined ? s.frontSetback : undefined,
    rearSetback:     s.rearSetback !== null && s.rearSetback !== undefined ? s.rearSetback : undefined,
    leftSetback:     s.leftSetback !== null && s.leftSetback !== undefined ? s.leftSetback : undefined,
    rightSetback:    s.rightSetback !== null && s.rightSetback !== undefined ? s.rightSetback : undefined,
    houseType:       s.houseType || 'Duplex',
    floors:          s.floors > 0 ? s.floors : (s.plotLength > 0 && s.plotWidth > 0 ? 1 : 0),
    parkingType:     (s.parkingType as any) || 'Normal Ground',
    carCount:        s.carCount || 0,
    bikeCount:       s.bikeCount || 0,
    evCharging:      s.evCharging || false,
    liftRequired:    s.liftRequired || false,
    rooms:           s.rooms,
    qualityTier:     s.qualityTier || 'Premium',
    materialBrands:  s.materialBrands,
    flooringZones:   s.flooringZones,
    wallCladding:    s.wallCladding,
    doors:           s.doors,
    windows:         s.windows,
    electrical:      s.electrical,
    bathroomFittings: s.bathroomFittings,
    painting:        s.painting,
  };
  return input;
}

// Generate initial calculation immediately
const initialInput = buildInput();
const initialResult = runCalculator(initialInput);

interface CalculationStore {
  result: CalculationResult;
  isCalculating: boolean;
  lastCalculatedAt: string;
  recalculate: () => CalculationResult;
}

export const useCalculationStore = create<CalculationStore>((set) => ({
  result:            initialResult,
  isCalculating:     false,
  lastCalculatedAt:  initialResult.calculatedAt,

  recalculate: () => {
    const input = buildInput();
    const result = runCalculator(input);
    set({ result, isCalculating: false, lastCalculatedAt: result.calculatedAt });
    return result;
  },
}));

// Automatically subscribe to any change in useWizardStore!
useWizardStore.subscribe(() => {
  useCalculationStore.getState().recalculate();
});

// ── Selector helpers (for clean component usage) ──────────
export const useArea              = () => useCalculationStore((s) => s.result.area);
export const useBuildingModel     = () => useCalculationStore((s) => s.result.buildingModel);
export const useQuantities        = () => useCalculationStore((s) => s.result.quantities);
export const useBudgetResult      = () => useCalculationStore((s) => s.result.budget);
export const useBOQ               = () => useCalculationStore((s) => s.result.boq);
export const useMaterialSchedule  = () => useCalculationStore((s) => s.result.materialSchedule);
export const useFixtureSchedule   = () => useCalculationStore((s) => s.result.fixtureSchedule);
export const useDoorSchedule      = () => useCalculationStore((s) => s.result.doorSchedule);
export const useWindowSchedule    = () => useCalculationStore((s) => s.result.windowSchedule);
export const useTimeline          = () => useCalculationStore((s) => s.result.timeline);
export const usePaymentResult     = () => useCalculationStore((s) => s.result.paymentPlan);
export const useProcurement       = () => useCalculationStore((s) => s.result.procurement);
export const useReportData        = () => useCalculationStore((s) => s.result.report);
export const useCalculationTrace  = () => useCalculationStore((s) => s.result.trace);
export const useParameterTable    = () => useCalculationStore((s) => s.result.parameterTable);
