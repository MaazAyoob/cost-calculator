// ============================================================
// MATERIAL SCHEDULE & PROCUREMENT MODULE – SECTION B: WHAT WE CONSUME
// Strictly follows Hutty Pilot Specification (Section 7, 25, 26)
//
// Rules:
// - Physical materials: Steel, Cement, M-Sand, P-Sand, Coarse Aggregate,
//   AAC Blocks/Bricks, Floor Tiles, Wall Tiles, Paint, Waterproofing, Pipes, Wire.
// - NO separate "Concrete Material" line (RCC is a construction work in Section A).
// - Consumes physical quantities directly from the single calculation engine.
// - Material/Brand selection changes the rate while preserving physical quantity.
// ============================================================

import {
  EngineInput,
  MaterialQuantities,
  MaterialScheduleItem,
  ProcurementItem,
} from '../types';
import { getBrandRate, getElectricalWireRate } from '../data/brandDatabase';
import { rateService } from '../data/rateService';

export function generateMaterialSchedule(
  input: EngineInput,
  qty: MaterialQuantities
): MaterialScheduleItem[] {
  const { materialBrands, flooringZones, painting } = input;
  const ctx = {
    packageTier: ((input as any).packageTier || input.qualityTier || 'STANDARD').toUpperCase(),
    location: input.city || 'Bangalore',
  };
  const items: MaterialScheduleItem[] = [];
  let slNo = 0;

  if (qty.steelKg <= 0 && qty.cementBags <= 0) {
    return [];
  }

  // 1. TMT Rebar Steel
  const steelBrand = materialBrands?.steel || 'Tata Tiscon';
  const defaultSteelRate = getBrandRate('steel', steelBrand) || 74000;
  const steelRes = rateService.getEffectiveResult('steel.fe550d_tmt', ctx);
  const steelRatePerTonne = steelRes.sourceType !== 'BASELINE' && steelRes.sourceType !== 'FALLBACK'
    ? steelRes.effectiveRate
    : defaultSteelRate;
  slNo++;
  items.push({
    slNo,
    material: 'TMT Reinforcement Steel (Fe 550D / Fe 500D)',
    category: 'Rebar',
    brand: steelBrand,
    specification: 'IS 1786 certified, high ductility corrosion-resistant thermo-mechanically treated rebar',
    quantity: qty.steelTonnes,
    unit: 'Tonne',
    unitRate: steelRatePerTonne,
    amount: Math.round(qty.steelTonnes * steelRatePerTonne),
    sourceFormula: `Total BUA × Steel Factor (${qty.steelFactorKgPerSqFt} kg/sqft) ÷ 1000`,
  });

  // 2. Portland Cement (50 kg bags)
  const cementBrand = materialBrands?.cement || 'UltraTech';
  const defaultCementRate = getBrandRate('cement', cementBrand) || 420;
  const cementRes = rateService.getEffectiveResult('cement.opc53_grade', ctx);
  const cementRatePerBag = cementRes.sourceType !== 'BASELINE' && cementRes.sourceType !== 'FALLBACK'
    ? cementRes.effectiveRate
    : defaultCementRate;
  slNo++;
  items.push({
    slNo,
    material: 'Portland Cement (OPC 53 Grade / PPC)',
    category: 'Cement',
    brand: cementBrand,
    specification: 'IS 269 / IS 1489 certified 50 kg moisture-proof sealed bags',
    quantity: qty.cementBags,
    unit: 'Bags (50 kg)',
    unitRate: cementRatePerBag,
    amount: qty.cementBags * cementRatePerBag,
    sourceFormula: 'Total BUA × 0.40 bags/sqft (Pilot Specification Section 8)',
  });

  // 3. Manufactured Sand (M-Sand)
  const mSandRate = rateService.getEffectiveRate('aggregate.msand_zone2', ctx, 65);
  slNo++;
  items.push({
    slNo,
    material: 'Manufactured Concrete Sand (M-Sand Zone II)',
    category: 'Aggregates',
    brand: 'Licensed Quarry Standard',
    specification: 'Zone II double-washed cubical shape manufactured sand, silt content < 3%',
    quantity: qty.mSandCuFt,
    unit: 'Cu Ft',
    unitRate: mSandRate,
    amount: qty.mSandCuFt * mSandRate,
    sourceFormula: 'Total BUA × 0.60 CFT/sqft (Pilot Specification Section 9)',
  });

  // 4. Plaster Sand (P-Sand)
  const pSandRate = rateService.getEffectiveRate('aggregate.psand_fine', ctx, 70);
  slNo++;
  items.push({
    slNo,
    material: 'Fine Plaster Sand (P-Sand)',
    category: 'Aggregates',
    brand: 'Licensed Quarry Standard',
    specification: 'Zone IV ultra-fine washed plastering sand for smooth internal & external wall finish',
    quantity: qty.pSandCuFt,
    unit: 'Cu Ft',
    unitRate: pSandRate,
    amount: qty.pSandCuFt * pSandRate,
    sourceFormula: 'Total BUA × 0.60 CFT/sqft (Pilot Specification Section 10)',
  });

  // 5. Coarse Aggregate (20mm & 12mm)
  const coarseAggRate = rateService.getEffectiveRate('aggregate.coarse_granite', ctx, 52);
  slNo++;
  items.push({
    slNo,
    material: 'Coarse Metal Blue Granite Aggregate (20mm & 12mm)',
    category: 'Aggregates',
    brand: 'Crushed Granite Standard',
    specification: 'IS 383 angular crushed blue metal granite aggregate (60:40 20mm/12mm blend)',
    quantity: qty.coarseAggregateCuFt,
    unit: 'Cu Ft',
    unitRate: coarseAggRate,
    amount: qty.coarseAggregateCuFt * coarseAggRate,
    sourceFormula: 'Total BUA × 1.35 CFT/sqft (Pilot Specification Section 11)',
  });

  // 6. Selected Masonry Material (AAC Blocks OR Clay Bricks OR Concrete Blocks)
  const isClay = qty.masonryMaterial === 'Clay Bricks' || materialBrands?.masonry?.includes('Clay') || materialBrands?.masonry?.includes('Brick');
  const isConcrete = qty.masonryMaterial === 'Concrete Blocks' || materialBrands?.masonry?.includes('Concrete') || materialBrands?.masonry?.includes('Cement Block');

  let masonryName = 'Autoclaved Aerated Concrete (AAC) Blocks';
  let masonryBrandName = qty.masonryBrand || materialBrands?.masonry || 'Birla Aerocon / Godrej Grade 1';
  let masonrySpec = `IS 2185 Part 3, ${qty.masonrySizeLabel || '600×200×150mm'}, oven-dry density 600 kg/m3 (5% wastage)`;
  let masonryUnit = 'Nos';
  let masonryRate = qty.masonryUnitRate || 85;
  let masonryFormula = `Masonry Vol (${qty.masonryVolumeCuM || qty.wallVolumeCuM} Cu.M) ÷ Block Vol (0.018 Cu.M) × 1.05`;

  if (isClay) {
    masonryName = 'Wirecut Red Clay Bricks (IS 1077)';
    masonryBrandName = qty.masonryBrand || materialBrands?.masonry || 'Standard Red Clay Standard';
    masonrySpec = `IS 1077 modular wirecut red clay bricks (${qty.masonrySizeLabel || '190×90×90mm'}), compressive strength > 10 N/mm2 (7% wastage)`;
    masonryFormula = `Masonry Vol (${qty.masonryVolumeCuM || qty.wallVolumeCuM} Cu.M) ÷ Brick Vol (0.001539 Cu.M) × 1.07`;
    masonryRate = qty.masonryUnitRate || 12;
  } else if (isConcrete) {
    masonryName = 'Solid Concrete / Cement Blocks (IS 2185 Part 1)';
    masonryBrandName = qty.masonryBrand || materialBrands?.masonry || 'Solid Concrete Blocks Standard';
    masonrySpec = `IS 2185 Part 1 hydraulic compressed solid concrete blocks (${qty.masonrySizeLabel || '400×200×150mm'}) (5% wastage)`;
    masonryFormula = `Masonry Vol (${qty.masonryVolumeCuM || qty.wallVolumeCuM} Cu.M) ÷ Block Vol (0.012 Cu.M) × 1.05`;
    masonryRate = qty.masonryUnitRate || 52;
  }

  const masonryCount = qty.masonryUnitsCount || qty.aacBlocksPieces;
  const masonryAmount = Math.round(masonryCount * masonryRate);

  slNo++;
  items.push({
    slNo,
    material: masonryName,
    category: 'Masonry',
    brand: masonryBrandName,
    specification: masonrySpec,
    quantity: masonryCount,
    unit: masonryUnit,
    unitRate: masonryRate,
    amount: masonryAmount,
    sourceFormula: masonryFormula,
  });

  // 7. Floor Tiles & Slabs
  const floorBrand = materialBrands?.flooring || flooringZones?.living || 'Vitrified Tiles';
  let tileRate = 110;
  if (floorBrand.includes('Marble')) tileRate = 420;
  else if (floorBrand.includes('Granite')) tileRate = 220;
  else if (materialBrands?.flooring) tileRate = getBrandRate('flooring', materialBrands.flooring) || tileRate;

  slNo++;
  items.push({
    slNo,
    material: 'Vitrified Floor Tiles & Living Surface Cladding',
    category: 'Flooring',
    brand: floorBrand,
    specification: 'Double-charged vitrified tiles / granite slabs with 7% cutting buffer',
    quantity: qty.floorTilesSqFt,
    unit: 'Sq Ft',
    unitRate: tileRate,
    amount: qty.floorTilesSqFt * tileRate,
    sourceFormula: 'Sum of configured space floor areas × 1.07 (7% cutting wastage)',
  });

  // 8. Wall Dado Tiles
  if (qty.wallTilesSqFt > 0) {
    slNo++;
    items.push({
      slNo,
      material: 'Ceramic Wall Dado & Kitchen Splashback Tiles',
      category: 'Flooring',
      brand: 'Kajaria / Somany Satin Wall',
      specification: '600×300mm digital glazed wall tiles for bathroom wet walls and kitchen counter',
      quantity: qty.wallTilesSqFt,
      unit: 'Sq Ft',
      unitRate: 85,
      amount: qty.wallTilesSqFt * 85,
      sourceFormula: 'Bathroom Perimeter × Dado Height + Kitchen Counter × Backsplash Height − Openings',
    });
  }

  // 9. Interior Paint
  const paintBrand = materialBrands?.paint || painting?.brand || 'Asian Paints';
  let intPaintRate = 380; // ₹/Litre
  if (painting?.internalPaint === 'Royale Luxury Emulsion') intPaintRate = 580;
  else if (painting?.internalPaint === 'Tractor Emulsion') intPaintRate = 220;

  slNo++;
  items.push({
    slNo,
    material: 'Interior Wall & Ceiling Emulsion Paint',
    category: 'Paint',
    brand: paintBrand,
    specification: `${painting?.internalPaint || 'Premium Emulsion'} (2 coats over putty primer)`,
    quantity: qty.interiorPaintLitres,
    unit: 'Litres',
    unitRate: intPaintRate,
    amount: qty.interiorPaintLitres * intPaintRate,
    sourceFormula: `Internal Paintable Area (${qty.interiorPaintAreaSqFt} sq.ft) ÷ 45 sq.ft/L`,
  });

  // 10. Exterior Weatherproof Paint
  slNo++;
  items.push({
    slNo,
    material: 'Exterior Anti-Fungal Weatherproof Emulsion',
    category: 'Paint',
    brand: `${paintBrand} Apex Ultima`,
    specification: 'Silicone acrylic elastomeric exterior weather coating (7-year warranty)',
    quantity: qty.exteriorPaintLitres,
    unit: 'Litres',
    unitRate: 420,
    amount: qty.exteriorPaintLitres * 420,
    sourceFormula: `External Paintable Area (${qty.exteriorPaintAreaSqFt} sq.ft) ÷ 60 sq.ft/L`,
  });

  // 11. Acrylic Wall Putty
  slNo++;
  items.push({
    slNo,
    material: 'White Polymer Modified Acrylic Wall Putty',
    category: 'Paint',
    brand: 'Birla White / JK WallMaxx',
    specification: 'Water-resistant white cement based smooth surface leveling coat',
    quantity: qty.puttyKg,
    unit: 'Kg',
    unitRate: 32,
    amount: qty.puttyKg * 32,
    sourceFormula: `Internal Surface Area (${qty.puttyAreaSqFt} sq.ft) × 0.55 kg/sqft`,
  });

  // 12. Waterproofing Elastomeric Compound
  if (qty.waterproofingAreaSqFt > 0) {
    slNo++;
    items.push({
      slNo,
      material: '2-Component Polymer Elastomeric Waterproofing Membrane',
      category: 'Waterproofing',
      brand: 'Dr. Fixit Fastflex 2C / SikaTop Seal 107',
      specification: 'Flexible cementitious waterproof coating for sunken slabs, terrace, and sump',
      quantity: qty.waterproofingAreaSqFt,
      unit: 'Sq Ft',
      unitRate: 65,
      amount: qty.waterproofingAreaSqFt * 65,
      sourceFormula: 'Bathroom floors + 1ft wall upturn + Exposed Terrace Slab + Sump surface',
    });
  }

  // 13. CPVC & SWR Plumbing Pipes
  slNo++;
  items.push({
    slNo,
    material: 'CPVC SDR 11 Hot & Cold Water Pipes',
    category: 'Pipes & Wire',
    brand: input.bathroomFittings?.cpvcBrand || 'Ashirwad / Astral',
    specification: 'SDR 11 chlorinated polyvinyl chloride pipes rated for 82°C at 10 bar (IS 15778)',
    quantity: qty.cpvcSupplyMetres,
    unit: 'Metres',
    unitRate: rateService.getEffectiveRate('plumbing.cpvc_pipe_ashirwad', ctx, 140),
    amount: qty.cpvcSupplyMetres * rateService.getEffectiveRate('plumbing.cpvc_pipe_ashirwad', ctx, 140),
    sourceFormula: 'Water Points × 4.5m + Vertical Shaft Risers',
  });

  slNo++;
  const swrRate = rateService.getEffectiveRate('plumbing.swr_pipe', ctx, 180);
  items.push({
    slNo,
    material: 'SWR Ring-Fit Drainage & Soil Pipes (110mm & 75mm)',
    category: 'Pipes & Wire',
    brand: 'Supreme / Prince SWR',
    specification: 'Type B rubber ring seal leak-proof soil, waste, and rainwater drainage pipe',
    quantity: qty.swrDrainMetres,
    unit: 'Metres',
    unitRate: swrRate,
    amount: qty.swrDrainMetres * swrRate,
    sourceFormula: 'Drainage Points × 3.5m + Vertical Soil Stack Risers',
  });

  // 14. Electrical Wiring & Conduit (Segregated by Conductor Gauge)
  const elecBrand = materialBrands?.electrical || input.electrical?.wireTier || 'Finolex / Polycab';
  let elecBrandKey = 'finolex';
  if (elecBrand.toLowerCase().includes('anchor')) elecBrandKey = 'anchor';
  else if (elecBrand.toLowerCase().includes('vguard') || elecBrand.toLowerCase().includes('v-guard')) elecBrandKey = 'vguard';

  const wireRate1_5 = rateService.getEffectiveRate(`electrical.wire_1_5_${elecBrandKey}`, ctx, getElectricalWireRate(elecBrand, '1.5'));
  const wireRate2_5 = rateService.getEffectiveRate(`electrical.wire_2_5_${elecBrandKey}`, ctx, getElectricalWireRate(elecBrand, '2.5'));
  const wireRate4_0 = rateService.getEffectiveRate(`electrical.wire_4_0_${elecBrandKey}`, ctx, getElectricalWireRate(elecBrand, '4.0'));
  const wireRate6_0 = rateService.getEffectiveRate(`electrical.wire_6_0_${elecBrandKey}`, ctx, getElectricalWireRate(elecBrand, '6.0'));
  const conduitRate = rateService.getEffectiveRate('electrical.conduit_pvc_25mm', ctx, 35);

  if (qty.wire1_5SqMmMetres > 0) {
    slNo++;
    items.push({
      slNo,
      material: '1.5 sq.mm FRLS Copper Electrical Wire (Lighting & Fans)',
      category: 'Pipes & Wire',
      brand: elecBrand,
      specification: 'Flame Retardant Low Smoke IS 694 copper single-core wire',
      quantity: qty.wire1_5SqMmMetres,
      unit: 'Metres',
      unitRate: wireRate1_5,
      amount: qty.wire1_5SqMmMetres * wireRate1_5,
      sourceFormula: '(Light Points + Fan Points) × 8.5m circuit loop',
    });
  }

  if (qty.wire2_5SqMmMetres > 0) {
    slNo++;
    items.push({
      slNo,
      material: '2.5 sq.mm FRLS Copper Electrical Wire (Sockets & Consoles)',
      category: 'Pipes & Wire',
      brand: elecBrand,
      specification: 'Flame Retardant Low Smoke IS 694 copper single-core wire',
      quantity: qty.wire2_5SqMmMetres,
      unit: 'Metres',
      unitRate: wireRate2_5,
      amount: qty.wire2_5SqMmMetres * wireRate2_5,
      sourceFormula: '(Socket Points + TV/Data Points) × 12.5m run',
    });
  }

  if (qty.wire4SqMmMetres > 0) {
    slNo++;
    items.push({
      slNo,
      material: '4.0 sq.mm FRLS Copper Dedicated Circuit Wire (AC & Geysers)',
      category: 'Pipes & Wire',
      brand: elecBrand,
      specification: 'Flame Retardant Low Smoke IS 694 heavy appliance conductor',
      quantity: qty.wire4SqMmMetres,
      unit: 'Metres',
      unitRate: wireRate4_0,
      amount: qty.wire4SqMmMetres * wireRate4_0,
      sourceFormula: '(AC Points + Geyser Points) × 22m dedicated homerun',
    });
  }

  if (qty.wire6SqMmMetres > 0) {
    slNo++;
    items.push({
      slNo,
      material: '6.0 sq.mm FRLS Copper Sub-Main Distribution Risers & EV Supply',
      category: 'Pipes & Wire',
      brand: elecBrand,
      specification: 'Flame Retardant Low Smoke IS 694 sub-main distribution cable',
      quantity: qty.wire6SqMmMetres,
      unit: 'Metres',
      unitRate: wireRate6_0,
      amount: qty.wire6SqMmMetres * wireRate6_0,
      sourceFormula: 'Upper Floors × 35m + EV Charger 35m',
    });
  }

  if (qty.conduitsMetres > 0) {
    slNo++;
    items.push({
      slNo,
      material: 'Heavy-Duty PVC Conduit Pipe (25mm ISI Embedded)',
      category: 'Pipes & Wire',
      brand: 'Precision PVC ISI',
      specification: '25mm diameter heavy-gauge rigid PVC conduit with accessories',
      quantity: qty.conduitsMetres,
      unit: 'Metres',
      unitRate: conduitRate,
      amount: qty.conduitsMetres * conduitRate,
      sourceFormula: 'Points × 2.6m + Floor Risers + EV Conduit',
    });
  }

  return items;
}

export function generateProcurementList(
  input: EngineInput,
  qty: MaterialQuantities,
  materialSchedule: MaterialScheduleItem[]
): ProcurementItem[] {
  return materialSchedule.map((m, idx) => ({
    id: `proc-${idx + 1}`,
    trade: m.category,
    item: m.material,
    brand: m.brand,
    specification: m.specification,
    quantity: m.quantity,
    unit: m.unit,
    unitRate: m.unitRate,
    totalCost: m.amount,
    supplierNote: `Source formula: ${m.sourceFormula}`,
    leadTimeDays: m.category === 'Rebar' ? 3 : m.category === 'Cement' ? 1 : m.category === 'Paint' ? 2 : 5,
  }));
}
