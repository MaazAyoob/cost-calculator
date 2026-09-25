// ============================================================
// CONFIGURATION VERSIONING & LIFECYCLE SERVICE
// Authoritative backend service managing versioned calculation configurations,
// server-side validation, what-if simulations, atomic publishing, and audit trails.
// ============================================================

import { PrismaClient } from '@prisma/client';
import {
  CANONICAL_BASELINE_VERSION,
  CANONICAL_CONFIG_PARAMETERS,
  KNOWN_CONFLICT_REGISTRY,
  CanonicalConfigParam,
  ConflictDefinition,
} from '../constants/canonicalConfig';

let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
} catch (err) {
  console.warn('[ConfigVersionService] Prisma client initialization note:', err);
}

const isPrismaAvailable = () => Boolean(prisma && process.env.DATABASE_URL);

export type VersionStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'REJECTED';

export type ConfigAuditAction =
  | 'CREATE_DRAFT'
  | 'EDIT_PARAMETER'
  | 'VALIDATE'
  | 'SIMULATE'
  | 'SUBMIT_REVIEW'
  | 'APPROVE_REVIEW'
  | 'PUBLISH'
  | 'ACTIVATE'
  | 'ARCHIVE'
  | 'REJECT'
  | 'ROLLBACK_PREPARE';

export interface ValidationErrorItem {
  key: string;
  parameterName: string;
  currentValue: any;
  error: string;
  category: string;
  isCritical: boolean;
}

export interface ConflictWarningItem {
  key: string;
  parameterName: string;
  effectiveValue: any;
  alternateValue: any;
  unit: string;
  reason: string;
  status: 'CONFLICT_REQUIRES_REVIEW';
}

export interface ValidationReport {
  versionId: string;
  versionNumber: string;
  validationStatus: 'VALID' | 'INVALID';
  schemaValid: boolean;
  requiresBusinessReview: boolean;
  schemaErrors: ValidationErrorItem[];
  conflictWarnings: ConflictWarningItem[];
  validatedAt: string;
  validatedBy: string;
}

export interface SimulationResult {
  versionId: string;
  versionNumber: string;
  baseVersionNumber: string;
  timestamp: string;
  projectSummary: {
    builtUpAreaSqFt: number;
    floors: number;
    plotAreaSqFt: number;
  };
  financialDelta: {
    activeTotalCost: number;
    draftTotalCost: number;
    costDifference: number;
    percentageChange: number;
    materialsCostDelta: number;
    labourCostDelta: number;
    commercialsCostDelta: number;
  };
  quantityDeltas: Array<{
    item: string;
    unit: string;
    activeQuantity: number;
    draftQuantity: number;
    difference: number;
    percentageChange: number;
  }>;
  affectedBOQLines: string[];
  affectedReportSections: string[];
  changedParameters: Array<{
    key: string;
    name: string;
    activeValue: any;
    draftValue: any;
    unit: string;
  }>;
}

export interface ParameterDiffItem {
  key: string;
  name: string;
  unit: string;
  category: string;
  location: string;
  tier: string;
  oldValue: any;
  newValue: any;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
}

// In-Memory fallback store for containerized, offline, or testing operation
interface InMemoryVersionRecord {
  id: string;
  versionNumber: string;
  status: VersionStatus;
  description?: string;
  changeNote?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  validationStatus: string;
  parametersCount: number;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: Date;
  publishedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  parameters: Map<string, CanonicalConfigParam & { id: string; versionId: string; status: string }>;
}

interface InMemoryAuditRecord {
  id: string;
  versionId: string;
  parameterId?: string;
  parameterKey?: string;
  action: ConfigAuditAction;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  adminEmail: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

class ConfigVersionService {
  private inMemoryVersions: Map<string, InMemoryVersionRecord> = new Map();
  private inMemoryAudits: InMemoryAuditRecord[] = [];
  private isInitialized = false;

  constructor() {
    this.bootstrapBaselineInMemory();
  }

  private bootstrapBaselineInMemory() {
    if (this.isInitialized) return;

    const baseVersionId = 'cfg-ver-1.0.0';
    const paramsMap = new Map<string, CanonicalConfigParam & { id: string; versionId: string; status: string }>();

    CANONICAL_CONFIG_PARAMETERS.forEach((p, idx) => {
      const paramId = `param-1.0.0-${idx + 1}`;
      const compositeKey = `${p.key}:${p.location || 'Global'}:${p.specificationTier || 'Global'}`;
      paramsMap.set(compositeKey, {
        ...p,
        id: paramId,
        versionId: baseVersionId,
        status: 'ACTIVE',
      });
    });

    const baselineRec: InMemoryVersionRecord = {
      id: baseVersionId,
      versionNumber: CANONICAL_BASELINE_VERSION.versionNumber,
      status: 'ACTIVE',
      description: 'Authoritative Baseline Configuration v1.0.0',
      changeNote: CANONICAL_BASELINE_VERSION.changeNote,
      effectiveFrom: CANONICAL_BASELINE_VERSION.effectiveFrom,
      validationStatus: 'VALID',
      parametersCount: paramsMap.size,
      createdBy: CANONICAL_BASELINE_VERSION.createdBy,
      publishedBy: CANONICAL_BASELINE_VERSION.publishedBy,
      publishedAt: CANONICAL_BASELINE_VERSION.effectiveFrom,
      createdAt: CANONICAL_BASELINE_VERSION.effectiveFrom,
      updatedAt: CANONICAL_BASELINE_VERSION.effectiveFrom,
      parameters: paramsMap,
    };

    this.inMemoryVersions.set(baseVersionId, baselineRec);
    this.inMemoryAudits.push({
      id: 'audit-init-1',
      versionId: baseVersionId,
      action: 'PUBLISH',
      reason: 'Baseline production initialization',
      adminEmail: 'system@hutty.in',
      timestamp: CANONICAL_BASELINE_VERSION.effectiveFrom,
    });

    this.isInitialized = true;
  }

