import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { drawerSlideVariant } from '../../animations/variants';
import { useUIStore } from '../../store/useUIStore';
import { X, Layers, FileText, ChevronRight } from 'lucide-react';

export const DetailDrawer: React.FC = () => {
  const { isDrawerOpen, drawerTitle, drawerContentId, closeDrawer } = useUIStore();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
          />

          {/* Drawer Panel */}
          <motion.aside
            variants={drawerSlideVariant}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed top-0 right-0 z-40 h-full w-full max-w-md bg-white border-l border-slate-200/80 shadow-soft-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{drawerTitle || 'Specification Drawer'}</h3>
                  <span className="text-[11px] text-slate-400">Project Context Inspector</span>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerContentId === 'project_summary' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Structure Baseline</h4>
                    <p className="text-xs text-slate-600">RCC Frame Superstructure engineered for Zone 3 seismic compliance with AAC block masonry.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700">Quick Specs</h4>
                    <ul className="space-y-2 text-xs">
                      <li className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                        <span>Foundation Depth:</span>
                        <span className="font-semibold text-slate-900">7.5 Feet</span>
                      </li>
                      <li className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                        <span>Concrete Grade:</span>
                        <span className="font-semibold text-slate-900">M25 Ready Mix</span>
                      </li>
                      <li className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                        <span>Rebar Grade:</span>
                        <span className="font-semibold text-slate-900">Fe 550D TMT</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {drawerContentId !== 'project_summary' && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 stroke-[1.5]" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">Detail Inspector</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">Select any BOQ row or material card to inspect engineered specs and vendor guidelines.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-400">Cost Calculator Spec v1.0</span>
              <button
                onClick={closeDrawer}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 gap-1"
              >
                Close Drawer <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
