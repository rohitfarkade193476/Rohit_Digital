import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyStaffAssignments } from '../../lib/staffApi.js';
import { formatDateTime } from '../../lib/format.js';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      setFetchError('');
      const res = await getMyStaffAssignments();
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.assignments ?? []);
      setAssignments(raw);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load assignments.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // ── Stats derived from live data ─────────────────────────────────────────────
  const totalCount = assignments.length;
  const assignedCount = assignments.filter((a) => a.status === 'ASSIGNED').length;
  const acceptedCount = assignments.filter((a) => a.status === 'ACCEPTED').length;
  const inProgressCount = assignments.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  // Recent assignments: last 5, ordered by assignedAt desc (backend already orders by desc)
  const recentJobs = assignments.slice(0, 5);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Staff Service Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              Welcome, {user?.firstName || 'Staff Member'} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              View your assigned complaints, perform maintenance tasks, and update work status.
            </p>
          </div>
          <button
            onClick={() => navigate('/staff/assigned-complaints')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            View Assigned Complaints
          </button>
        </div>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total</p>
              <ClipboardList className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalCount}</p>
            <p className="text-xs text-slate-400 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{assignedCount + acceptedCount}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting action</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-indigo-600 uppercase">In Progress</p>
              <Wrench className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
            <p className="text-xs text-slate-400 mt-1">Under resolution</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Completed</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
            <p className="text-xs text-slate-400 mt-1">Resolved jobs</p>
          </div>
        </div>
      )}

      {/* Recent Assigned Jobs */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Assigned Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Complaints assigned by Society Admin</p>
          </div>
          <button
            onClick={() => navigate('/staff/assigned-complaints')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-5 flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              No assignments yet. The Society Admin will assign complaints to you.
            </div>
          ) : (
            recentJobs.map((job) => {
              const complaint = job.complaint || {};
              const resident = complaint.resident || {};
              const residentLabel = resident.name
                ? `${resident.name}${resident.flatNumber ? ` (Flat ${resident.flatNumber})` : ''}`
                : '—';

              return (
                <div
                  key={job.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {complaint.id?.slice(0, 8) ?? job.id?.slice(0, 8)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">{complaint.category || '—'}</span>
                      {complaint.priority && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                            {complaint.priority}
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{complaint.title || '—'}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{residentLabel}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned {formatDateTime(job.assignedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <DashboardStatusBadge status={job.status} />
                    {(job.status === 'ASSIGNED' || job.status === 'ACCEPTED' || job.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => navigate('/staff/assigned-complaints')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: compact status badge for dashboard ─────────────────────────

function DashboardStatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Done
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          <Wrench className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <CheckCircle className="w-3.5 h-3.5" /> Accepted
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Assigned
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <XCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          {status}
        </span>
      );
  }
}
