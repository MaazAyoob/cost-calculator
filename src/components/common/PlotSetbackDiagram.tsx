import React, { useState } from 'react';
import { SetbackEvaluationResult } from '../../calculation-engine/data/setbackRules';

export interface PlotSetbackDiagramProps {
  evaluation: SetbackEvaluationResult;
  className?: string;
  compact?: boolean;
  selectedSide?: 'left' | 'right';
  onSelectSide?: (side: 'left' | 'right') => void;
  roadWidthFt?: number;
}

export const PlotSetbackDiagram: React.FC<PlotSetbackDiagramProps> = ({
  evaluation,
  className = '',
  compact = false,
  selectedSide,
  onSelectSide,
  roadWidthFt = 30,
}) => {
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
    plotAreaSqFt,
    isOutOfScope,
    isSupportedLocation,
    isValidDimensions,
    sideCondition,
  } = evaluation;

  // Internal state fallback if no parent controller
  const [internalSideChoice, setInternalSideChoice] = useState<'left' | 'right'>('left');
  const activeSideChoice = selectedSide ?? evaluation.selectedSide ?? internalSideChoice;

  const handleSideClick = (choice: 'left' | 'right') => {
    if (onSelectSide) {
      onSelectSide(choice);
    } else {
      setInternalSideChoice(choice);
    }
  };

  if (!isSupportedLocation || !isValidDimensions || isOutOfScope) {
    return null;
  }

  // Diagram dimensions & coordinate space with generous margins
  const SVG_WIDTH = 460;
  const SVG_HEIGHT = compact ? 290 : 340;
  const PADDING_X = 75;
  const PADDING_Y = compact ? 42 : 52;
  const PLOT_BOX_WIDTH = SVG_WIDTH - PADDING_X * 2;
  const PLOT_BOX_HEIGHT = SVG_HEIGHT - PADDING_Y * 2 - 25; // Leave 25px for bottom road

  // Compute scale to preserve plot aspect ratio without exceeding the box
  const aspect = plotWidth / (plotLength || 1);
  const clampedAspect = Math.max(0.42, Math.min(2.35, aspect));

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
    ? (activeSideChoice === 'left' ? (left.feet > 0 ? left.feet : right.feet) : 0)
    : left.feet;
  const effectiveRightFeet = sideCondition === 'one_side'
    ? (activeSideChoice === 'right' ? (right.feet > 0 ? right.feet : left.feet) : 0)
    : right.feet;

  const singleSideVal = left.feet > 0 ? left.feet : right.feet;
  const singleSideMeters = left.meters > 0 ? left.meters : right.meters;

  const frontSbPx = Math.min(rectH * 0.42, front.feet * scaleY);
  const rearSbPx = Math.min(rectH * 0.42, rear.feet * scaleY);
  const leftSbPx = Math.min(rectW * 0.42, effectiveLeftFeet * scaleX);
  const rightSbPx = Math.min(rectW * 0.42, effectiveRightFeet * scaleX);

  const buildableX = plotX + leftSbPx;
  const buildableY = plotY + rearSbPx;
  const buildableW = Math.max(0, rectW - (leftSbPx + rightSbPx));
  const buildableH = Math.max(0, rectH - (frontSbPx + rearSbPx));
  const groundCoveragePct = plotAreaSqFt > 0 ? Math.round((buildableFootprintSqFt / plotAreaSqFt) * 100) : 75;

  return (
    <div className={`w-full bg-white rounded-2xl border-2 border-[#183B32]/20 ${compact ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5'} flex flex-col items-center select-none shadow-2xs ${className}`}>
      {/* Diagram Subtitle / Legend Bar */}
      <div className={`w-full flex flex-wrap items-center justify-between gap-2 ${compact ? 'pb-2 mb-1.5' : 'pb-3 mb-2'} border-b border-[#E5E7EB] text-xs`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#183B32]" />
          <span className="font-bold text-[#183B32]">Top View: Plot &amp; Required Open Spaces</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-[#66716B]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FAF4E8] border border-[#EADBBD]" />
            <span>Open space</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#E8EFE9] border border-[#183B32]" />
            <strong className="text-[#183B32]">Buildable area</strong>
          </span>
        </div>
      </div>

      {/* Interactive side selector for one-side setback rules */}
      {sideCondition === 'one_side' && (
        <div className={`w-full ${compact ? 'mb-2 py-1 px-2.5' : 'mb-3 py-1.5 px-3'} flex items-center justify-between bg-[#FAF4E8] rounded-xl border border-[#EADBBD] text-xs`}>
          <span className="text-[11px] text-[#183B32] font-medium">
            Required clearance — either side:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSideClick('left')}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                activeSideChoice === 'left'
                  ? 'bg-[#183B32] text-white shadow-2xs'
                  : 'bg-white text-[#183B32] hover:bg-[#F8F8F6] border border-[#CBD5CB]'
              }`}
            >
              Show on Left
            </button>
            <button
              type="button"
              onClick={() => handleSideClick('right')}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                activeSideChoice === 'right'
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
      <div className={`w-full ${compact ? 'max-w-md' : 'max-w-lg'} mx-auto ${compact ? 'aspect-[460/290]' : 'aspect-[460/340]'} relative`}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full overflow-visible font-sans"
        >
          <defs>
            {/* Pattern for open space buffer */}
            <pattern id="setback-stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#E5D5B4" strokeWidth="1.5" strokeOpacity="0.7" />
            </pattern>
          </defs>

          {/* 1. Road Bar at Bottom (Front of plot) */}
          <g>
            <rect
              x={plotX - 35}
              y={plotY + rectH + 16}
              width={rectW + 70}
              height="22"
              rx="3"
              fill="#263238"
              stroke="#1E292E"
              strokeWidth="1.2"
            />
            {/* Road center dashed line */}
            <line
              x1={plotX - 30}
              y1={plotY + rectH + 27}
              x2={plotX + rectW + 30}
              y2={plotY + rectH + 27}
              stroke="#EA580C"
              strokeWidth="1.2"
              strokeDasharray="6 4"
            />
            <text
              x={plotX + rectW / 2}
              y={plotY + rectH + 31}
              textAnchor="middle"
              className="text-[8.5px] font-mono font-bold fill-white uppercase tracking-wider"
            >
              ROAD (FRONT SIDE) · {roadWidthFt} FT WIDE
            </text>
          </g>

          {/* 2. Outer Plot Boundary (Plot Area) */}
          <rect
            x={plotX}
            y={plotY}
            width={rectW}
            height={rectH}
            rx="2"
            fill="#FAF7F2"
            stroke="#1B3D34"
            strokeWidth="1.8"
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
                rx="2"
                fill="#FFFFFF"
                stroke="#1B3D34"
                strokeWidth="2"
              />
              <rect
                x={buildableX + 2}
                y={buildableY + 2}
                width={Math.max(0, buildableW - 4)}
                height={Math.max(0, buildableH - 4)}
                fill="#EAF2EE"
              />

              {/* Buildable dimensions & label inside */}
              <text
                x={buildableX + buildableW / 2}
                y={buildableY + buildableH / 2 - 12}
                textAnchor="middle"
                className="text-[10.5px] font-extrabold fill-[#183B32] font-heading"
              >
                BUILDABLE AREA
              </text>
              <text
                x={buildableX + buildableW / 2}
                y={buildableY + buildableH / 2 + 2}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-[#C2410C]"
              >
                {buildableWidthFt.toFixed(2)} ft × {buildableDepthFt.toFixed(2)} ft
              </text>
              <text
                x={buildableX + buildableW / 2}
                y={buildableY + buildableH / 2 + 15}
                textAnchor="middle"
                className="text-[9px] font-mono font-bold fill-[#183B32]"
              >
                ~{buildableFootprintSqFt.toLocaleString()} sq.ft ({groundCoveragePct}% Coverage)
              </text>
            </g>
          )}

          {/* 4. Architectural Dimension Lines & Spines (Placed OUTSIDE to prevent crowding) */}
          {/* Top: REAR SETBACK & PLOT WIDTH */}
          <line
            x1={plotX}
            y1={plotY - 6}
            x2={plotX + rectW}
            y2={plotY - 6}
            stroke="#1B3D34"
            strokeWidth="0.8"
          />
          <line x1={plotX} y1={plotY - 9} x2={plotX} y2={plotY - 3} stroke="#1B3D34" strokeWidth="0.8" />
          <line x1={plotX + rectW} y1={plotY - 9} x2={plotX + rectW} y2={plotY - 3} stroke="#1B3D34" strokeWidth="0.8" />
          <text
            x={plotX + rectW / 2}
            y={plotY - 9}
            textAnchor="middle"
            className="text-[9.5px] font-mono font-bold fill-[#183B32]"
          >
            PLOT WIDTH: {plotWidth}' 0"
          </text>

          {/* Rear Setback Callout above boundary */}
          <text
            x={plotX + rectW / 2}
            y={plotY + 12}
            textAnchor="middle"
            className="text-[8.5px] font-mono font-bold fill-[#92400E]"
          >
            REAR: {rear.isZero ? '0 FT (ZERO SETBACK)' : `${rear.feet.toFixed(2)} FT (${rear.displayMeters})`}
          </text>

          {/* Far Left: PLOT DEPTH DIMENSION */}
          <line
            x1={plotX - 10}
            y1={plotY}
            x2={plotX - 10}
            y2={plotY + rectH}
            stroke="#1B3D34"
            strokeWidth="0.8"
          />
          <line x1={plotX - 13} y1={plotY} x2={plotX - 7} y2={plotY} stroke="#1B3D34" strokeWidth="0.8" />
          <line x1={plotX - 13} y1={plotY + rectH} x2={plotX - 7} y2={plotY + rectH} stroke="#1B3D34" strokeWidth="0.8" />
          <text
            x={plotX - 14}
            y={plotY + rectH / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${plotX - 14} ${plotY + rectH / 2})`}
            className="text-[9.5px] font-mono font-bold fill-[#183B32]"
          >
            PLOT DEPTH: {plotLength}' 0"
          </text>

          {/* Bottom: FRONT SETBACK CLEARANCE LABEL */}
          <text
            x={plotX + rectW / 2}
            y={plotY + rectH + 11}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-[#C2410C]"
          >
            Front Setback: {front.feet.toFixed(2)} ft ({front.displayMeters})
          </text>

          {/* Left Side Label */}
          {sideCondition === 'one_side' ? (
            <text
              x={plotX - 26}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${plotX - 26} ${plotY + rectH / 2})`}
              className="text-[8.5px] font-mono font-bold fill-[#183B32]"
            >
              {activeSideChoice === 'left'
                ? `Required clearance: ${singleSideVal.toFixed(2)} ft (${singleSideMeters.toFixed(2)}m)`
                : 'Can build to boundary (0 ft)'}
            </text>
          ) : (
            <text
              x={plotX - 26}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${plotX - 26} ${plotY + rectH / 2})`}
              className="text-[8.5px] font-mono font-bold fill-[#183B32]"
            >
              LEFT: {left.feet.toFixed(2)} ft ({left.displayMeters})
            </text>
          )}

          {/* Right Side Label */}
          {sideCondition === 'one_side' ? (
            <text
              x={plotX + rectW + 16}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(90 ${plotX + rectW + 16} ${plotY + rectH / 2})`}
              className="text-[8.5px] font-mono font-bold fill-[#183B32]"
            >
              {activeSideChoice === 'right'
                ? `Required clearance: ${singleSideVal.toFixed(2)} ft (${singleSideMeters.toFixed(2)}m)`
                : 'Can build to boundary (0 ft)'}
            </text>
          ) : (
            <text
              x={plotX + rectW + 16}
              y={plotY + rectH / 2}
              textAnchor="middle"
              transform={`rotate(90 ${plotX + rectW + 16} ${plotY + rectH / 2})`}
              className="text-[8.5px] font-mono font-bold fill-[#183B32]"
            >
              RIGHT: {right.isZero ? '0 ft' : `${right.feet.toFixed(2)} ft (${right.displayMeters})`}
            </text>
          )}
        </svg>
      </div>

      {/* Helpful neutral note for one-side setback rules */}
      {sideCondition === 'one_side' && (
        <div className="w-full mt-2.5 p-2 bg-[#FAF4E8] rounded-xl border border-[#EADBBD] text-[11px] text-[#183B32] leading-relaxed">
          💡 <strong>Required clearance — either side:</strong> Open space of {singleSideVal.toFixed(2)} ft ({singleSideMeters.toFixed(2)}m) is required on <strong>ONE</strong> side only. You can place this clearance on either side (left or right); the opposite side can be built up to the property boundary.
        </div>
      )}

      {/* Diagram Orientation Helper */}
      <div className="w-full pt-1.5 mt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#66716B]">
        <span>Front faces road at bottom · Left/Right when facing plot from road</span>
        <span className="font-mono font-semibold text-[#183B32]">
          Plot: {plotWidth}&apos; × {plotLength}&apos; ({plotWidth * plotLength} sq.ft)
        </span>
      </div>
    </div>
  );
};
