import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function run() {
  const screenshotsDir = path.resolve('artifacts', 'hutty-2-verification-screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('Starting Vite preview server on port 4173...');
  const viteBin = path.resolve('node_modules', 'vite', 'bin', 'vite.js');
  const preview = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    stdio: 'pipe'
  });

  preview.stdout.on('data', d => console.log('vite stdout:', d.toString().trim()));
  preview.stderr.on('data', d => console.error('vite stderr:', d.toString().trim()));

  // Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch('http://127.0.0.1:4173/');
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (e) {}
  }

  if (!serverReady) {
    console.error('ERROR: Preview server failed to respond on http://127.0.0.1:4173/');
    if (preview.pid) {
      spawnSync('taskkill', ['/F', '/T', '/PID', preview.pid.toString()], { shell: true });
    }
    process.exit(1);
  }

  console.log('Preview server is up and listening!');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const targets = [
    { name: '01_homepage_desktop.png', url: 'http://127.0.0.1:4173/', width: 1280, height: 800 },
    { name: '02_homepage_mobile.png', url: 'http://127.0.0.1:4173/', width: 390, height: 844 },
    { name: '03_how_it_works.png', url: 'http://127.0.0.1:4173/how-it-works', width: 1280, height: 800 },
    { name: '04_pricing_page.png', url: 'http://127.0.0.1:4173/pricing', width: 1280, height: 800 },
    { name: '05_consultation_page.png', url: 'http://127.0.0.1:4173/consult', width: 1280, height: 800 },
    { name: '06_login_page.png', url: 'http://127.0.0.1:4173/login', width: 1280, height: 800 },
    { name: '07_signup_page.png', url: 'http://127.0.0.1:4173/signup', width: 1280, height: 800 },
    { name: '08_stage1_plot.png', url: 'http://127.0.0.1:4173/calculator?stage=1', width: 1280, height: 800 },
    { name: '09_stage1_details_open.png', url: 'http://127.0.0.1:4173/calculator?stage=1&details=open', width: 1280, height: 800 },
    { name: '10_stage2_home.png', url: 'http://127.0.0.1:4173/calculator?stage=2', width: 1280, height: 800 },
    { name: '11_stage3_rooms.png', url: 'http://127.0.0.1:4173/calculator?stage=3', width: 1280, height: 800 },
    { name: '12_stage4_buildable_space.png', url: 'http://127.0.0.1:4173/calculator?stage=4', width: 1280, height: 800 },
    { name: '13_stage4_details_open.png', url: 'http://127.0.0.1:4173/calculator?stage=4&details=open', width: 1280, height: 800 },
    { name: '14_stage5_construction_style.png', url: 'http://127.0.0.1:4173/calculator?stage=5', width: 1280, height: 800 },
    { name: '15_stage6_finishes_materials.png', url: 'http://127.0.0.1:4173/calculator?stage=6', width: 1280, height: 800 },
    { name: '16_stage7_preliminary_estimate.png', url: 'http://127.0.0.1:4173/calculator?stage=7', width: 1280, height: 800 },
    { name: '17_stage8_detailed_boq.png', url: 'http://127.0.0.1:4173/calculator?stage=8', width: 1280, height: 800 },
    { name: '18_calculator_mobile_stage1.png', url: 'http://127.0.0.1:4173/calculator?stage=1', width: 390, height: 844 },
    { name: '19_calculator_mobile_stage7.png', url: 'http://127.0.0.1:4173/calculator?stage=7', width: 390, height: 844 },
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
      '--virtual-time-budget=3500',
      t.url
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

  // Shut down preview
  try {
    if (preview.pid) {
      spawnSync('taskkill', ['/F', '/T', '/PID', preview.pid.toString()], { shell: true });
    }
  } catch (e) {}

  // Write verification JSON summary
  const summaryPath = path.resolve('verification_screenshots_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nVerification complete! Summary written to: ${summaryPath}`);
  console.log(`Total captured: ${results.filter(r => r.success).length} / ${results.length}`);
}

run().catch(console.error);

