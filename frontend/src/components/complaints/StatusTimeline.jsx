import React from 'react';
import {
  Clock,
  UserPlus,
  CheckCircle,
  PlayCircle,
  CheckCircle2,
  Lock,
  RotateCcw,
  Check,
  Circle,
  UserCheck,
} from 'lucide-react';
import { COMPLAINT_STATUS_LABELS, formatDateTime } from '../../lib/format.js';

// Status icons configuration
const STATUS_ICONS = {
  OPEN: Clock,
  ASSIGNED: UserPlus,
  ACCEPTED: CheckCircle,
  IN_PROGRESS: PlayCircle,
  RESOLVED: CheckCircle2,
  CLOSED: Lock,
  REOPENED: RotateCcw,
};

// Custom human-readable labels for Flipkart-style tracking
const DISPLAY_LABELS = {
  OPEN: 'Complaint Created',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

// Standard lifecycle flow
const STANDARD_FLOW = [
  'OPEN',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

/**
 * Flipkart-style Vertical Status Timeline for Complaint Lifecycle Tracking
 *
 * @param {object} props
 * @param {Array<{ id?: string, status: string, note?: string|null, createdAt?: string, changedBy?: { name?: string, role?: string }|null }>} props.history
 * @param {string} [props.currentStatus] - Current complaint status
 * @param {object} [props.assignedVendor] - Active assigned vendor info
 * @param {boolean} [props.isLoading] - Loading state
 */
export default function StatusTimeline({
  history = [],
  currentStatus = '',
  assignedVendor = null,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="space-y-6 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Derive latest status from history if currentStatus not explicitly passed
  const activeStatus =
    currentStatus || (history.length > 0 ? history[history.length - 1].status : 'OPEN');

  // Build sequence of steps to render
  const renderedSteps = [];

  if (history && history.length > 0) {
    // Add all completed/recorded history entries in chronological order
    history.forEach((entry, index) => {
      const isLatest = index === history.length - 1;
      renderedSteps.push({
        key: entry.id || `history-${index}`,
        status: entry.status,
        label: DISPLAY_LABELS[entry.status] || COMPLAINT_STATUS_LABELS[entry.status] || entry.status,
        timestamp: entry.createdAt,
        note: entry.note,
        changedBy: entry.changedBy,
        state: isLatest ? 'CURRENT' : 'COMPLETED',
      });
    });

    // Check if there are remaining future pending steps after activeStatus
    const currentIndexInFlow = STANDARD_FLOW.indexOf(activeStatus);
    if (currentIndexInFlow !== -1 && activeStatus !== 'CLOSED') {
      const remainingFlow = STANDARD_FLOW.slice(currentIndexInFlow + 1);
      remainingFlow.forEach((st) => {
        renderedSteps.push({
          key: `pending-${st}`,
          status: st,
          label: DISPLAY_LABELS[st] || COMPLAINT_STATUS_LABELS[st] || st,
          timestamp: null,
          note: null,
          changedBy: null,
          state: 'PENDING',
        });
      });
    }
  } else {
    // Fallback if no history passed: construct full linear pipeline with activeStatus highlighted
    const currentIndex = STANDARD_FLOW.indexOf(activeStatus);
    STANDARD_FLOW.forEach((st, idx) => {
      let state = 'PENDING';
      if (idx < currentIndex) state = 'COMPLETED';
      else if (idx === currentIndex) state = 'CURRENT';

      renderedSteps.push({
        key: `default-${st}`,
        status: st,
        label: DISPLAY_LABELS[st] || st,
        timestamp: null,
        note: null,
        changedBy: null,
        state,
      });
    });
  }

  return (
    <div className="py-2">
      <div className="relative pl-1">
        {renderedSteps.map((step, idx) => {
          const isLast = idx === renderedSteps.length - 1;
          const IconComponent = STATUS_ICONS[step.status] || Circle;

          const isCompleted = step.state === 'COMPLETED';
          const isCurrent = step.state === 'CURRENT';
          const isPending = step.state === 'PENDING';

          return (
            <div key={step.key} className="relative flex gap-4 pb-7 last:pb-1 group">
              {/* Connecting Vertical Line */}
              {!isLast && (
                <div
                  className={`absolute left-[13px] top-[26px] bottom-0 w-[2px] ${
                    isCompleted || isCurrent
                      ? 'bg-emerald-500'
                      : 'border-l-2 border-dashed border-slate-200'
                  }`}
                />
              )}

              {/* Step Node Marker */}
              <div className="relative z-10 shrink-0">
                {isCompleted && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {isCurrent && (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-8 w-8 rounded-full bg-indigo-400/40 animate-ping" />
                    <div className="relative w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md ring-4 ring-indigo-100">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {isPending && (
                  <div className="w-7 h-7 rounded-full border-2 border-slate-200 bg-slate-50 text-slate-300 flex items-center justify-center">
                    <Circle className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-semibold tracking-tight ${
                        isCompleted
                          ? 'text-slate-800'
                          : isCurrent
                          ? 'text-indigo-950 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                        Current Status
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  {step.timestamp && (
                    <span
                      className={`text-xs ${
                        isCurrent ? 'font-semibold text-indigo-600' : 'text-slate-500'
                      }`}
                    >
                      {formatDateTime(step.timestamp)}
                    </span>
                  )}
                </div>

                {/* Subtext / Vendor / Note / Actor */}
                {step.status === 'ASSIGNED' && assignedVendor && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100 w-fit">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Assigned to <strong>{assignedVendor.companyName}</strong> ({assignedVendor.category})
                    </span>
                  </div>
                )}

                {step.note && (
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isCurrent
                        ? 'text-slate-700 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100'
                        : 'text-slate-600 bg-slate-50/80 p-2 rounded-md border border-slate-100'
                    }`}
                  >
                    {step.note}
                  </p>
                )}

                {step.changedBy && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <span>by {step.changedBy.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[9px] uppercase tracking-wide">
                      {step.changedBy.role}
                    </span>
                  </p>
                )}

                {isPending && !step.note && (
                  <p className="text-xs text-slate-300 italic mt-0.5">Pending completion</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
