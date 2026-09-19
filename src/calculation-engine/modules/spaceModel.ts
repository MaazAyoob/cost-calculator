// ============================================================
// CANONICAL BUILDING & SPACE MODEL GENERATOR
// Single common engine driving walls, openings, masonry, plaster,
// paint, flooring, cladding, waterproofing, electrical, and plumbing.
// (Per Hutty Pilot Specification Section 3, 4, 12, 13, 14, 15, 16, 17, 18, 20)
// ============================================================

import { EngineInput, AreaResult, SpaceModelItem, BuildingFloorModel, BuildingModel } from '../types';
import { ROOM_SIZE_ASSUMPTIONS } from '../data/engineeringAssumptions';
import {
  WALL_HEIGHT_FT,
  EXTERNAL_WALL_THICKNESS_M,
  INTERNAL_WALL_THICKNESS_M,
  AAC_BLOCK_UNIT_VOLUME_CUM,
  MASONRY_WASTAGE_PERCENTAGE,
  BATHROOM_DADO_HEIGHT_STANDARD_FT,
  BATHROOM_DADO_HEIGHT_FULL_FT,
  KITCHEN_DADO_HEIGHT_STANDARD_FT,
  KITCHEN_DADO_HEIGHT_EXTENDED_FT,
  KITCHEN_COUNTER_LENGTH_FT,
  BATHROOM_WATERPROOFING_UPTURN_FT,
} from '../data/coefficients';
import { getMasonrySpecification } from '../data/masonrySpecifications';
import { configResolver } from '../config/configurationResolver';

