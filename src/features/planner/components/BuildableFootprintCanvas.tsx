import React from 'react';

export interface BuildableFootprintCanvasProps {
  plotWidth: number;
  plotLength: number;
  roadWidthFt?: number;
  frontSetback?: number | null;
  rearSetback?: number | null;
  leftSetback?: number | null;
  rightSetback?: number | null;
  buildableWidthFt?: number;
  buildableLengthFt?: number;
  buildableFootprintSqFt?: number | null;
  maxCoveragePct?: number | null;
  statutoryCoverageLimitSqFt?: number | null;
  roadFacingBoundaries?: Array<'front' | 'rear' | 'left' | 'right'>;
  isFootprintUnavailable?: boolean;
  unavailableNotice?: string;
  className?: string;
}

export const BuildableFootprintCanvas: React.FC<BuildableFootprintCanvasProps> = ({
  plotWidth,
  plotLength,
  roadWidthFt = 30,
  frontSetback = 0,
  rearSetback = 0,
  leftSetback = 0,
  rightSetback = 0,
  buildableWidthFt,
  buildableLengthFt,
  buildableFootprintSqFt,
  maxCoveragePct = 70,
  statutoryCoverageLimitSqFt,
  roadFacingBoundaries = ['front'],
  isFootprintUnavailable = false,
  unavailableNotice,
  className = '',
}) => {
  // Ensure safe positive numbers
  const safeWidth = Math.max(1, Number(plotWidth) || 30);
  const safeLength = Math.max(1, Number(plotLength) || 40);
  const safeFront = Math.max(0, Number(frontSetback) || 0);
  const safeRear = Math.max(0, Number(rearSetback) || 0);
  const safeLeft = Math.max(0, Number(leftSetback) || 0);
  const safeRight = Math.max(0, Number(rightSetback) || 0);

  // Dimensions inside boundary clearances
  const derivedBuildableWidth = Math.max(0, safeWidth - (safeLeft + safeRight));
  const derivedBuildableLength = Math.max(0, safeLength - (safeFront + safeRear));
  const effBuildableWidth = buildableWidthFt !== undefined ? buildableWidthFt : derivedBuildableWidth;
  const effBuildableLength = buildableLengthFt !== undefined ? buildableLengthFt : derivedBuildableLength;

  const grossPlotArea = safeWidth * safeLength;
  const geometricEnvelopeSqFt = effBuildableWidth * effBuildableLength;
  const effFootprintSqFt =
    buildableFootprintSqFt !== undefined && buildableFootprintSqFt !== null
      ? buildableFootprintSqFt
      : Math.round(geometricEnvelopeSqFt);

  // SVG canvas geometry
  const svgW = 420;
  const svgH = 340;
  const marginX = 48;
  const marginY = 48;
  const availW = svgW - marginX * 2;
  const availH = svgH - marginY * 2;

  // Scale plot to fit viewport comfortably
  const scale = Math.min(availW / safeWidth, availH / safeLength);
  const plotW = safeWidth * scale;
  const plotH = safeLength * scale;
  const plotX = (svgW - plotW) / 2;
  const plotY = (svgH - plotH) / 2;

  // Setback offsets in SVG pixels
  const fSet = safeFront * scale;
  const rSet = safeRear * scale;
  const lSet = safeLeft * scale;
  const rtSet = safeRight * scale;

  const envX = plotX + lSet;
  const envY = plotY + fSet;
  const envW = Math.max(0, plotW - lSet - rtSet);
  const envH = Math.max(0, plotH - fSet - rSet);

  const hasInvalidSetbacks = !isFootprintUnavailable && (envW <= 0 || envH <= 0);

  return (
    <div
      className={`relative w-full rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs overflow-hidden flex flex-col ${className}`}
      data-testid="buildable-footprint-canvas"
    >
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8F9F7] border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#183B32]" />
          <span className="text-xs font-bold text-[#183B32] tracking-wide uppercase">
            2D Buildable Ground Floor Diagram
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#687770]">
          {safeWidth}' × {safeLength}' ({grossPlotArea.toLocaleString()} sq.ft)
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#FCFCFA] flex items-center justify-center p-2">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Orthogonal Plot and Buildable Ground Floor Diagram"
        >
          <defs>
            {/* Subtle blueprint grid */}
            <pattern id="plot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#E5E7EB" strokeWidth="0.75" />
            </pattern>
            {/* Hatch pattern for setback clearance buffer */}
            <pattern id="setback-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#D1D5DB" strokeWidth="1" opacity="0.6" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width={svgW} height={svgH} fill="url(#plot-grid)" />

          {/* ── Main Road Frontage (Top) ── */}
          <g>
            <rect
              x={plotX - 16}
              y={plotY - 26}
              width={plotW + 32}
              height={18}
              fill="#202824"
              rx="4"
            />
            {/* Dashed center road line */}
            <line
              x1={plotX - 10}
              y1={plotY - 17}
              x2={plotX + plotW + 10}
              y2={plotY - 17}
              stroke="#C66B4E"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x={svgW / 2}
              y={plotY - 14}
              fill="#FFFFFF"
              fontSize="8.5"
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              FRONT ROAD ({roadWidthFt} FT)
            </text>
          </g>

          {/* ── Optional Corner Side / Rear Roads ── */}
          {roadFacingBoundaries.includes('left') && (
            <g>
              <rect
                x={plotX - 26}
                y={plotY - 10}
                width={18}
                height={plotH + 20}
                fill="#202824"
                rx="4"
              />
              <text
                x={plotX - 17}
                y={plotY + plotH / 2}
                fill="#FFFFFF"
                fontSize="7.5"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-90 ${plotX - 17} ${plotY + plotH / 2})`}
              >
                SIDE ROAD
              </text>
            </g>
          )}

          {roadFacingBoundaries.includes('right') && (
            <g>
              <rect
                x={plotX + plotW + 8}
                y={plotY - 10}
                width={18}
                height={plotH + 20}
                fill="#202824"
                rx="4"
              />
              <text
                x={plotX + plotW + 17}
                y={plotY + plotH / 2}
                fill="#FFFFFF"
                fontSize="7.5"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(90 ${plotX + plotW + 17} ${plotY + plotH / 2})`}
              >
                SIDE ROAD
              </text>
            </g>
          )}

          {roadFacingBoundaries.includes('rear') && (
            <g>
              <rect
                x={plotX - 16}
                y={plotY + plotH + 8}
                width={plotW + 32}
                height={18}
                fill="#202824"
                rx="4"
              />
              <text
                x={svgW / 2}
                y={plotY + plotH + 20}
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
              >
                REAR ROAD
              </text>
            </g>
          )}

          {/* ── Site Plot Boundary ── */}
          <rect
            x={plotX}
            y={plotY}
            width={plotW}
            height={plotH}
            fill="#FFFFFF"
            stroke="#183B32"
            strokeWidth="2"
            strokeDasharray="4 2"
            rx="3"
          />

          {/* ── Setback Clearance Area (Hatched Open Space) ── */}
          {!isFootprintUnavailable && (
            <rect
              x={plotX}
              y={plotY}
              width={plotW}
              height={plotH}
              fill="url(#setback-hatch)"
            />
          )}

          {/* ── Unavailable Footprint Overlay Card ── */}
          {isFootprintUnavailable && (
            <g>
              <rect
                x={plotX + 12}
                y={plotY + plotH / 2 - 30}
                width={plotW - 24}
                height={60}
                rx="8"
                fill="#F8F9F7"
                stroke="#CBD5CB"
                strokeWidth="1.5"
              />
              <text
                x={plotX + plotW / 2}
                y={plotY + plotH / 2 - 8}
                fill="#183B32"
                fontSize="9.5"
                fontWeight="bold"
                textAnchor="middle"
              >
                Clearances Required for Footprint
              </text>
              <text
                x={plotX + plotW / 2}
                y={plotY + plotH / 2 + 10}
                fill="#687770"
                fontSize="8"
                textAnchor="middle"
              >
                {unavailableNotice || 'Enter custom boundary clearances to preview buildable footprint.'}
              </text>
            </g>
          )}

          {/* ── Buildable Footprint Envelope (When Available) ── */}
          {!isFootprintUnavailable && !hasInvalidSetbacks && envW > 0 && envH > 0 && (
            <g>
              <rect
                x={envX}
                y={envY}
                width={envW}
                height={envH}
                fill="#183B32"
                fillOpacity="0.16"
                stroke="#183B32"
                strokeWidth="2.5"
                rx="3"
              />

              {/* Envelope Center Annotation */}
              {envW > 36 && envH > 28 && (
                <g>
                  <rect
                    x={envX + envW / 2 - 62}
                    y={envY + envH / 2 - 17}
                    width={124}
                    height={34}
                    rx="6"
                    fill="#183B32"
                    fillOpacity="0.92"
                  />
                  <text
                    x={envX + envW / 2}
                    y={envY + envH / 2 - 3}
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {effBuildableWidth.toFixed(1)}' × {effBuildableLength.toFixed(1)}'
                  </text>
                  <text
                    x={envX + envW / 2}
                    y={envY + envH / 2 + 10}
                    fill="#C66B4E"
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {effFootprintSqFt.toLocaleString()} sq.ft buildable
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ── Boundary Dimension Labels ── */}
          {/* Plot Width Dimension Line (Bottom) */}
          <g>
            <line
              x1={plotX}
              y1={plotY + plotH + 12}
              x2={plotX + plotW}
              y2={plotY + plotH + 12}
              stroke="#687770"
              strokeWidth="1"
            />
            <line x1={plotX} y1={plotY + plotH + 9} x2={plotX} y2={plotY + plotH + 15} stroke="#687770" strokeWidth="1" />
            <line x1={plotX + plotW} y1={plotY + plotH + 9} x2={plotX + plotW} y2={plotY + plotH + 15} stroke="#687770" strokeWidth="1" />
            <text
              x={plotX + plotW / 2}
              y={plotY + plotH + 22}
              fill="#202824"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              Width: {safeWidth} ft
            </text>
          </g>

          {/* Plot Length Dimension Line (Right Side) */}
          <g>
            <line
              x1={plotX + plotW + 12}
              y1={plotY}
              x2={plotX + plotW + 12}
              y2={plotY + plotH}
              stroke="#687770"
              strokeWidth="1"
            />
            <line x1={plotX + plotW + 9} y1={plotY} x2={plotX + plotW + 15} y2={plotY} stroke="#687770" strokeWidth="1" />
            <line x1={plotX + plotW + 9} y1={plotY + plotH} x2={plotX + plotW + 15} y2={plotY + plotH} stroke="#687770" strokeWidth="1" />
            <text
              x={plotX + plotW + 24}
              y={plotY + plotH / 2 + 3}
              fill="#202824"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="start"
              transform={`rotate(90 ${plotX + plotW + 24} ${plotY + plotH / 2 + 3})`}
            >
              Depth: {safeLength} ft
            </text>
          </g>

          {/* ── Setback Labels (Only when available) ── */}
          {!isFootprintUnavailable && (
            <>
              {/* Front Setback */}
              <g>
                <rect
                  x={plotX + plotW / 2 - 28}
                  y={plotY + Math.max(3, fSet / 2 - 7)}
                  width={56}
                  height={14}
                  rx="3"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="0.75"
                />
                <text
                  x={plotX + plotW / 2}
                  y={plotY + Math.max(3, fSet / 2 - 7) + 10}
                  fill="#92400E"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Front: {safeFront.toFixed(1)}'
                </text>
              </g>

              {/* Rear Setback */}
              <g>
                <rect
                  x={plotX + plotW / 2 - 26}
                  y={plotY + plotH - Math.max(14, rSet / 2 + 7)}
                  width={52}
                  height={14}
                  rx="3"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="0.75"
                />
                <text
                  x={plotX + plotW / 2}
                  y={plotY + plotH - Math.max(14, rSet / 2 + 7) + 10}
                  fill="#92400E"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Rear: {safeRear.toFixed(1)}'
                </text>
              </g>

              {/* Left Setback */}
              <g>
                <rect
                  x={plotX + Math.max(3, lSet / 2 - 20)}
                  y={plotY + plotH / 2 - 7}
                  width={40}
                  height={14}
                  rx="3"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="0.75"
                />
                <text
                  x={plotX + Math.max(3, lSet / 2 - 20) + 20}
                  y={plotY + plotH / 2 + 3}
                  fill="#92400E"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  L: {safeLeft.toFixed(1)}'
                </text>
              </g>

              {/* Right Setback */}
              <g>
                <rect
                  x={plotX + plotW - Math.max(43, rtSet / 2 + 20)}
                  y={plotY + plotH / 2 - 7}
                  width={40}
                  height={14}
                  rx="3"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="0.75"
                />
                <text
                  x={plotX + plotW - Math.max(43, rtSet / 2 + 20) + 20}
                  y={plotY + plotH / 2 + 3}
                  fill="#92400E"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  R: {safeRight.toFixed(1)}'
                </text>
              </g>
            </>
          )}

          {/* Error Message when setbacks exceed boundary */}
          {hasInvalidSetbacks && (
            <g>
              <rect
                x={svgW / 2 - 130}
                y={svgH / 2 - 18}
                width={260}
                height={36}
                rx="6"
                fill="#FEE2E2"
                stroke="#EF4444"
                strokeWidth="1.5"
              />
              <text
                x={svgW / 2}
                y={svgH / 2 + 4}
                fill="#991B1B"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                Setbacks exceed plot boundary. Please adjust dimensions.
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Canvas Footnote / Legend */}
      <div className="px-4 py-2 bg-[#F8F9F7] border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#687770]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#183B32]/20 border border-[#183B32]" />
            <span className="font-semibold text-[#183B32]">
              {isFootprintUnavailable ? 'Buildable Ground Floor: Awaiting clearances' : 'Buildable Ground Floor'}
            </span>
          </div>
          {!isFootprintUnavailable && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FEF3C7] border border-[#F59E0B]" />
              <span className="font-semibold text-[#92400E]">Open Setback Buffer</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-[#66716B]">
          Indicative 2D schematic &bull; Not to scale
        </span>
      </div>
    </div>
  );
};
