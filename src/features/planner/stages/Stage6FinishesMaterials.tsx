import React, { useState } from 'react';
import { useWizardStore } from '../../../store/useWizardStore';
import { Layers, DoorClosed, Zap, Droplets, Paintbrush, Check, Sparkles, Building2 } from 'lucide-react';

const TABS = [
  { id: 'flooring', label: 'Flooring', icon: Layers },
  { id: 'openings', label: 'Doors & Windows', icon: DoorClosed },
  { id: 'services', label: 'Electrical & Plumbing', icon: Zap },
  { id: 'paint', label: 'Painting & Finishes', icon: Paintbrush },
  { id: 'brands', label: 'Brands (Optional)', icon: Building2 },
];

export const Stage6FinishesMaterials: React.FC = () => {
  const store = useWizardStore();
  const {
    flooringZones,
    doors,
    windows,
    electrical,
    bathroomFittings,
    painting,
    materialBrands,
    setFlooringZone,
    setDoorSelection,
    setWindowSelection,
    setElectricalSelection,
    setBathroomFittingSelection,
    setPaintingSelection,
    setCoreMaterials,
  } = store;

  const [activeTab, setActiveTab] = useState<string>('flooring');

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3EF] border border-[#D5E5DC] text-[11px] font-bold text-[#1B3D34]">
          <Layers className="w-3 h-3 text-[#F28C28]" />
          <span>STAGE 6 OF 8 &bull; FINISHES &amp; MATERIALS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Choose how you'd like your home to look.
        </h2>
        <p className="text-xs sm:text-sm text-[#707873]">
          Select your flooring, doors, windows, and fixtures. Brand choices are optional and update finish rates while keeping physical quantities unchanged.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E7EB] no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-[#1B3D34] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F8F9F7] hover:border-[#1B3D34]/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Flooring */}
      {activeTab === 'flooring' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1B3D34]">Living &amp; Bedroom Flooring</h3>
            <p className="text-xs text-[#687770]">Choose the primary surface finish for your living, dining, and master bedrooms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'Vitrified Tiles (600x600)', label: 'Vitrified Tiles 2×2', desc: 'Durable, stain-resistant, low maintenance. Kajaria/Somany baseline.', rate: '₹85/sqft' },
              { id: 'GVT Tiles (1200x600)', label: 'GVT Glazed Vitrified 4×2', desc: 'Large-format seamless luxury look. Premium matte or high-gloss marble finish.', rate: '₹140/sqft', rec: true },
              { id: 'Granite Flooring', label: 'Natural Granite Slabs', desc: 'High-traffic durability with rich natural stone textures. Ideal for stairs & halls.', rate: '₹180/sqft' },
              { id: 'Italian Marble', label: 'Imported Italian Composite Marble', desc: 'High-end architectural elegance with diamond mirror polishing.', rate: '₹350/sqft' },
            ].map((opt) => {
              const isSelected = (flooringZones?.living || '').includes(opt.label.split(' ')[0]);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFlooringZone('living', opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected ? 'border-2 border-[#1B3D34] bg-[#EBF3EF]' : 'border-[#E5E7EB] bg-white hover:border-[#1B3D34]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1B3D34]">{opt.label}</span>
                    <span className="text-xs font-mono font-bold text-[#1B3D34] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">{opt.rate}</span>
                  </div>
                  <p className="text-xs text-[#687770] leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Doors & Windows */}
      {activeTab === 'openings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1B3D34]">Doors &amp; Window Systems</h3>
            <p className="text-xs text-[#687770]">Select frame joinery materials and external glazed window systems.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#1B3D34] block">Main Entrance Door Style</span>
              {[
                { id: 'Teak Wood Main Door', label: 'Solid Burma Teak (Carved)', desc: 'Heavy brass hardware with traditional or contemporary carving' },
                { id: 'Engineered Teak Door', label: 'Engineered Teak Veneer', desc: 'Modern minimalist fluted or veneer finish with digital lock' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDoorSelection('mainDoor', d.id)}
                  className="w-full p-3 rounded-xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-[#1B3D34] block">{d.label}</span>
                  <span className="text-[11px] text-[#687770] block mt-0.5">{d.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#1B3D34] block">External Windows &amp; Glazing</span>
              {[
                { id: 'uPVC', label: '3-Track uPVC Sliding Windows', desc: 'Sound-dampening acoustic seals with integrated stainless steel mesh' },
                { id: 'Aluminium', label: 'Thermal-Break Architectural Aluminium', desc: 'Slimline aesthetic with toughened solar-reflective glass' },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWindowSelection(w.id as any)}
                  className="w-full p-3 rounded-xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-[#1B3D34] block">{w.label}</span>
                  <span className="text-[11px] text-[#687770] block mt-0.5">{w.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Electrical & Plumbing */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1B3D34]">Electrical Wiring &amp; Sanitaryware</h3>
            <p className="text-xs text-[#687770]">Concealed utility protections and bathroom fixture grades.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#1B3D34] block">Electrical Wiring &amp; Switches</span>
              {[
                { id: 'Premium (Finolex / Polycab)', label: 'Fire-Retardant Finolex / Polycab', desc: 'FRLS multi-strand copper with Schneider/Legrand modular switches' },
                { id: 'Mid-range (V-Guard)', label: 'Standard Modular ISI', desc: 'V-Guard / Anchor Roma grade electrical circuits and distribution box' },
              ].map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setElectricalSelection(e.id as any)}
                  className="w-full p-3 rounded-xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-[#1B3D34] block">{e.label}</span>
                  <span className="text-[11px] text-[#687770] block mt-0.5">{e.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#1B3D34] block">Sanitaryware &amp; Fittings</span>
              {[
                { id: 'Jaquar Continental', label: 'Jaquar / Kohler Contemporary', desc: 'Wall-hung commodes, concealed diverters & chrome bathroom accessories' },
                { id: 'Cera Standard', label: 'Cera / Hindware Essential', desc: 'Floor-mounted commodes with standard single-lever basin mixers' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBathroomFittingSelection(s.id, 'Ashirvad')}
                  className="w-full p-3 rounded-xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-[#1B3D34] block">{s.label}</span>
                  <span className="text-[11px] text-[#687770] block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Painting & Elevation */}
      {activeTab === 'paint' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1B3D34]">Interior &amp; Exterior Painting</h3>
            <p className="text-xs text-[#687770]">Surface coatings, wall putty, and weather protection.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'Royale Luxury', label: 'Asian Paints Royale Luxury Emulsion', desc: 'Silky smooth washable finish with 2 coats Birla white putty', rec: true },
              { id: 'Premium Emulsion', label: 'Asian Paints Apcolite Premium', desc: 'Rich matte finish for standard internal residential surfaces' },
              { id: 'Apex Ultima Exterior', label: 'Apex Ultima Weatherproof Exterior', desc: 'Dirt-resistant anti-fungal exterior acrylic coating with 7-yr warranty' },
              { id: 'Apex Standard', label: 'Apex Weatherproof Standard', desc: 'Reliable all-weather exterior exterior paint protection' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaintingSelection(p.id, 'Apex Ultima', 'Asian Paints')}
                className="p-4 bg-white rounded-2xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1B3D34]">{p.label}</span>
                  {p.rec && <span className="text-[9px] font-bold text-[#1B3D34] bg-[#EBF3EF] px-1.5 py-0.5 rounded">Popular</span>}
                </div>
                <span className="text-[11px] text-[#687770] leading-snug block">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Optional Structural Brands */}
      {activeTab === 'brands' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1B3D34]">Core Material Brand Preferences</h3>
              <span className="text-[10px] font-mono text-[#F28C28] font-bold bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded">
                OPTIONAL
              </span>
            </div>
            <p className="text-xs text-[#687770]">Preferences update live steel and cement rate benchmarks without altering structural quantities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#1B3D34] block">TMT Reinforcement Steel</span>
              {[
                { id: 'Tata Tiscon', label: 'Tata Tiscon 550D', desc: 'Primary integrated plant steel with earthquake-resistant ductile ribs' },
                { id: 'JSW Neosteel', label: 'JSW Neosteel Fe550D', desc: 'Clean, high-strength thermo-mechanically treated rebar' },
                { id: 'Indus TMT', label: 'Indus / Prime ISI 550D', desc: 'High-yield secondary TMT rebar with verified test certificates' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCoreMaterials(s.id, materialBrands.cement || 'UltraTech')}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-[#1B3D34] block">{s.label}</span>
                  <span className="text-[10px] text-[#687770] block">{s.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-[#1B3D34] block">Structural Cement</span>
              {[
                { id: 'UltraTech', label: 'UltraTech 53-Grade / Super', desc: 'Engineered for high initial compressive strength in RCC slabs & columns' },
                { id: 'ACC Cement', label: 'ACC Suraksha Power / Concrete+ ', desc: 'Water-repellent micro-silica blended cement for foundation durability' },
                { id: 'Dalmia Bharat', label: 'Dalmia DSP High-Early', desc: 'Optimized hydration temperature and superior crack resistance' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCoreMaterials(materialBrands.steel || 'Tata Tiscon', c.id)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-left hover:border-[#1B3D34] transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-[#1B3D34] block">{c.label}</span>
                  <span className="text-[10px] text-[#687770] block">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
