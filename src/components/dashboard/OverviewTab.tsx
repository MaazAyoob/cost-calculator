import React from 'react';
import { motion } from 'framer-motion';
import { containerStaggerVariant, itemFadeUpVariant } from '../../animations/variants';
import { useProjectStore } from '../../store/useProjectStore';
import { useCalculationStore } from '../../store/useCalculationStore';
import { CONSTRUCTION_STAGES } from '../../constants/constructionStages';
import { MetricCard } from './MetricCard';
import { ChartContainer } from '../charts/ChartContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ProgressIndicator } from '../common/ProgressIndicator';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency } from '../../utils/cn';
import {
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Layers,
  Droplet,
  Zap,
  TrendingUp,
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { project } = useProjectStore();
  const { result } = useCalculationStore();
  const { budget, area, quantities, timeline, paymentPlan, input } = result;

  const completedStages = CONSTRUCTION_STAGES.filter((s) => s.status === 'Completed').length;
  const inProgressStages = CONSTRUCTION_STAGES.filter((s) => s.status === 'In Progress').length;
  const overallProgress = Math.round((completedStages / 13) * 100);

  const chartData = budget.heads.map((h) => ({
    name: h.name,
    value: h.allocatedAmount,
  }));

  const stageTimelineColors: Record<string, string> = {
    Completed: 'bg-emerald-500',
    'In Progress': 'bg-blue-500',
    Pending: 'bg-slate-200',
  };

  const stageStatusColor: Record<string, 'success' | 'warning' | 'neutral'> = {
    Completed: 'success',
    'In Progress': 'warning',
    Pending: 'neutral',
  };

  return (
    <motion.div
      variants={containerStaggerVariant}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-6 space-y-6"
    >
      {/* ── Metric Cards Grid ── */}
      <motion.div variants={itemFadeUpVariant} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Est. Cost"
          value={budget.totalProjectCost}
          isCurrency
          icon={<DollarSign className="w-4 h-4" />}
          colorScheme="blue"
          trend={{ value: 'IS Code Calc', isPositive: true }}
        />
        <MetricCard
          title="Built-up Area"
          value={area.totalBUASqFt}
          unit="Sq Ft"
          icon={<Building2 className="w-4 h-4" />}
          colorScheme="emerald"
          subtitle={`Plot: ${area.plotAreaSqFt} Sq Ft`}
        />
        <MetricCard
          title="Steel Quantity"
          value={quantities.steelTonnes}
          unit="Tonnes"
          icon={<Layers className="w-4 h-4" />}
          colorScheme="slate"
          badge={input.materialBrands.steel ? input.materialBrands.steel.split(' ')[0] : 'TMT Steel'}
        />
        <MetricCard
          title="Cement Bags"
          value={quantities.cementBags}
          unit="Bags"
          icon={<TrendingUp className="w-4 h-4" />}
          colorScheme="amber"
          badge={input.materialBrands.cement ? input.materialBrands.cement.split(' ')[0] : 'PPC Cement'}
        />
      </motion.div>

      <motion.div variants={itemFadeUpVariant} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Build Timeline"
          value={timeline.totalMonths}
          unit="Months"
          icon={<Calendar className="w-4 h-4" />}
          colorScheme="indigo"
          subtitle={`${timeline.constructionStartDate} - ${timeline.estimatedHandoverDate}`}
        />
        <MetricCard
          title="Plumbing Pipe"
          value={quantities.cpvcSupplyMetres + quantities.swrDrainMetres}
          unit="Metres"
          icon={<Droplet className="w-4 h-4" />}
          colorScheme="blue"
          subtitle="CPVC + SWR total"
        />
        <MetricCard
          title="Electrical Wire"
          value={quantities.electricalWireMetres}
          unit="Metres"
          icon={<Zap className="w-4 h-4" />}
          colorScheme="amber"
          badge="FRLS Copper"
        />
        <MetricCard
          title="Cost per Sq Ft"
          value={budget.costPerSqFt}
          unit="₹ / Sq Ft"
          icon={<ShieldCheck className="w-4 h-4" />}
          colorScheme="emerald"
          badge={input.qualityTier}
        />
      </motion.div>

      {/* ── Charts + Stage Timeline Row ── */}
      <motion.div variants={itemFadeUpVariant} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer type="donut" data={chartData} height={240} />
            <div className="mt-4 space-y-2">
              {budget.heads.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{cat.percentage}%</span>
                    <span className="font-bold text-slate-900">{formatCurrency(cat.allocatedAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stage Timeline Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Construction Stage Progress</CardTitle>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{completedStages} Done</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />{inProgressStages} Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" />{13 - completedStages - inProgressStages} Pending</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {/* Overall progress bar */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-blue-800">Overall Construction Progress</span>
                <span className="text-xs font-extrabold text-blue-600">{overallProgress}%</span>
              </div>
              <ProgressIndicator value={overallProgress} color="bg-blue-600" size="sm" />
            </div>

            {CONSTRUCTION_STAGES.slice(0, 8).map((stage) => (
              <div key={stage.id} className="flex items-center gap-3 text-xs">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {stage.number}
                </span>
                <span className="text-slate-700 font-medium flex-1 truncate">{stage.title}</span>
                <ProgressIndicator
                  value={stage.progress}
                  color={stageTimelineColors[stage.status]}
                  size="sm"
                />
                <StatusBadge
                  status={stageStatusColor[stage.status]}
                  label={stage.status === 'In Progress' ? 'Active' : stage.status}
                />
              </div>
            ))}
            <p className="text-[11px] text-slate-400 pt-2 font-medium">
              + {13 - 8} more stages pending execution...
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Payment Milestone Summary ── */}
      <motion.div variants={itemFadeUpVariant}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Milestone Summary</CardTitle>
              <span className="text-xs font-bold text-slate-500">
                Total: {formatCurrency(budget.totalProjectCost)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paymentPlan.map((m) => (
                <div
                  key={m.stage}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    m.status === 'Completed'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : m.status === 'Due'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">Stage {m.stage}</span>
                    <StatusBadge
                      status={
                        m.status === 'Completed'
                          ? 'success'
                          : m.status === 'Due'
                          ? 'warning'
                          : 'neutral'
                      }
                      label={m.status}
                    />
                  </div>
                  <div className="font-bold text-slate-900">{m.title}</div>
                  <div className="text-slate-500 leading-relaxed">{m.description}</div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">{m.percentage}% release</span>
                    <span className="font-extrabold text-blue-600">{formatCurrency(m.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
