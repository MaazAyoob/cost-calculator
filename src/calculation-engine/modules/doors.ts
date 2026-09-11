// ============================================================
// DOORS MODULE – Authoritative Door Engine & Schedule
// Strictly follows Hutty Pilot Specification (Section 13)
//
// Rules:
// - Main Door: generated from primary dwelling entrances / house type
// - Bedroom Doors: 1 per configured bedroom
// - Bathroom Doors: 1 per configured bathroom/toilet
// - Utility/Kitchen/Other Enclosed Space Doors: generated from space rules
// - Door Frames: one frame set per applicable door
// ============================================================

import { EngineInput, DoorScheduleItem } from '../types';
import { getBrandRate } from '../data/brandDatabase';
import { rateService } from '../data/rateService';

export function calculateDoors(input: EngineInput): {
  mainDoorsCount: number;
  internalDoorsCount: number;
  bathroomDoorsCount: number;
  totalDoorsCount: number;
  doorOpeningAreaSqFt: number;
  doorSchedule: DoorScheduleItem[];
} {
  const { rooms, floors, houseType, doors, materialBrands } = input;
  const isZero = (!floors || floors <= 0) && (!input.plotLength || input.plotLength <= 0);

  if (isZero) {
    return {
      mainDoorsCount: 0,
      internalDoorsCount: 0,
      bathroomDoorsCount: 0,
      totalDoorsCount: 0,
      doorOpeningAreaSqFt: 0,
      doorSchedule: [],
    };
  }

  // 1. Main Doors Count
  const mainDoorsCount = (houseType === 'Rental Units' || houseType === 'Mixed Use')
    ? Math.max(1, floors || 1)
    : 1;

  // 2. Internal Doors Count (Bedrooms + Office + Pooja + Utility + Store + Terrace Access)
  const terraceDoor = (floors || 1) > 1 ? 1 : 0;
  const internalDoorsCount =
    (rooms.bedrooms || 0) +
    (rooms.office || 0) +
    (rooms.pooja || 0) +
    (rooms.utility || 0) +
    (rooms.storeRoom || 0) +
    terraceDoor;

  // 3. Bathroom Doors Count (Bathrooms + Common Toilets)
  const bathroomDoorsCount = (rooms.bathrooms || 0) + (rooms.commonToilets || 0);

  const totalDoorsCount = mainDoorsCount + internalDoorsCount + bathroomDoorsCount;
  const doorOpeningAreaSqFt = (mainDoorsCount * 28) + (internalDoorsCount * 21) + (bathroomDoorsCount * 17.5);

  // 4. Authoritative Door Schedule (PDF Section 13)
  const schedule: DoorScheduleItem[] = [];

  // Rates resolution through centralized Rate Master
  const ctx = { packageTier: input.qualityTier, location: input.city };

  const mainDoorChoice = (doors?.mainDoor || materialBrands?.doors || 'Premium Teak') as string;
  let defaultMainRate = 65000;
  if (mainDoorChoice.includes('Burma')) defaultMainRate = 145000;
  else if (mainDoorChoice === 'Premium Teak') defaultMainRate = 65000;
  else if (mainDoorChoice === 'Normal Teak') defaultMainRate = 42000;
  else if (mainDoorChoice.includes('Flush')) defaultMainRate = 18500;
  else if (materialBrands?.doors) defaultMainRate = getBrandRate('doors', materialBrands.doors) || defaultMainRate;
  const mainDoorRate = rateService.getEffectiveRate('doors.main_teak_african', { ...ctx, brand: mainDoorChoice }, defaultMainRate);

  const internalChoice = (doors?.internalDoor || 'Flush Door') as string;
  let defaultInternalRate = 12500;
  if (internalChoice.includes('Laminate')) defaultInternalRate = 16500;
  else if (internalChoice.includes('Flush')) defaultInternalRate = 12500;
  const internalDoorRate = rateService.getEffectiveRate('doors.internal_flush', { ...ctx, brand: internalChoice }, defaultInternalRate);

  const bathChoice = (doors?.bathroomDoor || 'WPC Door') as string;
  let defaultBathRate = 11000;
  if (bathChoice.includes('FRP') || bathChoice.includes('ERP')) defaultBathRate = 8500;
  else if (bathChoice.includes('WPC')) defaultBathRate = 11000;
  const bathDoorRate = rateService.getEffectiveRate('doors.bath_frp_wpc', { ...ctx, brand: bathChoice }, defaultBathRate);

  if (mainDoorsCount > 0) {
    schedule.push({
      code: 'D-MAIN',
      description: 'Main Entrance Grand Door (Frame + Shutter + Hardware + Lock)',
      spaceType: 'Main Entrance',
      quantity: mainDoorsCount,
      unit: 'Sets',
      openingSize: '4.0 ft × 7.0 ft',
      openingAreaSqFt: 28,
      material: 'Solid Teak Wood',
      specification: mainDoorChoice,
      unitRate: mainDoorRate,
      amount: mainDoorsCount * mainDoorRate,
    });
  }

  if (internalDoorsCount > 0) {
    schedule.push({
      code: 'D-INT',
      description: 'Internal Bedroom & Living Space Door Set (Hardwood Frame + Shutter + Mortise)',
      spaceType: 'Bedrooms & Enclosed Rooms',
      quantity: internalDoorsCount,
      unit: 'Sets',
      openingSize: '3.0 ft × 7.0 ft',
      openingAreaSqFt: 21,
      material: 'Hardwood Frame + BWP Shutter',
      specification: internalChoice,
      unitRate: internalDoorRate,
      amount: internalDoorsCount * internalDoorRate,
    });
  }

  if (bathroomDoorsCount > 0) {
    schedule.push({
      code: 'D-BATH',
      description: 'Waterproof Bathroom Door Set (WPC/FRP Frame + Water-Resistant Shutter)',
      spaceType: 'Bathrooms & Powder Rooms',
      quantity: bathroomDoorsCount,
      unit: 'Sets',
      openingSize: '2.5 ft × 7.0 ft',
      openingAreaSqFt: 17.5,
      material: 'Waterproof WPC / FRP Composite',
      specification: bathChoice,
      unitRate: bathDoorRate,
      amount: bathroomDoorsCount * bathDoorRate,
    });
  }

  return {
    mainDoorsCount,
    internalDoorsCount,
    bathroomDoorsCount,
    totalDoorsCount,
    doorOpeningAreaSqFt,
    doorSchedule: schedule,
  };
}
