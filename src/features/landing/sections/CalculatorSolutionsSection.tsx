import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Home, Layers, PackageCheck, Banknote } from 'lucide-react';
import { useWizardStore } from '../../../store/useWizardStore';

export const CalculatorSolutionsSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState<number>(0);

  const pipelineStages = [
    {
      id: 'plot',
      num: '01',
      title: 'PLOT & SITE',
      sub: '30 × 40 FT',
      icon: MapPin,
      meta: '1,200 sq.ft plot &bull; BBMP/BDA bylaws &bull; Setbacks: 3.5\' / 3.0\'',
      visual: {
        headline: 'Site Geometry & Coverage',
        badge: 'SETBACK ENGINE',
        items: [
          { k: 'Plot Footprint', v: '1,200 sq.ft' },
          { k: 'Max Ground Coverage', v: '720 sq.ft (60%)' },
          { k: 'Open Yard Space', v: '480 sq.ft' },
        ],
      },
    },
    {
      id: 'space',
      num: '02',
      title: 'SPACE MODEL',
      sub: '3 BHK DUPLEX',
      icon: Home,
      meta: 'G+1 Storeys &bull; 1,440 sq.ft BUA &bull; 3 Bed, 3 Bath, Living & Kitchen',
      visual: {
        headline: 'Volumetric Floor Area',
        badge: 'SLAB MATRIX',
        items: [
          { k: 'Ground Floor BUA', v: '720 sq.ft' },
          { k: 'First Floor BUA', v: '720 sq.ft' },
          { k: 'Super Built-Up Area', v: '1,440 sq.ft' },
        ],
      },
    },
    {
      id: 'material',
      num: '03',
      title: 'SPECIFICATIONS',
      sub: 'ENGINEERED BRANDS',
      icon: Layers,
      meta: 'Tata Tiscon Fe550D &bull; UltraTech 53G &bull; 150mm AAC Blocks',
      visual: {
        headline: 'Material Specification Matrix',
        badge: 'IS 456 COMPLIANT',
        items: [
          { k: 'Structural Steel', v: 'Tata Tiscon Fe 550D' },
          { k: 'Structural Cement', v: 'UltraTech Super OPC' },
          { k: 'Masonry Unit', v: 'AAC 600×200×150mm' },
        ],
      },
    },
    {
      id: 'quantity',
      num: '04',
      title: 'QUANTITY TAKEOFF',
      sub: 'DETERMINISTIC BOQ',
      icon: PackageCheck,
      meta: '4.32 T Steel &bull; 576 Bags Cement &bull; 1,799 AAC Blocks',
      visual: {
        headline: 'Physical Material Schedule',
        badge: 'ZERO GUESSWORK',
        items: [
          { k: 'TMT Rebar Steel', v: '4.320 Tonnes' },
          { k: 'Portland Cement', v: '576 Bags (50 kg)' },
          { k: 'AAC Wall Blocks', v: '1,799 Blocks' },
        ],
      },
    },
    {
      id: 'cost',
      num: '05',
      title: 'LINE-ITEM COST',
      sub: '₹51,06,442',
      icon: Banknote,
      meta: '₹3,546 / sq.ft BUA &bull; 13-stage BOQ &bull; Bank disbursement ready',
      visual: {
        headline: 'Total Project Cost & BOQ',
        badge: 'BANK READY',
        items: [
          { k: 'Civil & Structure', v: '₹35,24,114' },
          { k: 'Finishes & MEP', v: '₹15,82,328' },
          { k: 'Effective Rate', v: '₹3,546 / sq.ft' },
        ],
      },
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-full inline-block">
            CONSTRUCTION PIPELINE
          </span>
          <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
            From plot geometry to bank-ready BOQ.
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            Hutty translates physical plot boundaries into volumetric space models, calculates physical material takeoffs, and compiles your exact construction budget.
          </p>
        </div>

        {/* 5-Stage Interactive Pipeline Visual */}
        <div className="space-y-6">
          
          {/* Horizontal Track Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative">
            {pipelineStages.map((stage, idx) => {
              const isActive = activeStage === idx;
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  className={`hutty-tactile-card p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                      : 'bg-[#F8F8F6] border-[#E5E7EB] hover:bg-white hover:border-[#1B3D34]/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#1B3D34]' : 'text-[#4B5563]'}`}>
                        STAGE {stage.num}
                      </span>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#1B3D34]' : 'text-[#4B5563]'}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B3D34] tracking-tight font-heading">
                        {stage.title}
                      </h4>
                      <p className="text-[11px] font-mono font-semibold text-[#4B5563] mt-0.5">
                        {stage.sub}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-2 border-t border-[#1B3D34]/20 flex items-center gap-1.5 text-[10px] font-bold text-[#1B3D34]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
                      <span>Active Stage</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Stage Architectural Deep Dive Visual */}
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl text-left grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34] bg-white px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                  {pipelineStages[activeStage].visual.badge}
                </span>
                <span className="text-xs text-[#4B5563] font-mono">
                  STAGE {pipelineStages[activeStage].num} OF 05
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
                {pipelineStages[activeStage].visual.headline}
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {pipelineStages[activeStage].meta}
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pipelineStages[activeStage].visual.items.map((item) => (
                <div key={item.k} className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase block">
                    {item.k}
                  </span>
                  <span className="text-sm font-extrabold text-[#1B3D34] font-mono block">
                    {item.v}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Minimal CTA Action */}
        <div className="pt-2 text-left">
          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1B3D34] hover:text-[#132C25] transition-colors cursor-pointer group"
          >
            <span>Launch the full 10-step wizard</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};

