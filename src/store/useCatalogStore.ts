// ============================================================
// CUSTOMER CATALOG STORE (Zustand)
// Manages active visual brands, products, and tile collections.
// Syncs from backend /api/v1/catalog and bridges with the canonical Rate Master.
// ============================================================

import { create } from 'zustand';
import { Brand, MaterialProduct } from '../types/catalog';
import { getApiUrl } from '../config/api';
import { resolveImageUrl } from '../utils/imageUrl';
import { rateService } from '../calculation-engine/data/rateService';

export { resolveImageUrl };

// Initial fallback baseline brands (offline / instant initial load)
const FALLBACK_BRANDS: Brand[] = [
  {
    id: 'brand-tata',
    name: 'Tata Tiscon',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=160&auto=format&fit=crop&q=80',
    description: 'Gold standard primary structural TMT rebar with superior earthquake ductility.',
    website: 'https://www.tatatiscon.co.in',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'brand-jsw',
    name: 'JSW Neosteel',
    logoUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=160&auto=format&fit=crop&q=80',
    description: 'High-yield thermo-mechanically treated primary rebars with low phosphorus & sulphur.',
    website: 'https://www.jswneosteel.in',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'brand-indus',
    name: 'Indus TMT',
    logoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=160&auto=format&fit=crop&q=80',
    description: 'Cost-effective high-durability ribbed TMT bars for residential construction.',
    website: 'https://industmt.com',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'brand-ultratech',
    name: 'UltraTech',
    logoUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=160&auto=format&fit=crop&q=80',
    description: "India's No. 1 structural cement with micro-fine waterproofing particles.",
    website: 'https://www.ultratechcement.com',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'brand-acc',
    name: 'ACC Cement',
    logoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=160&auto=format&fit=crop&q=80',
    description: 'Gold Water Shield and Concrete Plus engineered high-early-strength cement.',
    website: 'https://www.acclimited.com',
    active: true,
    displayOrder: 5,
  },
  {
    id: 'brand-dalmia',
    name: 'Dalmia Bharat',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=160&auto=format&fit=crop&q=80',
    description: 'DSP / PPC Heavy Structure cement for durable foundation and slab casting.',
    website: 'https://www.dalmiacement.com',
    active: true,
    displayOrder: 6,
  },
  {
    id: 'brand-birla-aerocon',
    name: 'Birla Aerocon',
    logoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&auto=format&fit=crop&q=80',
    description: 'Autoclaved Aerated Concrete blocks with superior thermal insulation.',
    website: 'https://www.birlaaerocon.com',
    active: true,
    displayOrder: 7,
  },
  {
    id: 'brand-kajaria',
    name: 'Kajaria',
    logoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=160&auto=format&fit=crop&q=80',
    description: "India's leading ceramic and vitrified tile manufacturer.",
    website: 'https://www.kajariaceramics.com',
    active: true,
    displayOrder: 8,
  },
  {
    id: 'brand-somany',
    name: 'Somany',
    logoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=160&auto=format&fit=crop&q=80',
    description: 'High-gloss and slip-resistant floor and bathroom tile collections.',
    website: 'https://www.somanyceramics.com',
    active: true,
    displayOrder: 9,
  },
];

