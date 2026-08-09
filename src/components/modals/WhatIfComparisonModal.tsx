import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';
import { useCalculationStore } from '../../store/useCalculationStore';
import { useWizardStore, QualityTier } from '../../store/useWizardStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../utils/cn';

interface WhatIfComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfComparisonModal: React.FC<WhatIfComparisonModalProps> = ({ isOpen, onClose }) => {
  const { result } = useCalculationStore();
  const { setQualityTier, setCoreMaterials, setWindowSelection, setBathroomFittingSelection } = useWizardStore();
  const { addToast } = useUIStore();
  const { budget, area } = result;

  if (!isOpen) return null;

  const totalBua = area.totalBUASqFt || 2400;
  const currentRate = budget.costPerSqFt || 2850;
  const currentTotal = budget.totalProjectCost || Math.round(totalBua * currentRate);

  const tiers: {
    id: QualityTier;
    title: string;
    rate: number;
    total: number;
    delta: number;
    specs: {
      steel: string;
      cement: string;
      flooring: string;
      windows: string;
      sanitary: string;
    };
  }[] = [
    {
      id: 'Essential',
      title: 'Essential Specifications',
      rate: Math.round(currentRate * 0.88),
      total: Math.round(totalBua * currentRate * 0.88),
      delta: Math.round(totalBua * currentRate * 0.88) - currentTotal,
      specs: {
        steel: 'Indus TMT (Fe 500)',
        cement: 'ACC Cement',
        flooring: 'Vitrified Tiles (600x600mm)',
        windows: 'Standard 2-Track uPVC',
        sanitary: 'Parryware / Cera',
      },
    },
    {
      id: 'Premium',
      title: 'Premium Specifications (Configured)',
      rate: currentRate,
      total: currentTotal,
      delta: 0,
      specs: {
        steel: 'Tata Tiscon / JSW Neosteel',
        cement: 'UltraTech Super PPC',
        flooring: 'Vitrified & Granite Slabs',
        windows: 'German System uPVC',
        sanitary: 'Jaquar / Kohler Standard',
      },
    },
    {
      id: 'Luxury',
      title: 'Luxury Specifications',
      rate: Math.round(currentRate * 1.24),
      total: Math.round(totalBua * currentRate * 1.24),
      delta: Math.round(totalBua * currentRate * 1.24) - currentTotal,
      specs: {
        steel: 'Tata Tiscon 550D TMT',
        cement: 'UltraTech Super Premium',
        flooring: 'Italian Statuario Marble',
        windows: 'Teak Wood / Thermal Aluminium',
        sanitary: 'Kohler / Grohe Premium',
      },
    },
  ];

  const handleApplyTier = (tier: QualityTier) => {
    setQualityTier(tier);
    if (tier === 'Essential') {
      setCoreMaterials('Indus TMT', 'ACC Cement');
      setWindowSelection('uPVC', 'Standard uPVC');
      setBathroomFittingSelection('Standard', 'Supreme');
    } else if (tier === 'Luxury') {
      setCoreMaterials('Tata Tiscon', 'UltraTech');
      setWindowSelection('Wood', 'Teak Wood Frame');
      setBathroomFittingSelection('Luxury', 'Ashirvad');
    } else {
      setCoreMaterials('Tata Tiscon', 'UltraTech');
      setWindowSelection('uPVC', 'German System uPVC');
      setBathroomFittingSelection('Premium', 'Ashirvad');
    }
    addToast({
      title: `${tier} Specifications Applied`,
      description: `Your project configuration has been updated to ${tier} grade materials.`,
      type: 'info',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              What-If Specification Analysis
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Material Tier Comparison ({totalBua.toLocaleString()} sq.ft Built-Up Area)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => {
            const isCurrent = t.delta === 0;
            return (
              <div
                key={t.id}
                className={`rounded-2xl p-6 border space-y-5 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t.id}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                        Active Config
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {formatCurrency(t.total)}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      ₹{t.rate.toLocaleString()} / sq.ft
                    </div>
                    {!isCurrent && (
                      <div className={`text-xs font-bold mt-1 ${t.delta > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {t.delta > 0 ? `+ ${formatCurrency(t.delta)}` : `- ${formatCurrency(Math.abs(t.delta))}`} vs current
                      </div>
                    )}
                  </div>

                  {/* Specs List */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900 block">TMT Steel:</span>
                      {t.specs.steel}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900 block">Cement:</span>
                      {t.specs.cement}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900 block">Flooring:</span>
                      {t.specs.flooring}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900 block">Windows:</span>
                      {t.specs.windows}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900 block">Sanitaryware:</span>
                      {t.specs.sanitary}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyTier(t.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Selection' : <>Apply {t.id} Tier <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
