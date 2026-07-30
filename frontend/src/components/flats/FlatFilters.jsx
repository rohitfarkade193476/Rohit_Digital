import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

/**
 * FlatFilters — search bar (live, frontend-only).
 *
 * Props:
 *   searchTerm     {string}   — controlled value from parent
 *   onSearchChange {Function} — called on every keystroke with new string value
 *   onReset        {Function} — clears the search term
 *
 * Dropdown filters (Wing, Status, Type) are preserved in the UI
 * and will be wired to the backend in a future iteration.
 */
export default function FlatFilters({ searchTerm = '', onSearchChange, onReset, selectedWing,
  setSelectedWing,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType, }) {
  return (
    <div className="bg-white rounded-xl p-4 lg:p-5 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Live Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by Flat Number or Wing"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          >
            <option value="ALL">All Wings</option>
            <option value="A">Wing A</option>
            <option value="B">Wing B</option>
            <option value="C">Wing C</option>
            <option value="D">Wing D</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="VACANT">Vacant</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>


        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="ONE_BHK">1 BHK</option>
            <option value="TWO_BHK">2 BHK</option>
            <option value="THREE_BHK">3 BHK</option>
            <option value="FOUR_BHK">4 BHK</option>
            <option value="PENTHOUSE">Penthouse</option>
          </select>
        </div>

        {/* Reset button — only visible when search is active */}
        {searchTerm && (
          <button
            type="button"
            onClick={() => onReset && onReset()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors shrink-0"
            title="Clear Search"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
