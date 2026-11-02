import React from 'react';

export interface IsometricStructureVisualProps {
  floors?: number;
  className?: string;
  totalBUASqFt?: number;
}

export const IsometricStructureVisual: React.FC<IsometricStructureVisualProps> = ({
  floors = 2,
  className = '',
  totalBUASqFt = 2160,
}) => {
  const floorCount = Math.max(1, Math.min(4, floors));

  return (
    <div
      className={`w-full bg-[#112821] text-white rounded-2xl p-4 sm:p-5 border border-[#183B32] shadow-sm select-none relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C66B4E] animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-emerald-300 tracking-wider uppercase">
            STRUCTURAL RCC FRAME SKELETON (IS 456:2000)
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/60 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
          G+{floorCount - 1} Structural Levels &bull; M25 Concrete
        </span>
      </div>

      {/* Isometric SVG Diagram */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0A1A15] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 760 500"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Concrete Hatch */}
            <pattern id="concHatch" width="10" height="10" patternTransform="rotate(30 0 0)" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.2)" />
              <circle cx="7" cy="6" r="0.6" fill="rgba(242,140,40,0.3)" />
            </pattern>
            {/* Soil Strata Pattern */}
            <pattern id="soilHatch" width="16" height="8" patternUnits="userSpaceOnUse">
              <line x1="0" y1="4" x2="8" y2="4" stroke="#4A3B32" strokeWidth="1" />
              <line x1="8" y1="8" x2="16" y2="8" stroke="#4A3B32" strokeWidth="1" />
            </pattern>
          </defs>

          {/* ── GROUND STRATA / EXCAVATION ZONE ── */}
          <rect x="20" y="380" width="720" height="100" fill="url(#soilHatch)" opacity="0.3" />
          <line x1="20" y1="380" x2="740" y2="380" stroke="#8D7B68" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="35" y="398" fill="#D5C7B7" fontSize="9" fontFamily="monospace">
            NATURAL GROUND LEVEL (NGL &plusmn;0.00)
          </text>

          {/* ── FOOTING LEVEL (-5'0" SBC 180 kN/m2) ── */}
          {/* Footing 1 (Left) */}
          <g transform="translate(140, 410)">
            <rect x="-35" y="0" width="70" height="20" fill="#2E4F44" stroke="#68D391" strokeWidth="1" />
            <polygon points="-35,0 -20,-20 20,-20 35,0" fill="#1E3830" stroke="#68D391" strokeWidth="1" />
            <rect x="-8" y="-40" width="16" height="20" fill="#C66B4E" opacity="0.9" />
          </g>

          {/* Footing 2 (Center) */}
          <g transform="translate(380, 410)">
            <rect x="-40" y="0" width="80" height="20" fill="#2E4F44" stroke="#68D391" strokeWidth="1" />
            <polygon points="-40,0 -22,-20 22,-20 40,0" fill="#1E3830" stroke="#68D391" strokeWidth="1" />
            <rect x="-8" y="-40" width="16" height="20" fill="#C66B4E" opacity="0.9" />
          </g>

          {/* Footing 3 (Right) */}
          <g transform="translate(620, 410)">
            <rect x="-35" y="0" width="70" height="20" fill="#2E4F44" stroke="#68D391" strokeWidth="1" />
            <polygon points="-35,0 -20,-20 20,-20 35,0" fill="#1E3830" stroke="#68D391" strokeWidth="1" />
            <rect x="-8" y="-40" width="16" height="20" fill="#C66B4E" opacity="0.9" />
          </g>

          {/* ── PLINTH BEAM LEVEL (+2'6" Plinth Protection) ── */}
          <rect x="110" y="335" width="540" height="18" fill="#1E3D34" stroke="#68D391" strokeWidth="1.2" />
          <text x="120" y="348" fill="#A7F3D0" fontSize="8.5" fontFamily="monospace">
            PLINTH TIE BEAM (200 &times; 300 mm) &bull; DAMP PROOF COURSE (DPC)
          </text>

          {/* ── GROUND FLOOR COLUMNS & SLAB ── */}
          {/* Columns */}
          <rect x="132" y="235" width="16" height="100" fill="#2E5A4D" stroke="#A7F3D0" strokeWidth="1" />
          <rect x="372" y="235" width="16" height="100" fill="#2E5A4D" stroke="#A7F3D0" strokeWidth="1" />
          <rect x="612" y="235" width="16" height="100" fill="#2E5A4D" stroke="#A7F3D0" strokeWidth="1" />

          {/* Rebar Indicator Lines inside Columns */}
          <line x1="136" y1="235" x2="136" y2="335" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="144" y1="235" x2="144" y2="335" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="376" y1="235" x2="376" y2="335" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="384" y1="235" x2="384" y2="335" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="616" y1="235" x2="616" y2="335" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="624" y1="235" x2="624" y2="335" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />

          {/* Ground Floor Roof / First Floor Slab (Level 1) */}
          <polygon
            points="100,235 660,235 680,215 120,215"
            fill="#18362D"
            stroke="#68D391"
            strokeWidth="1.5"
          />
          <text x="130" y="228" fill="#FDE68A" fontSize="8.5" fontFamily="monospace">
            LEVEL 01 SLAB (125mm CAST-IN-SITU RCC M25) &bull; CLEAR HEIGHT 10&prime;0&Prime;
          </text>

          {/* ── UPPER FLOOR (IF FLOORS >= 2) ── */}
          {floorCount >= 2 && (
            <g>
              {/* Upper Columns */}
              <rect x="132" y="115" width="16" height="100" fill="#2E5A4D" stroke="#A7F3D0" strokeWidth="1" />
              <rect x="372" y="115" width="16" height="100" fill="#2E5A4D" stroke="#A7F3D0" strokeWidth="1" />
              <rect x="612" y="115" width="16" height="100" fill="#2E5A4D" stroke="#A7F3D0" strokeWidth="1" />

              {/* Rebar lines */}
              <line x1="136" y1="115" x2="136" y2="215" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="144" y1="115" x2="144" y2="215" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="376" y1="115" x2="376" y2="215" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="384" y1="115" x2="384" y2="215" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="616" y1="115" x2="616" y2="215" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="624" y1="115" x2="624" y2="215" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="2 2" />

              {/* Terrace Roof Slab */}
              <polygon
                points="100,115 660,115 680,95 120,95"
                fill="#18362D"
                stroke="#68D391"
                strokeWidth="1.5"
              />
              <text x="130" y="108" fill="#FDE68A" fontSize="8.5" fontFamily="monospace">
                TERRACE SLAB &bull; WATERPROOFING COAT &amp; SCREED CONCRETE
              </text>

              {/* Parapet Wall (3ft height) */}
              <rect x="100" y="80" width="560" height="15" fill="#2A5C4E" stroke="#A7F3D0" strokeWidth="1" opacity="0.8" />
              <text x="340" y="91" fill="#FFFFFF" fontSize="7.5" fontFamily="monospace">
                3&prime;0&Prime; PARAPET SAFETY WALL
              </text>

              {/* Overhead Water Tank (OHT) */}
              <g transform="translate(560, 40)">
                <rect x="0" y="0" width="60" height="40" rx="3" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.2" />
                <text x="30" y="24" textAnchor="middle" fill="#BAE6FD" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  OHT 1000L
                </text>
              </g>
            </g>
          )}

          {/* ── TECHNICAL DIMENSION CALLOUTS ── */}
          {/* Foundation Depth Callout */}
          <g transform="translate(680, 410)">
            <line x1="0" y1="-30" x2="0" y2="20" stroke="#C66B4E" strokeWidth="1" />
            <line x1="-5" y1="-30" x2="5" y2="-30" stroke="#C66B4E" strokeWidth="1" />
            <line x1="-5" y1="20" x2="5" y2="20" stroke="#C66B4E" strokeWidth="1" />
            <text x="10" y="0" fill="#C66B4E" fontSize="8" fontFamily="monospace">
              -5&prime;0&Prime; DEPTH
            </text>
          </g>

          {/* Floor Height Callout */}
          <g transform="translate(680, 285)">
            <line x1="0" y1="-50" x2="0" y2="50" stroke="#68D391" strokeWidth="1" />
            <line x1="-5" y1="-50" x2="5" y2="-50" stroke="#68D391" strokeWidth="1" />
            <line x1="-5" y1="50" x2="5" y2="50" stroke="#68D391" strokeWidth="1" />
            <text x="10" y="4" fill="#68D391" fontSize="8" fontFamily="monospace">
              10&prime;0&Prime; CLEAR
            </text>
          </g>
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[10.5px] text-white/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#2E5A4D] border border-[#A7F3D0] rounded-2xs inline-block" />
            M25 RCC Concrete
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#C66B4E] rounded-2xs inline-block" />
            Fe 550D TMT Rebar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#2E4F44] rounded-2xs inline-block" />
            Trapezoidal Footing
          </span>
        </div>
        <span className="text-[10px] text-white/50 italic">
          Reinforcement design must be certified by a structural consultant
        </span>
      </div>
    </div>
  );
};

