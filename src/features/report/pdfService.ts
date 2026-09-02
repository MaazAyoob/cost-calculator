import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { CalculationResult } from '../../calculation-engine/types';
import { DetailedReportPdfDocument } from './DetailedReportPdfDocument';
import { runQAGate } from '../../calculation-engine/modules/qaGate';

export interface GeneratePdfOptions {
  data: CalculationResult;
  projectName?: string;
  preparedFor?: string;
  specificationTier?: string;
}

export async function generateAndDownloadDetailedReportPdf(options: GeneratePdfOptions): Promise<void> {
  const { data, projectName = 'Hutty Residential Estimate', preparedFor = 'Valued Homeowner', specificationTier = 'Premium' } = options;

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
  }) as any;

  const blob = await pdf(docElement).toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const sanitizedId = (data.report?.projectId || 'HUTTY-REPORT').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `${sanitizedId}_Detailed_BOQ_Report.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 15000);
}
