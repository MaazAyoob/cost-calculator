import React, { useState } from 'react';
import { Layers, DoorClosed, Zap } from 'lucide-react';
import { Chapter4Flooring } from '../chapters/Chapter4Flooring';
import { Chapter5DoorsWindows } from '../chapters/Chapter5DoorsWindows';
import { Chapter6Finishes } from '../chapters/Chapter6Finishes';

const TABS = [
  { id: 'flooring', label: 'Flooring & Tiles', icon: Layers },
  { id: 'openings', label: 'Doors & Windows', icon: DoorClosed },
  { id: 'services', label: 'Electrical, Plumbing & Finishes', icon: Zap },
];

export const Stage6FinishesMaterials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('flooring');

  return (
    <div className="space-y-6 text-left">
      {/* Stage Header */}
      <div className="space-y-1.5 border-b border-[#CBD5CB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE9] border border-[#B7CDBB] text-[11px] font-bold text-[#183B32]">
          <Layers className="w-3 h-3 text-[#C66B4E]" />
          <span>STAGE 6 OF 8 &bull; FINISHES &amp; FIXTURES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18211E] tracking-tight">
          Choose your flooring, joinery and home finishes.
        </h2>
        <p className="text-xs sm:text-sm text-[#505D56]">
          Configure room tiles, door joinery, window fenestration, electrical circuits, and sanitary fixtures.
          Selections update commercial rates in real time while physical geometric quantities remain 100% constant.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#CBD5CB] no-scrollbar">
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
                  ? 'bg-[#183B32] text-white shadow-xs'
                  : 'bg-white text-[#505D56] border border-[#CBD5CB] hover:bg-[#F8F9F7] hover:border-[#183B32]/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C66B4E]' : 'text-[#687770]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Flooring (Chapter 4) */}
      {activeTab === 'flooring' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Chapter4Flooring embedded={true} />
        </div>
      )}

      {/* TAB 2: Doors & Windows (Chapter 5) */}
      {activeTab === 'openings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Chapter5DoorsWindows embedded={true} />
        </div>
      )}

      {/* TAB 3: Electrical, Plumbing & Finishes (Chapter 6) */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Chapter6Finishes embedded={true} />
        </div>
      )}
    </div>
  );
};
