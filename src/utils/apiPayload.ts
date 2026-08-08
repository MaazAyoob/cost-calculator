import { ConfiguratorState } from '../store/useWizardStore';

export interface EstimateApiPayload {
  sessionId: string;
  timestamp: string;
  basicInfo: {
    city: string;
    authority: string;
    plotLength: number;
    plotWidth: number;
    totalPlotAreaSqFt: number;
    floors: number;
    houseType: string;
    parkingType: string;
    carCount: number;
    bikeCount: number;
    evCharging: boolean;
  };
  spaceRequirements: {
    bedrooms: number;
    bathrooms: number;
    commonToilets: number;
    kitchen: number;
    dining: number;
    living: number;
    balcony: number;
    liftRequired: boolean;
  };
  materials: {
    steelBrand: string;
    cementBrand: string;
  };
  flooring: {
    living: string;
    kitchenDining: string;
    bedrooms: string;
    bathrooms: string;
    parkingUtility: string;
    balconies: string;
  };
  wallCladding: {
    kitchenDadoHeight: string;
    bathroomTileHeight: string;
  };
  doors: {
    mainDoor: string;
    internalDoor: string;
    bathroomDoor: string;
  };
  windows: {
    primaryMaterial: string;
    subGrade: string;
  };
  electrical: {
    conduit: string;
    wireTier: string;
  };
  bathroomFittings: {
    sanitaryTier: string;
    cpvcBrand: string;
  };
  painting: {
    baseLayer: string;
    internalPaint: string;
    externalPaint: string;
    brand: string;
  };
}

export function buildEstimateApiPayload(state: ConfiguratorState): EstimateApiPayload {
  return {
    sessionId: `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    basicInfo: {
      city: state.city || 'Bangalore',
      authority: state.authority || 'BBMP/BDA',
      plotLength: state.plotLength || 0,
      plotWidth: state.plotWidth || 0,
      totalPlotAreaSqFt: (state.plotLength || 0) * (state.plotWidth || 0),
      floors: state.floors || 0,
      houseType: state.houseType || 'Duplex',
      parkingType: state.parkingType || 'Normal Ground',
      carCount: state.carCount || 0,
      bikeCount: state.bikeCount || 0,
      evCharging: state.evCharging || false,
    },
    spaceRequirements: {
      bedrooms: state.rooms.bedrooms,
      bathrooms: state.rooms.bathrooms,
      commonToilets: state.rooms.commonToilets || 1,
      kitchen: state.rooms.kitchen,
      dining: state.rooms.dining,
      living: state.rooms.living,
      balcony: state.rooms.balcony,
      liftRequired: state.liftRequired,
    },
    materials: {
      steelBrand: state.materialBrands.steel,
      cementBrand: state.materialBrands.cement,
    },
    flooring: {
      living: state.flooringZones.living,
      kitchenDining: state.flooringZones.kitchenDining,
      bedrooms: state.flooringZones.bedrooms,
      bathrooms: state.flooringZones.bathrooms,
      parkingUtility: state.flooringZones.parkingUtility,
      balconies: state.flooringZones.balconies,
    },
    wallCladding: {
      kitchenDadoHeight: state.wallCladding.kitchenDadoHeight,
      bathroomTileHeight: state.wallCladding.bathroomTileHeight,
    },
    doors: {
      mainDoor: state.doors.mainDoor,
      internalDoor: state.doors.internalDoor,
      bathroomDoor: state.doors.bathroomDoor,
    },
    windows: {
      primaryMaterial: state.windows.primaryMaterial,
      subGrade: state.windows.subGrade,
    },
    electrical: {
      conduit: state.electrical.conduit,
      wireTier: state.electrical.wireTier,
    },
    bathroomFittings: {
      sanitaryTier: state.bathroomFittings.sanitaryTier,
      cpvcBrand: state.bathroomFittings.cpvcBrand,
    },
    painting: {
      baseLayer: state.painting.baseLayer,
      internalPaint: state.painting.internalPaint,
      externalPaint: state.painting.externalPaint,
      brand: state.painting.brand,
    },
  };
}
