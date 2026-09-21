// ============================================================
// CALCULATION METHOD REGISTRY
// Supported calculation methods per trade category with structured ASTs
// ============================================================

import { CalculationMethodDefinition, RuleNode } from './types';

export const CANONICAL_CALCULATION_METHODS: CalculationMethodDefinition[] = [
  // ── 1. Structural Steel Method Registry ──
  {
    id: 'method.steel',
    category: 'STEEL',
    name: 'Structural Steel Rebar Calculation',
    description: 'Method for calculating structural TMT reinforcement steel tonnage.',
    activeMethodId: 'steel_floorwise',
    supportedMethods: [
      {
        methodId: 'steel_floorwise',
        displayName: 'Floor-wise Incremental Model (Current Production)',
        description: 'BUA × [Base Steel Factor (Ground) + (Floors - 1) × Additional Floor Factor] / 1000',
        requiredParameters: [
          'config.rcc.steel_base_factor_kg_sqft',
          'config.rcc.steel_additional_floor_factor',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'DIVIDE',
          left: {
            type: 'BINARY_OP',
            operation: 'MULTIPLY',
            left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
            right: {
              type: 'BINARY_OP',
              operation: 'ADD',
              left: { type: 'PARAMETER_REF', parameterKey: 'config.rcc.steel_base_factor_kg_sqft', fallbackValue: 2.8 },
              right: {
                type: 'BINARY_OP',
                operation: 'MULTIPLY',
                left: {
                  type: 'BINARY_OP',
                  operation: 'SUBTRACT',
                  left: { type: 'METRIC_REF', metricKey: 'floors' },
                  right: { type: 'CONSTANT', value: 1 },
                },
                right: { type: 'PARAMETER_REF', parameterKey: 'config.rcc.steel_additional_floor_factor', fallbackValue: 0.2 },
              },
            },
          },
          right: { type: 'CONSTANT', value: 1000 },
        },
      },
      {
        methodId: 'steel_simple_bua',
        displayName: 'Simple BUA Multiplier',
        description: 'Built-Up Area × Steel Factor / 1000',
        requiredParameters: ['config.rcc.steel_base_factor_kg_sqft'],
        rule: {
          type: 'BINARY_OP',
          operation: 'DIVIDE',
          left: {
            type: 'BINARY_OP',
            operation: 'MULTIPLY',
            left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
            right: { type: 'PARAMETER_REF', parameterKey: 'config.rcc.steel_base_factor_kg_sqft', fallbackValue: 2.8 },
          },
          right: { type: 'CONSTANT', value: 1000 },
        },
      },
      {
        methodId: 'steel_manual',
        displayName: 'Manual Fixed Tonnage',
        description: 'Admin or user specified structural steel tonnage override.',
        requiredParameters: ['config.rcc.manual_steel_tonnes'],
        rule: {
          type: 'PARAMETER_REF',
          parameterKey: 'config.rcc.manual_steel_tonnes',
          fallbackValue: 7.2,
        },
      },
    ],
  },

  // ── 2. Paint & Finishes Method Registry ──
  {
    id: 'method.paint',
    category: 'PAINT',
    name: 'Interior Paint Quantity Calculation',
    description: 'Method for calculating interior acrylic emulsion paint consumption in litres.',
    activeMethodId: 'paint_surface_area',
    supportedMethods: [
      {
        methodId: 'paint_surface_area',
        displayName: 'Net Surface Area Spread Rate (Current Production)',
        description: '(Internal Wall Area + Ceiling Area) / Paint Coverage Rate × 2 Coats × Wastage Factor',
        requiredParameters: [
          'config.paint.interior_coverage_sqft_per_litre',
          'config.wastage.paint',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: {
            type: 'BINARY_OP',
            operation: 'DIVIDE',
            left: {
              type: 'BINARY_OP',
              operation: 'ADD',
              left: { type: 'METRIC_REF', metricKey: 'internalWallArea' },
              right: { type: 'METRIC_REF', metricKey: 'ceilingArea' },
            },
            right: { type: 'PARAMETER_REF', parameterKey: 'config.paint.interior_coverage_sqft_per_litre', fallbackValue: 45 },
          },
          right: {
            type: 'BINARY_OP',
            operation: 'ADD',
            left: { type: 'CONSTANT', value: 1 },
            right: {
              type: 'BINARY_OP',
              operation: 'DIVIDE',
              left: { type: 'PARAMETER_REF', parameterKey: 'config.wastage.paint', fallbackValue: 10 },
              right: { type: 'CONSTANT', value: 100 },
            },
          },
        },
      },
      {
        methodId: 'paint_thumb_rule_bua',
        displayName: 'Thumb Rule BUA Factor',
        description: 'BUA × 0.12 litres per sq.ft',
        requiredParameters: ['config.paint.litres_per_sqft_bua'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.paint.litres_per_sqft_bua', fallbackValue: 0.12 },
        },
      },
    ],
  },

  // ── 3. Flooring Method Registry ──
  {
    id: 'method.flooring',
    category: 'FLOORING',
    name: 'Flooring Tile Quantity Calculation',
    description: 'Method for calculating living, bedroom, and hallway vitrified tile area.',
    activeMethodId: 'flooring_circulation_pct',
    supportedMethods: [
      {
        methodId: 'flooring_circulation_pct',
        displayName: 'Carpet Area + Circulation Allowance (Current Production)',
        description: '(Livable Carpet Area × (1 + Circulation Allowance Pct)) × (1 + Tile Wastage)',
        requiredParameters: [
          'config.flooring.circulation_allowance_pct',
          'config.wastage.flooring',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: {
            type: 'BINARY_OP',
            operation: 'MULTIPLY',
            left: { type: 'METRIC_REF', metricKey: 'carpetArea' },
            right: {
              type: 'BINARY_OP',
              operation: 'ADD',
              left: { type: 'CONSTANT', value: 1 },
              right: {
                type: 'BINARY_OP',
                operation: 'DIVIDE',
                left: { type: 'PARAMETER_REF', parameterKey: 'config.flooring.circulation_allowance_pct', fallbackValue: 10 },
                right: { type: 'CONSTANT', value: 100 },
              },
            },
          },
          right: {
            type: 'BINARY_OP',
            operation: 'ADD',
            left: { type: 'CONSTANT', value: 1 },
            right: {
              type: 'BINARY_OP',
              operation: 'DIVIDE',
              left: { type: 'PARAMETER_REF', parameterKey: 'config.wastage.flooring', fallbackValue: 7 },
              right: { type: 'CONSTANT', value: 100 },
            },
          },
        },
      },
    ],
  },
  // ── 4. Masonry Method Registry ──
  {
    id: 'method.masonry',
    category: 'MASONRY',
    name: 'Masonry & Blockwork Calculation',
    description: 'Method for calculating blockwork volume and unit counts.',
    activeMethodId: 'masonry_surface_thickness',
    supportedMethods: [
      {
        methodId: 'masonry_surface_thickness',
        displayName: 'Net Surface Area & Thickness (Current Production)',
        description: 'Wall Area × Wall Thickness with Door/Window deductions and cutting wastage',
        requiredParameters: [
          'config.masonry.external_wall_thickness_m',
          'config.masonry.internal_wall_thickness_m',
          'config.wastage.masonry',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'totalWallArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.masonry.external_wall_thickness_m', fallbackValue: 0.15 },
        },
      },
      {
        methodId: 'masonry_block_count',
        displayName: 'Unit Block Count Model',
        description: 'Net Wall Volume divided by individual block unit volume plus mortar joints',
        requiredParameters: ['config.masonry.aac_block_unit_volume_cum'],
        rule: {
          type: 'BINARY_OP',
          operation: 'DIVIDE',
          left: { type: 'METRIC_REF', metricKey: 'wallVolumeCuM' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.masonry.aac_block_unit_volume_cum', fallbackValue: 0.018 },
        },
      },
      {
        methodId: 'masonry_bua_thumb_rule',
        displayName: 'BUA Volume Ratio Model',
        description: 'BUA × 0.042 cu.m per sqft of built-up area',
        requiredParameters: ['config.masonry.cum_per_sqft_bua'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.masonry.cum_per_sqft_bua', fallbackValue: 0.042 },
        },
      },
    ],
  },

  // ── 5. Electrical Method Registry ──
  {
    id: 'method.electrical',
    category: 'ELECTRICAL',
    name: 'Electrical Cabling & Conduit Calculation',
    description: 'Method for calculating wiring lengths, conduits, and modular switch points.',
    activeMethodId: 'electrical_point_wire',
    supportedMethods: [
      {
        methodId: 'electrical_point_wire',
        displayName: 'Point-wise Circuit Wiring (Current Production)',
        description: 'Light/Fan points × 8.5m + Socket points × 12.5m + Power points × 22m',
        requiredParameters: [
          'config.electrical.wire_1_5_m_per_point',
          'config.electrical.wire_2_5_m_per_point',
          'config.electrical.wire_4_0_m_per_point',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'totalElectricalPoints' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.electrical.wire_1_5_m_per_point', fallbackValue: 8.5 },
        },
      },
      {
        methodId: 'electrical_room_allowance',
        displayName: 'Room-wise Modular Allowance',
        description: 'Fixed modular points allocated based on room category specifications',
        requiredParameters: ['config.electrical.switch_module_ratio'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'totalRooms' },
          right: { type: 'CONSTANT', value: 12 },
        },
      },
      {
        methodId: 'electrical_bua_ratio',
        displayName: 'BUA Area Factor Model',
        description: 'BUA × 0.08 electrical points per sqft',
        requiredParameters: ['config.electrical.points_per_sqft'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.electrical.points_per_sqft', fallbackValue: 0.08 },
        },
      },
    ],
  },

  // ── 6. Plumbing Method Registry ──
  {
    id: 'method.plumbing',
    category: 'PLUMBING',
    name: 'Water Supply & Drainage Calculation',
    description: 'Method for calculating CPVC supply, SWR drainage lines, and fixtures.',
    activeMethodId: 'plumbing_fixture_point',
    supportedMethods: [
      {
        methodId: 'plumbing_fixture_point',
        displayName: 'Fixture & Core Point Model (Current Production)',
        description: 'Water points × 4.5m CPVC + Drainage points × 3.5m SWR + Shaft risers',
        requiredParameters: [
          'config.plumbing.cpvc_m_per_point',
          'config.plumbing.swr_m_per_point',
          'config.plumbing.riser_m_per_floor',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'totalPlumbingPoints' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.plumbing.cpvc_m_per_point', fallbackValue: 4.5 },
        },
      },
      {
        methodId: 'plumbing_bathroom_core',
        displayName: 'Bathroom Core Module Allowance',
        description: 'Flat CPVC and SWR allowance per configured bathroom/utility module',
        requiredParameters: ['config.plumbing.cpvc_per_bathroom_m'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'bathrooms' },
          right: { type: 'CONSTANT', value: 28 },
        },
      },
      {
        methodId: 'plumbing_bua_thumb_rule',
        displayName: 'BUA Plumbing Benchmark',
        description: 'BUA × 0.025 piping metres per sqft',
        requiredParameters: ['config.plumbing.pipe_m_per_sqft'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'config.plumbing.pipe_m_per_sqft', fallbackValue: 0.025 },
        },
      },
    ],
  },

  // ── 7. Labour Method Registry ──
  {
    id: 'method.labour',
    category: 'LABOUR',
    name: 'Civil & Trade Labour Calculation',
    description: 'Method for calculating composite and trade-specific site labour costs.',
    activeMethodId: 'labour_composite_sqft',
    supportedMethods: [
      {
        methodId: 'labour_composite_sqft',
        displayName: 'Composite Built-Up Area Rate (Current Production)',
        description: 'Built-up Area × Composite Civil Labour Rate (₹380/sqft)',
        requiredParameters: ['rate.labour.civil_composite'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'rate.labour.civil_composite', fallbackValue: 380 },
        },
      },
      {
        methodId: 'labour_trade_quantity',
        displayName: 'Trade-wise Quantity Take-off Model',
        description: 'Discrete labour rates applied directly to concrete, masonry, tile, and paint quantities',
        requiredParameters: [
          'rate.labour.flooring_tiling',
          'rate.labour.painting_finishes',
          'rate.labour.waterproofing_app',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'flooringArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'rate.labour.flooring_tiling', fallbackValue: 38 },
        },
      },
      {
        methodId: 'labour_day_work',
        displayName: 'Standard Crew-day Allowance',
        description: 'Estimated mason and helper work days calculated per 1000 sqft',
        requiredParameters: ['config.labour.mandays_per_1000_sqft'],
        rule: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: {
            type: 'BINARY_OP',
            operation: 'DIVIDE',
            left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
            right: { type: 'CONSTANT', value: 1000 },
          },
          right: { type: 'CONSTANT', value: 240 },
        },
      },
    ],
  },

  // ── 8. Waterproofing Method Registry ──
  {
    id: 'method.waterproofing',
    category: 'WATERPROOFING',
    name: 'Wet-Area Waterproofing Calculation',
    description: 'Method for calculating bathroom, terrace, and sump waterproofing area.',
    activeMethodId: 'waterproofing_floor_upturn',
    supportedMethods: [
      {
        methodId: 'waterproofing_floor_upturn',
        displayName: 'Floor Slab + 1ft Upturn Flashing (Current Production)',
        description: 'Bathroom Floor Area + (Perimeter × 1.0 ft Upturn Height) + Terrace Area',
        requiredParameters: [
          'config.waterproofing.bathroom_upturn_ft',
          'config.waterproofing.terrace_coverage_ratio',
        ],
        rule: {
          type: 'BINARY_OP',
          operation: 'ADD',
          left: { type: 'METRIC_REF', metricKey: 'bathroomFloorArea' },
          right: {
            type: 'BINARY_OP',
            operation: 'MULTIPLY',
            left: { type: 'METRIC_REF', metricKey: 'bathroomPerimeter' },
            right: { type: 'PARAMETER_REF', parameterKey: 'config.waterproofing.bathroom_upturn_ft', fallbackValue: 1.0 },
          },
        },
      },
      {
        methodId: 'waterproofing_floor_only',
        displayName: 'Horizontal Floor Slab Only',
        description: 'Horizontal floor membrane application without vertical upturn',
        requiredParameters: ['config.waterproofing.terrace_coverage_ratio'],
        rule: {
          type: 'METRIC_REF',
          metricKey: 'bathroomFloorArea',
        },
      },
      {
        methodId: 'waterproofing_full_height',
        displayName: 'Full Wet-Area Encapsulation (Floor + Full Wall)',
        description: 'Complete floor and vertical wall damp-proofing up to ceiling level',
        requiredParameters: ['config.structure.wall_height_ft'],
        rule: {
          type: 'BINARY_OP',
          operation: 'ADD',
          left: { type: 'METRIC_REF', metricKey: 'bathroomFloorArea' },
          right: {
            type: 'BINARY_OP',
            operation: 'MULTIPLY',
            left: { type: 'METRIC_REF', metricKey: 'bathroomPerimeter' },
            right: { type: 'PARAMETER_REF', parameterKey: 'config.structure.wall_height_ft', fallbackValue: 10.0 },
          },
        },
      },
    ],
  },
];

