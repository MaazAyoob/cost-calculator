// ============================================================
// RATE SERVICE & PROVIDER ABSTRACTION
// Decouples calculation engine from rate storage.
// Supports dynamic plugging of live external price APIs/CMS
// while using the verified 2026-Q1 QS dataset as default/fallback.
// ============================================================

import { RateMasterItem, BRAND_DATABASE, getBrandRate, getRateMasterMetadata } from './brandDatabase';

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
  getRateItem(categoryId: string, brandName: string, fallbackRate?: number, fallbackUnit?: string): RateMasterItem;
  getAllRates(categoryId?: string): RateMasterItem[];
  getSourceMetadata(): RateSourceMetadata;
}

/**
 * Default internal QS-managed Rate Provider
 * Serves verified 2026-Q1 Bangalore/Mysore quantity surveying rates.
 * Explicitly marked as isLive: false.
 */
export class DefaultQSRateProvider implements IRateProvider {
  private metadata: RateSourceMetadata = {
    sourceId: 'hutty-internal-qs-2026-q1',
    datasetVersion: 'HUTTY-RM-2026.1',
    version: 'HUTTY-RM-2026.1',
    effectivePeriod: '2026-Q1 Fallback',
    effectiveDate: '2026-01-01',
    providerName: 'Hutty Quantity Surveying Rate Master',
    isLive: false,
    lastUpdated: '2026-09-01T00:00:00.000Z',
    calculationEngineVersion: 'v2.6.0',
    disclaimer: 'Baseline 2026-Q1 quantity surveying rates. Connect live provider API to override with real-time merchant rates.',
    location: 'Bengaluru / Mysuru',
    description: 'Verified baseline quantity surveying market rate catalogue for Karnataka urban residential construction.',
  };

  getRate(categoryId: string, brandName: string): number {
    return getBrandRate(categoryId, brandName);
  }

  getRateItem(categoryId: string, brandName: string, fallbackRate = 0, fallbackUnit = 'Nos'): RateMasterItem {
    return getRateMasterMetadata(categoryId, brandName, fallbackRate, fallbackUnit);
  }

  getAllRates(categoryId?: string): RateMasterItem[] {
    const categories = categoryId
      ? BRAND_DATABASE.filter((c) => c.id === categoryId)
      : BRAND_DATABASE;

    const items: RateMasterItem[] = [];
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

/**
 * Global Rate Service Singleton
 * Allows external API or CMS providers to be registered at runtime
 * without modifying a single line of calculation engine code.
 */
class RateService {
  private activeProvider: IRateProvider;
  private readonly defaultProvider: IRateProvider;

  constructor() {
    this.defaultProvider = new DefaultQSRateProvider();
    this.activeProvider = this.defaultProvider;
  }

  public setProvider(provider: IRateProvider): void {
    this.activeProvider = provider;
  }

  public resetToDefault(): void {
    this.activeProvider = this.defaultProvider;
  }

  public getActiveProvider(): IRateProvider {
    return this.activeProvider;
  }

  public getDefaultProvider(): IRateProvider {
    return this.defaultProvider;
  }

  public getRate(categoryId: string, brandName: string, location?: string): number {
    return this.activeProvider.getRate(categoryId, brandName, location);
  }

  public getRateItem(categoryId: string, brandName: string, fallbackRate = 0, fallbackUnit = 'Nos'): RateMasterItem {
    return this.activeProvider.getRateItem(categoryId, brandName, fallbackRate, fallbackUnit);
  }

  public getAllRates(categoryId?: string): RateMasterItem[] {
    return this.activeProvider.getAllRates(categoryId);
  }

  public getSourceMetadata(): RateSourceMetadata {
    return this.activeProvider.getSourceMetadata();
  }
}

export const rateService = new RateService();