// Initial fallback baseline products
const FALLBACK_PRODUCTS: MaterialProduct[] = [
  // ── Steel ──
  {
    id: 'prod-tata-550d',
    brandId: 'brand-tata',
    brand: 'Tata Tiscon',
    category: 'steel',
    name: 'Tata Tiscon 550D Super Ductile',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
    description: 'Primary structural steel rebar with superior earthquake ductility and corrosion resistance.',
    specification: 'Fe 550D Super Ductile',
    unit: 'kg',
    rate: 78,
    rateUnit: '₹/kg',
    rateId: 'st-tata',
    productCode: 'TISCON-550D',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'prod-jsw-550d',
    brandId: 'brand-jsw',
    brand: 'JSW Neosteel',
    category: 'steel',
    name: 'JSW Neosteel Fe 550D High Strength',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
    description: 'High-yield thermo-mechanically treated primary rebars with high bond strength in concrete.',
    specification: 'Fe 550D High Strength',
    unit: 'kg',
    rate: 74,
    rateUnit: '₹/kg',
    rateId: 'st-jsw',
    productCode: 'JSW-550D',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'prod-indus-500d',
    brandId: 'brand-indus',
    brand: 'Indus TMT',
    category: 'steel',
    name: 'Indus TMT Fe 500D Premium',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop&q=80',
    description: 'Cost-effective high-durability ribbed TMT bars suitable for low-rise residential structures.',
    specification: 'Fe 500D Premium',
    unit: 'kg',
    rate: 68,
    rateUnit: '₹/kg',
    rateId: 'st-indus',
    productCode: 'INDUS-500D',
    active: true,
    displayOrder: 3,
  },

  // ── Cement ──
  {
    id: 'prod-ultratech-weatherplus',
    brandId: 'brand-ultratech',
    brand: 'UltraTech',
    category: 'cement',
    name: 'UltraTech Weather Plus (OPC 53)',
    imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&auto=format&fit=crop&q=80',
    description: "India's #1 structural cement engineered with water-repellent micro-particles for RCC slabs.",
    specification: 'Super / Weather Plus (OPC 53)',
    unit: 'Bag',
    rate: 420,
    rateUnit: '₹/50kg Bag',
    rateId: 'cm-ultratech',
    productCode: 'UT-WP-53',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'prod-acc-goldshield',
    brandId: 'brand-acc',
    brand: 'ACC Cement',
    category: 'cement',
    name: 'ACC Gold Water Shield Concrete Plus',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=80',
    description: 'High initial compressive strength with active water-repellent polymers for columns and slabs.',
    specification: 'Gold Water Shield / Concrete Plus',
    unit: 'Bag',
    rate: 395,
    rateUnit: '₹/50kg Bag',
    rateId: 'cm-acc',
    productCode: 'ACC-GWS-53',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'prod-dalmia-dsp',
    brandId: 'brand-dalmia',
    brand: 'Dalmia Bharat',
    category: 'cement',
    name: 'Dalmia DSP Heavy Structure PPC',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80',
    description: 'High slump retention with low heat of hydration, drastically reducing thermal cracking.',
    specification: 'DSP / PPC Heavy Structure',
    unit: 'Bag',
    rate: 375,
    rateUnit: '₹/50kg Bag',
    rateId: 'cm-dalmia',
    productCode: 'DALMIA-DSP',
    active: true,
    displayOrder: 3,
  },

  // ── Masonry ──
  {
    id: 'prod-birla-aac',
    brandId: 'brand-birla-aerocon',
    brand: 'Birla Aerocon',
    category: 'masonry',
    name: 'Birla Aerocon Precision AAC Block',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80',
    description: 'IS 2185 Part 3 lightweight thermal insulating blocks with polymer jointing adhesive.',
    specification: '600 × 200 × 150 mm Grade 1',
    unit: 'Block',
    rate: 85,
    rateUnit: '₹/Block',
    rateId: 'ms-birla-aac',
    productCode: 'AERO-600-150',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'prod-red-clay-brick',
    brandId: null,
    brand: 'Karnataka Guild',
    category: 'masonry',
    name: 'Wirecut First-Class Red Clay Bricks',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
    description: 'Kiln burnt wirecut red clay modular bricks with compressive strength > 10 N/mm².',
    specification: '190 × 90 × 90 mm IS 1077',
    unit: 'Brick',
    rate: 12,
    rateUnit: '₹/Brick',
    rateId: 'ms-wirecut-clay',
    productCode: 'CLAY-190',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'prod-concrete-block',
    brandId: null,
    brand: 'Standard Concrete',
    category: 'masonry',
    name: 'Solid Hydraulic Compressed Concrete Blocks',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    description: 'IS 2185 Part 1 heavy-duty hydraulic pressed solid dense concrete blocks.',
    specification: '400 × 200 × 150 mm Solid',
    unit: 'Block',
    rate: 52,
    rateUnit: '₹/Block',
    rateId: 'ms-solid-concrete',
    productCode: 'CONC-400-150',
    active: true,
    displayOrder: 3,
  },

  // ── Flooring / Tiles ──
  {
    id: 'prod-kajaria-urban-grey',
    brandId: 'brand-kajaria',
    brand: 'Kajaria',
    category: 'flooring',
    name: 'Kajaria Urban Stone Grey Matt',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
    description: 'High-density glazed vitrified floor tile with anti-skid tactile matt finish.',
    specification: 'Premium Vitrified',
    unit: 'sq.ft',
    rate: 85,
    rateUnit: '₹/sq.ft',
    rateId: 'fl-vitrified',
    productCode: 'KAJ-URB-6060',
    active: true,
    displayOrder: 1,
    metadataJson: {
      size: '600 × 600 mm',
      finish: 'Matt Finish',
      colour: 'Stone Grey',
      material: 'Glazed Vitrified',
      thickness: '9 mm',
      coveragePerBoxSqFt: 15.5,
    },
  },
  {
    id: 'prod-kajaria-statuary-gloss',
    brandId: 'brand-kajaria',
    brand: 'Kajaria',
    category: 'flooring',
    name: 'Kajaria Statuario Marble Gloss Vitrified',
    imageUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&auto=format&fit=crop&q=80',
    description: 'Double charged mirror-gloss vitrified tile with Italian Statuario vein aesthetics.',
    specification: 'Luxury High-Gloss',
    unit: 'sq.ft',
    rate: 120,
    rateUnit: '₹/sq.ft',
    rateId: 'fl-vitrified',
    productCode: 'KAJ-STAT-8080',
    active: true,
    displayOrder: 2,
    metadataJson: {
      size: '800 × 800 mm',
      finish: 'High-Gloss Nano Polish',
      colour: 'Statuario White',
      material: 'Double Charged Vitrified',
      thickness: '10 mm',
      coveragePerBoxSqFt: 20.6,
    },
  },
  {
    id: 'prod-somany-durastone-flamed',
    brandId: 'brand-somany',
    brand: 'Somany',
    category: 'flooring',
    name: 'Somany Durastone Antiskid Paver',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
    description: 'Heavy vehicular load certified parking and utility paver tiles with R11 slip rating.',
    specification: 'Heavy-Duty Exterior',
    unit: 'sq.ft',
    rate: 65,
    rateUnit: '₹/sq.ft',
    rateId: 'fl-vitrified',
    productCode: 'SOM-DURA-4040',
    active: true,
    displayOrder: 3,
    metadataJson: {
      size: '400 × 400 mm',
      finish: 'R11 Anti-Skid Flamed',
      colour: 'Charcoal Grey',
      material: 'Full Body Heavy Ceramic',
      thickness: '16 mm',
      coveragePerBoxSqFt: 10.3,
    },
  },
  {
    id: 'prod-south-granite-slab',
    brandId: null,
    brand: 'South Indian Granite',
    category: 'flooring',
    name: 'Sadahalli Natural Granite Slab',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=400&auto=format&fit=crop&q=80',
    description: '20mm thick diamond gangsaw cut South Indian granite with mirror edge chamfering.',
    specification: 'Natural Stone Slab',
    unit: 'sq.ft',
    rate: 180,
    rateUnit: '₹/sq.ft',
    rateId: 'fl-granite',
    productCode: 'GRAN-SAD-20',
    active: true,
    displayOrder: 4,
    metadataJson: {
      size: 'Gang-saw Cut Slabs (up to 10×6 ft)',
      finish: 'Mirror Polished',
      colour: 'Sadahalli Grey / Black',
      material: 'Natural Granite Stone',
      thickness: '20 mm',
    },
  },
  {
    id: 'prod-italian-marble-slab',
    brandId: null,
    brand: 'Italian Imported',
    category: 'flooring',
    name: 'Italian Botticino Luxury Marble',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
    description: 'Imported Italian Botticino beige marble with diamond resin polish and vein matching.',
    specification: 'Luxury Natural Marble',
    unit: 'sq.ft',
    rate: 450,
    rateUnit: '₹/sq.ft',
    rateId: 'fl-italian-marble',
    productCode: 'MARB-BOT-18',
    active: true,
    displayOrder: 5,
    metadataJson: {
      size: 'Custom Gang-saw Slabs',
      finish: 'Diamond Epoxy Mirror Polish',
      colour: 'Botticino Beige',
      material: 'Natural Italian Marble',
      thickness: '18 mm',
    },
  },
];

