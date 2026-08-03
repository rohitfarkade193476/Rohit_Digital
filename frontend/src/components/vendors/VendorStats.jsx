import React from 'react';
import { Briefcase, UserCheck, CheckCircle2, Tag } from 'lucide-react';

export default function VendorStats({ vendorList = [], total = 0 }) {
  const active = vendorList.filter((v) => v.status === 'ACTIVE').length;
  const available = vendorList.filter((v) => v.isAvailable).length;
  const categories = new Set(
    vendorList.map((v) => v.category).filter(Boolean)
  ).size;

  const statCards = [
    {
      title: 'Total Partners',
      value: total,
      subtext: 'Registered service partners',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Active Partners',
      value: active,
      subtext: 'Activated on the platform',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Available Now',
      value: available,
      subtext: 'Ready for work assignment',
      icon: CheckCircle2,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Service Categories',
      value: categories,
      subtext: 'Across current results',
      icon: Tag,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.subtext}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
