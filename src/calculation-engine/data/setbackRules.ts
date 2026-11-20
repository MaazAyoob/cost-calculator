// ============================================================
// HUTTY 3.2 — CENTRAL SETBACK RULES SYSTEM
// Official Reference: Supplied Bengaluru and Mysuru setback sheets
//
// Rules configuration:
// 1. Up to 60 sq.m. (~645.83 sq.ft):
//    Front: 0.75m (2.46 ft), Rear: 0m, One side: 0.60m (1.97 ft), Other side: 0m
// 2. Above 60 sq.m. up to 150 sq.m. (~645.83 to 1,614.59 sq.ft):
//    Front: 0.90m (2.95 ft), Rear: 0.70m (2.30 ft), One side: 0.70m (2.30 ft), Other side: 0m
// 3. Above 150 sq.m. up to 250 sq.m. (~1,614.59 to 2,690.98 sq.ft):
//    Front: 1.00m (3.28 ft), Rear: 0.80m (2.62 ft), Left: 0.80m (2.62 ft), Right: 0.80m (2.62 ft)
// 4. Above 250 sq.m. (> 2,690.98 sq.ft):
//    Out of scope for simplified rules; requires specialized municipal assessment.
// ============================================================

export interface SetbackDistance {
  meters: number;
  feet: number;
  displayMeters: string;
  displayFeet: string;
  isZero: boolean;
  displayText: string;
}

export interface SetbackBracketRule {
  id: 'UP_TO_60_SQM' | '60_TO_150_SQM' | '150_TO_250_SQM' | 'ABOVE_250_SQM';
  minAreaSqM: number;
  maxAreaSqM: number;
  minAreaSqFt: number;
  maxAreaSqFt: number;
  label: string;
  front: SetbackDistance;
  rear: SetbackDistance;
  left: SetbackDistance;
  right: SetbackDistance;
  sideCondition: 'one_side' | 'both_sides';
  sideConditionNote: string;
  isOutOfScope?: boolean;
}

export interface CitySetbackConfig {
  cityKey: 'Bangalore' | 'Mysore';
  displayName: 'Bengaluru' | 'Mysuru';
  authorityName: string;
  authorityFullName: string;
  disclaimer: string;
  brackets: SetbackBracketRule[];
  maxSupportedAreaSqM: number;
}

// Metres to feet conversion factor (1m = 3.28084 ft)
const M_TO_FT = 3.28084;
// Sq.metres to sq.feet conversion factor (1 sq.m = 10.7639104 sq.ft)
export const SQM_TO_SQFT = 10.7639104;

function createDistance(meters: number, noteSuffix?: string): SetbackDistance {
  const isZero = meters === 0;
  const feet = isZero ? 0 : Number((meters * M_TO_FT).toFixed(2));
  const displayMeters = `${meters.toFixed(2)} m`;
  const displayFeet = isZero ? '0 ft' : `${feet.toFixed(2)} ft`;

  let displayText = isZero
    ? '0 ft — No setback required under this rule'
    : `${feet.toFixed(2)} ft (${meters.toFixed(2)} m)`;

  if (noteSuffix) {
    displayText += ` ${noteSuffix}`;
  }

  return {
    meters,
    feet,
    displayMeters,
    displayFeet,
    isZero,
    displayText,
  };
}