interface CatalogState {
  brands: Brand[];
  products: MaterialProduct[];
  isLoading: boolean;
  error: string | null;
  selectedPreviewProduct: MaterialProduct | null;

  fetchCatalog: () => Promise<void>;
  getBrandById: (id?: string | null) => Brand | undefined;
  getProductById: (id?: string | null) => MaterialProduct | undefined;
  getProductsByCategory: (category: string) => MaterialProduct[];
  getEffectiveProductRate: (
    product: MaterialProduct,
    tier?: string,
    location?: string
  ) => { rate: number; isOverridden: boolean; source: string };
  openPreviewModal: (product: MaterialProduct) => void;
  closePreviewModal: () => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  brands: FALLBACK_BRANDS,
  products: FALLBACK_PRODUCTS,
  isLoading: false,
  error: null,
  selectedPreviewProduct: null,

  fetchCatalog: async () => {
    set({ isLoading: true, error: null });
    try {
      const [brandsRes, productsRes] = await Promise.allSettled([
        fetch(getApiUrl('/api/v1/catalog/brands')),
        fetch(getApiUrl('/api/v1/catalog/products')),
      ]);

      let loadedBrands = FALLBACK_BRANDS;
      let loadedProducts = FALLBACK_PRODUCTS;

      if (brandsRes.status === 'fulfilled' && brandsRes.value.ok) {
        const json = await brandsRes.value.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          loadedBrands = json.data;
        }
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const json = await productsRes.value.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          loadedProducts = json.data;
        }
      }

