// ============================================================
// CANONICAL UNIT GOVERNANCE REGISTRY
// Centralized, controlled measurement units for all construction domains
// ============================================================

export type QuantityUnit =
  | 'sqft'
  | 'sqm'
  | 'cft'
  | 'cum'
  | 'kg'
  | 'tonne'
  | 'bag'
  | 'litre'
  | 'nos'
  | 'point'
  | 'running_ft'
  | 'set'
  | 'module'
  | 'unit';

export type ConstructionDomain =
  | 'rcc'
  | 'steel'
  | 'cement'
  | 'sand'
  | 'aggregate'
  | 'masonry'
  | 'flooring'
  | 'wall_tiles'
  | 'paint'
  | 'putty'
  | 'waterproofing'
  | 'doors'
  | 'windows'
  | 'electrical'
  | 'plumbing'
  | 'sanitary'
  | 'labour';

export interface DomainUnitDefinition {
  domain: ConstructionDomain;
  primaryUnit: QuantityUnit;
  displayUnit: string;
  secondaryUnit?: QuantityUnit;
  secondaryDisplayUnit?: string;
  description: string;
}

export const DOMAIN_UNITS: Record<ConstructionDomain, DomainUnitDefinition> = {
  rcc: {
    domain: 'rcc',
    primaryUnit: 'cum',
    displayUnit: 'm³',
    description: 'Cubic metres for all structural reinforced concrete',
  },
  steel: {
    domain: 'steel',
    primaryUnit: 'tonne',
    displayUnit: 'Tonnes',
    secondaryUnit: 'kg',
    secondaryDisplayUnit: 'kg',
    description: 'Weight of rebar reinforcement in tonnes or kg',
  },
  cement: {
    domain: 'cement',
    primaryUnit: 'bag',
    displayUnit: 'Bags',
    description: 'Standard 50 kg moisture-proof cement bags',
  },
  sand: {
    domain: 'sand',
    primaryUnit: 'cft',
    displayUnit: 'CFT',
    description: 'Cubic feet of M-Sand or P-Sand',
  },
  aggregate: {
    domain: 'aggregate',
    primaryUnit: 'cft',
    displayUnit: 'CFT',
    description: 'Cubic feet of coarse blue metal granite aggregate',
  },
  masonry: {
    domain: 'masonry',
    primaryUnit: 'sqft',
    displayUnit: 'sq.ft',
    secondaryUnit: 'nos',
    secondaryDisplayUnit: 'Nos.',
    description: 'Net wall area & block wall coverage in sq.ft; discrete blocks in Nos.',
  },
  flooring: {
    domain: 'flooring',
    primaryUnit: 'sqft',
    displayUnit: 'sq.ft',
    description: 'Square feet of floor tiles, granite, or marble',
  },
  wall_tiles: {
    domain: 'wall_tiles',
    primaryUnit: 'sqft',
    displayUnit: 'sq.ft',
    description: 'Square feet of bathroom and kitchen wall dado cladding',
  },
  paint: {
    domain: 'paint',
    primaryUnit: 'litre',
    displayUnit: 'Litres',
    description: 'Liquid volume of interior and exterior emulsion coats',
  },
  putty: {
    domain: 'putty',
    primaryUnit: 'kg',
    displayUnit: 'kg',
    description: 'Kilograms of white polymer-modified acrylic wall putty',
  },
  waterproofing: {
    domain: 'waterproofing',
    primaryUnit: 'sqft',
    displayUnit: 'sq.ft',
    description: 'Square feet of elastomeric waterproofing membrane',
  },
  doors: {
    domain: 'doors',
    primaryUnit: 'nos',
    displayUnit: 'Nos.',
    secondaryUnit: 'sqft',
    secondaryDisplayUnit: 'sq.ft',
    description: 'Door shutter count or opening area',
  },
  windows: {
    domain: 'windows',
    primaryUnit: 'sqft',
    displayUnit: 'sq.ft',
    secondaryUnit: 'nos',
    secondaryDisplayUnit: 'Nos.',
    description: 'Window glazed opening area in sq.ft; opening count in Nos.',
  },
  electrical: {
    domain: 'electrical',
    primaryUnit: 'point',
    displayUnit: 'Points',
    secondaryUnit: 'running_ft',
    secondaryDisplayUnit: 'Metres',
    description: 'Connected electrical points or conduit/wiring metres',
  },
  plumbing: {
    domain: 'plumbing',
    primaryUnit: 'point',
    displayUnit: 'Points',
    secondaryUnit: 'running_ft',
    secondaryDisplayUnit: 'Metres',
    description: 'Water and drainage points; piping in metres',
  },
  sanitary: {
    domain: 'sanitary',
    primaryUnit: 'nos',
    displayUnit: 'Sets',
    description: 'Sanitary fixtures (WC, basin, shower, faucets) in Nos. or Sets',
  },
  labour: {
    domain: 'labour',
    primaryUnit: 'sqft',
    displayUnit: 'sq.ft',
    description: 'Labour execution rate basis (primarily ₹/sq.ft BUA)',
  },
};

/**
 * Normalizes free-text or legacy unit strings into canonical customer-facing display units.
 */
export function formatUnitLabel(rawUnit?: string): string {
  if (!rawUnit) return '';
  const u = rawUnit.trim().toLowerCase();

  switch (u) {
    case 'cum':
    case 'cu m':
    case 'cu.m':
    case 'cu. m':
    case 'cubic metre':
    case 'cubic metres':
    case 'm3':
    case 'm³':
      return 'm³';

    case 'sqft':
    case 'sq.ft':
    case 'sq ft':
    case 'sq. ft':
    case 'square feet':
    case 'square foot':
      return 'sq.ft';

    case 'cft':
    case 'cu ft':
    case 'cu.ft':
    case 'cu. ft':
    case 'cubic feet':
      return 'CFT';

    case 'tonne':
    case 'tonnes':
    case 'mt':
    case 'metric tonne':
      return 'Tonnes';

    case 'kg':
    case 'kgs':
    case 'kilogram':
    case 'kilograms':
      return 'kg';

    case 'bag':
    case 'bags':
    case 'bags (50 kg)':
    case 'bags (50kg)':
      return 'Bags';

    case 'litre':
    case 'litres':
    case 'l':
      return 'Litres';

    case 'nos':
    case 'nos.':
    case 'no':
    case 'pieces':
    case 'pcs':
      return 'Nos.';

    case 'point':
    case 'points':
    case 'pts':
      return 'Points';

    case 'running_ft':
    case 'rft':
    case 'r.ft':
    case 'rm':
    case 'rmt':
    case 'metre':
    case 'metres':
    case 'm':
      return 'Metres';

    case 'set':
    case 'sets':
      return 'Sets';

    case 'module':
    case 'modules':
      return 'Modules';

    case 'unit':
    case 'units':
      return 'Units';

    default:
      return rawUnit;
  }
}
