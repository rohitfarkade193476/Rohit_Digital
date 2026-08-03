import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyAssignments } from '../../lib/assignmentApi.js';
import { formatDate } from '../../lib/format.js';
import AssignmentStatusBadge from '../vendor/AssignmentStatusBadge.jsx';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getMyAssignments();
      setAssignments(data.data || []);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load assignments'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const newCount = assignments.filter((a) => a.status === 'ASSIGNED').length;
  const inProgressCount = assignments.filter(
    (a) => a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS'
  ).length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  const recentAssignments = assignments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Vendor Partner Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              Welcome, {user?.firstName || 'Vendor Partner'} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Track service assignments, update progress, and manage your
              society work orders.
            </p>
          </div>
          <button
            onClick={() => navigate('/vendor/assignments')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            View All Assignments
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-600 uppercase">
              New Assignments
            </p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{newCount}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting acceptance</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-600 uppercase">
              Work In Progress
            </p>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
          <p className="text-xs text-slate-400 mt-1">Accepted & active work</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-emerald-600 uppercase">
              Completed Work
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Completed assignments</p>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Assignments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest service assignments received
            </p>
          </div>
          <button
            onClick={() => navigate('/vendor/assignments')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            All Assignments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading assignments…
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No assignments yet. You'll see work here once a society assigns you.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAssignments.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/vendor/assignments/${a.id}`)}
                className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-purple-600">
                      {a.complaint?.title?.slice(0, 12)?.toUpperCase() ||
                        a.id.slice(0, 8)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Assigned {formatDate(a.assignedAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {a.complaint?.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {a.complaint?.category} •{' '}
                    {a.society?.name || 'Housing Society'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AssignmentStatusBadge status={a.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
