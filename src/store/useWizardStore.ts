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
  FabricationSelection,
} from '../calculation-engine/types';
import {
  ConstructionPackageId,
  getPackageConfig,
  normalizePackageId,
} from '../calculation-engine/data/packageConfig';
import { useProjectStore } from './useProjectStore';
import { useReportStore } from './useReportStore';

export type QualityTier = 'Essential' | 'Premium' | 'Luxury';
export type CityLocation = 'Bangalore' | 'Mysore';
export type ConfiguratorCity = 'Bangalore' | 'Mysore' | 'Other';
export type AuthorityOption = 'BBMP/BDA' | 'MUDA' | 'Not sure' | 'Other / None';
export type HouseType = 'Duplex' | 'Triplex' | 'Rental Units' | 'Mixed Use' | 'Farmhouse';
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
  terrace?: number;
}

export const SAMPLE_ROOM_CONFIG: RoomCounts = {
  bedrooms: 3,
  bathrooms: 3,
  living: 1,
  kitchen: 1,
  dining: 1,
  balcony: 1,
  pooja: 1,
  utility: 1,
  commonToilets: 0,
  office: 0,
  storeRoom: 0,
  terrace: 1,
};

export interface MaterialBrandSelection {
  steel: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT' | string;
  cement: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat' | string;
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
  city: ConfiguratorCity | null;
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
  roadFacingBoundaries: Array<'front' | 'rear' | 'left' | 'right'>;
  isCornerPlot: boolean;
  roadWideningFt: number;
  prescribedBuildingLineFt: number;
  floors: number;
  houseType: HouseType | null;
  parkingType: ParkingTypeOption | null;
  carCount: number;
  bikeCount: number;
  evCharging: boolean;
  startTimeline?: string;

  // Estimation Mode & Customization Invariants
  estimateMode: 'quick' | 'custom';
  isCustomRooms: boolean;

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
  fabrication: FabricationSelection;

