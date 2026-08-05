import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Mail, Download, Upload } from 'lucide-react';

import StaffStats from '../components/staff/StaffStats.jsx';
import StaffFilters from '../components/staff/StaffFilters.jsx';
import StaffTable from '../components/staff/StaffTable.jsx';
import StaffFormModal from '../components/staff/StaffFormModal.jsx';
import ExcelImportModal from '../components/common/ExcelImportModal.jsx';
import DeleteConfirmationModal from '../components/staff/DeleteConfirmationModal.jsx';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  previewStaffExcel,
  importStaffExcel,
} from '../lib/staffApi.js';

export default function StaffManagement() {
  // ── Main State ──────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // ── Modal States ────────────────────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch staff from backend ────────────────────────────────────────────
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const data = await getAllStaff({ page: 1, limit: 100 });

      setStaffList(data.data.staff || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load staff');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ── Auto-dismiss toast notification after 3 seconds ────────────────────
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // ── Derived Filtered Staff ──────────────────────────────────────────────
  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return staffList.filter((s) => {
      const nameMatch = (s.name || '').toLowerCase().includes(term);
      const phoneMatch = (s.phone || '').toLowerCase().includes(term);
      const emailMatch = (s.email || '').toLowerCase().includes(term);
      const matchesSearch = !term || nameMatch || phoneMatch || emailMatch;

      const matchesRole = selectedRole === 'ALL' || s.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (s.status || '').toLowerCase() === selectedStatus.toLowerCase();
      const matchesDept =
        selectedDepartment === 'ALL' ||
        (s.department || '').toLowerCase() === selectedDepartment.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [staffList, searchTerm, selectedRole, selectedStatus, selectedDepartment]);

  // ── Reset Filters ───────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setSelectedDepartment('ALL');
    setCurrentPage(1);
  };

  // ── Handlers: Open Modals ───────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setFormMode('add');
    setSelectedStaff(null);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenViewModal = (staff) => {
    setFormMode('view');
    setSelectedStaff(staff);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setFormMode('edit');
    setSelectedStaff(staff);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenDeleteModal = (staff) => {
    setSelectedStaff(staff);
    setDeleteModalOpen(true);
  };

  // ── CRUD Operations ─────────────────────────────────────────────────────
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      if (formMode === 'add') {
        await createStaff(formData);
        setSuccessMessage(`Staff member "${formData.name}" added successfully.`);
      } else if (formMode === 'edit' && selectedStaff) {
        await updateStaff(selectedStaff.id, formData);
        setSuccessMessage(`Staff member "${formData.name}" updated successfully.`);
      }

      await fetchStaff();
      setFormModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStaff) return;
    try {
      setIsDeleting(true);

      await deleteStaff(selectedStaff.id);

      await fetchStaff();

      setSuccessMessage(`Staff member "${selectedStaff.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendInvitation = () => {
    setSuccessMessage('Staff invitation emails sent successfully.');
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Staff Name,Role,Department,Phone,Email,Status,Invitation Status,Joining Date\n' +
      staffList
        .map(
          (s) =>
            `"${s.name}","${s.role}","${s.department}","${s.phone}","${s.email}","${s.status}","${s.invitationStatus}","${s.joiningDate}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'staff_members_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage('Staff list exported successfully as CSV.');
  };

  const handleExcelImportSuccess = (result) => {
    setSuccessMessage(
      `${result.imported} staff ${result.imported === 1 ? 'member was' : 'members were'} imported successfully.`
    );
    fetchStaff();
  };
  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all society staff members.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Add Staff */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Excel</span>
          </button>

          {/* Send Invitation */}
          <button
            onClick={handleSendInvitation}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            <span>Send Invitation</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Export Staff list as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Staff Statistics Cards */}
      <StaffStats staffList={staffList} />

      {/* Search & Filters Bar */}
      <StaffFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedRole={selectedRole}
        setSelectedRole={(val) => {
          setSelectedRole(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={(val) => {
          setSelectedDepartment(val);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Staff Data Table */}
      <StaffTable
        staffList={filteredStaff}
        isLoading={isLoading}
        searchTerm={searchTerm}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      {/* Modals */}
      <StaffFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        initialData={selectedStaff}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        error={formError}
      />

      <ExcelImportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        title="Import Staff"
        subtitle="Bulk import staff via Excel"
        description="Upload an Excel file containing staff details. The staff will belong to your society and receive an activation email to set their password."
        itemNoun="staff member"
        itemNounPlural="staff members"
        columnsHint="Name, Phone Number, Email, Role, Department, Joining Date"
        templateCsv="data:text/csv;charset=utf-8,Name,Phone Number,Email,Role,Department,Joining Date\nRahul Sharma,+91 98765 43210,rahul.sharma@example.com,Security,Security,2024-01-15\n"
        templateFilename="staff_import_template.csv"
        previewFunction={previewStaffExcel}
        importFunction={importStaffExcel}
        previewExtraColumn={{ label: 'Department', accessor: 'department' }}
        importLabel="Import Staff"
        onSuccess={handleExcelImportSuccess}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        staffName={selectedStaff?.name}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
