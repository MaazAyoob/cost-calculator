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
  ownerId: string;
  city: string;
  authority: string;
  status: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
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

  constructor(client?: PrismaClient) {
    if (client) {
      this.prisma = client;
      this.dbConnected = true;
    } else {
      try {
        this.prisma = new PrismaClient();
        this.dbConnected = true;
      } catch {
        this.prisma = null;
        this.dbConnected = false;
      }
    }
  }

  public setPrismaClient(client: PrismaClient | null, connected: boolean = true) {
    this.prisma = client;
    this.dbConnected = connected;
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

    if (this.prisma && this.dbConnected) {
      try {
        // 1. If explicit userId provided, check if exists
        if (params.userId) {
          const userById = await (this.prisma as any).user.findUnique({
            where: { id: params.userId },
          });
          if (userById) {
            return { id: userById.id, name: userById.name, email: userById.email };
          }
        }

        // 2. Lookup by email
        const userByEmail = await (this.prisma as any).user.findUnique({
          where: { email: normalizedEmail },
        });
        if (userByEmail) {
          return { id: userByEmail.id, name: userByEmail.name, email: userByEmail.email };
        }

        // 3. Provision a new User for this homeowner lead
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        const newUser = await (this.prisma as any).user.create({
          data: {
            id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            name: params.name?.trim() || 'Homeowner',
            email: normalizedEmail,
            phone: params.phone?.trim() || null,
            role: 'USER',
            password: passwordHash,
          },
        });
        return { id: newUser.id, name: newUser.name, email: newUser.email };
      } catch (err: any) {
        console.warn('[ProjectService] Prisma user lookup/creation failed, using fallback:', err.message);
      }
    }

    // In-memory fallback
    return {
      id: params.userId || `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: params.name?.trim() || 'Homeowner',
      email: normalizedEmail,
    };
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

    const projectId = crypto.randomUUID();
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
      floors: Math.max(1, Number(input.configuration?.floors) || 2),
      parkingType: input.configuration?.parkingType || 'Normal Ground',
      carCount: Number(input.configuration?.carCount) || 1,
      bikeCount: Number(input.configuration?.bikeCount) || 2,
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
      cementBags: Number(input.calculation?.cementBags) || 0,
      concreteCuM: Number(input.calculation?.concreteCuM) || 0,
      timelineMonths: Number(input.calculation?.timelineMonths) || 12,
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

    if (this.prisma && this.dbConnected) {
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
   * Retrieves a project by its database ID.
   */
  public async getProjectById(id: string): Promise<ProjectEntity | null> {
    if (this.prisma && this.dbConnected) {
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
            ownerId: found.ownerId,
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

    return this.inMemoryProjects.find((p) => p.id === id) || null;
  }

  /**
   * Fast verification check whether a project exists in PostgreSQL.
   */
  public async validateProjectExists(id: string): Promise<boolean> {
    const project = await this.getProjectById(id);
    return project !== null;
  }

  /**
   * Clears in-memory projects (for test cleanup).
   */
  public clearInMemory() {
    this.inMemoryProjects = [];
  }
}

export const projectService = new ProjectService();
