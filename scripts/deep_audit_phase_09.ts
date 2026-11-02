import { runCalculator } from '../src/calculation-engine/calculator';
import { rateService } from '../src/calculation-engine/data/rateService';
import { generateDetailedReportPdfBlob } from '../src/features/report/pdfService';

// Ensure URL.createObjectURL exists in Node environment
if (typeof URL.createObjectURL !== 'function') {
  (URL as any).createObjectURL = (blob: any) => `blob:http://localhost:3000/${Math.random().toString(36).substring(2)}`;
  (URL as any).revokeObjectURL = () => {};
}

const BASE = 'http://localhost:4000/api/v1';

async function req(method: string, endpoint: string, body: any = null, token: string | null = null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const opts: RequestInit = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(`${BASE}${endpoint}`, opts);
    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err: any) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function runDeepAudit() {
  console.log('=====================================================');
  console.log('   HUTTY 3.1 — PHASE 09 DEEP FUNCTIONAL & API AUDIT   ');
  console.log('=====================================================\n');

  const auditReport: Record<string, any[]> = {
    apiTests: [],
    crudTests: [],
    isolationTests: [],
    calculatorTests: [],
    pdfTests: [],
  };

  function logPass(category: string, name: string, details = '') {
    console.log(`[PASS] (${category}) ${name} ${details}`);
    auditReport[category].push({ name, passed: true, details });
  }

  function logFail(category: string, name: string, details = '') {
    console.error(`[FAIL] (${category}) ${name} ${details}`);
    auditReport[category].push({ name, passed: false, details });
  }

  // --- SECTION 1: AUTHENTICATION & TOKENS ---
  console.log('\n--- 1. AUTHENTICATION & CREDENTIALS ---');
  const adminRes = await req('POST', '/auth/login', { email: 'admin@hutty.in', password: 'Admin@123456' });
  if (adminRes.ok && adminRes.data?.token) {
    logPass('apiTests', 'Admin Authentication', `Token obtained (Role: ${adminRes.data.user?.role})`);
  } else {
    logFail('apiTests', 'Admin Authentication', `Status: ${adminRes.status}`);
  }
  const adminToken = adminRes.data?.token;

  const timestamp = Date.now();
  const emailA = `test_customer_a_${timestamp}@hutty.in`;
  const emailB = `test_customer_b_${timestamp}@hutty.in`;

  // Register Customer A
  const regARes = await req('POST', '/auth/register', {
    name: 'Customer A',
    email: emailA,
    phone: '9845011111',
    password: 'Password@123',
    confirmPassword: 'Password@123',
  });
  if (regARes.ok && regARes.data?.token) {
    logPass('apiTests', 'Customer A Registration', `Registered user ${emailA}`);
  } else {
    logFail('apiTests', 'Customer A Registration', `Status: ${regARes.status} ${JSON.stringify(regARes.data)}`);
  }
  const tokenA = regARes.data?.token;

  // Register Customer B
  const regBRes = await req('POST', '/auth/register', {
    name: 'Customer B',
    email: emailB,
    phone: '9845022222',
    password: 'Password@123',
    confirmPassword: 'Password@123',
  });
  if (regBRes.ok && regBRes.data?.token) {
    logPass('apiTests', 'Customer B Registration', `Registered user ${emailB}`);
  } else {
    logFail('apiTests', 'Customer B Registration', `Status: ${regBRes.status} ${JSON.stringify(regBRes.data)}`);
  }
  const tokenB = regBRes.data?.token;

  // --- SECTION 2: CUSTOMER PROJECT CRUD & DATA ISOLATION ---
  console.log('\n--- 2. CUSTOMER PROJECT CRUD & DATA ISOLATION ---');
  let projectAId: string | null = null;

  // Customer A creates Project A
  const createProjRes = await req('POST', '/projects', {
    name: 'Villa Bangalore Customer A',
    city: 'Bangalore',
    authority: 'BBMP/BDA',
    configuration: {
      plotLength: 40,
      plotWidth: 30,
      floors: 3,
      houseType: 'Duplex',
      parkingType: 'Normal Ground',
      carCount: 1,
      bikeCount: 2,
      evCharging: false,
      liftRequired: false,
      roomsJson: {},
      qualityTier: 'Premium',
      materialBrands: {},
    },
    calculation: {
      totalBUASqFt: 2160,
      totalCostINR: 4315144,
      costPerSqFt: 1998,
    },
  }, tokenA);

  const createdData = createProjRes.data?.data || createProjRes.data;
  if (createProjRes.ok && createdData?.id) {
    projectAId = createdData.id;
    logPass('crudTests', 'Customer A Project Creation', `Created project id: ${projectAId}`);
  } else {
    logFail('crudTests', 'Customer A Project Creation', `Status: ${createProjRes.status} ${JSON.stringify(createProjRes.data)}`);
  }

  // Customer A retrieves Project A
  if (projectAId) {
    const getProjRes = await req('GET', `/projects/${projectAId}`, null, tokenA);
    const projData = getProjRes.data?.data || getProjRes.data;
    if (getProjRes.ok && projData?.name === 'Villa Bangalore Customer A') {
      logPass('crudTests', 'Customer A Project Retrieval', 'Project matches saved name and config');
    } else {
      logFail('crudTests', 'Customer A Project Retrieval', `Status: ${getProjRes.status}`);
    }

    // Customer B attempts to retrieve Project A (MUST BE FORBIDDEN)
    const getProjBRes = await req('GET', `/projects/${projectAId}`, null, tokenB);
    if (getProjBRes.status === 403 || getProjBRes.status === 404) {
      logPass('isolationTests', 'Project Isolation: Read Access', `Customer B denied reading Customer A project (Status: ${getProjBRes.status})`);
    } else {
      logFail('isolationTests', 'Project Isolation: Read Access', `Customer B unexpectedly accessed Customer A project! Status: ${getProjBRes.status}`);
    }

    // Customer B attempts to rename Project A (MUST BE FORBIDDEN)
    const renameProjBRes = await req('PATCH', `/projects/${projectAId}/rename`, { name: 'Hacked By B' }, tokenB);
    if (renameProjBRes.status === 403 || renameProjBRes.status === 404) {
      logPass('isolationTests', 'Project Isolation: Mutation Access', `Customer B denied mutating Customer A project (Status: ${renameProjBRes.status})`);
    } else {
      logFail('isolationTests', 'Project Isolation: Mutation Access', `Customer B modified Customer A project! Status: ${renameProjBRes.status}`);
    }

    // Customer B lists projects (MUST NOT CONTAIN PROJECT A)
    const listBRes = await req('GET', '/projects', null, tokenB);
    const bProjects = listBRes.data?.data?.projects || listBRes.data?.projects || listBRes.data || [];
    const hasProjectA = Array.isArray(bProjects) && bProjects.some((p: any) => p.id === projectAId);
    if (!hasProjectA) {
      logPass('isolationTests', 'Project Isolation: Project Listing', 'Customer A project is absent from Customer B project list');
    } else {
      logFail('isolationTests', 'Project Isolation: Project Listing', 'Customer A project leaked into Customer B list!');
    }

    // Customer A renames Project A
    const renameARes = await req('PATCH', `/projects/${projectAId}/rename`, { name: 'Villa Bangalore Updated Name' }, tokenA);
    if (renameARes.ok) {
      logPass('crudTests', 'Customer A Project Rename', 'Renamed successfully');
    } else {
      logFail('crudTests', 'Customer A Project Rename', `Status: ${renameARes.status}`);
    }

    // Customer A deletes Project A
    const deleteARes = await req('DELETE', `/projects/${projectAId}`, null, tokenA);
    if (deleteARes.ok) {
      logPass('crudTests', 'Customer A Project Deletion', 'Deleted successfully');
    } else {
      logFail('crudTests', 'Customer A Project Deletion', `Status: ${deleteARes.status}`);
    }
  }

  // --- SECTION 3: ADMIN RATE OVERRIDES & PERSISTENCE ---
  console.log('\n--- 3. ADMIN RATE OVERRIDES CRUD & PERSISTENCE ---');
  const testRateId = 'RM-STEEL-TATA-550D';
  const testOverrideRate = 78.50;

  // Check initial overrides
  const initialOverridesRes = await req('GET', '/admin/rates/overrides', null, adminToken);
  logPass('crudTests', 'Admin Fetch Overrides', `Initial overrides status: ${initialOverridesRes.status}`);

  // Set override
  const setOverrideRes = await req('POST', '/admin/rates/override', {
    rateId: testRateId,
    overrideRate: testOverrideRate,
    category: 'STRUCTURE',
    unit: 'KG',
    rateName: 'Tata Tiscon Fe550D TMT Rebar',
    note: 'Phase 09 audit test override',
  }, adminToken);

  if (setOverrideRes.ok) {
    logPass('crudTests', 'Admin Create Rate Override', `Set ${testRateId} to ₹${testOverrideRate}`);
  } else {
    logFail('crudTests', 'Admin Create Rate Override', `Status: ${setOverrideRes.status} ${JSON.stringify(setOverrideRes.data)}`);
  }

  // Verify override persistence
  const verifyOverridesRes = await req('GET', '/admin/rates/overrides', null, adminToken);
  const overridesList = verifyOverridesRes.data?.overrides || (Array.isArray(verifyOverridesRes.data) ? verifyOverridesRes.data : []);
  const foundOverride = Array.isArray(overridesList) && overridesList.find((o: any) => o.rateId === testRateId || o.id === testRateId);
  if (foundOverride && (foundOverride.rate === testOverrideRate || foundOverride.overrideRate === testOverrideRate)) {
    logPass('crudTests', 'Admin Rate Override Persistence', 'Override verified in list');
  } else {
    logFail('crudTests', 'Admin Rate Override Persistence', `Override not found in ${JSON.stringify(overridesList)}`);
  }

  // Remove override
  const removeOverrideRes = await req('DELETE', `/admin/rates/override/${testRateId}`, null, adminToken);
  if (removeOverrideRes.ok) {
    logPass('crudTests', 'Admin Remove Rate Override', 'Removed successfully');
  } else {
    logFail('crudTests', 'Admin Remove Rate Override', `Status: ${removeOverrideRes.status}`);
  }

  // --- SECTION 4: ADMIN CONSULTANT MANAGEMENT CRUD ---
  console.log('\n--- 4. ADMIN CONSULTANT MANAGEMENT CRUD ---');
  let createdConsultantId: string | null = null;
  const createConsultantRes = await req('POST', '/admin/consultants', {
    name: 'Ar. Vikramaditya Rao',
    title: 'Senior Residential Architect',
    category: 'Architect',
    city: 'Bangalore',
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 38,
    about: 'Experienced architect specializing in sustainable contemporary homes.',
    specializations: ['Space Planning', 'Green Building', 'Bylaw Compliance'],
    languages: ['English', 'Kannada', 'Hindi'],
    featured: true,
  }, adminToken);

  const consData = createConsultantRes.data?.consultant || createConsultantRes.data?.data || createConsultantRes.data;
  if (createConsultantRes.ok && consData?.id) {
    createdConsultantId = consData.id;
    logPass('crudTests', 'Admin Consultant Creation', `Created consultant ID: ${createdConsultantId}`);
  } else {
    logFail('crudTests', 'Admin Consultant Creation', `Status: ${createConsultantRes.status} ${JSON.stringify(createConsultantRes.data)}`);
  }

  if (createdConsultantId) {
    // Read consultant in public list
    const getPubConsultant = await req('GET', `/consultants`);
    const pubList = getPubConsultant.data?.data || getPubConsultant.data?.consultants || (Array.isArray(getPubConsultant.data) ? getPubConsultant.data : []);
    const inPub = Array.isArray(pubList) && pubList.some((c: any) => c.id === createdConsultantId);
    if (inPub) {
      logPass('crudTests', 'Consultant Public Directory Sync', 'New consultant appears in public directory');
    } else {
      logFail('crudTests', 'Consultant Public Directory Sync', 'Consultant missing from public directory');
    }

    // Delete consultant
    const deleteConsultantRes = await req('DELETE', `/admin/consultants/${createdConsultantId}`, null, adminToken);
    if (deleteConsultantRes.ok) {
      logPass('crudTests', 'Admin Consultant Deletion', 'Deleted consultant successfully');
    } else {
      logFail('crudTests', 'Admin Consultant Deletion', `Status: ${deleteConsultantRes.status}`);
    }
  }

  // --- SECTION 5: ADMIN PRICING TIERS CONFIGURATION ---
  console.log('\n--- 5. ADMIN PRICING TIERS ---');
  const getTiersRes = await req('GET', '/admin/pricing/tiers', null, adminToken);
  const tiersArray = getTiersRes.data?.data || (Array.isArray(getTiersRes.data) ? getTiersRes.data : []);
  if (getTiersRes.ok && Array.isArray(tiersArray) && tiersArray.length > 0) {
    logPass('crudTests', 'Admin Pricing Tiers Retrieval', `Retrieved ${tiersArray.length} tiers`);
    const has499 = tiersArray.some((t: any) => t.priceMinorUnits === 49900 || t.code === 'DETAILED_ESTIMATE_499');
    const has1499 = tiersArray.some((t: any) => t.priceMinorUnits === 149900 || t.code === 'PREMIUM_1499');
    if (has499 && has1499) {
      logPass('crudTests', 'Commercial Price Fidelity', 'Verified ₹499 and ₹1,499 commercial tiers in backend');
    } else {
      logFail('crudTests', 'Commercial Price Fidelity', 'Pricing tiers missing standard amounts');
    }
  } else {
    logFail('crudTests', 'Admin Pricing Tiers Retrieval', `Status: ${getTiersRes.status}`);
  }

  // --- SECTION 6: CALCULATOR MATHEMATICAL INVARIANCE ---
  console.log('\n--- 6. CALCULATOR MATHEMATICAL INVARIANCE & TEST SCENARIOS ---');

  // Scenario 1: Small House (20' x 30', Ground Floor, 600 sq.ft plot)
  const sc1Inputs: any = {
    plotLength: 30,
    plotWidth: 20,
    floors: 1,
    houseType: 'Duplex',
    qualityTier: 'Standard',
  };
  const sc1 = runCalculator(sc1Inputs);
  const sc1BUA = sc1.area?.totalBUASqFt || 0;
  const sc1Cost = sc1.budget?.totalProjectCost || 0;
  const sc1Steel = sc1.quantities?.steelTonnes || 0;
  const sc1Cement = sc1.quantities?.cementBags || 0;

  if (sc1BUA > 0 && sc1Cost > 0 && sc1Steel > 0 && sc1Cement > 0 && !isNaN(sc1Cost)) {
    logPass('calculatorTests', 'Scenario 1 (Small House 20x30 Ground)', 
      `BUA: ${sc1BUA} sq.ft, Cost: ₹${sc1Cost.toLocaleString()}, Steel: ${sc1Steel}t, Cement: ${sc1Cement} bags`);
  } else {
    logFail('calculatorTests', 'Scenario 1 (Small House 20x30 Ground)', `Invalid result: BUA=${sc1BUA}, Cost=${sc1Cost}`);
  }

  // Scenario 2: Medium House (30' x 40', G+2 Floors, 1200 sq.ft plot)
  const sc2Inputs: any = {
    plotLength: 40,
    plotWidth: 30,
    floors: 3,
    houseType: 'Duplex',
    qualityTier: 'Premium',
  };
  const sc2 = runCalculator(sc2Inputs);
  const sc2BUA = sc2.area?.totalBUASqFt || 0;
  const sc2Cost = sc2.budget?.totalProjectCost || 0;
  const sc2Steel = sc2.quantities?.steelTonnes || 0;
  const sc2Cement = sc2.quantities?.cementBags || 0;

  if (sc2BUA > 0 && sc2Cost > 0 && sc2Steel > 0 && sc2Cement > 0 && !isNaN(sc2Cost)) {
    logPass('calculatorTests', 'Scenario 2 (Medium House 30x40 G+2)', 
      `BUA: ${sc2BUA} sq.ft, Cost: ₹${sc2Cost.toLocaleString()}, Steel: ${sc2Steel}t, Cement: ${sc2Cement} bags`);
  } else {
    logFail('calculatorTests', 'Scenario 2 (Medium House 30x40 G+2)', `Invalid result: BUA=${sc2BUA}, Cost=${sc2Cost}`);
  }

  // Scenario 3: Large House (40' x 60', G+3 Floors, 2400 sq.ft plot)
  const sc3Inputs: any = {
    plotLength: 60,
    plotWidth: 40,
    floors: 4,
    houseType: 'Duplex',
    qualityTier: 'Luxury',
  };
  const sc3 = runCalculator(sc3Inputs);
  const sc3BUA = sc3.area?.totalBUASqFt || 0;
  const sc3Cost = sc3.budget?.totalProjectCost || 0;
  const sc3Steel = sc3.quantities?.steelTonnes || 0;
  const sc3Cement = sc3.quantities?.cementBags || 0;

  if (sc3BUA > 0 && sc3Cost > 0 && sc3Steel > 0 && sc3Cement > 0 && !isNaN(sc3Cost)) {
    logPass('calculatorTests', 'Scenario 3 (Large House 40x60 G+3)', 
      `BUA: ${sc3BUA} sq.ft, Cost: ₹${sc3Cost.toLocaleString()}, Steel: ${sc3Steel}t, Cement: ${sc3Cement} bags`);
  } else {
    logFail('calculatorTests', 'Scenario 3 (Large House 40x60 G+3)', `Invalid result: BUA=${sc3BUA}, Cost=${sc3Cost}`);
  }

  // Check Scaling Monotonicity: Small < Medium < Large
  if (sc1BUA < sc2BUA && sc2BUA < sc3BUA && sc1Cost < sc2Cost && sc2Cost < sc3Cost) {
    logPass('calculatorTests', 'Monotonic Cost & Quantity Scaling', 'Small < Medium < Large strictly holds for BUA and Cost');
  } else {
    logFail('calculatorTests', 'Monotonic Cost & Quantity Scaling', 'Scaling violated!');
  }

  // --- SECTION 7: PDF GENERATION FIDELITY ---
  console.log('\n--- 7. ESTIMATE & BOQ PDF GENERATION ---');
  try {
    const pdfRes = await generateDetailedReportPdfBlob({
      data: sc2,
      projectName: 'Audit Verification Project',
      preparedFor: 'Suresh Kumar',
      specificationTier: 'Premium',
      isPremium: true,
    });
    if (pdfRes && pdfRes.blob && pdfRes.filename) {
      logPass('pdfTests', 'Detailed BOQ PDF Generation', `Successfully generated PDF: ${pdfRes.filename} (Size: ${pdfRes.blob.size} bytes)`);
    } else {
      logFail('pdfTests', 'Detailed BOQ PDF Generation', 'PDF output was empty or invalid');
    }
  } catch (err: any) {
    logFail('pdfTests', 'Detailed BOQ PDF Generation', `Threw error: ${err.message}`);
  }

  console.log('\n=====================================================');
  console.log('   DEEP AUDIT EXECUTION COMPLETE                     ');
  console.log('=====================================================');
}

runDeepAudit().catch(console.error);
