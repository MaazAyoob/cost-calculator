import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { CONSTRUCTION_STAGES } from '../../constants/constructionStages';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressIndicator } from '../common/ProgressIndicator';
import { StageProgressRing } from './StageProgressRing';
import { formatCurrency } from '../../utils/cn';
import {
  Compass,
  Layers,
  Box,
  Building2,
  SquareStack,
  Grid,
  Feather,
  Sparkles,
  Zap,
  Droplet,
  Palette,
  Sliders,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-3.5 h-3.5" />,
  Layers: <Layers className="w-3.5 h-3.5" />,
  Box: <Box className="w-3.5 h-3.5" />,
  Building2: <Building2 className="w-3.5 h-3.5" />,
  SquareStack: <SquareStack className="w-3.5 h-3.5" />,
  Grid: <Grid className="w-3.5 h-3.5" />,
  Feather: <Feather className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Droplet: <Droplet className="w-3.5 h-3.5" />,
  Palette: <Palette className="w-3.5 h-3.5" />,
  Sliders: <Sliders className="w-3.5 h-3.5" />,
  CheckCircle2: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const statusBadgeMap: Record<string, 'success' | 'warning' | 'neutral'> = {
  Completed: 'success',
  'In Progress': 'warning',
  Pending: 'neutral',
};

export const LeftStageSidebar: React.FC = () => {
  const { selectedStageId, setSelectedStageId } = useDashboardStore();

  const completedCount = CONSTRUCTION_STAGES.filter((s) => s.status === 'Completed').length;
  const inProgressCount = CONSTRUCTION_STAGES.filter((s) => s.status === 'In Progress').length;
  const pendingCount = CONSTRUCTION_STAGES.filter((s) => s.status === 'Pending').length;
  const overallProgress = Math.round((completedCount / CONSTRUCTION_STAGES.length) * 100);
  const totalCost = CONSTRUCTION_STAGES.reduce((sum, s) => sum + s.estimatedCost, 0);

  return (
    <aside className="w-full lg:w-[300px] xl:w-[320px] bg-white border-r border-slate-200/80 shrink-0 flex flex-col h-full overflow-hidden">
      {/* Header with progress ring */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 space-y-3">
        <div className="flex items-center gap-3">
          <StageProgressRing percentage={overallProgress} size={54} />
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Construction Stages
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Sequential Execution Roadmap</p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold flex-wrap gap-y-1">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {completedCount} Done
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {inProgressCount} Active
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                {pendingCount} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {CONSTRUCTION_STAGES.map((stage) => {
          const isSelected = selectedStageId === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStageId(stage.id)}
              className={cn(
                'p-3 rounded-xl border transition-all cursor-pointer space-y-2 group relative overflow-hidden',
                isSelected
                  ? 'bg-blue-600 border-blue-600 shadow-soft-sm text-white'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-soft-xs hover:translate-x-0.5'
              )}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 transition-colors',
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    )}
                  >
                    {stage.number}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn('shrink-0', isSelected ? 'text-white/80' : 'text-slate-400')}>
                      {iconMap[stage.iconName] || <Layers className="w-3.5 h-3.5" />}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold truncate',
                        isSelected ? 'text-white' : 'text-slate-800'
                      )}
                    >
                      {stage.title}
                    </span>
                  </div>
                </div>
                {!isSelected && (
                  <StatusBadge
                    status={statusBadgeMap[stage.status]}
                    label={stage.status === 'In Progress' ? 'Active' : stage.status === 'Completed' ? 'Done' : 'Soon'}
                  />
                )}
                {isSelected && (
                  <span className="text-[10px] font-bold text-white/80 shrink-0">
                    {stage.activities.length} tasks
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <ProgressIndicator
                value={stage.progress}
                size="sm"
                color={isSelected ? 'bg-white' : stage.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'}
              />

              {/* Footer info */}
              <div className={cn('flex justify-between items-center text-[10px] font-semibold',
                isSelected ? 'text-white/70' : 'text-slate-500')}>
                <span>{formatCurrency(stage.estimatedCost)}</span>
                <span className="flex items-center gap-0.5">
                  {stage.estimatedDuration}
                  <ChevronRight className={cn('w-2.5 h-2.5', isSelected ? 'text-white/50' : 'text-slate-300')} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Cost Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600">Total Project Cost</span>
          <span className="text-blue-700 text-sm font-extrabold">{formatCurrency(totalCost)}</span>
        </div>
        <p className="text-[11px] text-[#4B5563]">
          {CONSTRUCTION_STAGES.length} stages · Preliminary Quantity Estimate
        </p>
      </div>
    </aside>
  );
};
