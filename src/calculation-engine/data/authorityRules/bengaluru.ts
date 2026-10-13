import { AuthorityRuleSet } from './types';
import { GBA_2026_SETBACK_RULES } from './gbaRules';

export { GBA_2026_SETBACK_RULES } from './gbaRules';

/**
 * Bengaluru / Greater Bengaluru (GBA / BBMP / BDA) Planning & Zoning Regulations
 * 
 * Official References:
 * - Karnataka Gazette amendment dated 5 January 2026 (Summary of Setback Rules for Buildings up to 12m)
 * - Bangalore Development Authority (BDA) Revised Master Plan 2015 (RMP-2015)
 * - Bruhat Bengaluru Mahanagara Palike (BBMP) Building Bye-Laws 2003 & Karnataka Municipal Corporations Act
 */
export const BENGALURU_AUTHORITY_RULES: AuthorityRuleSet = {
  ruleId: 'BLR-GBA-2026-RES-V1.0',
  city: 'Bangalore',
  displayName: 'Bengaluru',
  authority: 'BBMP/BDA',
  authorityFullName: 'Bruhat Bengaluru Mahanagara Palike / Bangalore Development Authority / Greater Bengaluru Authority',
  governingFramework: 'Karnataka Town and Country Planning Act, 1961 & Karnataka Gazette Amendment (Jan 2026)',
  ruleVersion: 'GBA-2026 / GAZETTE-ALIGN',
  effectiveDate: '2026-01-05',
  officialSourceDocument: 'Karnataka Gazette amendment dated 5 January 2026 (Summary Reference for Residential up to 12m)',
  disclaimer: 'Authority-informed estimate. Converted reference figures for buildings up to 12m. Final approval is subject to municipal sanction and professional architect verification.',
  defaultRoadWidthFt: 30, // Standard 9m (30ft) residential road

  // Configurable dynamic Plot Setback Rules (Karnataka Gazette amendment 5 Jan 2026)
  plotSetbackRules: GBA_2026_SETBACK_RULES,

  // Fallback static setback slabs based on GBA 2026 reference figures
  setbackSlabs: [
    {
      minPlotAreaSqM: 0,
      maxPlotAreaSqM: 60,
      minPlotAreaSqFt: 0,
      maxPlotAreaSqFt: 646,
      label: 'Plot Area ≤ 646 sq.ft (≤ 60 sq.m)',
      frontSetbackM: 0.75,
      rearSetbackM: 0.0,
      sideLeftSetbackM: 0.60,
      sideRightSetbackM: 0.0,
      frontSetbackFt: 2.46,
      rearSetbackFt: 0.0, // Marked as UNSPECIFIED in dynamic rule engine
      sideLeftSetbackFt: 1.97,
      sideRightSetbackFt: 0.0,
      maxGroundCoveragePct: 75,
      notes: 'Gazette Jan 2026 Table 1: 2.46 ft front, 1.97 ft on one side. Rear is unspecified in summary row.',
    },
    {
      minPlotAreaSqM: 60.01,
      maxPlotAreaSqM: 150,
      minPlotAreaSqFt: 646.01,
      maxPlotAreaSqFt: 1615,
      label: 'Plot Area 646–1,615 sq.ft (e.g. 30×40 = 1,200 sq.ft, 30×50 = 1,500 sq.ft)',
      frontSetbackM: 0.90,
      rearSetbackM: 0.70,
      sideLeftSetbackM: 0.70,
      sideRightSetbackM: 0.0,
      frontSetbackFt: 2.95,
      rearSetbackFt: 2.30,
      sideLeftSetbackFt: 2.30,
      sideRightSetbackFt: 0.0,
      maxGroundCoveragePct: 70,
      notes: 'Gazette Jan 2026 Table 1: 2.95 ft front, 2.30 ft rear, 2.30 ft on one side.',
    },
    {
      minPlotAreaSqM: 150.01,
      maxPlotAreaSqM: 500,
      minPlotAreaSqFt: 1615.01,
      maxPlotAreaSqFt: 5382,
      label: 'Plot Area 1,615–5,382 sq.ft (e.g. 40×60 = 2,400 sq.ft, 50×80 = 4,000 sq.ft)',
      frontSetbackM: 2.2,
      rearSetbackM: 1.5,
      sideLeftSetbackM: 1.0,
      sideRightSetbackM: 1.0,
      frontSetbackFt: 7.20, // Example on 60ft depth (12% of depth)
      rearSetbackFt: 4.80,  // Example on 60ft depth (8% of depth)
      sideLeftSetbackFt: 3.20, // Example on 40ft width (8% of width)
      sideRightSetbackFt: 3.20,
      maxGroundCoveragePct: 60,
      notes: 'Gazette Jan 2026 Table 1: Front 12% depth, Rear 8% depth, Sides 8% width. BDA Table 4.1 coverage 60%.',
    },
    {
      minPlotAreaSqM: 500.01,
      maxPlotAreaSqM: 1000,
      minPlotAreaSqFt: 5382.01,
      maxPlotAreaSqFt: 10764,
      label: 'Plot Area 5,382–10,764 sq.ft (500–1,000 sq.m)',
      frontSetbackM: 3.0,
      rearSetbackM: 2.5,
      sideLeftSetbackM: 2.0,
      sideRightSetbackM: 2.0,
      frontSetbackFt: 9.84,
      rearSetbackFt: 8.20,
      sideLeftSetbackFt: 6.56,
      sideRightSetbackFt: 6.56,
      maxGroundCoveragePct: 50,
      notes: 'Gazette Jan 2026 Table 1: Front 12% depth, Rear 8% depth, Sides 8% width. BDA Table 4.1 coverage 50%.',
    },
    {
      minPlotAreaSqM: 1000.01,
      maxPlotAreaSqM: 999999,
      minPlotAreaSqFt: 10764.01,
      maxPlotAreaSqFt: 9999999,
      label: 'Plot Area > 10,764 sq.ft (> 1,000 sq.m)',
      frontSetbackM: 5.0,
      rearSetbackM: 5.0,
      sideLeftSetbackM: 5.0,
      sideRightSetbackM: 5.0,
      frontSetbackFt: 16.40,
      rearSetbackFt: 16.40,
      sideLeftSetbackFt: 16.40,
      sideRightSetbackFt: 16.40,
      maxGroundCoveragePct: 45,
      notes: 'BDA Table 4.1 ground coverage 45% for large residential estates.',
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
    'Minimum setback calculations apply to normal residential buildings up to 12m (39.37 ft) height.',
    'For road width < 9.0m, statutory building height is restricted to Stilt + G + 2 or G + 2.',
    'Rainwater harvesting and minimum 1 off-street car parking space mandatory for plots > 1200 sq.ft.',
  ],
};
