// ============================================================
// CALCULATION RULE ENGINE — DOMAIN TYPES & AST SPECIFICATION
// Controlled structured rule representations without arbitrary code execution
// ============================================================

export type RuleOperation =
  | 'ADD'
  | 'SUBTRACT'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'MIN'
  | 'MAX'
  | 'PERCENTAGE'
  | 'ROUND'
  | 'CEIL'
  | 'FLOOR'
  | 'CONDITIONAL'
  | 'LOOKUP'
  | 'SUM'
  | 'COUNT';

export type RuleConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'IN'
  | 'NOT_IN';

export interface RuleCondition {
  field: string;
  operator: RuleConditionOperator;
  value: any;
}

export type RuleNodeType =
  | 'CONSTANT'
  | 'PARAMETER_REF'
  | 'METRIC_REF'
  | 'BINARY_OP'
  | 'FUNCTION_OP'
  | 'CONDITIONAL';

export interface BaseRuleNode {
  type: RuleNodeType;
  outputUnit?: string;
  description?: string;
}

export interface ConstantRuleNode extends BaseRuleNode {
  type: 'CONSTANT';
  value: number | string | boolean;
}

export interface ParameterRefRuleNode extends BaseRuleNode {
  type: 'PARAMETER_REF';
  parameterKey: string;
  fallbackValue?: number;
}

export interface MetricRefRuleNode extends BaseRuleNode {
  type: 'METRIC_REF';
  metricKey: string; // e.g. 'builtUpArea', 'groundFloorArea', 'internalWallArea', 'ceilingArea', 'floors'
}

export interface BinaryOpRuleNode extends BaseRuleNode {
  type: 'BINARY_OP';
  operation: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'MIN' | 'MAX' | 'PERCENTAGE';
  left: RuleNode;
  right: RuleNode;
}

export interface FunctionOpRuleNode extends BaseRuleNode {
  type: 'FUNCTION_OP';
  operation: 'ROUND' | 'CEIL' | 'FLOOR' | 'SUM' | 'COUNT';
  arguments: RuleNode[];
  precision?: number;
}

export interface ConditionalRuleNode extends BaseRuleNode {
  type: 'CONDITIONAL';
  condition: RuleCondition;
  whenTrue: RuleNode;
  whenFalse: RuleNode;
}

export type RuleNode =
  | ConstantRuleNode
  | ParameterRefRuleNode
  | MetricRefRuleNode
  | BinaryOpRuleNode
  | FunctionOpRuleNode
  | ConditionalRuleNode;

export interface CalculationRule {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  outputUnit: string;
  roundingPrecision?: number;
  rootNode: RuleNode;
  dependencies: string[];
  affectedMetrics: string[];
  affectedBOQLines: string[];
  enabled: boolean;
  version: string;
  updatedAt: string;
}

export interface CalculationMethodDefinition {
  id: string;
  category: 'STEEL' | 'MASONRY' | 'FLOORING' | 'PAINT' | 'WATERPROOFING' | 'PLUMBING' | 'ELECTRICAL' | 'LABOUR' | 'COMMERCIAL';
  name: string;
  description: string;
  supportedMethods: Array<{
    methodId: string;
    displayName: string;
    description: string;
    requiredParameters: string[];
    rule: RuleNode;
  }>;
  activeMethodId: string;
}
