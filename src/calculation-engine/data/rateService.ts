// ============================================================
// RATE SERVICE & CENTRALIZED RATE RESOLVER
// Single authoritative rate resolution mechanism for Hutty.
//
// Resolution Priority Hierarchy:
// 1. Active Exact Override (rateId + package + location)
// 2. Active Package Override (rateId + package + ALL locations)
// 3. Active Location Override (rateId + ALL packages + location)
// 4. Active Global Override (rateId + ALL packages + ALL locations)
// 5. Package + Location baseline
// 6. Package-specific baseline
// 7. Location-specific baseline
// 8. Hutty Baseline Rate Dataset (HUTTY_BASELINE_RATES)
// 9. Immutable Safe Fallback (non-zero numeric)
// ============================================================

import {
  RateMasterItem as LegacyRateMasterItem,
  BRAND_DATABASE,
  getBrandRate,
  getRateMasterMetadata,
  getElectricalWireRate,
} from './brandDatabase';
import {
  RateMasterItem,
  RateOverride,
  RateAuditEntry,
  EffectiveRateContext,
  EffectiveRateResult,
  CalculatorConfigSettings,
  PackageTierDimension,
  LocationDimension,
} from './rateMasterTypes';
import {
  HUTTY_BASELINE_RATES,
  HUTTY_BASELINE_CONFIG,
} from './rateMasterDefaults';
import { getApiUrl } from '../../config/api';

export interface RateSourceMetadata {
  sourceId?: string;
  datasetVersion: string;
  version?: string;
  effectivePeriod: string;
  effectiveDate?: string;
  providerName: string;
  isLive: boolean;
  lastUpdated: string;
  calculationEngineVersion: string;
  disclaimer: string;
  location?: string;
  description?: string;
}

export interface IRateProvider {
  getRate(categoryId: string, brandName: string, location?: string): number;
  getRateItem(categoryId: string, brandName: string, fallbackRate?: number, fallbackUnit?: string): LegacyRateMasterItem;
  getAllRates(categoryId?: string): LegacyRateMasterItem[];
  getSourceMetadata(): RateSourceMetadata;
}

/**
 * Default internal QS-managed Rate Provider
 * Serves Hutty Baseline Rate Dataset.
 */
export class DefaultQSRateProvider implements IRateProvider {
  private metadata: RateSourceMetadata = {
    sourceId: 'hutty-baseline-rate-dataset',
    datasetVersion: 'HUTTY-RM-2026.1',
    version: 'HUTTY-RM-2026.1',
    effectivePeriod: 'Hutty Baseline Dataset',
    effectiveDate: '2026-01-01',
    providerName: 'Hutty Baseline Rate Dataset',
    isLive: false,
    lastUpdated: '2026-01-01T00:00:00.000Z',
    calculationEngineVersion: 'v2.6.0',
    disclaimer: 'Hutty Baseline Rate Dataset for quantity surveying calculations.',
    location: 'Bengaluru / Mysuru',
    description: 'Verified baseline quantity surveying rate catalogue for Karnataka urban residential construction.',
  };

  getRate(categoryId: string, brandName: string): number {
    return getBrandRate(categoryId, brandName);
  }

  getRateItem(categoryId: string, brandName: string, fallbackRate = 0, fallbackUnit = 'Nos'): LegacyRateMasterItem {
    return getRateMasterMetadata(categoryId, brandName, fallbackRate, fallbackUnit);
  }

  getAllRates(categoryId?: string): LegacyRateMasterItem[] {
    const categories = categoryId
      ? BRAND_DATABASE.filter((c) => c.id === categoryId)
      : BRAND_DATABASE;

    const items: LegacyRateMasterItem[] = [];
    categories.forEach((cat) => {
      cat.brands.forEach((brand) => {
        items.push(getRateMasterMetadata(cat.id, brand.name, brand.unitRate, brand.unit));
      });
    });
    return items;
  }

  getSourceMetadata(): RateSourceMetadata {
    return { ...this.metadata };
  }
}

