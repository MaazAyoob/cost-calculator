import { Request, Response } from 'express';
import { pricingService } from '../services/pricing.service';
import { generatePDFHTML } from '../services/pdf.service';
import { generateBOQCSV, generateMaterialCSV } from '../services/csv.service';
import { generateExcelWorkbook } from '../services/excel.service';

/**
 * Validates backend entitlement before allowing any report or BOQ downloads.
 * Strictly prevents unauthenticated/unpurchased access to paid construction deliverables.
 * Differentiates between ₹99 Basic Estimate PDF and ₹499/₹1,499 Detailed BOQ downloads.
 */
async function verifyDownloadEntitlement(
  req: Request,
  requiredType: 'basic' | 'detailed' = 'detailed'
): Promise<{ authorized: boolean; reason?: string }> {
  const userId = (req as any).user?.id || null;
  const userEmail = (req.query.email as string) || (req as any).user?.email || null;
  const projectId = (req.query.projectId as string) || (req.query.project as string) || null;
  const orderRef = (req.query.orderRef as string) || (req.query.orderId as string) || null;

  // 1. If basic PDF is requested (₹99 or higher)
  if (requiredType === 'basic') {
    if (projectId || userId || userEmail) {
      const hasBasic = await pricingService.canAccessFeature('BASIC_PDF_DOWNLOAD', userId, userEmail, projectId);
      const hasFull = await pricingService.canAccessFeature('FULL_PDF_REPORT', userId, userEmail, projectId);
      const hasReportDownload = await pricingService.canAccessFeature('REPORT_DOWNLOAD', userId, userEmail, projectId);
      if (hasBasic || hasFull || hasReportDownload) {
        return { authorized: true };
      }
    }

    if (orderRef) {
      const purchase = await pricingService.getPurchaseByPublicReference(orderRef);
      if (purchase && purchase.status === 'PAID') {
        // Enforce project and user integrity to prevent IDOR / cross-user access
        if (projectId && purchase.projectId && purchase.projectId !== projectId) {
          return { authorized: false, reason: 'Purchase record does not match the requested project ID.' };
        }
        if (userId && purchase.userId && purchase.userId !== userId) {
          return { authorized: false, reason: 'Purchase record does not match the authenticated user.' };
        }
        if (userEmail && purchase.leadEmail && purchase.leadEmail.toLowerCase() !== userEmail.toLowerCase()) {
          return { authorized: false, reason: 'Purchase record does not match the provided customer email.' };
        }

        const tier = await pricingService.getTierById(purchase.tierId);
        if (
          tier &&
          (tier.code === 'BASIC_ESTIMATE_PDF' ||
            tier.code === 'ESTIMATE_99' ||
            tier.code === 'DETAILED_ESTIMATE_499' ||
            tier.code === 'PREMIUM_1499')
        ) {
          return { authorized: true };
        }
      }
    }

    return {
      authorized: false,
      reason: 'Valid entitlement required. Please unlock the Basic Estimate PDF (₹99) or Detailed BOQ (₹499) to download.',
    };
  }

  // 2. Detailed construction deliverables (Full BOQ PDF, Material/Works CSV, Excel)
  if (projectId || userId || userEmail) {
    const hasReportDownload = await pricingService.canAccessFeature('REPORT_DOWNLOAD', userId, userEmail, projectId);
    const hasFullPdf = await pricingService.canAccessFeature('FULL_PDF_REPORT', userId, userEmail, projectId);
    if (hasReportDownload || hasFullPdf) {
      return { authorized: true };
    }
  }

  if (orderRef) {
    const purchase = await pricingService.getPurchaseByPublicReference(orderRef);
    if (purchase && purchase.status === 'PAID') {
      // Cross-user / cross-project integrity check
      if (projectId && purchase.projectId && purchase.projectId !== projectId) {
        return { authorized: false, reason: 'Purchase record does not match the requested project ID.' };
      }
      if (userId && purchase.userId && purchase.userId !== userId) {
        return { authorized: false, reason: 'Purchase record does not match the authenticated user.' };
      }
      if (userEmail && purchase.leadEmail && purchase.leadEmail.toLowerCase() !== userEmail.toLowerCase()) {
        return { authorized: false, reason: 'Purchase record does not match the provided customer email.' };
      }

      const tier = await pricingService.getTierById(purchase.tierId);
      if (tier && (tier.code === 'DETAILED_ESTIMATE_499' || tier.code === 'PREMIUM_1499')) {
        return { authorized: true };
      }
      if (tier && (tier.code === 'BASIC_ESTIMATE_PDF' || tier.code === 'ESTIMATE_99')) {
        return {
          authorized: false,
          reason: 'A ₹99 purchase entitles you to the Basic Estimate PDF summary only. Please unlock Detailed BOQ (₹499) or Premium BOQ (₹1,499) to download detailed BOQ, material takeoff, CSV, or Excel schedules.',
        };
      }
    }
  }

  return {
    authorized: false,
    reason: 'Paid entitlement required. Please unlock Detailed BOQ (₹499) or Premium BOQ (₹1,499) to download this report.',
  };
}

