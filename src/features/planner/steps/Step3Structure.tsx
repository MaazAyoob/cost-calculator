import React from 'react';
import {
  useWizardStore,
  QualityTier,
  MaterialBrandSelection,
} from '../../../store/useWizardStore';
import { useQuantities, useBudgetResult } from '../../../store/useCalculationStore';
import { ConstructionPackageId } from '../../../calculation-engine/data/packageConfig';
import {
  Building2,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
  Hammer,
  Boxes,
  Info,
} from 'lucide-react';

interface QualityTierCard {
  id: QualityTier;
  pkgId: ConstructionPackageId;
  label: string;
  tagline: string;
  desc: string;
  specs: string;
  recommended?: boolean;
}

const TIER_OPTIONS: QualityTierCard[] = [
  {
    id: 'Essential',
    pkgId: 'STANDARD',
    label: 'Standard Build',
    tagline: 'Reliable & Cost-Effective',
    desc: 'Solid building quality meeting all Indian Standards with dependable, cost-effective materials.',
    specs: 'Fe500D TMT &bull; ACC/Dalmia Cement &bull; Concrete Blocks',
  },
  {
    id: 'Premium',
    pkgId: 'PREMIUM',
    label: 'Premium Build',
    tagline: 'Hutty Recommended',
    desc: 'Top-brand materials chosen for long-term strength, crack resistance, and superior durability.',
    specs: 'Tata Tiscon Fe550D &bull; UltraTech 53G &bull; Solid 6" Blocks',
    recommended: true,
  },
  {
    id: 'Luxury',
    pkgId: 'LUXURY',
    label: 'Luxury Residence',
    tagline: 'Architectural Grade',
    desc: 'Highest grade materials with premium finishes, enhanced insulation, and designer selections.',
    specs: 'Tata Tiscon Super-Ductile &bull; UltraTech Super &bull; Thermal AAC',
  },
];

const STEEL_OPTIONS = [
  { id: 'Tata Tiscon', label: 'Tata Tiscon Fe550D', desc: 'Primary virgin steel rebar with high earthquake ductility' },
  { id: 'JSW Neosteel', label: 'JSW Neosteel Fe550D', desc: 'High yield strength with uniform ribbed concrete bonding' },
  { id: 'Indus TMT', label: 'Indus TMT Fe500D', desc: 'Dependable value choice meeting BIS certification' },
];

const CEMENT_OPTIONS = [
  { id: 'UltraTech', label: 'UltraTech 53G / Super', desc: 'India’s leading cement with high early compressive strength' },
  { id: 'ACC Cement', label: 'ACC Concrete+ / F2R', desc: 'Consistent mix design with low thermal cracking' },
  { id: 'Dalmia Bharat', label: 'Dalmia Bharat Composite', desc: 'Corrosion resistant slag formulation for durable slabs' },
];

const MASONRY_OPTIONS = [
  { id: 'Concrete Blocks', label: 'Solid Concrete Blocks (6" & 4")', desc: 'Most popular in Bangalore: excellent structural load bearing' },
  { id: 'AAC Blocks', label: 'AAC Lightweight Blocks', desc: 'Thermal insulation, reduced dead-load and faster construction' },
  { id: 'Clay Bricks', label: 'Wire-Cut Clay Bricks', desc: 'Traditional red kiln bricks with high thermal mass' },
];

