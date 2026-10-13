import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CalculationResult } from '../../calculation-engine/types';

// ─────────────────────────────────────────────
// HUTTY BASIC ESTIMATE PDF — DESIGN SYSTEM
// Strict brand tokens: #1B3D34, #F28C28, #F8F8F6, #4B5563, #FFFFFF
// ─────────────────────────────────────────────
const C = {
  green: '#1B3D34',
  greenLt: '#2A5C4E',
  amber: '#F28C28',
  grey: '#4B5563',
  greyLt: '#6B7280',
  border: '#D1D5DB',
  bgAlt: '#F9FAFB',
  bgPage: '#FFFFFF',
  bgAccent: '#F0F5F3',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.green,
    backgroundColor: C.bgPage,
    lineHeight: 1.3,
  },
  // Top Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: C.green,
    paddingBottom: 14,
    marginBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 6.5,
    color: C.grey,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  metaRight: {
    textAlign: 'right',
  },
  docBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    backgroundColor: C.green,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 7,
    color: C.grey,
    marginTop: 1.5,
  },
  metaBold: {
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },

  // Hero Card
  heroCard: {
    backgroundColor: C.bgAccent,
    borderWidth: 1,
    borderColor: '#C6DDD7',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.amber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroAmount: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  heroRate: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.greenLt,
    textAlign: 'right',
  },
  heroSub: {
    fontSize: 7,
    color: C.grey,
    marginTop: 4,
  },

  // Project Specs Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gridCell: {
    width: '48.5%',
    backgroundColor: C.bgAlt,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 4,
    padding: 8,
  },
  gridLabel: {
    fontSize: 6.5,
    color: C.greyLt,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  gridNote: {
    fontSize: 6.5,
    color: C.grey,
    marginTop: 1.5,
  },

  // Section Header
  sectionHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.8,
    borderBottomColor: C.green,
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 4,
  },

  // Table
  table: {
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.green,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    backgroundColor: '#FCFDFD',
  },
  tableRowTotal: {
    flexDirection: 'row',
    backgroundColor: C.bgAccent,
    borderTopWidth: 1,
    borderTopColor: C.green,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  td: {
    fontSize: 7.5,
    color: C.grey,
  },
  tdBold: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  tdRight: {
    textAlign: 'right',
  },

  // Scope Notice
  scopeBox: {
    backgroundColor: C.bgAlt,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  scopeTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  scopeText: {
    fontSize: 6.5,
    color: C.grey,
    lineHeight: 1.35,
  },

  // Mandatory Disclaimer Box
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  disclaimerVerbatim: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#78350F',
    lineHeight: 1.35,
    marginBottom: 2,
  },
  disclaimerNote: {
    fontSize: 6,
    color: '#92400E',
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6,
    color: C.greyLt,
  },
});

