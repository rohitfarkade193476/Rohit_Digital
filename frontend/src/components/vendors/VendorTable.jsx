import React from 'react';
import {
  Eye,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import ConnectionStatusBadge from '../vendor/ConnectionStatusBadge.jsx';

function StatusBadge({ status }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  }
  if (status === 'INVITED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        Invited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle className="w-3 h-3" />
      Inactive
    </span>
  );
}

function AvailabilityBadge({ isAvailable }) {
  return isAvailable ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      Unavailable
    </span>
  );
}

export default function VendorTable({
  vendorList = [],
  searchTerm,
  currentPage,
  totalPages = 1,
  total = 0,
  onPageChange,
  onView,
  connectionStatusForVendor,
}) {
  const pageSize = vendorList.length || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
      {/* Scrollable table container */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Vendor / Company</th>
              <th className="px-6 py-3.5">Category & Service</th>
              <th className="px-6 py-3.5">Contact Details</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Availability</th>
              <th className="px-6 py-3.5">Connection</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendorList.length > 0 ? (
              vendorList.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {vendor.companyName || vendor.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {vendor.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                      {vendor.category}
                    </span>
                    {vendor.contractType && (
                      <span className="block text-xs text-slate-400 mt-1">
                        Contract: {vendor.contractType}
                      </span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-700">
                      {vendor.contactPerson}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={vendor.status} />
                  </td>

                  {/* Availability */}
                  <td className="px-6 py-4">
                    <AvailabilityBadge isAvailable={vendor.isAvailable} />
                  </td>

                  {/* Connection */}
                  <td className="px-6 py-4">
                    <ConnectionStatusBadge
                      status={
                        connectionStatusForVendor
                          ? connectionStatusForVendor(vendor.id)
                          : null
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onView(vendor)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 rounded-lg transition-colors"
                      title="View vendor details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  {searchTerm
                    ? 'No vendors matching your search filter.'
                    : 'No vendors found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{from}</span> to{' '}
            <span className="font-semibold text-slate-700">{to}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> partners
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
