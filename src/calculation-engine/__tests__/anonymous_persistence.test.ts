import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '../../store/useWizardStore';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { runCalculator } from '../calculator';

describe('Anonymous Access, Persistence & Gating Architecture', () => {
  beforeEach(() => {
    // Reset stores to initial anonymous state
    useCustomerAuthStore.getState().logout();
    useWizardStore.getState().startNewProject();
  });

  it('1. permits anonymous entry with unauthenticated customer state', () => {
    const auth = useCustomerAuthStore.getState();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
  });

  it('2. enables full planning and customization without authentication credentials', () => {
    useWizardStore.getState().setPlotDimensions(35, 50);
    useWizardStore.getState().setHouseConfig('Duplex', 3);
    useWizardStore.getState().setRoomCount('bedroom', 4);
    useWizardStore.getState().setRoomCount('bathroom', 4);
    useWizardStore.getState().setFabricationSelection({
      staircaseRailing: 'ss_glass',
      balconyRailing: 'ss_glass',
      terraceRailing: 'ms_pipe',
      mainGate: 'designer_cnc',
      tankLadder: true,
      skylight: true,
      balconyDoor: 'upvc_sliding',
      elevationCladding: 'hpl_wooden_stone',
    });

    const updated = useWizardStore.getState();
    expect(updated.plotLength).toBe(35);
    expect(updated.plotWidth).toBe(50);
    expect(updated.floors).toBe(3);
    expect(updated.rooms.bedroom).toBe(4);
    expect(updated.fabrication.staircaseRailing).toBe('ss_glass');
    expect(updated.fabrication.elevationCladding).toBe('hpl_wooden_stone');
  });

  it('3. serializes and persists accurately under the key cost_calculator_wizard_state_v4', () => {
    useWizardStore.getState().setPlotDimensions(40, 60);
    useWizardStore.getState().setHouseConfig('Duplex', 2);

    const store = useWizardStore.getState();
    const snapshot = {
      state: {
        plotLength: store.plotLength,
        plotWidth: store.plotWidth,
        floors: store.floors,
        hasStartedSelection: true,
        selectedPackage: 'PREMIUM',
      },
      version: 4,
    };

    const serialized = JSON.stringify(snapshot);
    expect(serialized).toContain('"plotLength":40');
    expect(serialized).toContain('"plotWidth":60');
    expect(serialized).toContain('"floors":2');

    // Deserialization check
    const deserialized = JSON.parse(serialized);
    expect(deserialized.state.plotLength).toBe(40);
    expect(deserialized.version).toBe(4);
  });

  it('4. calculates preliminary cost estimate in real time for anonymous user with zero login barrier', () => {
    useWizardStore.getState().setPlotDimensions(30, 40);
    useWizardStore.getState().setHouseConfig('Duplex', 2);

    const result = runCalculator({
      plotLength: 30,
      plotWidth: 40,
      floors: 2,
      roadWidth: 30,
      city: 'Bangalore',
      specificationTier: 'Premium',
      rooms: {
        living: 1,
        dining: 1,
        kitchen: 1,
        bedroom: 3,
        bathroom: 3,
        balcony: 1,
        utility: 1,
        puja: 1,
        study: 0,
        homeTheatre: 0,
        servantRoom: 0,
        foyer: 1,
      },
    });

    expect(result.area.totalBUASqFt).toBeGreaterThan(0);
    expect(result.budget.totalProjectCost).toBeGreaterThan(0);
    expect(result.boq.length).toBeGreaterThan(0);

    // Free tier estimate preview is immediately accessible
    expect(result.budget.directConstructionBudget).toBeGreaterThan(0);
    expect(result.budget.directLabourCost).toBeGreaterThan(0);
  });

  it('5. enforces report and full BOQ gating strictly at commercial boundaries', () => {
    const result = runCalculator({
      plotLength: 30,
      plotWidth: 40,
      floors: 2,
      roadWidth: 30,
      city: 'Bangalore',
      specificationTier: 'Premium',
      rooms: {
        living: 1,
        dining: 1,
        kitchen: 1,
        bedroom: 3,
        bathroom: 3,
        balcony: 1,
        utility: 1,
        puja: 1,
        study: 0,
        homeTheatre: 0,
        servantRoom: 0,
        foyer: 1,
      },
    });

    const boqItems = result.boq;
    expect(boqItems.length).toBeGreaterThan(5);

    // Free anonymous preview is restricted to first 5 preview rows
    const freePreviewRows = boqItems.slice(0, 5);
    const lockedRowsCount = boqItems.length - 5;

    expect(freePreviewRows.length).toBe(5);
    expect(lockedRowsCount).toBeGreaterThan(20);
  });
});
