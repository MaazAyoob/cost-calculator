import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export interface BrandEntity {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TileMetadata {
  size?: string;
  finish?: string;
  colour?: string;
  material?: string;
  thickness?: string;
  coveragePerBoxSqFt?: number;
}

export interface MaterialProductEntity {
  id: string;
  brandId?: string | null;
  brand?: string;
  category: string;
  displayType?: 'compact' | 'visual' | null;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  specification?: string | null;
  unit: string;
  rate: number;
  rateUnit?: string | null;
  rateId?: string | null;
  productCode?: string | null;
  active: boolean;
  displayOrder: number;
  metadataJson?: TileMetadata | null;
  createdAt: string;
  updatedAt: string;
}

// Initial baseline seed brands
const INITIAL_BRANDS: BrandEntity[] = [
  {
    id: 'brand-tata',
    name: 'Tata Tiscon',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=160&auto=format&fit=crop&q=80',
    description: 'Gold standard primary structural TMT rebar with superior earthquake ductility.',
    website: 'https://www.tatatiscon.co.in',
    active: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-jsw',
    name: 'JSW Neosteel',
    logoUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=160&auto=format&fit=crop&q=80',
    description: 'High-yield thermo-mechanically treated primary rebars with low phosphorus & sulphur.',
    website: 'https://www.jswneosteel.in',
    active: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-indus',
    name: 'Indus TMT',
    logoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=160&auto=format&fit=crop&q=80',
    description: 'Cost-effective high-durability ribbed TMT bars for residential construction.',
    website: 'https://industmt.com',
    active: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-ultratech',
    name: 'UltraTech',
    logoUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=160&auto=format&fit=crop&q=80',
    description: "India's No. 1 structural cement with micro-fine waterproofing particles.",
    website: 'https://www.ultratechcement.com',
    active: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-acc',
    name: 'ACC Cement',
    logoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=160&auto=format&fit=crop&q=80',
    description: 'Gold Water Shield and Concrete Plus engineered high-early-strength cement.',
    website: 'https://www.acclimited.com',
    active: true,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-dalmia',
    name: 'Dalmia Bharat',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=160&auto=format&fit=crop&q=80',
    description: 'DSP / PPC Heavy Structure cement for durable foundation and slab casting.',
    website: 'https://www.dalmiacement.com',
    active: true,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-birla-aerocon',
    name: 'Birla Aerocon',
    logoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&auto=format&fit=crop&q=80',
    description: 'Autoclaved Aerated Concrete blocks with superior thermal insulation.',
    website: 'https://www.birlaaerocon.com',
    active: true,
    displayOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-kajaria',
    name: 'Kajaria',
    logoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=160&auto=format&fit=crop&q=80',
    description: "India's leading ceramic and vitrified tile manufacturer.",
    website: 'https://www.kajariaceramics.com',
    active: true,
    displayOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand-somany',
    name: 'Somany',
    logoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=160&auto=format&fit=crop&q=80',
    description: 'High-gloss and slip-resistant floor and bathroom tile collections.',
    website: 'https://www.somanyceramics.com',
    active: true,
    displayOrder: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial baseline seed products
const INITIAL_PRODUCTS: MaterialProductEntity[] = [
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class CatalogService {
  private prisma: PrismaClient | null = null;
  private inMemoryBrands: BrandEntity[] = [...INITIAL_BRANDS];
  private inMemoryProducts: MaterialProductEntity[] = [...INITIAL_PRODUCTS];

  constructor() {
    try {
      this.prisma = new PrismaClient();
    } catch {
      this.prisma = null;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BRANDS
  // ═════════════════════════════════════════════════════════════════════════

  public async getActiveBrands(): Promise<BrandEntity[]> {
    if (this.prisma) {
      try {
        const brands = await (this.prisma as any).brand.findMany({
          where: { active: true },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        });
        if (brands && brands.length > 0) {
          return brands.map(this.mapPrismaBrand);
        }
      } catch (err) {
        // Fallback to in-memory store
      }
    }
    return this.inMemoryBrands
      .filter((b) => b.active)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  }

  public async getAllBrands(): Promise<BrandEntity[]> {
    if (this.prisma) {
      try {
        const brands = await (this.prisma as any).brand.findMany({
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        });
        if (brands && brands.length > 0) {
          return brands.map(this.mapPrismaBrand);
        }
      } catch {
        // fallback
      }
    }
    return [...this.inMemoryBrands].sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
    );
  }

  public async createBrand(data: Partial<BrandEntity>, adminEmail = 'admin@hutty.in'): Promise<BrandEntity> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Brand name is required');
    }

    const brandName = data.name.trim();
    const existing = this.inMemoryBrands.find((b) => b.name.toLowerCase() === brandName.toLowerCase());
    if (existing) {
      throw new Error(`A brand with name "${brandName}" already exists`);
    }

    const newBrand: BrandEntity = {
      id: data.id || `brand-${crypto.randomUUID().slice(0, 8)}`,
      name: brandName,
      logoUrl: data.logoUrl || null,
      description: data.description || null,
      website: data.website || null,
      active: data.active !== undefined ? data.active : true,
      displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : this.inMemoryBrands.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).brand.create({
          data: {
            id: newBrand.id,
            name: newBrand.name,
            logoUrl: newBrand.logoUrl,
            description: newBrand.description,
            website: newBrand.website,
            active: newBrand.active,
            displayOrder: newBrand.displayOrder,
          },
        });
        await this.logAudit('CREATE_BRAND', adminEmail, { brandId: newBrand.id, name: newBrand.name });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          throw new Error(`Database persistence failure for brand "${newBrand.name}": ${err.message}`);
        }
        console.warn('[CatalogService] Prisma write failed, falling back to in-memory:', err.message);
      }
    }

    this.inMemoryBrands.push(newBrand);
    return newBrand;
  }

  public async updateBrand(id: string, data: Partial<BrandEntity>, adminEmail = 'admin@hutty.in'): Promise<BrandEntity> {
    const index = this.inMemoryBrands.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Brand not found: ${id}`);
    }

    const current = this.inMemoryBrands[index];
    const updated: BrandEntity = {
      ...current,
      ...data,
      name: data.name ? data.name.trim() : current.name,
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).brand.update({
          where: { id },
          data: {
            name: updated.name,
            logoUrl: updated.logoUrl,
            description: updated.description,
            website: updated.website,
            active: updated.active,
            displayOrder: updated.displayOrder,
          },
        });
        await this.logAudit('UPDATE_BRAND', adminEmail, { brandId: id, changes: data });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          throw new Error(`Database update failure for brand "${id}": ${err.message}`);
        }
        console.warn('[CatalogService] Prisma update failed, falling back to in-memory:', err.message);
      }
    }

    this.inMemoryBrands[index] = updated;
    return updated;
  }

  public async deleteBrand(id: string, adminEmail = 'admin@hutty.in'): Promise<boolean> {
    const index = this.inMemoryBrands.findIndex((b) => b.id === id);
    if (index === -1) return false;

    if (this.prisma) {
      try {
        await (this.prisma as any).brand.delete({ where: { id } });
        await this.logAudit('DELETE_BRAND', adminEmail, { brandId: id });
      } catch {
        // fallback to deactivation
        this.inMemoryBrands[index].active = false;
        return true;
      }
    }

    this.inMemoryBrands.splice(index, 1);
    return true;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ═════════════════════════════════════════════════════════════════════════

  public async getActiveProducts(category?: string, brandId?: string): Promise<MaterialProductEntity[]> {
    if (this.prisma) {
      try {
        const whereClause: any = {
          active: true,
          OR: [
            { brandId: null },
            { brandRel: { active: true } },
          ],
        };
        if (category && category !== 'ALL') whereClause.category = category.toLowerCase().trim();
        if (brandId && brandId !== 'ALL') whereClause.brandId = brandId;

        const products = await (this.prisma as any).materialProduct.findMany({
          where: whereClause,
          include: { brandRel: true },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        });

        if (products && products.length > 0) {
          return products.map(this.mapPrismaProduct);
        }
      } catch {
        // fallback
      }
    }

    const activeBrandIds = new Set(this.inMemoryBrands.filter((b) => b.active).map((b) => b.id));
    return this.inMemoryProducts
      .filter((p) => {
        if (!p.active) return false;
        // Products belonging to an inactive brand must not appear in customer active catalog
        if (p.brandId && !activeBrandIds.has(p.brandId)) return false;
        if (category && category !== 'ALL' && p.category.toLowerCase() !== category.toLowerCase()) return false;
        if (brandId && brandId !== 'ALL' && p.brandId !== brandId) return false;
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  }

  public async getAllProducts(filters?: { category?: string; brandId?: string; active?: boolean }): Promise<MaterialProductEntity[]> {
    if (this.prisma) {
      try {
        const whereClause: any = {};
        if (filters?.category && filters.category !== 'ALL') whereClause.category = filters.category;
        if (filters?.brandId && filters.brandId !== 'ALL') whereClause.brandId = filters.brandId;
        if (filters?.active !== undefined) whereClause.active = filters.active;

        const products = await (this.prisma as any).materialProduct.findMany({
          where: whereClause,
          include: { brandRel: true },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        });

        if (products && products.length > 0) {
          return products.map(this.mapPrismaProduct);
        }
      } catch {
        // fallback
      }
    }

    return this.inMemoryProducts
      .filter((p) => {
        if (filters?.category && filters.category !== 'ALL' && p.category.toLowerCase() !== filters.category.toLowerCase()) return false;
        if (filters?.brandId && filters.brandId !== 'ALL' && p.brandId !== filters.brandId) return false;
        if (filters?.active !== undefined && p.active !== filters.active) return false;
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  }

  public async createProduct(data: Partial<MaterialProductEntity>, adminEmail = 'admin@hutty.in'): Promise<MaterialProductEntity> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Product name is required');
    }
    if (!data.category || !data.category.trim()) {
      throw new Error('Category is required');
    }

    // Resolve brand name if brandId provided
    let brandName = data.brand || '';
    if (data.brandId) {
      const brand = this.inMemoryBrands.find((b) => b.id === data.brandId);
      if (brand) brandName = brand.name;
    }

    const newProduct: MaterialProductEntity = {
      id: data.id || `prod-${crypto.randomUUID().slice(0, 8)}`,
      brandId: data.brandId || null,
      brand: brandName,
      category: data.category.toLowerCase().trim(),
      displayType:
        data.displayType ||
        (['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'].includes(data.category.toLowerCase().trim())
          ? 'visual'
          : 'compact'),
      name: data.name.trim(),
      imageUrl: data.imageUrl || null,
      description: data.description || null,
      specification: data.specification || null,
      unit: data.unit || 'sq.ft',
      rate: typeof data.rate === 'number' ? data.rate : 0,
      rateUnit: data.rateUnit || `₹/${data.unit || 'sq.ft'}`,
      rateId: data.rateId || null,
      productCode: data.productCode || null,
      active: data.active !== undefined ? data.active : true,
      displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : this.inMemoryProducts.length + 1,
      metadataJson: data.metadataJson || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).materialProduct.create({
          data: {
            id: newProduct.id,
            brandId: newProduct.brandId,
            category: newProduct.category,
            name: newProduct.name,
            brand: newProduct.brand,
            imageUrl: newProduct.imageUrl,
            description: newProduct.description,
            specification: newProduct.specification,
            unit: newProduct.unit,
            rate: newProduct.rate,
            rateUnit: newProduct.rateUnit,
            rateId: newProduct.rateId,
            productCode: newProduct.productCode,
            active: newProduct.active,
            displayOrder: newProduct.displayOrder,
            metadataJson: newProduct.metadataJson,
          },
        });
        await this.logAudit('CREATE_PRODUCT', adminEmail, { productId: newProduct.id, name: newProduct.name });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          throw new Error(`Database persistence failure for product "${newProduct.name}": ${err.message}`);
        }
        console.warn('[CatalogService] Prisma write failed, falling back to in-memory:', err.message);
      }
    }

    this.inMemoryProducts.push(newProduct);
    return newProduct;
  }

  public async updateProduct(id: string, data: Partial<MaterialProductEntity>, adminEmail = 'admin@hutty.in'): Promise<MaterialProductEntity> {
    const index = this.inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product not found: ${id}`);
    }

    const current = this.inMemoryProducts[index];
    let brandName = data.brand !== undefined ? data.brand : current.brand;
    if (data.brandId && data.brandId !== current.brandId) {
      const brand = this.inMemoryBrands.find((b) => b.id === data.brandId);
      if (brand) brandName = brand.name;
    }

    const updated: MaterialProductEntity = {
      ...current,
      ...data,
      brand: brandName,
      name: data.name ? data.name.trim() : current.name,
      category: data.category ? data.category.toLowerCase().trim() : current.category,
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma) {
      try {
        await (this.prisma as any).materialProduct.update({
          where: { id },
          data: {
            brandId: updated.brandId,
            category: updated.category,
            name: updated.name,
            brand: updated.brand,
            imageUrl: updated.imageUrl,
            description: updated.description,
            specification: updated.specification,
            unit: updated.unit,
            rate: updated.rate,
            rateUnit: updated.rateUnit,
            rateId: updated.rateId,
            productCode: updated.productCode,
            active: updated.active,
            displayOrder: updated.displayOrder,
            metadataJson: updated.metadataJson,
          },
        });
        await this.logAudit('UPDATE_PRODUCT', adminEmail, { productId: id, changes: data });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          throw new Error(`Database update failure for product "${id}": ${err.message}`);
        }
        console.warn('[CatalogService] Prisma update failed, falling back to in-memory:', err.message);
      }
    }

    this.inMemoryProducts[index] = updated;
    return updated;
  }

  public async deleteProduct(id: string, adminEmail = 'admin@hutty.in'): Promise<boolean> {
    const index = this.inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    if (this.prisma) {
      try {
        await (this.prisma as any).materialProduct.delete({ where: { id } });
        await this.logAudit('DELETE_PRODUCT', adminEmail, { productId: id });
      } catch {
        this.inMemoryProducts[index].active = false;
        return true;
      }
    }

    this.inMemoryProducts.splice(index, 1);
    return true;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HELPERS & AUDITING
  // ═════════════════════════════════════════════════════════════════════════

  private async logAudit(action: string, adminEmail: string, details: any): Promise<void> {
    if (this.prisma) {
      try {
        await (this.prisma as any).auditLog.create({
          data: {
            action,
            details: { ...details, adminEmail, timestamp: new Date().toISOString() },
          },
        });
      } catch {
        // silent audit logging failsafe
      }
    }
  }

  private mapPrismaBrand(item: any): BrandEntity {
    return {
      id: item.id,
      name: item.name,
      logoUrl: item.logoUrl,
      description: item.description,
      website: item.website,
      active: item.active !== false,
      displayOrder: item.displayOrder || 0,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  private mapPrismaProduct(item: any): MaterialProductEntity {
    return {
      id: item.id,
      brandId: item.brandId,
      brand: item.brand || (item.brandRel && item.brandRel.name) || '',
      category: item.category,
      displayType:
        item.displayType ||
        (['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'].includes((item.category || '').toLowerCase().trim())
          ? 'visual'
          : 'compact'),
      name: item.name,
      imageUrl: item.imageUrl,
      description: item.description,
      specification: item.specification,
      unit: item.unit,
      rate: item.rate,
      rateUnit: item.rateUnit,
      rateId: item.rateId,
      productCode: item.productCode,
      active: item.active !== false,
      displayOrder: item.displayOrder || 0,
      metadataJson: item.metadataJson,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}

export const catalogService = new CatalogService();
