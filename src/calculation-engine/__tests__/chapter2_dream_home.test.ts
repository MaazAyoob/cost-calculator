import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore, SAMPLE_ROOM_CONFIG, HouseType, ParkingTypeOption } from '../../store/useWizardStore';
import { runCalculator } from '../calculator';
import { calculateArea } from '../modules/bua';
import { generateBuildingModel } from '../modules/spaceModel';
import { calculateDoors } from '../modules/doors';
import { EngineInput } from '../types';

describe('Hutty 3.1 — Chapter 2: Dream Home & Spaces Architecture & Integration Suite', () => {
  beforeEach(() => {
    useWizardStore.getState().resetConfigurator();
    // Configure standard residential plot from Chapter 1 (30 x 40 ft in Bangalore)
    const store = useWizardStore.getState();
    store.setCity('Bangalore');
    store.setAuthority('BBMP/BDA');
    store.setPlotDimensions(40, 30);
    store.setRoadWidth(30);
  });

  // ── 1. SUPPORTED BUILDING-USE CONFIGURATIONS ──
  it('1. Correctly configures each supported building-use type and updates main entrance door count', () => {
    const store = useWizardStore.getState();
    const buildingUses: HouseType[] = ['Duplex', 'Triplex', 'Rental Units', 'Mixed Use', 'Farmhouse'];

    buildingUses.forEach((type) => {
      store.setHouseConfig(type, 2);
      expect(useWizardStore.getState().houseType).toBe(type);
      expect(useWizardStore.getState().floors).toBe(2);

      const engineInput: EngineInput = {
        city: 'Bangalore',
        authority: 'BBMP/BDA',
        plotLength: 40,
        plotWidth: 30,
        builtUpAreaPerFloor: 720,
        floors: 2,
        houseType: type,
        parkingType: 'Normal Ground',
        carCount: 1,
        bikeCount: 2,
        evCharging: false,
        liftRequired: false,
        rooms: store.rooms,
        qualityTier: 'Premium',
        materialBrands: store.materialBrands,
        flooringZones: store.flooringZones,
        wallCladding: store.wallCladding,
        doors: store.doors,
        windows: store.windows,
      };

      const result = runCalculator(engineInput);
      expect(result).toBeDefined();
      expect(result.budget.totalProjectCost).toBeGreaterThan(0);

      // Rental Units and Mixed Use provide 1 main entrance door per floor (2 doors for G+1)
      // Single family residences (Duplex, Triplex, Farmhouse) provide 1 dwelling main door
      const doorResult = calculateDoors(engineInput);
      if (type === 'Rental Units' || type === 'Mixed Use') {
        expect(doorResult.mainDoorsCount).toBe(2);
      } else {
        expect(doorResult.mainDoorsCount).toBe(1);
      }
    });
  });

  // ── 2. FLOOR COUNTS & RESIDENTIAL FLOOR CONFIGURATION ──
  it('2. Evaluates floor counts (G to G+4), scaling BUA and automatically enforcing lift rules for G+3 and above', () => {
    const store = useWizardStore.getState();

    // Ground floor only
    store.setHouseConfig('Duplex', 1);
    expect(useWizardStore.getState().floors).toBe(1);
    expect(useWizardStore.getState().liftRequired).toBe(false);

    // Ground + 1 Floor
    store.setHouseConfig('Duplex', 2);
    expect(useWizardStore.getState().floors).toBe(2);
    expect(useWizardStore.getState().liftRequired).toBe(false);

    // Ground + 2 Floors
    store.setHouseConfig('Duplex', 3);
    expect(useWizardStore.getState().floors).toBe(3);
    expect(useWizardStore.getState().liftRequired).toBe(false);

    // Ground + 3 Floors -> Automatically defaults liftRequired to true
    store.setHouseConfig('Duplex', 4);
    expect(useWizardStore.getState().floors).toBe(4);
    expect(useWizardStore.getState().liftRequired).toBe(true);

    // Ground + 4 Floors -> Preserves liftRequired as true
    store.setHouseConfig('Duplex', 5);
    expect(useWizardStore.getState().floors).toBe(5);
    expect(useWizardStore.getState().liftRequired).toBe(true);
  });

  // ── 3. STILT AND PARKING TREATMENT ──
  it('3. Stilt parking dedicates the ground floor to parking, enforces min 2 floors, and does not count as habitable BUA', () => {
    const store = useWizardStore.getState();

    // A. Normal Ground Parking
    store.setHouseConfig('Duplex', 2);
    store.setParkingConfig('Normal Ground', 2, 2, true);

    const normalState = useWizardStore.getState();
    expect(normalState.parkingType).toBe('Normal Ground');
    expect(normalState.carCount).toBe(2);
    expect(normalState.bikeCount).toBe(2);
    expect(normalState.evCharging).toBe(true);

    // Normal ground parking rate is 120 sq.ft per car, 35 sq.ft per bike
    const normalParkingArea = 2 * 120 + 2 * 35; // 240 + 70 = 310 sq.ft

    const normalArea = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      parkingType: 'Normal Ground',
      carCount: 2,
      bikeCount: 2,
    });

    expect(normalArea.parkingAreaSqFt).toBe(normalParkingArea);
    expect(normalArea.totalBUASqFt).toBe(1440); // 720 * 2 habitable floors

    // B. Dedicated Stilt Floor Parking
    // Setting Stilt on 1 floor automatically elevates floors to 2 (1 Stilt + 1 Habitable)
    store.setHouseConfig('Duplex', 1);
    store.setParkingConfig('Stilt', 2, 2, true);

    const stiltState = useWizardStore.getState();
    expect(stiltState.parkingType).toBe('Stilt');
    expect(stiltState.floors).toBe(2); // Elevated from 1 to 2

    // Stilt parking rate is 180 sq.ft per car bay (drive aisle + turning space)
    const stiltParkingArea = 2 * 180 + 2 * 35; // 360 + 70 = 430 sq.ft

    const stiltArea = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      parkingType: 'Stilt',
      carCount: 2,
      bikeCount: 2,
    });

    expect(stiltArea.parkingAreaSqFt).toBe(stiltParkingArea);
    // Habitable floors above stilt is floors - 1
    const habitableFloors = stiltState.floors - 1;
    expect(habitableFloors).toBe(1);
    // Total constructed space is BUA + Parking + Terrace
    expect(stiltArea.totalConstructedSqFt).toBe(stiltArea.totalBUASqFt + stiltParkingArea + stiltArea.terraceSqFt);
  });

  // ── 4. CANONICAL ROOM COUNTS AND FLOOR-WISE SPACE ALLOCATION ──
  it('4. Canonical room configuration generates floor-wise spaces through BuildingModel without manual room areas', () => {
    const store = useWizardStore.getState();
    store.setHouseConfig('Duplex', 2);
    // Standard 3BHK
    expect(store.rooms.bedrooms).toBe(3);
    expect(store.rooms.bathrooms).toBe(3);
    expect(store.rooms.living).toBe(1);
    expect(store.rooms.kitchen).toBe(1);
    expect(store.rooms.dining).toBe(1);

    const areaResult = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
    });

    const engineInput: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      rooms: store.rooms,
    };

    const buildingModel = generateBuildingModel(engineInput, areaResult);
    expect(buildingModel).toBeDefined();
    expect(buildingModel.floors.length).toBe(2);

    // Floor 0: Ground Floor Living + Kitchen + Dining + Primary Bedroom + Bathroom
    const groundSpaces = buildingModel.floors[0].spaces;
    expect(groundSpaces.some((s) => s.type === 'living')).toBe(true);
    expect(groundSpaces.some((s) => s.type === 'kitchen')).toBe(true);
    expect(groundSpaces.some((s) => s.type === 'dining')).toBe(true);

    // Floor 1: First Floor Upper Bedrooms + Bathrooms + Balcony
    const firstFloorSpaces = buildingModel.floors[1].spaces;
    expect(firstFloorSpaces.some((s) => s.type === 'bedrooms')).toBe(true);

    // Room sizes are resolved from engineering assumptions automatically (no user entry required)
    const masterBed = groundSpaces.find((s) => s.type === 'bedrooms');
    expect(masterBed?.area).toBe(140); // 14 x 10 ft
    const mainKitchen = groundSpaces.find((s) => s.type === 'kitchen');
    expect(mainKitchen?.area).toBe(90); // 10 x 9 ft
  });

  // ── 5. CUSTOM ROOM STEPPERS & SAMPLE RESET ──
  it('5. Room steppers mark custom layout, update space model, and restore standard 3BHK cleanly', () => {
    const store = useWizardStore.getState();
    expect(store.isCustomRooms).toBe(false);

    // User increases bedrooms from 3 to 4, bathrooms from 3 to 4
    store.updateRoomCount('bedrooms', 1);
    expect(useWizardStore.getState().rooms.bedrooms).toBe(4);
    expect(useWizardStore.getState().isCustomRooms).toBe(true);

    store.updateRoomCount('bathrooms', 1);
    expect(useWizardStore.getState().rooms.bathrooms).toBe(4);

    // Reset to Sample 3BHK restores standard config
    store.applySampleRoomConfig();
    const resetState = useWizardStore.getState();
    expect(resetState.rooms.bedrooms).toBe(SAMPLE_ROOM_CONFIG.bedrooms);
    expect(resetState.rooms.bathrooms).toBe(SAMPLE_ROOM_CONFIG.bathrooms);
    expect(resetState.rooms.living).toBe(SAMPLE_ROOM_CONFIG.living);
    expect(resetState.rooms.kitchen).toBe(SAMPLE_ROOM_CONFIG.kitchen);
    expect(resetState.isCustomRooms).toBe(false);
  });

  // ── 6. BUA CALCULATIONS & SUMMARY PILLARS ──
  it('6. Computes live BUA summary metrics with Super BUA and parking area correctly', () => {
    const area = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
    });

    expect(area.plotAreaSqFt).toBe(1200);
    expect(area.buaPerFloorSqFt).toBe(720);
    expect(area.totalBUASqFt).toBe(1440);
    // Super BUA = Total BUA * 1.15
    expect(area.superBUASqFt).toBe(Math.round(1440 * 1.15)); // 1656 sq.ft
    // Parking = 1 * 120 + 2 * 35 = 190 sq.ft
    expect(area.parkingAreaSqFt).toBe(190);
    // Terrace = top slab = 720 sq.ft
    expect(area.terraceSqFt).toBe(720);
    // Total constructed = 1440 + 190 + 720 = 2350 sq.ft
    expect(area.totalConstructedSqFt).toBe(2350);
  });

  // ── 7. COMPATIBILITY WITH CHAPTER 1 PLOT INPUTS & PLANNING LIMITS ──
  it('7. Maintains seamless compatibility with Chapter 1 plot dimensions and municipal authority rules', () => {
    const store = useWizardStore.getState();
    store.setPlotDimensions(50, 30); // 1,500 sq.ft plot
    store.setHouseConfig('Duplex', 2);

    const area = calculateArea({
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 50,
      plotWidth: 30,
      roadWidthFt: 30,
      floors: 2,
    });

    expect(area.plotAreaSqFt).toBe(1500);
    expect(area.maxPermissibleCoveragePct).toBe(70);
    expect(area.coverageLimitSqFt).toBe(1050); // 1500 * 0.70
    expect(area.isWithinPermissibleLimit).toBe(true);
    expect(area.validationState).toBe('valid');
  });

  // ── 8. BACKWARD AND FORWARD NAVIGATION & STAGE CONTINUITY ──
  it('8. Navigates backward and forward without mutating user selections or resetting room counts', () => {
    const store = useWizardStore.getState();
    store.setStep(1); // Chapter 1
    store.setPlotDimensions(40, 30);
    store.setCity('Bangalore');

    // Move to Chapter 2
    store.setStep(2);
    expect(useWizardStore.getState().currentStep).toBe(2);

    // Customize home
    store.setHouseConfig('Rental Units', 3);
    store.setParkingConfig('Stilt', 3, 4, true);
    store.updateRoomCount('bedrooms', 2); // 5 bedrooms

    expect(useWizardStore.getState().houseType).toBe('Rental Units');
    expect(useWizardStore.getState().floors).toBe(3);
    expect(useWizardStore.getState().rooms.bedrooms).toBe(5);

    // Return to Chapter 1
    store.setStep(1);
    expect(useWizardStore.getState().currentStep).toBe(1);
    expect(useWizardStore.getState().plotLength).toBe(40);
    expect(useWizardStore.getState().plotWidth).toBe(30);

    // Re-enter Chapter 2: all selections are strictly preserved
    store.setStep(2);
    const preserved = useWizardStore.getState();
    expect(preserved.houseType).toBe('Rental Units');
    expect(preserved.floors).toBe(3);
    expect(preserved.parkingType).toBe('Stilt');
    expect(preserved.carCount).toBe(3);
    expect(preserved.bikeCount).toBe(4);
    expect(preserved.evCharging).toBe(true);
    expect(preserved.rooms.bedrooms).toBe(5);
  });

  // ── 9. ANONYMOUS SESSION PERSISTENCE ──
  it('9. Anonymous visitor progression and session state persist across state queries', () => {
    const store = useWizardStore.getState();
    expect(store.sessionId).toBeDefined();

    store.setStartTimeline('immediate');
    store.setHouseConfig('Triplex', 3);
    store.setParkingConfig('Normal Ground', 2, 2, false);

    const state = useWizardStore.getState();
    expect(state.startTimeline).toBe('immediate');
    expect(state.houseType).toBe('Triplex');
    expect(state.floors).toBe(3);
    expect(state.carCount).toBe(2);
  });

  // ── 10. DOWNSTREAM CALCULATION ENGINE & BOQ COMPATIBILITY ──
  it('10. Propagates Chapter 2 parameters end-to-end through full calculation engine and BOQ generator', () => {
    const store = useWizardStore.getState();
    store.setHouseConfig('Duplex', 2);
    store.setParkingConfig('Normal Ground', 1, 2, true);

    const input: EngineInput = {
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      plotLength: 40,
      plotWidth: 30,
      builtUpAreaPerFloor: 720,
      floors: 2,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: true,
      liftRequired: false,
      rooms: store.rooms,
      qualityTier: 'Premium',
      materialBrands: store.materialBrands,
      flooringZones: store.flooringZones,
      wallCladding: store.wallCladding,
      doors: store.doors,
      windows: store.windows,
    };

    const calcResult = runCalculator(input);
    expect(calcResult).toBeDefined();

    // Verify budget
    expect(calcResult.budget.totalProjectCost).toBeGreaterThan(0);
    expect(calcResult.budget.costPerSqFt).toBeGreaterThan(0);

    // Verify building model
    expect(calcResult.buildingModel.floors.length).toBe(2);
    expect(calcResult.buildingModel.allSpaces.length).toBeGreaterThan(0);

    // Verify structural quantities
    expect(calcResult.quantities.totalStructuralConcreteCuM).toBeGreaterThan(0);
    expect(calcResult.quantities.steelKg).toBeGreaterThan(0);
    expect(calcResult.quantities.cementBags).toBeGreaterThan(0);

    // Verify schedules
    expect(calcResult.doorSchedule.length).toBeGreaterThan(0);
    expect(calcResult.windowSchedule.length).toBeGreaterThan(0);
    expect(calcResult.fixtureSchedule.length).toBeGreaterThan(0);

    // Verify BOQ & Material Schedule
    expect(calcResult.boq.length).toBeGreaterThan(0);
    expect(calcResult.materialSchedule.length).toBeGreaterThan(0);
  });
});

