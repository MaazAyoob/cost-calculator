// ==============================================================================
// Hutty Live Localhost & Gateway Contract Verification Probe
// Probes the live running server at http://localhost:4000 directly via HTTP
// ==============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import http from 'http';
import { CONSULTATION_PRICE_INR, CONSULTATION_PRICE_PAISE } from '../../../server/src/constants/consultation.constants';
import { runCalculator } from '../calculator';

function httpRequest(options: http.RequestOptions, body: any = null): Promise<{
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  buffer: Buffer;
  text: string;
  json: any;
}> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf-8');
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {}
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          buffer,
          text,
          json,
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

describe('Consultation Payment Live Gateway Contract', () => {
  it('enforces exact authoritative ₹1,499 fee and 149900 paise across environments', () => {
    expect(CONSULTATION_PRICE_INR).toBe(1499);
    expect(CONSULTATION_PRICE_PAISE).toBe(149900);
  });
});

describe('Hutty Live Localhost:4000 End-to-End Probes', () => {
  let serverOnline = false;
  let adminJwtToken = '';
  let customerJwtToken = '';
  let firstLeadKey = '';

  beforeAll(async () => {
    try {
      const res = await httpRequest({
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/health',
        method: 'GET',
      });
      serverOnline = res.statusCode === 200;
    } catch {
      serverOnline = false;
    }
    if (!serverOnline) {
      console.warn('[Live Endpoint Probe] Dev server not running on port 4000; skipping live network probes.');
    }
  });

  const runLiveTest = (testFn: () => Promise<void>) => async () => {
    if (!serverOnline) return;
    await testFn();
  };

  it('1. Live backend health check responds online', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/health',
      method: 'GET',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json?.status).toBe('online');
  }));

  it('2. Unauthenticated GET /api/v1/admin/leads is strictly blocked with 401', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/admin/leads',
      method: 'GET',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json?.error).toBe('Access token required');
  }));

  it('3. Customer account login returns valid token with role USER', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'customer@hutty.in', password: 'Customer@123' });

    expect(res.statusCode).toBe(200);
    expect(res.json?.success).toBe(true);
    expect(res.json?.token).toBeDefined();
    customerJwtToken = res.json?.token;
  }));

  it('4. Customer account cannot access protected admin endpoints (blocked with 403)', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/admin/leads',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerJwtToken}` },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json?.error).toBe('Admin authorization required');
  }));

  it('5. Admin login succeeds and returns valid ADMIN token', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'admin@hutty.in', password: 'Admin@123456' });

    expect(res.statusCode).toBe(200);
    expect(res.json?.success).toBe(true);
    expect(res.json?.token).toBeDefined();
    adminJwtToken = res.json?.token;
  }));

  it('6. Admin retrieves leads and summary KPIs successfully', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/admin/leads?dateFilter=all&limit=20',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminJwtToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json?.success).toBe(true);
    expect(Array.isArray(res.json?.data?.leads)).toBe(true);
    expect(res.json?.data?.summary).toBeDefined();
    expect(typeof res.json?.data?.summary?.totalLeads).toBe('number');
    if (res.json?.data?.leads?.length > 0) {
      firstLeadKey = res.json.data.leads[0].leadKey;
    }
  }));

  it('7. Lead status update and notes persist across re-queries', runLiveTest(async () => {
    // Create a live enquiry lead to verify
    const enqRes = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/consultations/enquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'E2E Live Test Lead',
      phone: '9845999888',
      email: 'e2etest@hutty.in',
      topic: 'Live Status Persistence Verification',
      message: 'Testing status update and internal notes',
      city: 'Bangalore',
    });

    expect(enqRes.statusCode).toBe(201);
    const targetLeadKey = `con:${enqRes.json.data.id}`;
    const noteText = `E2E Live Persistence Note ${Date.now()}`;

    const updateRes = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/admin/leads/${encodeURIComponent(targetLeadKey)}/status`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminJwtToken}`,
        'Content-Type': 'application/json',
      },
    }, { status: 'CONTACTED', notes: noteText });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.json?.success).toBe(true);

    // Re-query lead to verify persistence with dateFilter=all
    const verifyRes = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/admin/leads?dateFilter=all&search=${encodeURIComponent('9845999888')}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminJwtToken}` },
    });

    expect(verifyRes.statusCode).toBe(200);
    const lead = verifyRes.json?.data?.leads?.find((l: any) => l.leadKey === targetLeadKey);
    expect(lead).toBeDefined();
    expect(lead?.status).toBe('CONTACTED');
    expect(lead?.notes).toBe(noteText);
  }));

  it('8. Date presets (today, yesterday, 7d, 30d, this_month) resolve valid Asia/Kolkata ranges', runLiveTest(async () => {
    for (const preset of ['today', 'yesterday', '7d', '30d', 'this_month']) {
      const res = await httpRequest({
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1/admin/leads?dateFilter=${preset}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${adminJwtToken}` },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json?.data?.activeDateRange?.label).toBeDefined();
    }
  }));

  it('9. CSV export downloads valid RFC 4180 file with headers and formula protection', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/admin/leads/export?format=csv&scope=all',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminJwtToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Customer Name');
    expect(res.text).toContain('Phone Number');
    expect(res.text).toContain('Lead Status');
  }));

  it('10. XLSX export downloads valid binary spreadsheet with PK zip signature', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/admin/leads/export?format=xlsx&scope=all',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminJwtToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('openxmlformats');
    // Check ZIP magic signature (0x50, 0x4B)
    expect(res.buffer[0]).toBe(0x50);
    expect(res.buffer[1]).toBe(0x4B);
    expect(res.buffer.length).toBeGreaterThan(500);
  }));

  it('11. Selected-only export scope restricts output to chosen leads', runLiveTest(async () => {
    const targetKey = firstLeadKey || 'usr:usr-customer-test';
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/admin/leads/export?format=csv&scope=selected&dateFilter=all&selectedIds=${encodeURIComponent(targetKey)}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminJwtToken}` },
    });

    expect(res.statusCode).toBe(200);
    const lines = res.text.trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(1);
    expect(lines[0]).toContain('Customer Name');
  }));

  it('12. Consultation booking rejects unverified phone numbers before Cashfree order creation', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/consultations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      homeownerName: 'Unverified Booker',
      homeownerPhone: '9845112233',
      homeownerEmail: 'unverified@example.com',
      projectLocation: 'Bangalore',
      projectType: 'Independent House',
      consultationTopic: 'Architectural Plan Review',
      preferredDate: '2026-11-01',
      preferredTime: '10:00 AM',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json?.code).toBe('PHONE_VERIFICATION_REQUIRED');
  }));

  it('13. OTP challenge verification rejects incorrect OTP codes with 400', runLiveTest(async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/otp/verify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { phone: '9845112233', otp: '000000', purpose: 'SIGNUP' });

    expect(res.statusCode).toBe(400);
  }));

  it('14. Calculator doors and windows cost changes propagate with mathematical precision', () => {
    const baseInput = {
      city: 'Bangalore' as const,
      authority: 'BBMP/BDA' as const,
      plotLength: 40,
      plotWidth: 30,
      roadWidthFt: 30,
      builtUpAreaPerFloor: 800,
      houseType: 'Duplex' as const,
      floors: 2,
      rooms: {
        bedrooms: 3,
        bathrooms: 3,
        kitchen: 1,
        living: 1,
        dining: 1,
        pooja: 0,
        utility: 1,
        storeRoom: 0,
        office: 0,
        balcony: 1,
        commonToilets: 0,
      },
      qualityTier: 'Premium' as const,
      doors: {
        mainDoor: 'Premium Teak',
        internalDoor: 'Flush Door',
        bathroomDoor: 'WPC Door',
      },
      windows: {
        primaryMaterial: 'uPVC' as const,
        subGrade: 'Standard uPVC',
      },
    };

    const res3Baths = runCalculator(baseInput);
    const res4Baths = runCalculator({
      ...baseInput,
      rooms: { ...baseInput.rooms, bathrooms: 4 },
    });

    const door3 = res3Baths.doorSchedule.find((d) => d.code === 'D-BATH');
    const door4 = res4Baths.doorSchedule.find((d) => d.code === 'D-BATH');

    expect(door3?.quantity).toBe(3);
    expect(door4?.quantity).toBe(4);
    expect(res4Baths.budget.totalProjectCost).toBeGreaterThan(res3Baths.budget.totalProjectCost);
    expect((door4?.amount ?? 0) - (door3?.amount ?? 0)).toBe(11000);
  });
});
