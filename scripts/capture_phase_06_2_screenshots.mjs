import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function run() {
  const screenshotsDir = path.resolve('docs', 'hutty-3.1', 'phase-06', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const targets = [
    { name: '01_landing_hero_desktop_1440.png', url: 'http://localhost:3000/', width: 1440, height: 900 },
    { name: '02_landing_hero_mobile_375.png', url: 'http://localhost:3000/', width: 375, height: 812 },
    { name: '03_landing_how_it_works_desktop.png', url: 'http://localhost:3000/#how-it-works', width: 1440, height: 900 },
    { name: '04_landing_demo_estimator_desktop.png', url: 'http://localhost:3000/#demo', width: 1440, height: 900 },
    { name: '05_landing_why_hutty_desktop.png', url: 'http://localhost:3000/#why-planning', width: 1440, height: 900 },
    { name: '06_landing_engineering_standards_desktop.png', url: 'http://localhost:3000/#standards', width: 1440, height: 900 },
    { name: '07_pricing_page_desktop.png', url: 'http://localhost:3000/pricing', width: 1440, height: 900 },
    { name: '08_pricing_page_mobile.png', url: 'http://localhost:3000/pricing', width: 375, height: 812 },
    { name: '09_consultation_page_desktop.png', url: 'http://localhost:3000/consult', width: 1440, height: 900 },
    { name: '10_calculator_stage1_desktop.png', url: 'http://localhost:3000/calculator', width: 1440, height: 900 },
    { name: '11_calculator_stage1_mobile.png', url: 'http://localhost:3000/calculator', width: 375, height: 812 },
  ];

  const results = [];

  for (const t of targets) {
    const outFile = path.join(screenshotsDir, t.name);
    console.log(`Capturing [${t.name}] (${t.width}x${t.height}) from ${t.url}...`);

    const chromeArgs = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      `--window-size=${t.width},${t.height}`,
      `--screenshot=${outFile}`,
      '--virtual-time-budget=3000',
      t.url,
    ];

    const proc = spawnSync(chromePath, chromeArgs, { stdio: 'ignore', timeout: 15000 });
    const exists = fs.existsSync(outFile);
    const size = exists ? fs.statSync(outFile).size : 0;
    console.log(` -> Result: ${exists ? 'OK' : 'FAILED'} (size: ${size} bytes)`);

    results.push({
      target: t.name,
      url: t.url,
      width: t.width,
      height: t.height,
      success: exists && size > 500,
      sizeBytes: size,
    });
  }

  const summaryFile = path.join(screenshotsDir, 'screenshot_manifest.json');
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nFinished capturing screenshots! Manifest: ${summaryFile}`);
  console.log(`Success: ${results.filter(r => r.success).length}/${results.length}`);
}

run().catch(console.error);

