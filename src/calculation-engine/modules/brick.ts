// ============================================================
// MASONRY & AGGREGATES MODULE
// Strictly follows Hutty Pilot Specification (Section 7, 9, 10, 11, 12)
//
// Direct Material Thumb Rules:
// - M-Sand: Total BUA × 0.60 CFT/sqft (Concrete & fine aggregate)
// - P-Sand: Total BUA × 0.60 CFT/sqft (Masonry & plastering)
// - Coarse Aggregate: Total BUA × 1.35 CFT/sqft (20mm & 12mm metal)
//
// Masonry Quantity:
// - Consumes canonical Space & Building Model wall geometry
// - Net Wall Area = External Wall Area + Internal Wall Area − Door/Window Openings
// - Wall Volume = Net Wall Area × Selected Wall Thickness
// - Block Quantity = Wall Volume ÷ Unit Block Volume × (1 + Wastage%)
// ============================================================

import { EngineInput, AreaResult, BuildingModel } from '../types';
import {
  M_SAND_CUFT_PER_SQFT,
  P_SAND_CUFT_PER_SQFT,
  COARSE_AGGREGATE_CUFT_PER_SQFT,
} from '../data/coefficients';
import { getMasonrySpecification } from '../data/masonrySpecifications';
import { getBrandRate } from '../data/brandDatabase';
import { rateService } from '../data/rateService';
import { configResolver } from '../config/configurationResolver';

export function calculateMasonry(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel
): {
  masonryMaterial: string;
  masonryBrand: string;
  masonrySizeLabel: string;
  masonryVolumeCuM: number;
  masonryUnitsCount: number;
  masonryUnit: string;
  masonryWastagePct: number;
  masonryUnitRate: number;
  masonryAmount: number;
  aacBlocksCuM: number;
  aacBlocksPieces: number;
  netWallAreaSqFt: number;
  grossWallAreaSqFt: number;
  wallThicknessMm: number;
  blockWallCoverageSqFt: number;
  baseBlockCount: number;
  finalBlocksRequired: number;
  wallVolumeCuM: number;
  mSandCuFt: number;
  pSandCuFt: number;
  sandCuFt: number;
  coarseAggregateCuFt: number;
} {
  const bua = area.totalBUASqFt || 0;
  const spec = getMasonrySpecification(input.materialBrands?.masonry || (input as any).masonryMaterial);

  if (bua <= 0 && area.plotAreaSqFt <= 0) {
    return {
      masonryMaterial: spec.type,
      masonryBrand: spec.brand,
      masonrySizeLabel: spec.sizeLabel,
      masonryVolumeCuM: 0,
      masonryUnitsCount: 0,
      masonryUnit: spec.unit,
      masonryWastagePct: spec.wastagePercentage,
      masonryUnitRate: spec.unitRate,
      masonryAmount: 0,
      aacBlocksCuM: 0,
      aacBlocksPieces: 0,
      netWallAreaSqFt: 0,
      grossWallAreaSqFt: 0,
      wallThicknessMm: Math.round(spec.externalWallThicknessM * 1000),
      blockWallCoverageSqFt: 0,
      baseBlockCount: 0,
      finalBlocksRequired: 0,
      wallVolumeCuM: 0,
      mSandCuFt: 0,
      pSandCuFt: 0,
      sandCuFt: 0,
      coarseAggregateCuFt: 0,
    };
  }

  // 1. Direct Material Thumb Rules (PDF Section 9, 10, 11)
  const mSandFactor = configResolver.resolveParameter('config.material.m_sand_cft_per_sqft', undefined, M_SAND_CUFT_PER_SQFT);
  const pSandFactor = configResolver.resolveParameter('config.material.p_sand_cft_per_sqft', undefined, P_SAND_CUFT_PER_SQFT);
  const aggregateFactor = configResolver.resolveParameter('config.material.coarse_aggregate_cft_per_sqft', undefined, COARSE_AGGREGATE_CUFT_PER_SQFT);

  const mSandCuFt = Math.round(bua * mSandFactor);
  const pSandCuFt = Math.round(bua * pSandFactor);
  const sandCuFt = mSandCuFt + pSandCuFt; // Total sand
  const coarseAggregateCuFt = Math.round(bua * aggregateFactor);

  // 2. Space Model Geometry for Masonry (PDF Section 12)
  const netWallAreaSqFt = parseFloat(buildingModel.totalNetWallAreaSqFt.toFixed(1));
  const grossWallAreaSqFt = parseFloat((buildingModel.grossExternalWallAreaSqFt + buildingModel.grossInternalWallAreaSqFt).toFixed(1));
  const wallThicknessMm = Math.round(spec.externalWallThicknessM * 1000);
  const blockWallCoverageSqFt = netWallAreaSqFt;
  const wallVolumeCuM = parseFloat(buildingModel.totalWallVolumeCuM.toFixed(2));
  const masonryUnitsCount = buildingModel.totalBlockCount;
  const baseBlockCount = spec.unitVolumeCuM > 0
    ? Math.ceil(wallVolumeCuM / spec.unitVolumeCuM)
    : Math.round(masonryUnitsCount / (1 + spec.wastagePercentage / 100));
  const finalBlocksRequired = masonryUnitsCount;
  const masonryVolumeCuM = wallVolumeCuM;

  // Rate and brand determination
  const brandName = input.materialBrands?.masonry || spec.brand;
  const defaultBrandRate = getBrandRate('masonry', brandName) || spec.unitRate;
  let rateKey = 'masonry.aac_block_birla';
  if (spec.type === 'Clay Bricks') {
    rateKey = 'masonry.red_clay_brick';
  } else if (spec.type === 'Concrete Blocks') {
    rateKey = 'masonry.solid_concrete_block_6in';
  }
  const brandRate = rateService.getEffectiveRate(
    rateKey,
    { packageTier: input.qualityTier, location: input.city, brand: brandName },
    defaultBrandRate
  );
  const masonryAmount = Math.round(masonryUnitsCount * brandRate);

  return {
    masonryMaterial: spec.type,
    masonryBrand: brandName,
    masonrySizeLabel: spec.sizeLabel,
    masonryVolumeCuM,
    masonryUnitsCount,
    masonryUnit: spec.unit,
    masonryWastagePct: spec.wastagePercentage,
    masonryUnitRate: brandRate,
    masonryAmount,
    aacBlocksCuM: masonryVolumeCuM,
    aacBlocksPieces: masonryUnitsCount,
    netWallAreaSqFt,
    grossWallAreaSqFt,
    wallThicknessMm,
    blockWallCoverageSqFt,
    baseBlockCount,
    finalBlocksRequired,
    wallVolumeCuM,
    mSandCuFt,
    pSandCuFt,
    sandCuFt,
    coarseAggregateCuFt,
  };
}
