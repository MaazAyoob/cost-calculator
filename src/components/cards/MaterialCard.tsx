import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { MaterialItem } from '../../types';
import { formatCurrency } from '../../utils/cn';
import { useUIStore } from '../../store/useUIStore';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MaterialCardProps {
  material: MaterialItem;
  onSelectTier?: (id: string, tier: 'Standard' | 'Premium' | 'Luxury') => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onSelectTier }) => {
  const { openDrawer } = useUIStore();

  const tiers: ('Standard' | 'Premium' | 'Luxury')[] = ['Standard', 'Premium', 'Luxury'];

  return (
    <Card className="hover:border-blue-300 transition-all">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
              {material.category}
            </span>
            <button
              onClick={() => openDrawer(`Spec: ${material.name}`, 'project_summary')}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
            >
              Specs <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <h3 className="text-sm font-bold text-slate-900">{material.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{material.brand}</p>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
            {material.specification}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">Select Tier:</div>
          <div className="grid grid-cols-3 gap-1.5">
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => onSelectTier?.(material.id, t)}
                className={cn(
                  'py-1.5 px-2 rounded-lg text-xs font-medium text-center border transition-all flex items-center justify-center gap-1 cursor-pointer',
                  material.selectedTier === t
                    ? 'bg-blue-600 text-white border-blue-600 shadow-soft-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                {material.selectedTier === t && <Check className="w-3 h-3" />}
                {t}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Est. Quantity: {material.estimatedQuantity} {material.unit}</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(material.totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
