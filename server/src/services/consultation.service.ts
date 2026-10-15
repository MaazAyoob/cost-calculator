// ==============================================================================
// Hutty Consultation Service (Phase 1B Production Hardened)
// PostgreSQL persistence via Prisma with transactional integrity and in-memory fallback.
// Enforces server-authoritative ₹1,499 (149900 paise) pricing and security controls.
// ==============================================================================

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import {
  CONSULTATION_PRICE_INR,
  CONSULTATION_PRICE_PAISE,
  CONSULTATION_CURRENCY,
  ConsultationCategory,
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  mapCategoryToConsultantCategories,
  CATEGORY_DETAILS,
  POPULAR_SERVICES,
  CanonicalConsultationCategory,
} from '../constants/consultation.constants';
import { CreateBookingRequestInput } from '../validators/consultation.validator';
import { cashfreeService } from './cashfree.service';
import { projectService } from './project.service';
import { ENV } from '../config/env';

export interface ProfessionalApplicationEntity {
  id: string;
  fullName: string;
  category: string;
  email: string;
  phone: string;
  qualifications: string;
  licenseNumber: string | null;
  experienceYears: number;
  city: string;
  serviceAreas: string[];
  expertise: string[];
  portfolioLinks: string[];
  consultationModes: string[];
  proposedServices: string[];
  proposedFeeINR: number;
  documentsJson: any | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  adminReviewerId: string | null;
  adminReviewNotes: string | null;
  reviewerNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason: string | null;
  approvedConsultantId: string | null;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultantEntity {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: ConsultationCategory | string;
  profileImage: string | null;
  experienceYears: number;
  city: string;
  serviceAreas: string[];
  about: string;
  description?: string;
  specializations: string[];
  services: string[];
  active: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationRequestEntity {
  id: string;
  publicReference: string;
  idempotencyKey?: string | null;
  userId: string | null;
  consultantId: string | null;
  consultant?: ConsultantEntity | null;
  consultantNameSnapshot?: string | null;
  consultantTitleSnapshot?: string | null;
  homeownerName: string;
  homeownerPhone: string;
  homeownerEmail: string;
  projectId: string | null;
  projectSnapshot: any | null;
  projectLocation: string;
  projectType: string;
  consultationTopic: string;
  message: string | null;
  preferredDate: string;
  preferredTime: string;
  confirmedDateTime: string | null;
  status:
    | 'AWAITING_REVIEW'
    | 'UNDER_REVIEW'
    | 'ASSIGNED'
    | 'ACCEPTED'
    | 'SCHEDULED'
    | 'RESCHEDULE_REQUESTED'
    | 'COMPLETED'
    | 'REJECTED'
    | 'CANCELLED';
  amountMinorUnits: number;
  amountINR?: number;
  amountPaise?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  payments?: ConsultationPaymentEntity[];
  events?: ConsultationEventEntity[];
}

export interface ConsultationPaymentEntity {
  id: string;
  consultationRequestId: string;
  gateway: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  gatewaySignature: string | null;
  paymentSessionId?: string | null;
  payment_session_id?: string | null;
  environment?: string;
  amountMinorUnits: number;
  amountINR?: number;
  amountPaise?: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';
  verifiedAt: string | null;
  rawResponseJson?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationEventEntity {
  id: string;
  consultationRequestId: string;
  actorId: string | null;
  actorRole: string | null;
  eventType: string;
  title: string;
  internalNote: string | null;
  metadataJson: any | null;
  createdAt: string;
}

// Initial Curated Seed Consultants (Real architectural and structural profiles for Hutty Bangalore)
export const INITIAL_CONSULTANTS: ConsultantEntity[] = [
  {
    id: 'cons-ar-ramesh',
    slug: 'ar-ramesh-nambiar',
    name: 'Ar. Ramesh Nambiar',
    title: 'Principal Residential Architect',
    category: 'Architect',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    experienceYears: 16,
    city: 'Bangalore',
    serviceAreas: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'All Bangalore'],
    about:
      'Registered with the Council of Architecture (CoA) with over 16 years leading custom luxury villas and biophilic residential designs across Bangalore. Specializes in maximizing natural ventilation, Vastu compliance, and local BBMP/BMRDA setback adherence.',
    specializations: ['Bespoke Villa Design', 'Vastu-Compliant Space Planning', 'BBMP Setback Optimization', 'Passive Solar Lighting'],
    services: ['Architectural Plan Review', 'Floor Layout Optimization', 'Facade & Elevation Design Review'],
    active: true,
    featured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cons-eng-sneha',
    slug: 'er-sneha-kulkarni',
    name: 'Er. Sneha Kulkarni',
    title: 'Senior Chartered Structural Engineer',
    category: 'Structural Engineer',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    experienceYears: 14,
    city: 'Bangalore',
    serviceAreas: ['All Bangalore', 'Electronic City', 'Sarjapur Road', 'Hebbal'],
    about:
      'M.Tech in Structural Engineering from IISc Bangalore. Independent structural auditor for over 250+ G+2 through G+5 residences. Expert in soil-bearing capacity assessments, earthquake-resistant RCC frame detailing, and steel/cement BOQ audits.',
    specializations: ['RCC Frame & Slab Audit', 'Steel & Cement Quantity Optimization', 'Soil Feasibility & Foundation Design', 'Structural Defect Diagnostics'],
    services: ['Structural Drawing Vetting', 'Steel Factor Review (kg/sqft)', 'Crack & Settlement Risk Assessment'],
    active: true,
    featured: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cons-ctr-anand',
    slug: 'anand-vardhan',
    name: 'Anand Vardhan',
    title: 'Class-1 General Contractor & Builder',
    category: 'Contractor',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    experienceYears: 20,
    city: 'Bangalore',
    serviceAreas: ['Jayanagar', 'JP Nagar', 'Kanakapura Road', 'Banashankari'],
    about:
      'Veteran turnkey civil contractor with 20+ years of on-ground residential execution in South Bangalore. Provides objective third-party quote reviews to safeguard homeowners from contractor hidden clauses, inflated item rates, and milestone traps.',
    specializations: ['Contractor Quote Review', 'Turnkey Milestone Verification', 'Labour Rate Audits', 'Site Quality Checklists'],
    services: ['Contractor Quote & Rate Audit', 'Milestone Payment Sanity Check', 'Material Takeoff Verification'],
    active: true,
    featured: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cons-int-priya',
    slug: 'priya-sharma',
    name: 'Priya Sharma',
    title: 'Lead Interior Architect & Spatial Consultant',
    category: 'Interior Designer',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    experienceYears: 11,
    city: 'Bangalore',
    serviceAreas: ['North Bangalore', 'Whitefield', 'Indiranagar', 'Bellandur'],
    about:
      'Specialist in modern contemporary residential interiors and modular kitchen efficiency. Helps homeowners evaluate interior quotes, optimize joinery specifications, and avoid excessive vendor markups.',
    specializations: ['Modular Kitchen Ergonomics', 'Joinery & Wardrobe Cost Optimization', 'Lighting & False Ceiling Plans', 'Material Selection Guides'],
    services: ['Interior Quote Audit', 'Electrical & Plumbing Point Alignment', 'Woodwork & Finish Vetting'],
    active: true,
    featured: false,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cons-app-krishna',
    slug: 'm-krishna-murthy',
    name: 'M. Krishna Murthy',
    title: 'Senior Sanction & Approvals Liaison Officer',
    category: 'Approvals Consultant',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    experienceYears: 22,
    city: 'Bangalore',
    serviceAreas: ['BBMP Zones', 'BDA Layouts', 'BMRDA', 'Gram Panchayat'],
    about:
      'Former municipal liaison consultant with in-depth command of Bangalore Revised Master Plan (RMP 2015/2031), BBMP building bylaws, FAR calculations, setback rules, and occupancy certificate (OC/CC) procedures.',
    specializations: ['BBMP Plan Sanction Guidance', 'FAR & Premium FAR Calculation', 'BDA Khata Bifurcation / Transfer', 'NOC & Utility Approvals'],
    services: ['Building Plan Sanction Feasibility', 'Violation & Setback Advisory', 'Bylaw Compliance Review'],
    active: true,
    featured: false,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cons-qs-vinay',
    slug: 'vinay-sundaram',
    name: 'Vinay Sundaram',
    title: 'Certified Quantity Surveyor (MRICS)',
    category: 'Quantity Surveyor',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    experienceYears: 13,
    city: 'Bangalore',
    serviceAreas: ['All Bangalore', 'Mysore', 'Hosur Belt'],
    about:
      'Chartered Quantity Surveyor providing independent Bill of Quantities (BOQ) preparation, rate analysis, and financial cost control to prevent budget overruns during house construction.',
    specializations: ['Detailed BOQ Preparation', 'Rate Analysis & Variance Control', 'Contract Dispute Resolution', 'Material Takeoff (MTO) Audits'],
    services: ['Comprehensive BOQ Verification', 'Material Wastage Audit', 'Budget Cap Feasibility'],
    active: true,
    featured: false,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cons-sup-manjunath',
    slug: 'manjunath-gowda',
    name: 'Manjunath Gowda',
    title: 'Senior Resident Site Supervisor',
    category: 'Site Supervisor',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    experienceYears: 18,
    city: 'Bangalore',
    serviceAreas: ['West Bangalore', 'Rajajinagar', 'Malleshwaram', 'Yeshwanthpur'],
    about:
      'Hands-on construction quality supervisor with expertise in shuttering inspection, slump testing, rebar cover block verification, and curing schedules for residential builds.',
    specializations: ['Shuttering & Rebar Inspection', 'Concrete Slump & Cube Test Verification', 'Waterproofing Application Audit', 'Daily Progress Tracking'],
    services: ['Site Stage Inspection Planning', 'Construction Workmanship Audit', 'Curing & Concrete Quality Review'],
    active: true,
    featured: false,
    displayOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class ConsultationService {
  private prisma: PrismaClient | null = null;
  private inMemoryConsultants: ConsultantEntity[] = [...INITIAL_CONSULTANTS];
  private inMemoryRequests: ConsultationRequestEntity[] = [];
  private inMemoryPayments: ConsultationPaymentEntity[] = [];
  private inMemoryEvents: ConsultationEventEntity[] = [];
  private inMemoryApplications: ProfessionalApplicationEntity[] = [];

  constructor() {
    if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient();
        this.syncSeedsToPrisma();
      } catch {
        this.prisma = null;
      }
    } else {
      this.prisma = null;
    }
  }

  private isDbConnected(): boolean {
    return Boolean(this.prisma && process.env.DATABASE_URL);
  }

  /**
   * Safe sync initial seed consultants into Postgres if table is empty
   */
  private async syncSeedsToPrisma() {
    if (!this.prisma) return;
    try {
      const count = await (this.prisma as any).consultant.count();
      if (count === 0) {
        for (const c of INITIAL_CONSULTANTS) {
          await (this.prisma as any).consultant.create({
            data: {
              id: c.id,
              slug: c.slug,
              name: c.name,
              title: c.title,
              category: c.category,
              profileImage: c.profileImage,
              experienceYears: c.experienceYears,
              city: c.city,
              serviceAreas: c.serviceAreas,
              about: c.about,
              specializations: c.specializations,
              services: c.services,
              active: c.active,
              featured: c.featured,
              displayOrder: c.displayOrder,
            },
          });
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC CONSULTANTS
  // ═════════════════════════════════════════════════════════════════════════

  public async getActiveConsultants(
    params?:
      | {
          category?: string;
          search?: string;
          city?: string;
        }
      | string,
    searchArg?: string,
    cityArg?: string
  ): Promise<ConsultantEntity[]> {
    let category: string | undefined;
    let search: string | undefined;
    let city: string | undefined;

    if (typeof params === 'string') {
      category = params;
      search = typeof searchArg === 'string' ? searchArg : undefined;
      city = typeof cityArg === 'string' ? cityArg : undefined;
    } else if (params && typeof params === 'object') {
      category = params.category;
      search = params.search;
      city = params.city;
    }

    const mappedCategories = category && category !== 'ALL' ? mapCategoryToConsultantCategories(category) : [];

    if (this.prisma) {
      try {
        const where: any = { active: true };
        if (category && category !== 'ALL') {
          where.OR = [
            { category: { equals: category, mode: 'insensitive' } },
            ...mappedCategories.map((c) => ({ category: { equals: c, mode: 'insensitive' } })),
          ];
        }
        if (city && city !== 'ALL') {
          where.city = { contains: city, mode: 'insensitive' };
        }
        if (typeof search === 'string' && search.trim()) {
          const q = search.trim();
          const searchConditions = [
            { name: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { about: { contains: q, mode: 'insensitive' } },
            { specializations: { has: q } },
          ];
          if (where.OR) {
            where.AND = [{ OR: where.OR }, { OR: searchConditions }];
            delete where.OR;
          } else {
            where.OR = searchConditions;
          }
        }

        const consultants = await (this.prisma as any).consultant.findMany({
          where,
          orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }, { name: 'asc' }],
        });

        if (Array.isArray(consultants)) {
          return consultants.map(this.mapPrismaConsultant);
        }
      } catch {
        // Fallback to in-memory
      }
    }

    return this.inMemoryConsultants
      .filter((c) => {
        if (!c.active) return false;
        if (category && category !== 'ALL') {
          const catLower = category.toLowerCase();
          const mappedLowers = mappedCategories.map((m) => m.toLowerCase());
          const matchesCategory =
            c.category.toLowerCase() === catLower ||
            mappedLowers.includes(c.category.toLowerCase());
          if (!matchesCategory) return false;
        }
        if (
          city &&
          city !== 'ALL' &&
          !c.city.toLowerCase().includes(city.toLowerCase()) &&
          !c.serviceAreas.some((a) => a.toLowerCase().includes(city.toLowerCase()))
        ) {
          return false;
        }
        if (typeof search === 'string' && search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = c.name.toLowerCase().includes(q);
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchAbout = c.about.toLowerCase().includes(q);
          const matchSpec = c.specializations.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchTitle && !matchAbout && !matchSpec) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.displayOrder - b.displayOrder;
      });
  }

  public async getConsultantBySlug(slug: string, publicOnly = true): Promise<ConsultantEntity | null> {
    const cleanSlug = slug.toLowerCase().trim();
    if (this.prisma && process.env.DATABASE_URL) {
      try {
        const consultant = await (this.prisma as any).consultant.findUnique({
          where: { slug: cleanSlug },
        });
        if (consultant) {
          const mapped = this.mapPrismaConsultant(consultant);
          if (publicOnly && !mapped.active) return null;
          return mapped;
        }
      } catch {
        // Fallback
      }
    }

    const found = this.inMemoryConsultants.find((c) => c.slug.toLowerCase() === cleanSlug);
    if (!found) return null;
    if (publicOnly && !found.active) return null;
    return found;
  }

  public async getConsultantById(id: string): Promise<ConsultantEntity | null> {
    if (this.prisma) {
      try {
        const consultant = await (this.prisma as any).consultant.findUnique({
          where: { id },
        });
        if (consultant) {
          return this.mapPrismaConsultant(consultant);
        }
      } catch {
        // Fallback
      }
    }

    return this.inMemoryConsultants.find((c) => c.id === id) || null;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ADMIN CONSULTANT MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  public async getAllConsultantsAdmin(): Promise<ConsultantEntity[]> {
    if (this.prisma) {
      try {
        const consultants = await (this.prisma as any).consultant.findMany({
          orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }, { name: 'asc' }],
        });
        if (Array.isArray(consultants)) {
          return consultants.map(this.mapPrismaConsultant);
        }
      } catch {
        // Fallback
      }
    }

    return [...this.inMemoryConsultants].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.displayOrder - b.displayOrder;
    });
  }

  public async createConsultant(data: any, _adminEmail = 'admin@hutty.in'): Promise<ConsultantEntity> {
    const slugBase = (data.slug || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;

    const id = `cons-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const newConsultant: ConsultantEntity = {
      id,
      slug,
      name: data.name.trim(),
      title: data.title.trim(),
      category: data.category,
      profileImage: data.profileImage || null,
      experienceYears: Number(data.experienceYears) || 5,
      city: data.city?.trim() || 'Bangalore',
      serviceAreas: Array.isArray(data.serviceAreas) ? data.serviceAreas : [],
      about: data.about?.trim() || data.description?.trim() || '',
      description: data.about?.trim() || data.description?.trim() || '',
      specializations: Array.isArray(data.specializations) ? data.specializations : [],
      services: Array.isArray(data.services) ? data.services : [],
      active: data.active !== undefined ? Boolean(data.active) : true,
      featured: Boolean(data.featured),
      displayOrder: Number(data.displayOrder) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isDbConnected()) {
      try {
        const { description: _ignoreDesc, ...prismaCreateData } = newConsultant as any;
        const created = await (this.prisma as any).consultant.create({
          data: {
            ...prismaCreateData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        const mapped = this.mapPrismaConsultant(created);
        this.inMemoryConsultants.unshift(mapped);
        return mapped;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to create consultant in database: ' + err.message);
        }
        console.warn('[ConsultationService] Prisma createConsultant failed, using in-memory:', err.message);
      }
    }

    this.inMemoryConsultants.unshift(newConsultant);
    return newConsultant;
  }

  public async updateConsultant(id: string, data: any, _adminEmail = 'admin@hutty.in'): Promise<ConsultantEntity> {
    const existing = await this.getConsultantById(id);
    if (!existing) {
      throw new Error(`Consultant with ID "${id}" not found`);
    }

    const effectiveAbout =
      data.about !== undefined
        ? data.about.trim()
        : data.description !== undefined
        ? data.description.trim()
        : existing.about;

    const updated: ConsultantEntity = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      category: data.category !== undefined ? data.category : existing.category,
      profileImage: data.profileImage !== undefined ? data.profileImage : existing.profileImage,
      experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : existing.experienceYears,
      city: data.city !== undefined ? data.city.trim() : existing.city,
      serviceAreas: data.serviceAreas !== undefined ? data.serviceAreas : existing.serviceAreas,
      about: effectiveAbout,
      description: effectiveAbout,
      specializations: data.specializations !== undefined ? data.specializations : existing.specializations,
      services: data.services !== undefined ? data.services : existing.services,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
      featured: data.featured !== undefined ? Boolean(data.featured) : existing.featured,
      displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : existing.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    if (this.isDbConnected()) {
      try {
        const { id: _ignoreId, createdAt: _ignoreCreated, description: _ignoreDesc, requests: _ignoreReq, ...prismaUpdateData } = updated as any;
        const res = await (this.prisma as any).consultant.update({
          where: { id },
          data: {
            ...prismaUpdateData,
            updatedAt: new Date(),
          },
        });
        const mapped = this.mapPrismaConsultant(res);
        const index = this.inMemoryConsultants.findIndex((c) => c.id === id);
        if (index !== -1) this.inMemoryConsultants[index] = mapped;
        return mapped;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to update consultant in database: ' + err.message);
        }
        console.warn('[ConsultationService] Prisma updateConsultant failed, using in-memory:', err.message);
      }
    }

    const index = this.inMemoryConsultants.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.inMemoryConsultants[index] = updated;
    }
    return updated;
  }

  public async setConsultantStatus(
    id: string,
    statusOrActive: boolean | { active: boolean; featured?: boolean },
    featuredOrAdminEmail?: boolean | string,
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultantEntity> {
    let active: boolean;
    let featured: boolean | undefined;
    let effectiveAdminEmail = adminEmail;

    if (typeof statusOrActive === 'object' && statusOrActive !== null) {
      active = Boolean(statusOrActive.active);
      featured = statusOrActive.featured;
      if (typeof featuredOrAdminEmail === 'string') {
        effectiveAdminEmail = featuredOrAdminEmail;
      }
    } else {
      active = Boolean(statusOrActive);
      if (typeof featuredOrAdminEmail === 'boolean') {
        featured = featuredOrAdminEmail;
      } else if (typeof featuredOrAdminEmail === 'string') {
        effectiveAdminEmail = featuredOrAdminEmail;
      }
    }

    const updateData: any = { active };
    if (featured !== undefined) updateData.featured = featured;
    return this.updateConsultant(id, updateData, effectiveAdminEmail);
  }

  public async updateConsultantAdmin(
    id: string,
    data: any,
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultantEntity> {
    return this.updateConsultant(id, data, adminEmail);
  }

  public async setConsultantActiveStatus(
    id: string,
    active: boolean,
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultantEntity> {
    return this.setConsultantStatus(id, active, undefined, adminEmail);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BOOKING REQUEST & PAYMENT CREATION (Transactional & Anti-Tampering)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Creates a consultation request and initiates the payment order for the fixed ₹1,499 fee.
   * Source of truth for amount is strictly CONSULTATION_PRICE_PAISE (149900 paise = ₹1,499).
   * Client-sent amounts or fees are strictly ignored.
   * Project ownership is strictly verified if projectId is provided.
   */
  public async createBookingRequest(
    data: CreateBookingRequestInput,
    userContext?: { id?: string; email?: string }
  ): Promise<{
    request: ConsultationRequestEntity;
    payment: ConsultationPaymentEntity;
    razorpayOptions: {
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      name: string;
      description: string;
      prefill: { name: string; email: string; contact: string };
    };
    cashfreeOptions?: {
      orderId: string;
      paymentSessionId?: string;
      payment_session_id?: string;
      amount: number;
      amountMinorUnits: number;
      currency: string;
      gateway: string;
      environment: string;
    };
  }> {
    // 1. Verify consultant exists and is active (if a specific consultant was chosen)
    let consultant: ConsultantEntity | null = null;
    if (data.consultantId && data.consultantId !== 'hutty-expert-desk' && data.consultantId !== 'general-expert') {
      consultant = await this.getConsultantById(data.consultantId);
      if (!consultant) {
        throw new Error('Selected consultant does not exist.');
      }
      if (!consultant.active) {
        throw new Error('Selected consultant is currently unavailable for bookings.');
      }
    }

    // 2. Validate optional linked project or snapshot if provided
    let projectSnapshot: any = null;
    if (data.projectId) {
      if (!userContext?.id) {
        throw new Error('Authentication required to link an existing project.');
      }

      let project: any = null;
      if (this.prisma) {
        try {
          project = await (this.prisma as any).project.findUnique({
            where: { id: data.projectId },
            include: { configuration: true, calculation: true },
          });
        } catch {
          project = null;
        }
      }

      if (!project) {
        project = await projectService.getProjectById(data.projectId);
      }

      if (!project) {
        throw new Error('Linked project not found.');
      }

      if (project.ownerId !== userContext.id && project.userId !== userContext.id) {
        throw new Error('Forbidden: You do not have permission to link this project.');
      }

      // Strict whitelist of public summary project attributes (never leak formulas/financial markups)
      projectSnapshot = {
        projectId: project.id,
        projectName: project.name || project.title || 'My Project',
        city: project.city || data.projectLocation,
        houseType: project.configuration?.houseType || data.projectType,
        floors: project.configuration?.floors || null,
        totalBUASqFt: project.calculation?.totalBUASqFt || null,
        estimatedTotalCostINR: project.calculation?.totalCostINR || null,
      };
    } else if (data.projectSnapshot) {
      // Attached calculator workspace snapshot (not a saved database project; no auth required)
      projectSnapshot = {
        source: 'calculator_snapshot',
        houseType: typeof data.projectSnapshot.houseType === 'string' ? data.projectSnapshot.houseType : data.projectType,
        floors: typeof data.projectSnapshot.floors === 'number' ? data.projectSnapshot.floors : null,
        totalBUASqFt: typeof data.projectSnapshot.totalBUASqFt === 'number' ? data.projectSnapshot.totalBUASqFt : null,
        estimatedTotalCostINR: typeof data.projectSnapshot.estimatedTotalCostINR === 'number' ? data.projectSnapshot.estimatedTotalCostINR : null,
        city: typeof data.projectSnapshot.city === 'string' ? data.projectSnapshot.city : data.projectLocation,
      };
    }

    // 3. Idempotency Check (double-click protection)
    const normalizedEmail = data.homeownerEmail.toLowerCase().trim();
    if (data.idempotencyKey) {
      const existingReq = await this.findRequestByIdempotencyKey(data.idempotencyKey);
      if (existingReq) {
        const existingPayment = await this.getPaymentByRequestId(existingReq.id);
        if (existingPayment) {
          let cfPaymentSessionId: string | undefined = undefined;
          if (existingPayment.gateway === 'CASHFREE' && cashfreeService.isConfigured()) {
            try {
              const order = await cashfreeService.getOrder(existingPayment.gatewayOrderId);
              cfPaymentSessionId = order?.payment_session_id || order?.paymentSessionId;
            } catch {}
          }
          return {
            request: existingReq,
            payment: {
              ...existingPayment,
              paymentSessionId: cfPaymentSessionId,
              payment_session_id: cfPaymentSessionId,
              environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
            },
            razorpayOptions: this.buildRazorpayOptions(existingReq, existingPayment, consultant),
            cashfreeOptions: existingPayment.gateway === 'CASHFREE' ? {
              orderId: existingPayment.gatewayOrderId,
              paymentSessionId: cfPaymentSessionId,
              payment_session_id: cfPaymentSessionId,
              amount: CONSULTATION_PRICE_INR,
              amountMinorUnits: CONSULTATION_PRICE_PAISE,
              currency: CONSULTATION_CURRENCY,
              gateway: 'CASHFREE',
              environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
            } : undefined,
          };
        }
      }
    }

    // Recent duplicate request check: within 60 seconds with same consultant, slot, and pending status
    const recentDuplicate = this.findRecentPendingBooking(
      normalizedEmail,
      consultant ? consultant.id : null,
      data.preferredDate,
      data.preferredTime
    );
    if (recentDuplicate) {
      const payment = await this.getPaymentByRequestId(recentDuplicate.id);
      if (payment && payment.status === 'PENDING') {
        let cfPaymentSessionId: string | undefined = undefined;
        if (payment.gateway === 'CASHFREE' && cashfreeService.isConfigured()) {
          try {
            const order = await cashfreeService.getOrder(payment.gatewayOrderId);
            cfPaymentSessionId = order?.payment_session_id || order?.paymentSessionId;
          } catch {}
        }
        return {
          request: recentDuplicate,
          payment: {
            ...payment,
            paymentSessionId: cfPaymentSessionId,
            payment_session_id: cfPaymentSessionId,
            environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
          },
          razorpayOptions: this.buildRazorpayOptions(recentDuplicate, payment, consultant),
          cashfreeOptions: payment.gateway === 'CASHFREE' ? {
            orderId: payment.gatewayOrderId,
            paymentSessionId: cfPaymentSessionId,
            payment_session_id: cfPaymentSessionId,
            amount: CONSULTATION_PRICE_INR,
            amountMinorUnits: CONSULTATION_PRICE_PAISE,
            currency: CONSULTATION_CURRENCY,
            gateway: 'CASHFREE',
            environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
          } : undefined,
        };
      }
    }

    // 4. Generate unique human-readable public reference: e.g. HT-CON-4F8A9B
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const publicReference = `HT-CON-${randomSuffix}`;

    const requestId = `req-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const paymentId = `pay-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;

    const targetGateway = (data as any).gateway || (cashfreeService.isConfigured() ? 'CASHFREE' : 'RAZORPAY');

    let gatewayOrderId: string;
    let cfPaymentSessionId: string | undefined = undefined;

    if (targetGateway === 'CASHFREE') {
      const cfOrder = await cashfreeService.createOrder({
        orderId: `order_cf_con_${Date.now()}_${randomSuffix}`,
        orderAmount: CONSULTATION_PRICE_INR,
        orderCurrency: CONSULTATION_CURRENCY,
        customer: {
          id: userContext?.id || `cust_${randomSuffix}`,
          name: data.homeownerName,
          email: normalizedEmail,
          phone: data.homeownerPhone,
        },
        orderNote: `Hutty Consultation with ${consultant ? consultant.name : 'Expert Desk'} (${publicReference})`,
        returnUrl: `${ENV.FRONTEND_URL}/payment/status?order_id={order_id}`,
        notifyUrl: `${ENV.BACKEND_URL}/api/v1/cashfree/webhook`,
      });
      gatewayOrderId = cfOrder.orderId;
      cfPaymentSessionId = cfOrder.paymentSessionId;
    } else {
      gatewayOrderId = await this.createGatewayOrder(publicReference);
    }

    const now = new Date().toISOString();

    const requestEntity: ConsultationRequestEntity = {
      id: requestId,
      publicReference,
      idempotencyKey: data.idempotencyKey || null,
      userId: userContext?.id || null,
      consultantId: consultant ? consultant.id : null,
      consultant,
      consultantNameSnapshot: consultant ? consultant.name : 'Hutty Expert Desk',
      consultantTitleSnapshot: consultant ? consultant.title : 'Senior Lead Architect / Engineer Review',
      homeownerName: data.homeownerName.trim(),
      homeownerPhone: data.homeownerPhone.trim(),
      homeownerEmail: normalizedEmail,
      projectId: data.projectId || null,
      projectSnapshot,
      projectLocation: (data.projectLocation || 'Bangalore').trim(),
      projectType: (data.projectType || 'Independent Residential House').trim(),
      consultationTopic: (data.consultationTopic || 'General Consultation').trim(),
      message: data.message?.trim() || null,
      preferredDate: (data.preferredDate || new Date().toISOString().split('T')[0]).trim(),
      preferredTime: (data.preferredTime || '10:00 AM').trim(),
      confirmedDateTime: null,
      status: 'AWAITING_REVIEW',
      amountMinorUnits: CONSULTATION_PRICE_PAISE, // Strict ₹1,499 source of truth
      currency: CONSULTATION_CURRENCY,
      createdAt: now,
      updatedAt: now,
    };

    const paymentEntity: ConsultationPaymentEntity = {
      id: paymentId,
      consultationRequestId: requestId,
      gateway: targetGateway,
      gatewayOrderId,
      gatewayPaymentId: null,
      gatewaySignature: null,
      paymentSessionId: cfPaymentSessionId,
      payment_session_id: cfPaymentSessionId,
      environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
      amountMinorUnits: CONSULTATION_PRICE_PAISE,
      currency: CONSULTATION_CURRENCY,
      status: 'PENDING',
      verifiedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const eventEntity: ConsultationEventEntity = {
      id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      consultationRequestId: requestId,
      actorId: userContext?.id || 'ANONYMOUS',
      actorRole: 'USER',
      eventType: 'REQUEST_CREATED',
      title: 'Consultation request initiated by homeowner',
      internalNote: null,
      metadataJson: {
        publicReference,
        consultantName: consultant ? consultant.name : 'Hutty Expert Desk',
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        topic: data.consultationTopic,
        amountINR: CONSULTATION_PRICE_INR,
      },
      createdAt: now,
    };

    // 5. Database Transaction (Atomic creation of Request, Payment record, and Audit Event)
    if (this.prisma) {
      try {
        await (this.prisma as any).$transaction([
          (this.prisma as any).consultationRequest.create({
            data: {
              id: requestEntity.id,
              publicReference: requestEntity.publicReference,
              idempotencyKey: requestEntity.idempotencyKey,
              userId: requestEntity.userId,
              consultantId: requestEntity.consultantId,
              consultantNameSnapshot: requestEntity.consultantNameSnapshot,
              consultantTitleSnapshot: requestEntity.consultantTitleSnapshot,
              homeownerName: requestEntity.homeownerName,
              homeownerPhone: requestEntity.homeownerPhone,
              homeownerEmail: requestEntity.homeownerEmail,
              projectId: requestEntity.projectId,
              projectSnapshot: requestEntity.projectSnapshot,
              projectLocation: requestEntity.projectLocation,
              projectType: requestEntity.projectType,
              consultationTopic: requestEntity.consultationTopic,
              message: requestEntity.message,
              preferredDate: requestEntity.preferredDate,
              preferredTime: requestEntity.preferredTime,
              status: requestEntity.status,
              amountMinorUnits: requestEntity.amountMinorUnits,
              currency: requestEntity.currency,
            },
          }),
          (this.prisma as any).consultationPayment.create({
            data: {
              id: paymentEntity.id,
              consultationRequestId: paymentEntity.consultationRequestId,
              gateway: paymentEntity.gateway,
              gatewayOrderId: paymentEntity.gatewayOrderId,
              amountMinorUnits: paymentEntity.amountMinorUnits,
              currency: paymentEntity.currency,
              status: paymentEntity.status,
            },
          }),
          (this.prisma as any).consultationEvent.create({
            data: {
              id: eventEntity.id,
              consultationRequestId: eventEntity.consultationRequestId,
              actorId: eventEntity.actorId,
              actorRole: eventEntity.actorRole,
              eventType: eventEntity.eventType,
              title: eventEntity.title,
              metadataJson: eventEntity.metadataJson,
            },
          }),
        ]);
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
          console.error('[ConsultationService] CRITICAL: PostgreSQL transaction create failed in production:', err.message);
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to record consultation booking in database: ' + err.message);
        }
        console.warn('[ConsultationService] Prisma transaction create failed, using in-memory:', err.message);
      }
    }

    // In-memory record
    this.inMemoryRequests.unshift(requestEntity);
    this.inMemoryPayments.unshift(paymentEntity);
    this.inMemoryEvents.unshift(eventEntity);

    console.log(
      `[OPERATIONAL_LEAD_DISPATCH] Consultation booking initiated: Reference=${publicReference}, Expert="${consultant ? consultant.name : 'Hutty Expert Desk'}", Customer="${data.homeownerName}" <${normalizedEmail}>, Topic="${data.consultationTopic}", Location="${data.projectLocation}"`
    );

    return {
      request: {
        ...requestEntity,
        amountINR: requestEntity.amountMinorUnits / 100,
        amountPaise: requestEntity.amountMinorUnits,
      },
      payment: {
        ...paymentEntity,
        amountINR: paymentEntity.amountMinorUnits / 100,
        amountPaise: paymentEntity.amountMinorUnits,
        paymentSessionId: cfPaymentSessionId,
        payment_session_id: cfPaymentSessionId,
        environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
      },
      razorpayOptions: this.buildRazorpayOptions(requestEntity, paymentEntity, consultant),
      cashfreeOptions: targetGateway === 'CASHFREE' ? {
        orderId: paymentEntity.gatewayOrderId,
        paymentSessionId: cfPaymentSessionId,
        payment_session_id: cfPaymentSessionId,
        amount: CONSULTATION_PRICE_INR,
        amountMinorUnits: CONSULTATION_PRICE_PAISE,
        currency: CONSULTATION_CURRENCY,
        gateway: targetGateway,
        environment: (process.env.CASHFREE_ENV || ENV.CASHFREE_ENV || 'TEST').toUpperCase(),
      } : undefined,
    };
  }

  /**
   * Homeowner general help request & consultation fallback.
   * Captured when no specific consultant slot is available or homeowner requests direct guidance.
   * Persisted to database/in-memory with status AWAITING_REVIEW and logged to operational lead dispatch.
   */
  public async createGeneralEnquiry(data: {
    name: string;
    phone: string;
    email: string;
    topic: string;
    message: string;
    city?: string;
    projectType?: string;
  }): Promise<{
    success: boolean;
    reference: string;
    id?: string;
    status?: string;
    topic?: string;
    message: string;
    data: any;
  }> {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const publicReference = `HT-ENQ-${randomSuffix}`;
    const requestId = `enq-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const normalizedEmail = data.email.toLowerCase().trim();

    const requestEntity: ConsultationRequestEntity = {
      id: requestId,
      publicReference,
      idempotencyKey: null,
      userId: null,
      consultantId: null,
      consultant: null,
      consultantNameSnapshot: 'Hutty Expert Desk',
      consultantTitleSnapshot: 'Technical Advisory & Review Desk',
      homeownerName: data.name.trim(),
      homeownerPhone: data.phone.trim(),
      homeownerEmail: normalizedEmail,
      projectId: null,
      projectSnapshot: null,
      projectLocation: (data.city || 'Bangalore').trim(),
      projectType: (data.projectType || 'Independent Residential House').trim(),
      consultationTopic: data.topic.trim(),
      message: data.message.trim(),
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      preferredTime: 'Anytime / Earliest Slot',
      confirmedDateTime: null,
      status: 'AWAITING_REVIEW',
      amountMinorUnits: 0,
      currency: CONSULTATION_CURRENCY,
      createdAt: now,
      updatedAt: now,
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).consultationRequest.create({
          data: {
            id: requestEntity.id,
            publicReference: requestEntity.publicReference,
            homeownerName: requestEntity.homeownerName,
            homeownerPhone: requestEntity.homeownerPhone,
            homeownerEmail: requestEntity.homeownerEmail,
            projectLocation: requestEntity.projectLocation,
            projectType: requestEntity.projectType,
            consultationTopic: requestEntity.consultationTopic,
            message: requestEntity.message,
            preferredDate: requestEntity.preferredDate,
            preferredTime: requestEntity.preferredTime,
            status: requestEntity.status,
            amountMinorUnits: 0,
            currency: requestEntity.currency,
          },
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
          console.error('[ConsultationService] CRITICAL: PostgreSQL enquiry create failed in production:', err.message);
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to record general enquiry in database: ' + err.message);
        }
        console.warn('[ConsultationService] Prisma enquiry create failed, using in-memory:', err.message);
      }
    }

    this.inMemoryRequests.unshift(requestEntity);

    console.log(
      `[OPERATIONAL_LEAD_DISPATCH] General Enquiry received: Reference=${publicReference}, Name="${data.name}", Phone="${data.phone}", Email="${data.email}", Topic="${data.topic}", City="${data.city || 'Bangalore'}"`
    );

    return {
      success: true,
      reference: publicReference,
      id: requestId,
      status: 'RECEIVED',
      topic: data.topic,
      message: 'Your enquiry has been received by our senior engineering desk. We will review your request and contact you within 24 hours.',
      data: {
        id: requestId,
        reference: publicReference,
        status: 'AWAITING_REVIEW',
        topic: data.topic,
        createdAt: now,
      },
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PAYMENT VERIFICATION (Cryptographic HMAC-SHA256 & Idempotent)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Verifies the online payment.
   * When RAZORPAY_KEY_SECRET is configured, cryptographic HMAC-SHA256 signature is strictly MANDATORY.
   * If payment is already marked PAID, returns the existing verified record idempotently.
   * Atomically transitions payment to PAID, request to AWAITING_REVIEW, and creates audit event.
   */
  public async verifyPayment(
    requestId: string,
    paymentDetails: {
      gatewayOrderId: string;
      gatewayPaymentId: string;
      gatewaySignature?: string;
      isWebhookVerified?: boolean;
    }
  ): Promise<{
    request: ConsultationRequestEntity;
    payment: ConsultationPaymentEntity;
    isPending?: boolean;
    paymentStatus?: 'PAID' | 'PENDING' | 'FAILED' | 'AMOUNT_MISMATCH';
    message?: string;
  }> {
    const { gatewayOrderId, gatewaySignature } = paymentDetails;
    let gatewayPaymentId = paymentDetails.gatewayPaymentId;

    // 1. Locate request
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error(`Consultation request "${requestId}" not found.`);
    }

    // 2. Locate payment record
    const payment = await this.getPaymentByOrderId(gatewayOrderId);
    if (!payment || payment.consultationRequestId !== requestId) {
      throw new Error('Payment record does not match consultation request.');
    }

    // 3. Idempotent check: if already verified as PAID, return immediately without duplicate side-effects
    if (payment.status === 'PAID') {
      return { request, payment, isPending: false, paymentStatus: 'PAID' };
    }

    // 4. Gateway-specific verification:
    if (payment.gateway === 'CASHFREE') {
      if (paymentDetails.isWebhookVerified) {
        // Authenticated and verified via cryptographic signed Cashfree webhook
      } else if (cashfreeService.isConfigured()) {
        const verification = await cashfreeService.verifyOrderPayment(
          gatewayOrderId,
          payment.amountMinorUnits / 100
        );

        if (verification.paymentStatus === 'PENDING') {
          // Cashfree order status is ACTIVE / payment is awaiting confirmation
          // Do NOT mark as failed. Do NOT throw an error. Do NOT mark as paid.
          return {
            request,
            payment,
            isPending: true,
            paymentStatus: 'PENDING',
            message: 'Payment is awaiting confirmation. Complete payment in Cashfree or check your payment status.',
          };
        }

        if (!verification.verified) {
          await this.recordPaymentFailure(
            payment.id,
            gatewayPaymentId,
            `Cashfree verification failed: ${verification.message}`
          );
          throw new Error(
            `Payment verification failed with Cashfree: ${verification.message || 'Payment not successful'}`
          );
        }
        if (verification.cfPaymentId) {
          gatewayPaymentId = verification.cfPaymentId;
        }
      }
    } else {
      // Strict Cryptographic Signature Verification for Razorpay
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret) {
        if (!gatewaySignature) {
          await this.recordPaymentFailure(payment.id, gatewayPaymentId, 'Missing payment signature');
          throw new Error('Payment verification failed: gateway signature is required.');
        }

        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${gatewayOrderId}|${gatewayPaymentId}`)
          .digest('hex');

        const isSignatureValid =
          generatedSignature.length === gatewaySignature.length &&
          crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(gatewaySignature));

        if (!isSignatureValid) {
          await this.recordPaymentFailure(payment.id, gatewayPaymentId, 'Invalid payment signature');
          throw new Error('Payment verification failed: cryptographic signature mismatch.');
        }
      }
    }

    // 5. Atomic State Transition (Payment -> PAID, Request -> AWAITING_REVIEW)
    const verifiedAt = new Date().toISOString();
    const updatedPayment: ConsultationPaymentEntity = {
      ...payment,
      gatewayPaymentId,
      gatewaySignature: gatewaySignature || null,
      status: 'PAID',
      verifiedAt,
      updatedAt: verifiedAt,
    };

    const updatedRequest: ConsultationRequestEntity = {
      ...request,
      status: 'AWAITING_REVIEW', // Prompt requirement: "Paid — Awaiting Admin Review"
      updatedAt: verifiedAt,
    };

    const event: ConsultationEventEntity = {
      id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      consultationRequestId: requestId,
      actorId: request.userId || 'HOMEOWNER',
      actorRole: 'USER',
      eventType: 'PAYMENT_CONFIRMED',
      title: 'Consultation fee of ₹1,499 paid successfully online',
      internalNote: null,
      metadataJson: {
        gatewayOrderId,
        gatewayPaymentId,
        amountINR: CONSULTATION_PRICE_INR,
        amountPaise: CONSULTATION_PRICE_PAISE,
        verifiedAt,
      },
      createdAt: verifiedAt,
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).$transaction([
          (this.prisma as any).consultationPayment.update({
            where: { id: payment.id },
            data: {
              gatewayPaymentId,
              gatewaySignature: gatewaySignature || null,
              status: 'PAID',
              verifiedAt: new Date(verifiedAt),
            },
          }),
          (this.prisma as any).consultationRequest.update({
            where: { id: requestId },
            data: {
              status: 'AWAITING_REVIEW',
            },
          }),
          (this.prisma as any).consultationEvent.create({
            data: {
              id: event.id,
              consultationRequestId: event.consultationRequestId,
              actorId: event.actorId,
              actorRole: event.actorRole,
              eventType: event.eventType,
              title: event.title,
              metadataJson: event.metadataJson,
            },
          }),
        ]);
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
          console.error('[ConsultationService] CRITICAL: PostgreSQL transaction verifyPayment failed in production:', err.message);
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to confirm consultation payment in database: ' + err.message);
        }
        console.warn('[ConsultationService] Prisma transaction verifyPayment failed, updating in-memory:', err.message);
      }
    }

    // In-memory update
    const pIdx = this.inMemoryPayments.findIndex((p) => p.id === payment.id);
    if (pIdx !== -1) this.inMemoryPayments[pIdx] = updatedPayment;

    const rIdx = this.inMemoryRequests.findIndex((r) => r.id === requestId);
    if (rIdx !== -1) this.inMemoryRequests[rIdx] = updatedRequest;

    this.inMemoryEvents.unshift(event);

    return { request: updatedRequest, payment: updatedPayment, isPending: false, paymentStatus: 'PAID' };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // WEBHOOK HANDLING (Razorpay Webhooks with Idempotency & Replay Protection)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Processes verified incoming webhooks from Razorpay with full idempotency.
   * Sending the same webhook 2, 5, or 10 times will not duplicate requests or payments.
   */
  public async handleRazorpayWebhook(
    rawBody: string,
    signatureHeader: string | undefined
  ): Promise<{ status: string; message: string; handled: boolean }> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret) {
      if (!signatureHeader) {
        throw new Error('Webhook signature header missing');
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isValid =
        expectedSignature.length === signatureHeader.length &&
        crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureHeader));

      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Malformed webhook JSON payload');
    }

    const eventName = payload.event;
    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      const paymentObj = payload.payload?.payment?.entity;
      const orderId = paymentObj?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = paymentObj?.id;

      if (!orderId) {
        return { status: 'skipped', message: 'No order ID in webhook payload', handled: false };
      }

      const payment = await this.getPaymentByOrderId(orderId);
      if (!payment) {
        return { status: 'ignored', message: `Order ${orderId} not found in system`, handled: false };
      }

      // Idempotency: if already PAID, exit cleanly with 200 OK
      if (payment.status === 'PAID') {
        return { status: 'idempotent', message: 'Payment already marked as PAID', handled: true };
      }

      // Verify amount matches launch consultation price (149900 paise)
      if (paymentObj?.amount && paymentObj.amount !== CONSULTATION_PRICE_PAISE) {
        await this.recordPaymentFailure(
          payment.id,
          paymentId || 'UNKNOWN',
          `Webhook amount mismatch: expected ${CONSULTATION_PRICE_PAISE}, received ${paymentObj.amount}`
        );
        throw new Error('Webhook payment amount mismatch');
      }

      // Verify payment through canonical handler
      await this.verifyPayment(payment.consultationRequestId, {
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId || `pay_wh_${Date.now()}`,
      });

      return { status: 'success', message: 'Webhook payment verified and marked PAID', handled: true };
    }

    if (eventName === 'payment.failed') {
      const paymentObj = payload.payload?.payment?.entity;
      const orderId = paymentObj?.order_id;
      if (orderId) {
        const payment = await this.getPaymentByOrderId(orderId);
        if (payment && payment.status === 'PENDING') {
          await this.recordPaymentFailure(
            payment.id,
            paymentObj?.id || 'UNKNOWN',
            paymentObj?.error_description || 'Payment failed at gateway'
          );
        }
      }
      return { status: 'failure_recorded', message: 'Payment failure recorded', handled: true };
    }

    return { status: 'ignored', message: `Unhandled event: ${eventName}`, handled: false };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HOMEOWNER ACCESS & HISTORY (Ownership Validated)
  // ═════════════════════════════════════════════════════════════════════════

  public async getUserConsultations(userContext: { id?: string; email?: string }): Promise<ConsultationRequestEntity[]> {
    if (!userContext.id && !userContext.email) {
      return [];
    }

    let results: ConsultationRequestEntity[] = [];

    if (this.prisma) {
      try {
        const where: any = {
          OR: [],
        };
        if (userContext.id) where.OR.push({ userId: userContext.id });
        if (userContext.email) where.OR.push({ homeownerEmail: userContext.email.toLowerCase() });

        const requests = await (this.prisma as any).consultationRequest.findMany({
          where,
          include: {
            consultant: true,
            payments: true,
            events: {
              where: { internalNote: null }, // NEVER return internal notes to homeowner!
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (requests && requests.length > 0) {
          results = requests.map(this.mapPrismaRequest);
        }
      } catch {
        // Fallback
      }
    }

    if (results.length === 0) {
      results = this.inMemoryRequests
        .filter((r) => {
          if (userContext.id && r.userId === userContext.id) return true;
          if (userContext.email && r.homeownerEmail.toLowerCase() === userContext.email.toLowerCase()) return true;
          return false;
        })
        .map((r) => {
          const withEvents = {
            ...r,
            events: this.inMemoryEvents.filter((e) => e.consultationRequestId === r.id),
          };
          return this.stripInternalNotes(withEvents);
        });
    }

    return results;
  }

  public async getUserConsultationById(
    id: string,
    userContext: { id?: string; email?: string }
  ): Promise<ConsultationRequestEntity | null> {
    const request = await this.getRequestById(id);
    if (!request) return null;

    // Strict ownership validation
    const matchesUser = Boolean(userContext.id && request.userId === userContext.id);
    const matchesEmail = Boolean(userContext.email && request.homeownerEmail.toLowerCase() === userContext.email.toLowerCase());
    if (!matchesUser && !matchesEmail) {
      throw new Error('Forbidden: You do not have permission to access this consultation request.');
    }

    return this.stripInternalNotes(request);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ADMIN CONSULTATION WORKFLOW (RBAC Enforced)
  // ═════════════════════════════════════════════════════════════════════════

  public async getAdminConsultations(params?: {
    status?: string;
    search?: string;
  }): Promise<{
    requests: ConsultationRequestEntity[];
    stats: {
      total: number;
      paid: number;
      awaitingReview: number;
      assigned: number;
      scheduled: number;
      completed: number;
      cancelled: number;
    };
  }> {
    const { status, search } = params || {};
    let allRequests: ConsultationRequestEntity[] = [];

    if (this.prisma) {
      try {
        const where: any = {};
        if (status && status !== 'ALL') where.status = status;
        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { publicReference: { contains: q, mode: 'insensitive' } },
            { homeownerName: { contains: q, mode: 'insensitive' } },
            { homeownerEmail: { contains: q, mode: 'insensitive' } },
            { homeownerPhone: { contains: q } },
          ];
        }

        const requests = await (this.prisma as any).consultationRequest.findMany({
          where,
          include: {
            consultant: true,
            payments: true,
            events: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (requests) {
          allRequests = requests.map(this.mapPrismaRequest);
        }
      } catch {
        // Fallback
      }
    }

    if (allRequests.length === 0) {
      allRequests = this.inMemoryRequests.filter((r) => {
        if (status && status !== 'ALL' && r.status !== status) return false;
        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          const matchRef = r.publicReference.toLowerCase().includes(q);
          const matchName = r.homeownerName.toLowerCase().includes(q);
          const matchEmail = r.homeownerEmail.toLowerCase().includes(q);
          const matchPhone = r.homeownerPhone.includes(q);
          if (!matchRef && !matchName && !matchEmail && !matchPhone) return false;
        }
        return true;
      });
    }

    // Attach latest payment & consultant references for in-memory if needed
    for (const req of allRequests) {
      if (!req.consultant && req.consultantId) {
        req.consultant = await this.getConsultantById(req.consultantId);
      }
      if (!req.payments) {
        req.payments = this.inMemoryPayments.filter((p) => p.consultationRequestId === req.id);
      }
      if (!req.events) {
        req.events = this.inMemoryEvents.filter((e) => e.consultationRequestId === req.id);
      }
    }

    // Compute counters across all requests
    const pool = this.inMemoryRequests.length > allRequests.length ? this.inMemoryRequests : allRequests;
    const stats = {
      total: pool.length,
      paid: pool.filter((r) => r.payments?.some((p) => p.status === 'PAID')).length,
      awaitingReview: pool.filter((r) => r.status === 'AWAITING_REVIEW').length,
      assigned: pool.filter((r) => r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW').length,
      scheduled: pool.filter((r) => r.status === 'SCHEDULED').length,
      completed: pool.filter((r) => r.status === 'COMPLETED').length,
      cancelled: pool.filter((r) => r.status === 'CANCELLED' || r.status === 'REJECTED').length,
    };

    return { requests: allRequests, stats };
  }

  public async getAdminConsultationById(id: string): Promise<ConsultationRequestEntity | null> {
    if (this.prisma) {
      try {
        const req = await (this.prisma as any).consultationRequest.findUnique({
          where: { id },
          include: {
            consultant: true,
            payments: true,
            events: { orderBy: { createdAt: 'desc' } },
            project: { select: { id: true, name: true, city: true, status: true } },
          },
        });
        if (req) return this.mapPrismaRequest(req);
      } catch {}
    }

    const found = this.inMemoryRequests.find((r) => r.id === id);
    if (!found) return null;

    const copy = { ...found };
    copy.consultant = found.consultantId ? await this.getConsultantById(found.consultantId) : null;
    copy.payments = this.inMemoryPayments.filter((p) => p.consultationRequestId === id);
    copy.events = this.inMemoryEvents.filter((e) => e.consultationRequestId === id);
    return copy;
  }

  /**
   * Admin assigns / reassigns a consultant to the request
   */
  public async assignConsultant(
    requestId: string,
    consultantId: string,
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultationRequestEntity> {
    const request = await this.getRequestById(requestId);
    if (!request) throw new Error(`Request "${requestId}" not found.`);

    // Authoritative backend payment guard: verified payment required before consultant assignment
    await this.assertConsultationPaymentVerified(requestId, 'assign a consultant to');

    const consultant = await this.getConsultantById(consultantId);
    if (!consultant) throw new Error(`Consultant "${consultantId}" not found.`);

    const prevConsultantName = request.consultant?.name || 'Unassigned';
    const now = new Date().toISOString();

    const targetStatus = request.status === 'AWAITING_REVIEW' ? 'ASSIGNED' : request.status;

    const updatedRequest: ConsultationRequestEntity = {
      ...request,
      consultantId: consultant.id,
      consultant,
      status: targetStatus,
      updatedAt: now,
    };

    const event: ConsultationEventEntity = {
      id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      consultationRequestId: requestId,
      actorId: adminEmail,
      actorRole: 'ADMIN',
      eventType: 'CONSULTANT_ASSIGNED',
      title: `Consultant assigned: ${consultant.name}`,
      internalNote: null,
      metadataJson: {
        assignedConsultantId: consultant.id,
        assignedConsultantName: consultant.name,
        previousConsultant: prevConsultantName,
        assignedBy: adminEmail,
      },
      createdAt: now,
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).$transaction([
          (this.prisma as any).consultationRequest.update({
            where: { id: requestId },
            data: {
              consultantId: consultant.id,
              status: targetStatus,
            },
          }),
          (this.prisma as any).consultationEvent.create({
            data: {
              id: event.id,
              consultationRequestId: event.consultationRequestId,
              actorId: event.actorId,
              actorRole: event.actorRole,
              eventType: event.eventType,
              title: event.title,
              metadataJson: event.metadataJson,
            },
          }),
        ]);
      } catch (err: any) {
        console.warn('[ConsultationService] Prisma assignConsultant failed, using in-memory:', err.message);
      }
    }

    const rIdx = this.inMemoryRequests.findIndex((r) => r.id === requestId);
    if (rIdx !== -1) this.inMemoryRequests[rIdx] = updatedRequest;
    this.inMemoryEvents.unshift(event);

    return updatedRequest;
  }

  /**
   * Admin sets / confirms the consultation appointment schedule
   */
  public async scheduleConsultation(
    requestId: string,
    confirmedDateTime: string,
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultationRequestEntity> {
    const request = await this.getRequestById(requestId);
    if (!request) throw new Error(`Request "${requestId}" not found.`);

    // Authoritative backend payment guard: verified payment required before scheduling appointment
    await this.assertConsultationPaymentVerified(requestId, 'schedule an appointment for');

    const now = new Date().toISOString();
    const formattedSchedule = new Date(confirmedDateTime).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const updatedRequest: ConsultationRequestEntity = {
      ...request,
      confirmedDateTime,
      status: 'SCHEDULED',
      updatedAt: now,
    };

    const event: ConsultationEventEntity = {
      id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      consultationRequestId: requestId,
      actorId: adminEmail,
      actorRole: 'ADMIN',
      eventType: 'SCHEDULE_CONFIRMED',
      title: `Consultation schedule confirmed for ${formattedSchedule}`,
      internalNote: null,
      metadataJson: {
        confirmedDateTime,
        scheduledBy: adminEmail,
      },
      createdAt: now,
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).$transaction([
          (this.prisma as any).consultationRequest.update({
            where: { id: requestId },
            data: {
              confirmedDateTime: new Date(confirmedDateTime),
              status: 'SCHEDULED',
            },
          }),
          (this.prisma as any).consultationEvent.create({
            data: {
              id: event.id,
              consultationRequestId: event.consultationRequestId,
              actorId: event.actorId,
              actorRole: event.actorRole,
              eventType: event.eventType,
              title: event.title,
              metadataJson: event.metadataJson,
            },
          }),
        ]);
      } catch (err: any) {
        console.warn('[ConsultationService] Prisma scheduleConsultation failed, using in-memory:', err.message);
      }
    }

    const rIdx = this.inMemoryRequests.findIndex((r) => r.id === requestId);
    if (rIdx !== -1) this.inMemoryRequests[rIdx] = updatedRequest;
    this.inMemoryEvents.unshift(event);

    return updatedRequest;
  }

  /**
   * Admin transitions the status of the consultation request with strict state machine verification.
   */
  public async updateRequestStatus(
    requestId: string,
    status: ConsultationRequestEntity['status'],
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultationRequestEntity> {
    const request = await this.getRequestById(requestId);
    if (!request) throw new Error(`Request "${requestId}" not found.`);

    const prevStatus = request.status;
    if (!isValidStatusTransition(prevStatus, status)) {
      const allowed = VALID_STATUS_TRANSITIONS[prevStatus] || [];
      throw new Error(
        `Invalid status transition: cannot change from "${prevStatus}" to "${status}". Allowed transitions: [${allowed.join(', ')}]`
      );
    }

    // Authoritative backend payment guard: verified payment required before advancing into paid-service delivery states.
    // Non-paid administrative cleanup operations (CANCELLED, REJECTED) do not require payment.
    if (status !== 'CANCELLED' && status !== 'REJECTED') {
      await this.assertConsultationPaymentVerified(requestId, `transition status to "${status}" for`);
    }

    const now = new Date().toISOString();

    const updatedRequest: ConsultationRequestEntity = {
      ...request,
      status,
      updatedAt: now,
    };

    const event: ConsultationEventEntity = {
      id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      consultationRequestId: requestId,
      actorId: adminEmail,
      actorRole: 'ADMIN',
      eventType: 'STATUS_CHANGED',
      title: `Status changed from ${prevStatus} to ${status}`,
      internalNote: null,
      metadataJson: {
        previousStatus: prevStatus,
        newStatus: status,
        updatedBy: adminEmail,
      },
      createdAt: now,
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).$transaction([
          (this.prisma as any).consultationRequest.update({
            where: { id: requestId },
            data: { status },
          }),
          (this.prisma as any).consultationEvent.create({
            data: {
              id: event.id,
              consultationRequestId: event.consultationRequestId,
              actorId: event.actorId,
              actorRole: event.actorRole,
              eventType: event.eventType,
              title: event.title,
              metadataJson: event.metadataJson,
            },
          }),
        ]);
      } catch (err: any) {
        console.warn('[ConsultationService] Prisma updateRequestStatus failed, using in-memory:', err.message);
      }
    }

    const rIdx = this.inMemoryRequests.findIndex((r) => r.id === requestId);
    if (rIdx !== -1) this.inMemoryRequests[rIdx] = updatedRequest;
    this.inMemoryEvents.unshift(event);

    return updatedRequest;
  }

  /**
   * Admin adds an internal note (strict requirement: NEVER returned to customer/homeowner)
   */
  public async addInternalNote(
    requestId: string,
    note: string,
    adminEmail = 'admin@hutty.in'
  ): Promise<ConsultationEventEntity> {
    const request = await this.getRequestById(requestId);
    if (!request) throw new Error(`Request "${requestId}" not found.`);

    const now = new Date().toISOString();
    const event: ConsultationEventEntity = {
      id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      consultationRequestId: requestId,
      actorId: adminEmail,
      actorRole: 'ADMIN',
      eventType: 'INTERNAL_NOTE_ADDED',
      title: `Internal Note by ${adminEmail}`,
      internalNote: note.trim(),
      metadataJson: { author: adminEmail },
      createdAt: now,
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).consultationEvent.create({
          data: {
            id: event.id,
            consultationRequestId: event.consultationRequestId,
            actorId: event.actorId,
            actorRole: event.actorRole,
            eventType: event.eventType,
            title: event.title,
            internalNote: event.internalNote,
            metadataJson: event.metadataJson,
          },
        });
      } catch (err: any) {
        console.warn('[ConsultationService] Prisma addInternalNote failed, using in-memory:', err.message);
      }
    }

    this.inMemoryEvents.unshift(event);
    return event;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═════════════════════════════════════════════════════════════════════════

  private async createGatewayOrder(publicReference: string): Promise<string> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !keyId.includes('mock')) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify({
            amount: CONSULTATION_PRICE_PAISE,
            currency: CONSULTATION_CURRENCY,
            receipt: publicReference,
            notes: {
              service: 'Hutty Consultation MVP',
              amountINR: CONSULTATION_PRICE_INR,
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json?.id) return json.id;
        }
      } catch (err: any) {
        console.warn('[ConsultationService] Razorpay order creation API call failed, generating fallback:', err.message);
      }
    }

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    return `order_rc_${Date.now()}_${randomSuffix}`;
  }

  private buildRazorpayOptions(
    request: ConsultationRequestEntity,
    payment: ConsultationPaymentEntity,
    consultant: ConsultantEntity | null
  ) {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_hutty2026mock';
    const expertName = consultant ? consultant.name : 'Hutty Expert Desk';
    return {
      orderId: payment.gatewayOrderId,
      amount: CONSULTATION_PRICE_PAISE,
      currency: CONSULTATION_CURRENCY,
      keyId: razorpayKeyId,
      name: 'Hutty Residential Planning',
      description: `Expert Consultation with ${expertName} (Ref: ${request.publicReference})`,
      prefill: {
        name: request.homeownerName,
        email: request.homeownerEmail,
        contact: request.homeownerPhone,
      },
    };
  }

  private findRecentPendingBooking(
    email: string,
    consultantId: string | null,
    preferredDate: string,
    preferredTime: string
  ): ConsultationRequestEntity | null {
    const sixtySecondsAgo = Date.now() - 60000;
    return (
      this.inMemoryRequests.find(
        (r) =>
          r.homeownerEmail.toLowerCase() === email &&
          (r.consultantId || null) === (consultantId || null) &&
          r.preferredDate === preferredDate &&
          r.preferredTime === preferredTime &&
          r.status === 'AWAITING_REVIEW' &&
          new Date(r.createdAt).getTime() > sixtySecondsAgo
      ) || null
    );
  }

  private async findRequestByIdempotencyKey(key: string): Promise<ConsultationRequestEntity | null> {
    if (this.prisma) {
      try {
        const req = await (this.prisma as any).consultationRequest.findUnique({
          where: { idempotencyKey: key },
          include: { consultant: true, payments: true, events: true },
        });
        if (req) return this.mapPrismaRequest(req);
      } catch {}
    }
    return this.inMemoryRequests.find((r) => r.idempotencyKey === key) || null;
  }

  public async getRequestById(id: string): Promise<ConsultationRequestEntity | null> {
    if (this.prisma) {
      try {
        const req = await (this.prisma as any).consultationRequest.findUnique({
          where: { id },
          include: { consultant: true, payments: true, events: true },
        });
        if (req) return this.mapPrismaRequest(req);
      } catch {}
    }

    const found = this.inMemoryRequests.find((r) => r.id === id);
    if (!found) return null;
    return {
      ...found,
      consultant: found.consultantId ? await this.getConsultantById(found.consultantId) : null,
      payments: this.inMemoryPayments.filter((p) => p.consultationRequestId === id),
      events: this.inMemoryEvents.filter((e) => e.consultationRequestId === id),
    };
  }

  public async getPaymentByOrderId(gatewayOrderId: string): Promise<ConsultationPaymentEntity | null> {
    if (this.prisma) {
      try {
        const pay = await (this.prisma as any).consultationPayment.findUnique({
          where: { gatewayOrderId },
        });
        if (pay) return this.mapPrismaPayment(pay);
        return null;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          throw new Error('AUTHORITATIVE_STORAGE_UNAVAILABLE: Failed to query payment from database: ' + err.message);
        }
      }
    }

    return this.inMemoryPayments.find((p) => p.gatewayOrderId === gatewayOrderId) || null;
  }

  public async getPaymentByRequestId(consultationRequestId: string): Promise<ConsultationPaymentEntity | null> {
    if (this.prisma) {
      try {
        const pay = await (this.prisma as any).consultationPayment.findFirst({
          where: { consultationRequestId },
          orderBy: { createdAt: 'desc' },
        });
        if (pay) return this.mapPrismaPayment(pay);
        return null;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          throw new Error('AUTHORITATIVE_STORAGE_UNAVAILABLE: Failed to query payment from database: ' + err.message);
        }
      }
    }

    return this.inMemoryPayments.find((p) => p.consultationRequestId === consultationRequestId) || null;
  }

  /**
   * Retrieves all payment attempts for a consultation request.
   * If Prisma is configured:
   * 1. Returns database records (even if empty, i.e. zero payment attempts).
   * 2. In production or when DATABASE_URL is configured, fails closed on query errors
   *    rather than silently falling back to stale in-memory records.
   * In unsupported/development environments where database persistence is not configured,
   * falls back cleanly to the in-memory store.
   */
  public async getPaymentsByRequestId(consultationRequestId: string): Promise<ConsultationPaymentEntity[]> {
    if (this.prisma) {
      try {
        const payments = await (this.prisma as any).consultationPayment.findMany({
          where: { consultationRequestId },
          orderBy: { createdAt: 'desc' },
        });
        if (Array.isArray(payments)) {
          return payments.map(this.mapPrismaPayment);
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          console.error('[ConsultationService] CRITICAL: Authoritative database payment lookup failed:', err.message);
          throw new Error(
            'AUTHORITATIVE_STORAGE_UNAVAILABLE: Failed to query payment records from database: ' + err.message
          );
        }
        console.warn('[ConsultationService] Database payment lookup failed in non-production, using in-memory:', err.message);
      }
    }

    return this.inMemoryPayments.filter((p) => p.consultationRequestId === consultationRequestId);
  }

  /**
   * Authoritative backend payment guard.
   * Ensures that a consultation has a verified, persisted payment record with status PAID
   * before allowing assignment, scheduling, or advancing into paid-service delivery states.
   * Fails closed if payment is missing, PENDING, FAILED, or REFUNDED.
   */
  public async assertConsultationPaymentVerified(
    requestId: string,
    actionDescription = 'advance'
  ): Promise<ConsultationPaymentEntity> {
    const payments = await this.getPaymentsByRequestId(requestId);

    if (!payments || payments.length === 0) {
      throw new Error(
        `Cannot ${actionDescription} consultation: no payment record found. Verified payment of ₹${CONSULTATION_PRICE_INR} is required.`
      );
    }

    const verifiedPayment = payments.find((p) => p.status === 'PAID');
    if (!verifiedPayment) {
      const latest = payments[0];
      const status = latest ? latest.status : 'UNPAID';
      throw new Error(
        `Cannot ${actionDescription} consultation: payment has not been verified (current payment status: ${status}). Verified payment of ₹${CONSULTATION_PRICE_INR} is required.`
      );
    }

    if (verifiedPayment.amountMinorUnits !== CONSULTATION_PRICE_PAISE) {
      throw new Error(
        `Cannot ${actionDescription} consultation: payment amount mismatch (expected ₹${CONSULTATION_PRICE_INR}, found ₹${verifiedPayment.amountMinorUnits / 100}).`
      );
    }

    return verifiedPayment;
  }

  public async recordPaymentFailure(paymentId: string, gatewayPaymentId: string, reason: string) {
    if (this.prisma) {
      try {
        await (this.prisma as any).consultationPayment.update({
          where: { id: paymentId },
          data: {
            status: 'FAILED',
            gatewayPaymentId,
            rawResponseJson: { error: reason },
          },
        });
      } catch {}
    }

    const pIdx = this.inMemoryPayments.findIndex((p) => p.id === paymentId);
    if (pIdx !== -1) {
      this.inMemoryPayments[pIdx].status = 'FAILED';
    }
  }

  private stripInternalNotes(request: ConsultationRequestEntity): ConsultationRequestEntity {
    const copy = { ...request };
    if (copy.events) {
      copy.events = copy.events
        .filter((e) => !e.internalNote && e.eventType !== 'INTERNAL_NOTE_ADDED')
        .map((e) => ({ ...e, internalNote: null }));
    }
    return copy;
  }

  private mapPrismaConsultant(p: any): ConsultantEntity {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      title: p.title,
      category: p.category,
      profileImage: p.profileImage || null,
      experienceYears: p.experienceYears,
      city: p.city,
      serviceAreas: p.serviceAreas || [],
      about: p.about,
      specializations: p.specializations || [],
      services: p.services || [],
      active: p.active,
      featured: p.featured,
      displayOrder: p.displayOrder,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  private mapPrismaRequest(r: any): ConsultationRequestEntity {
    return {
      id: r.id,
      publicReference: r.publicReference,
      idempotencyKey: r.idempotencyKey || null,
      userId: r.userId || null,
      consultantId: r.consultantId || null,
      consultant: r.consultant ? this.mapPrismaConsultant(r.consultant) : null,
      consultantNameSnapshot: r.consultantNameSnapshot || null,
      consultantTitleSnapshot: r.consultantTitleSnapshot || null,
      homeownerName: r.homeownerName,
      homeownerPhone: r.homeownerPhone,
      homeownerEmail: r.homeownerEmail,
      projectId: r.projectId || null,
      projectSnapshot: r.projectSnapshot || null,
      projectLocation: r.projectLocation,
      projectType: r.projectType,
      consultationTopic: r.consultationTopic,
      message: r.message || null,
      preferredDate: r.preferredDate,
      preferredTime: r.preferredTime,
      confirmedDateTime: r.confirmedDateTime ? new Date(r.confirmedDateTime).toISOString() : null,
      status: r.status,
      amountMinorUnits: r.amountMinorUnits,
      currency: r.currency,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
      payments: r.payments ? r.payments.map(this.mapPrismaPayment) : [],
      events: r.events ? r.events.map(this.mapPrismaEvent) : [],
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PROFESSIONAL APPLICATION & VERIFICATION
  // ═════════════════════════════════════════════════════════════════════════

  public async submitProfessionalApplication(data: any): Promise<ProfessionalApplicationEntity> {
    const id = `app-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const application: ProfessionalApplicationEntity = {
      id,
      fullName: data.fullName.trim(),
      category: data.category.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      qualifications: data.qualifications.trim(),
      licenseNumber: data.licenseNumber ? data.licenseNumber.trim() : null,
      experienceYears: Number(data.experienceYears) || 0,
      city: (data.city || 'Bangalore').trim(),
      serviceAreas: Array.isArray(data.serviceAreas) ? data.serviceAreas : [],
      expertise: Array.isArray(data.expertise) ? data.expertise : [],
      portfolioLinks: Array.isArray(data.portfolioLinks) ? data.portfolioLinks : [],
      consultationModes: Array.isArray(data.consultationModes) ? data.consultationModes : ['VIDEO', 'AUDIO'],
      proposedServices: Array.isArray(data.proposedServices) ? data.proposedServices : [],
      proposedFeeINR: Number(data.proposedFeeINR) || 1499,
      documentsJson: data.documents || null,
      status: 'SUBMITTED',
      adminReviewerId: null,
      adminReviewNotes: null,
      rejectionReason: null,
      approvedConsultantId: null,
      consentGiven: data.consentGiven !== false,
      createdAt: now,
      updatedAt: now,
    };

    if (this.prisma) {
      try {
        const created = await (this.prisma as any).professionalApplication.create({
          data: {
            id: application.id,
            fullName: application.fullName,
            category: application.category,
            email: application.email,
            phone: application.phone,
            qualifications: application.qualifications,
            licenseNumber: application.licenseNumber,
            experienceYears: application.experienceYears,
            city: application.city,
            serviceAreas: application.serviceAreas,
            expertise: application.expertise,
            portfolioLinks: application.portfolioLinks,
            consultationModes: application.consultationModes,
            proposedServices: application.proposedServices,
            proposedFeeINR: application.proposedFeeINR,
            documentsJson: application.documentsJson,
            status: application.status,
            consentGiven: application.consentGiven,
          },
        });
        if (created) {
          return this.mapPrismaApplication(created);
        }
      } catch {
        // Fallback to in-memory
      }
    }

    this.inMemoryApplications.push(application);
    return application;
  }

  public async getProfessionalApplications(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ProfessionalApplicationEntity[]> {
    const { status, category, search } = params || {};

    if (this.prisma) {
      try {
        const where: any = {};
        if (status && status !== 'ALL') {
          where.status = status;
        }
        if (category && category !== 'ALL') {
          where.category = { contains: category, mode: 'insensitive' };
        }
        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { qualifications: { contains: q, mode: 'insensitive' } },
            { licenseNumber: { contains: q, mode: 'insensitive' } },
          ];
        }

        const apps = await (this.prisma as any).professionalApplication.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });

        if (apps && apps.length > 0) {
          return apps.map(this.mapPrismaApplication);
        }
      } catch {
        // Fallback
      }
    }

    return this.inMemoryApplications
      .filter((app) => {
        if (status && status !== 'ALL' && app.status !== status) return false;
        if (category && category !== 'ALL' && !app.category.toLowerCase().includes(category.toLowerCase())) {
          return false;
        }
        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = app.fullName.toLowerCase().includes(q);
          const matchEmail = app.email.toLowerCase().includes(q);
          const matchPhone = app.phone.includes(q);
          const matchQual = app.qualifications.toLowerCase().includes(q);
          const matchLic = app.licenseNumber ? app.licenseNumber.toLowerCase().includes(q) : false;
          if (!matchName && !matchEmail && !matchPhone && !matchQual && !matchLic) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getProfessionalApplicationById(id: string): Promise<ProfessionalApplicationEntity | null> {
    if (this.prisma) {
      try {
        const app = await (this.prisma as any).professionalApplication.findUnique({
          where: { id },
        });
        if (app) return this.mapPrismaApplication(app);
      } catch {
        // Fallback
      }
    }

    return this.inMemoryApplications.find((a) => a.id === id) || null;
  }

  public async reviewProfessionalApplication(
    id: string,
    review: {
      status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
      adminReviewNotes?: string | null;
      reviewerNotes?: string | null;
      rejectionReason?: string | null;
      reviewerEmail?: string | null;
    },
    reviewerId = 'admin@hutty.in'
  ): Promise<ProfessionalApplicationEntity> {
    const existing = await this.getProfessionalApplicationById(id);
    if (!existing) {
      throw new Error(`Professional application with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    let approvedConsultantId = existing.approvedConsultantId;
    const effectiveReviewer = review.reviewerEmail || reviewerId;
    const effectiveNotes = review.reviewerNotes || review.adminReviewNotes || existing.adminReviewNotes || null;

    // If approving, provision active Consultant profile if not already created
    if (review.status === 'APPROVED' && !approvedConsultantId) {
      const mappedCat = mapCategoryToConsultantCategories(existing.category)[0] || existing.category;
      const createdConsultant = await this.createConsultant({
        name: existing.fullName,
        title: `${existing.qualifications} • ${existing.category}`,
        category: mappedCat,
        experienceYears: existing.experienceYears,
        city: existing.city,
        serviceAreas: existing.serviceAreas.length > 0 ? existing.serviceAreas : ['All Bangalore'],
        about: `Verified professional registered with Hutty. Specializes in ${existing.category}. Experience: ${existing.experienceYears} years. Qualifications: ${existing.qualifications}. ${existing.licenseNumber ? `License / Reg: ${existing.licenseNumber}.` : ''}`,
        specializations: existing.expertise.length > 0 ? existing.expertise : [existing.category],
        services: existing.proposedServices.length > 0 ? existing.proposedServices : ['Initial Review & Assessment', 'Technical Consultation'],
        active: true,
        featured: false,
      }, effectiveReviewer);

      approvedConsultantId = createdConsultant.id;
    } else if (review.status === 'APPROVED' && approvedConsultantId) {
      // Ensure consultant is set to active
      await this.setConsultantStatus(approvedConsultantId, true, undefined, effectiveReviewer);
    } else if (review.status === 'SUSPENDED' && approvedConsultantId) {
      // Inactivate consultant
      await this.setConsultantStatus(approvedConsultantId, false, undefined, effectiveReviewer);
    }

    const updatedApp: ProfessionalApplicationEntity = {
      ...existing,
      status: review.status,
      adminReviewerId: effectiveReviewer,
      adminReviewNotes: effectiveNotes,
      reviewerNotes: effectiveNotes,
      reviewedBy: effectiveReviewer,
      reviewedAt: now,
      rejectionReason: review.status === 'REJECTED' ? review.rejectionReason || effectiveNotes : null,
      approvedConsultantId,
      updatedAt: now,
    };

    if (this.prisma) {
      try {
        const saved = await (this.prisma as any).professionalApplication.update({
          where: { id },
          data: {
            status: updatedApp.status,
            adminReviewerId: updatedApp.adminReviewerId,
            adminReviewNotes: updatedApp.adminReviewNotes,
            rejectionReason: updatedApp.rejectionReason,
            approvedConsultantId: updatedApp.approvedConsultantId,
            updatedAt: new Date(now),
          },
        });
        if (saved) return this.mapPrismaApplication(saved);
      } catch {
        // Fallback
      }
    }

    const idx = this.inMemoryApplications.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.inMemoryApplications[idx] = updatedApp;
    } else {
      this.inMemoryApplications.push(updatedApp);
    }

    return updatedApp;
  }

  private mapPrismaApplication(a: any): ProfessionalApplicationEntity {
    return {
      id: a.id,
      fullName: a.fullName,
      category: a.category,
      email: a.email,
      phone: a.phone,
      qualifications: a.qualifications,
      licenseNumber: a.licenseNumber || null,
      experienceYears: a.experienceYears,
      city: a.city,
      serviceAreas: a.serviceAreas || [],
      expertise: a.expertise || [],
      portfolioLinks: a.portfolioLinks || [],
      consultationModes: a.consultationModes || ['VIDEO', 'AUDIO'],
      proposedServices: a.proposedServices || [],
      proposedFeeINR: a.proposedFeeINR || 1499,
      documentsJson: a.documentsJson || null,
      status: a.status,
      adminReviewerId: a.adminReviewerId || null,
      adminReviewNotes: a.adminReviewNotes || null,
      rejectionReason: a.rejectionReason || null,
      approvedConsultantId: a.approvedConsultantId || null,
      consentGiven: a.consentGiven,
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  private mapPrismaPayment(p: any): ConsultationPaymentEntity {
    return {
      id: p.id,
      consultationRequestId: p.consultationRequestId,
      gateway: p.gateway,
      gatewayOrderId: p.gatewayOrderId,
      gatewayPaymentId: p.gatewayPaymentId || null,
      gatewaySignature: p.gatewaySignature || null,
      amountMinorUnits: p.amountMinorUnits,
      currency: p.currency,
      status: p.status,
      verifiedAt: p.verifiedAt ? new Date(p.verifiedAt).toISOString() : null,
      rawResponseJson: p.rawResponseJson || null,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  private mapPrismaEvent(e: any): ConsultationEventEntity {
    return {
      id: e.id,
      consultationRequestId: e.consultationRequestId,
      actorId: e.actorId || null,
      actorRole: e.actorRole || null,
      eventType: e.eventType,
      title: e.title,
      internalNote: e.internalNote || null,
      metadataJson: e.metadataJson || null,
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}

export const consultationService = new ConsultationService();
