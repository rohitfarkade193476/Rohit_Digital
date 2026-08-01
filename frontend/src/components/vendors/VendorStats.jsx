import React from 'react';
import { Briefcase, UserCheck, Mail, AlertTriangle } from 'lucide-react';

export default function VendorStats({ vendorList = [] }) {
  const total = vendorList.length;
  const active = vendorList.filter((v) => v.status === 'ACTIVE').length;
  const invited = vendorList.filter((v) => v.status === 'INVITED' || v.invitationStatus === 'Pending').length;
  const inactive = vendorList.filter((v) => v.status === 'INACTIVE').length;

  const statCards = [
    {
      title: 'Total Vendors',
      value: total,
      subtext: 'Contracted service partners',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Active Vendors',
      value: active,
      subtext: 'Available for work assignment',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Pending Invitations',
      value: invited,
      subtext: 'Invitation email sent',
      icon: Mail,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Inactive / Suspended',
      value: inactive,
      subtext: 'Access currently paused',
      icon: AlertTriangle,
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
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