export const Step3Structure: React.FC = () => {
  const store = useWizardStore();
  const {
    qualityTier,
    selectedPackage,
    materialBrands,
    setSelectedPackage,
    setQualityTier,
    setCoreMaterials,
    setMasonryMaterial,
  } = store;

  const quantities = useQuantities();
  const budget = useBudgetResult();

  const currentTier = qualityTier || 'Premium';
  const currentSteel = materialBrands?.steel || 'Tata Tiscon';
  const currentCement = materialBrands?.cement || 'UltraTech';
  const currentMasonry = materialBrands?.masonry || 'Concrete Blocks';

  const handleSelectTier = (opt: QualityTierCard) => {
    setQualityTier(opt.id);
    setSelectedPackage(opt.pkgId, true);
  };

  const handleSelectSteel = (steel: string) => {
    setCoreMaterials(steel, currentCement, currentMasonry);
  };

  const handleSelectCement = (cement: string) => {
    setCoreMaterials(currentSteel, cement, currentMasonry);
  };

  const handleSelectMasonry = (masonry: string) => {
    setMasonryMaterial(masonry);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF4E8] border border-[#EADBBD] text-[11px] font-bold text-[#C5A46D]">
          <Building2 className="w-3.5 h-3.5 text-[#C5A46D]" />
          <span>STEP 03 OF 05 &bull; QUALITY &amp; MATERIALS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Choose your construction quality.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
          Select your building quality tier and preferred brands for steel, cement, and walls.
        </p>
      </div>

      {/* 1. Quality / Specification Tier Cards */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>1. Construction Quality Tier</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIER_OPTIONS.map((opt) => {
            const isSelected = currentTier === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectTier(opt)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
                }`}
              >
                {opt.recommended && (
                  <div className="absolute top-0 right-0 bg-[#C66B4E] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#18211E] font-heading">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#C66B4E]" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#C66B4E] block">{opt.tagline}</span>
                  <p className="text-[11px] text-[#66716B] leading-relaxed pt-1">{opt.desc}</p>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] text-[10px] text-[#183B32] font-medium">
                  {opt.specs}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Core Material Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Steel Rebar */}
        <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#18211E] flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Steel Rebar (IS 1786)</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded">
              {(quantities.steelTonnes || 6.91).toFixed(2)} Tonnes
            </span>
          </div>

          <div className="space-y-1.5">
            {STEEL_OPTIONS.map((st) => {
              const isSelected = currentSteel === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectSteel(st.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected ? 'border-[#183B32] bg-[#E8EFE9] font-bold text-[#183B32]' : 'border-[#E5E7EB] hover:bg-[#F8F8F6] text-[#66716B]'
                  }`}
                >
                  <div>
                    <span className="block font-semibold text-[#18211E]">{st.label}</span>
                    <span className="block text-[10px] text-[#66716B]">{st.desc}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cement */}
        <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#18211E] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
              <span>Cement (IS 269)</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded">
              {(quantities.cementBags || 864).toLocaleString()} Bags
            </span>
          </div>

          <div className="space-y-1.5">
            {CEMENT_OPTIONS.map((cm) => {
              const isSelected = currentCement === cm.id;
              return (
                <button
                  key={cm.id}
                  type="button"
                  onClick={() => handleSelectCement(cm.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected ? 'border-[#183B32] bg-[#E8EFE9] font-bold text-[#183B32]' : 'border-[#E5E7EB] hover:bg-[#F8F8F6] text-[#66716B]'
                  }`}
                >
                  <div>
                    <span className="block font-semibold text-[#18211E]">{cm.label}</span>
                    <span className="block text-[10px] text-[#66716B]">{cm.desc}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C66B4E] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Wall Masonry Material */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#18211E] flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-[#C66B4E]" />
            <span>Wall Masonry Blocks / Bricks</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-[#183B32] bg-[#E8EFE9] px-2 py-0.5 rounded">
            IS 2185 Certified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MASONRY_OPTIONS.map((ms) => {
            const isSelected = currentMasonry === ms.id;
            return (
              <button
                key={ms.id}
                type="button"
                onClick={() => handleSelectMasonry(ms.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs' : 'border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#18211E]">{ms.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C66B4E]" />}
                </div>
                <span className="text-[10px] text-[#66716B] block leading-tight">{ms.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reassurance Banner */}
      <div className="p-3 bg-[#E8EFE9] rounded-xl border border-[#B7CDBB] flex items-center gap-2.5 text-xs text-[#183B32]">
        <ShieldCheck className="w-4 h-4 text-[#347A62] shrink-0" />
        <span>
          Physical steel and cement quantities are governed strictly by Indian civil engineering standards (IS 456 &amp; IS 1786). Brand selections adjust commercial unit rates.
        </span>
      </div>

    </div>
  );
};