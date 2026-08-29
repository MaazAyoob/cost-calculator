import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/useWizardStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import {
  computeMultiPackageComparison,
  ConstructionPackageId,
  CONSTRUCTION_PACKAGES,
} from '../../calculation-engine/data/packageConfig';
import { formatCurrency, cn } from '../../utils/cn';
import {
  X,
  Check,
  Award,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface PackageComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PackageComparisonModal: React.FC<PackageComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedPackage, setSelectedPackage, setStep } = useWizardStore();
  const { result } = useCalculationStore();

  if (!isOpen) return null;

  // Run independent deterministic calculations for all 3 packages using the current project geometry
  const comparison = computeMultiPackageComparison(result.input, selectedPackage);
  const buaSqFt = result.area?.totalBUASqFt || 0;

  const packageList: {
    id: ConstructionPackageId;
    icon: typeof Shield;
    accentColor: string;
  }[] = [
    { id: 'STANDARD', icon: Shield, accentColor: '#1B3D34' },
    { id: 'PREMIUM', icon: Award, accentColor: '#F28C28' },
    { id: 'LUXURY', icon: Sparkles, accentColor: '#7C3AED' },
  ];

  const handleSelectAndClose = (pkgId: ConstructionPackageId) => {
    setSelectedPackage(pkgId, true);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#1B3D34]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl border border-[#E5E7EB] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left select-none"
        >
          {/* ── MODAL HEADER ── */}
          <div className="p-5 sm:p-6 bg-[#F8F8F6] border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1B3D34]">
                  HUTTY SPECIFICATION MATRIX
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
                Compare Construction Standards
              </h2>
              <p className="text-xs text-[#4B5563]">
                Deterministic cost estimates computed for your {buaSqFt > 0 ? `${buaSqFt.toLocaleString()} sq.ft` : ''} project based on municipal bylaws and live market rates.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#4B5563] hover:text-[#1B3D34] hover:bg-white border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
            
            {/* ── HUTTY RECOMMENDATION CARD ── */}
            <div className="p-4 sm:p-5 bg-[rgba(27,61,52,0.04)] rounded-2xl border border-[#1B3D34]/15 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-white bg-[#1B3D34] px-2.5 py-0.5 rounded-full shadow-2xs">
                  RECOMMENDED FOR YOU
                </span>
                <span className="text-xs font-bold text-[#1B3D34]">
                  • {comparison.recommendation.title} Package
                </span>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {comparison.recommendation.rationale}
              </p>
              <div className="text-[11px] text-[#4B5563] pt-1">
                * You can switch to any construction package at any time, or customize specific materials in the calculator steps.
              </div>
            </div>

            {/* ── 3-PACKAGE COMPARISON GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {packageList.map((item) => {
                const pkg = comparison.packageConfigs[item.id];
                const res = comparison.results[item.id];
                const isSelected = selectedPackage === item.id;
                const isRecommended = item.id === comparison.recommendation.recommendedPackageId;
                const Icon = item.icon;
                const cost = res?.budget?.totalProjectCost || 0;
                const rate = res?.budget?.costPerSqFt || 0;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'relative rounded-2xl border p-5 sm:p-6 flex flex-col justify-between space-y-5 transition-all bg-white',
                      isSelected
                        ? 'border-[#1B3D34] ring-2 ring-[#1B3D34] shadow-md bg-[rgba(27,61,52,0.015)]'
                        : 'border-[#E5E7EB] hover:border-[#1B3D34]/40 hover:shadow-xs'
                    )}
                  >
                    {/* Badge */}
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-4 bg-[#1B3D34] text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        RECOMMENDED
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Title & Icon Header */}
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center',
                              isSelected ? 'bg-[#1B3D34] text-white' : 'bg-[#F8F8F6] text-[#4B5563]'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-[#1B3D34] font-heading">
                              {pkg.title}
                            </h3>
                            <span className="text-[10px] text-[#4B5563] font-medium block">
                              {pkg.subtitle}
                            </span>
                          </div>
                        </div>

                        <div
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                            isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#E5E7EB]'
                          )}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {/* Large Deterministic Price */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
                          Estimated Total
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-[#1B3D34] font-heading tracking-tight">
                          {cost > 0 ? formatCurrency(cost) : '₹0'}
                        </div>
                        {rate > 0 && (
                          <span className="text-xs font-mono font-bold text-[#4B5563] block">
                            ₹{rate.toLocaleString()} / sq.ft BUA
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#4B5563] leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Key Specification Highlights */}
                      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                        <span className="text-[10px] font-mono font-bold text-[#1B3D34] uppercase tracking-wider block">
                          KEY SPECIFICATIONS
                        </span>
                        <div className="space-y-1.5 text-xs text-[#1B3D34]">
                          {pkg.keyHighlights.slice(0, 5).map((hl, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] mt-1.5 shrink-0" />
                              <span className="text-[11px] leading-snug text-[#4B5563]">{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTA / Select Button */}
                    <div className="pt-2">
                      {isSelected ? (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-[rgba(27,61,52,0.08)] border border-[#1B3D34]/20 text-[#1B3D34] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-[#1B3D34]" />
                          <span>Currently Selected</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectAndClose(item.id)}
                          className="hutty-btn-secondary w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#1B3D34]"
                        >
                          <span>Switch to {pkg.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invariance note */}
            <div className="p-4 bg-[#F8F8F6] rounded-2xl border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1">
              <span className="font-bold text-[#1B3D34] block">
                Deterministic Quantity Surveying Guarantee:
              </span>
              <p>
                Concrete volumes, structural steel rebar tonnage, and wall masonry quantities are derived directly from site geometry and remain identical across all 3 packages. Cost differences stem strictly from material grade, finish specifications, fixture tiers, and contractor trade rates.
              </p>
            </div>

          </div>

          {/* ── FOOTER ── */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
            <span className="text-xs text-[#4B5563]">
              Active Package: <strong className="text-[#1B3D34] font-heading">{selectedPackage}</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="hutty-btn-primary px-6 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
