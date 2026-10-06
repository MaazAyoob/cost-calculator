import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  History,
  Building,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useConsultationStore } from '../../../store/useConsultationStore';
import { useAdminStore } from '../../../store/useAdminStore';
import { ConsultationRequest, ConsultationStatus } from '../../../types/consultation';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';
import { formatCurrency } from '../../../utils/cn';

export const AdminConsultationsSection: React.FC = () => {
  const { token } = useAdminStore();
  const {
    adminRequests,
    adminStats,
    adminConsultants,
    fetchAdminRequests,
    fetchAdminConsultants,
    fetchAdminRequestDetail,
    adminSelectedRequest,
    assignConsultant,
    scheduleConsultation,
    updateRequestStatus,
    addInternalNote,
    isAdminLoading,
    adminError,
    adminSuccessMessage,
    clearAdminMessages,
  } = useConsultationStore();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Request Modal
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Modal actions state
  const [newConsultantId, setNewConsultantId] = useState('');
  const [confirmedScheduleInput, setConfirmedScheduleInput] = useState('');
  const [newStatusInput, setNewStatusInput] = useState<ConsultationStatus>('AWAITING_REVIEW');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const effectiveToken = token || 'dev-admin-mock-token-2026';

  useEffect(() => {
    fetchAdminRequests({ status: statusFilter, search }, effectiveToken);
    fetchAdminConsultants(effectiveToken);
  }, [fetchAdminRequests, fetchAdminConsultants, statusFilter, search, effectiveToken]);

  const handleOpenManageModal = async (req: ConsultationRequest) => {
    setSelectedRequestId(req.id);
    setActionFeedback(null);
    setNewConsultantId(req.consultantId || '');
    setNewStatusInput(req.status);
    if (req.confirmedDateTime) {
      const dt = new Date(req.confirmedDateTime);
      // Format as YYYY-MM-DDTHH:mm for datetime-local
      const tzOffset = dt.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
      setConfirmedScheduleInput(localISOTime);
    } else {
      setConfirmedScheduleInput('');
    }
    await fetchAdminRequestDetail(req.id, effectiveToken);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newConsultantId) return;
    try {
      await assignConsultant(selectedRequestId, newConsultantId, effectiveToken);
      setActionFeedback('Consultant assigned successfully.');
      await fetchAdminRequestDetail(selectedRequestId, effectiveToken);
    } catch (err: any) {
      setActionFeedback(err.message);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !confirmedScheduleInput) return;
    try {
      const iso = new Date(confirmedScheduleInput).toISOString();
      await scheduleConsultation(selectedRequestId, iso, effectiveToken);
      setActionFeedback('Appointment schedule confirmed successfully.');
      await fetchAdminRequestDetail(selectedRequestId, effectiveToken);
    } catch (err: any) {
      setActionFeedback(err.message);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newStatusInput) return;
    try {
      await updateRequestStatus(selectedRequestId, newStatusInput, effectiveToken);
      setActionFeedback(`Status updated to ${newStatusInput}.`);
      await fetchAdminRequestDetail(selectedRequestId, effectiveToken);
    } catch (err: any) {
      setActionFeedback(err.message);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newInternalNote.trim()) return;
    try {
      await addInternalNote(selectedRequestId, newInternalNote.trim(), effectiveToken);
      setNewInternalNote('');
      setActionFeedback('Internal note recorded.');
      await fetchAdminRequestDetail(selectedRequestId, effectiveToken);
    } catch (err: any) {
      setActionFeedback(err.message);
    }
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'AWAITING_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Awaiting Review
          </span>
        );
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            Assigned
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            Completed
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP COUNTERS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">{adminStats.total}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Paid</span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 block">{adminStats.paid}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-300 bg-amber-50/40 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-amber-700 block tracking-wider">Awaiting Review</span>
          <span className="text-xl font-extrabold text-amber-900 font-mono mt-0.5 block">{adminStats.awaitingReview}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Assigned</span>
          <span className="text-xl font-extrabold text-blue-800 font-mono mt-0.5 block">{adminStats.assigned}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Scheduled</span>
          <span className="text-xl font-extrabold text-emerald-800 font-mono mt-0.5 block">{adminStats.scheduled}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Completed</span>
          <span className="text-xl font-extrabold text-slate-700 font-mono mt-0.5 block">{adminStats.completed}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Cancelled</span>
          <span className="text-xl font-extrabold text-red-700 font-mono mt-0.5 block">{adminStats.cancelled}</span>
        </div>
      </div>

      {/* Notifications */}
      {adminError && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{adminError}</span>
          </div>
          <button onClick={clearAdminMessages} className="text-red-500 font-bold">×</button>
        </div>
      )}

      {adminSuccessMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminSuccessMessage}</span>
          </div>
          <button onClick={clearAdminMessages} className="text-emerald-500 font-bold">×</button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Reference (HT-CON-...), Homeowner name, email, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3D34] font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AWAITING_REVIEW">Awaiting Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Homeowner</th>
                <th className="py-3 px-4">Topic &amp; Consultant</th>
                <th className="py-3 px-4">Preferred Slot</th>
                <th className="py-3 px-4">Fee Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No consultation requests match this filter.
                  </td>
                </tr>
              ) : (
                adminRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {req.publicReference}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{req.homeownerName}</span>
                      <span className="text-[11px] text-slate-500 block">{req.homeownerPhone}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-xs">{req.consultationTopic}</span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {req.consultant?.name ? `Expert: ${req.consultant.name}` : 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium block">{req.preferredDate}</span>
                      <span className="text-[11px] text-slate-500 block">{req.preferredTime}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-800 block">
                        {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">Verified Paid</span>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(req.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenManageModal(req)}
                        className="px-3 py-1.5 bg-[#1B3D34] hover:bg-[#142E27] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MANAGE CONSULTATION MODAL ── */}
      {selectedRequestId && adminSelectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 my-8 text-left space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {adminSelectedRequest.publicReference}
                  </span>
                  {getStatusBadge(adminSelectedRequest.status)}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1 font-heading">
                  Consultation Request Review
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequestId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between">
                <span>{actionFeedback}</span>
                <button onClick={() => setActionFeedback(null)} className="text-emerald-500 font-bold">×</button>
              </div>
            )}

            {/* Dossier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Homeowner & Request Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
                  Customer &amp; Location
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <strong className="text-slate-900">{adminSelectedRequest.homeownerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-900">{adminSelectedRequest.homeownerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-900">{adminSelectedRequest.homeownerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-900">{adminSelectedRequest.projectLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Project Type:</span>
                  <span className="text-slate-900">{adminSelectedRequest.projectType}</span>
                </div>
              </div>

              {/* Consultation Topic & Schedule */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
                  Topic &amp; Preferred Time
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Topic:</span>
                  <strong className="text-slate-900 truncate max-w-[200px]">{adminSelectedRequest.consultationTopic}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Preferred Date:</span>
                  <span className="text-slate-900 font-medium">{adminSelectedRequest.preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Preferred Slot:</span>
                  <span className="text-slate-900">{adminSelectedRequest.preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Expert:</span>
                  <strong className="text-[#1B3D34]">
                    {adminSelectedRequest.consultant?.name || 'Unassigned'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmed Schedule:</span>
                  <span className="text-emerald-800 font-bold">
                    {adminSelectedRequest.confirmedDateTime
                      ? new Date(adminSelectedRequest.confirmedDateTime).toLocaleString('en-IN')
                      : 'Pending Admin Confirmation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Linked Project Snapshot if available */}
            {adminSelectedRequest.projectSnapshot && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] block">
                  Linked Hutty Project Snapshot
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-500 block">House Type</span>
                    <strong>{adminSelectedRequest.projectSnapshot.houseType || 'Residential'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Floors</span>
                    <strong>{adminSelectedRequest.projectSnapshot.floors || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Built-up Area</span>
                    <strong>{adminSelectedRequest.projectSnapshot.totalBUASqFt} sq.ft</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Calculated Cost</span>
                    <strong className="font-mono text-emerald-800">
                      {formatCurrency(adminSelectedRequest.projectSnapshot.estimatedTotalCostINR || 0)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Message */}
            {adminSelectedRequest.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Homeowner Note:</span>
                <p className="italic">"{adminSelectedRequest.message}"</p>
              </div>
            )}

            {/* ── ADMIN WORKFLOW ACTIONS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Action 1: Assign Consultant */}
              <form onSubmit={handleAssignSubmit} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">1. Assign Consultant</span>
                <select
                  value={newConsultantId}
                  onChange={(e) => setNewConsultantId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">Select consultant...</option>
                  {adminConsultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!newConsultantId || isAdminLoading}
                  className="w-full hutty-btn-primary py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Save Assignment
                </button>
              </form>

              {/* Action 2: Confirm Appointment Schedule */}
              <form onSubmit={handleScheduleSubmit} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">2. Confirm Schedule</span>
                <input
                  type="datetime-local"
                  required
                  value={confirmedScheduleInput}
                  onChange={(e) => setConfirmedScheduleInput(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                />
                <button
                  type="submit"
                  disabled={!confirmedScheduleInput || isAdminLoading}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-2 rounded-xl text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Confirm &amp; Schedule
                </button>
              </form>

              {/* Action 3: Transition Status */}
              <form onSubmit={handleStatusSubmit} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">3. Update Status</span>
                <select
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value as ConsultationStatus)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="AWAITING_REVIEW">Awaiting Review</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Update Status
                </button>
              </form>
            </div>

            {/* ── INTERNAL NOTES & AUDIT TRAIL ── */}
            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
                Internal Administrative Notes (Private to Admin)
              </span>

              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="Record call discussion, scheduling constraint, or internal observation..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="hutty-btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </form>

              {/* Event & Note Timeline */}
              {adminSelectedRequest.events && adminSelectedRequest.events.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {adminSelectedRequest.events.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-2.5 rounded-xl border text-[11px] ${
                        evt.internalNote
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{evt.title}</span>
                        <span className="font-normal text-slate-400 text-[10px]">
                          {new Date(evt.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {evt.internalNote && (
                        <p className="mt-1 font-mono text-xs">{evt.internalNote}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
