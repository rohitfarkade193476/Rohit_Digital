import React, { useState, useEffect } from 'react';
import { X, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssignVendorModal({
  isOpen,
  onClose,
  complaint,
  vendorList = [],
  isLoadingVendors = false,
  onAssign,
  isSubmitting = false,
  error = '',
}) {
  const [selectedVendorId, setSelectedVendorId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (vendorList.length > 0) {
      setSelectedVendorId(vendorList[0].id || '');
    } else {
      setSelectedVendorId('');
    }
  }, [isOpen, vendorList]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAssign && selectedVendorId) {
      onAssign(complaint.id, selectedVendorId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Assign External Vendor</h2>
              <p className="text-xs text-slate-500 font-mono">
                {complaint.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600">
              Select a service partner for complaint{' '}
              <span className="font-semibold text-slate-800">
                &ldquo;{complaint.title}&rdquo;
              </span>
              . Only activated and currently available vendors are listed.
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Choose Vendor *
              </label>
              {isLoadingVendors ? (
                <p className="text-sm text-slate-400">Loading vendors…</p>
              ) : vendorList.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No available vendors right now.
                </p>
              ) : (
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  {vendorList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.companyName || v.name}
                      {v.category ? ` (${v.category})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedVendorId || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Assigning…' : 'Assign Vendor'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
