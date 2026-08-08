import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

const mockInput: EngineInput = {
  city: 'Bangalore',
  authority: 'BBMP/BDA',
  plotLength: 60,
  plotWidth: 40,
  houseType: 'Duplex',
  floors: 3,
  parkingType: 'Stilt Parking',
  carCount: 2,
  bikeCount: 2,
  evCharging: true,
  liftRequired: true,
  rooms: {
    bedrooms: 4,
    bathrooms: 4,
    commonToilets: 1,
    kitchen: 1,
    dining: 1,
    living: 2,
    balcony: 2,
    office: 1,
    pooja: 1,
    utility: 1,
    storeRoom: 1,
  },
  qualityTier: 'Premium',
  materialBrands: {
    steel: 'Tata Tiscon',
    cement: 'UltraTech',
    doors: 'Teakwood Custom Joinery',
    windows: 'Fenesta uPVC',
    flooring: 'Italian Marble',
    bathroom: 'Kohler',
    electrical: 'Finolex',
    paint: 'Asian Paints Royale',
  },
  flooringZones: {
    living: 'Italian Marble',
    kitchenDining: 'Granite',
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

describe('Calculation Engine Core', () => {
  it('should compute built-up area correctly based on plot dimensions & BBMP rules', () => {
    const result = runCalculator(mockInput);
    expect(result.area.plotAreaSqFt).toBe(2400); // 60 * 40
    expect(result.area.buildableAreaSqFt).toBe(1440); // 2400 * 0.60
    expect(result.area.buaPerFloorSqFt).toBe(1325); // 1440 * 0.92 rounded
    expect(result.area.totalBUASqFt).toBe(3975); // 1325 * 3
  });

  it('should compute TMT steel tonnage according to IS 456 Premium tier ratio', () => {
    const result = runCalculator(mockInput);
    // Premium tier = 4.5 kg / sqft BUA
    const expectedKg = 3975 * 4.5;
    expect(result.quantities.steelTonnes).toBe(parseFloat((expectedKg / 1000).toFixed(1)));
  });

  it('should generate a structured BOQ with at least 40 items', () => {
    const result = runCalculator(mockInput);
    expect(result.boq.length).toBeGreaterThanOrEqual(40);
  });

  it('should generate 11 payment milestones summing to total budget', () => {
    const result = runCalculator(mockInput);
    expect(result.paymentPlan.length).toBe(11);
    const sumMilestones = result.paymentPlan.reduce((sum, m) => sum + m.amount, 0);
    expect(sumMilestones).toBe(result.budget.totalProjectCost);
  });
});
