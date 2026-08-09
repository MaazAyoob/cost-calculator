import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useWizardStore } from './useWizardStore';

export interface SavedEstimation {
  id: string;
  name: string;
  city: string;
  plotDimensions: string;
  buaSqFt: number;
  totalCost: number;
  ratePerSqFt: number;
  createdAt: string;
  wizardState: any;
}

interface SavedEstimationsState {
  savedEstimations: SavedEstimation[];
  activeId: string | null;
  saveCurrentEstimation: (name: string, totalCost: number, buaSqFt: number, ratePerSqFt: number) => void;
  loadEstimation: (id: string) => void;
  deleteEstimation: (id: string) => void;
  duplicateEstimation: (id: string) => void;
}

export const useSavedEstimationsStore = create<SavedEstimationsState>()(
  persist(
    (set, get) => ({
      savedEstimations: [],
      activeId: null,

      saveCurrentEstimation: (name, totalCost, buaSqFt, ratePerSqFt) => {
        const wizardState = useWizardStore.getState();
        const city = wizardState.city || 'Bengaluru';
        const plotDimensions = `${wizardState.plotLength || 30}' × ${wizardState.plotWidth || 40}'`;
        
        const newEstimation: SavedEstimation = {
          id: 'est_' + Math.random().toString(36).substring(2, 9),
          name: name.trim() || `Estimate ${get().savedEstimations.length + 1}`,
          city,
          plotDimensions,
          buaSqFt,
          totalCost,
          ratePerSqFt,
          createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          wizardState: {
            city: wizardState.city,
            authority: wizardState.authority,
            plotLength: wizardState.plotLength,
            plotWidth: wizardState.plotWidth,
            floors: wizardState.floors,
            houseType: wizardState.houseType,
            parkingType: wizardState.parkingType,
            rooms: wizardState.rooms,
            liftRequired: wizardState.liftRequired,
            qualityTier: wizardState.qualityTier,
            materialBrands: wizardState.materialBrands,
            flooringZones: wizardState.flooringZones,
            wallCladding: wizardState.wallCladding,
            doors: wizardState.doors,
            windows: wizardState.windows,
            electrical: wizardState.electrical,
            bathroomFittings: wizardState.bathroomFittings,
            painting: wizardState.painting,
          },
        };

        set((state) => ({
          savedEstimations: [newEstimation, ...state.savedEstimations],
          activeId: newEstimation.id,
        }));
      },

      loadEstimation: (id) => {
        const target = get().savedEstimations.find((e) => e.id === id);
        if (!target) return;

        const wizard = useWizardStore.getState();
        if (target.wizardState) {
          useWizardStore.setState({
            ...wizard,
            ...target.wizardState,
            currentStep: 1,
            hasStartedSelection: true,
          });
        }
        set({ activeId: id });
      },

      deleteEstimation: (id) => {
        set((state) => ({
          savedEstimations: state.savedEstimations.filter((e) => e.id !== id),
          activeId: state.activeId === id ? null : state.activeId,
        }));
      },

      duplicateEstimation: (id) => {
        const target = get().savedEstimations.find((e) => e.id === id);
        if (!target) return;

        const copy: SavedEstimation = {
          ...target,
          id: 'est_' + Math.random().toString(36).substring(2, 9),
          name: `${target.name} (Copy)`,
          createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        };

        set((state) => ({
          savedEstimations: [copy, ...state.savedEstimations],
        }));
      },
    }),
    {
      name: 'cost_calculator_saved_estimations_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
