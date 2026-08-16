import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { Check, HelpCircle, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step7Windows: React.FC = () => {
  const { windows, setWindowSelection } = useWizardStore();
  const quantities = useQuantities();
  const [showCalc, setShowCalc] = useState(false);

  const totalWindowAreaSqFt = quantities.windowAreaSqFt || 0;
  const windowsCount = quantities.windowsCount || 0;

  const materials: { id: 'uPVC' | 'Wood' | 'Aluminium'; title: string; desc: string }[] = [
    { id: 'uPVC', title: 'uPVC Windows', desc: 'Soundproof, weather-sealed multi-chambered vinyl windows.' },
    { id: 'Wood', title: 'Wooden Frames & Shutters', desc: 'Traditional solid timber frames with clear glass panels.' },
    { id: 'Aluminium', title: 'Aluminium Glazing', desc: 'Sleek narrow-profile powder coated metallic frames.' },
  ];

  const subGradeMap: Record<string, { label: string; ratePerSqFt: number; desc: string }[]> = {
    uPVC: [
      { label: 'Standard uPVC', ratePerSqFt: 550, desc: '3-chamber 2.0mm profile with 5mm toughened single glass.' },
      { label: 'Luxury / Fenesta uPVC', ratePerSqFt: 850, desc: 'Heavy-duty multi-chamber Fenesta series with 12mm double DGU glass.' },
    ],
    Wood: [
      { label: 'Teak Wood Frame', ratePerSqFt: 950, desc: 'Full Burma teak frame with polished brass hardware.' },
      { label: 'Sal Frame / Honne Shutter', ratePerSqFt: 680, desc: 'Seasoned Sal wood frame with Honne timber glass shutter.' },
    ],
    Aluminium: [
      { label: 'Anodized Aluminium', ratePerSqFt: 480, desc: '1.6mm anodized silver section with clear float glass.' },
      { label: 'Powder Coated Jindal Aluminium', ratePerSqFt: 620, desc: 'Premium Jindal 2.0mm powder coated track system.' },
    ],
  };

  const selectedMaterial = windows.primaryMaterial;
  const currentSubGrades = selectedMaterial ? subGradeMap[selectedMaterial] : subGradeMap['uPVC'];
  const activeSubGrade = selectedMaterial ? currentSubGrades.find((sg) => sg.label === windows.subGrade) : undefined;
  const totalWindowCost = activeSubGrade ? Math.round(totalWindowAreaSqFt * activeSubGrade.ratePerSqFt) : 0;

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Window Glazing &amp; Sub-Grades</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Select primary window frame material and sub-grade quality for your home.
        </p>
      </div>

      {/* Primary Material Cards */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Primary Window Material</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {materials.map((mat) => {
            const isSelected = windows.primaryMaterial === mat.id;
            return (
              <Card
                key={mat.id}
                onClick={() => setWindowSelection(mat.id)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-2 rounded-2xl flex flex-col justify-between',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900">{mat.title}</h4>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{mat.desc}</p>
                </div>
                <div className="pt-2 text-right">
                  <span className={cn(
                    'text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border inline-flex items-center gap-1',
                    isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                  )}>
                    {isSelected ? '✓ Selected' : <>Select <ArrowRight className="w-2.5 h-2.5 inline" /></>}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Sub-Grade Choices */}
      {selectedMaterial && (
        <section className="space-y-3 pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {windows.primaryMaterial} Sub-Grade Specification
          </h3>
          <div className="space-y-2.5">
            {currentSubGrades.map((sg) => {
              const isSelected = windows.subGrade === sg.label;
              const subCost = Math.round(totalWindowAreaSqFt * sg.ratePerSqFt);
              return (
                <Card
                  key={sg.label}
                  onClick={() => setWindowSelection(windows.primaryMaterial, sg.label)}
                  className={cn(
                    'p-4 cursor-pointer border transition-all flex items-center justify-between rounded-2xl',
                    isSelected
                      ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{sg.label}</h4>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{sg.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(subCost)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">₹{sg.ratePerSqFt}/sq.ft</span>
                    </div>
                    <span className={cn(
                      'text-xs font-extrabold px-3 py-1 rounded-xl border transition-colors flex items-center gap-1',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    )}>
                      {isSelected ? '✓ Selected' : <>Select <ArrowRight className="w-3 h-3 inline" /></>}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Compact Window Area Calculation Note */}
      <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
        <span>Estimated Glazing Area: <strong>{totalWindowAreaSqFt} Sq Ft</strong> ({windowsCount} Windows)</span>
        <button
          type="button"
          onClick={() => setShowCalc(!showCalc)}
          className="text-blue-600 hover:text-blue-700 underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> View calculation
        </button>
      </div>

      {showCalc && (
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
          <p className="font-bold">Window Area Calculation:</p>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Bedrooms (2 windows $\times$ 20 sq ft) + Living (2 picture windows $\times$ 30 sq ft) + Kitchen/Baths ventilation panels calculated automatically.
          </p>
        </div>
      )}
    </div>
  );
};
