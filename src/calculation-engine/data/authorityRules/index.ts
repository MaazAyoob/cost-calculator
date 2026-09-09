import { AuthorityRuleSet, AuthorityCalculationResult, SetbackRuleSlab, FARRuleSlab } from './types';
import { BENGALURU_AUTHORITY_RULES } from './bengaluru';
import { MYSURU_AUTHORITY_RULES } from './mysuru';
import { GRAM_PANCHAYAT_AUTHORITY_RULES } from './gramPanchayat';
import { SetbackGeometry } from '../../types';

export * from './types';
export { BENGALURU_AUTHORITY_RULES } from './bengaluru';
export { MYSURU_AUTHORITY_RULES } from './mysuru';
export { GRAM_PANCHAYAT_AUTHORITY_RULES } from './gramPanchayat';

const AUTHORITY_REGISTRY: Record<string, AuthorityRuleSet> = {
  bangalore: BENGALURU_AUTHORITY_RULES,
  bengaluru: BENGALURU_AUTHORITY_RULES,
  bbmp: BENGALURU_AUTHORITY_RULES,
  bda: BENGALURU_AUTHORITY_RULES,
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

export interface EvaluateAuthorityLimitsParams {
  city?: string | null;
  plotLength: number;
  plotWidth: number;
  roadWidthFt?: number;
  floors?: number;
  customSetbacks?: Partial<SetbackGeometry>;
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
  } = params;

  const rules = getAuthorityRules(city);
  const plotAreaSqFt = Math.max(0, plotLength * plotWidth);

  // 1. Find Matching Setback & Coverage Slab
  const matchedSetbackSlab = rules.setbackSlabs.find(
    (slab) => plotAreaSqFt >= slab.minPlotAreaSqFt && plotAreaSqFt <= slab.maxPlotAreaSqFt
  ) || rules.setbackSlabs[rules.setbackSlabs.length - 1];

  // Statutory Setbacks
  const statutoryFront = matchedSetbackSlab.frontSetbackFt;
  const statutoryRear  = matchedSetbackSlab.rearSetbackFt;
  const statutoryLeft  = matchedSetbackSlab.sideLeftSetbackFt;
  const statutoryRight = matchedSetbackSlab.sideRightSetbackFt;

  // Applied Setbacks (User-entered overrides if explicitly provided)
  const appliedFront = typeof customSetbacks?.frontSetbackFt === 'number' ? customSetbacks.frontSetbackFt : statutoryFront;
  const appliedRear  = typeof customSetbacks?.rearSetbackFt  === 'number' ? customSetbacks.rearSetbackFt  : statutoryRear;
  const appliedLeft  = typeof customSetbacks?.leftSetbackFt  === 'number' ? customSetbacks.leftSetbackFt  : statutoryLeft;
  const appliedRight = typeof customSetbacks?.rightSetbackFt === 'number' ? customSetbacks.rightSetbackFt : statutoryRight;

  // 2. Buildable Footprint
  const buildableLengthFt = Math.max(0, plotLength - appliedFront - appliedRear);
  const buildableWidthFt  = Math.max(0, plotWidth - appliedLeft - appliedRight);
  const buildableFootprintSqFt = Math.round(buildableLengthFt * buildableWidthFt);

  // 3. Ground Coverage Limit
  const maxGroundCoveragePct = matchedSetbackSlab.maxGroundCoveragePct;
  const coverageLimitSqFt = Math.round(plotAreaSqFt * (maxGroundCoveragePct / 100));
  const maxPermissibleCoverageSqFt = Math.min(buildableFootprintSqFt, coverageLimitSqFt);

  // 4. FAR Evaluation based on Road Width
  const matchedFarSlab = rules.farSlabs.find(
    (slab) => roadWidthFt >= slab.minRoadWidthFt && roadWidthFt <= slab.maxRoadWidthFt
  ) || rules.farSlabs[1] || rules.farSlabs[0];

  const matchedPlotCat = matchedFarSlab.plotAreaCategories.find(
    (cat) => plotAreaSqFt <= cat.maxPlotAreaSqFt
  ) || matchedFarSlab.plotAreaCategories[matchedFarSlab.plotAreaCategories.length - 1];

  const permissibleFAR = matchedPlotCat?.permissibleFAR || 1.75;
  const maxFarBUASqFt = Math.round(plotAreaSqFt * permissibleFAR);

  // 5. Total Maximum Permissible BUA across floors
  // Capped by FAR total and physical maximum buildable envelope per floor * floors
  const maxPermissibleBUASqFt = Math.min(
    maxFarBUASqFt > 0 ? maxFarBUASqFt : Math.round(plotAreaSqFt * 1.75),
    maxPermissibleCoverageSqFt * Math.max(1, floors)
  );

  // 6. Authority-Informed Recommended BUA
  // Conservative recommended standard (standard buildable footprint per floor or ~60-70% coverage limit)
  let recommendedBUAPerFloorSqFt = Math.min(
    maxPermissibleCoverageSqFt,
    Math.round(plotAreaSqFt * 0.60) // Conservative aesthetic default within statutory envelope
  );
  if (recommendedBUAPerFloorSqFt <= 0 && buildableFootprintSqFt > 0) {
    recommendedBUAPerFloorSqFt = buildableFootprintSqFt;
  }
  const recommendedBUATotalSqFt = Math.round(recommendedBUAPerFloorSqFt * Math.max(1, floors));

  // 7. Sensible Product Minimum BUA
  // Sensible minimum for a habitable residential unit (e.g. 350 sq.ft per floor or 40% plot footprint)
  const minimumBUASqFt = Math.max(
    300 * Math.max(1, floors),
    Math.round(plotAreaSqFt * 0.30 * Math.max(1, floors))
  );

  // 8. Client Confirmation Flag
  let requiresClientConfirmation = false;
  let confirmationReason: string | undefined;

  if (roadWidthFt < 30) {
    requiresClientConfirmation = true;
    confirmationReason = `Road width (${roadWidthFt} ft) is below standard 9m (30ft) residential minimum. Height & FAR require municipal verification.`;
  } else if (buildableFootprintSqFt <= 0 && plotAreaSqFt > 0) {
    requiresClientConfirmation = true;
    confirmationReason = 'Plot dimensions with standard setbacks leave no positive buildable footprint. Setback relaxation or boundary survey required.';
  }

  return {
    city: rules.displayName,
    authority: rules.authority,
    authorityFullName: rules.authorityFullName,
    governingFramework: rules.governingFramework,
    ruleId: rules.ruleId,
    ruleVersion: rules.ruleVersion,
    effectiveDate: rules.effectiveDate,
    source: rules.officialSourceDocument,
    statutoryFrontSetbackFt: statutoryFront,
    statutoryRearSetbackFt: statutoryRear,
    statutoryLeftSetbackFt: statutoryLeft,
    statutoryRightSetbackFt: statutoryRight,
    maxGroundCoveragePct,
    maxPermissibleCoverageSqFt,
    permissibleFAR,
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
  };
}
