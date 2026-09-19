import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CalculationResult } from '../../calculation-engine/types';

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
    paddingBottom: 32,
    paddingHorizontal: 28,
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: C.green,
    backgroundColor: C.bgPage,
    lineHeight: 1.3,
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
    paddingTop: 32,
    paddingBottom: 32,
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
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    lineHeight: 1.15,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.5,
    maxWidth: 400,
    marginBottom: 28,
  },
  coverKpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  coverKpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 6,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  coverKpiLabel: {
    fontSize: 6.5,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverKpiValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  coverKpiSub: {
    fontSize: 6.5,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  coverMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  coverMetaCell: {
    width: '50%',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  coverMetaLabel: {
    fontSize: 6.5,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  coverMetaValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  coverBottom: {
    padding: 20,
    paddingHorizontal: 36,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverBottomText: {
    fontSize: 6.5,
    color: 'rgba(255,255,255,0.35)',
  },

  // ── Running Header ──
  runningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingBottom: 7,
    borderBottomWidth: 1.5,
    borderBottomColor: C.green,
  },
  runningHeaderLogo: {
    fontSize: 11,
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
    fontSize: 6.5,
    color: C.greyLt,
    textAlign: 'right',
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    backgroundColor: C.green,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 10,
    marginBottom: 0,
  },

  // ── Summary Cards ──
  kpiRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.bgAccent,
    borderRadius: 3,
    padding: 7,
    borderWidth: 0.5,
    borderColor: C.border,
    borderLeftWidth: 2.5,
    borderLeftColor: C.green,
  },
  kpiLabel: {
    fontSize: 6,
    color: C.greyLt,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  kpiSub: {
    fontSize: 6,
    color: C.greyLt,
    marginTop: 1,
  },

  // ── Tables ──
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.green,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
  },
  tableRowAlt: { backgroundColor: C.bgAlt },
  th: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  td: { fontSize: 7, color: C.green },
  tdMuted: { fontSize: 6.5, color: C.grey },
  tdBold: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.green },
  tdRight: { textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: C.green,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  totalLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.amber,
    textAlign: 'right',
  },

  // ── Misc ──
  twoCol: { flexDirection: 'row', gap: 6, marginTop: 6 },
  gridCard: {
    flex: 1,
    backgroundColor: C.bgAlt,
    borderRadius: 3,
    padding: 7,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  noticeBox: {
    backgroundColor: C.bgAccent,
    padding: 7,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.green,
    borderLeftWidth: 2.5,
    borderLeftColor: C.amber,
    marginTop: 8,
  },
  disclaimerBox: {
    backgroundColor: C.bgAlt,
    padding: 7,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.border,
    marginTop: 8,
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
    fontSize: 6,
    color: C.greyLt,
  },
});

export interface DetailedReportPdfProps {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
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
}) => {
  const { input, report, area, budget, boq, materialSchedule, fixtureSchedule, timeline, paymentPlan, quantities } = data;
  const rateMeta = data.rateSourceMetadata || report?.rateSourceMetadata;

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const refId = report?.projectId || 'HUTTY-2026';

  const civilBoq = (boq || []).filter((i) => !i.code.startsWith('BOQ-ELEC-'));
  const elecBoq  = (boq || []).filter((i) => i.code.startsWith('BOQ-ELEC-'));
  const elecTotal = elecBoq.reduce((s, i) => s + (i.amount || 0), 0);

  // Column widths
  const W = { sl: '5%', desc: '49%', qty: '16%', rate: '14%', amt: '16%' };
  const WD = { cat: '56%', amt: '24%', pct: '20%' };
  const WC = { g: '9%', spec: '55%', run: '18%', coil: '18%' };

  const RunHeader = ({ section }: { section: string }) => (
    <View style={styles.runningHeader}>
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
            Includes Works BOQ, Conductor Takeoff, MEP &amp; Fixture Schedules, and Milestone Disbursement Roadmap.
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
          <View style={[styles.coverKpiRow, { marginTop: -14, marginBottom: 20 }]}>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>1. Physical Materials</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 11 }]}>{fmt(budget?.directMaterialCost)}</Text>
              <Text style={styles.coverKpiSub}>What We Consume</Text>
            </View>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>2. Fixtures & Equipment</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 11 }]}>{fmt(budget?.directFixtureCost)}</Text>
              <Text style={styles.coverKpiSub}>What We Install</Text>
            </View>
            <View style={[styles.coverKpi, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.coverKpiLabel}>3. Execution Labour</Text>
              <Text style={[styles.coverKpiValue, { fontSize: 11 }]}>{fmt(budget?.directLabourCost)}</Text>
              <Text style={styles.coverKpiSub}>Civil & Finishing Trades</Text>
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
        </View>

        {/* Bottom footer bar */}
        <View style={styles.coverBottom}>
          <Text style={styles.coverBottomText}>Hutty Construction Technologies · https://hutty.in</Text>
          <Text style={styles.coverBottomText}>PRELIMINARY ESTIMATE — NOT A CONTRACTUAL DOCUMENT</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 2 — PROJECT PARAMETERS + SECTION A: CIVIL BOQ
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section A: Civil &amp; Structural Works BOQ" />

        {/* Project KPIs */}
        <Text style={styles.sectionTitle}>1. Project Parameters &amp; Built-Up Area</Text>
        <View style={styles.kpiRow}>
          {[
            ['Plot Area', `${num(area?.plotAreaSqFt)} sq.ft`, `${input?.plotLength||0}×${input?.plotWidth||0} ft`],
            ['Built-Up Area', `${num(area?.totalBUASqFt)} sq.ft`, `${input?.floors||1} floor(s)`],
            ['Base Const. Cost', fmt(budget?.baseConstructionCost), `${num(budget?.costPerSqFt)}/sq.ft`],
            ['Est. Timeline', `${timeline?.totalMonths||8} months`, input?.houseType || 'Duplex'],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Key structural quantities */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>2. Key Structural Quantities (Derived)</Text>
        <View style={styles.kpiRow}>
          {[
            ['Structural Steel', `${quantities?.steelTonnes || 0} MT`, `${quantities?.steelKg?.toLocaleString()||0} kg`],
            ['Portland Cement', `${quantities?.cementBags?.toLocaleString()||0} bags`, '50 kg / bag'],
            ['Masonry Units', `${num(quantities?.masonryUnitsCount)} nos`, quantities?.masonryMaterial || 'AAC Blocks'],
            ['Sand &amp; Agg.', `${num((quantities?.mSandCuFt||0)+(quantities?.pSandCuFt||0)+(quantities?.coarseAggregateCuFt||0))} CFT`, 'All aggregate types'],
          ].map(([lbl, val, sub], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={styles.kpiValue}>{val}</Text>
              <Text style={styles.kpiSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Section A Table */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Section A — What We Build · Civil, Structural &amp; Finishes BOQ</Text>
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W.desc }]}>Trade Activity &amp; Description</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Amount</Text>
          </View>

          {civilBoq.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdMuted, { width: W.sl }]}>{item.slNo}</Text>
              <View style={{ width: W.desc }}>
                <Text style={styles.td}>{item.description}{item.brand ? ` · ${item.brand}` : ''}</Text>
                {item.remarks ? <Text style={[styles.tdMuted, { fontSize: 6 }]}>{item.remarks}</Text> : null}
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>{item.quantity} {item.unit}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>₹{item.unitRate?.toLocaleString()}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section A Total — Civil &amp; Structural Works</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>{fmt(budget?.baseConstructionCost)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Hutty QS Dossier · {refId}</Text>
          <Text>Section A: Civil &amp; Structural Works BOQ · Page 2</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 3 — SECTION E: MEP & ELECTRICAL
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section E: MEP &amp; Electrical Engineering Breakdown" />

        {/* Point Schedule */}
        <Text style={styles.sectionTitle}>1. Electrical Installation Schedule — What We Install</Text>
        <View style={styles.twoCol}>
          {[
            ['Lighting Points', `${quantities?.lightingPoints||0} nos`],
            ['Ceiling Fan Points', `${quantities?.fanPoints||0} nos`],
            ['Power Sockets (6A/16A)', `${quantities?.socketPoints||0} nos`],
            ['AC Dedicated Circuits', `${quantities?.acPoints||0} nos`],
            ['Geyser Circuits', `${quantities?.geyserPoints||0} nos`],
            ['TV / Data Points', `${quantities?.tvDataPoints||0} nos`],
          ].map(([lbl, val], i) => (
            <View key={i} style={[styles.gridCard, { flex: 1 }]}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={[styles.td, { fontFamily: 'Helvetica-Bold', fontSize: 8.5 }]}>{val}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.twoCol, { marginTop: 4 }]}>
          {[
            ['EV Charging Point', (quantities?.evPoints||0) > 0 ? '1 No · 7.4 kW Dedicated' : 'Not specified'],
            ['Distribution Boards', `1 Main Panel + ${quantities?.floorDBCount||0} Floor Sub-DBs`],
            ['Switch Modules (Est.)', `${quantities?.switchModules||0} modules`],
            ['Total Electrical Points', `${quantities?.totalElectricalPoints||0} points`],
          ].map(([lbl, val], i) => (
            <View key={i} style={[styles.gridCard, { flex: 1 }]}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={[styles.td, { fontFamily: 'Helvetica-Bold', fontSize: 8 }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Conductor Takeoff */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>2. Segregated Conductor &amp; Conduit Takeoff — What We Consume</Text>
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: WC.g }]}>Gauge</Text>
            <Text style={[styles.th, { width: WC.spec }]}>Conductor Spec &amp; Service Duty</Text>
            <Text style={[styles.th, styles.tdRight, { width: WC.run }]}>Total Run</Text>
            <Text style={[styles.th, styles.tdRight, { width: WC.coil }]}>Std Coils (90m)</Text>
          </View>
          {[
            ['1.5 mm²',  'FR-LSH Copper · Lighting &amp; Fan circuits (~8.5 m/pt)',       quantities?.wire1_5SqMmMetres, Math.ceil((quantities?.wire1_5SqMmMetres||0)/90)],
            ['2.5 mm²',  'FR-LSH Copper · Power sockets 6A/16A (~12.5 m/pt)',             quantities?.wire2_5SqMmMetres, Math.ceil((quantities?.wire2_5SqMmMetres||0)/90)],
            ['4.0 mm²',  'FR-LSH Copper · Dedicated AC &amp; Geyser home-runs (~22 m/pt)', quantities?.wire4SqMmMetres,   Math.ceil((quantities?.wire4SqMmMetres||0)/90)],
            ['6.0 mm²',  'FR-LSH Copper · Sub-DB risers &amp; EV charger supply',          quantities?.wire6SqMmMetres,   Math.ceil((quantities?.wire6SqMmMetres||0)/90)],
            ['Conduit',  'FRLS rigid PVC 25 mm dia · In-slab &amp; wall chased',           quantities?.conduitsMetres,    Math.round((quantities?.conduitsMetres||0)*3.28084)],
          ].map(([g, spec, run, coil], idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdBold, { width: WC.g }]}>{g}</Text>
              <Text style={[styles.td, { width: WC.spec }]}>{spec}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: WC.run }]}>{num(run as number)} m</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: WC.coil }]}>
                {idx === 4 ? `${coil} RFT` : `${coil} coils`}
              </Text>
            </View>
          ))}
        </View>

        {/* Electrical BOQ */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>3. Commercial Electrical Works BOQ — What It Costs</Text>
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W.desc }]}>Electrical Item</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Qty / Unit</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Rate (₹)</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Amount</Text>
          </View>
          {elecBoq.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdMuted, { width: W.sl }]}>{item.slNo}</Text>
              <Text style={[styles.td,     { width: W.desc }]}>{item.description}{item.brand ? ` · ${item.brand}` : ''}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>{item.quantity} {item.unit}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>₹{item.unitRate?.toLocaleString()}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Subtotal — Total Electrical Works</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>{fmt(elecTotal)}</Text>
          </View>
        </View>

        {/* Electrical notice */}
        <View style={styles.noticeBox}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 2 }}>
            ELECTRICAL ENGINEERING DISCLAIMER
          </Text>
          <Text style={{ fontSize: 6, color: C.grey, lineHeight: 1.4 }}>
            Hutty's electrical quantities are preliminary estimation quantities. They are not a substitute for final electrical design. Conductor sizing, circuit loading, voltage-drop checks, protection, DB design, and installation details must be verified by a qualified electrical engineer before execution.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Hutty QS Dossier · {refId}</Text>
          <Text>Section E: MEP &amp; Electrical Engineering · Page 3</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 4 — SECTION B: MATERIALS + SECTION C: FIXTURES
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section B &amp; C: Physical Materials &amp; Fixtures" />

        {/* Section B */}
        <Text style={styles.sectionTitle}>Section B — What We Consume · Physical Materials Takeoff</Text>
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W.desc }]}>Material &amp; Brand Specification</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Quantity</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Unit Rate</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Total</Text>
          </View>
          {(materialSchedule || []).map((mat, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdMuted, { width: W.sl }]}>{mat.slNo}</Text>
              <View style={{ width: W.desc }}>
                <Text style={styles.td}>{mat.material}</Text>
                <Text style={[styles.tdMuted, { fontSize: 6 }]}>{mat.brand} · {mat.specification}</Text>
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>{num(mat.quantity)} {mat.unit}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>₹{mat.unitRate?.toLocaleString()}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(mat.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section B Total — Physical Materials</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>
              {fmt((materialSchedule || []).reduce((s, m) => s + (m.amount || 0), 0))}
            </Text>
          </View>
        </View>

        {/* Section C */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Section C — What We Install · Fixtures &amp; Equipment Schedule</Text>
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: W.sl }]}>Sl</Text>
            <Text style={[styles.th, { width: W.desc }]}>Fixture / Equipment Item</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.qty }]}>Quantity</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.rate }]}>Unit Rate</Text>
            <Text style={[styles.th, styles.tdRight, { width: W.amt }]}>Total</Text>
          </View>
          {(fixtureSchedule || []).map((fix, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdMuted, { width: W.sl }]}>{fix.slNo}</Text>
              <View style={{ width: W.desc }}>
                <Text style={styles.td}>{fix.item}</Text>
                <Text style={[styles.tdMuted, { fontSize: 6 }]}>{fix.brand} · {fix.specification}</Text>
              </View>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.qty }]}>{fix.quantity} {fix.unit}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: W.rate }]}>₹{fix.unitRate?.toLocaleString()}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: W.amt }]}>{fmt(fix.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>Section C Total — Fixtures &amp; Equipment</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>
              {fmt((fixtureSchedule || []).reduce((s, f) => s + (f.amount || 0), 0))}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Hutty QS Dossier · {refId}</Text>
          <Text>Section B &amp; C: Physical Schedules · Page 4</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 5 — SECTION D: COMMERCIALS + MILESTONE ROADMAP
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <RunHeader section="Section D: Commercial Breakdown &amp; Milestone Roadmap" />

        {/* Section D */}
        <Text style={styles.sectionTitle}>Section D — What It Costs · Trade Head Allocation &amp; Commercial Additions</Text>
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: WD.cat }]}>Trade Category</Text>
            <Text style={[styles.th, styles.tdRight, { width: WD.amt }]}>Amount (INR)</Text>
            <Text style={[styles.th, styles.tdRight, { width: WD.pct }]}>% of Total</Text>
          </View>
          {(budget?.heads || []).map((head, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.td, { width: WD.cat }]}>{head.name}</Text>
              <Text style={[styles.tdBold, styles.tdRight, { width: WD.amt }]}>{fmt(head.allocatedAmount)}</Text>
              <Text style={[styles.tdMuted, styles.tdRight, { width: WD.pct }]}>{head.percentage}%</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: WD.cat }]}>Total Estimated Project Cost (All-Inclusive)</Text>
            <Text style={[styles.totalValue, { width: WD.amt }]}>{fmt(budget?.totalProjectCost)}</Text>
            <Text style={[styles.totalValue, { width: WD.pct }]}>100.0%</Text>
          </View>
        </View>

        {/* Commercial summary cards */}
        <View style={[styles.kpiRow, { marginTop: 8 }]}>
          {[
            ['Base Construction', fmt(budget?.baseConstructionCost)],
            ['Contractor Margin', fmt(budget?.contractorMargin)],
            ['Contingency', fmt(budget?.contingency)],
            ['Professional Fees', fmt(budget?.professionalFees)],
            ['GST (5%)', fmt(budget?.gstAmount)],
          ].map(([lbl, val], i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{lbl}</Text>
              <Text style={[styles.td, { fontFamily: 'Helvetica-Bold', fontSize: 7.5 }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Milestone roadmap */}
        {Array.isArray(paymentPlan) && paymentPlan.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Milestone Disbursement Roadmap — Complete Payment Schedule</Text>
            <View>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { width: WD.cat }]}>Stage / Construction Milestone</Text>
                <Text style={[styles.th, styles.tdRight, { width: WD.amt }]}>Disbursement</Text>
                <Text style={[styles.th, styles.tdRight, { width: WD.pct }]}>Stage %</Text>
              </View>
              {paymentPlan.map((stage, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <View style={{ width: WD.cat }}>
                    <Text style={styles.td}>Stage {stage.stage}: {stage.title}</Text>
                    {stage.description ? <Text style={[styles.tdMuted, { fontSize: 6 }]}>{stage.description}</Text> : null}
                  </View>
                  <Text style={[styles.tdBold, styles.tdRight, { width: WD.amt }]}>{fmt(stage.amount)}</Text>
                  <Text style={[styles.tdMuted, styles.tdRight, { width: WD.pct }]}>{stage.percentage}%</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { width: WD.cat }]}>Total — All Milestones</Text>
                <Text style={[styles.totalValue, { width: WD.amt }]}>{fmt(budget?.totalProjectCost)}</Text>
                <Text style={[styles.totalValue, { width: WD.pct }]}>100.0%</Text>
              </View>
            </View>
          </>
        )}

        {/* Rate master metadata */}
        <View style={[styles.disclaimerBox, { marginTop: 10 }]}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 3 }}>
            RATE MASTER SOURCE &amp; ENGINE METADATA
          </Text>
          <Text style={{ fontSize: 6, color: C.grey, lineHeight: 1.4 }}>
            Dataset: {rateMeta?.datasetVersion || 'HUTTY-RM-2026.1'} · Provider: {rateMeta?.providerName || 'Hutty QS Rate Master'} · Engine: {rateMeta?.calculationEngineVersion || 'v2.6.0'} · Mode: {rateMeta?.isLive ? 'Live API Connected' : '2026-Q1 Fallback / Baseline Rates'} · GST: 5% · Basis: Bangalore Market Q1 2026
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.noticeBox}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.green, marginBottom: 3 }}>
            IMPORTANT — PRELIMINARY ESTIMATE &amp; ENGINEERING NOTICE
          </Text>
          <Text style={{ fontSize: 6, color: C.grey, lineHeight: 1.4 }}>
            · Generated using Hutty's preliminary estimation rules. Final structural &amp; electrical engineering must be by appointed consultants.{'\n'}
            · Actual quantities and costs may vary based on architectural drawings, soil conditions, construction methods, brand choices, supplier quotations, taxes, and market conditions.{'\n'}
            · Structural member sizes, foundation design, and protection schemes must be certified by qualified engineers prior to execution. This report is NOT a contractual document.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Hutty QS Dossier · {refId}</Text>
          <Text>Section D: Commercials &amp; Roadmap · Page 5</Text>
        </View>
      </Page>

    </Document>
  );
};
