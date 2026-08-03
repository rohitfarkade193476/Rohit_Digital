import React from 'react';
import { CheckCircle2, XCircle, PlayCircle, Timer, Clock } from 'lucide-react';
import { ASSIGNMENT_STATUS_LABELS } from '../../lib/format.js';

const CONFIG = {
  ASSIGNED: {
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  ACCEPTED: {
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: PlayCircle,
  },
  IN_PROGRESS: {
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Timer,
  },
  COMPLETED: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
  },
};

export default function AssignmentStatusBadge({ status }) {
  const config = CONFIG[status] || CONFIG.ASSIGNED;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {ASSIGNMENT_STATUS_LABELS[status] || status}
    </span>
  );
}
