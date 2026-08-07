import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';

import ComplaintStats from '../components/complaints/ComplaintStats.jsx';
import ComplaintFilters from '../components/complaints/ComplaintFilters.jsx';
import ComplaintTable from '../components/complaints/ComplaintTable.jsx';
import ComplaintDetailsDrawer from '../components/complaints/ComplaintDetailsDrawer.jsx';
import AssignComplaintModal from '../components/complaints/AssignComplaintModal.jsx';
import { getComplaints, getComplaintById } from '../lib/complaintApi.js';
import {
  assignVendorToComplaint,
  assignStaffToComplaint,
  getComplaintAssignments,
} from '../lib/assignmentApi.js';
import { getAllVendors } from '../lib/vendorApi.js';
import { getAllStaff } from '../lib/staffApi.js';
import { getSocietyConnections } from '../lib/vendorConnectionApi.js';

const PAGE_SIZE = 10;

export default function ComplaintManagement() {
  const [searchParams] = useSearchParams();
  const deepLinkComplaintId = searchParams.get('complaint');
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
  const [connectedVendorIds, setConnectedVendorIds] = useState(() => new Set());
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [staff, setStaff] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

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

  // Deep link from a notification: fetch the exact complaint (may not be on the
  // current list page) and open it in the existing drawer.
  useEffect(() => {
    if (!deepLinkComplaintId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getComplaintById(deepLinkComplaintId);
        if (!cancelled && res?.data) {
          await handleOpenDrawer(res.data);
        }
      } catch {
        // Not accessible to this admin — do not open the drawer.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deepLinkComplaintId]);

  // Load assignable vendors once (for the Assign Vendor modal). Only vendors
  // with an ACCEPTED connection to this society may be assigned work.
  const fetchVendors = useCallback(async () => {
    try {
      setIsLoadingVendors(true);
      const [vendorsData, connectionsData] = await Promise.all([
        getAllVendors({ page: 1, limit: 100 }),
        getSocietyConnections().catch(() => ({ data: { connections: [] } })),
      ]);
      setVendors(vendorsData.data?.vendors || []);
      const acceptedIds = new Set(
        (connectionsData.data?.connections || [])
          .filter((c) => c.status === 'ACCEPTED')
          .map((c) => c.vendorId),
      );
      setConnectedVendorIds(acceptedIds);
    } catch (err) {
      setVendors([]);
      setConnectedVendorIds(new Set());
    } finally {
      setIsLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const connectedVendors = useMemo(
    () => vendors.filter((v) => connectedVendorIds.has(v.id)),
    [vendors, connectedVendorIds],
  );

  const unconnectedVendorCount = vendors.length - connectedVendors.length;

  // Load assignable staff once (for the Assign Staff tab)
  const fetchStaff = useCallback(async () => {
    try {
      setIsLoadingStaff(true);
      const data = await getAllStaff({ page: 1, limit: 100 });
      setStaff(data.data?.staff || []);
    } catch (err) {
      setStaff([]);
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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

  // Refresh the list AND the complaint currently shown in the drawer, so the
  // drawer reflects the real status from the backend after an action (e.g.
  // closing a complaint) instead of going stale.
  const handleStatusUpdated = useCallback(async () => {
    await fetchComplaints();
    if (selectedComplaint?.id) {
      try {
        const fresh = await getComplaintById(selectedComplaint.id);
        if (fresh?.data) setSelectedComplaint(fresh.data);
      } catch (e) {
        // Keep the current drawer data if the refresh fails.
      }
    }
  }, [fetchComplaints, selectedComplaint]);

  const handleAssign = async (complaintId, payload) => {
    if (!payload || isAssigning) return;
    const assigneeId = typeof payload === 'string' ? payload : payload.id;
    const isStaff = payload?.type === 'STAFF';

    setAssignError('');
    setIsAssigning(true);
    try {
      if (isStaff) {
        await assignStaffToComplaint(complaintId, assigneeId);
        setAssignVendorModalOpen(false);
        setSuccessMessage(`Staff member "${payload.name}" assigned to complaint.`);
      } else {
        await assignVendorToComplaint(complaintId, assigneeId);
        setAssignVendorModalOpen(false);
        setSuccessMessage(`Vendor "${payload.name || 'assigned'}" assigned to complaint successfully.`);
      }
      await fetchComplaints();
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        const data = await getComplaintAssignments(complaintId);
        setAssignments(data.data || []);
        try {
          const fresh = await getComplaintById(complaintId);
          if (fresh?.data) setSelectedComplaint(fresh.data);
        } catch (e) {
          // Keep the current drawer data if the refresh fails.
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

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Complaint ID,Title,Resident,Flat,Category,Priority,Status,Assigned To,Created\n' +
      filteredComplaints
        .map(
          (c) =>
            `"${c.id}","${c.title}","${c.residentName}","${c.flatNumber}","${c.category}","${c.priority}","${c.status}","${
              c.assignedVendor?.companyName || c.assignedStaff?.name || 'Unassigned'
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
        onAssign={handleAssign}
        onStatusUpdated={handleStatusUpdated}
        staffList={staff}
        vendorList={connectedVendors}
        unconnectedVendorCount={unconnectedVendorCount}
        isLoadingStaff={isLoadingStaff}
        isLoadingVendors={isLoadingVendors}
      />

      <AssignComplaintModal
        isOpen={assignVendorModalOpen}
        onClose={() => setAssignVendorModalOpen(false)}
        complaint={selectedComplaint}
        staffList={staff}
        vendorList={connectedVendors}
        unconnectedVendorCount={unconnectedVendorCount}
        isLoadingStaff={isLoadingStaff}
        isLoadingVendors={isLoadingVendors}
        onAssign={handleAssign}
        isSubmitting={isAssigning}
        error={assignError}
      />
    </div>
  );
}
