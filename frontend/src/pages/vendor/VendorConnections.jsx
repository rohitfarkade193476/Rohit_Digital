import React, { useState, useEffect, useCallback } from 'react';
import {
  Handshake,
  Loader2,
  AlertCircle,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  getMyPendingConnections,
  getMyConnections,
  respondToConnection,
} from '../../lib/vendorConnectionApi.js';
import { formatDate } from '../../lib/format.js';
import ConnectionStatusBadge from '../../components/vendor/ConnectionStatusBadge.jsx';

export default function VendorConnections() {
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [respondingId, setRespondingId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const [pendingData, allData] = await Promise.all([
        getMyPendingConnections(),
        getMyConnections(),
      ]);
      setPending(pendingData.data?.connections || []);
      setConnections(allData.data?.connections || []);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load connections',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRespond = async (connection, status) => {
    try {
      setRespondingId(connection.id);
      setFetchError('');
      await respondToConnection(connection.id, status);
      await fetchAll();
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to respond to request',
      );
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Connections
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Connection requests from housing societies and your existing
            partners.
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading connections…
        </div>
      ) : (
        <>
          {/* Pending requests */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Pending Requests ({pending.length})
            </h2>

            {pending.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
                <Handshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No pending connection requests. Societies can request a
                  connection with your company from the vendor directory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {c.society.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {[
                              c.society.city,
                              c.society.state,
                            ].filter(Boolean).join(', ') || 'Housing Society'}{' '}
                            • {c.society.societyCode}
                          </p>
                        </div>
                      </div>
                      <ConnectionStatusBadge status={c.status} />
                    </div>

                    <p className="text-xs text-slate-500 mt-4">
                      Requested on {formatDate(c.requestedAt)}
                      {c.requestedByUser
                        ? ` by ${c.requestedByUser.name}`
                        : ''}
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleRespond(c, 'ACCEPTED')}
                        disabled={respondingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {respondingId === c.id ? 'Accepting…' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRespond(c, 'REJECTED')}
                        disabled={respondingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        {respondingId === c.id ? 'Declining…' : 'Decline'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Existing connections */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
              My Connections ({connections.length})
            </h2>

            {connections.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  You are not connected to any society yet.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
                <div className="overflow-x-auto min-w-full">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Society</th>
                        <th className="px-6 py-3.5">Requested On</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {connections.map((c) => (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {c.society.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {c.society.societyCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            {formatDate(c.requestedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <ConnectionStatusBadge status={c.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
