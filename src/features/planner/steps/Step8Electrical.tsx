import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { Zap, Check, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step8Electrical: React.FC = () => {
  const { electrical, setElectricalSelection } = useWizardStore();
  const quantities = useQuantities();
  const [showQty, setShowQty] = useState(false);

  const wireM = quantities.electricalWireMetres || 0;
  const conduitM = quantities.conduitsMetres || 0;
  const points = quantities.lightingPoints || 0;
  const modules = quantities.switchModules || 0;

  const wireTiers: {
    id: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)';
    title: string;
    brand: string;
    ratePerMetre: number;
    desc: string;
    recommended?: boolean;
  }[] = [
    {
      id: 'Economy (Anchor)',
      title: 'Economy Tier',
      brand: 'Anchor by Panasonic',
      ratePerMetre: 28,
      desc: 'FR PVC insulated copper wires for standard household lighting.',
    },
    {
      id: 'Mid-range (V-Guard)',
      title: 'Mid-Range Tier',
      brand: 'V-Guard Super Shield',
      ratePerMetre: 36,
      desc: 'FRLS (Flame Retardant Low Smoke) 100% electrolytic copper wiring.',
      recommended: true,
    },
    {
      id: 'Premium (Finolex / Polycab)',
      title: 'Premium Tier',
      brand: 'Finolex / Polycab',
      ratePerMetre: 48,
      desc: 'High temperature zero-halogen flame resistant industrial grade wiring.',
    },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Electrical Wiring Quality</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Conduit is pre-selected as Heavy-Duty ISI PVC. Choose your preferred electrical wire quality tier.
        </p>
      </div>

      {/* Pre-Selected Conduit Banner */}
      <Card className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Heavy-Duty ISI Marked PVC Conduit</h4>
            <span className="text-[11px] text-blue-700 font-medium">Pre-selected fire safety embedded conduit system</span>
          </div>
        </div>
        <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100 px-3 py-1 rounded-xl shrink-0">Included</span>
      </Card>

      {/* Wire Tiers Selection Cards */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Choose Wire Quality Tier</h3>
        <div className="space-y-2.5">
          {wireTiers.map((tier) => {
            const isSelected = electrical.wireTier === tier.id;
            const approxWireCost = Math.round(wireM * tier.ratePerMetre);
            return (
              <Card
                key={tier.id}
                onClick={() => setElectricalSelection(tier.id)}
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
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">{tier.title}</h4>
                      <span className="text-[11px] font-bold text-blue-700">({tier.brand})</span>
                      {tier.recommended && (
                        <span className="text-[10px] font-extrabold bg-blue-100/80 text-blue-700 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(approxWireCost)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">₹{tier.ratePerMetre}/m</span>
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

      {/* Hidden Technical Quantities Drawer */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setShowQty(!showQty)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> {showQty ? 'Hide technical quantities' : 'View estimated quantities'}
        </button>
      </div>

      {showQty && (
        <Card className="p-4 bg-white border border-slate-200 text-xs space-y-3 rounded-2xl shadow-soft-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Derived Electrical Quantities
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Conduit Length</span>
              <span className="font-extrabold text-slate-900 text-xs">{conduitM.toLocaleString()} m</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Wire Length</span>
              <span className="font-extrabold text-blue-600 text-xs">{wireM.toLocaleString()} m</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Lighting Points</span>
              <span className="font-extrabold text-slate-900 text-xs">{points} Points</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Switch Modules</span>
              <span className="font-extrabold text-slate-900 text-xs">{modules} Modules</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
