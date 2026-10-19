// Comprehensive live endpoint verification script against http://localhost:4000
const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let parsed = null;
        const text = buffer.toString('utf-8');
        try {
          parsed = JSON.parse(text);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer,
          text,
          json: parsed,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function run() {
  console.log('--- STARTING HUTTY LIVE E2E VERIFICATION ON PORT 4000 ---');
  const results = {};

  // 1. Health check
  const health = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/health',
    method: 'GET',
  });
  console.log('1. Health check status:', health.statusCode, health.json ? health.json.status : health.text);
  results.health = health.statusCode === 200 && health.json && health.json.status === 'online';

  // 2. Unauthenticated access to /api/v1/admin/leads -> must be 401
  const unauth = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/leads',
    method: 'GET',
  });
  console.log('2. Unauthenticated /api/v1/admin/leads status:', unauth.statusCode, unauth.json);
  results.unauthenticated_blocked = unauth.statusCode === 401;

  // 3. Customer login -> role = USER
  const custLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@hutty.in', password: 'Customer@123' });
  console.log('3. Customer login status:', custLogin.statusCode, custLogin.json ? custLogin.json.success : false);
  const custToken = custLogin.json?.token;

  // Customer attempts to access /api/v1/admin/leads -> must be 403
  const custAdminReq = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/leads',
    method: 'GET',
    headers: { Authorization: `Bearer ${custToken}` },
  });
  console.log('4. Customer access to /api/v1/admin/leads status:', custAdminReq.statusCode, custAdminReq.json);
  results.customer_blocked_from_admin = custAdminReq.statusCode === 403;

  // 5. Admin login -> role = ADMIN
  const adminLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'admin@hutty.in', password: 'Admin@123456' });
  console.log('5. Admin login status:', adminLogin.statusCode, adminLogin.json ? adminLogin.json.success : false);
  const adminToken = adminLogin.json?.token;
  results.admin_login = adminLogin.statusCode === 200 && Boolean(adminToken);

  // 6. Admin queries leads
  const adminLeads = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/leads?limit=20',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('6. Admin query leads count:', adminLeads.json?.data?.leads?.length, 'total:', adminLeads.json?.data?.total);
  results.admin_leads_retrieval = adminLeads.statusCode === 200 && Array.isArray(adminLeads.json?.data?.leads);

  const firstLead = adminLeads.json?.data?.leads?.[0];
  const targetLeadKey = firstLead ? firstLead.leadKey : 'usr:usr-customer-test';

  // 7. Update status and add notes to lead
  const testNote = `Live browser QA verified persistence note at ${new Date().toISOString()}`;
  const updateStatus = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/v1/admin/leads/${encodeURIComponent(targetLeadKey)}/status`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  }, { status: 'CONTACTED', notes: testNote });
  console.log('7. Update lead status response:', updateStatus.statusCode, updateStatus.json?.message);
  results.lead_status_update = updateStatus.statusCode === 200 && updateStatus.json?.success;

  // 8. Re-query lead to verify persistence of status and note
  const requery = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/v1/admin/leads?search=${encodeURIComponent(targetLeadKey)}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const requeryLead = requery.json?.data?.leads?.find(l => l.leadKey === targetLeadKey);
  console.log('8. Re-queried lead status:', requeryLead?.status, 'notes:', requeryLead?.notes);
  results.lead_notes_persistence = requeryLead?.status === 'CONTACTED' && requeryLead?.notes === testNote;

  // 9. Test Date Filters
  const dateFilters = ['today', 'yesterday', '7d', '30d', 'this_month'];
  results.date_filters = true;
  for (const df of dateFilters) {
    const dfRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/admin/leads?dateFilter=${df}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (dfRes.statusCode !== 200 || !dfRes.json?.data?.dateRange) {
      results.date_filters = false;
      console.error(`Date filter ${df} failed`);
    } else {
      console.log(`- Date filter '${df}' returned range:`, dfRes.json.data.dateRange.label, 'items:', dfRes.json.data.leads.length);
    }
  }

  // 10. Download CSV export
  const csvRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/leads/export?format=csv&scope=all',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('10. CSV Export status:', csvRes.statusCode, 'content-type:', csvRes.headers['content-type'], 'size:', csvRes.buffer.length);
  const csvText = csvRes.text;
  const csvHasHeader = csvText.includes('Customer Name') && csvText.includes('Phone Number') && csvText.includes('Lead Status');
  console.log('    CSV contains valid headers:', csvHasHeader);
  results.csv_export = csvRes.statusCode === 200 && csvHasHeader;

  // 11. Download XLSX export
  const xlsxRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/leads/export?format=xlsx&scope=all',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const isZipMagic = xlsxRes.buffer[0] === 0x50 && xlsxRes.buffer[1] === 0x4B;
  console.log('11. XLSX Export status:', xlsxRes.statusCode, 'magic bytes PK:', isZipMagic, 'size:', xlsxRes.buffer.length);
  results.xlsx_export = xlsxRes.statusCode === 200 && isZipMagic && xlsxRes.buffer.length > 500;

  // 12. Selected-only export scope
  const selectedExport = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/v1/admin/leads/export?format=csv&scope=selected&selectedIds=${encodeURIComponent(targetLeadKey)}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const selectedLines = selectedExport.text.trim().split('\n');
  console.log('12. Selected-only export lines count (header + rows):', selectedLines.length);
  results.selected_only_export = selectedExport.statusCode === 200 && selectedLines.length === 2;

  // 13. Verified-only export scope
  const verifiedExport = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/leads/export?format=csv&scope=verified_only',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('13. Verified-only export status:', verifiedExport.statusCode, 'size:', verifiedExport.buffer.length);
  results.verified_only_export = verifiedExport.statusCode === 200;

  // 14. Phone OTP System Verification
  // A. Create challenge for test number
  const testPhone = '9845112233';
  const challengeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/otp/challenge',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { phone: testPhone, purpose: 'SIGNUP' });
  console.log('14A. OTP Challenge creation:', challengeRes.statusCode, challengeRes.json?.message);

  // B. Verify wrong OTP -> rejected
  const wrongVerify = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/otp/verify',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { phone: testPhone, otp: '000000', purpose: 'SIGNUP' });
  console.log('14B. Wrong OTP verification:', wrongVerify.statusCode, wrongVerify.json?.error);
  results.wrong_otp_rejected = wrongVerify.statusCode === 400;

  // C. Test consultation booking without phone verification guard
  const unverifiedBooking = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/consultations/book',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    expertId: 'exp-arch-1',
    customerName: 'Unverified Booker',
    customerEmail: 'unverified@example.com',
    customerPhone: '9845112233',
    topic: 'Architectural Plan Review',
    bookingDate: '2026-11-01',
    slotTime: '10:00 AM',
  });
  console.log('15. Consultation booking unverified phone guard:', unverifiedBooking.statusCode, unverifiedBooking.json?.error);
  results.consultation_phone_guard = unverifiedBooking.statusCode === 400 && unverifiedBooking.json?.code === 'PHONE_VERIFICATION_REQUIRED';

  console.log('\n--- ALL LIVE VERIFICATION RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
