import { AuthorityRuleSet } from './types';

/**
 * Bengaluru (BBMP / BDA) Planning & Zoning Regulations
 * 
 * Official References:
 * - Bangalore Development Authority (BDA) Revised Master Plan 2015 (RMP-2015)
 *   Zoning of Land Use and Regulations, Section 4: Residential (Main / Mixed) Regulations
 * - Bruhat Bengaluru Mahanagara Palike (BBMP) Building Bye-Laws 2003 & Karnataka Municipal Corporations Act
 * - Karnataka Urban Development Department (UDD) Notifications
 */
export const BENGALURU_AUTHORITY_RULES: AuthorityRuleSet = {
  ruleId: 'BLR-BDA-RMP2015-RES-V2.4',
  city: 'Bangalore',
  displayName: 'Bengaluru',
  authority: 'BBMP/BDA',
  authorityFullName: 'Bruhat Bengaluru Mahanagara Palike / Bangalore Development Authority',
  governingFramework: 'Karnataka Town and Country Planning Act, 1961 & BDA Revised Master Plan (RMP)',
  ruleVersion: 'RMP-2015 / BBMP-2020-ALIGN',
  effectiveDate: '2015-06-25',
  officialSourceDocument: 'BDA Revised Master Plan 2015 (Volume 3: Zoning Regulations, Table 4.1 & 4.2)',
  disclaimer: 'Authority-informed estimate. Final approval is subject to applicable local authority regulations and professional verification.',
  defaultRoadWidthFt: 30, // Standard 9m (30ft) residential road

  // Setback and Max Coverage Slabs based on Plot Area (BDA RMP-2015 Chapter 4, Table 4.1)
  setbackSlabs: [
    {
      minPlotAreaSqM: 0,
      maxPlotAreaSqM: 60,
      minPlotAreaSqFt: 0,
      maxPlotAreaSqFt: 645,
      label: 'Plot Area ≤ 60 sq.m (≤ 645 sq.ft)',
      frontSetbackM: 1.0,
      rearSetbackM: 0.0, // Attached permitted or small niche
      sideLeftSetbackM: 0.0,
      sideRightSetbackM: 1.0,
      frontSetbackFt: 3.28,
      rearSetbackFt: 0.0,
      sideLeftSetbackFt: 0.0,
      sideRightSetbackFt: 3.28,
      maxGroundCoveragePct: 75,
      notes: 'Row housing / small plot relaxation under BDA RMP Table 4.1.',
    },
    {
      minPlotAreaSqM: 60,
      maxPlotAreaSqM: 150,
      minPlotAreaSqFt: 646,
      maxPlotAreaSqFt: 1614,
      label: 'Plot Area 60–150 sq.m (e.g. 30×40 = 1,200 sq.ft)',
      frontSetbackM: 1.0,
      rearSetbackM: 1.0,
      sideLeftSetbackM: 1.0,
      sideRightSetbackM: 1.0,
      frontSetbackFt: 3.28,
      rearSetbackFt: 3.28,
      sideLeftSetbackFt: 3.28,
      sideRightSetbackFt: 3.28,
      maxGroundCoveragePct: 70,
      notes: 'Standard 30x40 residential plot under BDA Table 4.1 (1.0m front, 1.0m rear, 1.0m sides).',
    },
    {
      minPlotAreaSqM: 150,
      maxPlotAreaSqM: 240,
      minPlotAreaSqFt: 1615,
      maxPlotAreaSqFt: 2583,
      label: 'Plot Area 150–240 sq.m (e.g. 30×50 = 1,500 sq.ft, 40×60 = 2,400 sq.ft)',
      frontSetbackM: 1.5,
      rearSetbackM: 1.5,
      sideLeftSetbackM: 1.25,
      sideRightSetbackM: 1.25,
      frontSetbackFt: 4.92,
      rearSetbackFt: 4.92,
      sideLeftSetbackFt: 4.10,
      sideRightSetbackFt: 4.10,
      maxGroundCoveragePct: 65,
      notes: 'Medium residential plots under BDA Table 4.1 (1.5m front/rear, 1.25m sides).',
    },
    {
      minPlotAreaSqM: 240,
      maxPlotAreaSqM: 500,
      minPlotAreaSqFt: 2584,
      maxPlotAreaSqFt: 5382,
      label: 'Plot Area 240–500 sq.m (e.g. 50×80 = 4,000 sq.ft)',
      frontSetbackM: 3.0,
      rearSetbackM: 2.0,
      sideLeftSetbackM: 1.5,
      sideRightSetbackM: 1.5,
      frontSetbackFt: 9.84,
      rearSetbackFt: 6.56,
      sideLeftSetbackFt: 4.92,
      sideRightSetbackFt: 4.92,
      maxGroundCoveragePct: 60,
      notes: 'Large residential plots under BDA Table 4.1.',
    },
    {
      minPlotAreaSqM: 500,
      maxPlotAreaSqM: 99999,
      minPlotAreaSqFt: 5383,
      maxPlotAreaSqFt: 999999,
      label: 'Plot Area > 500 sq.m (e.g. 60×90 = 5,400 sq.ft)',
      frontSetbackM: 4.5,
      rearSetbackM: 3.0,
      sideLeftSetbackM: 3.0,
      sideRightSetbackM: 3.0,
      frontSetbackFt: 14.76,
      rearSetbackFt: 9.84,
      sideLeftSetbackFt: 9.84,
      sideRightSetbackFt: 9.84,
      maxGroundCoveragePct: 50,
      notes: 'Estate / large bungalow plots under BDA Table 4.1.',
    },
  ],

  // Permissible FAR based on Road Width & Plot Size (BDA RMP-2015 Table 4.2)
  farSlabs: [
    {
      minRoadWidthM: 0,
      maxRoadWidthM: 9.0,
      minRoadWidthFt: 0,
      maxRoadWidthFt: 29.9,
      roadLabel: 'Road Width < 9m (< 30 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1614, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
        { maxPlotAreaSqFt: 2583, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 1.50, maxFloorsAllowed: 3 },
      ],
      notes: 'Narrow road restriction under BBMP/BDA bylaws: Max height typically capped at G+2 (11.5m).',
    },
    {
      minRoadWidthM: 9.0,
      maxRoadWidthM: 12.0,
      minRoadWidthFt: 30.0,
      maxRoadWidthFt: 39.9,
      roadLabel: 'Road Width 9m–12m (30 ft – 40 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1614, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
        { maxPlotAreaSqFt: 2583, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 1.75, maxFloorsAllowed: 4 },
      ],
      notes: 'Standard residential road width supporting base FAR 1.75.',
    },
    {
      minRoadWidthM: 12.0,
      maxRoadWidthM: 15.0,
      minRoadWidthFt: 40.0,
      maxRoadWidthFt: 49.9,
      roadLabel: 'Road Width 12m–15m (40 ft – 50 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1614, permissibleFAR: 2.00, maxFloorsAllowed: 5 },
        { maxPlotAreaSqFt: 2583, permissibleFAR: 2.00, maxFloorsAllowed: 5 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 2.25, maxFloorsAllowed: 5 },
      ],
      notes: 'Medium-wide collector road supporting enhanced FAR 2.00–2.25.',
    },
    {
      minRoadWidthM: 15.0,
      maxRoadWidthM: 999.0,
      minRoadWidthFt: 50.0,
      maxRoadWidthFt: 9999.0,
      roadLabel: 'Road Width ≥ 15m (≥ 50 ft)',
      plotAreaCategories: [
        { maxPlotAreaSqFt: 1614, permissibleFAR: 2.25, maxFloorsAllowed: 6 },
        { maxPlotAreaSqFt: 2583, permissibleFAR: 2.25, maxFloorsAllowed: 6 },
        { maxPlotAreaSqFt: 999999, permissibleFAR: 2.50, maxFloorsAllowed: 6 },
      ],
      notes: 'Arterial road supporting maximum FAR up to 2.50.',
    },
  ],

  generalNotes: [
    'Minimum setback calculations apply to normal residential buildings up to 11.5m height.',
    'For road width < 9.0m, statutory building height is restricted to Stilt + G + 2 or G + 2.',
    'Rainwater harvesting and minimum 1 off-street car parking space mandatory for plots > 1200 sq.ft.',
  ],
};
