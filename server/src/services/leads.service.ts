import { PrismaClient } from '@prisma/client';
import { consultationService } from './consultation.service';
import { pricingService } from './pricing.service';
import { inMemoryCustomerUsers } from '../controllers/auth.controller';
import { normalizeIndianPhoneNumber, formatDomesticPhone } from '../utils/phone';
import { generateCsv, generateXlsx } from '../utils/export.utils';

export type LeadSource = 'ACCOUNT_SIGNUP' | 'CONSULTATION_BOOKING' | 'GENERAL_ENQUIRY' | 'REPORT_PURCHASE';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';

export interface AdminLead {
  id: string; // leadKey
  leadKey: string;
  name: string;
  phone: string;
  phoneFormatted: string;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  email: string | null;
  source: LeadSource;
  sourceLabel: string;
  status: LeadStatus;
  enquiryDetails: string;
  notes: string | null;
  assignedTo: string | null;
  lastContactedAt: string | null;
  createdAt: string; // ISO
  reference: string | null;
  userId: string | null;
  consultationId: string | null;
  projectLocation?: string | null;
  projectType?: string | null;
}

export interface DateRangeBounds {
  startDate: Date;
  endDate: Date;
  label: string;
  startISO: string;
  endISO: string;
}

export interface LeadFilters {
  dateFilter?: string; // 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'prev_month' | 'custom'
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  search?: string;
  source?: string; // 'ALL' | LeadSource
  phoneVerified?: string; // 'ALL' | 'VERIFIED' | 'UNVERIFIED'
  status?: string; // 'ALL' | LeadStatus
  sort?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface LeadsResult {
  leads: AdminLead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalLeads: number;
    phoneVerified: number;
    unverified: number;
    newEnquiries: number;
  };
  activeDateRange: {
    label: string;
    startDate: string;
    endDate: string;
  };
}

