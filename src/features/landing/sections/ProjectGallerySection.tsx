import React from 'react';
import { ArrowRight, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const ProjectGallerySection: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: '30 × 50 Residence',
      category: 'G+2 Duplex Home',
      area: '2,400 sq.ft BUA',
      location: 'Bangalore East',
      specs: 'Tata Tiscon 550D • UltraTech Super • Vitrified Tiles',
    },
    {
      title: '40 × 60 Family Villa',
      category: 'G+3 Residential Villa',
      area: '3,840 sq.ft BUA',
      location: 'Bangalore South',
      specs: 'Tata 550D • Ready Mix M25 • Italian Marble',
    },
    {
      title: '30 × 40 Compact Home',
      category: 'G+1 Modern Home',
      area: '1,440 sq.ft BUA',
      location: 'Mysore Urban',
      specs: 'JSW Neosteel • ACC Cement • Ceramic & Vitrified',
    },
  ];

  return (
    <section id="projects" className="py-20 lg:py-28 bg-[#F7F7F5] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F4B43] bg-[#EBF2F0] border border-[#1F4B43]/15 px-3 py-1.5 rounded-md inline-block">
              Architectural Gallery
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] tracking-tight leading-[1.15]">
              Representative residential typologies.
            </h2>
            <p className="text-base text-[#667085] leading-relaxed">
              Standard South Indian urban plot configurations modeled through the Cost Calculator estimation framework.
            </p>
          </div>

          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#172033] text-xs font-bold px-5 py-3 rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Configure Your Plot <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Architectural Portfolio Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-[#E5E7EB] space-y-6 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Architectural Blueprint Placeholder Block */}
                <div className="h-44 rounded-xl bg-[#F2F2EF] border border-[#E5E7EB] flex flex-col items-center justify-center p-4 text-center space-y-2 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #667085 1px, transparent 1px), linear-gradient(to bottom, #667085 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <Building className="w-8 h-8 text-[#1F4B43] relative z-10" />
                  <span className="text-[11px] font-bold text-[#172033] uppercase tracking-wider relative z-10">
                    {proj.title}
                  </span>
                  <span className="text-[10px] text-[#667085] relative z-10">
                    {proj.area} • {proj.location}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4B43] block">
                    {proj.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#172033]">
                    {proj.title}
                  </h3>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed border-t border-[#E5E7EB] pt-3">
                  <strong className="text-[#172033] font-semibold">Typical Specs:</strong> {proj.specs}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    useWizardStore.getState().startNewProject();
                    navigate('/calculator');
                  }}
                  className="text-xs font-bold text-[#1F4B43] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Estimate this configuration <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
