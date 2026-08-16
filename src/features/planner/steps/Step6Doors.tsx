import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { DoorOpen, Check, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step6Doors: React.FC = () => {
  const { doors, setDoorSelection } = useWizardStore();
  const quantities = useQuantities();

  const mainCount = quantities.mainDoorsCount || 0;
  const internalCount = quantities.internalDoorsCount || 0;
  const bathroomCount = quantities.bathroomDoorsCount || 0;

  const mainDoorOptions: { label: 'Premium Teak' | 'Normal Teak'; rate: number; desc: string }[] = [
    { label: 'Premium Teak', rate: 65000, desc: 'First-grade Burma Teakwood carved frame and shutter.' },
    { label: 'Normal Teak', rate: 42000, desc: 'Honnavar / Commercial Teakwood frame with veneer panel shutter.' },
  ];

  const internalDoorOptions: { label: 'Flush Door' | 'Laminate Door'; rate: number; desc: string }[] = [
    { label: 'Flush Door', rate: 12500, desc: 'Commercial hardwood core flush doors with teak wood frame.' },
    { label: 'Laminate Door', rate: 16500, desc: 'Pre-laminated designer shutters with matching wooden frame.' },
  ];

  const bathroomDoorOptions: { label: 'WPC Door' | 'FRP / ERP Door'; rate: number; desc: string }[] = [
    { label: 'WPC Door', rate: 11000, desc: '100% Waterproof & termite-proof Wood Plastic Composite doors.' },
    { label: 'FRP / ERP Door', rate: 8500, desc: 'Fiberglass Reinforced Polymer molded waterproof doors.' },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Door Specifications &amp; Joinery</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Door quantities (~{mainCount} Main, ~{internalCount} Internal, ~{bathroomCount} Bathroom) are derived automatically from your floor plan.
        </p>
      </div>

      {/* 1. Main Door */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-widest">
          <DoorOpen className="w-4 h-4 text-blue-600" />
          <h3>Main Entrance Door ({mainCount} Set)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mainDoorOptions.map((opt) => {
            const isSelected = doors.mainDoor === opt.label;
            return (
              <Card
                key={opt.label}
                onClick={() => setDoorSelection('mainDoor', opt.label)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-3 rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-900">{opt.label}</h4>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>{formatCurrency(opt.rate)} / door</span>
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

      {/* 2. Internal Doors */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-widest">
          <DoorOpen className="w-4 h-4 text-blue-600" />
          <h3>Internal Room Doors (~{internalCount} Sets)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {internalDoorOptions.map((opt) => {
            const isSelected = doors.internalDoor === opt.label;
            return (
              <Card
                key={opt.label}
                onClick={() => setDoorSelection('internalDoor', opt.label)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-3 rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-900">{opt.label}</h4>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>{formatCurrency(opt.rate)} / door</span>
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

      {/* 3. Bathroom Doors */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-widest">
          <DoorOpen className="w-4 h-4 text-blue-600" />
          <h3>Bathroom Doors (~{bathroomCount} Sets)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bathroomDoorOptions.map((opt) => {
            const isSelected = doors.bathroomDoor === opt.label;
            return (
              <Card
                key={opt.label}
                onClick={() => setDoorSelection('bathroomDoor', opt.label)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-3 rounded-2xl',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-900">{opt.label}</h4>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>{formatCurrency(opt.rate)} / door</span>
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
    </div>
  );
};