      set({
        brands: loadedBrands,
        products: loadedProducts,
        isLoading: false,
      });
    } catch {
      // Fallback kept
      set({ isLoading: false });
    }
  },

  getBrandById: (id?: string | null) => {
    if (!id) return undefined;
    return get().brands.find((b) => b.id === id);
  },

  getProductById: (id?: string | null) => {
    if (!id) return undefined;
    return get().products.find((p) => p.id === id);
  },

  getProductsByCategory: (category: string) => {
    const norm = category.toLowerCase().trim();
    const activeBrandIds = new Set(get().brands.filter((b) => b.active).map((b) => b.id));
    return get()
      .products.filter((p) => {
        if (!p.active) return false;
        // If product is attached to a brand, brand must be active
        if (p.brandId && !activeBrandIds.has(p.brandId)) return false;
        return p.category.toLowerCase().trim() === norm;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  },

  getEffectiveProductRate: (product: MaterialProduct, tier = 'PREMIUM', location = 'Bangalore') => {
    // If rateId is linked, query the canonical Rate Master
    if (product.rateId) {
      const resolved = rateService.getEffectiveResult(product.rateId, {
        packageTier: tier as any,
        location: location as any,
      });
      if (resolved && typeof resolved.effectiveRate === 'number' && resolved.effectiveRate > 0) {
        let rate = resolved.effectiveRate;
        // Normalize tonne rate to kg if product unit is kg
        if (product.unit.toLowerCase() === 'kg' && resolved.unit?.toLowerCase().includes('tonne') && rate > 1000) {
          rate = Math.round(rate / 1000);
        }
        return {
          rate,
          isOverridden: Boolean(resolved.sourceType && resolved.sourceType.startsWith('OVERRIDE')),
          source: resolved.sourceType || 'Hutty Centralized Rate Master',
        };
      }
    }
    return {
      rate: product.rate,
      isOverridden: false,
      source: 'Catalog Base Rate',
    };
  },

  openPreviewModal: (product: MaterialProduct) => {
    set({ selectedPreviewProduct: product });
  },

  closePreviewModal: () => {
    set({ selectedPreviewProduct: null });
  },
}));

/**
 * Validates that every active catalog product resolves through the canonical Rate Master.
 * Detects orphaned or missing rate IDs without fabricating rates or duplicate authority.
 */
export function validateCatalogRateIds(
  products: MaterialProduct[],
  tier = 'PREMIUM',
  location = 'Bangalore'
): {
  valid: boolean;
  orphans: string[];
  resolvedRates: Record<string, { rate: number; source: string; isOverridden: boolean }>;
} {
  const orphans: string[] = [];
  const resolvedRates: Record<string, { rate: number; source: string; isOverridden: boolean }> = {};

  for (const product of products) {
    if (!product.active) continue;
    if (!product.rateId) {
      orphans.push(`Product "${product.id}" (${product.name}) has no rateId defined.`);
      continue;
    }

    const resolved = rateService.getEffectiveResult(product.rateId, {
      packageTier: tier as any,
      location: location as any,
    });

    if (!resolved || resolved.sourceType === 'MISSING_RATE' || resolved.effectiveRate <= 0) {
      orphans.push(`Product "${product.id}" (${product.name}) has orphan rateId "${product.rateId}".`);
    } else {
      let rate = resolved.effectiveRate;
      if (product.unit.toLowerCase() === 'kg' && resolved.unit?.toLowerCase().includes('tonne') && rate > 1000) {
        rate = Math.round(rate / 1000);
      }
      resolvedRates[product.id] = {
        rate,
        source: resolved.sourceType,
        isOverridden: resolved.sourceType.startsWith('OVERRIDE'),
      };
    }
  }

  return {
    valid: orphans.length === 0,
    orphans,
    resolvedRates,
  };
}

// Automatically fetch active catalog on initialization in browser environments
if (typeof window !== 'undefined') {
  useCatalogStore.getState().fetchCatalog();
}
