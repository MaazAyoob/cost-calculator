// ============================================================
// REPORT MODULE – Assembles the 4-Section Customer-Facing Report
// Strictly follows Hutty Pilot Specification (Section 26)
//
// 4 Core Sections:
// SECTION A — WHAT WE BUILD: Works & Activity Breakdown (BOQ)
// SECTION B — WHAT WE CONSUME: Material Schedule (Physical Consumables)
// SECTION C — WHAT WE INSTALL: Fixtures & Fittings Schedule
// SECTION D — WHAT IT COSTS: Cost Breakdown, Margin, GST & Total
// ============================================================

import {
  EngineInput,
  AreaResult,
  BuildingModel,
  MaterialQuantities,
  BudgetResult,
  TimelineResult,
  PaymentMilestone,
  BOQItem,
  MaterialScheduleItem,
  FixtureScheduleItem,
  DoorScheduleItem,
  WindowScheduleItem,
  ProcurementItem,
  CalculationTraceStep,
  QSParameterItem,
  ReportData,
} from '../types';
import { CENTRALIZED_ENGINEERING_ASSUMPTIONS } from '../data/engineeringAssumptions';

export function assembleReport(
  input: EngineInput,
  area: AreaResult,
  buildingModel: BuildingModel,
  quantities: MaterialQuantities,
  budget: BudgetResult,
  timeline: TimelineResult,
  paymentPlan: PaymentMilestone[],
  boq: BOQItem[],
  materialSchedule: MaterialScheduleItem[],
  fixtureSchedule: FixtureScheduleItem[],
  doorSchedule: DoorScheduleItem[],
  windowSchedule: WindowScheduleItem[],
  procurement: ProcurementItem[],
  trace: CalculationTraceStep[],
  labourSchedule?: any[]
): ReportData {
  const recommendations: string[] = [
    `Use ${input.materialBrands?.cement || 'UltraTech OPC 53'} grade cement throughout for consistent 28-day concrete strength.`,
    `Conduct standard soil core bore testing on site to verify nominal 180 kN/sq.m soil bearing capacity before final footing sign-off.`,
    `All RMC pours require mandatory 7-day and 28-day IS 516 compressive cube test certificates on site.`,
    `Maintain 48-hour standing water pond test on all bathroom sunken slabs and top terrace slab prior to tile fixing.`,
    `Ensure chemical earthing resistance measures strictly below 1.0 Ohm before BESCOM meter commissioning.`,
    `Verify as-built conduit routes and concealed plumbing drawings before final plastering and masonry chasses closure.`,
    input.evCharging
      ? 'Finalise EV 7.2kW AC charging load sanction with municipal electricity board during foundation stage.'
      : 'Provision 32mm conduit sleeves in parking bay for future EV charging wallbox installation.',
    input.liftRequired
      ? 'Incorporate 1.5m elevator pit depth and 4.2m overhead clearance into structural drawings before foundation excavation.'
      : 'Provision structural floor slab cutout if future elevator addition is planned.',
  ];

  const parameterTable: QSParameterItem[] = Object.values(CENTRALIZED_ENGINEERING_ASSUMPTIONS);

  const steelScheduleItem = materialSchedule.find((m) => m.category === 'Rebar' || m.material.toLowerCase().includes('steel'));
  const cementScheduleItem = materialSchedule.find((m) => m.category === 'Cement' || m.material.toLowerCase().includes('cement'));

  // Snapshot visual material catalog display metadata to guarantee historical immutability
  const catalogSnapshot: Record<string, any> = {
    steel: {
      category: 'steel',
      brandName: input.materialBrands?.steel || steelScheduleItem?.brand || 'Tata Tiscon',
      productName: `${input.materialBrands?.steel || 'Tata Tiscon'} Fe 550D TMT Rebar`,
      unit: steelScheduleItem?.unit || 'Tonne',
      rate: steelScheduleItem?.unitRate || 74000,
    },
    cement: {
      category: 'cement',
      brandName: input.materialBrands?.cement || cementScheduleItem?.brand || 'UltraTech',
      productName: `${input.materialBrands?.cement || 'UltraTech'} OPC 53 Grade`,
      unit: cementScheduleItem?.unit || 'Bag',
      rate: cementScheduleItem?.unitRate || 420,
    },
    masonry: {
      category: 'masonry',
      brandName: quantities?.masonryBrand || (typeof input.materialBrands?.masonry === 'string' ? input.materialBrands.masonry : 'AAC Blocks'),
      productName: quantities?.masonryMaterial || 'AAC Blocks',
      unit: quantities?.masonryUnit || 'Block',
      rate: quantities?.masonryUnitRate || 85,
    },
    flooring: {
      category: 'flooring',
      brandName: 'Kajaria / Somany',
      productName: typeof input.flooringZones?.living === 'string' ? input.flooringZones.living : 'Vitrified Tiles',
      unit: 'sq.ft',
    },
  };

  return {
    projectId: `HUTTY-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    generatedAt: new Date().toISOString(),
    clientName: 'Homeowner',
    engineVersion: '2.0.0 (Hutty Master QS Engine)',
    input,
    area,
    buildingModel,
    quantities,
    budget,
    sectionA_WorksBOQ: boq,
    sectionB_MaterialSchedule: materialSchedule,
    sectionC_FixtureSchedule: fixtureSchedule,
    sectionD_CostSummary: budget,
    sectionE_LabourSchedule: labourSchedule || [],
    doorSchedule,
    windowSchedule,
    timeline,
    paymentPlan,
    procurement,
    recommendations,
    trace,
    parameterTable,
    catalogSnapshot,
  };
}
