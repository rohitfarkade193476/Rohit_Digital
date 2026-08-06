import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Eye,
  AlertCircle,
  PlayCircle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import StatusTimeline from '../../components/complaints/StatusTimeline.jsx';
import ComplaintDetailsDrawer from '../../components/complaints/ComplaintDetailsDrawer.jsx';
import ResolveComplaintModal from '../../components/complaints/ResolveComplaintModal.jsx';
import { getComplaints, getComplaintById, changeComplaintStatus } from '../../lib/complaintApi.js';

const INITIAL_ASSIGNED_COMPLAINTS = [
  {
    id: 'CMP-2038',
    title: 'Main gate intercom connection lost',
    residentName: 'Priya Patel',
    flatNumber: 'B-104',
    residentPhone: '+91 98234 56789',
    category: 'Electrical',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-31T10:30:00Z',
    description:
      'Intercom unit display flashes red and no audio is transmitted to gate security guard.',
    statusHistory: [
      { id: 'h1', status: 'OPEN', note: 'Complaint created', createdAt: '2026-07-31T10:30:00Z' },
      { id: 'h2', status: 'ASSIGNED', note: 'Assigned to Staff (Electrical team)', createdAt: '2026-07-31T11:00:00Z' },
      { id: 'h3', status: 'ACCEPTED', note: 'Staff accepted work order', createdAt: '2026-07-31T11:15:00Z' },
      { id: 'h4', status: 'IN_PROGRESS', note: 'Technician on-site inspecting wiring', createdAt: '2026-07-31T12:00:00Z' },
    ],
  },
  {
    id: 'CMP-2041',
    title: 'Water pressure low in Wing A riser',
    residentName: 'Rahul Sharma',
    flatNumber: 'A-302',
    residentPhone: '+91 98123 45678',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'ASSIGNED',
    createdAt: '2026-08-01T09:15:00Z',
    description:
      'Main vertical pipeline valve seems choked. Needs pressure check on 3rd floor riser.',
    statusHistory: [
      { id: 'h10', status: 'OPEN', note: 'Complaint created', createdAt: '2026-08-01T09:15:00Z' },
      { id: 'h11', status: 'ASSIGNED', note: 'Assigned to Plumbing Staff', createdAt: '2026-08-01T09:45:00Z' },
    ],
  },
  {
    id: 'CMP-2029',
    title: 'Clubhouse light fixture broken',
    residentName: 'Sneha Kulkarni',
    flatNumber: 'B-403',
    residentPhone: '+91 98555 12345',
    category: 'General',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '2026-07-29T14:00:00Z',
    description: 'Replaced ceiling LED tube in badminton court.',
    statusHistory: [
      { id: 'h20', status: 'OPEN', note: 'Complaint created', createdAt: '2026-07-29T14:00:00Z' },
      { id: 'h21', status: 'ASSIGNED', note: 'Assigned to Staff', createdAt: '2026-07-29T14:30:00Z' },
      { id: 'h22', status: 'ACCEPTED', note: 'Accepted', createdAt: '2026-07-29T15:00:00Z' },
      { id: 'h23', status: 'IN_PROGRESS', note: 'Work started', createdAt: '2026-07-29T15:30:00Z' },
      { id: 'h24', status: 'RESOLVED', note: 'Work completed by staff', createdAt: '2026-07-29T17:00:00Z' },
    ],
  },
];

