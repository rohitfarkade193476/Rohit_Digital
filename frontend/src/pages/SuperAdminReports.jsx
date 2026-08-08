import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart,
  Loader2,
  AlertCircle,
  Search,
  TrendingUp,
  CheckCircle2,
  ClipboardList,
  Building2,
} from 'lucide-react';
import {
  getReportsOverview,
} from '../lib/superAdminApi.js';
import {
  COMPLAINT_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../lib/format.js';

const PRIORITY_COLORS = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-amber-400',
  HIGH: 'bg-orange-500',
  EMERGENCY: 'bg-red-500',
};

const STATUS_COLORS = {
  OPEN: 'bg-amber-400',
  ASSIGNED: 'bg-orange-400',
  ACCEPTED: 'bg-sky-400',
  IN_PROGRESS: 'bg-blue-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-emerald-400',
  REOPENED: 'bg-violet-400',
};

function SummaryCard({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone.bg} ${tone.text}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function BreakdownCard({ title, icon: Icon, data, labels, colors }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
        <Icon className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No data</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, count]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">
                  {labels?.[key] || key}
                </span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors?.[key] || 'bg-indigo-500'}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminReports() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchReport = useCallback(async (fromValue, toValue) => {
    try {
      setIsLoading(true);
      setFetchError('');

      const data = await getReportsOverview({
        from: fromValue || undefined,
        to: toValue || undefined,
      });

      setReport(data.data);
    } catch (err) {
      setReport(null);
      setFetchError(
        err?.response?.data?.message || 'Failed to load reports',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleApply = () => {
    if (from && to && from > to) {
      setFetchError('"From" date cannot be after "To" date.');
      return;
    }
    fetchReport(from, to);
  };

  const handleReset = () => {
    setFrom('');
    setTo('');
    fetchReport();
  };

  const totals = report?.totals || {};
  const monthlyTrend = report?.monthlyTrend || [];
  const maxMonthCount = Math.max(1, ...monthlyTrend.map((m) => m.total));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Global complaint analytics across all societies.
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-end sm:items-center gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Apply Range
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading reports…
        </div>
      ) : (
        !report || (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <SummaryCard
                icon={ClipboardList}
                label="Total Complaints"
                value={totals.complaints ?? 0}
                tone={{ bg: 'bg-indigo-50 border border-indigo-100', text: 'text-indigo-600' }}
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Resolved / Closed"
                value={totals.resolved ?? 0}
                tone={{ bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-600' }}
              />
              <SummaryCard
                icon={AlertCircle}
                label="Open Complaints"
                value={totals.open ?? 0}
                tone={{ bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-600' }}
              />
              <SummaryCard
                icon={TrendingUp}
                label="Resolution Rate"
                value={`${report.resolutionRate ?? 0}%`}
                tone={{ bg: 'bg-sky-50 border border-sky-100', text: 'text-sky-600' }}
                sub={
                  report.period?.from || report.period?.to
                    ? `${report.period.from || 'start'} → ${report.period.to || 'now'}`
                    : 'All time'
                }
              />
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <BreakdownCard
                title="By Status"
                icon={ClipboardList}
                data={report.byStatus}
                labels={COMPLAINT_STATUS_LABELS}
                colors={STATUS_COLORS}
              />
              <BreakdownCard
                title="By Priority"
                icon={AlertCircle}
                data={report.byPriority}
                labels={PRIORITY_LABELS}
                colors={PRIORITY_COLORS}
              />
              <BreakdownCard
                title="By Category"
                icon={FileBarChart}
                data={report.byCategory}
              />
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Complaints per Month
                </h3>
              </div>

              {monthlyTrend.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  No complaints in this period.
                </p>
              ) : (
                <div className="flex items-end gap-2 sm:gap-4 h-48 overflow-x-auto pb-1">
                  {monthlyTrend.map((m) => (
                    <div
                      key={m.month}
                      className="flex flex-col items-center justify-end h-full min-w-[48px]"
                    >
                      <span className="text-xs font-semibold text-slate-700 mb-1">
                        {m.total}
                      </span>
                      <div
                        className="w-8 sm:w-12 rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
                        style={{
                          height: `${Math.max(6, (m.total / maxMonthCount) * 100)}%`,
                        }}
                        title={`${m.month}: ${m.total} complaints`}
                      />
                      <span className="text-[11px] text-slate-500 mt-2 font-medium">
                        {m.month}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-Society Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Complaints by Society
                  </h3>
                </div>
              </div>

              {report.societyBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  No society data in this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                        <th className="py-3 px-6">Society</th>
                        <th className="py-3 px-6">Code</th>
                        <th className="py-3 px-6 text-right">Complaints</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {report.societyBreakdown.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-slate-900">
                            {s.name}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-xs text-indigo-600 font-semibold">
                            {s.societyCode}
                          </td>
                          <td className="py-3.5 px-6 text-right font-semibold">
                            {s.complaints}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
