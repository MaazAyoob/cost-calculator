// Automated Backend API Audit Script
const BASE = 'http://localhost:4000/api/v1';

async function req(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const opts = { method, headers };
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
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function run() {
  console.log('=== HUTTY 3.1 BACKEND API AUDIT ===\n');
  const results = [];

  function record(testName, method, endpoint, res, expectedStatus = 200) {
    const passed = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(res.status)
      : res.status === expectedStatus;
    results.push({ testName, method, endpoint, status: res.status, passed, error: passed ? null : res.data });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${method} ${endpoint} -> Status ${res.status} (${testName})`);
  }

  // 1. Health check
  const healthRes = await req('GET', '/health');
  record('Health Check', 'GET', '/health', healthRes, 200);

  // 2. Public Catalog & Rates
  const configRes = await req('GET', '/config/active');
  record('Active Construction Configuration', 'GET', '/config/active', configRes, 200);

  const ratesRes = await req('GET', '/rates/active');
  record('Active Material Rates', 'GET', '/rates/active', ratesRes, 200);

  const masterRatesRes = await req('GET', '/rates/master');
  record('Master Material Rates', 'GET', '/rates/master', masterRatesRes, 200);

  // 3. Pricing Tiers
  const pricingTiersRes = await req('GET', '/pricing/tiers');
  record('Public Pricing Tiers', 'GET', '/pricing/tiers', pricingTiersRes, 200);

  // 4. Consultants Public
  const consultantsRes = await req('GET', '/consultants');
  record('Public Consultants List', 'GET', '/consultants', consultantsRes, 200);

  // 5. Auth Checks: Login Admin
  const adminLoginRes = await req('POST', '/auth/login', {
    email: 'admin@hutty.in',
    password: 'Admin@123456',
  });
  record('Admin Login', 'POST', '/auth/login', adminLoginRes, 200);
  const adminToken = adminLoginRes.data?.token;

  // 6. Auth Checks: Login Customer Test Account
  const custLoginRes = await req('POST', '/auth/login', {
    email: 'customer@hutty.in',
    password: 'Customer@123',
  });
  record('Customer Login', 'POST', '/auth/login', custLoginRes, 200);
  const custToken = custLoginRes.data?.token;

  // 7. Protected Customer Endpoints
  const custOverviewRes = await req('GET', '/account/overview', null, custToken);
  record('Customer Account Overview', 'GET', '/account/overview', custOverviewRes, 200);

  const custPurchasesRes = await req('GET', '/account/purchases', null, custToken);
  record('Customer Purchases List', 'GET', '/account/purchases', custPurchasesRes, 200);

  const custReportsRes = await req('GET', '/account/reports', null, custToken);
  record('Customer Reports List', 'GET', '/account/reports', custReportsRes, 200);

  const custConsultationsRes = await req('GET', '/account/consultations', null, custToken);
  record('Customer Consultations List', 'GET', '/account/consultations', custConsultationsRes, 200);

  // 8. Protected Admin Endpoints
  const adminAuditRes = await req('GET', '/admin/audit', null, adminToken);
  record('Admin Audit Trail', 'GET', '/admin/audit', adminAuditRes, 200);

  const adminPricingTiersRes = await req('GET', '/admin/pricing/tiers', null, adminToken);
  record('Admin Pricing Tiers', 'GET', '/admin/pricing/tiers', adminPricingTiersRes, 200);

  const adminConsultantsRes = await req('GET', '/admin/consultants', null, adminToken);
  record('Admin Consultants Management', 'GET', '/admin/consultants', adminConsultantsRes, 200);

  const adminLeadsRes = await req('GET', '/admin/leads', null, adminToken);
  record('Admin Leads List', 'GET', '/admin/leads', adminLeadsRes, 200);

  const adminUsersRes = await req('GET', '/admin/users', null, adminToken);
  record('Admin Users List', 'GET', '/admin/users', adminUsersRes, 200);

  const adminProfileRes = await req('GET', '/admin/account/profile', null, adminToken);
  record('Admin Account Profile', 'GET', '/admin/account/profile', adminProfileRes, 200);

  // 9. Unauthorized Access Prevention (Customer attempting Admin endpoint)
  const custAttemptAdminRes = await req('GET', '/admin/audit', null, custToken);
  record('Customer Access to Admin Route Blocked (403)', 'GET', '/admin/audit', custAttemptAdminRes, [401, 403]);

  // 10. Anonymous Access Prevention (No token attempting Protected endpoint)
  const anonAttemptRes = await req('GET', '/account/overview', null, null);
  record('Anonymous Access to Customer Route Blocked (401)', 'GET', '/account/overview', anonAttemptRes, [401, 403]);

  console.log('\n--- SUMMARY ---');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Passed: ${passedCount}/${results.length}`);
  if (passedCount !== results.length) {
    console.log('Failed tests:', results.filter(r => !r.passed));
  }
}

run().catch(console.error);

