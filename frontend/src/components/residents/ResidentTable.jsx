import React, { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Users, Search } from 'lucide-react';

export default function ResidentTable({
  residents = [],
  isLoading = false,
  searchTerm = '',
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusBadge = (status) => {
    const isAct = status === 'ACTIVE' || status === 'Active';
    if (isAct) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        INACTIVE
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const isOwner = type === 'Owner' || type === 'OWNER';
    if (isOwner) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          Owner
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        Tenant
      </span>
    );
  };

  // Pagination slice
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedResidents = residents.slice(startIndex, startIndex + rowsPerPage);
  const calculatedTotalPages = Math.ceil(residents.length / rowsPerPage) || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 lg:px-6">Resident Name</th>
              <th className="py-3.5 px-4 lg:px-6">Flat</th>
              <th className="py-3.5 px-4 lg:px-6">Wing</th>
              <th className="py-3.5 px-4 lg:px-6">Phone</th>
              <th className="py-3.5 px-4 lg:px-6">Email</th>
              <th className="py-3.5 px-4 lg:px-6">Resident Type</th>
              <th className="py-3.5 px-4 lg:px-6">Status</th>
              <th className="py-3.5 px-4 lg:px-6">Move-in Date</th>
              <th className="py-3.5 px-4 lg:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* Empty state: No residents */}
            {!isLoading && residents.length === 0 && !searchTerm && (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No Residents Found</p>
                    <p className="text-xs text-slate-400">
                      Add your first resident using the &ldquo;Add Resident&rdquo; button above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state: Search returned no results */}
            {!isLoading && residents.length === 0 && searchTerm && (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No matching residents found.</p>
                    <p className="text-xs text-slate-400">
                      Try searching with a different name, flat number, or phone number.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 lg:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0">
                        {resident.name ? resident.name.charAt(0).toUpperCase() : 'R'}
                      </div>
                      <span className="font-bold text-slate-900">{resident.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-semibold text-slate-800">
                    {resident.flatNumber || '—'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-medium text-slate-700">
                    {resident.wing ? `Wing ${resident.wing}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-slate-600 font-mono text-xs">
                    {resident.phone || '—'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-slate-600 text-xs">
                    {resident.email || '—'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6">
                    {getTypeBadge(resident.residentType)}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6">
                    {getStatusBadge(resident.status)}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-slate-600 text-xs">
                    {resident.moveInDate || '—'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView && onView(resident)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(resident)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Resident"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(resident)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Resident"
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
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              if (onPageChange) onPageChange(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="hidden sm:inline text-slate-400 ml-2">
            Showing {paginatedResidents.length} of {residents.length} residents
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange && onPageChange(Math.max(currentPage - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: calculatedTotalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange && onPageChange(page)}
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
            disabled={currentPage >= calculatedTotalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
