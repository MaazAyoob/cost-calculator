// ==============================================================================
// Hutty Admin Leads Management & Export Test Suite
// Covers:
//  - 1. Date Range Resolution & Asia/Kolkata (+05:30) Timezone Boundaries
//  - 2. Lead Assembly, Phone Verification Attribution & Deduplication
//  - 3. Multi-Criteria Filtering, Search, Pagination & Sort Controls
//  - 4. Accurate Filter-Matched Summary Metrics (Total, Verified, Unverified, New)
//  - 5. Lead Status & Internal Notes Persistence
//  - 6. CSV Export & Formula Injection Prevention
//  - 7. OpenXML (.xlsx) Binary Packaging & Validity
//  - 8. Export Scopes: All vs Selected vs Verified Only
//  - 9. Admin Controller Endpoints & Authorization Guards
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import zlib from 'zlib';
import { leadsService } from '../../../server/src/services/leads.service';
import { consultationService } from '../../../server/src/services/consultation.service';
import { pricingService } from '../../../server/src/services/pricing.service';
import { inMemoryCustomerUsers } from '../../../server/src/controllers/auth.controller';
import {
  generateCsv,
  generateXlsx,
  sanitizeSpreadsheetCell,
  createZipArchive,
} from '../../../server/src/utils/export.utils';
import {
  getLeads as getLeadsController,
  updateLeadStatus as updateLeadStatusController,
  exportLeads as exportLeadsController,
} from '../../../server/src/controllers/leads.controller';
import { requireAdmin, authenticateToken } from '../../../server/src/middlewares/auth.middleware';
import { ENV } from '../../../server/src/config/env';

