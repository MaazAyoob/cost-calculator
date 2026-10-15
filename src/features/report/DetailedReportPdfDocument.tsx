import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CalculationResult, FixtureScheduleItem } from '../../calculation-engine/types';
import { formatUnitLabel } from '../../calculation-engine/data/units';

// ─────────────────────────────────────────────
// HUTTY QS DOSSIER — DESIGN SYSTEM
// Tight, professional, zero-waste layout
// ─────────────────────────────────────────────
const C = {
  green:    '#1B3D34',
  greenLt:  '#2A5C4E',
  amber:    '#F28C28',
  grey:     '#4B5563',
  greyLt:   '#6B7280',
  border:   '#D1D5DB',
  bgAlt:    '#F9FAFB',
  bgPage:   '#FFFFFF',
  bgCover:  '#1B3D34',
  bgAccent: '#F0F5F3',
};

const styles = StyleSheet.create({
  // ── Pages ──
  page: {
    paddingTop: 28,
    paddingBottom: 38,
    paddingHorizontal: 28,
    fontFamily: 'Helvetica',
    fontSize: 7.2,
    color: C.green,
    backgroundColor: C.bgPage,
    lineHeight: 1.25,
  },

  // ── Cover ──
  coverPage: {
    fontFamily: 'Helvetica',
    color: '#FFFFFF',
    backgroundColor: C.bgCover,
    flexDirection: 'column',
  },
  coverTop: {
    padding: 36,
    paddingBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  coverLogoText: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  coverTagline: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  coverMid: {
    padding: 36,
    paddingTop: 30,
    paddingBottom: 30,
    flex: 1,
  },
  coverDocTypeTag: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.amber,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  coverMainTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    lineHeight: 1.15,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 8.5,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.45,
    maxWidth: 420,
    marginBottom: 24,
  },
  coverKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  coverKpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 5,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  coverKpiLabel: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  coverKpiValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  coverKpiSub: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  coverMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  coverMetaCell: {
    width: '50%',
    padding: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  coverMetaLabel: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  coverMetaValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  coverBottom: {
    padding: 16,
    paddingHorizontal: 36,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverBottomText: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.35)',
  },

  // ── Running Header ──
  runningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: C.green,
  },
  runningHeaderLogo: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    letterSpacing: 1.5,
  },
  runningHeaderSection: {
    fontSize: 6.5,
    color: C.greyLt,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  runningHeaderMeta: {
    fontSize: 6,
    color: C.greyLt,
    textAlign: 'right',
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    backgroundColor: C.green,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    marginTop: 8,
    marginBottom: 0,
  },

  // ── Summary Cards ──
  kpiRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.bgAccent,
    borderRadius: 3,
    padding: 6,
    borderWidth: 0.5,
    borderColor: C.border,
    borderLeftWidth: 2.5,
    borderLeftColor: C.green,
  },
  kpiLabel: {
    fontSize: 5.5,
    color: C.greyLt,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  kpiSub: {
    fontSize: 5.5,
    color: C.greyLt,
    marginTop: 1,
  },

  // ── Tables ──
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.green,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  tableRowAlt: { backgroundColor: C.bgAlt },
  th: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  td: { fontSize: 6.5, color: C.green },
  tdMuted: { fontSize: 6, color: C.grey },
  tdBold: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green },
  tdRight: { textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: C.green,
    paddingVertical: 3.5,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.amber,
    textAlign: 'right',
  },

  // ── Boxes ──
  noticeBox: {
    backgroundColor: C.bgAccent,
    padding: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.green,
    borderLeftWidth: 2.5,
    borderLeftColor: C.amber,
    marginTop: 6,
  },
  disclaimerBox: {
    backgroundColor: C.bgAlt,
    padding: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.border,
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 4,
    fontSize: 5.8,
    color: C.greyLt,
  },
});

