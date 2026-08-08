import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  AlertCircle,
  Shield,
  UserCheck,
  ArrowRight,
  Loader2,
  TrendingUp,
  Wrench,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSuperAdminStats, getSocieties } from '../../lib/superAdminApi.js';
import { formatDate } from '../../lib/format.js';

function SocietyStatusBadge({ status }) {
  const configs = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        configs[status] || configs.INACTIVE
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm ${
        onClick ? 'hover:shadow-md transition-all cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone.bg} ${tone.text}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {sub && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sub.badge}`}>
            {sub.label}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      {sub && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>{sub.footer}</span>
          {onClick && (
            <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentSocieties, setRecentSocieties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const [statsRes, societiesRes] = await Promise.all([
        getSuperAdminStats(),
        getSocieties({ page: 1, limit: 5 }),
      ]);

      setStats(statsRes.data);
      setRecentSocieties(societiesRes.data?.societies || []);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load dashboard',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex items-center justify-center text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading platform overview…
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-600">{fetchError}</p>
      </div>
    );
  }

  const societies = stats?.societies || {};
  const users = stats?.users || {};
  const complaints = stats?.complaints || {};
  const priority = stats?.priorityBreakdown || {};

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Welcome Back, {user?.firstName || 'Admin'} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Overview of societies, users and complaints across the platform.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/super-admin/societies')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Manage Societies</span>
            </button>
            <button
              onClick={() => navigate('/super-admin/reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Building2}
          label="Registered Societies"
          value={societies.total ?? 0}
          onClick={() => navigate('/super-admin/societies')}
          tone={{ bg: 'bg-indigo-50 border border-indigo-100', text: 'text-indigo-600' }}
          sub={{
            label: `${societies.active ?? 0} Active`,
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            footer: `${societies.inactive ?? 0} inactive · ${societies.suspended ?? 0} suspended`,
          }}
        />
        <StatCard
          icon={Users}
          label="Registered Users"
          value={users.total ?? 0}
          onClick={() => navigate('/super-admin/users')}
          tone={{ bg: 'bg-sky-50 border border-sky-100', text: 'text-sky-600' }}
          sub={{
            label: `${users.residents ?? 0} Residents`,
            badge: 'bg-sky-50 text-sky-700 border-sky-100',
            footer: `${users.staff ?? 0} staff · ${users.vendors ?? 0} vendors`,
          }}
        />
        <StatCard
          icon={AlertCircle}
          label="Active Complaints"
          value={complaints.open ?? 0}
          onClick={() => navigate('/super-admin/reports')}
          tone={{ bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-600' }}
          sub={{
            label: `${complaints.resolved ?? 0} Resolved`,
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            footer: `${complaints.total ?? 0} complaints overall`,
          }}
        />
        <StatCard
          icon={UserCheck}
          label="Emergency Priority"
          value={priority.EMERGENCY ?? 0}
          onClick={() => navigate('/super-admin/reports')}
          tone={{ bg: 'bg-red-50 border border-red-100', text: 'text-red-600' }}
          sub={{
            label: `${priority.HIGH ?? 0} High`,
            badge: 'bg-red-50 text-red-700 border-red-100',
            footer: `${priority.MEDIUM ?? 0} medium · ${priority.LOW ?? 0} low`,
          }}
        />
      </div>

      {/* Staff & Vendor Quick Access Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => navigate('/super-admin/users')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">User Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {users.societyAdmins ?? 0} society admins and {users.superAdmins ?? 0} super admins
                across the platform.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/super-admin/reports')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">System Reports</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Global complaint analytics, resolution rates and monthly trends.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Recent Societies */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Societies</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Newly registered societies on the platform
            </p>
          </div>
          <button
            onClick={() => navigate('/super-admin/societies')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSocieties.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No societies registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Society</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Members</th>
                  <th className="px-5 py-3">Complaints</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentSocieties.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="font-mono text-indigo-600 text-[11px]">{s.societyCode}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {[s.city, s.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {s._count?.users ?? 0} users · {s._count?.residents ?? 0} residents
                    </td>
                    <td className="px-5 py-3.5">{s._count?.complaints ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <SocietyStatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
