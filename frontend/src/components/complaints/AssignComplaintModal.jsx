import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  Wrench,
  Shield,
  Loader2,
} from 'lucide-react';

export default function AssignComplaintModal({
  isOpen,
  onClose,
  complaint,
  staffList = [],
  vendorList = [],
  isLoadingStaff = false,
  isLoadingVendors = false,
  onAssign,
  isSubmitting = false,
  error = '',
}) {
  const [assigneeType, setAssigneeType] = useState('STAFF'); // 'STAFF' | 'VENDOR'
  const [selectedId, setSelectedId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state on modal open
  useEffect(() => {
    if (!isOpen) return;
    setAssigneeType('STAFF');
    setSearchTerm('');
    if (staffList && staffList.length > 0) {
      setSelectedId(staffList[0].id);
    } else if (vendorList && vendorList.length > 0) {
      setAssigneeType('VENDOR');
      setSelectedId(vendorList[0].id);
    } else {
      setSelectedId('');
    }
  }, [isOpen, staffList, vendorList]);

  // Update selectedId when type changes
  const handleTypeChange = (type) => {
    setAssigneeType(type);
    setSearchTerm('');
    if (type === 'STAFF') {
      setSelectedId(staffList.length > 0 ? staffList[0].id : '');
    } else {
      setSelectedId(vendorList.length > 0 ? vendorList[0].id : '');
    }
  };

  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staffList;
    const term = searchTerm.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.role || '').toLowerCase().includes(term) ||
        (s.department || '').toLowerCase().includes(term)
    );
  }, [staffList, searchTerm]);

  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendorList;
    const term = searchTerm.toLowerCase();
    return vendorList.filter(
      (v) =>
        (v.companyName || v.name || '').toLowerCase().includes(term) ||
        (v.category || '').toLowerCase().includes(term)
    );
  }, [vendorList, searchTerm]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId || isSubmitting) return;

    let selectedItem = null;
    if (assigneeType === 'STAFF') {
      selectedItem = staffList.find((s) => s.id === selectedId);
    } else {
      selectedItem = vendorList.find((v) => v.id === selectedId);
    }

    if (onAssign) {
      onAssign(complaint.id, {
        type: assigneeType,
        id: selectedId,
        name: selectedItem?.companyName || selectedItem?.name || 'Assigned Person',
        categoryOrRole: selectedItem?.category || selectedItem?.role || assigneeType,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Assign Complaint</h2>
              <p className="text-xs text-slate-500 font-mono">
                ID: {complaint.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Complaint Title Card */}
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                Target Complaint
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-1">
                {complaint.title}
              </p>
              <span className="text-xs text-slate-500 mt-1 inline-block">
                Category: <strong>{complaint.category}</strong>
              </span>
            </div>

            {/* Assignee Type Selector (Staff vs Vendor) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Assign To *
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleTypeChange('STAFF')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assigneeType === 'STAFF'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>In-House Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('VENDOR')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assigneeType === 'VENDOR'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>External Vendor</span>
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  assigneeType === 'STAFF' ? 'Search staff by name or role...' : 'Search vendor by company or category...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* List Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {assigneeType === 'STAFF' ? 'Select Staff Member *' : 'Select Vendor Partner *'}
              </label>

              {assigneeType === 'STAFF' ? (
                isLoadingStaff ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading staff...
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No matching staff members found.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredStaff.map((staff) => (
                      <label
                        key={staff.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedId === staff.id
                            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="assignee"
                            value={staff.id}
                            checked={selectedId === staff.id}
                            onChange={() => setSelectedId(staff.id)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{staff.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {staff.role} • {staff.department}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {staff.phone}
                        </span>
                      </label>
                    ))}
                  </div>
                )
              ) : isLoadingVendors ? (
                <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading vendors...
                </div>
              ) : filteredVendors.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No matching vendors found.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filteredVendors.map((vendor) => (
                    <label
                      key={vendor.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedId === vendor.id
                          ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="assignee"
                          value={vendor.id}
                          checked={selectedId === vendor.id}
                          onChange={() => setSelectedId(vendor.id)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {vendor.companyName || vendor.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{vendor.category}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                        {vendor.category || 'Vendor'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedId || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Assigning…' : 'Assign Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
