// ============================================================
// ADMIN CONTROL CENTER — ROOMS & SPACES SECTION
// Clean visual room cards, specialized bathroom controls, and custom room builder
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Home,
  Layers,
  Plus,
  Info,
  CheckCircle2,
  Sliders,
  Sparkles,
  Droplets,
  Zap,
  Maximize2,
  Trash2,
  HelpCircle,
  X
} from 'lucide-react';

interface StandardRoomCardDef {
  key: string;
  name: string;
  category: string;
  defaultL: number;
  defaultW: number;
  defaultH: number;
  flooringDefault: string;
  electricalPoints: number;
  doors: number;
  windows: number;
  hasBathroom?: boolean;
}

const DEFAULT_ROOM_CARDS: StandardRoomCardDef[] = [
  {
    key: 'master_bedroom',
    name: 'Master Bedroom',
    category: 'Bedroom',
    defaultL: 16.0,
    defaultW: 14.0,
    defaultH: 10.0,
    flooringDefault: 'Vitrified Tiles (800x1600mm)',
    electricalPoints: 12,
    doors: 1,
    windows: 2,
    hasBathroom: true,
  },
  {
    key: 'bedroom',
    name: 'Standard Bedroom / Guest Room',
    category: 'Bedroom',
    defaultL: 14.0,
    defaultW: 10.0,
    defaultH: 10.0,
    flooringDefault: 'Vitrified Tiles (800x800mm)',
    electricalPoints: 8,
    doors: 1,
    windows: 1,
    hasBathroom: false,
  },
  {
    key: 'living',
    name: 'Living Room / Main Hall',
    category: 'Living',
    defaultL: 16.0,
    defaultW: 12.5,
    defaultH: 10.0,
    flooringDefault: 'Italian Marble / Glazed Vitrified',
    electricalPoints: 16,
    doors: 1,
    windows: 2,
    hasBathroom: false,
  },
  {
    key: 'dining',
    name: 'Dining Room',
    category: 'Dining',
    defaultL: 12.0,
    defaultW: 10.0,
    defaultH: 10.0,
    flooringDefault: 'Double Charged Vitrified',
    electricalPoints: 6,
    doors: 0,
    windows: 1,
    hasBathroom: false,
  },
  {
    key: 'kitchen',
    name: 'Kitchen',
    category: 'Kitchen',
    defaultL: 10.0,
    defaultW: 9.0,
    defaultH: 10.0,
    flooringDefault: 'Matte Anti-skid Vitrified',
    electricalPoints: 10,
    doors: 1,
    windows: 1,
    hasBathroom: false,
  },
  {
    key: 'pooja',
    name: 'Puja Room',
    category: 'Special',
    defaultL: 5.0,
    defaultW: 5.0,
    defaultH: 10.0,
    flooringDefault: 'White Marble / Polished Granite',
    electricalPoints: 4,
    doors: 1,
    windows: 0,
    hasBathroom: false,
  },
  {
    key: 'office',
    name: 'Study / Home Office',
    category: 'Work',
    defaultL: 10.0,
    defaultW: 10.0,
    defaultH: 10.0,
    flooringDefault: 'Wooden Laminate / Vitrified',
    electricalPoints: 10,
    doors: 1,
    windows: 1,
    hasBathroom: false,
  },
  {
    key: 'balcony',
    name: 'Sit-out Balcony',
    category: 'Outdoor',
    defaultL: 10.0,
    defaultW: 5.0,
    defaultH: 10.0,
    flooringDefault: 'Wooden Finish Rustic Tiles',
    electricalPoints: 2,
    doors: 1,
    windows: 0,
    hasBathroom: false,
  },
  {
    key: 'utility',
    name: 'Utility / Laundry Area',
    category: 'Utility',
    defaultL: 8.0,
    defaultW: 5.0,
    defaultH: 10.0,
    flooringDefault: 'Heavy Duty Anti-skid Ceramic',
    electricalPoints: 4,
    doors: 1,
    windows: 1,
    hasBathroom: false,
  },
  {
    key: 'storeRoom',
    name: 'Store Room',
    category: 'Storage',
    defaultL: 7.0,
    defaultW: 5.0,
    defaultH: 10.0,
    flooringDefault: 'Ceramic / Vitrified Tiles',
    electricalPoints: 2,
    doors: 1,
    windows: 0,
    hasBathroom: false,
  },
];

