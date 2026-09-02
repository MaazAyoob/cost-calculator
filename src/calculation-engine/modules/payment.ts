import { EngineInput, BudgetResult, TimelineResult, PaymentMilestone, PaymentPlanSummary } from '../types';

interface MilestoneDef {
  stage: number;
  title: string;
  description: string;
  percentage: number;
  bankDisbursement: boolean;
}

const MILESTONE_DEFS: MilestoneDef[] = [
  { stage: 1,  title: 'Booking & Agreement',     description: 'Initial commitment, site survey, design approval and agreement signing.',        percentage: 5,  bankDisbursement: false },
  { stage: 2,  title: 'Foundation Completion',   description: 'All footing pits dug, PCC bed poured, column footings and pedestals cast.',      percentage: 12, bankDisbursement: true  },
  { stage: 3,  title: 'Plinth Level',            description: 'Plinth beams cast, earth backfilled and compacted, DPC layer complete.',         percentage: 10, bankDisbursement: true  },
  { stage: 4,  title: 'Ground Floor Slab',       description: 'Ground floor columns cast, roof slab shuttering and M25 RMC pour complete.',     percentage: 15, bankDisbursement: true  },
  { stage: 5,  title: 'First Floor Structure',   description: 'First floor columns, beams and slab completed with 21-day curing.',             percentage: 12, bankDisbursement: true  },
  { stage: 6,  title: 'Roof Slab Completion',    description: 'Top floor slab cast and cured. Full structural frame standing.',                 percentage: 10, bankDisbursement: true  },
  { stage: 7,  title: 'Brick & Plaster Done',    description: 'All masonry walls erected, chicken mesh applied, double coat plaster complete.',  percentage: 10, bankDisbursement: true  },
  { stage: 8,  title: 'MEP Roughing Done',       description: 'Concealed electrical conduit, plumbing pipe layout and hydro testing complete.',  percentage: 8,  bankDisbursement: false },
  { stage: 9,  title: 'Flooring & Painting',     description: 'Vitrified tiles laid, granite steps installed, painting primer + finish coats.', percentage: 8,  bankDisbursement: false },
  { stage: 10, title: 'Fixtures & Finishes',     description: 'CP fittings, sanitary ware, modular switches, lights, doors and windows fixed.', percentage: 7,  bankDisbursement: false },
  { stage: 11, title: 'Final Handover',          description: 'Deep cleaning, snag list clearance, OC certificate and key handover.',           percentage: 3,  bankDisbursement: false },
];

function addMonths(dateStr: string, months: number): string {
  const parts = dateStr.split(' ');
  const d = new Date(`${parts[0]} 1, ${parts[1]}`);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function calculatePaymentPlan(
  input: EngineInput,
  budget: BudgetResult,
  timeline: TimelineResult
): PaymentMilestone[] {
  const total = budget.totalProjectCost;
  const start = timeline.constructionStartDate;

  // Cumulative percentages map to milestone timing
  const timingMonths = [0, 1.5, 3, 5, 7, 9, 11, 13, 14, 15.5, timeline.totalMonths];

  let currentSum = 0;

  const milestones: PaymentMilestone[] = MILESTONE_DEFS.map((m, idx) => {
    let amount = Math.round(total * m.percentage / 100);
    
    // Adjust last milestone to absorb any ±1 rounding difference
    if (idx === MILESTONE_DEFS.length - 1) {
      amount = total - currentSum;
    } else {
      currentSum += amount;
    }

    const targetDate = addMonths(start, timingMonths[idx] ?? timingMonths[timingMonths.length - 1]);

    const status: 'Completed' | 'Due' | 'Upcoming' =
      idx === 0 ? 'Completed' : idx === 1 ? 'Due' : 'Upcoming';

    return {
      stage: m.stage,
      title: m.title,
      description: m.description,
      percentage: m.percentage,
      amount,
      targetDate,
      status,
      bankDisbursement: m.bankDisbursement,
    };
  });

  return milestones;
}

export function getPaymentPlanSummary(
  milestones: PaymentMilestone[],
  totalProjectCost: number
): PaymentPlanSummary {
  const totalAllocatedPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
  const totalAllocatedAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const unallocatedPercentage = Math.max(0, 100 - totalAllocatedPercentage);
  const unallocatedAmount = Math.max(0, totalProjectCost - totalAllocatedAmount);
  const isComplete = Math.abs(totalAllocatedPercentage - 100) < 0.01 && Math.abs(totalAllocatedAmount - totalProjectCost) <= 1;

  return {
    isComplete,
    totalAllocatedPercentage: parseFloat(totalAllocatedPercentage.toFixed(1)),
    unallocatedPercentage: parseFloat(unallocatedPercentage.toFixed(1)),
    totalAllocatedAmount,
    unallocatedAmount,
    scheduleType: isComplete ? 'Complete' : 'Early-Stage',
  };
}
