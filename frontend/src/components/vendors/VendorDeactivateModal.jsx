import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, X } from 'lucide-react';
import Button from '../Button.jsx';

export default function VendorDeactivateModal({
  isOpen,
  onClose,
  vendorName = 'this vendor',
  onConfirm,
  isProcessing = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-100 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Deactivate Vendor Access</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to deactivate <span className="font-bold text-slate-800">{vendorName}</span>?
          </p>
        </div>

        {/* Important System Notice */}
        <div className="p-6 space-y-4 bg-slate-50/50">
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Data Protection & Audit Preservation</span>
            </div>
            <p className="leading-relaxed">
              Deactivating will immediately revoke portal sign-in and prevent new work order assignments for this vendor.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Historical Records Preserved:</strong> All past work orders, maintenance logs, invoices, and service metrics associated with this vendor remain permanently intact for society auditing.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Reactivable:</strong> You can reactivate access at any time from the vendor settings.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Deactivating...' : 'Confirm Deactivation'}
          </button>
        </div>
      </div>
    </div>
  );
}
