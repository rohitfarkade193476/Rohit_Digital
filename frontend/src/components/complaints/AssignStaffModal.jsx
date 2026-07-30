import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

export default function AssignStaffModal({
  isOpen,
  onClose,
  complaint,
  staffList = [],
  onAssign,
}) {
  const [selectedStaffName, setSelectedStaffName] = useState('');

  useEffect(() => {
    if (complaint?.assignedStaff) {
      setSelectedStaffName(complaint.assignedStaff);
    } else if (staffList.length > 0) {
      setSelectedStaffName(staffList[0].name || staffList[0]);
    }
  }, [complaint, staffList, isOpen]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAssign && selectedStaffName) {
      onAssign(complaint.id, selectedStaffName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Assign Staff Member</h2>
              <p className="text-xs text-slate-500 font-mono">
                {complaint.ticketId || complaint.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600">
              Select a staff member to take responsibility for fixing{' '}
              <span className="font-semibold text-slate-800">&ldquo;{complaint.title}&rdquo;</span>.
            </p>

            {/* Select Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Choose Staff Member *
              </label>
              <select
                value={selectedStaffName}
                onChange={(e) => setSelectedStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {staffList.map((st) => {
                  const staffName = st.name || st;
                  const role = st.role ? ` (${st.role})` : '';
                  return (
                    <option key={st.id || staffName} value={staffName}>
                      {staffName}{role}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStaffName}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Assign Staff</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
