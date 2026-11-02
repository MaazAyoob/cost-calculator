// ============================================================
// FIXTURES & FITTINGS MODULE – SECTION C: WHAT WE INSTALL
// Strictly follows Hutty Pilot Specification (Section 26 & Section 3)
//
// Generates the authoritative schedule of installed equipment & fittings:
// - Doors & Hardware
// - Windows & Glazing
// - Sanitary Fixtures (WC, Basins, Showers, Faucets, Sinks)
// - Electrical Fixtures & Distribution Boards
// - Water Tanks & Booster Pumps
// - Lift / EV Charger where configured
//
// NOTE: Single source of truth. Quantities match engine takeoff.
// ============================================================

import {
  EngineInput,
  MaterialQuantities,
  DoorScheduleItem,
  WindowScheduleItem,
  FixtureScheduleItem,
} from '../types';
import { getBrandRate } from '../data/brandDatabase';
import { rateService } from '../data/rateService';

export function generateFixtureSchedule(
  input: EngineInput,
  qty: MaterialQuantities,
  doorSchedule: DoorScheduleItem[],
  windowSchedule: WindowScheduleItem[]
): FixtureScheduleItem[] {
  const { materialBrands, bathroomFittings, electrical, doors, windows, liftRequired, evCharging, carCount } = input;
  const fixtures: FixtureScheduleItem[] = [];
  let slNo = 0;

  if (qty.totalDoorsCount <= 0 && qty.windowsCount <= 0 && qty.bathroomFixtureSets <= 0) {
    return [];
  }

  // ── 1. Doors ──
  doorSchedule.forEach((d) => {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Doors',
      item: d.description,
      brand: d.specification,
      specification: `${d.openingSize} (${d.material})`,
      quantity: d.quantity,
      unit: d.unit,
      unitRate: d.unitRate,
      amount: d.amount,
      location: d.spaceType,
    });
  });

  // ── 2. Windows ──
  windowSchedule.forEach((w) => {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Windows',
      item: `${w.description} (${w.count} Nos)`,
      brand: w.material,
      specification: `${w.openingSize} (${w.count} × ${w.unitAreaSqFt} sq.ft = ${w.totalOpeningAreaSqFt} sq.ft) – ${w.specification}`,
      quantity: w.quantity,
      unit: w.unit,
      unitRate: w.unitRate,
      amount: w.amount,
      location: w.spaceType,
    });
  });

  // ── 3. Sanitary Fixtures ──
  const sanBrand = materialBrands?.bathroom || bathroomFittings?.sanitaryTier || 'Kohler / Jaquar';
  let defaultSanRate = 38000;
  if (bathroomFittings?.sanitaryTier?.includes('Luxury') || materialBrands?.bathroom === 'Toto') {
    defaultSanRate = 85000;
  } else if (bathroomFittings?.sanitaryTier?.includes('Mass') || materialBrands?.bathroom === 'Cera') {
    defaultSanRate = 18000;
  } else if (materialBrands?.bathroom) {
    defaultSanRate = getBrandRate('bathroom', materialBrands.bathroom) || defaultSanRate;
  }
  const sanRate = rateService.getEffectiveRate(
    'sanitary.jaquar_fittings_set',
    { packageTier: input.qualityTier, location: input.city, brand: sanBrand },
    defaultSanRate
  );

  if (qty.wcCount > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Sanitary Fixtures',
      item: 'Wall-Hung EWC with Soft-Close Seat & Concealed Flush Valve',
      brand: sanBrand,
      specification: 'Rimless ceramic bowl, dual-flush water saving cistern',
      quantity: qty.wcCount,
      unit: 'Sets',
      unitRate: Math.round(sanRate * 0.40),
      amount: qty.wcCount * Math.round(sanRate * 0.40),
      location: 'Bathrooms & Powder Rooms',
    });
  }

  if (qty.washBasinCount > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Sanitary Fixtures',
      item: 'Countertop / Wall-Hung Wash Basin with Single-Lever Pillar Cock',
      brand: sanBrand,
      specification: 'Vitreous china basin with brass chrome-plated tap',
      quantity: qty.washBasinCount,
      unit: 'Sets',
      unitRate: Math.round(sanRate * 0.25),
      amount: qty.washBasinCount * Math.round(sanRate * 0.25),
      location: 'Bathrooms & Dining Vanity',
    });
  }

  if (qty.showerCount > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Sanitary Fixtures',
      item: 'Concealed Bath Diverter & Overhead Rain Shower Set',
      brand: sanBrand,
      specification: 'Thermostatic cartridge with 200mm SS rain shower head',
      quantity: qty.showerCount,
      unit: 'Sets',
      unitRate: Math.round(sanRate * 0.25),
      amount: qty.showerCount * Math.round(sanRate * 0.25),
      location: 'Bathrooms',
    });
  }

  if (qty.healthFaucetCount > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Sanitary Fixtures',
      item: 'Health Faucet Hand Spray with 1.2m SS Braided Hose & Hook',
      brand: sanBrand,
      specification: 'ABS body with SS braided anti-burst pressure hose',
      quantity: qty.healthFaucetCount,
      unit: 'Sets',
      unitRate: Math.round(sanRate * 0.10),
      amount: qty.healthFaucetCount * Math.round(sanRate * 0.10),
      location: 'All WCs',
    });
  }

  if (qty.kitchenSinkCount > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Sanitary Fixtures',
      item: 'Stainless Steel Double-Bowl Kitchen Sink with Drainboard',
      brand: 'Nirali / Franke',
      specification: 'AISI 304 Grade (1.2mm thickness) with swivel neck mixer tap',
      quantity: qty.kitchenSinkCount,
      unit: 'Sets',
      unitRate: 14500,
      amount: qty.kitchenSinkCount * 14500,
      location: 'Kitchen Area',
    });
  }

  // ── 4. Electrical Fixtures ──
  const elecBrand = materialBrands?.electrical || electrical?.wireTier || 'Schneider / Legrand';
  if (qty.switchModules > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Electrical Fixtures',
      item: 'Modular Switch, Socket & Regulator Plates',
      brand: elecBrand,
      specification: 'Polycarbonate flame-retardant plates with child-safe shutters',
      quantity: qty.switchModules,
      unit: 'Modules',
      unitRate: 185,
      amount: qty.switchModules * 185,
      location: 'All Rooms & Common Areas',
    });
  }

  if (qty.lightingPoints > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Electrical Fixtures',
      item: 'Concealed LED Spotlights & Batten Fittings',
      brand: 'Philips / Havells',
      specification: '12W / 18W CRI>85 warm/neutral white recessed fixtures',
      quantity: qty.lightingPoints,
      unit: 'Points',
      unitRate: 450,
      amount: qty.lightingPoints * 450,
      location: 'All Ceilings & Corridors',
    });
  }

  slNo++;
  fixtures.push({
    slNo,
    category: 'Electrical Fixtures',
    item: 'Main & Sub Distribution Boards (MCB + RCCB Protection)',
    brand: 'Schneider / ABB',
    specification: '8-way / 12-way vertical TPN DB with 30mA earth leakage protection',
    quantity: Math.max(1, input.floors || 1),
    unit: 'Units',
    unitRate: 18000,
    amount: Math.max(1, input.floors || 1) * 18000,
    location: 'Each Floor Electrical Shaft',
  });

  if (input.evCharging) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Electrical Fixtures',
      item: 'Dedicated EV Charging Station Point (32A Level 2 Provision)',
      brand: 'Schneider / Legrand',
      specification: '32A industrial socket with dedicated MCB isolator & weatherproof IP66 enclosure',
      quantity: 1,
      unit: 'Units',
      unitRate: 12500,
      amount: 12500,
      location: 'Parking Bay / Garage',
    });
  }

  // ── 5. Plumbing Tanks & Pumps ──
  if (qty.overheadTankLitres > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Plumbing Tanks & Pumps',
      item: `Overhead Domestic Water Storage Tank (${qty.overheadTankLitres} Litres)`,
      brand: 'Sintex / Supreme',
      specification: '4-layer anti-bacterial UV-stabilized rotational molded tank',
      quantity: 1,
      unit: 'Units',
      unitRate: Math.round(qty.overheadTankLitres * 12),
      amount: Math.round(qty.overheadTankLitres * 12),
      location: 'Terrace Overhead Slab',
    });

    slNo++;
    fixtures.push({
      slNo,
      category: 'Plumbing Tanks & Pumps',
      item: 'Automatic Booster Pressure Pump & Sump Submersible Pump',
      brand: 'Grundfos / Wilo',
      specification: '0.75 HP automatic pressure booster pump with dry run protection',
      quantity: 1,
      unit: 'Units',
      unitRate: 32000,
      amount: 32000,
      location: 'Sump & Terrace Delivery Line',
    });
  }

  // ── 6. Special Equipment (Lift & EV Charger) ──
  if (liftRequired) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Special Equipment',
      item: '6-Passenger Machine-Room-Less (MRL) Residential Elevator',
      brand: 'Schindler / Otis',
      specification: '630 kg payload, automatic SS doors, ARD rescue device',
      quantity: 1,
      unit: 'Units',
      unitRate: 580000,
      amount: 580000,
      location: 'Central Lift Shaft',
    });
  }

  if (evCharging) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Special Equipment',
      item: 'Fast AC EV Wallbox Charging Station (7.2 kW Type 2)',
      brand: 'Tata Power / Schneider',
      specification: '7.2 kW 32A single/3-phase AC wall-mount charger with RFID/app',
      quantity: carCount || 1,
      unit: 'Units',
      unitRate: 38000,
      amount: (carCount || 1) * 38000,
      location: 'Parking Bay',
    });
  }

  // ── 7. Metal Fabrication, Railings & Elevation Finishes ──
  const fab = input.fabrication;
  const floorsCount = Math.max(1, input.floors || 1);
  const balconyCount = input.rooms?.balcony || 0;

  // 7.1 Staircase Railing
  if (floorsCount > 1) {
    slNo++;
    const stairRft = (floorsCount - 1) * 24;
    const stairChoice = fab?.staircaseRailing || 'SS 304 with Toughened Glass';
    let stairRate = 1850;
    let stairSpec = 'AISI SS 304 grade balusters with 10mm toughened glass panels';
    if (stairChoice.includes('Wood') || stairChoice.includes('Designer')) {
      stairRate = 1250;
      stairSpec = 'Laser-cut MS balusters with PU enamel coating and polished teak wooden handrail';
    } else if (stairChoice.includes('Pipe') || stairChoice.includes('Standard MS')) {
      stairRate = 650;
      stairSpec = 'Commercial grade 40mm MS pipe with red oxide primer and synthetic enamel paint';
    }
    fixtures.push({
      slNo,
      category: 'Metal Fabrication & Railings',
      item: `Staircase Railing (${stairChoice})`,
      brand: 'SS 304 / MS Fabricated',
      specification: stairSpec,
      quantity: stairRft,
      unit: 'Rft',
      unitRate: stairRate,
      amount: stairRft * stairRate,
      location: 'Internal Staircase Flights',
    });
  }

  // 7.2 Balcony Railing
  if (balconyCount > 0) {
    slNo++;
    const balcRft = balconyCount * 12;
    const balcChoice = fab?.balconyRailing || 'SS 304 with Toughened Glass';
    let balcRate = 1650;
    let balcSpec = 'Weather-resistant SS 304 side spigots with 10mm clear toughened glass';
    if (balcChoice.includes('Grille') || balcChoice.includes('Laser') || balcChoice.includes('CNC')) {
      balcRate = 1150;
      balcSpec = 'Custom CNC laser-cut MS sheet panel railing with anti-corrosion zinc primer';
    } else if (balcChoice.includes('Square Bar') || balcChoice.includes('Standard MS')) {
      balcRate = 550;
      balcSpec = '12mm MS square bars with anti-rust red oxide primer and exterior enamel';
    }
    fixtures.push({
      slNo,
      category: 'Metal Fabrication & Railings',
      item: `Balcony Safety Railing (${balcChoice})`,
      brand: 'SS 304 / MS Grille',
      specification: balcSpec,
      quantity: balcRft,
      unit: 'Rft',
      unitRate: balcRate,
      amount: balcRft * balcRate,
      location: 'Balconies & Open Sit-outs',
    });
  }

  // 7.3 Terrace Parapet Safety Extension Railing
  const terraceChoice = fab?.terraceRailing || 'MS Parapet Safety Extension Railing';
  if (!terraceChoice.includes('Brick Parapet Wall with Coping') && floorsCount >= 1) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Metal Fabrication & Railings',
      item: 'Terrace Slab Safety Parapet Railing (3.0 ft height)',
      brand: 'Tubular MS Railing',
      specification: '3-tier horizontal MS tubular safety rail anchored on terrace slab perimeter',
      quantity: 45,
      unit: 'Rft',
      unitRate: 450,
      amount: 45 * 450,
      location: 'Terrace Slab Perimeter',
    });
  }

  // 7.4 Main Driveway Entrance Gate
  if ((input.plotWidth || 0) > 0) {
    slNo++;
    const gateChoice = fab?.mainGate || 'MS Designer Sliding / Swing Gate (10x6 ft)';
    let gateRate = 420;
    let gateSpec = 'Architectural heavy gauge MS frame with sheet accents, roller track, hinges and lock';
    if (gateChoice.includes('Wrought Iron') || gateChoice.includes('Cast Style')) {
      gateRate = 650;
      gateSpec = 'Solid wrought iron forging with ornamental spearheads and polyurethane paint finish';
    } else if (gateChoice.includes('Tubular') || gateChoice.includes('Basic')) {
      gateRate = 280;
      gateSpec = 'Standard hollow MS rectangular tubular sections with primer and enamel finish';
    }
    fixtures.push({
      slNo,
      category: 'Metal Fabrication & Railings',
      item: `Main Driveway Compound Gate (${gateChoice})`,
      brand: 'MS Fabricated Gate',
      specification: gateSpec,
      quantity: 60,
      unit: 'Sq Ft',
      unitRate: gateRate,
      amount: 60 * gateRate,
      location: 'Main Entry Compound Wall',
    });
  }

  // 7.5 Overhead Tank Cat Ladder
  if (floorsCount >= 1) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Metal Fabrication & Railings',
      item: 'Overhead Water Tank Access Cat Ladder with Safety Rungs',
      brand: 'GI / MS Cat Ladder',
      specification: '15 ft vertical hot-dip galvanized or MS safety caged rung ladder',
      quantity: 1,
      unit: 'Units',
      unitRate: 9500,
      amount: 9500,
      location: 'Terrace Headroom / OHT',
    });
  }

  // 7.6 Skylight Unit (When Configured)
  if (fab?.skylight && !fab.skylight.includes('None')) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Windows',
      item: 'Architectural Laminated Safety Glass Skylight Unit',
      brand: 'Toughened Laminated Glass',
      specification: '24 sq.ft 11.52mm clear laminated safety glass set in custom MS/Aluminium frame',
      quantity: 1,
      unit: 'Units',
      unitRate: 18500,
      amount: 18500,
      location: 'Roof / Courtyard Cutout',
    });
  }

  // 7.7 Balcony French Sliding Door (When Balconies Configured)
  if (balconyCount > 0) {
    slNo++;
    fixtures.push({
      slNo,
      category: 'Doors',
      item: 'Balcony French Sliding Door Set (2.5-Track Aluminium / UPVC)',
      brand: 'Fenesta / Geeta Aluminium',
      specification: '5.0 ft × 7.0 ft 2.5-track sliding door with 6mm toughened glass and SS mosquito mesh',
      quantity: balconyCount,
      unit: 'Sets',
      unitRate: 18500,
      amount: balconyCount * 18500,
      location: 'Balconies & Open Sit-outs',
    });
  }

  // 7.8 Exterior Elevation Architectural Cladding (When Configured)
  if (fab?.elevationCladding && !fab.elevationCladding.includes('Paint Only')) {
    slNo++;
    const cladChoice = fab.elevationCladding;
    let cladRate = 280;
    let cladSpec = 'Exterior grade 6mm High Pressure Laminate (HPL) or natural slate/travertine dry cladding';
    if (cladChoice.includes('Texture') || cladChoice.includes('Louver')) {
      cladRate = 140;
      cladSpec = 'Textured acrylic aggregate plaster with aluminium powder-coated architectural box louvers';
    }
    fixtures.push({
      slNo,
      category: 'Elevation & External Finishes',
      item: `Front Façade Architectural Feature Wall Cladding (${cladChoice})`,
      brand: 'HPL / Stone Veneer',
      specification: cladSpec,
      quantity: 180,
      unit: 'Sq Ft',
      unitRate: cladRate,
      amount: 180 * cladRate,
      location: 'Front Elevation Façade',
    });
  }

  return fixtures;
}
