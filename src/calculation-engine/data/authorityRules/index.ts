import {
  AuthorityRuleSet,
  AuthorityCalculationResult,
  PlotSetbackRule,
  SetbackExplanationStep,
  VerificationStatus,
  SetbackMethod,
} from './types';
import { BENGALURU_AUTHORITY_RULES } from './bengaluru';
import { MYSURU_AUTHORITY_RULES } from './mysuru';
import { GRAM_PANCHAYAT_AUTHORITY_RULES } from './gramPanchayat';
import { GBA_2026_SETBACK_RULES } from './gbaRules';
import { SetbackGeometry } from '../../types';

export * from './types';
export { BENGALURU_AUTHORITY_RULES, GBA_2026_SETBACK_RULES } from './bengaluru';
export { MYSURU_AUTHORITY_RULES } from './mysuru';
export { GRAM_PANCHAYAT_AUTHORITY_RULES } from './gramPanchayat';
export { GBA_2026_SETBACK_RULES as BASELINE_GBA_SETBACK_RULES } from './gbaRules';

const AUTHORITY_REGISTRY: Record<string, AuthorityRuleSet> = {
  bangalore: BENGALURU_AUTHORITY_RULES,
  bengaluru: BENGALURU_AUTHORITY_RULES,
  bbmp: BENGALURU_AUTHORITY_RULES,
  bda: BENGALURU_AUTHORITY_RULES,
  gba: BENGALURU_AUTHORITY_RULES,
  mysore: MYSURU_AUTHORITY_RULES,
  mysuru: MYSURU_AUTHORITY_RULES,
  muda: MYSURU_AUTHORITY_RULES,
  'gram panchayat': GRAM_PANCHAYAT_AUTHORITY_RULES,
  'grama panchayat': GRAM_PANCHAYAT_AUTHORITY_RULES,
  panchayat: GRAM_PANCHAYAT_AUTHORITY_RULES,
  rural: GRAM_PANCHAYAT_AUTHORITY_RULES,
};

/**
 * Returns the verified authority rule set for a given city or municipal authority
 */
export function getAuthorityRules(cityOrAuthority?: string | null): AuthorityRuleSet {
  const normalized = (cityOrAuthority || 'bangalore').toLowerCase().trim();
  return AUTHORITY_REGISTRY[normalized] || BENGALURU_AUTHORITY_RULES;
}

export interface EvaluatePlotSetbacksParams {
  plotLength: number;
  plotWidth: number;
  roadWidthFt?: number;
  roadFacingBoundaries?: Array<'front' | 'rear' | 'left' | 'right'>;
  isCornerPlot?: boolean;
  roadWideningFt?: number;
  prescribedBuildingLineFt?: number;
  customSetbacks?: Partial<SetbackGeometry>;
  rules?: PlotSetbackRule[];
  overrideReason?: string;
}

export interface EvaluatePlotSetbacksResult {
  matchedRule?: PlotSetbackRule;
  statutoryFrontFt: number;
  statutoryRearFt: number;
  statutoryLeftFt: number;
  statutoryRightFt: number;
  appliedFrontFt: number;
  appliedRearFt: number;
  appliedLeftFt: number;
  appliedRightFt: number;
  buildableLengthFt: number;
  buildableWidthFt: number;
  buildableFootprintSqFt: number;
  maxGroundCoveragePct: number;
  isAuthoritativeBuildableResolved: boolean;
  unresolvedReasons: string[];
  explanationSteps: SetbackExplanationStep[];
  verificationStatus: VerificationStatus;
}

/**
 * Evaluates boundary setbacks, buildable dimensions, and explanations
 * using the configured Plot Setback Rules (GBA 2026 amendment / custom published).
 */