// Shared brackets data based strictly on provided values
const SHARED_BRACKETS: SetbackBracketRule[] = [
  {
    id: 'UP_TO_60_SQM',
    minAreaSqM: 0,
    maxAreaSqM: 60,
    minAreaSqFt: 0,
    maxAreaSqFt: 645.83,
    label: 'Plot area up to 60 sq. m. (approx. 646 sq. ft.)',
    front: createDistance(0.75),
    rear: createDistance(0.0),
    left: createDistance(0.60, '(Required on one side)'),
    right: createDistance(0.0),
    sideCondition: 'one_side',
    sideConditionNote:
      'Under this rule, open space is required on one side only (1.97 ft / 0.60 m); you may build up to the property boundary on the other side.',
  },
  {
    id: '60_TO_150_SQM',
    minAreaSqM: 60.0001,
    maxAreaSqM: 150,
    minAreaSqFt: 645.84,
    maxAreaSqFt: 1614.59,
    label: 'Plot area above 60 sq. m. up to 150 sq. m. (approx. 646 to 1,615 sq. ft.)',
    front: createDistance(0.90),
    rear: createDistance(0.70),
    left: createDistance(0.70, '(Required on one side)'),
    right: createDistance(0.0),
    sideCondition: 'one_side',
    sideConditionNote:
      'Under this rule, open space is required on one side only (2.30 ft / 0.70 m); you may build up to the property boundary on the other side.',
  },
  {
    id: '150_TO_250_SQM',
    minAreaSqM: 150.0001,
    maxAreaSqM: 250,
    minAreaSqFt: 1614.60,
    maxAreaSqFt: 2690.98,
    label: 'Plot area above 150 sq. m. up to 250 sq. m. (approx. 1,615 to 2,691 sq. ft.)',
    front: createDistance(1.00),
    rear: createDistance(0.80),
    left: createDistance(0.80),
    right: createDistance(0.80),
    sideCondition: 'both_sides',
    sideConditionNote:
      'Open space of 2.62 ft (0.80 m) is required on both sides (left and right).',
  },
  {
    id: 'ABOVE_250_SQM',
    minAreaSqM: 250.0001,
    maxAreaSqM: Infinity,
    minAreaSqFt: 2690.99,
    maxAreaSqFt: Infinity,
    label: 'Plot area above 250 sq. m. (approx. 2,691 sq. ft.)',
    front: createDistance(0),
    rear: createDistance(0),
    left: createDistance(0),
    right: createDistance(0),
    sideCondition: 'both_sides',
    sideConditionNote:
      'Plots larger than 250 sq. m. require customized municipal bylaw assessment.',
    isOutOfScope: true,
  },
];

// Kept separate as requested so they can be updated independently later
export const BENGALURU_SETBACK_CONFIG: CitySetbackConfig = {
  cityKey: 'Bangalore',
  displayName: 'Bengaluru',
  authorityName: 'BBMP / BDA',
  authorityFullName: 'Bruhat Bengaluru Mahanagara Palike & Bangalore Development Authority',
  disclaimer:
    'These values are used for planning based on the selected location and plot size. Actual building rules may vary based on road width, plot shape, zone and other local requirements. Please confirm the applicable rules before construction.',
  brackets: SHARED_BRACKETS,
  maxSupportedAreaSqM: 250,
};

export const MYSURU_SETBACK_CONFIG: CitySetbackConfig = {
  cityKey: 'Mysore',
  displayName: 'Mysuru',
  authorityName: 'MUDA',
  authorityFullName: 'Mysuru Urban Development Authority',
  disclaimer:
    'These values are used for planning based on the selected location and plot size. Actual building rules may vary based on road width, plot shape, zone and other local requirements. Please confirm the applicable rules before construction.',
  brackets: SHARED_BRACKETS,
  maxSupportedAreaSqM: 250,
};

export interface SetbackEvaluationParams {
  city?: string | null;
  plotLength: number;
  plotWidth: number;
}

export interface SetbackEvaluationResult {
  // Input reflection
  city: string;
  plotLength: number;
  plotWidth: number;
  plotAreaSqFt: number;
  plotAreaSqM: number;
  isValidDimensions: boolean;

  // Location resolution
  isSupportedLocation: boolean;
  cityConfig?: CitySetbackConfig;
  unsupportedMessage?: string;

  // Scope status
  isOutOfScope: boolean;
  scopeWarning?: string;

  // Matched rule details (when supported and in scope)
  matchedBracket?: SetbackBracketRule;
  bracketLabel: string;
  authorityName: string;

  // Exact distances
  front: SetbackDistance;
  rear: SetbackDistance;
  left: SetbackDistance;
  right: SetbackDistance;
  sideCondition: 'one_side' | 'both_sides';
  sideConditionNote: string;

  // Buildable Geometry
  buildableWidthFt: number;
  buildableDepthFt: number;
  buildableFootprintSqFt: number;
  requiredOpenSpaceSqFt: number;
  isGeometryValid: boolean;

  // Standard homeowner disclaimer
  disclaimer: string;
}

const DEFAULT_DISCLAIMER =
  'These values are used for planning based on the selected location and plot size. Actual building rules may vary based on road width, plot shape, zone and other local requirements. Please confirm the applicable rules before construction.';

export function getCitySetbackConfig(city?: string | null): CitySetbackConfig | null {
  if (!city) return BENGALURU_SETBACK_CONFIG; // default to Bangalore if empty
  const norm = city.toLowerCase().trim();
  if (norm === 'bangalore' || norm === 'bengaluru' || norm === 'bbmp' || norm === 'bda') {
    return BENGALURU_SETBACK_CONFIG;
  }
  if (norm === 'mysore' || norm === 'mysuru' || norm === 'muda') {
    return MYSURU_SETBACK_CONFIG;
  }
  return null;
}

