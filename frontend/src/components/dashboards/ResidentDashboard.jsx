/**
 * ResidentDashboard.jsx  (components/dashboards/)
 *
 * Full resident dashboard UI.
 * Uses mock data — replace with API calls later.
 *
 * Backend integration points are marked with comments.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, AlertCircle, Clock, Wrench, CheckCircle2,
  Home, Building2, User, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../Button.jsx';

// ── Mock Resident Profile ─────────────────────────────────────────────────
// Replace with: const profile = await residentProfileApi.getMyProfile()
const MOCK_RESIDENT = {
  name: 'Rahul Sharma',
  firstName: 'Rahul',
  flatNumber: 'A-101',
  wing: 'A',
  society: 'Green Valley Society',
  email: 'rahul.sharma@example.com',
};

// ── Mock Complaints ───────────────────────────────────────────────────────
// Replace with: const complaints = await residentComplaintsApi.getMyComplaints()
const MOCK_RECENT_COMPLAINTS = [
  {
    id: 'CMP-1024',
    title: 'Water leakage in bathroom',
    category: 'Plumbing',
    status: 'OPEN',
    date: 'Today',
  },
  {
    id: 'CMP-1021',
    title: 'Lift not working',
    category: 'Maintenance',
    status: 'IN_PROGRESS',
    date: 'Yesterday',
  },
  {
    id: 'CMP-1018',
    title: 'Parking issue',
    category: 'Parking',
    status: 'RESOLVED',
    date: '3 days ago',
  },
];

// ── Complaint Summary Stats (mock) ────────────────────────────────────────
const MOCK_STATS = { total: 12, open: 3, inProgress: 4, resolved: 5 };

// ── Status config ─────────────────────────────────────────────────────────
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

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use real user name if available, fall back to mock
  const displayFirstName = user?.firstName || MOCK_RESIDENT.firstName;
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : MOCK_RESIDENT.name;

  const hasComplaints = MOCK_RECENT_COMPLAINTS.length > 0;

  return (
    <div className="space-y-6">

      {/* ── Greeting Banner ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {getGreeting()}, {displayFirstName} 👋
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

      {/* ── Top Row: Resident Info + Stats ──────────────────────────────── */}
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
              { label: 'Flat Number', value: MOCK_RESIDENT.flatNumber },
              { label: 'Wing', value: MOCK_RESIDENT.wing },
              { label: 'Society', value: MOCK_RESIDENT.society },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <span className="text-xs font-semibold text-slate-700 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Summary Cards — 2-col grid spanning 2/3 of the row */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: 'Total',
              value: MOCK_STATS.total,
              icon: AlertCircle,
              color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            },
            {
              label: 'Open',
              value: MOCK_STATS.open,
              icon: Clock,
              color: 'bg-amber-50 text-amber-600 border-amber-100',
            },
            {
              label: 'In Progress',
              value: MOCK_STATS.inProgress,
              icon: Wrench,
              color: 'bg-blue-50 text-blue-600 border-blue-100',
            },
            {
              label: 'Resolved',
              value: MOCK_STATS.resolved,
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

      {/* ── Recent Complaints ─────────────────────────────────────────────── */}
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
            {MOCK_RECENT_COMPLAINTS.map((complaint) => (
              <div
                key={complaint.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-indigo-600 font-semibold mb-0.5">
                    {complaint.id}
                  </p>
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {complaint.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{complaint.category}</span>
                    <span className="text-slate-200">•</span>
                    <span className="text-xs text-slate-400">{complaint.date}</span>
                  </div>
                </div>
                <StatusBadge status={complaint.status} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
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

    </div>
  );
}
