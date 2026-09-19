// ============================================================
// ADMIN CONTROL CENTER — TRADE PARAMETERS & ASSUMPTIONS TAB
// Parts 6, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24
// Specialized Domain Editors for each Construction Discipline
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore, AdminTab } from '../../../store/useAdminStore';
import {
  Wrench,
  Layers,
  Building,
  Paintbrush,
  Droplets,
  Zap,
  Hammer,
  Shield,
  Percent,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass,
  Lightbulb
} from 'lucide-react';
import { getParameterImpact } from '../../../calculation-engine/rules/impactAnalysis';

export interface TradeField {
  key: string;
  label: string;
  defaultValue: number | string;
  unit: string;
  explanation: string;
  source: string;
  min?: number;
  max?: number;
}

export interface TradeSectionDef {
  id: string;
  tabId: AdminTab;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fields: TradeField[];
}

export const TRADE_SECTIONS: Record<string, TradeSectionDef> = {
  'structure-rcc': {
    id: 'structure-rcc',
    tabId: 'structure-rcc',
    title: 'Structure & RCC Parameters',
    subtitle: 'Foundation assumptions, reinforcement steel consumption, and floor-wise structural multipliers.',
    icon: <Building className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'rcc.steel_base_factor_kg_sqft',
        label: 'Ground Floor Steel Factor',
        defaultValue: 2.80,
        unit: 'kg/sqft',
        explanation: 'Reinforcement steel allocation for ground level footings, plinth beam, and ground slab.',
        source: 'IS 456:2000 Structural Code'
      },
      {
        key: 'rcc.steel_floor_increment_kg_sqft',
        label: 'Upper Floor Steel Increment',
        defaultValue: 0.20,
        unit: 'kg/sqft/floor',
        explanation: 'Additional reinforcement per upper floor due to column load accumulation.',
        source: 'Structural Engineering Practice'
      },
      {
        key: 'rcc.multiplier_g_plus_1',
        label: 'G+1 Structural Multiplier',
        defaultValue: 1.20,
        unit: 'ratio',
        explanation: 'Global structural load factor applied across structural foundation for G+1 buildings.',
        source: 'Hutty Structural Model'
      },
      {
        key: 'rcc.multiplier_g_plus_2',
        label: 'G+2 Structural Multiplier',
        defaultValue: 1.35,
        unit: 'ratio',
        explanation: 'Global structural load factor for G+2 residential frames.',
        source: 'Hutty Structural Model'
      },
      {
        key: 'rcc.multiplier_g_plus_3',
        label: 'G+3 Structural Multiplier',
        defaultValue: 1.45,
        unit: 'ratio',
        explanation: 'Global structural load factor for G+3 frames.',
        source: 'Hutty Structural Model'
      },
      {
        key: 'rcc.multiplier_g_plus_4',
        label: 'G+4 Structural Multiplier',
        defaultValue: 1.55,
        unit: 'ratio',
        explanation: 'Global structural load factor for G+4 frames.',
        source: 'Hutty Structural Model'
      },
      {
        key: 'rcc.cement_factor_bags_sqft',
        label: 'Structural Cement Factor',
        defaultValue: 0.40,
        unit: 'bags/sqft',
        explanation: 'Cement bags consumed per sqft for concrete, columns, beams, and slabs.',
        source: 'CPWD Works Manual'
      }
    ]
  },
  masonry: {
    id: 'masonry',
    tabId: 'masonry',
    title: 'Masonry & Blockwork Parameters',
    subtitle: 'Block dimensions, mortar mix ratios, opening deductions, and material wastage allowances.',
    icon: <Layers className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'masonry.external_wall_thickness_mm',
        label: 'External Wall Thickness',
        defaultValue: 150,
        unit: 'mm',
        explanation: 'Thickness of external perimeter walls (typically 150mm or 200mm solid block/AAC).',
        source: 'Architectural Working Drawings'
      },
      {
        key: 'masonry.internal_wall_thickness_mm',
        label: 'Internal Partition Wall Thickness',
        defaultValue: 100,
        unit: 'mm',
        explanation: 'Thickness of interior non-loadbearing room partition walls (typically 100mm).',
        source: 'Architectural Working Drawings'
      },
      {
        key: 'masonry.aac_block_length_mm',
        label: 'AAC Block Length',
        defaultValue: 600,
        unit: 'mm',
        explanation: 'Standard manufacturing length of Autoclaved Aerated Concrete blocks.',
        source: 'IS 2185 Part 3 AAC'
      },
      {
        key: 'masonry.aac_block_height_mm',
        label: 'AAC Block Height',
        defaultValue: 200,
        unit: 'mm',
        explanation: 'Standard manufacturing height of AAC blocks.',
        source: 'IS 2185 Part 3 AAC'
      },
      {
        key: 'masonry.aac_wastage_percent',
        label: 'AAC Block Wastage',
        defaultValue: 5.0,
        unit: '%',
        explanation: 'Transport breakages, cutting for electrical conduits, and edge chasing wastage.',
        source: 'Manufacturer Guidelines'
      },
      {
        key: 'masonry.red_brick_wastage_percent',
        label: 'Clay Brick Wastage',
        defaultValue: 7.0,
        unit: '%',
        explanation: 'Breakage allowance for traditional wire-cut clay bricks.',
        source: 'Standard Quantity Survey Practice'
      }
    ]
  },
  flooring: {
    id: 'flooring',
    tabId: 'flooring',
    title: 'Flooring & Finishes Parameters',
    subtitle: 'Tile wastage percentages, staircase granite allowances, and skirting ratios.',
    icon: <Layers className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'flooring.tile_wastage_percent',
        label: 'Living & Bedroom Tile Wastage',
        defaultValue: 8.0,
        unit: '%',
        explanation: 'Cutting wastage, diagonal borders, and corner offsets for vitrified tiles.',
        source: 'Tiling Contractors Association'
      },
      {
        key: 'flooring.bathroom_tile_wastage_percent',
        label: 'Bathroom Anti-Skid Tile Wastage',
        defaultValue: 8.0,
        unit: '%',
        explanation: 'Cutting wastage around floor drains, sanitary traps, and shower perimeters.',
        source: 'Tiling Contractors Association'
      },
      {
        key: 'flooring.staircase_granite_allowance_sqft',
        label: 'Staircase Granite Cladding Allowance',
        defaultValue: 180,
        unit: 'sqft',
        explanation: 'Treads, risers, and side bull-nosed skirting granite surface area per flight.',
        source: 'Audit Conflict: 175 vs 180 sqft'
      }
    ]
  },
  paint: {
    id: 'paint',
    tabId: 'paint',
    title: 'Paint & Surface Finishes',
    subtitle: 'Spreading rates, coat counts, putty consumption, and opening deductions.',
    icon: <Paintbrush className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'paint.interior_coverage_sqft_per_litre',
        label: 'Interior Acrylic Emulsion Coverage',
        defaultValue: 45.0,
        unit: 'sqft/L',
        explanation: 'Surface coverage per litre for 2 coats over prepared wall putty.',
        source: 'Asian Paints Technical Data Sheet (Audit Conflict: 45 vs 60 sqft/L)'
      },
      {
        key: 'paint.exterior_coverage_sqft_per_litre',
        label: 'Exterior Weatherproof Emulsion Coverage',
        defaultValue: 60.0,
        unit: 'sqft/L',
        explanation: 'Coverage per litre on exterior plastered surfaces with primer.',
        source: 'Berger / Asian Paints Specification'
      },
      {
        key: 'paint.interior_coats',
        label: 'Interior Paint Coats',
        defaultValue: 2,
        unit: 'coats',
        explanation: 'Standard application coats for interior emulsion.',
        source: 'Hutty Standard'
      },
      {
        key: 'paint.paint_wastage_percent',
        label: 'Paint & Roller Wastage Allowance',
        defaultValue: 10.0,
        unit: '%',
        explanation: 'Loss from roller absorption, container residue, and edge masking cuts.',
        source: 'Painting Contractors Handbook'
      }
    ]
  },
  waterproofing: {
    id: 'waterproofing',
    tabId: 'waterproofing',
    title: 'Waterproofing Assumptions',
    subtitle: 'Wet area upturn heights, terrace treatment factors, and sump waterproofing areas.',
    icon: <Droplets className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'waterproofing.bathroom_upturn_height_mm',
        label: 'Bathroom Upturn Skirting Height',
        defaultValue: 300,
        unit: 'mm',
        explanation: 'Vertical waterproofing barrier height above finished floor level along shower perimeters.',
        source: 'Fosroc Waterproofing Guide'
      },
      {
        key: 'waterproofing.terrace_multiplier',
        label: 'Terrace Waterproofing Factor',
        defaultValue: 1.15,
        unit: 'ratio',
        explanation: 'Surface multiplier accounting for parapet wall upturn (300mm) and rainwater gully slopes.',
        source: 'Civil Engineering Practice'
      },
      {
        key: 'waterproofing.sump_surface_sqft',
        label: 'Underground Sump Waterproofing Area',
        defaultValue: 180,
        unit: 'sqft',
        explanation: 'Internal base and retaining wall cementitious food-grade waterproofing area.',
        source: 'Audit Conflict: 120 vs 180 sqft'
      }
    ]
  },
  plumbing: {
    id: 'plumbing',
    tabId: 'plumbing',
    title: 'Plumbing & Water Supply Parameters',
    subtitle: 'Concealed CPVC/SWR pipe lengths, per capita water demand, and overhead storage sizing.',
    icon: <Wrench className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'plumbing.cpvc_length_per_point_m',
        label: 'CPVC Supply Pipe Length per Point',
        defaultValue: 3.5,
        unit: 'm/point',
        explanation: 'Average concealed SDR-11 hot & cold water supply pipe length per sanitary fixture.',
        source: 'Plumbing Engineering Code'
      },
      {
        key: 'plumbing.swr_length_per_point_m',
        label: 'SWR Drainage Pipe Length per Point',
        defaultValue: 4.0,
        unit: 'm/point',
        explanation: 'Average soil and waste drainage pipe run allocated per fixture trap.',
        source: 'National Building Code 2016 Part 9'
      },
      {
        key: 'plumbing.water_demand_lpcd',
        label: 'Per Capita Water Demand',
        defaultValue: 135,
        unit: 'LPCD',
        explanation: 'Litres per capita per day for residential domestic and flushing consumption.',
        source: 'IS 1172 Basic Requirements for Water Supply'
      }
    ]
  },
  electrical: {
    id: 'electrical',
    tabId: 'electrical',
    title: 'Electrical & Conduiting Parameters',
    subtitle: 'Conduit lengths per point, wire allocation ratios, and switch module configurations.',
    icon: <Zap className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'electrical.wire_length_per_point_m',
        label: 'Average Wire Length per Modular Point',
        defaultValue: 12.0,
        unit: 'm/point',
        explanation: 'Copper wire run allocated per electrical point (includes phase, neutral, and earth runs).',
        source: 'Central Electricity Authority (CEA) Standards'
      },
      {
        key: 'electrical.conduit_length_per_point_m',
        label: 'Concealed PVC Conduit Length per Point',
        defaultValue: 3.5,
        unit: 'm/point',
        explanation: 'Heavy-duty 25mm PVC conduit embedded in slabs and brick chasing per electrical point.',
        source: 'Electrical Installation Practice'
      },
      {
        key: 'electrical.switch_module_ratio',
        label: 'Modular Plate Ratio',
        defaultValue: 1.25,
        unit: 'ratio',
        explanation: 'Modular gang box ratio per circuit allowance for future home automation expansion.',
        source: 'Hutty Standard'
      }
    ]
  },
  labour: {
    id: 'labour',
    tabId: 'labour',
    title: 'Labour Rates & Trade Benchmarks',
    subtitle: 'Bengaluru and Mysuru baseline civil labour, trade wages, and methodology settings.',
    icon: <Hammer className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'labour.bengaluru_civil_composite_rate_sqft',
        label: 'Bengaluru Composite Civil Labour Rate',
        defaultValue: 265,
        unit: '₹/sqft',
        explanation: 'All-inclusive civil labour for RCC frame, shuttering, bar bending, brickwork, and plastering.',
        source: 'Builders Association of India (BAI) Bengaluru'
      },
      {
        key: 'labour.mysuru_civil_composite_rate_sqft',
        label: 'Mysuru Composite Civil Labour Rate',
        defaultValue: 240,
        unit: '₹/sqft',
        explanation: 'Regional civil labour rate benchmark for Mysuru urban jurisdiction.',
        source: 'BAI Mysuru Chapter'
      },
      {
        key: 'labour.painting_trade_rate_sqft',
        label: 'Painting Trade Rate (Putty + 2 Coats)',
        defaultValue: 16,
        unit: '₹/sqft',
        explanation: 'Specialized painting labour rate per sqft of wall and ceiling area.',
        source: 'Karnataka Painters Union'
      }
    ]
  },
  commercial: {
    id: 'commercial',
    tabId: 'commercial',
    title: 'Commercial Margins & Statutory Taxes',
    subtitle: 'Contractor margins, professional consultancy fees, contingency reserves, and GST.',
    icon: <Percent className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'commercial.contractor_margin_percent',
        label: 'Turnkey Contractor Margin & Overheads',
        defaultValue: 15.0,
        unit: '%',
        explanation: 'Contractor overhead and profit margin applied in Turnkey / Contractor procurement mode.',
        source: 'Audit Conflict: 15% vs 8-10%'
      },
      {
        key: 'commercial.contingency_percent',
        label: 'Contingency Provision',
        defaultValue: 3.0,
        unit: '%',
        explanation: 'Reserve allowance for unexpected site conditions or design changes.',
        source: 'Construction Financial Guidelines'
      },
      {
        key: 'commercial.professional_fees_percent',
        label: 'Architectural & Structural Engineering Fees',
        defaultValue: 5.0,
        unit: '%',
        explanation: 'Design, structural drawings, MEP consultancy, and site inspection fees.',
        source: 'Council of Architecture (COA) Guidelines'
      },
      {
        key: 'commercial.gst_percent',
        label: 'Works Contract GST',
        defaultValue: 18.0,
        unit: '%',
        explanation: 'Goods and Services Tax on residential construction contracts.',
        source: 'Statutory GST Rate'
      }
    ]
  },
  authority: {
    id: 'authority',
    tabId: 'authority',
    title: 'Authority & BUA Planning Rules',
    subtitle: 'BBMP / MUDA setback slabs, floor area ratio (FAR), and ground coverage limits.',
    icon: <Compass className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'authority.bbmp_max_coverage_percent',
        label: 'BBMP Maximum Ground Coverage',
        defaultValue: 60.0,
        unit: '%',
        explanation: 'Maximum allowable footprint area as a percentage of total plot area under BBMP bye-laws.',
        source: 'BBMP Building Bye-Laws 2020 (STATUTORY)'
      },
      {
        key: 'authority.bbmp_base_far',
        label: 'BBMP Baseline Floor Area Ratio (FAR)',
        defaultValue: 1.75,
        unit: 'ratio',
        explanation: 'Permissible gross floor area ratio on standard 30ft residential access roads.',
        source: 'BBMP Building Bye-Laws (STATUTORY)'
      },
      {
        key: 'authority.muda_max_coverage_percent',
        label: 'MUDA Maximum Ground Coverage',
        defaultValue: 65.0,
        unit: '%',
        explanation: 'Permissible building footprint under Mysuru Urban Development Authority bye-laws.',
        source: 'MUDA Zoning Regulations (STATUTORY)'
      }
    ]
  },
  recommendations: {
    id: 'recommendations',
    tabId: 'recommendations',
    title: 'Recommendation Rules Engine',
    subtitle: 'Automated advisory conditions recommending materials, rainwater harvesting, or structural upgrades.',
    icon: <Lightbulb className="w-5 h-5 text-[#1B3D34]" />,
    fields: [
      {
        key: 'recommendations.rwh_plot_threshold_sqft',
        label: 'Rainwater Harvesting Mandatory Threshold',
        defaultValue: 1200,
        unit: 'sqft',
        explanation: 'Plot area above which statutory rainwater harvesting recharge wells are recommended.',
        source: 'BWSSB Statutory Rule'
      },
      {
        key: 'recommendations.aac_min_floors_threshold',
        label: 'AAC Blocks Recommendation Floor Threshold',
        defaultValue: 2,
        unit: 'floors',
        explanation: 'Recommend lightweight AAC blocks over clay bricks for G+2 and taller buildings to reduce column dead weight.',
        source: 'Structural Best Practice'
      }
    ]
  }
};

