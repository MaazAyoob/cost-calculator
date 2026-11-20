import React from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import {
  Layers,
  Sparkles,
  Check,
  DoorClosed,
  Paintbrush,
  Zap,
} from 'lucide-react';

export const Step4Finishes: React.FC = () => {
  const store = useWizardStore();
  const {
    flooringZones,
    doors,
    windows,
    painting,
    bathroomFittings,
    electrical,
    setFlooringZone,
    setDoorSelection,
    setWindowSelection,
    setPaintingSelection,
    setBathroomFittingSelection,
    setElectricalSelection,
  } = store;

  const currentFlooring = flooringZones?.living || 'Vitrified Tiles 800x800mm';
  const currentPaint = painting?.internalPaint || 'Premium Emulsion';
  const currentWindows = windows?.subGrade || 'Standard uPVC';
  const currentSanitary = bathroomFittings?.sanitaryTier || 'Premium (Jaquar / Kohler / Grohe)';

  // 1. Flooring presets
  const handleSelectFlooring = (choice: 'vitrified' | 'granite' | 'marble') => {
    if (choice === 'vitrified') {
      setFlooringZone('living', 'Vitrified Tiles 800x800mm');
      setFlooringZone('kitchenDining', 'Vitrified Tiles');
      setFlooringZone('bedrooms', 'Vitrified Tiles');
    } else if (choice === 'granite') {
      setFlooringZone('living', 'Granite Slabs');
      setFlooringZone('kitchenDining', 'Granite Slabs');
      setFlooringZone('bedrooms', 'Vitrified Tiles 800x800mm');
    } else {
      setFlooringZone('living', 'Italian Marble');
      setFlooringZone('kitchenDining', 'Italian Marble');
      setFlooringZone('bedrooms', 'Wooden Laminated Flooring');
    }
  };

  // 2. Door & Window presets
  const handleSelectOpenings = (choice: 'standard' | 'luxury' | 'economy') => {
    if (choice === 'standard') {
      setDoorSelection('mainDoor', 'Premium Teak');
      setDoorSelection('internalDoor', 'Flush Door');
      setWindowSelection('uPVC', 'Standard uPVC');
    } else if (choice === 'luxury') {
      setDoorSelection('mainDoor', 'Premium Teak');
      setDoorSelection('internalDoor', 'Teak Veneer');
      setWindowSelection('uPVC', 'Luxury / Fenesta uPVC');
    } else {
      setDoorSelection('mainDoor', 'Normal Teak');
      setDoorSelection('internalDoor', 'Flush Door');
      setWindowSelection('Aluminium', 'Standard Aluminium');
    }
  };

  // 3. Paint presets
  const handleSelectPaint = (choice: 'premium' | 'royale' | 'economy') => {
    if (choice === 'premium') {
      setPaintingSelection('Premium Emulsion', 'Ultima Weather Proof', 'Asian Paints');
    } else if (choice === 'royale') {
      setPaintingSelection('Royale Luxury Emulsion', 'Ultima Weather Proof', 'Asian Paints');
    } else {
      setPaintingSelection('Tractor Emulsion', 'Apex Weather Proof', 'Asian Paints');
    }
  };

  // 4. MEP presets
  const handleSelectMep = (choice: 'premium' | 'luxury' | 'economy') => {
    if (choice === 'premium') {
      setBathroomFittingSelection('Premium (Jaquar / Kohler / Grohe)', 'Astral');
      setElectricalSelection('Mid-range (V-Guard)');
    } else if (choice === 'luxury') {
      setBathroomFittingSelection('Luxury (Toto / Duravit)', 'Astral');
      setElectricalSelection('Premium (Finolex / Polycab)');
    } else {
      setBathroomFittingSelection('Mass Market (Cera / Hindware / Parryware)', 'Supreme');
      setElectricalSelection('Economy (Anchor)');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>STEP 04 OF 05 &bull; FINISHES &amp; FITTINGS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Select your home finishes.
        </h2>
        <p className="text-xs sm:text-sm text-[#66716B] leading-relaxed">
          Choose your preferences for floor tiles, doors, windows, paint, and bathroom fittings.
        </p>
      </div>

      {/* 1. Main Flooring Options */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>1. Flooring &amp; Tiles</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: 'vitrified',
              label: 'Vitrified Tiles (800×800mm)',
              sub: 'Hutty Standard / Premium',
              desc: 'High-gloss vitrified tiles in all living spaces, anti-skid in bathrooms & heavy parking tiles.',
              active: currentFlooring.includes('Vitrified'),
            },
            {
              id: 'granite',
              label: 'Granite Slabs & Vitrified',
              sub: 'Natural Stone Accent',
              desc: 'Polished Sadarahalli or Black granite for stairs and lobby, premium vitrified tiles in rooms.',
              active: currentFlooring.includes('Granite'),
            },
            {
              id: 'marble',
              label: 'Italian Marble & Wood Finish',
              sub: 'Luxury Residence',
              desc: 'Imported natural Italian marble in formal living areas, laminated wooden tiles in bedrooms.',
              active: currentFlooring.includes('Marble'),
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectFlooring(item.id as any)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                item.active ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs' : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#18211E] font-heading">{item.label}</span>
                  {item.active && <Check className="w-4 h-4 text-[#C66B4E]" />}
                </div>
                <span className="text-[10px] font-mono font-bold text-[#C66B4E] block">{item.sub}</span>
              </div>
              <p className="text-[11px] text-[#66716B] leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Doors & Windows Options */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <DoorClosed className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>2. Doors &amp; Windows (Joinery)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: 'standard',
              label: 'Teak Main + uPVC 3-Track',
              sub: 'Recommended Standard',
              desc: 'Polished teak main entrance door, quality flush internal doors, and 3-track sliding uPVC windows with insect mesh.',
              active: !currentWindows.includes('Luxury') && !currentWindows.includes('Aluminium'),
            },
            {
              id: 'luxury',
              label: 'Burma Teak + Fenesta uPVC',
              sub: 'Architectural Luxury',
              desc: 'Carved solid Burma teak entrance, veneered internal doors, and acoustic insulated Fenesta uPVC windows.',
              active: currentWindows.includes('Luxury'),
            },
            {
              id: 'economy',
              label: 'Hardwood + Aluminium',
              sub: 'Value Choice',
              desc: 'Hardwood main frame with commercial flush doors and powder-coated aluminium sliding windows.',
              active: currentWindows.includes('Aluminium'),
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectOpenings(item.id as any)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                item.active ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs' : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#18211E] font-heading">{item.label}</span>
                  {item.active && <Check className="w-4 h-4 text-[#C66B4E]" />}
                </div>
                <span className="text-[10px] font-mono font-bold text-[#C66B4E] block">{item.sub}</span>
              </div>
              <p className="text-[11px] text-[#66716B] leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Wall Painting & Weatherproofing */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Paintbrush className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>3. Painting &amp; Surface Finishes</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              id: 'premium',
              label: 'Asian Paints Premium Emulsion',
              sub: 'Putty + Primer + 2 Coats',
              desc: 'Washable interior wall emulsion with smooth matte finish, paired with weather-proof Apex exterior protection.',
              active: currentPaint === 'Premium Emulsion',
            },
            {
              id: 'royale',
              label: 'Asian Paints Royale Luxury',
              sub: 'Teflon Coating + High Sheen',
              desc: 'Luxury stain-resistant Teflon surface emulsion for silky smooth interiors and Ultima weatherproof exterior coating.',
              active: currentPaint.includes('Royale'),
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectPaint(item.id as any)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 select-none ${
                item.active ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs' : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#18211E] font-heading block">{item.label}</span>
                  <span className="text-[10px] font-mono text-[#C66B4E] font-bold block">{item.sub}</span>
                </div>
                {item.active && <Check className="w-4 h-4 text-[#C66B4E]" />}
              </div>
              <p className="text-[11px] text-[#66716B] leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Electrical & Bathroom Fixtures */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#18211E] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#C66B4E]" />
          <span>4. Bathroom &amp; Electrical Fittings</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              id: 'premium',
              label: 'Jaquar / Kohler + Finolex Wiring',
              sub: 'Mid-range / Premium Fixtures',
              desc: 'Jaquar wall-hung sanitaryware, Astral CPVC plumbing pipes, Finolex fire-retardant wiring, and Anchor modular switches.',
              active: currentSanitary.includes('Jaquar') || currentSanitary.includes('Kohler'),
            },
            {
              id: 'luxury',
              label: 'Toto / Grohe + Schneider Modular',
              sub: 'Luxury Imported Fixtures',
              desc: 'Toto or Grohe concealed thermostatic diverters, wall-hung WC, Polycab FRLS wiring, and Schneider designer modular faceplates.',
              active: currentSanitary.includes('Toto') || currentSanitary.includes('Duravit'),
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectMep(item.id as any)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 select-none ${
                item.active ? 'border-[#183B32] bg-[#E8EFE9] shadow-2xs' : 'border-[#E5E7EB] bg-white hover:bg-[#F8F8F6]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#18211E] font-heading block">{item.label}</span>
                  <span className="text-[10px] font-mono text-[#C66B4E] font-bold block">{item.sub}</span>
                </div>
                {item.active && <Check className="w-4 h-4 text-[#C66B4E]" />}
              </div>
              <p className="text-[11px] text-[#66716B] leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};