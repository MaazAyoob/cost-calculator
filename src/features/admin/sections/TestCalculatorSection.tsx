// ============================================================
// ADMIN CONTROL CENTER — IN-ADMIN TEST CALCULATOR SECTION
// Interactive sandbox executing canonical runCalculator() with
// Active vs Draft comparison and Quantity vs Price transparency
// ============================================================

import React, { useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Coins,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../../../utils/cn';

export const TestCalculatorSection: React.FC = () => {
  const {
    testInputs,
    setTestInputs,
    testCalculationActive,
    testCalculationDraft,
    isCalculatingTest,
    runTestCalculator,
    draftParameters
  } = useAdminStore();

  const changedDraftCount = Object.keys(draftParameters).length;

  // Run initial test calculation on mount if not yet executed
  useEffect(() => {
    if (!testCalculationActive && !isCalculatingTest) {
      runTestCalculator();
    }
  }, []);

  const activeCost = testCalculationActive?.budget?.totalProjectCost || 0;
  const draftCost = testCalculationDraft?.budget?.totalProjectCost || activeCost;
  const costDelta = draftCost - activeCost;
  const costPct = activeCost > 0 ? (costDelta / activeCost) * 100 : 0;

  // Material & quantity comparisons
  const activeQty = testCalculationActive?.quantities;
  const draftQty = testCalculationDraft?.quantities;

  const activeSteel = activeQty?.steelTonnes || 0;
  const draftSteel = draftQty?.steelTonnes || 0;

  const activeCement = activeQty?.cementBags || 0;
  const draftCement = draftQty?.cementBags || 0;

  const activeSand = (activeQty?.mSandCuFt || 0) + (activeQty?.pSandCuFt || 0);
  const draftSand = (draftQty?.mSandCuFt || 0) + (draftQty?.pSandCuFt || 0);

  const activeAgg = activeQty?.coarseAggregateCuFt || 0;
  const draftAgg = draftQty?.coarseAggregateCuFt || 0;

  const activeBlocks = activeQty?.masonryUnitsCount || 0;
  const draftBlocks = draftQty?.masonryUnitsCount || 0;

  const activeTiles = (activeQty?.floorTilesSqFt || 0) + (activeQty?.wallTilesSqFt || 0);
  const draftTiles = (draftQty?.floorTilesSqFt || 0) + (draftQty?.wallTilesSqFt || 0);

  const activePaint = (activeQty?.interiorPaintLitres || 0) + (activeQty?.exteriorPaintLitres || 0);
  const draftPaint = (draftQty?.interiorPaintLitres || 0) + (draftQty?.exteriorPaintLitres || 0);

  const activeElecPoints = activeQty?.totalElectricalPoints || 0;
  const draftElecPoints = draftQty?.totalElectricalPoints || 0;

  const activePlumbPoints = (activeQty?.totalWaterPoints || 0) + (activeQty?.totalDrainagePoints || 0);
  const draftPlumbPoints = (draftQty?.totalWaterPoints || 0) + (draftQty?.totalDrainagePoints || 0);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold mb-1">
            <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
            <span>Calculator: Interactive Test Sandbox</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Test Residential Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test residential assumptions against the production calculation engine with Active vs Draft comparison.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => runTestCalculator()}
            disabled={isCalculatingTest}
            className="px-5 py-2.5 bg-[#F28C28] hover:bg-[#D9771A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isCalculatingTest ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Calculate & Compare</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── INPUT BENCHMARK CONFIGURATION ── */}
      <Card className="border border-slate-200 bg-white rounded-2xl">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Test Project Parameters
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Runs Canonical Production Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {/* BUA */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Built-Up Area</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="50"
                  min="500"
                  max="20000"
                  value={testInputs.bua}
                  onChange={(e) => setTestInputs({ bua: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                />
                <span className="text-[11px] text-slate-400">sqft</span>
              </div>
            </div>

            {/* Floors */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Floors</label>
              <select
                value={testInputs.floors}
                onChange={(e) => setTestInputs({ floors: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
              >
                <option value="1">Ground Only (G)</option>
                <option value="2">G + 1 (2 Floors)</option>
                <option value="3">G + 2 (3 Floors)</option>
                <option value="4">G + 3 (4 Floors)</option>
                <option value="5">G + 4 (5 Floors)</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Bedrooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={testInputs.bedrooms}
                onChange={(e) => setTestInputs({ bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
              />
            </div>

            {/* Bathrooms */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Bathrooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={testInputs.bathrooms}
                onChange={(e) => setTestInputs({ bathrooms: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
              />
            </div>

            {/* Specification Tier */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Specification</label>
              <select
                value={testInputs.tier}
                onChange={(e) => setTestInputs({ tier: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
              >
                <option value="Essential">Standard / Essential</option>
                <option value="Premium">Premium Quality</option>
                <option value="Luxury">Luxury Standard</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── COMPARISON SUMMARY CARDS (ACTIVE vs DRAFT) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Cost */}
        <Card className="border border-slate-200 bg-white rounded-2xl">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Current Active Total</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Production
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 pt-1">
              {formatCurrency(activeCost)}
            </p>
            <p className="text-xs text-slate-500">
              ₹{testCalculationActive?.budget?.costPerSqFt || 0} / sq.ft
            </p>
          </CardContent>
        </Card>

        {/* Draft Cost */}
        <Card className={`border rounded-2xl ${changedDraftCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Draft Simulated Total</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {changedDraftCount > 0 ? `${changedDraftCount} Changes` : 'No Draft Changes'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 pt-1">
              {formatCurrency(draftCost)}
            </p>
            <p className="text-xs text-slate-500">
              ₹{testCalculationDraft?.budget?.costPerSqFt || testCalculationActive?.budget?.costPerSqFt || 0} / sq.ft
            </p>
          </CardContent>
        </Card>

        {/* Difference Delta */}
        <Card className="border border-slate-200 bg-white rounded-2xl">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Impact Difference</span>
            <div className="flex items-center gap-2 pt-1">
              <p className={`text-2xl font-bold ${
                costDelta > 0 ? 'text-amber-700' : costDelta < 0 ? 'text-emerald-700' : 'text-slate-700'
              }`}>
                {costDelta > 0 ? `+${formatCurrency(costDelta)}` : formatCurrency(costDelta)}
              </p>
              {costDelta !== 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  costDelta > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {costDelta > 0 ? `+${costPct.toFixed(1)}%` : `${costPct.toFixed(1)}%`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {costDelta === 0 ? 'Draft matches active configuration' : 'Net project impact'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── QUANTITY VS PRICE TRANSPARENCY TABLE (Section 7) ── */}
      <Card className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Quantity vs. Price Transparency Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Distinguishes physical material quantity adjustments from financial rate updates.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Rate Changes Preserve Quantities</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Trade Item</th>
                <th className="py-2.5 px-4 text-right">Active Quantity</th>
                <th className="py-2.5 px-4 text-right">Draft Quantity</th>
                <th className="py-2.5 px-4 text-center">Qty Change?</th>
                <th className="py-2.5 px-4 text-right">Active Cost</th>
                <th className="py-2.5 px-4 text-right">Draft Cost</th>
                <th className="py-2.5 px-4 text-right">Cost Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Steel */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">TMT Steel (Fe 550D)</td>
                <td className="py-3 px-4 text-right font-mono">{activeSteel.toFixed(2)} Tonnes</td>
                <td className="py-3 px-4 text-right font-mono">{draftSteel.toFixed(2)} Tonnes</td>
                <td className="py-3 px-4 text-center">
                  {draftSteel !== activeSteel ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency((activeQty?.steelKg || 0) * 74)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency((draftQty?.steelKg || 0) * 74)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(((draftQty?.steelKg || 0) - (activeQty?.steelKg || 0)) * 74)}
                </td>
              </tr>

              {/* Cement */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Structural Cement (53G)</td>
                <td className="py-3 px-4 text-right font-mono">{activeCement} Bags</td>
                <td className="py-3 px-4 text-right font-mono">{draftCement} Bags</td>
                <td className="py-3 px-4 text-center">
                  {draftCement !== activeCement ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(activeCement * 400)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(draftCement * 400)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency((draftCement - activeCement) * 400)}
                </td>
              </tr>

              {/* Sand */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">M-Sand & P-Sand</td>
                <td className="py-3 px-4 text-right font-mono">{activeSand} CFT</td>
                <td className="py-3 px-4 text-right font-mono">{draftSand} CFT</td>
                <td className="py-3 px-4 text-center">
                  {draftSand !== activeSand ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(activeSand * 60)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(draftSand * 60)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency((draftSand - activeSand) * 60)}
                </td>
              </tr>

              {/* Aggregates */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Crushed Granite Aggregate</td>
                <td className="py-3 px-4 text-right font-mono">{activeAgg} CFT</td>
                <td className="py-3 px-4 text-right font-mono">{draftAgg} CFT</td>
                <td className="py-3 px-4 text-center">
                  {draftAgg !== activeAgg ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(activeAgg * 40)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(draftAgg * 40)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency((draftAgg - activeAgg) * 40)}
                </td>
              </tr>

              {/* Masonry Blocks */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Masonry Blockwork</td>
                <td className="py-3 px-4 text-right font-mono">{activeBlocks} Blocks</td>
                <td className="py-3 px-4 text-right font-mono">{draftBlocks} Blocks</td>
                <td className="py-3 px-4 text-center">
                  {draftBlocks !== activeBlocks ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(testCalculationActive?.quantities?.masonryAmount || 0)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(testCalculationDraft?.quantities?.masonryAmount || 0)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(
                    (testCalculationDraft?.quantities?.masonryAmount || 0) -
                    (testCalculationActive?.quantities?.masonryAmount || 0)
                  )}
                </td>
              </tr>

              {/* Flooring Tiles */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Flooring & Wall Tiles</td>
                <td className="py-3 px-4 text-right font-mono">{Math.round(activeTiles)} sq.ft</td>
                <td className="py-3 px-4 text-right font-mono">{Math.round(draftTiles)} sq.ft</td>
                <td className="py-3 px-4 text-center">
                  {Math.round(draftTiles) !== Math.round(activeTiles) ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(Math.round(activeTiles) * 85)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(Math.round(draftTiles) * 85)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency((Math.round(draftTiles) - Math.round(activeTiles)) * 85)}
                </td>
              </tr>

              {/* Paint */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Interior & Exterior Paint</td>
                <td className="py-3 px-4 text-right font-mono">{Math.round(activePaint)} Litres</td>
                <td className="py-3 px-4 text-right font-mono">{Math.round(draftPaint)} Litres</td>
                <td className="py-3 px-4 text-center">
                  {Math.round(draftPaint) !== Math.round(activePaint) ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      Quantity Changed
                    </span>
                  ) : (
                    <span className="text-slate-400">No Change</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(Math.round(activePaint) * 380)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(Math.round(draftPaint) * 380)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency((Math.round(draftPaint) - Math.round(activePaint)) * 380)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
