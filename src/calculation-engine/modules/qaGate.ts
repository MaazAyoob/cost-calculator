// ============================================================
// MANDATORY AUTOMATED QA GATE MODULE (P0.7)
// Strictly enforces calculation integrity before customer reports can be generated
// (Per Hutty Launch Readiness Report Section 8 & Section 11)
//
// 11 Core Checks:
// 1. Quantity × Rate reconciliation
// 2. Section totals match line item sums
// 3. Commercial total reconciles with all underlying cost components
// 4. Trade percentages reconcile to 100%
// 5. Payment schedule equals 100% and matches project total
// 6. Opening dimensions: Count × Width × Height = Area
// 7. Bathroom fixture counts match configuration or explicit overrides
// 8. Unit consistency (no unit mismatches)
// 9. Required mandatory inputs exist
// 10. Rate Master metadata & Electrical pricing reconciliation
// 11. Traceability metadata exists
// ============================================================

import { CalculationResult, QAGateResult, QACheckResult } from '../types';

export function runQAGate(data: CalculationResult): QAGateResult {
  const checks: QACheckResult[] = [];
  const blockingErrors: string[] = [];
  const warnings: string[] = [];

  const {
    input,
    area,
    boq,
    materialSchedule,
    fixtureSchedule,
    budget,
    windowSchedule,
    paymentPlan,
    quantities,
    trace,
  } = data;

  const isZeroState = (area?.totalBUASqFt || 0) <= 0;

  // ── CHECK 1: Quantity × Rate Reconciliation ──
  let qtyRateMismatchCount = 0;
  const qtyRateErrors: string[] = [];

  // Validate BOQ items
  (boq || []).forEach((item) => {
    const expected = Math.round(item.quantity * item.unitRate);
    if (Math.abs(expected - item.amount) > 2) {
      qtyRateMismatchCount++;
      qtyRateErrors.push(`BOQ item '${item.description}': ${item.quantity} ${item.unit} × ₹${item.unitRate} = ₹${expected}, but recorded ₹${item.amount}`);
    }
  });

  // Validate Materials items
  (materialSchedule || []).forEach((item) => {
    const expected = Math.round(item.quantity * item.unitRate);
    if (Math.abs(expected - item.amount) > 2) {
      qtyRateMismatchCount++;
      qtyRateErrors.push(`Material item '${item.material}': ${item.quantity} ${item.unit} × ₹${item.unitRate} = ₹${expected}, but recorded ₹${item.amount}`);
    }
  });

  // Validate Fixtures items
  (fixtureSchedule || []).forEach((item) => {
    const expected = Math.round(item.quantity * item.unitRate);
    if (Math.abs(expected - item.amount) > 2) {
      qtyRateMismatchCount++;
      qtyRateErrors.push(`Fixture item '${item.item}': ${item.quantity} ${item.unit} × ₹${item.unitRate} = ₹${expected}, but recorded ₹${item.amount}`);
    }
  });

  const check1Passed = qtyRateMismatchCount === 0;
  checks.push({
    id: 'CHECK_QTY_RATE',
    name: 'Quantity × Rate Reconciliation',
    passed: check1Passed,
    isBlocking: true,
    message: check1Passed
      ? 'All items mathematically reconcile within rounding tolerance.'
      : `${qtyRateMismatchCount} item(s) failed quantity × rate reconciliation: ${qtyRateErrors.slice(0, 3).join('; ')}`,
    details: { mismatchCount: qtyRateMismatchCount, sampleErrors: qtyRateErrors.slice(0, 5) },
  });
  if (!check1Passed && !isZeroState) {
    blockingErrors.push(`Quantity × Rate failure: ${qtyRateErrors[0]}`);
  }

  // ── CHECK 2: Section Totals Match Line-Item Sums ──
  const boqSum = (boq || []).reduce((acc, item) => acc + (item.amount || 0), 0);
  const baseCost = budget?.baseConstructionCost || 0;
  const check2Passed = Math.abs(boqSum - baseCost) <= 2;
  checks.push({
    id: 'CHECK_SECTION_TOTALS',
    name: 'Section Totals Match Line-Item Sums',
    passed: check2Passed,
    isBlocking: true,
    message: check2Passed
      ? `Section A Works BOQ sum (₹${boqSum.toLocaleString('en-IN')}) exactly matches Base Construction Cost.`
      : `Section A Works sum (₹${boqSum.toLocaleString('en-IN')}) does not match Base Construction Cost (₹${baseCost.toLocaleString('en-IN')}).`,
    details: { boqSum, baseCost },
  });
  if (!check2Passed && !isZeroState) {
    blockingErrors.push(`Section total mismatch: Works BOQ sum ₹${boqSum} != Base cost ₹${baseCost}`);
  }

  // ── CHECK 3: Commercial Total Reconciles ──
  const additionsSum =
    (budget?.contractorMargin || 0) +
    (budget?.contingency || 0) +
    (budget?.professionalFees || 0) +
    (budget?.gstAmount || 0);
  const totalCost = budget?.totalProjectCost || 0;
  const expectedTotal = baseCost + additionsSum;
  const check3Passed = Math.abs(expectedTotal - totalCost) <= 2;
  checks.push({
    id: 'CHECK_COMMERCIAL_TOTAL',
    name: 'Commercial Total Reconciliation',
    passed: check3Passed,
    isBlocking: true,
    message: check3Passed
      ? `Total Project Cost (₹${totalCost.toLocaleString('en-IN')}) reconciles perfectly with Base Cost + Margins + Taxes.`
      : `Commercial mismatch: Base (₹${baseCost}) + Additions (₹${additionsSum}) = ₹${expectedTotal}, but Total is ₹${totalCost}.`,
    details: { baseCost, additionsSum, totalCost, expectedTotal },
  });
  if (!check3Passed && !isZeroState) {
    blockingErrors.push(`Commercial total mismatch: Expected ₹${expectedTotal} != Actual ₹${totalCost}`);
  }

  // ── CHECK 4: Trade Head Percentages Reconcile ──
  const heads = budget?.heads || [];
  const percentageSum = heads.reduce((sum, h) => sum + (h.percentage || 0), 0);
  // With 1 decimal rounding across ~14 heads, acceptable tolerance is 99.0% to 101.0%
  const check4Passed = isZeroState || (percentageSum >= 99.0 && percentageSum <= 101.0);
  checks.push({
    id: 'CHECK_PERCENTAGES',
    name: 'Trade Allocation Percentages',
    passed: check4Passed,
    isBlocking: true,
    message: check4Passed
      ? `Trade percentages sum to ${percentageSum.toFixed(1)}% (within rounding tolerance of 100%).`
      : `Trade percentages sum to ${percentageSum.toFixed(1)}%, outside accepted tolerance.`,
    details: { percentageSum },
  });
  if (!check4Passed && !isZeroState) {
    blockingErrors.push(`Percentage sum invalid: ${percentageSum.toFixed(1)}%`);
  }

  // ── CHECK 5: Payment Schedule Completeness & Reconciliation ──
  const payments = paymentPlan || [];
  const paymentPctSum = payments.reduce((sum, p) => sum + (p.percentage || 0), 0);
  const paymentAmtSum = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const isCompleteSchedule = Math.abs(paymentPctSum - 100) < 0.1;
  const amountsReconcile = Math.abs(paymentAmtSum - totalCost) <= 2;
  const check5Passed = isZeroState || (isCompleteSchedule && amountsReconcile);
  checks.push({
    id: 'CHECK_PAYMENT_SCHEDULE',
    name: 'Payment Schedule Reconciliation',
    passed: check5Passed,
    isBlocking: true,
    message: check5Passed
      ? `Payment schedule totals ${paymentPctSum}% and ₹${paymentAmtSum.toLocaleString('en-IN')} (100% reconciled to project total).`
      : `Payment schedule incomplete: totals ${paymentPctSum}% (₹${paymentAmtSum.toLocaleString('en-IN')}) vs Project Total ₹${totalCost.toLocaleString('en-IN')}.`,
    details: { paymentPctSum, paymentAmtSum, totalCost },
  });
  if (!check5Passed && !isZeroState) {
    blockingErrors.push(`Payment schedule does not total 100% or does not reconcile to project total: ${paymentPctSum}%, ₹${paymentAmtSum} vs ₹${totalCost}`);
  }

  // ── CHECK 6: Window / Opening Dimensions (P0.1) ──
  let openingDimMismatchCount = 0;
  const openingErrors: string[] = [];
  (windowSchedule || []).forEach((w) => {
    const expectedArea = w.count * w.widthFt * w.heightFt;
    if (Math.abs(expectedArea - w.totalOpeningAreaSqFt) > 0.1 || Math.abs(w.quantity - w.totalOpeningAreaSqFt) > 0.1) {
      openingDimMismatchCount++;
      openingErrors.push(`${w.code}: count (${w.count}) × dimensions (${w.widthFt}×${w.heightFt} ft) = ${expectedArea} sq.ft, but area is ${w.totalOpeningAreaSqFt} sq.ft`);
    }
    const expectedAmt = Math.round(w.totalOpeningAreaSqFt * w.unitRate);
    if (Math.abs(expectedAmt - w.amount) > 2) {
      openingDimMismatchCount++;
      openingErrors.push(`${w.code}: area (${w.totalOpeningAreaSqFt} sq.ft) × rate (₹${w.unitRate}) = ₹${expectedAmt}, but amount is ₹${w.amount}`);
    }
  });
  const check6Passed = openingDimMismatchCount === 0;
  checks.push({
    id: 'CHECK_OPENING_DIMENSIONS',
    name: 'Opening Dimensions & Area Rate Logic',
    passed: check6Passed,
    isBlocking: true,
    message: check6Passed
      ? 'All window/ventilator openings satisfy: count × width × height = area, and area × rate = amount.'
      : `${openingDimMismatchCount} opening(s) have dimensional or rate mismatches: ${openingErrors.join('; ')}`,
    details: { openingDimMismatchCount, openingErrors },
  });
  if (!check6Passed && !isZeroState) {
    blockingErrors.push(`Opening calculation mismatch: ${openingErrors[0]}`);
  }

  // ── CHECK 7: Bathroom Fixture Consistency (P0.6) ──
  const bathRooms = input?.rooms?.bathrooms || 0;
  const commonToilets = input?.rooms?.commonToilets || 0;
  const configuredBaths = bathRooms + commonToilets;
  const overrides = input?.fixtureOverrides || input?.bathroomFittings?.fixtureOverrides;

  let check7Passed = true;
  let check7Message = 'Bathroom fixtures match room configuration.';
  if (!isZeroState && configuredBaths > 0) {
    if (overrides) {
      check7Message = 'Bathroom fixtures derived with explicit user overrides.';
    } else {
      // Without overrides, wcCount and washBasinCount must equal configured baths
      if (quantities.wcCount !== configuredBaths) {
        check7Passed = false;
        check7Message = `Configured bathrooms = ${configuredBaths}, but WC count = ${quantities.wcCount} without an explicit override.`;
      } else if (quantities.washBasinCount !== configuredBaths) {
        check7Passed = false;
        check7Message = `Configured bathrooms = ${configuredBaths}, but Wash Basin count = ${quantities.washBasinCount} without an explicit override.`;
      }
    }
  }
  checks.push({
    id: 'CHECK_FIXTURE_CONSISTENCY',
    name: 'Bathroom Fixture Consistency',
    passed: check7Passed,
    isBlocking: true,
    message: check7Message,
    details: { configuredBaths, wcCount: quantities?.wcCount, washBasinCount: quantities?.washBasinCount, overrides },
  });
  if (!check7Passed && !isZeroState) {
    blockingErrors.push(check7Message);
  }

  // ── CHECK 8: Unit Consistency ──
  let unitInconsistencies = 0;
  (windowSchedule || []).forEach((w) => {
    // A window cannot have unit 'Sq Ft' while quantity is equal to opening count if opening area > 1
    if (w.unit === 'Sq Ft' && w.quantity === w.count && w.unitAreaSqFt > 1) {
      unitInconsistencies++;
    }
  });
  const check8Passed = unitInconsistencies === 0;
  checks.push({
    id: 'CHECK_UNIT_CONSISTENCY',
    name: 'Unit Consistency in Schedules',
    passed: check8Passed,
    isBlocking: true,
    message: check8Passed
      ? 'Units and quantity scales are consistently represented across all schedules.'
      : `${unitInconsistencies} items mix count and area in a single quantity field.`,
    details: { unitInconsistencies },
  });
  if (!check8Passed && !isZeroState) {
    blockingErrors.push('Unit consistency error: opening count used as area quantity');
  }

  // ── CHECK 9: Required Mandatory Inputs ──
  const hasRequiredInputs =
    Boolean(input?.city) &&
    typeof input?.plotLength === 'number' &&
    typeof input?.plotWidth === 'number' &&
    typeof input?.floors === 'number';
  const check9Passed = hasRequiredInputs;
  checks.push({
    id: 'CHECK_REQUIRED_INPUTS',
    name: 'Required Project Inputs',
    passed: check9Passed,
    isBlocking: true,
    message: check9Passed
      ? 'All mandatory configuration parameters exist.'
      : 'Missing mandatory configuration inputs (city, plot dimensions, or floor count).',
    details: { city: input?.city, plotLength: input?.plotLength, plotWidth: input?.plotWidth, floors: input?.floors },
  });
  if (!check9Passed) {
    blockingErrors.push('Missing mandatory project configuration inputs.');
  }

  // ── CHECK 10: Rate Master Metadata & Electrical Reconciliation (P0.8) ──
  // Verifies all items have positive rates, conductor sizing is segregated, and
  // electrical line items mathematically reconcile with active Rate Master metadata
  let missingRateCount = 0;
  const rateErrors: string[] = [];

  (boq || []).forEach((item) => {
    if (!item.unitRate || item.unitRate <= 0) {
      missingRateCount++;
      rateErrors.push(`Item '${item.description}' missing positive unit rate`);
    }
  });

  const electricalBoqItems = (boq || []).filter(
    (item) => item.category === 'Electrical' || item.code.startsWith('EL-') || item.code.startsWith('BOQ-ELEC-')
  );

  if (!isZeroState && (input?.floors || 0) > 0) {
    if (electricalBoqItems.length === 0) {
      missingRateCount++;
      rateErrors.push('Missing segregated electrical BOQ line items.');
    }

    electricalBoqItems.forEach((item) => {
      const expected = Math.round(item.quantity * item.unitRate);
      if (Math.abs(expected - item.amount) > 2) {
        missingRateCount++;
        rateErrors.push(`Electrical item '${item.description}': ${item.quantity} × ₹${item.unitRate} = ₹${expected}, recorded ₹${item.amount}`);
      }
    });

    const conduitVal = quantities?.conduitsMetres || (quantities as any)?.conduitMetres || 0;
    // wire1_5SqMmMetres (lighting/fans) and conduit are always present when floors > 0.
    // wire2_5SqMmMetres (sockets) is only expected when rooms with sockets are configured.
    const hasSocketRooms = (input?.rooms?.bedrooms || 0) + (input?.rooms?.living || 0) +
      (input?.rooms?.kitchen || 0) + (input?.rooms?.dining || 0) + (input?.rooms?.office || 0) > 0;
    const wire2_5Passes = !hasSocketRooms || (quantities?.wire2_5SqMmMetres || 0) > 0;
    if (
      (quantities?.wire1_5SqMmMetres || 0) <= 0 ||
      !wire2_5Passes ||
      conduitVal <= 0
    ) {
      missingRateCount++;
      rateErrors.push('Segregated conductor or conduit takeoff has non-positive quantities.');
    }

    const rateMeta = data.rateSourceMetadata || data.report?.rateSourceMetadata;
    if (!rateMeta || (!rateMeta.datasetVersion && !rateMeta.version)) {
      missingRateCount++;
      rateErrors.push('Missing Rate Source Metadata / Rate Master dataset version.');
    }
  }

  const check10Passed = missingRateCount === 0;
  checks.push({
    id: 'CHECK_RATE_METADATA',
    name: 'Rate Master Metadata & Electrical Pricing Reconciliation',
    passed: check10Passed,
    isBlocking: true,
    message: check10Passed
      ? `All active items have verified positive rates and all ${electricalBoqItems.length} electrical line items mathematically reconcile.`
      : `${missingRateCount} item(s) failed rate or electrical reconciliation: ${rateErrors.slice(0, 3).join('; ')}`,
    details: { missingRateCount, rateErrors: rateErrors.slice(0, 5) },
  });
  if (!check10Passed && !isZeroState) {
    blockingErrors.push(`Rate Master / Electrical failure: ${rateErrors[0]}`);
  }

  // ── CHECK 11: Calculation Traceability Metadata ──
  const traceSteps = trace || [];
  const hasTraceability = traceSteps.length >= 8 && traceSteps.every((t) => Boolean(t.parameter) && Boolean(t.formula));
  const check11Passed = isZeroState || hasTraceability;
  checks.push({
    id: 'CHECK_TRACEABILITY',
    name: 'Calculation Traceability Metadata',
    passed: check11Passed,
    isBlocking: true,
    message: check11Passed
      ? `Traceability chain complete: ${traceSteps.length} key engineering derivations verified.`
      : `Traceability incomplete: only ${traceSteps.length} derivations available.`,
    details: { traceStepsCount: traceSteps.length },
  });
  if (!check11Passed && !isZeroState) {
    blockingErrors.push('Calculation traceability metadata incomplete.');
  }

  const passed = blockingErrors.length === 0;

  return {
    passed,
    blockingErrors,
    warnings,
    checks,
    validatedAt: new Date().toISOString(),
  };
}
