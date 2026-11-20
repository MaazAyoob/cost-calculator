import React, { useState } from 'react';
import { SetbackEvaluationResult } from '../../calculation-engine/data/setbackRules';

interface PlotSetbackDiagramProps {
  evaluation: SetbackEvaluationResult;
  className?: string;
}

export const PlotSetbackDiagram: React.FC<PlotSetbackDiagramProps> = ({ evaluation, className = '' }) => {
  const {
    plotLength,
    plotWidth,
    front,
    rear,
    left,
    right,
    buildableWidthFt,
    buildableDepthFt,
    buildableFootprintSqFt,
    isOutOfScope,
    isSupportedLocation,
    isValidDimensions,
    sideCondition,
  } = evaluation;

  // For one-side setback rules, allow the homeowner to visualize the required open space on either side
  const [sideChoice, setSideChoice] = useState<'left' | 'right'>('left');

  if (!isSupportedLocation || !isValidDimensions || isOutOfScope) {
    return null;
  }

  // Diagram dimensions & coordinate space
  const SVG_WIDTH = 420;
  const SVG_HEIGHT = 330;
  const PADDING_X = 65;
  const PADDING_Y = 55;
  const PLOT_BOX_WIDTH = SVG_WIDTH - PADDING_X * 2;
  const PLOT_BOX_HEIGHT = SVG_HEIGHT - PADDING_Y * 2;

  // Compute scale to preserve plot aspect ratio without exceeding the box
  const aspect = plotWidth / (plotLength || 1);
  const clampedAspect = Math.max(0.4, Math.min(2.5, aspect));

  let rectW = PLOT_BOX_WIDTH;
  let rectH = rectW / clampedAspect;

  if (rectH > PLOT_BOX_HEIGHT) {
    rectH = PLOT_BOX_HEIGHT;
    rectW = rectH * clampedAspect;
  }

  const plotX = PADDING_X + (PLOT_BOX_WIDTH - rectW) / 2;
  const plotY = PADDING_Y + (PLOT_BOX_HEIGHT - rectH) / 2;

  // Scale setbacks to the SVG coordinate box
  const scaleX = rectW / (plotWidth || 1);
  const scaleY = rectH / (plotLength || 1);

  // Dynamic side setback positioning based on rule and homeowner preference
  const effectiveLeftFeet = sideCondition === 'one_side'
    ? (sideChoice === 'left' ? left.feet : 0)
    : left.feet;
  const effectiveRightFeet = sideCondition === 'one_side'
    ? (sideChoice === 'right' ? left.feet : 0)
    : right.feet;

  const frontSbPx = Math.min(rectH * 0.45, front.feet * scaleY);
  const rearSbPx = Math.min(rectH * 0.45, rear.feet * scaleY);
  const leftSbPx = Math.min(rectW * 0.45, effectiveLeftFeet * scaleX);
  const rightSbPx = Math.min(rectW * 0.45, effectiveRightFeet * scaleX);

  const buildableX = plotX + leftSbPx;
  const buildableY = plotY + rearSbPx;
  const buildableW = Math.max(0, rectW - (leftSbPx + rightSbPx));
  const buildableH = Math.max(0, rectH - (frontSbPx + rearSbPx));

  return (
    <div className={`w-full bg-white rounded-2xl border-2 border-[#183B32]/20 p-4 sm:p-5 flex flex-col items-center select-none shadow-2xs ${className}`}>
      {/* Diagram Subtitle / Legend Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-[#E5E7EB] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#183B32]" />
          <span className="font-bold text-[#183B32]">Top View: Plot &amp; Required Open Spaces</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-[#66716B]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FAF4E8] border border-[#EADBBD]" />
            <span>Open space (setback)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#E8EFE9] border border-[#183B32]" />
            <strong className="text-[#183B32]">Buildable area</strong>
          </span>
        </div>
      </div>

      {/* Interactive side selector for one-side setback rules */}
      {sideCondition === 'one_side' && (
        <div className="w-full mb-3 flex items-center justify-between bg-[#FAF4E8] px-3 py-1.5 rounded-xl border border-[#EADBBD] text-xs">
          <span className="text-[11px] text-[#183B32] font-medium">
            Open space is required on <strong>one side only</strong>:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSideChoice('left')}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                sideChoice === 'left'
                  ? 'bg-[#183B32] text-white shadow-2xs'
                  : 'bg-white text-[#183B32] hover:bg-[#F8F8F6] border border-[#CBD5CB]'
              }`}
            >
              Show on Left
            </button>
            <button
              type="button"
              onClick={() => setSideChoice('right')}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                sideChoice === 'right'
                  ? 'bg-[#183B32] text-white shadow-2xs'
                  : 'bg-white text-[#183B32] hover:bg-[#F8F8F6] border border-[#CBD5CB]'
              }`}
            >
              Show on Right
            </button>
          </div>
        </div>
      )}

      {/* SVG Diagram Canvas */}
      <div className="w-full max-w-md mx-auto aspect-[420/330] relative">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full overflow-visible font-sans"
        >
          <defs>
            {/* Pattern for open space buffer */}
            <pattern id="setback-stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#E5D5B4" strokeWidth="2" strokeOpacity="0.6" />
            </pattern>
          </defs>

          {/* 1. Road Bar at Bottom (Front of plot) */}
          <g>
            <rect
              x={plotX - 30}
              y={plotY + rectH + 12}
              width={rectW + 60}
              height="24"
              rx="4"
              fill="#F3F4F6"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            {/* Road center dashed line */}
            <line
              x1={plotX - 25}
              y1={plotY + rectH + 24}
              x2={plotX + rectW + 25}
              y2={plotY + rectH + 24}
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x={plotX + rectW / 2}
              y={plotY + rectH + 28}
              textAnchor="middle"
              className="text-[9px] font-mono font-bold fill-[#475569] uppercase tracking-wider"
            >
              ROAD (FRONT SIDE)
            </text>
          </g>

          {/* 2. Outer Plot Boundary (Plot Area) */}
          <rect
            x={plotX}
            y={plotY}
            width={rectW}
            height={rectH}
            rx="2"
            fill="#FAF4E8"
            stroke="#C5A46D"
            strokeWidth="2"
          />

          {/* Diagonal hatch on setback space */}
          <rect
            x={plotX}
            y={plotY}
            width={rectW}
            height={rectH}
            fill="url(#setback-stripes)"
          />

          {/* 3. Inner Buildable Area */}
          {buildableW > 0 && buildableH > 0 && (
            <g>
              <rect
                x={buildableX}
                y={buildableY}
                width={buildableW}
                height={buildableH}
                rx="3"
                fill="#E8EFE9"
                stroke="#183B32"
                strokeWidth="2.5"
              />

              {/* Buildable dimensions & label inside */}
              <text
                x={buildableX + buildableW / 2}
                y={buildableY + buildableH / 2 - 7}
                textAnchor="middle"
                className="text-[11px] font-extrabold fill-[#183B32] font-heading"
              >
                BUILDABLE AREA
              </text>
              <text
                x={buildableX + buildableW / 2}
                y={buildableY + buildableH / 2 + 8}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-[#347A62]"
              >
                {buildableWidthFt} ft × {buildableDepthFt} ft
              </text>
              <text
                x={buildableX + buildableW / 2}
                y={buildableY + buildableH / 2 + 20}
                textAnchor="middle"
                className="text-[9px] font-mono fill-[#66716B]"
              >
                ~{buildableFootprintSqFt.toLocaleString()} sq.ft
              </text>
            </g>
          )}

          {/* 4. Dimension Markers & Boundary Labels */}
          {/* Top: REAR */}
          <text
            x={plotX + rectW / 2}
            y={plotY - 14}
            textAnchor="middle"
            className="text-[10px] font-mono font-bold fill-[#183B32] uppercase"
          >
            REAR (BACK): {rear.isZero ? '0 ft' : `${rear.feet} ft (${rear.displayMeters})`}
          </text>
          <line
            x1={plotX}
            y1={plotY - 6}
            x2={plotX + rectW}
            y2={plotY - 6}
            stroke="#C5A46D"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Bottom: FRONT SETBACK LABEL */}
          <text
            x={plotX + rectW / 2}
            y={plotY + rectH - (frontSbPx / 2) + 4}
            textAnchor="middle"
            className="text-[9.5px] font-mono font-bold fill-[#C66B4E]"
          >
            Front Setback: {front.feet} ft ({front.displayMeters})
          </text>

          {/* Left Side: LEFT SETBACK */}
          {sideCondition === 'one_side' ? (
            <text
              x={plotX - 12}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${plotX - 12} ${plotY + rectH / 2})`}
              className="text-[9.5px] font-mono font-bold fill-[#183B32]"
            >
              {sideChoice === 'left'
                ? `Required clearance — either side: ${left.feet} ft (${left.displayMeters})`
                : 'Can build to boundary (0 ft)'}
            </text>
          ) : (
            <text
              x={plotX - 12}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${plotX - 12} ${plotY + rectH / 2})`}
              className="text-[9.5px] font-mono font-bold fill-[#183B32]"
            >
              LEFT: {left.feet} ft ({left.displayMeters})
            </text>
          )}

          {/* Right Side: RIGHT SETBACK */}
          {sideCondition === 'one_side' ? (
            <text
              x={plotX + rectW + 14}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(90 ${plotX + rectW + 14} ${plotY + rectH / 2})`}
              className="text-[9.5px] font-mono font-bold fill-[#183B32]"
            >
              {sideChoice === 'right'
                ? `Required clearance — either side: ${left.feet} ft (${left.displayMeters})`
                : 'Can build to boundary (0 ft)'}
            </text>
          ) : (
            <text
              x={plotX + rectW + 14}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(90 ${plotX + rectW + 14} ${plotY + rectH / 2})`}
              className="text-[9.5px] font-mono font-bold fill-[#183B32]"
            >
              RIGHT: {right.isZero ? '0 ft' : `${right.feet} ft (${right.displayMeters})`}
            </text>
          )}

          {/* Plot Width label (across top boundary) */}
          <text
            x={plotX + rectW / 2}
            y={plotY + 12}
            textAnchor="middle"
            className="text-[9px] font-mono fill-[#66716B]"
          >
            Plot Width: {plotWidth} ft
          </text>

          {/* Plot Length label (along left inside boundary) */}
          <text
            x={plotX + 12}
            y={plotY + rectH / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${plotX + 12} ${plotY + rectH / 2})`}
            className="text-[9px] font-mono fill-[#66716B]"
          >
            Plot Length: {plotLength} ft
          </text>
        </svg>
      </div>

      {/* Helpful neutral note for one-side setback rules */}
      {sideCondition === 'one_side' && (
        <div className="w-full mt-3 p-2.5 bg-[#FAF4E8] rounded-xl border border-[#EADBBD] text-[11px] text-[#183B32] leading-relaxed">
          💡 <strong>Required clearance — either side:</strong> Open space of {left.feet} ft ({left.displayMeters}) is required on <strong>ONE</strong> side only. The homeowner may place this required clearance on either side (left or right) where permitted; the opposite side may be built up to the property boundary.
        </div>
      )}

      {/* Diagram Orientation Helper */}
      <div className="w-full pt-2 mt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#66716B]">
        <span>Front faces road at bottom &bull; Left/Right when facing plot from road</span>
        <span className="font-mono font-semibold text-[#183B32]">
          Plot: {plotWidth}&apos; × {plotLength}&apos; ({plotWidth * plotLength} sq.ft)
        </span>
      </div>
    </div>
  );
};