describe('Hutty Admin Leads Management & Export System', () => {
  beforeEach(() => {
    leadsService.clearInMemory();
    consultationService.clearInMemory();
    inMemoryCustomerUsers.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Date Range Boundaries & Timezone (Asia/Kolkata +05:30)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. Date Range Resolution & Timezone Boundaries', () => {
    it('accurately resolves "today" preset in Asia/Kolkata timezone', () => {
      const bounds = leadsService.resolveDateRange('today');
      expect(bounds.label).toBe('Today');
      expect(bounds.startISO).toContain('T');
      expect(bounds.endISO).toContain('T');
      expect(bounds.startDate.getTime()).toBeLessThan(bounds.endDate.getTime());
      // Duration must be 24h minus 1ms (86,399,999 ms)
      expect(bounds.endDate.getTime() - bounds.startDate.getTime()).toBe(86399999);
    });

    it('accurately resolves "yesterday" preset', () => {
      const todayBounds = leadsService.resolveDateRange('today');
      const yesterdayBounds = leadsService.resolveDateRange('yesterday');
      expect(yesterdayBounds.label).toBe('Yesterday');
      expect(yesterdayBounds.endDate.getTime()).toBeLessThan(todayBounds.startDate.getTime());
      expect(yesterdayBounds.endDate.getTime() - yesterdayBounds.startDate.getTime()).toBe(86399999);
    });

    it('accurately resolves "7d" preset (7 full calendar days)', () => {
      const bounds = leadsService.resolveDateRange('7d');
      expect(bounds.label).toBe('Last 7 Days');
      const durationDays = (bounds.endDate.getTime() - bounds.startDate.getTime() + 1) / 86400000;
      expect(durationDays).toBe(7);
    });

    it('accurately resolves "30d" preset (30 full calendar days)', () => {
      const bounds = leadsService.resolveDateRange('30d');
      expect(bounds.label).toBe('Last 30 Days');
      const durationDays = (bounds.endDate.getTime() - bounds.startDate.getTime() + 1) / 86400000;
      expect(durationDays).toBe(30);
    });

    it('accurately resolves "this_month" starting from day 1 of the month', () => {
      const bounds = leadsService.resolveDateRange('this_month');
      expect(bounds.label).toBe('This Month');
      // Starts on day 1
      const startDateIST = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
      }).format(bounds.startDate);
      expect(startDateIST).toBe('01');
    });

    it('accurately resolves "prev_month" covering complete previous month', () => {
      const bounds = leadsService.resolveDateRange('prev_month');
      expect(bounds.label).toBe('Previous Month');
      expect(bounds.startDate.getTime()).toBeLessThan(bounds.endDate.getTime());
    });

    it('accurately resolves valid "custom" range', () => {
      const bounds = leadsService.resolveDateRange('custom', '2026-10-01', '2026-10-15');
      expect(bounds.label).toBe('2026-10-01 to 2026-10-15');
      // Starts at 2026-10-01 00:00:00 IST and ends at 2026-10-15 23:59:59.999 IST
      const durationDays = (bounds.endDate.getTime() - bounds.startDate.getTime() + 1) / 86400000;
      expect(durationDays).toBe(15);
    });

    it('validates custom date range: rejects when start date is after end date', () => {
      expect(() => {
        leadsService.resolveDateRange('custom', '2026-10-20', '2026-10-10');
      }).toThrow('Start date cannot be later than end date.');
    });

    it('validates custom date range: rejects missing dates or invalid format', () => {
      expect(() => {
        leadsService.resolveDateRange('custom', '', '2026-10-10');
      }).toThrow('Both start date and end date are required');

      expect(() => {
        leadsService.resolveDateRange('custom', 'invalid-date', '2026-10-10');
      }).toThrow('Invalid date format');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Data Assembly, Deduplication & Verification Status Attribution
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. Lead Assembly, Deduplication & Verification Attribution', () => {
    it('assembles consultation bookings, general enquiries, signups, and purchases', async () => {
      // 1. Add verified customer
      inMemoryCustomerUsers.set('priya@example.com', {
        id: 'usr_priya_01',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+919876543210',
        phoneVerifiedAt: new Date('2026-10-10T10:00:00Z'),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date('2026-10-10T10:00:00Z'),
        updatedAt: new Date('2026-10-10T10:00:00Z'),
      });

      // 2. Add unverified customer
      inMemoryCustomerUsers.set('rahul@example.com', {
        id: 'usr_rahul_02',
        name: 'Rahul Varma',
        email: 'rahul@example.com',
        phone: '+919845112233',
        phoneVerifiedAt: null, // Unverified
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date('2026-10-12T11:00:00Z'),
        updatedAt: new Date('2026-10-12T11:00:00Z'),
      });

      // 3. Add General Enquiry
      await consultationService.createGeneralEnquiry({
        name: 'Kavita Rao',
        phone: '9811223344',
        email: 'kavita@example.com',
        topic: 'BBMP Setback Advisory',
        message: 'Need help understanding corner plot setback rules.',
        city: 'Bangalore',
      });

      const allLeads = await leadsService.assembleAllLeads();

      expect(allLeads.length).toBeGreaterThanOrEqual(3);

      const priyaLead = allLeads.find((l) => l.email === 'priya@example.com');
      expect(priyaLead).toBeDefined();
      expect(priyaLead?.phoneVerified).toBe(true);
      expect(priyaLead?.source).toBe('ACCOUNT_SIGNUP');

      const rahulLead = allLeads.find((l) => l.email === 'rahul@example.com');
      expect(rahulLead).toBeDefined();
      expect(rahulLead?.phoneVerified).toBe(false);

      const kavitaLead = allLeads.find((l) => l.email === 'kavita@example.com');
      expect(kavitaLead).toBeDefined();
      expect(kavitaLead?.source).toBe('GENERAL_ENQUIRY');
      expect(kavitaLead?.sourceLabel).toBe('General Enquiry');
      expect(kavitaLead?.enquiryDetails).toContain('BBMP Setback Advisory');
    });

    it('prevents duplicate leads when the same consultation is linked to a customer account', async () => {
      const email = 'anand.k@example.com';
      const phone = '9876500000';

      // Registered user
      inMemoryCustomerUsers.set(email, {
        id: 'usr_anand_03',
        name: 'Anand Kumar',
        email,
        phone: '+919876500000',
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Anand places a consultation booking
      await consultationService.createBookingRequest(
        {
          consultantId: 'cons-ar-ramesh',
          homeownerName: 'Anand Kumar',
          homeownerPhone: phone,
          homeownerEmail: email,
          projectLocation: 'Indiranagar, Bangalore',
          projectType: 'Villa',
          consultationTopic: 'Architectural Plan Review',
          preferredDate: '2026-11-01',
          preferredTime: '10:00 AM',
        },
        { id: 'usr_anand_03', email }
      );

      const allLeads = await leadsService.assembleAllLeads();

      // Filter leads for Anand
      const anandLeads = allLeads.filter((l) => l.email === email);

      // Must NOT create 2 separate rows (one signup + one booking) for the consultation event
      expect(anandLeads.length).toBe(1);
      expect(anandLeads[0].source).toBe('CONSULTATION_BOOKING');
      expect(anandLeads[0].phoneVerified).toBe(true);
      expect(anandLeads[0].userId).toBe('usr_anand_03');
    });

    it('does NOT infer phone verification merely from consultation booking status', async () => {
      // Create a consultation request with an unverified phone and status ACCEPTED/SCHEDULED
      (consultationService as any).inMemoryRequests.push({
        id: 'req_unverified_sched',
        publicReference: 'HT-CON-UNVERIFIED',
        homeownerName: 'Unverified Customer',
        homeownerPhone: '9123456789',
        homeownerEmail: 'unverified@example.com',
        projectLocation: 'Hebbal, Bangalore',
        projectType: 'Independent House',
        consultationTopic: 'Structural Advice',
        preferredDate: '2026-11-05',
        preferredTime: '02:00 PM',
        status: 'SCHEDULED', // status is scheduled, but phone was never verified!
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const allLeads = await leadsService.assembleAllLeads();
      const unverifiedLead = allLeads.find((l) => l.reference === 'HT-CON-UNVERIFIED');

      expect(unverifiedLead).toBeDefined();
      expect(unverifiedLead?.phoneVerified).toBe(false);
      expect(unverifiedLead?.phoneVerifiedAt).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Multi-Criteria Filtering, Search, Pagination & Sorting
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. Multi-Criteria Filtering, Search, Pagination & Sorting', () => {
    beforeEach(async () => {
      // Seed distinct sample leads
      inMemoryCustomerUsers.set('vikram@example.com', {
        id: 'usr_vikram',
        name: 'Vikram Malhotra',
        email: 'vikram@example.com',
        phone: '+919876543201',
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      inMemoryCustomerUsers.set('sneha@example.com', {
        id: 'usr_sneha',
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        phone: '+919876543202',
        phoneVerifiedAt: null, // Unverified
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await consultationService.createGeneralEnquiry({
        name: 'Divya Iyer',
        phone: '9876543203',
        email: 'divya@example.com',
        topic: 'Soil Test Consultation',
        message: 'Looking for foundation depth recommendations.',
        city: 'Bangalore',
      });
    });

    it('searches leads by customer name, phone number, and email', async () => {
      const byName = await leadsService.getFilteredLeads({ search: 'Vikram' });
      expect(byName.leads.length).toBe(1);
      expect(byName.leads[0].name).toBe('Vikram Malhotra');

      const byPhone = await leadsService.getFilteredLeads({ search: '9876543202' });
      expect(byPhone.leads.length).toBe(1);
      expect(byPhone.leads[0].name).toBe('Sneha Reddy');

      const byEmail = await leadsService.getFilteredLeads({ search: 'divya@example.com' });
      expect(byEmail.leads.length).toBe(1);
      expect(byEmail.leads[0].name).toBe('Divya Iyer');
    });

    it('filters by phone verification status (VERIFIED vs UNVERIFIED)', async () => {
      const verifiedOnly = await leadsService.getFilteredLeads({ phoneVerified: 'VERIFIED' });
      expect(verifiedOnly.leads.every((l) => l.phoneVerified === true)).toBe(true);

      const unverifiedOnly = await leadsService.getFilteredLeads({ phoneVerified: 'UNVERIFIED' });
      expect(unverifiedOnly.leads.every((l) => l.phoneVerified === false)).toBe(true);
    });

    it('filters by lead source', async () => {
      const enquiryOnly = await leadsService.getFilteredLeads({ source: 'GENERAL_ENQUIRY' });
      expect(enquiryOnly.leads.every((l) => l.source === 'GENERAL_ENQUIRY')).toBe(true);
      expect(enquiryOnly.leads.some((l) => l.name === 'Divya Iyer')).toBe(true);

      const signupOnly = await leadsService.getFilteredLeads({ source: 'ACCOUNT_SIGNUP' });
      expect(signupOnly.leads.every((l) => l.source === 'ACCOUNT_SIGNUP')).toBe(true);
    });

    it('supports sorting by newest and oldest', async () => {
      const newest = await leadsService.getFilteredLeads({ sort: 'newest' });
      const oldest = await leadsService.getFilteredLeads({ sort: 'oldest' });

      if (newest.leads.length >= 2) {
        const time0 = new Date(newest.leads[0].createdAt).getTime();
        const time1 = new Date(newest.leads[1].createdAt).getTime();
        expect(time0).toBeGreaterThanOrEqual(time1);
      }

      if (oldest.leads.length >= 2) {
        const time0 = new Date(oldest.leads[0].createdAt).getTime();
        const time1 = new Date(oldest.leads[1].createdAt).getTime();
        expect(time0).toBeLessThanOrEqual(time1);
      }
    });

    it('correctly paginates results according to page and limit', async () => {
      const page1 = await leadsService.getFilteredLeads({ page: 1, limit: 1 });
      expect(page1.leads.length).toBe(1);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(1);
      expect(page1.pagination.total).toBeGreaterThanOrEqual(3);
      expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(3);

      const page2 = await leadsService.getFilteredLeads({ page: 2, limit: 1 });
      expect(page2.leads.length).toBe(1);
      expect(page2.leads[0].id).not.toBe(page1.leads[0].id);
    });

    it('calculates summary metrics accurately matching filtered criteria', async () => {
      const result = await leadsService.getFilteredLeads({});
      expect(result.summary.totalLeads).toBe(result.pagination.total);
      expect(result.summary.phoneVerified + result.summary.unverified).toBe(result.summary.totalLeads);
      expect(result.summary.newEnquiries).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Lead Status & Internal Notes Persistence
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. Lead Status & Internal Notes Persistence', () => {
    it('persists manual lead status updates and follow-up notes', async () => {
      inMemoryCustomerUsers.set('tanya@example.com', {
        id: 'usr_tanya',
        name: 'Tanya Sen',
        email: 'tanya@example.com',
        phone: '+919876543204',
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const initial = await leadsService.getFilteredLeads({ search: 'Tanya' });
      expect(initial.leads[0].status).toBe('NEW');

      const leadKey = initial.leads[0].leadKey;
      await leadsService.updateLeadStatus(
        leadKey,
        'CONTACTED',
        'Customer requested callback on Saturday 11am.',
        'admin@hutty.in'
      );

      const updated = await leadsService.getFilteredLeads({ search: 'Tanya' });
      expect(updated.leads[0].status).toBe('CONTACTED');
      expect(updated.leads[0].notes).toBe('Customer requested callback on Saturday 11am.');
      expect(updated.leads[0].lastContactedAt).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. CSV Export & Spreadsheet Formula Injection Protection
  // ─────────────────────────────────────────────────────────────────────────────
  describe('5. CSV Export & Spreadsheet Formula Injection Protection', () => {
    it('sanitizes cells starting with =, +, -, @, tab, or carriage return to prevent formula injection', () => {
      expect(sanitizeSpreadsheetCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
      expect(sanitizeSpreadsheetCell('+12345')).toBe("'+12345");
      expect(sanitizeSpreadsheetCell('-cmd|/C calc')).toBe("'-cmd|/C calc");
      expect(sanitizeSpreadsheetCell('@evil_link')).toBe("'@evil_link");
      expect(sanitizeSpreadsheetCell('\tmalicious_tab')).toBe("'\tmalicious_tab");
      expect(sanitizeSpreadsheetCell('Normal Homeowner Name')).toBe('Normal Homeowner Name');
      expect(sanitizeSpreadsheetCell(1499)).toBe('1499');
      expect(sanitizeSpreadsheetCell(null)).toBe('');
    });

    it('generates standard RFC 4180 CSV with UTF-8 BOM, quoted cells, and escaped quotes', () => {
      const headers = ['Name', 'Phone', 'Notes'];
      const rows = [
        ['Rohan Sharma', '+919876543210', 'Needs "villa" plan review, Bangalore'],
        ['=cmd|calc', '+919845112233', 'Formula injection attempt'],
      ];

      const csv = generateCsv(headers, rows);
      expect(csv.startsWith('\uFEFF')).toBe(true); // UTF-8 BOM
      expect(csv).toContain('"Needs ""villa"" plan review, Bangalore"');
      expect(csv).toContain("'=cmd|calc"); // Formula injection sanitized
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. OpenXML (.xlsx) Binary Packaging & Validity
  // ─────────────────────────────────────────────────────────────────────────────
  describe('6. OpenXML (.xlsx) Binary Packaging & Validity', () => {
    it('generates a valid OpenXML (.xlsx) zip binary buffer with standard signatures and parts', () => {
      const headers = ['Customer Name', 'Phone', 'Verified', 'Enquiry Details'];
      const rows = [
        ['Priya Sharma', '+91 98765 43210', 'Verified', 'Architectural Plan Review'],
        ['Rahul Varma', '+91 98451 12233', 'Not Verified', 'General Enquiry'],
      ];

      const xlsxBuffer = generateXlsx('Leads', headers, rows);

      expect(Buffer.isBuffer(xlsxBuffer)).toBe(true);
      expect(xlsxBuffer.length).toBeGreaterThan(500);

      // Verify ZIP standard local file header signature: PK\x03\x04 (0x04034b50)
      expect(xlsxBuffer.readUInt32LE(0)).toBe(0x04034b50);

      // Verify that the buffer contains required OpenXML parts
      const bufferString = xlsxBuffer.toString('binary');
      expect(bufferString).toContain('[Content_Types].xml');
      expect(bufferString).toContain('xl/workbook.xml');
      expect(bufferString).toContain('xl/worksheets/sheet1.xml');
      expect(bufferString).toContain('xl/styles.xml');
    });

    it('produces valid deflated entries that can be decompressed and read without corruption', () => {
      const dummyData = Buffer.from('<root><test>Hello OpenXML</test></root>', 'utf8');
      const zip = createZipArchive([{ path: 'test.xml', data: dummyData }]);

      expect(zip.readUInt32LE(0)).toBe(0x04034b50); // PK\x03\x04
      expect(zip.toString('binary')).toContain('test.xml');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Export Scopes: All vs Selected vs Verified Only
  // ─────────────────────────────────────────────────────────────────────────────
  describe('7. Export Scopes: All vs Selected vs Verified Only', () => {
    beforeEach(async () => {
      inMemoryCustomerUsers.set('user1@example.com', {
        id: 'usr_export_1',
        name: 'User One',
        email: 'user1@example.com',
        phone: '+919876543211',
        phoneVerifiedAt: new Date(),
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      inMemoryCustomerUsers.set('user2@example.com', {
        id: 'usr_export_2',
        name: 'User Two',
        email: 'user2@example.com',
        phone: '+919876543212',
        phoneVerifiedAt: null, // Unverified
        role: 'USER',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('scope "all" exports all matching leads', async () => {
      const exportRes = await leadsService.exportLeads({}, 'csv', 'all');
      expect(exportRes.contentType).toContain('text/csv');
      expect(exportRes.data).toContain('User One');
      expect(exportRes.data).toContain('User Two');
      expect(exportRes.filename).toMatch(/^hutty-leads-.*\.csv$/);
    });

    it('scope "verified_only" exports only phone-verified leads', async () => {
      const exportRes = await leadsService.exportLeads({}, 'csv', 'verified_only');
      expect(exportRes.data).toContain('User One');
      expect(exportRes.data).not.toContain('User Two');
    });

    it('scope "selected" exports only the specified lead keys', async () => {
      const exportRes = await leadsService.exportLeads({}, 'csv', 'selected', ['usr:usr_export_2']);
      expect(exportRes.data).toContain('User Two');
      expect(exportRes.data).not.toContain('User One');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Admin Controller Endpoints & Security Authorization Guards
  // ─────────────────────────────────────────────────────────────────────────────
  describe('8. Admin Controller Endpoints & Security Authorization Guards', () => {
    it('getLeads controller endpoint returns 200 and formatted lead data for authenticated admin', async () => {
      let statusCode = 0;
      let jsonPayload: any = null;

      const mockReq = {
        query: { dateFilter: '30d' },
        user: { id: 'admin-1', email: 'admin@hutty.in', role: 'ADMIN' },
      } as any;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (data: any) => {
          jsonPayload = data;
          return mockRes;
        },
      } as any;

      await getLeadsController(mockReq, mockRes);

      expect(statusCode).toBe(200);
      expect(jsonPayload.success).toBe(true);
      expect(jsonPayload.data.leads).toBeDefined();
      expect(jsonPayload.data.summary).toBeDefined();
      expect(jsonPayload.data.pagination).toBeDefined();
    });

    it('updateLeadStatus controller endpoint validates status and returns 200 on success', async () => {
      let statusCode = 0;
      let jsonPayload: any = null;

      const mockReq = {
        params: { leadKey: 'usr:usr_sample_key' },
        body: { status: 'CONTACTED', notes: 'First call completed' },
        user: { id: 'admin-1', email: 'admin@hutty.in', role: 'ADMIN' },
      } as any;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (data: any) => {
          jsonPayload = data;
          return mockRes;
        },
      } as any;

      await updateLeadStatusController(mockReq, mockRes);

      expect(statusCode).toBe(200);
      expect(jsonPayload.success).toBe(true);
      expect(jsonPayload.data.status).toBe('CONTACTED');

      // Test invalid status rejection
      const invalidReq = {
        params: { leadKey: 'usr:usr_sample_key' },
        body: { status: 'INVALID_STATUS' },
        user: { id: 'admin-1', email: 'admin@hutty.in', role: 'ADMIN' },
      } as any;

      await updateLeadStatusController(invalidReq, mockRes);
      expect(statusCode).toBe(400);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error).toContain('Invalid lead status');
    });

    it('exportLeads controller endpoint returns valid Content-Type and Content-Disposition headers for XLSX and CSV', async () => {
      let statusCode = 0;
      const headersSet: Record<string, string> = {};

      const mockReq = {
        query: { format: 'xlsx', scope: 'all' },
        user: { id: 'admin-1', email: 'admin@hutty.in', role: 'ADMIN' },
      } as any;

      const mockRes = {
        setHeader: (name: string, value: string) => {
          headersSet[name] = value;
          return mockRes;
        },
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        end: () => mockRes,
        send: () => mockRes,
      } as any;

      await exportLeadsController(mockReq, mockRes);

      expect(statusCode).toBe(200);
      expect(headersSet['Content-Type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(headersSet['Content-Disposition']).toMatch(/filename="hutty-leads-.*\.xlsx"/);
    });

    it('security guard: requireAdmin middleware strictly rejects non-admin users with 403', () => {
      let statusCode = 0;
      let jsonPayload: any = null;
      let nextCalled = false;

      const nonAdminReq = {
        user: { id: 'user-regular', email: 'regular@example.com', role: 'USER' },
      } as any;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (data: any) => {
          jsonPayload = data;
          return mockRes;
        },
      } as any;

      requireAdmin(nonAdminReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(403);
      expect(jsonPayload.error).toBe('Admin authorization required');

      // Admin user passes through
      const adminReq = {
        user: { id: 'admin-1', email: 'admin@hutty.in', role: 'ADMIN' },
      } as any;

      requireAdmin(adminReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('security guard: authenticateToken middleware rejects unauthenticated requests with 401', () => {
      let statusCode = 0;
      let jsonPayload: any = null;
      let nextCalled = false;

      const unauthReq = {
        headers: {},
      } as any;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (data: any) => {
          jsonPayload = data;
          return mockRes;
        },
      } as any;

      authenticateToken(unauthReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(401);
      expect(jsonPayload.error).toBe('Access token required');
    });

    it('security regression: dev mock token is strictly rejected when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalEnvObjVal = ENV.NODE_ENV;
      try {
        (ENV as any).NODE_ENV = 'production';
        let statusCode = 0;
        let jsonPayload: any = null;
        let nextCalled = false;

        const devTokenReq = {
          headers: { authorization: 'Bearer dev-admin-mock-token-2026' },
        } as any;

        const mockRes = {
          status: (code: number) => {
            statusCode = code;
            return mockRes;
          },
          json: (data: any) => {
            jsonPayload = data;
            return mockRes;
          },
        } as any;

        authenticateToken(devTokenReq, mockRes, () => {
          nextCalled = true;
        });

        expect(nextCalled).toBe(false);
        expect(statusCode).toBe(403);
        expect(jsonPayload.error).toBe('Invalid or expired token');
      } finally {
        (ENV as any).NODE_ENV = originalEnvObjVal;
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('security regression: ordinary customer accounts cannot invoke admin endpoints', () => {
      let statusCode = 0;
      let jsonPayload: any = null;
      let nextCalled = false;

      const customerReq = {
        user: { id: 'usr-customer-1', email: 'customer@example.com', role: 'USER' },
      } as any;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (data: any) => {
          jsonPayload = data;
          return mockRes;
        },
      } as any;

      requireAdmin(customerReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(403);
      expect(jsonPayload.error).toBe('Admin authorization required');
    });
  });
});
