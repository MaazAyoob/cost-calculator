// ==============================================================================
// Hutty Project Persistence Service
// Handles durable PostgreSQL persistence for homeowner estimation projects,
// project configurations, calculation snapshots, and user resolution.
// ==============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface ProjectEntity {
  id: string;
  name: string;
  title?: string;
  ownerId: string;
  userId?: string;
  city: string;
  authority: string;
  status: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED' | string;
  configuration?: ProjectConfigurationEntity | null;
  calculation?: CalculationResultEntity | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConfigurationEntity {
  id: string;
  projectId: string;
  plotLength: number;
  plotWidth: number;
  houseType: string;
  floors: number;
  parkingType: string;
  carCount: number;
  bikeCount: number;
  evCharging: boolean;
  liftRequired: boolean;
  roomsJson: any;
  qualityTier: 'Essential' | 'Premium' | 'Luxury';
  materialBrands: any;
}

export interface CalculationResultEntity {
  id: string;
  projectId: string;
  totalBUASqFt: number;
  totalCostINR: number;
  costPerSqFt: number;
  steelTonnes: number;
  cementBags: number;
  concreteCuM: number;
  timelineMonths: number;
  budgetBreakdown: any;
  quantitiesJson: any;
  configSnapshot?: any;
  calculatedAt: string;
}

export interface CreateProjectInput {
  id?: string;
  name?: string;
  ownerId?: string | null;
  leadName?: string;
  leadEmail: string;
  leadPhone?: string | null;
  city?: string;
  authority?: string;
  configuration?: {
    plotLength?: number;
    plotWidth?: number;
    houseType?: string;
    floors?: number;
    parkingType?: string;
    carCount?: number;
    bikeCount?: number;
    evCharging?: boolean;
    liftRequired?: boolean;
    rooms?: any;
    qualityTier?: string;
    materialBrands?: any;
  };
  calculation?: {
    totalBUASqFt?: number;
    totalCostINR?: number;
    costPerSqFt?: number;
    steelTonnes?: number;
    cementBags?: number;
    concreteCuM?: number;
    timelineMonths?: number;
    budgetBreakdown?: any;
    quantitiesJson?: any;
    configSnapshot?: any;
  };
}

export class ProjectService {
  private prisma: PrismaClient | null = null;
  private dbConnected: boolean = false;
  private inMemoryProjects: ProjectEntity[] = [];
  private inMemoryUsers?: Map<string, any>;