export function evaluatePlotSetbackDetails(params: SetbackEvaluationParams): SetbackEvaluationResult {
  const { city = 'Bangalore', plotLength, plotWidth } = params;
  const safeLength = Math.max(0, plotLength || 0);
  const safeWidth = Math.max(0, plotWidth || 0);
  const plotAreaSqFt = safeLength * safeWidth;
  const plotAreaSqM = Number((plotAreaSqFt / SQM_TO_SQFT).toFixed(2));
  const isValidDimensions = safeLength > 0 && safeWidth > 0;

  const cityConfig = getCitySetbackConfig(city);
  const isSupportedLocation = cityConfig !== null;

  const zeroDistance = createDistance(0);

  // Default fallback object
  const baseResult: SetbackEvaluationResult = {
    city: city || 'Bangalore',
    plotLength: safeLength,
    plotWidth: safeWidth,
    plotAreaSqFt,
    plotAreaSqM,
    isValidDimensions,
    isSupportedLocation,
    cityConfig: cityConfig || undefined,
    isOutOfScope: false,
    bracketLabel: '',
    authorityName: cityConfig?.authorityName || 'Local Authority',
    front: zeroDistance,
    rear: zeroDistance,
    left: zeroDistance,
    right: zeroDistance,
    sideCondition: 'one_side',
    sideConditionNote: '',
    buildableWidthFt: 0,
    buildableDepthFt: 0,
    buildableFootprintSqFt: 0,
    requiredOpenSpaceSqFt: 0,
    isGeometryValid: false,
    disclaimer: cityConfig?.disclaimer || DEFAULT_DISCLAIMER,
  };

  // 1. Unsupported Location Handling
  if (!isSupportedLocation) {
    return {
      ...baseResult,
      unsupportedMessage:
        'Setback rules for the selected location are not currently available. Please select Bengaluru or Mysuru for automatic setback calculations.',
    };
  }

  // 2. Empty/Invalid Dimensions Handling
  if (!isValidDimensions) {
    return {
      ...baseResult,
      bracketLabel: 'Please enter valid plot width and length',
    };
  }

  // 3. Out-of-Scope Plot Area (> 250 sq. m. / ~2,691 sq. ft.)
  if (plotAreaSqM > 250) {
    const outOfScopeBracket = cityConfig.brackets.find((b) => b.isOutOfScope) || cityConfig.brackets[cityConfig.brackets.length - 1];
    return {
      ...baseResult,
      isOutOfScope: true,
      bracketLabel: outOfScopeBracket.label,
      scopeWarning:
        'Plots above 250 sq. m. (approx. 2,691 sq. ft.) require customized zoning and road-width specific bylaw assessment under municipal guidelines. Standard simplified rules do not automatically apply.',
    };
  }

  // 4. In-Scope Bracket Match (≤ 60 sq.m, 60–150 sq.m, 150–250 sq.m)
  const matchedBracket =
    cityConfig.brackets.find((b) => !b.isOutOfScope && plotAreaSqM <= b.maxAreaSqM) ||
    cityConfig.brackets[0];

  const front = matchedBracket.front;
  const rear = matchedBracket.rear;
  const left = matchedBracket.left;
  const right = matchedBracket.right;

  // Geometry calculations
  // For one_side brackets: total side setback deducted from width is left.feet
  // For both_sides brackets: total side setback deducted from width is left.feet + right.feet
  const totalSideSetbackFt = matchedBracket.sideCondition === 'one_side'
    ? left.feet
    : left.feet + right.feet;

  const totalDepthSetbackFt = front.feet + rear.feet;

  const rawBuildableWidth = safeWidth - totalSideSetbackFt;
  const rawBuildableDepth = safeLength - totalDepthSetbackFt;

  const buildableWidthFt = Math.max(0, Number(rawBuildableWidth.toFixed(2)));
  const buildableDepthFt = Math.max(0, Number(rawBuildableDepth.toFixed(2)));
  const buildableFootprintSqFt = Math.round(buildableWidthFt * buildableDepthFt);
  const requiredOpenSpaceSqFt = Math.max(0, plotAreaSqFt - buildableFootprintSqFt);
  const isGeometryValid = buildableWidthFt > 0 && buildableDepthFt > 0;

  return {
    ...baseResult,
    matchedBracket,
    bracketLabel: matchedBracket.label,
    front,
    rear,
    left,
    right,
    sideCondition: matchedBracket.sideCondition,
    sideConditionNote: matchedBracket.sideConditionNote,
    buildableWidthFt,
    buildableDepthFt,
    buildableFootprintSqFt,
    requiredOpenSpaceSqFt,
    isGeometryValid,
  };
}
