// ============================================================
// CENTRAL CONFIGURATION RESOLVER
// Single source of truth for resolving calculation parameters,
// room templates, and snapshots across all engine modules.
//
// Resolution Order:
// (Location, Tier) -> (Location, 'ALL') -> ('ALL', Tier) -> ('ALL', 'ALL') -> Baseline Default
//
// Status Enforcement:
// Production calculations strictly resolve 'ACTIVE' parameters.
// 'DRAFT', 'ARCHIVED', 'REJECTED' are excluded unless explicitly simulating.
// ============================================================

import {
  CalculationParameter,
  ConfigurationVersion,
  ConfigurationResolutionContext,
  ResolvedCalculationConfiguration,
  SpaceTemplateConfig,
  CommercialRuleConfig,
  LabourBenchmarkConfig,
} from './types';
import {
  HUTTY_BASELINE_VERSION,
  HUTTY_BASELINE_PARAMETERS,
  HUTTY_BASELINE_SPACE_TEMPLATES,
  HUTTY_BASELINE_COMMERCIAL,
  HUTTY_BASELINE_LABOUR_BENCHMARKS,
} from './baselineConfiguration';
import { getAuthorityRules } from '../data/authorityRules';
import { getActiveConflicts } from './conflictRegistry';

export class ConfigurationResolver {
  private activeVersion: ConfigurationVersion = HUTTY_BASELINE_VERSION;
  private parameterStore: Map<string, CalculationParameter[]> = new Map();
  private spaceTemplatesStore: Map<string, SpaceTemplateConfig> = new Map();
  private commercialStore: CommercialRuleConfig = { ...HUTTY_BASELINE_COMMERCIAL };
  private labourStore: Map<string, LabourBenchmarkConfig> = new Map();
  private resolutionSource: 'POSTGRESQL' | 'STATIC_APPROVED_BASELINE' | 'LOCAL_CACHE' = 'STATIC_APPROVED_BASELINE';
  private dbStatus: 'NONE' | 'DB_UNAVAILABLE' | 'NO_ACTIVE_VERSION' | 'INVALID_ACTIVE_CONFIG' = 'NONE';

  constructor() {
    this.resetToBaseline();
  }

  /**
   * Get the current resolution source
   */
  public getResolutionSource(): 'POSTGRESQL' | 'STATIC_APPROVED_BASELINE' | 'LOCAL_CACHE' {
    return this.resolutionSource;
  }

  /**
   * Get current DB failure diagnosis if any
   */
  public getDbStatus(): 'NONE' | 'DB_UNAVAILABLE' | 'NO_ACTIVE_VERSION' | 'INVALID_ACTIVE_CONFIG' {
    return this.dbStatus;
  }

  /**
   * Set database error diagnosis to guarantee fail-closed transparency
   */
  public setDatabaseError(status: 'DB_UNAVAILABLE' | 'NO_ACTIVE_VERSION' | 'INVALID_ACTIVE_CONFIG'): void {
    this.dbStatus = status;
    this.resolutionSource = 'STATIC_APPROVED_BASELINE';
  }

