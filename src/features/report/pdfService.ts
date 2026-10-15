import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { CalculationResult } from '../../calculation-engine/types';
import { DetailedReportPdfDocument } from './DetailedReportPdfDocument';
import { BasicEstimatePdfDocument } from './BasicEstimatePdfDocument';
import { runQAGate } from '../../calculation-engine/modules/qaGate';

export interface GeneratePdfOptions {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
  isPremium?: boolean;
}

export interface GeneratedPdfResult {
  blob: Blob;
  url: string;
  filename: string;
}

/**
 * Basic Estimate PDF Generation Engine (₹99 Product).
 * Generates a concise, executive 1-page summary of project dimensions, estimated cost,
 * high-level breakdown (materials, labour, fixtures), and statutory estimate disclaimer.
 * Excludes itemized BOQ, material takeoff schedules, and contractor audits.
 */
export async function generateBasicEstimatePdfBlob(options: GeneratePdfOptions): Promise<GeneratedPdfResult> {
  const {
    data,
    projectName = 'Hutty Residential Estimate',
    preparedFor = 'Valued Homeowner',
    specificationTier = 'Premium',
  } = options;

  const docElement = React.createElement(BasicEstimatePdfDocument, {
    data,
    projectName,
    preparedFor,
    specificationTier,
  }) as any;

  const blob = await pdf(docElement).toBlob();
  const url = URL.createObjectURL(blob);
  const rawId = data.report?.projectId || 'HT-ESTIMATE';
  const sanitizedId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Hutty_Basic_Estimate_${sanitizedId}.pdf`;

  return { blob, url, filename };
}

/**
 * Download Basic Estimate PDF (₹99 deliverable)
 */
export async function generateAndDownloadBasicEstimatePdf(options: GeneratePdfOptions): Promise<void> {
  const { url, filename } = await generateBasicEstimatePdfBlob(options);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30000);
}

/**
 * View Basic Estimate PDF in new tab
 */
export async function viewBasicEstimatePdfInNewTab(options: GeneratePdfOptions): Promise<void> {
  const { url } = await generateBasicEstimatePdfBlob(options);
  window.open(url, '_blank');

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 120000);
}

/**
 * Core PDF generation engine.
 * Single source of truth for generating the complete, bank-ready Detailed BOQ & Engineering Report.
 * Both customer downloads and developer testing actions invoke this exact function.
 */
export async function generateDetailedReportPdfBlob(options: GeneratePdfOptions): Promise<GeneratedPdfResult> {
  const {
    data,
    projectName = 'Hutty Residential Estimate',
    preparedFor = 'Valued Homeowner',
    specificationTier = 'Premium',
    isPremium = false,
  } = options;

  // ── MANDATORY AUTOMATED QA GATE (P0.7) ──
  const qaResult = data.qaResult || runQAGate(data);
  if (!qaResult.passed) {
    const errorMsg = `PDF Generation Blocked by Automated QA Gate:\n${qaResult.blockingErrors.join('\n')}`;
    console.error(errorMsg, qaResult);
    throw new Error(errorMsg);
  }

  const docElement = React.createElement(DetailedReportPdfDocument, {
    data,
    projectName,
    preparedFor,
    specificationTier,
    isPremium,
  }) as any;

  const blob = await pdf(docElement).toBlob();
  const url = URL.createObjectURL(blob);
  const rawId = data.report?.projectId || 'HT-ESTIMATE';
  const sanitizedId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = isPremium
    ? `Hutty_Premium_BOQ_${sanitizedId}.pdf`
    : `Hutty_Detailed_BOQ_${sanitizedId}.pdf`;

  return { blob, url, filename };
}

/**
 * Standard Customer/Production Full PDF Download
 */
export async function generateAndDownloadDetailedReportPdf(options: GeneratePdfOptions): Promise<void> {
  const { url, filename } = await generateDetailedReportPdfBlob(options);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30000);
}

/**
 * Developer Testing Option: View Full PDF in a new browser tab.
 * Uses the exact same document generator and QA gate pipeline as customer downloads.
 */
export async function viewDetailedReportPdfInNewTab(options: GeneratePdfOptions): Promise<void> {
  const { url } = await generateDetailedReportPdfBlob(options);
  window.open(url, '_blank');

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 120000);
}
