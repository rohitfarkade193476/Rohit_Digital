import React, { useState } from 'react';
import { Eye, UserPlus, Edit, ChevronLeft, ChevronRight, AlertCircle, Search } from 'lucide-react';

export default function ComplaintTable({
  complaints = [],
  isLoading = false,
  searchTerm = '',
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
  onView,
  onAssign,
  onEdit,
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toUpperCase();
    switch (p) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            EMERGENCY
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            RESOLVED
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            CLOSED
          </span>
        );
    }
  };

  const getAssignedBadge = (assignedTo) => {
    if (!assignedTo || assignedTo === 'Unassigned') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 italic">
          Unassigned
        </span>
      );
    }
    const isVendor = assignedTo.type === 'Vendor' || assignedTo.isVendor;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
          isVendor
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}
      >
        {assignedTo.name || assignedTo}
      </span>
    );
  };

  // Pagination calculations
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedComplaints = complaints.slice(startIndex, startIndex + rowsPerPage);
  const calculatedTotalPages = Math.ceil(complaints.length / rowsPerPage) || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 lg:px-6">Complaint ID</th>
              <th className="py-3.5 px-4 lg:px-6">Title</th>
              <th className="py-3.5 px-4 lg:px-6">Resident</th>
              <th className="py-3.5 px-4 lg:px-6">Flat</th>
              <th className="py-3.5 px-4 lg:px-6">Category</th>
              <th className="py-3.5 px-4 lg:px-6">Priority</th>
              <th className="py-3.5 px-4 lg:px-6">Status</th>
              <th className="py-3.5 px-4 lg:px-6">Assigned To</th>
              <th className="py-3.5 px-4 lg:px-6">Created Date</th>
              <th className="py-3.5 px-4 lg:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* Empty State: No Complaints */}
            {!isLoading && complaints.length === 0 && !searchTerm && (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No Complaints Found</p>
                    <p className="text-xs text-slate-400">
                      Create your first complaint using the &ldquo;Create Complaint&rdquo; button.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty State: Search returned no results */}
            {!isLoading && complaints.length === 0 && searchTerm && (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No matching complaints found.</p>
                    <p className="text-xs text-slate-400">
                      Try searching with a different Complaint ID, resident name, or flat number.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 lg:px-6 font-mono font-bold text-indigo-600 text-xs">
                    {c.ticketId || c.id}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-semibold text-slate-900 max-w-[220px] truncate" title={c.title}>
                    {c.title}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-medium text-slate-800">
                    {c.residentName}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-semibold text-slate-700">
                    {c.flatNumber}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 lg:px-6">{getPriorityBadge(c.priority)}</td>
                  <td className="py-3.5 px-4 lg:px-6">{getStatusBadge(c.status)}</td>
                  <td className="py-3.5 px-4 lg:px-6">{getAssignedBadge(c.assignedTo)}</td>
                  <td className="py-3.5 px-4 lg:px-6 text-slate-500 text-xs">
                    {c.createdDate}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView && onView(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAssign && onAssign(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Assign Staff / Vendor"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Complaint"
                      >
                        <Edit className="w-4 h-4" />
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
            Showing {paginatedComplaints.length} of {complaints.length} complaints
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
