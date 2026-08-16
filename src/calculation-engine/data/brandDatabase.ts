// ============================================================
// BRAND DATABASE
// Complete brand catalogue with unit pricing per quality tier
// ============================================================

export interface BrandOption {
  name: string;
  qualityTier: 'Essential' | 'Premium' | 'Luxury';
  unitRate?: number;
  description: string;
  warranty?: string;
}

export interface BrandCategory {
  id: string;
  label: string;
  unit: string;
  brands: BrandOption[];
}

export const BRAND_DATABASE: BrandCategory[] = [
  {
    id: 'steel',
    label: 'Steel (TMT Bars)',
    unit: 'per tonne',
    brands: [
      { name: 'JSW Neo Steel Fe 550D',      qualityTier: 'Essential', unitRate: 74000, description: 'High ductility seismic grade bar', warranty: '5 yr' },
      { name: 'Indus TMT Fe 500D',          qualityTier: 'Essential', unitRate: 68000, description: 'Economical high-durability TMT bar', warranty: '3 yr' },
      { name: 'Tata Tiscon Fe 550D',         qualityTier: 'Premium',   unitRate: 78000, description: 'Gold standard TMT, high ductility', warranty: '10 yr' },
      { name: 'SAIL TMT Fe 550D',            qualityTier: 'Premium',   unitRate: 72000, description: 'Public sector quality bar', warranty: '7 yr' },
      { name: 'Tata Tiscon Super Fe 600',    qualityTier: 'Luxury',    unitRate: 85000, description: 'Ultra high strength seismic grade', warranty: '15 yr' },
    ],
  },
  {
    id: 'cement',
    label: 'Cement (OPC/PPC)',
    unit: 'per 50 kg bag',
    brands: [
      { name: 'Dalmia Bharat',                qualityTier: 'Essential', unitRate: 375, description: 'Portland Pozzolana Cement' },
      { name: 'ACC Cement',                   qualityTier: 'Premium',   unitRate: 395, description: 'Gold Water Shield / Concrete Plus' },
      { name: 'UltraTech',                    qualityTier: 'Premium',   unitRate: 420, description: 'Super / Weather Plus (OPC 53)' },
      { name: 'UltraTech ProTech 53+',         qualityTier: 'Luxury',    unitRate: 480, description: 'Technical grade high performance cement' },
    ],
  },
  {
    id: 'doors',
    label: 'Doors',
    unit: 'per set (frame + shutter)',
    brands: [
      { name: 'Normal Teak',                  qualityTier: 'Essential', unitRate: 42000, description: 'Commercial teakwood frame and veneer shutter', warranty: '3 yr' },
      { name: 'Premium Teak',                 qualityTier: 'Premium',   unitRate: 65000, description: 'First-grade Burma Teakwood carved frame', warranty: '10 yr' },
      { name: 'Burma Teak Custom Carved',     qualityTier: 'Luxury',    unitRate: 145000, description: '45mm solid Burma teak main door', warranty: '15 yr' },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    unit: 'per sq ft',
    brands: [
      { name: 'Aluminium',                    qualityTier: 'Essential', unitRate: 480, description: 'Anodized aluminium section' },
      { name: 'uPVC',                         qualityTier: 'Premium',   unitRate: 650, description: 'Multichamber UPVC with toughened glass' },
      { name: 'Wood',                         qualityTier: 'Luxury',    unitRate: 950, description: 'Teak wood frame and shutter' },
    ],
  },
  {
    id: 'flooring',
    label: 'Flooring',
    unit: 'per sq ft',
    brands: [
      { name: 'Vitrified Tiles',              qualityTier: 'Essential', unitRate: 110, description: 'Double charged vitrified tile' },
      { name: 'Granite Slab',                 qualityTier: 'Premium',   unitRate: 180, description: 'Polished granite slab flooring' },
      { name: 'Italian Marble',               qualityTier: 'Luxury',    unitRate: 420, description: 'Italian polished marble slab tile' },
    ],
  },
  {
    id: 'paint',
    label: 'Paint (Interior)',
    unit: 'per sq ft',
    brands: [
      { name: 'Berger Paints',                qualityTier: 'Essential', unitRate: 20,  description: 'Bison emulsion finish' },
      { name: 'Dulux',                        qualityTier: 'Essential', unitRate: 22,  description: 'Velvet touch interior emulsion' },
      { name: 'Asian Paints',                 qualityTier: 'Premium',   unitRate: 28,  description: 'Premium washable interior emulsion' },
      { name: 'Asian Paints Royale',          qualityTier: 'Luxury',    unitRate: 45,  description: 'Teflon surface protector luxury sheen' },
    ],
  },
  {
    id: 'electrical',
    label: 'Electrical (Wiring & Switches)',
    unit: 'per metre',
    brands: [
      { name: 'Anchor',                       qualityTier: 'Essential', unitRate: 28,  description: 'Standard household copper wiring' },
      { name: 'V-Guard',                      qualityTier: 'Premium',   unitRate: 36,  description: 'FRLS 100% electrolytic copper wiring' },
      { name: 'Finolex',                      qualityTier: 'Luxury',    unitRate: 48,  description: 'Zero halogen low smoke wire' },
      { name: 'Polycab',                      qualityTier: 'Luxury',    unitRate: 46,  description: 'Flame retardant multi-strand wire' },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom Fixtures',
    unit: 'per set',
    brands: [
      { name: 'Cera',                         qualityTier: 'Essential', unitRate: 18000, description: 'Wall mount WC, basin, tap set' },
      { name: 'Jaquar',                       qualityTier: 'Premium',   unitRate: 38000, description: 'Concealed cistern closet + rain shower' },
      { name: 'Kohler',                       qualityTier: 'Luxury',    unitRate: 75000, description: 'Wall hung WC, thermostatic shower' },
    ],
  },
];

/** Get brand unit rate for a given selection; fuzzy matches brand names */
export function getBrandRate(categoryId: string, brandName: string): number {
  if (!brandName) return 0;
  const cat = BRAND_DATABASE.find((c) => c.id === categoryId);
  if (!cat) return 0;

  const normalized = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Exact match
  const exact = cat.brands.find((b) => b.name === brandName);
  if (exact?.unitRate) return exact.unitRate;

  // 2. Normalized match
  const matched = cat.brands.find((b) => {
    const bNorm = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return bNorm.includes(normalized) || normalized.includes(bNorm);
  });

  return matched?.unitRate ?? 0;
}

/** Get brand tier for a given selection */
export function getBrandTier(categoryId: string, brandName: string): 'Essential' | 'Premium' | 'Luxury' {
  if (!brandName) return 'Premium';
  const cat = BRAND_DATABASE.find((c) => c.id === categoryId);
  if (!cat) return 'Premium';
  const normalized = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const brand = cat.brands.find((b) => {
    const bNorm = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return bNorm.includes(normalized) || normalized.includes(bNorm);
  });
  return brand?.qualityTier ?? 'Premium';
}
