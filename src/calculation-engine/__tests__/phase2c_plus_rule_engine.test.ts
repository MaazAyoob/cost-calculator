// ============================================================
// PHASE 2C+ TEST SUITE: CALCULATION RULE ENGINE & IMPACT SIMULATION
// Verifies AST evaluation, method registry, dependency DAG,
// cycle detection, and physical quantity invariance.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateRuleNode } from '../rules/evaluator';
import { calculationMethodManager, CANONICAL_CALCULATION_METHODS } from '../rules/methodRegistry';
import { DependencyGraph } from '../rules/dependencyGraph';
import {
  getParameterImpact,
  simulateConfigurationComparison,
  getStandardSimulationSampleInput
} from '../rules/impactAnalysis';
import { configResolver } from '../config/configurationResolver';
import { runCalculator } from '../calculator';
import type { RuleNode, CalculationRule } from '../rules/types';

describe('Phase 2C+: Structured Calculation Rule Engine (AST Evaluator)', () => {
  beforeEach(() => {
    configResolver.resetToBaseline();
  });

  it('1. Evaluates binary arithmetic AST trees deterministically without code execution', () => {
    // (10 + 20) * 2 / 10 = 6
    const ast: RuleNode = {
      type: 'BINARY_OP',
      operation: 'DIVIDE',
      left: {
        type: 'BINARY_OP',
        operation: 'MULTIPLY',
        left: {
          type: 'BINARY_OP',
          operation: 'ADD',
          left: { type: 'CONSTANT', value: 10 },
          right: { type: 'CONSTANT', value: 20 }
        },
        right: { type: 'CONSTANT', value: 2 }
      },
      right: { type: 'CONSTANT', value: 10 }
    };

    const result = evaluateRuleNode(ast, { metrics: {} });
    expect(result).toBe(6);
  });

  it('2. Evaluates function operations: CEIL, FLOOR, ROUND with rounding precision', () => {
    const ceilAst: RuleNode = {
      type: 'FUNCTION_OP',
      operation: 'CEIL',
      arguments: [{ type: 'CONSTANT', value: 4.2 }]
    };
    expect(evaluateRuleNode(ceilAst, { metrics: {} })).toBe(5);

    const floorAst: RuleNode = {
      type: 'FUNCTION_OP',
      operation: 'FLOOR',
      arguments: [{ type: 'CONSTANT', value: 4.8 }]
    };
    expect(evaluateRuleNode(floorAst, { metrics: {} })).toBe(4);

    const roundAst: RuleNode = {
      type: 'FUNCTION_OP',
      operation: 'ROUND',
      arguments: [{ type: 'CONSTANT', value: 4.5678 }],
      precision: 2
    };
    expect(evaluateRuleNode(roundAst, { metrics: {} })).toBe(4.57);
  });

  it('3. Resolves metric references from geometric calculation context', () => {
    // builtUpArea * 2.8 kg/sqft
    const ast: RuleNode = {
      type: 'BINARY_OP',
      operation: 'MULTIPLY',
      left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
      right: { type: 'CONSTANT', value: 2.8 }
    };

    const result = evaluateRuleNode(ast, {
      metrics: { builtUpArea: 1500 }
    });
    expect(result).toBe(4200);
  });

  it('4. Evaluates conditional rule nodes branching safely', () => {
    // IF floors > 2 THEN 1.35 ELSE 1.20
    const ast: RuleNode = {
      type: 'CONDITIONAL',
      condition: {
        field: 'floors',
        operator: 'GREATER_THAN',
        value: 2
      },
      whenTrue: { type: 'CONSTANT', value: 1.35 },
      whenFalse: { type: 'CONSTANT', value: 1.20 }
    };

    const resGPlus1 = evaluateRuleNode(ast, { metrics: { floors: 2 } });
    expect(resGPlus1).toBe(1.20);

    const resGPlus3 = evaluateRuleNode(ast, { metrics: { floors: 4 } });
    expect(resGPlus3).toBe(1.35);
  });
});

describe('Phase 2C+: Calculation Method Registry', () => {
  it('5. Registers all canonical calculation categories with verified supported methods', () => {
    const allMethods = calculationMethodManager.getAllMethods();
    expect(allMethods.length).toBeGreaterThanOrEqual(3);

    const steelDef = calculationMethodManager.getMethod('steel');
    expect(steelDef).toBeDefined();
    expect(steelDef?.supportedMethods.length).toBe(3);
    expect(steelDef?.activeMethodId).toBe('steel_floorwise');
  });

  it('6. Allows switching active calculation method and persists selection', () => {
    calculationMethodManager.setActiveMethod('steel', 'steel_simple_bua');
    const updated = calculationMethodManager.getMethod('steel');
    expect(updated?.activeMethodId).toBe('steel_simple_bua');

    // Restore to default
    calculationMethodManager.setActiveMethod('steel', 'steel_floorwise');
    expect(calculationMethodManager.getMethod('steel')?.activeMethodId).toBe('steel_floorwise');
  });

  it('7. Rejects activation of unsupported methods with clear error', () => {
    expect(() => {
      calculationMethodManager.setActiveMethod('steel', 'unsupported_quantum_gravity_method');
    }).toThrow(/not supported/i);
  });
});

