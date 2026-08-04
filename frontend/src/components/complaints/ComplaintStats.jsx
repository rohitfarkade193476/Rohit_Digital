import React from 'react';
import { AlertCircle, Clock, Wrench, CheckCircle2 } from 'lucide-react';

export default function ComplaintStats({ complaints = [] }) {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'OPEN' || c.status === 'REOPENED').length;
  const inProgress = complaints.filter((c) => c.status === 'ASSIGNED' || c.status === 'ACCEPTED' || c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      title: 'Total Complaints',
      value: total,
      description: 'Logged in society',
      icon: AlertCircle,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Open Complaints',
      value: open,
      description: 'Awaiting assignment',
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      title: 'In Progress',
      value: inProgress,
      description: 'Currently being handled',
      icon: Wrench,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      title: 'Resolved / Closed',
      value: resolved,
      description: `${resolutionRate}% resolution rate`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stat.value}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
