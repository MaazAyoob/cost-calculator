import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const PackagesSection: React.FC = () => {
  const navigate = useNavigate();

  const packages = [
    {
      name: 'Essential Specification',
      tagline: 'Standard structural safety with reliable national brands.',
      rate: '₹2,200',
      unit: '/ sq.ft',
      popular: false,
      specs: [
        { label: 'Structural Steel', val: 'JSW Neosteel Fe 500D TMT' },
        { label: 'Cement Grade', val: 'ACC / Dalmia PPC 53 Grade' },
        { label: 'Wall Masonry', val: 'AAC Lightweight Blocks (6 inch)' },
        { label: 'Flooring', val: 'Vitrified Tiles (800×800mm)' },
        { label: 'Sanitaryware', val: 'Cera / Hindware CP Fittings' },
        { label: 'Internal Paint', val: 'Asian Paints Tractor Emulsion' },
        { label: 'Main Door', val: 'Solid Hardwood Flush Door' },
      ],
    },
    {
      name: 'Premium Specification',
      tagline: 'High-grade architectural finishes with enhanced durability.',
      rate: '₹2,850',
      unit: '/ sq.ft',
      popular: true,
      specs: [
        { label: 'Structural Steel', val: 'Tata Tiscon 550D Fe High Ductility' },
        { label: 'Cement Grade', val: 'UltraTech Super PPC / OPC 53' },
        { label: 'Wall Masonry', val: 'Aerated AAC Blocks + Polymer Mortar' },
        { label: 'Flooring', val: 'GVT Vitrified / Jet Black Granite' },
        { label: 'Sanitaryware', val: 'Jaquar / Kohler Concealed Fittings' },
        { label: 'Internal Paint', val: 'Asian Paints Royale Luxury Emulsion' },
        { label: 'Main Door', val: 'Seasoned Burma Teakwood Frame' },
      ],
    },
    {
      name: 'Luxury Specification',
      tagline: 'Bespoke residences with imported stones and custom joinery.',
      rate: '₹3,600',
      unit: '/ sq.ft',
      popular: false,
      specs: [
        { label: 'Structural Steel', val: 'Tata Tiscon 550D Corrosion Resistant' },
        { label: 'Cement Grade', val: 'UltraTech Ready Mix Concrete (M25)' },
        { label: 'Wall Masonry', val: 'Precision AAC + Acoustical Insulation' },
        { label: 'Flooring', val: 'Imported Italian Botticino Marble' },
        { label: 'Sanitaryware', val: 'Toto / Grohe Thermostatic Systems' },
        { label: 'Internal Paint', val: 'Royale Aspira Silk + PU Polish' },
        { label: 'Main Door', val: 'Custom Carved Solid Teakwood' },
      ],
    },
  ];

  return (
    <section id="packages" className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Construction Specifications
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
            Transparent construction specification tiers.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed">
            Compare material grades and finishes. Every parameter can be individually customized inside the step-by-step calculator.
          </p>
        </div>

        {/* 3 Columns with Subtle Separators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 sm:p-9 flex flex-col justify-between text-left space-y-8 transition-all ${
                pkg.popular
                  ? 'bg-white border-2 border-[#1F4B43] shadow-sm relative'
                  : 'bg-[#F7F7F5] border border-[#E5E7EB]'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-md bg-[#1F4B43] text-white text-[10px] font-bold uppercase tracking-wider">
                  Most Selected Grade
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#172033]">{pkg.name}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 pb-4 border-b border-[#E5E7EB]">
                  <span className="text-3xl font-bold text-[#172033]">{pkg.rate}</span>
                  <span className="text-xs text-[#667085] font-semibold">{pkg.unit} indicative base</span>
                </div>

                {/* Specs List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                    Material Specifications:
                  </span>
                  <ul className="space-y-2.5 text-xs text-[#172033]">
                    {pkg.specs.map((item, sIdx) => (
                      <li key={sIdx} className="flex items-start justify-between gap-2 border-b border-[#E5E7EB]/50 pb-1.5">
                        <span className="text-[#667085]">{item.label}</span>
                        <span className="font-semibold text-right text-[#172033]">{item.val}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    useWizardStore.getState().startNewProject();
                    useWizardStore.setState({
                      qualityTier: pkg.name.split(' ')[0] as any,
                    });
                    navigate('/calculator');
                  }}
                  className={`w-full py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pkg.popular
                      ? 'bg-[#1F4B43] hover:bg-[#163731] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-[#172033] border border-[#E5E7EB]'
                  }`}
                >
                  Estimate in {pkg.name.split(' ')[0]} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

