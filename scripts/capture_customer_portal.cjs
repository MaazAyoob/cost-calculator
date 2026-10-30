const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../HUTTY_3_BROWSER_AUDIT');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkMDU0ZDUwLTRkM2ItNDk5OC1hNzZjLTE5YzY1YmJjNzViZCIsImVtYWlsIjoiZGVtb0BodXR0eS5pbiIsInJvbGUiOiJVU0VSIiwibmFtZSI6IlByaXlhIFNoYXJtYSIsImlhdCI6MTc5MzM1ODU1OSwiZXhwIjoxNzkzOTYzMzU5fQ.wpxMQtzWmwRTK4t1jFx1ZlCEZ5SZTyA4a79VxNPD0RA';

const VALID_USER = {
  id: '0d054d50-4d3b-4998-a76c-19c65bbc75bd',
  name: 'Priya Sharma',
  email: 'demo@hutty.in',
  phone: '+919876543210',
  role: 'CUSTOMER',
  createdAt: new Date().toISOString(),
  phoneVerified: true,
};

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function injectRealAuth(page) {
  await page.evaluate((token, user) => {
    const authState = {
      state: {
        token,
        user,
        isAuthenticated: true,
      },
      version: 0,
    };
    localStorage.setItem('hutty_customer_auth', JSON.stringify(authState));
    localStorage.setItem('cost_calculator_report_lead_v1', JSON.stringify({
      name: user.name,
      email: user.email,
      phone: user.phone,
    }));
  }, VALID_TOKEN, VALID_USER);
}

async function capturePortal() {
  console.log('====================================================');
  console.log('CAPTURING AUTHENTICATED CUSTOMER PORTAL VIEWS');
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

    // Seed localStorage on root
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await injectRealAuth(page);
    await wait(500);

    // 1. Customer Account Tabs
    const tabs = [
      { tab: 'projects', file: '23_customer_account_projects.png', title: 'Projects' },
      { tab: 'reports', file: '24_customer_account_reports.png', title: 'Reports' },
      { tab: 'purchases', file: '25_customer_account_purchases.png', title: 'Purchases' },
      { tab: 'consultations', file: '26_customer_account_consultations.png', title: 'Consultations' },
      { tab: 'profile', file: '27_customer_account_profile.png', title: 'Profile' },
    ];

    for (const t of tabs) {
      console.log(`Auditing Customer Portal Tab: ${t.title}...`);
      await page.goto(`${BASE_URL}/account?tab=${t.tab}`, { waitUntil: 'domcontentloaded' });
      await wait(1500);
      const shot = path.join(OUTPUT_DIR, t.file);
      await page.screenshot({ path: shot, fullPage: false });
      console.log(`Saved ${t.file}`);
    }

    // 2. Pre-construction Dossier Report
    console.log('\nAuditing Pre-construction Dossier Report (/report)...');
    await page.goto(`${BASE_URL}/report`, { waitUntil: 'domcontentloaded' });
    await wait(1800);
    const repShot = path.join(OUTPUT_DIR, '21_dossier_report_page.png');
    await page.screenshot({ path: repShot, fullPage: false });
    console.log('Saved 21_dossier_report_page.png');

    // 3. Customer Project Dashboard
    console.log('\nAuditing Customer Project Dashboard (/dashboard)...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await wait(1500);
    const dashShot = path.join(OUTPUT_DIR, '39_customer_project_dashboard.png');
    await page.screenshot({ path: dashShot, fullPage: false });
    console.log('Saved 39_customer_project_dashboard.png');

    // 4. Customer Settings
    console.log('\nAuditing Customer Settings (/settings)...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'domcontentloaded' });
    await wait(1200);
    const setShot = path.join(OUTPUT_DIR, '40_customer_settings.png');
    await page.screenshot({ path: setShot, fullPage: false });
    console.log('Saved 40_customer_settings.png');

    console.log('\n====================================================');
    console.log('CUSTOMER PORTAL CAPTURES COMPLETED SUCCESSFULLY');
    console.log('====================================================\n');

  } catch (err) {
    console.error('Error in capturePortal:', err);
  } finally {
    await browser.close();
  }
}

capturePortal();