  // ── AUDIT HELPER ──
  private async recordAudit(entry: Omit<InMemoryAuditRecord, 'id' | 'timestamp'>) {
    const auditId = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: InMemoryAuditRecord = {
      ...entry,
      id: auditId,
      timestamp: new Date(),
    };
    this.inMemoryAudits.unshift(fullEntry);

    if (isPrismaAvailable() && (prisma as any).calculationConfigAuditLog) {
      try {
        await (prisma as any).calculationConfigAuditLog.create({
          data: {
            id: auditId,
            versionId: entry.versionId,
            parameterId: entry.parameterId || null,
            parameterKey: entry.parameterKey || null,
            action: entry.action,
            oldValue: entry.oldValue ?? null,
            newValue: entry.newValue ?? null,
            reason: entry.reason || null,
            adminEmail: entry.adminEmail,
            ipAddress: entry.ipAddress || null,
            userAgent: entry.userAgent || null,
            timestamp: fullEntry.timestamp,
          },
        });
      } catch (dbErr) {
        console.warn('[ConfigVersionService] Audit DB persist note:', dbErr);
      }
    }
  }

  // ── 1. LIST VERSIONS ──
  public async getVersions(filter?: { status?: VersionStatus }): Promise<any[]> {
    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        const where: any = {};
        if (filter?.status) where.status = filter.status;
        const dbVersions = await (prisma as any).calculationConfigVersion.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { parameters: true } } },
        });
        if (dbVersions && dbVersions.length > 0) {
          return dbVersions.map((v: any) => ({
            ...v,
            parametersCount: v._count?.parameters ?? v.parametersCount,
          }));
        }
      } catch (err) {
        console.warn('[ConfigVersionService] DB findMany versions note:', err);
      }
    }

    // In-memory fallback
    const list = Array.from(this.inMemoryVersions.values()).map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      status: v.status,
      description: v.description,
      changeNote: v.changeNote,
      effectiveFrom: v.effectiveFrom,
      effectiveTo: v.effectiveTo,
      validationStatus: v.validationStatus,
      parametersCount: v.parameters.size,
      createdBy: v.createdBy,
      validatedBy: v.validatedBy,
      validatedAt: v.validatedAt,
      publishedBy: v.publishedBy,
      publishedAt: v.publishedAt,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    if (filter?.status) {
      return list.filter((v) => v.status === filter.status);
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // ── 2. GET VERSION BY ID ──
  public async getVersionById(id: string): Promise<any | null> {
    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        const v = await (prisma as any).calculationConfigVersion.findUnique({
          where: { id },
          include: { parameters: true },
        });
        if (v) return v;
      } catch (err) {
        console.warn('[ConfigVersionService] DB findUnique version note:', err);
      }
    }

    const mem = this.inMemoryVersions.get(id);
    if (!mem) return null;
    return {
      ...mem,
      parameters: Array.from(mem.parameters.values()),
    };
  }

  // ── 3. CREATE DRAFT VERSION ──
  public async createDraftVersion(params: {
    baseVersionId?: string;
    versionNumber?: string;
    description?: string;
    changeNote?: string;
    parameters?: Array<{
      key: string;
      value: any;
      name?: string;
      category?: string;
      unit?: string;
      location?: string;
      specificationTier?: string;
    }>;
    adminEmail: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const { baseVersionId, description, changeNote, parameters: initialParams, adminEmail, ipAddress, userAgent } = params;

    // Determine base parameters to copy
    let sourceParams: CanonicalConfigParam[] = [];
    if (baseVersionId) {
      const baseVer = await this.getVersionById(baseVersionId);
      if (baseVer && baseVer.parameters) {
        sourceParams = baseVer.parameters.map((p: any) => ({
          key: p.key,
          name: p.name,
          description: p.description,
          category: p.category,
          value: typeof p.valueJson === 'object' ? p.valueJson : (p.value ?? p.valueJson),
          unit: p.unit,
          valueType: p.valueType || 'number',
          minimum: p.minimum,
          maximum: p.maximum,
          location: p.location || 'Global',
          specificationTier: p.specificationTier || 'Global',
          source: p.source || 'Cloned from ' + baseVer.versionNumber,
        }));
      }
    }

    if (sourceParams.length === 0) {
      sourceParams = [...CANONICAL_CONFIG_PARAMETERS];
    }

    // Compute version number if not given
    const existingVersions = await this.getVersions();
    const count = existingVersions.length;
    const versionNumber = params.versionNumber || `v1.${count}.0-draft`;

    // Ensure unique version number
    const existingNum = existingVersions.find((v) => v.versionNumber === versionNumber);
    if (existingNum) {
      throw new Error(`Configuration version number '${versionNumber}' already exists.`);
    }

    const newId = `cfg-ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    // Prepare in-memory record
    const paramsMap = new Map<string, any>();
    sourceParams.forEach((p, idx) => {
      const pId = `param-${newId}-${idx + 1}`;
      const compositeKey = `${p.key}:${p.location || 'Global'}:${p.specificationTier || 'Global'}`;
      paramsMap.set(compositeKey, {
        ...p,
        id: pId,
        versionId: newId,
        status: 'DRAFT',
      });
    });

    // Merge any explicit initial parameter overrides into the draft
    if (initialParams && initialParams.length > 0) {
      for (const ip of initialParams) {
        const loc = ip.location || 'Global';
        const tier = ip.specificationTier || 'Global';
        const compKey = `${ip.key}:${loc}:${tier}`;
        const existing = paramsMap.get(compKey);
        if (existing) {
          existing.value = ip.value;
        } else {
          paramsMap.set(compKey, {
            id: `param-${newId}-${paramsMap.size + 1}`,
            versionId: newId,
            key: ip.key,
            name: ip.name || ip.key,
            description: null,
            category: ip.category || 'CUSTOM',
            value: ip.value,
            unit: ip.unit || 'scalar',
            valueType: typeof ip.value === 'number' ? 'number' : 'string',
            location: loc,
            specificationTier: tier,
            source: 'Initial Draft Param',
            status: 'DRAFT',
            createdBy: adminEmail,
          });
        }
      }
    }

    const newVersionRecord: InMemoryVersionRecord = {
      id: newId,
      versionNumber,
      status: 'DRAFT',
      description: description || `Draft configuration based on ${baseVersionId || 'baseline'}`,
      changeNote: changeNote || 'Initial draft creation',
      effectiveFrom: now,
      validationStatus: 'PENDING_VALIDATION',
      parametersCount: paramsMap.size,
      createdBy: adminEmail,
      createdAt: now,
      updatedAt: now,
      parameters: paramsMap,
    };

    this.inMemoryVersions.set(newId, newVersionRecord);

    // Persist to DB if available
    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        await (prisma as any).calculationConfigVersion.create({
          data: {
            id: newId,
            versionNumber,
            status: 'DRAFT',
            description: newVersionRecord.description,
            changeNote: newVersionRecord.changeNote,
            effectiveFrom: now,
            validationStatus: 'PENDING_VALIDATION',
            parametersCount: paramsMap.size,
            createdBy: adminEmail,
            createdAt: now,
            updatedAt: now,
            parameters: {
              create: Array.from(paramsMap.values()).map((p) => ({
                id: p.id,
                key: p.key,
                name: p.name,
                description: p.description || null,
                category: p.category,
                valueJson: p.value,
                unit: p.unit,
                valueType: p.valueType,
                minimum: p.minimum || null,
                maximum: p.maximum || null,
                location: p.location || 'Global',
                specificationTier: p.specificationTier || 'Global',
                source: p.source || null,
                status: 'DRAFT',
                createdBy: adminEmail,
              })),
            },
          },
        });
      } catch (dbErr) {
        console.warn('[ConfigVersionService] DB create draft note:', dbErr);
      }
    }

    await this.recordAudit({
      versionId: newId,
      action: 'CREATE_DRAFT',
      newValue: { versionNumber, parametersCount: paramsMap.size },
      reason: changeNote || 'New draft version created',
      adminEmail,
      ipAddress,
      userAgent,
    });

    return {
      id: newId,
      versionNumber,
      status: 'DRAFT',
      parametersCount: paramsMap.size,
      createdAt: now,
    };
  }

  // ── 4. UPDATE DRAFT PARAMETERS / METADATA ──
  public async updateDraft(
    id: string,
    updates: {
      description?: string;
      changeNote?: string;
      effectiveFrom?: string;
      parameters?: Array<{
        key: string;
        value: any;
        location?: string;
        specificationTier?: string;
      }>;
      adminEmail: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<any> {
    const version = await this.getVersionById(id);
    if (!version) throw new Error(`Version '${id}' not found.`);

    if (version.status !== 'DRAFT' && version.status !== 'VALIDATED') {
      throw new Error(
        `Cannot mutate version with status '${version.status}'. Historical and active published versions are strictly immutable. Create a new draft instead.`
      );
    }

    const mem = this.inMemoryVersions.get(id);
    const now = new Date();

    if (updates.description && mem) mem.description = updates.description;
    if (updates.changeNote && mem) mem.changeNote = updates.changeNote;
    if (updates.effectiveFrom && mem) mem.effectiveFrom = new Date(updates.effectiveFrom);
    if (mem) mem.updatedAt = now;

    const modifiedParams: any[] = [];

    if (updates.parameters && updates.parameters.length > 0) {
      for (const p of updates.parameters) {
        const loc = p.location || 'Global';
        const tier = p.specificationTier || 'Global';
        const compKey = `${p.key}:${loc}:${tier}`;

        let existing = mem?.parameters.get(compKey);
        const oldVal = existing ? existing.value : null;

        if (existing) {
          existing.value = p.value;
          modifiedParams.push({ key: p.key, oldVal, newVal: p.value });
        } else if (mem) {
          const newParam = {
            id: `param-${id}-${Date.now()}`,
            versionId: id,
            key: p.key,
            name: p.key,
            category: 'CUSTOM',
            value: p.value,
            unit: 'scalar',
            valueType: typeof p.value === 'number' ? 'number' : 'string',
            location: loc,
            specificationTier: tier,
            source: 'Admin Modified',
            status: 'DRAFT',
            createdBy: updates.adminEmail,
          };
          mem.parameters.set(compKey, newParam as any);
          modifiedParams.push({ key: p.key, oldVal: null, newVal: p.value });
        }

        // DB update if available
        if (isPrismaAvailable() && (prisma as any).calculationConfigParameter) {
          try {
            await (prisma as any).calculationConfigParameter.upsert({
              where: {
                config_param_unique: {
                  versionId: id,
                  key: p.key,
                  location: loc,
                  specificationTier: tier,
                },
              },
              update: { valueJson: p.value, updatedAt: now },
              create: {
                id: `param-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                versionId: id,
                key: p.key,
                name: p.key,
                category: 'CUSTOM',
                valueJson: p.value,
                unit: 'scalar',
                location: loc,
                specificationTier: tier,
                createdBy: updates.adminEmail,
              },
            });
          } catch (dbErr) {
            console.warn('[ConfigVersionService] DB upsert parameter note:', dbErr);
          }
        }
      }

      // Mark validation pending after modifications
      if (mem) mem.validationStatus = 'PENDING_VALIDATION';
    }

    await this.recordAudit({
      versionId: id,
      action: 'EDIT_PARAMETER',
      newValue: { modifiedCount: modifiedParams.length, modifiedParams },
      reason: updates.changeNote || 'Draft parameters updated',
      adminEmail: updates.adminEmail,
      ipAddress: updates.ipAddress,
      userAgent: updates.userAgent,
    });

    return {
      success: true,
      versionId: id,
      modifiedCount: modifiedParams.length,
      updatedAt: now,
    };
  }

  // ── 5. VALIDATE CONFIGURATION VERSION ──
  public async validateVersion(
    id: string,
    adminEmail = 'admin@costcalculator.app'
  ): Promise<ValidationReport> {
    const version = await this.getVersionById(id);
    if (!version) throw new Error(`Version '${id}' not found.`);

    const schemaErrors: ValidationErrorItem[] = [];
    const conflictWarnings: ConflictWarningItem[] = [];

    // Critical non-zero divisor parameter keys
    const criticalNonZeroKeys = new Set([
      'config.structure.wall_height_ft',
      'config.material.cement_bags_per_sqft',
      'config.paint.interior_coverage_sqft_per_litre',
      'config.paint.exterior_coverage_sqft_per_litre',
      'config.masonry.aac_block_unit_volume_cum',
      'config.masonry.concrete_block_unit_volume_cum',
      'config.plumbing.daily_water_demand_lpcd',
      'config.plumbing.occupants_per_bedroom',
    ]);

    const paramsList: any[] = version.parameters || [];

    for (const p of paramsList) {
      const val = typeof p.valueJson === 'object' && p.valueJson !== null ? p.valueJson : (p.value ?? p.valueJson);

      // 1. NaN and Infinity check
      if (typeof val === 'number') {
        if (isNaN(val)) {
          schemaErrors.push({
            key: p.key,
            parameterName: p.name,
            currentValue: val,
            error: 'Parameter value evaluates to NaN.',
            category: p.category,
            isCritical: true,
          });
          continue;
        }
        if (!isFinite(val)) {
          schemaErrors.push({
            key: p.key,
            parameterName: p.name,
            currentValue: val,
            error: 'Parameter value cannot be Infinity or -Infinity.',
            category: p.category,
            isCritical: true,
          });
          continue;
        }

        // 2. Negative value check
        if (val < 0) {
          schemaErrors.push({
            key: p.key,
            parameterName: p.name,
            currentValue: val,
            error: 'Parameter cannot be negative.',
            category: p.category,
            isCritical: true,
          });
        }

        // 3. Critical non-zero check
        if (criticalNonZeroKeys.has(p.key) && val === 0) {
          schemaErrors.push({
            key: p.key,
            parameterName: p.name,
            currentValue: val,
            error: 'Critical calculation factor or divisor cannot be zero.',
            category: p.category,
            isCritical: true,
          });
        }

        // 4. Min/Max bounds check
        if (p.minimum !== undefined && p.minimum !== null && val < p.minimum) {
          schemaErrors.push({
            key: p.key,
            parameterName: p.name,
            currentValue: val,
            error: `Value ${val} is below allowed minimum boundary ${p.minimum}.`,
            category: p.category,
            isCritical: false,
          });
        }
        if (p.maximum !== undefined && p.maximum !== null && val > p.maximum) {
          schemaErrors.push({
            key: p.key,
            parameterName: p.name,
            currentValue: val,
            error: `Value ${val} exceeds allowed maximum boundary ${p.maximum}.`,
            category: p.category,
            isCritical: false,
          });
        }
      }

      // 5. Check against Business Conflict Registry
      const conflict = KNOWN_CONFLICT_REGISTRY.find((c) => c.key === p.key);
      if (conflict) {
        conflictWarnings.push({
          key: conflict.key,
          parameterName: conflict.name,
          effectiveValue: val,
          alternateValue: conflict.alternateValue,
          unit: conflict.unit,
          reason: conflict.reason,
          status: 'CONFLICT_REQUIRES_REVIEW',
        });
      }
    }

    const schemaValid = schemaErrors.length === 0;
    const requiresBusinessReview = conflictWarnings.length > 0;
    const validationStatus = schemaValid ? 'VALID' : 'INVALID';
    const now = new Date();

    // Update memory & DB status
    const mem = this.inMemoryVersions.get(id);
    if (mem) {
      mem.validationStatus = validationStatus;
      mem.validatedBy = adminEmail;
      mem.validatedAt = now;
      if (schemaValid && mem.status === 'DRAFT') {
        mem.status = 'VALIDATED';
      }
    }

    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        await (prisma as any).calculationConfigVersion.update({
          where: { id },
          data: {
            validationStatus,
            validatedBy: adminEmail,
            validatedAt: now,
            status: schemaValid && version.status === 'DRAFT' ? 'VALIDATED' : version.status,
          },
        });
      } catch (dbErr) {
        console.warn('[ConfigVersionService] DB validate update note:', dbErr);
      }
    }

    await this.recordAudit({
      versionId: id,
      action: 'VALIDATE',
      newValue: { schemaValid, errorsCount: schemaErrors.length, conflictWarningsCount: conflictWarnings.length },
      reason: schemaValid ? 'Configuration validated successfully' : 'Validation failed with schema errors',
      adminEmail,
    });

    return {
      versionId: id,
      versionNumber: version.versionNumber,
      validationStatus,
      schemaValid,
      requiresBusinessReview,
      schemaErrors,
      conflictWarnings,
      validatedAt: now.toISOString(),
      validatedBy: adminEmail,
    };
  }

  // ── 6. SUBMIT FOR REVIEW ──
  public async submitReview(id: string, adminEmail: string): Promise<any> {
    const version = await this.getVersionById(id);
    if (!version) throw new Error(`Version '${id}' not found.`);

    if (version.validationStatus !== 'VALID') {
      throw new Error(
        `Cannot submit version for review. Version must pass schema validation first (Current: ${version.validationStatus}).`
      );
    }

    const mem = this.inMemoryVersions.get(id);
    if (mem) mem.status = 'REVIEW';

    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        await (prisma as any).calculationConfigVersion.update({
          where: { id },
          data: { status: 'REVIEW' },
        });
      } catch (dbErr) {
        console.warn('[ConfigVersionService] DB submitReview note:', dbErr);
      }
    }

    await this.recordAudit({
      versionId: id,
      action: 'SUBMIT_REVIEW',
      reason: 'Submitted draft for final administrative review',
      adminEmail,
    });

    return { success: true, versionId: id, status: 'REVIEW' };
  }

  // ── 7. SIMULATE VERSION (ACTIVE vs DRAFT) ──
  public async simulateVersion(
    draftVersionId: string,
    adminEmail = 'admin@costcalculator.app'
  ): Promise<SimulationResult> {
    const draftVer = await this.getVersionById(draftVersionId);
    if (!draftVer) throw new Error(`Draft version '${draftVersionId}' not found.`);

    // Find active version to compare against
    const activeVersions = await this.getVersions({ status: 'ACTIVE' });
    const activeVer = activeVersions[0] || (await this.getVersionById('cfg-ver-1.0.0'));

    // Standard reference benchmark project: 2,400 sq.ft duplex villa (Ground + 1)
    const BUA = 2400;
    const floors = 2;
    const plotArea = 1200;

    // Helper to get numeric parameter value from a version
    const getParamVal = (v: any, key: string, fallback: number): number => {
      const p = v?.parameters?.find?.((item: any) => item.key === key) || v?.parameters?.get?.(`${key}:Global:Global`);
      if (!p) return fallback;
      const raw = p.valueJson ?? p.value;
      const num = typeof raw === 'number' ? raw : parseFloat(raw);
      return isNaN(num) ? fallback : num;
    };

    // Active baseline factors
    const actWallH = getParamVal(activeVer, 'config.structure.wall_height_ft', 10.0);
    const actSteelBase = getParamVal(activeVer, 'config.rcc.steel_base_factor_kg_sqft', 2.8);
    const actSteelFloorInc = getParamVal(activeVer, 'config.rcc.steel_additional_floor_factor', 0.2);
    const actCementBags = getParamVal(activeVer, 'config.material.cement_bags_per_sqft', 0.4);
    const actMSand = getParamVal(activeVer, 'config.material.m_sand_cft_per_sqft', 0.6);
    const actPaintCov = getParamVal(activeVer, 'config.paint.interior_coverage_sqft_per_litre', 45);
    const actContractorMargin = getParamVal(activeVer, 'config.commercial.contractor_margin', 15);
    const actCivilLabour = 380; // Standard Bangalore civil labour rate

    // Draft factors
    const drfWallH = getParamVal(draftVer, 'config.structure.wall_height_ft', actWallH);
    const drfSteelBase = getParamVal(draftVer, 'config.rcc.steel_base_factor_kg_sqft', actSteelBase);
    const drfSteelFloorInc = getParamVal(draftVer, 'config.rcc.steel_additional_floor_factor', actSteelFloorInc);
    const drfCementBags = getParamVal(draftVer, 'config.material.cement_bags_per_sqft', actCementBags);
    const drfMSand = getParamVal(draftVer, 'config.material.m_sand_cft_per_sqft', actMSand);
    const drfPaintCov = getParamVal(draftVer, 'config.paint.interior_coverage_sqft_per_litre', actPaintCov);
    const drfContractorMargin = getParamVal(draftVer, 'config.commercial.contractor_margin', actContractorMargin);
    const drfCivilLabour = 380;

    // Benchmark Calculations
    // 1. Steel
    const actSteelTotalKg = BUA * (actSteelBase + (floors - 1) * actSteelFloorInc);
    const drfSteelTotalKg = BUA * (drfSteelBase + (floors - 1) * drfSteelFloorInc);
    const actSteelTonnes = actSteelTotalKg / 1000;
    const drfSteelTonnes = drfSteelTotalKg / 1000;
    const steelRatePerTonne = 74000;

    // 2. Cement
    const actCementTotalBags = Math.round(BUA * actCementBags);
    const drfCementTotalBags = Math.round(BUA * drfCementBags);
    const cementRatePerBag = 400;

    // 3. M-Sand
    const actSandCFT = BUA * actMSand;
    const drfSandCFT = BUA * drfMSand;
    const sandRatePerCFT = 55;

    // 4. Paint Litres (approx 3.2 x BUA wall area)
    const wallArea = BUA * 3.2 * (actWallH / 10.0);
    const drfWallArea = BUA * 3.2 * (drfWallH / 10.0);
    const actPaintLitres = Math.round(wallArea / actPaintCov);
    const drfPaintLitres = Math.round(drfWallArea / drfPaintCov);
    const paintRatePerLitre = 350;

    // Costs
    const actMaterialsCost =
      actSteelTonnes * steelRatePerTonne +
      actCementTotalBags * cementRatePerBag +
      actSandCFT * sandRatePerCFT +
      actPaintLitres * paintRatePerLitre +
      1400000; // Baseline other materials

    const drfMaterialsCost =
      drfSteelTonnes * steelRatePerTonne +
      drfCementTotalBags * cementRatePerBag +
      drfSandCFT * sandRatePerCFT +
      drfPaintLitres * paintRatePerLitre +
      1400000;

    const actLabourCost = BUA * actCivilLabour + 420000; // MEP + finishes labour
    const drfLabourCost = BUA * drfCivilLabour + 420000;

    const actBaseDirectCost = actMaterialsCost + actLabourCost;
    const drfBaseDirectCost = drfMaterialsCost + drfLabourCost;

    const actCommercialCost = (actBaseDirectCost * (actContractorMargin + 5 + 6)) / 100;
    const drfCommercialCost = (drfBaseDirectCost * (drfContractorMargin + 5 + 6)) / 100;

    const actTotalCost = Math.round(actBaseDirectCost + actCommercialCost);
    const drfTotalCost = Math.round(drfBaseDirectCost + drfCommercialCost);

    const costDiff = drfTotalCost - actTotalCost;
    const pctChange = actTotalCost > 0 ? (costDiff / actTotalCost) * 100 : 0;

    // Identify changed parameters
    const changedParams: any[] = [];
    const draftParamsList = draftVer.parameters || [];
    for (const dp of draftParamsList) {
      const activeP =
        activeVer?.parameters?.find?.((ap: any) => ap.key === dp.key) ||
        activeVer?.parameters?.get?.(`${dp.key}:${dp.location || 'Global'}:${dp.specificationTier || 'Global'}`);

      const dVal = dp.valueJson ?? dp.value;
      const aVal = activeP ? (activeP.valueJson ?? activeP.value) : null;

      if (aVal !== null && dVal !== aVal) {
        changedParams.push({
          key: dp.key,
          name: dp.name,
          activeValue: aVal,
          draftValue: dVal,
          unit: dp.unit,
        });
      }
    }

    const affectedBOQLines: string[] = [];
    const affectedReportSections: string[] = [];

    if (actSteelTonnes !== drfSteelTonnes) {
      affectedBOQLines.push('Reinforcement TMT Steel Fe 550D');
      affectedReportSections.push('Structural RCC Schedule', 'Material Consumption Summary');
    }
    if (actCementTotalBags !== drfCementTotalBags) {
      affectedBOQLines.push('Birla Super 53-Grade / PPC Cement');
      affectedReportSections.push('Civil Works Schedule', 'Procurement Schedule');
    }
    if (actPaintLitres !== drfPaintLitres) {
      affectedBOQLines.push('Interior Acrylic Emulsion Paint');
      affectedReportSections.push('Finishing & Cladding Schedule');
    }
    if (costDiff !== 0) {
      affectedReportSections.push('Commercial Budget Head', 'Cashflow Milestones');
    }

    const result: SimulationResult = {
      versionId: draftVer.id,
      versionNumber: draftVer.versionNumber,
      baseVersionNumber: activeVer?.versionNumber || 'v1.0.0',
      timestamp: new Date().toISOString(),
      projectSummary: {
        builtUpAreaSqFt: BUA,
        floors,
        plotAreaSqFt: plotArea,
      },
      financialDelta: {
        activeTotalCost: actTotalCost,
        draftTotalCost: drfTotalCost,
        costDifference: costDiff,
        percentageChange: parseFloat(pctChange.toFixed(2)),
        materialsCostDelta: Math.round(drfMaterialsCost - actMaterialsCost),
        labourCostDelta: Math.round(drfLabourCost - actLabourCost),
        commercialsCostDelta: Math.round(drfCommercialCost - actCommercialCost),
      },
      quantityDeltas: [
        {
          item: 'Structural Steel Rebar',
          unit: 'Tonnes',
          activeQuantity: parseFloat(actSteelTonnes.toFixed(2)),
          draftQuantity: parseFloat(drfSteelTonnes.toFixed(2)),
          difference: parseFloat((drfSteelTonnes - actSteelTonnes).toFixed(2)),
          percentageChange: parseFloat((((drfSteelTonnes - actSteelTonnes) / actSteelTonnes) * 100).toFixed(2)),
        },
        {
          item: 'Cement Bags (50kg)',
          unit: 'Bags',
          activeQuantity: actCementTotalBags,
          draftQuantity: drfCementTotalBags,
          difference: drfCementTotalBags - actCementTotalBags,
          percentageChange: parseFloat((((drfCementTotalBags - actCementTotalBags) / actCementTotalBags) * 100).toFixed(2)),
        },
        {
          item: 'Manufactured M-Sand',
          unit: 'CFT',
          activeQuantity: actSandCFT,
          draftQuantity: drfSandCFT,
          difference: drfSandCFT - actSandCFT,
          percentageChange: parseFloat((((drfSandCFT - actSandCFT) / actSandCFT) * 100).toFixed(2)),
        },
        {
          item: 'Interior Emulsion Paint',
          unit: 'Litres',
          activeQuantity: actPaintLitres,
          draftQuantity: drfPaintLitres,
          difference: drfPaintLitres - actPaintLitres,
          percentageChange: parseFloat((((drfPaintLitres - actPaintLitres) / actPaintLitres) * 100).toFixed(2)),
        },
      ],
      affectedBOQLines,
      affectedReportSections: Array.from(new Set(affectedReportSections)),
      changedParameters: changedParams,
    };

    await this.recordAudit({
      versionId: draftVersionId,
      action: 'SIMULATE',
      newValue: {
        costDifference: costDiff,
        percentageChange: pctChange,
        affectedBOQLinesCount: affectedBOQLines.length,
      },
      reason: 'Server-side simulation calculation executed',
      adminEmail,
    });

    return result;
  }

  // ── 8. PUBLISH CONFIGURATION VERSION (TRANSACTIONAL & ATOMIC) ──
  public async publishVersion(params: {
    id: string;
    adminEmail: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    acceptConflicts?: boolean;
    conflictAcceptanceReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const { id, adminEmail, effectiveFrom, effectiveTo, acceptConflicts, conflictAcceptanceReason, ipAddress, userAgent } = params;

    const version = await this.getVersionById(id);
    if (!version) throw new Error(`Version '${id}' not found.`);

    if (version.status === 'ACTIVE') {
      throw new Error(`Version '${version.versionNumber}' is already ACTIVE.`);
    }

    // 1. Run schema and business validation
    const validation = await this.validateVersion(id, adminEmail);
    if (!validation.schemaValid) {
      throw new Error(`Cannot publish version with schema validation errors: ${JSON.stringify(validation.schemaErrors)}`);
    }

    // 2. Conflict check
    if (validation.requiresBusinessReview) {
      if (!acceptConflicts) {
        throw new Error(
          `Version contains ${validation.conflictWarnings.length} unresolved business parameter conflicts. ` +
            `Publication requires explicit acceptance with acceptConflicts: true and a valid business reason.`
        );
      }
      if (!conflictAcceptanceReason || conflictAcceptanceReason.trim().length < 5) {
        throw new Error(`Conflict acceptance reason is required when publishing a version with unresolved conflicts.`);
      }
    }

    const now = new Date();
    const effDate = effectiveFrom ? new Date(effectiveFrom) : now;
    const isFuture = effDate.getTime() > now.getTime();
    const targetStatus: VersionStatus = isFuture ? 'PUBLISHED' : 'ACTIVE';

    // 3. Execute atomic publication
    if (isPrismaAvailable() && (prisma as any).$transaction) {
      try {
        await (prisma as any).$transaction(async (tx: any) => {
          // Archive previous ACTIVE versions
          await tx.calculationConfigVersion.updateMany({
            where: { status: 'ACTIVE' },
            data: {
              status: 'ARCHIVED',
              effectiveTo: effDate,
              updatedAt: now,
            },
          });

          // Activate new version
          await tx.calculationConfigVersion.update({
            where: { id },
            data: {
              status: targetStatus,
              publishedBy: adminEmail,
              publishedAt: now,
              effectiveFrom: effDate,
              effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
              updatedAt: now,
            },
          });

          // Update parameters status in version
          await tx.calculationConfigParameter.updateMany({
            where: { versionId: id },
            data: { status: 'ACTIVE', updatedAt: now },
          });

          // Record publish audit
          await tx.calculationConfigAuditLog.create({
            data: {
              id: `aud-${Date.now()}-pub`,
              versionId: id,
              action: 'PUBLISH',
              newValue: { status: targetStatus, effectiveFrom: effDate, acceptConflicts, conflictAcceptanceReason },
              reason: `Published version ${version.versionNumber} by ${adminEmail}`,
              adminEmail,
              ipAddress: ipAddress || null,
              userAgent: userAgent || null,
              timestamp: now,
            },
          });
        });
      } catch (txErr: any) {
        console.error('[ConfigVersionService] Prisma transaction publish failed:', txErr);
        throw new Error(`Transaction failed during configuration publish: ${txErr.message}`);
      }
    }

    // Update in-memory state
    for (const [vId, v] of this.inMemoryVersions.entries()) {
      if (v.status === 'ACTIVE') {
        v.status = 'ARCHIVED';
        v.effectiveTo = effDate;
        v.updatedAt = now;
      }
    }

    const mem = this.inMemoryVersions.get(id);
    if (mem) {
      mem.status = targetStatus;
      mem.publishedBy = adminEmail;
      mem.publishedAt = now;
      mem.effectiveFrom = effDate;
      if (effectiveTo) mem.effectiveTo = new Date(effectiveTo);
      mem.updatedAt = now;
      for (const p of mem.parameters.values()) {
        p.status = 'ACTIVE';
      }
    }

    await this.recordAudit({
      versionId: id,
      action: 'PUBLISH',
      newValue: { status: targetStatus, effectiveFrom: effDate },
      reason: `Configuration version ${version.versionNumber} published and set to ${targetStatus}`,
      adminEmail,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      versionId: id,
      versionNumber: version.versionNumber,
      status: targetStatus,
      effectiveFrom: effDate,
      publishedAt: now,
      publishedBy: adminEmail,
    };
  }

  // ── 9. ARCHIVE VERSION ──
  public async archiveVersion(id: string, adminEmail: string, reason?: string): Promise<any> {
    const version = await this.getVersionById(id);
    if (!version) throw new Error(`Version '${id}' not found.`);

    const now = new Date();
    const mem = this.inMemoryVersions.get(id);
    if (mem) {
      mem.status = 'ARCHIVED';
      mem.updatedAt = now;
    }

    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        await (prisma as any).calculationConfigVersion.update({
          where: { id },
          data: { status: 'ARCHIVED', updatedAt: now },
        });
      } catch (dbErr) {
        console.warn('[ConfigVersionService] DB archive note:', dbErr);
      }
    }

    await this.recordAudit({
      versionId: id,
      action: 'ARCHIVE',
      reason: reason || 'Version archived by administrator',
      adminEmail,
    });

    return { success: true, versionId: id, status: 'ARCHIVED' };
  }

  // ── 10. GET AUDIT LOGS FOR VERSION ──
  public async getVersionAuditLogs(versionId: string): Promise<any[]> {
    if (isPrismaAvailable() && (prisma as any).calculationConfigAuditLog) {
      try {
        const dbLogs = await (prisma as any).calculationConfigAuditLog.findMany({
          where: { versionId },
          orderBy: { timestamp: 'desc' },
        });
        if (dbLogs && dbLogs.length > 0) return dbLogs;
      } catch (err) {
        console.warn('[ConfigVersionService] DB find audit logs note:', err);
      }
    }

    return this.inMemoryAudits.filter((a) => a.versionId === versionId);
  }

  // ── 11. VERSION COMPARISON (A vs B) ──
  public async compareVersions(versionAId: string, versionBId: string): Promise<any> {
    const verA = await this.getVersionById(versionAId);
    const verB = await this.getVersionById(versionBId);

    if (!verA) throw new Error(`Version A '${versionAId}' not found.`);
    if (!verB) throw new Error(`Version B '${versionBId}' not found.`);

    const paramsA: any[] = verA.parameters || [];
    const paramsB: any[] = verB.parameters || [];

    const mapA = new Map<string, any>();
    paramsA.forEach((p) => {
      const k = `${p.key}:${p.location || 'Global'}:${p.specificationTier || 'Global'}`;
      mapA.set(k, p);
    });

    const mapB = new Map<string, any>();
    paramsB.forEach((p) => {
      const k = `${p.key}:${p.location || 'Global'}:${p.specificationTier || 'Global'}`;
      mapB.set(k, p);
    });

    const added: ParameterDiffItem[] = [];
    const removed: ParameterDiffItem[] = [];
    const changed: ParameterDiffItem[] = [];
    const unchanged: ParameterDiffItem[] = [];

    // Check items in B
    for (const [k, pB] of mapB.entries()) {
      const valB = pB.valueJson ?? pB.value;
      const pA = mapA.get(k);

      if (!pA) {
        added.push({
          key: pB.key,
          name: pB.name,
          unit: pB.unit,
          category: pB.category,
          location: pB.location || 'Global',
          tier: pB.specificationTier || 'Global',
          oldValue: null,
          newValue: valB,
          changeType: 'ADDED',
        });
      } else {
        const valA = pA.valueJson ?? pA.value;
        if (JSON.stringify(valA) !== JSON.stringify(valB)) {
          changed.push({
            key: pB.key,
            name: pB.name,
            unit: pB.unit,
            category: pB.category,
            location: pB.location || 'Global',
            tier: pB.specificationTier || 'Global',
            oldValue: valA,
            newValue: valB,
            changeType: 'MODIFIED',
          });
        } else {
          unchanged.push({
            key: pB.key,
            name: pB.name,
            unit: pB.unit,
            category: pB.category,
            location: pB.location || 'Global',
            tier: pB.specificationTier || 'Global',
            oldValue: valA,
            newValue: valB,
            changeType: 'UNCHANGED',
          });
        }
      }
    }

    // Check removed items (in A not in B)
    for (const [k, pA] of mapA.entries()) {
      if (!mapB.has(k)) {
        const valA = pA.valueJson ?? pA.value;
        removed.push({
          key: pA.key,
          name: pA.name,
          unit: pA.unit,
          category: pA.category,
          location: pA.location || 'Global',
          tier: pA.specificationTier || 'Global',
          oldValue: valA,
          newValue: null,
          changeType: 'REMOVED',
        });
      }
    }

    return {
      versionA: { id: verA.id, versionNumber: verA.versionNumber, status: verA.status },
      versionB: { id: verB.id, versionNumber: verB.versionNumber, status: verB.status },
      summary: {
        addedCount: added.length,
        removedCount: removed.length,
        changedCount: changed.length,
        unchangedCount: unchanged.length,
      },
      added,
      removed,
      changed,
      unchanged,
    };
  }

  // ── 12. ROLLBACK (CREATES NEW DRAFT CLONING HISTORICAL VERSION) ──
  public async rollbackToVersion(params: {
    targetVersionId: string;
    newVersionNumber?: string;
    adminEmail: string;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const { targetVersionId, newVersionNumber, adminEmail, reason, ipAddress, userAgent } = params;

    const targetVer = await this.getVersionById(targetVersionId);
    if (!targetVer) throw new Error(`Target rollback version '${targetVersionId}' not found.`);

    const existingVersions = await this.getVersions();
    const computedNumber = newVersionNumber || `v1.${existingVersions.length}.0-rollback`;

    const draft = await this.createDraftVersion({
      baseVersionId: targetVersionId,
      versionNumber: computedNumber,
      description: `Rollback clone created from historical version ${targetVer.versionNumber}`,
      changeNote: reason || `Rollback to parameters of version ${targetVer.versionNumber}`,
      adminEmail,
      ipAddress,
      userAgent,
    });

    // Atomically validate, publish, and activate the rollback version
    const publishResult = await this.publishVersion({
      id: draft.id,
      adminEmail,
      acceptConflicts: true,
      conflictAcceptanceReason: `Rollback restoration to parameters of historical version ${targetVer.versionNumber}`,
      ipAddress,
      userAgent,
    });

    await this.recordAudit({
      versionId: draft.id,
      action: 'ROLLBACK_PREPARE',
      reason: `Rollback executed and activated from historical version ${targetVer.versionNumber}: ${reason || 'Admin initiated'}`,
      adminEmail,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: `Rollback successful. Version '${computedNumber}' activated with parameters restored from '${targetVer.versionNumber}'.`,
      activeVersion: publishResult,
      newDraftVersion: draft,
    };
  }

  // ── 13. RESOLVE PRODUCTION ACTIVE CONFIGURATION ──
  public async getActiveConfiguration(query?: {
    location?: string;
    specificationTier?: string;
    date?: string;
  }): Promise<any> {
    const loc = query?.location || 'Global';
    const tier = query?.specificationTier || 'Global';
    const targetDate = query?.date ? new Date(query.date) : new Date();

    let activeVersion: any = null;
    let source: 'POSTGRESQL' | 'STATIC_EMBEDDED_BASELINE' = 'STATIC_EMBEDDED_BASELINE';

    // 1. Query PostgreSQL
    if (isPrismaAvailable() && (prisma as any).calculationConfigVersion) {
      try {
        const found = await (prisma as any).calculationConfigVersion.findFirst({
          where: {
            status: 'ACTIVE',
            effectiveFrom: { lte: targetDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gt: targetDate } }],
          },
          include: { parameters: { where: { status: 'ACTIVE' } } },
          orderBy: { effectiveFrom: 'desc' },
        });

        if (found) {
          activeVersion = found;
          source = 'POSTGRESQL';
        }
      } catch (dbErr) {
        console.warn('[ConfigVersionService] Active config DB resolution notice (fail-closed fallback activated):', dbErr);
      }
    }

    // 2. Fallback to active in-memory version
    if (!activeVersion) {
      const memVersions = Array.from(this.inMemoryVersions.values()).filter(
        (v) =>
          v.status === 'ACTIVE' &&
          v.effectiveFrom <= targetDate &&
          (!v.effectiveTo || v.effectiveTo > targetDate)
      );

      if (memVersions.length > 0) {
        memVersions.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
        const selected = memVersions[0];
        activeVersion = {
          ...selected,
          parameters: Array.from(selected.parameters.values()),
        };
      }
    }

    // 3. Critical Fail-Closed Rule
    if (!activeVersion) {
      throw new Error(
        `[CRITICAL FAIL-CLOSED] No ACTIVE calculation configuration found for date ${targetDate.toISOString()}. System refuses to execute calculations without an approved active configuration.`
      );
    }

    // 4. Resolve parameter values according to deterministic precedence:
    // Exact [loc, tier] -> [Global, tier] -> [loc, Global] -> [Global, Global]
    const resolvedParams: Record<string, any> = {};
    const paramsList: any[] = activeVersion.parameters || [];

    // Group candidates by key
    const grouped = new Map<string, any[]>();
    paramsList.forEach((p) => {
      if (!grouped.has(p.key)) grouped.set(p.key, []);
      grouped.get(p.key)!.push(p);
    });

    for (const [key, candidates] of grouped.entries()) {
      let chosen = candidates.find((c) => (c.location === loc || c.location === 'ALL') && (c.specificationTier === tier || c.specificationTier === 'ALL'));
      if (!chosen) {
        chosen = candidates.find((c) => (c.location === 'Global' || c.location === 'ALL') && (c.specificationTier === tier || c.specificationTier === 'ALL'));
      }
      if (!chosen) {
        chosen = candidates.find((c) => (c.location === loc || c.location === 'ALL') && (c.specificationTier === 'Global' || c.specificationTier === 'ALL'));
      }
      if (!chosen) {
        chosen = candidates.find((c) => (c.location === 'Global' || c.location === 'ALL') && (c.specificationTier === 'Global' || c.specificationTier === 'ALL'));
      }
      if (!chosen) {
        chosen = candidates[0];
      }

      if (chosen) {
        resolvedParams[key] = chosen.valueJson ?? chosen.value;
      }
    }

    return {
      versionNumber: activeVersion.versionNumber,
      versionId: activeVersion.id,
      status: activeVersion.status,
      effectiveFrom: activeVersion.effectiveFrom,
      effectiveTo: activeVersion.effectiveTo,
      resolvedAt: new Date().toISOString(),
      location: loc,
      specificationTier: tier,
      source,
      parametersCount: Object.keys(resolvedParams).length,
      parameters: resolvedParams,
    };
  }
}

export const configVersionService = new ConfigVersionService();
