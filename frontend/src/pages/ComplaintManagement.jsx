import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Download, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import ComplaintStats from '../components/complaints/ComplaintStats.jsx';
import ComplaintFilters from '../components/complaints/ComplaintFilters.jsx';
import ComplaintTable from '../components/complaints/ComplaintTable.jsx';
import ComplaintDetailsDrawer from '../components/complaints/ComplaintDetailsDrawer.jsx';
import AssignComplaintModal from '../components/complaints/AssignComplaintModal.jsx';
import { getComplaints, createComplaint } from '../lib/complaintApi.js';
import {
  assignVendorToComplaint,
  getComplaintAssignments,
} from '../lib/assignmentApi.js';
import { getAllVendors } from '../lib/vendorApi.js';
import { getResidents } from '../lib/residentApi.js';

const PAGE_SIZE = 10;

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  const [assignVendorModalOpen, setAssignVendorModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [residents, setResidents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newComplaintForm, setNewComplaintForm] = useState({
    title: '',
    residentId: '',
    category: 'Plumbing',
    priority: 'MEDIUM',
    description: '',
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getComplaints({
        page: currentPage,
        limit: PAGE_SIZE,
        status: selectedStatus === 'ALL' ? '' : selectedStatus,
        category: selectedCategory === 'ALL' ? '' : selectedCategory,
        priority: selectedPriority === 'ALL' ? '' : selectedPriority,
      });
      setComplaints(data.data?.complaints || []);
      setTotalRecords(data.data?.total || 0);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load complaints'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedPriority, selectedStatus, selectedCategory]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Load assignable vendors once (for the Assign Vendor modal)
  const fetchVendors = useCallback(async () => {
    try {
      setIsLoadingVendors(true);
      const data = await getAllVendors({ page: 1, limit: 100 });
      setVendors(data.data?.vendors || []);
    } catch (err) {
      setVendors([]);
    } finally {
      setIsLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Client-side search on the current page (backend has no search param)
  const filteredComplaints = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return complaints;
    return complaints.filter((c) => {
      const titleMatch = (c.title || '').toLowerCase().includes(term);
      const residentMatch = (c.residentName || '').toLowerCase().includes(term);
      const flatMatch = (c.flatNumber || '').toLowerCase().includes(term);
      const idMatch = (c.id || '').toLowerCase().includes(term);
      return titleMatch || residentMatch || flatMatch || idMatch;
    });
  }, [complaints, debouncedSearch]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setCurrentPage(1);
  };

  const handleOpenDrawer = async (complaint) => {
    setSelectedComplaint(complaint);
    setDrawerOpen(true);
    setAssignments([]);
    setAssignmentError('');
    setIsLoadingAssignments(true);
    try {
      const data = await getComplaintAssignments(complaint.id);
      setAssignments(data.data || []);
    } catch (err) {
      setAssignmentError(
        err?.response?.data?.message || 'Failed to load assignment history'
      );
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleOpenAssignVendor = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignError('');
    setAssignVendorModalOpen(true);
  };

  const handleAssignVendor = async (complaintId, payload) => {
    if (!payload || isAssigning) return;
    const vendorId = typeof payload === 'string' ? payload : payload.id;
    const isStaff = payload?.type === 'STAFF';

    setAssignError('');
    setIsAssigning(true);
    try {
      if (isStaff) {
        // Staff assignment flow
        setAssignVendorModalOpen(false);
        setSuccessMessage(`Staff member "${payload.name}" assigned to complaint.`);
        const complaintToUpdate = complaints.find((c) => c.id === complaintId);
        if (complaintToUpdate) {
          complaintToUpdate.status = 'ASSIGNED';
          complaintToUpdate.assignedStaff = { name: payload.name, role: payload.categoryOrRole };
        }
      } else {
        // Vendor assignment flow
        await assignVendorToComplaint(complaintId, vendorId);
        setAssignVendorModalOpen(false);
        setSuccessMessage(`Vendor "${payload.name || 'assigned'}" assigned to complaint successfully.`);
        await fetchComplaints();
        if (selectedComplaint && selectedComplaint.id === complaintId) {
          const data = await getComplaintAssignments(complaintId);
          setAssignments(data.data || []);
        }
      }
    } catch (err) {
      setAssignError(
        err?.response?.data?.message || 'Failed to assign complaint'
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (isCreating) return;
    setCreateError('');
    setIsCreating(true);
    try {
      await createComplaint({
        title: newComplaintForm.title.trim(),
        description: newComplaintForm.description.trim() || undefined,
        category: newComplaintForm.category,
        priority: newComplaintForm.priority,
        residentId: newComplaintForm.residentId,
      });
      setCreateModalOpen(false);
      setSuccessMessage('Complaint created successfully.');
      setNewComplaintForm({
        title: '',
        residentId: '',
        category: 'Plumbing',
        priority: 'MEDIUM',
        description: '',
      });
      setCurrentPage(1);
      await fetchComplaints();
    } catch (err) {
      setCreateError(
        err?.response?.data?.message || 'Failed to create complaint'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setCreateError('');
    setCreateModalOpen(true);
    try {
      const data = await getResidents(1, 100);
      setResidents(data.data?.residents || []);
    } catch {
      setResidents([]);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Complaint ID,Title,Resident,Flat,Category,Priority,Status,Assigned Vendor,Created\n' +
      filteredComplaints
        .map(
          (c) =>
            `"${c.id}","${c.title}","${c.residentName}","${c.flatNumber}","${c.category}","${c.priority}","${c.status}","${
              c.assignedVendor?.companyName || 'Unassigned'
            }","${c.createdAt}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'complaints_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage('Complaints exported successfully as CSV.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complaint Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and track all complaints.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Complaint</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Export complaints as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <ComplaintStats complaints={filteredComplaints} />

      <ComplaintFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedPriority={selectedPriority}
        setSelectedPriority={(val) => {
          setSelectedPriority(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(val) => {
          setSelectedCategory(val);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      <ComplaintTable
        complaints={filteredComplaints}
        isLoading={isLoading}
        searchTerm={debouncedSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setCurrentPage}
        onView={handleOpenDrawer}
        onAssign={handleOpenAssignVendor}
      />

      <ComplaintDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        complaint={selectedComplaint}
        assignments={assignments}
        isLoadingAssignments={isLoadingAssignments}
        assignmentError={assignmentError}
        onAssignVendorClick={handleOpenAssignVendor}
        onAssign={handleAssignVendor}
        onStatusUpdated={fetchComplaints}
      />

      <AssignComplaintModal
        isOpen={assignVendorModalOpen}
        onClose={() => setAssignVendorModalOpen(false)}
        complaint={selectedComplaint}
        vendorList={vendors}
        isLoadingVendors={isLoadingVendors}
        onAssign={handleAssignVendor}
        isSubmitting={isAssigning}
        error={assignError}
      />

      {/* Create Complaint Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Log New Complaint</h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {createError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Complaint Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Pipeline Leakage"
                    value={newComplaintForm.title}
                    onChange={(e) =>
                      setNewComplaintForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Resident *
                  </label>
                  <select
                    required
                    value={newComplaintForm.residentId}
                    onChange={(e) =>
                      setNewComplaintForm((prev) => ({ ...prev, residentId: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select a resident…</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.flatNumber ? ` — Flat ${r.flatNumber}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newComplaintForm.category}
                      onChange={(e) =>
                        setNewComplaintForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Elevator">Elevator</option>
                      <option value="Security">Security</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Priority *
                    </label>
                    <select
                      value={newComplaintForm.priority}
                      onChange={(e) =>
                        setNewComplaintForm((prev) => ({ ...prev, priority: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0) + p.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the complaint details..."
                    value={newComplaintForm.description}
                    onChange={(e) =>
                      setNewComplaintForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? 'Creating…' : 'Create Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
