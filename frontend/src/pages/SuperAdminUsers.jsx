import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Power,
} from 'lucide-react';
import {
  getUsers,
  updateUserStatus,
} from '../lib/superAdminApi.js';
import { formatDate } from '../lib/format.js';

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SOCIETY_ADMIN', label: 'Society Admin' },
  { value: 'RESIDENT', label: 'Resident' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'VENDOR', label: 'Vendor' },
];

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  SOCIETY_ADMIN: 'Society Admin',
  RESIDENT: 'Resident',
  STAFF: 'Staff',
  VENDOR: 'Vendor',
};

const ROLE_BADGES = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  SOCIETY_ADMIN: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  RESIDENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  STAFF: 'bg-amber-100 text-amber-700 border-amber-200',
  VENDOR: 'bg-sky-100 text-sky-700 border-sky-200',
};

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        ROLE_BADGES[role] || 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const PAGE_SIZE = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const data = await getUsers({
        search: searchTerm.trim() || undefined,
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      setUsers(data.data?.users || []);
      setTotalRecords(data.data?.total || 0);
    } catch (err) {
      setUsers([]);
      setTotalRecords(0);
      setFetchError(
        err?.response?.data?.message || 'Failed to load users',
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedRole, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (
      !window.confirm(
        `Are you sure you want to ${action} ${fullName || 'this user'}?`,
      )
    ) {
      return;
    }

    try {
      setUpdatingId(user.id);
      setFetchError('');
      setSuccessMessage('');

      await updateUserStatus(user.id, !user.isActive);

      setSuccessMessage(
        `${fullName || 'User'} ${action}d successfully.`,
      );
      await fetchUsers();
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to update user status',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Users Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage every user account across the platform.
          </p>
        </div>
      </div>

      {(fetchError || successMessage) && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
            fetchError
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError || successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email or phone…"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Society</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        No users found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search or role filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {users.map((user) => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                const isLocked = user.role === 'SUPER_ADMIN';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0">
                          {(fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">
                          {fullName || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {user.email || '—'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                      {user.phone || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {user.society?.name || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isLocked ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200"
                          title="Super admin accounts cannot be modified"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={updatingId === user.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                            user.isActive
                              ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100'
                              : 'text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {updatingId === user.id
                            ? 'Updating…'
                            : user.isActive
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="p-8 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading users…
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
          <span>
            Showing {users.length} of {totalRecords} users
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