export interface InMemoryLeadRecord {
  leadKey: string;
  status: LeadStatus;
  notes?: string | null;
  assignedTo?: string | null;
  lastContactedAt?: Date | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class LeadsService {
  private prisma: PrismaClient | null = null;
  public inMemoryLeadRecords = new Map<string, InMemoryLeadRecord>();

  constructor() {
    if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient();
      } catch {
        this.prisma = null;
      }
    }
  }

  public clearInMemory(): void {
    this.inMemoryLeadRecords.clear();
  }

  /**
   * Calculates precise UTC start and end bounds for dates in Asia/Kolkata (+05:30)
   */
  public resolveDateRange(dateFilter = '30d', customStart?: string, customEnd?: string): DateRangeBounds {
    const now = new Date();
    // Get current YYYY, MM, DD in Asia/Kolkata
    const istFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [currY, currM, currD] = istFormatter.format(now).split('-').map(Number);

    const makeIstStartOfDay = (y: number, m: number, d: number): Date => {
      const mm = m.toString().padStart(2, '0');
      const dd = d.toString().padStart(2, '0');
      return new Date(`${y}-${mm}-${dd}T00:00:00.000+05:30`);
    };

    const makeIstEndOfDay = (y: number, m: number, d: number): Date => {
      const mm = m.toString().padStart(2, '0');
      const dd = d.toString().padStart(2, '0');
      return new Date(`${y}-${mm}-${dd}T23:59:59.999+05:30`);
    };

    switch (dateFilter) {
      case 'today': {
        const start = makeIstStartOfDay(currY, currM, currD);
        const end = makeIstEndOfDay(currY, currM, currD);
        return {
          startDate: start,
          endDate: end,
          label: 'Today',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      case 'yesterday': {
        const target = new Date(makeIstStartOfDay(currY, currM, currD).getTime() - 86400000);
        const [y, m, d] = istFormatter.format(target).split('-').map(Number);
        const start = makeIstStartOfDay(y, m, d);
        const end = makeIstEndOfDay(y, m, d);
        return {
          startDate: start,
          endDate: end,
          label: 'Yesterday',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      case '7d': {
        const target = new Date(makeIstStartOfDay(currY, currM, currD).getTime() - 6 * 86400000);
        const [y, m, d] = istFormatter.format(target).split('-').map(Number);
        const start = makeIstStartOfDay(y, m, d);
        const end = makeIstEndOfDay(currY, currM, currD);
        return {
          startDate: start,
          endDate: end,
          label: 'Last 7 Days',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      case '30d': {
        const target = new Date(makeIstStartOfDay(currY, currM, currD).getTime() - 29 * 86400000);
        const [y, m, d] = istFormatter.format(target).split('-').map(Number);
        const start = makeIstStartOfDay(y, m, d);
        const end = makeIstEndOfDay(currY, currM, currD);
        return {
          startDate: start,
          endDate: end,
          label: 'Last 30 Days',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      case 'this_month': {
        const start = makeIstStartOfDay(currY, currM, 1);
        const end = makeIstEndOfDay(currY, currM, currD);
        return {
          startDate: start,
          endDate: end,
          label: 'This Month',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      case 'prev_month': {
        let prevY = currY;
        let prevM = currM - 1;
        if (prevM === 0) {
          prevM = 12;
          prevY -= 1;
        }
        const lastDayOfPrevMonth = new Date(Date.UTC(prevY, prevM, 0)).getUTCDate();
        const start = makeIstStartOfDay(prevY, prevM, 1);
        const end = makeIstEndOfDay(prevY, prevM, lastDayOfPrevMonth);
        return {
          startDate: start,
          endDate: end,
          label: 'Previous Month',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      case 'custom': {
        if (!customStart || !customEnd) {
          throw new Error('Both start date and end date are required for custom date range filter.');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(customStart) || !/^\d{4}-\d{2}-\d{2}$/.test(customEnd)) {
          throw new Error('Invalid date format for custom date range. Expected YYYY-MM-DD.');
        }
        if (customStart > customEnd) {
          throw new Error('Start date cannot be later than end date.');
        }
        const [sY, sM, sD] = customStart.split('-').map(Number);
        const [eY, eM, eD] = customEnd.split('-').map(Number);
        const start = makeIstStartOfDay(sY, sM, sD);
        const end = makeIstEndOfDay(eY, eM, eD);
        return {
          startDate: start,
          endDate: end,
          label: `${customStart} to ${customEnd}`,
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }

      default: {
        // Fallback to 30d
        const target = new Date(makeIstStartOfDay(currY, currM, currD).getTime() - 29 * 86400000);
        const [y, m, d] = istFormatter.format(target).split('-').map(Number);
        const start = makeIstStartOfDay(y, m, d);
        const end = makeIstEndOfDay(currY, currM, currD);
        return {
          startDate: start,
          endDate: end,
          label: 'Last 30 Days',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        };
      }
    }
  }

  /**
   * Assembles all raw leads from existing models (ConsultationRequests, Users, PricingPurchases)
   * applying deduplication to prevent duplicate rows when a customer booked a consultation.
   */
  public async assembleAllLeads(): Promise<AdminLead[]> {
    const leads: AdminLead[] = [];
    const leadRecordMap = new Map<string, { status: LeadStatus; notes?: string | null; lastContactedAt?: Date | null; assignedTo?: string | null }>();

    // 1. Fetch persistent LeadRecords if DB available
    if (this.prisma) {
      try {
        const records = await (this.prisma as any).leadRecord.findMany();
        for (const r of records) {
          leadRecordMap.set(r.leadKey, {
            status: r.status as LeadStatus,
            notes: r.notes,
            lastContactedAt: r.lastContactedAt,
            assignedTo: r.assignedTo,
          });
        }
      } catch {
        // Non-fatal, fallback to inMemoryLeadRecords
      }
    }

    // Merge in-memory LeadRecords
    for (const [key, val] of this.inMemoryLeadRecords.entries()) {
      leadRecordMap.set(key, {
        status: val.status,
        notes: val.notes,
        lastContactedAt: val.lastContactedAt,
        assignedTo: val.assignedTo,
      });
    }

    // 2. Fetch all verified users to check verification status across sources
    const verifiedUsersByPhone = new Map<string, { id: string; email: string; phoneVerifiedAt: Date | null }>();
    const allUsers: any[] = [];

    if (this.prisma) {
      try {
        let dbUsers: any[] = [];
        try {
          dbUsers = await (this.prisma as any).user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              phoneVerifiedAt: true,
            },
          });
        } catch {
          try {
            dbUsers = await (this.prisma as any).user.findMany({
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
              },
            });
          } catch {
            const raw = await (this.prisma as any).$queryRawUnsafe(
              `SELECT "id", "name", "email", "phone", "role"::text as "role" FROM "User";`
            );
            if (Array.isArray(raw)) dbUsers = raw;
          }
        }

        for (const u of dbUsers) {
          allUsers.push(u);
          if (u.phone) {
            const norm = normalizeIndianPhoneNumber(u.phone);
            if (norm.isValid) {
              verifiedUsersByPhone.set(norm.e164, {
                id: u.id,
                email: u.email,
                phoneVerifiedAt: u.phoneVerifiedAt ? new Date(u.phoneVerifiedAt) : null,
              });
            }
          }
        }
      } catch {
        // Non-fatal, fallback to inMemoryCustomerUsers
      }
    }

    for (const u of inMemoryCustomerUsers.values()) {
      // Avoid duplicate user by id
      if (!allUsers.some((x) => x.id === u.id || x.email.toLowerCase() === u.email.toLowerCase())) {
        allUsers.push(u);
      }
      if (u.phone) {
        const norm = normalizeIndianPhoneNumber(u.phone);
        if (norm.isValid) {
          verifiedUsersByPhone.set(norm.e164, {
            id: u.id,
            email: u.email,
            phoneVerifiedAt: u.phoneVerifiedAt ? new Date(u.phoneVerifiedAt) : null,
          });
        }
      }
    }

    // Track contacts that have consultations to prevent duplicate rows for the same consultation event
    const contactsWithConsultation = new Set<string>();

    // 3. Assemble Consultation and General Enquiry Leads
    let consultations: any[] = [];
    if (this.prisma) {
      try {
        consultations = await (this.prisma as any).consultationRequest.findMany({
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        });
      } catch {
        consultations = [];
      }
    }
    // Also include in-memory consultations if not already present
    const inMemReqs = (consultationService as any).inMemoryRequests || [];
    const inMemPayments = (consultationService as any).inMemoryPayments || [];
    for (const im of inMemReqs) {
      if (!consultations.some((c) => c.id === im.id || c.publicReference === im.publicReference)) {
        consultations.push({
          ...im,
          payments: inMemPayments.filter((p: any) => p.consultationRequestId === im.id),
        });
      }
    }

    for (const c of consultations) {
      // Attach in-memory payments if prisma payments were empty
      if (!c.payments || c.payments.length === 0) {
        c.payments = inMemPayments.filter((p: any) => p.consultationRequestId === c.id);
      }

      const normPhone = normalizeIndianPhoneNumber(c.homeownerPhone);
      const phoneDigits = normPhone.isValid ? normPhone.domestic : c.homeownerPhone;
      const phoneDisplay = normPhone.isValid ? `+91 ${formatDomesticPhone(normPhone.domestic)}` : formatDomesticPhone(phoneDigits);
      const normEmail = c.homeownerEmail ? c.homeownerEmail.toLowerCase().trim() : null;

      if (normPhone.isValid) contactsWithConsultation.add(normPhone.e164);
      if (normEmail) contactsWithConsultation.add(normEmail);
      if (c.userId) contactsWithConsultation.add(c.userId);

      const isGeneralEnquiry = c.publicReference?.startsWith('HT-ENQ-') || c.consultationTopic?.toLowerCase().includes('general enquiry');
      const source: LeadSource = isGeneralEnquiry ? 'GENERAL_ENQUIRY' : 'CONSULTATION_BOOKING';
      const sourceLabel = isGeneralEnquiry ? 'General Enquiry' : 'Consultation Booking';

      // Determine authoritative payment status for consultation
      const hasPaidPayment =
        c.payments?.some((p: any) => p.status === 'PAID') ||
        c.status === 'AWAITING_REVIEW' ||
        c.status === 'ASSIGNED' ||
        c.status === 'UNDER_REVIEW' ||
        c.status === 'SCHEDULED' ||
        c.status === 'COMPLETED';

      const isPendingPayment = !hasPaidPayment && (c.payments?.some((p: any) => p.status === 'PENDING') || c.status === 'PENDING');
      const paymentTag = isGeneralEnquiry
        ? ''
        : (hasPaidPayment ? 'Fee: ₹1,499 (PAID)' : (isPendingPayment ? 'Fee: ₹1,499 (PENDING)' : `Status: ${c.status}`));

      // Authoritative verification check:
      // Must be verified via authoritative verification flow (verifiedUsersByPhone or attached verified user record)
      let phoneVerified = false;
      let phoneVerifiedAt: string | null = null;

      if (normPhone.isValid && verifiedUsersByPhone.has(normPhone.e164)) {
        const u = verifiedUsersByPhone.get(normPhone.e164)!;
        if (u.phoneVerifiedAt) {
          phoneVerified = true;
          phoneVerifiedAt = new Date(u.phoneVerifiedAt).toISOString();
        }
      }
      if (!phoneVerified && c.userId) {
        const u = allUsers.find((x) => x.id === c.userId);
        if (u && u.phoneVerifiedAt) {
          phoneVerified = true;
          phoneVerifiedAt = new Date(u.phoneVerifiedAt).toISOString();
        }
      }

      const leadKey = `con:${c.id}`;
      const rec = leadRecordMap.get(leadKey);

      const detailsParts = [
        paymentTag,
        c.consultationTopic ? `Topic: ${c.consultationTopic}` : '',
        c.consultantNameSnapshot && c.consultantNameSnapshot !== 'Hutty Expert Desk' ? `Expert: ${c.consultantNameSnapshot}` : '',
        c.projectLocation ? `Loc: ${c.projectLocation}` : '',
        c.projectType ? `Type: ${c.projectType}` : '',
        c.preferredDate ? `Slot: ${c.preferredDate} ${c.preferredTime || ''}`.trim() : '',
        c.message ? `"${c.message}"` : '',
      ].filter(Boolean);

      leads.push({
        id: leadKey,
        leadKey,
        name: c.homeownerName || 'Valued Homeowner',
        phone: normPhone.isValid ? normPhone.e164 : c.homeownerPhone,
        phoneFormatted: phoneDisplay,
        phoneVerified,
        phoneVerifiedAt,
        email: normEmail,
        source,
        sourceLabel,
        status: rec?.status || (hasPaidPayment ? 'CONVERTED' : 'NEW'),
        enquiryDetails: detailsParts.join(' | ') || 'Consultation Request',
        notes: rec?.notes || null,
        assignedTo: rec?.assignedTo || null,
        lastContactedAt: rec?.lastContactedAt ? new Date(rec.lastContactedAt).toISOString() : null,
        createdAt: new Date(c.createdAt).toISOString(),
        reference: c.publicReference || null,
        userId: c.userId || null,
        consultationId: c.id,
        projectLocation: c.projectLocation || null,
        projectType: c.projectType || null,
      });
    }

    // 4. Assemble Report Purchase Leads
    let purchases: any[] = [];
    if (this.prisma) {
      try {
        purchases = await (this.prisma as any).pricingPurchase.findMany({
          orderBy: { createdAt: 'desc' },
        });
      } catch {
        purchases = [];
      }
    }
    const inMemPurchases = (pricingService as any).inMemoryPurchases || [];
    for (const imp of inMemPurchases) {
      if (!purchases.some((p) => p.id === imp.id || p.publicReference === imp.publicReference)) {
        purchases.push(imp);
      }
    }

    for (const p of purchases) {
      const normPhone = normalizeIndianPhoneNumber(p.leadPhone);
      const phoneDigits = normPhone.isValid ? normPhone.domestic : p.leadPhone;
      const phoneDisplay = normPhone.isValid ? `+91 ${formatDomesticPhone(normPhone.domestic)}` : formatDomesticPhone(phoneDigits);
      const normEmail = p.leadEmail ? p.leadEmail.toLowerCase().trim() : null;

      let phoneVerified = false;
      let phoneVerifiedAt: string | null = null;
      if (normPhone.isValid && verifiedUsersByPhone.has(normPhone.e164)) {
        const u = verifiedUsersByPhone.get(normPhone.e164)!;
        if (u.phoneVerifiedAt) {
          phoneVerified = true;
          phoneVerifiedAt = new Date(u.phoneVerifiedAt).toISOString();
        }
      }

      const leadKey = `pur:${p.id}`;
      const rec = leadRecordMap.get(leadKey);

      leads.push({
        id: leadKey,
        leadKey,
        name: p.leadName || 'Homeowner Buyer',
        phone: normPhone.isValid ? normPhone.e164 : p.leadPhone,
        phoneFormatted: phoneDisplay,
        phoneVerified,
        phoneVerifiedAt,
        email: normEmail,
        source: 'REPORT_PURCHASE',
        sourceLabel: 'Report Purchase',
        status: rec?.status || (p.status === 'PAID' ? 'CONVERTED' : 'NEW'),
        enquiryDetails: `Purchased: ${p.tierNameSnapshot || 'Construction Estimate Report'} (₹${Math.round((p.amountMinorUnits || 0) / 100)}) | Status: ${p.status}`,
        notes: rec?.notes || null,
        assignedTo: rec?.assignedTo || null,
        lastContactedAt: rec?.lastContactedAt ? new Date(rec.lastContactedAt).toISOString() : null,
        createdAt: new Date(p.createdAt).toISOString(),
        reference: p.publicReference || null,
        userId: p.userId || null,
        consultationId: null,
      });
    }

    // 5. Assemble Customer Account Signups (Deduplicating accounts that already placed a consultation)
    for (const u of allUsers) {
      const normPhone = normalizeIndianPhoneNumber(u.phone);
      const normEmail = u.email ? u.email.toLowerCase().trim() : null;

      // Deduplication check: If this customer is already represented by a consultation enquiry,
      // we avoid duplicating the person as a separate bare signup lead.
      const alreadyHasConsultation =
        contactsWithConsultation.has(u.id) ||
        (normPhone.isValid && contactsWithConsultation.has(normPhone.e164)) ||
        (normEmail && contactsWithConsultation.has(normEmail));

      if (alreadyHasConsultation) {
        continue;
      }

      const phoneDigits = normPhone.isValid ? normPhone.domestic : (u.phone || '9999999999');
      const phoneDisplay = normPhone.isValid ? `+91 ${formatDomesticPhone(normPhone.domestic)}` : formatDomesticPhone(phoneDigits);
      const phoneVerified = Boolean(u.phoneVerifiedAt);
      const phoneVerifiedAt = u.phoneVerifiedAt ? new Date(u.phoneVerifiedAt).toISOString() : null;

      const leadKey = `usr:${u.id}`;
      const rec = leadRecordMap.get(leadKey);

      leads.push({
        id: leadKey,
        leadKey,
        name: u.name || 'Registered Homeowner',
        phone: normPhone.isValid ? normPhone.e164 : (u.phone || '+919999999999'),
        phoneFormatted: phoneDisplay,
        phoneVerified,
        phoneVerifiedAt,
        email: normEmail,
        source: 'ACCOUNT_SIGNUP',
        sourceLabel: 'Account Signup',
        status: rec?.status || 'NEW',
        enquiryDetails: `Registered Customer Account (${phoneVerified ? 'Phone Verified' : 'Unverified'})`,
        notes: rec?.notes || null,
        assignedTo: rec?.assignedTo || null,
        lastContactedAt: rec?.lastContactedAt ? new Date(rec.lastContactedAt).toISOString() : null,
        createdAt: new Date(u.createdAt || Date.now()).toISOString(),
        reference: `USR-${u.id.slice(0, 8).toUpperCase()}`,
        userId: u.id,
        consultationId: null,
      });
    }

    return leads;
  }

  /**
   * Queries, filters, sorts, and paginates leads
   */
  public async getFilteredLeads(filters: LeadFilters): Promise<LeadsResult> {
    const bounds = this.resolveDateRange(filters.dateFilter, filters.startDate, filters.endDate);
    const allLeads = await this.assembleAllLeads();

    // Apply filtering
    const filtered = allLeads.filter((lead) => {
      const leadTime = new Date(lead.createdAt).getTime();

      // 1. Date range filter
      if (leadTime < bounds.startDate.getTime() || leadTime > bounds.endDate.getTime()) {
        return false;
      }

      // 2. Search query filter (name, phone, email)
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const cleanPhone = lead.phone.replace(/\D/g, '');
        const searchPhone = q.replace(/\D/g, '');
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesEmail = lead.email ? lead.email.toLowerCase().includes(q) : false;
        const matchesPhone = searchPhone.length > 2 ? cleanPhone.includes(searchPhone) : lead.phone.includes(q);
        const matchesRef = lead.reference ? lead.reference.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesRef) {
          return false;
        }
      }

      // 3. Lead Source filter
      if (filters.source && filters.source !== 'ALL') {
        if (lead.source !== filters.source) {
          return false;
        }
      }

      // 4. Phone verification status filter
      if (filters.phoneVerified && filters.phoneVerified !== 'ALL') {
        if (filters.phoneVerified === 'VERIFIED' && !lead.phoneVerified) return false;
        if (filters.phoneVerified === 'UNVERIFIED' && lead.phoneVerified) return false;
      }

      // 5. Lead status filter
      if (filters.status && filters.status !== 'ALL') {
        if (lead.status !== filters.status) return false;
      }

      return true;
    });

    // Sort leads
    const isOldest = filters.sort === 'oldest';
    filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return isOldest ? timeA - timeB : timeB - timeA;
    });

    // Summary calculation over entire filtered set
    const summary = {
      totalLeads: filtered.length,
      phoneVerified: filtered.filter((l) => l.phoneVerified).length,
      unverified: filtered.filter((l) => !l.phoneVerified).length,
      newEnquiries: filtered.filter((l) => l.status === 'NEW').length,
    };

    // Pagination
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 25));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedLeads = filtered.slice(startIndex, startIndex + limit);

    return {
      leads: paginatedLeads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      summary,
      activeDateRange: {
        label: bounds.label,
        startDate: bounds.startISO,
        endDate: bounds.endISO,
      },
    };
  }

  /**
   * Updates or persists lead status and internal admin notes
   */
  public async updateLeadStatus(
    leadKey: string,
    status: LeadStatus,
    notes?: string,
    adminEmail = 'admin@hutty.in'
  ): Promise<InMemoryLeadRecord> {
    const now = new Date();
    const isContactedOrClosed = status === 'CONTACTED' || status === 'CONVERTED' || status === 'CLOSED';

    const existingMem = this.inMemoryLeadRecords.get(leadKey);
    const record: InMemoryLeadRecord = {
      leadKey,
      status,
      notes: notes !== undefined ? notes : existingMem?.notes || null,
      assignedTo: existingMem?.assignedTo || null,
      lastContactedAt: isContactedOrClosed ? now : existingMem?.lastContactedAt || null,
      updatedBy: adminEmail,
      createdAt: existingMem?.createdAt || now,
      updatedAt: now,
    };

    this.inMemoryLeadRecords.set(leadKey, record);

    if (this.prisma) {
      try {
        await (this.prisma as any).leadRecord.upsert({
          where: { leadKey },
          update: {
            status,
            notes: record.notes,
            lastContactedAt: record.lastContactedAt,
            updatedBy: adminEmail,
            updatedAt: now,
          },
          create: {
            leadKey,
            status,
            notes: record.notes,
            lastContactedAt: record.lastContactedAt,
            updatedBy: adminEmail,
            createdAt: now,
            updatedAt: now,
          },
        });
      } catch (err) {
        console.warn('[LeadsService] Non-fatal DB leadRecord upsert warning:', err);
      }
    }

    return record;
  }

  /**
   * Generates CSV or XLSX export file buffer with descriptive filename
   */
  public async exportLeads(
    filters: LeadFilters,
    format: 'csv' | 'xlsx',
    scope: 'all' | 'selected' | 'verified_only',
    selectedIds?: string[]
  ): Promise<{ filename: string; contentType: string; data: Buffer | string }> {
    const bounds = this.resolveDateRange(filters.dateFilter, filters.startDate, filters.endDate);
    const result = await this.getFilteredLeads({
      ...filters,
      page: 1,
      limit: 10000, // Export all matching results up to large limit
    });

    let exportSet = result.leads;

    if (scope === 'selected' && selectedIds && selectedIds.length > 0) {
      const selectedSet = new Set(selectedIds);
      exportSet = exportSet.filter((l) => selectedSet.has(l.leadKey) || selectedSet.has(l.id));
    } else if (scope === 'verified_only') {
      exportSet = exportSet.filter((l) => l.phoneVerified);
    }

    const headers = [
      'Customer Name',
      'Phone Number',
      'Phone Verified',
      'Email',
      'Lead Source',
      'Enquiry Details',
      'Lead Status',
      'Created Date',
      'Created Time',
    ];

    const istTimeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const rows = exportSet.map((lead) => {
      const dateObj = new Date(lead.createdAt);
      const createdDate = istDateFormatter.format(dateObj);
      const createdTime = istTimeFormatter.format(dateObj);

      return [
        lead.name,
        lead.phoneFormatted || lead.phone,
        lead.phoneVerified ? 'Verified' : 'Not Verified',
        lead.email || 'N/A',
        lead.sourceLabel,
        lead.enquiryDetails,
        lead.status,
        createdDate,
        createdTime,
      ];
    });

    const sDate = istDateFormatter.format(bounds.startDate);
    const eDate = istDateFormatter.format(bounds.endDate);
    const filename = `hutty-leads-${sDate}-to-${eDate}.${format}`;

    if (format === 'csv') {
      const csv = generateCsv(headers, rows);
      return {
        filename,
        contentType: 'text/csv; charset=utf-8',
        data: csv,
      };
    } else {
      const xlsxBuffer = generateXlsx('Hutty Leads', headers, rows);
      return {
        filename,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: xlsxBuffer,
      };
    }
  }
}

export const leadsService = new LeadsService();
