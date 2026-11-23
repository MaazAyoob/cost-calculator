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
  authorityFullName: 'Bruhat Bengaluru Mahanagara Palike & Bangalore Development Authority / Greater Bengaluru Authority (GBA)',
  disclaimer:
    'These values are used for planning based on the selected location and plot size. Actual building rules may vary based on road width, plot shape, zone and other local requirements. Please confirm the applicable rules before construction.',
  brackets: SHARED_BRACKETS,
  maxSupportedAreaSqM: 250,
};

export const MYSURU_SETBACK_CONFIG: CitySetbackConfig = {
  cityKey: 'Mysore',
  displayName: 'Mysuru',
  authorityName: 'MUDA',
  authorityFullName: 'Mysuru Urban Development Authority (MDA / MUDA) & Mysuru City Corporation (MCC)',
  disclaimer:
    'These values are used for planning based on the selected location and plot size. Actual building rules may vary based on road width, plot shape, zone and other local requirements. Please confirm the applicable rules before construction.',
  brackets: SHARED_BRACKETS,
  maxSupportedAreaSqM: 250,
};

export interface SetbackEvaluationParams {
  city?: string | null;
  plotLength: number;
  plotWidth: number;
  selectedSideSetback?: 'left' | 'right';
}

export interface SetbackEvaluationResult {
  // Input reflection
  city: string;
  plotLength: number;
  plotWidth: number;
  plotAreaSqFt: number;
  plotAreaSqM: number;
  isValidDimensions: boolean;
  selectedSide: 'left' | 'right';

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
  groundCoveragePct: number;
  isGeometryValid: boolean;

  // Standard homeowner disclaimer
  disclaimer: string;
}

const DEFAULT_DISCLAIMER =
  'These values are used for planning based on the selected location and plot size. Actual building rules may vary based on road width, plot shape, zone and other local requirements. Please confirm the applicable rules before construction.';

export function getCitySetbackConfig(city?: string | null): CitySetbackConfig | null {
  if (!city) return BENGALURU_SETBACK_CONFIG; // default to Bangalore if empty
  const norm = city.toLowerCase().trim();
  if (norm === 'bangalore' || norm === 'bengaluru' || norm === 'bbmp' || norm === 'bda' || norm === 'gba') {
    return BENGALURU_SETBACK_CONFIG;
  }
  if (norm === 'mysore' || norm === 'mysuru' || norm === 'muda' || norm === 'mda' || norm === 'mcc') {
    return MYSURU_SETBACK_CONFIG;
  }
  return null;
}

export function evaluatePlotSetbackDetails(params: SetbackEvaluationParams): SetbackEvaluationResult {
  const { city = 'Bangalore', plotLength, plotWidth, selectedSideSetback = 'left' } = params;
  const safeLength = Math.max(0, plotLength || 0);
  const safeWidth = Math.max(0, plotWidth || 0);
  const plotAreaSqFt = safeLength * safeWidth;
  const plotAreaSqM = Number((plotAreaSqFt / SQM_TO_SQFT).toFixed(2));
  const isValidDimensions = safeLength > 0 && safeWidth > 0;
  const selectedSide = selectedSideSetback === 'right' ? 'right' : 'left';

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
    selectedSide,
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
    groundCoveragePct: 0,
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
      matchedBracket: outOfScopeBracket,
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

  // Handle one-side rule vs both-sides rule
  let left = matchedBracket.left;
  let right = matchedBracket.right;

  if (matchedBracket.sideCondition === 'one_side') {
    const singleSideDistance = matchedBracket.left; // 0.60m (1.97 ft) or 0.70m (2.30 ft)
    if (selectedSide === 'right') {
      left = zeroDistance;
      right = singleSideDistance;
    } else {
      left = singleSideDistance;
      right = zeroDistance;
    }
  }

  // Geometry calculations strictly following:
  // Buildable width = plot width - left setback - right setback
  // Buildable depth = plot depth - front setback - rear setback
  // Buildable footprint = buildable width * buildable depth
  const totalSideSetbackFt = left.feet + right.feet;
  const totalDepthSetbackFt = front.feet + rear.feet;

  const rawBuildableWidth = safeWidth - totalSideSetbackFt;
  const rawBuildableDepth = safeLength - totalDepthSetbackFt;

  const buildableWidthFt = Math.max(0, Number(rawBuildableWidth.toFixed(2)));
  const buildableDepthFt = Math.max(0, Number(rawBuildableDepth.toFixed(2)));
  const buildableFootprintSqFt = Math.round(buildableWidthFt * buildableDepthFt);
  const requiredOpenSpaceSqFt = Math.max(0, plotAreaSqFt - buildableFootprintSqFt);
  const groundCoveragePct = plotAreaSqFt > 0 ? Math.round((buildableFootprintSqFt / plotAreaSqFt) * 100) : 0;
  const isGeometryValid = buildableWidthFt > 0 && buildableDepthFt > 0;

  return {
    ...baseResult,
    matchedBracket,
    bracketLabel: matchedBracket.label,
    front,
    rear,
    left,
    right,
    selectedSide,
    sideCondition: matchedBracket.sideCondition,
    sideConditionNote: matchedBracket.sideConditionNote,
    buildableWidthFt,
    buildableDepthFt,
    buildableFootprintSqFt,
    requiredOpenSpaceSqFt,
    groundCoveragePct,
    isGeometryValid,
  };
}

