// ============================================================
// MATERIAL BRAND & PRODUCT CATALOG DOMAIN TYPES
// Visual brand logos, product images, tile metadata & rates
// ============================================================

export type CatalogDisplayType = 'compact' | 'visual';

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TileMetadata {
  size?: string; // e.g. '600 × 600 mm', '800 × 800 mm'
  finish?: string; // e.g. 'Matt Finish', 'High-Gloss Nano Polish', 'Anti-Skid'
  colour?: string; // e.g. 'Stone Grey', 'Statuario White'
  material?: string; // e.g. 'Glazed Vitrified', 'Double Charged Vitrified', 'Natural Granite'
  thickness?: string; // e.g. '9 mm', '16 mm', '20 mm'
  coveragePerBoxSqFt?: number;
}

export interface MaterialProduct {
  id: string;
  brandId?: string | null;
  brand?: string;
  category: string; // 'steel' | 'cement' | 'masonry' | 'flooring' | 'wall-tiles' | 'doors' | 'windows' | 'paint' | 'electrical' | 'bathroom'
  displayType?: CatalogDisplayType; // 'compact' (Steel/Cement/Blocks) vs 'visual' (Tiles/Flooring/Cladding)
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  specification?: string | null;
  unit: string; // e.g. 'kg', 'Bag', 'Block', 'sq.ft', 'Set'
  rate: number;
  rateUnit?: string | null; // e.g. '₹/kg', '₹/Bag', '₹/sq.ft'
  rateId?: string | null; // Link to canonical Rate Master (e.g. 'st-tata', 'cm-ultratech', 'fl-vitrified')
  productCode?: string | null; // SKU
  active: boolean;
  displayOrder: number;
  metadataJson?: TileMetadata | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogSnapshotItem {
  productId?: string;
  productName: string;
  brandId?: string;
  brandName: string;
  brandLogoUrl?: string | null;
  productImageUrl?: string | null;
  category: string;
  displayType?: CatalogDisplayType;
  metadataJson?: TileMetadata | null;
  specification?: string | null;
  rate: number;
  unit: string;
}
