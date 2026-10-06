// ==============================================================================
// Hutty Admin Section: Products & Pricing Tiers (Pricing Model V1)
// Authoritative price configuration, feature matrix mapping, and audit logging.
// Enforces Complete Package safety: cannot be purchasable without price > 0.
// Consultation (₹1,499) is strictly decoupled and governed separately.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Plus,
  ShieldCheck,
  Clock,
  Save,
  X,
  History,
  Info,
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { PricingTier, PricingAuditLog, PricingFeatureCode } from '../../../types/pricing';
import { DEFAULT_PRICING_TIERS, FEATURE_METADATA, formatPaiseToINR } from '../../../config/pricing';
import { getApiUrl } from '../../../config/api';

export const AdminPricingTiersSection: React.FC = () => {
  const { token } = useAdminStore();
  const [tiers, setTiers] = useState<PricingTier[]>(DEFAULT_PRICING_TIERS);
  const [auditLogs, setAuditLogs] = useState<PricingAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriceINR, setEditPriceINR] = useState<number>(0);
  const [editActive, setEditActive] = useState(true);
  const [editPurchasable, setEditPurchasable] = useState(false);
  const [editBadge, setEditBadge] = useState('');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editReason, setEditReason] = useState('');

  const fetchTiersAndLogs = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [tiersRes, logsRes] = await Promise.all([
        fetch(getApiUrl('/admin/pricing/tiers'), { headers }),
        fetch(getApiUrl('/admin/pricing/audit-logs'), { headers }),
      ]);

      if (tiersRes.ok) {
        const json = await tiersRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTiers(json.data);
        }
      }
      if (logsRes.ok) {
        const json = await logsRes.json();
        if (json.success && Array.isArray(json.data)) {
          setAuditLogs(json.data);
        }
      }
    } catch {
      // In-memory local fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiersAndLogs();
  }, []);

  const openEditModal = (tier: PricingTier) => {
    setEditingTier(tier);
    setEditName(tier.name);
    setEditDescription(tier.description);
    setEditPriceINR(Math.floor(tier.priceMinorUnits / 100));
    setEditActive(tier.active);
    setEditPurchasable(tier.purchasable);
    setEditBadge(tier.badge || '');
    setEditFeatures([...tier.features]);
    setEditReason('');
    setErrorMessage(null);
  };

  const handleFeatureToggle = (featureCode: string) => {
    if (editFeatures.includes(featureCode)) {
      setEditFeatures(editFeatures.filter((f) => f !== featureCode));
    } else {
      setEditFeatures([...editFeatures, featureCode]);
    }
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation: Price must be non-negative integer
    if (isNaN(editPriceINR) || editPriceINR < 0 || !Number.isInteger(editPriceINR)) {
      setErrorMessage('Price must be a valid non-negative integer in Indian Rupees (INR).');
      return;
    }

    // COMPLETE PACKAGE SAFETY RULE:
    // Complete package cannot become purchasable unless a final price > 0 is configured.
    if (editingTier.code === 'COMPLETE_PACKAGE' && editPurchasable) {
      if (editPriceINR <= 0) {
        setErrorMessage(
          'Complete Package Safety: The Complete Package cannot be made purchasable until a final price (greater than ₹0) is explicitly entered.'
        );
        return;
      }
    }

    const priceMinorUnits = editPriceINR * 100;

    const payload = {
      name: editName.trim(),
      description: editDescription.trim(),
      priceMinorUnits,
      active: editActive,
      purchasable: editPurchasable,
      badge: editBadge.trim() || null,
      features: editFeatures,
      reason: editReason.trim() || 'Admin pricing update',
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getApiUrl(`/admin/pricing/tiers/${editingTier.id}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update pricing tier');
      }

      setSuccessMessage(`Pricing tier "${editName}" updated successfully.`);
      setEditingTier(null);
      await fetchTiersAndLogs();
    } catch (err: any) {
      // Local optimistic update fallback for offline dev/test
      setTiers((prev) =>
        prev.map((t) =>
          t.id === editingTier.id
            ? {
                ...t,
                name: payload.name,
                description: payload.description,
                priceMinorUnits: payload.priceMinorUnits,
                active: payload.active,
                purchasable: payload.purchasable,
                badge: payload.badge,
                features: payload.features,
              }
            : t
        )
      );
      setSuccessMessage(`Pricing tier "${editName}" updated locally.`);
      setEditingTier(null);
    }
  };

  const allFeatureCodes = Object.keys(FEATURE_METADATA) as PricingFeatureCode[];

  return (
    <div className="space-y-8 text-left select-none">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
              PRICING &bull; COMMERCIAL ACCESS LAYER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading mt-1">
            Product Pricing Tiers &amp; Entitlement Matrix
          </h2>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Configure commercial access levels, server-authoritative prices, feature entitlements, and Complete Package activation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[#4B5563]">Active Tiers: </span>
            <span className="font-bold text-[#1B3D34]">
              {tiers.filter((t) => t.active).length} / {tiers.length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[#4B5563]">Purchasable: </span>
            <span className="font-bold text-[#1B3D34]">
              {tiers.filter((t) => t.purchasable).length}
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── TIERS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-2xs relative ${
              tier.code === 'COMPLETE_PACKAGE' && !tier.purchasable
                ? 'border-dashed border-slate-300 bg-slate-50/50'
                : 'border-slate-200'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4B5563] bg-slate-100 px-2 py-0.5 rounded">
                  {tier.code}
                </span>
                {tier.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#F28C28] bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                    {tier.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#1B3D34] font-heading">
                  {tier.name}
                </h3>
                <p className="text-[11px] text-[#4B5563] mt-1 line-clamp-2">
                  {tier.description}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Server Price</span>
                  <span className="text-lg font-black text-[#1B3D34] font-mono">
                    {tier.code === 'COMPLETE_PACKAGE' && tier.priceMinorUnits === 0
                      ? 'Unset (Coming Soon)'
                      : formatPaiseToINR(tier.priceMinorUnits)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Minor Units</span>
                  <span className="text-xs font-mono font-bold text-[#4B5563]">
                    {tier.priceMinorUnits} paise
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      tier.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tier.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Purchasable:</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      tier.purchasable ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tier.purchasable ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Features Granted:</span>
                  <span className="font-bold text-[#1B3D34]">{tier.features.length}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openEditModal(tier)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#1B3D34] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Configure Tier</span>
            </button>
          </div>
        ))}
      </div>

      {/* ── PRICE AUDIT LOG TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-[#F28C28]" />
          <h3 className="text-sm font-extrabold text-[#1B3D34] font-heading">
            Pricing Configuration Audit Trail ({auditLogs.length})
          </h3>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No price modification events logged yet. Important price modifications are recorded here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#4B5563] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Timestamp</th>
                  <th className="py-2.5 px-3 font-bold">Tier</th>
                  <th className="py-2.5 px-3 font-bold">Action</th>
                  <th className="py-2.5 px-3 font-bold">Old Price</th>
                  <th className="py-2.5 px-3 font-bold">New Price</th>
                  <th className="py-2.5 px-3 font-bold">Actor</th>
                  <th className="py-2.5 px-3 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1B3D34]">
                      {log.tierCode || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {log.oldValue?.priceMinorUnits !== undefined
                        ? formatPaiseToINR(log.oldValue.priceMinorUnits)
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1B3D34]">
                      {log.newValue?.priceMinorUnits !== undefined
                        ? formatPaiseToINR(log.newValue.priceMinorUnits)
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.actorEmail}</td>
                    <td className="py-2.5 px-3 text-slate-500">{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── EDIT TIER MODAL ── */}
      {editingTier && (
        <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#F28C28]">
                  CONFIGURE COMMERCIAL TIER &bull; {editingTier.code}
                </span>
                <h3 className="text-lg font-extrabold text-[#1B3D34] font-heading">
                  Edit {editingTier.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTier(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tier Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white border-slate-200 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, Recommended, Coming Soon"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description</label>
                <textarea
                  rows={2}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                />
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-[#1B3D34] block">Authoritative Price (INR ₹)</label>
                    <span className="text-[10px] text-slate-500">
                      Converted to integer minor units paise on save ({editPriceINR * 100} paise)
                    </span>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      required
                      value={editPriceINR}
                      onChange={(e) => setEditPriceINR(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border rounded-xl bg-white border-slate-300 font-mono font-bold text-right text-sm"
                    />
                  </div>
                </div>

                {editingTier.code === 'COMPLETE_PACKAGE' && (
                  <div className="text-[11px] text-amber-800 bg-white p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Complete Package Governance:</strong> This tier remains unpurchasable until a final price (&gt; ₹0) and final deliverable package are finalized by business management.
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="w-4 h-4 text-[#1B3D34] rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Active Status</span>
                    <span className="text-[10px] text-slate-500">Visible to public users</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPurchasable}
                    onChange={(e) => setEditPurchasable(e.target.checked)}
                    className="w-4 h-4 text-[#1B3D34] rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Purchasable Status</span>
                    <span className="text-[10px] text-slate-500">Allowed in checkout</span>
                  </div>
                </label>
              </div>

              {/* ── FEATURE MATRIX CHECKBOX LIST ── */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 block">
                    Feature Entitlements ({editFeatures.length} unlocked)
                  </span>
                  <span className="text-[10px] text-slate-400">Map tier deliverables</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {allFeatureCodes.map((feat) => {
                    const isChecked = editFeatures.includes(feat);
                    const meta = FEATURE_METADATA[feat];
                    return (
                      <label
                        key={feat}
                        onClick={() => handleFeatureToggle(feat)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isChecked
                            ? 'border-[#1B3D34] bg-[rgba(27,61,52,0.04)]'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-[#1B3D34] mt-0.5 rounded"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-[11px] text-[#1B3D34] block truncate">
                            {meta?.name || feat}
                          </span>
                          <span className="text-[10px] text-[#4B5563] line-clamp-1">
                            {meta?.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-700 block">Reason for Update (Audit trail)</label>
                <input
                  type="text"
                  placeholder="e.g. Adjusted price tier for launch / updated feature entitlement"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hutty-btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>Save Tier Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
