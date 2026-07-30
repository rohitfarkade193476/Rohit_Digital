import React from 'react';
import { PlusCircle, UserCheck, Wrench, CheckCircle2, Lock } from 'lucide-react';

export default function StatusTimeline({ currentStatus = 'OPEN', timelineData = [] }) {
  const STATUS_STEPS = [
    { key: 'CREATED', label: 'Created', icon: PlusCircle },
    { key: 'ASSIGNED', label: 'Assigned', icon: UserCheck },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
    { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
    { key: 'CLOSED', label: 'Closed', icon: Lock },
  ];

  // Map status to active index level
  const getStepIndex = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'OPEN':
        return 0; // Created
      case 'ASSIGNED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'RESOLVED':
        return 3;
      case 'CLOSED':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="py-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
        Status Timeline
      </h4>
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0" />

        {/* Progress connector line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
          style={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />

        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          // Find custom timeline event data if available
          const eventInfo = timelineData.find(
            (t) => (t.step || t.key || '').toUpperCase() === step.key
          );

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              {/* Step Circle Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-100'
                      : 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Label & Subtitle */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-indigo-600'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {eventInfo?.time && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {eventInfo.time}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
