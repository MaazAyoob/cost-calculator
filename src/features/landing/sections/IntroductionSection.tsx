import React from 'react';
import { ArrowRight, ShieldCheck, Ruler, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import engineerImg from '../../../assets/professional-engineer.jpg';

export const IntroductionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative text-[#18211E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Architectural Framing */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#CBD5CB] shadow-md bg-white">
              <img
                src={engineerImg}
                alt="Licensed civil structural engineer inspecting residential construction drawings on site"
                className="w-full h-[400px] sm:h-[480px] object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#183B32]/75 via-transparent to-transparent pointer-events-none" />
              
              {/* Bottom Homeowner Caption Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#E5E7EB] text-left shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66B4E]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#66716B] block">
                    ENGINEERING ACCURACY
                  </span>
                </div>
                <span className="text-sm font-bold text-[#18211E] font-heading block mt-0.5">
                  Clear numbers for every square foot
                </span>
                <span className="text-xs text-[#66716B] block mt-1">
                  Calculations checked against standard Indian civil codes (IS 456 &amp; IS 1786).
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Platform Pillars */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB]/80 text-xs font-semibold text-[#183B32]">
              <span className="w-2 h-2 rounded-full bg-[#C66B4E]" />
              <span className="text-[#C66B4E] font-bold">Introduction</span>
              <span>&bull;</span>
              <span>How Hutty Helps You Plan</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18211E] font-heading tracking-tight leading-[1.15]">
              Plan your home before you build.
            </h2>

            <div className="space-y-4 text-[#66716B] text-base sm:text-lg leading-relaxed">
              <p>
                Building a home is one of the biggest investments your family will ever make. Most contractors quote a single lump-sum rate like <span className="font-semibold text-[#18211E]">"₹2,200 per sq.ft"</span> without explaining what materials are included, how much steel is used, or whether the plan follows Bangalore municipal rules.
              </p>
              <p>
                <strong className="text-[#183B32] font-semibold">Hutty takes away the guesswork.</strong> In just a few clicks, you can calculate the exact materials your home needs—steel in tonnes, cement in bags, and block counts—along with realistic costs before you talk to contractors.
              </p>
            </div>

            {/* 3 Pillars Micro-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#183B32]">
                  <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] flex items-center justify-center shrink-0">
                    <Ruler className="w-4 h-4 text-[#C66B4E]" />
                  </div>
                  <strong className="text-xs sm:text-sm font-bold text-[#18211E]">What You Can Build</strong>
                </div>
                <p className="text-xs text-[#66716B] pl-9">
                  Front, rear, and side setbacks tailored to your Bangalore plot.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#183B32]">
                  <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4 text-[#183B32]" />
                  </div>
                  <strong className="text-xs sm:text-sm font-bold text-[#18211E]">Materials Needed</strong>
                </div>
                <p className="text-xs text-[#66716B] pl-9">
                  Steel tonnage, cement bags, and wall masonry block counts.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#183B32]">
                  <div className="w-7 h-7 rounded-lg bg-[#E8EFE9] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#347A62]" />
                  </div>
                  <strong className="text-xs sm:text-sm font-bold text-[#18211E]">Independent Advice</strong>
                </div>
                <p className="text-xs text-[#66716B] pl-9">
                  Zero contractor commissions or kickbacks. Unbiased guidance.
                </p>
              </div>
            </div>

            {/* CTA Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/calculator')}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#183B32] hover:text-[#245747] cursor-pointer group min-h-[44px]"
              >
                <span>See how much material your home needs</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
