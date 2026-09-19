// ============================================================
// CONFIGURATION VALIDATION ENGINE
// Enforces schema compliance, numerical boundaries, unit integrity,
// and safety invariants before parameters or versions can be saved or published.
// ============================================================

import { CalculationParameter, ConfigurationVersion } from './types';

export interface ValidationIssue {
  parameterKey: string;
  field: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
  currentValue?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const VALID_LOCATIONS = new Set(['ALL', 'Bangalore', 'Bengaluru', 'Mysore', 'Mysuru', 'Gram Panchayat', 'Rural']);
const VALID_TIERS = new Set(['ALL', 'STANDARD', 'PREMIUM', 'LUXURY', 'Essential']);

// Critical parameters that must NEVER be zero or negative
const NON_ZERO_CRITICAL_KEYS = new Set([
  'config.structure.wall_height_ft',
  'config.rcc.steel_base_factor_kg_sqft',
  'config.material.cement_bags_per_sqft',
  'config.material.m_sand_cft_per_sqft',
  'config.material.p_sand_cft_per_sqft',
  'config.material.coarse_aggregate_cft_per_sqft',
  'config.paint.interior_coverage_sqft_per_litre',
  'config.paint.exterior_coverage_sqft_per_litre',
]);

/**
 * Validates an individual calculation parameter
 */
export function validateParameter(param: Partial<CalculationParameter>): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const key = param.key || 'UNKNOWN_KEY';

  // 1. Mandatory Identity Fields
  if (!param.key || typeof param.key !== 'string' || param.key.trim().length === 0) {
    errors.push({ parameterKey: key, field: 'key', severity: 'ERROR', message: 'Parameter key is required and must be a non-empty string.' });
  }

  if (!param.name || typeof param.name !== 'string' || param.name.trim().length === 0) {
    errors.push({ parameterKey: key, field: 'name', severity: 'ERROR', message: 'Parameter name is required.' });
  }

  if (!param.category) {
    errors.push({ parameterKey: key, field: 'category', severity: 'ERROR', message: 'Category is required.' });
  }

  // 2. Value Integrity
  if (param.value === undefined || param.value === null) {
    errors.push({ parameterKey: key, field: 'value', severity: 'ERROR', message: 'Parameter value cannot be null or undefined.' });
  } else if (typeof param.value === 'number') {
    if (isNaN(param.value)) {
      errors.push({ parameterKey: key, field: 'value', severity: 'ERROR', message: 'Numerical value cannot be NaN.' });
    }
    if (!isFinite(param.value)) {
      errors.push({ parameterKey: key, field: 'value', severity: 'ERROR', message: 'Numerical value cannot be Infinity.' });
    }
    if (param.value < 0) {
      errors.push({ parameterKey: key, field: 'value', severity: 'ERROR', message: 'Numerical parameter cannot be negative.', currentValue: param.value });
    }

    // Critical non-zero check
    if (NON_ZERO_CRITICAL_KEYS.has(key) && param.value === 0) {
      errors.push({
        parameterKey: key,
        field: 'value',
        severity: 'ERROR',
        message: 'Critical parameter cannot be zero.',
        currentValue: param.value,
      });
    }

    // Min / Max bounds check
    if (typeof param.minimum === 'number' && param.value < param.minimum) {
      errors.push({
        parameterKey: key,
        field: 'value',
        severity: 'ERROR',
        message: `Value ${param.value} is below configured minimum (${param.minimum}).`,
        currentValue: param.value,
      });
    }
    if (typeof param.maximum === 'number' && param.value > param.maximum) {
      errors.push({
        parameterKey: key,
        field: 'value',
        severity: 'ERROR',
        message: `Value ${param.value} is above configured maximum (${param.maximum}).`,
        currentValue: param.value,
      });
    }
  }

  // 3. Location Scope
  if (param.location && !VALID_LOCATIONS.has(param.location)) {
    warnings.push({
      parameterKey: key,
      field: 'location',
      severity: 'WARNING',
      message: `Location '${param.location}' is not a recognized production location scope.`,
      currentValue: param.location,
    });
  }

  // 4. Specification Tier Scope
  if (param.specificationTier && !VALID_TIERS.has(param.specificationTier)) {
    warnings.push({
      parameterKey: key,
      field: 'specificationTier',
      severity: 'WARNING',
      message: `Tier '${param.specificationTier}' is not in standard tiers (STANDARD, PREMIUM, LUXURY, ALL).`,
      currentValue: param.specificationTier,
    });
  }

  // 5. Source / Status
  if (!param.source || param.source.trim().length === 0) {
    warnings.push({ parameterKey: key, field: 'source', severity: 'WARNING', message: 'Source citation is missing.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a complete version bundle before publishing
 */
export function validateConfigurationVersion(
  version: Partial<ConfigurationVersion>,
  parameters: CalculationParameter[]
): ValidationResult {
  const allErrors: ValidationIssue[] = [];
  const allWarnings: ValidationIssue[] = [];

  if (!version.versionNumber || !/^v\d+\.\d+\.\d+(-[a-z0-9.]+)?$/i.test(version.versionNumber)) {
    allErrors.push({
      parameterKey: 'VERSION_METADATA',
      field: 'versionNumber',
      severity: 'ERROR',
      message: `Version number '${version.versionNumber}' does not adhere to Semantic Versioning (e.g. v1.0.0).`,
    });
  }

  if (parameters.length === 0) {
    allErrors.push({
      parameterKey: 'VERSION_METADATA',
      field: 'parameters',
      severity: 'ERROR',
      message: 'Configuration version cannot have zero parameters.',
    });
  }

  // Validate every individual parameter
  for (const p of parameters) {
    const res = validateParameter(p);
    allErrors.push(...res.errors);
    allWarnings.push(...res.warnings);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
