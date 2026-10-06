import React from 'react';
import { ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MATERIAL_CONSUMPTION = [
  {
    num: '8.64 T',
    unit: 'TONNES',
    material: 'High-Yield Fe550D TMT Steel',
    spec: 'Primary & secondary structural reinforcement (IS 1786)',
    detail: 'Calculated at 3.60 kg per sq.ft of BUA for G+2 RCC frame columns, plinth beams, and 125mm slab casting.',
    category: 'RCC FRAMEWORK',
  },
  {
    num: '1,080',
    unit: 'BAGS',
    material: 'Grade 53 OPC & PPC Cement',
    spec: 'Structural concrete & masonry plastering (IS 12269)',
    detail: '0.45 bags per sq.ft BUA. Allocated across footings, columns, slab casting, blockwork mortar, and internal plastering.',
    category: 'BINDING AGENT',
  },
  {
    num: '1,620',
    unit: 'CFT',
    material: 'Engineered M-Sand (Manufactured Sand)',
    spec: 'Washed zone-II concrete sand (IS 383)',
    detail: '100% river-free crushed granite aggregate sand ensuring void-free concrete mix design without organic impurities.',
    category: 'FINE AGGREGATE',
  },
  {
    num: '10,752',
    unit: 'BLOCKS',
    material: 'Solid Concrete Masonry Blocks',
    spec: '6" External Load-Bearing & 4" Internal Partitions',
    detail: 'High compressive strength blocks (5 N/mm²) engineered for Bangalore seismic Zone II perimeter thermal insulation.',
    category: 'SUPERSTRUCTURE',
  },
  {
    num: '3,697',
    unit: 'SQ.FT',
    material: 'Vitrified Flooring & Dado Tiles',
    spec: 'Double-charged 1200×600mm + Anti-skid wet areas',
    detail: 'Net room surface coverage with mandatory 10% cutting waste allowance and epoxy tile grouting allocation.',
    category: 'SURFACE FINISHES',
  },
  {
    num: '2,160',
    unit: 'LITRES',
    material: 'Interior & Exterior Architectural Paint',
    spec: 'Low-VOC Acrylic Emulsion + Weather-Proof Shield',
    detail: '2 coats acrylic wall putty, 1 coat primer, and 2 finish coats calculated over all internal wall & ceiling perimeters.',
    category: 'PROTECTIVE SURFACES',
  },
];

export const SignatureConstructionBreakdownSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header with Scale Contrast */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
              <span className="text-[#F28C28] font-bold">Material Quantities</span>
              <span>&bull;</span>
              <span>Bill of Materials</span>
            </div>

            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
              Physical materials. <br />
              Counted before contracting.
            </h2>
          </div>

          <div className="space-y-1 text-left lg:text-right">
            <span className="text-xs font-bold text-[#1B3D34] block">
              Sample Benchmark: 2,400 sq.ft G+2 Duplex
            </span>
            <span className="text-[11px] text-[#4B5563] block">
              Calculated from physical structural requirements
            </span>
          </div>
        </div>

        {/* Big Number Panels (6 items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {MATERIAL_CONSUMPTION.map((item, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 bg-[#F8F8F6] rounded-3xl border border-[#E5E7EB] hover:border-[#1B3D34] transition-all space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                  {item.category}
                </span>
                <span className="text-xs font-semibold text-[#1B3D34] bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E7EB]">
                  {item.unit}
                </span>
              </div>

              {/* Big Typographic Number */}
              <div className="arch-stat-giant text-[#1B3D34]">
                {item.num}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1B3D34] font-heading">
                  {item.material}
                </h3>
                <p className="text-xs font-mono text-[#F28C28] font-semibold">
                  {item.spec}
                </p>
                <p className="text-xs text-[#4B5563] leading-relaxed pt-1">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="p-6 sm:p-8 bg-[#112821] rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 arch-bracketed text-left">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wide text-[#F28C28] block">
              Accurate Takeoff For Your Exact Plot
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Want to see what your specific plot and room layout will consume?
            </h3>
            <p className="text-xs text-white/70 max-w-xl">
              Input your custom site dimensions to run the live calculation engine. Receive your exact material takeoff schedule in 60 seconds.
            </p>
          </div>

          <button
            onClick={() => navigate('/calculator')}
            className="hutty-btn-primary bg-[#F28C28] hover:bg-[#D9771A] text-[#1B3D34] font-bold px-6 py-3.5 rounded-xl shrink-0 cursor-pointer shadow-md"
          >
            <span>Run Free Calculation</span>
            <ArrowRight className="w-4 h-4 text-[#1B3D34]" />
          </button>
        </div>

      </div>
    </section>
  );
};
