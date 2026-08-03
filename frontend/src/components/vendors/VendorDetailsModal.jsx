import React from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatDate } from '../../lib/format.js';

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-slate-800 font-medium break-words">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function VendorDetailsModal({ isOpen, onClose, vendor }) {
  if (!isOpen || !vendor) return null;

  const address = [vendor.address, vendor.city, vendor.state, vendor.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Vendor Details
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {vendor.id.slice(0, 8)}
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Header block */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">
                {vendor.companyName || vendor.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {vendor.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : vendor.status === 'INVITED' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3" /> Invited
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <XCircle className="w-3 h-3" /> Inactive
                  </span>
                )}
                {vendor.isAvailable ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <CheckCircle2 className="w-3 h-3" /> Available for Work
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    <XCircle className="w-3 h-3" /> Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row icon={Tag} label="Service Category" value={vendor.category} />
            <Row icon={FileText} label="Contract Type" value={vendor.contractType} />
            <Row icon={User} label="Contact Person" value={vendor.contactPerson} />
            <Row icon={User} label="Registered On" value={formatDate(vendor.createdAt)} />
            <Row icon={Phone} label="Phone" value={vendor.phone} />
            <Row icon={Mail} label="Email" value={vendor.email} />
          </div>

          <Row icon={MapPin} label="Address" value={address} />

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              About the Service
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {vendor.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
