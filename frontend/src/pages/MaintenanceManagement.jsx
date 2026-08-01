import React, { useState, useMemo } from 'react';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Plus, Search, Filter, Download, DollarSign } from 'lucide-react';
import Button from '../components/Button.jsx';

const MOCK_MAINTENANCE_RECORDS = [
  { id: 'MNT-2026-08-A101', flatNumber: 'A-101', wing: 'A', residentName: 'Rahul Sharma', amount: 3500, dueDate: '2026-08-10', status: 'PAID', paidDate: '2026-08-01' },
  { id: 'MNT-2026-08-A102', flatNumber: 'A-102', wing: 'A', residentName: 'Vikram Mehta', amount: 4200, dueDate: '2026-08-10', status: 'PENDING', paidDate: null },
  { id: 'MNT-2026-08-B201', flatNumber: 'B-201', wing: 'B', residentName: 'Anita Gupta', amount: 3500, dueDate: '2026-08-10', status: 'PAID', paidDate: '2026-08-03' },
  { id: 'MNT-2026-08-B202', flatNumber: 'B-202', wing: 'B', residentName: 'Sanjay Kapoor', amount: 5000, dueDate: '2026-07-10', status: 'OVERDUE', paidDate: null },
  { id: 'MNT-2026-08-C301', flatNumber: 'C-301', wing: 'C', residentName: 'Deepak Joshi', amount: 3500, dueDate: '2026-08-10', status: 'PENDING', paidDate: null },
  { id: 'MNT-2026-08-C302', flatNumber: 'C-302', wing: 'C', residentName: 'Neha Verma', amount: 4200, dueDate: '2026-08-10', status: 'PAID', paidDate: '2026-08-02' },
];

function StatusBadge({ status }) {
  if (status === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Paid
      </span>
    );
  }
  if (status === 'OVERDUE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-3 h-3" /> Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function MaintenanceManagement() {
  const [records, setRecords] = useState(MOCK_MAINTENANCE_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !term ||
        r.flatNumber.toLowerCase().includes(term) ||
        r.residentName.toLowerCase().includes(term);
      const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
      const matchWing = selectedWing === 'ALL' || r.wing === selectedWing;
      return matchSearch && matchStatus && matchWing;
    });
  }, [records, searchTerm, selectedStatus, selectedWing]);

  const stats = useMemo(() => {
    const totalAmount = records.reduce((acc, r) => acc + r.amount, 0);
    const collected = records.filter((r) => r.status === 'PAID').reduce((acc, r) => acc + r.amount, 0);
    const pending = records.filter((r) => r.status === 'PENDING').reduce((acc, r) => acc + r.amount, 0);
    const overdue = records.filter((r) => r.status === 'OVERDUE').reduce((acc, r) => acc + r.amount, 0);
    const rate = Math.round((collected / totalAmount) * 100) || 0;
    return { totalAmount, collected, pending, overdue, rate };
  }, [records]);

  const handleMarkAsPaid = (recordId) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    setToastMessage(`Payment recorded successfully for ${recordId}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Invoice ID,Flat Number,Resident,Amount,Due Date,Status,Paid Date\n' +
      records
        .map(
          (r) =>
            `"${r.id}","${r.flatNumber}","${r.residentName}","₹${r.amount}","${r.dueDate}","${r.status}","${r.paidDate || '-'}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'maintenance_billing_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('Maintenance billing records exported as CSV.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Maintenance & Dues Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track society maintenance collections, pending dues, and billing history.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={() => setToastMessage('New bill generation cycle initialized.')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Generate Monthly Bill
          </Button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Billed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Current billing cycle</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">₹{stats.collected.toLocaleString('en-IN')}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">{stats.rate}% Collection Rate</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase">Pending Dues</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">₹{stats.pending.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Payment due this week</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-semibold text-red-600 uppercase">Overdue Amount</p>
          <p className="text-2xl font-bold text-red-700 mt-1">₹{stats.overdue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-red-500 font-medium mt-0.5">Requires reminder notice</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by flat number or resident name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium"
          >
            <option value="ALL">All Wings</option>
            <option value="A">Wing A</option>
            <option value="B">Wing B</option>
            <option value="C">Wing C</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice & Flat</th>
                <th className="px-6 py-3.5">Resident</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{r.flatNumber}</div>
                    <div className="text-xs font-mono text-indigo-600">{r.id}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{r.residentName}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{r.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{r.dueDate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status !== 'PAID' ? (
                      <button
                        onClick={() => handleMarkAsPaid(r.id)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Paid on {r.paidDate}</span>
                    )}
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
