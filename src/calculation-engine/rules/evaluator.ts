// ============================================================
// CALCULATION RULE EVALUATOR
// Deterministic, secure AST evaluator. Zero code execution (no eval/Function).
// ============================================================

import {
  RuleNode,
  RuleCondition,
  CalculationRule,
} from './types';
import { configResolver } from '../config/configurationResolver';
import { ConfigurationResolutionContext } from '../config/types';

export interface EvaluationContext {
  resolutionContext?: ConfigurationResolutionContext;
  metrics: Record<string, number | string | boolean>;
}

export function evaluateCondition(condition: RuleCondition, context: EvaluationContext): boolean {
  const leftVal = context.metrics[condition.field];
  const targetVal = condition.value;

  switch (condition.operator) {
    case 'EQUALS':
      return leftVal === targetVal;
    case 'NOT_EQUALS':
      return leftVal !== targetVal;
    case 'GREATER_THAN':
      return typeof leftVal === 'number' && typeof targetVal === 'number' && leftVal > targetVal;
    case 'LESS_THAN':
      return typeof leftVal === 'number' && typeof targetVal === 'number' && leftVal < targetVal;
    case 'GREATER_OR_EQUAL':
      return typeof leftVal === 'number' && typeof targetVal === 'number' && leftVal >= targetVal;
    case 'LESS_OR_EQUAL':
      return typeof leftVal === 'number' && typeof targetVal === 'number' && leftVal <= targetVal;
    case 'IN':
      return Array.isArray(targetVal) && targetVal.includes(leftVal);
    case 'NOT_IN':
      return Array.isArray(targetVal) && !targetVal.includes(leftVal);
    default:
      return false;
  }
}

export function evaluateRuleNode(node: RuleNode, context: EvaluationContext): number {
  switch (node.type) {
    case 'CONSTANT': {
      const num = Number(node.value);
      if (isNaN(num)) throw new Error(`Constant value '${node.value}' is not a valid number.`);
      return num;
    }

    case 'PARAMETER_REF': {
      return configResolver.resolveParameter<number>(
        node.parameterKey,
        context.resolutionContext,
        node.fallbackValue ?? 0
      );
    }

    case 'METRIC_REF': {
      const metric = context.metrics[node.metricKey];
      if (metric === undefined) {
        throw new Error(`Referenced calculation metric '${node.metricKey}' is not present in evaluation context.`);
      }
      return Number(metric);
    }

    case 'BINARY_OP': {
      const left = evaluateRuleNode(node.left, context);
      const right = evaluateRuleNode(node.right, context);

      switch (node.operation) {
        case 'ADD':
          return left + right;
        case 'SUBTRACT':
          return left - right;
        case 'MULTIPLY':
          return left * right;
        case 'DIVIDE':
          if (right === 0) {
            throw new Error(`Division by zero in rule node: left=${left}, right=${right}`);
          }
          return left / right;
        case 'MIN':
          return Math.min(left, right);
        case 'MAX':
          return Math.max(left, right);
        case 'PERCENTAGE':
          return (left * right) / 100;
        default:
          throw new Error(`Unsupported binary operation: ${(node as any).operation}`);
      }
    }

    case 'FUNCTION_OP': {
      const evaluatedArgs = node.arguments.map((arg) => evaluateRuleNode(arg, context));
      switch (node.operation) {
        case 'ROUND': {
          const precision = node.precision ?? 0;
          const factor = Math.pow(10, precision);
          return Math.round(evaluatedArgs[0] * factor) / factor;
        }
        case 'CEIL':
          return Math.ceil(evaluatedArgs[0]);
        case 'FLOOR':
          return Math.floor(evaluatedArgs[0]);
        case 'SUM':
          return evaluatedArgs.reduce((acc, val) => acc + val, 0);
        case 'COUNT':
          return evaluatedArgs.length;
        default:
          throw new Error(`Unsupported function operation: ${(node as any).operation}`);
      }
    }

    case 'CONDITIONAL': {
      const conditionMatches = evaluateCondition(node.condition, context);
      return conditionMatches
        ? evaluateRuleNode(node.whenTrue, context)
        : evaluateRuleNode(node.whenFalse, context);
    }

    default:
      throw new Error(`Unknown AST RuleNode type: ${(node as any).type}`);
  }
}

export function executeRule(rule: CalculationRule, context: EvaluationContext): number {
  if (!rule.enabled) {
    return 0;
  }
  const rawResult = evaluateRuleNode(rule.rootNode, context);
  if (rule.roundingPrecision !== undefined) {
    const factor = Math.pow(10, rule.roundingPrecision);
    return Math.round(rawResult * factor) / factor;
  }
  return rawResult;
}