  // Space-by-space flooring overrides & bathroom dado selections
  spaceFlooringOverrides: Record<string, string>;
  spaceDadoOverrides: Record<string, { height?: '7 ft (Lintel)' | 'Full Height (Ceiling)'; tile?: string }>;
  spaceDoorOverrides: Record<string, string>;
  spaceWindowOverrides: Record<string, string>;
  spaceElectricalTierOverrides: Record<string, 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)'>;
  spaceSanitaryOverrides: Record<string, string>;
  spacePaintOverrides: Record<string, string>;

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
  setCity: (city: ConfiguratorCity) => void;
  setAuthority: (authority: AuthorityOption | 'Not sure') => void;
  setStartTimeline: (startTimeline: string) => void;
  setPlotDimensions: (length: number, width: number) => void;
  setRoadWidth: (roadWidthFt: number) => void;
  setBuiltUpAreaPerFloor: (bua: number) => void;
  setUserSelectedBUA: (bua: number | null) => void;
  setCustomSetbacks: (front?: number | null, rear?: number | null, left?: number | null, right?: number | null) => void;
  setRoadFacingBoundaries: (boundaries: Array<'front' | 'rear' | 'left' | 'right'>) => void;
  setIsCornerPlot: (isCorner: boolean) => void;
  setRoadWideningFt: (wideningFt: number) => void;
  setPrescribedBuildingLineFt: (buildingLineFt: number) => void;
  setHouseConfig: (type: HouseType, floors: number) => void;
  setParkingConfig: (parkingType: ParkingTypeOption, carCount: number, bikeCount: number, evCharging: boolean) => void;
  setEstimateMode: (mode: 'quick' | 'custom') => void;
  applySampleRoomConfig: () => void;
  updateRoomCount: (room: keyof RoomCounts, delta: number) => void;
  setRoomCount: (room: keyof RoomCounts, count: number) => void;
  setLiftRequired: (required: boolean) => void;
  setCoreMaterials: (
    steel: 'Tata Tiscon' | 'JSW Neosteel' | 'Indus TMT' | string,
    cement: 'UltraTech' | 'ACC Cement' | 'Dalmia Bharat' | string,
    masonry?: 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks' | string
  ) => void;
  setMasonryMaterial: (masonry: 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks' | string) => void;
  setFlooringZone: (zone: keyof ZoneFlooringSelection, choice: any) => void;
  setWallCladding: (kitchenDadoHeight: '2 ft' | '4 ft', bathroomTileHeight: '7 ft (Lintel)' | 'Full Height (Ceiling)') => void;
  setSpaceFlooring: (spaceId: string, material: string, spaceType?: string) => void;
  setSpaceDado: (spaceId: string, height: '7 ft (Lintel)' | 'Full Height (Ceiling)', tile?: string) => void;
  applyFlooringToSimilarSpaces: (spaceType: string, material: string) => void;
  applyDadoToAllBathrooms: (height: '7 ft (Lintel)' | 'Full Height (Ceiling)', tile?: string) => void;
  clearSpaceFlooringOverride: (spaceId: string) => void;
  pruneOrphanedSpaceOverrides: (activeSpaceIds: string[]) => void;
  setSpaceDoor: (spaceId: string, choice: string, category?: 'mainDoor' | 'internalDoor' | 'bathroomDoor') => void;
  clearSpaceDoorOverride: (spaceId: string) => void;
  applyDoorToSimilarSpaces: (category: 'mainDoor' | 'internalDoor' | 'bathroomDoor', choice: string) => void;
  setSpaceWindow: (spaceId: string, choice: string) => void;
  clearSpaceWindowOverride: (spaceId: string) => void;
  applyWindowToAllRooms: (choice: string) => void;
  setSpaceElectricalTier: (spaceId: string, tier: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)') => void;
  clearSpaceElectricalOverride: (spaceId: string) => void;
  applyElectricalToAllRooms: (tier: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)') => void;
  setSpaceSanitary: (spaceId: string, brand: string) => void;
  clearSpaceSanitaryOverride: (spaceId: string) => void;
  applySanitaryToAllBathrooms: (brand: string) => void;
  setSpacePaint: (spaceId: string, paintChoice: string) => void;
  clearSpacePaintOverride: (spaceId: string) => void;
  applyPaintToAllRooms: (paintChoice: string) => void;
  setDoorSelection: (category: keyof DoorSelection, choice: any) => void;
  setWindowSelection: (primaryMaterial: 'uPVC' | 'Wood' | 'Aluminium', subGrade?: string) => void;
  setElectricalSelection: (wireTier: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)') => void;
  setBathroomFittingSelection: (sanitaryTier: any, cpvcBrand: any) => void;
  setPaintingSelection: (internalPaint: any, externalPaint: any, brand: any) => void;
  setFabricationSelection: (selection: Partial<FabricationSelection>) => void;
  setQualityTier: (tier: QualityTier) => void;
  // Commercial / Contractor Execution Mode (Phase 1)
  contractorMode: 'independent' | 'contractor';
  contractorMarginRate: number;
  applyContractorGST: boolean;

  setContractorMode: (mode: 'independent' | 'contractor', marginRate?: number, applyGST?: boolean) => void;
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
    roadFacingBoundaries: ['front'] as Array<'front' | 'rear' | 'left' | 'right'>,
    isCornerPlot: false,
    roadWideningFt: 0,
    prescribedBuildingLineFt: 0,
    floors: 0,
    houseType: null as any,
    parkingType: null as any,
    carCount: 0,
    bikeCount: 0,
    evCharging: false,
    startTimeline: '1-3_months',

    // Estimation Mode & Customization Flag
    estimateMode: 'quick' as const,
    isCustomRooms: false,

    // Space Requirements: initialized with standard sample home configuration
    rooms: {
      ...SAMPLE_ROOM_CONFIG,
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
    fabrication: {
      staircaseRailing: 'SS 304 with Toughened Glass',
      balconyRailing: 'SS 304 with Toughened Glass',
      terraceRailing: 'MS Parapet Safety Extension Railing',
      mainGate: 'MS Designer Sliding / Swing Gate (10x6 ft)',
      tankLadder: 'GI / MS Cat Ladder with Safety Rungs',
      skylight: 'None',
      balconyDoor: 'UPVC / Aluminium 2.5-Track French Sliding Door',
      elevationCladding: 'HPL / Stone Veneer Façade Cladding',
    },
    spaceFlooringOverrides: {},
    spaceDadoOverrides: {},
    spaceDoorOverrides: {},
    spaceWindowOverrides: {},
    spaceElectricalTierOverrides: {},
    spaceSanitaryOverrides: {},
    spacePaintOverrides: {},

    // Commercial / Contractor Execution Mode
    contractorMode: 'independent' as const,
    contractorMarginRate: 0.10,
    applyContractorGST: false,

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
        try {
          useProjectStore.getState().resetProject();
        } catch {}
        try {
          useReportStore.getState().setPreparedFor('Valued Client');
          useReportStore.getState().setClientNotes('Custom residential construction feasibility & BOQ report.');
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

      setAuthority: (authority) => {
        set({ authority: authority as any, hasStartedSelection: true });
      },

      setStartTimeline: (startTimeline) => {
        set({ startTimeline, hasStartedSelection: true });
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

      setRoadFacingBoundaries: (boundaries) => {
        set({ roadFacingBoundaries: boundaries, hasStartedSelection: true });
      },

      setIsCornerPlot: (isCorner) => {
        const currentBoundaries = get().roadFacingBoundaries;
        const nextBoundaries = isCorner && currentBoundaries.length === 1
          ? ['front', 'left'] as Array<'front' | 'rear' | 'left' | 'right'>
          : currentBoundaries;
        set({ isCornerPlot: isCorner, roadFacingBoundaries: nextBoundaries, hasStartedSelection: true });
      },

      setRoadWideningFt: (wideningFt) => {
        set({ roadWideningFt: Math.max(0, wideningFt || 0), hasStartedSelection: true });
      },

      setPrescribedBuildingLineFt: (buildingLineFt) => {
        set({ prescribedBuildingLineFt: Math.max(0, buildingLineFt || 0), hasStartedSelection: true });
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

      setEstimateMode: (mode: 'quick' | 'custom') => {
        if (mode === 'quick') {
          // If returning to quick estimate mode, reset to sample config if not explicitly custom
          if (!get().isCustomRooms) {
            set({ estimateMode: 'quick', rooms: { ...SAMPLE_ROOM_CONFIG } });
          } else {
            set({ estimateMode: 'quick' });
          }
        } else {
          set({ estimateMode: 'custom', isCustomRooms: true });
        }
      },

      applySampleRoomConfig: () => {
        set({
          estimateMode: 'quick',
          isCustomRooms: false,
          rooms: { ...SAMPLE_ROOM_CONFIG },
          hasStartedSelection: true,
        });
      },

      updateRoomCount: (room, delta) => {
        set((state) => {
          const maxCount = 10;
          const currentVal = state.rooms[room] ?? 0;
          const newVal = Math.max(0, Math.min(maxCount, currentVal + delta));
          return {
            hasStartedSelection: true,
            estimateMode: 'custom',
            isCustomRooms: true,
            rooms: {
              ...state.rooms,
              [room]: newVal,
            },
          };
        });
      },

      setRoomCount: (room, count) => {
        set((state) => {
          const maxCount = 10;
          const newVal = Math.max(0, Math.min(maxCount, count));
          return {
            hasStartedSelection: true,
            estimateMode: 'custom',
            isCustomRooms: true,
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

      setSpaceFlooring: (spaceId, material, spaceType) => {
        set((state) => {
          const overrides = { ...state.spaceFlooringOverrides, [spaceId]: material };
          const zones = { ...state.flooringZones };
          const normalized = (spaceType || '').toLowerCase();
          if (normalized.includes('living') || normalized.includes('dining')) zones.living = material as any;
          else if (normalized.includes('kitchen')) zones.kitchenDining = material as any;
          else if (normalized.includes('bed')) zones.bedrooms = material as any;
          else if (normalized.includes('bath') || normalized.includes('toilet')) zones.bathrooms = material as any;
          else if (normalized.includes('balcony')) zones.balconies = material as any;
          else if (normalized.includes('utility') || normalized.includes('parking')) zones.parkingUtility = material as any;

          return {
            hasStartedSelection: true,
            spaceFlooringOverrides: overrides,
            flooringZones: zones,
          };
        });
      },

      setSpaceDado: (spaceId, height, tile) => {
        set((state) => {
          const dadoOverrides = {
            ...state.spaceDadoOverrides,
            [spaceId]: { height, tile: tile || state.spaceDadoOverrides[spaceId]?.tile },
          };
          return {
            hasStartedSelection: true,
            spaceDadoOverrides: dadoOverrides,
            wallCladding: {
              ...state.wallCladding,
              bathroomTileHeight: height,
            },
          };
        });
      },

      applyFlooringToSimilarSpaces: (spaceType, material) => {
        set((state) => {
          const zones = { ...state.flooringZones };
          const normalized = (spaceType || '').toLowerCase();
          if (normalized.includes('living') || normalized.includes('dining')) zones.living = material as any;
          else if (normalized.includes('kitchen')) zones.kitchenDining = material as any;
          else if (normalized.includes('bed')) zones.bedrooms = material as any;
          else if (normalized.includes('bath') || normalized.includes('toilet')) zones.bathrooms = material as any;
          else if (normalized.includes('balcony')) zones.balconies = material as any;
          else if (normalized.includes('utility') || normalized.includes('parking')) zones.parkingUtility = material as any;

          const overrides = { ...state.spaceFlooringOverrides };
          // Apply override to all keys matching this space category
          Object.keys(overrides).forEach((key) => {
            if (key.toLowerCase().includes(normalized)) {
              overrides[key] = material;
            }
          });

          return {
            hasStartedSelection: true,
            flooringZones: zones,
            spaceFlooringOverrides: overrides,
          };
        });
      },

      applyDadoToAllBathrooms: (height, tile) => {
        set((state) => {
          const dadoOverrides = { ...state.spaceDadoOverrides };
          Object.keys(dadoOverrides).forEach((k) => {
            if (k.toLowerCase().includes('bath') || k.toLowerCase().includes('toilet')) {
              dadoOverrides[k] = { height, tile: tile || dadoOverrides[k]?.tile };
            }
          });
          return {
            hasStartedSelection: true,
            spaceDadoOverrides: dadoOverrides,
            wallCladding: {
              ...state.wallCladding,
              bathroomTileHeight: height,
            },
          };
        });
      },

      clearSpaceFlooringOverride: (spaceId) => {
        set((state) => {
          const overrides = { ...state.spaceFlooringOverrides };
          delete overrides[spaceId];
          return {
            spaceFlooringOverrides: overrides,
          };
        });
      },

      pruneOrphanedSpaceOverrides: (activeSpaceIds) => {
        set((state) => {
          const activeSet = new Set(activeSpaceIds);
          let changed = false;

          const pruneMap = <T>(map: Record<string, T> | undefined): Record<string, T> => {
            const next = { ...(map || {}) };
            Object.keys(next).forEach((k) => {
              if (!activeSet.has(k)) {
                delete next[k];
                changed = true;
              }
            });
            return next;
          };

          const nextFlooring = pruneMap(state.spaceFlooringOverrides);
          const nextDado = pruneMap(state.spaceDadoOverrides);
          const nextDoor = pruneMap(state.spaceDoorOverrides);
          const nextWindow = pruneMap(state.spaceWindowOverrides);
          const nextElec = pruneMap(state.spaceElectricalTierOverrides);
          const nextSan = pruneMap(state.spaceSanitaryOverrides);
          const nextPaint = pruneMap(state.spacePaintOverrides);

          if (!changed) return state;
          return {
            spaceFlooringOverrides: nextFlooring,
            spaceDadoOverrides: nextDado,
            spaceDoorOverrides: nextDoor,
            spaceWindowOverrides: nextWindow,
            spaceElectricalTierOverrides: nextElec,
            spaceSanitaryOverrides: nextSan,
            spacePaintOverrides: nextPaint,
          };
        });
      },

      setSpaceDoor: (spaceId, choice, category = 'internalDoor') => {
        set((state) => {
          const overrides = { ...state.spaceDoorOverrides, [spaceId]: choice };
          const doors = { ...state.doors, [category]: choice };
          const materialBrands = {
            ...state.materialBrands,
            ...(category === 'mainDoor' ? { doors: choice } : {}),
          };
          return {
            hasStartedSelection: true,
            spaceDoorOverrides: overrides,
            doors,
            materialBrands,
          };
        });
      },

      clearSpaceDoorOverride: (spaceId) => {
        set((state) => {
          const overrides = { ...state.spaceDoorOverrides };
          delete overrides[spaceId];
          return { spaceDoorOverrides: overrides };
        });
      },

      applyDoorToSimilarSpaces: (category, choice) => {
        set((state) => {
          const overrides = { ...state.spaceDoorOverrides };
          const doors = { ...state.doors, [category]: choice };
          const materialBrands = {
            ...state.materialBrands,
            ...(category === 'mainDoor' ? { doors: choice } : {}),
          };
          return {
            hasStartedSelection: true,
            doors,
            materialBrands,
            spaceDoorOverrides: overrides,
          };
        });
      },

      setSpaceWindow: (spaceId, choice) => {
        set((state) => {
          const overrides = { ...state.spaceWindowOverrides, [spaceId]: choice };
          let prim: 'uPVC' | 'Wood' | 'Aluminium' = 'uPVC';
          if (choice.includes('Wood') || choice.includes('Teak') || choice.includes('Sal')) prim = 'Wood';
          else if (choice.includes('Aluminium')) prim = 'Aluminium';

          return {
            hasStartedSelection: true,
            spaceWindowOverrides: overrides,
            windows: { primaryMaterial: prim, subGrade: choice },
            materialBrands: { ...state.materialBrands, windows: choice },
          };
        });
      },

      clearSpaceWindowOverride: (spaceId) => {
        set((state) => {
          const overrides = { ...state.spaceWindowOverrides };
          delete overrides[spaceId];
          return { spaceWindowOverrides: overrides };
        });
      },

      applyWindowToAllRooms: (choice) => {
        set((state) => {
          let prim: 'uPVC' | 'Wood' | 'Aluminium' = 'uPVC';
          if (choice.includes('Wood') || choice.includes('Teak') || choice.includes('Sal')) prim = 'Wood';
          else if (choice.includes('Aluminium')) prim = 'Aluminium';

          return {
            hasStartedSelection: true,
            windows: { primaryMaterial: prim, subGrade: choice },
            materialBrands: { ...state.materialBrands, windows: choice },
          };
        });
      },

      setSpaceElectricalTier: (spaceId, tier) => {
        set((state) => {
          const overrides = { ...state.spaceElectricalTierOverrides, [spaceId]: tier };
          return {
            hasStartedSelection: true,
            spaceElectricalTierOverrides: overrides,
            electrical: { conduit: 'Heavy-Duty ISI Marked PVC' as const, wireTier: tier },
            materialBrands: { ...state.materialBrands, electrical: tier },
          };
        });
      },

      clearSpaceElectricalOverride: (spaceId) => {
        set((state) => {
          const overrides = { ...state.spaceElectricalTierOverrides };
          delete overrides[spaceId];
          return { spaceElectricalTierOverrides: overrides };
        });
      },

      applyElectricalToAllRooms: (tier) => {
        set((state) => ({
          hasStartedSelection: true,
          electrical: { conduit: 'Heavy-Duty ISI Marked PVC' as const, wireTier: tier },
          materialBrands: { ...state.materialBrands, electrical: tier },
        }));
      },

      setSpaceSanitary: (spaceId, brand) => {
        set((state) => {
          const overrides = { ...state.spaceSanitaryOverrides, [spaceId]: brand };
          return {
            hasStartedSelection: true,
            spaceSanitaryOverrides: overrides,
            bathroomFittings: {
              ...state.bathroomFittings,
              sanitaryTier: brand,
            },
            materialBrands: { ...state.materialBrands, bathroom: brand },
          };
        });
      },

      clearSpaceSanitaryOverride: (spaceId) => {
        set((state) => {
          const overrides = { ...state.spaceSanitaryOverrides };
          delete overrides[spaceId];
          return { spaceSanitaryOverrides: overrides };
        });
      },

      applySanitaryToAllBathrooms: (brand) => {
        set((state) => ({
          hasStartedSelection: true,
          bathroomFittings: {
            ...state.bathroomFittings,
            sanitaryTier: brand,
          },
          materialBrands: { ...state.materialBrands, bathroom: brand },
        }));
      },

      setSpacePaint: (spaceId, paintChoice) => {
        set((state) => {
          const overrides = { ...state.spacePaintOverrides, [spaceId]: paintChoice };
          return {
            hasStartedSelection: true,
            spacePaintOverrides: overrides,
            painting: {
              ...state.painting,
              internalPaint: paintChoice,
            },
            materialBrands: { ...state.materialBrands, paint: paintChoice },
          };
        });
      },

      clearSpacePaintOverride: (spaceId) => {
        set((state) => {
          const overrides = { ...state.spacePaintOverrides };
          delete overrides[spaceId];
          return { spacePaintOverrides: overrides };
        });
      },

      applyPaintToAllRooms: (paintChoice) => {
        set((state) => ({
          hasStartedSelection: true,
          painting: {
            ...state.painting,
            internalPaint: paintChoice,
          },
          materialBrands: { ...state.materialBrands, paint: paintChoice },
        }));
      },

      setDoorSelection: (category, choice) => {
        set((state) => ({
          hasStartedSelection: true,
          doors: {
            ...state.doors,
            [category]: choice,
          },
          materialBrands: {
            ...state.materialBrands,
            ...(category === 'mainDoor' ? { doors: choice } : {}),
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
        set((state) => ({
          hasStartedSelection: true,
          windows: { primaryMaterial, subGrade },
          materialBrands: {
            ...state.materialBrands,
            windows: subGrade || primaryMaterial,
          },
        }));
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

      setFabricationSelection: (selection) => {
        set((state) => ({
          hasStartedSelection: true,
          fabrication: {
            ...state.fabrication,
            ...selection,
          },
        }));
      },

      setQualityTier: (qualityTier: QualityTier) => {
        const packageMap: Record<QualityTier, ConstructionPackageId> = {
          Essential: 'STANDARD',
          Premium: 'PREMIUM',
          Luxury: 'LUXURY',
        };
        set({ qualityTier, selectedPackage: packageMap[qualityTier] || 'PREMIUM', hasStartedSelection: true });
      },

      setContractorMode: (mode, marginRate, applyGST) => {
        set((state) => ({
          contractorMode: mode,
          contractorMarginRate: typeof marginRate === 'number' ? marginRate : state.contractorMarginRate,
          applyContractorGST: typeof applyGST === 'boolean' ? applyGST : state.applyContractorGST,
        }));
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