export function generateBuildingModel(input: EngineInput, area: AreaResult): BuildingModel {
  const activeWallHeight = configResolver.resolveParameter('config.structure.wall_height_ft', undefined, WALL_HEIGHT_FT);
  const floorsCount = Math.max(0, input.floors || 0);
  const rooms = input.rooms;
  const isZeroState = area.totalBUASqFt <= 0 && area.plotAreaSqFt <= 0;

  if (isZeroState || floorsCount <= 0) {
    return {
      floors: [],
      allSpaces: [],
      externalPerimeterFt: 0,
      grossExternalWallAreaSqFt: 0,
      netExternalWallAreaSqFt: 0,
      grossInternalWallAreaSqFt: 0,
      netInternalWallAreaSqFt: 0,
      totalCeilingAreaSqFt: 0,
      internalPaintableAreaSqFt: 0,
      externalPaintableAreaSqFt: 0,
      totalPaintableAreaSqFt: 0,
      totalNetWallAreaSqFt: 0,
      totalWallVolumeCuM: 0,
      totalBlockCount: 0,
      totalDoorOpeningAreaSqFt: 0,
      totalWindowOpeningAreaSqFt: 0,
    };
  }

  // 1. Generate Space Instances from User Room Counts
  const spacesList: SpaceModelItem[] = [];
  let spaceSeq = 0;

  const addSpaces = (
    type: keyof typeof rooms,
    count: number,
    floorDistributionStrategy: 'groundFirst' | 'allFloors' | 'upperFloors' = 'allFloors'
  ) => {
    const validCount = Math.max(0, count || 0);
    const normalizedType =
      type === 'bedrooms' ? 'bedroom' :
      type === 'bathrooms' ? 'bathroom' :
      type === 'commonToilets' ? 'commonToilet' :
      type;
    const def = ROOM_SIZE_ASSUMPTIONS[type] || ROOM_SIZE_ASSUMPTIONS[normalizedType] || ROOM_SIZE_ASSUMPTIONS.bedroom;

    for (let i = 0; i < validCount; i++) {
      spaceSeq++;
      // Determine assigned floor index
      let floorIndex = 0;
      if (floorsCount > 1) {
        if (floorDistributionStrategy === 'groundFirst') {
          floorIndex = i === 0 ? 0 : (i % floorsCount);
        } else if (floorDistributionStrategy === 'upperFloors') {
          floorIndex = Math.min(floorsCount - 1, 1 + (i % (floorsCount - 1)));
        } else {
          floorIndex = i % floorsCount;
        }
      }

      const length = configResolver.resolveParameter(
        `space.room.${normalizedType}.length_ft`,
        undefined,
        configResolver.resolveParameter(`space.room.${type}.length_ft`, undefined, def.estimatedLength)
      );
      const width = configResolver.resolveParameter(
        `space.room.${normalizedType}.width_ft`,
        undefined,
        configResolver.resolveParameter(`space.room.${type}.width_ft`, undefined, def.estimatedWidth)
      );
      const spaceArea = length * width;
      const perimeter = 2 * (length + width);
      const height = activeWallHeight; // Dynamically resolved from configResolver (fallback WALL_HEIGHT_FT)

      const doorCount = def.doorRequirement;
      const doorOpeningAreaSqFt = def.doorOpeningAreaSqFt;
      const windowCount = def.windowRequirement;
      const windowOpeningAreaSqFt = def.windowAreaSqFt;

      const grossWallAreaSqFt = perimeter * height;
      const netWallAreaSqFt = Math.max(0, grossWallAreaSqFt - doorOpeningAreaSqFt - windowOpeningAreaSqFt);
      const ceilingAreaSqFt = spaceArea;
      const paintableAreaSqFt = netWallAreaSqFt + ceilingAreaSqFt;

      // Wall cladding
      let dadoTileAreaSqFt = 0;
      if (type === 'bathrooms' || type === 'commonToilets') {
        const isFullHeight = input.wallCladding?.bathroomTileHeight === 'Full Height (Ceiling)';
        const configuredDadoHeight = configResolver.resolveParameter(
          `space.room.${normalizedType}.dado_height_ft`,
          undefined,
          configResolver.resolveParameter('config.cladding.bathroom_dado_standard_ft', undefined, BATHROOM_DADO_HEIGHT_STANDARD_FT)
        );
        const dadoHeight = isFullHeight ? BATHROOM_DADO_HEIGHT_FULL_FT : configuredDadoHeight;
        const grossDado = perimeter * dadoHeight;
        // Deduct door and ventilator opening within dado height
        dadoTileAreaSqFt = Math.max(0, grossDado - (doorOpeningAreaSqFt * (dadoHeight / height)) - windowOpeningAreaSqFt);
      } else if (type === 'kitchen') {
        const isExtended = input.wallCladding?.kitchenDadoHeight === '4 ft';
        const dadoHeight = isExtended ? KITCHEN_DADO_HEIGHT_EXTENDED_FT : KITCHEN_DADO_HEIGHT_STANDARD_FT;
        dadoTileAreaSqFt = Math.max(0, KITCHEN_COUNTER_LENGTH_FT * dadoHeight - windowOpeningAreaSqFt);
      }

      // Waterproofing
      let waterproofingAreaSqFt = 0;
      const isWetArea = type === 'bathrooms' || type === 'commonToilets' || type === 'balcony' || type === 'utility';
      if (type === 'bathrooms' || type === 'commonToilets') {
        const upturnFt = configResolver.resolveParameter('config.waterproofing.bathroom_upturn_ft', undefined, BATHROOM_WATERPROOFING_UPTURN_FT);
        waterproofingAreaSqFt = spaceArea + perimeter * upturnFt;
      } else if (type === 'balcony' || type === 'utility') {
        waterproofingAreaSqFt = spaceArea + perimeter * 0.5; // 6 inch curb
      }

      // Electrical point schedule
      let lightPoints = 2;
      let fanPoints = 0;
      let socketPoints = 2;
      let acPoints = 0;
      let tvDataPoints = 0;
      let geyserPoints = 0;

      if (type === 'bedrooms') {
        lightPoints = 3;
        fanPoints = 1;
        socketPoints = configResolver.resolveParameter(
          'space.room.bedroom.socket_points',
          undefined,
          configResolver.resolveParameter('config.electrical.bedroom_socket_points', undefined, 4)
        );
        acPoints = 1;
        tvDataPoints = 1;
      } else if (type === 'living') {
        lightPoints = 6;
        fanPoints = 2;
        socketPoints = 6;
        acPoints = 1;
        tvDataPoints = 2;
      } else if (type === 'dining') {
        lightPoints = 3;
        fanPoints = 1;
        socketPoints = 2;
      } else if (type === 'kitchen') {
        lightPoints = 3;
        fanPoints = 1;
        socketPoints = 5; // Refrigerator, Microwave, Chimney, Mixer, RO
      } else if (type === 'bathrooms' || type === 'commonToilets') {
        lightPoints = 2;
        fanPoints = 0;
        socketPoints = 2;
        geyserPoints = 1;
      } else if (type === 'office') {
        lightPoints = 3;
        fanPoints = 1;
        socketPoints = 4;
        acPoints = 1;
        tvDataPoints = 1;
      } else if (type === 'balcony' || type === 'utility' || type === 'pooja' || type === 'storeRoom') {
        lightPoints = 1;
        socketPoints = type === 'utility' ? 2 : 1;
      }

      // Plumbing points and fixtures
      let waterPoints = 0;
      let drainagePoints = 0;
      let wcCount = 0;
      let washBasinCount = 0;
      let showerCount = 0;
      let healthFaucetCount = 0;
      let floorDrainCount = 0;
      let sinkCount = 0;

      if (type === 'bathrooms') {
        wcCount = 1;
        washBasinCount = 1;
        showerCount = 1;
        healthFaucetCount = 1;
        floorDrainCount = 1;
        waterPoints = 4; // Hot/cold shower, basin, health faucet, cistern
        drainagePoints = 2; // Soil (WC) + Waste (Basin/Shower floor trap)
      } else if (type === 'commonToilets') {
        wcCount = 1;
        washBasinCount = 1;
        healthFaucetCount = 1;
        floorDrainCount = 1;
        waterPoints = 3;
        drainagePoints = 2;
      } else if (type === 'kitchen') {
        sinkCount = 1;
        waterPoints = 2; // Sink tap + RO/dish
        drainagePoints = 1;
        floorDrainCount = 1;
      } else if (type === 'utility') {
        waterPoints = 1; // Washing machine
        drainagePoints = 1;
        floorDrainCount = 1;
      } else if (type === 'balcony') {
        floorDrainCount = 1;
        drainagePoints = 1;
      }

      spacesList.push({
        id: `space_${type}_${spaceSeq}`,
        type,
        name: `${def.name} #${i + 1}`,
        floorIndex,
        floorName: floorIndex === 0 ? 'Ground Floor' : `Floor ${floorIndex + 1}`,
        length,
        width,
        area: spaceArea,
        perimeter,
        height,
        doorCount,
        doorOpeningAreaSqFt,
        windowCount,
        windowOpeningAreaSqFt,
        wetArea: isWetArea,
        flooringAreaSqFt: spaceArea,
        grossWallAreaSqFt,
        netWallAreaSqFt,
        ceilingAreaSqFt,
        paintableAreaSqFt,
        dadoTileAreaSqFt,
        waterproofingAreaSqFt,
        lightPoints,
        fanPoints,
        socketPoints,
        acPoints,
        tvDataPoints,
        geyserPoints,
        waterPoints,
        drainagePoints,
        wcCount,
        washBasinCount,
        showerCount,
        healthFaucetCount,
        floorDrainCount,
        sinkCount,
      });
    }
  };

  // Add all configured room categories
  addSpaces('living', rooms.living || 0, 'groundFirst');
  addSpaces('dining', rooms.dining || 0, 'groundFirst');
  addSpaces('kitchen', rooms.kitchen || 0, 'groundFirst');
  addSpaces('bedrooms', rooms.bedrooms || 0, 'allFloors');
  addSpaces('bathrooms', rooms.bathrooms || 0, 'allFloors');
  addSpaces('commonToilets', rooms.commonToilets || 0, 'groundFirst');
  addSpaces('balcony', rooms.balcony || 0, 'upperFloors');
  addSpaces('utility', rooms.utility || 0, 'groundFirst');
  addSpaces('pooja', rooms.pooja || 0, 'groundFirst');
  addSpaces('office', rooms.office || 0, 'allFloors');
  addSpaces('storeRoom', rooms.storeRoom || 0, 'groundFirst');

  // 2. Floor-by-Floor Assembly
  const floors: BuildingFloorModel[] = [];
  for (let f = 0; f < floorsCount; f++) {
    const floorSpaces = spacesList.filter((s) => s.floorIndex === f);
    const floorAreaSqFt = area.buaPerFloorSqFt || 0;
    const floorWallArea = floorSpaces.reduce((acc, s) => acc + s.netWallAreaSqFt, 0);
    const floorCeilingArea = floorSpaces.reduce((acc, s) => acc + s.ceilingAreaSqFt, 0);
    const floorPaintable = floorSpaces.reduce((acc, s) => acc + s.paintableAreaSqFt, 0);
    const floorDoors = floorSpaces.reduce((acc, s) => acc + s.doorCount, 0);
    const floorWindows = floorSpaces.reduce((acc, s) => acc + s.windowCount, 0);

    floors.push({
      floorIndex: f,
      floorName: f === 0 ? 'Ground Floor' : `Floor ${f + 1}`,
      floorAreaSqFt,
      spaces: floorSpaces,
      totalFloorWallAreaSqFt: floorWallArea,
      totalFloorCeilingAreaSqFt: floorCeilingArea,
      totalFloorPaintableAreaSqFt: floorPaintable,
      totalFloorDoorsCount: floorDoors,
      totalFloorWindowsCount: floorWindows,
    });
  }

  // 3. External Wall & Building Shell Geometry (PDF Section 5 & 12)
  const buildableLength = area.buildableLengthFt > 0 ? area.buildableLengthFt : Math.sqrt(area.buildableAreaSqFt || 100);
  const buildableWidth = area.buildableWidthFt > 0 ? area.buildableWidthFt : Math.sqrt(area.buildableAreaSqFt || 100);
  const externalPerimeterFt = Math.max(0, 2 * (buildableLength + buildableWidth));

  const grossExternalWallAreaSqFt = externalPerimeterFt * activeWallHeight * floorsCount;

  // External openings deduction (external windows and main door)
  const mainDoorOpening = (input.houseType === 'Rental Units' || input.houseType === 'Mixed Use')
    ? floorsCount * 28 // 4×7 ft main doors
    : 28;
  const totalWindowOpeningArea = spacesList.reduce((sum, s) => sum + s.windowOpeningAreaSqFt, 0);
  const totalDoorOpeningArea = spacesList.reduce((sum, s) => sum + s.doorOpeningAreaSqFt, 0) + mainDoorOpening;

  // External wall has ~70% of total windows on outer envelope + main door
  const externalOpeningsArea = Math.min(grossExternalWallAreaSqFt * 0.4, totalWindowOpeningArea * 0.85 + mainDoorOpening);
  const netExternalWallAreaSqFt = Math.max(0, grossExternalWallAreaSqFt - externalOpeningsArea);

  // Internal walls: sum of configured room wall envelopes with shared partition wall deduplication
  // (In architectural floorplans, shared internal partition walls divide adjacent rooms.
  // Applying 0.65 deduplication avoids double-counting shared wall faces for masonry and plaster).
  const internalDeduplicationFactor = 0.65;
  const grossInternalWallAreaSqFt = spacesList.reduce((sum, s) => sum + s.grossWallAreaSqFt, 0) * internalDeduplicationFactor;
  const netInternalWallAreaSqFt = spacesList.reduce((sum, s) => sum + s.netWallAreaSqFt, 0) * internalDeduplicationFactor;
  const totalCeilingAreaSqFt = spacesList.reduce((sum, s) => sum + s.ceilingAreaSqFt, 0);

  // Paintable area per PDF Section 17 & Prompt Section 11:
  // Internal Paint Area = Net Internal Wall Area + Total Ceiling Area
  // External Paint Area = Net External Wall Area
  // Total Paintable Area = Internal + External
  const internalPaintableAreaSqFt = netInternalWallAreaSqFt + totalCeilingAreaSqFt;
  const externalPaintableAreaSqFt = netExternalWallAreaSqFt;
  const totalPaintableAreaSqFt = internalPaintableAreaSqFt + externalPaintableAreaSqFt;

  // Masonry Volume & Block/Brick Count:
  // Derived from canonical Net Wall Area and Selected Material Specification
  const masonrySpec = getMasonrySpecification(input.materialBrands?.masonry || (input as any).masonryMaterial);
  const totalNetWallAreaSqFt = netExternalWallAreaSqFt + netInternalWallAreaSqFt;
  // Convert sq.ft to sq.m (1 sq.ft = 0.092903 sq.m) and multiply by material-specific thickness:
  const SQFT_TO_SQM = 0.092903;
  const netExternalWallAreaSqM = netExternalWallAreaSqFt * SQFT_TO_SQM;
  const netInternalWallAreaSqM = netInternalWallAreaSqFt * SQFT_TO_SQM;
  const totalNetWallAreaSqM = totalNetWallAreaSqFt * SQFT_TO_SQM;

  const externalWallVolCuM = netExternalWallAreaSqM * masonrySpec.externalWallThicknessM;
  const internalWallVolCuM = netInternalWallAreaSqM * masonrySpec.internalWallThicknessM;
  const totalWallVolumeCuM = externalWallVolCuM + internalWallVolCuM;

  let totalBlockCount = 0;
  if (masonrySpec.unitVolumeCuM > 0) {
    totalBlockCount = Math.ceil((totalWallVolumeCuM / masonrySpec.unitVolumeCuM) * (1 + masonrySpec.wastagePercentage / 100));
  } else if (masonrySpec.blockLengthM && masonrySpec.blockHeightM) {
    const blockFaceAreaSqM = masonrySpec.blockLengthM * masonrySpec.blockHeightM;
    totalBlockCount = Math.ceil((totalNetWallAreaSqM / blockFaceAreaSqM) * (1 + masonrySpec.wastagePercentage / 100));
  }

  return {
    floors,
    allSpaces: spacesList,
    externalPerimeterFt,
    grossExternalWallAreaSqFt,
    netExternalWallAreaSqFt,
    grossInternalWallAreaSqFt,
    netInternalWallAreaSqFt,
    totalCeilingAreaSqFt,
    internalPaintableAreaSqFt,
    externalPaintableAreaSqFt,
    totalPaintableAreaSqFt,
    totalNetWallAreaSqFt,
    totalWallVolumeCuM,
    totalBlockCount,
    totalDoorOpeningAreaSqFt: totalDoorOpeningArea,
    totalWindowOpeningAreaSqFt: totalWindowOpeningArea,
  };
}