  constructor(client?: PrismaClient) {
    if (client) {
      this.prisma = client;
      this.dbConnected = true;
    } else if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient();
        this.dbConnected = true;
      } catch {
        this.prisma = null;
        this.dbConnected = false;
      }
    } else {
      this.prisma = null;
      this.dbConnected = false;
    }
  }

  public setPrismaClient(client: PrismaClient | null, connected: boolean = true) {
    this.prisma = client;
    this.dbConnected = connected;
  }

  private isDbConnected(): boolean {
    return Boolean(this.prisma && this.dbConnected && process.env.DATABASE_URL);
  }

  /**
   * Resolves or provisions a User record for the homeowner/lead.
   * If a user with the given email exists, returns it.
   * Otherwise, provisions a new USER account with a secure random password hash.
   */
  public async findOrCreateUser(params: {
    userId?: string | null;
    name?: string;
    email: string;
    phone?: string | null;
  }): Promise<{ id: string; name: string; email: string }> {
    const normalizedEmail = params.email.trim().toLowerCase();

    if (this.isDbConnected()) {
      try {
        // 1. If explicit userId provided, check if exists in database
        if (params.userId) {
          const userById = await (this.prisma as any).user.findUnique({
            where: { id: params.userId },
            select: { id: true, name: true, email: true },
          });
          if (userById) {
            return { id: userById.id, name: userById.name, email: userById.email };
          }
        }

        // 2. Lookup by email case-insensitively
        const userByEmail = await (this.prisma as any).user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          select: { id: true, name: true, email: true },
        });
        if (userByEmail) {
          return { id: userByEmail.id, name: userByEmail.name, email: userByEmail.email };
        }

        // 3. Provision a new User for this homeowner lead using a standard UUID
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const newUserId = crypto.randomUUID();

        try {
          const newUser = await (this.prisma as any).user.create({
            data: {
              id: newUserId,
              name: params.name?.trim() || 'Homeowner',
              email: normalizedEmail,
              phone: params.phone?.trim() || null,
              role: 'USER',
              password: passwordHash,
            },
            select: { id: true, name: true, email: true },
          });
          return { id: newUser.id, name: newUser.name, email: newUser.email };
        } catch (createErr: any) {
          // If creation collided on unique constraint (P2002), re-query by email
          if (
            createErr.code === 'P2002' ||
            createErr.message?.includes('Unique constraint') ||
            createErr.message?.includes('duplicate key')
          ) {
            const existing = await (this.prisma as any).user.findFirst({
              where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
              select: { id: true, name: true, email: true },
            });
            if (existing) {
              return { id: existing.id, name: existing.name, email: existing.email };
            }
          }
          throw createErr;
        }
      } catch (err: any) {
        console.error('[ProjectService] Prisma user lookup/creation error:', err.message);
        throw new Error(`DURABLE_STORAGE_WRITE_FAILED: Failed to resolve owner account in database: ${err.message}`);
      }
    }

    // In-memory fallback: only when database connection is not active
    if (!this.inMemoryUsers) {
      this.inMemoryUsers = new Map();
    }
    const existingMemoryUser = this.inMemoryUsers.get(normalizedEmail);
    if (existingMemoryUser) {
      return existingMemoryUser;
    }
    const memoryUser = {
      id: params.userId || `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: params.name?.trim() || 'Homeowner',
      email: normalizedEmail,
    };
    this.inMemoryUsers.set(normalizedEmail, memoryUser);
    return memoryUser;
  }

  /**
   * Normalizes QualityTier to valid Prisma enum ('Essential' | 'Premium' | 'Luxury').
   */
  public normalizeQualityTier(tier?: string): 'Essential' | 'Premium' | 'Luxury' {
    if (!tier) return 'Premium';
    const lower = tier.toLowerCase();
    if (lower.includes('lux')) return 'Luxury';
    if (lower.includes('std') || lower.includes('essent') || lower.includes('basic')) return 'Essential';
    return 'Premium';
  }

  /**
   * Persists a complete Project, ProjectConfiguration, and CalculationResult to PostgreSQL.
   */
  public async createProject(input: CreateProjectInput): Promise<ProjectEntity> {
    const leadEmail = input.leadEmail?.trim().toLowerCase();
    if (!leadEmail) {
      throw new Error('Valid homeowner email is required to persist project.');
    }

    // Resolve owner User in PostgreSQL
    const owner = await this.findOrCreateUser({
      userId: input.ownerId,
      name: input.leadName,
      email: leadEmail,
      phone: input.leadPhone,
    });

    // Idempotency check: if project already exists with this ID, update in-place rather than creating duplicates
    if (input.id) {
      const existing = await this.getProjectById(input.id);
      if (existing) {
        return this.updateProject(
          input.id,
          existing.ownerId,
          {
            name: input.name,
            city: input.city,
            authority: input.authority,
            configuration: input.configuration,
            calculation: input.calculation,
          },
          leadEmail
        );
      }
    }

    const projectId = input.id || crypto.randomUUID();
    const houseType = input.configuration?.houseType || 'Residential';
    const projectName = input.name?.trim() || `${houseType} Residence`;
    const city = input.city || 'Bangalore';
    const authority = input.authority || 'BBMP/BDA';

    const qualityTier = this.normalizeQualityTier(input.configuration?.qualityTier);

    const configData: ProjectConfigurationEntity = {
      id: crypto.randomUUID(),
      projectId,
      plotLength: Number(input.configuration?.plotLength) || 30,
      plotWidth: Number(input.configuration?.plotWidth) || 40,
      houseType,
      floors: Math.max(1, Math.round(Number(input.configuration?.floors) || 2)),
      parkingType: input.configuration?.parkingType || 'Normal Ground',
      carCount: Math.round(Number(input.configuration?.carCount) || 1),
      bikeCount: Math.round(Number(input.configuration?.bikeCount) || 2),
      evCharging: Boolean(input.configuration?.evCharging),
      liftRequired: Boolean(input.configuration?.liftRequired),
      roomsJson: input.configuration?.rooms || {},
      qualityTier,
      materialBrands: input.configuration?.materialBrands || {},
    };

    const calcData: CalculationResultEntity = {
      id: crypto.randomUUID(),
      projectId,
      totalBUASqFt: Number(input.calculation?.totalBUASqFt) || 2400,
      totalCostINR: Number(input.calculation?.totalCostINR) || 4800000,
      costPerSqFt: Number(input.calculation?.costPerSqFt) || 2000,
      steelTonnes: Number(input.calculation?.steelTonnes) || 0,
      cementBags: Math.round(Number(input.calculation?.cementBags) || 0),
      concreteCuM: Number(input.calculation?.concreteCuM) || 0,
      timelineMonths: Math.round(Number(input.calculation?.timelineMonths) || 12),
      budgetBreakdown: input.calculation?.budgetBreakdown || {},
      quantitiesJson: input.calculation?.quantitiesJson || {},
      configSnapshot: input.calculation?.configSnapshot || null,
      calculatedAt: new Date().toISOString(),
    };

    const projectEntity: ProjectEntity = {
      id: projectId,
      name: projectName,
      ownerId: owner.id,
      city,
      authority,
      status: 'PLANNED',
      configuration: configData,
      calculation: calcData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isDbConnected()) {
      try {
        await (this.prisma as any).project.create({
          data: {
            id: projectEntity.id,
            name: projectEntity.name,
            ownerId: projectEntity.ownerId,
            city: projectEntity.city,
            authority: projectEntity.authority,
            status: projectEntity.status,
            configuration: {
              create: {
                id: configData.id,
                plotLength: configData.plotLength,
                plotWidth: configData.plotWidth,
                houseType: configData.houseType,
                floors: configData.floors,
                parkingType: configData.parkingType,
                carCount: configData.carCount,
                bikeCount: configData.bikeCount,
                evCharging: configData.evCharging,
                liftRequired: configData.liftRequired,
                roomsJson: configData.roomsJson,
                qualityTier: configData.qualityTier,
                materialBrands: configData.materialBrands,
              },
            },
            calculation: {
              create: {
                id: calcData.id,
                totalBUASqFt: calcData.totalBUASqFt,
                totalCostINR: calcData.totalCostINR,
                costPerSqFt: calcData.costPerSqFt,
                steelTonnes: calcData.steelTonnes,
                cementBags: calcData.cementBags,
                concreteCuM: calcData.concreteCuM,
                timelineMonths: calcData.timelineMonths,
                budgetBreakdown: calcData.budgetBreakdown,
                quantitiesJson: calcData.quantitiesJson,
                configSnapshot: calcData.configSnapshot,
              },
            },
          },
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to persist project in database: ' + err.message);
        }
        console.warn('[ProjectService] Prisma project create failed, recorded in-memory:', err.message);
      }
    }

    this.inMemoryProjects.unshift(projectEntity);
    return projectEntity;
  }

  /**
   * Persists a project from a client-side calculation snapshot (e.g. from the modal checkout payload).
   */
  public async createProjectFromSnapshot(params: {
    clientReferenceId?: string;
    leadName?: string;
    leadEmail: string;
    leadPhone?: string | null;
    userId?: string | null;
    snapshot: any;
  }): Promise<ProjectEntity> {
    const snap = params.snapshot || {};

    return this.createProject({
      name: snap.projectName || `${snap.houseType || 'Residential'} Construction Project`,
      ownerId: params.userId,
      leadName: params.leadName,
      leadEmail: params.leadEmail,
      leadPhone: params.leadPhone,
      city: snap.city || 'Bangalore',
      authority: snap.authority || 'BBMP/BDA',
      configuration: {
        plotLength: snap.plotLength || 30,
        plotWidth: snap.plotWidth || 40,
        houseType: snap.houseType || 'Duplex',
        floors: snap.floors || 2,
        parkingType: snap.parkingType || 'Normal Ground',
        carCount: snap.carCount || 1,
        bikeCount: snap.bikeCount || 2,
        evCharging: Boolean(snap.evCharging),
        liftRequired: Boolean(snap.liftRequired),
        rooms: snap.rooms || snap.roomsJson || {},
        qualityTier: snap.qualityTier || snap.specificationTier || 'Premium',
        materialBrands: snap.materialBrands || {},
      },
      calculation: {
        totalBUASqFt: snap.buaSqFt || snap.totalBUASqFt || 2400,
        totalCostINR: snap.totalCostINR || snap.totalCost || 4800000,
        costPerSqFt: snap.costPerSqFt || (snap.totalCostINR && snap.buaSqFt ? Math.round(snap.totalCostINR / snap.buaSqFt) : 2000),
        steelTonnes: snap.steelTonnes || 0,
        cementBags: snap.cementBags || 0,
        concreteCuM: snap.concreteCuM || 0,
        timelineMonths: snap.timelineMonths || 12,
        budgetBreakdown: snap.budgetBreakdown || {},
        quantitiesJson: snap.quantitiesJson || {},
        configSnapshot: snap,
      },
    });
  }

  /**
   * Saves or updates a project with support for title, userId, and snapshot data.
   */
  public async saveProject(input: {
    id?: string;
    userId?: string;
    ownerId?: string;
    title?: string;
    name?: string;
    city?: string;
    plotLength?: number;
    plotWidth?: number;
    builtUpArea?: number;
    packageType?: string;
    status?: string;
    leadEmail?: string;
    configuration?: any;
    calculation?: any;
  }): Promise<ProjectEntity> {
    let ownerId = input.userId || input.ownerId;
    if (this.isDbConnected()) {
      const owner = await this.findOrCreateUser({
        userId: ownerId,
        email: input.leadEmail || 'client@hutty.in',
      });
      ownerId = owner.id;
    } else {
      ownerId = ownerId || `usr-${Date.now()}`;
    }
    const title = input.title || input.name || 'Custom Home Project';

    const project: ProjectEntity = {
      id: input.id || crypto.randomUUID(),
      name: title,
      title: title,
      ownerId: ownerId,
      userId: ownerId,
      city: input.city || 'Bangalore',
      authority: 'BBMP/BDA',
      status: (input.status as any) || 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configuration: input.configuration ? {
        id: crypto.randomUUID(),
        projectId: input.id || crypto.randomUUID(),
        plotLength: input.plotLength || 30,
        plotWidth: input.plotWidth || 40,
        houseType: 'Residential',
        floors: 2,
        parkingType: 'Normal Ground',
        carCount: 1,
        bikeCount: 2,
        evCharging: false,
        liftRequired: false,
        roomsJson: {},
        qualityTier: (input.packageType as any) || 'Premium',
        materialBrands: {},
      } : undefined,
      calculation: input.calculation || undefined,
    };

    if (this.prisma && this.dbConnected && process.env.DATABASE_URL) {
      try {
        await (this.prisma as any).project.upsert({
          where: { id: project.id },
          update: {
            name: project.name,
            city: project.city,
            status: project.status,
            updatedAt: new Date(),
          },
          create: {
            id: project.id,
            name: project.name,
            ownerId: project.ownerId,
            city: project.city,
            authority: project.authority,
            status: project.status,
          },
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to save project: ' + err.message);
        }
      }
    }

    const existingIdx = this.inMemoryProjects.findIndex((p) => p.id === project.id);
    if (existingIdx >= 0) {
      this.inMemoryProjects[existingIdx] = project;
    } else {
      this.inMemoryProjects.unshift(project);
    }
    return project;
  }

  /**
   * Retrieves a project by its database ID.
   */
  public async getProjectById(id: string): Promise<ProjectEntity | null> {
    if (this.isDbConnected()) {
      try {
        const found = await (this.prisma as any).project.findUnique({
          where: { id },
          include: {
            configuration: true,
            calculation: true,
          },
        });
        if (found) {
          return {
            id: found.id,
            name: found.name,
            title: found.name,
            ownerId: found.ownerId,
            userId: found.ownerId,
            city: found.city,
            authority: found.authority,
            status: found.status,
            configuration: found.configuration,
            calculation: found.calculation,
            createdAt: found.createdAt?.toISOString?.() || String(found.createdAt),
            updatedAt: found.updatedAt?.toISOString?.() || String(found.updatedAt),
          };
        }
      } catch (err: any) {
        console.warn('[ProjectService] Error querying project by ID:', err.message);
      }
    }

    const foundMem = this.inMemoryProjects.find((p) => p.id === id);
    if (foundMem) {
      return {
        ...foundMem,
        title: foundMem.title || foundMem.name,
        userId: foundMem.userId || foundMem.ownerId,
      };
    }
    return null;
  }

  /**
   * Retrieves all projects owned by a specific authenticated customer.
   */
  public async getUserProjects(userId: string): Promise<ProjectEntity[]> {
    if (!userId) return [];

    if (this.isDbConnected()) {
      try {
        const found = await (this.prisma as any).project.findMany({
          where: {
            ownerId: userId,
            status: { not: 'ARCHIVED' },
          },
          include: {
            configuration: true,
            calculation: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });

        return found.map((p: any) => ({
          id: p.id,
          name: p.name,
          title: p.name,
          ownerId: p.ownerId,
          userId: p.ownerId,
          city: p.city,
          authority: p.authority,
          status: p.status,
          configuration: p.configuration,
          calculation: p.calculation,
          createdAt: p.createdAt?.toISOString?.() || String(p.createdAt),
          updatedAt: p.updatedAt?.toISOString?.() || String(p.updatedAt),
        }));
      } catch (err: any) {
        console.warn('[ProjectService] Error querying user projects:', err.message);
      }
    }

    return this.inMemoryProjects
      .filter((p) => (p.ownerId === userId || p.userId === userId) && p.status !== 'ARCHIVED')
      .map((p) => ({
        ...p,
        title: p.title || p.name,
        userId: p.userId || p.ownerId,
      }));
  }

  /**
   * Alias for getUserProjects used by consumer accounts and integration test suites.
   */
  public async listProjectsByUser(userId: string): Promise<ProjectEntity[]> {
    return this.getUserProjects(userId);
  }

  /**
   * Updates an existing project with auto-saved inputs and calculation snapshots.
   * Strictly enforces that the caller owns the project.
   */
  public async updateProject(
    id: string,
    userId: string,
    updateData: {
      name?: string;
      city?: string;
      authority?: string;
      configuration?: any;
      calculation?: any;
    },
    userEmail?: string
  ): Promise<ProjectEntity> {
    const existing = await this.getProjectById(id);
    if (!existing) {
      throw new Error(`Project with ID "${id}" not found.`);
    }

    if (existing.ownerId !== userId) {
      let isOwner = false;
      const normalizedCallerEmail = (userEmail || '').trim().toLowerCase();
      if (this.isDbConnected()) {
        try {
          const ownerUser = await (this.prisma as any).user.findUnique({
            where: { id: existing.ownerId },
            select: { id: true, email: true },
          });
          const callerUser = await (this.prisma as any).user.findUnique({
            where: { id: userId },
            select: { id: true, email: true },
          });
          const ownerEmail = (ownerUser?.email || '').trim().toLowerCase();
          const callerDbEmail = (callerUser?.email || '').trim().toLowerCase();

          if (
            (ownerEmail && callerDbEmail && ownerEmail === callerDbEmail) ||
            (ownerEmail && normalizedCallerEmail && ownerEmail === normalizedCallerEmail)
          ) {
            isOwner = true;
          }
        } catch {}
      } else {
        const inMemOwner = this.inMemoryUsers?.get(normalizedCallerEmail);
        if (inMemOwner && inMemOwner.id === existing.ownerId) {
          isOwner = true;
        }
      }
      if (!isOwner) {
        throw new Error(`FORBIDDEN: You do not have permission to modify this project.`);
      }
    }

    const now = new Date().toISOString();

    if (this.isDbConnected()) {
      try {
        const updatePayload: any = {
          updatedAt: new Date(),
        };
        if (updateData.name) updatePayload.name = updateData.name.trim();
        if (updateData.city) updatePayload.city = updateData.city;
        if (updateData.authority) updatePayload.authority = updateData.authority;

        if (updateData.configuration) {
          const cfg = updateData.configuration;
          updatePayload.configuration = {
            upsert: {
              create: {
                id: crypto.randomUUID(),
                plotLength: Number(cfg.plotLength) || 30,
                plotWidth: Number(cfg.plotWidth) || 40,
                houseType: cfg.houseType || 'Duplex',
                floors: Math.max(1, Math.round(Number(cfg.floors) || 2)),
                parkingType: cfg.parkingType || 'Normal Ground',
                carCount: Math.round(Number(cfg.carCount) || 1),
                bikeCount: Math.round(Number(cfg.bikeCount) || 2),
                evCharging: Boolean(cfg.evCharging),
                liftRequired: Boolean(cfg.liftRequired),
                roomsJson: cfg.rooms || cfg.roomsJson || {},
                qualityTier: this.normalizeQualityTier(cfg.qualityTier),
                materialBrands: cfg.materialBrands || {},
              },
              update: {
                plotLength: cfg.plotLength !== undefined ? Number(cfg.plotLength) : undefined,
                plotWidth: cfg.plotWidth !== undefined ? Number(cfg.plotWidth) : undefined,
                houseType: cfg.houseType || undefined,
                floors: cfg.floors !== undefined ? Math.max(1, Math.round(Number(cfg.floors))) : undefined,
                parkingType: cfg.parkingType || undefined,
                carCount: cfg.carCount !== undefined ? Math.round(Number(cfg.carCount)) : undefined,
                bikeCount: cfg.bikeCount !== undefined ? Math.round(Number(cfg.bikeCount)) : undefined,
                evCharging: cfg.evCharging !== undefined ? Boolean(cfg.evCharging) : undefined,
                liftRequired: cfg.liftRequired !== undefined ? Boolean(cfg.liftRequired) : undefined,
                roomsJson: cfg.rooms || cfg.roomsJson || undefined,
                qualityTier: cfg.qualityTier ? this.normalizeQualityTier(cfg.qualityTier) : undefined,
                materialBrands: cfg.materialBrands || undefined,
              },
            },
          };
        }

        if (updateData.calculation) {
          const calc = updateData.calculation;
          updatePayload.calculation = {
            upsert: {
              create: {
                id: crypto.randomUUID(),
                totalBUASqFt: Number(calc.totalBUASqFt) || 2400,
                totalCostINR: Number(calc.totalCostINR) || 4800000,
                costPerSqFt: Number(calc.costPerSqFt) || 2000,
                steelTonnes: Number(calc.steelTonnes) || 0,
                cementBags: Math.round(Number(calc.cementBags) || 0),
                concreteCuM: Number(calc.concreteCuM) || 0,
                timelineMonths: Math.round(Number(calc.timelineMonths) || 12),
                budgetBreakdown: calc.budgetBreakdown || {},
                quantitiesJson: calc.quantitiesJson || {},
                configSnapshot: calc.configSnapshot || null,
              },
              update: {
                totalBUASqFt: calc.totalBUASqFt !== undefined ? Number(calc.totalBUASqFt) : undefined,
                totalCostINR: calc.totalCostINR !== undefined ? Number(calc.totalCostINR) : undefined,
                costPerSqFt: calc.costPerSqFt !== undefined ? Number(calc.costPerSqFt) : undefined,
                steelTonnes: calc.steelTonnes !== undefined ? Number(calc.steelTonnes) : undefined,
                cementBags: calc.cementBags !== undefined ? Math.round(Number(calc.cementBags)) : undefined,
                concreteCuM: calc.concreteCuM !== undefined ? Number(calc.concreteCuM) : undefined,
                timelineMonths: calc.timelineMonths !== undefined ? Math.round(Number(calc.timelineMonths)) : undefined,
                budgetBreakdown: calc.budgetBreakdown || undefined,
                quantitiesJson: calc.quantitiesJson || undefined,
                configSnapshot: calc.configSnapshot || undefined,
                calculatedAt: new Date(),
              },
            },
          };
        }

        const updated = await (this.prisma as any).project.update({
          where: { id },
          data: updatePayload,
          include: { configuration: true, calculation: true },
        });

        return {
          id: updated.id,
          name: updated.name,
          ownerId: updated.ownerId,
          city: updated.city,
          authority: updated.authority,
          status: updated.status,
          configuration: updated.configuration,
          calculation: updated.calculation,
          createdAt: updated.createdAt?.toISOString?.() || String(updated.createdAt),
          updatedAt: updated.updatedAt?.toISOString?.() || String(updated.updatedAt),
        };
      } catch (err: any) {
        console.warn('[ProjectService] Prisma project update failed:', err.message);
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DURABLE_STORAGE_WRITE_FAILED: Failed to update project in database: ' + err.message);
        }
      }
    }

    // In-memory fallback
    const memIdx = this.inMemoryProjects.findIndex((p) => p.id === id);
    const target = memIdx >= 0 ? this.inMemoryProjects[memIdx] : existing;

    if (updateData.name) target.name = updateData.name.trim();
    if (updateData.city) target.city = updateData.city;
    if (updateData.authority) target.authority = updateData.authority;
    if (updateData.configuration) {
      target.configuration = { ...target.configuration, ...updateData.configuration };
    }
    if (updateData.calculation) {
      target.calculation = { ...target.calculation, ...updateData.calculation, calculatedAt: now };
    }
    target.updatedAt = now;
    if (memIdx >= 0) {
      this.inMemoryProjects[memIdx] = target;
    }
    return {
      ...target,
      title: target.title || target.name,
      userId: target.userId || target.ownerId,
    };
  }

  /**
   * Renames a project owned by the authenticated customer.
   */
  public async renameProject(id: string, userId: string, newName: string): Promise<ProjectEntity> {
    if (!newName || !newName.trim()) {
      throw new Error('Project name cannot be empty.');
    }
    return this.updateProject(id, userId, { name: newName.trim() });
  }

  /**
   * Safely archives/deletes a project owned by the authenticated customer.
   */
  public async deleteProject(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getProjectById(id);
    if (!existing) {
      throw new Error(`Project with ID "${id}" not found.`);
    }

    if (existing.ownerId !== userId) {
      throw new Error(`FORBIDDEN: You do not have permission to delete this project.`);
    }

    if (this.isDbConnected()) {
      try {
        await (this.prisma as any).project.update({
          where: { id },
          data: { status: 'ARCHIVED' },
        });
        const memIdx = this.inMemoryProjects.findIndex((p) => p.id === id);
        if (memIdx >= 0) {
          this.inMemoryProjects[memIdx].status = 'ARCHIVED';
        }
        return { success: true, message: 'Project archived successfully.' };
      } catch (err: any) {
        console.warn('[ProjectService] Prisma archive failed, using memory:', err.message);
      }
    }

    const memIdx = this.inMemoryProjects.findIndex((p) => p.id === id);
    if (memIdx >= 0) {
      this.inMemoryProjects[memIdx].status = 'ARCHIVED';
    }
    existing.status = 'ARCHIVED';
    return { success: true, message: 'Project archived successfully.' };
  }

  /**
   * Clears in-memory projects (for test cleanup).
   */
  public clearInMemory() {
    this.inMemoryProjects = [];
    if (this.inMemoryUsers) {
      this.inMemoryUsers.clear();
    }
  }
}

export const projectService = new ProjectService();
