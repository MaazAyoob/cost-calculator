import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { Check } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';
import { HowWeCalculatedThis } from '../../../components/common/HowWeCalculatedThis';

export const Step7Windows: React.FC = () => {
  const { windows, setWindowSelection } = useWizardStore();
  const quantities = useQuantities();
  const { getWindowRecommendation } = useRecommendations();
  const rec = getWindowRecommendation();

  const totalWindowAreaSqFt = quantities.windowAreaSqFt || 200;
  const windowsCount = quantities.windowsCount || 10;

  const materials: { id: 'uPVC' | 'Wood' | 'Aluminium'; title: string; desc: string }[] = [
    { id: 'uPVC', title: 'uPVC Windows', desc: 'Acoustic & weather sealed' },
    { id: 'Wood', title: 'Solid Timber', desc: 'Natural hardwood frames' },
    { id: 'Aluminium', title: 'Aluminium', desc: 'Slim architectural profile' },
  ];

  const subGradeMap: Record<string, { label: string; ratePerSqFt: number; desc: string }[]> = {
    uPVC: [
      { label: 'Standard uPVC', ratePerSqFt: 550, desc: '3-chamber profile with 5mm toughened clear glass and SS mesh.' },
      { label: 'Luxury / Fenesta uPVC', ratePerSqFt: 850, desc: 'Multi-chamber heavy profile with double DGU acoustic insulated glass.' },
    ],
    Wood: [
      { label: 'Teak Wood Frame', ratePerSqFt: 950, desc: 'First-grade Burma teakwood frame with brass architectural hardware.' },
      { label: 'Sal Frame / Honne Shutter', ratePerSqFt: 680, desc: 'Heavy seasoned Sal frame with Honne timber glass shutters.' },
    ],
    Aluminium: [
      { label: 'Anodized Aluminium', ratePerSqFt: 480, desc: '1.6mm anodized architectural sections with float glass.' },
      { label: 'Powder Coated Jindal Aluminium', ratePerSqFt: 620, desc: '2.0mm powder coated heavy-duty track sliding system.' },
    ],
  };

  const selectedMaterial = windows.primaryMaterial || rec.primaryMaterial;
  const currentSubGrades = subGradeMap[selectedMaterial] || subGradeMap['uPVC'];
  const selectedSubGrade = windows.subGrade || (selectedMaterial === rec.primaryMaterial ? rec.subGrade : currentSubGrades[0].label);

  return (
    <div className="space-y-6 text-left">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 07
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          WINDOWS &amp; GLAZING
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Choose window framing and glass acoustic performance (~{totalWindowAreaSqFt} sq.ft across {windowsCount} openings).
        </p>
      </div>

      {/* ── 1. FRAMING MATERIAL ── */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Framing Material
        </label>
        <div className="grid grid-cols-3 gap-2">
          {materials.map((mat) => {
            const isSelected = selectedMaterial === mat.id;
            const isRecommended = mat.id === rec.primaryMaterial;
            return (
              <div
                key={mat.id}
                onClick={() => setWindowSelection(mat.id)}
                className={cn(
                  'hutty-tactile-card p-3 space-y-1',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-extrabold text-[#1B3D34]">{mat.title}</h4>
                    {isRecommended && (
                      <span className="text-[8px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-1.5 py-0.5 rounded-full border border-[#1B3D34]/20">
                        {rec.badgeLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1B3D34] shrink-0" />}
                </div>
                <p className="text-[10px] text-[#4B5563] truncate">{mat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. SUB-GRADE PERFORMANCE ── */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#1B3D34] uppercase tracking-wider">
            {selectedMaterial} Specification Tier
          </label>
          <span className="font-mono text-[#4B5563] text-[11px]">Computed takeoff</span>
        </div>

        <div className="space-y-2">
          {currentSubGrades.map((sg) => {
            const isSelected = selectedSubGrade === sg.label;
            const isRecommended = sg.label === rec.subGrade;
            const subCost = Math.round(totalWindowAreaSqFt * sg.ratePerSqFt);
            return (
              <div
                key={sg.label}
                onClick={() => setWindowSelection(selectedMaterial, sg.label)}
                className={cn(
                  'hutty-tactile-card flex items-center justify-between',
                  isSelected && 'hutty-tactile-card-selected'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                      isSelected ? 'bg-[#1B3D34] text-white' : 'border border-[#D1D5DB]'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{sg.label}</h4>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{sg.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {formatCurrency(subCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">₹{sg.ratePerSqFt}/sq.ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CALCULATION TRANSPARENCY: WINDOWS & GLAZING ── */}
      <HowWeCalculatedThis stepKey="windows" className="mt-4" />

    </div>
  );
};
