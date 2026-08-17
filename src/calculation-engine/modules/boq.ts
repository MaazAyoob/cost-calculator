// ============================================================
// BOQ GENERATOR MODULE
// Two-Tier Cost Model:
// TIER 1 – STRUCTURAL SHELL: Always calculated from BUA.
//   Every building needs steel, cement, masonry and roofing.
//   Brand selection changes the RATE used (not whether items appear).
//   No brand selected = default market rate.
//   This ensures the live preview always reflects plot & floor choices.
//
// TIER 2 – FINISHING & MEP: Only when explicitly selected.
//   Flooring, Doors, Windows, Electrical, Plumbing, Painting.
//   No selection = zero contribution.
// ============================================================

import { EngineInput, AreaResult, MaterialQuantities, BOQItem, BOQCategory } from '../types';
import { UNIT_RATES_PREMIUM, MATERIAL_QUALITY_MULTIPLIER } from '../data/qualityTiers';
import { getBrandRate } from '../data/brandDatabase';

let _seq = 0;
function nextCode(prefix: string): string {
  _seq++;
  return `${prefix}-${String(_seq).padStart(3, '0')}`;
}

function rate(baseRate: number, multiplier: number): number {
  return Math.round(baseRate * multiplier);
}

// Default market rates when no brand is selected
const DEFAULT_STEEL_RATE_PER_TONNE  = 74000; // ₹74,000/t — market average TMT Fe 500D
const DEFAULT_CEMENT_RATE_PER_BAG   =   400; // ₹400/bag  — standard OPC 53 bag
const DEFAULT_CONCRETE_RATE_PER_CUM =  4800; // ₹4,800/CuM — RMC M25 standard
const DEFAULT_PCC_RATE_PER_CUM      =  3200; // ₹3,200/CuM — PCC M10

