import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step7Windows: React.FC = () => {
  const { windows, setWindowSelection } = useWizardStore();
  const quantities = useQuantities();

  const totalWindowAreaSqFt = quantities.windowAreaSqFt || 200;
  const windowsCount = quantities.windowsCount || 10;

  const materials: { id: 'uPVC' | 'Wood' | 'Aluminium'; title: string; desc: string }[] = [
    { id: 'uPVC', title: 'uPVC Windows', desc: 'Soundproof, weather-sealed vinyl frames.' },
    { id: 'Wood', title: 'Solid Wood', desc: 'Natural timber frames with glass.' },
    { id: 'Aluminium', title: 'Aluminium', desc: 'Slim-profile powder coated metallic frames.' },
  ];

  const subGradeMap: Record<string, { label: string; ratePerSqFt: number; desc: string }[]> = {
    uPVC: [
      { label: 'Standard uPVC', ratePerSqFt: 550, desc: '3-chamber profile with 5mm toughened single glass.' },
      { label: 'Luxury / Fenesta uPVC', ratePerSqFt: 850, desc: 'Multi-chamber profile with double DGU acoustic glass.' },
    ],
    Wood: [
      { label: 'Teak Wood Frame', ratePerSqFt: 950, desc: 'Burma teak frame with brass hardware.' },
      { label: 'Sal Frame / Honne Shutter', ratePerSqFt: 680, desc: 'Sal wood frame with Honne timber shutter.' },
    ],
    Aluminium: [
      { label: 'Anodized Aluminium', ratePerSqFt: 480, desc: '1.6mm anodized section with float glass.' },
      { label: 'Powder Coated Jindal Aluminium', ratePerSqFt: 620, desc: '2.0mm powder coated track system.' },
    ],
  };

  const selectedMaterial = windows.primaryMaterial || 'uPVC';
  const currentSubGrades = subGradeMap[selectedMaterial] || subGradeMap['uPVC'];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1 pb-1 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 07
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
          Windows &amp; Glazing
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Choose window framing and glass grade (~{totalWindowAreaSqFt} sq.ft across {windowsCount} openings).
        </p>
      </div>

      {/* 1. Primary Material */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Framing Material
        </label>
        <div className="grid grid-cols-3 gap-2">
          {materials.map((mat) => {
            const isSelected = windows.primaryMaterial === mat.id;
            return (
              <div
                key={mat.id}
                onClick={() => setWindowSelection(mat.id)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer space-y-0.5 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{mat.title}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34]" />}
                </div>
                <p className="text-[10px] text-[#4B5563]">{mat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Grade Specification */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          {selectedMaterial} Performance Grade
        </label>
        <div className="space-y-1.5">
          {currentSubGrades.map((sg) => {
            const isSelected = windows.subGrade === sg.label;
            const subCost = Math.round(totalWindowAreaSqFt * sg.ratePerSqFt);
            return (
              <div
                key={sg.label}
                onClick={() => setWindowSelection(selectedMaterial, sg.label)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.06)] border-[#1B3D34] ring-1 ring-[#1B3D34]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F8F8F6]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B3D34]">{sg.label}</h4>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{sg.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1B3D34] block font-mono">
                    {formatCurrency(subCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{sg.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
