import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { useCalculationStore } from '../../../store/useCalculationStore';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { Check, ChevronDown, ChevronUp, Zap, Box, Layers, HelpCircle } from 'lucide-react';
import { cn, formatCurrency } from '../../../utils/cn';
import { getElectricalWireRate } from '../../../calculation-engine/data/brandDatabase';
import { rateService } from '../../../calculation-engine/data/rateService';

export const Step8Electrical: React.FC = () => {
  const { electrical, setElectricalSelection, rooms, floors } = useWizardStore();
  const { result } = useCalculationStore();
  const { quantities, boq } = result;
  const { getElectricalRecommendation } = useRecommendations();
  const rec = getElectricalRecommendation();
  const [showHowCalculated, setShowHowCalculated] = useState(false);

  const selectedTier = electrical.wireTier || rec.wireTier;

  const wireTiers: {
    id: 'Economy (Anchor)' | 'Mid-range (V-Guard)' | 'Premium (Finolex / Polycab)';
    title: string;
    brand: string;
    desc: string;
  }[] = [
    {
      id: 'Economy (Anchor)',
      title: 'Standard Wiring Grade',
      brand: 'Anchor by Panasonic',
      desc: 'FR PVC insulated pure electrolytic copper wiring for residential circuits.',
    },
    {
      id: 'Mid-range (V-Guard)',
      title: 'Flame Retardant FRLS',
      brand: 'V-Guard Super Shield',
      desc: 'Flame Retardant Low Smoke pure copper multi-strand safety cables.',
    },
    {
      id: 'Premium (Finolex / Polycab)',
      title: 'Industrial Heavy Duty',
      brand: 'Finolex / Polycab',
      desc: 'Zero-halogen high insulation resistance flame retardant cables.',
    },
  ];

  // Selected brand identifier
  const brandIdentifier = selectedTier.includes('Anchor')
    ? 'Anchor'
    : selectedTier.includes('V-Guard')
    ? 'V-Guard'
    : 'Finolex';

  const brandKey = brandIdentifier === 'Anchor' ? 'anchor' : brandIdentifier === 'V-Guard' ? 'vguard' : 'finolex';

  // Resolved rates per gauge via centralized rate service
  const rate1_5 = rateService.getEffectiveRate(`electrical.wire_1_5_${brandKey}`, undefined, getElectricalWireRate(brandIdentifier, '1.5'));
  const rate2_5 = rateService.getEffectiveRate(`electrical.wire_2_5_${brandKey}`, undefined, getElectricalWireRate(brandIdentifier, '2.5'));
  const rate4_0 = rateService.getEffectiveRate(`electrical.wire_4_0_${brandKey}`, undefined, getElectricalWireRate(brandIdentifier, '4.0'));
  const rate6_0 = rateService.getEffectiveRate(`electrical.wire_6_0_${brandKey}`, undefined, getElectricalWireRate(brandIdentifier, '6.0'));
  const rateConduit = rateService.getEffectiveRate('electrical.conduit_pvc_25mm', undefined, 35);

  // Electrical BOQ items for subtotal
  const electricalBOQItems = (boq || []).filter((item) => item.category === 'Electrical');
  const totalElectricalCost = electricalBOQItems.reduce((acc, item) => acc + (item.amount || 0), 0);

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── STEP HEADER ── */}
      <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#F28C28] uppercase block">
          STEP 08
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3D34] tracking-tight font-heading leading-tight">
          ELECTRICAL &amp; MEP
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Configure electrical specifications. Quantities are dynamically generated from your {rooms.bedrooms || 0} bedrooms, {rooms.bathrooms || 0} bathrooms, and {floors || 1} floor layout.
        </p>
      </div>

      {/* ── 1. WIRING QUALITY TIERS ── */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider block">
          Wiring Cable Manufacturer Tier
        </label>
        <div className="space-y-2">
          {wireTiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const isRecommended = tier.id === rec.wireTier;
            const tierBrand = tier.id.includes('Anchor') ? 'Anchor' : tier.id.includes('V-Guard') ? 'V-Guard' : 'Finolex';
            const approxWireCost = Math.round(
              (quantities.wire1_5SqMmMetres || 0) * getElectricalWireRate(tierBrand, '1.5') +
              (quantities.wire2_5SqMmMetres || 0) * getElectricalWireRate(tierBrand, '2.5') +
              (quantities.wire4SqMmMetres || 0) * getElectricalWireRate(tierBrand, '4.0') +
              (quantities.wire6SqMmMetres || 0) * getElectricalWireRate(tierBrand, '6.0')
            );

            return (
              <div
                key={tier.id}
                onClick={() => setElectricalSelection(tier.id)}
                className={cn(
                  'hutty-tactile-card flex items-center justify-between cursor-pointer',
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-extrabold text-[#1B3D34]">{tier.title}</h4>
                      <span className="text-[10px] font-mono text-[#4B5563] bg-[#F8F8F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                        {tier.brand}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-bold text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2 py-0.5 rounded-full border border-[#1B3D34]/20">
                          {rec.badgeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4B5563] mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-[#1B3D34] block font-mono">
                    {formatCurrency(approxWireCost)}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">Total Wire Cost</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. WHAT AM I INSTALLING? (POINTS SCHEDULE) ── */}
      <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F28C28]" />
            <h3 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
              What Am I Installing? (Room Point Schedule)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#1B3D34] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
            {quantities.totalElectricalPoints} Points Total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">Light Points</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.lightingPoints}</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">Ceiling Fan Points</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.fanPoints}</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">Power Sockets</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.socketPoints}</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">AC Points (Dedicated)</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.acPoints}</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">Geyser Points</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.geyserPoints}</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">TV / Data Points</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.tvDataPoints}</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">Distribution Boards</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.mainDBCount} Main + {quantities.floorDBCount} Sub-DBs</span>
          </div>
          <div className="p-2 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">EV Charging Point</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.evPoints > 0 ? '1 (32A Provision)' : 'None'}</span>
          </div>
        </div>
      </div>

      {/* ── 3. WHAT AM I CONSUMING? (PHYSICAL TAKEOFF) ── */}
      <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#1B3D34]" />
            <h3 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
              What Am I Consuming? (Conductor &amp; Conduit Takeoff)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#1B3D34] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
            {quantities.electricalWireMetres}m Conductor Total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">1.5 sq.mm Wire (Lights/Fans)</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.wire1_5SqMmMetres} Metres</span>
            <span className="text-[9px] text-[#4B5563] block mt-0.5">@ ₹{rate1_5}/m</span>
          </div>
          <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">2.5 sq.mm Wire (Sockets/TV)</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.wire2_5SqMmMetres} Metres</span>
            <span className="text-[9px] text-[#4B5563] block mt-0.5">@ ₹{rate2_5}/m</span>
          </div>
          <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">4.0 sq.mm Wire (AC/Geysers)</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.wire4SqMmMetres} Metres</span>
            <span className="text-[9px] text-[#4B5563] block mt-0.5">@ ₹{rate4_0}/m</span>
          </div>
          <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB]">
            <span className="text-[10px] text-[#4B5563] block">6.0 sq.mm Wire (Risers/EV)</span>
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.wire6SqMmMetres} Metres</span>
            <span className="text-[9px] text-[#4B5563] block mt-0.5">@ ₹{rate6_0}/m</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#F8F8F6] rounded-lg border border-[#E5E7EB] flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#1B3D34] block">Heavy-Duty PVC Conduit (25mm ISI Embedded)</span>
            <span className="text-[10px] text-[#4B5563]">Slab embedment, wall drop chases, and vertical distribution risers</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-[#1B3D34] font-mono">{quantities.conduitsMetres} Metres</span>
            <span className="text-[10px] text-[#4B5563] block">@ ₹{rateConduit}/m</span>
          </div>
        </div>
      </div>

      {/* ── 4. WHAT DOES IT COST? (ELECTRICAL BOQ TABLE) ── */}
      <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1B3D34]" />
            <h3 className="text-xs font-bold text-[#1B3D34] uppercase tracking-wider">
              What Does It Cost? (Trade Subtotal)
            </h3>
          </div>
          <span className="text-xs font-bold text-[#1B3D34] font-mono bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded-md">
            Subtotal: {formatCurrency(totalElectricalCost)}
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
              <th className="py-2 font-bold uppercase">Item / Specification</th>
              <th className="py-2 font-bold uppercase text-right">Quantity</th>
              <th className="py-2 font-bold uppercase text-right">Rate</th>
              <th className="py-2 font-bold uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {electricalBOQItems.map((item) => (
              <tr key={item.code || item.slNo}>
                <td className="py-2 text-[#1B3D34] font-medium">
                  {item.description}
                  <span className="block text-[10px] text-[#4B5563] font-normal">{item.brand} &bull; {item.remarks}</span>
                </td>
                <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">{item.quantity} {item.unit}</td>
                <td className="py-2 text-right text-[#4B5563] font-mono whitespace-nowrap">₹{item.unitRate.toLocaleString('en-IN')}</td>
                <td className="py-2 text-right font-bold text-[#1B3D34] font-mono whitespace-nowrap">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 5. "HOW IS THIS CALCULATED?" TRANSPARENCY ACCORDION ── */}
      <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] text-xs">
        <button
          type="button"
          onClick={() => setShowHowCalculated(!showHowCalculated)}
          className="w-full flex items-center justify-between font-bold text-[#1B3D34] hover:text-[#F28C28] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#F28C28]" />
            How are electrical quantities calculated?
          </span>
          {showHowCalculated ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHowCalculated && (
          <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-2 text-[#4B5563] leading-relaxed">
            <p>
              <strong>1. Point Schedule:</strong> Derived directly from your configured rooms. Each bedroom allocates 3 lights, 1 fan, 4 sockets, 1 AC point, and 1 TV/data point. Bathrooms allocate 2 lights, 2 sockets, and 1 dedicated geyser point.
            </p>
            <p>
              <strong>2. Conductor Sizing:</strong> Conductor lengths represent single-core copper wire (Phase, Neutral, and Earth loop):
              <br />&bull; <strong>1.5 sq.mm:</strong> ~8.5m per light/fan point including switch loop.
              <br />&bull; <strong>2.5 sq.mm:</strong> ~12.5m per power socket &amp; TV console run.
              <br />&bull; <strong>4.0 sq.mm:</strong> ~22.0m dedicated home-run per AC and geyser.
              <br />&bull; <strong>6.0 sq.mm:</strong> ~35m vertical riser per upper floor + 35m EV charger run.
            </p>
            <p>
              <strong>3. Heavy-Duty Conduit:</strong> Calculated separately from wiring. Represents physical rigid 25mm PVC piping embedded in slab casting (~2.6m per draw point + 15m vertical shaft riser per floor).
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
