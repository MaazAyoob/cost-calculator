// ==============================================================================
// Hutty Customer Account Dashboard
// Clean, accessible portal for homeowners: My Projects, My Reports,
// Verified Payments, Consultation History, and Profile Settings.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderKanban,
  FileText,
  CreditCard,
  Calendar,
  User as UserIcon,
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Layers,
  MapPin,
  ExternalLink,
  LogOut,
  RefreshCw,
  X,
  FileCheck,
} from 'lucide-react';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { useWizardStore } from '../../store/useWizardStore';
import { useProjectStore } from '../../store/useProjectStore';
import {
  fetchUserProjects,
  renameProject,
  deleteProject,
  PersistedProject,
  setCachedProjectId,
} from '../../services/projectApi';
import {
  fetchAccountOverview,
  fetchAccountPurchases,
  fetchAccountReports,
  fetchAccountConsultations,
  CustomerOrder,
  CustomerReport,
  CustomerConsultation,
} from '../../services/accountApi';
import { formatNumber } from '../../utils/cn';

type DashboardTab = 'projects' | 'reports' | 'purchases' | 'consultations' | 'profile';

export const AccountDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') as DashboardTab) || 'projects';
  const [activeTab, setActiveTab] = useState<DashboardTab>(tabParam);

  const { user, logout, updateProfile } = useCustomerAuthStore();

  // State data
  const [projects, setProjects] = useState<PersistedProject[]>([]);
  const [purchases, setPurchases] = useState<CustomerOrder[]>([]);
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [consultations, setConsultations] = useState<CustomerConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & form state
  const [renamingProject, setRenamingProject] = useState<PersistedProject | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [deletingProject, setDeletingProject] = useState<PersistedProject | null>(null);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  // Human-readable status mapping helpers
  const formatProjectStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'ACTIVE':
      case 'SAVED':
        return 'Saved & Ready';
      case 'DRAFT':
      case 'IN_PROGRESS':
      default:
        return 'In Progress';
    }
  };

  const formatPaymentStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'Paid';
      case 'PENDING':
        return 'Payment pending';
      case 'FAILED':
        return 'Payment unsuccessful';
      default:
        return 'Action required';
    }
  };

  const formatConsultationStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'Confirmed Appointment';
      case 'ASSIGNED':
        return 'Expert Assigned';
      case 'PENDING':
      case 'REQUESTED':
      default:
        return 'Enquiry Awaiting Assignment';
    }
  };

  // Keep URL tab in sync
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Load account data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [projList, ordersList, reportsList, consultList] = await Promise.all([
        fetchUserProjects().catch(() => []),
        fetchAccountPurchases().catch(() => []),
        fetchAccountReports().catch(() => []),
        fetchAccountConsultations().catch(() => []),
      ]);

      setProjects(projList);
      setPurchases(ordersList);
      setReports(reportsList);
      setConsultations(consultList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Handle Opening / Continuing a Project in Calculator
  const handleContinueProject = (project: PersistedProject) => {
    setCachedProjectId(project.id);
    useProjectStore.getState().updateProjectDetails({ name: project.name });

    const cfg = project.configuration;
    if (cfg) {
      useWizardStore.setState({
        city: (project.city as any) || 'Bangalore',
        authority: (project.authority as any) || 'BBMP/BDA',
        plotLength: cfg.plotLength || 30,
        plotWidth: cfg.plotWidth || 40,
        floors: cfg.floors || 2,
        houseType: cfg.houseType || 'Duplex',
        parkingType: cfg.parkingType || 'Normal Ground',
        carCount: cfg.carCount || 1,
        bikeCount: cfg.bikeCount || 2,
        evCharging: Boolean(cfg.evCharging),
        liftRequired: Boolean(cfg.liftRequired),
        rooms: cfg.roomsJson || {},
        qualityTier: cfg.qualityTier || 'Premium',
        materialBrands: cfg.materialBrands || {},
        hasStartedSelection: true,
      });
    }

    navigate('/calculator');
  };

  // Handle Creating a New Project
  const handleStartNewProject = () => {
    try {
      sessionStorage.removeItem('hutty_persisted_project_id');
    } catch {}
    useWizardStore.getState().startNewProject();
    navigate('/calculator');
  };

  // Handle Renaming
  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingProject || !newProjectName.trim()) return;

    try {
      await renameProject(renamingProject.id, newProjectName.trim());
      setProjects((prev) =>
        prev.map((p) => (p.id === renamingProject.id ? { ...p, name: newProjectName.trim() } : p))
      );
      setRenamingProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to rename project');
    }
  };

  // Handle Deleting
  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    try {
      await deleteProject(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setDeletingProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    const success = await updateProfile(profileName, profilePhone);
    if (success) {
      setProfileStatus('Profile updated successfully!');
      setTimeout(() => setProfileStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1B3D34] pt-8 pb-16 px-4 sm:px-6 lg:px-8 selection:bg-[#1B3D34] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TOP PROFILE BANNER                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-[#E2E8E3] p-5 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] font-black text-lg sm:text-xl shadow-2xs shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'H'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#1B3D34] tracking-tight font-heading min-w-0 break-words">
                  Welcome back, {user?.name || 'Homeowner'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF3EF] text-[#1B3D34] border border-[#D5E5DC] shrink-0">
                  Verified Account
                </span>
              </div>
              <p className="text-xs text-[#52605B] mt-0.5 font-medium truncate">
                Your home projects and reports, all in one place. &bull; {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleStartNewProject}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-xs py-3 px-5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#F28C28]" />
              <span>Start a New Project</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center justify-center p-3 rounded-xl border border-[#D7DFD9] text-[#52605B] hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TABS NAVIGATION                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E2E8E3]">
          <button
            type="button"
            onClick={() => handleTabChange('projects')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-[#F28C28] text-[#1B3D34]'
                : 'border-transparent text-[#687770] hover:text-[#1B3D34]'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>My Projects ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('reports')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-[#F28C28] text-[#1B3D34]'
                : 'border-transparent text-[#687770] hover:text-[#1B3D34]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Reports ({reports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('purchases')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'purchases'
                ? 'border-[#F28C28] text-[#1B3D34]'
                : 'border-transparent text-[#687770] hover:text-[#1B3D34]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('consultations')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-[#F28C28] text-[#1B3D34]'
                : 'border-transparent text-[#687770] hover:text-[#1B3D34]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Consultations ({consultations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#F28C28] text-[#1B3D34]'
                : 'border-transparent text-[#687770] hover:text-[#1B3D34]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile &amp; Settings</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: MY PROJECTS                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E2E8E3] p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#EBF3EF] border border-[#D5E5DC] flex items-center justify-center text-[#1B3D34] mx-auto shadow-2xs">
                  <Building2 className="w-8 h-8 text-[#1B3D34]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1B3D34] font-heading">
                    Your home project starts here.
                  </h3>
                  <p className="text-xs text-[#52605B] mt-1 max-w-xs mx-auto leading-relaxed">
                    Create your first project to explore the cost, save your choices and return whenever you're ready.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartNewProject}
                  className="inline-flex items-center gap-2 bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#F28C28]" />
                  <span>Start a New Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                {projects.map((proj) => {
                  const cfg = proj.configuration;
                  const calc = proj.calculation;
                  const bua = calc?.totalBUASqFt || 0;
                  const totalCost = calc?.totalCostINR || 0;
                  const dims = cfg ? `${cfg.plotLength}' × ${cfg.plotWidth}'` : 'Custom';
                  const floors = cfg?.floors ? `G+${cfg.floors - 1}` : 'G+2';

                  return (
                    <div
                      key={proj.id}
                      className="bg-white rounded-2xl border border-[#E2E8E3] p-5 shadow-xs flex flex-col justify-between hover:border-[#1B3D34]/40 transition-all duration-200 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-[#1B3D34] truncate" title={proj.name}>
                              {proj.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[#687770] mt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#F28C28]" />
                                {proj.city || 'Bangalore'}
                              </span>
                              <span>&bull;</span>
                              <span>{floors}</span>
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF5F1] text-[#1B3D34] border border-[#D5E1D8] uppercase tracking-wider shrink-0">
                            {formatProjectStatus(proj.status)}
                          </span>
                        </div>

                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF2EE]">
                          <div>
                            <span className="text-[10px] font-semibold text-[#687770] block leading-tight">
                              Plot Dimensions
                            </span>
                            <span className="text-xs font-bold text-[#1B3D34] mt-0.5 block">
                              {dims}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-[#687770] block leading-tight">
                              Built-up Area
                            </span>
                            <span className="text-xs font-bold text-[#1B3D34] mt-0.5 block">
                              {bua ? `${bua.toLocaleString()} sq.ft` : 'In progress'}
                            </span>
                          </div>
                        </div>

                        {/* Cost preview */}
                        <div>
                          <span className="text-[10px] font-semibold text-[#687770] block">
                            Estimated Construction Cost
                          </span>
                          <span className="text-lg font-black text-[#1B3D34] block font-heading">
                            {totalCost ? `₹ ${formatNumber(totalCost)}` : 'Calculating…'}
                          </span>
                        </div>
                      </div>

                      {/* Card actions */}
                      <div className="pt-4 mt-4 border-t border-[#EDF2EE] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleContinueProject(proj)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                          <span>Continue Project</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRenamingProject(proj);
                            setNewProjectName(proj.name);
                          }}
                          className="p-2.5 rounded-xl border border-[#E2E8E3] text-[#52605B] hover:text-[#1B3D34] hover:bg-[#FAFBF9] transition-colors cursor-pointer"
                          title="Rename Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingProject(proj)}
                          className="p-2.5 rounded-xl border border-[#E2E8E3] text-[#52605B] hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                          title="Archive Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: MY REPORTS                                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E2E8E3] p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
                <FileCheck className="w-12 h-12 text-[#687770] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#1B3D34]">Reports you unlock will appear here</h3>
                <p className="text-xs text-[#52605B] leading-relaxed max-w-xs mx-auto">
                  When you download your ₹99 Basic Estimate or unlock the ₹499 Detailed BOQ dossier, your permanent PDF documents are preserved here.
                </p>
                <button
                  type="button"
                  onClick={handleStartNewProject}
                  className="inline-flex items-center gap-1.5 bg-[#1B3D34] text-white font-bold text-xs py-2.5 px-4 rounded-xl"
                >
                  <span>Go to Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-2xl border border-[#E2E8E3] p-5 shadow-xs flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3EF] text-[#1B3D34] border border-[#D5E5DC]">
                        {rep.tierCode === 'ESTIMATE_99' ? '₹99 Verified PDF' : '₹499 Detailed Dossier'}
                      </span>
                      <h4 className="font-bold text-sm text-[#1B3D34] mt-1">{rep.reportTitle}</h4>
                      <p className="text-xs text-[#52605B]">Project: {rep.projectName} ({rep.city})</p>
                      <span className="text-[11px] text-[#687770] block">
                        Unlocked on {new Date(rep.unlockedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <a
                      href={rep.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: PAYMENT HISTORY                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-xs overflow-hidden text-left">
            {purchases.length === 0 ? (
              <div className="p-12 text-center text-[#52605B] text-xs space-y-2">
                <CreditCard className="w-10 h-10 text-[#687770] mx-auto opacity-70" />
                <p className="font-semibold text-sm text-[#1B3D34]">No payment transactions found</p>
                <p>All completed purchases and verified receipts will appear here automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#FAFBF9] border-b border-[#E2E8E3] text-[#1B3D34] font-bold">
                    <tr>
                      <th className="py-3 px-4">Order Reference</th>
                      <th className="py-3 px-4">Product / Service</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF2EE]">
                    {purchases.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAFBF9]/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#1B3D34]">{order.reference}</td>
                        <td className="py-3 px-4 font-medium text-[#1B3D34]">{order.productName}</td>
                        <td className="py-3 px-4 font-bold text-[#1B3D34]">₹ {order.amountINR.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              order.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {formatPaymentStatus(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#52605B]">
                          {new Date(order.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right text-[#687770] font-medium">{order.gateway}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CONSULTATION HISTORY                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E2E8E3] p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
                <Calendar className="w-12 h-12 text-[#687770] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#1B3D34]">Your consultation requests will appear here</h3>
                <p className="text-xs text-[#52605B] leading-relaxed max-w-xs mx-auto">
                  Connect with vetted structural engineers, architects, and quantity surveyors for personal guidance (₹1,499).
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/consult')}
                  className="inline-flex items-center gap-1.5 bg-[#1B3D34] text-white font-bold text-xs py-2.5 px-4 rounded-xl"
                >
                  <span>Explore Verified Experts</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {consultations.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-[#E2E8E3] p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#687770] block">{c.publicReference}</span>
                        <h4 className="font-bold text-sm text-[#1B3D34] mt-0.5">{c.topic}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3EF] text-[#1B3D34] border border-[#D5E5DC]">
                        {formatConsultationStatus(c.status)}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF2EE] text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#687770]">Specialist:</span>
                        <span className="font-bold text-[#1B3D34]">{c.consultant?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#687770]">Requested Time:</span>
                        <span className="font-medium text-[#1B3D34]">{c.preferredDate} ({c.preferredTime})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 5: PROFILE & SETTINGS                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#E2E8E3] p-6 sm:p-8 max-w-xl mx-auto shadow-xs text-left">
            <h3 className="text-lg font-bold text-[#1B3D34] mb-1">Account &amp; Contact Details</h3>
            <p className="text-xs text-[#52605B] mb-5">
              Keep your contact information updated for receiving calculation reports and consultation updates.
            </p>

            {profileStatus && (
              <div className="mb-4 p-3 rounded-xl bg-[#EBF3EF] border border-[#D5E5DC] text-[#1B3D34] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B3D34]" />
                <span>{profileStatus}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-[#FAFBF9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1">
                  Email Address <span className="text-gray-400 font-normal lowercase">(read-only)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full px-3.5 py-2.5 border border-[#E2E8E3] rounded-xl text-sm text-[#687770] bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B3D34] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="98765 43210"
                  className="block w-full px-3.5 py-2.5 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] bg-[#FAFBF9]"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-[#1B3D34] hover:bg-[#142E27] text-white font-bold text-xs py-3 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* RENAME PROJECT MODAL                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {renamingProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-lg max-w-sm w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1B3D34]">Rename Project</h3>
              <button
                type="button"
                onClick={() => setRenamingProject(null)}
                className="text-[#687770] hover:text-[#1B3D34]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmRename} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#687770] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-[#D5E1D8] rounded-xl text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52605B] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1B3D34] text-white hover:bg-[#142E27]"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DELETE PROJECT MODAL                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-lg max-w-sm w-full p-6 text-left space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1B3D34]">Archive &ldquo;{deletingProject.name}&rdquo;?</h3>
              <p className="text-xs text-[#52605B] mt-1 leading-relaxed">
                This project will be removed from your active workspace. Any purchased reports associated with this project will remain safely accessible in My Reports.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52605B] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
