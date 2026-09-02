// ============================================================
// BRAND DATABASE & MARKET RATE ENGINE
// Complete brand catalogue with unit pricing, quality tiers,
// verified source notes, and normalized units.
// ============================================================

export type RateBasis = 'material-only' | 'labour-only' | 'composite' | 'installed';
export type GstTreatment = 'included' | 'excluded' | 'not-applicable';
export type TransportTreatment = 'included' | 'excluded' | 'separate';

export interface BrandOption {
  id: string;
  name: string;
  qualityTier: 'Essential' | 'Premium' | 'Luxury';
  unitRate: number;
  unit: string;
  description: string;
  warranty?: string;
  material: string;
  category: string;
  grade?: string;
  location?: string;
  effectiveDate?: string;
  rateBasis?: RateBasis;
  gstTreatment?: GstTreatment;
  transportTreatment?: TransportTreatment;
  source?: string;
  notes?: string;
}

export interface RateMasterItem {
  id: string;
  item: string;
  specification: string;
  unit: string;
  location: string;
  rate: number;
  effectiveDate: string;
  rateBasis: RateBasis;
  gstTreatment: GstTreatment;
  transportTreatment: TransportTreatment;
  source: string;
  notes?: string;
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
    unit: '₹/Tonne',
    brands: [
      {
        id: 'st-indus',
        name: 'Indus TMT Fe 500D',
        material: 'TMT Steel Rebar',
        category: 'Structure',
        grade: 'Fe 500D',
        qualityTier: 'Essential',
        unitRate: 68000,
        unit: '₹/Tonne',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Karnataka Steel Dealers Association',
        description: 'Economical high-durability TMT bar',
        warranty: '3 yr mill test',
        notes: 'High elongation ductility suitable for low-rise residential.'
      },
      {
        id: 'st-jsw',
        name: 'JSW Neosteel',
        material: 'TMT Steel Rebar',
        category: 'Structure',
        grade: 'Fe 550D',
        qualityTier: 'Essential',
        unitRate: 74000,
        unit: '₹/Tonne',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'JSW Steel Regional Price Index',
        description: 'High ductility seismic grade bar',
        warranty: '5 yr',
        notes: 'Primary producer rebar with high corrosion resistance.'
      },
      {
        id: 'st-sail',
        name: 'SAIL TMT Fe 550D',
        material: 'TMT Steel Rebar',
        category: 'Structure',
        grade: 'Fe 550D',
        qualityTier: 'Premium',
        unitRate: 72000,
        unit: '₹/Tonne',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'SAIL Branch Sales Office',
        description: 'Public sector quality primary rebar',
        warranty: '7 yr',
        notes: 'IS 1786 compliant seismic detailing.'
      },
      {
        id: 'st-tata',
        name: 'Tata Tiscon',
        material: 'TMT Steel Rebar',
        category: 'Structure',
        grade: 'Fe 550D',
        qualityTier: 'Premium',
        unitRate: 78000,
        unit: '₹/Tonne',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Tata Steel Authorized Distributor Index',
        description: 'Gold standard TMT, superior ductility and rib pattern',
        warranty: '10 yr',
        notes: 'Super ductile rebar with optimal bond strength in concrete.'
      },
      {
        id: 'st-tata-super',
        name: 'Tata Tiscon Super Fe 600',
        material: 'TMT Steel Rebar',
        category: 'Structure',
        grade: 'Fe 600',
        qualityTier: 'Luxury',
        unitRate: 85000,
        unit: '₹/Tonne',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Tata Steel Premium Distribution',
        description: 'Ultra high strength seismic grade rebar',
        warranty: '15 yr',
        notes: 'Reduces steel congestion in heavy beam-column joints.'
      },
    ],
  },
  {
    id: 'cement',
    label: 'Cement (OPC/PPC)',
    unit: '₹/50kg Bag',
    brands: [
      {
        id: 'cm-dalmia',
        name: 'Dalmia Bharat',
        material: 'Cement',
        category: 'Structure',
        grade: 'PPC / OPC 43',
        qualityTier: 'Essential',
        unitRate: 375,
        unit: '₹/50kg Bag',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Karnataka Cement Merchants Association',
        description: 'Portland Pozzolana Cement for masonry and plastering',
        notes: 'Low heat of hydration, reduced thermal cracking.'
      },
      {
        id: 'cm-acc',
        name: 'ACC Cement',
        material: 'Cement',
        category: 'Structure',
        grade: 'OPC 53 / Concrete Plus',
        qualityTier: 'Premium',
        unitRate: 395,
        unit: '₹/50kg Bag',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'ACC Dealer Rate Card',
        description: 'Gold Water Shield / Concrete Plus engineered cement',
        notes: 'Active water-repellent polymers built into matrix.'
      },
      {
        id: 'cm-ultratech',
        name: 'UltraTech',
        material: 'Cement',
        category: 'Structure',
        grade: 'OPC 53',
        qualityTier: 'Premium',
        unitRate: 420,
        unit: '₹/50kg Bag',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'UltraTech Building Solutions Rate Card',
        description: 'Super / Weather Plus (OPC 53 Grade)',
        notes: 'The Engineers Choice for high-early-strength RCC casting.'
      },
      {
        id: 'cm-ultratech-protech',
        name: 'UltraTech ProTech 53+',
        material: 'Cement',
        category: 'Structure',
        grade: 'OPC 53 Micro-fine',
        qualityTier: 'Luxury',
        unitRate: 480,
        unit: '₹/50kg Bag',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'UltraTech Technical Solutions',
        description: 'Technical grade high-performance micro-fine cement',
        notes: 'Ultra dense pore structure for extreme durability.'
      },
    ],
  },
  {
    id: 'masonry',
    label: 'Masonry (AAC Blocks / Bricks / Concrete Blocks)',
    unit: '₹/Unit',
    brands: [
      {
        id: 'ms-birla-aac',
        name: 'Birla Aerocon AAC Blocks',
        material: 'AAC Block',
        category: 'Structure',
        grade: 'IS 2185 Part 3 (600×200×150mm)',
        qualityTier: 'Premium',
        unitRate: 85,
        unit: '₹/Block',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Birla Aerocon Authorized Distributor',
        description: 'Autoclaved aerated concrete block 600×200×150mm',
        notes: 'High thermal insulation and fast construction cycle.',
      },
      {
        id: 'ms-godrej-aac',
        name: 'Godrej AAC Blocks',
        material: 'AAC Block',
        category: 'Structure',
        grade: 'Grade 1 (600×200×150mm)',
        qualityTier: 'Premium',
        unitRate: 88,
        unit: '₹/Block',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Godrej Construction Material Index',
        description: 'Precision cut high-density AAC block',
        notes: 'Strict dimensional tolerance < 1.5mm.',
      },
      {
        id: 'ms-wirecut-clay',
        name: 'Wirecut Red Clay Bricks',
        material: 'Clay Brick',
        category: 'Structure',
        grade: 'IS 1077 First Class (190×90×90mm)',
        qualityTier: 'Premium',
        unitRate: 12,
        unit: '₹/Brick',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Karnataka Brick Manufacturers Guild',
        description: 'Kiln burnt wirecut red clay modular bricks',
        notes: 'High compressive strength (> 10 N/mm2).',
      },
      {
        id: 'ms-solid-concrete',
        name: 'Solid Concrete Blocks',
        material: 'Concrete Block',
        category: 'Structure',
        grade: 'IS 2185 Part 1 (400×200×150mm)',
        qualityTier: 'Essential',
        unitRate: 52,
        unit: '₹/Block',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Concrete Products Association',
        description: 'Hydraulic compressed solid concrete block',
        notes: 'Dense high load-bearing block.',
      },
    ],
  },
  {
    id: 'doors',
    label: 'Doors',
    unit: '₹/Set',
    brands: [
      {
        id: 'dr-flush',
        name: 'Flush Door',
        material: 'Door Set',
        category: 'Joinery',
        grade: 'Commercial / BWP',
        qualityTier: 'Essential',
        unitRate: 18500,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Timber Merchants Association',
        description: 'BWP grade flush door with hardwood frame',
        warranty: '3 yr',
        notes: 'Standard interior passage door.'
      },
      {
        id: 'dr-normal-teak',
        name: 'Normal Teak',
        material: 'Door Set',
        category: 'Joinery',
        grade: 'Honné / Second Class Teak',
        qualityTier: 'Essential',
        unitRate: 42000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Timber Merchants Association',
        description: 'Commercial teakwood frame and veneer shutter',
        warranty: '3 yr',
        notes: 'Seasoned wood with PU polish finish.'
      },
      {
        id: 'dr-premium-teak',
        name: 'Premium Teak',
        material: 'Door Set',
        category: 'Joinery',
        grade: 'Burma Teak First Class',
        qualityTier: 'Premium',
        unitRate: 65000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Rightcon Standard Schedule',
        description: 'First-grade Burma Teakwood carved frame and 40mm shutter',
        warranty: '10 yr',
        notes: 'Brass / SS 304 hardware package included.'
      },
      {
        id: 'dr-burma-custom',
        name: 'Burma Teak Custom Carved',
        material: 'Door Set',
        category: 'Joinery',
        grade: 'Solid Burma Teak 45mm',
        qualityTier: 'Luxury',
        unitRate: 145000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Rightcon Standard Schedule',
        description: '45mm solid Burma teak main door with artisan carving and digital lock',
        warranty: '15 yr',
        notes: 'Includes Yale/Godrej biometric digital lock.'
      },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    unit: '₹/Sq.Ft',
    brands: [
      {
        id: 'wn-aluminium',
        name: 'Aluminium',
        material: 'Window System',
        category: 'Joinery',
        grade: 'Anodized 2-Track',
        qualityTier: 'Essential',
        unitRate: 480,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Jindal Aluminium Fabricators',
        description: 'Anodized aluminium section with 5mm clear float glass',
        notes: 'Economical sliding window system.'
      },
      {
        id: 'wn-upvc',
        name: 'uPVC',
        material: 'Window System',
        category: 'Joinery',
        grade: '60mm 3-Track DGU',
        qualityTier: 'Premium',
        unitRate: 650,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Kommerling / Fenesta Dealer Index',
        description: 'Multichamber UPVC with toughened glass and SS mosquito mesh',
        notes: 'Sound insulation and thermal efficiency.'
      },
      {
        id: 'wn-wood',
        name: 'Wood',
        material: 'Window System',
        category: 'Joinery',
        grade: 'Teak Wood Casement',
        qualityTier: 'Luxury',
        unitRate: 950,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Timber Merchants Association',
        description: 'Seasoned teak wood frame and shutter with brass fittings and toughened glass',
        notes: 'Traditional architectural aesthetics.'
      },
    ],
  },
  {
    id: 'flooring',
    label: 'Flooring',
    unit: '₹/Sq.Ft',
    brands: [
      {
        id: 'fl-vitrified',
        name: 'Vitrified Tiles',
        material: 'Floor Tile',
        category: 'Finishing',
        grade: 'Double Charged 800×800mm',
        qualityTier: 'Essential',
        unitRate: 110,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Kajaria / Somany Retail Index',
        description: 'Double charged vitrified tile with nano polish',
        notes: 'Low water absorption, scratch resistant.'
      },
      {
        id: 'fl-granite',
        name: 'Granite Slab',
        material: 'Natural Stone',
        category: 'Finishing',
        grade: '20mm Polished Sadahalli / Black',
        qualityTier: 'Premium',
        unitRate: 180,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Jigani Granite Hub Index',
        description: 'Polished natural granite slab flooring and steps',
        notes: 'High durability stone for living and corridors.'
      },
      {
        id: 'fl-italian-marble',
        name: 'Italian Marble',
        material: 'Natural Stone',
        category: 'Finishing',
        grade: 'Bottochino / Dyna Polished',
        qualityTier: 'Luxury',
        unitRate: 420,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Jigani Imported Marble Index',
        description: 'Italian polished marble slab with epoxy treatment',
        notes: 'Mirror polish finish with book-matched veins.'
      },
    ],
  },
  {
    id: 'paint',
    label: 'Paint (Interior)',
    unit: '₹/Sq.Ft',
    brands: [
      {
        id: 'pt-berger',
        name: 'Berger Paints',
        material: 'Interior Paint',
        category: 'Finishing',
        grade: 'Bison Acrylic Emulsion',
        qualityTier: 'Essential',
        unitRate: 20,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Berger Paints Karnataka Channel',
        description: 'Bison emulsion finish with primer coat',
        notes: 'Economical smooth interior finish.'
      },
      {
        id: 'pt-dulux',
        name: 'Dulux',
        material: 'Interior Paint',
        category: 'Finishing',
        grade: 'Velvet Touch',
        qualityTier: 'Essential',
        unitRate: 22,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'AkzoNobel Dulux Channel',
        description: 'Velvet touch interior washable emulsion',
        notes: 'Rich smooth finish with good hiding power.'
      },
      {
        id: 'pt-asian',
        name: 'Asian Paints',
        material: 'Interior Paint',
        category: 'Finishing',
        grade: 'Apcolite Premium Emulsion',
        qualityTier: 'Premium',
        unitRate: 28,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Asian Paints Colour World Index',
        description: 'Premium washable interior emulsion with anti-fungal barrier',
        notes: 'High stain resistance and matte/sheen options.'
      },
      {
        id: 'pt-asian-royale',
        name: 'Asian Paints Royale',
        material: 'Interior Paint',
        category: 'Finishing',
        grade: 'Royale Luxury Emulsion',
        qualityTier: 'Luxury',
        unitRate: 45,
        unit: '₹/Sq.Ft',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Asian Paints Signature Stores',
        description: 'Teflon surface protector luxury sheen with metallic highlights',
        notes: 'Anti-bacterial, ultra-smooth luxury finish.'
      },
    ],
  },
  {
    id: 'electrical',
    label: 'Electrical (Wiring & Switches)',
    unit: '₹/Metre',
    brands: [
      {
        id: 'el-anchor',
        name: 'Anchor',
        material: 'Electrical Wire',
        category: 'MEP',
        grade: 'Anchor by Panasonic FRLS',
        qualityTier: 'Essential',
        unitRate: 28,
        unit: '₹/Metre',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Electrical Merchants Association',
        description: 'Standard household copper wiring FRLS',
        notes: 'IS 694 certified.'
      },
      {
        id: 'el-vguard',
        name: 'V-Guard',
        material: 'Electrical Wire',
        category: 'MEP',
        grade: 'V-Guard Cal流量 FRLS',
        qualityTier: 'Premium',
        unitRate: 36,
        unit: '₹/Metre',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'V-Guard Dealer Network',
        description: 'FRLS 100% electrolytic copper wiring with triple layer insulation',
        notes: 'High heat and flame retardant capability.'
      },
      {
        id: 'el-polycab',
        name: 'Polycab',
        material: 'Electrical Wire',
        category: 'MEP',
        grade: 'Polycab Green Wire FRLS-H',
        qualityTier: 'Luxury',
        unitRate: 46,
        unit: '₹/Metre',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Polycab Authorized Distributor',
        description: 'Zero halogen flame retardant multi-strand wire',
        notes: 'Lead free and non-toxic smoke emission.'
      },
      {
        id: 'el-finolex',
        name: 'Finolex',
        material: 'Electrical Wire',
        category: 'MEP',
        grade: 'Finolex FRLS Class 5',
        qualityTier: 'Luxury',
        unitRate: 48,
        unit: '₹/Metre',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Finolex Cables Index',
        description: 'Zero halogen low smoke high conductivity wire',
        notes: 'Gold standard multi-strand electrolytic copper.'
      },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom Fixtures',
    unit: '₹/Set',
    brands: [
      {
        id: 'bt-cera',
        name: 'Cera',
        material: 'Sanitaryware Set',
        category: 'MEP',
        grade: 'Standard Ceramic Series',
        qualityTier: 'Essential',
        unitRate: 18000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Cera Sanitaryware Channel',
        description: 'Wall mount WC, wash basin, pillar tap, overhead shower set',
        notes: 'Durable ceramic with chrome plated brass taps.'
      },
      {
        id: 'bt-hindware',
        name: 'Hindware',
        material: 'Sanitaryware Set',
        category: 'MEP',
        grade: 'Italian Collection',
        qualityTier: 'Essential',
        unitRate: 22000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Hindware Retail Index',
        description: 'Rimless wall-hung closet, vanity basin, single-lever diverter',
        notes: 'Anti-germ glaze ceramic.'
      },
      {
        id: 'bt-jaquar',
        name: 'Jaquar',
        material: 'Sanitaryware Set',
        category: 'MEP',
        grade: 'Kubix / Alive Premium',
        qualityTier: 'Premium',
        unitRate: 38000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Jaquar Orientation Centre Rate Card',
        description: 'Concealed cistern closet, rain shower with thermostatic mixer, vanity basin',
        warranty: '10 yr on CP fittings',
        notes: 'Quarter-turn ceramic disc cartridges.'
      },
      {
        id: 'bt-kohler',
        name: 'Kohler',
        material: 'Sanitaryware Set',
        category: 'MEP',
        grade: 'Presquile / Veil Series',
        qualityTier: 'Luxury',
        unitRate: 75000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Kohler Experience Center Index',
        description: 'Wall hung rimless WC, thermostatic multi-flow shower, quartz vanity basin',
        warranty: '12 yr',
        notes: 'PVD finish CP fixtures.'
      },
      {
        id: 'bt-toto',
        name: 'Toto',
        material: 'Sanitaryware Set',
        category: 'MEP',
        grade: 'Neorest / CeFiONtect',
        qualityTier: 'Luxury',
        unitRate: 125000,
        unit: '₹/Set',
        location: 'Bengaluru / Mysuru',
        effectiveDate: '2026-Q1',
        source: 'Toto Luxury Showroom Index',
        description: 'Tornado flush washlet, thermostatic shower column, anti-bacterial glaze',
        warranty: '15 yr',
        notes: 'Japanese precision ceramics.'
      },
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

/**
 * Resolves complete Rate Master metadata for any category item
 * Strictly follows Hutty Rate Master Specification (Section 6.1)
 */
export function getRateMasterMetadata(
  categoryId: string,
  brandName: string,
  fallbackRate = 0,
  fallbackUnit = 'Nos'
): RateMasterItem {
  const cat = BRAND_DATABASE.find((c) => c.id === categoryId);
  const normalized = (brandName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  let brand = cat?.brands.find((b) => b.name === brandName);
  if (!brand && cat && normalized) {
    brand = cat.brands.find((b) => {
      const bNorm = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return bNorm.includes(normalized) || normalized.includes(bNorm);
    });
  }

  // Determine standard rate basis per trade
  let defaultRateBasis: RateBasis = 'material-only';
  if (['doors', 'windows', 'bathroom'].includes(categoryId)) {
    defaultRateBasis = 'installed';
  } else if (['electrical', 'plumbing'].includes(categoryId)) {
    defaultRateBasis = 'composite';
  }

  return {
    id: brand?.id || `rate-${categoryId}-${normalized || 'default'}`,
    item: brand?.material || brandName || categoryId,
    specification: brand?.description || brand?.notes || brand?.name || 'Standard specification',
    unit: brand?.unit || fallbackUnit,
    location: brand?.location || 'Bengaluru / Mysuru',
    rate: brand?.unitRate || fallbackRate,
    effectiveDate: brand?.effectiveDate || '2026-Q1',
    rateBasis: brand?.rateBasis || defaultRateBasis,
    gstTreatment: brand?.gstTreatment || 'excluded',
    transportTreatment: brand?.transportTreatment || 'included',
    source: brand?.source || 'Current planning / internal QS basis',
    notes: brand?.notes,
  };
}
