// ============================================================
// PDF REPORT GENERATOR SERVICE
// Generates styled HTML document stream ready for PDF printing
// ============================================================

export function generatePDFHTML(projectData: any): string {
  const { name = 'Dream Home Villa', city = 'Bangalore', totalCost = 9405000, bua = 3850, qualityTier = 'Premium', boq = [], paymentPlan = [] } = projectData;

  const formattedCost = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalCost);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Executive Construction Report - ${name}</title>
  <style>
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; }
    .badge { background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; borderRadius: 6px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
    .card-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .card-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .card-val.highlight { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .footer { margin-top: 40px; pt: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">COST CALCULATOR</div>
      <div style="font-size: 12px; color: #64748b;">Home Construction Planning & Engineering Platform</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">DETAILED CONSTRUCTION ESTIMATE & BOQ</span>
      <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Generated: ${new Date().toLocaleDateString('en-IN')}</div>
    </div>
  </div>

  <h2 style="font-size: 16px; color: #1e293b; margin-bottom: 15px;">Executive Project Summary</h2>
  <div class="grid">
    <div class="card">
      <div class="card-label">Project Name</div>
      <div class="card-val" style="font-size: 14px;">${name}</div>
    </div>
    <div class="card">
      <div class="card-label">Location</div>
      <div class="card-val" style="font-size: 14px;">${city}</div>
    </div>
    <div class="card">
      <div class="card-label">Built-Up Area</div>
      <div class="card-val">${bua.toLocaleString('en-IN')} <span style="font-size: 12px; color: #64748b;">Sq Ft</span></div>
    </div>
    <div class="card">
      <div class="card-label">Total Estimated Cost</div>
      <div class="card-val highlight">${formattedCost}</div>
    </div>
  </div>

  <h2 style="font-size: 16px; color: #1e293b; margin-top: 30px; margin-bottom: 10px;">Itemized Bill of Quantities (BOQ Summary)</h2>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th>Unit</th>
        <th class="text-right">Unit Rate (₹)</th>
        <th class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${boq.length > 0 ? boq.slice(0, 10).map((item: any) => `
        <tr>
          <td style="font-family: monospace; color: #64748b;">${item.code}</td>
          <td style="font-weight: 600;">${item.description}</td>
          <td class="text-right">${item.quantity.toLocaleString('en-IN')}</td>
          <td>${item.unit}</td>
          <td class="text-right">₹${item.unitRate.toLocaleString('en-IN')}</td>
          <td class="text-right" style="font-weight: 700; color: #0f172a;">₹${item.amount.toLocaleString('en-IN')}</td>
        </tr>
      `).join('') : `
        <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">Full BOQ schedule attached in detailed annexure</td></tr>
      `}
    </tbody>
  </table>

  <div class="footer">
    <span>Cost Calculator Deterministic Engineering Engine v1.0</span>
    <span>Aligned with IS 456 & NBC 2016 Engineering Standards</span>
  </div>
</body>
</html>
  `;
}
