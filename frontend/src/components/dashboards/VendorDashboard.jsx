import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Wrench, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const MOCK_VENDOR_WORK = [
  {
    id: 'WRK-901',
    service: 'Elevator Monthly AMC Servicing',
    location: 'Block A & B Passenger Lifts',
    dueDate: 'Aug 05, 2026',
    status: 'IN_PROGRESS',
    contact: 'Estate Manager (+91 98234 56789)',
  },
  {
    id: 'WRK-898',
    service: 'Overhead Water Tank Chlorination',
    location: 'Terrace Water Tanks',
    dueDate: 'Aug 03, 2026',
    status: 'PENDING',
    contact: 'Maintenance Super (+91 98345 67890)',
  },
  {
    id: 'WRK-885',
    service: 'Substation Electrical Transformer Inspection',
    location: 'Main Transformer Room',
    dueDate: 'Jul 28, 2026',
    status: 'COMPLETED',
    contact: 'Admin Office',
  },
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState(MOCK_VENDOR_WORK);
  const [toastMessage, setToastMessage] = useState('');

  const pendingCount = workOrders.filter((w) => w.status === 'PENDING').length;
  const inProgressCount = workOrders.filter((w) => w.status === 'IN_PROGRESS').length;
  const completedCount = workOrders.filter((w) => w.status === 'COMPLETED').length;

  const handleUpdateWork = (id, newStatus) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    setToastMessage(`Work order ${id} status updated to ${newStatus}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Vendor Partner Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              Welcome, {user?.firstName || 'Vendor Partner'} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Track contracted service orders, log work completions, and manage society SLAs.
            </p>
          </div>
          <button
            onClick={() => navigate('/vendor/assigned-work')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            Manage Work Orders
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-600 uppercase">Assigned Work</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Pending dispatch</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-600 uppercase">Work In Progress</p>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
          <p className="text-xs text-slate-400 mt-1">Active on-site servicing</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Completed Work</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Completed orders</p>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Contracted Work Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Society contract service assignments</p>
          </div>
          <button
            onClick={() => navigate('/vendor/assigned-work')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            All Work Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {workOrders.map((w) => (
            <div key={w.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-purple-600">{w.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Target: {w.dueDate}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{w.service}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{w.location}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {w.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateWork(w.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Start Work
                  </button>
                )}
                {w.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateWork(w.id, 'COMPLETED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Complete Work
                  </button>
                )}
                {w.status === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Work Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
