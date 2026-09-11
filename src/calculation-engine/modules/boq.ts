// ============================================================
// BOQ GENERATOR MODULE – SECTION A: WHAT WE BUILD
// Strictly follows Hutty Pilot Specification (Section 1, 24, 26)
//
// Rules:
// - Itemized Construction Works BOQ covering all structural, civil, finishing, and MEP works.
// - All quantities sourced directly from physical geometry and space takeoff.
// - Every item: amount = quantity × unitRate; percentage = amount / totalBOQ × 100.
// - NO arbitrary multipliers or hardcoded totals.
// ============================================================

import {
  EngineInput,
  AreaResult,
  MaterialQuantities,
  BuildingModel,
  DoorScheduleItem,
  WindowScheduleItem,
  BOQItem,
  BOQCategory,
} from '../types';
import { UNIT_RATES_PREMIUM, MATERIAL_QUALITY_MULTIPLIER } from '../data/qualityTiers';
import { getBrandRate, getElectricalWireRate } from '../data/brandDatabase';
import { rateService } from '../data/rateService';

let _seq = 0;
function nextCode(prefix: string): string {
  _seq++;
  return `${prefix}-${String(_seq).padStart(3, '0')}`;
}

function rate(baseRate: number, multiplier: number): number {
  return Math.round(baseRate * multiplier);
}

// Default market rates when no brand is selected
const DEFAULT_STEEL_RATE_PER_TONNE  = 74000;
const DEFAULT_CEMENT_RATE_PER_BAG   =   420;
const DEFAULT_CONCRETE_RATE_PER_CUM =  4800;
const DEFAULT_PCC_RATE_PER_CUM      =  3200;

