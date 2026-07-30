import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Mail, Download } from 'lucide-react';

import StaffStats from '../components/staff/StaffStats.jsx';
import StaffFilters from '../components/staff/StaffFilters.jsx';
import StaffTable from '../components/staff/StaffTable.jsx';
import StaffFormModal from '../components/staff/StaffFormModal.jsx';
import DeleteConfirmationModal from '../components/staff/DeleteConfirmationModal.jsx';

// Initial Sample Data (8 realistic staff members)
const INITIAL_STAFF = [
  {
    id: 'staff-1',
    name: 'Ramesh Kumar',
    role: 'Security',
    department: 'Security',
    phone: '+91 98123 45678',
    email: 'ramesh.k@society.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    joiningDate: '2021-04-10',
  },
  {
    id: 'staff-2',
    name: 'Sunita Sharma',
    role: 'Manager',
    department: 'Management',
    phone: '+91 98234 56789',
    email: 'sunita.s@society.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    joiningDate: '2020-01-15',
  },
  {
    id: 'staff-3',
    name: 'Mohan Lal',
    role: 'Electrician',
    department: 'Maintenance',
    phone: '+91 98345 67890',
    email: 'mohan.electrician@society.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    joiningDate: '2022-03-01',
  },
  {
    id: 'staff-4',
    name: 'Vijay Singh',
    role: 'Plumber',
    department: 'Maintenance',
    phone: '+91 98456 78901',
    email: 'vijay.plumber@society.com',
    status: 'INVITED',
    invitationStatus: 'Pending',
    joiningDate: '2023-08-01',
  },
  {
    id: 'staff-5',
    name: 'Geeta Devi',
    role: 'Cleaner',
    department: 'Housekeeping',
    phone: '+91 98567 89012',
    email: 'geeta.cleaner@society.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    joiningDate: '2021-09-20',
  },
  {
    id: 'staff-6',
    name: 'Anil Deshmukh',
    role: 'Security',
    department: 'Security',
    phone: '+91 98678 90123',
    email: 'anil.security@society.com',
    status: 'INACTIVE',
    invitationStatus: 'Expired',
    joiningDate: '2019-11-12',
  },
  {
    id: 'staff-7',
    name: 'Suresh Patel',
    role: 'Electrician',
    department: 'Maintenance',
    phone: '+91 98789 01234',
    email: 'suresh.electrician@society.com',
    status: 'INVITED',
    invitationStatus: 'Pending',
    joiningDate: '2023-11-05',
  },
  {
    id: 'staff-8',
    name: 'Kavita Rani',
    role: 'Cleaner',
    department: 'Housekeeping',
    phone: '+91 98890 12345',
    email: 'kavita.cleaner@society.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    joiningDate: '2022-06-18',
  },
];

export default function StaffManagement() {
  // ── Main State ──────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        s.status.toLowerCase() === selectedStatus.toLowerCase();
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
    setFormModalOpen(true);
  };

  const handleOpenViewModal = (staff) => {
    setFormMode('view');
    setSelectedStaff(staff);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setFormMode('edit');
    setSelectedStaff(staff);
    setFormModalOpen(true);
  };

  const handleOpenDeleteModal = (staff) => {
    setSelectedStaff(staff);
    setDeleteModalOpen(true);
  };

  // ── CRUD Operations ─────────────────────────────────────────────────────
  const handleFormSubmit = (formData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (formMode === 'add') {
        const newStaff = {
          ...formData,
          id: `staff-${Date.now()}`,
          invitationStatus: formData.status === 'INVITED' ? 'Pending' : 'Accepted',
        };
        setStaffList((prev) => [newStaff, ...prev]);
        setSuccessMessage(`Staff member "${formData.name}" added successfully.`);
      } else if (formMode === 'edit' && selectedStaff) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === selectedStaff.id ? { ...s, ...formData } : s))
        );
        setSuccessMessage(`Staff member "${formData.name}" updated successfully.`);
      }
      setIsSubmitting(false);
      setFormModalOpen(false);
      setSelectedStaff(null);
    }, 400);
  };

  const handleConfirmDelete = () => {
    if (!selectedStaff) return;
    setIsDeleting(true);
    setTimeout(() => {
      setStaffList((prev) => prev.filter((s) => s.id !== selectedStaff.id));
      setSuccessMessage(`Staff member "${selectedStaff.name}" deleted successfully.`);
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedStaff(null);
    }, 400);
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
