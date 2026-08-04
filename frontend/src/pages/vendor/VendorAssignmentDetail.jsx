import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  User,
  Home,
  Phone,
  Mail,
  Building2,
  UserCheck,
} from 'lucide-react';
import {
  getMyAssignmentById,
  updateMyAssignmentStatus,
} from '../../lib/assignmentApi.js';
import {
  formatDateTime,
  ASSIGNMENT_STATUS_LABELS,
} from '../../lib/format.js';
import AssignmentStatusBadge from '../../components/vendor/AssignmentStatusBadge.jsx';
import StatusTimeline from '../../components/complaints/StatusTimeline.jsx';

export default function VendorAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAssignment = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getMyAssignmentById(id);
      setAssignment(data.data || null);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load assignment'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const handleStatusChange = async (status) => {
    if (!assignment || isUpdating) return;
    setActionError('');
    setSuccessMessage('');
    setIsUpdating(true);
    try {
      const data = await updateMyAssignmentStatus(assignment.id, status);
      setAssignment(data.data || assignment);
      setSuccessMessage(
        `Assignment marked as ${ASSIGNMENT_STATUS_LABELS[status] || status}.`
      );
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchAssignment();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || 'Could not update assignment status.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading assignment…
      </div>
    );
  }

  if (fetchError || !assignment) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">
          {fetchError || 'Assignment not found'}
        </p>
        <button
          onClick={() => navigate('/vendor/assignments')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>
      </div>
    );
  }

  const complaint = assignment.complaint || {};
  const resident = complaint.resident || null;
  const currentStatus = assignment.status;

  const getActions = () => {
    switch (currentStatus) {
      case 'ASSIGNED':
        return [
          {
            label: 'Accept Assignment',
            icon: CheckCircle2,
            className:
              'bg-emerald-600 hover:bg-emerald-700 text-white',
            status: 'ACCEPTED',
          },
          {
            label: 'Decline',
            icon: XCircle,
            className:
              'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
            status: 'CANCELLED',
          },
        ];
      case 'ACCEPTED':
        return [
          {
            label: 'Start Work',
            icon: Play,
            className: 'bg-blue-600 hover:bg-blue-700 text-white',
            status: 'IN_PROGRESS',
          },
          {
            label: 'Cancel',
            icon: XCircle,
            className:
              'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
            status: 'CANCELLED',
          },
        ];
      case 'IN_PROGRESS':
        return [
          {
            label: 'Mark as Completed',
            icon: CheckCircle2,
            className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            status: 'COMPLETED',
          },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/vendor/assignments')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>
        <AssignmentStatusBadge status={currentStatus} />
      </div>

      {actionError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Complaint Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Assignment Details
          </span>
          <span className="font-mono text-xs font-bold text-purple-600">
            #{assignment.id.slice(0, 8)}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 leading-snug">
          {complaint.title}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {complaint.category} • Priority{' '}
          {(complaint.priority || 'MEDIUM').toLowerCase().replace(/_/g, ' ')}
        </p>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          {complaint.description || 'No detailed description provided.'}
        </p>
      </div>

      {/* Society & Resident */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            Society
          </h3>
          <p className="text-sm font-bold text-slate-900">
            {assignment.society?.name || 'Housing Society'}
          </p>
          {assignment.society?.societyCode && (
            <p className="text-xs text-slate-500 font-mono">
              Code: {assignment.society.societyCode}
            </p>
          )}
          {assignment.assignedBy?.name && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Assigned by {assignment.assignedBy.name}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Resident Contact
          </h3>
          {resident ? (
            <>
              <div className="flex items-center gap-2.5 text-sm text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{resident.name}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700">
                <Home className="w-4 h-4 text-slate-400" />
                <span>
                  Flat {resident.flatNumber}
                  {resident.wing ? `, ${resident.wing} Wing` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{resident.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{resident.email || '—'}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Resident details not available.
            </p>
          )}
        </div>
      </div>

      {/* Flipkart-Style Status Tracking Timeline */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Complaint Status Tracking Timeline
        </h3>
        <StatusTimeline
          history={complaint.statusHistory || []}
          currentStatus={complaint.status || assignment.status}
          assignedVendor={assignment.vendor}
          isLoading={false}
        />
      </div>

      {/* Status Actions */}
      {actions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-wrap items-center justify-end gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.status}
                onClick={() => handleStatusChange(action.status)}
                disabled={isUpdating}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${action.className}`}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
