import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useArea } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { useCatalogStore } from '../../../store/useCatalogStore';
import { MaterialProduct } from '../../../types/catalog';
import { ProductVisualCard } from '../../../components/common/ProductVisualCard';
import { ProductImageViewerModal } from '../../../components/common/ProductImageViewerModal';
import { cn } from '../../../utils/cn';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step4Flooring: React.FC = () => {
  const { flooringZones, setFlooringZone } = useWizardStore();
  const area = useArea();
  const { getFlooringRecommendation } = useRecommendations();
  const { getProductsByCategory, getBrandById, getEffectiveProductRate } = useCatalogStore();

  const [activeZoneKey, setActiveZoneKey] = useState<keyof typeof flooringZones>('living');
  const [modalProduct, setModalProduct] = useState<MaterialProduct | null>(null);

  const totalBua = area.totalBUASqFt || 2400;

  const catalogFlooring = getProductsByCategory('flooring');

  const zones: {
    key: keyof typeof flooringZones;
    label: string;
    approxAreaSqFt: number;
    options: {
      label: string;
      rate: number;
      desc: string;
      catalogProductId?: string;
      fallbackProduct?: MaterialProduct;
    }[];
  }[] = [
    {
      key: 'living',
      label: 'Living Room',
      approxAreaSqFt: Math.round(totalBua * 0.25),
      options: [
        {
          label: 'Vitrified Tiles 800x800mm',
          rate: 120,
          desc: 'High-gloss double-charged mirror polish vitrified tiles.',
          catalogProductId: 'prod-kajaria-statuary-gloss',
          fallbackProduct: {
            id: 'prod-kajaria-statuary-gloss',
            brandId: 'brand-kajaria',
            brand: 'Kajaria',
            category: 'flooring',
            name: 'Kajaria Statuario Gloss 800×800mm',
            imageUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&auto=format&fit=crop&q=80',
            specification: 'Luxury High-Gloss',
            unit: 'sq.ft',
            rate: 120,
            rateId: 'fl-vitrified',
            active: true,
            displayOrder: 1,
            metadataJson: { size: '800 × 800 mm', finish: 'High-Gloss Nano Polish', material: 'Double Charged Vitrified' },
          },
        },
        {
          label: 'Granite Slab',
          rate: 220,
          desc: 'Mirror polished natural South Indian granite stone slabs.',
          catalogProductId: 'prod-south-granite-slab',
          fallbackProduct: {
            id: 'prod-south-granite-slab',
            brand: 'South Indian Granite',
            category: 'flooring',
            name: 'Natural Polished Granite Slab',
            imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=400&auto=format&fit=crop&q=80',
            specification: '20mm Polished Stone',
            unit: 'sq.ft',
            rate: 220,
            rateId: 'fl-granite',
            active: true,
            displayOrder: 2,
            metadataJson: { size: 'Gang-saw Cut Slabs', finish: 'Mirror Polish', material: 'Natural Granite' },
          },
        },
        {
          label: 'Italian Marble',
          rate: 450,
          desc: 'Imported Statuario / Botticino marble with diamond polish.',
          catalogProductId: 'prod-italian-marble-slab',
          fallbackProduct: {
            id: 'prod-italian-marble-slab',
            brand: 'Italian Imported',
            category: 'flooring',
            name: 'Italian Botticino Luxury Marble',
            imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
            specification: 'Luxury Imported Marble',
            unit: 'sq.ft',
            rate: 450,
            rateId: 'fl-italian-marble',
            active: true,
            displayOrder: 3,
            metadataJson: { size: 'Custom Slabs', finish: 'Diamond Mirror Polish', material: 'Italian Marble' },
          },
        },
      ],
    },
    {
      key: 'kitchenDining',
      label: 'Kitchen & Dining',
      approxAreaSqFt: Math.round(totalBua * 0.18),
      options: [
        {
          label: 'Vitrified Tiles',
          rate: 110,
          desc: 'Dual-coat vitrified floor tiles with low water absorption.',
          catalogProductId: 'prod-kajaria-urban-grey',
          fallbackProduct: {
            id: 'prod-kajaria-urban-grey',
            brandId: 'brand-kajaria',
            brand: 'Kajaria',
            category: 'flooring',
            name: 'Kajaria Urban Stone Matt 600×600mm',
            imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
            specification: 'Premium Vitrified',
            unit: 'sq.ft',
            rate: 110,
            rateId: 'fl-vitrified',
            active: true,
            displayOrder: 1,
            metadataJson: { size: '600 × 600 mm', finish: 'Matt Finish', material: 'Glazed Vitrified' },
          },
        },
        {
          label: 'Matte Anti-Skid Vitrified',
          rate: 135,
          desc: 'Non-slip matte textured surface for kitchen safety.',
          catalogProductId: 'prod-somany-durastone-flamed',
          fallbackProduct: {
            id: 'prod-somany-durastone-flamed',
            brandId: 'brand-somany',
            brand: 'Somany',
            category: 'flooring',
            name: 'Somany Slip-Resistant Kitchen Tile',
            imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
            specification: 'R10 Anti-Skid',
            unit: 'sq.ft',
            rate: 135,
            rateId: 'fl-vitrified',
            active: true,
            displayOrder: 2,
            metadataJson: { size: '600 × 600 mm', finish: 'Slip-Resistant Matte', material: 'Vitrified' },
          },
        },
        {
          label: 'Granite',
          rate: 195,
          desc: 'Heavy-duty natural granite slabs resistant to spills and high traffic.',
          catalogProductId: 'prod-south-granite-slab',
        },
      ],
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      approxAreaSqFt: Math.round(totalBua * 0.32),
      options: [
        {
          label: 'Vitrified Tiles',
          rate: 105,
          desc: 'Standard 600x600mm vitrified tiles with soft glaze finish.',
          catalogProductId: 'prod-kajaria-urban-grey',
        },
        {
          label: 'Wooden Laminate',
          rate: 180,
          desc: 'AC4 heavy residential German wooden laminate planks.',
          fallbackProduct: {
            id: 'prod-wooden-laminate',
            brand: 'Pergo / Quick-Step',
            category: 'flooring',
            name: 'Natural Oak Timber Laminate Planks',
            imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
            specification: 'AC4 Heavy Residential',
            unit: 'sq.ft',
            rate: 180,
            rateId: 'fl-vitrified',
            active: true,
            displayOrder: 2,
            metadataJson: { size: '1200 × 200 mm Planks', finish: 'Woodgrain Embossed', material: 'High-Density HDF' },
          },
        },
        {
          label: 'Granite',
          rate: 210,
          desc: 'Cool natural granite finish for durable comfort.',
          catalogProductId: 'prod-south-granite-slab',
        },
      ],
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        {
          label: 'Anti-skid Ceramic Tiles',
          rate: 75,
          desc: 'R10 safety certified anti-skid ceramic tiles.',
          fallbackProduct: {
            id: 'prod-kajaria-antiskid-bath',
            brandId: 'brand-kajaria',
            brand: 'Kajaria',
            category: 'flooring',
            name: 'Kajaria Aqua Grip Bathroom Floor Tile',
            imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
            specification: 'R10 Anti-Skid Ceramic',
            unit: 'sq.ft',
            rate: 75,
            rateId: 'fl-vitrified',
            active: true,
            displayOrder: 1,
            metadataJson: { size: '300 × 300 mm', finish: 'Anti-Skid Matte', material: 'Ceramic' },
          },
        },
        {
          label: 'Matte Finish Vitrified',
          rate: 115,
          desc: 'Low-porosity matte vitrified floor tiles.',
          catalogProductId: 'prod-kajaria-urban-grey',
        },
      ],
    },
    {
      key: 'parkingUtility',
      label: 'Parking & Utility',
      approxAreaSqFt: Math.round(totalBua * 0.10),
      options: [
        {
          label: 'Heavy-Duty Parking Tiles',
          rate: 65,
          desc: 'Interlocking 16mm thick heavy vehicular paver tiles.',
          catalogProductId: 'prod-somany-durastone-flamed',
        },
        {
          label: 'Flamed Granite',
          rate: 160,
          desc: 'Thermal flamed rough texture non-slip granite stone.',
          catalogProductId: 'prod-south-granite-slab',
        },
      ],
    },
    {
      key: 'balconies',
      label: 'Balconies',
      approxAreaSqFt: Math.round(totalBua * 0.05),
      options: [
        {
          label: 'Anti-skid Ceramic',
          rate: 70,
          desc: 'Weather-resistant outdoor grade ceramic tiles.',
          catalogProductId: 'prod-somany-durastone-flamed',
        },
        {
          label: 'Wooden Finish Tiles',
          rate: 125,
          desc: 'Exterior timber grain porcelain plank tiles.',
          fallbackProduct: {
            id: 'prod-timber-porcelain',
            brandId: 'brand-somany',
            brand: 'Somany',
            category: 'flooring',
            name: 'Somany Forest Wood Plank Porcelain Tile',
            imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
            specification: 'Weatherproof Outdoor Porcelain',
            unit: 'sq.ft',
            rate: 125,
            rateId: 'fl-vitrified',
            active: true,
            displayOrder: 2,
            metadataJson: { size: '600 × 150 mm Planks', finish: 'Woodgrain Tactile', material: 'Porcelain' },
          },
        },
      ],
    },
  ];

  const currentZone = zones.find((z) => z.key === activeZoneKey) || zones[0];
  const recommendation = getFlooringRecommendation(currentZone.key);
  const selectedOptionLabel = flooringZones[currentZone.key] || recommendation.recommendedValue;

  return (
    <div className="space-y-6 text-left">
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
            STEP 04
          </span>
          <span className="text-[10px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded-full border border-[#1B3D34]/15">
            {recommendation.badgeLabel}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          ARCHITECTURAL TILE & FLOORING FINISHES
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Select surface finishes by zone. View real tile finishes, dimensions, and manufacturer specifications to calculate precise flooring takeoffs.
        </p>
      </div>

      {/* ── ZONE SWITCHER TABS ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#E5E7EB]">
        {zones.map((z) => {
          const isActive = activeZoneKey === z.key;
          const isConfigured = Boolean(flooringZones[z.key]);
          return (
            <button
              key={z.key}
              type="button"
              onClick={() => setActiveZoneKey(z.key)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2',
                isActive
                  ? 'bg-[#1B3D34] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:text-[#1B3D34] hover:bg-[#F8F8F6]'
              )}
            >
              <span>{z.label}</span>
              {isConfigured && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B3D34]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE ZONE SPECIFICATION CARDS ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <div>
            <label className="font-bold text-[#1B3D34] uppercase tracking-wider block">
              {currentZone.label} Finishes
            </label>
            <span className="text-[10px] text-[#6B7280]">
              Visual tile & slab selection for {currentZone.label.toLowerCase()}
            </span>
          </div>
          <span className="font-mono font-extrabold text-[#1B3D34]">
            ~{currentZone.approxAreaSqFt} sq.ft computed
          </span>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {currentZone.options.map((opt) => {
            const isSelected = selectedOptionLabel === opt.label;
            const isRecommended = opt.label === recommendation.recommendedValue;

            // Find matching catalog product
            let matchedProduct = catalogFlooring.find(
              (p) => p.id === opt.catalogProductId || p.name.toLowerCase().includes(opt.label.toLowerCase().slice(0, 8))
            );

            if (!matchedProduct && opt.fallbackProduct) {
              matchedProduct = opt.fallbackProduct;
            }

            // Synthesize fallback product model if not in catalog
            const productModel: MaterialProduct = matchedProduct || {
              id: `flooring-${opt.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              brand: 'Hutty Standard',
              category: 'flooring',
              displayType: 'visual',
              name: opt.label,
              description: opt.desc,
              unit: 'sq.ft',
              rate: opt.rate,
              rateId: 'fl-vitrified',
              active: true,
              displayOrder: 1,
            };

            const brandEntity = getBrandById(productModel.brandId);
            const { rate } = getEffectiveProductRate(productModel);
            const totalComputedCost = Math.round(currentZone.approxAreaSqFt * rate);

            return (
              <ProductVisualCard
                key={opt.label}
                product={productModel}
                brand={brandEntity}
                isSelected={isSelected}
                displayMode="visual"
                onSelect={() => setFlooringZone(currentZone.key, opt.label)}
                onPreview={(p) => setModalProduct(p)}
                isRecommended={isRecommended}
                recommendedReason="Architecturally matched for this living zone"
                effectiveRate={rate}
                totalComputedCost={totalComputedCost}
              />
            );
          })}

          {/* Any newly added Admin custom products in category 'flooring' */}
          {catalogFlooring
            .filter(
              (p) =>
                !currentZone.options.some(
                  (opt) =>
                    opt.catalogProductId === p.id ||
                    opt.label.toLowerCase().trim() === p.name.toLowerCase().trim()
                )
            )
            .map((customProduct) => {
              const isSelected = (flooringZones[currentZone.key] as string) === customProduct.name;
              const brandEntity = getBrandById(customProduct.brandId);
              const { rate } = getEffectiveProductRate(customProduct);
              const totalComputedCost = Math.round(currentZone.approxAreaSqFt * rate);

              return (
                <ProductVisualCard
                  key={customProduct.id}
                  product={customProduct}
                  brand={brandEntity}
                  isSelected={isSelected}
                  displayMode="visual"
                  onSelect={() => setFlooringZone(currentZone.key, customProduct.name as any)}
                  onPreview={(p) => setModalProduct(p)}
                  effectiveRate={rate}
                  totalComputedCost={totalComputedCost}
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
            const matchingOption = currentZone.options.find(
              (o) => o.catalogProductId === modalProduct.id || o.label.toLowerCase().includes(modalProduct.name.toLowerCase().slice(0, 8))
            );
            setFlooringZone(currentZone.key, matchingOption ? matchingOption.label : modalProduct.name);
          }}
        />
      )}

      {/* ── CALCULATION TRANSPARENCY: FLOORING & TILES ── */}
      <HowWeCalculatedThis stepKey="flooring" className="mt-4" />
    </div>
  );
};
