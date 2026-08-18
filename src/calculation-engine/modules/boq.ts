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
    flooringZones?.kitchenDining ||
    flooringZones?.parkingUtility ||
    flooringZones?.balconies
  );

  if (hasFlooringSelection) {
    // 1. Living Flooring Rate
    const livingChoice = (flooringZones?.living || materialBrands?.flooring || '') as string;
    let livingRate = rate(r.vitrifiedTilePerSqFt, m.finishing);
    if (livingChoice === 'Italian Marble') livingRate = rate(420, m.finishing);
    else if (livingChoice.includes('Granite')) livingRate = rate(220, m.finishing);
    else if (livingChoice.includes('Vitrified')) livingRate = rate(120, m.finishing);
    else if (materialBrands?.flooring) livingRate = getBrandRate('flooring', materialBrands.flooring) || livingRate;

    // 2. Bedrooms Flooring Rate
    const bedroomChoice = (flooringZones?.bedrooms || materialBrands?.flooring || '') as string;
    let bedroomRate = rate(105, m.finishing);
    if (bedroomChoice === 'Italian Marble') bedroomRate = rate(420, m.finishing);
    else if (bedroomChoice.includes('Granite')) bedroomRate = rate(210, m.finishing);
    else if (bedroomChoice.includes('Wooden Laminate')) bedroomRate = rate(180, m.finishing);
    else if (bedroomChoice.includes('Vitrified')) bedroomRate = rate(105, m.finishing);
    else if (materialBrands?.flooring) bedroomRate = getBrandRate('flooring', materialBrands.flooring) || bedroomRate;

    // 3. Kitchen & Dining Flooring Rate
    const kitChoice = (flooringZones?.kitchenDining || materialBrands?.flooring || '') as string;
    let kitRate = rate(110, m.finishing);
    if (kitChoice.includes('Granite')) kitRate = rate(195, m.finishing);
    else if (kitChoice.includes('Matte')) kitRate = rate(135, m.finishing);
    else if (kitChoice.includes('Vitrified')) kitRate = rate(110, m.finishing);

    // 4. Bathrooms Flooring Rate
    const bathChoice = (flooringZones?.bathrooms || materialBrands?.flooring || '') as string;
    let bathRate = rate(75, m.finishing);
    if (bathChoice.includes('Matte')) bathRate = rate(115, m.finishing);
    else if (bathChoice.includes('Ceramic') || bathChoice.includes('Anti-skid')) bathRate = rate(75, m.finishing);

    // 5. Parking & Utility Rate
    const parkingChoice = (flooringZones?.parkingUtility || materialBrands?.flooring || '') as string;
    let parkingRate = rate(65, m.finishing);
    if (parkingChoice.includes('Granite')) parkingRate = rate(160, m.finishing);
    else if (parkingChoice.includes('Parking Tiles')) parkingRate = rate(65, m.finishing);

    // 6. Balconies Rate
    const balconyChoice = (flooringZones?.balconies || materialBrands?.flooring || '') as string;
    let balconyRate = rate(70, m.finishing);
    if (balconyChoice.includes('Wooden')) balconyRate = rate(125, m.finishing);
    else if (balconyChoice.includes('Ceramic') || balconyChoice.includes('Anti-skid')) balconyRate = rate(70, m.finishing);

    add('Flooring', 'FL', 'Living Room Flooring Finish', 'Sq Ft', qty.floorTilesSqFt * 0.25, livingRate, livingChoice || 'Vitrified 800×800', 'MYK adhesive + epoxy grout', 'Living Area × Rate');
    add('Flooring', 'FL', 'Bedrooms Flooring Finish', 'Sq Ft', qty.floorTilesSqFt * 0.32, bedroomRate, bedroomChoice || 'Vitrified Tiles', 'laid over 40mm screed', 'Bedrooms Area × Rate');
    add('Flooring', 'FL', 'Kitchen & Dining Flooring Finish', 'Sq Ft', qty.floorTilesSqFt * 0.18, kitRate, kitChoice || 'Vitrified Tiles', 'stain resistant finish', 'Kitchen/Dining Area × Rate');
    add('Flooring', 'FL', 'Bathroom Anti-Skid Floor Tiles', 'Sq Ft', qty.floorTilesSqFt * 0.10, bathRate, bathChoice || 'Anti-Skid Ceramic', 'R10 slip resistant', 'Bath Floor Area × Rate');
    add('Flooring', 'FL', 'Parking & Utility Flooring', 'Sq Ft', qty.floorTilesSqFt * 0.10, parkingRate, parkingChoice || 'Heavy-Duty Tiles', 'heavy axle load rated', 'Parking Area × Rate');
    add('Flooring', 'FL', 'Balconies Anti-Skid Flooring', 'Sq Ft', qty.floorTilesSqFt * 0.05, balconyRate, balconyChoice || 'Anti-Skid Ceramic', 'weatherproof exterior tile', 'Balcony Area × Rate');

    add('Flooring', 'FL', 'Bathroom Wall Tiles (dado cladding)', 'Sq Ft', qty.wallTilesSqFt, rate(r.wallTilePerSqFt, m.finishing), 'Kajaria Glamour Wall', wallCladding?.bathroomTileHeight || '7 ft (Lintel)', 'Wall Tile Area × Rate');
    add('Flooring', 'FL', 'Granite Staircase Treads & Risers', 'Sq Ft', qty.graniteSlabsSqFt, rate(r.graniteStepPerSqFt, m.finishing), 'Jet Black Granites 20mm', '3 anti-skid grooves', 'Stair Granite Area × Rate');
    add('Flooring', 'FL', 'Floor Tile Polymer Adhesive & Epoxy Grouting', 'Sq Ft', qty.floorTilesSqFt, rate(22, 1), 'MYK Laticrete 254', '100% bed coverage', 'Flooring Area × Rate');
  }

  // ── Doors & Joinery ──
  const hasDoorsSelection = Boolean(
    materialBrands?.doors ||
    doors?.mainDoor ||
    doors?.internalDoor ||
    doors?.bathroomDoor
  );
  if (hasDoorsSelection) {
    // Main Door Rate
    const mainDoorChoice = (doors?.mainDoor || materialBrands?.doors || '') as string;
    let mainDoorRate = rate(r.mainDoorPerSet, m.joinery);
    if (mainDoorChoice.includes('Burma')) mainDoorRate = 145000;
    else if (mainDoorChoice === 'Premium Teak') mainDoorRate = 65000;
    else if (mainDoorChoice === 'Normal Teak') mainDoorRate = 42000;
    else if (mainDoorChoice.includes('Flush')) mainDoorRate = 18500;
    else if (materialBrands?.doors) mainDoorRate = getBrandRate('doors', materialBrands.doors) || mainDoorRate;

    // Internal Door Rate
    const internalChoice = (doors?.internalDoor || '') as string;
    let internalDoorRate = rate(r.interiorDoorPerSet, m.joinery);
    if (internalChoice.includes('Laminate')) internalDoorRate = 16500;
    else if (internalChoice.includes('Flush')) internalDoorRate = 12500;

    // Bathroom Door Rate
    const bathChoice = (doors?.bathroomDoor || '') as string;
    let bathDoorRate = 11000;
    if (bathChoice.includes('FRP') || bathChoice.includes('ERP')) bathDoorRate = 8500;
    else if (bathChoice.includes('WPC')) bathDoorRate = 11000;

    add('Doors & Joinery', 'DJ', 'Main Entrance Door Set', 'Sets', qty.mainDoorsCount, mainDoorRate, doors?.mainDoor || materialBrands?.doors || 'Premium Teak', 'frame, shutter, SS hinges, mortise lock', 'Main Doors Count × Rate');
    add('Doors & Joinery', 'DJ', 'Internal Flush / Veneer Door Sets', 'Sets', qty.internalDoorsCount, internalDoorRate, doors?.internalDoor || 'Flush Door', 'hardwood frame + shutter', 'Internal Doors Count × Rate');
    add('Doors & Joinery', 'DJ', 'Bathroom Waterproof Door Sets', 'Sets', qty.bathroomDoorsCount || input.rooms.bathrooms, bathDoorRate, doors?.bathroomDoor || 'WPC Door', '100% waterproof WPC/FRP frame', 'Bathroom Doors Count × Rate');
    add('Doors & Joinery', 'DJ', 'Teak Wood Door Frames', 'RM', (qty.mainDoorsCount + qty.internalDoorsCount) * 7, rate(1800, m.joinery), 'Plantation Teak 4×3 inch', 'seasoned hardwood', 'Frame Length × Rate');
    add('Doors & Joinery', 'DJ', 'SS Mortise Lock Sets & Hardware', 'Sets', qty.internalDoorsCount, rate(3200, m.joinery), 'Godrej / Yale SS 304', '6-lever mortise + handles', 'Lock Sets Count × Rate');
  }

  // ── Windows & Glazing ──
  const hasWindowsSelection = Boolean(
    materialBrands?.windows ||
    windows?.primaryMaterial
  );
  if (hasWindowsSelection) {
    let windowRate = rate(r.upvcWindowPerSqFt, m.joinery);
    const prim = windows?.primaryMaterial || 'uPVC';
    const sub = windows?.subGrade;

    if (prim === 'uPVC') {
      if (sub === 'Luxury / Fenesta uPVC' || materialBrands?.windows === 'Fenesta uPVC') windowRate = 850;
      else if (sub === 'Standard uPVC') windowRate = 550;
      else windowRate = 650;
    } else if (prim === 'Wood') {
      if (sub === 'Teak Wood Frame') windowRate = 950;
      else if (sub === 'Sal Frame / Honne Shutter') windowRate = 680;
      else windowRate = 850;
    } else if (prim === 'Aluminium') {
      if (sub === 'Powder Coated Jindal Aluminium') windowRate = 620;
      else if (sub === 'Anodized Aluminium') windowRate = 480;
      else windowRate = 520;
    } else if (materialBrands?.windows) {
      windowRate = getBrandRate('windows', materialBrands.windows) || windowRate;
    }

    add('Windows & Glazing', 'WG', `${prim} Glazed Windows`, 'Sq Ft', qty.windowAreaSqFt, windowRate, prim, sub || 'Standard Specification', 'Window Area × Rate');
    add('Windows & Glazing', 'WG', 'MS Safety Grille Fabrication & Fitting', 'Sq Ft', qty.windowAreaSqFt * 0.70, rate(280, m.structural), 'SS 304 / MS Grille', 'powder coated black', 'Grille Area × Rate');
  }

  // ── Electrical ──
  const hasElectricalSelection = Boolean(
    materialBrands?.electrical ||
    electrical?.wireTier
  );
  if (hasElectricalSelection) {
    let wireRate = rate(r.wirePerMetre, m.mep);
    let switchRate = rate(r.switchModulePerUnit, m.mep);
    const tier = electrical?.wireTier || '';

    if (tier === 'Premium (Finolex / Polycab)' || materialBrands?.electrical === 'Finolex' || materialBrands?.electrical === 'Polycab') {
      wireRate = 48;
      switchRate = rate(240, m.mep);
    } else if (tier === 'Mid-range (V-Guard)' || materialBrands?.electrical === 'V-Guard') {
      wireRate = 36;
      switchRate = rate(185, m.mep);
    } else if (tier === 'Economy (Anchor)' || materialBrands?.electrical === 'Anchor') {
      wireRate = 28;
      switchRate = rate(140, m.mep);
    } else if (materialBrands?.electrical) {
      wireRate = getBrandRate('electrical', materialBrands.electrical) || wireRate;
    }

    add('Electrical', 'EL', 'FRLS Copper Wire Pulling', 'Metres', qty.electricalWireMetres, wireRate, electrical?.wireTier || materialBrands?.electrical || 'V-Guard FRLS', '1.5/2.5/4.0 sqmm circuits', 'Wire Length × Rate');
    add('Electrical', 'EL', 'PVC Conduit Pipe & Box Embedded Fixing', 'Metres', qty.conduitsMetres, rate(r.conduitPerMetre, m.mep), 'Precision PVC ISI', '25mm heavy duty fire-retardant', 'Conduit Length × Rate');
    add('Electrical', 'EL', 'Modular Switch & Socket Plates', 'Modules', qty.switchModules, switchRate, electrical?.wireTier || 'Modular Plates', 'child safe shutters & plates', 'Switch Modules × Rate');
    add('Electrical', 'EL', 'LED Concealed Spotlights & Fixtures', 'Points', qty.lightingPoints, rate(r.lightPointPerUnit, m.mep), 'Philips / Havells LED', 'CRI>90 warm white', 'Lighting Points × Rate');
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
    let sanitaryRate = rate(r.bathroomSetPerUnit, m.fixtures);
    const sanTier = bathroomFittings?.sanitaryTier || '';
    if (sanTier === 'Luxury (Toto / Duravit)' || materialBrands?.bathroom === 'Toto') {
      sanitaryRate = 85000;
    } else if (sanTier === 'Premium (Jaquar / Kohler / Grohe)' || materialBrands?.bathroom === 'Jaquar' || materialBrands?.bathroom === 'Kohler') {
      sanitaryRate = 38000;
    } else if (sanTier === 'Mass Market (Cera / Hindware / Parryware)' || materialBrands?.bathroom === 'Cera' || materialBrands?.bathroom === 'Hindware') {
      sanitaryRate = 18000;
    } else if (materialBrands?.bathroom) {
      sanitaryRate = getBrandRate('bathroom', materialBrands.bathroom) || sanitaryRate;
    }

    let cpvcRate = rate(r.cpvcPipePerMetre, m.mep);
    if (bathroomFittings?.cpvcBrand === 'Astral') cpvcRate = 155;
    else if (bathroomFittings?.cpvcBrand === 'Ashirwad') cpvcRate = 140;
    else if (bathroomFittings?.cpvcBrand === 'Supreme') cpvcRate = 130;

    add('Plumbing & Sanitary', 'PS', 'CPVC Hot & Cold Supply Pipes', 'Metres', qty.cpvcSupplyMetres, cpvcRate, bathroomFittings?.cpvcBrand || 'Ashirwad CPVC', '10 bar SDR 11 at 82°C', 'CPVC Length × Rate');
    add('Plumbing & Sanitary', 'PS', 'SWR Soil & Waste Drainage Pipes', 'Metres', qty.swrDrainMetres, rate(r.swrPipePerMetre, m.mep), 'Supreme Ring-fit SWR', '110mm + 75mm dia', 'SWR Length × Rate');
    add('Plumbing & Sanitary', 'PS', 'Floor Traps & Gratings', 'Units', qty.floorTrapsCount, rate(850, m.mep), 'Jaquar / Cera SS Floor Trap', '50mm deep seal', 'Traps Count × Rate');
    add('Plumbing & Sanitary', 'PS', 'CP Bathroom Fixture Sets', 'Sets', qty.bathroomFixtureSets, sanitaryRate, bathroomFittings?.sanitaryTier || materialBrands?.bathroom || 'Premium', 'WC + basin + diverter + shower', 'Fixture Sets × Rate');
    add('Plumbing & Sanitary', 'PS', 'Overhead Water Tank 2000L', 'Units', 1, rate(28000, m.mep), 'Sintex 4-layer UV', 'with ball cock & inlet valve', 'Tank Units × Rate');
    add('Plumbing & Sanitary', 'PS', 'Booster Pressure Pump', 'Units', 1, rate(35000, m.mep), 'Grundfos CM / Wilo', '0.75HP VFD constant pressure', 'Pump Units × Rate');
    add('Plumbing & Sanitary', 'PS', 'Kitchen Sink SS 2 Bowl', 'Units', input.rooms.kitchen || 1, rate(12000, m.fixtures), 'Nirali / Franke 304', '304 grade, anti-scratch', 'Sink Units × Rate');
  }

  // ── Painting & Waterproofing ──
  const hasPaintingSelection = Boolean(
    materialBrands?.paint ||
    painting?.brand ||
    painting?.internalPaint ||
    painting?.externalPaint
  );
  if (hasPaintingSelection) {
    const paintBrand = (painting?.brand || materialBrands?.paint || 'Asian Paints') as string;
    let brandMultiplier = 1.0;
    if (paintBrand.includes('Berger')) brandMultiplier = 0.90;
    else if (paintBrand.includes('Dulux')) brandMultiplier = 0.95;
    else if (paintBrand.includes('Asian')) brandMultiplier = 1.05;

    let internalBaseRate = 28;
    if (painting?.internalPaint === 'Royale Luxury Emulsion' || paintBrand.includes('Royale')) internalBaseRate = 45;
    else if (painting?.internalPaint === 'Premium Emulsion') internalBaseRate = 28;
    else if (painting?.internalPaint === 'Tractor Emulsion') internalBaseRate = 18;

    let externalBaseRate = 32;
    if (painting?.externalPaint === 'Texture Finish') externalBaseRate = 55;
    else if (painting?.externalPaint === 'Ultima Weather Proof') externalBaseRate = 32;

    const finalInternalRate = Math.round(internalBaseRate * brandMultiplier);
    const finalExternalRate = Math.round(externalBaseRate * brandMultiplier);

    add('Painting & Waterproofing', 'PW', 'Interior Gypsum Wall Putty + Primer', 'Sq Ft', qty.puttyAreaSqFt, rate(16, m.finishing), 'Acrylic Putty + Primer', '2 coats + alkali primer', 'Putty Area × Rate');
    add('Painting & Waterproofing', 'PW', `Interior ${painting?.internalPaint || 'Premium'} Paint 2 Coats`, 'Sq Ft', qty.interiorPaintAreaSqFt, finalInternalRate, paintBrand, 'Teflon surface protector', 'Interior Paint Area × Rate');
    add('Painting & Waterproofing', 'PW', `Exterior ${painting?.externalPaint || 'Weather Proof'} Finish`, 'Sq Ft', qty.exteriorPaintAreaSqFt, finalExternalRate, paintBrand, 'Weatherproof exterior coating', 'Exterior Paint Area × Rate');
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
    add('Fixtures & Finishes', 'FF', 'Lift Installation (6-passenger MRL)', 'Units', 1, rate(580000, m.fixtures), 'Schindler / Otis 6-person', '630 kg rated, MRL type', 'Lift Package Allowance');
  }
  if (input.evCharging) {
    add('Fixtures & Finishes', 'FF', 'EV Charging Point (Fast AC)', 'Units', input.carCount || 1, rate(38000, m.mep), 'Tata Power EZ Charge 7.2kW', 'Type 2 AC charger', 'EV Points × Rate');
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
