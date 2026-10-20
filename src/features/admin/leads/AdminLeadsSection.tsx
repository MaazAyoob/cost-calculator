import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  X,
  MessageSquare,
  ShieldCheck,
  CheckSquare,
  Square,
  ChevronDown,
} from 'lucide-react';
import {
  fetchAdminLeads,
  updateAdminLeadStatus,
  downloadAdminLeadsExport,
  AdminLead,
  LeadFilters,
  LeadStatus,
  LeadSource,
} from '../../../services/adminLeadsApi';
import { useAdminStore } from '../../../store/useAdminStore';

export const AdminLeadsSection: React.FC = () => {
  const { token } = useAdminStore();

  // Filters State
  const [datePreset, setDatePreset] = useState<string>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);

  // Data & State
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });
  const [summary, setSummary] = useState({
    totalLeads: 0,
    phoneVerified: 0,
    unverified: 0,
    newEnquiries: 0,
  });
  const [activeDateRange, setActiveDateRange] = useState({
    label: 'Last 30 Days',
    startDate: '',
    endDate: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Selection state
  const [selectedLeadKeys, setSelectedLeadKeys] = useState<Set<string>>(new Set());

  // Detail Modal / Drawer state
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<AdminLead | null>(null);
  const [drawerStatus, setDrawerStatus] = useState<LeadStatus>('NEW');
  const [drawerNotes, setDrawerNotes] = useState<string>('');
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [exportScope, setExportScope] = useState<'all' | 'selected' | 'verified_only'>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Auto-clear success toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Construct active filter object
  const currentFilters = useMemo((): LeadFilters => {
    return {
      dateFilter: datePreset,
      startDate: datePreset === 'custom' ? customStart : undefined,
      endDate: datePreset === 'custom' ? customEnd : undefined,
      search: searchQuery.trim() || undefined,
      source: sourceFilter !== 'ALL' ? (sourceFilter as LeadSource) : undefined,
      phoneVerified: verificationFilter !== 'ALL' ? verificationFilter : undefined,
      status: statusFilter !== 'ALL' ? (statusFilter as LeadStatus) : undefined,
      sort: sortOrder,
      page,
      limit,
    };
  }, [datePreset, customStart, customEnd, searchQuery, sourceFilter, verificationFilter, statusFilter, sortOrder, page, limit]);

  // Fetch leads
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (datePreset === 'custom') {
        if (!customStart || !customEnd) {
          setIsLoading(false);
          return;
        }
        if (customStart > customEnd) {
          setError('Start date cannot be after end date.');
          setIsLoading(false);
          return;
        }
      }

      const data = await fetchAdminLeads(currentFilters, token);
      setLeads(data.leads);
      setPagination(data.pagination);
      setSummary(data.summary);
      setActiveDateRange(data.activeDateRange);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, datePreset, customStart, customEnd, token]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Handle Quick Date preset click
  const handleDatePresetClick = (preset: string) => {
    setDatePreset(preset);
    setPage(1);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setDatePreset('30d');
    setCustomStart('');
    setCustomEnd('');
    setSearchQuery('');
    setSourceFilter('ALL');
    setVerificationFilter('ALL');
    setStatusFilter('ALL');
    setSortOrder('newest');
    setPage(1);
    setSelectedLeadKeys(new Set());
  };

  // Row selection handlers
  const handleToggleSelectRow = (leadKey: string) => {
    setSelectedLeadKeys((prev) => {
      const next = new Set(prev);
      if (next.has(leadKey)) {
        next.delete(leadKey);
      } else {
        next.add(leadKey);
      }
      return next;
    });
  };

  const isAllCurrentPageSelected = useMemo(() => {
    if (leads.length === 0) return false;
    return leads.every((l) => selectedLeadKeys.has(l.leadKey));
  }, [leads, selectedLeadKeys]);

  const handleToggleSelectAllPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedLeadKeys((prev) => {
        const next = new Set(prev);
        leads.forEach((l) => next.delete(l.leadKey));
        return next;
      });
    } else {
      setSelectedLeadKeys((prev) => {
        const next = new Set(prev);
        leads.forEach((l) => next.add(l.leadKey));
        return next;
      });
    }
  };

  // Open detail view
  const handleOpenDetail = (lead: AdminLead) => {
    setSelectedLeadForDetail(lead);
    setDrawerStatus(lead.status);
    setDrawerNotes(lead.notes || '');
  };

  // Save status & notes from detail drawer
  const handleSaveStatus = async () => {
    if (!selectedLeadForDetail) return;
    setIsSavingStatus(true);
    try {
      await updateAdminLeadStatus(
        selectedLeadForDetail.leadKey,
        drawerStatus,
        drawerNotes,
        token
      );
      setSuccessToast(`Lead updated to ${drawerStatus}.`);

      // Update in local state
      setLeads((prev) =>
        prev.map((l) =>
          l.leadKey === selectedLeadForDetail.leadKey
            ? { ...l, status: drawerStatus, notes: drawerNotes }
            : l
        )
      );

      // Update detail modal
      setSelectedLeadForDetail((prev) =>
        prev ? { ...prev, status: drawerStatus, notes: drawerNotes } : null
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update lead');
    } finally {
      setIsSavingStatus(false);
    }
  };

  // Execute export download
  const handleExecuteExport = async () => {
    setIsExporting(true);
    try {
      const selectedIds = Array.from(selectedLeadKeys);
      const res = await downloadAdminLeadsExport(
        currentFilters,
        exportFormat,
        exportScope,
        exportScope === 'selected' ? selectedIds : undefined,
        token
      );
      setSuccessToast(`Export downloaded: ${res.filename}`);
      setShowExportModal(false);
    } catch (err: any) {
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            New
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Contacted
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Converted
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Closed
          </span>
        );
    }
  };

  // Source Badge Helper
  const renderSourceBadge = (source: LeadSource, label: string) => {
    switch (source) {
      case 'CONSULTATION_BOOKING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#1B3D34]/10 text-[#1B3D34] border border-[#1B3D34]/20">
            {label}
          </span>
        );
      case 'GENERAL_ENQUIRY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F28C28]/10 text-[#C96B16] border border-[#F28C28]/25">
            {label}
          </span>
        );
      case 'REPORT_PURCHASE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {label}
          </span>
        );
      case 'ACCOUNT_SIGNUP':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── SECTION HEADER & EXPORT ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#1B3D34] text-white">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Customer Leads & Enquiries
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Authoritative customer leads, phone verification intelligence, enquiries, and export engine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadLeads}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1B3D34]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#1B3D34] hover:bg-[#142e27] shadow-sm rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Leads</span>
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm font-medium text-red-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4 SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Filtered Leads</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            {summary.totalLeads}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {activeDateRange.label}
          </div>
        </div>

        {/* Phone Verified */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Phone Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-900">
            {summary.phoneVerified}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            {summary.totalLeads > 0
              ? `${Math.round((summary.phoneVerified / summary.totalLeads) * 100)}% verified rate`
              : '0% verified'}
          </div>
        </div>

        {/* Unverified */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Unverified Phone</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-900">
            {summary.unverified}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Requires direct follow-up
          </div>
        </div>

        {/* New Enquiries */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">New Enquiries</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-blue-900">
            {summary.newEnquiries}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Awaiting initial contact
          </div>
        </div>
      </div>

      {/* ── FILTERING CONTROLS CONTAINER ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Quick Date Presets Strip */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1B3D34]" />
            <span>Date Range Preset (Asia/Kolkata IST)</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'prev_month', label: 'Previous Month' },
              { id: 'custom', label: 'Custom Range' },
            ].map((p) => {
              const isActive = datePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDatePresetClick(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Pickers (if Custom Selected) */}
        {datePreset === 'custom' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Start Date:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#1B3D34] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">End Date:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#1B3D34] focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-500">
              Includes full 00:00:00 to 23:59:59 IST for selected dates
            </span>
          </div>
        )}

        {/* Search & Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone, email, reference..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAFBF9] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3D34]/20 focus:border-[#1B3D34]"
            />
          </div>

          {/* Source Dropdown */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FAFBF9] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3D34]/20 focus:border-[#1B3D34]"
            >
              <option value="ALL">All Lead Sources</option>
              <option value="CONSULTATION_BOOKING">Consultation Booking</option>
              <option value="GENERAL_ENQUIRY">General Enquiry</option>
              <option value="ACCOUNT_SIGNUP">Account Signup</option>
              <option value="REPORT_PURCHASE">Report Purchase</option>
            </select>
          </div>

          {/* Verification Dropdown */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FAFBF9] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3D34]/20 focus:border-[#1B3D34]"
            >
              <option value="ALL">All Phone Verification</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FAFBF9] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3D34]/20 focus:border-[#1B3D34]"
            >
              <option value="ALL">All Lead Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="CLOSED">Closed</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── SELECTION BAR (When Leads are Selected) ── */}
      {selectedLeadKeys.size > 0 && (
        <div className="bg-[#1B3D34] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#F28C28]" />
            <span className="font-bold">
              {selectedLeadKeys.size} {selectedLeadKeys.size === 1 ? 'lead' : 'leads'} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setExportScope('selected');
                setShowExportModal(true);
              }}
              className="px-3 py-1 bg-white text-[#1B3D34] font-bold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              Export Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedLeadKeys(new Set())}
              className="text-white/80 hover:text-white underline cursor-pointer text-xs"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* ── LEADS TABLE / LIST CONTAINER ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAllPage}
              className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#1B3D34] cursor-pointer"
            >
              {isAllCurrentPageSelected ? (
                <CheckSquare className="w-4 h-4 text-[#1B3D34]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select Page ({leads.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Toggle */}
            <div className="flex items-center gap-1">
              <span>Sort:</span>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="font-bold text-[#1B3D34] hover:underline cursor-pointer"
              >
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>

            {/* Page Size */}
            <div className="hidden sm:flex items-center gap-1">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-0.5 border border-slate-200 rounded-lg text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#1B3D34] animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading customer leads...</p>
          </div>
        ) : leads.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No customer leads found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No customer accounts, consultation enquiries, or report purchases match the active date range ({activeDateRange.label}) and filter criteria.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B3D34] bg-[#1B3D34]/10 hover:bg-[#1B3D34]/15 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Desktop & Tablet Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Lead Source</th>
                  <th className="py-3 px-4">Enquiry Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leads.map((lead) => {
                  const isSelected = selectedLeadKeys.has(lead.leadKey);
                  const createdDateObj = new Date(lead.createdAt);
                  const dateStr = createdDateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata',
                  });
                  const timeStr = createdDateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata',
                  });

                  return (
                    <tr
                      key={lead.leadKey}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(lead.leadKey)}
                          className="text-slate-400 hover:text-[#1B3D34] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#1B3D34]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-[11px] text-slate-500 hover:text-[#1B3D34] flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{lead.email}</span>
                          </a>
                        )}
                        {lead.reference && (
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                            Ref: {lead.reference}
                          </span>
                        )}
                      </td>

                      {/* Contact Phone & Verification Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-mono font-semibold text-slate-800 hover:text-[#1B3D34] hover:underline"
                            title="Click to call"
                          >
                            {lead.phoneFormatted || lead.phone}
                          </a>
                        </div>
                        <div className="mt-1">
                          {lead.phoneVerified ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Phone Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Not Verified
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Lead Source */}
                      <td className="py-3 px-4">
                        {renderSourceBadge(lead.source, lead.sourceLabel)}
                      </td>

                      {/* Enquiry Summary */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate text-slate-800" title={lead.enquiryDetails}>
                          {lead.enquiryDetails}
                        </div>
                        {lead.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5 flex items-center gap-1 truncate">
                            <MessageSquare className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>Notes: {lead.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* Lead Status */}
                      <td className="py-3 px-4">
                        {renderStatusBadge(lead.status)}
                      </td>

                      {/* Created Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{dateStr}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{timeStr}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#1B3D34] hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION CONTROLS ── */}
        {!isLoading && leads.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{pagination.total}</span> leads
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold text-slate-700 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── LEAD DETAIL MODAL / DRAWER ── */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#1B3D34]/10 text-[#1B3D34]">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold font-heading text-slate-900 text-base">
                    Lead Details: {selectedLeadForDetail.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {renderSourceBadge(selectedLeadForDetail.source, selectedLeadForDetail.sourceLabel)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Contact Phone
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedLeadForDetail.phone}`}
                      className="font-mono font-bold text-[#1B3D34] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedLeadForDetail.phoneFormatted || selectedLeadForDetail.phone}</span>
                    </a>
                  </div>
                  <div className="mt-1">
                    {selectedLeadForDetail.phoneVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Phone Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Not Verified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Email Address
                  </span>
                  {selectedLeadForDetail.email ? (
                    <a
                      href={`mailto:${selectedLeadForDetail.email}`}
                      className="font-semibold text-slate-800 hover:text-[#1B3D34] flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="break-all">{selectedLeadForDetail.email}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Creation Timestamp
                  </span>
                  <span className="text-slate-800 font-mono text-xs">
                    {new Date(selectedLeadForDetail.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })} (IST)
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Lead Reference ID
                  </span>
                  <span className="text-slate-800 font-mono text-xs font-bold">
                    {selectedLeadForDetail.reference || selectedLeadForDetail.leadKey}
                  </span>
                </div>
              </div>

              {/* Enquiry / Scope Description */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Enquiry & Requirements
                </span>
                <div className="p-3 bg-white border border-slate-200 rounded-xl leading-relaxed text-slate-800">
                  {selectedLeadForDetail.enquiryDetails}
                </div>
              </div>

              {/* Status Update Control */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Update Lead Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDrawerStatus(st)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        drawerStatus === st
                          ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Follow-Up Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Internal Follow-Up Notes
                </label>
                <textarea
                  rows={3}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="Record customer conversation, preferred consultation time, budget notes..."
                  className="w-full p-3 bg-[#FAFBF9] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3D34]/20 focus:border-[#1B3D34]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 sticky bottom-0">
              <button
                type="button"
                onClick={() => setSelectedLeadForDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isSavingStatus}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1B3D34] hover:bg-[#142e27] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSavingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT OPTIONS MODAL ── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#1B3D34]">
                <FileSpreadsheet className="w-5 h-5 text-[#F28C28]" />
                <h3 className="font-bold font-heading text-slate-900 text-base">Export Customer Leads</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Export Format Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  1. File Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('xlsx')}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold cursor-pointer transition-all ${
                      exportFormat === 'xlsx'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold cursor-pointer transition-all ${
                      exportFormat === 'csv'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Export Scope Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  2. Export Scope
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'all'}
                      onChange={() => setExportScope('all')}
                      className="text-[#1B3D34] focus:ring-[#1B3D34]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        All Leads Matching Active Filters ({summary.totalLeads})
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Applies current date range ({activeDateRange.label}) and active search filters.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      selectedLeadKeys.size === 0
                        ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                        : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      disabled={selectedLeadKeys.size === 0}
                      checked={exportScope === 'selected'}
                      onChange={() => setExportScope('selected')}
                      className="text-[#1B3D34] focus:ring-[#1B3D34]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Selected Leads Only ({selectedLeadKeys.size})
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Exports only the rows currently ticked in the leads table.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'verified_only'}
                      onChange={() => setExportScope('verified_only')}
                      className="text-[#1B3D34] focus:ring-[#1B3D34]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Phone-Verified Leads Only ({summary.phoneVerified})
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Excludes unverified leads from the exported spreadsheet.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                disabled={isExporting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1B3D34] hover:bg-[#142e27] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating File...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {exportFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
