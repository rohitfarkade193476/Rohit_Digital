import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function StaffFilters({
  searchTerm = '',
  onSearchChange,
  selectedRole = 'ALL',
  setSelectedRole,
  selectedStatus = 'ALL',
  setSelectedStatus,
  selectedDepartment = 'ALL',
  setSelectedDepartment,
  onReset,
}) {
  const isFiltered =
    searchTerm || selectedRole !== 'ALL' || selectedStatus !== 'ALL' || selectedDepartment !== 'ALL';

  return (
    <div className="bg-white rounded-xl p-4 lg:p-5 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by Staff Name, Phone, or Email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole && setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Security">Security</option>
            <option value="Manager">Manager</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
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
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="INVITED">Invited</option>
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment && setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Management">Management</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Housekeeping">Housekeeping</option>
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
