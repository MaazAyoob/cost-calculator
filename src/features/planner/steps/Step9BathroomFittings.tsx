import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useQuantities } from '../../../store/useCalculationStore';
import { Card } from '../../../components/ui/Card';
import { Bath, Droplets, Check, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';

export const Step9BathroomFittings: React.FC = () => {
  const { bathroomFittings, setBathroomFittingSelection } = useWizardStore();
  const quantities = useQuantities();

  const fixtureSets = quantities.bathroomFixtureSets || 0;
  const cpvcMetres = quantities.cpvcSupplyMetres || 0;

  const sanitaryTiers: {
    id: 'Mass Market (Cera / Hindware / Parryware)' | 'Premium (Jaquar / Kohler / Grohe)' | 'Luxury (Toto / Duravit)';
    title: string;
    brands: string;
    ratePerSet: number;
    desc: string;
  }[] = [
    {
      id: 'Mass Market (Cera / Hindware / Parryware)',
      title: 'Mass Market Tier',
      brands: 'Cera / Hindware / Parryware',
      ratePerSet: 18000,
      desc: 'Durable vitreous china sanitaryware with single lever brass CP fittings.',
    },
    {
      id: 'Premium (Jaquar / Kohler / Grohe)',
      title: 'Premium Brand Tier',
      brands: 'Jaquar / Kohler / Grohe',
      ratePerSet: 38000,
      desc: 'Wall-hung water closets, thermostatic diverters, and rain shower heads.',
    },
    {
      id: 'Luxury (Toto / Duravit)',
      title: 'Luxury Import Tier',
      brands: 'Toto / Duravit',
      ratePerSet: 85000,
      desc: 'Japanese / German designer sanitaryware with electronic bidet seats and rimless technology.',
    },
  ];

  const cpvcBrands: { id: 'Ashirwad' | 'Supreme' | 'Astral'; name: string; desc: string }[] = [
    { id: 'Ashirwad', name: 'Ashirwad FlowGuard Plus', desc: 'SDR 11 CPVC hot & cold water plumbing system.' },
    { id: 'Supreme', name: 'Supreme Lifeline CPVC', desc: 'Heavy-duty lead-free potable water piping.' },
    { id: 'Astral', name: 'Astral CPVC Pro', desc: 'High pressure NSF certified plumbing system.' },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bathroom Sanitaryware &amp; Plumbing</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Configure sanitaryware fixture tiers and CPVC water supply pipe brands.
        </p>
      </div>

      {/* 1. Sanitaryware Tier */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-widest">
          <Bath className="w-4 h-4 text-blue-600" />
          <h3>Sanitaryware &amp; CP Fitting Tiers</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sanitaryTiers.map((tier) => {
            const isSelected = bathroomFittings.sanitaryTier === tier.id;
            const approxTotal = Math.round(fixtureSets * tier.ratePerSet);
            return (
              <Card
                key={tier.id}
                onClick={() => setBathroomFittingSelection(tier.id, bathroomFittings.cpvcBrand)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-3 rounded-2xl flex flex-col justify-between',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{tier.title}</h4>
                      <span className="text-[11px] font-bold text-blue-600 block">{tier.brands}</span>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">{tier.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="text-blue-600">~{formatCurrency(approxTotal)}</span>
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

      {/* 2. CPVC Pipe Brand */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-widest">
          <Droplets className="w-4 h-4 text-blue-600" />
          <h3>CPVC Plumbing Pipe Brand (~{cpvcMetres} Metres)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cpvcBrands.map((b) => {
            const isSelected = bathroomFittings.cpvcBrand === b.id;
            return (
              <Card
                key={b.id}
                onClick={() => setBathroomFittingSelection(bathroomFittings.sanitaryTier, b.id)}
                className={cn(
                  'p-4 cursor-pointer border transition-all space-y-3 rounded-2xl flex flex-col justify-between',
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-slate-900">{b.name}</h4>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
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
