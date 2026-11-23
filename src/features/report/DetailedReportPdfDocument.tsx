import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Rect, Line, G } from '@react-pdf/renderer';
import { CalculationResult, FixtureScheduleItem, BOQItem } from '../../calculation-engine/types';
import { formatUnitLabel } from '../../calculation-engine/data/units';
import {
  evaluatePlotSetbackDetails,
  evaluateBuildingHeight,
  getCityPlanningLimits,
} from '../../calculation-engine/data/setbackRules';

// ─────────────────────────────────────────────────────────────
// HUTTY RESIDENTIAL ARCHITECTURAL EDITORIAL DESIGN SYSTEM
// Strict brand tokens: Deep Forest Green, Warm Charcoal, Terracotta
// Zero SaaS clutter, high readability, architectural elegance
// ─────────────────────────────────────────────────────────────
const C = {
  forest: '#1B3D34', // Primary brand deep green
  forestLt: '#2A5C4E', // Accent green
  terracotta: '#C2410C', // Warm terracotta / burnt orange
  amber: '#D97706', // Warning / advisory highlight
  amberBg: '#FEF3C7', // Soft amber container
  amberBorder: '#F59E0B', // Amber border
  charcoal: '#1F2937', // Primary body text
  titleDark: '#111827', // Headings
  grey: '#4B5563', // Secondary body text
  greyLt: '#6B7280', // Metadata & subtle labels
  border: '#E5E7EB', // Table & divider border
  borderDark: '#D1D5DB', // Card border
  bgAlt: '#F9FAFB', // Alternate table rows
  bgPage: '#FFFFFF', // Clean paper white
  bgCover: '#1B3D34', // Executive cover background
  bgSage: '#F0F5F3', // Light sage panel
  bgSageDark: '#E6EFEA', // Setback hatched zone
  sageBorder: '#CBDAD3', // Sage border
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  // ── Pages ──
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 30,
    fontFamily: 'Helvetica',
    fontSize: 7.2,
    color: C.charcoal,
    backgroundColor: C.bgPage,
    lineHeight: 1.3,
  },
  paragraph: {
    fontSize: 6.5,
    color: C.grey,
    lineHeight: 1.35,
    marginBottom: 6,
  },

  // ── Executive Cover Page ──
  coverPage: {
    fontFamily: 'Helvetica',
    color: '#FFFFFF',
    backgroundColor: C.bgCover,
    flexDirection: 'column',
  },
  coverTop: {
    paddingHorizontal: 36,
    paddingTop: 36,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  coverLogoText: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  coverTagline: {
    fontSize: 7.5,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  coverMid: {
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
  },
  coverDocBadge: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FDBA74',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  coverMainTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    lineHeight: 1.2,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 8.5,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.4,
    maxWidth: 440,
    marginBottom: 20,
  },

  // Cover KPI Cards
  coverKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  coverKpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    padding: 9,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  coverKpiLabel: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  coverKpiValue: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  coverKpiSub: {
    fontSize: 5.8,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },

  // Cover Meta Grid
  coverMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginTop: 12,
  },
  coverMetaCell: {
    width: '50%',
    padding: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  coverMetaLabel: {
    fontSize: 5.8,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 1.5,
  },
  coverMetaValue: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },

  coverNoteBox: {
    marginTop: 14,
    backgroundColor: 'rgba(194,65,12,0.18)',
    borderWidth: 0.8,
    borderColor: '#EA580C',
    borderRadius: 4,
    padding: 8,
  },
  coverNoteTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FDBA74',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  coverNoteText: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 1.35,
  },

  coverBottom: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverBottomText: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.4)',
  },

  // ── Running Header ──
  runningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1.2,
    borderBottomColor: C.forest,
  },
  runningHeaderLogo: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.forest,
    letterSpacing: 1.5,
  },
  runningHeaderSection: {
    fontSize: 6.2,
    color: C.greyLt,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 1.5,
  },
  runningHeaderMeta: {
    fontSize: 5.8,
    color: C.greyLt,
    textAlign: 'right',
    lineHeight: 1.25,
  },

  // ── Running Footer ──
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 3.5,
    fontSize: 5.6,
    color: C.greyLt,
  },

  // ── Section Titles ──
  sectionBanner: {
    backgroundColor: C.forest,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionBannerText: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBannerSub: {
    fontSize: 5.8,
    color: 'rgba(255,255,255,0.7)',
  },

  subSectionTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.forest,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
    marginBottom: 3,
  },

  // ── Summary KPI Cards ──
  kpiRow: {
    flexDirection: 'row',
    gap: 4.5,
    marginBottom: 5,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.bgSage,
    borderRadius: 3,
    padding: 5,
    borderWidth: 0.5,
    borderColor: C.border,
    borderLeftWidth: 2.2,
    borderLeftColor: C.forest,
  },
  kpiCardAlt: {
    flex: 1,
    backgroundColor: '#FAF5F0',
    borderRadius: 3,
    padding: 5,
    borderWidth: 0.5,
    borderColor: '#FED7AA',
    borderLeftWidth: 2.2,
    borderLeftColor: C.terracotta,
  },
  kpiLabel: {
    fontSize: 5.4,
    color: C.greyLt,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1.5,
  },
  kpiValue: {
    fontSize: 8.8,
    fontFamily: 'Helvetica-Bold',
    color: C.titleDark,
  },
  kpiSub: {
    fontSize: 5.4,
    color: C.grey,
    marginTop: 1,
  },

  // ── Tables ──
  tableContainer: {
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.forest,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: C.bgAlt,
  },
  th: {
    fontSize: 5.8,
    fontFamily: 'Helvetica-Bold',
    color: C.forest,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  td: {
    fontSize: 6.2,
    color: C.charcoal,
  },
  tdMuted: {
    fontSize: 5.8,
    color: C.grey,
  },
  tdBold: {
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
    color: C.titleDark,
  },
  tdRight: {
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: C.forest,
    paddingVertical: 3,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  totalValue: {
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
    color: '#FDBA74',
    textAlign: 'right',
  },

  // ── Info Boxes ──
  infoBox: {
    backgroundColor: C.bgSage,
    padding: 5,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.sageBorder,
    borderLeftWidth: 2.2,
    borderLeftColor: C.forest,
    marginTop: 4,
    marginBottom: 4,
  },
  warningBox: {
    backgroundColor: C.amberBg,
    padding: 5,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.amberBorder,
    borderLeftWidth: 2.2,
    borderLeftColor: C.amber,
    marginTop: 4,
    marginBottom: 4,
  },
  boxTitle: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: C.forest,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 1.5,
  },
  boxText: {
    fontSize: 5.6,
    color: C.grey,
    lineHeight: 1.3,
  },
});

export interface DetailedReportPdfProps {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
  isPremium?: boolean;
  isSample?: boolean;
}

const fmt = (val?: number) => {
  if (!val && val !== 0) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
};
const num = (val?: number) => (val ?? 0).toLocaleString('en-IN');

