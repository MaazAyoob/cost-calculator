// ============================================================
// ADMIN CONTROL CENTER — SPACE & ROOMS TAB (Part 4 & Part 5)
// Complete client-controlled room templates and space calculation rules
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Home,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Zap,
  Droplets,
  Layers,
  Edit2
} from 'lucide-react';

export interface RoomTemplateConfig {
  id: string;
  name: string;
  category: 'LIVING' | 'BEDROOM' | 'BATHROOM' | 'KITCHEN' | 'UTILITY' | 'SPECIAL';
  defaultWidthFt: number;
  defaultLengthFt: number;
  minWidthFt: number;
  maxWidthFt: number;
  minLengthFt: number;
  maxLengthFt: number;
  wallHeightFt: number;
  dadoHeightFt?: number;
  floorWastagePercent: number;
  wallTileWastagePercent?: number;
  doorCount: number;
  windowCount: number;
  electricalPoints: number;
  plumbingPoints: number;
  flooringType: string;
  fixtures: Record<string, number>;
}

export const CANONICAL_ROOM_TEMPLATES: RoomTemplateConfig[] = [
  {
    id: 'master_bedroom',
    name: 'Master Bedroom',
    category: 'BEDROOM',
    defaultWidthFt: 14.0,
    defaultLengthFt: 16.0,
    minWidthFt: 12.0,
    maxWidthFt: 20.0,
    minLengthFt: 14.0,
    maxLengthFt: 24.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 2,
    electricalPoints: 12,
    plumbingPoints: 0,
    flooringType: 'Vitrified Living/Bed Tiles (800x1600mm)',
    fixtures: {}
  },
  {
    id: 'regular_bedroom',
    name: 'Bedroom / Guest Room',
    category: 'BEDROOM',
    defaultWidthFt: 12.0,
    defaultLengthFt: 14.0,
    minWidthFt: 10.0,
    maxWidthFt: 16.0,
    minLengthFt: 12.0,
    maxLengthFt: 18.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 1,
    electricalPoints: 10,
    plumbingPoints: 0,
    flooringType: 'Vitrified Living/Bed Tiles (800x1600mm)',
    fixtures: {}
  },
  {
    id: 'living_room',
    name: 'Living Room / Hall',
    category: 'LIVING',
    defaultWidthFt: 16.0,
    defaultLengthFt: 20.0,
    minWidthFt: 12.0,
    maxWidthFt: 24.0,
    minLengthFt: 16.0,
    maxLengthFt: 30.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 2,
    electricalPoints: 16,
    plumbingPoints: 0,
    flooringType: 'Vitrified Living/Bed Tiles (800x1600mm)',
    fixtures: {}
  },
  {
    id: 'dining_room',
    name: 'Dining Room',
    category: 'LIVING',
    defaultWidthFt: 12.0,
    defaultLengthFt: 14.0,
    minWidthFt: 10.0,
    maxWidthFt: 16.0,
    minLengthFt: 10.0,
    maxLengthFt: 18.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 0,
    windowCount: 1,
    electricalPoints: 8,
    plumbingPoints: 1, // Wash basin point
    flooringType: 'Vitrified Living/Bed Tiles (800x1600mm)',
    fixtures: { 'Wash Basin': 1 }
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    category: 'KITCHEN',
    defaultWidthFt: 10.0,
    defaultLengthFt: 12.0,
    minWidthFt: 8.0,
    maxWidthFt: 15.0,
    minLengthFt: 8.0,
    maxLengthFt: 16.0,
    wallHeightFt: 10.0,
    dadoHeightFt: 2.0, // Above counter
    floorWastagePercent: 8.0,
    wallTileWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 1,
    electricalPoints: 12, // High load fridge/microwave/chimney
    plumbingPoints: 2,
    flooringType: 'Anti-Skid Vitrified Ceramic Tiles',
    fixtures: { 'Kitchen Sink (SS)': 1, 'Sink Cock': 1 }
  },
  {
    id: 'attached_bathroom',
    name: 'Attached Bathroom / Toilet',
    category: 'BATHROOM',
    defaultWidthFt: 6.0,
    defaultLengthFt: 8.0,
    minWidthFt: 4.5,
    maxWidthFt: 10.0,
    minLengthFt: 6.0,
    maxLengthFt: 12.0,
    wallHeightFt: 10.0,
    dadoHeightFt: 7.0,
    floorWastagePercent: 8.0,
    wallTileWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 1, // Ventilator
    electricalPoints: 4, // Light, exhaust, geyser
    plumbingPoints: 5,
    flooringType: 'Anti-Skid Ceramic Floor Tiles (300x300mm)',
    fixtures: {
      'Wall-Hung / Floor WC': 1,
      'Wash Basin': 1,
      'Overhead Shower': 1,
      'Health Faucet': 1,
      'Floor Drain': 1
    }
  },
  {
    id: 'common_toilet',
    name: 'Common Toilet / Powder Room',
    category: 'BATHROOM',
    defaultWidthFt: 5.0,
    defaultLengthFt: 6.0,
    minWidthFt: 4.0,
    maxWidthFt: 8.0,
    minLengthFt: 5.0,
    maxLengthFt: 8.0,
    wallHeightFt: 10.0,
    dadoHeightFt: 7.0,
    floorWastagePercent: 8.0,
    wallTileWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 1,
    electricalPoints: 3,
    plumbingPoints: 4,
    flooringType: 'Anti-Skid Ceramic Floor Tiles (300x300mm)',
    fixtures: {
      'Floor WC': 1,
      'Wash Basin': 1,
      'Health Faucet': 1,
      'Floor Drain': 1
    }
  },
  {
    id: 'balcony',
    name: 'Balcony / Verandah',
    category: 'UTILITY',
    defaultWidthFt: 5.0,
    defaultLengthFt: 12.0,
    minWidthFt: 4.0,
    maxWidthFt: 8.0,
    minLengthFt: 6.0,
    maxLengthFt: 20.0,
    wallHeightFt: 3.5, // Railing
    floorWastagePercent: 10.0,
    doorCount: 1,
    windowCount: 0,
    electricalPoints: 3,
    plumbingPoints: 1, // Drain
    flooringType: 'Weather-Resistant Exterior Vitrified Tiles',
    fixtures: { 'Balcony Floor Drain': 1 }
  },
  {
    id: 'utility',
    name: 'Utility / Laundry Yard',
    category: 'UTILITY',
    defaultWidthFt: 5.0,
    defaultLengthFt: 8.0,
    minWidthFt: 4.0,
    maxWidthFt: 8.0,
    minLengthFt: 5.0,
    maxLengthFt: 12.0,
    wallHeightFt: 10.0,
    dadoHeightFt: 4.0,
    floorWastagePercent: 8.0,
    wallTileWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 1,
    electricalPoints: 4, // Washing machine, dryer
    plumbingPoints: 2,
    flooringType: 'Anti-Skid Matte Ceramic Tiles',
    fixtures: { 'Washing Machine Inlet Cock': 1, 'Floor Drain': 1 }
  },
  {
    id: 'pooja_room',
    name: 'Pooja Room',
    category: 'SPECIAL',
    defaultWidthFt: 5.0,
    defaultLengthFt: 6.0,
    minWidthFt: 3.5,
    maxWidthFt: 8.0,
    minLengthFt: 4.0,
    maxLengthFt: 10.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 0,
    electricalPoints: 4,
    plumbingPoints: 0,
    flooringType: 'Polished Marble / Granite Flooring',
    fixtures: {}
  },
  {
    id: 'home_office',
    name: 'Study / Home Office',
    category: 'SPECIAL',
    defaultWidthFt: 10.0,
    defaultLengthFt: 10.0,
    minWidthFt: 8.0,
    maxWidthFt: 16.0,
    minLengthFt: 8.0,
    maxLengthFt: 16.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 1,
    electricalPoints: 8,
    plumbingPoints: 0,
    flooringType: 'Vitrified Living/Bed Tiles (800x1600mm)',
    fixtures: {}
  },
  {
    id: 'store_room',
    name: 'Store Room',
    category: 'SPECIAL',
    defaultWidthFt: 5.0,
    defaultLengthFt: 7.0,
    minWidthFt: 4.0,
    maxWidthFt: 8.0,
    minLengthFt: 5.0,
    maxLengthFt: 10.0,
    wallHeightFt: 10.0,
    floorWastagePercent: 8.0,
    doorCount: 1,
    windowCount: 0,
    electricalPoints: 2,
    plumbingPoints: 0,
    flooringType: 'Anti-Skid Vitrified Ceramic Tiles',
    fixtures: {}
  }
];

