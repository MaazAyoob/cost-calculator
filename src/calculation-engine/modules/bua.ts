// ============================================================
// BUA MODULE – Authority-Based Built-Up Area & Setback Geometry Engine
// Strictly integrates Bengaluru (BBMP/BDA) and Mysuru (MUDA/MDA)
// statutory planning rules with an interactive user-adjustable BUA model.
// ============================================================

import { EngineInput, AreaResult, SetbackGeometry } from '../types';
import { SUPER_BUA_FACTOR } from '../data/coefficients';
import { evaluateAuthorityLimits, getAuthorityRules } from '../data/authorityRules';
import { configResolver } from '../config';
import { PlotSetbackRule } from '../data/authorityRules/types';

export function calculateArea(input: EngineInput): AreaResult {
  const length = Math.max(0, input.plotLength || 0);
  const width = Math.max(0, input.plotWidth || 0);
  const floors = Math.max(1, input.floors || 1);
  const roadWidthFt = input.roadWidthFt || 30;

  // 1. PLOT AREA
  const plotAreaSqFt = length * width;

  // Parking footprint
  const sqFtPerCar = input.parkingType === 'Stilt Parking' || input.parkingType === 'Stilt' ? 180 : 120;
  const parkingAreaSqFt = Math.round((input.carCount || 0) * sqFtPerCar + ((input.bikeCount || 0) * 35));

  const rules = getAuthorityRules(input.city);

  // Zero state check: unconfigured project
  if (plotAreaSqFt <= 0) {
    const emptySetbacks: SetbackGeometry = {
      frontSetbackFt: 0,
      rearSetbackFt: 0,
      leftSetbackFt: 0,
      rightSetbackFt: 0,
      source: 'None',
    };

    return {
      plotAreaSqFt: 0,
      plotLength: length,
      plotWidth: width,
      roadWidthFt,
      setbacks: emptySetbacks,
      statutorySetbacks: emptySetbacks,
      buildableLengthFt: 0,
      buildableWidthFt: 0,
      buildableFootprintSqFt: 0,
      maxAllowableBUAPerFloorSqFt: 0,
      buaPerFloorSqFt: 0,
      recommendedBUAPerFloorSqFt: 0,
      recommendedBUATotalSqFt: 0,
      maximumPermissibleBUASqFt: 0,
      permissibleBUASqFt: 0,
      proposedBUASqFt: 0,
      excessBUASqFt: 0,
      minimumBUASqFt: 0,
      userSelectedBUASqFt: 0,
      maxPermissibleCoveragePct: 70,
      maxPermissibleCoverageSqFt: 0,
      permissibleFAR: 1.75,
      validationState: 'valid',
      buildableAreaSqFt: 0,
      remainingGroundAreaSqFt: 0,
      remainingGroundArea: 0,
      groundCoveragePercentage: 0,
      totalBUASqFt: 0,
      superBUASqFt: 0,
      parkingAreaSqFt: 0,
      terraceSqFt: 0,
      totalConstructedSqFt: 0,
      isWithinPermissibleLimit: true,
      requiresClientConfirmation: false,
      authorityMetadata: {
        city: rules.displayName,
        authority: rules.authority,
        authorityFullName: rules.authorityFullName,
        governingFramework: rules.governingFramework,
        ruleId: rules.ruleId,
        ruleVersion: rules.ruleVersion,
        effectiveDate: rules.effectiveDate,
        source: rules.officialSourceDocument,
        disclaimer: rules.disclaimer,
        requiresConfirmation: false,
      },
    };
  }

  // 2. EVALUATE AUTHORITATIVE SETBACKS, COVERAGE, FAR & RECOMMENDATIONS
  const customSetbacks: Partial<SetbackGeometry> | undefined = (
    typeof input.frontSetback === 'number' ||
    typeof input.rearSetback === 'number' ||
    typeof input.leftSetback === 'number' ||
    typeof input.rightSetback === 'number'
  ) ? {
    frontSetbackFt: input.frontSetback,
    rearSetbackFt: input.rearSetback,
    leftSetbackFt: input.leftSetback,
    rightSetbackFt: input.rightSetback,
  } : ((input as any).customSetbacks || undefined);

  const activeSetbackRules = configResolver.resolveParameter<PlotSetbackRule[] | undefined>(
    'config.setbacks.rules',
    { city: input.city, location: input.city },
    undefined
  );

  const matchingRules = Array.isArray(activeSetbackRules) && activeSetbackRules.length > 0
    ? activeSetbackRules.filter((r) => {
        if (!r.jurisdiction || r.jurisdiction === 'ALL') return true;
        const normJurisdiction = r.jurisdiction.toLowerCase();
        const normCity = (input.city || '').toLowerCase();
        if (normCity === 'mysore' || normCity === 'mysuru') {
          return normJurisdiction.includes('mysor') || normJurisdiction.includes('muda');
        }
        return normJurisdiction.includes('bengaluru') || normJurisdiction.includes('bangalore') || normJurisdiction.includes('gba') || normJurisdiction.includes('bbmp');
      })
    : undefined;

  const authEval = evaluateAuthorityLimits({
    city: input.city,
    plotLength: length,
    plotWidth: width,
    roadWidthFt,
    floors,
    customSetbacks,
    roadFacingBoundaries: input.roadFacingBoundaries,
    isCornerPlot: input.isCornerPlot,
    roadWideningFt: input.roadWideningFt,
    prescribedBuildingLineFt: input.prescribedBuildingLineFt,
    overrideReason: input.overrideReason,
    activeRules: matchingRules && matchingRules.length > 0 ? matchingRules : undefined,
  });

  const statutorySetbacks: SetbackGeometry = {
    frontSetbackFt: authEval.statutoryFrontSetbackFt,
    rearSetbackFt: authEval.statutoryRearSetbackFt,
    leftSetbackFt: authEval.statutoryLeftSetbackFt,
    rightSetbackFt: authEval.statutoryRightSetbackFt,
    source: `${authEval.authority} (${authEval.ruleVersion})`,
  };

  const appliedSetbacks: SetbackGeometry = {
    frontSetbackFt: typeof customSetbacks?.frontSetbackFt === 'number' ? customSetbacks.frontSetbackFt : statutorySetbacks.frontSetbackFt,
    rearSetbackFt:  typeof customSetbacks?.rearSetbackFt  === 'number' ? customSetbacks.rearSetbackFt  : statutorySetbacks.rearSetbackFt,
    leftSetbackFt:  typeof customSetbacks?.leftSetbackFt  === 'number' ? customSetbacks.leftSetbackFt  : statutorySetbacks.leftSetbackFt,
    rightSetbackFt: typeof customSetbacks?.rightSetbackFt === 'number' ? customSetbacks.rightSetbackFt : statutorySetbacks.rightSetbackFt,
    source: customSetbacks ? 'User-Customized Site Setbacks' : statutorySetbacks.source,
  };

  // 3. BUILDABLE FOOTPRINT
  const buildableLengthFt = authEval.buildableLengthFt;
  const buildableWidthFt  = authEval.buildableWidthFt;
  const buildableFootprintSqFt = authEval.buildableFootprintSqFt;

  // Maximum permissible BUA per floor and total
  const maxAllowableBUAPerFloorSqFt = authEval.maxPermissibleCoverageSqFt;
  const maximumPermissibleBUASqFt = authEval.maxPermissibleBUASqFt;
  const permissibleBUASqFt = maximumPermissibleBUASqFt;
  const recommendedBUAPerFloorSqFt = authEval.recommendedBUAPerFloorSqFt;
  const recommendedBUATotalSqFt = authEval.recommendedBUATotalSqFt;
  const minimumBUASqFt = authEval.minimumBUASqFt;

  // 4. USER-SELECTED BUILT-UP AREA (Canonical Single Source of Truth)
  let totalBUASqFt = 0;
  if (typeof input.userSelectedBUA === 'number' && input.userSelectedBUA > 0) {
    totalBUASqFt = Math.round(input.userSelectedBUA);
  } else if (typeof (input as any).builtUpArea === 'number' && (input as any).builtUpArea > 0) {
    totalBUASqFt = Math.round((input as any).builtUpArea);
  } else if (typeof input.builtUpAreaPerFloor === 'number' && input.builtUpAreaPerFloor > 0) {
    totalBUASqFt = Math.round(input.builtUpAreaPerFloor * floors);
  } else {
    totalBUASqFt = recommendedBUATotalSqFt;
  }

  const buaPerFloorSqFt = Math.round(totalBUASqFt / floors);
  const userSelectedBUASqFt = totalBUASqFt;
  const proposedBUASqFt = totalBUASqFt;
  const excessBUASqFt = Math.max(0, proposedBUASqFt - permissibleBUASqFt);

  // 5. VALIDATION STATE
  let validationState: 'valid' | 'above_recommended' | 'exceeds_permissible' | 'verification_required' = 'valid';
  let confirmationMessage: string | undefined;

  const coverageLimitSqFt = authEval.coverageLimitSqFt ?? Math.round(plotAreaSqFt * (authEval.maxGroundCoveragePct / 100));
  const maxFarBUASqFt = authEval.maxFarBUASqFt ?? Math.round(plotAreaSqFt * authEval.permissibleFAR);
  const exceedsFootprint = buildableFootprintSqFt > 0 && buaPerFloorSqFt > buildableFootprintSqFt;
  const exceedsCoverage = coverageLimitSqFt > 0 && buaPerFloorSqFt > coverageLimitSqFt;
  const exceedsFar = maxFarBUASqFt > 0 && proposedBUASqFt > maxFarBUASqFt;

  // When authority regulations cannot be definitively determined
  if (authEval.requiresClientConfirmation && roadWidthFt < 30) {
    validationState = 'verification_required';
    confirmationMessage = `Road width (${roadWidthFt} ft) is below standard 9m (30ft) residential minimum. Regulatory verification required for permissible FAR and height.`;
  } else if (permissibleBUASqFt > 0 && proposedBUASqFt > permissibleBUASqFt) {
    validationState = 'exceeds_permissible';
    const violations: string[] = [];
    if (exceedsFootprint) {
      violations.push(`Ground-floor footprint (${buaPerFloorSqFt.toLocaleString()} sq.ft) exceeds buildable envelope after setbacks (${buildableFootprintSqFt.toLocaleString()} sq.ft)`);
    }
    if (exceedsCoverage) {
      violations.push(`Ground coverage (${buaPerFloorSqFt.toLocaleString()} sq.ft) exceeds permissible plot coverage (${coverageLimitSqFt.toLocaleString()} sq.ft, ${authEval.maxGroundCoveragePct}%)`);
    }
    if (exceedsFar) {
      violations.push(`Total BUA (${proposedBUASqFt.toLocaleString()} sq.ft) exceeds permissible FAR limit (${maxFarBUASqFt.toLocaleString()} sq.ft, FAR ${authEval.permissibleFAR})`);
    }
    if (violations.length > 0) {
      confirmationMessage = `Proposed BUA (${proposedBUASqFt.toLocaleString()} sq.ft) exceeds calculated permissible limit (${permissibleBUASqFt.toLocaleString()} sq.ft, FAR ${authEval.permissibleFAR}) by ${excessBUASqFt.toLocaleString()} sq.ft: ${violations.join('; ')}.`;
    } else {
      confirmationMessage = `Proposed BUA (${proposedBUASqFt.toLocaleString()} sq.ft) exceeds calculated permissible limit (${permissibleBUASqFt.toLocaleString()} sq.ft, FAR ${authEval.permissibleFAR}) by ${excessBUASqFt.toLocaleString()} sq.ft.`;
    }
  } else if (proposedBUASqFt > recommendedBUATotalSqFt && recommendedBUATotalSqFt > 0) {
    validationState = 'above_recommended';
    confirmationMessage = `Proposed BUA (${proposedBUASqFt.toLocaleString()} sq.ft) is above the authority recommended baseline (${recommendedBUATotalSqFt.toLocaleString()} sq.ft). Verify your floor-to-floor setbacks.`;
  } else {
    validationState = 'valid';
  }

  const isWithinPermissibleLimit = validationState !== 'exceeds_permissible';
  const requiresClientConfirmation = authEval.requiresClientConfirmation || validationState === 'exceeds_permissible' || validationState === 'verification_required';

  // 6. GROUND COVERAGE & REMAINING GROUND AREA
  const remainingGroundAreaSqFt = Math.max(0, plotAreaSqFt - buaPerFloorSqFt);
  const remainingGroundArea = remainingGroundAreaSqFt;
  const groundCoveragePercentage = plotAreaSqFt > 0 ? parseFloat(((buaPerFloorSqFt / plotAreaSqFt) * 100).toFixed(1)) : 0;

  // 7. SUPER BUA (BUA + 15% common areas/walls/shaft)
  const superBUASqFt = Math.round(totalBUASqFt * SUPER_BUA_FACTOR);

  // 8. GROUND FOOTPRINT & TERRACE
  const buildableAreaSqFt = buaPerFloorSqFt;
  const terraceSqFt = buaPerFloorSqFt; // Top slab exposed area
  const totalConstructedSqFt = totalBUASqFt + parkingAreaSqFt + terraceSqFt;

  return {
    plotAreaSqFt,
    plotLength: length,
    plotWidth: width,
    roadWidthFt,
    setbacks: appliedSetbacks,
    statutorySetbacks,
    buildableLengthFt,
    buildableWidthFt,
    buildableFootprintSqFt,
    maxAllowableBUAPerFloorSqFt,
    buaPerFloorSqFt,
    recommendedBUAPerFloorSqFt,
    recommendedBUATotalSqFt,
    maximumPermissibleBUASqFt,
    permissibleBUASqFt,
    proposedBUASqFt,
    excessBUASqFt,
    minimumBUASqFt,
    userSelectedBUASqFt,
    maxPermissibleCoveragePct: authEval.maxGroundCoveragePct,
    coverageLimitSqFt,
    maxPermissibleCoverageSqFt: authEval.maxPermissibleCoverageSqFt,
    permissibleFAR: authEval.permissibleFAR,
    maxFarBUASqFt,
    validationState,
    buildableAreaSqFt,
    remainingGroundAreaSqFt,
    remainingGroundArea,
    groundCoveragePercentage,
    totalBUASqFt,
    superBUASqFt,
    parkingAreaSqFt,
    terraceSqFt,
    totalConstructedSqFt,
    isWithinPermissibleLimit,
    requiresClientConfirmation,
    confirmationMessage,
    authorityMetadata: {
      city: authEval.city,
      authority: authEval.authority,
      authorityFullName: authEval.authorityFullName,
      governingFramework: authEval.governingFramework,
      ruleId: authEval.ruleId,
      ruleVersion: authEval.ruleVersion,
      effectiveDate: authEval.effectiveDate,
      source: authEval.source,
      disclaimer: authEval.disclaimer,
      requiresConfirmation: authEval.requiresClientConfirmation,
      confirmationReason: authEval.confirmationReason,
      matchedRuleId: authEval.matchedRuleId,
      matchedRuleName: authEval.matchedRuleName,
      verificationStatus: authEval.verificationStatus,
      frontMethod: authEval.frontMethod,
      rearMethod: authEval.rearMethod,
      leftMethod: authEval.leftMethod,
      rightMethod: authEval.rightMethod,
      isAuthoritativeBuildableResolved: authEval.isAuthoritativeBuildableResolved,
      unresolvedReasons: authEval.unresolvedReasons,
      explanationSteps: authEval.setbackExplanationSteps,
    },
  };
}
