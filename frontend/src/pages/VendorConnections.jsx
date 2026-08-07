import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Loader2,
  AlertCircle,
  Unplug,
  Building2,
} from 'lucide-react';
import {
  getSocietyConnections,
  removeConnection,
} from '../lib/vendorConnectionApi.js';
import { formatDate } from '../lib/format.js';
import ConnectionStatusBadge from '../components/vendor/ConnectionStatusBadge.jsx';

export default function VendorConnections() {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const fetchConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getSocietyConnections();
      setConnections(data.data?.connections || []);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load connections',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleRemove = async (connection) => {
    if (
      !window.confirm(
        `Remove the connection with ${connection.vendor.companyName}? Existing active assignments will not be affected.`,
      )
    ) {
      return;
    }

    try {
      setRemovingId(connection.id);
      setActionError('');
      const data = await removeConnection(connection.id);
      if (data.data?.hasActiveAssignments) {
        window.alert(data.message);
      }
      await fetchConnections();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || 'Failed to remove connection',
      );
    } finally {
      setRemovingId(null);
    }
  };

  const pendingCount = connections.filter(
    (c) => c.status === 'PENDING',
  ).length;
  const acceptedCount = connections.filter(
    (c) => c.status === 'ACCEPTED',
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Connections
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage which service partners are connected to your society.
          </p>
        </div>
      </div>

      {(fetchError || actionError) && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError || actionError}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-slate-700">
            {acceptedCount} Connected
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-sm font-semibold text-slate-700">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading connections…
          </div>
        ) : connections.length === 0 ? (
          <div className="p-12 text-center">
            <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No vendor connections yet. Go to{' '}
              <span className="font-semibold text-slate-700">Vendors</span>{' '}
              and send a connection request to a service partner.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Requested On</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {connections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {c.vendor.companyName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {c.vendor.contactPerson} • {c.vendor.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {c.vendor.category}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {[c.vendor.city, c.vendor.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {formatDate(c.requestedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <ConnectionStatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {c.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleRemove(c)}
                          disabled={removingId === c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Unplug className="w-3.5 h-3.5" />
                          {removingId === c.id ? 'Removing…' : 'Remove'}
                        </button>
                      )}
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