export default function StaffAssignedComplaints() {
  const [searchParams] = useSearchParams();
  const deepLinkComplaintId = searchParams.get('complaint');
  const [complaints, setComplaints] = useState(INITIAL_ASSIGNED_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);

  // Attempt to load live backend complaints if available
  useEffect(() => {
    async function loadLiveComplaints() {
      try {
        const res = await getComplaints({ page: 1, limit: 100 });
        if (res?.data?.complaints && res.data.complaints.length > 0) {
          setComplaints(res.data.complaints);
        }
      } catch (err) {
        // Fallback to initial assigned mock complaints
      }
    }
    loadLiveComplaints();
  }, []);

  // Deep link from a notification: open the exact assigned complaint/work in
  // the drawer. Uses the backend (assigned-complaint scoped) when available.
  useEffect(() => {
    if (!deepLinkComplaintId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getComplaintById(deepLinkComplaintId);
        if (!cancelled && res?.data) {
          const c = res.data;
          setComplaints((prev) =>
            prev.some((x) => x.id === c.id) ? prev : [c, ...prev]
          );
          setSelectedComplaint(c);
          setDrawerOpen(true);
        }
      } catch {
        // Not accessible to this user — do not open the drawer.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deepLinkComplaintId]);

  const filtered = complaints.filter((c) => {
    const titleStr = c.title || '';
    const idStr = c.id || '';
    const resStr = c.residentName || c.resident || '';
    const matchSearch =
      !searchTerm ||
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (complaintId, nextStatus, defaultNote) => {
    try {
      await changeComplaintStatus(complaintId, nextStatus, defaultNote);
    } catch (err) {
      console.log('Backend staff transition fallback used:', err?.message);
    }

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newHistory = [
            ...(c.statusHistory || []),
            {
              id: `hist-${Date.now()}`,
              status: nextStatus,
              note: defaultNote,
              createdAt: new Date().toISOString(),
              changedBy: { name: 'Staff User', role: 'STAFF' },
            },
          ];
          return { ...c, status: nextStatus, statusHistory: newHistory };
        }
        return c;
      })
    );

    setToastMessage(`Complaint ${complaintId} updated to ${nextStatus.replace('_', ' ')}.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenResolveModal = (c) => {
    setResolvingComplaint(c);
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = (complaintId, resolutionData) => {
    setResolveModalOpen(false);
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const newHistory = [
            ...(c.statusHistory || []),
            {
              id: `hist-${Date.now()}`,
              status: 'RESOLVED',
              note: resolutionData.resolutionNote,
              createdAt: new Date().toISOString(),
              changedBy: { name: 'Staff User', role: 'STAFF' },
            },
          ];
          return {
            ...c,
            status: 'RESOLVED',
            resolutionImage: resolutionData.imagePreviewUrl,
            afterImageUrl: resolutionData.afterImageUrl || resolutionData.imagePreviewUrl,
            resolutionNote: resolutionData.resolutionNote,
            statusHistory: newHistory,
          };
        }
        return c;
      })
    );
    setToastMessage(`Complaint ${complaintId} resolved with evidence.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const openComplaintDrawer = (c) => {
    setSelectedComplaint(c);
    setDrawerOpen(true);
  };

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

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job ID, title or resident..."
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
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Complaint ID & Title</th>
                <th className="px-6 py-3.5">Resident Details</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-600 block">{c.id}</span>
                    <span
                      onClick={() => openComplaintDrawer(c)}
                      className="font-bold text-slate-900 block mt-0.5 hover:text-indigo-600 cursor-pointer"
                    >
                      {c.title}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-1">{c.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 block">
                      {c.residentName || c.resident}
                    </span>
                    <span className="text-xs text-slate-400">
                      {c.flatNumber ? `Flat ${c.flatNumber}` : c.residentPhone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    ) : c.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Wrench className="w-3 h-3" /> In Progress
                      </span>
                    ) : c.status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <CheckCircle className="w-3 h-3" /> Accepted
                      </span>
                    ) : c.status === 'ASSIGNED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Clock className="w-3 h-3" /> Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Contextual Action Buttons for Staff */}
                      {c.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'ACCEPTED', 'Staff accepted job order')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                      )}
                      {c.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'IN_PROGRESS', 'Staff started work')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Start Work
                        </button>
                      )}
                      {c.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleOpenResolveModal(c)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Resolve Complaint
                        </button>
                      )}

                      <button
                        onClick={() => openComplaintDrawer(c)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View Status Timeline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail & Status Timeline Drawer */}
      <ComplaintDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        complaint={selectedComplaint}
        onResolve={handleResolveSubmit}
      />

      {/* Resolve Complaint Modal */}
      <ResolveComplaintModal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        complaint={resolvingComplaint}
        onResolve={handleResolveSubmit}
      />
    </div>
  );
}
