import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function ComplaintFilters({
  searchTerm = '',
  onSearchChange,
  selectedPriority = 'ALL',
  setSelectedPriority,
  selectedStatus = 'ALL',
  setSelectedStatus,
  selectedCategory = 'ALL',
  setSelectedCategory,
  selectedStaff = 'ALL',
  setSelectedStaff,
  selectedVendor = 'ALL',
  setSelectedVendor,
  onReset,
  staffOptions = [],
  vendorOptions = [],
}) {
  const isFiltered =
    searchTerm ||
    selectedPriority !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedStaff !== 'ALL' ||
    selectedVendor !== 'ALL';

  return (
    <div className="bg-white rounded-xl p-4 lg:p-5 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by Complaint ID, Resident, or Flat Number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority && setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus && setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory && setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Elevator">Elevator</option>
            <option value="Security">Security</option>
            <option value="Carpentry">Carpentry</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Assigned Staff Filter */}
        <div>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff && setSelectedStaff(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Staff</option>
            <option value="UNASSIGNED">Unassigned</option>
            {staffOptions.map((st) => (
              <option key={st.id || st.name} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Vendor Filter */}
        <div>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor && setSelectedVendor(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Vendors</option>
            <option value="UNASSIGNED">Unassigned</option>
            {vendorOptions.map((v) => (
              <option key={v.id || v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => onReset && onReset()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