export interface DetailedReportPdfProps {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
  isPremium?: boolean;
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
}) => {
  const { input, report, area, budget, boq, materialSchedule, fixtureSchedule, timeline, paymentPlan, quantities } = data;
  const rateMeta = data.rateSourceMetadata || report?.rateSourceMetadata;

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const refId = report?.projectId || 'HUTTY-2026';

  // Column widths
  const W = { sl: '6%', desc: '48%', qty: '15%', rate: '14%', amt: '17%' };
  const WD = { cat: '52%', amt: '28%', pct: '20%' };

  const RunHeader = ({ section }: { section: string }) => (
    <View style={styles.runningHeader} fixed>
      <View>
        <Text style={styles.runningHeaderLogo}>HUTTY</Text>
        <Text style={styles.runningHeaderSection}>{section}</Text>
      </View>
      <View>
        <Text style={styles.runningHeaderMeta}>Ref: {refId}</Text>
        <Text style={styles.runningHeaderMeta}>Date: {dateStr}</Text>
        <Text style={styles.runningHeaderMeta}>Prepared for: {preparedFor}</Text>
      </View>
    </View>
  );

  const DocFooter = ({ section }: { section: string }) => (
    <View style={styles.footer} fixed>
      <Text>Hutty QS Dossier &bull; Ref: {refId} &bull; {section}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );

  // Categorize Section C: Services & Installations consistently
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
  const otherInstallations = allFixtures.filter(
    (f) => f.category === 'Special Equipment'
  );

  const renderInstallationSubSection = (title: string, items: FixtureScheduleItem[]) => {
    if (!items || items.length === 0) return null;
    const subTotal = items.reduce((s, i) => s + (i.amount || 0), 0);
    return (
      <View style={{ marginBottom: 5 }} wrap={false}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: C.bgAlt,
            paddingVertical: 2,
            paddingHorizontal: 5,
            borderLeftWidth: 2,
            borderLeftColor: C.amber,
            marginBottom: 1,
          }}
        >
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green, textTransform: 'uppercase' }}>
            {title}
          </Text>
          <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.greenLt }}>
            Subtotal: {fmt(subTotal)}
          </Text>
        </View>
        <View style={styles.tableHeaderRow} fixed>
          <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
          <Text style={[styles.th, { width: W.desc }]}>Item / Specification</Text>
          <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Qty / Unit</Text>
          <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Rate (₹)</Text>
          <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
            <Text style={[styles.tdMuted, { width: W.sl }]}>{item.slNo}</Text>
            <View style={{ width: W.desc }}>
              <Text style={styles.td}>{item.item}</Text>
              <Text style={[styles.tdMuted, { fontSize: 5.5 }]}>
                {item.brand} · {item.specification}
                {item.location ? ` (${item.location})` : ''}
              </Text>
            </View>
            <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>
              {num(item.quantity)} {formatUnitLabel(item.unit)}
            </Text>
            <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>
              ₹{item.unitRate?.toLocaleString()}
            </Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(item.amount)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Document title={`Hutty-QS-Dossier-${refId}`} author="Hutty Construction Technologies">

      {/* ══════════════════════════════════════════════════
          PAGE 1 — COVER
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.coverPage}>
        {/* Top brand bar */}
        <View style={styles.coverTop}>
          <Text style={styles.coverLogoText}>HUTTY</Text>
          <Text style={styles.coverTagline}>Residential Digital Quantity Surveying Platform</Text>
        </View>

        {/* Mid — title + KPIs + meta */}
        <View style={styles.coverMid}>
          <Text style={styles.coverDocTypeTag}>Construction Estimate &amp; BOQ Dossier</Text>
          <Text style={styles.coverMainTitle}>
            {input?.houseType || 'Residential Home'}{'\n'}{num(area?.totalBUASqFt)} sq.ft Built-Up Area
          </Text>
          <Text style={styles.coverSubtitle}>
            Authoritative pre-construction digital QS dossier for {input?.city || 'Bangalore'}.{'\n'}
            Includes Works BOQ (Section A), Materials Needed (Section B), Services &amp; Fixtures Schedule (Section C), and Cost Summary &amp; Payment Plan (Section D).
          </Text>

          {/* KPI row: Core Direct Construction Budget */}
          <View style={styles.coverKpiRow}>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Direct Construction Budget</Text>
              <Text style={styles.coverKpiValue}>{fmt(budget?.directConstructionBudget || budget?.totalProjectCost)}</Text>
              <Text style={styles.coverKpiSub}>Core Direct Execution (Zero Margin/GST)</Text>
            </View>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Direct Rate</Text>
              <Text style={styles.coverKpiValue}>₹{num(budget?.directCostPerSqFt || budget?.costPerSqFt)} / sq.ft</Text>
              <Text style={styles.coverKpiSub}>{specificationTier.toUpperCase()} specification tier</Text>
            </View>
            <View style={styles.coverKpi}>
              <Text style={styles.coverKpiLabel}>Est. Timeline</Text>
              <Text style={styles.coverKpiValue}>{timeline?.totalMonths || 8} Months</Text>
              <Text style={styles.coverKpiSub}>{input?.floors || 1} floor(s) · {input?.houseType || 'Duplex'}</Text>
            </View>
          </View>

          {/* Sub-KPI Row: Materials, Fixtures, Labour */}
          <View style={[styles.coverKpiRow, { marginTop: -12, marginBottom: 18 }]}>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>Section B · Materials</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 10.5 }]}>{fmt(budget?.directMaterialCost)}</Text>
              <Text style={styles.coverKpiSub}>What We Consume</Text>
            </View>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>Section C · Fixtures &amp; Services</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 10.5 }]}>{fmt(budget?.directFixtureCost)}</Text>
              <Text style={styles.coverKpiSub}>What We Install</Text>
            </View>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>Execution Labour</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 10.5 }]}>{fmt(budget?.directLabourCost)}</Text>
              <Text style={styles.coverKpiSub}>Civil &amp; Finishing Trades</Text>
            </View>
          </View>

          {/* Meta grid */}
          <View style={styles.coverMetaGrid}>
            {[
              ['Project Reference', refId],
              ['Prepared For', preparedFor],
              ['Date Issued', dateStr],
              ['Execution Mode', input?.contractorMode === 'contractor' ? 'Contractor Mode' : 'Independent Self-Build'],
              ['Plot Dimensions', `${input?.plotLength || 0} × ${input?.plotWidth || 0} ft`],
              ['Rate Master Dataset', rateMeta?.datasetVersion || 'HUTTY-RM-2026.1'],
              ['Data Source', rateMeta?.isLive ? 'Live API' : '2026-Q1 Baseline'],
              ['Calculation Engine', rateMeta?.calculationEngineVersion || 'v2.6.0'],
            ].map(([label, value], i) => (
              <View key={i} style={styles.coverMetaCell}>
                <Text style={styles.coverMetaLabel}>{label}</Text>
                <Text style={styles.coverMetaValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Mandatory Estimate Note */}
          <View style={{ marginTop: 10, backgroundColor: 'rgba(242,140,40,0.18)', borderWidth: 0.8, borderColor: C.amber, borderRadius: 5, padding: 8 }}>
            <Text style={{ fontSize: 6.8, fontFamily: 'Helvetica-Bold', color: '#FDBA74', textTransform: 'uppercase', marginBottom: 2 }}>
              Important Estimate Note
            </Text>
            <Text style={{ fontSize: 6.2, color: '#FFFFFF', lineHeight: 1.35 }}>
              This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
            </Text>
          </View>
        </View>

        {/* Bottom footer bar */}
        <View style={styles.coverBottom}>
          <Text style={styles.coverBottomText}>Hutty Construction Technologies · https://hutty.in</Text>
          <Text style={styles.coverBottomText}>PRELIMINARY ESTIMATE — NOT A CONTRACTUAL DOCUMENT</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 2 — SECTION A: WHAT WE BUILD (WORKS BOQ)
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section A: What We Build · Works BOQ" />

        {/* Project KPIs */}
        <Text style={styles.sectionTitle}>1. Project Parameters &amp; Built-Up Area</Text>
        <View style={styles.kpiRow}>
          {[
            ['Plot Area', `${num(area?.plotAreaSqFt)} sq.ft`, `${input?.plotLength || 0}×${input?.plotWidth || 0} ft`],
            ['Built-Up Area', `${num(area?.totalBUASqFt)} sq.ft`, `${input?.floors || 1} floor(s)`],
            ['Base Const. Cost', fmt(budget?.baseConstructionCost), `${num(budget?.costPerSqFt)}/sq.ft`],
            ['Est. Timeline', `${timeline?.totalMonths || 8} months`, input?.houseType || 'Duplex'],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Key structural quantities with correct canonical units */}
        <Text style={[styles.sectionTitle, { marginTop: 6 }]}>2. Key Structural &amp; Concrete Quantities (Derived)</Text>
        <View style={styles.kpiRow}>
          {[
            ['Structural Steel', `${quantities?.steelTonnes || 0} Tonnes`, `${num(quantities?.steelKg)} kg`],
            ['Portland Cement', `${num(quantities?.cementBags)} Bags`, '50 kg / bag'],
            ['Total RCC Concrete', `${quantities?.rccConcreteTotalCuM || 0} m³`, 'Footing + Col + Slab'],
            ['Block Wall Area', `${num(quantities?.blockWallCoverageSqFt || quantities?.netWallAreaSqFt)} sq.ft`, `${num(quantities?.masonryUnitsCount)} Nos`],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.kpiRow, { marginTop: -12, marginBottom: 6 }]}>
          {[
            ['Footing Concrete', `${quantities?.footingConcreteCuM || 0} m³`, 'Pads & Footings'],
            ['Column Concrete', `${quantities?.columnConcreteCuM || 0} m³`, 'Structural Columns'],
            ['Slab Concrete', `${quantities?.slabConcreteCuM || 0} m³`, 'Slabs & Beams'],
            ['Block Consumption', `${num(quantities?.blockWallCoverageSqFt || quantities?.netWallAreaSqFt)} sq.ft`, `${quantities?.masonryMaterial || 'AAC'} coverage`],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={[styles.kpiCard, { backgroundColor: 'rgba(27,61,52,0.03)' }]}>
              <Text style={[styles.kpiLabel, { color: C.grey }]}>{lbl}</Text>
              <Text style={[styles.kpiValue, { fontSize: 8, color: C.green }]}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Section A Table */}
        <Text style={[styles.sectionTitle, { marginTop: 6 }]}>
          Section A — What We Build · Comprehensive Works BOQ
        </Text>
        <View>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W.desc }]}>Trade Activity &amp; Description</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Amount</Text>
          </View>

          {(boq || []).map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: W.sl }]}>{item.slNo}</Text>
              <View style={{ width: W.desc }}>
                <Text style={styles.td}>
                  {item.description}
                  {item.brand ? ` · ${item.brand}` : ''}
                </Text>
                {item.remarks ? <Text style={[styles.tdMuted, { fontSize: 5.5 }]}>{item.remarks}</Text> : null}
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>
                {num(item.quantity)} {formatUnitLabel(item.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>
                ₹{item.unitRate?.toLocaleString()}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}

          <View style={styles.totalRow} wrap={false}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section A Total — What We Build (Works BOQ)</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>{fmt(budget?.baseConstructionCost)}</Text>
          </View>
        </View>

        <DocFooter section="Section A: What We Build · Works BOQ" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 3 — SECTION B: WHAT WE CONSUME (MATERIALS TAKEOFF)
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section B: What We Consume · Materials Needed" />

        {/* Materials Summary KPI Cards */}
        <Text style={styles.sectionTitle}>1. Core Materials Needed Summary</Text>
        <View style={styles.kpiRow}>
          {[
            ['Structural Steel', `${quantities?.steelTonnes || 0} Tonnes`, `${num(quantities?.steelKg)} kg`],
            ['Portland Cement', `${num(quantities?.cementBags)} Bags`, '50 kg / bag'],
            [
              'Sand & Aggregates',
              `${num((quantities?.mSandCuFt || 0) + (quantities?.pSandCuFt || 0) + (quantities?.coarseAggregateCuFt || 0))} CFT`,
              'M-Sand + P-Sand + Metal',
            ],
            [
              'Block Wall Coverage',
              `${num(quantities?.blockWallCoverageSqFt || quantities?.netWallAreaSqFt)} sq.ft`,
              `${num(quantities?.masonryUnitsCount)} Nos`,
            ],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Section B Table */}
        <Text style={[styles.sectionTitle, { marginTop: 6 }]}>
          Section B — What We Consume · Itemized Materials Needed
        </Text>
        <View>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W.desc }]}>Material &amp; Brand Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Quantity</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Unit Rate</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Total</Text>
          </View>
          {(materialSchedule || []).map((mat, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tdMuted, { width: W.sl }]}>{mat.slNo}</Text>
              <View style={{ width: W.desc }}>
                <Text style={styles.td}>{mat.material}</Text>
                <Text style={[styles.tdMuted, { fontSize: 5.5 }]}>
                  {mat.brand} · {mat.specification}
                </Text>
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>
                {num(mat.quantity)} {formatUnitLabel(mat.unit)}
              </Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>
                ₹{mat.unitRate?.toLocaleString()}
              </Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(mat.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow} wrap={false}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section B Total — Physical Materials</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>
              {fmt((materialSchedule || []).reduce((s, m) => s + (m.amount || 0), 0))}
            </Text>
          </View>
        </View>

        {/* Material Invariance Note */}
        <View style={styles.noticeBox} wrap={false}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 2 }}>
            MATERIAL CONSUMPTION &amp; RATE INVARIANCE NOTICE
          </Text>
          <Text style={{ fontSize: 5.8, color: C.grey, lineHeight: 1.35 }}>
            Material quantities are determined directly by your house size and layout. Changing brand selections (e.g. Tata Tiscon vs JSW Steel, or UltraTech vs ACC Cement) modifies the unit rate and cost total while keeping the physical quantities consistent (tonnes, bags, CFT, sq.ft, litres).
          </Text>
        </View>

        <DocFooter section="Section B: What We Consume · Physical Materials" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 4 — SECTION C: WHAT WE INSTALL (SERVICES & FIXTURES)
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section C: What We Install · Services &amp; Fixtures Schedule" />

        {/* Services & Fixtures Summary KPIs */}
        <Text style={styles.sectionTitle}>1. Services &amp; Installed Systems Overview</Text>
        <View style={styles.kpiRow}>
          {[
            [
              'Electrical Points',
              `${quantities?.totalElectricalPoints || 0} Points`,
              `${quantities?.lightingPoints || 0} lights · ${quantities?.socketPoints || 0} sockets`,
            ],
            [
              'Plumbing Outlets',
              `${(quantities?.totalWaterPoints || 0) + (quantities?.totalDrainagePoints || 0)} Points`,
              `${quantities?.totalWaterPoints || 0} supply · ${quantities?.totalDrainagePoints || 0} drain`,
            ],
            [
              'Sanitary Suites',
              `${quantities?.bathroomFixtureSets || 0} Suites`,
              `${quantities?.wcCount || 0} EWCs · ${quantities?.washBasinCount || 0} basins`,
            ],
            [
              'Doors & Windows',
              `${(quantities?.totalDoorsCount || 0) + (quantities?.windowsCount || 0)} Units`,
              `${quantities?.totalDoorsCount || 0} doors · ${quantities?.windowsCount || 0} windows`,
            ],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Section C Subsections — Structurally Consistent */}
        <Text style={[styles.sectionTitle, { marginTop: 6, marginBottom: 5 }]}>
          Section C — What We Install · Services &amp; Fixtures Schedule
        </Text>

        {/* 1. Electrical */}
        {renderInstallationSubSection('1. Electrical Services & Equipment', electricalFixtures)}

        {/* 2. Plumbing */}
        {renderInstallationSubSection('2. Plumbing Systems & Storage', plumbingFixtures)}

        {/* 3. Sanitary & Fixtures */}
        {renderInstallationSubSection('3. Sanitaryware & Bathroom Fixtures', sanitaryFixtures)}

        {/* 4. Doors & Windows */}
        {renderInstallationSubSection('4. Doors, Windows & Glazing', doorWindowFixtures)}

        {/* 5. Other Installations (omitted if empty) */}
        {renderInstallationSubSection('5. Special Equipment & Other Installations', otherInstallations)}

        {/* Section C Reconciled Grand Total */}
        <View style={styles.totalRow} wrap={false}>
          <Text style={[styles.totalLabel, { width: '70%' }]}>Section C Total — What We Install (Fixtures &amp; Services)</Text>
          <Text style={[styles.totalValue, { width: '30%' }]}>
            {fmt(allFixtures.reduce((s, f) => s + (f.amount || 0), 0))}
          </Text>
        </View>

        {/* Services & Engineering Notice */}
        <View style={styles.noticeBox} wrap={false}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 2 }}>
            SERVICES &amp; MEP ENGINEERING DISCLAIMER
          </Text>
          <Text style={{ fontSize: 5.8, color: C.grey, lineHeight: 1.35 }}>
            Electrical point distribution, wire gauges, plumbing CPVC/SWR pipe sizing, and sanitary fixture allocations are derived from architectural space rules and benchmark engineering standards. Final conductor sizing, circuit breaker protection, water pressure calculations, and sewer invert levels must be validated by appointed MEP consultants before site rough-in.
          </Text>
        </View>

        <DocFooter section="Section C: What We Install · Services & Fixtures" />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 5 — SECTION D: WHAT IT COSTS (COMMERCIALS & ROADMAP)
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section D: What It Costs · Commercial Breakdown &amp; Roadmap" />

        {/* Section D */}
        <Text style={styles.sectionTitle}>Section D — What It Costs · Cost Summary &amp; Commercial Details</Text>
        <View>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: WD.cat }]}>Trade Category</Text>
            <Text style={[styles.th, styles.tdRight, { width: WD.amt }]}>Amount (INR)</Text>
            <Text style={[styles.th, styles.tdRight, { width: WD.pct }]}>% of Total</Text>
          </View>
          {(budget?.heads || []).map((head, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.td, { width: WD.cat }]}>{head.name}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: WD.amt }]}>{fmt(head.allocatedAmount)}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: WD.pct }]}>{head.percentage}%</Text>
            </View>
          ))}
          <View style={styles.totalRow} wrap={false}>
            <Text style={[styles.totalLabel, { width: WD.cat }]}>Total Estimated Project Cost (All-Inclusive)</Text>
            <Text style={[styles.totalValue, { width: WD.amt }]}>{fmt(budget?.totalProjectCost)}</Text>
            <Text style={[styles.totalValue, { width: WD.pct }]}>100.0%</Text>
          </View>
        </View>

        {/* Commercial summary cards */}
        <View style={[styles.kpiRow, { marginTop: 6 }]} wrap={false}>
          {[
            ['Base Construction', fmt(budget?.baseConstructionCost)],
            ['Contractor Margin', fmt(budget?.contractorMargin)],
            ['Contingency', fmt(budget?.contingency)],
            ['Professional Fees', fmt(budget?.professionalFees)],
            ['GST / Taxes', fmt(budget?.gstAmount)],
          ].map(([lbl, val], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={[styles.td, { fontFamily: 'Helvetica-Bold', fontSize: 7 }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Milestone roadmap */}
        {Array.isArray(paymentPlan) && paymentPlan.length > 0 && (
          <View wrap={false}>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              Payment Plan — Milestone Disbursement Schedule
            </Text>
            <View>
              <View style={styles.tableHeaderRow} fixed>
                <Text style={[styles.th, { width: WD.cat }]}>Stage / Construction Milestone</Text>
                <Text style={[styles.th, styles.tdRight, { width: WD.amt }]}>Disbursement</Text>
                <Text style={[styles.th, styles.tdRight, { width: WD.pct }]}>Stage %</Text>
              </View>
              {paymentPlan.map((stage, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
                  <View style={{ width: WD.cat }}>
                    <Text style={styles.td}>
                      Stage {stage.stage}: {stage.title}
                    </Text>
                    {stage.description ? <Text style={[styles.tdMuted, { fontSize: 5.5 }]}>{stage.description}</Text> : null}
                  </View>
                  <Text style={[styles.tdBold, styles.tdRight, { width: WD.amt }]}>{fmt(stage.amount)}</Text>
                  <Text style={[styles.tdMuted, styles.tdRight, { width: WD.pct }]}>{stage.percentage}%</Text>
                </View>
              ))}
              <View style={styles.totalRow} wrap={false}>
                <Text style={[styles.totalLabel, { width: WD.cat }]}>Total — All Milestones</Text>
                <Text style={[styles.totalValue, { width: WD.amt }]}>{fmt(budget?.totalProjectCost)}</Text>
                <Text style={[styles.totalValue, { width: WD.pct }]}>100.0%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Mandatory Early Estimate Note Box */}
        <View style={{ marginTop: 6, backgroundColor: '#FEF3C7', borderWidth: 0.8, borderColor: '#F59E0B', borderRadius: 4, padding: 6 }} wrap={false}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#92400E', textTransform: 'uppercase', marginBottom: 2 }}>
            IMPORTANT ESTIMATE NOTE
          </Text>
          <Text style={{ fontSize: 6, color: '#78350F', lineHeight: 1.35, fontFamily: 'Helvetica-Bold' }}>
            This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
          </Text>
        </View>

        {/* Rate master metadata */}
        <View style={[styles.disclaimerBox, { marginTop: 6 }]} wrap={false}>
          <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 2 }}>
            RATE MASTER SOURCE &amp; ENGINE METADATA
          </Text>
          <Text style={{ fontSize: 5.5, color: C.grey, lineHeight: 1.3 }}>
            Dataset: {rateMeta?.datasetVersion || 'HUTTY-RM-2026.1'} · Provider: {rateMeta?.providerName || 'Hutty QS Rate Master'} · Engine: {rateMeta?.calculationEngineVersion || 'v2.6.0'} · Mode: {rateMeta?.isLive ? 'Live API Connected' : '2026-Q1 Fallback / Baseline Rates'} · Basis: Bangalore Market Q1 2026
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.noticeBox} wrap={false}>
          <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 2 }}>
            IMPORTANT — PRELIMINARY ESTIMATE &amp; ENGINEERING NOTICE
          </Text>
          <Text style={{ fontSize: 5.5, color: C.grey, lineHeight: 1.3 }}>
            · Generated using Hutty's preliminary quantity surveying estimation rules. Final structural, geotechnical, and MEP engineering drawings must be certified by appointed consultants.{'\n'}
            · Actual quantities and costs may vary based on architectural drawings, soil strata, construction methods, brand specifications, supplier quotations, and prevailing market rates.
          </Text>
        </View>

        <DocFooter section="Section D: What It Costs · Commercial Breakdown" />
      </Page>

      {/* ────────────────────────────────────────────────────────── */}
      {/* PAGE 6: SECTION E — CONTRACTOR AUDIT, SENSITIVITY & SCENARIOS (PREMIUM) */}
      {/* ────────────────────────────────────────────────────────── */}
      {isPremium && (
        <Page size="A4" style={styles.page}>
          <RunHeader section="Section E: Contractor Quote Audit, Material Sensitivity & Multi-Scenario Comparison" />

          {/* Section E Banner */}
          <View style={{ backgroundColor: C.green, padding: 8, borderRadius: 3, marginTop: 4, marginBottom: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase' }}>
              SECTION E &bull; CONTRACTOR QUOTE AUDIT &amp; SENSITIVITY (PREMIUM DELIVERABLE)
            </Text>
            <Text style={{ fontSize: 6, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              Independent QS vetting benchmarks, finish sensitivity variance, and multi-scenario footprint comparison.
            </Text>
          </View>

          {/* 1. Market Rate Tolerance Benchmarks */}
          <Text style={styles.sectionTitle}>1. Key Trade Market Tolerances (Bangalore Q1 2026)</Text>
          <View style={{ borderWidth: 0.5, borderColor: C.border, marginTop: 2, marginBottom: 6 }}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.th, { width: '35%' }]}>Material / Trade Description</Text>
              <Text style={[styles.th, { width: '20%' }]}>Unit</Text>
              <Text style={[styles.th, styles.tdRight, { width: '25%' }]}>Market Benchmark</Text>
              <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Allowable Variance</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '35%' }]}>Structural TMT Steel (Fe 550D)</Text>
              <Text style={[styles.td, { width: '20%' }]}>Per Kg</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>₹68 – ₹76</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>±5% tolerance</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]} wrap={false}>
              <Text style={[styles.tdBold, { width: '35%' }]}>53-Grade Portland Cement</Text>
              <Text style={[styles.td, { width: '20%' }]}>50kg Bag</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>₹380 – ₹420</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>±4% tolerance</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '35%' }]}>Solid Concrete Masonry Blocks (6")</Text>
              <Text style={[styles.td, { width: '20%' }]}>Per Block</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>₹42 – ₹48</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>±5% tolerance</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]} wrap={false}>
              <Text style={[styles.tdBold, { width: '35%' }]}>Civil RCC Labour (Framed Structure)</Text>
              <Text style={[styles.td, { width: '20%' }]}>Per sq.ft BUA</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>₹240 – ₹280</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>±6% tolerance</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '35%' }]}>Tile Laying &amp; Grouting Labour</Text>
              <Text style={[styles.td, { width: '20%' }]}>Per sq.ft</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>₹35 – ₹45</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>±8% tolerance</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]} wrap={false}>
              <Text style={[styles.tdBold, { width: '35%' }]}>Interior Emulsion Painting (2 Coats + Putty)</Text>
              <Text style={[styles.td, { width: '20%' }]}>Per sq.ft</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>₹18 – ₹26</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: '20%' }]}>±7% tolerance</Text>
            </View>
          </View>

          {/* 2. Missing Scope Redlines Checklist */}
          <Text style={styles.sectionTitle}>2. High-Risk Missing Scope Checklist (Contractor Redlines)</Text>
          <View style={{ marginTop: 2, marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 3 }}>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.amber }}>[!]</Text>
              <Text style={{ fontSize: 6, color: C.green, flex: 1 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Soil Bearing Capacity Test: </Text>
                Frequently omitted by turnkey contractors; demand written geotechnical soil report before footing depth sign-off.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 3 }}>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.amber }}>[!]</Text>
              <Text style={{ fontSize: 6, color: C.green, flex: 1 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Temporary 3-Phase Power &amp; Water: </Text>
                Verify whether temporary power meter deposit, wiring, and borewell water for curing are included in contractor's quote.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 3 }}>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.amber }}>[!]</Text>
              <Text style={{ fontSize: 6, color: C.green, flex: 1 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Compound Wall &amp; Gate Columns: </Text>
                Often charged as an extra variation cost. Ensure linear footage and foundation depth are explicitly documented.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 3 }}>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.amber }}>[!]</Text>
              <Text style={{ fontSize: 6, color: C.green, flex: 1 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Sump Waterproofing &amp; Debris Disposal: </Text>
                Verify crystalline chemical waterproofing on underground tanks and periodic carting of construction debris away from site.
              </Text>
            </View>
          </View>

          {/* 3. Finish Package Sensitivity Matrix */}
          <Text style={styles.sectionTitle}>3. Finish Specification Sensitivity Matrix ({num(area.totalBUASqFt)} sq.ft BUA)</Text>
          <View style={{ borderWidth: 0.5, borderColor: C.border, marginTop: 2, marginBottom: 6 }}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.th, { width: '30%' }]}>Specification Package</Text>
              <Text style={[styles.th, { width: '40%' }]}>Material Standards &amp; Fittings</Text>
              <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Est. Rate/sqft</Text>
              <Text style={[styles.th, styles.tdRight, { width: '15%' }]}>Project Variance</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '30%' }]}>Standard Specification</Text>
              <Text style={[styles.tdMuted, { width: '40%' }]}>Vitrified 2x2, standard UPVC, OBD paint, baseline CP</Text>
              <Text style={[styles.tdRight, { width: '15%' }]}>₹1,950</Text>
              <Text style={[styles.tdRight, { width: '15%', color: '#047857' }]}>- {fmt(Math.max(0, (budget.costPerSqFt || 2250) - 1950) * area.totalBUASqFt)}</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: C.bgAccent }]} wrap={false}>
              <Text style={[styles.tdBold, { width: '30%', color: C.green }]}>Premium (Current Baseline)</Text>
              <Text style={[styles.td, { width: '40%' }]}>GVT 4x2, Schuco UPVC, Royal luxury emulsion, Jaguar fittings</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '15%' }]}>₹{Math.round(budget.costPerSqFt || 2250).toLocaleString('en-IN')}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '15%', color: C.amber }]}>Baseline</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '30%' }]}>Luxury Specification</Text>
              <Text style={[styles.tdMuted, { width: '40%' }]}>Italian marble, thermal-break aluminium, Grohe/Kohler, smart automation</Text>
              <Text style={[styles.tdRight, { width: '15%' }]}>₹2,850</Text>
              <Text style={[styles.tdRight, { width: '15%', color: '#B91C1C' }]}>+ {fmt(Math.max(0, 2850 - (budget.costPerSqFt || 2250)) * area.totalBUASqFt)}</Text>
            </View>
          </View>

          {/* 4. Multi-Scenario Comparison */}
          <Text style={styles.sectionTitle}>4. Multi-Scenario Layout Comparison on Plot ({num(input?.plotLength || 30)}' × {num(input?.plotWidth || 40)}')</Text>
          <View style={{ borderWidth: 0.5, borderColor: C.border, marginTop: 2, marginBottom: 6 }}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.th, { width: '30%' }]}>Layout Scenario</Text>
              <Text style={[styles.th, { width: '30%' }]}>Built-Up Area (BUA)</Text>
              <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Estimated Budget</Text>
              <Text style={[styles.th, styles.tdRight, { width: '20%' }]}>Effective Rate</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '30%' }]}>Scenario A: Single Floor (Compact)</Text>
              <Text style={[styles.td, { width: '30%' }]}>{num(area.buaPerFloorSqFt || Math.round(area.totalBUASqFt / (input?.floors || 1)))} sq.ft</Text>
              <Text style={[styles.tdRight, { width: '20%' }]}>{fmt((area.buaPerFloorSqFt || Math.round(area.totalBUASqFt / (input?.floors || 1))) * (budget.costPerSqFt || 2250))}</Text>
              <Text style={[styles.tdRight, { width: '20%' }]}>₹{Math.round(budget.costPerSqFt || 2250).toLocaleString('en-IN')}/sqft</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: C.bgAccent }]} wrap={false}>
              <Text style={[styles.tdBold, { width: '30%', color: C.green }]}>Scenario B: Current Plan (G+{Math.max(0, (input?.floors || 1) - 1)})</Text>
              <Text style={[styles.tdBold, { width: '30%' }]}>{num(area.totalBUASqFt)} sq.ft</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '20%' }]}>{fmt(budget.totalProjectCost)}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: '20%' }]}>₹{Math.round(budget.costPerSqFt || 2250).toLocaleString('en-IN')}/sqft</Text>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <Text style={[styles.tdBold, { width: '30%' }]}>Scenario C: +1 Floor (Rental Unit)</Text>
              <Text style={[styles.td, { width: '30%' }]}>{num(area.totalBUASqFt + Math.round(area.totalBUASqFt / (input?.floors || 1)))} sq.ft</Text>
              <Text style={[styles.tdRight, { width: '20%' }]}>{fmt(budget.totalProjectCost + (Math.round(area.totalBUASqFt / (input?.floors || 1)) * (budget.costPerSqFt || 2250) * 0.88))}</Text>
              <Text style={[styles.tdRight, { width: '20%' }]}>₹{Math.round((budget.costPerSqFt || 2250) * 0.96).toLocaleString('en-IN')}/sqft</Text>
            </View>
          </View>

          {/* Mandatory Early Estimate Note Box */}
          <View style={{ marginTop: 4, backgroundColor: '#FEF3C7', borderWidth: 0.8, borderColor: '#F59E0B', borderRadius: 4, padding: 5 }}>
            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: '#92400E', textTransform: 'uppercase', marginBottom: 1 }}>
              IMPORTANT ESTIMATE NOTE
            </Text>
            <Text style={{ fontSize: 5.5, color: '#78350F', lineHeight: 1.35, fontFamily: 'Helvetica-Bold' }}>
              This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
            </Text>
          </View>

          <DocFooter section="Section E: Contractor Audit & Sensitivity (Premium)" />
        </Page>
      )}

    </Document>
  );
};
