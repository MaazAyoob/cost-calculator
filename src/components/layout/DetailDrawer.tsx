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
            className="fixed inset-0 bg-[#1B3D34]/30 backdrop-blur-xs z-40 lg:hidden"
          />

          {/* Drawer Panel */}
          <motion.aside
            variants={drawerSlideVariant}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed top-0 right-0 z-40 h-full w-full max-w-md bg-white border-l border-[#E5E7EB] shadow-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F8F6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[rgba(27,61,52,0.08)] text-[#1B3D34] rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18211E] font-heading">{drawerTitle || 'Specification Drawer'}</h3>
                  <span className="text-[11px] text-[#707873]">Project Context Inspector</span>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-[#707873] hover:text-[#18211E] hover:bg-[rgba(27,61,52,0.06)] transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerContentId === 'project_summary' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB]">
                    <h4 className="text-xs font-bold text-[#18211E] uppercase tracking-wider mb-2 font-heading">Structure Baseline</h4>
                    <p className="text-xs text-[#707873] leading-relaxed">RCC Frame Superstructure engineered for Zone 3 seismic compliance with AAC block masonry.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#18211E] font-heading">Quick Specs</h4>
                    <ul className="space-y-2 text-xs">
                      <li className="flex justify-between py-1.5 border-b border-[#E5E7EB] text-[#707873]">
                        <span>Foundation Depth:</span>
                        <span className="font-bold text-[#18211E] tabular-nums">7.5 Feet</span>
                      </li>
                      <li className="flex justify-between py-1.5 border-b border-[#E5E7EB] text-[#707873]">
                        <span>Concrete Grade:</span>
                        <span className="font-bold text-[#18211E]">M25 Ready Mix</span>
                      </li>
                      <li className="flex justify-between py-1.5 border-b border-[#E5E7EB] text-[#707873]">
                        <span>Rebar Grade:</span>
                        <span className="font-bold text-[#18211E]">Fe 550D TMT</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {drawerContentId !== 'project_summary' && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[#707873] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[rgba(27,61,52,0.06)] text-[#1B3D34] flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#18211E] font-heading">Detail Inspector</h4>
                    <p className="text-xs text-[#707873] max-w-xs mt-1 leading-relaxed">Select any BOQ row or material card to inspect engineered specs and vendor guidelines.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F8F6] flex justify-between items-center">
              <span className="text-xs text-[#707873]">Cost Calculator Spec v1.0</span>
              <button
                onClick={closeDrawer}
                className="inline-flex items-center text-xs font-bold text-[#1B3D34] hover:text-[#142F28] gap-1 cursor-pointer transition-colors"
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
