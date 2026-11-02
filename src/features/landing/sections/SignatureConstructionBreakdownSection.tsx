import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MATERIAL_CONSUMPTION = [
  {
    num: '8.64 T',
    unit: 'TONNES',
    material: 'Steel Needed',
    spec: 'For columns, beams, and slabs (IS 1786)',
    detail: 'About 3.60 kg per sq.ft of built area for columns, foundation beams, and floor slabs.',
    category: 'FRAMEWORK & COLUMNS',
  },
  {
    num: '1,080',
    unit: 'BAGS',
    material: 'Cement Needed',
    spec: 'For foundations, concrete, and plaster',
    detail: 'About 0.45 bags per sq.ft built area. Used across foundations, columns, slab casting, and wall plaster.',
    category: 'CONCRETE & PLASTER',
  },
  {
    num: '1,620',
    unit: 'CFT',
    material: 'Sand & Gravel',
    spec: 'Manufactured M-sand & 20mm aggregates',
    detail: 'Clean manufactured sand for strong concrete and smooth wall plastering.',
    category: 'SAND & AGGREGATES',
  },
  {
    num: '10,752',
    unit: 'BLOCKS',
    material: 'Wall Blocks',
    spec: 'AAC or solid concrete blocks',
    detail: 'Solid blocks for outer boundary and sturdy inner room partition walls.',
    category: 'WALLS & PARTITIONS',
  },
  {
    num: '3,697',
    unit: 'SQ.FT',
    material: 'Flooring & Tiles',
    spec: 'Living, bedrooms, and bathroom tiles',
    detail: 'Covers all rooms, halls, kitchen dado, and bathrooms, with 10% cutting allowance.',
    category: 'FLOORS & WALL TILES',
  },
  {
    num: '2,160',
    unit: 'LITRES',
    material: 'Paint & Finishes',
    spec: 'Interior and exterior wall finishes',
    detail: 'Includes wall putty, primer base, and two coats of washable wall paint.',
    category: 'PAINT & COATINGS',
  },
];

export const SignatureConstructionBreakdownSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-[#E5E7EB] relative select-none text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header with Scale Contrast */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/70 text-xs font-semibold text-[#183B32]">
              <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
              <span className="text-[#C66B4E] font-bold">Materials Your Home Will Need</span>
              <span>&bull;</span>
              <span>Bill of Materials</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18211E] tracking-tight font-heading leading-[1.14]">
              Know what materials your home needs <br />
              before signing contracts.
            </h2>
          </div>

          <div className="space-y-1 text-left lg:text-right">
            <span className="text-xs font-bold text-[#183B32] block">
              Sample Benchmark: 2,400 sq.ft G+2 Duplex
            </span>
            <span className="text-[11px] text-[#66716B] block">
              Calculated from physical structural requirements
            </span>
          </div>
        </div>

        {/* Big Number Panels (6 items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {MATERIAL_CONSUMPTION.map((item, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 bg-[#F8F8F6] rounded-3xl border-2 border-[#E5E7EB] hover:border-[#183B32] transition-all duration-200 space-y-4 text-left shadow-2xs hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66716B]">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-semibold text-[#183B32] bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E7EB]">
                  {item.unit}
                </span>
              </div>

              {/* Big Typographic Number */}
              <div className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-[#183B32]">
                {item.num}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#18211E] font-heading">
                  {item.material}
                </h3>
                <p className="text-xs font-mono text-[#C66B4E] font-semibold">
                  {item.spec}
                </p>
                <p className="text-xs text-[#66716B] leading-relaxed pt-1">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="p-6 sm:p-8 bg-[#183B32] rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 text-left border-2 border-[#245747] shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wide text-[#E5D5B4] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
              Materials Needed For Your Plot
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Want to see the materials your house will need?
            </h3>
            <p className="text-xs text-[#B7CDBB] max-w-xl">
              Input your site dimensions and floor plan to see your estimated materials and costs in 60 seconds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/calculator')}
            className="bg-[#C66B4E] hover:bg-[#A95640] text-white font-bold px-6 py-3.5 rounded-xl shrink-0 cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>Calculate My Materials Free</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </section>
  );
};
