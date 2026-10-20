// ==============================================================================
// Hutty Admin User Management Section
// Allows authorized administrators to view, search, disable, restore, and safely
// remove customer accounts with transactional audit logging and financial retention.
// ==============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  X,
  Trash2,
  Lock,
  Unlock,
  Building,
  FileText,
  UserCheck,
  Calendar,
} from 'lucide-react';
import {
  fetchAdminUsers,
  disableAdminUser,
  restoreAdminUser,
  deleteAdminUser,
  AdminUserListItem,
  UserFilters,
} from '../../../services/adminUsersApi';
import { useAdminStore } from '../../../store/useAdminStore';

export const AdminUsersSection: React.FC = () => {
  const { token } = useAdminStore();

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);

  // Data State
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    disabledUsers: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Action Modals State
  const [userToDisable, setUserToDisable] = useState<AdminUserListItem | null>(null);
  const [disableReason, setDisableReason] = useState<string>('');
  const [isDisabling, setIsDisabling] = useState<boolean>(false);

  const [userToRestore, setUserToRestore] = useState<AdminUserListItem | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Auto-clear success toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const currentFilters = useMemo((): UserFilters => {
    return {
      search: searchQuery.trim() || undefined,
      status: statusFilter,
      sort: sortOrder,
      page,
      limit,
    };
  }, [searchQuery, statusFilter, sortOrder, page, limit]);

  // Load users from backend
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(currentFilters, token);
      setUsers(data.users);
      setPagination(data.pagination);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer accounts');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Disable Account
  const handleConfirmDisable = async () => {
    if (!userToDisable) return;
    setIsDisabling(true);
    try {
      await disableAdminUser(userToDisable.id, disableReason, token);
      setSuccessToast(`Account for ${userToDisable.name} (${userToDisable.email}) has been disabled.`);
      setUserToDisable(null);
      setDisableReason('');
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to disable account');
    } finally {
      setIsDisabling(false);
    }
  };

  // Handle Restore Account
  const handleConfirmRestore = async () => {
    if (!userToRestore) return;
    setIsRestoring(true);
    try {
      await restoreAdminUser(userToRestore.id, token);
      setSuccessToast(`Account for ${userToRestore.name} has been restored to active status.`);
      setUserToRestore(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to restore account');
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Safe Delete Account
  const handleConfirmDelete = async () => {
    if (!userToDelete || !deleteConfirmationChecked) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminUser(userToDelete.id, true, deleteReason, token);
      setSuccessToast(res.message || `Account for ${userToDelete.name} has been removed.`);
      setUserToDelete(null);
      setDeleteConfirmationChecked(false);
      setDeleteReason('');
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── HEADER & TITLE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-heading">User Management</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Admin Protected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer accounts, inspect project/consultation activity, disable logins, and safely decommission users.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── SUMMARY METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Registered Customers</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{summary.totalUsers}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Database & in-memory accounts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{summary.activeUsers}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Permitted to log in & book</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Disabled Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2 font-mono">{summary.disabledUsers}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Access blocked server-side</div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name, email address, or phone number..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-800 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Contact & Verification</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-center">Activity Counts</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
                    Loading customer accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No customer accounts match your active search filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSuperOrAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN' || user.email === 'admin@hutty.in';
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/60 transition-colors ${user.disabled ? 'bg-slate-50/40 text-slate-500' : ''}`}
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-slate-500 font-mono text-[11px] truncate max-w-[200px]" title={user.email}>
                          {user.email}
                        </div>
                      </td>

                      {/* Phone & Verification */}
                      <td className="py-3 px-4">
                        {user.phone ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-slate-800">{user.phoneFormatted || user.phone}</span>
                            <div>
                              {user.phoneVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Verified
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Unverified</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone provided</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                            isSuperOrAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {user.disabled ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300"
                            title={user.disabledReason || 'Account disabled'}
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Activity Counts */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-600">
                          <span title="Projects count" className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            {user.counts.projects}
                          </span>
                          <span title="Consultations count" className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {user.counts.consultations}
                          </span>
                          <span title="Purchases count" className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {user.counts.purchases}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {isSuperOrAdmin ? (
                          <span className="text-[11px] text-slate-400 italic">Protected Admin</span>
                        ) : (
                          <>
                            {user.disabled ? (
                              <button
                                onClick={() => setUserToRestore(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Restore customer account access"
                              >
                                <Unlock className="w-3 h-3" />
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => setUserToDisable(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Disable customer account access"
                              >
                                <Lock className="w-3 h-3" />
                                Disable
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteConfirmationChecked(false);
                                setDeleteReason('');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Permanently remove / scrub customer account"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{users.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{pagination.total}</span> customers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL: DISABLE ACCOUNT ── */}
      {userToDisable && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleIn text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Disable Customer Account</h3>
              </div>
              <button
                onClick={() => setUserToDisable(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to disable the account for{' '}
              <strong className="text-slate-900">{userToDisable.name}</strong> ({userToDisable.email})?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Enforcement Effect:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                <li>Future logins will be rejected immediately.</li>
                <li>Existing active JWT tokens will be rejected on all protected endpoints.</li>
                <li>New bookings, purchases, and project saves will be blocked.</li>
                <li>Existing projects, payment records, and entitlements remain preserved.</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Reason for Disabling (Optional)
              </label>
              <input
                type="text"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="e.g. Chargeback investigation, suspicious activity, customer request"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUserToDisable(null)}
                disabled={isDisabling}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisable}
                disabled={isDisabling}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isDisabling && <RefreshCw className="w-3 h-3 animate-spin" />}
                Confirm & Disable Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RESTORE ACCOUNT ── */}
      {userToRestore && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleIn text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Unlock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Restore Customer Account</h3>
              </div>
              <button
                onClick={() => setUserToRestore(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Restore login access for <strong className="text-slate-900">{userToRestore.name}</strong> (
              {userToRestore.email})?
            </p>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Restoration Effect:
              </div>
              <p className="text-emerald-800">
                The customer will be permitted to log in with their existing credentials. All saved estimates,
                purchased reports, and consultation bookings will be accessible immediately.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUserToRestore(null)}
                disabled={isRestoring}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isRestoring && <RefreshCw className="w-3 h-3 animate-spin" />}
                Confirm & Restore Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SAFE PERMANENT REMOVAL ── */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-300 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scaleIn text-left">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-rose-900 font-heading">Permanently Remove Customer Account</h3>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-2">
              <p>
                You are initiating permanent removal for{' '}
                <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email}).
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <div className="font-bold text-slate-800">Associated Customer Records:</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-slate-700 pt-1">
                  <div>Projects: {userToDelete.counts.projects}</div>
                  <div>Consultations: {userToDelete.counts.consultations}</div>
                  <div>Purchases: {userToDelete.counts.purchases}</div>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  Data Retention & Privacy Guarantee:
                </div>
                <p className="leading-relaxed">
                  To prevent foreign-key violations and comply with regulatory financial accounting rules, paid purchases
                  and transaction receipts will <strong>never be cascaded-deleted</strong>. Personal identity (name, email,
                  phone) will be permanently scrambled and scrubbed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audit Reason for Deletion (Required)
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. GDPR customer deletion request, duplicate account purge"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-800"
                />
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmationChecked}
                  onChange={(e) => setDeleteConfirmationChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px] font-medium text-slate-800 select-none">
                  I confirm that I want to remove this account. I understand that identity data will be scrubbed and this
                  action cannot be undone.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || !deleteConfirmationChecked}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting && <RefreshCw className="w-3 h-3 animate-spin" />}
                Permanently Remove Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
