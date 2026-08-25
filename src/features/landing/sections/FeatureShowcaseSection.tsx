import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const FeatureShowcaseSection: React.FC = () => {
  const navigate = useNavigate();

  // Active Material in the Specification Board
  const [selectedMaterial, setSelectedMaterial] = useState<'steel' | 'cement' | 'masonry' | 'flooring' | 'windows' | 'paint'>('steel');

  const materialsData = {
    steel: {
      name: 'Primary Structural Steel',
      brand: 'Tata Tiscon Fe 550D Superlinks',
      rate: '₹74 / kg',
      standard: 'IS 1786 High-Ductility Grade',
      details: 'High-ductility seismic-resistant TMT rebar with superior rib pattern for concrete bonding.',
      takeoff: '4.32 Tonnes for 1,440 sq.ft BUA',
    },
    cement: {
      name: 'Structural Portland Cement',
      brand: 'UltraTech Super 53-Grade OPC',
      rate: '₹410 / 50kg Bag',
      standard: 'IS 12269 & IS 269 Compliant',
      details: 'High early-strength portland cement designed for foundation footings, columns, and RCC slabs.',
      takeoff: '576 Bags (0.40 bags/sq.ft BUA)',
    },
    masonry: {
      name: 'Autoclaved Aerated Blocks',
      brand: 'Birla Aerocon / Godrej AAC 150mm',
      rate: '₹68 / Block (600×200×150mm)',
      standard: 'IS 2185 Part 3 Certified',
      details: 'Lightweight thermal-insulating block masonry reducing dead load by up to 50% vs red clay bricks.',
      takeoff: '1,799 Blocks (1.25 blocks/sq.ft BUA)',
    },
    flooring: {
      name: 'Living & Bedroom Surfaces',
      brand: 'Kajaria / Somany 800×800mm Vitrified',
      rate: '₹85 / sq.ft (Tile + Adhesive)',
      standard: 'Nano-Polished Gloss Finish',
      details: 'Stain-resistant vitrified tiles with 2mm paper joints and epoxy-grouted wet areas.',
      takeoff: '1,407 sq.ft Flooring Takeoff',
    },
    windows: {
      name: 'Weather-Proof Joinery',
      brand: 'Fenesta / Prominance Multi-Chamber uPVC',
      rate: '₹750 / sq.ft (Profile + 5mm Toughened Glass)',
      standard: 'Wind-Load Tested Soundproof',
      details: 'Multi-chambered German engineered profile with steel reinforcement and stainless bug-mesh.',
      takeoff: '11 Architectural Window Openings',
    },
    paint: {
      name: 'Interior & Exterior Coatings',
      brand: 'Asian Paints Royale & Apex Ultima',
      rate: '₹28 / sq.ft (2-Coat System)',
      standard: 'Anti-Algal Weather Proofing',
      details: '100% acrylic exterior emulsion with silicon additives and low-VOC Teflon interior finish.',
      takeoff: '8,200 sq.ft Total Surface Coating',
    },
  };

  const costBreakdown = [
    { label: '01. Civil & Structural Frame', pct: 55, amount: '₹28,08,543', color: '#1B3D34' },
    { label: '02. Architectural Finishes & Joinery', pct: 25, amount: '₹12,76,610', color: '#2B584C' },
    { label: '03. MEP (Electrical & Plumbing)', pct: 12, amount: '₹6,12,773', color: '#4B5563' },
    { label: '04. Statutory GST (18%) & Overheads', pct: 8, amount: '₹4,08,516', color: '#F28C28' },
  ];

  return (
    <section id="features" className="py-20 lg:py-24 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-full inline-block">
            ARCHITECTURAL SPECIFICATION &amp; BOQ
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            Engineering precision <br />
            across every material and trade.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Hutty operates on invariant engineering formulas. Select materials below to inspect physical takeoffs and cost composition.
          </p>
        </div>

        {/* ── SHOWCASE 1: Interactive Material Specification Board ── */}
        <div className="p-6 sm:p-8 bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] block">
                INTERACTIVE SPECIFICATION BOARD
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading mt-0.5">
                Brand Specifications &amp; Invariant Takeoffs
              </h3>
            </div>
            <span className="text-xs font-mono text-[#4B5563] bg-white px-3 py-1 rounded-full border border-[#E5E7EB]">
              SELECT MATERIAL TO INSPECT
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'steel', label: 'Steel Rebar' },
              { id: 'cement', label: 'Cement' },
              { id: 'masonry', label: 'AAC Blocks' },
              { id: 'flooring', label: 'Vitrified Tiles' },
              { id: 'windows', label: 'uPVC Windows' },
              { id: 'paint', label: 'Wall Coatings' },
            ].map((mat) => {
              const isSelected = selectedMaterial === mat.id;
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setSelectedMaterial(mat.id as any)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-2xs'
                      : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)] hover:text-[#1B3D34]'
                  }`}
                >
                  {mat.label}
                </button>
              );
            })}
          </div>

          {/* Active Material Card Deep Dive */}
          <motion.div
            key={selectedMaterial}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5 sm:p-6 bg-white rounded-xl border border-[#E5E7EB] shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-7 space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#4B5563] uppercase block">
                {materialsData[selectedMaterial].name}
              </span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#1B3D34] font-heading">
                {materialsData[selectedMaterial].brand}
              </h4>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {materialsData[selectedMaterial].details}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#1B3D34] font-semibold pt-1">
                <Check className="w-3.5 h-3.5 text-[#1B3D34]" />
                <span>{materialsData[selectedMaterial].standard}</span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 bg-[#F8F8F6] p-4 rounded-xl border border-[#E5E7EB]">
              <div>
                <span className="text-[9px] font-bold text-[#4B5563] uppercase block">
                  STANDARD UNIT RATE
                </span>
                <span className="text-sm font-extrabold text-[#1B3D34] font-mono mt-0.5 block">
                  {materialsData[selectedMaterial].rate}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#4B5563] uppercase block">
                  DERIVED QUANTITY
                </span>
                <span className="text-xs font-bold text-[#1B3D34] font-mono mt-0.5 block">
                  {materialsData[selectedMaterial].takeoff}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── SHOWCASE 2: Cost Buildup & 13-Stage BOQ Matrix ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Cost Buildup Composition */}
          <div className="lg:col-span-6 bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs text-left space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] block">
                WHERE DOES YOUR MONEY GO?
              </span>
              <h3 className="text-2xl font-extrabold text-[#1B3D34] font-heading">
                Cost Allocation Buildup
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Deterministic cost allocation based on IS 456 quantities and verified Bengaluru contractor schedules.
              </p>

              {/* Stacked Proportional Bar */}
              <div className="h-4 w-full rounded-full overflow-hidden flex shadow-2xs mt-2">
                {costBreakdown.map((item) => (
                  <div
                    key={item.label}
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    title={`${item.label}: ${item.pct}%`}
                  />
                ))}
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2.5 pt-2">
                {costBreakdown.map((item) => (
                  <div key={item.label} className="p-3 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-[#1B3D34]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-[#1B3D34]">
                      <span>{item.amount}</span>
                      <span className="text-[10px] text-[#4B5563]">({item.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl text-[11px] text-[#1B3D34] font-bold flex items-center justify-between">
              <span>Total Estimated Benchmark (30×40 G+1):</span>
              <span className="font-mono text-sm font-black">₹51,06,442</span>
            </div>
          </div>

          {/* Right: 13-Stage Schedule of Rates BOQ Table */}
          <div className="lg:col-span-6 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs text-left space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B3D34] font-heading">
                  13-Stage BOQ Work Schedule
                </span>
                <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-0.5 rounded-full">
                  BANK READY
                </span>
              </div>
              <p className="text-xs text-[#4B5563]">
                Every civil and finishing stage is itemized for contractor tender comparisons and milestone bank releases.
              </p>

              <div className="space-y-2 pt-1 text-xs">
                {[
                  { code: '01', item: 'Site Preparation, Earthwork & Footing Excavation', cost: '₹2,55,322' },
                  { code: '02', item: 'Plinth Beam RCC & Anti-Termite Injection', cost: '₹4,08,515' },
                  { code: '03', item: 'Ground Floor Columns & Slab Casting', cost: '₹8,68,095' },
                  { code: '04', item: 'First Floor Columns & Roof Slab Casting', cost: '₹8,68,095' },
                  { code: '05', item: 'AAC Blockwork & Parapet Masonry', cost: '₹4,59,580' },
                  { code: '06', item: 'Internal & External 2-Coat Plastering', cost: '₹3,57,451' },
                  { code: '07', item: 'Flooring, Dado & Bathroom Wall Tiling', cost: '₹5,10,644' },
                ].map((row) => (
                  <div key={row.code} className="p-2.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#1B3D34] bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {row.code}
                      </span>
                      <span className="text-[#1B3D34] font-medium text-[11px] truncate max-w-[220px] sm:max-w-[280px]">
                        {row.item}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#1B3D34] text-xs shrink-0">
                      {row.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="w-full hutty-btn-primary py-3 rounded-xl font-bold text-xs shadow-xs"
            >
              <span>Explore Complete 13-Stage Schedule</span>
              <ArrowRight className="w-4 h-4 text-[#F28C28]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
