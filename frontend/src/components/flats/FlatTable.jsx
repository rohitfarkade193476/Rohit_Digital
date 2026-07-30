import React, { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Building2, Search } from 'lucide-react';

export default function FlatTable({ flats = [], isLoading = false, searchTerm = '',currentPage,
  totalPages,
  totalRecords,
  onPageChange, onView, onEdit, onDelete }) {

    const [rowsPerPage, setRowsPerPage] = useState(10);
   
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Occupied
          </span>
        );
      case 'VACANT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Vacant
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status || '—'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 lg:px-6">Flat Number</th>
              <th className="py-3.5 px-4 lg:px-6">Wing</th>
              <th className="py-3.5 px-4 lg:px-6">Floor</th>
              <th className="py-3.5 px-4 lg:px-6">Type</th>
              <th className="py-3.5 px-4 lg:px-6">Status</th>
              <th className="py-3.5 px-4 lg:px-6">Owner</th>
              <th className="py-3.5 px-4 lg:px-6">Resident</th>
              <th className="py-3.5 px-4 lg:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">

            {/* ── Loading State ── */}
            {isLoading && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium">Loading flats…</p>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Empty: No flats in society ── */}
            {!isLoading && flats.length === 0 && !searchTerm && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No Flats Found</p>
                    <p className="text-xs text-slate-400">
                      Add your first flat using the &ldquo;Add Flat&rdquo; button above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Empty: Search returned no results ── */}
            {!isLoading && flats.length === 0 && searchTerm && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No matching flats found.</p>
                    <p className="text-xs text-slate-400">
                      Try a different flat number or wing name.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Data Rows ── */}
            {!isLoading && flats.map((flat) => (
              <tr key={flat.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 lg:px-6 font-bold text-slate-900">
                  {flat.flatNumber}
                </td>
                <td className="py-3.5 px-4 lg:px-6">{flat.wing || '—'}</td>
                <td className="py-3.5 px-4 lg:px-6">{flat.floor || '—'}</td>
                <td className="py-3.5 px-4 lg:px-6 font-medium">{flat.type || '—'}</td>
                <td className="py-3.5 px-4 lg:px-6">{getStatusBadge(flat.status)}</td>
                <td className="py-3.5 px-4 lg:px-6 font-medium text-slate-500 italic">
                  Not Assigned
                </td>
                <td className="py-3.5 px-4 lg:px-6 text-slate-500 italic">
                  Not Assigned
                </td>
                <td className="py-3.5 px-4 lg:px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView && onView(flat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(flat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Edit Flat"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(flat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Flat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="hidden sm:inline text-slate-400 ml-2">
            Showing {flats.length} of {totalRecords} flats
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            // onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'border border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            // onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
