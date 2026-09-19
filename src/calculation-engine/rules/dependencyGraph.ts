// ============================================================
// CALCULATION RULE DEPENDENCY GRAPH & CYCLE DETECTOR
// Constructs a directed acyclic graph (DAG) of calculation rules and metrics.
// Validates references, detects cycles, and guarantees execution order.
// ============================================================

import { RuleNode, CalculationRule } from './types';

export interface GraphNode {
  id: string; // e.g. rule key or parameter key or metric key
  type: 'PARAMETER' | 'METRIC' | 'RULE';
  dependencies: Set<string>;
  dependents: Set<string>;
}

export interface DependencyValidationResult {
  isValid: boolean;
  hasCycle: boolean;
  cycleNodes?: string[];
  missingReferences: Array<{ from: string; missingKey: string; expectedType: string }>;
  topologicalOrder?: string[];
}

export class DependencyGraph {
  private nodes: Map<string, GraphNode> = new Map();

  public addNode(id: string, type: 'PARAMETER' | 'METRIC' | 'RULE'): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        type,
        dependencies: new Set(),
        dependents: new Set(),
      });
    }
  }

  public addDependency(fromNode: string, dependsOnNode: string): void {
    const from = this.nodes.get(fromNode);
    const to = this.nodes.get(dependsOnNode);

    if (from && to) {
      from.dependencies.add(dependsOnNode);
      to.dependents.add(fromNode);
    }
  }

  /**
   * Extract all parameter and metric references from a RuleNode AST recursively
   */
  public extractASTReferences(node: RuleNode): { parameterKeys: string[]; metricKeys: string[] } {
    const parameterKeys: string[] = [];
    const metricKeys: string[] = [];

    const traverse = (current: RuleNode) => {
      if (!current) return;
      switch (current.type) {
        case 'PARAMETER_REF':
          parameterKeys.push(current.parameterKey);
          break;
        case 'METRIC_REF':
          metricKeys.push(current.metricKey);
          break;
        case 'BINARY_OP':
          traverse(current.left);
          traverse(current.right);
          break;
        case 'FUNCTION_OP':
          current.arguments.forEach(traverse);
          break;
        case 'CONDITIONAL':
          metricKeys.push(current.condition.field);
          traverse(current.whenTrue);
          traverse(current.whenFalse);
          break;
      }
    };

    traverse(node);
    return {
      parameterKeys: Array.from(new Set(parameterKeys)),
      metricKeys: Array.from(new Set(metricKeys)),
    };
  }

  /**
   * Populate graph from a set of rules and known parameters/metrics
   */
  public buildFromRules(
    rules: CalculationRule[],
    knownParameters: Set<string>,
    knownMetrics: Set<string>
  ): DependencyValidationResult {
    this.nodes.clear();

    // 1. Register all known parameters and metrics
    knownParameters.forEach((p) => this.addNode(p, 'PARAMETER'));
    knownMetrics.forEach((m) => this.addNode(m, 'METRIC'));

    const missingReferences: Array<{ from: string; missingKey: string; expectedType: string }> = [];

    // 2. Register rules and their dependencies
    rules.forEach((rule) => {
      this.addNode(rule.key, 'RULE');
      const refs = this.extractASTReferences(rule.rootNode);

      refs.parameterKeys.forEach((pKey) => {
        if (!knownParameters.has(pKey)) {
          missingReferences.push({ from: rule.key, missingKey: pKey, expectedType: 'PARAMETER' });
        } else {
          this.addDependency(rule.key, pKey);
        }
      });

      refs.metricKeys.forEach((mKey) => {
        if (!knownMetrics.has(mKey) && !this.nodes.has(mKey)) {
          missingReferences.push({ from: rule.key, missingKey: mKey, expectedType: 'METRIC' });
        } else {
          this.addDependency(rule.key, mKey);
        }
      });
    });

    // 3. Cycle Detection using Tarjan / DFS with visited states
    const visited = new Map<string, 'UNVISITED' | 'VISITING' | 'VISITED'>();
    const cycleNodes: string[] = [];
    let hasCycle = false;

    for (const nodeId of this.nodes.keys()) {
      visited.set(nodeId, 'UNVISITED');
    }

    const dfs = (nodeId: string, path: string[]): boolean => {
      visited.set(nodeId, 'VISITING');
      path.push(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          const state = visited.get(depId);
          if (state === 'VISITING') {
            hasCycle = true;
            const cycleStart = path.indexOf(depId);
            cycleNodes.push(...path.slice(cycleStart), depId);
            return true;
          }
          if (state === 'UNVISITED') {
            if (dfs(depId, path)) return true;
          }
        }
      }

      path.pop();
      visited.set(nodeId, 'VISITED');
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (visited.get(nodeId) === 'UNVISITED') {
        if (dfs(nodeId, [])) break;
      }
    }

    // 4. Topological Sort (Kahn's Algorithm) if no cycle
    const topologicalOrder: string[] = [];
    if (!hasCycle) {
      const inDegree = new Map<string, number>();
      for (const [id, node] of this.nodes.entries()) {
        inDegree.set(id, node.dependencies.size);
      }

      const queue: string[] = [];
      for (const [id, deg] of inDegree.entries()) {
        if (deg === 0) queue.push(id);
      }

      while (queue.length > 0) {
        const curr = queue.shift()!;
        topologicalOrder.push(curr);

        const node = this.nodes.get(curr);
        if (node) {
          for (const dep of node.dependents) {
            const newDeg = (inDegree.get(dep) || 1) - 1;
            inDegree.set(dep, newDeg);
            if (newDeg === 0) queue.push(dep);
          }
        }
      }
    }

    const isValid = !hasCycle && missingReferences.length === 0;

    return {
      isValid,
      hasCycle,
      cycleNodes: hasCycle ? cycleNodes : undefined,
      missingReferences,
      topologicalOrder: !hasCycle ? topologicalOrder : undefined,
    };
  }

  /**
   * Get downstream impact of a parameter or metric
   */
  public getDownstreamImpact(startNodeId: string): string[] {
    const visited = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = this.nodes.get(current);
      if (node) {
        for (const dep of node.dependents) {
          if (!visited.has(dep)) {
            visited.add(dep);
            queue.push(dep);
          }
        }
      }
    }

    return Array.from(visited);
  }

  /**
   * Run cycle detection on the current nodes in the graph
   */
  public detectCycle(): { hasCycle: boolean; cycleNodes?: string[] } {
    const visited = new Map<string, 'UNVISITED' | 'VISITING' | 'VISITED'>();
    const cycleNodes: string[] = [];
    let hasCycle = false;

    for (const nodeId of this.nodes.keys()) {
      visited.set(nodeId, 'UNVISITED');
    }

    const dfs = (nodeId: string, path: string[]): boolean => {
      visited.set(nodeId, 'VISITING');
      path.push(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          const state = visited.get(depId);
          if (state === 'VISITING') {
            hasCycle = true;
            const cycleStart = path.indexOf(depId);
            cycleNodes.push(...path.slice(cycleStart), depId);
            return true;
          }
          if (state === 'UNVISITED') {
            if (dfs(depId, path)) return true;
          }
        }
      }

      path.pop();
      visited.set(nodeId, 'VISITED');
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (visited.get(nodeId) === 'UNVISITED') {
        if (dfs(nodeId, [])) break;
      }
    }

    return {
      hasCycle,
      cycleNodes: hasCycle ? cycleNodes : undefined,
    };
  }

  /**
   * Validate current graph or return success if graph is clean
   */
  public validateGraph(): DependencyValidationResult {
    if (this.nodes.size === 0) {
      return {
        isValid: true,
        hasCycle: false,
        missingReferences: [],
        topologicalOrder: []
      };
    }
    return this.buildFromRules([], new Set(), new Set());
  }
}

export const ruleDependencyGraph = new DependencyGraph();
