import React from 'react';
import { Ruler, Maximize2, Layers, Check } from 'lucide-react';

export const SignatureMeasurementSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Tag & Editorial Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/10 text-xs font-semibold text-[#1B3D34]">
              <span className="text-[#F28C28] font-bold">Plan Your Home</span>
              <span>&bull;</span>
              <span>Spatial Planning &amp; Bylaws</span>
            </div>
            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
              Calculated to the inch.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-md">
            BBMP &amp; BDA Residential Zoning Standards &bull; Setback Optimization &bull; Gross Built-Up Area (BUA)
          </p>
        </div>

        {/* Blueprint Visual & Dimensional Linework Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Huge BUA Display & Measurement Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block">
                Total Gross Built-Up Area
              </span>
              
              <div className="arch-stat-giant text-[#1B3D34]">
                2,400 <span className="text-2xl font-normal text-[#4B5563]">sq.ft</span>
              </div>

              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Calculated on a standard 30' × 50' (1,500 sq.ft) Bangalore site plan with G+2 duplex zoning, conforming to BBMP mandatory setback requirements.
              </p>

              {/* Dimensional Subdivisions */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#4B5563]">Ground Floor Plinth:</span>
                  <span className="font-bold text-[#1B3D34]">1,012 sq.ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4B5563]">First Floor Living:</span>
                  <span className="font-bold text-[#1B3D34]">1,012 sq.ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4B5563]">Second Floor / Terrace:</span>
                  <span className="font-bold text-[#1B3D34]">376 sq.ft</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-[#1B3D34] font-bold">
                  <span>Carpet Area Efficiency:</span>
                  <span className="text-[#F28C28]">78.5% Net Usable</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] block">Front Setback</span>
                <span className="font-bold text-[#1B3D34] text-sm block mt-0.5">5' - 0" (1.52m)</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] block">Rear Setback</span>
                <span className="font-bold text-[#1B3D34] text-sm block mt-0.5">4' - 0" (1.22m)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Architectural Floor-Plan Linework & Dimension Drawing (7 cols) */}
          <div className="lg:col-span-7 bg-[#112821] rounded-3xl p-6 sm:p-8 border border-[#1B3D34]/30 shadow-md text-white relative overflow-hidden arch-crosshair-bg">
            <div className="absolute inset-0 arch-blueprint-dark opacity-35 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10 text-xs">
              <span className="text-[#F28C28] font-bold flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5" />
                Site Plan: 30' × 50'
              </span>
              <span className="text-white/70">North Facing &bull; Scale 1:100</span>
            </div>

            {/* SVG Floor Plan Linework Diagram */}
            <div className="relative z-10 py-4 flex flex-col items-center">
              
              {/* Width Dimension Top */}
              <div className="w-full max-w-md flex items-center justify-between text-[11px] text-white/70 mb-2 px-6">
                <span>&larr;</span>
                <span className="border-b border-dashed border-white/30 px-4 pb-0.5">30' - 0" Plot Width</span>
                <span>&rarr;</span>
              </div>

              {/* Plot Boundary Box */}
              <div className="w-full max-w-md border-2 border-white/40 p-4 rounded-xl bg-white/5 relative">
                
                {/* Built-up Core Box */}
                <div className="border-2 border-[#F28C28] p-5 rounded-lg bg-[#1B3D34]/80 text-center space-y-4 shadow-lg">
                  <div className="flex items-center justify-between text-[10px] text-[#F28C28] font-semibold border-b border-white/10 pb-1">
                    <span>Setback: 3'0"</span>
                    <span>Built-up Core &bull; 24' × 41'</span>
                    <span>Setback: 3'0"</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left text-xs">
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block text-[10px]">PARKING &amp; FOYER</span>
                      <span className="text-white font-bold">12'0" &times; 16'0"</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block text-[10px]">LIVING &amp; DINING</span>
                      <span className="text-white font-bold">18'0" &times; 22'0"</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block text-[10px]">KITCHEN &amp; UTILITY</span>
                      <span className="text-white font-bold">10'0" &times; 12'0"</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block text-[10px]">BEDROOM 01 + BATH</span>
                      <span className="text-white font-bold">14'0" &times; 12'0"</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-white/70 pt-2 border-t border-white/10">
                    &bull; Plinth Beam Level +2'0" &bull; Clear Ceiling Height 10'0"
                  </div>
                </div>

              </div>

              {/* Length Dimension Bottom */}
              <div className="w-full max-w-md flex items-center justify-between text-[11px] text-white/70 mt-3 px-6">
                <span>&uarr;</span>
                <span className="border-b border-dashed border-white/30 px-4 pb-0.5">50' - 0" Plot Length</span>
                <span>&darr;</span>
              </div>
            </div>

            {/* Bottom Linework Metadata */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70 relative z-10">
              <span>Setback Ratio: 32.5%</span>
              <span className="text-[#F28C28]">Compliant with BBMP bye-laws</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
