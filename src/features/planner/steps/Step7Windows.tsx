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
    { id: 'uPVC', title: 'uPVC Windows', desc: 'Soundproof, weather-sealed multi-chambered vinyl frames.' },
    { id: 'Wood', title: 'Solid Wood Windows', desc: 'Natural hardwood timber frames with glass panels.' },
    { id: 'Aluminium', title: 'Aluminium Windows', desc: 'Slim-profile powder coated metallic frames.' },
  ];

  const subGradeMap: Record<string, { label: string; ratePerSqFt: number; desc: string }[]> = {
    uPVC: [
      { label: 'Standard uPVC', ratePerSqFt: 550, desc: '3-chamber profile with 5mm toughened single glass.' },
      { label: 'Luxury / Fenesta uPVC', ratePerSqFt: 850, desc: 'Heavy-duty multi-chamber profile with double DGU acoustic glass.' },
    ],
    Wood: [
      { label: 'Teak Wood Frame', ratePerSqFt: 950, desc: 'Burma teak frame with brass hardware.' },
      { label: 'Sal Frame / Honne Shutter', ratePerSqFt: 680, desc: 'Seasoned Sal wood frame with Honne timber glass shutter.' },
    ],
    Aluminium: [
      { label: 'Anodized Aluminium', ratePerSqFt: 480, desc: '1.6mm anodized silver section with clear float glass.' },
      { label: 'Powder Coated Jindal Aluminium', ratePerSqFt: 620, desc: 'Heavy-duty 2.0mm powder coated track system.' },
    ],
  };

  const selectedMaterial = windows.primaryMaterial || 'uPVC';
  const currentSubGrades = subGradeMap[selectedMaterial] || subGradeMap['uPVC'];

  return (
    <div className="space-y-8 text-left select-none">
      {/* Editorial Step Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1B3D34] uppercase block">
          STEP 07
        </span>
        <h2 className="heading-sm text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight">
          Windows &amp; Glazing
        </h2>
        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          Choose window framing materials and glazing performance grades (~{totalWindowAreaSqFt} sq.ft across {windowsCount} openings).
        </p>
      </div>

      {/* 1. Primary Window Material */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Primary Framing Material
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {materials.map((mat) => {
            const isSelected = windows.primaryMaterial === mat.id;
            return (
              <div
                key={mat.id}
                onClick={() => setWindowSelection(mat.id)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer space-y-1 text-left',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1B3D34]">{mat.title}</h4>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#1B3D34] text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#4B5563] leading-tight">{mat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Grade Choice */}
      <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          {selectedMaterial} Specification Grade
        </label>
        <div className="space-y-2.5">
          {currentSubGrades.map((sg) => {
            const isSelected = windows.subGrade === sg.label;
            const subCost = Math.round(totalWindowAreaSqFt * sg.ratePerSqFt);
            return (
              <div
                key={sg.label}
                onClick={() => setWindowSelection(selectedMaterial, sg.label)}
                className={cn(
                  'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'bg-[rgba(27,61,52,0.08)] border-[#1B3D34] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:bg-[rgba(27,61,52,0.04)]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#E5E7EB] text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B3D34]">{sg.label}</h4>
                    <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5">{sg.desc}</p>
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
