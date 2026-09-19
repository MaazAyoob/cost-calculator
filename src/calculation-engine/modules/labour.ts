// ============================================================
// LABOUR ENGINE MODULE – SECTION 8: LABOUR BUDGET
// Strictly follows Hutty Pilot Specification (Section 8) and
// Minutes of Meeting (September 19, 2026)
//
// Rules:
// - Labour is strictly separated from materials and fixtures.
// - Benchmark civil rates (Bengaluru):
//   * Standard: ₹350 / sqft BUA
//   * Premium:  ₹380 / sqft BUA
//   * Luxury:   ₹400 / sqft BUA
// - Anti-Double-Counting Rule:
//   When Composite Civil Labour is active, it covers excavation, PCC,
//   RCC framing, formwork, masonry laying, and plastering.
//   It does NOT double count separate masonry or plaster labour.
// - Specialized finishing installation trades (electrical, plumbing,
//   flooring, painting, waterproofing, openings) are explicitly itemized.
// - Every line item: amount = quantity × unitRate.
// ============================================================

import {
  EngineInput,
  AreaResult,
  MaterialQuantities,
  BuildingModel,
  LabourScheduleItem,
} from '../types';
import { rateService } from '../data/rateService';
import { configResolver } from '../config';

export interface LabourCalculationResult {
  items: LabourScheduleItem[];
  totalLabourCost: number;
  civilLabourCost: number;
  finishingLabourCost: number;
  mepLabourCost: number;
}

