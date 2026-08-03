import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { getMyAssignments } from '../../lib/assignmentApi.js';
import { formatDate } from '../../lib/format.js';
import AssignmentStatusBadge from '../../components/vendor/AssignmentStatusBadge.jsx';

const STATUS_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'ASSIGNED', label: 'New' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function VendorAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getMyAssignments();
      setAssignments(data.data || []);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load assignments'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filteredAssignments =
    activeStatus === 'ALL'
      ? assignments
      : assignments.filter((a) => a.status === activeStatus);

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] =
      tab.value === 'ALL'
        ? assignments.length
        : assignments.filter((a) => a.status === tab.value).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Assignments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Service work assigned to your business by housing societies.
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeStatus === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 rounded-full text-[10px] font-bold ${
                activeStatus === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[tab.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading assignments…
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {activeStatus === 'ALL'
                ? 'No assignments yet.'
                : 'No assignments in this status.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Complaint</th>
                  <th className="px-6 py-3.5">Society</th>
                  <th className="px-6 py-3.5">Assigned On</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/vendor/assignments/${a.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {a.complaint?.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {a.complaint?.category} • Priority{' '}
                        {(a.complaint?.priority || 'MEDIUM')
                          .toLowerCase()
                          .replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {a.society?.name || 'Housing Society'}
                      {a.society?.societyCode && (
                        <span className="block text-slate-400 font-mono">
                          {a.society.societyCode}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {formatDate(a.assignedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <AssignmentStatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
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
