const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../HUTTY_3_BROWSER_AUDIT');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPart3() {
  console.log('====================================================');
  console.log('HUTTY 3.0 — LOCALHOST BROWSER AUDIT (PART 3 - FIX)');
  console.log('Targeting: Admin Groups 01-09 with DOM click');
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

    console.log('Opening /admin and navigating through Groups 01 to 09...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await wait(1500);

    const adminGroups = [
      { prefix: '01', name: 'Project & Planning', file: '29_admin_01_project_planning.png' },
      { prefix: '02', name: 'Construction & Specs', file: '30_admin_02_construction_specs.png' },
      { prefix: '03', name: 'MEP Services', file: '31_admin_03_mep_services.png' },
      { prefix: '04', name: 'Rates & Pricing', file: '32_admin_04_rates_pricing.png' },
      { prefix: '05', name: 'Consultations', file: '33_admin_05_consultations.png' },
      { prefix: '06', name: 'Engine & Formulas', file: '34_admin_06_engine_formulas.png' },
      { prefix: '07', name: 'System & Audit', file: '35_admin_07_system_audit.png' },
      { prefix: '08', name: 'Leads & Enquiries', file: '36_admin_08_leads_enquiries.png' },
      { prefix: '09', name: 'User Management', file: '37_admin_09_user_management.png' },
    ];

    for (const g of adminGroups) {
      console.log(`Navigating to Group ${g.prefix} (${g.name})...`);
      const allButtons = await page.$$('button');
      let clicked = false;
      for (const btn of allButtons) {
        const text = await page.evaluate((el) => el.textContent.trim().replace(/\s+/g, ' '), btn);
        if (text.startsWith(g.prefix) && !text.endsWith('1') && !text.endsWith('3') && !text.endsWith('4') && !text.endsWith('5') && !text.endsWith('6') && !text.endsWith('8')) {
          console.log(`Clicking button "${text}"...`);
          await page.evaluate((el) => {
            el.scrollIntoView({ block: 'center', inline: 'center' });
            el.click();
          }, btn);
          await wait(1000);
          clicked = true;
          break;
        }
      }
      if (clicked) {
        const shot = path.join(OUTPUT_DIR, g.file);
        await page.screenshot({ path: shot, fullPage: false });
        console.log(`Saved ${g.file}`);
      } else {
        console.warn(`Could not find button for Group ${g.prefix}`);
      }
    }

    console.log('\n====================================================');
    console.log('ADMIN GROUPS 01-09 CAPTURE COMPLETE');
    console.log('====================================================\n');

  } catch (err) {
    console.error('Error during Part 3 audit:', err);
  } finally {
    await browser.close();
  }
}

runPart3();