export const RoomsSpacesSection: React.FC = () => {
  const {
    draftParameters,
    updateDraftParameter,
    customRooms,
    addCustomRoom,
    removeCustomRoom,
    adminViewMode
  } = useAdminStore();

  // Bathroom settings state
  const bathLength = draftParameters['space.room.bathroom.length_ft'] ?? 6.0;
  const bathWidth = draftParameters['space.room.bathroom.width_ft'] ?? 5.0;
  const bathWallHeight = draftParameters['config.structure.wall_height_ft'] ?? 10.0;
  const bathDadoHeight = draftParameters['config.cladding.bathroom_dado_standard_ft'] ?? 7.0;
  const bathUpturnHeight = draftParameters['config.waterproofing.bathroom_upturn_ft'] ?? 1.0;
  const bathWpMethod = draftParameters['config.waterproofing.bathroom_method'] ?? 'FLOOR_UPTURN';

  // Bathroom fixtures checklist state
  const [wcFixture, setWcFixture] = useState(true);
  const [washBasinFixture, setWashBasinFixture] = useState(true);
  const [showerFixture, setShowerFixture] = useState(true);
  const [healthFaucetFixture, setHealthFaucetFixture] = useState(true);
  const [floorDrainFixture, setFloorDrainFixture] = useState(true);
  const [geyserPointFixture, setGeyserPointFixture] = useState(true);

  // Custom room modal state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLength, setNewRoomLength] = useState(12);
  const [newRoomWidth, setNewRoomWidth] = useState(10);
  const [newRoomHeight, setNewRoomHeight] = useState(10);
  const [newRoomFlooring, setNewRoomFlooring] = useState('Vitrified Tiles (800x800mm)');
  const [newRoomWallFinish, setNewRoomWallFinish] = useState('Premium Acrylic Emulsion');
  const [newRoomElectrical, setNewRoomElectrical] = useState(8);
  const [newRoomPlumbing, setNewRoomPlumbing] = useState(0);
  const [newRoomDoors, setNewRoomDoors] = useState(1);
  const [newRoomWindows, setNewRoomWindows] = useState(1);

  const handleCreateCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    addCustomRoom({
      name: newRoomName.trim(),
      lengthFt: Number(newRoomLength),
      widthFt: Number(newRoomWidth),
      heightFt: Number(newRoomHeight),
      flooring: newRoomFlooring,
      wallFinish: newRoomWallFinish,
      electricalPoints: Number(newRoomElectrical),
      plumbingPoints: Number(newRoomPlumbing),
      doors: Number(newRoomDoors),
      windows: Number(newRoomWindows),
    });

    // Reset and close modal
    setNewRoomName('');
    setShowAddRoomModal(false);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Group 1: Spaces & Dimensions</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Rooms, Spaces & Bathroom Master
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure standard room templates, bathroom waterproofing allowances, and custom client rooms.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowAddRoomModal(true)}
          className="px-4 py-2 bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Room</span>
        </Button>
      </div>

      {/* ── WHAT DOES THIS AFFECT? BADGE ── */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1.5">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>What do these room dimensions affect?</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
          <p>
            <strong className="text-emerald-800 font-semibold">✓ Affects:</strong> Carpet area, internal wall masonry volume, plaster area, floor tile quantities, paintable surfaces, doors, windows, and electrical points.
          </p>
          <p>
            <strong className="text-slate-600 font-semibold">✗ Does not affect:</strong> Plot setbacks, foundation excavation depth, or municipal authority fee limits.
          </p>
        </div>
      </div>

      {/* ── SPECIALIZED SECTION: BATHROOM MASTER (Section 8) ── */}
      <Card className="border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/30 to-white rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bathroom Master Control
                </h3>
                <p className="text-xs text-slate-500">
                  Standard Template: 6 × 5 ft • 7 ft Lintel Dado • 1 ft Waterproofing Upturn
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
              Essential Wet Area
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            {/* Length */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Bathroom Length</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="14.0"
                  value={bathLength}
                  onChange={(e) => updateDraftParameter('space.room.bathroom.length_ft', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                />
                <span className="text-xs text-slate-500">ft</span>
              </div>
            </div>

            {/* Width */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Bathroom Width</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="3.5"
                  max="12.0"
                  value={bathWidth}
                  onChange={(e) => updateDraftParameter('space.room.bathroom.width_ft', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                />
                <span className="text-xs text-slate-500">ft</span>
              </div>
            </div>

            {/* Dado Height */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Wall Tile Dado Height</label>
              <select
                value={bathDadoHeight >= 9.5 ? '10' : '7'}
                onChange={(e) => updateDraftParameter('config.cladding.bathroom_dado_standard_ft', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white"
              >
                <option value="7">7 ft (Standard Lintel Level)</option>
                <option value="10">10 ft (Full Ceiling Height)</option>
              </select>
            </div>

            {/* Waterproofing Method */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Waterproofing Coverage</label>
              <select
                value={bathWpMethod}
                onChange={(e) => updateDraftParameter('config.waterproofing.bathroom_method', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white"
              >
                <option value="FLOOR_UPTURN">Floor + 1 ft Upturn Flashing</option>
                <option value="FLOOR_ONLY">Floor Slab Only</option>
                <option value="FULL_HEIGHT">Full Wet-Area Wall Encapsulation</option>
              </select>
            </div>
          </div>

          {/* Fixtures Checklist */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-700 mb-2">Default Bathroom Fixture Points</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wcFixture}
                  onChange={(e) => setWcFixture(e.target.checked)}
                  className="rounded text-[#1B3D34] accent-[#1B3D34]"
                />
                <span>Water Closet (WC)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={washBasinFixture}
                  onChange={(e) => setWashBasinFixture(e.target.checked)}
                  className="rounded text-[#1B3D34] accent-[#1B3D34]"
                />
                <span>Wash Basin</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showerFixture}
                  onChange={(e) => setShowerFixture(e.target.checked)}
                  className="rounded text-[#1B3D34] accent-[#1B3D34]"
                />
                <span>Overhead Shower</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={healthFaucetFixture}
                  onChange={(e) => setHealthFaucetFixture(e.target.checked)}
                  className="rounded text-[#1B3D34] accent-[#1B3D34]"
                />
                <span>Health Faucet</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={floorDrainFixture}
                  onChange={(e) => setFloorDrainFixture(e.target.checked)}
                  className="rounded text-[#1B3D34] accent-[#1B3D34]"
                />
                <span>Floor Trap / Drain</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={geyserPointFixture}
                  onChange={(e) => setGeyserPointFixture(e.target.checked)}
                  className="rounded text-[#1B3D34] accent-[#1B3D34]"
                />
                <span>Geyser Power Point</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── STANDARD ROOM CARDS GRID ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Standard Room Templates ({DEFAULT_ROOM_CARDS.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_ROOM_CARDS.map((room) => {
            const currentL = draftParameters[`space.room.${room.key}.length_ft`] ?? room.defaultL;
            const currentW = draftParameters[`space.room.${room.key}.width_ft`] ?? room.defaultW;
            const areaSqFt = currentL * currentW;

            return (
              <Card key={room.key} className="border border-slate-200 bg-white rounded-2xl hover:border-slate-300 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{room.name}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {room.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#1B3D34] bg-emerald-50 px-2 py-0.5 rounded-md">
                      {areaSqFt.toFixed(0)} sq.ft
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Length</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="4"
                          max="30"
                          value={currentL}
                          onChange={(e) => updateDraftParameter(`space.room.${room.key}.length_ft`, Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg"
                        />
                        <span className="text-xs text-slate-400">ft</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Width</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="4"
                          max="25"
                          value={currentW}
                          onChange={(e) => updateDraftParameter(`space.room.${room.key}.width_ft`, Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg"
                        />
                        <span className="text-xs text-slate-400">ft</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">Flooring Type</label>
                    <select
                      className="w-full px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50/50"
                      defaultValue={room.flooringDefault}
                    >
                      <option>{room.flooringDefault}</option>
                      <option>Vitrified Living/Bed Tiles (800x1600mm)</option>
                      <option>Double Charged Vitrified (800x800mm)</option>
                      <option>Italian Marble / Polished Granite</option>
                      <option>Matte Anti-skid Vitrified</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {room.electricalPoints} Points
                    </span>
                    <span>Doors: {room.doors}</span>
                    <span>Windows: {room.windows}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── CUSTOM ROOMS SECTION ── */}
      {customRooms.length > 0 && (
        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            Custom Configured Rooms ({customRooms.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRooms.map((room) => (
              <Card key={room.id} className="border border-emerald-200 bg-emerald-50/20 rounded-2xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{room.name}</h4>
                      <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                        Custom Room
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1B3D34] bg-emerald-100 px-2 py-0.5 rounded-md">
                        {(room.lengthFt * room.widthFt).toFixed(0)} sq.ft
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomRoom(room.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                        title="Remove custom room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Dimensions: {room.lengthFt} × {room.widthFt} ft (Height: {room.heightFt} ft)
                  </p>
                  <p className="text-xs text-slate-500">
                    Flooring: {room.flooring}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>⚡ {room.electricalPoints} Points</span>
                    <span>💧 {room.plumbingPoints} Plumbing</span>
                    <span>🚪 {room.doors} Door(s)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CUSTOM ROOM TYPE ── */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Add New Custom Room Type
                </h3>
                <p className="text-xs text-slate-500">
                  New rooms automatically propagate into the residential calculation model.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Theatre, Gym, Library"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#1B3D34]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Length (ft)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="40"
                    value={newRoomLength}
                    onChange={(e) => setNewRoomLength(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Width (ft)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="30"
                    value={newRoomWidth}
                    onChange={(e) => setNewRoomWidth(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Height (ft)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="8"
                    max="14"
                    value={newRoomHeight}
                    onChange={(e) => setNewRoomHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Flooring Finish</label>
                  <select
                    value={newRoomFlooring}
                    onChange={(e) => setNewRoomFlooring(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
                  >
                    <option>Vitrified Tiles (800x800mm)</option>
                    <option>Glazed Vitrified (800x1600mm)</option>
                    <option>Polished Granite</option>
                    <option>Italian Marble</option>
                    <option>Wooden Laminate</option>
                    <option>Anti-skid Ceramic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Wall Finish</label>
                  <select
                    value={newRoomWallFinish}
                    onChange={(e) => setNewRoomWallFinish(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
                  >
                    <option>Premium Acrylic Emulsion</option>
                    <option>Royale Luxury Sheen</option>
                    <option>Texture Accent Wall</option>
                    <option>Acoustic Panelling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Electrical</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newRoomElectrical}
                    onChange={(e) => setNewRoomElectrical(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Plumbing</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newRoomPlumbing}
                    onChange={(e) => setNewRoomPlumbing(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Doors</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={newRoomDoors}
                    onChange={(e) => setNewRoomDoors(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Windows</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={newRoomWindows}
                    onChange={(e) => setNewRoomWindows(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl"
                >
                  Save Custom Room
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