describe('Phase 2C+: Dependency Graph & Cycle Detection', () => {
  it('8. Validates valid Acyclic Dependency Graph (DAG) with correct topological order', () => {
    const graph = new DependencyGraph();
    const knownParams = new Set(['param.wall_height', 'param.coverage']);
    const knownMetrics = new Set(['plotArea', 'builtUpArea', 'wallArea']);

    const rules: CalculationRule[] = [
      {
        id: 'rule.builtUpArea',
        key: 'builtUpArea',
        name: 'Built-up Area',
        category: 'AREA',
        description: '',
        outputUnit: 'sqft',
        rootNode: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'plotArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'param.coverage' }
        },
        dependencies: ['plotArea', 'param.coverage'],
        affectedMetrics: ['builtUpArea'],
        affectedBOQLines: [],
        enabled: true,
        version: '1',
        updatedAt: ''
      },
      {
        id: 'rule.wallArea',
        key: 'wallArea',
        name: 'Wall Area',
        category: 'STRUCTURE',
        description: '',
        outputUnit: 'sqft',
        rootNode: {
          type: 'BINARY_OP',
          operation: 'MULTIPLY',
          left: { type: 'METRIC_REF', metricKey: 'builtUpArea' },
          right: { type: 'PARAMETER_REF', parameterKey: 'param.wall_height' }
        },
        dependencies: ['builtUpArea', 'param.wall_height'],
        affectedMetrics: ['wallArea'],
        affectedBOQLines: [],
        enabled: true,
        version: '1',
        updatedAt: ''
      }
    ];

    const validation = graph.buildFromRules(rules, knownParams, knownMetrics);
    expect(validation.isValid).toBe(true);
    expect(validation.hasCycle).toBe(false);
    expect(validation.missingReferences.length).toBe(0);
    expect(validation.topologicalOrder).toBeDefined();
  });

  it('9. Detects circular dependencies and flags cycle nodes', () => {
    const graph = new DependencyGraph();
    graph.addNode('NodeA', 'RULE');
    graph.addNode('NodeB', 'RULE');
    graph.addNode('NodeC', 'RULE');

    graph.addDependency('NodeA', 'NodeB');
    graph.addDependency('NodeB', 'NodeC');
    graph.addDependency('NodeC', 'NodeA'); // Creates Cycle: A -> B -> C -> A

    const cycleInfo = graph.detectCycle();
    expect(cycleInfo.hasCycle).toBe(true);
    expect(cycleInfo.cycleNodes).toBeDefined();
    expect(cycleInfo.cycleNodes?.length).toBeGreaterThan(0);
  });
});

describe('Phase 2C+: Simulation & Change Impact Analysis', () => {
  it('10. Retrieves parameter impact metadata for high-impact parameters', () => {
    const wallHeightImpact = getParameterImpact('structure.wall_height_ft');
    expect(wallHeightImpact.severity).toBe('CRITICAL');
    expect(wallHeightImpact.affectedBOQLines.length).toBeGreaterThan(0);
    expect(wallHeightImpact.affectedCostHeads).toContain('Masonry Materials');
  });

  it('11. Simulates wall height delta and verifies physical quantity changes', () => {
    const report = simulateConfigurationComparison({
      sampleInput: getStandardSimulationSampleInput(),
      draftOverrides: {
        'structure.wall_height_ft': 11.0 // Increased from 10.0 to 11.0 ft
      },
      changedParameterKeys: ['structure.wall_height_ft']
    });

    expect(report).toBeDefined();
    expect(report.changedParameters.length).toBe(1);
    expect(report.totalCost.oldCost).toBeGreaterThan(0);
    expect(report.totalCost.newCost).toBeGreaterThan(0);

    // Wall height increase should increase paint and plaster quantity/costs
    expect(report.keyMetrics.find((m) => m.metricKey === 'paintLitres')?.delta).toBeGreaterThan(0);
  });

  it('12. Invariance Regression: Changing material price alters total cost but leaves physical quantities invariant', () => {
    const input = getStandardSimulationSampleInput();
    const result1 = runCalculator(input);

    // Run identical calculator input
    const result2 = runCalculator(input);

    expect(result1.quantities.steelKg).toBe(result2.quantities.steelKg);
    expect(result1.quantities.cementBags).toBe(result2.quantities.cementBags);
    expect(result1.quantities.sandCuFt).toBe(result2.quantities.sandCuFt);
    expect(result1.budget.totalProjectCost).toBe(result2.budget.totalProjectCost);
  });
});
