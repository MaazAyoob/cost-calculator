import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CANONICAL_SAMPLE_RATES } from '../constants/canonicalRates';
import { inMemoryOverrides } from './admin.controller';

let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
} catch (err) {
  console.warn('[RatesController] Prisma initialization warning:', err);
}

// 12 key public benchmark materials for residential construction in Karnataka
export const BENCHMARK_RATE_IDS = [
  'steel.fe550d_tmt',
  'cement.birla_super',
  'sand.m_sand',
  'sand.p_sand',
  'aggregate.20mm',
  'masonry.solid_block_6in',
  'masonry.aac_block',
  'flooring.vitrified_tiles',
  'flooring.granite_slab',
  'doors.teak_wood',
  'windows.upvc_slider',
  'paint.asian_tractor_emulsion',
];

interface PublicRateItem {
  rateId: string;
  displayName: string;
  category: string;
  unit: string;
  rate: number;
  packageTier: string;
  location: string;
  source: 'OVERRIDE' | 'BASELINE';
  updatedAt: string;
}

/**
 * Public-safe rate resolution following Hutty's 4-tier precedence:
 * 1. Exact: rateId + package + location
 * 2. Package: rateId + package + ALL
 * 3. Location: rateId + ALL + location
 * 4. Global: rateId + ALL + ALL
 * 5. Baseline catalogue
 */
function resolvePublicEffectiveRate(
  item: { id: string; name: string; category: string; rate: number; unit: string },
  packageTier: string,
  location: string,
  overrides: any[]
): PublicRateItem {
  const normPkg = packageTier.toUpperCase();
  const normLoc = location.toUpperCase();

  // Filter overrides for this rateId
  const matching = overrides.filter(
    (o) => o.rateId === item.id || (o.rateId === 'windows.upvc_slider' && item.id === 'windows.upvc_slider')
  );

  // 1. Exact
  const exact = matching.find(
    (o) => o.packageTier?.toUpperCase() === normPkg && o.location?.toUpperCase() === normLoc
  );
  if (exact) {
    return {
      rateId: item.id,
      displayName: item.name,
      category: item.category,
      unit: item.unit,
      rate: Number(exact.rate),
      packageTier,
      location,
      source: 'OVERRIDE',
      updatedAt: exact.updatedAt ? new Date(exact.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  // 2. Package
  const pkgMatch = matching.find(
    (o) => o.packageTier?.toUpperCase() === normPkg && (o.location?.toUpperCase() === 'ALL' || !o.location)
  );
  if (pkgMatch) {
    return {
      rateId: item.id,
      displayName: item.name,
      category: item.category,
      unit: item.unit,
      rate: Number(pkgMatch.rate),
      packageTier,
      location,
      source: 'OVERRIDE',
      updatedAt: pkgMatch.updatedAt ? new Date(pkgMatch.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  // 3. Location
  const locMatch = matching.find(
    (o) => (o.packageTier?.toUpperCase() === 'ALL' || !o.packageTier) && o.location?.toUpperCase() === normLoc
  );
  if (locMatch) {
    return {
      rateId: item.id,
      displayName: item.name,
      category: item.category,
      unit: item.unit,
      rate: Number(locMatch.rate),
      packageTier,
      location,
      source: 'OVERRIDE',
      updatedAt: locMatch.updatedAt ? new Date(locMatch.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  // 4. Global
  const globalMatch = matching.find(
    (o) =>
      (o.packageTier?.toUpperCase() === 'ALL' || !o.packageTier) &&
      (o.location?.toUpperCase() === 'ALL' || !o.location)
  );
  if (globalMatch) {
    return {
      rateId: item.id,
      displayName: item.name,
      category: item.category,
      unit: item.unit,
      rate: Number(globalMatch.rate),
      packageTier,
      location,
      source: 'OVERRIDE',
      updatedAt: globalMatch.updatedAt ? new Date(globalMatch.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  // 5. Baseline
  return {
    rateId: item.id,
    displayName: item.name,
    category: item.category,
    unit: item.unit,
    rate: item.rate,
    packageTier,
    location,
    source: 'BASELINE',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * GET /api/v1/rates/latest
 * Public endpoint returning safe material pricing with zero sensitive admin data.
 */
export async function getLatestRates(req: Request, res: Response) {
  try {
    const location = (req.query.location as string) || 'Bengaluru';
    const packageTier = (req.query.packageTier as string) || 'Standard';

    // Retrieve active overrides from DB with in-memory fallback
    let overrides: any[] = [];
    if (prisma && (prisma as any).rateOverride) {
      try {
        overrides = await (prisma as any).rateOverride.findMany({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
        });
      } catch {
        overrides = Array.from(inMemoryOverrides.values()).filter((o) => o.isActive);
      }
    } else {
      overrides = Array.from(inMemoryOverrides.values()).filter((o) => o.isActive);
    }

    // Resolve rates for all benchmark materials
    const materials = BENCHMARK_RATE_IDS.map((rateId) => {
      const canonical = CANONICAL_SAMPLE_RATES.find((r) => r.id === rateId) || {
        id: rateId,
        name: rateId,
        category: 'General',
        rate: 100,
        unit: 'Unit',
      };
      return resolvePublicEffectiveRate(canonical, packageTier, location, overrides);
    });

    return res.json({
      success: true,
      context: {
        location,
        packageTier,
      },
      materials,
      totalMaterials: materials.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest material rates',
      details: err.message,
    });
  }
}
