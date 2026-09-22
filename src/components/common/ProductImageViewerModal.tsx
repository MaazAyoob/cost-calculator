import React, { useEffect, useState } from 'react';
import { X, Check, ExternalLink, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MaterialProduct, Brand } from '../../types/catalog';
import { formatCurrency } from '../../utils/cn';
import { resolveImageUrl } from '../../utils/imageUrl';

interface ProductImageViewerModalProps {
  product: MaterialProduct | null;
  brand?: Brand;
  isSelected?: boolean;
  onSelect?: () => void;
  onClose: () => void;
  effectiveRate?: number;
}

export const ProductImageViewerModal: React.FC<ProductImageViewerModalProps> = ({
  product,
  brand,
  isSelected = false,
  onSelect,
  onClose,
  effectiveRate,
}) => {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const brandName = brand?.name || product.brand || 'Premium Manufacturer';
  const displayRate = effectiveRate !== undefined ? effectiveRate : product.rate;
  const tileMeta = product.metadataJson;
  const resolvedImageUrl = resolveImageUrl(product.imageUrl);
  const resolvedLogoUrl = resolveImageUrl(brand?.logoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E5E7EB] flex flex-col max-h-[90vh]"
      >
        {/* ── CLOSE BUTTON ── */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-[#4B5563] hover:text-[#1B3D34] shadow-xs flex items-center justify-center transition-colors border border-[#E5E7EB]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── IMAGE VIEWER ── */}
        <div className="relative w-full aspect-16/9 bg-[#0F172A] flex items-center justify-center overflow-hidden">
          {resolvedImageUrl && !imgError ? (
            <img
              src={resolvedImageUrl}
              alt={`${product.name} visual preview`}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white/60 gap-1">
              <ImageIcon className="w-8 h-8 text-white/40" />
              <div className="font-mono text-xs uppercase tracking-widest">
                Architectural Material Specification
              </div>
            </div>
          )}

          {/* Brand Logo Floating Overlay */}
          {resolvedLogoUrl && !logoError && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-sm border border-[#E5E7EB] flex items-center gap-2">
              <img
                src={resolvedLogoUrl}
                alt={`${brandName} logo`}
                onError={() => setLogoError(true)}
                className="h-5 w-auto max-w-[80px] object-contain"
              />
              <span className="text-xs font-bold text-[#1B3D34]">{brandName}</span>
            </div>
          )}
        </div>

        {/* ── MODAL BODY ── */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
                {product.category} &bull; {brandName}
              </span>
              <h3 id="modal-product-title" className="text-xl sm:text-2xl font-black text-[#1B3D34] tracking-tight mt-0.5 font-heading">
                {product.name}
              </h3>
              {product.specification && (
                <p className="text-xs font-semibold text-[#4B5563] mt-0.5">
                  Specification: {product.specification}
                </p>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-2xl font-black text-[#1B3D34] font-mono block">
                ₹{displayRate}
                <span className="text-xs font-normal text-[#6B7280]"> /{product.unit}</span>
              </span>
              {product.productCode && (
                <span className="text-[10px] font-mono text-[#6B7280]">
                  SKU: {product.productCode}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Tile-Specific Details Grid if Present */}
          {tileMeta && (
            <div className="rounded-2xl bg-[#F8F9FA] p-4 border border-[#E5E7EB] space-y-2">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#1B3D34] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                Architectural Tile Specifications
              </h5>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                {tileMeta.size && (
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase block font-semibold">Dimensions</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{tileMeta.size}</span>
                  </div>
                )}
                {tileMeta.finish && (
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase block font-semibold">Surface Finish</span>
                    <span className="font-bold text-[#1B3D34]">{tileMeta.finish}</span>
                  </div>
                )}
                {tileMeta.material && (
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase block font-semibold">Composition</span>
                    <span className="font-bold text-[#1B3D34]">{tileMeta.material}</span>
                  </div>
                )}
                {tileMeta.colour && (
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase block font-semibold">Colorway</span>
                    <span className="font-bold text-[#1B3D34]">{tileMeta.colour}</span>
                  </div>
                )}
                {tileMeta.thickness && (
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase block font-semibold">Thickness</span>
                    <span className="font-bold text-[#1B3D34] font-mono">{tileMeta.thickness}</span>
                  </div>
                )}
                {tileMeta.coveragePerBoxSqFt && (
                  <div>
                    <span className="text-[10px] text-[#6B7280] uppercase block font-semibold">Box Coverage</span>
                    <span className="font-bold text-[#1B3D34] font-mono">~{tileMeta.coveragePerBoxSqFt} sq.ft</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quality & Brand Guarantee */}
          <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1B3D34]" />
              <span>IS Standard Certified Construction Grade</span>
            </div>
            {brand?.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#1B3D34] font-bold hover:underline"
              >
                <span>Brand Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#FDFDFC] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:text-[#1B3D34] hover:bg-[#F3F4F6] transition-colors"
          >
            Close
          </button>

          {onSelect && (
            <button
              type="button"
              onClick={() => {
                onSelect();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1B3D34] text-white hover:bg-[#153029] shadow-sm transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSelected ? 'Keep Selected' : 'Select This Material'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
