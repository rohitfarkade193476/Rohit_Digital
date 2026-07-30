import React from 'react';
import { Users, UserCheck, Key, UserX } from 'lucide-react';

export default function ResidentStats({ residents = [] }) {
  const total = residents.length;
  const owners = residents.filter((r) => r.residentType === 'Owner' || r.residentType === 'OWNER').length;
  const tenants = residents.filter((r) => r.residentType === 'Tenant' || r.residentType === 'TENANT').length;
  const inactive = residents.filter((r) => r.status === 'INACTIVE' || r.status === 'Inactive').length;

  const ownerPercentage = total > 0 ? Math.round((owners / total) * 100) : 0;
  const tenantPercentage = total > 0 ? Math.round((tenants / total) * 100) : 0;

  const stats = [
    {
      title: 'Total Residents',
      value: total,
      description: 'Registered in society',
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Owners',
      value: owners,
      description: `${ownerPercentage}% of total residents`,
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Tenants',
      value: tenants,
      description: `${tenantPercentage}% of total residents`,
      icon: Key,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      title: 'Inactive Residents',
      value: inactive,
      description: 'Moved out / Deactivated',
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