export const CANONICAL_RATE_ALIASES: Record<string, string[]> = {
  'windows.upvc_slider': ['windows.standard_upvc', 'windows.upvc_standard'],
  'windows.standard_upvc': ['windows.upvc_slider', 'windows.upvc_standard'],
  'windows.upvc_standard': ['windows.upvc_slider', 'windows.standard_upvc'],
  'sand.m_sand': ['aggregate.msand_zone2', 'aggregate.m_sand'],
  'sand.p_sand': ['aggregate.psand_fine', 'aggregate.p_sand'],
  'aggregate.msand_zone2': ['sand.m_sand', 'aggregate.m_sand'],
  'aggregate.psand_fine': ['sand.p_sand', 'aggregate.p_sand'],
  'aggregate.coarse_granite': ['aggregate.20mm', 'aggregate.coarse_20mm'],
  'aggregate.20mm': ['aggregate.coarse_granite', 'aggregate.coarse_20mm'],
  'doors.flush_door': ['doors.internal_flush'],
  'doors.internal_flush': ['doors.flush_door'],
  'doors.teak_wood': ['doors.main_teak_african'],
  'doors.main_teak_african': ['doors.teak_wood'],
};

export function normalizePackageTier(pkg?: string): PackageTierDimension {
  if (!pkg) return 'ALL';
  const p = pkg.trim().toUpperCase();
  if (p === 'STANDARD' || p === 'ESSENTIAL') return 'STANDARD';
  if (p === 'PREMIUM') return 'PREMIUM';
  if (p === 'LUXURY') return 'LUXURY';
  return 'ALL';
}

export function normalizeLocation(loc?: string): LocationDimension {
  if (!loc) return 'ALL';
  const l = loc.trim().toLowerCase();
  if (l.includes('bangalore') || l.includes('bengaluru')) return 'Bangalore';
  if (l.includes('mysore') || l.includes('mysuru')) return 'Mysore';
  if (l === 'all') return 'ALL';
  return 'ALL';
}

/**
 * Centralized Rate Master & Resolver Engine
 * Authoritative source for every rate consumed by calculation modules.
 */
class RateService {
  private activeProvider: IRateProvider;
  private readonly defaultProvider: IRateProvider;

  // Active overrides stored by dimensional composite key: `${rateId}:::${packageTier}:::${location}`
  private overrides: Map<string, RateOverride> = new Map();
  private auditLogs: RateAuditEntry[] = [];
  private config: CalculatorConfigSettings = { ...HUTTY_BASELINE_CONFIG };
  private listeners: Array<() => void> = [];
  private isSyncing = false;

