import React from 'react';
import { useWizardStore, RoomCounts } from '../../../store/useWizardStore';
import { Card } from '../../../components/ui/Card';
import { Bed, Bath, Utensils, Tv, Sun, ArrowUpCircle, ShieldAlert } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Step2SpaceRequirements: React.FC = () => {
  const { rooms, liftRequired, floors, updateRoomCount, setLiftRequired } = useWizardStore();

  const roomItems: { key: keyof RoomCounts; label: string; min: number; max: number; icon: React.ReactNode }[] = [
    { key: 'bedrooms', label: 'Bedrooms', min: 0, max: 10, icon: <Bed className="w-4 h-4 text-blue-600" /> },
    { key: 'bathrooms', label: 'Attached Bathrooms', min: 0, max: 12, icon: <Bath className="w-4 h-4 text-blue-600" /> },
    { key: 'commonToilets', label: 'Common Toilets', min: 0, max: 4, icon: <Bath className="w-4 h-4 text-slate-500" /> },
    { key: 'kitchen', label: 'Kitchens', min: 0, max: 4, icon: <Utensils className="w-4 h-4 text-blue-600" /> },
    { key: 'dining', label: 'Dining Areas', min: 0, max: 4, icon: <Utensils className="w-4 h-4 text-slate-500" /> },
    { key: 'living', label: 'Living Rooms', min: 0, max: 4, icon: <Tv className="w-4 h-4 text-blue-600" /> },
    { key: 'balcony', label: 'Balconies', min: 0, max: 8, icon: <Sun className="w-4 h-4 text-slate-500" /> },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header Intro */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Space Requirements</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Specify room counts and elevator requirements for your home.
        </p>
      </div>

      {/* House Summary Light Banner */}
      <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 shadow-soft-xs rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">CONFIGURED ROOM SUMMARY</span>
          <div className="text-base font-extrabold text-slate-900">
            {rooms.bedrooms} BHK &bull; {rooms.bathrooms} Baths &bull; {rooms.kitchen} Kitchen &bull; {rooms.living} Living
          </div>
        </div>
        <div className="px-3.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold shrink-0">
          {liftRequired ? 'Elevator Included' : 'Staircase Only'}
        </div>
      </Card>

      {/* Steppers Grid */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Room Quantities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roomItems.map((item) => {
            const val = rooms[item.key] || 0;
            return (
              <Card key={item.key} className="p-3.5 bg-white border border-slate-200/90 shadow-xs rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">{item.icon}</div>
                  <h4 className="text-xs font-extrabold text-slate-900">{item.label}</h4>
                </div>

                {/* Touch Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                  <button
                    type="button"
                    disabled={val <= item.min}
                    onClick={() => updateRoomCount(item.key, -1)}
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-black text-slate-900">{val}</span>
                  <button
                    type="button"
                    disabled={val >= item.max}
                    onClick={() => updateRoomCount(item.key, 1)}
                    className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Elevator Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Elevator Provision</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card
            onClick={() => setLiftRequired(true)}
            className={cn(
              'p-4 cursor-pointer border transition-all rounded-2xl text-center space-y-1',
              liftRequired
                ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15'
                : 'bg-white border-slate-200 hover:border-slate-300'
            )}
          >
            <span className="text-xs font-extrabold text-slate-900 block">Elevator Included</span>
            <span className="text-[11px] text-slate-500 font-medium block">RCC Shaft &amp; 3-Phase Setup</span>
          </Card>

          <Card
            onClick={() => {
              if (floors >= 4) return;
              setLiftRequired(false);
            }}
            className={cn(
              'p-4 cursor-pointer border transition-all rounded-2xl text-center space-y-1',
              !liftRequired
                ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15'
                : floors >= 4
                ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                : 'bg-white border-slate-200 hover:border-slate-300'
            )}
          >
            <span className="text-xs font-extrabold text-slate-900 block">No Elevator</span>
            <span className="text-[11px] text-slate-500 font-medium block">Staircase Access Only</span>
          </Card>
        </div>

        {floors >= 4 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>G+3 or higher floors automatically include elevator provision per municipal code.</span>
          </div>
        )}
      </section>
    </div>
  );
};
