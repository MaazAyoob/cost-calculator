import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Copy, Trash2, ArrowRight, FolderOpen } from 'lucide-react';
import { useSavedEstimationsStore } from '../../store/useSavedEstimationsStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../utils/cn';
import { modalScaleVariant, backdropFadeVariant } from '../../animations/variants';

interface SavedEstimationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedEstimationsModal: React.FC<SavedEstimationsModalProps> = ({ isOpen, onClose }) => {
  const { savedEstimations, activeId, saveCurrentEstimation, loadEstimation, deleteEstimation, duplicateEstimation } = useSavedEstimationsStore();
  const { result } = useCalculationStore();
  const { addToast } = useUIStore();
  const { budget, area } = result;

  const [newEstimateName, setNewEstimateName] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = budget.totalProjectCost || 0;
    const buaSqFt = area.totalBUASqFt || 0;
    const ratePerSqFt = budget.costPerSqFt || 0;

    saveCurrentEstimation(newEstimateName, totalCost, buaSqFt, ratePerSqFt);
    addToast({
      title: 'Project Draft Saved',
      description: `Saved "${newEstimateName.trim() || 'Estimation'}" to local workspace.`,
      type: 'success',
    });
    setNewEstimateName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="saved-estimations-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-estimations-title"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[#1B3D34]/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            variants={modalScaleVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#E3E8E2] space-y-6 max-h-[85vh] overflow-y-auto text-left"
          >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E3E8E2]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
              PROJECT WORKSPACE
            </span>
            <h2 className="heading-sm text-xl font-bold text-[#1B3D34] mt-0.5">
              Saved Estimations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgba(27,61,52,0.04)] text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form: Save Current Draft */}
        <form onSubmit={handleSaveCurrent} className="bg-[#F8F8F6] rounded-xl p-4 border border-[#E3E8E2] space-y-3">
          <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
            Save Current Calculation State
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Whitefield Villa 30x40"
              value={newEstimateName}
              onChange={(e) => setNewEstimateName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-xs border border-[#E3E8E2] bg-white text-[#1B3D34] focus:outline-none focus:border-[#1B3D34]"
            />
            <button
              type="submit"
              className="hutty-btn-primary px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Save className="w-3.5 h-3.5 text-[#F28C28]" /> Save Estimation
            </button>
          </div>
        </form>

        {/* List of Saved Estimations */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">
            Your Saved Projects ({savedEstimations.length})
          </span>

          {savedEstimations.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-[#E3E8E2] rounded-xl space-y-2">
              <FolderOpen className="w-8 h-8 text-[#4B5563]/50 mx-auto" />
              <p className="text-sm font-bold text-[#1B3D34] font-heading">No saved projects yet</p>
              <p className="text-xs text-[#4B5563] max-w-xs mx-auto">
                Save your current configuration using the form above to easily switch between estimations.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedEstimations.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34]'
                        : 'bg-white border-[#E3E8E2] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#1B3D34] font-heading">{item.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-bold bg-[#1B3D34] text-white px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#4B5563] mt-0.5">
                        {item.buaSqFt > 0 ? `${item.buaSqFt.toLocaleString()} sq.ft • ` : ''}
                        {item.totalCost > 0 ? formatCurrency(item.totalCost) : '₹0'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          loadEstimation(item.id);
                          addToast({
                            title: 'Project Loaded',
                            description: `Switched to "${item.name}".`,
                            type: 'info',
                          });
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B3D34] text-white hover:bg-[#132C25] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3 text-[#F28C28]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateEstimation(item.id)}
                        className="p-1.5 rounded-lg border border-[#E3E8E2] hover:bg-[rgba(27,61,52,0.04)] text-[#4B5563] hover:text-[#1B3D34] transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEstimation(item.id)}
                        className="p-1.5 rounded-lg border border-[#E3E8E2] hover:bg-red-50 text-[#4B5563] hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
};
