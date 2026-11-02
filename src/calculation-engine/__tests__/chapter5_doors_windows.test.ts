import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { calculateDoors } from '../modules/doors';
import { calculateWindows } from '../modules/windows';
import { useWizardStore, SAMPLE_ROOM_CONFIG } from '../../store/useWizardStore';
import { useCalculationStore } from '../../store/useCalculationStore';

describe('Hutty 3.1 — Phase 02: Task 2.5 Dedicated Chapter 5 (Doors & Windows) Test Suite', () => {
  const baseInput: EngineInput = {
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    plotLength: 40,
    plotWidth: 30, // 1,200 sq.ft plot
    roadWidthFt: 30,
    builtUpAreaPerFloor: 840,
    userSelectedBUA: 2800,
    frontSetback: 3.5,
    rearSetback: 3.0,
    leftSetback: 3.0,
    rightSetback: 3.0,
    roadFacingBoundaries: ['front'],
    isCornerPlot: false,
    roadWideningFt: 0,
    prescribedBuildingLineFt: 0,
    houseType: 'Duplex',
    floors: 3, // G+2 (3 floors)
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: false,
    liftRequired: false,
    rooms: { ...SAMPLE_ROOM_CONFIG }, // 3 bed, 3 bath, 1 living, 1 kitchen, 1 dining, 1 pooja, 2 balcony, 1 utility
    qualityTier: 'Premium',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'AAC Blocks',
      doors: 'Premium Teak',
      windows: 'uPVC',
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
      subGrade: 'Luxury / Fenesta uPVC',
    },
    electrical: {
      conduit: 'Heavy-Duty ISI Marked PVC',
      wireTier: 'Premium (Finolex / Polycab)',
    },
    bathroomFittings: {
      sanitaryTier: 'Premium (Jaquar / Kohler / Grohe)',
      cpvcBrand: 'Astral',
    },
    painting: {
      baseLayer: 'Putty + Primer',
      internalPaint: 'Premium Emulsion',
      externalPaint: 'Apex Ultima Protek',
      brand: 'Asian Paints',
    },
  };

  beforeEach(() => {
    useWizardStore.getState().resetConfigurator?.();
  });

  it('1. Authoritative Door count and opening area takeoff matches room configuration', () => {
    const doorRes = calculateDoors(baseInput);

    // Duplex house has 1 main door
    expect(doorRes.mainDoorsCount).toBe(1);

    // Internal doors: 3 bedrooms + 1 pooja + 1 utility + 1 terrace (floors > 1) = 6 internal doors
    expect(doorRes.internalDoorsCount).toBe(6);

    // Bathroom doors: 3 bathrooms + 0 common toilets = 3 bathroom doors
    expect(doorRes.bathroomDoorsCount).toBe(3);

    // Total doors = 1 + 6 + 3 = 10 doors
    expect(doorRes.totalDoorsCount).toBe(10);

    // Opening area: (1 * 28) + (6 * 21) + (3 * 17.5) = 28 + 126 + 52.5 = 206.5 sq.ft
    expect(doorRes.doorOpeningAreaSqFt).toBe(206.5);
  });

  it('2. Main door material change mutates rate/amount but preserves 100% geometric quantity invariance', () => {
    const baseline = calculateDoors(baseInput);
    const premiumInput: EngineInput = {
      ...baseInput,
      doors: {
        ...baseInput.doors,
        mainDoor: 'Burma Teak Custom Carved',
      },
    };
    const luxuryDoors = calculateDoors(premiumInput);

    // Quantities MUST remain identical
    expect(luxuryDoors.mainDoorsCount).toBe(baseline.mainDoorsCount);
    expect(luxuryDoors.internalDoorsCount).toBe(baseline.internalDoorsCount);
    expect(luxuryDoors.bathroomDoorsCount).toBe(baseline.bathroomDoorsCount);
    expect(luxuryDoors.totalDoorsCount).toBe(baseline.totalDoorsCount);
    expect(luxuryDoors.doorOpeningAreaSqFt).toBe(baseline.doorOpeningAreaSqFt);

    // Unit rate and amount MUST reflect luxury Burma teak (₹1,45,000 vs ₹65,000)
    const baselineMain = baseline.doorSchedule.find((d) => d.code === 'D-MAIN');
    const luxuryMain = luxuryDoors.doorSchedule.find((d) => d.code === 'D-MAIN');

    expect(baselineMain).toBeDefined();
    expect(luxuryMain).toBeDefined();
    expect(luxuryMain!.unitRate).toBeGreaterThan(baselineMain!.unitRate);
    expect(luxuryMain!.amount).toBe(145000);
  });

  it('3. Internal and bathroom door schedule entries match canonical codes and specifications', () => {
    const doorRes = calculateDoors(baseInput);
    const codes = doorRes.doorSchedule.map((d) => d.code);

    expect(codes).toContain('D-MAIN');
    expect(codes).toContain('D-INT');
    expect(codes).toContain('D-BATH');

    const intDoor = doorRes.doorSchedule.find((d) => d.code === 'D-INT')!;
    expect(intDoor.openingSize).toBe('3.0 ft × 7.0 ft');
    expect(intDoor.unit).toBe('Sets');
    expect(intDoor.quantity).toBe(6);

    const bathDoor = doorRes.doorSchedule.find((d) => d.code === 'D-BATH')!;
    expect(bathDoor.openingSize).toBe('2.5 ft × 7.0 ft');
    expect(bathDoor.unit).toBe('Sets');
    expect(bathDoor.quantity).toBe(3);
  });

  it('4. Authoritative Window schedule takeoff derives fenestration from room spaces', () => {
    const winRes = calculateWindows(baseInput);

    // Rooms: 3 bedrooms, 1 living (2 picture windows = 2), 1 kitchen, 3 bathrooms, 1 dining, 1 pooja, 1 utility
    // Total windows = 3 + 2 + 1 + 3 + 1 + 0 + 1 = 11 windows
    expect(winRes.windowsCount).toBe(11);

    // Bed: 3 * 20 = 60 sq.ft
    // Liv: 2 * 30 = 60 sq.ft
    // Kit: 1 * 12 = 12 sq.ft
    // Bath: 3 * 6 = 18 sq.ft
    // Din: 1 * 15 = 15 sq.ft
    // Utl: 1 * 8 = 8 sq.ft
    // Total = 60 + 60 + 12 + 18 + 15 + 8 = 173 sq.ft
    expect(winRes.windowAreaSqFt).toBe(173);

    // Schedule should include W-BED, W-LIV, W-KIT, W-BATH, W-DIN, W-UTL
    const codes = winRes.windowSchedule.map((w) => w.code);
    expect(codes).toContain('W-BED');
    expect(codes).toContain('W-LIV');
    expect(codes).toContain('W-KIT');
    expect(codes).toContain('W-BATH');
    expect(codes).toContain('W-DIN');
    expect(codes).toContain('W-UTL');
  });

  it('5. Window material change mutates unit rates while windowAreaSqFt and grillAreaSqFt remain 100% constant', () => {
    const uPVCRes = calculateWindows(baseInput);
    const woodInput: EngineInput = {
      ...baseInput,
      windows: {
        primaryMaterial: 'Wood',
        subGrade: 'Teak Wood Frame',
      },
    };
    const woodRes = calculateWindows(woodInput);

    // Quantities invariant
    expect(woodRes.windowsCount).toBe(uPVCRes.windowsCount);
    expect(woodRes.windowAreaSqFt).toBe(uPVCRes.windowAreaSqFt);
    expect(woodRes.grillAreaSqFt).toBe(uPVCRes.grillAreaSqFt);

    // Rates mutate (Teak Wood ₹950/sq.ft vs uPVC ₹850/sq.ft)
    const uPVCBed = uPVCRes.windowSchedule.find((w) => w.code === 'W-BED')!;
    const woodBed = woodRes.windowSchedule.find((w) => w.code === 'W-BED')!;

    expect(woodBed.unitRate).toBe(950);
    expect(woodBed.amount).toBe(60 * 950);
  });

  it('6. MS Safety Grilles area equals exactly 75% of total window area', () => {
    const winRes = calculateWindows(baseInput);
    expect(winRes.grillAreaSqFt).toBe(Math.round(winRes.windowAreaSqFt * 0.75));
  });

  it('7. Full BOQ includes Doors & Joinery (DJ) and Windows & Glazing (WG) line items', () => {
    const fullResult = runCalculator(baseInput);
    const boq = fullResult.boq;

    // Check Doors & Joinery lines
    const djLines = boq.filter((i) => i.code.startsWith('DJ') || i.category === 'Doors & Joinery');
    expect(djLines.length).toBeGreaterThan(0);

    // Must include door frames and SS hardware lock sets
    const frameItem = djLines.find((i) => i.description.includes('Door Frames'));
    expect(frameItem).toBeDefined();
    expect(frameItem!.unit).toBe('RM');

    const hardwareItem = djLines.find((i) => i.description.includes('SS Mortise Lock Sets'));
    expect(hardwareItem).toBeDefined();

    // Check Windows & Glazing lines
    const wgLines = boq.filter((i) => i.code.startsWith('WG') || i.category === 'Windows & Glazing');
    expect(wgLines.length).toBeGreaterThan(0);

    const grillItem = wgLines.find((i) => i.description.includes('MS Safety Grille'));
    expect(grillItem).toBeDefined();
    expect(grillItem!.quantity).toBe(fullResult.quantities.grillAreaSqFt);
  });

  it('8. Zero plot dimensions or zero floors safely return 0 doors and 0 windows with empty schedules', () => {
    const zeroInput: EngineInput = {
      ...baseInput,
      plotLength: 0,
      plotWidth: 0,
      floors: 0,
    };

    const doorRes = calculateDoors(zeroInput);
    expect(doorRes.totalDoorsCount).toBe(0);
    expect(doorRes.doorOpeningAreaSqFt).toBe(0);
    expect(doorRes.doorSchedule).toEqual([]);

    const winRes = calculateWindows(zeroInput);
    expect(winRes.windowsCount).toBe(0);
    expect(winRes.windowAreaSqFt).toBe(0);
    expect(winRes.grillAreaSqFt).toBe(0);
    expect(winRes.windowSchedule).toEqual([]);
  });

  it('9. useWizardStore mutators for space door and window overrides execute cleanly', () => {
    const store = useWizardStore.getState();

    // Space-by-space door override
    store.setSpaceDoor('space_bed_1', 'Laminate Door', 'internalDoor');
    expect(useWizardStore.getState().spaceDoorOverrides['space_bed_1']).toBe('Laminate Door');
    expect(useWizardStore.getState().doors.internalDoor).toBe('Laminate Door');

    // Space-by-space window override
    store.setSpaceWindow('space_liv_1', 'Powder Coated Jindal Aluminium');
    expect(useWizardStore.getState().spaceWindowOverrides['space_liv_1']).toBe('Powder Coated Jindal Aluminium');
    expect(useWizardStore.getState().windows.primaryMaterial).toBe('Aluminium');

    // Reset overrides
    store.clearSpaceDoorOverride('space_bed_1');
    expect(useWizardStore.getState().spaceDoorOverrides['space_bed_1']).toBeUndefined();

    store.clearSpaceWindowOverride('space_liv_1');
    expect(useWizardStore.getState().spaceWindowOverrides['space_liv_1']).toBeUndefined();
  });

  it('10. Live calculation store recalculates BOQ immediately when door or window selections change', () => {
    // Set plot dimensions, BUA, and floors so BUA and budget are positive
    useWizardStore.getState().setPlotDimensions(40, 30);
    useWizardStore.getState().setHouseConfig('Duplex', 3);
    useWizardStore.getState().setBuiltUpAreaPerFloor(840);
    useWizardStore.getState().setDoorSelection('mainDoor', 'Normal Teak');

    const initialCost = useCalculationStore.getState().result.budget.directConstructionBudget;
    expect(initialCost).toBeGreaterThan(0);

    // Mutate door to luxury Burma teak in wizard store
    useWizardStore.getState().setDoorSelection('mainDoor', 'Burma Teak Custom Carved');

    // Calculation store must have automatically recalculated via subscription
    const updatedCost = useCalculationStore.getState().result.budget.directConstructionBudget;
    expect(updatedCost).toBeGreaterThan(initialCost);

    // Restoring to normal teak
    useWizardStore.getState().setDoorSelection('mainDoor', 'Normal Teak');
    const restoredCost = useCalculationStore.getState().result.budget.directConstructionBudget;
    expect(restoredCost).toBe(initialCost);
  });
});
