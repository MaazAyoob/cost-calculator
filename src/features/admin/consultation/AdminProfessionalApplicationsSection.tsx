import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  FileText,
  Shield,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Award,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useConsultationStore } from '../../../store/useConsultationStore';
import { useAdminStore } from '../../../store/useAdminStore';
import { useCustomerAuthStore } from '../../../store/useCustomerAuthStore';
import { ProfessionalApplication, ApplicationStatus } from '../../../types/consultation';
import { CANONICAL_CONSULTATION_CATEGORIES } from '../../../config/consultation';

export const AdminProfessionalApplicationsSection: React.FC = () => {
  const { token, adminUser } = useAdminStore() as any;
  const { token: customerToken } = useCustomerAuthStore();
  const {
    adminApplications,
    fetchAdminApplications,
    reviewAdminApplication,
    isAdminLoading,
    adminError,
    adminSuccessMessage,
    clearAdminMessages,
  } = useConsultationStore();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected application for review modal
  const [selectedApp, setSelectedApp] = useState<ProfessionalApplication | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const effectiveToken =
    token ||
    customerToken ||
    localStorage.getItem('hutty_admin_token') ||
    localStorage.getItem('hutty_customer_token') ||
    'dev-admin-mock-token-2026';
  const reviewerEmail = adminUser?.email || 'admin@hutty.in';

  useEffect(() => {
    fetchAdminApplications(
      {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      },
      effectiveToken
    );
  }, [fetchAdminApplications, statusFilter, categoryFilter, effectiveToken]);

  const handleRefresh = () => {
    fetchAdminApplications(
      {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      },
      effectiveToken
    );
  };

  const handleOpenReviewModal = (app: ProfessionalApplication) => {
    setSelectedApp(app);
    setReviewerNotes(app.reviewerNotes || '');
    setReviewError(null);
  };

  const handleCloseReviewModal = () => {
    setSelectedApp(null);
    setReviewerNotes('');
    setReviewError(null);
  };

  const handleExecuteReview = async (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;

    if (newStatus === 'REJECTED' && !reviewerNotes.trim()) {
      setReviewError('Please provide a reason or note explaining why the application is rejected.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await reviewAdminApplication(
        selectedApp.id,
        {
          status: newStatus,
          reviewerNotes: reviewerNotes.trim() || undefined,
          adminReviewNotes: reviewerNotes.trim() || undefined,
          reviewerEmail,
        },
        effectiveToken
      );

      // Update selected app status locally for instant feedback
      setSelectedApp({
        ...selectedApp,
        status: newStatus,
        reviewerNotes: reviewerNotes.trim() || undefined,
        adminReviewNotes: reviewerNotes.trim() || undefined,
        reviewedBy: reviewerEmail,
        adminReviewerId: reviewerEmail,
        reviewedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review decision');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredApplications = adminApplications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    const appCats = app.categories || [app.category];
    if (categoryFilter !== 'ALL' && !appCats.includes(categoryFilter) && app.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.fullName.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchPhone = app.phone.toLowerCase().includes(q);
      const matchCity = app.city.toLowerCase().includes(q);
      const matchLicence = app.licenseNumber?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCity && !matchLicence) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3" /> Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved & Listed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'MORE_INFO_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <AlertCircle className="w-3 h-3" /> Info Needed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const statusCounts = {
    ALL: adminApplications.length,
    SUBMITTED: adminApplications.filter((a) => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: adminApplications.filter((a) => a.status === 'UNDER_REVIEW').length,
    APPROVED: adminApplications.filter((a) => a.status === 'APPROVED').length,
    REJECTED: adminApplications.filter((a) => a.status === 'REJECTED').length,
    MORE_INFO_REQUIRED: adminApplications.filter((a) => a.status === 'MORE_INFO_REQUIRED').length,
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1B3D34]/10 text-[#1B3D34] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900">
                Professional Verification Queue
              </h2>
              <p className="text-xs text-slate-500">
                Review applicant qualifications, licenses and portfolios before approving public consultant directory listings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isAdminLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAdminLoading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {adminSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{adminSuccessMessage}</span>
          <button onClick={clearAdminMessages} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {adminError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{adminError}</span>
          <button onClick={clearAdminMessages} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── FILTER & STATUS PILLS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'MORE_INFO_REQUIRED', 'REJECTED'] as const).map(
            (st) => {
              const count = statusCounts[st] || 0;
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#1B3D34] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>
                    {st === 'ALL'
                      ? 'All Applications'
                      : st === 'SUBMITTED'
                      ? 'Submitted'
                      : st === 'UNDER_REVIEW'
                      ? 'Under Review'
                      : st === 'APPROVED'
                      ? 'Approved'
                      : st === 'MORE_INFO_REQUIRED'
                      ? 'Info Needed'
                      : 'Rejected'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, city or COA/licence number..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
            >
              <option value="ALL">All Categories</option>
              {CANONICAL_CONSULTATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── APPLICATIONS TABLE / LIST ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No applications match criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try resetting the filters or clearing the search query.'
                : 'No professional applications have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Applicant Details</th>
                  <th className="p-3.5">Category & Experience</th>
                  <th className="p-3.5">Qualifications & License</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Applicant */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{app.fullName}</div>
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {app.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {app.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{app.city}</span>
                        {app.serviceAreas && (
                          <span className="truncate max-w-[200px]">({app.serviceAreas})</span>
                        )}
                      </div>
                    </td>

                    {/* Category & Experience */}
                    <td className="p-3.5 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {(app.categories || [app.category]).map((cat: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#1B3D34]/10 text-[#1B3D34] font-semibold text-[10px]"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono">
                        {app.experienceYears} Years Experience
                      </div>
                    </td>

                    {/* Qualifications & License */}
                    <td className="p-3.5 space-y-0.5">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={app.qualifications}>
                          {app.qualifications}
                        </span>
                      </div>
                      {app.licenseNumber ? (
                        <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Reg: {app.licenseNumber}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">No statutory license</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">{getStatusBadge(app.status)}</td>

                    {/* Date */}
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#1B3D34] bg-[#1B3D34]/10 hover:bg-[#1B3D34]/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── INSPECT & REVIEW MODAL ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl my-6 text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {selectedApp.fullName}
                  </h3>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Application ID: {selectedApp.id} • Submitted on{' '}
                  {new Date(selectedApp.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseReviewModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {reviewError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                  {reviewError}
                </div>
              )}

              {/* Dossier Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact & Location */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5 text-[#1B3D34]" />
                    <span>Contact & Location</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400">Email:</span> {selectedApp.email}
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span> {selectedApp.phone}
                    </div>
                    <div>
                      <span className="text-slate-400">City:</span> {selectedApp.city}
                    </div>
                    <div>
                      <span className="text-slate-400">Service Areas:</span>{' '}
                      {selectedApp.serviceAreas || 'Citywide'}
                    </div>
                  </div>
                </div>

                {/* Professional Qualifications */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-[#1B3D34]" />
                    <span>Qualifications & Credentials</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-mono">Degrees:</span>{' '}
                      <span className="font-semibold text-slate-900">{selectedApp.qualifications}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Experience:</span>{' '}
                      <span className="font-bold text-[#1B3D34]">{selectedApp.experienceYears} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">License/COA:</span>{' '}
                      <span className="font-mono font-bold text-slate-900">
                        {selectedApp.licenseNumber || 'None / Not Applicable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories & Expertise */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Requested Consultation Categories & Specializations
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedApp.categories || [selectedApp.category]).map((c: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {(selectedApp.specializations || selectedApp.expertise) && (selectedApp.specializations || selectedApp.expertise)!.length > 0 && (
                  <div className="pt-1">
                    <span className="text-slate-400 font-mono">Specializations: </span>
                    <span className="font-medium text-slate-800">
                      {(selectedApp.specializations || selectedApp.expertise)!.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio & Background */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Professional Summary & Practice Background
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                  {selectedApp.about || 'No detailed background provided.'}
                </p>
              </div>

              {/* Portfolio & Documents */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Portfolio & Verification Documents</span>
                  <span className="text-[10px] text-slate-400 font-normal">Private Admin Access Only</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedApp.portfolioUrl || (selectedApp.portfolioLinks && selectedApp.portfolioLinks[0]) ? (
                    <a
                      href={selectedApp.portfolioUrl || selectedApp.portfolioLinks![0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#1B3D34] flex items-center justify-between text-blue-700 hover:text-blue-900 font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        <span className="truncate">View Online Portfolio</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </a>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                      No external portfolio link provided
                    </div>
                  )}

                  {selectedApp.documentsUrl ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-mono text-slate-700 truncate">
                          {selectedApp.documentsUrl}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                        Protected
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                      No standalone file attachment
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Setup */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Proposed Offerings & Consultation Modes
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono">Proposed Fee:</span>{' '}
                    <span className="font-bold text-slate-900">
                      ₹{(selectedApp.proposedFeeINR || selectedApp.proposedFee || 1499).toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 ml-1 text-[11px]">
                      (Standard platform consultation fee is ₹1,499)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Supported Modes:</span>{' '}
                    <span className="font-medium text-slate-800">
                      {selectedApp.consultationModes?.join(', ') || 'Online / Phone'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review History if previously reviewed */}
              {(selectedApp.reviewedBy || selectedApp.adminReviewerId) && (
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Previous Review Decision</span>
                  </div>
                  <div className="text-[11px] text-blue-800">
                    Reviewed by <span className="font-mono font-bold">{selectedApp.reviewedBy || selectedApp.adminReviewerId}</span> on{' '}
                    {selectedApp.reviewedAt || selectedApp.updatedAt
                      ? new Date(selectedApp.reviewedAt || selectedApp.updatedAt).toLocaleString('en-IN')
                      : '—'}
                  </div>
                  {(selectedApp.reviewerNotes || selectedApp.adminReviewNotes) && (
                    <div className="text-xs text-blue-950 font-medium italic mt-1 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                      "{selectedApp.reviewerNotes || selectedApp.adminReviewNotes}"
                    </div>
                  )}
                </div>
              )}

              {/* Reviewer Action Form */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="block font-bold text-slate-900 text-xs">
                  Reviewer Notes & Feedback:
                </label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Enter internal review notes or reasons (required if rejecting or requesting information)..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 rounded-b-3xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteReview('UNDER_REVIEW')}
                  disabled={isSubmittingReview}
                  className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteReview('MORE_INFO_REQUIRED')}
                  disabled={isSubmittingReview}
                  className="px-3 py-2 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer"
                >
                  Request More Info
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteReview('REJECTED')}
                  disabled={isSubmittingReview}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteReview('APPROVED')}
                  disabled={isSubmittingReview}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish to Directory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