// ============================================================
// CITY-SPECIFIC BUILDING HEIGHT & PLANNING RULES (AUTHORITATIVE)
// References:
// 1. Bengaluru: GBA & BDA Jan 2026 Gazette Developer Guide
// 2. Mysuru: MDA (MUDA) & MCC Master Plan II-2031
// ============================================================

export interface BuildingHeightParams {
  city?: string | null;
  numFloors?: number;
  parkingType?: string | null;
  hasStilt?: boolean;
  roadWidthFt?: number;
}

export interface BuildingHeightResult {
  cityKey: 'Bangalore' | 'Mysore' | 'Other';
  cityName: string;
  numFloors: number;
  hasStilt: boolean;
  roadWidthFt: number;
  roadWidthM: number;
  plinthHeightFt: number;
  plinthHtFt: number;
  floorToFloorHeightFt: number;
  floorHtFt: number;
  terraceSlabHeightFt: number;
  parapetHeightFt: number;
  parapetTopHeightFt: number;
  staircaseHeadroomHeightFt: number;
  stairHtFt: number;
  totalProposedHeightFt: number;
  totalProposedHeightM: number;
  maxPermittedHeightFt: number;
  maxPermittedHeightM: number;
  isRoadWidthRestricted: boolean;
  isHighRise: boolean;
  isCompliant: boolean;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'HIGH_RISE_REVIEW';
  statusBadge: string;
  ruleTitle: string;
  ruleDescription: string;
  roadWidthConditionNote?: string;
}

export function evaluateBuildingHeight(params: BuildingHeightParams): BuildingHeightResult {
  const { city = 'Bangalore', numFloors = 2, parkingType, roadWidthFt = 30 } = params;
  const cityConfig = getCitySetbackConfig(city);
  const cityKey = cityConfig?.cityKey || 'Other';
  const cityName = cityConfig?.displayName || city || 'Other';
  const effectiveFloors = Math.max(1, numFloors);
  const hasStilt = params.hasStilt ?? (parkingType === 'Stilt' || parkingType === 'Stilt Parking');
  const safeRoadWidthFt = Math.max(10, roadWidthFt);
  const roadWidthM = Number((safeRoadWidthFt * 0.3048).toFixed(2));

  // Technical structural level breakdown
  const plinthHeightFt = 2.50;
  const floorToFloorHeightFt = 10.00;
  const terraceSlabHeightFt = Number((plinthHeightFt + effectiveFloors * floorToFloorHeightFt).toFixed(2));
  const parapetHeightFt = 3.00;
  const parapetTopHeightFt = Number((terraceSlabHeightFt + parapetHeightFt).toFixed(2));
  const staircaseHeadroomHeightFt = 7.50;
  const totalProposedHeightFt = Number((terraceSlabHeightFt + staircaseHeadroomHeightFt).toFixed(2));
  const totalProposedHeightM = Number((totalProposedHeightFt * 0.3048).toFixed(2));

  let maxPermittedHeightFt = 39.37;
  let maxPermittedHeightM = 12.00;
  let isRoadWidthRestricted = false;
  let ruleTitle = '';
  let ruleDescription = '';
  let roadWidthConditionNote: string | undefined = undefined;

  if (cityKey === 'Mysore') {
    ruleTitle = 'Mysuru Residential Building Rules (MDA / MUDA & MCC Master Plan II-2031)';
    // Crucial Mysuru road-width restriction: If road width in front of site < 9.0m (approx 29.5 ft), height capped at 37.73 ft (11.5m)
    if (roadWidthM < 9.0) {
      isRoadWidthRestricted = true;
      maxPermittedHeightFt = 37.73;
      maxPermittedHeightM = 11.50;
      roadWidthConditionNote = `Road width is ${safeRoadWidthFt} ft (${roadWidthM}m), which is less than 9.0m (29.5 ft). Under Mysuru Master Plan II-2031, building height is capped at 37.73 ft (11.5m).`;
      ruleDescription = `Narrow road restriction: Road width < 9.0m caps building height at 37.73 ft (11.5m).`;
    } else {
      isRoadWidthRestricted = false;
      maxPermittedHeightFt = hasStilt ? 49.21 : 39.37;
      maxPermittedHeightM = hasStilt ? 15.00 : 12.00;
      ruleDescription = hasStilt
        ? `With stilt parking: Maximum building height = 49.21 ft (15.0m).`
        : `Without stilt parking: Maximum building height = 39.37 ft (12.0m).`;
    }
  } else {
    // Bengaluru (GBA & BDA - Jan 2026 Gazette)
    ruleTitle = 'Bengaluru Residential Building Rules (GBA & BDA Jan 2026 Gazette)';
    isRoadWidthRestricted = false; // Bengaluru reference does NOT specify Mysuru road-width restriction
    maxPermittedHeightFt = hasStilt ? 49.21 : 39.37;
    maxPermittedHeightM = hasStilt ? 15.00 : 12.00;
    ruleDescription = hasStilt
      ? `With stilt floor: Maximum building height = 49.21 ft (15.0m).`
      : `Without stilt floor: Maximum building height = 39.37 ft (12.0m).`;
  }

  const isHighRise = totalProposedHeightFt > 49.21;
  const isCompliant = totalProposedHeightFt <= maxPermittedHeightFt;

  let complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'HIGH_RISE_REVIEW' = 'COMPLIANT';
  let statusBadge = 'STATUS: FULLY COMPLIANT';

  if (isHighRise) {
    complianceStatus = 'HIGH_RISE_REVIEW';
    statusBadge = 'HIGH-RISE REVIEW REQUIRED (> 49.21 FT)';
  } else if (!isCompliant) {
    complianceStatus = 'NON_COMPLIANT';
    statusBadge = `EXCEEDS STATUTORY CEILING (${totalProposedHeightFt.toFixed(1)} FT > ${maxPermittedHeightFt.toFixed(1)} FT)`;
  }

  return {
    cityKey,
    cityName,
    numFloors: effectiveFloors,
    hasStilt,
    roadWidthFt: safeRoadWidthFt,
    roadWidthM,
    plinthHeightFt,
    plinthHtFt: plinthHeightFt,
    floorToFloorHeightFt,
    floorHtFt: floorToFloorHeightFt,
    terraceSlabHeightFt,
    parapetHeightFt,
    parapetTopHeightFt,
    staircaseHeadroomHeightFt,
    stairHtFt: staircaseHeadroomHeightFt,
    totalProposedHeightFt,
    totalProposedHeightM,
    maxPermittedHeightFt,
    maxPermittedHeightM,
    isRoadWidthRestricted,
    isHighRise,
    isCompliant,
    complianceStatus,
    statusBadge,
    ruleTitle,
    ruleDescription,
    roadWidthConditionNote,
  };
}

