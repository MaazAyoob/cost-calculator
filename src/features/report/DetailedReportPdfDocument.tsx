import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CalculationResult } from '../../calculation-engine/types';

// Styles for clean architectural Hutty PDF
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1B3D34',
    backgroundColor: '#FFFFFF',
    lineHeight: 1.4,
  },
  coverPage: {
    padding: 48,
    fontFamily: 'Helvetica',
    color: '#1B3D34',
    backgroundColor: '#F8F8F6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  coverBrand: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D34',
    letterSpacing: 1,
  },
  coverBrandSub: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  coverTitleContainer: {
    marginVertical: 'auto',
  },
  coverDocType: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#F28C28',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  coverMainTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D34',
    lineHeight: 1.2,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    maxWidth: 400,
  },
  coverMetaBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coverMetaGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  coverMetaItem: {
    width: '45%',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 8,
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D34',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1B3D34',
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerLogo: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D34',
    letterSpacing: 1,
  },
  headerMeta: {
    fontSize: 8,
    color: '#4B5563',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D34',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    width: '23%',
    padding: 8,
    backgroundColor: '#F8F8F6',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  table: {
    width: '100%',
    marginVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F6',
    borderBottomWidth: 1,
    borderBottomColor: '#1B3D34',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 18,
  },
  tableRowAlt: {
    backgroundColor: '#FAFAF9',
  },
  tableColSl: { width: '6%', fontSize: 8 },
  tableColDesc: { width: '48%', fontSize: 8 },
  tableColQty: { width: '16%', textAlign: 'right', fontSize: 8 },
  tableColRate: { width: '14%', textAlign: 'right', fontSize: 8 },
  tableColAmount: { width: '16%', textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  th: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D34',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
    fontSize: 7,
    color: '#4B5563',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderTopColor: '#1B3D34',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 4,
    backgroundColor: '#F8F8F6',
  },
  disclaimerBox: {
    backgroundColor: '#F8F8F6',
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
});

export interface DetailedReportPdfProps {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
}

const formatINR = (val?: number) => {
  if (!val && val !== 0) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
};