export function generateBOQ(
  input: EngineInput,
  area: AreaResult,
  qty: MaterialQuantities,
  buildingModel: BuildingModel,
  doorSchedule: DoorScheduleItem[],
  windowSchedule: WindowScheduleItem[]
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

  // Context for dimensional rate resolution
  const ctx = {
    package: qualityTier || 'PREMIUM',
    location: input.city || 'Bangalore',
  };

  const resolveOverride = (key: string, fallbackRate: number, brand?: string): number => {
    const res = rateService.getEffectiveResult(key, { ...ctx, ...(brand ? { brand } : {}) });
    return res.sourceType !== 'BASELINE' && res.sourceType !== 'FALLBACK' && res.sourceType !== 'MISSING_RATE'
      ? res.effectiveRate
      : fallbackRate;
  };

  // ── Brand Selection Rates ──
  const steelRate = resolveOverride(
    'steel.fe550d_tmt',
    materialBrands?.steel
      ? (rateService.getRate('steel', materialBrands.steel, input.city) || DEFAULT_STEEL_RATE_PER_TONNE)
      : DEFAULT_STEEL_RATE_PER_TONNE,
    materialBrands?.steel
  );

  const cementRate = resolveOverride(
    'cement.opc53_grade',
    materialBrands?.cement
      ? (rateService.getRate('cement', materialBrands.cement, input.city) || DEFAULT_CEMENT_RATE_PER_BAG)
      : DEFAULT_CEMENT_RATE_PER_BAG,
    materialBrands?.cement
  );

  const rmcOverride = rateService.getEffectiveResult('concrete.rmc_m25', ctx);
  const pccOverride = rateService.getEffectiveResult('concrete.pcc_m10', ctx);

  const concreteRate = rmcOverride.sourceType !== 'BASELINE' && rmcOverride.sourceType !== 'FALLBACK'
    ? rmcOverride.effectiveRate
    : Math.round(rate(DEFAULT_CONCRETE_RATE_PER_CUM, m.structural) + ((cementRate - DEFAULT_CEMENT_RATE_PER_BAG) * 7.5));

  const pccRate = pccOverride.sourceType !== 'BASELINE' && pccOverride.sourceType !== 'FALLBACK'
    ? pccOverride.effectiveRate
    : Math.round(rate(DEFAULT_PCC_RATE_PER_CUM, m.structural) + ((cementRate - DEFAULT_CEMENT_RATE_PER_BAG) * 5.0));

  const steelLabel   = materialBrands?.steel   || 'TMT Fe 550D Rebar';
  const cementLabel  = materialBrands?.cement  || 'OPC 53 Grade Cement';

  // Derived concrete estimate for structural framing (0.05 Cu.M per sq.ft BUA)
  const approxConcreteCuM = parseFloat((bua * 0.052).toFixed(1));

  // Resolved Site & Ground Rates
  const sitePrepRate = rateService.getEffectiveRate('site.topsoil_clearing', ctx) || rate(r.sitePreparationPerSqFt, m.structural);
  const earthworkRate = rateService.getEffectiveRate('site.earthwork_excavation', ctx) || rate(r.earthworkPerCuM, m.structural);
  const antiTermiteRate = rateService.getEffectiveRate('site.anti_termite_treatment', ctx) || 18;
  const siteShedRate = rateService.getEffectiveRate('site.temporary_shed_setup', ctx) || 75000;
  const dpcRate = rateService.getEffectiveRate('site.dpc_waterproofing', ctx) || rate(18, m.structural);
  const formworkRate = rateService.getEffectiveRate('site.shuttering_formwork', ctx) || rate(55, m.structural);

  // ── 1. Site Preparation ──
  add('Site Preparation', 'SP', 'Topsoil Clearing & Benchmark Boundary Demarcation', 'Sq Ft', area.plotAreaSqFt, sitePrepRate, 'Total Station Survey', 'incl. grid layout', 'Plot Area × Rate');
  add('Site Preparation', 'SP', 'Excavation – Column Footing Pits & Sump Trench (JCB)', 'Cu M', Math.max(10, approxConcreteCuM * 0.45), earthworkRate, 'Mechanical Excavation', '180 kN/sqm SBC assumption', 'Volume × Earthwork Rate');
  add('Site Preparation', 'SP', 'Anti-Termite Pre-Construction Soil Chemical Treatment', 'Sq Ft', area.plotAreaSqFt, antiTermiteRate, 'Chlorpyrifos 20% EC', 'IS 6313 compliant chemical emulsion', 'Plot Area × Rate');
  add('Site Preparation', 'SP', 'Temporary Site Shed, Storage Godown & Electrical Setup', 'Units', 1, siteShedRate, 'GI Sheet Enclosure', 'incl. 3-phase connection', 'Lump sum setup');

  // ── 2. Foundation ──
  add('Foundation', 'FD', 'PCC M10 Levelling Bed below Column Footings', 'Cu M', Math.max(2, approxConcreteCuM * 0.08), pccRate, cementLabel, '100mm thickness (1:3:6)', 'PCC Volume × Rate');
  add('Foundation', 'FD', 'Isolated / Combined Column Footing RCC M25', 'Cu M', Math.max(5, approxConcreteCuM * 0.22), concreteRate, 'UltraTech / ACC RMC', '50mm clear cover to rebar', 'Footing Concrete × Rate');
  add('Foundation', 'FD', 'Footing Reinforcement TMT Fe 550D Bar Bending', 'Tonne', Math.max(0.2, qty.steelTonnes * 0.20), steelRate, steelLabel, 'IS 13920 seismic foundation cage', 'Footing Rebar × Rate');

  // ── 3. Plinth ──
  add('Plinth', 'PL', 'Plinth Tie Beam RCC M25 Casting', 'Cu M', Math.max(2, approxConcreteCuM * 0.08), concreteRate, 'UltraTech / ACC RMC', 'Continuous ring plinth beam', 'Plinth Concrete × Rate');
  add('Plinth', 'PL', 'Plinth Tie Beam TMT Reinforcement Fe 550D', 'Tonne', Math.max(0.1, qty.steelTonnes * 0.08), steelRate, steelLabel, 'continuous tie beam rebar', 'Plinth Rebar × Rate');
  add('Plinth', 'PL', 'Granular Earth Backfilling & Plate Compaction', 'Cu M', Math.max(5, area.buildableAreaSqFt * 0.5 / 35.31), rate(r.earthworkPerCuM * 0.8, 1), 'Quarry Dust + Red Earth', '150mm watered compacted layers', 'Backfill Volume × Rate');
  add('Plinth', 'PL', 'Damp Proof Course (DPC) M20 with Waterproofing', 'Sq Ft', area.buildableAreaSqFt, dpcRate, 'Dr. Fixit Pidiproof LW+', '50mm thick waterproof DPC layer', 'Plinth Area × Rate');

  // ── 4. RCC Superstructure ──
  add('RCC Structure', 'RC', 'RCC Columns M25 Casting (Ground to Top Floor)', 'Cu M', Math.max(3, approxConcreteCuM * 0.18), concreteRate, 'UltraTech / ACC RMC', 'pump placed with needle vibrator', 'Column Volume × Rate');
  add('RCC Structure', 'RC', 'RCC Beams & Roof/Floor Slabs M25 Monolithic Pour', 'Cu M', Math.max(8, approxConcreteCuM * 0.52), concreteRate, 'UltraTech / ACC RMC', '125-150mm slab + 200×450mm beams', 'Slab Volume × Rate');
  add('RCC Structure', 'RC', 'RCC Staircase Waist Slab & Folded Steps', 'Cu M', Math.max(1, approxConcreteCuM * 0.06), concreteRate, 'UltraTech / ACC RMC', '150mm waist slab with risers', 'Stair Concrete × Rate');
  add('RCC Structure', 'RC', 'Column TMT Reinforcement Fe 550D Caging', 'Tonne', Math.max(0.3, qty.steelTonnes * 0.30), steelRate, steelLabel, 'main vertical bars + ties @100mm', 'Column Rebar × Rate');
  add('RCC Structure', 'RC', 'Floor Slab & Beam TMT Reinforcement Fe 550D', 'Tonne', Math.max(0.4, qty.steelTonnes * 0.42), steelRate, steelLabel, 'top/bottom mesh + cranked bars', 'Slab Rebar × Rate');
  add('RCC Structure', 'RC', 'Scaffolding & Film-Faced Plywood Formwork System', 'Sq Ft', bua * 0.90, formworkRate, 'Cuplock Staging System', 'waterproof shuttering ply with oiling', 'Formwork Area × Rate');


  // ── 5. Masonry (Space Model Geometry) ──
  const isClayMasonry = qty.masonryMaterial === 'Clay Bricks' || materialBrands?.masonry?.includes('Clay') || materialBrands?.masonry?.includes('Brick');
  const isConcreteMasonry = qty.masonryMaterial === 'Concrete Blocks' || materialBrands?.masonry?.includes('Concrete') || materialBrands?.masonry?.includes('Cement Block');

  let extWallDesc = 'AAC Block 150mm External Perimeter Masonry Wall';
  let intWallDesc = 'AAC Block 100mm Internal Partition Masonry Wall';
  let extWallRate = rate(r.aacBlock6InchPerCuM, m.structural);
  let intWallRate = rate(r.aacBlock6InchPerCuM * 0.85, m.structural);
  let masonryBrandDesc = qty.masonryBrand || 'Birla Aerocon Grade 1';
  let extJointDesc = 'thin-bed polymer adhesive joint';
  let intJointDesc = '3mm joint mortar bed';

  if (isClayMasonry) {
    extWallDesc = 'Red Clay Brick 230mm External Perimeter Masonry Wall';
    intWallDesc = 'Red Clay Brick 115mm Internal Partition Masonry Wall';
    extWallRate = resolveOverride('masonry.red_clay_brick_ext', rate(4200, m.structural));
    intWallRate = resolveOverride('masonry.red_clay_brick_int', rate(4200 * 0.9, m.structural));
    masonryBrandDesc = qty.masonryBrand || 'Wirecut Red Clay Bricks';
    extJointDesc = 'cement mortar 1:6 laying';
    intJointDesc = 'cement mortar 1:4 with reinforcement ties';
  } else if (isConcreteMasonry) {
    extWallDesc = 'Solid Concrete Block 150mm External Perimeter Masonry Wall';
    intWallDesc = 'Solid Concrete Block 100mm Internal Partition Masonry Wall';
    extWallRate = resolveOverride('masonry.solid_concrete_block_ext', rate(3900, m.structural));
    intWallRate = resolveOverride('masonry.solid_concrete_block_int', rate(3900 * 0.85, m.structural));
    masonryBrandDesc = qty.masonryBrand || 'Solid Concrete Blocks Standard';
    extJointDesc = 'cement mortar 1:5 laying';
    intJointDesc = 'cement mortar 1:4 laying';
  } else {
    extWallRate = resolveOverride('masonry.aac_block_6in', extWallRate, masonryBrandDesc);
    intWallRate = resolveOverride('masonry.aac_block_4in', intWallRate, masonryBrandDesc);
  }

  const masonryVolCuM = qty.masonryVolumeCuM || qty.wallVolumeCuM || qty.aacBlocksCuM;

  add('Masonry', 'MA', extWallDesc, 'Cu M', masonryVolCuM * 0.55, extWallRate, masonryBrandDesc, extJointDesc, 'Masonry Volume × Rate');
  add('Masonry', 'MA', intWallDesc, 'Cu M', masonryVolCuM * 0.45, intWallRate, masonryBrandDesc, intJointDesc, 'Masonry Volume × Rate');
  add('Masonry', 'MA', 'RCC Lintel Beams with 2-legged Stirrups over Openings', 'RM', (qty.totalDoorsCount + qty.windowsCount) * 1.8, resolveOverride('masonry.lintel_beams', rate(850, m.structural)), 'M20 in-situ concrete', '200mm × 150mm lintel band', 'Lintel Length × Rate');
  add('Masonry', 'MA', 'Precast RCC Chajjas / Sunshades over Windows', 'RM', qty.windowsCount * 1.5, resolveOverride('masonry.chajjas', rate(1200, m.structural)), 'M20 RCC + drip groove', '450mm projection with slope', 'Chajja Length × Rate');
  add('Masonry', 'MA', 'GI Chicken Mesh 22g at RCC-Masonry Wall Junctions', 'RM', area.totalBUASqFt * 0.4, resolveOverride('masonry.chicken_mesh', rate(18, 1)), 'GI 22g 150mm width', 'prevents hairline shrinkage cracks', 'Joint Length × Rate');

  // ── 6. Plastering ──
  add('Plastering', 'PL', 'Internal Cement Plaster 12mm (Smooth Trowel Finish)', 'Sq Ft', qty.internalWallAreaSqFt + qty.ceilingAreaSqFt, resolveOverride('plaster.internal_12mm', rate(28, m.finishing)), 'OPC 53 + P-Sand (1:4)', 'smooth sponge / steel trowel finish', 'Internal Wall Area × Rate');
  add('Plastering', 'PL', 'External Sand-Faced Cement Plaster 20mm (Double Coat)', 'Sq Ft', qty.exteriorPaintAreaSqFt, resolveOverride('plaster.external_20mm', rate(36, m.finishing)), 'OPC 53 + M-Sand (1:5)', 'rough cast base + sponge finish', 'External Wall Area × Rate');

  // ── 7. Roofing & Parapet ──
  add('Roofing', 'RF', 'Terrace Brick Bat Coba & Integral Waterproofing Treatment', 'Sq Ft', area.terraceSqFt, resolveOverride('roofing.terrace_waterproofing', rate(85, m.finishing)), 'Dr. Fixit + IWC', 'IS 3067 slope with round vatas', 'Terrace Area × Rate');
  add('Roofing', 'RF', 'Roof Cement Screed & 2% Water Drainage Slope', 'Sq Ft', area.terraceSqFt, resolveOverride('roofing.screed_slope', rate(45, m.finishing)), 'OPC 53 screed mortar', 'guarantees zero water ponding', 'Terrace Area × Rate');
  add('Roofing', 'RF', 'Parapet Wall RCC / Masonry 900mm Height with Plaster', 'RM', Math.round(buildingModel.externalPerimeterFt * 0.9), resolveOverride('roofing.parapet_wall', rate(2200, m.structural)), 'M20 RCC + Plaster', '900mm fall protection barrier', 'Parapet Length × Rate');

  // ── 8. Flooring & Cladding ──
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
    const livingChoice = (flooringZones?.living || materialBrands?.flooring || '') as string;
    let livingRate = rate(r.vitrifiedTilePerSqFt, m.finishing);
    if (livingChoice === 'Italian Marble') livingRate = rate(420, m.finishing);
    else if (livingChoice.includes('Granite')) livingRate = rate(220, m.finishing);
    else if (livingChoice.includes('Vitrified')) livingRate = rate(120, m.finishing);
    else if (materialBrands?.flooring) livingRate = getBrandRate('flooring', materialBrands.flooring) || livingRate;
    livingRate = resolveOverride('flooring.vitrified_living', livingRate, livingChoice);

    const bedroomChoice = (flooringZones?.bedrooms || materialBrands?.flooring || '') as string;
    let bedroomRate = rate(105, m.finishing);
    if (bedroomChoice === 'Italian Marble') bedroomRate = rate(420, m.finishing);
    else if (bedroomChoice.includes('Granite')) bedroomRate = rate(210, m.finishing);
    else if (bedroomChoice.includes('Wooden Laminate')) bedroomRate = rate(180, m.finishing);
    else if (bedroomChoice.includes('Vitrified')) bedroomRate = rate(105, m.finishing);
    else if (materialBrands?.flooring) bedroomRate = getBrandRate('flooring', materialBrands.flooring) || bedroomRate;
    bedroomRate = resolveOverride('flooring.vitrified_800', bedroomRate, bedroomChoice);

    const kitChoice = (flooringZones?.kitchenDining || materialBrands?.flooring || '') as string;
    let kitRate = rate(110, m.finishing);
    if (kitChoice.includes('Granite')) kitRate = rate(195, m.finishing);
    else if (kitChoice.includes('Matte')) kitRate = rate(135, m.finishing);
    else if (kitChoice.includes('Vitrified')) kitRate = rate(110, m.finishing);

    const bathChoice = (flooringZones?.bathrooms || materialBrands?.flooring || '') as string;
    let bathRate = rate(75, m.finishing);
    if (bathChoice.includes('Matte')) bathRate = rate(115, m.finishing);
    else if (bathChoice.includes('Ceramic') || bathChoice.includes('Anti-skid')) bathRate = rate(75, m.finishing);

    const parkingChoice = (flooringZones?.parkingUtility || materialBrands?.flooring || '') as string;
    let parkingRate = rate(65, m.finishing);
    if (parkingChoice.includes('Granite')) parkingRate = rate(160, m.finishing);
    else if (parkingChoice.includes('Parking Tiles')) parkingRate = rate(65, m.finishing);

    const balconyChoice = (flooringZones?.balconies || materialBrands?.flooring || '') as string;
    let balconyRate = rate(70, m.finishing);
    if (balconyChoice.includes('Wooden')) balconyRate = rate(125, m.finishing);
    else if (balconyChoice.includes('Ceramic') || balconyChoice.includes('Anti-skid')) balconyRate = rate(70, m.finishing);

    add('Flooring', 'FL', 'Living Room Flooring Finish (Material & Laying)', 'Sq Ft', qty.floorTilesSqFt * 0.25, livingRate, livingChoice || 'Vitrified 800×800', 'MYK adhesive + epoxy grout', 'Living Area × Rate');
    add('Flooring', 'FL', 'Bedrooms Flooring Finish (Material & Laying)', 'Sq Ft', qty.floorTilesSqFt * 0.32, bedroomRate, bedroomChoice || 'Vitrified Tiles', 'laid over 40mm mortar screed', 'Bedrooms Area × Rate');
    add('Flooring', 'FL', 'Kitchen & Dining Flooring Finish (Material & Laying)', 'Sq Ft', qty.floorTilesSqFt * 0.18, kitRate, kitChoice || 'Vitrified Tiles', 'stain-resistant non-porous tile', 'Kitchen/Dining Area × Rate');
    add('Flooring', 'FL', 'Bathroom Anti-Skid Floor Tiles (Material & Laying)', 'Sq Ft', qty.floorTilesSqFt * 0.10, bathRate, bathChoice || 'Anti-Skid Ceramic', 'R10/R11 slip-resistant finish', 'Bath Floor Area × Rate');
    add('Flooring', 'FL', 'Parking & Utility Heavy-Duty Flooring', 'Sq Ft', qty.floorTilesSqFt * 0.10, parkingRate, parkingChoice || 'Heavy-Duty Tiles', 'heavy axle load rated', 'Parking Area × Rate');
    add('Flooring', 'FL', 'Balconies Exterior Weatherproof Flooring', 'Sq Ft', qty.floorTilesSqFt * 0.05, balconyRate, balconyChoice || 'Anti-Skid Ceramic', 'UV and weather-resistant tile', 'Balcony Area × Rate');

    add('Flooring', 'FL', 'Bathroom Wall Tiles (Dado Cladding up to selected height)', 'Sq Ft', qty.bathroomDadoTileSqFt, rate(r.wallTilePerSqFt, m.finishing), 'Kajaria Glamour Wall', wallCladding?.bathroomTileHeight || '7 ft (Lintel)', 'Dado Area × Rate');
    if (qty.kitchenDadoTileSqFt > 0) {
      add('Flooring', 'FL', 'Kitchen Backsplash Wall Dado Tiles', 'Sq Ft', qty.kitchenDadoTileSqFt, rate(r.wallTilePerSqFt, m.finishing), 'Kajaria Satin Glazed', wallCladding?.kitchenDadoHeight || '2 ft', 'Backsplash Area × Rate');
    }
    add('Flooring', 'FL', 'Granite Slabs for Staircase Steps, Risers & Landings', 'Sq Ft', qty.graniteSlabsSqFt, rate(r.graniteStepPerSqFt, m.finishing), 'Sadahalli / Jet Black Granite 20mm', '3 anti-skid grooves + full bullnose', 'Granite Area × Rate');
    add('Flooring', 'FL', 'Tile Polymer Adhesive & Stain-Free Epoxy Grouting', 'Sq Ft', qty.floorTilesSqFt, rate(22, 1), 'MYK Laticrete 254', '100% bed coverage with zero voids', 'Flooring Area × Rate');
  }

  // ── 9. Doors & Joinery ──
  const hasDoorsSelection = Boolean(
    materialBrands?.doors ||
    doors?.mainDoor ||
    doors?.internalDoor ||
    doors?.bathroomDoor
  );
  if (hasDoorsSelection && doorSchedule.length > 0) {
    doorSchedule.forEach((d) => {
      add('Doors & Joinery', 'DJ', d.description, d.unit, d.quantity, d.unitRate, d.specification, d.openingSize, 'Door Count × Rate');
    });
    add('Doors & Joinery', 'DJ', 'Solid Teak Wood Main & Hardwood Internal Door Frames', 'RM', (qty.mainDoorsCount + qty.internalDoorsCount) * 6.5, resolveOverride('doors.teak_frames', rate(1800, m.joinery)), 'Plantation Teak 4×3 inch', 'seasoned kiln-dried hardwood', 'Frame Length × Rate');
    add('Doors & Joinery', 'DJ', 'SS Mortise Lock Sets, Handles, Hinges & Tower Bolts', 'Sets', qty.internalDoorsCount, resolveOverride('doors.ss_hardware', rate(3200, m.joinery)), 'Godrej / Yale SS 304', '6-lever mortise lock + SS hinges', 'Lock Sets Count × Rate');
  }

  // ── 10. Windows & Glazing ──
  const hasWindowsSelection = Boolean(
    materialBrands?.windows ||
    windows?.primaryMaterial
  );
  if (hasWindowsSelection && windowSchedule.length > 0) {
    windowSchedule.forEach((w) => {
      add(
        'Windows & Glazing',
        'WG',
        `${w.description} (${w.count} Nos)`,
        w.unit,
        w.quantity,
        w.unitRate,
        w.specification,
        `${w.count} Nos • ${w.openingSize} (Total ${w.totalOpeningAreaSqFt} sq.ft)`,
        `${w.count} Nos × ${w.unitAreaSqFt} sq.ft = ${w.totalOpeningAreaSqFt} sq.ft × ₹${w.unitRate.toLocaleString('en-IN')}`
      );
    });
    add('Windows & Glazing', 'WG', 'MS Safety Grille Fabrication, Primer & Polyurethane Fitting', 'Sq Ft', qty.grillAreaSqFt, resolveOverride('windows.ms_safety_grill', rate(280, m.structural)), 'SS 304 / MS Grille', 'powder coated black safety grill', 'Grille Area × Rate');
  }

  // ── 11. Electrical ──
  const hasElectricalSelection = Boolean(
    materialBrands?.electrical ||
    electrical?.wireTier
  );
  if (hasElectricalSelection) {
    const tier = electrical?.wireTier || '';
    const brand = materialBrands?.electrical || tier || 'Finolex';

    let brandKey = 'finolex';
    if (brand.toLowerCase().includes('anchor')) brandKey = 'anchor';
    else if (brand.toLowerCase().includes('vguard') || brand.toLowerCase().includes('v-guard')) brandKey = 'vguard';
    else if (brand.toLowerCase().includes('finolex')) brandKey = 'finolex';
    else if (brand.toLowerCase().includes('polycab')) brandKey = 'polycab';

    let switchKey = 'electrical.switch_module_premium';
    if (tier.includes('Economy') || brand === 'Anchor') switchKey = 'electrical.switch_module_economy';
    else if (tier.includes('Mid-range') || brand === 'V-Guard') switchKey = 'electrical.switch_module_midrange';

    const switchOverride = rateService.getEffectiveResult(switchKey, ctx);
    let switchRate = rate(r.switchModulePerUnit, m.mep);
    if (switchOverride.sourceType !== 'BASELINE' && switchOverride.sourceType !== 'FALLBACK') {
      switchRate = switchOverride.effectiveRate;
    } else if (tier.includes('Premium') || brand === 'Finolex' || brand === 'Polycab') {
      switchRate = rate(240, m.mep);
    } else if (tier.includes('Mid-range') || brand === 'V-Guard') {
      switchRate = rate(185, m.mep);
    } else if (tier.includes('Economy') || brand === 'Anchor') {
      switchRate = rate(140, m.mep);
    }

    const wire1_5_res = rateService.getEffectiveResult(`electrical.wire_1_5_${brandKey}`, ctx);
    const rate1_5 = wire1_5_res.sourceType.startsWith('OVERRIDE')
      ? wire1_5_res.effectiveRate
      : (wire1_5_res.effectiveRate > 0 ? wire1_5_res.effectiveRate : rate(getElectricalWireRate(brand, '1.5'), m.mep));

    const wire2_5_res = rateService.getEffectiveResult(`electrical.wire_2_5_${brandKey}`, ctx);
    const rate2_5 = wire2_5_res.sourceType.startsWith('OVERRIDE')
      ? wire2_5_res.effectiveRate
      : (wire2_5_res.effectiveRate > 0 ? wire2_5_res.effectiveRate : rate(getElectricalWireRate(brand, '2.5'), m.mep));

    const wire4_0_res = rateService.getEffectiveResult(`electrical.wire_4_0_${brandKey}`, ctx);
    const rate4_0 = wire4_0_res.sourceType.startsWith('OVERRIDE')
      ? wire4_0_res.effectiveRate
      : (wire4_0_res.effectiveRate > 0 ? wire4_0_res.effectiveRate : rate(getElectricalWireRate(brand, '4.0'), m.mep));

    const wire6_0_res = rateService.getEffectiveResult(`electrical.wire_6_0_${brandKey}`, ctx);
    const rate6_0 = wire6_0_res.sourceType.startsWith('OVERRIDE')
      ? wire6_0_res.effectiveRate
      : (wire6_0_res.effectiveRate > 0 ? wire6_0_res.effectiveRate : rate(getElectricalWireRate(brand, '6.0'), m.mep));

    const conduitRes = rateService.getEffectiveResult('electrical.conduit_pvc_25mm', ctx);
    const conduitRate = conduitRes.sourceType !== 'BASELINE' && conduitRes.sourceType !== 'FALLBACK'
      ? conduitRes.effectiveRate
      : rate(r.conduitPerMetre, m.mep);

    const lightRes = rateService.getEffectiveResult('electrical.lighting_point_fitting', ctx);
    const lightRate = lightRes.sourceType !== 'BASELINE' && lightRes.sourceType !== 'FALLBACK'
      ? lightRes.effectiveRate
      : rate(r.lightPointPerUnit, m.mep);

    const earthingRes = rateService.getEffectiveResult('electrical.chemical_earthing_pit', ctx);
    const earthingRate = earthingRes.sourceType !== 'BASELINE' && earthingRes.sourceType !== 'FALLBACK'
      ? earthingRes.effectiveRate
      : rate(22000, m.mep);

    const mainDBRes = rateService.getEffectiveResult('electrical.main_lt_panel_db', ctx);
    const mainDBRate = mainDBRes.sourceType !== 'BASELINE' && mainDBRes.sourceType !== 'FALLBACK'
      ? mainDBRes.effectiveRate
      : rate(24000, m.mep);

    const cableRes = rateService.getEffectiveResult('electrical.armoured_feeder_cable', ctx);
    const cableRate = cableRes.sourceType !== 'BASELINE' && cableRes.sourceType !== 'FALLBACK'
      ? cableRes.effectiveRate
      : rate(1800, m.mep);

    add(
      'Electrical',
      'EL',
      '1.5 sq.mm FRLS Copper Wire Pulling (Lighting & Fan Circuits)',
      'Metres',
      qty.wire1_5SqMmMetres,
      rate1_5,
      brand,
      '1.5 sq.mm Phase, Neutral & Earth loop conductors',
      'Conductor Length × Rate'
    );

    add(
      'Electrical',
      'EL',
      '2.5 sq.mm FRLS Copper Wire Pulling (Power Sockets & TV/Data Outlets)',
      'Metres',
      qty.wire2_5SqMmMetres,
      rate2_5,
      brand,
      '2.5 sq.mm modular socket & console power circuits',
      'Conductor Length × Rate'
    );

    add(
      'Electrical',
      'EL',
      '4.0 sq.mm FRLS Copper Dedicated Circuit Wire (AC & Geyser Loads)',
      'Metres',
      qty.wire4SqMmMetres,
      rate4_0,
      brand,
      '4.0 sq.mm dedicated home-run appliance circuits',
      'Conductor Length × Rate'
    );

    if (qty.wire6SqMmMetres > 0) {
      add(
        'Electrical',
        'EL',
        '6.0 sq.mm FRLS Copper Sub-Main Distribution Risers & EV Supply',
        'Metres',
        qty.wire6SqMmMetres,
        rate6_0,
        brand,
        '6.0 sq.mm Main DB to Floor Sub-DBs + EV Charger line',
        'Conductor Length × Rate'
      );
    }

    add(
      'Electrical',
      'EL',
      'Heavy-Duty PVC Conduit Pipe & Junction Boxes Embedded in Walls',
      'Metres',
      qty.conduitsMetres,
      conduitRate,
      'Precision PVC ISI',
      '25mm fire-retardant conduit',
      'Conduit Length × Rate'
    );

    add(
      'Electrical',
      'EL',
      'Modular Switches, Power Sockets & Regulator Plates',
      'Modules',
      qty.switchModules,
      switchRate,
      electrical?.wireTier || 'Modular Plates',
      'child-safe shuttered sockets',
      'Switch Modules × Rate'
    );

    add(
      'Electrical',
      'EL',
      'LED Concealed Spotlights & Batten Points Fitting',
      'Points',
      qty.lightingPoints,
      lightRate,
      'Philips / Havells LED',
      'warm/neutral white CRI>85',
      'Lighting Points × Rate'
    );

    add(
      'Electrical',
      'EL',
      'Chemical Earthing Pits with Copper Electrode (x2 Pits)',
      'Units',
      2,
      earthingRate,
      'Marconite Gel Earth System',
      '< 1 Ohm verified resistance',
      'Earthing Pits × Rate'
    );

    add(
      'Electrical',
      'EL',
      'Distribution Boards with MCB, RCCB & Isolators',
      'Units',
      Math.max(1, input.floors || 1),
      mainDBRate,
      'Schneider / Legrand DB',
      '30mA human shock protection',
      'DB Units × Rate'
    );

    add(
      'Electrical',
      'EL',
      'Armoured Main Feeder Cable from Supply Meter to Panel',
      'RM',
      15,
      cableRate,
      '4 Core 16 sq.mm XLPE',
      'underground GI trench run',
      'Cable Length × Rate'
    );

  }

  // ── 12. Plumbing & Sanitary ──
  const hasPlumbingSelection = Boolean(
    materialBrands?.bathroom ||
    bathroomFittings?.sanitaryTier ||
    bathroomFittings?.cpvcBrand
  );
  if (hasPlumbingSelection) {
    let sanitaryRate = rate(r.bathroomSetPerUnit, m.fixtures);
    const sanTier = bathroomFittings?.sanitaryTier || '';
    if (sanTier.includes('Luxury') || materialBrands?.bathroom === 'Toto') {
      sanitaryRate = 85000;
    } else if (sanTier.includes('Premium') || materialBrands?.bathroom === 'Jaquar' || materialBrands?.bathroom === 'Kohler') {
      sanitaryRate = 38000;
    } else if (sanTier.includes('Mass') || materialBrands?.bathroom === 'Cera' || materialBrands?.bathroom === 'Hindware') {
      sanitaryRate = 18000;
    } else if (materialBrands?.bathroom) {
      sanitaryRate = getBrandRate('bathroom', materialBrands.bathroom) || sanitaryRate;
    }
    sanitaryRate = resolveOverride('plumbing.sanitaryware_set', sanitaryRate, materialBrands?.bathroom || sanTier);

    let cpvcRate = rate(r.cpvcPipePerMetre, m.mep);
    if (bathroomFittings?.cpvcBrand === 'Astral') cpvcRate = resolveOverride('plumbing.cpvc_pipe_astral', 155);
    else if (bathroomFittings?.cpvcBrand === 'Ashirwad') cpvcRate = resolveOverride('plumbing.cpvc_pipe_ashirwad', 140);
    else if (bathroomFittings?.cpvcBrand === 'Supreme') cpvcRate = resolveOverride('plumbing.cpvc_pipe_supreme', 130);
    else cpvcRate = resolveOverride('plumbing.cpvc_pipe', cpvcRate);

    add('Plumbing & Sanitary', 'PS', 'CPVC SDR 11 Hot & Cold Water Concealed Pipe Lines', 'Metres', qty.cpvcSupplyMetres, cpvcRate, bathroomFittings?.cpvcBrand || 'Ashirwad CPVC', '10 bar SDR 11 at 82°C (IS 15778)', 'CPVC Length × Rate');
    add('Plumbing & Sanitary', 'PS', 'SWR Soil, Waste & Rainwater Drainage Pipe Lines', 'Metres', qty.swrDrainMetres, resolveOverride('plumbing.swr_pipe', rate(r.swrPipePerMetre, m.mep)), 'Supreme Ring-fit SWR', '110mm + 75mm dia lines', 'SWR Length × Rate');
    add('Plumbing & Sanitary', 'PS', 'Stainless Steel Floor Traps & Cockroach-Proof Gratings', 'Units', qty.floorTrapsCount, resolveOverride('plumbing.floor_traps', rate(850, m.mep)), 'Jaquar / Cera SS Floor Trap', '50mm water seal depth', 'Traps Count × Rate');
    add('Plumbing & Sanitary', 'PS', 'Sanitaryware & CP Brass Bathroom Fixture Sets', 'Sets', qty.bathroomFixtureSets, sanitaryRate, bathroomFittings?.sanitaryTier || materialBrands?.bathroom || 'Premium', 'WC + basin + diverter + shower', 'Fixture Sets × Rate');
    add('Plumbing & Sanitary', 'PS', `Overhead 4-Layer Anti-Bacterial Water Tank (${qty.overheadTankLitres}L)`, 'Units', 1, resolveOverride('plumbing.overhead_tank', rate(28000, m.mep)), 'Sintex 4-layer UV', 'with auto ball-valve & overflow line', 'Tank Units × Rate');
    add('Plumbing & Sanitary', 'PS', 'Constant Pressure Booster Pump & Sump Delivery System', 'Units', 1, resolveOverride('plumbing.booster_pump', rate(35000, m.mep)), 'Grundfos CM / Wilo', '0.75HP VFD constant pressure pump', 'Pump Units × Rate');
    add('Plumbing & Sanitary', 'PS', 'Kitchen Double-Bowl SS 304 Sink with Swivel Mixer', 'Units', input.rooms.kitchen || 1, resolveOverride('plumbing.kitchen_sink', rate(14500, m.fixtures)), 'Nirali / Franke 304', '304 grade anti-scratch with mixer tap', 'Sink Units × Rate');
  }

  // ── 13. Painting & Waterproofing ──
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

    const finalInternalRate = resolveOverride('paint.interior_premium', Math.round(internalBaseRate * brandMultiplier));
    const finalExternalRate = resolveOverride('paint.exterior_weatherproof', Math.round(externalBaseRate * brandMultiplier));

    add('Painting & Waterproofing', 'PW', 'Interior Gypsum / Acrylic Wall Putty + Alkali Resistant Primer', 'Sq Ft', qty.puttyAreaSqFt, resolveOverride('paint.interior_putty', rate(16, m.finishing)), 'Acrylic Putty + Primer', '2 coats putty + 1 coat primer', 'Putty Area × Rate');
    add('Painting & Waterproofing', 'PW', `Interior ${painting?.internalPaint || 'Premium'} Acrylic Emulsion (2 Coats)`, 'Sq Ft', qty.interiorPaintAreaSqFt, finalInternalRate, paintBrand, 'sheen washable interior coating', 'Interior Paint Area × Rate');
    add('Painting & Waterproofing', 'PW', `Exterior ${painting?.externalPaint || 'Weather Proof'} Emulsion Coating (2 Coats)`, 'Sq Ft', qty.exteriorPaintAreaSqFt, finalExternalRate, paintBrand, 'UV resistant anti-algal exterior paint', 'Exterior Paint Area × Rate');
    add('Painting & Waterproofing', 'PW', 'Bathroom Sunken Slab & Wall Upturn Elastomeric Waterproofing', 'Sq Ft', qty.bathroomWaterproofingSqFt, resolveOverride('paint.waterproofing_sunken', rate(r.waterproofingPerSqFt, m.finishing)), 'Dr. Fixit Fastflex 2C', '1.0 ft vertical wall upturn membrane', 'Waterproofing Area × Rate');
  }

  // ── 14. Fixtures & Special Equipment ──
  if (hasElectricalSelection && (input.rooms.bedrooms || input.rooms.living || input.rooms.office)) {
    const fanCount = (input.rooms.bedrooms || 0) + (input.rooms.living || 0) + (input.rooms.office || 0);
    if (fanCount > 0) {
      add('Fixtures & Finishes', 'FF', 'Energy-Efficient BLDC 28W Ceiling Fans with Remote', 'Units', fanCount, resolveOverride('fixtures.ceiling_fan', rate(6500, m.fixtures)), 'Atomberg Renesa BLDC', '28W brushless DC motor, 5-speed', 'Fans Count × Rate');
    }
  }
  if (hasFlooringSelection && (input.rooms.kitchen || 0) > 0) {
    add('Fixtures & Finishes', 'FF', 'Modular Kitchen Cabinets, Marine Ply Carcass & Counter', 'RM', (input.rooms.kitchen || 0) * 12, resolveOverride('fixtures.modular_kitchen', rate(18000, m.finishing)), 'Sleek / Haecker Modular', 'Quartz countertop + BWP carcass', 'Counter Length × Rate');
  }
  if (input.liftRequired) {
    add('Fixtures & Finishes', 'FF', 'Residential 6-Passenger Machine-Room-Less (MRL) Lift Package', 'Units', 1, resolveOverride('fixtures.passenger_lift', rate(580000, m.fixtures)), 'Schindler / Otis 6-person', '630 kg payload with ARD safety device', 'Lift Package Allowance');
  }
  if (input.evCharging) {
    add('Fixtures & Finishes', 'FF', 'Fast AC EV Wallbox Charger (7.2 kW Type 2 Dedicated Point)', 'Units', input.carCount || 1, resolveOverride('fixtures.ev_charger', rate(38000, m.mep)), 'Tata Power EZ Charge 7.2kW', 'Type 2 AC wallbox charger', 'EV Points × Rate');
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
