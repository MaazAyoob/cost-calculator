import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Layers, ShieldCheck, Award } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';
import { CONSTRUCTION_PACKAGES } from '../../../calculation-engine/data/packageConfig';

export const PackagesSection: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedPackage } = useWizardStore();

  const handleSelectPackage = (pkgId: 'STANDARD' | 'PREMIUM' | 'LUXURY') => {
    setSelectedPackage(pkgId, true);
    navigate('/calculator');
  };

  const specsComparison = [
    {
      trade: 'Structural Steel',
      standard: 'Indus TMT (Fe 500D)',
      premium: 'Tata Tiscon (Fe 550D Super Ductile)',
      luxury: 'Tata Tiscon (Fe 550D Corrosion Resistant)',
    },
    {
      trade: 'Portland Cement',
      standard: 'Dalmia Bharat / ACC 53 Grade',
      premium: 'UltraTech Super / Weather Plus',
      luxury: 'UltraTech RMC Matrix (M25 Grade)',
    },
    {
      trade: 'Living Flooring',
      standard: 'Vitrified Tiles (800×800mm)',
      premium: 'Polished Granite / Large Format GVT',
      luxury: 'Imported Botticino Italian Marble',
    },
    {
      trade: 'Main Door',
      standard: 'Teak Frame + Heavy Flush Shutter',
      premium: 'Premium Teakwood Frame & Panel',
      luxury: 'Custom Carved Solid Burma Teak',
    },
    {
      trade: 'Windows',
      standard: '2-Track Heavy Anodised Aluminium',
      premium: 'High-Grade Soundproof uPVC',
      luxury: 'Double-Glazed System Aluminium',
    },
    {
      trade: 'Electrical MEP',
      standard: 'Anchor / Havells FRLS Wiring',
      premium: 'Finolex / V-Guard Multi-Strand FRLS',
      luxury: 'Polycab / Schneider Smart Ready MEP',
    },
    {
      trade: 'Bathroom Fixtures',
      standard: 'Cera / Hindware Ceramic Sets',
      premium: 'Jaquar / Kohler Concealed Diverters',
      luxury: 'Toto / Grohe Thermostatic Systems',
    },
    {
      trade: 'Interior Paint',
      standard: 'Asian Paints Tractor Emulsion',
      premium: 'Asian Paints Premium Washable Emulsion',
      luxury: 'Asian Paints Royale Luxury Silk + PU',
    },
  ];

  return (
    <section id="packages" className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/20 px-3.5 py-1 rounded-full">
            <Layers className="w-3 h-3 text-[#F28C28]" />
            <span>3 CONSTRUCTION STANDARDS</span>
          </div>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.1]">
            Standard, Premium, or Luxury.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Choose a construction standard that matches your budget and quality vision. Every material and finish is fully customizable inside the calculator.
          </p>
        </div>

        {/* ── 3 CONSTRUCTION PACKAGE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
          
          {/* STANDARD CARD */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 lg:p-7 flex flex-col justify-between shadow-2xs tactile-card space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4B5563] bg-[#F8F8F6] px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                  ESSENTIAL QUALITY
                </span>
                <span className="text-xs font-mono font-bold text-[#4B5563]">TIER 01</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-[#1B3D34] font-heading">Standard</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Practical, cost-conscious construction focused on essential structural quality and value.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs text-[#4B5563]">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Indus TMT &bull; Dalmia Bharat Cement</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Vitrified 800×800mm living flooring</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Aluminium 2-track window frames</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span>Cera / Hindware sanitaryware</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => handleSelectPackage('STANDARD')}
                className="w-full hutty-btn-secondary py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Calculate with Standard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PREMIUM CARD (RECOMMENDED) */}
          <div className="bg-white rounded-2xl border-2 border-[#1B3D34] p-6 lg:p-7 flex flex-col justify-between shadow-md tactile-card space-y-6 relative overflow-hidden ring-4 ring-[#1B3D34]/5">
            {/* Recommended Pill */}
            <div className="absolute top-0 right-0 bg-[#F28C28] text-[#1B3D34] text-[9px] font-mono font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#1B3D34]" />
              <span>MOST POPULAR</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded-md border border-[#1B3D34]/20">
                  RECOMMENDED STANDARD
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-[#1B3D34] font-heading flex items-center gap-2">
                  <span>Premium</span>
                  <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Better materials, improved finishes and upgraded fixtures for a higher-quality long-term home.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs text-[#1B3D34] font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Tata Tiscon Fe 550D &bull; UltraTech Concrete</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Polished Granite / Large format GVT</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>High-grade soundproof uPVC windows</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Jaquar / Kohler concealed diverters</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => handleSelectPackage('PREMIUM')}
                className="w-full hutty-btn-primary py-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Calculate with Premium</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
              </button>
            </div>
          </div>

          {/* LUXURY CARD */}
          <div className="bg-[#1B3D34] text-white rounded-2xl border border-[#1B3D34] p-6 lg:p-7 flex flex-col justify-between shadow-sm tactile-card space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28] bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                  REFINED FINISH
                </span>
                <span className="text-xs font-mono font-bold text-white/70">TIER 03</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white font-heading">Luxury</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  High-end materials, imported stones, premium fixtures and greater architectural customization.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/15 text-xs text-white/90">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Tata Tiscon Fe 550D &bull; UltraTech RMC</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Imported Italian Botticino marble</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Solid Burma Teak custom carved doors</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>Toto / Grohe thermostatic bath suites</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <button
                type="button"
                onClick={() => handleSelectPackage('LUXURY')}
                className="w-full bg-white text-[#1B3D34] hover:bg-[#F8F8F6] py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Calculate with Luxury</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
              </button>
            </div>
          </div>

        </div>

        {/* ── DETAILED SPECIFICATION COMPARISON MATRIX ── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden text-left">
          <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1B3D34] font-heading">
                Side-by-Side Trade Matrix
              </h3>
              <p className="text-xs text-[#4B5563]">
                Physical quantity measurements remain deterministic; rates and brands scale cleanly by standard.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.06)] px-2.5 py-1 rounded border border-[#1B3D34]/15 hidden sm:inline-block">
              ZERO ARBITRARY MULTIPLIERS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs">
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#4B5563] w-1/4">
                    Trade / Category
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1B3D34] w-1/4">
                    Standard
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1B3D34] bg-[rgba(27,61,52,0.06)] border-x border-[#1B3D34]/20 w-1/4">
                    <div className="flex items-center gap-1.5">
                      <span>Premium</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1B3D34] w-1/4">
                    Luxury
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {specsComparison.map((row) => (
                  <tr key={row.trade} className="hover:bg-[rgba(27,61,52,0.02)] transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#1B3D34]">
                      {row.trade}
                    </td>
                    <td className="p-4 sm:p-5 text-[#4B5563]">
                      {row.standard}
                    </td>
                    <td className="p-4 sm:p-5 font-semibold text-[#1B3D34] bg-[rgba(27,61,52,0.03)] border-x border-[#1B3D34]/20">
                      {row.premium}
                    </td>
                    <td className="p-4 sm:p-5 text-[#4B5563]">
                      {row.luxury}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 sm:p-6 bg-[#F8F8F6] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#4B5563]">
              * Specifications can be mixed and customized in steps 3–10 of the calculator.
            </span>
            <button
              type="button"
              onClick={() => handleSelectPackage('PREMIUM')}
              className="hutty-btn-primary text-xs font-bold px-6 py-2.5 rounded-xl shrink-0 cursor-pointer shadow-xs"
            >
              <span>Launch Calculator &rarr;</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
