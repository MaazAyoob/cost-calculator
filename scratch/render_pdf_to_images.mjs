// ==============================================================================
// PDF Visual Verification: Render PDF pages to images using Headless Chrome
// ==============================================================================

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SOURCE_DIR = path.resolve('scratch/output');
const DEST_DIR = path.resolve('docs/hutty-3.1/phase-05/pdf-renders');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function renderPdfs() {
  console.log('--- Rendering PDF Artifacts for Visual Verification ---');

  const files = [
    'Hutty_Basic_Estimate_HT-2026-VERIFY-01.pdf',
    'Hutty_Detailed_BOQ_HT-2026-VERIFY-01.pdf',
    'Hutty_Premium_BOQ_HT-2026-VERIFY-01.pdf',
  ];

  // Also copy raw PDF files to docs destination
  for (const f of files) {
    const src = path.join(SOURCE_DIR, f);
    const dest = path.join(DEST_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${f} to docs destination`);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1200,1600'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600 });

  for (const f of files) {
    const filePath = path.join(DEST_DIR, f);
    if (!fs.existsSync(filePath)) continue;

    console.log(`Rendering preview for ${f}...`);
    const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
    try {
      await page.goto(fileUrl, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 1500));
      const shotName = f.replace('.pdf', '_page1.png');
      await page.screenshot({ path: path.join(DEST_DIR, shotName) });
      console.log(`✓ Rendered ${shotName}`);
    } catch (e) {
      console.warn(`Could not render direct Chrome PDF view for ${f}:`, e.message);
    }
  }

  await browser.close();
  console.log('--- PDF Verification Rendering Finished ---');
}

renderPdfs().catch(e => {
  console.error('Render error:', e);
  process.exit(1);
});

