import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('=== PHASE 07 CALCULATOR SCREENSHOT WALKTHROUGH ===');

  const screenshotsDir = path.resolve('docs', 'hutty-3.1', 'phase-07', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Verify Vite server on port 3000
  try {
    const res = await fetch('http://localhost:3000/');
    if (!res.ok) throw new Error('Status ' + res.status);
    console.log('✓ Vite dev server is responding on http://localhost:3000/');
  } catch (err) {
    console.error('Vite server not responding on port 3000:', err.message);
    process.exit(1);
  }

  // Launch Chrome with remote debugging
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const vRes = await fetch('http://127.0.0.1:9223/json/list');
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
    console.error('Could not connect to Chrome on port 9223');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('✓ Connected to Chrome CDP on wsUrl:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const evaluate = async (code) => {
    const wrapped = `(() => {
      try {
        ${code}
      } catch (e) {
        return { __error: e.message || String(e) };
      }
    })()`;
    const res = await send('Runtime.evaluate', {
      expression: wrapped,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation exception');
    }
    return res.result ? res.result.value : null;
  };

  const setViewport = async (width, height, isMobile = false) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: isMobile ? 2 : 1,
      mobile: isMobile,
    });
    await send('Emulation.setVisibleSize', { width, height });
  };

  const captureScreenshot = async (filename) => {
    const filePath = path.join(screenshotsDir, filename);
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    const stats = fs.statSync(filePath);
    console.log(`Saved screenshot: ${filename} (${stats.size} bytes)`);
    return { name: filename, size: stats.size, path: filePath };
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const capturedManifest = [];

  try {
    // 1. STAGE 1: YOUR PLOT (Desktop 1440x900)
    await setViewport(1440, 900, false);
    await send('Page.navigate', { url: 'http://localhost:3000/calculator?stage=1' });
    await new Promise((r) => setTimeout(r, 2500));
    capturedManifest.push(await captureScreenshot('01_stage1_plot_desktop_1440.png'));

    // STAGE 1: Mobile (375x812)
    await setViewport(375, 812, true);
    await new Promise((r) => setTimeout(r, 1000));
    capturedManifest.push(await captureScreenshot('02_stage1_plot_mobile_375.png'));

    // Switch back to desktop
    await setViewport(1440, 900, false);
    await new Promise((r) => setTimeout(r, 600));

    // Advance to Stage 2: Your Home
    await evaluate(`
      const btn = document.querySelector('[data-testid="stage-next-btn"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    capturedManifest.push(await captureScreenshot('03_stage2_dream_home_desktop_1440.png'));

    // Stage 2: Mobile
    await setViewport(375, 812, true);
    await new Promise((r) => setTimeout(r, 800));
    capturedManifest.push(await captureScreenshot('04_stage2_dream_home_mobile_375.png'));

    // Switch back to desktop and advance to Stage 3: Your Rooms
    await setViewport(1440, 900, false);
    await new Promise((r) => setTimeout(r, 600));
    await evaluate(`
      const btn = document.querySelector('[data-testid="stage-next-btn"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    capturedManifest.push(await captureScreenshot('05_stage3_rooms_desktop_1440.png'));

    // Advance to Stage 4: Buildable Space
    await evaluate(`
      const btn = document.querySelector('[data-testid="stage-next-btn"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    capturedManifest.push(await captureScreenshot('06_stage4_buildable_space_desktop_1440.png'));

    // Advance to Stage 5: Core Materials
    await evaluate(`
      const btn = document.querySelector('[data-testid="stage-next-btn"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    capturedManifest.push(await captureScreenshot('07_stage5_core_materials_desktop_1440.png'));

    // Stage 5: Mobile
    await setViewport(375, 812, true);
    await new Promise((r) => setTimeout(r, 800));
    capturedManifest.push(await captureScreenshot('08_stage5_core_materials_mobile_375.png'));

    // Advance to Stage 6: Finishes (Flooring Tab)
    await setViewport(1440, 900, false);
    await new Promise((r) => setTimeout(r, 600));
    await evaluate(`
      const btn = document.querySelector('[data-testid="stage-next-btn"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    capturedManifest.push(await captureScreenshot('09_stage6_flooring_desktop_1440.png'));

    // Stage 6: Switch to Doors & Windows tab
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const doorsTab = tabs.find(b => b.innerText.includes('Doors') || b.innerText.includes('Openings'));
      if (doorsTab) doorsTab.click();
    `);
    await new Promise((r) => setTimeout(r, 1200));
    capturedManifest.push(await captureScreenshot('10_stage6_doors_windows_desktop_1440.png'));

    // Stage 6: Switch to Electrical & Plumbing tab
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const servicesTab = tabs.find(b => b.innerText.includes('Electrical') || b.innerText.includes('Services') || b.innerText.includes('Plumbing'));
      if (servicesTab) servicesTab.click();
    `);
    await new Promise((r) => setTimeout(r, 1200));
    capturedManifest.push(await captureScreenshot('11_stage6_electrical_plumbing_desktop_1440.png'));

    // Stage 6: Mobile
    await setViewport(375, 812, true);
    await new Promise((r) => setTimeout(r, 800));
    capturedManifest.push(await captureScreenshot('12_stage6_finishes_mobile_375.png'));

    // Advance to Stage 7: Review Estimate
    await setViewport(1440, 900, false);
    await new Promise((r) => setTimeout(r, 600));
    await evaluate(`
      const btn = document.querySelector('[data-testid="stage-next-btn"]');
      if (btn) btn.click();
    `);
    await new Promise((r) => setTimeout(r, 2000));
    capturedManifest.push(await captureScreenshot('13_stage7_review_estimate_desktop_1440.png'));

    // Stage 7: Mobile
    await setViewport(375, 812, true);
    await new Promise((r) => setTimeout(r, 800));
    capturedManifest.push(await captureScreenshot('14_stage7_review_estimate_mobile_375.png'));

    // Stage 8: Detailed BOQ
    await setViewport(1440, 900, false);
    await new Promise((r) => setTimeout(r, 600));
    await evaluate(`
      const boqTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BOQ Schedule') || b.innerText.includes('Detailed BOQ'));
      if (boqTab) boqTab.click();
    `);
    await new Promise((r) => setTimeout(r, 1200));
    capturedManifest.push(await captureScreenshot('15_stage8_detailed_boq_desktop_1440.png'));

    // Write manifest JSON
    const manifestPath = path.join(screenshotsDir, 'screenshot_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(capturedManifest, null, 2), 'utf-8');
    console.log(`\nSuccessfully captured ${capturedManifest.length} screenshots! Manifest: ${manifestPath}`);

  } catch (err) {
    console.error('Error during walkthrough:', err);
  } finally {
    ws.close();
    chromeProc.kill();
  }
}

main().catch(console.error);