export function calculateLabour(
  input: EngineInput,
  area: AreaResult,
  quantities: MaterialQuantities,
  buildingModel: BuildingModel
): LabourCalculationResult {
  const bua = area.totalBUASqFt || 0;
  const isZeroState = bua <= 0 && (area.plotAreaSqFt || 0) <= 0;

  if (isZeroState) {
    return {
      items: [],
      totalLabourCost: 0,
      civilLabourCost: 0,
      finishingLabourCost: 0,
      mepLabourCost: 0,
    };
  }

  const city = input.city || 'Bangalore';
  const isMysuru = city.toLowerCase().includes('my');
  const tier = (input.qualityTier || 'Premium').toLowerCase();

  // 1. Civil Labour Starting Benchmark resolved via Configuration Resolver (Sept 19 Meeting)
  // Bengaluru: Standard ₹350, Premium ₹380, Luxury ₹400
  // Mysuru: Standard ₹310, Premium ₹335, Luxury ₹350
  const normalizedTier = tier.includes('standard') || tier.includes('essential')
    ? 'Standard'
    : tier.includes('luxury')
    ? 'Luxury'
    : 'Premium';
  const locKey = isMysuru ? 'Mysore' : 'Bangalore';
  const benchmarkConfig = configResolver.getLabourBenchmark('civil_composite');
  const rateLookupKey = `${locKey}_${normalizedTier}`;
  const defaultCivilSqFtRate = benchmarkConfig?.rates[rateLookupKey] ?? (isMysuru ? 335 : 380);

  const rateCtx = {
    packageTier: input.qualityTier,
    location: input.city,
  };

  const civilRate = rateService.getEffectiveRate(
    'labour.civil_composite',
    rateCtx,
    defaultCivilSqFtRate
  );

  const items: LabourScheduleItem[] = [];
  let slNo = 0;

  // ── 1. Composite Civil & Structural Labour Package ──
  slNo++;
  const civilAmount = Math.round(bua * civilRate);
  items.push({
    slNo,
    trade: 'Composite Civil & Structural Labour Package',
    category: 'Civil & Structure',
    scope: 'Earthwork assistance, PCC levelling, footing RCC, plinth beam, column caging, beam/slab shuttering & casting, block masonry laying & 2-coat internal/external plastering',
    basis: 'Total Built-Up Area',
    quantity: bua,
    unit: 'Sq Ft',
    unitRate: civilRate,
    amount: civilAmount,
    notes: `Comprehensive civil contract @ ₹${civilRate}/sq.ft benchmark. Fully covers all structural shuttering, bar bending, masonry laying & plastering.`,
  });

  // ── 2. Electrical Installation Labour ──
  // Based on total electrical points (lighting, power sockets, AC/geyser points, DB fixing)
  const defaultElecPointRate = tier.includes('luxury') ? 140 : tier.includes('standard') || tier.includes('essential') ? 100 : 120;
  const elecPointRate = rateService.getEffectiveRate('labour.electrical_point', rateCtx, defaultElecPointRate);
  const totalElecPoints = quantities.totalElectricalPoints || Math.round(bua * 0.05);
  const elecAmount = Math.round(totalElecPoints * elecPointRate);

  slNo++;
  items.push({
    slNo,
    trade: 'Electrical Point Wiring & Distribution Labour',
    category: 'Electrical',
    scope: 'Concealed conduit slot chasing & laying, FRLS wire pulling, modular switch/socket termination, distribution board cabling & earthing spike installation',
    basis: 'Electrical Points Schedule',
    quantity: totalElecPoints,
    unit: 'Points',
    unitRate: elecPointRate,
    amount: elecAmount,
    notes: `Licensed electrician trade contract @ ₹${elecPointRate}/point.`,
  });

  // ── 3. Plumbing & Sanitary Installation Labour ──
  // Sized by total bathrooms/wet points + kitchen sink + overhead/sump connection
  const bathCount = (input.rooms?.bathrooms || 0) + (input.rooms?.commonToilets || 0);
  const defaultPlumbBathRate = tier.includes('luxury') ? 8500 : tier.includes('standard') || tier.includes('essential') ? 6000 : 7200;
  const plumbBathRate = rateService.getEffectiveRate('labour.plumbing_toilet', rateCtx, defaultPlumbBathRate);
  const plumbQty = Math.max(1, bathCount);
  const plumbAmount = Math.round(plumbQty * plumbBathRate);

  slNo++;
  items.push({
    slNo,
    trade: 'Plumbing, Water Supply & Sanitary Installation Labour',
    category: 'Plumbing',
    scope: 'Concealed CPVC hot/cold distribution lines, SWR drainage line & floor trap laying, wall-hung EWC & concealed cistern mounting, basin/shower/mixer fixture installation, and terrace tank connection',
    basis: 'Bathroom / Wet Core Units',
    quantity: plumbQty,
    unit: 'Units',
    unitRate: plumbBathRate,
    amount: plumbAmount,
    notes: `Certified plumber trade contract @ ₹${plumbBathRate}/toilet core including kitchen & terrace connections.`,
  });

  // ── 4. Flooring & Wall Cladding Tiling Labour ──
  // Sized by actual square footage of floor tiles + wall dado tiles
  const totalTiledArea = (quantities.floorTilesSqFt || 0) + (quantities.wallTilesSqFt || 0);
  const defaultTileRate = tier.includes('luxury') ? 45 : tier.includes('standard') || tier.includes('essential') ? 32 : 38;
  const tileRate = rateService.getEffectiveRate('labour.flooring_tiling', rateCtx, defaultTileRate);
  const tileAmount = Math.round(totalTiledArea * tileRate);

  if (totalTiledArea > 0) {
    slNo++;
    items.push({
      slNo,
      trade: 'Flooring & Wall Dado Tile Laying Labour',
      category: 'Flooring & Tiling',
      scope: 'Mortar screed preparation, tile cutting, pattern alignment, adhesive/cement bed laying, skirting installation, and epoxy/cementitious grout filling',
      basis: 'Floor & Wall Tile Area',
      quantity: totalTiledArea,
      unit: 'Sq Ft',
      unitRate: tileRate,
      amount: tileAmount,
      notes: `Specialist tiler labour @ ₹${tileRate}/sq.ft across rooms, bathrooms & kitchen.`,
    });
  }

  // ── 5. Painting & Surface Finishing Labour ──
  // Sized by total paintable area (internal walls + ceiling + external walls)
  const paintableArea = quantities.totalPaintableAreaSqFt || Math.round(bua * 2.8);
  const defaultPaintRate = tier.includes('luxury') ? 22 : tier.includes('standard') || tier.includes('essential') ? 14 : 18;
  const paintRate = rateService.getEffectiveRate('labour.painting_finishes', rateCtx, defaultPaintRate);
  const paintAmount = Math.round(paintableArea * paintRate);

  if (paintableArea > 0) {
    slNo++;
    items.push({
      slNo,
      trade: 'Painting & Surface Preparation Labour',
      category: 'Painting & Finishes',
      scope: 'Surface sanding & wall cleaning, 2 coats of acrylic wall putty, 1 coat of interior/exterior primer, and 2 finish coats of premium emulsion',
      basis: 'Paintable Surface Area',
      quantity: paintableArea,
      unit: 'Sq Ft',
      unitRate: paintRate,
      amount: paintAmount,
      notes: `Skilled painter trade @ ₹${paintRate}/sq.ft for multi-coat application.`,
    });
  }

  // ── 6. Waterproofing Application Labour ──
  const wpArea = quantities.waterproofingAreaSqFt || Math.round(bua * 0.4);
  const defaultWpRate = 18;
  const wpRate = rateService.getEffectiveRate('labour.waterproofing_app', rateCtx, defaultWpRate);
  const wpAmount = Math.round(wpArea * wpRate);

  if (wpArea > 0) {
    slNo++;
    items.push({
      slNo,
      trade: 'Specialized Waterproofing Application Labour',
      category: 'Waterproofing',
      scope: 'Surface chipping, pressure wash, polymer-modified cementitious coating application (2 coats), fiber mesh reinforcement, and water ponding test',
      basis: 'Waterproofed Surface Area',
      quantity: wpArea,
      unit: 'Sq Ft',
      unitRate: wpRate,
      amount: wpAmount,
      notes: `Terrace roof, bathroom sunken slab & sump waterproofing labour @ ₹${wpRate}/sq.ft.`,
    });
  }

  // ── 7. Doors & Windows Fixing Labour ──
  const totalOpenings = (quantities.totalDoorsCount || 0) + (quantities.windowsCount || 0);
  const defaultOpeningFixRate = 650;
  const openingFixRate = rateService.getEffectiveRate('labour.openings_fixing', rateCtx, defaultOpeningFixRate);
  const openingAmount = Math.round(totalOpenings * openingFixRate);

  if (totalOpenings > 0) {
    slNo++;
    items.push({
      slNo,
      trade: 'Doors & Windows Carpenter / Fabricator Installation Labour',
      category: 'Doors & Windows',
      scope: 'Holdfast anchoring, frame plumbing & true alignment, door shutter hanging with mortise lock & hinges, and window track silicone sealing',
      basis: 'Openings Schedule',
      quantity: totalOpenings,
      unit: 'Openings',
      unitRate: openingFixRate,
      amount: openingAmount,
      notes: `Carpenter / glazing fixing labour @ ₹${openingFixRate}/opening.`,
    });
  }

  // Aggregate totals
  const totalLabourCost = items.reduce((acc, it) => acc + it.amount, 0);
  const civilLabourCost = civilAmount;
  const finishingLabourCost = tileAmount + paintAmount + wpAmount + openingAmount;
  const mepLabourCost = elecAmount + plumbAmount;

  return {
    items,
    totalLabourCost,
    civilLabourCost,
    finishingLabourCost,
    mepLabourCost,
  };
}
