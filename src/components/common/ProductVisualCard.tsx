import React, { useState } from 'react';
import { Check, ZoomIn, Image as ImageIcon, Sparkles } from 'lucide-react';
import { MaterialProduct, Brand, CatalogDisplayType } from '../../types/catalog';
import { cn, formatCurrency } from '../../utils/cn';
import { resolveImageUrl } from '../../utils/imageUrl';

export interface ProductVisualCardProps {
  product: MaterialProduct;
  brand?: Brand;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: (product: MaterialProduct) => void;
  isRecommended?: boolean;
  recommendedReason?: string;
  effectiveRate?: number;
  totalComputedCost?: number;
  className?: string;
  displayMode?: CatalogDisplayType;
}

export const ProductVisualCard: React.FC<ProductVisualCardProps> = ({
  product,
  brand,
  isSelected,
  onSelect,
  onPreview,
  isRecommended = false,
  recommendedReason,
  effectiveRate,
  totalComputedCost,
  className,
  displayMode,
}) => {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Determine presentation mode: explicitly passed prop -> product model -> category default
  const visualCategories = ['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'];
  const mode: CatalogDisplayType =
    displayMode ||
    product.displayType ||
    (visualCategories.includes((product.category || '').toLowerCase().trim()) ? 'visual' : 'compact');

  const displayRate = effectiveRate !== undefined ? effectiveRate : product.rate;
  const brandName = brand?.name || product.brand || 'Premium Manufacturer';
  const logoUrl = resolveImageUrl(brand?.logoUrl);
  const imageUrl = resolveImageUrl(product.imageUrl);
  const tileMeta = product.metadataJson;

  // ═════════════════════════════════════════════════════════════════════════
  // MODE A: COMPACT MATERIAL BRAND CARD (Steel, Cement, Blocks, Paint, etc.)
  // ═════════════════════════════════════════════════════════════════════════
  if (mode === 'compact') {
    return (
      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer select-none bg-white p-3.5 sm:p-4 text-left shadow-2xs hover:shadow-md hover:border-[#1B3D34]/30',
          isSelected
            ? 'border-[#1B3D34] ring-2 ring-[#1B3D34]/20 bg-[#FBFDFB]'
            : 'border-[#E5E7EB]',
          className
        )}
      >
        {/* Top: Small Brand Logo (32-44px), Brand & Material Name, Selection status */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl && !logoError ? (
              <div className="h-9 w-12 shrink-0 rounded-lg bg-white p-1 border border-[#E5E7EB] flex items-center justify-center overflow-hidden shadow-2xs">
                <img
                  src={logoUrl}
                  alt={`${brandName} logo`}
                  onError={() => setLogoError(true)}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-9 w-12 shrink-0 rounded-lg bg-[#F3F4F6] text-[#4B5563] text-[10px] font-black tracking-wider uppercase flex items-center justify-center border border-[#E5E7EB]">
                {brandName.slice(0, 4)}
              </div>
            )}

            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280] block truncate">
                {brandName}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1B3D34] leading-snug line-clamp-1">
                {product.name}
              </h4>
            </div>
          </div>

          {/* Selection indicator badge */}
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {isRecommended && (
              <span className="text-[9px] font-extrabold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#F28C28]" />
                <span className="hidden xs:inline">Recommended</span>
              </span>
            )}

            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                isSelected
                  ? 'bg-[#1B3D34] text-white shadow-2xs'
                  : 'border border-[#D1D5DB] text-transparent group-hover:border-[#1B3D34]/50'
              )}
              aria-label={isSelected ? 'Selected' : 'Select'}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Middle: Grade / Specification Pill */}
        <div className="my-2.5 space-y-1">
          {product.specification ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] font-semibold text-[#374151]">
              <span>{product.specification}</span>
            </div>
          ) : product.description ? (
            <p className="text-[11px] text-[#4B5563] line-clamp-1">
              {product.description}
            </p>
          ) : null}

          {recommendedReason && isRecommended && (
            <p className="text-[10px] text-[#1B3D34] font-medium pt-0.5 line-clamp-1">
              {recommendedReason}
            </p>
          )}
        </div>

        {/* Bottom Row: Rate + Select Button */}
        <div className="pt-2.5 border-t border-[#F3F4F6] flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-black text-[#1B3D34] font-mono">
                ₹{displayRate}
              </span>
              <span className="text-[10px] font-medium text-[#6B7280]">
                /{product.unit}
              </span>
            </div>
            {totalComputedCost !== undefined && totalComputedCost > 0 && (
              <span className="text-[10px] font-mono font-bold text-[#F28C28] block">
                {formatCurrency(totalComputedCost)} est.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all',
              isSelected
                ? 'bg-[#1B3D34] text-white shadow-2xs'
                : 'bg-[#F3F4F6] text-[#1B3D34] hover:bg-[#E5E7EB]'
            )}
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MODE B: VISUAL PRODUCT CARD (Tiles, Cladding, Granite, Marble, etc.)
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer select-none bg-white overflow-hidden text-left shadow-2xs hover:shadow-md hover:border-[#1B3D34]/30',
        isSelected
          ? 'border-[#1B3D34] ring-2 ring-[#1B3D34]/20 bg-[#FBFDFB]'
          : 'border-[#E5E7EB]',
        className
      )}
    >
      {/* 1. LARGE PRODUCT PHOTOGRAPH (Visual Focus) */}
      <div className="relative w-full aspect-16/10 sm:aspect-4/3 bg-[#F9FAFB] overflow-hidden flex items-center justify-center border-b border-[#F3F4F6]">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={`${product.name} surface photograph`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#9CA3AF] gap-1 p-4 text-center">
            <ImageIcon className="w-8 h-8 stroke-1 text-[#CBD5E1]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">
              Product Photograph
            </span>
          </div>
        )}

        {/* Selection Checkmark Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {isRecommended && (
            <span className="text-[9px] font-extrabold text-[#1B3D34] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-[#1B3D34]/20 shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#F28C28]" />
              <span>Recommended</span>
            </span>
          )}
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs',
              isSelected
                ? 'bg-[#1B3D34] text-white scale-105'
                : 'bg-white/90 backdrop-blur-xs border border-[#D1D5DB] text-transparent group-hover:border-[#1B3D34]/50'
            )}
            aria-label={isSelected ? 'Selected' : 'Select'}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {/* Zoom Lightbox Trigger */}
        {onPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(product);
            }}
            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-[#1B3D34] shadow-xs hover:bg-white hover:scale-108 transition-all border border-[#E5E7EB]"
            aria-label={`Preview larger image of ${product.name}`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. CARD BODY: Small Manufacturer Logo + Architectural Specs + Rate */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Small Company Logo (24-32px) Identifying Manufacturer */}
          <div className="flex items-center gap-2">
            {logoUrl && !logoError ? (
              <div className="h-5 w-10 shrink-0 rounded bg-white p-0.5 border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
                <img
                  src={logoUrl}
                  alt={`${brandName} logo`}
                  onError={() => setLogoError(true)}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-4 px-1.5 rounded bg-[#F3F4F6] text-[#4B5563] text-[9px] font-black uppercase flex items-center shrink-0 border border-[#E5E7EB]">
                {brandName.slice(0, 6)}
              </div>
            )}
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider truncate">
              {brandName}
            </span>
          </div>

          {/* Product Name */}
          <h4 className="text-sm sm:text-base font-extrabold text-[#1B3D34] leading-snug line-clamp-1">
            {product.name}
          </h4>

          {/* Tile Specifications (Size, Finish, Material, Thickness) */}
          {tileMeta ? (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {tileMeta.size && (
                <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  {tileMeta.size}
                </span>
              )}
              {tileMeta.finish && (
                <span className="text-[10px] text-[#4B5563] bg-[#F9FAFB] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  {tileMeta.finish}
                </span>
              )}
              {tileMeta.material && (
                <span className="text-[10px] text-[#4B5563] bg-[#F9FAFB] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  {tileMeta.material}
                </span>
              )}
              {tileMeta.thickness && (
                <span className="text-[10px] font-mono text-[#4B5563] bg-[#F9FAFB] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  {tileMeta.thickness}
                </span>
              )}
            </div>
          ) : product.specification ? (
            <p className="text-[11px] font-medium text-[#4B5563] line-clamp-1">
              {product.specification}
            </p>
          ) : null}
        </div>

        {/* Footer: Rate + Select Button */}
        <div className="pt-2.5 border-t border-[#F3F4F6] flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-[#1B3D34] font-mono">
                ₹{displayRate}
              </span>
              <span className="text-[10px] font-medium text-[#6B7280]">
                /{product.unit}
              </span>
            </div>
            {totalComputedCost !== undefined && totalComputedCost > 0 && (
              <span className="text-[10px] font-mono font-bold text-[#F28C28] block">
                {formatCurrency(totalComputedCost)} est.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs',
              isSelected
                ? 'bg-[#1B3D34] text-white'
                : 'bg-[#F3F4F6] text-[#1B3D34] hover:bg-[#E5E7EB]'
            )}
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
};
