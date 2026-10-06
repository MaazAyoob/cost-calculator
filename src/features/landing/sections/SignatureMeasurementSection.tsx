import React from 'react';
import { Ruler, Maximize2, Layers, Check } from 'lucide-react';

export const SignatureMeasurementSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F8F8F6] border-b border-[#E5E7EB] relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Tag & Editorial Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 arch-spec-pill text-[#1B3D34]">
              <span className="text-[#F28C28] font-bold">04 // ARCHITECTURAL MEASUREMENT</span>
              <span>&bull;</span>
              <span>SPATIAL GEOMETRY &amp; BYE-LAWS</span>
            </div>
            <h2 className="heading-xl text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B3D34] tracking-tight">
              Calculated to the inch.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-md font-mono">
            BBMP &amp; BDA Residential Zoning Standards • Setback Optimization • Gross Built-Up Area (BUA)
          </p>
        </div>

        {/* Blueprint Visual & Dimensional Linework Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Huge BUA Display & Measurement Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5 arch-bracketed">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
                TOTAL GROSS BUILT-UP AREA
              </span>
              
              <div className="arch-stat-giant text-[#1B3D34]">
                2,400 <span className="text-2xl font-normal text-[#4B5563]">SQ.FT</span>
              </div>

              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Calculated on a standard 30' × 50' (1,500 sq.ft) Bangalore site plan with G+2 duplex zoning, conforming to BBMP mandatory setback requirements.
              </p>

              {/* Dimensional Subdivisions */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-3 font-mono text-xs">
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
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#4B5563] block">FRONT SETBACK</span>
                <span className="font-mono font-bold text-[#1B3D34] text-sm block mt-0.5">5' - 0" (1.52m)</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] text-xs">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#4B5563] block">REAR SETBACK</span>
                <span className="font-mono font-bold text-[#1B3D34] text-sm block mt-0.5">4' - 0" (1.22m)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Architectural Floor-Plan Linework & Dimension Drawing (7 cols) */}
          <div className="lg:col-span-7 bg-[#112821] rounded-3xl p-6 sm:p-8 border border-[#1B3D34]/30 shadow-md text-white relative overflow-hidden arch-crosshair-bg">
            <div className="absolute inset-0 arch-blueprint-dark opacity-35 pointer-events-none" />

            {/* Technical Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10 text-xs font-mono">
              <span className="text-[#F28C28] font-bold flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5" />
                SITE PLAN 30' - 0" &times; 50' - 0"
              </span>
              <span className="text-white/60">SCALE 1:100 &bull; NORTH FACING</span>
            </div>

            {/* SVG Floor Plan Linework Diagram */}
            <div className="relative z-10 py-4 flex flex-col items-center">
              
              {/* Width Dimension Top */}
              <div className="w-full max-w-md flex items-center justify-between font-mono text-[10px] text-white/70 mb-2 px-6">
                <span>&larr;</span>
                <span className="border-b border-dashed border-white/30 px-4 pb-0.5">30' - 0" PLOT WIDTH</span>
                <span>&rarr;</span>
              </div>

              {/* Plot Boundary Box */}
              <div className="w-full max-w-md border-2 border-white/40 p-4 rounded-xl bg-white/5 relative">
                
                {/* Built-up Core Box */}
                <div className="border-2 border-[#F28C28] p-5 rounded-lg bg-[#1B3D34]/80 text-center space-y-4 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#F28C28] border-b border-white/10 pb-1">
                    <span>SETBACK: 3'0"</span>
                    <span>BUILT-UP CORE // 24' × 41'</span>
                    <span>SETBACK: 3'0"</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left font-mono text-[10px]">
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block">PARKING &amp; FOYER</span>
                      <span className="text-white font-bold">12'0" &times; 16'0"</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block">LIVING &amp; DINING</span>
                      <span className="text-white font-bold">18'0" &times; 22'0"</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block">KITCHEN &amp; UTILITY</span>
                      <span className="text-white font-bold">10'0" &times; 12'0"</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                      <span className="text-white/50 block">BEDROOM 01 + BATH</span>
                      <span className="text-white font-bold">14'0" &times; 12'0"</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-white/70 pt-2 border-t border-white/10">
                    &bull; PLINTH BEAM LEVEL +2'0" &bull; CLEAR CEILING HEIGHT 10'0"
                  </div>
                </div>

              </div>

              {/* Length Dimension Bottom */}
              <div className="w-full max-w-md flex items-center justify-between font-mono text-[10px] text-white/70 mt-3 px-6">
                <span>&uarr;</span>
                <span className="border-b border-dashed border-white/30 px-4 pb-0.5">50' - 0" PLOT LENGTH</span>
                <span>&darr;</span>
              </div>
            </div>

            {/* Bottom Linework Metadata */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/60 relative z-10">
              <span>SETBACK RATIO: 32.5%</span>
              <span className="text-[#F28C28]">COMPLIANT WITH IS-456:2000</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
