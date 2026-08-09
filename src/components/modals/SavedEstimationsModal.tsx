import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Copy, Trash2, ArrowRight, FolderOpen, Plus } from 'lucide-react';
import { useSavedEstimationsStore } from '../../store/useSavedEstimationsStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../utils/cn';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Project Workspace
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Saved Estimations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form: Save Current Draft */}
        <form onSubmit={handleSaveCurrent} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Save Current Calculation State
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Whitefield Villa Draft 1"
              value={newEstimateName}
              onChange={(e) => setNewEstimateName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Save className="w-3.5 h-3.5" /> Save Estimation
            </button>
          </div>
        </form>

        {/* List of Saved Estimations */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Your Saved Projects ({savedEstimations.length})
          </span>

          {savedEstimations.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No saved projects yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Save your current configuration using the form above to easily switch between estimations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedEstimations.map((est) => {
                const isActive = activeId === est.id;
                return (
                  <div
                    key={est.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{est.name}</h4>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                            Loaded
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {est.city} • {est.plotDimensions} • {est.buaSqFt > 0 ? `${est.buaSqFt.toLocaleString()} sq.ft` : 'Plot dimensions'} • {est.createdAt}
                      </p>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {formatCurrency(est.totalCost)}{' '}
                        {est.ratePerSqFt > 0 && <span className="text-xs font-semibold text-blue-600">({`₹${est.ratePerSqFt.toLocaleString()} / sq.ft`})</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          loadEstimation(est.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer flex items-center gap-1"
                      >
                        Load <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => duplicateEstimation(est.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEstimation(est.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