export const DetailedReportPdfDocument: React.FC<DetailedReportPdfProps> = ({
  data,
  projectName = 'Residential Build Project',
  preparedFor = 'Valued Homeowner',
  specificationTier = 'Premium',
  isPremium = false,
  isSample = false,
}) => {
  const { input, report, area, budget, boq, materialSchedule, fixtureSchedule, timeline, paymentPlan, quantities } = data;
  const rateMeta = data.rateSourceMetadata || report?.rateSourceMetadata;

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const refId = report?.projectId || 'HUTTY-2026';
  const city = input?.city || 'Bangalore';
  const houseType = input?.houseType || 'Duplex';
  const totalBUA = area?.totalBUASqFt || 0;
  const plotLength = input?.plotLength || 40;
  const plotWidth = input?.plotWidth || 30;
  const plotArea = area?.plotAreaSqFt || (plotLength * plotWidth);

  // Column width profiles
  const W_BOQ = { sl: '6%', desc: '48%', qty: '15%', rate: '14%', amt: '17%' };
  const W_COMM = { name: '46%', desc: '26%', amt: '16%', pct: '12%' };

  // Calculate realistic cost ranges (±4%)
  const totalCost = budget?.totalProjectCost || 0;
  const minCostRange = Math.round(totalCost * 0.96);
  const maxCostRange = Math.round(totalCost * 1.04);

  // Authoritative Setback & Planning limits
  const selectedSideSetback = (input as any)?.selectedSideSetback || 'left';
  const setbackDetails = evaluatePlotSetbackDetails({
    city,
    plotLength,
    plotWidth,
    selectedSideSetback,
  });

  const planningLimits = getCityPlanningLimits(city);

  const frontSetback = setbackDetails.front.feet;
  const rearSetback = setbackDetails.rear.feet;
  const leftSetback = setbackDetails.left.feet;
  const rightSetback = setbackDetails.right.feet;

  const buildableLength = setbackDetails.buildableDepthFt;
  const buildableWidth = setbackDetails.buildableWidthFt;
  const buildableFootprint = setbackDetails.buildableFootprintSqFt;
  const groundCoveragePct = setbackDetails.groundCoveragePct;
  const maxCoveragePct = planningLimits.maxGroundCoveragePct;

  // One-side setback detection
  const isOneSideSetback = setbackDetails.sideCondition === 'one_side';
  const requiredSideSetback = isOneSideSetback ? (setbackDetails.left.feet || setbackDetails.right.feet) : setbackDetails.left.feet;

  // Site plan SVG scaling calculations (515 x 300 box - substantially enlarged)
  const SVG_SITE_W = 515;
  const SVG_SITE_H = 300;
  const aspect = plotWidth / (plotLength || 1);
  let pw = 300;
  let pl = 195;
  if (aspect <= 1) {
    // Standard residential plot (e.g. 20x30, 30x40, 30x50, 40x60)
    pl = 195;
    pw = Math.max(275, Math.min(325, Math.round(pl * Math.max(0.75, aspect))));
  } else {
    // Wide frontage plot
    pw = 325;
    pl = Math.max(150, Math.min(195, Math.round(pw / Math.min(1.5, aspect))));
  }
  const px = (SVG_SITE_W - pw) / 2;
  const py = 54 + (195 - pl) / 2;

  const siteScaleX = pw / (plotWidth || 1);
  const siteScaleY = pl / (plotLength || 1);

  const fsPx = Math.min(pl * 0.35, Math.max(16, frontSetback * siteScaleY));
  const rsPx = rearSetback === 0 ? 0 : Math.min(pl * 0.35, Math.max(16, rearSetback * siteScaleY));
  const lsPx = leftSetback === 0 ? 0 : Math.min(pw * 0.35, Math.max(16, leftSetback * siteScaleX));
  const rsbPx = rightSetback === 0 ? 0 : Math.min(pw * 0.35, Math.max(16, rightSetback * siteScaleX));

  const bx = px + lsPx;
  const by = py + fsPx;
  const bw = Math.max(0, pw - (lsPx + rsbPx));
  const bh = Math.max(0, pl - (fsPx + rsPx));

  // Authoritative Building height evaluation
  const numFloors = input?.floors || 2;
  const roadWidthFt = input?.roadWidthFt || 30;
  const hasStilt = input?.parkingType === 'Stilt' || input?.parkingType === 'Stilt Parking';
  const heightDetails = evaluateBuildingHeight({
    city,
    numFloors,
    hasStilt,
    roadWidthFt,
  });

  const plinthHt = heightDetails.plinthHtFt;
  const floorHt = heightDetails.floorHtFt;
  const stairHt = heightDetails.stairHtFt;
  const terraceLevel = plinthHt + (numFloors * floorHt);
  const totalStructureHeight = heightDetails.totalProposedHeightFt;
  const maxStatutoryHeight = heightDetails.maxPermittedHeightFt;

  // Running Header Helper
  const RunHeader = ({ section }: { section: string }) => (
    <View style={styles.runningHeader} fixed>
      <View>
        <Text style={styles.runningHeaderLogo}>HUTTY</Text>
        <Text style={styles.runningHeaderSection}>{section}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {isSample ? (
          <Text style={{ fontSize: 6.2, fontFamily: 'Helvetica-Bold', color: '#C2410C', letterSpacing: 0.5 }}>
            SAMPLE REPORT · NOT A REAL PROJECT
          </Text>
        ) : (
          <Text style={styles.runningHeaderMeta}>Ref: {refId} · Date: {dateStr}</Text>
        )}
        <Text style={styles.runningHeaderMeta}>{projectName} · {city}</Text>
      </View>
    </View>
  );

  // Running Footer Helper
  const DocFooter = ({ section }: { section: string }) => (
    <View style={styles.footer} fixed>
      <Text>
        {isSample
          ? `Hutty Sample Construction Report (Demonstration) · Ref: ${refId} · ${section}`
          : `Hutty Residential Construction Dossier · Ref: ${refId} · ${section}`}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );

  // Fixtures categorize helper
  const allFixtures = fixtureSchedule || [];
  const electricalFixtures = allFixtures.filter(
    (f) => f.category === 'Electrical Fixtures' || f.category.toLowerCase().includes('electrical')
  );
  const plumbingFixtures = allFixtures.filter(
    (f) => f.category === 'Plumbing Tanks & Pumps' || f.category.toLowerCase().includes('plumbing')
  );
  const sanitaryFixtures = allFixtures.filter(
    (f) => f.category === 'Sanitary Fixtures' || f.category.toLowerCase().includes('sanitary')
  );
  const doorWindowFixtures = allFixtures.filter(
    (f) => f.category === 'Doors' || f.category === 'Windows'
  );

  // Group BOQ into divisions
  const boqItems = boq || [];
  const divSubstructure = boqItems.filter(b => b.category.includes('Site') || b.category.includes('Excavation') || b.category.includes('PCC') || b.category.includes('Foundation') || b.category.includes('Plinth'));
  const divSuperstructure = boqItems.filter(b => b.category.includes('RCC') || b.category.includes('Roofing'));
  const divMasonryPlaster = boqItems.filter(b => b.category.includes('Masonry') || b.category.includes('Plastering'));
  const divFinishes = boqItems.filter(b => b.category.includes('Flooring') || b.category.includes('Doors') || b.category.includes('Windows') || b.category.includes('Painting'));
  const divMEP = boqItems.filter(b => b.category.includes('Electrical') || b.category.includes('Plumbing'));

  return (
    <Document
      title={`Hutty-Construction-Report-${refId}`}
      author="Hutty Construction Technologies"
      subject="Residential Construction Planning & Estimation Report"
    >

      {/* ══════════════════════════════════════════════════
          PAGE 1 — SECTION 01: COVER PAGE
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTop}>
          <Text style={styles.coverLogoText}>HUTTY</Text>
          <Text style={styles.coverTagline}>Residential Construction Planning &amp; Estimation Platform</Text>
        </View>

        <View style={styles.coverMid}>
          {isSample && (
            <View style={{ backgroundColor: '#EA580C', paddingVertical: 3.5, paddingHorizontal: 8, borderRadius: 2, marginBottom: 8, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 7.5, fontFamily: 'Helvetica-Bold', letterSpacing: 1.2 }}>
                SAMPLE REPORT — NOT A REAL PROJECT
              </Text>
            </View>
          )}
          <Text style={styles.coverDocBadge}>Complete Construction Planning &amp; Estimation Report</Text>
          <Text style={styles.coverMainTitle}>
            {houseType} Residence{'\n'}
            {num(totalBUA)} sq.ft Built-Up Area
          </Text>
          <Text style={styles.coverSubtitle}>
            Authoritative pre-construction digital planning dossier for {city}.{'\n'}
            Includes Site &amp; Setback Analysis, Detailed Works BOQ, Material Takeoff, Specifications, Inclusions &amp; Exclusions, Timeline, and Milestone Payment Schedule.
          </Text>

          {/* 4 Primary Project KPIs */}
          <View style={styles.coverKpiRow}>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Total Estimated Cost</Text>
              <Text style={styles.coverKpiValue}>{fmt(totalCost)}</Text>
              <Text style={styles.coverKpiSub}>All-Inclusive Turnkey Plan</Text>
            </View>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Estimated Rate</Text>
              <Text style={styles.coverKpiValue}>₹{num(budget?.costPerSqFt)} / sq.ft</Text>
              <Text style={styles.coverKpiSub}>Effective Gross BUA Rate</Text>
            </View>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Built-Up Area</Text>
              <Text style={styles.coverKpiValue}>{num(totalBUA)} sq.ft</Text>
              <Text style={styles.coverKpiSub}>{input?.floors || 2} Floors · {houseType}</Text>
            </View>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Est. Timeline</Text>
              <Text style={styles.coverKpiValue}>{timeline?.totalMonths || 8} Months</Text>
              <Text style={styles.coverKpiSub}>Groundbreak to Handover</Text>
            </View>
          </View>

          {/* 3 Core Execution Sub-Cards */}
          <View style={[styles.coverKpiRow, { marginTop: 2, marginBottom: 14 }]}>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>Physical Materials</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 9.5 }]}>{fmt(budget?.directMaterialCost)}</Text>
              <Text style={styles.coverKpiSub}>What We Consume (~41%)</Text>
            </View>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>Trade Labour</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 9.5 }]}>{fmt(budget?.directLabourCost)}</Text>
              <Text style={styles.coverKpiSub}>Civil &amp; Finishing Trades (~15%)</Text>
            </View>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>Installed Fixtures</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 9.5 }]}>{fmt(budget?.directFixtureCost)}</Text>
              <Text style={styles.coverKpiSub}>Joinery, Electrical, Plumbing (~12%)</Text>
            </View>
          </View>

          {/* Project Parameter Grid */}
          <View style={styles.coverMetaGrid}>
            {[
              ['Project Reference', refId],
              ['Prepared For', preparedFor],
              ['Date Issued', dateStr],
              ['Location / Jurisdiction', `${city} (${area?.authorityMetadata?.authority || 'BBMP/BDA'})`],
              ['Plot Dimensions', `${plotLength}' × ${plotWidth}' (${num(plotArea)} sq.ft)`],
              ['Specification Standard', `${specificationTier.toUpperCase()} Quality`],
              ['Rate Master Dataset', rateMeta?.datasetVersion || 'HUTTY-RM-2026.1'],
              ['Engineering Engine', rateMeta?.calculationEngineVersion || 'v2.6.0 (NBC 2016 Aligned)'],
            ].map(([lbl, val], i) => (
              <View key={i} style={styles.coverMetaCell}>
                <Text style={styles.coverMetaLabel}>{lbl}</Text>
                <Text style={styles.coverMetaValue}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Early Estimate Advisory Notice */}
          <View style={styles.coverNoteBox}>
            <Text style={styles.coverNoteTitle}>Important Planning &amp; Estimation Notice</Text>
            <Text style={styles.coverNoteText}>
              This report provides a preliminary quantity surveying estimation to assist with residential construction planning, budgeting, and contractor quote vetting. Final costs and quantities are subject to certified site soil testing, structural working drawings, and approved architectural layouts.
            </Text>
          </View>
        </View>

        <View style={styles.coverBottom}>
          <Text style={styles.coverBottomText}>Hutty Construction Technologies · https://hutty.in</Text>
          <Text style={styles.coverBottomText}>PRELIMINARY ESTIMATE — NOT A CONTRACTUAL BINDING DOCUMENT</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 2 — SECTION 02: ARCHITECTURAL SITE PLAN & STATUTORY SETBACKS
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 02: Site Plan &amp; Statutory Setback Analysis" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 02 — Architectural Site Plan &amp; Statutory Setbacks</Text>
          <Text style={styles.sectionBannerSub}>Land Boundary, Road Frontage &amp; Permissible Footprint</Text>
        </View>

        <Text style={styles.paragraph}>
          Before construction, municipal planning authorities mandate open space buffers (setbacks) along plot boundaries to protect natural light, cross-ventilation, emergency fire access, and planned public road expansion. Below is the scaled 2D orthogonal site plan showing your property boundary, road access, statutory setback zones, and the permissible ground building footprint.
        </Text>

        {/* Large Architectural Site Plan */}
        <View style={{ backgroundColor: '#FAF9F6', borderWidth: 0.5, borderColor: '#D1D5DB', borderRadius: 3, padding: 4, alignItems: 'center' }}>
          <Svg width={SVG_SITE_W} height={SVG_SITE_H} viewBox={`0 0 ${SVG_SITE_W} ${SVG_SITE_H}`}>
            {/* 1. Road Frontage at top */}
            <Rect x={20} y={6} width={475} height={22} fill="#202824" rx={2} />
            <Line x1={30} y1={17} x2={485} y2={17} stroke="#C2410C" strokeWidth={1} strokeDasharray="5 4" />
            <Text x={257.5} y={15} textAnchor="middle" fill="#FFFFFF" style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
              {`PUBLIC ROAD FRONTAGE: ${roadWidthFt} FT WIDE MUNICIPAL ACCESS ROAD`}
            </Text>

            {/* Frontage line */}
            <Line x1={px - 20} y1={36} x2={px + pw + 20} y2={36} stroke="#1B3D34" strokeWidth={0.8} strokeDasharray="3 2" />
            <Text x={257.5} y={33} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>
              PROPERTY FRONTAGE &amp; DEMARCATION LINE
            </Text>

            {/* 2. Outer Plot Boundary */}
            <Rect x={px} y={py} width={pw} height={pl} fill="#FAF7F2" stroke="#1B3D34" strokeWidth={1.6} rx={2} />

            {/* Plot Dimensions */}
            {/* Top dimension (Plot Width) */}
            <Line x1={px} y1={py - 6} x2={px + pw} y2={py - 6} stroke="#1B3D34" strokeWidth={0.8} />
            <Line x1={px} y1={py - 9} x2={px} y2={py - 3} stroke="#1B3D34" strokeWidth={0.8} />
            <Line x1={px + pw} y1={py - 9} x2={px + pw} y2={py - 3} stroke="#1B3D34" strokeWidth={0.8} />
            <Text x={px + pw / 2} y={py - 8} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold' }}>
              {`PLOT WIDTH: ${plotWidth} FT (${(plotWidth * 0.3048).toFixed(2)}m)`}
            </Text>

            {/* Far Left dimension (Plot Depth) */}
            <Line x1={px - 62} y1={py} x2={px - 62} y2={py + pl} stroke="#1B3D34" strokeWidth={0.8} />
            <Line x1={px - 65} y1={py} x2={px - 59} y2={py} stroke="#1B3D34" strokeWidth={0.8} />
            <Line x1={px - 65} y1={py + pl} x2={px - 59} y2={py + pl} stroke="#1B3D34" strokeWidth={0.8} />
            <Text x={px - 67} y={py + pl / 2 + 2} textAnchor="end" fill="#1B3D34" style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold' }}>
              {`${plotLength} FT DEPTH`}
            </Text>

            {/* 3. Setback Clearances (Distinct Soft Amber Hatch/Fill) */}
            {/* Front Setback */}
            <Rect x={px} y={py} width={pw} height={fsPx} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={0.6} />
            <Text x={px + pw / 2} y={py + fsPx / 2 + 2} textAnchor="middle" fill="#92400E" style={{ fontSize: 6.6, fontFamily: 'Helvetica-Bold' }}>
              {`FRONT SETBACK CLEARANCE: ${frontSetback.toFixed(2)} FT (${(frontSetback * 0.3048).toFixed(2)}m)`}
            </Text>

            {/* Rear Setback */}
            {rsPx > 0 && (
              <Rect x={px} y={py + pl - rsPx} width={pw} height={rsPx} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={0.6} />
            )}
            <Text x={px + pw / 2} y={py + pl - (rsPx > 0 ? rsPx / 2 : 4) + 2} textAnchor="middle" fill="#92400E" style={{ fontSize: 6.6, fontFamily: 'Helvetica-Bold' }}>
              {rearSetback === 0
                ? 'REAR: 0 FT — CAN BUILD TO BOUNDARY'
                : `REAR SETBACK CLEARANCE: ${rearSetback.toFixed(2)} FT (${(rearSetback * 0.3048).toFixed(2)}m)`}
            </Text>

            {/* Left Setback */}
            {lsPx > 0 && (
              <Rect x={px} y={py + fsPx} width={lsPx} height={pl - fsPx - rsPx} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={0.6} />
            )}

            {/* Right Setback */}
            {rsbPx > 0 && (
              <Rect x={px + pw - rsbPx} y={py + fsPx} width={rsbPx} height={pl - fsPx - rsPx} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={0.6} />
            )}

            {/* 4. Permissible Buildable Footprint */}
            <Rect x={bx} y={by} width={bw} height={bh} fill="#FFFFFF" stroke="#1B3D34" strokeWidth={2} rx={2} />
            <Rect x={bx + 2} y={by + 2} width={bw - 4} height={bh - 4} fill="#EAF2EE" />

            {/* Center Labels inside Buildable Area */}
            <Text x={bx + bw / 2} y={by + bh / 2 - 16} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 8.2, fontFamily: 'Helvetica-Bold' }}>
              PERMISSIBLE BUILDABLE FOOTPRINT
            </Text>
            <Text x={bx + bw / 2} y={by + bh / 2 - 3} textAnchor="middle" fill="#C2410C" style={{ fontSize: 7.8, fontFamily: 'Helvetica-Bold' }}>
              {`${buildableWidth.toFixed(2)} FT (${(buildableWidth * 0.3048).toFixed(2)}m) WIDTH × ${buildableLength.toFixed(2)} FT (${(buildableLength * 0.3048).toFixed(2)}m) DEPTH`}
            </Text>
            <Text x={bx + bw / 2} y={by + bh / 2 + 10} textAnchor="middle" fill="#374151" style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
              {`~${buildableFootprint.toLocaleString()} SQ.FT GROUND ENVELOPE (${groundCoveragePct}% COVERAGE)`}
            </Text>
            <Text x={bx + bw / 2} y={by + bh / 2 + 22} textAnchor="middle" fill="#6B7280" style={{ fontSize: 6 }}>
              (Approximate area available for your house)
            </Text>

            {/* 5. Side Setback Descriptive Labels (Positioned outside plot with clear callouts) */}
            {/* Left Boundary Callout */}
            <Line x1={px - 22} y1={py + pl / 2} x2={px} y2={py + pl / 2} stroke="#C2410C" strokeWidth={0.8} />
            <Text x={px - 25} y={py + pl / 2 - 2} textAnchor="end" fill="#C2410C" style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>
              {leftSetback > 0 ? `LEFT: ${setbackDetails.left.displayFeet}` : 'LEFT: 0 FT'}
            </Text>
            <Text x={px - 25} y={py + pl / 2 + 8} textAnchor="end" fill="#6B7280" style={{ fontSize: 5.2 }}>
              {leftSetback > 0 ? `(${setbackDetails.left.displayMeters} Open Side)` : '(Can Build to Boundary)'}
            </Text>

            {/* Right Boundary Callout */}
            <Line x1={px + pw} y1={py + pl / 2} x2={px + pw + 22} y2={py + pl / 2} stroke="#C2410C" strokeWidth={0.8} />
            <Text x={px + pw + 25} y={py + pl / 2 - 2} textAnchor="start" fill="#C2410C" style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>
              {rightSetback > 0 ? `RIGHT: ${setbackDetails.right.displayFeet}` : 'RIGHT: 0 FT'}
            </Text>
            <Text x={px + pw + 25} y={py + pl / 2 + 8} textAnchor="start" fill="#6B7280" style={{ fontSize: 5.2 }}>
              {rightSetback > 0 ? `(${setbackDetails.right.displayMeters} Open Side)` : '(Can Build to Boundary)'}
            </Text>

            {/* Total Area Callout Box in Bottom Right */}
            <Rect x={px + pw - 130} y={py + pl + 14} width={130} height={16} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={0.5} rx={2} />
            <Text x={px + pw - 65} y={py + pl + 25} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 5.8, fontFamily: 'Helvetica-Bold' }}>
              {`TOTAL LAND: ${plotWidth}' × ${plotLength}' = ${plotArea.toLocaleString()} SQ.FT`}
            </Text>
          </Svg>

          {/* SVG Legend */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, width: '100%', marginTop: 2, paddingVertical: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={{ width: 8, height: 8, backgroundColor: '#FEF3C7', borderWidth: 0.5, borderColor: '#F59E0B' }} />
              <Text style={{ fontSize: 5.4, color: C.grey }}>Required Open Space Buffer (Setback)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={{ width: 8, height: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#1B3D34' }} />
              <Text style={{ fontSize: 5.4, fontFamily: 'Helvetica-Bold', color: C.forest }}>Permissible Ground Footprint</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={{ width: 14, height: 6, backgroundColor: '#202824' }} />
              <Text style={{ fontSize: 5.4, color: C.grey }}>Public Road Access</Text>
            </View>
          </View>
        </View>

        {/* Compact Setback Schedule Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: '25%' }]}>Setback Zone</Text>
            <Text style={[styles.th, { width: '25%' }]}>Statutory Limit</Text>
            <Text style={[styles.th, { width: '22%' }]}>Proposed Design</Text>
            <Text style={[styles.th, styles.tdRight, { width: '28%' }]}>Compliance &amp; Purpose</Text>
          </View>
          {[
            [
              'Front Road Setback',
              `${setbackDetails.front.displayFeet} (${setbackDetails.front.displayMeters})`,
              `${setbackDetails.front.displayFeet} planned`,
              'Compliant · Protects road alignment',
            ],
            [
              'Rear Boundary Setback',
              setbackDetails.rear.isZero ? '0 ft (Zero setback permitted)' : `${setbackDetails.rear.displayFeet} (${setbackDetails.rear.displayMeters})`,
              setbackDetails.rear.isZero ? '0 ft (Built to boundary)' : `${setbackDetails.rear.displayFeet} planned`,
              setbackDetails.rear.isZero ? 'Compliant · Micro-plot boundary' : 'Compliant · Ventilation & pipeline buffer',
            ],
            [
              'Side Setbacks (Left / Right)',
              setbackDetails.sideCondition === 'one_side'
                ? `${(setbackDetails.left.feet || setbackDetails.right.feet).toFixed(2)} ft on one side / 0 ft other`
                : `${setbackDetails.left.displayFeet} / ${setbackDetails.right.displayFeet}`,
              `L: ${setbackDetails.left.displayFeet} · R: ${setbackDetails.right.displayFeet}`,
              setbackDetails.sideCondition === 'one_side'
                ? `Compliant · Clearance on ${setbackDetails.selectedSide} side`
                : 'Compliant · Air circulation gap',
            ],
            [
              'Ground Coverage (Footprint)',
              planningLimits.isCoverageStatutory
                ? `Max ${planningLimits.maxGroundCoveragePct}% (${Math.round(plotArea * (planningLimits.maxGroundCoveragePct / 100)).toLocaleString()} sq.ft)`
                : `Baseline: ~${planningLimits.maxGroundCoveragePct}% (${planningLimits.coverageSourceNote})`,
              `${setbackDetails.groundCoveragePct}% (${setbackDetails.buildableFootprintSqFt.toLocaleString()} sq.ft)`,
              planningLimits.isCoverageStatutory
                ? (setbackDetails.groundCoveragePct <= planningLimits.maxGroundCoveragePct ? 'Within Permissible Limit' : 'Exceeds Statutory Ceiling')
                : (setbackDetails.groundCoveragePct <= planningLimits.maxGroundCoveragePct ? 'Within Assumed Baseline (~70%)' : 'Exceeds Assumed Baseline (~70%) · Subject to Sanction'),
            ],
            [
              'Floor Area Ratio (FAR)',
              planningLimits.isFARStatutory
                ? `Base FAR ${planningLimits.baseFAR.toFixed(2)} (${Math.round(plotArea * planningLimits.baseFAR).toLocaleString()} sq.ft)`
                : `Baseline: ~${planningLimits.baseFAR.toFixed(2)} (${planningLimits.farSourceNote})`,
              `${(totalBUA / (plotArea || 1)).toFixed(2)} (${totalBUA.toLocaleString()} sq.ft)`,
              planningLimits.isFARStatutory
                ? ((totalBUA / (plotArea || 1)) <= planningLimits.baseFAR ? 'Compliant with Zonal Master Plan' : 'Requires Premium FAR Sanction')
                : ((totalBUA / (plotArea || 1)) <= planningLimits.baseFAR ? 'Within Assumed Baseline (~1.75)' : 'Exceeds Assumed Baseline (~1.75) · Subject to Sanction'),
            ],
          ].map(([param, stat, prop, statLabel], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: '25%' }]}>{param}</Text>
              <Text style={[styles.tdMuted, { width: '25%' }]}>{stat}</Text>
              <Text style={[styles.td, { width: '22%' }]}>{prop}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '28%', color: C.forestLt }]}>{statLabel}</Text>
            </View>
          ))}
        </View>

        {/* Small Compliance Notice */}
        <View style={styles.infoBox}>
          <Text style={styles.boxTitle}>Statutory Planning &amp; Setback Notice</Text>
          <Text style={styles.boxText}>
            Setbacks are computed per applicable municipal building byelaws ({area?.authorityMetadata?.source || 'BBMP Building Bye-laws 2003 / BDA Revised Master Plan'}). This schematic is an architectural planning guide. Exact property boundary markers and road crown levels should be verified on-site by a licensed land surveyor before foundation excavation.
          </Text>
        </View>

        <DocFooter section="Section 02: Site Plan &amp; Statutory Setback Analysis" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 3 — SECTION 03: BUILDING HEIGHT & VERTICAL ELEVATION PROFILE
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 03: Building Height &amp; Vertical Stacking" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 03 — Permissible Building Height &amp; Vertical Elevation Profile</Text>
          <Text style={styles.sectionBannerSub}>Vertical Stacking Rules, Floor Heights &amp; Road Width Ceilings</Text>
        </View>

        <Text style={styles.paragraph}>
          Under applicable municipal building regulations ({heightDetails.ruleTitle}), permissible residential building height is determined by zoning framework and stilt parking provision. {heightDetails.ruleDescription} For an abutting road width of {roadWidthFt} ft in {city}, the maximum permissible building height is {heightDetails.maxPermittedHeightFt.toFixed(2)} ft ({heightDetails.maxPermittedHeightM.toFixed(2)}m). Proposed total building height is {heightDetails.totalProposedHeightFt.toFixed(2)} ft ({heightDetails.totalProposedHeightM.toFixed(2)}m). Below is the scaled architectural elevation profile displaying every level from road datum to rooftop stair enclosure.
        </Text>

        {/* Large Architectural Building Height Elevation */}
        <View style={{ backgroundColor: '#FAF9F6', borderWidth: 0.5, borderColor: '#D1D5DB', borderRadius: 3, padding: 4, alignItems: 'center' }}>
          <Svg width={515} height={270} viewBox="0 0 515 270">
            {/* Ground / Road Level Line */}
            <Line x1={150} y1={230} x2={500} y2={230} stroke="#1B3D34" strokeWidth={2} />
            {/* Earth hatching lines */}
            {[160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480].map((hx, i) => (
              <Line key={i} x1={hx} y1={230} x2={hx - 7} y2={240} stroke="#9CA3AF" strokeWidth={0.8} />
            ))}
            <Text x={325} y={242} textAnchor="middle" fill="#6B7280" style={{ fontSize: 6, fontFamily: 'Helvetica-Bold' }}>
              STREET LEVEL / NATURAL GROUND LEVEL DATUM (± 0.00 FT)
            </Text>

            {/* Plinth Level (y = 212 to 230, height 18) */}
            <Rect x={180} y={212} width={200} height={18} fill="#E5E7EB" stroke="#4B5563" strokeWidth={0.8} />
            <Text x={280} y={223} textAnchor="middle" fill="#4B5563" style={{ fontSize: 6.2, fontFamily: 'Helvetica-Bold' }}>
              PLINTH LEVEL (+2.5 FT ABOVE ROAD) · RAIN SURFACE DEFENSE
            </Text>

            {/* Ground Floor (y = 146 to 212, height 66) */}
            <Rect x={180} y={146} width={200} height={66} fill="#FFFFFF" stroke="#1B3D34" strokeWidth={1.4} />
            {/* Columns */}
            <Rect x={180} y={146} width={9} height={66} fill="#1B3D34" />
            <Rect x={371} y={146} width={9} height={66} fill="#1B3D34" />
            {/* Entrance Door */}
            <Rect x={205} y={166} width={26} height={46} fill="#FAF5F0" stroke="#C2410C" strokeWidth={0.9} />
            <Line x1={218} y1={166} x2={218} y2={212} stroke="#C2410C" strokeWidth={0.6} />
            {/* Ground Floor Window */}
            <Rect x={302} y={168} width={42} height={32} fill="#F0F5F3" stroke="#2A5C4E" strokeWidth={0.9} />
            <Line x1={323} y1={168} x2={323} y2={200} stroke="#2A5C4E" strokeWidth={0.6} />
            {/* Ground Floor Label */}
            <Text x={280} y={158} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
              GROUND FLOOR
            </Text>
            <Text x={280} y={206} textAnchor="middle" fill="#6B7280" style={{ fontSize: 5.5 }}>
              10' 0" Floor-to-Floor · 9' 0" Clear Headroom
            </Text>

            {/* Ground Floor Slab (y = 141 to 146) */}
            <Rect x={178} y={141} width={204} height={5} fill="#1B3D34" />

            {/* First Floor (y = 75 to 141, height 66) */}
            <Rect x={180} y={75} width={200} height={66} fill="#FFFFFF" stroke="#1B3D34" strokeWidth={1.4} />
            {/* Columns */}
            <Rect x={180} y={75} width={9} height={66} fill="#1B3D34" />
            <Rect x={371} y={75} width={9} height={66} fill="#1B3D34" />
            {/* Balcony Projection on Left */}
            <Rect x={150} y={105} width={30} height={36} fill="none" stroke="#C2410C" strokeWidth={0.9} />
            <Line x1={150} y1={105} x2={180} y2={105} stroke="#C2410C" strokeWidth={1.2} />
            <Text x={165} y={124} textAnchor="middle" fill="#C2410C" style={{ fontSize: 5.5 }}>Balcony</Text>
            {/* First Floor Windows */}
            <Rect x={218} y={93} width={38} height={32} fill="#F0F5F3" stroke="#2A5C4E" strokeWidth={0.9} />
            <Rect x={306} y={93} width={38} height={32} fill="#F0F5F3" stroke="#2A5C4E" strokeWidth={0.9} />
            {/* First Floor Label */}
            <Text x={280} y={87} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
              FIRST FLOOR
            </Text>
            <Text x={280} y={135} textAnchor="middle" fill="#6B7280" style={{ fontSize: 5.5 }}>
              10' 0" Floor-to-Floor · 9' 0" Clear Headroom
            </Text>

            {/* Roof Slab / Terrace Level (y = 70 to 75) */}
            <Rect x={178} y={70} width={204} height={5} fill="#1B3D34" />

            {/* Rooftop Parapet Wall (y = 52 to 70, height 18 = 3 ft) */}
            <Rect x={180} y={52} width={46} height={18} fill="#D1D5DB" stroke="#4B5563" strokeWidth={0.8} />
            <Text x={203} y={63} textAnchor="middle" fill="#1F2937" style={{ fontSize: 5.5 }}>3' Parapet</Text>
            <Rect x={334} y={52} width={46} height={18} fill="#D1D5DB" stroke="#4B5563" strokeWidth={0.8} />
            <Text x={357} y={63} textAnchor="middle" fill="#1F2937" style={{ fontSize: 5.5 }}>3' Parapet</Text>

            {/* Staircase Headroom Enclosure (y = 24 to 70, height 46 = 7.5 ft) */}
            <Rect x={228} y={24} width={104} height={46} fill="#F9FAFB" stroke="#1B3D34" strokeWidth={1.4} />
            {/* Overhead Water Tank Tower */}
            <Rect x={248} y={10} width={64} height={14} fill="#0284C7" stroke="#0369A1" strokeWidth={0.9} rx={1} />
            <Text x={280} y={20} textAnchor="middle" fill="#FFFFFF" style={{ fontSize: 5.5, fontFamily: 'Helvetica-Bold' }}>
              WATER TANK
            </Text>
            <Text x={280} y={48} textAnchor="middle" fill="#1B3D34" style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold' }}>
              STAIR HEADROOM (+7.5 FT)
            </Text>

            {/* ── Left Elevation Datum Spine (x = 75) ── */}
            <Line x1={75} y1={230} x2={75} y2={24} stroke="#1B3D34" strokeWidth={1.2} />
            {/* Level tick markers & labels */}
            {[
              { y: 230, lbl: '± 0.00 FT', desc: 'Road Level Datum' },
              { y: 212, lbl: '+ 2.50 FT', desc: 'Plinth Beam Top' },
              { y: 141, lbl: '+ 12.50 FT', desc: 'Ground Floor Slab' },
              { y: 70, lbl: '+ 22.50 FT', desc: 'First Floor Slab' },
              { y: 52, lbl: '+ 25.50 FT', desc: 'Terrace Parapet' },
              { y: 24, lbl: '+ 30.00 FT', desc: 'Stair Headroom Top' },
            ].map((lm, i) => (
              <G key={i}>
                <Line x1={67} y1={lm.y} x2={83} y2={lm.y} stroke="#1B3D34" strokeWidth={0.9} />
                <Text x={65} y={lm.y + 2.5} textAnchor="end" fill="#1B3D34" style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>
                  {lm.lbl}
                </Text>
                <Text x={85} y={lm.y + 2.5} fill="#6B7280" style={{ fontSize: 5.4 }}>
                  {lm.desc}
                </Text>
              </G>
            ))}

            {/* ── Prominent Total Height Callout Badge on Right (x = 390) ── */}
            <Rect x={390} y={48} width={118} height={96} fill="#1B3D34" stroke="#2A5C4E" strokeWidth={1} rx={3} />
            <Text x={449} y={62} textAnchor="middle" fill="#FDBA74" style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.8 }}>
              TOTAL BUILDING HEIGHT
            </Text>
            <Text x={449} y={81} textAnchor="middle" fill="#FFFFFF" style={{ fontSize: 18, fontFamily: 'Helvetica-Bold' }}>
              {`${heightDetails.totalProposedHeightFt.toFixed(1)} FT`}
            </Text>
            <Text x={449} y={94} textAnchor="middle" fill="#FDBA74" style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold' }}>
              {`${heightDetails.totalProposedHeightM.toFixed(2)} METERS OVERALL`}
            </Text>
            <Line x1={400} y1={101} x2={498} y2={101} stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />
            <Text x={449} y={112} textAnchor="middle" fill="#CBD5E1" style={{ fontSize: 6 }}>
              {`Statutory Ceiling: ${heightDetails.maxPermittedHeightFt.toFixed(1)} FT`}
            </Text>
            <Text x={449} y={125} textAnchor="middle" fill={heightDetails.isCompliant ? '#86EFAC' : '#FCA5A5'} style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
              {heightDetails.statusBadge}
            </Text>
          </Svg>
        </View>

        {/* Vertical Stacking & Level Schedule Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: '22%' }]}>Building Level</Text>
            <Text style={[styles.th, { width: '20%' }]}>Finished Level</Text>
            <Text style={[styles.th, { width: '16%' }]}>Floor Height</Text>
            <Text style={[styles.th, { width: '26%' }]}>Clear Headroom &amp; Purpose</Text>
            <Text style={[styles.th, styles.tdRight, { width: '16%' }]}>Bylaw Status</Text>
          </View>
          {[
            ['Road Crown Datum', '± 0.00 FT (0.00m)', '—', 'Permanent street datum reference', 'Datum Reference'],
            ['Finished Plinth Top', '+ 2.50 FT (0.76m)', '2.5 FT', 'Rainwater runoff defense & plinth beam', 'Mandatory Buffer'],
            ['Ground Floor Slab', '+ 12.50 FT (3.81m)', '10.0 FT', '9.0 ft clear living headroom (NBC min 2.75m)', 'Compliant'],
            ['First Floor Slab', '+ 22.50 FT (6.86m)', '10.0 FT', '9.0 ft clear living headroom (NBC min 2.75m)', 'Compliant'],
            ['Terrace & Parapet', '+ 25.50 FT (7.77m)', '3.0 FT', 'Safety parapet wall (exceeds 1.0m safety rule)', 'Permitted'],
            ['Staircase Headroom', '+ 30.00 FT (9.14m)', '7.5 FT', 'Weather enclosure & water tank tower', 'Permitted Feature'],
            ['TOTAL STRUCTURE HEIGHT', `${heightDetails.totalProposedHeightFt.toFixed(2)} FT (${heightDetails.totalProposedHeightM.toFixed(2)}m)`, '—', `Statutory ceiling: ${heightDetails.maxPermittedHeightFt.toFixed(2)} FT (${heightDetails.maxPermittedHeightM.toFixed(2)}m)`, heightDetails.isCompliant ? 'STRICTLY COMPLIANT' : 'NON-COMPLIANT'],
          ].map(([lvl, fin, flHt, purp, stat], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}, idx === 6 ? { backgroundColor: '#F0F5F3' } : {}]}>
              <Text style={[styles.tdBold, { width: '22%', color: idx === 6 ? C.forest : C.charcoal }]}>{lvl}</Text>
              <Text style={[styles.tdBold, { width: '20%', color: idx === 6 ? C.terracotta : C.charcoal }]}>{fin}</Text>
              <Text style={[styles.td, { width: '16%' }]}>{flHt}</Text>
              <Text style={[styles.tdMuted, { width: '26%' }]}>{purp}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '16%', color: C.forestLt }]}>{stat}</Text>
            </View>
          ))}
        </View>

        {/* Small Building Height Assumption Note */}
        <View style={styles.infoBox}>
          <Text style={styles.boxTitle}>Municipal Building Height Framework &amp; Safety Notice</Text>
          <Text style={styles.boxText}>
            {heightDetails.ruleTitle}: {heightDetails.ruleDescription} {heightDetails.roadWidthConditionNote ? `${heightDetails.roadWidthConditionNote}. ` : ''}Building height is measured from the permanent center crown of the abutting public road to the top of the roof slab / stair headroom. Any residential structure proposed above 15m (49.21 ft) triggers mandatory high-rise categorization and requires Fire and Emergency Services Department statutory clearance.
          </Text>
        </View>

        <DocFooter section="Section 03: Building Height &amp; Vertical Stacking" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 4 — SECTION 04: CONFIGURATION & SECTION 05: COST OVERVIEW
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 04 &amp; 05: Configuration &amp; Cost Overview" />

        {/* Section 04 */}
        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 04 — Home Configuration &amp; Area Schedule</Text>
          <Text style={styles.sectionBannerSub}>Spatial Breakdown &amp; Area Definitions</Text>
        </View>

        {/* Area Definitions Box */}
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 5 }}>
          {[
            ['Plot Area', `${num(plotArea)} sq.ft`, 'Total surveyed land boundary.'],
            ['Buildable Footprint', `${num(buildableFootprint)} sq.ft`, 'Ground building envelope within setbacks.'],
            ['Built-Up Area (BUA)', `${num(totalBUA)} sq.ft`, 'Total covered area across all floors.'],
            ['Carpet Usable Area', `${num(Math.round(totalBUA * 0.76))} sq.ft`, 'Net usable interior floor space.'],
          ].map(([title, val, sub], idx) => (
            <View key={idx} style={[styles.kpiCard, { flex: 1 }]}>
              <Text style={styles.kpiLabel}>{title}</Text>
              <Text style={[styles.kpiValue, { fontSize: 8 }]}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Floor-by-Floor Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '22%' }]}>Floor Level</Text>
            <Text style={[styles.th, { width: '48%' }]}>Allocated Program &amp; Spaces</Text>
            <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Gross BUA</Text>
            <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Est. Carpet</Text>
          </View>
          {[
            ['Ground Floor', `Living, Kitchen, Dining, 1 Guest Bed, 1 Bath, Car Parking (${input?.carCount || 1} Car, ${input?.bikeCount || 2} Bikes)`, `${num(area?.buaPerFloorSqFt || Math.round(totalBUA / 2))} sq.ft`, `${num(Math.round((area?.buaPerFloorSqFt || Math.round(totalBUA / 2)) * 0.76))} sq.ft`],
            ['First Floor', `Master Bedroom with attached bath, 1 Child Bedroom, 1 Family Lounge, Balcony, Pooja`, `${num(totalBUA - (area?.buaPerFloorSqFt || Math.round(totalBUA / 2)))} sq.ft`, `${num(Math.round((totalBUA - (area?.buaPerFloorSqFt || Math.round(totalBUA / 2))) * 0.76))} sq.ft`],
            ['Rooftop Terrace', `Overhead water tank tower, solar water heater provisions, stair headroom`, 'Excluded from BUA', 'Open to Sky'],
          ].map(([lvl, prog, buaCol, carpCol], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: '22%' }]}>{lvl}</Text>
              <Text style={[styles.tdMuted, { width: '48%' }]}>{prog}</Text>
              <Text style={[styles.td, styles.tdRight, { width: '15%' }]}>{buaCol}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '15%' }]}>{carpCol}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Total Residential Built-Up Area (Gross BUA)</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>{num(totalBUA)} sq.ft</Text>
          </View>
        </View>

        {/* Section 05 */}
        <View style={[styles.sectionBanner, { marginTop: 4 }]}>
          <Text style={styles.sectionBannerText}>Section 05 — Construction Cost Overview &amp; Distribution</Text>
          <Text style={styles.sectionBannerSub}>Financial Model &amp; Commercial Allocation</Text>
        </View>

        {/* 4 Financial Metric Cards with Realistic Range */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCardAlt}>
            <Text style={[styles.kpiLabel, { color: C.terracotta }]}>Total Estimated Budget</Text>
            <Text style={[styles.kpiValue, { fontSize: 10, color: C.forest }]}>{fmt(totalCost)}</Text>
            <Text style={styles.kpiSub}>All-Inclusive Complete Build</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Effective All-In Rate</Text>
            <Text style={styles.kpiValue}>₹{num(budget?.costPerSqFt)} / sq.ft</Text>
            <Text style={styles.kpiSub}>Gross Built-Up Area basis</Text>
          </View>
          <View style={styles.kpiCardAlt}>
            <Text style={[styles.kpiLabel, { color: C.terracotta }]}>Realistic Cost Range (±4%)</Text>
            <Text style={[styles.kpiValue, { fontSize: 8.5 }]}>{fmt(minCostRange)} – {fmt(maxCostRange)}</Text>
            <Text style={styles.kpiSub}>Standard construction tolerance</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Direct Construction</Text>
            <Text style={styles.kpiValue}>{fmt(budget?.directConstructionBudget)}</Text>
            <Text style={styles.kpiSub}>₹{num(budget?.directCostPerSqFt)}/sq.ft (Materials + Labour)</Text>
          </View>
        </View>

        {/* Commercial Cost Distribution Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W_COMM.name }]}>Commercial Cost Head</Text>
            <Text style={[styles.th, { width: W_COMM.desc }]}>Scope Description</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_COMM.amt }]}>Amount (INR)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_COMM.pct }]}>% of Total</Text>
          </View>
          {[
            ['1. Direct Physical Materials', 'Rebar steel, cement, sand, aggregates, blocks, tiles & paint', budget?.directMaterialCost || 0, ((budget?.directMaterialCost || 0) / totalCost) * 100],
            ['2. Direct Trade Labour', 'Civil RCC framing, masonry, bar-bending, plastering, tiling labour', budget?.directLabourCost || 0, ((budget?.directLabourCost || 0) / totalCost) * 100],
            ['3. Installed Fixtures & Systems', 'Doors, windows, modular electrical hardware, sanitaryware & piping', budget?.directFixtureCost || 0, ((budget?.directFixtureCost || 0) / totalCost) * 100],
            ['4. Contractor Execution Margin', 'Contractor operational overhead, tooling, scaffolding & supervision', budget?.contractorMargin || 0, ((budget?.contractorMargin || 0) / totalCost) * 100],
            ['5. Contingency Allowance', 'Buffer for unforeseen market rate shifts and site variances (3%)', budget?.contingency || 0, ((budget?.contingency || 0) / totalCost) * 100],
            ['6. Professional Engineering Fees', 'Architectural working drawings, structural vetting & MEP design (3%)', budget?.professionalFees || 0, ((budget?.professionalFees || 0) / totalCost) * 100],
            ['7. Statutory Taxes (GST)', '18% GST applied on contractor services and execution margin', budget?.gstAmount || 0, ((budget?.gstAmount || 0) / totalCost) * 100],
          ].map(([headName, scopeDesc, amt, pct], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: W_COMM.name }]}>{headName as string}</Text>
              <Text style={[styles.tdMuted, { width: W_COMM.desc }]}>{scopeDesc as string}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W_COMM.amt }]}>{fmt(amt as number)}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_COMM.pct }]}>{(pct as number).toFixed(1)}%</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '72%' }]}>Total Estimated Project Cost (Turnkey All-Inclusive)</Text>
            <Text style={[styles.totalValue, { width: '16%' }]}>{fmt(totalCost)}</Text>
            <Text style={[styles.totalValue, { width: '12%' }]}>100.0%</Text>
          </View>
        </View>

        {/* Cost Disclaimer */}
        <View style={styles.warningBox} wrap={false}>
          <Text style={[styles.boxTitle, { color: C.terracotta }]}>Budget Allocation &amp; Market Rate Basis</Text>
          <Text style={styles.boxText}>
            All financial heads reflect prevailing Q1 2026 Bangalore market baseline rates. Material procurement efficiency, custom architectural modifications, and contractor negotiations can vary the final execution sum within the indicated ±4% planning bandwidth.
          </Text>
        </View>

        <DocFooter section="Section 04 &amp; 05: Configuration &amp; Cost Overview" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 5 — SECTION 06: DETAILED WORKS BOQ (PART 1)
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 06: Detailed Works Bill of Quantities (BOQ)" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 06 — Detailed Works Bill of Quantities (BOQ)</Text>
          <Text style={styles.sectionBannerSub}>Part 1: Substructure, Superstructure &amp; Masonry</Text>
        </View>

        <Text style={styles.subSectionTitle}>Division A &amp; B — Pre-Construction, Excavation &amp; Substructure Works</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W_BOQ.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W_BOQ.desc }]}>Trade Activity &amp; Engineering Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.amt }]}>Amount (₹)</Text>
          </View>
          {divSubstructure.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: W_BOQ.sl }]}>{item.slNo}</Text>
              <View style={{ width: W_BOQ.desc }}>
                <Text style={styles.tdBold}>{item.description}</Text>
                {item.remarks ? <Text style={[styles.tdMuted, { fontSize: 5.2 }]}>{item.remarks}</Text> : null}
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.qty }]}>
                {num(item.quantity)} {formatUnitLabel(item.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.rate }]}>
                ₹{item.unitRate?.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W_BOQ.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, { backgroundColor: C.bgSage }]}>
            <Text style={[styles.tdBold, { width: '70%', color: C.forest }]}>Subtotal — Division A &amp; B Substructure</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '30%', color: C.forest }]}>
              {fmt(divSubstructure.reduce((s, i) => s + (i.amount || 0), 0))}
            </Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Division C — Superstructure RCC Concrete &amp; Rebar Framing</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W_BOQ.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W_BOQ.desc }]}>Trade Activity &amp; Engineering Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.amt }]}>Amount (₹)</Text>
          </View>
          {divSuperstructure.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: W_BOQ.sl }]}>{item.slNo}</Text>
              <View style={{ width: W_BOQ.desc }}>
                <Text style={styles.tdBold}>{item.description}</Text>
                {item.remarks ? <Text style={[styles.tdMuted, { fontSize: 5.2 }]}>{item.remarks}</Text> : null}
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.qty }]}>
                {num(item.quantity)} {formatUnitLabel(item.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.rate }]}>
                ₹{item.unitRate?.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W_BOQ.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, { backgroundColor: C.bgSage }]}>
            <Text style={[styles.tdBold, { width: '70%', color: C.forest }]}>Subtotal — Division C RCC Superstructure</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '30%', color: C.forest }]}>
              {fmt(divSuperstructure.reduce((s, i) => s + (i.amount || 0), 0))}
            </Text>
          </View>
        </View>

        <DocFooter section="Section 06: Detailed Works BOQ (Part 1)" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 5 — SECTION 06: DETAILED WORKS BOQ (PART 2)
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 06: Detailed Works Bill of Quantities (BOQ)" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 06 — Detailed Works Bill of Quantities (BOQ)</Text>
          <Text style={styles.sectionBannerSub}>Part 2: Masonry, Finishes, Openings &amp; MEP</Text>
        </View>

        <Text style={styles.subSectionTitle}>Division D &amp; E — Masonry Walls, Plastering &amp; Waterproofing</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W_BOQ.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W_BOQ.desc }]}>Trade Activity &amp; Engineering Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.amt }]}>Amount (₹)</Text>
          </View>
          {divMasonryPlaster.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: W_BOQ.sl }]}>{item.slNo}</Text>
              <View style={{ width: W_BOQ.desc }}>
                <Text style={styles.tdBold}>{item.description}</Text>
                {item.remarks ? <Text style={[styles.tdMuted, { fontSize: 5.2 }]}>{item.remarks}</Text> : null}
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.qty }]}>
                {num(item.quantity)} {formatUnitLabel(item.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.rate }]}>
                ₹{item.unitRate?.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W_BOQ.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, { backgroundColor: C.bgSage }]}>
            <Text style={[styles.tdBold, { width: '70%', color: C.forest }]}>Subtotal — Division D &amp; E Masonry &amp; Plaster</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '30%', color: C.forest }]}>
              {fmt(divMasonryPlaster.reduce((s, i) => s + (i.amount || 0), 0))}
            </Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Division F, G &amp; H — Architectural Finishes &amp; MEP Infrastructure</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W_BOQ.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W_BOQ.desc }]}>Trade Activity &amp; Engineering Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W_BOQ.amt }]}>Amount (₹)</Text>
          </View>
          {[...divFinishes, ...divMEP].map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: W_BOQ.sl }]}>{item.slNo}</Text>
              <View style={{ width: W_BOQ.desc }}>
                <Text style={styles.tdBold}>{item.description}</Text>
                {item.remarks ? <Text style={[styles.tdMuted, { fontSize: 5.2 }]}>{item.remarks}</Text> : null}
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.qty }]}>
                {num(item.quantity)} {formatUnitLabel(item.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W_BOQ.rate }]}>
                ₹{item.unitRate?.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W_BOQ.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section 06 Grand Total — Complete Works BOQ</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>{fmt(budget?.baseConstructionCost)}</Text>
          </View>
        </View>

        <DocFooter section="Section 06: Detailed Works BOQ (Part 2)" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 6 — SECTION 07: PHYSICAL MATERIAL TAKEOFF
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 07: Physical Material Takeoff Schedule" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 07 — Physical Material Takeoff Schedule (Consumables)</Text>
          <Text style={styles.sectionBannerSub}>Quantities What We Consume</Text>
        </View>

        {/* Core Material KPI Cards */}
        <View style={styles.kpiRow}>
          {[
            ['Structural TMT Steel', `${quantities?.steelTonnes || 0} Tonnes`, `${num(quantities?.steelKg)} kg (${input?.materialBrands?.steel || 'Tata Tiscon'})`],
            ['Portland Cement', `${num(quantities?.cementBags)} Bags`, `50 kg Bags (${input?.materialBrands?.cement || 'UltraTech OPC 53'})`],
            [
              'Sand & Aggregates',
              `${num((quantities?.mSandCuFt || 0) + (quantities?.pSandCuFt || 0) + (quantities?.coarseAggregateCuFt || 0))} CFT`,
              'M-Sand + P-Sand + 20mm Metal',
            ],
            [
              'Masonry Wall Units',
              `${num(quantities?.masonryUnitsCount)} Pieces`,
              `${num(quantities?.blockWallCoverageSqFt || quantities?.netWallAreaSqFt)} sq.ft wall face`,
            ],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Itemized Material Schedule Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '6%' }]}>Sl</Text>
            <Text style={[styles.th, { width: '48%' }]}>Material &amp; Specification Brand</Text>
            <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Physical Qty</Text>
            <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Unit Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: '16%' }]}>Total Cost (₹)</Text>
          </View>
          {(materialSchedule || []).map((mat, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: '6%' }]}>{mat.slNo}</Text>
              <View style={{ width: '48%' }}>
                <Text style={styles.tdBold}>{mat.material}</Text>
                <Text style={[styles.tdMuted, { fontSize: 5.5 }]}>
                  {mat.brand} · {mat.specification}
                </Text>
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '15%' }]}>
                {num(mat.quantity)} {formatUnitLabel(mat.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '15%' }]}>
                ₹{mat.unitRate?.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '16%' }]}>{fmt(mat.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section 07 Total — Direct Physical Consumables</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>
              {fmt((materialSchedule || []).reduce((s, m) => s + (m.amount || 0), 0))}
            </Text>
          </View>
        </View>

        {/* Material Invariance Principle Box */}
        <View style={styles.infoBox} wrap={false}>
          <Text style={styles.boxTitle}>Physical Consumption &amp; Brand Invariance Principle</Text>
          <Text style={styles.boxText}>
            Physical material quantities (steel tonnage, cement bags, masonry block counts, sand CFT) are calculated directly from architectural dimensions, structural loads, and floor areas. Selecting alternative brands (e.g. Tata Tiscon vs JSW Steel, or UltraTech vs ACC Cement) adjusts the unit rate and commercial budget while physical quantities remain strictly invariant.
          </Text>
        </View>

        <DocFooter section="Section 07: Physical Material Takeoff" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 7 — SECTION 08: SPECIFICATIONS & SECTION 09: FINISHES/FIXTURES
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 08 &amp; 09: Specifications &amp; Installed Fixtures" />

        {/* Section 08 */}
        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 08 — Structural &amp; Material Specifications</Text>
          <Text style={styles.sectionBannerSub}>Selected Standards &amp; Engineering Grades</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '30%' }]}>Component / Category</Text>
            <Text style={[styles.th, { width: '40%' }]}>Material Specification &amp; Engineering Grade</Text>
            <Text style={[styles.th, styles.tdRight, { width: '30%' }]}>Benchmark Standard</Text>
          </View>
          {[
            ['Structural Steel Rebar', `High-Yield TMT Fe 550D (${input?.materialBrands?.steel || 'Tata Tiscon'})`, 'IS 1786 (Seismic Resistant)'],
            ['Portland Cement', `53-Grade Ordinary Portland Cement (${input?.materialBrands?.cement || 'UltraTech'})`, 'IS 269 / IS 12269'],
            ['Ready-Mix Concrete', 'M25 Columns/Slabs (28-day 25 N/mm²), M20 Footings', 'IS 456:2000 Code of Practice'],
            ['Masonry Wall Blocks', 'Solid Concrete Blocks 6" External / 4" Internal', 'IS 2185 (Part 1) Heavy Duty'],
            ['Fine Aggregate (Sand)', 'Manufactured Sand (M-Sand) Zone II for RCC, P-Sand for Plaster', 'IS 383:2016 Silt Free'],
            ['Anti-Termite Treatment', 'Chlorpyrifos chemical soil barrier along foundation trenches', 'IS 6313 (Part 2)'],
          ].map(([comp, spec, std], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: '30%' }]}>{comp}</Text>
              <Text style={[styles.td, { width: '40%' }]}>{spec}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '30%' }]}>{std}</Text>
            </View>
          ))}
        </View>

        {/* Section 09 */}
        <View style={[styles.sectionBanner, { marginTop: 4 }]}>
          <Text style={styles.sectionBannerText}>Section 09 — Finishes &amp; Installed Fixtures Schedule</Text>
          <Text style={styles.sectionBannerSub}>What We Install</Text>
        </View>

        {/* Installed Systems Overview */}
        <View style={styles.kpiRow}>
          {[
            ['Electrical Points', `${quantities?.totalElectricalPoints || 90} Points`, `${quantities?.lightingPoints || 36} lights · ${quantities?.socketPoints || 35} sockets`],
            ['Plumbing Outlets', `${(quantities?.totalWaterPoints || 15) + (quantities?.totalDrainagePoints || 9)} Points`, `${quantities?.totalWaterPoints || 15} supply · ${quantities?.totalDrainagePoints || 9} drain`],
            ['Sanitary Suites', `${quantities?.bathroomFixtureSets || 3} Suites`, `${quantities?.wcCount || 3} EWCs · ${quantities?.washBasinCount || 3} Basins`],
            ['Doors & Windows', `${(quantities?.totalDoorsCount || 10) + (quantities?.windowsCount || 11)} Units`, `${quantities?.totalDoorsCount || 10} doors · ${quantities?.windowsCount || 11} windows`],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Compact Fixtures Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '8%' }]}>Sl</Text>
            <Text style={[styles.th, { width: '46%' }]}>System / Installed Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Unit Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: '16%' }]}>Amount (₹)</Text>
          </View>
          {allFixtures.slice(0, 10).map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: '8%' }]}>{item.slNo}</Text>
              <View style={{ width: '46%' }}>
                <Text style={styles.tdBold}>{item.item}</Text>
                <Text style={[styles.tdMuted, { fontSize: 5.2 }]}>{item.brand} · {item.specification}</Text>
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '15%' }]}>
                {num(item.quantity)} {formatUnitLabel(item.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '15%' }]}>
                ₹{item.unitRate?.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '16%' }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section 09 Total — Installed Fixtures &amp; Systems</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>
              {fmt(allFixtures.reduce((s, f) => s + (f.amount || 0), 0))}
            </Text>
          </View>
        </View>

        {/* Fixtures Note */}
        <View style={styles.infoBox} wrap={false}>
          <Text style={styles.boxTitle}>MEP &amp; Fixture Engineering Note</Text>
          <Text style={styles.boxText}>
            Conduit gauges, copper wire circuit runs, and water supply pipe sizing reflect standard Indian architectural benchmarks. Final electrical load sanctions (BESCOM) and plumbing invert levels should be validated by appointed consultants before wall chasses closure.
          </Text>
        </View>

        <DocFooter section="Section 08 &amp; 09: Specifications &amp; Installed Fixtures" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 8 — SECTION 10: SCOPE, INCLUSIONS & EXCLUSIONS
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 10: Scope Boundaries, Inclusions &amp; Exclusions" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 10 — Scope Boundaries: Inclusions &amp; Exclusions</Text>
          <Text style={styles.sectionBannerSub}>Transparent Scope Demarcation for Contractor Review</Text>
        </View>

        {/* 2-Column Side-by-Side Checklist */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
          {/* Column 1: Inclusions */}
          <View style={{ flex: 1, backgroundColor: C.bgSage, borderWidth: 0.8, borderColor: C.sageBorder, borderRadius: 3, padding: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5, borderBottomWidth: 0.8, borderBottomColor: C.forest, paddingBottom: 3 }}>
              <Text style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold', color: C.forest, textTransform: 'uppercase' }}>
                [✓] Included In This Estimate
              </Text>
            </View>
            {[
              'Complete site clearing, land demarcation & foundation excavation',
              'Substructure PCC bed, isolated footings & reinforced plinth beam framing',
              'Superstructure RCC framed columns, beams, staircase & floor slabs',
              'Full external (150mm) and internal (100mm) solid masonry block walls',
              'Internal smooth sponge plastering (1:4) & external double-coat sand plaster',
              'Waterproofing: sunken bathroom slabs, water sump & top terrace slab',
              'Vitrified tile supply & laying across all living, dining, bed & kitchen areas',
              'Anti-skid ceramic tiles in bathrooms/balconies with wall dado up to 7ft',
              'Teakwood main entrance door with brass lock; internal flush & WPC bath doors',
              '2.5-track uPVC sliding windows with mosquito mesh and louvred ventilators',
              'Concealed heavy-duty PVC conduits, FRLS copper wiring & modular switches',
              'Concealed CPVC hot/cold water supply lines, SWR drainage & sanitary suites',
              'Full 2-coat interior wall putty, acrylic primer & luxury emulsion painting',
              'Site engineer supervision, scaffolding, curing water storage & safety gear',
            ].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 3.5, marginBottom: 3 }}>
                <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.forest }}>✓</Text>
                <Text style={{ fontSize: 5.8, color: C.charcoal, flex: 1, lineHeight: 1.25 }}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Column 2: Exclusions */}
          <View style={{ flex: 1, backgroundColor: '#FAF5F0', borderWidth: 0.8, borderColor: '#FED7AA', borderRadius: 3, padding: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5, borderBottomWidth: 0.8, borderBottomColor: C.terracotta, paddingBottom: 3 }}>
              <Text style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold', color: C.terracotta, textTransform: 'uppercase' }}>
                [✕] Excluded / Separate Budget Required
              </Text>
            </View>
            {[
              'Compound boundary wall and main gate beyond front column allowance',
              'Municipal building plan sanction fees, betterment charges & trade licenses',
              'BESCOM 3-phase permanent power meter deposit & external pole cable draw',
              'BWSSB permanent water meter deposit & underground sewer line connection',
              'Deep borewell drilling, casing pipe, submersible pump & yield testing',
              'Interior woodwork: modular kitchen cabinets, chimney, hob & wardrobes',
              'Loose furniture, curtains, decorative light fittings (fans/chandeliers) & ACs',
              'Solar rooftop photovoltaic (PV) power system and battery inverter',
              'Solar water heater rooftop installation and piping to bathrooms',
              'Garden landscaping, lawn preparation, compound exterior paver tiles',
              'Elevator / lift machine supply and commissioning (unless specifically checked)',
              'Structural changes after column casting or foundation excavation',
            ].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 3.5, marginBottom: 3 }}>
                <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.terracotta }}>✕</Text>
                <Text style={{ fontSize: 5.8, color: C.charcoal, flex: 1, lineHeight: 1.25 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Site Conditions & Assumptions Box */}
        <View style={styles.infoBox} wrap={false}>
          <Text style={styles.boxTitle}>Standard Site Conditions &amp; Geotechnical Assumptions</Text>
          <Text style={styles.boxText}>
            1. Site Soil Strata: Assumed uniform firm gravelly soil with safe bearing capacity (SBC) ≥ 180 kN/m² at 1.5m foundation depth. Black cotton, waterlogged, or rock strata require separate structural engineering design.{'\n'}
            2. Site Utilities: Assumes motorable road access and availability of potable construction curing water and temporary 3-phase electricity at the site boundary.{'\n'}
            3. Ground Slope: Assumes a level plot with no major slope cutting or retaining wall requirements.
          </Text>
        </View>

        <DocFooter section="Section 10: Scope Boundaries, Inclusions &amp; Exclusions" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 9 — SECTION 11: TIMELINE & SECTION 12: MILESTONE PAYMENT PLANNING
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section 11 &amp; 12: Timeline &amp; Milestone Payment Plan" />

        {/* Section 11 */}
        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Section 11 — Indicative Construction Timeline ({timeline?.totalMonths || 8} Months)</Text>
          <Text style={styles.sectionBannerSub}>Engineering Execution Roadmap</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '15%' }]}>Phase</Text>
            <Text style={[styles.th, { width: '45%' }]}>Key Construction Works &amp; Milestones</Text>
            <Text style={[styles.th, { width: '20%' }]}>Window</Text>
            <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Status</Text>
          </View>
          {[
            ['Phase 1', 'Site setup, excavation, PCC bed & foundation footings', 'Weeks 1 – 6', 'Sequential'],
            ['Phase 2', 'Plinth beam casting, backfilling & ground floor columns', 'Weeks 7 – 12', 'Sequential'],
            ['Phase 3', 'Ground floor slab pour & first floor structural framing', 'Weeks 13 – 18', 'Sequential'],
            ['Phase 4', 'Terrace slab pour, external & internal block masonry', 'Weeks 19 – 24', 'Sequential'],
            ['Phase 5', 'Concealed electrical/plumbing rough-in & plastering', 'Weeks 25 – 28', 'Overlapping'],
            ['Phase 6', 'Waterproofing, vitrified tiling, door & window joinery', 'Weeks 29 – 32', 'Overlapping'],
            ['Phase 7', 'Painting, sanitary fixture install, testing & handover', 'Weeks 33 – 36', 'Final Stage'],
          ].map(([phaseNo, desc, win, status], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: '15%' }]}>{phaseNo}</Text>
              <Text style={[styles.tdMuted, { width: '45%' }]}>{desc}</Text>
              <Text style={[styles.td, { width: '20%' }]}>{win}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '20%', color: C.forestLt }]}>{status}</Text>
            </View>
          ))}
        </View>

        {/* Section 12 */}
        <View style={[styles.sectionBanner, { marginTop: 4 }]}>
          <Text style={styles.sectionBannerText}>Section 12 — Milestone Payment Planning Schedule</Text>
          <Text style={styles.sectionBannerSub}>Physical Work Verification Triggers</Text>
        </View>

        {/* Payment Plan Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '12%' }]}>Stage</Text>
            <Text style={[styles.th, { width: '48%' }]}>Construction Milestone &amp; Physical Verification Trigger</Text>
            <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Disbursement (INR)</Text>
            <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Stage %</Text>
          </View>
          {(paymentPlan && paymentPlan.length > 0 ? paymentPlan : [
            { stage: 1, title: 'Mobilization & Soil Setup', description: 'Advance upon agreement signing and excavation start', percentage: 10, amount: Math.round(totalCost * 0.10) },
            { stage: 2, title: 'Foundation & Plinth', description: 'Upon complete footing casting and plinth beam completion', percentage: 15, amount: Math.round(totalCost * 0.15) },
            { stage: 3, title: 'Ground Floor Slab', description: 'Upon casting and curing of ground floor ceiling slab', percentage: 15, amount: Math.round(totalCost * 0.15) },
            { stage: 4, title: 'First Floor Slab / Roof', description: 'Upon casting of upper floor framing and rooftop terrace slab', percentage: 15, amount: Math.round(totalCost * 0.15) },
            { stage: 5, title: 'Masonry & Plastering', description: 'Upon full blockwork completion and internal/external plaster', percentage: 15, amount: Math.round(totalCost * 0.15) },
            { stage: 6, title: 'Flooring & Rough-In', description: 'Upon vitrified tile laying and plumbing/wiring pulled', percentage: 15, amount: Math.round(totalCost * 0.15) },
            { stage: 7, title: 'Painting & Fixtures', description: 'Upon final paint coats, sanitary fitting and switches fitted', percentage: 10, amount: Math.round(totalCost * 0.10) },
            { stage: 8, title: 'Handover & Retention', description: 'Upon snagging clearance, deep clean and key handover', percentage: 5, amount: Math.round(totalCost * 0.05) },
          ]).map((stage, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdBold, { width: '12%' }]}>Stage {stage.stage}</Text>
              <View style={{ width: '48%' }}>
                <Text style={styles.tdBold}>{stage.title}</Text>
                {stage.description ? <Text style={[styles.tdMuted, { fontSize: 5.2 }]}>{stage.description}</Text> : null}
              </View>
              <Text style={[styles.tdBold, styles.tdRight, { width: '20%' }]}>{fmt(stage.amount)}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>{stage.percentage}%</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '60%' }]}>Total Scheduled Disbursements (All Stages)</Text>
            <Text style={[styles.totalValue, { width: '20%' }]}>{fmt(totalCost)}</Text>
            <Text style={[styles.totalValue, { width: '20%' }]}>100.0%</Text>
          </View>
        </View>

        {/* Homeowner Stage Payment Protection Guideline */}
        <View style={styles.warningBox} wrap={false}>
          <Text style={[styles.boxTitle, { color: C.terracotta }]}>Crucial Homeowner Financial Protection Guideline</Text>
          <Text style={styles.boxText}>
            Never release milestone payments based purely on calendar dates or contractor advance demands. Every stage disbursement must correspond to physical inspection and verification of completed works on site. Retain the final 5% until all snagging items are cleared and occupancy is handed over.
          </Text>
        </View>

        {/* Rate Master Source Metadata */}
        <View style={styles.infoBox} wrap={false}>
          <Text style={styles.boxTitle}>Rate Master Source &amp; Engineering Governance</Text>
          <Text style={styles.boxText}>
            Dataset: {rateMeta?.datasetVersion || 'HUTTY-RM-2026.1'} · Calculation Engine: {rateMeta?.calculationEngineVersion || 'v2.6.0'} · Mode: {rateMeta?.isLive ? 'Live Connected' : 'Q1 2026 Verified Baseline'} · Geographic Jurisdiction: {city}, Karnataka · Reference: IS 456, IS 1200, NBC 2016.
          </Text>
        </View>

        <DocFooter section="Section 11 &amp; 12: Timeline &amp; Milestone Payment Plan" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 10 — ADDENDUM: CONTRACTOR QUOTE AUDIT & BENCHMARKS
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Addendum: Contractor Quote Audit, Benchmarks &amp; Scenarios" />

        <View style={styles.sectionBanner}>
          <Text style={styles.sectionBannerText}>Addendum — Contractor Quote Vetting &amp; Market Tolerances</Text>
          <Text style={styles.sectionBannerSub}>Independent Quantity Surveying Benchmarks ({city} Q1 2026)</Text>
        </View>

        {/* Market Rate Tolerance Benchmarks */}
        <Text style={styles.subSectionTitle}>1. Key Trade Market Tolerances &amp; Allowable Variances</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '38%' }]}>Material / Trade Description</Text>
            <Text style={[styles.th, { width: '18%' }]}>Standard Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: '24%' }]}>Market Benchmark</Text>
            <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Allowable Variance</Text>
          </View>
          {[
            ['Structural TMT Steel (Fe 550D)', 'Per Kg', '₹68 – ₹76', '±5% tolerance'],
            ['53-Grade Portland Cement', '50kg Bag', '₹380 – ₹420', '±4% tolerance'],
            ['Solid Concrete Blocks (6")', 'Per Block', '₹42 – ₹48', '±5% tolerance'],
            ['Civil RCC Labour (Framed Structure)', 'Per sq.ft BUA', '₹240 – ₹280', '±6% tolerance'],
            ['Tile Laying & Grouting Labour', 'Per sq.ft', '₹35 – ₹45', '±8% tolerance'],
            ['Interior Emulsion Paint (2 Coats + Putty)', 'Per sq.ft', '₹18 – ₹26', '±7% tolerance'],
          ].map(([desc, u, bmk, tol], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: '38%' }]}>{desc}</Text>
              <Text style={[styles.tdMuted, { width: '18%' }]}>{u}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '24%' }]}>{bmk}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>{tol}</Text>
            </View>
          ))}
        </View>

        {/* High-Risk Missing Scope Checklist (Contractor Redlines) */}
        <Text style={styles.subSectionTitle}>2. High-Risk Missing Scope Checklist (Contractor Redlines)</Text>
        <View style={{ marginBottom: 5 }}>
          {[
            ['Soil Bearing Capacity Test', 'Demand written geotechnical report before footing depth sign-off. Turnkey contractors frequently omit this.'],
            ['Temporary 3-Phase Power & Curing Water', 'Verify whether temporary BESCOM meter deposit, wiring, and borewell water for curing are included in the quote.'],
            ['Compound Wall & Gate Columns', 'Often charged as an extra variation cost. Ensure linear footage and foundation depth are explicitly agreed.'],
            ['Sump Waterproofing & Debris Disposal', 'Ensure 2-coat crystalline waterproofing on underground tanks and periodic carting of construction debris away from site.'],
          ].map(([head, note], idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 4, marginBottom: 2.5 }}>
              <Text style={{ fontSize: 6.2, fontFamily: 'Helvetica-Bold', color: C.terracotta }}>[!]:</Text>
              <Text style={{ fontSize: 5.8, color: C.charcoal, flex: 1, lineHeight: 1.25 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{head}: </Text>
                {note}
              </Text>
            </View>
          ))}
        </View>

        {/* Multi-Scenario Layout Comparison */}
        <Text style={styles.subSectionTitle}>3. Multi-Scenario Footprint Comparison on Plot ({plotLength}' × {plotWidth}')</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: '30%' }]}>Layout Scenario</Text>
            <Text style={[styles.th, { width: '30%' }]}>Built-Up Area (BUA)</Text>
            <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Estimated Budget</Text>
            <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Effective Rate</Text>
          </View>
          {[
            ['Scenario A: Single Floor (Compact)', `${num(area?.buaPerFloorSqFt || Math.round(totalBUA / 2))} sq.ft`, fmt((area?.buaPerFloorSqFt || Math.round(totalBUA / 2)) * (budget?.costPerSqFt || 3592)), `₹${num(budget?.costPerSqFt || 3592)}/sqft`],
            ['Scenario B: Current Plan (G+1 Duplex)', `${num(totalBUA)} sq.ft`, fmt(totalCost), `₹${num(budget?.costPerSqFt)}/sqft`],
            ['Scenario C: +1 Floor (Rental Unit)', `${num(totalBUA + Math.round(totalBUA / 2))} sq.ft`, fmt(totalCost + Math.round((totalBUA / 2) * (budget?.costPerSqFt || 3592) * 0.88)), `₹${num(Math.round((budget?.costPerSqFt || 3592) * 0.96))}/sqft`],
          ].map(([scen, buaCol, estBud, effR], idx) => (
            <View key={idx} style={[styles.tableRow, idx === 1 ? { backgroundColor: C.bgSage } : idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: '30%', color: idx === 1 ? C.forest : C.charcoal }]}>{scen}</Text>
              <Text style={[styles.tdBold, { width: '30%' }]}>{buaCol}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '20%' }]}>{estBud}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>{effR}</Text>
            </View>
          ))}
        </View>

        {/* Final Sign-off Box */}
        {isSample && (
          <View style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 0.8, padding: 6, borderRadius: 2.5, marginBottom: 6 }} wrap={false}>
            <Text style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold', color: '#92400E', marginBottom: 2 }}>
              SAMPLE REPORT NOTICE — NOT A REAL ESTIMATE
            </Text>
            <Text style={{ fontSize: 5.8, color: '#78350F', lineHeight: 1.35 }}>
              This is an illustrative sample construction report provided for demonstration purposes. It showcases the comprehensive structure, detailed works BOQ, material takeoff quantities, and payment schedules provided in Hutty's Complete Construction Planning &amp; Estimation Report. Figures in this sample are illustrative and must not be used for actual construction contracts.
            </Text>
          </View>
        )}
        <View style={styles.infoBox} wrap={false}>
          <Text style={styles.boxTitle}>Hutty Digital Quantity Surveying Assurance</Text>
          <Text style={styles.boxText}>
            Generated by Hutty Pre-Construction Technologies. This dossier is engineered to protect homeowners from contractor quotation ambiguities, unexpected budget escalation, and hidden scope exclusions. Visit https://hutty.in for live calculation updates and expert consultations.
          </Text>
        </View>

        <DocFooter section="Addendum: Contractor Quote Audit &amp; Benchmarks" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 11 — PREMIUM CONSULTATION VETTING ANNEX
      ══════════════════════════════════════════════════ */}
      {isPremium && (
        <Page size="A4" style={styles.page}>
          <RunHeader section="Premium Annex: Expert Engineering Vetting Guide" />

          <View style={styles.sectionBanner}>
            <Text style={styles.sectionBannerText}>Supplementary Annex — Expert Consultation &amp; Vetting</Text>
            <Text style={styles.sectionBannerSub}>Structural Drawing Review &amp; Contractor Contract Guardrails</Text>
          </View>

          <Text style={styles.subSectionTitle}>1. Independent Structural Vetting Protocol</Text>
          <Text style={styles.paragraph}>
            This supplementary addendum is unlocked for project dossiers designated for senior architect or structural engineer review. Before executing an agreement with your general contractor, complete the following verification steps:
          </Text>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: '25%' }]}>Checkpoint</Text>
              <Text style={[styles.th, { width: '45%' }]}>Standard Engineering Requirement</Text>
              <Text style={[styles.th, { width: '30%' }]}>Acceptable Tolerance</Text>
            </View>
            {[
              ['Soil SBC Test', 'Safe Bearing Capacity report by certified geotechnical lab', 'Minimum 150 kN/m² at 2.0m depth'],
              ['RCC Structural Drawings', 'Signed by licensed structural engineer (BBMP/Local Authority)', 'Zero deviation without written approval'],
              ['Concrete Mix Sampling', 'Cube compressive strength test at 7 and 28 days', 'M20 ≥ 20 N/mm², M25 ≥ 25 N/mm²'],
              ['Steel Rebar Heat Vetting', 'BIS certification tag and batch test certificates', 'Fe 550D / Fe 500D (IS 1786)'],
              ['Plinth Beam Elevation', 'Minimum 450mm above finished permanent road crown level', 'Strict mandatory barrier against water ingress'],
            ].map(([chk, req, tol], idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tdBold, { width: '25%' }]}>{chk}</Text>
                <Text style={[styles.td, { width: '45%' }]}>{req}</Text>
                <Text style={[styles.tdMuted, { width: '30%' }]}>{tol}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subSectionTitle}>2. Contractor Contractual Guardrails &amp; Penalty Clauses</Text>
          <View style={{ gap: 4, marginTop: 4 }}>
            {[
              'Defect Liability Period (DLP): Contractor must provide an unconditioned 12-month DLP backed by 5% retention money.',
              'Delay Liquidated Damages: Agreed penalty of 0.5% of remaining contract value per week of unexcused delay, capped at 5%.',
              'Material Substitution Ban: No brand substitutions permitted without prior written variance approval from the homeowner.',
              'Waterproofing Warranty: Minimum 10-year joint leak-free warranty certificate from chemical waterproofing specialist manufacturer.',
            ].map((clause, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 7, color: C.forest, fontFamily: 'Helvetica-Bold' }}>&bull;</Text>
                <Text style={{ fontSize: 6.6, color: C.charcoal, lineHeight: 1.35, flex: 1 }}>{clause}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.infoBox, { marginTop: 12 }]} wrap={false}>
            <Text style={styles.boxTitle}>Hutty Dedicated Expert Consultation</Text>
            <Text style={styles.boxText}>
              Homeowners preparing to sign construction contracts can book a 1-on-1 dossier vetting session with a Hutty Senior Architect or Quantity Surveyor. Visit https://hutty.in or WhatsApp Hutty Support for expedited scheduling.
            </Text>
          </View>

          <DocFooter section="Premium Annex: Structural &amp; Contractual Vetting Guide" />
        </Page>
      )}

    </Document>
  );
};