export const SpaceRoomsTab: React.FC = () => {
  const { draftParameters, updateDraftParameter } = useAdminStore();
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplateConfig>(CANONICAL_ROOM_TEMPLATES[0]);
  const [isEditing, setIsEditing] = useState(false);

  // Editable local state
  const [formState, setFormState] = useState<RoomTemplateConfig>(CANONICAL_ROOM_TEMPLATES[0]);

  const handleSelect = (tmpl: RoomTemplateConfig) => {
    setSelectedTemplate(tmpl);
    setFormState(tmpl);
    setIsEditing(false);
  };

  const handleSaveDraft = () => {
    // Record into draftParameters
    updateDraftParameter(`space.room.${formState.id}.width_ft`, formState.defaultWidthFt);
    updateDraftParameter(`space.room.${formState.id}.length_ft`, formState.defaultLengthFt);
    updateDraftParameter(`space.room.${formState.id}.wall_height_ft`, formState.wallHeightFt);
    if (formState.dadoHeightFt !== undefined) {
      updateDraftParameter(`space.room.${formState.id}.dado_height_ft`, formState.dadoHeightFt);
    }
    updateDraftParameter(`space.room.${formState.id}.electrical_points`, formState.electricalPoints);
    updateDraftParameter(`space.room.${formState.id}.plumbing_points`, formState.plumbingPoints);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Home className="w-5 h-5 text-[#1B3D34]" />
            Space & Room Archetypes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin configuration for standard room dimensions, dado tile heights, fixture counts, and MEP point templates.
          </p>
        </div>

        {/* Global Space Calculation Rules (Part 5) */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Circulation Allowance</span>
            <strong className="font-mono text-slate-800">
              {draftParameters['space.circulation_percent'] || 10}%
            </strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[11px] text-slate-500 block">Staircase Floor Area</span>
            <strong className="font-mono text-slate-800">
              {draftParameters['space.staircase_area_sqft'] || 180} sqft
            </strong>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Template Selector List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            Room Archetypes ({CANONICAL_ROOM_TEMPLATES.length})
          </span>
          <div className="space-y-1.5">
            {CANONICAL_ROOM_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate.id === tmpl.id;
              const hasDraft =
                draftParameters[`space.room.${tmpl.id}.width_ft`] !== undefined ||
                draftParameters[`space.room.${tmpl.id}.length_ft`] !== undefined;

              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelect(tmpl)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold font-heading block">
                      {tmpl.name}
                    </span>
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {tmpl.defaultWidthFt} × {tmpl.defaultLengthFt} ft ({tmpl.defaultWidthFt * tmpl.defaultLengthFt} sqft)
                    </span>
                  </div>

                  {hasDraft && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-[#F28C28]'
                    }`}>
                      DRAFT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Template Editor */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 font-heading">
                      {selectedTemplate.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                      {selectedTemplate.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls synthesized default dimensions when client adds a {selectedTemplate.name.toLowerCase()} in Wizard.
                  </p>
                </div>

                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Modify Defaults
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <Button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-3 py-1.5 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl"
                    >
                      Stage Changes
                    </Button>
                  </div>
                )}
              </div>

              {/* Grid of Room Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Width */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Default Width</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formState.defaultWidthFt}
                      onChange={(e) => setFormState({ ...formState, defaultWidthFt: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="text-base font-bold font-mono text-[#1B3D34] block">
                      {formState.defaultWidthFt} ft
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    Range: {selectedTemplate.minWidthFt}–{selectedTemplate.maxWidthFt} ft
                  </span>
                </div>

                {/* Length */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Default Length</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formState.defaultLengthFt}
                      onChange={(e) => setFormState({ ...formState, defaultLengthFt: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="text-base font-bold font-mono text-[#1B3D34] block">
                      {formState.defaultLengthFt} ft
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    Range: {selectedTemplate.minLengthFt}–{selectedTemplate.maxLengthFt} ft
                  </span>
                </div>

                {/* Calculated Floor Area */}
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">Default Floor Area</span>
                  <span className="text-base font-bold font-mono text-emerald-900 block">
                    {(formState.defaultWidthFt * formState.defaultLengthFt).toFixed(1)} sqft
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {((formState.defaultWidthFt * formState.defaultLengthFt) * 0.0929).toFixed(1)} sqm carpet
                  </span>
                </div>

                {/* Wall Height */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Wall Height</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formState.wallHeightFt}
                      onChange={(e) => setFormState({ ...formState, wallHeightFt: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="text-base font-bold font-mono text-[#1B3D34] block">
                      {formState.wallHeightFt} ft
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">Clear floor to slab height</span>
                </div>

                {/* Dado Height (if applicable) */}
                {selectedTemplate.dadoHeightFt !== undefined && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Dado Tile Height</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formState.dadoHeightFt}
                        onChange={(e) => setFormState({ ...formState, dadoHeightFt: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                      />
                    ) : (
                      <span className="text-base font-bold font-mono text-[#1B3D34] block">
                        {formState.dadoHeightFt} ft
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Wall tile vertical perimeter</span>
                  </div>
                )}

                {/* Electrical Points */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Electrical Points
                  </span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formState.electricalPoints}
                      onChange={(e) => setFormState({ ...formState, electricalPoints: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="text-base font-bold font-mono text-[#1B3D34] block">
                      {formState.electricalPoints} points
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">Lights, fans, sockets & AC</span>
                </div>

                {/* Plumbing Points */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-500" />
                    Plumbing Points
                  </span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formState.plumbingPoints}
                      onChange={(e) => setFormState({ ...formState, plumbingPoints: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="text-base font-bold font-mono text-[#1B3D34] block">
                      {formState.plumbingPoints} points
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">Water supply and drain lines</span>
                </div>

                {/* Floor Wastage */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Floor Tile Wastage</span>
                  <span className="text-base font-bold font-mono text-slate-800 block">
                    {formState.floorWastagePercent}%
                  </span>
                  <span className="text-[10px] text-slate-400">Cutting and edge allowance</span>
                </div>
              </div>

              {/* Sanitary / Hardware Fixtures list */}
              {Object.keys(selectedTemplate.fixtures).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">
                    Default Fixture Template
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(selectedTemplate.fixtures).map(([name, qty]) => (
                      <div key={name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{name}</span>
                        <strong className="font-mono text-[#1B3D34]">{qty} No.</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
