import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import StatusTimeline from '../../components/complaints/StatusTimeline.jsx';
import ComplaintDetailsDrawer from '../../components/complaints/ComplaintDetailsDrawer.jsx';
import ResolveComplaintModal from '../../components/complaints/ResolveComplaintModal.jsx';
import {
  getMyStaffAssignments,
  updateMyStaffAssignmentStatus,
} from '../../lib/staffApi.js';
import { resolveImageUrl } from '../../lib/format.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Map the backend StaffAssignment object into a shape compatible with the
 * existing UI (ComplaintDetailsDrawer, StatusTimeline, BeforeAfterImages).
 * The backend wraps the complaint inside assignment.complaint.
 */
function mapAssignmentToDisplay(a) {
  const c = a.complaint || {};
  const resident = c.resident || {};
  return {
    // assignment identifiers kept at top level for action calls
    assignmentId: a.id,
    assignmentStatus: a.status,       // ASSIGNED | ACCEPTED | IN_PROGRESS | COMPLETED | CANCELLED
    assignedAt: a.assignedAt,
    acceptedAt: a.acceptedAt,
    startedAt: a.startedAt,
    completedAt: a.completedAt,
    cancelledAt: a.cancelledAt,
    // complaint fields expected by UI components
    id: c.id,
    title: c.title || '—',
    description: c.description || '',
    category: c.category || '—',
    priority: c.priority || 'MEDIUM',
    status: c.status || 'OPEN',          // complaint status (source of truth for Resident/Admin)
    imageUrl: c.imageUrl || null,
    afterImageUrl: c.afterImageUrl || null,
    // resident / flat
    residentName: resident.name || '—',
    residentPhone: resident.phone || '—',
    residentEmail: resident.email || '—',
    flatNumber: resident.flatNumber || '—',
    wing: resident.wing || '',
    // status timeline — comes from complaint.statusHistory
    statusHistory: c.statusHistory || [],
    // assigned staff info (for display in drawer)
    assignedStaff: a.staff
      ? {
          id: a.staff.id,
          name: a.staff.name,
          role: a.staff.role,
          department: a.staff.department,
        }
      : null,
  };
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StaffAssignedComplaints() {
  const [searchParams] = useSearchParams();
  const deepLinkComplaintId = searchParams.get('complaint');

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolvingItem, setResolvingItem] = useState(null);

  // Per-row action loading (keyed by assignmentId)
  const [actionLoading, setActionLoading] = useState({});
  const [resolveSubmitting, setResolveSubmitting] = useState(false);
  const [resolveError, setResolveError] = useState('');

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchAssignments = useCallback(async () => {
    try {
      setFetchError('');
      const res = await getMyStaffAssignments();
      // Backend returns { success, message, data: [...assignments] }
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.assignments ?? []);
      setAssignments(raw.map(mapAssignmentToDisplay));
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load assignments. Please refresh.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Deep-link from notification: open the specific assignment drawer.
  useEffect(() => {
    if (!deepLinkComplaintId || assignments.length === 0) return;
    const found = assignments.find((a) => a.id === deepLinkComplaintId);
    if (found) {
      setSelectedComplaint(found);
      setDrawerOpen(true);
    }
  }, [deepLinkComplaintId, assignments]);

  // ── Toast helpers ────────────────────────────────────────────────────────────

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ── Action handlers ───────────────────────────────────────────────────────────

  const handleAction = async (item, status) => {
    setActionLoading((prev) => ({ ...prev, [item.assignmentId]: true }));
    try {
      await updateMyStaffAssignmentStatus(item.assignmentId, status, null);
      showToast(
        status === 'ACCEPTED'
          ? `Assignment accepted for "${item.title}".`
          : status === 'CANCELLED'
            ? `Assignment declined for "${item.title}".`
            : status === 'IN_PROGRESS'
              ? `Started work on "${item.title}".`
              : `Status updated to ${status}.`,
      );
      // Re-fetch fresh data from backend — DB is source of truth.
      await fetchAssignments();
    } catch (err) {
      showToast(
        err?.response?.data?.message || `Failed to update status. Please try again.`,
        'error',
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [item.assignmentId]: false }));
    }
  };

  const handleOpenResolveModal = (item) => {
    setResolvingItem(item);
    setResolveError('');
    setResolveModalOpen(true);
  };

  /**
   * Called by ResolveComplaintModal when the user submits.
   * resolutionData = { imageFile, imagePreviewUrl, resolutionNote }
   */
  const handleResolveSubmit = async (complaintId, resolutionData) => {
    if (!resolutionData?.imageFile) {
      setResolveError('An after-resolution image is required.');
      return;
    }
    setResolveSubmitting(true);
    setResolveError('');
    try {
      await updateMyStaffAssignmentStatus(
        resolvingItem.assignmentId,
        'COMPLETED',
        resolutionData.imageFile,
      );
      setResolveModalOpen(false);
      setResolvingItem(null);
      showToast(`Complaint "${resolvingItem.title}" resolved successfully.`);
      // Re-fetch so the UI shows COMPLETED/RESOLVED with the after image.
      await fetchAssignments();
      // If the drawer was open on this complaint, refresh it too.
      if (drawerOpen && selectedComplaint?.id === complaintId) {
        setDrawerOpen(false);
      }
    } catch (err) {
      setResolveError(
        err?.response?.data?.message || 'Failed to submit resolution. Please try again.',
      );
    } finally {
      setResolveSubmitting(false);
    }
  };

  const openComplaintDrawer = (item) => {
    setSelectedComplaint(item);
    setDrawerOpen(true);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────────

  // Filter uses assignmentStatus so staff see their view; the complaint status
  // column shows the complaint lifecycle visible to Resident/Admin.
  const filtered = assignments.filter((a) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      (a.title || '').toLowerCase().includes(search) ||
      (a.id || '').toLowerCase().includes(search) ||
      (a.residentName || '').toLowerCase().includes(search);

    // Status filter applies to ASSIGNMENT status (what Staff see: ASSIGNED/ACCEPTED/IN_PROGRESS/COMPLETED/CANCELLED)
    const matchStatus =
      selectedStatus === 'ALL' || a.assignmentStatus === selectedStatus;

    return matchSearch && matchStatus;
  });

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading your assignments…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Assigned Complaints Directory
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Work orders and maintenance tasks assigned to staff.
        </p>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in duration-200 ${
            toastType === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${toastType === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
          {toastMessage}
        </div>
      )}

      {/* Fetch error */}
      {fetchError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, ID or resident…"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Complaint Title</th>
                <th className="px-6 py-3.5">Resident Details</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Assignment Status</th>
                <th className="px-6 py-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {assignments.length === 0
                      ? 'No assignments yet. The Society Admin will assign complaints to you.'
                      : 'No assignments match your search/filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isRowLoading = !!actionLoading[item.assignmentId];
                  const st = item.assignmentStatus;

                  return (
                    <tr key={item.assignmentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-600 block">
                          {item.id?.slice(0, 8)}
                        </span>
                        <span
                          onClick={() => openComplaintDrawer(item)}
                          className="font-bold text-slate-900 block mt-0.5 hover:text-indigo-600 cursor-pointer"
                        >
                          {item.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-1">
                          {item.description}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block">{item.residentName}</span>
                        <span className="text-xs text-slate-400">
                          {item.flatNumber ? `Flat ${item.flatNumber}${item.wing ? ` · ${item.wing}` : ''}` : item.residentPhone}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <AssignmentStatusBadge status={st} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* ASSIGNED → Accept or Decline */}
                          {st === 'ASSIGNED' && (
                            <>
                              <button
                                onClick={() => handleAction(item, 'ACCEPTED')}
                                disabled={isRowLoading}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                {isRowLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                Accept
                              </button>
                              <button
                                onClick={() => handleAction(item, 'CANCELLED')}
                                disabled={isRowLoading}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {/* ACCEPTED → Start Work */}
                          {st === 'ACCEPTED' && (
                            <button
                              onClick={() => handleAction(item, 'IN_PROGRESS')}
                              disabled={isRowLoading}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {isRowLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Start Work
                            </button>
                          )}

                          {/* IN_PROGRESS → Resolve (opens modal requiring after-image) */}
                          {st === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleOpenResolveModal(item)}
                              disabled={isRowLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Resolve Complaint
                            </button>
                          )}

                          {/* View detail button */}
                          <button
                            onClick={() => openComplaintDrawer(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Details & Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail & Status Timeline Drawer */}
      <ComplaintDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        complaint={selectedComplaint}
        onStatusUpdated={fetchAssignments}
      />

      {/* Resolve Complaint Modal — requires after-image upload */}
      <ResolveComplaintModal
        isOpen={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setResolveError('');
        }}
        complaint={resolvingItem}
        onResolve={handleResolveSubmit}
        isSubmitting={resolveSubmitting}
        error={resolveError}
      />
    </div>
  );
}

// ─── Sub-component: assignment status badge ───────────────────────────────────

function AssignmentStatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Wrench className="w-3 h-3" /> In Progress
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle className="w-3 h-3" /> Accepted
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Clock className="w-3 h-3" /> Assigned
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}
