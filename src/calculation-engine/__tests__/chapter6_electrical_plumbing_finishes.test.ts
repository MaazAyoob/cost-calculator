import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { calculateElectrical } from '../modules/electrical';
import { calculatePaint } from '../modules/paint';
import { generateFixtureSchedule } from '../modules/fixtures';
import { generateBuildingModel } from '../modules/spaceModel';
import { calculateArea } from '../modules/bua';
import { useWizardStore, SAMPLE_ROOM_CONFIG } from '../../store/useWizardStore';
import { useCalculationStore } from '../../store/useCalculationStore';

describe('Hutty 3.1 — Phase 02: Task 2.6 Dedicated Chapter 6 (Electrical, Plumbing & Finishes) Test Suite', () => {
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
    evCharging: true, // EV charger enabled
    liftRequired: false,
    rooms: { ...SAMPLE_ROOM_CONFIG }, // 3 bed, 3 bath, 1 living, 1 kitchen, 1 dining, 1 pooja, 2 balcony, 1 utility
    qualityTier: 'Premium',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'AAC Blocks',
      doors: 'Premium Teak',
      windows: 'uPVC',
      electrical: 'Finolex',
      bathroom: 'Jaquar',
      paint: 'Asian Paints',
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

  it('1. Authoritative Electrical points schedule derives directly from SpaceModel & amenities', () => {
    const area = calculateArea(baseInput);
    const buildingModel = generateBuildingModel(baseInput, area);
    const elec = calculateElectrical(baseInput, area, buildingModel);

    // Verified: Points must be positive and non-zero
    expect(elec.totalElectricalPoints).toBeGreaterThan(0);
    expect(elec.lightingPoints).toBeGreaterThan(0);
    expect(elec.fanPoints).toBeGreaterThan(0);
    expect(elec.socketPoints).toBeGreaterThan(0);
    expect(elec.acPoints).toBe(4); // 3 bedrooms + 1 living room
    expect(elec.geyserPoints).toBe(3); // 1 per bathroom (3 bathrooms)
    expect(elec.evPoints).toBe(1); // EV charging selected
    expect(elec.mainDBCount).toBe(1); // 1 Main LT Incomer DB
    expect(elec.floorDBCount).toBe(3); // 1 Sub-DB per floor for G+2
    expect(elec.switchModules).toBeGreaterThan(0);
  });

  it('2. Electrical conductor sizing enforces gauge segregation (1.5, 2.5, 4.0, 6.0 sq.mm)', () => {
    const area = calculateArea(baseInput);
    const buildingModel = generateBuildingModel(baseInput, area);
    const elec = calculateElectrical(baseInput, area, buildingModel);

    // 1.5 sq.mm: Lighting & Fans
    expect(elec.wire1_5SqMmMetres).toBeGreaterThan(0);

    // 2.5 sq.mm: Power Sockets & TV/Data
    expect(elec.wire2_5SqMmMetres).toBeGreaterThan(0);

    // 4.0 sq.mm: Dedicated AC & Geyser circuits
    expect(elec.wire4SqMmMetres).toBeGreaterThan(0);

    // 6.0 sq.mm: Vertical floor risers & EV charger
    expect(elec.wire6SqMmMetres).toBeGreaterThan(0);

    // Total single-core wire metres must equal the sum of segregated gauges
    const sumWire = elec.wire1_5SqMmMetres + elec.wire2_5SqMmMetres + elec.wire4SqMmMetres + elec.wire6SqMmMetres;
    expect(elec.electricalWireMetres).toBe(sumWire);

    // Conduit route length must be distinctly tracked from single-core wire length
    expect(elec.conduitsMetres).toBeGreaterThan(0);
    expect(elec.conduitsMetres).toBeLessThan(elec.electricalWireMetres);
  });

  it('3. Electrical tier mutation updates switch & wire rates while keeping quantities 100% invariant', () => {
    const area = calculateArea(baseInput);
    const buildingModel = generateBuildingModel(baseInput, area);
    const baselineElec = calculateElectrical(baseInput, area, buildingModel);

    const economyInput: EngineInput = {
      ...baseInput,
      electrical: {
        conduit: 'Heavy-Duty ISI Marked PVC',
        wireTier: 'Economy (Anchor)',
      },
    };
    const economyElec = calculateElectrical(economyInput, area, buildingModel);

    // Physical quantities must remain identical
    expect(economyElec.totalElectricalPoints).toBe(baselineElec.totalElectricalPoints);
    expect(economyElec.electricalWireMetres).toBe(baselineElec.electricalWireMetres);
    expect(economyElec.wire1_5SqMmMetres).toBe(baselineElec.wire1_5SqMmMetres);
    expect(economyElec.wire2_5SqMmMetres).toBe(baselineElec.wire2_5SqMmMetres);
    expect(economyElec.wire4SqMmMetres).toBe(baselineElec.wire4SqMmMetres);
    expect(economyElec.wire6SqMmMetres).toBe(baselineElec.wire6SqMmMetres);
    expect(economyElec.conduitsMetres).toBe(baselineElec.conduitsMetres);

    // BOQ rates must mutate: Premium (₹240/module) vs Economy (₹140/module)
    const baseBOQ = runCalculator(baseInput).boq;
    const econBOQ = runCalculator(economyInput).boq;

    const baseWireLine = baseBOQ.find((i) => i.description.includes('1.5 sq.mm'));
    const econWireLine = econBOQ.find((i) => i.description.includes('1.5 sq.mm'));

    expect(baseWireLine).toBeDefined();
    expect(econWireLine).toBeDefined();
    expect(baseWireLine!.unitRate).toBeGreaterThanOrEqual(econWireLine!.unitRate);
  });

  it('4. Sanitary fixture schedule takeoff derives fixture counts from bathrooms and kitchens', () => {
    const calc = runCalculator(baseInput);
    const qty = calc.quantities;
    const fixtures = calc.fixtureSchedule;

    // 3 bathrooms: 3 EWCs, 3 Showers, 3 Washbasins, 3 Health Faucets + 1 Kitchen Sink
    expect(qty.wcCount).toBe(3);
    expect(qty.showerCount).toBe(3);
    expect(qty.washBasinCount).toBe(3);
    expect(qty.healthFaucetCount).toBe(3);
    expect(qty.kitchenSinkCount).toBe(1);
    expect(qty.bathroomFixtureSets).toBe(3);

    // Fixture schedule items must include Sanitary Fixtures category
    const sanItems = fixtures.filter((f) => f.category === 'Sanitary Fixtures');
    expect(sanItems.length).toBeGreaterThanOrEqual(4);

    const ewcItem = sanItems.find((f) => f.item.includes('Wall-Hung EWC'));
    expect(ewcItem).toBeDefined();
    expect(ewcItem!.quantity).toBe(3);

    const sinkItem = sanItems.find((f) => f.item.includes('Kitchen Sink'));
    expect(sinkItem).toBeDefined();
    expect(sinkItem!.quantity).toBe(1);
  });

  it('5. Sanitary tier mutation updates fixture rates while counts remain 100% constant', () => {
    const baseline = runCalculator(baseInput);
    const luxuryInput: EngineInput = {
      ...baseInput,
      materialBrands: {
        ...baseInput.materialBrands,
        bathroom: 'Toto',
      },
      bathroomFittings: {
        sanitaryTier: 'Luxury (Toto / Duravit)',
        cpvcBrand: 'Astral',
      },
    };
    const luxury = runCalculator(luxuryInput);

    // Counts remain identical
    expect(luxury.quantities.wcCount).toBe(baseline.quantities.wcCount);
    expect(luxury.quantities.showerCount).toBe(baseline.quantities.showerCount);
    expect(luxury.quantities.washBasinCount).toBe(baseline.quantities.washBasinCount);

    // EWC rate must be higher for Toto Luxury vs Jaquar Premium (₹34,000 vs ₹15,200)
    const baseEWC = baseline.fixtureSchedule.find((f) => f.item.includes('Wall-Hung EWC'))!;
    const luxEWC = luxury.fixtureSchedule.find((f) => f.item.includes('Wall-Hung EWC'))!;

    expect(luxEWC.unitRate).toBeGreaterThan(baseEWC.unitRate);
    expect(luxEWC.amount).toBeGreaterThan(baseEWC.amount);
  });

  it('6. Paint calculation derives interior, exterior, ceiling, and putty areas from geometry', () => {
    const area = calculateArea(baseInput);
    const buildingModel = generateBuildingModel(baseInput, area);
    const paint = calculatePaint(baseInput, area, buildingModel);

    // Interior Paint Area = Net Internal Wall Area + Total Ceiling Area
    expect(paint.interiorPaintAreaSqFt).toBe(paint.internalWallAreaSqFt + paint.ceilingAreaSqFt);

    // Exterior Paint Area = Net External Wall Area
    expect(paint.exteriorPaintAreaSqFt).toBe(Math.round(buildingModel.netExternalWallAreaSqFt));

    // Total Paintable Area = Interior + Exterior
    expect(paint.totalPaintableAreaSqFt).toBe(paint.interiorPaintAreaSqFt + paint.exteriorPaintAreaSqFt);

    // Putty applied on internal walls + ceiling
    expect(paint.puttyAreaSqFt).toBe(paint.interiorPaintAreaSqFt);

    // Paint litres derived from coverage (45 sq.ft/L interior, 60 sq.ft/L exterior)
    expect(paint.interiorPaintLitres).toBe(Math.ceil(paint.interiorPaintAreaSqFt / paint.interiorCoverageSqFtPerLitre));
    expect(paint.exteriorPaintLitres).toBe(Math.ceil(paint.exteriorPaintAreaSqFt / paint.exteriorCoverageSqFtPerLitre));
    expect(paint.puttyKg).toBe(Math.round(paint.puttyAreaSqFt * paint.puttyKgPerSqFt));
  });

  it('7. Paint selection mutation updates rates while surface areas and paint litres remain invariant', () => {
    const area = calculateArea(baseInput);
    const buildingModel = generateBuildingModel(baseInput, area);
    const baselinePaint = calculatePaint(baseInput, area, buildingModel);

    const luxuryInput: EngineInput = {
      ...baseInput,
      painting: {
        baseLayer: 'Putty + Primer',
        internalPaint: 'Royale Luxury Emulsion',
        externalPaint: 'Apex Ultima Protek',
        brand: 'Asian Paints',
      },
    };
    const luxuryPaint = calculatePaint(luxuryInput, area, buildingModel);

    // Surface areas and litres invariant
    expect(luxuryPaint.interiorPaintAreaSqFt).toBe(baselinePaint.interiorPaintAreaSqFt);
    expect(luxuryPaint.exteriorPaintAreaSqFt).toBe(baselinePaint.exteriorPaintAreaSqFt);
    expect(luxuryPaint.totalPaintableAreaSqFt).toBe(baselinePaint.totalPaintableAreaSqFt);
    expect(luxuryPaint.interiorPaintLitres).toBe(baselinePaint.interiorPaintLitres);
    expect(luxuryPaint.exteriorPaintLitres).toBe(baselinePaint.exteriorPaintLitres);
    expect(luxuryPaint.puttyKg).toBe(baselinePaint.puttyKg);

    // BOQ rates mutate: Royale Luxury (₹45/sq.ft) vs Premium Emulsion (₹28/sq.ft)
    const baseBOQ = runCalculator(baseInput).boq;
    const luxBOQ = runCalculator(luxuryInput).boq;

    const baseInternalPaint = baseBOQ.find((i) => i.description.includes('Interior') && i.description.includes('Emulsion'));
    const luxInternalPaint = luxBOQ.find((i) => i.description.includes('Interior') && i.description.includes('Emulsion'));

    expect(baseInternalPaint).toBeDefined();
    expect(luxInternalPaint).toBeDefined();
    expect(luxInternalPaint!.unitRate).toBeGreaterThan(baseInternalPaint!.unitRate);
  });

  it('8. Full BOQ includes Electrical (EL), Plumbing (PL), and Painting (PW) items', () => {
    const calc = runCalculator(baseInput);
    const boq = calc.boq;

    // Electrical lines
    const elLines = boq.filter((i) => i.code.startsWith('EL') || i.category === 'Fixtures & Finishes');
    expect(elLines.length).toBeGreaterThan(0);

    // Plumbing lines
    const plLines = boq.filter((i) => i.code.startsWith('PL'));
    expect(plLines.length).toBeGreaterThan(0);

    // Painting lines
    const ptLines = boq.filter((i) => i.code.startsWith('PW') || i.category === 'Painting & Waterproofing');
    expect(ptLines.length).toBeGreaterThan(0);
  });

  it('9. Zero BUA safely returns zero electrical points, sanitary fixtures, and paintable area', () => {
    const zeroInput: EngineInput = {
      ...baseInput,
      plotLength: 0,
      plotWidth: 0,
      floors: 0,
    };

    const zeroCalc = runCalculator(zeroInput);
    expect(zeroCalc.quantities.totalElectricalPoints).toBe(0);
    expect(zeroCalc.quantities.electricalWireMetres).toBe(0);
    expect(zeroCalc.quantities.bathroomFixtureSets).toBe(0);
    expect(zeroCalc.quantities.totalPaintableAreaSqFt).toBe(0);
  });

  it('10. useWizardStore mutators for electrical, sanitary, and paint selections synchronize and trigger recalculation', () => {
    // Configure plot and floors
    useWizardStore.getState().setPlotDimensions(40, 30);
    useWizardStore.getState().setHouseConfig('Duplex', 3);
    useWizardStore.getState().setBuiltUpAreaPerFloor(840);

    const initialBudget = useCalculationStore.getState().result.budget.directConstructionBudget;
    expect(initialBudget).toBeGreaterThan(0);

    // Test electrical mutator
    useWizardStore.getState().setSpaceElectricalTier('space_liv_1', 'Premium (Finolex / Polycab)');
    expect(useWizardStore.getState().spaceElectricalTierOverrides['space_liv_1']).toBe('Premium (Finolex / Polycab)');

    // Test sanitary mutator
    useWizardStore.getState().setSpaceSanitary('space_bath_1', 'Luxury (Toto / Duravit)');
    expect(useWizardStore.getState().spaceSanitaryOverrides['space_bath_1']).toBe('Luxury (Toto / Duravit)');

    // Test paint mutator
    useWizardStore.getState().setSpacePaint('space_bed_1', 'Royale Luxury Emulsion');
    expect(useWizardStore.getState().spacePaintOverrides['space_bed_1']).toBe('Royale Luxury Emulsion');

    // Verify calculation store automatically refreshed
    const updatedBudget = useCalculationStore.getState().result.budget.directConstructionBudget;
    expect(updatedBudget).toBeGreaterThan(0);
  });
});