export function evaluatePlotSetbacks(params: EvaluatePlotSetbacksParams): EvaluatePlotSetbacksResult {
  const {
    plotLength,
    plotWidth,
    roadFacingBoundaries = ['front'],
    isCornerPlot = false,
    roadWideningFt = 0,
    prescribedBuildingLineFt = 0,
    customSetbacks,
    rules = GBA_2026_SETBACK_RULES,
    overrideReason,
  } = params;

  const plotAreaSqFt = Math.max(0, plotLength * plotWidth);
  const activeRules = rules.filter((r) => r.isActive !== false);

  // 1. Match Rule by Plot Area Range
  const matchingRules = activeRules.filter((r) => {
    const minPass = r.isMinInclusive !== false ? plotAreaSqFt >= r.minPlotAreaSqFt : plotAreaSqFt > r.minPlotAreaSqFt;
    const maxPass = r.isMaxInclusive !== false ? plotAreaSqFt <= r.maxPlotAreaSqFt : plotAreaSqFt < r.maxPlotAreaSqFt;
    return minPass && maxPass;
  });

  matchingRules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
  const matchedRule = matchingRules[0] || activeRules[activeRules.length - 1];

  const unresolvedReasons: string[] = [];
  let isAuthoritativeBuildableResolved = Boolean(matchedRule);

  if (!matchedRule) {
    unresolvedReasons.push(`No setback rule configured for plot area ${plotAreaSqFt} sq.ft.`);
    isAuthoritativeBuildableResolved = false;
  }

  // 2. Evaluate Boundaries based on method
  const evalBoundary = (
    boundaryName: 'Front' | 'Rear' | 'Left' | 'Right',
    req?: { method: SetbackMethod; value?: number; minDistanceFt?: number; description?: string; notes?: string }
  ): { valueFt: number; method: SetbackMethod; formula: string; substitutions: string; isUnresolved: boolean; notes?: string } => {
    if (!req || req.method === 'UNSPECIFIED') {
      return {
        valueFt: 0,
        method: 'UNSPECIFIED',
        formula: 'Unspecified in source row',
        substitutions: 'Pending sanction review',
        isUnresolved: true,
        notes: req?.notes || 'Rule source does not specify this boundary clearance. Plan sanction review required.',
      };
    }

    if (req.method === 'FIXED_DISTANCE') {
      const val = Number((req.value || 0).toFixed(2));
      return {
        valueFt: val,
        method: 'FIXED_DISTANCE',
        formula: 'Fixed statutory distance',
        substitutions: `${val} ft`,
        isUnresolved: false,
        notes: req.notes,
      };
    }

    if (req.method === 'PERCENT_OF_DEPTH') {
      const pct = req.value || 0;
      const raw = (pct / 100) * plotLength;
      const val = Number(raw.toFixed(2));
      return {
        valueFt: val,
        method: 'PERCENT_OF_DEPTH',
        formula: `${pct}% of plot depth`,
        substitutions: `${pct}% × ${plotLength} ft = ${val} ft`,
        isUnresolved: false,
        notes: req.notes,
      };
    }

    if (req.method === 'PERCENT_OF_WIDTH') {
      const pct = req.value || 0;
      const raw = (pct / 100) * plotWidth;
      const val = Number(raw.toFixed(2));
      return {
        valueFt: val,
        method: 'PERCENT_OF_WIDTH',
        formula: `${pct}% of plot width`,
        substitutions: `${pct}% × ${plotWidth} ft = ${val} ft`,
        isUnresolved: false,
        notes: req.notes,
      };
    }

    if (req.method === 'MINIMUM_REQUIRED') {
      const minVal = req.minDistanceFt || req.value || 16.40;
      return {
        valueFt: Number(minVal.toFixed(2)),
        method: 'MINIMUM_REQUIRED',
        formula: `Minimum statutory clearance of ${minVal} ft`,
        substitutions: `${minVal} ft minimum`,
        isUnresolved: false,
        notes: req.notes,
      };
    }

    return {
      valueFt: 0,
      method: 'UNSPECIFIED',
      formula: 'Unresolved',
      substitutions: '0 ft',
      isUnresolved: true,
      notes: 'Unknown method',
    };
  };

  const frontEval = evalBoundary('Front', matchedRule?.front);
  const rearEval  = evalBoundary('Rear', matchedRule?.rear);
  const leftEval  = evalBoundary('Left', matchedRule?.left);
  const rightEval = evalBoundary('Right', matchedRule?.right);

  let statutoryFront = frontEval.valueFt;
  let statutoryRear  = rearEval.valueFt;
  let statutoryLeft  = leftEval.valueFt;
  let statutoryRight = rightEval.valueFt;

  // Road-facing side / Corner plot conditions
  // When side boundaries face roads, enforce road-clearance (standard front setback requirement)
  const isLeftRoadFacing = roadFacingBoundaries.includes('left') || (isCornerPlot && roadFacingBoundaries.length === 1);
  const isRightRoadFacing = roadFacingBoundaries.includes('right');
  const isRearRoadFacing = roadFacingBoundaries.includes('rear');

  if (isLeftRoadFacing && statutoryLeft < statutoryFront) {
    statutoryLeft = statutoryFront;
  }
  if (isRightRoadFacing && statutoryRight < statutoryFront) {
    statutoryRight = statutoryFront;
  }
  if (isRearRoadFacing && statutoryRear < statutoryFront && rearEval.method !== 'UNSPECIFIED') {
    statutoryRear = statutoryFront;
  }

  // Prescribed Building Line
  if (prescribedBuildingLineFt > statutoryFront) {
    statutoryFront = prescribedBuildingLineFt;
  }

  // Road Widening Addition
  if (roadWideningFt > 0) {
    statutoryFront += roadWideningFt;
    if (isLeftRoadFacing) statutoryLeft += roadWideningFt;
    if (isRightRoadFacing) statutoryRight += roadWideningFt;
  }

  // Unresolved conditions
  if (frontEval.isUnresolved) {
    unresolvedReasons.push('Front setback requirement is unresolved in the applicable rule.');
    isAuthoritativeBuildableResolved = false;
  }
  if (rearEval.isUnresolved) {
    unresolvedReasons.push('Rear setback is not specified in the Gazette summary for this plot area category. Plan sanction confirmation required.');
    isAuthoritativeBuildableResolved = false;
  }
  if (leftEval.isUnresolved || rightEval.isUnresolved) {
    unresolvedReasons.push('Side setback requirement is unresolved in the applicable rule.');
    isAuthoritativeBuildableResolved = false;
  }

  // Applied setbacks (support manual overrides)
  let appliedFront = statutoryFront;
  let appliedRear  = statutoryRear;
  let appliedLeft  = statutoryLeft;
  let appliedRight = statutoryRight;
  let verificationStatus: VerificationStatus = matchedRule?.verificationStatus || 'OFFICIAL_GAZETTE_PENDING_CONFIRMATION';

  if (typeof customSetbacks?.frontSetbackFt === 'number') {
    appliedFront = customSetbacks.frontSetbackFt;
    verificationStatus = 'MANUAL_OVERRIDE';
  }
  if (typeof customSetbacks?.rearSetbackFt === 'number') {
    appliedRear = customSetbacks.rearSetbackFt;
    verificationStatus = 'MANUAL_OVERRIDE';
  }
  if (typeof customSetbacks?.leftSetbackFt === 'number') {
    appliedLeft = customSetbacks.leftSetbackFt;
    verificationStatus = 'MANUAL_OVERRIDE';
  }
  if (typeof customSetbacks?.rightSetbackFt === 'number') {
    appliedRight = customSetbacks.rightSetbackFt;
    verificationStatus = 'MANUAL_OVERRIDE';
  }

  // Buildable envelope calculation
  const buildableLengthFt = Math.max(0, Number((plotLength - appliedFront - appliedRear).toFixed(2)));
  const buildableWidthFt  = Math.max(0, Number((plotWidth - appliedLeft - appliedRight).toFixed(2)));
  const buildableFootprintSqFt = Math.round(buildableLengthFt * buildableWidthFt);

  if (plotAreaSqFt > 0 && (buildableLengthFt <= 0 || buildableWidthFt <= 0)) {
    unresolvedReasons.push('Plot dimensions with statutory setbacks leave zero or negative buildable envelope. Setback relaxation or boundary survey required.');
    isAuthoritativeBuildableResolved = false;
  }

  // Build Explanation Steps
  const explanationSteps: SetbackExplanationStep[] = [
    {
      boundary: 'Front',
      method: frontEval.method,
      formula: frontEval.formula,
      substitutions: frontEval.substitutions + (roadWideningFt > 0 ? ` + ${roadWideningFt} ft road widening` : '') + (prescribedBuildingLineFt > 0 ? ` (min ${prescribedBuildingLineFt} ft building line)` : ''),
      valueFt: appliedFront,
      notes: frontEval.notes,
      isRoadFacing: true,
    },
    {
      boundary: 'Rear',
      method: rearEval.method,
      formula: rearEval.formula,
      substitutions: rearEval.substitutions,
      valueFt: appliedRear,
      notes: rearEval.notes,
      isRoadFacing: isRearRoadFacing,
    },
    {
      boundary: 'Left',
      method: leftEval.method,
      formula: leftEval.formula,
      substitutions: isLeftRoadFacing ? `${leftEval.substitutions} (Secondary road-facing clearance applied)` : leftEval.substitutions,
      valueFt: appliedLeft,
      notes: isLeftRoadFacing ? 'Boundary faces road: statutory front clearance applied.' : leftEval.notes,
      isRoadFacing: isLeftRoadFacing,
    },
    {
      boundary: 'Right',
      method: rightEval.method,
      formula: rightEval.formula,
      substitutions: isRightRoadFacing ? `${rightEval.substitutions} (Secondary road-facing clearance applied)` : rightEval.substitutions,
      valueFt: appliedRight,
      notes: isRightRoadFacing ? 'Boundary faces road: statutory front clearance applied.' : rightEval.notes,
      isRoadFacing: isRightRoadFacing,
    },
  ];

  return {
    matchedRule,
    statutoryFrontFt: statutoryFront,
    statutoryRearFt: statutoryRear,
    statutoryLeftFt: statutoryLeft,
    statutoryRightFt: statutoryRight,
    appliedFrontFt: appliedFront,
    appliedRearFt: appliedRear,
    appliedLeftFt: appliedLeft,
    appliedRightFt: appliedRight,
    buildableLengthFt,
    buildableWidthFt,
    buildableFootprintSqFt,
    maxGroundCoveragePct: matchedRule?.maxGroundCoveragePct || 70,
    isAuthoritativeBuildableResolved,
    unresolvedReasons,
    explanationSteps,
    verificationStatus,
  };
}