export const DetailedReportPdfDocument: React.FC<DetailedReportPdfProps> = ({
  data,
  projectName = 'Residential Build Project',
  preparedFor = 'Valued Homeowner',
  specificationTier = 'Premium',
}) => {
  const { input, report, area, budget, boq, materialSchedule, fixtureSchedule, timeline, paymentPlan } = data;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Document title={`Hutty-Detailed-Report-${report?.projectId || '2026'}`}>
      
      {/* ── PAGE 1: COVER PAGE ── */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.coverBrand}>HUTTY</Text>
          <Text style={styles.coverBrandSub}>Residential Digital Quantity Surveying</Text>
        </View>

        <View style={styles.coverTitleContainer}>
          <Text style={styles.coverDocType}>Detailed Construction Cost &amp; BOQ Report</Text>
          <Text style={styles.coverMainTitle}>
            {input?.houseType || 'Residential Home'} &bull; {area?.totalBUASqFt?.toLocaleString() || 0} sq.ft
          </Text>
          <Text style={styles.coverSubtitle}>
            Authoritative, deterministic material takeoff, trade work breakdown, and commercial construction schedule for {input?.city || 'Bangalore'}.
          </Text>
        </View>

        <View style={styles.coverMetaBox}>
          <View style={styles.coverMetaGrid}>
            <View style={styles.coverMetaItem}>
              <Text style={styles.metaLabel}>Project Reference</Text>
              <Text style={styles.metaValue}>{report?.projectId || 'HUTTY-2026'}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.metaLabel}>Prepared For</Text>
              <Text style={styles.metaValue}>{preparedFor}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaValue}>{currentDate}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.metaLabel}>Specification Tier</Text>
              <Text style={styles.metaValue}>{specificationTier.toUpperCase()}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.metaLabel}>Total Estimated Cost</Text>
              <Text style={[styles.metaValue, { color: '#1B3D34', fontSize: 12 }]}>
                {formatINR(budget?.totalProjectCost)}
              </Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.metaLabel}>Effective Rate</Text>
              <Text style={styles.metaValue}>₹{budget?.costPerSqFt?.toLocaleString() || 0} / sq.ft</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Hutty Construction Technologies &bull; Confidential Quantity Survey</Text>
          <Text>https://hutty.in</Text>
        </View>
      </Page>

      {/* ── PAGE 2: PROJECT SUMMARY & SECTION A (WHAT WE BUILD) ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLogo}>HUTTY</Text>
            <Text style={{ fontSize: 7, color: '#4B5563' }}>Section A: Works BOQ</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text>Ref: {report?.projectId || 'HUTTY-2026'}</Text>
            <Text>Date: {currentDate}</Text>
          </View>
        </View>

        {/* Project Summary */}
        <Text style={styles.sectionTitle}>1. Project Parameters &amp; Built-Up Area</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.metaLabel}>Plot Dimensions</Text>
            <Text style={styles.metaValue}>{input?.plotLength || 0} × {input?.plotWidth || 0} ft ({area?.plotAreaSqFt?.toLocaleString() || 0} sqft)</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.metaLabel}>Built-Up Area</Text>
            <Text style={styles.metaValue}>{area?.totalBUASqFt?.toLocaleString() || 0} sq.ft</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.metaLabel}>Floors &amp; Type</Text>
            <Text style={styles.metaValue}>{input?.floors || 1} Flr &bull; {input?.houseType || 'Duplex'}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.metaLabel}>Estimated Timeline</Text>
            <Text style={styles.metaValue}>{timeline?.totalMonths || 8} Months</Text>
          </View>
        </View>

        {/* Section A: What We Build */}
        <Text style={styles.sectionTitle}>SECTION A — WHAT WE BUILD (Works BOQ)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColSl, styles.th]}>Sl</Text>
            <Text style={[styles.tableColDesc, styles.th]}>Item &amp; Activity Description</Text>
            <Text style={[styles.tableColQty, styles.th]}>Quantity</Text>
            <Text style={[styles.tableColRate, styles.th]}>Rate</Text>
            <Text style={[styles.tableColAmount, styles.th]}>Amount</Text>
          </View>

          {(boq || []).slice(0, 14).map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={styles.tableColSl}>{item.slNo}</Text>
              <Text style={styles.tableColDesc}>
                {item.description}
                {item.brand ? ` (${item.brand})` : ''}
              </Text>
              <Text style={styles.tableColQty}>{item.quantity} {item.unit}</Text>
              <Text style={styles.tableColRate}>₹{item.unitRate?.toLocaleString()}</Text>
              <Text style={styles.tableColAmount}>{formatINR(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Hutty Detailed Report &bull; Page 2</Text>
          <Text>Works BOQ &bull; Section A</Text>
        </View>
      </Page>

      {/* ── PAGE 3: SECTION B (WHAT WE CONSUME) & SECTION C (WHAT WE INSTALL) ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLogo}>HUTTY</Text>
            <Text style={{ fontSize: 7, color: '#4B5563' }}>Section B &amp; C: Materials &amp; Fixtures</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text>Ref: {report?.projectId || 'HUTTY-2026'}</Text>
            <Text>Date: {currentDate}</Text>
          </View>
        </View>

        {/* Section B: What We Consume */}
        <Text style={styles.sectionTitle}>SECTION B — WHAT WE CONSUME (Physical Materials Takeoff)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColSl, styles.th]}>Sl</Text>
            <Text style={[styles.tableColDesc, styles.th]}>Material &amp; Specification</Text>
            <Text style={[styles.tableColQty, styles.th]}>Quantity</Text>
            <Text style={[styles.tableColRate, styles.th]}>Unit Rate</Text>
            <Text style={[styles.tableColAmount, styles.th]}>Total</Text>
          </View>

          {(materialSchedule || []).map((mat, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={styles.tableColSl}>{mat.slNo}</Text>
              <Text style={styles.tableColDesc}>
                {mat.material} &bull; {mat.brand}
              </Text>
              <Text style={styles.tableColQty}>{mat.quantity?.toLocaleString()} {mat.unit}</Text>
              <Text style={styles.tableColRate}>₹{mat.unitRate?.toLocaleString()}</Text>
              <Text style={styles.tableColAmount}>{formatINR(mat.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Section C: What We Install */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          SECTION C — WHAT WE INSTALL (Fixtures &amp; Equipment Schedule)
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColSl, styles.th]}>Sl</Text>
            <Text style={[styles.tableColDesc, styles.th]}>Fixture / Equipment Item</Text>
            <Text style={[styles.tableColQty, styles.th]}>Quantity</Text>
            <Text style={[styles.tableColRate, styles.th]}>Unit Rate</Text>
            <Text style={[styles.tableColAmount, styles.th]}>Total</Text>
          </View>

          {(fixtureSchedule || []).map((fix, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={styles.tableColSl}>{fix.slNo}</Text>
              <Text style={styles.tableColDesc}>
                {fix.item} ({fix.brand})
              </Text>
              <Text style={styles.tableColQty}>{fix.quantity} {fix.unit}</Text>
              <Text style={styles.tableColRate}>₹{fix.unitRate?.toLocaleString()}</Text>
              <Text style={styles.tableColAmount}>{formatINR(fix.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Hutty Detailed Report &bull; Page 3</Text>
          <Text>Physical Schedules &bull; Sections B &amp; C</Text>
        </View>
      </Page>

      {/* ── PAGE 4: SECTION D (WHAT IT COSTS) & ASSUMPTIONS ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLogo}>HUTTY</Text>
            <Text style={{ fontSize: 7, color: '#4B5563' }}>Section D: Commercial Breakdown</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text>Ref: {report?.projectId || 'HUTTY-2026'}</Text>
            <Text>Date: {currentDate}</Text>
          </View>
        </View>

        {/* Section D: What It Costs */}
        <Text style={styles.sectionTitle}>SECTION D — WHAT IT COSTS (Trade Head Allocation)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[{ width: '50%' }, styles.th]}>Trade Category / Statutory Head</Text>
            <Text style={[{ width: '25%', textAlign: 'right' }, styles.th]}>Amount (INR)</Text>
            <Text style={[{ width: '25%', textAlign: 'right' }, styles.th]}>% of Total</Text>
          </View>

          {(budget?.heads || []).map((head, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={{ width: '50%', fontSize: 8 }}>{head.name}</Text>
              <Text style={{ width: '25%', textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                {formatINR(head.allocatedAmount)}
              </Text>
              <Text style={{ width: '25%', textAlign: 'right', fontSize: 8 }}>{head.percentage}%</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={{ width: '50%', fontFamily: 'Helvetica-Bold', fontSize: 9, textTransform: 'uppercase' }}>
              Total Estimated Project Cost
            </Text>
            <Text style={{ width: '25%', textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1B3D34' }}>
              {formatINR(budget?.totalProjectCost)}
            </Text>
            <Text style={{ width: '25%', textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 9 }}>100.0%</Text>
          </View>
        </View>

        {/* Milestone Payment Roadmap */}
        {Array.isArray(paymentPlan) && paymentPlan.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Milestone Payment Roadmap</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[{ width: '50%' }, styles.th]}>Stage / Construction Milestone</Text>
                <Text style={[{ width: '25%', textAlign: 'right' }, styles.th]}>Disbursement</Text>
                <Text style={[{ width: '25%', textAlign: 'right' }, styles.th]}>Stage %</Text>
              </View>
              {paymentPlan.slice(0, 6).map((stage, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={{ width: '50%', fontSize: 8 }}>
                    Stage {stage.stage}: {stage.title}
                  </Text>
                  <Text style={{ width: '25%', textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                    {formatINR(stage.amount)}
                  </Text>
                  <Text style={{ width: '25%', textAlign: 'right', fontSize: 8 }}>{stage.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Engineering Assumptions & Disclaimers */}
        <View style={styles.disclaimerBox}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1B3D34', marginBottom: 3 }}>
            Engineering Assumptions &amp; Disclaimers
          </Text>
          <Text style={{ fontSize: 7, color: '#4B5563', marginBottom: 2 }}>
            &bull; Estimates calculated using deterministic formula algorithms conforming to IS 456 (Plain and Reinforced Concrete), IS 1786 (High Strength Deformed Steel Bars), and Hutty Pilot Quantity Specification.
          </Text>
          <Text style={{ fontSize: 7, color: '#4B5563', marginBottom: 2 }}>
            &bull; Brand rates reflect prevailing wholesale contractor distributor indexes in Bangalore / Mysore market as of current quarter.
          </Text>
          <Text style={{ fontSize: 7, color: '#4B5563' }}>
            &bull; Final structural member sizing, rebar detailing schedules, and soil bearing capacity must be validated by a certified structural engineer before site excavation.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Hutty Detailed Report &bull; Page 4</Text>
          <Text>Total Commercials &bull; Verified Dossier</Text>
        </View>
      </Page>

    </Document>
  );
};
