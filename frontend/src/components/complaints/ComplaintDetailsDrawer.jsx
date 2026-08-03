import React from 'react';
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
} from 'lucide-react';
import { formatDateTime } from '../../lib/format.js';

export default function ComplaintDetailsDrawer({
  isOpen,
  onClose,
  complaint,
  onAssignVendorClick,
  assignments,
  assignmentError,
  isLoadingAssignments,
}) {
  if (!isOpen || !complaint) return null;

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
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">RESOLVED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
    }
  };

  const canAssign =
    complaint.status === 'OPEN' ||
    complaint.status === 'IN_PROGRESS';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {complaint.id.slice(0, 8)}
              </span>
              <div className="flex items-center gap-2">
                {getPriorityBadge(complaint.priority)}
                {getStatusBadge(complaint.status)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-700">
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

            {/* Assigned Vendor */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Assigned Vendor
              </p>
              {complaint.assignedVendor ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {complaint.assignedVendor.companyName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {complaint.assignedVendor.category}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No vendor assigned
                </p>
              )}
            </div>

            {/* Assignment History */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assignment History
              </h3>

              {assignmentError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {assignmentError}
                </p>
              )}

              {isLoadingAssignments ? (
                <p className="text-xs text-slate-400">
                  Loading assignment history…
                </p>
              ) : !assignments || assignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No vendor has been assigned to this complaint yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">
                          {a.vendor?.companyName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {a.status}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        Assigned {formatDateTime(a.assignedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => onAssignVendorClick && onAssignVendorClick(complaint)}
              disabled={!canAssign}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={canAssign ? 'Assign an external vendor' : 'Vendor can only be assigned to open or in-progress complaints'}
            >
              <Wrench className="w-4 h-4" />
              <span>Assign Vendor</span>
            </button>

            {complaint.assignedVendor && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vendor assigned: {complaint.assignedVendor.companyName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
