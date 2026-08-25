import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ZoneFlooringSelection,
  WallCladdingSelection,
  DoorSelection,
  WindowSelection,
  ElectricalSelection,
  BathroomFittingSelection,
  PaintingSelection,
} from '../calculation-engine/types';

export type QualityTier = 'Essential' | 'Premium' | 'Luxury';
export type CityLocation = 'Bangalore' | 'Mysore';
export type AuthorityOption = 'BBMP/BDA' | 'MUDA';
export type HouseType = 'Duplex' | 'Triplex' | 'Rental Units' | 'Mixed Use';
export type ParkingTypeOption = 'Stilt' | 'Normal Ground' | 'EV Charging Ready';

export interface RoomCounts {
  bedrooms: number;
  bathrooms: number;
  kitchen: number;
  dining: number;
  living: number;
  balcony: number;
  commonToilets: number;
  office: number;
  pooja: number;
  utility: number;
  storeRoom: number;
}

export interface MaterialBrandSelection {
  steel: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT';
  cement: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat';
  masonry?: 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks' | string;
  doors: string;
  windows: string;
  flooring: string;
  bathroom: string;
  electrical: string;
  paint: string;
}

export interface ConfiguratorState {
  // Session & Steps (00 = Splash, 01-11 = Steps)
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  hasStartedSelection: boolean;

  // Screen 01: Basic Project Info (Starts null/0)
  city: CityLocation | null;
  authority: AuthorityOption | null;
  plotLength: number;
  plotWidth: number;
  builtUpAreaPerFloor: number; // Desired built-up area per floor (sq.ft)
  floors: number;
  houseType: HouseType | null;
  parkingType: ParkingTypeOption | null;
  carCount: number;
  bikeCount: number;
  evCharging: boolean;

  // Screen 02: Space Requirements (Starts 0/null)
  rooms: RoomCounts;
  liftRequired: boolean;

  // Screen 03 to 10: Material & Finishing Selections (Starts null)
  qualityTier: QualityTier;
  materialBrands: MaterialBrandSelection;
  flooringZones: ZoneFlooringSelection;
  wallCladding: WallCladdingSelection;
  doors: DoorSelection;
  windows: WindowSelection;
  electrical: ElectricalSelection;
  bathroomFittings: BathroomFittingSelection;
  painting: PaintingSelection;

  // Computed Live Preview Metrics (Synced from engine)
  calculatedAreaSqFt: number;
  calculatedBuildableAreaSqFt: number;
  calculatedCostINR: number;
  calculatedSteelTonnes: number;
  calculatedCementBags: number;

