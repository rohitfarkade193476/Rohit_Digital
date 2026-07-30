import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Home,
  Wrench,
  Building2,
  Send,
  UserPlus,
  CheckCircle,
  Paperclip,
  Clock,
  Tag
} from 'lucide-react';
import StatusTimeline from './StatusTimeline.jsx';

export default function ComplaintDetailsDrawer({
  isOpen,
  onClose,
  complaint,
  onAssignStaffClick,
  onAssignVendorClick,
  onCloseComplaintClick,
  onAddComment,
}) {
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !complaint) return null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onAddComment) {
      onAddComment(complaint.id, newComment.trim());
    }
    setNewComment('');
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {complaint.ticketId || complaint.id}
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
                <Clock className="w-3.5 h-3.5" /> Logged on {complaint.createdDate}
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

            {/* Status Timeline */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <StatusTimeline
                currentStatus={complaint.status}
                timelineData={complaint.timeline || []}
              />
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
                  <span>Flat {complaint.flatNumber}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 text-xs font-mono">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{complaint.residentPhone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 text-xs">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{complaint.residentEmail || 'resident@society.com'}</span>
                </div>
              </div>
            </div>

            {/* Attached Images */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" />
                Attached Images
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(complaint.images || [1, 2]).map((img, idx) => (
                  <div
                    key={idx}
                    className="h-24 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-slate-400 hover:border-indigo-400 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center mb-1">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 truncate w-full">
                      Photo_{idx + 1}.jpg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Personnel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assigned Staff */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Assigned Staff
                </p>
                {complaint.assignedStaff ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {complaint.assignedStaff.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{complaint.assignedStaff}</p>
                      <p className="text-xs text-slate-400">Society Maintenance Staff</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No staff member assigned</p>
                )}
              </div>

              {/* Assigned Vendor */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Assigned Vendor
                </p>
                {complaint.assignedVendor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{complaint.assignedVendor}</p>
                      <p className="text-xs text-slate-400">External Vendor Company</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No vendor assigned</p>
                )}
              </div>
            </div>

            {/* Comments & Activity Section */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Comments & Activity
              </h3>

              {/* Existing Comments Thread */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {(complaint.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No comments yet.</p>
                ) : (
                  complaint.comments.map((cmt, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{cmt.author || 'Society Admin'}</span>
                        <span className="text-slate-400 text-[10px]">{cmt.date || 'Just now'}</span>
                      </div>
                      <p className="text-slate-600">{cmt.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Add a comment or internal note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Assign Staff */}
              <button
                onClick={() => onAssignStaffClick && onAssignStaffClick(complaint)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign Staff</span>
              </button>

              {/* Assign Vendor */}
              <button
                onClick={() => onAssignVendorClick && onAssignVendorClick(complaint)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Assign Vendor</span>
              </button>
            </div>

            {/* Close Complaint */}
            {complaint.status !== 'CLOSED' && (
              <button
                onClick={() => onCloseComplaintClick && onCloseComplaintClick(complaint)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Close Complaint</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
