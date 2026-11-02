import { describe, it, expect, beforeEach } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';
import { useWizardStore, SAMPLE_ROOM_CONFIG } from '../../store/useWizardStore';

describe('Hutty 3.1 — Phase 05: Task 2 Fabrication, Elevation & External Finishes Test Suite', () => {
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
    houseType: 'Duplex',
    floors: 3, // G+2 (3 floors)
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: false,
    liftRequired: false,
    rooms: {
      ...SAMPLE_ROOM_CONFIG,
      balcony: 2, // 2 balconies
    },
    qualityTier: 'Premium',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      doors: 'Premium Teak',
      windows: 'uPVC',
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
    fabrication: {
      staircaseRailing: 'SS 304 with Toughened Glass',
      balconyRailing: 'SS 304 with Toughened Glass',
      terraceRailing: 'MS Parapet Safety Extension Railing',
      mainGate: 'MS Designer Sliding / Swing Gate (10x6 ft)',
      tankLadder: 'GI / MS Cat Ladder with Safety Rungs',
      skylight: 'Laminated Safety Glass with Metal Frame (24 sq.ft)',
      balconyDoor: 'UPVC / Aluminium 2.5-Track French Sliding Door',
      elevationCladding: 'HPL / Stone Veneer Façade Cladding',
    },
  };

  beforeEach(() => {
    useWizardStore.getState().resetConfigurator?.();
  });

  it('1. Staircase railing derives correctly from number of floors ((floors - 1) * 24 Rft)', () => {
    const res = runCalculator(baseInput);
    // G+2 = 3 floors -> 2 upper flights -> 2 * 24 = 48 Rft
    expect(res.quantities.staircaseRailingRft).toBe(48);

    const stairItem = res.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Staircase'));
    expect(stairItem).toBeDefined();
    expect(stairItem?.quantity).toBe(48);
    expect(stairItem?.unit).toBe('Rft');
    expect(stairItem?.amount).toBe(48 * 1850);
  });

  it('2. Balcony railing derives from configured balcony count (balcony * 12 Rft)', () => {
    const res = runCalculator(baseInput);
    // 2 balconies -> 2 * 12 = 24 Rft
    expect(res.quantities.balconyRailingRft).toBe(24);

    const balcItem = res.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Balcony'));
    expect(balcItem).toBeDefined();
    expect(balcItem?.quantity).toBe(24);
    expect(balcItem?.amount).toBe(24 * 1650);
  });

  it('3. Main driveway gate, terrace railing, and tank ladder are generated in BOQ', () => {
    const res = runCalculator(baseInput);

    // Gate: 60 sq.ft
    const gateItem = res.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Gate'));
    expect(gateItem).toBeDefined();
    expect(gateItem?.quantity).toBe(60);
    expect(gateItem?.unit).toBe('Sq Ft');

    // Terrace Railing: 45 Rft
    const terraceItem = res.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Terrace'));
    expect(terraceItem).toBeDefined();
    expect(terraceItem?.quantity).toBe(45);
    expect(terraceItem?.unit).toBe('Rft');

    // Tank Ladder: 1 Unit
    const ladderItem = res.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Ladder'));
    expect(ladderItem).toBeDefined();
    expect(ladderItem?.quantity).toBe(1);
    expect(ladderItem?.unit).toBe('Units');
  });

  it('4. Balcony French sliding door and skylight unit are generated when configured', () => {
    const res = runCalculator(baseInput);

    // Balcony French sliding doors: 2 Sets
    const balcDoorItem = res.boq.find((i) => i.code.startsWith('DR') && i.description.includes('Balcony French'));
    expect(balcDoorItem).toBeDefined();
    expect(balcDoorItem?.quantity).toBe(2);
    expect(balcDoorItem?.unit).toBe('Sets');

    // Skylight: 1 Unit
    const skylightItem = res.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Skylight'));
    expect(skylightItem).toBeDefined();
    expect(skylightItem?.quantity).toBe(1);
    expect(skylightItem?.unit).toBe('Units');
  });

  it('5. Front façade architectural elevation cladding generates 180 sq.ft feature wall', () => {
    const res = runCalculator(baseInput);

    const cladItem = res.boq.find((i) => i.code.startsWith('EV') && i.description.includes('Cladding'));
    expect(cladItem).toBeDefined();
    expect(cladItem?.quantity).toBe(180);
    expect(cladItem?.unit).toBe('Sq Ft');
    expect(cladItem?.unitRate).toBe(280);
    expect(cladItem?.amount).toBe(180 * 280);
  });

  it('6. Mutating railing and gate materials updates rates and costs while quantities remain invariant', () => {
    const resSS = runCalculator(baseInput);

    // Switch to MS Designer railing and wrought iron gate
    const msInput: EngineInput = {
      ...baseInput,
      fabrication: {
        ...baseInput.fabrication!,
        staircaseRailing: 'MS Designer with Wooden Handrail',
        mainGate: 'Wrought Iron Cast Style Gate',
      },
    };
    const resMS = runCalculator(msInput);

    // Quantities invariant
    expect(resMS.quantities.staircaseRailingRft).toBe(resSS.quantities.staircaseRailingRft);
    expect(resMS.quantities.mainGateSqFt).toBe(resSS.quantities.mainGateSqFt);

    // Unit rates changed
    const msStair = resMS.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Staircase'));
    expect(msStair?.unitRate).toBe(1250);

    const msGate = resMS.boq.find((i) => i.code.startsWith('FB') && i.description.includes('Gate'));
    expect(msGate?.unitRate).toBe(650);
  });

  it('7. Fixture schedule includes metal fabrication and elevation items with matching amounts', () => {
    const res = runCalculator(baseInput);
    const fabFixtures = res.fixtureSchedule.filter((f) => f.category === 'Metal Fabrication & Railings');

    expect(fabFixtures.length).toBeGreaterThanOrEqual(4);
    const stairFixture = fabFixtures.find((f) => f.item.includes('Staircase'));
    expect(stairFixture).toBeDefined();
    expect(stairFixture?.amount).toBe(48 * 1850);
  });

  it('8. Zero-state project safely returns zero fabrication quantities and empty schedules', () => {
    const zeroInput: EngineInput = {
      ...baseInput,
      floors: 0,
      plotLength: 0,
      plotWidth: 0,
      builtUpAreaPerFloor: 0,
      userSelectedBUA: 0,
    };
    const res = runCalculator(zeroInput);

    expect(res.boq.length).toBe(0);
    expect(res.fixtureSchedule.length).toBe(0);
    expect(res.budget.totalProjectCost).toBe(0);
  });
});

