import React from 'react';
import { Eye, Edit2, UserX, Phone, Mail, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function VendorTable({
  vendorList = [],
  searchTerm,
  currentPage,
  onPageChange,
  onView,
  onEdit,
  onDeactivate,
}) {
  const pageSize = 6;
  const totalPages = Math.ceil(vendorList.length / pageSize) || 1;
  const paginatedVendors = vendorList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
              <th className="px-6 py-3.5">Invitation</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedVendors.length > 0 ? (
              paginatedVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{vendor.name}</div>
                    <div className="text-xs text-slate-400">ID: {vendor.id}</div>
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
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.email}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={vendor.status} />
                  </td>

                  {/* Invitation */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">
                      {vendor.invitationStatus || 'Accepted'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(vendor)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View vendor details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(vendor)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit vendor details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeactivate(vendor)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate / Manage vendor status"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  {searchTerm ? 'No vendors matching your search filter.' : 'No vendors found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {vendorList.length > 0 && (
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, vendorList.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{vendorList.length}</span> vendors
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
              disabled={currentPage === totalPages}
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
