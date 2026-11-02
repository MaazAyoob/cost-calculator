import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { ConstructionPackageId } from '../../../calculation-engine/data/packageConfig';
import { Building2, Layers, Sparkles, Check, Info, ShieldCheck, Ruler } from 'lucide-react';

const STRUCTURAL_SYSTEMS = [
  {
    id: 'rcc_framed',
    label: 'RCC Framed Structure',
    tag: 'Recommended for G+1 & Above',
    desc: 'Reinforced concrete columns, footings, and beams carry load. Enables flexible room walls.',
  },
  {
    id: 'load_bearing',
    label: 'Load-Bearing Masonry',
    tag: 'Economical for Ground Floor',
    desc: 'Thick masonry walls carry roof loads directly. Lower steel consumption; best for single level.',
  },
  {
    id: 'not_sure',
    label: 'Not sure — Recommend for me',
    tag: 'Automated Recommendation',
    desc: 'We will automatically apply standard RCC Framed design based on your floor count.',
  },
];

const WALLING_TYPES = [
  {
    id: 'Concrete Blocks',
    label: 'Solid Concrete Blocks (6")',
    desc: 'Bangalore market standard. High compressive strength, fast execution, durable.',
  },
  {
    id: 'Clay Bricks',
    label: 'Red Clay Bricks',
    desc: 'Traditional clay-fired bricks with excellent thermal insulation and acoustic comfort.',
  },
  {
    id: 'AAC Blocks',
    label: 'AAC Lightweight Blocks',
    desc: 'Autoclaved aerated concrete blocks. Reduces dead weight and structural foundation load.',
  },
];

const SPECIFICATION_TIERS: {
  id: ConstructionPackageId;
  name: string;
  tagline: string;
  badge?: string;
  features: string[];
}[] = [
    {
      id: 'STANDARD',
      name: 'Standard Specification',
      tagline: 'Reliable, durable & economical essentials',
      features: [
        'Vitrified 2×2 tile flooring',
        'Standard 3-track UPVC sliding windows',
        'Anchor / GreatWhite modular electricals',
        'Cera / Parryware sanitary fittings',
        'Tractor emulsion interior paint',
      ],
    },
    {
      id: 'PREMIUM',
      name: 'Premium Specification',
      tagline: 'The most popular choice for modern residences',
      badge: 'Recommended',
      features: [
        'GVT Glazed Vitrified 4×2 designer tiles',
        'Heavy-gauge Kommerling / Schuco UPVC windows',
        'Finolex fire-retardant wiring & Schneider switches',
        'Jaquar / Kohler contemporary bath fittings',
        'Asian Paints Royale luxury acrylic emulsion',
      ],
    },
    {
      id: 'LUXURY',
      name: 'Luxury Specification',
      tagline: 'Architectural opulence and smart living',
      features: [
        'Italian composite marble & rich wooden flooring',
        'Slim-profile thermal break architectural aluminium',
        'Polycab green copper wiring & smart home automation',
        'Grohe / TOTO premium designer sanitaryware',
        'PU finish wood polish & Royale Aspira interior',
      ],
    },
  ];

export const Stage5ConstructionStyle: React.FC = () => {
  const store = useWizardStore();
  const {
    selectedPackage,
    materialBrands,
    setSelectedPackage,
    setMasonryMaterial,
  } = store;

  const [structuralSystem, setStructuralSystem] = useState<string>('rcc_framed');
  const [selectedWalling, setSelectedWalling] = useState<string>(
    materialBrands.masonry || 'Concrete Blocks'
  );
  const [drawingsReady, setDrawingsReady] = useState<string>('in_progress');

  const handleTierSelect = (tierId: ConstructionPackageId) => {
    setSelectedPackage(tierId, true);
  };

  const handleWallingSelect = (walling: string) => {
    setSelectedWalling(walling);
    setMasonryMaterial(walling);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Building2 className="w-3 h-3 text-[#C66B4E]" />
          <span>STAGE 5 OF 8 &bull; CONSTRUCTION STYLE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          What type of construction are you considering?
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B]">
          Choose your structural framing system, walling materials, and finish level. You can choose "Not sure" if you want our recommended defaults.
        </p>
      </div>

      {/* 1. Structural Engineering System */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#18211E]">
          1. What structural frame would you prefer?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STRUCTURAL_SYSTEMS.map((sys) => {
            const isSelected = structuralSystem === sys.id;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => setStructuralSystem(sys.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30 hover:bg-[#F8F9F7]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#C66B4E] font-bold uppercase">
                      {sys.tag}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#183B32]" />}
                  </div>
                  <h4 className="text-sm font-bold text-[#183B32] font-heading">{sys.label}</h4>
                </div>
                <p className="text-[11px] text-[#687770] leading-relaxed">
                  {sys.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Walling Material Type */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32]">
          2. What kind of walling would you prefer?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WALLING_TYPES.map((wall) => {
            const isSelected = selectedWalling === wall.id;
            return (
              <button
                key={wall.id}
                type="button"
                onClick={() => handleWallingSelect(wall.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30 hover:bg-[#F8F9F7]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB] bg-white'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#183B32]">{wall.label}</span>
                  <span className="block text-[11px] text-[#687770] leading-snug mt-0.5">
                    {wall.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Specification / Quality Tier (Standard, Premium, Luxury) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32]">
            3. What level of finish are you looking for?
          </label>
          <span className="text-[11px] text-[#687770]">Determines finishes, fixtures &amp; material rates</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
          {SPECIFICATION_TIERS.map((tier) => {
            const isSelected = (selectedPackage || 'PREMIUM') === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleTierSelect(tier.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${isSelected
                  ? 'border-2 border-[#183B32] bg-white shadow-md'
                  : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/40 hover:bg-[#F8F9F7]'
                  }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#183B32] text-white flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 text-[#C66B4E]" />
                    {tier.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-heading text-[#183B32]">
                      {tier.name}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#183B32] bg-[#183B32]' : 'border-[#CBD5CB]'
                      }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#687770] leading-snug">
                    {tier.tagline}
                  </p>

                  <div className="pt-2 border-t border-[#E5E7EB] space-y-1.5">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#202522]">
                        <Check className="w-3 h-3 text-[#183B32] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`py-1.5 px-3 rounded-xl text-center text-xs font-bold transition-all ${isSelected
                  ? 'bg-[#183B32] text-white'
                  : 'bg-[#F8F8F6] text-[#4B5563]'
                  }`}>
                  {isSelected ? 'Active Tier' : 'Select Tier'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Structural Drawings Availability */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#183B32]">
          4. Do you have structural drawings?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { id: 'yes', label: 'Yes, structural engineering drawings ready', desc: 'Column schedules and beam reinforcement details confirmed' },
          ].map((item) => {
            const isSelected = drawingsReady === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDrawingsReady(item.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'border-[#183B32] bg-[#E8EFE9]' : 'border-[#E5E7EB] bg-white hover:border-[#183B32]/30'
                  }`}
              >
                <div>
                  <span className="block text-xs font-bold text-[#183B32]">{item.label}</span>
                  <span className="block text-[10px] text-[#687770]">{item.desc}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#183B32] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
