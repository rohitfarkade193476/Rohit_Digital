import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Clock, Wrench, Search, Filter } from 'lucide-react';

const INITIAL_ASSIGNED_COMPLAINTS = [
  {
    id: 'CMP-2038',
    title: 'Main gate intercom connection lost',
    resident: 'Priya Patel (Flat B-104)',
    phone: '+91 98234 56789',
    category: 'Electrical',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedDate: '2026-07-31',
    description: 'Intercom unit display flashes red and no audio is transmitted to gate security guard.',
  },
  {
    id: 'CMP-2041',
    title: 'Water pressure low in Wing A riser',
    resident: 'Rahul Sharma (Flat A-302)',
    phone: '+91 98123 45678',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'OPEN',
    assignedDate: '2026-08-01',
    description: 'Main vertical pipeline valve seems choked. Needs pressure check on 3rd floor riser.',
  },
  {
    id: 'CMP-2029',
    title: 'Clubhouse light fixture broken',
    resident: 'Sneha Kulkarni (Flat B-403)',
    phone: '+91 98555 12345',
    category: 'General',
    priority: 'NORMAL',
    status: 'RESOLVED',
    assignedDate: '2026-07-29',
    description: 'Replaced ceiling LED tube in badminton court.',
  },
];

export default function StaffAssignedComplaints() {
  const [complaints, setComplaints] = useState(INITIAL_ASSIGNED_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const filtered = complaints.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.resident.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setToastMessage(`Job status for ${id} set to ${newStatus.replace('_', ' ')}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Assigned Complaints Directory
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Work orders and maintenance tasks assigned to your account.
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
            placeholder="Search by job ID, title or resident..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open Jobs</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Complaint ID & Title</th>
                <th className="px-6 py-3.5">Resident Details</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-600 block">{c.id}</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{c.title}</span>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">{c.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 block">{c.resident}</span>
                    <span className="text-xs text-slate-400">{c.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    ) : c.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Wrench className="w-3 h-3" /> In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Open
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.status === 'OPEN' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Start Job
                        </button>
                      )}
                      {c.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {c.status === 'RESOLVED' && (
                        <span className="text-xs text-slate-400 font-medium">Job Complete</span>
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