  // Actions & Mutators
  startNewProject: () => void;
  startSelection: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setCity: (city: CityLocation) => void;
  setPlotDimensions: (length: number, width: number) => void;
  setBuiltUpAreaPerFloor: (bua: number) => void;
  setHouseConfig: (type: HouseType, floors: number) => void;
  setParkingConfig: (parkingType: ParkingTypeOption, carCount: number, bikeCount: number, evCharging: boolean) => void;
  updateRoomCount: (room: keyof RoomCounts, delta: number) => void;
  setLiftRequired: (required: boolean) => void;
  setCoreMaterials: (
    steel: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT',
    cement: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat',
    masonry?: 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks' | string
  ) => void;
  setMasonryMaterial: (masonry: 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks' | string) => void;
  setFlooringZone: (zone: keyof ZoneFlooringSelection, choice: any) => void;
  setWallCladding: (kitchenDadoHeight: '2 ft' | '4 ft', bathroomTileHeight: '7 ft (Lintel)' | 'Full Height (Ceiling)') => void;
  setDoorSelection: (category: keyof DoorSelection, choice: any) => void;
  setWindowSelection: (primaryMaterial: 'uPVC' | 'Wood' | 'Aluminium', subGrade?: string) => void;
  setElectricalSelection: (wireTier: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)') => void;
  setBathroomFittingSelection: (sanitaryTier: any, cpvcBrand: any) => void;
  setPaintingSelection: (internalPaint: any, externalPaint: any, brand: any) => void;
  setQualityTier: (tier: QualityTier) => void;

  resetConfigurator: () => void;
}

export function getFreshZeroState() {
  return {
    sessionId: 'sess_' + Math.random().toString(36).substring(2, 9),
    currentStep: 1,
    totalSteps: 11,
    hasStartedSelection: false,

    // Basic Info: completely unselected
    city: null as any,
    authority: null as any,
    plotLength: 0,
    plotWidth: 0,
    builtUpAreaPerFloor: 0,
    floors: 0,
    houseType: null as any,
    parkingType: null as any,
    carCount: 0,
    bikeCount: 0,
    evCharging: false,

    // Space Requirements: zeroed
    rooms: {
      bedrooms: 0,
      bathrooms: 0,
      kitchen: 0,
      dining: 0,
      living: 0,
      balcony: 0,
      commonToilets: 0,
      office: 0,
      pooja: 0,
      utility: 0,
      storeRoom: 0,
    },
    liftRequired: false,

    // Material Selections: completely unselected (null)
    qualityTier: 'Premium' as QualityTier,
    materialBrands: {
      steel: null as any,
      cement: null as any,
      masonry: null as any,
      doors: null as any,
      windows: null as any,
      flooring: null as any,
      bathroom: null as any,
      electrical: null as any,
      paint: null as any,
    },
    flooringZones: {
      living: null as any,
      kitchenDining: null as any,
      bedrooms: null as any,
      bathrooms: null as any,
      parkingUtility: null as any,
      balconies: null as any,
    },
    wallCladding: {
      kitchenDadoHeight: null as any,
      bathroomTileHeight: null as any,
    },
    doors: {
      mainDoor: null as any,
      internalDoor: null as any,
      bathroomDoor: null as any,
    },
    windows: {
      primaryMaterial: null as any,
      subGrade: null as any,
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC' as const,
      wireTier: null as any,
    },
    bathroomFittings: {
      sanitaryTier: null as any,
      cpvcBrand: null as any,
    },
    painting: {
      baseLayer: 'Putty + Primer' as const,
      internalPaint: null as any,
      externalPaint: null as any,
      brand: null as any,
    },

    // Computed metrics: 0
    calculatedAreaSqFt: 0,
    calculatedBuildableAreaSqFt: 0,
    calculatedCostINR: 0,
    calculatedSteelTonnes: 0,
    calculatedCementBags: 0,
  };
}

export const useWizardStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      ...getFreshZeroState(),

      startNewProject: () => {
        try {
          localStorage.removeItem('cost_calculator_wizard_state_v4');
          localStorage.removeItem('buildplan_wizard_state');
        } catch {}
        set(getFreshZeroState());
      },

      startSelection: () => {
        set({ hasStartedSelection: true });
      },

