import React from 'react';
import { Shovel, Layers, Building2, Paintbrush, Home, CheckCircle2 } from 'lucide-react';

export interface ConstructionStageDiagramProps {
  currentStageIndex?: number;
  className?: string;
}

const STAGES = [
  {
    code: '01',
    title: 'Site Prep & Excavation',
    desc: 'Footing trenches & pits dug to solid bearing strata (-5ft).',
    icon: Shovel,
  },
  {
    code: '02',
    title: 'Plinth & Substructure',
    desc: 'Isolated RCC footings, tie beams & DPC anti-termite layer.',
    icon: Layers,
  },
  {
    code: '03',
    title: 'RCC Frame & Slabs',
    desc: 'Columns, intermediate beams, and 125mm roof slabs cast.',
    icon: Building2,
  },
  {
    code: '04',
    title: 'Walls & Plastering',
    desc: 'AAC block masonry walls with 2-coat sponge plastering.',
    icon: Layers,
  },
  {
    code: '05',
    title: 'Finishes & Services',
    desc: 'Flooring, door joinery, electrical conduits & sanitaryware.',
    icon: Paintbrush,
  },
  {
    code: '06',
    title: 'Completion & Handover',
    desc: 'Weatherproof emulsion painting, final testing & handover.',
    icon: Home,
  },
];

export const ConstructionStageDiagram: React.FC<ConstructionStageDiagramProps> = ({
  currentStageIndex = 2,
  className = '',
}) => {
  return (
    <div
      className={`w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#CBD5CB] shadow-xs select-none text-left space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C66B4E]">
            CONSTRUCTION WORKFLOW
          </span>
          <h4 className="text-sm font-bold text-[#183B32] font-heading">
            Residential Execution Stages &bull; Milestone Sequence
          </h4>
        </div>
        <span className="text-[11px] font-mono text-[#687770] bg-[#F8F8F6] px-2.5 py-1 rounded-full border border-[#E5E7EB] w-fit">
          IS 456 / NBC Standard Phases
        </span>
      </div>

      {/* Grid of Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {STAGES.map((stg, idx) => {
          const Icon = stg.icon;
          const isActive = idx === currentStageIndex;
          const isPassed = idx < currentStageIndex;

          return (
            <div
              key={stg.code}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                  : isPassed
                  ? 'bg-[#E8EFE9] text-[#183B32] border-[#B7CDBB]'
                  : 'bg-[#F8F8F6] text-[#505D56] border-[#E5E7EB]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-black ${
                    isActive ? 'text-[#C66B4E]' : isPassed ? 'text-emerald-700' : 'text-[#687770]'
                  }`}
                >
                  PHASE {stg.code}
                </span>
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
                )}
              </div>

              <div>
                <strong
                  className={`text-xs block font-heading leading-tight ${
                    isActive ? 'text-white' : 'text-[#18211E]'
                  }`}
                >
                  {stg.title}
                </strong>
                <p
                  className={`text-[10px] leading-snug mt-1 ${
                    isActive ? 'text-emerald-200' : 'text-[#687770]'
                  }`}
                >
                  {stg.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