class CalculationMethodManager {
  private methods: Map<string, CalculationMethodDefinition> = new Map();

  constructor() {
    CANONICAL_CALCULATION_METHODS.forEach((m) => {
      this.methods.set(m.id, { ...m });
    });
  }

  public getAllMethods(): CalculationMethodDefinition[] {
    return Array.from(this.methods.values());
  }

  public getMethod(idOrCategory: string): CalculationMethodDefinition | undefined {
    if (this.methods.has(idOrCategory)) return this.methods.get(idOrCategory);
    return Array.from(this.methods.values()).find(
      (m) =>
        m.id.toLowerCase() === idOrCategory.toLowerCase() ||
        m.category.toLowerCase() === idOrCategory.toLowerCase() ||
        m.id.toLowerCase() === `method.${idOrCategory.toLowerCase()}`
    );
  }

  public getMethodDefinition(category: string): CalculationMethodDefinition | undefined {
    return this.getMethod(category);
  }

  public setActiveMethod(categoryId: string, methodId: string): void {
    const entry = this.getMethod(categoryId);
    if (!entry) throw new Error(`Method definition '${categoryId}' not found.`);

    const found = entry.supportedMethods.find((m) => m.methodId === methodId);
    if (!found) {
      throw new Error(`Calculation method '${methodId}' is not supported under category '${entry.category}'.`);
    }

    entry.activeMethodId = methodId;
  }

  public getActiveRule(categoryId: string): RuleNode | undefined {
    const entry = this.getMethod(categoryId);
    if (!entry) return undefined;

    const found = entry.supportedMethods.find((m) => m.methodId === entry.activeMethodId);
    return found?.rule;
  }
}

export const calculationMethodManager = new CalculationMethodManager();
