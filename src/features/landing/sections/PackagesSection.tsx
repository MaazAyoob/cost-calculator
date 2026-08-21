import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <section id="packages" className="py-20 lg:py-24 bg-[#F8F8F6] border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
            SPECIFICATION MATRIX
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Construction specifications by grade.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Compare material trade differences across standard residential tiers. Every parameter is individually customizable in the calculator.
          </p>
        </div>

        {/* Specification Comparison Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs">
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#4B5563] w-1/4">
                    Trade / Material
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1B3D34] w-1/4">
                    Essential
                    <span className="block text-[10px] text-[#4B5563] font-normal mt-0.5">Reliable national brands</span>
                  </th>
                  {/* Highlighted Column: Premium */}
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border-x border-[#1B3D34]/20 w-1/4">
                    <div className="flex items-center gap-1.5">
                      <span>Premium</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
                    </div>
                    <span className="block text-[10px] text-[#1B3D34] font-semibold mt-0.5">Recommended Standard</span>
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#1B3D34] w-1/4">
                    Luxury
                    <span className="block text-[10px] text-[#4B5563] font-normal mt-0.5">Imported stones & custom joinery</span>
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
                      {row.essential}
                    </td>
                    {/* Highlighted Premium Column */}
                    <td className="p-4 sm:p-5 font-semibold text-[#1B3D34] bg-[rgba(27,61,52,0.04)] border-x border-[#1B3D34]/20">
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
            <span className="text-xs text-[#4B5563] text-left">
              * Specifications can be mixed and matched inside the calculator (e.g. Premium Structure + Luxury Bathrooms).
            </span>
            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="hutty-btn-primary text-xs font-bold px-5 py-2.5 rounded-lg shrink-0"
            >
              <span>Start Estimate in Premium</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