interface Props {
  forcedTab?: AdminTab;
}

export const TradeParametersTab: React.FC<Props> = ({ forcedTab }) => {
  const { activeTab, draftParameters, updateDraftParameter } = useAdminStore();

  const currentTab = forcedTab || activeTab;
  const section = TRADE_SECTIONS[currentTab] || TRADE_SECTIONS['structure-rcc'];

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState<string>('');

  const handleStartEdit = (f: TradeField) => {
    const currentVal = draftParameters[f.key] !== undefined ? draftParameters[f.key] : f.defaultValue;
    setEditingKey(f.key);
    setTempVal(String(currentVal));
  };

  const handleSave = (f: TradeField) => {
    const num = Number(tempVal);
    updateDraftParameter(f.key, isNaN(num) ? tempVal : num);
    setEditingKey(null);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            {section.icon}
            {section.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {section.subtitle}
          </p>
        </div>
      </div>

      {/* ── FIELDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.fields.map((field) => {
          const isOverridden = draftParameters[field.key] !== undefined;
          const effectiveVal = isOverridden ? draftParameters[field.key] : field.defaultValue;
          const isCurrentlyEditing = editingKey === field.key;
          const impact = getParameterImpact(field.key, field.label);

          return (
            <Card
              key={field.key}
              className={`border transition-all ${
                isOverridden ? 'border-[#F28C28] bg-amber-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-heading">
                        {field.label}
                      </span>
                      {isOverridden && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-[#F28C28] border border-amber-300">
                          DRAFT
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {field.key}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-[#1B3D34]">
                      {effectiveVal}
                    </span>
                    <span className="text-xs text-slate-500 ml-1 font-medium">
                      {field.unit}
                    </span>
                    {isOverridden && (
                      <span className="text-[10px] text-slate-400 block line-through">
                        prod: {field.defaultValue} {field.unit}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {field.explanation}
                </p>

                {/* Inline edit container or source banner */}
                {isCurrentlyEditing ? (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={tempVal}
                      onChange={(e) => setTempVal(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <Button
                      type="button"
                      onClick={() => handleSave(field)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-lg"
                    >
                      Stage
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[240px] text-[10px] text-slate-400">
                      Source: {field.source}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(field)}
                      className="px-2.5 py-1 text-xs font-bold text-[#1B3D34] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Modify
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
