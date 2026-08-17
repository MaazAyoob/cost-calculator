// ============================================================
// REPORT MODULE – Assembles the full reportable data structure
// ============================================================

import {
  EngineInput, AreaResult, MaterialQuantities, BudgetResult,
  TimelineResult, PaymentMilestone, BOQItem, ProcurementItem, ReportData,
  CalculationTraceStep,
} from '../types';

export function assembleReport(
  input: EngineInput,
  area: AreaResult,
  quantities: MaterialQuantities,
  budget: BudgetResult,
  timeline: TimelineResult,
  paymentPlan: PaymentMilestone[],
  boq: BOQItem[],
  procurement: ProcurementItem[],
  trace: CalculationTraceStep[]
): ReportData {
  const recommendations: string[] = [
    `Use ${input.qualityTier === 'Luxury' ? 'UltraTech ProTech 53+' : 'UltraTech OPC 53'} cement throughout for consistent 28-day strength.`,
    `Engage a licensed geotechnical agency for soil bore testing before foundation design is finalised.`,
    `All RMC pours require 28-day IS 516 cube test certificates — maintain at site office.`,
    `Ensure chemical earthing pits achieve below 1 Ohm resistance before electrical works sign-off.`,
    `Conduct 48-hour standing water pond test on all bathroom and terrace waterproofing before tile fixing.`,
    `Install anti-skid grooves on all granite stair treads to comply with NBC 2016 safety codes.`,
    `UPVC windows should be factory-measured after plaster is complete to ensure accurate sizing.`,
    `Maintain an As-Built drawing record of all concealed electrical conduit and plumbing pipe routes.`,
    input.evCharging
      ? 'EV charging specification should be finalised with BESCOM prior to electrical rough-in stage.'
      : 'Consider future-proofing by installing conduit sleeves for EV charging during electrical rough-in.',
    input.liftRequired
      ? 'Lift pit design must be included in structural drawing before foundation excavation begins.'
      : 'Provision shaft opening in RCC slab if future lift installation is planned.',
  ];

  return {
    projectId:      `RC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    generatedAt:    new Date().toISOString(),
    clientName:     'Homeowner',
    engineVersion:  '1.0.0',
    input,
    area,
    quantities,
    budget,
    boq,
    timeline,
    paymentPlan,
    procurement,
    recommendations,
    trace,
  };
}
