import React from 'react';
import { UserCog, CheckCircle2, Mail, UserX } from 'lucide-react';

export default function StaffStats({ staffList = [] }) {
  const total = staffList.length;
  const active = staffList.filter((s) => s.status === 'ACTIVE' || s.status === 'Active').length;
  const pending = staffList.filter(
    (s) => s.status === 'INVITED' || s.invitationStatus === 'Pending' || s.invitationStatus === 'PENDING'
  ).length;
  const inactive = staffList.filter((s) => s.status === 'INACTIVE' || s.status === 'Inactive').length;

  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

  const stats = [
    {
      title: 'Total Staff',
      value: total,
      description: 'Registered staff members',
      icon: UserCog,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Active Staff',
      value: active,
      description: `${activePercentage}% active staff rate`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Pending Invitations',
      value: pending,
      description: 'Awaiting email acceptance',
      icon: Mail,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      title: 'Inactive Staff',
      value: inactive,
      description: 'Deactivated / Relieved',
      icon: UserX,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
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
