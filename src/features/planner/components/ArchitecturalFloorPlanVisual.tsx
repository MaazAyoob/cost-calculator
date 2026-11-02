import React from 'react';

export interface ArchitecturalFloorPlanVisualProps {
  buaSqFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasKitchen?: boolean;
  hasBalcony?: boolean;
  floors?: number;
  className?: string;
}

export const ArchitecturalFloorPlanVisual: React.FC<ArchitecturalFloorPlanVisualProps> = ({
  buaSqFt = 1200,
  bedrooms = 3,
  bathrooms = 3,
  hasKitchen = true,
  hasBalcony = true,
  floors = 2,
  className = '',
}) => {
  return (
    <div
      className={`w-full bg-[#112821] text-white rounded-2xl p-4 sm:p-5 border border-[#183B32] shadow-sm select-none relative overflow-hidden ${className}`}
    >
      {/* Top Header & Metadata */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C66B4E] animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-emerald-300 tracking-wider uppercase">
            TYPICAL FLOOR LAYOUT &bull; LEVEL 01
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/60 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
          Scale 1:100 &bull; {Math.round(buaSqFt / Math.max(1, floors))} sq.ft/floor
        </span>
      </div>

      {/* SVG Architectural Floor Plan */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0A1A15] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Architectural Wall Hatch Pattern */}
            <pattern id="wallHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#2A5C4E" strokeWidth="1.5" />
            </pattern>
            {/* Tile Floor Grid Pattern */}
            <pattern id="floorTiles" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
            </pattern>
            {/* Wooden Floor Pattern */}
            <pattern id="woodFlooring" width="40" height="10" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 20 0 L 20 10" fill="none" stroke="rgba(242,140,40,0.08)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background Blueprint Grid */}
          <rect width="800" height="520" fill="#0A1A15" />
          <g opacity="0.15">
            <line x1="40" y1="0" x2="40" y2="520" stroke="#FFFFFF" strokeDasharray="2 4" strokeWidth="0.5" />
            <line x1="760" y1="0" x2="760" y2="520" stroke="#FFFFFF" strokeDasharray="2 4" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="800" y2="40" stroke="#FFFFFF" strokeDasharray="2 4" strokeWidth="0.5" />
            <line x1="0" y1="480" x2="800" y2="480" stroke="#FFFFFF" strokeDasharray="2 4" strokeWidth="0.5" />
          </g>

          {/* ── ROOM ZONES & FLOOR FILLS ── */}
          {/* Living & Dining Area */}
          <rect x="70" y="70" width="380" height="230" fill="url(#floorTiles)" />
          {/* Master Bedroom */}
          <rect x="470" y="70" width="260" height="230" fill="url(#woodFlooring)" />
          {/* Bedroom 2 */}
          <rect x="470" y="320" width="260" height="150" fill="url(#floorTiles)" />
          {/* Kitchen & Utility */}
          <rect x="70" y="320" width="220" height="150" fill="url(#floorTiles)" />
          {/* Attached Bathroom 1 */}
          <rect x="310" y="320" width="140" height="90" fill="#14362C" />
          {/* Common Bathroom */}
          <rect x="310" y="420" width="140" height="50" fill="#14362C" />

          {/* ── ARCHITECTURAL WALLS (HATCHED DOUBLE LINES) ── */}
          {/* Outer Boundary Perimeter Walls */}
          <rect x="60" y="60" width="680" height="420" fill="none" stroke="#3A7565" strokeWidth="16" />
          <rect x="60" y="60" width="680" height="420" fill="none" stroke="#A7F3D0" strokeWidth="1.2" opacity="0.6" />

          {/* Internal Partition Walls (150mm) */}
          {/* Vertical dividing main living from bedroom wing */}
          <rect x="460" y="60" width="10" height="420" fill="url(#wallHatch)" stroke="#3A7565" strokeWidth="1" />
          {/* Horizontal dividing living from kitchen/bathrooms */}
          <rect x="60" y="310" width="410" height="10" fill="url(#wallHatch)" stroke="#3A7565" strokeWidth="1" />
          {/* Horizontal dividing master bed from bed 2 */}
          <rect x="460" y="310" width="280" height="10" fill="url(#wallHatch)" stroke="#3A7565" strokeWidth="1" />
          {/* Vertical dividing kitchen from bathrooms */}
          <rect x="300" y="310" width="10" height="170" fill="url(#wallHatch)" stroke="#3A7565" strokeWidth="1" />
          {/* Horizontal dividing bathroom 1 & 2 */}
          <rect x="300" y="415" width="170" height="6" fill="url(#wallHatch)" stroke="#3A7565" strokeWidth="0.8" />

          {/* ── STRUCTURAL RCC COLUMNS (IS-456 200x300mm standard) ── */}
          {[
            { cx: 60, cy: 60 },
            { cx: 280, cy: 60 },
            { cx: 460, cy: 60 },
            { cx: 740, cy: 60 },
            { cx: 60, cy: 310 },
            { cx: 300, cy: 310 },
            { cx: 460, cy: 310 },
            { cx: 740, cy: 310 },
            { cx: 60, cy: 480 },
            { cx: 300, cy: 480 },
            { cx: 460, cy: 480 },
            { cx: 740, cy: 480 },
          ].map((col, cIdx) => (
            <rect
              key={cIdx}
              x={col.cx - 7}
              y={col.cy - 7}
              width="14"
              height="14"
              fill="#C66B4E"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
          ))}

          {/* ── DOOR OPENINGS & SWING ARCS ── */}
          {/* Main Entrance Door (South-East / Bottom Left) */}
          <line x1="180" y1="60" x2="230" y2="60" stroke="#0A1A15" strokeWidth="18" />
          <path d="M 180 68 A 45 45 0 0 1 225 113" stroke="#C66B4E" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
          <line x1="180" y1="68" x2="180" y2="113" stroke="#C66B4E" strokeWidth="1.8" />

          {/* Master Bedroom Door */}
          <line x1="460" y1="120" x2="460" y2="160" stroke="#0A1A15" strokeWidth="12" />
          <path d="M 465 120 A 40 40 0 0 1 505 160" stroke="#68D391" strokeWidth="1" strokeDasharray="2 3" fill="none" />
          <line x1="465" y1="120" x2="505" y2="120" stroke="#68D391" strokeWidth="1.5" />

          {/* Bedroom 2 Door */}
          <line x1="460" y1="340" x2="460" y2="380" stroke="#0A1A15" strokeWidth="12" />
          <path d="M 465 380 A 40 40 0 0 0 505 340" stroke="#68D391" strokeWidth="1" strokeDasharray="2 3" fill="none" />
          <line x1="465" y1="380" x2="505" y2="380" stroke="#68D391" strokeWidth="1.5" />

          {/* Kitchen Doorway Opening */}
          <line x1="180" y1="310" x2="230" y2="310" stroke="#0A1A15" strokeWidth="14" />

          {/* ── WINDOW OPENINGS (Fenestration Glazing Lines) ── */}
          {/* Living Room Large Bay Window (Top) */}
          <line x1="260" y1="60" x2="380" y2="60" stroke="#0A1A15" strokeWidth="18" />
          <rect x="260" y="56" width="120" height="8" fill="#6EE7B7" stroke="#183B32" strokeWidth="1" />
          <line x1="260" y1="60" x2="380" y2="60" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Master Bedroom Window (Right) */}
          <line x1="740" y1="120" x2="740" y2="200" stroke="#0A1A15" strokeWidth="18" />
          <rect x="736" y="120" width="8" height="80" fill="#6EE7B7" stroke="#183B32" strokeWidth="1" />
          <line x1="740" y1="120" x2="740" y2="200" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Bedroom 2 Window (Right) */}
          <line x1="740" y1="350" x2="740" y2="430" stroke="#0A1A15" strokeWidth="18" />
          <rect x="736" y="350" width="8" height="80" fill="#6EE7B7" stroke="#183B32" strokeWidth="1" />
          <line x1="740" y1="350" x2="740" y2="430" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Kitchen Window (Bottom) */}
          <line x1="120" y1="480" x2="200" y2="480" stroke="#0A1A15" strokeWidth="18" />
          <rect x="120" y="476" width="80" height="8" fill="#6EE7B7" stroke="#183B32" strokeWidth="1" />
          <line x1="120" y1="480" x2="200" y2="480" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* ── ROOM LABELS & DIMENSIONS (Architectural Lettering) ── */}
          {/* Living & Dining */}
          <g transform="translate(250, 175)">
            <text textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.8">
              LIVING &amp; DINING
            </text>
            <text textAnchor="middle" y="18" fill="#A7F3D0" fontSize="10" fontFamily="monospace">
              18&prime;6&Prime; &times; 14&prime;0&Prime; &bull; 260 sq.ft
            </text>
          </g>

          {/* Master Bedroom */}
          <g transform="translate(600, 175)">
            <text textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.8">
              MASTER BEDROOM
            </text>
            <text textAnchor="middle" y="18" fill="#FDE68A" fontSize="10" fontFamily="monospace">
              13&prime;0&Prime; &times; 14&prime;0&Prime; &bull; 182 sq.ft
            </text>
          </g>

          {/* Bedroom 2 */}
          <g transform="translate(600, 400)">
            <text textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.8">
              BEDROOM 02
            </text>
            <text textAnchor="middle" y="17" fill="#A7F3D0" fontSize="10" fontFamily="monospace">
              13&prime;0&Prime; &times; 10&prime;0&Prime; &bull; 130 sq.ft
            </text>
          </g>

          {/* Kitchen */}
          <g transform="translate(180, 400)">
            <text textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.8">
              KITCHEN &amp; UTILITY
            </text>
            <text textAnchor="middle" y="17" fill="#A7F3D0" fontSize="10" fontFamily="monospace">
              11&prime;0&Prime; &times; 9&prime;6&Prime; &bull; 105 sq.ft
            </text>
          </g>

          {/* Attached Toilet */}
          <g transform="translate(380, 365)">
            <text textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">
              TOILET 01
            </text>
            <text textAnchor="middle" y="14" fill="#93C5FD" fontSize="8" fontFamily="monospace">
              7&prime;0&Prime; &times; 4&prime;6&Prime;
            </text>
          </g>

          {/* Common Toilet */}
          <g transform="translate(380, 445)">
            <text textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
              COMMON TOILET
            </text>
          </g>

          {/* ── ARCHITECTURAL SYMBOLS (NORTH ARROW & SCALE BAR) ── */}
          {/* North Arrow */}
          <g transform="translate(730, 40)">
            <circle cx="0" cy="0" r="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <polygon points="0,-12 5,0 0,-3 -5,0" fill="#C66B4E" />
            <polygon points="0,12 5,0 0,3 -5,0" fill="rgba(255,255,255,0.4)" />
            <text x="0" y="-14" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              N
            </text>
          </g>

          {/* Scale Bar */}
          <g transform="translate(70, 498)">
            <rect x="0" y="0" width="80" height="4" fill="#FFFFFF" opacity="0.6" />
            <rect x="0" y="0" width="40" height="4" fill="#C66B4E" />
            <text x="0" y="-4" fill="#A7F3D0" fontSize="7" fontFamily="monospace">0</text>
            <text x="40" y="-4" fill="#A7F3D0" fontSize="7" fontFamily="monospace">5ft</text>
            <text x="80" y="-4" fill="#A7F3D0" fontSize="7" fontFamily="monospace">10ft</text>
          </g>
        </svg>
      </div>

      {/* Blueprint Legend Footer */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[10.5px] text-white/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#C66B4E] rounded-2xs inline-block" />
            RCC Columns (IS-456)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#3A7565] border border-[#A7F3D0] rounded-2xs inline-block" />
            Solid AAC/Brick Walls
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#6EE7B7] rounded-2xs inline-block" />
            Glazed Windows
          </span>
        </div>
        <span className="text-[10px] text-white/50 italic">
          Plan distribution adapts dynamically to entered room counts
        </span>
      </div>
    </div>
  );
};

