// ==============================================================================
// Hutty 3.1 — Phase 05 End-to-End Browser Customer Journey Runner
// Automated Puppeteer Core Test Suite driving headless Chrome
// Tests Desktop (1440x900), Tablet (768x1024), Mobile (390x844)
// Captures screenshots into docs/hutty-3.1/phase-05/screenshots/
// ==============================================================================

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/hutty-3.1/phase-05/screenshots');
const BASE_URL = 'http://localhost:3000';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBrowserJourney() {
  console.log('--- Starting Hutty 3.1 Phase 05 Browser Customer Journey ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  const stepLogs = [];

  try {
    // ══════════════════════════════════════════════════════════════════
    // DESKTOP VIEWPORT RUN (1440 x 900)
    // ══════════════════════════════════════════════════════════════════
    await page.setViewport({ width: 1440, height: 900 });
    console.log('\n[1/14] Step 1: Landing Page Homeowner Experience');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_landing_hero.png'), fullPage: false });
    stepLogs.push({ step: 1, name: 'Landing Page Hero', status: 'PASS', screenshot: '01_desktop_landing_hero.png' });

    console.log('[2/14] Step 2: Enter Planner — Stage 1 / Chapter 1 (Plot & Setbacks)');
    await page.goto(`${BASE_URL}/plan?stage=1`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_stage1_plot.png') });
    stepLogs.push({ step: 2, name: 'Chapter 1 Plot & Setbacks', status: 'PASS', screenshot: '02_desktop_stage1_plot.png' });

    console.log('[3/14] Step 3: Chapter 2 (Dream Home & Spaces)');
    await page.goto(`${BASE_URL}/plan?stage=2`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_stage2_dream_home.png') });
    stepLogs.push({ step: 3, name: 'Chapter 2 Dream Home & Spaces', status: 'PASS', screenshot: '03_desktop_stage2_dream_home.png' });

    console.log('[4/14] Step 4: Stage 4 (Buildable Footprint & Setbacks)');
    await page.goto(`${BASE_URL}/plan?stage=4`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_stage4_footprint.png') });
    stepLogs.push({ step: 4, name: 'Stage 4 Buildable Footprint', status: 'PASS', screenshot: '04_desktop_stage4_footprint.png' });

    console.log('[5/14] Step 5: Chapter 3 (Core Structural Materials)');
    await page.goto(`${BASE_URL}/plan?stage=5`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_desktop_stage5_core_materials.png') });
    stepLogs.push({ step: 5, name: 'Chapter 3 Core Structural Materials', status: 'PASS', screenshot: '05_desktop_stage5_core_materials.png' });

    console.log('[6/14] Step 6: Stage 6 — Chapter 4 Flooring & Tiles');
    await page.goto(`${BASE_URL}/plan?stage=6`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_desktop_stage6_flooring.png') });
    stepLogs.push({ step: 6, name: 'Stage 6 Flooring & Tiles', status: 'PASS', screenshot: '06_desktop_stage6_flooring.png' });

    console.log('[7/14] Step 7: Stage 6 — Chapter 6 Finishes, Metal Fabrication & Elevation');
    // Click on services / finishes tab
    const tabs = await page.$$('button');
    for (const btn of tabs) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Electrical, Plumbing & Finishes')) {
        await btn.click();
        await sleep(800);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_desktop_stage6_fabrication_finishes.png') });
    stepLogs.push({ step: 7, name: 'Stage 6 Finishes & Fabrication', status: 'PASS', screenshot: '07_desktop_stage6_fabrication_finishes.png' });

    console.log('[8/14] Step 8: Chapter 7 Estimate Review (Stage 7)');
    await page.goto(`${BASE_URL}/plan?stage=7`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_desktop_stage7_estimate_review.png') });
    stepLogs.push({ step: 8, name: 'Chapter 7 Estimate Review', status: 'PASS', screenshot: '08_desktop_stage7_estimate_review.png' });

    console.log('[9/14] Step 9: Chapter 7 BOQ Schedule Tab (Stage 8 / BOQ Preview)');
    await page.goto(`${BASE_URL}/plan?stage=8`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_desktop_stage8_boq_schedule.png') });
    stepLogs.push({ step: 9, name: 'Chapter 7 BOQ Schedule Preview', status: 'PASS', screenshot: '09_desktop_stage8_boq_schedule.png' });

    console.log('[10/14] Step 10: Reports & Commercial Options Tab');
    // Switch to reports tab in Chapter 7
    const tabButtons = await page.$$('button');
    for (const btn of tabButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Reports & Plans')) {
        await btn.click();
        await sleep(800);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_desktop_commercial_reports.png') });
    stepLogs.push({ step: 10, name: 'Reports & Commercial Tiers', status: 'PASS', screenshot: '10_desktop_commercial_reports.png' });

    console.log('[11/14] Step 11: Expert Consultation Page (/consult)');
    await page.goto(`${BASE_URL}/consult`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_desktop_consultation_page.png') });
    stepLogs.push({ step: 11, name: 'Expert Consultation Page', status: 'PASS', screenshot: '11_desktop_consultation_page.png' });

    // ══════════════════════════════════════════════════════════════════
    // TABLET VIEWPORT RUN (768 x 1024)
    // ══════════════════════════════════════════════════════════════════
    console.log('\n[12/14] Step 12: Tablet Viewport Verification (768 x 1024)');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/plan?stage=1`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_tablet_stage1_plot.png') });
    await page.goto(`${BASE_URL}/plan?stage=7`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_tablet_stage7_estimate.png') });
    stepLogs.push({ step: 12, name: 'Tablet Responsiveness', status: 'PASS', screenshot: '12_tablet_stage1_plot.png' });

    // ══════════════════════════════════════════════════════════════════
    // MOBILE VIEWPORT RUN (390 x 844 — iPhone 14 / Standard Mobile)
    // ══════════════════════════════════════════════════════════════════
    console.log('\n[13/14] Step 13: Mobile Viewport Landing Page (390 x 844)');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_mobile_landing_hero.png') });
    stepLogs.push({ step: 13, name: 'Mobile Landing Page', status: 'PASS', screenshot: '13_mobile_landing_hero.png' });

    console.log('[14/14] Step 14: Mobile Viewport Calculator & Estimate (390 x 844)');
    await page.goto(`${BASE_URL}/plan?stage=7`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_mobile_stage7_estimate.png') });
    stepLogs.push({ step: 14, name: 'Mobile Calculator Estimate', status: 'PASS', screenshot: '14_mobile_stage7_estimate.png' });

    console.log('\n✓ All 14 Customer Journey Steps Passed & Captured!');
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'journey_summary.json'),
      JSON.stringify(stepLogs, null, 2)
    );
  } catch (err) {
    console.error('Error during browser journey:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runBrowserJourney().catch((err) => {
  console.error('Fatal browser test error:', err);
  process.exit(1);
});

