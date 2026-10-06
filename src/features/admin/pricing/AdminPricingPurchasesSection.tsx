// ==============================================================================
// Hutty Admin Section: Purchases & Revenue Reporting (Pricing Model V1)
// Displays genuine verified customer purchases, historical amount snapshots,
// captured leads, and actual verified revenue in INR.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Tag,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { PricingPurchase, PricingMetrics } from '../../../types/pricing';
import { formatPaiseToINR } from '../../../config/pricing';
import { getApiUrl } from '../../../config/api';

export const AdminPricingPurchasesSection: React.FC = () => {
  const { token } = useAdminStore();
  const [purchases, setPurchases] = useState<PricingPurchase[]>([]);
  const [metrics, setMetrics] = useState<PricingMetrics>({
    totalPurchases: 0,
    paidPurchases: 0,
    pendingPurchases: 0,
    totalRevenuePaise: 0,
    totalRevenueINR: 0,
    tierCounts: {},
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [purchasesRes, metricsRes] = await Promise.all([
        fetch(getApiUrl('/admin/pricing/purchases'), { headers }),
        fetch(getApiUrl('/admin/pricing/metrics'), { headers }),
      ]);

      if (purchasesRes.ok) {
        const json = await purchasesRes.json();
        if (json.success && Array.isArray(json.data)) {
          setPurchases(json.data);
        }
      }
      if (metricsRes.ok) {
        const json = await metricsRes.json();
        if (json.success && json.data) {
          setMetrics(json.data);
        }
      }
    } catch {
      // In-memory fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (tierFilter !== 'ALL' && p.tierCodeSnapshot !== tierFilter) return false;
    if (!search.trim()) return true;

    const query = search.toLowerCase();
    return (
      p.publicReference?.toLowerCase().includes(query) ||
      p.leadName?.toLowerCase().includes(query) ||
      p.leadEmail?.toLowerCase().includes(query) ||
      p.leadPhone?.toLowerCase().includes(query) ||
      p.projectId?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* ── METRICS SUMMARY BANNER ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Verified Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#1B3D34] font-mono">
            ₹{metrics.totalRevenueINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {metrics.totalRevenuePaise} paise (From PAID purchases only)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Paid Purchases</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#1B3D34] font-mono">
            {metrics.paidPurchases}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Active customer orders granted
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#1B3D34] font-mono">
            {metrics.pendingPurchases}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Awaiting payment confirmation
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Total Initiated</span>
            <Tag className="w-4 h-4 text-[#F28C28]" />
          </div>
          <div className="text-2xl font-black text-[#1B3D34] font-mono">
            {metrics.totalPurchases}
          </div>
          <span className="text-[10px] text-slate-400 block">
            All customer checkout attempts
          </span>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
            {(['ALL', 'PAID', 'PENDING'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#1B3D34] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#1B3D34]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchPurchases}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh purchases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── PURCHASES TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No purchase records found</h4>
            <p className="text-xs text-slate-400">
              When users initiate or complete purchases for ₹99 or ₹499 tiers, their records and historical snapshots appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#4B5563] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Order Ref</th>
                  <th className="py-3 px-4 font-bold">Customer (Lead)</th>
                  <th className="py-3 px-4 font-bold">Plan Snapshot</th>
                  <th className="py-3 px-4 font-bold">Historical Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Gateway / Ref</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#1B3D34] whitespace-nowrap">
                      {p.publicReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#1B3D34] block">{p.leadName}</span>
                        <div className="flex items-center gap-2 text-[11px] text-[#4B5563]">
                          <span>{p.leadPhone}</span>
                          <span>&bull;</span>
                          <span>{p.leadEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono font-bold text-[#1B3D34] bg-slate-100 px-2 py-0.5 rounded">
                        {p.tierNameSnapshot}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1B3D34] whitespace-nowrap">
                      {formatPaiseToINR(p.amountMinorUnits)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {p.gatewayPaymentId || p.gatewayOrderId || 'Direct Grant'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
