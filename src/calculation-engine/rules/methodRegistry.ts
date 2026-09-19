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
