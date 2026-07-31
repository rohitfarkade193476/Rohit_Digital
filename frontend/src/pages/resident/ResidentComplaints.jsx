/**
 * ResidentComplaints.jsx
 * Route: /resident/complaints
 *
 * Displays a list of the resident's complaints.
 * Uses mock data — replace with API call to /api/resident/complaints later.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, AlertCircle, Clock, Wrench, CheckCircle2 } from 'lucide-react';
import Button from '../../components/Button.jsx';

// ── Mock Data ──────────────────────────────────────────────────────────────
// Replace with: const complaints = await residentComplaintsApi.getMyComplaints()
export const MOCK_COMPLAINTS = [
  {
    id: 'CMP-1024',
    title: 'Water leakage in bathroom',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-07-30',
    description: 'Water dripping constantly from the ceiling of the bathroom near the shower area.',
  },
  {
    id: 'CMP-1021',
    title: 'Lift not working',
    category: 'Lift',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-29',
    description: 'Lift B in Wing A has been non-operational since morning. Maintenance team informed.',
  },
  {
    id: 'CMP-1018',
    title: 'Parking issue near gate',
    category: 'Parking',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2026-07-27',
    description: 'Unauthorized vehicle blocking resident parking slot #A-12 repeatedly.',
  },
  {
    id: 'CMP-1015',
    title: 'Street lights not working',
    category: 'Electrical',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-24',
    description: 'Three street lights near the east gate are not working since last week.',
  },
  {
    id: 'CMP-1010',
    title: 'Common area cleaning issue',
    category: 'Cleaning',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '2026-07-20',
    description: 'Lobby area on 3rd floor not cleaned regularly.',
  },
  {
    id: 'CMP-1005',
    title: 'Gate security concern',
    category: 'Security',
    priority: 'HIGH',
    status: 'RESOLVED',
    createdAt: '2026-07-15',
    description: 'Security guard not present during night hours on weekends.',
  },
];

// ── Status Config ─────────────────────────────────────────────────────────
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
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
    icon: CheckCircle2,
  },
};

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', className: 'text-red-600 bg-red-50 border border-red-200' },
  MEDIUM: { label: 'Medium', className: 'text-amber-600 bg-amber-50 border border-amber-200' },
  LOW: { label: 'Low', className: 'text-emerald-600 bg-emerald-50 border border-emerald-200' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ResidentComplaints() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter logic (ready to replace with API-filtered results)
  const filtered = MOCK_COMPLAINTS.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Complaints</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and manage complaints you have raised.
          </p>
        </div>
        <Button
          onClick={() => navigate('/resident/complaints/new')}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Raise Complaint
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, ID, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No complaints found</h3>
          <p className="text-sm text-slate-400 mb-5">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filter.'
              : "You haven't raised any complaints yet."}
          </p>
          {!search && statusFilter === 'ALL' && (
            <Button onClick={() => navigate('/resident/complaints/new')}>
              <Plus className="w-4 h-4 mr-1.5" />
              Raise Your First Complaint
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Table for md+ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-indigo-600 font-semibold mb-0.5">
                        {complaint.id}
                      </p>
                      <p className="font-medium text-slate-800 leading-snug">{complaint.title}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{complaint.category}</td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-md px-2.5 py-1 transition-colors"
                        title="View details"
                        aria-label={`View details for ${complaint.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for mobile */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((complaint) => (
              <div key={complaint.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-indigo-600 font-semibold">{complaint.id}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{complaint.title}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-slate-500">{complaint.category}</span>
                  <PriorityBadge priority={complaint.priority} />
                  <span className="text-xs text-slate-400">{formatDate(complaint.createdAt)}</span>
                </div>
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md px-2.5 py-1 transition-colors hover:bg-indigo-50"
                  aria-label={`View details for ${complaint.id}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {MOCK_COMPLAINTS.length} complaints
        </p>
      )}
    </div>
  );
}
