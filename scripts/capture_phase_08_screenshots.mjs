import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('=== PHASE 08 PRODUCT EXPERIENCE SCREENSHOT SUITE ===');

  const screenshotsDir = path.resolve('docs', 'hutty-3.1', 'phase-08', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Verify Vite server on port 3000
  try {
    const res = await fetch('http://localhost:3000/');
    if (!res.ok) throw new Error('Status ' + res.status);
    console.log('✓ Vite server is running on http://localhost:3000/');
  } catch (err) {
    console.error('Vite server not responding on port 3000:', err.message);
    process.exit(1);
  }

  // Launch Chrome headless with debugging port
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9224;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const vRes = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (vRes.ok) {
        const pages = await vRes.json();
        const page = pages.find((p) => p.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to Chrome debugging target');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('✓ Connected to Chrome CDP target:', wsUrl);

  const { WebSocket } = await import('ws');
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  let messageId = 1;
  const pendingRequests = new Map();

  ws.on('message', (raw) => {
    const data = JSON.parse(raw);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');

  async function setViewport(width, height, isMobile = false) {
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile,
    });
  }

  async function navigateTo(url) {
    await sendCommand('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 1200));
  }

  async function capture(filename) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(screenshotsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    const stats = fs.statSync(filePath);
    console.log(`[CAPTURED] ${filename} (${Math.round(stats.size / 1024)} KB)`);
  }

  try {
    // 1. Homepage Desktop
    console.log('\n--- 1. Homepage Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/');
    await new Promise((r) => setTimeout(r, 1500));
    await capture('01_homepage_hero_desktop_1440.png');

    // 2. Homepage Mobile
    console.log('\n--- 2. Homepage Mobile (375x812) ---');
    await setViewport(375, 812, true);
    await navigateTo('http://localhost:3000/');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('02_homepage_hero_mobile_375.png');

    // 3. How It Works Desktop
    console.log('\n--- 3. How It Works Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/how-it-works');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('03_how_it_works_desktop_1440.png');

    // 4. How It Works Mobile
    console.log('\n--- 4. How It Works Mobile (375x812) ---');
    await setViewport(375, 812, true);
    await navigateTo('http://localhost:3000/how-it-works');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('04_how_it_works_mobile_375.png');

    // 5. Pricing Plans Desktop
    console.log('\n--- 5. Pricing Plans Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/pricing');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('05_pricing_plans_desktop_1440.png');

    // 6. Pricing Plans Mobile
    console.log('\n--- 6. Pricing Plans Mobile (375x812) ---');
    await setViewport(375, 812, true);
    await navigateTo('http://localhost:3000/pricing');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('06_pricing_plans_mobile_375.png');

    // 7. Consultation Directory Desktop
    console.log('\n--- 7. Consultation Directory Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/consult');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('07_consultation_directory_desktop_1440.png');

    // 8. Consultation Directory Mobile
    console.log('\n--- 8. Consultation Directory Mobile (375x812) ---');
    await setViewport(375, 812, true);
    await navigateTo('http://localhost:3000/consult');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('08_consultation_directory_mobile_375.png');

    // 9. Calculator Chapter 1 Desktop
    console.log('\n--- 9. Calculator Chapter 1 Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/calculator');
    await new Promise((r) => setTimeout(r, 1500));
    await capture('09_calculator_chapter1_desktop_1440.png');

    // 10. Calculator Chapter 7 (Review & BOQ) Desktop
    console.log('\n--- 10. Calculator Chapter 7 Review Desktop (1440x900) ---');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          // Fast-track navigate to Chapter 7
          const ch7Btn = btns.find(b => b.textContent && b.textContent.includes('Final Estimate'));
          if (ch7Btn) ch7Btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1000));
    await capture('10_calculator_chapter7_review_desktop_1440.png');

    // 11. Customer Account Dashboard Desktop
    console.log('\n--- 11. Customer Portal Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/account');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('11_customer_portal_desktop_1440.png');

    // 12. Admin Portal Desktop
    console.log('\n--- 12. Admin Portal Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/admin');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('12_admin_portal_desktop_1440.png');

    // 13. 404 Not Found Page Desktop
    console.log('\n--- 13. 404 Not Found Page Desktop (1440x900) ---');
    await setViewport(1440, 900, false);
    await navigateTo('http://localhost:3000/non-existent-blueprint-page');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('13_not_found_404_desktop_1440.png');

    // 14. 404 Not Found Page Mobile
    console.log('\n--- 14. 404 Not Found Page Mobile (375x812) ---');
    await setViewport(375, 812, true);
    await navigateTo('http://localhost:3000/non-existent-blueprint-page');
    await new Promise((r) => setTimeout(r, 1000));
    await capture('14_not_found_404_mobile_375.png');

    console.log('\n✓ ALL 14 PHASE 08 SCREENSHOTS SUCCESSFULLY CAPTURED!');
  } finally {
    ws.close();
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error('Fatal error in screenshot capture:', err);
  process.exit(1);
});

