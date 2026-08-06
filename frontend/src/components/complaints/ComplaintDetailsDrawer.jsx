import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Home,
  Wrench,
  Building2,
  Clock,
  Tag,
  CheckCircle2,
  Lock,
  RotateCcw,
  AlertCircle,
  Loader2,
  FileText,
  History,
  Check,
  Shield,
  ThumbsUp,
} from 'lucide-react';
import { formatDateTime } from '../../lib/format.js';
import StatusTimeline from './StatusTimeline.jsx';
import BeforeAfterImages from './BeforeAfterImages.jsx';
import ReopenComplaintModal from './ReopenComplaintModal.jsx';
import AssignComplaintModal from './AssignComplaintModal.jsx';
import ResolveComplaintModal from './ResolveComplaintModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { reopenComplaint, changeComplaintStatus } from '../../lib/complaintApi.js';

export default function ComplaintDetailsDrawer({
  isOpen,
  onClose,
  complaint,
  onAssign,
  onResolve,
  assignments = [],
  assignmentError = '',
  isLoadingAssignments = false,
  onStatusUpdated,
  staffList = [],
  vendorList = [],
  isLoadingStaff = false,
  isLoadingVendors = false,
}) {
  const { user } = useAuth();
  const role = user?.role || 'RESIDENT';

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'timeline'
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isSatisfied, setIsSatisfied] = useState(false);

  if (!isOpen || !complaint) return null;

  const currentStatus = complaint.status || 'OPEN';

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toUpperCase();
    switch (p) {
      case 'EMERGENCY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">EMERGENCY</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">MEDIUM</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">OPEN</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">ASSIGNED</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">ACCEPTED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">RESOLVED</span>;
      case 'REOPENED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">REOPENED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
    }
  };

  // ── Role & Status Action Permissions ─────────────────────────────────────
  const isAdmin = role === 'SOCIETY_ADMIN' || role === 'SUPER_ADMIN';
  const isStaffOrVendor = role === 'STAFF' || role === 'VENDOR';
  const isResident = role === 'RESIDENT';

  const canAssign =
    isAdmin &&
    ['OPEN', 'REOPENED'].includes(currentStatus);

  const canAccept = isStaffOrVendor && currentStatus === 'ASSIGNED';
  const canStartWork = isStaffOrVendor && currentStatus === 'ACCEPTED';
  const canResolve = isStaffOrVendor && currentStatus === 'IN_PROGRESS';

  const canClose = isAdmin && currentStatus === 'RESOLVED';
  const canReopen = isResident && (currentStatus === 'RESOLVED' || currentStatus === 'CLOSED');

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleCloseComplaint = async () => {
    setActionError('');
    setActionSuccess('');
    setIsActionLoading(true);
    try {
      await changeComplaintStatus(complaint.id, 'CLOSED', 'Complaint closed by Society Admin');
      setActionSuccess('Complaint closed successfully.');
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setActionSuccess('Complaint closed successfully.');
      complaint.status = 'CLOSED';
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReopenSubmit = async (reason) => {
    setActionError('');
    setActionSuccess('');
    setIsActionLoading(true);
    try {
      await reopenComplaint(complaint.id, { note: reason });
      setReopenModalOpen(false);
      setActionSuccess('Complaint reopened successfully.');
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setActionSuccess('Complaint reopened successfully.');
      complaint.status = 'REOPENED';
      setReopenModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAssignSubmit = (complaintId, assignmentData) => {
    setAssignModalOpen(false);
    setActionSuccess(
      `Assigned to ${assignmentData.name} (${assignmentData.type}).`
    );
    if (onAssign) {
      onAssign(complaintId, assignmentData);
    } else if (onStatusUpdated) {
      onStatusUpdated();
    }
  };

  const handleResolveSubmit = (complaintId, resolutionData) => {
    setResolveModalOpen(false);
    setActionSuccess('Complaint resolved with evidence uploaded successfully.');
    if (onResolve) {
      onResolve(complaintId, resolutionData);
    } else {
      complaint.status = 'RESOLVED';
      complaint.resolutionImage = resolutionData.imagePreviewUrl;
      complaint.afterImageUrl = resolutionData.afterImageUrl || resolutionData.imagePreviewUrl;
      complaint.resolutionNote = resolutionData.resolutionNote;
      if (onStatusUpdated) onStatusUpdated();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  #{complaint.id.slice(0, 8)}
                </span>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(complaint.priority)}
                  {getStatusBadge(complaint.status)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs: Details vs Timeline */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Complaint Details</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Status Timeline</span>
              </button>
            </div>

            {/* Feedback Notifications */}
            {actionError && (
              <div className="px-6 pt-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              </div>
            )}
            {actionSuccess && (
              <div className="px-6 pt-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              </div>
            )}

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'details' ? (
                <>
                  {/* Title & Description */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {complaint.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Logged on{' '}
                      {formatDateTime(complaint.createdAt)}
                    </p>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      {complaint.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  {/* Category Banner */}
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-700">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    <span>Category: {complaint.category}</span>
                  </div>

                  {/* Resident Info Card */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Resident Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2.5 text-slate-700">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">{complaint.residentName}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-700">
                        <Home className="w-4 h-4 text-slate-400" />
                        <span>
                          Flat {complaint.flatNumber}
                          {complaint.wing ? `, ${complaint.wing} Wing` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 text-xs font-mono">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{complaint.residentPhone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 text-xs">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{complaint.residentEmail || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Staff or Vendor Card */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Assigned Work Partner
                    </p>
                    {complaint.assignedStaff ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {complaint.assignedStaff.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Staff • {complaint.assignedStaff.role || 'Maintenance'}
                          </p>
                        </div>
                      </div>
                    ) : complaint.assignedVendor ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {complaint.assignedVendor.companyName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Vendor • {complaint.assignedVendor.category}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No staff or vendor assigned yet.
                      </p>
                    )}
                  </div>

                  {/* Before / After Resolution Images */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Resolution Evidence & Proof</span>
                    </div>

                    <BeforeAfterImages
                      beforeImage={complaint.imageUrl}
                      afterImage={complaint.afterImageUrl || complaint.resolutionImage}
                    />

                    {(complaint.resolutionNote || currentStatus === 'RESOLVED' || currentStatus === 'CLOSED') && (
                      <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block mb-1">Resolution Note:</span>
                        <p className="leading-relaxed">
                          {complaint.resolutionNote || 'Work completed successfully according to society standards.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assignment History */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Assignment History
                    </h3>

                    {isLoadingAssignments ? (
                      <p className="text-xs text-slate-400">Loading assignment history…</p>
                    ) : !assignments || assignments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No assignment history recorded.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {assignments.map((a) => (
                          <div
                            key={a.id}
                            className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {a.vendor?.companyName || a.staff?.name || 'Assignee'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {a.type === 'STAFF' ? 'Staff' : 'Vendor'} • Assigned {formatDateTime(a.assignedAt)}
                              </span>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* READ-ONLY Flipkart-style Timeline Tab */
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Complete Status History Timeline
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Read-Only</span>
                  </div>

                  <StatusTimeline
                    history={complaint.statusHistory || []}
                    currentStatus={complaint.status}
                    assignedVendor={complaint.assignedVendor || complaint.assignedStaff}
                    isLoading={false}
                  />
                </div>
              )}
            </div>

            {/* Contextual Action Bar (Role + Status Driven) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
              {/* Resident Satisfaction Check Prompt (When CLOSED) */}
              {isResident && currentStatus === 'CLOSED' && (
                <div className="p-3.5 bg-slate-900 text-white rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Are you satisfied with this resolution?
                    </p>
                    {isSatisfied && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Marked Satisfied
                      </span>
                    )}
                  </div>
                  {!isSatisfied && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setIsSatisfied(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Yes, Issue Resolved</span>
                      </button>
                      <button
                        onClick={() => setReopenModalOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>No, Reopen Complaint</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Admin: Dual Assign (Staff or Vendor) */}
                  {canAssign && (
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Assign Staff / Vendor</span>
                    </button>
                  )}

                  {/* Staff / Vendor Actions */}
                  {canAccept && (
                    <button
                      onClick={() => {
                        complaint.status = 'ACCEPTED';
                        setActionSuccess('Job accepted successfully.');
                        if (onStatusUpdated) onStatusUpdated();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Assignment</span>
                    </button>
                  )}

                  {canStartWork && (
                    <button
                      onClick={() => {
                        complaint.status = 'IN_PROGRESS';
                        setActionSuccess('Work started.');
                        if (onStatusUpdated) onStatusUpdated();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {canResolve && (
                    <button
                      onClick={() => setResolveModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolve Complaint</span>
                    </button>
                  )}

                  {/* Admin: Close Complaint */}
                  {canClose && (
                    <button
                      onClick={handleCloseComplaint}
                      disabled={isActionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <span>Close Complaint</span>
                    </button>
                  )}

                  {/* Resident: Reopen Button */}
                  {canReopen && currentStatus === 'RESOLVED' && (
                    <button
                      onClick={() => setReopenModalOpen(true)}
                      disabled={isActionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reopen Complaint</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReopenComplaintModal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        onSubmit={handleReopenSubmit}
        isSubmitting={isActionLoading}
        error={actionError}
      />

      <AssignComplaintModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        complaint={complaint}
        staffList={staffList}
        vendorList={vendorList}
        isLoadingStaff={isLoadingStaff}
        isLoadingVendors={isLoadingVendors}
        onAssign={handleAssignSubmit}
      />

      <ResolveComplaintModal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        complaint={complaint}
        onResolve={handleResolveSubmit}
      />
    </>
  );
}
