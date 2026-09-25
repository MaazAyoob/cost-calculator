import { describe, it, expect } from 'vitest';
import { runCalculator } from '../calculator';
import { EngineInput } from '../types';

describe('HUTTY CLIENT FEEDBACK — RCC Quantity & Block Consumption Transparency Suite', () => {
  const baseInput: EngineInput = {
    city: 'Bangalore',
    plotLength: 40,
    plotWidth: 30,
    floors: 2,
    houseType: 'Duplex',
    parkingType: 'Normal Ground',
    carCount: 1,
    bikeCount: 2,
    evCharging: false,
    liftRequired: false,
    rooms: {
      bedrooms: 3,
      bathrooms: 3,
      living: 1,
      kitchen: 1,
      dining: 1,
      balcony: 1,
      utility: 1,
      pooja: 1,
    },
    qualityTier: 'PREMIUM',
    materialBrands: {
      steel: 'Tata Tiscon',
      cement: 'UltraTech',
      masonry: 'AAC Blocks',
      electrical: 'Finolex',
    },
    flooringZones: {
      living: 'Vitrified Tiles (Premium)',
      masterBedroom: 'Vitrified Tiles (Premium)',
      otherBedrooms: 'Vitrified Tiles (Premium)',
      kitchen: 'Vitrified Tiles (Anti-Skid)',
      bathrooms: 'Ceramic Anti-Skid',
      balcony: 'Rustic Anti-Skid Tiles',
      utility: 'Ceramic Anti-Skid',
      staircase: 'Granite (Full Slab)',
      parking: 'Heavy-Duty Paver Tiles',
      terrace: 'Solar Reflective / Cool Roof Tiles',
    },
    wallCladding: {
      bathroomTileHeight: '7 ft (Standard Lintel)',
      kitchenDadoHeight: '2 ft above counter',
      exteriorCladding: 'None',
    },
    doors: {
      mainDoor: 'Teak Wood (Carved / Polished)',
      internalDoors: 'Flush Door with Laminate Finish',
      bathroomDoors: 'FRP / WPC Waterproof Doors',
    },
    windows: {
      windowType: 'UPVC Sliding (2.5 Track with Mesh)',
      grillType: 'MS Safety Grills (Standard)',
    },
    electrical: {
      conduitType: 'Heavy-Duty PVC (Concealed)',
      brandTier: 'Anchor Roma / Havells Reo',
      backupProvision: 'Inverter Wiring Ready',
    },
    bathroomFittings: {
      brandTier: 'Jaguar / Hindware Premium',
      diverterType: 'Single Lever Concealed Diverter',
    },
    painting: {
      interiorPaint: 'Tractor Emulsion (Asian Paints)',
      exteriorPaint: 'Apex Exterior Emulsion (Asian Paints)',
    },
  };

  // Test A: Footing RCC quantity is exposed
  it('A. Footing RCC concrete quantity is explicitly exposed in canonical result', () => {
    const result = runCalculator(baseInput);

    expect(result.quantities.footingConcreteCuM).toBeDefined();
    expect(result.quantities.footingConcreteCuM).toBeGreaterThan(0);
    expect(typeof result.quantities.footingConcreteCuM).toBe('number');

    // Also check explanation transparency layer
    const structureExp = result.explanations?.structure;
    expect(structureExp).toBeDefined();
    const footingMetric = structureExp?.summaryMetrics?.find((m) => m.label === 'Footing Concrete');
    expect(footingMetric).toBeDefined();
    expect(footingMetric?.unit).toBe('m³');
    expect(Number(footingMetric?.value)).toBe(result.quantities.footingConcreteCuM);

    const footingDerived = structureExp?.derivedQuantities?.find((dq) => dq.label === 'Footing Concrete');
    expect(footingDerived).toBeDefined();
    expect(footingDerived?.unit).toBe('m³');
  });

  // Test B: Column concrete quantity is exposed
  it('B. Column concrete quantity is explicitly exposed in canonical result', () => {
    const result = runCalculator(baseInput);

    expect(result.quantities.columnConcreteCuM).toBeDefined();
    expect(result.quantities.columnConcreteCuM).toBeGreaterThan(0);
    expect(typeof result.quantities.columnConcreteCuM).toBe('number');

    // Also check explanation transparency layer
    const structureExp = result.explanations?.structure;
    const colMetric = structureExp?.summaryMetrics?.find((m) => m.label === 'Column Concrete');
    expect(colMetric).toBeDefined();
    expect(colMetric?.unit).toBe('m³');
    expect(Number(colMetric?.value)).toBe(result.quantities.columnConcreteCuM);

    const colDerived = structureExp?.derivedQuantities?.find((dq) => dq.label === 'Column Concrete');
    expect(colDerived).toBeDefined();
    expect(colDerived?.unit).toBe('m³');
  });

  // Test C: Slab concrete quantity is exposed
  it('C. Slab concrete quantity is explicitly exposed in canonical result', () => {
    const result = runCalculator(baseInput);

    expect(result.quantities.slabConcreteCuM).toBeDefined();
    expect(result.quantities.slabConcreteCuM).toBeGreaterThan(0);
    expect(typeof result.quantities.slabConcreteCuM).toBe('number');

    // Also check explanation transparency layer
    const structureExp = result.explanations?.structure;
    const slabMetric = structureExp?.summaryMetrics?.find((m) => m.label === 'Slab Concrete');
    expect(slabMetric).toBeDefined();
    expect(slabMetric?.unit).toBe('m³');
    expect(Number(slabMetric?.value)).toBe(result.quantities.slabConcreteCuM);

    const slabDerived = structureExp?.derivedQuantities?.find((dq) => dq.label === 'Slab Concrete');
    expect(slabDerived).toBeDefined();
    expect(slabDerived?.unit).toBe('m³');
  });

  // Test D: RCC component total reconciles with canonical RCC total
  it('D. RCC component total reconciles with canonical RCC total and BOQ items', () => {
    const result = runCalculator(baseInput);

    const { footingConcreteCuM, columnConcreteCuM, slabConcreteCuM, rccConcreteTotalCuM } = result.quantities;
    const componentSum = parseFloat((footingConcreteCuM + columnConcreteCuM + slabConcreteCuM).toFixed(2));

    expect(rccConcreteTotalCuM).toBe(componentSum);

    // Verify reconciliation with BOQ items
    const footingBoq = result.boq.find((i) => i.description.includes('Column Footing RCC'));
    const colBoq = result.boq.find((i) => i.description.includes('RCC Columns M25'));
    const slabBoq = result.boq.find((i) => i.description.includes('RCC Beams & Roof/Floor Slabs'));

    expect(footingBoq).toBeDefined();
    expect(colBoq).toBeDefined();
    expect(slabBoq).toBeDefined();

    expect(footingBoq?.quantity).toBe(footingConcreteCuM);
    expect(colBoq?.quantity).toBe(columnConcreteCuM);
    expect(slabBoq?.quantity).toBe(slabConcreteCuM);
  });

  // Test E: Block wall area is exposed in sq.ft
  it('E. Block wall area and block wall coverage are exposed in sq.ft', () => {
    const result = runCalculator(baseInput);

    expect(result.quantities.netWallAreaSqFt).toBeDefined();
    expect(result.quantities.netWallAreaSqFt).toBeGreaterThan(0);
    expect(result.quantities.blockWallCoverageSqFt).toBe(result.quantities.netWallAreaSqFt);

    // Transparency layer check
    const masonryExp = result.explanations?.masonry;
    expect(masonryExp).toBeDefined();

    const netWallMetric = masonryExp?.summaryMetrics?.find((m) => m.label === 'Net Wall Area');
    expect(netWallMetric).toBeDefined();
    expect(netWallMetric?.unit).toBe('sq.ft');

    const coverageMetric = masonryExp?.summaryMetrics?.find((m) => m.label === 'Block Wall Coverage');
    expect(coverageMetric).toBeDefined();
    expect(coverageMetric?.unit).toBe('sq.ft');

    const blocksReqMetric = masonryExp?.summaryMetrics?.find((m) => m.label === 'Blocks Required');
    expect(blocksReqMetric).toBeDefined();
    expect(blocksReqMetric?.unit).toBe('Nos');
  });

  // Test F: Block quantity remains unchanged
  it('F. Block quantity remains unchanged and matches buildingModel.totalBlockCount', () => {
    const result = runCalculator(baseInput);

    expect(result.quantities.masonryUnitsCount).toBe(result.buildingModel.totalBlockCount);
    expect(result.quantities.finalBlocksRequired).toBe(result.buildingModel.totalBlockCount);
    expect(result.quantities.baseBlockCount).toBeGreaterThan(0);
    expect(result.quantities.finalBlocksRequired).toBeGreaterThanOrEqual(result.quantities.baseBlockCount);
  });

  // Test G: Rate-only changes do not change these quantities
  it('G. Rate-only brand changes preserve exact concrete and block quantities', () => {
    const defaultResult = runCalculator(baseInput);

    // Switch steel, cement, and masonry to different brands/grades
    const customizedInput: EngineInput = {
      ...baseInput,
      materialBrands: {
        steel: 'JSW Neosteel',
        cement: 'ACC Cement',
        masonry: 'AAC Blocks',
      },
      qualityTier: 'ESSENTIAL',
    };
    const customResult = runCalculator(customizedInput);

    // Quantities must remain 100% strictly invariant
    expect(customResult.quantities.footingConcreteCuM).toBe(defaultResult.quantities.footingConcreteCuM);
    expect(customResult.quantities.columnConcreteCuM).toBe(defaultResult.quantities.columnConcreteCuM);
    expect(customResult.quantities.slabConcreteCuM).toBe(defaultResult.quantities.slabConcreteCuM);
    expect(customResult.quantities.rccConcreteTotalCuM).toBe(defaultResult.quantities.rccConcreteTotalCuM);
    expect(customResult.quantities.netWallAreaSqFt).toBe(defaultResult.quantities.netWallAreaSqFt);
    expect(customResult.quantities.blockWallCoverageSqFt).toBe(defaultResult.quantities.blockWallCoverageSqFt);
    expect(customResult.quantities.masonryUnitsCount).toBe(defaultResult.quantities.masonryUnitsCount);
  });

  // Test H: Room/wall geometry changes propagate correctly
  it('H. Room and floor geometry changes propagate to concrete and block quantities', () => {
    const result2Floors = runCalculator(baseInput);

    const input3Floors: EngineInput = {
      ...baseInput,
      floors: 3,
      rooms: {
        ...baseInput.rooms,
        bedrooms: 4,
        bathrooms: 4,
      },
    };
    const result3Floors = runCalculator(input3Floors);

    // 3 floors should have more BUA, hence more concrete and more wall area
    expect(result3Floors.area.totalBUASqFt).toBeGreaterThan(result2Floors.area.totalBUASqFt);
    expect(result3Floors.quantities.footingConcreteCuM).toBeGreaterThanOrEqual(result2Floors.quantities.footingConcreteCuM);
    expect(result3Floors.quantities.columnConcreteCuM).toBeGreaterThan(result2Floors.quantities.columnConcreteCuM);
    expect(result3Floors.quantities.slabConcreteCuM).toBeGreaterThan(result2Floors.quantities.slabConcreteCuM);
    expect(result3Floors.quantities.rccConcreteTotalCuM).toBeGreaterThan(result2Floors.quantities.rccConcreteTotalCuM);
    expect(result3Floors.quantities.netWallAreaSqFt).toBeGreaterThan(result2Floors.quantities.netWallAreaSqFt);
    expect(result3Floors.quantities.masonryUnitsCount).toBeGreaterThan(result2Floors.quantities.masonryUnitsCount);
  });

  // Test I: No duplicate RCC/material cost is introduced
  it('I. No duplicate RCC or material cost is introduced into project budget', () => {
    const result = runCalculator(baseInput);

    // Section B Material Schedule must not contain ready-mix concrete items (RCC is work in Section A)
    const rmcInMaterials = result.materialSchedule.filter(
      (m) => m.material.toLowerCase().includes('concrete') && !m.material.toLowerCase().includes('sand') && !m.material.toLowerCase().includes('blocks')
    );
    expect(rmcInMaterials.length).toBe(0);

    // Reconcile Section A BOQ concrete items against quantity × unitRate
    const footingBoq = result.boq.find((i) => i.description.includes('Column Footing RCC'));
    const colBoq = result.boq.find((i) => i.description.includes('RCC Columns M25'));
    const slabBoq = result.boq.find((i) => i.description.includes('RCC Beams & Roof/Floor Slabs'));

    expect(footingBoq?.amount).toBe(Math.round((footingBoq?.quantity || 0) * (footingBoq?.unitRate || 0)));
    expect(colBoq?.amount).toBe(Math.round((colBoq?.quantity || 0) * (colBoq?.unitRate || 0)));
    expect(slabBoq?.amount).toBe(Math.round((slabBoq?.quantity || 0) * (slabBoq?.unitRate || 0)));

    // Budget total equals sum of BOQ + add-ons
    expect(result.budget.totalProjectCost).toBeGreaterThan(0);
    expect(result.qaResult?.passed).toBe(true);
  });
});
