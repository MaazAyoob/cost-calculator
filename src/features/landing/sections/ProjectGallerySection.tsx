import React from 'react';
import { ArrowRight, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../store/useWizardStore';

export const ProjectGallerySection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="projects" className="py-20 lg:py-24 bg-white border-b border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="max-w-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3D34] bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 px-3 py-1.5 rounded-md inline-block">
              ARCHITECTURAL PORTFOLIO
            </span>
            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3D34] tracking-tight leading-[1.12]">
              Representative residential configurations.
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
              Standard South Indian urban plot topologies modeled through the Hutty estimation framework.
            </p>
          </div>

          <button
            onClick={() => {
              useWizardStore.getState().startNewProject();
              navigate('/calculator');
            }}
            className="hutty-btn-secondary text-xs font-bold px-5 py-3 rounded-lg shrink-0 cursor-pointer"
          >
            <span>Configure Your Plot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Asymmetric Architecture Portfolio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          
          {/* Large Portfolio Item 1 (40 × 60 Residence - 7 cols) */}
          <div className="lg:col-span-7 bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="h-60 sm:h-72 rounded-xl bg-white border border-[#E5E7EB] flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #1B3D34 1px, transparent 1px), linear-gradient(to bottom, #1B3D34 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <Building className="w-10 h-10 text-[#1B3D34] relative z-10" />
              <div className="relative z-10 space-y-0.5">
                <span className="text-sm font-black text-[#1B3D34] tracking-wider uppercase block font-heading">
                  40 × 60 Residence
                </span>
                <span className="text-xs text-[#4B5563] font-mono">
                  G+3 Villa &bull; 3,840 sq.ft BUA &bull; Bangalore South
                </span>
              </div>
            </div>

            <div className="space-y-1 border-t border-[#E5E7EB] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <h3 className="font-bold text-[#1B3D34]">40 × 60 Residence</h3>
                <p className="text-[#4B5563]">Tata Tiscon 550D &bull; Ready Mix Concrete M25 &bull; Italian Marble</p>
              </div>
              <button
                onClick={() => {
                  useWizardStore.getState().startNewProject();
                  useWizardStore.setState({ plotLength: 60, plotWidth: 40, floors: 4 });
                  navigate('/calculator');
                }}
                className="text-xs font-bold text-[#1B3D34] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Estimate This</span>
                <ArrowRight className="w-3 h-3 text-[#F28C28]" />
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): 30 × 40 & 60 × 90 Residences */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 30 × 40 Residence */}
            <div className="bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="h-32 rounded-xl bg-white border border-[#E5E7EB] flex flex-col items-center justify-center p-3 text-center space-y-1 relative overflow-hidden">
                <Building className="w-6 h-6 text-[#1B3D34]" />
                <span className="text-xs font-bold text-[#1B3D34] uppercase font-heading">30 × 40 Residence</span>
                <span className="text-[10px] text-[#4B5563] font-mono">G+1 Modern Home &bull; 1,440 sq.ft</span>
              </div>

              <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1B3D34]">30 × 40 Residence</span>
                <button
                  onClick={() => {
                    useWizardStore.getState().startNewProject();
                    useWizardStore.setState({ plotLength: 40, plotWidth: 30, floors: 2 });
                    navigate('/calculator');
                  }}
                  className="text-xs font-bold text-[#1B3D34] hover:underline"
                >
                  Estimate →
                </button>
              </div>
            </div>

            {/* 60 × 90 Residence */}
            <div className="bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="h-32 rounded-xl bg-white border border-[#E5E7EB] flex flex-col items-center justify-center p-3 text-center space-y-1 relative overflow-hidden">
                <Building className="w-6 h-6 text-[#1B3D34]" />
                <span className="text-xs font-bold text-[#1B3D34] uppercase font-heading">60 × 90 Residence</span>
                <span className="text-[10px] text-[#4B5563] font-mono">G+4 Estate Villa &bull; 16,200 sq.ft</span>
              </div>

              <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1B3D34]">60 × 90 Residence</span>
                <button
                  onClick={() => {
                    useWizardStore.getState().startNewProject();
                    useWizardStore.setState({ plotLength: 90, plotWidth: 60, floors: 5 });
                    navigate('/calculator');
                  }}
                  className="text-xs font-bold text-[#1B3D34] hover:underline"
                >
                  Estimate →
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
