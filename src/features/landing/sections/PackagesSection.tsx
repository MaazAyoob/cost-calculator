import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const PackagesSection: React.FC = () => {
  const navigate = useNavigate();

  const specsComparison = [
    {
      trade: 'Steel',
      essential: 'JSW Neosteel Fe 500D',
      premium: 'Tata Tiscon 550D Super Ductile',
      luxury: 'Tata Tiscon 550D Corrosion Resistant',
    },
    {
      trade: 'Cement',
      essential: 'ACC / Dalmia PPC 53 Grade',
      premium: 'UltraTech Super / Weather Plus',
      luxury: 'UltraTech RMC (M25 Concrete)',
    },
    {
      trade: 'Flooring',
      essential: 'Vitrified Tiles (800×800mm)',
      premium: 'GVT Vitrified / Jet Black Granite',
      luxury: 'Imported Italian Botticino Marble',
    },
    {
      trade: 'Doors',
      essential: 'Hardwood Flush Doors',
      premium: 'Burma Teakwood Frame & Panel',
      luxury: 'Custom Carved Solid Teakwood',
    },
    {
      trade: 'Windows',
      essential: 'Standard 2-Track Aluminum',
      premium: 'High-Grade uPVC Casement',
      luxury: 'System Aluminum Double Glazed',
    },
    {
      trade: 'Electrical',
      essential: 'Anchor / Havells Standard Wires',
      premium: 'V-Guard / Finolex FRLS Wires',
      luxury: 'Schneider Automation & Concealed MEP',
    },
    {
      trade: 'Bathroom',
      essential: 'Cera / Hindware Standard',
      premium: 'Jaquar / Kohler Concealed Fittings',
      luxury: 'Toto / Grohe Thermostatic Systems',
    },
    {
      trade: 'Paint',
      essential: 'Asian Paints Tractor Emulsion',
      premium: 'Asian Paints Royale Luxury Emulsion',
      luxury: 'Royale Aspira Silk + PU Polish',
    },
  ];

  return (
    <section id="packages" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
            Specification Comparison Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
            Construction specifications by grade.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed font-normal">
            Compare material trade differences across standard residential tiers. Every parameter is individually customizable in the calculator.
          </p>
        </div>

        {/* Specification Comparison Table - No SaaS pricing cards */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs">
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#667085] w-1/4">
                    Trade / Material
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#172033] w-1/4">
                    Essential
                    <span className="block text-[11px] text-[#667085] font-normal mt-0.5">Reliable national brands</span>
                  </th>
                  {/* Highlighted Column: Premium */}
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1F4B43] bg-[#EBF2F0]/60 border-x border-[#1F4B43]/20 w-1/4">
                    Premium
                    <span className="block text-[11px] text-[#1F4B43] font-semibold mt-0.5">Most Selected Grade</span>
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#172033] w-1/4">
                    Luxury
                    <span className="block text-[11px] text-[#667085] font-normal mt-0.5">Imported stones & custom joinery</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {specsComparison.map((row) => (
                  <tr key={row.trade} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#172033]">
                      {row.trade}
                    </td>
                    <td className="p-4 sm:p-5 text-[#667085]">
                      {row.essential}
                    </td>
                    {/* Highlighted Premium Column */}
                    <td className="p-4 sm:p-5 font-semibold text-[#172033] bg-[#EBF2F0]/30 border-x border-[#1F4B43]/20">
                      {row.premium}
                    </td>
                    <td className="p-4 sm:p-5 text-[#667085]">
                      {row.luxury}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Launch Actions */}
          <div className="p-4 sm:p-6 bg-[#FAFAF8] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#667085] text-left">
              * Specifications can be mixed and matched inside the calculator (e.g. Premium Structure + Luxury Bathrooms).
            </span>
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="inline-flex items-center gap-2 bg-[#1F4B43] hover:bg-[#163731] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Start Estimate in Premium <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
