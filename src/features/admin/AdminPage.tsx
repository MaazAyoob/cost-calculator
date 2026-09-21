import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAdminStore, AdminTab } from '../../store/useAdminStore';
import { rateService } from '../../calculation-engine/data/rateService';
import {
  RateMasterItem,
  TradeCategory,
  MarketPriceProposal,
} from '../../calculation-engine/data/rateMasterTypes';
import {
  Database,
  Activity,
  TrendingUp,
  Sliders,
  Search,
  RotateCcw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  Layers,
  Settings,
  X,
  Plus,
  Building,
  RefreshCw,
  Sparkles,
  Shield,
  Download,
  Calendar,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  KeyRound,
  UserCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Eye,
  Info,
  Cpu,
  History,
  Play,
  Compass,
  Wrench,
  Hammer,
  Paintbrush,
  Home,
  Percent,
  Zap,
  Coins,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/cn';
import { ParametersTab } from './tabs/ParametersTab';
import { SpaceRoomsTab } from './tabs/SpaceRoomsTab';
import { TradeParametersTab } from './tabs/TradeParametersTab';
import { CalculationRulesTab } from './tabs/CalculationRulesTab';
import { SimulationImpactTab } from './tabs/SimulationImpactTab';
import { VersionHistoryTab } from './tabs/VersionHistoryTab';
import { AdminOverviewSection } from './sections/AdminOverviewSection';
import { ProjectBuaSection } from './sections/ProjectBuaSection';
import { RoomsSpacesSection } from './sections/RoomsSpacesSection';
import { TradeSections } from './sections/TradeSections';
import { CalculationMethodsSection } from './sections/CalculationMethodsSection';
import { TestCalculatorSection } from './sections/TestCalculatorSection';

export const AdminPage: React.FC = () => {
  const {
    adminViewMode,
    setAdminViewMode,
    isAuthenticated,
    token,
    adminUser,
    login,
    logout,
    fetchData,
    rates,
    overrides,
    auditLogs,
    config,
    saveOverride,
    deleteOverride,
    updateConfig,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPackage,
    setSelectedPackage,
    selectedLocation,
    setSelectedLocation,
    overrideFilter,
    setOverrideFilter,
    isLoading,
    error,
    successMessage,
    authError,
    clearMessages,

    // Configuration Engine State
    configVersions,
    activeConfigVersion,
    draftParameters,
    simulationReport,
    configHealth,
    fetchConfigVersions,

    // Auto Price Updates
    proposals,
    priceRuns,
    priceProviders,
    isUpdatingPrices,
    selectedPriceCategory,
    setSelectedPriceCategory,
    selectedProviderId,
    setSelectedProviderId,
    fetchPriceUpdates,
    runPriceUpdate,
    approveProposal,
    rejectProposal,
    bulkApproveProposals,

    // Analytics
    analytics,
    analyticsFilter,
    analyticsStartDate,
    analyticsEndDate,
    isExportingAnalytics,
    fetchAnalytics,
    setAnalyticsFilter,
    exportAnalyticsCsv,

    // Account & Security
    adminProfile,
    adminSessions,
    securityAuditLogs,
    fetchAccountDetails,
    changePassword,
    changeEmail,
    revokeOtherSessions,
  } = useAdminStore();

  // Local login state
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('admin@hutty.in');

  // Edit Rate Override Modal State
  const [editingItem, setEditingItem] = useState<RateMasterItem | null>(null);
  const [editPackage, setEditPackage] = useState<string>('ALL');
  const [editLocation, setEditLocation] = useState<string>('ALL');
  const [editRate, setEditRate] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  // Edit Proposal Modal State
  const [editingProposal, setEditingProposal] = useState<MarketPriceProposal | null>(null);
  const [customProposedRate, setCustomProposedRate] = useState<number>(0);
  const [customProposalNotes, setCustomProposalNotes] = useState<string>('');

  // Config Form State
  const [configProfFees, setConfigProfFees] = useState(config.professionalFeesRate * 100);
  const [configMargin, setConfigMargin] = useState(config.contractorMarginRate * 100);
  const [configContingency, setConfigContingency] = useState(config.contingencyRate * 100);
  const [configGst, setConfigGst] = useState(config.gstRate * 100);
  const [configReason, setConfigReason] = useState('');

  // Proposal bulk selection
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);
  const [proposalFilterStatus, setProposalFilterStatus] = useState<string>('ALL');

  // Account Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountActionError, setAccountActionError] = useState<string | null>(null);
  const [accountActionSuccess, setAccountActionSuccess] = useState<string | null>(null);

  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  // Custom date range state for analytics
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Step performance sort
  const [stepSortBy, setStepSortBy] = useState<'dropOff' | 'time' | 'completion'>('dropOff');

  // Fetch initial data
  useEffect(() => {
    fetchData();
    fetchPriceUpdates();
    fetchAnalytics();
    fetchAccountDetails();
    fetchConfigVersions();
  }, [fetchData, fetchPriceUpdates, fetchAnalytics, fetchAccountDetails, fetchConfigVersions]);

  // Sync config form with state
  useEffect(() => {
    setConfigProfFees(Math.round(config.professionalFeesRate * 100));
    setConfigMargin(Math.round(config.contractorMarginRate * 100));
    setConfigContingency(Math.round(config.contingencyRate * 100));
    setConfigGst(Math.round(config.gstRate * 100));
  }, [config]);

  // Categories list
  const categories: (TradeCategory | 'ALL')[] = [
    'ALL',
    'Steel',
    'Cement',
    'Sand',
    'Aggregate',
    'Masonry',
    'Plaster',
    'Flooring',
    'Doors',
    'Windows',
    'Electrical wiring',
    'Plumbing',
    'Sanitaryware',
    'Paint',
    'Labour',
    'Markups',
  ];

  // Filtered rates list
  const filteredRates = useMemo(() => {
    return rates.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCat) return false;
      }

      const activeOverride = overrides.find(
        (o) =>
          o.rateId === item.id &&
          (selectedPackage === 'ALL' || o.packageTier === selectedPackage || o.packageTier === 'ALL') &&
          (selectedLocation === 'ALL' || o.location === selectedLocation || o.location === 'ALL')
      );

      if (overrideFilter === 'OVERRIDDEN' && !activeOverride) return false;
      if (overrideFilter === 'DEFAULT' && activeOverride) return false;

      return true;
    });
  }, [rates, overrides, selectedCategory, searchQuery, selectedPackage, selectedLocation, overrideFilter]);

  // Filtered proposals list
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (proposalFilterStatus !== 'ALL' && p.status !== proposalFilterStatus) return false;
      if (selectedPriceCategory !== 'ALL' && p.category.toLowerCase() !== selectedPriceCategory.toLowerCase()) return false;
      return true;
    });
  }, [proposals, proposalFilterStatus, selectedPriceCategory]);

  // Handlers
  const handleOpenEditModal = (item: RateMasterItem) => {
    setEditingItem(item);
    setEditPackage('ALL');
    setEditLocation('ALL');
    const existing = overrides.find((o) => o.rateId === item.id && o.packageTier === 'ALL' && o.location === 'ALL');
    setEditRate(existing ? existing.rate || existing.overrideRate || item.rate : item.rate);
    setEditReason(existing?.reason || '');
  };

  const handleSaveEditOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await saveOverride({
      rateId: editingItem.id,
      category: editingItem.category,
      unit: editingItem.unit,
      packageTier: editPackage,
      location: editLocation,
      overrideRate: editRate,
      reason: editReason.trim() || 'Manual rate override from Admin CMS',
      rateName: editingItem.name,
    });
    setEditingItem(null);
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig(
      {
        professionalFeesRate: configProfFees / 100,
        contractorMarginRate: configMargin / 100,
        contingencyRate: configContingency / 100,
        gstRate: configGst / 100,
      },
      configReason.trim() || 'Admin configuration update'
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginPassword, loginEmail);
  };

  const handleTriggerPriceRun = async () => {
    await runPriceUpdate(selectedProviderId, selectedPriceCategory === 'ALL' ? 'ALL' : 'CATEGORY', selectedPriceCategory);
  };

  const handleToggleSelectProposal = (id: string) => {
    setSelectedProposalIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllProposals = () => {
    const pendingIds = filteredProposals.filter((p) => p.status === 'PENDING' || p.status === 'NEEDS_REVIEW').map((p) => p.id);
    if (selectedProposalIds.length === pendingIds.length) {
      setSelectedProposalIds([]);
    } else {
      setSelectedProposalIds(pendingIds);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProposalIds.length === 0) return;
    await bulkApproveProposals(selectedProposalIds);
    setSelectedProposalIds([]);
  };

  const handleOpenEditProposalModal = (prop: MarketPriceProposal) => {
    setEditingProposal(prop);
    setCustomProposedRate(prop.proposedRate);
    setCustomProposalNotes(prop.notes || '');
  };

  const handleApplyCustomProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;
    await approveProposal(editingProposal.id, customProposedRate, customProposalNotes);
    setEditingProposal(null);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountActionError(null);
    setAccountActionSuccess(null);

    const res = await changePassword(currentPassword, newPassword, confirmPassword);
    if (res.success) {
      setAccountActionSuccess('Password changed successfully. All other active sessions have been signed out.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setAccountActionError(res.error || 'Failed to change password');
    }
  };

  const handleEmailChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountActionError(null);
    setAccountActionSuccess(null);

    const res = await changeEmail(emailCurrentPassword, newEmail, confirmEmail);
    if (res.success) {
      setAccountActionSuccess('Admin email changed successfully.');
      setEmailCurrentPassword('');
      setNewEmail('');
      setConfirmEmail('');
    } else {
      setAccountActionError(res.error || 'Failed to change email');
    }
  };

  // Login Gate
  if (!isAuthenticated && !token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Hutty Admin Access</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized personnel only. Authenticate to manage Rate Master, Auto Price Updates, and System Analytics.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Admin Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@hutty.in"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                required
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full py-2.5 bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl font-bold">
              Sign In to Admin Portal
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="pt-2 text-[11px] text-slate-400">
              Preview access: <span className="font-mono text-slate-600">Admin@123456</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sorted step performance list
  const sortedFunnelSteps = [...(analytics?.funnelSteps || [])].sort((a, b) => {
    if (stepSortBy === 'dropOff') return b.dropOffPercent - a.dropOffPercent;
    if (stepSortBy === 'time') return b.avgTimeSpentSec - a.avgTimeSpentSec;
    return b.conversionPercent - a.conversionPercent;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#1B3D34] pb-24">
      {/* ── HEADER & USER STATUS ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">Hutty Admin Panel</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Enterprise v2.6
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic Rate Master · Auto Price Updates · Product Analytics · Account Security
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800 block">{adminUser?.name || 'Hutty System Admin'}</span>
            <span className="text-[11px] font-mono text-slate-500 block">{adminUser?.email || 'admin@hutty.in'}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
            title="Sign out of Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── ALERTS / FEEDBACK ── */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearMessages} className="text-red-500 hover:text-red-800 font-bold">×</button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-500 hover:text-emerald-800 font-bold">×</button>
        </div>
      )}

      {/* ── PHASE 2E: 6 COLLAPSIBLE NAVIGATION GROUPS & GLOBAL SEARCH ── */}
      {(() => {
        // Search catalog
        const searchCatalog = [
          { label: 'Standard Wall Height', section: 'walls-masonry' as AdminTab, group: 'Construction' },
          { label: 'Masonry Block Type (AAC / Brick)', section: 'walls-masonry' as AdminTab, group: 'Construction' },
          { label: 'Ground Steel Factor (kg/sqft)', section: 'rcc-structure' as AdminTab, group: 'Construction' },
          { label: 'Cement Consumption (bags/sqft)', section: 'rcc-structure' as AdminTab, group: 'Construction' },
          { label: 'M-Sand & P-Sand Ratios', section: 'rcc-structure' as AdminTab, group: 'Construction' },
          { label: 'Flooring Tile Wastage %', section: 'flooring-tiles' as AdminTab, group: 'Construction' },
          { label: 'Bathroom Master & Dimensions', section: 'rooms-spaces' as AdminTab, group: 'Project' },
          { label: 'Interior Paint Coverage (45 vs 60 sqft/L)', section: 'paint-finishes' as AdminTab, group: 'Construction' },
          { label: 'Exterior Weatherproof Paint', section: 'paint-finishes' as AdminTab, group: 'Construction' },
          { label: 'Doors & Windows Master', section: 'doors-windows' as AdminTab, group: 'Construction' },
          { label: 'Electrical Wiring per Point', section: 'electrical' as AdminTab, group: 'Services' },
          { label: 'Plumbing Supply & Drainage', section: 'plumbing' as AdminTab, group: 'Services' },
          { label: 'Sanitaryware & Fixtures', section: 'fixtures-sanitary' as AdminTab, group: 'Services' },
          { label: 'Labour Rates Master', section: 'labour' as AdminTab, group: 'Pricing' },
          { label: 'Material Prices (Rate Master)', section: 'material-prices' as AdminTab, group: 'Pricing' },
          { label: 'Quality & Specification Tiers', section: 'quality-spec' as AdminTab, group: 'Pricing' },
          { label: 'Contractor Margin & GST Rate', section: 'commercial-tax' as AdminTab, group: 'Pricing' },
          { label: 'Calculation Methods Switcher', section: 'calculation-methods' as AdminTab, group: 'Calculator' },
          { label: 'Test Residential Calculator', section: 'test-calculator' as AdminTab, group: 'Calculator' },
          { label: 'Version History & Rollback', section: 'versions-history' as AdminTab, group: 'Management' },
        ];

        const searchResults = searchQuery.trim()
          ? searchCatalog.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
          : [];

        // 6 Collapsible Navigation Groups
        const navGroups: Array<{
          id: string;
          name: string;
          icon: React.ReactNode;
          sections: Array<{ id: AdminTab; label: string; badge?: number }>;
        }> = [
          {
            id: 'PROJECT',
            name: '1. Project',
            icon: <Building className="w-3.5 h-3.5" />,
            sections: [
              { id: 'project-bua', label: 'Project & BUA' },
              { id: 'rooms-spaces', label: 'Rooms & Spaces' },
            ],
          },
          {
            id: 'CONSTRUCTION',
            name: '2. Construction',
            icon: <Hammer className="w-3.5 h-3.5" />,
            sections: [
              { id: 'walls-masonry', label: 'Walls & Masonry' },
              { id: 'rcc-structure', label: 'RCC & Structure' },
              { id: 'flooring-tiles', label: 'Flooring & Tiles' },
              { id: 'waterproofing', label: 'Waterproofing' },
              { id: 'paint-finishes', label: 'Paint & Finishes' },
              { id: 'doors-windows', label: 'Doors & Windows' },
            ],
          },
          {
            id: 'SERVICES',
            name: '3. Services',
            icon: <Zap className="w-3.5 h-3.5" />,
            sections: [
              { id: 'electrical', label: 'Electrical' },
              { id: 'plumbing', label: 'Plumbing' },
              { id: 'fixtures-sanitary', label: 'Fixtures & Sanitary' },
            ],
          },
          {
            id: 'PRICING',
            name: '4. Pricing',
            icon: <Coins className="w-3.5 h-3.5" />,
            sections: [
              { id: 'labour', label: 'Labour' },
              { id: 'material-prices', label: 'Material Prices', badge: overrides.length || undefined },
              { id: 'quality-spec', label: 'Quality / Specification' },
              { id: 'commercial-tax', label: 'Commercial & Tax' },
            ],
          },
          {
            id: 'CALCULATOR',
            name: '5. Calculator',
            icon: <TrendingUp className="w-3.5 h-3.5" />,
            sections: [
              { id: 'calculation-methods', label: 'Calculation Methods' },
              { id: 'recommendations', label: 'Recommendations' },
              { id: 'test-calculator', label: 'Test Calculator' },
            ],
          },
          {
            id: 'REPORT_MGMT',
            name: '6. Report & Management',
            icon: <Shield className="w-3.5 h-3.5" />,
            sections: [
              { id: 'report-settings', label: 'Report Settings' },
              { id: 'versions-history', label: 'Versions & History' },
              { id: 'simulation', label: 'Simulation & Impact' },
              { id: 'audit', label: 'Audit Trail' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'account', label: 'Account & Security' },
            ],
          },
        ];

        // Find current active group
        const currentGroup = navGroups.find((g) => g.sections.some((s) => s.id === activeTab)) || navGroups[0];

        return (
          <div className="space-y-3">
            {/* Top Toolbar: Search + Basic/Advanced Toggle + Overview Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                {/* Basic / Advanced Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAdminViewMode('BASIC')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminViewMode === 'BASIC'
                        ? 'bg-white text-[#1B3D34] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminViewMode('ADVANCED')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminViewMode === 'ADVANCED'
                        ? 'bg-[#1B3D34] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 hidden lg:inline">
                  {adminViewMode === 'BASIC'
                    ? 'Everyday builder settings'
                    : 'Deep parameters & logic rules'}
                </span>
              </div>

              {/* Fast Search with Instant Jump */}
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find parameter (e.g. Wall Height, Margin)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3D34] focus:bg-white"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setActiveTab(r.section);
                          setSearchQuery('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-emerald-50/50 flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 group-hover:text-[#1B3D34]">{r.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                          {r.group}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 6 Collapsible Navigation Groups */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {navGroups.map((group) => {
                const isGroupActive = group.sections.some((s) => s.id === activeTab);
                return (
                  <div
                    key={group.id}
                    onClick={() => {
                      if (!isGroupActive) {
                        setActiveTab(group.sections[0].id);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isGroupActive
                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={isGroupActive ? 'text-[#1B3D34]' : 'text-slate-400'}>
                        {group.icon}
                      </span>
                      <span className={`text-xs font-bold truncate ${isGroupActive ? 'text-[#1B3D34]' : 'text-slate-700'}`}>
                        {group.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      {group.sections.length} sections
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Active Sub-Sections Bar */}
            {activeTab !== 'overview' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 shrink-0">
                  {currentGroup.name}:
                </span>
                {currentGroup.sections.map((sec) => {
                  const isSecActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveTab(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isSecActive
                          ? 'bg-[#1B3D34] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{sec.label}</span>
                      {sec.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSecActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 font-bold'
                        }`}>
                          {sec.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── SECTION 0: OVERVIEW ── */}
      {activeTab === 'overview' && <AdminOverviewSection onNavigate={setActiveTab} />}

      {/* ── TAB 2: RATE MASTER (MATERIAL PRICES) ── */}
      {(activeTab === 'rates' || activeTab === 'material-prices') && (
        <div className="space-y-6">
          {/* Header Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Authoritative Construction Rate Master</h2>
              <p className="text-xs text-slate-500">
                Directly controls monetary unit rates across Bengaluru &amp; Mysuru projects. Quantities remain invariant.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('price-update')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto Update Prices</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rate name or ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>

            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Packages (Global)</option>
              <option value="STANDARD">Standard</option>
              <option value="PREMIUM">Premium</option>
              <option value="LUXURY">Luxury</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              <option value="Bangalore">Bengaluru</option>
              <option value="Mysore">Mysuru</option>
            </select>

            <select
              value={overrideFilter}
              onChange={(e) => setOverrideFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer font-bold"
            >
              <option value="ALL">All Rates ({rates.length})</option>
              <option value="OVERRIDDEN">Active Overrides Only ({overrides.length})</option>
              <option value="DEFAULT">Baseline Defaults Only</option>
            </select>
          </div>

          {/* Rates Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Item &amp; ID</th>
                    <th className="p-3.5">Package</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5 text-right">Baseline Rate</th>
                    <th className="p-3.5 text-right">Effective Rate</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No rates found matching current search and filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRates.slice(0, 100).map((item) => {
                      const activeOverride = overrides.find(
                        (o) =>
                          o.rateId === item.id &&
                          (selectedPackage === 'ALL' || o.packageTier === selectedPackage || o.packageTier === 'ALL') &&
                          (selectedLocation === 'ALL' || o.location === selectedLocation || o.location === 'ALL')
                      );
                      const isOverridden = !!activeOverride;
                      const effRate = isOverridden
                        ? activeOverride.rate || activeOverride.overrideRate || item.rate
                        : item.rate;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-slate-800">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-600">{item.packageTier}</td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-600">{item.location}</td>
                          <td className="p-3.5 text-right font-mono text-slate-500">
                            ₹{item.rate.toLocaleString('en-IN')} <span className="text-[10px]">{item.unit}</span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                            <span className={isOverridden ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : ''}>
                              ₹{effRate.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {isOverridden ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Overridden
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-normal text-slate-500 bg-slate-100">
                                Default
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#1B3D34] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            {isOverridden && (
                              <button
                                type="button"
                                onClick={() => deleteOverride(item.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                title="Reset to baseline default"
                              >
                                Reset
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: AUTO PRICE UPDATE ── */}
      {activeTab === 'price-update' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900 font-heading">Automatic Market Price Proposals</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fetch live market benchmark quotes from providers. Proposals require explicit admin approval before modifying live calculator rates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTriggerPriceRun}
                  isLoading={isUpdatingPrices}
                  className="bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Fetch New Market Proposals</span>
                </Button>
              </div>
            </div>

            {/* Source & Scope Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Price Provider Source</label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer focus:outline-none"
                >
                  {priceProviders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isAiAssisted ? '(AI-Assisted)' : ''}
                    </option>
                  ))}
                </select>
                {selectedProviderId === 'ai_research' && (
                  <span className="text-[11px] text-amber-700 font-bold block mt-1">
                    ⚠️ AI-Assisted Proposal — Manual Verification Required. Not authoritative.
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Category Filter</label>
                <select
                  value={selectedPriceCategory}
                  onChange={(e) => setSelectedPriceCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === 'ALL' ? 'All Categories (All Rates)' : c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Proposal Status Filter</label>
                <select
                  value={proposalFilterStatus}
                  onChange={(e) => setProposalFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer focus:outline-none font-bold"
                >
                  <option value="ALL">All Proposals ({proposals.length})</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="NEEDS_REVIEW">Needs Review / Warnings</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="UNVERIFIED">Unverified / Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Strip */}
          {selectedProposalIds.length > 0 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>{selectedProposalIds.length} proposals selected for batch review</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProposalIds([])}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Clear Selection
                </button>
                <Button
                  onClick={handleBulkApprove}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs"
                >
                  Approve Selected ({selectedProposalIds.length})
                </Button>
              </div>
            </div>
          )}

          {/* Proposals Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-3 text-center w-10">
                      <button
                        type="button"
                        onClick={handleSelectAllProposals}
                        className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {selectedProposalIds.length > 0 ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="p-3">Category &amp; Item</th>
                    <th className="p-3 text-right">Current Rate</th>
                    <th className="p-3 text-right">Proposed Rate</th>
                    <th className="p-3 text-right">Difference</th>
                    <th className="p-3">Source &amp; Reference</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400">
                        No proposals found. Click <span className="font-bold text-slate-700">Fetch New Market Proposals</span> to query providers.
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((prop) => {
                      const isSelected = selectedProposalIds.includes(prop.id);
                      const isApproved = prop.status === 'APPROVED';
                      const isRejected = prop.status === 'REJECTED';
                      const isPositive = prop.difference > 0;

                      return (
                        <tr
                          key={prop.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isApproved || isRejected}
                              onChange={() => handleToggleSelectProposal(prop.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{prop.rateName}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-400">{prop.rateId}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {prop.category}
                              </span>
                              {prop.isAiAssisted && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                  AI-Assisted
                                </span>
                              )}
                            </div>
                            {prop.warning && (
                              <div className="mt-1 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>{prop.warning}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            ₹{prop.currentRate.toLocaleString('en-IN')}
                            <span className="text-[10px] block">{prop.unit}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            ₹{prop.proposedRate.toLocaleString('en-IN')}
                            <span className="text-[10px] text-slate-500 block">{prop.unit}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold">
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded ${
                                prop.difference === 0
                                  ? 'text-slate-600 bg-slate-100'
                                  : isPositive
                                  ? 'text-amber-800 bg-amber-50'
                                  : 'text-emerald-800 bg-emerald-50'
                              }`}
                            >
                              {prop.difference === 0 ? (
                                '0.0%'
                              ) : isPositive ? (
                                <>
                                  <ArrowUpRight className="w-3 h-3" />
                                  +₹{Math.abs(prop.difference).toLocaleString('en-IN')} (+{prop.differencePercent.toFixed(1)}%)
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight className="w-3 h-3" />
                                  -₹{Math.abs(prop.difference).toLocaleString('en-IN')} ({prop.differencePercent.toFixed(1)}%)
                                </>
                              )}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800 truncate max-w-xs">{prop.source}</div>
                            {prop.sourceUrl && (
                              <a
                                href={prop.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span>View Source Ref</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                prop.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : prop.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : prop.status === 'NEEDS_REVIEW'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : prop.status === 'UNVERIFIED'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {prop.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            {!isApproved && !isRejected && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveProposal(prop.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProposalModal(prop)}
                                  className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                  title="Edit rate before applying"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectProposal(prop.id)}
                                  className="px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <span className="text-[11px] font-mono text-emerald-700">✓ Live Override Active</span>
                            )}
                            {isRejected && (
                              <span className="text-[11px] font-mono text-slate-400">Rejected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CALCULATOR CONFIG ── */}
      {activeTab === 'config' && (
        <Card className="max-w-3xl mx-auto border-slate-200 rounded-3xl shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Calculator Coefficients &amp; Markups</h2>
              <p className="text-xs text-slate-500">
                Modify global wastage allowances, contractor margins, and professional fee percentages.
              </p>
            </div>

            <form onSubmit={handleConfigSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contractor Margin (%)</label>
                  <input
                    type="number"
                    value={configMargin}
                    onChange={(e) => setConfigMargin(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="40"
                    step="0.5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Professional Fees Rate (%)</label>
                  <input
                    type="number"
                    value={configProfFees}
                    onChange={(e) => setConfigProfFees(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="20"
                    step="0.5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contingency Allowance (%)</label>
                  <input
                    type="number"
                    value={configContingency}
                    onChange={(e) => setConfigContingency(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="20"
                    step="0.5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    value={configGst}
                    onChange={(e) => setConfigGst(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="28"
                    step="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Update (Audit Trail)</label>
                <input
                  type="text"
                  value={configReason}
                  onChange={(e) => setConfigReason(e.target.value)}
                  placeholder="e.g., Q3 2026 contractor baseline rate review"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" isLoading={isLoading} className="bg-[#1B3D34] hover:bg-[#142E27] text-white px-6 py-2 rounded-xl font-bold">
                  Save Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 5: PACKAGE STANDARDS ── */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Hutty 3-Tier Construction Standards</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard, Premium, and Luxury baseline specification matrices for Karnataka urban residential construction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: 'STANDARD',
                title: 'Standard Package',
                desc: 'Economical, structurally robust specification designed for dependable urban residential builds.',
                costPerSqFt: '₹1,950',
                specs: [
                  'Steel: Indus Fe 500D TMT',
                  'Cement: Coromandel Super Power',
                  'Masonry: 8" Solid Concrete Blocks',
                  'Flooring: 2x2 Vitrified Double Charged',
                  'Doors: Solid Flush Doors with Teak Frame',
                  'Paint: Asian Tractor Emulsion',
                ],
              },
              {
                tier: 'PREMIUM',
                title: 'Premium Package',
                desc: 'Balanced high-performance home specification with superior acoustic, thermal, and aesthetic finishes.',
                costPerSqFt: '₹2,450',
                specs: [
                  'Steel: JSW Neosteel / Fe 550D',
                  'Cement: UltraTech Super Weather Plus',
                  'Masonry: 8" High-Density Blocks',
                  'Flooring: 4x2 Glazed Vitrified Tiles (GVT)',
                  'Doors: Teak Wood Main Door, Honne Frames',
                  'Paint: Asian Apcolite Premium Emulsion',
                ],
              },
              {
                tier: 'LUXURY',
                title: 'Luxury Package',
                desc: 'Architectural grade luxury residence with bespoke joinery, Italian marble, and premium MEP fittings.',
                costPerSqFt: '₹3,400',
                specs: [
                  'Steel: Tata Tiscon 550D Super Ductile',
                  'Cement: UltraTech / Birla Super 53-Grade',
                  'Masonry: Precision Wire-Cut Clay Bricks / AAC',
                  'Flooring: Imported Italian Marble / Large Slabs',
                  'Doors: Burma Teak Handcrafted Joinery',
                  'Paint: Asian Paints Royale Luxury Emulsion',
                ],
              },
            ].map((p) => (
              <div key={p.tier} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {p.tier}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800">{p.costPerSqFt}/sq.ft</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Baseline Takeoff Specs:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {p.specs.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header & Date Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">Calculator Product Analytics</h2>
                <p className="text-xs text-slate-500">
                  Aggregated, anonymous user funnel metrics, step timing, and package decisions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={exportAnalyticsCsv}
                  isLoading={isExportingAnalytics}
                  className="px-4 py-2 bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Analytics (CSV)</span>
                </Button>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: '90d', label: '90 Days' },
                  { id: 'custom', label: 'Custom' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAnalyticsFilter(f.id as any, customStart, customEnd)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      analyticsFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {analyticsFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setAnalyticsFilter('custom', customStart, customEnd)}
                    className="px-3 py-1 bg-[#1B3D34] text-white font-bold rounded-lg text-xs"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Calculator Sessions</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">{analytics?.totalSessions || 0}</div>
              <span className="text-[10px] text-slate-500">100% anonymous tracking</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Completion Rate</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-700">{analytics?.completionRate || 0}%</div>
              <span className="text-[10px] text-slate-500">{analytics?.abandonmentRate || 0}% abandonment</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Average Duration</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {Math.round((analytics?.avgDurationSec || 180) / 60)}m {((analytics?.avgDurationSec || 180) % 60)}s
              </div>
              <span className="text-[10px] text-slate-500">per full calculator journey</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Top Abandonment Step</span>
              <div className="text-base font-bold text-amber-700 truncate">{analytics?.highestDropOffStep || 'Plot Dimensions'}</div>
              <span className="text-[10px] text-slate-500">primary funnel drop point</span>
            </div>
          </div>

          {/* ── 14-STEP VISUAL FUNNEL ── */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">14-Step Calculator Progression Funnel</h3>
                <p className="text-xs text-slate-500">Tracks user transition from initial onboarding to final calculation completion.</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Sort table by:</span>
                {(['dropOff', 'time', 'completion'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStepSortBy(s)}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                      stepSortBy === s ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {s === 'dropOff' ? 'Highest Drop-off' : s === 'time' ? 'Longest Time' : 'Completion'}
                  </button>
                ))}
              </div>
            </div>

            {/* Step Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">Step Name</th>
                    <th className="p-3 text-right">Users Reached</th>
                    <th className="p-3 text-right">Conversion %</th>
                    <th className="p-3 text-right">Drop-off %</th>
                    <th className="p-3 text-right">Avg Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedFunnelSteps.map((step) => (
                    <tr key={step.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{step.stepIndex}</td>
                      <td className="p-3 font-bold text-slate-900">{step.name}</td>
                      <td className="p-3 text-right font-mono text-slate-700">{step.usersReached}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold">{step.conversionPercent}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${step.conversionPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                          step.dropOffPercent > 20 ? 'bg-red-50 text-red-700' : 'text-slate-500'
                        }`}>
                          {step.dropOffPercent > 0 ? `-${step.dropOffPercent}%` : '0%'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">{step.avgTimeSpentSec}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Activity & Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Line Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Activity Over Time (Sessions &amp; Completions)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.activityTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#1B3D34" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="completions" name="Completions" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Estimated Cost Distribution Histogram */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Project Cost Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.costDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Estimates" fill="#1B3D34" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Package & Location Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Package Selection Breakdown</span>
              <div className="space-y-2">
                {[
                  { name: 'Standard', pct: analytics?.packagePercentages.STANDARD ?? 25, color: 'bg-blue-600' },
                  { name: 'Premium', pct: analytics?.packagePercentages.PREMIUM ?? 55, color: 'bg-emerald-600' },
                  { name: 'Luxury', pct: analytics?.packagePercentages.LUXURY ?? 20, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{item.name}</span>
                      <span className="font-mono">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Location Distribution</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Bengaluru Metropolitan</span>
                  <span className="font-mono">{analytics?.locationCounts.Bangalore || 34}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Mysuru &amp; Mandya</span>
                  <span className="font-mono">{analytics?.locationCounts.Mysore || 11}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Device Distribution</span>
              <div className="flex items-center justify-around pt-2">
                <div className="text-center">
                  <Monitor className="w-6 h-6 text-slate-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-900 block mt-1">Desktop</span>
                  <span className="text-[11px] font-mono text-slate-500">{analytics?.deviceDistribution.desktop || 32} sessions</span>
                </div>
                <div className="text-center">
                  <Smartphone className="w-6 h-6 text-slate-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-900 block mt-1">Mobile</span>
                  <span className="text-[11px] font-mono text-slate-500">{analytics?.deviceDistribution.mobile || 13} sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: AUDIT TRAIL ── */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Complete Rate Modification Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every manual override and approved automated price update is permanently recorded.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Item &amp; Category</th>
                    <th className="p-3.5 text-right">Old Value</th>
                    <th className="p-3.5 text-right">New Value</th>
                    <th className="p-3.5">Admin Email</th>
                    <th className="p-3.5">Reason / Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              log.action === 'AUTO_PRICE_APPROVED'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : log.action === 'CREATE_OVERRIDE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'REMOVE_OVERRIDE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{log.rateName}</div>
                          <div className="font-mono text-[10px] text-slate-400">{log.rateId}</div>
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-400">
                          {log.oldValue !== null && log.oldValue !== undefined ? `₹${log.oldValue}` : '—'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          ₹{log.newValue}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">{log.adminEmail}</td>
                        <td className="p-3.5 text-slate-600 max-w-sm truncate" title={log.reason}>
                          {log.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: ACCOUNT & SECURITY ── */}
      {activeTab === 'account' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                  {(adminProfile?.name || adminUser?.name || 'A').charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{adminProfile?.name || adminUser?.name || 'Hutty System Admin'}</h2>
                  <span className="text-xs text-slate-500 font-mono">{adminProfile?.email || adminUser?.email || 'admin@hutty.in'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {adminProfile?.role || adminUser?.role || 'ADMIN'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Role Managed by Superadmin</span>
              </div>
            </div>
          </div>

          {accountActionSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              {accountActionSuccess}
            </div>
          )}
          {accountActionError && (
            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
              {accountActionError}
            </div>
          )}

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-4 h-4 text-[#1B3D34]" />
              <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, mixed case, special"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 block">Security Policy:</span>
                <p>• Minimum 8 characters with uppercase, lowercase, digit, and special symbol.</p>
                <p>• Changing your password immediately invalidates all other active sessions.</p>
              </div>

              <div className="pt-1 flex justify-end">
                <Button type="submit" isLoading={isLoading} className="bg-[#1B3D34] hover:bg-[#142E27] text-white px-5 py-2 rounded-xl font-bold">
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Change Email Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-[#1B3D34]" />
              <h3 className="text-sm font-bold text-slate-900">Change Admin Email</h3>
            </div>

            <form onSubmit={handleEmailChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password (Required for Verification)</label>
                <input
                  type="password"
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Admin Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newadmin@hutty.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confirm New Email</label>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="newadmin@hutty.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <Button type="submit" isLoading={isLoading} className="bg-[#1B3D34] hover:bg-[#142E27] text-white px-5 py-2 rounded-xl font-bold">
                  Update Admin Email
                </Button>
              </div>
            </form>
          </div>

          {/* Active Sessions & Session Security */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B3D34]" />
                <h3 className="text-sm font-bold text-slate-900">Active Admin Sessions</h3>
              </div>
              <button
                type="button"
                onClick={revokeOtherSessions}
                className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
              >
                Sign out of all other sessions
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {adminSessions.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{s.device}</span>
                      {s.isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {s.browser} · IP: {s.ipAddress}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{s.lastActive}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Audit Events */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Security Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {securityAuditLogs.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-[11px] text-slate-400">{new Date(ev.createdAt).toLocaleString()}</td>
                      <td className="p-2.5 font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-mono">
                          {ev.action}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{ev.userEmail}</td>
                      <td className="p-2.5 text-slate-500 max-w-xs truncate">
                        {typeof ev.details === 'object' ? JSON.stringify(ev.details) : ev.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 2E SECTIONS ROUTER ── */}
      {/* 1. Project */}
      {(activeTab === 'project-bua' || activeTab === 'authority') && <ProjectBuaSection />}
      {(activeTab === 'rooms-spaces' || activeTab === 'space-rooms') && <RoomsSpacesSection />}

      {/* 2. Construction */}
      {(activeTab === 'walls-masonry' || activeTab === 'masonry') && <TradeSections sectionId="walls-masonry" />}
      {(activeTab === 'rcc-structure' || activeTab === 'structure-rcc') && <TradeSections sectionId="rcc-structure" />}
      {(activeTab === 'flooring-tiles' || activeTab === 'flooring') && <TradeParametersTab forcedTab="flooring" />}
      {activeTab === 'waterproofing' && <TradeParametersTab forcedTab="waterproofing" />}
      {(activeTab === 'paint-finishes' || activeTab === 'paint') && <TradeSections sectionId="paint-finishes" />}
      {activeTab === 'doors-windows' && <TradeParametersTab forcedTab="doors-windows" />}

      {/* 3. Services */}
      {activeTab === 'electrical' && <TradeParametersTab forcedTab="electrical" />}
      {activeTab === 'plumbing' && <TradeParametersTab forcedTab="plumbing" />}
      {(activeTab === 'fixtures-sanitary' || activeTab === 'fixtures') && <TradeParametersTab forcedTab="fixtures" />}

      {/* 4. Pricing */}
      {activeTab === 'labour' && <TradeParametersTab forcedTab="labour" />}
      {activeTab === 'quality-spec' && <TradeParametersTab forcedTab="recommendations" />}
      {(activeTab === 'commercial-tax' || activeTab === 'commercial') && <TradeSections sectionId="commercial-tax" />}

      {/* 5. Calculator */}
      {(activeTab === 'calculation-methods' || activeTab === 'calculation-rules' || activeTab === 'calculation-engine') && <CalculationMethodsSection />}
      {activeTab === 'recommendations' && <TradeParametersTab forcedTab="recommendations" />}
      {activeTab === 'test-calculator' && <TestCalculatorSection />}

      {/* 6. Report & Management */}
      {activeTab === 'report-settings' && <TradeParametersTab forcedTab="recommendations" />}
      {(activeTab === 'versions-history' || activeTab === 'versions') && <VersionHistoryTab />}
      {activeTab === 'simulation' && <SimulationImpactTab />}

      {/* Legacy fallbacks */}
      {activeTab === 'parameters' && <ParametersTab />}

      {/* ── MODAL: EDIT RATE OVERRIDE ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Set Rate Override</h3>
                <span className="text-[11px] font-mono text-slate-400">{editingItem.id}</span>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOverride} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Name</label>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-800 font-medium">{editingItem.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Package Tier</label>
                  <select
                    value={editPackage}
                    onChange={(e) => setEditPackage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ALL">ALL (Global)</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="LUXURY">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ALL">ALL Locations</option>
                    <option value="Bangalore">Bengaluru</option>
                    <option value="Mysore">Mysuru</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Override Rate ({editingItem.unit})
                </label>
                <input
                  type="number"
                  value={editRate}
                  onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm font-bold"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">Baseline Rate: ₹{editingItem.rate}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Reason / Justification</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g., Q3 supplier price adjustment"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isLoading} className="bg-[#1B3D34] text-white px-5 py-2 rounded-xl font-bold">
                  Save Override
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PROPOSAL BEFORE APPROVING ── */}
      {editingProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Edit Proposal Before Approving</h3>
                <span className="text-[11px] font-mono text-slate-400">{editingProposal.rateId}</span>
              </div>
              <button onClick={() => setEditingProposal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomProposal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Name</label>
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium">{editingProposal.rateName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Rate</label>
                  <div className="p-2.5 bg-slate-50 rounded-xl font-mono text-slate-500">
                    ₹{editingProposal.currentRate} {editingProposal.unit}
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Provider Proposed</label>
                  <div className="p-2.5 bg-slate-50 rounded-xl font-mono text-slate-700">
                    ₹{editingProposal.proposedRate} {editingProposal.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Approved Rate ({editingProposal.unit})
                </label>
                <input
                  type="number"
                  value={customProposedRate}
                  onChange={(e) => setCustomProposedRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm font-bold text-emerald-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Notes</label>
                <input
                  type="text"
                  value={customProposalNotes}
                  onChange={(e) => setCustomProposalNotes(e.target.value)}
                  placeholder="e.g., Negotiated supplier quote with Bengaluru depot"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProposal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isLoading} className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl font-bold">
                  Approve with Custom Rate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
