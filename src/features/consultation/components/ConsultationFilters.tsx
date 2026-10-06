import React from 'react';
import { Search, MapPin, Tag, X, Filter } from 'lucide-react';
import {
  LAUNCH_CONSULTATION_CATEGORIES,
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
  POPULAR_LOCATIONS,
} from '../../../config/consultation';

interface ConsultationFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  totalResults: number;
}

export const ConsultationFilters: React.FC<ConsultationFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedCity,
  onSelectCity,
  totalResults,
}) => {
  const categories = ['ALL', ...LAUNCH_CONSULTATION_CATEGORIES];

  const hasActiveFilters = selectedCategory !== 'ALL' || searchQuery.trim().length > 0 || selectedCity !== 'ALL';

  const handleResetFilters = () => {
    onSelectCategory('ALL');
    onSearchChange('');
    onSelectCity('ALL');
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Top Bar: Search Input + Location Dropdown + Fixed Fee Badge */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#4B5563] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by consultant name, expertise, or keyword..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#F8F8F6] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#1B3D34] placeholder-[#4B5563]/70 focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#1B3D34] p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="relative w-full md:w-56 shrink-0">
          <MapPin className="w-4 h-4 text-[#4B5563] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-[#F8F8F6] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:bg-white transition-all cursor-pointer appearance-none font-medium"
          >
            <option value="ALL">All Bangalore &amp; Zones</option>
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Launch Fee Badge */}
        <div className="shrink-0 flex items-center justify-between md:justify-center gap-2 px-3.5 py-2.5 bg-[#F8F8F6] border border-[#E5E7EB] rounded-xl text-xs">
          <span className="text-[#4B5563] font-medium">Standard Fee:</span>
          <span className="font-mono font-bold text-[#1B3D34] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
            {LAUNCH_CONSULTATION_PRICE_DISPLAY}
          </span>
        </div>
      </div>

      {/* Category Pills (Horizontal scrollable on mobile) */}
      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B3D34] text-white shadow-xs'
                    : 'bg-[#F8F8F6] text-[#4B5563] hover:text-[#1B3D34] hover:bg-[#E5E7EB]/50'
                }`}
              >
                {cat === 'ALL' ? 'All Experts' : cat}
              </button>
            );
          })}
        </div>

        {/* Clear Filters Button if any filter active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="shrink-0 text-xs font-bold text-[#F28C28] hover:text-[#1B3D34] transition-colors flex items-center gap-1 cursor-pointer pl-2"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#4B5563] pt-1">
        <span>
          Showing <strong className="text-[#1B3D34]">{totalResults}</strong> approved expert{totalResults === 1 ? '' : 's'}
        </span>
        <span className="text-[11px] text-[#4B5563]">
          Each consultation is verified by Hutty before scheduling
        </span>
      </div>
    </div>
  );
};
