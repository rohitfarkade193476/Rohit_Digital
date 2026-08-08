import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getSocieties,
  updateSocietyStatus,
} from '../lib/superAdminApi.js';
import { formatDate } from '../lib/format.js';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

function SocietyStatusBadge({ status }) {
  const configs = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        configs[status] || configs.INACTIVE
      }`}
    >
      {status}
    </span>
  );
}

export default function SuperAdminSocieties() {
  const [societies, setSocieties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const PAGE_SIZE = 10;

  const fetchSocieties = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const data = await getSocieties({
        search: searchTerm.trim() || undefined,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      setSocieties(data.data?.societies || []);
      setTotalRecords(data.data?.total || 0);
    } catch (err) {
      setSocieties([]);
      setTotalRecords(0);
      setFetchError(
        err?.response?.data?.message || 'Failed to load societies',
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedStatus, currentPage]);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  const handleStatusChange = async (society, newStatus) => {
    if (newStatus === society.status) return;

    const action = newStatus === 'ACTIVE' ? 'activate' : newStatus === 'SUSPENDED' ? 'suspend' : 'deactivate';
    if (
      !window.confirm(
        `Are you sure you want to ${action} "${society.name}"?`,
      )
    ) {
      return;
    }

    try {
      setUpdatingId(society.id);
      setFetchError('');
      setSuccessMessage('');

      await updateSocietyStatus(society.id, newStatus);

      setSuccessMessage(
        `Society "${society.name}" marked as ${newStatus.toLowerCase()}.`,
      );
      await fetchSocieties();
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to update society status',
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
            Societies Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage all housing societies registered on the platform.
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
            placeholder="Search by society name, code, city or email…"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
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
                <th className="py-3.5 px-6">Society</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Contact</th>
                <th className="py-3.5 px-6">Members</th>
                <th className="py-3.5 px-6">Complaints</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Registered On</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {!isLoading && societies.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        No societies found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {societies.map((society) => (
                <tr key={society.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {society.name}
                        </div>
                        <div className="font-mono text-[11px] text-indigo-600 font-semibold">
                          {society.societyCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    {[society.city, society.state].filter(Boolean).join(', ') || '—'}
                    {society.pincode ? ` · ${society.pincode}` : ''}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <div>{society.contactEmail || '—'}</div>
                    <div className="text-slate-400">{society.contactPhone || ''}</div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    {society._count?.users ?? 0} users · {society._count?.residents ?? 0} residents
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    {society._count?.complaints ?? 0}
                  </td>
                  <td className="py-4 px-6">
                    <SocietyStatusBadge status={society.status} />
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    {formatDate(society.createdAt)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      value={society.status}
                      disabled={updatingId === society.id}
                      onChange={(e) => handleStatusChange(society, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                      title="Change society status"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="p-8 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading societies…
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
          <span>
            Showing {societies.length} of {totalRecords} societies
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
