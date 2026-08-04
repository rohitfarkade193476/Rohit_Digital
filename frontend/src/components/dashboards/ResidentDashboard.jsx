import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, AlertCircle, Clock, Wrench, CheckCircle2,
  User, ChevronRight, Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../Button.jsx';
import { getComplaints } from '../../lib/complaintApi.js';

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: Wrench,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: CheckCircle2,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboardData() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getComplaints({ page: 1, limit: 100 });
        if (!cancelled) {
          const list = data?.data?.complaints ?? [];
          setComplaints(list);
          setTotal(data?.data?.total ?? 0);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load dashboard data.');
          setComplaints([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchDashboardData();
    return () => { cancelled = true; };
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || 'Resident';

  const stats = {
    total,
    open: complaints.filter((c) => c.status === 'OPEN').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
  };

  const recentComplaints = complaints.slice(0, 5);
  const hasComplaints = recentComplaints.length > 0;

  return (
    <div className="space-y-6">

      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {getGreeting()}, {user?.firstName || 'Resident'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here's an overview of your society activities.
          </p>
        </div>
        <Button
          onClick={() => navigate('/resident/complaints/new')}
          className="shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Raise Complaint
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex flex-col items-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">Something went wrong</h3>
          <p className="text-sm text-red-500 mb-5">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Top Row: Resident Info + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Resident Information Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Resident Information</h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Resident Name', value: displayName },
                  user?.email && { label: 'Email', value: user.email },
                  user?.phone && { label: 'Phone', value: user.phone },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                    <span className="text-xs font-semibold text-slate-700 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaint Summary Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total',
                  value: stats.total,
                  icon: AlertCircle,
                  color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                },
                {
                  label: 'Open',
                  value: stats.open,
                  icon: Clock,
                  color: 'bg-amber-50 text-amber-600 border-amber-100',
                },
                {
                  label: 'In Progress',
                  value: stats.inProgress,
                  icon: Wrench,
                  color: 'bg-blue-50 text-blue-600 border-blue-100',
                },
                {
                  label: 'Resolved',
                  value: stats.resolved,
                  icon: CheckCircle2,
                  color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{label} Complaints</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">

            {/* Section Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Recent Complaints</h3>
              {hasComplaints && (
                <button
                  onClick={() => navigate('/resident/complaints')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content */}
            {hasComplaints ? (
              <div className="divide-y divide-slate-100">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-indigo-600 font-semibold mb-0.5">
                        {complaint.id.slice(0, 8)}…
                      </p>
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {complaint.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{complaint.category}</span>
                        <span className="text-slate-200">•</span>
                        <span className="text-xs text-slate-400">{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">No complaints yet</h4>
                <p className="text-xs text-slate-400 mb-4">
                  You haven't raised any complaints yet.
                </p>
                <Button onClick={() => navigate('/resident/complaints/new')}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Raise Your First Complaint
                </Button>
              </div>
            )}

            {/* Footer */}
            {hasComplaints && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                <button
                  onClick={() => navigate('/resident/complaints')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
                >
                  View all complaints
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
