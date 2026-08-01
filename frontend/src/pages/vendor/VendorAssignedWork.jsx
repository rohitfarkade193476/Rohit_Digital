import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Clock, Wrench, Search } from 'lucide-react';

const INITIAL_WORK_ORDERS = [
  {
    id: 'WRK-901',
    service: 'Elevator Monthly AMC Servicing',
    location: 'Block A & B Passenger Lifts',
    dueDate: '2026-08-05',
    status: 'IN_PROGRESS',
    contact: 'Estate Manager (+91 98234 56789)',
    details: 'Full brake inspection, cable lubrication, emergency battery backup check.',
  },
  {
    id: 'WRK-898',
    service: 'Overhead Water Tank Chlorination',
    location: 'Terrace Water Tanks (Wing A, B, C)',
    dueDate: '2026-08-03',
    status: 'PENDING',
    contact: 'Maintenance Super (+91 98345 67890)',
    details: 'Biannual tank washing, sediment removal and water sample lab testing.',
  },
  {
    id: 'WRK-885',
    service: 'Substation Electrical Transformer Inspection',
    location: 'Main Transformer Room',
    dueDate: '2026-07-28',
    status: 'COMPLETED',
    contact: 'Admin Office',
    details: 'Thermal imaging, oil level check, earthing pit resistance test.',
  },
];

export default function VendorAssignedWork() {
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const filtered = workOrders.filter((w) => {
    const matchSearch =
      !searchTerm ||
      w.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    setToastMessage(`Status for work order ${id} updated to ${newStatus}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Assigned Work Orders
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Contracted maintenance service orders assigned to your vendor organization.
        </p>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by work order ID, service or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Order ID & Service</th>
                <th className="px-6 py-3.5">Location & Contact</th>
                <th className="px-6 py-3.5">Target Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Update Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-purple-600 block">{w.id}</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{w.service}</span>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">{w.details}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 block">{w.location}</span>
                    <span className="text-xs text-slate-400">{w.contact}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{w.dueDate}</td>
                  <td className="px-6 py-4">
                    {w.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : w.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Wrench className="w-3 h-3" /> In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {w.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(w.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      {w.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateStatus(w.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Complete Work
                        </button>
                      )}
                      {w.status === 'COMPLETED' && (
                        <span className="text-xs text-slate-400 font-medium">Work Finished</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