export interface PlanningLimitsResult {
  cityKey: 'Bangalore' | 'Mysore' | 'Other';
  maxGroundCoveragePct: number;
  isCoverageStatutory: boolean;
  coverageLabel: string;
  coverageNotes: string;
  coverageSourceNote: string;
  maxFAR: number;
  baseFAR: number;
  isFARStatutory: boolean;
  farLabel: string;
  farNotes: string;
  farSourceNote: string;
}

export function getCityPlanningLimits(city?: string | null): PlanningLimitsResult {
  const norm = (city || '').toLowerCase().trim();
  const isMysuru = norm === 'mysore' || norm === 'mysuru' || norm === 'muda' || norm === 'mda' || norm === 'mcc';

  if (isMysuru) {
    const coverageNotes = 'MUDA Master Plan II-2031: Maximum Ground Coverage = 75% for residential plots up to 250 sq.m.';
    const farNotes = 'MUDA Master Plan II-2031: Maximum FAR = 1.50 for plots up to 360 sq.m in Residential (Main) zone.';
    return {
      cityKey: 'Mysore',
      maxGroundCoveragePct: 75,
      isCoverageStatutory: true,
      coverageLabel: '75% Max (Statutory)',
      coverageNotes,
      coverageSourceNote: coverageNotes,
      maxFAR: 1.50,
      baseFAR: 1.50,
      isFARStatutory: true,
      farLabel: '1.50 (Statutory)',
      farNotes,
      farSourceNote: farNotes,
    };
  }

  // Bengaluru or Other: Jan 2026 Gazette summary does not establish ground coverage or FAR
  const bngCoverageNotes = 'Standard residential planning assumption. The Jan 2026 Gazette reference does not specify ground coverage; subject to municipal verification.';
  const bngFarNotes = 'Standard residential planning assumption. The Jan 2026 Gazette reference does not specify FAR; subject to municipal verification.';
  return {
    cityKey: 'Bangalore',
    maxGroundCoveragePct: 70,
    isCoverageStatutory: false,
    coverageLabel: '70% Estimated (Planning Assumption)',
    coverageNotes: bngCoverageNotes,
    coverageSourceNote: bngCoverageNotes,
    maxFAR: 1.75,
    baseFAR: 1.75,
    isFARStatutory: false,
    farLabel: '1.75 Estimated (Planning Assumption)',
    farNotes: bngFarNotes,
    farSourceNote: bngFarNotes,
  };
}
