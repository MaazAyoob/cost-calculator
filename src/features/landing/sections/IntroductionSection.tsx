import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Ruler, Scale, Eye, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import engineerImg from '../../../assets/professional-engineer.jpg';

export const IntroductionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Architectural Framing */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-md bg-white">
              <img
                src={engineerImg}
                alt="Licensed civil structural engineer inspecting residential construction drawings on site"
                className="w-full h-[400px] sm:h-[480px] object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18211E]/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Bottom Architectural Caption Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#E5E7EB] text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#707873] block">
                  TECHNICAL FIDELITY
                </span>
                <span className="text-sm font-bold text-[#18211E] font-heading block mt-0.5">
                  Ground-truth engineering data for every sq.ft
                </span>
                <span className="text-xs text-[#707873] block mt-1">
                  Validated against IS 456 concrete and IS 1786 steel codes.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Platform Pillars */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-xs font-semibold text-[#1B3D34]">
              <span className="text-[#F28C28] font-bold">Introduction</span>
              <span>&bull;</span>
              <span>The Hutty Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.15]">
              Construction intelligence engineered for homeowners.
            </h2>

            <div className="space-y-4 text-[#707873] text-base sm:text-lg leading-relaxed">
              <p>
                Building an individual residential home in India is traditionally one of the most opaque financial commitments a family can undertake. Contractors routinely pitch vague lump-sum rates like <span className="font-semibold text-[#18211E]">"₹2,200 per sq.ft"</span> without specifying rebar tonnage, concrete grades, or municipal setback compliance.
              </p>
              <p>
                <strong className="text-[#18211E] font-semibold">Hutty replaces guesswork with precision.</strong> We combine municipal bye-law algorithms, formulaic material quantity takeoff engines, and transparent Bangalore market rates so you possess an exact bill-of-quantities before breaking ground.
              </p>
            </div>

            {/* 3 Pillars Micro-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#1B3D34]">
                  <Ruler className="w-4 h-4 text-[#F28C28]" />
                  <strong className="text-xs sm:text-sm font-bold text-[#18211E]">Permissible Envelope</strong>
                </div>
                <p className="text-xs text-[#707873]">
                  Front, rear, and side setbacks tailored to your specific Bangalore plot.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#1B3D34]">
                  <Scale className="w-4 h-4 text-[#F28C28]" />
                  <strong className="text-xs sm:text-sm font-bold text-[#18211E]">Quantity Takeoff</strong>
                </div>
                <p className="text-xs text-[#707873]">
                  Fe550D steel rebar in tonnes, Grade 53 cement bags, and masonry block counts.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#1B3D34]">
                  <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
                  <strong className="text-xs sm:text-sm font-bold text-[#18211E]">Unbiased Auditing</strong>
                </div>
                <p className="text-xs text-[#707873]">
                  Zero contractor commissions or kickbacks. Purely objective client guidance.
                </p>
              </div>
            </div>

            {/* CTA Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1B3D34] hover:text-[#142E27] cursor-pointer group"
              >
                <span>Calculate your home's exact material quantities</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

