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
import {
  ConstructionPackageId,
  getPackageConfig,
  normalizePackageId,
} from '../calculation-engine/data/packageConfig';

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
  // Session & Steps (00 = Package Selection Splash, 01-10 = Steps, 11 = Loading/Complete)
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  hasStartedSelection: boolean;

  // Selected Construction Package
  selectedPackage: ConstructionPackageId;

  // Screen 01: Basic Project Info (Starts null/0)
  city: CityLocation | null;
  authority: AuthorityOption | null;
  plotLength: number;
  plotWidth: number;
  roadWidthFt: number; // Front abutting road width (ft)
  builtUpAreaPerFloor: number; // Desired built-up area per floor (sq.ft)
  userSelectedBUA: number | null; // Total user-selected BUA across floors (sq.ft)
  frontSetback: number | null;
  rearSetback: number | null;
  leftSetback: number | null;
  rightSetback: number | null;
  floors: number;
  houseType: HouseType | null;
  parkingType: ParkingTypeOption | null;
  carCount: number;
  bikeCount: number;
  evCharging: boolean;

  // Screen 02: Space Requirements (Starts 0/null)
  rooms: RoomCounts;
  liftRequired: boolean;

  // Quality / Specification Tier
  specificationTier: 'standard' | 'premium' | 'luxury';
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

  setSelectedPackage: (packageId: ConstructionPackageId | string, applyDefaults?: boolean) => void;
  setSpecificationTier: (tier: 'standard' | 'premium' | 'luxury') => void;
  setCity: (city: CityLocation) => void;
  setPlotDimensions: (length: number, width: number) => void;
  setRoadWidth: (roadWidthFt: number) => void;
  setBuiltUpAreaPerFloor: (bua: number) => void;
  setUserSelectedBUA: (bua: number | null) => void;
  setCustomSetbacks: (front?: number | null, rear?: number | null, left?: number | null, right?: number | null) => void;
  setHouseConfig: (type: HouseType, floors: number) => void;
  setParkingConfig: (parkingType: ParkingTypeOption, carCount: number, bikeCount: number, evCharging: boolean) => void;
  updateRoomCount: (room: keyof RoomCounts, delta: number) => void;
  setRoomCount: (room: keyof RoomCounts, count: number) => void;
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
  const defaultPackage: ConstructionPackageId = 'PREMIUM';
  const pkg = getPackageConfig(defaultPackage);

  return {
    sessionId: 'sess_' + Math.random().toString(36).substring(2, 9),
    currentStep: 0,
    totalSteps: 11,
    hasStartedSelection: false,

    // Construction Package
    selectedPackage: defaultPackage,

    // Basic Info: completely unselected
    city: null as any,
    authority: null as any,
    plotLength: 0,
    plotWidth: 0,
    roadWidthFt: 30,
    builtUpAreaPerFloor: 0,
    userSelectedBUA: null as number | null,
    frontSetback: null as number | null,
    rearSetback: null as number | null,
    leftSetback: null as number | null,
    rightSetback: null as number | null,
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

    // Material Selections & Specification Tier (initialized from default package)
    specificationTier: pkg.specificationTier,
    qualityTier: pkg.qualityTier,
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
    flooringZones: { ...pkg.specs.flooring },
    wallCladding: { ...pkg.specs.wallCladding },
    doors: { ...pkg.specs.doors },
    windows: { ...pkg.specs.windows },
    electrical: { ...pkg.specs.electrical },
    bathroomFittings: { ...pkg.specs.bathroomFittings },
    painting: { ...pkg.specs.painting },

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

      setSelectedPackage: (packageId, applyDefaults = true) => {
        const normalized = normalizePackageId(packageId);
        const pkg = getPackageConfig(normalized);
        const qualityTierMap: Record<'standard' | 'premium' | 'luxury', QualityTier> = {
          standard: 'Essential',
          premium: 'Premium',
          luxury: 'Luxury',
        };

        const updates: any = {
          selectedPackage: normalized,
          specificationTier: pkg.specificationTier,
          qualityTier: qualityTierMap[pkg.specificationTier],
          hasStartedSelection: true,
        };

        if (applyDefaults) {
          updates.materialBrands = {
            ...get().materialBrands,
            steel: pkg.specs.steel,
            cement: pkg.specs.cement,
            masonry: pkg.specs.masonry,
          };
          updates.flooringZones = { ...pkg.specs.flooring };
          updates.wallCladding = { ...pkg.specs.wallCladding };
          updates.doors = { ...pkg.specs.doors };
          updates.windows = { ...pkg.specs.windows };
          updates.electrical = { ...pkg.specs.electrical };
          updates.bathroomFittings = { ...pkg.specs.bathroomFittings };
          updates.painting = { ...pkg.specs.painting };
        }

        set(updates);
      },

      setSpecificationTier: (specificationTier) => {
        const qualityTierMap: Record<'standard' | 'premium' | 'luxury', QualityTier> = {
          standard: 'Essential',
          premium: 'Premium',
          luxury: 'Luxury',
        };
        const packageMap: Record<'standard' | 'premium' | 'luxury', ConstructionPackageId> = {
          standard: 'STANDARD',
          premium: 'PREMIUM',
          luxury: 'LUXURY',
        };
        set({
          specificationTier,
          qualityTier: qualityTierMap[specificationTier],
          selectedPackage: packageMap[specificationTier],
          hasStartedSelection: true,
        });
      },

      // Rule 1: Bangalore -> BBMP/BDA, Mysore -> MUDA
      setCity: (city) => {
        const authority: AuthorityOption = city === 'Bangalore' ? 'BBMP/BDA' : 'MUDA';
        set({ city, authority, hasStartedSelection: true });
      },

      setPlotDimensions: (length, width) => {
        const plotLength = Math.max(0, Number.isFinite(Number(length)) ? Math.round(Number(length) * 10) / 10 : 0);
        const plotWidth = Math.max(0, Number.isFinite(Number(width)) ? Math.round(Number(width) * 10) / 10 : 0);
        set({ plotLength, plotWidth, hasStartedSelection: true });
      },

      setRoadWidth: (roadWidthFt) => {
        set({ roadWidthFt: Math.max(10, Math.min(200, roadWidthFt)), hasStartedSelection: true });
      },

      setBuiltUpAreaPerFloor: (builtUpAreaPerFloor) => {
        set({ builtUpAreaPerFloor: Math.max(0, builtUpAreaPerFloor), hasStartedSelection: true });
      },

      setUserSelectedBUA: (userSelectedBUA) => {
        set({ userSelectedBUA: userSelectedBUA !== null ? Math.max(0, userSelectedBUA) : null, hasStartedSelection: true });
      },

      setCustomSetbacks: (front, rear, left, right) => {
        set({
          frontSetback: front !== undefined ? front : get().frontSetback,
          rearSetback: rear !== undefined ? rear : get().rearSetback,
          leftSetback: left !== undefined ? left : get().leftSetback,
          rightSetback: right !== undefined ? right : get().rightSetback,
          hasStartedSelection: true,
        });
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
        set((state) => {
          const maxCount = (room === 'bedrooms' || room === 'bathrooms') ? 10 : 10;
          const currentVal = state.rooms[room] || 0;
          const newVal = Math.max(0, Math.min(maxCount, currentVal + delta));
          return {
            hasStartedSelection: true,
            rooms: {
              ...state.rooms,
              [room]: newVal,
            },
          };
        });
      },

      setRoomCount: (room, count) => {
        set((state) => {
          const maxCount = (room === 'bedrooms' || room === 'bathrooms') ? 10 : 10;
          const newVal = Math.max(0, Math.min(maxCount, count));
          return {
            hasStartedSelection: true,
            rooms: {
              ...state.rooms,
              [room]: newVal,
            },
          };
        });
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
        const packageMap: Record<QualityTier, ConstructionPackageId> = {
          Essential: 'STANDARD',
          Premium: 'PREMIUM',
          Luxury: 'LUXURY',
        };
        set({ qualityTier, selectedPackage: packageMap[qualityTier] || 'PREMIUM', hasStartedSelection: true });
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
        if (!persistedState.selectedPackage) {
          persistedState.selectedPackage = persistedState.specificationTier
            ? (persistedState.specificationTier.toUpperCase() as ConstructionPackageId)
            : 'PREMIUM';
        }
        return persistedState;
      },
    }
  )
);
