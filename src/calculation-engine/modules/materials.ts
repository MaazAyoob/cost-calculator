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
import { getBrandRate } from '../data/brandDatabase';

export function generateMaterialSchedule(
  input: EngineInput,
  qty: MaterialQuantities
): MaterialScheduleItem[] {
  const { materialBrands, flooringZones, painting } = input;
  const items: MaterialScheduleItem[] = [];
  let slNo = 0;

  if (qty.steelKg <= 0 && qty.cementBags <= 0) {
    return [];
  }

  // 1. TMT Rebar Steel
  const steelBrand = materialBrands?.steel || 'Tata Tiscon';
  const steelRatePerTonne = getBrandRate('steel', steelBrand) || 74000;
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
  const cementRatePerBag = getBrandRate('cement', cementBrand) || 420;
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
  slNo++;
  items.push({
    slNo,
    material: 'Manufactured Concrete Sand (M-Sand Zone II)',
    category: 'Aggregates',
    brand: 'Licensed Quarry Standard',
    specification: 'Zone II double-washed cubical shape manufactured sand, silt content < 3%',
    quantity: qty.mSandCuFt,
    unit: 'Cu Ft',
    unitRate: 65,
    amount: qty.mSandCuFt * 65,
    sourceFormula: 'Total BUA × 0.60 CFT/sqft (Pilot Specification Section 9)',
  });

  // 4. Plaster Sand (P-Sand)
  slNo++;
  items.push({
    slNo,
    material: 'Fine Plaster Sand (P-Sand)',
    category: 'Aggregates',
    brand: 'Licensed Quarry Standard',
    specification: 'Zone IV ultra-fine washed plastering sand for smooth internal & external wall finish',
    quantity: qty.pSandCuFt,
    unit: 'Cu Ft',
    unitRate: 70,
    amount: qty.pSandCuFt * 70,
    sourceFormula: 'Total BUA × 0.60 CFT/sqft (Pilot Specification Section 10)',
  });

  // 5. Coarse Aggregate (20mm & 12mm)
  slNo++;
  items.push({
    slNo,
    material: 'Coarse Metal Blue Granite Aggregate (20mm & 12mm)',
    category: 'Aggregates',
    brand: 'Crushed Granite Standard',
    specification: 'IS 383 angular crushed blue metal granite aggregate (60:40 20mm/12mm blend)',
    quantity: qty.coarseAggregateCuFt,
    unit: 'Cu Ft',
    unitRate: 52,
    amount: qty.coarseAggregateCuFt * 52,
    sourceFormula: 'Total BUA × 1.35 CFT/sqft (Pilot Specification Section 11)',
  });

  // 6. AAC Masonry Blocks
  slNo++;
  items.push({
    slNo,
    material: 'Autoclaved Aerated Concrete (AAC) Blocks',
    category: 'Masonry',
    brand: 'Birla Aerocon / Godrej Grade 1',
    specification: 'IS 2185 Part 3, 600×200×150mm & 600×200×100mm, oven-dry density 600 kg/m3',
    quantity: qty.aacBlocksPieces,
    unit: 'Blocks',
    unitRate: 85,
    amount: qty.aacBlocksPieces * 85,
    sourceFormula: `Wall Volume (${qty.wallVolumeCuM} Cu.M) ÷ Block Vol (0.018 Cu.M) × 1.05`,
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
    unitRate: 140,
    amount: qty.cpvcSupplyMetres * 140,
    sourceFormula: 'Water Points × 4.5m + Vertical Shaft Risers',
  });

  slNo++;
  items.push({
    slNo,
    material: 'SWR Ring-Fit Drainage & Soil Pipes (110mm & 75mm)',
    category: 'Pipes & Wire',
    brand: 'Supreme / Prince SWR',
    specification: 'Type B rubber ring seal leak-proof soil, waste, and rainwater drainage pipe',
    quantity: qty.swrDrainMetres,
    unit: 'Metres',
    unitRate: 180,
    amount: qty.swrDrainMetres * 180,
    sourceFormula: 'Drainage Points × 3.5m + Vertical Soil Stack Risers',
  });

  // 14. Electrical FRLS Copper Wire
  slNo++;
  items.push({
    slNo,
    material: 'FRLS Multi-Strand Copper Electrical Cable',
    category: 'Pipes & Wire',
    brand: materialBrands?.electrical || input.electrical?.wireTier || 'Finolex / Polycab',
    specification: 'Flame Retardant Low Smoke IS 694 copper single-core wire (1.5, 2.5, 4.0 sq.mm)',
    quantity: qty.electricalWireMetres,
    unit: 'Metres',
    unitRate: 38,
    amount: qty.electricalWireMetres * 38,
    sourceFormula: 'Electrical Points × 5.5m + Main Circuit Runs + EV Charger Allowance',
  });

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
