import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { useCatalogStore } from '../../../store/useCatalogStore';
import { MaterialProduct } from '../../../types/catalog';
import { ProductVisualCard } from '../../../components/common/ProductVisualCard';
import { ProductImageViewerModal } from '../../../components/common/ProductImageViewerModal';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step3CoreMaterials: React.FC = () => {
  const { materialBrands, setCoreMaterials } = useWizardStore();
  const quantities = useQuantities();
  const { getCoreMaterialsRecommendation } = useRecommendations();
  const recommendedCore = getCoreMaterialsRecommendation();

  const { getProductsByCategory, getBrandById, getEffectiveProductRate } = useCatalogStore();
  const [modalProduct, setModalProduct] = useState<MaterialProduct | null>(null);

  const steelTonnes = quantities.steelTonnes || 0;
  const cementBags = quantities.cementBags || 0;

  const steelProducts = getProductsByCategory('steel');
  const cementProducts = getProductsByCategory('cement');
  const masonryProducts = getProductsByCategory('masonry');

  // Fallback map helper if custom product selected
  const resolveSteelBrandKey = (product: MaterialProduct): string => {
    if (product.brand && product.brand.trim()) return product.brand;
    const name = (product.name || '').toLowerCase();
    if (name.includes('jsw')) return 'JSW Neosteel';
    if (name.includes('indus')) return 'Indus TMT';
    return 'Tata Tiscon';
  };

  const resolveCementBrandKey = (product: MaterialProduct): string => {
    if (product.brand && product.brand.trim()) return product.brand;
    const name = (product.name || '').toLowerCase();
    if (name.includes('acc')) return 'ACC Cement';
    if (name.includes('dalmia')) return 'Dalmia Bharat';
    return 'UltraTech';
  };

  const resolveMasonryKey = (product: MaterialProduct): string => {
    const name = (product.name + ' ' + (product.specification || '')).toLowerCase();
    if (name.includes('clay') || name.includes('brick')) return 'Clay Bricks';
    if (name.includes('concrete')) return 'Concrete Blocks';
    return 'AAC Blocks';
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
            STEP 03
          </span>
          <span className="text-[10px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded-full border border-[#1B3D34]/15">
            {recommendedCore.badge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          CORE STRUCTURAL MATERIALS
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select structural TMT steel, Portland cement, and masonry block systems. Unit rates reflect manufacturer grade and specifications.
        </p>
      </div>

      {/* ── 1. STRUCTURAL STEEL ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <div>
            <label className="font-bold text-[#1B3D34] uppercase tracking-wider block">
              TMT Rebar Steel
            </label>
            <span className="text-[10px] text-[#6B7280]">
              IS 1786 primary structural reinforcement
            </span>
          </div>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {steelTonnes > 0 ? `${steelTonnes} Tonnes Required` : '0 T'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {steelProducts.map((product) => {
            const brandKey = resolveSteelBrandKey(product);
            const brandEntity = getBrandById(product.brandId);
            const isSelected = (!materialBrands.steel && brandKey === recommendedCore.steel) || materialBrands.steel === brandKey;
            const isRecommended = brandKey === recommendedCore.steel;
            const { rate } = getEffectiveProductRate(product);
            const totalItemCost = Math.round(steelTonnes * 1000 * rate);

            return (
              <ProductVisualCard
                key={product.id}
                product={product}
                brand={brandEntity}
                isSelected={isSelected}
                displayMode="compact"
                onSelect={() => {
                  setCoreMaterials(
                    brandKey,
                    (materialBrands.cement || recommendedCore.cement) as any,
                    materialBrands.masonry as any
                  );
                }}
                onPreview={(p) => setModalProduct(p)}
                isRecommended={isRecommended}
                recommendedReason="Recommended for optimal seismic structural performance"
                effectiveRate={rate}
                totalComputedCost={steelTonnes > 0 ? totalItemCost : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* ── 2. PORTLAND CEMENT ── */}
      <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <div>
            <label className="font-bold text-[#1B3D34] uppercase tracking-wider block">
              Portland Cement (50 kg Bag)
            </label>
            <span className="text-[10px] text-[#6B7280]">
              OPC 53 / PPC certified high early compressive strength
            </span>
          </div>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {cementBags > 0 ? `${cementBags.toLocaleString()} Bags Required` : '0 Bags'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cementProducts.map((product) => {
            const brandKey = resolveCementBrandKey(product);
            const brandEntity = getBrandById(product.brandId);
            const isSelected = (!materialBrands.cement && brandKey === recommendedCore.cement) || materialBrands.cement === brandKey;
            const isRecommended = brandKey === recommendedCore.cement;
            const { rate } = getEffectiveProductRate(product);
            const totalItemCost = Math.round(cementBags * rate);

            return (
              <ProductVisualCard
                key={product.id}
                product={product}
                brand={brandEntity}
                isSelected={isSelected}
                displayMode="compact"
                onSelect={() => {
                  setCoreMaterials(
                    (materialBrands.steel || recommendedCore.steel) as any,
                    brandKey,
                    materialBrands.masonry as any
                  );
                }}
                onPreview={(p) => setModalProduct(p)}
                isRecommended={isRecommended}
                recommendedReason="Engineered for water-shield slab casting"
                effectiveRate={rate}
                totalComputedCost={cementBags > 0 ? totalItemCost : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* ── 3. WALL / MASONRY MATERIAL ── */}
      <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <div>
            <label className="font-bold text-[#1B3D34] uppercase tracking-wider block">
              Wall / Masonry Material
            </label>
            {quantities.wallVolumeCuM > 0 && (
              <span className="text-[10px] text-[#4B5563]">
                Net Wall Area: {quantities.netWallAreaSqFt} sq.ft &bull; Masonry Vol: {quantities.wallVolumeCuM} m³
              </span>
            )}
          </div>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            {quantities.masonryUnitsCount > 0 ? `${quantities.masonryUnitsCount.toLocaleString()} ${quantities.masonryUnit || 'Units'} Required` : '0 Units'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {masonryProducts.map((product) => {
            const masonryKey = resolveMasonryKey(product);
            const brandEntity = getBrandById(product.brandId);
            const isSelected = (!materialBrands.masonry && product.name.toLowerCase().includes(recommendedCore.masonry.split(' ')[0].toLowerCase())) || materialBrands.masonry === masonryKey;
            const isRecommended = product.name.toLowerCase().includes(recommendedCore.masonry.split(' ')[0].toLowerCase());
            const { rate } = getEffectiveProductRate(product);
            const count = isSelected ? quantities.masonryUnitsCount : 0;
            const totalItemCost = Math.round(count * rate);

            return (
              <ProductVisualCard
                key={product.id}
                product={product}
                brand={brandEntity}
                isSelected={isSelected}
                displayMode="compact"
                onSelect={() => {
                  setCoreMaterials(
                    (materialBrands.steel || recommendedCore.steel) as any,
                    (materialBrands.cement || recommendedCore.cement) as any,
                    masonryKey
                  );
                }}
                onPreview={(p) => setModalProduct(p)}
                isRecommended={isRecommended}
                recommendedReason="Thermal insulation & lightweight load distribution"
                effectiveRate={rate}
                totalComputedCost={count > 0 ? totalItemCost : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* ── IMAGE LIGHTBOX MODAL ── */}
      {modalProduct && (
        <ProductImageViewerModal
          product={modalProduct}
          brand={getBrandById(modalProduct.brandId)}
          onClose={() => setModalProduct(null)}
          onSelect={() => {
            if (modalProduct.category === 'steel') {
              setCoreMaterials(resolveSteelBrandKey(modalProduct), (materialBrands.cement || recommendedCore.cement) as any, materialBrands.masonry as any);
            } else if (modalProduct.category === 'cement') {
              setCoreMaterials((materialBrands.steel || recommendedCore.steel) as any, resolveCementBrandKey(modalProduct), materialBrands.masonry as any);
            } else if (modalProduct.category === 'masonry') {
              setCoreMaterials((materialBrands.steel || recommendedCore.steel) as any, (materialBrands.cement || recommendedCore.cement) as any, resolveMasonryKey(modalProduct));
            }
          }}
        />
      )}

      {/* ── CALCULATION TRANSPARENCY: RCC & STRUCTURE ── */}
      <HowWeCalculatedThis stepKey="structure" className="mt-4" />

      {/* ── CALCULATION TRANSPARENCY: WALLS & MASONRY ── */}
      <HowWeCalculatedThis stepKey="masonry" className="mt-2" />
    </div>
  );
};
