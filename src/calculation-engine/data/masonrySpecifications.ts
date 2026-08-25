// ============================================================
// MASONRY SPECIFICATIONS & GEOMETRY CONSTANTS
// Authoritative material database for masonry materials:
// 1. AAC Blocks (Autoclaved Aerated Concrete) - IS 2185 Part 3
// 2. Wirecut Red Clay Bricks - IS 1077
// 3. Solid Concrete / Cement Blocks - IS 2185 Part 1
// ============================================================

export type MasonryMaterialType = 'AAC Blocks' | 'Clay Bricks' | 'Concrete Blocks';

export interface MasonrySpecification {
  id: string;
  type: MasonryMaterialType;
  name: string;
  brand: string;
  description: string;
  sizeLabel: string;
  blockLengthM: number;
  blockHeightM: number;
  blockThicknessM: number;
  unitVolumeCuM: number;
  externalWallThicknessM: number;
  internalWallThicknessM: number;
  wastagePercentage: number;
  unitRate: number;
  unit: 'Nos' | 'Blocks' | 'Bricks';
  isDefault?: boolean;
}

export const MASONRY_SPECIFICATIONS: Record<MasonryMaterialType, MasonrySpecification> = {
  'AAC Blocks': {
    id: 'ms-aac',
    type: 'AAC Blocks',
    name: 'AAC Blocks (600×200×150mm)',
    brand: 'Birla Aerocon / Godrej Grade 1',
    description: 'IS 2185 Part 3 lightweight thermal insulating blocks with polymer thin-bed adhesive',
    sizeLabel: '600 × 200 × 150 mm',
    blockLengthM: 0.600,
    blockHeightM: 0.200,
    blockThicknessM: 0.150,
    unitVolumeCuM: 0.018, // 0.600 × 0.200 × 0.150 = 0.018 m³
    externalWallThicknessM: 0.150, // 150 mm (6")
    internalWallThicknessM: 0.100, // 100 mm (4")
    wastagePercentage: 5, // 5% approved cutting & handling wastage
    unitRate: 85, // ₹85 per block
    unit: 'Nos',
    isDefault: true,
  },
  'Clay Bricks': {
    id: 'ms-clay',
    type: 'Clay Bricks',
    name: 'Wirecut Red Clay Bricks (190×90×90mm)',
    brand: 'Standard Red Clay Standard',
    description: 'IS 1077 certified kiln-burnt modular red clay bricks with high compressive strength',
    sizeLabel: '190 × 90 × 90 mm',
    blockLengthM: 0.190,
    blockHeightM: 0.090,
    blockThicknessM: 0.090,
    unitVolumeCuM: 0.001539, // 0.190 × 0.090 × 0.090 = 0.001539 m³
    externalWallThicknessM: 0.230, // 230 mm (9" brick wall)
    internalWallThicknessM: 0.115, // 115 mm (4.5" brick partition)
    wastagePercentage: 7, // 7% approved brick cutting wastage
    unitRate: 12, // ₹12 per brick
    unit: 'Nos',
  },
  'Concrete Blocks': {
    id: 'ms-concrete',
    type: 'Concrete Blocks',
    name: 'Solid Concrete Blocks (400×200×150mm)',
    brand: 'Solid Concrete Blocks Standard',
    description: 'IS 2185 Part 1 hydraulic pressed high load-bearing solid cement/concrete blocks',
    sizeLabel: '400 × 200 × 150 mm',
    blockLengthM: 0.400,
    blockHeightM: 0.200,
    blockThicknessM: 0.150,
    unitVolumeCuM: 0.012, // 0.400 × 0.200 × 0.150 = 0.012 m³
    externalWallThicknessM: 0.150, // 150 mm (6")
    internalWallThicknessM: 0.100, // 100 mm (4")
    wastagePercentage: 5, // 5% approved cutting & handling wastage
    unitRate: 52, // ₹52 per block
    unit: 'Nos',
  },
};

export const DEFAULT_MASONRY_SPECIFICATION = MASONRY_SPECIFICATIONS['AAC Blocks'];

export function getMasonrySpecification(selection?: string): MasonrySpecification {
  if (!selection) return DEFAULT_MASONRY_SPECIFICATION;
  const s = selection.toLowerCase();
  if (s.includes('clay') || s.includes('brick') || s.includes('red')) {
    return MASONRY_SPECIFICATIONS['Clay Bricks'];
  }
  if (s.includes('concrete') || s.includes('cement block') || s.includes('solid block')) {
    return MASONRY_SPECIFICATIONS['Concrete Blocks'];
  }
  return MASONRY_SPECIFICATIONS['AAC Blocks'];
}
