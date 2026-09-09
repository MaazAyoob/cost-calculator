import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerStaggerVariant, itemFadeUpVariant } from '../../animations/variants';
import { useDashboardStore } from '../../store/useDashboardStore';
import { CONSTRUCTION_STAGES } from '../../constants/constructionStages';
import { FilterBar } from './FilterBar';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../common/Tag';
import { formatCurrency } from '../../utils/cn';
import {
  ChevronRight,
  Clock,
  DollarSign,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  GitCompare,
  Package,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const qualityColors: Record<string, string> = {
  Standard: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Premium: 'bg-blue-50 text-blue-700 border-blue-200',
  Luxury: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const CentreActivityWorkspace: React.FC = () => {
  const {
    selectedStageId,
    selectedActivityId,
    setSelectedActivityId,
    searchQuery,
    priorityFilter,
    materialFilter,
    bookmarkedActivityIds,
    toggleBookmark,
    compareActivityIds,
    toggleCompare,
  } = useDashboardStore();
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  const currentStage =
    CONSTRUCTION_STAGES.find((s) => s.id === selectedStageId) || CONSTRUCTION_STAGES[0];

  // Multi-filter pipeline
  let filteredActivities = currentStage.activities;

  if (searchQuery) {
    filteredActivities = filteredActivities.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.materialTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (priorityFilter !== 'All') {
    filteredActivities = filteredActivities.filter(
      (a) => a.qualityIndicator === priorityFilter
    );
  }

  if (materialFilter !== 'All') {
    filteredActivities = filteredActivities.filter((a) =>
      a.materialTags.some((t) => t.toLowerCase().includes(materialFilter.toLowerCase()))
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Filter Bar */}
      <FilterBar />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-5">
        {/* Stage Header Info Banner */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold">
                {currentStage.number}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{currentStage.title}</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-600 rounded-full border border-slate-200/80">
                {currentStage.activities.length} Activities
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              {currentStage.activities.length} IS-code compliant engineered activities for this construction stage.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Stage Cost</span>
              <div className="font-extrabold text-slate-900">{formatCurrency(currentStage.estimatedCost)}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Duration</span>
              <div className="font-extrabold text-blue-600">{currentStage.estimatedDuration}</div>
            </div>
          </div>
        </div>

        {/* Activity Cards */}
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="p-4 bg-slate-100 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No activities match your filters</h3>
            <p className="text-xs text-slate-400">Try adjusting the priority or material filters above.</p>
          </div>
        ) : (
          <motion.div
            variants={containerStaggerVariant}
            initial="hidden"
            animate="show"
            key={currentStage.id}
            className="space-y-3"
          >
            {filteredActivities.map((act) => {
              const isDrawerSelected = selectedActivityId === act.id;
              const isExpanded = expandedActivityId === act.id;
              const isBookmarked = bookmarkedActivityIds.includes(act.id);
              const isInCompare = compareActivityIds.includes(act.id);

              return (
                <motion.div key={act.id} variants={itemFadeUpVariant}>
                  <Card
                    className={cn(
                      'transition-all duration-200 overflow-hidden',
                      isDrawerSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-soft-md bg-white'
                        : 'hover:border-slate-300 hover:shadow-soft-xs bg-white'
                    )}
                  >
                    <CardContent className="p-4 space-y-3.5">
                      {/* Top Bar: Quality + Title + Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'mt-0.5 px-2 py-0.5 text-[10px] font-extrabold rounded-md border shrink-0',
                              qualityColors[act.qualityIndicator]
                            )}
                          >
                            {act.qualityIndicator}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{act.title}</h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Bookmark */}
                          <button
                            onClick={() => toggleBookmark(act.id)}
                            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Activity'}
                            className={cn(
                              'p-1.5 rounded-lg border transition-all',
                              isBookmarked
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
                            )}
                          >
                            {isBookmarked
                              ? <BookmarkCheck className="w-3.5 h-3.5" />
                              : <Bookmark className="w-3.5 h-3.5" />}
                          </button>

                          {/* Compare */}
                          <button
                            onClick={() => toggleCompare(act.id)}
                            title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
                            className={cn(
                              'p-1.5 rounded-lg border transition-all',
                              isInCompare
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200'
                            )}
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect */}
                          <Button
                            size="sm"
                            variant={isDrawerSelected ? 'primary' : 'outline'}
                            onClick={() => setSelectedActivityId(act.id)}
                            rightIcon={<ChevronRight className="w-3 h-3" />}
                          >
                            {isDrawerSelected ? 'Inspecting' : 'Inspect'}
                          </Button>
                        </div>
                      </div>

                      {/* Purpose */}
                      <p className="text-xs text-slate-500 leading-relaxed">{act.purpose}</p>

                      {/* Key Parameters */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-blue-500" /> Cost
                          </span>
                          <div className="font-bold text-slate-900 mt-0.5">{formatCurrency(act.estimatedCost)}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Package className="w-3 h-3 text-emerald-500" /> Quantity
                          </span>
                          <div className="font-bold text-slate-800 mt-0.5">{act.estimatedQuantity}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" /> Duration
                          </span>
                          <div className="font-bold text-blue-600 mt-0.5">{act.estimatedDuration}</div>
                        </div>
                      </div>

                      {/* Material Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Materials:</span>
                        {act.materialTags.map((tag, idx) => (
                          <Tag key={idx} variant="blue">{tag}</Tag>
                        ))}
                      </div>

                      {/* Expandable Technical Specs */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setExpandedActivityId(isExpanded ? null : act.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-200',
                              isExpanded && 'rotate-180 text-blue-600'
                            )}
                          />
                          <span>{isExpanded ? 'Hide Technical Parameters' : 'View Technical Parameters'}</span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {act.specifications.map((spec, idx) => (
                                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-medium block">{spec.label}</span>
                                    <span className="font-semibold text-slate-800">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
