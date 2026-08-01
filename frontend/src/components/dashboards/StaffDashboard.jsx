import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const MOCK_STAFF_JOBS = [
  {
    id: 'CMP-2038',
    title: 'Main gate intercom connection lost',
    resident: 'Priya Patel (Flat B-104)',
    category: 'Electrical',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedDate: 'Yesterday, 4:15 PM',
  },
  {
    id: 'CMP-2041',
    title: 'Water pressure low in Wing A riser',
    resident: 'Rahul Sharma (Flat A-302)',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'OPEN',
    assignedDate: 'Today, 10:30 AM',
  },
  {
    id: 'CMP-2029',
    title: 'Clubhouse light fixture broken',
    resident: 'Sneha Kulkarni (Flat B-403)',
    category: 'General',
    priority: 'NORMAL',
    status: 'RESOLVED',
    assignedDate: '3 days ago',
  },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState(MOCK_STAFF_JOBS);
  const [toastMessage, setToastMessage] = useState('');

  const openCount = jobs.filter((j) => j.status === 'OPEN').length;
  const inProgressCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
  const resolvedCount = jobs.filter((j) => j.status === 'RESOLVED').length;

  const handleUpdateStatus = (id, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
    setToastMessage(`Job ${id} status updated to ${newStatus.replace('_', ' ')}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Staff Service Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              Welcome, {user?.firstName || 'Staff Member'} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              View your assigned complaints, perform maintenance tasks, and update work status.
            </p>
          </div>
          <button
            onClick={() => navigate('/staff/assigned-complaints')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            View Assigned Complaints
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-600 uppercase">New Assigned</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{openCount}</p>
          <p className="text-xs text-slate-400 mt-1">Pending action</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-600 uppercase">In Progress</p>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
          <p className="text-xs text-slate-400 mt-1">Under resolution</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Completed Jobs</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{resolvedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Resolved jobs</p>
        </div>
      </div>

      {/* Recent Assigned Jobs List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Assigned Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Complaints assigned by Society Admin</p>
          </div>
          <button
            onClick={() => navigate('/staff/assigned-complaints')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <div key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-600">{job.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400">{job.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    {job.priority}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{job.resident}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {job.status === 'OPEN' && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Start Job
                  </button>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, 'RESOLVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
                {job.status === 'RESOLVED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
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