  constructor() {
    this.defaultProvider = new DefaultQSRateProvider();
    this.activeProvider = this.defaultProvider;

    // Hydrate cached overrides and config synchronously from localStorage if available in browser
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedOverrides = localStorage.getItem('hutty_active_overrides');
        if (cachedOverrides) {
          const parsed = JSON.parse(cachedOverrides);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.setOverrides(parsed);
          }
        }
        const cachedConfig = localStorage.getItem('hutty_calculator_config');
        if (cachedConfig) {
          const parsedCfg = JSON.parse(cachedConfig);
          if (parsedCfg && typeof parsedCfg === 'object') {
            this.setConfig(parsedCfg);
          }
        }
      } catch (e) {
        console.warn('[RateService] Failed to hydrate cached rates from localStorage:', e);
      }
    }
  }

  private getCompositeKey(rateId: string, packageTier: string = 'ALL', location: string = 'ALL'): string {
    const pkg = normalizePackageTier(packageTier);
    const loc = normalizeLocation(location);
    return `${rateId}:::${pkg}:::${loc}`;
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('[RateService] Listener error:', e);
      }
    });
  }

  /**
   * Synchronizes active rate overrides and calculator configuration with the backend server.
   * Caches successful responses in localStorage and notifies all listeners (e.g. useCalculationStore).
   */
  public async syncWithServer(customBaseUrl?: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      const overridesUrl = customBaseUrl
        ? `${customBaseUrl.replace(/\/+$/, '')}/api/v1/admin/rates/overrides`
        : getApiUrl('/api/v1/admin/rates/overrides');
      const configUrl = customBaseUrl
        ? `${customBaseUrl.replace(/\/+$/, '')}/api/v1/admin/config`
        : getApiUrl('/api/v1/admin/config');

      const [ratesRes, configRes] = await Promise.allSettled([
        fetch(overridesUrl),
        fetch(configUrl),
      ]);

      let hasUpdates = false;

      if (ratesRes.status === 'fulfilled' && ratesRes.value.ok) {
        const d = await ratesRes.value.json();
        const serverOverrides = d.overrides || d.data || [];
        if (Array.isArray(serverOverrides)) {
          this.setOverrides(serverOverrides);
          hasUpdates = true;
        }
      }

      if (configRes.status === 'fulfilled' && configRes.value.ok) {
        const d = await configRes.value.json();
        const serverConfig = d.config || d.data;
        if (serverConfig && typeof serverConfig === 'object') {
          this.setConfig(serverConfig);
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        this.notify();
      }
      return true;
    } catch (e) {
      console.warn('[RateService] syncWithServer network error, continuing with cached rates:', e);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // ────────────────────────────────────────────────────────────
  // 1. AUTHORITATIVE RATE RESOLUTION METHOD
  // ────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────
  // 1. AUTHORITATIVE RATE RESOLUTION METHOD
  // ────────────────────────────────────────────────────────────
  public getEffectiveRate(rateId: string, context?: EffectiveRateContext, fallback?: number): number {
    const result = this.resolveEffectiveRate(rateId, context);
    if (
      (result.sourceType === 'MISSING_RATE' || result.sourceType === 'FALLBACK') &&
      fallback !== undefined &&
      !isNaN(fallback) &&
      isFinite(fallback) &&
      fallback > 0
    ) {
      return fallback;
    }
    return result.effectiveRate;
  }

  public getEffectiveResult(rateId: string, context?: EffectiveRateContext): EffectiveRateResult {
    return this.resolveEffectiveRate(rateId, context);
  }

  private resolveEffectiveRate(rateId: string, context?: EffectiveRateContext): EffectiveRateResult {
    const rawPkg = context?.packageTier || context?.package || 'ALL';
    const rawLoc = context?.location || context?.city || 'ALL';
    const pkg = normalizePackageTier(rawPkg);
    const loc = normalizeLocation(rawLoc);
    const brandStr = (context?.brand || '').trim();

    // Default item for the generic/requested rateId
    let defaultItem = HUTTY_BASELINE_RATES.find((r) => r.id === rateId);
    if (!defaultItem) {
      const aliases = CANONICAL_RATE_ALIASES[rateId] || [];
      for (const alias of aliases) {
        defaultItem = HUTTY_BASELINE_RATES.find((r) => r.id === alias);
        if (defaultItem) break;
      }
    }

    // Contextual brand item resolution
    const findBrandItem = (): RateMasterItem | undefined => {
      if (!brandStr) return undefined;
      const cleanBrand = brandStr.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanBrand) return undefined;

      const domainPrefix = rateId.split('.')[0].toLowerCase();
      const domainAliases: Record<string, string[]> = {
        steel: ['steel'],
        cement: ['cement'],
        doors: ['doors', 'door'],
        windows: ['windows', 'window'],
        paint: ['paint', 'painting'],
        sanitary: ['sanitary', 'bathroom', 'plumbing'],
        plumbing: ['plumbing', 'sanitary'],
        masonry: ['masonry', 'brick', 'block', 'aac'],
        flooring: ['flooring', 'tile', 'marble'],
        aggregate: ['aggregate', 'sand'],
        electrical: ['electrical'],
        fixtures: ['fixtures', 'sanitary', 'equipment'],
        equipment: ['equipment', 'fixtures'],
      };
      const allowedDomains = domainAliases[domainPrefix] || [domainPrefix];

      const domainCandidates = HUTTY_BASELINE_RATES.filter((r) =>
        allowedDomains.some((d) => r.id.toLowerCase().startsWith(d) || r.category.toLowerCase().includes(d))
      );

      // 1. Direct clean match
      const exactMatch = domainCandidates.find((r) => {
        const cleanName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanId = r.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        return (
          cleanName === cleanBrand ||
          cleanId === cleanBrand ||
          cleanName.includes(cleanBrand) ||
          cleanId.includes(cleanBrand)
        );
      });
      if (exactMatch) return exactMatch;

      // 2. Specificity-scored token match
      const genericWords = new Set([
        'and', 'the', 'set', 'sets', 'grade', 'wood', 'door', 'doors',
        'window', 'windows', 'pipe', 'pipes', 'tile', 'tiles', 'paint',
        'cement', 'steel', 'teak', 'wire', 'wires', 'wall', 'block', 'blocks'
      ]);
      const specificTokens = brandStr
        .toLowerCase()
        .split(/[\s/(),-]+/)
        .filter((t) => t.length >= 3 && !genericWords.has(t));

      if (specificTokens.length > 0) {
        let bestCandidate: RateMasterItem | undefined;
        let bestScore = 0;
        for (const r of domainCandidates) {
          const haystack = `${r.name} ${r.id} ${r.packageTier} ${r.specification || ''}`.toLowerCase();
          let score = 0;
          for (const token of specificTokens) {
            if (haystack.includes(token)) score++;
          }
          if (score > bestScore) {
            bestScore = score;
            bestCandidate = r;
          }
        }
        if (bestCandidate && bestScore > 0) return bestCandidate;
      }

      // 3. Fallback: match any token of length >= 3
      const allTokens = brandStr.toLowerCase().split(/[\s/(),-]+/).filter((t) => t.length >= 3);
      return domainCandidates.find((r) => {
        const haystack = `${r.name} ${r.id}`.toLowerCase();
        return allTokens.some((t) => haystack.includes(t));
      });
    };

    const brandItem = findBrandItem();

    const getVal = (o: RateOverride | undefined): number | null => {
      if (!o || o.isActive === false) return null;
      if (typeof o.overrideRate === 'number' && !isNaN(o.overrideRate) && isFinite(o.overrideRate) && o.overrideRate >= 0) return o.overrideRate;
      if (typeof o.rate === 'number' && !isNaN(o.rate) && isFinite(o.rate) && o.rate >= 0) return o.rate;
      return null;
    };

    const checkOverrideForId = (
      candId: string
    ): { val: number; sourceType: EffectiveRateResult['sourceType']; pkgTier: string; location: string } | null => {
      // 1. Exact: [id, pkg, loc]
      if (pkg !== 'ALL' && loc !== 'ALL') {
        const val = getVal(this.overrides.get(this.getCompositeKey(candId, pkg, loc)));
        if (val !== null) return { val, sourceType: 'OVERRIDE_PACKAGE_LOCATION', pkgTier: pkg, location: loc };
      }
      // 2. Package: [id, pkg, 'ALL']
      if (pkg !== 'ALL') {
        const val = getVal(this.overrides.get(this.getCompositeKey(candId, pkg, 'ALL')));
        if (val !== null) return { val, sourceType: 'OVERRIDE_PACKAGE', pkgTier: pkg, location: 'ALL' };
      }
      // 3. Location: [id, 'ALL', loc]
      if (loc !== 'ALL') {
        const val = getVal(this.overrides.get(this.getCompositeKey(candId, 'ALL', loc)));
        if (val !== null) return { val, sourceType: 'OVERRIDE_LOCATION', pkgTier: 'ALL', location: loc };
      }
      // 4. Global: [id, 'ALL', 'ALL']
      const val = getVal(this.overrides.get(this.getCompositeKey(candId, 'ALL', 'ALL')));
      if (val !== null) return { val, sourceType: 'OVERRIDE_GLOBAL', pkgTier: 'ALL', location: 'ALL' };

      return null;
    };

    const lookupOverride = (
      id: string
    ): { val: number; sourceType: EffectiveRateResult['sourceType']; pkgTier: string; location: string } | null => {
      const direct = checkOverrideForId(id);
      if (direct !== null) return direct;

      const aliases = CANONICAL_RATE_ALIASES[id] || [];
      for (const alias of aliases) {
        const aliasMatch = checkOverrideForId(alias);
        if (aliasMatch !== null) return aliasMatch;
      }

      return null;
    };

    // ── 1. ACTIVE OVERRIDES ──
    // 1a. Check active overrides for brand-specific rateId first
    if (brandItem) {
      const brandOverride = lookupOverride(brandItem.id);
      if (brandOverride !== null) {
        return {
          rateId: brandItem.id,
          effectiveRate: brandOverride.val,
          defaultRate: brandItem.rate,
          overrideRate: brandOverride.val,
          sourceType: brandOverride.sourceType,
          unit: brandItem.unit,
          location: brandOverride.location,
          packageTier: brandOverride.pkgTier,
        };
      }
    }

    // 1b. Check active overrides for requested primary rateId
    const primaryOverride = lookupOverride(rateId);
    if (primaryOverride !== null) {
      return {
        rateId,
        effectiveRate: primaryOverride.val,
        defaultRate: defaultItem?.rate ?? 0,
        overrideRate: primaryOverride.val,
        sourceType: primaryOverride.sourceType,
        unit: defaultItem?.unit ?? 'Nos',
        location: primaryOverride.location,
        packageTier: primaryOverride.pkgTier,
      };
    }

    // ── 2. BASELINE RATE RESOLUTION ──
    // 2a. Brand item baseline in HUTTY_BASELINE_RATES
    if (brandItem && brandItem.rate > 0) {
      return {
        rateId: brandItem.id,
        effectiveRate: brandItem.rate,
        defaultRate: brandItem.rate,
        sourceType: 'BASELINE',
        unit: brandItem.unit,
        location: brandItem.location,
        packageTier: brandItem.packageTier,
      };
    }

    // 2b. Brand database fallback
    if (brandStr) {
      const domainPrefix = rateId.split('.')[0].toLowerCase();
      const bRate = getBrandRate(domainPrefix, brandStr);
      if (bRate > 0) {
        return {
          rateId,
          effectiveRate: bRate,
          defaultRate: bRate,
          sourceType: 'BASELINE',
          unit: defaultItem?.unit || 'Nos',
          location: 'ALL',
          packageTier: 'ALL',
        };
      }
    }

    // 2c. Contextual Package / Location baseline item in HUTTY_BASELINE_RATES
    if (pkg !== 'ALL' || loc !== 'ALL') {
      const contextualBaseline = HUTTY_BASELINE_RATES.find(
        (r) =>
          r.id === rateId &&
          (r.packageTier === pkg || r.packageTier === 'ALL') &&
          (r.location === loc || r.location === 'ALL')
      );
      if (contextualBaseline && contextualBaseline.rate > 0) {
        return {
          rateId,
          effectiveRate: contextualBaseline.rate,
          defaultRate: contextualBaseline.rate,
          sourceType: 'BASELINE',
          unit: contextualBaseline.unit,
          location: contextualBaseline.location,
          packageTier: contextualBaseline.packageTier,
        };
      }
    }

    // 2d. Canonical Hutty default baseline rate
    if (defaultItem && defaultItem.rate > 0) {
      return {
        rateId,
        effectiveRate: defaultItem.rate,
        defaultRate: defaultItem.rate,
        sourceType: 'BASELINE',
        unit: defaultItem.unit,
        location: defaultItem.location,
        packageTier: defaultItem.packageTier,
      };
    }

    // ── 3. GENUINELY MISSING RATE ──
    // Strictly enforced: no arbitrary fabricated positive price, no NaN/undefined/Infinity.
    return {
      rateId,
      effectiveRate: 0,
      defaultRate: 0,
      sourceType: 'MISSING_RATE',
      isMissing: true,
      unit: defaultItem?.unit || 'Nos',
      location: 'ALL',
      packageTier: 'ALL',
    };
  }

  // ────────────────────────────────────────────────────────────
  // 2. OVERRIDE MANAGEMENT (CMS INTERFACE)
  // ────────────────────────────────────────────────────────────
  public setOverride(override: RateOverride, adminEmail = 'admin@costcalculator.app', reason?: string): void {
    const val = typeof override.overrideRate === 'number' ? override.overrideRate : override.rate;
    if (typeof val !== 'number' || isNaN(val) || val < 0) {
      throw new Error(`Invalid override rate: ${val}. Must be a non-negative number.`);
    }

    const pkg = normalizePackageTier(override.packageTier);
    const loc = normalizeLocation(override.location);
    const key = this.getCompositeKey(override.rateId, pkg, loc);
    const existing = this.overrides.get(key);
    const prevRate = existing?.overrideRate ?? existing?.rate ?? null;

    this.overrides.set(key, {
      ...override,
      packageTier: pkg,
      location: loc,
      rate: val,
      overrideRate: val,
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('hutty_active_overrides', JSON.stringify(Array.from(this.overrides.values())));
      } catch {}
    }

    const auditEntry: RateAuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      rateId: override.rateId,
      rateName: override.rateId,
      category: override.category,
      unit: override.unit,
      oldValue: prevRate,
      newValue: val,
      action: existing ? 'UPDATE_OVERRIDE' : 'CREATE_OVERRIDE',
      location: loc,
      packageTier: pkg,
      adminEmail,
      reason: reason || 'Admin updated rate in Rate Master CMS',
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(auditEntry);
    this.notify();
  }

  public removeOverride(
    rateIdOrId: string,
    packageTier: PackageTierDimension = 'ALL',
    location: LocationDimension = 'ALL',
    adminEmail = 'admin@costcalculator.app',
    reason?: string
  ): void {
    const pkg = normalizePackageTier(packageTier);
    const loc = normalizeLocation(location);

    // Check if rateIdOrId matches an existing override id directly
    for (const [k, o] of this.overrides.entries()) {
      if (o.id === rateIdOrId || (o.rateId === rateIdOrId && o.packageTier === pkg && o.location === loc)) {
        this.overrides.delete(k);
      }
    }

    const key = this.getCompositeKey(rateIdOrId, pkg, loc);
    const existing = this.overrides.get(key);
    if (existing) {
      this.overrides.delete(key);
      const defaultItem = HUTTY_BASELINE_RATES.find((r) => r.id === rateIdOrId);
      const auditEntry: RateAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        rateId: rateIdOrId,
        rateName: defaultItem?.name || rateIdOrId,
        category: existing.category,
        unit: existing.unit,
        oldValue: existing.rate ?? null,
        newValue: defaultItem?.rate ?? 0,
        action: 'REMOVE_OVERRIDE',
        location: loc,
        packageTier: pkg,
        adminEmail,
        reason: reason || 'Reset to Hutty Baseline default by admin',
        timestamp: new Date().toISOString(),
      };
      this.auditLogs.unshift(auditEntry);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('hutty_active_overrides', JSON.stringify(Array.from(this.overrides.values())));
      } catch {}
    }
    this.notify();
  }

  public resetAllToDefault(adminEmail = 'admin@costcalculator.app'): void {
    this.overrides.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('hutty_active_overrides');
      } catch {}
    }
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      rateId: 'ALL',
      rateName: 'All Rates',
      category: 'Other construction inputs',
      unit: 'All',
      oldValue: null,
      newValue: 0,
      action: 'RESET_DEFAULT',
      location: 'ALL',
      packageTier: 'ALL',
      adminEmail,
      reason: 'Global reset to Hutty Baseline Rate Dataset',
      timestamp: new Date().toISOString(),
    });
    this.notify();
  }

  public resetToDefaults(): void {
    this.overrides.clear();
    this.config = { ...HUTTY_BASELINE_CONFIG };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('hutty_active_overrides');
        localStorage.removeItem('hutty_calculator_config');
      } catch {}
    }
    this.notify();
  }

  public setOverrides(overrides: RateOverride[]): void {
    this.overrides.clear();
    overrides.forEach((o) => {
      const val = typeof o.overrideRate === 'number' ? o.overrideRate : o.rate;
      if (typeof val === 'number' && !isNaN(val) && val >= 0) {
        const pkg = normalizePackageTier(o.packageTier);
        const loc = normalizeLocation(o.location);
        const key = this.getCompositeKey(o.rateId, pkg, loc);
        this.overrides.set(key, {
          ...o,
          packageTier: pkg,
          location: loc,
          rate: val,
          overrideRate: val,
          isActive: o.isActive !== false,
        });
      }
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('hutty_active_overrides', JSON.stringify(Array.from(this.overrides.values())));
      } catch {}
    }

    this.notify();
  }

  public setConfig(settings: Partial<CalculatorConfigSettings>): void {
    this.config = { ...HUTTY_BASELINE_CONFIG, ...settings };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('hutty_calculator_config', JSON.stringify(this.config));
      } catch {}
    }
    this.notify();
  }

  public syncOverrides(overrides: RateOverride[]): void {
    this.setOverrides(overrides);
  }

  public getAllOverrides(): RateOverride[] {
    return Array.from(this.overrides.values()).filter((o) => o.isActive);
  }

  public getAllBaselineRates(): RateMasterItem[] {
    return [...HUTTY_BASELINE_RATES];
  }

  public getAuditLogs(rateId?: string): RateAuditEntry[] {
    if (rateId) return this.auditLogs.filter((l) => l.rateId === rateId);
    return [...this.auditLogs];
  }

  // ────────────────────────────────────────────────────────────
  // 3. CONFIGURATION MANAGEMENT
  // ────────────────────────────────────────────────────────────
  public getConfig(): CalculatorConfigSettings {
    return { ...this.config };
  }

  public updateConfig(settings: Partial<CalculatorConfigSettings>, adminEmail = 'admin@costcalculator.app'): void {
    // Validate
    for (const [k, v] of Object.entries(settings)) {
      if (typeof v === 'number' && (isNaN(v) || v < 0)) {
        throw new Error(`Configuration field '${k}' cannot be negative.`);
      }
    }
    this.config = { ...this.config, ...settings, updatedBy: adminEmail, updatedAt: new Date().toISOString() };
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      rateId: 'CONFIG',
      rateName: 'Calculator Configuration Settings',
      category: 'Markups',
      unit: 'settings',
      oldValue: null,
      newValue: 0,
      action: 'CONFIG_UPDATE',
      location: 'ALL',
      packageTier: 'ALL',
      adminEmail,
      reason: 'Calculator assumptions updated by admin',
      timestamp: new Date().toISOString(),
    });
    this.notify();
  }

  // ────────────────────────────────────────────────────────────
  // 4. BACKWARD COMPATIBILITY WITH EXISTING CODE & TESTS
  // ────────────────────────────────────────────────────────────
  public setProvider(provider: IRateProvider): void {
    this.activeProvider = provider;
  }

  public resetToDefault(): void {
    this.activeProvider = this.defaultProvider;
    this.resetAllToDefault();
  }

  public getActiveProvider(): IRateProvider {
    return this.activeProvider;
  }

  public getDefaultProvider(): IRateProvider {
    return this.defaultProvider;
  }

  public getRate(categoryId: string, brandName: string, location?: string): number {
    // If a custom provider is explicitly plugged in (e.g. in tests/CMS), let it override
    if (this.activeProvider !== this.defaultProvider) {
      const customRate = this.activeProvider.getRate(categoryId, brandName, location);
      if (typeof customRate === 'number' && customRate > 0) return customRate;
    }

    // Try resolving through centralized rate system
    const norm = (brandName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = HUTTY_BASELINE_RATES.find(
      (r) =>
        r.category.toLowerCase().includes(categoryId.toLowerCase()) &&
        (r.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(norm) ||
          r.id.toLowerCase().replace(/[^a-z0-9]/g, '').includes(norm))
    );
    if (matched) {
      return this.getEffectiveRate(matched.id, { brand: brandName, location });
    }
    return this.activeProvider.getRate(categoryId, brandName, location);
  }


  public getRateItem(categoryId: string, brandName: string, fallbackRate = 0, fallbackUnit = 'Nos'): LegacyRateMasterItem {
    return this.activeProvider.getRateItem(categoryId, brandName, fallbackRate, fallbackUnit);
  }

  public getAllRates(categoryId?: string): LegacyRateMasterItem[] {
    return this.activeProvider.getAllRates(categoryId);
  }

  public getSourceMetadata(): RateSourceMetadata {
    return this.activeProvider.getSourceMetadata();
  }

  public getPublicBenchmarkRates(location = 'Bengaluru', packageTier = 'Standard'): PublicBenchmarkRate[] {
    const benchmarks = [
      { id: 'steel.fe550d_tmt', name: 'Fe550D TMT Reinforcement Steel', category: 'Steel', unit: '₹/Tonne', defaultRate: 74000 },
      { id: 'cement.birla_super', name: 'Birla Super 53-Grade / PPC Cement', category: 'Cement', unit: '₹/Bag', defaultRate: 400 },
      { id: 'sand.m_sand', name: 'Manufactured M-Sand (Zone II)', category: 'Sand', unit: '₹/CFT', defaultRate: 55 },
      { id: 'sand.p_sand', name: 'Manufactured Plastering P-Sand', category: 'Sand', unit: '₹/CFT', defaultRate: 65 },
      { id: 'aggregate.20mm', name: 'Crushed Granite Aggregate 20mm', category: 'Aggregates', unit: '₹/CFT', defaultRate: 40 },
      { id: 'masonry.solid_block_6in', name: 'Dense Concrete Solid Block (6-inch)', category: 'Masonry', unit: '₹/Block', defaultRate: 34 },
      { id: 'masonry.aac_block', name: 'Autoclaved Aerated Concrete (AAC) Block', category: 'Masonry', unit: '₹/Block', defaultRate: 65 },
      { id: 'flooring.vitrified_tiles', name: 'Double Charged Vitrified Tiles 800x800', category: 'Finishes', unit: '₹/SqFt', defaultRate: 85 },
      { id: 'flooring.granite_slab', name: 'Sadahalli Grey Polished Granite', category: 'Finishes', unit: '₹/SqFt', defaultRate: 145 },
      { id: 'windows.upvc_slider', name: '2.5-Track uPVC Sliding Window w/ Mesh', category: 'Glazing', unit: '₹/SqFt', defaultRate: 650 },
      { id: 'doors.teak_wood', name: 'Burma Teak Engineered Main Door', category: 'Joinery', unit: '₹/Door', defaultRate: 28000 },
      { id: 'paint.asian_tractor_emulsion', name: 'Asian Paints Tractor Emulsion', category: 'Painting', unit: '₹/SqFt', defaultRate: 16 },
    ];

    return benchmarks.map((item) => {
      const ctx = { packageTier, location };
      const result = this.getEffectiveResult(item.id, ctx);
      const isOverridden = result.sourceType !== 'BASELINE' && result.sourceType !== 'MISSING_RATE' && result.sourceType !== 'FALLBACK';
      return {
        rateId: item.id,
        displayName: item.name,
        category: item.category,
        unit: item.unit,
        rate: result.effectiveRate > 0 ? result.effectiveRate : item.defaultRate,
        packageTier,
        location,
        source: isOverridden ? ('OVERRIDE' as const) : ('BASELINE' as const),
        updatedAt: undefined,
      };
    });
  }

  public async fetchPublicBenchmarkRates(location = 'Bengaluru', packageTier = 'Standard'): Promise<PublicBenchmarkRate[]> {
    try {
      const url = getApiUrl(`/api/v1/rates/latest?location=${encodeURIComponent(location)}&packageTier=${encodeURIComponent(packageTier)}`);
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.materials)) {
          return json.materials;
        }
      }
    } catch {
      // Fallback seamlessly to local rateService resolution
    }
    return this.getPublicBenchmarkRates(location, packageTier);
  }
}

export interface PublicBenchmarkRate {
  rateId: string;
  displayName: string;
  category: string;
  unit: string;
  rate: number;
  packageTier: string;
  location: string;
  source: 'OVERRIDE' | 'BASELINE';
  updatedAt?: string;
}

export const rateService = new RateService();
