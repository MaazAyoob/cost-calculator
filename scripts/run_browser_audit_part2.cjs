const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../HUTTY_3_BROWSER_AUDIT');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function injectCustomerAuth(page) {
  await page.evaluate(() => {
    const authState = {
      state: {
        token: 'dev_jwt_token_demo_usr_001',
        user: {
          id: 'usr_demo_001',
          name: 'Priya Sharma',
          email: 'demo@hutty.in',
          phone: '+91 98765 43210',
          role: 'CUSTOMER',
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: true,
      },
      version: 0,
    };
    localStorage.setItem('hutty_customer_auth', JSON.stringify(authState));
    localStorage.setItem('cost_calculator_report_lead_v1', JSON.stringify({
      name: 'Priya Sharma',
      email: 'demo@hutty.in',
      phone: '+91 98765 43210',
    }));
  });
}

async function runPart2() {
  console.log('====================================================');
  console.log('HUTTY 3.0 — LOCALHOST BROWSER AUDIT (PART 2)');
  console.log('Targeting: Stage 8, Report, Consultation, Account, Admin');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. CALCULATOR STAGE 8 DETAILED BOQ
    console.log('--- Step 1: Navigating to Calculator and advancing to Stage 8 ---');
    await page.goto(`${BASE_URL}/planner`, { waitUntil: 'domcontentloaded' });
    await wait(1500);

    // Fast-jump to stage 7 or step through
    console.log('Jumping to Stage 7 (Estimate)...');
    const jumpBtn = await page.$('button[title*="Jump directly"]');
    if (jumpBtn) {
      await jumpBtn.click();
      await wait(1200);
    } else {
      // Step through stages 1 to 6
      for (let s = 1; s <= 6; s++) {
        await page.waitForSelector('[data-testid="stage-next-btn"]', { timeout: 5000 });
        await page.click('[data-testid="stage-next-btn"]');
        await wait(600);
      }
    }

    // Now on Stage 7: Click "View Detailed BOQ & Reports"
    console.log('Clicking "View Detailed BOQ & Reports" on Stage 7...');
    await wait(800);
    const buttons = await page.$$('button');
    let boqClicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('View Detailed BOQ')) {
        await btn.click();
        await wait(1500);
        boqClicked = true;
        break;
      }
    }

    if (boqClicked) {
      console.log('Stage 8 (Detailed BOQ) reached successfully.');
      const s8Shot = path.join(OUTPUT_DIR, '20_calculator_stage8_detailed_boq.png');
      await page.screenshot({ path: s8Shot, fullPage: false });
      console.log('Saved 20_calculator_stage8_detailed_boq.png');
    }

    // 2. PRE-CONSTRUCTION DOSSIER REPORT (/report)
    console.log('\n--- Step 2: Pre-construction Dossier Report (/report) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await injectCustomerAuth(page);
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'domcontentloaded' });
    await wait(1500);

    const reportShot = path.join(OUTPUT_DIR, '21_dossier_report_page.png');
    await page.screenshot({ path: reportShot, fullPage: false });
    console.log('Saved 21_dossier_report_page.png');

    // 3. CONSULTATION BOOKING MODAL (/consult)
    console.log('\n--- Step 3: Consultation Directory & Booking Modal ---');
    await page.goto(`${BASE_URL}/consult`, { waitUntil: 'domcontentloaded' });
    await wait(1200);

    const consultButtons = await page.$$('button');
    let consultModalOpen = false;
    for (const btn of consultButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && (text.includes('Book Consultation') || text.includes('Schedule Review') || text.includes('Book Slot'))) {
        await btn.click();
        await wait(1000);
        consultModalOpen = true;
        break;
      }
    }

    if (consultModalOpen) {
      const modalShot = path.join(OUTPUT_DIR, '22_consultation_booking_modal.png');
      await page.screenshot({ path: modalShot, fullPage: false });
      console.log('Saved 22_consultation_booking_modal.png');
    }

    // 4. CUSTOMER ACCOUNT PORTAL TABS
    console.log('\n--- Step 4: Customer Account Dashboard Tabs ---');
    const accountTabs = [
      { tab: 'projects', file: '23_customer_account_projects.png', title: 'Projects' },
      { tab: 'reports', file: '24_customer_account_reports.png', title: 'Reports' },
      { tab: 'purchases', file: '25_customer_account_purchases.png', title: 'Purchases' },
      { tab: 'consultations', file: '26_customer_account_consultations.png', title: 'Consultations' },
      { tab: 'profile', file: '27_customer_account_profile.png', title: 'Profile' },
    ];

    for (const t of accountTabs) {
      console.log(`Auditing Customer Tab: ${t.title} (/account?tab=${t.tab})...`);
      await page.goto(`${BASE_URL}/account?tab=${t.tab}`, { waitUntil: 'domcontentloaded' });
      await wait(1000);
      const shot = path.join(OUTPUT_DIR, t.file);
      await page.screenshot({ path: shot, fullPage: false });
      console.log(`Saved ${t.file}`);
    }

    // 5. ADMIN CONTROL CENTER (10 GROUPS)
    console.log('\n--- Step 5: Admin Control Center 10 Groups ---');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await wait(1500);

    // Group 00 Overview
    const a00Shot = path.join(OUTPUT_DIR, '28_admin_00_overview.png');
    await page.screenshot({ path: a00Shot, fullPage: false });
    console.log('Saved 28_admin_00_overview.png');

    const adminGroupsToVisit = [
      { num: '01', name: 'Project & Planning', file: '29_admin_01_project_planning.png' },
      { num: '02', name: 'Construction & Specs', file: '30_admin_02_construction_specs.png' },
      { num: '03', name: 'MEP Services', file: '31_admin_03_mep_services.png' },
      { num: '04', name: 'Rates & Pricing', file: '32_admin_04_rates_pricing.png' },
      { num: '05', name: 'Consultations', file: '33_admin_05_consultations.png' },
      { num: '06', name: 'Engine & Formulas', file: '34_admin_06_engine_formulas.png' },
      { num: '07', name: 'System & Audit', file: '35_admin_07_system_audit.png' },
      { num: '08', name: 'Leads & Enquiries', file: '36_admin_08_leads_enquiries.png' },
      { num: '09', name: 'User Management', file: '37_admin_09_user_management.png' },
    ];

    for (const g of adminGroupsToVisit) {
      console.log(`Navigating to Admin Group ${g.num} (${g.name})...`);
      const allButtons = await page.$$('button');
      let found = false;
      for (const btn of allButtons) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text && (text.includes(g.name) || (text.includes(g.num) && text.includes(g.name.split(' ')[0])))) {
          await btn.click();
          await wait(800);
          found = true;
          break;
        }
      }
      if (found) {
        const shot = path.join(OUTPUT_DIR, g.file);
        await page.screenshot({ path: shot, fullPage: false });
        console.log(`Saved ${g.file}`);
      } else {
        console.warn(`Could not find button for Admin Group ${g.num}`);
      }
    }

    // Admin Mobile Viewport (390x844)
    console.log('\n--- Step 6: Admin Mobile Viewport (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await wait(800);
    const adminMobShot = path.join(OUTPUT_DIR, '38_admin_mobile_layout.png');
    await page.screenshot({ path: adminMobShot, fullPage: false });
    console.log('Saved 38_admin_mobile_layout.png');

    console.log('\n====================================================');
    console.log('PART 2 AUDIT COMPLETE');
    console.log('====================================================\n');

  } catch (err) {
    console.error('Error in part 2 audit:', err);
  } finally {
    await browser.close();
  }
}

runPart2();

