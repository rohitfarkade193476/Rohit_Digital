import React from 'react';
import { Clock, CheckCircle2, XCircle, Unplug } from 'lucide-react';

const CONFIG = {
  PENDING: {
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Pending',
  },
  ACCEPTED: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    label: 'Connected',
  },
  REJECTED: {
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Rejected',
  },
  REMOVED: {
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: Unplug,
    label: 'Removed',
  },
};

export default function ConnectionStatusBadge({ status }) {
  const config = CONFIG[status] || CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
