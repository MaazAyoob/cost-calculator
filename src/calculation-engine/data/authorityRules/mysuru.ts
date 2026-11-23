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

  // Setback and Max Coverage Slabs based on Plot Area (MDA / MUDA & MCC Master Plan II-2031)
  setbackSlabs: [
    {
      minPlotAreaSqM: 0,
      maxPlotAreaSqM: 60,
      minPlotAreaSqFt: 0,
      maxPlotAreaSqFt: 645.83,
      label: 'Plot Area ≤ 60 sq.m (≤ 645.8 sq.ft)',
      frontSetbackM: 0.75,
      rearSetbackM: 0.0,
      sideLeftSetbackM: 0.60,
      sideRightSetbackM: 0.0,
      frontSetbackFt: 2.46,
      rearSetbackFt: 0.0,
      sideLeftSetbackFt: 1.97,
      sideRightSetbackFt: 0.0,
      maxGroundCoveragePct: 75,
      notes: 'Category A: 2.46 ft front, 0 ft rear, 1.97 ft on any 1 side, 0 ft other side.',
    },
    {
      minPlotAreaSqM: 60.0001,
      maxPlotAreaSqM: 150,
      minPlotAreaSqFt: 645.84,
      maxPlotAreaSqFt: 1614.59,
      label: 'Plot Area > 60 to 150 sq.m (645.9 to 1,614.6 sq.ft)',
      frontSetbackM: 0.90,
      rearSetbackM: 0.70,
      sideLeftSetbackM: 0.70,
      sideRightSetbackM: 0.0,
      frontSetbackFt: 2.95,
      rearSetbackFt: 2.30,
      sideLeftSetbackFt: 2.30,
      sideRightSetbackFt: 0.0,
      maxGroundCoveragePct: 75,
      notes: 'Category B: 2.95 ft front, 2.30 ft rear, 2.30 ft on any 1 side, 0 ft other side.',
    },
    {
      minPlotAreaSqM: 150.0001,
      maxPlotAreaSqM: 250,
      minPlotAreaSqFt: 1614.60,
      maxPlotAreaSqFt: 2690.98,
      label: 'Plot Area > 150 to 250 sq.m (1,614.7 to 2,691.0 sq.ft)',
      frontSetbackM: 1.00,
      rearSetbackM: 0.80,
      sideLeftSetbackM: 0.80,
      sideRightSetbackM: 0.80,
      frontSetbackFt: 3.28,
      rearSetbackFt: 2.62,
      sideLeftSetbackFt: 2.62,
      sideRightSetbackFt: 2.62,
      maxGroundCoveragePct: 75,
      notes: 'Category C: 3.28 ft front, 2.62 ft rear, 2.62 ft left, 2.62 ft right.',
    },
    {
      minPlotAreaSqM: 250.0001,
      maxPlotAreaSqM: 99999,
      minPlotAreaSqFt: 2690.99,
      maxPlotAreaSqFt: 999999,
      label: 'Plot Area > 250 sq.m (> 2,691 sq.ft)',
      frontSetbackM: 3.0,
      rearSetbackM: 2.0,
      sideLeftSetbackM: 1.5,
      sideRightSetbackM: 1.5,
      frontSetbackFt: 9.84,
      rearSetbackFt: 6.56,
      sideLeftSetbackFt: 4.92,
      sideRightSetbackFt: 4.92,
      maxGroundCoveragePct: 60,
      notes: 'Plots > 250 sq.m require customized zoning assessment under Master Plan II-2031.',
    },
  ],

  // Permissible FAR based on Road Width & Plot Size (MDA / MUDA & MCC Master Plan II-2031)
  farSlabs: [
    {
      minRoadWidthM: 0,
      maxRoadWidthM: 9.0,
      minRoadWidthFt: 0,
      maxRoadWidthFt: 29.5,
      roadLabel: 'Road Width < 9m (< 29.5 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 2691, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
      ],
      notes: 'Road width < 9.0m restriction: Maximum building height capped at 37.73 ft (11.5m). FAR 1.50.',
    },
    {
      minRoadWidthM: 9.0,
      maxRoadWidthM: 999.0,
      minRoadWidthFt: 29.5,
      maxRoadWidthFt: 9999.0,
      roadLabel: 'Road Width ≥ 9m (≥ 29.5 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 3875, permissibleFAR: 1.50, maxFloorsAllowed: 4 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 1.50, maxFloorsAllowed: 4 },
      ],
      notes: 'Standard road width: Base FAR 1.50 for plots up to 360 sq.m in Residential (Main) zone.',
    },
  ],

  generalNotes: [
    'MUDA residential building norms apply to MCC (Mysuru City Corporation) limits and MUDA approved layouts.',
    'Heritage zone overlay in central Mysuru may have additional height restrictions and aesthetic stipulations.',
  ],
};