export function generateBOQ(
  input: EngineInput,
  area: AreaResult,
  qty: MaterialQuantities
): BOQItem[] {
  _seq = 0;
  const {
    qualityTier,
    materialBrands,
    flooringZones,
    wallCladding,
    doors,
    windows,
    electrical,
    bathroomFittings,
    painting,
  } = input;

  const m = MATERIAL_QUALITY_MULTIPLIER[qualityTier || 'Premium'];
  const r = UNIT_RATES_PREMIUM;
  const bua = area.totalBUASqFt;

  const rawItems: Omit<BOQItem, 'percentage' | 'slNo'>[] = [];

  // If no plot configured yet, return empty BOQ (₹0 zero state)
  if (bua <= 0 && area.plotAreaSqFt <= 0) {
    return [];
  }

  const add = (
    category: BOQCategory,
    prefix: string,
    description: string,
    unit: string,
    quantity: number,
    unitRate: number,
    brand: string,
    remarks = '',
    formula = ''
  ): void => {
    const isDecimalUnit = unit === 'Tonne' || unit === 'Cu M';
    const validQty = isDecimalUnit ? parseFloat(quantity.toFixed(2)) : Math.round(quantity);
    if (validQty <= 0) return;

    const validRate = Math.round(unitRate);
    if (validRate <= 0) return;

    const amount = Math.round(validQty * validRate);

    rawItems.push({
      code: nextCode(prefix),
      category,
      description,
      unit,
      quantity: validQty,
      unitRate: validRate,
      amount,
      brand: brand || 'Standard Specification',
      remarks,
      formula: formula || `${validQty} ${unit} × ₹${validRate.toLocaleString('en-IN')}`,
    });
  };

  // ── Brand Selection State ──────────────────────────────────────
  const steelRate = materialBrands?.steel
    ? (getBrandRate('steel', materialBrands.steel) || DEFAULT_STEEL_RATE_PER_TONNE)
    : DEFAULT_STEEL_RATE_PER_TONNE;

  const cementRate = materialBrands?.cement
    ? (getBrandRate('cement', materialBrands.cement) || DEFAULT_CEMENT_RATE_PER_BAG)
    : DEFAULT_CEMENT_RATE_PER_BAG;

  const concreteRate = Math.round(rate(DEFAULT_CONCRETE_RATE_PER_CUM, m.structural) + ((cementRate - DEFAULT_CEMENT_RATE_PER_BAG) * 7.5));
  const pccRate      = Math.round(rate(DEFAULT_PCC_RATE_PER_CUM, m.structural) + ((cementRate - DEFAULT_CEMENT_RATE_PER_BAG) * 5.0));

  const steelLabel   = materialBrands?.steel   || 'TMT Fe 500D (Market Standard)';
  const cementLabel  = materialBrands?.cement  || 'OPC 53 Grade (Market Standard)';

  // ── TIER 1: STRUCTURAL SHELL (Always active once BUA > 0) ──────

  // ── Site Preparation ──
  add('Site Preparation', 'SP', 'Topsoil Clearing & Land Demarcation', 'Sq Ft', area.plotAreaSqFt, rate(r.sitePreparationPerSqFt, m.structural), 'Total Station Survey', 'incl. benchmarking', 'Plot Area × Rate');
  add('Site Preparation', 'SP', 'Excavation – Column Pits (JCB)', 'Cu M', qty.concreteCuM * 0.4, rate(r.earthworkPerCuM, m.structural), 'Standard Mechanical Excavation', '180 kN/sqm SBC assumption', 'Volume × Earthwork Rate');
  add('Site Preparation', 'SP', 'Anti-Termite Chemical Treatment', 'Sq Ft', area.plotAreaSqFt, 18, 'Chlorpyrifos 20% EC', 'IS 6313 compliant', 'Plot Area × Rate');
  add('Site Preparation', 'SP', 'Temporary Site Shed & Utility Setup', 'Units', 1, 75000, 'GI Sheet Enclosure', 'incl. 3-phase connection', 'Lump sum setup');

  // ── Foundation ──
  add('Foundation', 'FD', 'PCC M10 Bed below Footings', 'Cu M', qty.concreteCuM * 0.08, pccRate, cementLabel, '100mm thickness', 'PCC Volume × Rate');
  add('Foundation', 'FD', 'Isolated Column Footing RMC M25', 'Cu M', qty.concreteCuM * 0.22, concreteRate, 'UltraTech RMC', '50mm cover to rebar', 'Footing Concrete × Rate');
  add('Foundation', 'FD', 'Footing Reinforcement TMT Fe 550D', 'Tonne', qty.steelTonnes * 0.20, steelRate, steelLabel, 'IS 13920 seismic detailing', 'Footing Rebar × Rate');

  // ── Plinth ──
  add('Plinth', 'PL', 'Plinth Beam RMC M25', 'Cu M', qty.concreteCuM * 0.08, concreteRate, 'UltraTech RMC', 'plinth tie beam', 'Plinth Concrete × Rate');
  add('Plinth', 'PL', 'Plinth Beam TMT Steel', 'Tonne', qty.steelTonnes * 0.08, steelRate, steelLabel, 'continuous ring beam', 'Plinth Rebar × Rate');
  add('Plinth', 'PL', 'Earth Backfilling & Plate Compaction', 'Cu M', area.buildableAreaSqFt * 0.5 / 35.31, rate(r.earthworkPerCuM * 0.8, 1), 'Quarry Dust + Red Earth', '150mm compacted layers', 'Backfill Volume × Rate');
  add('Plinth', 'PL', 'DPC PCC M20 with Waterproofing', 'Sq Ft', area.buildableAreaSqFt, rate(18, m.structural), 'Dr. Fixit Pidiproof LW+', '50mm DPC coat', 'Plinth Area × Rate');

  // ── RCC Structure ──
  add('RCC Structure', 'RC', 'Column RMC M25 (all floors)', 'Cu M', qty.concreteCuM * 0.18, concreteRate, 'UltraTech RMC', 'pump placed', 'Column Volume × Rate');
  add('RCC Structure', 'RC', 'Beam & Slab RMC M25', 'Cu M', qty.concreteCuM * 0.52, concreteRate, 'UltraTech RMC', 'monolithic pour', 'Slab Volume × Rate');
  add('RCC Structure', 'RC', 'RCC Staircase Waist Slab', 'Cu M', qty.concreteCuM * 0.06, concreteRate, 'UltraTech RMC', '150mm waist slab', 'Stair Concrete × Rate');
  add('RCC Structure', 'RC', 'Column TMT Rebar Fe 550D', 'Tonne', qty.steelTonnes * 0.30, steelRate, steelLabel, '8 nos 20mm + stirrups @100mm', 'Column Rebar × Rate');
  add('RCC Structure', 'RC', 'Slab & Beam TMT Steel', 'Tonne', qty.steelTonnes * 0.42, steelRate, steelLabel, '10mm@125mm + 8mm dist.', 'Slab Rebar × Rate');
  add('RCC Structure', 'RC', 'Scaffolding & Formwork (Hire & Setup)', 'Sq Ft', bua * 0.9, rate(55, m.structural), 'Cuplock Staging System', 'film-faced shuttering plywood', 'Shuttering Area × Rate');

  // ── Masonry ──
  add('Masonry', 'MA', 'AAC Block 150mm Outer Perimeter Walls', 'Cu M', qty.aacBlocksCuM * 0.55, rate(r.aacBlock6InchPerCuM, m.structural), 'Birla Aerocon Grade 1', 'thin-bed polymer mortar', 'AAC Volume × Rate');
  add('Masonry', 'MA', 'AAC Block 100mm Inner Partition Walls', 'Cu M', qty.aacBlocksCuM * 0.45, rate(r.aacBlock6InchPerCuM * 0.85, m.structural), 'Birla Aerocon Grade 1', '3mm joint adhesive', 'AAC Volume × Rate');
  add('Masonry', 'MA', 'RCC Lintel Beams over Openings', 'RM', (input.rooms.bedrooms || 0) * 2 + (input.rooms.bathrooms || 0) + 6, rate(850, m.structural), 'M20 in-situ concrete', '230mm × 150mm lintel', 'Lintel Length × Rate');
  add('Masonry', 'MA', 'Precast Chajja Sunshades', 'RM', (input.rooms.bedrooms || 0) * 1.5 + 4, rate(1200, m.structural), 'M20 RCC + drip groove', '450mm projection', 'Chajja Length × Rate');
  add('Masonry', 'MA', 'GI Chicken Mesh at RCC Masonry Joints', 'RM', area.totalBUASqFt * 0.4, rate(18, 1), 'GI 22g 150mm width', '100mm lap each side', 'Joint Length × Rate');

  // ── Roofing ──
  add('Roofing', 'RF', 'Terrace Waterproofing Brick Bat Coba', 'Sq Ft', area.terraceSqFt, rate(85, m.finishing), 'Dr. Fixit + IWC', 'IS 3067 compliant', 'Terrace Area × Rate');
  add('Roofing', 'RF', 'Roof Screed & Slope Finishing', 'Sq Ft', area.terraceSqFt, rate(45, m.finishing), 'OPC 53 screed mortar', '2% slope to drains', 'Terrace Area × Rate');
  add('Roofing', 'RF', 'Parapet Wall RCC + Plaster', 'RM', Math.round(Math.sqrt(area.plotAreaSqFt) * 4 * 0.8), rate(2200, m.structural), 'M20 RCC + plaster', '900mm height', 'Parapet Length × Rate');

  // ── TIER 2: FINISHING & MEP (Active upon explicit user selection) ──

  // ── Flooring ──
  const hasFlooringSelection = Boolean(
    materialBrands?.flooring ||
    flooringZones?.living ||
    flooringZones?.bedrooms ||
    flooringZones?.bathrooms ||
    flooringZones?.kitchenDining
  );
  if (hasFlooringSelection) {
    add('Flooring', 'FL', 'Living & Bedroom Floor Tiles (4×2 ft)', 'Sq Ft', qty.floorTilesSqFt * 0.70, rate(r.vitrifiedTilePerSqFt, m.finishing), materialBrands?.flooring || flooringZones?.living || 'Vitrified Tiles', 'MYK adhesive + epoxy grout', 'Living/Bed Area × Rate');
    add('Flooring', 'FL', 'Bathroom & Kitchen Anti-skid Tiles', 'Sq Ft', qty.floorTilesSqFt * 0.15, rate(85, m.finishing), 'Johnson Endura Anti-skid', 'slip resistance R11', 'Wet Area Tiles × Rate');
    add('Flooring', 'FL', 'Bathroom Wall Tiles (glazed, 2×1 ft)', 'Sq Ft', qty.wallTilesSqFt, rate(r.wallTilePerSqFt, m.finishing), 'Kajaria Glamour Wall', wallCladding?.bathroomTileHeight || '7 ft', 'Wall Tile Area × Rate');
    add('Flooring', 'FL', 'Granite Staircase Treads & Risers', 'Sq Ft', qty.graniteSlabsSqFt, rate(r.graniteStepPerSqFt, m.finishing), 'Jet Black Granites 20mm', '3 anti-skid grooves', 'Stair Granite Area × Rate');
    add('Flooring', 'FL', 'Floor Tile Adhesive & Grouting', 'Sq Ft', qty.floorTilesSqFt, rate(22, 1), 'MYK Laticrete 254', '100% bed coverage', 'Flooring Area × Rate');
  }

  // ── Doors & Joinery ──
  const hasDoorsSelection = Boolean(
    materialBrands?.doors ||
    doors?.mainDoor ||
    doors?.internalDoor ||
    doors?.bathroomDoor
  );
  if (hasDoorsSelection) {
    add('Doors & Joinery', 'DJ', 'Main Entrance Solid Teak Door Set', 'Sets', qty.mainDoorsCount, rate(r.mainDoorPerSet, m.joinery), doors?.mainDoor || materialBrands?.doors || 'Premium Teak', '45mm shutter, SS hinges, digital lock', 'Main Doors Count × Rate');
    add('Doors & Joinery', 'DJ', 'Internal Flush Veneer Door Sets', 'Sets', qty.internalDoorsCount, rate(r.interiorDoorPerSet, m.joinery), doors?.internalDoor || 'Flush Door', 'marine ply BWP', 'Internal Doors Count × Rate');
    add('Doors & Joinery', 'DJ', 'Bathroom WPC / FRP Door Sets', 'Sets', qty.bathroomDoorsCount || input.rooms.bathrooms, rate(11000, m.joinery), doors?.bathroomDoor || 'WPC Door', '100% waterproof WPC frame', 'Bathroom Doors Count × Rate');
    add('Doors & Joinery', 'DJ', 'Teak Wood Door Frames', 'RM', (qty.mainDoorsCount + qty.internalDoorsCount) * 7, rate(1800, m.joinery), 'Plantation Teak 4×3 inch', 'seasoned hardwood', 'Frame Length × Rate');
    add('Doors & Joinery', 'DJ', 'SS Mortise Lock Sets', 'Sets', qty.internalDoorsCount, rate(3200, m.joinery), 'Godrej / Yale SS 304', '6-lever mortise', 'Lock Sets Count × Rate');
  }

  // ── Windows & Glazing ──
  const hasWindowsSelection = Boolean(
    materialBrands?.windows ||
    windows?.primaryMaterial
  );
  if (hasWindowsSelection) {
    add('Windows & Glazing', 'WG', 'UPVC Double Glazed Windows', 'Sq Ft', qty.windowAreaSqFt, rate(r.upvcWindowPerSqFt, m.joinery), windows?.primaryMaterial || materialBrands?.windows || 'uPVC', windows?.subGrade || 'Standard uPVC', 'Window Area × Rate');
    add('Windows & Glazing', 'WG', 'MS Grille Fabrication & Installation', 'Sq Ft', qty.windowAreaSqFt * 0.70, rate(280, m.structural), 'SS 304 / MS Grille', 'powder coated black', 'Grille Area × Rate');
  }

  // ── Electrical ──
  const hasElectricalSelection = Boolean(
    materialBrands?.electrical ||
    electrical?.wireTier
  );
  if (hasElectricalSelection) {
    add('Electrical', 'EL', 'FRLS Copper Wire Pulling', 'Metres', qty.electricalWireMetres, rate(r.wirePerMetre, m.mep), electrical?.wireTier || materialBrands?.electrical || 'Mid-range (V-Guard)', '1.5/2.5/4.0 sqmm mixed circuit', 'Wire Length × Rate');
    add('Electrical', 'EL', 'PVC Conduit Pipe & Box Fixing', 'Metres', qty.conduitsMetres, rate(r.conduitPerMetre, m.mep), 'Precision PVC', '25mm heavy duty', 'Conduit Length × Rate');
    add('Electrical', 'EL', 'Modular Switch & Socket Plates', 'Modules', qty.switchModules, rate(r.switchModulePerUnit, m.mep), electrical?.wireTier || 'Modular', 'child safe shutters', 'Switch Modules × Rate');
    add('Electrical', 'EL', 'LED Concealed Spotlights', 'Points', qty.lightingPoints, rate(r.lightPointPerUnit, m.mep), 'Philips LED / Havells', 'CRI>90 warm white', 'Lighting Points × Rate');
    add('Electrical', 'EL', 'Chemical Earthing Pits (x2)', 'Units', 2, rate(22000, m.mep), 'Marconite Gel Earth System', '<1 Ohm verified', 'Earthing Pits × Rate');
    add('Electrical', 'EL', 'Distribution Boards (MCB + RCCB)', 'Units', Math.ceil((input.floors || 1) * 1.5), rate(24000, m.mep), 'Schneider / Legrand DB', '30mA RCCB protection', 'DB Units × Rate');
    add('Electrical', 'EL', 'Armoured Cable from BESCOM Meter', 'RM', 12, rate(1800, m.mep), '4 core 16 sqmm XLPE', 'underground trench', 'Cable Length × Rate');
  }

  // ── Plumbing & Sanitary ──
  const hasPlumbingSelection = Boolean(
    materialBrands?.bathroom ||
    bathroomFittings?.sanitaryTier ||
    bathroomFittings?.cpvcBrand
  );
  if (hasPlumbingSelection) {
    add('Plumbing & Sanitary', 'PS', 'CPVC Hot & Cold Supply Pipes', 'Metres', qty.cpvcSupplyMetres, rate(r.cpvcPipePerMetre, m.mep), bathroomFittings?.cpvcBrand || 'Ashirwad', '10 bar rated at 82°C', 'CPVC Length × Rate');
    add('Plumbing & Sanitary', 'PS', 'SWR Soil & Waste Drainage Pipes', 'Metres', qty.swrDrainMetres, rate(r.swrPipePerMetre, m.mep), 'Supreme Ring-fit SWR', '110mm + 75mm dia', 'SWR Length × Rate');
    add('Plumbing & Sanitary', 'PS', 'Floor Traps & Gratings', 'Units', qty.floorTrapsCount, rate(850, m.mep), 'Jaquar / Cera SS Floor Trap', '50mm deep seal', 'Traps Count × Rate');
    add('Plumbing & Sanitary', 'PS', 'CP Bathroom Fixture Sets', 'Sets', qty.bathroomFixtureSets, rate(r.bathroomSetPerUnit, m.fixtures), bathroomFittings?.sanitaryTier || materialBrands?.bathroom || 'Premium', 'WC + basin + shower set', 'Fixture Sets × Rate');
    add('Plumbing & Sanitary', 'PS', 'Overhead Water Tank 2000L', 'Units', 1, rate(28000, m.mep), 'Sintex 4-layer UV', 'with ball cock & inlet valve', 'Tank Units × Rate');
    add('Plumbing & Sanitary', 'PS', 'Booster Pressure Pump', 'Units', 1, rate(35000, m.mep), 'Grundfos CM / Wilo', '0.75HP VFD constant pressure', 'Pump Units × Rate');
    add('Plumbing & Sanitary', 'PS', 'Kitchen Sink SS 2 Bowl', 'Units', input.rooms.kitchen || 1, rate(12000, m.fixtures), 'Nirali / Franke', '304 grade, anti-scratch', 'Sink Units × Rate');
  }

  // ── Painting & Waterproofing ──
  const hasPaintingSelection = Boolean(
    materialBrands?.paint ||
    painting?.brand ||
    painting?.internalPaint ||
    painting?.externalPaint
  );
  if (hasPaintingSelection) {
    add('Painting & Waterproofing', 'PW', 'Interior Gypsum Wall Putty + Primer', 'Sq Ft', qty.puttyAreaSqFt, rate(16, m.finishing), 'Asian Paints Acrylic Putty', '2 coats + alkali primer', 'Putty Area × Rate');
    add('Painting & Waterproofing', 'PW', 'Interior Luxury Emulsion 2 Coats', 'Sq Ft', qty.interiorPaintAreaSqFt, rate(22, m.finishing), materialBrands?.paint || painting?.brand || 'Asian Paints', 'Teflon surface protector', 'Interior Paint Area × Rate');
    add('Painting & Waterproofing', 'PW', 'Exterior Weather Proof Emulsion', 'Sq Ft', qty.exteriorPaintAreaSqFt, rate(18, m.finishing), painting?.externalPaint || 'Asian Paints Apex Ultima', '7-year weatherproof warranty', 'Exterior Paint Area × Rate');
    add('Painting & Waterproofing', 'PW', 'Bathroom 2-Comp Polymer Waterproofing', 'Sq Ft', qty.waterproofingAreaSqFt, rate(r.waterproofingPerSqFt, m.finishing), 'Dr. Fixit Fastflex 2C', '300mm vertical turn-up', 'Waterproofing Area × Rate');
  }

  // ── Fixtures & Finishes ──
  if (hasElectricalSelection) {
    add('Fixtures & Finishes', 'FF', 'BLDC Ceiling Fans', 'Units', (input.rooms.bedrooms || 0) + (input.rooms.living || 0) + (input.rooms.office || 0), rate(6500, m.fixtures), 'Atomberg Renesa BLDC', '28W, remote control, 5-speed', 'Fans Count × Rate');
  }
  if (hasFlooringSelection && (input.rooms.kitchen || 0) > 0) {
    add('Fixtures & Finishes', 'FF', 'Modular Kitchen – Cabinets & Counter', 'RM', (input.rooms.kitchen || 0) * 12, rate(18000, m.finishing), 'Sleek / Haecker Modular', 'Quartz countertop + HDHMR carcass', 'Counter Length × Rate');
  }
  if (input.liftRequired) {
    add('Fixtures & Finishes', 'FF', 'Lift Installation (if applicable)', 'Units', 1, rate(580000, m.fixtures), 'Schindler / Otis 6-person', '630 kg rated, MRL type', 'Lift Package Allowance');
  }
  if (input.evCharging) {
    add('Fixtures & Finishes', 'FF', 'EV Charging Point (if applicable)', 'Units', input.carCount || 1, rate(38000, m.mep), 'Tata Power EZ Charge 7.2kW', 'Type 2 AC charger', 'EV Points × Rate');
  }

  // Calculate total BOQ sum
  const totalBOQSum = rawItems.reduce((acc, item) => acc + item.amount, 0);

  // Dynamic percentage and sequential slNo per line item
  const finalItems: BOQItem[] = rawItems.map((item, index) => ({
    ...item,
    slNo: index + 1,
    percentage: totalBOQSum > 0 ? parseFloat(((item.amount / totalBOQSum) * 100).toFixed(2)) : 0,
  }));

  return finalItems;
}
