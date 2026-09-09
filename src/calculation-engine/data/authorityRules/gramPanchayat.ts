import { AuthorityRuleSet } from './types';

/**
 * Gram Panchayat / Rural Planning & Zoning Regulations (Karnataka)
 * 
 * Official References:
 * - Karnataka Gram Swaraj and Panchayat Raj Act, 1993
 * - Directorate of Town and Country Planning (DTCP) Karnataka Model Bye-Laws
 * - Karnataka Municipal / Rural Planning Guidelines
 * 
 * Note: Gram Panchayat planning limits are advisory and require local verification
 * by the Panchayat Development Officer (PDO) and DTCP/BMRDA before sanction.
 */
export const GRAM_PANCHAYAT_AUTHORITY_RULES: AuthorityRuleSet = {
  ruleId: 'KA-GRAM-PANCHAYAT-DTCP-V1.0',
  city: 'Gram Panchayat',
  displayName: 'Gram Panchayat Jurisdiction',
  authority: 'Gram Panchayat',
  authorityFullName: 'Gram Panchayat / Directorate of Town and Country Planning (DTCP)',
  governingFramework: 'Karnataka Gram Swaraj and Panchayat Raj Act, 1993 & DTCP Advisory Guidelines',
  ruleVersion: 'DTCP-GP-2022-ADVISORY',
  effectiveDate: '2022-01-01',
  officialSourceDocument: 'DTCP Model Guidelines for Gram Panchayat Rural Layouts & Form 9/11 Regulations',
  disclaimer: 'Gram Panchayat planning rules are advisory and indicative. Setbacks, FAR, and construction permissions must be verified with the local Gram Panchayat Secretary / PDO and Directorate of Town & Country Planning (DTCP) / BMRDA before building plan sanction.',
  defaultRoadWidthFt: 25,

  // Setback and Max Coverage Slabs based on Plot Area (DTCP Advisory)
  setbackSlabs: [
    {
      minPlotAreaSqM: 0,
      maxPlotAreaSqM: 60,
      minPlotAreaSqFt: 0,
      maxPlotAreaSqFt: 645,
      label: 'Plot Area ≤ 60 sq.m (≤ 645 sq.ft)',
      frontSetbackM: 1.0,
      rearSetbackM: 0.0,
      sideLeftSetbackM: 0.0,
      sideRightSetbackM: 1.0,
      frontSetbackFt: 3.28,
      rearSetbackFt: 0.0,
      sideLeftSetbackFt: 0.0,
      sideRightSetbackFt: 3.28,
      maxGroundCoveragePct: 75,
      notes: 'Advisory small plot rural housing guideline.',
    },
    {
      minPlotAreaSqM: 60,
      maxPlotAreaSqM: 150,
      minPlotAreaSqFt: 646,
      maxPlotAreaSqFt: 1614,
      label: 'Plot Area 60–150 sq.m (e.g. 30×40 = 1,200 sq.ft)',
      frontSetbackM: 1.2,
      rearSetbackM: 1.0,
      sideLeftSetbackM: 1.0,
      sideRightSetbackM: 1.0,
      frontSetbackFt: 3.94,
      rearSetbackFt: 3.28,
      sideLeftSetbackFt: 3.28,
      sideRightSetbackFt: 3.28,
      maxGroundCoveragePct: 65,
      notes: 'Standard 30x40 residential plot advisory guidelines.',
    },
    {
      minPlotAreaSqM: 150,
      maxPlotAreaSqM: 250,
      minPlotAreaSqFt: 1615,
      maxPlotAreaSqFt: 2690,
      label: 'Plot Area 150–250 sq.m (e.g. 30×50, 40×60)',
      frontSetbackM: 1.5,
      rearSetbackM: 1.2,
      sideLeftSetbackM: 1.2,
      sideRightSetbackM: 1.2,
      frontSetbackFt: 4.92,
      rearSetbackFt: 3.94,
      sideLeftSetbackFt: 3.94,
      sideRightSetbackFt: 3.94,
      maxGroundCoveragePct: 60,
      notes: 'Medium plot advisory setbacks.',
    },
    {
      minPlotAreaSqM: 250,
      maxPlotAreaSqM: 999999,
      minPlotAreaSqFt: 2691,
      maxPlotAreaSqFt: 9999999,
      label: 'Plot Area > 250 sq.m (> 2,690 sq.ft)',
      frontSetbackM: 2.0,
      rearSetbackM: 1.5,
      sideLeftSetbackM: 1.5,
      sideRightSetbackM: 1.5,
      frontSetbackFt: 6.56,
      rearSetbackFt: 4.92,
      sideLeftSetbackFt: 4.92,
      sideRightSetbackFt: 4.92,
      maxGroundCoveragePct: 55,
      notes: 'Large plot advisory setbacks.',
    },
  ],

  // FAR Slabs based on Road Width (Advisory)
  farSlabs: [
    {
      minRoadWidthM: 0,
      maxRoadWidthM: 6.0,
      minRoadWidthFt: 0,
      maxRoadWidthFt: 19.9,
      roadLabel: 'Narrow Road (< 20 ft / < 6m)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1614, permissibleFAR: 1.25, maxFloorsAllowed: 2 },
        { maxPlotAreaSqFt: 9999999, permissibleFAR: 1.25, maxFloorsAllowed: 2 },
      ],
      notes: 'Advisory FAR capped due to limited village road access.',
    },
    {
      minRoadWidthM: 6.0,
      maxRoadWidthM: 12.0,
      minRoadWidthFt: 20.0,
      maxRoadWidthFt: 39.9,
      roadLabel: 'Standard Village / Main Road (20–40 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1614, permissibleFAR: 1.5, maxFloorsAllowed: 3 },
        { maxPlotAreaSqFt: 9999999, permissibleFAR: 1.5, maxFloorsAllowed: 3 },
      ],
      notes: 'Standard Gram Panchayat advisory FAR.',
    },
    {
      minRoadWidthM: 12.0,
      maxRoadWidthM: 999,
      minRoadWidthFt: 40.0,
      maxRoadWidthFt: 9999,
      roadLabel: 'Wide Road (≥ 40 ft / ≥ 12m)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 9999999, permissibleFAR: 1.75, maxFloorsAllowed: 3 },
      ],
      notes: 'Wide road DTCP advisory FAR.',
    },
  ],

  generalNotes: [
    'Gram Panchayat permissions (Form 9 and Form 11) must be in order before construction.',
    'Building approvals in Gram Panchayat areas within BDA/BMRDA jurisdiction require NOC from the respective planning authority.',
    'All planning rules for Gram Panchayat areas are advisory and subject to local Panchayat Development Officer (PDO) sanction.',
  ],
};
