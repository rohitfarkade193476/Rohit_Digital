import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, AlertCircle, Clock, Wrench, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import Button from '../../components/Button.jsx';
import ComplaintDetailsDrawer from '../../components/complaints/ComplaintDetailsDrawer.jsx';
import { getComplaints, getComplaintById } from '../../lib/complaintApi.js';

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: AlertCircle,
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
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
  REOPENED: {
    label: 'Reopened',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    icon: RotateCcw,
  },
};

const PRIORITY_CONFIG = {
  EMERGENCY: { label: 'Emergency', className: 'text-rose-700 bg-rose-50 border border-rose-200 font-bold' },
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
  const [searchParams] = useSearchParams();
  const deepLinkComplaintId = searchParams.get('complaint');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected complaint for drawer
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page: 1, limit: 100 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await getComplaints(params);
      setComplaints(data?.data?.complaints ?? []);
      setTotal(data?.data?.total ?? 0);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Failed to load complaints. Please try again.';
      setError(message);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Deep link from a notification: open the exact complaint in the drawer.
  useEffect(() => {
    if (!deepLinkComplaintId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getComplaintById(deepLinkComplaintId);
        if (!cancelled && res?.data) {
          setSelectedComplaint(res.data);
          setIsDrawerOpen(true);
        }
      } catch {
        // Not accessible to this user — do not open the drawer.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deepLinkComplaintId]);

  const handleOpenDetails = async (c) => {
    setSelectedComplaint(c);
    setIsDrawerOpen(true);
    // Fetch full complaint with updated history if available
    try {
      const res = await getComplaintById(c.id);
      if (res?.data) {
        setSelectedComplaint(res.data);
      }
    } catch (err) {
      // Use existing cached data if fetch fails
    }
  };

  const handleStatusUpdated = async () => {
    await fetchComplaints();
    if (selectedComplaint) {
      try {
        const res = await getComplaintById(selectedComplaint.id);
        if (res?.data) setSelectedComplaint(res.data);
      } catch (e) {}
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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
          className="shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Raise Complaint
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
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
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex flex-col items-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading complaints…</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">Something went wrong</h3>
          <p className="text-sm text-red-500 mb-5">{error}</p>
          <Button variant="outline" onClick={fetchComplaints}>
            Try Again
          </Button>
        </div>
      )}

      {/* Complaints List */}
      {!isLoading && !error && (
        filtered.length === 0 ? (
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
            {/* Table layout for md+ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
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
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((complaint) => (
                    <tr
                      key={complaint.id}
                      onClick={() => handleOpenDetails(complaint)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-indigo-600 font-semibold mb-0.5">
                          {complaint.id.slice(0, 8)}…
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
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(complaint);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Track Status
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
                <div
                  key={complaint.id}
                  onClick={() => handleOpenDetails(complaint)}
                  className="p-4 space-y-2 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-indigo-600 font-semibold">{complaint.id.slice(0, 8)}…</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{complaint.title}</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">{complaint.category}</span>
                      <PriorityBadge priority={complaint.priority} />
                      <span className="text-xs text-slate-400">{formatDate(complaint.createdAt)}</span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Details
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Result count */}
      {!isLoading && !error && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {total} complaints
        </p>
      )}

      {/* Complaint Detail & Status Timeline Drawer */}
      <ComplaintDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        complaint={selectedComplaint}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
