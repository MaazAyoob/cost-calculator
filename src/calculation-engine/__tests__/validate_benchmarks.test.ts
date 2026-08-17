import { describe, it } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const defaultInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 40,
  plotWidth: 30,
  houseType: 'Duplex',
  floors: 1, // Ground
  parkingType: 'Normal Ground',
  carCount: 1,
  bikeCount: 1,
  evCharging: false,
  liftRequired: false,
  rooms: {
    bedrooms: 2,
    bathrooms: 2,
    commonToilets: 0,
    kitchen: 1,
    dining: 1,
    living: 1,
    balcony: 0,
    office: 0,
    pooja: 1,
    utility: 1,
    storeRoom: 0,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    doors: 'Premium Teak',
    windows: 'Fenesta uPVC',
    flooring: 'Vitrified Tiles',
    bathroom: 'Kohler',
    electrical: 'Finolex',
    paint: 'Asian Paints Royale',
  },
  flooringZones: {
    living: 'Vitrified Tiles 800x800mm',
    kitchenDining: 'Vitrified Tiles',
    bedrooms: 'Vitrified Tiles',
    bathrooms: 'Anti-skid Ceramic Tiles',
    parkingUtility: 'Heavy-Duty Parking Tiles',
    balconies: 'Anti-skid Ceramic',
  },
  wallCladding: {
    kitchenDadoHeight: '2 ft',
    bathroomTileHeight: '7 ft (Lintel)',
  },
  doors: {
    mainDoor: 'Premium Teak',
    internalDoor: 'Flush Door',
    bathroomDoor: 'WPC Door',
  },
  windows: {
    primaryMaterial: 'uPVC',
    subGrade: 'Standard uPVC',
  },
  electrical: {
    conduit: 'Heavy-Duty ISI Marked PVC',
    wireTier: 'Mid-range (V-Guard)',
  },
  bathroomFittings: {
    sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
    cpvcBrand: 'Ashirwad',
  },
  painting: {
    baseLayer: 'Putty + Primer',
    internalPaint: 'Premium Emulsion',
    externalPaint: 'Ultima Weather Proof',
    brand: 'Asian Paints',
  },
};

export interface BenchmarkReportItem {
  name: string;
  plotArea: number;
  buildableFootprint: number;
  buaPerFloor: number;
  totalBUA: number;
  steelTonnes: number;
  steelKg: number;
  cementBags: number;
  concreteCuM: number;
  aacBlocksCuM: number;
  sandCuFt: number;
  aggregateCuFt: number;
  floorTilesSqFt: number;
  wallTilesSqFt: number;
  doorsCount: number;
  windowsCount: number;
  electricalPoints: number;
  plumbingFixtures: number;
  baseBOQSum: number;
  totalProjectCost: number;
  effectiveRatePerSqFt: number;
}

const testCases = [
  { name: '30x40 Ground', length: 40, width: 30, bua: 720, floors: 1, beds: 2, baths: 2 },
  { name: '30x40 G+1',    length: 40, width: 30, bua: 720, floors: 2, beds: 3, baths: 3 },
  { name: '30x40 G+2',    length: 40, width: 30, bua: 720, floors: 3, beds: 4, baths: 4 },
  { name: '30x40 G+3',    length: 40, width: 30, bua: 720, floors: 4, beds: 5, baths: 5 },
  { name: '30x40 G+4',    length: 40, width: 30, bua: 720, floors: 5, beds: 6, baths: 6 },
  { name: '30x50 G+2',    length: 50, width: 30, bua: 900, floors: 3, beds: 4, baths: 4 },
  { name: '60x90 G+4',    length: 90, width: 60, bua: 3240, floors: 5, beds: 8, baths: 8 },
];

describe('Rightcon 7-Case Benchmark Validation Suite', () => {
  const benchmarkResults: BenchmarkReportItem[] = [];

  testCases.forEach((tc) => {
    it(`Validate Benchmark Case: ${tc.name}`, () => {
      const input: EngineInput = {
        ...defaultInput,
        plotLength: tc.length,
        plotWidth: tc.width,
        builtUpAreaPerFloor: tc.bua,
        floors: tc.floors,
        liftRequired: tc.floors >= 4,
        rooms: {
          ...defaultInput.rooms,
          bedrooms: tc.beds,
          bathrooms: tc.baths,
        },
      };

      const res = runCalculator(input);
      const item: BenchmarkReportItem = {
        name: tc.name,
        plotArea: res.area.plotAreaSqFt,
        buildableFootprint: res.area.buildableAreaSqFt,
        buaPerFloor: res.area.buaPerFloorSqFt,
        totalBUA: res.area.totalBUASqFt,
        steelTonnes: res.quantities.steelTonnes,
        steelKg: Math.round(res.quantities.steelTonnes * 1000),
        cementBags: res.quantities.cementBags,
        concreteCuM: res.quantities.concreteCuM,
        aacBlocksCuM: res.quantities.aacBlocksCuM,
        sandCuFt: res.quantities.sandCuFt,
        aggregateCuFt: res.quantities.aggregateCuFt,
        floorTilesSqFt: res.quantities.floorTilesSqFt,
        wallTilesSqFt: res.quantities.wallTilesSqFt,
        doorsCount: res.quantities.mainDoorsCount + res.quantities.internalDoorsCount + res.quantities.bathroomDoorsCount,
        windowsCount: res.quantities.windowsCount,
        electricalPoints: res.quantities.lightingPoints,
        plumbingFixtures: res.quantities.bathroomFixtureSets,
        baseBOQSum: res.budget.baseConstructionCost,
        totalProjectCost: res.budget.totalProjectCost,
        effectiveRatePerSqFt: res.budget.costPerSqFt,
      };

      benchmarkResults.push(item);

      console.log(
        `\n[BENCHMARK RESULT: ${tc.name}]\n` +
        `  Plot: ${item.plotArea} sqft | Buildable: ${item.buildableFootprint} sqft | BUA/Flr: ${item.buaPerFloor} sqft | Total BUA: ${item.totalBUA} sqft\n` +
        `  Steel: ${item.steelTonnes} T (${item.steelKg} kg) | Cement: ${item.cementBags} Bags | RMC: ${item.concreteCuM} Cu.M | AAC: ${item.aacBlocksCuM} Cu.M\n` +
        `  Flooring: ${item.floorTilesSqFt} sqft | Wall Tiles: ${item.wallTilesSqFt} sqft | Doors: ${item.doorsCount} | Windows: ${item.windowsCount}\n` +
        `  BOQ Sum: ₹${item.baseBOQSum.toLocaleString('en-IN')} | Total Cost: ₹${item.totalProjectCost.toLocaleString('en-IN')} | Effective Rate: ₹${item.effectiveRatePerSqFt}/sqft\n`
      );
    });
  });
});