export interface EvaluateAuthorityLimitsParams {
  city?: string | null;
  plotLength: number;
  plotWidth: number;
  roadWidthFt?: number;
  floors?: number;
  customSetbacks?: Partial<SetbackGeometry>;
  roadFacingBoundaries?: Array<'front' | 'rear' | 'left' | 'right'>;
  isCornerPlot?: boolean;
  roadWideningFt?: number;
  prescribedBuildingLineFt?: number;
  overrideReason?: string;
  activeRules?: PlotSetbackRule[];
}

/**
 * Evaluates authoritative setback, ground coverage, FAR, and recommended BUA limits
 */
export function evaluateAuthorityLimits(params: EvaluateAuthorityLimitsParams): AuthorityCalculationResult {
  const {
    city,
    plotLength,
    plotWidth,
    roadWidthFt = 30,
    floors = 1,
    customSetbacks,
    roadFacingBoundaries = ['front'],
    isCornerPlot = false,
    roadWideningFt = 0,
    prescribedBuildingLineFt = 0,
    overrideReason,
    activeRules,
  } = params;

  const rules = getAuthorityRules(city);
  const plotAreaSqFt = Math.max(0, plotLength * plotWidth);

  // 1. Evaluate Dynamic Plot Setback Rules (Bengaluru / GBA 2026 or active rules)
  const setbackRules = (activeRules && activeRules.length > 0)
    ? activeRules
    : rules.plotSetbackRules;

  let statutoryFront = 0;
  let statutoryRear = 0;
  let statutoryLeft = 0;
  let statutoryRight = 0;
  let buildableLengthFt = 0;
  let buildableWidthFt = 0;
  let buildableFootprintSqFt = 0;
  let setbackCoveragePct = 70;
  let isAuthoritativeBuildableResolved = true;
  let unresolvedReasons: string[] = [];
  let explanationSteps: SetbackExplanationStep[] = [];
  let matchedRule: PlotSetbackRule | undefined = undefined;
  let verificationStatus: VerificationStatus = 'OFFICIAL_GAZETTE_PENDING_CONFIRMATION';

  if (setbackRules && setbackRules.length > 0) {
    const setbackEval = evaluatePlotSetbacks({
      plotLength,
      plotWidth,
      roadWidthFt,
      roadFacingBoundaries,
      isCornerPlot,
      roadWideningFt,
      prescribedBuildingLineFt,
      customSetbacks,
      rules: setbackRules,
      overrideReason,
    });

    statutoryFront = setbackEval.statutoryFrontFt;
    statutoryRear  = setbackEval.statutoryRearFt;
    statutoryLeft  = setbackEval.statutoryLeftFt;
    statutoryRight = setbackEval.statutoryRightFt;
    buildableLengthFt = setbackEval.buildableLengthFt;
    buildableWidthFt  = setbackEval.buildableWidthFt;
    buildableFootprintSqFt = setbackEval.buildableFootprintSqFt;
    setbackCoveragePct = setbackEval.maxGroundCoveragePct;
    isAuthoritativeBuildableResolved = setbackEval.isAuthoritativeBuildableResolved;
    unresolvedReasons = setbackEval.unresolvedReasons;
    explanationSteps = setbackEval.explanationSteps;
    matchedRule = setbackEval.matchedRule;
    verificationStatus = setbackEval.verificationStatus;
  } else {
    // Slabs evaluation for non-GBA authorities (e.g. Mysuru / MUDA)
    const matchedSlab = rules.setbackSlabs.find(
      (slab) => plotAreaSqFt >= slab.minPlotAreaSqFt && plotAreaSqFt <= slab.maxPlotAreaSqFt
    ) || rules.setbackSlabs[rules.setbackSlabs.length - 1];

    statutoryFront = matchedSlab?.frontSetbackFt || 3.28;
    statutoryRear  = matchedSlab?.rearSetbackFt || 3.28;
    statutoryLeft  = matchedSlab?.sideLeftSetbackFt || 3.28;
    statutoryRight = matchedSlab?.sideRightSetbackFt || 3.28;
    setbackCoveragePct = matchedSlab?.maxGroundCoveragePct || 70;

    let appliedFront = typeof customSetbacks?.frontSetbackFt === 'number' ? customSetbacks.frontSetbackFt : statutoryFront;
    let appliedRear  = typeof customSetbacks?.rearSetbackFt  === 'number' ? customSetbacks.rearSetbackFt  : statutoryRear;
    let appliedLeft  = typeof customSetbacks?.leftSetbackFt  === 'number' ? customSetbacks.leftSetbackFt  : statutoryLeft;
    let appliedRight = typeof customSetbacks?.rightSetbackFt === 'number' ? customSetbacks.rightSetbackFt : statutoryRight;

    buildableLengthFt = Math.max(0, Number((plotLength - appliedFront - appliedRear).toFixed(2)));
    buildableWidthFt  = Math.max(0, Number((plotWidth - appliedLeft - appliedRight).toFixed(2)));
    buildableFootprintSqFt = Math.round(buildableLengthFt * buildableWidthFt);
    isAuthoritativeBuildableResolved = true;
    verificationStatus = 'INDEPENDENTLY_VERIFIED';
    explanationSteps = [
      { boundary: 'Front', method: 'FIXED_DISTANCE', formula: `${rules.authority} Bylaws`, substitutions: `${appliedFront} ft`, valueFt: appliedFront, isRoadFacing: true },
      { boundary: 'Rear', method: 'FIXED_DISTANCE', formula: `${rules.authority} Bylaws`, substitutions: `${appliedRear} ft`, valueFt: appliedRear, isRoadFacing: false },
      { boundary: 'Left', method: 'FIXED_DISTANCE', formula: `${rules.authority} Bylaws`, substitutions: `${appliedLeft} ft`, valueFt: appliedLeft, isRoadFacing: false },
      { boundary: 'Right', method: 'FIXED_DISTANCE', formula: `${rules.authority} Bylaws`, substitutions: `${appliedRight} ft`, valueFt: appliedRight, isRoadFacing: false },
    ];
  }

  // 2. Ground Coverage Limit (Master Plan Zoning Tiers)
  const matchedCoverageSlab = rules.setbackSlabs?.find(
    (slab) => plotAreaSqFt >= slab.minPlotAreaSqFt && plotAreaSqFt <= slab.maxPlotAreaSqFt
  ) || rules.setbackSlabs?.[rules.setbackSlabs.length - 1];

  const maxGroundCoveragePct = matchedCoverageSlab?.maxGroundCoveragePct || setbackCoveragePct || 70;
  const coverageLimitSqFt = Math.round(plotAreaSqFt * (maxGroundCoveragePct / 100));
  const maxPermissibleCoverageSqFt = Math.min(buildableFootprintSqFt, coverageLimitSqFt);

  // 3. FAR Evaluation based on Road Width
  const matchedFarSlab = rules.farSlabs.find(
    (slab) => roadWidthFt >= slab.minRoadWidthFt && roadWidthFt <= slab.maxRoadWidthFt
  ) || rules.farSlabs[1] || rules.farSlabs[0];

  const matchedPlotCat = matchedFarSlab.plotAreaCategories.find(
    (cat) => plotAreaSqFt <= cat.maxPlotAreaSqFt
  ) || matchedFarSlab.plotAreaCategories[matchedFarSlab.plotAreaCategories.length - 1];

  const permissibleFAR = matchedPlotCat?.permissibleFAR || 1.75;
  const maxFarBUASqFt = Math.round(plotAreaSqFt * permissibleFAR);

  // 4. Total Maximum Permissible BUA across floors
  const maxPermissibleBUASqFt = Math.min(
    maxFarBUASqFt > 0 ? maxFarBUASqFt : Math.round(plotAreaSqFt * 1.75),
    maxPermissibleCoverageSqFt * Math.max(1, floors)
  );

  // 5. Authority-Informed Recommended BUA
  let recommendedBUAPerFloorSqFt = Math.min(
    maxPermissibleCoverageSqFt,
    Math.round(plotAreaSqFt * 0.60) // Conservative aesthetic default within statutory envelope
  );
  if (recommendedBUAPerFloorSqFt <= 0 && buildableFootprintSqFt > 0) {
    recommendedBUAPerFloorSqFt = buildableFootprintSqFt;
  }
  const recommendedBUATotalSqFt = Math.round(recommendedBUAPerFloorSqFt * Math.max(1, floors));

  // 6. Sensible Product Minimum BUA
  const minimumBUASqFt = Math.max(
    300 * Math.max(1, floors),
    Math.round(plotAreaSqFt * 0.30 * Math.max(1, floors))
  );

  // 7. Client Confirmation Flag
  let requiresClientConfirmation = !isAuthoritativeBuildableResolved;
  let confirmationReason = unresolvedReasons[0];

  if (!requiresClientConfirmation && roadWidthFt < 30) {
    requiresClientConfirmation = true;
    confirmationReason = `Road width (${roadWidthFt} ft) is below standard 9m (30ft) residential minimum. Height & FAR require municipal verification.`;
  }

  return {
    city: rules.displayName,
    authority: rules.authority,
    authorityFullName: rules.authorityFullName,
    governingFramework: rules.governingFramework,
    ruleId: rules.ruleId,
    ruleVersion: rules.ruleVersion,
    effectiveDate: rules.effectiveDate,
    source: matchedRule?.sourceDocument || rules.officialSourceDocument,
    statutoryFrontSetbackFt: statutoryFront,
    statutoryRearSetbackFt: statutoryRear,
    statutoryLeftSetbackFt: statutoryLeft,
    statutoryRightSetbackFt: statutoryRight,
    maxGroundCoveragePct,
    coverageLimitSqFt,
    maxPermissibleCoverageSqFt,
    permissibleFAR,
    maxFarBUASqFt,
    maxPermissibleBUASqFt,
    recommendedBUAPerFloorSqFt,
    recommendedBUATotalSqFt,
    minimumBUASqFt,
    buildableLengthFt,
    buildableWidthFt,
    buildableFootprintSqFt,
    requiresClientConfirmation,
    confirmationReason,
    disclaimer: rules.disclaimer,

    // V2 Extensions
    matchedRuleId: matchedRule?.id,
    matchedRuleName: matchedRule?.name,
    verificationStatus,
    frontMethod: matchedRule?.front.method,
    rearMethod: matchedRule?.rear.method,
    leftMethod: matchedRule?.left.method,
    rightMethod: matchedRule?.right.method,
    isAuthoritativeBuildableResolved,
    unresolvedReasons,
    setbackExplanationSteps: explanationSteps,
    roadFacingBoundaries,
    roadWideningFt,
    prescribedBuildingLineFt,
    manualOverrideReason: overrideReason,
  };
}
