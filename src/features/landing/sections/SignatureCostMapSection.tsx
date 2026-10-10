import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/cn';

interface CostHead {
  id: string;
  category: string;
  percentage: number;
  amount: number;
  ratePerSqFt: number;
  materialsPercent: number;
  labourPercent: number;
  includedTrades: string[];
  color: string;
}

const COST_HEADS: CostHead[] = [
  {
    id: 'structure',
    category: 'Foundation & Structural Frame',
    percentage: 52,
    amount: 2330648,
    ratePerSqFt: 971,
    materialsPercent: 68,
    labourPercent: 32,
    includedTrades: ['Excavation & Footings', 'RCC Columns & Plinth Beams', '125mm Slab Casting', 'Fe550D TMT Rebar', 'Solid Block Masonry'],
    color: '#1B3D34',
  },
  {
    id: 'finishes',
    category: 'Flooring & Wet Area Finishes',
    percentage: 20,
    amount: 896480,
    ratePerSqFt: 374,
    materialsPercent: 72,
    labourPercent: 28,
    includedTrades: ['1200×600mm Vitrified Tiles', 'Anti-skid Bathroom Flooring', 'Kitchen Granite Platform', 'Dado Tiling to 7ft Height', 'Epoxy Grouting'],
    color: '#28584B',
  },
  {
    id: 'mep',
    category: 'Electrical, Plumbing & MEP',
    percentage: 14,
    amount: 627536,
    ratePerSqFt: 261,
    materialsPercent: 65,
    labourPercent: 35,
    includedTrades: ['FR PVC Conduit & Copper Wiring', 'Modular Switch Plates & MCBs', 'CPVC & SWR Sanitary Piping', 'Wall-Hung Closets & Diverters', 'Underground Sump & Overhead Tank'],
    color: '#3B7363',
  },
  {
    id: 'openings',
    category: 'Doors, Windows & Joinery',
    percentage: 10,
    amount: 448240,
    ratePerSqFt: 187,
    materialsPercent: 78,
    labourPercent: 22,
    includedTrades: ['Teak Wood Main Entrance Door', 'Laminated Flush Bedroom Doors', 'UPVC Sliding 3-Track Windows', 'Stainless Steel Safety Grills', 'Architectural Brass Hardware'],
    color: '#558F7D',
  },
  {
    id: 'protective',
    category: 'Painting & Waterproofing',
    percentage: 4,
    amount: 179296,
    ratePerSqFt: 75,
    materialsPercent: 60,
    labourPercent: 40,
    includedTrades: ['Terrace Waterproofing Elastomeric Coat', 'Sunken Slab Double-Coat Treatment', 'Interior Wall Putty & Acrylic Emulsion', 'Exterior Weather-Proof Shield'],
    color: '#F28C28',
  },
];

export const SignatureCostMapSection: React.FC = () => {
  const [selectedHeadId, setSelectedHeadId] = useState<string>('structure');
  const activeHead = COST_HEADS.find((h) => h.id === selectedHeadId) || COST_HEADS[0];
  const totalCost = 4482200; // Illustrative benchmark 2,400 sq.ft G+2

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E3E8E2] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E3E8E2] pb-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
              <span className="text-[#F28C28] font-bold">Budget Breakdown</span>
              <span>&bull;</span>
              <span>Where Your Capital Goes</span>
            </div>

            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
              Where your capital goes.
            </h2>
          </div>

          <div className="space-y-1 text-left lg:text-right">
            <span className="text-base font-extrabold text-[#1B3D34] block tabular-nums">
              Total Estimate: {formatCurrency(totalCost)}
            </span>
            <span className="text-xs text-[#4B5563] block">
              ~₹1,867 / sq.ft on 2,400 sq.ft BUA
            </span>
          </div>
        </div>

        {/* Master Proportional Horizontal Allocation Bar */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#4B5563]">Trade Budget Distribution</span>
            <span className="text-[#1B3D34] font-medium">100% of construction budget itemized</span>
          </div>

          <div className="h-10 sm:h-12 w-full rounded-2xl overflow-hidden flex border border-[#E3E8E2] shadow-xs p-1 bg-white">
            {COST_HEADS.map((head) => (
              <button
                key={head.id}
                type="button"
                onClick={() => setSelectedHeadId(head.id)}
                style={{ width: `${head.percentage}%`, backgroundColor: head.color }}
                className={`h-full transition-all cursor-pointer relative group first:rounded-l-xl last:rounded-r-xl ${
                  selectedHeadId === head.id ? 'ring-2 ring-offset-2 ring-[#1B3D34] z-10' : 'opacity-90 hover:opacity-100'
                }`}
                title={`${head.category}: ${head.percentage}%`}
              >
                <div className="hidden sm:flex items-center justify-center h-full text-white text-xs font-bold tracking-tight px-1">
                  {head.percentage}%
                </div>
              </button>
            ))}
          </div>

          {/* Quick Category Legends */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {COST_HEADS.map((head) => (
              <button
                key={head.id}
                type="button"
                onClick={() => setSelectedHeadId(head.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedHeadId === head.id
                    ? 'bg-white border-[#1B3D34] shadow-xs'
                    : 'bg-[#F8F8F6] border-[#E3E8E2] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: head.color }} />
                  <span className="text-xs font-bold text-[#1B3D34]">
                    {head.percentage}%
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#1B3D34] block truncate">
                  {head.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Deep Dive Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3E8E2] shadow-xs text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Summary Metric (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F28C28]">
              Selected Trade Category
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading">
              {activeHead.category}
            </h3>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#1B3D34] font-heading tabular-nums">
                {formatCurrency(activeHead.amount)}
              </div>
              <div className="text-xs text-[#4B5563]">
                Effective: <strong>₹{activeHead.ratePerSqFt}</strong> per sq.ft ({activeHead.percentage}% of project)
              </div>
            </div>

            {/* Material vs Labour Split */}
            <div className="pt-4 border-t border-[#E3E8E2] space-y-2 text-xs">
              <span className="text-[#4B5563] block uppercase text-[10px] font-bold">
                Material vs Labour Split
              </span>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1B3D34] font-bold">Materials: {activeHead.materialsPercent}%</span>
                    <span className="text-[#4B5563]">Labour: {activeHead.labourPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#E3E8E2] overflow-hidden flex">
                    <div style={{ width: `${activeHead.materialsPercent}%` }} className="bg-[#1B3D34] h-full" />
                    <div style={{ width: `${activeHead.labourPercent}%` }} className="bg-[#F28C28] h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Included Deliverables Schedule (7 cols) */}
          <div className="lg:col-span-7 bg-[#F8F8F6] p-6 rounded-2xl border border-[#E3E8E2] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] block border-b border-[#E3E8E2] pb-2">
              Itemized Scope in This Category
            </span>

            <div className="space-y-2.5">
              {activeHead.includedTrades.map((trade, i) => (
                <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-[#1B3D34] font-medium">
                  <span className="text-xs text-[#F28C28] font-bold shrink-0">
                    {i + 1}.
                  </span>
                  <span>{trade}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E3E8E2] text-xs text-[#4B5563]">
              &bull; Itemized in Hutty 22-Section Detailed BOQ Dossier
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