function fmt(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return '₹0';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function num(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

export interface BasicEstimatePdfDocumentProps {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
}

export const BasicEstimatePdfDocument: React.FC<BasicEstimatePdfDocumentProps> = ({
  data,
  projectName = 'Residential Estimate',
  preparedFor = 'Valued Homeowner',
  specificationTier = 'Premium',
}) => {
  const { area, budget, timeline, input, report } = data;
  const projectId = report?.projectId || 'HUTTY-EST-2026';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const totalCost = budget.totalProjectCost || budget.directConstructionBudget || 0;
  const costPerSqFt = budget.costPerSqFt || budget.directCostPerSqFt || Math.round(totalCost / Math.max(1, area.totalBUASqFt));
  const materialCost = budget.directMaterialCost || Math.round(totalCost * 0.58);
  const labourCost = budget.directLabourCost || Math.round(totalCost * 0.23);
  const fixtureCost = budget.directFixtureCost || Math.round(totalCost * 0.11);
  const commercialReserves = Math.max(0, totalCost - (materialCost + labourCost + fixtureCost));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>HUTTY</Text>
            <Text style={styles.logoSub}>Residential Pre-Construction Platform</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.docBadge}>Basic Estimate Summary</Text>
            <Text style={styles.metaLine}>
              Ref: <Text style={styles.metaBold}>{projectId}</Text>
            </Text>
            <Text style={styles.metaLine}>
              Date: <Text style={styles.metaBold}>{currentDate}</Text>
            </Text>
            <Text style={styles.metaLine}>
              Client: <Text style={styles.metaBold}>{preparedFor}</Text>
            </Text>
          </View>
        </View>

        {/* Hero Budget Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Total Estimated Construction Budget</Text>
          <View style={styles.heroAmountRow}>
            <Text style={styles.heroAmount}>{fmt(totalCost)}</Text>
            <View>
              <Text style={styles.heroRate}>{fmt(costPerSqFt)} / sq.ft</Text>
              <Text style={[styles.heroSub, { textAlign: 'right' }]}>Effective Built-Up Area Rate</Text>
            </View>
          </View>
          <Text style={styles.heroSub}>
            Estimated for {projectName} ({specificationTier} specification standards in Bangalore).
          </Text>
        </View>

        {/* Project Geometry & Configuration Grid */}
        <Text style={styles.sectionHeader}>Project Configuration &amp; Scope</Text>
        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>Plot Dimensions &amp; Area</Text>
            <Text style={styles.gridValue}>
              {num(input?.plotLength || 30)}' × {num(input?.plotWidth || 40)}' ({num(area?.plotAreaSqFt || (input?.plotLength || 30) * (input?.plotWidth || 40))} sq.ft)
            </Text>
            <Text style={styles.gridNote}>Road Width: {num((input as any)?.roadWidthFt || (input as any)?.roadWidth || 30)} ft</Text>
          </View>

          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>Gross Built-Up Area (BUA)</Text>
            <Text style={styles.gridValue}>{num(area?.totalBUASqFt)} sq.ft</Text>
            <Text style={styles.gridNote}>
              Footprint: {num(area?.buaPerFloorSqFt || Math.round(area?.totalBUASqFt / Math.max(1, input?.floors || 1)))} sq.ft / floor
            </Text>
          </View>

          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>Floors &amp; House Type</Text>
            <Text style={styles.gridValue}>
              {input?.houseType || 'Residential Villa'} (G+{Math.max(0, (input?.floors || 1) - 1)})
            </Text>
            <Text style={styles.gridNote}>Estimated Execution: {timeline?.totalMonths || 8} Months</Text>
          </View>

          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>Specification Standards</Text>
            <Text style={styles.gridValue}>{specificationTier.toUpperCase()}</Text>
            <Text style={styles.gridNote}>Bangalore Q1 2026 Material Benchmark</Text>
          </View>
        </View>

        {/* High-Level Cost Breakdown Table */}
        <Text style={styles.sectionHeader}>High-Level Cost Distribution</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: '45%' }]}>Cost Component</Text>
            <Text style={[styles.th, { width: '30%' }]}>Scope Description</Text>
            <Text style={[styles.th, styles.tdRight, { width: '25%' }]}>Estimated Amount</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tdBold, { width: '45%' }]}>1. Direct Construction Materials</Text>
            <Text style={[styles.td, { width: '30%' }]}>Cement, steel rebar, sand, aggregates &amp; masonry</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>{fmt(materialCost)}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tdBold, { width: '45%' }]}>2. Direct Trade Labour</Text>
            <Text style={[styles.td, { width: '30%' }]}>Civil RCC framing, masonry, bar bending &amp; plastering</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>{fmt(labourCost)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tdBold, { width: '45%' }]}>3. Installed Fixtures &amp; Finishes</Text>
            <Text style={[styles.td, { width: '30%' }]}>Doors, windows, tiles, electrical wiring &amp; plumbing</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>{fmt(fixtureCost)}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tdBold, { width: '45%' }]}>4. Commercial Reserves &amp; Overheads</Text>
            <Text style={[styles.td, { width: '30%' }]}>Site preliminaries, supervision &amp; statutory margin</Text>
            <Text style={[styles.tdBold, styles.tdRight, { width: '25%' }]}>{fmt(commercialReserves)}</Text>
          </View>

          <View style={styles.tableRowTotal}>
            <Text style={[styles.th, { width: '45%', fontSize: 8 }]}>Total Estimated Project Cost</Text>
            <Text style={[styles.th, { width: '30%', fontSize: 7, color: C.greenLt }]}>All Inclusive Early Estimate</Text>
            <Text style={[styles.th, styles.tdRight, { width: '25%', fontSize: 9 }]}>{fmt(totalCost)}</Text>
          </View>
        </View>

        {/* Scope Notice: Distinguishes ₹99 summary from ₹499 Detailed BOQ */}
        <View style={styles.scopeBox}>
          <Text style={styles.scopeTitle}>Report Deliverables Notice</Text>
          <Text style={styles.scopeText}>
            This Basic Estimate PDF provides an executive planning summary of your preliminary project scope. It intentionally excludes item-by-item trade bills of quantities (BOQ), granular material takeoff schedules (steel tonnage, cement bag counts, sand volumes), and contractor quote audits, which are provided exclusively in the Hutty Detailed BOQ report (₹499).
          </Text>
        </View>

        {/* Mandatory Verbatim Disclaimer Box */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>IMPORTANT ESTIMATE NOTE</Text>
          <Text style={styles.disclaimerVerbatim}>
            This is an early estimate to help you plan. Final costs and quantities may change after the site, drawings and material choices are checked.
          </Text>
          <Text style={styles.disclaimerNote}>
            Estimated prices can change by location, material choices, house design, and site conditions. All rates shown are baseline estimates for residential planning and do not constitute a final binding contractor quotation or bank disbursement schedule.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hutty Pre-Construction Platform &bull; www.hutty.in &bull; Bangalore, Karnataka</Text>
          <Text style={styles.footerText}>Basic Estimate Dossier &bull; Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};
