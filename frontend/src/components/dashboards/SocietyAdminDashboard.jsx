import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  UserCheck,
  UserCog,
  Briefcase,
  AlertCircle,
  Wrench,
  Bell,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Status Badge Component ────────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    OPEN: { label: 'Open', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    RESOLVED: { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };
  const cfg = configs[status] || configs.OPEN;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

export default function SocietyAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock aggregated metric data (designed to easily wire to backend APIs)
  const stats = {
    totalFlats: 120,
    occupiedFlats: 98,
    vacantFlats: 22,
    totalResidents: 154,
    owners: 110,
    tenants: 44,
    activeStaff: 14,
    activeVendors: 8,
    totalComplaints: 28,
    openComplaints: 6,
    inProgressComplaints: 9,
    pendingMaintenance: '₹1,45,000',
    maintenanceCollectionRate: '88%',
    activeNotices: 4,
  };

  const recentComplaints = [
    {
      id: 'CMP-2041',
      title: 'Water pressure low in Wing A',
      resident: 'Rahul Sharma (A-302)',
      category: 'Plumbing',
      status: 'OPEN',
      date: 'Today, 10:30 AM',
    },
    {
      id: 'CMP-2038',
      title: 'Main gate intercom connection lost',
      resident: 'Priya Patel (B-104)',
      category: 'Electrical',
      status: 'IN_PROGRESS',
      date: 'Yesterday, 4:15 PM',
    },
    {
      id: 'CMP-2035',
      title: 'Elevator noise in Block C',
      resident: 'Amit Verma (C-501)',
      category: 'Maintenance',
      status: 'IN_PROGRESS',
      date: 'Yesterday, 11:00 AM',
    },
    {
      id: 'CMP-2029',
      title: 'Clubhouse light fixture broken',
      resident: 'Sneha Kulkarni (B-403)',
      category: 'General',
      status: 'RESOLVED',
      date: '3 days ago',
    },
  ];

  const recentNotices = [
    {
      id: 'NOT-102',
      title: 'Annual Society General Body Meeting (AGM)',
      date: 'Aug 15, 2026',
      priority: 'HIGH',
    },
    {
      id: 'NOT-101',
      title: 'Water Tank Cleaning & Maintenance Notice',
      date: 'Aug 05, 2026',
      priority: 'MEDIUM',
    },
    {
      id: 'NOT-099',
      title: 'Independence Day Flag Hoisting Ceremony',
      date: 'Aug 12, 2026',
      priority: 'NORMAL',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building className="w-4 h-4" />
              <span>Society Administration Portal</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Welcome Back, {user?.firstName || 'Admin'} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Overview of your society operations, resident records, complaints, staff & maintenance metrics.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/society-admin/residents')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resident</span>
            </button>
            <button
              onClick={() => navigate('/society-admin/notices')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Create Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Flats */}
        <div
          onClick={() => navigate('/society-admin/flats')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {stats.occupiedFlats} Occupied
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Total Flats</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalFlats}</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Vacant: {stats.vacantFlats}</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Residents */}
        <div
          onClick={() => navigate('/society-admin/residents')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {stats.owners} Owners
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Registered Residents</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalResidents}</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Tenants: {stats.tenants}</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Directory <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Complaints Overview */}
        <div
          onClick={() => navigate('/society-admin/complaints')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {stats.openComplaints} Open
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Active Complaints</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalComplaints}</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>In Progress: {stats.inProgressComplaints}</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Review <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Maintenance Dues */}
        <div
          onClick={() => navigate('/society-admin/maintenance')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {stats.maintenanceCollectionRate} Paid
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Pending Maintenance</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.pendingMaintenance}</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Due this month</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Records <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Staff & Vendor Quick Access Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => navigate('/society-admin/staff')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Staff Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats.activeStaff} active staff members across security, cleaning & maintenance.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/society-admin/vendors')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Vendor Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats.activeVendors} contracted service vendors and maintenance suppliers.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Grid: Recent Complaints & Society Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints Table (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Complaints</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest complaint requests requiring attention</p>
            </div>
            <button
              onClick={() => navigate('/society-admin/complaints')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">ID & Title</th>
                  <th className="px-5 py-3">Resident</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <span className="font-mono text-indigo-600 font-semibold block">{c.id}</span>
                      <span className="truncate block max-w-xs">{c.title}</span>
                    </td>
                    <td className="px-5 py-3.5">{c.resident}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Society Notices Widget */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Active Notices</h3>
              </div>
              <button
                onClick={() => navigate('/society-admin/notices')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Board
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentNotices.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all cursor-pointer"
                  onClick={() => navigate('/society-admin/notices')}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{n.date}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        n.priority === 'HIGH'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : n.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {n.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-2">{n.title}</h4>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/society-admin/notices')}
            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Manage Notice Board
          </button>
        </div>
      </div>
    </div>
  );
}