      setStep: (step) => {
        set({ currentStep: Math.min(Math.max(0, step), 11) });
        if (step > 0) set({ hasStartedSelection: true });
      },
      nextStep: () => {
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 11), hasStartedSelection: true }));
      },
      prevStep: () => {
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) }));
      },

      // Rule 1: Bangalore -> BBMP/BDA, Mysore -> MUDA
      setCity: (city) => {
        const authority: AuthorityOption = city === 'Bangalore' ? 'BBMP/BDA' : 'MUDA';
        set({ city, authority, hasStartedSelection: true });
      },

      setPlotDimensions: (length, width) => {
        const plotLength = Math.max(0, Math.min(200, length));
        const plotWidth = Math.max(0, Math.min(200, width));
        set({ plotLength, plotWidth, hasStartedSelection: true });
      },

      setBuiltUpAreaPerFloor: (builtUpAreaPerFloor) => {
        set({ builtUpAreaPerFloor: Math.max(0, builtUpAreaPerFloor), hasStartedSelection: true });
      },

      // Rule 2 & Rule 4 enforcement:
      // Parking Stilt -> min floors = 2 (G+1)
      // Floors >= 4 (G+3) -> Lift defaults to Yes
      setHouseConfig: (houseType, floorsInput) => {
        const { parkingType } = get();
        let floors = floorsInput;
        if (parkingType === 'Stilt' && floors < 2) {
          floors = 2; // Min G+1 for stilt
        }
        const liftRequired = floors >= 4 ? true : get().liftRequired;
        set({ houseType, floors, liftRequired, hasStartedSelection: true });
      },

      setParkingConfig: (parkingType, carCount, bikeCount, evCharging) => {
        let floors = get().floors;
        if (parkingType === 'Stilt' && (floors || 0) < 2) {
          floors = 2; // Min G+1
        }
        set({ parkingType, carCount, bikeCount, evCharging, floors, hasStartedSelection: true });
      },

      updateRoomCount: (room, delta) => {
        set((state) => ({
          hasStartedSelection: true,
          rooms: {
            ...state.rooms,
            [room]: Math.max(0, state.rooms[room] + delta),
          },
        }));
      },

      setLiftRequired: (liftRequired) => {
        set({ liftRequired, hasStartedSelection: true });
      },

      setCoreMaterials: (steel, cement, masonry) => {
        set((state) => ({
          hasStartedSelection: true,
          materialBrands: {
            ...state.materialBrands,
            steel,
            cement,
            ...(masonry ? { masonry } : {}),
          },
        }));
      },

      setMasonryMaterial: (masonry) => {
        set((state) => ({
          hasStartedSelection: true,
          materialBrands: {
            ...state.materialBrands,
            masonry,
          },
        }));
      },

      setFlooringZone: (zone, choice) => {
        set((state) => ({
          hasStartedSelection: true,
          flooringZones: {
            ...state.flooringZones,
            [zone]: choice,
          },
        }));
      },

      setWallCladding: (kitchenDadoHeight, bathroomTileHeight) => {
        set({
          hasStartedSelection: true,
          wallCladding: { kitchenDadoHeight, bathroomTileHeight },
        });
      },

      setDoorSelection: (category, choice) => {
        set((state) => ({
          hasStartedSelection: true,
          doors: {
            ...state.doors,
            [category]: choice,
          },
        }));
      },

      // Rule 3: Dynamic Window Sub-grades
      setWindowSelection: (primaryMaterial, subGradeInput) => {
        let subGrade = subGradeInput;
        if (!subGrade) {
          if (primaryMaterial === 'uPVC') subGrade = 'Standard uPVC';
          else if (primaryMaterial === 'Wood') subGrade = 'Teak Wood Frame';
          else subGrade = 'Anodized Aluminium';
        }
        set({
          hasStartedSelection: true,
          windows: { primaryMaterial, subGrade },
        });
      },

      setElectricalSelection: (wireTier) => {
        set({
          hasStartedSelection: true,
          electrical: { conduit: 'Heavy-Duty ISI Marked PVC' as const, wireTier },
        });
      },

      setBathroomFittingSelection: (sanitaryTier, cpvcBrand) => {
        set({
          hasStartedSelection: true,
          bathroomFittings: { sanitaryTier, cpvcBrand },
        });
      },

      setPaintingSelection: (internalPaint, externalPaint, brand) => {
        set({
          hasStartedSelection: true,
          painting: { baseLayer: 'Putty + Primer' as const, internalPaint, externalPaint, brand },
        });
      },

      setQualityTier: (qualityTier) => {
        set({ qualityTier, hasStartedSelection: true });
      },

      resetConfigurator: () => {
        try {
          localStorage.removeItem('cost_calculator_wizard_state_v4');
          localStorage.removeItem('buildplan_wizard_state');
        } catch {}
        set(getFreshZeroState());
      },
    }),
    {
      name: 'cost_calculator_wizard_state_v4',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version < 4 || !persistedState || !persistedState.hasStartedSelection) {
          return getFreshZeroState();
        }
        return persistedState;
      },
    }
  )
);
