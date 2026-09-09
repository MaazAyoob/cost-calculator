import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../../store/useDashboardStore';
import { CONSTRUCTION_STAGES, ActivityDetail } from '../../constants/constructionStages';
import { TechnicalDiagram } from '../common/TechnicalDiagram';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency } from '../../utils/cn';
import {
  X,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Package,
  DollarSign,
  Clock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Mock material breakdown per activity (production: derive from BOQ)
const getMaterialBreakdown = (activity: ActivityDetail) => {
  return activity.materialTags.map((tag, idx) => ({
    name: tag,
    brand: idx % 3 === 0 ? 'Tata / JSW' : idx % 3 === 1 ? 'UltraTech / ACC' : 'Premium Grade',
    quantity: `${(idx + 1) * 85} ${idx % 2 === 0 ? 'Units' : 'Bags'}`,
    unitRate: ((idx + 1) * 380).toLocaleString('en-IN'),
    total: formatCurrency((idx + 1) * 380 * ((idx + 1) * 85)),
  }));
};

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accentClass?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  defaultOpen = false,
  children,
  accentClass = 'text-slate-500',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200/80 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left"
      >
        <span className={cn('flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider', accentClass)}>
          {icon}
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RightDetailDrawer: React.FC = () => {
  const { selectedActivityId, setSelectedActivityId, bookmarkedActivityIds, toggleBookmark } =
    useDashboardStore();
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});

  // Find active activity + parent stage
  let activeActivity: ActivityDetail | null = null;
  let stageTitle = '';
  let stageNumber = '';
  for (const stage of CONSTRUCTION_STAGES) {
    const found = stage.activities.find((a) => a.id === selectedActivityId);
    if (found) {
      activeActivity = found;
      stageTitle = stage.title;
      stageNumber = stage.number;
      break;
    }
  }

  const toggleChecklist = (item: string) => {
    setCompletedChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const isBookmarked = activeActivity ? bookmarkedActivityIds.includes(activeActivity.id) : false;
  const checkedCount = activeActivity
    ? activeActivity.checklist.filter((item) => !!completedChecklist[item]).length
    : 0;

  // Empty state
  if (!selectedActivityId || !activeActivity) {
    return (
      <aside className="hidden lg:flex w-[380px] xl:w-[420px] bg-white border-l border-slate-200/80 shrink-0 flex-col h-full items-center justify-center p-8 text-center text-slate-400 space-y-4">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
          <Layers className="w-10 h-10 text-blue-300 stroke-[1.5] mx-auto" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-700">Detail Inspector</h3>
          <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
            Select any activity card to inspect technical schematics, material quantities & quality checklists.
          </p>
        </div>
      </aside>
    );
  }

  const materialBreakdown = getMaterialBreakdown(activeActivity);

  return (
    <aside className="hidden lg:flex w-[380px] xl:w-[420px] bg-white border-l border-slate-200/80 shrink-0 flex-col h-full overflow-hidden shadow-soft-lg z-20">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-2">
          <span>{stageNumber}</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span>{stageTitle}</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-blue-600 truncate max-w-[160px]">{activeActivity.title}</span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                {activeActivity.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge
                  status={activeActivity.qualityIndicator === 'Luxury' ? 'info' : activeActivity.qualityIndicator === 'Premium' ? 'neutral' : 'success'}
                  label={activeActivity.qualityIndicator}
                />
                <span className="text-[10px] text-slate-400 font-mono">IS Code Spec</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleBookmark(activeActivity!.id)}
              className={cn(
                'p-1.5 rounded-lg border transition-colors',
                isBookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
              )}
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setSelectedActivityId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 1. Technical Diagram */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            1. Engineering Schematic
          </span>
          <TechnicalDiagram type={activeActivity.diagramType} />
        </div>

        {/* 2. Quantity & Cost */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-blue-500" /> Cost
            </span>
            <span className="font-extrabold text-blue-600 text-sm">{formatCurrency(activeActivity.estimatedCost)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-0.5">
              <Package className="w-3 h-3 text-emerald-500" /> Quantity
            </span>
            <span className="font-bold text-slate-900">{activeActivity.estimatedQuantity}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-amber-500" /> Duration
            </span>
            <span className="font-bold text-slate-900">{activeActivity.estimatedDuration}</span>
          </div>
        </div>

        {/* 3. Material Specifications */}
        <AccordionSection
          title="Material Specifications"
          icon={<Package className="w-3.5 h-3.5" />}
          defaultOpen={true}
        >
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden text-xs">
            {activeActivity.specifications.map((spec, idx) => (
              <div key={idx} className="flex justify-between p-2.5 bg-white">
                <span className="text-slate-500 font-medium">{spec.label}</span>
                <span className="font-bold text-slate-900 text-right ml-3">{spec.value}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 4. Material Breakdown Table */}
        <AccordionSection
          title="Material & Brand Breakdown"
          icon={<Layers className="w-3.5 h-3.5" />}
          defaultOpen={false}
        >
          <div className="space-y-1.5">
            {materialBreakdown.slice(0, 4).map((mat, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{mat.name}</span>
                  <span className="font-extrabold text-blue-600">{mat.total}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Brand: <span className="font-semibold text-slate-700">{mat.brand}</span></span>
                  <span>{mat.quantity} @ ₹{mat.unitRate}/unit</span>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 5. Quality Checklist */}
        <AccordionSection
          title={`Quality Checklist (${checkedCount}/${activeActivity.checklist.length})`}
          icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          defaultOpen={true}
          accentClass="text-emerald-700"
        >
          <div className="space-y-2">
            {activeActivity.checklist.map((item, idx) => {
              const isChecked = !!completedChecklist[item];
              return (
                <label
                  key={idx}
                  onClick={() => toggleChecklist(item)}
                  className={cn(
                    'flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all',
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 text-emerald-600 rounded mt-0.5 accent-emerald-600"
                  />
                  <span className="leading-snug">{item}</span>
                </label>
              );
            })}
          </div>
        </AccordionSection>

        {/* 6. Common Mistakes */}
        <AccordionSection
          title="Common Mistakes to Avoid"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          defaultOpen={false}
          accentClass="text-rose-600"
        >
          <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl space-y-2 text-xs text-rose-900">
            {activeActivity.commonMistakes.map((mistake, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="font-extrabold text-rose-500 shrink-0">•</span>
                <span className="leading-relaxed">{mistake}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 7. Expert Tips */}
        <AccordionSection
          title="Principal Engineer Tips"
          icon={<Lightbulb className="w-3.5 h-3.5 text-blue-600" />}
          defaultOpen={false}
          accentClass="text-blue-700"
        >
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl space-y-2 text-xs text-blue-950">
            {activeActivity.expertTips.map((tip, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <Lightbulb className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 8. IS Code Reference */}
        <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" /> IS Code Reference
          </div>
          <p className="text-[11px] leading-relaxed">{activeActivity.technicalNotes}</p>
        </div>

        {/* 9. Related Activities */}
        {activeActivity.relatedActivities.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Related Execution Tasks
            </span>
            <div className="space-y-1.5">
              {activeActivity.relatedActivities.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => setSelectedActivityId(rel.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 bg-white hover:bg-blue-50 hover:border-blue-200 text-xs text-slate-800 font-medium transition-all text-left"
                >
                  <span>{rel.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
