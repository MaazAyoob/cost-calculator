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
  const brandName = brand?.name || product.brand || '';
  const logoUrl = resolveImageUrl(brand?.logoUrl);
  const imageUrl = resolveImageUrl(product.imageUrl);
  const tileMeta = product.metadataJson;

  // Build concise architectural specification string for visual materials
  const visualSpecs = tileMeta
    ? [tileMeta.size, tileMeta.material, tileMeta.finish, tileMeta.thickness]
        .filter(Boolean)
        .join(' • ')
    : product.specification || product.description || '';

  // ═════════════════════════════════════════════════════════════════════════
  // MODE A: COMPACT CONSTRUCTION MATERIAL CARD (Steel, Cement, Masonry, Paint, etc.)
  // ═════════════════════════════════════════════════════════════════════════
  if (mode === 'compact') {
    return (
      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          'group relative flex items-center justify-between gap-3 rounded-xl border p-3 sm:p-3.5 text-left transition-all duration-150 select-none cursor-pointer min-h-[58px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] focus-visible:ring-offset-1',
          isSelected
            ? 'border-[#1B3D34] bg-[#F4F7F5] shadow-2xs'
            : 'border-[#E5E7EB] bg-white hover:border-[#1B3D34]/40 hover:bg-[#FAFBF9]',
          className
        )}
      >
        {/* Left: Optional Small Brand Mark + Brand/Product Name + Specification */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {logoUrl && !logoError ? (
            <div className="h-7 w-9 shrink-0 rounded-md bg-white p-0.5 border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt={`${brandName} logo`}
                onError={() => setLogoError(true)}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ) : brandName ? (
            <div className="h-7 px-1.5 shrink-0 rounded-md bg-[#F3F4F6] text-[#4B5563] text-[9px] font-bold tracking-wider uppercase flex items-center justify-center border border-[#E5E7EB]">
              {brandName.slice(0, 4)}
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {brandName && (
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block truncate">
                  {brandName}
                </span>
              )}
              {isRecommended && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#1B3D34] bg-[#1B3D34]/8 px-1.5 py-0.2 rounded border border-[#1B3D34]/15">
                  <Sparkles className="w-2.5 h-2.5 text-[#F28C28]" />
                  <span>Recommended</span>
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-extrabold text-[#1B3D34] leading-snug truncate">
              {product.name}
            </h4>

            {product.specification ? (
              <p className="text-[11px] text-[#4B5563] leading-tight truncate mt-0.5">
                {product.specification}
              </p>
            ) : product.description ? (
              <p className="text-[11px] text-[#6B7280] leading-tight truncate mt-0.5">
                {product.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: Rate & Unit + Selection State */}
        <div className="shrink-0 text-right space-y-1 pl-1">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-xs sm:text-sm font-black text-[#1B3D34] font-mono">
              ₹{displayRate}
            </span>
            <span className="text-[10px] font-medium text-[#6B7280]">
              /{product.unit}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            {totalComputedCost !== undefined && totalComputedCost > 0 && (
              <span className="text-[10px] font-mono font-bold text-[#F28C28] hidden xs:inline">
                {formatCurrency(totalComputedCost)}
              </span>
            )}

            <div
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-bold transition-colors',
                isSelected
                  ? 'text-[#1B3D34]'
                  : 'text-[#9CA3AF] group-hover:text-[#1B3D34]'
              )}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Selected</span>
                </>
              ) : (
                <span className="font-medium">Select</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MODE B: VISUAL MATERIAL CARD (Tiles, Cladding, Granite, Marble, Finishes)
  // Restrained architectural layout with small, non-dominant thumbnail (~48-56px)
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group relative flex items-center justify-between gap-3 rounded-xl border p-3 sm:p-3.5 text-left transition-all duration-150 select-none cursor-pointer min-h-[64px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] focus-visible:ring-offset-1',
        isSelected
          ? 'border-[#1B3D34] bg-[#F4F7F5] shadow-2xs'
          : 'border-[#E5E7EB] bg-white hover:border-[#1B3D34]/40 hover:bg-[#FAFBF9]',
        className
      )}
    >
      {/* Left: Small Restrained Thumbnail (48-56px desktop, 40-48px mobile) + Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Restrained Thumbnail */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={`${product.name} sample`}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center text-[#9CA3AF]">
              <ImageIcon className="w-5 h-5 stroke-1 text-[#CBD5E1]" />
            </div>
          )}

          {/* Discreet Lightbox Zoom Trigger */}
          {onPreview && imageUrl && !imgError && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(product);
              }}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
              title="Preview surface photograph"
              aria-label={`Preview larger image of ${product.name}`}
            >
              <ZoomIn className="w-3.5 h-3.5 drop-shadow-xs" />
            </button>
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {brandName && (
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider truncate">
                {brandName}
              </span>
            )}
            {isRecommended && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#1B3D34] bg-[#1B3D34]/8 px-1.5 py-0.2 rounded border border-[#1B3D34]/15">
                <Sparkles className="w-2.5 h-2.5 text-[#F28C28]" />
                <span>Recommended</span>
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-[#1B3D34] leading-snug truncate">
            {product.name}
          </h4>

          {/* Architectural Specs Line */}
          {visualSpecs ? (
            <p className="text-[11px] text-[#4B5563] leading-tight truncate">
              {visualSpecs}
            </p>
          ) : null}
        </div>
      </div>

      {/* Right: Rate & Unit + Selection State */}
      <div className="shrink-0 text-right space-y-1 pl-1">
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-xs sm:text-sm font-black text-[#1B3D34] font-mono">
            ₹{displayRate}
          </span>
          <span className="text-[10px] font-medium text-[#6B7280]">
            /{product.unit}
          </span>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          {totalComputedCost !== undefined && totalComputedCost > 0 && (
            <span className="text-[10px] font-mono font-bold text-[#F28C28] hidden xs:inline">
              {formatCurrency(totalComputedCost)}
            </span>
          )}

          <div
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-bold transition-colors',
              isSelected
                ? 'text-[#1B3D34]'
                : 'text-[#9CA3AF] group-hover:text-[#1B3D34]'
            )}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Selected</span>
              </>
            ) : (
              <span className="font-medium">Select</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