export async function downloadPDF(req: Request, res: Response) {
  const isBasic = req.query.type === 'basic' || req.query.reportType === 'basic';
  const auth = await verifyDownloadEntitlement(req, isBasic ? 'basic' : 'detailed');
  if (!auth.authorized) {
    res.status(403).json({
      success: false,
      error: 'UNAUTHORIZED_REPORT_ACCESS',
      message: auth.reason,
    });
    return;
  }

  const sampleData = {
    name: req.query.name || 'Dream Home Villa',
    city: req.query.city || 'Bangalore',
    totalCost: 9405000,
    bua: 3850,
  };

  const html = generatePDFHTML(sampleData);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', 'inline; filename="cost-calculator-construction-report.html"');
  res.send(html);
}

export async function downloadCSV(req: Request, res: Response) {
  const auth = await verifyDownloadEntitlement(req);
  if (!auth.authorized) {
    res.status(403).json({
      success: false,
      error: 'UNAUTHORIZED_REPORT_ACCESS',
      message: auth.reason,
    });
    return;
  }

  const type = req.query.type || 'boq';

  if (type === 'materials') {
    const mockMaterials = [
      { category: 'Structure', name: 'TMT Steel Fe 550D', brand: 'Tata Tiscon', estimatedQuantity: 18.5, unit: 'Tonnes', ratePerUnit: 64000, totalCost: 1184000 },
      { category: 'Structure', name: 'OPC 53 Cement', brand: 'UltraTech', estimatedQuantity: 1450, unit: 'Bags', ratePerUnit: 420, totalCost: 609000 },
    ];
    const csv = generateMaterialCSV(mockMaterials);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cost-calculator-materials.csv"');
    return res.send(csv);
  }

  const mockBOQ = [
    { code: 'SP-001', category: 'Site Prep', description: 'Topsoil Clearing & Land Demarcation', unit: 'Sq Ft', quantity: 2400, unitRate: 30, amount: 72000, brand: 'Total Station' },
    { code: 'FD-001', category: 'Foundation', description: 'PCC M10 Bed below Footings', unit: 'Cu M', quantity: 15, unitRate: 3200, amount: 48000, brand: 'UltraTech OPC 53' },
  ];
  const csv = generateBOQCSV(mockBOQ);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="cost-calculator-boq.csv"');
  return res.send(csv);
}

export async function downloadExcel(req: Request, res: Response) {
  const auth = await verifyDownloadEntitlement(req);
  if (!auth.authorized) {
    res.status(403).json({
      success: false,
      error: 'UNAUTHORIZED_REPORT_ACCESS',
      message: auth.reason,
    });
    return;
  }

  const mockBOQ = [
    { code: 'SP-001', category: 'Site Prep', description: 'Topsoil Clearing & Land Demarcation', unit: 'Sq Ft', quantity: 2400, unitRate: 30, amount: 72000, brand: 'Total Station' },
  ];
  const mockHeads = [
    { name: 'Foundation & Structure', percentage: 40, allocatedAmount: 3762000 },
    { name: 'Masonry', percentage: 8, allocatedAmount: 752400 },
  ];

  const excelContent = generateExcelWorkbook(mockBOQ, mockHeads);
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', 'attachment; filename="cost-calculator-construction-boq.xls"');
  res.send(excelContent);
}
