import { AuthorityRuleSet } from './types';

/**
 * Mysuru (MUDA / MDA / MCC) Planning & Zoning Regulations
 * 
 * Official References:
 * - Mysuru Urban Development Authority (MUDA) / Mysuru Development Authority (MDA)
 *   Comprehensive Development Plan (CDP) 2031 Zoning Regulations, Chapter 4 (Residential Regulations)
 * - Mysuru City Corporation (MCC) Building Bye-Laws & Karnataka Town and Country Planning Act, 1961
 * - Government of Karnataka Urban Development Department Notifications
 */
export const MYSURU_AUTHORITY_RULES: AuthorityRuleSet = {
  ruleId: 'MYS-MUDA-CDP2031-RES-V1.8',
  city: 'Mysore',
  displayName: 'Mysuru',
  authority: 'MUDA',
  authorityFullName: 'Mysuru Urban Development Authority / Mysuru Development Authority (MDA)',
  governingFramework: 'Karnataka Town and Country Planning Act, 1961 & MUDA Master Plan 2031',
  ruleVersion: 'MUDA-CDP-2031-REG',
  effectiveDate: '2016-03-18',
  officialSourceDocument: 'MUDA Master Plan 2031 Zoning Regulations (Schedule II: Setbacks, Coverage & FAR for Residential Plots)',
  disclaimer: 'Authority-informed estimate. Final approval is subject to applicable local authority regulations and professional verification.',
  defaultRoadWidthFt: 30, // Standard 9m (30ft) residential road

  // Setback and Max Coverage Slabs based on Plot Area (MUDA CDP 2031 Schedule II)
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
      notes: 'Small plot / EWS relaxation under MUDA Zoning Schedule II.',
    },
    {
      minPlotAreaSqM: 60,
      maxPlotAreaSqM: 111.5,
      minPlotAreaSqFt: 646,
      maxPlotAreaSqFt: 1200,
      label: 'Plot Area 60–111.5 sq.m (e.g. 30×40 = 1,200 sq.ft)',
      frontSetbackM: 1.2,
      rearSetbackM: 1.0,
      sideLeftSetbackM: 1.0,
      sideRightSetbackM: 1.0,
      frontSetbackFt: 3.94,
      rearSetbackFt: 3.28,
      sideLeftSetbackFt: 3.28,
      sideRightSetbackFt: 3.28,
      maxGroundCoveragePct: 70,
      notes: 'Standard 30x40 residential plot under MUDA Schedule II (1.2m front, 1.0m rear, 1.0m sides).',
    },
    {
      minPlotAreaSqM: 111.5,
      maxPlotAreaSqM: 223,
      minPlotAreaSqFt: 1201,
      maxPlotAreaSqFt: 2400,
      label: 'Plot Area 111.5–223 sq.m (e.g. 30×50 = 1,500 sq.ft, 40×60 = 2,400 sq.ft)',
      frontSetbackM: 1.5,
      rearSetbackM: 1.5,
      sideLeftSetbackM: 1.2,
      sideRightSetbackM: 1.2,
      frontSetbackFt: 4.92,
      rearSetbackFt: 4.92,
      sideLeftSetbackFt: 3.94,
      sideRightSetbackFt: 3.94,
      maxGroundCoveragePct: 65,
      notes: 'Medium residential plots under MUDA Schedule II (1.5m front/rear, 1.2m sides).',
    },
    {
      minPlotAreaSqM: 223,
      maxPlotAreaSqM: 500,
      minPlotAreaSqFt: 2401,
      maxPlotAreaSqFt: 5382,
      label: 'Plot Area 223–500 sq.m (e.g. 50×80 = 4,000 sq.ft)',
      frontSetbackM: 3.0,
      rearSetbackM: 2.0,
      sideLeftSetbackM: 1.5,
      sideRightSetbackM: 1.5,
      frontSetbackFt: 9.84,
      rearSetbackFt: 6.56,
      sideLeftSetbackFt: 4.92,
      sideRightSetbackFt: 4.92,
      maxGroundCoveragePct: 60,
      notes: 'Large residential plots under MUDA Schedule II.',
    },
    {
      minPlotAreaSqM: 500,
      maxPlotAreaSqM: 99999,
      minPlotAreaSqFt: 5383,
      maxPlotAreaSqFt: 999999,
      label: 'Plot Area > 500 sq.m (e.g. 60×90 = 5,400 sq.ft)',
      frontSetbackM: 4.0,
      rearSetbackM: 3.0,
      sideLeftSetbackM: 2.5,
      sideRightSetbackM: 2.5,
      frontSetbackFt: 13.12,
      rearSetbackFt: 9.84,
      sideLeftSetbackFt: 8.20,
      sideRightSetbackFt: 8.20,
      maxGroundCoveragePct: 55,
      notes: 'Large estate plots under MUDA Schedule II.',
    },
  ],

  // Permissible FAR based on Road Width & Plot Size (MUDA CDP 2031 Schedule II)
  farSlabs: [
    {
      minRoadWidthM: 0,
      maxRoadWidthM: 9.0,
      minRoadWidthFt: 0,
      maxRoadWidthFt: 29.9,
      roadLabel: 'Road Width < 9m (< 30 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1200, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
        { maxPlotAreaSqFt: 2400, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
      ],
      notes: 'Narrow road restriction under MUDA: Max height typically capped at G+2.',
    },
    {
      minRoadWidthM: 9.0,
      maxRoadWidthM: 12.0,
      minRoadWidthFt: 30.0,
      maxRoadWidthFt: 39.9,
      roadLabel: 'Road Width 9m–12m (30 ft – 40 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1200, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
        { maxPlotAreaSqFt: 2400, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
      ],
      notes: 'Standard residential road width in Mysuru supporting base FAR 1.75.',
    },
    {
      minRoadWidthM: 12.0,
      maxRoadWidthM: 999.0,
      minRoadWidthFt: 40.0,
      maxRoadWidthFt: 9999.0,
      roadLabel: 'Road Width ≥ 12m (≥ 40 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1200, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
        { maxPlotAreaSqFt: 2400, permissibleFAR: 2.00, maxFloorsAllowed: 5 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 2.25, maxFloorsAllowed: 5 },
      ],
      notes: 'Wide roads in Mysuru supporting enhanced FAR 2.00–2.25.',
    },
  ],

  generalNotes: [
    'MUDA residential building norms apply to MCC (Mysuru City Corporation) limits and MUDA approved layouts.',
    'Heritage zone overlay in central Mysuru may have additional height restrictions and aesthetic stipulations.',
  ],
};