  /**
   * Synchronize active configuration from backend API
   */
  public syncActiveConfiguration(payload: {
    versionNumber: string;
    versionId?: string;
    parameters: Record<string, any>;
    source?: 'POSTGRESQL' | 'STATIC_APPROVED_BASELINE';
    effectiveFrom?: string;
  }): void {
    if (!payload || !payload.parameters) return;

    this.activeVersion = {
      ...this.activeVersion,
      versionNumber: payload.versionNumber,
      id: payload.versionId || this.activeVersion.id,
      effectiveFrom: payload.effectiveFrom || this.activeVersion.effectiveFrom,
      status: 'ACTIVE',
    };

    this.resolutionSource = payload.source === 'POSTGRESQL' ? 'POSTGRESQL' : 'STATIC_APPROVED_BASELINE';
    this.dbStatus = 'NONE';

    for (const [key, value] of Object.entries(payload.parameters)) {
      const existingList = this.parameterStore.get(key) || [];
      const globalActive = existingList.find(
        (p) => p.location.toUpperCase() === 'ALL' && p.specificationTier.toUpperCase() === 'ALL' && p.status === 'ACTIVE'
      );
      if (globalActive) {
        globalActive.value = value;
      } else {
        existingList.push({
          id: `remote-${key}`,
          key,
          name: key,
          description: '',
          category: 'RCC_STRUCTURE',
          value,
          unit: 'scalar',
          valueType: typeof value === 'number' ? 'number' : 'string',
          location: 'ALL',
          specificationTier: 'ALL',
          source: 'PostgreSQL Active Configuration',
          status: 'ACTIVE',
          version: payload.versionNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        this.parameterStore.set(key, existingList);
      }
    }
  }

  /**
   * Reset in-memory resolver back to approved baseline v1.0.0
   */
  public resetToBaseline(): void {
    this.activeVersion = { ...HUTTY_BASELINE_VERSION };
    this.parameterStore.clear();

    // Group baseline parameters by key
    for (const p of HUTTY_BASELINE_PARAMETERS) {
      const existing = this.parameterStore.get(p.key) || [];
      existing.push({ ...p });
      this.parameterStore.set(p.key, existing);
    }

    this.spaceTemplatesStore.clear();
    for (const [key, tmpl] of Object.entries(HUTTY_BASELINE_SPACE_TEMPLATES)) {
      this.spaceTemplatesStore.set(key, { ...tmpl });
    }

    this.commercialStore = { ...HUTTY_BASELINE_COMMERCIAL };

    this.labourStore.clear();
    for (const [key, bench] of Object.entries(HUTTY_BASELINE_LABOUR_BENCHMARKS)) {
      this.labourStore.set(key, { ...bench });
    }
  }

  /**
   * Set the active version metadata
   */
  public setActiveVersion(version: ConfigurationVersion): void {
    this.activeVersion = { ...version };
  }

  /**
   * Get current active version metadata
   */
  public getActiveVersion(): ConfigurationVersion {
    return { ...this.activeVersion };
  }

  /**
   * Register or override a parameter in the store
   */
  public registerParameter(param: CalculationParameter): void {
    const list = this.parameterStore.get(param.key) || [];
    // Replace if exact key + location + tier + status exists
    const idx = list.findIndex(
      (p) =>
        p.location === param.location &&
        p.specificationTier === param.specificationTier &&
        p.status === param.status
    );
    if (idx >= 0) {
      list[idx] = { ...param };
    } else {
      list.push({ ...param });
    }
    this.parameterStore.set(param.key, list);
  }

  /**
   * Resolve a numerical or typed parameter with deterministic precedence
   */
  public resolveParameter<T = number>(
    key: string,
    context?: ConfigurationResolutionContext,
    fallbackValue?: T
  ): T {
    const list = this.parameterStore.get(key);
    if (!list || list.length === 0) {
      return (fallbackValue !== undefined ? fallbackValue : 0) as T;
    }

    const loc = (context?.location || context?.city || 'ALL').toLowerCase();
    const tier = (context?.specificationTier || context?.packageTier || 'ALL').toUpperCase();
    const allowDraft = Boolean(context?.allowDraftForSimulation);

    // Filter by allowed status
    let candidates = list.filter((p) => {
      if (allowDraft) return p.status === 'DRAFT' || p.status === 'VALIDATED' || p.status === 'ACTIVE';
      return p.status === 'ACTIVE';
    });

    if (candidates.length === 0) {
      return (fallbackValue !== undefined ? fallbackValue : 0) as T;
    }

    // If simulating with draft, prioritize draft over active
    if (allowDraft) {
      const drafts = candidates.filter((p) => p.status === 'DRAFT' || p.status === 'VALIDATED');
      if (drafts.length > 0) {
        candidates = drafts;
      }
    }

    // 1. Exact Match: (Location, Tier)
    const exact = candidates.find(
      (p) => p.location.toLowerCase() === loc && p.specificationTier.toUpperCase() === tier
    );
    if (exact) return exact.value as T;

    // 2. Location Specific: (Location, 'ALL')
    const locOnly = candidates.find(
      (p) => p.location.toLowerCase() === loc && p.specificationTier.toUpperCase() === 'ALL'
    );
    if (locOnly) return locOnly.value as T;

    // 3. Tier Specific: ('ALL', Tier)
    const tierOnly = candidates.find(
      (p) => p.location.toUpperCase() === 'ALL' && p.specificationTier.toUpperCase() === tier
    );
    if (tierOnly) return tierOnly.value as T;

    // 4. Global Active: ('ALL', 'ALL')
    const global = candidates.find(
      (p) => p.location.toUpperCase() === 'ALL' && p.specificationTier.toUpperCase() === 'ALL'
    );
    if (global) return global.value as T;

    // 5. First candidate or fallback
    return (candidates[0].value ?? fallbackValue) as T;
  }

  /**
   * Resolve a Room Template by space type
   */
  public getSpaceTemplate(spaceType: string): SpaceTemplateConfig {
    const normalized = spaceType.toLowerCase().replace(/s$/, ''); // e.g. 'bedrooms' -> 'bedroom'
    return (
      this.spaceTemplatesStore.get(spaceType) ||
      this.spaceTemplatesStore.get(normalized) ||
      HUTTY_BASELINE_SPACE_TEMPLATES.bedroom
    );
  }

  /**
   * Set or update a Space Template
   */
  public updateSpaceTemplate(spaceType: string, template: SpaceTemplateConfig): void {
    this.spaceTemplatesStore.set(spaceType, { ...template });
  }

  /**
   * Resolve Commercial Settings
   */
  public getCommercialSettings(): CommercialRuleConfig {
    return { ...this.commercialStore };
  }

  /**
   * Update Commercial Settings
   */
  public updateCommercialSettings(settings: Partial<CommercialRuleConfig>): void {
    this.commercialStore = { ...this.commercialStore, ...settings };
  }

  /**
   * Resolve Labour Benchmark
   */
  public getLabourBenchmark(tradeKey: string): LabourBenchmarkConfig | undefined {
    return this.labourStore.get(tradeKey);
  }

  /**
   * Returns a complete immutable snapshot of all resolved configurations
   * for a calculation project, ensuring historical auditability.
   */
  public getResolvedConfigurationSnapshot(
    context?: ConfigurationResolutionContext
  ): ResolvedCalculationConfiguration {
    const city = context?.city || context?.location || 'Bangalore';
    const tier = context?.packageTier || context?.specificationTier || 'Premium';

    // Resolve all known parameters
    const resolvedParams: Record<string, number | string | boolean> = {};
    for (const [key] of this.parameterStore.entries()) {
      resolvedParams[key] = this.resolveParameter(key, context);
    }

    const resolvedTemplates: Record<string, SpaceTemplateConfig> = {};
    for (const [key, tmpl] of this.spaceTemplatesStore.entries()) {
      resolvedTemplates[key] = { ...tmpl };
    }

    const authRules = getAuthorityRules(city);
    const conflicts = getActiveConflicts().map((c) => c.parameterKey);

    return {
      version: this.activeVersion.versionNumber,
      resolvedAt: new Date().toISOString(),
      location: city,
      specificationTier: tier,
      parameters: resolvedParams,
      spaceTemplates: resolvedTemplates,
      authorityRules: {
        id: authRules.ruleId,
        city: authRules.displayName,
        displayName: authRules.displayName,
        governingAuthority: authRules.authority,
        governingFramework: authRules.governingFramework,
        isStatutoryVerified: true,
        sourceReference: authRules.officialSourceDocument,
        effectiveDate: authRules.effectiveDate,
        disclaimer: authRules.disclaimer,
        setbackSlabs: authRules.setbackSlabs,
        farSlabs: authRules.farSlabs,
        parkingNorms: {
          stiltSqFtPerCar: 180,
          surfaceSqFtPerCar: 120,
          sqFtPerBike: 35,
        },
      },
      commercialSettings: { ...this.commercialStore },
      labourBenchmarks: Object.fromEntries(this.labourStore.entries()),
      conflictsActive: conflicts,
    };
  }
}

// Global Singleton Instance
export const configResolver = new ConfigurationResolver();
